export class StoryDirector {
 constructor(){this.chapter=0;this.title='The last train home';this.prompt='A locked suitcase starts humming. Chat decides what happens next.';this.options=['Open the suitcase','Find the conductor','Follow the sound'];this.source='rehearsal';this.open=false;this.votes=new Map();this.seen=new Set();this.history=[];this.activity=[];}
 start({title,prompt,choices,source='rehearsal'}){
  if(this.open)throw new Error('Lock the current chapter before starting another.');
  if(typeof title!=='string'||!title.trim()||title.length>100)throw new Error('Title must be 1–100 characters.');
  if(typeof prompt!=='string'||!prompt.trim()||prompt.length>600)throw new Error('Scene must be 1–600 characters.');
  if(!Array.isArray(choices)||choices.length<2||choices.length>4||choices.some(x=>typeof x!=='string'||!x.trim()||x.length>100)||new Set(choices.map(x=>x.trim().toLowerCase())).size!==choices.length)throw new Error('Use 2–4 distinct choices, up to 100 characters each.');
  if(!['rehearsal','live'].includes(source))throw new Error('Chapter source must be rehearsal or live.');
  this.source=source;this.title=title.trim();this.prompt=prompt.trim();this.options=choices.map(x=>x.trim());this.chapter++;this.open=true;this.votes.clear();this.activity=[];return this.snapshot();
 }
 message({id,user,name,text,source='twitch'}){
  if(!this.open||(this.source==='live'?source!=='twitch':source!=='rehearsal')||typeof id!=='string'||typeof user!=='string'||!id||!user||this.seen.has(id))return {accepted:false};
  this.seen.add(id);if(this.seen.size>10000)this.seen.delete(this.seen.values().next().value);
  const match=typeof text==='string'&&text.trim().match(/^!vote\s+([1-4])$/i);const n=match?Number(match[1])-1:-1;
  if(n<0||n>=this.options.length)return {accepted:false};
  if(!this.votes.has(user)&&this.votes.size>=10000)return {accepted:false};
  this.votes.set(user,n);this.activity.unshift({name:String(name||user).slice(0,30),text:`!vote ${n+1}`,source});this.activity=this.activity.slice(0,8);return {accepted:true};
 }
 cancelEmpty(){if(this.votes.size)throw new Error('This chapter has votes. Lock it to preserve the result.');this.open=false;return this.snapshot();}
 lock(){
  if(!this.open)throw new Error('This chapter is closed.');
  const s=this.snapshot();const max=Math.max(...s.choices.map(x=>x.votes));
  if(max===0)throw new Error('At least one viewer must vote before locking.');
  const winners=s.choices.filter(x=>x.votes===max);const winner=winners[0];
  const h={chapter:this.chapter,title:this.title,choice:winner.text,votes:max,voters:this.votes.size,tied:winners.length>1,source:this.source};
  this.history.push(h);this.history=this.history.slice(-50);this.open=false;return h;
 }
 snapshot(){const counts=this.options.map(()=>0);for(const v of this.votes.values())counts[v]++;return {chapter:this.chapter,title:this.title,prompt:this.prompt,source:this.source,open:this.open,voters:this.votes.size,choices:this.options.map((text,i)=>({id:i+1,text,votes:counts[i]})),history:this.history,activity:this.activity};}
}
