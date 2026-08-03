import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLang } from '../i18n'
import ArtCard from '../components/ArtCard'

gsap.registerPlugin(ScrollTrigger)

const ROTATIONS = [-4, 3, -2, 5, -3, 2]

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
        <h2 className="text-4xl md:text-6xl lg:text-7xl tracking-tight leading-[1.05] mb-4">
          {t.explorations.headingLead}{' '}
          <span className="font-display italic">
            {t.explorations.headingItalic}
          </span>
        </h2>
        <p className="text-sm md:text-base text-muted max-w-md mb-8">
          {t.explorations.subtext}
        </p>
        <a
          href="#work"
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
        <div className="w-full max-w-[1400px] grid grid-cols-2 gap-12 md:gap-40">
          <div ref={colARef} className="flex flex-col gap-12 md:gap-24 md:pt-[20vh]">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-full max-w-[320px] aspect-square rounded-2xl overflow-hidden border border-stroke ml-auto"
                style={{ transform: `rotate(${ROTATIONS[i]}deg)` }}
              >
                <ArtCard index={i} />
              </div>
            ))}
          </div>

          <div ref={colBRef} className="flex flex-col gap-12 md:gap-24 md:pt-[45vh]">
            {[3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-full max-w-[320px] aspect-square rounded-2xl overflow-hidden border border-stroke"
                style={{ transform: `rotate(${ROTATIONS[i]}deg)` }}
              >
                <ArtCard index={i} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
