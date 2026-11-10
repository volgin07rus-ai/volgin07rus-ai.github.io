/* Полка. Единый цикл requestAnimationFrame, положения считаются от дробной позиции s */
(() => {
  'use strict';
  const S = window.Site, D = window.YAT, M = window.YAT_M;
  const { $, $$, clamp, reduced, esc } = S;

  const shelf = $('.shelf'), stage = $('.stage'), probe = $('.probe');
  const ring = $('.ring'), counter = $('[data-counter]');
  const capT = $('[data-c-title]'), capS = $('[data-c-sub]'), capY = $('[data-c-year]');
  const ind = $('.eras__ind'), erasEl = $('.eras'), secsEl = $('.secs');

  const START = 'mertvye-dushi';
  const smooth = x => x * x * (3 - 2 * x);
  const B = r => Math.abs(r) < 1 ? (r + Math.sin(Math.PI * r) / Math.PI) / 2 : Math.sign(r) * .5;
  const mod = (a, n) => ((a % n) + n) % n;

  let W = innerWidth, Hpx = innerHeight, H = 400, gap = 5, centerY = Hpx / 2;
  let section = new URLSearchParams(location.search).get('r') || 'all';
  if (section !== 'all' && !D.sections.some(s => s.id === section)) section = 'all';
  let list = [], N = 0, loop = true;
  let s = 0, T = 0, active = -1;
  let dragging = false, down = null, moved = false;
  let hover = null, mx = -1e4, my = -1e4;
  let tiltX = 0, tiltY = 0, onCover = false, riseAt = -1e9;
  let wheelTimer = 0, last = performance.now();
  const geoCache = new Map();

  function measure() {
    W = innerWidth; Hpx = innerHeight;
    H = probe.getBoundingClientRect().height || 400;
    gap = H * .012;
    centerY = shelf.getBoundingClientRect().top + shelf.getBoundingClientRect().height / 2;
    geoCache.clear();
    live.forEach(el => sizeFaces(el));
  }

  function geo(b) {
    let g = geoCache.get(b.id);
    if (!g) {
      const m = M[b.id];
      const hf = clamp(.8 + (b.h - 17) / 16 * .2, .8, 1);
      const h = H * hf;
      g = { h, d: h * m.ca, ws: h * m.sa };
      geoCache.set(b.id, g);
    }
    return g;
  }
  const dRef = () => H * .68;
  const at = k => list[mod(k, N)];
  const exists = k => loop || (k >= 0 && k < N);

  /* Пул книг: на экране живёт около тридцати, остальные не существуют */
  const live = new Map();
  const free = [];
  function makeTape() {
    const el = document.createElement('div');
    el.className = 'tape';
    el.innerHTML = '<div class="face face--fe"></div><div class="face face--sp"></div><div class="face face--cv"></div>';
    el._fe = el.children[0]; el._sp = el.children[1]; el._cv = el.children[2];
    el._lift = 0; el._o = -1;
    stage.append(el);
    return el;
  }
  function sizeFaces(el) {
    const b = el._b; if (!b) return;
    const g = geo(b);
    const set = (f, w, tr) => { f.style.cssText += `;width:${w}px;height:${g.h}px;left:${-w / 2}px;top:${-g.h / 2}px;transform:${tr}`; };
    set(el._sp, g.ws, `translateZ(${g.d / 2}px)`);
    set(el._cv, g.d, `rotateY(90deg) translateZ(${g.ws / 2}px)`);
    set(el._fe, g.ws, `rotateY(180deg) translateZ(${g.d / 2}px)`);
  }
  function assign(el, k) {
    const b = at(k);
    el._k = k;
    el.dataset.k = k;
    if (el._b !== b) {
      el._b = b;
      el._cvSet = false;
      el._cv.style.backgroundImage = '';
      el._cv.style.backgroundColor = M[b.id].tint;
      el._sp.style.backgroundColor = M[b.id].tint;
      el._sp.style.backgroundImage = `url("${S.spine(b)}")`;
      el._sp.setAttribute('aria-label', b.t);
      sizeFaces(el);
    }
    el._lift = 0; el._o = -1;
    el.classList.add('on');
  }
  function acquire(k) { let el = live.get(k); if (!el) { el = free.pop() || makeTape(); assign(el, k); live.set(k, el); } return el; }
  function recycle(el) { live.delete(el._k); el.classList.remove('on'); free.push(el); if (hover === el) hover = null; }
  function clearPool() { [...live.values()].forEach(recycle); }

  function layout(now, dt) {
    if (!N) return;
    const base = Math.floor(s), f = s - base;
    const g0 = geo(at(base)), g1 = geo(at(base + 1));
    const shift = f * (g0.ws / 2 + gap + g1.ws / 2);
    const sf = smooth(f);
    const dA = g0.d + (g1.d - g0.d) * sf, wsA = g0.ws + (g1.ws - g0.ws) * sf;
    const extra = dA - wsA + 1.6 * gap;
    const limit = W / 2 + dA;
    const seen = new Set();

    const put = (k, X) => {
      const r = k - s;
      const b = at(k), g = geo(b);
      const x = X - shift + extra * B(r);
      if (Math.abs(x) - g.ws / 2 > limit) return false;
      seen.add(k);
      const el = acquire(k);
      const o = smooth(Math.max(0, 1 - Math.abs(r)));

      /* Обложку грузим только у тех, кто может повернуться */
      if (!el._cvSet && Math.abs(r) < 2.6) { el._cvSet = true; el._cv.style.backgroundImage = `url("${S.cover(b)}")`; }

      const target = (hover === el && Math.abs(r) > .5) ? 1 : 0;
      el._lift += (target - el._lift) * (reduced ? 1 : 1 - Math.exp(-12 * dt));
      if (el._lift < .001) el._lift = 0;

      const ry = -90 * o + tiltY * o, rx = tiltX * o, rz = -4.5 * o;
      const zBack = (dRef() - g.d) / 2 * (1 - o);
      const z = o * .2 * H + zBack;
      const yBase = (H - g.h) / 2 * (1 - o);
      let y = yBase - o * .025 * H - el._lift * .045 * H;

      let sc = 1;
      if (now - riseAt < 1500) {
        const p = clamp((now - riseAt - Math.abs(r) * 34) / 640, 0, 1);
        sc = 1 - Math.pow(1 - p, 3);
        y += (1 - sc) * g.h / 2;
      }
      el.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,${z.toFixed(2)}px) rotateZ(${rz.toFixed(3)}deg) rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg)${sc < 1 ? ` scale3d(1,${Math.max(.001, sc).toFixed(4)},1)` : ''}`;
      if (Math.abs(o - el._o) > .002) {
        el._o = o;
        el.classList.toggle('lit', o > .05);
        el._sp.style.setProperty('--shade', (o * .55).toFixed(3));
        el._cv.style.setProperty('--shade', ((1 - o) * .5).toFixed(3));
      }
      el.style.zIndex = Math.round(100 - Math.abs(r) * 4);
      return true;
    };

    if (exists(base)) put(base, 0);
    let X = 0, k = base;
    while (exists(k + 1)) {
      const a = geo(at(k)), c = geo(at(k + 1));
      X += a.ws / 2 + gap + c.ws / 2; k++;
      if (!put(k, X) && X > limit + shift) break;
      if (k - base > 60) break;
    }
    X = 0; k = base;
    while (exists(k - 1)) {
      const a = geo(at(k)), c = geo(at(k - 1));
      X -= a.ws / 2 + gap + c.ws / 2; k--;
      if (!put(k, X) && -X > limit) break;
      if (base - k > 60) break;
    }
    live.forEach((el, key) => { if (!seen.has(key)) recycle(el); });
  }

  /* Подпись */
  function swapLine(host, html, dir) {
    if (reduced) { host.innerHTML = `<span>${html}</span>`; return; }
    const fresh = document.createElement('span');
    fresh.innerHTML = html;
    [...host.children].forEach(old => {
      if (old._leaving) return;
      old._leaving = true;
      const cur = getComputedStyle(old).transform;
      old.animate([{ transform: cur === 'none' ? 'translateY(0)' : cur }, { transform: `translateY(${-dir * 105}%)` }], { duration: 650, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'both' })
        .finished.then(() => old.remove()).catch(() => {});
    });
    host.append(fresh);
    fresh.animate([{ transform: `translateY(${dir * 105}%)` }, { transform: 'translateY(0)' }], { duration: 650, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'both' });
  }

  function setActive(i, dir) {
    active = i;
    const b = list[i];
    swapLine(capT, esc(b.t), dir);
    swapLine(capS, `${esc(b.old || b.t)} / ${esc(b.a)}`, dir);
    swapLine(capY, `${b.y} / ${esc(b.city)} / ${b.sold ? 'Продано' : D.money(b.price)}`, dir);
    counter.textContent = `Книга ${i + 1} из ${N}`;
    paintEra(b);
    paintRing();
  }

  function paintRing() {
    const b = list[active];
    if (!b) return;
    ring.hidden = b.sold;
    ring.classList.toggle('is-in', S.inBag(b.id));
    ring.setAttribute('aria-label', S.inBag(b.id) ? `Убрать из корзины: ${b.t}` : `В корзину: ${b.t}`);
  }

  /* Эпохи */
  function buildEras() {
    const short = { e0: 'до 17', e1: '20-е', e2: '30-е', e3: '40-е', e4: '50-е', e5: '60-е', e6: '70+' };
    const has = id => list.some(b => D.eraOf(b.y).id === id);
    erasEl.innerHTML = `<span class="eras__ind" aria-hidden="true"></span><button type="button" class="era lbl" data-era="all"><span>Всѣ</span><b>Всѣ</b></button>` +
      D.eras.map(e => `<button type="button" class="era lbl" data-era="${e.id}"${has(e.id) ? '' : ' disabled'}><span>${e.name}</span><b>${short[e.id]}</b></button>`).join('');
  }
  function paintEra(b) {
    const id = D.eraOf(b.y).id;
    const btn = $(`[data-era="${id}"]`, erasEl);
    $$('.era', erasEl).forEach(x => x.classList.toggle('is-on', x === btn));
    if (!btn) return;
    const i = $('.eras__ind', erasEl);
    i.style.width = btn.offsetWidth + 'px';
    i.style.transform = `translateX(${btn.offsetLeft}px)`;
  }
  function nearestK(idx) {
    if (!loop) return idx;
    const cur = Math.round(T), delta = mod(idx - cur + Math.floor(N / 2), N) - Math.floor(N / 2);
    return cur + delta;
  }

  /* Разделы */
  function buildSecs() {
    const items = [{ id: 'all', name: 'Все разделы' }, ...D.sections];
    secsEl.innerHTML = items.map(x => {
      const n = x.id === 'all' ? D.books.length : D.books.filter(b => b.sec === x.id).length;
      return `<button type="button" class="sec lbl" data-sec="${x.id}" aria-pressed="${section === x.id}" title="${D.pieces(n)}">${x.name}</button>`;
    }).join('');
  }
  function setSection(id, keepBook) {
    section = id;
    $$('.sec', secsEl).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.sec === id)));
    const prev = keepBook || list[active];
    list = D.books.filter(b => id === 'all' || b.sec === id);
    N = list.length;
    loop = N >= 24;
    let idx = prev ? list.indexOf(prev) : 0;
    if (idx < 0) {
      const y = prev ? prev.y : 1900;
      idx = list.reduce((best, b, i) => Math.abs(b.y - y) < Math.abs(list[best].y - y) ? i : best, 0);
    }
    clearPool();
    s = T = idx;
    active = -1;
    riseAt = reduced ? -1e9 : performance.now();
    buildEras();
    setActive(idx, 1);
    const u = new URL(location.href);
    if (id === 'all') u.searchParams.delete('r'); else u.searchParams.set('r', id);
    history.replaceState(history.state, '', u);
  }

  function clampT() { if (!loop) T = clamp(T, 0, N - 1); }
  const avgStep = () => H * .14 + gap;

  function coverRect() {
    const el = live.get(Math.round(s));
    return el ? el._cv.getBoundingClientRect() : null;
  }
  function openActive() {
    const b = list[active];
    if (!b) return;
    T = Math.round(T); clampT();
    S.openBook(b.id, coverRect());
  }

  /* Цикл */
  function frame(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (!S.isOpen()) {
      const k = reduced ? 1000 : dragging ? 18 : 5.2;
      s += (T - s) * (1 - Math.exp(-k * dt));
      if (Math.abs(T - s) < 1e-4) s = T;
      if (loop && Math.abs(s) > N * 4) { const sh = Math.sign(s) * N * 2; s -= sh; T -= sh; clearPool(); }

      if (N) {
        const i = mod(Math.round(s), N);
        if (i !== active) setActive(i, Math.sign(T - s) || 1);
      }

      const g = N ? geo(at(Math.round(s))) : { d: 1, h: 1 };
      onCover = !S.overlay() && Math.abs(mx - W / 2) < .55 * g.d && Math.abs(my - centerY) < .55 * H && Math.abs(T - s) < .3;
      let tx = 0, ty = 0;
      if (onCover) { ty = (mx - W / 2) / (.55 * g.d) * 9; tx = -(my - centerY) / (H / 2) * 6; }
      else if (mx > -1e3) { ty = (mx - W / 2) / W * 5; }
      const a = reduced ? 1 : 1 - Math.exp(-7 * dt);
      tiltX += (tx - tiltX) * a; tiltY += (ty - tiltY) * a;

      layout(now, dt);

      const sc = smooth(Math.max(0, 1 - Math.abs(T - s) * 3));
      ring.style.left = `${W / 2 - .5 * g.d - 6}px`;
      ring.style.top = `${centerY + .36 * g.h}px`;
      ring.style.transform = `scale(${sc.toFixed(3)})`;
      ring.style.visibility = sc < .01 ? 'hidden' : 'visible';

      if (S.fine) S.cursor.override = S.overlay() ? null : (onCover && !overRing) ? 'open' : (hover && hoverIsSpine()) ? 'spine' : null;
    } else if (S.fine) S.cursor.override = null;
    requestAnimationFrame(frame);
  }
  let overRing = false;
  const hoverIsSpine = () => hover && Math.abs(hover._k - s) > .5;

  /* Ввод */
  addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; overRing = !!(e.target.closest && e.target.closest('.ring, .arrow')); }, { passive: true });
  stage.addEventListener('pointerover', e => { const t = e.target.closest('.tape'); if (t) hover = t; });
  stage.addEventListener('pointerout', e => { const t = e.target.closest('.tape'); if (t && hover === t && !t.contains(e.relatedTarget)) hover = null; });

  shelf.addEventListener('pointerdown', e => {
    if (e.button) return;
    const tape = e.target.closest('.tape');
    down = { x: e.clientX, T0: T, tape, id: e.pointerId, k: tape ? tape._k : null };
    moved = false;
  });
  addEventListener('pointermove', e => {
    if (!down || e.pointerId !== down.id) return;
    const dx = e.clientX - down.x;
    if (!moved && Math.abs(dx) > 5) { moved = true; dragging = true; try { shelf.setPointerCapture(down.id); } catch (err) { /* палец ушёл */ } }
    if (moved) { T = down.T0 - dx / avgStep(); clampT(); }
  }, { passive: true });
  const endDrag = e => {
    if (!down || (e.pointerId !== undefined && e.pointerId !== down.id)) return;
    const was = down; down = null;
    if (moved) { dragging = false; T = Math.round(T); clampT(); return; }
    if (was.k === null) return;
    const r = was.k - s;
    if (Math.abs(r) < .5) openActive();
    else { T = was.k; clampT(); }
  };
  addEventListener('pointerup', endDrag);
  addEventListener('pointercancel', () => { if (down) { down = null; dragging = false; T = Math.round(T); clampT(); } });

  addEventListener('wheel', e => {
    if (S.isOpen() || S.overlay()) return;
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    T += d / avgStep() * .5;
    clampT();
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => { T = Math.round(T); clampT(); }, 160);
  }, { passive: true });

  addEventListener('keydown', e => {
    if (e.target.matches('input, textarea, select') || S.isOpen() || S.overlay()) return;
    if (e.key === 'ArrowLeft') { T = Math.round(T) - 1; clampT(); }
    if (e.key === 'ArrowRight') { T = Math.round(T) + 1; clampT(); }
    if (e.key === 'Enter' && (e.target === document.body)) openActive();
  });

  document.addEventListener('click', e => {
    const hit = q => e.target.closest(q);
    let n;
    if (hit('.arrow--l')) { T = Math.round(T) - 1; clampT(); return; }
    if (hit('.arrow--r')) { T = Math.round(T) + 1; clampT(); return; }
    if (hit('.ring')) { const b = list[active]; if (b) S.bagToggle(b.id); return; }
    if ((n = hit('[data-era]'))) {
      const id = n.dataset.era;
      const idx = id === 'all' ? 0 : list.findIndex(b => D.eraOf(b.y).id === id);
      if (idx >= 0) { T = nearestK(idx); clampT(); }
      return;
    }
    if ((n = hit('[data-sec]'))) { if (n.dataset.sec !== section) setSection(n.dataset.sec); }
  });

  S.onBag(paintRing);

  /* Выбор книги из поиска и оглавления: полка едет к ней сама */
  S.onPick = (id, how) => {
    const b = D.byId[id];
    if (!b) return;
    if (!list.includes(b)) setSection('all', b);
    T = nearestK(list.indexOf(b));
    clampT();
  };
  S.rectFor = b => (list[active] === b ? coverRect() : null);
  S.onSwap = b => { if (list.includes(b)) { const k = nearestK(list.indexOf(b)); s = T = k; clearPool(); layout(performance.now(), .016); } };

  addEventListener('resize', () => { measure(); if (active >= 0) paintEra(list[active]); });
  document.fonts?.ready.then(() => { if (active >= 0) paintEra(list[active]); });

  /* Старт */
  list = D.books.filter(b => section === 'all' || b.sec === section);
  N = list.length;
  loop = N >= 24;
  measure();
  buildSecs();
  buildEras();
  const qs = new URLSearchParams(location.search).get('book');
  const first = (qs && D.byId[qs] && list.includes(D.byId[qs])) ? list.indexOf(D.byId[qs]) : Math.max(0, list.indexOf(D.byId[START]));
  s = T = first;
  capT.innerHTML = capS.innerHTML = capY.innerHTML = '';
  setActive(first, 1);
  riseAt = reduced ? -1e9 : performance.now() + 150;
  last = performance.now();
  requestAnimationFrame(frame);

  /* Первая отрисовка обязательно до открытия листа */
  if (qs && D.byId[qs]) {
    requestAnimationFrame(() => requestAnimationFrame(() => S.openBook(qs, coverRect(), { silent: true })));
  }
})();
