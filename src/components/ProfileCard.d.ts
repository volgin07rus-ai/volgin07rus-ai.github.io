/**
 * Типы для ProfileCard.
 *
 * Сам компонент оставлен на JavaScript как есть, чтобы его можно было
 * обновлять из React Bits без разбора правок. Без этого объявления
 * TypeScript выводит типы из значений по умолчанию, и свойства без
 * умолчания — innerGradient, behindGlowColor, miniAvatarUrl и прочие —
 * становятся обязательными.
 */
declare const ProfileCard: React.MemoExoticComponent<
  (props: {
    avatarUrl?: string
    iconUrl?: string
    grainUrl?: string
    innerGradient?: string
    behindGlowEnabled?: boolean
    behindGlowColor?: string
    behindGlowSize?: string
    className?: string
    enableTilt?: boolean
    enableMobileTilt?: boolean
    mobileTiltSensitivity?: number
    miniAvatarUrl?: string
    name?: string
    title?: string
    handle?: string
    status?: string
    contactText?: string
    showUserInfo?: boolean
    onContactClick?: () => void
  }) => JSX.Element
>

export default ProfileCard
