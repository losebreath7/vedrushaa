/* Adapted for Vedrushaa from Galaxy by David Haz, React Bits.
MIT + Commons Clause License Condition v1.0

Copyright (c) 2026 David Haz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, and distribute the Software **as part of an application, website, or product**, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

## Commons Clause Restriction

You may use this Software, including for any commercial purpose, **so long as you do not sell, sublicense, or redistribute the components themselves-whether alone, in a bundle, or as a ported version.**

The same restriction covers the React Bits tools (Background Studio, Texture Lab, Shape Magic, Center Stage, Sound Lab and any tools added later) and the sounds in the sound library. **You may not sell, sublicense, or redistribute the tools or the sounds themselves, or offer the tools or a substantially similar copy of them as a hosted service-whether alone, in a bundle, or as a ported version.**

What you make with the tools is yours to use. You can use exported code, images, videos, and audio files in any personal or commercial application, website, or product, including paid ones. **You may not sell or redistribute the exports on their own, either individually or as the product itself, such as a sound, texture, background, or template pack.**

## No Warranty

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

(() => {
  'use strict';
  const canvas = document.getElementById('stars');
  if (!canvas || !canvas.parentElement) return;
  const section = canvas.parentElement;
  const ctx = canvas.getContext('2d', {alpha:true});
  if (!ctx) return;
  canvas.dataset.renderer = 'canvas2d';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
  const sprites = [0,1,2].map(kind => {
    const s = document.createElement('canvas');
    s.width = s.height = 64;
    const c = s.getContext('2d');
    const g = c.createRadialGradient(32,32,0,32,32,30);
    g.addColorStop(0,'rgba(255,255,255,1)');
    g.addColorStop(.07,'rgba(250,248,255,.95)');
    g.addColorStop(.19,'rgba(225,225,255,.28)');
    g.addColorStop(.45,'rgba(200,205,245,.07)');
    g.addColorStop(1,'rgba(200,205,245,0)');
    c.fillStyle=g; c.fillRect(0,0,64,64);
    if(kind===2){
      for(const angle of [0,Math.PI/2]){
        c.save(); c.translate(32,32); c.rotate(angle);
        const ray=c.createLinearGradient(-25,0,25,0);
        ray.addColorStop(0,'rgba(255,255,255,0)');
        ray.addColorStop(.5,'rgba(255,255,255,.65)');
        ray.addColorStop(1,'rgba(255,255,255,0)');
        c.fillStyle=ray; c.fillRect(-25,-.75,50,1.5); c.restore();
      }
    }
    return s;
  });
  const stars = Array.from({length:480},()=>({
    u:Math.random(), v:Math.random(), depth:Math.random(),
    phase:Math.random()*Math.PI*2, light:.2+Math.random()*.65,
    kind:Math.random()<.07?2:Math.random()<.3?1:0,
    ox:0,oy:0
  }));
  let w=0,h=0,count=0,raf=0,last=0,clock=0,visible=true;
  let px=0,py=0,active=false,rect=null,boost=0;
  const wrap=(v,m)=>((v%m)+m)%m;
  function draw(dt){
    if(!w||!h)return;
    const motion=!reduced.matches;
    if(motion)clock+=dt;
    boost*=Math.exp(-dt*2.4);
    ctx.clearRect(0,0,w,h);
    const radius=clamp(Math.min(w,h)*.24,100,220);
    const follow=1-Math.exp(-dt*9);
    for(let i=0;i<count;i++){
      const s=stars[i];
      const drift=(.2+s.depth)*5;
      const x=wrap(s.u*w+clock*drift+Math.sin(clock*.18+s.phase)*8,w);
      const y=wrap(s.v*h+Math.cos(clock*.15+s.phase)*9+clock*drift*.32,h);
      let tx=0,ty=0;
      if(active&&motion){
        const dx=x-px,dy=y-py,dist=Math.hypot(dx,dy);
        if(dist<radius){
          const push=(38+38*s.depth)*Math.pow(1-dist/radius,1.5)*(1+boost*.4);
          const angle=dist>.001?Math.atan2(dy,dx):s.phase;
          tx=Math.cos(angle)*push;ty=Math.sin(angle)*push;
        }
      }
      if(motion){s.ox+=(tx-s.ox)*follow;s.oy+=(ty-s.oy)*follow;}
      else{s.ox=0;s.oy=0;}
      const size=(s.kind===2?17:s.kind===1?10:6)*(.7+s.depth*.65);
      ctx.globalAlpha=clamp(s.light*(motion?1+.17*Math.sin(clock*.65+s.phase):1),0,1);
      ctx.drawImage(sprites[s.kind],x+s.ox-size/2,y+s.oy-size/2,size,size);
    }
    ctx.globalAlpha=1;
  }
  function stop(){if(raf)cancelAnimationFrame(raf);raf=0;last=0;}
  function wake(){
    if(!raf&&visible&&!document.hidden&&!reduced.matches&&w&&h)raf=requestAnimationFrame(frame);
  }
  function frame(now){
    raf=0;
    if(!visible||document.hidden||reduced.matches)return;
    if(!last||now-last>=32){
      const dt=last?Math.min((now-last)/1000,.1):1/30;
      last=now;draw(dt);
    }
    wake();
  }
  function resize(){
    rect=canvas.getBoundingClientRect();
    w=canvas.clientWidth;h=canvas.clientHeight;
    if(!w||!h){stop();return;}
    const ratio=Math.min(window.devicePixelRatio||1,1.5,Math.sqrt(1400000/(w*h)));
    canvas.width=Math.max(1,Math.round(w*ratio));
    canvas.height=Math.max(1,Math.round(h*ratio));
    ctx.setTransform(canvas.width/w,0,0,canvas.height/h,0,0);
    count=clamp(Math.round(w*h/3600),100,w<700?220:480);
    draw(0);wake();
  }
  function locate(e){
    if(reduced.matches)return;
    // Refresh geometry once on each input; no layout reads inside the animation loop.
    rect=canvas.getBoundingClientRect();
    px=e.clientX-rect.left;py=e.clientY-rect.top;
    active=px>=0&&py>=0&&px<=w&&py<=h;
    wake();
  }
  function release(){active=false;wake();}
  section.addEventListener('pointermove',locate,{passive:true});
  section.addEventListener('pointerdown',e=>{locate(e);if(active)boost=1;},{passive:true});
  section.addEventListener('pointerup',e=>{if(e.pointerType!=='mouse')release();},{passive:true});
  section.addEventListener('pointercancel',release,{passive:true});
  section.addEventListener('pointerleave',release,{passive:true});
  document.addEventListener('visibilitychange',()=>{stop();active=false;wake();});
  const motionChange=()=>{stop();active=false;draw(0);wake();};
  if(reduced.addEventListener)reduced.addEventListener('change',motionChange);
  else if(reduced.addListener)reduced.addListener(motionChange);
  if(typeof IntersectionObserver!=='undefined'){
    visible=false;
    new IntersectionObserver(([entry])=>{
      visible=entry.isIntersecting;
      if(!visible){active=false;stop();}
      else{draw(0);wake();}
    }).observe(section);
  }
  if(typeof ResizeObserver!=='undefined')new ResizeObserver(resize).observe(section);
  else window.addEventListener('resize',resize,{passive:true});
  resize();
})();
