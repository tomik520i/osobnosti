import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';

test('Loopback gateway serves personal rules and existing comparison, rejects origin and malformed input',async t=>{
 const child=spawn(process.execPath,['ai-service.mjs'],{cwd:new URL('../',import.meta.url),stdio:['ignore','pipe','pipe']});
 t.after(()=>child.kill());
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Gateway did not start')),4000);child.stdout.once('data',()=>{clearTimeout(timer);resolve();});child.once('exit',code=>{clearTimeout(timer);reject(Error('Gateway exited: '+code));});child.once('error',reject);});
 const post=(route,body,headers={})=>fetch('http://127.0.0.1:4180'+route,{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body)});
 assert.equal((await post('/personal',null)).status,400);
 assert.equal((await post('/personal',{scopes:['personality'],profile:[]})).status,400);
 assert.equal((await post('/personal',{scopes:['invalid'],profile:{}})).status,400);
 assert.equal((await post('/personal',{scopes:['personality'],profile:{}},{Origin:'https://example.org'})).status,403);
 const personal=await post('/personal',{scopes:['personality'],profile:{}});assert.equal(personal.status,200);assert.equal((await personal.json()).mode,'rules');
 const comparison=await post('/explain',{scopes:['personality'],a:{},b:{}});assert.equal(comparison.status,200);assert.equal((await comparison.json()).status,'insufficient');
});
