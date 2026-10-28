import test from 'node:test';
import assert from 'node:assert/strict';
import {ITEMS} from '../dist/instrument.mjs';
import {ROLE_INFO,ROLE_ITEMS,CONTEXT_ITEMS,PRACTICES,INTIMACY_PAGES,roleScores,intimateCount,validIntimate,temperament,intimateExport,contextHighlights} from '../dist/extensions-data.mjs';

test('Every intimate item is in exactly one page; domains stay separate',()=>{
  const ids=INTIMACY_PAGES.flatMap(p=>p.items.map(x=>x.id));
  assert.equal(ids.length,38);assert.equal(new Set(ids).size,38);
  assert.equal(ROLE_ITEMS.length,16);assert.equal(CONTEXT_ITEMS.length,12);assert.equal(PRACTICES.length,10);
  for(const role of ROLE_INFO)assert.equal(ROLE_ITEMS.filter(x=>x.role===role.id).length,2);
});
test('Roles may coexist; switch is not inferred from other interests',()=>{
  const answers={'dominant-1':5,'dominant-2':4,'submissive-1':4,'submissive-2':5,'sadistic-1':1,'sadistic-2':2};
  const scores=Object.fromEntries(roleScores(answers).map(x=>[x.id,x]));
  assert.equal(scores.dominant.mean,4.5);assert.equal(scores.submissive.mean,4.5);
  assert.equal(scores.sadistic.mean,1.5);assert.equal(scores.switch.mean,null);
});
test('Unknown, private, malformed, and missing answers never imply low interest',()=>{
  for(const value of [undefined,null,'na','skip','3',0,6,2.5]){
    const role=roleScores({'dominant-1':5,'dominant-2':value})[0];assert.equal(role.mean,null);assert.equal(role.band,'incomplete');
  }
  assert.equal(intimateCount({'dominant-1':'na','dominant-2':'skip',oral:'no',foo:5,desire:9}),3);
  assert.equal(validIntimate('oral','yes'),true);assert.equal(validIntimate('oral',5),false);
  assert.equal(contextHighlights({stress:5,privacy:'na',desire:2}).length,1);
  const report=intimateExport({'dominant-1':'skip'});assert.equal(report.roles[0].mean,null);assert.match(report.status,/Nevalidovaný/);
});
function withMeans(e,s){const answers=Object.fromEntries(ITEMS.map(x=>[x.id,3]));for(const scale of ['E','S']){const sum=Math.round((scale==='E'?e:s)*10);let left=sum-10;for(const item of ITEMS.filter(x=>x.scale===scale)){const value=1+Math.min(4,left);left-=value-1;answers[item.id]=item.reverse?6-value:value;}}return answers;}
test('Historical map has correct axis orientation and neutral band boundaries',()=>{
  assert.equal(temperament(withMeans(4,4)).type,'Sangvinik');
  assert.equal(temperament(withMeans(4,2)).type,'Cholerik');
  assert.equal(temperament(withMeans(2,4)).type,'Flegmatik');
  assert.equal(temperament(withMeans(2,2)).type,'Melancholik');
  assert.equal(temperament(withMeans(3,4)).centre,true);
  assert.equal(temperament(withMeans(3.4,2)).centre,true);
  assert.equal(temperament(withMeans(3.5,2.5)).type,'Cholerik');
});
test('Temperament requires both complete underlying scales, no filling in',()=>{
  const answers=withMeans(4,2);delete answers[1];assert.equal(temperament(answers).complete,false);
  const otherMissing=withMeans(4,2);delete otherMissing[2];assert.equal(temperament(otherMissing).complete,true);
});
