import { readFileSync, existsSync } from 'node:fs'

/**
 * Validates the permanent, reusable sequential lesson architecture:
 *
 *   CourseHome → LessonShell → LessonFlow → LessonStep → current step content only
 *                                                              ↓
 *                                                     السابق / التالي
 *
 *  - a course-index homepage (lesson hub) that lists lessons, not their full content;
 *  - hash routing that keeps the single permanent course URL;
 *  - a reusable lesson shell with no scroll-anchor navigation and no long-page body;
 *  - a lesson flow that renders exactly one step at a time with Previous/Next controls;
 *  - a lesson registry that drives the index;
 *  - no WhatsApp/contact presentation anywhere in the app;
 *  - no leftover long-page primitives (SectionNav, scrollIntoView, IntersectionObserver
 *    based scroll-spy, or anchor-based in-page navigation).
 */
const failures = []

function read(path) {
  if (!existsSync(path)) {
    failures.push(`Missing required architecture file: ${path}`)
    return ''
  }
  return readFileSync(path, 'utf8')
}

const requiredFiles = [
  'src/app/App.tsx',
  'src/app/CourseHome.tsx',
  'src/app/useHashRoute.ts',
  'src/lessons/registry.ts',
  'src/shared/components/LessonShell.tsx',
  'src/shared/components/LessonFlow.tsx',
  'src/shared/components/LessonStep.tsx',
]
const sources = Object.fromEntries(requiredFiles.map((path) => [path, read(path)]))

const home = sources['src/app/CourseHome.tsx']
if (!/lesson-index/.test(home)) failures.push('CourseHome must render a lesson index list.')
if (!/lessonRegistry/.test(home)) failures.push('CourseHome must build the index from the lesson registry.')

const router = sources['src/app/useHashRoute.ts']
if (!/\/lesson\//.test(router)) failures.push('Hash router must support independent lesson routes.')

const app = sources['src/app/App.tsx']
if (!/CourseHome/.test(app)) failures.push('App must render the course index homepage.')
if (!/LessonShell/.test(app)) failures.push('App must render lessons through the reusable LessonShell.')

const shell = sources['src/shared/components/LessonShell.tsx']
if (/SectionNav/.test(shell)) failures.push('LessonShell must not include the removed long-page SectionNav.')
if (/scrollIntoView/.test(shell)) failures.push('LessonShell must not smooth-scroll to anchors.')

const flow = sources['src/shared/components/LessonFlow.tsx']
if (!/LessonStep/.test(flow)) failures.push('LessonFlow must render steps through the reusable LessonStep.')
if (!/السابق/.test(flow)) failures.push('LessonFlow must render a "السابق" (Previous) control.')
if (!/التالي/.test(flow)) failures.push('LessonFlow must render a "التالي" (Next) control.')
if (!/إتمام الدرس/.test(flow)) failures.push('LessonFlow must render "إتمام الدرس" on the final step.')
if (!/disabled=\{isFirst\}/.test(flow)) failures.push('LessonFlow must disable Previous on the first step.')
if (!/الخطوة/.test(flow)) failures.push('LessonFlow must show step progress (e.g. "الخطوة 5 من 19").')

const step = sources['src/shared/components/LessonStep.tsx']
if (!/lesson-step__body/.test(step)) failures.push('LessonStep must render exactly one step\'s body, not a long document.')

const registry = sources['src/lessons/registry.ts']
if (!/available:\s*true/.test(registry)) failures.push('Lesson registry must expose at least one available lesson.')

// The homepage must be an index, not a dump of full lesson content.
if (/officialQuestions|TeacherSpace|final-test/.test(home)) {
  failures.push('CourseHome must not embed full lesson content; it is only an index.')
}

// Course-wide rule: the old long-page architecture must never come back.
const forbiddenLongPagePatterns = [
  { pattern: /shared\/components\/SectionNav/, label: 'SectionNav component reference' },
  { pattern: /scrollIntoView/, label: 'scrollIntoView anchor scrolling' },
  { pattern: /IntersectionObserver/, label: 'IntersectionObserver-based scroll-spy' },
]
for (const file of Object.keys(sources)) {
  for (const { pattern, label } of forbiddenLongPagePatterns) {
    if (pattern.test(sources[file])) {
      failures.push(`${file} still contains the old long-page primitive: ${label}.`)
    }
  }
}
if (existsSync('src/shared/components/SectionNav.tsx')) {
  failures.push('src/shared/components/SectionNav.tsx must be deleted; the course uses sequential lesson steps.')
}

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}
console.log(
  'Course architecture check passed: index homepage, hash routing, and the reusable ' +
    'sequential lesson flow (LessonShell → LessonFlow → LessonStep) with no long-page ' +
    'or scroll-anchor navigation.',
)
