const app=document.querySelector('#feedback-paper-scene');
let started=false;
async function start(){if(started)return;started=true;try{await import('./paper-crumple/src/main-vat.js');}catch(e){app.classList.add('has-error');document.querySelector('#feedback-paper-info').textContent='Не удалось загрузить интерактивную сцену';console.error(e);}}
if('IntersectionObserver' in window){const o=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){o.disconnect();start();}},{rootMargin:'250px'});o.observe(app);}else start();
