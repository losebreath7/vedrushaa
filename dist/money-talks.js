(() => {
  'use strict';
  const stage=document.getElementById('money-talks');
  if(!stage)return;
  const button=stage.querySelector('.mt-follow'), drawer=stage.querySelector('.mt-drawer'), scene=stage.querySelector('.mt-scene'), close=stage.querySelector('.mt-close');
  const fine=matchMedia('(hover:hover) and (pointer:fine)'), reduced=matchMedia('(prefers-reduced-motion:reduce)');
  let open=false, scrollJob=0, frame=0, x=0,y=0,tx=0,ty=0,ready=false, last=null;
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
  function draw(){frame=0;const k=reduced.matches?1:.25;x+=(tx-x)*k;y+=(ty-y)*k;button.style.setProperty('--mt-x',x+'px');button.style.setProperty('--mt-y',y+'px');if(Math.abs(tx-x)+Math.abs(ty-y)>.5)frame=requestAnimationFrame(draw);}
  function fitHeading(){const heading=scene.querySelector('.mt-heading');const width=scene.clientWidth;if(!width||!heading)return;stage.style.setProperty('--mt-heading-size','100px');const measured=heading.getBoundingClientRect().width;if(measured>0)stage.style.setProperty('--mt-heading-size',(100*(width-2)/measured)+'px');}
  function reset(){fitHeading();if(frame)cancelAnimationFrame(frame);frame=0;const w=scene.clientWidth,h=scene.clientHeight;x=tx=clamp(w*.7177,0,w-button.offsetWidth);y=ty=clamp(h*.7456,0,h-button.offsetHeight);draw();button.classList.remove('is-hidden');}
  function setOpen(next){if(open===next)return;open=next;stage.classList.toggle('is-open',open);button.setAttribute('aria-expanded',String(open));button.inert=open;if(open)button.blur();drawer.inert=!open;drawer.setAttribute('aria-hidden',String(!open));clearTimeout(scrollJob);if(open){scrollJob=setTimeout(()=>{if(!open)return;window.ScrollTrigger?.refresh();drawer.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});close.focus({preventScroll:true});},reduced.matches?0:660);}else{scene.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});button.classList.remove('is-hidden');button.focus({preventScroll:true});scrollJob=setTimeout(()=>window.ScrollTrigger?.refresh(),reduced.matches?0:660);}}
  function update(e){if(!ready||!fine.matches||open||e.pointerType==='touch')return;last=e;const rect=scene.getBoundingClientRect(),inside=e.clientX>=rect.left&&e.clientX<=rect.right&&e.clientY>=rect.top&&e.clientY<=rect.bottom;const nav=e.target instanceof Element&&e.target.closest('#menu,#links');button.classList.toggle('is-hidden',!inside||!!nav);if(!inside||nav)return;tx=clamp(e.clientX-rect.left-button.offsetWidth/2,0,rect.width-button.offsetWidth);ty=clamp(e.clientY-rect.top-button.offsetHeight/2,0,rect.height-button.offsetHeight);if(!frame)frame=requestAnimationFrame(draw);}
  document.addEventListener('pointermove',update,{passive:true});
  window.addEventListener('scroll',()=>{if(last)update(last);},{passive:true});
  window.addEventListener('resize',reset,{passive:true});
  fine.addEventListener('change',reset);
  document.fonts?.ready.then(fitHeading);
  button.addEventListener('click',()=>setOpen(true));
  scene.addEventListener('click',e=>{if(fine.matches&&!open&&e.target!==button&&!button.contains(e.target)&&!button.classList.contains('is-hidden'))setOpen(true);});
  close.addEventListener('click',()=>setOpen(false));
  stage.addEventListener('keydown',e=>{if(e.key==='Escape'&&open)setOpen(false);});
  const images=[...stage.querySelectorAll('img')];
  Promise.all(images.map(img=>img.complete?(img.naturalWidth?Promise.resolve():Promise.reject()):new Promise((resolve,reject)=>{img.addEventListener('load',resolve,{once:true});img.addEventListener('error',reject,{once:true});}))).then(()=>{stage.hidden=false;ready=true;reset();window.ScrollTrigger?.refresh();}).catch(()=>{ /* Preserve the existing production page until both assets are present. */ });
})();
