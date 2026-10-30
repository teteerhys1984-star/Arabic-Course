import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, existsSync } from 'node:fs'
import {
  title, subtitle, objectives, coverage, fiveNouns, signTable, conditionList, commonErrors,
  methodSteps, comparisonMarks, challengeQuestions, challengeTest, examQuestions, examParsing,
  testDefinition, homeworkSentences, homeworkParsing, compositionModels, homeworkCriteria,
  mindMap, summary, masteryChallenge, nextLesson,
} from '../src/lessons/basics-lesson-14/content.ts'
import { lessonRegistry } from '../src/lessons/registry.ts'

// ---------------------------------------------------------------------------
// 1. Registration: exactly one basics lesson 14, after lesson 13, independent of the
//    spelling and morphology lesson 14 slots, with no previous entry rewritten.
// ---------------------------------------------------------------------------
const registered = lessonRegistry.filter((l) => l.id === 'basics-lesson-14')
assert.equal(registered.length, 1)
assert.equal(registered[0].sectionId, 'basics-grammar')
assert.equal(registered[0].number, '١٤')
assert.equal(registered[0].eyebrow, 'الأسماء الخمسة')
assert.equal(registered[0].available, true)
assert.equal(registered[0].title, 'الأسماء الخمسة: كيف نُعرب الأسماء بالواو والألف والياء؟')
assert.deepEqual(
  lessonRegistry.filter((l) => l.sectionId === 'basics-grammar').map((l) => l.id),
  [...Array.from({ length: 13 }, (_, i) => `lesson-${i + 1}`), 'basics-lesson-14'],
)
const basics = lessonRegistry.filter((l) => l.sectionId === 'basics-grammar')
assert.equal(basics[basics.length - 1].id, 'basics-lesson-14', 'lesson 14 is last in the basics sequence')
assert.equal(new Set(lessonRegistry.map((l) => l.id)).size, lessonRegistry.length, 'lesson ids are unique')
assert(!lessonRegistry.some((l) => l.id === 'spelling-lesson-14'), 'no spelling lesson 14 was created')
assert(!lessonRegistry.some((l) => l.id === 'morphology-lesson-14'), 'no morphology lesson 14 was created')
assert(!lessonRegistry.some((l) => /unit.*test/.test(l.id)), 'no unit assessment')
assert(!existsSync('src/lessons/LessonFourteen.tsx'), 'the lesson-14 component name is not reused')
assert(existsSync('src/lessons/LessonBasicsFourteen.tsx'))
assert(readFileSync('src/app/App.tsx', 'utf8').includes('<LessonBasicsFourteen onFinish={finishLesson} />'))
assert(readFileSync('src/app/App.tsx', 'utf8').includes("lesson.id === 'basics-lesson-14'"))

// ---------------------------------------------------------------------------
// 2. Source fidelity: the verbatim source is preserved with a frozen digest, and the
//    displayed content applies only the documented corrections (ت-1 … ت-6).
// ---------------------------------------------------------------------------
const source = readFileSync('docs/source/lesson-14-five-nouns.md', 'utf8')
for (const line of [
  'الدرس الرابع عشر: الأسماء الخمسة',
  'الأسماء الخمسة هي: أب، أخ، حم، فو، ذو.',
  'العلامة الكاملة: 20 درجة',
  'والدرس التالي في التسلسل المعتمد هو **كان وأخواتها**.',
  'وقد يرد في بعض كتب النحو اسم سادس هو «هن»',
]) assert(source.includes(line), `Source line missing: ${line}`)
const sourceDigest = createHash('sha256').update(source).digest('hex')
assert.match(sourceDigest, /^[0-9a-f]{64}$/)
assert(existsSync('docs/basics-lesson-14-audit.md'), 'the audit report must exist')

const content = readFileSync('src/lessons/basics-lesson-14/content.ts', 'utf8')
// ت-1: the vague source wording about yaa al-mutakallim is replaced by the precise rule.
assert(!content.includes('تُقدّر العلامات الإعرابية بحسب القاعدة المناسبة'))
assert(content.includes('الضمة المقدرة على ما قبل ياء المتكلم'))
assert(content.includes('الفتحة المقدرة على ما قبل ياء المتكلم'))
assert(content.includes('الكسرة المقدرة على ما قبل ياء المتكلم'))
assert(content.includes('منع من ظهورها اشتغال المحل بحركة المناسبة'))
// ت-2: the source key «فا» is preserved as a note, while the parsed word is «فاكَ».
assert(content.includes('ونسب المصدر الإعراب إلى «فا»'))
assert(content.includes('فاكَ: ${fiveAccused') || content.includes("fiveAccused('فاكَ', 'مفعول به')"))
// ت-3: the misleading «الاسم المفرد غالبًا» column title is not displayed as a table row.
assert(!comparisonMarks.some((row) => row.type.includes('غالبًا')))
assert(content.includes('عبارة «الاسم المفرد غالبًا» خطأ في التعميم'))
// ت-5: «مع» is never described as a preposition.
assert(content.includes('«مع» هنا ليست حرف جر'))
assert(!/مع:\s*حرف جر/.test(content))
// ت-6: the ambiguous «هذا أبو كريمٌ» exercise keeps its intended meaning with a model answer.
assert(content.includes('هذا أبٌ كريمٌ'))

// ---------------------------------------------------------------------------
// 3. Teaching coverage: 7 objectives, 13 source sections mapped to real steps, the
//    five names, the three signs, the five conditions, 20 audited axes.
// ---------------------------------------------------------------------------
const component = readFileSync('src/lessons/LessonBasicsFourteen.tsx', 'utf8')
const stepIds = new Set([...Array.from(component.matchAll(/id: '([^']+)'/g), (m) => m[1]), 'exam-1'])
assert.equal(objectives.length, 7)
assert.equal(coverage.length, 20)
coverage.forEach(([, id]) => assert(stepIds.has(id), `Missing audited axis step: ${id}`))
assert.equal(fiveNouns.length, 5)
assert.deepEqual(fiveNouns.map((row) => row.name), ['أب', 'أخ', 'حم', 'فو', 'ذو'])
assert.deepEqual(signTable.map((row) => `${row.state}:${row.sign}`), ['الرفع:الواو', 'النصب:الألف', 'الجر:الياء'])
assert.equal(conditionList.length, 5)
assert.equal(commonErrors.length, 5)
assert.equal(methodSteps.length, 4)
assert.equal(comparisonMarks.length, 5)
assert.deepEqual(comparisonMarks[comparisonMarks.length - 1].type, 'الأسماء الخمسة عند تحقق شروطها')
assert.equal(mindMap.names.length, 5)
assert.equal(mindMap.marks.length, 3)
assert.equal(mindMap.conditions.length, 5)
assert.equal(summary.length, 6)
assert.equal(masteryChallenge.length, 5)
assert.equal(nextLesson.title, 'كان وأخواتها')
assert.equal(nextLesson.route, '#/lesson/lesson-9')
assert(lessonRegistry.some((l) => l.id === 'lesson-9' && l.title === 'كان وأخواتها'), 'the next lesson route is real')
assert(content.includes(subtitle))

// ---------------------------------------------------------------------------
// 4. Interactive practice: the eight source questions with one choice each.
// ---------------------------------------------------------------------------
assert.equal(challengeQuestions.length, 8)
assert.deepEqual(challengeQuestions.map((q) => q.number), [1, 2, 3, 4, 5, 6, 7, 8])
const challengeOracle = ['أبوكَ', 'أخاكَ', 'أبيكَ', 'جاء أبوكَ.', 'ذو', 'اسم مجرور بالياء؛ لأنه من الأسماء الخمسة.', 'الألف.', 'كتاب.']
challengeQuestions.forEach((q, index) => {
  assert.equal(q.fields.length, 1)
  const field = q.fields[0]
  assert.equal(field.kind, 'choice')
  assert.equal(field.answer, challengeOracle[index], `challenge key ${index + 1}`)
  assert(field.options.includes(field.answer))
  assert.equal(new Set(field.options).size, field.options.length)
  assert(q.solution && q.explanation && q.explanation.length > 40)
  assert.equal(q.answerSource, 'platform')
})
assert.equal(challengeTest.pages.length, 1)
assert.equal(challengeTest.pages[0].questions.length, 8)

// ---------------------------------------------------------------------------
// 5. Independent exam: 20 questions, 20 points (5/4/6/5), source keys preserved.
// ---------------------------------------------------------------------------
assert.equal(examQuestions.length, 20)
assert.deepEqual(examQuestions.map((q) => q.number), Array.from({ length: 20 }, (_, i) => i + 1))
assert.deepEqual(testDefinition.pages.map((p) => p.questions.length), [5, 4, 6, 5])
assert.deepEqual(testDefinition.pages.map((p) => p.title), [
  'السؤال الأول: اختر الإجابة الصحيحة — ٥ درجات',
  'السؤال الثاني: أكمل الفراغ — ٤ درجات',
  'السؤال الثالث: أعرب الكلمة المميّزة — ٦ درجات',
  'السؤال الرابع: صحّح الخطأ — ٥ درجات',
])
assert.equal(testDefinition.pages.reduce((sum, page) => sum + page.questions.length, 0), 20)
assert(testDefinition.description.includes('٢٠ درجة'))
const mcqKeys = ['الواو', 'الألف', 'الياء', 'جاء أبوكَ.', 'مفعول به منصوب.']
const fillKeys = ['الأسماء الخمسة', 'الواو', 'الألف', 'الياء']
const correctionKeys = ['جاء أبوكَ.', 'رأيتُ أباكَ.', 'مررتُ بأخيكَ.', 'أنتَ ذو علمٍ.', 'هذا أبٌ كريمٌ.']
examQuestions.forEach((q, index) => {
  assert(q.fields.length > 0)
  assert(q.solution && q.solution.length > 0)
  assert(q.explanation && q.explanation.length > 40, `q${index + 1} explanation`)
  assert(q.teacherAnswer && !q.teacherAnswer.includes('حسب الكتاب'), `q${index + 1} teacher answer`)
  assert.equal(q.answerSource, 'source')
  if (index < 5) {
    const field = q.fields[0]
    assert.equal(field.kind, 'choice')
    assert.equal(field.answer, mcqKeys[index])
    assert(field.options.includes(field.answer))
  } else if (index < 9) {
    if (index === 5) {
      assert.equal(q.fields.length, 5, 'question 6 asks for the five names in five fields')
      assert.deepEqual(q.fields.map((field) => (field.kind === 'text' ? field.accept[0] : '')), ['أب', 'أخ', 'حم', 'فو', 'ذو'])
    } else {
      const field = q.fields[0]
      assert.equal(field.kind, 'text')
      assert.equal(field.accept[0], fillKeys[index - 5])
      assert(field.accept.length >= 3, `q${index + 1} accepted forms`)
    }
  } else if (index < 15) {
    const field = q.fields[0]
    assert.equal(field.kind, 'essay')
    assert.equal(q.revealEssaySolution, true)
    const item = examParsing[index - 9]
    assert.equal(item.number, index + 1)
    assert(q.parsing.length >= 2 && q.parsing.join(' ').includes('علامة'))
    for (const element of ['الوظيفة', 'الحالة الإعرابية', 'العلامة', 'السبب']) {
      assert(q.teacherAnswer.includes(element), `q${index + 1} misses ${element}`)
    }
  } else {
    const field = q.fields[0]
    assert.equal(field.kind, 'text')
    assert.equal(q.sourceAnswer, correctionKeys[index - 15])
    assert(field.accept.length >= 2, `q${index + 1} accepts the sentence and the corrected word`)
  }
})

// ---------------------------------------------------------------------------
// 6. Homework: three activities with model answers and correction criteria.
// ---------------------------------------------------------------------------
assert.equal(homeworkSentences.length, 5)
assert.deepEqual(homeworkSentences.map((row) => row.answer), ['أبوكَ', 'أخاكَ', 'أبيكَ', 'ذو', 'ذي'])
assert.equal(homeworkParsing.length, 5)
for (const row of homeworkParsing) assert(row.parsing.join(' ').includes('علامة'))
assert.equal(compositionModels.length, 5)
assert(compositionModels.some((row) => row.state === 'مرفوع'))
assert(compositionModels.some((row) => row.state === 'منصوب'))
assert(compositionModels.some((row) => row.state === 'جر' || row.state === 'مجرور'))
assert.equal(homeworkCriteria.length, 4)

// ---------------------------------------------------------------------------
// 7. Component contract: shared framework, working «صحّح إجاباتي», disclosure gates.
// ---------------------------------------------------------------------------
for (const token of [
  '<TeacherSpace>', '<SolutionsArea', '<TestPageView', '<Homework answers />',
  'mode="teacher"', 'revealFeedback={false}', 'showSolutions', 'showHomework',
  'صحّح إجاباتي', 'useTestEngine(testDefinition)', 'export const testDefinition: TestDefinition',
  'disabled={!exam.allPagesChecked}', 'disabled={!submitted}', 'dir="rtl"',
  'fourteen-teacher-guide', 'fourteen-homework-answers', 'fourteen-challenge-progress',
]) assert(component.includes(token), `Component token missing: ${token}`)
// No solution call-to-action before submission, and no external image/URL in lesson content.
assert(component.includes("showSolutions && submitted"))
assert(!/<img|https?:\/\//.test(component))
assert(!component.includes('href="#/lesson/lesson-9"') || component.includes('nextLesson.route'))

// ---------------------------------------------------------------------------
// 8. Scope guard against the lesson-12 inventory: no previous lesson, shared runtime,
//    or unrelated registry entry may silently change.
// ---------------------------------------------------------------------------
const inventory = JSON.parse(readFileSync('docs/lesson-12-source-inventory.json', 'utf8'))
const hash = (text) => createHash('sha256').update(text).digest('hex')
const registry = readFileSync('src/lessons/registry.ts', 'utf8')
const withoutEntries = registry
  .replace(/  \{\n    id: 'lesson-12',[\s\S]*?\n  \},\n/, '')
  .replace(/  \{\n    id: 'lesson-13',[\s\S]*?\n  \},\n/, '')
  .replace(/  \{\n    id: 'morphology-lesson-13',[\s\S]*?\n  \},\n/, '')
  .replace(/  \{\n    id: 'spelling-lesson-13',[\s\S]*?\n  \},\n/, '')
  .replace(/  \{\n    id: 'basics-lesson-14',[\s\S]*?\n  \},\n/, '')
assert.equal(hash(withoutEntries), inventory.registrySha256)
assert(Object.keys(inventory.previousRuntimeSha256).length > 100)
for (const [file, digest] of Object.entries(inventory.previousRuntimeSha256)) {
  assert.equal(hash(readFileSync(file, 'utf8')), digest, `Unrelated source changed: ${file}`)
}

console.log(
  'Basics lesson 14 structural audit passed: unique basics registration after lesson 13, verbatim source archived, ' +
    '7 objectives, 20 audited axes mapped to real steps, 5 names, 3 signs, 5 conditions, 20 comparison rows/5 types, ' +
    '5 common errors, 8 challenge keys, 20 exam questions (5/4/6/5 = 20 points), 6 manual parsings with the four elements, ' +
    '3 homework activities with criteria, mind map, summary, mastery challenge, teacher guide, disclosure gates, ' +
    'previous source unchanged, no spelling/morphology lesson 14 and no unit test.',
)
