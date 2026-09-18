export interface LessonLink {
  id: string
  title: string
  available: boolean
}

interface LessonNavigationProps {
  lessons: LessonLink[]
  currentId?: string
  onSelect?: (id: string) => void
}

export function LessonNavigation({ lessons, currentId, onSelect }: LessonNavigationProps) {
  return (
    <nav className="lesson-nav" aria-label="التنقل بين الدروس">
      <p className="lesson-nav__label">الدروس</p>
      <ul>
        {lessons.map((lesson) => (
          <li key={lesson.id}>
            <button
              type="button"
              disabled={!lesson.available}
              aria-current={currentId === lesson.id ? 'page' : undefined}
              onClick={() => onSelect?.(lesson.id)}
            >
              {lesson.title}
              {!lesson.available && <span>قريبًا</span>}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
