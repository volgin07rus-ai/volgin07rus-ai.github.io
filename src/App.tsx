import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import CursorTag from './components/CursorTag'
import PageCurtain from './components/PageCurtain'
import Navbar from './components/Navbar'
import Hero from './sections/Hero'
import About from './sections/About'
import Services from './sections/Services'
import Work from './sections/Work'
import Footer from './sections/Footer'
import { useLang } from './lib/lang'

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  const { lang } = useLang()

  // От языка меняется длина текстов, а значит и высоты секций. Привязки
  // прокрутки посчитаны по старым высотам, поэтому пересчитываем — но не
  // сразу: сначала должна встать вёрстка и догрузиться шрифт.
  useEffect(() => {
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 120)
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    return () => window.clearTimeout(id)
  }, [lang])

  useEffect(() => {
    // При выключенных анимациях родную прокрутку не подменяем
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({ smoothWheel: true })
    // Без этой связки ScrollTrigger считает позиции по нативному скроллу
    // и все привязки разъезжаются с плавной прокруткой
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
    }
  }, [])

  return (
    <>
      <PageCurtain />
      <CursorTag />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Work />
        <Services />
      </main>
      <Footer />
    </>
  )
}
