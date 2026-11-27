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
