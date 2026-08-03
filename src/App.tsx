import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LanguageProvider, useLang } from './i18n'
import LoadingScreen from './components/LoadingScreen'
import Navbar from './components/Navbar'
import Hero from './sections/Hero'
import Works from './sections/Works'
import Journal from './sections/Journal'
import Explorations from './sections/Explorations'
import Stats from './sections/Stats'
import Contact from './sections/Contact'

function Site() {
  const [isLoading, setIsLoading] = useState(true)
  const { lang } = useLang()

  return (
    <>
      <AnimatePresence>
        {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>

      <Navbar />

      {/* Плавный переход при смене языка */}
      <motion.main
        key={lang}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <Hero />
        <Works />
        <Journal />
        <Explorations />
        <Stats />
        <Contact />
      </motion.main>
    </>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <Site />
    </LanguageProvider>
  )
}
