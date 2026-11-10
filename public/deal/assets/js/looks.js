/* Страница образов */
(() => {
  'use strict';
  const D = window.RW, S = window.Site;
  const esc = S.esc;
  const root = document.querySelector('[data-looks]');
  const n = D.looks.length;

  const figure = (l, cls, extra = '') => `
    <div class="${cls}" data-foot="${l.src}">
      <span class="rw__shadow"></span>
      <div class="rw__figure"><div class="rw__art">
        <img src="${l.src}" srcset="${l.src} 640w, ${l.orig} 1080w" sizes="(min-width: 750px) 400px, 300px" width="1100" height="1956" alt="${esc(l.name)}" loading="lazy" decoding="async" draggable="false">
        ${extra}
      </div></div>
    </div>`;

  root.innerHTML = D.looks.map((l, i) => {
    const pins = `<div class="rw__pins">${l.items.map((id, k) => {
      const p = D.byId[id];
      return `<a class="rw__pin" href="${S.productUrl(p)}" data-tip="${esc(p.name)}" style="left:${l.pins[k][0]}%;top:${l.pins[k][1]}%;--pi:${k + 1}" aria-label="${k + 1}: ${esc(p.name)}"><span class="rw__pin-dot">${k + 1}</span></a>`;
    }).join('')}</div>`;

    const rows = l.items.map(id => {
      const p = D.byId[id];
      const url = S.productUrl(p);
      return `
        <li>
          <a class="look-list__pic" href="${url}" tabindex="-1" aria-hidden="true"><img src="${p.img}" width="${p.w}" height="${p.h}" alt="" loading="lazy" decoding="async"></a>
          <div><span class="look-list__type">${esc(p.vendor)}</span><a class="look-list__name" href="${url}">${esc(p.name)}</a></div>
          <span class="look-list__price">${D.money(p.price)}</span>
        </li>`;
    }).join('');

    return `
      <article class="look-row" id="look-${i + 1}">
        <div class="look-row__stage" data-reveal>
          <span class="look-row__num">Образ 0${i + 1}</span>
          ${figure(D.looks[(i + n - 1) % n], 'look-row__ghost look-row__ghost--l')}
          ${figure(D.looks[(i + 1) % n], 'look-row__ghost look-row__ghost--r')}
          ${figure(l, 'look-row__fig', pins)}
        </div>
        <div class="look-row__body" data-reveal style="--d:120ms">
          <h2 class="page-h2">${esc(l.name)}</h2>
          <p class="page-sub">${esc(l.desc)}</p>
          <ul class="look-list" role="list">${rows}</ul>
          <div class="look-row__foot">
            <div class="look-row__sum">
              <div><b>Собери образ</b><small>Все 3 вещи со скидкой 10%</small></div>
              <div class="look-row__prices"><s>${D.money(D.lookTotal(l))}</s><strong>${D.money(D.lookBundle(l))}</strong></div>
            </div>
            <a class="btn-dark" href="index.html#look-${i + 1}">Выбрать размеры на подиуме<svg class="btn-arrow" width="22" height="12" viewBox="0 0 26 14" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M1 7h24M19 1l6 6-6 6"/></svg></a>
          </div>
        </div>
      </article>`;
  }).join('');

  root.querySelectorAll('[data-foot]').forEach(el => {
    S.feet(el.dataset.foot).then(v => el.style.setProperty('--rw-foot', v.toFixed(4)));
  });
  S.reveal();
})();
