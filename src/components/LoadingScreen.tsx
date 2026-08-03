import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLang } from '../i18n'

const DURATION = 2700

export default function LoadingScreen({
  onComplete,
}: {
  onComplete: () => void
}) {
  const { t } = useLang()
  const [count, setCount] = useState(0)
  const [wordIndex, setWordIndex] = useState(0)

  // Счётчик 000 → 100 через requestAnimationFrame
  useEffect(() => {
    let raf = 0
    let done = false
    const start = performance.now()

    const finish = () => {
      if (done) return
      done = true
      setCount(100)
      window.setTimeout(onComplete, 400)
    }

    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / DURATION)
      setCount(Math.round(p * 100))
      if (p < 1) raf = requestAnimationFrame(tick)
      else finish()
    }
    raf = requestAnimationFrame(tick)

    // Подстраховка: в фоновой вкладке requestAnimationFrame останавливается,
    // поэтому экран загрузки закрываем по таймеру в любом случае.
    const fallback = window.setTimeout(finish, DURATION + 600)

    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(fallback)
    }
  }, [onComplete])

  // Смена слов каждые 900 мс
  useEffect(() => {
    const id = window.setInterval(
      () => setWordIndex((i) => (i + 1) % t.loading.words.length),
      900
    )
    return () => window.clearInterval(id)
  }, [t.loading.words.length])

  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-bg"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
    >
      {/* Метка сверху слева */}
      <motion.span
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="absolute top-8 left-6 md:left-10 text-xs text-muted uppercase tracking-[0.3em]"
      >
        {t.loading.label}
      </motion.span>

      {/* Слова по центру */}
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.span
            key={`${t.htmlLang}-${wordIndex}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="text-4xl md:text-6xl lg:text-7xl font-display italic text-text-primary/80 text-center"
          >
            {t.loading.words[wordIndex]}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Счётчик снизу справа */}
      <span className="absolute bottom-10 right-6 md:right-10 text-6xl md:text-8xl lg:text-9xl font-display text-text-primary tabular-nums leading-none">
        {String(count).padStart(3, '0')}
      </span>

      {/* Прогресс-бар */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-stroke/50">
        <div
          className="h-full accent-gradient origin-left"
          style={{
            transform: `scaleX(${count / 100})`,
            boxShadow: '0 0 8px rgba(137, 170, 204, 0.35)',
          }}
        />
      </div>
    </motion.div>
  )
}
