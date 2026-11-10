/* Общее для всех страниц: хранилище, шапка, подвал, карточка, поиск-палитра, ревилы */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  CD.$ = $; CD.$$ = $$;

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  CD.esc = esc;
  CD.num = (v, o) => Number(v).toLocaleString('ru-RU', o);
  CD.price = (v) => CD.num(v) + ' ₽';
  CD.plural = (n, a, b, c) => { const x = Math.abs(n) % 100, y = x % 10; return x > 10 && x < 20 ? c : y > 1 && y < 5 ? b : y === 1 ? a : c; };
  CD.val = (p, s) => {
    const v = p.specs[s.k];
    if (v === undefined || v === null) return 'нет данных';
    if (s.bool) return v ? 'Есть' : 'Нет';
    if (s.fmt) return s.fmt(v);
    if (typeof v === 'string') return v;
    return CD.num(v) + (s.u ? (s.u === '″' ? s.u : ' ' + s.u) : '');
  };
  CD.stock = (p) => (p.stock > 0 ? (p.stock < 4 ? `Осталось ${p.stock} шт` : 'В наличии') : 'Под заказ');
  CD.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ICON = {
    search: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="6.8" cy="6.8" r="4.8"/><path d="M10.4 10.4 14.5 14.5"/></svg>',
    arrow: '<svg class="ar" width="20" height="10" viewBox="0 0 20 10" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M0 5h19M14.5.8 19 5l-4.5 4.2"/></svg>',
    x: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m1 1 10 10M11 1 1 11"/></svg>',
    plus: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M7 0v14M0 7h14"/></svg>',
    logo: '<svg class="logo__m" width="30" height="20" viewBox="0 0 30 20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M1 20V4M8 20v-9M15 20V0M22 20v-9M29 20V4"/></svg>',
  };
  CD.icon = ICON;

  /* Хранилище с запасным вариантом в памяти */
  const mem = {};
  const store = {
    get(k, d) { try { const v = localStorage.getItem('cd.' + k); return v ? JSON.parse(v) : (k in mem ? mem[k] : d); } catch (e) { return k in mem ? mem[k] : d; } },
    set(k, v) { mem[k] = v; try { localStorage.setItem('cd.' + k, JSON.stringify(v)); } catch (e) {} },
  };
  CD.store = store;
  const emit = (n) => document.dispatchEvent(new CustomEvent(n));

  CD.cart = {
    items: () => store.get('cart', []).filter((i) => CD.byId(i.id)),
    save(v) { store.set('cart', v); emit('cd:cart'); },
    add(id, verify = false, qty = 1) {
      const a = this.items();
      const f = a.find((i) => i.id === id);
      if (f) { f.qty += qty; f.verify = f.verify || verify; } else a.push({ id, qty, verify });
      this.save(a);
    },
    set(id, patch) { this.save(this.items().map((i) => (i.id === id ? { ...i, ...patch } : i)).filter((i) => i.qty > 0)); },
    remove(id) { this.save(this.items().filter((i) => i.id !== id)); },
    clear() { this.save([]); },
    count() { return this.items().reduce((s, i) => s + i.qty, 0); },
    lineTotal(i) { const p = CD.byId(i.id); return (p.price + (i.verify ? CD.catOf(p.cat).verify || 0 : 0)) * i.qty; },
    total() { return this.items().reduce((s, i) => s + this.lineTotal(i), 0); },
    mass() { return this.items().reduce((s, i) => s + CD.byId(i.id).mass * i.qty, 0); },
  };

  CD.compare = {
    list: () => store.get('compare', []).filter((id) => CD.byId(id)),
    has(id) { return this.list().includes(id); },
    save(v) { store.set('compare', v); emit('cd:compare'); },
    remove(id) { this.save(this.list().filter((x) => x !== id)); },
    clear() { this.save([]); },
    toggle(id) {
      const a = this.list();
      if (a.includes(id)) return this.remove(id);
      const p = CD.byId(id);
      if (a.length && CD.byId(a[0]).cat !== p.cat) {
        CD.toast(`Сравнивать можно приборы одного типа`, { label: 'Начать заново', fn: () => this.save([id]) });
        emit('cd:compare');
        return;
      }
      if (a.length >= 4) { CD.toast('В таблице помещается четыре прибора'); emit('cd:compare'); return; }
      a.push(id);
      this.save(a);
    },
  };

  /* Уведомления */
  let toastEl, toastT;
  CD.toast = (text, action) => {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
    }
    toastEl.innerHTML = `<span>${esc(text)}</span>` + (action ? `<button type="button">${esc(action.label)}</button>` : '');
    if (action) $('button', toastEl).onclick = () => { toastEl.classList.remove('is-on'); action.fn && action.fn(); };
    toastEl.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove('is-on'), action ? 7000 : 3800);
  };

  /* Карточка прибора */
  const tileSpecs = (p, c) => c.schema.filter((s) => s.c).slice(0, 3).map((s) => `<li><span>${s.l}</span><b>${CD.val(p, s)}</b></li>`).join('');
  CD.tile = (p, opt = {}) => {
    const c = CD.catOf(p.cat);
    const href = `product.html?id=${p.id}`;
    return `<article class="tile${opt.big ? ' tile--big' : ''}" data-id="${p.id}">
      <a class="tile__fig" href="${href}" tabindex="-1" aria-hidden="true" style="view-transition-name:pd-${p.id}">${CD.figure(p)}</a>
      <label class="tile__cmp chk"><input type="checkbox" data-compare="${p.id}"><i></i><span>Сравнить</span></label>
      <div class="tile__body">
        <p class="tile__meta">${c.one} · ${p.brand}${p.isNew ? ' · <em>Новинка</em>' : ''}</p>
        <h3 class="tile__name"><a href="${href}">${p.name}</a></h3>
        <ul class="tile__specs">${tileSpecs(p, c)}</ul>
        <div class="tile__foot">
          <div><b class="tile__price">${CD.price(p.price)}</b><span class="st${p.stock ? '' : ' st--off'}">${CD.stock(p)}</span></div>
          <button class="tile__add" type="button" data-add="${p.id}" aria-label="Добавить ${p.name} в корзину">${ICON.plus}</button>
        </div>
      </div>
    </article>`;
  };

  CD.syncCompare = () => {
    const a = CD.compare.list();
    $$('input[data-compare]').forEach((i) => { i.checked = a.includes(i.dataset.compare); });
  };

  /* Шапка и подвал */
  const page = document.body.dataset.page;
  const NAV = [['podbor.html', 'Подбор', 'podbor'], ['service.html', 'Поверка', 'service'], ['guides.html', 'Шпаргалки', 'guides'], ['info.html', 'Покупателям', 'info']];
  const cur = (k) => (page === k ? ' aria-current="page"' : '');

  function header() {
    const host = $('[data-site-header]');
    if (!host) return;
    host.innerHTML = `
    <div class="strip"><div class="strip__in">
      <span data-clock>&nbsp;</span>
      <span class="strip__mid" data-ship>Отгружаем сегодня до 17:00</span>
      <span class="strip__r"><a href="tel:+73512254817">+7 351 225-48-17</a></span>
    </div></div>
    <header class="hd" data-hd>
      <div class="hd__in">
        <a class="logo" href="index.html" aria-label="Цена деления, на главную">${ICON.logo}<span>Цена деления</span></a>
        <nav class="nav" aria-label="Основное меню">
          <button class="nav__l nav__cat" type="button" aria-expanded="false" aria-controls="mega" data-mega-btn${page === 'catalog' || page === 'product' ? ' data-cur' : ''}>Каталог</button>
          ${NAV.map(([h, t, k]) => `<a class="nav__l" href="${h}"${cur(k)}>${t}</a>`).join('')}
        </nav>
        <button class="hd__find" type="button" data-pal-open aria-label="Поиск по каталогу">${ICON.search}<span>Прибор или параметр</span><kbd>/</kbd></button>
        <a class="hd__c hd__cmp" href="compare.html"${cur('compare')}><span>Сравнить</span><b data-count-compare>0</b></a>
        <a class="hd__c" href="cart.html"${cur('cart')}><span>Корзина</span><b data-count-cart>0</b></a>
        <button class="hd__burger" type="button" aria-label="Открыть меню" aria-expanded="false" data-burger><i></i><i></i></button>
      </div>
      <div class="mega" id="mega" hidden data-mega>
        <ul class="mega__g">
          ${CD.cats.map((c) => `<li><a href="catalog.html?cat=${c.id}">${CD.sigSvg(c.id, 150, 34, 2.5)}<b>${c.name}</b><span>${c.lead}</span></a></li>`).join('')}
        </ul>
        <a class="line" href="catalog.html"><span>Весь каталог, ${CD.products.length} ${CD.plural(CD.products.length, 'прибор', 'прибора', 'приборов')}</span>${ICON.arrow}</a>
      </div>
    </header>
    <div class="mm" data-mm hidden>
      <a href="catalog.html">Каталог</a>
      ${NAV.map(([h, t]) => `<a href="${h}">${t}</a>`).join('')}
      <a href="compare.html">Сравнение</a>
      <p>+7 351 225-48-17<br><span data-ship>Отгружаем сегодня до 17:00</span></p>
    </div>`;

    const hd = $('[data-hd]');
    const onS = () => hd.classList.toggle('is-stuck', scrollY > 40);
    addEventListener('scroll', onS, { passive: true });
    onS();

    /* Выпадающий каталог */
    const btn = $('[data-mega-btn]'), mega = $('[data-mega]');
    let hideT;
    const open = (v) => { clearTimeout(hideT); mega.hidden = !v; btn.setAttribute('aria-expanded', v); };
    btn.addEventListener('click', () => open(mega.hidden));
    if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
      btn.addEventListener('pointerenter', () => open(true));
      [btn, mega].forEach((e) => {
        e.addEventListener('pointerleave', () => { hideT = setTimeout(() => open(false), 180); });
        e.addEventListener('pointerenter', () => clearTimeout(hideT));
      });
    }
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !mega.hidden) { open(false); btn.focus(); } });

    /* Мобильное меню */
    const b = $('[data-burger]'), mm = $('[data-mm]');
    b.addEventListener('click', () => {
      const on = mm.hidden;
      mm.hidden = !on;
      b.setAttribute('aria-expanded', on);
      b.setAttribute('aria-label', on ? 'Закрыть меню' : 'Открыть меню');
      document.documentElement.classList.toggle('no-scroll', on);
    });

    /* Живые часы и срок отгрузки в часовом поясе посетителя.
       Браузер знает только пояс, а не город: Челябинск он назвал бы Екатеринбургом, Петербург Москвой.
       Поэтому пишем «Ваше время» */
    const clock = $('[data-clock]'), ship = $$('[data-ship]');
    const fT = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' });
    const fD = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' });
    /* Склад в Челябинске (UTC+5) отгружает до 17:00 местного, это 12:00 UTC. Показываем на часах посетителя */
    const shipText = (d) => {
      const m = new Date(d.getTime() + 5 * 3600e3);
      let cut = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth(), m.getUTCDate(), 12));
      if (d >= cut) cut = new Date(cut.getTime() + 864e5);
      /* Ближайшая отгрузка может выпасть на завтра по часам посетителя, даже если в Челябинске уже сегодня */
      const day = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
      const diff = Math.round((day(cut) - day(d)) / 864e5);
      return diff <= 0 ? `Отгружаем сегодня до ${fT.format(cut)}` : `Отгрузим завтра, если заказать до ${fT.format(cut)}`;
    };
    const tick = () => {
      const d = new Date();
      clock.textContent = `Ваше время ${fT.format(d)} · ${fD.format(d)}`;
      const s = shipText(d);
      ship.forEach((e) => { e.textContent = s; });
    };
    tick();
    setInterval(tick, 20000);
  }


  function footer() {
    const host = $('[data-site-footer]');
    if (!host) return;
    const idx = CD.pages.findIndex(([, , ], i) => (CD.pages[i][0].replace('.html', '') === (page === 'home' ? 'index' : page)));
    const name = idx >= 0 ? CD.pages[idx][1] : 'Вне предела';
    const date = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(new Date());
    const rows = [['Разраб.', 'Отдел приборов'], ['Пров.', 'Метрологи'], ['Т. контр.', 'Склад'], ['Н. контр.', 'Поддержка'], ['Утв.', 'Покупатель']];
    host.innerHTML = `
    <footer class="ft">
      <div class="ft__links">
        <div><h2>Каталог</h2>${CD.cats.map((c) => `<a href="catalog.html?cat=${c.id}">${c.name}</a>`).join('')}</div>
        <div><h2>Инженерам</h2><a href="podbor.html">Подбор стола под задачу</a><a href="compare.html">Сравнение приборов</a><a href="service.html">Поверка и калибровка</a><a href="guides.html">Шпаргалки</a></div>
        <div><h2>Покупателям</h2><a href="info.html#delivery">Доставка</a><a href="info.html#payment">Оплата и счета</a><a href="info.html#warranty">Гарантия и возврат</a><a href="info.html#contacts">Контакты</a></div>
        <div class="ft__contact"><h2>Связь</h2><a href="tel:+73512254817">+7 351 225-48-17</a><a href="mailto:pribor@cena-deleniya.example">pribor@cena-deleniya.example</a><p>Челябинск, проспект Победы, 288<br>бизнес-центр «Эталон»</p></div>
      </div>
      <div class="stamp" aria-label="Основная надпись страницы">
        <div class="stamp__l">
          ${rows.map(([a, b], i) => `<div class="stamp__r"><span>${a}</span><span>${b}</span><span>${i === 0 ? date : ''}</span></div>`).join('')}
        </div>
        <div class="stamp__c">
          <p class="stamp__code">ЦД.2026.${String(Math.max(idx + 1, 0)).padStart(3, '0')}</p>
          <p class="stamp__name">Цена деления</p>
          <p class="stamp__page">${name}</p>
        </div>
        <div class="stamp__s">
          <div><span>Лит.</span><b>У</b></div><div><span>Масса</span><b data-stamp-mass>0</b></div><div><span>Масштаб</span><b>1:1</b></div>
          <div><span>Лист</span><b>${Math.max(idx + 1, 0)}</b></div><div><span>Листов</span><b>${CD.pages.length}</b></div><div><span>Город</span><b>Члб</b></div>
        </div>
      </div>
      <p class="ft__end"><span>Цена деления, ${new Date().getFullYear()}</span><span>Разработано <a href="https://volgin.site/" target="_blank" rel="noopener">volgin.site</a></span></p>
    </footer>`;
  }

  /* Панель сравнения внизу экрана */
  function tray() {
    if (page === 'compare') return;
    const el = document.createElement('div');
    el.className = 'tray';
    el.hidden = true;
    document.body.appendChild(el);
    const render = () => {
      const a = CD.compare.list();
      el.hidden = !a.length;
      document.body.classList.toggle('has-tray', !!a.length);
      if (!a.length) return;
      el.innerHTML = `<span class="tray__l">Сравнение <b>${a.length}</b> из 4</span>
        <ul>${a.map((id) => `<li><span>${CD.byId(id).name}</span><button type="button" data-tray-x="${id}" aria-label="Убрать ${CD.byId(id).name} из сравнения">${ICON.x}</button></li>`).join('')}</ul>
        <a class="btn btn--sm btn--sig" href="compare.html"><span>Сравнить</span></a>`;
    };
    document.addEventListener('cd:compare', render);
    el.addEventListener('click', (e) => { const b = e.target.closest('[data-tray-x]'); if (b) CD.compare.remove(b.dataset.trayX); });
    render();
  }

  /* Палитра поиска */
  function palette() {
    const dlg = document.createElement('dialog');
    dlg.className = 'pal';
    dlg.setAttribute('aria-label', 'Поиск по каталогу');
    dlg.innerHTML = `<form class="pal__f" method="dialog" data-pal-form>
        ${ICON.search}
        <input type="text" placeholder="осциллограф 200 МГц 4 канала" autocomplete="off" spellcheck="false" aria-label="Что ищем" role="combobox" aria-expanded="true" aria-controls="pal-list" data-pal-input>
        <button type="button" class="pal__x" data-pal-close aria-label="Закрыть поиск"><kbd>Esc</kbd></button>
      </form>
      <div class="pal__u" data-pal-understood hidden></div>
      <div class="pal__list" id="pal-list" role="listbox" data-pal-list></div>
      <div class="pal__foot"><span><kbd>↑</kbd><kbd>↓</kbd> выбрать</span><span><kbd>Enter</kbd> открыть</span><span class="pal__hint">Понимает МГц, вольты, амперы, каналы и «до 50 тыс»</span></div>`;
    document.body.appendChild(dlg);
    const input = $('[data-pal-input]', dlg), list = $('[data-pal-list]', dlg), und = $('[data-pal-understood]', dlg);
    let active = -1, links = [];

    const POPULAR = ['осциллограф 200 МГц', 'мультиметр CAT IV', 'лбп 30 В 5 А', 'тепловизор 256×192', 'до 15 тыс'];
    const recent = () => store.get('recent', []);
    const remember = (q) => { if (q.trim().length > 1) store.set('recent', [q, ...recent().filter((x) => x !== q)].slice(0, 4)); };

    const setActive = (i) => {
      links.forEach((l) => l.classList.remove('is-a'));
      active = i;
      if (links[i]) { links[i].classList.add('is-a'); links[i].scrollIntoView({ block: 'nearest' }); input.setAttribute('aria-activedescendant', links[i].id); }
    };

    const q2url = (q) => `catalog.html?q=${encodeURIComponent(q)}`;
    const row = (href, inner, cls = '') => `<a class="pal__i ${cls}" role="option" href="${href}">${inner}</a>`;

    function render() {
      const q = input.value.trim();
      let html = '';
      und.hidden = true;
      if (!q) {
        const rec = recent();
        if (rec.length) html += `<p class="pal__h">Вы искали</p>` + rec.map((r) => row(q2url(r), `<span class="pal__q">${esc(r)}</span>`)).join('');
        html += `<p class="pal__h">Часто ищут</p>` + POPULAR.map((r) => row(q2url(r), `<span class="pal__q">${esc(r)}</span>`)).join('');
        html += `<p class="pal__h">Разделы</p>` + CD.cats.slice(0, 4).map((c) => row(`catalog.html?cat=${c.id}`, `<span class="pal__sg">${CD.sigSvg(c.id, 44, 20, 2)}</span><span class="pal__q">${c.name}</span>`)).join('');
      } else {
        const r = CD.search.run(q);
        if (r.cons.length || r.fixed) {
          und.hidden = false;
          und.innerHTML = (r.fixed ? `<span>Раскладка исправлена, ищем «${esc(r.fixed)}»</span>` : '') + r.cons.map((c) => `<i>${esc(c.label)}</i>`).join('');
        }
        const nq = CD.search.norm(q);
        const cats = CD.cats.filter((c) => !r.cons.length && (CD.search.norm(c.name).includes(nq) || c.alias.split(' ').some((a) => a.startsWith(nq))));
        if (cats.length) html += `<p class="pal__h">Разделы</p>` + cats.slice(0, 2).map((c) => row(`catalog.html?cat=${c.id}`, `<span class="pal__sg">${CD.sigSvg(c.id, 44, 20, 2)}</span><span class="pal__q">${c.name}</span>`)).join('');
        if (r.hits.length) {
          html += `<p class="pal__h">Приборы</p>` + r.hits.slice(0, 6).map(({ p }) => {
            const c = CD.catOf(p.cat);
            return row(`product.html?id=${p.id}`, `<span class="pal__fig">${CD.figure(p)}</span><span class="pal__t"><b>${p.name}</b><span>${c.one} · ${p.brand} · ${c.schema.filter((s) => s.c).slice(0, 2).map((s) => CD.val(p, s)).join(' · ')}</span></span><span class="pal__p">${CD.price(p.price)}</span>`);
          }).join('');
          html += row(q2url(q), `<span class="pal__q"><b>Все результаты</b>, ${r.hits.length} ${CD.plural(r.hits.length, 'прибор', 'прибора', 'приборов')}</span>${ICON.arrow}`, 'pal__all');
        } else {
          html += `<div class="pal__zero"><p class="pal__ol">OL</p><p>Вне предела. По запросу «${esc(q)}» приборов нет. Попробуйте убрать один параметр или начните с типа прибора</p></div>`;
          html += POPULAR.slice(0, 3).map((x) => row(q2url(x), `<span class="pal__q">${esc(x)}</span>`)).join('');
        }
      }
      list.innerHTML = html;
      links = $$('.pal__i', list);
      links.forEach((l, i) => { l.id = 'pal-opt-' + i; });
      setActive(q && links.length ? 0 : -1);
    }

    let t;
    input.addEventListener('input', () => { clearTimeout(t); t = setTimeout(render, 90); });

    CD.openPalette = (preset = '') => {
      input.value = preset;
      render();
      if (!dlg.open) dlg.showModal();
      input.focus();
      input.setSelectionRange(preset.length, preset.length);
    };
    const close = () => dlg.close();

    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive(Math.min(active + 1, links.length - 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(Math.max(active - 1, 0)); }
      else if (e.key === 'Enter') {
        e.preventDefault();
        remember(input.value.trim());
        if (links[active]) location.href = links[active].href;
        else if (input.value.trim()) location.href = q2url(input.value.trim());
      }
    });
    list.addEventListener('click', () => remember(input.value.trim()));
    dlg.addEventListener('click', (e) => { if (e.target === dlg || e.target.closest('[data-pal-close]')) close(); });

    document.addEventListener('click', (e) => { if (e.target.closest('[data-pal-open]')) CD.openPalette(); });
    document.addEventListener('keydown', (e) => {
      const tag = (e.target.tagName || '').toLowerCase();
      const typing = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable;
      if ((e.key === '/' && !typing) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) { e.preventDefault(); CD.openPalette(); }
    });
  }

  /* Общие клики и счётчики */
  function wire() {
    document.addEventListener('click', (e) => {
      const add = e.target.closest('[data-add]');
      if (add) {
        const p = CD.byId(add.dataset.add);
        CD.cart.add(p.id);
        add.classList.remove('is-done'); void add.offsetWidth; add.classList.add('is-done');
        CD.toast(`${p.name} в корзине`, { label: 'Открыть корзину', fn: () => { location.href = 'cart.html'; } });
      }
    });
    document.addEventListener('change', (e) => { const c = e.target.closest('input[data-compare]'); if (c) CD.compare.toggle(c.dataset.compare); });

    const update = () => {
      $$('[data-count-cart]').forEach((e) => (e.textContent = CD.cart.count()));
      $$('[data-count-compare]').forEach((e) => (e.textContent = CD.compare.list().length));
      $$('[data-stamp-mass]').forEach((e) => (e.textContent = CD.cart.mass().toLocaleString('ru-RU', { maximumFractionDigits: 1 })));
      CD.syncCompare();
    };
    document.addEventListener('cd:cart', update);
    document.addEventListener('cd:compare', update);
    update();

    /* Ховеры только там, где есть мышь */
    if (matchMedia('(hover:hover) and (pointer:fine)').matches) document.body.classList.add('hoverable');
  }

  /* Ревилы. Страница объявляет тип, скрипт только вешает класс */
  CD.reveal = (root = document) => {
    const els = $$('[data-reveal]:not(.is-in)', root);
    if (CD.reduced || !('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('is-in')); return; }
    const io = new IntersectionObserver((list) => {
      list.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    /* Что уже на экране, показываем сразу: наблюдатель в фоновой вкладке может молчать */
    const vh = innerHeight || document.documentElement.clientHeight;
    els.forEach((e) => {
      const r = e.getBoundingClientRect();
      if (vh && r.top < vh * 0.94 && r.bottom > 0) requestAnimationFrame(() => e.classList.add('is-in'));
      else io.observe(e);
    });
    setTimeout(() => els.forEach((e) => { const r = e.getBoundingClientRect(); if (r.top < (innerHeight || 0) && r.bottom > 0) e.classList.add('is-in'); }), 400);
  };

  let started = false;
  CD.ready = new Promise((res) => {
    const start = () => { if (started) return; started = true; document.documentElement.classList.add('is-ready'); res(); };
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(start);
    setTimeout(start, 3000);
  });

  header();
  footer();
  wire();
  tray();
  palette();
  CD.ready.then(() => CD.reveal());
})();
