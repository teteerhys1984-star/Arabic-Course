import { useEffect, useState } from 'react'

/**
 * Minimal dependency-free hash routing for the permanent course URL.
 *
 * The same Arabic-Course URL stays the permanent course URL; routes are expressed as
 * hash fragments so GitHub Pages (static hosting under `/Arabic-Course/`) needs no
 * server rewrites and deep links keep working:
 *
 *   #/                   → the platform home (the five section cards)
 *   #/sections           → alias of the platform home (the home IS the section index)
 *   #/sections/<id>      → one section: its lesson grid or its empty state
 *   #/lesson/<id>        → the sequential lesson flow (one step visible at a time)
 *
 * Lesson deep links (`#/lesson/<id>`) are permanent and unchanged by the section
 * architecture: every existing lesson URL keeps working exactly as before.
 *
 * Progress through a lesson's steps is handled entirely by LessonFlow's internal state
 * (السابق / التالي) and never changes the route or the URL hash.
 */
export interface Route {
  name: 'home' | 'section' | 'lesson'
  /** Present when `name === 'section'`; a section-registry id, e.g. "basics-grammar". */
  sectionId?: string
  /** Present when `name === 'lesson'`; a lesson-registry id, e.g. "lesson-1". */
  lessonId?: string
}

/** The hash fragment for a route — shared by `navigate` and breadcrumb/card links. */
export function routeToHash(route: Route): string {
  if (route.name === 'lesson' && route.lessonId) return `#/lesson/${route.lessonId}`
  if (route.name === 'section' && route.sectionId) return `#/sections/${route.sectionId}`
  return '#/'
}

export function parseHash(hash: string): Route {
  const clean = hash.replace(/^#/, '')
  const lessonMatch = clean.match(/^\/lesson\/([^/]+)$/)
  if (lessonMatch) return { name: 'lesson', lessonId: decodeURIComponent(lessonMatch[1]) }
  const sectionMatch = clean.match(/^\/sections\/([^/]+)$/)
  if (sectionMatch) return { name: 'section', sectionId: decodeURIComponent(sectionMatch[1]) }
  // Everything else (including the `#/sections` alias) is the platform home.
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
  const target = routeToHash(route)
  if (window.location.hash !== target) {
    window.location.hash = target
  }
  // Route changes always land at the top of the destination page.
  window.scrollTo({ top: 0, behavior: 'auto' })
}
