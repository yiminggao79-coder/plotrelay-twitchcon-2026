import test from 'node:test';import assert from 'node:assert/strict';
import { chatEvent, subscriptionBody, validReconnect } from '../src/twitch.mjs';
test('only channel.chat.message notification becomes a vote event',()=>{
 const event={metadata:{message_type:'notification',subscription_type:'channel.chat.message'},payload:{event:{message_id:'m',chatter_user_id:'42',chatter_user_name:'Alice',message:{text:'!vote 2'}}}};
 assert.deepEqual(chatEvent(event),{id:'m',user:'42',name:'Alice',text:'!vote 2'});
 assert.equal(chatEvent({...event,metadata:{message_type:'session_keepalive'}}),null);
});
test('subscription binds authenticated reader, channel and exact session',()=>{
 assert.deepEqual(subscriptionBody('s','channel','reader').condition,{broadcaster_user_id:'channel',user_id:'reader'});
 assert.equal(subscriptionBody('s','channel','reader').transport.session_id,'s');
 assert.equal(validReconnect('wss://eventsub.wss.twitch.tv/ws?reconnect=x'),true);
 assert.equal(validReconnect('wss://attacker.example/ws'),false);
});
