import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(path, 'utf8')
const lesson = read('src/lessons/LessonSpellingTwo.tsx')
const data = read('src/lessons/spelling-lesson-02/content.ts')
const audit = read('docs/spelling-lesson-02-audit.md')
const registry = read('src/lessons/registry.ts')

const checks = [
  [
    registry.includes("id: 'spelling-lesson-02'") && registry.includes("sectionId: 'spelling'"),
    'section registration in spelling track',
  ],
  [
    Array.from({ length: 15 }, (_, i) => i + 1).every((n) =>
      lesson.includes(
        `المحور ${
          [
            'الأول',
            'الثاني',
            'الثالث',
            'الرابع',
            'الخامس',
            'السادس',
            'السابع',
            'الثامن',
            'التاسع',
            'العاشر',
            'الحادي عشر',
            'الثاني عشر',
            'الثالث عشر',
            'الرابع عشر',
            'الخامس عشر',
          ][n - 1]
        }`,
      ),
    ),
    'fifteen structured lesson axes',
  ],
  [
    data.includes('testQuestions.slice(20, 25)') && data.includes('testQuestions.slice(0, 10)'),
    'twenty-five official questions across four pages (total 30 marks)',
  ],
  [
    lesson.includes('<TeacherSpace>') &&
      lesson.includes('mode="teacher"') &&
      lesson.includes('<SolutionsArea test={testDefinition} engine={engine}'),
    'shared teacher and student solutions integration',
  ],
  [
    lesson.includes('توضيح تعليمي من المنصة') &&
      audit.includes('«قرأ»') &&
      audit.includes('«تعلّم»') &&
      audit.includes('«استعمل»') &&
      audit.includes('«استيقظ»') &&
      audit.includes('«استخدام»'),
    'corrections and platform educational notes audit fidelity',
  ],
  [
    !lesson.includes('somer173') && !data.includes('somer173'),
    'single shared teacher password without hardcoding in lesson file',
  ],
]

for (const [ok, name] of checks) {
  if (!ok) throw Error(`Spelling lesson 2 audit: ${name} missing`)
}

console.log('Spelling lesson 2 structure and content inventory passed.')
