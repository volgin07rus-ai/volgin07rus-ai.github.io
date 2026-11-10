/* Общее для всех страниц: шапка, подвал, корзина, тост, плитка товара, появления */
window.Site = (() => {
  'use strict';

  const D = window.RW;
  const page = document.body.dataset.page || '';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* Шапка и подвал */
  const NAV = [
    { key: 'home', label: 'Главная', href: './' },
    { key: 'catalog', label: 'Каталог', href: 'catalog.html' },
    { key: 'looks', label: 'Образы', href: 'looks.html' },
    { key: 'info', label: 'Покупателям', href: 'info.html' }
  ];

  /* Логотип DEAL: вектор, обведённый по исходной картинке */
  const INK = '#0e0e0e', PINK = '#f2c5dc';
  const LOGO_MARK = "<path fill=\"#0e0e0e\" fill-rule=\"evenodd\" d=\"M137.5 0.3C135.6 0.4 133.7 0.6 131.8 1C130 1.5 128.2 2.1 126.6 2.9C124.9 3.7 123.2 4.7 121.7 5.8C120.2 7 118.8 8.3 117.5 9.8C116.2 11.2 115.1 12.8 114.2 14.4C113.2 16 112.4 17.7 111.7 19.4C111.1 21.2 110.6 23 110.2 24.9C109.7 26.7 109.5 28.6 109.1 30.5C108.7 32.4 108.4 34.3 107.9 36.1C107.3 37.9 106.7 39.6 105.8 41.3C104.9 42.9 103.8 44.5 102.6 45.9C101.3 47.3 99.9 48.6 98.3 49.7C96.8 50.8 95.1 51.7 93.4 52.4C91.7 53.1 89.8 53.6 88 53.9C86.1 54.2 84.2 54.3 82.3 54.2C80.4 54.1 78.5 53.8 76.7 53.3C74.9 52.8 73.1 52.2 71.4 51.3C69.8 50.4 68.2 49.4 66.7 48.2C65.2 47 63.8 45.6 62.6 44.1C61.4 42.6 60.4 41 59.6 39.3C58.7 37.7 58.2 35.9 57.7 34C57.2 32.2 57 30.3 56.6 28.4C56.2 26.5 56 24.6 55.5 22.8C55.1 20.9 54.7 19.1 54 17.4C53.3 15.6 52.4 13.9 51.3 12.4C50.3 10.8 49 9.3 47.7 8C46.3 6.6 44.8 5.4 43.2 4.4C41.6 3.4 39.9 2.5 38.1 1.9C36.4 1.3 34.5 0.9 32.6 0.7C30.7 0.5 28.7 0.4 26.8 0.6C24.9 0.7 23 1 21.2 1.5C19.4 2 17.6 2.7 16 3.6C14.3 4.4 12.7 5.5 11.3 6.7C9.8 7.9 8.4 9.3 7.2 10.8C6 12.2 4.9 13.8 4 15.4C3 17.1 2.3 18.8 1.7 20.6C1.1 22.3 0.6 24.2 0.4 26.1C0.2 28 0.2 30 0.4 31.9C0.6 33.8 1 35.7 1.5 37.5C2.1 39.2 2.9 41 3.9 42.5C4.9 44.1 6 45.7 7.4 47C8.7 48.4 10.2 49.6 11.8 50.6C13.3 51.6 15.1 52.4 16.8 53C18.5 53.7 20.4 54.2 22.2 54.6C24.1 55.1 26 55.3 27.8 55.7C29.7 56.1 31.6 56.4 33.4 57C35.2 57.5 36.9 58.2 38.6 59.1C40.3 59.9 41.9 61 43.3 62.2C44.8 63.4 46.2 64.8 47.3 66.3C48.5 67.8 49.6 69.4 50.4 71.1C51.3 72.7 52 74.4 52.6 76.2C53.1 78 53.6 79.9 53.8 81.8C54 83.7 54.1 85.7 53.9 87.5C53.7 89.4 53.3 91.3 52.6 93C52 94.8 51.2 96.5 50.1 98.1C49.1 99.6 47.8 101.1 46.5 102.4C45.1 103.7 43.5 104.8 41.9 105.7C40.3 106.7 38.5 107.4 36.8 108C35 108.6 33.1 108.9 31.2 109.3C29.4 109.6 27.4 109.9 25.6 110.3C23.7 110.7 21.8 111 20 111.6C18.3 112.2 16.6 113 14.9 113.9C13.3 114.9 11.8 116 10.3 117.3C8.9 118.6 7.6 120.1 6.4 121.6C5.2 123.1 4.2 124.7 3.4 126.4C2.5 128.1 1.9 129.8 1.4 131.6C0.9 133.4 0.5 135.3 0.4 137.2C0.2 139.1 0.3 141.1 0.6 143C0.8 144.9 1.3 146.7 2 148.5C2.7 150.2 3.6 151.9 4.6 153.4C5.6 155 6.9 156.5 8.3 157.8C9.6 159.1 11.2 160.2 12.8 161.1C14.4 162 16.2 162.7 18 163.3C19.8 163.9 21.7 164.2 23.6 164.5C25.4 164.7 27.4 164.8 29.3 164.7C31.2 164.6 33.1 164.3 34.9 163.9C36.7 163.4 38.5 162.8 40.2 162C41.9 161.2 43.5 160.2 45 159C46.5 157.9 47.9 156.5 49.1 155.1C50.4 153.7 51.5 152.1 52.4 150.5C53.3 148.8 54 147.1 54.5 145.3C55.1 143.5 55.4 141.6 55.7 139.7C56.1 137.8 56.2 135.9 56.4 133.9C56.6 132 56.7 130 56.9 128C57.1 126.1 57.4 124.2 57.7 122.3C58.1 120.4 58.5 118.6 59 116.7C59.4 114.9 60 113.1 60.6 111.3C61.2 109.5 61.8 107.8 62.5 106C63.2 104.3 64 102.6 64.8 100.9C65.6 99.2 66.5 97.6 67.5 95.9C68.4 94.3 69.4 92.7 70.5 91.1C71.6 89.6 72.8 88 74 86.5C75.2 85 76.4 83.5 77.7 82C79 80.6 80.4 79.2 81.8 77.9C83.3 76.5 84.8 75.2 86.3 74C87.8 72.8 89.3 71.6 90.9 70.5C92.4 69.3 94 68.2 95.6 67.2C97.2 66.2 98.9 65.3 100.5 64.4C102.2 63.6 103.9 62.7 105.6 62C107.3 61.2 109 60.6 110.8 59.9C112.6 59.3 114.4 58.8 116.2 58.3C118 57.8 119.9 57.5 121.8 57.1C123.7 56.8 125.6 56.5 127.5 56.2C129.4 56 131.4 55.8 133.3 55.6C135.3 55.4 137.2 55.3 139.1 55C141 54.7 142.9 54.4 144.8 53.9C146.6 53.4 148.3 52.7 150 51.9C151.7 51.1 153.3 50.1 154.8 48.9C156.3 47.8 157.7 46.4 158.9 45C160.1 43.5 161.3 41.9 162.2 40.3C163.1 38.7 163.8 36.9 164.3 35.1C164.8 33.3 165.2 31.4 165.3 29.5C165.5 27.6 165.5 25.6 165.2 23.7C165 21.8 164.5 20 163.9 18.2C163.3 16.4 162.4 14.7 161.5 13.1C160.5 11.6 159.3 10 158 8.7C156.7 7.3 155.2 6 153.6 5C152.1 3.9 150.4 3 148.7 2.3C147 1.6 145.2 1 143.3 0.7C141.4 0.4 139.4 0.3 137.5 0.3Z\"/><circle fill=\"#f2c5dc\" cx=\"121.4\" cy=\"120.0\" r=\"44.3\"/>";
  const LOGO_WORD = [{"k": "D", "box": "208.1 41.3 96.7 83.7", "d": "M211.1 41.3H254C286 41.3 304.8 57 304.8 83.15C304.8 109.3 286 125 254 125H211.1Q208.1 125 208.1 122V44.3Q208.1 41.3 211.1 41.3ZM238.4 62.3V104H253C267 104 274.6 96.5 274.6 83.15C274.6 69.8 267 62.3 253 62.3Z"}, {"k": "E", "box": "319.4 41.3 70 83.7", "d": "M319.4 44.3Q319.4 41.3 322.4 41.3L386 41.3Q389 41.3 389 44.3L389 58.3Q389 61.3 386 61.3L350.4 61.3Q347.4 61.3 347.4 64.3L347.4 70.7Q347.4 73.7 350.4 73.7L379 73.7Q382 73.7 382 76.7L382 89.7Q382 92.7 379 92.7L350.4 92.7Q347.4 92.7 347.4 95.7L347.4 102Q347.4 105 350.4 105L386.4 105Q389.4 105 389.4 108L389.4 122Q389.4 125 386.4 125L322.4 125Q319.4 125 319.4 122Z"}, {"k": "A", "box": "401.1 41.3 98.7 83.7", "d": "M435 44.1Q436.2 41.3 439.2 41.3L462.1 41.3Q465.1 41.3 466.2 44.1L498.7 122.2Q499.8 125 496.8 125L471.7 125Q468.7 125 467.4 122.3L464.7 116.3Q463.4 113.6 460.4 113.6L440.4 113.6Q437.4 113.6 436.1 116.3L433 122.3Q431.7 125 428.7 125L404.1 125Q401.1 125 402.3 122.2ZM450 79.6Q450.5 78.5 451 79.6L455.7 90.9Q456.2 92 455 92L446 92Q444.8 92 445.3 90.9Z"}, {"k": "L", "box": "510.1 41.3 75.7 83.7", "d": "M510.1 44.3Q510.1 41.3 513.1 41.3L537.3 41.3Q540.3 41.3 540.3 44.3L540.3 101.6Q540.3 104.6 543.3 104.6L582.8 104.6Q585.8 104.6 585.8 107.6L585.8 122Q585.8 125 582.8 125L513.1 125Q510.1 125 510.1 122Z"}];
  const LOGO = `<svg viewBox="0 0 585.8 165.3" aria-hidden="true" focusable="false">${LOGO_MARK}${LOGO_WORD.map(l => `<path fill="${l.k === 'E' ? PINK : INK}" fill-rule="evenodd" d="${l.d}"/>`).join('')}</svg>`;
  const WATERMARK = LOGO_WORD.map(l => `<svg viewBox="${l.box}" fill="currentColor" fill-rule="evenodd" aria-hidden="true" focusable="false"><path d="${l.d}"/></svg>`).join('');

  function renderChrome() {
    const header = document.querySelector('[data-site-header]');
    if (header) {
      header.innerHTML = `
        <a href="./" class="brand" aria-label="${D.brand}, на главную">${LOGO}</a>
        <nav aria-label="Основная навигация">
          ${NAV.map(n => `<a href="${n.href}" data-nav="${n.key}"${n.key === page ? ' aria-current="page"' : ''}>${n.label}</a>`).join('')}
        </nav>
        <button id="open-bag" type="button" aria-label="Открыть корзину">
          <svg width="22" height="24" viewBox="0 0 24 26" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M4 8h16l1 16H3L4 8zM8 8V6a4 4 0 0 1 8 0v2"/></svg>
          <span data-cart-count>0</span>
        </button>`;
    }

    const footer = document.querySelector('[data-site-footer]');
    if (footer) {
      footer.innerHTML = `
        <div class="site-footer__grid">
          <div class="site-footer__about">
            <p class="site-footer__title">${D.brand}</p>
            <p class="site-footer__lead">Привозим Nike, Jordan и другие бренды <span style="white-space:nowrap">из-за</span> рубежа. Смотри образы на подиуме, выбирай размер и складывай в корзину</p>
          </div>
          <nav class="site-footer__col" aria-label="Каталог">
            <p class="site-footer__label">Каталог</p>
            <a href="catalog.html">Вся одежда</a>
            <a href="catalog.html?cat=shoes">Обувь</a>
            <a href="catalog.html?cat=hoodie">Худи</a>
            <a href="catalog.html?cat=denim">Джинсы</a>
          </nav>
          <nav class="site-footer__col" aria-label="Покупателям">
            <p class="site-footer__label">Покупателям</p>
            <a href="info.html#delivery">Доставка</a>
            <a href="info.html#returns">Возврат</a>
            <a href="info.html#sizes">Таблица размеров</a>
            <a href="info.html#faq">Вопросы</a>
          </nav>
          <nav class="site-footer__col" aria-label="Подборки">
            <p class="site-footer__label">Подборки</p>
            <a href="./">На подиуме</a>
            <a href="looks.html">Все образы</a>
            <a href="catalog.html?new=1">Новинки</a>
          </nav>
        </div>
        <div class="site-footer__mark" aria-hidden="true">${WATERMARK}</div>
        <div class="site-footer__legal">
          <span>Демо-версия сайта. Заказы и оплата пока не принимаются</span>
          <span>© ${new Date().getFullYear()} ${D.brand}. Товарные знаки принадлежат правообладателям, ${D.brand} не официальный представитель брендов</span>
          <a class="site-footer__credit" href="https://volgin.site/" target="_blank" rel="noopener">Разработано volgin.site</a>
        </div>`;
    }
  }

  /* Картинка товара: готовый снимок или кадр со снимка модели */
  function pic(p, opts = {}) {
    const sizes = opts.sizes || '(min-width: 1100px) 26vw, (min-width: 750px) 40vw, 90vw';
    const eager = opts.eager ? 'eager' : 'lazy';
    if (p.crop) {
      const c = p.crop, l = D.looks[c.look];
      return `<span class="crop" style="--bw:${c.bw};--bh:${c.bh};--x0:${c.x0};--y0:${c.y0}"><img src="${l.src}" srcset="${l.src} 640w, ${l.orig} 1080w" sizes="${sizes}" width="1080" height="1920" alt="${esc(p.name)}" loading="${eager}" decoding="async"></span>`;
    }
    const contain = p.real ? ' tile__pic--pack' : p.cat === 'shoes' ? ' tile__pic--contain' : '';
    return `<img class="tile__pic${contain}" src="${p.img}" width="${p.w}" height="${p.h}" alt="${esc(p.name)}" loading="${eager}" decoding="async">`;
  }

  const productUrl = p => `product.html?id=${encodeURIComponent(p.id)}`;

  /* Плитка в каталоге, на главной и в похожих товарах */
  function tile(p, i = 0, opts = {}) {
    const url = productUrl(p);
    const tag = p.isNew ? '<span class="rw__tag"><span class="rw__tag-text">Новинка</span></span>' : '';
    const dots = D.colors[p.color];
    return `
      <article class="tile" data-tile data-id="${p.id}" style="--i:${i}">
        <div class="tile__frame">
          <a class="tile__media" href="${url}" tabindex="-1" aria-hidden="true" data-cursor="Смотри">${pic(p, opts)}</a>
          ${tag}
          <div class="tile__quick" data-tile-quick hidden>
            <p class="tile__quick-title">${p.legend}</p>
            <div class="tile__quick-sizes">
              ${p.variants.map(v => `<button type="button" class="rw__pill-label tile__size" data-tile-size="${v.id}" aria-label="Добавить ${esc(p.name)}, размер ${v.o[0]}">${v.o[0]}</button>`).join('')}
            </div>
          </div>
        </div>
        <div class="tile__info">
          <div class="tile__text">
            <span class="tile__type">${esc(p.vendor)}</span>
            <a class="tile__name" href="${url}">${esc(p.name)}</a>
            <span class="tile__price"><span>${D.money(p.price)}</span><span class="tile__swatch" style="background:${dots.hex}" title="${dots.name}"></span></span>
          </div>
          <button type="button" class="rw__add" data-tile-add aria-expanded="false" aria-label="Выбрать размер: ${esc(p.name)}">
            <svg class="rw__add-plus" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M12 4v16M4 12h16"/></svg>
            <svg class="rw__add-check" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4.5 12.5l5 5L19.5 7"/></svg>
            <svg class="rw__add-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 3a9 9 0 1 1-9 9"/></svg>
          </button>
        </div>
      </article>`;
  }

  /* Корзина: хранится на устройстве, общая для всех страниц */
  const KEY = 'runway-styling-bag-v3';
  const bag = (() => {
    let entries = [];

    function read() {
      try {
        const v = JSON.parse(localStorage.getItem(KEY) || '[]');
        if (!Array.isArray(v)) return [];
        return v
          .filter(e => e && Number.isSafeInteger(e.id) && Number.isSafeInteger(e.quantity) && e.quantity >= 1 && e.quantity <= 20 && D.variant(e.id))
          .slice(0, 50);
      } catch (err) {
        return [];
      }
    }
    function save() {
      try { localStorage.setItem(KEY, JSON.stringify(entries)); } catch (err) { /* приватный режим */ }
    }
    function count() { return entries.reduce((s, e) => s + e.quantity, 0); }

    function paintCount() {
      document.querySelectorAll('[data-cart-count]').forEach(n => { n.textContent = count(); });
    }

    function render() {
      paintCount();
      const list = document.getElementById('bag-items');
      if (!list) return;
      if (!entries.length) {
        list.innerHTML = '<p class="bag-note">Корзина пуста. Выбери размер рядом с вещью, чтобы сохранить её. <a href="catalog.html">Открыть каталог</a></p>';
      } else {
        list.innerHTML = entries.map(e => {
          const { product: p, variant: v } = D.variant(e.id);
          return `
            <div class="bag-row">
              <span class="bag-row__pic">${pic(p, { sizes: '120px' })}</span>
              <div>
                <h3>${esc(p.name)}</h3>
                <p>Размер ${v.o[0]} · Количество ${e.quantity} · ${D.money(p.price)}</p>
                <a class="bag-row__link" href="${productUrl(p)}">Открыть товар</a>
              </div>
              <button type="button" class="bag-row__rm" data-bag-remove="${e.id}" aria-label="Удалить ${esc(p.name)}">×</button>
            </div>`;
        }).join('');
      }
      const total = entries.reduce((s, e) => s + D.variant(e.id).product.price * e.quantity, 0);
      document.getElementById('bag-total').textContent = entries.length ? `Итого ${D.money(total)}` : '';
      document.getElementById('buy-bag').disabled = !entries.length;
      demoNote('');
    }

    /* Демо-версия: кнопка «Купить» ничего не скачивает и не оформляет, только объясняет это */
    function demoNote(text) {
      const n = document.getElementById('bag-demo');
      if (!n) return;
      n.textContent = text;
      n.classList.toggle('is-on', !!text);
    }
    function buy() {
      if (!entries.length) return;
      demoNote('Это демо-версия сайта. Оплата пока не подключена, заказ не оформлен');
    }

    async function add(items) {
      for (const it of items) {
        const hit = D.variant(it.id);
        if (!hit || !hit.variant.a) throw new Error('Выбери доступный размер');
        const e = entries.find(x => x.id === it.id);
        if (e) e.quantity = Math.min(20, e.quantity + 1);
        else entries.push({ id: it.id, quantity: 1 });
      }
      save();
      render();
      toast(items.length > 1 ? 'Образ в корзине' : 'Вещь в корзине');
    }

    function remove(id) {
      entries = entries.filter(e => e.id !== id);
      save();
      render();
    }

    function init() { entries = read(); render(); }
    function reload() { entries = read(); render(); }

    return { init, reload, add, remove, render, buy };
  })();

  function renderBagShell() {
    const dlg = document.getElementById('bag-dialog');
    if (!dlg) return;
    dlg.innerHTML = `
      <div class="bag-heading">
        <h2>Твоя корзина</h2>
        <button id="close-bag" type="button" aria-label="Закрыть корзину">×</button>
      </div>
      <p class="bag-note">Корзина хранится на этом устройстве</p>
      <div id="bag-items"></div>
      <p id="bag-total"></p>
      <button id="buy-bag" type="button">Купить</button>
      <p id="bag-demo" class="bag-demo" role="status" aria-live="polite"></p>`;

    document.getElementById('open-bag')?.addEventListener('click', () => { bag.render(); dlg.showModal(); });
    document.getElementById('close-bag').addEventListener('click', () => dlg.close());
    document.getElementById('buy-bag').addEventListener('click', () => bag.buy());
    dlg.addEventListener('click', e => {
      const rm = e.target.closest('[data-bag-remove]');
      if (rm) { bag.remove(Number(rm.dataset.bagRemove)); return; }
      const r = dlg.getBoundingClientRect();
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (!inside && e.target === dlg) dlg.close();
    });
  }

  /* Тост */
  let toastTimer = 0;
  function toast(text) {
    const n = document.getElementById('bag-status');
    if (!n) return;
    n.textContent = text;
    n.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => n.classList.remove('is-on'), 2500);
  }

  /* Быстрое добавление с плитки */
  function closeQuick(except) {
    document.querySelectorAll('[data-tile].is-picking').forEach(t => {
      if (t === except) return;
      t.classList.remove('is-picking');
      t.querySelector('[data-tile-quick]').hidden = true;
      t.querySelector('[data-tile-add]').setAttribute('aria-expanded', 'false');
    });
  }

  function bindTiles() {
    document.addEventListener('click', async e => {
      const add = e.target.closest('[data-tile-add]');
      if (add) {
        const t = add.closest('[data-tile]');
        if (t.classList.contains('is-loading') || t.classList.contains('is-added')) return;
        const open = !t.classList.contains('is-picking');
        closeQuick(t);
        t.classList.toggle('is-picking', open);
        t.querySelector('[data-tile-quick]').hidden = !open;
        add.setAttribute('aria-expanded', String(open));
        if (open) t.querySelector('.tile__size')?.focus({ preventScroll: true });
        return;
      }
      const size = e.target.closest('[data-tile-size]');
      if (size) {
        const t = size.closest('[data-tile]');
        closeQuick();
        t.classList.add('is-loading');
        await new Promise(r => setTimeout(r, reduced ? 0 : 240));
        try {
          await bag.add([{ id: Number(size.dataset.tileSize), quantity: 1 }]);
          t.classList.add('is-added');
          setTimeout(() => t.classList.remove('is-added'), 1800);
        } catch (err) {
          toast(err.message);
        } finally {
          t.classList.remove('is-loading');
        }
        return;
      }
      if (!e.target.closest('[data-tile-quick]')) closeQuick();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeQuick(); });
  }

  /* Появление по скроллу */
  let io = null;
  function reveal(root = document) {
    const nodes = root.querySelectorAll('[data-reveal]:not(.is-in), [data-stagger]:not(.is-in)');
    if (reduced || !('IntersectionObserver' in window)) { nodes.forEach(n => n.classList.add('is-in')); return; }
    io = io || new IntersectionObserver(items => items.forEach(it => {
      if (!it.isIntersecting) return;
      it.target.classList.add('is-in');
      io.unobserve(it.target);
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    nodes.forEach(n => io.observe(n));
  }

  /* Круглый курсор над карточками, только для мыши */
  function initCursor() {
    if (reduced || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (document.body.dataset.noCursor !== undefined) return;
    const el = document.createElement('div');
    el.className = 'site-cursor';
    el.innerHTML = '<span class="site-cursor__in"></span>';
    document.body.append(el);
    document.documentElement.classList.add('has-cursor');
    const label = el.firstElementChild;
    let x = 0, y = 0, tx = 0, ty = 0, raf = 0, on = false;
    const step = () => {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
      raf = (Math.abs(tx - x) + Math.abs(ty - y) > 0.2) ? requestAnimationFrame(step) : 0;
    };
    document.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      tx = e.clientX; ty = e.clientY;
      const hit = e.target.closest && e.target.closest('[data-cursor]');
      if (hit && !on) { x = tx; y = ty; }
      on = !!hit;
      el.classList.toggle('is-on', on);
      if (hit) label.textContent = hit.dataset.cursor;
      if (!raf) raf = requestAnimationFrame(step);
    }, { passive: true });
    document.addEventListener('pointerleave', () => { on = false; el.classList.remove('is-on'); });
  }

  /* На сколько поднять снимок, чтобы подошвы стояли на линии пола */
  const footCache = new Map();
  function feet(src) {
    if (footCache.has(src)) return footCache.get(src);
    const job = new Promise(resolve => {
      const probe = new Image();
      probe.crossOrigin = 'anonymous';
      probe.onerror = () => resolve(0);
      probe.onload = () => {
        try {
          const w = 48, h = Math.max(1, Math.round(w * probe.naturalHeight / probe.naturalWidth));
          const c = document.createElement('canvas');
          c.width = w;
          c.height = h;
          const ctx = c.getContext('2d', { willReadFrequently: true });
          ctx.drawImage(probe, 0, 0, w, h);
          const data = ctx.getImageData(0, 0, w, h).data;
          let last = h - 1;
          scan: for (; last >= 0; last--) {
            for (let x = 0; x < w; x++) if (data[(last * w + x) * 4 + 3] > 40) break scan;
          }
          resolve(Math.min(0.4, Math.max(0, (h - 1 - last) / h)));
        } catch (err) {
          resolve(0);
        }
      };
      probe.src = src;
    });
    footCache.set(src, job);
    return job;
  }

  /* Запуск */
  document.documentElement.classList.add('js');
  renderChrome();
  renderBagShell();
  bag.init();
  bindTiles();
  window.addEventListener('storage', e => { if (e.key === KEY) bag.reload(); });
  document.addEventListener('DOMContentLoaded', () => reveal());
  initCursor();
  queueMicrotask(() => reveal());

  return { bag, toast, tile, pic, reveal, esc, productUrl, feet };
})();
