/* Поиск по каталогу. Понимает параметры: «осциллограф 200 МГц 4 канала», «лбп 30 В 5 А», «до 50 тыс» */
(() => {
  const norm = (s) => String(s).toLowerCase().replace(/ё/g, 'е').replace(/[«»"']/g, ' ').replace(/\s+/g, ' ').trim();
  const STOP = new Set(['для', 'и', 'с', 'со', 'на', 'в', 'по', 'от', 'до', 'или', 'мне', 'нужен', 'нужна', 'нужно', 'какой', 'купить', 'прибор']);

  /* Что значит каждое ограничение в разных категориях. Частота в МГц */
  const MAP = {
    freq: { scope: (s) => s.bw, gen: (s) => s.freq, spectrum: (s) => s.freq * 1000, lcr: (s) => s.fmax / 1000 },
    ch: { scope: (s) => s.ch, psu: (s) => s.ch, gen: (s) => s.ch },
    v: { psu: (s) => s.v, multimeter: (s) => s.v },
    a: { psu: (s) => s.a },
    w: { psu: (s) => s.w, solder: (s) => s.w },
    pix: { thermal: (s) => s.pix },
    cat: { multimeter: (s) => s.kat },
    adc: { scope: (s) => s.adc },
    bits: { gen: (s) => s.bits },
    tmax: { thermal: (s) => s.tmax, solder: (s) => s.tmax },
    counts: { multimeter: (s) => s.counts },
    trms: { multimeter: (s) => (s.trms ? 1 : 0) },
    decode: { scope: (s) => (s.decode ? 1 : 0) },
    prog: { psu: (s) => (s.prog ? 1 : 0) },
  };

  const n = (s) => parseFloat(String(s).replace(',', '.').replace(/\s/g, ''));
  const roman = { ii: 2, iii: 3, iv: 4, 2: 2, 3: 3, 4: 4 };
  const fmtN = (v) => Number(v).toLocaleString('ru-RU');
  const money = (v, unit) => (/тыс|^к$|^т/.test(unit || '') || v < 1000 ? v * 1000 : v);

  const RULES = [
    [/(\d+(?:[.,]\d+)?)\s*(?:ггц|ghz)/g, (m) => ({ key: 'freq', val: n(m[1]) * 1000, label: `Частота от ${m[1]} ГГц` })],
    [/(\d+(?:[.,]\d+)?)\s*(?:мгц|mhz)/g, (m) => ({ key: 'freq', val: n(m[1]), label: `Частота от ${m[1]} МГц` })],
    [/(\d+(?:[.,]\d+)?)\s*(?:кгц|khz)/g, (m) => ({ key: 'freq', val: n(m[1]) / 1000, label: `Частота от ${m[1]} кГц` })],
    [/(\d+)\s*(?:канал\w*|кан\b|ch\b|channels?)/g, (m) => ({ key: 'ch', val: n(m[1]), label: `Каналов от ${m[1]}` })],
    [/(?:cat|кат\w*)\s*(iv|iii|ii|4|3|2)\b/g, (m) => ({ key: 'cat', val: roman[m[1]], label: `Категория от CAT ${['', 'I', 'II', 'III', 'IV'][roman[m[1]]]}` })],
    [/(\d+)\s*[x×х*]\s*(\d+)/g, (m) => ({ key: 'pix', val: n(m[1]) * n(m[2]), label: `Матрица от ${m[1]}×${m[2]}` })],
    [/(\d+)\s*(?:бит\w*|bit)/g, (m) => ({ key: 'adc', val: n(m[1]), label: `АЦП от ${m[1]} бит`, alt: 'bits' })],
    [/(\d+)\s*(?:отсчет\w*|counts?)/g, (m) => ({ key: 'counts', val: n(m[1]), label: `От ${fmtN(n(m[1]))} отсчётов` })],
    [/(\d+)\s*(?:°\s*c|градус\w*)/g, (m) => ({ key: 'tmax', val: n(m[1]), label: `Предел от ${m[1]} °C` })],
    [/(?:^|\s)от\s*(\d[\d\s]*?)\s*(тысяч\w*|тыс\w*|т\.?р\.?|руб\w*|₽)(?=\s|$)/g, (m) => ({ key: 'priceMin', val: money(n(m[1]), m[2]), label: `Цена от ${fmtN(money(n(m[1]), m[2]))} ₽` })],
    [/(?:^|\s)(?:до|дешевле)\s*(\d[\d\s]*?)\s*(тысяч\w*|тыс\w*|т\.?р\.?|руб\w*|₽)?(?=\s|$)/g, (m) => ({ key: 'priceMax', val: money(n(m[1]), m[2]), label: `Цена до ${fmtN(money(n(m[1]), m[2]))} ₽` })],
    [/(\d+(?:[.,]\d+)?)\s*(?:вт|ватт\w*|w)(?=\s|$)/g, (m) => ({ key: 'w', val: n(m[1]), label: `Мощность от ${m[1]} Вт` })],
    [/(\d+(?:[.,]\d+)?)\s*(?:в|вольт\w*|v)(?=\s|$)/g, (m) => ({ key: 'v', val: n(m[1]), label: `Напряжение от ${m[1]} В` })],
    [/(\d+(?:[.,]\d+)?)\s*(?:а|ампер\w*|a)(?=\s|$)/g, (m) => ({ key: 'a', val: n(m[1]), label: `Ток от ${m[1]} А` })],
    [/\b(?:true\s*rms|trms)\b|трмс/g, () => ({ key: 'trms', val: 1, label: 'True RMS' })],
    [/декодир\w*|\bdecod\w*|\bi2c\b|\bspi\b|\buart\b|\bcan\b/g, () => ({ key: 'decode', val: 1, label: 'Декодирование шин' })],
    [/программир\w*|\blan\b|\bscpi\b/g, () => ({ key: 'prog', val: 1, label: 'Управление с компьютера' })],
  ];

  const hay = new Map();
  const haystack = (p) => {
    if (hay.has(p.id)) return hay.get(p.id);
    const c = CD.catOf(p.cat);
    const enums = c.schema.filter((s) => typeof p.specs[s.k] === 'string').map((s) => p.specs[s.k]);
    const name = norm(p.name);
    const words = norm([p.name, name.replace(/[-\s]/g, ''), p.brand, c.name, c.one, c.alias, p.short, ...enums].join(' ')).split(/[\s,.]+/).filter(Boolean);
    const v = { name, words, compact: name.replace(/[-\s]/g, '') };
    hay.set(p.id, v);
    return v;
  };

  const lev = (a, b, max) => {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      const cur = [i];
      for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
    return prev[b.length];
  };

  const tokenScore = (h, t) => {
    if (h.name === t || h.compact === t) return 40;
    if (h.name.startsWith(t) || h.compact.startsWith(t)) return 24;
    let best = 0;
    const max = t.length >= 7 ? 2 : t.length >= 4 ? 1 : 0;
    for (const w of h.words) {
      if (w === t) return 14;
      if (w.startsWith(t)) best = Math.max(best, 10);
      else if (t.length >= 3 && w.includes(t)) best = Math.max(best, 5);
      else if (max && lev(w.slice(0, t.length + 1), t, max) <= max) best = Math.max(best, 3);
    }
    return best;
  };

  function parse(raw) {
    let s = ' ' + norm(raw) + ' ';
    const cons = [];
    for (const [re, make] of RULES) {
      s = s.replace(re, (...a) => {
        cons.push(make(a));
        return ' ';
      });
    }
    const tokens = s.split(/\s+/).filter((t) => t && !STOP.has(t));
    return { tokens, cons };
  }

  const passes = (p, c) => {
    if (c.key === 'priceMax') return p.price <= c.val;
    if (c.key === 'priceMin') return p.price >= c.val;
    const m = MAP[c.key]?.[p.cat] || (c.alt && MAP[c.alt]?.[p.cat]);
    if (!m) return false;
    return m(p.specs) >= c.val;
  };

  const EN = 'qwertyuiop[]asdfghjkl;\'zxcvbnm,.';
  const RU = 'йцукенгшщзхъфывапролджэячсмитьбю';
  const swapLayout = (s) => s.toLowerCase().split('').map((ch) => { const i = EN.indexOf(ch); return i >= 0 ? RU[i] : ch; }).join('');

  /* Слово, которое называет тип прибора, сужает поиск до этого типа.
     Иначе «генератор» находит и осциллограф со встроенным генератором */
  const catWords = new Map(CD.cats.map((c) => [c.id, norm(c.name + ' ' + c.one + ' ' + c.alias).split(' ')]));
  const catOfToken = (t) => {
    if (t.length < 3) return null;
    const ids = [];
    for (const [id, ws] of catWords) if (ws.some((w) => w.startsWith(t) || (t.length >= 5 && lev(w.slice(0, t.length), t, 1) <= 1))) ids.push(id);
    return ids.length === 1 ? ids[0] : null;
  };

  function exec(q, list) {
    const { tokens, cons } = parse(q);
    const cats = new Set(), rest = [];
    for (const t of tokens) { const c = catOfToken(t); if (c) cats.add(c); else rest.push(t); }
    const scoped = cats.size === 1 ? [...cats][0] : null;
    const words = scoped ? rest : tokens;
    let out = [];
    for (const p of list) {
      if (scoped && p.cat !== scoped) continue;
      if (!cons.every((c) => passes(p, c))) continue;
      const h = haystack(p);
      let score = scoped ? 12 : 0, ok = true, exact = false;
      for (const t of words) {
        const v = tokenScore(h, t);
        if (!v) { ok = false; break; }
        if (v >= 40) exact = true;
        score += v;
      }
      if (ok) out.push({ p, score: score + p.pop / 100, exact });
    }
    /* Точное название модели показываем одно */
    if (out.some((o) => o.exact)) out = out.filter((o) => o.exact);
    out.sort((a, b) => b.score - a.score);
    return { hits: out, cons, tokens, scoped };
  }

  function run(q, list = CD.products) {
    const r = exec(q, list);
    if (!r.hits.length && /[a-z\[\];',.]/i.test(q)) {
      const fixed = swapLayout(q);
      const r2 = exec(fixed, list);
      if (r2.hits.length) return { ...r2, fixed };
    }
    return r;
  }

  CD.search = { run, parse, passes, norm };
})();
