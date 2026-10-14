import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
const read = path => readFileSync(path, 'utf8')
const source = read('docs/source/spelling-lesson-07.md')
const audit = read('docs/spelling-lesson-07-audit.md')
const lesson = read('src/lessons/LessonSpellingSeven.tsx')
const data = read('src/lessons/spelling-lesson-07/content.ts')
const registry = read('src/lessons/registry.ts')
const css = read('src/lessons/spelling-lesson-07/lesson.css')
const hash = createHash('sha256').update(source).digest('hex')
const checks = [
 [audit.includes(hash), 'source hash'],
 [[...data.matchAll(/"id": "spell7-exam-\d{2}"/g)].length === 20, 'twenty keyed questions'],
 [registry.indexOf("id: 'spelling-lesson-07'") > registry.indexOf("id: 'spelling-lesson-06'"), 'ordered registration'],
 [registry.indexOf("id: 'spelling-lesson-08'") > registry.indexOf("id: 'spelling-lesson-07'"), 'eighth spelling lesson ordered after seventh'],
 [lesson.includes('<TeacherSpace>') && lesson.includes('<SolutionsArea') && lesson.includes('revealFeedback={show}'), 'existing gated areas'],
 [css.includes('@media (max-width: 480px)') && css.includes(':focus-visible') && css.includes('min-width: 0'), 'mobile and keyboard rules'],
 [source.includes('مَرُوءَة') && lesson.includes('مُرُوءَة') && data.includes('مُؤَثِّرة'), 'documented corrections'],
]
for(const [ok, name] of checks) if(!ok) throw Error(`Spelling 07: ${name}`)
console.log('Spelling lesson 07 source, scope, assessment and accessibility checks passed.')
