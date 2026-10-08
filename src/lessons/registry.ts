import type { SectionId } from '../sections/sectionRegistry'

/**
 * The registry is the single source of truth for the course index and the reusable
 * sequential lesson architecture. Every future lesson supplies its own authoritative
 * content but reuses the same platform shell, routing, sequential lesson flow, visual
 * language, quiz-interaction model, and Teacher Space by adding an entry here.
 *
 *   Arabic Platform → Section → Lessons → LessonFlow
 *   CourseHome (sections) → SectionPage (lesson grid) → LessonShell → LessonFlow → LessonStep
 *
 * Every lesson declares the one section it belongs to (`sectionId`, from the section
 * registry), so it appears under that section automatically — the home page and the
 * section pages are never edited by hand when a lesson is added.
 */

export interface LessonMeta {
  /** Stable lesson id, also used as the hash-route slug: `#/lesson/<id>`. */
  id: string
  /** The one platform section this lesson belongs to (drives Section → Lessons navigation). */
  sectionId: SectionId
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
    sectionId: 'basics-grammar',
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
    sectionId: 'basics-grammar',
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
    sectionId: 'basics-grammar',
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
    sectionId: 'basics-grammar',
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
    sectionId: 'basics-grammar',
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
  {
    id: 'lesson-6',
    sectionId: 'basics-grammar',
    number: '٦',
    eyebrow: 'علامات الإعراب',
    title: 'علامات الإعراب الأصلية والفرعية',
    documentTitle: 'الدرس السادس: علامات الإعراب الأصلية والفرعية',
    summary: 'تعلّم حالات الإعراب الأربع وعلاماتها الأصلية، ثم تعرّف تمهيديًا إلى العلامات الفرعية مع أمثلة وأنشطة واختبار شامل.',
    duration: '٩٠',
    strand: 'أساسيات النحو',
    available: true,
    parts: ['رفع', 'نصب', 'جر', 'جزم'],
  },
  {
    id: 'lesson-7',
    sectionId: 'basics-grammar',
    number: '٧',
    eyebrow: 'المثنى والجمع',
    title: 'المثنى وجمع المذكر السالم وجمع المؤنث السالم',
    documentTitle: 'الدرس السابع: المثنى وجمع المذكر السالم وجمع المؤنث السالم',
    summary:
      'تعلّم المفرد والمثنى والجمع، وعلامات إعراب المثنى وجمع المذكر السالم وجمع المؤنث السالم، والتمييز بينها مع أنشطة وإعراب كامل واختبار نهائي.',
    duration: '٩٠',
    strand: 'أساسيات النحو',
    available: true,
    parts: ['مثنى', 'جمع مذكر سالم', 'جمع مؤنث سالم'],
  },
  {
    id: 'lesson-8',
    sectionId: 'basics-grammar',
    number: '٨',
    eyebrow: 'الأسماء الخمسة',
    title: 'الأسماء الخمسة',
    documentTitle: 'الدرس الثامن: الأسماء الخمسة',
    summary:
      'تعلّم الأسماء الخمسة: أب وأخ وحم وفو وذو، وإعرابها بالواو والألف والياء نيابة عن الحركات، وشروط إعرابها بالحروف، والفرق بينها وبين المثنى، مع أنشطة واختبار نهائي وحلول.',
    duration: '٩٠',
    strand: 'أساسيات النحو',
    available: true,
    parts: ['أب', 'أخ', 'حم', 'فو', 'ذو'],
  },
  {
    id: 'lesson-9',
    sectionId: 'basics-grammar',
    number: '٩',
    eyebrow: 'الأفعال الناسخة',
    title: 'كان وأخواتها',
    documentTitle: 'الدرس التاسع: كان وأخواتها',
    summary:
      'تعلّم كان وأخواتها: كان وأصبح وأمسى وأضحى وظلّ وبات وصار وليس، وعملها في الجملة الاسمية برفع الاسم ونصب الخبر، والتمييز بين اسم كان وخبرها قبل وبعد دخولها، مع الإعراب الكامل والأنشطة واختبار نهائي وحلول.',
    duration: '٩٠',
    strand: 'أساسيات النحو',
    available: true,
    parts: ['كان', 'أصبح', 'صار', 'ليس'],
  },
  {
    id: 'lesson-10',
    sectionId: 'basics-grammar',
    number: '١٠',
    eyebrow: 'الحروف الناسخة',
    title: 'إنَّ وأخواتها',
    documentTitle: 'الدرس العاشر: إنَّ وأخواتها',
    summary:
      'تعلّم إنَّ وأخواتها: إنَّ وأنَّ وكأنَّ ولكنَّ وليتَ ولعلَّ، وعملها في الجملة الاسمية بنصب الاسم ورفع الخبر، والتمييز بين اسمها وخبرها، والإعراب الفرعي، والمقارنة مع كان، مع الأنشطة واختبار مستقل وحلول.',
    duration: '٩٠',
    strand: 'أساسيات النحو',
    available: true,
    parts: ['إنَّ', 'أنَّ', 'كأنَّ', 'لكنَّ', 'ليتَ', 'لعلَّ'],
  },
  {
    id: 'morphology-lesson-01',
    sectionId: 'morphology',
    number: '١',
    eyebrow: 'مدخل إلى الصرف',
    title: 'مدخل إلى علم الصرف',
    documentTitle: 'الدرس الأول: مدخل إلى علم الصرف',
    summary:
      'الكلمة والجذر والأصل والزيادة والاشتقاق: تعرّف إلى علم الصرف وموضوعه، والفرق بينه وبين النحو، والجذر والحروف الأصلية والزائدة، والميزان الصرفي، مع مختبرات تفاعلية واختبار من ٤٥ سؤالًا وحلول.',
    duration: '٩٠',
    strand: 'الصرف',
    available: true,
    parts: ['جذر', 'وزن', 'اشتقاق'],
  },
]

export function getLesson(id: string): LessonMeta | undefined {
  return lessonRegistry.find((lesson) => lesson.id === id)
}
