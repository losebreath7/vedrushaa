(() => {
  const canvas = document.getElementById('stars');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const section = canvas.parentElement;
  const stars = Array.from({length:260}, () => ({
    x:Math.random()-.5, y:Math.random()-.5, depth:Math.random(), light:.45+Math.random()*.55
  }));
  let width, height, frame, last, visible = false;
  let targetX=0, targetY=0, offsetX=0, offsetY=0;
  function paint(time) {
    const dt = last ? Math.min((time-last)/1000,.05) : 0;
    last=time;
    ctx.clearRect(0,0,width,height);
    offsetX += (targetX-offsetX)*.07;
    offsetY += (targetY-offsetY)*.07;
    for(const star of stars){
      if(!reduced.matches) star.depth=(star.depth+dt*.024)%1;
      const scale=1/(1.45-star.depth);
      const x=width*(.5+star.x*scale)+offsetX*scale;
      const y=height*(.48+star.y*scale)+offsetY*scale;
      const radius=.35+star.depth**3*1.05;
      ctx.fillStyle='rgba(238,240,255,'+(star.light*Math.min(1,star.depth*12,(1-star.depth)*16))+')';
      ctx.beginPath();ctx.arc(x,y,radius,0,2*Math.PI);ctx.fill();
    }
    if(visible && !document.hidden && !reduced.matches) frame=requestAnimationFrame(paint);
  }
  function refresh() {
    cancelAnimationFrame(frame);last=0;
    if(visible && !document.hidden) paint(performance.now());
  }
  new ResizeObserver(() => {
    width=canvas.clientWidth;height=canvas.clientHeight;
    const ratio=Math.min(devicePixelRatio,2);
    canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
    ctx.setTransform(ratio,0,0,ratio,0,0);refresh();
  }).observe(canvas);
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(width)refresh();}).observe(section);
  section.addEventListener('pointermove',e=>{
    if(e.pointerType!=='mouse'||reduced.matches)return;
    const rect=canvas.getBoundingClientRect();
    targetX=((e.clientX-rect.left)/width-.5)*8;targetY=((e.clientY-rect.top)/height-.5)*8;
  });
  section.addEventListener('pointerleave',()=>{targetX=targetY=0;});
  reduced.addEventListener('change',refresh);
  document.addEventListener('visibilitychange',refresh);
})();
