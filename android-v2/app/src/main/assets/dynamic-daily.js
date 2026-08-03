(() => {
'use strict';
const FIVE_DAYS=5;
const MANIFEST_KEY='caveDynamicManifestsV1';
const QUERY={
 psychology:['psychology cognitive bias perception memory behaviour','social psychology experiment mind decision making'],
 sociology:['sociology social theory community norms institutions','social behaviour culture society phenomenon'],
 game:['game theory strategic interaction bargaining cooperation','behavioral game theory coordination dilemma'],
 history:['historical mystery archaeology unexplained manuscript ancient discovery','lost history unusual historical event artifact'],
 politics:['political science power institutions public opinion governance','political behaviour democracy propaganda state theory'],
 glitches:['cognitive illusion perception attention memory phenomenon','mind illusion sensory effect cognitive psychology'],
 psychoanalysis:['psychoanalysis unconscious defence mechanism dream theory','Freud Lacan object relations psychoanalytic concept'],
 medieval:['medieval art illuminated manuscript gothic symbolism','middle ages art architecture manuscript iconography'],
 literature:['world literature literary movement book cultural influence','novel poetry literature changed society history'],
 art:['art history movement painting visual culture influence','famous artwork art movement visual perception'],
 philosophy:['philosophy thought experiment ethics epistemology paradox','philosophical problem mind identity morality'],
 statistics:['statistics paradox probability bias data interpretation','statistical fallacy probability puzzle causal inference'],
 mythology:['comparative mythology world myth deity ritual folklore','mythology creation underworld hero culture']
};
const hashText=s=>{let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
const dayNo=s=>Math.floor(new Date(s+'T00:00:00Z').getTime()/86400000);
const readStore=(k,d)=>{try{return JSON.parse(localStorage[k]||JSON.stringify(d))}catch(_){return d}};
const writeStore=(k,v)=>{try{localStorage[k]=JSON.stringify(v)}catch(_){}};
function dateShift(s,n){const d=new Date(s+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)}
function recentDates(s){return Array.from({length:FIVE_DAYS},(_,i)=>dateShift(s,-i));}
function usedRecently(store,subject,s){const used=new Set();for(let i=1;i<=FIVE_DAYS;i++){const m=store[dateShift(s,-i)];if(!m||!m[subject])continue;for(const q of m[subject])used.add(q[0].toLowerCase())}return used}
async function searchWiki(q,offset){const u='https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrnamespace=0&gsrlimit=30&gsroffset='+offset+'&gsrsearch='+encodeURIComponent(q)+'&prop=info&inprop=url&format=json&origin=*';const r=await fetch(u,{cache:'no-store'});if(!r.ok)throw new Error('search');const j=await r.json();return Object.values((j.query&&j.query.pages)||{}).sort((a,b)=>(a.index||0)-(b.index||0)).map(x=>x.title).filter(Boolean)}
async function related(title,subject){const terms=QUERY[subject][0];const u='https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrnamespace=0&gsrlimit=8&gsrsearch='+encodeURIComponent('"'+title+'" OR '+terms)+'&prop=info&format=json&origin=*';try{const r=await fetch(u);const j=await r.json();const titles=Object.values((j.query&&j.query.pages)||{}).sort((a,b)=>(a.index||0)-(b.index||0)).map(x=>x.title).filter(x=>x&&x!==title);return [title,...titles.slice(0,3)]}catch(_){return [title]}}
async function buildSubject(subject,s,store){const used=usedRecently(store,subject,s);const seed=hashText(subject+'|'+s);const qs=QUERY[subject];let candidates=[];for(let attempt=0;attempt<3&&candidates.length<12;attempt++){const q=qs[(seed+attempt)%qs.length];const offset=((dayNo(s)*17+seed+attempt*29)%450+450)%450;try{candidates.push(...await searchWiki(q,offset))}catch(_){}}
 candidates=[...new Set(candidates)].filter(x=>!used.has(x.toLowerCase())&&!/^(List of|Category:|Index of)/i.test(x));
 if(candidates.length<3)throw new Error('not-enough-topics');
 const chosen=[];for(let levelIndex=0;levelIndex<3;levelIndex++){const idx=(seed+levelIndex*7)%candidates.length;const title=candidates.splice(idx,1)[0];chosen.push([title,await related(title,subject)])}
 return chosen;
}
function prune(store,anchor){const keep=new Set(recentDates(anchor));for(const k of Object.keys(store))if(!keep.has(k))delete store[k];writeStore(MANIFEST_KEY,store);
 const lessons=readStore('lessons',{});for(const k of Object.keys(lessons)){const d=k.slice(0,10);if(/^\d{4}-\d{2}-\d{2}$/.test(d)&&!keep.has(d))delete lessons[k]}writeStore('lessons',lessons);
}
async function ensureManifest(s){const store=readStore(MANIFEST_KEY,{});if(store[s]){prune(store,s);return store[s]}
 const manifest={};for(const t of TOPICS){manifest[t[0]]=await buildSubject(t[0],s,store)}store[s]=manifest;prune(store,s);writeStore(MANIFEST_KEY,store);return manifest}
let activeManifest=null,loadingFor='';
function installProxies(manifest){activeManifest=manifest;for(const t of TOPICS){const fallback=t[4];t[4]=new Proxy([],{
  get(_target,prop){if(prop==='length')return 997;if(prop===Symbol.iterator)return function*(){yield*(manifest[t[0]]||fallback)};const n=Number(prop);if(Number.isInteger(n)){const arr=manifest[t[0]]||fallback;return arr[Math.max(0,(level||1)-1)%arr.length]}return Array.prototype[prop]}
 })}}
async function refreshFor(s){if(loadingFor===s)return;loadingFor=s;try{const m=await ensureManifest(s);installProxies(m);home()}catch(e){console.warn('Dynamic manifest unavailable',e)}finally{loadingFor=''}}
const originalHome=home;
home=function(){originalHome();if(!activeManifest||!activeManifest[TOPICS[0][0]])refreshFor(date)};
document.addEventListener('change',e=>{if(e.target&&e.target.id==='date')setTimeout(()=>refreshFor(e.target.value),0)},true);
window.addEventListener('online',()=>refreshFor(date));
refreshFor(date);
})();