import type { ReactNode } from 'react'

interface LessonSectionProps {
  id: string
  title: string
  description?: string
  children: ReactNode
}

export function LessonSection({ id, title, description, children }: LessonSectionProps) {
  return (
    <section className="lesson-section" id={id} aria-labelledby={`${id}-title`}>
      <header className="section-heading">
        <h2 id={`${id}-title`}>{title}</h2>
        {description && <p>{description}</p>}
      </header>
      {children}
    </section>
  )
}
