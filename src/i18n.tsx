import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type Lang = 'ru' | 'en'

const STORAGE_KEY = 'volgin-lang'

/* ------------------------------------------------------------------ */
/*  Словари                                                            */
/* ------------------------------------------------------------------ */

const ru = {
  htmlLang: 'ru',
  initials: 'ДВ',

  loading: {
    label: 'Портфолио',
    words: ['Дизайн', 'Создание', 'Вдохновение'],
  },

  nav: {
    links: ['Главная', 'Работы', 'Резюме'],
    sayHi: 'Написать',
  },

  hero: {
    eyebrow: "КОЛЛЕКЦИЯ '26",
    name: 'Дмитрий Волгин',
    roles: ['Креатор', 'Фулстек', 'Основатель', 'Исследователь'],
    roleLine: (role: ReactNode) => <>{role} — живёт и работает в Москве.</>,
    description:
      'Создаю цельный цифровой опыт, вникая в те детали и нюансы, которые оживляют интерфейсы.',
    ctaWorks: 'Смотреть работы',
    ctaReach: 'Связаться',
    scroll: 'ВНИЗ',
  },

  works: {
    eyebrow: 'Избранные работы',
    headingLead: 'Ключевые',
    headingItalic: 'проекты',
    subtext:
      'Подборка проектов, над которыми я работал — от идеи до запуска.',
    viewAll: 'Все работы на GitHub',
    view: 'Открыть',
    download: 'Скачать',
    app: 'Приложение',
    site: 'Сайт',
    email: 'Email-рассылка',
    code: 'Код',
    soon: 'Локально',
  },

  journal: {
    eyebrow: 'Журнал',
    headingLead: 'Недавние',
    headingItalic: 'мысли',
    subtext:
      'Разборы решений из моих проектов — почему сделано именно так, а не иначе.',
    viewAll: 'Все записи',
    readTime: (m: number) => `${m} мин чтения`,
  },

  article: {
    back: 'Ко всем работам',
    notFound: 'Статья не найдена',
    projectLine: 'Разбор по проекту',
    openProject: 'Открыть проект',
  },

  explorations: {
    eyebrow: 'Эксперименты',
    headingLead: 'Визуальная',
    headingItalic: 'площадка',
    subtext:
      'Пространство для свободных экспериментов с формой, светом и движением.',
    cta: 'Смотреть на Dribbble',
  },

  stats: [
    { value: '11', label: 'Проектов в портфолио' },
    { value: '10', label: 'Сайтов онлайн' },
    { value: '100%', label: 'Адаптивная вёрстка' },
  ],

  contact: {
    marquee: 'СОЗДАЁМ БУДУЩЕЕ',
    headingLead: 'Давайте создадим',
    headingItalic: 'что-то стоящее',
    subtext: 'Расскажите о задаче — отвечу в течение пары дней.',
    email: 'Написать на почту',
    available: 'Открыт для проектов',
    rights: 'Все права защищены.',
  },

  langToggle: { label: 'EN', aria: 'Switch to English' },
}

const en: typeof ru = {
  htmlLang: 'en',
  initials: 'DV',

  loading: {
    label: 'Portfolio',
    words: ['Design', 'Create', 'Inspire'],
  },

  nav: {
    links: ['Home', 'Work', 'Resume'],
    sayHi: 'Say hi',
  },

  hero: {
    eyebrow: "COLLECTION '26",
    name: 'Dmitry Volgin',
    roles: ['Creative', 'Fullstack', 'Founder', 'Scholar'],
    roleLine: (role: ReactNode) => <>A {role} lives in Moscow.</>,
    description:
      'Designing seamless digital interactions by focusing on the unique nuances which bring systems to life.',
    ctaWorks: 'See Works',
    ctaReach: 'Reach out',
    scroll: 'SCROLL',
  },

  works: {
    eyebrow: 'Selected Work',
    headingLead: 'Featured',
    headingItalic: 'projects',
    subtext: "A selection of projects I've worked on, from concept to launch.",
    viewAll: 'All work on GitHub',
    view: 'Open',
    download: 'Download',
    app: 'App',
    site: 'Site',
    email: 'Email newsletter',
    code: 'Code',
    soon: 'Local',
  },

  journal: {
    eyebrow: 'Journal',
    headingLead: 'Recent',
    headingItalic: 'thoughts',
    subtext:
      'Write-ups of decisions from my own projects — why it was built this way and not another.',
    viewAll: 'View all',
    readTime: (m: number) => `${m} min read`,
  },

  article: {
    back: 'Back to all work',
    notFound: 'Article not found',
    projectLine: 'A write-up from',
    openProject: 'Open project',
  },

  explorations: {
    eyebrow: 'Explorations',
    headingLead: 'Visual',
    headingItalic: 'playground',
    subtext:
      'A space for free experiments with form, light and movement.',
    cta: 'View on Dribbble',
  },

  stats: [
    { value: '11', label: 'Projects in portfolio' },
    { value: '10', label: 'Sites online' },
    { value: '100%', label: 'Responsive layouts' },
  ],

  contact: {
    marquee: 'BUILDING THE FUTURE',
    headingLead: "Let's build",
    headingItalic: 'something worth it',
    subtext: 'Tell me about your project — I reply within a couple of days.',
    email: 'Send an email',
    available: 'Available for projects',
    rights: 'All rights reserved.',
  },

  langToggle: { label: 'RU', aria: 'Переключить на русский' },
}

const DICTS = { ru, en }

export type Dict = typeof ru

/* ------------------------------------------------------------------ */
/*  Контекст                                                           */
/* ------------------------------------------------------------------ */

type LangCtx = { lang: Lang; t: Dict; toggle: () => void }

const LanguageContext = createContext<LangCtx | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window === 'undefined') return 'ru'
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved === 'ru' || saved === 'en') return saved
    return navigator.language?.toLowerCase().startsWith('ru') ? 'ru' : 'en'
  })

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, lang)
    document.documentElement.lang = lang
    document.title =
      lang === 'ru' ? 'Дмитрий Волгин — Портфолио' : 'Dmitry Volgin — Portfolio'
  }, [lang])

  const value = useMemo<LangCtx>(
    () => ({
      lang,
      t: DICTS[lang],
      toggle: () => setLang((l) => (l === 'ru' ? 'en' : 'ru')),
    }),
    [lang]
  )

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used inside LanguageProvider')
  return ctx
}
