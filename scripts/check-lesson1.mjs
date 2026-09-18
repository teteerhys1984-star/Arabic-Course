import { readFileSync } from 'node:fs'

const app = readFileSync('src/app/App.tsx', 'utf8')
const lesson = readFileSync('src/lessons/LessonOne.tsx', 'utf8')
const fullSource = `${app}\n${lesson}`
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

const expectedContact = 'href="https://wa.me/963930215022"'
if (!lesson.includes(expectedContact)) failures.push('WhatsApp destination is incorrect or missing.')
if ((lesson.match(/0930215022/g) ?? []).length !== 2) failures.push('The visible WhatsApp number must occur exactly twice in LessonOne.tsx.')

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}
console.log(`Lesson 1 source audit passed: ${requiredSource.length} required phrases, 20 official questions, and the exact WhatsApp contact.`)
