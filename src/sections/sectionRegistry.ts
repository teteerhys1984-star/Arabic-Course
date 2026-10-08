import { lessonRegistry, type LessonMeta } from '../lessons/registry'

/**
 * The section registry is the single source of truth for the platform's information
 * architecture:
 *
 *   Arabic Platform → Section → Lessons → LessonFlow
 *
 * The platform is organized into five permanent sections. Every lesson in the lesson
 * registry declares the one section it belongs to (`LessonMeta.sectionId`), so:
 *
 *  - the home page (`#/`) renders the five sections automatically from this registry;
 *  - a section page (`#/sections/<id>`) renders exactly the lessons of that section
 *    (or an elegant empty state when it has none yet);
 *  - adding a future lesson is a lesson-registry entry with a `sectionId` — it appears
 *    in the right section automatically, with no home-page or UI edits.
 *
 * Section descriptions are short, general definitions of each section's scope (the
 * topic list only). They never contain lesson content or new curricular material.
 */

/** The five permanent section ids, also used as the hash-route slugs: `#/sections/<id>`. */
export const sectionIds = [
  'basics-grammar',
  'morphology',
  'spelling',
  'rhetoric',
  'reading-expression',
] as const

export type SectionId = (typeof sectionIds)[number]

export interface SectionMeta {
  /** Stable section id, also the hash-route slug: `#/sections/<id>`. */
  id: SectionId
  /** Display order of the section on the platform home. */
  order: number
  /** Section title, e.g. "الأساسيات والنحو". */
  title: string
  /** Short general definition of the section's scope (topics only, never lesson content). */
  description: string
  /** Decorative Arabic letter mark representing the section (like the brand's "ض"). */
  glyph: string
  /** Visual accent key, mapped to a CSS modifier class for section-specific tinting. */
  accent: 'green' | 'gold' | 'coral' | 'violet' | 'teal'
}

export const sectionRegistry: SectionMeta[] = [
  {
    id: 'basics-grammar',
    order: 1,
    title: 'الأساسيات والنحو',
    description: 'أقسام الكلام، والجملة وأنواعها، والقواعد النحوية، والإعراب.',
    glyph: 'ن',
    accent: 'green',
  },
  {
    id: 'morphology',
    order: 2,
    title: 'الصرف',
    description: 'الجذر والوزن، والأفعال، والمصدر، والمشتقات.',
    glyph: 'ص',
    accent: 'gold',
  },
  {
    id: 'spelling',
    order: 3,
    title: 'الإملاء',
    description: 'الهمزات، والألف اللينة، والتاء المربوطة والتاء المفتوحة، والألف الفارقة، وعلامات الترقيم.',
    glyph: 'إ',
    accent: 'coral',
  },
  {
    id: 'rhetoric',
    order: 4,
    title: 'البلاغة',
    description: 'التشبيه، والاستعارة، والكناية، والمحسنات البديعية.',
    glyph: 'ب',
    accent: 'violet',
  },
  {
    id: 'reading-expression',
    order: 5,
    title: 'القراءة والفهم والتعبير',
    description: 'القراءة، والفهم والاستيعاب، والتعبير، وتطبيق القواعد في القراءة والكتابة والتحرير.',
    glyph: 'ق',
    accent: 'teal',
  },
]

/** All sections in their display order. */
export function getSections(): SectionMeta[] {
  return [...sectionRegistry].sort((first, second) => first.order - second.order)
}

/** One section by its route id. */
export function getSection(id: string): SectionMeta | undefined {
  return sectionRegistry.find((section) => section.id === id)
}

/**
 * Every lesson that belongs to a section, in lesson-registry order. Derived data —
 * a new lesson with this `sectionId` appears here (and in the UI) automatically.
 */
export function getSectionLessons(sectionId: SectionId): LessonMeta[] {
  return lessonRegistry.filter((lesson) => lesson.sectionId === sectionId)
}

/** The section a lesson belongs to. */
export function getSectionForLesson(lesson: LessonMeta): SectionMeta | undefined {
  return getSection(lesson.sectionId)
}

/** Convert Western digits to Arabic-Indic digits, e.g. 10 → "١٠". */
export function toArabicDigits(value: number | string): string {
  return String(value).replace(/[0-9]/g, (digit) => '٠١٢٣٤٥٦٧٨٩'[Number(digit)])
}

/**
 * Localized lesson-count phrase with the correct Arabic plural form,
 * e.g. 0 → "لا توجد دروس بعد", 10 → "١٠ دروس".
 */
export function lessonsCountLabel(count: number): string {
  if (count === 0) return 'لا توجد دروس بعد'
  if (count === 1) return 'درس واحد'
  if (count === 2) return 'درسان'
  if (count <= 10) return `${toArabicDigits(count)} دروس`
  return `${toArabicDigits(count)} درسًا`
}
