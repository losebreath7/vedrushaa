(() => {
  const section = document.getElementById('kate');
  const panel = section.querySelector('.bio-panel');
  const classroom = section.querySelector('.classroom');
  const trigger = document.getElementById('speech-trigger');
  const bubble = document.getElementById('speech');
  function speech(show) {
    bubble.hidden = !show;
    trigger.setAttribute('aria-expanded', String(show));
  }
  trigger.onpointerenter = e => { if (e.pointerType === 'mouse') speech(true); };
  trigger.onpointerleave = e => { if (e.pointerType === 'mouse') speech(false); };
  trigger.onfocus = () => { if (trigger.matches(':focus-visible')) speech(true); };
  trigger.onblur = () => speech(false);
  trigger.onclick = e => speech(e.pointerType === 'mouse' || bubble.hidden);
  document.addEventListener('pointerdown', e => { if (!trigger.contains(e.target)) speech(false); });

  const pin = section.querySelector('.story-pin');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const cast = classroom.querySelector('.class-cast');
  const transcript = classroom.querySelector('.story-transcript');
  const caption = classroom.querySelector('.caption');
  const lines = Array.from(transcript.querySelectorAll('p'), p => p.textContent);
  const style = document.createElement('style');
  style.textContent = `
    #kate .story-pin {background:#f4f1e9}
    #kate .bio-panel {z-index:2;background:transparent;will-change:transform}
    #kate .classroom {z-index:1;background:transparent;overflow:hidden}
    #kate .class-art {opacity:1;will-change:transform}
    #kate .caption {z-index:2}
    @media(prefers-reduced-motion:reduce){
      #kate .bio-panel,#kate .class-art {transform:none!important;will-change:auto}
      #kate .classroom {visibility:visible!important}
    }
  `;
  document.head.append(style);
  const clamp = n => Math.max(0,Math.min(1,n));
  const ease = n => {n=clamp(n);return n*n*(3-2*n);};
  // Scroll selects the scene; elapsed time drives the complete entrance.
  const duration=1500, exitEnd=420;
  const actors = [
    {el:cast.querySelector('.pupil'),start:420,end:920,edge:'bottom'},
    {el:cast.querySelector('.teacher'),start:650,end:1150,edge:'right'},
    {el:cast.querySelector('.back'),start:850,end:1300,edge:'bottom'},
    {el:cast.querySelector('.left'),start:950,end:1400,edge:'left'},
    {el:cast.querySelector('.front'),start:1050,end:1500,edge:'right'}
  ];
  let frame=0, time=0, target=0, previous=null, initialized=false, active=false;
  function render(now){
    frame=0;
    const bounds=section.getBoundingClientRect();
    const distance=Math.max(1,bounds.height-pin.clientHeight);
    const scroll=-bounds.top;
    const p=clamp(scroll/distance);
    const motion=!reduced.matches;
    // Hysteresis avoids repeated triggers from tiny scroll reversals.
    if(!active && scroll>=Math.min(48,distance*.025)) active=true;
    else if(active && scroll<=8) active=false;
    target=active?duration:0;
    if(!initialized){
      time=scroll>pin.clientHeight?target:0;
      initialized=true;
    }
    const dt=previous===null?0:Math.max(0,now-previous);
    previous=now;
    if(!motion)time=target;
    else if(time<target)time=Math.min(target,time+dt);
    else if(time>target)time=Math.max(target,time-dt);
    const exit=motion?ease(time/exitEnd):0;
    panel.style.transform='translate3d('+(-exit*pin.clientWidth)+'px,0,0)';
    panel.style.visibility=motion&&time>=exitEnd?'hidden':'visible';
    panel.inert=motion&&time>=exitEnd;
    if(panel.inert)speech(false);
    const showClass=!motion||time>=exitEnd;
    classroom.style.visibility=showClass?'visible':'hidden';
    classroom.setAttribute('aria-hidden',String(!showClass));
    const w=pin.clientWidth,h=pin.clientHeight;
    for(const {el,start,end,edge} of actors){
      const t=motion?1-ease((time-start)/(end-start)):0;
      const x=edge==='left'?-w*t:edge==='right'?w*t:0;
      const y=edge==='bottom'?h*t:0;
      el.style.transform='translate3d('+x+'px,'+y+'px,0)';
    }
    caption.textContent=!motion||time<duration?'':lines[p<.83?0:p<.92?1:2];
    if(motion&&time!==target)frame=requestAnimationFrame(render);
    else previous=null;
  }
  function schedule(){
    if(!frame)frame=requestAnimationFrame(render);
  }
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',schedule);
  reduced.addEventListener('change',schedule);
  render(performance.now());
})();
