import { prepareDimension } from './dimension.js';
let entering=false;
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
if(location.hash==='#podcast')location.replace('podcast.html');
if(location.hash==='#episodios')location.replace('episodios.html');
if(location.hash==='#nosotros')location.replace('el-podcast.html');
function approachTelevision(){return new Promise(resolve=>{const timer=setTimeout(resolve,1500);window.dispatchEvent(new CustomEvent('enter-tv',{detail:{complete:handoff=>{clearTimeout(timer);resolve(handoff);}}}));});}
document.querySelector('[data-enter-tv]').addEventListener('click',async event=>{
 event.preventDefault();if(entering)return;entering=true;const destination=event.currentTarget.href;
 try{if(!reducedMotion.matches){const travel=prepareDimension();document.body.classList.add('entering-tv');const handoff=await approachTelevision();await travel(handoff);sessionStorage.setItem('frecuencia-arrival','1');}}
 catch(error){console.warn('Se continúa a la página del podcast.',error);}
 finally{location.assign(destination);}
});
window.addEventListener('pageshow',event=>{if(!event.persisted)return;entering=false;document.querySelector('.dimension-portal')?.remove();document.body.classList.remove('entering-tv');window.dispatchEvent(new Event('scene-visibility'));});
