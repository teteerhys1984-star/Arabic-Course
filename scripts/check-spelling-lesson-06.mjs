import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(path, 'utf8')
const source = read('docs/source/spelling-lesson-06.md')
const audit = read('docs/spelling-lesson-06-audit.md')
const data = read('src/lessons/spelling-lesson-06/content.ts')
const lesson = read('src/lessons/LessonSpellingSix.tsx')
const teacher = read('src/lessons/spelling-lesson-06/teacher.tsx')
const styles = read('src/lessons/spelling-lesson-06.css')
const registry = read('src/lessons/registry.ts')
const app = read('src/app/App.tsx')
const conformance = read('src/shared/test/lessonConformance.test.ts')

const expectedSourceHash = '45748bbca21a289d26271357447b8682079ea824c6fef52c46159725a22db393'
const independentQuestionIds = [...data.matchAll(/examQuestion\('(spell6-q\d{2})'/g)].map((match) => match[1])
const sourceQuestions = [...data.matchAll(/id: '(spell6-source-final-\d{2})'/g)].map((match) => match[1])
const lessonFive = registry.indexOf("id: 'spelling-lesson-05'")
const lessonSix = registry.indexOf("id: 'spelling-lesson-06'")
const nextSpellingLesson = registry.indexOf("id: 'spelling-lesson-07'")

const checks = [
  [createHash('sha256').update(source).digest('hex') === expectedSourceHash, 'preserved source snapshot SHA-256'],
  [lessonFive >= 0 && lessonSix > lessonFive && (nextSpellingLesson < 0 || lessonSix < nextSpellingLesson), 'lesson 6 registration immediately after lesson 5'],
  [registry.slice(lessonSix, lessonSix + 500).includes("sectionId: 'spelling'") && app.includes("lesson.id === 'spelling-lesson-06'"), 'spelling-section app registration and route dispatch'],
  [independentQuestionIds.length === 20 && new Set(independentQuestionIds).size === 20, 'exactly twenty distinct keyed independent questions'],
  [data.includes('pages: [') && data.includes('examQuestions.slice(0, 5)') && data.includes('examQuestions.slice(15, 20)') && data.includes('examQuestionPlan = ['), 'four-page preplanned skill/difficulty blueprint'],
  [sourceQuestions.length === 7 && new Set(sourceQuestions).size === 7, 'seven source-final questions kept separate'],
  [lesson.includes('useTestEngine(testDefinition)') && lesson.includes('<TestPageView') && lesson.includes('<SolutionsArea test={testDefinition} engine={engine}') && lesson.includes('revealFeedback={submitted}'), 'shared engine with final-submit solution gate'],
  [lesson.includes('<TeacherArea') && teacher.includes('<TeacherSpace>') && teacher.includes('mode="teacher"') && !/somer\d/.test(lesson + data + teacher), 'shared protected teacher area without a hardcoded password'],
  [['مَرْأَة', 'مِئَة', 'بِيئَة', 'نَاشِئَة', 'أَسْئِلَة', 'رُؤُوس', 'تَأْثِير'].every((word) => source.includes(word) || data.includes(word) || teacher.includes(word)), 'high-risk source examples are preserved and mapped'],
  [['ت-١', 'ت-٢', 'ت-٣', 'ت-٤', 'ت-٥', 'ت-٦', 'ت-٧', 'ت-٨', 'ت-٩', 'ت-١٠'].every((id) => data.includes(`id: '${id}'`) && audit.includes(id)), 'ten documented student-facing corrections and clarifications'],
  [teacher.includes('spell6-teacher-source-example-map') && teacher.includes('spell6-source-final-solutions') && teacher.includes('spell6-teacher-exam-solutions'), 'source examples, source solutions, and independent keys mapped in teacher guidance'],
  [styles.includes('@media (max-width: 760px)') && styles.includes('@media (max-width: 420px)') && styles.includes('prefers-reduced-motion'), 'responsive, reduced-motion lesson styles'],
  [conformance.includes("lesson: 'spelling-lesson-06'") && conformance.includes('spellingSixTest'), 'shared test-engine conformance registry'],
]

for (const [ok, name] of checks) {
  if (!ok) throw Error(`Spelling lesson 6 check: ${name} missing`)
}

console.log('Spelling lesson 6 source, registration, assessment, teacher gate, and responsive checks passed.')
