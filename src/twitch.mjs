export function chatEvent(message){
 if(message?.metadata?.message_type!=='notification'||message.metadata.subscription_type!=='channel.chat.message')return null;
 const e=message.payload?.event;if(!e?.message_id||!e?.chatter_user_id||typeof e.message?.text!=='string')return null;
 return {id:e.message_id,user:e.chatter_user_id,name:e.chatter_user_name||e.chatter_user_login,text:e.message.text};
}
export function subscriptionBody(sessionId,channelId,readerId){return {type:'channel.chat.message',version:'1',condition:{broadcaster_user_id:channelId,user_id:readerId},transport:{method:'websocket',session_id:sessionId}};}
export function validReconnect(url){try{const u=new URL(url);return u.protocol==='wss:'&&u.hostname==='eventsub.wss.twitch.tv';}catch{return false;}}
export class TwitchChat {
 constructor({env=process.env,onMessage=()=>{},onStatus=()=>{},fetcher=fetch,WebSocketClass=WebSocket}={}){Object.assign(this,{env,onMessage,onStatus,fetcher,WebSocketClass});this.status='not configured';this.stopped=false;this.retry=1000;this.socket=null;this.timer=null;this.watchdog=null;this.readId=null;}
 configured(){return !!(this.env.TWITCH_CLIENT_ID&&this.env.TWITCH_USER_TOKEN&&this.env.TWITCH_BROADCASTER_ID);}
 setStatus(s){this.status=s;this.onStatus(s);}
 async start(){
  if(!this.configured()){this.setStatus('not configured');return;}
  this.stopped=false;this.setStatus('validating authorization');
  try{const r=await this.fetcher('https://id.twitch.tv/oauth2/validate',{headers:{Authorization:`OAuth ${this.env.TWITCH_USER_TOKEN}`},signal:AbortSignal.timeout(12000)});if(!r.ok)throw new Error('Twitch authorization expired or invalid.');const v=await r.json();if(v.client_id!==this.env.TWITCH_CLIENT_ID||!v.user_id||!v.scopes?.includes('user:read:chat'))throw new Error('Twitch token needs user:read:chat and the matching app.');this.readId=v.user_id;this.connect('wss://eventsub.wss.twitch.tv/ws');}catch(e){this.setStatus(e.message);}
 }
 connect(url,migrating=false){
  if(this.stopped)return;const prior=this.socket;const ws=new this.WebSocketClass(url);this.socket=ws;let welcomed=false;
  ws.addEventListener('message',async e=>{try{const m=JSON.parse(String(e.data));clearTimeout(this.watchdog);this.watchdog=setTimeout(()=>{ws.close();},(m.payload?.session?.keepalive_timeout_seconds||20)*1000+3000);this.watchdog.unref?.();
   if(m.metadata.message_type==='session_welcome'){
    welcomed=true;this.retry=1000;if(migrating){prior?.close();this.setStatus('connected to Twitch');return;}
    const r=await this.fetcher('https://api.twitch.tv/helix/eventsub/subscriptions',{method:'POST',headers:{Authorization:`Bearer ${this.env.TWITCH_USER_TOKEN}`,'Client-Id':this.env.TWITCH_CLIENT_ID,'Content-Type':'application/json'},body:JSON.stringify(subscriptionBody(m.payload.session.id,this.env.TWITCH_BROADCASTER_ID,this.readId)),signal:AbortSignal.timeout(12000)});
    if(!r.ok){this.setStatus(`Twitch subscription rejected (${r.status}); check channel and scope.`);this.stopped=true;ws.close();return;}this.setStatus('connected to Twitch');
   }else if(m.metadata.message_type==='session_reconnect'&&validReconnect(m.payload.session.reconnect_url)){this.connect(m.payload.session.reconnect_url,true);}
   else if(m.metadata.message_type==='revocation'){this.stopped=true;this.setStatus('Twitch authorization revoked; authorize again.');ws.close();}
   else {const c=chatEvent(m);if(c)this.onMessage(c);}
  }catch{this.setStatus('Twitch event error; reconnect may be required.');}});
  ws.addEventListener('error',()=>{this.setStatus('Twitch connection unavailable');});
  ws.addEventListener('close',()=>{if(this.socket!==ws||this.stopped)return;clearTimeout(this.watchdog);this.setStatus('reconnecting to Twitch');this.timer=setTimeout(()=>this.start(),this.retry);this.timer.unref?.();this.retry=Math.min(this.retry*2,30000);});
  setTimeout(()=>{if(!welcomed&&ws.readyState<2)ws.close();},15000).unref?.();
 }
 stop(){this.stopped=true;clearTimeout(this.timer);clearTimeout(this.watchdog);this.socket?.close();this.setStatus('disconnected');}
}
