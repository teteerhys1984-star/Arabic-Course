import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Validates the permanent, reusable platform architecture:
 *
 *   Arabic Platform → Section → Lessons → LessonFlow
 *
 *   CourseHome (section index) → SectionPage (lesson grid / empty state)
 *     → LessonShell → LessonFlow → LessonStep → current step content only
 *                                                       ↓
 *                                              السابق / التالي
 *
 *  - a platform home whose FIRST navigation level is the five permanent sections,
 *    rendered from the section registry (never hard-coded HTML, never lesson content);
 *  - a section page that lists exactly the lessons whose registry entry declares that
 *    section, or an elegant empty state when the section has no lessons yet;
 *  - a lesson registry in which EVERY lesson declares its one `sectionId`, so future
 *    lessons appear under the right section automatically with no UI edits;
 *  - hash routing that keeps the single permanent course URL: `#/`, `#/sections/<id>`,
 *    and the unchanged lesson deep links `#/lesson/<id>`;
 *  - a reusable lesson shell with no scroll-anchor navigation and no long-page body;
 *  - a lesson flow that renders exactly one step at a time with Previous/Next controls;
 *  - exactly ONE official contact element (the instructor's WhatsApp link), declared in
 *    a single data module and rendered by the page shells only; lesson content never
 *    presents contact information of its own;
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
  'src/app/SectionPage.tsx',
  'src/app/SectionCard.tsx',
  'src/app/Breadcrumbs.tsx',
  'src/app/useHashRoute.ts',
  'src/sections/sectionRegistry.ts',
  'src/lessons/registry.ts',
  'src/shared/components/LessonShell.tsx',
  'src/shared/components/LessonFlow.tsx',
  'src/shared/components/LessonStep.tsx',
]
const sources = Object.fromEntries(requiredFiles.map((path) => [path, read(path)]))

// ---------------------------------------------------------------------------
// Level 1 — the platform home is a section index driven by the section registry.
// ---------------------------------------------------------------------------
const home = sources['src/app/CourseHome.tsx']
if (!/section-index/.test(home)) failures.push('CourseHome must render a section index.')
if (!/getSections|sectionRegistry/.test(home)) {
  failures.push('CourseHome must build the home from the section registry, not hard-coded HTML.')
}
if (!/SectionCard/.test(home)) failures.push('CourseHome must render the sections through SectionCard.')
if (!/lessonRegistry/.test(home)) {
  failures.push('CourseHome must derive its platform stats from the lesson registry.')
}

// ---------------------------------------------------------------------------
// Level 2 — a section page lists its own lessons (data-driven) or an empty state.
// ---------------------------------------------------------------------------
const sectionPage = sources['src/app/SectionPage.tsx']
if (!/getSectionLessons/.test(sectionPage)) {
  failures.push('SectionPage must build its lesson grid from the section\'s registry lessons.')
}
if (!/LessonCard/.test(sectionPage)) {
  failures.push('SectionPage must render the section lessons through the shared LessonCard.')
}
if (!/lesson-index/.test(sectionPage)) failures.push('SectionPage must render a lesson index grid.')
if (!/لا توجد دروس مضافة إلى هذا القسم بعد/.test(sectionPage)) {
  failures.push('SectionPage must render the elegant empty state for sections without lessons.')
}
if (!/Breadcrumbs/.test(sectionPage)) {
  failures.push('SectionPage must render the breadcrumb trail (اللغة العربية ← القسم).')
}

// ---------------------------------------------------------------------------
// The section registry: the five permanent sections and derived lesson grouping.
// ---------------------------------------------------------------------------
const sectionRegistry = sources['src/sections/sectionRegistry.ts']
for (const sectionId of ['basics-grammar', 'morphology', 'spelling', 'rhetoric', 'reading-expression']) {
  if (!sectionRegistry.includes(`'${sectionId}'`)) {
    failures.push(`The section registry must declare the permanent section "${sectionId}".`)
  }
}
if (!/export function getSectionLessons/.test(sectionRegistry)) {
  failures.push('The section registry must derive each section\'s lessons from the lesson registry.')
}

// ---------------------------------------------------------------------------
// The lesson registry: every lesson belongs to exactly one section.
// ---------------------------------------------------------------------------
const registry = sources['src/lessons/registry.ts']
if (!/available:\s*true/.test(registry)) failures.push('Lesson registry must expose at least one available lesson.')
if (!/import type \{ SectionId \}/.test(registry)) {
  failures.push('LessonMeta must type its sectionId with the section registry\'s SectionId.')
}
const lessonCount = (registry.match(/^\s+id: '[^']+',/gm) ?? []).length
const sectionRefCount = (registry.match(/sectionId: '/g) ?? []).length
if (lessonCount === 0) failures.push('Lesson registry must register lessons.')
if (sectionRefCount !== lessonCount) {
  failures.push(
    `Every lesson must declare its one sectionId (found ${sectionRefCount} sectionId entries for ${lessonCount} lessons).`,
  )
}

// ---------------------------------------------------------------------------
// Routing and shells.
// ---------------------------------------------------------------------------
const router = sources['src/app/useHashRoute.ts']
if (!/\/lesson\//.test(router)) failures.push('Hash router must support independent lesson routes.')
if (!/\/sections\//.test(router)) failures.push('Hash router must support section routes (#/sections/<id>).')

const app = sources['src/app/App.tsx']
if (!/CourseHome/.test(app)) failures.push('App must render the platform home.')
if (!/SectionPage/.test(app)) failures.push('App must render sections through SectionPage.')
if (!/LessonShell/.test(app)) failures.push('App must render lessons through the reusable LessonShell.')

const shell = sources['src/shared/components/LessonShell.tsx']
if (/SectionNav/.test(shell)) failures.push('LessonShell must not include the removed long-page SectionNav.')
if (/scrollIntoView/.test(shell)) failures.push('LessonShell must not smooth-scroll to anchors.')
if (!/Breadcrumbs/.test(shell)) {
  failures.push('LessonShell must render the breadcrumb trail (اللغة العربية ← القسم ← الدرس).')
}

const flow = sources['src/shared/components/LessonFlow.tsx']
if (!/LessonStep/.test(flow)) failures.push('LessonFlow must render steps through the reusable LessonStep.')
if (!/السابق/.test(flow)) failures.push('LessonFlow must render a "السابق" (Previous) control.')
if (!/التالي/.test(flow)) failures.push('LessonFlow must render a "التالي" (Next) control.')
if (!/إتمام الدرس/.test(flow)) failures.push('LessonFlow must render "إتمام الدرس" on the final step.')
if (!/disabled=\{isFirst\}/.test(flow)) failures.push('LessonFlow must disable Previous on the first step.')
if (!/الخطوة/.test(flow)) failures.push('LessonFlow must show step progress (e.g. "الخطوة 5 من 19").')

const step = sources['src/shared/components/LessonStep.tsx']
if (!/lesson-step__body/.test(step)) failures.push('LessonStep must render exactly one step\'s body, not a long document.')

// The home and the section pages must be indexes, not dumps of full lesson content.
for (const [path, source] of [
  ['CourseHome', home],
  ['SectionPage', sectionPage],
]) {
  if (/officialQuestions|TeacherSpace|final-test/.test(source)) {
    failures.push(`${path} must not embed full lesson content; it is only an index.`)
  }
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

// ---------------------------------------------------------------------------
// The one official contact element (instructor WhatsApp link).
//
// Rules:
//   - the phone number and the WhatsApp URL exist in exactly ONE data module;
//   - the element is defined once and rendered by the page shells only;
//   - lesson content never presents contact information of its own.
// ---------------------------------------------------------------------------
function filesUnder(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name)
    return statSync(path).isDirectory() ? filesUnder(path) : [path]
  })
}

const contactDataPath = 'src/shared/contact/instructorDetails.ts'
const contactElementPath = 'src/shared/contact/InstructorContact.tsx'
const codeFiles = filesUnder('src').filter((path) => /\.(ts|tsx)$/.test(path) && !/\.test\./.test(path))
const code = Object.fromEntries(codeFiles.map((path) => [path, readFileSync(path, 'utf8')]))

const contactData = code[contactDataPath] ?? read(contactDataPath)
if (!/phoneDisplay:\s*'0930215022'/.test(contactData)) {
  failures.push(`${contactDataPath} must declare the instructor's display number 0930215022.`)
}
if (!/phoneInternational:\s*'963930215022'/.test(contactData)) {
  failures.push(`${contactDataPath} must declare the international number 963930215022.`)
}
if (!/https:\/\/wa\.me\//.test(contactData)) {
  failures.push(`${contactDataPath} must build the WhatsApp deep link.`)
}

// One source for the data: no other code file may repeat the number or the link.
for (const path of codeFiles) {
  if (path === contactDataPath) continue
  if (/0930215022|963930215022|wa\.me/i.test(code[path])) {
    failures.push(`Contact data must live only in ${contactDataPath}; ${path} repeats it.`)
  }
}

const contactElement = code[contactElementPath] ?? read(contactElementPath)
if (!/export function InstructorContact\b/.test(contactElement)) {
  failures.push(`${contactElementPath} must export the shared InstructorContact element.`)
}
if (!/href={instructorWhatsAppUrl}/.test(contactElement)) {
  failures.push('The contact element must link to the shared WhatsApp URL.')
}
if (!/target="_blank"/.test(contactElement) || !/rel="noopener noreferrer"/.test(contactElement)) {
  failures.push('The contact element must open WhatsApp in a new tab with rel="noopener noreferrer".')
}
if (!/aria-label={instructorContactLabel}/.test(contactElement)) {
  failures.push('The contact element must expose an accessible name through its aria-label.')
}
if (!/bdi dir="ltr"/.test(contactElement)) {
  failures.push('The contact element must isolate the number with <bdi dir="ltr"> so RTL cannot reorder it.')
}

// Exactly one definition, exactly one render site per shell, and no other user.
const shells = [
  'src/app/CourseHome.tsx',
  'src/app/SectionPage.tsx',
  'src/shared/components/LessonShell.tsx',
]
const definitions = codeFiles.filter((path) => /export function InstructorContact\b/.test(code[path]))
if (definitions.length !== 1 || definitions[0] !== contactElementPath) {
  failures.push(`InstructorContact must be defined once, in ${contactElementPath}.`)
}
const renderSites = codeFiles
  .flatMap((path) => (code[path].match(/<InstructorContact\s*\/>/g) ?? []).map(() => path))
  .sort()
if (renderSites.length !== shells.length || renderSites.some((path, index) => path !== [...shells].sort()[index])) {
  failures.push(
    'The contact element must be rendered exactly once by each page shell (CourseHome, SectionPage, ' +
      `and LessonShell) and nowhere else; found: ${renderSites.join(', ') || 'none'}.`,
  )
}
const importers = codeFiles.filter((path) => /from '[^']*InstructorContact'/.test(code[path])).sort()
if (importers.length !== shells.length || importers.some((path, index) => path !== [...shells].sort()[index])) {
  failures.push(
    `InstructorContact may only be imported by the page shells; found: ${importers.join(', ') || 'none'}.`,
  )
}

// Lesson content never presents contact information of its own.
const forbiddenLessonContact = ['تواصل عبر واتساب', 'للاستفسار أو متابعة الدرس، تواصل عبر الرقم التالي.']
for (const path of filesUnder('src/lessons')) {
  const text = readFileSync(path, 'utf8')
  for (const phrase of forbiddenLessonContact) {
    if (text.includes(phrase)) failures.push(`${path} still presents a contact block: ${phrase}`)
  }
}

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}
console.log(
  'Course architecture check passed: the section-index platform home, the data-driven ' +
    'section pages (lesson grid or empty state), the five permanent sections with every ' +
    'lesson declaring its sectionId, hash routing with unchanged lesson deep links, the ' +
    'reusable sequential lesson flow (LessonShell → LessonFlow → LessonStep), and the ' +
    'single shared contact element (one data source, shell-owned, absent from lesson content).',
)
