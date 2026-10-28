import {SCALES,VERSION} from './instrument.mjs';
import {ROLE_INFO,CONTEXT_ITEMS,PRACTICES,PRACTICE_CHOICES,INTIMACY_VERSION} from './extensions-data.mjs';
import {compareProfiles} from './comparison.mjs?v=3.5';

export const AI_SCOPES={personality:'Osobnost · Big Five',roles:'Intimní role',context:'Podmínky pro intimitu',practices:'Preference aktivit'};
const numeric=v=>typeof v==='number'&&Number.isFinite(v)&&v>=1&&v<=5;
const definitions={personality:SCALES,roles:ROLE_INFO,context:CONTEXT_ITEMS,practices:PRACTICES};
export function selectForAI(profile,scopes=[]){
  const selected=Object.keys(AI_SCOPES).filter(s=>Array.isArray(scopes)&&scopes.includes(s)&&Array.isArray(profile?.scopes)&&profile.scopes.includes(s));
  const clean={scopes:selected,ipipVersion:profile?.ipipVersion===VERSION?VERSION:null,intimacyVersion:profile?.intimacyVersion===INTIMACY_VERSION?INTIMACY_VERSION:null};
  for(const scope of selected){
    clean[scope]={};
    for(const {id} of definitions[scope]){
      const v=profile?.[scope]?.[id];
      const valid=scope==='practices'?['yes','talk','no','unsure'].includes(v):scope==='context'?(numeric(v)&&Number.isInteger(v))||v==='na':numeric(v);
      if(valid)clean[scope][id]=v;
    }
  }
  return clean;
}
export function buildAIInput(a,b,scopes=[]){
  const left=selectForAI(a,scopes),right=selectForAI(b,scopes),comparison=compareProfiles(left,right),facts=[];
  for(const scope of ['personality','roles','context'])for(const row of comparison[scope]){
    if(row.complete)facts.push({id:scope+':'+row.id,scope,name:row.name,A:row.a,B:row.b,difference:row.delta,kind:'numeric',...(scope==='roles'?{meaning:ROLE_INFO.find(r=>r.id===row.id).description}:{})});
  }
  for(const row of comparison.practices){
    const av=left.practices?.[row.id],bv=right.practices?.[row.id];
    // Preserve an explicit boundary even when the other person left the item blank.
    if((av!==undefined&&bv!==undefined)||av==='no'||bv==='no')facts.push({id:'practices:'+row.id,scope:'practices',name:row.name,A:row.a,B:row.b,kind:row.kind});
  }
  const available=Object.fromEntries(Object.keys(AI_SCOPES).map(scope=>[scope,facts.filter(f=>f.scope===scope).length]));
  return {facts,available,scopes:Object.keys(AI_SCOPES).filter(s=>available[s]>0),warnings:comparison.warnings};
}
export function factValues(f){return f.kind==='numeric'?`A: ${f.A} / 5 · B: ${f.B} / 5`:`A: ${f.A} · B: ${f.B}`;}
export function factNote(f){
  if(f.kind==='boundary')return 'Hranice k respektování. „Nechci“ není výzva k přemlouvání ani hledání kompromisu v dané aktivitě.';
  if(f.kind==='unknown')return 'Bez závěru. „Nevím“ nebo chybějící odpověď neznamená zájem ani souhlas.';
  if(f.kind==='shared')return 'Oba uvedli zájem. Společný zájem není souhlas s konkrétní situací.';
  if(f.kind==='talk')return 'Možnost rozhovoru. „Možná / chci probrat“ není souhlas ani připravenost aktivitu zkoušet.';
  if(f.scope==='roles')return 'Průměr zájmu o vlastní roli; neříká, jakou roli člověk chce u partnera. Role se automaticky nedoplňují.';
  if(f.scope==='context')return 'Odpovědi na jeden výrok, nikoli diagnóza nebo předpověď chování.';
  return 'Průměry nevalidovaného českého překladu. Bez populačních norem a posouzení významnosti rozdílu.';
}
