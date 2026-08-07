import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LanguageProvider, useLang, LANG_FADE_MS } from './i18n'
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
  const { switching } = useLang()

  return (
    <>
      <AnimatePresence>
        {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>

      <Navbar />

      {/* Смена языка гасит контент и проявляет обратно — без пересборки дерева,
          иначе на каждом переключении перезапускались бы видео и скролл-триггеры.
          Меню наверху остаётся вне этого блока и не гаснет вместе с ним.
          Гасим только прозрачностью: filter сломал бы закрепление секций GSAP. */}
      <motion.div
        key={route.name === 'article' ? route.slug : 'home'}
        initial={{ opacity: 0 }}
        animate={{ opacity: switching ? 0.12 : 1 }}
        transition={{
          duration: switching ? LANG_FADE_MS / 1000 : 0.45,
          ease: 'easeOut',
        }}
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
