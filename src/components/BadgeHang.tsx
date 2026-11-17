import { useEffect, useRef } from 'react'
import { whenCalm } from '../lib/calm'

/**
 * Пропуск на прищепке в подвале.
 *
 * Это сцена Spline из оригинала: файл целиком лежит в public/badge, ничего
 * не тянется со стороны. Модель — готовый шаблон, внутри есть слой с именем
 * «PLACE YOUR IMAGE»; на карточке оригинала стояли имя и город автора,
 * поэтому картинка заменена своей прямо в файле сцены.
 *
 * Как заменить картинку снова: собрать JPEG 2160×2704 и вклеить его на
 * место прежнего — перед изображением в файле стоит маркер msgpack bin32
 * (байт 0xc6 и четыре байта длины), меняются длина и содержимое.
 *
 * Сцен две, по одной на язык: надпись на пропуске — часть картинки, текстом
 * её не подменить. Со сменой языка сцена перезагружается, прежняя при этом
 * освобождается — за этим следит зависимость эффекта.
 *
 * Загружается лениво: движок Spline весит больше самой страницы, и тянуть
 * его ради подвала при первом открытии незачем. Сцена скачивается заранее,
 * в спокойный момент после загрузки, а движок запускается за пару экранов
 * до подвала: к концу страницы пропуск уже висит.
 *
 * Пока подвал за экраном, сцена стоит на паузе. Раньше она рисовала кадры
 * без остановки с момента загрузки, и вся страница после этого шла вдвое
 * тяжелее. Модуль для геометрии лежит у нас в public/spline, а не на unpkg.
 * Версия файлов там та же, что у @splinetool/runtime: обновишь движок,
 * возьми их заново с unpkg.com/@splinetool/modelling-wasm и ui-wasm.
 */
const WASM = `${import.meta.env.BASE_URL}spline`
export default function BadgeHang({ scene }: { scene: string }) {
  const host = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = host.current
    if (!canvas) return

    let app: { dispose: () => void } | null = null
    let dead = false
    let frame = 0
    let onPointer: ((e: PointerEvent) => void) | null = null
    let visible = false
    let started = false
    let wake: (() => void) | null = null
    let sleep: (() => void) | null = null

    // На телефоне подвал без пропуска: обёртка скрыта, и тянуть движок незачем
    const shown = () => canvas.getClientRects().length > 0

    const start = async () => {
      try {
        // Движок, сцена и первый кадр запускаются по шагам и только в спокойный
        // момент (lib/calm.ts): разом они замораживали прокрутку больше чем на секунду
        const { Application } = await whenCalm(() => import('@splinetool/runtime'))
        if (dead) return
        const instance = await whenCalm(() => new Application(canvas, { wasmPath: WASM }))
        app = instance
        if (dead) return
        await whenCalm(() => instance.load(scene))
        if (dead) return
        // Пропуск проявляется, когда сцена уже собрана, а не возникает рывком
        canvas.dataset.ready = ''

        // Пропуск целиком висит на пустышке с именем Pass — крутим её.
        // Своё слежение у сцены слабое и почти незаметное, поэтому
        // поворот задаём сами, поверх него.
        const pass = instance.findObjectByName('Pass')
        if (!pass) return
        const base = { x: pass.rotation.x, y: pass.rotation.y, z: pass.rotation.z }

        let aimX = 0
        let aimY = 0
        onPointer = (e: PointerEvent) => {
          aimX = clamp((e.clientX - innerWidth / 2) / (innerWidth / 2), -1, 1)
          aimY = clamp((e.clientY - innerHeight / 2) / (innerHeight / 2), -1, 1)
        }
        window.addEventListener('pointermove', onPointer, { passive: true })

        const moves = !matchMedia('(prefers-reduced-motion: reduce)').matches
        const loop = () => {
          // Догоняем цель плавно: иначе пропуск дёргается на каждом
          // событии мыши, а он висит на шнурке и должен запаздывать
          pass.rotation.y += (base.y + aimX * 0.62 - pass.rotation.y) * 0.045
          pass.rotation.x += (base.x + aimY * 0.3 - pass.rotation.x) * 0.045
          pass.rotation.z += (base.z + aimX * 0.16 - pass.rotation.z) * 0.035
          frame = requestAnimationFrame(loop)
        }
        wake = () => {
          instance.play()
          cancelAnimationFrame(frame)
          if (moves) loop()
        }
        sleep = () => {
          cancelAnimationFrame(frame)
          instance.stop()
        }
        if (visible) wake()
        else sleep()
      } catch {
        // Сцена не загрузилась — подвал просто останется без пропуска
      }
    }

    // Запускаем за пару экранов до подвала: запуск ждёт паузы в прокрутке,
    // и запас даёт ему успеть
    const near = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || started || !shown()) return
        started = true
        near.disconnect()
        start()
      },
      { rootMargin: '2400px 0px' }
    )
    near.observe(canvas)

    // Рисуем, только пока подвал на экране
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible) wake?.()
      else sleep?.()
    })
    io.observe(canvas)

    // Всё нужное пропуску качаем заранее, в первый спокойный момент: движок,
    // сцену и модуль геометрии, около 1,2 МБ. Сеть основную работу страницы
    // не тормозит, а к подвалу всё уже в кэше, даже на медленной связи.
    // Движок только скачивается, а не подключается: его разбор занимает
    // полсекунды, это делаем уже у подвала. Имена файлов движка постоянные,
    // см. vite.config.ts
    whenCalm(() => {
      if (dead || !shown()) return
      for (const f of ['runtime.js', 'process.js']) {
        const link = document.createElement('link')
        link.rel = 'prefetch'
        link.href = `${import.meta.env.BASE_URL}assets/spline/${f}`
        document.head.appendChild(link)
      }
      fetch(scene).catch(() => undefined)
      fetch(`${WASM}/process.wasm`).catch(() => undefined)
    })

    return () => {
      dead = true
      cancelAnimationFrame(frame)
      if (onPointer) window.removeEventListener('pointermove', onPointer)
      io.disconnect()
      near.disconnect()
      app?.dispose()
    }
  }, [scene])

  return (
    <canvas
      ref={host}
      className="w-full h-full block opacity-0 transition-opacity duration-1000 data-[ready]:opacity-100"
      aria-hidden="true"
    />
  )
}

function clamp(v: number, min: number, max: number) {
  return v < min ? min : v > max ? max : v
}
