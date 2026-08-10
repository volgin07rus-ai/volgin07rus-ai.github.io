import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Заголовок проявляется словами по мере прокрутки.
 *
 * В оригинале это связка SplitText + ScrollTrigger со scrub: слова не просто
 * появляются по достижении секции, а «проявляются» ровно на ту долю, на
 * которую прокручен блок. Разбиваем текст сами — плагин SplitText платный.
 */
export default function RevealWords({
  text,
  className = '',
  once = false,
}: {
  text: string
  className?: string
  /** Проиграть один раз до конца, а не тянуть за прокруткой */
  once?: boolean
}) {
  const root = useRef<HTMLParagraphElement>(null)
  const words = text.split(' ')

  useEffect(() => {
    const el = root.current
    if (!el) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(el.querySelectorAll('span > span'), { opacity: 1, filter: 'none' })
      return
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelectorAll('span > span'),
        { opacity: 0.12, filter: 'blur(6px)' },
        {
          opacity: 1,
          filter: 'blur(0px)',
          // Со scrub слова доходят до конца только на самом низу диапазона,
          // и абзац подолгу висит наполовину проявленным. Один прогон
          // доигрывает до конца сам.
          ...(once
            ? { duration: 0.5, stagger: 0.045, ease: 'power2.out' }
            : { stagger: 0.35, ease: 'none' }),
          scrollTrigger: once
            ? { trigger: el, start: 'top 88%', once: true }
            : { trigger: el, start: 'top 85%', end: 'bottom 55%', scrub: 0.5 },
          // После проигрыша снимаем и размытие, и подсказку will-change.
          // Иначе на каждом слове навсегда остаётся слой с фильтром, и
          // текст мерцает при любой перерисовке рядом — прокрутке,
          // движении мыши, работе соседнего канваса.
          onComplete: () => {
            gsap.set(el.querySelectorAll('span > span'), { clearProps: 'filter,willChange' })
          },
        }
      )
    }, root)
    return () => ctx.revert()
  }, [text, once])

  return (
    <p ref={root} className={className}>
      {words.map((w, i) => (
        <span key={i} className="inline-block">
          <span className="inline-block">{w}</span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </p>
  )
}
