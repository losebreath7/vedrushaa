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
  const world = document.createElement('div');
  world.className = 'story-world';
  pin.append(world);
  world.append(panel, classroom);
  const cast = classroom.querySelector('.class-cast');
  const transcript = classroom.querySelector('.story-transcript');
  const caption = classroom.querySelector('.caption');
  const lines = Array.from(transcript.querySelectorAll('p'), p => p.textContent);
  const style = document.createElement('style');
  style.textContent = `
    #kate .story-world {position:absolute;inset:0 auto 0 0;width:200%;height:100%;background:#f4f1e9;will-change:transform}
    #kate .story-world .bio-panel,#kate .story-world .classroom {position:absolute;top:0;bottom:0;width:50%;height:100%;overflow:visible;background:transparent}
    #kate .story-world .bio-panel {left:0;right:auto;z-index:1}
    #kate .story-world .classroom {left:50%;right:auto;z-index:2}
    #kate .story-world .class-art {opacity:1;transform:none}
    #kate .story-world .caption {z-index:2}
    @media(prefers-reduced-motion:reduce){
      #kate .story-world {position:relative;inset:auto;width:100%;height:auto;transform:none!important;will-change:auto}
      #kate .story-world .bio-panel,#kate .story-world .classroom {position:relative;inset:auto;width:100%;height:100svh;min-height:540px;overflow:hidden}
    }
  `;
  document.head.append(style);
  const clamp = n => Math.max(0,Math.min(1,n));
  // One camera transform, no masks, individual translations or opacity transitions.
  // Reserve the final portion of the scroll for reading the three lines.
  let queued = false;
  function render(){
    const bounds = section.getBoundingClientRect();
    const p = clamp(-bounds.top / Math.max(1,bounds.height-pin.clientHeight));
    const travel = clamp((p-.06)/.64);
    const distance = world.offsetWidth-pin.clientWidth;
    world.style.transform = reduced.matches ? 'none' : 'translate3d('+(-travel*distance)+'px,0,0)';
    panel.inert = !reduced.matches && travel >= .999;
    if(panel.inert) speech(false);
    classroom.setAttribute('aria-hidden',String(!reduced.matches && travel === 0));
    caption.textContent = reduced.matches || travel < .35 ? '' : lines[p < .79 ? 0 : p < .9 ? 1 : 2];
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
