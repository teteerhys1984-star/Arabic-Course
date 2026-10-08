import type { MouseEvent, ReactNode } from 'react'
import { navigate, routeToHash, type Route } from './useHashRoute'

export interface Crumb {
  /** Crumb label, e.g. "اللغة العربية" or a section title. */
  label: ReactNode
  /** Target route; omitted for the final crumb (the current page). */
  route?: Route
  /** Marks the final crumb as the current page (`aria-current="page"`). */
  current?: boolean
}

/**
 * Shared hierarchical breadcrumb trail for the platform:
 *
 *   اللغة العربية ← القسم            (on a section page)
 *   اللغة العربية ← القسم ← الدرس ١  (on a lesson page)
 *
 * The trail mirrors the information architecture (Platform → Section → Lesson). It is
 * a real `<nav>` with an ordered list; every ancestor is a link to its own hash route
 * (so it works with middle-click / new-tab gestures too), while clicks navigate through
 * the shared router and land at the top of the destination page. The "←" separator is
 * decorative (aria-hidden) and points forward in the RTL reading direction.
 */
export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  function open(event: MouseEvent<HTMLAnchorElement>, route: Route) {
    // Let the browser handle new-tab / new-window gestures natively.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    navigate(route)
  }

  return (
    <nav className="breadcrumbs" aria-label="مسار التنقل">
      <ol className="breadcrumbs__list" role="list">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1
          return (
            <li key={index} className="breadcrumbs__item">
              {crumb.route && !isLast ? (
                <a
                  className="breadcrumbs__link"
                  href={routeToHash(crumb.route)}
                  onClick={(event) => open(event, crumb.route as Route)}
                >
                  {crumb.label}
                </a>
              ) : (
                <span className="breadcrumbs__current" aria-current="page">
                  {crumb.label}
                </span>
              )}
              {!isLast && (
                <span className="breadcrumbs__separator" aria-hidden="true">
                  ←
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
