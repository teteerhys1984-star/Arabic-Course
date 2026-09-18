import type { LessonLink } from '../shared/components/LessonNavigation'

/** The registry keeps the shared lesson navigation independent from lesson content. */
export const lessonRegistry: LessonLink[] = [
  { id: 'lesson-1', title: 'الدرس الأول: أقسام الكلام', available: true },
]
