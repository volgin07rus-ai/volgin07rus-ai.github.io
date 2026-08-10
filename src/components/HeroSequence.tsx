import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { warpQuad, type Quad, type WarpSource } from '../lib/warpQuad'

gsap.registerPlugin(ScrollTrigger)

const COUNT = 89
const SRC = (i: number) => `${import.meta.env.BASE_URL}hero-seq/${String(i).padStart(3, '0')}.jpg`
const RATIO = 1104 / 832

/** Что показывает монитор — по одному сайту на отрезок прокрутки.
 *  Только съёмки во весь экран: письмо или мокап телефона в мониторе
 *  читались бы как картинка в картинке. */
const SHOWCASE = ['lumora', 'domik-cafe', 'baseline', 'partner-group', 'asme', 'studio-agency']
/** Длина перехода между сайтами в кадрах */
const FADE = 7

/** Насколько кадр шире телефонного экрана и где стоит его середина */
const MOB_ZOOM = 2.05
const MOB_CENTER = 0.55

/**
 * Покадровая последовательность первого экрана.
 *
 * Устройство повторяет оригинал:
 *  — кадры рисуются в канвас, номер берётся из прогресса прокрутки;
 *  — канвас идёт с mix-blend-mode: multiply. Кадр — тёмный монитор на белом,
 *    и умножение делает белое прозрачным. Поэтому канвас можно положить
 *    ПОВЕРХ заголовка: монитор закроет буквы, а фон кадра исчезнет;
 *  — сам канвас едет снизу вверх на четверть экрана, отчего монитор
 *    не только приближается, но и приподнимается.
 *
 * Умножение требует светлого фона под собой: на тёмном тёмный монитор
 * не проявится. Градиент фона задан в секции.
 */
export default function HeroSequence() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const screenCv = useRef<HTMLCanvasElement>(null)
  const wrap = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cv = canvas.current
    const sc = screenCv.current
    const box = wrap.current
    if (!cv || !sc || !box) return
    const ctx = cv.getContext('2d')
    const sctx = sc.getContext('2d')
    if (!ctx || !sctx) return

    const images: HTMLImageElement[] = []
    const state = { frame: 0 }
    let ready = 0

    /** Углы экрана монитора для каждого кадра, доли от размера кадра */
    let quads: Quad[] | null = null
    const shots: HTMLImageElement[] = SHOWCASE.map((slug) => {
      const img = new Image()
      img.decoding = 'async'
      img.src = `${import.meta.env.BASE_URL}covers/${slug}.jpg`
      return img
    })

    // Холст, на котором один снимок растворяется в другом. Смешивать их
    // прямо на экране нельзя: сетка треугольников кладётся полупрозрачно,
    // полосы перекрытия набирают альфу дважды и проступают решёткой.
    // В буфере смешивание идёт до искажения, и на экран ложится один
    // непрозрачный слой.
    const blend = document.createElement('canvas')
    const bctx = blend.getContext('2d')

    /** Что показывать на этом кадре: снимок или смесь двух */
    const showcaseAt = (idx: number): WarpSource | null => {
      const band = COUNT / SHOWCASE.length
      const pos = idx / band
      const i = Math.min(SHOWCASE.length - 1, Math.floor(pos))
      const cur = shots[i]
      const ok = (img: HTMLImageElement) => img.complete && img.naturalWidth > 0
      if (!ok(cur)) return null

      const into = (pos - i) * band
      const prev = i > 0 ? shots[i - 1] : null
      // На стыке отрезков предыдущий сайт растворяется в следующем
      if (!prev || into >= FADE || !ok(prev) || !bctx) return cur

      if (blend.width !== cur.naturalWidth || blend.height !== cur.naturalHeight) {
        blend.width = cur.naturalWidth
        blend.height = cur.naturalHeight
      }
      bctx.globalAlpha = 1
      bctx.drawImage(prev, 0, 0, blend.width, blend.height)
      bctx.globalAlpha = into / FADE
      bctx.drawImage(cur, 0, 0, blend.width, blend.height)
      bctx.globalAlpha = 1
      return blend
    }

    const draw = () => {
      const idx = Math.min(COUNT - 1, Math.max(0, Math.round(state.frame)))
      const img = images[idx]
      if (!img?.complete || !img.naturalWidth) return

      const dpr = Math.min(devicePixelRatio || 1, 2)
      const w = box.clientWidth
      const h = box.clientHeight
      for (const c of [cv, sc]) {
        if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
          c.width = Math.round(w * dpr)
          c.height = Math.round(h * dpr)
        }
      }
      // Фон заливаем белым: при умножении белое не меняет подложку,
      // иначе прошлый кадр просвечивал бы сквозь новый
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, cv.width, cv.height)

      // Заполняем экран целиком (cover). Кадр уже экрана по пропорциям,
      // поэтому при вписывании по сторонам оставались поля и картинка
      // выглядела вставленной. Лишнее уходит сверху и снизу — там пустой
      // фон и край тумбы, ничего значимого не теряется.
      //
      // На телефоне так нельзя: окно там сильно выше своей ширины, и cover
      // раздувал кадр втрое — от монитора оставалась одна серединка. Там
      // вписываем по ширине и опускаем кадр вниз, под подписи.
      const узкий = w < 768
      const boxRatio = w / h
      let dw = w
      let dh = h
      if (узкий) {
        // Кадр чуть шире экрана: сам монитор занимает лишь середину кадра,
        // и при точном вписывании по ширине он выходил мелким
        dw = w * MOB_ZOOM
        dh = dw / RATIO
      } else if (boxRatio > RATIO) {
        dh = w / RATIO
      } else {
        dw = h * RATIO
      }
      const ox = ((w - dw) / 2) * dpr
      // На телефоне кадр опущен: над ним стоят заголовок и подписи
      const oy = (узкий ? h * MOB_CENTER - dh / 2 : (h - dh) / 2) * dpr
      ctx.drawImage(img, ox, oy, dw * dpr, dh * dpr)

      // ---- Экран монитора: отдельный слой, без умножения ----
      sctx.clearRect(0, 0, sc.width, sc.height)
      const quad = quads?.[idx]
      const shot = showcaseAt(idx)
      if (!quad || !shot) return
      const inCanvas = quad.map(([qx, qy]) => [ox + qx * dw * dpr, oy + qy * dh * dpr]) as Quad
      warpQuad(sctx, shot, inCanvas)
    }

    fetch(`${import.meta.env.BASE_URL}hero-seq/screen.json`)
      .then((r) => r.json())
      .then((data: Quad[]) => {
        quads = data
        draw()
      })
      .catch(() => {
        // Без таблицы углов монитор просто останется пустым
      })

    for (let i = 0; i < COUNT; i++) {
      const img = new Image()
      img.decoding = 'async'
      img.src = SRC(i)
      img.onload = () => {
        ready++
        if (i === 0) draw()
      }
      images.push(img)
    }

    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches

    const ctxGsap = gsap.context(() => {
      if (calm) {
        state.frame = Math.round(COUNT * 0.7)
        const id = window.setInterval(() => {
          if (ready > COUNT * 0.7) {
            draw()
            window.clearInterval(id)
          }
        }, 200)
        return
      }

      // Цепляемся к секции целиком, а не к липкому блоку внутри неё:
      // липкий блок по определению стоит на месте, у него top всегда 0,
      // и диапазон прокрутки схлопывается — кадры перестают меняться.
      const trigger = {
        trigger: box.closest('section'),
        start: 'top top',
        end: 'bottom bottom',
        // Сглаживание: без него кадры щёлкают ступеньками
        // при быстрой прокрутке колесом
        scrub: 1,
      }

      gsap.to(state, { frame: COUNT - 1, ease: 'none', onUpdate: draw, scrollTrigger: trigger })

      // Монитор приподнимается: канвас едет снизу вверх на четверть экрана.
      // Слой экрана едет тем же движением, иначе картинка отстанет от рамки.
      // На телефоне подъём меньше: там над кадром уже стоят заголовок и
      // подписи, и при прежней четверти монитор в начале уезжал за экран
      const подъём = innerWidth < 768 ? 10 : 26
      gsap.fromTo([cv, sc], { yPercent: подъём }, { yPercent: 0, ease: 'none', scrollTrigger: trigger })
    }, wrap)

    const onResize = () => draw()
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      ctxGsap.revert()
    }
  }, [])

  // z-index и mix-blend-mode обязаны сидеть на ОДНОМ элементе. Если поднять
  // обёртку через z-index, она создаст свой контекст наложения, и канвас
  // внутри будет смешиваться с пустотой вместо фона секции — умножение
  // просто перестанет работать, а белый фон кадра перекроет всё.
  return (
    <div ref={wrap} className="absolute inset-0 pointer-events-none">
      <canvas
        ref={canvas}
        className="w-full h-full block relative z-10"
        style={{ mixBlendMode: 'multiply' }}
        aria-hidden="true"
      />
      {/* Содержимое экрана — отдельным слоем поверх и обычным наложением.
          В том же канвасе оно попало бы под умножение и почернело бы на
          тёмной части фона. Слой едет вместе с кадром: тот же сдвиг. */}
      <canvas
        ref={screenCv}
        className="w-full h-full block absolute inset-0 z-[11]"
        aria-hidden="true"
      />
    </div>
  )
}
