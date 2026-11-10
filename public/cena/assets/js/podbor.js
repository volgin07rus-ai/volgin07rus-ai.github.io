/* Подбор стола: для каждой нужной категории берём самый дешёвый прибор, который проходит по требованиям задачи */
(() => {
  const { $, $$ } = CD;
  const roman = ['', 'I', 'II', 'III', 'IV'];
  const u = new URLSearchParams(location.search);
  const DEF_F = { repair: 1e6, power: 2e6, embedded: 2e7, rf: 1e8, study: 1e5, production: 1e5 };

  const st = {
    task: CD.tasks.some((t) => t.id === u.get('task')) ? u.get('task') : 'repair',
    f: +u.get('f') || 0,
    b: +u.get('b') || 150000,
    pick: {}, on: {},
  };
  if (!st.f) st.f = DEF_F[st.task];

  const fmtF = (hz) => (hz >= 1e9 ? `${CD.num(+(hz / 1e9).toFixed(2))} ГГц` : hz >= 1e6 ? `${CD.num(+(hz / 1e6).toFixed(hz < 1e7 ? 1 : 0))} МГц` : `${CD.num(+(hz / 1e3).toFixed(hz < 1e4 ? 1 : 0))} кГц`);
  const t2f = (t) => Math.pow(10, 3 + (6 * t) / 120);
  const f2t = (f) => Math.round(((Math.log10(f) - 3) * 120) / 6);

  /* Требования по категориям: фильтр, пояснение и запасной вариант */
  const NEED = {
    scope: { min: (s) => Math.max(20, (5 * s.f) / 1e6), ok: (p, s) => p.specs.bw >= NEED.scope.min(s) && (s.task !== 'embedded' || p.specs.decode),
      why: (p, s) => `Полоса ${CD.num(p.specs.bw)} МГц, это запас ${CD.num(+(p.specs.bw / (s.f / 1e6)).toFixed(p.specs.bw / (s.f / 1e6) < 10 ? 1 : 0))}× к сигналу${s.task === 'embedded' ? ', разбирает шины' : ''}`,
      need: (s) => `полоса от ${CD.num(Math.ceil(NEED.scope.min(s)))} МГц` },
    multimeter: { ok: (p, s) => (s.task === 'power' ? p.specs.kat >= 4 && p.specs.form !== 'Клещи' : s.task === 'production' ? p.specs.form === 'Настольный' : p.specs.form !== 'Клещи'),
      why: (p) => `${CD.num(p.specs.counts)} отсчётов, CAT ${roman[p.specs.kat]} на ${p.specs.v} В`,
      need: (s) => (s.task === 'power' ? 'CAT IV' : s.task === 'production' ? 'настольный' : 'любой ручной') },
    psu: { ok: (p, s) => (s.task === 'power' ? p.specs.v >= 60 : s.task === 'embedded' || s.task === 'production' ? p.specs.prog : true),
      why: (p) => `${p.specs.v} В, ${p.specs.a} А, ${p.specs.form.toLowerCase()}${p.specs.prog ? ', управление с компьютера' : ''}`,
      need: (s) => (s.task === 'power' ? 'от 60 В' : s.task === 'embedded' || s.task === 'production' ? 'с управлением по LAN' : 'любой') },
    gen: { min: (s) => Math.max(5, (2 * s.f) / 1e6), ok: (p, s) => p.specs.freq >= NEED.gen.min(s),
      why: (p, s) => `До ${CD.num(p.specs.freq)} МГц, хватает на ${fmtF(s.f)} с гармониками`,
      need: (s) => `от ${CD.num(Math.ceil(NEED.gen.min(s)))} МГц` },
    spectrum: { min: (s) => (3 * s.f) / 1e9, ok: (p, s) => p.specs.freq >= NEED.spectrum.min(s),
      why: (p, s) => `До ${CD.num(p.specs.freq)} ГГц, видно гармоники до ${Math.max(1, Math.floor((p.specs.freq * 1e9) / s.f))}-й`,
      need: (s) => `от ${CD.num(+NEED.spectrum.min(s).toFixed(2))} ГГц` },
    thermal: { ok: (p, s) => (s.task === 'power' || s.task === 'production' ? p.specs.pix >= 49152 : true),
      why: (p) => `Матрица ${p.specs.res}, до ${p.specs.tmax} °C`,
      need: (s) => (s.task === 'power' || s.task === 'production' ? 'матрица от 256×192' : 'любой') },
    lcr: { ok: (p, s) => (s.task === 'rf' ? p.specs.fmax >= 100 : s.task === 'production' ? p.specs.form === 'Настольный' : true),
      why: (p) => `Тест до ${p.specs.fmax} кГц, точность ${CD.num(p.specs.acc)} %`,
      need: (s) => (s.task === 'rf' ? 'тест от 100 кГц' : 'любой') },
    solder: { ok: (p, s) => (s.task === 'embedded' || s.task === 'production' ? (p.specs.form === 'Паяльная' && p.specs.w >= 120) || p.specs.form === 'Комбинированная' : true),
      why: (p) => `${p.specs.w} Вт, ${p.specs.form.toLowerCase()}${p.specs.heat ? `, разогрев ${p.specs.heat} с` : ''}`,
      need: (s) => (s.task === 'embedded' || s.task === 'production' ? 'от 120 Вт' : 'любая') },
  };

  const cands = (cat) => {
    const all = CD.products.filter((p) => p.cat === cat).sort((a, b) => a.price - b.price);
    const ok = all.filter((p) => NEED[cat].ok(p, st));
    return { ok, best: all.slice().sort((a, b) => b.price - a.price)[0] };
  };

  /* Задачи */
  const tasksEl = $('[data-pb-tasks]');
  tasksEl.innerHTML = CD.tasks.map((t) => `<label class="pb__t"><input type="radio" name="task" value="${t.id}"${t.id === st.task ? ' checked' : ''}><span><b>${t.name}</b><small>${t.text}</small></span></label>`).join('');
  tasksEl.addEventListener('change', (e) => {
    st.task = e.target.value;
    st.f = DEF_F[st.task];
    st.pick = {}; st.on = {};
    fIn.value = f2t(st.f);
    render();
  });

  const fIn = $('[data-pb-f]'), bIn = $('[data-pb-b]');
  fIn.value = f2t(st.f);
  bIn.value = st.b;
  fIn.addEventListener('input', () => { st.f = t2f(+fIn.value); st.pick = {}; render(); });
  bIn.addEventListener('input', () => { st.b = +bIn.value; render(); });

  const bench = $('[data-bench]');
  bench.addEventListener('click', (e) => {
    const row = e.target.closest('[data-cat]');
    if (!row) return;
    const cat = row.dataset.cat;
    const s = e.target.closest('[data-step]');
    if (s) {
      const n = cands(cat).ok.length;
      st.pick[cat] = ((st.pick[cat] || 0) + +s.dataset.step + n) % n;
      render();
    }
  });
  bench.addEventListener('change', (e) => {
    const row = e.target.closest('[data-cat]');
    if (row && e.target.matches('[data-on]')) { st.on[row.dataset.cat] = e.target.checked; render(); }
  });

  let chosen = [];
  function render() {
    const task = CD.tasks.find((t) => t.id === st.task);
    $('[data-pb-fo]').textContent = fmtF(st.f);
    $('[data-pb-bo]').textContent = CD.price(st.b);
    $('[data-pb-title]').textContent = task.name;
    $('[data-pb-sub]').textContent = `${task.text}. Сигнал до ${fmtF(st.f)}`;
    chosen = [];
    bench.innerHTML = task.needs.map((cat, i) => {
      const c = CD.catOf(cat);
      const opt = task.optional.includes(cat);
      const on = st.on[cat] ?? !opt;
      const { ok, best } = cands(cat);
      const idx = Math.min(st.pick[cat] || 0, Math.max(ok.length - 1, 0));
      const p = ok[idx];
      if (p && on) chosen.push(p);
      return `<li class="bn${on ? '' : ' is-off'}${p ? '' : ' is-miss'}" data-cat="${cat}">
        <span class="bn__no">${String(i + 1).padStart(2, '0')}</span>
        <div class="bn__c"><span class="lbl">${c.one}${opt ? ', по желанию' : ''}</span><small>Нужно ${NEED[cat].need(st)}</small></div>
        <a class="bn__fig" href="product.html?id=${(p || best).id}" tabindex="-1" aria-hidden="true">${CD.figure(p || best)}</a>
        <div class="bn__p">${p
          ? `<a href="product.html?id=${p.id}">${p.name}</a><p>${NEED[cat].why(p, st)}</p>`
          : `<b>В каталоге нет</b><p>Под такой сигнал не хватает даже ${best.name}. Снизьте частоту или напишите нам, привезём под заказ</p>`}</div>
        <div class="bn__s">${ok.length > 1 ? `<button type="button" data-step="-1" aria-label="Дешевле">‹</button><span>${idx + 1}/${ok.length}</span><button type="button" data-step="1" aria-label="Дороже">›</button>` : ok.length ? '<span>единств.</span>' : ''}</div>
        <b class="bn__pr">${p ? CD.price(p.price) : '·'}</b>
        ${opt ? `<label class="chk bn__on"><input type="checkbox" data-on${on ? ' checked' : ''}><i></i><span class="sr">Включить в набор</span></label>` : '<span class="bn__on"></span>'}
      </li>`;
    }).join('');

    const total = chosen.reduce((s, p) => s + p.price, 0);
    const over = total - st.b;
    $('[data-pb-total]').textContent = CD.price(total);
    const m = $('[data-meter]');
    const share = Math.min(1, total / st.b);
    m.style.setProperty('--v', share);
    m.classList.toggle('is-over', over > 0);
    $('b', m).textContent = `${Math.round((total / st.b) * 100)} % бюджета`;
    const miss = bench.querySelector('.is-miss:not(.is-off)');
    $('[data-pb-msg]').textContent = miss ? 'Одной позиции нет в каталоге, набор неполный'
      : over > 0 ? `Не хватает ${CD.price(over)}. Уберите необязательное или поднимите бюджет`
        : `Запас ${CD.price(-over)}. Можно взять что-то ступенью выше стрелкой ›`;
    $('[data-pb-cart]').disabled = !chosen.length;

    const q = new URLSearchParams({ task: st.task, f: Math.round(st.f), b: st.b });
    history.replaceState(null, '', '?' + q);
  }

  $('[data-pb-cart]').addEventListener('click', () => {
    chosen.forEach((p) => CD.cart.add(p.id));
    CD.toast(`В корзине ${chosen.length} ${CD.plural(chosen.length, 'прибор', 'прибора', 'приборов')}`, { label: 'Открыть корзину', fn: () => { location.href = 'cart.html'; } });
  });
  $('[data-pb-share]').addEventListener('click', (e) => {
    const s = $('span', e.currentTarget);
    navigator.clipboard && navigator.clipboard.writeText(location.href).catch(() => {});
    s.textContent = 'Ссылка скопирована';
    setTimeout(() => { s.textContent = 'Скопировать ссылку на набор'; }, 2200);
  });

  render();
})();
