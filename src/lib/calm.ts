/**
 * Очередь тяжёлой работы: запуск WebGL, сборка сцен, компиляция шейдеров.
 *
 * Раньше 3D-фигуры услуг и пропуск в подвале запускались, как только до них
 * оставалось несколько сотен пикселей, то есть посреди прокрутки. Видеокарта
 * в этот момент компилировала шейдеры, и страница замирала на секунду.
 *
 * Теперь каждая такая задача ждёт спокойного момента: прокрутка стоит хотя
 * бы QUIET мс, загрузочная шторка уехала, у браузера есть свободное время.
 * Задачи идут строго по одной: три фигуры разом складывали свои заминки
 * в одну длинную.
 */
const QUIET = 300

let lastMove = 0
if (typeof window !== 'undefined') {
  const mark = () => {
    lastMove = performance.now()
  }
  addEventListener('scroll', mark, { passive: true })
  addEventListener('wheel', mark, { passive: true })
  addEventListener('touchmove', mark, { passive: true })
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const idle = () =>
  new Promise<void>((r) => {
    if ('requestIdleCallback' in window) requestIdleCallback(() => r(), { timeout: 1500 })
    else setTimeout(r, 50)
  })

/** Ждёт, пока страница успокоится: шторка уехала, прокрутка стоит, есть свободное время */
async function calm() {
  for (;;) {
    // Пока стоит загрузочная шторка, тяжёлая работа сбила бы её анимацию
    if (document.body.style.overflow === 'hidden') {
      await sleep(250)
      continue
    }
    const quiet = performance.now() - lastMove
    if (quiet < QUIET) {
      await sleep(QUIET - quiet + 20)
      continue
    }
    await idle()
    if (performance.now() - lastMove >= QUIET) return
  }
}

let chain: Promise<unknown> = Promise.resolve()

/** Поставить тяжёлую задачу в общую очередь: выполнится в спокойный момент, после предыдущих */
export function whenCalm<T>(job: () => T | Promise<T>): Promise<T> {
  const run = chain.then(calm).then(job)
  chain = run.catch(() => undefined)
  return run
}
