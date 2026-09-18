import { useEffect, useState } from 'react'
import type { LessonNavItem } from '../../lessons/registry'

interface SectionNavProps {
  items: LessonNavItem[]
}

/**
 * Reusable compact, sticky section navigation for the long lesson page.
 *
 * These are navigation ANCHORS, not tabs: clicking one keeps the whole page visible,
 * hides/replaces nothing, and smoothly scrolls to the destination section, which is then
 * highlighted. A scroll-spy keeps the active anchor in sync while the student scrolls, so
 * the experience always feels like moving through one continuous lesson.
 */
export function SectionNav({ items }: SectionNavProps) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? '')

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => Boolean(element))
    if (sections.length === 0) return
    // Environments without IntersectionObserver still get working anchor scrolling.
    if (typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: [0, 0.25, 0.5, 1] },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [items])

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>, id: string) {
    const target = document.getElementById(id)
    if (!target) return
    event.preventDefault()
    setActiveId(id)
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    // Reflect the section in the address bar without a route change.
    if (window.history.replaceState) {
      window.history.replaceState(null, '', `#${id}`)
    }
  }

  return (
    <nav className="section-nav" aria-label="أقسام الدرس">
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={activeId === item.id ? 'section-nav__link section-nav__link--active' : 'section-nav__link'}
              aria-current={activeId === item.id ? 'true' : undefined}
              onClick={(event) => handleClick(event, item.id)}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
