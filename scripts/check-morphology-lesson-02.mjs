/**
 * تدقيق الدرس الثاني من قسم الصرف: «الميزان الصرفي».
 *
 * يتحقق — آليًا — من أن التنفيذ يطابق المادة المعتمدة في
 * docs/source/morphology-lesson-02.md، ومن أن التصحيحات المعتمدة (خ-1 … خ-4)
 * طُبّقت ووثّقت، ومن أن إضافات المنصة موسومة ولا تُنسب إلى المصدر، ومن بنية
 * الاختبار (٤ صفحات، ٢٦ سؤالًا، ٣٠ درجة) ومن التسجيل والتوجيه والأنشطة.
 *
 * هذا التدقيق لا يُضعف أي ضمان من ضمانات الدرس الأول؛ فالأدلة الخاصة بالدرس
 * الأول (check-morphology-lesson-01 وcheck-morphology-source) تبقى كما هي، وقد
 * ضُيّقت عبارات «لا يوجد درس ثانٍ» فيها إلى «لا يوجد درس ثالث» (موثّق في
 * docs/morphology-lesson-02-audit.md).
 */
import { readFileSync, existsSync } from 'node:fs'

const failures = []
const notes = []

function read(path) {
  if (!existsSync(path)) {
    failures.push(`Missing required file: ${path}`)
    return ''
  }
  return readFileSync(path, 'utf8')
}

const source = read('docs/source/morphology-lesson-02.md')
const content = read('src/lessons/morphology-lesson-02/content.ts')
const grading = read('src/lessons/morphology-lesson-02/grading.ts')
const lesson = read('src/lessons/LessonMorphologyTwo.tsx')
const styles = read('src/styles/morphology-lesson-02.css')
const registry = read('src/lessons/registry.ts')
const app = read('src/app/App.tsx')
const entry = read('src/main.tsx')
const audit = read('docs/morphology-lesson-02-audit.md')
const inventory = read('docs/morphology-lesson-02-source-inventory.md')
const password = read('src/shared/teacher/teacherPassword.ts')

/**
 * طبقة المحتوى نفسها (وليس نصها): كل تحقّق بنيوي أدناه يُجرى على البيانات
 * الحقيقية، فلا يكفي أن توجد عبارة في تعليق أو في نص توضيحي.
 */
const C = await import('../src/lessons/morphology-lesson-02/content.ts')

/* ================================================================== *
 * 1. التسجيل والتوجيه
 * ================================================================== */
const count = (text, needle) => text.split(needle).length - 1

if (count(registry, "id: 'morphology-lesson-02'") !== 1) {
  failures.push('morphology-lesson-02 must be registered exactly once.')
}
if (count(registry, "sectionId: 'morphology'") !== 2) {
  failures.push('Section «morphology» must contain exactly two lessons (١ و٢).')
}
if (/morphology-lesson-0[3-9]|morphology-lesson-1\d/.test(registry + lesson + content)) {
  failures.push('No third morphology lesson may be registered or built yet.')
}

const start = registry.indexOf("id: 'morphology-lesson-02'")
const registryEntry = registry.slice(start, start + 900)
for (const [needle, message] of [
  ["sectionId: 'morphology'", 'morphology-lesson-02 must declare sectionId: \'morphology\'.'],
  ["number: '٢'", 'morphology-lesson-02 must be numbered ٢ inside its section.'],
  ['available: true', 'morphology-lesson-02 must be available.'],
  ["strand: 'الصرف'", 'morphology-lesson-02 must keep the الصرف strand label.'],
]) {
  if (!registryEntry.includes(needle)) failures.push(message)
}

if (!/morphology-lesson-02/.test(app) || !/LessonMorphologyTwo/.test(app)) {
  failures.push('App must route morphology-lesson-02 to LessonMorphologyTwo.')
}
if (!/import '\.\/styles\/morphology-lesson-02\.css'/.test(entry)) {
  failures.push('src/main.tsx must import the lesson stylesheet.')
}
if (!/\.morph2-/.test(styles)) {
  failures.push('The lesson stylesheet must scope every rule under the morph2- prefix.')
}
for (const prefix of ['.morph-callout', '.morph-golden', '.spell3-']) {
  if (styles.includes(prefix)) failures.push(`The lesson stylesheet must not reuse another lesson's prefix (${prefix}).`)
}

/* ================================================================== *
 * 2. بنية الدرس: ٣٤ خطوة، أهداف ثمانية، اثنا عشر قسمًا
 * ================================================================== */
const stepIds = [...lesson.matchAll(/step\(\s*'([a-z0-9-]+)'/g)].map((match) => match[1])
const pageSteps = (lesson.match(/\.\.\.testSteps/g) ?? []).length
if (pageSteps !== 1) failures.push('The four test pages must be spread into the flow via ...testSteps.')
// ٣٠ خطوة مصرّح بها + ٤ صفحات اختبار = ٣٤ خطوة.
if (stepIds.length !== 30) failures.push(`The lesson must declare 30 explicit steps plus the 4 test pages (found ${stepIds.length}).`)
for (const id of ['intro', 'objectives', 'train-1', 'train-5', 'submit', 'solutions', 'teacher', 'next-lesson']) {
  if (!stepIds.includes(id)) failures.push(`Missing lesson step: ${id}`)
}
if (new Set(stepIds).size !== stepIds.length) failures.push('Lesson step ids must be unique.')

if (!/export const testDefinition: TestDefinition = C\.testDefinition/.test(lesson)) {
  failures.push('The lesson must declare its test once as a shared TestDefinition.')
}
if (!/useTestEngine\(testDefinition\)/.test(lesson)) {
  failures.push('The lesson must own a shared test engine above LessonFlow.')
}
if (!/<TestPageView/.test(lesson) || !/<SolutionsArea/.test(lesson)) {
  failures.push('The lesson must render its test and solutions through the shared components.')
}
if (!/COURSE_TEACHER_PASSWORD/.test(lesson) || !/<TeacherSpace/.test(lesson)) {
  failures.push('The Teacher Area must be password-gated through the shared TeacherSpace.')
}
if (/disabled=\{submitted\}|function TestArea|function OfficialTest/.test(lesson)) {
  failures.push('The lesson must not use the legacy whole-test patterns.')
}
if (!/allPagesChecked/.test(lesson)) {
  failures.push('The final result must stay gated until every page is checked.')
}
if (lesson.indexOf('export const testDefinition') > lesson.indexOf('export function LessonMorphologyTwo')) {
  failures.push('testDefinition must be exported before the lesson component (platform test-UX rule).')
}

// الأنشطة التفاعلية: لا درس سرديًا طويلًا.
const activities = (lesson.match(/تحقق من الإجابة|تحقق من التصحيح|تحقق من التحليل|تحقق ثم اكشف التحليل/g) ?? []).length
if (activities < 4) failures.push(`The lesson must keep its interactive activities (found ${activities} check actions).`)
for (const testId of ['mapping-lab', 'training-one', 'shadda-lab', 'vowel-quiz', 'morph2-submit']) {
  if (!lesson.includes(testId)) failures.push(`Missing interactive surface: ${testId}`)
}

/* ================================================================== *
 * 3. أهداف الدرس الثمانية — نص المصدر
 * ================================================================== */
const objectiveLines = source
  .split('\n')
  .filter((line) => /^\d\. /.test(line.trim()))
  .slice(0, 8)
  .map((line) => line.trim().replace(/^\d\. /, '').replace(/\.$/, ''))
if (objectiveLines.length !== 8) failures.push('The source must list eight objectives.')
for (const objective of objectiveLines) {
  if (!content.includes(objective)) failures.push(`Objective missing from the implementation: ${objective}`)
}

/* ================================================================== *
 * 4. تغطية نص المصدر (كل سطر جوهري موجود في التنفيذ)
 * ================================================================== */
const harakat = /[\u064B-\u065F\u0670\u0640]/g
const ARABIC_DIGITS = { '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9', '٫': '.', '،': ',' }
const unifyDigits = (text) => text.replace(/[٠-٩٫،]/g, (digit) => ARABIC_DIGITS[digit] ?? digit)
/**
 * تطبيع شكلي لا يمسّ المضمون: يُزيل الحركات والتشكيل الزخرفي، ويوحّد الهمزات
 * والأرقام، ويسقط علامات الترقيم وشرط الفصل (—) وحرفَ الخيار (أ./ب./ج./د.)
 * لأن الواجهة تعرضها في عناصر مستقلة.
 */
const normalize = (text) =>
  unifyDigits(text)
    .replace(harakat, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/[ىي]/g, 'ي')
    .replace(/[*|`>#_]/g, ' ')
    .replace(/[—–]/g, ' ')
    .replace(/[«»"'()\[\]]/g, '')
    .replace(/^\s*\d+\s*[.)-]\s*/, '')
    .replace(/^\s*-\s*/, '')
    .replace(/^\s*[أ-د]\s*[.)-]\s*/, '')
    .replace(/[.,،؛:؟!]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

// التنفيذ = بيانات المحتوى + مكوّن الدرس (بما فيه نصوص التصحيحات المقتبسة).
const implementation = normalize(content) + ' ' + normalize(lesson)

/**
 * التصحيحات المعتمدة: أسطر من المصدر لا يُطلب ورودها حرفيًّا لأنها صُحّحت،
 * ويُتحقق بدلًا من ذلك من وجود البديل الصحيح وغياب الصيغة الخاطئة عن مادة الطالب.
 */
const APPROVED_CORRECTIONS = [
  {
    id: 'خ-1',
    line: 'فهم: فعل',
    where: 'مفتاح الاختبار — القسم الثاني، البند ٢',
    replacement: 'فَهِمَ: فَعِلَ.',
  },
  {
    id: 'خ-2',
    line: 'التاء في «كَتَبَ» غير موجودة أصلًا',
    where: 'القسم الثالث — مثال التنبيه المهم، البند ١',
    replacement: 'التاء في «كَتَبَ» حرف أصلي، وهي عين الكلمة',
  },
  {
    id: 'خ-3',
    line: 'استغفار: الألف والسين والتاء زوائد في صيغة المصدر',
    where: 'القسم الثالث — حروف الزيادة، مثال «استغفار»',
    replacement: 'الألف الثانية بين العين واللام (ألف المصدر) زوائد في صيغة المصدر',
  },
  {
    id: 'خ-3',
    line: 'استخراج: الأصل خ ر ج، والألف والسين والتاء في بنية صيغة',
    where: 'مفتاح التدريب الثاني، البند ٩',
    replacement: 'الألف الأولى والسين والتاء، والألف الثانية (ألف المصدر)',
  },
  {
    id: 'خ-4',
    line: 'كَتِبَ: فَعِلَ من حيث الوزن المجرد',
    where: 'القسم الرابع — اختلاف الحركات يغيّر الوزن',
    replacement: 'حَسَبَ',
  },
]

const sourceBody = source.slice(source.indexOf('-->') + 3)
const substantive = []
const uncovered = []
for (const rawLine of sourceBody.split('\n')) {
  const line = rawLine.trim()
  if (!line) continue
  if (/^[-|]*$/.test(line.replace(/\s/g, ''))) continue // جدول فارغ / فاصل
  if (line.startsWith('|---')) continue
  if (line.startsWith('|')) {
    // صفوف الجداول: تُفحص خلية خلية (إعادة التركيب موثّقة في م-1).
    for (const cell of line.split('|').map((part) => part.trim()).filter(Boolean)) {
      const value = normalize(cell)
      if (value.length < 2) continue
      substantive.push(value)
      if (!implementation.includes(value)) uncovered.push(`[table] ${cell}`)
    }
    continue
  }
  const value = normalize(line)
  if (value.length < 2) continue
  substantive.push(value)
  if (implementation.includes(value)) continue
  // سطر طويل أعيد توزيعه على عناصر أو جمل: يكفي ورود كل جملة منه على حدة.
  const clauses = line
    .split(/[،؛]/)
    .map((part) => normalize(part))
    .filter((part) => part.length > 1)
  if (clauses.length > 1 && clauses.every((clause) => implementation.includes(clause))) continue
  uncovered.push(line)
}

const correctedLines = APPROVED_CORRECTIONS.map((item) => normalize(item.line))
const realFailures = uncovered.filter((line) => !correctedLines.some((corrected) => normalize(line).includes(corrected)))
if (realFailures.length) {
  failures.push(`Source lines not covered by the implementation:\n  - ${realFailures.join('\n  - ')}`)
}
notes.push(`Source coverage: ${substantive.length - uncovered.length}/${substantive.length} substantive lines and table cells covered.`)

/* ================================================================== *
 * 5. التصحيحات المعتمدة: البديل موجود، والخطأ غائب عن مادة الطالب
 * ================================================================== */
for (const correction of APPROVED_CORRECTIONS) {
  if (!content.includes(correction.replacement)) {
    failures.push(`${correction.id}: the approved replacement is missing from the lesson content (${correction.replacement}).`)
  }
  if (!audit.includes(correction.id)) {
    failures.push(`${correction.id}: the correction must be documented in docs/morphology-lesson-02-audit.md.`)
  }
}
/**
 * سطح الإجابة: كل ما يُحتسب أو يُعرض مفتاحًا (إجابات الاختبار وحلوله ومفاتيحه،
 * ومفاتيح التدريبات الخمسة، والبيانات الصرفية) — بلا سجل التدقيق الذي يقتبس
 * الصيغ المرفوضة عمدًا لتوثيق سبب رفضها.
 */
const answerSurface = JSON.stringify({
  test: C.testDefinition.pages.flatMap((page) =>
    page.questions.map((question) => ({
      fields: question.fields.map((field) => ({ answer: field.answer, options: field.options })),
      solution: question.solution,
      teacherAnswer: question.teacherAnswer,
      sourceAnswer: question.sourceAnswer,
    })),
  ),
  keys: C.teacherKeys,
  analysisKeys: C.analysisKeys,
  trainings: [C.trainingOne, C.trainingTwo, C.trainingThree, C.trainingFour, C.trainingFive],
  data: [C.triliteral, C.vowelTriple, C.vowelQuiz, C.nouns, C.quadriliteral, C.extraLetters, C.originalLetters],
})
for (const [wrong, id] of [
  ['فهم: فعل', 'خ-1'],
  ['غير موجودة أصلًا', 'خ-2'],
  ['كَتِبَ', 'خ-4'],
]) {
  if (answerSurface.includes(wrong)) {
    failures.push(`${id}: the rejected wording «${wrong}» must not survive in any answer, key or morphological datum.`)
  }
}
// الصيغة المرفوضة تبقى موثّقة في سجل التصحيحات (لا تُمحى بلا أثر).
const auditLog = JSON.stringify([...C.platformClarifications, C.inlineClarifications])
for (const [wrong, id] of [['فهم: فعل', 'خ-1'], ['غير موجودة أصلًا', 'خ-2'], ['كَتِبَ', 'خ-4']]) {
  if (!auditLog.includes(wrong)) {
    failures.push(`${id}: the rejected wording must remain documented in the platform audit log.`)
  }
}
if (!/فَهِمَ: فَعِلَ/.test(content)) failures.push('خ-1: the corrected key «فَهِمَ: فَعِلَ» must be present.')
if (!content.includes('حَسَبَ') || !content.includes('حَسِبَ') || !content.includes('حَسُبَ')) {
  failures.push('خ-4: the verified triple حَسَبَ/حَسِبَ/حَسُبَ must replace the unattested example.')
}
// خ-3: أربع زوائد في المصدر، وثلاث في الفعل.
if (!/extras: \['ا \(الأولى\)', 'س', 'ت', 'ا \(الثانية\)'\]/.test(content)) {
  failures.push('خ-3: training 2 must list four extras for اسْتِخْراج (including the second alef).')
}
if (!/extras: \['ا', 'س', 'ت'\]/.test(content)) {
  failures.push('خ-3: the verb اسْتَعْمَلَ must keep its three extras.')
}

/* ================================================================== *
 * 6. توحيد الضبط (ض-1، ض-2)
 * ================================================================== */
const dataDump = JSON.stringify(C)
for (const variant of ['مَفْعُول', 'تَفَاعَلَ', 'فَاعَلَ']) {
  if (dataDump.includes(variant)) failures.push(`ض-1: the variant «${variant}» must be unified with the source voweling.`)
}
// كل وزن في المادة (جداول، تدريبات، اختبارات، أنشطة) من قائمة الأوزان الموحّدة.
const CANONICAL_WEIGHTS = new Set([
  'فَعَلَ', 'فَعِلَ', 'فَعُلَ', 'فُعِلَ', 'فاعِل', 'فاعَلَ', 'مَفْعول', 'مِفْعَال', 'مَفْعَلَة', 'مِفْعَل',
  'أَفْعَلَ', 'أَفْعَل', 'أَفْعُل', 'فَعَّلَ', 'تَفَعَّلَ', 'تَفَعُّل', 'تَفاعَلَ', 'تَفْعِيل', 'افْتَعَلَ',
  'فَعْلَلَ', 'فَعْلَلَة', 'تَفَعْلَلَ', 'اسْتَفْعَلَ', 'اسْتِفْعَال', 'انْفَعَلَ', 'انْفِعال',
  'فِعَال', 'فِعْل', 'فَعَل', 'فَعْل', 'فِعْلال',
])
function checkWeight(where, weight) {
  if (typeof weight === 'string' && weight && !CANONICAL_WEIGHTS.has(weight)) {
    failures.push(`ض-1: «${weight}» (${where}) is not one of the ${CANONICAL_WEIGHTS.size} unified voweled weights.`)
  }
}
for (const row of [...C.triliteral.table, ...C.nouns.table, ...C.nouns.moreTable, ...C.vowelTriple.items, ...C.vowelQuiz]) {
  checkWeight('table/quiz row', row.weight)
  for (const option of row.options ?? []) checkWeight('quiz option', option)
}
// تدريبا الوزن فقط: خيارات التدريب الثالث حروف جذور، والرابع عبارات تصحيحية.
for (const item of C.trainingOne.items) {
  checkWeight('training one', item.weight)
  for (const option of item.options ?? []) checkWeight('training one option', option)
}
for (const item of C.trainingTwo.items) checkWeight('training two', item.weight)
for (const item of C.trainingFive.items) {
  checkWeight('training five', item.weight)
  for (const option of item.weightOptions ?? []) checkWeight('training five option', option)
}
// حقل الوزن هو ما begins بـ«الوزن»؛ فحقل «الألف الظاهرة أصلها (شرط نيل درجة الوزن)»
// شرطٌ لنيل الدرجة لا وزنٌ يُضبط، وذكرُه «الوزن» في تسميته لا يُدخله في هذا الفحص.
// والتضييق لا يُنقص التغطية: العدد المفحوص ١٨ حقلًا (١٠ في صفحة الوزن + ٨ في صفحة التحليل).
let weightFields = 0
for (const page of C.testDefinition.pages) {
  for (const question of page.questions) {
    for (const field of question.fields) {
      if (!field.label?.startsWith('الوزن')) continue
      weightFields += 1
      checkWeight(`test q${question.number}`, field.answer)
      for (const option of field.options ?? []) checkWeight(`test q${question.number} option`, option)
    }
  }
}
if (weightFields !== 18) {
  failures.push(`ض-1: the voweled-weight check must cover 18 test fields (found ${weightFields}).`)
}
const haraka = /[\u064B-\u065F\u0670]/
const weightMatches = [...content.matchAll(/weight: '([^']+)'/g)].map((match) => match[1])
if (weightMatches.length < 25) failures.push(`ض-1: expected the lesson data to carry voweled weights (found ${weightMatches.length}).`)
for (const weight of weightMatches) {
  if (!haraka.test(weight)) failures.push(`ض-1: the weight «${weight}» must be fully voweled.`)
}
// الحركات جوهرية في الميزان: المطابقة الصارمة على مستوى التعريف كله.
if (C.testDefinition.matching !== 'strict') {
  failures.push('ض-1: the test must grade its voweled weights with matching: \'strict\'.')
}

/* ================================================================== *
 * 7. الاختبار: ٤ صفحات، ٢٦ سؤالًا، ٣٠ درجة
 * ================================================================== */
const pageIds = [...content.matchAll(/id: 'morph2-([a-z]+)'/g)].map((match) => match[1])
for (const id of ['definitions', 'weights', 'analysis', 'errors']) {
  if (!pageIds.includes(id)) failures.push(`Missing test page: morph2-${id}`)
}
const questionNumbers = [...content.matchAll(/\n    number: (\d+),/g)].map((match) => Number(match[1]))
if (questionNumbers.length !== 26) failures.push(`The final test must keep 26 questions (found ${questionNumbers.length}).`)
for (let index = 0; index < questionNumbers.length; index += 1) {
  if (questionNumbers[index] !== index + 1) failures.push(`Question numbering must run 1–26 without gaps (found ${questionNumbers[index]} at position ${index}).`)
}
for (const title of ['٥ درجات', '١٠ درجات']) {
  if (!content.includes(title)) failures.push(`The test page titles must carry their marks (${title}).`)
}
if (!/total: 30/.test(content) || !/autoMax: 26/.test(content) || !/manualMax: 4/.test(content)) {
  failures.push('The marks policy must state 30 total marks: 26 automatic and 4 manual.')
}
if (!grading.includes('TEST_TOTALS') || !grading.includes('countedAnalysisIds')) {
  failures.push('The grading module must implement the 30-mark computation and the first-five rule.')
}
if (!/analysisRequired: 5/.test(grading) || !/analysisTotal: 8/.test(grading)) {
  failures.push('The first-five-of-eight rule must be explicit in the grading module.')
}
if (!/أول خمس كلمات/.test(content) || !/أول خمس كلمات/.test(lesson)) {
  failures.push('The «first five words» rule must be visible to the student in the test and the result step.')
}
if (!/من إعداد المنصة/.test(content)) {
  failures.push('The marks distribution must be attributed to the platform, never to the source.')
}

/* ================================================================== *
 * 8. مفاتيح الإجابة: لكل سؤال مفتاح، وللتدريبات الخمسة مفاتيح كاملة
 * ================================================================== */
let keyedQuestions = 0
let sourcedQuestions = 0
for (const page of C.testDefinition.pages) {
  for (const question of page.questions) {
    if (question.solution || question.teacherAnswer) keyedQuestions += 1
    else failures.push(`Question ${question.number} has no key (solution or teacherAnswer).`)
    if (question.answerSource === 'source' || question.answerSource === 'platform') sourcedQuestions += 1
    for (const field of question.fields) {
      const label = field.label ?? field.kind
      if ((field.kind === 'select' || field.kind === 'choice') && !field.answer) {
        failures.push(`Question ${question.number}: the «${label}» field needs an answer.`)
      }
      if ((field.kind === 'select' || field.kind === 'choice' || field.kind === 'multi') && !field.options?.length) {
        failures.push(`Question ${question.number}: the «${label}» field needs options.`)
      }
      if (field.kind === 'multi' && !field.answers?.length) {
        failures.push(`Question ${question.number}: the «${label}» field needs answers.`)
      }
      if (field.kind === 'text' && !field.accept?.length) {
        failures.push(`Question ${question.number}: the «${label}» field needs an accepted answer list.`)
      }
      if (field.kind === 'essay' && !question.teacherAnswer) {
        failures.push(`Question ${question.number}: the manual (essay) part needs a teacherAnswer key.`)
      }
    }
  }
}
if (keyedQuestions !== 26) failures.push(`Every one of the 26 test questions needs a key (found ${keyedQuestions}).`)
if (sourcedQuestions < 24) {
  failures.push(`Every automatic question must state whether its key is source-provided or platform-generated (found ${sourcedQuestions}).`)
}
const trainingItems = [C.trainingOne, C.trainingTwo, C.trainingThree, C.trainingFour, C.trainingFive].flatMap((training) => training.items)
if (trainingItems.length !== 44) failures.push(`The five trainings must keep 15+10+5+6+8 = 44 items (found ${trainingItems.length}).`)
const keyedItems = trainingItems.filter((item) => (item.teacherKey ?? item.answer ?? '').toString().trim().length > 0).length
if (keyedItems !== trainingItems.length) {
  failures.push(`Every training item needs a complete key (found ${keyedItems} of ${trainingItems.length}).`)
}
for (const heading of [
  'أ. الإجابات النموذجية التفصيلية للاختبار (٢٦ سؤالًا)',
  'ب. مفتاح التدريب الأول (١٥ كلمة) — نص المصدر',
  'ج. مفتاح التدريب الثاني (١٠ كلمات) — نص المصدر',
  'د. مفتاح التدريب الثالث (٥ أسئلة) — نص المصدر',
  'هـ. مفتاح التدريب الرابع (٦ عبارات) — نص المصدر',
  'و. مفتاح التدريب الخامس (٨ جمل) — نص المصدر',
  'ز. مفتاح الاختبار النهائي — نص المصدر',
  'ح. توزيع الدرجات وقاعدة الاحتساب — من إعداد المنصة',
  'ط. ملاحظات تصحيحية للمعلم — من إعداد المنصة',
  'ي. بطاقة المراجعة — من إعداد المنصة',
  'ك. التصحيحات المعتمدة والتوضيحات التعليمية (سجل التدقيق)',
]) {
  if (!lesson.includes(heading)) failures.push(`The Teacher Area must keep the subsection «${heading}».`)
}

/* ================================================================== *
 * 9. وسم إضافات المنصة، ومنع نسبتها إلى المصدر
 * ================================================================== */
if (!lesson.includes('توضيح تعليمي من المنصة')) {
  failures.push('Platform clarifications must carry the explicit badge «توضيح تعليمي من المنصة».')
}
if (!lesson.includes('تصحيح معتمد')) {
  failures.push('Approved corrections must be flagged in the lesson as «تصحيح معتمد» with their audit id.')
}
for (const phrase of ['قال الكتاب', 'قال المؤلف', 'من الكتاب', 'نص الكتاب']) {
  if (content.includes(phrase) || lesson.includes(phrase)) {
    failures.push(`A platform addition must never be attributed to the book («${phrase}»).`)
  }
}

/* ================================================================== *
 * 10. النظافة: كلمة المرور، والاتجاهات الفيزيائية، وعلامات النقص
 * ================================================================== */
const passwordValue = /COURSE_TEACHER_PASSWORD\s*=\s*'([^']+)'/.exec(password)?.[1] ?? ''
if (!passwordValue) failures.push('The shared teacher password constant could not be read (for the leak check only).')
for (const [name, text] of [
  ['lesson', lesson],
  ['content', content],
  ['grading', grading],
  ['source reference', source],
  ['audit document', audit],
  ['source inventory', inventory],
]) {
  if (passwordValue && text.includes(passwordValue)) failures.push(`The teacher password must not appear in ${name}.`)
}
for (const [name, text] of [
  ['lesson', lesson],
  ['content', content],
  ['grading', grading],
]) {
  if (/direction:\s*(left|right)|text-align:\s*(left|right)/.test(text)) {
    failures.push(`${name} uses a physical direction; use logical RTL-safe properties.`)
  }
  if (/TODO|FIXME|lorem ipsum/i.test(text)) failures.push(`${name} contains an unfinished marker.`)
  if (/scrollIntoView|IntersectionObserver/.test(text)) failures.push(`${name} must not scroll or spy on the student's viewport.`)
}
if (!/docs\/morphology-lesson-02-audit\.md/.test(lesson) || !/docs\/morphology-lesson-02-audit\.md/.test(content)) {
  failures.push('The lesson must point students and teachers to the audit document.')
}

/* ================================================================== *
 * 11. وثائق التدقيق
 * ================================================================== */
for (const [name, text] of [
  ['audit document', audit],
  ['source inventory', inventory],
]) {
  if (!text) continue
  for (const id of ['خ-1', 'خ-2', 'خ-3', 'خ-4']) {
    if (name === 'audit document' && !text.includes(id)) failures.push(`The audit document must record correction ${id}.`)
  }
}
if (audit && !/ض-1/.test(audit)) failures.push('The audit document must record the voweling unification (ض-1، ض-2).')
if (audit && !/م-3/.test(audit)) failures.push('The audit document must record the marks and first-five rule (م-2، م-3).')
if (inventory && !/morphology-lesson-02/.test(inventory)) failures.push('The source inventory must name the lesson it inventories.')

/* ================================================================== *
 * 12. مراجعة ما بعد التدقيق المستقل (docs/morphology-lesson-02-audit.md §12):
 *     اصطلاح العدّ الصرفي، ملاحظة المعتل، مجموعات الخطوات، وعدّ الأنشطة
 * ================================================================== */

/* ت4 — ٣٤ خطوة في ١٦ مجموعة (لا ١٥). */
const stepGroups = [...lesson.matchAll(/step\(\s*'([a-z0-9-]+)'\s*,\s*'([^']*)'\s*,\s*'([^']*)'/g)].map(
  (match) => match[3],
)
const testStepGroup = /step\(\s*`test-\$\{page\.id\}`\s*,\s*page\.title\s*,\s*'([^']*)'/m.exec(lesson)?.[1]
if (!testStepGroup) failures.push('The four test pages must share one explicit step group.')
const distinctGroups = new Set([...stepGroups, testStepGroup].filter(Boolean))
if (distinctGroups.size !== 16) {
  failures.push(`The 34 steps must be presented in 16 groups (found ${distinctGroups.size}).`)
}

/* ت1 — العدّ في جدول «عدد حروف الكلمة» صرفي: الحرف المشدّد يُحسب حرفين. */
const writtenGlyphs = {
  'كَتَبَ': 3,
  'أَكْرَمَ': 4,
  'عَلَّمَ': 3,
  'تَعَلَّمَ': 4,
  'انْطَلَقَ': 5,
  'اسْتَغْفَرَ': 6,
  'دَحْرَجَ': 4,
  'تَدَحْرَجَ': 5,
}
const doubledWords = new Set(['عَلَّمَ', 'تَعَلَّمَ'])
if (C.letterCounts.length !== Object.keys(writtenGlyphs).length) {
  failures.push('letterCounts must keep its eight rows.')
}
for (const row of C.letterCounts) {
  const glyphs = writtenGlyphs[row.word]
  if (glyphs === undefined) {
    failures.push(`letterCounts contains an unexpected word: ${row.word}`)
    continue
  }
  const expected = glyphs + (doubledWords.has(row.word) ? 1 : 0)
  if (row.letters !== expected) {
    failures.push(`${row.word} must count ${expected} letters in the morphological count (found ${row.letters}).`)
  }
  if (row.roots > row.letters || row.roots < 3) {
    failures.push(`${row.word} must keep 3 or 4 roots, never more than its letter count.`)
  }
}
// الاصطلاح مُصرَّح به بجوار الجدول، ومفصول عن الرسم المكتوب.
if (!/يُحسب الحرف المشدّد حرفين/.test(C.letterCountsConvention ?? '')) {
  failures.push('letterCountsConvention must state that a doubled letter counts as two.')
}
if (!/ع، ل، ل، م/.test(C.letterCountsConvention ?? '') || !/ت، ع، ل، ل، م/.test(C.letterCountsConvention ?? '')) {
  failures.push('letterCountsConvention must spell out عَلَّمَ (٤) and تَعَلَّمَ (٥).')
}
if (!/وليست حرفًا مستقلًّا يُكتب/.test(C.letterCountsConvention ?? '')) {
  failures.push('letterCountsConvention must separate the morphological count from the written shadda.')
}
if (!/letterCountsConvention/.test(lesson)) {
  failures.push('The lesson must show the counting convention next to the letterCounts table.')
}

/* ت3 — الأرقام المعروضة في الجدول عربية مشرقية (عرضًا فقط). */
if (!/arabicDigits\(row\.letters\)/.test(lesson) || !/arabicDigits\(row\.roots\)/.test(lesson)) {
  failures.push('The letterCounts table must render its digits through arabicDigits().')
}

/* ت2 — لا وصف خاطئ لواو «وَعَدَ». */
if ((JSON.stringify(C.weakLab) + JSON.stringify(C.weakWeights)).includes('ساكنة الحركة')) {
  failures.push('The و of وَعَدَ is open-voweled (فاء الكلمة); «ساكنة الحركة» must not come back.')
}
const wa3ada = C.weakLab.find((item) => item.word === 'وَعَدَ')
for (const phrase of ['فاء الكلمة', 'أصلية', 'لم يقع فيها إعلال']) {
  if (!wa3ada?.note.includes(phrase)) failures.push(`The وَعَدَ note must keep «${phrase}».`)
}
if (wa3ada?.answer !== 'لا إعلال') failures.push('وَعَدَ must keep «لا إعلال» as its answer.')

/* ت5 — عدّ الأنشطة التفاعلية كما هو موثّق في §1 و§12. */
for (const [name, expected] of [
  ['mappingLab', 5],
  ['vowelQuiz', 6],
  ['originalLab', 6],
  ['hamzaLab', 4],
  ['weakLab', 4],
  ['shaddaLab', 5],
  ['trainingOne', 15],
  ['trainingTwo', 10],
  ['trainingThree', 5],
  ['trainingFour', 6],
  ['trainingFive', 8],
]) {
  const items = C[name]
  const length = Array.isArray(items) ? items.length : items?.items?.length
  if (length !== expected) failures.push(`${name} must keep ${expected} items (found ${length}).`)
}
if (C.increasedWords?.examples?.length !== 5) {
  failures.push('The increased-words section must keep its five interactive worked examples.')
}
const labItems = ['mappingLab', 'vowelQuiz', 'originalLab', 'hamzaLab', 'weakLab', 'shaddaLab'].reduce(
  (total, name) => total + C[name].length,
  0,
)
if (labItems !== 30) failures.push(`The six labs must offer 30 items in total (found ${labItems}).`)

/* تحسينات المراجعة: تسمية حقلي قالَ/باعَ، ومؤشر القاعدة، وقبول العبارة. */
const analysisPage = C.testDefinition.pages.find((page) => page.id === 'morph2-analysis')
for (const question of analysisPage?.questions ?? []) {
  const extras = question.fields.find((field) => field.label?.startsWith('الحروف الزائدة'))
  if (extras?.label !== 'الحروف الزائدة (نصف درجة)') {
    failures.push(`Question ${question.number} must label its extras field «الحروف الزائدة (نصف درجة)».`)
  }
}
const weakAnalysis = (analysisPage?.questions ?? []).filter((question) => /قالَ|باعَ/.test(question.prompt))
if (weakAnalysis.length !== 2) failures.push('The analysis section must keep both قالَ and باعَ questions.')
for (const question of weakAnalysis) {
  const origin = question.fields.find((field) => field.label?.startsWith('الألف الظاهرة'))
  if (origin?.label !== 'الألف الظاهرة أصلها (شرط نيل درجة الوزن)') {
    failures.push(`Question ${question.number} must label its alef-origin field with the weight-mark condition.`)
  }
}
if (!/AnalysisRulePanel/.test(lesson) || !/morph2-analysis-rule/.test(lesson)) {
  failures.push('The analysis section must explain which five answers will be counted.')
}
const phraseQuestion = C.testQuestions.find((question) => question.number === 3)
const phraseField = phraseQuestion?.fields?.[0]
if (phraseField?.kind !== 'text') failures.push('Question 3 must stay a text question.')
else {
  if (phraseField.accept[0] !== 'سألتمونيها') {
    failures.push('The source key «سألتمونيها» must stay first (it is the model answer).')
  }
  for (const accepted of ['عبارة سألتمونيها', 'حروف سألتمونيها']) {
    if (!phraseField.accept.includes(accepted)) failures.push(`Question 3 must also accept «${accepted}».`)
  }
  if (phraseField.accept.some((item) => item.includes('،'))) {
    failures.push('Question 3 must not accept an enumeration of the letters instead of the phrase name.')
  }
}
notes.push(`Post-review fixes verified: morphological letter count (تَعَلَّمَ = ٥), the وَعَدَ note, Arabic-Indic digits, 16 step groups, and the documented activity counts (30 lab items + 5 worked examples + 44 training items).`)

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}
console.log(
  `Morphology lesson 2 check passed: registered in الصرف as lesson ٢ (two lessons, no third), ` +
    `34 flow steps (30 explicit + 4 test pages), eight source objectives, twelve source sections, ` +
    `five trainings (15/10/5/6/8) with complete keys, a 26-question / 30-mark test in four pages ` +
    `(26 automatic + 4 manual, first five of eight counted), the four approved corrections applied and ` +
    `documented, unified voweling, platform additions badged, a password-gated Teacher Area, and the ` +
    `post-review fixes (counting convention, activity counts, 16 step groups).\n${notes.join('\n')}`,
)
