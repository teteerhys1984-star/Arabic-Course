import { readFileSync, existsSync } from 'node:fs'

/**
 * Source-fidelity audit for Lesson 10 (إنَّ وأخواتها).
 *
 * It verifies the lesson against the authoritative brief: registration and routing, the
 * sequential LessonFlow architecture with 41 numbered steps, the nine objectives, the
 * definition and golden rule, the base transformation, the comparison with كان, the six
 * sisters and their meanings, the finding-ism method, the five basic examples, the four
 * sub-sign applications, the letter meanings, the four common errors, the seven worked
 * examples, the two activities and the advanced challenge, all 27 source questions in four
 * review steps, the independent 20-question platform test (6 / 7 / 4 / 3) with no feedback
 * before submission, the restartable attempt, the solutions gated on submission, the
 * password-protected Teacher Area (somer173), and the course-wide rules: complete parsing,
 * RTL-safe styling, and no contact information inside lesson content.
 */
const failures = []

function read(path) {
  if (!existsSync(path)) {
    failures.push(`Missing required file: ${path}`)
    return ''
  }
  return readFileSync(path, 'utf8')
}

const lesson = read('src/lessons/LessonTen.tsx')
const content = read('src/lessons/lesson-ten/content.ts')
const grading = read('src/lessons/lesson-ten/grading.ts')
const sharedGrading = read('src/shared/test/grading.ts')
const registry = read('src/lessons/registry.ts')
const app = read('src/app/App.tsx')
const main = read('src/main.tsx')
const packageJson = read('package.json')
const styles = read('src/styles/lesson-ten.css')
const parsingCheck = read('scripts/check-parsing.mjs')
const allLessonCode = `${lesson}\n${content}\n${grading}`

function requirePhrase(source, phrase, label) {
  if (!source.includes(phrase)) failures.push(`${label} is missing: ${phrase}`)
}

/* 1. Registration, routing, and the stylesheet import. */
if (!/id:\s*'lesson-10'/.test(registry)) failures.push('registry.ts must register lesson-10.')
const lessonTenEntry = registry.slice(registry.indexOf("id: 'lesson-10'"))
if (!/number:\s*'١٠'/.test(lessonTenEntry)) failures.push("lesson-10 registry number must be '١٠'.")
if (!/title:\s*'إنَّ وأخواتها'/.test(lessonTenEntry)) failures.push("lesson-10 registry title must be 'إنَّ وأخواتها'.")
if (!/available:\s*true/.test(lessonTenEntry)) failures.push('lesson-10 registry entry must be available.')
if (!/lesson\.id === 'lesson-10'[\s\S]*?<LessonTen /.test(app)) failures.push('App.tsx must route lesson-10 to LessonTen.')
if (!/import \{ LessonTen \} from '\.\.\/lessons\/LessonTen'/.test(app)) failures.push('App.tsx must import LessonTen.')
if (!/import '\.\/styles\/lesson-ten\.css'/.test(main)) failures.push('main.tsx must import lesson-ten.css.')
if (!/"check:lesson10": "node scripts\/check-lesson10\.mjs"/.test(packageJson)) {
  failures.push('package.json must define check:lesson10.')
}
if (!/npm run check:lesson9 && npm run check:lesson10 && npm run check:parsing/.test(packageJson)) {
  failures.push('The validate chain must run check:lesson10 after check:lesson9 and before check:parsing.')
}

/* 2. One LessonFlow, sequential steps, and exactly 41 numbered steps. */
if ((lesson.match(/<LessonFlow\b/g) ?? []).length !== 1) failures.push('LessonTen must render exactly one LessonFlow.')
for (const attr of ['lessonTitle="إنَّ وأخواتها"', 'lessonNumber="١٠"', 'lessonEyebrow="الدرس العاشر"']) {
  requirePhrase(lesson, attr, 'LessonFlow header')
}
const exports = [...lesson.matchAll(/^export (?:function|const) (\w+)/gm)].map((match) => match[1])
if (!exports.includes('LessonTen') || exports.some((name) => !['LessonTen', 'testDefinition'].includes(name))) {
  failures.push('LessonTen.tsx must export only the lesson component and its shared testDefinition.')
}
const stepPattern = /step\('([a-z0-9-]+)',\s*'([^']+)',\s*'([^']+)'/g
const steps = [...lesson.matchAll(stepPattern)].map((match) => ({ id: match[1], title: match[2], group: match[3] }))
if (steps.length !== 41) failures.push(`LessonTen must define exactly 41 steps; found ${steps.length}.`)
const numbered = steps.filter((step) => /^\d+\. /.test(step.title)).map((step) => Number(step.title.split('.')[0]))
const expectedNumbers = Array.from({ length: numbered.length }, (_, index) => index + 1)
if (numbered.length !== 39 || numbered.some((value, index) => value !== expectedNumbers[index])) {
  failures.push('Numbered step titles must run 1 to 39 in order.')
}
const groups = new Set(steps.map((step) => step.group))
for (const group of [
  'البداية',
  'التمهيد والمراجعة',
  'القاعدة الأساسية',
  'المقارنة مع كان',
  'أشهر أخوات إنَّ',
  'طريقة العمل',
  'اسم إنَّ وخبرها',
  'الإعراب الفرعي',
  'معاني الحروف الناسخة',
  'الأخطاء الشائعة',
  'المقارنة الشاملة',
  'الأمثلة المحلولة',
  'الأنشطة التطبيقية',
  'مراجعة أسئلة المصدر',
  'التحدي المتقدم',
  'الخلاصة',
  'الاختبار الإلكتروني',
  'منطقة المعلم',
]) {
  if (!groups.has(group)) failures.push(`Outline group is missing: ${group}`)
}
for (const id of ['intro', 'objectives', 'platform-test', 'solutions', 'teacher', 'five', 'lakinna']) {
  if (!steps.some((step) => step.id === id)) failures.push(`Missing step id: ${id}`)
}

/* 3. Student Area: objectives, definition, golden rule, base example, comparison. */
const objectiveBlock = content.slice(content.indexOf('export const objectives'), content.indexOf('export interface Particle'))
const objectiveCount = (objectiveBlock.match(/^\s+'/gm) ?? []).length
if (objectiveCount !== 9) failures.push(`The lesson must list exactly 9 objectives; found ${objectiveCount}.`)
requirePhrase(content, "export const coreRule = 'إنَّ وأخواتها تنصب الاسم وترفع الخبر.'", 'Golden rule')
requirePhrase(content, 'before: ', 'Base transformation')
requirePhrase(content, "before: 'الطالبُ مجتهدٌ.'", 'Base example before')
requirePhrase(content, "after: 'إنَّ الطالبَ مجتهدٌ.'", 'Base example after')
requirePhrase(content, "kana: 'كانَ الطالبُ مجتهدًا.'", 'Kana comparison sentence')
requirePhrase(content, "inna: 'إنَّ الطالبَ مجتهدٌ.'", 'Inna comparison sentence')
requirePhrase(content, "sentence: 'الطالبُ مجتهدٌ.'", 'Comparison without particle')
requirePhrase(content, "sentence: 'كانَ الطالبُ مجتهدًا.'", 'Comparison with kana')
requirePhrase(content, "sentence: 'إنَّ الطالبَ مجتهدٌ.'", 'Comparison with inna')

/* 4. Sisters, meanings, and their examples. */
const sisterMeanings = [
  ["word: 'إنَّ'", "meaning: 'التوكيد'"],
  ["word: 'أنَّ'", "meaning: 'التوكيد'"],
  ["word: 'كأنَّ'", "meaning: 'التشبيه'"],
  ["word: 'لكنَّ'", "meaning: 'الاستدراك'"],
  ["word: 'ليتَ'", "meaning: 'التمني'"],
  ["word: 'لعلَّ'", "meaning: 'الترجي أو التوقع'"],
]
for (const [word, meaning] of sisterMeanings) {
  const start = content.indexOf(word)
  if (start === -1 || !content.slice(start, start + 240).includes(meaning)) {
    failures.push(`Sister ${word} must carry ${meaning}.`)
  }
}
const sisterExamples = [
  'إنَّ العلمَ نافعٌ.',
  'علمتُ أنَّ العلمَ نافعٌ.',
  'كأنَّ القمرَ مصباحٌ.',
  'الطريقُ طويلٌ، لكنَّ السفرَ ممتعٌ.',
  'ليتَ النجاحَ قريبٌ.',
  'لعلَّ الخيرَ قريبٌ.',
]
for (const sentence of sisterExamples) requirePhrase(content, sentence, 'Sister example')
requirePhrase(content, 'لا محل له من الإعراب.', 'Particle parsing standard')
requirePhrase(content, "export const laitaNote = 'اسم ليتَ ولعلَّ منصوب، وخبرها مرفوع.'", 'Source note for ليتَ/لعلَّ')

/* 5. Finding the ism in five steps and five basic examples. */
requirePhrase(lesson, 'لتعرف اسم إنَّ في أي جملة، اتبع هذه الخطوات الخمس:', 'Five-step ism method')
const basicExamples = [
  'إنَّ الطالبَ مجتهدٌ.',
  'إنَّ العلمَ مفيدٌ.',
  'لعلَّ المطرَ قريبٌ.',
  'ليتَ النجاحَ قريبٌ.',
  'كأنَّ البحرَ مرآةٌ.',
]
for (const sentence of basicExamples) requirePhrase(content, `sentence: '${sentence}'`, 'Basic example')

/* 6. Sub-signs with complete parsing. */
const subSigns = [
  ['إنَّ الطالبينِ مجتهدانِ.', 'الطالبينِ: اسم إنَّ منصوب، وعلامة نصبه الياء لأنه مثنى.'],
  ['إنَّ المعلمينَ حاضرونَ.', 'المعلمينَ: اسم إنَّ منصوب، وعلامة نصبه الياء لأنه جمع مذكر سالم.'],
  ['إنَّ الطالباتِ مجتهداتٌ.', 'الطالباتِ: اسم إنَّ منصوب، وعلامة نصبه الكسرة نيابة عن الفتحة لأنه جمع مؤنث سالم.'],
  ['إنَّ أباكَ كريمٌ.', 'أباكَ: اسم إنَّ منصوب، وعلامة نصبه الألف نيابة عن الفتحة؛ لأنه من الأسماء الخمسة، وهو مضاف.'],
  ['إنَّ أخاكَ مجتهدٌ.', 'أخاكَ: اسم إنَّ منصوب، وعلامة نصبه الألف نيابة عن الفتحة؛ لأنه من الأسماء الخمسة، وهو مضاف.'],
]
for (const [sentence, parse] of subSigns) {
  requirePhrase(content, sentence, 'Sub-sign example')
  requirePhrase(content, parse, 'Sub-sign full parsing')
}
requirePhrase(content, 'إنَّ: حرف توكيد ونصب مبني على الفتح لا محل له من الإعراب.', 'Particle full parsing')
requirePhrase(content, 'مجتهدٌ: خبر إنَّ مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.', 'Khabar full parsing')
requirePhrase(content, 'مجتهدانِ: خبر إنَّ مرفوع، وعلامة رفعه الألف لأنه مثنى.', 'Dual khabar parsing')
requirePhrase(content, 'حاضرونَ: خبر إنَّ مرفوع، وعلامة رفعه الواو لأنه جمع مذكر سالم.', 'Masculine khabar parsing')
requirePhrase(content, 'الطالباتِ: اسم إنَّ منصوب', 'Feminine ism parsing')

/* 7. Letter meanings: each letter has a meaning check (Quiz) and an example. */
for (const id of ['tawkid', 'anna', 'laita', 'laalla', 'kaanna', 'lakinna']) {
  if (!steps.some((step) => step.id === id)) failures.push(`Letter step is missing: ${id}`)
}
requirePhrase(content, "id: 'quiz-tawkid'", 'Letter quiz')
requirePhrase(content, "id: 'quiz-anna'", 'Letter quiz')
requirePhrase(content, "id: 'quiz-laita'", 'Letter quiz')
requirePhrase(content, "id: 'quiz-laalla'", 'Letter quiz')
requirePhrase(content, "id: 'quiz-kaanna'", 'Letter quiz')
requirePhrase(content, "id: 'quiz-lakinna'", 'Letter quiz')
requirePhrase(content, "id: 'quiz-nasikha'", 'Nasikha quiz')
requirePhrase(content, 'تفيد التوكيد', 'إنَّ للتوكيد meaning')
requirePhrase(content, 'إنَّ تأتي غالبًا في بداية الجملة، وأنَّ تأتي غالبًا داخل الجملة', 'إنَّ وأنَّ simplified rule')

/* 8. Common errors: four wrong sentences, each corrected with a reason. */
for (const wrong of ['إنَّ الطالبُ مجتهدٌ.', 'إنَّ الطالبَ مجتهدًا.', 'إنَّ الطالبانِ حاضرانِ.', 'إنَّ المعلمونَ مخلصونَ.']) {
  requirePhrase(content, `prompt: '${wrong}'`, 'Common error')
}
const correctionRowCount = (content.match(/fields: \[\s*\{\s*label: 'الجملة الصحيحة'/g) ?? []).length
if (correctionRowCount !== 4) failures.push(`The common-error activity must have 4 corrections; found ${correctionRowCount}.`)
requirePhrase(lesson, 'lesson10-error-correction', 'Common-error activity id')

/* 9. Worked examples: seven complete parsings. */
const workedBlock = content.slice(content.indexOf('export const workedExamples'), content.indexOf('export const activityOneRows'))
const workedCount = (workedBlock.match(/^\s{2}\{\s*$/gm) ?? []).length
if (workedCount !== 7) failures.push(`Worked examples must contain 7 entries; found ${workedCount}.`)
requirePhrase(lesson, 'WorkedStep from={1} to={4}', 'Worked examples 1–4 step')
requirePhrase(lesson, 'WorkedStep from={5} to={7}', 'Worked examples 5–7 step')

/* 10. Activities: seven sentences in activity one, five in activity two, five challenge items. */
const activityOneBlock = content.slice(content.indexOf('export const activityOneRows'), content.indexOf('/** الحلول النموذجية'))
const activityOneCount = (activityOneBlock.match(/^\s{2}\{\s*$/gm) ?? []).length
if (activityOneCount !== 7) failures.push(`Activity one must contain 7 sentences; found ${activityOneCount}.`)
for (const sentence of ['الجوُّ جميلٌ.', 'الطالبُ مجتهدٌ.', 'الطريقُ طويلٌ.', 'الطالبانِ حاضرانِ.', 'المعلمونَ حاضرونَ.', 'الطالباتُ مجتهداتٌ.']) {
  requirePhrase(content, `prompt: '${sentence}'`, 'Activity one sentence')
}
requirePhrase(content, "prompt: 'أبوكَ كريمٌ.'", 'Activity one sentence (أبوك)')
const activityTwoBlock = content.slice(content.indexOf('export const activityTwoRows'), content.indexOf('export const challengeRows'))
const activityTwoCount = (activityTwoBlock.match(/^\s{2}\{\s*$/gm) ?? []).length
if (activityTwoCount !== 5) failures.push(`Activity two must contain 5 sentences; found ${activityTwoCount}.`)
for (const sentence of ['إنَّ الطالبَ نشيطٌ.', 'لعلَّ المطرَ قريبٌ.', 'كأنَّ البحرَ مرآةٌ.', 'إنَّ الطالبينِ مجتهدانِ.', 'إنَّ المعلمينَ مخلصونَ.']) {
  requirePhrase(content, `prompt: '${sentence}'`, 'Activity two sentence')
}
const challengeBlock = content.slice(content.indexOf('export const challengeRows'), content.indexOf('export const challengeWhy'))
const challengeCount = (challengeBlock.match(/^\s{2}\{\s*$/gm) ?? []).length
if (challengeCount !== 5) failures.push(`The advanced challenge must contain 5 sentences; found ${challengeCount}.`)
for (const sentence of ['إنَّ أباكَ كريمٌ.', 'إنَّ أخاكَ مجتهدٌ.', 'إنَّ الطالبينِ متفوقانِ.', 'إنَّ المعلمينَ مخلصونَ.', 'لعلَّ الطالباتِ ناجحاتٌ.']) {
  requirePhrase(content, `prompt: '${sentence}'`, 'Challenge sentence')
}
requirePhrase(lesson, 'لماذا تغيّرت علامة الإعراب؟', 'Challenge reason question')
requirePhrase(content, 'activityOneSolutions', 'Activity one model solutions')
for (const solution of [
  'إنَّ الجوَّ جميلٌ.',
  'إنَّ الطالبَ مجتهدٌ.',
  'إنَّ الطريقَ طويلٌ.',
  'إنَّ الطالبينِ حاضرانِ.',
  'إنَّ المعلمينَ حاضرونَ.',
  'إنَّ الطالباتِ مجتهداتٌ.',
  'إنَّ أباكَ كريمٌ.',
]) {
  requirePhrase(content, `'${solution}'`, 'Activity one model solution')
}

/* 11. Source questions: 27 items in four review steps, with model answers. */
const sourceBlock = content.slice(content.indexOf('export const sourceQuestions'), content.indexOf('export const summaryPoints'))
const sourceNumbers = [...sourceBlock.matchAll(/number:\s*(\d+),/g)].map((match) => Number(match[1]))
if (sourceNumbers.length !== 27 || sourceNumbers.some((value, index) => value !== index + 1)) {
  failures.push(`Source questions must be exactly 1–27 in order; found ${sourceNumbers.length} entries.`)
}
for (const [from, to] of [
  [1, 8],
  [9, 15],
  [16, 20],
  [21, 27],
]) {
  requirePhrase(lesson, `<SourceReview from={${from}} to={${to}} />`, 'Source review step')
}
requirePhrase(lesson, 'sourceQuestions.map((question) => (', 'Teacher model answers for source questions')
requirePhrase(lesson, 'هذه أسئلة المصدر للمراجعة، وليست اختبار المنصة', 'Source review disclaimer')

/* 12. Platform test: exactly 20 new questions, blueprint 6 / 7 / 4 / 3, varied types. */
const testBlock = content.slice(content.indexOf('export const testQuestions'), content.indexOf('export const solutionGroups'))
const testIds = [...testBlock.matchAll(/id:\s*'q(\d{2})'/g)].map((match) => Number(match[1]))
if (testIds.length !== 20 || testIds.some((value, index) => value !== index + 1)) {
  failures.push(`The platform test must have exactly 20 questions q01–q20; found ${testIds.length}.`)
}
const levelCount = (level) => (testBlock.match(new RegExp(`level:\\s*'${level}'`, 'g')) ?? []).length
const blueprint = { أساسي: levelCount('أساسي'), متوسط: levelCount('متوسط'), متقدم: levelCount('متقدم'), تفكير: levelCount('تفكير') }
if (blueprint['أساسي'] !== 6 || blueprint['متوسط'] !== 7 || blueprint['متقدم'] !== 4 || blueprint['تفكير'] !== 3) {
  failures.push(`Test blueprint must be 6 / 7 / 4 / 3; found ${JSON.stringify(blueprint)}.`)
}
const typeCount = new Set([...testBlock.matchAll(/type:\s*'([^']+)'/g)].map((match) => match[1])).size
if (typeCount < 10) failures.push(`The platform test must use varied question types; found ${typeCount} distinct types.`)
const kinds = new Set([...testBlock.matchAll(/kind:\s*'([a-z]+)'/g)].map((match) => match[1]))
for (const kind of ['select', 'multi', 'text']) {
  if (!kinds.has(kind)) failures.push(`The platform test must include a ${kind} question.`)
}
for (const wrong of ['لعلَّ الطالبُ ناجحٌ.', 'ليتَ العطلةَ طويلةٌ.']) {
  if (testBlock.includes(wrong)) failures.push(`Platform test copies a lesson or source sentence: ${wrong}`)
}

/* 13. Page-level checking via the shared framework; solutions gated per checked page. */
requirePhrase(lesson, 'لا تظهر التغذية الراجعة ولا الإجابات الصحيحة إلا بعد التحقق من الصفحة.', 'no-feedback-before-page-check note')
requirePhrase(lesson, 'testId="lesson10-official-test"', 'platform test hook')
requirePhrase(lesson, 'testId="lesson10-solutions"', 'solutions hook')
if (!lesson.includes('export const testDefinition: TestDefinition')) failures.push('The platform test must be declared once in the shared platform schema (testDefinition).')
if (!lesson.includes('<TestRunner')) failures.push('The platform test must render through the shared TestRunner (page-level «تحقّق من الإجابات» on every page).')
if (!lesson.includes('useTestEngine(testDefinition)')) failures.push('The platform test must use the shared engine so answers and page results survive navigation.')
if (!lesson.includes("matching: 'strict'")) failures.push('The platform test must keep its harakat-sensitive grading (matching: strict).')
if (lesson.includes('function TestArea')) failures.push('The bespoke TestArea must be replaced by the shared TestRunner.')
if (lesson.includes('function SolutionsArea')) failures.push('The bespoke SolutionsArea must be replaced by the shared SolutionsArea.')
if (lesson.includes('disabled={submitted}')) failures.push('The platform test must not lock fields after submission; rechecking after edits is required.')
if (lesson.includes('setTestResult') || lesson.includes('const [testResult')) failures.push('The platform test must not keep legacy result state; the shared engine owns results and reset.')
requirePhrase(content, 'export const solutionGroups', 'Solution groups')
for (const [from, to] of [
  [1, 5],
  [6, 10],
  [11, 15],
  [16, 20],
]) {
  requirePhrase(content, `from: ${from}, to: ${to}`, 'Solution group')
}
// The shared grading engine is the single implementation; the lesson adapter delegates to it.
requirePhrase(sharedGrading, "if (!answered) return 'unanswered'", 'Incomplete questions count as unanswered')
requirePhrase(sharedGrading, "compareKey(value[0], matching) === compareKey(field.answer, matching)", 'Choice answers compare with the matching mode (harakat exact in strict mode)')
requirePhrase(grading, "from '../../shared/test'", 'The lesson grading module delegates to the shared engine')
requirePhrase(grading, "gradeQuestions(questions, answers, 'strict')", 'The lesson grading keeps harakat-sensitive comparison')

/* 14. Teacher Area: separate password, complete material. */
requirePhrase(lesson, '<TeacherSpace password="somer173">', 'Teacher password')
const teacherArea = lesson.slice(lesson.indexOf('function TeacherArea('), lesson.indexOf('export function LessonTen('))
for (const section of [
  'أ. شرح الدرس للمعلم',
  'ب. إجابات أسئلة المصدر (27 سؤالًا)',
  'ج. حلول النشاط التطبيقي الأول',
  'د. حلول النشاط التطبيقي الثاني',
  'هـ. حلول الأمثلة المحلولة (7)',
  'و. حلول التحدي المتقدم',
  'ز. حلول اختبار المنصة (20 سؤالًا)',
]) {
  requirePhrase(teacherArea, section, 'Teacher section')
}
requirePhrase(teacherArea, 'activityOneSolutions.map', 'Teacher activity-one solutions')

/* 15. Complete parsing: no shorthand, no abbreviated role labels. */
const shorthand = /(مرفوع|منصوب|مجرور) بال(ضمة|فتحة|كسرة|ألف|ياء|واو)(?!\s*(الظاهرة|نيابة|مقدرة|ظاهرة))/g
for (const [name, source] of [
  ['LessonTen.tsx', lesson],
  ['lesson-ten/content.ts', content],
]) {
  shorthand.lastIndex = 0
  const match = shorthand.exec(source)
  if (match) failures.push(`${name} uses an abbreviated parsing: ${match[0]}`)
}
const abbreviatedLabel = /(?:^|['"`\s])(اسم إنَّ|خبر إنَّ|اسم كانَ|خبر كانَ|اسم أنَّ|خبر أنَّ|اسم لعلَّ|خبر لعلَّ|اسم ليتَ|خبر ليتَ|اسم كأنَّ|خبر كأنَّ|اسم لكنَّ|خبر لكنَّ)(?=\s*[:،])/g
if (abbreviatedLabel.test(content)) {
  failures.push('content.ts uses a bare "اسم إنَّ" label without a complete description.')
}

/* 16. Course-wide rules: no contact, no long-page primitives, RTL-safe styling. */
if (/whatsapp|wa\.me|InstructorContact|instructorDetails|0930215022|963930215022/i.test(allLessonCode)) {
  failures.push('Lesson 10 content must not contain WhatsApp or instructor contact information.')
}
for (const pattern of [/SectionNav/, /scrollIntoView/, /IntersectionObserver/]) {
  if (pattern.test(allLessonCode)) failures.push(`Lesson 10 uses a long-page primitive: ${pattern}`)
}
if (/(?:margin|padding|border|inset)-(?:left|right)\b|(?:^|[\s;{])(?:left|right):|text-align:\s*(?:left|right)\b/m.test(styles)) {
  failures.push('lesson-ten.css must use logical (inline-start/end) properties only.')
}
if (!/\.lesson-ten-platform-note/.test(styles)) failures.push('lesson-ten.css must style the platform note.')

/* 17. Parsing-check coverage: the audit must include the Lesson 10 content. */
if (!/LessonTen\.tsx/.test(parsingCheck) || !/lesson-ten\/content\.ts/.test(parsingCheck)) {
  failures.push('check-parsing.mjs must include the Lesson 10 source files.')
}

if (failures.length) {
  console.error('Lesson 10 audit failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log(
  `Lesson 10 audit passed: ${steps.length} steps, ${objectiveCount} objectives, ${sourceNumbers.length} source questions, ` +
    `${testIds.length}-question platform test (${blueprint['أساسي']} أساسي / ${blueprint['متوسط']} متوسط / ` +
    `${blueprint['متقدم']} متقدم / ${blueprint['تفكير']} تفكير), ${workedCount} worked examples, and no abbreviated parsing.`,
)
