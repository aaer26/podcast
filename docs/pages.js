try {
  if(sessionStorage.getItem('frecuencia-arrival')){sessionStorage.removeItem('frecuencia-arrival');document.body.classList.add('arrived');setTimeout(()=>document.body.classList.remove('arrived'),700);}
}catch{ /* Navigation also works when browser storage is disabled. */ }
const current=(location.pathname.split('/').pop()||'podcast').replace(/\.html$/, '');
for(const link of document.querySelectorAll('nav a'))if(link.getAttribute('href').replace(/\.html$/, '')===current)link.setAttribute('aria-current','page');
