import {personalInput,personalModelGroups,PERSONAL_VERSION} from './dist/personal-input.mjs';

const fields=['situation','useful','watch','fits','exception'];
export function personalSchema(groups){
  return {type:'object',additionalProperties:false,required:['chapters'],properties:{chapters:{type:'array',minItems:groups.length,maxItems:groups.length,items:{type:'object',additionalProperties:false,required:['scope',...fields],properties:{scope:{type:'string',enum:groups.map(g=>g.scope)},...Object.fromEntries(fields.map(k=>[k,{type:'string',minLength:35,maxLength:650}]))}}}}};
}
export function personalPrompt(groups){return [
  {role:'system',content:`Píšeš česky orientační osobní rozbor pro sebereflexi dospělého člověka. Podkladem jsou jen dodané odpovědi a jejich vlastní, nevalidované interpretační texty. Nemáš anamnézu ani populační normy. Skóre neměň a v textu nepoužívej čísla, procenta ani percentily. Čísla zobrazuje web samostatně.
Vrať přesně jednu kapitolu pro každou dodanou scope, v pořadí vstupu. Člověk chce podrobný užitečný rozbor, ne stručné shrnutí. Dodrž délku polí ze schématu.
Význam všech jednotlivých odpovědí zobrazí web podle pevných pravidel. Ty ho znovu neshrnuj. Rozveď konkrétní příklad a možné souvislosti, vždy jako hypotézu k ověření. Střed neoznačuj jako jisté střídání protikladů. Nevymýšlej konflikt mezi otevřeností a řádem jen proto, že obě škály existují.
situation: dvě až tři věty s jedním výslovně hypotetickým běžným příkladem. Pojmenuj konkrétní spouštěč, možnou reakci a to, co by šlo pozorovat. Například domlouvání setkání, změna plánu či rozhovor o potřebách; žádná tvrzení o skutečné minulosti uživatele. Nestačí „v klidném prostředí bys mohl být v pohodě“.
useful: dvě konkrétní věty. Nabídni jeden malý dobrovolný krok a způsob, jak poznat, zda mu pomohl. Žádné obecné „zamysli se“ ani „prober si různé scénáře“. V intimních kapitolách pouze pozorování nebo dobrovolná komunikace, nikdy doporučení zkoušet sexuální aktivitu.
watch: dvě až tři věty o konkrétním možném nedorozumění, které odpovídá dodanému podkladu. Vysvětli, proč by si někdo reakci mohl vyložit jinak, a nabídni nenátlakovou možnost vyjasnění. Nevytvářej problém tam, kde jej odpovědi nenaznačují; výslovně připusť, že se člověka nemusí týkat.
fits: otázka po konkrétním příkladu z poslední doby, kdy výklad sedí. exception: rovnocenná otázka po konkrétní situaci, kdy NESedí, a co bylo jinak. Nepodsouvej v otázce jiný rys ani opačnou preferenci; nesváděj nesouhlas na chybu člověka.
V situation, useful a watch mluv podmíněně: může, mohl, pokud, možná. Nevytvářej lichotivý univerzální portrét. Střed stupnice není průměr populace. Malé rozdíly ani nejvyšší hodnota mezi různými škálami neznamenají dominantní rys. Chybějící oblast neodhaduj. Nevymýšlej příčiny, trauma, diagnózy, zkušenosti, orientaci, gender, inteligenci, profesi, vztahový styl ani budoucnost.
Kapitoly drž odděleně. Z osobnosti nevyvozuj intimitu a z intimní role osobnost. Intimní role je jen vlastní deklarovaný zájem, ne identita, partnerova role, zkušenost ani souhlas. U rolí je pole interpretation závazné: SPÍŠE MENŠÍ zájem nesmíš označit jako zájem, proměnlivost ani ochotu zkoušet. STŘED není potvrzený zájem a neříká nic o střídání rolí. Nevymýšlej aktivity ani nové preference; žádné explicitní scénáře nebo návody. Nízký souhlas s kontextovým výrokem neznamená jeho opak. Střední kontextovou odpověď neoznačuj za důležitý faktor. Sebepopis komunikace není důkaz komunikační schopnosti. V hypotetických příkladech rolí jde pouze o rozhovor, ne o zkoušení rolí či aktivit.
Mluv o odpovědích, ne o tom, jaký člověk je. Piš „v odpovědích uvádíš“ nebo „pokud tě tento výklad vystihuje, může…“, nikoli „tvá povaha se projevuje“, „vykazuješ“, „dokážeš“ ani „je pro tebe klíčové“. V otázkách se ptej přímo „Kdy naposledy…?“ a „V jaké situaci to naopak nesedělo a co bylo jinak?“, ne „Mohl by existovat…?“. Piš přirozeně, gramaticky správně a bez genderových lomítek; používej přítomný čas a druhou osobu. Před vrácením oprav překlepy a nesrozumitelné obraty.
Pouze JSON podle schématu. Žádné Markdown značky, HTML, odkazy ani citace, které nejsou ve vstupu. Pole fits a exception musí být otázky.`},
  {role:'user',content:JSON.stringify({groups})}
];}
export function validatePersonal(value,groups){
  if(!value||typeof value!=='object'||Object.keys(value).join()!=='chapters'||!Array.isArray(value.chapters)||value.chapters.length!==groups.length)throw Error('Invalid personal report');
  const forbidden=/[<>\d]|https?:|www\.|(?:^|[^\p{L}])(?:diagn[oó]z|poruch|trauma|narcis|psychopat|autis|adhd|bipol|percentil|procent|určitě|zaručeně|dokazuje|předurčuje)[\p{L}]*/iu;
  const seen=new Set();
  for(const chapter of value.chapters){
    if(!chapter||Object.keys(chapter).sort().join()!==['scope',...fields].sort().join()||seen.has(chapter.scope)||!groups.some(g=>g.scope===chapter.scope))throw Error('Unexpected personal chapter');
    seen.add(chapter.scope);
    for(const field of fields){
      const text=chapter[field];
      if(typeof text!=='string'||text.trim().length<35||text.length>650||forbidden.test(text))throw Error('Unsupported personal text');
      if(['fits','exception'].includes(field)&&!text.includes('?'))throw Error('Missing self-check question');
      if(['situation','useful','watch'].includes(field)&&!/(můž|moh|možná|pokud|jestli|případě)/iu.test(text))throw Error('Missing conditional framing');
    }
  }
  return groups.map(group=>({...value.chapters.find(c=>c.scope===group.scope),evidence:group.facts.map(f=>f.id)}));
}
export async function generatePersonal(profile,{scopes=['personality'],fetcher=fetch,base='http://127.0.0.1:8080'}={}){
  const input=personalInput(profile,scopes),groups=personalModelGroups(input);
  const result={version:PERSONAL_VERSION,input,chapters:[],mode:'rules',model:null};
  if(!groups.length)return {...result,message:input.facts.length?'Tyto odpovědi vysvětlují pravidla; neurčené preference ani hranice modelu neposíláme.':'Nejprve dokonči alespoň jednu škálu nebo vyber vyplněnou oblast.'};
  const signal=AbortSignal.timeout(80000),started=Date.now();
  try{
    const listing=await fetcher(base+'/v1/models',{signal});
    if(!listing.ok)throw Error('Model unavailable');
    const model=(await listing.json()).data?.[0]?.id;
    if(!model)throw Error('Model unavailable');
    const complete=async messages=>{
      const response=await fetcher(base+'/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json'},signal,body:JSON.stringify({model,messages,stream:false,temperature:0.15,seed:42,max_tokens:4200,chat_template_kwargs:{enable_thinking:false},response_format:{type:'json_object',schema:personalSchema(groups)}})});
      if(!response.ok)throw Error('Model unavailable');
      const choice=(await response.json()).choices?.[0];
      if(choice?.finish_reason!=='stop'||typeof choice.message?.content!=='string'||choice.message.content.length>30000)throw Error('Incomplete response');
      JSON.parse(choice.message.content);return choice.message.content;
    };
    const output=await complete(personalPrompt(groups));
    const chapters=validatePersonal(JSON.parse(output),groups);
    return {...result,chapters,mode:'ai',model:'local',seconds:Math.round((Date.now()-started)/1000)};
  }catch{
    return {...result,message:'AI výklad se nepodařilo spolehlivě dokončit. Níže zůstávají původní výsledky a otázky podle pravidel; neúplný nebo odmítnutý text nezobrazujeme.'};
  }
}
