import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, existsSync } from 'node:fs'
import { coverage, marks, teachingSections, challengeQuestions, examQuestions, testDefinition, homework, workedExamples } from '../src/lessons/lesson-twelve/content.ts'
import { lessonRegistry } from '../src/lessons/registry.ts'

const registered = lessonRegistry.filter((l) => l.id === 'lesson-12')
assert.equal(registered.length, 1)
assert.equal(registered[0].sectionId, 'basics-grammar')
assert.equal(registered[0].number, '١٢')
assert.equal(registered[0].available, true)
assert.deepEqual(lessonRegistry.filter((l) => l.sectionId === 'basics-grammar').map((l) => l.id), Array.from({ length: 12 }, (_, i) => `lesson-${i + 1}`))
assert(!lessonRegistry.some((l) => l.id === 'lesson-13' || /unit.*test/.test(l.id)))
assert(!existsSync('src/lessons/LessonThirteen.tsx'))
assert.equal(coverage.length, 20)
const component = readFileSync('src/lessons/LessonTwelve.tsx', 'utf8')
const steps = new Set([...teachingSections.map((s) => s.id), ...Array.from(component.matchAll(/id: '([^']+)'/g), (m) => m[1]), 'exam-1'])
coverage.forEach(([, id]) => assert(steps.has(id), `Missing axis ${id}`))
assert.equal(challengeQuestions.length, 8)
assert.equal(examQuestions.length, 16)
assert.deepEqual(testDefinition.pages.map((p) => p.questions.length), [5, 5, 3, 3])
assert.deepEqual(examQuestions.map((q) => q.number), Array.from({ length: 16 }, (_, i) => i + 1))
assert.equal(new Set([...challengeQuestions, ...examQuestions].map((q) => q.id)).size, 24)
const challengeOracle = ['مهندسانِ', 'ـَيْنِ', 'معلّمونَ', 'ينَ', 'ممرضاتٌ', 'الكسرة نيابةً عن الفتحة', 'رجال', 'الألف']
const examOracle = ['مثنّى', 'جمع مذكر سالم', 'جمع مؤنث سالم', 'جمع تكسير', 'مثنّى', 'الألف', 'الياء', 'الياء', 'الضمة', 'الكسرة نيابةً عن الفتحة', null, null, null, 'رأيتُ الطالبَيْنِ.', 'نجحَ المجتهدونَ.', 'كرّمتُ المتفوّقاتِ.']
for (const [questions, oracle] of [[challengeQuestions, challengeOracle], [examQuestions, examOracle]]) {
  questions.forEach((q, i) => {
    assert.equal(q.fields.length, 1)
    const field = q.fields[0]
    assert(q.solution && q.explanation && q.explanation.length > 40)
    if (oracle[i] === null) {
      assert.equal(field.kind, 'essay')
      assert(q.parsing.length >= 2 && q.parsing.join(' ').includes('علامة'))
      assert.equal(q.revealEssaySolution, true)
    } else {
      assert.equal(field.kind, 'choice')
      assert.equal(field.answer, oracle[i])
      assert(field.options.includes(field.answer))
      assert.equal(new Set(field.options).size, field.options.length)
    }
  })
}
assert.deepEqual(marks.map((m) => m.signs), [['الألف', 'الياء', 'الياء'], ['الواو', 'الياء', 'الياء'], ['الضمة', 'الكسرة نيابةً عن الفتحة', 'الكسرة']])
assert.equal(workedExamples.length, 5)
assert.deepEqual(homework.map((h) => [h.dual, h.plural]), [['طالبانِ', 'طالبونَ'], ['معلّمانِ', 'معلّمونَ'], ['طالبتانِ', 'طالباتٌ'], ['مهندستانِ', 'مهندساتٌ']])
for (const token of ['<TeacherSpace>', '<SolutionsArea', '<TestPageView', '<Homework answers />', 'mode="teacher"', 'revealFeedback={false}', 'showSolutions', 'showHomework']) assert(component.includes(token))
assert(readFileSync('src/app/App.tsx', 'utf8').includes('<LessonTwelve onFinish={finishLesson} />'))
// Scope guard against the known task base: no prior lesson content, shared runtime,
// registry entry, or spelling/morphology source may silently change.
const inventory = JSON.parse(readFileSync('docs/lesson-12-source-inventory.json', 'utf8'))
const hash = (text) => createHash('sha256').update(text).digest('hex')
const registry = readFileSync('src/lessons/registry.ts', 'utf8')
assert.equal(hash(registry.replace(/  \{\n    id: 'lesson-12',[\s\S]*?\n  \},\n/, '')), inventory.registrySha256)
assert(Object.keys(inventory.previousRuntimeSha256).length > 100)
for (const [file, digest] of Object.entries(inventory.previousRuntimeSha256)) {
  assert.equal(hash(readFileSync(file, 'utf8')), digest, `Unrelated source changed: ${file}`)
}
console.log('Lesson 12 structural audit passed: unique basics registration, 20 axes, 8 verified challenge keys, 16 exam questions (5/5/3/3, 3 manual), 5 parsed applications, 4 homework solutions, teacher guide, disclosure controls, previous source unchanged, no lesson 13 or unit test.')
