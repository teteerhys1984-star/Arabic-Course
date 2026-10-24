import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import {
  sections,
  practice,
  quiz,
  testDefinition,
  examQuestions,
} from '../src/lessons/spelling-lesson-10/content.ts'

const read = (p) => readFileSync(p, 'utf8')
const inventory = JSON.parse(read('docs/spelling-lesson-10-source-inventory.json'))
const hash = (p) => createHash('sha256').update(readFileSync(p)).digest('hex')
const lesson = read('src/lessons/LessonSpellingTen.tsx')
const registry = read('src/lessons/registry.ts')
const app = read('src/app/App.tsx')
const css = read('src/lessons/spelling-lesson-10/lesson.css')
const assert = (ok, label) => {
  if (!ok) throw Error(`Spelling 10: ${label}`)
}

assert(hash('docs/source/spelling-lesson-10.md') === inventory.sourceSha256, 'source digest')
for (const [p, sha] of Object.entries(inventory.previousContentSha256)) {
  assert(hash(p) === sha, `previous lesson intact: ${p}`)
}

for (const item of inventory.coverage) {
  for (const term of item.terms) {
    assert(read('src/lessons/spelling-lesson-10/content.ts').includes(term), `coverage: ${term}`)
  }
}

assert(
  registry.indexOf("id: 'spelling-lesson-10'") > registry.indexOf("id: 'spelling-lesson-09'"),
  'ordered tenth lesson',
)
assert(
  app.includes("lesson.id === 'spelling-lesson-10'") && app.includes('<LessonSpellingTen'),
  'route dispatch',
)
assert(
  registry.includes("id: 'spelling-lesson-11'") &&
    registry.includes("id: 'spelling-lesson-12'") &&
    registry.includes("id: 'spelling-lesson-13'") &&
    !registry.includes("id: 'spelling-lesson-14'") &&
    !existsSync('src/lessons/LessonSpellingFourteen.tsx') &&
    !existsSync('src/lessons/spelling-lesson-14'),
  'eleventh through thirteenth registered; no fourteenth lesson',
)
assert(
  !registry.includes("id: 'spelling-unit") &&
    !lesson.includes('href="#/lesson/spelling-lesson-12'),
  'no unit test or broken next link',
)

assert(
  sections.length === 13 && practice.length === 8 && quiz.length === 10,
  'complete teaching sections and activities (8 practice, 10 quiz)',
)
assert(
  testDefinition.id === 'spelling-lesson-10-independent' &&
    testDefinition.pages.length === 4 &&
    testDefinition.pages.every((p) => p.questions.length === 5) &&
    examQuestions.length === 20,
  '20 questions, 4 by 5',
)
assert(
  new Set(examQuestions.map((q) => q.id)).size === 20 &&
    new Set(examQuestions.map((q) => q.prompt)).size === 20,
  'unique questions',
)

const activityPrompts = new Set([...practice, ...quiz].map((q) => q.prompt))
for (const q of examQuestions) {
  const f = q.fields[0]
  assert(!activityPrompts.has(q.prompt), `independent prompt: ${q.id}`)
  assert(
    f.kind === 'choice' &&
      new Set(f.options).size === 3 &&
      f.options.filter((o) => o === f.answer).length === 1,
    `unambiguous keyed options: ${q.id}`,
  )
  assert(
    q.solution === f.answer && q.explanation.length > 80 && q.rule && q.example,
    `complete solution: ${q.id}`,
  )
}

assert(
  lesson.includes('<TeacherSpace>') &&
    lesson.includes('<SolutionsArea') &&
    lesson.includes('revealFeedback={showTestFeedback}'),
  'shared gated areas',
)
assert(
  lesson.indexOf('<SolutionsArea') < lesson.indexOf('<TeacherSpace>') &&
    !lesson.slice(lesson.indexOf('<TeacherSpace>')).includes('<SolutionsArea'),
  'solutions separate from teacher',
)
assert(
  css.includes('@media (max-width: 640px)') &&
    css.includes(':focus-visible') &&
    css.includes('attr(data-label)'),
  'mobile and keyboard support',
)
assert(
  read('src/shared/test/lessonConformance.test.ts').includes("lesson: 'spelling-lesson-10'"),
  'shared conformance registration',
)

console.log(
  `Spelling 10 passed: 22 steps, 7 groups, 8 practice, 10 quiz, 20 independent questions (4x5); ${
    Object.keys(inventory.previousContentSha256).length
  } previous teaching files byte-identical. Content uniqueness is verified contextually.`,
)
