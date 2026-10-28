import {ROLE_INFO} from './dist/extensions-data.mjs';
const axisText={
 E:'Rozdíl v extraverzi otevírá téma množství společenského zapojení. Pokud se odráží i ve vašem životě, jednomu může vyhovovat více kontaktu a společného programu, druhému méně. Odmítnutí dalšího programu pak nemusí znamenat odmítnutí partnera; může být užitečné nejdřív zjistit, co tím druhý myslí.',
 C:'Rozdíl ve svědomitosti otevírá téma organizace a dotahování domluv. Co jednomu připadá dostatečně dohodnuté, může druhému připadat neurčité. Pokud to odpovídá vaší zkušenosti, pomůže oddělit věci, u kterých potřebujete jasný závazek, od těch, kde vám oběma vyhovuje volnější průběh.',
 A:'Rozdíl v přívětivosti může otevřít rozhovor o tom, jak vyjadřujete nesouhlas a berete ohled na druhého. Neříká, kdo je lepší člověk nebo kdo má pravdu. Je užitečné ověřit, zda si například přímou připomínku jeden nevykládá jako odmítnutí a snahu vyjít vstříc druhý jako skutečný souhlas.',
 S:'Rozdíl v emoční stabilitě se týká toho, jak jste popsali své obvyklé emoční reakce. Nelze z něj určit, kdo v konkrétním sporu přehání nebo kdo ho zvládne lépe. Může být podnětem pro rozhovor o tempu, v jakém chcete neshody řešit, a o tom, co každému pomáhá, když je situace náročná.',
 I:'Rozdíl v intelektu a představivosti se týká odpovědí o zájmu o myšlenky a představivost, ne inteligence. Může otevřít téma toho, co koho baví probírat nebo objevovat. Pokud v této oblasti máte různá přání, nemusí každý společný zájem sdílet oba; je užitečné zjistit, kde chcete společný prostor a kde vlastní.'
};
const contextText={
 desire:'Spontánně vznikající zájem znamená, že se chuť může objevit bez předchozí intimní situace. Neříká, jak často přichází, co jí předchází v konkrétní den ani zda člověk právě teď něco chce. Z této odpovědi nelze vyvozovat trvalou dostupnost nebo konkrétní průběh intimity.',
 responsive:'Zájem, který se někdy rozvíjí až v příjemném kontaktu, popisuje jednu možnou zkušenost s touhou. Klíčové je, že člověk daný kontakt sám chce. Odpověď není důvod pokračovat při nechuti ani slib, že se zájem postupně objeví.',
 variable:'Proměnlivost chuti podle období nebo situace neříká, jak se bude člověk cítit dnes. Pokud ji někdo v odpovědi uvádí, může být užitečné počítat v domluvě s možností změny. Změněné přání není samo o sobě zprávou o přitažlivosti partnera.',
 close:'Citová blízkost může být pro zájem o intimitu důležitá. Samotný souhlas s výrokem ale neříká, co blízkost vytváří: někdo tím může myslet rozhovor, jiný pocit přijetí nebo společně strávený čas. Konkrétní význam je potřeba zjistit, ne předpokládat.',
 privacy:'Výrok o soukromí se ptá na nerušené prostředí jako podpůrnou podmínku. Podpůrná podmínka však není automatický spouštěč chuti. To, že máte doma klid, ještě neznamená, že oba chcete intimitu, a z číselné odpovědi nelze určit, jaké prostředí každému stačí.',
 stress:'Výrok o stresu a únavě může otevřít rozdíl mezi tím, jak se člověk cítí, a tím, jak si jeho reakci vykládá partner. Pokud někdo v náročné chvíli nemá zájem, nelze bez dalšího uzavřít, že odmítá vztah. Dotazník ale nezná příčinu konkrétní situace; tu je potřeba zjistit rozhovorem.',
 familiar:'Předvídatelnost může znamenat potřebu vědět předem, co se domlouvá, ne odpor ke všemu novému. Nižší souhlas s výrokem zase neznamená souhlas s překvapením. Zkuste si ujasnit, jaké informace potřebuje každý předem a kde je pro oba příjemný prostor bez plánu.',
 novel:'Zájem o dobrovolné objevování nového je obecná odpověď. Nepotvrzuje zájem o žádnou konkrétní aktivitu a nezavazuje k jejímu zkoušení. Důležitý rozdíl je mezi tématem, o kterém se člověk chce pobavit, a přáním něco skutečně udělat.',
 communication:'Schopnost říct, co mi vyhovuje, je vlastní hodnocení komunikace. Neříká, zda druhý člověk sdělení opravdu pochopil nebo zda je snadné mluvit o každém tématu. V praxi může pomoci ověřit porozumění vlastními slovy, místo předpokladu, že vše důležité už zaznělo.',
 boundaries:'Výrok o vyjádření hranic je sebehodnocení, nikoli záruka, že bude v každé situaci snadné něco říct. Nižší odpověď není souhlas a vyšší odpověď nepřenáší odpovědnost za respektování hranic jen na toho, kdo je má vyslovit. Podstatný je prostor svobodně odmítnout a změnit přání.',
 talkfirst:'Potřeba rozhovoru před novou aktivitou může znamenat, že člověk chce vědět, co druhý zamýšlí, než se vůbec rozhodne. Nižší souhlas s výrokem není automatické svolení jednat bez domluvy. Rozhovor má otevřít možnost svobodně říct ano i ne.',
 aftercare:'Klid, blízkost nebo společné ohlédnutí po intenzivní zkušenosti nejsou jedna a táž potřeba. Podobné odpovědi mohou skrývat různé představy: někdo může chtít být chvíli spolu, jiný prostor. Výrok je podnětem tyto představy pojmenovat, ne návodem vybrat péči za druhého.'
};
const fmt=n=>n.toLocaleString('cs-CZ',{maximumFractionDigits:2});
const axisQuestions={E:'Kolik společného programu a kolik času pro sebe vyhovuje každému z vás?',A:'Jak chcete vyjádřit nesouhlas, aby snaha vyjít vstříc nebyla zaměněna za skutečné ano?',C:'Které domluvy potřebujete mít konkrétní a u kterých vám vyhovuje volný průběh?',S:'Jak poznáte, že při neshodě potřebujete pauzu, a jak si domluvíte návrat k rozhovoru?',I:'O kterých tématech rádi přemýšlíte spolu a které zájmy si chcete nechat vlastní?'};
const axisEqual={E:'Stejný průměr v extraverzi může otevřít společné téma kontaktu s lidmi. Neznamená stejné oblíbené aktivity ani stejnou potřebu společného času. Ověřte si, co komu vyhovuje v konkrétním dni.',A:'Stejný průměr v přívětivosti neříká, že stejně vyjadřujete nesouhlas nebo máte stejné hodnoty. Může být začátkem rozhovoru o tom, jak rozlišujete ohleduplnost od skutečného souhlasu.',C:'Stejný průměr ve svědomitosti neznamená, že stejně plánujete všechny oblasti života. Zjistěte, co každý považuje za dokončenou práci a za potvrzenou domluvu.',S:'Stejný průměr v emoční stabilitě není důkaz stejných pocitů nebo reakcí při neshodě. Každý může potřebovat jiný čas a způsob, jak o náročné situaci mluvit.',I:'Stejný průměr v intelektu a představivosti neznamená stejné zájmy ani stejnou inteligenci. Užitečné je pojmenovat, co vás baví zkoumat spolu a co každého zvlášť.'};
const roleQuestions={dominant:'Co pro každého znamená vlastní vedení při intimitě a chce tuto roli právě v tomto vztahu?',submissive:'Co pro každého znamená dobrovolně přenechat vedení a které rozhodování tím není zahrnuté?',switch:'Je střídání vlastních intimních rolí jen obecně lákavé, nebo si je někdo přeje i v tomto vztahu? Jak to vnímá druhý?',roleplay:'Co vás na hraní domluvených rolí zajímá a chcete o tom spolu vůbec mluvit?',sadistic:'Je toto pouze obecný zájem o vlastní roli, nebo téma, které chcete v tomto vztahu otevřít?',masochistic:'Co pro každého toto označení vlastní role znamená a co z něj partner nemá automaticky vyvozovat?',restraint:'Co pro vás znamená zájem o toto téma, aniž byste zatím plánovali konkrétní aktivitu?',equal:'Co pro každého znamená intimita bez předávání kontroly a kdy si ji přeje?'};
const contextQuestions={desire:'Jak poznáte a sdělíte, že máte chuť právě teď, nezávisle na obecné odpovědi v dotazníku?',responsive:'Jak si dáte najevo, že je kontakt chtěný, i když se chuť může teprve rozvíjet?',variable:'Jak si chcete sdělovat změnu chuti, aby nebyla automaticky vykládána jako odmítnutí vztahu?',close:'Co pro každého z vás v praxi vytváří citovou blízkost?',privacy:'Jaké soukromí každému vyhovuje a jak od něj odlišíte aktuální přání?',stress:'Jak si sdělíte stres či únavu a co v takové chvíli každý skutečně chce?',familiar:'Co potřebuje každý vědět předem, aby se mohl svobodně rozhodnout?',novel:'O kterých nových tématech chcete jen mluvit a která zatím nechcete otevírat?',communication:'Jak si ověříte, že druhý rozuměl tomu, co vám vyhovuje?',boundaries:'Jak si usnadníte říct ne nebo změnit přání bez potřeby se obhajovat?',talkfirst:'Co potřebuje každý probrat před novou aktivitou a co má zůstat otevřené až do konkrétní chvíle?',aftercare:'Jaký klid, kontakt nebo prostor každému vyhovuje po intenzivní zkušenosti?'};
const kinds={equal:'Stejná číselná odpověď',difference:'Rozdílné číselné odpovědi',shared:'Oba uvedli zájem',talk:'Možnost rozhovoru, ne potvrzený zájem',boundary:'Hranice k respektování',unknown:'Bez závěru'};
export function describeFact(f){
 if(f.kind==='numeric')return `Profil A: ${fmt(f.A)} / 5. Profil B: ${fmt(f.B)} / 5. `+(f.A===f.B?'Číselné odpovědi jsou stejné.':`Vyšší hodnotu uvádí profil ${f.A>f.B?'A':'B'}; rozdíl je ${fmt(f.difference)} bodu.`);
 return `Profil A: „${f.A}“. Profil B: „${f.B}“.`;
}
export function topicFor(f){
 const id=f.id.split(':')[1],kind=f.kind==='numeric'?(f.difference===0?'equal':'difference'):f.kind;
 let reading,question;
 if(f.scope==='personality'){
  reading=f.difference===0?axisEqual[id]:axisText[id];question=axisQuestions[id];
 }else if(f.scope==='roles'){
  reading=ROLE_INFO.find(r=>r.id===id).description+' '+(f.difference===0?'Stejný průměr neznamená, že tuto roli chcete spolu, stejně často nebo stejným způsobem.':'Porovnáváme vlastní role. Nižší odpověď není odmítnutí stejné role u partnera a vyšší odpověď druhému žádnou roli nepřiděluje.');
  question=roleQuestions[id];
 }else if(f.scope==='context'){
  reading=contextText[id];question=contextQuestions[id];
 }else{
  if(kind==='shared')reading='Oba výslovně označujete „Láká mě“. To je společný deklarovaný zájem. Dotazník ale nezná konkrétní podobu, frekvenci ani aktuální přání; stejné označení může mít pro každého jiný význam.';
  else if(kind==='talk'){
   const unsure=['A','B'].filter(p=>f[p]==='Možná / chci probrat');
   reading=(unsure.length===2?'Oba uvádíte „Možná / chci probrat“.':`Profil ${unsure[0]} uvádí „Možná / chci probrat“.`)+' Tato odpověď nepotvrzuje zájem. Nevíme, zda jde o nejistotu, potřebu vyjasnění nebo něco jiného. Rozhovor může skončit také odmítnutím; očekávání, že z možnosti musí vzniknout ano, by bylo nepodložené.';
  }else if(kind==='boundary')reading='Alespoň jeden profil výslovně uvádí „Nechci“. Jde o hranici k respektování, nikoli o rozdíl, který máte překonat. Kladná nebo chybějící odpověď druhého na tom nic nemění.';
  else reading='Neurčená nebo chybějící odpověď není nízký zájem, shoda ani neshoda. Z této položky se o společném přání nedá udělat závěr.';
  if(id==='solo'){
   reading+=' Tato položka se týká samostatné aktivity. Nevypovídá o přání zapojit partnera ani o společné sexuální aktivitě.';
   question='Chcete si vyjasnit význam této odpovědi, nebo ji ponechat jako soukromou oblast každého z vás?';
  }else question=kind==='shared'?`Co každý myslíte zájmem o téma „${f.name}“ a co z něj druhý nemá automaticky předpokládat?`:kind==='talk'?`Chcete si u tématu „${f.name}“ něco vyjasnit, nebo má odpověď zůstat otevřená bez dalšího očekávání?`:null;
 }
 return {id:f.id,name:f.name,kind,label:kinds[kind],observation:describeFact(f),reading,question};
}
function overviewFor(facts,topics){
 const blocks=[];
 const add=(kind,title,text,rows)=>{if(rows.length)blocks.push({kind,title,text,ids:rows.map(f=>f.id)});};
 if(facts[0]?.kind==='numeric'){
  const same=facts.filter(f=>f.difference===0),different=facts.filter(f=>f.difference>0);
  add('equal',`Shodné číselné odpovědi (${same.length})`,'Stejné hodnoty jsou společný bod pro rozhovor, ne důkaz stejného prožívání nebo stejných přání.',same);
  if(!same.length)blocks.push({kind:'equal',title:'Žádná přesná číselná shoda',text:'To samo neznamená nesoulad. Rozdílné průměry neříkají, zda se liší vaše očekávání v konkrétní situaci.',ids:[]});
  if(different.length){
   const min=Math.min(...different.map(f=>f.difference)),nearest=different.filter(f=>f.difference===min);
   add('closest','Nejbližší z rozdílných hodnot','Jde pouze o nejmenší číselný rozdíl v této kategorii. Nemáme ověřený práh, který by z něj dělal psychologickou shodu.',nearest);
   add('difference',`Rozdílné odpovědi (${different.length})`,'Všechna témata mají vlastní vysvětlení níže. Velikost rozdílu neurčuje, co je pro váš vztah důležité.',different);
  }
 }else{
  add('shared',`Oba uvedli zájem (${topics.filter(t=>t.kind==='shared').length})`,'Tyto společné zájmy patří do rozboru stejně jako odlišné volby. Nejde o souhlas s konkrétní situací.',facts.filter(f=>f.kind==='shared'));
  add('talk',`K vyjasnění (${topics.filter(t=>t.kind==='talk').length})`,'„Možná / chci probrat“ zůstává možností rozhovoru. Není to potvrzený zájem ani příslib změny odpovědi.',facts.filter(f=>f.kind==='talk'));
  add('boundary','Hranice','„Nechci“ není námět k přemlouvání.',facts.filter(f=>f.kind==='boundary'));
  add('unknown','Bez závěru','Chybějící nebo neurčené odpovědi nedoplňujeme.',facts.filter(f=>f.kind==='unknown'));
 }
 return blocks;
}
export function coreAnalysis(scope,facts){
 const topics=facts.map(topicFor),overview=overviewFor(facts,topics),dimensions=topics.map(t=>t.id);
 const title={personality:'Celý obraz povahy: blízké hodnoty i rozdíly',roles:'Vlastní role obou lidí, bez přidělování rolí partnerovi',context:'Co máte podobně a co potřebujete vyjasnit',practices:'Společné zájmy, otevřené možnosti a hranice'}[scope];
 let reading,pitfall;
 if(scope==='personality'){
  reading=[`Rozbor zahrnuje všech ${facts.length} společných úplných škál. Číselně blízké hodnoty mohou být dobrým začátkem rozhovoru o podobných zkušenostech, ale neprokazují stejné chování. Rozdíly zase neříkají, kdo má pravdu nebo kdo se má přizpůsobit.`, 'Podívejte se na jednotlivá témata v souvislosti s konkrétní situací. Máte podobnou představu o plánování, ale jinou o množství společného programu? Dokážete nesouhlasit a současně brát ohled na druhého? Dotazník sám tyto souvislosti nepotvrdil; následující vysvětlení a otázky vám je pomohou ověřit.'];
  pitfall='Nedělejte z průměru rozsudek „ty jsi prostě takový člověk“. Popis odpovědí nezná důvod konkrétního chování. Ani největší rozdíl není automaticky největší problém a nejmenší rozdíl není záruka shody.';
 }else if(scope==='roles'){
  const top=p=>{const max=Math.max(...facts.map(f=>f[p]));return facts.filter(f=>f[p]===max).map(f=>`${f.name} (${fmt(f[p])} / 5)`).join(', ');};
  reading=[`V rámci sdílených rolí má profil A nejvyšší průměr u: ${top('A')}. Profil B u: ${top('B')}. Jde o pořadí jejich vlastních odpovědí; nejvyšší odpověď nemusí znamenat silný zájem a neříká, jakou roli chtějí u partnera.`, 'Více rolí může vedle sebe existovat. Zájem o střídání rolí není totéž co zájem jen o vedení nebo jen o jeho přenechání. Vyjasněte si, co je obecná představa, co každý chce právě v tomto vztahu a co je teprve předmětem konkrétní domluvy. Ostatní role v rozboru nepřeskakujeme.'];
  const dom=facts.find(f=>f.id==='roles:dominant'),sw=facts.find(f=>f.id==='roles:switch');
  if(dom&&sw&&dom.A!==dom.B&&sw.A!==sw.B&&(dom.A>dom.B)===(sw.A>sw.B))reading.push(`U dominantní role i střídání rolí uvádí vyšší hodnotu tentýž profil ${dom.A>dom.B?'A':'B'}. Tyto dvě odpovědi tedy nepatří každá jinému člověku. Z jejich kombinace neodvozujeme doplňování partnerů.`);
  pitfall='Pojmenování vlastní role není dohoda mezi vámi. Nízký zájem o vlastní vedení neznamená odmítnutí vedoucí role partnera. Z intimních odpovědí také neodvozujeme rozdělení moci, povinností nebo rozhodování v běžném životě.';
 }else if(scope==='context'){
  reading=[`Zahrnujeme všech ${facts.length} společně vyplněných výroků. Shody i rozdíly čtěte po jednotlivých tématech; nesčítají se do skóre touhy ani do typu člověka. Stejná odpověď nemusí znamenat stejnou zkušenost.`, 'U podobných odpovědí si ověřte konkrétní význam: například „klid“ nebo „blízkost“ může každý chápat jinak. U odlišných odpovědí zjistěte, zda se liší vaše aktuální přání, nebo jen obecný popis zkušenosti. Odpovědi o soukromí, stresu, rozhovoru předem a hranicích se navzájem nenahrazují.'];
  pitfall='Splněná podmínka, například soukromí, není automatický spouštěč chuti. Nízká potřeba rozhovoru předem není svolení jednat bez domluvy. Znovu zjistěte aktuální přání, místo odhadu podle výsledku.';
 }else{
  const n=kind=>topics.filter(t=>t.kind===kind).length;
  reading=[`V této kategorii je ${n('shared')} položek s výslovným zájmem obou, ${n('talk')} položek k vyjasnění, ${n('boundary')} položek s hranicí „Nechci“ a ${n('unknown')} položek bez závěru. Žádnou skupinu nezaměňujeme za jinou a žádnou nepřeskakujeme.`, 'Společně označený zájem může usnadnit začátek rozhovoru o tom, co koho láká. Neříká ale nic jistého o frekvenci, konkrétní podobě ani aktuálním souhlasu. Otevřená možnost je jiná informace: člověk nemusí mít rozhodnuto a může si přát téma jen vyjasnit nebo ho dále neotevírat.'];
  pitfall='„Možná / chci probrat“ není potvrzený obecný zájem. „Nechci“ není mezera k vyjednávání a „Nevím“ není skryté ano. Samostatná aktivita neznamená přání zapojit partnera.';
 }
 return {scope,title,dimensions,topics,overview,reading,pitfall,takeaway:'Vyberte jednu podobnou odpověď a jednu odlišnou. Každý popište, co pro vás znamená v praxi, a také kdy neplatí. Zopakujte vlastními slovy pohled druhého a nechte ho potvrdit nebo opravit. Porozumění nevyžaduje stejné přání ani okamžitou dohodu.',observed:facts.map(f=>({id:f.id,name:f.name,relative:describeFact(f)}))};
}
export function questionGroups(report){
 const available=report.topics.filter(t=>t.question&&!['boundary','unknown'].includes(t.kind));
 const groups=[];
 const add=(id,label,items)=>{if(items.length)groups.push({id,label,options:items.map(({id,name,observation,question})=>({id,name,observation,question}))});};
 const same=available.filter(t=>['equal','shared'].includes(t.kind)),different=available.filter(t=>['difference','talk'].includes(t.kind));
 add('shared','Otázka ke společnému bodu',same);
 const nearIds=!same.length?report.overview.find(o=>o.kind==='closest')?.ids||[]:[];
 if(nearIds.length&&nearIds.length<different.length){add('closest','Otázka k nejbližším hodnotám',different.filter(t=>nearIds.includes(t.id)));add('difference','Otázka k rozdílným odpovědím',different.filter(t=>!nearIds.includes(t.id)));}
 else add('difference','Otázka k odlišné nebo otevřené odpovědi',different);
 return groups;
}
