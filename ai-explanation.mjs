import {buildAIInput,AI_SCOPES} from './dist/ai-input.mjs';
import {coreAnalysis,questionGroups} from './analysis-core.mjs';
export const PROMPT_VERSION='grounded-analysis-5.0';
export const summarySchema={type:'object',additionalProperties:false,properties:{selections:{type:'array',minItems:1,maxItems:3,items:{type:'object',additionalProperties:false,properties:{group:{type:'string'},topicId:{type:'string'}},required:['group','topicId']}}},required:['selections']};
export function promptFor(report){return [
 {role:'system',content:'Pomáháš dvěma dospělým vybrat otázky pro společný rozhovor. Samotný rozbor je už hotový a zahrnuje všechny sdílené podklady. Z KAŽDÉ dodané skupiny vyber právě jednu otázku, která je konkrétní a dává smysl v této kategorii. Vrať jen její group a topicId podle schématu. Otázky, odpovědi ani významy nepřepisuj, nepřidávej text. Skupiny rozlišují společné body, nejbližší hodnoty a rozdílné či otevřené odpovědi. „Možná / chci probrat“ není potvrzený zájem. Výběr není psychologické hodnocení ani určení důležitosti pro vztah.'},
 {role:'user',content:JSON.stringify({category:AI_SCOPES[report.scope],groups:questionGroups(report)})}
];}
export function validateSelection(value,groups){
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).join()!=='selections'||!Array.isArray(value.selections)||value.selections.length!==groups.length)throw Error('Neplatný výběr otázek.');
 const seen=new Set();
 for(const selected of value.selections){
  if(!selected||Object.keys(selected).sort().join()!=='group,topicId'||seen.has(selected.group))throw Error('Neplatný výběr otázek.');
  const group=groups.find(g=>g.id===selected.group);
  if(!group||!group.options.some(t=>t.id===selected.topicId))throw Error('Otázka nepatří do dodané skupiny.');
  seen.add(selected.group);
 }
 return groups.map(group=>({group:group.id,label:group.label,...group.options.find(t=>t.id===value.selections.find(s=>s.group===group.id).topicId)}));
}
export async function generateSummary(a,b,{scopes=[],fetcher=fetch,base='http://127.0.0.1:8080',audit=false}={}){
 const input=buildAIInput(a,b,scopes),facts=input.facts,metadata={facts,scopes:input.scopes,promptVersion:PROMPT_VERSION};
 if(!facts.length)return {...metadata,status:'insufficient',summary:null,message:'Ve vybraných kategoriích chybí společné podklady. Chybějící ani soukromé odpovědi nedoplňujeme.'};
 const analyses=input.scopes.map(scope=>coreAnalysis(scope,facts.filter(f=>f.scope===scope)));
 const start=Date.now(),issues=[],rawOutputs=[],deadline=AbortSignal.timeout(60000);
 let model=null;
 if(analyses.some(r=>questionGroups(r).length))try{
  const response=await fetcher(base+'/v1/models',{signal:AbortSignal.timeout(10000)});
  if(response.ok)model=(await response.json()).data?.[0]?.id||null;
 }catch{/* A full deterministic report does not depend on model availability. */}
 for(const analysis of analyses){
  const groups=questionGroups(analysis);
  analysis.questions=groups.map(g=>({group:g.id,label:g.label,...g.options[0]}));
  analysis.aiStatus='rules';
  if(!groups.length)continue;
  try{
   if(!model)throw Error('AI není dostupná; otázky vybral web podle pravidel.');
   const schema=JSON.parse(JSON.stringify(summarySchema));
   schema.properties.selections.minItems=schema.properties.selections.maxItems=groups.length;
   schema.properties.selections.items.properties.group.enum=groups.map(g=>g.id);
   schema.properties.selections.items.properties.topicId.enum=groups.flatMap(g=>g.options.map(t=>t.id));
   const response=await fetcher(base+'/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model,messages:promptFor(analysis),stream:false,temperature:0,seed:42,max_tokens:300,chat_template_kwargs:{enable_thinking:false},response_format:{type:'json_object',schema}}),signal:deadline});
   if(!response.ok)throw Error('AI výběr není dostupný; otázky vybral web podle pravidel.');
   const result=await response.json(),choice=result.choices?.[0],raw=choice?.message?.content;
   if(audit)rawOutputs.push({scope:analysis.scope,raw});
   if(choice?.finish_reason!=='stop')throw Error('AI výběr nebyl dokončen; otázky vybral web podle pravidel.');
   analysis.questions=validateSelection(JSON.parse(raw),groups);
   analysis.aiStatus='selected';
  }catch{issues.push({scope:analysis.scope,message:'Otázky vybral web podle pravidel. Úplný rozbor zůstává dostupný.'});}
  // Safe compatibility for older open tabs: never forward model-authored prose.
  analysis.example='Každý můžete dokončit větu: „Tahle odpověď pro mě znamená…“ a přidat jeden příklad ze života i jednu výjimku. Druhý nejprve ověří, zda správně rozuměl. Podobnost výsledku ani rozdíl sám za vás neodpoví.';
  analysis.question=analysis.questions.map(q=>q.question).join(' ');
 }
 const summary={analyses,explanations:analyses.map(x=>({dimensions:x.dimensions,text:x.reading.join('\n\n')})),questions:analyses.flatMap(x=>x.questions.map(q=>({dimensions:[q.id],text:q.question})))};
 return {...metadata,status:issues.length?'partial':'ok',summary,model:model?.split('/').at(-1)||null,seconds:Math.round((Date.now()-start)/100)/10,issues,message:issues.map(i=>AI_SCOPES[i.scope]+': '+i.message).join(' '),...(audit?{rawOutputs}:{})};
}
