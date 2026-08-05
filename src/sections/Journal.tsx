import { motion } from 'framer-motion'
import { useLang } from '../i18n'
import { ARTICLES } from '../data/articles'
import { articleHref } from '../lib/useRoute'

const reveal = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-100px' },
  transition: { duration: 1, ease: [0.25, 0.1, 0.25, 1] as const },
}

export default function Journal() {
  const { t, lang } = useLang()

  return (
    <section id="journal" className="bg-bg py-16 md:py-24">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
        <motion.div {...reveal} className="mb-10 md:mb-14">
          <div className="flex items-center gap-3 mb-5">
            <span className="w-8 h-px bg-stroke" />
            <span className="text-xs text-muted uppercase tracking-[0.3em]">
              {t.journal.eyebrow}
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl tracking-tight leading-[1.05] mb-4">
            {t.journal.headingLead}{' '}
            <span className="font-display italic">
              {t.journal.headingItalic}
            </span>
          </h2>
          <p className="text-sm md:text-base text-muted max-w-lg">
            {t.journal.subtext}
          </p>
        </motion.div>

        {/* Записи */}
        <div className="flex flex-col gap-4">
          {ARTICLES.map((a, i) => {
            const text = a[lang]
            const date = lang === 'ru' ? a.dateRu : a.dateEn

            return (
              <motion.a
                key={a.slug}
                href={articleHref(a.slug)}
                {...reveal}
                transition={{ ...reveal.transition, delay: i * 0.06 }}
                className="group flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-5 sm:p-6 rounded-3xl sm:rounded-[40px] bg-surface/30 hover:bg-surface border border-stroke transition-colors"
              >
                <span className="flex-1 min-w-0">
                  <span className="block text-lg sm:text-xl text-text-primary leading-snug mb-1.5">
                    {text.title}
                  </span>
                  <span className="block text-sm text-muted leading-relaxed line-clamp-2 mb-2.5">
                    {text.excerpt}
                  </span>
                  <span className="flex flex-wrap items-center gap-x-2 text-xs text-muted">
                    <span className="uppercase tracking-[0.2em]">
                      {a.project}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{date}</span>
                    <span aria-hidden="true">·</span>
                    <span>{t.journal.readTime(a.minutes)}</span>
                  </span>
                </span>

                <span
                  aria-hidden="true"
                  className="text-muted group-hover:text-text-primary transition-colors shrink-0 self-end sm:self-center"
                >
                  →
                </span>
              </motion.a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
