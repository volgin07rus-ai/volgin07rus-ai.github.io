(() => {
  const { $, $$ } = CD;
  const root = $('[data-pd]');
  const id = new URLSearchParams(location.search).get('id');
  const p = CD.byId(id);
  const ARROW = CD.icon.arrow;

  if (!p) {
    document.title = 'Прибор не найден · Цена деления';
    root.innerHTML = `<div class="ph"><nav class="crumbs" aria-label="Путь"><a href="index.html">Главная</a><a href="catalog.html">Каталог</a><span>Не найден</span></nav></div>
      <div class="zero zero--big"><p class="zero__ol" aria-hidden="true">OL</p><div><h1 class="h2">Такого прибора нет</h1><p>Возможно, модель сняли с продажи или ссылка неполная. Поищите по параметрам</p><a class="btn" href="catalog.html"><span>В каталог</span>${ARROW}</a></div></div>`;
    return;
  }

  const c = CD.catOf(p.cat);
  const same = CD.products.filter((x) => x.cat === p.cat).sort((a, b) => a.price - b.price);
  const key = [...c.schema.filter((s) => s.c), ...c.schema.filter((s) => s.t && !s.c)].slice(0, 4);
  const ship = p.stock ? (p.stock < 4 ? `Осталось ${p.stock} шт, отгрузим завтра` : 'В наличии, отгрузим завтра') : 'Под заказ, привезём за три недели';
  document.title = `${p.name}, ${c.one.toLowerCase()} ${p.brand} · Цена деления`;

  const specRows = c.schema.filter((s) => !s.hide).map((s) => `<div><dt>${s.l}</dt><dd>${CD.val(p, s)}</dd></div>`).join('') +
    `<div><dt>Габариты</dt><dd>${p.dims.join(' × ')} мм</dd></div><div><dt>Масса</dt><dd>${CD.num(p.mass)} кг</dd></div>` +
    `<div><dt>Госреестр СИ</dt><dd>${p.reg ? 'Внесён, можно поверить' : 'Не внесён'}</dd></div><div><dt>Гарантия</dt><dd>${p.price > 50000 ? 36 : 24} мес</dd></div>`;

  const views = [['Фото', CD.figure(p)]];
  const tasks = CD.tasks.filter((t) => p.tasks.includes(t.id));
  const canVerify = p.reg && c.verify;
  const idx = same.indexOf(p);

  root.innerHTML = `
  <div class="ph"><nav class="crumbs" aria-label="Путь"><a href="index.html">Главная</a><a href="catalog.html">Каталог</a><a href="catalog.html?cat=${c.id}">${c.name}</a><span>${p.name}</span></nav></div>
  <div class="pd__top">
    <div class="pd__gal">
      <div class="pd__fig" style="view-transition-name:pd-${p.id}" data-fig>${views[0][1]}</div>
      ${views.length > 1 ? `<div class="pd__th" role="tablist" aria-label="Изображения">
        ${views.map(([l, h], i) => `<button type="button" role="tab" aria-selected="${!i}" data-th="${i}">${h}<span>${l}</span></button>`).join('')}
      </div>` : ''}
    </div>
    <div class="pd__buy">
      <p class="tile__meta">${c.one} · ${p.brand} · арт. ${1001 + CD.products.indexOf(p)}${p.isNew ? ' · <em>Новинка</em>' : ''}</p>
      <h1 class="mon pd__name" style="--len:${p.name.length}">${p.name}</h1>
      <p class="lead">${p.short}</p>
      <dl class="pd__key" style="--k:${key.length === 4 ? 2 : key.length}">${key.map((s) => `<div><dt>${s.l}</dt><dd>${CD.val(p, s)}</dd></div>`).join('')}</dl>
      <div class="pd__pr"><b data-total>${CD.price(p.price)}</b><span class="st${p.stock ? '' : ' st--off'}">${ship}</span></div>
      ${canVerify ? `<label class="chk pd__vf"><input type="checkbox" data-verify><i></i><span><b>Поверка до отгрузки, +${CD.price(c.verify)}</b><small>Запись в ФГИС «Аршин», отгрузка на 3 рабочих дня позже</small></span></label>` : ''}
      <div class="pd__act">
        <button class="btn" type="button" data-buy><span>В корзину</span>${ARROW}</button>
        <label class="chk pd__cmp"><input type="checkbox" data-compare="${p.id}"><i></i><span>Сравнить</span></label>
      </div>
      <ul class="pd__facts"><li>Счёт и закрывающие документы для юрлиц</li><li>Доставка по России от 1 дня</li><li>14 дней на возврат</li></ul>
    </div>
  </div>

  <section class="pd__sec" aria-labelledby="h-spec">
    <h2 class="h3" id="h-spec">Характеристики</h2>
    <dl class="specs">${specRows}</dl>
  </section>

  ${p.cat === 'scope' ? `<section class="pd__sec" aria-labelledby="h-mq">
    <div><h2 class="h3" id="h-mq">Как ${p.name} покажет меандр</h2><p class="txt">Двигайте частоту и смотрите, как полоса сглаживает фронты. Пунктир показывает идеальный сигнал</p><a class="line" href="guide.html?id=polosa"><span>Шпаргалка про полосу</span>${ARROW}</a></div>
    <div class="mq" data-mq></div></section>` : ''}

  <section class="pd__sec pd__two" aria-label="Комплект и задачи">
    <div><h2 class="h3">В комплекте</h2><ul class="kit">${CD.kit[p.cat].map((k, i) => `<li><span>${String(i + 1).padStart(2, '0')}</span>${k}</li>`).join('')}</ul></div>
    <div><h2 class="h3">Подойдёт для задач</h2><ul class="kit">${tasks.map((t) => `<li><a href="podbor.html?task=${t.id}"><b>${t.name}</b><span>${t.text}</span>${ARROW}</a></li>`).join('')}</ul></div>
  </section>

  <section class="pd__sec pd__lad" aria-labelledby="h-lad">
    <div class="sec-row"><h2 class="h3" id="h-lad">Вся линейка по цене</h2>
      ${same.length > 1 ? '<button type="button" class="line" data-cmp-n><span>Сравнить с соседями</span>' + ARROW + '</button>' : ''}</div>
    <ol class="lad" style="--n:${same.length}">${same.map((x) => {
      const ms = c.schema.find((s) => s.c);
      return `<li class="${x === p ? 'is-cur' : ''}"><a href="product.html?id=${x.id}"${x === p ? ' aria-current="page"' : ''}><i></i><b>${x.name}</b><span>${CD.val(x, ms)}</span><span>${CD.price(x.price)}</span></a></li>`;
    }).join('')}</ol>
  </section>`;

  /* Галерея: если у прибора появится несколько фото, переключатель уже готов */
  const fig = $('[data-fig]');
  $$('[data-th]').forEach((b) => b.addEventListener('click', () => {
    $$('[data-th]').forEach((x) => x.setAttribute('aria-selected', x === b));
    fig.innerHTML = views[+b.dataset.th][1];
  }));

  /* Цена с поверкой */
  const vf = $('[data-verify]'), total = $('[data-total]');
  vf && vf.addEventListener('change', () => { total.textContent = CD.price(p.price + (vf.checked ? c.verify : 0)); });
  $('[data-buy]').addEventListener('click', (e) => {
    CD.cart.add(p.id, !!(vf && vf.checked));
    const b = e.currentTarget;
    b.classList.remove('is-done'); void b.offsetWidth; b.classList.add('is-done');
    CD.toast(`${p.name} в корзине${vf && vf.checked ? ', с поверкой' : ''}`, { label: 'Открыть корзину', fn: () => { location.href = 'cart.html'; } });
  });

  const nb = $('[data-cmp-n]');
  nb && nb.addEventListener('click', () => {
    const ids = same.slice(Math.max(0, idx - 1), Math.max(0, idx - 1) + 3).map((x) => x.id);
    CD.compare.save(ids);
    location.href = 'compare.html';
  });

  const mq = $('[data-mq]');
  mq && CD.meander(mq, p.specs.bw);
  CD.syncCompare();
})();
