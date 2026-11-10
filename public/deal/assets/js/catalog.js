/* Каталог: разделы, фильтры, сортировка, состояние в адресе */
(() => {
  'use strict';
  const D = window.RW, S = window.Site;
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const PAGE = 24;

  /* Размеры собираются из самих товаров: ключ «группа:размер», чтобы EU 40 обуви не смешался с талией 40 */
  const TOP_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
  const groupOf = (p, s) => p.cat === 'shoes' ? 'shoe' : s === 'Единый' ? 'one' : /^W?\d+/.test(s) ? 'waist' : 'top';
  const sizeKey = (p, s) => `${groupOf(p, s)}:${s}`;
  const sizeLabel = key => {
    const [g, s] = key.split(/:(.*)/s);
    return g === 'shoe' && /^\d+$/.test(s) ? `EU ${s}` : s;
  };
  const sizeRank = key => {
    const [g, s] = key.split(/:(.*)/s);
    if (g === 'top') return TOP_ORDER.indexOf(s) < 0 ? 99 : TOP_ORDER.indexOf(s);
    const n = parseFloat(String(s).replace(/[^\d.]/g, ''));
    return (g === 'shoe' && /^\d+$/.test(s) ? 1000 : 0) + (isNaN(n) ? 999 : n);
  };
  const SIZE_GROUPS = (() => {
    const names = { top: 'Одежда', waist: 'По талии', shoe: 'Обувь', one: 'Аксессуары' };
    const sets = { top: new Set(), waist: new Set(), shoe: new Set(), one: new Set() };
    D.products.forEach(p => p.sizes.forEach(s => sets[groupOf(p, s)].add(sizeKey(p, s))));
    return Object.keys(names).filter(g => sets[g].size).map(g => ({ name: names[g], values: [...sets[g]].sort((a, b) => sizeRank(a) - sizeRank(b)) }));
  })();
  const BRANDS = (() => {
    const c = {};
    D.products.forEach(p => { c[p.vendor] = (c[p.vendor] || 0) + 1; });
    return Object.keys(c).sort((a, b) => c[b] - c[a]);
  })();
  const BANDS = [
    { id: 'low', name: `До ${D.money(10000)}`, test: v => v < 10000 },
    { id: 'mid', name: `От ${D.money(10000)} до ${D.money(20000)}`, test: v => v >= 10000 && v < 20000 },
    { id: 'high', name: `От ${D.money(20000)} до ${D.money(35000)}`, test: v => v >= 20000 && v < 35000 },
    { id: 'top', name: `От ${D.money(35000)}`, test: v => v >= 35000 }
  ];

  const params = new URLSearchParams(location.search);
  const list = key => (params.get(key) || '').split(',').filter(Boolean);
  const state = {
    cat: D.cats.some(c => c.id === params.get('cat')) ? params.get('cat') : 'all',
    sizes: new Set(list('size')),
    colors: new Set(list('color')),
    brands: new Set(list('brand')),
    price: BANDS.some(b => b.id === params.get('price')) ? params.get('price') : '',
    isNew: params.get('new') === '1',
    q: params.get('q') || '',
    sort: params.get('sort') || 'default',
    cols: 3,
    shown: PAGE
  };

  const plain = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
  const hay = p => `${p.name} ${plain(p.name)} ${p.vendor} ${plain(p.vendor)} ${p.vendor === 'Jordan' ? 'nike найк джордан' : ''} ${p.vendor === 'Nike' ? 'найк' : ''} ${D.cats.find(c => c.id === p.cat).name} ${D.cats.find(c => c.id === p.cat).one} ${D.colors[p.color].name}`.toLowerCase();

  function passes(p, skip) {
    if (skip !== 'cat' && state.cat !== 'all' && p.cat !== state.cat) return false;
    if (skip !== 'size' && state.sizes.size && !p.sizes.some(s => state.sizes.has(sizeKey(p, s)))) return false;
    if (skip !== 'brand' && state.brands.size && !state.brands.has(p.vendor)) return false;
    if (skip !== 'color' && state.colors.size && !state.colors.has(p.color)) return false;
    if (skip !== 'price' && state.price && !BANDS.find(b => b.id === state.price).test(p.price)) return false;
    if (skip !== 'new' && state.isNew && !p.isNew) return false;
    if (skip !== 'q' && state.q && !hay(p).includes(state.q.trim().toLowerCase())) return false;
    return true;
  }
  const count = (skip, fn) => D.products.filter(p => passes(p, skip) && fn(p)).length;

  function sorted(items) {
    const out = [...items];
    if (state.sort === 'asc') out.sort((a, b) => a.price - b.price);
    if (state.sort === 'desc') out.sort((a, b) => b.price - a.price);
    if (state.sort === 'name') out.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
    if (state.sort === 'new') out.sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew));
    return out;
  }

  const hasFilters = () => state.sizes.size || state.colors.size || state.brands.size || state.price || state.isNew || state.q.trim();

  /* Построение фильтров один раз, дальше обновляются только счётчики */
  function buildFilters() {
    $('[data-f-sizes]').innerHTML = SIZE_GROUPS.map(g => `
      <p class="f-group__sub">${g.name}</p>
      <div class="f-pills">
        ${g.values.map(v => `<label class="rw__pill" data-size-wrap="${S.esc(v)}"><input type="checkbox" data-size="${S.esc(v)}"${state.sizes.has(v) ? ' checked' : ''}><span class="rw__pill-label">${S.esc(sizeLabel(v))}</span></label>`).join('')}
      </div>`).join('');

    $('[data-f-brands]').innerHTML = BRANDS.map(b => `
      <label class="f-row" data-brand-wrap="${S.esc(b)}">
        <input type="checkbox" data-brand="${S.esc(b)}"${state.brands.has(b) ? ' checked' : ''}>
        <span class="f-row__mark f-row__mark--box"></span>
        <span>${S.esc(b)}</span>
        <span class="f-row__count"></span>
      </label>`).join('');

    $('[data-f-colors]').innerHTML = Object.entries(D.colors).map(([id, c]) => `
      <label class="f-row" data-color-wrap="${id}">
        <input type="checkbox" data-color="${id}"${state.colors.has(id) ? ' checked' : ''}>
        <span class="f-row__mark" style="background:${c.hex}"></span>
        <span>${c.name}</span>
        <span class="f-row__count" data-count-of="${id}"></span>
      </label>`).join('');

    $('[data-f-price]').innerHTML = BANDS.map(b => `
      <label class="f-row" data-band-wrap="${b.id}">
        <input type="radio" name="price" data-band="${b.id}"${state.price === b.id ? ' checked' : ''}>
        <span class="f-row__mark f-row__mark--box"></span>
        <span>${b.name}</span>
        <span class="f-row__count" data-count-of="${b.id}"></span>
      </label>`).join('');

    $('[data-f-new]').innerHTML = `
      <label class="f-row" data-new-wrap>
        <input type="checkbox" data-new${state.isNew ? ' checked' : ''}>
        <span class="f-row__mark f-row__mark--box"></span>
        <span>Только новинки</span>
        <span class="f-row__count" data-count-of="new"></span>
      </label>`;

    const q = $('[data-q]');
    q.value = state.q;
    $('[data-q-clear]').hidden = !state.q;
    $('[data-sort]').value = state.sort;
  }

  function paintFacets() {
    const tabs = [{ id: 'all', name: 'Всё' }, ...D.cats];
    const holder = $('[data-cat-ticks]');
    holder.innerHTML = tabs.map(t => {
      const n = count('cat', p => t.id === 'all' || p.cat === t.id);
      return `<button type="button" class="cat-tick" data-cat="${t.id}" aria-pressed="${state.cat === t.id}"${n === 0 && state.cat !== t.id ? ' disabled' : ''}>
        <span class="cat-tick__bar"></span>
        <span class="cat-tick__label">${t.name}<span class="cat-tick__count">${n}</span></span>
      </button>`;
    }).join('');

    $$('[data-brand-wrap]').forEach(w => {
      const b = w.dataset.brandWrap;
      const n = count('brand', p => p.vendor === b);
      const input = w.querySelector('input');
      w.querySelector('.f-row__count').textContent = n;
      w.classList.toggle('is-zero', n === 0 && !input.checked);
      input.disabled = n === 0 && !input.checked;
    });
    $$('[data-size-wrap]').forEach(w => {
      const v = w.dataset.sizeWrap;
      const n = count('size', p => p.sizes.some(s => sizeKey(p, s) === v));
      const input = w.querySelector('input');
      w.classList.toggle('is-zero', n === 0 && !input.checked);
      input.disabled = n === 0 && !input.checked;
    });
    $$('[data-color-wrap]').forEach(w => {
      const id = w.dataset.colorWrap;
      const n = count('color', p => p.color === id);
      const input = w.querySelector('input');
      w.querySelector('.f-row__count').textContent = n;
      w.classList.toggle('is-zero', n === 0 && !input.checked);
      input.disabled = n === 0 && !input.checked;
    });
    $$('[data-band-wrap]').forEach(w => {
      const b = BANDS.find(x => x.id === w.dataset.bandWrap);
      const n = count('price', p => b.test(p.price));
      const input = w.querySelector('input');
      w.querySelector('.f-row__count').textContent = n;
      w.classList.toggle('is-zero', n === 0 && !input.checked);
      input.disabled = n === 0 && !input.checked;
    });
    const nw = $('[data-new-wrap]');
    const n = count('new', p => p.isNew);
    nw.querySelector('.f-row__count').textContent = n;
  }

  function paintChips() {
    const chips = [];
    state.brands.forEach(v => chips.push({ label: v, kind: 'brand', value: v }));
    state.sizes.forEach(v => chips.push({ label: `Размер ${sizeLabel(v)}`, kind: 'size', value: v }));
    state.colors.forEach(v => chips.push({ label: D.colors[v].name, kind: 'color', value: v }));
    if (state.price) chips.push({ label: BANDS.find(b => b.id === state.price).name, kind: 'price', value: '' });
    if (state.isNew) chips.push({ label: 'Новинки', kind: 'new', value: '' });
    if (state.q.trim()) chips.push({ label: `«${state.q.trim()}»`, kind: 'q', value: '' });
    $('[data-chips]').innerHTML = chips.map(c => `<button type="button" class="chip" data-chip="${c.kind}" data-chip-value="${S.esc(c.value)}" aria-label="Убрать фильтр ${S.esc(c.label)}">${S.esc(c.label)}<span class="chip__x" aria-hidden="true">×</span></button>`).join('');
    const open = $('[data-open-filters]');
    const total = state.sizes.size + state.colors.size + state.brands.size + (state.price ? 1 : 0) + (state.isNew ? 1 : 0);
    open.textContent = total ? `Фильтры · ${total}` : 'Фильтры';
  }

  function promoHTML() {
    const i = 2, l = D.looks[i];
    return `
      <a class="tile-promo" href="index.html#look-${i + 1}" style="--i:4" data-cursor="На подиум">
        <span class="tile-promo__copy">
          <span>
            <span class="page-label">Образ 0${i + 1}</span>
            <span class="tile-promo__name">${l.name}</span>
          </span>
          <span class="line-link"><span>${D.pieces(3)} за ${D.money(D.lookBundle(l))}</span><svg width="22" height="12" viewBox="0 0 26 14" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M1 7h24M19 1l6 6-6 6"/></svg></span>
        </span>
        <span class="tile-promo__art"><img src="${l.src}" srcset="${l.src} 640w, ${l.orig} 1080w" sizes="(min-width: 750px) 22vw, 45vw" alt="${l.name}" loading="lazy" decoding="async"></span>
      </a>`;
  }

  const tileOpts = () => ({ sizes: state.cols === 2 ? '(min-width: 1100px) 66vw, 90vw' : state.cols === 4 ? '(min-width: 1100px) 34vw, 90vw' : '(min-width: 1100px) 44vw, (min-width: 750px) 60vw, 90vw' });

  function paintGrid(append) {
    const items = sorted(D.products.filter(p => passes(p)));
    const grid = $('[data-grid]');
    const label = $('[data-count]');
    label.textContent = D.pieces(items.length);
    $('[data-empty]').hidden = items.length > 0;
    const visible = items.slice(0, state.shown);
    const promo = !hasFilters() && state.cat === 'all' && state.sort === 'default' && visible.length >= 4;

    if (append) {
      const from = grid.querySelectorAll('.tile').length;
      grid.insertAdjacentHTML('beforeend', visible.slice(from).map((p, i) => S.tile(p, i, tileOpts())).join(''));
    } else {
      const html = visible.map((p, i) => S.tile(p, Math.min(i, 10), tileOpts()));
      if (promo) html.splice(4, 0, promoHTML());
      grid.classList.remove('is-in');
      grid.innerHTML = html.join('');
      void grid.offsetWidth;
      grid.classList.add('is-in');
    }

    const more = $('[data-more]');
    more.hidden = items.length <= state.shown;
    $('[data-more-label]').textContent = `${Math.min(state.shown, items.length)} из ${items.length}`;
    $('[data-more-bar]').style.setProperty('--p', items.length ? Math.min(1, state.shown / items.length).toFixed(3) : 0);
    $('[data-close-filters]').textContent = items.length ? `Показать ${D.pieces(items.length)}` : 'Ничего не нашлось';
  }

  function syncUrl() {
    const u = new URLSearchParams();
    if (state.cat !== 'all') u.set('cat', state.cat);
    if (state.sizes.size) u.set('size', [...state.sizes].join(','));
    if (state.colors.size) u.set('color', [...state.colors].join(','));
    if (state.brands.size) u.set('brand', [...state.brands].join(','));
    if (state.price) u.set('price', state.price);
    if (state.isNew) u.set('new', '1');
    if (state.q.trim()) u.set('q', state.q.trim());
    if (state.sort !== 'default') u.set('sort', state.sort);
    const s = u.toString();
    history.replaceState(null, '', s ? `?${s}` : location.pathname);
  }

  function update() {
    state.shown = PAGE;
    paintFacets();
    paintChips();
    paintGrid();
    syncUrl();
  }

  function setView(n) {
    state.cols = n;
    $('[data-grid]').style.setProperty('--cols', n);
    $$('[data-view]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.view) === n)));
  }

  /* Шторка фильтров на телефоне */
  function sheet(open) {
    $('[data-filters]').classList.toggle('is-open', open);
    $('[data-scrim]').classList.toggle('is-open', open);
    if (open) $('[data-close-filters]').focus({ preventScroll: true });
    else if (matchMedia('(max-width: 749px)').matches) $('[data-open-filters]').focus({ preventScroll: true });
  }

  function reset() {
    state.sizes.clear();
    state.colors.clear();
    state.brands.clear();
    state.price = '';
    state.isNew = false;
    state.q = '';
    buildFilters();
    update();
  }

  /* События */
  let qTimer = 0;
  document.addEventListener('input', e => {
    if (!e.target.matches('[data-q]')) return;
    clearTimeout(qTimer);
    $('[data-q-clear]').hidden = !e.target.value;
    qTimer = setTimeout(() => { state.q = e.target.value; update(); }, 220);
  });

  document.addEventListener('change', e => {
    const t = e.target;
    if (t.matches('[data-size]')) { t.checked ? state.sizes.add(t.dataset.size) : state.sizes.delete(t.dataset.size); update(); }
    else if (t.matches('[data-brand]')) { t.checked ? state.brands.add(t.dataset.brand) : state.brands.delete(t.dataset.brand); update(); }
    else if (t.matches('[data-color]')) { t.checked ? state.colors.add(t.dataset.color) : state.colors.delete(t.dataset.color); update(); }
    else if (t.matches('[data-band]')) { state.price = t.dataset.band; update(); }
    else if (t.matches('[data-new]')) { state.isNew = t.checked; update(); }
    else if (t.matches('[data-sort]')) { state.sort = t.value; update(); }
  });

  document.addEventListener('click', e => {
    const hit = s => e.target.closest(s);
    let n;
    if ((n = hit('[data-cat]'))) { state.cat = n.dataset.cat; update(); return; }
    if ((n = hit('[data-chip]'))) {
      const { chip, chipValue } = n.dataset;
      if (chip === 'size') state.sizes.delete(chipValue);
      if (chip === 'brand') state.brands.delete(chipValue);
      if (chip === 'color') state.colors.delete(chipValue);
      if (chip === 'price') state.price = '';
      if (chip === 'new') state.isNew = false;
      if (chip === 'q') state.q = '';
      buildFilters();
      update();
      return;
    }
    if (hit('[data-reset]')) { reset(); return; }
    if (hit('[data-q-clear]')) { state.q = ''; buildFilters(); update(); $('[data-q]').focus(); return; }
    if (hit('[data-more-btn]')) { state.shown += PAGE; paintGrid(true); return; }
    if ((n = hit('[data-view]'))) { setView(Number(n.dataset.view)); return; }
    if (hit('[data-open-filters]')) { sheet(true); return; }
    if (hit('[data-close-filters]') || hit('[data-scrim]')) { sheet(false); }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && $('[data-filters]').classList.contains('is-open')) sheet(false);
  });

  buildFilters();
  paintFacets();
  paintChips();
  paintGrid();
  S.reveal();
})();
