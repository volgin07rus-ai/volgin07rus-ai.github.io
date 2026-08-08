import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  /** Зона вокруг элемента, в которой включается притяжение, px */
  padding?: number
  /** Чем больше число, тем слабее тянет */
  strength?: number
  className?: string
}

/**
 * Блок тянется за курсором, когда тот рядом.
 *
 * Смещение пишем прямо в стиль через ref, а не через состояние: mousemove
 * стреляет десятки раз в секунду, и setState на каждое движение перерисовывал
 * бы поддерево впустую.
 */
export default function Magnet({
  children,
  padding = 120,
  strength = 3,
  className = '',
}: Props) {
  const wrap = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // На тач-устройствах курсора нет, а при выключенных анимациях эффект лишний
    const fine = matchMedia('(hover:hover) and (pointer:fine)').matches
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine || calm) return

    const el = inner.current
    const box = wrap.current
    if (!el || !box) return

    let frame = 0
    let active = false

    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const { left, top, width, height } = box.getBoundingClientRect()
        const cx = left + width / 2
        const cy = top + height / 2
        const near =
          Math.abs(cx - e.clientX) < width / 2 + padding &&
          Math.abs(cy - e.clientY) < height / 2 + padding

        if (near) {
          if (!active) {
            active = true
            el.style.transition = 'transform .3s ease-out'
          }
          el.style.transform = `translate3d(${(e.clientX - cx) / strength}px, ${
            (e.clientY - cy) / strength
          }px, 0)`
        } else if (active) {
          active = false
          el.style.transition = 'transform .6s ease-in-out'
          el.style.transform = 'translate3d(0, 0, 0)'
        }
      })
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('mousemove', onMove)
    }
  }, [padding, strength])

  return (
    <div ref={wrap} className={className}>
      <div ref={inner} style={{ willChange: 'transform' }}>
        {children}
      </div>
    </div>
  )
}
