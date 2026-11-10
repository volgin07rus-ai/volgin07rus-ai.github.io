/* Главная: блоки ниже подиума */
(() => {
  'use strict';
  const D = window.RW, S = window.Site;

  const grid = document.querySelector('[data-home-grid]');
  if (grid) {
    const fresh = D.products.filter(p => p.isNew);
    const rest = D.products.filter(p => !p.isNew && p.cat !== 'tee');
    const picks = [...fresh, ...rest].slice(0, 8);
    grid.setAttribute('data-stagger', '');
    grid.innerHTML = picks.map((p, i) => S.tile(p, i, { sizes: '(min-width: 1100px) 44vw, (min-width: 750px) 60vw, 90vw' })).join('');
  }

  const cats = document.querySelector('[data-home-cats]');
  if (cats) {
    cats.innerHTML = D.cats.map((c, i) => {
      const list = D.products.filter(p => p.cat === c.id);
      const cover = list[0];
      const n = list.length;
      return `
        <li data-reveal style="--d:${i * 50}ms">
          <a class="cat-row" href="catalog.html?cat=${c.id}">
            <span class="cat-row__num">0${i + 1}</span>
            <span class="cat-row__name">${c.name}</span>
            <span class="page-label">${D.pieces(n)}</span>
            <svg class="cat-row__arrow" width="26" height="14" viewBox="0 0 26 14" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M1 7h24M19 1l6 6-6 6"/></svg>
            <span class="cat-row__thumb" aria-hidden="true">${S.pic(cover, { sizes: '220px' })}</span>
          </a>
        </li>`;
    }).join('');
  }

  S.reveal();
})();
