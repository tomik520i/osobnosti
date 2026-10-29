import {ROLE_ITEMS} from './extensions-data.mjs';
// Linguistic negation is not the same thing as reverse scoring.
// These optional reading aids describe response endpoints; they never change values.
export const ANSWER_DIRECTIONS = Object.freeze({
  2: ['Záleží mi na tom, jak se druhým daří.', 'Příliš mi nezáleží na tom, jak se druhým daří.'],
  3: ['Být připravený/á pro mě není typické.', 'Bývám připraven/a téměř vždy.'],
  4: ['Do stresu se snadno nedostávám.', 'Do stresu se dostávám snadno.'],
  6: ['Obvykle toho namluvím hodně.', 'Obvykle toho moc nenamluvím.'],
  8: ['Věci různě povalovat obvykle nenechávám.', 'Věci obvykle nechávám různě povalovat.'],
  9: ['Většinu času v klidu nebývám.', 'Většinu času jsem v klidu.'],
  10: ['Abstraktním myšlenkám rozumím snadno.', 'Abstraktním myšlenkám rozumím obtížně.'],
  12: ['Lidi urážím zřídka nebo vůbec.', 'Urážlivé poznámky jsou pro mě typické.'],
  14: ['Starosti si dělám zřídka nebo vůbec.', 'Dělám si starosti kvůli různým věcem.'],
  16: ['Ve skupině se obvykle nedržím v pozadí.', 'Ve skupině se obvykle držím v pozadí.'],
  18: ['Nepořádek po mně obvykle nezůstává.', 'Ve věcech obvykle dělám nepořádek.'],
  19: ['Sklíčenost zažívám často.', 'Sklíčenost zažívám zřídka nebo vůbec.'],
  20: ['Abstraktní myšlenky mě zajímají.', 'Abstraktní myšlenky mě nezajímají.'],
  22: ['Problémy jiných lidí mě zajímají.', 'Problémy jiných lidí mě nezajímají.'],
  23: ['Běžné povinnosti obvykle odkládám.', 'Běžné povinnosti obvykle vyřizuji bez odkládání.'],
  24: ['Vyrovnanost neztrácím snadno.', 'Snadno mě něco rozhodí.'],
  26: ['V rozhovorech mám hodně co říct.', 'V rozhovorech toho mám málo co říct.'],
  28: ['Na vracení věcí na místo obvykle nezapomínám.', 'Na vracení věcí na místo často zapomínám.'],
  29: ['Snadno se nerozruším.', 'Snadno se rozruším.'],
  30: ['Mám dobrou představivost.', 'Nemám dobrou představivost.'],
  32: ['O druhé se ve skutečnosti zajímám.', 'O druhé se ve skutečnosti příliš nezajímám.'],
  34: ['Má nálada se příliš nemění.', 'Má nálada se hodně mění.'],
  36: ['Přitahovat na sebe pozornost mi nevadí.', 'Nerad/a na sebe přitahuji pozornost.'],
  38: ['Svým povinnostem se nevyhýbám.', 'Svým povinnostem se vyhýbám.'],
  39: ['Výkyvy nálady mívám zřídka nebo vůbec.', 'Výkyvy nálady mívám často.'],
  41: ['Být středem pozornosti mi vadí.', 'Být středem pozornosti mi nevadí.'],
  44: ['Snadno se nepodráždím.', 'Snadno mě něco podráždí.'],
  46: ['Mezi neznámými lidmi nebývám tichý/á.', 'Mezi neznámými lidmi bývám tichý/á.'],
  48: ['Na kvalitu své práce mám malé nároky.', 'Na kvalitu své práce mám vysoké nároky.'],
  49: ['Sklíčenost zažívám zřídka nebo vůbec.', 'Sklíčenost zažívám často.']
});

const INTIMACY_DIRECTIONS=Object.freeze({
  desire:['Spontánní sexuální zájem u sebe nepozoruji.','Sexuální zájem se u mě někdy objeví sám.'],
  responsive:['Rozvoj zájmu v příjemném, chtěném kontaktu u sebe nepozoruji.','V příjemném kontaktu, který chci, se můj zájem někdy rozvíjí.'],
  variable:['Má chuť se podle situace příliš nemění.','Má chuť se podle období nebo situace výrazně mění.'],
  close:['Citová blízkost pro můj zájem není důležitá.','Citová blízkost je pro můj zájem velmi důležitá.'],
  privacy:['Soukromí mou chuť nepodporuje.','Soukromí mou chuť podporuje.'],
  stress:['Stres nebo únava mou chuť obvykle netlumí.','Stres nebo únava mou chuť obvykle tlumí.'],
  familiar:['Vědět předem, co čekat, mi nevyhovuje.','Vyhovuje mi vědět předem, co čekat.'],
  novel:['Objevování nového můj zájem nepodporuje.','Dobrovolné objevování nového může můj zájem podpořit.'],
  communication:['Sdělit, co mi vyhovuje, je pro mě obtížné.','Dokážu sdělit, co mi vyhovuje.'],
  boundaries:['Říct ne nebo stop je pro mě obtížné.','Dokážu říct ne nebo stop.'],
  talkfirst:['Před novou aktivitou společný rozhovor nepotřebuji.','Před novou aktivitou společný rozhovor potřebuji.'],
  aftercare:['Klid, blízkost nebo ohlédnutí po zážitku neoceňuji.','Klid, blízkost nebo ohlédnutí po zážitku oceňuji.']
});
const roleIds=new Set(ROLE_ITEMS.map(x=>x.id));
export function intimacyAnswerMeaning(id,value){
  if(value!==1&&value!==5)return '';
  if(roleIds.has(id))return value===1?'Tahle představa mě vůbec neláká.':'Tahle představa mě velmi láká.';
  return INTIMACY_DIRECTIONS[id]?.[value===1?0:1]||'';
}
const esc=text=>String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const meaning=(kind,id,value)=>kind==='intimacy'?intimacyAnswerMeaning(id,value):answerMeaning(id,value);
export function answerLabel(kind,id,value,anchor){const text=meaning(kind,id,value);return text?`<strong class="answer-meaning">${esc(text)}</strong><small class="answer-anchor">Výrok: ${esc(anchor)}</small>`:esc(anchor);}
export function answerAria(kind,id,value,anchor){const text=meaning(kind,id,value);return esc(`${value} — ${text?text+' Výrok: ':''}${anchor}`);}

export function answerMeaning(id,value){return ANSWER_DIRECTIONS[id] && (value===1 || value===5) ? ANSWER_DIRECTIONS[id][value===1?0:1] : '';}
