import type { ReactNode } from 'react'

interface EducationalCardProps {
  title?: string
  eyebrow?: string
  children: ReactNode
  tone?: 'default' | 'accent' | 'soft'
}

export function EducationalCard({
  title,
  eyebrow,
  children,
  tone = 'default',
}: EducationalCardProps) {
  return (
    <article className={`card card--${tone}`}>
      {eyebrow && <p className="card__eyebrow">{eyebrow}</p>}
      {title && <h3>{title}</h3>}
      <div className="card__content">{children}</div>
    </article>
  )
}
