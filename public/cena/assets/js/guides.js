(() => {
  const { $ } = CD;
  const ARROW = CD.icon.arrow;

  /* Список */
  const list = $('[data-gcards]');
  if (list) {
    list.innerHTML = CD.guides.map((g, i) => {
      const c = g.cat ? CD.catOf(g.cat) : null;
      return `<li class="rv" data-reveal style="--d:${i * 70}ms"><a href="guide.html?id=${g.id}">
        <span class="gcards__sg">${CD.sigSvg(g.cat || 'psu', 220, 46, 2.5)}</span>
        <span class="gcards__m"><span>${String(i + 1).padStart(2, '0')}</span><span>${c ? c.name : 'Метрология'} · ${g.read} мин</span></span>
        <b>${g.title}</b>
        <span class="gcards__l">${g.lead}</span>
        <span class="line"><span>Читать</span>${ARROW}</span>
      </a></li>`;
    }).join('');
    return;
  }

  /* Статья */
  const root = $('[data-art]');
  const g = CD.guides.find((x) => x.id === new URLSearchParams(location.search).get('id')) || CD.guides[0];
  const i = CD.guides.indexOf(g);
  const next = CD.guides[(i + 1) % CD.guides.length];
  const c = g.cat ? CD.catOf(g.cat) : null;
  const related = (c ? CD.products.filter((p) => p.cat === c.id) : CD.products.filter((p) => p.reg)).sort((a, b) => b.pop - a.pop).slice(0, 3);
  document.title = `${g.title} · Шпаргалки · Цена деления`;

  root.innerHTML = `
    <div class="ph">
      <nav class="crumbs" aria-label="Путь"><a href="index.html">Главная</a><a href="guides.html">Шпаргалки</a><span>${g.title}</span></nav>
      <p class="art__m"><span>${String(i + 1).padStart(2, '0')}</span><span>${c ? c.name : 'Метрология'}</span><span>${g.read} мин чтения</span></p>
      <h1 class="h2 art__h" data-reveal>${g.title.split(' ').reduce((acc, w) => { const l = acc[acc.length - 1]; if (l && (l + ' ' + w).length <= 18) acc[acc.length - 1] = l + ' ' + w; else acc.push(w); return acc; }, []).map((l, k) => `<span class="ln" style="--d:${k * 90}ms"><span>${l}</span></span>`).join('')}</h1>
    </div>
    <div class="art__g">
      <article class="art__b">
        <p class="lead art__lead">${g.lead}</p>
        ${g.blocks.map(([h, ps]) => `<h2 class="h3">${h}</h2>${ps.map((p) => `<p>${p}</p>`).join('')}`).join('')}
        ${g.id === 'polosa' ? '<h2 class="h3">Проверьте сами</h2><p>Прибор с полосой 100 МГц и меандр. Двигайте частоту и смотрите, когда форма перестаёт быть честной</p><div class="mq" data-mq></div>' : ''}
      </article>
      <aside class="art__s" aria-label="Приборы по теме">
        <p class="lbl">Приборы по теме</p>
        <div class="ruled art__t">${related.map((p) => CD.tile(p)).join('')}</div>
      </aside>
    </div>
    <a class="art__next" href="guide.html?id=${next.id}"><span class="lbl">Следующая шпаргалка</span><b>${next.title}</b>${ARROW}</a>`;

  const mq = $('[data-mq]');
  mq && CD.meander(mq, 100);
  CD.syncCompare();
})();
