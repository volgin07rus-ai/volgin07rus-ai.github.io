(() => {
  const { $ } = CD;
  const root = $('[data-cmp]');
  const ARROW = CD.icon.arrow, X = CD.icon.x;
  let diffOnly = false;

  /* Ссылка со списком моделей открывает то же сравнение у другого человека */
  const fromUrl = (new URLSearchParams(location.search).get('ids') || '').split(',').filter((id) => CD.byId(id));
  if (fromUrl.length) {
    const cat = CD.byId(fromUrl[0]).cat;
    CD.compare.save(fromUrl.filter((id) => CD.byId(id).cat === cat).slice(0, 4));
    history.replaceState(null, '', location.pathname);
  }

  function render() {
    const ids = CD.compare.list();
    if (!ids.length) {
      const pairs = [['sds2204x-plus', 'dho1202'], ['ut61e-plus', 'ut181a'], ['b10', 'm30']];
      root.innerHTML = `<div class="zero zero--big"><p class="zero__ol" aria-hidden="true">0,000</p><div>
        <h2 class="h3">В сравнении пусто</h2>
        <p>Отметьте «Сравнить» у двух или больше приборов одного типа. Или начните с частых пар</p>
        <ul class="zero__t">${pairs.map((pp) => `<li><a href="compare.html?ids=${pp.join(',')}">${pp.map((i) => CD.byId(i).name).join(' и ')}<span>${CD.catOf(CD.byId(pp[0]).cat).name}</span></a></li>`).join('')}</ul>
      </div></div>`;
      return;
    }
    const ps = ids.map(CD.byId);
    const c = CD.catOf(ps[0].cat);
    const rows = [
      { l: 'Цена', get: (p) => p.price, show: (p) => CD.price(p.price), b: -1 },
      { l: 'Наличие', get: (p) => p.stock, show: (p) => CD.stock(p) },
      ...c.schema.filter((s) => !s.hide).map((s) => ({ l: s.l + (s.u && !s.fmt && ps.some((p) => typeof p.specs[s.k] === 'number') ? `, ${s.u}` : ''), get: (p) => p.specs[s.k], show: (p) => (typeof p.specs[s.k] === 'number' && !s.fmt ? CD.num(p.specs[s.k]) : CD.val(p, s)), b: s.b })),
      { l: 'Масса, кг', get: (p) => p.mass, show: (p) => CD.num(p.mass) },
      { l: 'Госреестр СИ', get: (p) => p.reg, show: (p) => (p.reg ? 'Внесён' : 'Нет') },
    ];
    const body = rows.map((r) => {
      const vals = ps.map(r.get);
      const same = vals.every((v) => String(v) === String(vals[0]));
      if (diffOnly && same && ps.length > 1) return '';
      let best = null;
      const nums = vals.filter((v) => typeof v === 'number');
      if (r.b && nums.length > 1 && !same) best = r.b > 0 ? Math.max(...nums) : Math.min(...nums);
      return `<tr${same && ps.length > 1 ? ' class="is-same"' : ''}><th scope="row">${r.l}</th>${ps.map((p, i) => `<td class="${vals[i] === best ? 'is-best' : ''}">${r.show(p)}</td>`).join('')}${'<td class="cmp__gap"></td>'.repeat(4 - ps.length)}</tr>`;
    }).join('');

    root.innerHTML = `
      <div class="cmp__bar">
        <p>${c.name}, ${ps.length} из 4. Жёлтым отмечено лучшее значение в строке</p>
        <label class="chk"><input type="checkbox" data-diff${diffOnly ? ' checked' : ''}><i></i><span>Только различия</span></label>
        <button type="button" class="line" data-share><span>Скопировать ссылку</span></button>
        <button type="button" class="line" data-clear><span>Очистить</span></button>
      </div>
      <div class="tw"><table class="cmp__t">
        <thead><tr><th scope="col"><span class="sr">Параметр</span></th>${ps.map((p) => `<th scope="col"><div class="cmp__h">
          <button type="button" class="cmp__x" data-x="${p.id}" aria-label="Убрать ${p.name}">${X}</button>
          <a class="cmp__fig" href="product.html?id=${p.id}">${CD.figure(p)}</a>
          <a class="cmp__n" href="product.html?id=${p.id}">${p.name}</a><span>${p.brand}</span>
          <button class="btn btn--sm" type="button" data-add="${p.id}"><span>В корзину</span></button></div></th>`).join('')}
          ${ps.length < 4 ? `<th scope="col" class="cmp__gap"><a class="cmp__more" href="catalog.html?cat=${c.id}">${CD.icon.plus}<span>Добавить ${c.one.toLowerCase()}</span></a></th>` + '<th class="cmp__gap"></th>'.repeat(3 - ps.length) : ''}
        </tr></thead>
        <tbody>${body}</tbody>
      </table></div>`;
  }

  root.addEventListener('click', (e) => {
    const x = e.target.closest('[data-x]');
    if (x) CD.compare.remove(x.dataset.x);
    if (e.target.closest('[data-clear]')) CD.compare.clear();
    const sh = e.target.closest('[data-share]');
    if (sh) {
      const url = `${location.origin}${location.pathname}?ids=${CD.compare.list().join(',')}`;
      $('span', sh).textContent = 'Ссылка скопирована';
      navigator.clipboard && navigator.clipboard.writeText(url).catch(() => {});
      setTimeout(() => { $('span', sh).textContent = 'Скопировать ссылку'; }, 2200);
    }
  });
  root.addEventListener('change', (e) => { if (e.target.matches('[data-diff]')) { diffOnly = e.target.checked; render(); } });
  document.addEventListener('cd:compare', render);
  render();
})();
