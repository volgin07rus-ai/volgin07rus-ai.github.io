/* Сигналы категорий и чертежи-заглушки приборов */
(() => {
  const frac = (v) => v - Math.floor(v);
  const noise = (x, s) => Math.sin(x * 917.3 + s) * Math.sin(x * 431.7 + s * 2.1);

  /* u это время в периодах, x это позиция на экране от 0 до 1. Возвращают значение от -1 до 1 */
  CD.sig = {
    scope: (u) => Math.sin(2 * Math.PI * u) * 0.86,
    multimeter: (u) => {
      const v = frac(u / 2);
      return (Math.floor(v * 5) / 4) * 1.5 - 0.75;
    },
    psu: (u, x, s = 0) => 0.5 + 0.018 * Math.sin(2 * Math.PI * u * 11) + 0.01 * noise(x, s),
    gen: (u) => {
      const v = frac(u);
      const h = v < 0.5 ? v : v - 0.5;
      const edge = Math.exp(-h * 42) * Math.cos(h * 150) * 0.16;
      return v < 0.5 ? 0.68 + edge : -0.68 - edge;
    },
    spectrum: (u, x, s = 0) => {
      let y = -0.82 + 0.05 * Math.abs(noise(x, s));
      for (let n = 1; n <= 8; n++) {
        const pos = 0.09 + (n - 1) * 0.112;
        const a = 1.65 * Math.pow(0.77, n - 1);
        y = Math.max(y, -0.82 + a * Math.exp(-Math.pow((x - pos) / 0.0065, 2)));
      }
      return y;
    },
    thermal: (u, x, s = 0) => -0.6 + 1.25 * Math.exp(-Math.pow((x - 0.58) / 0.13, 2)) + 0.55 * Math.exp(-Math.pow((x - 0.24) / 0.05, 2)) + 0.022 * noise(x, s),
    lcr: (u) => {
      const v = frac(u / 1.5);
      return Math.exp(-v * 4.4) * Math.sin(2 * Math.PI * v * 8) * 0.92;
    },
    solder: (u, x) => {
      const pts = [[0, -0.8], [0.22, -0.1], [0.56, 0.12], [0.72, 0.8], [0.79, 0.8], [1, -0.72]];
      for (let i = 1; i < pts.length; i++) {
        if (x <= pts[i][0]) {
          const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
          return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
        }
      }
      return -0.72;
    },
  };

  /* Короткий путь сигнала для значков категорий */
  CD.sigPath = (id, w = 120, h = 40, cycles = 2, pad = 3) => {
    const fn = CD.sig[id];
    const n = id === 'spectrum' ? 320 : 180;
    let d = '';
    for (let i = 0; i <= n; i++) {
      const x = i / n;
      const y = fn(x * cycles, x, 1.7);
      d += (i ? 'L' : 'M') + (x * w).toFixed(1) + ' ' + (h / 2 - (y * (h / 2 - pad))).toFixed(1);
    }
    return d;
  };

  CD.sigSvg = (id, w = 120, h = 40, cycles = 2) =>
    `<svg class="sg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><path d="${CD.sigPath(id, w, h, cycles)}"/></svg>`;

  /* Примитивы чертежа */
  const R = (x, y, w, h, r = 0, c = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" class="${c}"/>`;
  const C = (x, y, r, c = '') => `<circle cx="${x}" cy="${y}" r="${r}" class="${c}"/>`;
  const L = (a, b, c, d, k = '') => `<line x1="${a}" y1="${b}" x2="${c}" y2="${d}" class="${k}"/>`;
  const P = (d, c = '') => `<path d="${d}" class="${c}"/>`;
  const T = (x, y, t, c = 'tx', a = 'start') => `<text x="${x}" y="${y}" class="${c}" text-anchor="${a}">${t}</text>`;

  const trace = (fn, x, y, w, h, cycles, s = 1) => {
    let d = '';
    const n = Math.max(60, Math.round(w * 1.6));
    for (let i = 0; i <= n; i++) {
      const k = i / n;
      d += (i ? 'L' : 'M') + (x + k * w).toFixed(1) + ' ' + (y + h / 2 - fn(k * cycles, k, s) * (h / 2 - 2)).toFixed(1);
    }
    return P(d, 'tr');
  };

  const screen = (x, y, w, h, id, cycles = 2.5) => {
    let g = '';
    const cols = 10, rows = 8;
    for (let i = 1; i < cols; i++) g += L(x + (w * i) / cols, y, x + (w * i) / cols, y + h, 'gr');
    for (let i = 1; i < rows; i++) g += L(x, y + (h * i) / rows, x + w, y + (h * i) / rows, 'gr');
    return R(x, y, w, h, 1, 'sc') + g + trace(CD.sig[id], x + 2, y + 2, w - 4, h - 4, cycles);
  };

  const digits = (x, y, w, h, t) => R(x, y, w, h, 1, 'sc') + T(x + w - 6, y + h / 2 + 4.5, t, 'dg', 'end');
  const knob = (x, y, r) => C(x, y, r, 'f') + C(x, y, r * 0.42) + L(x, y - r * 0.42, x, y - r * 0.92);
  const bnc = (x, y, r = 5) => C(x, y, r, 'f') + C(x, y, r * 0.45, 'b');
  const keys = (x, y, cols, rows, s = 11, g = 4) => {
    let o = '';
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) o += R(x + c * (s + g), y + r * (s * 0.68 + g), s, s * 0.68, 0.5, 'f');
    return o;
  };
  const dim = (x, y, w, t) => L(x, y, x + w, y, 'dm') + L(x, y - 4, x, y + 4, 'dm') + L(x + w, y - 4, x + w, y + 4, 'dm') + T(x + w / 2, y - 5, t, 'tx', 'middle');
  const dimV = (x, y, h, t) => L(x, y, x, y + h, 'dm') + L(x - 4, y, x + 4, y, 'dm') + L(x - 4, y + h, x + 4, y + h, 'dm') +
    `<text class="tx" text-anchor="middle" transform="translate(${x - 6} ${y + h / 2}) rotate(-90)">${t}</text>`;

  const dimsFor = (p, x, y, w, h) => dim(x, y + h + 19, w, `${p.dims[0]} мм`) + dimV(x - 16, y, h, `${p.dims[1]} мм`);

  const bench = (p, x, y, w, h) => R(x, y, w, h, 2, 'f') + R(x + 9, y + h, 26, 5, 1) + R(x + w - 35, y + h, 26, 5, 1) + T(x + 10, y + 13, p.name, 'tx');

  const draw = {
    scope(p) {
      if (p.form === 'hand') {
        const [x, y, w, h] = [146, 34, 108, 214];
        return R(x, y, w, h, 13, 'f') + screen(x + 11, y + 22, w - 22, 80, 'scope', 2) + T(x + 11, y + 15, p.name, 'tx') +
          keys(x + 14, y + 114, 5, 3, 12, 4) + knob(x + w / 2, y + 178, 16) + bnc(x + 22, y + h + 3) + bnc(x + w - 22, y + h + 3) + dimV(x - 18, y, h, `${p.dims[1]} мм`);
      }
      const [x, y, w, h] = [66, 58, 278, 160];
      const sw = 156 + (p.specs.screen - 7) * 11;
      let b = '';
      const n = p.specs.ch;
      for (let i = 0; i < n; i++) b += bnc(x + 22 + i * ((sw - 20) / Math.max(n - 1, 1)), y + h - 16, 5.5);
      return bench(p, x, y, w, h) + screen(x + 12, y + 20, sw, h - 56, 'scope', 3) + b +
        knob(x + sw + 34, y + 36, 11) + knob(x + sw + 34 + 30, y + 36, 11) + keys(x + sw + 22, y + 62, 4, 4, 11, 4) + dimsFor(p, x, y, w, h);
    },
    multimeter(p) {
      if (p.specs.form === 'Настольный') {
        const [x, y, w, h] = [72, 96, 266, 104];
        return bench(p, x, y, w, h) + digits(x + 12, y + 20, 138, 46, p.specs.counts > 1e6 ? '1.234567' : '1.23456') + keys(x + 12, y + 74, 9, 1, 12, 3.4) +
          bnc(x + 196, y + 40, 7) + bnc(x + 226, y + 40, 7) + bnc(x + 196, y + 72, 7) + bnc(x + 226, y + 72, 7) + dimsFor(p, x, y, w, h);
      }
      if (p.specs.form === 'Клещи') {
        const x = 200;
        return P(`M${x - 44} 76 C${x - 56} 26 ${x + 56} 26 ${x + 44} 76 C${x + 40} 92 ${x + 20} 100 ${x + 14} 104 L${x - 14} 104 C${x - 20} 100 ${x - 40} 92 ${x - 44} 76Z`, 'f') +
          P(`M${x - 22} 74 C${x - 26} 48 ${x + 26} 48 ${x + 22} 74 C${x + 20} 84 ${x - 20} 84 ${x - 22} 74Z`, 'p') + L(x, 34, x, 49) +
          R(x - 42, 104, 84, 158, 10, 'f') + digits(x - 30, 118, 60, 36, '124') + knob(x, 196, 22) + T(x - 30, 252, p.name, 'tx') + bnc(x + 20, 248, 4.5);
      }
      const [x, y, w, h] = [149, 30, 102, 232];
      return R(x, y, w, h, 12, 'f') + R(x + 8, y + 8, w - 16, h - 16, 8) + digits(x + 15, y + 18, w - 30, 46, p.specs.counts > 19000 ? '12.345' : '3.302') +
        keys(x + 17, y + 74, 4, 1, 12, 4.4) + knob(x + w / 2, y + 128, 28) + bnc(x + 21, y + 192, 6) + bnc(x + 41, y + 192, 6) + bnc(x + 61, y + 192, 6) + bnc(x + 81, y + 192, 6) +
        T(x + w / 2, y + 216, p.name, 'tx', 'middle') + dimV(x - 18, y, h, `${p.dims[1]} мм`);
    },
    psu(p) {
      const [x, y, w, h] = [p.specs.ch > 1 ? 66 : 92, 66, p.specs.ch > 1 ? 278 : 226, 150];
      let o = bench(p, x, y, w, h);
      const n = p.specs.ch;
      const cw = (w - 16) / n;
      for (let i = 0; i < n; i++) {
        const cx = x + 8 + i * cw;
        o += digits(cx + 4, y + 20, cw - 12, 30, `${p.specs.v}.00`) + digits(cx + 4, y + 54, cw - 12, 24, `${p.specs.a}.000`) + knob(cx + cw * 0.28, y + 104, 12) + knob(cx + cw * 0.68, y + 104, 12) +
          C(cx + cw * 0.24, y + 134, 5.5, 'rd') + C(cx + cw * 0.72, y + 134, 5.5, 'b');
      }
      return o + dimsFor(p, x, y, w, h);
    },
    gen(p) {
      const [x, y, w, h] = [78, 84, 256, 124];
      return bench(p, x, y, w, h) + screen(x + 12, y + 20, 112, 76, 'gen', 3) + keys(x + 134, y + 22, 5, 3, 13, 4) + knob(x + 226, y + 96, 13) + bnc(x + 142, y + 98, 7) + bnc(x + 172, y + 98, 7) + dimsFor(p, x, y, w, h);
    },
    spectrum(p) {
      if (p.form === 'hand') {
        const [x, y, w, h] = [134, 28, 132, 230];
        return P(`M${x + 24} ${y} L${x + 24} ${y - 12} L${x + w - 24} ${y - 12} L${x + w - 24} ${y}`) + R(x, y, w, h, 10, 'f') + screen(x + 12, y + 20, w - 24, 92, 'spectrum', 1) + keys(x + 19, y + 124, 5, 4, 14, 4) + knob(x + w / 2, y + 198, 16) + T(x + 12, y + 14, p.name, 'tx') + dimV(x - 18, y, h, `${p.dims[1]} мм`);
      }
      const [x, y, w, h] = [66, 58, 278, 160];
      return bench(p, x, y, w, h) + screen(x + 12, y + 20, 176, h - 34, 'spectrum', 1) + keys(x + 200, y + 22, 4, 4, 13, 3) + knob(x + 226, y + 116, 16) + bnc(x + 258, y + 138, 6) + dimsFor(p, x, y, w, h);
    },
    thermal(p) {
      if (p.form === 'module') {
        return R(150, 20, 100, 214, 13, 'f') + heat(160, 40, 80, 150) + C(200, 28, 2) + R(180, 234, 40, 26, 3, 'f') + C(200, 247, 7, 'sc') + C(200, 247, 3, 'b') + T(200, 208, p.name, 'tx', 'middle');
      }
      const body = 'M112 62 L288 62 C296 62 298 70 298 76 L298 132 C298 142 292 146 284 146 L226 146 L238 244 C238 252 232 256 226 256 L186 256 C178 256 174 250 174 244 L166 146 L112 146 C104 146 102 140 102 132 L102 76 C102 68 104 62 112 62Z';
      return P(body, 'f') + heat(198, 74, 88, 60) + C(140, 104, 28, 'f') + C(140, 104, 19, 'sc') + C(140, 104, 8) + R(186, 164, 34, 11, 2) + T(180, 232, p.name, 'tx');
    },
    lcr(p) {
      if (p.form === 'tweezers') {
        return P('M170 40 L194 40 L196 196 L184 262 L180 262 L170 196Z', 'f') + P('M206 40 L230 40 L230 196 L220 262 L216 262 L204 196Z', 'f') + R(166, 28, 68, 92, 4, 'f') + digits(174, 40, 52, 30, '4.70') + keys(176, 82, 3, 1, 12, 4.4) + T(200, 112, p.name, 'tx', 'middle');
      }
      const [x, y, w, h] = [72, 96, 266, 104];
      return bench(p, x, y, w, h) + digits(x + 12, y + 20, 120, 46, '4.7012') + keys(x + 12, y + 74, 8, 1, 12, 3.4) + keys(x + 142, y + 22, 3, 3, 13, 4) + bnc(x + 214, y + 34, 6.5) + bnc(x + 240, y + 34, 6.5) + bnc(x + 214, y + 66, 6.5) + bnc(x + 240, y + 66, 6.5) + dimsFor(p, x, y, w, h);
    },
    solder(p) {
      const air = p.form === 'air';
      const x = 88, y = 118, w = 150, h = 112;
      let o = R(x, y, w, h, 2, 'f') + digits(x + 14, y + 16, 76, 34, `${p.specs.tmax}`) + knob(x + 118, y + 34, 15) + keys(x + 14, y + 62, 4, 1, 16, 3.5) + T(x + 14, y + h - 10, p.name, 'tx');
      o += air
        ? P(`M${x + w - 10} ${y + 86} C330 180 340 150 320 118`) + R(304, 64, 32, 66, 7, 'f') + R(312, 36, 16, 28, 1, 'f') + L(316, 22, 316, 32, 'dm') + L(324, 22, 324, 32, 'dm')
        : P(`M${x + w - 10} ${y + 86} C330 196 348 150 318 112`) + P('M308 106 L328 118 L300 68 L290 62 L296 74Z', 'f') + L(290, 62, 274, 38);
      return o + R(x - 6, y + h, w + 12, 5, 1) + dim(x, y + h + 22, w, `${p.dims[0]} мм`);
    },
  };

  /* Тепловая картинка линиями */
  function heat(x, y, w, h) {
    let o = R(x, y, w, h, 1, 'sc');
    const cx = x + w * 0.56, cy = y + h * 0.52;
    for (let i = 1; i <= 4; i++) o += `<ellipse cx="${cx}" cy="${cy}" rx="${(w * 0.1 * i).toFixed(1)}" ry="${(h * 0.1 * i).toFixed(1)}" class="tr${i > 2 ? ' dim' : ''}"/>`;
    return o;
  }

  /* Чертёж с габаритами есть у каждого прибора, фото подменяет его там, где оно есть */
  CD.drawing = (p) => `<svg class="dw" viewBox="0 0 400 300" role="img" aria-label="Чертёж прибора ${p.name}">${draw[p.cat](p)}</svg>`;
  CD.figure = (p) => (p.photo
    ? `<img class="pic" src="${p.photo}" alt="${p.brand} ${p.name}" loading="lazy" decoding="async" width="1200" height="900">`
    : CD.drawing(p));

  /* Пустое место под фото */
  CD.photoSlot = (label) =>
    `<svg class="dw dw--slot" viewBox="0 0 400 300" aria-hidden="true">${L(0, 0, 400, 300, 'dm')}${L(400, 0, 0, 300, 'dm')}<rect x="124" y="134" width="152" height="32" class="f" stroke="none"/>${T(200, 154, label, 'tx', 'middle')}</svg>`;
})();
