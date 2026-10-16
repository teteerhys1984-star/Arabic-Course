import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(path, 'utf8')
const source = read('docs/source/spelling-lesson-08.md')
const audit = read('docs/spelling-lesson-08-audit.md')
const lesson = read('src/lessons/LessonSpellingEight.tsx')
const data = read('src/lessons/spelling-lesson-08/content.ts')
const registry = read('src/lessons/registry.ts')
const app = read('src/app/App.tsx')
const css = read('src/lessons/spelling-lesson-08/lesson.css')
const conformance = read('src/shared/test/lessonConformance.test.ts')

const expectedHash = '334b391edb05c4cd378226bebada454079d69472f893e9d3315376e6b1d430ec'
const actualHash = createHash('sha256').update(source, 'utf8').digest('hex')
const practiceMatches = [...data.matchAll(/id: 'spell8-prac-\d{2}'/g)]
const eduQuizMatches = [...data.matchAll(/id: 'spell8-quiz-\d{2}'/g)]
const examMatches = [...data.matchAll(/makeChoiceQuestion\(\s*\d+/g)]

const checks = [
  [actualHash === expectedHash && audit.includes(expectedHash), 'preserved source SHA-256 recorded in audit'],
  [
    registry.indexOf("id: 'spelling-lesson-08'") > registry.indexOf("id: 'spelling-lesson-07'") &&
      app.includes("lesson.id === 'spelling-lesson-08'"),
    'ordered registration after spelling-lesson-07 and App route dispatch',
  ],
  [registry.includes("id: 'spelling-lesson-09'") && registry.includes("id: 'spelling-lesson-10'") && registry.includes("id: 'spelling-lesson-11'") && !registry.includes("id: 'spelling-lesson-12'"), 'ninth through eleventh registered; no twelfth spelling lesson created'],
  [practiceMatches.length === 8, 'eight interactive practice questions'],
  [eduQuizMatches.length === 10, 'ten educational quiz questions'],
  [examMatches.length === 20, 'twenty independent exam questions'],
  [
    lesson.includes('<TeacherSpace>') &&
      lesson.includes('<SolutionsArea') &&
      lesson.includes('revealFeedback={showTestFeedback}'),
    'gated independent SolutionsArea and protected TeacherSpace',
  ],
  [
    css.includes('@media (max-width: 640px)') &&
      css.includes('@media (max-width: 480px)') &&
      css.includes(':focus-visible') &&
      css.includes('prefers-reduced-motion'),
    'responsive mobile styles, keyboard focus, and reduced motion',
  ],
  [
    ['ت-١', 'ت-٢', 'ت-٣', 'ت-٤', 'ت-٥', 'ت-٦', 'ت-٧'].every(
      (id) => data.includes(`id: '${id}'`) && audit.includes(id),
    ),
    'documented source clarifications and linguistic audit entries',
  ],
  [
    conformance.includes("lesson: 'spelling-lesson-08'") && conformance.includes('spellingEightTest'),
    'conformance suite registration',
  ],
]

for (const [ok, name] of checks) {
  if (!ok) throw new Error(`Spelling 08 check failed: ${name}`)
}

console.log('Spelling lesson 08 source, audit, registration, 20-question assessment, and responsive checks passed.')
