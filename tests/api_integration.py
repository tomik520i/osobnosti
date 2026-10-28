"""Real HTTP tests against a temporary, isolated PHP/SQLite instance. No production user data."""
import hashlib,secrets,os,sys,subprocess,tempfile,pathlib,urllib.request,urllib.error,http.cookiejar,json,time,sqlite3
ROOT=pathlib.Path(__file__).resolve().parents[1]
ORIGIN='http://127.0.0.1:4176'
class Client:
    def __init__(self):
        self.jar=http.cookiejar.CookieJar();self.opener=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(self.jar));self.csrf=''
    def req(self,action=None,data=None,origin=ORIGIN,csrf=None):
        body=json.dumps({'action':action,**(data or {})}).encode() if action else None
        headers={'Origin':origin,'Content-Type':'application/json','X-CSRF-Token':self.csrf if csrf is None else csrf}
        request=urllib.request.Request(ORIGIN+'/osobnosti_test/api.php',body,headers)
        try: response=self.opener.open(request)
        except urllib.error.HTTPError as e: response=e
        parsed=json.loads(response.read());self.csrf=parsed.get('csrf',self.csrf)
        return response.status,parsed
def ok(client,action=None,data=None):
    status,body=client.req(action,data);assert status==200,(action,status,body);return body
with tempfile.TemporaryDirectory(prefix='osobnosti-api-') as td:
    path=pathlib.Path(td);data=path/'data';web=path/'web';web.mkdir();(web/'osobnosti_test').symlink_to(ROOT/'dist',target_is_directory=True)
    subprocess.run(['php',str(ROOT/'server/setup.php'),str(data),ORIGIN],check=True,stdout=subprocess.DEVNULL)
    env={**os.environ,'OSOBNOSTI_TEST_DIR':str(data)}
    server=subprocess.Popen(['php','-S','127.0.0.1:4176','-t',str(web)],env=env,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    try:
        time.sleep(.5);a,b,c=Client(),Client(),Client();ok(a);ok(b);ok(c)
        assert c.req('ai-personal',{'scopes':['personality'],'profile':{}},csrf='bad')[0]==403
        assert c.req('ai-personal',{'scopes':['personality'],'profile':{}},origin='https://evil.example')[0]==403
        assert c.req('ai-personal',{'scopes':['unknown'],'profile':{}})[0]==400
        assert c.req('ai-personal',{'scopes':['personality']})[0]==400
        password='Synthetic password for tests 123!';credentials={'nickname':'Example_A','password':password};other={'nickname':'Example_B','password':password}
        ua=ok(a,'register',credentials);ub=ok(b,'register',other);assert ua['account']!=ub['account']
        assert ua['nickname']=='Example_A' and ua['legacy'] is False
        assert not {'key','password','password_hash'} & set(ua)
        assert ok(c,'check-nickname',{'nickname':'example_a'})['available'] is False
        assert c.req('register',{**credentials,'nickname':'eXample_A'})[0]==409
        assert c.req('register',{'nickname':'Bad Space','password':password})[0]==400
        assert c.req('register',{'nickname':'Example_C','password':'short'})[0]==400
        cookies=list(a.jar);assert cookies and cookies[0]._rest.get('HttpOnly') is None and 'HttpOnly' in cookies[0]._rest
        schema=json.loads((ROOT/'dist/schema.json').read_text())
        snap={'version':'profile-1','ipipVersion':schema['ipipVersion'],'intimacyVersion':schema['intimacyVersion'],'personality':{str(i):3 for i in range(1,51)},'intimacy':{'dominant-1':5,'dominant-2':4,'desire':5,'cuddle':'yes','kiss':'no','oral':'skip'}}
        pa=ok(a,'save',{'snapshot':snap})['id'];pb=ok(b,'save',{'snapshot':snap})['id']
        assert a.req('save',{'snapshot':{**snap,'personality':{'1':6}}})[0]==400
        assert a.req('save',{'snapshot':{**snap,'ipipVersion':'wrong'}})[0]==400
        for action in ['load','delete-profile','share']:
            assert b.req(action,{'id':pa,'scopes':['personality']})[0]==404,action
        assert c.req('load',{'id':pa})[0]==401
        assert a.req('delete-profile',{'id':pa},csrf='bad')[0]==403
        assert a.req('delete-profile',{'id':pa},origin='https://evil.example')[0]==403
        sa=ok(a,'share',{'id':pa,'scopes':['personality']});sb=ok(b,'share',{'id':pb,'scopes':['personality','roles','context','practices']})
        pair=ok(c,'compare',{'a':sa['code'],'b':sb['code']})['profiles'];assert set(pair[0])=={'id','created','ipipVersion','intimacyVersion','scopes','personality'}
        assert pair[0]['personality']==dict.fromkeys(['E','A','C','S','I'],3)
        assert pair[1]['roles']['dominant']==4.5 and pair[1]['roles']['switch'] is None
        assert 'oral' not in pair[1]['practices'];assert 'payload' not in json.dumps(pair)
        assert c.req('compare',{'a':pa,'b':sb['code']})[0]==404
        sid=ok(a,'list')['shares'][0]['id'];ok(b,'revoke',{'id':sid});ok(c,'compare',{'a':sa['code'],'b':sb['code']})
        ok(a,'revoke',{'id':sid});assert c.req('compare',{'a':sa['code'],'b':sb['code']})[0]==404
        sa=ok(a,'share',{'id':pa,'scopes':['roles']});conn=sqlite3.connect(data/'profiles.sqlite');conn.execute('UPDATE shares SET expires=? WHERE profile_id=?',(time.time()-1,pa));conn.commit()
        assert c.req('compare',{'a':sa['code'],'b':sb['code']})[0]==404
        raw=conn.execute('SELECT payload FROM profiles WHERE id=?',(pa,)).fetchone()[0];assert 'personality' not in raw and 'dominant' not in raw
        ok(a,'delete-profile',{'id':pa});assert ok(a,'list')['profiles']==[];assert ok(a,'list')['shares']==[]
        ok(a,'logout');assert a.req('list')[0]==401;assert a.req('login',{**credentials,'password':'wrong'})[0]==401
        ok(a,'login',credentials);ok(c,'login',credentials)
        ok(a,'delete-account',{'confirm':'SMAZAT','secret':password});assert c.req('list')[0] in (401,403);assert ok(c)['account'] is None;assert a.req('login',credentials)[0]==401
        ok(b,'delete-account',{'confirm':'SMAZAT','secret':password});assert conn.execute('SELECT COUNT(*) FROM profiles').fetchone()[0]==0;assert conn.execute('SELECT COUNT(*) FROM shares').fetchone()[0]==0

        # Dedicated auth scenarios use synthetic fixtures in this disposable database only.
        def reset_limits():
            conn.execute('DELETE FROM rate_limits');conn.commit()
        def clear_session_cookie(client):
            for cookie in list(client.jar):
                if cookie.name=='osobnosti_session':client.jar.clear(cookie.domain,cookie.path,cookie.name)
        reset_limits();d,e,f=Client(),Client(),Client();ok(d);ok(e);ok(f)
        phrase='  Testovací věta s mezerami a 😀  '
        creds={'nickname':'Return_User','password':phrase,'remember':True}
        ud=ok(d,'register',creds)
        row=conn.execute('SELECT password_hash,key_hash FROM accounts WHERE id=?',(ud['account'],)).fetchone()
        assert row[0].startswith('$argon2id$v=19$m=65536,t=3,p=1$') and row[1]=='disabled'
        assert phrase not in row[0]
        token_cookie=next(cookie for cookie in d.jar if cookie.name=='osobnosti_remember')
        assert token_cookie.expires>time.time()+29*86400 and token_cookie.path=='/osobnosti_test/'
        assert 'HttpOnly' in token_cookie._rest and token_cookie._rest['SameSite']=='Strict'
        stored=conn.execute('SELECT validator_hash FROM remember_tokens WHERE owner=?',(ud['account'],)).fetchone()[0]
        assert token_cookie.value.split('.')[1] not in stored
        clear_session_cookie(d);assert ok(d)['account']==ud['account']
        assert ok(d)['remembered'] is True
        assert e.req('login',{**creds,'password':phrase.strip()})[0]==401
        assert e.req('login',{'nickname':'NoSuchNickname','password':'wrong'})[1]['error']==e.req('login',{**creds,'password':'wrong'})[1]['error']
        ok(e,'login',creds)
        assert d.req('change-password',{'secret':'wrong','password':password})[0]==400
        assert d.req('delete-account',{'confirm':'SMAZAT','secret':'wrong'})[0]==400
        ok(d,'change-password',{'secret':phrase,'password':password,'remember':True})
        assert ok(e)['account'] is None
        assert e.req('login',creds)[0]==401
        reset_limits();ok(e,'login',{'nickname':'return_user','password':password,'remember':True})
        clear_session_cookie(e)
        conn.execute('UPDATE remember_tokens SET expires=? WHERE owner=?',(time.time()-1,ud['account']));conn.commit()
        assert ok(e)['account'] is None and ok(d)['account'] is None
        ok(d,'login',{'nickname':'Return_User','password':password,'remember':True})
        clear_session_cookie(d)
        for cookie in d.jar:
            if cookie.name=='osobnosti_remember':cookie.value=cookie.value[:-1]+('A' if cookie.value[-1]!='A' else 'B')
        assert ok(d)['account'] is None
        ok(d,'login',{'nickname':'Return_User','password':password,'remember':True})
        ok(d,'logout');clear_session_cookie(d);assert ok(d)['account'] is None
        # Migration is additive and idempotent, preserving legacy ownership and share codes.
        legacy_id='U'+secrets.token_hex(8);legacy_key=secrets.token_urlsafe(32)
        conn.execute('INSERT INTO accounts(id,key_hash,created) VALUES(?,?,?)',(legacy_id,hashlib.sha256(legacy_key.encode()).hexdigest(),int(time.time())));conn.commit()
        for _ in range(2):subprocess.run(['php',str(ROOT/'server/migrate-auth.php'),str(data)],check=True,stdout=subprocess.DEVNULL)
        reset_limits();legacy={'id':legacy_id,'key':legacy_key};ok(f,'legacy-login',legacy);ok(e,'legacy-login',legacy)
        saved=ok(f,'save',{'snapshot':snap})['id'];code=ok(f,'share',{'id':saved,'scopes':['personality']})['code']
        assert f.req('upgrade-account',{'secret':legacy_key,'nickname':'RETURN_user','password':password})[0]==409
        upgraded=ok(f,'upgrade-account',{'secret':legacy_key,'nickname':'Converted_User','password':password})
        assert upgraded['account']==legacy_id and upgraded['legacy'] is False
        assert ok(e)['account'] is None and e.req('legacy-login',legacy)[0]==401
        assert ok(f,'load',{'id':saved})['snapshot']['personality']==snap['personality']
        assert ok(e,'read-shared',{'code':code})['profile']['id']==saved
        ok(f,'logout');ok(f,'login',{'nickname':'converted_USER','password':password})
        ok(f,'delete-account',{'confirm':'SMAZAT','secret':password})
        assert e.req('read-shared',{'code':code})[0]==404
        reset_limits();ok(d,'login',{'nickname':'Return_User','password':password,'remember':True})
        ok(d,'delete-account',{'confirm':'SMAZAT','secret':password})
        assert conn.execute('SELECT COUNT(*) FROM remember_tokens').fetchone()[0]==0
        reset_limits();ok(e)
        for _ in range(12):assert e.req('login',{'nickname':'Rate_Test','password':'wrong'})[0]==401
        assert e.req('login',{'nickname':'rate_test','password':'wrong'})[0]==429
        # Original three-column schema migration with a preserved opaque payload.
        old=path/'old';old.mkdir();old_db=sqlite3.connect(old/'profiles.sqlite')
        old_db.executescript('CREATE TABLE accounts(id TEXT PRIMARY KEY,key_hash TEXT NOT NULL,created INTEGER NOT NULL); CREATE TABLE profiles(id TEXT PRIMARY KEY,owner TEXT REFERENCES accounts(id),payload TEXT);')
        old_db.execute('INSERT INTO accounts VALUES(?,?,?)',('legacy','hash',1));old_db.execute('INSERT INTO profiles VALUES(?,?,?)',('saved','legacy','opaque-test-data'));old_db.commit()
        for _ in range(2):subprocess.run(['php',str(ROOT/'server/migrate-auth.php'),str(old)],check=True,stdout=subprocess.DEVNULL)
        assert old_db.execute('SELECT id,key_hash,created,nickname,password_hash,auth_version FROM accounts').fetchone()==('legacy','hash',1,None,None,1)
        assert old_db.execute('SELECT * FROM profiles').fetchone()==('saved','legacy','opaque-test-data');old_db.close()
        conn.close()
        print('PASS: isolated HTTP auth, ownership, CSRF, origin, schema, scoring, scope filtering, encryption, revoke, expiry, delete cascade, session invalidation, Argon2id, nickname uniqueness, remembered login restoration/revocation/expiry/tampering, Unicode passphrases, password changes, legacy migration, throttling.')
    finally:
        server.terminate();server.wait(timeout=5)
