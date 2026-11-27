// Native scrolling with optional, interruptible GSAP proximity snapping.
(() => {
  'use strict';
  const root = document.documentElement;
  const sections = Array.from(document.querySelectorAll('#home,#kate,#check,#journal,#feedback,#gallery,#money'));
  const desktop = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const style = document.createElement('style');
  style.textContent = [
    'html {scroll-behavior:auto;scroll-snap-type:y proximity}',
    '#home,#kate,#check,#journal,#feedback,#gallery,#money {scroll-snap-align:start;scroll-snap-stop:normal}',
    'html.cinematic-scroll {scroll-snap-type:none}',
    '@media(prefers-reduced-motion:reduce){html{scroll-snap-type:none}}'
  ].join('\n');
  document.head.appendChild(style);
  let trigger = null, loading = null, points = [], lastInput = -Infinity;
  const blocked = () => !!document.querySelector('dialog[open],#intro:not([hidden])');
  const load = src => new Promise((resolve,reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
  function libraries(){
    if(!loading) loading = (async () => {
      const base = 'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/';
      if(!window.gsap) await load(base+'gsap.min.js');
      if(!window.ScrollTrigger) await load(base+'ScrollTrigger.min.js');
      if(!window.gsap || !window.ScrollTrigger) throw Error('GSAP unavailable');
      window.gsap.registerPlugin(window.ScrollTrigger);
    })().catch(() => {loading=null; return false;});
    return loading;
  }
  function measure(self){
    const max = Math.max(1,self.end-self.start);
    points = sections.map(el => Math.max(0,Math.min(max,el.getBoundingClientRect().top+window.scrollY-self.start)));
  }
  function cancel(){
    lastInput=performance.now();
    const tween=trigger && trigger.getTween(true);
    if(tween) tween.kill();
  }
  function snapTo(progress,self){
    const span=Math.max(1,self.end-self.start);
    const current=Math.max(0,Math.min(span,self.scroll()-self.start));
    const stay=current/span;
    if(blocked() || reduced.matches || performance.now()-lastInput<120) return stay;
    const limit=Math.min(innerHeight*.42,380);
    let best=null, distance=Infinity;
    for(const point of points){
      const delta=point-current, d=Math.abs(delta);
      if(d>limit || (d>8 && delta*self.direction<0))continue;
      if(d<distance){best=point;distance=d;}
    }
    // No forced jumps through long story scenes, tall sections or the footer.
    return best===null||distance<2?stay:best/span;
  }
  async function setup(){
    if(trigger){trigger.kill();trigger=null;}
    root.classList.remove('cinematic-scroll');
    if(!desktop.matches)return;
    const ready=await libraries();
    if(ready===false || !desktop.matches || trigger)return;
    root.classList.add('cinematic-scroll');
    try {
      trigger=window.ScrollTrigger.create({
        id:'vedrushaa-screen-stops',
        start:0,end:'max',
        onRefresh:measure,
        snap:{
          snapTo, inertia:false, directional:false,
          delay:.14,duration:{min:.45,max:.65},ease:'power3.inOut'
        }
      });
      measure(trigger);
    } catch(error){
      root.classList.remove('cinematic-scroll');
      if(trigger)trigger.kill();
      trigger=null;
    }
  }
  // Never consume wheel/touch events: a reversal immediately restores native control.
  window.addEventListener('wheel',cancel,{passive:true,capture:true});
  window.addEventListener('touchstart',cancel,{passive:true,capture:true});
  window.addEventListener('pointerdown',cancel,{passive:true,capture:true});
  window.addEventListener('keydown',e=>{
    if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(e.key))cancel();
  },{capture:true});
  window.addEventListener('hashchange',cancel);
  window.addEventListener('visibilitychange',cancel);
  const change=()=>{cancel();setup();};
  if(desktop.addEventListener)desktop.addEventListener('change',change);
  else desktop.addListener(change);
  setup();
})();
