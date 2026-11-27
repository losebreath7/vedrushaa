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

  const steps = [
    ['pupil', .108, .30], ['teacher', .43, .53], ['back', .67, .75],
    ['left', .72, .80], ['front', .77, .84]
  ].map(([name, start, end]) => ({img: classroom.querySelector('.'+name), start, end}));
  const lines = Array.from(classroom.querySelectorAll('.story-transcript p'), p => p.textContent);
  const caption = classroom.querySelector('.caption');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let lineIndex = -1;
  let timer;
  function typeLine(index) {
    if (index === lineIndex) return;
    lineIndex = index;
    clearInterval(timer);
    caption.textContent = '';
    if (index < 0) return;
    const line = lines[index];
    let count = 0;
    timer = setInterval(() => {
      count += 2;
      caption.textContent = line.slice(0,count);
      if (count >= line.length) clearInterval(timer);
    }, 28);
  }
  const clamp = v => Math.max(0, Math.min(1,v));
  function render() {
    const bounds = section.getBoundingClientRect();
    const p = clamp(-bounds.top / Math.max(1,bounds.height-section.querySelector('.story-pin').clientHeight));
    const slide = reduced.matches ? 0 : clamp((p-.105)/.19);
    panel.style.transform = 'translateX('+(-100*slide)+'%)';
    panel.inert = slide >= 1;
    if(panel.inert) speech(false);
    classroom.setAttribute('aria-hidden',String(!reduced.matches && p < .108));
    steps.forEach(({img,start,end}) => {
      const fraction = reduced.matches ? 1 : clamp((p-start)/(end-start));
      img.style.opacity = fraction;
      img.style.transform = 'translateX('+((1-fraction)*85)+'%)';
    });
    typeLine(reduced.matches || p < .30 ? -1 : p < .53 ? 0 : p < .84 ? 1 : 2);
  }
  let queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {queued=false;render();});
  }
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',schedule);
  reduced.addEventListener('change',schedule);
  render();
})();
