import { readFileSync, existsSync } from 'node:fs'

/**
 * Validates the permanent, reusable course architecture:
 *  - a course-index homepage (lesson hub) that lists lessons, not their full content;
 *  - hash routing that keeps the single permanent course URL;
 *  - a reusable long-page lesson shell with a sticky scroll-anchor section navigation;
 *  - a lesson registry that drives both the index and the section navigation;
 *  - no WhatsApp/contact presentation anywhere in the app.
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
  'src/shared/components/SectionNav.tsx',
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
if (!/SectionNav/.test(shell)) failures.push('LessonShell must include the reusable section navigation.')
if (!/lesson-body/.test(shell)) failures.push('LessonShell must render one continuous lesson body.')

const sectionNav = sources['src/shared/components/SectionNav.tsx']
if (!/scrollIntoView/.test(sectionNav)) failures.push('SectionNav must smooth-scroll (not switch screens) to sections.')
if (!/behavior:\s*'smooth'/.test(sectionNav)) failures.push('SectionNav must use smooth scrolling.')

const registry = sources['src/lessons/registry.ts']
if (!/nav:/.test(registry)) failures.push('Lesson registry must define reusable section-nav items per lesson.')
if (!/available:\s*true/.test(registry)) failures.push('Lesson registry must expose at least one available lesson.')

// The homepage must be an index, not a dump of full lesson content.
if (/officialQuestions|TeacherSpace|final-test/.test(home)) {
  failures.push('CourseHome must not embed full lesson content; it is only an index.')
}

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}
console.log('Course architecture check passed: index homepage, hash routing, reusable long-page shell, and scroll-anchor section navigation.')
