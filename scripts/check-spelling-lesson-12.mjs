import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import {
  sections,
  practice,
  examQuestions,
  testDefinition,
  preservedWords,
  ibnRows,
  maRows,
  lamOnAlRows,
  groupAlifVerbs,
  wawCompareRows,
  tanweenRows,
  tanweenExceptionRows,
  discoverySteps,
  commonErrors,
  homeworkWords,
  homeworkConditions,
  homeworkModel,
  homeworkParagraphModel,
} from '../src/lessons/spelling-lesson-12/content.ts'

const read = (path) => readFileSync(path, 'utf8')
const inventory = JSON.parse(read('docs/spelling-lesson-12-source-inventory.json'))
const hash = (path) => createHash('sha256').update(readFileSync(path)).digest('hex')
const lesson = read('src/lessons/LessonSpellingTwelve.tsx')
const registry = read('src/lessons/registry.ts')
const app = read('src/app/App.tsx')
const css = read('src/lessons/spelling-lesson-12/lesson.css')
const assert = (ok, label) => {
  if (!ok) throw Error(`Spelling 12: ${label}`)
}

// ١. أمانة المصدر وسلامة الدروس السابقة.
assert(hash('docs/source/spelling-lesson-12.md') === inventory.sourceSha256, 'source digest')
assert(Object.keys(inventory.previousContentSha256).length >= 30, 'previous teaching files recorded')
for (const [path, sha] of Object.entries(inventory.previousContentSha256)) {
  assert(hash(path) === sha, `previous lesson intact: ${path}`)
}
for (const item of inventory.coverage) {
  for (const term of item.terms) {
    assert(read('src/lessons/spelling-lesson-12/content.ts').includes(term), `coverage: ${term}`)
  }
}

// ٢. التسجيل والتنقل: بعد الدرس الحادي عشر، بلا درس ثالث عشر وبلا اختبار وحدة.
assert(
  registry.indexOf("id: 'spelling-lesson-12'") > registry.indexOf("id: 'spelling-lesson-11'") &&
    registry.indexOf("id: 'spelling-lesson-12'") < registry.indexOf("id: 'morphology-lesson-01'"),
  'ordered registration after spelling-lesson-11',
)
assert(
  /id: 'spelling-lesson-12', sectionId: 'spelling', number: '١٢'/.test(registry) &&
    app.includes("lesson.id === 'spelling-lesson-12'") &&
    app.includes('<LessonSpellingTwelve'),
  'App route dispatch and Arabic-Indic lesson number',
)
assert(
  registry.includes("id: 'spelling-lesson-13'") &&
    !registry.includes("id: 'spelling-lesson-14'") &&
    !existsSync('src/lessons/LessonSpellingFourteen.tsx') &&
    !existsSync('src/lessons/spelling-lesson-14'),
  'thirteenth registered; no fourteenth spelling lesson',
)
assert(!registry.includes("id: 'spelling-unit'") && !lesson.includes('href="#/lesson/spelling-lesson-14'), 'no unit test or broken next link')
const spellingIds = [...registry.matchAll(/id: '(spelling-lesson-\d+)'/g)].map((match) => match[1])
assert(
  JSON.stringify(spellingIds) ===
    JSON.stringify(Array.from({ length: 13 }, (_, index) => `spelling-lesson-${String(index + 1).padStart(2, '0')}`)),
  'exactly thirteen spelling lessons in order',
)

// ٣. المحتوى التعليمي: الأقسام والجداول والواجب.
assert(sections.length === 14, 'fourteen teaching sections')
assert(preservedWords.length === 5, 'five preserved words')
assert(ibnRows.length === 5 && ibnRows.filter((r) => r.kind === 'deleted').length === 3, 'ibn rows: three deletions and two proofs')
assert(maRows.length === 6, 'six interrogative-ma rows')
assert(lamOnAlRows.length === 3 && lamOnAlRows.filter((r) => r.isAlExample).length === 2, 'lam-on-al rows with one non-example')
assert(
  lamOnAlRows.find((r) => !r.isAlExample).joined === 'لمعلّم الصف' &&
    lamOnAlRows.find((r) => !r.isAlExample).note.includes('ليست مثالًا على دخول اللام على «أل»'),
  'معلم الصف is explicitly a non-example of lam-on-al',
)
assert(groupAlifVerbs.length === 5, 'five group-alif verbs')
assert(wawCompareRows.length === 3, 'three waw comparisons')
assert(tanweenRows.length === 5 && tanweenExceptionRows.length === 3, 'tanween rows and three exceptions')
assert(discoverySteps.length === 3, 'three discovery steps')
assert(commonErrors.length === 6, 'six common errors')
assert(homeworkWords.length === 6 && homeworkModel.length === 6, 'homework words with model answers')
assert(homeworkConditions.length === 4 && homeworkParagraphModel.paragraph.length === 5, 'homework paragraph conditions')

// ٤. التدريب التفاعلي: إجابة واحدة واضحة وخيارات بلا تكرار (تدقيق ت-٨).
assert(practice.length === 8, 'exactly eight practice questions')
for (const item of practice) {
  assert(item.options.filter((option) => option === item.answer).length === 1, `single key: ${item.id}`)
  assert(new Set(item.options).size === item.options.length, `no duplicate options: ${item.id}`)
  assert(item.explanation.length > 80 && item.rule && item.example, `full feedback: ${item.id}`)
}

// ٥. الاختبار المستقل: خمسة عشر سؤالًا في أربع صفحات (٥ + ٤ + ٣ + ٣).
assert(
  testDefinition.id === 'spelling-lesson-12-independent' &&
    testDefinition.pages.length === 4 &&
    testDefinition.pages.map((page) => page.questions.length).join(',') === '5,4,3,3' &&
    examQuestions.length === 15,
  '15 independent questions, 4 pages (5+4+3+3)',
)
const kinds = testDefinition.pages.map((page) => page.questions.map((q) => q.fields[0].kind).join(','))
assert(
  kinds[0] === 'text,text,text,text,text' && kinds[1] === 'choice,choice,choice,choice' &&
    kinds[2] === 'text,text,text' && kinds[3] === 'choice,choice,choice',
  'distribution: 5 written corrections + 4 choices + 3 written completions + 3 contextual choices',
)
const types = examQuestions.map((q) => q.type)
assert(
  types.slice(0, 5).every((t) => t === 'تصحيح خطأ') &&
    types.slice(5, 9).every((t) => t === 'اختيار من متعدد') &&
    types.slice(9, 12).every((t) => t === 'إكمال فراغ') &&
    types.slice(12, 15).every((t) => t === 'تطبيق وفهم السياق'),
  'question type labels match the mandated distribution',
)
assert(
  new Set(examQuestions.map((question) => question.id)).size === 15 &&
    new Set(examQuestions.map((question) => question.prompt)).size === 15,
  'unique independent questions',
)
const practicePrompts = new Set(practice.map((item) => item.prompt))
const practiceAnswers = new Set(practice.map((item) => item.answer))
for (const question of examQuestions) {
  assert(!practicePrompts.has(question.prompt), `prompt not repeated from practice: ${question.id}`)
  const field = question.fields[0]
  if (field.kind === 'choice') {
    assert(!practiceAnswers.has(field.answer), `answer not repeated from practice: ${question.id}`)
  }
  assert(
    field.kind === 'choice'
      ? new Set(field.options).size === 3 && field.options.filter((option) => option === field.answer).length === 1
      : field.accept.length > 0,
    `well-formed keyed field: ${question.id}`,
  )
  assert(
    question.solution === (field.kind === 'choice' ? field.answer : field.accept[0]) || field.kind === 'text',
    `solution matches the field key: ${question.id}`,
  )
  assert(question.explanation.length > 90 && question.rule && question.example, `complete solution: ${question.id}`)
  assert(Boolean(question.teacherAnswer && question.teacherAnswer.length > 40), `teacher key with reason: ${question.id}`)
}
// تغطية المحاور السبعة في الاختبار المستقل.
const examText = examQuestions.map((q) => `${q.prompt} ${q.explanation} ${q.rule}`).join(' ')
for (const term of ['هذا', 'ابن', 'استفهامية', '«أل»', 'الفارقة', 'تنوين النصب', 'عمرو']) {
  assert(examText.includes(term), `exam coverage: ${term}`)
}

// ٦. الواجب: ست كلمات ونموذج فقرة يستوفي الشروط الأربعة.
assert(
  JSON.stringify(homeworkWords) === JSON.stringify(['هذا', 'لكن', 'كتبوا', 'كتابًا', 'مدرسةً', 'عمرو']),
  'homework words in source order',
)
assert(homeworkModel.every((item) => item.sentence && item.reason.length > 40), 'homework model with reasons')
assert(homeworkParagraphModel.conditions.length === 4, 'paragraph conditions listed')

// ٧. الفصل المعماري: منطقة الطالب، ومنطقة الاختبارات، والحلول، ومنطقة المعلم.
assert(
  lesson.includes('<TeacherSpace>') &&
    lesson.includes('<SolutionsArea') &&
    lesson.includes('revealFeedback={showTestFeedback}') &&
    lesson.includes("data-testid=\"spell12-teacher-keys\""),
  'shared gated areas and teacher keys',
)
assert(
  lesson.indexOf('<SolutionsArea') < lesson.indexOf('<TeacherSpace>') &&
    !lesson.slice(lesson.indexOf('<TeacherSpace>')).includes('<SolutionsArea'),
  'solutions area separate from teacher space',
)
assert(
  lesson.includes('disabled={!baseEngine.allPagesChecked}') &&
    lesson.includes('questionTestIdPrefix="spell12-question"'),
  'submission gating for the independent test',
)
assert(
  !lesson.includes('disabled={submitted}') &&
    !lesson.includes('function TestArea') &&
    !lesson.includes('function OfficialTest'),
  'no legacy whole-test pattern',
)
// التدريبات تُصحَّح عبر المحرك المشترك ولا تُقفل حقولها.
assert(lesson.includes('useTestEngine(practiceTest)'), 'practice on the shared engine')

// ٨. الوصول والاستجابة.
assert(
  css.includes('@media (max-width: 640px)') &&
    css.includes('@media (max-width: 420px)') &&
    css.includes('@media (prefers-reduced-motion: reduce)') &&
    css.includes(':focus-visible') &&
    css.includes('attr(data-label)') &&
    css.includes('min-block-size: 44px'),
  'mobile, focus and motion rules',
)
assert(!/text-align:\s*(left|right)/.test(css), 'no physical direction in lesson styles')
assert(!css.includes('spell11-') && !css.includes('tanween-lab'), 'independent visual identity')

// ٩. تسجيل الدرس في فحص التطابق المشترك.
assert(
  read('src/shared/test/lessonConformance.test.ts').includes("lesson: 'spelling-lesson-12'"),
  'shared conformance registration',
)
assert(read('package.json').includes('check:spelling-lesson-12'), 'registered validation script')

console.log(
  `Spelling 12 passed: 11 steps of audit, 14 teaching sections, 8 practice questions, ` +
    `15 independent questions (5 corrections + 4 choices + 3 completions + 3 context) with reviewed keys; ` +
    `${Object.keys(inventory.previousContentSha256).length} previous teaching files byte-identical. ` +
    'No unit test and no fourteenth lesson.',
)
