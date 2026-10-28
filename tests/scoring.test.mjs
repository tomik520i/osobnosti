import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {ITEMS,SCALES,VERSION,score,validAnswer,answerCount,exportReport} from '../dist/instrument.mjs';
const evidence=JSON.parse(fs.readFileSync(new URL('./source-fixtures.json',import.meta.url),'utf8'));
const normalise=id=>id==='ES'?'S':id;

test('All 50 original items and keys match independently extracted source',()=>{
  assert.equal(ITEMS.length,50);
  assert.equal(new Set(ITEMS.map(x=>x.id)).size,50);
  for(const original of evidence.originalItems){const actual=ITEMS.find(x=>x.id===original.id);assert.equal(actual.en,original.textEnglishPublicDomain);assert.equal(actual.scale,normalise(original.scale));assert.equal(actual.reverse,original.reverse);assert.ok(actual.cs.length>5);}
  assert.deepEqual(SCALES.map(s=>ITEMS.filter(x=>x.scale===s.id).length),[10,10,10,10,10]);
});
for(const fixture of evidence.fixtures){test(`Independent score fixture: ${fixture.name}`,()=>{
  const answers=Object.fromEntries(fixture.answers.map((value,index)=>[index+1,value]));
  for(const result of score(answers)){const expected=fixture.expected[result.id==='S'?'ES':result.id];assert.equal(result.sum,expected.sum);assert.equal(result.mean,expected.mean);assert.equal(result.complete,true);assert.equal(result.answered,10);}
});}
test('Missing or invalid answers never get filled in or partially averaged',()=>{
  const answers=Object.fromEntries(ITEMS.map(x=>[x.id,3]));
  for(const value of [undefined,null,'3',NaN,0,6,2.5,Infinity]){
    const incomplete=score({...answers,1:value});assert.equal(incomplete[0].sum,null);assert.equal(incomplete[0].mean,null);assert.equal(incomplete[0].band,null);assert.equal(incomplete[0].answered,9);assert.ok(incomplete.slice(1).every(x=>x.mean===3));
  }
  assert.ok(score({}).every(s=>s.mean===null&&s.answered===0));
});
test('Single reverse answer moves only its own scale in the right direction',()=>{
  const answers=Object.fromEntries(ITEMS.map(x=>[x.id,3]));
  answers[4]=5;
  assert.equal(score(answers).find(x=>x.id==='S').mean,2.8);
  answers[4]=1;
  assert.equal(score(answers).find(x=>x.id==='S').mean,3.2);
});
test('Export has correct missing values, version, warnings and source links',()=>{
  const report=exportReport({1:4,2:0,3:null,51:5},new Date('2026-10-27T12:00:00Z'));
  assert.equal(report.version,VERSION);assert.match(report.translation,/NOT psychometrically validated/);assert.match(report.norms,/No Czech norms/);assert.equal(report.answers.length,50);assert.deepEqual(report.answers.slice(0,3),[{id:1,answer:4},{id:2,answer:null},{id:3,answer:null}]);assert.equal(answerCount({1:4,2:0,3:null,51:5}),1);assert.equal(report.scales[0].mean,null);assert.equal(validAnswer('4'),false);
});
