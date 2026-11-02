import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * Два языка сайта.
 *
 * Весь текст лежит здесь, а не по компонентам: так видно сразу обе версии
 * и нельзя случайно перевести половину. Английский словарь обязан
 * повторять форму русского — за этим следит тип Dict, а его выводит сам
 * русский словарь.
 *
 * Выбор храним в браузере. При первом заходе смотрим язык браузера:
 * русский оставляем русским, всё прочее открываем по-английски.
 */
export type Lang = 'ru' | 'en'

const KEY = 'volgin-lang'

const RU = {
  htmlLang: 'ru',
  locale: 'ru-RU',
  title: 'Дмитрий Волгин — сайты, которые живут',
  description:
    'Собираю сайты и приложения для брендов и команд, которым важно не только как выглядит, но и как работает.',

  nav: {
    items: [
      { label: 'О себе', href: '#about' },
      { label: 'Работы', href: '#work' },
      { label: 'Услуги', href: '#services' },
      { label: 'Автоматизация', href: '#automation' },
    ],
    contact: 'Связаться',
    logoAlt: 'Волгин',
    /** Кнопка подписана языком, на который переключит, а не текущим */
    switchLabel: 'EN',
    switchCursor: 'In English',
    menu: 'Меню',
  },

  cursor: { open: 'Открыть', go: 'Перейти', write: 'Написать', top: 'Наверх' },

  curtain: ['Сайты, которые живут', 'Дмитрий Волгин'],

  hero: {
    /** Перевод строки задаёт разбивку монументального заголовка */
    headline: 'САЙТЫ, КОТОРЫЕ\nЖИВУТ',
    /** Кегль подобран замером: длинная строка занимает ширину экрана */
    headlineSize: 'clamp(28px, calc(12.56vw - 4px), 211px)',
    /**
     * Ширина букв. Сжимаем — и при той же ширине строки кегль вырастает,
     * то есть буквы становятся выше. У оригинала строки короткие
     * («Sites that»), там сжимать нечего; у нас строка длиннее.
     */
    headlineWidth: '88%',
    /** На телефоне сжимаем сильнее — и та же строка встаёт крупнее */
    headlineSizeMob: 'clamp(28px, calc(19.13vw - 6.1px), 150px)',
    headlineWidthMob: '66%',
    role: 'Дизайн, код и ИИ',
    /** Показываем текущий язык — кнопка в шапке показывает следующий */
    code: 'RU',
    zone: 'MSK',
    lead: 'Собираю сайты и приложения для брендов и команд, которым важно не только как выглядит, но и как работает',
    /** Короткая замена длинной строке на телефоне — как в оригинале */
    role2: 'Дизайнер +\nРазработчик',
  },

  about: {
    lead: 'Я разработчик и дизайнер из Москвы. Работаю там, где визуальный язык встречается с кодом: собираю интерфейсы целиком, от первого наброска до запуска',
    cardName: 'Дмитрий Волгин',
    cardTitle: 'Дизайн и код',
    statsTitle: 'Коротко о цифрах',
    stats: [
      { v: '1', u: '', l: 'Подрядчик вместо трёх' },
      { v: '70+', u: '', l: 'Проектов сделано' },
      { v: '7', u: 'дней', l: 'От старта до запуска' },
    ],
  },

  work: {
    title: 'Работы',
    fresh: 'Новое',
    /** Кнопка под первой пятёркой карточек */
    more: 'Смотреть ещё',
    tags: { site: 'Сайт', app: 'Приложение', email: 'Рассылка' },
  },

  services: {
    heading: 'УСЛУГИ',
    /** Кегль подобран так, чтобы слово занимало всю ширину блока */
    headingSize: 'clamp(55px, 19.4vw, 396px)',
    cards: [
      {
        title: 'Разбираюсь',
        body: 'Закладываю основу: стратегия, стиль и структура. От знакомства с задачей до визуального направления — всё начинается здесь',
      },
      {
        title: 'Проектирую',
        body: 'Собираю ясные, смелые интерфейсы с характером. Точная типографика, движение со смыслом — от первого экрана до последнего состояния',
      },
      {
        title: 'Собираю',
        body: 'Оживляю макет кодом: плавно, отзывчиво, доступно. От разметки до микровзаимодействий — работает целиком и не устаревает',
      },
    ],
  },

  automation: {
    label: 'Автоматизация и ИИ',
    /** Перевод строки задаёт разбивку заголовка, слово accent горит оранжевым */
    heading: 'Рутину\nзабирает ИИ',
    accent: 'ИИ',
    lead: 'Внедряю ИИ и автоматизацию в бизнес. Всё, что сотрудники изо дня в день делают по шаблону, можно отдать системе',
    /** Что умеет система, метками под абзацем */
    can: ['КП в стиле компании', 'Презентации из текста', 'Ответ на заявку сразу', 'Договоры и счета', 'Разбор писем и сканов', 'Проверка договоров', 'Отчёты и сводки', 'Боты в Telegram'],
    /**
     * Пример на схеме и строки «из практики» взяты из настоящих проектов,
     * но без названий компаний: клиенты не давали согласия их раскрывать.
     * Между числом и единицей неразрывный пробел: единица не уезжает на новую строку
     */
    flowTitle: 'Как это работает на одной заявке',
    flow: [
      { step: 'Заявка с сайта', quote: 'Нужно доставить 5\u00a0тонн оборудования из Москвы в Новосибирск до конца месяца', from: 'Форма на сайте · отдел закупок', rows: [] as string[][], checks: [] as string[] },
      { step: 'ИИ разбирает', quote: '', from: '', rows: [['Маршрут', 'Москва → Новосибирск'], ['Груз', '5\u00a0т оборудования'], ['Срок', 'до 30\u00a0ноября'], ['Тариф', 'по прайсу']], checks: [] as string[] },
      { step: 'КП в стиле компании', quote: '', from: '', rows: [] as string[][], checks: ['Фирменный шаблон', 'Расчёт по тарифам', 'PDF готов'] },
      { step: 'Отправлено клиенту', quote: '', from: '', rows: [] as string[][], checks: ['Письмо с КП', 'Сделка в CRM', 'Напоминание через 2\u00a0дня'] },
    ],
    tasksTitle: 'Что автоматизирую',
    /** Подпись перед примером под каждой задачей */
    practice: 'Из практики',
    tasks: [
      { title: 'КП и документы в стиле компании', body: 'Коммерческие предложения, презентации, договоры и счета собираются из заявки, таблиц и 1С в вашем фирменном стиле и сразу уходят клиенту', example: 'Экспорт в Китай. Спецификация, CMR, инвойс и контракт на двух языках из одной таблицы' },
      { title: 'ИИ читает документы', body: 'Разбирает письма, сканы и реквизиты, проверяет чужие договоры и предлагает правки в режиме рецензирования Word', example: 'Строительная экспертиза. КП из документов заказчика, договор из КП, журнал работ из фото и видео' },
      { title: 'CRM под ваши процессы', body: 'Своя система вместо разрозненных таблиц: отделы, роли, расчёт стоимости, зарплата по формуле владельца, загрузка из 1С', example: 'Транспортная компания. Склад, контейнерный и авиаотдел, документы как в 1С' },
      { title: 'Контроль и уведомления', body: 'Проверка контрагентов по открытым источникам, разнос банковских платежей, сводки и тревоги в Telegram', example: 'Перевозчик. Платежи из банка сами разносятся по заявкам, сканы документов проверяются' },
    ],
    stepsTitle: 'Как работаю',
    steps: ['Нахожу, где теряется время', 'Показываю рабочий прототип, а не презентацию', 'Внедряю и учу команду'],
    cta: 'Обсудить автоматизацию',
  },

  footer: {
    /** Надпись на пропуске запечена картинкой внутри сцены — сцен две */
    badge: 'badge/scene.splinecode',
    markHead: 'Дмитрий ',
    markTail: 'Волгин',
    /**
     * Ширина букв подписи. Кириллица в Gravity шире латиницы, и при равной
     * ширине колонки русская подпись вставала кеглем на пятую часть мельче
     * английской — из-под верхней секции выезжала заметно меньшая надпись.
     * Сжимаем буквы по оси ширины, и кегль возвращается к английскому.
     */
    markWidth: '74%',
    colSections: 'Разделы',
    colContact: 'Связь',
    linkAbout: 'О себе',
    linkServices: 'Как я работаю',
    linkWork: 'Работы',
    cta: 'Готовы начать проект? Расскажите о задаче',
    ctaButton: 'Написать мне',
    copyright: '© 2026 Дмитрий Волгин · Все права защищены',
  },
}

export type Dict = typeof RU

const EN: Dict = {
  htmlLang: 'en',
  locale: 'en-GB',
  title: 'Dmitry Volgin — websites that live',
  description:
    'I build websites and apps for brands and teams who care as much about how it works as how it looks.',

  nav: {
    items: [
      { label: 'About', href: '#about' },
      { label: 'Work', href: '#work' },
      { label: 'Services', href: '#services' },
      { label: 'Automation', href: '#automation' },
    ],
    contact: 'Contact',
    logoAlt: 'Volgin',
    switchLabel: 'RU',
    switchCursor: 'По-русски',
    menu: 'Menu',
  },

  cursor: { open: 'Open', go: 'Go', write: 'Write', top: 'Top' },

  curtain: ['Websites that live', 'Dmitry Volgin'],

  hero: {
    headline: 'WEBSITES THAT\nLIVE',
    headlineSize: 'clamp(28px, calc(12.95vw - 4.1px), 218px)',
    headlineWidth: '96%',
    headlineSizeMob: 'clamp(28px, calc(17.3vw - 5.5px), 150px)',
    headlineWidthMob: '78%',
    role: 'Design, code & AI',
    code: 'EN',
    zone: 'MSK',
    lead: 'I build websites and apps for brands and teams who care as much about how it works as how it looks',
    role2: 'Designer +\nDeveloper',
  },

  about: {
    lead: 'I am a developer and designer from Moscow. I work where visual language meets code: I build interfaces end to end, from the first sketch to launch',
    cardName: 'Dmitry Volgin',
    cardTitle: 'Design & code',
    statsTitle: 'By the numbers',
    stats: [
      { v: '1', u: '', l: 'Contractor instead of three' },
      { v: '70+', u: '', l: 'Projects shipped' },
      { v: '7', u: 'days', l: 'From start to launch' },
    ],
  },

  work: {
    title: 'Work',
    fresh: 'New',
    more: 'Show more',
    tags: { site: 'Website', app: 'App', email: 'Email' },
  },

  services: {
    heading: 'SERVICES',
    // Букв на две больше, чем в «УСЛУГИ», поэтому кегль меньше. Доля
    // подобрана замером: слово должно занимать ту же ширину блока
    headingSize: 'clamp(46px, 16.37vw, 334px)',
    cards: [
      {
        title: 'Discover',
        body: 'Laying the groundwork: strategy, style and structure. From the first look at the brief to a visual direction — it all starts here',
      },
      {
        title: 'Design',
        body: 'Clear, bold interfaces with character. Precise typography, motion with a purpose — from the first screen to the last state',
      },
      {
        title: 'Build',
        body: 'Bringing the layout to life in code: smooth, responsive, accessible. From markup to micro-interactions — it works end to end and ages well',
      },
    ],
  },

  automation: {
    label: 'Automation and AI',
    heading: 'AI takes\nthe routine',
    accent: 'AI',
    lead: 'I bring AI and automation into businesses. Anything your team does by template day after day can be handed to a system',
    can: ['Branded quotes', 'Decks from text', 'Instant replies to leads', 'Contracts and invoices', 'Reading emails and scans', 'Contract review', 'Reports and summaries', 'Telegram bots'],
    flowTitle: 'How it works on a single lead',
    flow: [
      { step: 'Website lead', quote: 'We need 5\u00a0tonnes of equipment delivered from Moscow to Novosibirsk by the end of the month', from: 'Website form · procurement', rows: [] as string[][], checks: [] as string[] },
      { step: 'AI sorts it', quote: '', from: '', rows: [['Route', 'Moscow → Novosibirsk'], ['Cargo', '5\u00a0t of equipment'], ['Deadline', 'by 30\u00a0November'], ['Rate', 'from the price list']], checks: [] as string[] },
      { step: 'Branded quote', quote: '', from: '', rows: [] as string[][], checks: ['Company template', 'Priced by tariffs', 'PDF ready'] },
      { step: 'Sent to client', quote: '', from: '', rows: [] as string[][], checks: ['Email with the quote', 'Deal in the CRM', 'Reminder in 2\u00a0days'] },
    ],
    tasksTitle: 'What I automate',
    practice: 'In practice',
    tasks: [
      { title: 'Branded quotes and documents', body: 'Quotes, decks, contracts and invoices are assembled from the lead, spreadsheets and 1C in your brand style and go straight to the client', example: 'Export to China. Specification, CMR, invoice and a bilingual contract from one spreadsheet' },
      { title: 'AI reads documents', body: "Sorts emails, scans and company details, checks other parties' contracts and suggests edits in Word track changes", example: 'Construction surveys. Quotes from client documents, contracts from quotes, a work log from photos and video' },
      { title: 'A CRM built around you', body: 'One system instead of scattered spreadsheets: departments, roles, pricing, pay by the owner\'s formula, import from 1C', example: 'Transport company. Warehouse, container and air departments, documents just like in 1C' },
      { title: 'Checks and alerts', body: 'Counterparty checks from open sources, matching bank payments, summaries and alerts in Telegram', example: 'Carrier. Bank payments match themselves to orders, document scans get checked' },
    ],
    stepsTitle: 'How I work',
    steps: ['Find where time is lost', 'Show a working prototype, not a slide deck', 'Roll it out and train the team'],
    cta: 'Discuss automation',
  },

  footer: {
    badge: 'badge/scene-en.splinecode',
    markHead: 'Dmitry ',
    markTail: 'Volgin',
    markWidth: '88%',
    colSections: 'Sections',
    colContact: 'Contact',
    linkAbout: 'About',
    linkServices: 'How I work',
    linkWork: 'Work',
    cta: 'Ready to start a project? Tell me about it',
    ctaButton: 'Get in touch',
    copyright: '© 2026 Dmitry Volgin · All rights reserved',
  },
}

const DICTS: Record<Lang, Dict> = { ru: RU, en: EN }

function initial(): Lang {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'ru' || saved === 'en') return saved
  } catch {
    // Приватный режим — читать хранилище нельзя, это не повод падать
  }
  return navigator.language?.toLowerCase().startsWith('ru') ? 'ru' : 'en'
}

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: Dict }>({
  lang: 'ru',
  setLang: () => {},
  t: RU,
})

/** Сколько держится завеса, пока текст подменяется */
const VEIL_MS = 220

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangNow] = useState<Lang>(initial)
  const [veil, setVeil] = useState(false)
  const timer = useRef(0)
  const t = DICTS[lang]

  useEffect(() => {
    document.documentElement.lang = t.htmlLang
    document.title = t.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.description)
    try {
      localStorage.setItem(KEY, lang)
    } catch {
      // Не сохранилось — язык просто не переживёт перезагрузку
    }
  }, [lang, t])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  /**
   * Перевод идёт под завесой: страница затемняется, текст подменяется в
   * темноте, завеса уходит. Иначе смена читается рывком — разом
   * переставляются все надписи, а следом ещё и кегли, подогнанные
   * замером.
   *
   * Затемняем отдельным слоем поверх страницы, а не прозрачностью самой
   * страницы: прозрачность у предка собрала бы содержимое в отдельную
   * группу, и наложения difference на первом экране поплыли бы прямо
   * посреди перехода.
   */
  const setLang = (next: Lang) => {
    if (next === lang) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setLangNow(next)
      return
    }
    setVeil(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      setLangNow(next)
      // Снимаем завесу через кадр: к этому времени новый текст уже отрисован
      requestAnimationFrame(() => requestAnimationFrame(() => setVeil(false)))
    }, VEIL_MS)
  }

  return (
    <Ctx.Provider value={{ lang, setLang, t }}>
      {children}
      <div className={`lang-veil ${veil ? 'is-on' : ''}`} aria-hidden="true" />
    </Ctx.Provider>
  )
}

export function useLang() {
  return useContext(Ctx)
}
