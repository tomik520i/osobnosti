import {score,VERSION} from './instrument.mjs';
import {roleScores,CONTEXT_ITEMS,PRACTICES,INTIMACY_VERSION,validIntimate} from './extensions-data.mjs';
export function currentPublicProfile(personality,intimacy,scopes=['personality']){
  const out={id:'current-browser-profile',created:Math.floor(Date.now()/1000),ipipVersion:VERSION,intimacyVersion:INTIMACY_VERSION,scopes:[...new Set(scopes.filter(s=>['personality','roles','context','practices'].includes(s)))]};
  if(out.scopes.includes('personality'))out.personality=Object.fromEntries(score(personality).map(s=>[s.id,s.mean]));
  if(out.scopes.includes('roles'))out.roles=Object.fromEntries(roleScores(intimacy).map(s=>[s.id,s.mean]));
  for(const [scope,items] of [['context',CONTEXT_ITEMS],['practices',PRACTICES]])if(out.scopes.includes(scope))out[scope]=Object.fromEntries(items.filter(x=>validIntimate(x.id,intimacy[x.id])&&intimacy[x.id]!=='skip').map(x=>[x.id,intimacy[x.id]]));
  return out;
}
