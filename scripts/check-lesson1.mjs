import { readFileSync } from 'node:fs'

const app = readFileSync('src/app/App.tsx', 'utf8')
const lesson = readFileSync('src/lessons/LessonOne.tsx', 'utf8')
const registry = readFileSync('src/lessons/registry.ts', 'utf8')
const fullSource = `${app}\n${lesson}\n${registry}`
const failures = []
const requiredSource = [
  'الدرس الأول: أقسام الكلام',
  'الاسم والفعل والحرف',
  'الهدف من الدرس',
  'أولاً: ما هو الكلام؟',
  'ذهبَ الطالبُ إلى المدرسةِ.',
  'في المدرسةِ...',
  'الكلام المفيد يتكون من كلمات مرتبة تعطي معنى كاملًا.',
  'القسم الأول: الاسم',
  'إنسان، حيوان، نبات، جماد، مكان، زمان، صفة',
  'العلامة الأولى: دخول (الـ) التعريف',
  'الـ يكتب',
  'الـ ذهب',
  'العلامة الثانية: التنوين',
  'تنوين الضم',
  'تنوين الفتح',
  'تنوين الكسر',
  'العلامة الثالثة: دخول حرف الجر',
  'من – إلى – عن – على – في – الباء – الكاف – اللام',
  'العلامة الرابعة: النداء',
  'خلاصة علامات الاسم',
  'القسم الثاني: الفعل',
  'أنواع الفعل',
  'الفعل الماضي',
  'أمسِ سافرَ والدي.',
  'الفعل المضارع',
  'أ – ن – ي – ت',
  'أنيت',
  'أ = أكتب',
  'ن = نكتب',
  'ي = يكتب',
  'ت = تكتب',
  'ثالثًا: فعل الأمر',
  'مقارنة بين أنواع الفعل',
  'القسم الثالث: الحرف',
  'في البيت.',
  'من المدرسة.',
  'إلى السوق.',
  'كيف أميز بين أقسام الكلام؟',
  'كتاب – ذهب – في – مدرسة – يقرأ – إلى',
  'ذهبَ الطالبُ إلى المدرسةِ.',
  'لعبَ.',
  'يكتبُ.',
  'اذهبْ.',
  'لعبة المحقق اللغوي',
  'كتاب – يركض – في – شجرة – اكتب – إلى – مدرسة – لعب – يقرأ – يا',
  'مجموعة الأسماء',
  'مجموعة الأفعال',
  'مجموعة الحروف',
  'تحدي 5 ثوانٍ',
  'ملخص الدرس للحفظ',
  'اختبار نهاية الدرس',
  'منطقة خاصة بالمعلم',
  'الإجابات النموذجية',
  'تصحيح السؤال 8',
  'تصحيح السؤال 10',
  'الأخطاء المتوقعة عند الطالب',
  'معيار إتقان الدرس',
]

for (const phrase of requiredSource) {
  if (!fullSource.includes(phrase)) failures.push(`Missing source phrase: ${phrase}`)
}

const officialTestBlock = lesson.slice(lesson.indexOf('const officialQuestions'), lesson.indexOf('const detectiveWords'))
const questionCount = (officialTestBlock.match(/number:\s+\d+/g) ?? []).length
if (questionCount !== 20) failures.push(`Official question count is ${questionCount}; expected exactly 20.`)
for (let number = 1; number <= 20; number += 1) {
  if (!officialTestBlock.includes(`number: ${number}`)) failures.push(`Missing official question ${number}.`)
}

// Lesson 1 must remain exactly 19 sequential steps, delivered one at a time through
// LessonFlow (never as one continuous long document).
const requiredStepIds = [
  'intro',
  'lesson-overview',
  'speech',
  'parts',
  'noun',
  'noun-signs',
  'verb',
  'past',
  'present',
  'imperative',
  'particle',
  'classification',
  'worked-examples',
  'detective',
  'challenge',
  'summary',
  'final-test',
  'teacher-space',
  'wrap-up',
]
const stepIdMatches = [...lesson.matchAll(/^\s+id:\s*'([a-z-]+)',/gm)].map((match) => match[1])
if (stepIdMatches.length !== 19) {
  failures.push(`Lesson 1 must define exactly 19 sequential steps; found ${stepIdMatches.length}.`)
}
for (const id of requiredStepIds) {
  if (!stepIdMatches.includes(id)) failures.push(`Missing required Lesson 1 step: ${id}`)
}
if (!lesson.includes('LessonFlow')) {
  failures.push('Lesson 1 must be delivered through LessonFlow (sequential steps), not a continuous document.')
}

// Course-wide rule: no WhatsApp/contact presentation may reappear in any lesson.
// The instructor attribution is the sole, narrowly scoped plain-text exception requested
// by the course owner; it is never a link, button, or contact block.
const instructorCredit = 'المهندس سومر شاهين: 0930215022'
const sourceWithoutInstructorCredit = fullSource.split(instructorCredit).join('')
const forbiddenContact = [
  'تواصل عبر واتساب',
  'للاستفسار أو متابعة الدرس، تواصل عبر الرقم التالي.',
  'wa.me',
  '0930215022',
  'whatsapp',
]
for (const phrase of forbiddenContact) {
  if (sourceWithoutInstructorCredit.toLowerCase().includes(phrase.toLowerCase())) {
    failures.push(`Forbidden WhatsApp/contact content is still present: ${phrase}`)
  }
}

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}
console.log(`Lesson 1 source audit passed: ${requiredSource.length} required phrases, 20 official questions, and no WhatsApp/contact block.`)
