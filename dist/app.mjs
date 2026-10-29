import {questionHelp,helpHint} from './question-help.mjs?v=3.9';
import {createStorageChoice} from './storage-choice.mjs?v=3.8';
import {startPage,resultActions} from './journey.mjs?v=3.7';
import {ITEMS,SCALES,ANCHORS,VERSION,validAnswer,score,answerCount,exportReport} from './instrument.mjs';
import {experimental,sciencePage,privacyPage,readingPage,external} from './content.mjs?v=3.9';
import {createExtensions,methodNav,shareLink} from './extensions.mjs?v=3.9';
import {createProfiles,accountCallout} from './profiles.mjs?v=3.9';
import {createMotion} from './motion.mjs?v=3.1';
import {LOCAL_PROFILE_KEY,createLocalProfileStore} from './local-profile.mjs?v=3.8';

import {createPersonal} from './personal.mjs?v=3.7';

const main = document.querySelector('main');
createMotion(main);
const state = {answers:{},step:0,started:false,finished:false,finishedAt:null,resetScope:'personality'};
const browserStore=createLocalProfileStore(()=>window.localStorage);
const sessionStore=createLocalProfileStore(()=>window.sessionStorage);
const extensions=createExtensions({show:setView,go,getAnswers:()=>state.answers,onComplete:()=>completedTest('intimacy')});
const profiles=createProfiles({show:setView,go,getPersonality:()=>state.answers,getIntimacy:()=>extensions.getAnswers(),restore:snapshot=>{if(Object.keys(snapshot.personality).length){state.answers={...snapshot.personality};state.step=0;state.started=true;state.finished=false;state.finishedAt=null;}if(Object.keys(snapshot.intimacy).length)extensions.restore(snapshot.intimacy);persistBrowserProfile();},clear:()=>{clearCurrentAnswers();browserStore.forget();sessionStore.forget();updateBrowserMemory();}});
const personal=createPersonal({show:setView,getPersonality:()=>state.answers,getIntimacy:()=>extensions.getAnswers()});
const storageChoice=createStorageChoice({choose:(scope,mode)=>{
  profiles.cancelSave();
  const draft=currentDraft();
  const localOk=browserStore.setScope(scope,mode==='device',draft);
  const sessionOk=sessionStore.enable(draft);
  updateBrowserMemory();
  if(mode==='account'){profiles.saveCompleted(scope);return true;}
  if(!localOk||(mode==='session'&&!sessionOk))return false;
  announce(mode==='device'?'Výsledek uložený v tomto prohlížeči.':'Výsledek zůstane jen pro tuto relaci.');
  return true;
}});
function completedTest(scope){persistBrowserProfile();if(scope==='personality'?answerCount(state.answers)>0:extensions.hasAnswers())storageChoice.open(scope);}
const fmt = number => number.toLocaleString('cs-CZ',{minimumFractionDigits:1,maximumFractionDigits:1});
const esc = text => String(text).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const arrow = '<span aria-hidden="true">↗</span>';
const icon = name => ({lock:'<path d="M7 11V7a5 5 0 0 1 10 0v4M5 11h14v10H5z"/><circle cx="12" cy="16" r="1"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',book:'<path d="M3 4h6a3 3 0 0 1 3 3v14a4 4 0 0 0-4-2H3zm18 0h-6a3 3 0 0 0-3 3v14a4 4 0 0 1 4-2h5z"/>',grid:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>'}[name]||'');
const svgIcon = name => `<svg viewBox="0 0 24 24" class="icon" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${icon(name)}</svg>`;
function setView(html,title,active) {
  main.innerHTML=html; document.title=`${title} — Osobnosti`;
  document.querySelectorAll('[data-nav]').forEach(link=>{if(link.dataset.nav===active)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');});
  document.body.dataset.page=active||'other';
  window.scrollTo({top:0,behavior:'instant'}); main.focus({preventScroll:true});
}
function go(hash) {if(location.hash===hash)route();else location.hash=hash;}
function announce(text){document.getElementById('announcement').textContent=text;}

function homePage(){return startPage(state.answers,extensions.getAnswers());}

function introPage() {return `<div class="wrap narrow page-head"><span class="eyebrow">IPIP-50 / PŘED ZAČÁTKEM</span><h1>Odpovídej za sebe.<br><em>Tak, jak to míváš.</em></h1><p class="lead">Padesát výroků, pět možností odpovědi. Bez časového limitu a bez správných odpovědí.</p></div><div class="wrap narrow intro-body">${experimental()}<div class="paper"><h2>Jak na to</h2><p>Popisuj, jaký/á obvykle jsi nyní, ne jaký/á by sis přál/a být. U každého výroku zvaž, nakolik tě vystihuje v běžném životě. Pokud se chováš podle situace různě, zkus vystihnout svůj obvyklý způsob.</p><ol class="instruction-list"><li>Vyber jednu z pěti odpovědí. Střed znamená „ani mě vystihuje, ani nevystihuje“.</li><li>Můžeš se vracet, odpovědi měnit i mazat. Na každé stránce je pět výroků.</li><li>Otázku můžeš nechat bez odpovědi. Její škálu pak vyhodnotíme až po doplnění všech deseti položek.</li></ol><div class="quiet-note">${svgIcon('lock')}<p>Pro návrat bez účtu zapni nahoře „Pamatovat si oba testy v tomto prohlížeči“. Pak se průběžně ukládají i rozpracované odpovědi. Jinak zůstávají jen pro tuto relaci. Po dokončení každého testu si vybereš, kam jeho výsledek uložit.</p></div><div class="actions"><button class="button" data-action="start">${state.started?'Pokračovat':'Začít dotazník'} ${arrow}</button><a href="#podklady" class="text-link">Nejprve si přečíst metodiku</a></div></div><p class="fine-print">Pracovní překlad není klinický nástroj ani ověřená česká adaptace IPIP-BFM-50. Výsledky slouží k orientační sebereflexi.</p></div>`;}

function renderTest(focusId) {
  const pageItems=ITEMS.slice(state.step*5,state.step*5+5);
  const count=answerCount(state.answers);
  const labels=['Vůbec ne','Spíše ne','Ani / ani','Spíše ano','Velmi'];
  setView(`<div class="wrap test-wrap"><div class="test-top"><a class="back-link" href="#domu">← Přehled</a><span>IPIP-50 <span class="test-version">/ český pracovní překlad</span></span><button class="text-button" data-action="reset">Začít znovu</button></div><div class="test-header"><div><span class="eyebrow">TVŮJ OSOBNOSTNÍ PROFIL</span><h1>Jak moc tě to vystihuje?</h1></div><div class="test-page"><strong>${String(state.step+1).padStart(2,'0')}</strong><span>/ 10 částí</span></div></div><div class="progress-meta"><span id="answered-count">${count} z 50 zodpovězeno</span><span>Otázky ${state.step*5+1}–${state.step*5+5}</span></div><progress value="${count}" max="50" aria-label="Počet zodpovězených otázek">${count}/50</progress>
  <p class="test-hint">Odpovídej podle toho, jaký/á obvykle jsi. <a href="#podklady">Český překlad dosud nevalidován.</a></p><div class="scale-legend"><span>1 = vůbec mě nevystihuje</span><span>3 = ani mě vystihuje, ani nevystihuje</span><span>5 = velmi mě vystihuje</span></div>
  ${helpHint}<div class="question-list">${pageItems.map(item=>`<fieldset class="question ${validAnswer(state.answers[item.id])?'is-answered':''}" id="question-${item.id}" tabindex="-1"><legend><span class="question-num">${String(item.id).padStart(2,'0')}</span>${esc(item.cs)}</legend>${questionHelp('personality',item.id,item.cs)}<div class="question-line"><details class="original"><summary>Anglický originál</summary><p lang="en">${esc(item.en)}</p></details><button class="clear-answer" data-action="clear" data-id="${item.id}" ${validAnswer(state.answers[item.id])?'':'hidden'} aria-label="Vymazat odpověď na otázku ${item.id}">Vymazat odpověď</button></div><div class="choices">${ANCHORS.map((anchor,i)=>`<label class="choice"><input type="radio" name="item-${item.id}" value="${i+1}" ${state.answers[item.id]===i+1?'checked':''} aria-label="${i+1} — ${esc(anchor)}"><span class="choice-visual"><b>${i+1}</b><span>${labels[i]}</span></span></label>`).join('')}</div></fieldset>`).join('')}</div>
  <div class="wizard-nav"><button class="button secondary" data-action="prev" ${state.step===0?'disabled':''}>← Předchozí</button><span id="page-count"></span><button class="button" data-action="next">${state.step===9?(count===50?'Zobrazit výsledek':'Zkontrolovat odpovědi'):'Další část'} →</button></div><div class="test-bottom"><a href="#kontrola">Přehled všech odpovědí</a><span>Výpočet probíhá jen v tvém prohlížeči.</span></div></div>`,'Dotazník','home');
  updateProgress();
  if(focusId){const target=document.getElementById(`question-${focusId}`);target?.focus();target?.scrollIntoView({block:'center'});}
}

function updateProgress() {
  const count=answerCount(state.answers);
  const pageCount=ITEMS.slice(state.step*5,state.step*5+5).filter(item=>validAnswer(state.answers[item.id])).length;
  const progress=main.querySelector('progress'); if(progress)progress.value=count;
  const countNode=document.getElementById('answered-count'); if(countNode)countNode.textContent=`${count} z 50 zodpovězeno`;
  if(state.step===9){const next=main.querySelector('[data-action=next]');if(next)next.textContent=(count===50?'Zobrazit výsledek':'Zkontrolovat odpovědi')+' →';}
  const pageNode=document.getElementById('page-count');if(pageNode)pageNode.textContent=`${pageCount} z 5 v této části`;
}

function reviewPage() {
  const count=answerCount(state.answers),complete=score(state.answers).filter(s=>s.complete).length;
  return `<div class="wrap narrow page-head"><span class="eyebrow">PŘED VYHODNOCENÍM</span><h1>Je to tak,<br><em>jak to máš?</em></h1><p class="lead">${count===50?'Všech 50 odpovědí je na místě. Můžeš je ještě upravit, nebo přejít k výsledku.':`Máš zodpovězeno ${count} z 50 položek. Chybějící odpovědi můžeš doplnit klepnutím na jejich číslo.`}</p></div><div class="wrap narrow"><div class="paper"><div class="review-stats"><span><strong>${count}/50</strong> odpovědí</span><span><strong>${complete}/5</strong> úplných škál</span></div><div class="answer-map">${ITEMS.map(item=>`<button class="answer-cell ${validAnswer(state.answers[item.id])?'answered':''}" data-action="edit-item" data-id="${item.id}" aria-label="Otázka ${item.id}, ${validAnswer(state.answers[item.id])?`odpověď ${state.answers[item.id]}`:'bez odpovědi'}">${item.id}${validAnswer(state.answers[item.id])?'<span aria-hidden="true">✓</span>':'<span aria-hidden="true">·</span>'}</button>`).join('')}</div><div class="map-legend"><span><i class="done-swatch"></i> Zodpovězeno</span><span><i></i> Bez odpovědi</span></div>${count<50?`<p class="review-warning">Vyhodnotíme jen škály se všemi deseti odpověďmi. U ostatních zobrazíme, co zbývá doplnit.</p>`:''}<div class="actions"><button class="button" data-action="evaluate" ${count===0?'disabled':''}>${count===50?'Zobrazit můj profil':'Zobrazit dostupné výsledky'} ${arrow}</button><a class="text-link" href="#dotaznik">Zpět k otázkám</a></div></div><div class="below-notice">${experimental(true)}</div></div>`;
}

function resultPage() {
  const results=score(state.answers),complete=results.filter(s=>s.complete);
  if(!answerCount(state.answers))return `<div class="wrap narrow empty-state"><span class="eyebrow">MŮJ PROFIL</span><div class="empty-flower" aria-hidden="true">✳</div><h1>Tvůj profil<br><em>začíná odpověďmi.</em></h1><p class="lead">Vyplň dotazník a tady uvidíš pět rozměrů svého profilu. Uložení do účtu je dobrovolné.</p><a class="button" href="#uvod">Přejít k dotazníku ${arrow}</a></div>`;
  return resultActions()+`<div class="wrap page-head results-heading"><div><span class="eyebrow">TVŮJ OSOBNOSTNÍ PROFIL / IPIP-50</span><h1>Pět rozměrů.<br><em>Tvoje souvislosti.</em></h1><p class="lead">${complete.length===5?'Tady je přehled tvých odpovědí. Ber ho jako výchozí bod pro porozumění svým obvyklým vzorcům.':`Zatím lze vyhodnotit ${complete.length} z pěti škál. U ostatních nejprve doplň chybějící odpovědi.`}</p></div><div class="result-stamp"><span>${answerCount(state.answers)}</span><p>z 50 odpovědí</p><small>${(state.finishedAt||new Date()).toLocaleDateString('cs-CZ')}</small></div></div>
  <div class="wrap">${experimental()}${new Set(Object.values(state.answers)).size===1 && answerCount(state.answers)===50?'<aside class="notice compact"><div><strong>U všech položek máš stejnou odpověď.</strong><p>To samo o sobě neznamená nepravdivé odpovědi. Můžeš zkontrolovat, zda každá odpověď vystihuje právě daný výrok.</p></div></aside>':''}</div>
  <section class="wrap results-overview"><div class="chart-paper"><div class="chart-title"><h2>Mapa tvých odpovědí</h2><span>PRŮMĚR · 1 AŽ 5</span></div>${results.map(s=>`<div class="chart-row" style="--trait:${s.color}"><div class="chart-row-head"><a href="#vysledky" data-jump="result-${s.id}">${s.name}</a><strong>${s.complete?fmt(s.mean):'—'}<small>${s.complete?' / 5':` ${s.answered}/10 odpovědí`}</small></strong></div><div class="score-track ${s.complete?'':'incomplete'}" role="img" aria-label="${esc(s.name)}: ${s.complete?`${fmt(s.mean)} z 5`:'nedokončeno'}"><span class="center-marker"></span>${s.complete?`<span class="score-dot" style="left:${(s.mean-1)/4*100}%"></span>`:''}</div><div class="axis-labels"><span>1</span><span>3</span><span>5</span></div></div>`).join('')}<p class="chart-footnote">Střed stupnice není průměr populace. Graf neukazuje percentily ani procento přesnosti.</p></div><aside class="result-guide"><span class="eyebrow">JAK TOMU ROZUMĚT</span><h2>Hledej situace,<br><em>ve kterých se poznáváš.</em></h2><p>Každá škála shrnuje deset odpovědí. Stejné číslo může vzniknout z různých kombinací; detail níže ti ukáže i konkrétní výroky.</p><p>Všímej si také toho, co na tebe nesedí. Aktuální okolnosti a různé role mohou tvé odpovědi měnit.</p><a class="text-link" href="#jak-cist">Průvodce výsledkem →</a><div class="mini-rule"></div><strong>Žádné české populační normy</strong><p class="small">Tento pracovní překlad nebyl validován. Výsledek není odborný posudek ani diagnóza.</p></aside></section>
  <section class="wrap result-details"><div class="section-heading"><div><span class="eyebrow">DETAIL PROFILU</span><h2>Co jednotlivé škály popisují.</h2></div></div>${results.map((s,i)=>scaleDetail(s,i)).join('')}</section>
  ${accountCallout}${shareLink}<section class="wrap export-panel"><div><span class="eyebrow">ODNES SI, CO JE PRO TEBE UŽITEČNÉ</span><h2>Tvůj profil může zůstat s tebou.</h2><p>Stažení i tisk provádíš do svého zařízení. JSON obsahuje také jednotlivé odpovědi IPIP-50.</p></div><div class="export-buttons"><button class="button" data-action="print">Vytisknout / uložit PDF</button><button class="button secondary" data-action="download-text">Stáhnout shrnutí .txt</button><button class="text-button" data-action="download-json">Stáhnout data .json</button></div></section><div class="wrap final-actions"><a href="#kontrola">Upravit odpovědi</a><a href="#temperament">Mapa temperamentu</a><a href="#podklady">Zdroje a výpočet</a><button class="text-button" data-action="reset">Smazat odpovědi IPIP-50</button></div>`;
}

function scaleDetail(s,index) {
  const items=ITEMS.filter(item=>item.scale===s.id);
  const bandLabel={lower:'NIŽŠÍ ČÁST STUPNICE',middle:'OKOLO STŘEDU STUPNICE',higher:'VYŠŠÍ ČÁST STUPNICE'};
  return `<article class="result-detail" id="result-${s.id}" style="--trait:${s.color}"><div class="detail-heading"><span class="detail-number">0${index+1}</span><div><span class="eyebrow">${s.short}</span><h3>${s.name}</h3></div><div class="detail-score">${s.complete?fmt(s.mean):'—'}<small>${s.complete?'z 5':`${s.answered}/10`}</small></div></div><p class="definition">${s.definition}</p>${s.complete?`<div class="detail-grid"><div><span class="position-tag">${bandLabel[s.band]}</span><p class="interpretation">${s[s.band]}</p><p class="limit"><strong>Co z toho neplyne:</strong> ${s.limit}</p></div><div class="reflection"><span class="eyebrow">OTÁZKY PRO TEBE</span><ul>${s.reflect.map(text=>`<li>${text}</li>`).join('')}</ul></div></div>`:`<p class="incomplete-note">K výpočtu zbývá ${10-s.answered} odpovědí. Chybějící hodnoty nedoplňujeme odhadem.</p><div class="missing-items">${items.filter(item=>!validAnswer(state.answers[item.id])).map(item=>`<button class="button secondary small-button" data-action="edit-item" data-id="${item.id}">Doplnit otázku ${item.id} →</button>`).join('')}</div>`}<details class="calculation-details"><summary>Moje odpovědi a výpočet ${s.complete?`· součet ${s.sum} z 50`:''}</summary><div class="table-scroll"><table><thead><tr><th>Položka</th><th>Odpověď</th><th>Skórování</th><th>Body</th></tr></thead><tbody>${items.map(item=>{const value=state.answers[item.id];return `<tr><th><span class="muted-text">${item.id}.</span> ${esc(item.cs)}</th><td>${validAnswer(value)?value:'—'}</td><td>${item.reverse?'Obrácené':'Přímé'}</td><td>${validAnswer(value)?(item.reverse?6-value:value):'—'}</td></tr>`;}).join('')}</tbody></table></div><p>${s.complete?`${s.sum} ÷ 10 = ${fmt(s.mean)}. `:'Skóre se počítá až z deseti odpovědí. '}U obrácených položek platí 6 − odpověď. <a href="#podklady">Zdroj klíče a pravidla interpretace →</a></p></details></article>`;
}

function download(type){
  const report=exportReport(state.answers,state.finishedAt||new Date());
  let text,mime,extension;
  if(type==='json'){text=JSON.stringify(report,null,2);mime='application/json';extension='json';}
  else {text=['OSOBNOSTI — ORIENTAČNÍ PROFIL IPIP-50',`Datum: ${new Date(report.createdAt).toLocaleString('cs-CZ')}`,`Verze: ${VERSION}`,'Vlastní český pracovní překlad — DOSUD NEVALIDOVANÝ. Není adaptací Hřebíčkové et al. (2023).','Bez českých norem a percentilů. Výsledek není diagnóza.','',...score(state.answers).flatMap(s=>[s.name,s.complete?`Průměr ${fmt(s.mean)} z 5; součet ${s.sum} z 50.`:`Nedokončeno: ${s.answered}/10 odpovědí.`,s.complete?s[s.band]:'Skóre nelze spočítat.',s.limit,...s.reflect.map(t=>`K zamyšlení: ${t}`),'']),'Popisné oblasti 1–2,5; více než 2,5 a méně než 3,5; 3,5–5 jsou konvence tohoto webu, nikoli normy.','Zdroje:',...Object.values(report.sources),'Související jiná česká adaptace: https://doi.org/10.51561/cspsych.67.2.101'].join('\n');mime='text/plain';extension='txt';}
  const url=URL.createObjectURL(new Blob([type==='json'?'':'\ufeff',text],{type:`${mime};charset=utf-8`}));
  const date=new Date(report.createdAt),dateLabel=[date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');
  const link=document.createElement('a');link.href=url;link.download=`osobnosti-ipip50-${dateLabel}.${extension}`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);announce('Soubor s výsledkem byl připraven ke stažení.');
}

function route() {
  const hash=location.hash||'#domu';
  document.body.dataset.testing=String(['#dotaznik','#intimita-dotaznik'].includes(hash));
  if(hash==='#main')return main.focus();
  if(personal.route(hash))return;
  if(profiles.route(hash))return;
  if(extensions.route(hash))return;
  if(hash==='#dotaznik'){state.started=true;renderTest();return;}
  if(hash==='#uvod')setView(introPage(),'Před začátkem','home');
  else if(hash==='#kontrola')setView(reviewPage(),'Kontrola odpovědí','home');
  else if(hash==='#vysledky')setView(resultPage(),'Můj profil','results');
  else if(hash==='#podklady')setView(methodNav('ipip')+sciencePage(),'Na čem to stojí','science');
  else if(hash==='#soukromi')setView(privacyPage(),'Soukromí');
  else if(hash==='#jak-cist')setView(readingPage(),'Jak číst výsledky');
  else {setView(homePage(),'Poznej své vzorce','home');if(hash==='#testy')document.getElementById('testy')?.scrollIntoView();}
}

document.addEventListener('change',event=>{
  const input=event.target;
  if(!(input instanceof HTMLInputElement)||input.type!=='radio'||!input.name.startsWith('item-'))return;
  const id=Number(input.name.slice(5)),value=Number(input.value);
  if(!ITEMS.some(item=>item.id===id)||!validAnswer(value))return;
  state.answers[id]=value;state.finished=false;state.finishedAt=null;
  const question=document.getElementById(`question-${id}`);question?.classList.add('is-answered');question?.querySelector('.clear-answer')?.removeAttribute('hidden');updateProgress();
});
document.addEventListener('click',event=>{
  const jump=event.target.closest('[data-jump]');
  if(jump){event.preventDefault();const target=document.getElementById(jump.dataset.jump);if(target?.tagName==='DETAILS')target.open=true;document.getElementById(jump.dataset.jump)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});return;}
  const button=event.target.closest('[data-action]');if(!button)return;
  const action=button.dataset.action;
  if(action==='start'){state.started=true;go('#dotaznik');}
  if(action==='prev'&&state.step>0){state.step--;renderTest();}
  if(action==='next'){if(state.step<9){state.step++;renderTest();}else if(answerCount(state.answers)===50){state.finished=true;state.finishedAt=new Date();go('#vysledky');completedTest('personality');}else go('#kontrola');}
  if(action==='clear'){const id=Number(button.dataset.id);delete state.answers[id];state.finished=false;state.finishedAt=null;const question=document.getElementById(`question-${id}`);question?.querySelectorAll('input').forEach(input=>input.checked=false);question?.classList.remove('is-answered');button.hidden=true;question?.querySelector('input')?.focus();updateProgress();announce(`Odpověď na otázku ${id} byla vymazána.`);}
  if(action==='edit-item'){const id=Number(button.dataset.id);state.step=Math.floor((id-1)/5);if(location.hash==='#dotaznik')renderTest(id);else {location.hash='#dotaznik';window.addEventListener('hashchange',()=>{const el=document.getElementById(`question-${id}`);el?.focus();el?.scrollIntoView({block:'center'});},{once:true});}}
  if(action==='evaluate'){state.finished=true;state.finishedAt=new Date();go('#vysledky');completedTest('personality');}
  if(action==='reset'){const dialog=document.getElementById('reset-dialog');state.resetScope=button.dataset.scope||'personality';document.getElementById('reset-description').textContent=state.resetScope==='all'?'Smažou se odpovědi a výsledky všech testů: osobnost, temperament i intimní profil. Už stažené soubory a obrázky zůstanou v zařízení.':state.resetScope==='intimacy'?'Smažou se pouze intimní odpovědi, role a preference. Osobnostní profil zůstane. Už stažené soubory a obrázky zůstanou v zařízení.':'Smažou se odpovědi IPIP-50 a mapa temperamentu. Intimní profil zůstane. Už stažené soubory a obrázky zůstanou v zařízení.';document.getElementById('reset-description').textContent+=' Smaže je i z místní kopie v tomto prohlížeči. Uložené výsledky a kódy na serveru spravuješ zvlášť v Účtu.';dialog.returnValue='';dialog.showModal();}
  if(action==='download-text')download('text');
  if(action==='download-json')download('json');
  if(action==='print')window.print();
});
document.getElementById('reset-dialog').addEventListener('close',event=>{if(event.target.returnValue==='reset'){profiles.cancelSave();personal.reset();if(state.resetScope!=='intimacy'){state.answers={};state.step=0;state.started=false;state.finished=false;state.finishedAt=null;}if(state.resetScope!=='personality')extensions.reset();if(state.resetScope==='all'){profiles.clearComparison();profiles.cancelSave();browserStore.forget();sessionStore.forget();updateBrowserMemory();}else persistBrowserProfile();go(state.resetScope==='intimacy'?'#intimita':state.resetScope==='all'?'#testy':'#uvod');announce('Vybrané odpovědi a výsledky byly smazány. Můžeš začít znovu.');}});
window.addEventListener('hashchange',route);
window.addEventListener('beforeunload',event=>{if(!browserStore.info().saved&&!sessionStore.info().saved&&(answerCount(state.answers)>0||extensions.hasAnswers())){event.preventDefault();event.returnValue='';}});
function currentDraft(){return {personality:state.answers,intimacy:extensions.getAnswers(),personalityStep:state.step,intimacyStep:extensions.getStep(),finishedAt:state.finishedAt?.toISOString()||null};}
function clearCurrentAnswers(){profiles.cancelSave();personal.reset();state.answers={};state.step=0;state.started=false;state.finished=false;state.finishedAt=null;extensions.reset();profiles.clearComparison();}
function updateBrowserMemory(){
  const info=browserStore.info(),box=document.getElementById('remember-profile');
  const messages={off:'Dlouhodobá místní kopie není uložená. Odpovědi zůstávají jen pro tuto relaci.',saved:'Vybrané testy se obnoví po zavření a novém otevření tohoto prohlížeče. Ostatní odpovědi jsou pouze pro tuto relaci.',restored:'Profil obnoven z tohoto prohlížeče. Další změny se ukládají průběžně.',invalid:'Uložená data jsou poškozená nebo z jiné verze a nešla obnovit. Zapnutím začneš novou místní kopii.','read-error':'Úložiště prohlížeče není dostupné. Obnovení ani uložení se nepodařilo.','write-error':'Uložení se nepodařilo. Poslední změny jsou jen v otevřené kartě; můžeš si je stáhnout.','delete-error':'Místní kopii se nepodařilo smazat. Odstraň data tohoto webu v nastavení prohlížeče.',conflict:'Profil se změnil v jiné kartě. Zde je ukládání pozastavené, aby se změny nepřepsaly. Pro načtení uložené verze obnov stránku.','external-cleared':'Místní profil byl smazán v jiné kartě. Odpovědi jsme odstranili i tady.'};
  box.checked=info.enabled&&info.scopes.length===2;box.indeterminate=info.enabled&&info.scopes.length===1;box.disabled=info.conflict;
  document.getElementById('browser-memory').hidden=false;
  document.getElementById('browser-memory').dataset.error=String(['invalid','read-error','write-error','delete-error','conflict'].includes(info.status));
  document.getElementById('memory-summary').textContent=info.saved?'V zařízení: '+info.scopes.map(s=>s==='personality'?'osobnost':'intimita').join(' + '):info.enabled?'Ukládání: zkontroluj stav':sessionStore.info().saved?'Ukládání: jen pro tuto relaci':'Ukládání: jen v otevřené stránce';
  if(['invalid','read-error','write-error','delete-error','conflict'].includes(info.status))document.getElementById('browser-memory').open=true;
  const label=document.getElementById('browser-memory-status');const text=messages[info.status]+(!sessionStore.info().saved&&(answerCount(state.answers)||extensions.hasAnswers())?' Relaci se nepodařilo uložit; poslední odpovědi jsou jen v otevřené stránce.':'');if(label.textContent!==text)label.textContent=text;
}
function persistBrowserProfile(){personal.invalidate();sessionStore.enable(currentDraft());browserStore.save(currentDraft());if(browserStore.info().status==='external-cleared'){clearCurrentAnswers();sessionStore.forget();route();}updateBrowserMemory();}
document.addEventListener('change',event=>{
  const el=event.target;
  if(el.id==='remember-profile'){sessionStore.enable(currentDraft());if(el.checked)browserStore.enable(currentDraft());else browserStore.forget();updateBrowserMemory();return;}
  if(el.matches('input[name^="item-"],[data-intimate]'))persistBrowserProfile();
});
document.addEventListener('click',event=>{
  const b=event.target.closest('button');if(!b)return;
  if(['start','prev','next','clear','edit-item','evaluate'].includes(b.dataset.action)||['start-intimacy','prev','next','edit','clear-item'].includes(b.dataset.ext))persistBrowserProfile();
});
window.addEventListener('storage',event=>{
  if(event.key!==LOCAL_PROFILE_KEY&&event.key!==null)return;
  const change=browserStore.checkExternal();
  if(change==='cleared'){clearCurrentAnswers();sessionStore.forget();route();}
  updateBrowserMemory();
});
const localRecovered=browserStore.load(),sessionRecovered=sessionStore.load();
const recovered=sessionRecovered||localRecovered;
if(recovered&&localRecovered){for(const scope of browserStore.info().scopes){recovered[scope]=localRecovered[scope];recovered[scope+'Step']=localRecovered[scope+'Step'];if(scope==='personality')recovered.finishedAt=localRecovered.finishedAt;}}
if(recovered){state.answers=recovered.personality;state.step=recovered.personalityStep;state.started=answerCount(state.answers)>0;state.finishedAt=recovered.finishedAt?new Date(recovered.finishedAt):null;state.finished=Boolean(state.finishedAt);extensions.restore(recovered.intimacy,recovered.intimacyStep);if(!location.hash&&(state.started||extensions.hasAnswers()))history.replaceState(null,'','#profil');}
updateBrowserMemory();
route();
