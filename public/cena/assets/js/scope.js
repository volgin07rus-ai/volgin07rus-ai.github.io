/* Живой осциллограф на главной. Луч рисует сигнал категории, старый след гаснет */
(() => {
  const COL = { sig: '#f6cf45', grid: 'rgba(150,156,166,.34)', axis: 'rgba(176,182,192,.55)', bg: '#101214' };
  const VSTEPS = [0.5, 1, 2, 5];
  const TSTEPS = [0.1, 0.2, 0.5, 1];
  const TIMED = { scope: 1, multimeter: 1, psu: 1, gen: 1, lcr: 1 };
  const PERSIST = 2.9;
  const fmt = (v, d = 2) => v.toLocaleString('ru-RU', { minimumFractionDigits: d, maximumFractionDigits: d });

  const READ = {
    scope: (j) => [`Uрр ${fmt(5.04 + j * 0.02)} В`, 'f 1,000 кГц'],
    multimeter: (j) => [`U ${fmt(3.302 + j * 0.001, 3)} В`, '5 уровней'],
    psu: (j) => [`U ${fmt(12 + j * 0.001, 3)} В`, `Пульс. ${fmt(0.8 + Math.abs(j) * 0.1, 1)} мВ`],
    gen: () => ['Меандр 1,000 кГц', 'Скважность 50 %'],
    spectrum: (j) => [`Пик −${fmt(12.4 + j * 0.2, 1)} дБм`, 'f 100,0 МГц'],
    thermal: (j) => [`Макс ${fmt(87.3 + j * 0.3, 1)} °C`, 'Мин 22,1 °C'],
    lcr: () => ['L 4,70 мкГн', 'Q 31'],
    solder: () => ['Пик 245 °C', 'Профиль 210 с'],
  };

  CD.Scope = function (root) {
    const cv = root.querySelector('[data-scope-canvas]');
    const ctx = cv.getContext('2d');
    const grid = document.createElement('canvas');
    const g = grid.getContext('2d');
    const out = (k) => root.querySelector(`[data-r${k}]`);
    let W = 0, H = 0, dpr = 1, N = 0, cols = 10, ys = new Float32Array(0), ts = new Float32Array(0);
    let head = 0, last = 0, fast = 0, sig = 'scope', seed = 1, running = true, frozen = 0, raf = 0, visible = true;
    let vi = 2, ti = 1;
    const reduced = CD.reduced;

    const amp = () => 2 / VSTEPS[vi];
    const sample = (x) => {
      const cycles = TIMED[sig] ? cols * TSTEPS[ti] : 1;
      let y = CD.sig[sig](x * cycles, x, seed) * amp();
      if (TIMED[sig] && sig !== 'psu') y += (Math.random() - 0.5) * 0.012;
      return Math.max(-1.06, Math.min(1.06, y));
    };
    const px = (i) => (i / (N - 1)) * W;
    const py = (v) => H / 2 - v * (H / 2) * 0.96;

    function drawGrid() {
      grid.width = W; grid.height = H;
      g.clearRect(0, 0, W, H);
      const rows = 8;
      cols = Math.max(8, Math.round((rows * W) / H / 2) * 2);
      const cw = W / cols, rh = H / rows;
      g.fillStyle = COL.grid;
      const dot = Math.max(1, Math.round(dpr));
      for (let c = 1; c < cols; c++) for (let y = 0; y < H; y += 5 * dpr) g.fillRect(Math.round(c * cw), y, dot, dot);
      for (let r = 1; r < rows; r++) for (let x = 0; x < W; x += 5 * dpr) g.fillRect(x, Math.round(r * rh), dot, dot);
      g.fillStyle = COL.axis;
      g.fillRect(0, Math.round(H / 2), W, dot);
      g.fillRect(Math.round(W / 2), 0, dot, H);
      for (let x = 0; x < W; x += cw / 5) g.fillRect(Math.round(x), Math.round(H / 2) - 3 * dpr, dot, 7 * dpr);
      for (let y = 0; y < H; y += rh / 5) g.fillRect(Math.round(W / 2) - 3 * dpr, Math.round(y), 7 * dpr, dot);
    }

    function resize() {
      const r = cv.getBoundingClientRect();
      if (!r.width || !r.height) return;
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = Math.round(r.width * dpr); H = Math.round(r.height * dpr);
      cv.width = W; cv.height = H;
      N = Math.max(240, Math.round(r.width));
      ys = new Float32Array(N); ts = new Float32Array(N).fill(-99);
      drawGrid();
      if (reduced || !running) fillAll();
      draw(performance.now() / 1000);
    }

    function fillAll() {
      const t = performance.now() / 1000;
      for (let i = 0; i < N; i++) { ys[i] = sample(i / (N - 1)); ts[i] = t; }
      frozen = t;
    }

    function draw(t) {
      if (!W) return;
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(grid, 0, 0);
      const now = running && !reduced ? t : frozen;
      ctx.lineJoin = 'round';
      ctx.strokeStyle = COL.sig;
      const pass = (lw, k, minA) => {
        ctx.lineWidth = lw * dpr;
        let bucket = -1, started = false;
        for (let i = 0; i < N; i++) {
          let a = ts[i] < 0 ? 0 : 1 - (now - ts[i]) / PERSIST;
          a = a <= minA ? 0 : Math.pow(a, 1.3);
          const b = Math.round(a * 14) / 14;
          if (b !== bucket) {
            if (bucket > 0 && started) ctx.stroke();
            bucket = b; started = false;
            if (b > 0) { ctx.globalAlpha = b * k; ctx.beginPath(); if (i > 0 && ts[i - 1] >= 0) { ctx.moveTo(px(i - 1), py(ys[i - 1])); started = true; } }
          }
          if (b > 0) { if (started) ctx.lineTo(px(i), py(ys[i])); else { ctx.moveTo(px(i), py(ys[i])); started = true; } }
        }
        if (bucket > 0 && started) ctx.stroke();
      };
      pass(5, 0.12, 0.6);
      pass(1.6, 1, 0);
      ctx.globalAlpha = 1;
      if (running && !reduced) {
        const i = Math.min(N - 1, Math.floor(head * N));
        const x = px(i), y = py(ys[i]);
        const gr = ctx.createRadialGradient(x, y, 0, x, y, 14 * dpr);
        gr.addColorStop(0, 'rgba(255,244,190,.95)');
        gr.addColorStop(0.25, 'rgba(246,207,69,.35)');
        gr.addColorStop(1, 'rgba(246,207,69,0)');
        ctx.fillStyle = gr;
        ctx.fillRect(x - 14 * dpr, y - 14 * dpr, 28 * dpr, 28 * dpr);
      }
    }

    function frame(now) {
      raf = 0;
      if (!visible) return;
      raf = requestAnimationFrame(frame);
      const t = now / 1000;
      const dt = Math.min(0.05, last ? t - last : 0.016);
      last = t;
      if (running && N) {
        const period = fast ? 0.5 : 2.3;
        let nh = head + dt / period;
        const from = Math.floor(head * N), to = Math.min(N - 1, Math.floor(Math.min(nh, 1) * N));
        for (let i = from; i <= to; i++) { ys[i] = sample(i / (N - 1)); ts[i] = t; }
        if (nh >= 1) { nh = 0; seed = Math.random() * 10; if (fast) fast--; }
        head = nh;
      }
      draw(t);
    }
    const play = () => { if (!raf && !reduced && visible) { last = 0; raf = requestAnimationFrame(frame); } };

    let jT;
    const readouts = () => {
      const j = (Math.random() - 0.5) * 2;
      const [a, b] = READ[sig](j);
      out(1).textContent = a;
      out(2).textContent = b;
      out(3).textContent = `${fmt(VSTEPS[vi])} В/дел`;
      const td = TSTEPS[ti];
      out(4).textContent = TIMED[sig] ? (td < 1 ? `${CD.num(td * 1000)} мкс/дел` : `${CD.num(td)} мс/дел`) : 'Развёртка по x';
    };

    const api = {
      setSignal(id) {
        if (id === sig) return;
        sig = id; head = 0; fast = 1;
        if (reduced || !running) { fillAll(); draw(0); }
        readouts();
      },
      setV(i) { vi = i; if (reduced || !running) { fillAll(); draw(0); } readouts(); },
      setT(i) { ti = i; if (reduced || !running) { fillAll(); draw(0); } readouts(); },
      toggle() {
        running = !running;
        if (!running) frozen = performance.now() / 1000;
        else { const shift = performance.now() / 1000 - frozen; for (let i = 0; i < N; i++) if (ts[i] >= 0) ts[i] += shift; play(); }
        return running;
      },
      get signal() { return sig; },
      VSTEPS, TSTEPS,
      get vi() { return vi; }, get ti() { return ti; },
    };

    new ResizeObserver(resize).observe(cv);
    resize();
    readouts();
    jT = setInterval(() => { if (visible && running) readouts(); }, 700);

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting && !document.hidden; if (visible) play(); });
    io.observe(cv);
    document.addEventListener('visibilitychange', () => { visible = !document.hidden; if (visible) play(); });
    if (reduced) { fillAll(); draw(0); } else play();
    return api;
  };

  /* Ручка с делениями: перетаскивание, колесо, стрелки, клик */
  CD.knob = function (el, steps, idx, fmtV, onChange) {
    const A0 = -135, A1 = 135;
    const ang = (i) => A0 + ((A1 - A0) * i) / (steps.length - 1);
    let ticks = '';
    steps.forEach((_, i) => {
      const a = ((ang(i) - 90) * Math.PI) / 180;
      ticks += `<line x1="${32 + Math.cos(a) * 25}" y1="${32 + Math.sin(a) * 25}" x2="${32 + Math.cos(a) * 30}" y2="${32 + Math.sin(a) * 30}"/>`;
    });
    el.innerHTML = `<svg viewBox="0 0 64 64" aria-hidden="true"><g class="knob__t">${ticks}</g><g class="knob__p"><circle cx="32" cy="32" r="19"/><line x1="32" y1="30" x2="32" y2="15"/></g></svg><span class="knob__l">${el.dataset.label}</span><output>${fmtV(steps[idx])}</output>`;
    el.setAttribute('role', 'slider');
    el.tabIndex = 0;
    el.setAttribute('aria-label', el.dataset.label);
    el.setAttribute('aria-valuemin', 0);
    el.setAttribute('aria-valuemax', steps.length - 1);
    const p = el.querySelector('.knob__p'), o = el.querySelector('output');
    const set = (i, silent) => {
      idx = Math.max(0, Math.min(steps.length - 1, i));
      p.style.transform = `rotate(${ang(idx)}deg)`;
      o.textContent = fmtV(steps[idx]);
      el.setAttribute('aria-valuenow', idx);
      el.setAttribute('aria-valuetext', fmtV(steps[idx]));
      if (!silent) onChange(idx);
    };
    set(idx, true);
    el.addEventListener('keydown', (e) => {
      const m = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key];
      if (m) { e.preventDefault(); set(idx + m); }
      if (e.key === 'Home') { e.preventDefault(); set(0); }
      if (e.key === 'End') { e.preventDefault(); set(steps.length - 1); }
    });
    el.addEventListener('wheel', (e) => { e.preventDefault(); set(idx + (e.deltaY < 0 ? 1 : -1)); }, { passive: false });
    let sx = 0, sy = 0, acc = 0, moved = false;
    el.addEventListener('pointerdown', (e) => { el.setPointerCapture(e.pointerId); sx = e.clientX; sy = e.clientY; acc = 0; moved = false; });
    el.addEventListener('pointermove', (e) => {
      if (!el.hasPointerCapture(e.pointerId)) return;
      const d = e.clientX - sx - (e.clientY - sy);
      sx = e.clientX; sy = e.clientY;
      acc += d;
      if (Math.abs(acc) > 3) moved = true;
      while (acc > 26) { acc -= 26; set(idx + 1); }
      while (acc < -26) { acc += 26; set(idx - 1); }
    });
    el.addEventListener('pointerup', () => { if (!moved) set(idx === steps.length - 1 ? 0 : idx + 1); });
    return { set };
  };
})();
