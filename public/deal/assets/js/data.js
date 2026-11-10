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
    { id: 'hoodie', name: 'Худи', one: 'Худи' },
    { id: 'sweat', name: 'Свитшоты', one: 'Свитшот' },
    { id: 'knit', name: 'Трикотаж', one: 'Трикотаж' },
    { id: 'denim', name: 'Джинсы', one: 'Джинсы' },
    { id: 'trousers', name: 'Брюки', one: 'Брюки' }
  ];

  const colors = {
    black: { name: 'Чёрный', hex: '#151413' },
    white: { name: 'Белый', hex: '#f1efea' },
    grey: { name: 'Серый', hex: '#9b9a97' },
    beige: { name: 'Бежевый', hex: '#d6c7ad' },
    green: { name: 'Зелёный', hex: '#4b5a3a' },
    burgundy: { name: 'Бордовый', hex: '#6d2d26' },
    blue: { name: 'Голубой', hex: '#8fa9c4' },
    brown: { name: 'Коричневый', hex: '#6a4a32' }
  };

  const spec = {
    shoes: { material: 'Верх из натуральной кожи, подкладка из текстиля, подошва из резины', care: 'Протирать влажной тканью. Машинная стирка не подходит', fit: 'Размерный ряд европейский, берём свой обычный размер' },
    tee: { material: '100% хлопок, плотность 220 г/м²', care: 'Стирка при 30 °C наизнанку. Не отбеливать', fit: 'Прямой крой, посадка по размеру' },
    hoodie: { material: '80% хлопок, 20% полиэстер, футер с начёсом', care: 'Стирка при 30 °C наизнанку. Не сушить в барабане', fit: 'Свободный крой и спущенное плечо' },
    sweat: { material: '80% хлопок, 20% полиэстер, плотный футер', care: 'Стирка при 30 °C наизнанку. Не сушить в барабане', fit: 'Свободный крой и спущенное плечо' },
    knit: { material: '70% шерсть, 30% акрил, крупная вязка', care: 'Ручная стирка, сушить на плоскости', fit: 'Свободная посадка, можно носить поверх футболки' },
    denim: { material: '100% хлопок, плотный деним 13 унций', care: 'Стирка при 30 °C наизнанку, отдельно от светлых вещей', fit: 'Широкая штанина и высокая посадка' },
    trousers: { material: '98% хлопок, 2% эластан', care: 'Стирка при 30 °C. Гладить с изнанки', fit: 'Широкая штанина и посадка по талии' }
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
    { id: 'luka-5', name: 'Luka 5', vendor: 'Jordan', cat: 'shoes', color: 'black', price: 14900, file: 'source-air-jordan-12-retro-copy.webp', h: 400, sizes: SHOE, vids: [57015176364337, 57015176397105, 57015176429873, 57015176462641, 57015176495409, 57015176528177, 57015176560945], desc: 'Чёрные низкие кроссовки из кожи с белой средней подошвой. Спокойная пара к широкому дениму' },

    /* Вещи с моделей: кадр вырезается из снимка образа, part задаёт верх или низ */
    { id: 'knit-graphite', name: 'Джемпер Графит', vendor: BRAND, cat: 'knit', color: 'grey', price: 12900, look: 0, part: 'top', sizes: TOPS, desc: 'Графитовый джемпер с круглым вырезом. Плотная вязка, которая спокойно садится на широкий деним' },
    { id: 'denim-sky', name: 'Джинсы Небо', vendor: BRAND, cat: 'denim', color: 'blue', price: 11900, look: 0, part: 'bottom', sizes: WAIST, desc: 'Голубой деним с широкой прямой штаниной и лёгкой потёртостью по бёдрам' },
    { id: 'tee-oversize', name: 'Футболка оверсайз', vendor: BRAND, cat: 'tee', color: 'white', price: 5900, look: 1, part: 'top', sizes: TOPS, desc: 'Белая футболка свободного кроя с длинным рукавом до локтя. База под любой низ', isNew: true },
    { id: 'denim-vintage', name: 'Джинсы Винтаж', vendor: BRAND, cat: 'denim', color: 'blue', price: 13900, look: 1, part: 'bottom', sizes: WAIST, desc: 'Очень широкие джинсы с винтажной стиркой и выбеленными заломами' },
    { id: 'knit-olive', name: 'Свитер Олива', vendor: BRAND, cat: 'knit', color: 'green', price: 14900, look: 2, part: 'top', sizes: TOPS, desc: 'Оливковый свитер крупной вязки. Тёплая вещь для прохладного города', isNew: true },
    { id: 'trousers-cocoa', name: 'Брюки Какао', vendor: BRAND, cat: 'trousers', color: 'brown', price: 12400, look: 2, part: 'bottom', sizes: WAIST, desc: 'Широкие брюки тёплого коричневого цвета со стрелкой и мягкой тканью' },
    { id: 'tee-base', name: 'Футболка База', vendor: BRAND, cat: 'tee', color: 'black', price: 4900, look: 3, part: 'top', sizes: TOPS, desc: 'Чёрная футболка из плотного хлопка. Лучше всего работает с цепью и светлым денимом' },
    { id: 'denim-ice', name: 'Джинсы Лёд', vendor: BRAND, cat: 'denim', color: 'blue', price: 11900, look: 3, part: 'bottom', sizes: WAIST, desc: 'Почти белый деним с широкой штаниной. Яркий низ для простого верха' },
    { id: 'knit-bordeaux', name: 'Джемпер Бордо', vendor: BRAND, cat: 'knit', color: 'burgundy', price: 13400, look: 4, part: 'top', sizes: TOPS, desc: 'Бордовый джемпер, который носят поверх белой футболки. Глубокий цвет и мягкая пряжа' },
    { id: 'denim-ash', name: 'Джинсы Пепел', vendor: BRAND, cat: 'denim', color: 'grey', price: 12400, look: 4, part: 'bottom', sizes: WAIST, desc: 'Серый деним свободного кроя с ровной стиркой и высокой посадкой' },
    { id: 'crew-fog', name: 'Свитшот Туман', vendor: BRAND, cat: 'sweat', color: 'grey', price: 9900, look: 5, part: 'top', sizes: TOPS, desc: 'Светло-серый свитшот с круглым вырезом. Самая тихая и самая ноская вещь в подборке' },
    { id: 'denim-wash', name: 'Джинсы Светлые', vendor: BRAND, cat: 'denim', color: 'blue', price: 11400, look: 5, part: 'bottom', sizes: WAIST, desc: 'Светлые широкие джинсы с мягкой стиркой. Твой любимый деним, только новый' }
  ];

  const looks = [
    { key: 'bndthK', name: 'Городской выход', desc: 'Графитовый трикотаж и свободный деним', file: 1, items: ['air-jordan-12-retro', 'tshirt', 'sweatshirt'], pins: [[47, 27], [48, 58], [45, 96]], tag: -1 },
    { key: 'XckgG6', name: 'Открытие галереи', desc: 'Чистая белая футболка и расслабленный деним', file: 5, items: ['tatum-5-orbit', 'hoodie-black', 'tshirt'], pins: [[50, 28], [48, 58], [45, 88]], tag: 1 },
    { key: 'rLfAhC', name: 'Открытие галереи', desc: 'Оливковая вязка и приземлённая палитра', file: 4, items: ['sweatshirt-plus', 'tatum-5-orbit', 'tshirt'], pins: [[50, 28], [48, 58], [45, 88]], tag: 1 },
    { key: 'FKg67q', name: 'День в студии', desc: 'Чёрное, белое и свободный деним', file: 6, items: ['hoodie-black', 'air-jordan-12-retro', 'tshirt'], pins: [[50, 28], [48, 58], [45, 88]], tag: -1 },
    { key: '8KREEE', name: 'День в студии', desc: 'Бордовые слои и выверенные пропорции', file: 3, items: ['sweatshirt', 'tatum-5-orbit', 'tshirt'], pins: [[50, 28], [48, 58], [45, 88]], tag: -1 },
    { key: 'N3bfm9', name: 'День в студии', desc: 'Серый свитшот и твой любимый деним', file: 2, items: ['hoodie', 'luka-5', 'tshirt'], pins: [[50, 28], [48, 58], [45, 88]], tag: -1 }
  ].map(l => ({ ...l, src: `${A}model-${l.file}-640.webp`, orig: `${A}original-look-${l.file}.webp` }));

  /* Области кадра: доли ширины и высоты снимка 9:16, пропорция плитки 4:5 */
  const CROP = {
    top: { y0: 0.13, bh: 0.38, bw: 0.5405 },
    bottom: { y0: 0.45, bh: 0.5, bw: 0.7111 }
  };

  let synthetic = 7300000000000;
  const products = raw.map(p => {
    const out = { ...p, spec: spec[p.cat] };
    if (p.file) {
      out.img = A + p.file;
      out.w = 400;
    } else {
      const c = CROP[p.part];
      out.crop = { look: p.look, y0: c.y0, bh: c.bh, bw: c.bw, x0: (1 - c.bw) / 2 };
      out.vids = p.sizes.map(() => (synthetic += 137));
    }
    out.legend = p.cat === 'shoes' ? 'Размер обуви' : (p.cat === 'denim' || p.cat === 'trousers') ? 'Размер по талии' : 'Размер';
    out.variants = p.sizes.map((s, i) => ({ id: out.vids[i], a: true, o: [s] }));
    return out;
  });

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
  const lookBundle = l => lookTotal(l) * 0.9;

  /* В каких образах встречается товар. Для вещей с модели это её образ */
  const looksWith = p => looks
    .map((l, index) => ({ l, index }))
    .filter(({ l, index }) => l.items.includes(p.id) || p.look === index);

  return { A, brand: BRAND, cats, colors, products, looks, byId, variant: id => variantIndex.get(id), money, plural, pieces, lookTotal, lookBundle, looksWith };
})();
