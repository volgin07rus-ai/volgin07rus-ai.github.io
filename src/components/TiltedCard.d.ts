/**
 * Типы для TiltedCard.
 *
 * Компонент оставлен на JavaScript как есть, чтобы его можно было
 * обновлять из React Bits, не разбирая правки. Без этого объявления
 * TypeScript выводит типы из значений по умолчанию, и свойства без
 * умолчания становятся обязательными.
 */
declare function TiltedCard(props: {
  imageSrc: string
  altText?: string
  captionText?: string
  containerHeight?: string
  containerWidth?: string
  imageHeight?: string
  imageWidth?: string
  scaleOnHover?: number
  rotateAmplitude?: number
  showMobileWarning?: boolean
  showTooltip?: boolean
  overlayContent?: React.ReactNode
  displayOverlayContent?: boolean
}): JSX.Element

export default TiltedCard
