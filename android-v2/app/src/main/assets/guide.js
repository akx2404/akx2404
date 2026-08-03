/* The Cave Guide | ज्ञानगुहेचा मार्गदर्शक */
(() => {
  const style = document.createElement('style');
  style.textContent = `
    .comic{display:none!important;height:0!important;margin:0!important;padding:0!important;overflow:hidden!important}
    .keeper-stream{display:grid;gap:10px;margin:14px 0 22px}
    .keeper-card{display:grid;grid-template-columns:68px minmax(0,1fr);gap:12px;align-items:center;background:linear-gradient(145deg,#2a1c15,#17100d);border:2px solid #f3a33b66;border-radius:22px;padding:12px 13px;color:#fff;box-shadow:4px 5px 0 #080504}
    .keeper-card[data-kind="question"],.keeper-card[data-kind="challenge"]{border-style:dashed;background:linear-gradient(145deg,#25301f,#151b13)}
    .keeper-card[data-kind="warning"]{border-color:#c96f5d99}
    .keeper-face{width:64px;height:75px;display:block;filter:drop-shadow(0 3px 0 #0008)}
    .keeper-copy{min-width:0}.keeper-name{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#ffc56f;font-weight:950;margin-bottom:5px}
    .keeper-line{font:700 15px/1.42 Georgia,serif;color:#fff8e8}
    .keeper-kind{display:inline-block;margin-top:7px;font-size:9px;text-transform:uppercase;letter-spacing:.1em;color:#bba995}
    @media(max-width:430px){.keeper-card{grid-template-columns:55px minmax(0,1fr);gap:9px;padding:10px}.keeper-face{width:53px;height:63px}.keeper-line{font-size:14px}}
  `;
  document.head.appendChild(style);

  const face = () => `<svg class="keeper-face" viewBox="0 0 90 104" aria-hidden="true">
    <path d="M22 86c2-17 12-27 25-27s25 10 28 27l-3 13H20z" fill="#6d4327" stroke="#1e120c" stroke-width="4"/>
    <path d="M18 43c0-23 13-37 30-37 18 0 30 15 29 38-1 21-13 34-30 34S18 64 18 43z" fill="#c98e59" stroke="#1e120c" stroke-width="4"/>
    <path d="M16 38C18 13 34 3 52 7c14 3 24 14 25 30-8-5-14-12-18-22-9 10-22 16-43 17z" fill="#3d281c" stroke="#1e120c" stroke-width="4"/>
    <path d="M22 55c4 18 13 27 26 27 14 0 23-10 27-28-7 8-15 11-26 11-10 0-19-3-27-10z" fill="#4b2e1d" stroke="#1e120c" stroke-width="3"/>
    <circle cx="35" cy="43" r="3.5" fill="#21150e"/><circle cx="59" cy="43" r="3.5" fill="#21150e"/>
    <path d="M31 35q5-4 10 0M54 35q5-4 10 0M42 55q6 4 12 0" fill="none" stroke="#21150e" stroke-width="3" stroke-linecap="round"/>
    <path d="M12 91h68" stroke="#f3a33b" stroke-width="5" stroke-linecap="round"/>
  </svg>`;

  function safeEsc(value){
    if(typeof esc === 'function') return esc(value);
    return String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function currentLang(){
    try{return lang === 'mr' ? 'mr' : 'en'}catch{return 'en'}
  }

  function card(item){
    const mr = currentLang() === 'mr';
    const text = mr ? item.marathi : item.english;
    const name = mr ? 'गुहा रक्षक' : 'Cave Keeper';
    const labels = mr
      ? {remark:'निरीक्षण',question:'प्रश्न',joke:'हलकी टोचणी',warning:'सावधान',challenge:'आव्हान',connection:'संबंध'}
      : {remark:'Observation',question:'Question',joke:'Dry aside',warning:'Caution',challenge:'Challenge',connection:'Connection'};
    return `<aside class="keeper-card" data-kind="${safeEsc(item.kind || 'remark')}">${face()}<div class="keeper-copy"><div class="keeper-name">${name}</div><div class="keeper-line">${safeEsc(text)}</div><span class="keeper-kind">${safeEsc(labels[item.kind] || item.kind || 'Observation')}</span></div></aside>`;
  }

  function getCurrent(){
    try{return current}catch{return null}
  }

  function getRoot(){
    try{return root || document.getElementById('root')}catch{return document.getElementById('root')}
  }

  function fallbackKeeper(lesson){
    if(!lesson) return [];
    const mr = lesson.marathi || {};
    const en = lesson.english || {};
    const sections = en.sections || [];
    const out = [];
    sections.forEach((s,i) => {
      const mrSection = (mr.sections || [])[i] || {};
      out.push({placement:i+1,kind:'question',english:`Pause here: what would have to be false for “${s.heading}” to collapse?`,marathi:`इथे थांबा: “${mrSection.heading || s.heading}” हा मुद्दा चुकीचा ठरण्यासाठी नेमके काय खोटे असावे लागेल?`});
      out.push({placement:i+1,kind:'connection',english:`Notice the mechanism, not merely the example. Where else have you seen the same pattern?`,marathi:`फक्त उदाहरण पाहू नका; यामागची यंत्रणा पाहा. हाच नमुना तुम्ही अजून कुठे पाहिला आहे?`});
      out.push({placement:i+1,kind:'joke',english:`Humans adore a tidy explanation. Reality rarely signs the paperwork.`,marathi:`माणसांना नीटनेटके स्पष्टीकरण फार आवडते. वास्तव मात्र त्यावर सही करत नाही.`});
    });
    return out;
  }

  function inject(){
    const r = getRoot();
    if(!r) return;
    r.querySelectorAll('.comic').forEach(x => x.remove());
    if(r.dataset.keeperInjected === 'yes') return;
    const lesson = getCurrent();
    if(!lesson) return;
    const items = Array.isArray(lesson.keeper) && lesson.keeper.length ? lesson.keeper : fallbackKeeper(lesson);
    if(!items.length) return;

    const quiz = r.querySelector('.quiz');
    if(quiz){
      const pool = items.filter(x => x.placement === 7);
      const chosen = pool.length ? pool[(typeof qIndex === 'number' ? qIndex : 0) % pool.length] : items[0];
      quiz.insertAdjacentHTML('afterbegin', `<div class="keeper-stream">${card(chosen)}</div>`);
      r.dataset.keeperInjected = 'yes';
      return;
    }

    const papers = Array.from(r.children).filter(x => x.classList && x.classList.contains('paper'));
    if(!papers.length) return;
    const sectionCount = (() => {try{return languageLesson().sections.length}catch{return Math.max(0,papers.length-2)}})();
    const by = {};
    items.forEach(x => ((by[x.placement] ||= []).push(x)));

    if(by[0] && by[0].length) papers[0].insertAdjacentHTML('afterend', `<div class="keeper-stream">${by[0].map(card).join('')}</div>`);
    for(let i=0;i<sectionCount;i++){
      const paper = papers[i+1];
      const group = by[i+1] || [];
      if(paper && group.length) paper.insertAdjacentHTML('afterend', `<div class="keeper-stream">${group.map(card).join('')}</div>`);
    }
    const finalGroup = by[7] || [];
    const last = papers[papers.length-1];
    if(last && finalGroup.length) last.insertAdjacentHTML('beforebegin', `<div class="keeper-stream">${finalGroup.map(card).join('')}</div>`);
    r.dataset.keeperInjected = 'yes';
  }

  const target = document.getElementById('root');
  if(target){
    new MutationObserver(() => {
      target.dataset.keeperInjected = '';
      clearTimeout(window.__keeperTimer);
      window.__keeperTimer = setTimeout(inject, 30);
    }).observe(target,{childList:true,subtree:false});
  }
  document.addEventListener('click', () => setTimeout(inject,40), true);
  setTimeout(inject,100);
})();
