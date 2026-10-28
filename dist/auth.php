<?php
declare(strict_types=1);
if(!defined('OSOBNOSTI_API')){http_response_code(404);exit;}
const AUTH_HOURS=43200;
const REMEMBER_SECONDS=2592000;
const PASSWORD_OPTIONS=['memory_cost'=>65536,'time_cost'=>3,'threads'=>1];
function nickname(mixed $value): string {
    $name=is_string($value)?trim($value):'';
    if(!preg_match('/^[A-Za-z0-9][A-Za-z0-9_.-]{2,23}$/D',$name))fail('Nickname má mít 3–24 znaků: písmena bez diakritiky, číslice, tečku, pomlčku nebo podtržítko. Začni písmenem nebo číslicí.');
    return $name;
}
function newPassword(mixed $value): string {
    if(!is_string($value)||strlen($value)>512||str_contains($value,"\0")||!preg_match('//u',$value))fail('Heslo má mít 15–128 znaků.');
    $length=preg_match_all('/./us',$value);
    if($length<15||$length>128)fail('Heslo má mít 15–128 znaků. Může to být delší věta s mezerami.');
    if(preg_match('/^(.)\1+$/us',$value)||in_array(strtolower($value),['passwordpassword','passwordpasswordpassword','hesloheslohesloheslo','123456789012345','12345678901234567890','qwertyuiopasdfgh'],true))fail('Tohle heslo je příliš snadno odhadnutelné. Zkus delší vlastní frázi.');
    return $value; // Never trim, normalize, or truncate a password.
}
function passwordDigest(string $password): string {
    if(!defined('PASSWORD_ARGON2ID'))fail('Přihlašování není správně nakonfigurované.',503);
    return password_hash($password,PASSWORD_ARGON2ID,PASSWORD_OPTIONS);
}
function clearAuth(): void {
    $_SESSION=[];session_regenerate_id(true);$_SESSION['csrf']=bin2hex(random_bytes(32));
}
function authRecord(): ?array {
    $id=$_SESSION['account']??null;if(!$id)return null;
    $row=query('SELECT id,nickname,password_hash,key_hash,auth_version FROM accounts WHERE id=?',[$id])->fetch(PDO::FETCH_ASSOC);
    if(!$row||(int)$row['auth_version']!==(int)($_SESSION['auth_version']??1)||($_SESSION['expires']??0)<=time()){clearAuth();return null;}
    if(isset($_SESSION['remember_selector'])&&!query('SELECT selector FROM remember_tokens WHERE selector=? AND owner=? AND expires>? AND auth_version=?',[$_SESSION['remember_selector'],$id,time(),$row['auth_version']])->fetchColumn()){clearAuth();return null;}
    return $row;
}
function authInfo(): array {
    $row=authRecord();return ['account'=>$row['id']??null,'nickname'=>$row['nickname']??null,'legacy'=>$row&&$row['password_hash']===null,'remembered'=>$row&&isset($_SESSION['remember_selector']),'csrf'=>$_SESSION['csrf']];
}
function rememberCookie(string $value,int $expires): void {
    global $test;
    setcookie('osobnosti_remember',$value,['expires'=>$expires,'path'=>'/osobnosti_test/','secure'=>!$test,'httponly'=>true,'samesite'=>'Strict']);
    if($value==='')unset($_COOKIE['osobnosti_remember']);else $_COOKIE['osobnosti_remember']=$value;
}
function rememberParts(): ?array {
    $value=$_COOKIE['osobnosti_remember']??'';
    return is_string($value)&&preg_match('/^([a-f0-9]{32})\.([A-Za-z0-9_-]{43})$/D',$value,$m)?[$m[1],$m[2]]:null;
}
function forgetRemember(): void {
    if($parts=rememberParts())query('DELETE FROM remember_tokens WHERE selector=? AND validator_hash=?',[$parts[0],hash('sha256',$parts[1])]);
    rememberCookie('',time()-3600);
}
function startAuth(array $row,bool $remember=false,?array $existingToken=null): void {
    if(!$existingToken)forgetRemember();
    session_regenerate_id(true);
    $_SESSION=['account'=>$row['id'],'auth_version'=>(int)$row['auth_version'],'expires'=>time()+AUTH_HOURS,'csrf'=>bin2hex(random_bytes(32))];
    if($existingToken){$_SESSION['remember_selector']=$existingToken['selector'];$_SESSION['expires']=min($_SESSION['expires'],(int)$existingToken['expires']);return;}
    if($remember){
        $selector=bin2hex(random_bytes(16));$validator=token();$expires=time()+REMEMBER_SECONDS;
        query('DELETE FROM remember_tokens WHERE expires<=?',[time()]);
        query('INSERT INTO remember_tokens VALUES(?,?,?,?,?,?)',[$selector,hash('sha256',$validator),$row['id'],$row['auth_version'],time(),$expires]);
        query('DELETE FROM remember_tokens WHERE owner=? AND selector NOT IN(SELECT selector FROM remember_tokens WHERE owner=? ORDER BY created DESC,rowid DESC LIMIT 20)',[$row['id'],$row['id']]);
        $_SESSION['remember_selector']=$selector;rememberCookie($selector.'.'.$validator,$expires);
    }
}
function restoreRemember(): void {
    if(authRecord())return;
    if(!isset($_COOKIE['osobnosti_remember']))return;
    $parts=rememberParts();
    $saved=$parts?query('SELECT r.*,a.nickname,a.password_hash,a.key_hash,a.auth_version AS current_version FROM remember_tokens r JOIN accounts a ON a.id=r.owner WHERE r.selector=?',[$parts[0]])->fetch(PDO::FETCH_ASSOC):false;
    if(!$saved||$saved['expires']<=time()||(int)$saved['auth_version']!==(int)$saved['current_version']||!hash_equals($saved['validator_hash'],hash('sha256',$parts[1]))){rememberCookie('',time()-3600);return;}
    // A separate opaque token survives PHP session-file cleanup. Its absolute expiry is never extended by visiting.
    startAuth(['id'=>$saved['owner'],'auth_version'=>$saved['current_version']],false,$saved);
}
function authThrottle(string $name): void {
    global $config;
    throttle('login',60,600);
    $bucket=hash_hmac('sha256','nickname|'.strtolower(trim($name)),$config['key']);
    $window=intdiv(time(),600);
    query('INSERT INTO rate_limits(bucket,window,hits,expires) VALUES(?,?,1,?) ON CONFLICT(bucket,window) DO UPDATE SET hits=hits+1',[$bucket,$window,time()+600]);
    if(query('SELECT hits FROM rate_limits WHERE bucket=? AND window=?',[$bucket,$window])->fetchColumn()>12){header('Retry-After: 600');fail('Příliš mnoho pokusů o přihlášení. Zkus to za deset minut.',429);}
}
function verifySecret(array $row,mixed $secret): bool {
    if(!is_string($secret)||strlen($secret)>512)return false;
    return $row['password_hash']!==null?password_verify($secret,$row['password_hash']):strlen($secret)===43&&hash_equals($row['key_hash'],hash('sha256',$secret));
}
function setNicknameAndPassword(array $row,string $name,string $password): void {
    global $db;
    $hash=passwordDigest($password);
    $db->beginTransaction();
    try {
        $changed=query('UPDATE accounts SET nickname=?,nickname_key=?,password_hash=?,key_hash=?,auth_version=auth_version+1 WHERE id=? AND auth_version=?',[$name,strtolower($name),$hash,'disabled',$row['id'],$row['auth_version']]);
        if($changed->rowCount()!==1){$db->rollBack();fail('Přihlášení se mezitím změnilo. Přihlas se znovu.',409);}
        query('DELETE FROM remember_tokens WHERE owner=?',[$row['id']]);
        $db->commit();
    }catch(PDOException $e){$db->rollBack();if($e->getCode()==='23000')fail('Tenhle nickname už někdo používá. Vyber jiný.',409);throw $e;}
}
function handleAuth(string $action,array $body): void {
    if($action==='check-nickname'){
        throttle('nickname-check',90,600);$name=nickname($body['nickname']??null);
        reply(['available'=>!query('SELECT id FROM accounts WHERE nickname_key=?',[strtolower($name)])->fetchColumn()]);
    }
    if($action==='register'){
        throttle('register',20,3600);if(account())fail('Účet už je přihlášený.');
        $name=nickname($body['nickname']??null);$password=newPassword($body['password']??null);
        if(query('SELECT id FROM accounts WHERE nickname_key=?',[strtolower($name)])->fetchColumn())fail('Tenhle nickname už někdo používá. Vyber jiný.',409);
        $id='U'.bin2hex(random_bytes(8));$hash=passwordDigest($password);
        try{query('INSERT INTO accounts(id,key_hash,created,nickname,nickname_key,password_hash,auth_version) VALUES(?,?,?,?,?,?,1)',[$id,'disabled',time(),$name,strtolower($name),$hash]);}
        catch(PDOException $e){if($e->getCode()==='23000')fail('Tenhle nickname už někdo používá. Vyber jiný.',409);throw $e;}
        startAuth(['id'=>$id,'auth_version'=>1],($body['remember']??false)===true);reply(authInfo());
    }
    if($action==='login'){
        $name=is_string($body['nickname']??null)?trim($body['nickname']):'';authThrottle(substr($name,0,128));
        $row=query('SELECT * FROM accounts WHERE nickname_key=?',[strtolower($name)])->fetch(PDO::FETCH_ASSOC);
        // Dummy work for an unknown nickname. Availability is separately exposed at registration.
        if(!$row||$row['password_hash']===null){passwordDigest('non-secret dummy work for unknown login');fail('Nickname nebo heslo není správné.',401);}
        if(!verifySecret($row,$body['password']??null))fail('Nickname nebo heslo není správné.',401);
        if(password_needs_rehash($row['password_hash'],PASSWORD_ARGON2ID,PASSWORD_OPTIONS))query('UPDATE accounts SET password_hash=? WHERE id=?',[passwordDigest($body['password']),$row['id']]);
        startAuth($row,($body['remember']??false)===true);reply(authInfo());
    }
    if($action==='legacy-login'){
        $id=is_string($body['id']??null)?$body['id']:'';authThrottle(substr($id,0,128));
        $row=query('SELECT * FROM accounts WHERE id=? AND password_hash IS NULL',[$id])->fetch(PDO::FETCH_ASSOC);
        if(!$row||!verifySecret($row,$body['key']??null))fail('ID nebo původní klíč není správný.',401);
        startAuth($row);reply(authInfo());
    }
    if($action==='upgrade-account'||$action==='change-password'){
        $id=requireAccount();$row=authRecord();authThrottle($id);
        if(!verifySecret($row,$body['secret']??null))fail('Současné přihlašovací údaje nejsou správné.',400);
        if($action==='upgrade-account'&&$row['password_hash']!==null)fail('Účet už používá nickname a heslo.');
        if($action==='change-password'&&$row['password_hash']===null)fail('Nejprve nastav nickname a heslo.');
        $name=$action==='upgrade-account'?nickname($body['nickname']??null):$row['nickname'];
        setNicknameAndPassword($row,$name,newPassword($body['password']??null));
        $row['auth_version']++;startAuth($row,($body['remember']??false)===true);reply(authInfo());
    }
    if($action==='logout'){forgetRemember();clearAuth();reply(authInfo());}
}
