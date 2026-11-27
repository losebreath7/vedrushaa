const el = id => document.getElementById(id);
const menu = el('menu');
function closeMenu() {
  el('links').hidden = true;
  menu.textContent = 'MENU (+)';
  menu.setAttribute('aria-expanded', 'false');
}
menu.onclick = () => {
  if (!el('links').hidden) return closeMenu();
  el('links').hidden = false;
  menu.textContent = 'MENU (−)';
  menu.setAttribute('aria-expanded', 'true');
};
el('links').onclick = closeMenu;
document.addEventListener('pointerdown', event => {
  if (!el('site-nav').contains(event.target)) closeMenu();
});
el('site-nav').addEventListener('focusout', event => {
  if (!el('site-nav').contains(event.relatedTarget)) closeMenu();
});
const responses = ['Начнём с коротких реплик вслух.', 'Поработаем с ритмом и интонацией.', 'Разберём грамматику на твоих фразах.', 'Попробуем флиртовать своими словами.', 'Дадим себе право на ошибку.', 'Посмотрим, что уже получается в разговоре.'];
document.querySelectorAll('.chip').forEach(button => {
  button.onclick = () => {
    document.querySelectorAll('.chip').forEach(b => b.setAttribute('aria-pressed', b === button));
    document.querySelector('.honest').textContent = responses[button.dataset.answer];
  };
});
const reader = el('reader');
document.querySelector('.book').onclick = () => reader.showModal();
reader.querySelector('button').onclick = () => reader.close();
const fileTitles = ['Полноценный урок, а не созвон на 15 минут.', 'Английский один на один с Кейт.', 'Учимся вместе, говорим по-настоящему.', 'Твой английский. Твой темп.'];
const fileNotes = [
  '<b>Что входит?</b><ol><li>Определим твой уровень</li><li>Поймём, где именно ты стопоришься</li><li>Обсудим цель</li><li>Подберём подходящий формат обучения</li></ol><b>После занятия:</b><p>Персональная программа<br>под твою цель</p>',
  '<b>Как проходят занятия?</b><p>Индивидуальная работа под твою цель.<br>Живой английский вместо зубрёжки правил.<br>Грамматика и разговорная практика.</p><b class="interest-title">Под твои интересы:</b><p>Работа, переезд, путешествия.</p>',
  '<div class="pricing-grid groups">'+[
    ['A1–A2 / Neo','Грамматика<br>до автоматизма','Пн / Ср — 10:00','до 8 человек','456 $','или 3 × 200 $'],
    ['A2 / Кейт','Говорю, но хромает<br>грамматика','Вт / Чт — 14:00','до 6 человек','600 $',''],
    ['B2 / Кейт','Говорю свободно,<br>нужна практика','Вт / Пт — 12:00','до 6 человек','600 $','']
  ].map(([name,desc,time,size,price,extra])=>'<div><b>'+name+'</b><p class="group-desc">'+desc+'</p><p>'+time+'</p><p>'+size+'</p><strong class="price">'+price+'</strong><p>'+extra+'</p></div>').join('')+'</div>',
  '<p class="team-description">Индивидуальные занятия с преподавателем, которого Кейт отобрала лично.<br>Программа под твои интересы и цели.</p><div class="pricing-grid packages">'+[
    ['12 занятий','3 700 ₽','44 400 ₽'],['24 занятия','3 230 ₽','77 520 ₽'],['50 занятий','3 100 ₽','155 000 ₽'],['100 занятий','2 900 ₽','290 000 ₽']
  ].map(([name,price,total])=>'<div><b>'+name+'</b><strong class="price">'+price+'</strong><p>за занятие</p><p class="package-total">'+total+' за пакет</p></div>').join('')+'</div>'
];
const fileTerms=[['60 минут','1 900 ₽','Online / Zoom'],['60 минут','100 $','Online / Zoom'],['24 занятия','3 месяца','Online / Zoom','расписание по мск'],['60 минут','2 раза в неделю','Online / Zoom']];
(() => {
  const section=el('money'), template=el('file-info');
  const originalButtons=Array.from(section.querySelectorAll('button.file'));
  const style=document.createElement('style');
  style.textContent = "\n#money .file{--folder-color:#a6dfff;--folder-ink:#151515;--folder-lift:clamp(24px,5vh,56px);background:transparent;clip-path:none;overflow:visible;isolation:isolate;color:var(--folder-ink);padding:0;pointer-events:none;z-index:2}\n#money .file-1{--folder-color:#d11516;--folder-ink:white;z-index:4}\n#money .file-2{--folder-color:#166238;--folder-ink:white;z-index:6}\n#money .file-3{--folder-color:#fff47c;--folder-ink:#30282a;z-index:8}\n#money .file-back,#money .folder-hit{position:absolute;inset:0;border-radius:16px 0 0 0;clip-path:polygon(0 0,40% 0,44% 18%,100% 18%,100% 100%,0 100%);background:var(--folder-color)}\n#money .file-back{filter:brightness(.83);z-index:0;pointer-events:none}\n#money .folder-hit{z-index:2;display:flex;flex-direction:column;align-items:flex-start;gap:2.5vh;padding:1.6vh 1.3vw 0;text-align:left;color:inherit;pointer-events:auto;transform-origin:center bottom;transition:transform .48s cubic-bezier(.22,1,.36,1),filter .3s}\n#money .folder-hit:focus-visible{outline-offset:-5px}\n#money .file:hover b{text-decoration:none}\n#money.open .file:not(.is-open){--folder-color:#e7e9e2;color:#71746c}\n#money .file.is-open .folder-hit{transform:perspective(850px) rotateX(-24deg) translateY(5px);filter:brightness(.96)}\n#money .paper-slot{position:absolute;top:var(--slot-top,0px);bottom:0;left:var(--slot-left,0px);width:var(--slot-width,100%);overflow:hidden;z-index:1;pointer-events:none}\n#money .folder-paper{position:absolute;top:0;left:0;width:100%;height:var(--paper-height,300px);transform:translateY(var(--paper-rest,100%));transition:transform .52s cubic-bezier(.22,1,.36,1);background:#fff;color:#000;overflow:hidden;font:400 clamp(11px,.9375vw,18px)/1.2 Inter,Arial,sans-serif;text-transform:uppercase;border-radius:0;pointer-events:none}\n#money .file.is-open .folder-paper{transform:translateY(0);pointer-events:auto}\n@media(hover:hover) and (pointer:fine){\n#money .file:not(.is-open):has(.folder-hit:hover,.folder-hit:focus-visible) .folder-paper{transform:translateY(calc(var(--paper-rest) - var(--folder-lift)))}\n#money .file:has(.folder-hit:hover,.folder-hit:focus-visible) .folder-hit{transform:perspective(850px) rotateX(-24deg) translateY(5px);filter:brightness(.96)}\n}\n#money .file-meta{position:absolute;left:2.1%;right:2%;top:4.1%;font-size:.78em;font-weight:700;color:#868686}\n#money .paper-title{position:absolute;left:1.9%;right:2%;top:16.7%;margin:0;font-size:1.33em;line-height:1.15;font-weight:700}\n#money .paper-copy{position:absolute;left:2%;right:2%;top:28.3%;line-height:1.2}\n#money .paper-copy b{display:block;font:700 1em/1.2 Inter,Arial,sans-serif;color:#333;letter-spacing:normal}\n#money .paper-copy ol{color:#868686;margin:.55em 0 1.55em;padding-left:1.45em}\n#money .paper-copy p{color:#868686;margin:.55em 0 0}\n#money .file-bottom{position:absolute;top:68.4%;left:49.3%;right:6.5%;display:flex;flex-direction:column;align-items:center;gap:1.45em;margin:0}\n#money .paper-terms{display:flex;width:100%;justify-content:space-between;gap:.4em;font:700 1em/1.2 Inter,Arial,sans-serif;letter-spacing:normal}\n#money .file-bottom a{display:flex;align-items:center;justify-content:center;gap:.15em;background:#d01616;color:#fff;padding:.35em 1em;border-radius:100px;font-size:1.15em;line-height:1.25;font-weight:700;white-space:nowrap}\n#money .file:not(.file-0) .file-bottom{left:2%;right:2%}\n@media(max-width:700px){\n#money .file{--folder-lift:20px}\n#money .folder-hit{padding:12px 10px;gap:12px}\n#money .folder-paper{padding:12px;overflow:auto;font-size:clamp(11px,3vw,14px)}\n#money .file-meta,#money .paper-title,#money .paper-copy,#money .file-bottom{position:static;margin:0 0 .8em}\n#money .file-bottom{align-items:flex-start;gap:.6em}\n#money .paper-copy ol{margin:.4em 0 .7em}\n#money .paper-terms{justify-content:flex-start;flex-wrap:wrap;gap:1em}\n}\n@media(prefers-reduced-motion:reduce){#money .folder-hit,#money .folder-paper{transition:none}}\n\n/* Pricing sheets: per-frame geometry from the approved desktop designs. */\n#money .folder-paper{text-transform:none;color:#2e2e2e}\n#money .file-meta{left:2.94%;right:2%;top:4.1%;text-transform:uppercase}\n#money .paper-title{left:2.94%;right:2%;top:14%;font-size:1.333em}\n#money .file-0 .paper-title{text-transform:uppercase;color:#000}\n#money .paper-copy{left:2.94%;right:2.94%;top:25.54%}\n#money .file-0 .paper-copy ol{margin:.55em 0 1.05em}\n#money .file-1 .paper-title{top:16.7%}\n#money .file-1 .paper-copy{top:28.3%}\n#money .interest-title{margin-top:2em}\n#money .file-2 .paper-title,#money .file-3 .paper-title{top:14.76%}\n#money .file-2 .paper-copy{top:25.7%}\n#money .file-3 .paper-copy{top:22.05%}\n#money .pricing-grid{display:grid;gap:1em}\n#money .pricing-grid.groups{grid-template-columns:repeat(3,minmax(0,1fr))}\n#money .pricing-grid.packages{grid-template-columns:repeat(4,minmax(0,1fr));margin-top:2.65em}\n#money .pricing-grid .price{display:block;margin-top:1.25em;color:#2e2e2e;font:700 1.333em/1.2 Inter,Arial,sans-serif;letter-spacing:normal;text-transform:none}\n#money .pricing-grid .group-desc{min-height:2.4em;margin:.6em 0 1.05em}\n#money .pricing-grid .package-total{margin-top:1.25em}\n#money .team-description{margin:0}\n#money .file-bottom,#money .file:not(.file-0) .file-bottom{left:2.94%;right:2.33%;top:70.33%;flex-direction:row;justify-content:space-between;align-items:center;gap:.6em}\n#money .file-1 .file-bottom{top:76.62%}\n#money .file-2 .file-bottom,#money .file-3 .file-bottom{top:76.04%}\n#money .paper-terms{width:auto;justify-content:flex-start;gap:1.65em;flex-wrap:wrap}\n#money .file-2 .paper-terms span:last-child{font-weight:400;color:#868686;margin-left:1em}\n#money .file-bottom a{flex-shrink:0;text-transform:uppercase}\n@media(max-width:700px){\n#money .folder-paper{padding:12px;overflow:auto}\n#money .paper-title,#money .paper-copy,#money .file-bottom,#money .file:not(.file-0) .file-bottom{position:static}\n#money .pricing-grid.groups,#money .pricing-grid.packages{grid-template-columns:repeat(2,minmax(0,1fr));gap:1em;margin-top:.6em}\n#money .pricing-grid .group-desc{min-height:0}\n#money .pricing-grid .price{margin-top:.6em}\n#money .file-bottom,#money .file:not(.file-0) .file-bottom{flex-wrap:wrap;margin-top:1em;justify-content:space-between}\n#money .paper-terms{gap:.5em 1em}\n}\n\n/* Updated Figma sheet geometry; desktop only. */\n@media(min-width:701px){\n#money .folder-paper{--sheet-inset:3.00518%;--sheet-right:3.00518%;--meta-right:3.00518%;--footer-y:70.33399%}\n#money .file-1 .folder-paper{--sheet-inset:3.32951%;--sheet-right:2.41102%;--meta-right:2.41102%;--footer-y:76.62083%}\n#money .file-2 .folder-paper{--footer-y:77.43056%}\n#money .file-3 .folder-paper{--sheet-inset:2.44932%;--sheet-right:2.36486%;--meta-right:2.36486%;--footer-y:76.04167%}\n#money .file-meta{left:var(--sheet-inset);right:var(--meta-right)}\n#money .paper-title,#money .paper-copy{left:var(--sheet-inset);right:var(--sheet-right)}\n#money .file-bottom,#money .file:not(.file-0) .file-bottom{left:var(--sheet-inset);right:var(--sheet-right);top:var(--footer-y)}\n#money .file-bottom a{box-sizing:border-box;width:calc(173 * 100vw / 1920);height:calc(41 * 100svh / 900);padding:0;font-size:clamp(11px,1.07542vw,21px)}\n#money .pricing-grid.groups{grid-template-columns:repeat(3,minmax(0,1fr));gap:0}\n#money .pricing-grid.packages{grid-template-columns:repeat(4,minmax(0,1fr));gap:0}\n#money .file-2 .paper-terms{gap:1.4em}\n#money .file-2 .paper-terms span:last-child{margin-left:.65em}\n}\n";
  document.head.appendChild(style);
  const folders=originalButtons.map((button,i)=>{
    const wrapper=document.createElement('div');
    wrapper.className=button.className;
    button.before(wrapper);
    const back=document.createElement('span');
    back.className='file-back';back.setAttribute('aria-hidden','true');
    const slot=document.createElement('div');slot.className='paper-slot';
    const paper=template.cloneNode(true);
    paper.id='pricing-paper-'+i;paper.className='folder-paper';paper.hidden=false;paper.inert=true;
    paper.setAttribute('aria-hidden','true');
    const number=paper.querySelector('#file-number'), title=paper.querySelector('#file-title'), copy=paper.querySelector('#file-copy'), terms=paper.querySelector('#file-terms');
    for(const node of [number,title,copy,terms])node.removeAttribute('id');
    title.className='paper-title';copy.className='paper-copy';terms.className='paper-terms';
    number.textContent='File 0'+(i+1);title.textContent=fileTitles[i];
    copy.innerHTML=fileNotes[i];
    terms.replaceChildren(...fileTerms[i].map(t=>{const s=document.createElement('span');s.textContent=t;return s;}));
    slot.append(paper);
    button.className='folder-hit';
    button.setAttribute('aria-controls',paper.id);
    wrapper.append(back,slot,button);
    return {wrapper,button,paper,i};
  });
  template.remove();
  function measure(){
    const mobile=matchMedia('(max-width:700px)').matches;
    const w=section.clientWidth,h=section.clientHeight;
    if(!w||!h)return;
    const frames=[{x:21,y:108,w:965,h:509},{x:1028,y:55,w:871,h:509},{x:21,y:195,w:965,h:576},{x:707,y:195,w:1184,h:576}];
    for(const {wrapper,i} of folders){
      const f=frames[i], y=wrapper.offsetTop, x=wrapper.offsetLeft;
      const top=h*(mobile?.10:f.y/900), height=h*(mobile?.49:f.h/900);
      const left=mobile?0:w*f.x/1920;
      const width=mobile?w:w*f.w/1920;
      wrapper.style.setProperty('--slot-top',(top-y)+'px');
      wrapper.style.setProperty('--slot-left',(left-x)+'px');
      wrapper.style.setProperty('--slot-width',width+'px');
      wrapper.style.setProperty('--paper-height',height+'px');
      wrapper.style.setProperty('--paper-rest',(y-top+wrapper.offsetHeight*.23)+'px');
    }
  }
  let active=-1;
  function select(index){
    active=index;
    section.classList.toggle('open',index>=0);
    for(const {wrapper,button,paper,i} of folders){
      const open=i===index;
      wrapper.classList.toggle('is-open',open);
      button.setAttribute('aria-expanded',String(open));
      paper.inert=!open;
      paper.setAttribute('aria-hidden',String(!open));
    }
  }
  for(const {button,i} of folders)button.addEventListener('click',()=>select(active===i?-1:i));
  section.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&active>=0){const i=active;select(-1);folders[i].button.focus({preventScroll:true});}
  });
  measure();
  if(typeof ResizeObserver!=='undefined')new ResizeObserver(measure).observe(section);
  else window.addEventListener('resize',measure,{passive:true});
})();

const intro = el('intro');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const seam = Array.from({length:101}, (_,i) => {
  const x = 50 + .55*Math.sin(i*.21) + .3*Math.cos(i*2.1) + .16*Math.sin(i*3.77);
  return [x,i];
});
const points = arr => arr.map(([x,y])=>x+'% '+y+'%').join(',');
intro.querySelector('.left').style.clipPath = 'polygon(0 0,'+points(seam)+',0 100%)';
intro.querySelector('.right').style.clipPath = 'polygon(100% 0,100% 100%,'+points(seam.slice().reverse().map(([x,y])=>[x-.04,y]))+')';
let startTear, endTear;
function finish(){
  clearTimeout(startTear);
  clearTimeout(endTear);
  if (intro.hidden) return;
  const restoreFocus = intro.contains(document.activeElement);
  intro.hidden=true;
  intro.classList.remove('tearing');
  document.documentElement.style.overflow='';
  document.querySelectorAll('#site-nav,header,main,footer').forEach(n=>n.inert=false);
  if (restoreFocus) el('menu').focus({preventScroll:true});
}
function playIntro(){
  finish();
  closeMenu();
  intro.hidden=false;
  document.documentElement.style.overflow='hidden';
  document.querySelectorAll('#site-nav,header,main,footer').forEach(n=>n.inert=true);
  startTear=setTimeout(()=>{
    if (reduced.matches) return finish();
    intro.classList.add('tearing');
    endTear=setTimeout(finish,1050);
  },6000);
}
el('skip').onclick=finish;
el('replay').onclick=playIntro;
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if (!el('links').hidden) menu.focus(); finish();closeMenu();}});
const art = new Image();
art.src = matchMedia('(max-width:700px)').matches?'intro-mobile.webp':'intro.webp';
if(!reduced.matches && !location.hash && scrollY<2){
  playIntro();
  art.decode().then(()=>{
    if (!intro.hidden && !intro.classList.contains('tearing')) playIntro();
  }).catch(finish);
}
const ring = document.querySelector('.type-ring');
const canvas = ring.querySelector('canvas');
canvas.width=856;canvas.height=342;
const ctx=canvas.getContext('2d');
const words=Array.from('TOO HOT TO SPEAK BAD ENGLISH · ');
let ringFrame;
function drawRing(t){
  if(!ctx)return;
  ring.classList.add('moving');
  ctx.clearRect(0,0,856,342);
  ctx.font='300 42px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';
  words.map((char,i)=>({char,a:i*2*Math.PI/words.length+t*.00020})).sort((a,b)=>Math.sin(a.a)-Math.sin(b.a)).forEach(({char,a})=>{
    const depth=Math.sin(a);
    ctx.save();
    ctx.translate(428+380*Math.cos(a),171+98*depth-19*Math.cos(a));
    ctx.scale(-depth,1);
    ctx.fillStyle='rgba(240,237,230,'+(.57+.31*depth)+')';
    ctx.fillText(char.toLowerCase(),0,0);ctx.restore();
  });
  ringFrame=requestAnimationFrame(drawRing);
}
function setRing(){
  cancelAnimationFrame(ringFrame);
  ring.classList.remove('moving');
  if(!reduced.matches && !document.hidden) ringFrame=requestAnimationFrame(drawRing);
}
reduced.addEventListener('change',setRing);
document.addEventListener('visibilitychange',setRing);
setRing();
