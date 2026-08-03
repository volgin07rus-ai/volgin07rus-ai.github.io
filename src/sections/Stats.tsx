import { motion } from 'framer-motion'
import { useLang } from '../i18n'

export default function Stats() {
  const { t } = useLang()

  return (
    <section className="bg-bg py-16 md:py-24 border-t border-stroke/60">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8">
          {t.stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
              className="text-center sm:text-left"
            >
              <div className="text-5xl md:text-7xl font-display text-text-primary leading-none mb-3 tabular-nums">
                {s.value}
              </div>
              <div className="text-sm text-muted uppercase tracking-[0.2em]">
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
