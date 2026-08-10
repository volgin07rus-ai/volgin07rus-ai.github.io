/**
 * Наклон телефона — наклон карточек.
 *
 * На широком экране карточки наклоняются за курсором. На телефоне
 * курсора нет, зато есть гироскоп: держим угол наклона самого телефона
 * в переменных --tilt-x и --tilt-y на корне страницы, а карточки
 * разворачиваются по ним прямо в стилях.
 *
 * Датчик доступен только по защищённому соединению, а Safari вдобавок
 * спрашивает разрешение — и спросить его можно только в ответ на
 * касание. Поэтому на iPhone подписка ждёт первого касания где угодно
 * по странице, а не по конкретной карточке: одно разрешение на весь
 * сайт вместо окна при каждой попытке открыть работу.
 */

/** Угол карточки на краю диапазона */
const МАКС = 9
/** На столько градусов надо наклонить телефон, чтобы дойти до края */
const ДИАПАЗОН = 26
/** Как телефон обычно держат в руке: отсюда считается наклон от себя */
const БАЗА = 45
/** Доля пути к цели за кадр: датчик стреляет часто и дрожит */
const СГЛАЖИВАНИЕ = 0.12

const зажать = (v: number) => Math.min(Math.max(v, -1), 1)

/**
 * Показания датчика в доли −1…1: вбок и от себя. Отсюда считают наклон
 * и карточки работ, и карточка профиля — иначе они кренятся вразнобой.
 */
export function наклонВДолях(beta: number, gamma: number) {
  return { x: зажать(gamma / ДИАПАЗОН), y: зажать((БАЗА - beta) / ДИАПАЗОН) }
}

let доступ = false
const ждущие = new Set<() => void>()

/**
 * Позвать, когда датчик заработает. Если он уже работает — зовём сразу.
 * Возвращает отписку.
 */
export function onOrientationReady(cb: () => void): () => void {
  if (доступ) {
    cb()
    return () => {}
  }
  ждущие.add(cb)
  return () => {
    ждущие.delete(cb)
  }
}

/** Запускается один раз на всё приложение. Возвращает остановку. */
export function startDeviceTilt(): () => void {
  // Там, где есть курсор, наклон уже считается по нему
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) return () => {}
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {}
  if (!window.isSecureContext) return () => {}

  const корень = document.documentElement
  let целX = 0
  let целY = 0
  let текX = 0
  let текY = 0
  let кадр = 0
  let живой = false

  const наклон = (e: DeviceOrientationEvent) => {
    const { beta, gamma } = e
    if (beta == null || gamma == null) return
    const доли = наклонВДолях(beta, gamma)
    целY = доли.x * МАКС
    целX = доли.y * МАКС
  }

  const цикл = () => {
    текX += (целX - текX) * СГЛАЖИВАНИЕ
    текY += (целY - текY) * СГЛАЖИВАНИЕ
    корень.style.setProperty('--tilt-x', `${текX.toFixed(2)}deg`)
    корень.style.setProperty('--tilt-y', `${текY.toFixed(2)}deg`)
    кадр = requestAnimationFrame(цикл)
  }

  const подключить = () => {
    if (живой) return
    живой = true
    доступ = true
    window.addEventListener('deviceorientation', наклон)
    кадр = requestAnimationFrame(цикл)
    ждущие.forEach((cb) => cb())
    ждущие.clear()
  }

  // Safari: разрешение спрашиваем один раз, при первом касании страницы
  const спросить = (
    DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }
  ).requestPermission

  let снять = () => {}

  if (typeof спросить === 'function') {
    const однажды = () => {
      снять()
      спросить
        .call(DeviceOrientationEvent)
        .then((ответ) => {
          if (ответ === 'granted') подключить()
        })
        .catch(() => {})
    }
    window.addEventListener('touchend', однажды, { once: true, passive: true })
    снять = () => window.removeEventListener('touchend', однажды)
  } else {
    подключить()
  }

  return () => {
    снять()
    window.removeEventListener('deviceorientation', наклон)
    cancelAnimationFrame(кадр)
    корень.style.removeProperty('--tilt-x')
    корень.style.removeProperty('--tilt-y')
    живой = false
    доступ = false
  }
}
