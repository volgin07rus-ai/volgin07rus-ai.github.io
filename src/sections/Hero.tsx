import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import Hls from 'hls.js'
import { useLang } from '../i18n'

const HLS_URL =
  'https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8'

export default function Hero() {
  const { t, lang } = useLang()
  const videoRef = useRef<HTMLVideoElement>(null)
  const rootRef = useRef<HTMLElement>(null)
  const [roleIndex, setRoleIndex] = useState(0)

  // Фоновое видео через HLS
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (Hls.isSupported()) {
      const hls = new Hls()
      hls.loadSource(HLS_URL)
      hls.attachMedia(video)
      return () => hls.destroy()
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = HLS_URL
    }
  }, [])

  // Смена роли каждые 2 секунды
  useEffect(() => {
    setRoleIndex(0)
    const id = window.setInterval(
      () => setRoleIndex((i) => (i + 1) % t.hero.roles.length),
      2000
    )
    return () => window.clearInterval(id)
  }, [t.hero.roles.length, lang])

  // Появление через GSAP
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.fromTo(
        '.name-reveal',
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1.2, delay: 0.1 }
      ).fromTo(
        '.blur-in',
        { opacity: 0, filter: 'blur(10px)', y: 20 },
        {
          opacity: 1,
          filter: 'blur(0px)',
          y: 0,
          duration: 1,
          stagger: 0.1,
        },
        0.3
      )
    }, rootRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      id="home"
      ref={rootRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Фоновое видео */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="absolute top-1/2 left-1/2 min-w-full min-h-full object-cover -translate-x-1/2 -translate-y-1/2"
      />
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-bg to-transparent" />

      {/* Контент */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 pt-28 pb-24">
        <span className="blur-in text-xs text-muted uppercase tracking-[0.3em] mb-8">
          {t.hero.eyebrow}
        </span>

        <h1 className="name-reveal text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-display italic leading-[0.95] md:leading-[0.9] tracking-tight text-text-primary mb-6 max-w-[15ch]">
          {t.hero.name}
        </h1>

        <p className="blur-in text-base md:text-lg text-muted mb-4">
          {t.hero.roleLine(
            <span
              key={`${lang}-${roleIndex}`}
              className="font-display italic text-text-primary animate-role-fade-in inline-block"
            >
              {t.hero.roles[roleIndex]}
            </span>
          )}
        </p>

        <p className="blur-in text-sm md:text-base text-muted max-w-md mb-12">
          {t.hero.description}
        </p>

        <div className="blur-in inline-flex flex-wrap justify-center gap-4">
          {/* Основная кнопка */}
          <a
            href="#work"
            className="group relative inline-flex rounded-full transition-transform hover:scale-105"
          >
            <span
              className="absolute rounded-full opacity-0 group-hover:opacity-100 transition-opacity gradient-ring"
              style={{ inset: '-2px' }}
            />
            <span className="relative rounded-full text-sm px-7 py-3.5 bg-text-primary text-bg group-hover:bg-bg group-hover:text-text-primary transition-colors whitespace-nowrap">
              {t.hero.ctaWorks}
            </span>
          </a>

          {/* Вторичная кнопка */}
          <a
            href="#contact"
            className="group relative inline-flex rounded-full transition-transform hover:scale-105"
          >
            <span
              className="absolute rounded-full opacity-0 group-hover:opacity-100 transition-opacity gradient-ring"
              style={{ inset: '-2px' }}
            />
            <span className="relative rounded-full text-sm px-7 py-3.5 border-2 border-stroke group-hover:border-transparent bg-bg text-text-primary transition-colors whitespace-nowrap">
              {t.hero.ctaReach}…
            </span>
          </a>
        </div>
      </div>

      {/* Индикатор прокрутки */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10">
        <span className="text-xs text-muted uppercase tracking-[0.2em]">
          {t.hero.scroll}
        </span>
        <span className="relative w-px h-10 bg-stroke overflow-hidden">
          <span className="absolute inset-x-0 h-1/2 bg-text-primary/70 animate-scroll-down" />
        </span>
      </div>
    </section>
  )
}
