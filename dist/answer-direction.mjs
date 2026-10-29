// Linguistic negation is not the same thing as reverse scoring.
// These optional reading aids describe response endpoints; they never change values.
export const ANSWER_DIRECTIONS = Object.freeze({
  2: ['Záleží mi na tom, jak se druhým daří.', 'Příliš mi nezáleží na tom, jak se druhým daří.'],
  6: ['Obvykle toho namluvím hodně.', 'Obvykle toho moc nenamluvím.'],
  10: ['Abstraktním myšlenkám rozumím snadno.', 'Abstraktním myšlenkám rozumím obtížně.'],
  19: ['Sklíčenost zažívám často.', 'Sklíčenost zažívám jen zřídka.'],
  20: ['Abstraktní myšlenky mě zajímají.', 'Abstraktní myšlenky mě nezajímají.'],
  22: ['Problémy jiných lidí mě zajímají.', 'Problémy jiných lidí mě nezajímají.'],
  26: ['V rozhovorech mám hodně co říct.', 'V rozhovorech toho mám málo co říct.'],
  30: ['Mám dobrou představivost.', 'Nemám dobrou představivost.'],
  32: ['O druhé se ve skutečnosti zajímám.', 'O druhé se ve skutečnosti příliš nezajímám.'],
  36: ['Přitahovat na sebe pozornost mi nevadí.', 'Nerad/a na sebe přitahuji pozornost.'],
  41: ['Být středem pozornosti mi vadí.', 'Být středem pozornosti mi nevadí.'],
  49: ['Sklíčenost zažívám jen zřídka.', 'Sklíčenost zažívám často.']
});

export function answerDirection(id) {
  const ends = ANSWER_DIRECTIONS[id];
  if (!ends) return '';
  return `<div class="answer-direction"><p class="answer-direction-title">U téhle věty znamenají krajní odpovědi:</p><div class="answer-direction-ends">${ends.map((text,i)=>`<p id="answer-direction-${id}-${i?5:1}"><b>${i?5:1} znamená</b><span>${text}</span></p>`).join('')}</div></div>`;
}

export function answerDescription(id, value) {
  return ANSWER_DIRECTIONS[id] && (value===1 || value===5) ? ` aria-describedby="answer-direction-${id}-${value}"` : '';
}
