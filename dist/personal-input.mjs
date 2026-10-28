import {SCALES,VERSION} from './instrument.mjs';
import {ROLE_INFO,CONTEXT_ITEMS,PRACTICES,PRACTICE_CHOICES,INTIMACY_VERSION} from './extensions-data.mjs';
import {selectForAI,AI_SCOPES} from './ai-input.mjs';

export const PERSONAL_VERSION='personal-reflection-1.0';
export const PERSONAL_SCOPES=AI_SCOPES;
export function personalServiceProfile(profile,scopes=['personality']){
  const clean=selectForAI(profile,scopes.filter(s=>s!=='practices'));
  if(clean.context)for(const [id,v] of Object.entries(clean.context))if(v==='na')delete clean.context[id];
  return clean;
}
const band=v=>v<=2.5?'lower':v>=3.5?'higher':'middle';
const position={lower:'nižší část stupnice',middle:'okolí středu stupnice',higher:'vyšší část stupnice'};
export function personalInput(profile,scopes=['personality']){
  const clean=selectForAI(profile,scopes),facts=[],missing=[];
  for(const scope of clean.scopes){
    const definitions={personality:SCALES,roles:ROLE_INFO,context:CONTEXT_ITEMS,practices:PRACTICES}[scope];
    const compatible=scope==='personality'?clean.ipipVersion===VERSION:clean.intimacyVersion===INTIMACY_VERSION;
    for(const def of definitions){
      const v=compatible?clean[scope]?.[def.id]:undefined;
      if(v===undefined){missing.push({scope,id:def.id});continue;}
      const numeric=typeof v==='number',id=scope+':'+def.id;
      let reading,question,limit,modelEligible=numeric;
      if(scope==='personality'){
        reading=def[band(v)];question=def.reflect.join(' ');limit=def.limit;
      }else if(scope==='roles'){
        reading=`Odpovědi k této roli jsou v oblasti: ${position[band(v)]}. ${def.description}`;
        question='Znamená pro tebe tato odpověď fantazii, zájem o rozhovor, zkušenost, nebo něco jiného? Ve které situaci by to naopak nesedělo?';
        limit='Průměr popisuje vlastní deklarovaný zájem, ne identitu, zkušenost ani přání ohledně partnerovy role. Jedna role neurčuje ostatní.';
      }else if(scope==='context'){
        reading=numeric?`U výroku „${def.text}“ volíš ${v} z 5. ${v>=4?def.insight:v<=2?'Výrok tě podle této odpovědi spíše nevystihuje. Nevyvozujeme z toho opačnou vlastnost.':'Střední odpověď nechává prostor pro různé situace; sama neříká, které to jsou.'}`:'U tohoto výroku uvádíš „Nevím / netýká se mě“. Význam za tebe nedoplňujeme.';
        question=def.question;limit='Jedna vlastní nevalidovaná otázka. Nejde o měření schopnosti, zdravotního stavu ani chování v konkrétní situaci.';
      }else{
        modelEligible=false;
        reading={yes:'Uvádíš, že tě tato aktivita láká. Zájem není zkušenost ani souhlas s konkrétní situací.',talk:'Uvádíš „Možná / chci probrat“. Je to otevřená možnost rozhovoru, nikoli potvrzený zájem nebo příslib aktivity.',no:'Uvádíš „Nechci“. Tuto hranici není třeba obhajovat ani překonávat.',unsure:'Uvádíš „Nevím“. Z odpovědi nevyvozujeme zájem ani nezájem.'}[v];
        question=v==='no'?'Jak chceš tuto hranici vyjádřit, pokud ji budeš chtít s někým sdílet?':v==='yes'?'Co přesně pro tebe tento zájem znamená a v jakém kontextu by neplatil?':'Chceš o tomto tématu vůbec mluvit, nebo ho nyní raději nechat otevřené?';
        limit='Přesné znění tvé volby. AI tuto oblast nepřepisuje a žádné další preference nedoplňuje.';
      }
      facts.push({id,scope,name:def.name||def.text,value:numeric?v:v==='na'?'Nevím / netýká se mě':PRACTICE_CHOICES[v],reading,question,limit,modelEligible});
    }
  }
  return {version:PERSONAL_VERSION,scopes:clean.scopes,facts,missing};
}
export function personalModelGroups(input){
  return ['personality','roles','context'].map(scope=>({scope,name:PERSONAL_SCOPES[scope],facts:input.facts.filter(f=>f.scope===scope&&f.modelEligible).map(({id,name,value,reading,question,limit})=>({id,name,value,reading,question,limit,...(scope==='roles'?{interpretation:value<=2.5?'SPÍŠE MENŠÍ deklarovaný zájem. Nepopisuj jako zájem ani proměnlivou preferenci.':value>=3.5?'SPÍŠE VĚTŠÍ deklarovaný zájem. Není to zkušenost, identita ani souhlas.':'STŘED odpovědí. Bez závěru o přítomnosti zájmu nebo jeho proměnlivosti.'}:scope==='context'?{interpretation:value<=2?'SPÍŠE NESOUHLAS s výrokem. Nevyvozuj opačnou vlastnost.':value>=4?'SPÍŠE SOUHLAS s výrokem. Vlastní popis, nikoli prokázaná schopnost.':'NEJEDNOZNAČNÁ prostřední odpověď. Neuváděj jako jistý faktor.'}:{})}))})).filter(g=>g.facts.length);
}
