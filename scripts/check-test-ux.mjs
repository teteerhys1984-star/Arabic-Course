import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Platform-wide test-UX validation (docs/lesson-test-standards.md).
 *
 * Enforces, statically, the two platform-wide improvements for every lesson:
 *
 *  1. PAGE-LEVEL TEST CHECKING — every lesson test is declared once as a shared
 *     `TestDefinition` and rendered through the shared `TestRunner` /
 *     `TestPageView`, which put a «تحقّق من الإجابات» action at the end of every
 *     test page. The legacy whole-test patterns (requiring all answers before
 *     checking, locking fields after one submit-only check, bespoke TestArea /
 *     OfficialTest components) are rejected.
 *
 *  2. STRUCTURED SOLUTIONS AREA — every solutions area renders through the
 *     shared `SolutionsArea` (title, question number + reference, correct
 *     answer, explanation, optional example, manual-review status, and the
 *     source-vs-platform distinction), and solutions stay locked for pages the
 *     student has not checked.
 *
 * A future lesson is NOT complete unless it passes this check (and the
 * `lessonConformance` vitest suite, which validates its `testDefinition`).
 */
const failures = []

function read(path) {
  if (!existsSync(path)) {
    failures.push(`Missing required test-framework file: ${path}`)
    return ''
  }
  return readFileSync(path, 'utf8')
}

function filesUnder(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name)
    return statSync(path).isDirectory() ? filesUnder(path) : [path]
  })
}

// ---------------------------------------------------------------------------
// Level 1 — the shared framework exists and carries the required behaviour.
// ---------------------------------------------------------------------------
const framework = {
  types: read('src/shared/test/types.ts'),
  grading: read('src/shared/test/grading.ts'),
  engine: read('src/shared/test/useTestEngine.ts'),
  pageView: read('src/shared/test/components/TestPageView.tsx'),
  runner: read('src/shared/test/components/TestRunner.tsx'),
  solutions: read('src/shared/test/components/SolutionsArea.tsx'),
}

if (!/export (interface|type) TestDefinition/.test(framework.types)) {
  failures.push('The shared schema must export TestDefinition (pages of questions).')
}
if (!/export (interface|type) TestPage/.test(framework.types)) {
  failures.push('The shared schema must export TestPage.')
}
for (const status of ['correct', 'wrong', 'unanswered', 'manual']) {
  if (!framework.types.includes(`'${status}'`)) {
    failures.push(`The shared schema must distinguish the '${status}' answer status.`)
  }
}
if (!framework.pageView.includes('تحقّق من الإجابات')) {
  failures.push('TestPageView must render the page-level «تحقّق من الإجابات» action at the end of the page.')
}
if (!/checkPage\(page\.id\)/.test(framework.pageView)) {
  failures.push('TestPageView must check ONLY the current page (engine.checkPage(page.id)).')
}
if (!framework.runner.includes('test-final-result')) {
  failures.push('TestRunner must render the final result combined from the latest valid page results.')
}
for (const label of ['الإجابة الصحيحة', 'التفسير', 'يُراجع يدويًا', 'الجواب المعتمد من المصدر', 'توضيح تعليمي من المنصة']) {
  if (!framework.solutions.includes(label)) {
    failures.push(`The shared SolutionsArea must render the structured label «${label}».`)
  }
}
if (!framework.solutions.includes('تحقّق من هذه الصفحة أولًا')) {
  failures.push('The shared SolutionsArea must keep unchecked pages locked (no premature exposure).')
}
if (!/mode === 'teacher'/.test(framework.solutions)) {
  failures.push('The shared SolutionsArea must support a teacher mode (detailed model answers).')
}
// The shared engine owns invalidation-on-edit and page-keyed replacement.
if (!/delete updated\[pageId\]/.test(framework.engine)) {
  failures.push('Editing an answer on a checked page must invalidate that page result (latest valid results only).')
}
if (!/combinePageResults/.test(framework.grading)) {
  failures.push('The shared grading engine must combine page results (final aggregation).')
}

// The shared stylesheet must ship the mobile rules (stacked pages + full-width
// check action), and must be loaded by the app entry.
const styles = read('src/styles/test-framework.css')
const entry = read('src/main.tsx')
if (!entry.includes("import './styles/test-framework.css'")) {
  failures.push('The shared test stylesheet must be imported by src/main.tsx.')
}
const mobileIndex = styles.indexOf('@media (max-width: 640px)')
if (mobileIndex === -1) {
  failures.push('The shared test stylesheet must carry a mobile breakpoint (max-width: 640px).')
} else {
  const mobile = styles.slice(mobileIndex)
  for (const rule of ['.test-runner__pages', '.test-page__actions', 'flex-direction: column', 'width: 100%']) {
    if (!mobile.includes(rule)) {
      failures.push(`The mobile breakpoint must stack the test UI: missing «${rule}».`)
    }
  }
}

// The shared quick-check quiz is built on the same framework.
const quiz = read('src/shared/quiz/Quiz.tsx')
if (!/from '\.\.\/test'/.test(quiz)) {
  failures.push('The shared Quiz must be built on the shared test framework.')
}

// ---------------------------------------------------------------------------
// Level 2 — every lesson uses the shared framework (page-level checking +
// structured solutions), and the registry is fully covered.
// ---------------------------------------------------------------------------
const lessonFiles = filesUnder('src/lessons').filter((path) => /\.tsx$/.test(path) && !/\.test\./.test(path))
const registry = read('src/lessons/registry.ts')
const availableLessons = (registry.match(/available:\s*true/g) ?? []).length

let migrated = 0
for (const path of lessonFiles) {
  const source = readFileSync(path, 'utf8')
  const label = path

  if (!/from '\.\.\/shared\/test'/.test(source)) {
    failures.push(`${label} must import the shared test framework (../shared/test).`)
    continue
  }
  if (!/<TestRunner|<TestPageView/.test(source)) {
    failures.push(`${label} must render its test through the shared TestRunner or TestPageView (page-level checking).`)
  }
  if (!/export const testDefinition: TestDefinition/.test(source)) {
    failures.push(`${label} must declare its test once as a shared TestDefinition (export const testDefinition).`)
  }
  if (!/<SolutionsArea/.test(source)) {
    failures.push(`${label} must render its solutions through the shared SolutionsArea (structured solutions standard).`)
  }
  if (!/useTestEngine\(testDefinition\)/.test(source)) {
    failures.push(`${label} must own a shared test engine in the lesson component (answers and page results survive navigation).`)
  }

  // Legacy whole-test patterns must never come back. (Practice activities keep
  // their own «تحقق من النشاط» buttons — this rule targets lesson TESTS only.)
  for (const legacy of ['disabled={submitted}', 'function TestArea', 'function OfficialTest', 'function SolutionsArea({ result', 'function FinalTest(']) {
    if (source.includes(legacy)) {
      failures.push(`${label} still contains the legacy test pattern: ${legacy}`)
    }
  }
  // The test itself must never gate checking on answering every question.
  const testRegion = source.slice(source.indexOf('export const testDefinition'), source.indexOf('export function Lesson'))
  if (/disabled=\{!allAnswered/.test(testRegion)) {
    failures.push(`${label} must not gate its test check on answering every question (page-level checking is unconditional).`)
  }
  if (/name="تحقق من الاختبار"/.test(source) || />\s*تحقق من الاختبار\s*</.test(source)) {
    failures.push(`${label} still uses the legacy whole-test button «تحقق من الاختبار»; the page-level action is «تحقّق من الإجابات».`)
  }
  migrated += 1
}

if (migrated !== availableLessons) {
  failures.push(
    `Every available lesson must migrate to the shared test framework: ${migrated} lesson files migrated, ${availableLessons} available lessons registered.`,
  )
}

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}
console.log(
  `Test UX check passed: the shared framework (page-level «تحقّق من الإجابات» on every test page, ` +
    `latest-valid-result aggregation, structured SolutionsArea with per-page reveal) is enforced for all ` +
    `${migrated} lessons; legacy whole-test patterns are rejected.`,
)
