(() => {
  const { $, $$ } = CD;
  const count = (cat) => CD.products.filter((p) => p.cat === cat).length;
  const pr = (n) => `${n} ${CD.plural(n, 'прибор', 'прибора', 'приборов')}`;
  const ARROW = CD.icon.arrow;

  /* Витрина каталога под экраном: наведение показывает сигнал раздела на экране.
     В карточке самый популярный прибор раздела, фото или чертёж */
  const inCat = (cat) => CD.products.filter((p) => p.cat === cat);
  const from = (cat) => Math.min(...inCat(cat).map((p) => p.price));
  const face = (cat) => inCat(cat).sort((a, b) => b.pop - a.pop)[0];
  const rail = $('[data-rail]');
  rail.innerHTML = CD.cats.map((c) => `<li><a href="catalog.html?cat=${c.id}" data-sig="${c.id}">
    <span class="shelf__top">${CD.sigSvg(c.id, 60, 22, 2)}${ARROW}</span>
    <span class="shelf__fig">${CD.figure(face(c.id))}</span>
    <b>${c.name}</b>
    <span class="shelf__m"><span>${pr(count(c.id))}</span><strong>от ${CD.price(from(c.id))}</strong></span>
  </a></li>`).join('');
  $('[data-shelf-all] span').textContent = `Все ${pr(CD.products.length)}`;
  if (!matchMedia('(hover:hover)').matches) $('[data-shelf-n]').textContent = 'Восемь разделов. Экран выше по очереди показывает, что меряет каждый';

  /* Осциллограф */
  const scope = CD.Scope($('[data-scope]'));
  const nameEl = $('[data-scope-name]'), cntEl = $('[data-scope-count]');
  const show = (id) => {
    scope.setSignal(id);
    nameEl.textContent = CD.catOf(id).name;
    cntEl.textContent = pr(count(id));
    $$('[data-sig]', rail).forEach((a) => a.classList.toggle('is-on', a.dataset.sig === id));
  };
  show('scope');

  const autoBtn = $('[data-auto]');
  let auto = !CD.reduced, autoT, idx = 0;
  const cycle = () => {
    clearTimeout(autoT);
    if (!auto) return;
    autoT = setTimeout(() => { idx = (idx + 1) % CD.cats.length; show(CD.cats[idx].id); cycle(); }, 4400);
  };
  const setAuto = (v) => { auto = v; autoBtn.setAttribute('aria-pressed', v); cycle(); };
  autoBtn.addEventListener('click', () => setAuto(!auto));
  autoBtn.setAttribute('aria-pressed', auto);
  CD.ready.then(cycle);

  const pick = (e) => {
    const a = e.target.closest('[data-sig]');
    if (!a) return;
    if (auto) setAuto(false);
    idx = CD.cats.findIndex((c) => c.id === a.dataset.sig);
    show(a.dataset.sig);
  };
  rail.addEventListener('pointerover', (e) => { if (e.pointerType === 'mouse') pick(e); });
  rail.addEventListener('focusin', pick);

  const run = $('[data-run]');
  run.addEventListener('click', () => {
    const on = scope.toggle();
    run.setAttribute('aria-pressed', on);
    $('span', run).textContent = on ? 'Пуск' : 'Стоп';
  });

  const fmt = (v) => v.toLocaleString('ru-RU', { maximumFractionDigits: 2 });
  CD.knob($('[data-knob="v"]'), scope.VSTEPS, scope.vi, (v) => `${fmt(v)} В`, (i) => scope.setV(i));
  CD.knob($('[data-knob="t"]'), scope.TSTEPS, scope.ti, (v) => (v < 1 ? `${fmt(v * 1000)} мкс` : `${fmt(v)} мс`), (i) => scope.setT(i));

  /* Линейка под названием */
  const hero = $('[data-hero]'), ruler = $('[data-ruler]'), rc = $('[data-ruler-cv]'), mark = $('[data-ruler-m]');
  const MM = 96 / 25.4;
  const drawRuler = () => {
    const w = ruler.clientWidth, h = ruler.clientHeight;
    if (!w || !h) return;
    const d = Math.min(devicePixelRatio || 1, 2);
    rc.width = w * d; rc.height = h * d;
    const x = rc.getContext('2d');
    x.scale(d, d);
    x.strokeStyle = x.fillStyle = getComputedStyle(ruler).color;
    x.lineWidth = 1;
    x.font = '400 9px "Martian Mono", monospace';
    for (let i = 0; i * MM <= w; i++) {
      const X = Math.round(i * MM) + 0.5;
      const l = i % 10 === 0 ? 13 : i % 5 === 0 ? 8.5 : 4.5;
      x.beginPath(); x.moveTo(X, 0); x.lineTo(X, l); x.stroke();
      if (i % 10 === 0 && i && X + 18 < w) x.fillText(String(i / 10), X + 3, 23);
    }
  };
  new ResizeObserver(drawRuler).observe(ruler);
  CD.ready.then(drawRuler);
  if (document.body.classList.contains('hoverable')) {
    hero.addEventListener('pointermove', (e) => {
      const r = ruler.getBoundingClientRect();
      const x = Math.max(0, Math.min(r.width, e.clientX - r.left));
      mark.style.transform = `translateX(${x}px)`;
      $('b', mark).textContent = `${(x / MM / 10).toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} см`;
      hero.classList.add('is-measure');
    });
    hero.addEventListener('pointerleave', () => hero.classList.remove('is-measure'));
  }

  /* Поиск на первом экране: сразу показывает, как понял запрос */
  const form = $('[data-hq]'), inp = $('#hq'), hint = $('[data-hq-hint]');
  const DEF = hint.textContent;
  let t;
  inp.addEventListener('input', () => {
    clearTimeout(t);
    t = setTimeout(() => {
      const q = inp.value.trim();
      if (!q) { hint.textContent = DEF; return; }
      const r = CD.search.run(q);
      const cons = r.cons.map((c) => `<i>${CD.esc(c.label)}</i>`).join('');
      hint.innerHTML = r.hits.length
        ? `Найдётся ${pr(r.hits.length)}${cons ? '. Поняли так ' + cons : ''}`
        : `Вне предела. Уберите один параметр${cons ? '. Сейчас ' + cons : ''}`;
    }, 140);
  });
  form.addEventListener('submit', (e) => { if (!inp.value.trim()) { e.preventDefault(); inp.focus(); } });

  /* Разрядность */
  const DIG = [
    { s: '3,30', g: 3, min: 0, cap: 'Шаг 10 мВ. Хватит проверить батарею и наличие напряжения' },
    { s: '3,302', g: 2, min: 20000, cap: 'Шаг 1 мВ. Видна просадка на стабилизаторе и дрейф источника' },
    { s: '3,3021', g: 1, min: 120000, cap: 'Шаг 100 мкВ. Для настройки опорных напряжений и АЦП' },
    { s: '3,30215', g: 0, min: 1999999, cap: 'Шаг 10 мкВ. Для метрологии и контроля партий' },
  ];
  const out = $('[data-dig-out]'), cap = $('[data-dig-cap]'), link = $('[data-dig-link]'), seg = $('[data-dig-seg]');
  const setDig = (i) => {
    const d = DIG[i];
    let k = 0;
    out.innerHTML = d.s.split('').map((ch) => (ch === ',' ? '<span class="dc">,</span>' : `<span class="dd"><i>8</i><b style="--i:${k++}">${ch}</b></span>`)).join('') + '<span class="dd"><i>8</i><b></b></span>'.repeat(d.g);
    out.setAttribute('aria-label', `${d.s} вольта`);
    cap.textContent = d.cap;
    const n = CD.products.filter((p) => p.cat === 'multimeter' && p.specs.counts >= d.min).length;
    link.href = `catalog.html?cat=multimeter${d.min ? '&counts=' + d.min : ''}`;
    $('span', link).textContent = d.min ? `Мультиметры от ${CD.num(d.min)} отсчётов, ${n}` : `Все мультиметры, ${n}`;
    $$('[data-dig]', seg).forEach((b) => b.setAttribute('aria-checked', b.dataset.dig == i));
  };
  seg.addEventListener('click', (e) => { const b = e.target.closest('[data-dig]'); if (b) setDig(+b.dataset.dig); });
  seg.addEventListener('keydown', (e) => {
    const cur = +$('[aria-checked="true"]', seg).dataset.dig;
    const m = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!m) return;
    e.preventDefault();
    const n = (cur + m + 4) % 4;
    setDig(n);
    $(`[data-dig="${n}"]`, seg).focus();
  });
  setDig(1);

  /* Подборка */
  const FEAT = ['dho814', 'ut61e-plus', 'ka3005p', 'b10', 'ts1200a'];
  $('[data-feat]').innerHTML = FEAT.map((id, i) => CD.tile(CD.byId(id), { big: i === 0 })).join('');

  /* Задачи */
  const cheapest = (cat) => Math.min(...CD.products.filter((p) => p.cat === cat).map((p) => p.price));
  $('[data-tasks]').innerHTML = CD.tasks.map((tk, i) => {
    const must = tk.needs.filter((c) => !tk.optional.includes(c));
    const from = must.reduce((s, c) => s + cheapest(c), 0);
    return `<li data-reveal class="rv" style="--d:${i * 60}ms"><a href="podbor.html?task=${tk.id}">
      <span class="tasks__n">${String(i + 1).padStart(2, '0')}</span>
      <b class="tasks__name">${tk.name}</b>
      <span class="tasks__t">${tk.text}<small>${tk.needs.map((c) => CD.catOf(c).one).join(' · ')}</small></span>
      <span class="tasks__p">от ${CD.price(from)}</span>
      ${ARROW}
    </a></li>`;
  }).join('');

  /* Поверка */
  $('[data-vf]').innerHTML = CD.cats.filter((c) => c.verify).map((c) => `<tr><th scope="row">${c.one}</th><td>${CD.price(c.verify)}</td></tr>`).join('');

  /* Шпаргалки */
  $('[data-gl]').innerHTML = CD.guides.map((g, i) => `<li data-reveal class="rv" style="--d:${i * 60}ms"><a href="guide.html?id=${g.id}">
    <span class="gl__n">${String(i + 1).padStart(2, '0')}</span>
    <b>${g.title}</b>
    <span class="gl__lead">${g.lead}</span>
    <span class="gl__m">${g.read} мин</span>
    ${ARROW}
  </a></li>`).join('');
})();
