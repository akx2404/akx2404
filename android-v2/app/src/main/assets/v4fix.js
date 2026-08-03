(() => {
  const style = document.createElement('style');
  style.textContent = `
    header{padding-right:112px!important;overflow:visible!important}
    .v4-lang,.lang-switch,.language-toggle,.language-pill{display:none!important}
    .v4-language-fab{position:fixed;right:14px;top:16px;z-index:9999;border:1px solid #ffffff38;background:#2a1d17;color:#f7e8cc;border-radius:999px;padding:11px 15px;font-size:13px;font-weight:900;box-shadow:0 7px 22px #0008;min-width:76px;text-align:center}
    .v4-language-fab:active{transform:scale(.97)}
    @media(max-width:390px){header{padding-right:96px!important}.v4-language-fab{right:9px;top:12px;padding:9px 12px;min-width:68px;font-size:12px}}
  `;
  document.head.appendChild(style);

  function install(){
    document.querySelectorAll('.v4-lang,.lang-switch,.language-toggle,.language-pill').forEach(x=>x.remove());
    document.querySelectorAll('header button').forEach(b=>{
      const t=(b.textContent||'').trim();
      if(t==='English'||t==='मराठी'||t==='EN') b.remove();
    });
    let btn=document.querySelector('.v4-language-fab');
    if(!btn){
      btn=document.createElement('button');
      btn.className='v4-language-fab';
      document.body.appendChild(btn);
      btn.onclick=()=>{
        const now=localStorage.caveLang==='mr'?'mr':'en';
        localStorage.caveLang=now==='mr'?'en':'mr';
        location.reload();
      };
    }
    btn.textContent=localStorage.caveLang==='mr'?'English':'मराठी';
    btn.setAttribute('aria-label',localStorage.caveLang==='mr'?'Switch to English':'मराठीत वाचा');
  }
  const observer=new MutationObserver(()=>requestAnimationFrame(install));
  observer.observe(document.body,{childList:true,subtree:true});
  install();
})();