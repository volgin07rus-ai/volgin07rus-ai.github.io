import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import Hls from 'hls.js'
import { useLang } from '../i18n'

const HLS_URL =
  'https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8'

const EMAIL = 'hello@volgin.dev'
const SOCIALS: { label: string; href: string }[] = [
  { label: 'GitHub', href: 'https://github.com/volgin07rus-ai' },
  { label: 'Twitter', href: '#contact' },
  { label: 'LinkedIn', href: '#contact' },
  { label: 'Dribbble', href: '#contact' },
]

export default function Contact() {
  const { t } = useLang()
  const videoRef = useRef<HTMLVideoElement>(null)
  const marqueeRef = useRef<HTMLDivElement>(null)

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

  // Бегущая строка
  useEffect(() => {
    const el = marqueeRef.current
    if (!el) return
    const tween = gsap.to(el, {
      xPercent: -50,
      duration: 40,
      ease: 'none',
      repeat: -1,
    })
    return () => {
      tween.kill()
      gsap.set(el, { xPercent: 0 })
    }
  }, [t.contact.marquee])

  return (
    <section
      id="contact"
      className="relative bg-bg pt-16 md:pt-20 pb-8 md:pb-12 overflow-hidden"
    >
      {/* Фоновое видео, перевёрнутое по вертикали */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="absolute top-1/2 left-1/2 min-w-full min-h-full object-cover -translate-x-1/2 -translate-y-1/2 scale-y-[-1]"
      />
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10">
        {/* Бегущая строка */}
        <div className="overflow-hidden py-6 mb-12 md:mb-16">
          <div ref={marqueeRef} className="flex w-max whitespace-nowrap">
            {Array.from({ length: 10 }).map((_, i) => (
              <span
                key={i}
                className="text-3xl md:text-5xl font-display italic text-text-primary/70 px-6"
              >
                {t.contact.marquee} •
              </span>
            ))}
          </div>
        </div>

        {/* Призыв к действию */}
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16 text-center">
          <h2 className="text-4xl md:text-6xl lg:text-7xl tracking-tight leading-[1.05] mb-5">
            {t.contact.headingLead}{' '}
            <span className="font-display italic">
              {t.contact.headingItalic}
            </span>
          </h2>
          <p className="text-sm md:text-base text-muted max-w-md mx-auto mb-10">
            {t.contact.subtext}
          </p>

          <a
            href={`mailto:${EMAIL}`}
            className="group relative inline-flex rounded-full transition-transform hover:scale-105"
          >
            <span
              className="absolute rounded-full opacity-0 group-hover:opacity-100 transition-opacity gradient-ring"
              style={{ inset: '-2px' }}
            />
            <span className="relative rounded-full text-sm px-8 py-4 bg-text-primary text-bg group-hover:bg-bg group-hover:text-text-primary transition-colors whitespace-nowrap">
              {t.contact.email} ↗
            </span>
          </a>
        </div>

        {/* Нижняя панель */}
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16 mt-16 md:mt-24 pt-8 border-t border-stroke/60">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-xs sm:text-sm text-muted order-3 md:order-1 text-center md:text-left">
              © 2026 {t.hero.name}. {t.contact.rights}
            </p>

            <div className="flex items-center gap-5 order-1 md:order-2">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  {...(s.href.startsWith('http')
                    ? { target: '_blank', rel: 'noreferrer' }
                    : {})}
                  className="text-xs sm:text-sm text-muted hover:text-text-primary transition-colors"
                >
                  {s.label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2 order-2 md:order-3">
              <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-xs sm:text-sm text-muted whitespace-nowrap">
                {t.contact.available}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
