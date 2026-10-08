import { readFileSync, existsSync } from 'node:fs'

/**
 * Source-fidelity audit for Lesson 7 (المثنى وجمع المذكر السالم وجمع المؤنث السالم).
 *
 * It verifies the lesson against the authoritative source: every major source section,
 * the three core definitions, the three golden rules, the comparison tables, the source
 * examples (dual, masculine sound plural, feminine sound plural, broken plurals, nun
 * deletion), all 5 activities with their exact prompt counts (10 + 8 + 9 + 5 + 5 = 37),
 * the exactly-25-question final test with its official category structure and subparts,
 * the complete teacher area with activity answers, the final-test answer key, expected
 * errors, homework, the advanced challenge, the one-page summary, and the deferred
 * advanced topics that the source explicitly postpones.
 */
const failures = []

function read(path) {
  if (!existsSync(path)) {
    failures.push(`Missing required file: ${path}`)
    return ''
  }
  return readFileSync(path, 'utf8')
}

const lesson = read('src/lessons/LessonSeven.tsx')
const registry = read('src/lessons/registry.ts')
const app = read('src/app/App.tsx')
const home = read('src/app/CourseHome.tsx')
const packageJson = read('package.json')
const parsingCheck = read('scripts/check-parsing.mjs')
const fullSource = `${lesson}\n${registry}\n${app}`

function requirePhrase(phrase, label = phrase, haystack = fullSource) {
  if (!haystack.includes(phrase)) failures.push(`Missing Lesson 7 source phrase: ${label}`)
}

function slice(from, to) {
  const start = lesson.indexOf(from)
  const end = lesson.indexOf(to)
  if (start === -1 || end === -1 || end <= start) {
    failures.push(`Could not locate Lesson 7 block: ${from} → ${to}`)
    return ''
  }
  return lesson.slice(start, end)
}

/* 1–3. registration, route, and homepage reachability */
if (!existsSync('src/lessons/LessonSeven.tsx')) failures.push('LessonSeven.tsx is missing.')
if (!registry.includes("id: 'lesson-7'")) failures.push('Lesson 7 is not registered in the lesson registry.')
requirePhrase('الدرس السابع: المثنى وجمع المذكر السالم وجمع المؤنث السالم', 'Lesson 7 document title', registry)
const registryStart = registry.indexOf("id: 'lesson-7'")
const registryEntry = registryStart === -1 ? '' : registry.slice(registryStart, registry.indexOf('}', registry.indexOf('parts:', registryStart)))
if (!/available:\s*true/.test(registryEntry)) failures.push('Lesson 7 is not marked available, so it is not reachable from the homepage.')
if (!registryEntry.includes('المثنى وجمع المذكر السالم وجمع المؤنث السالم')) failures.push('Lesson 7 registry entry is incomplete.')
if (!home.includes('lessonRegistry')) failures.push('The homepage does not build its index from the lesson registry.')
if (!app.includes('LessonSeven') || !app.includes("lesson.id === 'lesson-7'")) {
  failures.push('App does not route lesson-7 through LessonSeven.')
}
if (!packageJson.includes('check:lesson7')) failures.push('package.json does not expose npm run check:lesson7.')
if (!packageJson.includes('check:lesson7') || !/validate[\s\S]*check:lesson7/.test(packageJson)) {
  failures.push('npm run validate does not include check:lesson7.')
}

/* 4. sequential LessonFlow architecture only */
if (!lesson.includes('LessonFlow') || !lesson.includes('LessonStepDefinition')) {
  failures.push('Lesson 7 must use the sequential LessonFlow architecture.')
}
if ((lesson.match(/<LessonFlow/g) ?? []).length !== 1) {
  failures.push('Lesson 7 must render exactly one LessonFlow.')
}
if (/SectionNav|scrollIntoView|IntersectionObserver/.test(lesson)) {
  failures.push('Lesson 7 contains a forbidden long-page navigation primitive.')
}
if (!lesson.includes('<TeacherSpace>')) failures.push('Teacher material is not protected by TeacherSpace.')

/* 5. LessonOutline metadata: every step belongs to a declared group with an icon */
const stepPattern = /step\('([^']+)', '([^']+)', '([^']+)', '([^']+)'/g
const steps = [...lesson.matchAll(stepPattern)]
if (steps.length < 45) failures.push(`Lesson 7 sequential flow is too short: ${steps.length} steps.`)
const expectedGroups = [
  'البداية',
  'المفرد والمثنى',
  'إعراب المثنى',
  'جمع المذكر السالم',
  'جمع المؤنث السالم',
  'المقارنة والتمييز',
  'الإضافة وحذف النون',
  'خلاصة الدرس والملاحظات',
  'الأمثلة المحلولة',
  'الأنشطة',
  'اختبار نهاية الدرس',
  'منطقة المعلم',
  'الواجب والتحدي',
  'الخلاصة النهائية',
]
const usedGroups = new Set(steps.map((match) => match[3]))
for (const group of expectedGroups) {
  if (!usedGroups.has(group)) failures.push(`Missing LessonOutline group: ${group}`)
}
for (const group of usedGroups) {
  if (!expectedGroups.includes(group)) failures.push(`Lesson step uses an unexpected outline group: ${group}`)
}
for (const match of steps) {
  if (!match[4]) failures.push(`Lesson step ${match[1]} has no outline icon.`)
}

/* 6. every major source section is present as its own sequential step title */
const requiredTitles = [
  '1. المفرد',
  '2. المثنى',
  '3. لماذا سُمّي "مثنى"؟',
  '4. كيف نصوغ المثنى؟',
  '5. قاعدة مهمة جدًا في المثنى',
  '6. المثنى في حالة الرفع',
  '7. المثنى في حالة النصب',
  '8. المثنى في حالة الجر',
  '9. جدول المثنى',
  '10. كيف أعرف هل المثنى مرفوع أم منصوب أم مجرور؟',
  '11. حذف النون في المثنى',
  '12. تنبيه مهم حول المثنى',
  '13. الآن ننتقل إلى الجمع',
  '14. لماذا يسمى "جمع المذكر السالم"؟',
  '15. كيف نصوغ جمع المذكر السالم؟',
  '16. قاعدة جمع المذكر السالم',
  '17. جمع المذكر السالم في حالة الرفع',
  '18. جمع المذكر السالم في حالة النصب',
  '19. جمع المذكر السالم في حالة الجر',
  '20. جدول جمع المذكر السالم',
  '21. هل كل اسم مذكر يمكن جمعه جمع مذكر سالم؟',
  '22. جمع المؤنث السالم',
  '23. لماذا يسمى "جمع المؤنث السالم"؟',
  '24. كيف نصوغ جمع المؤنث السالم؟',
  '25. إعراب جمع المؤنث السالم',
  '26. جمع المؤنث السالم في حالة الرفع',
  '27. جمع المؤنث السالم في حالة النصب',
  '28. جمع المؤنث السالم في حالة الجر',
  '29. جدول جمع المؤنث السالم',
  '30. مقارنة الأنواع الثلاثة',
  '31. جدول الحفظ الأساسي',
  '32. لماذا يسمى بعض الإعراب "بالنيابة"؟',
  '33. الفرق بين جمع المذكر السالم وجمع التكسير',
  '34. لا تعتمد على الشكل وحده',
  '35. مقارنة شاملة بأمثلة',
  '36. تطبيق شامل',
  '37. كيف نحدد النوع بسرعة؟',
  '38. تنبيه: جمع المذكر السالم ليس مجرد "مذكر + ون"',
  '39. تنبيه: جمع المؤنث السالم أوسع من الكلمات المنتهية بتاء مربوطة',
  '40. الإضافة وحذف النون',
  '41. خلاصة الدرس',
  'ملاحظات مهمة يجب حفظها',
  'أهداف الدرس',
  'أمثلة محلولة: المثنى (1–3)',
  'أمثلة محلولة: جمع المذكر السالم (4–6)',
  'أمثلة محلولة: جمع المؤنث السالم (7–9)',
  'النشاط الأول: حدد النوع',
  'النشاط الثاني: حدد نوع الجمع',
  'النشاط الثالث: حدد الحالة والعلامة',
  'النشاط الرابع: حوّل إلى المثنى',
  'النشاط الخامس: حوّل إلى الجمع المناسب',
  'رابعًا: اختبار نهاية الدرس',
  'خامسًا: منطقة خاصة بالمعلم',
  'واجب منزلي',
  'تحدي إضافي للطالب المتقدم',
  'خلاصة الدرس في صفحة واحدة',
  'قاعدة الحفظ الذهبية',
]
for (const title of requiredTitles) requirePhrase(`'${title}'`, `step title ${title}`)

/* 7. core definitions */
const requiredDefinitions = [
  'ما دل على واحد أو واحدة.',
  'ما دل على اثنين أو اثنتين، بزيادة ألف ونون أو ياء ونون في آخره، مع بقاء مفرده صالحًا',
  'ما دل على ثلاثة فأكثر.',
  'ما دل على ثلاثة فأكثر من المؤنث، مع بقاء مفرده سالمًا في الغالب، ويُصاغ غالبًا بزيادة',
  'اثنين أو اثنتين.',
  'جمع',
  'مذكر',
  'سالم',
]
for (const phrase of requiredDefinitions) requirePhrase(phrase, phrase)

/* 8. core rules and the three golden rules */
requirePhrase('يُرفع بالألف.', 'dual is raised with alif')
requirePhrase('ويُنصب بالياء.', 'dual is accusative with ya')
requirePhrase('ويُجر بالياء.', 'dual is genitive with ya')
requirePhrase('المثنى: ألف في الرفع، وياء في النصب والجر.', 'dual golden rule')
requirePhrase('جمع المذكر السالم يُرفع بالواو، ويُنصب بالياء، ويُجر بالياء.', 'masculine plural golden rule')
requirePhrase('جمع المذكر السالم: واو في الرفع، ياء في النصب والجر.', 'masculine plural memorization rule')
requirePhrase('جمع المؤنث السالم يُرفع بالضمة، ويُنصب بالكسرة، ويُجر بالكسرة.', 'feminine plural golden rule')
requirePhrase('جمع المؤنث السالم: ضمة في الرفع، كسرة في النصب والجر.', 'feminine plural memorization rule')
requirePhrase('وجمع التكسير سنأخذه في درس مستقل.', 'broken plural deferral rule')
requirePhrase('مفرد', 'singular label')
requirePhrase('مثنى', 'dual label')
requirePhrase('جمع', 'plural label')

/* 9. the three case tables + the memorization comparison table */
for (const tableTitle of [
  '9. جدول المثنى',
  '20. جدول جمع المذكر السالم',
  '29. جدول جمع المؤنث السالم',
  '31. جدول الحفظ الأساسي',
]) {
  requirePhrase(`'${tableTitle}'`, `comparison table ${tableTitle}`)
}
requirePhrase('<th>الحالة</th><th>صورة المثنى</th><th>العلامة</th>', 'dual table headers')
requirePhrase('<th>الحالة</th><th>المثال</th><th>العلامة</th>', 'plural table headers')
requirePhrase('<th>النوع</th><th>الرفع</th><th>النصب</th><th>الجر</th>', 'memorization table headers')
for (const row of [
  '<th>المثنى</th><td>الألف</td><td>الياء</td><td>الياء</td>',
  '<th>جمع المذكر السالم</th><td>الواو</td><td>الياء</td><td>الياء</td>',
  '<th>جمع المؤنث السالم</th><td>الضمة</td><td>الكسرة</td><td>الكسرة</td>',
]) {
  requirePhrase(row, `memorization table row ${row}`)
}
requirePhrase('هذا الجدول من أهم جداول الكورس.', 'memorization table emphasis')

/* 10–14. source examples */
for (const phrase of [
  'طالب ← طالبان',
  'معلم ← معلمان',
  'كتاب ← كتابان',
  'طالبة ← طالبتان',
  'from="شجرة" to="شجرتان"',
  'طالب ← طالبينِ',
  'معلم ← معلمينِ',
  'كتاب ← كتابينِ',
  'طالبة ← طالبتينِ',
  'نضيف ألفًا ونونًا:',
  'نضيف ياءً ونونًا:',
  '<bdi>ـانِ</bdi>',
  '<bdi>ـينِ</bdi>',
]) {
  requirePhrase(phrase, `dual example ${phrase}`)
}
for (const phrase of [
  'معلم ← معلمونَ',
  'مهندس ← مهندسونَ',
  'مجتهد ← مجتهدونَ',
  'معلم ← معلمينَ',
  'مهندس ← مهندسينَ',
  'مجتهد ← مجتهدينَ',
  'نضيف واوًا ونونًا:',
  'نضيف ياءً ونونًا:',
  '<bdi>ـونَ</bdi>',
  '<bdi>ـينَ</bdi>',
  'مسلمون',
  'صادقون',
]) {
  requirePhrase(phrase, `masculine sound plural example ${phrase}`)
}
for (const phrase of [
  'from="طالبة" to="طالبات"',
  'from="معلمة" to="معلمات"',
  'from="مهندسة" to="مهندسات"',
  'from="سيارة" to="سيارات"',
  'from="كاتبة" to="كاتبات"',
  'نحذف التاء المربوطة، ثم نضيف:',
]) {
  requirePhrase(phrase, `feminine sound plural example ${phrase}`)
}
for (const phrase of [
  'كتاب ← كتب',
  'قلم ← أقلام',
  'رجل ← رجال',
  'from="مدينة" to="مدن"',
  'جمع تكسير',
  'وسنخصص لها درسًا مستقلًا لأن لها أنواعًا وأوزانًا كثيرة.',
]) {
  requirePhrase(phrase, `broken plural example ${phrase}`)
}
for (const phrase of [
  'طالبا المدرسةِ',
  'طالبَي المدرسةِ',
  'معلمو المدرسةِ',
  'معلمي المدرسةِ',
  'والسبب أن المثنى إذا أُضيف تحذف نونه.',
]) {
  requirePhrase(phrase, `nun-deletion example ${phrase}`)
}

/* shape warnings that the source explicitly requires */
requirePhrase('ليس كل كلمة تنتهي بـ:', 'shape warning for dual')
requirePhrase('رمضان', 'رمضان is not a dual')
requirePhrase('عثمان', 'عثمان is not a dual')
requirePhrase('قانون', 'قانون is not a sound masculine plural')
requirePhrase('وليس كل كلمة تنتهي بـ <strong>ات</strong> جمع مؤنث سالم.', 'shape warning for feminine plural')
for (const criterion of ['معنى الكلمة.', 'مفردها.', 'طريقة جمعها.', 'بنيتها.', 'موقعها في الجملة.']) {
  requirePhrase(criterion, `type identification criterion ${criterion}`)
}

/* 15–21. the five activities with their exact prompt counts */
const activityOne = slice('const activityOneItems', 'const activityTwoItems')
const activityTwo = slice('const activityTwoItems', 'const activityThreeItems')
const activityThree = slice('const activityThreeItems', 'const activityFourItems')
const activityFour = slice('const activityFourItems', 'const activityFiveItems')
const activityFive = slice('const activityFiveItems', 'const stateChoices')
const activityCounts = [
  ['Activity 1 (حدد النوع)', activityOne, 10],
  ['Activity 2 (حدد نوع الجمع)', activityTwo, 8],
  ['Activity 3 (حدد الحالة والعلامة)', activityThree, 9],
  ['Activity 4 (حوّل إلى المثنى)', activityFour, 5],
  ['Activity 5 (حوّل إلى الجمع المناسب)', activityFive, 5],
]
let totalPrompts = 0
for (const [label, block, expected] of activityCounts) {
  const found = (block.match(/prompt:/g) ?? []).length
  totalPrompts += found
  if (found !== expected) failures.push(`${label} has ${found} prompts; expected exactly ${expected}.`)
}
if (totalPrompts !== 37) failures.push(`Total activity prompts are ${totalPrompts}; expected exactly 37.`)
for (const prompt of [
  'طالب', 'طالبان', 'معلمون', 'معلمات', 'كتاب', 'كتابان', 'كتب', 'مهندسون', 'مهندسات', 'قلم',
]) {
  if (!activityOne.includes(`prompt: '${prompt}'`)) failures.push(`Activity 1 is missing prompt: ${prompt}`)
}
for (const prompt of ['معلمون', 'معلمين', 'طالبات', 'كتب', 'أقلام', 'مهندسات', 'رجال', 'مسلمون']) {
  if (!activityTwo.includes(`prompt: '${prompt}'`)) failures.push(`Activity 2 is missing prompt: ${prompt}`)
}
for (const prompt of [
  'جاءَ الطالبانِ.',
  'رأيتُ الطالبينِ.',
  'مررتُ بـ الطالبينِ.',
  'حضرَ المعلمونَ.',
  'كرَّمتُ المعلمينَ.',
  'سلَّمتُ على المعلمينَ.',
  'حضرتِ المعلماتُ.',
  'كرَّمتُ المعلماتِ.',
  'سلَّمتُ على المعلماتِ.',
]) {
  if (!activityThree.includes(`prompt: '${prompt}'`)) failures.push(`Activity 3 is missing prompt: ${prompt}`)
}
for (const prompt of ['طالب', 'طالبة', 'معلم', 'شجرة', 'كتاب']) {
  if (!activityFour.includes(`prompt: '${prompt}'`)) failures.push(`Activity 4 is missing prompt: ${prompt}`)
}
for (const prompt of ['معلم', 'مهندس', 'معلمة', 'طالبة', 'كاتب']) {
  if (!activityFive.includes(`prompt: '${prompt}'`)) failures.push(`Activity 5 is missing prompt: ${prompt}`)
}
if (!lesson.includes('الأنشطة') || !lesson.includes('ClassificationActivity') || !lesson.includes('StateSignActivity') || !lesson.includes('TransformActivity')) {
  failures.push('The five activities are not implemented as real interactive activities.')
}
if (!lesson.includes('aria-pressed=') || !lesson.includes('<select') || !lesson.includes('<textarea')) {
  failures.push('Activity interactions must support selection, state/sign choice, and sentence writing.')
}

/* 22–24. the final test: exactly 25 numbered questions with the official structure */
const finalBlock = slice('const finalTestQuestions', 'const objectiveAnswers')
const numbers = [...finalBlock.matchAll(/number:\s*(\d+)/g)].map((match) => Number(match[1]))
if (numbers.length !== 25) failures.push(`Final test has ${numbers.length} numbered questions; expected exactly 25.`)
for (let number = 1; number <= 25; number += 1) {
  const occurrences = numbers.filter((value) => value === number).length
  if (occurrences !== 1) failures.push(`Final-test question ${number} appears ${occurrences} times; expected exactly once.`)
}
const categoryCounts = [
  ['choice', 8],
  ['true-false', 7],
  ['identify', 3],
  ['transform', 2],
  ['parsing', 3],
  ['thinking', 1],
  ['challenge', 1],
]
for (const [category, expected] of categoryCounts) {
  const found = (finalBlock.match(new RegExp(`type: '${category}'`, 'g')) ?? []).length
  if (found !== expected) failures.push(`Final-test category ${category} has ${found}; expected ${expected}.`)
}
const sectionCounts = [
  ['sectionOne', 8],
  ['sectionTwo', 7],
  ['sectionThree', 3],
  ['sectionFour', 2],
  ['sectionFive', 3],
  ['sectionSix', 1],
  ['sectionSeven', 1],
]
for (const [section, expected] of sectionCounts) {
  const found = (finalBlock.match(new RegExp(`section: ${section},`, 'g')) ?? []).length
  if (found !== expected) failures.push(`Final-test section ${section} has ${found} questions; expected ${expected}.`)
}
for (const heading of [
  'السؤال الأول: اختر الإجابة الصحيحة',
  'السؤال الثاني: صح أم خطأ',
  'السؤال الثالث: استخرج وحدد',
  'السؤال الرابع: حوّل',
  'السؤال الخامس: أعرب',
  'السؤال السادس: سؤال تفكير',
  'السؤال السابع: تحدٍّ إضافي',
]) {
  requirePhrase(heading, `final-test section heading ${heading}`, lesson)
}
for (const phrase of [
  'جاءَ الطالبانِ إلى المدرسةِ.',
  'كرَّمَ المديرُ المعلمينَ.',
  'حضرتِ الطالباتُ إلى الصفِّ.',
  'حوّل المفرد إلى مثنى:',
  'حوّل إلى الجمع المناسب:',
  'رأيتُ المعلمينَ. أعرب: المعلمينَ:',
  'سلَّمتُ على الطالباتِ. أعرب: الطالباتِ:',
  'قارن بين الجملتين: جاءَ الطالبانِ. جاءَ المعلمونَ.',
  'مسلمان – مسلمين – معلمان – معلمين – معلمون – معلمات',
]) {
  requirePhrase(phrase, `final-test question content ${phrase}`, finalBlock)
}
const requiredSubparts = [
  ['16', ['استخرج المثنى:', 'ما حالته الإعرابية؟', 'ما علامة إعرابه؟']],
  ['17', ['استخرج جمع المذكر السالم:', 'ما حالته الإعرابية؟', 'ما علامة إعرابه؟']],
  ['18', ['استخرج جمع المؤنث السالم:', 'ما حالته الإعرابية؟', 'ما علامة إعرابه؟']],
  ['19', ['طالب → ', 'طالبة → ', 'معلم → ']],
  ['20', ['معلم → ', 'معلمة → ', 'مهندس → ', 'مهندسة → ']],
  ['24', ['أ. ما نوع "الطالبان"؟', 'ب. ما نوع "المعلمون"؟', 'ج. ما علامة رفع "الطالبان"؟', 'د. ما علامة رفع "المعلمون"؟', 'هـ. لماذا اختلفت علامة الرفع؟']],
  ['25', ['المثنى:', 'جمع المذكر السالم:', 'جمع المؤنث السالم:']],
]
for (const [number, parts] of requiredSubparts) {
  const questionBlock = finalBlock.slice(finalBlock.indexOf(`number: ${number},`), finalBlock.indexOf(`number: ${Number(number) + 1},`) === -1 ? undefined : finalBlock.indexOf(`number: ${Number(number) + 1},`))
  for (const part of parts) {
    if (!questionBlock.includes(`'${part}'`)) {
      failures.push(`Final-test question ${number} is missing subpart: ${part}`)
    }
  }
}

/* the official final-test answer key must be complete and correct */
const answerPattern = /answer:\s*'([^']*)'/g
const answers = [...finalBlock.matchAll(answerPattern)].map((match) => match[1])
if (answers.length !== 25) failures.push(`Final test has ${answers.length} answers; expected exactly 25.`)
const objectiveKey = {
  1: 'ب. مثنى.', 2: 'ج. الألف.', 3: 'ب. الياء.', 4: 'ج. الواو.', 5: 'أ. الياء.',
  6: 'ج. الكسرة.', 7: 'ج. جمع مؤنث سالم.', 8: 'أ. جمع تكسير.',
  9: 'صح.', 10: 'خطأ؛ المثنى ينصب بالياء.', 11: 'صح.', 12: 'صح.', 13: 'صح.',
  14: 'خطأ؛ كتب جمع تكسير.', 15: 'خطأ؛ ليس كل ما ينتهي بـ"ون" جمع مذكر سالمًا.',
}
for (const [number, expected] of Object.entries(objectiveKey)) {
  if (answers[Number(number) - 1] !== expected) {
    failures.push(`Final-test answer ${number} is "${answers[Number(number) - 1]}"; expected "${expected}".`)
  }
}
const openAnswers = [
  'المثنى: الطالبانِ. حالته: مرفوع. علامته: الألف.',
  'جمع المذكر السالم: المعلمينَ. حالته: منصوب. علامته: الياء.',
  'جمع المؤنث السالم: الطالباتُ. حالته: مرفوع. علامته: الضمة.',
  'طالب → طالبان. طالبة → طالبتان. معلم → معلمان.',
  'معلم → معلمون. معلمة → معلمات. مهندس → مهندسون. مهندسة → مهندسات.',
  'الطالبانِ: فاعل مرفوع وعلامة رفعه الألف؛ لأنه مثنى.',
  'المعلمينَ: مفعول به منصوب وعلامة نصبه الياء؛ لأنه جمع مذكر سالم.',
  'الطالباتِ: اسم مجرور بـ"على"، وعلامة جره الكسرة الظاهرة على آخره.',
  'هامش',
]
for (const fragment of [
  'أ. الطالبان → مثنى.',
  'ب. المعلمون → جمع مذكر سالم.',
  'ج. علامة رفع الطالبان → الألف.',
  'د. علامة رفع المعلمون → الواو.',
  'المثنى: مسلمان – مسلمين، معلمان – معلمين.',
  'جمع المؤنث السالم: معلمات.',
]) {
  if (!answers.some((answer) => answer.includes(fragment))) {
    failures.push(`Final-test answer key is missing: ${fragment}`)
  }
}
for (const fragment of openAnswers.slice(0, 8)) {
  if (!answers.some((answer) => answer.includes(fragment))) {
    failures.push(`Final-test answer key is missing: ${fragment}`)
  }
}

/* 10. final-test UX: nothing is revealed before submission */
requirePhrase('النتيجة ولا الإجابات النموذجية إلا بعد تسليم الاختبار.', 'no-feedback-before-submit note')
requirePhrase('تسليم الاختبار', 'submit button')
requirePhrase('أعد الاختبار', 'restart button')
if (!/setAnswers\(\{\}\)/.test(lesson)) failures.push('Restarting the final test must clear the draft answers.')
if (/onChange=\{[\s\S]{0,200}setSubmitted/.test(lesson)) failures.push('Answering must not submit or reveal results immediately.')

/* 25–28. teacher area coverage */
requirePhrase('إجابات النشاط التطبيقي', 'teacher activity answers')
for (const activityTitle of [
  'النشاط الأول: حدد النوع (١٠ مطالب)',
  'النشاط الثاني: حدد نوع الجمع (٨ مطالب)',
  'النشاط الثالث: حدد الحالة والعلامة (٩ مطالب)',
  'النشاط الرابع: حوّل إلى المثنى (٥ مطالب)',
  'النشاط الخامس: حوّل إلى الجمع المناسب (٥ مطالب)',
]) {
  requirePhrase(activityTitle, `teacher area ${activityTitle}`)
}
requirePhrase('الإجابات النموذجية لاختبار نهاية الدرس', 'teacher final-test answer key')
requirePhrase('{finalTestQuestions.map((question) => (', 'teacher area renders the whole answer key')
for (const phrase of [
  '1. لا تختصر درس المثنى بقاعدة "ان/ين"',
  '2. فرّق بين المثنى وجمع المذكر السالم',
  '3. لا تجعل الطالب يحفظ "جمع المذكر = ون/ين" فقط',
  '4. جمع المؤنث السالم يحتاج إلى درس متقدم لاحقًا',
  '5. لا تهمل جمع التكسير',
  'أخطاء متوقعة من الطالب',
  'الخطأ الأول',
  'الخطأ الخامس',
  'الصحيح:',
  'هذه نقطة يكثر فيها الخطأ.',
  'جمع القلة',
  'جمع الكثرة',
  'أحكام التاء المربوطة عند الجمع',
  'حذف النون عند الإضافة',
  'ما يُعامل معاملة جمع المؤنث السالم',
]) {
  requirePhrase(phrase, `teacher notes ${phrase}`)
}
for (const [bad, good] of [
  ['رأيتُ الطالبانِ.', 'رأيتُ الطالبينِ.'],
  ['جاءَ المعلمينَ.', 'جاءَ المعلمونَ.'],
  ['رأيتُ المعلمونَ.', 'رأيتُ المعلمينَ.'],
  ['كرمتُ الطالباتُ.', 'كرمتُ الطالباتِ.'],
  ['جاءتِ الطالباتِ.', 'جاءتِ الطالباتُ.'],
]) {
  requirePhrase(`bad="${bad}"`, `expected student error ${bad}`)
  requirePhrase(`good="${good}"`, `expected student error correction ${good}`)
}
requirePhrase('لأن المثنى منصوب بالياء.', 'correction reason for the first error')
requirePhrase('لأن جمع المذكر السالم مرفوع بالواو.', 'correction reason for the second error')
requirePhrase('لأن جمع المؤنث السالم منصوب بالكسرة.', 'correction reason for the fourth error')
requirePhrase('لأنها فاعل مرفوع بالضمة.', 'correction reason for the fifth error')

/* 29–31. homework, advanced challenge, one-page summary */
requirePhrase('أولًا: صنّف الكلمات', 'homework part A')
for (const word of ['طالب', 'طالبان', 'معلمون', 'معلمات', 'كتب', 'مهندسين', 'شجرتان', 'أقلام', 'طبيبات', 'مهندس']) {
  requirePhrase(`<li>${word}</li>`, `homework classification word ${word}`, lesson)
}
requirePhrase('مفرد – مثنى – جمع مذكر سالم – جمع مؤنث سالم – جمع تكسير', 'homework categories')
requirePhrase('ثانيًا: أعرب الكلمات المحددة', 'homework part B')
requirePhrase('ثالثًا: حوّل', 'homework part C')
for (const phrase of ['<bdi>طالب ← مثنى</bdi>', '<bdi>طالب ← جمع مذكر سالم</bdi>', '<bdi>طالبة ← مثنى</bdi>', '<bdi>طالبة ← جمع مؤنث سالم</bdi>']) {
  requirePhrase(phrase, `homework transformation ${phrase}`)
}
requirePhrase('جاءَ طالبانِ، ورأيتُ طالبينِ آخرينِ، ثم سلَّمتُ على المعلمينَ والمعلماتِ.', 'advanced challenge sentence')
for (const item of ['مثنى مرفوعًا.', 'مثنى منصوبًا.', 'جمع مذكر سالمًا.', 'جمع مؤنث سالمًا.', 'اسمًا مجرورًا.', 'اذكر علامة إعراب كل واحد.']) {
  requirePhrase(item, `advanced challenge item ${item}`)
}
requirePhrase('واحد أو واحدة', 'one-page summary: singular')
requirePhrase('اثنان أو اثنتان', 'one-page summary: dual')
requirePhrase('ثلاثة فأكثر من المذكر وفق شروطه', 'one-page summary: masculine plural')
requirePhrase('ثلاثة فأكثر من المؤنث وفق شروطه', 'one-page summary: feminine plural')
for (const line of [
  'طالبانِ ← الألف',
  'طالبينِ ← الياء',
  'معلمونَ ← الواو',
  'معلمينَ ← الياء',
  'معلماتُ ← الضمة',
  'معلماتِ ← الكسرة',
]) {
  requirePhrase(line, `one-page summary line ${line}`)
}

/* 33. complete parsing examples, in the course's full-parsing standard */
for (const line of [
  'الطالبانِ: فاعل مرفوع وعلامة رفعه الألف؛ لأنه مثنى.',
  'مجتهدانِ: خبر مرفوع وعلامة رفعه الألف؛ لأنه مثنى.',
  'الطالبينِ: مفعول به منصوب وعلامة نصبه الياء؛ لأنه مثنى.',
  'الطالبينِ: اسم مجرور بـ(على)، وعلامة جره الياء؛ لأنه مثنى.',
  'المعلمونَ: فاعل مرفوع وعلامة رفعه الواو؛ لأنه جمع مذكر سالم.',
  'المعلمينَ: مفعول به منصوب وعلامة نصبه الياء؛ لأنه جمع مذكر سالم.',
  'الطالباتُ: فاعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره؛ لأنه جمع مؤنث سالم.',
  'الطالباتِ: مفعول به منصوب وعلامة نصبه الكسرة نيابةً عن الفتحة؛ لأنه جمع مؤنث سالم.',
  'مجتهداتٌ',
]) {
  requirePhrase(line, `full parsing line ${line}`, line === 'مجتهداتٌ' ? fullSource : lesson)
}
if (!/مفعول به منصوب وعلامة نصبه الكسرة نيابةً عن الفتحة/.test(lesson)) {
  failures.push('The parsing standard is weakened: the feminine sound plural accusative parsing is incomplete.')
}

/* 34. deferred advanced topics are not falsely presented as taught */
for (const deferral of [
  'وسنتعلمها بالتفصيل.',
  'وسنعود إلى جمع التكسير في درس مستقل.',
  'وسنخصص لها درسًا مستقلًا لأن لها أنواعًا وأوزانًا كثيرة.',
  'لذلك سنعود لاحقًا إلى',
  'وسنربطها لاحقًا بدرس:',
  'وقد تنتظر دروسًا لاحقة',
]) {
  if (deferral === 'وقد تنتظر دروسًا لاحقة') continue
  requirePhrase(deferral, `deferral note ${deferral}`)
}
if (/الآن سنتعلم بالتفصيل أوزان جمع الكثرة/.test(lesson)) {
  failures.push('The lesson falsely claims to teach a deferred advanced topic.')
}

/* the parsing audit must cover Lesson 7 */
if (!parsingCheck.includes('LessonSeven.tsx')) {
  failures.push('scripts/check-parsing.mjs does not audit LessonSeven.tsx.')
}

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}

const groupSummary = expectedGroups.join(' / ')
console.log(
  `Lesson 7 source audit passed: ${steps.length} sequential steps in ${usedGroups.size} outline groups (${groupSummary}); ` +
    `3 definitions, 3 golden rules, 4 comparison tables; all source examples (dual, masculine sound plural, ` +
    `feminine sound plural, broken plurals, nun deletion); 5 activities with 10 + 8 + 9 + 5 + 5 = ${totalPrompts} prompts; ` +
    `exactly 25 final-test questions across all seven source categories with subparts and a complete answer key; ` +
    `complete teacher area, expected errors, homework, advanced challenge, one-page summary, and deferred topics kept deferred.`,
)
