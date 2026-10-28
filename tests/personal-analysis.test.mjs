import test from 'node:test';
import assert from 'node:assert/strict';
import {VERSION,SCALES} from '../dist/instrument.mjs';
import {INTIMACY_VERSION,ROLE_INFO,CONTEXT_ITEMS} from '../dist/extensions-data.mjs';
import {personalInput,personalModelGroups,personalServiceProfile} from '../dist/personal-input.mjs';
import {generatePersonal,validatePersonal} from '../personal-analysis.mjs';

const profile={id:'PRIVATE_ID',key:'PRIVATE_KEY',rawAnswers:'PRIVATE_ANSWERS',scopes:['personality','roles','context','practices'],ipipVersion:VERSION,intimacyVersion:INTIMACY_VERSION,personality:{E:2,A:4,C:3.2,S:2.6,I:4.2},roles:Object.fromEntries(ROLE_INFO.map((r,i)=>[r.id,1+i*.5])),context:Object.fromEntries(CONTEXT_ITEMS.map((r,i)=>[r.id,i%5+1])),practices:{cuddle:'talk',kiss:'no',toys:'unsure',oral:'skip'}};
const chapter=scope=>({scope,situation:'Pokud bys například plánoval/a víkend, mohl/a bys zvažovat klidnější i společnou činnost.',useful:'Můžeš si všimnout jedné situace, ve které tento výklad odpovídá tvému vlastnímu prožívání.',watch:'Pokud se tvoje potřeby liší podle situace, může vzniknout nedorozumění při společné domluvě.',fits:'Kdy se ti v posledních dnech stalo něco, co by tomuto příkladu odpovídalo?',exception:'Kdy naopak tvoje vlastní zkušenost tomuto výkladu vůbec neodpovídala?'});
const mock=(mutate=x=>x,onBody=()=>{})=>async(url,options)=>({ok:true,json:async()=>{
  if(url.endsWith('/models'))return {data:[{id:'synthetic-model'}]};
  const body=JSON.parse(options.body);onBody(body);const groups=JSON.parse(body.messages[1].content).groups;
  return {choices:[{finish_reason:'stop',message:{content:JSON.stringify(mutate({chapters:groups.map(g=>chapter(g.scope))}))}}]};
}});

test('Personal default request contains no identities, raw answers or unselected intimacy',()=>{
 const clean=personalServiceProfile(profile);
 assert.deepEqual(clean.scopes,['personality']);assert.deepEqual(clean.personality,profile.personality);
 for(const forbidden of ['PRIVATE','roles','context','practices'])assert.equal(JSON.stringify(clean).includes(forbidden),false);
});
test('Personal request never sends activities or unknown context, even when selected',()=>{
 const clean=personalServiceProfile({...profile,context:{...profile.context,privacy:'na'}},profile.scopes);
 assert.equal(clean.practices,undefined);assert.equal(clean.context.privacy,undefined);assert.equal(clean.scopes.includes('practices'),false);
 assert.equal(clean.roles.dominant,profile.roles.dominant);
});
test('Missing, null, invalid, or incompatible values never become personal facts',()=>{
 for(const bad of [null,0,6,NaN,'4',{},undefined]){
  const input=personalInput({...profile,personality:{E:bad,A:4}},['personality']);
  assert.deepEqual(input.facts.map(f=>f.id),['personality:A']);assert.equal(input.missing.length,4);
 }
 assert.equal(personalInput({...profile,ipipVersion:'other'},['personality']).facts.length,0);
 assert.equal(personalInput({...profile,intimacyVersion:'other'},['roles','context','practices']).facts.length,0);
});
test('Maybe, boundary and unknown choices retain exact meaning and never become model facts',()=>{
 const input=personalInput({...profile,context:{privacy:'na'}},profile.scopes);
 const practices=input.facts.filter(f=>f.scope==='practices');assert.equal(practices.length,3);
 assert.match(practices.find(f=>f.id==='practices:cuddle').reading,/nikoli potvrzený zájem/);
 assert.match(practices.find(f=>f.id==='practices:kiss').reading,/není třeba/);
 assert.match(practices.find(f=>f.id==='practices:toys').reading,/nevyvozujeme/);
 assert.ok(practices.every(f=>!f.modelEligible));assert.equal(personalModelGroups(input).some(g=>g.scope==='context'||g.scope==='practices'),false);
});
test('All available selected numeric categories reach the model separately; original values remain fixed',async()=>{
 const report=await generatePersonal(profile,{scopes:profile.scopes,fetcher:mock(x=>x,body=>{
   const groups=JSON.parse(body.messages[1].content).groups;assert.deepEqual(groups.map(g=>g.facts.length),[5,8,12]);
   assert.deepEqual(groups[0].facts.map(f=>f.value),Object.values(profile.personality));
   assert.equal(JSON.stringify(body).includes('PRIVATE'),false);assert.equal(groups.some(g=>g.scope==='practices'),false);
 })});
 assert.equal(report.mode,'ai');assert.deepEqual(report.chapters.map(c=>c.scope),['personality','roles','context']);
 assert.deepEqual(report.chapters[0].evidence,SCALES.map(s=>'personality:'+s.id));
 assert.equal(report.input.facts.length,28);
});
test('Each model chapter is bound to exactly one allowed scope and server-owned evidence',()=>{
 const groups=personalModelGroups(personalInput(profile,['personality','roles']));
 const original={chapters:[chapter('personality'),chapter('roles')]};
 assert.equal(validatePersonal(original,groups).length,2);
 for(const change of [x=>x.chapters.pop(),x=>x.chapters[1].scope='personality',x=>x.chapters[1].scope='practices',x=>x.chapters[0].evidence=['invented'],x=>x.extra=true,x=>delete x.chapters[0].exception]){
  const changed=structuredClone(original);change(changed);assert.throws(()=>validatePersonal(changed,groups));
 }
});
test('Unsafe structure, invented numbers, categorical prose and missing counterexample questions are rejected',()=>{
 const groups=personalModelGroups(personalInput(profile,['personality']));
 for(const [key,value] of [['situation','Můžeš být určitě člověk, který má vždy stejnou osobnost.'],['situation','Pokud máš 95 procent shody, můžeš být hodně společenský.'],['situation','Můžeš mít psychopatickou poruchu a ta vysvětluje všechny výsledky.'],['situation','Můžeš si přečíst <script>alert("x")</script> v této větě.'],['situation','Tvoje odpovědi jednoznačně říkají, že potřebuješ trávit čas s ostatními.'],['exception','Tento výklad je popis tvé osobnosti a určitě bude odpovídat.'],['fits','x'.repeat(651)]]){
  assert.throws(()=>validatePersonal({chapters:[{...chapter('personality'),[key]:value}]},groups));
 }
});
test('Empty, boundary-only and unknown-only selections never invoke model; deterministic facts survive',async()=>{
 let calls=0;const fetcher=async()=>{calls++;throw Error('should not call');};
 for(const [p,scopes] of [[profile,[]],[profile,['practices']],[{...profile,context:{privacy:'na'}},['context']]])assert.equal((await generatePersonal(p,{scopes,fetcher})).mode,'rules');
 assert.equal(calls,0);
});
test('Network errors, truncated and schema-invalid outputs keep rules and suppress generated prose',async()=>{
 const cases=[async()=>{throw Error('offline');},mock(x=>({...x,extra:'untrusted'})),async url=>({ok:true,json:async()=>url.endsWith('/models')?{data:[{id:'test'}]}:{choices:[{finish_reason:'length',message:{content:'partial'}}]}})];
 for(const fetcher of cases){const result=await generatePersonal(profile,{fetcher});assert.equal(result.mode,'rules');assert.deepEqual(result.chapters,[]);assert.equal(result.input.facts.length,5);assert.ok(result.message);}
});
