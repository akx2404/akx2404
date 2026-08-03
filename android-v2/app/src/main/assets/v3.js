(() => {
  const MR = {
    app:"अक्षदची ज्ञानगुहा", daily:"दररोजच्या स्वतंत्र ज्ञानगुहा", choose:"एक ज्ञानगुहा निवडा.",
    desc:"प्रत्येक विषय स्वतंत्र आहे. तारीख आणि स्तर निवडा, मग अनेक सार्वजनिक ज्ञानपानांमधून तयार केलेला सखोल धडा वाचा.",
    level:"स्तर", unread:"न वाचलेले", read:"वाचले", quiz:"प्रश्नमंजुषा", markRead:"वाचले म्हणून नोंदवा",
    takeQuiz:"प्रश्नमंजुषा सोडवा", completed:"पूर्ण झाले", next:"पुढचा प्रश्न", finish:"प्रश्नमंजुषा पूर्ण करा",
    why:"हे उत्तर का?", correct:"बरोबर", wrong:"पुन्हा विचार करा", language:"English",
    quizTitle:"सखोल प्रश्नमंजुषा", scenario:"खालील प्रसंगासाठी सर्वात योग्य संकल्पना कोणती?",
    subjects:{Psychology:"मानसशास्त्र",Sociology:"समाजशास्त्र","Game Theory":"खेळ सिद्धांत","History Mysteries":"इतिहासातील रहस्ये","Human Political Nature":"मानवी राजकीय स्वभाव","Mind Glitches":"मनातील भ्रम",Psychoanalysis:"मनोविश्लेषण","Medieval Art":"मध्ययुगीन कला","Literature & the World":"साहित्य आणि जग","Art & the World":"कला आणि जग",Philosophy:"तत्त्वज्ञान",Statistics:"सांख्यिकी","World Mythology":"जागतिक पुराणकथा"}
  };
  let lang = localStorage.caveLang || 'en';
  const root = document.getElementById('root');
  const crumb = document.getElementById('crumb');
  const q = s => document.querySelector(s);
  const qa = s => [...document.querySelectorAll(s)];
  const esc = s => (s||'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
  const hash = s => {let h=2166136261; for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)} return h>>>0};
  const uniq = arr => [...new Set(arr.filter(Boolean))];
  const sentence = txt => (txt||'').split(/(?<=[.!?])\s+/).filter(x=>x.length>30);
  const cleanScenario = txt => {
    const s = sentence(txt)[1] || sentence(txt)[0] || txt;
    return s.replace(/\([^)]*\)/g,'').replace(/\s+/g,' ').trim();
  };

  const style = document.createElement('style');
  style.textContent = `
    header{padding-right:116px!important}.lang-switch{position:fixed;right:14px;top:17px;z-index:30;display:flex;background:#2a1c15;border:1px solid #ffffff26;border-radius:999px;padding:3px;box-shadow:0 5px 18px #0007}.lang-switch button{border:0;background:transparent;color:#dbc7aa;padding:8px 10px;border-radius:999px;font-weight:800;font-size:12px}.lang-switch button.active{background:#f3a43b;color:#21170f}.topic{overflow:hidden;background:linear-gradient(150deg,#2a1d17,#18100d)!important}.topic:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 85% 15%,var(--subject,#f3a43b)33,transparent 32%),linear-gradient(135deg,transparent 45%,var(--subject,#f3a43b)12 100%);opacity:.55;pointer-events:none}.topic>*{position:relative}.topic .mini-figure{position:absolute;right:-6px;top:5px;width:94px;height:105px;opacity:.38;transform:rotate(4deg)}
    .quiz-v3{background:#f4e6c1;color:#21170f;border:4px solid #21170f;box-shadow:8px 9px 0 #080504;border-radius:26px;padding:20px;margin:18px 0}.quiz-progress{height:8px;background:#d5c39b;border-radius:99px;overflow:hidden;margin:10px 0 20px}.quiz-progress span{display:block;height:100%;background:#5d8f4e}.quiz-v3 h2{font-family:Georgia,serif}.quiz-v3 .option{position:relative;padding-left:48px!important;min-height:58px}.quiz-v3 .option:before{content:attr(data-letter);position:absolute;left:14px;top:13px;width:25px;height:25px;border:2px solid #21170f;border-radius:50%;display:grid;place-items:center;font-weight:900}.quiz-v3 .option.correct{background:#d8edbd!important;border-color:#446a32!important}.quiz-v3 .option.wrong{background:#f2c8bb!important;border-color:#9a3d2f!important}.feedback{margin-top:14px;padding:15px;border-radius:16px;background:#e1d3ae;border-left:6px solid #5d8f4e;display:none}.feedback.show{display:block}.quiz-nav{display:flex;gap:10px;justify-content:space-between;margin-top:16px}.quiz-nav button{flex:1;border:0;border-radius:14px;padding:14px;font-weight:900}.subject-badge{display:inline-flex;align-items:center;gap:8px;padding:7px 10px;border-radius:999px;background:#21170f;color:white;font-size:12px}.topic small{max-width:70%;display:block}.hero{background:linear-gradient(135deg,#3a261a,#211610 65%,#5a2b13)!important}.app-icon-mini{width:42px;height:42px;border-radius:12px;background:radial-gradient(circle at 50% 28%,#ffbf47 0 13%,#6b3413 14% 36%,#1a100b 37% 100%);box-shadow:inset 0 0 0 2px #f2b24a55;margin-right:4px;position:relative}.app-icon-mini:after{content:"";position:absolute;left:17px;bottom:7px;width:8px;height:16px;background:#17100c;border-radius:50% 50% 3px 3px}.brand-wrap{display:flex;align-items:center;gap:9px}
    @media(max-width:420px){header{padding-right:104px!important}.lang-switch{right:9px}.lang-switch button{padding:7px 8px;font-size:11px}.topic .mini-figure{width:78px}}
  `;
  document.head.appendChild(style);

  function addHeaderIcon(){
    const brand=q('.brand'); if(!brand || brand.parentElement.classList.contains('brand-wrap')) return;
    const wrap=document.createElement('div'); wrap.className='brand-wrap';
    const icon=document.createElement('div'); icon.className='app-icon-mini';
    brand.parentNode.insertBefore(wrap,brand); wrap.append(icon,brand);
  }

  function addLanguageSwitch(){
    let sw=q('.lang-switch'); if(sw) return;
    sw=document.createElement('div'); sw.className='lang-switch';
    sw.innerHTML='<button data-lang="en">EN</button><button data-lang="mr">मराठी</button>';
    document.body.appendChild(sw);
    sw.querySelectorAll('button').forEach(b=>b.onclick=()=>{lang=b.dataset.lang;localStorage.caveLang=lang;location.reload()});
    sw.querySelector(`[data-lang="${lang}"]`).classList.add('active');
  }

  function topicColor(name){
    const colors=['#c45f5f','#4e89a8','#7a83d1','#a16b3f','#d3a62e','#6b8fd1','#617a96','#8b6b50','#a8759e','#bb704d','#7d8c57','#5f9a80','#8d65a5'];
    return colors[hash(name)%colors.length];
  }
  function miniSvg(seed,color){
    const hats=['','<path d="M22 23h38l-8-11H30z" fill="#f1b84a" stroke="#21170f" stroke-width="2"/>','<circle cx="66" cy="24" r="8" fill="#d7b760" stroke="#21170f" stroke-width="2"/>'][seed%3];
    return `<svg viewBox="0 0 86 110"><ellipse cx="43" cy="101" rx="25" ry="6" fill="#000" opacity=".3"/><path d="M22 96q2-29 21-29t21 29" fill="${color}" stroke="#21170f" stroke-width="3"/><circle cx="43" cy="46" r="24" fill="#efc596" stroke="#21170f" stroke-width="3"/>${hats}<circle cx="35" cy="45" r="3"/><circle cx="51" cy="45" r="3"/><path d="M36 57q7 5 14 0" fill="none" stroke="#21170f" stroke-width="3" stroke-linecap="round"/></svg>`;
  }

  function decorateHome(){
    qa('.topic').forEach((card,i)=>{
      const name=card.querySelector('b')?.textContent||''; const color=topicColor(name); card.style.setProperty('--subject',color);
      if(!card.querySelector('.mini-figure')){const f=document.createElement('div');f.className='mini-figure';f.innerHTML=miniSvg(hash(name),color);card.appendChild(f)}
      if(lang==='mr' && MR.subjects[name]) card.querySelector('b').textContent=MR.subjects[name];
    });
    if(lang==='mr'){
      const h=q('.hero h1'),p=q('.hero p'); if(h)h.textContent=MR.choose;if(p)p.textContent=MR.desc;
      qa('[data-l]').forEach(b=>b.textContent=`${MR.level} ${b.dataset.l}`);
      if(crumb && crumb.textContent.includes('Daily')) crumb.textContent=MR.daily;
      q('.brand').textContent=MR.app;
      qa('.mark').forEach(m=>m.textContent=m.textContent.replace('Unread',MR.unread).replace('Read',MR.read).replace('Quiz',MR.quiz));
    }
  }

  function buildQuizQuestions(lesson){
    const panels=lesson.panels||[];
    const concepts=uniq(panels.map(p=>p.title));
    const questions=[];
    panels.forEach((p,i)=>{
      const scenario=cleanScenario(p.text);
      const distractors=concepts.filter(x=>x!==p.title);
      const options=uniq([p.title,...distractors]).slice(0,4);
      while(options.length<4) options.push(['A related mechanism','A statistical coincidence','A cultural custom','A legal rule'][options.length]);
      const rot=hash(p.title+scenario)%options.length;
      const shuffled=options.slice(rot).concat(options.slice(0,rot));
      questions.push({
        q:lang==='mr'?MR.scenario:'Which concept best explains this situation?',
        scenario, answer:p.title, options:shuffled,
        explain:`${p.title}: ${sentence(p.text)[0]||p.text.slice(0,220)}`
      });
      if(i<2){
        const misconception=`Which statement would be the weakest interpretation of “${p.title}”?`;
        const correct=sentence(p.text)[0]||p.text.slice(0,180);
        const wrongs=panels.filter((_,j)=>j!==i).map(x=>sentence(x.text)[0]).filter(Boolean);
        const op=uniq([correct,...wrongs]).slice(0,4);
        questions.push({q:misconception,scenario:'Choose the statement that does not match the concept.',answer:correct,options:op,explain:`The defining idea is: ${correct}`});
      }
    });
    return questions.slice(0,6);
  }

  window.quiz = function(lesson,ck){
    nav(()=>{
      const questions=buildQuizQuestions(lesson); let idx=0;
      const progress=P(); const saved=((progress[ck]||{}).answers)||{};
      const renderQ=()=>{
        const x=questions[idx];
        C.textContent=(lang==='mr'?MR.quizTitle:'Deep Quiz')+' · '+lesson.title;
        R.innerHTML=`<section class="quiz-v3"><div class="subject-badge">${lang==='mr'?MR.quizTitle:'Think deeper'} · ${idx+1}/${questions.length}</div><div class="quiz-progress"><span style="width:${((idx+1)/questions.length)*100}%"></span></div><h2>${esc(x.q)}</h2><p>${esc(x.scenario)}</p><div>${x.options.map((o,j)=>`<button class="option" data-letter="${String.fromCharCode(65+j)}" data-i="${j}">${esc(o)}</button>`).join('')}</div><div class="feedback" id="feedback"><b></b><p></p></div><div class="quiz-nav"><button class="secondary" id="prev">← ${lang==='mr'?'मागे':'Back'}</button><button class="primary" id="next">${idx===questions.length-1?(lang==='mr'?MR.finish:'Finish quiz'):(lang==='mr'?MR.next:'Next question')} →</button></div></section>`;
        const feedback=q('#feedback');
        qa('.option').forEach(btn=>btn.onclick=()=>{
          qa('.option').forEach(b=>b.classList.remove('correct','wrong'));
          const chosen=x.options[+btn.dataset.i]; const ok=chosen===x.answer;
          btn.classList.add(ok?'correct':'wrong');
          qa('.option').forEach(b=>{if(x.options[+b.dataset.i]===x.answer)b.classList.add('correct')});
          feedback.classList.add('show');feedback.querySelector('b').textContent=ok?(lang==='mr'?MR.correct:'Correct'):(lang==='mr'?MR.wrong:'Not quite');feedback.querySelector('p').textContent=x.explain;
          const p=P();p[ck]={...(p[ck]||{}),answers:{...((p[ck]||{}).answers||{}),[idx]:chosen}};SP(p);
        });
        q('#prev').onclick=()=>{if(idx>0){idx--;renderQ()}else history.back()};
        q('#next').onclick=()=>{if(idx<questions.length-1){idx++;renderQ()}else{const p=P();p[ck]={...(p[ck]||{}),quiz:true};SP(p);home()}};
        const prior=saved[idx]; if(prior){const b=qa('.option').find(b=>x.options[+b.dataset.i]===prior);if(b)b.click()}
      };renderQ();
    });
  };

  addHeaderIcon(); addLanguageSwitch();
  const obs=new MutationObserver(()=>requestAnimationFrame(()=>{addHeaderIcon();decorateHome()}));
  obs.observe(root||document.body,{childList:true,subtree:true});
  decorateHome();
})();