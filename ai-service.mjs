import http from 'node:http';
import {generateSummary} from './ai-explanation.mjs';
import {AI_SCOPES} from './dist/ai-input.mjs';
let busy=false;
const send=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data));};
const server=http.createServer(async(req,res)=>{
  if(req.headers.host!=='127.0.0.1:4180'||req.headers.origin){send(res,403,{error:'Použij formulář na webu.'});return;}
  if(req.url==='/health'&&req.method==='GET'){send(res,200,{ok:true,busy});return;}
  if(req.url!=='/explain'||req.method!=='POST'||!req.headers['content-type']?.startsWith('application/json')){send(res,400,{error:'Neplatný požadavek.'});return;}
  if(busy){send(res,429,{error:'Model právě připravuje jiné vysvětlení. Zkus to po jeho dokončení.'});return;}
  busy=true;
  try{
    let text='',size=0;
    for await(const chunk of req){size+=chunk.length;if(size>16000){send(res,413,{error:'Příliš velká data.'});return;}text+=chunk;}
    let body;try{body=JSON.parse(text);}catch{send(res,400,{error:'Neplatný JSON.'});return;}
    if(!Array.isArray(body.scopes)||!body.scopes.length||body.scopes.length>4||body.scopes.some(s=>!Object.hasOwn(AI_SCOPES,s))||!body.a||!body.b){send(res,400,{error:'Vyber platné kategorie pro vysvětlení.'});return;}
    // generateSummary sanitizes again and only forwards predefined facts, never free text or identity.
    send(res,200,await generateSummary(body.a,body.b,{scopes:body.scopes}));
  }catch{if(!res.headersSent)send(res,503,{error:'AI vysvětlení se nepodařilo dokončit. Běžné porovnání zůstává dostupné.'});}
  finally{busy=false;}
});
server.requestTimeout=15000;server.headersTimeout=10000;
server.listen(4180,'127.0.0.1',()=>console.log('Osobnosti AI explanation service ready on loopback.'));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{server.close(()=>process.exit());});
