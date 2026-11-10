/* Все товары, образы и справочники сайта. Цены в рублях, один источник на все страницы */
window.RW = (() => {
  'use strict';

  const A = 'https://reel-ref-try-the-look.vercel.app/assets/';
  const BRAND = 'DEAL';
  const SHOE = ['40', '41', '42', '43', '44', '45', '46'];
  const APPAREL = ['S', 'L', 'M', 'XL'];
  const TOPS = ['S', 'M', 'L', 'XL'];
  const WAIST = ['30', '32', '34', '36'];

  const cats = [
    { id: 'shoes', name: 'Обувь', one: 'Кроссовки' },
    { id: 'tee', name: 'Футболки', one: 'Футболка' },
    { id: 'long', name: 'Лонгсливы', one: 'Лонгслив' },
    { id: 'hoodie', name: 'Худи', one: 'Худи' },
    { id: 'sweat', name: 'Свитшоты', one: 'Свитшот' },
    { id: 'knit', name: 'Трикотаж', one: 'Трикотаж' },
    { id: 'shirt', name: 'Рубашки', one: 'Рубашка' },
    { id: 'jacket', name: 'Куртки', one: 'Куртка' },
    { id: 'denim', name: 'Джинсы', one: 'Джинсы' },
    { id: 'trousers', name: 'Брюки', one: 'Брюки' },
    { id: 'shorts', name: 'Шорты', one: 'Шорты' },
    { id: 'acc', name: 'Аксессуары', one: 'Аксессуар' }
  ];

  const colors = {
    black: { name: 'Чёрный', hex: '#151413' },
    white: { name: 'Белый', hex: '#f1efea' },
    grey: { name: 'Серый', hex: '#9b9a97' },
    beige: { name: 'Бежевый', hex: '#d6c7ad' },
    green: { name: 'Зелёный', hex: '#4b5a3a' },
    burgundy: { name: 'Бордовый', hex: '#6d2d26' },
    blue: { name: 'Голубой', hex: '#8fa9c4' },
    navy: { name: 'Тёмно-синий', hex: '#22304f' },
    brown: { name: 'Коричневый', hex: '#6a4a32' },
    red: { name: 'Красный', hex: '#c0302b' },
    pink: { name: 'Розовый', hex: '#e3a6b6' },
    orange: { name: 'Оранжевый', hex: '#d9772b' },
    yellow: { name: 'Жёлтый', hex: '#e3c33f' },
    purple: { name: 'Фиолетовый', hex: '#6b4c8a' }
  };

  const spec = {
    shoes: { material: 'Верх из натуральной кожи, подкладка из текстиля, подошва из резины', care: 'Протирать влажной тканью. Машинная стирка не подходит', fit: 'Размерный ряд европейский, берём свой обычный размер' },
    tee: { material: '100% хлопок, плотность 220 г/м²', care: 'Стирка при 30 °C наизнанку. Не отбеливать', fit: 'Прямой крой, посадка по размеру' },
    hoodie: { material: '80% хлопок, 20% полиэстер, футер с начёсом', care: 'Стирка при 30 °C наизнанку. Не сушить в барабане', fit: 'Свободный крой и спущенное плечо' },
    sweat: { material: '80% хлопок, 20% полиэстер, плотный футер', care: 'Стирка при 30 °C наизнанку. Не сушить в барабане', fit: 'Свободный крой и спущенное плечо' },
    knit: { material: '70% шерсть, 30% акрил, крупная вязка', care: 'Ручная стирка, сушить на плоскости', fit: 'Свободная посадка, можно носить поверх футболки' },
    denim: { material: '100% хлопок, плотный деним 13 унций', care: 'Стирка при 30 °C наизнанку, отдельно от светлых вещей', fit: 'Широкая штанина и высокая посадка' },
    trousers: { material: '98% хлопок, 2% эластан', care: 'Стирка при 30 °C. Гладить с изнанки', fit: 'Широкая штанина и посадка по талии' },
    long: { material: 'Хлопковый трикотаж', care: 'Стирка при 30 °C наизнанку', fit: 'Посадка по размеру' },
    shirt: { material: 'Хлопок', care: 'Стирка при 30 °C. Гладить с изнанки', fit: 'Прямой крой' },
    jacket: { material: 'Состав указан на ярлыке', care: 'Деликатная стирка или химчистка', fit: 'Посадка по размеру, под тёплый слой можно взять на размер больше' },
    shorts: { material: 'Хлопок или нейлон', care: 'Стирка при 30 °C', fit: 'Свободный крой' },
    acc: { material: 'Состав указан на ярлыке', care: 'Ручная стирка', fit: 'Размер указан в карточке' }
  };

  /* Варианты размеров из промпта, порядок совпадает с порядком размеров */
  const raw = [
    { id: 'air-jordan-12-retro', name: 'Air Jordan 12 Retro', vendor: 'Jordan', cat: 'shoes', color: 'beige', price: 14900, file: 'source-tatum-5-orbit-copy.webp', h: 400, sizes: SHOE, vids: [57015167025457, 57015167058225, 57015167090993, 57015167123761, 57015167156529, 57015167189297, 57015167222065], desc: 'Низкий силуэт из светлой кожи с тёмно-коричневым свушем и маленькими розовыми акцентами. Удобная посадка и подошва на каждый день' },
    { id: 'tshirt', name: 'Футболка', vendor: BRAND, cat: 'tee', color: 'black', price: 19900, file: 'source-tshirt.webp', h: 563, sizes: APPAREL, vids: [56835911582001, 56835911614769, 56835911647537, 56835911680305], desc: 'Чёрный плотный джерси, розовая рибана на вороте и белый готический принт со звездой. Держит форму после стирок' },
    { id: 'sweatshirt', name: 'Свитшот', vendor: BRAND, cat: 'sweat', color: 'beige', price: 19900, file: 'source-sweatshirt.webp', h: 581, sizes: APPAREL, vids: [56835806396721, 56835806429489, 56835806462257, 56835806495025], desc: 'Бежевый свитшот с круглым вырезом и небольшим принтом на груди. Спокойная вещь, которая подходит ко всему в образе' },
    { id: 'tatum-5-orbit', name: 'Tatum 5 Orbit', vendor: 'Jordan', cat: 'shoes', color: 'white', price: 14900, file: 'source-tatum-5-orbit.webp', h: 400, sizes: SHOE, vids: [57015166730545, 57015166763313, 57015166796081, 57015166828849, 57015166861617, 57015166894385, 57015166927153], desc: 'Белая кожа, чёрный воротник, серые вставки со слоновьим принтом и красные детали. Классическая колодка для города' },
    { id: 'hoodie-black', name: 'Чёрное худи', vendor: BRAND, cat: 'hoodie', color: 'black', price: 19900, file: 'source-hoodie-black.webp', h: 536, sizes: APPAREL, vids: [56836251681073, 56836251713841, 56836251746609, 56836251779377], desc: 'Чёрное худи с серой графикой в виде звезды. Глубокий капюшон и большой карман спереди', isNew: true },
    { id: 'sweatshirt-plus', name: 'Свитшот Plus', vendor: BRAND, cat: 'sweat', color: 'green', price: 19900, file: 'source-sweatshirt-plus.webp', h: 610, sizes: APPAREL, vids: [56836143743281, 56836143776049, 56836143808817, 56836143841585], desc: 'Бутылочно-зелёная модель с кремовыми буквами в университетском стиле. Самая яркая вещь на подиуме' },
    { id: 'hoodie', name: 'Худи', vendor: BRAND, cat: 'hoodie', color: 'grey', price: 19900, file: 'source-hoodie.webp', h: 555, sizes: APPAREL, vids: [56836002185521, 56836002218289, 56836002251057, 56836002283825], desc: 'Серое меланжевое худи с чёрным текстовым принтом на груди. Плотный футер и мягкий капюшон' },
    { id: 'luka-5', name: 'Luka 5', vendor: 'Jordan', cat: 'shoes', color: 'black', price: 14900, file: 'source-air-jordan-12-retro-copy.webp', h: 400, sizes: SHOE, vids: [57015176364337, 57015176397105, 57015176429873, 57015176462641, 57015176495409, 57015176528177, 57015176560945], desc: 'Чёрные низкие кроссовки из кожи с белой средней подошвой. Спокойная пара к широкому дениму' }
  ];

  /* Образы собраны из реальных вещей, похожих на то, что надето на модели.
     Порядок всегда сверху вниз: 1 верх, 2 низ, 3 обувь. Метки стоят на этих вещах на снимке */
  const looks = [
    { key: 'bndthK', name: 'Городской выход', desc: 'Графитовый трикотаж, свободный деним и серые New Balance', file: 1, items: ['r253', 'r254', 'r255'], pins: [[49.6, 28.3], [50.6, 60.3], [44.8, 96.2]], tag: -1 },
    { key: 'XckgG6', name: 'Открытие галереи', desc: 'Чистая белая футболка, винтажный деним и чёрные Converse', file: 5, items: ['r256', 'r257', 'r258'], pins: [[49.6, 28.6], [49, 60.3], [35.3, 95.9]], tag: 1 },
    { key: 'rLfAhC', name: 'Открытие галереи', desc: 'Оливковая вязка, коричневый деним и Timberland', file: 4, items: ['r259', 'r218', 'r260'], pins: [[51.2, 28.6], [50.7, 60.4], [42.7, 96]], tag: 1 },
    { key: 'FKg67q', name: 'День в студии', desc: 'Чёрная футболка, светлые Levi’s и белые Air Force 1', file: 6, items: ['r125', 'r261', 'r262'], pins: [[48.4, 29.2], [47.2, 60.9], [31.6, 96.5]], tag: -1 },
    { key: '8KREEE', name: 'День в студии', desc: 'Тёплая коричневая вязка и выбеленный серый деним', file: 3, items: ['r263', 'r264', 'r265'], pins: [[50.4, 28.5], [51.4, 60.3], [46.5, 96]], tag: -1 },
    { key: 'N3bfm9', name: 'День в студии', desc: 'Серый свитшот, светлый деним и adidas Superstar', file: 2, items: ['r232', 'r217', 'r266'], pins: [[52.1, 29.4], [52.9, 60.8], [38.1, 96]], tag: -1 }
  ].map(l => ({ ...l, src: `${A}model-${l.file}-640.webp`, orig: `${A}original-look-${l.file}.webp` }));

  /* Области кадра: доли ширины и высоты снимка 9:16, пропорция плитки 4:5 */
  const CROP = {
    top: { y0: 0.13, bh: 0.38, bw: 0.5405 },
    bottom: { y0: 0.45, bh: 0.5, bw: 0.7111 }
  };

  /* Реальные вещи брендов из открытых каталогов магазинов, фото лежат в assets/items */
  const realRaw = (window.RW_REAL || []).map(r => ({
    id: r.id, name: r.name, vendor: r.vendor, cat: r.cat, color: r.color, price: r.price,
    img: `assets/items/${r.id}.webp`, img2: r.img2 ? `assets/items/${r.id}-2.webp` : '', w: 800, h: 1000,
    sizes: r.sizes, vids: r.vids, avail: r.avail, desc: r.desc, mat: r.mat, isNew: r.isNew, real: true, src: r.src
  }));

  let synthetic = 7300000000000;
  const built = [...raw, ...realRaw].map(p => {
    const out = { ...p, spec: p.mat ? { ...spec[p.cat], material: p.mat } : spec[p.cat] };
    if (p.real) {
      /* фото и варианты уже готовы */
    } else if (p.file) {
      out.img = A + p.file;
      out.w = 400;
    } else {
      const c = CROP[p.part];
      out.crop = { look: p.look, y0: c.y0, bh: c.bh, bw: c.bw, x0: (1 - c.bw) / 2 };
      out.vids = p.sizes.map(() => (synthetic += 137));
    }
    const numeric = p.sizes.every(s => /^\d+$/.test(s));
    out.legend = p.cat === 'shoes' ? (String(p.sizes[0]).startsWith('US') ? 'Размер обуви, US' : 'Размер обуви, EU')
      : numeric ? 'Размер по талии' : 'Размер';
    out.variants = p.sizes.map((s, i) => ({ id: out.vids[i], a: p.avail ? !!p.avail[i] : true, o: [s] }));
    return out;
  });

  /* Разделы чередуются, чтобы в первом экране каталога были разные вещи */
  const groups = cats.map(c => built.filter(p => p.cat === c.id));
  const longest = Math.max(...groups.map(g => g.length));
  const products = [];
  for (let i = 0; i < longest; i++) groups.forEach(g => { if (g[i]) products.push(g[i]); });

  const byId = Object.fromEntries(products.map(p => [p.id, p]));
  const variantIndex = new Map();
  products.forEach(p => p.variants.forEach(v => variantIndex.set(v.id, { product: p, variant: v })));

  const fmt = new Intl.NumberFormat('ru-RU');
  const money = n => `${fmt.format(Math.round(n))} ₽`;

  const plural = (n, forms) => {
    const a = Math.abs(n) % 100, b = a % 10;
    if (a > 10 && a < 20) return forms[2];
    if (b > 1 && b < 5) return forms[1];
    return b === 1 ? forms[0] : forms[2];
  };
  const pieces = n => `${n} ${plural(n, ['вещь', 'вещи', 'вещей'])}`;

  const lookTotal = l => l.items.reduce((s, id) => s + byId[id].price, 0);
  /* Скидка 10% на весь образ, цена округляется до десяти рублей */
  const lookBundle = l => Math.round(lookTotal(l) * 0.09) * 10;

  /* В каких образах встречается товар. Для вещей с модели это её образ */
  const looksWith = p => looks
    .map((l, index) => ({ l, index }))
    .filter(({ l, index }) => l.items.includes(p.id) || p.look === index);

  return { A, brand: BRAND, cats, colors, products, looks, byId, variant: id => variantIndex.get(id), money, plural, pieces, lookTotal, lookBundle, looksWith };
})();
