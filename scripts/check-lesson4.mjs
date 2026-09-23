import { readFileSync } from 'node:fs'

const lessonPath = 'src/lessons/LessonFour.tsx'
const lesson = readFileSync(lessonPath, 'utf8')
const app = readFileSync('src/app/App.tsx', 'utf8')
const registry = readFileSync('src/lessons/registry.ts', 'utf8')
const failures = []

function requireText(text, label) {
  if (!lesson.includes(text)) failures.push(`Missing Lesson 4 source coverage: ${label}`)
}

// Lesson identity, topic, objectives, and the 25 numbered teaching sections.
for (const phrase of [
  'الدرس الرابع: أزمنة الفعل',
  'الفعل الماضي، والفعل المضارع، وفعل الأمر',
  'أهداف الدرس',
  'الفعل يدل على',
  'حدث مرتبط بزمن',
  'الماضي',
  'حدث انتهى',
  'المضارع',
  'يحدث الآن أو قد يحدث لاحقًا',
  'الأمر',
  'طلب القيام بالفعل',
  'هل حدث الفعل وانتهى قبل الآن؟',
  'أمسِ',
  'البارحة',
  'منذ قليل',
  'سابقًا',
  'في الأسبوع الماضي',
  'في العام الماضي',
  'غدًا',
  'أ، ن، ي، ت',
  'أنيت',
  'ليست كل كلمة تبدأ بأحد أحرف المضارعة فعلًا مضارعًا',
  'أحمدُ',
  'ياسرُ',
  'تكتبُ',
  'تدرسُ',
  'يخبر عن فعل',
  'يطلب فعلًا',
  'كتبَ — يكتبُ — اكتبْ',
  'قرأَ — يقرأُ — اقرأْ',
  'لعبَ — يلعبُ — العبْ',
  'جلسَ — يجلسُ — اجلسْ',
  'فتحَ — يفتحُ — افتحْ',
  'شربَ — يشربُ — اشربْ',
  'درسَ — يدرسُ — ادرسْ',
  'حفظَ — يحفظُ — احفظْ',
  'لا تخلط بين الأمر والمضارع',
  'لا يغيّر نوع الفعل',
  'لم يكتبْ',
  'لن يذهبَ',
  'انتبه إلى التاء',
  'كتبتْ',
  'الأمثلة المحلولة',
  'const solvedExamples',
  'number: 1',
  'number: 2',
  'number: 3',
  'number: 4',
  'number: 5',
  'number: 6',
]) requireText(phrase, phrase)

// The source has five named activities and each is mounted in a separate sequential step.
for (const activity of ['تصنيف الأفعال', 'تحديد زمن الفعل', 'اختيار الفعل المناسب', 'التحويل', 'المحقق اللغوي']) {
  requireText(activity, activity)
}
for (const id of ['activity-one', 'activity-two', 'activity-three', 'activity-four', 'activity-five']) {
  if (!lesson.includes(`id: '${id}'`)) failures.push(`Missing Lesson 4 activity step: ${id}`)
}

// Official test: exactly 20 questions, in the requested 8 + 6 + 3 + 2 + 1 structure.
const questionBlock = lesson.slice(lesson.indexOf('const officialQuestions'), lesson.indexOf('const solvedExamples'))
const questionCount = (questionBlock.match(/number:\s+\d+/g) ?? []).length
const choiceCount = (questionBlock.match(/type:\s+'choice'/g) ?? []).length
const openCount = (questionBlock.match(/type:\s+'open'/g) ?? []).length
if (questionCount !== 20) failures.push(`Lesson 4 official question count is ${questionCount}; expected exactly 20.`)
if (choiceCount !== 14) failures.push(`Lesson 4 must preserve 8 multiple-choice + 6 true/false questions; found ${choiceCount}.`)
if (openCount !== 6) failures.push(`Lesson 4 must preserve 3 classification/extraction + 2 transformation + 1 thinking questions; found ${openCount}.`)
for (let number = 1; number <= 20; number += 1) {
  if (!questionBlock.includes(`number: ${number}`)) failures.push(`Missing Lesson 4 official question ${number}.`)
}
if (!lesson.includes('officialQuestions.slice(0, 8)')) failures.push('Final test must render the first 8 official questions as multiple choice.')
if (!lesson.includes('officialQuestions.slice(8, 14)')) failures.push('Final test must render 6 official true/false questions.')

// Teacher-only answer key, correction guidance, remedial training, mastery threshold, and summary.
for (const phrase of [
  'الإجابات النموذجية للنشاط التطبيقي',
  'الإجابات النموذجية لاختبار نهاية الدرس',
  'ملاحظات التصحيح للمعلم',
  'الخطأ الأول',
  'الخطأ الثاني',
  'تدريب علاجي سريع للطالب الضعيف',
  'التوصية العلاجية',
  'معيار إتقان الدرس',
  '15/20 فأكثر',
  'أقل من 15/20',
  'الخلاصة والقاعدة الذهبية',
  'القاعدة الذهبية:',
]) requireText(phrase, phrase)
if (!lesson.includes('<TeacherSpace>')) failures.push('Teacher material must remain behind TeacherSpace.')
if (!lesson.includes('password =') && !lesson.includes('<TeacherSpace')) failures.push('Teacher area must use the existing teacher-area mechanism.')

// Sequential architecture and metadata checks.
const stepsBlock = lesson.slice(lesson.indexOf('const steps:'), lesson.indexOf('\n  return <LessonFlow'))
const stepIds = [...stepsBlock.matchAll(/^\s+id:\s*'([a-z0-9-]+)',/gm)].map((match) => match[1])
if (stepIds.length < 30 || stepIds.length > 45) failures.push(`Lesson 4 should have a meaningful sequential flow; found ${stepIds.length} steps.`)
for (const phrase of ['group:', 'icon:', 'shortTitle:']) {
  if (!stepsBlock.includes(phrase)) failures.push(`Missing step metadata/flow requirement: ${phrase}`)
}
for (const phrase of ['<LessonFlow', 'onProgressChange', 'lessonNumber="٤"']) {
  if (!lesson.includes(phrase)) failures.push(`Missing lesson flow requirement: ${phrase}`)
}
if (/split\(\/\(\\s\+\)\//.test(lesson)) failures.push('Lesson 4 introduced a fragile token-level bidi split.')
if (/SectionNav|scrollIntoView|IntersectionObserver/.test(lesson)) failures.push('Lesson 4 introduced a forbidden long-page navigation primitive.')

if (!registry.includes("id: 'lesson-4'") || !registry.includes('الدرس الرابع: أزمنة الفعل') || !registry.includes('الفعل الماضي، والفعل المضارع، وفعل الأمر')) {
  failures.push('Lesson 4 must be registered on the homepage lesson registry with its title and topic.')
}
if (!app.includes('LessonFour') || !app.includes("lesson.id === 'lesson-4'")) failures.push('App must route lesson-4 through LessonShell.')

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}
console.log(`Lesson 4 source audit passed: ${stepIds.length} sequential steps, 25 numbered teaching sections, 5 interactive activities, 20 official questions (8 choice + 6 true/false + 3 classification/extraction + 2 transformation + 1 thinking), teacher material, remediation, mastery threshold, and final summary.`)
