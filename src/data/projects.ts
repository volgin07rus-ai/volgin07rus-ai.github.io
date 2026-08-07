export type Project = {
  slug: string
  /** 'app' — готовое приложение, 'site' — рабочий сайт, 'demo' — учебная сборка */
  kind?: 'app' | 'site' | 'demo'
  /** Год проекта. Не указываем там, где точная дата неизвестна. */
  year?: string
  tech: string[]
  live?: string
  repo?: string
  /** Оттенок обложки (rgba) — чтобы карточки различались, оставаясь в тёмной гамме */
  tint: string
  ru: { title: string; desc: string }
  en: { title: string; desc: string }
}

/**
 * Демо, которые живут внутри этого же репозитория — в public/demo/<slug>/.
 * Отдельный репозиторий им не нужен: открываются как страницы портфолио.
 * Раскладывает их скрипт npm run sync:demos (запускается перед сборкой).
 *
 * Путь указан до index.html: dev-сервер Vite на «голую» папку отдаёт
 * не демо, а сам портфолио (SPA-fallback), а с явным файлом всё честно.
 */
const page = (slug: string) => `${import.meta.env.BASE_URL}demo/${slug}/index.html`

export const PROJECTS: Project[] = [
  {
    slug: 'nook',
    kind: 'app',
    year: '2026',
    tech: ['Tauri', 'Rust', 'React', 'TypeScript'],
    live: 'https://github.com/volgin07rus-ai/nook/releases/latest',
    repo: 'https://github.com/volgin07rus-ai/nook',
    tint: 'rgba(150,175,205,0.30)',
    ru: {
      title: 'Nook',
      desc: 'Личный менеджер задач для Windows и Android: задачи с подзадачами и повторами, напоминания, блокнот и виджет на рабочем столе. Всё хранится локально — без аккаунтов и облака.',
    },
    en: {
      title: 'Nook',
      desc: 'A personal task manager for Windows and Android: tasks with subtasks and recurrence, reminders, a notepad and a desktop widget. Everything is stored locally — no accounts, no cloud.',
    },
  },
  {
    slug: 'partner-group',
    kind: 'site',
    tech: ['React'],
    live: 'https://prgr.pro',
    tint: 'rgba(175,190,210,0.28)',
    ru: {
      title: 'Партнёр Групп',
      desc: 'Корпоративный сайт консалтинговой компании: стратегия и управление изменениями, реструктуризация бизнеса, привлечение инвестиций. Строгая типографика и сдержанная палитра.',
    },
    en: {
      title: 'Partner Group',
      desc: 'A corporate site for a consulting firm: strategy and change management, business restructuring, investment. Strict typography and a restrained palette.',
    },
  },
  {
    slug: 'domik-cafe',
    kind: 'site',
    year: '2026',
    tech: ['HTML', 'CSS', 'GSAP'],
    live: 'https://volgin07rus-ai.github.io/domik-cafe/prototype/home.html',
    repo: 'https://github.com/volgin07rus-ai/domik-cafe',
    tint: 'rgba(205,165,120,0.30)',
    ru: {
      title: 'Домик',
      desc: 'Сайт городской кофейни в центре Москвы — «место, где время идёт медленнее». Меню, галерея интерьеров и тёплая фактура: кирпич, дерево, приглушённый свет.',
    },
    en: {
      title: 'Domik',
      desc: 'A site for a city coffee shop in central Moscow — “a place where time runs slower”. Menu, interior gallery and warm textures: brick, wood and soft light.',
    },
  },
  // Свежие демо идут первыми: они собраны целиком, со всеми секциями и состояниями.
  {
    slug: 'lumora',
    year: '2026',
    tech: ['HTML', 'CSS', 'Lenis'],
    live: page('lumora'),
    tint: 'rgba(215,150,95,0.28)',
    ru: {
      title: 'Lumora',
      desc: 'Сайт студии рекламной съёмки: плавный скролл, галерея кадров с перелистыванием, живые часы и форма заявки. Тёплый свет и крупная типографика.',
    },
    en: {
      title: 'Lumora',
      desc: 'A commercial photography studio site: smooth scrolling, a swipeable frame gallery, a live clock and an enquiry form. Warm light and bold typography.',
    },
  },
  {
    slug: 'baseline',
    year: '2026',
    tech: ['HTML', 'CSS', 'Lenis'],
    live: page('baseline'),
    tint: 'rgba(120,180,140,0.28)',
    ru: {
      title: 'Baseline',
      desc: 'Сайт теннисного клуба и академии: корты, тренеры с переключением карточек, расписание и контакты. Мобильное меню и раскрытие блоков по скроллу.',
    },
    en: {
      title: 'Baseline',
      desc: 'A tennis club and academy site: courts, switchable coach cards, schedule and contacts. Mobile menu and scroll-driven reveals.',
    },
  },
  {
    slug: 'raketa',
    year: '2026',
    tech: ['React', 'TypeScript', 'Tailwind'],
    live: page('raketa'),
    tint: 'rgba(200,215,110,0.28)',
    ru: {
      title: 'Ракета',
      desc: 'Письмо-лендинг для email-рассылки: курс о внедрении ИИ. Формат письма шириной 640 px, видео вместо статичных баннеров и лаймовые призывы к действию.',
    },
    en: {
      title: 'Raketa',
      desc: 'An email-style landing page for a newsletter: a course on leading AI adoption. A 640px email layout, video instead of static banners and lime call-to-action blocks.',
    },
  },
  {
    slug: 'mesta',
    year: '2026',
    tech: ['HTML', 'CSS', 'JavaScript'],
    live: page('mesta'),
    tint: 'rgba(140,160,200,0.28)',
    ru: {
      title: 'Места',
      desc: 'Витрина двух экранов мобильного приложения: онбординг и подписка. Корпуса iPhone свёрстаны вручную, видеофон и появление блоков по очереди.',
    },
    en: {
      title: 'Mesta',
      desc: 'A showcase of two mobile app screens: onboarding and subscription. Hand-built iPhone frames, video backgrounds and staggered entrance animations.',
    },
  },
  {
    slug: 'synapsex',
    year: '2026',
    tech: ['React', 'TypeScript', 'Framer Motion'],
    live: 'https://volgin07rus-ai.github.io/synapsex/',
    repo: 'https://github.com/volgin07rus-ai/synapsex',
    tint: 'rgba(137,170,204,0.30)',
    ru: {
      title: 'SynapseX',
      desc: 'Лендинг об эволюции интерфейсов: скролл-анимации, эффект расшифровки текста и крупный типографический водяной знак.',
    },
    en: {
      title: 'SynapseX',
      desc: 'A landing page about the evolution of interfaces: scroll animations, text-scramble effect and a bold typographic watermark.',
    },
  },
  {
    slug: 'studio-agency',
    year: '2026',
    tech: ['React', 'Tailwind', 'Framer Motion'],
    live: 'https://volgin07rus-ai.github.io/studio-agency/',
    repo: 'https://github.com/volgin07rus-ai/studio-agency',
    tint: 'rgba(190,200,215,0.26)',
    ru: {
      title: 'Дом',
      desc: 'Сайт парфюмерного дома: эффект жидкого стекла, кинематографичный видеофон и плавное появление текста по буквам.',
    },
    en: {
      title: 'Maison',
      desc: 'A perfume house site: a liquid-glass effect, cinematic video background and smooth letter-by-letter blur-in typography.',
    },
  },
  {
    slug: 'asme',
    year: '2026',
    tech: ['React', 'Vite', 'Framer Motion'],
    live: 'https://volgin07rus-ai.github.io/asme/',
    repo: 'https://github.com/volgin07rus-ai/asme',
    tint: 'rgba(150,185,170,0.26)',
    ru: {
      title: 'Asme',
      desc: 'Медиа-лендинг с полноэкранным видео, бесшовным циклом и стеклянными карточками поверх движущегося фона.',
    },
    en: {
      title: 'Asme',
      desc: 'A media landing page with full-screen video, a seamless loop and glass cards layered over moving footage.',
    },
  },
  {
    slug: 'mindloop',
    year: '2026',
    tech: ['React', 'hls.js', 'Framer Motion'],
    live: 'https://volgin07rus-ai.github.io/mindloop/',
    repo: 'https://github.com/volgin07rus-ai/mindloop',
    tint: 'rgba(170,170,180,0.24)',
    ru: {
      title: 'Mindloop',
      desc: 'Тёмная монохромная платформа для рассылок: пословное проявление текста по скроллу и потоковое HLS-видео.',
    },
    en: {
      title: 'Mindloop',
      desc: 'A dark monochrome newsletter platform: scroll-driven word-by-word text reveal and HLS video streaming.',
    },
  },
  {
    slug: 'linkflow',
    year: '2026',
    tech: ['React', 'Canvas', 'Tailwind'],
    live: 'https://volgin07rus-ai.github.io/linkflow/',
    repo: 'https://github.com/volgin07rus-ai/linkflow',
    tint: 'rgba(133,171,139,0.28)',
    ru: {
      title: 'LinkFlow',
      desc: 'Продукт для автоматизации процессов. Фон — видео-«бумеранг»: кадры пишутся в canvas и играют вперёд-назад.',
    },
    en: {
      title: 'LinkFlow',
      desc: 'A workflow automation product. The background is a video boomerang: frames are captured to canvas and played back and forth.',
    },
  },
  {
    slug: 'veldara',
    year: '2026',
    tech: ['Vite', 'CSS Animations'],
    live: 'https://volgin07rus-ai.github.io/veldara/',
    repo: 'https://github.com/volgin07rus-ai/veldara',
    tint: 'rgba(160,150,200,0.26)',
    ru: {
      title: 'Veldara',
      desc: 'Промо-страница движка для 3D-миров в вебе: скролл-сцены, видеофон и последовательное раскрытие карточек.',
    },
    en: {
      title: 'Veldara',
      desc: 'A promo page for a web 3D-worlds engine: scroll scenes, video background and sequentially revealed cards.',
    },
  },
  {
    slug: 'terraelix',
    year: '2026',
    tech: ['React', 'Tailwind'],
    live: 'https://volgin07rus-ai.github.io/terraelix/',
    repo: 'https://github.com/volgin07rus-ai/terraelix',
    tint: 'rgba(150,180,150,0.26)',
    ru: {
      title: 'TerraElix',
      desc: 'Лендинг велнес-бренда. Заголовок раскрывается по словам через маску — с точной настройкой межстрочных интервалов.',
    },
    en: {
      title: 'TerraElix',
      desc: 'A wellness brand landing page. The headline reveals word by word through a mask, with carefully tuned line heights.',
    },
  },
  {
    slug: 'creative-studio',
    year: '2026',
    tech: ['HTML', 'CSS', 'Vite'],
    live: 'https://volgin07rus-ai.github.io/creative-studio/',
    repo: 'https://github.com/volgin07rus-ai/creative-studio',
    tint: 'rgba(200,175,160,0.26)',
    ru: {
      title: 'Кубики',
      desc: 'Сайт инди-игровой студии: воксельный герой на весь экран, крупная типографика и аккуратные микровзаимодействия.',
    },
    en: {
      title: 'Kubiki',
      desc: 'An indie game studio site: a full-screen voxel character, bold typography and careful micro-interactions.',
    },
  },
]
