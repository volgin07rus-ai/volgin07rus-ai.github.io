/* Общее для всех страниц: шапка, курсор, поиск, оглавление, лист книги, корзина */
window.Site = (() => {
  'use strict';

  const D = window.YAT, M = window.YAT_M, MORE = window.YAT_MORE || {};
  const page = document.body.dataset.page || '';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  const cover = b => `assets/books/${b.id}.webp`;
  const thumb = b => `assets/books/s/${b.id}.webp`;
  const spine = b => `assets/books/sp/${b.id}.webp`;
  const secName = id => D.sections.find(s => s.id === id).name;

  const LOGO = `<a class="logo" href="./" aria-label="${D.brand}, к полке"><span class="logo__a">${D.brand}</span><span class="logo__b">Книжная лавка</span></a>`;
  const NAV = [
    { key: 'about', label: 'О лавке', href: 'about.html' },
    { key: 'info', label: 'Покупателям', href: 'info.html' },
    { key: 'sell', label: 'Продать книги', href: 'sell.html' },
    { key: 'slovar', label: 'Словарь', href: 'slovar.html' }
  ];
  const ICON_S = '<svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><circle cx="6" cy="6" r="4.6"/><path d="M9.6 9.6L13 13"/></svg>';

  function chrome() {
    const bar = $('[data-bar]');
    if (bar) {
      bar.className = 'bar';
      bar.innerHTML = `
        <div class="bar__l">
          <div class="find" role="search" data-find>
            ${ICON_S}
            <label class="sr" for="q">Поиск по книгам</label>
            <input id="q" type="search" placeholder="Автор, название, год" autocomplete="off" enterkeyhint="search" data-q>
            <kbd aria-hidden="true">/</kbd>
            <button type="button" class="find__x" data-q-x aria-label="Очистить поиск">×</button>
            <button type="button" class="find__open" data-q-open aria-label="Открыть поиск"></button>
          </div>
          <button type="button" class="box lbl tocbtn" data-toc-open>Оглавление</button>
        </div>
        ${LOGO}
        <div class="bar__r">
          <nav class="bar__links" aria-label="Разделы">
            ${page === 'shelf' ? '' : '<a class="lbl ulink" href="./">Полка</a>'}
            ${NAV.map(n => `<a class="lbl ulink" href="${n.href}"${n.key === page ? ' aria-current="page"' : ''}>${n.label}</a>`).join('')}
          </nav>
          <button type="button" class="box lbl menubtn" data-menu-open>Меню</button>
          <button type="button" class="box lbl cartbtn" data-bag-open aria-label="Открыть корзину"><span>Корзина</span><b data-bag-count>0</b></button>
        </div>`;
    }

    document.body.insertAdjacentHTML('beforeend', `
      <div class="grain" aria-hidden="true"></div>
      <div class="cur" aria-hidden="true" data-cur><div class="cur__r"></div><div class="cur__d"></div><div class="cur__l"><span>Открыть</span><span>книгу</span></div></div>
      <div class="results" data-results role="listbox" aria-label="Результаты поиска"></div>
      <nav class="mnav" data-mnav aria-label="Меню">
        <button type="button" class="box lbl mnav__close" data-menu-close>Закрыть</button>
        <a href="./">Полка</a>
        <button type="button" data-toc-open style="font:inherit;text-align:left"><span style="font-family:var(--serif);font-size:42px;line-height:1.15;display:block;padding:8px 0;border-bottom:1px solid var(--hair)">Оглавление</span></button>
        ${NAV.map(n => `<a href="${n.href}">${n.label}</a>`).join('')}
      </nav>
      <section class="toc" data-toc aria-label="Оглавление каталога"></section>
      <div class="peek" data-peek aria-hidden="true"><img alt=""></div>
      <div class="scrim" data-scrim></div>
      <aside class="bag" data-bag aria-label="Корзина"></aside>
      <div class="toast lbl" data-toast role="status" aria-live="polite"></div>
      <div class="wipe" data-wipe aria-hidden="true"></div>`);
  }

  /* Шторка между страницами */
  function wipes() {
    const w = $('[data-wipe]');
    if (document.documentElement.classList.contains('is-arriving')) {
      document.documentElement.classList.replace('is-arriving', 'is-wiping');
      requestAnimationFrame(() => {
        w.animate([{ transform: 'scaleY(1)', transformOrigin: 'top' }, { transform: 'scaleY(0)', transformOrigin: 'top' }], { duration: 620, easing: 'cubic-bezier(.76,0,.18,1)', fill: 'both' })
          .finished.then(() => { document.documentElement.classList.remove('is-wiping'); w.getAnimations().forEach(a => a.cancel()); });
      });
    }
    if (reduced) return;
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target) return;
      const u = new URL(a.href, location.href);
      if (u.origin !== location.origin || (u.pathname === location.pathname && u.hash)) return;
      if (a.getAttribute('href').startsWith('#')) return;
      e.preventDefault();
      w.animate([{ transform: 'scaleY(0)', transformOrigin: 'bottom' }, { transform: 'scaleY(1)', transformOrigin: 'bottom' }], { duration: 480, easing: 'cubic-bezier(.76,0,.18,1)', fill: 'forwards' })
        .finished.then(() => { try { sessionStorage.setItem('yat-wipe', '1'); } catch (err) { /* приватный режим */ } location.href = a.href; });
    });
  }

  /* Курсор */
  const cursorApi = { override: null };
  function initCursor() {
    if (!fine) return;
    document.documentElement.classList.add('has-cursor');
    const el = $('[data-cur]');
    let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my, base = '', shown = '', last = performance.now();
    addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      mx = e.clientX; my = e.clientY;
      const t = e.target;
      if (!t.closest) return;
      if (t.closest('input, textarea')) base = 'text';
      else if (t.closest('a, button, label, summary, select, [role="button"]')) base = 'btnish';
      else base = '';
    }, { passive: true });
    const tick = now => {
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      const a = 1 - Math.exp(-16 * dt);
      cx += (mx - cx) * a; cy += (my - cy) * a;
      el.style.transform = `translate3d(${cx.toFixed(1)}px,${cy.toFixed(1)}px,0)`;
      const st = cursorApi.override || base;
      if (st !== shown) { el.className = 'cur' + (st ? ' ' + st : ''); shown = st; }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    cursorApi.pos = () => [mx, my];
  }

  /* Корзина */
  const KEY = 'yat-bag-v1';
  let items = [];
  try { items = JSON.parse(localStorage.getItem(KEY) || '[]').filter(id => D.byId[id] && !D.byId[id].sold); } catch (err) { items = []; }
  const saveBag = () => { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (err) { /* приватный режим */ } };
  const inBag = id => items.includes(id);
  const bagListeners = new Set();

  function toast(t) {
    const n = $('[data-toast]');
    n.textContent = t;
    n.classList.add('is-on');
    clearTimeout(toast.t);
    toast.t = setTimeout(() => n.classList.remove('is-on'), 2600);
  }

  function paintBuy() {
    $$('[data-bag-count]').forEach(n => { n.textContent = items.length; });
    $$('[data-buy]').forEach(b => {
      const id = b.dataset.buy, on = inBag(id);
      const label = b.querySelector('[data-buy-label]');
      if (label) label.textContent = on ? 'В корзине' : 'В корзину';
      b.classList.toggle('is-in', on);
      b.setAttribute('aria-pressed', String(on));
    });
    bagListeners.forEach(f => f());
  }

  function bagToggle(id) {
    const b = D.byId[id];
    if (!b || b.sold) return;
    if (inBag(id)) { items = items.filter(x => x !== id); toast('Убрали из корзины'); }
    else { items.push(id); toast(`${b.t} в корзине`); }
    saveBag(); paintBuy(); paintBag();
  }

  let bagMode = 'list';
  function paintBag() {
    const el = $('[data-bag]');
    const sum = items.reduce((s, id) => s + D.byId[id].price, 0);
    const head = `<div class="bag__head"><h2 class="bag__h">Корзина</h2><button type="button" class="box lbl" data-bag-close>Закрыть</button></div>`;
    if (bagMode === 'done') {
      el.innerHTML = `${head}<div class="bag__list"><p class="bag__empty">Заказ принят. Перезвоним в течение часа и договоримся о доставке.</p></div>
        <div class="bag__foot"><button type="button" class="btn lbl" data-bag-close>К полке</button></div>`;
      return;
    }
    if (bagMode === 'form' && items.length) {
      el.innerHTML = `${head}
        <form class="bag__list" data-order novalidate style="display:flex;flex-direction:column;gap:14px;padding-top:18px;padding-bottom:18px">
          <div class="field"><label class="lbl" for="o-name">Имя</label><input class="input" id="o-name" name="name" autocomplete="name" required><span class="field__err">Напишите, как к вам обращаться</span></div>
          <div class="field"><label class="lbl" for="o-tel">Телефон</label><input class="input" id="o-tel" name="tel" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 999 000-00-00" required><span class="field__err">Нужен номер из 10 цифр и больше</span></div>
          <div class="field"><label class="lbl" for="o-way">Как получить</label><select class="input" id="o-way" name="way"><option>Забрать на Литейном</option><option>Курьером по Петербургу</option><option>СДЭК до пункта выдачи</option><option>Почтой России</option></select></div>
          <div class="field"><label class="lbl" for="o-note">Комментарий</label><textarea class="input" id="o-note" name="note" placeholder="Необязательно"></textarea></div>
        </form>
        <div class="bag__foot">
          <div class="bag__sum"><span class="lbl">${D.pieces(items.length)}</span><b>${D.money(sum)}</b></div>
          <button type="button" class="btn btn--fill lbl" data-order-send>Отправить заказ</button>
          <button type="button" class="lbl" data-bag-back style="height:28px">Назад к списку</button>
        </div>`;
      return;
    }
    bagMode = 'list';
    const rows = items.map(id => {
      const b = D.byId[id];
      return `<div class="bag__row"><img src="${thumb(b)}" alt="" loading="lazy"><div><button type="button" class="bag__t" data-open="${b.id}">${esc(b.t)}</button><span class="bag__a lbl">${esc(b.a)}, ${b.y}</span></div>
        <div><span class="bag__p">${D.money(b.price)}</span><button type="button" class="bag__rm lbl" data-buy-x="${b.id}">Убрать</button></div></div>`;
    }).join('');
    el.innerHTML = `${head}<div class="bag__list">${rows || '<p class="bag__empty">Пока пусто. На полке стоит девяносто шесть книг, и каждая в одном экземпляре.</p>'}</div>
      ${items.length ? `<div class="bag__foot"><div class="bag__sum"><span class="lbl">${D.pieces(items.length)}</span><b>${D.money(sum)}</b></div><button type="button" class="btn btn--fill lbl" data-order>Оформить заказ</button><p class="bag__note">Каждая книга существует в одном экземпляре. Держим бронь сутки</p></div>` : ''}`;
  }

  function bagOpen(open) {
    $('[data-bag]').classList.toggle('is-open', open);
    $('[data-scrim]').classList.toggle('is-open', open);
    if (open) { bagMode = 'list'; paintBag(); }
  }

  function sendOrder() {
    const f = $('[data-bag] form');
    if (!f) return;
    let bad = null;
    const mark = (name, ok) => { const w = f.elements[name].closest('.field'); w.classList.toggle('is-bad', !ok); if (!ok && !bad) bad = f.elements[name]; };
    mark('name', f.elements.name.value.trim().length > 1);
    mark('tel', f.elements.tel.value.replace(/\D/g, '').length >= 10);
    if (bad) { bad.focus(); return; }
    items = []; saveBag(); bagMode = 'done'; paintBuy(); paintBag();
  }

  /* Поиск */
  const rawNorm = s => String(s).toLowerCase().replace(/ё/g, 'е').replace(/ѣ/g, 'е');
  const hayCache = new Map();
  function hay(b) {
    if (!hayCache.has(b.id)) {
      hayCache.set(b.id, D.norm([b.t, b.old, b.a, b.as, b.pub, b.city, b.y, secName(b.sec), D.eraOf(b.y).name, D.bindings[b.bind], ...b.tags.map(t => D.tags[t]), b.d, MORE[b.id] || ''].join(' ')));
    }
    return hayCache.get(b.id);
  }
  function searchBooks(q) {
    let text = D.norm(q).trim(), max = 0;
    const pm = text.match(/(?:^|\s)до\s*(\d[\d\s]*)\s*(?:р|₽|руб\w*)?(?=\s|$)/);
    if (pm) { max = parseInt(pm[1].replace(/\s/g, ''), 10); text = text.replace(pm[0], ' ').trim(); }
    const tokens = text.split(/\s+/).filter(Boolean);
    const out = [];
    for (const b of D.books) {
      if (max && b.price > max) continue;
      const h = hay(b);
      if (!tokens.every(t => h.includes(t))) continue;
      const nt = D.norm(b.t), na = D.norm(b.a);
      let score = 0;
      for (const t of tokens) {
        if (nt.startsWith(t)) score += 8;
        else if (nt.includes(t)) score += 5;
        if (na.includes(t)) score += 6;
        if (String(b.y) === t) score += 6;
      }
      if (b.sold) score -= 2;
      out.push([score, b]);
    }
    return out.sort((a, b) => b[0] - a[0] || a[1].y - b[1].y).map(x => x[1]);
  }

  const lev = (a, b) => {
    const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) dp[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return dp[a.length][b.length];
  };
  const dict = [...new Set(D.books.flatMap(b => [b.as, ...b.t.split(/[\s,-]+/)]).filter(w => w.length > 3))];
  function didYouMean(q) {
    const w = D.norm(q).trim().split(/\s+/).filter(t => t !== 'до' && !/^\d+$/.test(t)).sort((a, b) => b.length - a.length)[0];
    if (!w || w.length < 3) return '';
    let best = '', d = 3;
    for (const x of dict) { const v = lev(w, D.norm(x)); if (v < d) { d = v; best = x; } }
    return best;
  }

  function mark(text, tokens) {
    const low = rawNorm(text);
    let at = -1, len = 0;
    for (const t of tokens) { const i = low.indexOf(t); if (i >= 0 && t.length > len) { at = i; len = t.length; } }
    if (at < 0) return esc(text);
    return esc(text.slice(0, at)) + '<mark>' + esc(text.slice(at, at + len)) + '</mark>' + esc(text.slice(at + len));
  }

  let resIdx = -1, resList = [];
  const res = () => $('[data-results]');
  function paintResults(q) {
    const el = res();
    const mobileHead = `<div class="results__m"><input type="search" placeholder="Автор, название, год" data-q2 value="${esc(q)}" aria-label="Поиск по книгам" autocomplete="off"><button type="button" class="box lbl" data-q-close>Закрыть</button></div>`;
    if (!q.trim()) {
      resList = [];
      const chips = ['Булгаков', 'Стругацкие', 'первое издание', 'старая орфография', 'Academia', 'до 2000', '1928', 'автограф'];
      el.innerHTML = `${mobileHead}<div class="sug"><span class="sug__t lbl">Попробуйте</span>${chips.map(c => `<button type="button" class="box lbl" data-q-chip="${esc(c)}">${esc(c)}</button>`).join('')}</div>`;
      return;
    }
    const found = searchBooks(q);
    resList = found.slice(0, 8);
    resIdx = -1;
    const tokens = rawNorm(q).trim().split(/\s+/).filter(t => t && t !== 'до' && !/^\d+$/.test(t));
    if (!found.length) {
      const dm = didYouMean(q);
      el.innerHTML = `${mobileHead}<p class="nores">Такой книги на полке нет.${dm ? ` Может быть, <button type="button" data-q-chip="${esc(dm)}">${esc(dm)}</button>?` : ' Напишите нам, мы часто находим нужное за неделю.'}</p>`;
      return;
    }
    el.innerHTML = `${mobileHead}<div class="results__head lbl"><span>${D.pieces(found.length)}</span><span>Enter откроет первую</span></div>` + resList.map((b, i) => `
      <button type="button" class="res${b.sold ? ' is-sold' : ''}" role="option" data-pick="${b.id}" data-i="${i}">
        <img src="${thumb(b)}" alt="" loading="lazy">
        <span><span class="res__t">${mark(b.t, tokens)}</span><span class="res__a lbl">${mark(b.a, tokens)}, ${b.y}</span></span>
        <span class="res__p">${b.sold ? 'Продано' : D.money(b.price)}</span>
      </button>`).join('');
  }
  function resOpen(open) {
    res().classList.toggle('is-open', open);
    if (open && matchMedia('(max-width: 767px)').matches) setTimeout(() => $('[data-q2]')?.focus(), 60);
  }
  function setQuery(q) {
    const i = $('[data-q]');
    if (i) i.value = q;
    $('[data-find]')?.classList.toggle('has-q', !!q);
    paintResults(q);
  }

  const api = { onPick: null };
  function pick(id, how) {
    resOpen(false);
    const i = $('[data-q]');
    if (i) i.blur();
    tocOpen(false);
    if (api.onPick) api.onPick(id, how);
    else openBook(id);
  }

  function initSearch() {
    const input = $('[data-q]');
    if (!input) return;
    let timer = 0;
    const onType = v => { $('[data-find]').classList.toggle('has-q', !!v); clearTimeout(timer); timer = setTimeout(() => { paintResults(v); resOpen(true); }, 140); };
    input.addEventListener('input', () => onType(input.value));
    input.addEventListener('focus', () => { paintResults(input.value); resOpen(true); });
    document.addEventListener('input', e => { if (e.target.matches('[data-q2]')) { input.value = e.target.value; onType(e.target.value); } });
    const key = e => {
      if (e.key === 'Escape') { resOpen(false); e.target.blur(); return; }
      const opts = $$('.res', res());
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!opts.length) return;
        resIdx = (resIdx + (e.key === 'ArrowDown' ? 1 : -1) + opts.length) % opts.length;
        opts.forEach((o, i) => { o.classList.toggle('is-on', i === resIdx); o.setAttribute('aria-selected', String(i === resIdx)); });
        opts[resIdx].scrollIntoView({ block: 'nearest' });
      }
      if (e.key === 'Enter') { e.preventDefault(); const t = resList[Math.max(0, resIdx)]; if (t) pick(t.id, 'search'); }
    };
    input.addEventListener('keydown', key);
    document.addEventListener('keydown', e => { if (e.target.matches('[data-q2]')) key(e); });
    document.addEventListener('pointerdown', e => {
      if (!res().classList.contains('is-open')) return;
      if (e.target.closest('[data-results], [data-find]')) return;
      resOpen(false);
    });
    document.addEventListener('keydown', e => {
      if (e.key === '/' && !e.target.matches('input, textarea, select')) { e.preventDefault(); input.focus(); }
    });
  }

  /* Оглавление */
  const tocState = { sec: 'all', sort: 'year', stock: false };
  function tocGroups(list) {
    if (tocState.sort === 'price') {
      const bands = [[0, 2000, 'До 2 000 ₽'], [2000, 10000, 'От 2 000 до 10 000 ₽'], [10000, 50000, 'От 10 000 до 50 000 ₽'], [50000, 1e9, 'От 50 000 ₽']];
      return bands.map(([a, b, name]) => ({ name, items: list.filter(x => x.price >= a && x.price < b).sort((p, q) => p.price - q.price) }));
    }
    if (tocState.sort === 'author') {
      const sorted = [...list].sort((a, b) => a.as.localeCompare(b.as, 'ru') || a.y - b.y);
      const map = new Map();
      sorted.forEach(b => { const l = b.as[0].toUpperCase(); if (!map.has(l)) map.set(l, []); map.get(l).push(b); });
      return [...map].map(([name, items]) => ({ name, items }));
    }
    return D.eras.map(e => ({ name: e.name, items: list.filter(b => b.y >= e.from && b.y <= e.to) }));
  }
  function paintToc() {
    const el = $('[data-toc]');
    const base = D.books.filter(b => !tocState.stock || !b.sold);
    const list = base.filter(b => tocState.sec === 'all' || b.sec === tocState.sec);
    const pills = [{ id: 'all', name: 'Все' }, ...D.sections].map(s => {
      const n = s.id === 'all' ? base.length : base.filter(b => b.sec === s.id).length;
      return `<button type="button" class="pill lbl" data-toc-sec="${s.id}" aria-pressed="${tocState.sec === s.id}"${n ? '' : ' disabled'}>${s.name}<em>${n}</em></button>`;
    }).join('');
    let num = 0;
    const groups = tocGroups(list).filter(g => g.items.length).map(g => `
      <div class="toc__group">
        <div class="toc__era lbl"><span>${g.name}</span><span>${D.pieces(g.items.length)}</span></div>
        ${g.items.map(b => `<button type="button" class="toc__row${b.sold ? ' is-sold' : ''}" data-pick="${b.id}" data-peek-id="${b.id}">
          <span class="toc__n">${++num}</span><span class="toc__a">${esc(b.a)}</span><span class="toc__t">${esc(b.t)}</span><span class="toc__y">${b.y}</span><span class="toc__c">${D.conditions[b.c].name}</span><span class="toc__p">${b.sold ? 'Продано' : D.money(b.price)}</span>
        </button>`).join('')}
      </div>`).join('');
    el.innerHTML = `
      <div class="toc__top"><button type="button" class="box lbl" style="justify-self:start" data-toc-close>Закрыть</button>${LOGO}<span></span></div>
      <div class="toc__body">
        <h2 class="toc__h">Оглавление</h2>
        <div class="toc__tools">
          <div class="pills">${pills}</div>
          <label class="sel lbl">Порядок <select data-toc-sort aria-label="Порядок книг">
            <option value="year"${tocState.sort === 'year' ? ' selected' : ''}>По годам</option>
            <option value="author"${tocState.sort === 'author' ? ' selected' : ''}>По авторам</option>
            <option value="price"${tocState.sort === 'price' ? ' selected' : ''}>По цене</option>
          </select></label>
          <label class="sel lbl"><input type="checkbox" data-toc-stock${tocState.stock ? ' checked' : ''}> Только в наличии</label>
        </div>
        ${groups || '<p class="toc__empty">В этом разделе пока ничего нет</p>'}
      </div>`;
  }
  function tocOpen(open) {
    const el = $('[data-toc]');
    if (open) { paintToc(); el.scrollTop = 0; $('[data-mnav]').classList.remove('is-open'); }
    el.classList.toggle('is-open', open);
    if (!open) $('[data-peek]').classList.remove('is-on');
  }
  function initPeek() {
    if (!fine) return;
    const p = $('[data-peek]'), img = p.firstElementChild;
    let cur = '';
    addEventListener('pointermove', e => {
      const row = e.target.closest && e.target.closest('[data-peek-id]');
      if (!row) { if (cur) { p.classList.remove('is-on'); cur = ''; } return; }
      const id = row.dataset.peekId;
      if (id !== cur) { cur = id; img.src = thumb(D.byId[id]); p.classList.add('is-on'); }
      const x = Math.min(innerWidth - 190, e.clientX + 26), y = clamp(e.clientY - 130, 90, innerHeight - 280);
      p.style.transform = `translate3d(${x}px,${y}px,0)`;
    }, { passive: true });
  }

  /* Лист книги */
  const BLOBS = [[150, 330, 0], [340, 600, 120], [250, 120, 220], [90, 760, 300], [400, 250, 360], [260, 860, 420], [230, 470, 180]];
  const PARTS = ['Корешок', 'Крышки', 'Углы', 'Блок', 'Бумага'];
  let det = null, opened = null, pushed = false, srcRect = null, lastFocus = null, inkRaf = 0;

  function buildDetail() {
    det = document.createElement('div');
    det.className = 'detail';
    det.setAttribute('role', 'dialog');
    det.setAttribute('aria-modal', 'true');
    det.setAttribute('aria-labelledby', 'd-title');
    det.tabIndex = -1;
    document.body.append(det);
  }

  const seeded = (id, i) => { let h = 7 + i * 31; for (const c of id) h = (h * 33 + c.charCodeAt(0)) >>> 0; return h / 4294967296; };
  const near = b => {
    const same = D.books.filter(x => x.id !== b.id && x.sec === b.sec).sort((p, q) => Math.abs(p.y - b.y) - Math.abs(q.y - b.y));
    return same.slice(0, 4);
  };

  function fillDetail(b) {
    const m = M[b.id];
    const orph = b.old !== b.t || b.tags.includes('old') ? 'Дореформенная' : 'Современная';
    const longText = (MORE[b.id] || '').split('\n').filter(Boolean);
    const cond = D.conditions[b.c];
    const parts = PARTS.map((p, i) => {
      const v = clamp(Math.round(b.c + (seeded(b.id, i) - .35) * 1.3), 1, 5);
      return `<span class="lbl">${p}</span><span class="state__s" aria-label="${v} из 5">${[1, 2, 3, 4, 5].map(n => `<i class="${n <= v ? 'on' : ''}"></i>`).join('')}</span>`;
    }).join('');
    const line = (cls, html, tag = 'p') => `<span class="m"><${tag} class="${cls}">${html}</${tag}></span>`;
    det.style.setProperty('--ca', m.ca);
    const posterH = Math.round(474 / m.ca);
    det.innerHTML = `
      <div class="detail__top">
        <button type="button" class="box lbl" style="justify-self:start" data-d-close>Закрыть</button>
        ${LOGO}
        <div class="detail__nav">
          <button type="button" class="box lbl" data-d-step="-1" aria-label="Предыдущая книга">←</button>
          <button type="button" class="box lbl" data-d-step="1" aria-label="Следующая книга">→</button>
        </div>
      </div>
      <div class="detail__grid">
        <div class="detail__copy">
          ${line('detail__sub lbl', `${esc(b.old || b.t)} / ${esc(b.a)}`)}
          ${line('detail__title', esc(b.t), 'h1').replace('<h1 ', '<h1 id="d-title" ')}
          ${line('detail__meta lbl', `${b.y} / ${esc(b.city)} / ${esc(b.pub)}`)}
          <span class="m"><div class="detail__text"><p>${esc(b.d)}</p></div></span>
          ${line('detail__note', `Состояние: ${cond.name.toLowerCase()}. ${esc(b.f)}`)}
          <span class="m"><div class="buy">
            <span class="buy__price${b.sold ? ' is-sold' : ''}">${b.sold ? 'Продано' : D.money(b.price)}</span>
            ${b.sold ? '<a class="btn lbl" href="info.html#find">Найти такую же</a>' : `<button type="button" class="btn btn--fill lbl" data-buy="${b.id}"><span data-buy-label>В корзину</span></button>`}
          </div></span>
          ${b.tags.length ? `<span class="m"><div class="tagrow">${b.tags.map(t => `<span class="box tag lbl">${D.tags[t]}</span>`).join('')}</div></span>` : ''}
          ${longText[0] ? `<span class="m"><section class="spec"><h3 class="lbl">О чём книга</h3><div class="detail__text spec__text"><p>${esc(longText[0])}</p></div></section></span>` : ''}
          ${longText[1] ? `<span class="m"><section class="spec"><h3 class="lbl">Автор и издание</h3><div class="detail__text spec__text"><p>${esc(longText[1])}</p></div></section></span>` : ''}
          <span class="m"><section class="spec"><h3 class="lbl">Библиографическое описание</h3><dl>
            ${[['Автор', b.a], ['Издательство', b.pub], ['Город и год', `${b.city}, ${b.y}`], ['Объём', `${b.p} ${D.plural(b.p, ['страница', 'страницы', 'страниц'])}`], ['Высота', `${b.h} см`], ['Переплёт', D.bindings[b.bind]], ['Орфография', orph], ['Раздел', secName(b.sec)]].map(([k, v]) => `<div class="spec__row"><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}
          </dl></section></span>
          <span class="m"><section class="spec"><h3 class="lbl">Состояние экземпляра</h3>
            <div class="state">${parts}</div>
            <p class="state__n" style="margin-top:8px">${esc(b.f)}. ${cond.note}</p>
          </section></span>
          <span class="m"><section class="spec"><h3 class="lbl">С этой же полки</h3><div class="near">
            ${near(b).map(x => `<button type="button" data-d-go="${x.id}"><img src="${thumb(x)}" alt="" loading="lazy"><span>${esc(x.t)}</span><small>${x.sold ? 'Продано' : D.money(x.price)}</small></button>`).join('')}
          </div></section></span>
        </div>
        <div class="detail__poster">
          <svg viewBox="0 0 474 ${posterH}" aria-hidden="true">
            <defs>
              <filter id="ink" x="-30%" y="-30%" width="160%" height="160%"><feTurbulence type="fractalNoise" baseFrequency=".011" numOctaves="3" seed="7" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="120" xChannelSelector="R" yChannelSelector="G"/></filter>
              <mask id="inkm" maskUnits="userSpaceOnUse" x="-200" y="-200" width="874" height="${posterH + 400}"><g filter="url(#ink)" fill="#fff">
                ${BLOBS.map(([x, y]) => `<circle cx="${x}" cy="${Math.round(y * posterH / 900)}" r="0"/>`).join('')}
              </g></mask>
            </defs>
            <image href="${cover(b)}" x="0" y="0" width="474" height="${posterH}" preserveAspectRatio="none" mask="url(#inkm)"/>
          </svg>
        </div>
      </div>`;
    paintBuy();
  }

  function ink() {
    cancelAnimationFrame(inkRaf);
    const cs = $$('circle', det);
    const start = performance.now() + (reduced ? -5000 : 520);
    const tick = now => {
      let live = false;
      cs.forEach((c, i) => {
        const p = clamp((now - start - BLOBS[i][2]) / 1250, 0, 1);
        const e = 1 - Math.pow(1 - p, 3);
        c.setAttribute('r', (e * 720).toFixed(1));
        if (p < 1) live = true;
      });
      if (live) inkRaf = requestAnimationFrame(tick);
    };
    inkRaf = requestAnimationFrame(tick);
  }

  function rise(delay = 620) {
    $$('.m > *', det).forEach((n, i) => {
      n.animate([{ transform: 'translateY(112%)' }, { transform: 'translateY(0)' }], {
        duration: reduced ? 1 : 900, delay: reduced ? 0 : delay + Math.min(i, 9) * 75, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'both'
      });
    });
  }

  const setBehind = v => $$('main, [data-bar], [data-sitefoot]').forEach(n => { n.inert = v; });
  const insetOf = r => `inset(${r.top}px ${Math.max(0, innerWidth - r.right)}px ${Math.max(0, innerHeight - r.bottom)}px ${r.left}px round 3px)`;
  const defaultRect = () => { const w = 220, h = 330; return { left: innerWidth / 2 - w / 2, right: innerWidth / 2 + w / 2, top: innerHeight / 2 - h / 2, bottom: innerHeight / 2 + h / 2 }; };

  function openBook(id, rect, opts = {}) {
    const b = D.byId[id];
    if (!b) return;
    if (!det) buildDetail();
    if (opened) { swapBook(id); return; }
    opened = b;
    lastFocus = document.activeElement;
    srcRect = rect || defaultRect();
    fillDetail(b);
    det.scrollTop = 0;
    det.style.visibility = 'visible';
    const r = srcRect;
    det.style.transformOrigin = `${(r.left + r.right) / 2}px ${(r.top + r.bottom) / 2}px`;
    det.animate([{ clipPath: insetOf(r), transform: 'rotate(-4.5deg)' }, { clipPath: 'inset(0px 0px 0px 0px round 0px)', transform: 'rotate(0deg)' }], {
      duration: reduced ? 1 : 1050, easing: 'cubic-bezier(.76,0,.18,1)', fill: 'both'
    });
    rise();
    ink();
    document.documentElement.style.overflow = 'hidden';
    setBehind(true);
    det.focus({ preventScroll: true });
    document.title = `${b.t}, ${b.a} · ${D.brand}`;
    if (!opts.silent) {
      const u = new URL(location.href); u.searchParams.set('book', id);
      history.pushState({ book: id }, '', u); pushed = true;
    }
    (api.onOpen || (() => {}))(b);
  }

  function swapBook(id) {
    const b = D.byId[id];
    if (!b || !opened) return;
    opened = b;
    fillDetail(b);
    det.scrollTop = 0;
    rise(60);
    ink();
    document.title = `${b.t}, ${b.a} · ${D.brand}`;
    const u = new URL(location.href); u.searchParams.set('book', id);
    history.replaceState({ book: id }, '', u);
    (api.onSwap || (() => {}))(b);
  }

  function closeBook(fromPop) {
    if (!opened) return;
    const b = opened;
    opened = null;
    const r = (api.rectFor && api.rectFor(b)) || srcRect || defaultRect();
    const done = () => { det.getAnimations({ subtree: true }).forEach(a => a.cancel()); det.style.visibility = 'hidden'; cancelAnimationFrame(inkRaf); };
    det.getAnimations().forEach(a => { a.commitStyles?.(); a.cancel(); });
    det.style.transformOrigin = `${(r.left + r.right) / 2}px ${(r.top + r.bottom) / 2}px`;
    det.animate([{ clipPath: 'inset(0px 0px 0px 0px round 0px)', transform: 'rotate(0deg)' }, { clipPath: insetOf(r), transform: 'rotate(-4.5deg)' }], {
      duration: reduced ? 1 : 850, easing: 'cubic-bezier(.76,0,.18,1)', fill: 'both'
    }).finished.then(done);
    document.documentElement.style.overflow = '';
    setBehind(false);
    document.title = baseTitle;
    if (!fromPop) {
      if (pushed) { pushed = false; history.back(); }
      else { const u = new URL(location.href); u.searchParams.delete('book'); history.replaceState(null, '', u); }
    } else pushed = false;
    (api.onClose || (() => {}))(b);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  const baseTitle = document.title;

  function stepBook(dir) {
    if (!opened) return;
    const i = D.books.indexOf(opened);
    swapBook(D.books[(i + dir + D.books.length) % D.books.length].id);
  }

  /* События */
  function bind() {
    document.addEventListener('click', e => {
      const hit = s => e.target.closest(s);
      let n;
      if ((n = hit('[data-buy]'))) { bagToggle(n.dataset.buy); return; }
      if ((n = hit('[data-buy-x]'))) { bagToggle(n.dataset.buyX); return; }
      if ((n = hit('[data-pick]'))) { pick(n.dataset.pick, n.closest('[data-toc]') ? 'toc' : 'search'); return; }
      if ((n = hit('[data-q-chip]'))) { setQuery(n.dataset.qChip); $('[data-q]').focus(); resOpen(true); return; }
      if (hit('[data-q-x]')) { setQuery(''); $('[data-q]').focus(); return; }
      if (hit('[data-q-open]')) { paintResults($('[data-q]').value); resOpen(true); return; }
      if (hit('[data-q-close]')) { resOpen(false); return; }
      if (hit('[data-toc-open]')) { tocOpen(true); return; }
      if (hit('[data-toc-close]')) { tocOpen(false); return; }
      if ((n = hit('[data-toc-sec]'))) { tocState.sec = n.dataset.tocSec; const st = $('[data-toc]').scrollTop; paintToc(); $('[data-toc]').scrollTop = Math.min(st, 180); return; }
      if (hit('[data-menu-open]')) { $('[data-mnav]').classList.add('is-open'); return; }
      if (hit('[data-menu-close]')) { $('[data-mnav]').classList.remove('is-open'); return; }
      if (hit('[data-bag-open]')) { bagOpen(true); return; }
      if (hit('[data-bag-close]') || hit('[data-scrim]')) { bagOpen(false); return; }
      if (hit('[data-bag-back]')) { bagMode = 'list'; paintBag(); return; }
      if (hit('[data-order-send]')) { sendOrder(); return; }
      if (hit('button[data-order]')) { bagMode = 'form'; paintBag(); return; }
      if ((n = hit('[data-open]'))) { bagOpen(false); openBook(n.dataset.open); return; }
      if (hit('[data-d-close]')) { closeBook(); return; }
      if ((n = hit('[data-d-step]'))) { stepBook(Number(n.dataset.dStep)); return; }
      if ((n = hit('[data-d-go]'))) { swapBook(n.dataset.dGo); return; }
    });
    document.addEventListener('change', e => {
      if (e.target.matches('[data-toc-sort]')) { tocState.sort = e.target.value; paintToc(); }
      if (e.target.matches('[data-toc-stock]')) { tocState.stock = e.target.checked; paintToc(); }
    });
    document.addEventListener('submit', e => { if (e.target.matches('[data-order]')) { e.preventDefault(); sendOrder(); } });
    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      if ($('[data-bag]').classList.contains('is-open')) { bagOpen(false); return; }
      if ($('[data-toc]').classList.contains('is-open')) { tocOpen(false); return; }
      if ($('[data-mnav]').classList.contains('is-open')) { $('[data-mnav]').classList.remove('is-open'); return; }
      if (opened) closeBook();
    });
    addEventListener('popstate', () => {
      const id = new URLSearchParams(location.search).get('book');
      if (opened && !id) closeBook(true);
      else if (id && !opened && D.byId[id]) openBook(id, null, { silent: true });
    });
  }

  /* Появления на обычных страницах */
  function reveals() {
    const nodes = $$('[data-rise], [data-clip]');
    if (reduced || !('IntersectionObserver' in window)) { nodes.forEach(n => n.classList.add('is-in')); return; }
    const io = new IntersectionObserver(list => list.forEach(it => { if (it.isIntersecting) { it.target.classList.add('is-in'); io.unobserve(it.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: .05 });
    nodes.forEach(n => io.observe(n));
    setTimeout(() => nodes.forEach(n => { if (n.getBoundingClientRect().top < innerHeight) n.classList.add('is-in'); }), 1400);
  }

  chrome();
  wipes();
  initCursor();
  paintBuy();
  paintBag();
  initSearch();
  initPeek();
  bind();
  document.addEventListener('DOMContentLoaded', reveals);
  if (document.readyState !== 'loading') reveals();

  /* Прямая ссылка на книгу с любой страницы, кроме полки */
  if (page !== 'shelf') {
    const id = new URLSearchParams(location.search).get('book');
    if (id && D.byId[id]) setTimeout(() => openBook(id, null, { silent: true }), 120);
  }

  return Object.assign(api, { cover, thumb, spine, esc, $, $$, clamp, reduced, fine, cursor: cursorApi, openBook, closeBook, isOpen: () => !!opened, bagToggle, inBag, onBag: f => bagListeners.add(f), overlay: () => $('[data-toc]').classList.contains('is-open') || $('[data-bag]').classList.contains('is-open') || $('[data-mnav]').classList.contains('is-open') || res().classList.contains('is-open') });
})();
