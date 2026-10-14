import type Lenis from 'lenis'

/**
 * Плавная прокрутка страницы — одна на сайт. Ползунок крутит страницу через
 * неё: если звать родной scrollTo в обход Lenis, они тянут прокрутку
 * в разные стороны и страница дёргается.
 */
let current: Lenis | null = null

export const setLenis = (lenis: Lenis | null) => {
  current = lenis
}

export const getLenis = () => current
