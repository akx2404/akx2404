(() => {
  const casts = {
    psychology: ["Mira the Mind Cartographer", "Pico the Doubter", "Dr. Lantern"],
    sociology: ["Nia the City Listener", "Ravi the Pattern Hunter", "Crowd-Sprite"],
    game: ["Gambit", "The Skeptic", "Professor Payoff"],
    history: ["Archivist Ilyas", "Dusty the Time Bat", "The Witness"],
    politics: ["Cato the Power Watcher", "The Dissenter", "Lady Consensus"],
    glitches: ["Glitch", "Focus Fox", "Memory Moth"],
    psychoanalysis: ["Dr. Echo", "The Shadow", "Idling Imp"],
    medieval: ["Brother Ink", "Margot the Marginal Beast", "Sir Scribble"],
    literature: ["Quill", "The Unreliable Narrator", "Page Wisp"],
    art: ["Vera the Visual Detective", "Pigment", "The Frame Breaker"],
    philosophy: ["Socrabat", "Paradox", "The Patient Stone"],
    statistics: ["Sigma", "Outlier", "Captain Confounder"],
    mythology: ["Mythos", "The Trickster", "Oracle Owl"]
  };
  const lines = [
    "Pause here—what would you have predicted?",
    "This detail looks small, but it changes the whole story.",
    "Notice the hidden assumption underneath this idea.",
    "The obvious explanation is not always the strongest one.",
    "Keep this clue; it returns later.",
    "Now test the idea against a real human situation.",
    "This is where the mystery becomes a pattern.",
    "A good theory should survive an uncomfortable example."
  ];
  const palette = ["#f3a43b", "#7cc8a0", "#d889b8", "#83a7e8", "#d9c36a", "#c8865a"];
  const hash = s => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const subjectKey = () => {
    const c = (document.getElementById('crumb')?.textContent || '').toLowerCase();
    if (c.includes('game')) return 'game';
    if (c.includes('history')) return 'history';
    if (c.includes('political')) return 'politics';
    if (c.includes('glitch')) return 'glitches';
    if (c.includes('psychoanalysis')) return 'psychoanalysis';
    if (c.includes('medieval')) return 'medieval';
    if (c.includes('literature')) return 'literature';
    if (c.includes('statistics')) return 'statistics';
    if (c.includes('mythology')) return 'mythology';
    if (c.includes('sociology')) return 'sociology';
    if (c.includes('psychology')) return 'psychology';
    if (c.includes('philosophy')) return 'philosophy';
    if (c.includes('art')) return 'art';
    return 'history';
  };
  function svg(seed, color, mood) {
    const eye = mood % 3;
    const accessory = seed % 5;
    const eyes = eye === 0
      ? '<circle cx="42" cy="51" r="3"/><circle cx="68" cy="51" r="3"/>'
      : eye === 1
      ? '<path d="M37 51q5-5 10 0M63 51q5-5 10 0" fill="none" stroke="#21170f" stroke-width="3" stroke-linecap="round"/>'
      : '<circle cx="42" cy="51" r="5" fill="white"/><circle cx="68" cy="51" r="5" fill="white"/><circle cx="42" cy="51" r="2"/><circle cx="68" cy="51" r="2"/>';
    const acc = [
      '<path d="M31 29q24-24 48 0" fill="none" stroke="#21170f" stroke-width="5"/>',
      '<circle cx="80" cy="31" r="10" fill="#f6e0a0" stroke="#21170f" stroke-width="3"/>',
      '<path d="M30 38h50M42 38v-13h26v13" fill="none" stroke="#21170f" stroke-width="4"/>',
      '<path d="M28 34q27-18 54 0l-8-18-12 12-10-15-10 15-11-12z" fill="#f6d36e" stroke="#21170f" stroke-width="3"/>',
      '<path d="M77 40l18-14M88 32l8 8" fill="none" stroke="#21170f" stroke-width="4" stroke-linecap="round"/>'
    ][accessory];
    return `<svg viewBox="0 0 110 126" aria-hidden="true"><ellipse cx="55" cy="113" rx="35" ry="8" fill="#000" opacity=".22"/><path d="M29 104q3-35 26-35t27 35" fill="${color}" stroke="#21170f" stroke-width="4"/><circle cx="55" cy="51" r="31" fill="#f2c99d" stroke="#21170f" stroke-width="4"/>${acc}${eyes}<path d="M46 64q9 8 18 0" fill="none" stroke="#21170f" stroke-width="3" stroke-linecap="round"/><path d="M30 91l-17 10M80 91l17 10" stroke="#21170f" stroke-width="5" stroke-linecap="round"/></svg>`;
  }
  function decorate() {
    const key = subjectKey();
    const names = casts[key] || casts.history;
    document.querySelectorAll('.panel').forEach((panel, i) => {
      if (panel.dataset.charactered || i === 0) return;
      const title = panel.querySelector('h2')?.textContent || `Panel ${i}`;
      const seed = hash(key + title + i);
      const name = names[seed % names.length];
      const color = palette[seed % palette.length];
      const line = lines[(seed + i) % lines.length];
      const wrap = document.createElement('div');
      wrap.className = `comic-cast ${i % 2 ? 'flip' : ''}`;
      wrap.innerHTML = `<div class="figurine">${svg(seed, color, i)}</div><div class="speech"><b>${name}</b><span>${line}</span></div>`;
      panel.insertBefore(wrap, panel.querySelector('p'));
      panel.dataset.charactered = '1';
    });
  }
  const style = document.createElement('style');
  style.textContent = `.comic-cast{display:flex;align-items:flex-end;gap:12px;margin:8px 0 14px}.comic-cast.flip{flex-direction:row-reverse}.figurine{width:105px;min-width:105px;filter:drop-shadow(4px 5px 0 #21170f33);animation:characterBob 3.2s ease-in-out infinite}.speech{position:relative;background:#fffaf0;border:3px solid #21170f;border-radius:18px;padding:12px 14px;box-shadow:4px 5px 0 #21170f;flex:1;font-family:system-ui,sans-serif}.speech:before{content:"";position:absolute;left:-13px;bottom:20px;width:20px;height:20px;background:#fffaf0;border-left:3px solid #21170f;border-bottom:3px solid #21170f;transform:rotate(45deg)}.flip .speech:before{left:auto;right:-13px;transform:rotate(225deg)}.speech b{display:block;color:#a63f28;font-size:13px;margin-bottom:4px}.speech span{font-size:15px;line-height:1.35;font-weight:650}@keyframes characterBob{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-5px) rotate(1deg)}}@media(max-width:390px){.figurine{width:82px;min-width:82px}.speech{padding:10px}.speech span{font-size:13px}}`;
  document.head.appendChild(style);
  const observer = new MutationObserver(() => requestAnimationFrame(decorate));
  observer.observe(document.getElementById('root') || document.body, {childList:true, subtree:true});
  decorate();
})();