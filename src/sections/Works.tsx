import { motion } from 'framer-motion'
import { useLang } from '../i18n'
import ArtCard from '../components/ArtCard'
import { PROJECTS } from '../data/projects'

const reveal = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-100px' },
  transition: { duration: 1, ease: [0.25, 0.1, 0.25, 1] as const },
}

// Чередование ширины колонок 7/5/5/7 — повторяется на любом числе проектов
const SPAN_PATTERN = [
  'md:col-span-7',
  'md:col-span-5',
  'md:col-span-5',
  'md:col-span-7',
]

const GITHUB = 'https://github.com/volgin07rus-ai'

export default function Works() {
  const { t, lang } = useLang()

  return (
    <section id="work" className="bg-bg py-12 md:py-16">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
        {/* Заголовок секции */}
        <motion.div {...reveal} className="mb-10 md:mb-14">
          <div className="flex items-center gap-3 mb-5">
            <span className="w-8 h-px bg-stroke" />
            <span className="text-xs text-muted uppercase tracking-[0.3em]">
              {t.works.eyebrow}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h2 className="text-4xl md:text-6xl tracking-tight leading-[1.05] mb-4">
                {t.works.headingLead}{' '}
                <span className="font-display italic">
                  {t.works.headingItalic}
                </span>
              </h2>
              <p className="text-sm md:text-base text-muted max-w-md">
                {t.works.subtext}
              </p>
            </div>

            <a
              href={GITHUB}
              target="_blank"
              rel="noreferrer"
              className="group relative hidden md:inline-flex rounded-full shrink-0"
            >
              <span
                className="absolute rounded-full opacity-0 group-hover:opacity-100 transition-opacity gradient-ring"
                style={{ inset: '-2px' }}
              />
              <span className="relative rounded-full bg-bg border border-stroke group-hover:border-transparent text-sm px-6 py-3 text-text-primary inline-flex items-center gap-2 whitespace-nowrap transition-colors">
                {t.works.viewAll}
                <span aria-hidden="true">→</span>
              </span>
            </a>
          </div>
        </motion.div>

        {/* Бенто-сетка проектов */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6">
          {PROJECTS.map((p, i) => {
            const info = p[lang]
            // Ссылки на репозитории скрыты — карточка ведёт только на сайт
            const primary = p.live

            return (
              <motion.article
                key={p.slug}
                {...reveal}
                transition={{ ...reveal.transition, delay: (i % 2) * 0.1 }}
                className={`group relative flex flex-col bg-surface border border-stroke rounded-3xl overflow-hidden ${
                  SPAN_PATTERN[i % SPAN_PATTERN.length]
                }`}
              >
                {/* Обложка — скриншот проекта */}
                <div className="relative aspect-[16/10] overflow-hidden shrink-0">
                  <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                    <ArtCard
                      index={i}
                      slug={p.slug}
                      alt={info.title}
                      tint={p.tint}
                    />
                  </div>
                  {/* Мягкий стык обложки с подписью */}
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface to-transparent" />

                  {/* Метка статуса */}
                  <div className="absolute top-4 right-4 z-10">
                    {p.kind === 'app' ? (
                      <span className="inline-flex items-center rounded-full bg-text-primary/90 px-3 py-1.5 text-[11px] font-medium text-bg">
                        {t.works.app}
                      </span>
                    ) : p.live ? (
                      <span className="inline-flex items-center gap-2 rounded-full bg-bg/80 backdrop-blur-md border border-stroke px-3 py-1.5 text-[11px] text-text-primary">
                        <span className="relative flex w-1.5 h-1.5">
                          <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                          <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        </span>
                        {p.kind === 'site' ? t.works.site : t.works.live}
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-bg/80 backdrop-blur-md border border-stroke px-3 py-1.5 text-[11px] text-muted">
                        {t.works.soon}
                      </span>
                    )}
                  </div>
                </div>

                {/* Подпись — на сплошном фоне, поэтому читается всегда */}
                <div className="flex flex-col flex-1 p-6 md:p-7 pt-4">
                  <div className="flex items-baseline gap-3 mb-2">
                    <h3 className="text-2xl md:text-3xl font-display italic text-text-primary leading-none">
                      {info.title}
                    </h3>
                    {p.year && (
                      <span className="text-xs text-muted tabular-nums">
                        {p.year}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-muted leading-relaxed line-clamp-3">
                    {info.desc}
                  </p>

                  {p.live && (
                    <div className="mt-5">
                      <a
                        href={p.live}
                        target="_blank"
                        rel="noreferrer"
                        className="relative z-20 inline-flex rounded-full bg-text-primary text-bg px-4 py-2 text-xs font-medium whitespace-nowrap hover:opacity-90 transition-opacity"
                      >
                        {p.kind === 'app' ? t.works.download : t.works.view} ↗
                      </a>
                    </div>
                  )}
                </div>

                {/* Ссылка на всю карточку — под кнопкой */}
                {primary && (
                  <a
                    href={primary}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute inset-0 z-10"
                    aria-label={`${t.works.view}: ${info.title}`}
                  />
                )}
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
