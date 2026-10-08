import { readFileSync, existsSync } from 'node:fs'

/**
 * Source-fidelity audit for Lesson 9 (كان وأخواتها).
 *
 * It verifies the lesson against the authoritative source: registration and routing, the
 * sequential LessonFlow architecture, the nine objectives, the quick review of the
 * nominal sentence, the definition and the core/golden rule (ترفع الاسم وتنصب الخبر),
 * the eight sisters with their meanings and examples, the three-step discovery method,
 * the four easy examples, the before/after comparisons, the copular-verb (ناسخة) term,
 * the complete parsing of every example, the four sub-sign applications (المثنى، جمع
 * المذكر السالم، جمع المؤنث السالم، الأسماء الخمسة), the prepositional-phrase predicate
 * as an introductory example only, ليس وكان، وكان وصار، the four common errors with their
 * reasons, the two source activities (7 + 5 sentences), the advanced challenge (5
 * sentences), all 27 source end-of-lesson questions with model answers in the Teacher
 * Area, the summary and the teaser of إنَّ وأخواتها, the independent 20-question platform
 * test (6 أساسي / 7 متوسط / 4 متقدم / 3 تفكير) with no feedback before submission, the
 * explanatory solutions in four groups of five, the password-protected Teacher Area, and
 * the course-wide rule that every displayed parsing is complete, never abbreviated.
 */
const failures = []

function read(path) {
  if (!existsSync(path)) {
    failures.push(`Missing required file: ${path}`)
    return ''
  }
  return readFileSync(path, 'utf8')
}

const lesson = read('src/lessons/LessonNine.tsx')
const registry = read('src/lessons/registry.ts')
const app = read('src/app/App.tsx')
const home = read('src/app/CourseHome.tsx')
const packageJson = read('package.json')
const parsingCheck = read('scripts/check-parsing.mjs')
const styles = read('src/styles/lesson-nine.css')
const main = read('src/main.tsx')
const fullSource = `${lesson}\n${registry}\n${app}`

function requirePhrase(phrase, label = phrase, haystack = fullSource) {
  if (!haystack.includes(phrase)) failures.push(`Missing Lesson 9 source phrase: ${label}`)
}

/* 1. registration, routing, homepage card, styles */
if (!existsSync('src/lessons/LessonNine.tsx')) failures.push('LessonNine.tsx is missing.')
if (!registry.includes("id: 'lesson-9'")) failures.push('Lesson 9 is not registered in the lesson registry.')
requirePhrase('الدرس التاسع: كان وأخواتها', 'Lesson 9 document title', registry)
const registryStart = registry.indexOf("id: 'lesson-9'")
const registryEntry =
  registryStart === -1
    ? ''
    : registry.slice(registryStart, registry.indexOf('}', registry.indexOf('parts:', registryStart)))
if (!/available:\s*true/.test(registryEntry)) {
  failures.push('Lesson 9 is not marked available, so it is not reachable from the homepage.')
}
if (!registryEntry.includes("title: 'كان وأخواتها'")) failures.push('Lesson 9 registry entry is incomplete.')
if (!registryEntry.includes("number: '٩'")) failures.push('Lesson 9 registry entry has the wrong lesson number.')
if (!registryEntry.includes("eyebrow: 'الأفعال الناسخة'")) failures.push('Lesson 9 registry entry has no eyebrow.')
if (!registry.includes("id: 'lesson-8'")) failures.push('Lesson 8 must stay registered before Lesson 9.')
if (registry.indexOf("id: 'lesson-8'") > registryStart) {
  failures.push('Lesson 9 must come after Lesson 8 in the registry order.')
}
if (!home.includes('lessonRegistry')) failures.push('The homepage does not build its index from the lesson registry.')
if (!app.includes('LessonNine') || !app.includes("lesson.id === 'lesson-9'")) {
  failures.push('App does not route lesson-9 through LessonNine.')
}
if (!main.includes('styles/lesson-nine.css')) failures.push('lesson-nine.css is not imported by the app entry.')
if (!styles.includes('.lesson-nine-')) failures.push('lesson-nine.css does not define the Lesson 9 styles.')
if (!packageJson.includes('check:lesson9')) failures.push('package.json does not expose npm run check:lesson9.')
if (!/validate[\s\S]*check:lesson9/.test(packageJson)) failures.push('npm run validate does not include check:lesson9.')

/* 2. sequential LessonFlow architecture only */
if (!lesson.includes('LessonFlow') || !lesson.includes('LessonStepDefinition')) {
  failures.push('Lesson 9 must use the sequential LessonFlow architecture.')
}
if ((lesson.match(/<LessonFlow/g) ?? []).length !== 1) failures.push('Lesson 9 must render exactly one LessonFlow.')
if (/SectionNav|scrollIntoView|IntersectionObserver/.test(lesson)) {
  failures.push('Lesson 9 contains a forbidden long-page navigation primitive.')
}
if (!lesson.includes('<TeacherSpace password="somer173">')) {
  failures.push('Teacher material is not protected by TeacherSpace with the Lesson 9 password somer173.')
}

/* 3. step structure and outline groups */
const stepPattern = /step\('([^']+)', '([^']+)', '([^']+)', '([^']+)'/g
const steps = [...lesson.matchAll(stepPattern)]
if (steps.length < 41) failures.push(`Lesson 9 sequential flow is too short: ${steps.length} steps.`)
const expectedGroups = [
  'البداية',
  'التمهيد والمراجعة',
  'القاعدة الأساسية',
  'أخوات كان',
  'القاعدة الذهبية',
  'طريقة الاكتشاف',
  'الأمثلة السهلة',
  'قبل كان وبعدها',
  'الإعراب الكامل',
  'الإعراب الفرعي',
  'خبر كان',
  'كان وليس وصار',
  'الأخطاء الشائعة',
  'المقارنة النهائية',
  'الأمثلة المحلولة',
  'الأنشطة التطبيقية',
  'مراجعة أسئلة المصدر',
  'التحدي المتقدم',
  'الخلاصة',
  'الاختبار الإلكتروني',
  'منطقة المعلم',
]
const usedGroups = steps.map((match) => match[3])
for (const group of expectedGroups) {
  if (!usedGroups.includes(group)) failures.push(`Missing LessonOutline group: ${group}`)
}
for (const group of new Set(usedGroups)) {
  if (!expectedGroups.includes(group)) failures.push(`Lesson step uses an unexpected outline group: ${group}`)
}
// The outline groups consecutive equal names, so a group must never be split in two.
for (let index = 0; index < usedGroups.length; index += 1) {
  if (usedGroups.indexOf(usedGroups[index]) !== index && usedGroups[index - 1] !== usedGroups[index]) {
    failures.push(`Outline group "${usedGroups[index]}" is not contiguous in the sequential flow.`)
  }
}
for (const match of steps) {
  if (!match[4]) failures.push(`Lesson step ${match[1]} has no outline icon.`)
}
if (!steps.some((match) => match[1] === 'platform-test')) failures.push('Lesson 9 has no platform test step.')
if (!steps.some((match) => match[1] === 'solutions')) failures.push('Lesson 9 has no solutions step.')
if (!steps.some((match) => match[1] === 'teacher')) failures.push('Lesson 9 has no teacher area step.')

/* 4. objectives and identity */
for (const objective of [
  'معرفة معنى كان وأخواتها.',
  'معرفة تأثيرها في الجملة الاسمية.',
  'التمييز بين اسم كان وخبر كان.',
  'معرفة إعراب اسم كان وخبرها.',
  'استخدام أشهر أخوات كان في جمل صحيحة.',
  'التمييز بين الجملة الاسمية قبل دخول كان وبعد دخولها.',
  'إعراب الجمل التي تحتوي على كان وأخواتها.',
  'فهم الفرق بين اسم كان وخبر كان.',
  'تجنب الأخطاء الشائعة في استعمالها.',
]) {
  requirePhrase(objective, `Lesson 9 objective ${objective}`, lesson)
}
requirePhrase('الدرس التاسع: كان وأخواتها', 'lesson title in the intro step', lesson)

/* 5. the quick review of the nominal sentence */
requirePhrase('مبتدأ + خبر', 'nominal sentence formula', lesson)
requirePhrase('الجوُّ جميلٌ.', 'review example', lesson)
requirePhrase('الجوُّ: مبتدأ مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.', 'review: complete parsing of the subject', lesson)
requirePhrase('جميلٌ: خبر مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.', 'review: complete parsing of the predicate', lesson)
requirePhrase('المبتدأ مرفوع، والخبر مرفوع.', 'review rule', lesson)

/* 6. the definition, the core rule, and the golden rule */
requirePhrase('مجموعة من الأفعال التي تدخل على الجملة الاسمية.', 'definition', lesson)
requirePhrase('ترفع المبتدأ، ويسمى <strong>اسمها</strong>.', 'definition: raises the subject', lesson)
requirePhrase('وتنصب الخبر، ويسمى <strong>خبرها</strong>.', 'definition: installs the predicate', lesson)
requirePhrase('كان وأخواتها ترفع الاسم وتنصب الخبر.', 'core / golden rule', lesson)
requirePhrase('كانَ الطالبُ مجتهدًا.', 'core example', lesson)
requirePhrase('الطالبُ: اسم كان مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.', 'core example parsing: ism', lesson)
requirePhrase('مجتهدًا: خبر كان منصوب، وعلامة نصبه الفتحة الظاهرة على آخره.', 'core example parsing: khabar', lesson)
requirePhrase('كانَ الطفلُ سعيدًا.', 'terminology example', lesson)
requirePhrase('الطفلُ: اسم كان.', 'terminology: ism kana', lesson)
requirePhrase('سعيدًا: خبر كان.', 'terminology: khabar kana', lesson)

/* 7. the eight sisters: verbs, meanings, examples */
for (const verb of ['كانَ', 'أصبحَ', 'أمسى', 'أضحى', 'ظلَّ', 'باتَ', 'صارَ', 'ليسَ']) {
  requirePhrase(`verb: '${verb}'`, `sister verb ${verb}`, lesson)
}
for (const meaning of [
  'اتصاف في الماضي',
  'الدخول في الصباح أو التحول',
  'الدخول في المساء',
  'التحول أو وقت الضحى',
  'الاستمرار غالبًا في النهار',
  'الاستمرار أو الحدوث في الليل',
  'التحول',
  'النفي',
]) {
  requirePhrase(`tableMeaning: '${meaning}'`, `sister meaning ${meaning}`, lesson)
}
for (const example of [
  'كانَ الجوُّ جميلًا.',
  'أصبحَ الجوُّ معتدلًا.',
  'أمسى الطفلُ متعبًا.',
  'أضحى الجوُّ باردًا.',
  'ظلَّ الطالبُ مجتهدًا.',
  'باتَ الطفلُ نائمًا.',
  'صارَ الماءُ ثلجًا.',
  'ليسَ الطالبُ غائبًا.',
]) {
  requirePhrase(`example: '${example}'`, `sister example ${example}`, lesson)
}
requirePhrase('أي أن الماء تحوّل إلى ثلج.', 'sara meaning note', lesson)
requirePhrase('أي: الطالب ليس غائبًا.', 'laysa meaning note', lesson)
requirePhrase('جدول أشهر أخوات كان: الفعل والمعنى أو الدلالة الشائعة.', 'sisters table caption', lesson)
requirePhrase('لا تحتاج إلى حفظ جميع التفاصيل الزمنية لكل فعل الآن؛ المهم أن تفهم عملها النحوي.', 'table note', lesson)
const sisterCount = (lesson.match(/verb: '/g) ?? []).length
if (sisterCount < 8) failures.push(`Lesson 9 lists ${sisterCount} sister verbs; expected at least 8.`)

/* 8. the three-step discovery method */
requirePhrase('ابحث عن كان أو إحدى أخواتها.', 'discovery step one', lesson)
requirePhrase('من أو ما الذي نتحدث عنه؟', 'discovery step two', lesson)
requirePhrase('ماذا نقول عنه؟', 'discovery step three', lesson)
requirePhrase('الجوُّ ← اسم كان. جميلًا ← خبر كان.', 'discovery example outcome', lesson)
requirePhrase('id="lesson9-discovery"', 'discovery interaction hook', lesson)

/* 9. the four easy examples with complete parsing */
for (const sentence of [
  'كانَ الطالبُ نشيطًا.',
  'أصبحَ الجوُّ معتدلًا.',
  'صارَ الطفلُ قويًّا.',
  'ليسَ الطريقُ طويلًا.',
]) {
  requirePhrase(`sentence: '${sentence}'`, `easy example ${sentence}`, lesson)
}
for (const parsing of [
  'الطالبُ: اسم كان مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.',
  'نشيطًا: خبر كان منصوب، وعلامة نصبه الفتحة الظاهرة على آخره.',
  'الجوُّ: اسم أصبح مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.',
  'معتدلًا: خبر أصبح منصوب، وعلامة نصبه الفتحة الظاهرة على آخره.',
  'الطفلُ: اسم صار مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.',
  'قويًّا: خبر صار منصوب، وعلامة نصبه الفتحة الظاهرة على آخره.',
  'الطريقُ: اسم ليس مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.',
  'طويلًا: خبر ليس منصوب، وعلامة نصبه الفتحة الظاهرة على آخره.',
]) {
  requirePhrase(parsing, `easy example parsing ${parsing}`, lesson)
}

/* 10. the before/after comparisons and the copular-verb term */
for (const pair of [
  ['الجوُّ جميلٌ.', 'كانَ الجوُّ جميلًا.'],
  ['الطالبُ مجتهدٌ.', 'كانَ الطالبُ مجتهدًا.'],
  ['البيتُ واسعٌ.', 'كانَ البيتُ واسعًا.'],
  ['السماءُ صافيةٌ.', 'كانتِ السماءُ صافيةً.'],
  ['الطالبُ كسولٌ.', 'ليسَ الطالبُ كسولًا.'],
  ['الولدُ سعيدٌ.', 'كانَ الولدُ سعيدًا.'],
]) {
  requirePhrase(pair[0], `comparison before: ${pair[0]}`, lesson)
  requirePhrase(pair[1], `comparison after: ${pair[1]}`, lesson)
}
for (const id of ['weather', 'student', 'house', 'sky', 'lazy', 'boy']) {
  requirePhrase(`<BeforeAfter id="${id}" />`, `interactive transformation ${id}`, lesson)
}
requirePhrase('مبتدأ ← اسم كان', 'role shift: subject becomes ism kana', lesson)
requirePhrase('خبر ← خبر كان', 'role shift: predicate becomes khabar kana', lesson)
requirePhrase('بالنسبة للخبر: مرفوع ← منصوب', 'role shift: predicate case change', lesson)
requirePhrase('الأفعال الناسخة', 'copular-verb term', lesson)
requirePhrase('كلمة «ناسخة» تعني أنها تدخل على الجملة الاسمية فتُحدث تغييرًا في حكمها الإعرابي.', 'nasikha definition', lesson)
requirePhrase('قبل كان: مبتدأ مرفوع + خبر مرفوع', 'before/after rule (before)', lesson)
requirePhrase('بعد كان: اسم كان مرفوع + خبر كان منصوب', 'before/after rule (after)', lesson)
requirePhrase('المبتدأ والخبر ← مرفوعان', 'final comparison: both raised', lesson)
requirePhrase('اسم كان ← مرفوع', 'final comparison: ism raised', lesson)
requirePhrase('خبر كان ← منصوب', 'final comparison: khabar installed', lesson)

/* 11. complete parsing everywhere, including the sub-sign applications */
for (const parsing of [
  'كانَ: فعل ماضٍ ناسخ مبني على الفتحة الظاهرة على آخره.',
  'كانتِ: فعل ماضٍ ناسخ مبني على الفتحة الظاهرة على آخره، والتاء تاء التأنيث الساكنة.',
  'الطالبانِ: اسم كان مرفوع، وعلامة رفعه الألف لأنه مثنى.',
  'مجتهدَينِ: خبر كان منصوب، وعلامة نصبه الياء لأنه مثنى.',
  'المعلمونَ: اسم كان مرفوع، وعلامة رفعه الواو لأنه جمع مذكر سالم.',
  'حاضرينَ: خبر كان منصوب، وعلامة نصبه الياء لأنه جمع مذكر سالم.',
  'الطالباتُ: اسم كان مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.',
  'مجتهداتٍ: خبر كان منصوب، وعلامة نصبه الكسرة نيابة عن الفتحة لأنه جمع مؤنث سالم.',
  'أبوك: اسم كان مرفوع، وعلامة رفعه الواو نيابة عن الضمة؛ لأنه من الأسماء الخمسة، وهو مضاف.',
  'كريمًا: خبر كان منصوب، وعلامة نصبه الفتحة الظاهرة على آخره.',
]) {
  requirePhrase(parsing, `complete parsing line ${parsing}`, lesson)
}
requirePhrase('كانَ الطالبانِ مجتهدَينِ.', 'dual example', lesson)
requirePhrase('كانَ المعلمونَ حاضرينَ.', 'sound masculine plural example', lesson)
requirePhrase('كانتِ الطالباتُ مجتهداتٍ.', 'sound feminine plural example', lesson)
requirePhrase('كانَ أبوك كريمًا.', 'five names example', lesson)
requirePhrase('كان وأخواتها لا تلغي قواعد الإعراب الفرعية، بل نطبق القواعد معًا.', 'sub-signs keep working', lesson)

/* 12. the predicate may be a prepositional phrase — introductory only */
requirePhrase('كانَ الطالبُ في المدرسةِ.', 'prepositional predicate example', lesson)
requirePhrase('شبه جملة', 'prepositional predicate term', lesson)
requirePhrase('وسنتوسع في أنواع الخبر لاحقًا.', 'source note: expansion comes later', lesson)
for (const forbidden of [
  'كان التامة',
  'كان الناقصة',
  'تصريف كان',
  'تقديم خبر كان وتأخيره',
  'حذف خبر كان',
]) {
  const studentArea = lesson.slice(0, lesson.indexOf('function TeacherArea'))
  if (studentArea.includes(forbidden)) {
    failures.push(`The student area expands an advanced topic that must stay out of Lesson 9: ${forbidden}`)
  }
}

/* 13. negation, kana vs laysa, kana vs sara */
requirePhrase('ليسَ الطالبُ كسولًا.', 'negation example', lesson)
requirePhrase('الطالبُ: اسم ليس مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.', 'negation parsing: ism', lesson)
requirePhrase('كسولًا: خبر ليس منصوب، وعلامة نصبه الفتحة الظاهرة على آخره.', 'negation parsing: khabar', lesson)
requirePhrase('كانَ الطفلُ صغيرًا.', 'kana vs laysa: kana example', lesson)
requirePhrase('ليسَ الطفلُ صغيرًا.', 'kana vs laysa: laysa example', lesson)
requirePhrase('كانَ الماءُ باردًا.', 'kana vs sara: kana example', lesson)
requirePhrase('صارَ الماءُ باردًا.', 'kana vs sara: sara example', lesson)
requirePhrase('كان = اتصاف أو حالة', 'kana vs sara conclusion: kana', lesson)
requirePhrase('صار = تحوّل', 'kana vs sara conclusion: sara', lesson)

/* 14. the four common errors with their reasons and an interactive correction */
const errorCount = (lesson.match(/label: 'الخطأ (الأول|الثاني|الثالث|الرابع)'/g) ?? []).length
if (errorCount !== 4) failures.push(`Lesson 9 has ${errorCount} common errors; expected exactly 4.`)
for (const [bad, good, reason] of [
  ['كانَ الطالبُ مجتهدٌ.', 'كانَ الطالبُ مجتهدًا.', 'لأن خبر كان منصوب.'],
  ['كانَ الطالبَ مجتهدًا.', 'كانَ الطالبُ مجتهدًا.', 'لأن اسم كان مرفوع.'],
  ['صارَ الماءُ ثلجٌ.', 'صارَ الماءُ ثلجًا.', 'لأن «ثلجًا» خبر صار منصوب.'],
  ['ليسَ الطالبَ غائبًا.', 'ليسَ الطالبُ غائبًا.', 'اسم ليس مرفوع.'],
]) {
  requirePhrase(`bad: '${bad}'`, `common error ${bad}`, lesson)
  requirePhrase(`good: '${good}'`, `common error correction ${good}`, lesson)
  requirePhrase(`reason: '${reason}'`, `common error reason ${reason}`, lesson)
}
requirePhrase('id="lesson9-errors-activity"', 'error-correction interaction hook', lesson)

/* 15. the five worked examples with complete parsing */
for (const sentence of [
  'كانَ الجوُّ جميلًا.',
  'أصبحَ الطفلُ نشيطًا.',
  'صارَ الطالبانِ متفوقَينِ.',
  'ظلَّ المعلمونَ حاضرينَ.',
  'كانتِ الطالباتُ سعيداتٍ.',
]) {
  requirePhrase(`sentence: '${sentence}'`, `worked example ${sentence}`, lesson)
}
for (const parsing of [
  'الطفلُ: اسم أصبح مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.',
  'نشيطًا: خبر أصبح منصوب، وعلامة نصبه الفتحة الظاهرة على آخره.',
  'الطالبانِ: اسم صار مرفوع، وعلامة رفعه الألف لأنه مثنى.',
  'متفوقَينِ: خبر صار منصوب، وعلامة نصبه الياء لأنه مثنى.',
  'المعلمونَ: اسم ظل مرفوع، وعلامة رفعه الواو لأنه جمع مذكر سالم.',
  'حاضرينَ: خبر ظل منصوب، وعلامة نصبه الياء لأنه جمع مذكر سالم.',
  'الطالباتُ: اسم كان مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.',
  'سعيداتٍ: خبر كان منصوب، وعلامة نصبه الكسرة نيابة عن الفتحة لأنه جمع مؤنث سالم.',
]) {
  requirePhrase(parsing, `worked example parsing ${parsing}`, lesson)
}
const workedCount = (lesson.match(/title: 'المثال (الأول|الثاني|الثالث|الرابع|الخامس)'/g) ?? []).length
if (workedCount !== 5) failures.push(`Lesson 9 has ${workedCount} worked examples; expected exactly 5.`)

/* 16. the two source activities: 7 transformation sentences + 5 element sentences */
for (const sentence of [
  'الجوُّ جميلٌ.',
  'الطالبُ نشيطٌ.',
  'الطريقُ طويلٌ.',
  'السماءُ صافيةٌ.',
  'الطفلانِ سعيدانِ.',
  'المعلمونَ حاضرونَ.',
  'الطالباتُ مجتهداتٌ.',
]) {
  requirePhrase(`before: '${sentence}'`, `activity one sentence ${sentence}`, lesson)
}
for (const result of [
  'كانَ الجوُّ جميلًا.',
  'كانَ الطالبُ نشيطًا.',
  'كانَ الطريقُ طويلًا.',
  'كانتِ السماءُ صافيةً.',
  'كانَ الطفلانِ سعيدَينِ.',
  'كانَ المعلمونَ حاضرينَ.',
  'كانتِ الطالباتُ مجتهداتٍ.',
]) {
  requirePhrase(`result: '${result}'`, `activity one model answer ${result}`, lesson)
}
requirePhrase('انتبه إلى تغيير الخبر.', 'activity one warning', lesson)
requirePhrase('id="lesson9-activity-1"', 'activity one hook', lesson)
for (const sentence of [
  'كانَ الأبُ متعبًا.',
  'أصبحَ الجوُّ باردًا.',
  'صارَ الماءُ ساخنًا.',
  'ليسَ الطفلُ مريضًا.',
  'ظلَّ الطالبُ مجتهدًا.',
]) {
  requirePhrase(`sentence: '${sentence}'`, `activity two sentence ${sentence}`, lesson)
}
requirePhrase('id="lesson9-activity-2"', 'activity two hook', lesson)
requirePhrase('الفعل الناسخ.', 'elements to identify: the verb', lesson)
requirePhrase('اسم الفعل الناسخ.', 'elements to identify: the ism', lesson)
requirePhrase('خبر الفعل الناسخ.', 'elements to identify: the khabar', lesson)

/* 17. the advanced challenge: five sentences and six requirements each */
for (const sentence of [
  'كانَ أبو خالدٍ كريمًا.',
  'أصبحَ الطالبانِ مستعدَّينِ.',
  'صارَ المعلمونَ محبوبينَ.',
  'كانتِ الطالباتُ نشيطاتٍ.',
  'ليسَ أخو الطالبِ غائبًا.',
]) {
  requirePhrase(`sentence: '${sentence}'`, `challenge sentence ${sentence}`, lesson)
}
for (const requirement of [
  'الفعل الناسخ.',
  'اسم الفعل الناسخ.',
  'خبر الفعل الناسخ.',
  'علامة إعراب اسم الفعل الناسخ.',
  'علامة إعراب خبره.',
  'ولماذا استُخدمت هذه العلامة.',
]) {
  requirePhrase(requirement, `challenge requirement ${requirement}`, lesson)
}
requirePhrase('أبو: اسم كان مرفوع، وعلامة رفعه الواو نيابة عن الضمة؛ لأنه من الأسماء الخمسة، وهو مضاف.', 'challenge parsing: abu', lesson)
requirePhrase('خالدٍ: مضاف إليه مجرور، وعلامة جره الكسرة الظاهرة على آخره.', 'challenge parsing: mudaf ilayhi', lesson)
requirePhrase('أخو: اسم ليس مرفوع، وعلامة رفعه الواو نيابة عن الضمة؛ لأنه من الأسماء الخمسة، وهو مضاف.', 'challenge parsing: akhu', lesson)
requirePhrase('id="lesson9-challenge"', 'challenge interaction hook', lesson)

/* 18. the 27 source questions are represented verbatim and fully answered */
const sourceNumbers = (lesson.match(/number: (\d+),\n    section: sourceSections\./g) ?? []).length
if (sourceNumbers !== 27) failures.push(`Lesson 9 represents ${sourceNumbers} source questions; expected exactly 27.`)
for (const prompt of [
  'ماذا تفعل كان وأخواتها؟',
  'في الجملة: كانَ الطالبُ مجتهدًا. كلمة "الطالبُ" هي:',
  'في الجملة نفسها، كلمة "مجتهدًا" هي:',
  'علامة رفع اسم كان في: كانَ الطالبُ مجتهدًا هي:',
  'علامة نصب خبر كان في الجملة السابقة:',
  'أي جملة صحيحة؟',
  'أي كلمة من الآتية من أخوات كان؟',
  '"صار" تدل غالبًا على:',
  'كان وأخواتها ترفع الاسم وتنصب الخبر.',
  'خبر كان مرفوع دائمًا.',
  'اسم كان منصوب دائمًا.',
  '"صار" من أخوات كان.',
  '"ليس" من أخوات كان.',
  'في "كان الطالبانِ مجتهدينِ" كلمة "الطالبانِ" مرفوعة بالألف.',
  'في "كان المعلمونَ حاضرينَ" كلمة "المعلمونَ" مرفوعة بالواو.',
  'كانَ الجوُّ معتدلًا.',
  'أصبحَ الطالبُ نشيطًا.',
  'صارَ الطفلانِ قويَّينِ.',
  'ظلَّ المعلمونَ حاضرِينَ.',
  'كانتِ الطالباتُ مجتهداتٍ.',
  'كانَ الطالبَ مجتهدًا.',
  'أصبحَ الجوُّ جميلٌ.',
  'صارَ الماءُ باردٌ.',
  'ليسَ الطفلَ غائبًا.',
  'حوّل: الولدُ سعيدٌ إلى جملة تبدأ بـ: كان... ثم اشرح ما الذي تغير في الإعراب.',
  'لماذا نقول: كانَ الطالبُ مجتهدًا ولا نقول: كانَ الطالبَ مجتهدٌ؟ اكتب القاعدة.',
  'ما الفرق في المعنى بين: كانَ الماءُ باردًا. و: صارَ الماءُ باردًا.',
]) {
  requirePhrase(`prompt: '${prompt}'`, `source question ${prompt}`, lesson)
}
for (const answer of [
  'ب) ترفع الاسم وتنصب الخبر.',
  'ج) اسم كان.',
  'ب) خبر كان.',
  'ج) الضمة.',
  'ب) الفتحة.',
  'ج) كانَ الطالبُ مجتهدًا.',
  'ب) ليس.',
  'ج) التحول.',
  'صح.',
  'خطأ؛ خبر كان منصوب في الأصل.',
  'خطأ؛ اسم كان مرفوع.',
  'صح؛ لأن "الطالبانِ" مثنى، والمثنى يُرفع بالألف.',
  'صح؛ لأن جمع المذكر السالم يُرفع بالواو.',
  'كانَ الطالبُ مجتهدًا.',
  'أصبحَ الجوُّ جميلًا.',
  'صارَ الماءُ باردًا.',
  'ليسَ الطفلُ غائبًا.',
  'الطالب اسم كان، واسم كان مرفوع.',
  'جميلًا خبر أصبح منصوب.',
  'باردًا خبر صار منصوب.',
  'الطفل اسم ليس مرفوع.',
  'إذن الذي تغير هو إعراب الخبر.',
  'المعنى أن الماء تحوّل وأصبح باردًا.',
]) {
  requirePhrase(answer, `source answer ${answer}`, lesson)
}
requirePhrase('الطفلانِ: اسم صار مرفوع، وعلامة رفعه الألف لأنه مثنى.', 'source answer 18 parsing', lesson)
requirePhrase('قويَّينِ: خبر صار منصوب، وعلامة نصبه الياء لأنه مثنى.', 'source answer 18 parsing (khabar)', lesson)
requirePhrase('المعلمونَ: اسم ظل مرفوع، وعلامة رفعه الواو لأنه جمع مذكر سالم.', 'source answer 19 parsing', lesson)
requirePhrase('حاضرينَ: خبر ظل منصوب، وعلامة نصبه الياء لأنه جمع مذكر سالم.', 'source answer 19 parsing (khabar)', lesson)
requirePhrase('مجتهداتٍ: خبر كان منصوب، وعلامة نصبه الكسرة نيابة عن الفتحة لأنه جمع مؤنث سالم.', 'source answer 20 parsing', lesson)
requirePhrase('هذه أسئلة المصدر للمراجعة، وليست اختبار المنصة النهائي', 'source review is not the platform test', lesson)
requirePhrase('حلول أسئلة نهاية الدرس في المصدر (١–٢٧)', 'teacher answer key heading', lesson)

/* 19. the platform test: exactly 20 new questions with the required blueprint */
const quizBlock = lesson.slice(lesson.indexOf('const quizQuestions'), lesson.indexOf('interface TestResult'))
const quizIds = [...quizBlock.matchAll(/id: 'q(\d+)'/g)].map((match) => Number(match[1]))
if (quizIds.length !== 20) failures.push(`The platform test has ${quizIds.length} questions; expected exactly 20.`)
if (quizIds.some((id, index) => id !== index + 1)) failures.push('The platform test question ids are not sequential 1–20.')
const levelCounts = {}
for (const level of ['أساسي', 'متوسط', 'متقدم', 'تفكير']) {
  levelCounts[level] = (quizBlock.match(new RegExp(`level: '${level}'`, 'g')) ?? []).length
}
if (levelCounts['أساسي'] !== 6) failures.push(`Platform test basic questions: ${levelCounts['أساسي']}; expected 6.`)
if (levelCounts['متوسط'] !== 7) failures.push(`Platform test medium questions: ${levelCounts['متوسط']}; expected 7.`)
if (levelCounts['متقدم'] !== 4) failures.push(`Platform test advanced questions: ${levelCounts['متقدم']}; expected 4.`)
if (levelCounts['تفكير'] !== 3) failures.push(`Platform test thinking questions: ${levelCounts['تفكير']}; expected 3.`)
for (const type of [
  'اختيار من متعدد',
  'صح أم خطأ',
  'تحديد اسم الناسخ',
  'مطابقة',
  'اختيار علامة الإعراب',
  'تحديد عناصر الجملة',
  'ترتيب',
  'تطبيق على المثنى',
  'تطبيق على جمع المذكر السالم',
  'تطبيق على جمع المؤنث السالم',
  'إكمال',
  'تطبيق على الأسماء الخمسة',
  'تحليل خطأ',
  'تحويل',
  'تحليل جملة',
  'سؤال تفكير',
  'تحليل ومقارنة',
  'اكتشاف خطأ وتصحيحه',
]) {
  if (!quizBlock.includes(`type: '${type}'`)) failures.push(`The platform test is missing the question type: ${type}`)
}
if (!quizBlock.includes("kind: 'multi'")) failures.push('The platform test has no multi-select questions.')
if (!quizBlock.includes("kind: 'text'")) failures.push('The platform test has no completion (text) questions.')
const solutionCount = (quizBlock.match(/solution:/g) ?? []).length
if (solutionCount !== 20) failures.push(`The platform test has ${solutionCount} solutions; expected 20 explanatory solutions.`)
const explanationCount = (quizBlock.match(/explanation:/g) ?? []).length
if (explanationCount !== 20) failures.push(`The platform test has ${explanationCount} explanations; expected 20.`)
// The platform test must not reuse the 27 source questions.
const sourceBlock = lesson.slice(lesson.indexOf('const sourceQuestions'), lesson.indexOf('const sourcePlaceholders'))
const sourcePrompts = [...sourceBlock.matchAll(/prompt: '([^']+)'/g)].map((match) => match[1])
const quizPrompts = [...quizBlock.matchAll(/prompt: '([^']+)'/g)].map((match) => match[1])
for (const prompt of quizPrompts) {
  if (sourcePrompts.includes(prompt)) failures.push(`The platform test copies a source question: ${prompt}`)
}

/* 20. test UX rules: no feedback before submit, restart clears answers */
requirePhrase('الإجابات الصحيحة إلا بعد تسليم الاختبار.', 'no-feedback-before-submit note', lesson)
requirePhrase('تسليم الاختبار', 'submit button', lesson)
requirePhrase('أعد الاختبار', 'restart button in the test', lesson)
requirePhrase('أعد المحاولة', 'restart button in activities', lesson)
requirePhrase('data-testid="lesson9-official-test"', 'platform test hook', lesson)
requirePhrase('data-testid="lesson9-solutions"', 'solutions hook', lesson)
if (!/setSubmitted\(false\)[\s\S]{0,120}setAnswers\(\{\}\)/.test(lesson)) {
  failures.push('Restarting the platform test must clear the submitted state and the previous answers.')
}
if (!/onReset=\{\(\) => setTestResult\(null\)\}/.test(lesson)) {
  failures.push('Restarting the platform test must also clear the previous result.')
}
const testArea = lesson.slice(lesson.indexOf('function TestArea'), lesson.indexOf('function SolutionsArea'))
for (const leaked of ['is-good', 'is-bad', 'الإجابة الصحيحة', 'إجابة صحيحة', 'الإجابة النموذجية']) {
  if (testArea.includes(leaked)) failures.push(`The platform test leaks feedback before submission: ${leaked}`)
}
if (!/disabled=\{submitted\}/.test(testArea)) failures.push('The platform test fields must be disabled after submission.')

/* 21. solutions area: gated, grouped five per group, explanatory */
for (const group of [
  'المجموعة الأولى: الأسئلة 1–5',
  'المجموعة الثانية: الأسئلة 6–10',
  'المجموعة الثالثة: الأسئلة 11–15',
  'المجموعة الرابعة: الأسئلة 16–20',
]) {
  requirePhrase(group, `solutions group ${group}`, lesson)
}
requirePhrase('الإجابة الصحيحة:', 'solutions show the correct answer label', lesson)
requirePhrase('التفسير:', 'solutions include an explanation label', lesson)
requirePhrase('أكمل «اختبار الدرس التاسع» وسلّمه أولًا', 'solutions are gated behind the test', lesson)
if (!/result: TestResult \| null/.test(lesson)) failures.push('Solutions must be gated on the submitted test result.')

/* 22. teacher area sections */
for (const section of [
  'أ. شرح الدرس للمعلم',
  'ب. حلول أنشطة الدرس',
  'ج. حلول الأمثلة المحلولة (٥ أمثلة)',
  'د. حلول أسئلة نهاية الدرس في المصدر (١–٢٧)',
  'هـ. حلول التحدي المتقدم (٥ جمل)',
  'و. ملاحظات المعلم',
  'ز. ملخص الدرس',
  '1. أهداف الدرس',
  '2. القاعدة الأساسية',
  '3. أخوات كان الثمانية ومعانيها',
  '4. جميع أمثلة الدرس',
  '5. المقارنات قبل كان وبعدها',
  '6. شرح اسم كان وخبرها',
  '7. شرح الأفعال الناسخة',
  '8. الإعرابات الكاملة',
  '9. تطبيق المثنى',
  '10. جمع المذكر السالم',
  '11. جمع المؤنث السالم',
  '12. الأسماء الخمسة (ربط بالدرس السابق)',
  '13. خبر كان شبه الجملة (مثال تمهيدي فقط)',
  '14. ليس وكان',
  '15. كان وصار',
  '16. الأخطاء الشائعة وحلولها',
  'النشاط الأول: أدخل كان على الجملة (٧ جمل)',
  'النشاط الثاني: حدد عناصر الجملة (٥ جمل)',
  'حلول تفاعلات الدرس',
]) {
  requirePhrase(section, `teacher area section ${section}`, lesson)
}
for (const note of [
  '1. لا تجعل الطالب يحفظ قائمة الأخوات فقط',
  '2. اربط الدرس بالدروس السابقة',
  '3. وضّح أن قواعد الإعراب الفرعية ما زالت تعمل',
  '4. لا تدخل في التفاصيل المتقدمة الآن',
  '5. ملاحظات تصحيحية (ثلاثة أشياء يجب التأكد من أن الطالب فهمها)',
  '6. اختبار المنصة وحلوله',
]) {
  requirePhrase(note, `teacher teaching note ${note}`, lesson)
}
requirePhrase('password="somer173"', 'teacher password somer173', lesson)

/* 23. the summary and the teaser of the next lesson */
requirePhrase('ملخص الدرس', 'lesson summary', lesson)
requirePhrase('كان – أصبح – أمسى – أضحى – ظل – بات – صار – ليس', 'summary list of the sisters', lesson)
requirePhrase('كان ← اتصاف في الماضي.', 'summary meaning: kana', lesson)
requirePhrase('صار ← التحول.', 'summary meaning: sara', lesson)
requirePhrase('ليس ← النفي.', 'summary meaning: laysa', lesson)
requirePhrase('قاعدة سريعة للحفظ', 'quick memorization rule', lesson)
requirePhrase('مفتاح الحفظ', 'memory key', lesson)
requirePhrase('إنَّ وأخواتها', 'next-lesson teaser', lesson)
requirePhrase('شرح المنصة', 'platform explanation label', lesson)

/* 24. every displayed parsing is complete, never abbreviated */
const shorthand = /(مرفوع|منصوب|مجرور) بال(ضمة|فتحة|كسرة|ألف|ياء|واو)(?!\s*(الظاهرة|نيابة|مقدرة|ظاهرة))/g
const lines = lesson.split('\n')
lines.forEach((line, index) => {
  if (line.includes('لا يُقبل')) return // the only allowed mention: the warning that forbids it
  shorthand.lastIndex = 0
  const match = shorthand.exec(line)
  if (match) {
    // A complete form always states why the sign is used, or describes the ending.
    const complete = /(لأنه|لأنها|نيابة|الظاهرة|على آخره|على آخرها)/.test(line.slice(match.index))
    if (!complete) failures.push(`Lesson 9 line ${index + 1} uses an abbreviated parsing: ${match[0]}`)
  }
})
// The audit must also cover the parsing blocks that Lesson 9 renders.
for (const block of ['parsing: [', 'lines: [']) {
  if (!lesson.includes(block)) failures.push(`Lesson 9 has no ${block} blocks to audit.`)
}

/* 25. the parsing audit must cover Lesson 9 */
if (!parsingCheck.includes('LessonNine.tsx')) failures.push('scripts/check-parsing.mjs does not audit LessonNine.tsx.')

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}

const levelSummary = `أساسي ${levelCounts['أساسي']} / متوسط ${levelCounts['متوسط']} / متقدم ${levelCounts['متقدم']} / تفكير ${levelCounts['تفكير']}`
console.log(
  `Lesson 9 source audit passed: ${steps.length} sequential steps in ${new Set(usedGroups).size} outline groups; ` +
    `the nine objectives; the nominal-sentence review and six before/after transformations; the definition and the ` +
    `golden rule (ترفع الاسم وتنصب الخبر); the eight sisters with their meanings and examples; the three-step ` +
    `discovery method; four easy examples and five worked examples with complete parsing; the four sub-sign ` +
    `applications (المثنى، جمع المذكر السالم، جمع المؤنث السالم، الأسماء الخمسة); the prepositional predicate as an ` +
    `introductory example only; ليس وكان، وكان وصار؛ four common errors with an interactive correction; the two ` +
    `source activities (7 + 5 sentences) and the five-sentence advanced challenge; all 27 source questions with ` +
    `model answers; an independent ${quizIds.length}-question platform test (${levelSummary}) with no feedback before ` +
    `submission; explanatory solutions in four groups of five; the password-protected Teacher Area; and no ` +
    `abbreviated parsing anywhere in the lesson.`,
)
