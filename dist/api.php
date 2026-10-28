<?php
declare(strict_types=1);
// Secrets and the database live outside the web root. API never logs request bodies.
ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, private');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');
function reply(array $body, int $status=200): never { http_response_code($status); echo json_encode($body, JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR); exit; }
function fail(string $message, int $status=400): never { reply(['error'=>$message],$status); }
try {
    $test = getenv('OSOBNOSTI_TEST_DIR');
    $dir = $test ?: getenv('OSOBNOSTI_DATA_DIR');
    if (!$dir || !is_file($dir.'/config.php')) fail('Serverové ukládání není nakonfigurované.',503);
    $config = require $dir.'/config.php';
    $origin = $config['origin'];
    $url = parse_url($origin);
    $host = ($url['host']??'').(isset($url['port'])?':'.$url['port']:'');
    $remote = $_SERVER['REMOTE_ADDR']??'';
    $localTest = $test && in_array($remote,['127.0.0.1','::1'],true) && in_array($url['host']??'',['127.0.0.1','localhost'],true);
    $proxy = $config['proxy']??'';
    $tls = in_array(strtolower((string)($_SERVER['HTTPS']??'')),['on','1'],true);
    if (($_SERVER['HTTP_HOST']??'')!==$host || ($test && !$localTest) || (!$localTest && (($url['scheme']??'')!=='https' || ($proxy ? $remote!==$proxy : !$tls)))) fail('Použij nakonfigurovanou HTTPS adresu webu.',403);
    if (isset($_SERVER['HTTP_ORIGIN']) && $_SERVER['HTTP_ORIGIN']!==$origin) fail('Cizí původ požadavku.',403);
    if (($_SERVER['HTTP_SEC_FETCH_SITE']??'')==='cross-site') fail('Cizí původ požadavku.',403);
    $db = new PDO('sqlite:'.$dir.'/profiles.sqlite',null,null,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
    $db->exec('PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000; PRAGMA secure_delete=ON;');
    session_name('osobnosti_session');
    session_save_path($dir.'/sessions');
    ini_set('session.use_strict_mode','1'); ini_set('session.use_only_cookies','1'); ini_set('session.gc_maxlifetime','7200');
    ini_set('session.gc_probability','1'); ini_set('session.gc_divisor','100');
    session_set_cookie_params(['lifetime'=>0,'path'=>'/osobnosti_test/','secure'=>!$test,'httponly'=>true,'samesite'=>'Strict']);
    session_start();
    if (isset($_SESSION['expires']) && $_SESSION['expires']<time()) { $_SESSION=[]; session_regenerate_id(true); }
    $_SESSION['csrf']??=bin2hex(random_bytes(32));
    function query(string $sql,array $params=[]): PDOStatement {global $db; $s=$db->prepare($sql);$s->execute($params);return $s;}
    function account(): ?string { $id=$_SESSION['account']??null; return $id && query('SELECT id FROM accounts WHERE id=?',[$id])->fetchColumn() ? $id : null; }
    function requireAccount(): string {return account()??fail('Přihlas se znovu. Přihlášení platí dvě hodiny.',401);}
    function token(): string {return rtrim(strtr(base64_encode(random_bytes(32)),'+/','-_'),'=');}
    function seal(array $value): string {global $config; $nonce=random_bytes(SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);return base64_encode($nonce.sodium_crypto_secretbox(json_encode($value,JSON_THROW_ON_ERROR),$nonce,hex2bin($config['key'])));}
    function unseal(string $value): array {global $config; $v=base64_decode($value,true);$s=sodium_crypto_secretbox_open(substr($v,24),substr($v,0,24),hex2bin($config['key']));if($s===false)throw new RuntimeException('Stored data unavailable');return json_decode($s,true,512,JSON_THROW_ON_ERROR);}
    function throttle(string $kind,int $limit,int $seconds): void {global $config;
        // Ignore unverified forwarding headers. A reverse proxy shares this remote-address limit.
        $key=hash_hmac('sha256',$kind.'|'.($_SERVER['REMOTE_ADDR']??''),$config['key']);$window=intdiv(time(),$seconds);
        query('DELETE FROM rate_limits WHERE expires<?',[time()]);
        query('INSERT INTO rate_limits(bucket,window,hits,expires) VALUES(?,?,1,?) ON CONFLICT(bucket,window) DO UPDATE SET hits=hits+1',[$key,$window,time()+$seconds]);
        if(query('SELECT hits FROM rate_limits WHERE bucket=? AND window=?',[$key,$window])->fetchColumn()>$limit){header('Retry-After: '.$seconds);fail('Příliš mnoho pokusů. Zkus to později.',429);}
    }
    if ($_SERVER['REQUEST_METHOD']==='GET') reply(['csrf'=>$_SESSION['csrf'],'account'=>account()]);
    if ($_SERVER['REQUEST_METHOD']!=='POST') fail('Použij POST.',405);
    if (($_SERVER['HTTP_ORIGIN']??'')!==$origin || !hash_equals($_SESSION['csrf'],$_SERVER['HTTP_X_CSRF_TOKEN']??'')) fail('Obnov přihlášení a zkus akci znovu.',403);
    if (!str_starts_with($_SERVER['CONTENT_TYPE']??'','application/json')) fail('Očekáván JSON.',415);
    if ((int)($_SERVER['CONTENT_LENGTH']??0)>32768) fail('Příliš velká data.',413);
    $raw=file_get_contents('php://input',false,null,0,32769);if(strlen($raw)>32768)fail('Příliš velká data.',413);
    $body=json_decode($raw,true,32,JSON_THROW_ON_ERROR);if(!is_array($body))fail('Neplatná data.');
    $action=$body['action']??'';
    $schema=json_decode(file_get_contents(__DIR__.'/schema.json'),true,512,JSON_THROW_ON_ERROR);
    function cleanSnapshot(mixed $v): array {global $schema;
        if(!is_array($v)||($v['version']??'')!=='profile-1'||($v['ipipVersion']??'')!==$schema['ipipVersion']||($v['intimacyVersion']??'')!==$schema['intimacyVersion'])fail('Nepodporovaná verze profilu.');
        $out=['version'=>'profile-1','ipipVersion'=>$schema['ipipVersion'],'intimacyVersion'=>$schema['intimacyVersion'],'personality'=>[],'intimacy'=>[]];
        foreach(['personality','intimacy'] as $part){if(!isset($v[$part])||!is_array($v[$part])||count($v[$part])>50)fail('Neplatné odpovědi.');
            foreach($v[$part] as $id=>$value){$valid=false;
                if($part==='personality')$valid=isset($schema['key'][(string)$id])&&is_int($value)&&$value>=1&&$value<=5;
                elseif(in_array((string)$id,$schema['ratings'],true))$valid=(is_int($value)&&$value>=1&&$value<=5)||in_array($value,['na','skip'],true);
                elseif(in_array((string)$id,$schema['practices'],true))$valid=in_array($value,['yes','talk','no','unsure','skip'],true);
                if(!$valid)fail('Neplatná odpověď v profilu.');$out[$part][(string)$id]=$value;
            }
        }
        if(!count($out['personality'])&&!count($out['intimacy']))fail('Nejdřív vyplň alespoň jednu odpověď.');return $out;
    }
    function publicProfile(array $record,array $scopes): array {global $schema;
        $v=unseal($record['payload']);$out=['id'=>$record['id'],'created'=>$record['created'],'ipipVersion'=>$v['ipipVersion'],'intimacyVersion'=>$v['intimacyVersion'],'scopes'=>$scopes];
        if(in_array('personality',$scopes,true)){$out['personality']=[];foreach(['E','A','C','S','I'] as $scale){$sum=0;$count=0;foreach($schema['key'] as $id=>$item)if($item['scale']===$scale&&isset($v['personality'][$id])){$n=$v['personality'][$id];$sum+=$item['reverse']?6-$n:$n;$count++;}$out['personality'][$scale]=$count===10?$sum/10:null;}}
        if(in_array('roles',$scopes,true)){$out['roles']=[];foreach($schema['roles'] as $id){$a=$v['intimacy'][$id.'-1']??null;$b=$v['intimacy'][$id.'-2']??null;$out['roles'][$id]=is_int($a)&&is_int($b)?($a+$b)/2:null;}}
        foreach(['context'=>'context','practices'=>'practices'] as $scope=>$ids)if(in_array($scope,$scopes,true)){$out[$scope]=[];foreach($schema[$ids] as $id){$value=$v['intimacy'][$id]??null;if($value!==null&&$value!=='skip')$out[$scope][$id]=$value;}}
        return $out;
    }
    if($action==='register'){
        throttle('register',30,3600);if(account())fail('Účet už je přihlášený.');
        $id='U'.bin2hex(random_bytes(8));$key=token();query('INSERT INTO accounts VALUES(?,?,?)',[$id,hash('sha256',$key),time()]);
        session_regenerate_id(true);$_SESSION=['account'=>$id,'expires'=>time()+7200,'csrf'=>bin2hex(random_bytes(32))];reply(['account'=>$id,'key'=>$key,'csrf'=>$_SESSION['csrf']]);
    }
    if($action==='login'){
        throttle('login',40,600);$id=is_string($body['id']??null)?$body['id']:'';$key=is_string($body['key']??null)?$body['key']:'';
        $hash=query('SELECT key_hash FROM accounts WHERE id=?',[$id])->fetchColumn();
        if(!$hash||!hash_equals($hash,hash('sha256',$key)))fail('ID nebo soukromý klíč není správný.',401);
        session_regenerate_id(true);$_SESSION=['account'=>$id,'expires'=>time()+7200,'csrf'=>bin2hex(random_bytes(32))];reply(['account'=>$id,'csrf'=>$_SESSION['csrf']]);
    }
    if($action==='logout'){$_SESSION=[];session_regenerate_id(true);$_SESSION['csrf']=bin2hex(random_bytes(32));reply(['csrf'=>$_SESSION['csrf']]);}
    if($action==='compare'||$action==='read-shared'){
        throttle('compare',120,600);$profiles=[];
        foreach($action==='read-shared'?['code']:['a','b'] as $side){$code=$body[$side]??'';if(!is_string($code)||!preg_match('/^(R[0-9a-f]{24})\.([A-Za-z0-9_-]{43})$/D',$code,$m))fail('Jeden z kódů je neplatný, zrušený nebo vypršel.',404);
            $r=query('SELECT p.*,s.scopes FROM shares s JOIN profiles p ON p.id=s.profile_id WHERE s.profile_id=? AND s.token_hash=? AND s.expires>?',[$m[1],hash('sha256',$m[2]),time()])->fetch(PDO::FETCH_ASSOC);
            if(!$r)fail('Jeden z kódů je neplatný, zrušený nebo vypršel.',404);$profiles[]=publicProfile($r,json_decode($r['scopes'],true));
        }reply($action==='read-shared'?['profile'=>$profiles[0]]:['profiles'=>$profiles]);
    }
    if($action==='ai-explain'||$action==='ai-personal'){
        $personal=$action==='ai-personal';
        $scopes=$body['scopes']??[];
        if(!is_array($scopes)||!count($scopes)||count($scopes)>4||count(array_diff($scopes,['personality','roles','context','practices'])))fail('Vyber platné kategorie pro AI vysvětlení.');
        if($personal?!is_array($body['profile']??null):(!is_array($body['a']??null)||!is_array($body['b']??null)))fail('Chybí podklady k vysvětlení.');
        throttle('ai-explain',12,600);
        if(($_SESSION['ai_last']??0)>time()-8)fail('Před dalším vysvětlením chvíli počkej.',429);
        $_SESSION['ai_last']=time();session_write_close();
        $request=json_encode($personal?['scopes'=>$scopes,'profile'=>$body['profile']]:['scopes'=>$scopes,'a'=>$body['a'],'b'=>$body['b']],JSON_THROW_ON_ERROR);
        $curl=curl_init('http://127.0.0.1:4180/'.($personal?'personal':'explain'));
        curl_setopt_array($curl,[CURLOPT_POST=>true,CURLOPT_POSTFIELDS=>$request,CURLOPT_HTTPHEADER=>['Content-Type: application/json'],CURLOPT_RETURNTRANSFER=>true,CURLOPT_CONNECTTIMEOUT=>3,CURLOPT_TIMEOUT=>95,CURLOPT_FOLLOWLOCATION=>false]);
        $response=curl_exec($curl);$status=(int)curl_getinfo($curl,CURLINFO_RESPONSE_CODE);curl_close($curl);
        if($response===false||!in_array($status,[200,400,413,429,503],true))fail('AI vysvětlení teď není dostupné. Běžné porovnání můžeš použít dál.',503);
        $result=json_decode($response,true,32,JSON_THROW_ON_ERROR);if(!is_array($result))fail('AI vysvětlení teď není dostupné.',503);
        reply($result,$status);
    }
    $owner=requireAccount();
    if($action==='list'){
        $profiles=query('SELECT id,created FROM profiles WHERE owner=? ORDER BY created DESC,rowid DESC',[$owner])->fetchAll(PDO::FETCH_ASSOC);
        $shares=query('SELECT s.id,s.profile_id,s.scopes,s.expires FROM shares s JOIN profiles p ON p.id=s.profile_id WHERE p.owner=? ORDER BY s.expires DESC',[$owner])->fetchAll(PDO::FETCH_ASSOC);
        foreach($shares as &$s)$s['scopes']=json_decode($s['scopes'],true);reply(['profiles'=>$profiles,'shares'=>$shares]);
    }
    if($action==='save'){
        if(query('SELECT COUNT(*) FROM profiles WHERE owner=?',[$owner])->fetchColumn()>=20)fail('Účet může mít nejvýše 20 výsledků. Staré můžeš smazat.');
        $snapshot=cleanSnapshot($body['snapshot']??null);$id='R'.bin2hex(random_bytes(12));query('INSERT INTO profiles VALUES(?,?,?,?)',[$id,$owner,seal($snapshot),time()]);reply(['id'=>$id]);
    }
    if($action==='delete-account'){
        if(($body['confirm']??'')!=='SMAZAT')fail('Pro smazání napiš SMAZAT.');query('DELETE FROM accounts WHERE id=?',[$owner]);$_SESSION=[];session_regenerate_id(true);$_SESSION['csrf']=bin2hex(random_bytes(32));reply(['csrf'=>$_SESSION['csrf']]);
    }
    if($action==='revoke'){
        query('DELETE FROM shares WHERE id=? AND profile_id IN(SELECT id FROM profiles WHERE owner=?)',[$body['id']??'',$owner]);reply(['ok'=>true]);
    }
    $id=$body['id']??'';if(!is_string($id))fail('Neplatné ID.');
    $record=query('SELECT * FROM profiles WHERE id=? AND owner=?',[$id,$owner])->fetch(PDO::FETCH_ASSOC);if(!$record)fail('Výsledek není dostupný.',404);
    if($action==='load')reply(['snapshot'=>unseal($record['payload'])]);
    if($action==='delete-profile'){query('DELETE FROM profiles WHERE id=? AND owner=?',[$id,$owner]);reply(['ok'=>true]);}
    if($action==='share'){
        $scopes=$body['scopes']??[];if(!is_array($scopes)||!count($scopes)||count($scopes)>4||count(array_diff($scopes,['personality','roles','context','practices'])))fail('Vyber platné části ke sdílení.');
        if(query('SELECT COUNT(*) FROM shares WHERE profile_id=?',[$id])->fetchColumn()>=20)fail('Nejdřív zruš některý ze starých kódů.');
        $key=token();$sid='S'.bin2hex(random_bytes(12));$expires=time()+604800;
        query('INSERT INTO shares VALUES(?,?,?,?,?)',[$sid,$id,hash('sha256',$key),json_encode(array_values(array_unique($scopes))),$expires]);reply(['code'=>$id.'.'.$key,'expires'=>$expires,'preview'=>publicProfile($record,$scopes)]);
    }
    fail('Neznámá akce.',400);
} catch (JsonException $e) {fail('Neplatný JSON.',400);} catch (Throwable $e) {error_log('Osobnosti API: '.get_class($e));fail('Uložení teď není dostupné. Odpovědi na stránce zůstaly zachované.',503);}
