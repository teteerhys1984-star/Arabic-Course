import { readFileSync, existsSync } from 'node:fs'

const app = readFileSync('src/app/App.tsx', 'utf8')
const lesson = readFileSync('src/lessons/LessonSix.tsx', 'utf8')
const registry = readFileSync('src/lessons/registry.ts', 'utf8')
const packageJson = readFileSync('package.json', 'utf8')
const failures = []
const fullSource = `${app}\n${lesson}\n${registry}`

function requirePhrase(phrase, label = phrase) {
  if (!fullSource.includes(phrase)) failures.push(`Missing Lesson 6 source phrase: ${label}`)
}

if (!existsSync('src/lessons/LessonSix.tsx')) failures.push('LessonSix.tsx is missing.')
if (!registry.includes("id: 'lesson-6'") || !registry.includes('الدرس السادس: علامات الإعراب الأصلية والفرعية')) failures.push('Lesson 6 is not registered.')
if (!app.includes('LessonSix') || !app.includes("lesson.id === 'lesson-6'")) failures.push('App does not route lesson-6 through LessonSix.')
if (!packageJson.includes('check:lesson6')) failures.push('package.json does not expose npm run check:lesson6.')
if (!lesson.includes('LessonFlow') || !lesson.includes('LessonStepDefinition')) failures.push('Lesson 6 must use the sequential LessonFlow architecture.')
if (!lesson.includes('<TeacherSpace>')) failures.push('Teacher material is not protected by TeacherSpace.')
if (/SectionNav|scrollIntoView|IntersectionObserver/.test(lesson)) failures.push('Lesson 6 contains a forbidden long-page navigation primitive.')

const requiredPhrases = [
  'الدرس السادس: علامات الإعراب الأصلية والفرعية',
  'أهداف الدرس',
  'فهم معنى الإعراب بطريقة مبسطة',
  'معرفة حالات الإعراب الأربع: الرفع والنصب والجر والجزم',
  'معرفة علامات الإعراب الأصلية: الضمة والفتحة والكسرة والسكون',
  'فهم الفرق بين العلامة الأصلية والعلامة الفرعية',
  'معرفة أشهر علامات الإعراب الفرعية بصورة تمهيدية',
  'معرفة أن الجر خاص بالأسماء، والجزم خاص بالأفعال المضارعة',
  'تحديد علامة الإعراب في أمثلة بسيطة',
  'إجراء إعراب بسيط لكلمات سبق أن درسها',
  'تجنب أشهر الأخطاء المتعلقة بعلامات الإعراب',
  '1. مراجعة سريعة',
  '2. ما الإعراب؟',
  '3. تعريف الإعراب بطريقة مبسطة',
  '4. حالات الإعراب الأربع',
  '5. العلامات الأصلية',
  '6. أولًا: الرفع',
  '7. كلمات تعلمنا أنها مرفوعة',
  '8. ثانيًا: النصب',
  '9. ثالثًا: الجر',
  '10. بعض حروف الجر',
  '11. رابعًا: الجزم',
  '12. قاعدة ذهبية',
  '13. مثال يجمع أكثر من حالة',
  '14. ما المقصود بعلامة الإعراب؟',
  '15. لا تخلط بين الحالة والعلامة',
  '16. ما العلامات الفرعية؟',
  '17. الفرق بين العلامة الأصلية والفرعية',
  '18. لماذا ندرس العلامات الفرعية؟',
  '19. أشهر علامات الرفع الفرعية',
  '20. ثبوت النون',
  '21. أشهر علامات النصب الفرعية',
  '22. أشهر علامات الجر الفرعية',
  '23. أشهر علامات الجزم الفرعية',
  '24. جدول شامل مبسط',
  '25. كيف أعرب كلمة بطريقة بسيطة؟',
  '26. مثال على المفعول به',
  '27. مثال على الاسم المجرور',
  '28. مثال على الفعل المجزوم',
  '29. علامات ظاهرة وعلامات مقدرة',
  '30. البناء والإعراب: تنبيه للمستقبل',
  '31. الخلاصة الأساسية',
  '32. ملاحظات مهمة يجب حفظها',
  '33. أخطاء شائعة',
  'رفع → ضمة',
  'نصب → فتحة',
  'جر → كسرة',
  'جزم → سكون',
  'الاسم يُرفع ويُنصب ويُجر.',
  'الفعل المضارع يُرفع ويُنصب ويُجزم.',
  'الاسم لا يُجزم.',
  'الفعل لا يُجر.',
  'مرفوع',
  'منصوب',
  'مجرور',
  'مجزوم',
  'الضمة',
  'الفتحة',
  'الكسرة',
  'السكون',
  'الألف – الواو – ثبوت النون',
  'الياء – الكسرة – الألف – حذف النون',
  'الياء – الفتحة',
  'حذف حرف العلة – حذف النون',
  'الطالبانِ',
  'المعلمونَ',
  'المعلمينَ',
  'المعلماتِ',
  'أبوك',
  'أباكَ',
  'أبيكَ',
  'يكتبونَ',
  'لن يكتبوا',
  'لم يكتبوا',
  'لم يسعَ',
  'لم يدعُ',
  'أحمدَ',
  'الطالبُ مجتهدٌ.',
  'كتبَ خالدٌ الدرسَ.',
  'الطفلُ سعيدٌ.',
  'نامَ الطفلُ.',
  'قرأَ الطالبُ الكتابَ.',
  'أكلَ الطفلُ التفاحةَ.',
  'ذهبتُ إلى المدرسةِ.',
  'جلستُ في الصفِّ.',
  'لم يكتبْ خالدٌ.',
  'لم يذهبْ سامرٌ إلى المدرسةِ.',
  'كتبَ الطالبُ الواجبَ بالقلمِ.',
  'جاءَ الطالبانِ.',
  'جاءَ المعلمونَ.',
  'جاءَ أبوك.',
  'رأيتُ الطالبينِ.',
  'كرَّمَ المديرُ المعلمينَ.',
  'كرَّمتُ الطالباتِ.',
  'رأيتُ أباكَ.',
  'لن يكتبوا.',
  'سلَّمتُ على الطالبينِ.',
  'سلَّمتُ على المعلمينَ.',
  'سلَّمتُ على أبيكَ.',
  'مررتُ بأحمدَ.',
  'لم يسعَ إلى الشرِّ.',
  'لم يدعُ إلى الشرِّ.',
  'الطلابُ لم يكتبوا.',
  'جاءَ الفتى.',
  'الإعراب هو:',
  'مرفوع وعلامة رفعه الضمة الظاهرة على آخره.',
  'مفعول به منصوب وعلامة نصبه الفتحة الظاهرة على آخره.',
  'اسم مجرور بإلى وعلامة جره الكسرة الظاهرة على آخره.',
  'فعل مضارع مجزوم بـ(لم)، وعلامة جزمه السكون.',
  'ملاحظات للمعلم',
  'المرحلة الأولى: الإتقان',
  'المرحلة الثانية: التعرف',
  'أخطاء متوقعة من الطالب',
  'طريقة عملية للإعراب',
  'واجب منزلي مقترح',
  'خلاصة للحفظ السريع',
]
for (const phrase of requiredPhrases) requirePhrase(phrase)

const stepCount = (lesson.match(/step\('/g) ?? []).length
if (stepCount < 35 || stepCount > 45) failures.push(`Lesson 6 should contain about 35–45 sequential steps; found ${stepCount}.`)

const expectedGroups = ['البداية', 'ما الإعراب؟', 'الحالات الإعرابية', 'العلامات الأصلية', 'العلامات الفرعية', 'التطبيق والإعراب', 'الأمثلة المحلولة', 'الأنشطة', 'اختبر نفسك', 'منطقة المعلم', 'الواجب والخلاصة']
for (const group of expectedGroups) {
  if (!lesson.includes(`'${group}'`)) failures.push(`Missing LessonOutline group: ${group}`)
}

const activityBlock = lesson.slice(lesson.indexOf('const activityGroups'), lesson.indexOf('export function LessonSix'))
if ((activityBlock.match(/title: 'النشاط (الأول|الثاني|الثالث)/g) ?? []).length !== 3) failures.push('Expected exactly 3 official activity groups.')
if ((activityBlock.match(/prompt:/g) ?? []).length !== 14) failures.push('Expected exactly 14 activity prompts (5 + 4 + 5).')
for (const prompt of ['حضرَ الطالبُ.', 'قرأَ الطالبُ الكتابَ.', 'ذهبتُ إلى المدرسةِ.', 'العلمُ نورٌ.', 'شربَ الطفلُ الحليبَ.', 'علامة الرفع الأصلية', 'علامة النصب الأصلية', 'علامة الجر الأصلية', 'علامة الجزم الأصلية', 'الفاعل ______.', 'المفعول به ______.', 'المبتدأ ______.', 'الخبر ______.', 'الاسم بعد حرف الجر ______.']) {
  if (!activityBlock.includes(prompt)) failures.push(`Missing activity prompt: ${prompt}`)
}

const finalBlock = lesson.slice(lesson.indexOf('const finalQuestions'), lesson.indexOf('const activityGroups'))
const questionCount = (finalBlock.match(/number:\s*\d+/g) ?? []).length
if (questionCount !== 20) failures.push(`Final test has ${questionCount} numbered questions; expected exactly 20.`)
for (let number = 1; number <= 20; number += 1) {
  if (!finalBlock.includes(`number: ${number}`)) failures.push(`Missing final-test question ${number}.`)
}
const categories = [
  ['choice', 5], ['true-false', 5], ['identify', 3], ['complete', 4], ['parsing', 2], ['thinking', 1],
]
for (const [category, expected] of categories) {
  const found = (finalBlock.match(new RegExp(`type: '${category}'`, 'g')) ?? []).length
  if (found !== expected) failures.push(`Final-test category ${category} has ${found}; expected ${expected}.`)
}
for (const phrase of ['قارن بين الجملتين: حضرَ الطالبُ. حضرَ الطالبانِ.', 'ما وظيفة الطالب والطالبان؟', 'هل الكلمتان مرفوعتان؟', 'ما علامة رفع الطالب؟', 'ما علامة رفع الطالبان؟', 'لماذا اختلفت علامة الرفع؟']) {
  if (!finalBlock.includes(phrase)) failures.push(`Missing question 20 comparison component: ${phrase}`)
}

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}
console.log(`Lesson 6 source audit passed: ${stepCount} sequential steps, 3 activities with 14 prompts, exactly 20 final-test questions across all six source categories, complete teacher area, homework, summary, core rules, and parsing examples.`)
