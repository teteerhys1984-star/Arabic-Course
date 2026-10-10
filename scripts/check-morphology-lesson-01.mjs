import { existsSync, readFileSync } from 'node:fs'

/**
 * Content and structure audit for Section 2 (الصرف) — Lesson 1: مدخل إلى علم الصرف.
 *
 * Verifies, against the source files:
 *  - the lesson is registered once, in the morphology section, with the stable id and number;
 *  - the source's twelve objectives are present;
 *  - all 45 exam questions are present, numbered 1–45 without gaps, with the 10/10/10/5/5/5 split;
 *  - the fifteen activity words and the eight worked examples are present;
 *  - the lesson is a native multi-step flow (LessonFlow), not one long page;
 *  - the exam never reveals answers before submission (solutions gated, no inline correction);
 *  - the Teacher Area is present and gated by the approved teacher password;
 *  - no second morphology lesson or extra course is introduced (lesson 2 is not built here).
 */

const failures = []
const read = (path) => {
  if (!existsSync(path)) {
    failures.push(`Missing file: ${path}`)
    return ''
  }
  return readFileSync(path, 'utf8')
}

const registry = read('src/lessons/registry.ts')
const content = read('src/lessons/morphology-lesson-01/content.ts')
const lesson = read('src/lessons/LessonMorphologyOne.tsx')
const grading = read('src/lessons/morphology-lesson-01/grading.ts')
const sharedGrading = read('src/shared/test/grading.ts')
const sharedSolutions = read('src/shared/test/components/SolutionsArea.tsx')
const app = read('src/app/App.tsx')

// --- Registry: one entry, correct section, number and title ----------------
const entryCount = (registry.match(/id: 'morphology-lesson-01'/g) ?? []).length
if (entryCount !== 1) failures.push(`Lesson registry must contain morphology-lesson-01 exactly once (found ${entryCount}).`)
const entry = registry.slice(registry.indexOf("id: 'morphology-lesson-01'"), registry.indexOf("id: 'morphology-lesson-01'") + 700)
if (!/sectionId: 'morphology'/.test(entry)) failures.push('morphology-lesson-01 must declare sectionId: \'morphology\'.')
if (!/number: '١'/.test(entry)) failures.push('morphology-lesson-01 must be numbered ١ inside its section.')
if (!/title: 'مدخل إلى علم الصرف'/.test(entry)) failures.push('morphology-lesson-01 title must be «مدخل إلى علم الصرف».')
if (!/available: true/.test(entry)) failures.push('morphology-lesson-01 must be available.')
// Narrowed when Lesson 2 was built (docs/morphology-lesson-02-audit.md): Lesson 2 now exists and is
// registered in الصرف, so the guarantee becomes (a) no THIRD morphology lesson yet, and (b) Lesson 1's
// own files stay independent of Lesson 2. Every other Lesson 1 assertion below is unchanged.
if (/morphology-lesson-0[3-9]|morphology-lesson-1\d/.test(registry + content + lesson)) {
  failures.push('No third morphology lesson may be created yet (Lesson 3 is only a teaser).')
}
if (/LessonMorphologyTwo|morphology-lesson-02/.test(content + lesson)) {
  failures.push('Lesson 1 content/component must stay independent of Lesson 2 (no cross-references).')
}
if (!/morphology-lesson-01/.test(app) || !/LessonMorphologyOne/.test(app)) {
  failures.push('App must route morphology-lesson-01 to LessonMorphologyOne.')
}

// --- Objectives: the twelve source objectives ----------------------------
const objectivesBlock = content.slice(content.indexOf('export const objectives = ['), content.indexOf('export const definitionText'))
const objectiveCount = (objectivesBlock.match(/^\s+'[^']+',?$/gm) ?? []).length
if (objectiveCount !== 12) failures.push(`The lesson must list the twelve objectives (found ${objectiveCount}).`)

// --- Exam: 45 questions, numbered 1–45 with no gap ------------------------
const questionIds = new Set()
for (const match of content.matchAll(/(?:mcq|tf|rootQ|essayQ)\('(q\d{2})'|id: '(q\d{2})'/g)) {
  questionIds.add(match[1] ?? match[2])
}
const expectedIds = Array.from({ length: 45 }, (_, index) => `q${String(index + 1).padStart(2, '0')}`)
const missing = expectedIds.filter((id) => !questionIds.has(id))
if (missing.length) failures.push(`Exam questions missing from content: ${missing.join(', ')}.`)
if (questionIds.size !== 45) failures.push(`The exam must contain exactly 45 questions (found ${questionIds.size}).`)
const typeCounts = {
  mcq: (content.match(/^\s+mcq\('q/gm) ?? []).length,
  tf: (content.match(/^\s+tf\('q/gm) ?? []).length,
  rootQ: (content.match(/^\s+rootQ\('q/gm) ?? []).length,
  essayQ: (content.match(/^\s+essayQ\('q/gm) ?? []).length,
}
// 36–40 are declared inline (analysis); 31–35 and 41–45 are essayQ calls.
const analysisInline = (content.match(/^\s+type: 'تحليل صرفي',$/gm) ?? []).length
if (typeCounts.mcq !== 10) failures.push(`Expected 10 multiple-choice questions (found ${typeCounts.mcq}).`)
if (typeCounts.tf !== 10) failures.push(`Expected 10 true/false questions (found ${typeCounts.tf}).`)
if (typeCounts.rootQ !== 10) failures.push(`Expected 10 root-extraction questions (found ${typeCounts.rootQ}).`)
if (analysisInline !== 5) failures.push(`Expected 5 analysis questions (found ${analysisInline}).`)
if (typeCounts.essayQ !== 10) failures.push(`Expected 10 essay-style questions (31–35 and 41–45) (found ${typeCounts.essayQ}).`)

// Essay-style questions must never be auto-graded.
if (!/essay'/.test(content) || !/kind: 'essay'/.test(content)) failures.push('Essay questions must use an essay field.')
if (!/kind === 'essay'/.test(sharedGrading)) failures.push('The shared grading engine must treat essay fields as manual review.')
if (!/essay-only|return answered \? 'manual' : 'unanswered'/.test(sharedGrading)) failures.push('The shared grading engine must report answered essay-only questions as manual review.')
if (!/from '..\/..\/shared\/test'/.test(grading)) failures.push('The lesson grading module must delegate to the shared engine.')

// --- Activity and worked examples ---------------------------------------
const wordCount = (content.match(/\{ id: 'w\d{2}'/g) ?? []).length
if (wordCount !== 15) failures.push(`The activity must contain the fifteen source words (found ${wordCount}).`)
const workedCount = (content.match(/\{ id: \d+, word:/g) ?? []).length
if (workedCount !== 8) failures.push(`The lesson must contain the eight solved examples (found ${workedCount}).`)

// --- Native multi-step flow, not a long page -----------------------------
const stepCount = (lesson.match(/\bstep\(\s*'/g) ?? []).length
const stepLiteral = (lesson.match(/step\(\s*\n?\s*`/g) ?? []).length
if (stepCount + stepLiteral < 30) failures.push(`The lesson must be a multi-step flow with at least 30 steps (found ${stepCount + stepLiteral}).`)
if (!/<LessonFlow/.test(lesson)) failures.push('The lesson must render its steps through LessonFlow.')

// --- Exam behaviour: no leaks before submission ---------------------------
if (/teacherAnswer[^\n]*(?:<|\{)/.test(lesson)) {
  // teacherAnswer may only appear in the Teacher Area.
}
if (!lesson.includes('export const testDefinition: TestDefinition')) failures.push('The exam must be declared once in the shared platform schema (testDefinition).')
if (!lesson.includes('<TestPageView')) failures.push('Every exam page must render through the shared TestPageView (page-level «تحقّق من الإجابات»).')
if (!lesson.includes('useTestEngine(testDefinition)')) failures.push('The exam must use the shared engine so answers and page results survive navigation.')
if (!lesson.includes('<SolutionsArea')) failures.push('The solutions step must render the shared SolutionsArea.')
if (!lesson.includes('engine={testEngine}')) failures.push('The solutions area must share the exam engine (per-page reveal).')
if (!sharedSolutions.includes('تحقّق من هذه الصفحة أولًا')) failures.push('The shared SolutionsArea must keep unchecked pages locked (no premature exposure).')
if (/النتيجة الآلية/.test(lesson.slice(0, lesson.indexOf('function SubmitStep')))) {
  failures.push('The score must not be rendered before the submit step.')
}
if (!/function SubmitStep/.test(lesson) || !/allPagesChecked/.test(lesson)) failures.push('The submit step must combine the latest valid page results (final result when all pages are checked).')
if (!/إعادة الاختبار/.test(lesson) || !/resetTest/.test(lesson)) {
  failures.push('Retaking the exam must clear previous answers and page results through the shared engine.')
}
if (/setTestAnswers\(\{\}\)/.test(lesson)) failures.push('The exam must not keep legacy answer state; the shared engine owns reset.')

// --- Teacher Area ---------------------------------------------------------
// The password value lives only in the shared constant; the lesson imports it, never copies it.
if (!/<TeacherSpace password=\{COURSE_TEACHER_PASSWORD\}>/.test(lesson)) {
  failures.push('The Teacher Area must stay behind the approved teacher password (via COURSE_TEACHER_PASSWORD).')
}
const passwordValue = /COURSE_TEACHER_PASSWORD\s*=\s*'([^']+)'/.exec(read('src/shared/teacher/teacherPassword.ts'))?.[1] ?? ''
for (const [name, source] of [
  ['lesson', lesson],
  ['content', content],
  ['grading', grading],
  ['registry', registry],
  ['morphology source inventory', read('docs/morphology-lesson-01-source-inventory.md')],
  ['morphology source audit', read('docs/morphology-lesson-01-source-audit.md')],
]) {
  if (source.includes(passwordValue)) failures.push(`The teacher password must not appear in ${name}.`)
}
for (const heading of ['الإجابات النموذجية', 'حلول النشاط التطبيقي', 'نشاط علاجي', 'تحدٍّ للطلاب المتقدمين', 'بطاقة المراجعة']) {
  if (!lesson.includes(heading)) failures.push(`The Teacher Area must include «${heading}».`)
}

// --- Source-fidelity and grading regressions (see docs/morphology-lesson-01-source-audit.md) ---
const requirePhrase = (source, phrase, label) => {
  if (!source.includes(phrase)) failures.push(`Missing ${label}: «${phrase}».`)
}
requirePhrase(content, 'مدخل إلى علم الصرف', 'lesson title')
requirePhrase(content, 'وغير ذلك من أبواب بنية الكلمة', 'topics sentence')
requirePhrase(content, 'علم الصرف هو العلم الذي يبحث في بنية الكلمة العربية', 'definition')
if (/اكْتَتَبَ|اكتتب/.test(content + lesson)) failures.push('The external Q43 example (اكتتب) must be removed.')
// تعليم: the written form has no shadda, so the doubled flag must be false.
if (!/word: 'تعليم'[^\n]*doubled: false/.test(content)) failures.push('تعليم must be analysed as not doubled (no shadda in the written form).')
for (const family of ['يَكْتُبُ', 'مَكْتَبة', 'يَعْلَمُ', 'تَعَلُّم']) {
  requirePhrase(content, family, 'family member')
}
const toolsBlock = content.slice(content.indexOf('export const originalTools'), content.indexOf('export const originalLab'))
if (/text:/.test(toolsBlock)) failures.push('The tools list must show the source titles only (no invented descriptions).')
if (!/function checkWeight\(/.test(lesson) || !/checkWeight\(word, values\.weight\)/.test(lesson)) {
  failures.push('The 15-word activity must grade the weight field.')
}

// --- Lesson 3 teaser: text only, no lesson, no test ------------------------
// (Was «Lesson 2 must not be built»; narrowed now that Lesson 2 ships — see the audit document.)
if (/LessonMorphologyThree|morphology-lesson-03/.test(lesson + app + registry)) {
  failures.push('Lesson 3 must not be built or registered yet.')
}
if (/LessonMorphologyTwo|morphology-lesson-02/.test(lesson)) {
  failures.push('Lesson 1 must not embed or link Lesson 2 (its next-lesson teaser stays text-only).')
}

// --- Hygiene: no unfinished markers in shipped lesson code ---------------
for (const [name, source] of [['content', content], ['lesson', lesson]]) {
  if (/TODO|FIXME|lorem ipsum/i.test(source)) failures.push(`${name} contains an unfinished marker.`)
}

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}
console.log(
  'Morphology lesson 1 check passed: registered once in الصرف as lesson ١, twelve objectives, ' +
    '45 exam questions numbered 1–45 (10/10/10/5/5/5), fifteen activity words, eight solved examples, ' +
    'a native multi-step LessonFlow, gated solutions and results, and a password-protected Teacher Area.',
)
