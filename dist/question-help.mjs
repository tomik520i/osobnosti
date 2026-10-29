// Original editorial explanations, not validated instrument items or scoring rules.
export const HELP_VERSION = 'question-help-cs-1.0.0';
const entry = (meaning, example = '') => Object.freeze({meaning, example});

export const PERSONALITY_HELP = Object.freeze({
  1: entry('„Duše zábavy“ je člověk, který ve skupině rozproudí dění, rozhovor nebo veselou náladu. Nejde o to, zda doslova chodíš na večírky.', 'Na setkání začneš společnou zábavu nebo rozhýbeš rozhovor, do kterého se zapojí ostatní.'),
  2: entry('Výrok říká, že ti na tom, jak se ostatním vede, příliš nezáleží. Rozlišuj svůj zájem o druhé od toho, zda máš právě čas nebo sílu jim pomáhat.'),
  3: entry('Být připravený/á znamená mít předem promyšlené nebo nachystané to, co budeš potřebovat. Posuzuj, nakolik tě vystihuje celý výrok včetně slova „vždy“.', 'Před domluvenou činností si nachystáš potřebné věci a víš, co tě čeká.'),
  4: entry('Stres je tu pocit tlaku nebo napětí: máš dojem, že toho na tebe je moc nebo že něco těžko zvládneš. „Snadno“ se ptá, jak lehce se do takového stavu dostáváš.', 'Při běžné změně plánu nebo přibývajících úkolech v sobě pocítíš tlak a napětí.'),
  5: entry('Bohatá slovní zásoba znamená, že znáš a umíš používat mnoho různých slov. Nejde jen o cizí nebo odborné výrazy.', 'Pro to, co chceš sdělit, tě napadají různá vhodná slova.'),
  6: entry('Jde o to, že v běžných rozhovorech mluvíš spíše málo. Důvod může být různý; otázka se neptá, jestli se bojíš mluvit nebo jestli máš lidi rád/a.'),
  7: entry('Zajímat se o lidi znamená chtít vědět, co prožívají, co je baví nebo jak se jim daří. Nemusí to znamenat znát velké množství lidí.'),
  8: entry('Jde o zvyk nechávat své věci na různých místech, místo abys je uklidil/a nebo uložil/a na místo.', 'Po použití zůstane oblečení, hrnek nebo pomůcka ležet tam, kde jsi je odložil/a.'),
  9: entry('„V klidu“ zde znamená vnitřně uvolněný/á, bez výrazného napětí nebo rozrušení. Nejde o to, jestli tiše sedíš nebo nemáš co dělat. Všimni si slov „většinu času“.'),
  10: entry('Abstraktní myšlenky jsou obecné pojmy a souvislosti, které nelze přímo vzít do ruky, například spravedlnost nebo svoboda. Výrok říká, že jejich pochopení pro tebe bývá obtížné.', 'Jde třeba o porozumění úvaze o tom, co znamená být spravedlivý, bez jednoho konkrétního příběhu.'),
  11: entry('Ptáme se, zda je ti mezi lidmi obvykle příjemně a cítíš se tam přirozeně. To je jiná věc než být nejhlasitější nebo nejzábavnější ve skupině.'),
  12: entry('Urážet znamená někoho slovně ponižovat, shazovat nebo se ho dotýkat znevažujícími poznámkami. Samotný věcný nesouhlas není totéž co urážka.', 'Místo připomínky k tomu, co člověk udělal, použiješ posměšné označení jeho osoby.'),
  13: entry('Detaily jsou drobné části nebo jednotlivosti. Věnovat jim pozornost znamená všímat si jich, ne jen celkového dojmu.', 'Při čtení zadání si všimneš i menšího požadavku nebo drobné nesrovnalosti.'),
  14: entry('Dělat si starosti znamená zabývat se obavami, že se něco nepovede nebo špatně dopadne. Samotné praktické plánování ještě nemusí být starost.', 'V myšlenkách se vracíš k tomu, co by se mohlo pokazit, i když to právě neřešíš.'),
  15: entry('Živá představivost znamená, že tě napadají výrazné nebo rozmanité představy, děje či možnosti. Nemusí jít jen o obraz, který doslova „vidíš“ v hlavě.', 'Při příběhu si snadno dotváříš situaci nebo vymýšlíš, co by se mohlo stát dál.'),
  16: entry('Držet se v pozadí znamená nechávat hlavní prostor ostatním a sám/sama příliš nevystupovat do popředí. Nejde o to, kde fyzicky stojíš.', 'Ve skupině se účastníš, ale necháváš ostatní, aby byli hlavními mluvčími.'),
  17: entry('Mít pochopení pro pocity druhých znamená brát jejich prožívání vážně a umět se do něj vcítit. Nemusíš přitom souhlasit s tím, co udělali.'),
  18: entry('Jde o to, že po tvé činnosti bývají věci rozházené nebo neuspořádané. Posuzuj vlastní obvyklé jednání, ne to, zda někdy vznikne nepořádek vinou okolností.'),
  19: entry('Sklíčenost je pocit smutku, tíhy nebo pokleslé nálady; člověk může být bez elánu. „Málokdy“ znamená, že tento pocit zažíváš jen zřídka. Posuzuj celý výrok, ne jen slovo sklíčenost.', '„Je mi těžko a jsem bez nálady“ přibližuje tento pocit. Samotná odpověď neříká, zda máš depresi.'),
  20: entry('Abstraktní myšlenky jsou obecné pojmy a úvahy, například o svobodě, spravedlnosti nebo smyslu věcí. Tento výrok říká, že tě takové uvažování nezajímá. Zájem je něco jiného než schopnost tomu rozumět.'),
  21: entry('Jde o to, zda sám/sama oslovuješ druhé a otevíráš rozhovor, místo abys čekal/a, až začne někdo jiný. Nemusí to být rozhovor s cizím člověkem.'),
  22: entry('Výrok říká, že nemáš zájem o potíže jiných lidí. Rozlišuj, zda tě jejich situace zajímá, od toho, jestli ji dokážeš vyřešit nebo máš prostor pomoci.'),
  23: entry('Běžné povinnosti jsou každodenní úkoly, které máš vyřídit. „Hned“ zde vyjadřuje, že se do nich pouštíš bez odkládání.', 'Po vzniku drobného úkolu jej vyřídíš, místo abys ho nechával/a na později.'),
  24: entry('„Vyvede z míry“ znamená, že něco naruší tvůj vnitřní klid a rozhodí tě. Nemusí to být vidět navenek ani vést ke vzteku.', 'Nečekaná poznámka nebo změna plánu tě rozhodí tak, že se chvíli těžko vracíš do pohody.'),
  25: entry('Jde o to, zda tě napadají nápady, které sám/sama považuješ za dobré, nápadité nebo užitečné. Otázka nevyžaduje vynález ani uznání ostatních.'),
  26: entry('Výrok popisuje pocit, že v rozhovorech nemáš mnoho toho, co bys chtěl/a říct nebo přidat. Neříká, že tvé myšlenky mají malou hodnotu.'),
  27: entry('„Měkké srdce“ je obrazné označení pro citlivost vůči trápení druhých a snadný soucit. Nejde o slabost ani o fyzickou vlastnost.', 'Když někdo prožívá něco těžkého, jeho situace se tě citově dotkne.'),
  28: entry('Jde konkrétně o časté zapomínání vrátit použité věci na jejich místo. Posuzuj, jak se to děje u tebe, ne obecnou kvalitu své paměti.'),
  29: entry('Rozrušení je stav, kdy tě něco citově rozhodí a ztratíš svůj obvyklý klid. Můžeš cítit například napětí, smutek nebo vztek. „Snadno“ se ptá, jak lehce se to stává.'),
  30: entry('Představivost je schopnost vytvářet si v mysli představy, situace nebo možnosti, které nejsou právě před tebou. Výrok říká, že ji u sebe nevnímáš jako dobrou. Nejde jen o kreslení nebo uměleckou tvorbu.'),
  31: entry('Výrok se týká toho, zda si na večírku povídáš s více různými lidmi, nebo zůstáváš u jednoho či několika. Pokud na večírky nechodíš, můžeš zvážit podobná společenská setkání. Pokud to nedokážeš posoudit, lze otázku vynechat.'),
  32: entry('Jde o tvůj vlastní vnitřní zájem o ostatní, nejen o to, jak zdvořile působíš. Výrok říká, že se o druhé ve skutečnosti příliš nezajímáš. Malé množství kontaktů samo o sobě o zájmu nerozhoduje.'),
  33: entry('Mít rád/a pořádek znamená, že ti vyhovují uspořádané a přehledné věci. Jde o tvou oblibu pořádku, která se může lišit od toho, kolik na něj máš právě času.'),
  34: entry('Nálada je celkové citové rozpoložení, například dobrá nálada, smutek nebo podráždění. Výrok říká, že se u tebe výrazně mění. Nejde jen o změnu názoru na nějakou věc.'),
  35: entry('Jde o to, zda se v novém vysvětlení nebo situaci obvykle zorientuješ rychle. Posuzuj běžné zkušenosti s porozuměním; nemusíš se porovnávat s konkrétním člověkem.'),
  36: entry('Přitahovat na sebe pozornost znamená být tím, koho si ostatní všímají. Výrok říká, že ti taková pozornost není příjemná nebo ji nevyhledáváš. Neptá se, zda jsi pro druhé zajímavý/á.'),
  37: entry('Jde o ochotu vyhradit druhému člověku část svého času. Neznamená to být k dispozici neustále nebo vždy odložit vlastní potřeby.', 'V běžném dni si najdeš chvíli na to někoho vyslechnout nebo s ním něco probrat.'),
  38: entry('Vyhýbat se povinnostem znamená snažit se uniknout úkolům, které jsou na tobě, nebo se jim opakovaně vyhýbat. Odliš to od situace, kdy je skutečně nemůžeš splnit.'),
  39: entry('Výkyvy nálady jsou přechody mezi různými citovými rozpoloženími. „Časté“ se ptá, jak často se tyto změny u tebe opakují. Samotný výrok neurčuje žádnou poruchu.'),
  40: entry('Složitá slova jsou méně běžné, odborné nebo významově náročnější výrazy. Jde o slova, která sám/sama používáš, nejen o ta, kterým rozumíš. Není to úkol mluvit co nejsložitěji.'),
  41: entry('Být středem pozornosti znamená, že se ostatní soustředí hlavně na tebe. „Nevadí mi“ říká, že to snášíš bez větších nepříjemných pocitů; nemusíš takovou situaci aktivně vyhledávat.'),
  42: entry('Jde o to, zda v tobě emoce druhých vyvolávají podobný vlastní pocit. Je to něco jiného než pouze rozpoznat, co asi cítí.', 'Radost někoho blízkého potěší i tebe nebo se tě jeho smutek citově dotkne.'),
  43: entry('Časový plán říká, kdy se má co udělat. Výrok se ptá, zda se domluveného nebo vlastního rozvrhu obvykle držíš.', 'Na plánované činnosti navazuješ v čase, který sis pro ně vyhradil/a.'),
  44: entry('Podráždění je pocit, že tě něco obtěžuje, vadí ti to nebo v tobě snadno vyvolá mrzutost či vztek. Neznamená to automaticky, že začneš křičet nebo se pohádáš.'),
  45: entry('Jde o čas, který věnuješ přemýšlení nad významem, příčinami nebo souvislostmi věcí. Nemusí jít o odborné téma.', 'Vracíš se k zážitku a přemýšlíš, proč se něco stalo a jak to chápat.'),
  46: entry('Neznámí lidé jsou lidé, které zatím neznáš nebo s nimi nemáš bližší vztah. Výrok se ptá, zda mezi nimi mluvíš málo; mezi blízkými to můžeš mít jinak.'),
  47: entry('Jde o to, zda tvé jednání pomáhá druhým cítit se uvolněně a přijatě. Posuzuj své běžné zkušenosti a reakce lidí, ne jistotu, že víš, co má každý v hlavě.', 'Někdo se v tvé společnosti osmělí nebo ti řekne, že je mu s tebou dobře.'),
  48: entry('Být náročný/á na kvalitu znamená mít vysoké požadavky na vlastní odvedenou práci. „Náročný/á“ se tu vztahuje k výsledku, ne k tomu, zda s tebou mají ostatní těžké pořízení.', 'Záleží ti na pečlivém provedení a všimneš si, když tvůj výsledek nesplňuje tvé požadavky.'),
  49: entry('Sklíčenost je pocit smutku, tíhy nebo pokleslé nálady; člověk může být bez elánu. „Často“ znamená, že se ti tento pocit opakovaně vrací. Posuzuj celý výrok, ne jen to, zda jsi ho někdy zažil/a.', '„Je mi těžko a jsem bez nálady“ přibližuje tento pocit. Samotná odpověď neříká, zda máš depresi.'),
  50: entry('Jde o množství nápadů, které tě napadají: možnosti, řešení nebo náměty. Nemusejí být všechny uskutečnitelné ani mimořádně dobré; na kvalitu nápadů se ptá jiný výrok.')
});

export const INTIMACY_HELP = Object.freeze({
  'dominant-1': entry('Přebírat vedení zde znamená mít po společné domluvě vedoucí roli při intimitě. Nejde o řízení druhého člověka v běžném životě ani o prosazování své vůle proti jeho přání.'),
  'dominant-2': entry('„Svěřit část kontroly“ znamená, že tě druhý dospělý dobrovolně nechá v dohodnuté oblasti rozhodovat. Ptáme se, zda tě přitahuje tato představa, ne zda s ní už máš zkušenost. Domluva neznamená neomezenou moc.'),
  'submissive-1': entry('Přenechat vedení znamená dobrovolně zvolit následující roli při intimitě. Týká se konkrétní dohodnuté situace, ne tvé hodnoty, slabosti nebo povinnosti poslouchat.'),
  'submissive-2': entry('Nechat se vést v domluvených mezích znamená předem si ujasnit, co je a není přijatelné, a v tomto rámci přenechat část vedení druhému. Hranice můžeš změnit a souhlas odvolat.'),
  'switch-1': entry('„Switch“ označuje zájem jak o vedení, tak o přenechání vedení podle situace nebo partnerství. Nemusí tě obě role lákat stejně silně ani současně.'),
  'switch-2': entry('Ptáme se, zda tě přitahuje střídání vedoucí a následující role. Nemusí se střídat během jednoho setkání. Jde o zájem, ne o počet vyzkoušených rolí.'),
  'roleplay-1': entry('Hraní rolí neboli roleplay znamená společně přijmout vymyšlené postavy nebo situaci při intimitě. Všichni zúčastnění jsou dospělí a vědí, že jde o domluvenou hru. Nemusí v ní být vedoucí a následující role.'),
  'roleplay-2': entry('Scénář je společně vymyšlený námět nebo rámec situace. Výrok se ptá na tvůj zájem o toto vymýšlení; nemusíš mít připravený příběh ani zkušenost s jeho uskutečněním.'),
  'sadistic-1': entry('Tady jde pouze o intimní zájem být tím, kdo druhému dospělému poskytuje domluvené bolestivé podněty, které druhý dobrovolně chce. Nejde o radost z nechtěného trápení, krutost nebo násilí bez souhlasu.'),
  'sadistic-2': entry('„Sadistická role“ má v tomto dotazníku úzký význam: dobrovolná role poskytující předem domluvené bolestivé podněty při intimitě mezi dospělými. Není to diagnóza ani hodnocení charakteru. Samotné vedení bez tohoto zájmu je jiná oblast.'),
  'masochistic-1': entry('Tady jde o vlastní zájem přijímat při intimitě domluvené bolestivé podněty. Rozlišuj, zda tě to láká, od toho, že něco jen snášíš kvůli druhému. Nejde o sebepoškozování ani o snášení nechtěného násilí.'),
  'masochistic-2': entry('„Masochistická role“ zde znamená dobrovolně přijímat předem domluvené bolestivé podněty v intimním kontextu. Neznamená potřebu být ponižován/a v běžném životě ani určení diagnózy. Samotné přenechání vedení tento zájem nevyjadřuje.'),
  'restraint-1': entry('Omezení pohybu znamená, že je v domluvené intimní situaci záměrně omezena volnost pohybu. Někdy se používá slovo bondage. Ptáme se na zájem o téma, nikoli na konkrétní způsob nebo jeho bezpečnost.'),
  'restraint-2': entry('Jde o přitažlivost představy dobrovolného omezení pohybu. Otázka nerozlišuje, zda bys omezení přijímal/a, nebo poskytoval/a; odpověď proto neurčuje tvou konkrétní roli.'),
  'equal-1': entry('Jde o intimitu bez domluveného rozdělení na vedoucí a následující roli. Neznamená to, že se musíte ve všem střídat přesně napůl. Tato možnost tě může lákat i vedle jiných rolí.'),
  'equal-2': entry('Iniciativa znamená přicházet s podněty a ovlivňovat průběh. Výrok popisuje uspořádání bez přidělené vedoucí role. Stejná hodnota lidí a právo říct ne platí také u ostatních dobrovolných rolí.'),
  desire: entry('Spontánní zájem je chuť, která se objeví sama, aniž by jí předcházel intimní kontakt. Výrok říká „někdy“; neptá se na každodenní chuť ani na to, zda máš partnera či partnerku.'),
  responsive: entry('Jde o chuť, která se někdy rozvíjí během kontaktu, jenž je ti už sám o sobě příjemný a který chceš. Například při vítaném mazlení může postupně přijít další zájem. Není to pokyn začínat nechtěný kontakt nebo překonávat odmítnutí.'),
  variable: entry('Ptáme se, jak výrazně se tvá chuť mění v různých obdobích nebo situacích. Nejde o to, zda je celkově velká či malá, ani o změnu toho, kdo tě přitahuje.'),
  close: entry('Citová blízkost je pocit vzájemné důvěry, propojení nebo toho, že se s druhým cítíš přijímaný/á. Výrok se ptá, jak je tento pocit důležitý pro tvůj zájem o intimitu.'),
  privacy: entry('Soukromí zde znamená mít prostor bez nechtěného sledování nebo vyrušování. Posuzuj, zda pocit takového klidu podporuje tvůj zájem; ne kolik soukromí máš právě k dispozici.'),
  stress: entry('Stres je pocit tlaku nebo napětí, únava je vyčerpání sil. „Tlumí“ znamená, že při nich tvá chuť obvykle slábne. Nemusí úplně zmizet a neptáme se, jak často jsi ve stresu.'),
  familiar: entry('Vědět, co čekat, znamená mít rámcovou představu o průběhu nebo známém prostředí. Nevyžaduje to přesný scénář. Posuzuj, zda ti předvídatelnost vyhovuje.'),
  novel: entry('„Něco nového“ může být malá změna prostředí či způsobu komunikace i nová aktivita. Ptáme se, zda dobrovolné objevování může podpořit tvůj zájem. Není to souhlas se vším nevyzkoušeným.'),
  communication: entry('Jde o to, zda dokážeš druhému sdělit své preference: co máš rád/a a co ti vyhovuje. Samotné vědění, co chceš, se může lišit od toho, jak snadno to umíš říct.'),
  boundaries: entry('Hranice vyjadřují, co nechceš nebo co už nechceš dál. Výrok se ptá, nakolik dokážeš odmítnutí nebo zastavení sdělit. Pokud je pro tebe říct ne těžké, neznamená to souhlas ani tvoji vinu.'),
  talkfirst: entry('Společný rozhovor znamená předem si říct přání, nejistoty a hranice. Ptáme se na tvoji potřebu takového rozhovoru před novou aktivitou; žádná odpověď nenahrazuje vzájemnou domluvu a souhlas.'),
  aftercare: entry('Péče po intenzivním zážitku se někdy nazývá aftercare. Může pro tebe znamenat klid, blízkost nebo možnost si později říct, jak ti bylo. „Intenzivní“ může být i citový zážitek; nemusí zahrnovat bolest.'),
  cuddle: entry('Mazlení zde znamená něžný tělesný kontakt, například objetí nebo hlazení. Posuzuj svůj zájem o tuto blízkost; nemusí automaticky vést k sexu.'),
  kiss: entry('Jde o líbání v partnerském nebo intimním smyslu. Otázka nevybírá konkrétní podobu ani neříká, s kým a kdy bys o něj stál/a.'),
  massage: entry('Partnerská masáž je doteková péče mezi partnery, která může přinášet uvolnění nebo blízkost. Nemusí zahrnovat genitálie ani mít sexuální pokračování.'),
  solo: entry('Masturbace o samotě znamená vlastní doteky nebo stimulaci vlastního těla pro sexuální potěšení bez přítomnosti dalšího člověka. Ptáme se na zájem, ne na to, jak často to děláš.'),
  manual: entry('Manuální stimulace znamená sexuální doteky rukou na intimních částech těla, například genitáliích. Tato široká položka nerozlišuje poskytování a přijímání; případný zájem nemusí zahrnovat obojí.'),
  oral: entry('Orální sex znamená sexuální kontakt úst s genitáliemi nebo oblastí konečníku. Tato široká položka nerozlišuje konkrétní podobu ani poskytování a přijímání; případný zájem nemusí zahrnovat vše.'),
  penetration: entry('Penetrativní sex zde znamená sexuální aktivitu zahrnující pronikání do pochvy nebo konečníku. Položka nerozlišuje konkrétní podobu ani roli; případný zájem nemusí zahrnovat všechny možnosti.'),
  toys: entry('Intimní pomůcky jsou předměty určené k intimnímu nebo sexuálnímu použití, například vibrátor. Jde o širokou kategorii; zájem o jednu pomůcku neznamená zájem o všechny.'),
  words: entry('Erotická komunikace je vyjadřování intimních přání nebo fantazií slovem či zprávami. Zájem o takovou komunikaci neznamená souhlas se sdílením fotek ani s uskutečněním popsaných fantazií.'),
  sensory: entry('Smyslové podněty jsou vjemy jako hudba, světlo, vůně nebo příjemné povrchy. Ptáme se, zda tě láká jejich zapojení do intimní atmosféry; nemusí ti být příjemné všechny druhy.')
});

const esc = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function questionHelp(kind, id, question) {
  const help = (kind === 'personality' ? PERSONALITY_HELP : INTIMACY_HELP)[id];
  if (!help) throw new Error(`Missing question explanation: ${kind}/${id}`);
  return `<details class="question-help"><summary><span class="question-help-icon" aria-hidden="true">i</span><span>Vysvětlení<span class="sr-only"> otázky: ${esc(question)}</span></span><span class="question-help-chevron" aria-hidden="true">⌄</span></summary><div class="question-help-body"><p>${esc(help.meaning)}</p>${help.example ? `<p class="question-help-example"><strong>Příklad pro představu:</strong> ${esc(help.example)}</p>` : ''}</div></details>`;
}

export const helpHint = '<p class="question-help-hint">Nejasné slovo nebo otázka? Klepni na <span class="question-help-inline-icon" aria-hidden="true">i</span> <strong>Vysvětlení</strong>. Příklady jen přibližují význam; nemusí se ti stát přesně totéž. Odpovídej na původní výrok.</p>';
export const practiceHint = '<p class="question-help-hint"><strong>„Láká mě“</strong> vyjadřuje zájem. <strong>„Možná / chci probrat“</strong> je nejistota nebo potřeba domluvy, ne jistý zájem. <strong>„Nechci“</strong> vyjadřuje odmítnutí, <strong>„Nevím“</strong> zatím nemáš jasno a <strong>„Nechci uvést“</strong> nechceš odpověď sdělit. Žádná odpověď není souhlas s konkrétní aktivitou.</p>';

export function helpMethod(kind) {
  return `<section class="question-help-method"><h2>Vysvětlivky u otázek</h2><p>Texty pod ikonou „i“ a příklady jsou vlastní redakční pomůckou tohoto webu, vytvořenou s pomocí AI. ${kind === 'personality' ? 'Vycházejí z významu anglických položek IPIP a našeho pracovního českého překladu; nejde o oficiální výklad IPIP ani o součást publikované české adaptace.' : 'Objasňují význam pojmů v našem vlastním intimním dotazníku; nejde o převzatý nebo ověřený diagnostický nástroj.'} Neprošly psychometrickým ověřením ani odbornou revizí psychologem. Mohou ovlivnit, jak otázce porozumíš; nelze proto tvrdit, že zachovávají vlastnosti původního měření.</p><p>Příklady nejsou další podmínky pro odpověď. Původní znění, možnosti odpovědí a výpočet zůstávají zachované. Pokud ani s vysvětlením nevíš, jak odpovědět, můžeš otázku vynechat${kind === 'intimacy' ? ' nebo zvolit dostupnou možnost „Nevím“' : ''}.</p><p class="fine-print">Verze vysvětlivek: ${HELP_VERSION} · 29. 10. 2026. Otevření vysvětlivky nemění odpověď a samostatně ho nezaznamenáváme.</p></section>`;
}
