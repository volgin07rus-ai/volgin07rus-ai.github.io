import { useEffect, useRef, useState } from 'react'

/**
 * Подпись, которая ходит за курсором и всплывает над тем, что можно открыть.
 *
 * Это не замена системного курсора: в оригинале он остаётся на месте, а рядом
 * появляется тёмная пилюля с оранжевой точкой и текстом. Подпись берётся
 * из атрибута data-cursor у элемента под мышью.
 *
 * Координаты пишем прямо в стиль через ref: mousemove стреляет десятки раз
 * в секунду, и setState на каждое движение перерисовывал бы дерево впустую.
 */
export default function CursorTag() {
  const el = useRef<HTMLDivElement>(null)
  const [label, setLabel] = useState('')

  useEffect(() => {
    const fine = matchMedia('(hover:hover) and (pointer:fine)').matches
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine || calm) return

    const node = el.current
    if (!node) return

    let frame = 0
    let current = ''

    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        node.style.translate = `${e.clientX + 14}px ${e.clientY + 16}px`

        const host = (e.target as HTMLElement | null)?.closest?.('[data-cursor]')
        const next = host?.getAttribute('data-cursor') ?? ''
        if (next !== current) {
          current = next
          setLabel(next)
          node.classList.toggle('is-on', Boolean(next))
        }
      })
    }

    // Уводим подпись, когда мышь покидает окно
    const onLeave = () => {
      current = ''
      setLabel('')
      node.classList.remove('is-on')
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseleave', onLeave)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <div ref={el} className="cursor-tag font-mono text-caption uppercase" aria-hidden="true">
      <span className="dot" />
      <span>{label}</span>
    </div>
  )
}
