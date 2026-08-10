import { useEffect, useRef, useState } from 'react'
import SwooshButton from './SwooshButton'
import { useLang } from '../lib/lang'

/**
 * Меню закреплено сверху и прячется при листании вниз, возвращаясь при
 * листании вверх — так же, как в оригинале: там оно уезжает ровно
 * на свою высоту через translateY.
 *
 * Знак вынесен из шапки отдельным элементом верхнего уровня. Иначе никак:
 * он подкрашивается наложением difference, а наложение считается только
 * с тем, что лежит под элементом внутри его контекста. Шапка со своим
 * z-index — это отдельный контекст, и знак внутри неё смешивался бы
 * с пустотой, а не с фоном страницы.
 *
 * Направление прокрутки считаем сами и пишем сдвиг прямо в стиль: scroll
 * стреляет часто, и состояние React на каждом кадре здесь ни к чему.
 */
export default function Navbar() {
  const bar = useRef<HTMLElement>(null)
  const mark = useRef<HTMLAnchorElement>(null)
  const { lang, setLang, t } = useLang()
  const [open, setOpen] = useState(false)

  // Меню закрывается по Esc, по уходу на широкий экран и по прокрутке:
  // раскрытая панель, висящая над уехавшим содержимым, читается поломкой
  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    const wide = matchMedia('(min-width: 768px)')
    window.addEventListener('keydown', onKey)
    window.addEventListener('scroll', close, { passive: true })
    wide.addEventListener('change', close)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', close)
      wide.removeEventListener('change', close)
    }
  }, [open])

  useEffect(() => {
    const nodes = [bar.current, mark.current].filter(Boolean) as HTMLElement[]
    if (!nodes.length) return

    let last = scrollY
    let hidden = false
    let frame = 0

    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const y = scrollY
        const delta = y - last
        // Мелкие подрагивания игнорируем, иначе меню дёргается
        if (Math.abs(delta) < 6) return
        // У самого верха меню всегда на месте
        const shouldHide = delta > 0 && y > nodes[0].offsetHeight * 2

        if (shouldHide !== hidden) {
          hidden = shouldHide
          for (const n of nodes) n.style.transform = hidden ? 'translateY(-110%)' : 'translateY(0)'
        }
        last = y
      })
    }

    window.addEventListener('scroll', update, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', update)
    }
  }, [])

  const slide = { transition: 'transform .5s cubic-bezier(0.19, 1, 0.22, 1)' }

  return (
    <>
      {/* Знак без подложки: difference сам делает его светлым на тёмном
          и тёмным на светлом.

          Прижат к нулю, отступ внутренний: при сдвиге на свою высоту знак
          должен уходить целиком, а внешний отступ остался бы за кадром и
          знак выглядывал бы полоской. */}
      <a
        ref={mark}
        href="#home"
        data-cursor={t.cursor.top}
        className="nav-mark fixed left-6 md:left-10 top-0 py-4 z-[41] flex items-center"
        style={slide}
      >
        <img
          src={`${import.meta.env.BASE_URL}logo.png`}
          alt={t.nav.logoAlt}
          width={683}
          height={399}
          className="h-8 w-auto brightness-0 invert"
        />
      </a>

      <header
        ref={bar}
        className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-6 md:px-10 py-4 text-fog"
        style={slide}
      >
        {/* Место знака: сам он лежит выше по дереву, а здесь держит разметку */}
        <span className="w-14 h-8 block" aria-hidden="true" />

        <nav className="hidden md:flex items-center gap-2">
          {t.nav.items.map((l) => (
            <SwooshButton key={l.href} href={l.href} tone="light" dot={false} cursor={t.cursor.go}>
              <span className="text-ember mr-1">+</span>
              {l.label}
            </SwooshButton>
          ))}
        </nav>

        {/* Переключатель языка подписан тем языком, на который переведёт:
            надпись «EN» на русском сайте читается как действие, а не как
            сообщение о текущем состоянии. Текущий язык при этом виден
            рядом с часами на первом экране. */}
        <div className="relative flex items-center gap-2">
          <SwooshButton
            tone="light"
            dot={false}
            cursor={t.nav.switchCursor}
            onClick={() => setLang(lang === 'ru' ? 'en' : 'ru')}
            aria-label={t.nav.switchCursor}
          >
            {t.nav.switchLabel}
          </SwooshButton>

          {/* На широком экране «связаться» стоит в самой шапке, на узком
              уходит внутрь меню — как в оригинале. Прячем обёрткой, а не
              классом на самой кнопке: у .swoosh свой display, и он бы
              перебил утилиту */}
          <div className="hidden md:block">
            <SwooshButton href="#contact" tone="light" cursor={t.cursor.write}>
              {t.nav.contact}
            </SwooshButton>
          </div>

          <div className="md:hidden">
            <SwooshButton
              tone="light"
              cursor={t.nav.menu}
              className={open ? 'swoosh--on' : ''}
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
            >
              {t.nav.menu}
            </SwooshButton>
          </div>

          {/* Панель меню: тёмная плашка под кнопкой, пункты с оранжевым
              плюсом и заливная кнопка связи внизу — как у оригинала.
              Закрытая панель убрана через visibility, поэтому её ссылки
              не ловят табуляцию */}
          <div className={`nav-panel md:hidden ${open ? 'is-open' : ''}`}>
            <nav className="flex flex-col items-start gap-4">
              {t.nav.items.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="font-mono text-caption uppercase tracking-[0.08em] text-fog"
                >
                  <span className="text-ember mr-2">+</span>
                  {l.label}
                </a>
              ))}
            </nav>
            <SwooshButton
              href="#contact"
              className="swoosh--ember mt-5 w-full justify-center"
              cursor={t.cursor.write}
              onClick={() => setOpen(false)}
            >
              {t.nav.contact}
            </SwooshButton>
          </div>
        </div>
      </header>
    </>
  )
}
