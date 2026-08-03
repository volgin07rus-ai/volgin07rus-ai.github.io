import { motion } from 'framer-motion'
import { useLang } from '../i18n'
import ArtCard from '../components/ArtCard'

const reveal = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-100px' },
  transition: { duration: 1, ease: [0.25, 0.1, 0.25, 1] as const },
}

export default function Journal() {
  const { t } = useLang()

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

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h2 className="text-4xl md:text-6xl tracking-tight leading-[1.05] mb-4">
                {t.journal.headingLead}{' '}
                <span className="font-display italic">
                  {t.journal.headingItalic}
                </span>
              </h2>
              <p className="text-sm md:text-base text-muted max-w-md">
                {t.journal.subtext}
              </p>
            </div>

            <a
              href="#journal"
              className="group relative hidden md:inline-flex rounded-full shrink-0"
            >
              <span
                className="absolute rounded-full opacity-0 group-hover:opacity-100 transition-opacity gradient-ring"
                style={{ inset: '-2px' }}
              />
              <span className="relative rounded-full bg-bg border border-stroke group-hover:border-transparent text-sm px-6 py-3 text-text-primary inline-flex items-center gap-2 whitespace-nowrap transition-colors">
                {t.journal.viewAll}
                <span aria-hidden="true">→</span>
              </span>
            </a>
          </div>
        </motion.div>

        {/* Записи */}
        <div className="flex flex-col gap-4">
          {t.journal.items.map((item, i) => (
            <motion.a
              key={item.title}
              href="#journal"
              {...reveal}
              transition={{ ...reveal.transition, delay: i * 0.06 }}
              className="group flex items-center gap-4 sm:gap-6 p-4 rounded-[40px] sm:rounded-full bg-surface/30 hover:bg-surface border border-stroke transition-colors"
            >
              <span className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden shrink-0">
                <ArtCard index={i + 2} />
              </span>

              <span className="flex-1 min-w-0">
                <span className="block text-base sm:text-lg text-text-primary leading-snug group-hover:text-text-primary transition-colors">
                  {item.title}
                </span>
                <span className="block text-xs sm:text-sm text-muted mt-1">
                  {t.journal.readTime(item.min)} · {item.date}
                </span>
              </span>

              <span
                aria-hidden="true"
                className="text-muted group-hover:text-text-primary transition-colors pr-2 shrink-0"
              >
                →
              </span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  )
}
