import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import HeroSequence from '../components/HeroSequence'
import { useLang } from '../lib/lang'

/**
 * Первый экран — длинная секция с липким содержимым.
 *
 * Слои снизу вверх:
 *   0 — градиент фона, от темноты сверху к свету снизу;
 *   1 — заголовок с mix-blend-mode: difference, он инвертирует этот градиент
 *       и потому сам выглядит переходом от тёмного к светлому;
 *  10 — канвас с кадрами и mix-blend-mode: multiply, лежит поверх заголовка,
 *       поэтому монитор закрывает буквы;
 *  20 — навигация и подписи, обычным наложением.
 */
/**
 * Кегль заголовка — по замеру, а не по формуле от ширины окна.
 *
 * Формула на vw промахивалась: vw считает и полосу прокрутки, а строка
 * стояла впритык к краю. На машине без полосы всё сходилось, а с полосой
 * не хватало её ширины — и «сайты, которые» переносилось. Замер берёт
 * настоящую ширину блока, поэтому промахнуться не может.
 *
 * Два прохода: ширина строки от кегля зависит не строго линейно
 * из-за округлений, второй проход добирает остаток.
 */
const FILL = 0.99

function useFitHeadline(el: React.RefObject<HTMLElement>, key: string) {
  useEffect(() => {
    const node = el.current
    if (!node) return

    const fit = () => {
      const стиль = getComputedStyle(node)
      const avail =
        node.clientWidth - parseFloat(стиль.paddingLeft) - parseFloat(стиль.paddingRight)
      const строки = [...node.children] as HTMLElement[]
      if (!avail || !строки.length) return

      for (let i = 0; i < 2; i++) {
        const кегль = parseFloat(getComputedStyle(node).fontSize)
        const ширина = Math.max(...строки.map((s) => s.getBoundingClientRect().width))
        if (!кегль || !ширина) return
        node.style.fontSize = `${(кегль * avail * FILL) / ширина}px`
      }
    }

    document.fonts.ready.then(fit)
    fit()

    // Следим за родителем, а не за самим заголовком: от кегля у него
    // меняется высота, и наблюдение за собой зациклилось бы
    const box = node.parentElement
    if (!box) return
    const ro = new ResizeObserver(fit)
    ro.observe(box)
    return () => ro.disconnect()
  }, [el, key])
}

/**
 * Наклон последней строки за курсором — как в оригинале.
 *
 * Там это не поворот, а ось наклона переменного шрифта: у слова в конце
 * заголовка slnt ходит примерно от нуля до −16, а первая строка стоит
 * прямо. Ось родная, поэтому буквы не перекашиваются, а действительно
 * перерисовываются наклонными.
 *
 * Значение догоняем плавно: мышь стреляет часто, и прямая подстановка
 * дёргала бы слово. Кадры крутим только пока первый экран виден.
 */
const SLANT_MAX = -16

function useSlantOnPointer(el: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const node = el.current
    if (!node) return
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let цель = 0
    let текущий = 0
    let frame = 0
    let живой = false

    const onMove = (e: PointerEvent) => {
      цель = (e.clientX / innerWidth) * SLANT_MAX
    }

    const loop = () => {
      текущий += (цель - текущий) * 0.07
      node.style.fontVariationSettings = `"slnt" ${текущий.toFixed(2)}`
      frame = requestAnimationFrame(loop)
    }

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting === живой) return
      живой = entry.isIntersecting
      if (живой) {
        window.addEventListener('pointermove', onMove, { passive: true })
        frame = requestAnimationFrame(loop)
      } else {
        window.removeEventListener('pointermove', onMove)
        cancelAnimationFrame(frame)
      }
    })
    io.observe(node)

    return () => {
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(frame)
    }
  }, [el])
}

export default function Hero() {
  const root = useRef<HTMLElement>(null)
  const tail = useRef<HTMLSpanElement>(null)
  const mark = useRef<HTMLHeadingElement>(null)
  const [clock, setClock] = useState('')
  const { t } = useLang()

  useSlantOnPointer(tail)
  useFitHeadline(mark, t.hero.headline + t.hero.headlineWidth)

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat(t.locale, {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Moscow',
      hour12: false,
    })
    const tick = () => setClock(fmt.format(new Date()))
    tick()
    const id = window.setInterval(tick, 30_000)
    return () => window.clearInterval(id)
  }, [t.locale])

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: 'expo.out' } })
        .fromTo('.warp-wrap', { opacity: 0, scale: 0.985 }, { opacity: 1, scale: 1, duration: 1.4 }, 0.1)
        .fromTo('.hero-up', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.07 }, 0.45)
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    // z-10 обязателен: без него секция не создаёт контекст наложения, и
    // приклеенная сетка полос (z-1) проступает поверх первого экрана
    <section id="home" ref={root} className="relative z-10 text-fog" style={{ height: '300vh' }}>
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col">
        {/* Фон: сверху темнота, снизу свет. Он держит оба режима наложения —
            умножение проявляет монитор только на светлом, а difference
            заголовка инвертирует именно этот градиент. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-0"
          style={{
            background:
              'linear-gradient(to bottom, #0a0a0a 0%, #161616 22%, #4a484d 55%, #b9b7bb 80%, #f1f1f1 100%)',
          }}
        />

        {/* ---------- Монумент: слой 1, под монитором ----------
            Обычный текст, без шейдера: наложение difference инвертирует
            градиент фона, и заголовок сам оказывается переходом от тёмного
            к светлому — ровно то, что раньше рисовалось в WebGL. */}
        {/* Заливка градиентом поверх difference: наложение и так переворачивает
            фон, а собственный перепад от белого к серому усиливает его —
            надпись уходит в темноту к низу, как в оригинале.

            Внутренний отступ сверху и вниз с равной отрицательной внешней
            прибавкой: заливка рисуется только внутри рамки, а полукруг над
            «Й» выступает за неё и оставался бы непрокрашенным — буква
            выглядела бы срезанной. Отступ даёт заливке запас, отрицательная
            прибавка не даёт съехать вёрстке. */}
        {/* На телефоне заголовок стоит в потоке, сразу под шапкой, а подписи
            идут прямо за ним — как в оригинале. На широком экране он, как
            и раньше, вынесен из потока и висит на своей высоте.

            Наложение и z-index обязаны быть на одном элементе, поэтому
            обёртки для позиционирования тут нет: всё на самом заголовке. */}
        <h1
          ref={mark}
          className="warp-wrap hero-mark relative md:absolute inset-x-0 md:top-[15vh] z-[1] px-4 pt-[0.16em] mt-[calc(9vh-0.16em)] md:-mt-[0.16em] font-monument font-black uppercase text-center leading-[0.95] tracking-[-0.025em] bg-clip-text text-transparent"
          style={
            {
              mixBlendMode: 'difference',
              // Кегль ставит useFitHeadline по замеру, в стиле лишь запасное
              // значение на случай, если скрипт не отработал
              '--mark-size': t.hero.headlineSize,
              '--mark-width': t.hero.headlineWidth,
              '--mark-size-mob': t.hero.headlineSizeMob,
              '--mark-width-mob': t.hero.headlineWidthMob,
              backgroundImage: 'linear-gradient(180deg, #ffffff 0%, #cfced3 52%, #75747a 100%)',
            } as React.CSSProperties
          }
        >
          {t.hero.headline.split('\n').map((line, i, all) => (
            <span
              key={i}
              // Наклон живёт только на последней строке — у оригинала так же
              ref={i === all.length - 1 ? tail : undefined}
              // Строка не переносится и обжимает текст: по её ширине идёт
              // подгонка кегля
              className="block w-fit mx-auto whitespace-nowrap"
            >
              {line}
            </span>
          ))}
        </h1>

        {/* ---------- Кадры: слой 10, поверх заголовка ---------- */}
        <HeroSequence />

        {/* Подложка под нижние подписи: по ходу прокрутки низ кадра меняется
            от светлой стены до тёмной тумбы, и текст любого фиксированного
            цвета где-нибудь да пропадёт. Слой 15 — выше кадра, ниже подписей. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-[38%] z-[15] pointer-events-none"
          style={{
            background:
              'linear-gradient(to bottom, rgba(10,10,10,0) 0%, rgba(10,10,10,.55) 55%, rgba(10,10,10,.8) 100%)',
          }}
        />


        {/* На телефоне пустое место уходит вниз, под подписи: там стоит
            монитор. На широком экране распорка, как и раньше, прижимает
            подписи к низу экрана. */}
        <div className="flex-1 order-last md:order-none" />

        {/* ---------- Подписи: слой 20, на светлом низу — тёмным ----------
            На телефоне это два столбца сразу под заголовком, как в
            оригинале: слева род занятий и часы, справа короткая роль.
            Длинная строка там не помещается и остаётся широкому экрану. */}
        <div className="relative z-20 px-6 md:px-10 pt-5 md:pt-0 pb-0 md:pb-14">
          <div className="mx-auto max-w-page flex flex-row items-start justify-center gap-8 md:items-end md:justify-between">
            <div
              className="hero-up font-mono font-semibold uppercase tracking-[0.1em] text-white/80 leading-[1.7] text-right md:text-left"
              style={{ fontSize: 'clamp(14px, 1.05vw, 19px)' }}
            >
              <div>{t.hero.role}</div>
              <div className="flex items-center gap-2">
                <span>{t.hero.code}</span>
                {/* Глобус нарисован, а не набран: символьный вариант в разных
                    системах выглядит по-разному, вплоть до цветной эмодзи */}
                <svg
                  className="w-[1.05em] h-[1.05em] shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9.2" />
                  <ellipse cx="12" cy="12" rx="4.2" ry="9.2" />
                  <path d="M2.9 12h18.2M4.4 7h15.2M4.4 17h15.2" />
                </svg>
                <span className="tabular-nums ml-2">{clock}</span>
                <span>{t.hero.zone}</span>
              </div>
            </div>

            {/* Короткая роль — только на телефоне */}
            <div
              className="hero-up md:hidden font-mono font-semibold uppercase tracking-[0.1em] text-white/80 leading-[1.7] whitespace-pre-line"
              style={{ fontSize: 'clamp(14px, 1.05vw, 19px)' }}
            >
              {t.hero.role2}
            </div>

            <p className="hero-up hidden md:block text-body-sm md:text-body-lg text-white/85 max-w-[21ch] md:text-right">
              {t.hero.lead}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
