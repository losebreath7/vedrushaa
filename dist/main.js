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
const fileTitles = ['Полноценный урок, а не созвон на 15 минут.', 'Индивидуальные с Кейт', 'Мини-группы', 'Индивидуальные с учителем команды'];
const fileNotes = ['', 'Один на один с Катей. Расскажи, для чего тебе английский и что сейчас сложнее всего.', 'Практика с другими учениками. Спроси в боте, есть ли группа твоего уровня.', 'Персональные занятия с преподавателем школы. Расскажи о своей цели, чтобы подобрать формат.'];
(() => {
  const section=el('money'), paper=el('file-info');
  const buttons=Array.from(section.querySelectorAll('.file'));
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const style=document.createElement('style');
  style.textContent="\n#money .file{--folder-color:#a6dfff;--folder-ink:#151515;--folder-lift:clamp(24px,5vh,56px);background:transparent;clip-path:none;overflow:visible;isolation:isolate;perspective:850px;color:var(--folder-ink);z-index:2}\n#money .file-0{z-index:2}\n#money .file-1{--folder-color:#d11516;--folder-ink:white;z-index:4}\n#money .file-2{--folder-color:#166238;--folder-ink:white;z-index:6}\n#money .file-3{--folder-color:#fff47c;--folder-ink:#30282a;z-index:8}\n#money .file-back,#money .file-front{position:absolute;inset:0;border-radius:16px 0 0 0;clip-path:polygon(0 0,40% 0,44% 18%,100% 18%,100% 100%,0 100%);pointer-events:none;background:var(--folder-color)}\n#money .file-back{filter:brightness(.83);z-index:-3}\n#money .file-preview{position:absolute;left:6%;right:6%;top:20%;bottom:8%;z-index:-2;border-radius:3px;background:#fff;box-shadow:0 2px 12px #0002;pointer-events:none;transform:translateY(0);transition:transform .48s cubic-bezier(.22,1,.36,1)}\n#money .file-preview::after{content:\"\";position:absolute;left:7%;right:12%;top:13%;height:24%;background:repeating-linear-gradient(to bottom,#bfc0bd 0 1px,transparent 1px 8px)}\n#money .file-front{z-index:-1;transform-origin:center bottom;transition:transform .48s cubic-bezier(.22,1,.36,1),filter .3s}\n#money .file-label{display:flex;flex-direction:column;align-items:flex-start;gap:inherit;pointer-events:none;transform-origin:center bottom;transition:transform .48s cubic-bezier(.22,1,.36,1)}\n#money .file:hover b{text-decoration:none}\n#money.open .file[aria-expanded=false]{background:transparent;color:#71746c;--folder-color:#e7e9e2}\n#money .file[aria-expanded=true] .file-front{transform:rotateX(-24deg) translateY(5px);filter:brightness(.96)}\n#money .file[aria-expanded=true] .file-label{transform:translateY(8px)}\n\n@media(hover:hover) and (pointer:fine){\n#money .file:hover .file-front,#money .file:focus-visible .file-front{transform:rotateX(-24deg) translateY(5px);filter:brightness(.96)}\n#money .file:hover .file-label,#money .file:focus-visible .file-label{transform:translateY(8px)}\n#money .file:hover .file-preview,#money .file:focus-visible .file-preview{transform:translateY(calc(-1 * var(--folder-lift)))}\n}\n#money #file-info{z-index:var(--paper-layer,1);top:12%;height:56.55%;width:var(--paper-width,52.45%);left:var(--paper-left,0%);padding:0;border-radius:0;overflow:hidden;background:white;color:#000;font-family:Inter,Arial,sans-serif;font-size:clamp(11px,.9375vw,18px);text-transform:uppercase}\n#money #file-info[hidden]{display:none}\n#money .file-meta{position:absolute;left:2.1%;right:2%;top:4.1%;font-size:.78em;font-weight:700;color:#868686}\n#money #file-title{position:absolute;left:1.9%;right:2%;top:16.7%;margin:0;font-size:1.33em;line-height:1.15;font-weight:700}\n#money #file-copy{position:absolute;left:2%;right:2%;top:28.3%;line-height:1.2}\n#money #file-copy b{display:block;font-weight:700;color:#333}\n#money #file-copy ol{color:#868686;margin:.55em 0 1.55em;padding-left:1.45em}\n#money #file-copy p{color:#868686;margin:.55em 0 0}\n#money .file-bottom{position:absolute;top:68.4%;left:49.3%;right:6.5%;display:flex;flex-direction:column;align-items:center;gap:1.45em;margin:0}\n#money #file-terms{display:flex;width:100%;justify-content:space-between;gap:.4em;font-size:1em;white-space:nowrap}\n#money .file-bottom a{display:flex;align-items:center;justify-content:center;gap:.15em;background:#d01616;color:#fff;padding:.35em 1em;border-radius:100px;font-size:1.15em;line-height:1.25;font-weight:700;white-space:nowrap}\n#money .file[aria-expanded=true] .file-preview{visibility:hidden}\n@media(max-width:700px){#money #file-info{top:10%;left:0;width:100%;height:49%;padding:12px;overflow:auto;font-size:clamp(11px,3vw,14px)}#money .file-meta,#money #file-title,#money #file-copy,#money .file-bottom{position:static;margin:0 0 .8em}#money .file-bottom{align-items:flex-start;gap:.6em}#money #file-copy ol{margin:.4em 0 .7em}#money #file-terms{justify-content:flex-start;flex-wrap:wrap;gap:1em}}\n\n@media(max-width:700px){#money .file{--folder-lift:20px}#money .file-label{gap:12px}}\n@media(prefers-reduced-motion:reduce){#money .file-front,#money .file-label,#money .file-preview{transition:none}}\n";
  document.head.appendChild(style);
  let active=-1, requested=-1, animation=null, busy=false;
  const duration=()=>reduced.matches?0:520;
  function populate(i){
    el('file-number').textContent='File 0'+(i+1);
    el('file-title').textContent=fileTitles[i];
    if(i===0) el('file-copy').innerHTML='<b>Что входит?</b><ol><li>Определим твой уровень</li><li>Поймём, где именно ты стопоришься</li><li>Обсудим цель</li><li>Подберём подходящий формат обучения</li></ol><b>После занятия:</b><p>Персональная программа<br>под твою цель</p>';
    else el('file-copy').textContent=fileNotes[i];
    el('file-terms').replaceChildren(...(i===0?['60 минут','1 900 ₽','Online / Zoom']:['Расписание и стоимость — в Telegram']).map(t=>{const s=document.createElement('span');s.textContent=t;return s;}));
  }
  function geometry(i){
    const box=section.getBoundingClientRect(), b=buttons[i].getBoundingClientRect();
    paper.style.setProperty('--paper-left',((b.left-box.left)/box.width*100)+'%');
    paper.style.setProperty('--paper-width',(b.width/box.width*100)+'%');
    if(i===0)paper.style.setProperty('--paper-width','52.45%');
    paper.style.setProperty('--paper-layer',String(1+2*i));
    // The sheet moves only vertically; its hidden state starts below the section.
    return Math.max(0,box.bottom-paper.getBoundingClientRect().top);
  }
  function selected(i){
    buttons.forEach((b,j)=>b.setAttribute('aria-expanded',String(j===i)));
    section.classList.toggle('open',i>=0);
  }
  async function move(from,to){
    if(!duration()||!paper.animate){paper.style.transform='translateY('+to+'px)';return;}
    animation=paper.animate([{transform:'translateY('+from+'px)'},{transform:'translateY('+to+'px)'}],{duration:duration(),easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'});
    try{await animation.finished;}catch{}
    paper.style.transform='translateY('+to+'px)';
    animation.cancel();animation=null;
  }
  async function reconcile(){
    if(busy)return;
    busy=true;
    try{
      while(active!==requested){
        if(active>=0){
          const i=active;
          selected(-1);
          paper.inert=true;
          const distance=geometry(i);
          await move(0,distance);
          paper.hidden=true;paper.style.transform='';active=-1;
        }else if(requested>=0){
          const i=requested;
          populate(i);paper.hidden=false;paper.inert=true;paper.style.transform='';
          const distance=geometry(i);
          selected(i);active=i;
          await move(distance,0);
          paper.inert=false;
        }
      }
    }finally{busy=false;}
  }
  buttons.forEach((button,i)=>{
    const label=document.createElement('span');label.className='file-label';label.append(...Array.from(button.childNodes));
    for(const name of ['file-back','file-preview','file-front']){
      const layer=document.createElement('span');layer.className=name;layer.setAttribute('aria-hidden','true');button.append(layer);
    }
    button.append(label);
    button.onclick=()=>{requested=requested===i?-1:i;reconcile();};
  });
  section.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&requested>=0){const i=requested;requested=-1;reconcile();buttons[i].focus({preventScroll:true});}
  });
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
