import { useEffect, useRef } from 'react'

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
 * его ради подвала при первом открытии незачем.
 */
export default function BadgeHang({ scene }: { scene: string }) {
  const host = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = host.current
    if (!canvas) return

    let app: { dispose: () => void } | null = null
    let dead = false
    let frame = 0
    let onPointer: ((e: PointerEvent) => void) | null = null

    const start = async () => {
      try {
        const { Application } = await import('@splinetool/runtime')
        if (dead) return
        const instance = new Application(canvas)
        app = instance
        await instance.load(scene)
        if (dead) return

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

        const loop = () => {
          // Догоняем цель плавно: иначе пропуск дёргается на каждом
          // событии мыши, а он висит на шнурке и должен запаздывать
          pass.rotation.y += (base.y + aimX * 0.62 - pass.rotation.y) * 0.045
          pass.rotation.x += (base.x + aimY * 0.3 - pass.rotation.x) * 0.045
          pass.rotation.z += (base.z + aimX * 0.16 - pass.rotation.z) * 0.035
          frame = requestAnimationFrame(loop)
        }
        if (!matchMedia('(prefers-reduced-motion: reduce)').matches) loop()
      } catch {
        // Сцена не загрузилась — подвал просто останется без пропуска
      }
    }

    // Ждём, пока подвал покажется на экране
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        start()
      },
      { rootMargin: '400px' }
    )
    io.observe(canvas)

    return () => {
      dead = true
      cancelAnimationFrame(frame)
      if (onPointer) window.removeEventListener('pointermove', onPointer)
      io.disconnect()
      app?.dispose()
    }
  }, [scene])

  return <canvas ref={host} className="w-full h-full block" aria-hidden="true" />
}

function clamp(v: number, min: number, max: number) {
  return v < min ? min : v > max ? max : v
}
