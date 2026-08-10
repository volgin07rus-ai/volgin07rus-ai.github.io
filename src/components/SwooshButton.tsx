import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  href?: string
  /** Тёмная кнопка на светлом фоне или наоборот */
  tone?: 'dark' | 'light'
  /** Оранжевая точка перед текстом */
  dot?: boolean
  cursor?: string
  /** Крупный размер — для кнопок в подвале и на светлых блоках */
  size?: 'md' | 'lg'
  className?: string
  onClick?: () => void
  /** Нужен там, где подпись — код языка и сама по себе ничего не объясняет */
  'aria-label'?: string
  /** Для кнопки, которая раскрывает панель */
  'aria-expanded'?: boolean
}

/**
 * Кнопка с «прокатом»: при наведении сквозь неё проходят два цветных слоя
 * со ступенчатой задержкой, а подпись подменяется своей копией снизу.
 *
 * Устройство взято с оригинала: два увеличенных блока внутри обрезающей
 * оболочки, задержка второму задана переменной --index. Слои крупнее самой
 * кнопки и наклонены — оттого край проката идёт по диагонали, а не отвесно.
 */
export default function SwooshButton({
  children,
  href,
  tone = 'dark',
  dot = true,
  cursor,
  size = 'md',
  className = '',
  onClick,
  'aria-label': ariaLabel,
  'aria-expanded': ariaExpanded,
}: Props) {
  const Tag = href ? 'a' : 'button'

  // Без подписи атрибут не ставим вовсе: пустой всё равно поднимал бы
  // пилюлю у курсора, только без текста
  const tag = cursor ? { 'data-cursor': cursor } : {}

  return (
    <Tag
      {...(href
        ? { href, ...(href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {}) }
        : { type: 'button' as const })}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-expanded={ariaExpanded}
      {...tag}
      className={`swoosh swoosh--${tone} swoosh--${size} font-mono uppercase tracking-[0.08em] ${className}`}
    >
      {/* Слои проката */}
      <span className="swoosh__bg" aria-hidden="true">
        <span className="swoosh__layer" style={{ ['--index' as string]: 0 }} />
        <span className="swoosh__layer swoosh__layer--second" style={{ ['--index' as string]: 1 }} />
      </span>

      {/* Подпись и её копия: одна уезжает вверх, вторая приходит снизу */}
      <span className="swoosh__inner">
        {dot && <span className="swoosh__dot" aria-hidden="true" />}
        <span className="swoosh__text">
          <span className="swoosh__text-a">{children}</span>
          <span className="swoosh__text-b" aria-hidden="true">
            {children}
          </span>
        </span>
      </span>
    </Tag>
  )
}
