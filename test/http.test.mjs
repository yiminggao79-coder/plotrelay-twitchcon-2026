import test from 'node:test';import assert from 'node:assert/strict';import {spawn} from 'node:child_process';import {once} from 'node:events';
test('director API enforces CSRF and drives vote-to-overlay story state',async t=>{
 const port=14312,base=`http://127.0.0.1:${port}`;const child=spawn(process.execPath,['server.mjs'],{cwd:new URL('..',import.meta.url),env:{PATH:process.env.PATH,SystemRoot:process.env.SystemRoot,PORT:String(port)}});t.after(()=>child.kill());await once(child.stdout,'data');
 const first=await (await fetch(base+'/api/state')).json();assert.equal(first.mode,'rehearsal');
 const chapter={title:'Safe <title>',prompt:'Untrusted <script>text</script>',choices:['Open','Wait']};
 assert.equal((await fetch(base+'/api/start',{method:'POST',body:JSON.stringify(chapter)})).status,403);
 const post=async(path,data)=>{const r=await fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':first.csrf},body:JSON.stringify(data)});return {status:r.status,data:await r.json()};};
 assert.equal((await post('/api/start',chapter)).status,200);await post('/api/rehearse',{user:'alice',text:'!vote 2'});await post('/api/rehearse',{user:'alice',text:'!vote 1'});
 const view=await(await fetch(base+'/api/view')).json();assert.equal(view.voters,1);assert.equal(view.choices[0].votes,1);assert.equal(view.csrf,undefined);
 const lock=await post('/api/lock',{});assert.equal(lock.data.history[0].choice,'Open');assert.equal(lock.data.open,false);
 assert.equal((await fetch(base+'/overlay')).status,200);assert.equal((await fetch(base+'/../server.mjs')).status,404);
});
