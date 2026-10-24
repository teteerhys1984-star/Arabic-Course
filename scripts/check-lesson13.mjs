import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, existsSync } from 'node:fs'
import {
  title, coverage, marks, teachingSections, challengeQuestions, examQuestions, examParsing,
  testDefinition, homework, workedExample, objectives,
} from '../src/lessons/lesson-thirteen/content.ts'
import { lessonRegistry } from '../src/lessons/registry.ts'

// ---------------------------------------------------------------------------
// Registration: exactly one basics entry, after lesson 12, no unit test, no lesson 14.
// ---------------------------------------------------------------------------
const registered = lessonRegistry.filter((l) => l.id === 'lesson-13')
assert.equal(registered.length, 1)
assert.equal(registered[0].sectionId, 'basics-grammar')
assert.equal(registered[0].number, '١٣')
assert.equal(registered[0].available, true)
assert.equal(registered[0].title, 'علامات الإعراب الفرعية')
assert.deepEqual(
  lessonRegistry.filter((l) => l.sectionId === 'basics-grammar').map((l) => l.id),
  Array.from({ length: 13 }, (_, i) => `lesson-${i + 1}`),
)
assert(!lessonRegistry.some((l) => l.id === 'lesson-14' || /unit.*test/.test(l.id)))
assert(!existsSync('src/lessons/LessonFourteen.tsx'))
assert(!existsSync('src/lessons/lesson-fourteen'))

// ---------------------------------------------------------------------------
// Source fidelity: the verbatim source is preserved with its documented hash, and
// the displayed content applies only the documented corrections (audit ت-1 … ت-5).
// ---------------------------------------------------------------------------
const source = readFileSync('docs/source/lesson-13-subordinate-inflection-marks.md', 'utf8')
assert.equal(
  createHash('sha256').update(source).digest('hex'),
  '4efd5b872272e4ebdc7432e21cf1c3338379ab47bc1a087b89f7e9516af35bc4',
)
for (const line of [
  'علامات الإعراب الفرعية',
  'المثنّى: ألفٌ في الرفع، وياءٌ في النصب والجر.',
  'جمع المذكر السالم: واوٌ في الرفع، وياءٌ في النصب والجر.',
  'العلامة الكاملة: 20 درجة',
  'الدرس التالي في ترتيب قسم الأساسيات والنحو هو الأسماء الخمسة.',
]) assert(source.includes(line), `Source line missing: ${line}`)

const content = readFileSync('src/lessons/lesson-thirteen/content.ts', 'utf8')
assert(!content.includes('كرّمتِ المديرةُ'), 'ت-1: the ambiguous source phrasing must not reach the display')
assert(content.includes('كرَّمَ المديرُ المجتهداتِ.') && content.includes('كرَّمَ المديرُ الطالباتِ.'))
assert(!content.includes('بـ المعلّمَيْنِ') && !content.includes('بـ الطالبَيْنِ'), 'ت-2: spaced باء notation must be normalized')
assert(content.includes('مررتُ بالمعلّمَيْنِ.') && content.includes('مررتُ بالطالبَيْنِ.'))
assert(content.includes('وصلتِ المعلّمتانِ.') && content.includes('وليست تاء مخاطبة.'), 'ت-3: keep the sentence and disambiguate the ta')
assert(content.includes('معَ: ظرف منصوب وعلامة نصبه الفتحة الظاهرة على آخره، وهو مضاف؛ «مع» هنا ليست حرف جر.'), 'ت-4')
assert(!/مع:\s*حرف جر/.test(content), 'ت-4: «مع» must never be described as a preposition')
assert(existsSync('docs/lesson-13-subordinate-inflection-marks-audit.md'))

// ---------------------------------------------------------------------------
// Teaching coverage: 20 audited axes → real steps; complete example parsings.
// ---------------------------------------------------------------------------
const component = readFileSync('src/lessons/LessonThirteen.tsx', 'utf8')
const steps = new Set([...teachingSections.map((s) => s.id), ...Array.from(component.matchAll(/id: '([^']+)'/g), (m) => m[1]), 'exam-1'])
assert.equal(coverage.length, 20)
coverage.forEach(([, id]) => assert(steps.has(id), `Missing axis ${id}`))
assert.equal(objectives.length, 7)
assert.equal(teachingSections.length, 11)
assert.equal(workedExample.sentence, 'كرَّمَ المديرُ المتفوّقينَ.')
for (const example of [...examParsing.map((item) => ({ parsing: item.parsing })), workedExample]) {
  assert(example.parsing.join(' ').includes('علامة'))
}
assert.deepEqual(marks.map((m) => m.signs), [
  ['الألف', 'الياء', 'الياء'],
  ['الواو', 'الياء', 'الياء'],
  ['الضمة', 'الكسرة نيابةً عن الفتحة', 'الكسرة'],
])
assert.equal(homework.length, 3)
for (const row of homework) {
  assert(row.model.includes('المدرسة'))
  assert(row.parsing.join(' ').includes('علامة'))
}

// ---------------------------------------------------------------------------
// Challenge: the eight source questions with independently derived keys.
// ---------------------------------------------------------------------------
assert.equal(challengeQuestions.length, 8)
const challengeOracle = ['الألف', 'الياء', 'الياء', 'الواو', 'الياء', 'الكسرة نيابةً عن الفتحة', 'الكسرة', 'حضرَ الطالبانِ']
challengeQuestions.forEach((q, i) => {
  assert.equal(q.fields.length, 1)
  const field = q.fields[0]
  assert.equal(field.kind, 'choice')
  assert.equal(field.answer, challengeOracle[i])
  assert(field.options.includes(field.answer))
  assert.equal(new Set(field.options).size, field.options.length)
  assert(q.solution && q.explanation && q.explanation.length > 40)
})

// ---------------------------------------------------------------------------
// Independent exam: 20 questions, 20 points (5/5/6/4), source keys preserved.
// ---------------------------------------------------------------------------
assert.equal(examQuestions.length, 20)
assert.deepEqual(testDefinition.pages.map((p) => p.questions.length), [5, 5, 6, 4])
assert.deepEqual(testDefinition.pages.map((p) => p.title), [
  'السؤال الأول: اختر الإجابة الصحيحة — ٥ درجات',
  'السؤال الثاني: أكمل الفراغ — ٥ درجات',
  'السؤال الثالث: أعرب الكلمة المميّزة — ٦ درجات',
  'السؤال الرابع: صحّح الخطأ — ٤ درجات',
])
assert.deepEqual(examQuestions.map((q) => q.number), Array.from({ length: 20 }, (_, i) => i + 1))
assert.equal(new Set([...challengeQuestions, ...examQuestions].map((q) => q.id)).size, 28)
const mcqOracle = ['الألف', 'الياء', 'الكسرة نيابةً عن الفتحة', 'الياء', 'نجحَ المجتهدونَ.']
const fillOracle = ['الألف', 'الياء', 'الواو', 'الياء', 'الكسرة']
const correctionOracle = ['حضرَ الطالبانِ.', 'رأيتُ المعلّمينَ.', 'كرّمتُ الطالباتِ.', 'سلّمتُ على الطالبَيْنِ.']
examQuestions.forEach((q, i) => {
  assert.equal(q.fields.length, 1)
  const field = q.fields[0]
  assert(q.solution && q.explanation && q.explanation.length > 40, `q${i + 1} needs a real explanation`)
  assert(q.teacherAnswer && !q.teacherAnswer.includes('حسب الكتاب'), `q${i + 1} needs a real teacher answer`)
  if (i < 5) {
    assert.equal(field.kind, 'choice')
    assert.equal(field.answer, mcqOracle[i])
    assert(field.options.includes(field.answer))
    assert.equal(q.sourceAnswer, ['ب — الألف.', 'ج — الياء.', 'أ — الكسرة نيابةً عن الفتحة.', 'ب — الياء.', 'ج — نجحَ المجتهدونَ.'][i])
  } else if (i < 10) {
    assert.equal(field.kind, 'text')
    assert.equal(field.accept[0], fillOracle[i - 5])
    assert(field.accept.length >= 3, `q${i + 1} needs multiple accepted forms`)
  } else if (i < 16) {
    assert.equal(field.kind, 'essay')
    assert.equal(q.revealEssaySolution, true)
    const item = examParsing[i - 10]
    assert.equal(item.number, i + 1)
    assert(q.parsing.length >= 2 && q.parsing.join(' ').includes('علامة'))
    for (const element of ['الوظيفة', 'الحالة الإعرابية', 'العلامة', 'السبب']) {
      assert(q.teacherAnswer.includes(element), `q${i + 1} teacher answer misses ${element}`)
    }
    assert(q.sourceAnswer.includes('؛ لأنه'))
  } else {
    assert.equal(field.kind, 'text')
    assert.equal(q.sourceAnswer, correctionOracle[i - 16])
    assert(field.accept.includes(q.sourceAnswer.replace(/\.$/, '')) || field.accept.includes(q.sourceAnswer))
    assert(field.accept.length >= 2, `q${i + 1} accepts full sentence and corrected word`)
  }
})
// 5 + 5 + 6 + 4 = 20 questions × 1 point = 20 points.
assert.equal(
  testDefinition.pages.reduce((sum, page) => sum + page.questions.length, 0),
  20,
)
assert(testDefinition.description.includes('٢٠ درجة'))

// ---------------------------------------------------------------------------
// Component contract: shared framework, working «صحّح إجاباتي», disclosure gates.
// ---------------------------------------------------------------------------
for (const token of [
  '<TeacherSpace>', '<SolutionsArea', '<TestPageView', '<Homework answers />',
  'mode="teacher"', 'revealFeedback={false}', 'showSolutions', 'showHomework',
  'صحّح إجاباتي', 'useTestEngine(testDefinition)', "export const testDefinition: TestDefinition",
  'disabled={!exam.allPagesChecked}', 'disabled={!submitted}', 'dir="rtl"',
]) assert(component.includes(token), `Component token missing: ${token}`)
assert(!component.includes('href="#/lesson/lesson-14'))
assert(!/<img|https?:\/\//.test(component))
assert(readFileSync('src/app/App.tsx', 'utf8').includes('<LessonThirteen onFinish={finishLesson} />'))

// ---------------------------------------------------------------------------
// Scope guard against the lesson-12 inventory: no previous lesson content, shared
// runtime, or unrelated registry entry may silently change. Later independent lesson
// registrations are removed before hashing (see the lesson-13 audit, section 5).
// ---------------------------------------------------------------------------
const inventory = JSON.parse(readFileSync('docs/lesson-12-source-inventory.json', 'utf8'))
const hash = (text) => createHash('sha256').update(text).digest('hex')
const registry = readFileSync('src/lessons/registry.ts', 'utf8')
const withoutEntries = registry
  .replace(/  \{\n    id: 'lesson-12',[\s\S]*?\n  \},\n/, '')
  .replace(/  \{\n    id: 'lesson-13',[\s\S]*?\n  \},\n/, '')
  .replace(/  \{\n    id: 'morphology-lesson-13',[\s\S]*?\n  \},\n/, '')
  .replace(/  \{\n    id: 'spelling-lesson-13',[\s\S]*?\n  \},\n/, '')
assert.equal(hash(withoutEntries), inventory.registrySha256)
assert(Object.keys(inventory.previousRuntimeSha256).length > 100)
for (const [file, digest] of Object.entries(inventory.previousRuntimeSha256)) {
  assert.equal(hash(readFileSync(file, 'utf8')), digest, `Unrelated source changed: ${file}`)
}

console.log(
  'Lesson 13 structural audit passed: single basics registration after lesson 12, verbatim source hash, ' +
    '5 documented corrections applied, 20 axes, 8 challenge keys, 20 exam questions (5/5/6/4 = 20 points), ' +
    '6 manual parsings with the four elements, 3 homework models, teacher guide, disclosure gates, ' +
    'previous source unchanged, no lesson 14 and no unit test.',
)
