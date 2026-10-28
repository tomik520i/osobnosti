import {ITEMS,VERSION,validAnswer} from './instrument.mjs';
import {INTIMACY_VERSION,validIntimate} from './extensions-data.mjs';

export const LOCAL_PROFILE_KEY='osobnosti_test.browser-profile.v1';
const object=value=>value&&typeof value==='object'&&!Array.isArray(value);
const step=(value,max)=>Number.isInteger(value)&&value>=0&&value<=max?value:0;

// Store answers, not rendered results, login credentials, or comparison codes.
export function cleanDraft(value={}) {
  if(!object(value))value={};
  const personality=Object.fromEntries(ITEMS.filter(item=>validAnswer(value.personality?.[item.id])).map(item=>[item.id,value.personality[item.id]]));
  const intimacy=Object.fromEntries(Object.entries(object(value.intimacy)?value.intimacy:{}).filter(([id,v])=>(typeof v==='number'||typeof v==='string')&&validIntimate(id,v)));
  const finishedAt=typeof value.finishedAt==='string'&&Number.isFinite(Date.parse(value.finishedAt))?new Date(value.finishedAt).toISOString():null;
  return {personality,intimacy,personalityStep:step(value.personalityStep,9),intimacyStep:step(value.intimacyStep,7),finishedAt};
}

export function decodeDraft(raw) {
  if(typeof raw!=='string'||raw.length>32768)return null;
  try {
    const data=JSON.parse(raw);
    if(!object(data)||data.version!==1||data.ipipVersion!==VERSION||data.intimacyVersion!==INTIMACY_VERSION||!object(data.draft))return null;
    return cleanDraft(data.draft);
  } catch {return null;}
}

export function createLocalProfileStore(getStorage) {
  let enabled=false,lastRaw=null,status='off',scopes=['personality','intimacy'];
  const info=()=>({enabled,status,scopes:[...scopes],saved:enabled&&(status==='saved'||status==='restored'),conflict:status==='conflict'});
  function load(){
    try {
      lastRaw=getStorage().getItem(LOCAL_PROFILE_KEY);
      if(lastRaw===null){status='off';return null;}
      const draft=decodeDraft(lastRaw);
      if(!draft){status='invalid';return null;}
      const data=JSON.parse(lastRaw);
      scopes=Array.isArray(data.scopes)?['personality','intimacy'].filter(s=>data.scopes.includes(s)):['personality','intimacy'];
      enabled=true;status='restored';return draft;
    }catch{status='read-error';return null;}
  }
  function checkExternal(){
    try {
      const current=getStorage().getItem(LOCAL_PROFILE_KEY);
      if(current===lastRaw)return null;
      enabled=false;
      if(current===null){lastRaw=null;status='external-cleared';return 'cleared';}
      status='conflict';return 'changed';
    }catch{status='read-error';return 'error';}
  }
  function save(draft){
    if(!enabled)return false;
    if(checkExternal())return false;
    try {
      const filtered=cleanDraft(draft);
      if(!scopes.includes('personality')){filtered.personality={};filtered.personalityStep=0;filtered.finishedAt=null;}
      if(!scopes.includes('intimacy')){filtered.intimacy={};filtered.intimacyStep=0;}
      const raw=JSON.stringify({version:1,ipipVersion:VERSION,intimacyVersion:INTIMACY_VERSION,scopes,draft:filtered});
      if(raw!==lastRaw)getStorage().setItem(LOCAL_PROFILE_KEY,raw);
      lastRaw=raw;status='saved';return true;
    }catch{status='write-error';return false;}
  }
  function enable(draft){
    if(status==='conflict')return false;
    if(checkExternal())return false;
    scopes=['personality','intimacy'];enabled=true;return save(draft);
  }
  function setScope(scope,remember,draft){
    if(!['personality','intimacy'].includes(scope)||status==='conflict'||checkExternal())return false;
    const selected=new Set(enabled?scopes:[]);
    if(remember)selected.add(scope);else selected.delete(scope);
    scopes=[...selected];
    if(!scopes.length)return forget();
    enabled=true;return save(draft);
  }
  function forget(){
    enabled=false;
    try {getStorage().removeItem(LOCAL_PROFILE_KEY);lastRaw=null;status='off';return true;}
    catch {status='delete-error';return false;}
  }
  return {load,save,enable,setScope,forget,checkExternal,info};
}
