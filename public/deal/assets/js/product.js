/* Карточка товара */
(() => {
  'use strict';
  const D = window.RW, S = window.Site;
  const root = document.querySelector('[data-pdp]');
  const id = new URLSearchParams(location.search).get('id');
  const p = D.byId[id];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!p) {
    document.title = `Товар не найден · ${D.brand}`;
    root.innerHTML = `
      <div class="pdp-missing">
        <h1 class="page-title">Такой вещи у нас нет.</h1>
        <p class="page-sub">Возможно, ссылка устарела. Весь ассортимент лежит в каталоге</p>
        <a class="btn-dark" href="catalog.html">Открыть каталог</a>
      </div>`;
    return;
  }

  document.title = `${p.name} · ${D.brand}`;
  const cat = D.cats.find(c => c.id === p.cat);
  const color = D.colors[p.color];
  const looks = D.looksWith(p);
  const esc = S.esc;

  /* Галерея: сам товар и образы, где он встречается */
  function modelShot({ l, index }) {
    return `
      <a class="pdp__shot pdp__shot--model" href="index.html#look-${index + 1}" data-cursor="На подиум" data-foot="${l.src}">
        <span class="pdp__cap"><span class="page-label">Образ 0${index + 1}</span><b>${esc(l.name)}</b></span>
        <span class="pdp__fig">
          <span class="rw__shadow"></span>
          <span class="rw__figure" style="display:block;--rw-ar:.5625;height:100%"><span class="rw__art" style="display:block">
            <img src="${l.src}" srcset="${l.src} 640w, ${l.orig} 1080w" sizes="(min-width: 750px) 22vw, 60vw" alt="${esc(l.name)}" loading="lazy" decoding="async">
          </span></span>
        </span>
      </a>`;
  }

  function firstShot() {
    if (!p.crop) return `<div class="pdp__shot"><img src="${p.img}" width="${p.w}" height="${p.h}" alt="${esc(p.name)}" fetchpriority="high"></div>`;
    return `<div class="pdp__shot">${S.pic(p, { sizes: '(min-width: 750px) 44vw, 90vw', eager: true })}</div>`;
  }

  function secondShot() {
    if (p.real) {
      if (p.img2) return `<div class="pdp__shot"><img src="${p.img2}" width="800" height="1000" alt="${esc(p.name)}, второй ракурс" loading="lazy" decoding="async"></div>`;
      return `<div class="pdp__shot"><img src="${p.img}" width="800" height="1000" alt="${esc(p.name)}, крупно" loading="lazy" decoding="async" style="transform:scale(1.8);transform-origin:50% 42%"></div>`;
    }
    if (!p.crop) return '';
    const c = p.crop;
    const zoom = { ...p, crop: { ...c, bw: c.bw * 0.6, bh: c.bh * 0.6, x0: 0.5 - c.bw * 0.3, y0: c.y0 + c.bh * 0.18 } };
    return `<div class="pdp__shot">${S.pic(zoom, { sizes: '(min-width: 750px) 60vw, 100vw' })}</div>`;
  }

  function mateShot() {
    if (!p.crop) return '';
    const mate = D.products.find(x => x.crop && x.look === p.look && x.id !== p.id);
    if (!mate) return '';
    return `
      <a class="pdp__shot" href="${S.productUrl(mate)}" data-cursor="Смотри">
        ${S.pic(mate, { sizes: '(min-width: 750px) 44vw, 90vw' })}
        <span class="pdp__cap pdp__cap--glass"><span class="page-label">С этим носят</span><b>${esc(mate.name)}</b></span>
      </a>`;
  }

  const gallery = [firstShot(), secondShot(), ...looks.slice(0, 3).map(modelShot), mateShot()].filter(Boolean);
  if (gallery.length % 2) gallery.push(`
    <div class="pdp__shot pdp__rest">
      <span class="pdp__rest-name">${esc(cat.name)}</span>
      <a class="line-link" href="catalog.html?cat=${cat.id}"><span>Весь раздел</span><svg width="22" height="12" viewBox="0 0 26 14" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M1 7h24M19 1l6 6-6 6"/></svg></a>
    </div>`);

  const plus = '<svg class="acc__ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M12 4v16M4 12h16"/></svg>';
  const acc = (title, body, open) => `
    <div class="acc${open ? ' is-open' : ''}">
      <button type="button" class="acc__btn" data-acc aria-expanded="${!!open}">${title}${plus}</button>
      <div class="acc__panel"><div class="acc__inner"><p>${body}</p></div></div>
    </div>`;

  root.innerHTML = `
    <div class="pdp">
      <div class="pdp__gallery">${gallery.join('')}</div>
      <div class="pdp__side">
        <div class="pdp__sticky">
          <ol class="crumbs"><li><a href="./">Главная</a></li><li><a href="catalog.html">Каталог</a></li><li><a href="catalog.html?cat=${cat.id}">${esc(cat.name)}</a></li></ol>
          <span class="pdp__type">${esc(p.vendor)}${p.isNew ? ' · Новинка' : ''}</span>
          <h1 class="pdp__name">${esc(p.name)}</h1>
          <div class="pdp__price">${D.money(p.price)}</div>
          <p class="pdp__tagline">${esc(p.desc)}</p>
          <div class="pdp__color"><i style="background:${color.hex}"></i>${color.name}</div>
          <fieldset class="pdp__sizes">
            <legend><span>${p.legend}</span><a href="info.html#sizes">Таблица размеров</a></legend>
            <div class="rw__values">
              ${p.variants.map(v => `<label class="rw__pill"><input type="radio" name="size" value="${v.id}" data-pdp-size><span class="rw__pill-label">${v.o[0]}</span></label>`).join('')}
            </div>
          </fieldset>
          <p class="pdp__msg" data-pdp-msg role="status" aria-live="polite"></p>
          <button type="button" class="btn-dark pdp__cta" data-pdp-add>
            <span data-pdp-label>В корзину</span>
            <svg class="btn-arrow" width="22" height="12" viewBox="0 0 26 14" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M1 7h24M19 1l6 6-6 6"/></svg>
            <svg class="rw__cta-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 3a9 9 0 1 1-9 9"/></svg>
          </button>
          <p class="pdp__note">Доставка от 3 дней. Примерка при получении, возврат 14 дней</p>
          <div class="acc-list">
            ${acc('Состав и посадка', `${esc(p.spec.material)}. ${esc(p.spec.fit)}`, true)}
            ${acc('Уход', esc(p.spec.care))}
            ${acc('Доставка и возврат', 'Курьером по России от 3 дней, бесплатно от 15 000 ₽. Вернуть вещь можно в течение 14 дней. Подробности в разделе <a href="info.html#delivery" style="text-decoration:underline;text-underline-offset:3px">Покупателям</a>')}
          </div>
        </div>
      </div>
    </div>
    <div data-more-blocks></div>`;

  /* Подошвы моделей на линии пола */
  root.querySelectorAll('[data-foot]').forEach(n => {
    S.feet(n.dataset.foot).then(v => n.style.setProperty('--rw-foot', v.toFixed(4)));
  });

  /* Подборки ниже */
  const seen = new Set([p.id]);
  const take = (list, max) => {
    const out = [];
    for (const x of list) {
      if (seen.has(x.id) || out.length >= max) continue;
      seen.add(x.id);
      out.push(x);
    }
    return out;
  };
  const withIt = take(looks.flatMap(({ l }) => l.items.map(i => D.byId[i])), 4);
  const similar = take([
    ...D.products.filter(x => x.cat === p.cat),
    ...D.products.slice().sort((a, b) => Math.abs(a.price - p.price) - Math.abs(b.price - p.price))
  ], 4);

  const block = (title, items, link) => items.length ? `
    <section class="more-block">
      <div class="more-block__head" data-reveal>
        <h2>${title}</h2>
        ${link || ''}
      </div>
      <div class="tile-grid tile-grid--4" data-stagger>${items.map((x, i) => S.tile(x, i, { sizes: '(min-width: 1100px) 44vw, 90vw' })).join('')}</div>
    </section>` : '';

  const arrow = '<svg width="22" height="12" viewBox="0 0 26 14" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M1 7h24M19 1l6 6-6 6"/></svg>';
  root.querySelector('[data-more-blocks]').innerHTML =
    block('С этой вещью носят', withIt, `<a class="line-link" href="looks.html"><span>Все образы</span>${arrow}</a>`) +
    block('Похожие вещи', similar, `<a class="line-link" href="catalog.html"><span>Весь каталог</span>${arrow}</a>`);

  S.reveal();

  /* Действия */
  const msg = root.querySelector('[data-pdp-msg]');
  const cta = root.querySelector('[data-pdp-add]');
  const label = root.querySelector('[data-pdp-label]');
  let resetTimer = 0;

  root.addEventListener('change', e => {
    if (e.target.matches('[data-pdp-size]')) msg.textContent = '';
  });

  root.addEventListener('click', async e => {
    const a = e.target.closest('[data-acc]');
    if (a) {
      const box = a.closest('.acc');
      const open = box.classList.toggle('is-open');
      a.setAttribute('aria-expanded', String(open));
      return;
    }
    if (!e.target.closest('[data-pdp-add]') || cta.classList.contains('is-loading')) return;
    const picked = root.querySelector('[data-pdp-size]:checked');
    if (!picked) {
      msg.textContent = 'Сначала выбери размер';
      root.querySelector('.pdp__sizes input')?.focus({ preventScroll: true });
      return;
    }
    cta.classList.add('is-loading');
    if (!reduced) await new Promise(r => setTimeout(r, 260));
    try {
      await S.bag.add([{ id: Number(picked.value), quantity: 1 }]);
      label.textContent = 'Уже в корзине';
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => { label.textContent = 'В корзину'; }, 2200);
    } catch (err) {
      msg.textContent = 'Не получилось добавить. Попробуй ещё раз';
    } finally {
      cta.classList.remove('is-loading');
    }
  });
})();
