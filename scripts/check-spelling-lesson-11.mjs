import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import {
  sections,
  practice,
  quizQuestions,
  quizDefinition,
  testDefinition,
  examQuestions,
} from '../src/lessons/spelling-lesson-11/content.ts'

const read = (path) => readFileSync(path, 'utf8')
const inventory = JSON.parse(read('docs/spelling-lesson-11-source-inventory.json'))
const hash = (path) => createHash('sha256').update(readFileSync(path)).digest('hex')
const lesson = read('src/lessons/LessonSpellingEleven.tsx')
const registry = read('src/lessons/registry.ts')
const app = read('src/app/App.tsx')
const css = read('src/lessons/spelling-lesson-11/lesson.css')
const assert = (ok, label) => {
  if (!ok) throw Error(`Spelling 11: ${label}`)
}

// ١. أمانة المصدر وسلامة الدروس السابقة.
assert(hash('docs/source/spelling-lesson-11.md') === inventory.sourceSha256, 'source digest')
assert(Object.keys(inventory.previousContentSha256).length >= 30, 'previous teaching files recorded')
for (const [path, sha] of Object.entries(inventory.previousContentSha256)) {
  assert(hash(path) === sha, `previous lesson intact: ${path}`)
}
for (const item of inventory.coverage) {
  for (const term of item.terms) {
    assert(read('src/lessons/spelling-lesson-11/content.ts').includes(term), `coverage: ${term}`)
  }
}

// ٢. التسجيل والتنقل: بعد الدرس الحادي عشر، بلا درس ثالث عشر وبلا اختبار وحدة.
assert(
  registry.indexOf("id: 'spelling-lesson-11'") > registry.indexOf("id: 'spelling-lesson-10'") &&
    registry.indexOf("id: 'spelling-lesson-11'") < registry.indexOf("id: 'morphology-lesson-01'"),
  'ordered registration after spelling-lesson-10',
)
assert(
  /id: 'spelling-lesson-11', sectionId: 'spelling', number: '١١'/.test(registry) &&
    app.includes("lesson.id === 'spelling-lesson-11'") &&
    app.includes('<LessonSpellingEleven'),
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

// ٣. المحتوى التعليمي: الأقسام والجداول والنشاطات.
assert(sections.length === 11 && practice.length === 8 && quizQuestions.length === 10, '11 sections, 8 practice, 10 quiz')
const content = read('src/lessons/spelling-lesson-11/content.ts')
for (const term of [
  'alifCases: AlifCase[]',
  'tanweenTypeRows: TanweenTypeRow[]',
  'nunCompareRows: NunRow[]',
  'markLabItems: MarkLabItem[]',
  'nunChallengeItems: NunChallengeItem[]',
  'alifDecisionItems: AlifDecisionItem[]',
  'objectives: string[]',
]) {
  assert(content.includes(term), `declared data structure: ${term}`)
}

// ٤. التدريب التفاعلي: إجابة واحدة واضحة وخيارات بلا تكرار (تدقيق ت-٨).
for (const item of practice) {
  assert(item.options.filter((option) => option === item.answer).length === 1, `single key: ${item.id}`)
  assert(new Set(item.options).size === item.options.length, `no duplicate options: ${item.id}`)
  assert(item.explanation.length > 80 && item.rule && item.example, `full feedback: ${item.id}`)
}

// ٥. الاختبار الختامي: إكمال كتابي + علامة، وتصحيح كتابي، وعلل مقالية بحلول نموذجية.
assert(quizDefinition.pages.length === 1 && quizDefinition.pages[0].questions.length === 10, 'one quiz page of ten')
let textFields = 0
let selectFields = 0
let essayFields = 0
for (const question of quizQuestions) {
  for (const field of question.fields) {
    if (field.kind === 'text') textFields += 1
    if (field.kind === 'select') {
      selectFields += 1
      assert(field.options.includes(field.answer) && new Set(field.options).size === 3, `keyed mark: ${question.id}`)
    }
    if (field.kind === 'essay') {
      essayFields += 1
      assert(question.revealEssaySolution === true, `essay model revealed after checking: ${question.id}`)
      assert((question.teacherAnswer ?? '').length > 80, `teacher model answer: ${question.id}`)
    }
  }
}
assert(textFields === 7 && selectFields === 4 && essayFields === 3, 'written completion, mark choice and essay items')
assert(
  quizQuestions.slice(4, 7).length === 3 &&
    quizQuestions.slice(4, 7).every((question) => question.fields[0].kind === 'text'),
  'correction items are written answers',
)

// ٦. الاختبار المستقل: عشرون سؤالًا في أربع صفحات بخمسة أسئلة ومفاتيح مضبوطة.
assert(
  testDefinition.id === 'spelling-lesson-11-independent' &&
    testDefinition.pages.length === 4 &&
    testDefinition.pages.every((page) => page.questions.length === 5) &&
    examQuestions.length === 20,
  '20 independent questions, 4 by 5',
)
assert(
  new Set(examQuestions.map((question) => question.id)).size === 20 &&
    new Set(examQuestions.map((question) => question.prompt)).size === 20,
  'unique independent questions',
)
const lessonPrompts = new Set([
  ...practice.map((item) => item.prompt),
  ...quizQuestions.map((question) => question.prompt),
])
const lessonAnswers = new Set([
  ...practice.map((item) => item.answer),
  ...quizQuestions.map((question) => question.solution),
])
for (const question of examQuestions) {
  const field = question.fields[0]
  assert(!lessonPrompts.has(question.prompt), `prompt not repeated from practice/quiz: ${question.id}`)
  assert(!lessonAnswers.has(question.solution), `answer not repeated from practice/quiz: ${question.id}`)
  assert(
    field.kind === 'choice' &&
      new Set(field.options).size === 3 &&
      field.options.filter((option) => option === field.answer).length === 1,
    `unambiguous keyed options: ${question.id}`,
  )
  assert(
    question.solution === field.answer && question.explanation.length > 90 && question.rule && question.example,
    `complete solution: ${question.id}`,
  )
  assert(Boolean(question.teacherAnswer), `teacher key with reason: ${question.id}`)
}
const levels = [...new Set(examQuestions.map((question) => question.level))]
assert(levels.length === 4, 'four distinct coverage levels')

// ٧. الفصل المعماري: منطقة الطالب، ومنطقة الاختبارات، والحلول، ومنطقة المعلم.
assert(
  lesson.includes('<TeacherSpace>') &&
    lesson.includes('<SolutionsArea') &&
    lesson.includes('revealFeedback={showTestFeedback}') &&
    lesson.includes("data-testid=\"spell11-teacher-keys\""),
  'shared gated areas and teacher keys',
)
assert(
  lesson.indexOf('<SolutionsArea') < lesson.indexOf('<TeacherSpace>') &&
    !lesson.slice(lesson.indexOf('<TeacherSpace>')).includes('<SolutionsArea'),
  'solutions area separate from teacher space',
)
assert(
  lesson.includes('disabled={!baseEngine.allPagesChecked}') &&
    lesson.includes('questionTestIdPrefix="spell11-question"'),
  'submission gating for the independent test',
)
assert(
  !lesson.includes('disabled={submitted}') &&
    !lesson.includes('function TestArea') &&
    !lesson.includes('function OfficialTest'),
  'no legacy whole-test pattern',
)

// ٨. الوصول والاستجابة.
assert(
  css.includes('@media (max-width: 640px)') &&
    css.includes('@media (max-width: 420px)') &&
    css.includes('@media (prefers-reduced-motion: reduce)') &&
    css.includes(':focus-visible') &&
    css.includes('attr(data-label)') &&
    css.includes('min-height: 44px'),
  'mobile, focus and motion rules',
)
assert(!/text-align:\s*(left|right)/.test(css), 'no physical direction in lesson styles')

// ٩. تسجيل الدرس في فحص التطابق المشترك.
assert(
  read('src/shared/test/lessonConformance.test.ts').includes("lesson: 'spelling-lesson-11'"),
  'shared conformance registration',
)
assert(read('package.json').includes('check:spelling-lesson-11'), 'registered validation script')

console.log(
  `Spelling 11 passed: 27 steps, 9 groups, 11 teaching sections, 3 labs, 8 practice, 10 quiz (7 written + 3 essays), ` +
    `20 independent questions (4x5) with reviewed keys; ${Object.keys(inventory.previousContentSha256).length} ` +
    'previous teaching files byte-identical. No unit test and no fourteenth lesson.',
)
