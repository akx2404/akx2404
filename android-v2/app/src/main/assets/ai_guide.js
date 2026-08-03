(() => {
  const guideSvg = `<svg viewBox="0 0 150 170" role="img" aria-label="The Cave Keeper">
    <defs><linearGradient id="cloak" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#315d66"/><stop offset="1" stop-color="#19353c"/></linearGradient><radialGradient id="lamp"><stop stop-color="#ffd578"/><stop offset="1" stop-color="#e68b25"/></radialGradient></defs>
    <ellipse cx="76" cy="157" rx="48" ry="9" fill="#25170f" opacity=".18"/>
    <path d="M41 150c3-44 18-64 35-64s33 21 37 64z" fill="url(#cloak)" stroke="#21160f" stroke-width="5"/>
    <circle cx="76" cy="58" r="33" fill="#d9a87c" stroke="#21160f" stroke-width="5"/>
    <path d="M45 55c2-29 16-43 34-43 20 0 32 15 32 40-13-10-24-13-34-13-11 0-21 5-32 16z" fill="#463026" stroke="#21160f" stroke-width="5"/>
    <path d="M58 61q7-5 14 0M82 61q7-5 14 0" fill="none" stroke="#21160f" stroke-width="4" stroke-linecap="round"/>
    <path d="M66 75q10 8 20 0" fill="none" stroke="#21160f" stroke-width="4" stroke-linecap="round"/>
    <path d="M111 103l20-24" stroke="#21160f" stroke-width="6" stroke-linecap="round"/>
    <circle cx="132" cy="76" r="15" fill="url(#lamp)" stroke="#21160f" stroke-width="5"/>
    <circle cx="132" cy="76" r="5" fill="#fff1a6"/>
  </svg>`;

  const css = document.createElement('style');
  css.textContent = `.guide-card{display:grid;grid-template-columns:112px minmax(0,1fr);gap:13px;align-items:center;background:linear-gradient(135deg,#fff8e7,#e8d6b7);border:4px solid #21170f;box-shadow:7px 8px 0 #070504;border-radius:27px;padding:15px 17px;margin:19px 0;color:#21160f}.guide-art{width:108px;align-self:end}.guide-art svg{display:block;width:100%;height:auto}.guide-copy .guide-name{font:900 11px/1 system-ui;letter-spacing:.12em;text-transform:uppercase;color:#a4442c;margin-bottom:9px}.guide-copy blockquote{position:relative;margin:0;background:#fffdf6;border:3px solid #39261a;border-radius:19px;padding:15px;font:700 17px/1.45 Georgia,serif}.guide-copy blockquote:before{content:'';position:absolute;left:-16px;top:35px;width:26px;height:26px;background:#fffdf6;border-left:3px solid #39261a;border-bottom:3px solid #39261a;transform:rotate(45deg)}.editorial-label{font:900 10px/1 system-ui;letter-spacing:.12em;text-transform:uppercase;color:#bca68d;margin:0 0 7px 4px}@media(max-width:430px){.guide-card{grid-template-columns:84px minmax(0,1fr);padding:12px}.guide-art{width:82px}.guide-copy blockquote{font-size:15px;padding:12px}}`;
  document.head.appendChild(css);

  function guideText() {
    if (!window.current) return '';
    const l = window.lang === 'mr' ? current.marathi : current.english;
    const title = window.lang === 'mr' ? current.marathi.title : current.title;
    const subtitle = window.lang === 'mr' ? current.marathi.subtitle : current.subtitle;
    if (window.lang === 'mr') return `आज आपण “${title}” समजून घेणार आहोत. आधी ${subtitle} या कल्पनेकडे एका खऱ्या मानवी प्रसंगातून पाहूया—उत्तर लक्षात ठेवण्याऐवजी यामागची यंत्रणा शोधा.`;
    return `Today we enter “${title}.” Start with the human situation behind ${subtitle}; don’t memorise the label—watch for the mechanism that makes the idea work.`;
  }

  function enhanceLesson() {
    if (window.view !== 'lesson' || !window.current) return;
    const first = document.querySelector('#root > .paper');
    if (!first || document.querySelector('.guide-card')) return;
    const card = document.createElement('section');
    card.className = 'guide-card';
    card.innerHTML = `<div class="guide-art">${guideSvg}</div><div class="guide-copy"><div class="guide-name">${window.lang === 'mr' ? 'गुहेचा ज्ञानरक्षक' : 'The Cave Keeper'}</div><blockquote>${typeof esc === 'function' ? esc(guideText()) : guideText()}</blockquote></div>`;
    first.insertAdjacentElement('afterend', card);
    document.querySelectorAll('.comic').forEach(fig => {
      if (!fig.querySelector('.editorial-label')) {
        const label = document.createElement('div');
        label.className = 'editorial-label';
        label.textContent = window.lang === 'mr' ? 'कल्पनाचित्र' : 'Concept illustration';
        fig.prepend(label);
      }
    });
  }

  const original = window.renderLesson;
  if (typeof original === 'function') {
    window.renderLesson = function(){ original.apply(this, arguments); enhanceLesson(); };
  }
  document.addEventListener('click', () => setTimeout(enhanceLesson, 0));
  setTimeout(enhanceLesson, 200);
})();
