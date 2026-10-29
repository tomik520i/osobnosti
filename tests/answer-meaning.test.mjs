import test from 'node:test';
import assert from 'node:assert/strict';
import {ITEMS,ANCHORS,score} from '../dist/instrument.mjs';
import {ROLE_ITEMS,CONTEXT_ITEMS,PRACTICES,PRACTICE_CHOICES} from '../dist/extensions-data.mjs';
import {PERSONALITY_HELP,INTIMACY_HELP,questionHelp} from '../dist/question-help.mjs';
import {ANSWER_DIRECTIONS,answerMeaning,intimacyAnswerMeaning,answerLabel,answerAria} from '../dist/answer-direction.mjs';
import {createExtensions} from '../dist/extensions.mjs';

test('Rarely/never and often sadness have opposite answer directions and consistent scoring',()=>{
 assert.equal(answerMeaning(19,5),'Sklíčenost zažívám zřídka nebo vůbec.');
 assert.equal(answerMeaning(49,1),answerMeaning(19,5));
 assert.equal(answerMeaning(19,1),answerMeaning(49,5));
 const make=n=>Object.fromEntries(ITEMS.filter(x=>x.scale==='S').map(x=>[x.id,x.reverse?6-n:n]));
 assert.equal(score(make(5)).find(x=>x.id==='S').mean,5);
 assert.equal(make(5)[19],5);assert.equal(make(5)[49],1);
});
test('Negative wording is explained from its meaning, not inverted blindly using the scoring key',()=>{
 assert.equal(answerMeaning(20,1),'Abstraktní myšlenky mě zajímají.');
 assert.equal(answerMeaning(20,5),'Abstraktní myšlenky mě nezajímají.');
 assert.equal(ITEMS.find(x=>x.id===41).reverse,false);
 assert.equal(answerMeaning(41,5),'Být středem pozornosti mi nevadí.');
 assert.equal(Object.keys(ANSWER_DIRECTIONS).length,30);
 for(const item of ITEMS)for(let n=1;n<=5;n++){
  const html=answerLabel('personality',item.id,n,ANCHORS[n-1]);
  assert.ok(html.includes(ANCHORS[n-1]));
  if(n>1&&n<5)assert.equal(html,ANCHORS[n-1]);
 }
});
test('All 88 questions have explanations; intimacy interest, uncertainty and experience stay separate',()=>{
 assert.equal(Object.keys(PERSONALITY_HELP).length,50);assert.equal(Object.keys(INTIMACY_HELP).length,38);
 for(const q of ITEMS)assert.ok(questionHelp('personality',q.id,q.cs));
 for(const q of [...ROLE_ITEMS,...CONTEXT_ITEMS,...PRACTICES])assert.ok(questionHelp('intimacy',q.id,q.text||q.name));
 for(const q of [...ROLE_ITEMS,...CONTEXT_ITEMS]){
  assert.ok(intimacyAnswerMeaning(q.id,1));assert.ok(intimacyAnswerMeaning(q.id,5));
  assert.equal(intimacyAnswerMeaning(q.id,3),'');assert.equal(intimacyAnswerMeaning(q.id,'na'),'');
 }
 assert.equal(intimacyAnswerMeaning('desire',5),'Sexuální zájem se u mě někdy objeví sám.');
 assert.equal(PRACTICE_CHOICES.talk,'Možná / chci probrat');
 assert.notEqual(PRACTICE_CHOICES.no,PRACTICE_CHOICES.unsure);
});
test('Visible and accessible choices preserve full anchors and escape text',()=>{
 assert.match(answerLabel('personality',19,5,ANCHORS[4]),/Sklíčenost zažívám zřídka nebo vůbec/);
 assert.match(answerAria('personality',19,5,ANCHORS[4]),/5 — Sklíčenost.*Velmi mě vystihuje/);
 assert.doesNotMatch(answerLabel('personality',1,1,'<img onerror="bad">'),/<img/);
 assert.match(answerAria('intimacy','desire',5,'"<x>'),/&quot;&lt;x&gt;/);
});
test('Intimacy form renders actual choice meanings independently of result-answer labels',t=>{
 t.mock.method(globalThis,'setTimeout',()=>0);
 const previous=globalThis.document;
 globalThis.document={addEventListener(){}};
 t.after(()=>{if(previous===undefined)delete globalThis.document;else globalThis.document=previous;});
 let html='';
 const view=createExtensions({show:s=>{html=s;},go(){},getAnswers:()=>({})});
 for(let step=0;step<7;step++){
  view.restore({},step);view.route('#intimita-dotaznik');
  assert.equal((html.match(/class="answer-meaning"/g)||[]).length,8);
  assert.ok(html.includes('Spíše mě nevystihuje'));
  assert.doesNotMatch(html,/<span>Bez odpovědi<\/span>/);
 }
});
