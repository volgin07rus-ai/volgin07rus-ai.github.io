/* Справка: подсветка текущего раздела и раскрывающиеся ответы */
(() => {
  'use strict';
  const links = [...document.querySelectorAll('.info__link')];
  const byId = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
  const setCurrent = id => links.forEach(a => a.classList.toggle('is-current', a === byId.get(id)));
  setCurrent(location.hash.slice(1) || links[0].getAttribute('href').slice(1));

  const io = new IntersectionObserver(items => {
    items.forEach(it => { if (it.isIntersecting) setCurrent(it.target.id); });
  }, { rootMargin: '-20% 0px -70% 0px' });
  document.querySelectorAll('.info-sec').forEach(s => io.observe(s));

  document.addEventListener('click', e => {
    const a = e.target.closest('[data-acc]');
    if (!a) return;
    const box = a.closest('.acc');
    a.setAttribute('aria-expanded', String(box.classList.toggle('is-open')));
  });

  window.Site.reveal();
})();
