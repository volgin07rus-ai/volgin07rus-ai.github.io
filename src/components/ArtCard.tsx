import { useState } from 'react'

/**
 * Обложка проекта.
 *
 * Если в `public/covers/<slug>.jpg` лежит скриншот — показываем его.
 * Если файла нет (или он не загрузился) — рисуем процедурную заливку,
 * чтобы карточка не выглядела пустой.
 *
 * Чтобы добавить обложку новому проекту, достаточно положить файл
 * `public/covers/<slug>.jpg` — код менять не нужно.
 */
const BASES = [
  'radial-gradient(120% 90% at 20% 10%, #2b3a4d 0%, #12161c 45%, #0a0a0a 100%)',
  'radial-gradient(110% 100% at 80% 20%, #3a3f4a 0%, #16181d 50%, #0a0a0a 100%)',
  'radial-gradient(100% 120% at 30% 80%, #1f3347 0%, #101319 55%, #0a0a0a 100%)',
  'radial-gradient(130% 90% at 70% 70%, #34404f 0%, #14171c 50%, #0a0a0a 100%)',
  'radial-gradient(90% 110% at 50% 20%, #26313f 0%, #0f1216 60%, #0a0a0a 100%)',
  'radial-gradient(120% 100% at 15% 60%, #2f3b4a 0%, #13161b 50%, #0a0a0a 100%)',
]

export default function ArtCard({
  index,
  slug,
  alt,
  tint = 'rgba(137,170,204,0.28)',
  className = '',
}: {
  index: number
  slug?: string
  alt?: string
  tint?: string
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  const src = slug ? `${import.meta.env.BASE_URL}covers/${slug}.jpg` : null

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={alt ?? ''}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        className={`w-full h-full object-cover object-top ${className}`}
      />
    )
  }

  const bg = BASES[index % BASES.length]
  const angle = (index % 4) * 24 - 30

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{ background: bg }}
      aria-hidden="true"
    >
      {/* Световой блик */}
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background: `conic-gradient(from ${angle}deg at 60% 40%, ${tint}, transparent 35%, ${tint} 62%, transparent 88%)`,
        }}
      />
      {/* Мягкое свечение */}
      <div
        className="absolute -inset-1/4 blur-3xl opacity-50"
        style={{
          background: `radial-gradient(closest-side, ${tint}, transparent)`,
          transform: `translate(${(index % 2 ? -1 : 1) * 12}%, ${
            (index % 3) * 8 - 8
          }%)`,
        }}
      />
      {/* Полутоновая сетка */}
      <div className="absolute inset-0 halftone opacity-20 mix-blend-multiply" />
    </div>
  )
}
