import { useEffect, useRef, useState } from 'react'
import { getLenis } from '../lib/lenis'

/**
 * Свой ползунок прокрутки вместо браузерного.
 *
 * Родной спрятан совсем (index.css). Пока стоит загрузочная шторка, у страницы
 * выключена прокрутка: браузерный ползунок пропадал, потом появлялся снова,
 * и вместе с ним на его ширину дёргалась вся вёрстка. Свой лежит поверх
 * страницы, места не занимает и появляется один раз — когда шторка уехала.
 *
 * Вид — как у сайта: волосная направляющая, как линии сетки, крестики на
 * концах, оранжевая планка. При наведении и перетаскивании рядом всплывает
 * плашка с процентом прокрутки — та же, что подпись у курсора.
 *
 * Положение пишем прямо в стиль через ref: прокрутка стреляет каждый кадр,
 * и setState на каждое движение перерисовывал бы дерево впустую.
 * На телефонах и планшетах ползунка нет: там листают пальцем.
 */
export default function ScrollBar() {
  const bar = useRef<HTMLDivElement>(null)
  const thumb = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)
  const [fine] = useState(() => matchMedia('(hover: hover) and (pointer: fine)').matches)

  useEffect(() => {
    const sb = bar.current
    const th = thumb.current
    const lb = label.current
    if (!fine || !sb || !th || !lb) return

    const root = document.documentElement
    let trackH = 0
    let thumbH = 0
    let max = 0
    let frame = 0
    let idle = 0

    const update = () => {
      frame = 0
      const p = max ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      th.style.transform = `translateY(${p * (trackH - thumbH)}px)`
      lb.textContent = `${String(Math.round(p * 100)).padStart(3, '0')}%`
      // Пока шторка держит страницу, ползунка нет
      const locked = document.body.style.overflow === 'hidden'
      sb.classList.toggle('is-on', !locked && max > 0)
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    const measure = () => {
      trackH = sb.clientHeight
      const docH = root.scrollHeight
      max = Math.max(0, docH - window.innerHeight)
      thumbH = Math.max(56, (trackH * window.innerHeight) / Math.max(docH, 1))
      th.style.height = `${thumbH}px`
      update()
    }
    const scrollToY = (y: number, immediate: boolean) => {
      const top = Math.max(0, Math.min(max, y))
      const lenis = getLenis()
      if (lenis) lenis.scrollTo(top, { immediate })
      else window.scrollTo({ top, behavior: immediate ? 'auto' : 'smooth' })
    }

    const onScroll = () => {
      schedule()
      sb.classList.add('is-active')
      window.clearTimeout(idle)
      idle = window.setTimeout(() => sb.classList.remove('is-active'), 900)
    }

    // Перетаскивание планки
    const onThumbDown = (e: PointerEvent) => {
      e.preventDefault()
      e.stopPropagation()
      th.setPointerCapture(e.pointerId)
      const y0 = e.clientY
      const s0 = window.scrollY
      const k = max / Math.max(1, trackH - thumbH)
      sb.classList.add('is-drag')
      root.classList.add('is-scroll-drag')
      const move = (ev: PointerEvent) => scrollToY(s0 + (ev.clientY - y0) * k, true)
      const up = () => {
        th.removeEventListener('pointermove', move)
        sb.classList.remove('is-drag')
        root.classList.remove('is-scroll-drag')
      }
      th.addEventListener('pointermove', move)
      th.addEventListener('pointerup', up, { once: true })
      th.addEventListener('pointercancel', up, { once: true })
    }
    // Клик по направляющей: плавно туда, куда кликнули
    const onTrackDown = (e: PointerEvent) => {
      const r = sb.getBoundingClientRect()
      scrollToY(((e.clientY - r.top - thumbH / 2) / Math.max(1, trackH - thumbH)) * max, false)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', measure)
    th.addEventListener('pointerdown', onThumbDown)
    sb.addEventListener('pointerdown', onTrackDown)
    // Высота страницы меняется: «смотреть ещё», смена языка, догрузка картинок
    const sizes = new ResizeObserver(measure)
    sizes.observe(document.body)
    // Шторка снимает блокировку прокрутки — тогда ползунок и появляется
    const lock = new MutationObserver(schedule)
    lock.observe(document.body, { attributes: true, attributeFilter: ['style'] })
    measure()

    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(idle)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', measure)
      th.removeEventListener('pointerdown', onThumbDown)
      sb.removeEventListener('pointerdown', onTrackDown)
      sizes.disconnect()
      lock.disconnect()
    }
  }, [fine])

  if (!fine) return null

  return (
    <div ref={bar} className="scrollbar" aria-hidden="true">
      <svg viewBox="0 0 16 16" className="scrollbar-cross top-0 -translate-y-1/2">
        <path d={CROSS} fill="currentColor" />
      </svg>
      <svg viewBox="0 0 16 16" className="scrollbar-cross bottom-0 translate-y-1/2">
        <path d={CROSS} fill="currentColor" />
      </svg>
      <div ref={thumb} className="scrollbar-thumb">
        <span className="scrollbar-label font-mono text-micro uppercase">
          <span className="dot" />
          <span ref={label}>000%</span>
        </span>
      </div>
    </div>
  )
}

/* Контур крестика с сайта: не «плюс», а фигура с чуть разной длиной перекладин */
const CROSS = 'M0 8.27438V7.09232H7.09232V0H8.27438V7.09232H15.3667V8.27438H8.27438V15.3667H7.09232V8.27438H0Z'
