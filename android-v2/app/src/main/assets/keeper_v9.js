(() => {
  const css = `
  .keeper-stream{display:grid;gap:10px;margin:12px 0 20px}
  .keeper-card{display:grid;grid-template-columns:70px minmax(0,1fr);gap:12px;align-items:center;background:linear-gradient(145deg,#2a1c15,#17100d);border:2px solid #f3a33b55;border-radius:22px;padding:11px 13px;color:#fff;box-shadow:4px 5px 0 #080504}
  .keeper-card:nth-child(even){transform:rotate(.25deg)}
  .keeper-card:nth-child(3n){border-color:#8fb57a88;background:linear-gradient(145deg,#21301f,#151b13)}
  .keeper-card[data-kind="question"],.keeper-card[data-kind="challenge"]{border-style:dashed}
  .keeper-face{width:66px;height:76px;display:block;filter:drop-shadow(0 3px 0 #0008)}
  .keeper-copy{min-width:0}.keeper-name{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#ffc56f;font-weight:950;margin-bottom:5px}
  .keeper-line{font:700 15px/1.38 Georgia,serif;color:#fff8e8}
  .keeper-kind{display:inline-block;margin-top:6px;font-size:9px;text-transform:uppercase;letter-spacing:.1em;color:#bba995}
  .keeper-intro{margin-top:18px}
  @media(max-width:430px){.keeper-card{grid-template-columns:58px minmax(0,1fr);gap:9px;padding:10px}.keeper-face{width:56px;height:66px}.keeper-line{font-size:14px}}
  `;
  const style = document.createElement('style');
  style.textContent = css;
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

  function card(item){
    const text = lang === 'mr' ? item.marathi : item.english;
    const name = lang === 'mr' ? 'गुहा रक्षक' : 'Cave Keeper';
    const labels = lang === 'mr'
      ? {remark:'निरीक्षण',question:'प्रश्न',joke:'हलकी टोचणी',warning:'सावधान',challenge:'आव्हान',connection:'संबंध'}
      : {remark:'Observation',question:'Question',joke:'Dry aside',warning:'Caution',challenge:'Challenge',connection:'Connection'};
    return `<aside class="keeper-card" data-kind="${item.kind}">${face()}<div class="keeper-copy"><div class="keeper-name">${name}</div><div class="keeper-line">${esc(text)}</div><span class="keeper-kind">${labels[item.kind]||item.kind}</span></div></aside>`;
  }

  function injectKeeper(){
    if(!current || !Array.isArray(current.keeper) || !root) return;
    const by = {};
    current.keeper.forEach(x => (by[x.placement] ??= []).push(x));
    const papers = [...root.querySelectorAll(':scope > .paper, :scope > article.paper, :scope > section.paper')];
    const intro = papers[0];
    if(intro && by[0]?.length){
      intro.insertAdjacentHTML('afterend', `<div class="keeper-stream keeper-intro">${by[0].map(card).join('')}</div>`);
    }
    const sectionPapers = papers.slice(1, 1 + (languageLesson()?.sections?.length || 0));
    sectionPapers.forEach((paper, index) => {
      const items = by[index + 1] || [];
      if(items.length) paper.insertAdjacentHTML('afterend', `<div class="keeper-stream">${items.map(card).join('')}</div>`);
    });
    const finalItems = by[7] || [];
    if(finalItems.length){
      const lastPaper = papers[papers.length - 1];
      if(lastPaper) lastPaper.insertAdjacentHTML('beforebegin', `<div class="keeper-stream">${finalItems.map(card).join('')}</div>`);
    }
  }

  const baseLesson = window.renderLesson;
  window.renderLesson = function(){
    baseLesson();
    injectKeeper();
  };
  renderLesson = window.renderLesson;

  const baseQuiz = window.renderQuiz;
  window.renderQuiz = function(){
    baseQuiz();
    if(!current?.keeper?.length) return;
    const pool = current.keeper.filter(x => x.placement === 7);
    const item = pool[qIndex % Math.max(1,pool.length)] || current.keeper[0];
    const quiz = root.querySelector('.quiz');
    if(quiz && item) quiz.insertAdjacentHTML('afterbegin', `<div class="keeper-stream">${card(item)}</div>`);
  };
  renderQuiz = window.renderQuiz;
})();
