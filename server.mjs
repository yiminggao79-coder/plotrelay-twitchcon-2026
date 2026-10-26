import http from 'node:http';import {readFileSync} from 'node:fs';import {fileURLToPath} from 'node:url';import {randomUUID,timingSafeEqual} from 'node:crypto';
import {StoryDirector} from './src/story.mjs';import {TwitchChat} from './src/twitch.mjs';
const root=fileURLToPath(new URL('./public/',import.meta.url));const port=Number(process.env.PORT||4312);const host=process.env.HOST||'127.0.0.1';const csrf=randomUUID();const story=new StoryDirector();const clients=new Set();let liveRequested=false;
if(host!=='127.0.0.1'&&host!=='localhost'&&!process.env.ADMIN_KEY)throw new Error('Set ADMIN_KEY before exposing the director outside loopback.');
const twitch=new TwitchChat({onMessage:m=>{if(story.message(m).accepted)broadcast();},onStatus:()=>broadcast()});
const state=()=>({...story.snapshot(),connection:twitch.status,liveConfigured:twitch.configured(),liveRequested,mode:story.source});
const broadcast=()=>{for(const c of clients)c.write(`data: ${JSON.stringify(state())}\n\n`);};
const json=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
function admin(req){if(!process.env.ADMIN_KEY)return true;const h=req.headers.authorization||'';if(!h.startsWith('Basic '))return false;const p=Buffer.from(h.slice(6),'base64').toString().split(':').slice(1).join(':');const a=Buffer.from(p),b=Buffer.from(process.env.ADMIN_KEY);return a.length===b.length&&timingSafeEqual(a,b);}
async function body(req){let s='';for await(const c of req){s+=c;if(s.length>12000)throw new Error('Request is too large.');}return JSON.parse(s||'{}');}
const server=http.createServer(async(req,res)=>{try{
 const allowedHosts=new Set([`127.0.0.1:${port}`,`localhost:${port}`,process.env.PUBLIC_BASE_URL?new URL(process.env.PUBLIC_BASE_URL).host:'']);if(!allowedHosts.has(req.headers.host))return json(res,403,{error:'Host is not allowed.'});
 const url=new URL(req.url,'http://localhost');const publicView=['/overlay','/api/view','/api/events','/style.css','/overlay.js'].includes(url.pathname);
 if(!publicView&&!admin(req)){res.writeHead(401,{'WWW-Authenticate':'Basic realm="PlotRelay director"'});res.end('Director authorization required.');return;}
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
 if(req.method==='GET'&&url.pathname==='/api/state')return json(res,200,{...state(),csrf});
 if(req.method==='GET'&&url.pathname==='/api/view')return json(res,200,state());
 if(req.method==='GET'&&url.pathname==='/api/events'){res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache',Connection:'keep-alive'});res.write(`data: ${JSON.stringify(state())}\n\n`);clients.add(res);req.on('close',()=>clients.delete(res));return;}
 if(req.method==='POST'&&url.pathname.startsWith('/api/')){
  if(req.headers['x-csrf-token']!==csrf)return json(res,403,{error:'Refresh the director before making changes.'});
  const b=await body(req);
  if(url.pathname==='/api/start'){if(liveRequested&&twitch.status!=='connected to Twitch')throw new Error('Wait for Twitch to reconnect before starting a live chapter.');story.start({...b,source:liveRequested?'live':'rehearsal'});}
  else if(url.pathname==='/api/lock')story.lock();
  else if(url.pathname==='/api/cancel-empty')story.cancelEmpty();
  else if(url.pathname==='/api/rehearse'){
   if(liveRequested||story.source==='live')throw new Error('Rehearsal is disabled for a live chapter, including while reconnecting.');
   const accepted=story.message({id:randomUUID(),user:String(b.user||'rehearsal-viewer').slice(0,40),name:b.user,text:b.text,source:'rehearsal'});if(!accepted.accepted)throw new Error('Use !vote 1–4 during an open chapter.');
  }else if(url.pathname==='/api/connect'){if(story.open)throw new Error('Lock the current chapter before connecting to Twitch.');if(!twitch.configured())throw new Error('Twitch authorization is not configured.');liveRequested=true;twitch.stop();await twitch.start();}
  else if(url.pathname==='/api/disconnect'){if(story.open)throw new Error('Lock the live chapter before switching to rehearsal.');liveRequested=false;twitch.stop();}
  else return json(res,404,{error:'Unknown action.'});broadcast();return json(res,200,state());
 }
 const allowed={'/':'index.html','/overlay':'overlay.html','/style.css':'style.css','/app.js':'app.js','/overlay.js':'overlay.js'};const f=allowed[url.pathname];if(req.method!=='GET'||!f)return json(res,404,{error:'Not found.'});
 const ext=f.split('.').pop();res.writeHead(200,{'Content-Type':{html:'text/html; charset=utf-8',css:'text/css',js:'text/javascript'}[ext],'Content-Security-Policy':"default-src 'self'; connect-src 'self'; style-src 'self'; script-src 'self'; frame-ancestors 'self'"});res.end(readFileSync(root+f));
}catch(e){json(res,400,{error:e instanceof SyntaxError?'Invalid request.':e.message});}});
server.listen(port,host,()=>{console.log(`PlotRelay: http://${host}:${port} — ${twitch.configured()?'Twitch ready to connect':'local rehearsal; Twitch not configured'}`);});
const heartbeat=setInterval(()=>{for(const c of clients)c.write(': keepalive\n\n');},15000);heartbeat.unref();
process.on('SIGTERM',()=>{twitch.stop();for(const c of clients)c.end();server.close();});
