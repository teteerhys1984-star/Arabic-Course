import type { HTMLAttributes, ReactNode } from 'react'

type Direction = 'rtl' | 'ltr' | 'auto'

interface DirectionTextProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
  direction?: Direction
  isolate?: boolean
}

/** Isolates mixed-script fragments so browser bidi rules cannot reorder surrounding teaching content. */
export function DirectionText({
  children,
  direction = 'auto',
  isolate = true,
  className = '',
  ...props
}: DirectionTextProps) {
  return (
    <span
      {...props}
      dir={direction}
      className={`direction-text ${isolate ? 'direction-text--isolated' : ''} ${className}`.trim()}
    >
      {children}
    </span>
  )
}
