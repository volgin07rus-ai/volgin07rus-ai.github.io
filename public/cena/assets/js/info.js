/* Подсветка раздела в боковом меню */
(() => {
  const links = [...document.querySelectorAll('[data-inf-nav] a')];
  const secs = links.map((a) => document.querySelector(a.getAttribute('href')));
  const set = (id) => links.forEach((a) => (a.getAttribute('href') === '#' + id ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) set(e.target.id); });
  }, { rootMargin: '-30% 0px -60% 0px' });
  secs.forEach((s) => io.observe(s));
  set(location.hash ? location.hash.slice(1) : secs[0].id);
})();
