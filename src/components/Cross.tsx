import type { CSSProperties } from 'react'

/**
 * Крестик — метка на пересечениях и по углам блоков.
 *
 * Контур взят со страницы оригинала как есть: это не символ «плюс», а
 * фигура с чуть разной длиной перекладин.
 *
 * Цвет — currentColor, наложение — difference. Вместе это значит, что
 * крестик подстраивается сам: секция задаёт цвет текста под свой фон, а
 * difference превращает его в противоположный фону. Оттого один и тот же
 * крестик читается и на светлой секции, и на тёмной.
 */
const SIZE = {
  sm: 'w-[0.62vw] min-w-[7px] max-w-[11px]',
  md: 'w-[0.83vw] min-w-[9px] max-w-[14px]',
}

export default function Cross({
  className = '',
  size = 'md',
  style,
}: {
  className?: string
  size?: keyof typeof SIZE
  style?: CSSProperties
}) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={`absolute pointer-events-none ${SIZE[size]} aspect-square ${className}`}
      style={{ mixBlendMode: 'difference', ...style }}
      aria-hidden="true"
    >
      <path
        d="M0 8.27438V7.09232H7.09232V0H8.27438V7.09232H15.3667V8.27438H8.27438V15.3667H7.09232V8.27438H0Z"
        fill="currentColor"
      />
    </svg>
  )
}

/**
 * Четыре крестика по углам блока — как у карточек услуг.
 * Родитель должен быть position: relative.
 *
 * @param offset вынос за край; отрицательное значение выводит крестики наружу
 */
export function CrossCorners({
  offset = '-1.25vw',
  size = 'md',
}: {
  offset?: string
  size?: keyof typeof SIZE
}) {
  const corners: CSSProperties[] = [
    { top: offset, left: offset },
    { top: offset, right: offset },
    { bottom: offset, right: offset },
    { bottom: offset, left: offset },
  ]
  return (
    <>
      {corners.map((c, i) => (
        <Cross key={i} size={size} style={c} />
      ))}
    </>
  )
}
