"""Real HTTP tests against a temporary, isolated PHP/SQLite instance. No production user data."""
import os,sys,subprocess,tempfile,pathlib,urllib.request,urllib.error,http.cookiejar,json,time,sqlite3
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
        ua=ok(a,'register');ub=ok(b,'register');assert ua['account']!=ub['account']
        assert len(ua['key'])==43 and 'key' not in ok(a)
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
        ok(a,'logout');assert a.req('list')[0]==401;assert a.req('login',{'id':ua['account'],'key':'wrong'})[0]==401
        ok(a,'login',{'id':ua['account'],'key':ua['key']});ok(c,'login',{'id':ua['account'],'key':ua['key']})
        ok(a,'delete-account',{'confirm':'SMAZAT'});assert c.req('list')[0]==401;assert a.req('login',{'id':ua['account'],'key':ua['key']})[0]==401
        ok(b,'delete-account',{'confirm':'SMAZAT'});assert conn.execute('SELECT COUNT(*) FROM profiles').fetchone()[0]==0;assert conn.execute('SELECT COUNT(*) FROM shares').fetchone()[0]==0
        conn.close()
        print('PASS: isolated HTTP auth, ownership, CSRF, origin, schema, scoring, scope filtering, encryption, revoke, expiry, delete cascade, session invalidation.')
    finally:
        server.terminate();server.wait(timeout=5)
