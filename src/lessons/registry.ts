/**
 * The registry is the single source of truth for the course index and the reusable
 * sequential lesson architecture. Every future lesson supplies its own authoritative
 * content but reuses the same homepage, routing, sequential lesson flow, visual
 * language, quiz-interaction model, and Teacher Space by adding an entry here.
 *
 *   CourseHome → LessonShell → LessonFlow → LessonStep → current step content only
 */

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
  },
  {
    id: 'lesson-2',
    number: '٢',
    eyebrow: 'الجملة الاسمية',
    title: 'المبتدأ والخبر',
    documentTitle: 'الدرس الثاني: الجملة الاسمية',
    summary:
      'تعلّم الجملة الاسمية، والمبتدأ والخبر، وطريقة التمييز بينها وبين الجملة الفعلية مع أنشطة واختبار نهائي.',
    duration: '٧٥',
    strand: 'أساسيات النحو',
    available: true,
    parts: ['جملة اسمية', 'مبتدأ', 'خبر'],
  },
  {
    id: 'lesson-3',
    number: '٣',
    eyebrow: 'الجملة الفعلية',
    title: 'الفعل والفاعل والمفعول به',
    documentTitle: 'الدرس الثالث: الجملة الفعلية',
    summary:
      'تعلّم الجملة الفعلية، والفعل والفاعل والمفعول به، وطريقة اكتشافها بسؤالي "من قام بالفعل؟" و"ماذا فعل؟" مع أنشطة واختبار نهائي.',
    duration: '٧٥',
    strand: 'أساسيات النحو',
    available: true,
    parts: ['فعل', 'فاعل', 'مفعول به'],
  },
  {
    id: 'lesson-4',
    number: '٤',
    eyebrow: 'أزمنة الفعل',
    title: 'الفعل الماضي، والفعل المضارع، وفعل الأمر',
    documentTitle: 'الدرس الرابع: أزمنة الفعل',
    summary:
      'تعلّم الماضي والمضارع والأمر، وأحرف المضارعة، والتمييز بين الخبر والطلب مع أنشطة واختبار نهائي.',
    duration: '٧٥',
    strand: 'أساسيات النحو',
    available: true,
    parts: ['ماضٍ', 'مضارع', 'أمر'],
  },
  {
    id: 'lesson-5',
    number: '٥',
    eyebrow: 'الضمائر',
    title: 'الضمائر المنفصلة والمتصلة',
    documentTitle: 'الدرس الخامس: الضمائر المنفصلة والمتصلة',
    summary: 'تعرّف إلى ضمائر المتكلم والمخاطب والغائب، والضمائر المنفصلة والمتصلة ومرجع الضمير والتوافق.',
    duration: '٧٥',
    strand: 'أساسيات النحو',
    available: true,
    parts: ['منفصل', 'متصل', 'مستتر'],
  },
]

export function getLesson(id: string): LessonMeta | undefined {
  return lessonRegistry.find((lesson) => lesson.id === id)
}
