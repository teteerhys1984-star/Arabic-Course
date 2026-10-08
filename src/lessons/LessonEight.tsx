import { useState, type ReactNode } from 'react'
import { EducationalCard } from '../shared/components/EducationalCard'
import { LessonFlow, type LessonStepDefinition } from '../shared/components/LessonFlow'
import { TeacherSpace } from '../shared/teacher/TeacherSpace'

interface Props {
  onProgressChange?: (value: number) => void
  onFinish?: () => void
}

/* ================================================================== *
 * طبقة المصدر: بيانات الدرس الثامن «الأسماء الخمسة» كما وردت في المادة
 * ================================================================== */

/** أهداف الدرس التسعة كما وردت في المصدر. */
const objectives = [
  'معرفة ما المقصود بالأسماء الخمسة.',
  'حفظ الأسماء الخمسة وتمييزها.',
  'معرفة علامات إعرابها.',
  'معرفة متى تُعرب بالحروف بدل الحركات.',
  'التمييز بين الواو والألف والياء في إعرابها.',
  'إعراب الأسماء الخمسة إعرابًا صحيحًا.',
  'معرفة الشروط التي تجعل الاسم من الأسماء الخمسة.',
  'اكتشاف الأخطاء الشائعة في استعمالها.',
  'الربط بين الأسماء الخمسة ودرس علامات الإعراب الفرعية.',
]

/** الأسماء الخمسة الخمسة بصورها الثلاث ومعانيها — جدول المصدر الجامع. */
const fiveNames = [
  { name: 'أب', raf: 'أبو', nasb: 'أبا', jarr: 'أبي', meaning: 'الوالد' },
  { name: 'أخ', raf: 'أخو', nasb: 'أخا', jarr: 'أخي', meaning: 'الأخ' },
  {
    name: 'حم',
    raf: 'حمو',
    nasb: 'حما',
    jarr: 'حمي',
    meaning: 'قريب الزوج أو الزوجة من أهلها، ويُستعمل في ألفاظ القرابة',
  },
  { name: 'فو', raf: 'فو', nasb: 'فا', jarr: 'في', meaning: 'الفم' },
  { name: 'ذو', raf: 'ذو', nasb: 'ذا', jarr: 'ذي', meaning: 'صاحب' },
]

/** العلامات الثلاث: الواو في الرفع، والألف في النصب، والياء في الجر. */
const caseSigns = [
  { state: 'الرفع', sign: 'الواو' },
  { state: 'النصب', sign: 'الألف' },
  { state: 'الجر', sign: 'الياء' },
]

/** صور كل اسم في الحالات الثلاث كما وردت في قسم «نفهمها بطريقة سهلة». */
const threeForms = [
  { form: 'أبو', state: 'رفع', sentence: 'جاءَ أبو خالدٍ.', sign: 'الواو' },
  { form: 'أبا', state: 'نصب', sentence: 'رأيتُ أبا خالدٍ.', sign: 'الألف' },
  { form: 'أبي', state: 'جر', sentence: 'سلّمتُ على أبي خالدٍ.', sign: 'الياء' },
]

/** شروط إعراب الأسماء الخمسة بالحروف مع مثال يوضح كل شرط. */
const conditions = [
  {
    order: 'الأول',
    title: 'أن تكون مفردة',
    detail: 'أي ليست مثنى ولا جمعًا.',
    example: 'أبو الطالبِ (مفرد).',
    counter: 'جاءَ أبوانِ: «أبوان» مثنى، ويُعرب إعراب المثنى فيُرفع بالألف، لا بالواو.',
  },
  {
    order: 'الثاني',
    title: 'أن تكون مضافة',
    detail: 'أي أن يأتي بعدها اسم أو شيء يكمّل معناها.',
    example: 'أبو الطالبِ، وأخو محمدٍ، وذو علمٍ.',
    counter: '«أبو» وحدها لا تكفي هنا لتطبيق قاعدة الأسماء الخمسة.',
  },
  {
    order: 'الثالث',
    title: 'ألا تكون مضافة إلى ياء المتكلم',
    detail: 'إذا أضيف الاسم إلى ياء المتكلم تغيّر الحكم.',
    example: 'جاءَ أبي. ← «أبي»: فاعل مرفوع، وعلامة رفعه ضمة مقدرة.',
    counter: 'هنا لا نقول: «أبي مرفوع بالواو».',
  },
  {
    order: 'الرابع',
    title: 'في «فو»: حذف الميم',
    detail: 'حتى تُعرب «فو» إعراب الأسماء الخمسة يجب أن تكون خالية من الميم.',
    example: 'هذا فو الطفلِ ← «فو» تدخل في الأسماء الخمسة.',
    counter: 'هذا فمُ الطفلِ: «فم» بالميم لا تُعامل معاملة «فو» في باب الأسماء الخمسة.',
  },
  {
    order: 'الخامس',
    title: '«ذو» تكون بمعنى «صاحب»',
    detail: '«ذو» التي تدخل في الأسماء الخمسة يجب أن تكون بمعنى: صاحب.',
    example: 'رجلٌ ذو مالٍ ← أي: رجلٌ صاحب مال.',
    counter: 'إذا استُعملت كلمة تشبهها في اللفظ ولم تكن بهذا المعنى فلا نطبق عليها القاعدة نفسها.',
  },
]

/** الأمثلة المحلولة التسعة من المصدر، مع الإعراب الكامل المعتمد في المشروع. */
const workedExamples = [
  {
    number: 1,
    title: 'المثال الأول',
    sentence: 'جاءَ أبو الطالبِ.',
    word: 'أبو',
    items: ['اسم من الأسماء الخمسة.', 'فاعل.', 'مرفوع.', 'علامة رفعه الواو نيابة عن الضمة.'],
    parsing: ['أبو: فاعل مرفوع، وعلامة رفعه الواو نيابة عن الضمة؛ لأنه من الأسماء الخمسة، وهو مضاف.'],
  },
  {
    number: 2,
    title: 'المثال الثاني',
    sentence: 'رأيتُ أبا الطالبِ.',
    word: 'أبا',
    items: ['اسم من الأسماء الخمسة.', 'مفعول به.', 'منصوب.', 'علامة نصبه الألف نيابة عن الفتحة.'],
    parsing: ['أبا: مفعول به منصوب، وعلامة نصبه الألف نيابة عن الفتحة؛ لأنه من الأسماء الخمسة، وهو مضاف.'],
  },
  {
    number: 3,
    title: 'المثال الثالث',
    sentence: 'سلّمتُ على أبي الطالبِ.',
    word: 'أبي',
    items: ['اسم من الأسماء الخمسة.', 'اسم مجرور بـ"على".', 'مجرور.', 'علامة جره الياء نيابة عن الكسرة.'],
    parsing: ['أبي: اسم مجرور بـ"على"، وعلامة جره الياء نيابة عن الكسرة؛ لأنه من الأسماء الخمسة، وهو مضاف.'],
  },
  {
    number: 4,
    title: 'المثال الرابع',
    sentence: 'جاءَ أخو محمدٍ.',
    word: 'أخو',
    items: ['اسم من الأسماء الخمسة.', 'فاعل.', 'مرفوع.', 'علامة رفعه الواو.'],
    parsing: ['أخو: فاعل مرفوع، وعلامة رفعه الواو نيابة عن الضمة؛ لأنه من الأسماء الخمسة، وهو مضاف.'],
  },
  {
    number: 5,
    title: 'المثال الخامس',
    sentence: 'ساعدتُ أخا محمدٍ.',
    word: 'أخا',
    items: ['اسم من الأسماء الخمسة.', 'مفعول به.', 'منصوب.', 'علامة نصبه الألف.'],
    parsing: ['أخا: مفعول به منصوب، وعلامة نصبه الألف نيابة عن الفتحة؛ لأنه من الأسماء الخمسة، وهو مضاف.'],
  },
  {
    number: 6,
    title: 'المثال السادس',
    sentence: 'تحدثتُ مع أخي محمدٍ.',
    word: 'أخي',
    items: ['اسم من الأسماء الخمسة.', 'اسم مجرور بـ"مع".', 'علامة جره الياء.'],
    parsing: ['أخي: اسم مجرور بـ"مع"، وعلامة جره الياء نيابة عن الكسرة؛ لأنه من الأسماء الخمسة، وهو مضاف.'],
  },
  {
    number: 7,
    title: 'المثال السابع',
    sentence: 'رجلٌ ذو أدبٍ.',
    word: 'ذو',
    items: ['اسم من الأسماء الخمسة.', 'مرفوع.', 'علامة رفعه الواو.', 'وهو بمعنى "صاحب".'],
    parsing: ['ذو: نعت مرفوع، وعلامة رفعه الواو نيابة عن الضمة؛ لأنه من الأسماء الخمسة، وهو مضاف.'],
  },
  {
    number: 8,
    title: 'المثال الثامن',
    sentence: 'رأيتُ رجلًا ذا أدبٍ.',
    word: 'ذا',
    items: ['اسم من الأسماء الخمسة.', 'منصوب.', 'علامة نصبه الألف.'],
    parsing: ['ذا: نعت منصوب، وعلامة نصبه الألف نيابة عن الفتحة؛ لأنه من الأسماء الخمسة، وهو مضاف.'],
  },
  {
    number: 9,
    title: 'المثال التاسع',
    sentence: 'مررتُ برجلٍ ذي أدبٍ.',
    word: 'ذي',
    items: ['اسم من الأسماء الخمسة.', 'مجرور بالباء.', 'علامة جره الياء.'],
    parsing: ['ذي: نعت مجرور، وعلامة جره الياء نيابة عن الكسرة؛ لأنه من الأسماء الخمسة، وهو مضاف.'],
  },
]

/** أسماء مرشحة في خيارات النشاط التطبيقي: الصواب مع ثلاثة مشتِّتات من صور الأسماء الخمسة. */
const fiveNameForms = ['أبو', 'أبا', 'أبي', 'أخو', 'أخا', 'أخي', 'ذو', 'ذا', 'ذي']

/** يبني خيارات منضبطة لكل صف: الكلمة الصحيحة ثم أقرب ثلاث صور أخرى إليها في الترتيب. */
function nameOptionsFor(correct: string) {
  const start = fiveNameForms.indexOf(correct)
  const distractors: string[] = []
  for (let offset = 1; distractors.length < 3; offset += 1) {
    const candidate = fiveNameForms[(start + offset) % fiveNameForms.length]
    if (candidate !== correct && !distractors.includes(candidate)) distractors.push(candidate)
  }
  return fiveNameForms.filter((form) => form === correct || distractors.includes(form))
}

/** النشاط التطبيقي: تسع جمل، لكل جملة الاسم وحالته وعلامته. */
const applicationItems = [
  { prompt: 'جاءَ أبو أحمدَ.', word: 'أبو', state: 'مرفوع', sign: 'الواو' },
  { prompt: 'رأيتُ أبا أحمدَ.', word: 'أبا', state: 'منصوب', sign: 'الألف' },
  { prompt: 'سلّمتُ على أبي أحمدَ.', word: 'أبي', state: 'مجرور', sign: 'الياء' },
  { prompt: 'حضرَ أخو الطالبِ.', word: 'أخو', state: 'مرفوع', sign: 'الواو' },
  { prompt: 'ساعدتُ أخا الطالبِ.', word: 'أخا', state: 'منصوب', sign: 'الألف' },
  { prompt: 'جلستُ مع أخي الطالبِ.', word: 'أخي', state: 'مجرور', sign: 'الياء' },
  { prompt: 'هذا رجلٌ ذو خلقٍ.', word: 'ذو', state: 'مرفوع', sign: 'الواو' },
  { prompt: 'رأيتُ رجلًا ذا خلقٍ.', word: 'ذا', state: 'منصوب', sign: 'الألف' },
  { prompt: 'مررتُ برجلٍ ذي خلقٍ.', word: 'ذي', state: 'مجرور', sign: 'الياء' },
]

/** الإعراب الكامل لجمل النشاط التطبيقي التسع (مرجع منطقة المعلم). */
const applicationParsing = [
  'أبو: فاعل مرفوع، وعلامة رفعه الواو نيابة عن الضمة؛ لأنه من الأسماء الخمسة، وهو مضاف.',
  'أبا: مفعول به منصوب، وعلامة نصبه الألف نيابة عن الفتحة؛ لأنه من الأسماء الخمسة، وهو مضاف.',
  'أبي: اسم مجرور بـ"على"، وعلامة جره الياء نيابة عن الكسرة؛ لأنه من الأسماء الخمسة، وهو مضاف.',
  'أخو: فاعل مرفوع، وعلامة رفعه الواو نيابة عن الضمة؛ لأنه من الأسماء الخمسة، وهو مضاف.',
  'أخا: مفعول به منصوب، وعلامة نصبه الألف نيابة عن الفتحة؛ لأنه من الأسماء الخمسة، وهو مضاف.',
  'أخي: اسم مجرور بـ"مع"، وعلامة جره الياء نيابة عن الكسرة؛ لأنه من الأسماء الخمسة، وهو مضاف.',
  'ذو: نعت مرفوع، وعلامة رفعه الواو نيابة عن الضمة؛ لأنه من الأسماء الخمسة، وهو مضاف.',
  'ذا: نعت منصوب، وعلامة نصبه الألف نيابة عن الفتحة؛ لأنه من الأسماء الخمسة، وهو مضاف.',
  'ذي: نعت مجرور، وعلامة جره الياء نيابة عن الكسرة؛ لأنه من الأسماء الخمسة، وهو مضاف.',
]

/** الأخطاء الشائعة الستة من المصدر مع التصحيح والسبب. */
const commonErrors = [
  {
    number: 1,
    bad: 'جاءَ أبا محمدٍ.',
    good: 'جاءَ أبو محمدٍ.',
    reason: 'لأن "أبا" منصوبة، بينما الفاعل مرفوع.',
  },
  {
    number: 2,
    bad: 'رأيتُ أبو محمدٍ.',
    good: 'رأيتُ أبا محمدٍ.',
    reason: 'لأن "أبا" مفعول به منصوب، والأسماء الخمسة تُنصب بالألف.',
  },
  {
    number: 3,
    bad: 'مررتُ على أبو محمدٍ.',
    good: 'مررتُ على أبي محمدٍ.',
    reason: 'لأن الاسم بعد حرف الجر مجرور، والأسماء الخمسة تُجر بالياء.',
  },
  {
    number: 4,
    bad: 'جاءَ أخا الطالبِ.',
    good: 'جاءَ أخو الطالبِ.',
    reason: 'لأن الفاعل مرفوع، والأسماء الخمسة تُرفع بالواو.',
  },
  {
    number: 5,
    bad: 'رأيتُ أخو الطالبِ.',
    good: 'رأيتُ أخا الطالبِ.',
    reason: 'لأن المفعول به منصوب، والأسماء الخمسة تُنصب بالألف.',
  },
  {
    number: 6,
    bad: 'هذا فمُ الطفلِ، وفمُ من الأسماء الخمسة.',
    good: 'هذا فو الطفلِ، و"فو" الخالية من الميم هي التي تدخل في الأسماء الخمسة.',
    reason: 'إذا كانت الكلمة "فم" بالميم فلا نعاملها هنا معاملة الأسماء الخمسة.',
  },
]

/* ------------------------------------------------------------------ *
 * أسئلة المصدر: «اختبار نهاية الدرس» — الأسئلة 1–25 مع إجاباتها النموذجية
 * تُعرض على الطالب داخل مادة الدرس للمراجعة، ولا تُستخدم كاختبار المنصة.
 * ------------------------------------------------------------------ */

type SourceQuestionType = 'choice' | 'true-false' | 'parse' | 'transform' | 'open'

interface SourceQuestion {
  number: number
  section: string
  type: SourceQuestionType
  prompt: string
  instruction?: string
  options?: string[]
  parts?: string[]
  answer: string
  parsing?: string[]
  note?: string
}

const sourceSections = {
  one: 'القسم الأول: اختر الإجابة الصحيحة (1–8)',
  two: 'القسم الثاني: صح أم خطأ (9–13)',
  three: 'القسم الثالث: استخرج وأعرب (14–18)',
  four: 'القسم الرابع: تطبيق وتحويل (19–22)',
  five: 'القسم الخامس: سؤال تفكير (23–25)',
}

const sourceQuestions: SourceQuestion[] = [
  {
    number: 1,
    section: sourceSections.one,
    type: 'choice',
    prompt: 'أي كلمة من الآتي من الأسماء الخمسة؟',
    options: ['أ) كتاب', 'ب) أب', 'ج) مدرسة', 'د) قلم'],
    answer: 'ب) أب.',
  },
  {
    number: 2,
    section: sourceSections.one,
    type: 'choice',
    prompt: 'تُرفع الأسماء الخمسة بـ:',
    options: ['أ) الضمة', 'ب) الفتحة', 'ج) الواو', 'د) الألف'],
    answer: 'ج) الواو.',
  },
  {
    number: 3,
    section: sourceSections.one,
    type: 'choice',
    prompt: 'تُنصب الأسماء الخمسة بـ:',
    options: ['أ) الواو', 'ب) الألف', 'ج) الياء', 'د) الكسرة'],
    answer: 'ب) الألف.',
  },
  {
    number: 4,
    section: sourceSections.one,
    type: 'choice',
    prompt: 'تُجر الأسماء الخمسة بـ:',
    options: ['أ) الألف', 'ب) الواو', 'ج) الياء', 'د) الضمة'],
    answer: 'ج) الياء.',
  },
  {
    number: 5,
    section: sourceSections.one,
    type: 'choice',
    prompt: 'الجملة الصحيحة هي:',
    options: ['أ) جاءَ أبا خالدٍ.', 'ب) جاءَ أبو خالدٍ.', 'ج) جاءَ أبي خالدٍ.', 'د) جاءَ أب خالدٍ.'],
    answer: 'ب) جاءَ أبو خالدٍ.',
  },
  {
    number: 6,
    section: sourceSections.one,
    type: 'choice',
    prompt: 'الجملة الصحيحة هي:',
    options: ['أ) رأيتُ أبو خالدٍ.', 'ب) رأيتُ أبي خالدٍ.', 'ج) رأيتُ أبا خالدٍ.', 'د) رأيتُ أب خالدٍ.'],
    answer: 'ج) رأيتُ أبا خالدٍ.',
  },
  {
    number: 7,
    section: sourceSections.one,
    type: 'choice',
    prompt: 'الجملة الصحيحة هي:',
    options: ['أ) مررتُ بأبو خالدٍ.', 'ب) مررتُ بأبا خالدٍ.', 'ج) مررتُ بأبي خالدٍ.', 'د) مررتُ بأب خالدٍ.'],
    answer: 'ج) مررتُ بأبي خالدٍ.',
  },
  {
    number: 8,
    section: sourceSections.one,
    type: 'choice',
    prompt: 'كلمة "ذو" في: رجلٌ ذو علمٍ، تعني:',
    options: ['أ) صاحب', 'ب) الذي', 'ج) هذا', 'د) أخ'],
    answer: 'أ) صاحب.',
  },
  {
    number: 9,
    section: sourceSections.two,
    type: 'true-false',
    prompt: 'الأسماء الخمسة تُرفع بالواو.',
    options: ['صح', 'خطأ'],
    answer: 'صح.',
  },
  {
    number: 10,
    section: sourceSections.two,
    type: 'true-false',
    prompt: 'الأسماء الخمسة تُنصب بالياء.',
    options: ['صح', 'خطأ'],
    answer: 'خطأ؛ الأسماء الخمسة تُنصب بالألف.',
  },
  {
    number: 11,
    section: sourceSections.two,
    type: 'true-false',
    prompt: 'الأسماء الخمسة تُجر بالياء.',
    options: ['صح', 'خطأ'],
    answer: 'صح.',
  },
  {
    number: 12,
    section: sourceSections.two,
    type: 'true-false',
    prompt: 'كلمة "فم" تُعرب دائمًا إعراب الأسماء الخمسة.',
    options: ['صح', 'خطأ'],
    answer: 'خطأ؛ "فم" بالميم لا تُعامل معاملة "فو" في باب الأسماء الخمسة.',
  },
  {
    number: 13,
    section: sourceSections.two,
    type: 'true-false',
    prompt: 'في جملة "جاء أبو محمدٍ" كلمة "أبو" فاعل.',
    options: ['صح', 'خطأ'],
    answer: 'صح.',
  },
  {
    number: 14,
    section: sourceSections.three,
    type: 'parse',
    prompt: 'جاءَ أبو الطالبِ.',
    instruction: 'استخرج الاسم من الأسماء الخمسة، وأعربه.',
    answer: 'أبو: فاعل مرفوع، وعلامة رفعه الواو نيابة عن الضمة؛ لأنه من الأسماء الخمسة، وهو مضاف.',
    parsing: ['أبو: فاعل مرفوع، وعلامة رفعه الواو نيابة عن الضمة؛ لأنه من الأسماء الخمسة، وهو مضاف.'],
  },
  {
    number: 15,
    section: sourceSections.three,
    type: 'parse',
    prompt: 'رأيتُ أخا خالدٍ.',
    instruction: 'استخرج الاسم من الأسماء الخمسة، وأعربه.',
    answer: 'أخا: مفعول به منصوب، وعلامة نصبه الألف نيابة عن الفتحة؛ لأنه من الأسماء الخمسة، وهو مضاف.',
    parsing: ['أخا: مفعول به منصوب، وعلامة نصبه الألف نيابة عن الفتحة؛ لأنه من الأسماء الخمسة، وهو مضاف.'],
  },
  {
    number: 16,
    section: sourceSections.three,
    type: 'parse',
    prompt: 'سلّمتُ على أبي خالدٍ.',
    instruction: 'استخرج الاسم من الأسماء الخمسة، وأعربه.',
    answer: 'أبي: اسم مجرور بـ"على"، وعلامة جره الياء نيابة عن الكسرة؛ لأنه من الأسماء الخمسة، وهو مضاف.',
    parsing: ['أبي: اسم مجرور بـ"على"، وعلامة جره الياء نيابة عن الكسرة؛ لأنه من الأسماء الخمسة، وهو مضاف.'],
  },
  {
    number: 17,
    section: sourceSections.three,
    type: 'parse',
    prompt: 'رجلٌ ذو خلقٍ محبوبٌ.',
    instruction: 'استخرج الاسم من الأسماء الخمسة، وأعربه.',
    answer: 'ذو: نعت مرفوع، وعلامة رفعه الواو نيابة عن الضمة؛ لأنه من الأسماء الخمسة، وهو مضاف.',
    parsing: ['ذو: نعت مرفوع، وعلامة رفعه الواو نيابة عن الضمة؛ لأنه من الأسماء الخمسة، وهو مضاف.'],
    note: 'ملاحظة للمعلم: يمكن قبول "ذو" بوصفها نعتًا إذا كان السياق مقصودًا: رجلٌ ذو خلقٍ. وهي بالفعل نعت لـ"رجل".',
  },
  {
    number: 18,
    section: sourceSections.three,
    type: 'parse',
    prompt: 'مررتُ برجلٍ ذي علمٍ.',
    instruction: 'استخرج الاسم من الأسماء الخمسة، وأعربه.',
    answer: 'ذي: نعت مجرور، وعلامة جره الياء نيابة عن الكسرة؛ لأنه من الأسماء الخمسة، وهو مضاف.',
    parsing: ['ذي: نعت مجرور، وعلامة جره الياء نيابة عن الكسرة؛ لأنه من الأسماء الخمسة، وهو مضاف.'],
  },
  {
    number: 19,
    section: sourceSections.four,
    type: 'transform',
    prompt: 'حوّل كلمة "أب" حسب المطلوب:',
    parts: ['مرفوع: ______', 'منصوب: ______', 'مجرور: ______'],
    answer: 'مرفوع: أبو، منصوب: أبا، مجرور: أبي.',
  },
  {
    number: 20,
    section: sourceSections.four,
    type: 'transform',
    prompt: 'أكمل: جاءَ ____ الطالبِ.',
    instruction: 'اختر: أبو – أبا – أبي',
    answer: 'أبو: جاءَ أبو الطالبِ.',
  },
  {
    number: 21,
    section: sourceSections.four,
    type: 'transform',
    prompt: 'أكمل: رأيتُ ____ الطالبِ.',
    instruction: 'اختر: أبو – أبا – أبي',
    answer: 'أبا: رأيتُ أبا الطالبِ.',
  },
  {
    number: 22,
    section: sourceSections.four,
    type: 'transform',
    prompt: 'أكمل: مررتُ بـ____ الطالبِ.',
    instruction: 'اختر: أبو – أبا – أبي',
    answer: 'أبي: مررتُ بأبي الطالبِ.',
  },
  {
    number: 23,
    section: sourceSections.five,
    type: 'open',
    prompt: 'لماذا لا يصح أن نقول: رأيتُ أبو محمدٍ، بينما يصح أن نقول: جاءَ أبو محمدٍ؟ اشرح السبب.',
    answer:
      'لأن "أبو محمدٍ" في الجملة الأولى فاعل، والفاعل مرفوع، لذلك نقول: جاءَ أبو محمدٍ. أما في "رأيتُ أبا محمدٍ" فـ"أبا" مفعول به، والمفعول به منصوب.',
  },
  {
    number: 24,
    section: sourceSections.five,
    type: 'open',
    prompt: 'ما الفرق في الإعراب بين: جاءَ أبو الطالبِ. و: جاءَ أبوانِ.',
    answer:
      '"أبو": اسم من الأسماء الخمسة، مرفوع بالواو. أما "أبوان": مثنى، مرفوع بالألف. وهنا يظهر الفرق بين الأسماء الخمسة والمثنى.',
  },
  {
    number: 25,
    section: sourceSections.five,
    type: 'open',
    prompt: 'صحح الجملة الآتية: سلّمتُ على أخو الطالبِ. ثم اشرح لماذا صححتها بهذه الطريقة.',
    answer:
      'الجملة الصحيحة: سلّمتُ على أخي الطالبِ. لأن "أخي" اسم مجرور بحرف الجر "على"، والأسماء الخمسة تُجر بالياء.',
  },
]

/* ================================================================== *
 * مكوّنات عرض مشتركة داخل الدرس
 * ================================================================== */

/** «شرح المنصة»: تمييز أي إضافة توضيحية من إعداد المنصة، لا من نص المصدر. */
function PlatformNote({ children }: { children: ReactNode }) {
  return (
    <aside className="lesson-eight-platform-note">
      <span className="lesson-eight-platform-note__badge">شرح المنصة</span>
      <div className="lesson-eight-platform-note__body">{children}</div>
    </aside>
  )
}

function Rule({ children }: { children: ReactNode }) {
  return (
    <div className="lesson-eight-rule">
      <strong>قاعدة</strong>
      <p>{children}</p>
    </div>
  )
}

function GoldenRule({ text }: { text: string }) {
  return (
    <div className="lesson-eight-golden">
      <span aria-hidden="true">🏅</span>
      <p>
        <bdi>{text}</bdi>
      </p>
    </div>
  )
}

function FullParsing({ lines }: { lines: string[] }) {
  return (
    <div className="lesson-eight-parsing" aria-label="إعراب كامل">
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  )
}

function ChipRow({ items }: { items: string[] }) {
  return (
    <div className="lesson-eight-chip-row">
      {items.map((item) => (
        <bdi key={item}>{item}</bdi>
      ))}
    </div>
  )
}

/** جدول الاسم وصوره الثلاث: الرفع بالواو، والنصب بالألف، والجر بالياء. */
function FiveNamesTable({ withMeaning = false }: { withMeaning?: boolean }) {
  return (
    <div className="table-scroll">
      <table className="lesson-eight-table lesson-eight-table--flagship">
        <caption>جدول الأسماء الخمسة: احفظ هذا الجدول جيدًا.</caption>
        <thead>
          <tr>
            <th scope="col">الاسم</th>
            <th scope="col">الرفع</th>
            <th scope="col">النصب</th>
            <th scope="col">الجر</th>
            {withMeaning && <th scope="col">معناه</th>}
          </tr>
        </thead>
        <tbody>
          {fiveNames.map((item) => (
            <tr key={item.name}>
              <th scope="row">{item.name}</th>
              <td><bdi>{item.raf}</bdi></td>
              <td><bdi>{item.nasb}</bdi></td>
              <td><bdi>{item.jarr}</bdi></td>
              {withMeaning && <td>{item.meaning}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** جدول الحالة والعلامة: الرفع ← الواو، النصب ← الألف، الجر ← الياء. */
function CaseSignTable() {
  return (
    <div className="table-scroll">
      <table className="lesson-eight-table">
        <caption>علامات إعراب الأسماء الخمسة.</caption>
        <thead>
          <tr>
            <th scope="col">الحالة الإعرابية</th>
            <th scope="col">العلامة</th>
          </tr>
        </thead>
        <tbody>
          {caseSigns.map((item) => (
            <tr key={item.state}>
              <th scope="row">{item.state}</th>
              <td><bdi>{item.sign}</bdi></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * محرّك التفاعلات التعليمية: صفوف فيها حقول اختيار، والتصحيح بعد التحقق فقط
 * ------------------------------------------------------------------ */

interface ActivityField {
  label: string
  options: string[]
  answer: string
}

interface ActivityRow {
  prompt: string
  hint?: string
  fields: ActivityField[]
  explain?: string
}

function ChoiceActivity({
  id,
  title,
  instruction,
  rows,
}: {
  id: string
  title: string
  instruction: string
  rows: ActivityRow[]
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState(false)

  function fieldKey(rowIndex: number, fieldIndex: number) {
    return `${rowIndex}-${fieldIndex}`
  }

  function isFieldCorrect(rowIndex: number, fieldIndex: number) {
    const row = rows[rowIndex]
    const field = row.fields[fieldIndex]
    return normalize(answers[fieldKey(rowIndex, fieldIndex)]) === normalize(field.answer)
  }

  function isRowCorrect(rowIndex: number) {
    return rows[rowIndex].fields.every((_, fieldIndex) => isFieldCorrect(rowIndex, fieldIndex))
  }

  function isRowAnswered(rowIndex: number) {
    return rows[rowIndex].fields.every((_, fieldIndex) => Boolean(answers[fieldKey(rowIndex, fieldIndex)]))
  }

  const answeredCount = rows.filter((_, index) => isRowAnswered(index)).length
  const score = rows.filter((_, index) => isRowCorrect(index)).length

  return (
    <section className="lesson-eight-activity" data-testid={id}>
      <div className="lesson-eight-activity-heading">
        <span className="activity-number" aria-hidden="true">{rows.length}</span>
        <div>
          <h3>{title}</h3>
          <p>{instruction}</p>
        </div>
      </div>

      <div className="lesson-eight-activity-items">
        {rows.map((row, rowIndex) => (
          <div className="lesson-eight-activity-row" key={row.prompt}>
            <p className="lesson-eight-activity-prompt">
              <bdi>{row.prompt}</bdi>
            </p>
            {row.hint && <p className="lesson-eight-activity-hint">{row.hint}</p>}
            <div className={`lesson-eight-field-grid lesson-eight-field-grid--${Math.min(row.fields.length, 3)}`}>
              {row.fields.map((field, fieldIndex) => (
                <label className="lesson-eight-field" key={field.label}>
                  <span>{field.label}</span>
                  <select
                    value={answers[fieldKey(rowIndex, fieldIndex)] ?? ''}
                    disabled={checked}
                    onChange={(event) =>
                      setAnswers((current) => ({ ...current, [fieldKey(rowIndex, fieldIndex)]: event.target.value }))
                    }
                  >
                    <option value="">اختر…</option>
                    {field.options.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
            {checked && (
              <div className={`lesson-eight-feedback ${isRowCorrect(rowIndex) ? 'is-good' : 'is-bad'}`}>
                <strong>{isRowCorrect(rowIndex) ? 'إجابة صحيحة' : 'إجابة غير صحيحة'}</strong>
                {!isRowCorrect(rowIndex) && (
                  <p>
                    الإجابة الصحيحة:{' '}
                    {row.fields
                      .map((field, fieldIndex) => `${field.label} ${isFieldCorrect(rowIndex, fieldIndex) ? '✓' : field.answer}`)
                      .join(' — ')}
                  </p>
                )}
                {row.explain && <p>{row.explain}</p>}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="lesson-eight-activity-actions">
        {!checked ? (
          <>
            <button type="button" className="button button--primary" onClick={() => setChecked(true)}>
              تحقق من الإجابة
            </button>
            <p>أجبت عن {answeredCount} من {rows.length}.</p>
          </>
        ) : (
          <>
            <p className="lesson-eight-score" role="status">النتيجة: <bdi>{score} / {rows.length}</bdi></p>
            <button
              type="button"
              className="button button--secondary"
              onClick={() => {
                setChecked(false)
                setAnswers({})
              }}
            >
              أعد المحاولة
            </button>
          </>
        )}
      </div>
    </section>
  )
}

/** التفاعل الأول: فرز صور الاسم على الحالات الإعرابية الثلاث. */
function CaseSortActivity() {
  return (
    <ChoiceActivity
      id="lesson8-interaction-1"
      title="تفاعل ١: اربط كل صورة بحالتها الإعرابية"
      instruction="اختر الحالة الإعرابية لكل صورة من صور الاسم، ثم اختبر نفسك."
      rows={[
        {
          prompt: 'أبو',
          fields: [{ label: 'الحالة الإعرابية', options: ['رفع', 'نصب', 'جر'], answer: 'رفع' }],
          explain: 'أبو: مرفوع، وعلامة رفعه الواو نيابة عن الضمة؛ لأنه من الأسماء الخمسة.',
        },
        {
          prompt: 'أبا',
          fields: [{ label: 'الحالة الإعرابية', options: ['رفع', 'نصب', 'جر'], answer: 'نصب' }],
          explain: 'أبا: منصوب، وعلامة نصبه الألف نيابة عن الفتحة؛ لأنه من الأسماء الخمسة.',
        },
        {
          prompt: 'أبي',
          fields: [{ label: 'الحالة الإعرابية', options: ['رفع', 'نصب', 'جر'], answer: 'جر' }],
          explain: 'أبي: مجرور، وعلامة جره الياء نيابة عن الكسرة؛ لأنه من الأسماء الخمسة.',
        },
      ]}
    />
  )
}

/** التفاعل الثاني: لماذا تغيّرت الكلمة؟ الموقع الإعرابي والحالة والعلامة. */
function WhyChangedActivity() {
  const roles = ['فاعل', 'مفعول به', 'اسم مجرور']
  const states = ['مرفوع', 'منصوب', 'مجرور']
  const signs = ['الواو نيابة عن الضمة', 'الألف نيابة عن الفتحة', 'الياء نيابة عن الكسرة']
  return (
    <ChoiceActivity
      id="lesson8-interaction-2"
      title="تفاعل ٢: لماذا تغيّرت الكلمة؟"
      instruction="حدد الموقع الإعرابي والحالة وعلامة الإعراب في كل جملة."
      rows={[
        {
          prompt: 'جاءَ أبو محمدٍ.',
          fields: [
            { label: 'الموقع الإعرابي', options: roles, answer: 'فاعل' },
            { label: 'الحالة', options: states, answer: 'مرفوع' },
            { label: 'علامة الإعراب', options: signs, answer: 'الواو نيابة عن الضمة' },
          ],
          explain: 'أبو: فاعل مرفوع، وعلامة رفعه الواو نيابة عن الضمة؛ لأنه من الأسماء الخمسة، وهو مضاف.',
        },
        {
          prompt: 'رأيتُ أبا محمدٍ.',
          fields: [
            { label: 'الموقع الإعرابي', options: roles, answer: 'مفعول به' },
            { label: 'الحالة', options: states, answer: 'منصوب' },
            { label: 'علامة الإعراب', options: signs, answer: 'الألف نيابة عن الفتحة' },
          ],
          explain: 'أبا: مفعول به منصوب، وعلامة نصبه الألف نيابة عن الفتحة؛ لأنه من الأسماء الخمسة، وهو مضاف.',
        },
        {
          prompt: 'سلّمتُ على أبي محمدٍ.',
          fields: [
            { label: 'الموقع الإعرابي', options: roles, answer: 'اسم مجرور' },
            { label: 'الحالة', options: states, answer: 'مجرور' },
            { label: 'علامة الإعراب', options: signs, answer: 'الياء نيابة عن الكسرة' },
          ],
          explain: 'أبي: اسم مجرور بـ"على"، وعلامة جره الياء نيابة عن الكسرة؛ لأنه من الأسماء الخمسة، وهو مضاف.',
        },
      ]}
    />
  )
}

/** التفاعل الثالث: اختر العلامة الصحيحة. */
function SignChoiceActivity() {
  return (
    <ChoiceActivity
      id="lesson8-interaction-3"
      title="تفاعل ٣: اختر العلامة"
      instruction="اختر العلامة الصحيحة في كل حالة من حالات الإعراب."
      rows={[
        {
          prompt: 'الأسماء الخمسة تُرفع بـ…',
          fields: [{ label: 'العلامة', options: ['الضمة', 'الواو', 'الألف', 'الياء'], answer: 'الواو' }],
          explain: 'تُرفع بالواو نيابة عن الضمة؛ لأنها من الأسماء الخمسة.',
        },
        {
          prompt: 'الأسماء الخمسة تُنصب بـ…',
          fields: [{ label: 'العلامة', options: ['الفتحة', 'الواو', 'الألف', 'الياء'], answer: 'الألف' }],
          explain: 'تُنصب بالألف نيابة عن الفتحة؛ لأنها من الأسماء الخمسة.',
        },
        {
          prompt: 'الأسماء الخمسة تُجر بـ…',
          fields: [{ label: 'العلامة', options: ['الكسرة', 'الواو', 'الألف', 'الياء'], answer: 'الياء' }],
          explain: 'تُجر بالياء نيابة عن الكسرة؛ لأنها من الأسماء الخمسة.',
        },
      ]}
    />
  )
}

/** التفاعل الرابع: فو أم فم؟ */
function FuOrFamActivity() {
  return (
    <ChoiceActivity
      id="lesson8-interaction-4"
      title="تفاعل ٤: فو أم فم؟"
      instruction="أجب ثم اقرأ سبب الإجابة بعد التحقق."
      rows={[
        {
          prompt: 'أيهما يدخل في الأسماء الخمسة: «فو» أم «فم»؟',
          fields: [
            { label: 'الكلمة التي تدخل', options: ['فو', 'فم', 'كلتاهما', 'لا واحدة منهما'], answer: 'فو' },
            {
              label: 'السبب',
              options: [
                'لأن «فو» خالية من الميم، و«فم» بالميم لا تُعامل معاملة الأسماء الخمسة',
                'لأن «فم» أثقل في النطق',
                'لأن «فو» مثنى و«فم» مفرد',
              ],
              answer: 'لأن «فو» خالية من الميم، و«فم» بالميم لا تُعامل معاملة الأسماء الخمسة',
            },
          ],
          explain: '«فو» ✅ تدخل في الأسماء الخمسة، و«فم» ❌ في باب الأسماء الخمسة؛ لأن الشرط هو حذف الميم.',
        },
        {
          prompt: 'هذا فمُ الطفلِ. هل تُعرب «فم» إعراب الأسماء الخمسة؟',
          fields: [
            { label: 'الحكم', options: ['نعم', 'لا'], answer: 'لا' },
            { label: 'السبب', options: ['لأنها بالميم', 'لأنها مضافة', 'لأنها مفردة'], answer: 'لأنها بالميم' },
          ],
          explain: 'لا؛ لأن «فم» بالميم، والشرط في «فو» أن تكون خالية من الميم.',
        },
      ]}
    />
  )
}

/** التفاعل الخامس: ذو / ذا / ذي في جمل ناقصة. */
function DhuFillActivity() {
  return (
    <ChoiceActivity
      id="lesson8-interaction-5"
      title="تفاعل ٥: ذو / ذا / ذي"
      instruction="أكمل كل جملة بالصورة المناسبة من صور «ذو»."
      rows={[
        {
          prompt: 'جاءَ رجلٌ ___ علمٍ.',
          fields: [{ label: 'الكلمة', options: ['ذو', 'ذا', 'ذي'], answer: 'ذو' }],
          explain: 'ذو: نعت مرفوع، وعلامة رفعه الواو نيابة عن الضمة؛ لأنه من الأسماء الخمسة.',
        },
        {
          prompt: 'رأيتُ رجلًا ___ علمٍ.',
          fields: [{ label: 'الكلمة', options: ['ذو', 'ذا', 'ذي'], answer: 'ذا' }],
          explain: 'ذا: نعت منصوب، وعلامة نصبه الألف نيابة عن الفتحة؛ لأنه من الأسماء الخمسة.',
        },
        {
          prompt: 'مررتُ برجلٍ ___ علمٍ.',
          fields: [{ label: 'الكلمة', options: ['ذو', 'ذا', 'ذي'], answer: 'ذي' }],
          explain: 'ذي: نعت مجرور، وعلامة جره الياء نيابة عن الكسرة؛ لأنه من الأسماء الخمسة.',
        },
      ]}
    />
  )
}

/** التفاعل السادس: الأسماء الخمسة أم المثنى؟ */
function FiveOrDualActivity() {
  return (
    <ChoiceActivity
      id="lesson8-interaction-6"
      title="تفاعل ٦: الأسماء الخمسة أم المثنى؟"
      instruction="حدد نوع الكلمة وعلامة إعرابها."
      rows={[
        {
          prompt: 'أبو',
          fields: [
            { label: 'النوع', options: ['اسم من الأسماء الخمسة', 'مثنى', 'جمع'], answer: 'اسم من الأسماء الخمسة' },
            { label: 'الحالة', options: ['مرفوع', 'منصوب', 'مجرور'], answer: 'مرفوع' },
            {
              label: 'علامة الإعراب',
              options: ['الواو نيابة عن الضمة', 'الألف', 'الياء'],
              answer: 'الواو نيابة عن الضمة',
            },
          ],
          explain: 'أبو: اسم من الأسماء الخمسة، مرفوع، وعلامة رفعه الواو نيابة عن الضمة.',
        },
        {
          prompt: 'أبوان',
          fields: [
            { label: 'النوع', options: ['اسم من الأسماء الخمسة', 'مثنى', 'جمع'], answer: 'مثنى' },
            { label: 'الحالة', options: ['مرفوع', 'منصوب', 'مجرور'], answer: 'مرفوع' },
            { label: 'علامة الإعراب', options: ['الواو نيابة عن الضمة', 'الألف', 'الياء'], answer: 'الألف' },
          ],
          explain: 'أبوان: مثنى، مرفوع، وعلامة رفعه الألف؛ لأنه مثنى، وليس من باب الأسماء الخمسة في هذه الصورة.',
        },
      ]}
    />
  )
}

/** التفاعل السابع: اكتشف الخطأ وصحّحه. */
function FindErrorActivity() {
  return (
    <ChoiceActivity
      id="lesson8-interaction-7"
      title="تفاعل ٧: اكتشف الخطأ"
      instruction="حدد الجملة الصحيحة ثم سبب التصحيح."
      rows={[
        {
          prompt: 'جاءَ أبا محمدٍ.',
          fields: [
            {
              label: 'الصواب',
              options: ['جاءَ أبو محمدٍ.', 'جاءَ أبي محمدٍ.', 'الجملة صحيحة كما هي'],
              answer: 'جاءَ أبو محمدٍ.',
            },
            {
              label: 'السبب',
              options: [
                'لأن «أبو» فاعل مرفوع، والأسماء الخمسة تُرفع بالواو',
                'لأن «أبا» مفعول به منصوب',
                'لأن الواو علامة الجر',
              ],
              answer: 'لأن «أبو» فاعل مرفوع، والأسماء الخمسة تُرفع بالواو',
            },
          ],
          explain: 'لأن "أبا" منصوبة، بينما الفاعل مرفوع، والصواب: جاءَ أبو محمدٍ.',
        },
      ]}
    />
  )
}

/* ------------------------------------------------------------------ *
 * مراجعة أسئلة المصدر (1–25): تُعرض للمراجعة، والحل النموذجي بكشف اختياري
 * ------------------------------------------------------------------ */

function SourceReview({ from, to }: { from: number; to: number }) {
  const questions = sourceQuestions.filter((question) => question.number >= from && question.number <= to)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [revealed, setRevealed] = useState<Record<number, boolean>>({})
  const allRevealed = questions.every((question) => revealed[question.number])

  function toggle(number: number) {
    setRevealed((current) => ({ ...current, [number]: !current[number] }))
  }

  return (
    <section className="lesson-eight-source-review" data-testid={`lesson8-source-review-${from}`}>
      <div className="lesson-eight-source-review__heading">
        <div>
          <p className="card__eyebrow">من المادة المصدرية</p>
          <h3>أسئلة نهاية الدرس في المصدر: {from}–{to}</h3>
        </div>
        <button
          type="button"
          className="button button--ghost"
          onClick={() =>
            setRevealed(
              allRevealed
                ? {}
                : Object.fromEntries(questions.map((question) => [question.number, true])),
            )
          }
        >
          {allRevealed ? 'إخفاء الإجابات' : 'أظهر الإجابات النموذجية'}
        </button>
      </div>
      {questions.flatMap((question, index, list) => {
        const showHeading = index === 0 || list[index - 1].section !== question.section
        const rows: ReactNode[] = []
        if (showHeading) rows.push(<h3 key={`section-${question.section}`}>{question.section}</h3>)
        rows.push(
          <fieldset className="official-question lesson-eight-source-question" key={question.number} data-testid={`lesson8-source-q${question.number}`}>
            <legend>
              <span className="question-number">السؤال {question.number}</span> <bdi>{question.prompt}</bdi>
            </legend>
            {question.instruction && <p className="lesson-eight-source-instruction">{question.instruction}</p>}

            {(question.type === 'choice' || question.type === 'true-false') && question.options ? (
              <div className="official-options">
                {question.options.map((option) => (
                  <label key={option}>
                    <input
                      type="radio"
                      name={`lesson8-source-q${question.number}`}
                      value={option}
                      checked={answers[`${question.number}`] === option}
                      onChange={() => setAnswers((current) => ({ ...current, [`${question.number}`]: option }))}
                    />
                    <span><bdi>{option}</bdi></span>
                  </label>
                ))}
              </div>
            ) : question.parts ? (
              <div className="lesson-eight-parts">
                {question.parts.map((part) => (
                  <label key={part}>
                    <span><bdi>{part}</bdi></span>
                    <input
                      value={answers[`${question.number}-${part}`] ?? ''}
                      onChange={(event) =>
                        setAnswers((current) => ({ ...current, [`${question.number}-${part}`]: event.target.value }))
                      }
                      placeholder="اكتب إجابتك"
                    />
                  </label>
                ))}
              </div>
            ) : (
              <textarea
                rows={3}
                value={answers[`${question.number}`] ?? ''}
                onChange={(event) => setAnswers((current) => ({ ...current, [`${question.number}`]: event.target.value }))}
                aria-label={`إجابة السؤال ${question.number}`}
                placeholder={question.type === 'parse' ? 'اكتب الإعراب كاملًا' : 'اكتب إجابتك'}
              />
            )}

            <button type="button" className="button button--ghost lesson-eight-reveal" onClick={() => toggle(question.number)}>
              {revealed[question.number] ? 'إخفاء الإجابة النموذجية' : 'أظهر الإجابة النموذجية'}
            </button>

            {revealed[question.number] && (
              <div className="lesson-eight-feedback is-good">
                <strong>الإجابة النموذجية</strong>
                <p><bdi>{question.answer}</bdi></p>
                {question.parsing?.map((line) => <FullParsing key={line} lines={[line]} />)}
                {question.note && <p className="lesson-eight-teacher-note">{question.note}</p>}
              </div>
            )}
          </fieldset>,
        )
        return rows
      })}
    </section>
  )
}

/* ================================================================== *
 * اختبار المنصة الإلكتروني: ٢٠ سؤالًا جديدًا (٦ أساسي، ٧ متوسط، ٤ متقدم، ٣ تفكير)
 * أسئلة جديدة بالكامل، لا تعيد أسئلة المصدر نفسها ولا تعيد صياغتها سطحيًا.
 * ================================================================== */

type QuizLevel = 'أساسي' | 'متوسط' | 'متقدم' | 'تفكير'

type QuizField =
  | { kind: 'select'; label: string; options: string[]; answer: string }
  | { kind: 'multi'; label: string; options: string[]; answers: string[] }
  | { kind: 'text'; label: string; accept: string[]; placeholder: string }

interface QuizQuestion {
  id: string
  number: number
  level: QuizLevel
  type: string
  prompt: string
  sentence?: string
  fields: QuizField[]
  solution: string
  explanation: string
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    number: 1,
    level: 'أساسي',
    type: 'اختيار من متعدد',
    prompt: 'أيُّ الكلمات الآتية ليست من الأسماء الخمسة؟',
    fields: [{ kind: 'select', label: 'الكلمة', options: ['أخ', 'حم', 'ذو', 'جد'], answer: 'جد' }],
    solution: '«جد» ليست من الأسماء الخمسة.',
    explanation:
      'الأسماء الخمسة هي: أب، أخ، حم، فو، ذو. وكلمة «جد» اسم قرابة، لكنها ليست من الأسماء الخمسة فلا تُعرب إعرابها.',
  },
  {
    id: 'q2',
    number: 2,
    level: 'أساسي',
    type: 'صح أم خطأ',
    prompt:
      'تُعرب الأسماء الخمسة بالحروف بدل الحركات إذا كانت مفردة مضافة، ولم تكن مضافة إلى ياء المتكلم.',
    fields: [{ kind: 'select', label: 'الحكم', options: ['صح', 'خطأ'], answer: 'صح' }],
    solution: 'صح.',
    explanation:
      'هذان شرطان أساسيان، ويُضاف إليهما الشرطان الخاصان: حذف الميم في «فو»، وأن تكون «ذو» بمعنى «صاحب».',
  },
  {
    id: 'q3',
    number: 3,
    level: 'أساسي',
    type: 'مطابقة',
    prompt: 'طابق كل صورة من صور «أب» بحالتها الإعرابية.',
    fields: [
      { kind: 'select', label: 'أبو', options: ['الرفع', 'النصب', 'الجر'], answer: 'الرفع' },
      { kind: 'select', label: 'أبا', options: ['الرفع', 'النصب', 'الجر'], answer: 'النصب' },
      { kind: 'select', label: 'أبي', options: ['الرفع', 'النصب', 'الجر'], answer: 'الجر' },
    ],
    solution: 'أبو → الرفع، وأبا → النصب، وأبي → الجر.',
    explanation:
      'أبو: مرفوع بالواو نيابة عن الضمة، وأبا: منصوب بالألف نيابة عن الفتحة، وأبي: مجرور بالياء نيابة عن الكسرة.',
  },
  {
    id: 'q4',
    number: 4,
    level: 'أساسي',
    type: 'تحديد الحالة الإعرابية',
    prompt: 'ما الحالة الإعرابية لكلمة «أبي» في هذه الجملة؟',
    sentence: 'جلستُ مع أبي أحمدَ.',
    fields: [{ kind: 'select', label: 'الحالة الإعرابية', options: ['مجرور', 'مرفوع', 'منصوب'], answer: 'مجرور' }],
    solution: 'أبي: مجرور.',
    explanation:
      'أبي: اسم مجرور بـ«مع»، وعلامة جره الياء نيابة عن الكسرة؛ لأنه من الأسماء الخمسة، وهو مضاف.',
  },
  {
    id: 'q5',
    number: 5,
    level: 'أساسي',
    type: 'اختيار من متعدد',
    prompt: 'حتى تُعرب «فو» إعراب الأسماء الخمسة يجب أن…',
    fields: [
      {
        kind: 'select',
        label: 'الشرط',
        options: ['تكون خالية من الميم', 'تكون مضافة إلى ياء المتكلم', 'تكون مثناة', 'تكون معرفة بـ«ال»'],
        answer: 'تكون خالية من الميم',
      },
    ],
    solution: 'يجب أن تكون خالية من الميم.',
    explanation: '«فو» تدخل في الأسماء الخمسة، أما «فم» بالميم فلا تُعامل معاملة «فو» في هذا الباب.',
  },
  {
    id: 'q6',
    number: 6,
    level: 'أساسي',
    type: 'اختيار من متعدد',
    prompt: 'ما معنى «حم» في جدول الأسماء الخمسة؟',
    fields: [
      {
        kind: 'select',
        label: 'المعنى',
        options: ['قريب الزوج أو الزوجة من أهلها، ويُستعمل في ألفاظ القرابة', 'الوالد', 'الأخ', 'الفم'],
        answer: 'قريب الزوج أو الزوجة من أهلها، ويُستعمل في ألفاظ القرابة',
      },
    ],
    solution: '«حم»: قريب الزوج أو الزوجة من أهلها، ويُستعمل في ألفاظ القرابة.',
    explanation: 'وقد ورد في جدول المصدر: أب ← الوالد، أخ ← الأخ، حم ← قريب الزوج أو الزوجة من أهلها، فو ← الفم، ذو ← صاحب.',
  },
  {
    id: 'q7',
    number: 7,
    level: 'متوسط',
    type: 'تحديد علامة الإعراب',
    prompt: 'ما علامة رفع «أخو» في هذه الجملة؟',
    sentence: 'حضرَ أخو الطالبِ.',
    fields: [
      {
        kind: 'select',
        label: 'العلامة',
        options: ['الواو نيابة عن الضمة', 'الضمة الظاهرة على آخره', 'الألف', 'الياء'],
        answer: 'الواو نيابة عن الضمة',
      },
    ],
    solution: 'أخو: فاعل مرفوع، وعلامة رفعه الواو نيابة عن الضمة؛ لأنه من الأسماء الخمسة، وهو مضاف.',
    explanation: 'لأن «أخو» مفردة مضافة ولم تُضف إلى ياء المتكلم، فتُرفع بالواو نيابة عن الضمة.',
  },
  {
    id: 'q8',
    number: 8,
    level: 'متوسط',
    type: 'إكمال',
    prompt: 'أكمل: الأسماء الخمسة تُجر بالـ ____ نيابةً عن الكسرة.',
    fields: [{ kind: 'text', label: 'العلامة', accept: ['الياء', 'ياء'], placeholder: 'اكتب العلامة' }],
    solution: 'تُجر بالياء نيابةً عن الكسرة.',
    explanation: 'علامات الأسماء الخمسة: الواو في الرفع، والألف في النصب، والياء في الجر.',
  },
  {
    id: 'q9',
    number: 9,
    level: 'متوسط',
    type: 'صح أم خطأ',
    prompt: '«أبوان» من الأسماء الخمسة، فتُرفع بالواو.',
    fields: [{ kind: 'select', label: 'الحكم', options: ['صح', 'خطأ'], answer: 'خطأ' }],
    solution: 'خطأ.',
    explanation:
      '«أبوان» مثنى، وعلامة رفعه الألف؛ لأن شرط الأسماء الخمسة أن تكون مفردة، فهي هنا ليست من باب الأسماء الخمسة.',
  },
  {
    id: 'q10',
    number: 10,
    level: 'متوسط',
    type: 'ترتيب',
    prompt: 'رتّب صور «ذو» حسب الحالات: الرفع، ثم النصب، ثم الجر.',
    fields: [
      { kind: 'select', label: 'في الرفع', options: ['ذو', 'ذا', 'ذي'], answer: 'ذو' },
      { kind: 'select', label: 'في النصب', options: ['ذو', 'ذا', 'ذي'], answer: 'ذا' },
      { kind: 'select', label: 'في الجر', options: ['ذو', 'ذا', 'ذي'], answer: 'ذي' },
    ],
    solution: 'ذو → ذا → ذي.',
    explanation: 'ذو: مرفوعة بالواو، وذا: منصوبة بالألف، وذي: مجرورة بالياء، و«ذو» بمعنى «صاحب».',
  },
  {
    id: 'q11',
    number: 11,
    level: 'متوسط',
    type: 'اختيار متعدد',
    prompt: 'اختر كل ما يُشترط لإعراب الأسماء الخمسة بالحروف.',
    fields: [
      {
        kind: 'multi',
        label: 'الشروط',
        options: ['أن تكون مفردة', 'أن تكون مضافة', 'ألا تكون مضافة إلى ياء المتكلم', 'أن تكون جمعًا', 'أن تكون نكرة'],
        answers: ['أن تكون مفردة', 'أن تكون مضافة', 'ألا تكون مضافة إلى ياء المتكلم'],
      },
    ],
    solution: 'أن تكون مفردة، وأن تكون مضافة، وألا تكون مضافة إلى ياء المتكلم.',
    explanation:
      'هذه شروط إعرابها بالحروف، ويُضاف إليها شرطان خاصان: حذف الميم في «فو»، وأن تكون «ذو» بمعنى «صاحب».',
  },
  {
    id: 'q12',
    number: 12,
    level: 'متوسط',
    type: 'اختيار من متعدد',
    prompt: 'ما إعراب «ذو» في هذه الجملة؟',
    sentence: 'هذا رجلٌ ذو أدبٍ.',
    fields: [
      {
        kind: 'select',
        label: 'الإعراب',
        options: [
          'نعت مرفوع، وعلامة رفعه الواو نيابة عن الضمة',
          'فاعل مرفوع، وعلامة رفعه الواو',
          'مبتدأ مرفوع، وعلامة رفعه الضمة',
          'نعت منصوب، وعلامة نصبه الألف',
        ],
        answer: 'نعت مرفوع، وعلامة رفعه الواو نيابة عن الضمة',
      },
    ],
    solution: 'ذو: نعت مرفوع، وعلامة رفعه الواو نيابة عن الضمة؛ لأنه من الأسماء الخمسة، وهو مضاف.',
    explanation: '«ذو» صفة لـ«رجلٌ» وهو مرفوع، فتكون نعتًا مرفوعًا، وعلامة رفعه الواو نيابة عن الضمة.',
  },
  {
    id: 'q13',
    number: 13,
    level: 'متوسط',
    type: 'مطابقة',
    prompt: 'طابق كل اسم من الأسماء الخمسة بمعناه.',
    fields: [
      { kind: 'select', label: 'أب', options: ['الوالد', 'الأخ', 'الفم', 'صاحب'], answer: 'الوالد' },
      { kind: 'select', label: 'أخ', options: ['الوالد', 'الأخ', 'الفم', 'صاحب'], answer: 'الأخ' },
      { kind: 'select', label: 'فو', options: ['الوالد', 'الأخ', 'الفم', 'صاحب'], answer: 'الفم' },
      { kind: 'select', label: 'ذو', options: ['الوالد', 'الأخ', 'الفم', 'صاحب'], answer: 'صاحب' },
    ],
    solution: 'أب ← الوالد، أخ ← الأخ، فو ← الفم، ذو ← صاحب.',
    explanation: 'هذه معاني الأسماء الخمسة كما وردت في جدول الدرس: فو بمعنى الفم، وذو بمعنى صاحب.',
  },
  {
    id: 'q14',
    number: 14,
    level: 'متقدم',
    type: 'إعراب',
    prompt: 'في جملة: ساعدتُ أخا محمدٍ. حدد الوظيفة والحالة وعلامة الإعراب لكلمة «أخا».',
    sentence: 'ساعدتُ أخا محمدٍ.',
    fields: [
      { kind: 'select', label: 'الوظيفة', options: ['مفعول به', 'فاعل', 'اسم مجرور', 'نعت'], answer: 'مفعول به' },
      { kind: 'select', label: 'الحالة', options: ['منصوب', 'مرفوع', 'مجرور'], answer: 'منصوب' },
      {
        kind: 'select',
        label: 'العلامة',
        options: ['الألف نيابة عن الفتحة', 'الواو نيابة عن الضمة', 'الياء نيابة عن الكسرة', 'الفتحة الظاهرة على آخره'],
        answer: 'الألف نيابة عن الفتحة',
      },
    ],
    solution: 'أخا: مفعول به منصوب، وعلامة نصبه الألف نيابة عن الفتحة؛ لأنه من الأسماء الخمسة، وهو مضاف.',
    explanation: '«أخا» وقعت مفعولًا به بعد الفعل «ساعدتُ»، والمفعول به منصوب، والأسماء الخمسة تُنصب بالألف.',
  },
  {
    id: 'q15',
    number: 15,
    level: 'متقدم',
    type: 'اكتشاف خطأ',
    prompt: 'اختر كل جملة فيها خطأ.',
    fields: [
      {
        kind: 'multi',
        label: 'الجمل الخطأ',
        options: [
          'جاءَ أبا محمدٍ.',
          'رأيتُ أبو محمدٍ.',
          'سلّمتُ على أخي الطالبِ.',
          'جلستُ مع أبي أحمدَ.',
          'جاءَ أخا الطالبِ.',
        ],
        answers: ['جاءَ أبا محمدٍ.', 'رأيتُ أبو محمدٍ.', 'جاءَ أخا الطالبِ.'],
      },
    ],
    solution:
      'الجمل الخطأ: «جاءَ أبا محمدٍ» وصوابها «جاءَ أبو محمدٍ»، و«رأيتُ أبو محمدٍ» وصوابها «رأيتُ أبا محمدٍ»، و«جاءَ أخا الطالبِ» وصوابها «جاءَ أخو الطالبِ».',
    explanation:
      'الفاعل مرفوع فيُقال: جاءَ أبو محمدٍ، والمفعول به منصوب فيُقال: رأيتُ أبا محمدٍ، وجاءَ أخو الطالبِ لأن الفاعل مرفوع بالواو. أما «سلّمتُ على أخي الطالبِ» و«جلستُ مع أبي أحمدَ» فصحيحتان؛ لأن الأسماء الخمسة تُجر بالياء.',
  },
  {
    id: 'q16',
    number: 16,
    level: 'متقدم',
    type: 'تحليل جملة',
    prompt: 'حدد الاسم من الأسماء الخمسة، وإعرابه، وعلامة إعرابه.',
    sentence: 'مررتُ برجلٍ ذي علمٍ.',
    fields: [
      { kind: 'select', label: 'الاسم', options: ['ذي', 'ذو', 'ذا', 'علمٍ'], answer: 'ذي' },
      { kind: 'select', label: 'الإعراب', options: ['نعت مجرور', 'نعت مرفوع', 'نعت منصوب', 'فاعل'], answer: 'نعت مجرور' },
      {
        kind: 'select',
        label: 'العلامة',
        options: ['الياء نيابة عن الكسرة', 'الواو نيابة عن الضمة', 'الألف نيابة عن الفتحة', 'الكسرة الظاهرة على آخره'],
        answer: 'الياء نيابة عن الكسرة',
      },
    ],
    solution: 'ذي: نعت مجرور، وعلامة جره الياء نيابة عن الكسرة؛ لأنه من الأسماء الخمسة، وهو مضاف.',
    explanation: '«رجلٍ» مجرور بالباء، فـ«ذي» نعت له في الجر، وعلامة جره الياء نيابة عن الكسرة؛ لأنه من الأسماء الخمسة.',
  },
  {
    id: 'q17',
    number: 17,
    level: 'متقدم',
    type: 'إكمال',
    prompt: 'أكمل: «أبي» في هذه الجملة فاعل مرفوع، وعلامة رفعه ضمة ____.',
    sentence: 'جاءَ أبي.',
    fields: [{ kind: 'text', label: 'التكملة', accept: ['مقدرة', 'مقدّرة'], placeholder: 'اكتب الكلمة الناقصة' }],
    solution: 'ضمة مقدرة.',
    explanation:
      'لأن «أبي» مضافة إلى ياء المتكلم، فيمتنع ظهور الحركة على آخره فتُقدَّر الضمة. وهنا لا نقول: «أبي مرفوع بالواو»؛ لأن الشرط الثالث يمنع ذلك.',
  },
  {
    id: 'q18',
    number: 18,
    level: 'تفكير',
    type: 'سؤال تفكير',
    prompt: 'لماذا نقول: جاءَ أبو محمدٍ، ولا نقول: جاءَ أبا محمدٍ؟ اختر كل ما يصح.',
    fields: [
      {
        kind: 'multi',
        label: 'الأسباب الصحيحة',
        options: [
          'لأن «أبو» فاعل، والفاعل مرفوع',
          'لأن الأسماء الخمسة تُرفع بالواو نيابة عن الضمة',
          'لأن «أبا» صورة النصب فلا تصلح في موقع الفاعل',
          'لأن «أبو» مفعول به منصوب',
          'لأن الألف علامة رفع الأسماء الخمسة',
        ],
        answers: [
          'لأن «أبو» فاعل، والفاعل مرفوع',
          'لأن الأسماء الخمسة تُرفع بالواو نيابة عن الضمة',
          'لأن «أبا» صورة النصب فلا تصلح في موقع الفاعل',
        ],
      },
    ],
    solution:
      'الصحيح: «أبو» فاعل مرفوع، والأسماء الخمسة تُرفع بالواو نيابة عن الضمة، و«أبا» صورة النصب فلا تصلح في موقع الفاعل.',
    explanation:
      'فالإعراب يتبع الموقع: في «جاءَ أبو محمدٍ» الموقع فاعل ← الرفع ← الواو. وفي «رأيتُ أبا محمدٍ» الموقع مفعول به ← النصب ← الألف.',
  },
  {
    id: 'q19',
    number: 19,
    level: 'تفكير',
    type: 'تحليل ومقارنة',
    prompt: 'ما الفرق في الإعراب بين «أبو الطالبِ» في الجملة الأولى، و«أبوانِ» في الجملة الثانية؟',
    sentence: 'جاءَ أبو الطالبِ. — جاءَ أبوانِ.',
    fields: [
      {
        kind: 'select',
        label: 'الفرق',
        options: [
          'الأول اسم من الأسماء الخمسة مرفوع بالواو، والثاني مثنى مرفوع بالألف',
          'كلاهما يُرفع بالواو لأنهما بمعنى واحد',
          'كلاهما يُرفع بالألف لأنهما في محل رفع',
          'الأول مثنى، والثاني اسم من الأسماء الخمسة',
        ],
        answer: 'الأول اسم من الأسماء الخمسة مرفوع بالواو، والثاني مثنى مرفوع بالألف',
      },
    ],
    solution: 'أبو: اسم من الأسماء الخمسة، مرفوع بالواو. وأبوان: مثنى، مرفوع بالألف.',
    explanation:
      'لا تنظر إلى معنى الكلمة فقط، بل إلى صورتها وموقعها في الجملة: «أبو» مفردة مضافة فتُعرب إعراب الأسماء الخمسة، و«أبوان» مثنى فيُعرب إعراب المثنى.',
  },
  {
    id: 'q20',
    number: 20,
    level: 'تفكير',
    type: 'اكتشاف خطأ وتصحيحه',
    prompt: 'صحّح الجملة الآتية، ثم اشرح سبب التصحيح.',
    sentence: 'سلّمتُ على أخو الطالبِ.',
    fields: [
      {
        kind: 'select',
        label: 'الصواب',
        options: ['سلّمتُ على أخي الطالبِ.', 'سلّمتُ على أخا الطالبِ.', 'الجملة صحيحة كما هي'],
        answer: 'سلّمتُ على أخي الطالبِ.',
      },
    ],
    solution: 'سلّمتُ على أخي الطالبِ.',
    explanation:
      'لأن «أخي» اسم مجرور بحرف الجر «على»، والأسماء الخمسة تُجر بالياء نيابة عن الكسرة؛ فهي مفردة مضافة ولم تُضف إلى ياء المتكلم.',
  },
]

interface TestResult {
  score: number
  total: number
  correct: number
  wrong: number
  unanswered: number
  byLevel: Array<{ level: QuizLevel; correct: number; total: number }>
}

/** مفاتيح لاتينية آمنة لأسماء المستويات في أنماط العرض. */
function levelKey(level: QuizLevel) {
  return level === 'أساسي' ? 'basic' : level === 'متوسط' ? 'medium' : level === 'متقدم' ? 'advanced' : 'thinking'
}

function normalize(value: string | undefined) {
  return (value ?? '')
    .replace(/[ًٌٍَُِّْـ]/g, '')
    .replace(/[\u200f\u200e]/g, '')
    .replace(/\s+/g, '')
    .trim()
}

function sameSet(left: string[], right: string[]) {
  if (left.length !== right.length) return false
  const normalizedRight = right.map((item) => normalize(item))
  return left.every((item) => normalizedRight.includes(normalize(item)))
}

function isFieldAnswered(value: string[] | undefined) {
  if (!value || value.length === 0) return false
  return value.some((entry) => normalize(entry).length > 0)
}

function isFieldCorrect(field: QuizField, value: string[] | undefined) {
  if (!value) return false
  if (field.kind === 'select') return normalize(value[0]) === normalize(field.answer)
  if (field.kind === 'multi') return sameSet(value, field.answers)
  return field.accept.some((accepted) => normalize(value[0]) === normalize(accepted))
}

/** اختبار المنصة: لا تظهر نتيجة ولا إجابة صحيحة قبل تسليم الاختبار. */
function TestArea({
  onSubmitted,
  onReset,
}: {
  onSubmitted: (result: TestResult) => void
  onReset: () => void
}) {
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<TestResult | null>(null)

  function setValue(questionId: string, fieldIndex: number, value: string[], multi = false) {
    setAnswers((current) => {
      const key = `${questionId}-${fieldIndex}`
      if (!multi) return { ...current, [key]: value }
      const existing = current[key] ?? []
      const next = existing.includes(value[0])
        ? existing.filter((entry) => entry !== value[0])
        : [...existing, value[0]]
      return { ...current, [key]: next }
    })
  }

  function questionAnswered(question: QuizQuestion) {
    return question.fields.every((_, index) => isFieldAnswered(answers[`${question.id}-${index}`]))
  }

  function questionCorrect(question: QuizQuestion) {
    return question.fields.every((field, index) => isFieldCorrect(field, answers[`${question.id}-${index}`]))
  }

  function submit() {
    const correct = quizQuestions.filter((question) => questionCorrect(question)).length
    const unanswered = quizQuestions.filter((question) => !questionAnswered(question)).length
    const levels: QuizLevel[] = ['أساسي', 'متوسط', 'متقدم', 'تفكير']
    const byLevel = levels.map((level) => {
      const group = quizQuestions.filter((question) => question.level === level)
      return {
        level,
        total: group.length,
        correct: group.filter((question) => questionCorrect(question)).length,
      }
    })
    setSubmitted(true)
    const summary: TestResult = {
      score: correct,
      total: quizQuestions.length,
      correct,
      wrong: quizQuestions.length - correct - unanswered,
      unanswered,
      byLevel,
    }
    setResult(summary)
    onSubmitted(summary)
  }

  const answeredCount = quizQuestions.filter((question) => questionAnswered(question)).length

  return (
    <section className="official-test lesson-eight-test" data-testid="lesson8-official-test">
      <div className="official-test__intro">
        <strong>اختبار الدرس الثامن</strong>
        <span>٢٠ سؤالًا</span>
        <p>
          اختبار المنصة: ٦ أسئلة أساسية، و٧ متوسطة، و٤ متقدمة، و٣ أسئلة تفكير. لا تظهر النتيجة ولا
          الإجابات الصحيحة إلا بعد تسليم الاختبار.
        </p>
      </div>

      <div className="lesson-eight-test-levels" aria-label="توزيع الأسئلة على المستويات">
        <span>أساسي: ٦</span>
        <span>متوسط: ٧</span>
        <span>متقدم: ٤</span>
        <span>تفكير: ٣</span>
      </div>

      <div className="official-test__groups lesson-eight-test-groups">
        {quizQuestions.map((question) => (
          <fieldset
            className="official-question lesson-eight-test-question"
            key={question.id}
            disabled={submitted}
            data-testid={`lesson8-test-${question.id}`}
            data-level={question.level}
          >
            <legend>
              <span className="question-number">السؤال {question.number}</span> <bdi>{question.prompt}</bdi>
              <span className={`lesson-eight-level lesson-eight-level--${levelKey(question.level)}`}>{question.level}</span>
              <span className="lesson-eight-type">{question.type}</span>
            </legend>
            {question.sentence && (
              <p className="lesson-eight-test-sentence">
                <bdi>{question.sentence}</bdi>
              </p>
            )}
            <div className="lesson-eight-test-fields">
              {question.fields.map((field, fieldIndex) => {
                const value = answers[`${question.id}-${fieldIndex}`] ?? []
                if (field.kind === 'multi') {
                  return (
                    <div className="lesson-eight-multi" key={field.label}>
                      <p className="lesson-eight-field-label">{field.label}</p>
                      <div className="official-options">
                        {field.options.map((option) => (
                          <label key={option}>
                            <input
                              type="checkbox"
                              value={option}
                              checked={value.includes(option)}
                              onChange={() => setValue(question.id, fieldIndex, [option], true)}
                            />
                            <span><bdi>{option}</bdi></span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )
                }
                if (field.kind === 'text') {
                  return (
                    <label className="lesson-eight-field" key={field.label}>
                      <span>{field.label}</span>
                      <input
                        value={value[0] ?? ''}
                        onChange={(event) => setValue(question.id, fieldIndex, [event.target.value])}
                        placeholder={field.placeholder}
                        aria-label={`${question.prompt} — ${field.label}`}
                      />
                    </label>
                  )
                }
                return (
                  <label className="lesson-eight-field" key={field.label}>
                    <span>{field.label}</span>
                    <select
                      value={value[0] ?? ''}
                      onChange={(event) => setValue(question.id, fieldIndex, [event.target.value])}
                      aria-label={`${question.prompt} — ${field.label}`}
                    >
                      <option value="">اختر…</option>
                      {field.options.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </label>
                )
              })}
            </div>
          </fieldset>
        ))}
      </div>

      <div className="official-test__actions">
        {!submitted ? (
          <>
            <button type="button" className="button button--primary" onClick={submit}>
              تسليم الاختبار
            </button>
            <p className="lesson-eight-test-progress" role="status">
              أجبت عن <bdi>{answeredCount}</bdi> من <bdi>{quizQuestions.length}</bdi> سؤالًا.
            </p>
          </>
        ) : (
          <>
            {result && <ResultPanel result={result} />}
            <p className="lesson-eight-test-progress">
              تم تسليم الاختبار. الأرقام أعلاه هي نتيجتك، وانتقل إلى خطوة «حلول الاختبار» لمراجعة كل إجابة
              وتفسيرها.
            </p>
            <button
              type="button"
              className="button button--secondary"
              onClick={() => {
                setSubmitted(false)
                setAnswers({})
                setResult(null)
                onReset()
              }}
            >
              أعد الاختبار
            </button>
          </>
        )}
      </div>
    </section>
  )
}

/** لوحة النتيجة: تظهر بعد التسليم فقط — الدرجة والعدّ والتوزيع على المستويات. */
function ResultPanel({ result }: { result: TestResult }) {
  return (
    <div className="lesson-eight-solutions-summary" role="status">
      <p className="lesson-eight-solutions-score">
        النتيجة: <bdi>{result.correct} / {result.total}</bdi>
      </p>
      <ul className="lesson-eight-counts">
        <li>إجابات صحيحة: <bdi>{result.correct}</bdi></li>
        <li>إجابات خاطئة: <bdi>{result.wrong}</bdi></li>
        <li>أسئلة غير مجابة: <bdi>{result.unanswered}</bdi></li>
      </ul>
      <ul className="lesson-eight-counts lesson-eight-counts--levels">
        {result.byLevel.map((entry) => (
          <li key={entry.level}>
            {entry.level}: <bdi>{entry.correct} / {entry.total}</bdi>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** حلول الاختبار: أربع مجموعات صغيرة، كل مجموعة خمسة أسئلة، مع تفسير لكل إجابة. */
function SolutionsArea({ result }: { result: TestResult | null }) {
  const groups = [
    { title: 'المجموعة الأولى: الأسئلة 1–5', from: 1, to: 5 },
    { title: 'المجموعة الثانية: الأسئلة 6–10', from: 6, to: 10 },
    { title: 'المجموعة الثالثة: الأسئلة 11–15', from: 11, to: 15 },
    { title: 'المجموعة الرابعة: الأسئلة 16–20', from: 16, to: 20 },
  ]

  return (
    <section className="lesson-eight-solutions" data-testid="lesson8-solutions">
      <EducationalCard title="حلول اختبار الدرس الثامن" eyebrow="منطقة الحلول" tone="accent">
        {!result ? (
          <div className="lesson-eight-solutions-gate">
            <p>
              أكمل «اختبار الدرس الثامن» وسلّمه أولًا، ثم عُد إلى هذه الخطوة؛ لتظهر لك النتيجة مع حلول
              جميع الأسئلة مشروحة.
            </p>
            <p className="lesson-eight-note">
              الإجابات النموذجية الكاملة موجودة أيضًا في «منطقة خاصة بالمعلم» لتصحيحها مع معلمك.
            </p>
          </div>
        ) : (
          <>
            <p className="lesson-eight-solutions-note">نتيجتك في الاختبار:</p>
            <ResultPanel result={result} />

            {groups.map((group) => (
              <div className="lesson-eight-solution-group" key={group.title}>
                <h4>{group.title}</h4>
                <ol className="lesson-eight-solution-list">
                  {quizQuestions
                    .filter((question) => question.number >= group.from && question.number <= group.to)
                    .map((question) => (
                      <li key={question.id}>
                        <p className="lesson-eight-solution-prompt">
                          <strong>السؤال {question.number}:</strong> <bdi>{question.prompt}</bdi>
                          {question.sentence && <> — <bdi>{question.sentence}</bdi></>}
                        </p>
                        <p className="lesson-eight-solution-answer">
                          <strong>الإجابة الصحيحة:</strong> <bdi>{question.solution}</bdi>
                        </p>
                        {question.fields.map((field) => (
                          <p className="lesson-eight-solution-field" key={field.label}>
                            {field.label}:{' '}
                            <bdi>
                              {field.kind === 'multi'
                                ? field.answers.join(' — ')
                                : field.kind === 'select'
                                  ? field.answer
                                  : field.accept[0]}
                            </bdi>
                          </p>
                        ))}
                        <p className="lesson-eight-solution-explain">
                          <strong>التفسير:</strong> {question.explanation}
                        </p>
                      </li>
                    ))}
                </ol>
              </div>
            ))}
          </>
        )}
      </EducationalCard>
    </section>
  )
}

/* ================================================================== *
 * الواجب، التحدي الإضافي، والخلاصة
 * ================================================================== */

/** نموذج إجابة الواجب: ثلاث جمل بـ«أب»، وثلاث جمل بـ«ذو»، مع الإعراب الكامل. */
const homeworkModel = [
  {
    group: 'أولًا: ثلاث جمل باستخدام كلمة «أب»',
    items: [
      {
        label: 'جملة يكون فيها «أب» مرفوعًا',
        sentence: 'جاءَ أبو الطالبِ.',
        parsing: 'أبو: فاعل مرفوع، وعلامة رفعه الواو نيابة عن الضمة؛ لأنه من الأسماء الخمسة، وهو مضاف.',
      },
      {
        label: 'جملة يكون فيها «أب» منصوبًا',
        sentence: 'رأيتُ أبا الطالبِ.',
        parsing: 'أبا: مفعول به منصوب، وعلامة نصبه الألف نيابة عن الفتحة؛ لأنه من الأسماء الخمسة، وهو مضاف.',
      },
      {
        label: 'جملة يكون فيها «أب» مجرورًا',
        sentence: 'سلّمتُ على أبي الطالبِ.',
        parsing: 'أبي: اسم مجرور بـ"على"، وعلامة جره الياء نيابة عن الكسرة؛ لأنه من الأسماء الخمسة، وهو مضاف.',
      },
    ],
  },
  {
    group: 'ثانيًا: ثلاث جمل باستخدام كلمة «ذو» بمعنى صاحب',
    items: [
      {
        label: 'ذو',
        sentence: 'هذا رجلٌ ذو خلقٍ.',
        parsing: 'ذو: نعت مرفوع، وعلامة رفعه الواو نيابة عن الضمة؛ لأنه من الأسماء الخمسة، وهو مضاف.',
      },
      {
        label: 'ذا',
        sentence: 'رأيتُ رجلًا ذا خلقٍ.',
        parsing: 'ذا: نعت منصوب، وعلامة نصبه الألف نيابة عن الفتحة؛ لأنه من الأسماء الخمسة، وهو مضاف.',
      },
      {
        label: 'ذي',
        sentence: 'مررتُ برجلٍ ذي خلقٍ.',
        parsing: 'ذي: نعت مجرور، وعلامة جره الياء نيابة عن الكسرة؛ لأنه من الأسماء الخمسة، وهو مضاف.',
      },
    ],
  },
]

function Homework() {
  return (
    <EducationalCard title="واجب الدرس" eyebrow="اكتب في دفترك ثم أعرب بنفسك" tone="soft">
      <p>اكتب ثلاث جمل باستخدام كلمة «أب»:</p>
      <ol className="numbered-list">
        <li>جملة يكون فيها «أب» مرفوعًا.</li>
        <li>جملة يكون فيها «أب» منصوبًا.</li>
        <li>جملة يكون فيها «أب» مجرورًا.</li>
      </ol>

      <p>ثم اكتب ثلاث جمل باستخدام كلمة «ذو» بمعنى صاحب:</p>
      <ol className="numbered-list">
        <li><bdi>ذو</bdi></li>
        <li><bdi>ذا</bdi></li>
        <li><bdi>ذي</bdi></li>
      </ol>

      <p className="lesson-eight-note">وحاول إعراب الكلمات بنفسك، ثم راجع نموذج الإجابة مع معلمك.</p>
    </EducationalCard>
  )
}

/** التحدي الإضافي: إعراب كامل لجمل المصدر، مع الأسئلة الستة المطلوبة. */
const challengeItems = [
  {
    sentence: 'جاءَ أبو صديقي.',
    lines: [
      'جاءَ: فعل ماضٍ مبني على الفتحة الظاهرة على آخره.',
      'أبو: فاعل مرفوع، وعلامة رفعه الواو نيابة عن الضمة؛ لأنه من الأسماء الخمسة، وهو مضاف.',
      'صديقي: مضاف إليه مجرور، وعلامة جره الكسرة المقدرة على ما قبل ياء المتكلم، والياء ضمير متصل مبني في محل جر مضاف إليه.',
    ],
  },
  {
    sentence: 'كرمتُ أبا الطالبِ.',
    lines: [
      'كرمتُ: فعل ماضٍ مبني على السكون لاتصاله بتاء الفاعل، والتاء ضمير متصل مبني في محل رفع فاعل.',
      'أبا: مفعول به منصوب، وعلامة نصبه الألف نيابة عن الفتحة؛ لأنه من الأسماء الخمسة، وهو مضاف.',
      'الطالبِ: مضاف إليه مجرور، وعلامة جره الكسرة الظاهرة على آخره.',
    ],
  },
  {
    sentence: 'ذهبتُ مع أخي.',
    lines: [
      'ذهبتُ: فعل ماضٍ مبني على السكون لاتصاله بتاء الفاعل، والتاء ضمير متصل مبني في محل رفع فاعل.',
      'مع: حرف جر.',
      'أخي: اسم مجرور بـ«مع»، وعلامة جره الكسرة المقدرة على ما قبل ياء المتكلم، والياء ضمير متصل مبني في محل جر مضاف إليه.',
    ],
  },
  {
    sentence: 'هذا رجلٌ ذو فضلٍ.',
    lines: [
      'هذا: اسم إشارة مبني في محل رفع مبتدأ.',
      'رجلٌ: خبر مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.',
      'ذو: نعت مرفوع، وعلامة رفعه الواو نيابة عن الضمة؛ لأنه من الأسماء الخمسة، وهو مضاف.',
      'فضلٍ: مضاف إليه مجرور، وعلامة جره الكسرة الظاهرة على آخره.',
    ],
  },
  {
    sentence: 'مررتُ برجلٍ ذي خبرةٍ.',
    lines: [
      'مررتُ: فعل ماضٍ مبني على السكون لاتصاله بتاء الفاعل، والتاء ضمير متصل مبني في محل رفع فاعل.',
      'برجلٍ: الباء حرف جر، ورجلٍ اسم مجرور بالباء، وعلامة جره الكسرة الظاهرة على آخره.',
      'ذي: نعت مجرور، وعلامة جره الياء نيابة عن الكسرة؛ لأنه من الأسماء الخمسة، وهو مضاف.',
      'خبرةٍ: مضاف إليه مجرور، وعلامة جره الكسرة الظاهرة على آخره.',
    ],
  },
]

function AdvancedChallenge() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  return (
    <EducationalCard title="تحدي إضافي للطالب المتقدم" eyebrow="اختياري للمتميزين" tone="accent">
      <p>أعرب الجمل الآتية إعرابًا كاملًا:</p>
      <ol className="numbered-list">
        {challengeItems.map((item) => (
          <li key={item.sentence}>
            <bdi>{item.sentence}</bdi>
          </li>
        ))}
      </ol>
      <p>ثم حاول أن تحدد:</p>
      <ul className="check-list">
        <li>الفاعل.</li>
        <li>المفعول به.</li>
        <li>الاسم المجرور.</li>
        <li>الاسم من الأسماء الخمسة.</li>
        <li>علامة الإعراب.</li>
        <li>سبب استخدام هذه العلامة.</li>
      </ul>
      <div className="lesson-eight-challenge">
        {challengeItems.map((item, index) => (
          <div className="lesson-eight-challenge-item" key={item.sentence}>
            <button
              type="button"
              className="button button--ghost"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              aria-expanded={openIndex === index}
            >
              {openIndex === index ? 'إخفاء الإعراب الكامل' : `أظهر الإعراب الكامل: ${item.sentence}`}
            </button>
            {openIndex === index && <FullParsing lines={item.lines} />}
          </div>
        ))}
      </div>
      <PlatformNote>
        <p>
          الإعراب أعلاه من إعداد المنصة، اعتمادًا على قواعد الدرس ودرس <strong>علامات الإعراب الفرعية</strong>،
          لأن مادة المصدر طلبت الإعراب ولم تُرفق له حلولًا مكتوبة.
        </p>
      </PlatformNote>
    </EducationalCard>
  )
}

function OnePageSummary() {
  return (
    <>
      <EducationalCard title="ملخص الدرس في صفحة واحدة" eyebrow="الخلاصة" tone="accent">
        <p>
          الأسماء الخمسة: <strong>أب – أخ – حم – فو – ذو</strong>
        </p>
        <CaseSignTable />
        <h4>أمثلة:</h4>
        <p className="lesson-eight-featured"><bdi>جاءَ أبو محمدٍ.</bdi> — رفع بالواو.</p>
        <p className="lesson-eight-featured"><bdi>رأيتُ أبا محمدٍ.</bdi> — نصب بالألف.</p>
        <p className="lesson-eight-featured"><bdi>سلّمتُ على أبي محمدٍ.</bdi> — جر بالياء.</p>
        <h4>ذو:</h4>
        <p><bdi>ذو = صاحب</bdi></p>
        <p className="lesson-eight-featured"><bdi>جاءَ رجلٌ ذو علمٍ.</bdi></p>
        <p className="lesson-eight-featured"><bdi>رأيتُ رجلًا ذا علمٍ.</bdi></p>
        <p className="lesson-eight-featured"><bdi>مررتُ برجلٍ ذي علمٍ.</bdi></p>
        <h4>أهم شيء تحفظه:</h4>
        <GoldenRule text="الأسماء الخمسة: واو في الرفع، ألف في النصب، ياء في الجر." />
        <div className="lesson-eight-chip-row lesson-eight-chip-row--golden">
          <bdi>أبو – أبا – أبي</bdi>
          <bdi>أخو – أخا – أخي</bdi>
          <bdi>ذو – ذا – ذي</bdi>
        </div>
      </EducationalCard>
    </>
  )
}

function GoldenKey() {
  const lines = [
    'واو = رفع',
    'ألف = نصب',
    'ياء = جر',
    'أبو – أبا – أبي',
    'أخو – أخا – أخي',
    'حمو – حما – حمي',
    'فو – فا – في',
    'ذو – ذا – ذي',
  ]
  return (
    <>
      <EducationalCard title="قاعدة سريعة للحفظ" eyebrow="الخلاصة" tone="default">
        <p>احفظ هذه الجملة:</p>
        <GoldenRule text="الأسماء الخمسة ترفع بالواو، وتنصب بالألف، وتجر بالياء." />
        <p>ثم احفظ:</p>
        <ChipRow items={['أبو – أبا – أبي', 'أخو – أخا – أخي', 'حمو – حما – حمي', 'فو – فا – في', 'ذو – ذا – ذي']} />
      </EducationalCard>
      <EducationalCard title="مفتاح الحفظ" eyebrow="واو / ألف / ياء" tone="accent">
        <div className="lesson-eight-memory-key">
          {lines.map((line) => (
            <bdi key={line}>{line}</bdi>
          ))}
        </div>
      </EducationalCard>
      <EducationalCard title="قاعدة ذهبية" eyebrow="ثبّتها في ذاكرتك" tone="soft">
        <p className="lesson-eight-golden-inline">
          <span aria-hidden="true">⭐</span> <bdi>واو = رفع</bdi> <span aria-hidden="true">•</span>{' '}
          <bdi>ألف = نصب</bdi> <span aria-hidden="true">•</span> <bdi>ياء = جر</bdi>
        </p>
      </EducationalCard>
    </>
  )
}

/* ================================================================== *
 * منطقة خاصة بالمعلم — محمية بكلمة مرور الدرس الثامن
 * ================================================================== */

function CorrectionPair({
  label,
  bad,
  good,
  reason,
}: {
  label: string
  bad: string
  good: string
  reason: string
}) {
  return (
    <article className="lesson-eight-correction">
      <h4 className="lesson-eight-correction-label">{label}</h4>
      <p>
        ❌ <del><bdi>{bad}</bdi></del>
      </p>
      <p>
        الصحيح: ✅ <strong><bdi>{good}</bdi></strong>
      </p>
      <p className="lesson-eight-correction-reason">{reason}</p>
    </article>
  )
}

function TeacherArea() {
  const interactions = [
    {
      title: 'تفاعل ١: اربط كل صورة بحالتها الإعرابية',
      items: ['أبو ← رفع (الواو نيابة عن الضمة).', 'أبا ← نصب (الألف نيابة عن الفتحة).', 'أبي ← جر (الياء نيابة عن الكسرة).'],
    },
    {
      title: 'تفاعل ٢: لماذا تغيّرت الكلمة؟',
      items: [
        'جاءَ أبو محمدٍ. ← الموقع: فاعل، الحالة: مرفوع، العلامة: الواو نيابة عن الضمة.',
        'رأيتُ أبا محمدٍ. ← الموقع: مفعول به، الحالة: منصوب، العلامة: الألف نيابة عن الفتحة.',
        'سلّمتُ على أبي محمدٍ. ← الموقع: اسم مجرور، الحالة: مجرور، العلامة: الياء نيابة عن الكسرة.',
      ],
    },
    {
      title: 'تفاعل ٣: اختر العلامة',
      items: ['الرفع: الواو.', 'النصب: الألف.', 'الجر: الياء.'],
    },
    {
      title: 'تفاعل ٤: فو أم فم؟',
      items: [
        '«فو» الخالية من الميم هي التي تدخل في الأسماء الخمسة.',
        '«فم» بالميم لا تُعامل معاملة «فو» في باب الأسماء الخمسة (هذا فمُ الطفلِ).',
      ],
    },
    {
      title: 'تفاعل ٥: ذو / ذا / ذي',
      items: [
        'جاءَ رجلٌ ذو علمٍ. ← ذو: نعت مرفوع بالواو.',
        'رأيتُ رجلًا ذا علمٍ. ← ذا: نعت منصوب بالألف.',
        'مررتُ برجلٍ ذي علمٍ. ← ذي: نعت مجرور بالياء.',
      ],
    },
    {
      title: 'تفاعل ٦: الأسماء الخمسة أم المثنى؟',
      items: [
        'أبو ← اسم من الأسماء الخمسة، مرفوع، وعلامة رفعه الواو نيابة عن الضمة.',
        'أبوان ← مثنى، مرفوع، وعلامة رفعه الألف.',
      ],
    },
    {
      title: 'تفاعل ٧: اكتشف الخطأ',
      items: ['الجملة الصحيحة: جاءَ أبو محمدٍ.', 'السبب: «أبو» فاعل مرفوع، والأسماء الخمسة تُرفع بالواو، و«أبا» صورة النصب.'],
    },
  ]

  return (
    <TeacherSpace password="somer173">
      <div className="teacher-material teacher-material--lesson8">
        <h3>أ. شرح الدرس للمعلم</h3>

        <h4>أهداف الدرس</h4>
        <ol>
          {objectives.map((objective) => (
            <li key={objective}>{objective}</li>
          ))}
        </ol>

        <h4>القاعدة الأساسية</h4>
        <p>
          الأسماء الخمسة <strong>أب – أخ – حم – فو – ذو</strong> تُعرب <strong>بالحروف بدل الحركات</strong> عند
          تحقق الشروط: الرفع بالواو، والنصب بالألف، والجر بالياء.
        </p>
        <p>
          الرفع: <bdi>جاءَ أبو الطالبِ.</bdi> — النصب: <bdi>رأيتُ أبا الطالبِ.</bdi> — الجر:{' '}
          <bdi>سلّمتُ على أبي الطالبِ.</bdi>
        </p>

        <h4>الشروط</h4>
        <ol>
          {conditions.map((condition) => (
            <li key={condition.title}>
              <strong>الشرط {condition.order}: {condition.title}.</strong> {condition.detail} مثال:{' '}
              <bdi>{condition.example}</bdi> — يعارض ذلك: <bdi>{condition.counter}</bdi>
            </li>
          ))}
        </ol>

        <h4>النقاط الحساسة</h4>
        <ul>
          <li>لا يكفي أن يرى الطالب كلمة «أب» فيقول مباشرة: هذه من الأسماء الخمسة؛ بل يتحقق من الشروط.</li>
          <li>الشرط الثالث (ألا تكون مضافة إلى ياء المتكلم) نقطة متقدمة قليلًا؛ يكفي أن يفهم الطالب مثال: جاءَ أبي ← فاعل مرفوع، وعلامة رفعه ضمة مقدرة.</li>
          <li>«فم» بالميم لا تُعامل معاملة «فو» في باب الأسماء الخمسة.</li>
          <li>«ذو» التي تدخل في الأسماء الخمسة بمعنى «صاحب».</li>
          <li>الإعراب يتبع الموقع الإعرابي، وليس الشكل وحده.</li>
        </ul>

        <h4>الأخطاء الشائعة</h4>
        <div className="lesson-eight-corrections">
          {commonErrors.map((error) => (
            <CorrectionPair
              key={error.number}
              label={`الخطأ ${error.number}`}
              bad={error.bad}
              good={error.good}
              reason={error.reason}
            />
          ))}
        </div>

        <h4>الربط بالدرس السابق: علامات الإعراب الفرعية</h4>
        <p>
          ارجع إلى درس <strong>علامات الإعراب الأصلية والفرعية</strong>، وذكّر الطالب بأن العلامة الأصلية ليست
          الوحيدة: فالعلامات الفرعية هي الألف والواو والياء. ثم اعرض المقارنة:
        </p>
        <ul>
          <li>العلامة الأصلية في الرفع: الضمة. وفي النصب: الفتحة. وفي الجر: الكسرة.</li>
          <li>المثنى: الألف في الرفع، والياء في النصب والجر.</li>
          <li>الأسماء الخمسة: الواو في الرفع، والألف في النصب، والياء في الجر.</li>
        </ul>
        <PlatformNote>
          <p>
            «المثنى: الألف في الرفع والياء في النصب والجر» مأخوذة من الدرس السابع، والمقارنة بها هنا إضافة
            تعليمية من المنصة لربط الدروس.
          </p>
        </PlatformNote>

        <h3>ب. حلول أنشطة الدرس</h3>

        <h4>النشاط التطبيقي (٩ جمل)</h4>
        <ol>
          {applicationItems.map((item, index) => (
            <li key={item.prompt}>
              <bdi>{item.prompt}</bdi> ← الاسم من الأسماء الخمسة: <strong>{item.word}</strong>، الحالة:{' '}
              <strong>{item.state}</strong>.
              <FullParsing lines={[applicationParsing[index]]} />
            </li>
          ))}
        </ol>

        <h4>حلول التفاعلات السبعة</h4>
        {interactions.map((interaction) => (
          <div key={interaction.title}>
            <h4>{interaction.title}</h4>
            <ol>
              {interaction.items.map((item) => (
                <li key={item}><bdi>{item}</bdi></li>
              ))}
            </ol>
          </div>
        ))}

        <h3>ج. حلول الأمثلة المحلولة (٩ أمثلة)</h3>
        <ol>
          {workedExamples.map((example) => (
            <li key={example.number}>
              <bdi>{example.sentence}</bdi>
              <ul>
                {example.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <FullParsing lines={example.parsing} />
            </li>
          ))}
        </ol>

        <h3>د. حلول أسئلة نهاية الدرس في المصدر (١–٢٥)</h3>
        <p>الأسئلة 1–13 (موضوعية):</p>
        <ol>
          {sourceQuestions
            .filter((question) => question.number <= 13)
            .map((question) => (
              <li key={question.number}>
                <strong>{question.number}.</strong> <bdi>{question.answer}</bdi>
              </li>
            ))}
        </ol>
        <p>الأسئلة 14–18 (استخرج وأعرب):</p>
        <ol start={14}>
          {sourceQuestions
            .filter((question) => question.number >= 14 && question.number <= 18)
            .map((question) => (
              <li key={question.number}>
                <bdi>{question.prompt}</bdi>
                {question.parsing?.map((line) => <FullParsing key={line} lines={[line]} />)}
                {question.note && <p className="lesson-eight-teacher-note">{question.note}</p>}
              </li>
            ))}
        </ol>
        <p>الأسئلة 19–25 (تحويل وتفكير):</p>
        <ol start={19}>
          {sourceQuestions
            .filter((question) => question.number >= 19)
            .map((question) => (
              <li key={question.number}>
                <bdi>{question.prompt}</bdi> ← <bdi>{question.answer}</bdi>
              </li>
            ))}
        </ol>

        <h3>هـ. الواجب: نموذج الإجابة</h3>
        {homeworkModel.map((group) => (
          <div key={group.group}>
            <h4>{group.group}</h4>
            <ol>
              {group.items.map((item) => (
                <li key={item.label}>
                  {item.label}: <bdi>{item.sentence}</bdi>
                  <FullParsing lines={[item.parsing]} />
                </li>
              ))}
            </ol>
          </div>
        ))}

        <h3>و. ملاحظات تدريسية</h3>

        <h4>1. الفرق بين العلامة الأصلية والفرعية</h4>
        <p>
          الأصلية: الضمة للرفع، والفتحة للنصب، والكسرة للجر. والفرعية: الواو والألف والياء. الهدف أن يفهم
          الطالب أن الاسم قد يُرفع بغير الضمة إذا كان من الأسماء الخمسة أو من المثنى أو من جمع المذكر السالم.
        </p>

        <h4>2. الفرق بين الأسماء الخمسة والمثنى</h4>
        <p>
          <bdi>جاءَ أبو الطالبِ.</bdi> ← «أبو» اسم من الأسماء الخمسة، مرفوع بالواو.
        </p>
        <p>
          <bdi>جاءَ أبوانِ.</bdi> ← «أبوان» مثنى، مرفوع بالألف. والفرق يعود إلى أن شرط الأسماء الخمسة أن تكون
          مفردة.
        </p>

        <h4>3. فو وفم</h4>
        <p>
          «فو» بمعنى «فم»، لكن الشرط أن تكون خالية من الميم: <bdi>هذا فو الطفلِ.</bdi> أما{' '}
          <bdi>هذا فمُ الطفلِ.</bdi> فـ«فم» بالميم لا تُعامل معاملة الأسماء الخمسة.
        </p>

        <h4>4. ذو بمعنى صاحب</h4>
        <p>
          «ذو» التي تدخل في الأسماء الخمسة بمعنى «صاحب»: <bdi>رجلٌ ذو مالٍ</bdi> أي: رجلٌ صاحب مال. وإذا
          استُعملت كلمة تشبهها في اللفظ ولم تكن بهذا المعنى فلا نطبق عليها القاعدة نفسها.
        </p>

        <h4>5. الشروط</h4>
        <p>
          خمسة شروط: مفردة، ومضافة، وألا تكون مضافة إلى ياء المتكلم، وحذف الميم في «فو»، وأن تكون «ذو» بمعنى
          صاحب. لا تُكثر من الشروط المتقدمة في البداية؛ الهدف الأول أن يفهم الطالب ما هي الأسماء الخمسة
          وكيف تُعرب، ثم نعود إلى الشروط بعمق مع درس <strong>المضاف والمضاف إليه</strong>.
        </p>

        <h4>6. أخطاء أبو / أبا / أبي</h4>
        <div className="lesson-eight-corrections">
          <CorrectionPair label="الخطأ الأول" bad="جاءَ أبا محمدٍ." good="جاءَ أبو محمدٍ." reason="لأن «أبا» منصوبة، بينما الفاعل مرفوع." />
          <CorrectionPair label="الخطأ الثاني" bad="رأيتُ أبو محمدٍ." good="رأيتُ أبا محمدٍ." reason="لأن «أبا» مفعول به منصوب." />
          <CorrectionPair label="الخطأ الثالث" bad="مررتُ على أبو محمدٍ." good="مررتُ على أبي محمدٍ." reason="لأن الاسم بعد حرف الجر مجرور." />
        </div>

        <h4>7. ملاحظات تصحيحية (ثلاثة أشياء يجب التأكد من أن الطالب فهمها)</h4>
        <p><strong>أولًا: لا تحفظ الطالب الكلمات وحدها.</strong> لا يكفي أن يقول: أبو، أبا، أبي؛ بل يجب أن يعرف لماذا تغيّرت.</p>
        <p><strong>ثانيًا: اربط الدرس بالإعراب.</strong> عندما يرى «أبو» اسأله: لماذا الواو؟ الإجابة: لأنه مرفوع ومن الأسماء الخمسة. وعندما يرى «أبا» اسأله: لماذا الألف؟ الإجابة: لأنه منصوب ومن الأسماء الخمسة. وعندما يرى «أبي» اسأله: لماذا الياء؟ الإجابة: لأنه مجرور ومن الأسماء الخمسة.</p>
        <p><strong>ثالثًا: لا تُكثر من الشروط المتقدمة في البداية.</strong> سنعود إلى الشروط ونربطها بموضوع الإضافة بشكل أعمق في درس المضاف والمضاف إليه.</p>

        <h4>8. ملاحظة على إعراب «ذو» في المصدر</h4>
        <p>
          في سؤال المصدر: <bdi>رجلٌ ذو خلقٍ محبوبٌ.</bdi> قُبلت «ذو» نعتًا؛ لأنها صفة لـ«رجل». وإذا وردت في
          سياق آخر فتُعرب حسب موقعها.
        </p>

        <h4>9. اختبار المنصة وحلوله</h4>
        <p>
          اختبار المنصة (٢٠ سؤالًا) منفصل عن أسئلة المصدر، وحلوله مشروحة في خطوة <strong>«حلول الاختبار»</strong>{' '}
          داخل مسار الطالب بعد التسليم. توزيع الأسئلة: ٦ أساسي، ٧ متوسط، ٤ متقدم، ٣ تفكير.
        </p>
      </div>
    </TeacherSpace>
  )
}

/* ================================================================== *
 * تعلّم متسلسل: كل خطوة تُعرض وحدها داخل LessonFlow
 * ================================================================== */

export function LessonEight({ onProgressChange, onFinish }: Props) {
  const [testResult, setTestResult] = useState<TestResult | null>(null)

  const steps: LessonStepDefinition[] = [
    step('intro', 'الدرس الثامن: الأسماء الخمسة', 'البداية', '📘', (
      <EducationalCard title="الدرس الثامن: الأسماء الخمسة" eyebrow="عنوان الدرس" tone="accent">
        <p className="lesson-eight-hero-topic">الأسماء الخمسة</p>
        <p>
          في هذا الدرس نتعلم مجموعة خاصة من الأسماء لها طريقة مميزة في الإعراب: فهي تُعرب بالحروف بدل
          الحركات. وهي: <strong>أب – أخ – حم – فو – ذو</strong>.
        </p>
        <div className="lesson-eight-hero-map" aria-label="الأسماء الخمسة وصورها في الحالات الثلاث">
          {fiveNames.map((item) => (
            <div key={item.name}>
              <strong>{item.name}</strong>
              <span><bdi>{item.raf} – {item.nasb} – {item.jarr}</bdi></span>
            </div>
          ))}
        </div>
      </EducationalCard>
    )),

    step('objectives', 'أهداف الدرس', 'البداية', '🎯', (
      <>
        <p>في نهاية هذا الدرس، يُفترض أن يكون الطالب قادرًا على:</p>
        <ul className="check-list">
          {objectives.map((objective) => (
            <li key={objective}>{objective}</li>
          ))}
        </ul>
      </>
    )),

    step('review-irab', '1. تمهيد — تذكّر ما تعلمناه', 'التمهيد والربط', '↩️', (
      <>
        <p>تذكّر ما تعلمناه في الدرس السابق:</p>
        <p>قلنا إن الإعراب لا يكون دائمًا بالحركات الأصلية فقط.</p>
        <p>مثلًا:</p>
        <p className="lesson-eight-featured"><bdi>جاءَ الطالبُ.</bdi></p>
        <p>الطالبُ:</p>
        <ul className="check-list">
          <li>مرفوع.</li>
          <li>وعلامة رفعه <strong>الضمة</strong>.</li>
        </ul>
        <p>لكننا تعلمنا أن هناك أسماءً تُعرب بعلامات فرعية.</p>
        <p>مثل:</p>
        <p className="lesson-eight-featured"><bdi>جاءَ الطالبانِ.</bdi></p>
        <p>الطالبانِ:</p>
        <ul className="check-list">
          <li>مرفوع.</li>
          <li>وعلامة رفعه <strong>الألف</strong>.</li>
        </ul>
        <p>واليوم سنتعلم مجموعة خاصة من الأسماء لها طريقة مميزة في الإعراب.</p>
        <p>هذه الأسماء تُسمّى:</p>
        <p className="lesson-eight-hero-topic lesson-eight-hero-topic--inline">
          <span aria-hidden="true">⭐</span> الأسماء الخمسة
        </p>
      </>
    )),

    step('connection', '2. الربط بدرس علامات الإعراب الفرعية', 'التمهيد والربط', '🔗', (
      <>
        <h3>علامات الإعراب الفرعية</h3>
        <p>
          هذا الدرس مرتبط مباشرة بدرس <strong>علامات الإعراب الأصلية والفرعية</strong>؛ لأن الأسماء الخمسة
          تُعرب بعلامات فرعية هي الواو والألف والياء.
        </p>
        <div className="table-scroll">
          <table className="lesson-eight-table">
            <caption>المقارنة: المثنى والأسماء الخمسة.</caption>
            <thead>
              <tr>
                <th scope="col">النوع</th>
                <th scope="col">الرفع</th>
                <th scope="col">النصب</th>
                <th scope="col">الجر</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">العلامات الأصلية</th>
                <td>الضمة</td>
                <td>الفتحة</td>
                <td>الكسرة</td>
              </tr>
              <tr>
                <th scope="row">المثنى</th>
                <td>الألف</td>
                <td>الياء</td>
                <td>الياء</td>
              </tr>
              <tr>
                <th scope="row">الأسماء الخمسة</th>
                <td>الواو</td>
                <td>الألف</td>
                <td>الياء</td>
              </tr>
            </tbody>
          </table>
        </div>
        <PlatformNote>
          <p>
            صف «المثنى» مأخوذ من الدرس السابع (المثنى وجمع المذكر السالم وجمع المؤنث السالم)، وقد أُضيف هنا
            لربط درس اليوم بدرس علامات الإعراب الفرعية كما طلب الدرس.
          </p>
        </PlatformNote>
      </>
    )),

    step('what-are-five', '3. ما الأسماء الخمسة؟', 'التعرف إلى الأسماء الخمسة', '🧭', (
      <>
        <p>الأسماء الخمسة هي:</p>
        <ol className="numbered-list">
          <li><strong>أب</strong></li>
          <li><strong>أخ</strong></li>
          <li><strong>حم</strong></li>
          <li><strong>فو</strong></li>
          <li><strong>ذو</strong></li>
        </ol>
        <p>لكن عندما نعربها وفق قواعد الأسماء الخمسة، تظهر غالبًا بهذه الصورة:</p>
        <ChipRow items={['أبو', 'أخو', 'حمو', 'فو', 'ذو']} />
        <p>وفي حالات النصب والجر:</p>
        <ChipRow items={['أبا', 'أخا', 'حما', 'فا', 'ذا']} />
        <p>وفي حالة الجر:</p>
        <ChipRow items={['أبي', 'أخي', 'حمي', 'في', 'ذي']} />
        <p>سنشرح هذا بالتفصيل.</p>
      </>
    )),

    step('why-named', '4. لماذا سُمّيت الأسماء الخمسة؟', 'التعرف إلى الأسماء الخمسة', '💬', (
      <>
        <p>لأنها مجموعة من <strong>خمسة أسماء</strong> لها طريقة خاصة في الإعراب.</p>
        <p>وهي:</p>
        <FiveNamesTable withMeaning />
        <p>أمثلة:</p>
        <p className="lesson-eight-featured"><bdi>هذا أبو خالدٍ.</bdi></p>
        <p className="lesson-eight-featured"><bdi>رأيتُ أبا خالدٍ.</bdi></p>
        <p className="lesson-eight-featured"><bdi>سلّمتُ على أبي خالدٍ.</bdi></p>
        <p>لاحظ أن كلمة <strong>أب</strong> تغيّرت:</p>
        <ChipRow items={['أبو', 'أبا', 'أبي']} />
        <p>وهذا التغير ليس عشوائيًا، بل سببه <strong>الإعراب</strong>.</p>
      </>
    )),

    step('three-forms', '5. الصور الثلاث مع الحالات', 'التعرف إلى الأسماء الخمسة', '🔀', (
      <>
        <p>خذ صور الاسم الواحد، واربط كل صورة بحالتها:</p>
        <CaseSortActivity />
        <PlatformNote>
          <p>
            هذا الفرز إضافة تفاعلية من المنصة؛ ليختبر الطالب نفسه بعد أن فهم أن تغيّر الصورة سببه الموقع
            الإعرابي.
          </p>
        </PlatformNote>
      </>
    )),

    step('core-rule', '6. القاعدة الأساسية', 'القاعدة الأساسية', '⭐', (
      <>
        <p>
          الأسماء الخمسة تُعرب <strong>بالحروف بدل الحركات</strong> عندما تتحقق شروط معينة.
        </p>
        <p>والعلامات هي:</p>
        <CaseSignTable />
        <p>إذن احفظ هذه القاعدة:</p>
        <GoldenRule text="الأسماء الخمسة تُرفع بالواو، وتُنصب بالألف، وتُجر بالياء." />
        <p>وهذه من أهم قواعد الدرس.</p>
        <p>اختبر نفسك في العلامات:</p>
        <SignChoiceActivity />
      </>
    )),

    step('easy-way', '7. نفهمها بطريقة سهلة', 'القاعدة الأساسية', '🪜', (
      <>
        <p>خذ كلمة: <bdi>أب</bdi></p>
        <div className="lesson-eight-triple">
          {threeForms.map((item) => (
            <article key={item.form}>
              <h3><bdi>{item.form}</bdi></h3>
              <p>{item.state}</p>
              <p className="lesson-eight-featured lesson-eight-featured--small"><bdi>{item.sentence}</bdi></p>
              <p>وعلامة إعرابه <strong>{item.sign}</strong>.</p>
            </article>
          ))}
        </div>
        <p>إذن:</p>
        <div className="lesson-eight-mapping">
          <p><bdi>أبو</bdi> <span aria-hidden="true">←</span> رفع</p>
          <p><bdi>أبا</bdi> <span aria-hidden="true">←</span> نصب</p>
          <p><bdi>أبي</bdi> <span aria-hidden="true">←</span> جر</p>
        </div>
      </>
    )),

    step('why-change', '8. لماذا تتغير الكلمة؟', 'القاعدة الأساسية', '🔎', (
      <>
        <p>لأن موقعها في الجملة يتغير. قارن:</p>
        <p><strong>1.</strong> <bdi>جاءَ أبو محمدٍ.</bdi></p>
        <p>من الذي جاء؟ <strong>أبو محمدٍ.</strong> إذن هو فاعل، والفاعل مرفوع، فنقول: <bdi>أبو</bdi>.</p>
        <p><strong>2.</strong> <bdi>رأيتُ أبا محمدٍ.</bdi></p>
        <p>من الذي رأيته؟ <strong>أبا محمدٍ.</strong> وهو مفعول به، والمفعول به منصوب، فنقول: <bdi>أبا</bdi>.</p>
        <p><strong>3.</strong> <bdi>سلّمتُ على أبي محمدٍ.</bdi></p>
        <p>بعد حرف الجر <strong>على</strong> يأتي الاسم مجرورًا، فنقول: <bdi>أبي</bdi>.</p>
        <p>إذن:</p>
        <p className="lesson-eight-featured"><bdi>أبو ← أبا ← أبي</bdi></p>
        <WhyChangedActivity />
      </>
    )),

    step('name-father', '9. الاسم الأول: «أب»', 'الأسماء واحدًا واحدًا', '1️⃣', (
      <>
        <p>الرفع:</p>
        <p className="lesson-eight-featured"><bdi>جاءَ أبو أحمدَ.</bdi></p>
        <p>أبو: فاعل مرفوع بالواو.</p>
        <FullParsing lines={['أبو: فاعل مرفوع، وعلامة رفعه الواو نيابة عن الضمة؛ لأنه من الأسماء الخمسة، وهو مضاف.']} />
        <p>النصب:</p>
        <p className="lesson-eight-featured"><bdi>رأيتُ أبا أحمدَ.</bdi></p>
        <p>أبا: مفعول به منصوب بالألف.</p>
        <FullParsing lines={['أبا: مفعول به منصوب، وعلامة نصبه الألف نيابة عن الفتحة؛ لأنه من الأسماء الخمسة، وهو مضاف.']} />
        <p>الجر:</p>
        <p className="lesson-eight-featured"><bdi>ذهبتُ مع أبي أحمدَ.</bdi></p>
        <p>أبي: اسم مجرور بـ"مع"، وعلامة جره الياء.</p>
        <FullParsing lines={['أبي: اسم مجرور بـ"مع"، وعلامة جره الياء نيابة عن الكسرة؛ لأنه من الأسماء الخمسة، وهو مضاف.']} />
        <PlatformNote>
          <p>الإعراب الكامل مكتوب بصيغته المعتمدة في المشروع: الوظيفة + الحالة + العلامة + سببها.</p>
        </PlatformNote>
      </>
    )),

    step('name-brother', '10. الاسم الثاني: «أخ»', 'الأسماء واحدًا واحدًا', '2️⃣', (
      <>
        <p>نطبق القاعدة نفسها.</p>
        <p>الرفع:</p>
        <p className="lesson-eight-featured"><bdi>جاءَ أخو خالدٍ.</bdi></p>
        <p>أخو: مرفوع بالواو.</p>
        <FullParsing lines={['أخو: فاعل مرفوع، وعلامة رفعه الواو نيابة عن الضمة؛ لأنه من الأسماء الخمسة، وهو مضاف.']} />
        <p>النصب:</p>
        <p className="lesson-eight-featured"><bdi>رأيتُ أخا خالدٍ.</bdi></p>
        <p>أخا: منصوب بالألف.</p>
        <FullParsing lines={['أخا: مفعول به منصوب، وعلامة نصبه الألف نيابة عن الفتحة؛ لأنه من الأسماء الخمسة، وهو مضاف.']} />
        <p>الجر:</p>
        <p className="lesson-eight-featured"><bdi>تحدثتُ مع أخي خالدٍ.</bdi></p>
        <p>أخي: مجرور بالياء.</p>
        <FullParsing lines={['أخي: اسم مجرور بـ"مع"، وعلامة جره الياء نيابة عن الكسرة؛ لأنه من الأسماء الخمسة، وهو مضاف.']} />
        <p>إذن:</p>
        <p className="lesson-eight-featured"><bdi>أخو ← أخا ← أخي</bdi></p>
      </>
    )),

    step('name-ham', '11. الاسم الثالث: «حم»', 'الأسماء واحدًا واحدًا', '3️⃣', (
      <>
        <p>كلمة <strong>حم</strong> من الأسماء الخمسة.</p>
        <p>وتُستعمل في ألفاظ القرابة.</p>
        <p>مثل:</p>
        <p className="lesson-eight-featured"><bdi>جاءَ حمو العروسِ.</bdi></p>
        <p className="lesson-eight-featured"><bdi>رأيتُ حما العروسِ.</bdi></p>
        <p className="lesson-eight-featured"><bdi>سلّمتُ على حمي العروسِ.</bdi></p>
        <p>إذن:</p>
        <ul className="check-list">
          <li><bdi>حمو</bdi> ← مرفوع.</li>
          <li><bdi>حما</bdi> ← منصوب.</li>
          <li><bdi>حمي</bdi> ← مجرور.</li>
        </ul>
        <PlatformNote>
          <p>
            ملاحظة من المصدر: استعمال كلمة «حم» أقل شيوعًا في الكلام اليومي من «أب» و«أخ»، لكن من المهم
            تعلمها لأنها من الأسماء الخمسة.
          </p>
        </PlatformNote>
      </>
    )),

    step('name-fu', '12. الاسم الرابع: «فو»', 'الأسماء واحدًا واحدًا', '4️⃣', (
      <>
        <p><strong>فو</strong> بمعنى <strong>فم</strong>.</p>
        <p>مثال:</p>
        <p className="lesson-eight-featured"><bdi>هذا فو الطفلِ.</bdi></p>
        <p className="lesson-eight-featured"><bdi>نظرتُ إلى فِي الطفلِ.</bdi></p>
        <p>لكن هنا توجد ملاحظة مهمة جدًا.</p>
        <p>حتى تُعرب كلمة <strong>فو</strong> إعراب الأسماء الخمسة، يجب أن تكون <strong>خالية من الميم</strong>.</p>
        <p>أي:</p>
        <div className="lesson-eight-either">
          <p className="is-good"><bdi>فو</bdi> ✅ تدخل في الأسماء الخمسة.</p>
          <p className="is-bad"><bdi>فم</bdi> ❌ في باب الأسماء الخمسة.</p>
        </div>
        <p>مثال:</p>
        <p className="lesson-eight-featured"><bdi>هذا فمُ الطفلِ.</bdi></p>
        <p>هنا "فم" ليست من الأسماء الخمسة؛ لأنها تحتوي على الميم.</p>
        <FuOrFamActivity />
      </>
    )),

    step('name-dhu', '13. الاسم الخامس: «ذو»', 'الأسماء واحدًا واحدًا', '5️⃣', (
      <>
        <p><strong>ذو</strong> معناها:</p>
        <p className="lesson-eight-featured"><bdi>صاحب</bdi></p>
        <p>مثل:</p>
        <p className="lesson-eight-featured"><bdi>رجلٌ ذو أخلاقٍ.</bdi></p>
        <p>أي: رجلٌ <strong>صاحب أخلاق</strong>.</p>
        <p>مثال:</p>
        <p className="lesson-eight-featured"><bdi>جاءَ رجلٌ ذو علمٍ.</bdi></p>
        <p>ذو: مرفوعة بالواو.</p>
        <p>مثال:</p>
        <p className="lesson-eight-featured"><bdi>رأيتُ رجلًا ذا علمٍ.</bdi></p>
        <p>ذا: منصوبة بالألف.</p>
        <p>مثال:</p>
        <p className="lesson-eight-featured"><bdi>مررتُ برجلٍ ذي علمٍ.</bdi></p>
        <p>ذي: مجرورة بالياء.</p>
        <p>إذن:</p>
        <p className="lesson-eight-featured"><bdi>ذو ← ذا ← ذي</bdi></p>
        <DhuFillActivity />
      </>
    )),

    step('master-table', '14. جدول الأسماء الخمسة', 'الجدول الجامع', '📊', (
      <>
        <p>احفظ هذا الجدول جيدًا:</p>
        <FiveNamesTable />
        <p className="lesson-eight-hero-topic lesson-eight-hero-topic--inline">
          <span aria-hidden="true">⭐</span> قاعدة ذهبية:
        </p>
        <div className="lesson-eight-memory-key">
          <bdi>واو = رفع</bdi>
          <bdi>ألف = نصب</bdi>
          <bdi>ياء = جر</bdi>
        </div>
        <GoldenRule text="الأسماء الخمسة ترفع بالواو، وتنصب بالألف، وتجر بالياء." />
      </>
    )),

    step('not-always', '15. انتبه! ليست دائمًا تُعرب بالحروف', 'الشروط', '⚠️', (
      <>
        <p>وهذه نقطة مهمة جدًا.</p>
        <p>لا يكفي أن ترى كلمة:</p>
        <p className="lesson-eight-featured"><bdi>أب</bdi></p>
        <p>فتقول مباشرة: "هذه من الأسماء الخمسة."</p>
        <p>بل يجب أن تتحقق من <strong>شروط معينة</strong>.</p>
        <p>لأن الأسماء الخمسة لا تُعرب بالحروف في جميع الحالات.</p>
      </>
    )),

    step('conditions-list', '16. شروط إعراب الأسماء الخمسة', 'الشروط', '📋', (
      <>
        <p>حتى تُعرب هذه الأسماء بالحروف، هناك شروط أساسية. سنأخذها تدريجيًا.</p>
        <Rule>الأسماء الخمسة تُرفع بالواو، وتُنصب بالألف، وتُجر بالياء — عند تحقق شروطها.</Rule>
        <ol className="numbered-list lesson-eight-conditions">
          <li>أن تكون <strong>مفردة</strong>.</li>
          <li>أن تكون <strong>مضافة</strong>.</li>
          <li><strong>ألا تكون مضافة إلى ياء المتكلم</strong>.</li>
          <li>في «فو»: <strong>حذف الميم</strong>.</li>
          <li>«ذو» تكون بمعنى <strong>صاحب</strong>.</li>
        </ol>
      </>
    )),

    step('condition-one', '17. الشرط الأول: أن تكون مفردة', 'الشروط', '🔹', (
      <>
        <p>أي ليست مثنى ولا جمعًا.</p>
        <p>مثل:</p>
        <p className="lesson-eight-featured"><bdi>أبو الطالبِ.</bdi></p>
        <p>هذا مفرد.</p>
        <p>لكن إذا قلنا:</p>
        <p className="lesson-eight-featured"><bdi>أبوانِ</bdi></p>
        <p>فهي مثنى، وليست من باب الأسماء الخمسة في هذه الصورة.</p>
        <p>مثال:</p>
        <p className="lesson-eight-featured"><bdi>جاءَ أبوانِ.</bdi></p>
        <p>"أبوان" تعرب إعراب المثنى: مرفوع بالألف.</p>
        <p>وليس: مرفوعًا بالواو لأنه من الأسماء الخمسة.</p>
      </>
    )),

    step('condition-two', '18. الشرط الثاني: أن تكون مضافة', 'الشروط', '🔗', (
      <>
        <p>أي أن يأتي بعدها اسم أو شيء يكمّل معناها.</p>
        <p>مثل:</p>
        <p className="lesson-eight-featured"><bdi>أبو الطالبِ</bdi></p>
        <p><bdi>أبو</bdi> + <bdi>الطالب</bdi>.</p>
        <p className="lesson-eight-featured"><bdi>أخو محمدٍ</bdi></p>
        <p><bdi>أخو</bdi> + <bdi>محمد</bdi>.</p>
        <p className="lesson-eight-featured"><bdi>ذو علمٍ</bdi></p>
        <p><bdi>ذو</bdi> + <bdi>علم</bdi>.</p>
        <p>لاحظ: <bdi>أبو</bdi> وحدها لا تكفي هنا لتطبيق قاعدة الأسماء الخمسة.</p>
      </>
    )),

    step('idaafa', '19. ماذا يعني «مضافة»؟', 'الشروط', '🧩', (
      <>
        <p>سنتعلم المضاف والمضاف إليه بالتفصيل لاحقًا، لكن نحتاج الآن فكرة بسيطة.</p>
        <p>في: <bdi>أبو الطالبِ</bdi> لدينا:</p>
        <ul className="check-list">
          <li><bdi>أبو</bdi> ← مضاف.</li>
          <li><bdi>الطالبِ</bdi> ← مضاف إليه.</li>
        </ul>
        <p>وفي: <bdi>أخو خالدٍ</bdi></p>
        <ul className="check-list">
          <li><bdi>أخو</bdi> ← مضاف.</li>
          <li><bdi>خالدٍ</bdi> ← مضاف إليه.</li>
        </ul>
        <p>وفي: <bdi>ذو علمٍ</bdi></p>
        <ul className="check-list">
          <li><bdi>ذو</bdi> ← مضاف.</li>
          <li><bdi>علمٍ</bdi> ← مضاف إليه.</li>
        </ul>
        <p>سنخصص درسًا كاملًا لاحقًا لـ <strong>المضاف والمضاف إليه</strong>.</p>
      </>
    )),

    step('condition-three', '20. الشرط الثالث: ألا تكون مضافة إلى ياء المتكلم', 'الشروط', '🚧', (
      <>
        <p>إذا أضيف الاسم إلى ياء المتكلم، يتغير الحكم.</p>
        <p>مثل: <bdi>أبي</bdi></p>
        <p>في: <bdi>جاءَ أبي.</bdi></p>
        <p>هنا لا نقول: "أبي مرفوع بالواو."</p>
        <p>بل نقول:</p>
        <FullParsing lines={['أبي: فاعل مرفوع، وعلامة رفعه ضمة مقدرة.']} />
        <p>وهذه نقطة متقدمة قليلًا، لذلك لا تقلق إذا بدت جديدة.</p>
        <p>سنعود إليها بالتفصيل عندما ندرس <strong>المضاف والمضاف إليه</strong> والإعراب المتقدم.</p>
      </>
    )),

    step('condition-four', '21. الشرط الرابع الخاص بـ«فو»', 'الشروط', '✂️', (
      <>
        <p>حتى تُعرب <strong>فو</strong> إعراب الأسماء الخمسة، يجب حذف الميم.</p>
        <p>مثل: <bdi>هذا فو الطفلِ.</bdi></p>
        <p>أما: <bdi>هذا فمُ الطفلِ.</bdi></p>
        <p>فكلمة "فم" لا تدخل في الأسماء الخمسة.</p>
      </>
    )),

    step('condition-five', '22. ماذا عن «ذو»؟', 'الشروط', '🎯', (
      <>
        <p>هناك شرط مهم جدًا:</p>
        <p><strong>ذو</strong> التي تدخل في الأسماء الخمسة يجب أن تكون بمعنى:</p>
        <p className="lesson-eight-featured"><bdi>صاحب</bdi></p>
        <p>مثل: <bdi>رجلٌ ذو مالٍ.</bdi></p>
        <p>أي: رجلٌ صاحب مال.</p>
        <p>أما إذا استُعملت كلمة أخرى تشبهها في اللفظ ولكن ليست بهذا المعنى، فلا نطبق عليها القاعدة نفسها.</p>
      </>
    )),

    step('why-conditions', '23. لماذا نحتاج هذه الشروط؟', 'الشروط', '🧠', (
      <>
        <p>لأننا لا نريد أن يحفظ الطالب:</p>
        <p className="lesson-eight-quote">أب = دائمًا يرفع بالواو.</p>
        <p>هذا غير دقيق.</p>
        <p>بل نريد أن يتعلم:</p>
        <p className="lesson-eight-quote">إذا تحققت شروط الأسماء الخمسة، تُعرب بالحروف.</p>
        <p>وهذا فرق مهم جدًا بين <strong>الحفظ</strong> و<strong>الفهم</strong>.</p>
      </>
    )),

    step('compare-dual', '24. مقارنة مهمة جدًا: الأسماء الخمسة والمثنى', 'المقارنات', '⚖️', (
      <>
        <p>قارن:</p>
        <div className="lesson-eight-compare">
          <article>
            <h3><bdi>جاءَ أبو الطالبِ.</bdi></h3>
            <ul className="check-list">
              <li>"أبو": اسم من الأسماء الخمسة.</li>
              <li>فاعل.</li>
              <li>مرفوع.</li>
              <li>علامة رفعه الواو.</li>
            </ul>
          </article>
          <article>
            <h3><bdi>جاءَ أبوانِ.</bdi></h3>
            <ul className="check-list">
              <li>"أبوان": مثنى.</li>
              <li>مرفوع.</li>
              <li>علامة رفعه الألف.</li>
            </ul>
          </article>
        </div>
        <p>إذن لا تنظر إلى معنى الكلمة فقط.</p>
        <p>بل انظر إلى <strong>صورتها وموقعها في الجملة</strong>.</p>
        <FiveOrDualActivity />
      </>
    )),

    step('compare-cases', '25. مقارنة الرفع والنصب والجر', 'المقارنات', '🔁', (
      <>
        <p>لنأخذ كلمة "أب":</p>
        <p>الرفع:</p>
        <p className="lesson-eight-featured"><bdi>حضرَ أبو عليٍّ.</bdi></p>
        <p>أبو ← بالواو.</p>
        <p>النصب:</p>
        <p className="lesson-eight-featured"><bdi>رأيتُ أبا عليٍّ.</bdi></p>
        <p>أبا ← بالألف.</p>
        <p>الجر:</p>
        <p className="lesson-eight-featured"><bdi>ذهبتُ مع أبي عليٍّ.</bdi></p>
        <p>أبي ← بالياء.</p>
        <div className="lesson-eight-mapping">
          <p><bdi>حضرَ أبو عليٍّ.</bdi> <span aria-hidden="true">←</span> الواو في الرفع</p>
          <p><bdi>رأيتُ أبا عليٍّ.</bdi> <span aria-hidden="true">←</span> الألف في النصب</p>
          <p><bdi>ذهبتُ مع أبي عليٍّ.</bdi> <span aria-hidden="true">←</span> الياء في الجر</p>
        </div>
      </>
    )),

    step('worked-1-3', '26. أمثلة محلولة: 1–3', 'الأمثلة المحلولة', '💬', (
      <>
        {workedExamples.slice(0, 3).map((example) => (
          <WorkedCard key={example.number} number={example.number} />
        ))}
      </>
    )),

    step('worked-4-6', '27. أمثلة محلولة: 4–6', 'الأمثلة المحلولة', '💬', (
      <>
        {workedExamples.slice(3, 6).map((example) => (
          <WorkedCard key={example.number} number={example.number} />
        ))}
      </>
    )),

    step('worked-7-9', '28. أمثلة محلولة: 7–9', 'الأمثلة المحلولة', '💬', (
      <>
        {workedExamples.slice(6, 9).map((example) => (
          <WorkedCard key={example.number} number={example.number} />
        ))}
      </>
    )),

    step('application', '29. النشاط التطبيقي', 'النشاط التطبيقي', '📝', (
      <>
        <p>استخرج الاسم من الأسماء الخمسة، ثم حدد حالته الإعرابية:</p>
        <ol className="numbered-list">
          {applicationItems.map((item) => (
            <li key={item.prompt}><bdi>{item.prompt}</bdi></li>
          ))}
        </ol>
        <p>حاول أن تحل بنفسك قبل رؤية الحل.</p>
        <ChoiceActivity
          id="lesson8-application"
          title="طبق بنفسك: استخرج الاسم وحدد حالته وعلامته"
          instruction="حدد الاسم من الأسماء الخمسة، وحالته الإعرابية، وعلامة إعرابه، ثم تحقق من إجابتك."
          rows={applicationItems.map((item) => ({
            prompt: item.prompt,
            fields: [
              { label: 'الاسم من الأسماء الخمسة', options: nameOptionsFor(item.word), answer: item.word },
              { label: 'الحالة الإعرابية', options: ['مرفوع', 'منصوب', 'مجرور'], answer: item.state },
              { label: 'علامة الإعراب', options: ['الواو', 'الألف', 'الياء'], answer: item.sign },
            ],
          }))}
        />
      </>
    )),

    step('source-review-1', '30. مراجعة أسئلة المصدر 1–13', 'مراجعة أسئلة المصدر', '🧾', (
      <SourceReview from={1} to={13} />
    )),

    step('source-review-2', '31. مراجعة أسئلة المصدر 14–18', 'مراجعة أسئلة المصدر', '🧾', (
      <SourceReview from={14} to={18} />
    )),

    step('source-review-3', '32. مراجعة أسئلة المصدر 19–25', 'مراجعة أسئلة المصدر', '🧾', (
      <SourceReview from={19} to={25} />
    )),

    step('errors-1-3', '33. الأخطاء الشائعة: 1–3', 'الأخطاء الشائعة', '⚠️', (
      <>
        <div className="lesson-eight-errors">
          {commonErrors.slice(0, 3).map((error) => (
            <article key={error.number} className="lesson-eight-error">
              <h3>الخطأ {error.number}</h3>
              <p className="is-bad">❌ <del><bdi>{error.bad}</bdi></del></p>
              <p className="is-good">✅ <strong><bdi>{error.good}</bdi></strong></p>
              <p className="lesson-eight-error-reason">{error.reason}</p>
            </article>
          ))}
        </div>
        <FindErrorActivity />
      </>
    )),

    step('errors-4-6', '34. الأخطاء الشائعة: 4–6', 'الأخطاء الشائعة', '⚠️', (
      <div className="lesson-eight-errors">
        {commonErrors.slice(3).map((error) => (
          <article key={error.number} className="lesson-eight-error">
            <h3>الخطأ {error.number}</h3>
            <p className="is-bad">❌ <del><bdi>{error.bad}</bdi></del></p>
            <p className="is-good">✅ <strong><bdi>{error.good}</bdi></strong></p>
            <p className="lesson-eight-error-reason">{error.reason}</p>
          </article>
        ))}
      </div>
    )),

    step('summary', '35. الخلاصة', 'الخلاصة', '🧠', <OnePageSummary />),

    step('golden-key', '36. قاعدة سريعة للحفظ ومفتاح الحفظ', 'الخلاصة', '⭐', <GoldenKey />),

    step('advanced-challenge', '37. تحدي إضافي للطالب المتقدم', 'التحدي والواجب', '🏆', <AdvancedChallenge />),

    step('homework', '38. واجب الدرس', 'التحدي والواجب', '🏠', <Homework />),

    step('platform-test', '39. اختبار الدرس الثامن (٢٠ سؤالًا)', 'الاختبار الإلكتروني', '🏁', (
      <TestArea onSubmitted={setTestResult} onReset={() => setTestResult(null)} />
    )),

    step('solutions', '40. حلول الاختبار', 'الاختبار الإلكتروني', '📗', <SolutionsArea result={testResult} />),

    step('teacher', '41. منطقة خاصة بالمعلم', 'منطقة المعلم', '🔐', <TeacherArea />),
  ]

  return (
    <LessonFlow
      steps={steps}
      onProgressChange={onProgressChange}
      onFinish={onFinish}
      lessonTitle="الأسماء الخمسة"
      lessonNumber="٨"
      lessonEyebrow="الدرس الثامن"
    />
  )
}

function step(
  id: string,
  title: string,
  group: string,
  icon: string,
  content: ReactNode,
): LessonStepDefinition {
  return {
    id,
    title,
    shortTitle: title,
    group,
    icon,
    description: 'تعلّم بالتدرج، ثم طبّق ما فهمته.',
    render: () => content,
  }
}

/** بطاقة مثال محلول: تعرض خطوات المصدر ثم تكشف الإعراب الكامل عند الطلب. */
function WorkedCard({ number }: { number: number }) {
  const example = workedExamples[number - 1]
  const [open, setOpen] = useState(false)
  return (
    <article className="lesson-eight-worked">
      <h3>{example.title}</h3>
      <p className="lesson-eight-featured lesson-eight-featured--small"><bdi>{example.sentence}</bdi></p>
      <ul className="lesson-eight-worked-items">
        {example.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <button type="button" className="button button--ghost" onClick={() => setOpen((value) => !value)}>
        {open ? 'إخفاء الإعراب الكامل' : 'أظهر الإعراب الكامل'}
      </button>
      {open && <FullParsing lines={example.parsing} />}
    </article>
  )
}
