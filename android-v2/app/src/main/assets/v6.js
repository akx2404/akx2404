(() => {
'use strict';

const V6_COLORS={psychology:'#d26070',sociology:'#55a0ad',game:'#817bd0',history:'#ad7148',politics:'#d1a535',glitches:'#4d8ed3',psychoanalysis:'#78889f',medieval:'#9b7654',literature:'#a86f99',art:'#ca7651',philosophy:'#78955f',statistics:'#5f9a83',mythology:'#a46283'};
const V6_ICONS={psychology:'🧠',sociology:'🏙️',game:'♟️',history:'🗿',politics:'👑',glitches:'🌀',psychoanalysis:'🛋️',medieval:'🏰',literature:'📚',art:'🎨',philosophy:'🏛️',statistics:'📊',mythology:'🐉'};
const V6_THINK={
 en:{
 psychology:['When have you mistaken attention for judgement?','What evidence would prove your first impression wrong?','Would the same behaviour feel different if nobody were watching?'],
 sociology:['Who benefits when this becomes a shared social rule?','What changes when the network, not the individual, is the unit of analysis?','Which group is missing from this account?'],
 game:['What would a rational opponent expect you to do next?','Does cooperation survive if the interaction happens only once?','Which hidden incentive changes the outcome?'],
 history:['Which piece of evidence would most strongly challenge this story?','Are we seeing a single cause or many small failures acting together?','Whose record is absent because they could not write it down?'],
 politics:['How could this structure preserve itself even under good leaders?','What would people say privately but hide publicly?','Who controls the rules for replacing those in power?'],
 glitches:['What did your brain silently assume instead of actually observing?','Which detail would you confidently remember but may never have seen?','How could an experiment separate attention from perception?'],
 psychoanalysis:['What feeling is being redirected rather than expressed directly?','What would become uncomfortable if the defence disappeared?','Is this explanation testable, or only narratively satisfying?'],
 medieval:['What did the original viewer know that a modern viewer has forgotten?','Why place humour or monsters beside sacred text?','What can the margins reveal that official art hides?'],
 literature:['How does the form of the story change what can be believed?','Which later stories quietly inherited this technique?','What changes when the narrator cannot be trusted?'],
 art:['What social change made this visual language possible?','Would the work mean the same thing outside its original setting?','Is the artist controlling interpretation—or provoking it?'],
 philosophy:['Which assumption makes the paradox feel difficult?','Would your answer change if the case involved a person rather than an object?','What counts as continuity: matter, memory, function, or name?'],
 statistics:['Which population disappeared before the data was collected?','Could the trend reverse after grouping the data differently?','What causal story is being smuggled into a correlation?'],
 mythology:['What human fear or hope survives across these different cultures?','Which part of the myth legitimises power or social order?','Is the similarity evidence of contact, or of shared human problems?']
 },
 mr:{
 psychology:['कधी तुम्ही लोकांचे लक्ष म्हणजे त्यांचा न्याय आहे असे समजला आहात?','तुमचा पहिला निष्कर्ष चुकीचा आहे हे कोणता पुरावा दाखवेल?','कोणी पाहत नसते तर हेच वर्तन वेगळे वाटले असते का?'],
 sociology:['ही गोष्ट सामाजिक नियम बनल्यावर कोणाला फायदा होतो?','व्यक्तीऐवजी संपूर्ण जाळ्याकडे पाहिल्यास अर्थ कसा बदलतो?','या कथेत कोणता गट गायब आहे?'],
 game:['तुमचा तर्कशुद्ध प्रतिस्पर्धी पुढे काय अपेक्षित करेल?','खेळ फक्त एकदाच झाला तर सहकार्य टिकेल का?','कोणते लपलेले प्रोत्साहन निकाल बदलते?'],
 history:['कोणता पुरावा ही कथा सर्वाधिक कमकुवत करेल?','हा एकच कारणाचा परिणाम आहे की अनेक छोट्या अपयशांचा?','लिहू न शकलेल्या लोकांचा अनुभव कुठे गेला?'],
 politics:['चांगले नेते असतानाही ही रचना स्वतःला कशी टिकवते?','लोक खाजगीत काय म्हणतात पण सार्वजनिकपणे लपवतात?','सत्ताधाऱ्यांना बदलण्याचे नियम कोण ठरवते?'],
 glitches:['मेंदूने प्रत्यक्ष पाहण्याऐवजी कोणता अंदाज बांधला?','तुम्हाला खात्रीने आठवणारी कोणती गोष्ट प्रत्यक्ष पाहिलीच नसेल?','लक्ष आणि आकलन वेगळे करणारा प्रयोग कसा असेल?'],
 psychoanalysis:['कोणती भावना थेट व्यक्त न होता दुसरीकडे वळवली जाते?','हा बचाव नाहीसा झाला तर काय अस्वस्थ करेल?','हे स्पष्टीकरण तपासता येते की ते फक्त आकर्षक कथा आहे?'],
 medieval:['मूळ प्रेक्षकाला माहीत असलेली कोणती गोष्ट आज आपण विसरलो आहोत?','पवित्र मजकुराच्या बाजूला विनोद किंवा राक्षस का काढले असतील?','अधिकृत कलेने लपवलेली कोणती गोष्ट कडांमध्ये दिसते?'],
 literature:['कथेची रचना कोणत्या गोष्टींवर विश्वास ठेवता येतो हे कसे बदलते?','नंतरच्या कोणत्या कथांनी हे तंत्र नकळत घेतले?','कथनकर्त्यावर विश्वास ठेवता येत नसेल तर काय बदलते?'],
 art:['ही दृश्यभाषा शक्य करणारा सामाजिक बदल कोणता?','मूळ संदर्भाबाहेर या कलाकृतीचा अर्थ तोच राहील का?','कलाकार अर्थ नियंत्रित करतो की प्रश्न निर्माण करतो?'],
 philosophy:['कोणत्या गृहितकामुळे हा विरोधाभास कठीण वाटतो?','वस्तूऐवजी व्यक्तीचा प्रश्न असता तर उत्तर बदलले असते का?','सातत्य म्हणजे पदार्थ, स्मृती, कार्य की नाव?'],
 statistics:['माहिती गोळा होण्याआधी कोणता समूह गायब झाला?','डेटा वेगळ्या गटांत विभागल्यास कल उलटू शकतो का?','सहसंबंधात कोणती कारणकथा नकळत गृहित धरली आहे?'],
 mythology:['वेगवेगळ्या संस्कृतींमध्ये कोणती मानवी भीती किंवा आशा टिकून आहे?','या मिथकाचा कोणता भाग सत्ता किंवा सामाजिक व्यवस्था योग्य ठरवतो?','साम्य हे सांस्कृतिक संपर्कामुळे आहे की समान मानवी समस्यांमुळे?']
 }
};

const style=document.createElement('style');
style.textContent=`
.v6-visual{position:relative;margin:18px 0 22px;border:3px solid #24180f;border-radius:22px;overflow:hidden;background:#d7c49e;min-height:190px;isolation:isolate}
.v6-photo{display:block;width:100%;height:230px;object-fit:cover;filter:saturate(.78) contrast(1.12) sepia(.12)}
.v6-visual:after{content:'';position:absolute;inset:0;pointer-events:none;background-image:radial-gradient(#24180f38 .8px,transparent .8px);background-size:5px 5px;mix-blend-mode:multiply;opacity:.28}
.v6-caption{position:absolute;left:12px;right:12px;bottom:12px;z-index:2;background:#fff8e8e8;border:2px solid #24180f;border-radius:13px;padding:9px 11px;font:800 12px/1.25 system-ui;color:#24180f;backdrop-filter:blur(4px)}
.v6-fallback{height:220px;display:grid;place-items:center;background:linear-gradient(135deg,var(--v6tone),#f0d29a)}
.v6-fallback svg{width:100%;height:100%}
.v6-strip{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:20px 0}
.v6-frame{position:relative;min-height:132px;background:#fff8e8;border:3px solid #24180f;border-radius:14px;overflow:hidden;padding:8px;display:flex;align-items:flex-end;justify-content:center}
.v6-frame:before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 15% 12%,var(--v6tone) 0 4%,transparent 5%),linear-gradient(155deg,#fff8e8,#ead5aa);opacity:.75}
.v6-person{position:relative;z-index:1;width:54px;height:79px}
.v6-person .head{position:absolute;width:35px;height:35px;border:3px solid #24180f;border-radius:50%;background:#efc596;left:9px;top:2px}.v6-person .eye{position:absolute;width:4px;height:4px;border-radius:50%;background:#24180f;top:15px}.v6-person .eye.a{left:8px}.v6-person .eye.b{right:8px}.v6-person .mouth{position:absolute;width:14px;height:7px;border-bottom:3px solid #24180f;border-radius:50%;left:8px;top:21px}.v6-person .body{position:absolute;width:50px;height:43px;border:3px solid #24180f;border-radius:25px 25px 6px 6px;background:var(--v6tone);left:2px;bottom:0}
.v6-bubble{position:absolute;z-index:2;top:7px;left:7px;right:7px;background:white;border:2px solid #24180f;border-radius:10px;padding:5px;font:800 8px/1.15 system-ui;color:#24180f;text-align:center}
.v6-symbol{position:absolute;z-index:1;right:8px;bottom:8px;font-size:27px;filter:drop-shadow(1px 2px 0 #fff)}
.v6-think{margin:18px 0 4px;border:3px dashed #704b2c;border-radius:18px;background:#ead8ae;padding:0;overflow:hidden}.v6-think button{width:100%;border:0;background:transparent;text-align:left;padding:15px 16px;font-weight:900;color:#4b2d18;display:flex;align-items:center;justify-content:space-between}.v6-answer{display:none;border-top:2px dashed #8c6a45;padding:15px 16px;font:700 15px/1.45 system-ui;color:#3c2a1c}.v6-think.open .v6-answer{display:block}.v6-think.open button span:last-child{transform:rotate(45deg)}
.v6-kicker{display:flex;align-items:center;gap:8px;font:900 11px/1 system-ui;text-transform:uppercase;letter-spacing:.1em;color:#8d402c;margin:4px 0 10px}.v6-kicker i{display:block;width:26px;height:4px;border-radius:5px;background:var(--v6tone)}
@media(max-width:430px){.v6-photo,.v6-fallback{height:190px}.v6-frame{min-height:118px}.v6-bubble{font-size:7px}.v6-person{transform:scale(.9);transform-origin:bottom center}}
`;
document.head.appendChild(style);

const oldRenderLesson=renderLesson;
function panelImage(title,img,wrap){
 const url=`https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&origin=*&pithumbsize=1100&titles=${encodeURIComponent(title)}`;
 fetch(url).then(r=>r.json()).then(j=>{const page=Object.values(j.query.pages||{})[0];if(page&&page.thumbnail&&page.thumbnail.source){img.src=page.thumbnail.source;img.hidden=false;wrap.querySelector('.v6-fallback').hidden=true}}).catch(()=>{});
}
function miniPerson(){return `<div class="v6-person"><div class="head"><i class="eye a"></i><i class="eye b"></i><i class="mouth"></i></div><div class="body"></div></div>`}
function comicStrip(topicId,title,index){
 const icon=V6_ICONS[topicId]||'💡';
 const lines=lang==='mr'?
  [['पहिले दिसते तेच संपूर्ण सत्य आहे का?','पुरावा बदलला तर कथा बदलते.','आता उलटा प्रश्न विचारा.'],['निरीक्षण करा.','नमुना शोधा.','गृहितक तपासा.']]:
  [['Is the first explanation the whole story?','Change the evidence; the story changes.','Now ask the reverse question.'],['Observe.','Find the pattern.','Test the assumption.']];
 const chosen=lines[index%lines.length];
 return `<div class="v6-strip" style="--v6tone:${V6_COLORS[topicId]||'#b87845'}">${chosen.map((line,i)=>`<div class="v6-frame"><div class="v6-bubble">${esc(line)}</div>${miniPerson()}<div class="v6-symbol">${i===1?'🔎':i===2?'❓':icon}</div></div>`).join('')}</div>`;
}
function fallbackScene(topicId,index){
 const tone=V6_COLORS[topicId]||'#a87548',icon=V6_ICONS[topicId]||'💡';
 return `<div class="v6-fallback" style="--v6tone:${tone}"><svg viewBox="0 0 600 260" role="img" aria-label="Comic illustration"><defs><pattern id="dots${index}" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.4" fill="#24180f" opacity=".22"/></pattern></defs><rect width="600" height="260" fill="${tone}" opacity=".36"/><rect width="600" height="260" fill="url(#dots${index})"/><path d="M0 215 Q145 150 290 215 T600 205 V260 H0Z" fill="#24180f" opacity=".18"/><circle cx="170" cy="112" r="48" fill="#efc596" stroke="#24180f" stroke-width="7"/><circle cx="153" cy="108" r="6"/><circle cx="187" cy="108" r="6"/><path d="M153 132q17 15 34 0" fill="none" stroke="#24180f" stroke-width="6" stroke-linecap="round"/><path d="M103 239q8-79 67-79t67 79" fill="${tone}" stroke="#24180f" stroke-width="7"/><path d="M300 48h238q22 0 22 22v76q0 22-22 22H386l-41 36 8-36h-53q-22 0-22-22V70q0-22 22-22z" fill="#fff8e8" stroke="#24180f" stroke-width="7"/><text x="420" y="126" text-anchor="middle" font-size="64">${icon}</text></svg></div>`;
}
function thought(topicId,index){
 const bank=(V6_THINK[lang]&&V6_THINK[lang][topicId])||V6_THINK.en[topicId]||V6_THINK.en.philosophy;
 const q=bank[index%bank.length];
 const hint=lang==='mr'?'उत्तर लगेच शोधू नका. दोन शक्य स्पष्टीकरणे मनात तयार करा, मग पुढील भागातील पुराव्याशी त्यांची तुलना करा.':'Do not answer immediately. Form two competing explanations, then compare both with the evidence in the next section.';
 return `<div class="v6-think"><button type="button" class="v6-think-toggle"><span>💭 ${lang==='mr'?'थांबा आणि विचार करा':'Pause and think'}</span><span>＋</span></button><div class="v6-answer"><strong>${esc(q)}</strong><br><br>${esc(hint)}</div></div>`;
}

renderLesson=function(t,shown,base,ck){
 oldRenderLesson(t,shown,base,ck);
 const papers=[...root.querySelectorAll('article.paper')];
 papers.forEach((paper,i)=>{
  const panel=shown.panels[i]; if(!panel)return;
  const tone=V6_COLORS[t[0]]||'#a87548';
  paper.style.setProperty('--v6tone',tone);
  const heading=paper.querySelector('h2');
  const comic=paper.querySelector('.comic');
  const visual=document.createElement('div');
  visual.className='v6-visual';visual.style.setProperty('--v6tone',tone);
  visual.innerHTML=`<img class="v6-photo" hidden loading="lazy" decoding="async" alt="${esc(panel.title)}">${fallbackScene(t[0],i)}<div class="v6-caption">${esc(panel.title)}</div>`;
  if(comic)comic.insertAdjacentElement('afterend',visual);else heading.insertAdjacentElement('afterend',visual);
  panelImage(base.panels[i].title,visual.querySelector('img'),visual);
  visual.insertAdjacentHTML('afterend',comicStrip(t[0],panel.title,i));
  const paragraph=paper.querySelector('p');
  if(paragraph)paragraph.insertAdjacentHTML('afterend',thought(t[0],i));
 });
 root.addEventListener('click',e=>{const b=e.target.closest('.v6-think-toggle');if(b)b.parentElement.classList.toggle('open')},{once:false});
};

})();