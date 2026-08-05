import { motion } from 'framer-motion'
import { useLang } from '../i18n'
import { ARTICLES } from '../data/articles'

export default function ArticlePage({ slug }: { slug: string }) {
  const { t, lang } = useLang()
  const article = ARTICLES.find((a) => a.slug === slug)

  if (!article) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="text-3xl md:text-5xl font-display italic">
          {t.article.notFound}
        </h1>
        <a
          href="#"
          className="rounded-full border border-stroke px-6 py-3 text-sm hover:border-white/30 transition-colors"
        >
          {t.article.back}
        </a>
      </main>
    )
  }

  const text = article[lang]
  const date = lang === 'ru' ? article.dateRu : article.dateEn

  return (
    <main className="min-h-screen pt-28 md:pt-32 pb-24 px-6">
      <article className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <a
            href="#"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-text-primary transition-colors mb-10"
          >
            <span aria-hidden="true">←</span>
            {t.article.back}
          </a>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted mb-5">
            <span className="uppercase tracking-[0.2em]">{article.project}</span>
            <span aria-hidden="true">·</span>
            <span>{date}</span>
            <span aria-hidden="true">·</span>
            <span>{t.journal.readTime(article.minutes)}</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-display italic leading-[1.15] tracking-tight mb-6">
            {text.title}
          </h1>

          <p className="text-base md:text-lg text-muted leading-relaxed mb-12 pb-10 border-b border-stroke">
            {text.excerpt}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="flex flex-col gap-6"
        >
          {text.body.map((b, i) => {
            if (b.t === 'h2')
              return (
                <h2
                  key={i}
                  className="text-xl md:text-2xl text-text-primary mt-6 tracking-tight"
                >
                  {b.text}
                </h2>
              )
            if (b.t === 'quote')
              return (
                <blockquote
                  key={i}
                  className="border-l-2 border-white/25 pl-5 py-1 text-lg md:text-xl font-display italic text-text-primary leading-snug"
                >
                  {b.text}
                </blockquote>
              )
            if (b.t === 'code')
              return (
                <pre
                  key={i}
                  className="bg-surface border border-stroke rounded-xl p-4 overflow-x-auto text-xs md:text-sm leading-relaxed"
                >
                  <code>{b.text}</code>
                </pre>
              )
            return (
              <p
                key={i}
                className="text-base text-muted leading-[1.75]"
              >
                {b.text}
              </p>
            )
          })}
        </motion.div>

        {/* Ссылка на проект */}
        {article.projectUrl && (
          <div className="mt-14 pt-8 border-t border-stroke flex flex-wrap items-center gap-4">
            <span className="text-sm text-muted">
              {t.article.projectLine} {article.project}
            </span>
            <a
              href={article.projectUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-text-primary text-bg px-5 py-2 text-xs font-medium hover:opacity-90 transition-opacity"
            >
              {t.article.openProject} ↗
            </a>
          </div>
        )}
      </article>
    </main>
  )
}
