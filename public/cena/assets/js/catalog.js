/* Каталог: поиск, фильтры, плитка и таблица. Состояние живёт в адресе страницы */
(() => {
  const { $, $$ } = CD;
  const ALL = CD.products;
  const pr = (n) => `${n} ${CD.plural(n, 'прибор', 'прибора', 'приборов')}`;
  const X = CD.icon.x;

  const S = read();
  let SCORE = null, PARSED = null;

  function read() {
    const u = new URLSearchParams(location.search);
    const s = {
      q: u.get('q') || '', cat: CD.catOf(u.get('cat')) ? u.get('cat') : '',
      brand: (u.get('brand') || '').split(',').filter((b) => CD.brands.includes(b)),
      price: u.get('price') ? u.get('price').split('-').map(Number) : null,
      stock: u.get('stock') === '1', reg: u.get('reg') === '1',
      sort: u.get('sort') || '', view: u.get('view') === 'table' ? 'table' : 'tile', spec: {},
    };
    if (s.cat) for (const sp of CD.catOf(s.cat).schema) {
      const v = u.get(sp.k);
      if (v === null || !sp.f) continue;
      s.spec[sp.k] = sp.f === 'multi' ? v.split(',') : sp.f === 'bool' ? v === '1' : Number(v);
    }
    return s;
  }
  function write() {
    const u = new URLSearchParams();
    if (S.q) u.set('q', S.q);
    if (S.cat) u.set('cat', S.cat);
    if (S.brand.length) u.set('brand', S.brand.join(','));
    if (S.price) u.set('price', S.price.join('-'));
    if (S.stock) u.set('stock', '1');
    if (S.reg) u.set('reg', '1');
    for (const [k, v] of Object.entries(S.spec)) {
      if (v === null || v === undefined || v === false || (Array.isArray(v) && !v.length)) continue;
      u.set(k, Array.isArray(v) ? v.join(',') : v === true ? '1' : v);
    }
    if (S.sort) u.set('sort', S.sort);
    if (S.view === 'table') u.set('view', 'table');
    const qs = u.toString();
    history.replaceState(null, '', qs ? '?' + qs : location.pathname);
  }

  /* Отбор */
  const isSet = (v) => !(v === null || v === undefined || v === false || (Array.isArray(v) && !v.length));
  function pool() {
    if (!S.q) { SCORE = null; PARSED = null; return ALL; }
    const r = CD.search.run(S.q);
    PARSED = r;
    SCORE = new Map(r.hits.map((h) => [h.p.id, h.score]));
    return r.hits.map((h) => h.p);
  }
  function pass(p, skip) {
    if (skip !== 'cat' && S.cat && p.cat !== S.cat) return false;
    if (skip !== 'brand' && S.brand.length && !S.brand.includes(p.brand)) return false;
    if (skip !== 'price' && S.price && (p.price < S.price[0] || p.price > S.price[1])) return false;
    if (skip !== 'stock' && S.stock && !p.stock) return false;
    if (skip !== 'reg' && S.reg && !p.reg) return false;
    if (S.cat) for (const sp of CD.catOf(S.cat).schema) {
      if (skip === sp.k) continue;
      const v = S.spec[sp.k];
      if (!isSet(v)) continue;
      const pv = p.specs[sp.k];
      if (sp.f === 'min' && !(pv >= v)) return false;
      if (sp.f === 'max' && !(pv <= v)) return false;
      if (sp.f === 'multi' && !v.includes(pv)) return false;
      if (sp.f === 'bool' && !pv) return false;
    }
    return true;
  }

  /* Шапка раздела и вкладки типов */
  const title = $('[data-title]'), lead = $('[data-lead]'), sig = $('[data-sig]'), crumb = $('[data-crumb]');
  function head() {
    const c = CD.catOf(S.cat);
    title.textContent = c ? c.name : 'Каталог';
    crumb.textContent = c ? c.name : 'Каталог';
    lead.textContent = c ? c.lead : 'Восемь типов приборов. Ищите по параметрам, фильтруйте по характеристикам, сравнивайте до четырёх моделей в одной таблице';
    sig.innerHTML = CD.sigSvg(c ? c.id : 'scope', 260, 64, 2.5);
    document.title = `${c ? c.name : 'Каталог'} · Цена деления`;
  }
  const tabs = $('[data-ctabs]');
  function renderTabs(base) {
    const n = (id) => base.filter((p) => (!id || p.cat === id) && pass(p, 'cat')).length;
    tabs.innerHTML = `<button type="button" data-c=""${!S.cat ? ' aria-current="true"' : ''}><b>Все</b><span>${n('')}</span></button>` +
      CD.cats.map((c) => `<button type="button" data-c="${c.id}"${S.cat === c.id ? ' aria-current="true"' : ''}${n(c.id) ? '' : ' class="is-zero"'}>${CD.sigSvg(c.id, 60, 18, 2)}<b>${c.name}</b><span>${n(c.id)}</span></button>`).join('');
  }
  tabs.addEventListener('click', (e) => {
    const b = e.target.closest('[data-c]');
    if (!b) return;
    S.cat = b.dataset.c; S.spec = {}; S.price = null;
    if (S.sort.startsWith('spec:')) S.sort = '';
    buildFilters(); update(true);
  });

  /* Фильтры */
  const fin = $('[data-flt-in]');
  const values = (sp) => {
    const vs = [...new Set(ALL.filter((p) => p.cat === S.cat).map((p) => p.specs[sp.k]))].filter((v) => v !== null && v !== undefined);
    return sp.f === 'max' ? vs.sort((a, b) => b - a) : vs.sort((a, b) => (typeof a === 'string' ? a.localeCompare(b, 'ru') : a - b));
  };
  const fmtSpec = (sp, v) => CD.val({ specs: { [sp.k]: v } }, sp);
  const priceBounds = () => {
    const ps = ALL.filter((p) => !S.cat || p.cat === S.cat).map((p) => p.price);
    return [Math.floor(Math.min(...ps) / 1000) * 1000, Math.ceil(Math.max(...ps) / 1000) * 1000];
  };

  function stepper(sp) {
    const vs = values(sp);
    const cur = S.spec[sp.k];
    const idx = isSet(cur) ? Math.max(0, vs.indexOf(cur)) + 1 : 0;
    return `<fieldset class="fg"><legend>${sp.l}</legend>
      <div class="stp" data-stp="${sp.k}">
        <output data-stp-o>${idx ? (sp.f === 'max' ? 'до ' : 'от ') + fmtSpec(sp, vs[idx - 1]) : 'Любая'}</output>
        <input class="rng" type="range" min="0" max="${vs.length}" step="1" value="${idx}" aria-label="${sp.l}">
        <div class="stp__t" aria-hidden="true">${['', ...vs].map(() => '<i></i>').join('')}</div>
      </div></fieldset>`;
  }

  function buildFilters() {
    const c = CD.catOf(S.cat);
    const [lo, hi] = priceBounds();
    const p = S.price || [lo, hi];
    let h = `<fieldset class="fg"><legend>Цена, ₽</legend>
      <div class="pr" data-pr style="--a:${((p[0] - lo) / (hi - lo)) * 100}%;--b:${((p[1] - lo) / (hi - lo)) * 100}%">
        <output data-pr-o></output>
        <div class="pr__r"><input class="rng rng--dual" type="range" min="${lo}" max="${hi}" step="500" value="${p[0]}" aria-label="Цена от" data-pr-a><input class="rng rng--dual" type="range" min="${lo}" max="${hi}" step="500" value="${p[1]}" aria-label="Цена до" data-pr-b></div>
      </div></fieldset>
      <fieldset class="fg fg--t"><legend class="sr">Наличие и реестр</legend>
        <label class="chk"><input type="checkbox" data-t="stock"${S.stock ? ' checked' : ''}><i></i><span>В наличии <small data-cnt="stock"></small></span></label>
        <label class="chk"><input type="checkbox" data-t="reg"${S.reg ? ' checked' : ''}><i></i><span>В Госреестре СИ <small data-cnt="reg"></small></span></label>
      </fieldset>`;
    if (c) {
      for (const sp of c.schema) {
        if (!sp.f || sp.hide) continue;
        if (sp.f === 'min' || sp.f === 'max') h += stepper(sp);
        else if (sp.f === 'bool') h += `<fieldset class="fg fg--t"><legend class="sr">${sp.l}</legend><label class="chk"><input type="checkbox" data-b="${sp.k}"${S.spec[sp.k] ? ' checked' : ''}><i></i><span>${sp.l} <small data-cnt="b:${sp.k}"></small></span></label></fieldset>`;
        else if (sp.f === 'multi') h += `<fieldset class="fg"><legend>${sp.l}</legend>${values(sp).map((v) => `<label class="chk"><input type="checkbox" data-m="${sp.k}" value="${CD.esc(v)}"${(S.spec[sp.k] || []).includes(v) ? ' checked' : ''}><i></i><span>${v} <small data-cnt="m:${sp.k}:${CD.esc(v)}"></small></span></label>`).join('')}</fieldset>`;
      }
    }
    h += `<fieldset class="fg"><legend>Производитель</legend>${CD.brands.map((b) => `<label class="chk"><input type="checkbox" data-brand value="${b}"${S.brand.includes(b) ? ' checked' : ''}><i></i><span>${b} <small data-cnt="brand:${b}"></small></span></label>`).join('')}</fieldset>`;
    fin.innerHTML = h;
    priceOut();
  }

  function priceOut() {
    const a = +$('[data-pr-a]').value, b = +$('[data-pr-b]').value;
    $('[data-pr-o]').textContent = `${CD.num(Math.min(a, b))} … ${CD.num(Math.max(a, b))}`;
  }

  function counts(base) {
    const set = (sel, n) => { const e = fin.querySelector(`[data-cnt="${sel}"]`); if (!e) return; e.textContent = n; const inp = e.closest('label').querySelector('input'); inp.disabled = !n && !inp.checked; };
    set('stock', base.filter((p) => p.stock && pass(p, 'stock')).length);
    set('reg', base.filter((p) => p.reg && pass(p, 'reg')).length);
    for (const b of CD.brands) set('brand:' + b, base.filter((p) => p.brand === b && pass(p, 'brand')).length);
    const c = CD.catOf(S.cat);
    if (!c) return;
    for (const sp of c.schema) {
      if (sp.f === 'bool') set('b:' + sp.k, base.filter((p) => p.specs[sp.k] && pass(p, sp.k)).length);
      if (sp.f === 'multi') for (const v of values(sp)) set(`m:${sp.k}:${v}`, base.filter((p) => p.specs[sp.k] === v && pass(p, sp.k)).length);
    }
  }

  fin.addEventListener('input', (e) => {
    const t = e.target;
    if (t.matches('[data-pr-a],[data-pr-b]')) {
      const [lo, hi] = priceBounds();
      let a = +$('[data-pr-a]').value, b = +$('[data-pr-b]').value;
      if (a > b) [a, b] = [b, a];
      const box = $('[data-pr]');
      box.style.setProperty('--a', ((a - lo) / (hi - lo)) * 100 + '%');
      box.style.setProperty('--b', ((b - lo) / (hi - lo)) * 100 + '%');
      priceOut();
      S.price = a <= lo && b >= hi ? null : [a, b];
      update();
    }
    const st = t.closest('[data-stp]');
    if (st) {
      const sp = CD.catOf(S.cat).schema.find((s) => s.k === st.dataset.stp);
      const vs = values(sp);
      const i = +t.value;
      S.spec[sp.k] = i ? vs[i - 1] : null;
      $('[data-stp-o]', st).textContent = i ? (sp.f === 'max' ? 'до ' : 'от ') + fmtSpec(sp, vs[i - 1]) : 'Любая';
      update();
    }
  });
  fin.addEventListener('change', (e) => {
    const t = e.target;
    if (t.matches('[data-brand]')) S.brand = $$('[data-brand]:checked', fin).map((i) => i.value);
    else if (t.matches('[data-t]')) S[t.dataset.t] = t.checked;
    else if (t.matches('[data-b]')) S.spec[t.dataset.b] = t.checked;
    else if (t.matches('[data-m]')) S.spec[t.dataset.m] = $$(`[data-m="${t.dataset.m}"]:checked`, fin).map((i) => i.value);
    else return;
    update();
  });

  /* Активные фильтры и понятый запрос */
  const chips = $('[data-chips]');
  function activeList() {
    const out = [];
    const c = CD.catOf(S.cat);
    if (S.price) out.push({ id: 'price', label: `${CD.num(S.price[0])} … ${CD.num(S.price[1])} ₽`, off: () => { S.price = null; } });
    if (S.stock) out.push({ id: 'stock', label: 'В наличии', off: () => { S.stock = false; } });
    if (S.reg) out.push({ id: 'reg', label: 'В Госреестре', off: () => { S.reg = false; } });
    S.brand.forEach((b) => out.push({ id: 'brand', label: b, off: () => { S.brand = S.brand.filter((x) => x !== b); } }));
    if (c) for (const sp of c.schema) {
      const v = S.spec[sp.k];
      if (!isSet(v)) continue;
      const label = sp.f === 'bool' ? sp.l : sp.f === 'multi' ? v.join(', ') : `${sp.l} ${sp.f === 'max' ? 'до' : 'от'} ${fmtSpec(sp, v)}`;
      out.push({ id: sp.k, label, off: () => { S.spec[sp.k] = sp.f === 'multi' ? [] : null; } });
    }
    return out;
  }
  function renderChips(act) {
    let h = '';
    if (PARSED && (PARSED.cons.length || PARSED.fixed)) {
      h += `<div class="chips__u"><span class="lbl">Поняли запрос так</span>${PARSED.fixed ? `<i>раскладка: «${CD.esc(PARSED.fixed)}»</i>` : ''}${PARSED.cons.map((c) => `<i>${CD.esc(c.label)}</i>`).join('')}</div>`;
    }
    if (act.length) {
      h += `<div class="chips__a">${act.map((a, i) => `<button type="button" data-off="${i}">${CD.esc(a.label)}${X}</button>`).join('')}<button type="button" class="chips__reset" data-reset>Сбросить фильтры</button></div>`;
    }
    chips.innerHTML = h;
    chips.hidden = !h;
    const n = act.length;
    const fn = $('[data-f-n]');
    fn.hidden = !n;
    fn.textContent = n;
  }
  chips.addEventListener('click', (e) => {
    const off = e.target.closest('[data-off]');
    if (off) { activeList()[+off.dataset.off].off(); buildFilters(); update(); }
    if (e.target.closest('[data-reset]')) { S.brand = []; S.price = null; S.stock = false; S.reg = false; S.spec = {}; buildFilters(); update(); }
  });

  /* Сортировка */
  const sortSel = $('[data-sort]');
  const SORT = {
    rel: (a, b) => (SCORE.get(b.id) || 0) - (SCORE.get(a.id) || 0),
    pop: (a, b) => b.pop - a.pop,
    cheap: (a, b) => a.price - b.price,
    exp: (a, b) => b.price - a.price,
    new: (a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0) || b.pop - a.pop,
  };
  const sortKey = () => S.sort || (S.q ? 'rel' : 'pop');
  function sorted(list) {
    const k = sortKey();
    if (k.startsWith('spec:')) {
      const [, key, dir] = k.split(':');
      const m = dir === 'asc' ? 1 : -1;
      return [...list].sort((a, b) => {
        if (key === 'price') return (a.price - b.price) * m;
        const x = a.specs[key], y = b.specs[key];
        if (x == null) return y == null ? 0 : 1;
        if (y == null) return -1;
        return (x - y) * m;
      });
    }
    return [...list].sort(SORT[k] && (k !== 'rel' || SCORE) ? SORT[k] : SORT.pop);
  }
  sortSel.addEventListener('change', () => { S.sort = sortSel.value; update(); });

  /* Вид */
  const viewEl = $('[data-view]');
  viewEl.addEventListener('click', (e) => {
    const b = e.target.closest('[data-v]');
    if (!b) return;
    S.view = b.dataset.v;
    update();
  });

  /* Результаты */
  const res = $('[data-res]'), nEl = $('[data-n]');
  const mainSpec = (p) => CD.catOf(p.cat).schema.find((s) => s.c);
  function table(list) {
    const c = CD.catOf(S.cat);
    const cols = c ? c.schema.filter((s) => s.t) : null;
    const k = sortKey();
    const th = (key, label, num = true) => {
      const dir = k === `spec:${key}:asc` ? 'ascending' : k === `spec:${key}:desc` ? 'descending' : 'none';
      return `<th scope="col" aria-sort="${dir}" class="${num ? 'n' : ''}"><button type="button" data-sk="${key}">${label}<i>${dir === 'ascending' ? '↑' : dir === 'descending' ? '↓' : '↕'}</i></button></th>`;
    };
    return `<div class="tw"><table class="tbl">
      <thead><tr><th scope="col" class="tbl__c"><span class="sr">Сравнить</span></th><th scope="col">Прибор</th>
      ${cols ? cols.map((s) => (typeof (ALL.find((p) => p.cat === S.cat).specs[s.k]) === 'number' ? th(s.k, s.l + (s.u ? `, ${s.u}` : '')) : `<th scope="col">${s.l}</th>`)).join('') : '<th scope="col">Главный параметр</th>'}
      <th scope="col">Наличие</th>${th('price', 'Цена, ₽')}<th scope="col"><span class="sr">В корзину</span></th></tr></thead>
      <tbody>${list.map((p) => {
        const ms = mainSpec(p);
        return `<tr data-href="product.html?id=${p.id}">
          <td class="tbl__c"><label class="chk"><input type="checkbox" data-compare="${p.id}"><i></i><span class="sr">Сравнить ${p.name}</span></label></td>
          <td class="tbl__p"><span class="tbl__fig">${CD.figure(p)}</span><span><a href="product.html?id=${p.id}">${p.name}</a><small>${c ? p.brand : CD.catOf(p.cat).one + ' · ' + p.brand}</small></span></td>
          ${cols ? cols.map((s) => `<td class="${typeof p.specs[s.k] === 'number' ? 'n' : ''}">${typeof p.specs[s.k] === 'number' ? (s.fmt ? s.fmt(p.specs[s.k]) : CD.num(p.specs[s.k])) : CD.val(p, s)}</td>`).join('') : `<td>${ms.l} ${CD.val(p, ms)}</td>`}
          <td><span class="st${p.stock ? '' : ' st--off'}">${CD.stock(p)}</span></td>
          <td class="n tbl__pr">${CD.num(p.price)}</td>
          <td><button class="tile__add" type="button" data-add="${p.id}" aria-label="Добавить ${p.name} в корзину">${CD.icon.plus}</button></td>
        </tr>`;
      }).join('')}</tbody></table></div>`;
  }
  res.addEventListener('click', (e) => {
    const sk = e.target.closest('[data-sk]');
    if (sk) {
      const key = sk.dataset.sk, k = sortKey();
      S.sort = k === `spec:${key}:desc` ? `spec:${key}:asc` : k === `spec:${key}:asc` ? '' : `spec:${key}:desc`;
      update();
      return;
    }
    const tr = e.target.closest('tr[data-href]');
    if (tr && !e.target.closest('a,button,label,input')) location.href = tr.dataset.href;
  });

  function empty(base) {
    const act = activeList();
    const tips = act.map((a) => {
      const snap = JSON.stringify(S);
      a.off();
      const n = base.filter((p) => pass(p)).length;
      Object.assign(S, JSON.parse(snap));
      return { a, n };
    }).filter((t) => t.n).sort((x, y) => y.n - x.n).slice(0, 3);
    return `<div class="zero">
      <p class="zero__ol" aria-hidden="true">OL</p>
      <div><h2 class="h3">Вне предела измерения</h2>
      <p>${S.q ? `По запросу «${CD.esc(S.q)}» с такими фильтрами приборов нет.` : 'С такими фильтрами приборов нет.'} Ослабьте один параметр</p>
      ${tips.length ? `<ul class="zero__t">${tips.map((t, i) => `<li><button type="button" data-tip="${act.indexOf(t.a)}">Убрать «${CD.esc(t.a.label)}»<span>${pr(t.n)}</span></button></li>`).join('')}</ul>` : ''}
      ${S.q ? '<button type="button" class="line" data-clear-q>Искать без запроса</button>' : ''}</div>
    </div>`;
  }
  res.addEventListener('click', (e) => {
    const t = e.target.closest('[data-tip]');
    if (t) { activeList()[+t.dataset.tip].off(); buildFilters(); update(); }
    if (e.target.closest('[data-clear-q]')) { S.q = ''; qIn.value = ''; update(); }
  });

  let lastN = -1;
  function update(scrollTop) {
    const base = pool();
    const list = sorted(base.filter((p) => pass(p)));
    head();
    renderTabs(base);
    counts(base);
    renderChips(activeList());

    $$('[data-v]', viewEl).forEach((b) => b.setAttribute('aria-pressed', b.dataset.v === S.view));
    sortSel.querySelector('[value="rel"]').disabled = !S.q;
    const k = sortKey();
    sortSel.value = k.startsWith('spec:') ? '' : k;

    const table_ = S.view === 'table' && matchMedia('(min-width: 1340px)').matches;
    res.className = table_ ? 'res__t' : 'res__g ruled';
    res.innerHTML = list.length ? (table_ ? table(list) : list.map((p) => CD.tile(p)).join('')) : empty(base);
    if (!list.length) res.className = '';
    nEl.innerHTML = `<b class="pop-n">${list.length}</b> ${CD.plural(list.length, 'прибор', 'прибора', 'приборов')}${S.q ? ` по запросу «${CD.esc(S.q)}»` : ''}`;
    if (lastN !== list.length && lastN !== -1) { const b = $('.pop-n', nEl); b.classList.add('is-pop'); }
    lastN = list.length;
    $('[data-f-apply]').textContent = `Показать ${pr(list.length)}`;
    CD.syncCompare();
    write();
    if (scrollTop && scrollY > 300) $('.ctabs').scrollIntoView({ behavior: CD.reduced ? 'auto' : 'smooth', block: 'start' });
  }

  /* Строка поиска */
  const qIn = $('[data-q]'), qClear = $('[data-q-clear]');
  qIn.value = S.q;
  qClear.hidden = !S.q;
  let qt;
  qIn.addEventListener('input', () => {
    qClear.hidden = !qIn.value;
    clearTimeout(qt);
    qt = setTimeout(() => {
      S.q = qIn.value.trim();
      if (!S.q && S.sort === 'rel') S.sort = '';
      update();
    }, 220);
  });
  $('[data-q-form]').addEventListener('submit', (e) => { e.preventDefault(); clearTimeout(qt); S.q = qIn.value.trim(); update(); qIn.blur(); });
  qClear.addEventListener('click', () => { qIn.value = ''; qClear.hidden = true; S.q = ''; if (S.sort === 'rel') S.sort = ''; update(); qIn.focus(); });

  /* Фильтры на телефоне: нижняя шторка */
  const flt = $('[data-flt]'), bg = $('[data-f-bg]'), fOpen = $('[data-f-open]');
  const sheet = (v) => {
    flt.classList.toggle('is-open', v);
    bg.hidden = !v;
    fOpen.setAttribute('aria-expanded', v);
    document.documentElement.classList.toggle('no-scroll', v);
    if (v) $('[data-f-close]').focus(); else fOpen.focus();
  };
  fOpen.addEventListener('click', () => sheet(true));
  $('[data-f-close]').addEventListener('click', () => sheet(false));
  $('[data-f-apply]').addEventListener('click', () => sheet(false));
  bg.addEventListener('click', () => sheet(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && flt.classList.contains('is-open')) sheet(false); });

  let rt, wasWide = matchMedia('(min-width: 1340px)').matches;
  addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      const wide = matchMedia('(min-width: 1340px)').matches;
      if (wide !== wasWide && S.view === 'table') update();
      wasWide = wide;
    }, 150);
  });

  buildFilters();
  update();
})();
