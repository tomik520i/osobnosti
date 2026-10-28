import fs from 'node:fs';
import {ITEMS,VERSION} from '../dist/instrument.mjs';
import {ROLE_INFO,ROLE_ITEMS,CONTEXT_ITEMS,PRACTICES,INTIMACY_VERSION} from '../dist/extensions-data.mjs';
fs.writeFileSync(new URL('../dist/schema.json',import.meta.url),JSON.stringify({ipipVersion:VERSION,intimacyVersion:INTIMACY_VERSION,key:Object.fromEntries(ITEMS.map(i=>[i.id,{scale:i.scale,reverse:i.reverse}])),roles:ROLE_INFO.map(x=>x.id),ratings:[...ROLE_ITEMS,...CONTEXT_ITEMS].map(x=>x.id),context:CONTEXT_ITEMS.map(x=>x.id),practices:PRACTICES.map(x=>x.id)}));
