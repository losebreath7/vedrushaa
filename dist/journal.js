const host=document.querySelector('.journal-book');
const mount=document.querySelector('#journal-mount');
const cover=document.querySelector('#journal-cover');
const prev=document.querySelector('#journal-prev');
const next=document.querySelector('#journal-next');
const count=document.querySelector('#journal-count');
const titles=['ENGLISH. BUT MAKE IT REAL.','STOP STUDYING. START SPEAKING.','TALK LIKE A HUMAN.','NO BORING SHIT.'];
const pages=titles.map((alt,i)=>({src:new URL('journal-0'+(i+1)+'.png',import.meta.url).href,alt}));
let book=null,index=0,started=false;
function update(visible=[index]){
  const first=visible[0]??index,last=visible.at(-1)??first;
  index=first;
  count.textContent=(first===last?String(first+1):(first+1)+'–'+(last+1))+' / '+pages.length;
  prev.disabled=first===0;
  next.disabled=last===pages.length-1;
}
function turn(delta){
  if(book){delta>0?book.next():book.prev();return;}
  index=Math.max(0,Math.min(pages.length-1,index+delta));
  cover.src=pages[index].src;cover.alt=pages[index].alt;update();
}
prev.addEventListener('click',()=>turn(-1));
next.addEventListener('click',()=>turn(1));
async function start(){
  if(started)return;started=true;
  try{
    const {LeafThrough}=await import('https://cdn.jsdelivr.net/npm/leafthrough@0.1.8/+esm');
    book=new LeafThrough(mount,{pages,startPage:index,label:'Vedrushaa / The English Issue',layout:'auto',pageAspect:1.377,loop:false,paper:{showThrough:0.015},interaction:{keyboard:true},onReady:()=>host.classList.add('is-ready'),onPageChange:detail=>update(detail.visiblePages)});
    update(book.visiblePages);
  }catch(error){book=null;host.classList.add('has-error');console.warn('Journal: flat-page fallback',error);}
}
if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();start();}},{rootMargin:'300px'});
  observer.observe(host);
}else start();
