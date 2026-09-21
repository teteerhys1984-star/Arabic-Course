import { readFileSync } from 'node:fs'

const app = readFileSync('src/app/App.tsx', 'utf8')
const lesson = readFileSync('src/lessons/LessonTwo.tsx', 'utf8')
const registry = readFileSync('src/lessons/registry.ts', 'utf8')
const fullSource = `${app}\n${lesson}\n${registry}`
const failures = []

const requiredSource = [
  'الدرس الثاني: الجملة الاسمية',
  'المبتدأ والخبر',
  'أهداف الدرس',
  'أن يعرف الجملة الاسمية.',
  'أن يميّز الجملة الاسمية من الجملة الفعلية.',
  'أن يعرف المبتدأ والخبر.',
  'أن يحدد المبتدأ والخبر في الجملة.',
  'مرفوعان',
  'أن يكوّن جملًا اسمية بسيطة.',
  'أن يميّز بين الجملة الاسمية التي تتكوّن من كلمتين والجملة التي يكون خبرها أكثر من كلمة.',
  'أن يطبق ذلك في القراءة والكتابة والإعراب البسيط.',
  'ما الجملة؟',
  'اسم',
  'فعل',
  'حرف',
  'وعندما نرتب الكلمات بطريقة صحيحة بحيث تعطينا معنى مفيدًا، نحصل على',
  'الطالبُ مجتهدٌ.',
  'ذهبَ خالدٌ إلى المدرسة.',
  'السماءُ صافيةٌ.',
  'ما الجملة الاسمية؟',
  'الجملة الاسمية هي الجملة التي تبدأ باسم.',
  'الشجرةُ كبيرةٌ.',
  'المعلمةُ نشيطةٌ.',
  'الكتابُ مفيدٌ.',
  'البيتُ واسعٌ.',
  'الجملة والكلمة الأولى',
  'الجملة الاسمية تبدأ باسم.',
  'ما المبتدأ؟',
  'الاسم الذي تبدأ به الجملة الاسمية، ونتحدث عنه في الجملة.',
  'الحديقةُ جميلةٌ.',
  'ما الخبر؟',
  'الكلمة أو الكلمات التي تخبرنا بشيء عن المبتدأ وتُكمل معنى الجملة.',
  'أسهل طريقة لاكتشاف المبتدأ والخبر',
  'الولدُ سعيدٌ.',
  'المبتدأ والخبر مرفوعان',
  'الطالبُ: مبتدأ مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.',
  'مجتهدٌ: خبر مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.',
  'لماذا نقول "مبتدأ" و"خبر"؟',
  'سامرٌ مجتهدٌ.',
  'المبتدأ = عمّن أو عمّا نتحدث.',
  'الخبر = ماذا نقول عنه.',
  'أمثلة سهلة جدًا',
  'الكتابُ: مبتدأ.',
  'مفيدٌ: خبر.',
  'انتبه: ليس كل جملة فيها اسم جملة اسمية',
  'كتبَ الطالبُ الدرسَ.',
  'يقرأُ سامرٌ الكتابَ.',
  'بماذا بدأت الجملة؟',
  'الفرق بين الجملة الاسمية والجملة الفعلية',
  'اسم ← جملة اسمية',
  'فعل ← جملة فعلية',
  'الخبر ليس دائمًا كلمة واحدة',
  'الطالبُ في المدرسةِ.',
  'في المدرسةِ = خبر',
  'الكتابُ على الطاولةِ.',
  'على الطاولةِ = خبر',
  'أمثلة متنوعة على الجملة الاسمية',
  'السماءُ زرقاءُ.',
  'محمدٌ مجتهدٌ.',
  'الأسدُ قويٌّ.',
  'الشجرةُ عاليةٌ.',
  'القلمُ جديدٌ.',
  'التوافق بين المبتدأ والخبر',
  'الولدُ نشيطٌ.',
  'البنتُ نشيطةٌ.',
  'المعلمُ ماهرٌ.',
  'المعلمةُ ماهرةٌ.',
  'الطلابُ مجتهدون.',
  'كيف أعرف أن الجملة تحتاج إلى خبر؟',
  'الطالبُ...',
  'السماءُ...',
  'لعبة "من؟ وماذا عنه؟"',
  'من؟ أو ماذا؟',
  'ماذا عنه؟',
  'أخطاء شائعة',
  'الخطأ الأول: اعتبار أول اسم في أي جملة مبتدأ',
  'الخطأ الثاني: الخلط بين المبتدأ والخبر',
  'الخطأ الثالث: الاعتقاد أن الخبر يجب أن يكون كلمة واحدة',
  'الخطأ الرابع: نسيان الضمة',
  'مهم للحفظ ⭐',
  'ثانيًا: أمثلة محلولة',
  'الجوُّ جميلٌ.',
  'يلعبُ الطفلُ.',
  'العصفورُ على الشجرةِ.',
  'الوردةُ جميلةٌ.',
  'ذهبَ خالدٌ إلى المدرسة.',
  'ثالثًا: نشاط تطبيقي',
  'النشاط الأول: اسمية أم فعلية؟',
  'ذهبَ أحمدُ إلى المدرسة.',
  'تكتبُ سارةُ واجبها.',
  'النشاط الثاني: استخرج المبتدأ والخبر',
  'القلمُ على الطاولةِ.',
  'المعلمةُ نشيطةٌ.',
  'النشاط الثالث: أكمل الجملة',
  'الطالبُ ............',
  'النشاط الرابع: كوّن جملة اسمية',
  'الشمس → الشمسُ مشرقةٌ.',
  'رابعًا: اختبار نهاية الدرس',
  'أي جملة مما يأتي جملة اسمية؟',
  'ضع صح أو خطأ',
  'استخرج المبتدأ والخبر من الجملة:',
  'أعرب ما تحته خط:',
  'رتّب الكلمات الآتية لتكوّن جملة اسمية:',
  'سؤال تفكير',
  'خامسًا: منطقة خاصة بالمعلم',
  'الإجابات النموذجية للنشاط التطبيقي',
  'الإجابات النموذجية لاختبار نهاية الدرس',
  'ملاحظات التصحيح للمعلم',
  'معيار إتقان الدرس',
  'الحصول على',
  '15/20',
  'إذا حصل على أقل من',
  'ثم إعادة اختبار قصير من 10 أسئلة قبل الانتقال إلى الدرس الثالث.',
  'ملخص الدرس للحفظ',
  'الجملة الاسمية:',
  'المبتدأ:',
  'الخبر:',
  'المبتدأ والخبر:',
  'اسم في البداية',
  'فعل في البداية',
]

for (const phrase of requiredSource) {
  if (!fullSource.includes(phrase)) failures.push(`Missing Lesson 2 source phrase: ${phrase}`)
}

if (!registry.includes("id: 'lesson-2'") || !registry.includes('الدرس الثاني: الجملة الاسمية')) {
  failures.push('Lesson 2 must be registered in the lesson registry.')
}
if (!app.includes('LessonTwo') || !app.includes("lesson.id === 'lesson-2'")) {
  failures.push('App must route lesson-2 to LessonTwo through LessonShell.')
}

const officialTestBlock = lesson.slice(lesson.indexOf('const officialQuestions'), lesson.indexOf('/**\n * Lesson 2 authoritative content'))
const questionCount = (officialTestBlock.match(/number:\s+\d+/g) ?? []).length
if (questionCount !== 20) failures.push(`Lesson 2 official question count is ${questionCount}; expected exactly 20.`)
for (let number = 1; number <= 20; number += 1) {
  if (!officialTestBlock.includes(`number: ${number}`)) failures.push(`Missing Lesson 2 official question ${number}.`)
}

const choiceQuestionCount = (officialTestBlock.match(/type:\s+'choice'/g) ?? []).length
const openQuestionCount = (officialTestBlock.match(/type:\s+'open'/g) ?? []).length
if (choiceQuestionCount !== 12) failures.push(`Lesson 2 must preserve 7 multiple-choice + 5 true/false questions; found ${choiceQuestionCount} objective questions.`)
if (openQuestionCount !== 8) failures.push(`Lesson 2 must preserve 8 open/extraction/parsing/thinking questions; found ${openQuestionCount}.`)

const requiredStepIds = [
  'intro',
  'objectives',
  'what-is-sentence',
  'nominal-sentence',
  'mubtada',
  'khabar',
  'easy-method',
  'raised',
  'names',
  'easy-examples',
  'warning',
  'comparison',
  'multiword-khabar',
  'varied-examples',
  'agreement',
  'needs-khabar',
  'who-what-game',
  'common-mistakes',
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
if (stepIdMatches.length !== 27) failures.push(`Lesson 2 must define exactly 27 sequential steps; found ${stepIdMatches.length}.`)
for (const id of requiredStepIds) {
  if (!stepIdMatches.includes(id)) failures.push(`Missing required Lesson 2 step: ${id}`)
}
if (!lesson.includes('LessonFlow')) failures.push('Lesson 2 must be delivered through LessonFlow, not a continuous document.')

const forbiddenPatterns = [
  { pattern: /SectionNav/, label: 'SectionNav' },
  { pattern: /scrollIntoView/, label: 'scrollIntoView' },
  { pattern: /IntersectionObserver/, label: 'IntersectionObserver' },
  { pattern: /split\(\/\(\\s\+\)\//, label: 'fragile mixed-direction whitespace token splitting' },
]
for (const { pattern, label } of forbiddenPatterns) {
  if (pattern.test(lesson)) failures.push(`Lesson 2 reintroduced forbidden architecture/bidi primitive: ${label}.`)
}

const teacherRequired = [
  'النشاط الأول',
  'النشاط الثاني',
  'النشاط الثالث',
  'النشاط الرابع',
  'أولًا: الاختيار من متعدد',
  'ثانيًا: صح أو خطأ',
  'ثالثًا: الاستخراج',
  'رابعًا: الإعراب والتطبيق',
  'إذا أخطأ الطالب في تحديد نوع الجملة:',
  'إذا خلط بين المبتدأ والخبر:',
  'إذا اعتبر كل اسم مبتدأ:',
  'إذا لم يفهم الخبر:',
]
for (const phrase of teacherRequired) {
  if (!lesson.includes(phrase)) failures.push(`Missing Lesson 2 teacher/reference phrase: ${phrase}`)
}

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}
console.log(`Lesson 2 source audit passed: ${requiredSource.length} required phrases, 27 sequential steps, 20 official questions, teacher answers/notes/mastery/remediation, and source-ending summary formulas.`)
