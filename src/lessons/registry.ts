import type { LessonLink } from '../shared/components/LessonNavigation'

/** Future lessons are registered here without coupling navigation to lesson content. */
export const lessonRegistry: LessonLink[] = [
  { id: 'lesson-1', title: 'الدرس الأول', available: false },
]
