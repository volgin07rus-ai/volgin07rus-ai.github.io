import { useEffect, useState } from 'react'

/**
 * Простая маршрутизация по хешу: #/journal/<slug>.
 *
 * Хеш выбран намеренно вместо history API — GitHub Pages отдаёт 404 на
 * вложенных путях, а хеш работает без серверных правил и без 404.html.
 */
export type Route = { name: 'home' } | { name: 'article'; slug: string }

function parse(hash: string): Route {
  const m = hash.match(/^#\/journal\/([\w-]+)$/)
  return m ? { name: 'article', slug: m[1] } : { name: 'home' }
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parse(window.location.hash))

  useEffect(() => {
    const onChange = () => setRoute(parse(window.location.hash))
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  // При переходе на статью и обратно всегда показываем начало страницы
  useEffect(() => {
    if (route.name === 'article') window.scrollTo(0, 0)
  }, [route.name, route.name === 'article' ? route.slug : ''])

  return route
}

export const articleHref = (slug: string) => `#/journal/${slug}`
