import { readFileSync } from 'node:fs'
const read = path => readFileSync(path,'utf8')
const lesson=read('src/lessons/LessonSpellingOne.tsx')
const data=read('src/lessons/spelling-lesson-01/content.ts')
const audit=read('docs/spelling-lesson-01-audit.md')
const registry=read('src/lessons/registry.ts')
const checks=[
 [registry.includes("id: 'spelling-lesson-01'") && registry.includes("sectionId: 'spelling'"),'section registration'],
 [Array.from({length:15},(_,i)=>i+1).every(n=>lesson.includes(`المحور ${['الأول','الثاني','الثالث','الرابع','الخامس','السادس','السابع','الثامن','التاسع','العاشر','الحادي عشر','الثاني عشر','الثالث عشر','الرابع عشر','الخامس عشر'][n-1]}`)),'fifteen axes'],
 [data.includes("questions:qs.slice(25,30)") && data.includes("questions:qs.slice(0,8)"),'thirty questions across five groups'],
 [lesson.includes('<TeacherSpace>') && lesson.includes('mode="teacher"') && lesson.includes('<SolutionsArea test={testDefinition} engine={engine}'),'shared teacher and student solutions'],
 [lesson.includes('توضيح تعليمي من المنصة') && audit.includes('«هذا»') && audit.includes('«كتبوا»'),'corrections and source distinction'],
 [!lesson.includes('somer173') && !data.includes('somer173'),'single shared teacher password'],
]
for(const [ok,name] of checks) if(!ok) throw Error(`Spelling lesson audit: ${name} missing`)
console.log('Spelling lesson structure and content inventory passed.')
