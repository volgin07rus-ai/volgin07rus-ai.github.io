import { useEffect, useRef } from 'react'
import type { ChromeShape } from './chromeShapes'
import type { StageMsg } from './chromeStage'
import { whenCalm } from '../lib/calm'

export type { ChromeShape }

/**
 * Тёмный хромированный объект, медленно поворачивающийся в квадрате карточки.
 *
 * В оригинале на этом месте стоят сцены Spline с логотипами Figma и Webflow.
 * Логотипы чужих продуктов сюда не годятся: рядом в счётчиках стоит «без
 * конструкторов». Поэтому объекты собраны здесь же — выдавленные из плоских
 * контуров фигуры с металлом и студийным окружением, вид тот же.
 *
 * Фон объект не рисует: под ним лежит градиент карточки, канвас прозрачный.
 *
 * Сама сцена живёт в chromeStage.ts и работает в фоновом потоке: здесь
 * только холст и пересылка размера, видимости и курсора. Где браузер не
 * умеет WebGL в потоке, та же сцена запускается в странице, по шагам
 * и в спокойный момент (lib/calm.ts).
 */
type Port = { offscreen: boolean; send: (msg: StageMsg, transfer?: Transferable[]) => void }
let port: Promise<Port> | null = null

function getPort() {
  port ??= new Promise<Port>((resolve) => {
    const local = async (): Promise<Port> => {
      const stage = await whenCalm(() => import('./chromeStage'))
      const make = () => document.createElement('canvas')
      return {
        offscreen: false,
        // Сборка фигуры тяжёлая, в странице её запускаем только в паузе
        send: (msg) => (msg.type === 'add' ? whenCalm(() => stage.handle(msg, make)) : stage.handle(msg, make)),
      }
    }
    if (!('transferControlToOffscreen' in HTMLCanvasElement.prototype)) return resolve(local())
    let w: Worker
    try {
      w = new Worker(new URL('./chrome.worker.ts', import.meta.url), { type: 'module' })
    } catch {
      return resolve(local())
    }
    const fallback = () => {
      w.terminate()
      resolve(local())
    }
    w.onerror = fallback
    w.onmessage = (e) => {
      if (e.data?.type !== 'gl') return
      if (!e.data.ok) return fallback()
      resolve({ offscreen: true, send: (msg, transfer) => w.postMessage(msg, transfer ?? []) })
    }
  })
  return port
}

let nextId = 1

export default function ChromeObject({ shape }: { shape: ChromeShape }) {
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = host.current
    if (!node) return

    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    // С мышью фигура следит за курсором, на тачскрине мыши нет: там
    // остаётся собственное покачивание
    const follows = matchMedia('(hover: hover) and (pointer: fine)').matches && !still
    const id = nextId++

    let dead = false
    let link: Port | null = null
    let ro: ResizeObserver | undefined
    let io: IntersectionObserver | undefined
    let onPointer: ((e: PointerEvent) => void) | undefined
    let frame = 0

    const canvas = document.createElement('canvas')
    canvas.style.cssText = 'display:block;width:100%;height:100%'
    node.appendChild(canvas)

    const px = () => {
      const dpr = Math.min(devicePixelRatio, 2)
      return {
        w: Math.max(1, Math.round((node.clientWidth || 1) * dpr)),
        h: Math.max(1, Math.round((node.clientHeight || 1) * dpr)),
      }
    }

    getPort().then((p) => {
      if (dead) return
      link = p
      const target = p.offscreen ? canvas.transferControlToOffscreen() : canvas
      p.send({ type: 'add', id, shape, canvas: target, ...px(), follows, still }, p.offscreen ? [target as OffscreenCanvas] : undefined)

      ro = new ResizeObserver(() => p.send({ type: 'size', id, ...px() }))
      ro.observe(node)
      // Крутим только видимую фигуру: за пределами экрана цикл стоит совсем
      io = new IntersectionObserver(([e]) => p.send({ type: 'visible', id, visible: e.isIntersecting }))
      io.observe(node)

      if (!follows) return
      let x = 0
      let y = 0
      onPointer = (e: PointerEvent) => {
        const b = node.getBoundingClientRect()
        // Смещение курсора от центра квадрата, приведённое к половине экрана:
        // так фигура реагирует на движение по всей странице, а не только
        // когда курсор внутри карточки
        x = clamp((e.clientX - (b.left + b.width / 2)) / (innerWidth / 2), -1, 1)
        y = clamp((e.clientY - (b.top + b.height / 2)) / (innerHeight / 2), -1, 1)
        // Не чаще кадра: мышь шлёт событий больше, чем нужно
        if (!frame)
          frame = requestAnimationFrame(() => {
            frame = 0
            p.send({ type: 'aim', id, x, y })
          })
      }
      window.addEventListener('pointermove', onPointer, { passive: true })
    })

    return () => {
      dead = true
      cancelAnimationFrame(frame)
      if (onPointer) window.removeEventListener('pointermove', onPointer)
      io?.disconnect()
      ro?.disconnect()
      link?.send({ type: 'remove', id })
      canvas.remove()
    }
  }, [shape])

  return <div ref={host} className="absolute inset-0" aria-hidden="true" />
}

function clamp(v: number, min: number, max: number) {
  return v < min ? min : v > max ? max : v
}
