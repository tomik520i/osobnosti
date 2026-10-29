import {cleanDraft} from './local-profile.mjs?v=3.8';
import {ITEMS,ANCHORS,VERSION,score} from './instrument.mjs';
import {INTIMACY_VERSION,ROLE_ITEMS,CONTEXT_ITEMS,PRACTICES,PRACTICE_CHOICES,roleScores} from './extensions-data.mjs';

// Public browser-storage name, not a credential.
export const RETAKE_KEY='osobnosti_test.retakes.v1'; // gitleaks:allow
const scopes=['personality','intimacy'];
const copy=value=>JSON.parse(JSON.stringify(value));
const signature=answers=>JSON.stringify(Object.entries(answers).sort(([a],[b])=>a.localeCompare(b)));
function part(scope,draft){
  const clean=cleanDraft(draft);
  return {answers:clean[scope],step:clean[scope+'Step'],finishedAt:scope==='personality'?clean.finishedAt:null};
}
function cleanPart(scope,value){return part(scope,{[scope]:value?.answers,[scope+'Step']:value?.step,finishedAt:value?.finishedAt});}
function put(scope,draft,value){
  draft[scope]=copy(value.answers);draft[scope+'Step']=value.step;
  if(scope==='personality')draft.finishedAt=value.finishedAt;
}

// Published answers and new attempts stay separate until the person chooses replacement.
// Only new attempts use this tab's sessionStorage; persistent storage keeps the old result.
export function createRetakes(getStorage){
  let attempts={},saved=true;
  function persist(){
    try{
      if(Object.keys(attempts).length)getStorage().setItem(RETAKE_KEY,JSON.stringify({version:1,ipipVersion:VERSION,intimacyVersion:INTIMACY_VERSION,attempts}));
      else getStorage().removeItem(RETAKE_KEY);
      saved=true;
    }catch{saved=false;}
    return saved;
  }
  function begin(scope,draft){
    if(!scopes.includes(scope)||attempts[scope])return false;
    const original=part(scope,draft);
    if(!Object.keys(original.answers).length)return false;
    attempts[scope]={original,draft:part(scope,{})};persist();return true;
  }
  function checkpoint(draft){for(const scope of scopes)if(attempts[scope])attempts[scope].draft=part(scope,draft);return persist();}
  function published(draft){const result=cleanDraft(draft);for(const scope of scopes)if(attempts[scope])put(scope,result,attempts[scope].original);return result;}
  function restore(current){
    const result=cleanDraft(current);attempts={};let rejected=false;
    try{
      const raw=getStorage().getItem(RETAKE_KEY);
      if(raw===null)return {draft:result,rejected:false};
      if(raw.length>65536)throw Error('Oversize draft');
      const data=JSON.parse(raw);
      if(data.version!==1||data.ipipVersion!==VERSION||data.intimacyVersion!==INTIMACY_VERSION||!data.attempts||typeof data.attempts!=='object')throw Error('Incompatible draft');
      for(const scope of scopes){
        if(!data.attempts[scope])continue;
        const original=cleanPart(scope,data.attempts[scope].original);
        // Never resurrect a deleted result or replace a newer result from another tab/device.
        if(!Object.keys(original.answers).length||signature(original.answers)!==signature(result[scope])||(scope==='personality'&&original.finishedAt!==result.finishedAt)){rejected=true;continue;}
        const draft=cleanPart(scope,data.attempts[scope].draft);
        attempts[scope]={original,draft};put(scope,result,draft);
      }
      persist();
    }catch{rejected=true;attempts={};persist();}
    return {draft:result,rejected};
  }
  function end(scope){delete attempts[scope];persist();}
  function clear(scope){if(scope&&scope!=='all')delete attempts[scope];else attempts={};persist();}
  return {begin,checkpoint,published,restore,end,clear,has:scope=>Boolean(attempts[scope]),scopes:()=>Object.keys(attempts),original:scope=>attempts[scope]?copy(attempts[scope].original):null,isSaved:()=>saved};
}

const esc=text=>String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number=value=>value===null?'Nedokončeno':value.toLocaleString('cs-CZ',{maximumFractionDigits:1})+' / 5';
const answer=(scope,value)=>value===undefined?'Bez odpovědi':typeof value==='number'?(scope==='personality'?ANCHORS[value-1]:['Vůbec mě nevystihuje','Spíše mě nevystihuje','Částečně mě vystihuje','Spíše mě vystihuje','Velmi mě vystihuje'][value-1]):value==='na'?'Nevím / netýká se mě':value==='skip'?'Nechci uvést':PRACTICE_CHOICES[value];

export function retakeBanner(scope){return `<aside class="retake-banner"><div><strong>Vyplňuješ nový pokus</strong><p>Původní výsledek zůstává zachovaný. Až skončíš, vybereš, zda ho chceš nahradit.</p></div><button class="text-button" data-action="retake-finish" data-scope="${scope}">Porovnat s původním / rozhodnout</button></aside>`;}

export function createRetakeDecision({choose}){
  const dialog=document.createElement('dialog');dialog.className='storage-dialog retake-dialog';dialog.setAttribute('aria-labelledby','retake-title');document.body.append(dialog);
  let scope=null;
  function open(part,original,candidate){
    scope=part;
    const items=part==='personality'?ITEMS:[...ROLE_ITEMS,...CONTEXT_ITEMS,...PRACTICES];
    const oldScores=part==='personality'?score(original):roleScores(original),newScores=part==='personality'?score(candidate):roleScores(candidate);
    const answered=items.filter(x=>candidate[x.id]!==undefined).length;
    const changes=items.filter(x=>original[x.id]!==candidate[x.id]);
    dialog.innerHTML=`<span class="eyebrow">NOVÝ POKUS · ${part==='personality'?'OSOBNOST':'INTIMITA'}</span><h2 id="retake-title">Nahradit původní výsledek?</h2><p>Nový pokus má ${answered} z ${items.length} odpovědí. ${changes.length?`Od původního se liší ${changes.length} odpovědí.`:'Odpovědi jsou stejné jako v původním výsledku.'}${answered<items.length?' Ještě můžeš doplnit chybějící odpovědi.':''}</p><div class="retake-score-table"><table><thead><tr><th>Oblast</th><th>Původní</th><th>Nový</th></tr></thead><tbody>${newScores.map((s,i)=>`<tr><th>${esc(s.name)}</th><td>${number(oldScores[i].mean)}</td><td>${number(s.mean)}</td></tr>`).join('')}</tbody></table></div><details class="retake-answer-changes"><summary>Porovnat změněné odpovědi (${changes.length})</summary>${changes.length?changes.map(x=>`<div><strong>${esc(x.cs||x.text||x.name)}</strong><p>Původní: ${esc(answer(part,original[x.id]))}<br>Nová: ${esc(answer(part,candidate[x.id]))}</p></div>`).join(''):'<p>Všechny odpovědi se shodují.</p>'}</details><p class="fine-print">Nahradíš aktuální výsledek tohoto testu v tomto prohlížeči. Druhý test zůstane zachovaný. Na účtu můžeš nový výsledek následně uložit zvlášť; dříve uložené výsledky a jejich porovnávací kódy zůstávají platné.</p><div class="storage-options"><button class="storage-option" data-retake-choice="replace" ${answered?'':'disabled'}><strong>Použít nový výsledek</strong><span>Nahradí původní odpovědi tohoto testu. Potom vybereš, kam ho uložit.</span></button><button class="storage-option" data-retake-choice="keep"><strong>Ponechat původní výsledek</strong><span>Ukončí tento nový pokus a vrátí původní odpovědi.</span></button></div><p class="retake-error" role="alert"></p><button class="text-button" data-retake-choice="back">Ještě upravit nový pokus</button>`;
    dialog.showModal();
  }
  dialog.addEventListener('click',event=>{
    const action=event.target.closest('[data-retake-choice]')?.dataset.retakeChoice;if(!action)return;
    if(action==='back'){dialog.close();choose(scope,'back');return;}
    const error=choose(scope,action);
    if(error){dialog.querySelector('.retake-error').textContent=error;return;}
    dialog.close();
  });
  dialog.addEventListener('cancel',event=>{event.preventDefault();dialog.close();choose(scope,'back');});
  return {open,close:()=>dialog.close()};
}
