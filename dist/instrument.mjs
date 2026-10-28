// Original English items: IPIP public domain, official 50-item administration order.
// Czech wording: independent working translation for this website, NOT validated.
export const VERSION = 'ipip50-cs-working-1.0.0';
export const SOURCE_ITEMS = 'https://www.ipip.ori.org/New_IPIP-50-item-scale.htm';
export const SOURCE_KEY = 'https://www.ipip.ori.org/newBigFive5broadKey.htm';
export const ANCHORS = ['Vůbec mě nevystihuje', 'Spíše mě nevystihuje', 'Ani mě vystihuje, ani nevystihuje', 'Spíše mě vystihuje', 'Velmi mě vystihuje'];
export const ITEMS = [
  [1,'E',false,'Ve společnosti bývám duší zábavy.','Am the life of the party.'],
  [2,'A',true,'Příliš mi neleží na srdci, jak se daří druhým.','Feel little concern for others.'],
  [3,'C',false,'Bývám vždy připraven/a.','Am always prepared.'],
  [4,'S',true,'Snadno se dostávám do stresu.','Get stressed out easily.'],
  [5,'I',false,'Mám bohatou slovní zásobu.','Have a rich vocabulary.'],
  [6,'E',true,'Moc toho nenamluvím.',"Don't talk a lot."],
  [7,'A',false,'Zajímám se o lidi.','Am interested in people.'],
  [8,'C',true,'Nechávám své věci různě povalovat.','Leave my belongings around.'],
  [9,'S',false,'Většinu času jsem v klidu.','Am relaxed most of the time.'],
  [10,'I',true,'Abstraktním myšlenkám rozumím obtížně.','Have difficulty understanding abstract ideas.'],
  [11,'E',false,'Mezi lidmi se cítím dobře.','Feel comfortable around people.'],
  [12,'A',true,'Urážím lidi.','Insult people.'],
  [13,'C',false,'Věnuji pozornost detailům.','Pay attention to details.'],
  [14,'S',true,'Dělám si starosti kvůli různým věcem.','Worry about things.'],
  [15,'I',false,'Mám živou představivost.','Have a vivid imagination.'],
  [16,'E',true,'Držím se v pozadí.','Keep in the background.'],
  [17,'A',false,'Mám pochopení pro pocity druhých.','Sympathize with others\' feelings.'],
  [18,'C',true,'Dělám ve věcech nepořádek.','Make a mess of things.'],
  [19,'S',false,'Málokdy na mě padá sklíčenost.','Seldom feel blue.'],
  [20,'I',true,'Abstraktní myšlenky mě nezajímají.','Am not interested in abstract ideas.'],
  [21,'E',false,'Začínám rozhovory.','Start conversations.'],
  [22,'A',true,'Problémy jiných lidí mě nezajímají.',"Am not interested in other people's problems."],
  [23,'C',false,'Běžné povinnosti vyřizuji hned.','Get chores done right away.'],
  [24,'S',true,'Snadno mě něco vyvede z míry.','Am easily disturbed.'],
  [25,'I',false,'Mívám výborné nápady.','Have excellent ideas.'],
  [26,'E',true,'Mám toho málo co říct.','Have little to say.'],
  [27,'A',false,'Mám měkké srdce.','Have a soft heart.'],
  [28,'C',true,'Často zapomínám vracet věci na své místo.','Often forget to put things back in their proper place.'],
  [29,'S',true,'Snadno se rozruším.','Get upset easily.'],
  [30,'I',true,'Nemám dobrou představivost.','Do not have a good imagination.'],
  [31,'E',false,'Na večírcích si povídám se spoustou různých lidí.','Talk to a lot of different people at parties.'],
  [32,'A',true,'O druhé se ve skutečnosti příliš nezajímám.','Am not really interested in others.'],
  [33,'C',false,'Mám rád/a pořádek.','Like order.'],
  [34,'S',true,'Moje nálada se hodně mění.','Change my mood a lot.'],
  [35,'I',false,'Věci chápu rychle.','Am quick to understand things.'],
  [36,'E',true,'Nerad/a na sebe přitahuji pozornost.',"Don't like to draw attention to myself."],
  [37,'A',false,'Udělám si čas na druhé.','Take time out for others.'],
  [38,'C',true,'Vyhýbám se svým povinnostem.','Shirk my duties.'],
  [39,'S',true,'Mívám časté výkyvy nálady.','Have frequent mood swings.'],
  [40,'I',false,'Používám složitá slova.','Use difficult words.'],
  [41,'E',false,'Nevadí mi být středem pozornosti.',"Don't mind being the center of attention."],
  [42,'A',false,'Prožívám emoce druhých.',"Feel others' emotions."],
  [43,'C',false,'Dodržuji časový plán.','Follow a schedule.'],
  [44,'S',true,'Snadno se podráždím.','Get irritated easily.'],
  [45,'I',false,'Věnuji čas přemýšlení o věcech.','Spend time reflecting on things.'],
  [46,'E',true,'Mezi neznámými lidmi jsem tichý/á.','Am quiet around strangers.'],
  [47,'A',false,'Lidé se díky mně cítí v pohodě.','Make people feel at ease.'],
  [48,'C',false,'Jsem náročný/á na kvalitu toho, co udělám.','Am exacting in my work.'],
  [49,'S',true,'Často na mě padá sklíčenost.','Often feel blue.'],
  [50,'I',false,'Mám spoustu nápadů.','Am full of ideas.']
].map(([id,scale,reverse,cs,en]) => Object.freeze({id,scale,reverse,cs,en}));

export const SCALES = [
  {id:'E',name:'Extraverze',short:'Kontakt s okolím',color:'#6a6c70',poles:['Spíše v ústraní','Spíše ve společnosti'],definition:'Jak popisuješ svou společenskost, hovornost a vztah k pozornosti ostatních.',
    lower:'Tvé odpovědi v tomto dotazníku směřují spíše k menší hovornosti a k držení se v pozadí. Prostor bez velké společenské pozornosti ti může být bližší.',
    middle:'Odpovědi leží kolem středu stupnice. Některé společenské výroky tě vystihují a jiné méně, nebo často volíš střed. Podívej se, v jakých situacích se tvé chování liší.',
    higher:'Tvé odpovědi v tomto dotazníku směřují spíše k hovornosti, zahajování kontaktu a pohodě ve společnosti. Zřejmě se častěji poznáváš v aktivní společenské roli.',
    limit:'Skóre nehodnotí kvalitu vztahů, oblíbenost ani schopnost vést ostatní.',reflect:['V jaké společnosti se cítíš nejvíc ve své kůži?','Kdy ti prospívá kontakt a kdy potřebuješ čas o samotě?']},
  {id:'A',name:'Přívětivost',short:'Vztah k druhým',color:'#7e8084',poles:['Spíše odstup','Spíše ohled na druhé'],definition:'Jak popisuješ zájem o druhé, soucit a vnímavost vůči jejich pocitům.',
    lower:'V odpovědích méně často potvrzuješ výroky o zájmu o druhé a jejich prožívání. Můžeš se v nich poznávat spíše jako člověk, který si udržuje odstup.',
    middle:'Odpovědi leží kolem středu stupnice. Zájem o druhé a odstup se mohou podle konkrétních lidí a okolností střídat; samotný průměr tyto rozdíly nezachytí.',
    higher:'V odpovědích častěji potvrzuješ zájem o druhé, soucit a vnímání jejich emocí. Poznáváš se spíše ve výrocích o ohleduplném přístupu.',
    limit:'Výsledek není morální hodnocení. Neříká, jestli jsi dobrý člověk nebo zda umíš zdravě nastavovat hranice.',reflect:['Kdy je pro tebe snadné vnímat potřeby druhých?','Jak si vedle ohledů na ostatní hlídáš vlastní hranice?']},
  {id:'C',name:'Svědomitost',short:'Řád a povinnosti',color:'#737579',poles:['Spíše méně řádu','Spíše systematičnost'],definition:'Jak popisuješ přípravu, pořádek, pečlivost a přístup k běžným povinnostem.',
    lower:'Tvé odpovědi častěji směřují k menší míře plánování a pořádku nebo k odkládání povinností. Podívej se, zda to platí obecně, nebo hlavně v některých situacích.',
    middle:'Odpovědi leží kolem středu stupnice. Může se u tebe kombinovat pečlivost v některých oblastech s menší potřebou řádu v jiných.',
    higher:'Tvé odpovědi častěji směřují k přípravě, pečlivosti, pořádku a dodržování plánů. V těchto výrocích popisuješ systematičtější přístup.',
    limit:'Skóre neměří inteligenci, pracovní výkon ani příčiny případného odkládání.',reflect:['Ve kterých oblastech ti plánování opravdu pomáhá?','Kde potřebuješ více řádu a kde více volnosti?']},
  {id:'S',name:'Emoční stabilita',short:'Prožívání zátěže',color:'#797b7f',poles:['Spíše větší rozkolísání','Spíše klid'],definition:'Jak popisuješ sklon ke starostem, podráždění a změnám nálady. Vyšší číslo zde znamená více emoční stability.',
    lower:'V odpovědích častěji uvádíš starosti, rozrušení nebo změny nálady. Mohou se do nich promítat také současné okolnosti, proto má smysl všímat si konkrétního kontextu.',
    middle:'Odpovědi leží kolem středu stupnice. V některých výrocích popisuješ klid a v jiných větší citlivost na zátěž, případně často volíš střed.',
    higher:'V odpovědích častěji popisuješ klid a méně potvrzuješ výroky o starostech či rozkolísání nálady. To je směr, který tento klíč označuje jako emoční stabilitu.',
    limit:'Nejde o vyšetření duševního zdraví. Nižší skóre není diagnóza a vyšší nevylučuje potíže.',reflect:['Jak se tvé prožívání liší v klidném a náročném období?','Co ti v poslední době pomohlo získat více klidu?']},
  {id:'I',name:'Intelekt a představivost',short:'Myšlenky a imaginace',color:'#838589',poles:['Méně blízké abstrakci','Spíše blízké abstrakci'],definition:'Jak se popisuješ ve vztahu k nápadům, představivosti, slovní zásobě a abstraktním myšlenkám.',
    lower:'Méně často se poznáváš ve výrocích o abstraktních myšlenkách, bohaté představivosti nebo slovní zásobě. Tento výsledek sám o sobě neurčuje skutečnou úroveň tvých schopností.',
    middle:'Odpovědi leží kolem středu stupnice. Jednotlivé stránky této oblasti se mohou lišit: například představivost tě může vystihovat více než záliba v abstraktních myšlenkách.',
    higher:'Častěji se poznáváš ve výrocích o nápadech, představivosti, slovní zásobě a abstraktních myšlenkách. Popisuješ jejich větší blízkost svému běžnému fungování.',
    limit:'Tato škála není IQ test. Neměří objektivní inteligenci, vzdělání ani dosaženou kreativitu.',reflect:['Při jakých činnostech nejčastěji přicházíš na nové nápady?','Které otázky zkoumáš ze zvědavosti, i když nemají okamžité využití?']}
];

export function validAnswer(value) { return Number.isInteger(value) && value >= 1 && value <= 5; }
export function score(answers) {
  return SCALES.map(scale => {
    const items = ITEMS.filter(item => item.scale === scale.id);
    const answered = items.filter(item => validAnswer(answers[item.id]));
    const complete = answered.length === items.length;
    const sum = complete ? answered.reduce((total,item) => total + (item.reverse ? 6 - answers[item.id] : answers[item.id]),0) : null;
    const mean = complete ? sum / 10 : null;
    const band = !complete ? null : mean <= 2.5 ? 'lower' : mean >= 3.5 ? 'higher' : 'middle';
    return {...scale,answered:answered.length,total:items.length,complete,sum,mean,band};
  });
}

export function answerCount(answers) { return ITEMS.filter(item => validAnswer(answers[item.id])).length; }
export function exportReport(answers,date = new Date()) {
  return {
    instrument:'IPIP 50-item Big-Five Factor Markers',version:VERSION,createdAt:date.toISOString(),
    translation:'Independent Czech working translation; NOT psychometrically validated. Not the Hřebíčková et al. (2023) adaptation.',
    norms:'No Czech norms or population percentiles applied.',
    sources:{items:SOURCE_ITEMS,key:SOURCE_KEY,scoring:'https://www.ipip.ori.org/newScoringInstructions.htm'},
    answers:ITEMS.map(item=>({id:item.id,answer:validAnswer(answers[item.id])?answers[item.id]:null})),
    scales:score(answers).map(({id,name,answered,complete,sum,mean})=>({id,name,answered,complete,sum,mean,meanRange:[1,5],sumRange:[10,50]}))
  };
}
