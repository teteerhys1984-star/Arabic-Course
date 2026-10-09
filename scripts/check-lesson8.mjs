import { readFileSync, existsSync } from 'node:fs'

/**
 * Source-fidelity audit for Lesson 8 (الأسماء الخمسة).
 *
 * It verifies the lesson against the authoritative source: registration and routing, the
 * sequential LessonFlow architecture, the nine objectives, the preparation/connection
 * with علامات الإعراب الفرعية, the five names with their three forms and meanings, the
 * core rule (واو/ألف/ياء), the five conditions with their examples, the جامع table, the
 * فو/فم distinction, «ذو» بمعنى صاحب, the comparison with المثنى, the nine worked
 * examples, the nine-sentence application activity, all 25 source end-of-lesson
 * questions with complete answers in the Teacher Area, the six common errors, the
 * summary/golden key, the homework, the extra challenge, the independent 20-question
 * platform test (6 أساسي / 7 متوسط / 4 متقدم / 3 تفكير) with no feedback before
 * submission, the explanatory solutions area, and the password-protected Teacher Area.
 */
const failures = []

function read(path) {
  if (!existsSync(path)) {
    failures.push(`Missing required file: ${path}`)
    return ''
  }
  return readFileSync(path, 'utf8')
}

const lesson = read('src/lessons/LessonEight.tsx')
const registry = read('src/lessons/registry.ts')
const app = read('src/app/App.tsx')
const home = read('src/app/CourseHome.tsx')
const packageJson = read('package.json')
const parsingCheck = read('scripts/check-parsing.mjs')
const styles = read('src/styles/lesson-eight.css')
const main = read('src/main.tsx')
const sharedSolutions = read('src/shared/test/components/SolutionsArea.tsx')
const fullSource = `${lesson}\n${registry}\n${app}\n${sharedSolutions}`

function requirePhrase(phrase, label = phrase, haystack = fullSource) {
  if (!haystack.includes(phrase)) failures.push(`Missing Lesson 8 source phrase: ${label}`)
}

/* 1. registration, routing, homepage card, styles */
if (!existsSync('src/lessons/LessonEight.tsx')) failures.push('LessonEight.tsx is missing.')
if (!registry.includes("id: 'lesson-8'")) failures.push('Lesson 8 is not registered in the lesson registry.')
requirePhrase('الدرس الثامن: الأسماء الخمسة', 'Lesson 8 document title', registry)
const registryStart = registry.indexOf("id: 'lesson-8'")
const registryEntry =
  registryStart === -1 ? '' : registry.slice(registryStart, registry.indexOf('}', registry.indexOf('parts:', registryStart)))
if (!/available:\s*true/.test(registryEntry)) failures.push('Lesson 8 is not marked available, so it is not reachable from the homepage.')
if (!registryEntry.includes("title: 'الأسماء الخمسة'")) failures.push('Lesson 8 registry entry is incomplete.')
if (!home.includes('lessonRegistry')) failures.push('The homepage does not build its index from the lesson registry.')
if (!app.includes('LessonEight') || !app.includes("lesson.id === 'lesson-8'")) {
  failures.push('App does not route lesson-8 through LessonEight.')
}
if (!main.includes("styles/lesson-eight.css")) failures.push('lesson-eight.css is not imported by the app entry.')
if (!styles.includes('.lesson-eight-')) failures.push('lesson-eight.css does not define the Lesson 8 styles.')
if (!packageJson.includes('check:lesson8')) failures.push('package.json does not expose npm run check:lesson8.')
if (!/validate[\s\S]*check:lesson8/.test(packageJson)) failures.push('npm run validate does not include check:lesson8.')

/* 2. sequential LessonFlow architecture only */
if (!lesson.includes('LessonFlow') || !lesson.includes('LessonStepDefinition')) {
  failures.push('Lesson 8 must use the sequential LessonFlow architecture.')
}
if ((lesson.match(/<LessonFlow/g) ?? []).length !== 1) failures.push('Lesson 8 must render exactly one LessonFlow.')
if (/SectionNav|scrollIntoView|IntersectionObserver/.test(lesson)) {
  failures.push('Lesson 8 contains a forbidden long-page navigation primitive.')
}
if (!lesson.includes('<TeacherSpace password="somer173">')) {
  failures.push('Teacher material is not protected by TeacherSpace with the Lesson 8 password somer173.')
}

/* 3. step structure and outline groups */
const stepPattern = /step\('([^']+)', '([^']+)', '([^']+)', '([^']+)'/g
const steps = [...lesson.matchAll(stepPattern)]
if (steps.length < 35) failures.push(`Lesson 8 sequential flow is too short: ${steps.length} steps.`)
const expectedGroups = [
  'البداية',
  'التمهيد والربط',
  'التعرف إلى الأسماء الخمسة',
  'القاعدة الأساسية',
  'الأسماء واحدًا واحدًا',
  'الجدول الجامع',
  'الشروط',
  'المقارنات',
  'الأمثلة المحلولة',
  'النشاط التطبيقي',
  'مراجعة أسئلة المصدر',
  'الأخطاء الشائعة',
  'الخلاصة',
  'التحدي والواجب',
  'الاختبار الإلكتروني',
  'منطقة المعلم',
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

/* 4. objectives and topic coverage */
for (const objective of [
  'معرفة ما المقصود بالأسماء الخمسة.',
  'حفظ الأسماء الخمسة وتمييزها.',
  'معرفة علامات إعرابها.',
  'معرفة متى تُعرب بالحروف بدل الحركات.',
  'التمييز بين الواو والألف والياء في إعرابها.',
  'إعراب الأسماء الخمسة إعرابًا صحيحًا.',
  'معرفة الشروط التي تجعل الاسم من الأسماء الخمسة.',
  'اكتشاف الأخطاء الشائعة في استعمالها.',
  'الربط بين الأسماء الخمسة ودرس علامات الإعراب الفرعية.',
]) {
  requirePhrase(objective, `Lesson 8 objective ${objective}`, lesson)
}

for (const name of ["أب", "أخ", "حم", "فو", "ذو"]) {
  requirePhrase(`name: '${name}',`, `five names entry ${name}`, lesson)
}
for (const form of ['أبو', 'أبا', 'أبي', 'أخو', 'أخا', 'أخي', 'حمو', 'حما', 'حمي', 'فا', 'ذا', 'ذي']) {
  requirePhrase(`'${form}'`, `name form ${form}`, lesson)
}
for (const meaning of ['الوالد', 'الأخ', 'الفم', 'صاحب', 'قريب الزوج أو الزوجة من أهلها، ويُستعمل في ألفاظ القرابة']) {
  requirePhrase(meaning, `name meaning ${meaning}`, lesson)
}
requirePhrase('الأسماء الخمسة تُرفع بالواو، وتُنصب بالألف، وتُجر بالياء.', 'core rule')
requirePhrase('الأسماء الخمسة ترفع بالواو، وتنصب بالألف، وتجر بالياء.', 'memorization sentence')

/* 5. the جامع table and the case-sign table */
requirePhrase('جدول الأسماء الخمسة: احفظ هذا الجدول جيدًا.', 'flagship table caption', lesson)
requirePhrase('علامات إعراب الأسماء الخمسة.', 'case-sign table caption', lesson)
for (const header of ['<th scope="col">الاسم</th>', '<th scope="col">الرفع</th>', '<th scope="col">النصب</th>', '<th scope="col">الجر</th>']) {
  requirePhrase(header, `table header ${header}`, lesson)
}

/* 6. the five conditions with their examples */
for (const condition of [
  'أن تكون مفردة',
  'أن تكون مضافة',
  'ألا تكون مضافة إلى ياء المتكلم',
  'في «فو»: حذف الميم',
  '«ذو» تكون بمعنى «صاحب»',
]) {
  requirePhrase(condition, `condition ${condition}`, lesson)
}
requirePhrase('جاءَ أبوانِ', 'first condition counter-example (dual)', lesson)
requirePhrase('جاءَ أبي.', 'third condition example (yaa al-mutakallim)', lesson)
requirePhrase('أبي: فاعل مرفوع، وعلامة رفعه ضمة مقدرة.', 'third condition parsing', lesson)
requirePhrase('هذا فمُ الطفلِ.', 'fa/fam counter-example (fam)', lesson)
requirePhrase('هذا فو الطفلِ.', 'fa/fam example (fu)', lesson)
requirePhrase('رجلٌ ذو مالٍ', 'dhu = sahib example', lesson)

/* 7. the comparison with the dual */
requirePhrase('جاءَ أبو الطالبِ.', 'dual comparison: five names', lesson)
requirePhrase('«أبوان» مثنى، وعلامة رفعه الألف', 'dual comparison explanation', lesson)
requirePhrase('المثنى', 'dual comparison term', lesson)

/* 8. the nine worked examples with complete parsing */
for (const parsing of [
  'أبو: فاعل مرفوع، وعلامة رفعه الواو نيابة عن الضمة؛ لأنه من الأسماء الخمسة، وهو مضاف.',
  'أبا: مفعول به منصوب، وعلامة نصبه الألف نيابة عن الفتحة؛ لأنه من الأسماء الخمسة، وهو مضاف.',
  'أبي: اسم مجرور بـ"على"، وعلامة جره الياء نيابة عن الكسرة؛ لأنه من الأسماء الخمسة، وهو مضاف.',
  'أخو: فاعل مرفوع، وعلامة رفعه الواو نيابة عن الضمة؛ لأنه من الأسماء الخمسة، وهو مضاف.',
  'أخا: مفعول به منصوب، وعلامة نصبه الألف نيابة عن الفتحة؛ لأنه من الأسماء الخمسة، وهو مضاف.',
  'أخي: اسم مجرور بـ"مع"، وعلامة جره الياء نيابة عن الكسرة؛ لأنه من الأسماء الخمسة، وهو مضاف.',
  'ذو: نعت مرفوع، وعلامة رفعه الواو نيابة عن الضمة؛ لأنه من الأسماء الخمسة، وهو مضاف.',
  'ذا: نعت منصوب، وعلامة نصبه الألف نيابة عن الفتحة؛ لأنه من الأسماء الخمسة، وهو مضاف.',
  'ذي: نعت مجرور، وعلامة جره الياء نيابة عن الكسرة؛ لأنه من الأسماء الخمسة، وهو مضاف.',
]) {
  requirePhrase(parsing, `full parsing line ${parsing}`, lesson)
}
const workedCount = (lesson.match(/number: [1-9],\n    title: 'المثال/g) ?? []).length
if (workedCount !== 9) failures.push(`Lesson 8 has ${workedCount} worked examples; expected exactly 9.`)

/* 9. the nine-sentence application activity */
for (const sentence of [
  'جاءَ أبو أحمدَ.',
  'رأيتُ أبا أحمدَ.',
  'سلّمتُ على أبي أحمدَ.',
  'حضرَ أخو الطالبِ.',
  'ساعدتُ أخا الطالبِ.',
  'جلستُ مع أخي الطالبِ.',
  'هذا رجلٌ ذو خلقٍ.',
  'رأيتُ رجلًا ذا خلقٍ.',
  'مررتُ برجلٍ ذي خلقٍ.',
]) {
  requirePhrase(`'${sentence}'`, `application sentence ${sentence}`, lesson)
}
requirePhrase('استخرج الاسم من الأسماء الخمسة، ثم حدد حالته الإعرابية:', 'application instruction')

/* 10. the 25 source questions are represented and fully answered */
const sourceAnswers = [
  'ب) أب.',
  'ج) الواو.',
  'ب) الألف.',
  'ج) الياء.',
  'ب) جاءَ أبو خالدٍ.',
  'ج) رأيتُ أبا خالدٍ.',
  'ج) مررتُ بأبي خالدٍ.',
  'أ) صاحب.',
  'صح.',
  'خطأ؛ الأسماء الخمسة تُنصب بالألف.',
  'صح.',
  'خطأ؛ "فم" بالميم لا تُعامل معاملة "فو" في باب الأسماء الخمسة.',
]
for (const answer of sourceAnswers) requirePhrase(answer, `source answer ${answer}`, lesson)
const sourceNumbers = (lesson.match(/number: (\d+),\n    section: sourceSections\./g) ?? []).length
if (sourceNumbers !== 25) failures.push(`Lesson 8 represents ${sourceNumbers} source questions; expected exactly 25.`)
for (const phrase of [
  'لماذا لا يصح أن نقول: رأيتُ أبو محمدٍ، بينما يصح أن نقول: جاءَ أبو محمدٍ؟ اشرح السبب.',
  'ما الفرق في الإعراب بين: جاءَ أبو الطالبِ. و: جاءَ أبوانِ.',
  'صحح الجملة الآتية: سلّمتُ على أخو الطالبِ. ثم اشرح لماذا صححتها بهذه الطريقة.',
  'الجملة الصحيحة: سلّمتُ على أخي الطالبِ.',
]) {
  requirePhrase(phrase, `source thinking question ${phrase}`, lesson)
}
requirePhrase('حلول أسئلة نهاية الدرس في المصدر (١–٢٥)', 'teacher answer key heading')

/* 11. the six common errors */
const errorCount = (lesson.match(/number: [1-6],\n    bad: '/g) ?? []).length
if (errorCount !== 6) failures.push(`Lesson 8 has ${errorCount} common errors; expected exactly 6.`)
for (const [bad, good] of [
  ['جاءَ أبا محمدٍ.', 'جاءَ أبو محمدٍ.'],
  ['رأيتُ أبو محمدٍ.', 'رأيتُ أبا محمدٍ.'],
  ['مررتُ على أبو محمدٍ.', 'مررتُ على أبي محمدٍ.'],
  ['جاءَ أخا الطالبِ.', 'جاءَ أخو الطالبِ.'],
  ['رأيتُ أخو الطالبِ.', 'رأيتُ أخا الطالبِ.'],
  ['هذا فمُ الطفلِ، وفمُ من الأسماء الخمسة.', 'هذا فو الطفلِ، و"فو" الخالية من الميم هي التي تدخل في الأسماء الخمسة.'],
]) {
  requirePhrase(`bad: '${bad}'`, `common error ${bad}`, lesson)
  requirePhrase(`good: '${good}'`, `common error correction ${good}`, lesson)
}
for (const reason of [
  'لأن "أبا" منصوبة، بينما الفاعل مرفوع.',
  'لأن "أبا" مفعول به منصوب، والأسماء الخمسة تُنصب بالألف.',
  'لأن الاسم بعد حرف الجر مجرور، والأسماء الخمسة تُجر بالياء.',
  'إذا كانت الكلمة "فم" بالميم فلا نعاملها هنا معاملة الأسماء الخمسة.',
]) {
  requirePhrase(reason, `common error reason ${reason}`, lesson)
}

/* 12. the platform test: exactly 20 questions with the required difficulty blueprint */
const quizBlock = lesson.slice(lesson.indexOf('const quizQuestions'), lesson.indexOf('function toTestQuestion'))
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
for (const type of ['اختيار من متعدد', 'صح أم خطأ', 'مطابقة', 'تحديد الحالة الإعرابية', 'إكمال', 'ترتيب', 'اختيار متعدد', 'إعراب', 'تحليل جملة', 'اكتشاف خطأ', 'سؤال تفكير']) {
  if (!quizBlock.includes(`type: '${type}'`)) failures.push(`The platform test is missing the question type: ${type}`)
}
if (!quizBlock.includes("kind: 'multi'")) failures.push('The platform test has no multi-select questions.')
if (!quizBlock.includes("kind: 'text'")) failures.push('The platform test has no completion (text) questions.')
const solutionCount = (quizBlock.match(/solution:/g) ?? []).length
if (solutionCount !== 20) failures.push(`The platform test has ${solutionCount} solutions; expected 20 explanatory solutions.`)

/* 13. test UX rules: page-level checking via the shared framework; restart clears answers */
requirePhrase('لا تظهر التغذية الراجعة ولا الإجابات الصحيحة إلا بعد التحقق من الصفحة.', 'no-feedback-before-page-check note')
requirePhrase('أعد المحاولة', 'restart button in activities')
requirePhrase('testId="lesson8-official-test"', 'platform test hook')
requirePhrase('testId="lesson8-solutions"', 'solutions hook')
if (!lesson.includes('export const testDefinition: TestDefinition')) failures.push('The platform test must be declared once in the shared platform schema (testDefinition).')
if (!lesson.includes('<TestRunner')) failures.push('The platform test must render through the shared TestRunner (page-level «تحقّق من الإجابات» on every page).')
if (!lesson.includes('useTestEngine(testDefinition)')) failures.push('The platform test must use the shared engine so answers and page results survive navigation.')
if (!lesson.includes("matching: 'loose'")) failures.push('The platform test must keep its harakat-insensitive grading (matching: loose).')
if (lesson.includes('setTestResult') || lesson.includes('const [testResult')) failures.push('The platform test must not keep legacy result state; the shared engine owns results and reset.')
// The bespoke submit-only TestArea must be gone; feedback now appears only per checked page.
if (lesson.includes('function TestArea')) failures.push('The bespoke TestArea must be replaced by the shared TestRunner.')
if (lesson.includes('disabled={submitted}')) failures.push('The platform test must not lock fields after submission; rechecking after edits is required.')

/* 14. solutions area: shared structured area, gated per checked page, grouped five per group */
if (!lesson.includes('<SolutionsArea')) failures.push('The solutions step must render the shared SolutionsArea.')
if (!lesson.includes('engine={testEngine}')) failures.push('The solutions area must share the test engine (per-page reveal).')
for (const group of [
  'المجموعة الأولى: الأسئلة 1–5',
  'المجموعة الثانية: الأسئلة 6–10',
  'المجموعة الثالثة: الأسئلة 11–15',
  'المجموعة الرابعة: الأسئلة 16–20',
]) {
  requirePhrase(group, `solutions group ${group}`, lesson)
}
requirePhrase('الإجابة الصحيحة:', 'solutions show the correct answer label', sharedSolutions)
requirePhrase('التفسير:', 'solutions include an explanation label', sharedSolutions)
if (lesson.includes('function SolutionsArea')) failures.push('The bespoke SolutionsArea must be replaced by the shared SolutionsArea.')

/* 15. teacher area sections */
for (const section of [
  'أ. شرح الدرس للمعلم',
  'ب. حلول أنشطة الدرس',
  'ج. حلول الأمثلة المحلولة (٩ أمثلة)',
  'د. حلول أسئلة نهاية الدرس في المصدر (١–٢٥)',
  'هـ. الواجب: نموذج الإجابة',
  'و. ملاحظات تدريسية',
  'النشاط التطبيقي (٩ جمل)',
  'حلول التفاعلات السبعة',
  'الربط بالدرس السابق: علامات الإعراب الفرعية',
  'إعراب «ذو» في المصدر',
]) {
  requirePhrase(section, `teacher area section ${section}`, lesson)
}
for (const note of [
  'الفرق بين العلامة الأصلية والفرعية',
  'الفرق بين الأسماء الخمسة والمثنى',
  'فو وفم',
  'ذو بمعنى صاحب',
  'أخطاء أبو / أبا / أبي',
]) {
  requirePhrase(note, `teacher teaching note ${note}`, lesson)
}
requirePhrase("password=\"somer173\"", 'teacher password somer173', lesson)

/* 16. homework and challenge */
requirePhrase('اكتب ثلاث جمل باستخدام كلمة «أب»', 'homework part A')
requirePhrase('جملة يكون فيها «أب» مرفوعًا.', 'homework: أب مرفوع')
requirePhrase('جملة يكون فيها «أب» منصوبًا.', 'homework: أب منصوب')
requirePhrase('جملة يكون فيها «أب» مجرورًا.', 'homework: أب مجرور')
requirePhrase('ثم اكتب ثلاث جمل باستخدام كلمة «ذو» بمعنى صاحب:', 'homework part B')
requirePhrase('أعرب الجمل الآتية إعرابًا كاملًا:', 'advanced challenge instruction')
for (const sentence of ['جاءَ أبو صديقي.', 'كرمتُ أبا الطالبِ.', 'ذهبتُ مع أخي.', 'هذا رجلٌ ذو فضلٍ.', 'مررتُ برجلٍ ذي خبرةٍ.']) {
  requirePhrase(`'${sentence}'`, `challenge sentence ${sentence}`, lesson)
}
for (const item of ['الفاعل.', 'المفعول به.', 'الاسم المجرور.', 'الاسم من الأسماء الخمسة.', 'علامة الإعراب.', 'سبب استخدام هذه العلامة.']) {
  requirePhrase(item, `challenge requirement ${item}`, lesson)
}

/* 17. the summary, the memorization key, and the «شرح المنصة» labeling */
requirePhrase('ملخص الدرس في صفحة واحدة', 'one-page summary')
requirePhrase('ذو = صاحب', 'summary: dhu = sahib')
requirePhrase('قاعدة سريعة للحفظ', 'quick memorization rule')
requirePhrase('مفتاح الحفظ', 'memory key')
for (const key of ['واو = رفع', 'ألف = نصب', 'ياء = جر']) requirePhrase(key, `memory key ${key}`)
requirePhrase('شرح المنصة', 'platform explanation label')

/* 18. the parsing audit must cover Lesson 8 */
if (!parsingCheck.includes('LessonEight.tsx')) failures.push('scripts/check-parsing.mjs does not audit LessonEight.tsx.')

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}

const levelSummary = `أساسي ${levelCounts['أساسي']} / متوسط ${levelCounts['متوسط']} / متقدم ${levelCounts['متقدم']} / تفكير ${levelCounts['تفكير']}`
console.log(
  `Lesson 8 source audit passed: ${steps.length} sequential steps in ${usedGroups.size} outline groups; ` +
    `five names with their three forms and meanings; the core rule (واو/ألف/ياء); five conditions with examples; ` +
    `the جامع table; 9 worked examples with full parsing; the 9-sentence application activity; all 25 source ` +
    `questions with complete Teacher Area answers; 6 common errors; summary and memory key; homework and challenge; ` +
    `an independent ${quizIds.length}-question platform test (${levelSummary}) with no feedback before submission; ` +
    `explanatory solutions in four groups of five; and the password-protected Teacher Area.`,
)
