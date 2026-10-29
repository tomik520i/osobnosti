import test from 'node:test';
import assert from 'node:assert/strict';
import {createRetakes,RETAKE_KEY} from '../dist/retake.mjs';
import {createLocalProfileStore} from '../dist/local-profile.mjs';
import {testCards} from '../dist/journey.mjs';
const memory=()=>{const data=new Map();return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};};
const original={personality:Object.fromEntries(Array.from({length:50},(_,i)=>[i+1,3])),personalityStep:9,intimacy:{'dominant-1':2,'dominant-2':2,oral:'no'},intimacyStep:7,finishedAt:'2026-10-29T20:00:00.000Z'};

test('A finished test retains its result and offers its own independent new attempt',()=>{
  const html=testCards(original.personality,{});
  assert.match(html,/href="#vysledky"/);assert.match(html,/data-action="retake" data-scope="personality"/);
  assert.match(html,/href="#intimita"/);assert.doesNotMatch(html,/data-action="retake" data-scope="intimacy"/);
  assert.match(testCards(original.personality,{},['personality']),/Pokračovat v novém pokusu/);
});
test('A new attempt cannot leak into persistent answers, results, exports or account input before acceptance',()=>{
  const tab=memory(),disk=memory(),retakes=createRetakes(()=>tab),saved=createLocalProfileStore(()=>disk);
  saved.load();saved.enable(original);retakes.begin('personality',original);
  const working={...original,personality:{1:5},personalityStep:2,finishedAt:null};
  retakes.checkpoint(working);saved.save(retakes.published(working));
  assert.deepEqual(retakes.published(working),original);
  assert.deepEqual(createLocalProfileStore(()=>disk).load(),original);
  const resumed=createRetakes(()=>tab),restored=resumed.restore(original);
  assert.equal(restored.rejected,false);assert.deepEqual(restored.draft,working);
  assert.deepEqual(resumed.published(restored.draft),original);
});
test('Keeping the old result, accepting a new one, and two simultaneous attempts are scoped independently',()=>{
  const tab=memory(),retakes=createRetakes(()=>tab);
  retakes.begin('personality',original);retakes.begin('intimacy',original);
  const working={...original,personality:{1:5},intimacy:{oral:'talk'},personalityStep:0,intimacyStep:0,finishedAt:null};
  retakes.checkpoint(working);const old=retakes.original('personality');
  working.personality=old.answers;working.personalityStep=old.step;working.finishedAt=old.finishedAt;retakes.end('personality');
  assert.deepEqual(retakes.published(working),original);assert.equal(retakes.has('intimacy'),true);
  retakes.end('intimacy');assert.deepEqual(retakes.published(working).intimacy,{oral:'talk'});
  assert.deepEqual(retakes.published(working).personality,original.personality);
  assert.equal(tab.getItem(RETAKE_KEY),null);
});
test('Reload rejects an attempt whose base was changed or deleted; clearing one module does not clear the other',()=>{
  for(const changed of [{...original,personality:{1:1}},{...original,personality:{}},{...original,finishedAt:'2026-10-30T12:00:00.000Z'}]){
    const tab=memory(),a=createRetakes(()=>tab);a.begin('personality',original);a.checkpoint({...original,personality:{1:5}});
    const b=createRetakes(()=>tab),result=b.restore(changed);assert.equal(result.rejected,true);assert.deepEqual(result.draft,changed);assert.equal(b.has('personality'),false);
  }
  const tab=memory(),a=createRetakes(()=>tab);a.begin('personality',original);a.begin('intimacy',original);a.clear('intimacy');
  const b=createRetakes(()=>tab);b.restore(original);assert.equal(b.has('personality'),true);assert.equal(b.has('intimacy'),false);b.clear();assert.equal(tab.getItem(RETAKE_KEY),null);
});
test('Blocked storage keeps the original result intact and reports the new attempt as unsaved',()=>{
  const retakes=createRetakes(()=>({getItem:()=>null,setItem:()=>{throw Error('blocked');},removeItem:()=>{throw Error('blocked');}}));
  assert.equal(retakes.begin('personality',original),true);assert.equal(retakes.isSaved(),false);
  assert.deepEqual(retakes.published({...original,personality:{1:5}}),original);
});
