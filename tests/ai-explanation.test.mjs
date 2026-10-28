import test from 'node:test';import assert from 'node:assert/strict';
import {selectForAI,buildAIInput,factNote} from '../dist/ai-input.mjs';
import {currentPublicProfile} from '../dist/self-comparison.mjs';
import {generateSummary,validateSelection,promptFor} from '../ai-explanation.mjs';
import {coreAnalysis,questionGroups} from '../analysis-core.mjs';
import {SCALES} from '../dist/instrument.mjs';
import {ROLE_INFO,CONTEXT_ITEMS,PRACTICES} from '../dist/extensions-data.mjs';
const answers=Object.fromEntries(Array.from({length:50},(_,i)=>[i+1,3]));
const a=currentPublicProfile(answers,{'dominant-1':4,'dominant-2':4,privacy:5,stress:'na',toys:'no',cuddle:'yes',kiss:'unsure',oral:'skip'},['personality','roles','context','practices']);
const b=currentPublicProfile(answers,{'dominant-1':2,'dominant-2':2,privacy:4,stress:2,toys:'yes',cuddle:'talk',kiss:'yes',oral:'yes'},a.scopes);
test('AI payload strips identity, unknown fields, unselected categories and private answers',()=>{
 const clean=selectForAI({...a,secret:'DO NOT SEND',id:'PRIVATE',practices:{...a.practices,other:'injection'}},['practices']);
 assert.deepEqual(Object.keys(clean).sort(),['intimacyVersion','ipipVersion','practices','scopes']);
 assert.deepEqual(clean.practices,{cuddle:'yes',kiss:'unsure',toys:'no'});
 assert.equal(JSON.stringify(clean).includes('PRIVATE'),false);
 assert.deepEqual(selectForAI(a).scopes,[]);
});
test('Only shared supported categories are available; missing answers and version mismatches are excluded',()=>{
 assert.deepEqual(buildAIInput(a,b,['roles']).facts.map(f=>f.id),['roles:dominant']);
 assert.equal(buildAIInput(a,b,['context']).facts.length,1);
 assert.equal(buildAIInput(a,{...b,scopes:['personality']},['roles']).facts.length,0);
 assert.equal(buildAIInput(a,{...b,intimacyVersion:'future'},['roles']).facts.length,0);
 assert.equal(buildAIInput(a,b,[]).facts.length,0);
});
test('Boundaries are retained, even opposite missing/unknown; skip does not become a preference',()=>{
 const rows=buildAIInput(a,{...b,practices:{cuddle:'talk',kiss:'yes'}},['practices']).facts;
 assert.equal(rows.find(r=>r.id==='practices:toys').kind,'boundary');
 assert.equal(rows.find(r=>r.id==='practices:kiss').kind,'unknown');
 assert.equal(rows.some(r=>r.id==='practices:oral'),false);
 assert.match(factNote(rows.find(r=>r.kind==='boundary')),/není výzva/);
});
const offline=async()=>{throw Error('offline');};
const selected=groups=>({selections:groups.map(g=>({group:g.id,topicId:g.options[0].id}))});
const modelMock=(mutate=x=>x)=>async(url,options)=>({ok:true,json:async()=>{
 if(url.endsWith('/models'))return {data:[{id:'test-model'}]};
 const groups=JSON.parse(JSON.parse(options.body).messages[1].content).groups;
 return {choices:[{finish_reason:'stop',message:{content:JSON.stringify(mutate(selected(groups)))}}]};
}});
const fullA={...a,personality:Object.fromEntries(SCALES.map((s,i)=>[s.id,2+i*.4])),roles:Object.fromEntries(ROLE_INFO.map((s,i)=>[s.id,1+i*.5])),context:Object.fromEntries(CONTEXT_ITEMS.map(s=>[s.id,3])),practices:Object.fromEntries(PRACTICES.map(s=>[s.id,'yes']))};
const fullB={...b,personality:{E:4,A:3,C:2.9,S:4,I:3},roles:{...fullA.roles,dominant:4,switch:4.5},context:{...fullA.context,privacy:5,talkfirst:1},practices:{...fullA.practices,massage:'talk',solo:'talk'}};
test('No selection or boundary-only data never invokes inference; boundaries still have a full rule-based explanation',async()=>{
 let calls=0;const fetcher=()=>{calls++;throw Error('Unexpected inference');};
 assert.equal((await generateSummary(a,b,{fetcher})).status,'insufficient');
 const result=await generateSummary({...a,practices:{toys:'no'}},{...b,practices:{}},{scopes:['practices'],fetcher});
 assert.equal(calls,0);assert.equal(result.summary.analyses[0].topics[0].kind,'boundary');
 assert.equal(result.summary.analyses[0].questions.length,0);
});
test('Full report covers all 35 shared facts exactly once, including all agreements and open preferences',async()=>{
 const r=await generateSummary(fullA,fullB,{scopes:fullA.scopes,fetcher:modelMock()});
 assert.equal(r.status,'ok');
 assert.deepEqual(r.summary.analyses.map(x=>x.topics.length),[5,8,12,10]);
 const ids=r.summary.analyses.flatMap(x=>x.topics.map(t=>t.id));
 assert.equal(new Set(ids).size,35);assert.deepEqual(new Set(ids),new Set(r.facts.map(f=>f.id)));
 const practices=r.summary.analyses.find(x=>x.scope==='practices');
 assert.equal(practices.overview.find(g=>g.kind==='shared').ids.length,8);
 assert.equal(practices.overview.find(g=>g.kind==='talk').ids.length,2);
 assert.deepEqual(practices.questions.map(q=>q.group),['shared','difference']);
 assert.match(practices.topics.find(t=>t.id==='practices:solo').reading,/samostatné aktivity/);
});
test('A/B assignments stay with the person, including when the same person has higher dominance and switch; swapping profiles reverses attribution',async()=>{
 for(const [left,right,winner] of [[fullA,fullB,'B'],[fullB,fullA,'A']]){
  const r=await generateSummary(left,right,{scopes:['roles'],fetcher:modelMock()});
  const report=r.summary.analyses[0];
  for(const id of ['dominant','switch']){
   const t=report.topics.find(t=>t.id==='roles:'+id);
   assert.match(t.observation,new RegExp('Vyšší hodnotu uvádí profil '+winner));
  }
  assert.ok(report.reading.some(t=>t.includes('tentýž profil '+winner)));
 }
});
test('Every direct-choice combination preserves literal answers; maybe is never a shared confirmed interest',()=>{
 for(const x of ['yes','talk','no','unsure'])for(const y of ['yes','talk','no','unsure']){
  const facts=buildAIInput({...a,practices:{massage:x}},{...b,practices:{massage:y}},['practices']).facts;
  const report=coreAnalysis('practices',facts),topic=report.topics[0];
  assert.equal(topic.kind==='shared',x==='yes'&&y==='yes');
  assert.ok(topic.observation.includes(facts[0].A)&&topic.observation.includes(facts[0].B));
  if(topic.kind==='talk'){
   assert.match(topic.reading,/nepotvrzuje zájem/);
   if(x==='talk'&&y==='talk')assert.match(topic.reading,/Oba uvádíte/);
   else assert.match(topic.reading,new RegExp('Profil '+(x==='talk'?'A':'B')+' uvádí'));
  }
 }
});
test('Model cannot insert prose, exchange IDs between groups, drop agreement questions, duplicate groups or choose unknown topics',()=>{
 const groups=questionGroups(coreAnalysis('practices',buildAIInput(fullA,fullB,['practices']).facts));
 assert.equal(validateSelection(selected(groups),groups).length,2);
 for(const value of [
  {...selected(groups),text:'A wants everything'},
  {selections:[selected(groups).selections[0]]},
  {selections:[selected(groups).selections[0],selected(groups).selections[0]]},
  {selections:groups.map((g,i)=>({group:g.id,topicId:groups[1-i].options[0].id}))},
  {selections:groups.map(g=>({group:g.id,topicId:'roles:dominant'}))},
  {selections:groups.map(g=>({group:g.id,topicId:g.options[0].id,question:'Maybe means yes'}))}
 ])assert.throws(()=>validateSelection(value,groups));
});
test('Model failure or malicious prose cannot change the report; invalid output is not exposed',async()=>{
 const baseline=await generateSummary(fullA,fullB,{scopes:fullA.scopes,fetcher:offline});
 const attack=await generateSummary(fullA,fullB,{scopes:fullA.scopes,fetcher:modelMock(x=>({...x,reading:'B always wants it; A is switch'}))});
 assert.equal(attack.status,'partial');assert.equal(JSON.stringify(attack).includes('always wants'),false);
 assert.deepEqual(attack.summary,baseline.summary);
 assert.deepEqual(attack.summary.analyses.map(x=>x.aiStatus),['rules','rules','rules','rules']);
});
test('AI receives only permitted topics in selected categories, never identity, boundaries or unknown answers',async()=>{
 const calls=[];
 const fetcher=async(url,options)=>{if(options?.body)calls.push(JSON.parse(options.body));return modelMock()(url,options);};
 await generateSummary({...a,secret:'SECRET',id:'ACCOUNT'},{...b,id:'PEER'},{scopes:['practices'],fetcher});
 const body=JSON.stringify(calls);
 for(const text of ['SECRET','ACCOUNT','PEER','practices:toys','practices:kiss','personality:'])assert.equal(body.includes(text),false);
 assert.ok(body.includes('practices:cuddle'));
});
test('Equal numeric answers remain numeric equality, not interest; nearest values are not a similarity threshold',async()=>{
 const equal=await generateSummary(a,a,{scopes:['personality'],fetcher:offline});
 const p=equal.summary.analyses[0];assert.equal(p.topics.length,5);assert.ok(p.topics.every(t=>t.kind==='equal'));
 assert.ok(p.questions.every(q=>q.group==='shared'));assert.equal(p.topics.some(t=>t.reading.startsWith('Rozdíl')),false);
 const varied=coreAnalysis('personality',buildAIInput(fullA,fullB,['personality']).facts);
 assert.ok(varied.overview.find(g=>g.kind==='closest').text.includes('Nemáme ověřený práh'));
});
test('Each present dimension has a meaningful explanation and the rendered question is exactly from its catalogue',async()=>{
 const r=await generateSummary(fullA,fullB,{scopes:fullA.scopes,fetcher:modelMock()});
 for(const report of r.summary.analyses){
  for(const t of report.topics)assert.ok(t.reading.length>100,t.id);
  for(const q of report.questions)assert.equal(q.question,report.topics.find(t=>t.id===q.id).question);
 }
});
