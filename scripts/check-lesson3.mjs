import { readFileSync } from 'node:fs'

const app = readFileSync('src/app/App.tsx', 'utf8')
const lesson = readFileSync('src/lessons/LessonThree.tsx', 'utf8')
const registry = readFileSync('src/lessons/registry.ts', 'utf8')
const fullSource = `${app}\n${lesson}\n${registry}`
const failures = []

const requiredSource = [
  // Lesson identity and objectives.
  'الدرس الثالث: الجملة الفعلية',
  'الفعل والفاعل والمفعول به',
  'أهداف الدرس',
  'أن يعرف الجملة الفعلية.',
  'أن يميّز الجملة الفعلية من الجملة الاسمية.',
  'أن يحدد الفعل في الجملة.',
  'أن يعرف الفاعل ويحدده.',
  'أن يعرف المفعول به ويحدده.',
  'أن يفرّق بين الفاعل والمفعول به.',
  'أن يكوّن جملًا فعلية بسيطة.',
  'أن يعرب الفعل والفاعل والمفعول به إعرابًا مبسطًا.',
  // 1. Recap from Lesson 2.
  'تذكّر من الدرس السابق',
  'الطالبُ مجتهدٌ.',
  'الطالبُ: مبتدأ',
  'مجتهدٌ: خبر',
  'كتبَ الطالبُ الدرسَ.',
  // 2. Definition of the verbal sentence.
  'ما الجملة الفعلية؟',
  'الجملة الفعلية هي الجملة التي تبدأ بفعل.',
  'كتبَ سامرٌ الدرسَ.',
  'قرأَ خالدٌ الكتابَ.',
  'شربَ الطفلُ الحليبَ.',
  'يركضُ الولدُ.',
  'زرعَ الفلاحُ الشجرةَ.',
  'افتحْ البابَ.',
  'الجملة الفعلية تبدأ بفعل.',
  // 3. What is a verb.
  'ما الفعل؟',
  'حدث أو عمل مرتبط بزمن',
  'فعل ماضٍ',
  'فعل مضارع',
  'فعل أمر',
  'وسنتوسع في أزمنة الفعل في الدرس الرابع.',
  // 4–6. The subject and its case.
  'ما الفاعل؟',
  'الشخص أو الشيء الذي قام بالفعل.',
  'مَن الذي كتب؟',
  'سامرٌ = فاعل.',
  'مَن الذي فعل؟',
  'ما الذي قام بالفعل؟',
  'لعبَ الطفلُ بالكرة.',
  'الطفلُ: فاعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره.',
  'طارَ العصفورُ.',
  'العصفورُ: فاعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره.',
  'نجحتِ الطالبةُ.',
  'الطالبةُ: فاعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره.',
  'الفاعل مرفوع.',
  'فاعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره.',
  // 7–9. The object and its case.
  'ما المفعول به؟',
  'المفعول به.',
  'قرأَ الطالبُ الكتابَ.',
  'ماذا قرأ الطالب؟',
  'الكتابَ = مفعول به.',
  'كيف أجد المفعول به؟',
  'ماذا فعل الفاعل؟',
  'كتبَ سامرٌ الرسالةَ.',
  'الرسالةَ = مفعول به.',
  'المفعول به منصوب.',
  'فاعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره.',
  'مفعول به منصوب وعلامة نصبه الفتحة الظاهرة على آخره.',
  // The harakat contrast: الطالبُ ← ضمة ← فاعل / الكتابَ والدرسَ ← فتحة ← مفعول به.
  'ضمة',
  'فتحة',
  // 10. Subject vs object.
  'الفرق بين الفاعل والمفعول به',
  'أكلَ الطفلُ التفاحةَ.',
  'التفاحةَ: مفعول به منصوب وعلامة نصبه الفتحة الظاهرة على آخره.',
  'الفاعل = الذي قام بالفعل.',
  'المفعول به = الذي وقع عليه الفعل.',
  // 11. The player/ball example: role by meaning, not word order.
  'مثال مهم جدًا',
  'ضربَ اللاعبُ الكرةَ.',
  'اللاعبُ = فاعل.',
  'الكرةَ = مفعول به.',
  'ضربتِ الكرةُ اللاعبَ.',
  'الكرةُ = فاعل.',
  'اللاعبَ = مفعول به.',
  'ترتيب الكلمات فقط',
  'من قام بالفعل ومن وقع عليه الفعل',
  // 12–14. Sentences with and without an object.
  'ليس كل جملة فعلية فيها مفعول به',
  'نامَ الطفلُ.',
  'ولا يوجد شيء وقع عليه فعل النوم.',
  'ركضَ الطفلُ.',
  'ركلَ الطفلُ الكرةَ.',
  'أمثلة بدون مفعول به',
  'ذهبَ خالدٌ.',
  'جلسَ الطفلُ.',
  'نامَ الرضيعُ.',
  'ابتسمَ أحمدُ.',
  'ركضَ اللاعبُ.',
  'سافرَ أبي.',
  'أمثلة فيها مفعول به',
  'كتبَ محمدٌ الرسالةَ.',
  'فتحَ سامرٌ البابَ.',
  'حملَ العاملُ الصندوقَ.',
  'رسمتْ سارةُ زهرةً.',
  // 15. The object is not always a human.
  'المفعول به لا يعني دائمًا إنسانًا',
  'ساعدَ محمدٌ صديقَه.',
  'أطعمَ الطفلُ القطَّ.',
  'سقى الفلاحُ الشجرةَ.',
  'فتحَ الطالبُ الكتابَ.',
  // 16–19. Three-step analysis and full worked walkthroughs.
  'كيف نحلل الجملة الفعلية؟',
  'ابحث عن الفعل.',
  'من قام بالفعل؟',
  'على ماذا وقع الفعل؟',
  'مثال كامل',
  'قرأَ خالدٌ القصةَ.',
  'القصةَ: مفعول به منصوب وعلامة نصبه الفتحة الظاهرة على آخره.',
  'قرأَ: فعل ماضٍ مبني على الفتحة الظاهرة على آخره.',
  'خالدٌ: فاعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره.',
  'القصةَ: مفعول به منصوب وعلامة نصبه الفتحة الظاهرة على آخره.',
  'زرعَ الفلاحُ القمحَ.',
  'القمحَ: مفعول به منصوب وعلامة نصبه الفتحة الظاهرة على آخره.',
  'مثال بدون مفعول به',
  'جلسَ الطالبُ.',
  // 20–21. Ending marks and word order.
  'انتبه إلى حركة آخر الكلمة',
  'لا تعتمد على الحركة وحدها؛',
  'ما الذي وقع عليه الفعل؟',
  'ماذا لو تغيّر ترتيب الجملة؟',
  'وسنتعلم في دروس لاحقة صورًا أخرى للجملة وترتيب عناصرها.',
  // 22. Comparison with Lesson 2.
  'مقارنة مهمة بين الدرس الثاني والثالث',
  'لا تخلط بين:',
  'المبتدأ يكون في الجملة الاسمية.',
  'والفاعل يكون مع الفعل في الجملة الفعلية عندما نحدد من قام بالفعل.',
  // Key rules to memorize.
  'أهم القواعد للحفظ ⭐',
  'الفاعل هو الذي قام بالفعل.',
  'المفعول به هو الذي وقع عليه الفعل.',
  'ليس كل فعل يحتاج إلى مفعول به.',
  'من الذي فعل؟',
  'ماذا فعل؟ أو على ماذا وقع الفعل؟',
  // All six solved examples.
  'ثانيًا: أمثلة محلولة',
  'المثال 1: كتبَ الطالبُ الدرسَ.',
  'المثال 2: شربَ الطفلُ الماءَ.',
  'المثال 3: نامَ الطفلُ.',
  'المثال 4: فتحَ أحمدُ البابَ.',
  'المثال 5: ركضَ اللاعبُ.',
  'المثال 6: زرعتْ سارةُ الوردةَ.',
  'الماءَ: مفعول به منصوب وعلامة نصبه الفتحة الظاهرة على آخره؛ لأنه الشيء الذي شربه الطفل.',
  'لا يوجد مفعول به.',
  // The four activities with their sentences.
  'ثالثًا: نشاط تطبيقي',
  'النشاط الأول: حدّد الفعل والفاعل',
  'كتبَ خالدٌ.',
  'لعبَ الطفلُ.',
  'جلسَ المعلمُ.',
  'النشاط الثاني: حدّد الفعل والفاعل والمفعول به',
  'قرأَ سامرٌ الكتابَ.',
  'فتحَ محمدٌ البابَ.',
  'النشاط الثالث: هل يوجد مفعول به؟',
  'يوجد مفعول به',
  'لا يوجد مفعول به',
  'كتبَ الطالبُ الواجبَ.',
  'أكلَ الولدُ التفاحةَ.',
  'جلسَ أحمدُ.',
  'فتحَ سامرٌ النافذةَ.',
  'النشاط الرابع: لعبة "المحقق اللغوي"',
  'غسلَ الطفلُ يديه.',
  'ما الفعل؟',
  // Final test.
  'رابعًا: اختبار نهاية الدرس',
  'أي جملة مما يأتي جملة فعلية؟',
  'أي كلمة مما يأتي مفعول به؟',
  'صح أو خطأ',
  'أعرب ما تحته خط:',
  'سؤال تفكير',
  'فتحَ الأبُ البابَ.',
  'اكتب القاعدة التي استخدمتها:',
  // Teacher area.
  'خامسًا: منطقة خاصة بالمعلم',
  'الإجابات النموذجية للنشاط التطبيقي',
  'الإجابات النموذجية لاختبار نهاية الدرس',
  'ملاحظة للمعلم: يكفي في هذا الدرس أن يتعرف الطالب إلى "يديه" بوصفها المفعول به',
  '"إلى المدرسةِ" جار ومجرور، وليس مفعولًا به. وسيتم شرح حروف الجر والاسم المجرور بالتفصيل في الدرس الثاني عشر.',
  'الطالبُ:</strong> فاعل مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.',
  'الدرسَ:</strong> مفعول به منصوب، وعلامة نصبه الفتحة الظاهرة على آخره.',
  'ملاحظات التصحيح للمعلم',
  'الخطأ الأول: الخلط بين الفاعل والمفعول به',
  'الخطأ الثاني: اعتبار كل اسم بعد الفعل مفعولًا به',
  'الخطأ الثالث: الاعتقاد أن كل جملة فعلية فيها مفعول به',
  'الخطأ الرابع: الاعتماد على ترتيب الكلمات فقط',
  'ماذا نام الطفل؟',
  'الاسم الثاني = فاعل.',
  'ماذا وقع عليه الفعل؟',
  // Remedial training table.
  'تدريب علاجي سريع للطالب الضعيف',
  'من فعل؟',
  'واجعل الطالب يملأ الجدول بنفسه.',
  // Mastery criteria and remediation recommendation.
  'معيار إتقان الدرس',
  'معرفة أن الجملة الفعلية تبدأ بفعل.',
  'تحديد الفاعل بسؤال "من الذي قام بالفعل؟".',
  'تحديد المفعول به بسؤال "ماذا وقع عليه الفعل؟".',
  'معرفة أن الفاعل مرفوع.',
  'معرفة أن المفعول به منصوب.',
  'معرفة أن بعض الجمل الفعلية لا تحتوي على مفعول به.',
  'التمييز بين الفاعل والمفعول به في جمل بسيطة.',
  '15/20',
  'الدرس الرابع',
  'أسئلة "من؟" و"ماذا؟".',
  // Final summary and golden rule.
  'ملخص الدرس للحفظ',
  'جملة تبدأ بفعل.',
  'من قام بالفعل.',
  'من أو ما وقع عليه الفعل.',
  'قاعدة ذهبية:',
  'ابحث عن الفعل أولًا، ثم اسأل: من قام بالفعل؟ فهذا هو الفاعل. ثم اسأل: ماذا فعل؟ فإن وُجد شيء وقع',
]

for (const phrase of requiredSource) {
  if (!fullSource.includes(phrase)) failures.push(`Missing Lesson 3 source phrase: ${phrase}`)
}

if (!registry.includes("id: 'lesson-3'") || !registry.includes('الدرس الثالث: الجملة الفعلية')) {
  failures.push('Lesson 3 must be registered in the lesson registry.')
}
if (!app.includes('LessonThree') || !app.includes("lesson.id === 'lesson-3'")) {
  failures.push('App must route lesson-3 to LessonThree through LessonShell.')
}

// Exactly 20 official final-test questions in the source-mandated categories.
const officialTestBlock = lesson.slice(
  lesson.indexOf('const officialQuestions'),
  lesson.indexOf('/**\n * Lesson 3 authoritative content'),
)
const questionCount = (officialTestBlock.match(/number:\s+\d+/g) ?? []).length
if (questionCount !== 20) failures.push(`Lesson 3 official question count is ${questionCount}; expected exactly 20.`)
for (let number = 1; number <= 20; number += 1) {
  if (!officialTestBlock.includes(`number: ${number}`)) failures.push(`Missing Lesson 3 official question ${number}.`)
}

const choiceQuestionCount = (officialTestBlock.match(/type:\s+'choice'/g) ?? []).length
const openQuestionCount = (officialTestBlock.match(/type:\s+'open'/g) ?? []).length
if (choiceQuestionCount !== 14)
  failures.push(`Lesson 3 must preserve 8 multiple-choice + 6 true/false questions; found ${choiceQuestionCount} objective questions.`)
if (openQuestionCount !== 6)
  failures.push(`Lesson 3 must preserve 3 extraction + 2 parsing + 1 thinking questions; found ${openQuestionCount} open questions.`)

// The sequential structure: exactly 30 steps, all major source sections represented.
const requiredStepIds = [
  'intro',
  'objectives',
  'recap',
  'verbal-sentence',
  'what-is-verb',
  'what-is-fael',
  'find-fael',
  'fael-raised',
  'what-is-mafool',
  'find-mafool',
  'mafool-nasb',
  'fael-vs-mafool',
  'player-ball',
  'no-object',
  'object-contrast',
  'object-types',
  'three-steps',
  'analysis-examples',
  'haraka',
  'order-change',
  'lesson2-comparison',
  'memorize-rules',
  'worked-examples',
  'activity-one',
  'activity-two',
  'activity-three',
  'activity-four',
  'final-test',
  'teacher-space',
  'summary',
]
const stepIdMatches = [...lesson.matchAll(/^\s+id:\s*'([a-z0-9-]+)',/gm)].map((match) => match[1])
if (stepIdMatches.length !== 30) failures.push(`Lesson 3 must define exactly 30 sequential steps; found ${stepIdMatches.length}.`)
for (const id of requiredStepIds) {
  if (!stepIdMatches.includes(id)) failures.push(`Missing required Lesson 3 step: ${id}`)
}
if (!lesson.includes('LessonFlow')) failures.push('Lesson 3 must be delivered through LessonFlow, not a continuous document.')

// The old long-page architecture and fragile bidi splitting must never come back.
const forbiddenPatterns = [
  { pattern: /SectionNav/, label: 'SectionNav' },
  { pattern: /scrollIntoView/, label: 'scrollIntoView' },
  { pattern: /IntersectionObserver/, label: 'IntersectionObserver' },
  { pattern: /split\(\/\(\\s\+\)\//, label: 'fragile mixed-direction whitespace token splitting' },
]
for (const { pattern, label } of forbiddenPatterns) {
  if (pattern.test(lesson)) failures.push(`Lesson 3 reintroduced forbidden architecture/bidi primitive: ${label}.`)
}

// Complete teacher/reference material.
const teacherRequired = [
  'النشاط الأول',
  'النشاط الثاني',
  'النشاط الثالث',
  'النشاط الرابع',
  'أولًا: الاختيار من متعدد',
  'ثانيًا: صح أو خطأ',
  'ثالثًا: الاستخراج',
  'رابعًا: الإعراب',
  'خامسًا: سؤال التفكير',
  'جدول التدريب العلاجي السريع',
  'كتبَ الطالبُ الدرسَ',
  'أكلَ الطفلُ التفاحةَ',
  'فتحَ الأبُ البابَ',
  'نامَ الطفلُ',
  'مستوى الإتقان المقترح:',
  'فأكثر',
]
for (const phrase of teacherRequired) {
  if (!lesson.includes(phrase)) failures.push(`Missing Lesson 3 teacher/reference phrase: ${phrase}`)
}

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}
console.log(
  `Lesson 3 source audit passed: ${requiredSource.length} required phrases, 30 sequential steps, ` +
    '20 official questions (8 choice + 6 true/false + 3 extraction + 2 parsing + 1 thinking), 4 activities, ' +
    'teacher answers/corrections/remedial-table/mastery/remediation, and the final summary with the golden rule.',
)
