(() => {
  const GUIDE_NAMES = { en: 'The Cave Guide', mr: 'ज्ञानगुहेचा मार्गदर्शक' };
  const INTRO = {
    en: (title, opening) => `Today we enter “${title}”. ${opening}`,
    mr: (title, opening) => `आज आपण “${title}” या कल्पनेत प्रवेश करतो. ${opening}`
  };

  const style = document.createElement('style');
  style.textContent = `
    .guide-card{display:grid;grid-template-columns:86px minmax(0,1fr);gap:14px;align-items:center;margin:16px 0 20px;padding:15px;border:3px solid #21170f;border-radius:22px;background:linear-gradient(135deg,#f8edcf,#e8d4aa);color:#21160f;box-shadow:5px 6px 0 #070504}
    .guide-avatar{width:82px;height:94px;display:block;filter:drop-shadow(0 4px 0 #33221755)}
    .guide-copy{min-width:0}.guide-name{font:900 11px/1.2 system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#9a432d;margin-bottom:7px}.guide-line{font:700 17px/1.45 Georgia,serif;margin:0}.guide-tail{width:18px;height:18px;background:#f1dfbb;border-left:3px solid #21170f;border-bottom:3px solid #21170f;transform:rotate(45deg);position:absolute;left:-11px;top:29px}.guide-bubble{position:relative;border:3px solid #21170f;border-radius:18px;background:#f1dfbb;padding:13px 14px}
    @media(max-width:430px){.guide-card{grid-template-columns:68px minmax(0,1fr);gap:11px;padding:12px}.guide-avatar{width:65px;height:78px}.guide-line{font-size:15px}}
  `;
  document.head.appendChild(style);

  const avatar = `
  <svg class="guide-avatar" viewBox="0 0 100 118" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Learning Cave guide">
    <defs><linearGradient id="coat" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#3f6e67"/><stop offset="1" stop-color="#203e3a"/></linearGradient></defs>
    <path d="M17 109c3-27 16-40 33-40s30 13 33 40" fill="url(#coat)" stroke="#21170f" stroke-width="4"/>
    <path d="M27 36c0-20 12-31 25-31 17 0 27 13 27 31v16c0 20-12 33-27 33S27 72 27 52z" fill="#c98256" stroke="#21170f" stroke-width="4"/>
    <path d="M25 39c-3-22 12-36 29-36 19 0 30 13 28 34-7-8-14-12-23-13-12 10-23 14-34 15z" fill="#2c211c" stroke="#21170f" stroke-width="4"/>
    <circle cx="42" cy="50" r="3.7" fill="#21170f"/><circle cx="65" cy="50" r="3.7" fill="#21170f"/>
    <path d="M45 66c6 4 12 4 18 0" fill="none" stroke="#21170f" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M24 103l-9-22 13 4 8 19" fill="#d39a44" stroke="#21170f" stroke-width="4"/>
    <circle cx="16" cy="79" r="7" fill="#f3a33b" stroke="#21170f" stroke-width="4"/>
    <path d="M45 84l7 7 8-7" fill="none" stroke="#f3d7a2" stroke-width="4" stroke-linecap="round"/>
  </svg>`;

  function clip(text, max = 220) {
    const clean = String(text || '').replace(/\s+/g, ' ').trim();
    if (clean.length <= max) return clean;
    const cut = clean.slice(0, max);
    return cut.slice(0, cut.lastIndexOf(' ')) + '…';
  }

  function addGuide() {
    if (typeof current === 'undefined' || !current || typeof languageLesson !== 'function') return;
    const firstPaper = document.querySelector('#root > .paper');
    if (!firstPaper || firstPaper.querySelector('.guide-card')) return;
    const lesson = languageLesson();
    const title = lang === 'mr' ? current.marathi.title : current.title;
    const opening = clip(lesson.opening, lang === 'mr' ? 185 : 205);
    const card = document.createElement('section');
    card.className = 'guide-card';
    card.innerHTML = `${avatar}<div class="guide-copy"><div class="guide-name">${GUIDE_NAMES[lang]}</div><div class="guide-bubble"><span class="guide-tail"></span><p class="guide-line"></p></div></div>`;
    card.querySelector('.guide-line').textContent = INTRO[lang](title, opening);
    firstPaper.appendChild(card);
  }

  if (typeof renderLesson === 'function') {
    const originalRenderLesson = renderLesson;
    renderLesson = function (...args) {
      const result = originalRenderLesson.apply(this, args);
      queueMicrotask(addGuide);
      return result;
    };
  }
})();
