/* Каталог магазина «Цена деления». Модели и характеристики настоящие, цены ориентировочные.
   Фото лежат в assets/img/<id>.webp, 1200×900 на белом фоне */
window.CD = window.CD || {};
(() => {
  const roman = ['', 'I', 'II', 'III', 'IV'];

  CD.cats = [
    {
      id: 'scope', name: 'Осциллографы', one: 'Осциллограф', verify: 6400,
      alias: 'осциллограф осцилограф осцилл скоп scope oscilloscope dso',
      lead: 'Форма сигнала, фронты и помехи',
      schema: [
        { k: 'bw', l: 'Полоса', u: 'МГц', f: 'min', b: 1, t: 1, c: 1 },
        { k: 'ch', l: 'Каналы', f: 'min', b: 1, t: 1, c: 1 },
        { k: 'sr', l: 'Дискретизация', u: 'Гвыб/с', f: 'min', b: 1, t: 1 },
        { k: 'mem', l: 'Память', u: 'Мточек', f: 'min', b: 1, t: 1, c: 1, fmt: (v) => (v < 1 ? CD.num(v * 1000) + ' тыс. точек' : CD.num(v) + ' Мточек') },
        { k: 'adc', l: 'АЦП', u: 'бит', f: 'min', b: 1 },
        { k: 'wfm', l: 'Скорость захвата', u: 'осц/с', b: 1 },
        { k: 'screen', l: 'Экран', u: '″' },
        { k: 'decode', l: 'Декодирование шин', f: 'bool', bool: 1 },
        { k: 'awg', l: 'Встроенный генератор', f: 'bool', bool: 1 },
      ],
    },
    {
      id: 'multimeter', name: 'Мультиметры', one: 'Мультиметр', verify: 1900,
      alias: 'мультиметр мультик тестер цешка multimeter dmm',
      lead: 'Напряжение, ток, сопротивление',
      schema: [
        { k: 'counts', l: 'Шкала', u: 'отсчётов', f: 'min', b: 1, t: 1, c: 1 },
        { k: 'acc', l: 'Погрешность DCV', u: '%', f: 'max', b: -1, t: 1, c: 1 },
        { k: 'kat', l: 'Категория', f: 'min', b: 1, t: 1, fmt: (v) => 'CAT ' + roman[v] },
        { k: 'v', l: 'Рабочее напряжение', u: 'В', f: 'min', b: 1, c: 1 },
        { k: 'trms', l: 'True RMS', f: 'bool', bool: 1 },
        { k: 'form', l: 'Исполнение', f: 'multi', t: 1 },
      ],
    },
    {
      id: 'psu', name: 'Источники питания', one: 'Источник питания', verify: 2800,
      alias: 'источник питания блок питания бп лбп лабораторный psu power supply',
      lead: 'Стабильное напряжение на столе',
      schema: [
        { k: 'v', l: 'Напряжение', u: 'В', f: 'min', b: 1, t: 1, c: 1 },
        { k: 'a', l: 'Ток', u: 'А', f: 'min', b: 1, t: 1, c: 1 },
        { k: 'w', l: 'Мощность', u: 'Вт', f: 'min', b: 1, t: 1, c: 1 },
        { k: 'ch', l: 'Каналы', f: 'min', b: 1 },
        { k: 'ripple', l: 'Пульсации', u: 'мВ', f: 'max', b: -1, t: 1 },
        { k: 'form', l: 'Схема', f: 'multi' },
        { k: 'prog', l: 'Управление с компьютера', f: 'bool', bool: 1 },
      ],
    },
    {
      id: 'gen', name: 'Генераторы сигналов', one: 'Генератор сигналов', verify: 5200,
      alias: 'генератор сигналов awg функциональный generator',
      lead: 'Синус, меандр и произвольная форма',
      schema: [
        { k: 'freq', l: 'Частота', u: 'МГц', f: 'min', b: 1, t: 1, c: 1 },
        { k: 'ch', l: 'Каналы', f: 'min', b: 1, t: 1, c: 1 },
        { k: 'sr', l: 'Дискретизация', u: 'Мвыб/с', f: 'min', b: 1, t: 1, c: 1 },
        { k: 'bits', l: 'ЦАП', u: 'бит', f: 'min', b: 1, t: 1 },
      ],
    },
    {
      id: 'spectrum', name: 'Анализаторы спектра', one: 'Анализатор спектра', verify: 14800,
      alias: 'анализатор спектра спектр спектранализатор rf ндс spectrum',
      lead: 'Что происходит в эфире и на плате',
      schema: [
        { k: 'freq', l: 'Диапазон', u: 'ГГц', f: 'min', b: 1, t: 1, c: 1 },
        { k: 'danl', l: 'Шумовой порог', u: 'дБм/Гц', f: 'max', b: -1, t: 1, c: 1 },
        { k: 'rbw', l: 'Мин. полоса RBW', u: 'Гц', f: 'max', b: -1, t: 1, c: 1 },
        { k: 'tg', l: 'Следящий генератор', f: 'bool', bool: 1, t: 1 },
        { k: 'form', l: 'Исполнение', f: 'multi' },
      ],
    },
    {
      id: 'thermal', name: 'Тепловизоры', one: 'Тепловизор', verify: 7300,
      alias: 'тепловизор тепляк термокамера thermal',
      lead: 'Перегрев, утечки, плохой контакт',
      schema: [
        { k: 'res', l: 'Матрица', f: 'multi', t: 1, c: 1 },
        { k: 'pix', l: 'Точек на кадр', hide: 1, b: 1 },
        { k: 'netd', l: 'Чувствительность', u: 'мК', f: 'max', b: -1, t: 1, c: 1 },
        { k: 'tmax', l: 'Предел температуры', u: '°C', f: 'min', b: 1, t: 1, c: 1 },
        { k: 'fps', l: 'Частота кадров', u: 'Гц', b: 1 },
        { k: 'form', l: 'Исполнение', f: 'multi' },
      ],
    },
    {
      id: 'lcr', name: 'LCR-метры', one: 'LCR-метр', verify: 3900,
      alias: 'lcr лцр измеритель иммитанса емкость индуктивность конденсатор',
      lead: 'Ёмкость, индуктивность, ESR',
      schema: [
        { k: 'fmax', l: 'Частота теста', u: 'кГц', f: 'min', b: 1, t: 1, c: 1 },
        { k: 'acc', l: 'Базовая точность', u: '%', f: 'max', b: -1, t: 1, c: 1 },
        { k: 'form', l: 'Исполнение', f: 'multi', t: 1, c: 1 },
      ],
    },
    {
      id: 'solder', name: 'Паяльные станции', one: 'Паяльная станция', verify: null,
      alias: 'паяльная станция паяльник фен термовоздушная solder',
      lead: 'Пайка, демонтаж, термопрофиль',
      schema: [
        { k: 'w', l: 'Мощность', u: 'Вт', f: 'min', b: 1, t: 1, c: 1 },
        { k: 'tmax', l: 'Предел температуры', u: '°C', f: 'min', b: 1, t: 1, c: 1 },
        { k: 'heat', l: 'Разогрев', u: 'с', f: 'max', b: -1, t: 1, c: 1 },
        { k: 'form', l: 'Тип', f: 'multi', t: 1 },
      ],
    },
  ];

  CD.kit = {
    scope: ['Щупы по числу каналов', 'Сетевой кабель', 'Заводской протокол настройки', 'Паспорт и руководство'],
    multimeter: ['Измерительные провода', 'Батареи', 'Чехол', 'Паспорт и руководство'],
    psu: ['Сетевой кабель', 'Провода с зажимами', 'Паспорт и руководство'],
    gen: ['Кабель BNC', 'Сетевой кабель', 'Паспорт и руководство'],
    spectrum: ['Переходник N на BNC', 'Сетевой кабель', 'Заводской протокол настройки', 'Паспорт и руководство'],
    thermal: ['Аккумулятор', 'Зарядное устройство', 'Кейс', 'Паспорт и руководство'],
    lcr: ['Измерительные зажимы', 'Сетевой кабель или батарея', 'Паспорт и руководство'],
    solder: ['Жало или сопло', 'Подставка с губкой', 'Паспорт и руководство'],
  };

  /* Реальные модели. Характеристики по даташитам производителей, цены ориентировочные по российским магазинам на ноябрь 2026 */
  const P = (o) => ({ ...o, photo: `assets/img/${o.id}.webp` });
  CD.products = [
    /* Осциллографы */
    P({ id: 'ds1102z-e', cat: 'scope', name: 'DS1102Z-E', brand: 'Rigol', price: 52390, stock: 14, pop: 92, reg: false, dims: [313, 161, 122], mass: 2.9, tasks: ['study', 'repair'],
      short: 'Два канала и 100 МГц на первую лабораторию. Разбор UART, I2C и SPI уже в комплекте',
      specs: { bw: 100, ch: 2, sr: 1, mem: 24, adc: 8, wfm: 30000, screen: 7, decode: true, awg: false } }),
    P({ id: 'dho814', cat: 'scope', name: 'DHO814', brand: 'Rigol', price: 91000, stock: 9, pop: 98, reg: true, dims: [265, 162, 77], mass: 1.78, tasks: ['embedded', 'repair', 'study'],
      short: 'Четыре канала и 12-битный АЦП в корпусе толщиной 7,7 см. Питается от USB Type-C',
      specs: { bw: 100, ch: 4, sr: 1.25, mem: 25, adc: 12, wfm: 1000000, screen: 7, decode: true, awg: false } }),
    P({ id: 'sds2204x-plus', cat: 'scope', name: 'SDS2204X Plus', brand: 'Siglent', price: 390000, stock: 6, pop: 99, reg: true, dims: [352, 224, 111], mass: 3.9, tasks: ['embedded', 'repair', 'power'],
      short: 'Рабочий прибор для разработки плат. Сенсорный экран 10,1 дюйма и 200 млн точек на канал',
      specs: { bw: 200, ch: 4, sr: 2, mem: 200, adc: 8, wfm: 500000, screen: 10.1, decode: true, awg: true } }),
    P({ id: 'mso5354', cat: 'scope', name: 'MSO5354', brand: 'Rigol', price: 416853, stock: 3, pop: 81, reg: true, isNew: true, dims: [367, 200, 130], mass: 3.5, tasks: ['embedded', 'rf'],
      short: 'Осциллограф, логический анализатор и генератор в одном корпусе. До 8 Гвыб/с на одном канале',
      specs: { bw: 350, ch: 4, sr: 8, mem: 200, adc: 8, wfm: 500000, screen: 9, decode: true, awg: true } }),
    P({ id: 'dho5054', cat: 'scope', name: 'DHO5054', brand: 'Rigol', price: 1190000, stock: 2, pop: 64, reg: true, isNew: true, dims: [335, 235, 154], mass: 5.3, tasks: ['rf', 'embedded', 'power'],
      short: 'Флагман на 500 МГц с 12-битным АЦП и памятью 500 млн точек. Виден шум там, где восьмибитный рисует ступеньки',
      specs: { bw: 500, ch: 4, sr: 4, mem: 500, adc: 12, wfm: 1000000, screen: 10.1, decode: true, awg: false } }),
    P({ id: 'dho1202', cat: 'scope', name: 'DHO1202', brand: 'Rigol', price: 271656, stock: 5, pop: 76, reg: true, dims: [358, 215, 121], mass: 3.8, tasks: ['power', 'embedded'],
      short: 'Два канала, 12 бит и до 1,5 млн осциллограмм в секунду. Для силовой электроники и малых сигналов',
      specs: { bw: 200, ch: 2, sr: 2, mem: 100, adc: 12, wfm: 1500000, screen: 10.1, decode: true, awg: false } }),
    P({ id: 'hds272', cat: 'scope', name: 'HDS272', brand: 'OWON', price: 26000, stock: 0, pop: 58, reg: false, form: 'hand', dims: [96, 198, 38], mass: 0.6, tasks: ['repair', 'study'],
      short: 'Ручной осциллограф и мультиметр в одном корпусе на 600 г. Для выездов, щитовых и ремонта без стола',
      specs: { bw: 70, ch: 2, sr: 0.25, mem: 0.008, adc: 8, wfm: null, screen: 3.5, decode: false, awg: false } }),

    /* Мультиметры */
    P({ id: 'ut139c', cat: 'multimeter', name: 'UT139C', brand: 'UNI-T', price: 6580, stock: 42, pop: 95, reg: false, dims: [80, 170, 48], mass: 0.35, tasks: ['study', 'repair'],
      short: 'Ручной прибор на каждый день. Прозвонка, напряжение, температура и бесконтактный поиск фазы',
      specs: { counts: 6000, acc: 0.5, kat: 3, v: 600, trms: true, form: 'Ручной' } }),
    P({ id: 'ut61e-plus', cat: 'multimeter', name: 'UT61E+', brand: 'UNI-T', price: 11740, stock: 23, pop: 97, reg: true, dims: [90, 190, 50], mass: 0.35, tasks: ['repair', 'embedded', 'study'],
      short: 'Двадцать две тысячи отсчётов и погрешность 0,05 %. Фильтр для частотников и связь с компьютером',
      specs: { counts: 22000, acc: 0.05, kat: 4, v: 600, trms: true, form: 'Ручной' } }),
    P({ id: 'ut181a', cat: 'multimeter', name: 'UT181A', brand: 'UNI-T', price: 42790, stock: 11, pop: 88, reg: true, dims: [103, 225, 59], mass: 0.64, tasks: ['power', 'repair', 'production'],
      short: 'Цветной экран с графиком тренда и память на 20 000 измерений. Корпус IP65 и CAT IV для щитов',
      specs: { counts: 60000, acc: 0.025, kat: 4, v: 600, trms: true, form: 'Ручной' } }),
    P({ id: 'dm3058e', cat: 'multimeter', name: 'DM3058E', brand: 'Rigol', price: 74390, stock: 4, pop: 71, reg: true, dims: [232, 107, 291], mass: 2.5, tasks: ['embedded', 'production'],
      short: 'Настольный на 5½ разрядов. Понимает команды 34401A и Fluke 45, поэтому встаёт в готовые стенды',
      specs: { counts: 240000, acc: 0.015, kat: 2, v: 600, trms: true, form: 'Настольный' } }),
    P({ id: 'dm3068', cat: 'multimeter', name: 'DM3068', brand: 'Rigol', price: 132000, stock: 2, pop: 54, reg: true, isNew: true, dims: [232, 107, 291], mass: 3.2, tasks: ['production'],
      short: 'Шесть с половиной разрядов и до 10 000 измерений в секунду. Для метрологии и контроля партий',
      specs: { counts: 2200000, acc: 0.0035, kat: 2, v: 300, trms: true, form: 'Настольный' } }),
    P({ id: 'ut219e', cat: 'multimeter', name: 'UT219E', brand: 'UNI-T', price: 13975, stock: 17, pop: 83, reg: true, form: 'clamp', dims: [82, 235, 47], mass: 0.31, tasks: ['power', 'repair'],
      short: 'Токовые клещи на 600 А переменного тока. Режим LoZ убирает наводки, корпус переживает падение с 2 м',
      specs: { counts: 6000, acc: 0.6, kat: 4, v: 600, trms: true, form: 'Клещи' } }),

    /* Источники питания */
    P({ id: 'ka3005p', cat: 'psu', name: 'KA3005P', brand: 'Korad', price: 10710, stock: 19, pop: 93, reg: false, dims: [110, 165, 265], mass: 4.3, tasks: ['study', 'repair'],
      short: 'Линейный источник на 30 В и 5 А с тихим выходом. Пять ячеек памяти и управление с компьютера',
      specs: { v: 30, a: 5, w: 150, ch: 1, ripple: 2, form: 'Линейный', prog: true } }),
    P({ id: 'utp1310', cat: 'psu', name: 'UTP1310', brand: 'UNI-T', price: 14560, stock: 28, pop: 90, reg: false, dims: [80, 150, 230], mass: 1.9, tasks: ['study', 'repair'],
      short: 'Импульсный блок на 320 Вт весом 1,9 кг. Для зарядки аккумуляторов, моторов и светодиодных сборок',
      specs: { v: 32, a: 10, w: 320, ch: 1, ripple: 10, form: 'Импульсный', prog: false } }),
    P({ id: 'dp832', cat: 'psu', name: 'DP832', brand: 'Rigol', price: 71190, stock: 7, pop: 85, reg: true, dims: [239, 157, 418], mass: 10.5, tasks: ['embedded', 'production'],
      short: 'Три изолированных канала и шум меньше 350 мкВ. Графики тока и напряжения прямо на экране',
      specs: { v: 30, a: 3, w: 195, ch: 3, ripple: 0.35, form: 'Линейный', prog: true } }),
    P({ id: 'ks6030', cat: 'psu', name: 'KS6030', brand: 'Korad', price: 100000, stock: 3, pop: 67, reg: true, dims: [477, 97, 448], mass: 8.5, tasks: ['power', 'production'],
      short: '1200 Вт в корпусе для стойки. 60 В при 20 А или 40 В при 30 А, управление по LAN и GPIB',
      specs: { v: 60, a: 30, w: 1200, ch: 1, ripple: 15, form: 'Импульсный', prog: true } }),
    P({ id: 'dp811', cat: 'psu', name: 'DP811', brand: 'Rigol', price: 92170, stock: 5, pop: 72, reg: true, isNew: true, dims: [239, 157, 418], mass: 10.3, tasks: ['power', 'embedded'],
      short: 'Линейный источник на 200 Вт с выводами Sense. Два диапазона, 20 В при 10 А или 40 В при 5 А',
      specs: { v: 40, a: 10, w: 200, ch: 1, ripple: 0.35, form: 'Линейный', prog: true } }),

    /* Генераторы */
    P({ id: 'sdg1022x-plus', cat: 'gen', name: 'SDG1022X Plus', brand: 'Siglent', price: 65000, stock: 12, pop: 82, reg: false, dims: [260, 107, 296], mass: 3.48, tasks: ['study', 'embedded'],
      short: 'Два канала по 25 МГц и 16-битный ЦАП. Произвольные сигналы длиной до 8 млн точек',
      specs: { freq: 25, ch: 2, sr: 1000, bits: 16 } }),
    P({ id: 'sdg1062x-plus', cat: 'gen', name: 'SDG1062X Plus', brand: 'Siglent', price: 94000, stock: 8, pop: 87, reg: true, dims: [260, 107, 296], mass: 3.48, tasks: ['embedded', 'repair'],
      short: 'Шестьдесят мегагерц на двух каналах и встроенный частотомер. Для проверки входов и фильтров',
      specs: { freq: 60, ch: 2, sr: 1000, bits: 16 } }),
    P({ id: 'sdg2122x', cat: 'gen', name: 'SDG2122X', brand: 'Siglent', price: 175000, stock: 4, pop: 66, reg: true, dims: [260, 107, 296], mass: 3.43, tasks: ['rf', 'embedded'],
      short: 'Сто двадцать мегагерц и 1,2 Гвыб/с. Чистые импульсы и размах до 20 В для стендов и АЦП',
      specs: { freq: 120, ch: 2, sr: 1200, bits: 16 } }),
    P({ id: 'sdg6032x', cat: 'gen', name: 'SDG6032X', brand: 'Siglent', price: 607000, stock: 1, pop: 47, reg: true, isNew: true, dims: [260, 107, 296], mass: 3.5, tasks: ['rf'],
      short: 'Триста пятьдесят мегагерц и импульсы от 3,3 нс. Шум и PRBS-последовательности для радиочастотных задач',
      specs: { freq: 350, ch: 2, sr: 2400, bits: 16 } }),

    /* Анализаторы спектра */
    P({ id: 'dsa815-tg', cat: 'spectrum', name: 'DSA815-TG', brand: 'Rigol', price: 213440, stock: 4, pop: 74, reg: true, dims: [362, 179, 128], mass: 4.25, tasks: ['rf'],
      short: 'Анализатор на 1,5 ГГц со следящим генератором. Снимает АЧХ фильтра за один проход',
      specs: { freq: 1.5, danl: -155, rbw: 100, tg: true, form: 'Настольный' } }),
    P({ id: 'ssa3032x-plus', cat: 'spectrum', name: 'SSA3032X Plus', brand: 'Siglent', price: 380000, stock: 2, pop: 62, reg: true, dims: [393, 207, 117], mass: 4.4, tasks: ['rf'],
      short: 'До 3,2 ГГц, полоса RBW от 1 Гц и шумовой порог минус 161 дБм/Гц с предусилителем',
      specs: { freq: 3.2, danl: -161, rbw: 1, tg: true, form: 'Настольный' } }),
    P({ id: 'ssa-tg-r3', cat: 'spectrum', name: 'SSA-TG R3', brand: 'Arinst', price: 170000, stock: 3, pop: 59, reg: false, form: 'hand', dims: [81, 145, 27], mass: 0.4, tasks: ['rf'],
      short: 'Карманный анализатор весом 400 г со следящим генератором. Поиск помех и проверка антенн на объекте',
      specs: { freq: 9, danl: -144, rbw: 2500, tg: true, form: 'Портативный' } }),

    /* Тепловизоры */
    P({ id: 'e1l', cat: 'thermal', name: 'E1L', brand: 'HIKMICRO', price: 65240, stock: 10, pop: 86, reg: false, dims: [59, 196, 117], mass: 0.35, tasks: ['repair', 'study'],
      short: 'Простой тепловизор для поиска перегрева. Лазерный указатель и до 8 часов работы',
      specs: { res: '160×120', pix: 19200, netd: 40, tmax: 550, fps: 25, form: 'Пистолет' } }),
    P({ id: 'b10', cat: 'thermal', name: 'B10', brand: 'HIKMICRO', price: 59830, stock: 7, pop: 91, reg: true, dims: [74, 222, 124], mass: 0.38, tasks: ['power', 'repair', 'production'],
      short: 'Матрица 256 на 192 и предел 550 °C. Накладывает тепловую картинку на снимок обычной камеры',
      specs: { res: '256×192', pix: 49152, netd: 40, tmax: 550, fps: 25, form: 'Пистолет' } }),
    P({ id: 'm30', cat: 'thermal', name: 'M30', brand: 'HIKMICRO', price: 449990, stock: 3, pop: 69, reg: true, isNew: true, dims: [100, 244, 104], mass: 0.66, tasks: ['power', 'production'],
      short: 'Матрица 384 на 288, ручная фокусировка от 20 см и сенсорный экран. Для мелких компонентов',
      specs: { res: '384×288', pix: 110592, netd: 35, tmax: 550, fps: 30, form: 'Пистолет' } }),
    P({ id: 'mini2', cat: 'thermal', name: 'Mini2', brand: 'HIKMICRO', price: 45730, stock: 16, pop: 78, reg: false, form: 'module', dims: [42, 23, 11], mass: 0.02, tasks: ['repair', 'study'],
      short: 'Модуль для телефона весом 20 г. Тепловизор в кармане рядом с мультиметром',
      specs: { res: '256×192', pix: 49152, netd: 40, tmax: 400, fps: 25, form: 'Модуль' } }),

    /* LCR */
    P({ id: 'dt71', cat: 'lcr', name: 'DT71', brand: 'Miniware', price: 9880, stock: 15, pop: 79, reg: false, form: 'tweezers', dims: [20, 140, 12], mass: 0.02, tasks: ['repair', 'study'],
      short: 'Пинцет для SMD. Ёмкость, индуктивность и сопротивление прямо на плате, экран сам поворачивается под руку',
      specs: { fmax: 10, acc: 0.5, form: 'Пинцет' } }),
    P({ id: 'th2830', cat: 'lcr', name: 'TH2830', brand: 'Techmize', price: 131700, stock: 5, pop: 68, reg: true, dims: [235, 105, 360], mass: 3.6, tasks: ['production', 'rf'],
      short: 'Настольный мост до 100 кГц для входного контроля. Выход Handler для сортировки компонентов',
      specs: { fmax: 100, acc: 0.05, form: 'Настольный' } }),
    P({ id: 'bk891', cat: 'lcr', name: '891', brand: 'B&K Precision', price: 471000, stock: 2, pop: 51, reg: true, dims: [256, 112, 381], mass: 3.4, tasks: ['production', 'rf'],
      short: 'Мост до 300 кГц со свипом по частоте на 300 точек. Для силовых дросселей и исследований',
      specs: { fmax: 300, acc: 0.05, form: 'Настольный' } }),

    /* Паяльные станции */
    P({ id: 'fx-888d', cat: 'solder', name: 'FX-888D', brand: 'Hakko', price: 22690, stock: 31, pop: 94, reg: false, dims: [100, 120, 120], mass: 1.2, tasks: ['study', 'repair'],
      short: 'Классическая станция на 70 Вт для учёбы и ремонта. Пять пресетов температуры и защита паролем',
      specs: { w: 70, tmax: 480, heat: 25, form: 'Паяльная' } }),
    P({ id: 'ts1200a', cat: 'solder', name: 'TS1200A', brand: 'Quick', price: 18870, stock: 13, pop: 89, reg: false, dims: [137, 168, 114], mass: 2.7, tasks: ['repair', 'embedded', 'production'],
      short: 'Нагреватель прямо в жале, до 350 °C за 8 секунд. Держит температуру на массивных полигонах',
      specs: { w: 120, tmax: 420, heat: 8, form: 'Паяльная' } }),
    P({ id: '861dw', cat: 'solder', name: '861DW', brand: 'Quick', price: 27150, stock: 9, pop: 73, reg: false, form: 'air', dims: [188, 135, 245], mass: 3.9, tasks: ['repair'],
      short: 'Термовоздушная станция на 1000 Вт для демонтажа BGA и корпусов QFN. Сама засыпает в держателе',
      specs: { w: 1000, tmax: 500, heat: null, form: 'Термовоздушная' } }),
    P({ id: '712-esd', cat: 'solder', name: '712 ESD', brand: 'Quick', price: 39640, stock: 6, pop: 65, reg: false, form: 'air', isNew: true, dims: [185, 135, 245], mass: 4.8, tasks: ['repair', 'production'],
      short: 'Паяльник на 90 Вт и фен на 1000 Вт в одном корпусе. Освобождает половину стола',
      specs: { w: 1090, tmax: 500, heat: null, form: 'Комбинированная' } }),
  ];

  /* Задачи для подбора стола */
  CD.tasks = [
    { id: 'repair', name: 'Ремонт техники', text: 'Платы, блоки питания, бытовая электроника', needs: ['multimeter', 'scope', 'psu', 'solder', 'thermal'], optional: ['thermal'] },
    { id: 'power', name: 'Силовая электроника', text: 'Инверторы, приводы, зарядные станции', needs: ['scope', 'multimeter', 'psu', 'thermal'], optional: [] },
    { id: 'embedded', name: 'Встраиваемые системы', text: 'Микроконтроллеры, шины, прошивки', needs: ['scope', 'multimeter', 'psu', 'gen', 'solder'], optional: ['gen'] },
    { id: 'rf', name: 'Радиочастоты', text: 'Антенны, фильтры, усилители', needs: ['spectrum', 'gen', 'scope', 'lcr'], optional: ['lcr'] },
    { id: 'study', name: 'Учёба и хобби', text: 'Первая лаборатория дома', needs: ['multimeter', 'scope', 'psu', 'solder'], optional: ['scope'] },
    { id: 'production', name: 'Производство и контроль', text: 'Входной контроль и стенды', needs: ['multimeter', 'lcr', 'psu', 'thermal'], optional: ['thermal'] },
  ];

  /* Шпаргалки */
  CD.guides = [
    {
      id: 'polosa', title: 'Какая полоса нужна осциллографу', read: 4, cat: 'scope',
      lead: 'Полоса 100 МГц не значит, что на 100 МГц всё видно честно. На этой частоте прибор уже занижает амплитуду почти на треть',
      blocks: [
        ['Что такое полоса', ['Полоса это частота, на которой входной усилитель ослабляет синус на 3 дБ. В напряжении это примерно 30 процентов. Выше этой частоты сигнал продолжает проходить, но всё слабее.']],
        ['Правило пяти', ['Берите полосу в пять раз выше самой высокой частоты в сигнале. Тогда ошибка амплитуды останется в пределах нескольких процентов.', 'Для цифровых сигналов считайте не тактовую частоту, а фронт. Хорошая прикидка: полоса в герцах равна 0,35, делённым на время нарастания в секундах. Фронт 1 нс просит не меньше 350 МГц.']],
        ['Дискретизация и память', ['Частота выборок должна быть хотя бы в 2,5 раза выше полосы, а лучше в пять. При включении всех каналов она у многих приборов делится пополам.', 'Память определяет, как долго прибор держит полную скорость. Чем больше точек, тем длиннее запись без потери деталей.']],
      ],
    },
    {
      id: 'cat', title: 'CAT II, III и IV без мифов', read: 3, cat: 'multimeter',
      lead: 'Категория говорит не про точность, а про то, какой импульс прибор переживёт вместе с вами',
      blocks: [
        ['Где какая категория', ['CAT II это розетки и бытовые приборы. CAT III это щитки и стационарная проводка внутри здания. CAT IV это ввод в здание, счётчики и воздушные линии.']],
        ['Почему важен импульс', ['Чем ближе к источнику, тем мощнее возможный выброс. Для цепей до 600 В стандарт требует выдерживать импульс 4 кВ по CAT II, 6 кВ по CAT III и 8 кВ по CAT IV.', 'Прибор с CAT III на 1000 В и прибор с CAT IV на 600 В выдерживают одинаковые 8 кВ.']],
        ['На что смотреть при покупке', ['Проверяйте категорию на корпусе и на проводах. Цепь защищена настолько, насколько защищён её самый слабый элемент.']],
      ],
    },
    {
      id: 'razryady', title: 'Разряды, отсчёты и точность', read: 3, cat: 'multimeter',
      lead: 'Большой дисплей показывает больше цифр. Это ещё не значит, что все они верные',
      blocks: [
        ['Разрешение', ['Прибор на 3½ разряда показывает до 1999, на 4½ разряда до 19999. Чем больше отсчётов, тем меньше шаг на том же пределе. Это и есть цена деления цифрового прибора.']],
        ['Точность', ['Погрешность пишут как процент от показания плюс несколько единиц младшего разряда. Прибор с шестью цифрами на экране и погрешностью 0,5 процента не сделает третью цифру надёжной.']],
        ['Что выбрать', ['Для прозвонки и батарей хватает 6000 отсчётов. Для настройки источников и ремонта лучше от 20000. Для контроля партий и метрологии нужен настольный прибор на 5½ и 6½ разрядов.']],
      ],
    },
    {
      id: 'poverka', title: 'Поверка и калибровка это разное', read: 3, cat: null,
      lead: 'Поверка нужна, когда результат измерений имеет юридическую силу. Калибровка нужна, чтобы знать реальные свойства своего прибора',
      blocks: [
        ['Поверка', ['Это подтверждение, что прибор соответствует утверждённому типу и метрологическим требованиям. Её проводят аккредитованные организации, а результат попадает в федеральную базу ФГИС «Аршин». Поверять можно только приборы утверждённого типа.']],
        ['Калибровка', ['Это определение действительных значений характеристик прибора. Процедура добровольная. Подходит для лабораторий и разработки, где важна точность, но нет требований закона.']],
        ['Что нужно вам', ['Если прибор работает в сфере государственного регулирования, например в охране труда, энергетике и торговле, нужна поверка. Для домашней лаборатории и разработки хватает калибровки или заводского протокола.']],
      ],
    },
  ];

  CD.pages = [
    ['index.html', 'Главная'], ['catalog.html', 'Каталог'], ['product.html', 'Прибор'], ['compare.html', 'Сравнение'],
    ['podbor.html', 'Подбор'], ['service.html', 'Поверка'], ['guides.html', 'Шпаргалки'], ['guide.html', 'Шпаргалка'],
    ['info.html', 'Покупателям'], ['cart.html', 'Корзина'],
  ];

  CD.byId = (id) => CD.products.find((p) => p.id === id);
  CD.catOf = (id) => CD.cats.find((c) => c.id === id);
  CD.brands = [...new Set(CD.products.map((p) => p.brand))].sort((a, b) => a.localeCompare(b, 'ru'));
})();
