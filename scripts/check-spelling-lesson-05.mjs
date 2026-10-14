import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(path, 'utf8')
const lesson = read('src/lessons/LessonSpellingFive.tsx')
const data = read('src/lessons/spelling-lesson-05/content.ts')
const audit = read('docs/spelling-lesson-05-audit.md')
const source = read('docs/source/spelling-lesson-05.md')
const registry = read('src/lessons/registry.ts')
const styles = read('src/styles/spelling-lesson-05.css')

const SOURCE_SHA = 'feb9768725ff859c4dc7e4618030c64b77d63e081379488fa65823f2afe8aca1'
const questionNumbers = new Set([
  ...[...data.matchAll(/\bq\((\d+),/g)].map((m) => Number(m[1])),
  ...[...data.matchAll(/id: 'spell5-q(\d\d)'/g)].map((m) => Number(m[1])),
])
const corrections = ['ت-١', 'ت-٢', 'ت-٣', 'ت-٤', 'ت-٥', 'ت-٦', 'ت-٧', 'ت-٨', 'ت-٩']
const registryEntry = registry.slice(registry.indexOf("id: 'spelling-lesson-05'"), registry.indexOf("id: 'spelling-lesson-05'") + 600)
const registryIds = [...registry.matchAll(/id: '([^']+)'/g)].map((match) => match[1])
const lessonFourIndex = registryIds.indexOf('spelling-lesson-04')
const lessonFiveIndex = registryIds.indexOf('spelling-lesson-05')

const checks = [
  [createHash('sha256').update(source).digest('hex') === SOURCE_SHA, 'verbatim source file unchanged (SHA-256)'],
  [
    lessonFourIndex >= 0 &&
      registryIds[lessonFourIndex + 1] === 'spelling-lesson-05' &&
      registryIds[lessonFiveIndex + 1] === 'spelling-lesson-06' &&
      registryEntry.includes("sectionId: 'spelling'"),
    'registered in the spelling section after lesson 4, followed immediately by lesson 6',
  ],
  [
    questionNumbers.size === 20 && [...questionNumbers].every((n) => n >= 1 && n <= 20),
    'exactly twenty independent lesson-test questions',
  ],
  [
    lesson.includes('useTestEngine(testDefinition)') &&
      lesson.includes('<TestPageView') &&
      lesson.includes('<SolutionsArea test={testDefinition} engine={guardedEngine}') &&
      lesson.includes('revealFeedback={submitted}'),
    'shared test engine with submit-gated SolutionsArea',
  ],
  [
    lesson.includes('<TeacherSpace>') && lesson.includes('mode="teacher"') && !/somer\d/.test(lesson + data),
    'shared teacher area without a hardcoded password',
  ],
  [corrections.every((id) => data.includes(`id: '${id}'`) && audit.includes(id)), 'nine documented scientific corrections'],
  [
    data.includes('يسعى') && data.includes('سعيتُ') && audit.includes('لا تكشف الأصل'),
    'ت-٤: «يسعى» is not presented as revealing the origin',
  ],
  [
    ['إلى', 'إلا', 'إلي'].every((option) => data.includes(`'${option}'`)) && data.includes('اختر حرف الجر'),
    'ت-٨: original final Q6 has explicit options',
  ],
  [lesson.includes('توضيح تعليمي من المنصة') && lesson.includes('تصحيح علمي'), 'platform additions and corrections are labelled'],
  [
    !/scrollIntoView|wa\.me|whatsapp|instructor-contact/i.test(lesson + data),
    'no auto-scroll and no lesson-owned contact element',
  ],
  [
    !/(^|[;{\s])direction\s*:/m.test(styles) && !/text-align\s*:\s*(left|right)/.test(styles) && styles.includes('prefers-reduced-motion'),
    'RTL-safe, scoped styles with reduced-motion support',
  ],
]

for (const [ok, name] of checks) {
  if (!ok) throw Error(`Spelling lesson 5 audit: ${name} missing`)
}

console.log('Spelling lesson 5 structure and content inventory passed.')
