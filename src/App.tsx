import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LanguageProvider, useLang } from './i18n'
import { useRoute } from './lib/useRoute'
import LoadingScreen from './components/LoadingScreen'
import Navbar from './components/Navbar'
import ArticlePage from './pages/ArticlePage'
import Hero from './sections/Hero'
import Works from './sections/Works'
import Journal from './sections/Journal'
import Explorations from './sections/Explorations'
import Stats from './sections/Stats'
import Contact from './sections/Contact'

function Site() {
  const route = useRoute()
  // Экран загрузки показываем только на главной: на статью посетитель
  // приходит по прямой ссылке и ждать интро не должен
  const [isLoading, setIsLoading] = useState(() => route.name === 'home')
  const { lang } = useLang()

  return (
    <>
      <AnimatePresence>
        {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>

      <Navbar />

      {/* Плавный переход при смене языка и страницы */}
      <motion.div
        key={`${lang}-${route.name === 'article' ? route.slug : 'home'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        {route.name === 'article' ? (
          <ArticlePage slug={route.slug} />
        ) : (
          <main>
            <Hero />
            <Works />
            <Journal />
            <Explorations />
            <Stats />
            <Contact />
          </main>
        )}
      </motion.div>
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
