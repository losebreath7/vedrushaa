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
  const actors = [
    {el:cast.querySelector('.pupil'),start:.22,end:.38,edge:'bottom'},
    {el:cast.querySelector('.teacher'),start:.35,end:.52,edge:'right'},
    {el:cast.querySelector('.back'),start:.49,end:.64,edge:'bottom'},
    {el:cast.querySelector('.left'),start:.53,end:.68,edge:'left'},
    {el:cast.querySelector('.front'),start:.57,end:.73,edge:'right'}
  ];
  let queued=false;
  function render(){
    const bounds=section.getBoundingClientRect();
    const p=clamp(-bounds.top/Math.max(1,bounds.height-pin.clientHeight));
    const motion=!reduced.matches;
    const exit=motion?ease((p-.025)/.195):0;
    panel.style.transform='translate3d('+(-exit*pin.clientWidth)+'px,0,0)';
    panel.inert=motion&&exit>=.999;
    if(panel.inert)speech(false);
    classroom.style.visibility=motion&&p<.22?'hidden':'visible';
    classroom.setAttribute('aria-hidden',String(motion&&p<.22));
    const w=pin.clientWidth,h=pin.clientHeight;
    for(const {el,start,end,edge} of actors){
      const t=motion?1-ease((p-start)/(end-start)):0;
      const x=edge==='left'?-w*t:edge==='right'?w*t:0;
      const y=edge==='bottom'?h*t:0;
      el.style.transform='translate3d('+x+'px,'+y+'px,0)';
    }
    caption.textContent=!motion||p<.74?'':lines[p<.83?0:p<.92?1:2];
  }
  function schedule(){
    if(queued)return;
    queued=true;
    requestAnimationFrame(()=>{queued=false;render();});
  }
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',schedule);
  reduced.addEventListener('change',schedule);
  render();
})();
