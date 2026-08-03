(() => {
  const mrSubjects={Psychology:'मानसशास्त्र',Sociology:'समाजशास्त्र','Game Theory':'खेळ सिद्धांत','History Mysteries':'इतिहासातील रहस्ये','Human Political Nature':'मानवी राजकीय स्वभाव','Mind Glitches':'मनातील भ्रम',Psychoanalysis:'मनोविश्लेषण','Medieval Art':'मध्ययुगीन कला','Literature & the World':'साहित्य आणि जग','Art & the World':'कला आणि जग',Philosophy:'तत्त्वज्ञान',Statistics:'सांख्यिकी','World Mythology':'जागतिक पुराणकथा'};
  const ui={
    en:{daily:'Daily independent chambers',choose:'Choose a chamber.',desc:'Each subject is independent. Pick a date and level, then open a focused long-form lesson.',level:'Level',unread:'Unread',read:'Read',quiz:'Quiz',mark:'Mark as read',take:'Take quiz',comic:'Illustrated lesson',about:'about',minutes:'minutes',translating:'Preparing Marathi translation…',offline:'Internet is needed once to prepare this lesson.'},
    mr:{daily:'दररोजच्या स्वतंत्र ज्ञानगुहा',choose:'एक ज्ञानगुहा निवडा.',desc:'प्रत्येक विषय स्वतंत्र आहे. तारीख आणि पातळी निवडा, मग सखोल आणि लक्ष केंद्रीत धडा उघडा.',level:'पातळी',unread:'न वाचलेले',read:'वाचले',quiz:'प्रश्नमंजुषा',mark:'वाचले म्हणून नोंदवा',take:'प्रश्नमंजुषा सोडवा',comic:'चित्रमय धडा',about:'सुमारे',minutes:'मिनिटे',translating:'मराठी भाषांतर तयार होत आहे…',offline:'हा धडा प्रथमच तयार करण्यासाठी इंटरनेट आवश्यक आहे.'}
  };
  let lang=localStorage.caveLang==='mr'?'mr':'en';
  const esc=s=>(s||'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
  const cache=()=>{try{return JSON.parse(localStorage.v4Translations||'{}')}catch(e){return{}}};
  const save=o=>{try{localStorage.v4Translations=JSON.stringify(o)}catch(e){}};
  const chunks=text=>{const out=[];let cur='';for(const s of (text||'').split(/(?<=[.!?])\s+/)){if((cur+' '+s).length>2200&&cur){out.push(cur);cur=s}else cur+=(cur?' ':'')+s}if(cur)out.push(cur);return out};
  async function translateChunk(text){
    const c=cache(),key='mr|'+text;if(c[key])return c[key];
    const u='https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=mr&dt=t&q='+encodeURIComponent(text);
    const r=await fetch(u);if(!r.ok)throw Error('translate');const j=await r.json();const v=(j[0]||[]).map(x=>x[0]).join('');if(v){c[key]=v;save(c)}return v||text;
  }
  async function tr(text){if(lang!=='mr'||!/\p{L}/u.test(text||''))return text;const out=[];for(const part of chunks(text))out.push(await translateChunk(part));return out.join(' ')}

  const style=document.createElement('style');style.textContent=`
    html,body{overflow-x:hidden}header{position:relative!important;top:auto!important;padding:18px 16px!important;min-height:92px;background:#17120f!important}main{padding-top:18px!important}.lang-switch,.language-toggle,.language-pill{display:none!important}.v4-lang{margin-left:auto;display:flex;flex:0 0 auto;background:#2a1d17;border:1px solid #ffffff28;border-radius:999px;padding:4px;gap:2px}.v4-lang button{width:auto!important;height:auto!important;border:0!important;padding:9px 12px!important;border-radius:999px!important;background:transparent!important;color:#d8c5ad!important;font-size:12px!important;font-weight:800}.v4-lang button.active{background:#f3a43b!important;color:#21170f!important}.brand-wrap{min-width:0;flex:1}.brand{line-height:1.05}.grid{gap:14px}.topic{min-height:176px!important;padding:16px!important;overflow:hidden!important;display:flex!important;flex-direction:column!important;align-items:flex-start!important;background:linear-gradient(145deg,#2c1e17,#1b120f)!important}.topic:before,.topic .mini-figure{display:none!important}.topic .v4-orb{width:54px;height:54px;border-radius:18px;display:grid;place-items:center;font-size:30px;background:linear-gradient(145deg,#ffffff16,#0004);border:1px solid #ffffff20;box-shadow:inset 0 0 24px var(--tone,#f3a43b33);margin-bottom:9px}.topic b{font-size:17px!important;line-height:1.12;margin:2px 0 7px!important;max-width:100%}.topic small{max-width:100%!important;font-size:12px;line-height:1.3;min-height:30px}.mark{position:static!important;margin-top:auto!important;display:flex!important;gap:6px!important;color:inherit!important;font-size:10px!important}.v4-chip{border:1px solid #ffffff22;border-radius:999px;padding:5px 7px;color:#d8c5ad;background:#ffffff08}.v4-chip.done{color:#f4c66a;border-color:#f3a43b55}.panel,.quiz-v3{scroll-margin-top:18px}.panel p{overflow-wrap:anywhere}.v4-note{background:#fff5d8;border-left:5px solid #c17b24;padding:12px 14px;margin:12px 0;color:#4a331e;font-family:system-ui,sans-serif;font-size:14px}.v4-loading{text-align:center;padding:70px 18px}.comic-cast{margin-top:14px!important}.speech{max-width:calc(100% - 92px)}
    @media(max-width:390px){header{padding:14px 10px!important;gap:8px!important}.brand{font-size:17px!important}.crumb{font-size:10px}.app-icon-mini{width:36px!important;height:36px!important}.v4-lang button{padding:8px 9px!important}.topic{min-height:165px!important;padding:13px!important}.topic b{font-size:15px!important}.topic .v4-orb{width:48px;height:48px;font-size:27px}.grid{gap:10px}.panel{padding:16px!important}.panel p{font-size:17px!important;line-height:1.62!important}}
  `;document.head.appendChild(style);

  function languageControl(){
    document.querySelectorAll('.lang-switch,.language-toggle,.language-pill').forEach(x=>x.remove());
    document.querySelectorAll('header button').forEach(b=>{const t=b.textContent.trim();if(t==='English'||t==='मराठी'||t==='EN')b.remove()});
    let sw=document.querySelector('.v4-lang');if(!sw){sw=document.createElement('div');sw.className='v4-lang';sw.innerHTML='<button data-v4lang="en">EN</button><button data-v4lang="mr">मराठी</button>';document.querySelector('header').appendChild(sw);sw.querySelectorAll('button').forEach(b=>b.onclick=()=>{localStorage.caveLang=b.dataset.v4lang;location.reload()})}
    sw.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.v4lang===lang));
  }
  function subjectName(t){return lang==='mr'?(mrSubjects[t[2]]||t[2]):t[2]}
  const oldHome=window.home;
  window.home=function(){
    S=[];C.textContent=ui[lang].daily;const p=P();
    R.innerHTML=`<section class="hero"><h1>${ui[lang].choose}</h1><p>${ui[lang].desc}</p><div class="row"><input id="date" type="date" value="${D}"></div></section><div class="row">${[1,2,3].map(x=>`<button data-l="${x}" class="${x===L?'active':''}">${ui[lang].level} ${x}</button>`).join('')}</div><div class="grid">${T.map(t=>{const s=p[K(t[0])]||{},q=choice(t);return `<button class="topic" data-t="${t[0]}" style="--tone:${['#c95e65','#4f8e9d','#7b78c7','#a56a3f','#d5a52d','#5387c6','#61738e','#8e694b','#a97096','#b96e48','#768d55','#5d997f','#8d62a0'][T.indexOf(t)]}"><span class="v4-orb">${t[1]}</span><b>${subjectName(t)}</b><small>${esc(q[0])}</small><span class="mark"><span class="v4-chip ${s.read?'done':''}">${s.read?'✓ '+ui[lang].read:'○ '+ui[lang].unread}</span><span class="v4-chip ${s.quiz?'done':''}">${s.quiz?'✓ ': '○ '}${ui[lang].quiz}</span></span></button>`}).join('')}</div>`;
    document.getElementById('date').onchange=e=>{D=e.target.value;localStorage.date=D;home()};document.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{L=+b.dataset.l;home()});document.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>open(T.find(t=>t[0]===b.dataset.t)));languageControl();
  };

  window.render=async function(t,l,ck){
    if(lang==='mr')R.innerHTML=`<div class="v4-loading"><div class="bat">🦇</div><h2>${ui.mr.translating}</h2><p>पहिल्यांदा थोडा वेळ लागू शकतो. नंतर हा मजकूर फोनमध्ये साठवला जाईल.</p></div>`;
    let title=l.title,panels=l.panels;
    if(lang==='mr'){
      try{title=await tr(l.title);panels=[];for(const p of l.panels)panels.push({...p,title:await tr(p.title),text:await tr(p.text),k:await tr(p.k)})}catch(e){panels=l.panels}
    }
    R.innerHTML=`<section class="panel"><div class="k">${ui[lang].comic}</div><h2>${esc(title)}</h2><p>${t[1]} ${subjectName(t)} · ${ui[lang].level} ${L} · ${ui[lang].about} ${Math.max(15,Math.round(l.total/190))} ${ui[lang].minutes}</p><div class="actions"><button class="primary" id="read">${(P()[ck]||{}).read?'✓ '+ui[lang].read:ui[lang].mark}</button><button class="secondary" id="quiz">${ui[lang].take}</button></div></section>${panels.map((p,i)=>`<article class="panel"><div class="k">${lang==='mr'?'भाग':'Panel'} ${i+1} · ${esc(p.k)}</div><h2>${esc(p.title)}</h2><p>${esc(p.text)}</p></article>`).join('')}`;
    document.getElementById('read').onclick=()=>{const p=P();p[ck]={...(p[ck]||{}),read:true};SP(p);document.getElementById('read').textContent='✓ '+ui[lang].read};document.getElementById('quiz').onclick=()=>quiz({...l,title,panels},ck);languageControl();
  };

  const mo=new MutationObserver(()=>requestAnimationFrame(languageControl));mo.observe(document.querySelector('header'),{childList:true,subtree:true});
  languageControl();home();
})();