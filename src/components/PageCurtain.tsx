import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useLang } from '../lib/lang'

/** Сколько шторка стоит на месте, прежде чем уехать */
const HOLD_MS = 1150
/** Колонок в шторке — на них она и разъезжается */
const PANELS = 6

/**
 * Загрузочный экран и шторка перехода — один элемент, как в оригинале.
 *
 * Стоит поверх всего, показывает две моноширинные подписи на градиенте
 * с волосными колонками, затем разъезжается вертикальными панелями
 * с задержкой между ними.
 *
 * Тот же компонент годится и для переходов между страницами: снаружи
 * достаточно вызвать play() перед сменой маршрута. Пока страница одна,
 * он работает только на первой загрузке.
 */
export default function PageCurtain() {
  const root = useRef<HTMLDivElement>(null)
  const [done, setDone] = useState(false)
  const { t } = useLang()

  useEffect(() => {
    const el = root.current
    if (!el) return

    // При выключенных анимациях шторку не показываем вовсе:
    // мигание сплошным экраном без движения читается как поломка
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDone(true)
      return
    }

    // Пока шторка на экране, страницу листать нельзя
    document.body.style.overflow = 'hidden'

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = ''
          setDone(true)
        },
      })

      tl.fromTo(
        '.curtain-label',
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: 'power2.out' },
        0.15
      )
        .to('.curtain-label', { opacity: 0, duration: 0.35, ease: 'power2.in' }, HOLD_MS / 1000)
        .to(
          '.curtain-panel',
          {
            yPercent: -100,
            duration: 1.05,
            stagger: 0.07,
            ease: 'expo.inOut',
          },
          HOLD_MS / 1000 + 0.1
        )
    }, root)

    return () => {
      document.body.style.overflow = ''
      ctx.revert()
    }
  }, [])

  if (done) return null

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[999] pointer-events-none"
      aria-hidden="true"
    >
      {/* Панели: на них шторка и разъезжается */}
      <div className="absolute inset-0 flex">
        {Array.from({ length: PANELS }).map((_, i) => (
          <div
            key={i}
            className="curtain-panel relative flex-1 h-full"
            style={{
              background:
                'linear-gradient(to bottom, #0a0a0a 0%, #161616 24%, #4a484d 62%, #8e8c90 100%)',
            }}
          >
            {/* Волосная линия по правому краю панели — та же сетка, что на странице */}
            {i < PANELS - 1 && (
              <span className="absolute right-0 top-0 w-px h-full bg-white/15" />
            )}
          </div>
        ))}
      </div>

      {/* Подписи: по бокам от центра, как у оригинала */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full max-w-[1100px] px-6 flex justify-between">
          {t.curtain.map((l, i) => (
            <span
              key={i}
              className="curtain-label font-mono text-micro uppercase tracking-[0.16em] text-white/55"
            >
              {l}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
