/**
 * The registry is the single source of truth for the course index and the reusable
 * lesson architecture. Every future lesson supplies its own authoritative content but
 * reuses the same homepage, routing, long-page shell, section-anchor navigation, visual
 * language, quiz-interaction model, and Teacher Space by adding an entry here.
 */

/** A compact, scroll-anchor navigation entry. `id` must match a section id on the page. */
export interface LessonNavItem {
  /** The DOM id of the section the anchor scrolls to (never a route change). */
  id: string
  /** Short Arabic label shown in the sticky section navigation. */
  label: string
}

export interface LessonMeta {
  /** Stable lesson id, also used as the hash-route slug: `#/lesson/<id>`. */
  id: string
  /** Localized (Arabic-Indic) lesson number for display, e.g. "١". */
  number: string
  /** Display eyebrow above the lesson title, e.g. "أقسام الكلام". */
  eyebrow: string
  /** Main lesson title, e.g. "الاسم والفعل والحرف". */
  title: string
  /** Full ordinal + topic label, e.g. "الدرس الأول: أقسام الكلام" (used for the tab title). */
  documentTitle: string
  /** One-line summary shown on the course index and the lesson hero. */
  summary: string
  /** Estimated duration, localized digits, e.g. "٦٠". */
  duration: string
  /** Short strand/track label shown on the index card, e.g. "أساسيات النحو". */
  strand: string
  /** Whether the lesson is published and openable from the index. */
  available: boolean
  /** Compact scroll-anchor navigation reflecting the lesson's real sections. */
  nav: LessonNavItem[]
  /** Hero milestone chips, e.g. ["اسم", "فعل", "حرف"]. */
  parts: string[]
}

export const lessonRegistry: LessonMeta[] = [
  {
    id: 'lesson-1',
    number: '١',
    eyebrow: 'أقسام الكلام',
    title: 'الاسم والفعل والحرف',
    documentTitle: 'الدرس الأول: أقسام الكلام',
    summary:
      'تعرّف إلى أقسام الكلام الثلاثة، وعلامات الاسم، وأنواع الفعل، وطريقة تمييز كل كلمة في الجملة.',
    duration: '٦٠',
    strand: 'أساسيات النحو',
    available: true,
    parts: ['اسم', 'فعل', 'حرف'],
    nav: [
      { id: 'lesson-overview', label: 'التمهيد' },
      { id: 'speech', label: 'الكلام' },
      { id: 'parts', label: 'الأقسام' },
      { id: 'noun', label: 'الاسم' },
      { id: 'verb', label: 'الفعل' },
      { id: 'particle', label: 'الحرف' },
      { id: 'classification', label: 'التمييز' },
      { id: 'activities', label: 'النشاط' },
      { id: 'summary', label: 'المراجعة' },
      { id: 'final-test', label: 'الاختبار' },
      { id: 'teacher-space', label: 'المعلم' },
    ],
  },
]

export function getLesson(id: string): LessonMeta | undefined {
  return lessonRegistry.find((lesson) => lesson.id === id)
}
