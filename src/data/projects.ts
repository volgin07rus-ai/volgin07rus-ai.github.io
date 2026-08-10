/** Категория в ярлыке карточки — как «DESIGN» у оригинала.
 *  Хранится ключом, а не подписью: подпись зависит от языка. */
export type Tag = 'site' | 'app' | 'email'

export type Project = {
  slug: string
  /** Название не переводится: это имя проекта, а не текст интерфейса */
  title: string
  tag: Tag
  year: string
  href: string
  /** Крупные карточки занимают две колонки, мелкие — одну */
  wide?: boolean
  /** Свежая работа помечается оранжевым ярлыком */
  fresh?: boolean
}

const SITE = 'https://volgin.site'

/**
 * Порядок важен: широкие и узкие карточки идут через одну, и каждая пара
 * складывается в полную строку сетки — семь колонок плюс пять. Стоит
 * сбить чередование, и в ряду остаётся дыра.
 */
export const PROJECTS: Project[] = [
  { slug: 'nook', title: 'Nook', tag: 'app', year: '2026', href: 'https://github.com/volgin07rus-ai/nook/releases/latest', wide: true },
  { slug: 'partner-group', title: 'Партнёр Групп', tag: 'site', year: '2026', href: 'https://prgr.pro' },
  { slug: 'domik-cafe', title: 'Домик', tag: 'site', year: '2026', href: 'https://domicafe.ru/' },
  { slug: 'lumora', title: 'Lumora', tag: 'site', year: '2026', href: `${SITE}/demo/lumora/index.html`, wide: true },
  { slug: 'baseline', title: 'Baseline', tag: 'site', year: '2026', href: `${SITE}/demo/baseline/index.html`, wide: true },
  { slug: 'raketa', title: 'Ракета', tag: 'email', year: '2026', href: `${SITE}/demo/raketa/index.html` },
  { slug: 'mesta', title: 'Места', tag: 'app', year: '2026', href: `${SITE}/demo/mesta/index.html` },
  { slug: 'synapsex', title: 'SynapseX', tag: 'site', year: '2026', href: `${SITE}/demo/synapsex/index.html`, wide: true },
  { slug: 'studio-agency', title: 'Aura', tag: 'site', year: '2026', href: `${SITE}/demo/studio-agency/index.html`, wide: true },
  { slug: 'asme', title: 'Asme', tag: 'site', year: '2026', href: `${SITE}/demo/asme/index.html` },
  { slug: 'mindloop', title: 'Mindloop', tag: 'site', year: '2026', href: `${SITE}/demo/mindloop/index.html` },
  { slug: 'linkflow', title: 'LinkFlow', tag: 'site', year: '2026', href: `${SITE}/demo/linkflow/index.html`, wide: true },
  { slug: 'veldara', title: 'Veldara', tag: 'site', year: '2026', href: `${SITE}/demo/veldara/index.html`, wide: true },
  { slug: 'terraelix', title: 'TerraElix', tag: 'site', year: '2026', href: `${SITE}/demo/terraelix/index.html` },
  { slug: 'creative-studio', title: 'Кубики', tag: 'site', year: '2026', href: `${SITE}/demo/creative-studio/index.html` },
]
