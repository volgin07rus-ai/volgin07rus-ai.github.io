import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLang } from '../i18n'

const TARGETS = ['#home', '#work', '#journal']

export default function Navbar() {
  const { t, toggle } = useLang()
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 md:pt-6 px-4">
      <div
        className={`inline-flex items-center rounded-full backdrop-blur-md border border-white/10 bg-surface px-2 py-2 transition-shadow ${
          scrolled ? 'shadow-md shadow-black/10' : ''
        }`}
      >
        {/* Логотип */}
        <a
          href="#home"
          className="group w-9 h-9 rounded-full p-[1.5px] shrink-0 transition-transform hover:scale-110 gradient-ring"
          aria-label={t.hero.name}
        >
          <span className="w-full h-full rounded-full bg-bg flex items-center justify-center">
            <span className="font-display italic text-[13px] text-text-primary leading-none">
              {t.initials}
            </span>
          </span>
        </a>

        <span className="hidden sm:block w-px h-5 bg-stroke mx-1" />

        {/* Ссылки — скрыты на узких экранах, чтобы плашка не вылезала
            за края (русские подписи длиннее английских) */}
        <div className="hidden sm:flex items-center">
          {t.nav.links.map((link, i) => (
            <a
              key={link}
              href={TARGETS[i]}
              onClick={() => setActive(i)}
              className={`text-xs sm:text-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 transition-colors whitespace-nowrap ${
                active === i
                  ? 'text-text-primary bg-stroke/50'
                  : 'text-muted hover:text-text-primary hover:bg-stroke/50'
              }`}
            >
              {link}
            </a>
          ))}
        </div>

        <span className="hidden sm:block w-px h-5 bg-stroke mx-1" />

        {/* Переключатель языка: подпись уезжает вверх, новая приходит снизу */}
        <motion.button
          onClick={toggle}
          aria-label={t.langToggle.aria}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          className="relative overflow-hidden text-xs sm:text-sm rounded-full px-3 py-1.5 sm:py-2 text-muted hover:text-text-primary hover:bg-stroke/50 transition-colors font-medium"
        >
          {/* Ширину держим невидимым близнецом, чтобы кнопка не дёргалась */}
          <span className="invisible" aria-hidden="true">
            {t.langToggle.label}
          </span>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={t.langToggle.label}
              initial={{ y: '110%', opacity: 0 }}
              animate={{ y: '0%', opacity: 1 }}
              exit={{ y: '-110%', opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {t.langToggle.label}
            </motion.span>
          </AnimatePresence>
        </motion.button>

        {/* Кнопка «Написать» */}
        <a
          href="#contact"
          className="group relative ml-1 inline-flex items-center rounded-full"
        >
          <span
            className="absolute rounded-full opacity-0 group-hover:opacity-100 transition-opacity gradient-ring"
            style={{ inset: '-2px' }}
          />
          <span className="relative bg-surface rounded-full backdrop-blur-md text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 text-text-primary whitespace-nowrap inline-flex items-center gap-1">
            {t.nav.sayHi}
            <span aria-hidden="true">↗</span>
          </span>
        </a>
      </div>
    </nav>
  )
}
