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
document.querySelectorAll('.file').forEach((button, i, buttons) => {
  button.onclick = () => {
    const open = button.getAttribute('aria-expanded') !== 'true';
    buttons.forEach(b => b.setAttribute('aria-expanded', open && b === button));
    el('money').classList.toggle('open',open);
    el('file-info').hidden = !open;
    el('file-number').textContent = 'File 0' + (i+1);
    el('file-title').textContent = fileTitles[i];
    if(i===0) el('file-copy').innerHTML = '<b>Что входит?</b><ol><li>Определим твой уровень</li><li>Поймём, где именно ты стопоришься</li><li>Обсудим цель</li><li>Подберём подходящий формат обучения</li></ol><b>После занятия</b><p>Персональная программа под твою цель</p>';
    else el('file-copy').textContent = fileNotes[i];
    el('file-terms').textContent = i === 0 ? '60 минут　 1 900 ₽　 Online / Zoom' : 'Расписание и стоимость — в Telegram';
  };
});

// Folder interaction: stable hit area, layered cover and paper, reversible motion.
(() => {
  const section = el('money');
  const paper = el('file-info');
  const buttons = Array.from(section.querySelectorAll('.file'));
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const style = document.createElement('style');
  style.textContent = "\n#money .file{--folder-color:#a6dfff;--folder-ink:#151515;--folder-lift:clamp(24px,5vh,56px);background:transparent;clip-path:none;overflow:visible;isolation:isolate;perspective:850px;color:var(--folder-ink);z-index:2}\n#money .file-0{z-index:2}\n#money .file-1{--folder-color:#d11516;--folder-ink:white;z-index:4}\n#money .file-2{--folder-color:#166238;--folder-ink:white;z-index:6}\n#money .file-3{--folder-color:#fff47c;--folder-ink:#30282a;z-index:8}\n#money .file-back,#money .file-front{position:absolute;inset:0;border-radius:16px 0 0 0;clip-path:polygon(0 0,40% 0,44% 18%,100% 18%,100% 100%,0 100%);pointer-events:none;background:var(--folder-color)}\n#money .file-back{filter:brightness(.83);z-index:-3}\n#money .file-preview{position:absolute;left:6%;right:6%;top:20%;bottom:8%;z-index:-2;border-radius:3px;background:#fff;box-shadow:0 2px 12px #0002;pointer-events:none;transform:translateY(0);transition:transform .48s cubic-bezier(.22,1,.36,1)}\n#money .file-preview::after{content:\"\";position:absolute;left:7%;right:12%;top:13%;height:24%;background:repeating-linear-gradient(to bottom,#bfc0bd 0 1px,transparent 1px 8px)}\n#money .file-front{z-index:-1;transform-origin:center bottom;transition:transform .48s cubic-bezier(.22,1,.36,1),filter .3s}\n#money .file-label{display:flex;flex-direction:column;align-items:flex-start;gap:inherit;pointer-events:none;transform-origin:center bottom;transition:transform .48s cubic-bezier(.22,1,.36,1)}\n#money .file:hover b{text-decoration:none}\n#money.open .file[aria-expanded=false]{background:transparent;color:#71746c;--folder-color:#e7e9e2}\n#money .file[aria-expanded=true] .file-front{transform:rotateX(-24deg) translateY(5px);filter:brightness(.96)}\n#money .file[aria-expanded=true] .file-label{transform:translateY(8px)}\n#money .file[aria-expanded=true] .file-preview{transform:translateY(calc(-1 * var(--folder-lift)))}\n@media(hover:hover) and (pointer:fine){\n#money .file:hover .file-front,#money .file:focus-visible .file-front{transform:rotateX(-24deg) translateY(5px);filter:brightness(.96)}\n#money .file:hover .file-label,#money .file:focus-visible .file-label{transform:translateY(8px)}\n#money .file:hover .file-preview,#money .file:focus-visible .file-preview{transform:translateY(calc(-1 * var(--folder-lift)))}\n}\n#money #file-info{z-index:1}\n #money.open #file-info{z-index:var(--paper-layer,1)}\n@media(max-width:700px){#money .file{--folder-lift:20px}#money .file-label{gap:12px}}\n@media(prefers-reduced-motion:reduce){#money .file-front,#money .file-label,#money .file-preview{transition:none}}\n";
  document.head.appendChild(style);
  buttons.forEach(button => {
    const label = document.createElement('span');
    label.className = 'file-label';
    label.append(...Array.from(button.childNodes));
    for (const name of ['file-back','file-preview','file-front']) {
      const layer = document.createElement('span');
      layer.className = name;
      layer.setAttribute('aria-hidden','true');
      button.append(layer);
    }
    button.append(label);
    // Keep the existing content/selection handler as the single source of truth.
    const select = button.onclick;
    button.onclick = event => {
      const wasOpen = button.getAttribute('aria-expanded') === 'true';
      select.call(button,event);
      paper.style.setProperty('--paper-layer', String(1 + 2 * buttons.indexOf(button)));
      if (wasOpen || motion.matches || !paper.animate) return;
      paper.getAnimations().forEach(animation => animation.cancel());
      const from = button.getBoundingClientRect();
      const to = paper.getBoundingClientRect();
      if (!to.width || !to.height) return;
      const dx = from.left + from.width/2 - to.left - to.width/2;
      const dy = from.top + from.height*.22 - to.top - to.height*.75;
      paper.animate([
        {transform:'translate('+dx+'px,'+dy+'px) scale(.68)',opacity:0},
        {opacity:1,offset:.28},
        {transform:'translate(0,0) scale(1)',opacity:1}
      ],{duration:520,easing:'cubic-bezier(.22,1,.36,1)'});
    };
  });
  section.addEventListener('keydown',event => {
    if(event.key !== 'Escape') return;
    const active = buttons.find(button => button.getAttribute('aria-expanded') === 'true');
    if(active){active.click();active.focus({preventScroll:true});}
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
