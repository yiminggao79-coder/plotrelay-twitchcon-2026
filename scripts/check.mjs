import {TwitchChat} from '../src/twitch.mjs';
const client=new TwitchChat({onStatus:s=>console.log(`Twitch status: ${s}`)});
console.log(JSON.stringify({node:process.version,clientIdConfigured:!!process.env.TWITCH_CLIENT_ID,userTokenConfigured:!!process.env.TWITCH_USER_TOKEN,broadcasterConfigured:!!process.env.TWITCH_BROADCASTER_ID,mode:'read-only readiness; no messages sent'},null,2));
if(client.configured()){await client.start();setTimeout(()=>client.stop(),15000).unref();}else console.log('NOT READY for live footage: provide Twitch authorization through setup-local.ps1.');
