/* 404: неподвижный кадр кольца */
(() => {
  'use strict';
  const D = window.RW, S = window.Site;
  const root = document.querySelector('[data-nf]');
  const place = [
    { look: 2, left: 8, scale: .72, blur: 5 },
    { look: 3, left: 26, scale: .86, blur: 2 },
    { look: 4, left: 74, scale: .86, blur: 2 },
    { look: 5, left: 92, scale: .72, blur: 5 }
  ];
  root.innerHTML = place.map(p => {
    const l = D.looks[p.look];
    return `<div class="nf__fig" data-foot="${l.src}" style="left:${p.left}%;transform:translateX(-50%) scale(${p.scale});filter:blur(${p.blur}px)">
      <span class="rw__shadow"></span>
      <div class="rw__figure"><div class="rw__art"><img src="${l.src}" alt="" width="1100" height="1956" decoding="async"></div></div>
    </div>`;
  }).join('');
  root.querySelectorAll('[data-foot]').forEach(el => {
    S.feet(el.dataset.foot).then(v => el.style.setProperty('--rw-foot', v.toFixed(4)));
  });
})();
