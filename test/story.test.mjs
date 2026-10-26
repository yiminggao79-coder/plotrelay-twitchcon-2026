import test from 'node:test';
import assert from 'node:assert/strict';
import { StoryDirector } from '../src/story.mjs';

const chapter = {title:'Last train',prompt:'A suitcase hums.',choices:['Open it','Find help','Wait'],source:'live'};
test('one viewer gets one current vote; duplicate events cannot replay',()=>{
 const s=new StoryDirector();s.start(chapter);
 assert.equal(s.message({id:'1',user:'alice',text:'!vote 1'}).accepted,true);
 s.message({id:'2',user:'alice',text:'!vote 2'});
 s.message({id:'2',user:'bob',text:'!vote 1'});
 assert.deepEqual(s.snapshot().choices.map(x=>x.votes),[0,1,0]);
 assert.equal(s.snapshot().voters,1);
});
test('a chapter never mixes rehearsal identities with real Twitch votes, even during reconnect',()=>{
 const s=new StoryDirector();s.start({...chapter,source:'rehearsal'});
 assert.equal(s.message({id:'r',user:'alice',text:'!vote 1',source:'rehearsal'}).accepted,true);
 assert.equal(s.message({id:'t',user:'bob',text:'!vote 2',source:'twitch'}).accepted,false);
 s.lock();s.start({...chapter,source:'live'});
 assert.equal(s.message({id:'r2',user:'alice',text:'!vote 1',source:'rehearsal'}).accepted,false);
 assert.equal(s.message({id:'t2',user:'bob',text:'!vote 2',source:'twitch'}).accepted,true);
 assert.equal(s.snapshot().voters,1);assert.equal(s.snapshot().source,'live');
 assert.equal(s.snapshot().history[0].source,'rehearsal');
});
test('locked round ignores late messages and records deterministic winner',()=>{
 const s=new StoryDirector();s.start(chapter);s.message({id:'1',user:'a',text:'!vote 2'});
 const h=s.lock();assert.equal(h.choice,'Find help');
 assert.equal(s.message({id:'2',user:'b',text:'!vote 1'}).accepted,false);
 assert.equal(s.snapshot().history.length,1);
 assert.throws(()=>s.lock(),/closed/);
});
test('new rounds reset votes; malformed commands and unsafe limits rejected',()=>{
 const s=new StoryDirector();assert.throws(()=>s.start({...chapter,choices:['only']}),/choices/);
 s.start(chapter);assert.equal(s.message({id:'0',user:'a',text:'!vote 99'}).accepted,false);
 assert.equal(s.message({id:'1',user:'a',text:'!vote 1 please'}).accepted,false);
 s.message({id:'2',user:'a',text:'!vote 1'});s.lock();s.start(chapter);
 assert.equal(s.snapshot().voters,0);assert.equal(s.snapshot().history.length,1);
});
test('an empty chapter can close so the director can switch connections',()=>{const s=new StoryDirector();s.start(chapter);s.cancelEmpty();assert.equal(s.snapshot().open,false);assert.equal(s.snapshot().history.length,0);s.start(chapter);s.message({id:'1',user:'a',text:'!vote 1'});assert.throws(()=>s.cancelEmpty(),/votes/);});
