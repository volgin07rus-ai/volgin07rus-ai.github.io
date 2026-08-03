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
      title: 'Студия',
      desc: 'Сайт дизайн-агентства с эффектом жидкого стекла, кинематографичным видеофоном и плавным появлением текста.',
    },
    en: {
      title: 'Studio',
      desc: 'A design agency site with a liquid-glass effect, cinematic video background and smooth blur-in typography.',
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
      title: 'Креативная студия',
      desc: 'Портфолио моушн-дизайнера: крупная типографика, работа со светом и аккуратные микровзаимодействия.',
    },
    en: {
      title: 'Creative Studio',
      desc: 'A motion designer portfolio: bold typography, work with light and careful micro-interactions.',
    },
  },
]
