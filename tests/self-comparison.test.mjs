import test from 'node:test';
import assert from 'node:assert/strict';
import {currentPublicProfile} from '../dist/self-comparison.mjs';
import {compareProfiles} from '../dist/comparison.mjs';
import {buildAIInput} from '../dist/ai-input.mjs';
test('Compare with me shares only selected categories and excludes private choices',()=>{
  const p=Object.fromEntries(Array.from({length:50},(_,i)=>[i+1,3])),i={'dominant-1':5,'dominant-2':4,cuddle:'yes',toys:'skip'};
  const plain=currentPublicProfile(p,i);assert.deepEqual(plain.scopes,['personality']);assert.equal(plain.roles,undefined);
  const selected=currentPublicProfile(p,i,['personality','roles','practices','bad']);assert.equal(selected.roles.dominant,4.5);assert.equal(selected.roles.switch,null);assert.equal(selected.practices.toys,undefined);
  const peer={...selected,scopes:['roles']};assert.deepEqual(compareProfiles(selected,peer).common,['roles']);assert.deepEqual(buildAIInput(selected,peer,['personality']).facts,[]);assert.equal(buildAIInput(selected,peer,['roles']).facts.length,1);
});
test('Incomplete local scales remain unknown in comparison',()=>{
  const local=currentPublicProfile({1:5},{},['personality']);
  const peer=currentPublicProfile(Object.fromEntries(Array.from({length:50},(_,i)=>[i+1,3])),{});
  assert.deepEqual(buildAIInput(local,peer,['personality']).facts,[]);
});
