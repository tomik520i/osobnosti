import test from 'node:test';
import assert from 'node:assert/strict';
import {LOCAL_PROFILE_KEY,createLocalProfileStore,decodeDraft,cleanDraft} from '../dist/local-profile.mjs';
import {score} from '../dist/instrument.mjs';
import {roleScores} from '../dist/extensions-data.mjs';

function memory(){const values=new Map();return {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};}
const draft={personality:{1:4,2:2,3:3},intimacy:{'dominant-1':4,'dominant-2':5,'submissive-1':'na',solo:'skip',toys:'no'},personalityStep:3,intimacyStep:7,finishedAt:'2026-10-27T08:00:00.000Z'};

test('No browser data is written until remembering is explicitly enabled; reopening restores both modules and progress',()=>{
  const storage=memory(),first=createLocalProfileStore(()=>storage);
  assert.equal(first.load(),null);assert.equal(first.save(draft),false);assert.equal(storage.getItem(LOCAL_PROFILE_KEY),null);
  assert.equal(first.enable(draft),true);
  const reopened=createLocalProfileStore(()=>storage),restored=reopened.load();
  assert.deepEqual(restored,draft);assert.equal(reopened.info().saved,true);
  assert.deepEqual(score(restored.personality),score(draft.personality));
  assert.deepEqual(roleScores(restored.intimacy),roleScores(draft.intimacy));
});
test('Partial erasure survives reopening; complete erasure does not touch other applications',()=>{
  const storage=memory();storage.setItem('other-app','keep');
  const writer=createLocalProfileStore(()=>storage);writer.load();writer.enable(draft);
  writer.save({...draft,intimacy:{},intimacyStep:0});
  assert.deepEqual(createLocalProfileStore(()=>storage).load().intimacy,{});
  assert.deepEqual(createLocalProfileStore(()=>storage).load().personality,draft.personality);
  assert.equal(writer.forget(),true);assert.equal(writer.save(draft),false);
  assert.equal(createLocalProfileStore(()=>storage).load(),null);assert.equal(storage.getItem('other-app'),'keep');
});
test('Credentials, comparison data, unknown fields and invalid answers are excluded from the local copy',()=>{
  const clean=cleanDraft({...draft,key:'SECRET',comparison:[draft],personality:{1:5,2:'5',3:0,4:6,51:2},intimacy:{'dominant-1':4,'dominant-2':99,toys:'no',kiss:{toString:null,valueOf:null},invented:'yes'},personalityStep:99,intimacyStep:-1,finishedAt:'invalid'});
  assert.deepEqual(clean,{personality:{1:5},intimacy:{'dominant-1':4,toys:'no'},personalityStep:0,intimacyStep:0,finishedAt:null});
  assert.equal(JSON.stringify(clean).includes('SECRET'),false);
});
test('Malformed and incompatible storage is not silently restored or overwritten',()=>{
  for(const value of ['{bad','null','[]','x'.repeat(32769),JSON.stringify({version:99,draft})]){
    const storage=memory();storage.setItem(LOCAL_PROFILE_KEY,value);
    const store=createLocalProfileStore(()=>storage);assert.equal(store.load(),null);assert.equal(store.info().status,'invalid');
    assert.equal(store.save(draft),false);assert.equal(storage.getItem(LOCAL_PROFILE_KEY),value);
  }
  assert.equal(decodeDraft(null),null);
});
test('Blocked, full or unerasable storage is reported, never presented as saved or erased',()=>{
  const blocked=createLocalProfileStore(()=>{throw new Error('SecurityError');});
  assert.equal(blocked.load(),null);assert.equal(blocked.info().status,'read-error');assert.equal(blocked.enable(draft),false);
  const storage=memory(),store=createLocalProfileStore(()=>storage);store.load();store.enable(draft);
  const previous=storage.getItem(LOCAL_PROFILE_KEY);
  storage.setItem=()=>{throw new Error('QuotaExceededError');};
  assert.equal(store.save({...draft,personality:{1:1}}),false);assert.equal(store.info().saved,false);
  assert.equal(storage.getItem(LOCAL_PROFILE_KEY),previous);
  storage.removeItem=()=>{throw new Error('SecurityError');};
  assert.equal(store.forget(),false);assert.equal(store.info().status,'delete-error');assert.equal(store.info().enabled,false);
});
test('An older tab cannot overwrite edits or resurrect a deleted profile',()=>{
  const storage=memory(),a=createLocalProfileStore(()=>storage),b=createLocalProfileStore(()=>storage);
  a.load();a.enable(draft);b.load();
  a.save({...draft,personality:{1:1}});
  assert.equal(b.save(draft),false);assert.equal(b.info().conflict,true);
  assert.deepEqual(decodeDraft(storage.getItem(LOCAL_PROFILE_KEY)).personality,{1:1});
  assert.equal(b.enable(draft),false);
  a.forget();assert.equal(b.checkExternal(),'cleared');assert.equal(b.save(draft),false);assert.equal(storage.getItem(LOCAL_PROFILE_KEY),null);
});
