import {score,validAnswer} from './instrument.mjs';

export const INTIMACY_VERSION='intimacy-reflection-cs-1.0.0';
export const ROLE_INFO=[
  {id:'dominant',name:'Dominantní role',short:'Domluvené vedení',color:'#737579',description:'Zájem přebírat vedení v předem dohodnuté intimní dynamice. Nevypovídá o agresivitě ani o potřebě řídit druhé mimo tuto situaci.',items:['Láká mě v intimní situaci po vzájemné dohodě přebírat vedení.','Představa, že mi druhý člověk dobrovolně svěří část kontroly v domluvené intimní situaci, mě přitahuje.']},
  {id:'submissive',name:'Submisivní role',short:'Domluvené přenechání vedení',color:'#838589',description:'Zájem dobrovolně přenechat část vedení v dohodnutých mezích. Neznamená slabost ani souhlas s čímkoli.',items:['Láká mě dobrovolně přenechat vedení při intimitě druhému člověku.','Přitahuje mě představa, že se v předem domluvených mezích nechám vést.']},
  {id:'switch',name:'Switch',short:'Střídání rolí',color:'#87898d',description:'Zájem o vedoucí i následující roli podle situace či partnerství. Tato oblast má vlastní odpovědi; nepočítá se jako průměr dominance a submise.',items:['Podle situace mě láká jak vést, tak dobrovolně přenechat vedení.','Střídání vedoucí a následující role mi v intimní dynamice připadá přitažlivé.']},
  {id:'roleplay',name:'Roleplayer',short:'Hraní domluvených rolí',color:'#898b8f',description:'Zájem o společně domluvené fiktivní role a scénáře mezi dospělými. Sám neurčuje dominanci ani další preference.',items:['Láká mě při intimitě hrát s druhým člověkem předem domluvené fiktivní role.','Vymýšlení společného intimního scénáře nebo rolí patří mezi věci, které mě zajímají.']},
  {id:'sadistic',name:'Sadistická role',short:'Konsenzuální zájem',color:'#727478',description:'Zde pouze zájem být v dobrovolné, předem domluvené dynamice tím, kdo poskytuje bolestivé podněty. Neoznačuje krutost, násilí bez souhlasu ani diagnózu.',items:['Mezi mé intimní zájmy patří být tím, kdo druhému po vzájemné domluvě působí bolestivé podněty.','Přitahuje mě sadistická role v rámci předem vyjednaných hranic a dobrovolného souhlasu dospělých.']},
  {id:'masochistic',name:'Masochistická role',short:'Konsenzuální zájem',color:'#75777b',description:'Zde pouze zájem dobrovolně přijímat domluvené bolestivé podněty v intimním kontextu. Není to měření sebehodnoty, sebepoškozování ani diagnóza.',items:['Mezi mé intimní zájmy patří dobrovolně přijímat předem domluvené bolestivé podněty.','Přitahuje mě masochistická role v rámci předem vyjednaných hranic a dobrovolného souhlasu dospělých.']},
  {id:'restraint',name:'Omezení pohybu',short:'Téma bondage',color:'#7b7d81',description:'Zájem o domluvené omezení pohybu jako téma. Toto skóre nerozlišuje, kdo kterou roli zastává, a nehodnotí bezpečnost konkrétní aktivity.',items:['Téma předem domluveného omezení pohybu při intimitě mě zajímá.','Mezi mé intimní preference patří představa dobrovolné dynamiky spojené s omezením pohybu.']},
  {id:'equal',name:'Rovnocenná dynamika',short:'Bez předávání kontroly',color:'#7d7f83',description:'Zájem o intimitu bez výslovného rozdělení na vedoucí a následující roli. Může být blízká i člověku, kterého jindy lákají další dynamiky.',items:['Láká mě intimita bez domluveného předávání kontroly mezi námi.','Blízká je mi dynamika, ve které má každý průběžně stejnou iniciativu bez přidělené role.']}
];
export const ROLE_ITEMS=ROLE_INFO.flatMap(role=>role.items.map((text,i)=>({id:`${role.id}-${i+1}`,role:role.id,text})));
export const CONTEXT_ITEMS=[
  {id:'desire',text:'Sexuální zájem se u mě někdy objeví sám od sebe, bez předchozí intimní situace.',insight:'Zmiňuješ spontánně vznikající sexuální zájem.',question:'Kdy se spontánní zájem objevuje a kdy ne?'},
  {id:'responsive',text:'Můj zájem o intimitu se někdy rozvíjí až v příjemném kontaktu, který sám/sama chci.',insight:'Zmiňuješ zájem, který se rozvíjí v příjemném, chtěném kontaktu.',question:'Jak poznáš, že je ti kontakt příjemný a chceš v něm pokračovat?'},
  {id:'variable',text:'Má chuť na intimitu se podle období nebo situace výrazně mění.',insight:'Popisuješ proměnlivost touhy podle situace.',question:'Které okolnosti se u tebe opakují, když se chuť mění?'},
  {id:'close',text:'Pro můj zájem o intimitu je důležitý pocit citové blízkosti.',insight:'Citovou blízkost uvádíš jako důležitou podmínku.',question:'Co pro tebe v praxi vytváří pocit blízkosti?'},
  {id:'privacy',text:'Soukromí a pocit, že nás nikdo nebude rušit, podporují mou chuť na intimitu.',insight:'Zmiňuješ význam soukromí a klidného prostředí.',question:'Jaké prostředí ti vyhovuje?'},
  {id:'stress',text:'Stres nebo únava můj zájem o intimitu obvykle tlumí.',insight:'Zmiňuješ útlum zájmu při stresu nebo únavě.',question:'Jak můžeš svůj aktuální stav sdělit bez tlaku na výkon?'},
  {id:'familiar',text:'Vyhovuje mi vědět předem, co při intimitě čekat.',insight:'Zmiňuješ význam předvídatelnosti.',question:'Co potřebuješ vědět nebo domluvit předem?'},
  {id:'novel',text:'Dobrovolné objevování něčeho nového může podpořit můj zájem o intimitu.',insight:'Zmiňuješ zájem o dobrovolné objevování nového.',question:'O čem by sis chtěl/a nejprve jen promluvit?'},
  {id:'communication',text:'Dokážu druhému člověku říct, co mi v intimitě vyhovuje.',insight:'Uvádíš, že dokážeš sdělit své preference.',question:'Co z tohoto přehledu bys chtěl/a vyjádřit vlastními slovy?'},
  {id:'boundaries',text:'Dokážu při intimitě říct, že něco nechci nebo chci přestat.',insight:'Uvádíš, že dokážeš vyjádřit hranici nebo zastavení.',question:'Jak si s druhým člověkem dáváte najevo změnu přání?'},
  {id:'talkfirst',text:'Před zkoušením nové intimní aktivity potřebuji společný rozhovor.',insight:'Zmiňuješ potřebu domluvy před novou aktivitou.',question:'Co by ten rozhovor měl zahrnout, aby ses mohl/a svobodně rozhodnout?'},
  {id:'aftercare',text:'Po intenzivním intimním zážitku oceňuji klid, blízkost nebo společné ohlédnutí.',insight:'Zmiňuješ péči a prostor po intenzivním zážitku.',question:'Jaký druh péče nebo prostoru ti po zážitku vyhovuje?'}
];
export const PRACTICES=[
  {id:'cuddle',name:'Mazlení a něžné doteky'}, {id:'kiss',name:'Líbání'},
  {id:'massage',name:'Partnerská masáž'}, {id:'solo',name:'Masturbace o samotě'},
  {id:'manual',name:'Manuální stimulace'}, {id:'oral',name:'Orální sex'},
  {id:'penetration',name:'Penetrativní sex'}, {id:'toys',name:'Intimní pomůcky'},
  {id:'words',name:'Erotická komunikace'}, {id:'sensory',name:'Smyslové podněty, hudba a atmosféra'}
];
export const PRACTICE_CHOICES={yes:'Láká mě',talk:'Možná / chci probrat',no:'Nechci',unsure:'Nevím',skip:'Nechci uvést'};
export const INTIMACY_PAGES=[
  {title:'Vedení a přenechání vedení',kind:'rating',items:ROLE_ITEMS.slice(0,4)},
  {title:'Střídání a hraní rolí',kind:'rating',items:ROLE_ITEMS.slice(4,8)},
  {title:'Sadistická a masochistická role',kind:'rating',items:ROLE_ITEMS.slice(8,12)},
  {title:'Další podoby dynamiky',kind:'rating',items:ROLE_ITEMS.slice(12,16)},
  {title:'Touha a blízkost',kind:'rating',items:CONTEXT_ITEMS.slice(0,4)},
  {title:'Podmínky a prostředí',kind:'rating',items:CONTEXT_ITEMS.slice(4,8)},
  {title:'Komunikace a hranice',kind:'rating',items:CONTEXT_ITEMS.slice(8,12)},
  {title:'Preference konkrétních aktivit',kind:'practice',items:PRACTICES}
];
const ratingIds=new Set([...ROLE_ITEMS,...CONTEXT_ITEMS].map(x=>x.id));
export function validIntimate(id,value){return ratingIds.has(id)?validAnswer(value)||value==='na'||value==='skip':PRACTICES.some(x=>x.id===id)&&Object.hasOwn(PRACTICE_CHOICES,value);}
export function intimateCount(answers){return Object.entries(answers).filter(([id,value])=>validIntimate(id,value)).length;}
export function roleScores(answers){return ROLE_INFO.map(role=>{const values=ROLE_ITEMS.filter(x=>x.role===role.id).map(x=>answers[x.id]).filter(validAnswer);const complete=values.length===2;const mean=complete?(values[0]+values[1])/2:null;return {...role,answered:values.length,complete,mean,band:!complete?'incomplete':mean<=2.5?'lower':mean>=3.5?'higher':'middle'};});}
export function contextHighlights(answers){return CONTEXT_ITEMS.filter(x=>validAnswer(answers[x.id])&&answers[x.id]>=4);}
export function temperament(answers){const scores=score(answers),e=scores.find(x=>x.id==='E'),s=scores.find(x=>x.id==='S');if(!e.complete||!s.complete)return {complete:false,extraversion:e.mean,stability:s.mean,answered:e.answered+s.answered};const centre=e.mean>2.5&&e.mean<3.5||s.mean>2.5&&s.mean<3.5;const type=centre?'Smíšená / středová oblast':e.mean>=3.5?(s.mean>=3.5?'Sangvinik':'Cholerik'):(s.mean>=3.5?'Flegmatik':'Melancholik');return {complete:true,extraversion:e.mean,stability:s.mean,answered:20,type,centre};}
export const SOURCES={
  roles:'https://pubmed.ncbi.nlm.nih.gov/35166194/',
  who:'https://www.who.int/publications/i/item/9789240077263',
  sexualHealth:'https://www.who.int/teams/sexual-and-reproductive-health-and-research/key-areas-of-work/sexual-health/defining-sexual-health',
  dual:'https://kinseyinstitute.org/research/dual-control-model.html',
  communication:'https://pubmed.ncbi.nlm.nih.gov/19012061/',
  eysenck:'https://hanseysenck.com/wp-content/uploads/2019/12/1983_eysenck_-_psychophysiology_and_personality_extraversion_neuroticism_and_psychoticism_physiological.pdf'
};
export function intimateExport(answers){return {instrument:'Vlastní mapa intimních zájmů a rolí',version:INTIMACY_VERSION,createdAt:new Date().toISOString(),status:'Nevalidovaný sebereflexní dotazník. Deklarovaný zájem není identita, diagnóza, předpověď ani souhlas.',sources:SOURCES,roles:roleScores(answers).map(({id,name,answered,mean})=>({id,name,answered,mean,range:[1,5]})),answers:[...ROLE_ITEMS,...CONTEXT_ITEMS,...PRACTICES].map(x=>({id:x.id,value:validIntimate(x.id,answers[x.id])?answers[x.id]:null}))};}
