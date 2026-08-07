import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLang } from '../i18n'

gsap.registerPlugin(ScrollTrigger)

const ROTATIONS = [-4, 3, -2, 5, -3, 2]

/**
 * Макрокадры фрагментов (public/gallery) — не скриншоты целиком:
 * их уже показывает блок работ выше. Здесь то, что на общем плане не видно.
 */
const SHOTS = [
  { file: 'd1.jpg', alt: 'Кромка жидкого стекла на карточке парфюмерного дома' },
  { file: 'd4.jpg', alt: 'Макропортрет из съёмочной студии Lumora' },
  { file: 'd2.jpg', alt: 'Лаймовая кнопка со стрелкой в письме «Ракета»' },
  { file: 'd3.jpg', alt: 'Воксельный герой инди-студии «Кубики»' },
  { file: 'd5.jpg', alt: 'Трёхмерный цветок с промо-страницы Veldara' },
  { file: 'd6.jpg', alt: 'Зелёный градиент и крупная типографика TerraElix' },
]

function Shot({ i }: { i: number }) {
  const s = SHOTS[i]
  return (
    <img
      src={`${import.meta.env.BASE_URL}gallery/${s.file}`}
      alt={s.alt}
      loading="lazy"
      decoding="async"
      className="w-full h-full object-cover object-top"
    />
  )
}

export default function Explorations() {
  const { t } = useLang()
  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const colARef = useRef<HTMLDivElement>(null)
  const colBRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    if (!mq.matches) return

    const ctx = gsap.context(() => {
      // Закрепляем центральный блок
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        pin: contentRef.current,
        pinSpacing: false,
      })

      // Параллакс колонок навстречу друг другу
      gsap.fromTo(
        colARef.current,
        { y: 120 },
        {
          y: -180,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.6,
          },
        }
      )
      gsap.fromTo(
        colBRef.current,
        { y: -80 },
        {
          y: 220,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.6,
          },
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative bg-bg md:min-h-[300vh] py-20 md:py-0 overflow-hidden"
    >
      {/* Слой 1 — закреплённый центр */}
      <div
        ref={contentRef}
        className="relative z-10 md:h-screen flex flex-col items-center justify-center text-center px-6 pointer-events-none"
      >
        <div className="flex items-center gap-3 mb-5">
          <span className="w-8 h-px bg-stroke" />
          <span className="text-xs text-muted uppercase tracking-[0.3em]">
            {t.explorations.eyebrow}
          </span>
        </div>
        {/* Ширина ограничена намеренно: центр должен помещаться в просвет
            между колонками, иначе карточки наезжают на текст */}
        <h2 className="text-4xl md:text-5xl lg:text-6xl tracking-tight leading-[1.05] mb-4 max-w-[340px] lg:max-w-[520px]">
          {t.explorations.headingLead}{' '}
          <span className="font-display italic">
            {t.explorations.headingItalic}
          </span>
        </h2>
        <p className="text-sm md:text-base text-muted max-w-[320px] lg:max-w-[460px] mb-8">
          {t.explorations.subtext}
        </p>
        <a
          href="#contact"
          className="group relative inline-flex rounded-full pointer-events-auto"
        >
          <span
            className="absolute rounded-full opacity-0 group-hover:opacity-100 transition-opacity gradient-ring"
            style={{ inset: '-2px' }}
          />
          <span className="relative rounded-full bg-bg border border-stroke group-hover:border-transparent text-sm px-6 py-3 text-text-primary whitespace-nowrap transition-colors">
            {t.explorations.cta}
          </span>
        </a>
      </div>

      {/* Слой 2 — параллакс-колонки */}
      <div className="md:absolute md:inset-0 z-20 flex items-start justify-center px-6 mt-16 md:mt-0 pointer-events-none">
        {/* На широких экранах колонки разведены к краям, а не поставлены
            сеткой с фиксированным зазором: раньше просвет всегда был 160px,
            и текст в центре перекрывался карточками на любой ширине. */}
        <div className="w-full max-w-[1500px] grid grid-cols-2 gap-12 md:flex md:justify-between md:gap-8">
          <div
            ref={colARef}
            className="flex flex-col gap-12 md:gap-24 md:pt-[20vh] md:shrink-0"
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-full md:w-[19vw] max-w-[320px] md:max-w-[260px] xl:max-w-[300px] aspect-square rounded-2xl overflow-hidden border border-stroke ml-auto"
                style={{ transform: `rotate(${ROTATIONS[i]}deg)` }}
              >
                <Shot i={i} />
              </div>
            ))}
          </div>

          <div
            ref={colBRef}
            className="flex flex-col gap-12 md:gap-24 md:pt-[45vh] md:shrink-0"
          >
            {[3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-full md:w-[19vw] max-w-[320px] md:max-w-[260px] xl:max-w-[300px] aspect-square rounded-2xl overflow-hidden border border-stroke"
                style={{ transform: `rotate(${ROTATIONS[i]}deg)` }}
              >
                <Shot i={i} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
