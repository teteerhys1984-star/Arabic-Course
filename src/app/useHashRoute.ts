import { useEffect, useState } from 'react'

/**
 * Minimal dependency-free hash routing for the permanent course URL.
 *
 * The same Arabic-Course URL stays the permanent course URL; routes are expressed as
 * hash fragments so GitHub Pages (static hosting under `/Arabic-Course/`) needs no
 * server rewrites and deep links keep working:
 *
 *   #/            → the course index (lesson hub)
 *   #/lesson/<id> → one continuous long lesson page
 *
 * In-page section anchors (`#<section-id>`) are handled separately by smooth scrolling
 * and never trigger a route change, so clicking a section scrolls within the same page.
 */
export interface Route {
  name: 'home' | 'lesson'
  lessonId?: string
}

export function parseHash(hash: string): Route {
  const clean = hash.replace(/^#/, '')
  const match = clean.match(/^\/lesson\/([^/]+)$/)
  if (match) return { name: 'lesson', lessonId: decodeURIComponent(match[1]) }
  return { name: 'home' }
}

export function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(() =>
    parseHash(typeof window === 'undefined' ? '' : window.location.hash),
  )

  useEffect(() => {
    function onChange() {
      setRoute(parseHash(window.location.hash))
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return route
}

/** Navigate to a route without a full page reload; the course URL is preserved. */
export function navigate(route: Route) {
  const target = route.name === 'lesson' && route.lessonId ? `#/lesson/${route.lessonId}` : '#/'
  if (window.location.hash !== target) {
    window.location.hash = target
  }
  // Route changes always land at the top of the destination page.
  window.scrollTo({ top: 0, behavior: 'auto' })
}
