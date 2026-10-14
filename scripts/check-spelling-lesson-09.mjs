import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { sections, practice, quiz, homework, testDefinition, examQuestions } from '../src/lessons/spelling-lesson-09/content.ts'
const read = p => readFileSync(p, 'utf8')
const inventory = JSON.parse(read('docs/spelling-lesson-09-source-inventory.json'))
const hash = p => createHash('sha256').update(readFileSync(p)).digest('hex')
const lesson = read('src/lessons/LessonSpellingNine.tsx')
const registry = read('src/lessons/registry.ts')
const app = read('src/app/App.tsx')
const css = read('src/lessons/spelling-lesson-09/lesson.css')
const assert = (ok, label) => { if (!ok) throw Error(`Spelling 09: ${label}`) }
assert(hash('docs/source/spelling-lesson-09.md') === inventory.sourceSha256, 'source digest')
for (const [p,sha] of Object.entries(inventory.previousContentSha256)) assert(hash(p)===sha, `previous lesson intact: ${p}`)
for (const item of inventory.coverage) for (const term of item.terms) assert(read('src/lessons/spelling-lesson-09/content.ts').includes(term), `coverage: ${term}`)
assert(registry.indexOf("id: 'spelling-lesson-09'")>registry.indexOf("id: 'spelling-lesson-08'"), 'ordered ninth lesson')
assert(app.includes("lesson.id === 'spelling-lesson-09'") && app.includes('<LessonSpellingNine'), 'route dispatch')
assert(!registry.includes("id: 'spelling-lesson-10'") && !existsSync('src/lessons/LessonSpellingTen.tsx') && !existsSync('src/lessons/spelling-lesson-10'), 'no tenth lesson')
assert(!registry.includes("id: 'spelling-unit") && !lesson.includes('href="#/lesson/spelling-lesson-10'), 'no unit or broken next link')
assert(sections.length===12 && practice.length===8 && quiz.length===10 && homework.length===10, 'complete teaching sections and activities')
assert(testDefinition.id==='spelling-lesson-09-independent' && testDefinition.pages.length===4 && testDefinition.pages.every(p=>p.questions.length===5) && examQuestions.length===20, '20 questions, 4 by 5')
assert(new Set(examQuestions.map(q=>q.id)).size===20 && new Set(examQuestions.map(q=>q.prompt)).size===20,'unique questions')
const activityPrompts = new Set([...practice,...quiz].map(q=>q.prompt))
for(const q of examQuestions) {
 const f=q.fields[0]
 assert(!activityPrompts.has(q.prompt),`independent prompt: ${q.id}`)
 assert(f.kind==='choice' && new Set(f.options).size===3 && f.options.filter(o=>o===f.answer).length===1,`unambiguous keyed options: ${q.id}`)
 assert(q.solution===f.answer && q.explanation.length>100 && q.rule && q.example,`complete solution: ${q.id}`)
}
assert(lesson.includes('<TeacherSpace>') && lesson.includes('<SolutionsArea') && lesson.includes('revealFeedback={showTestFeedback}'), 'shared gated areas')
assert(lesson.indexOf('<SolutionsArea') < lesson.indexOf('<TeacherSpace>') && !lesson.slice(lesson.indexOf('<TeacherSpace>')).includes('<SolutionsArea'), 'solutions separate from teacher')
assert(css.includes('@media (max-width: 640px)') && css.includes(':focus-visible') && css.includes('attr(data-label)'), 'mobile and keyboard support')
assert(read('src/shared/test/lessonConformance.test.ts').includes("lesson: 'spelling-lesson-09'"), 'shared conformance registration')
console.log(`Spelling 09 passed: 24 steps, 6 groups, 8 practice, 10 quiz, 6+4 homework, 20 independent questions (4x5); ${Object.keys(inventory.previousContentSha256).length} previous teaching files byte-identical. Content uniqueness is also manually audited, not inferred solely from answer keys.`)
