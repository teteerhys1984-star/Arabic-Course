import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(path, 'utf8')
const lesson = read('src/lessons/LessonSpellingThree.tsx')
const data = read('src/lessons/spelling-lesson-03/content.ts')
const audit = read('docs/spelling-lesson-03-audit.md')
const registry = read('src/lessons/registry.ts')

const checks = [
  [
    registry.includes("id: 'spelling-lesson-03'") && registry.includes("sectionId: 'spelling'"),
    'section registration in spelling track',
  ],
  [
    Array.from({ length: 16 }, (_, i) => i + 1).every((n) =>
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
            'السادس عشر',
          ][n - 1]
        }`,
      ),
    ),
    'sixteen structured lesson axes',
  ],
  [
    data.includes('testQuestions.slice(0, 4)') &&
      data.includes('testQuestions.slice(4, 12)') &&
      data.includes('testQuestions.slice(12, 16)') &&
      data.includes('testQuestions.slice(16, 26)'),
    'twenty-six official questions across four pages (total 30 marks)',
  ],
  [
    lesson.includes('<TeacherSpace>') &&
      lesson.includes('mode="teacher"') &&
      lesson.includes('<SolutionsArea test={testDefinition} engine={engine}'),
    'shared teacher and student solutions integration',
  ],
  [
    // خ-1: يجرؤ (متطرفة) removed from middle-hamza examples.
    !data.includes('يجرؤ') &&
      !lesson.includes('يجرؤ') &&
      // خ-2: مبادئ (متطرفة) replaced by قارئون/مبتدئون.
      !data.includes('مبادئ') &&
      data.includes('قارِئُون') &&
      data.includes('مُبتدِئُون') &&
      // م-1: new damma-after-damma clause.
      data.includes('رُؤُوس') &&
      data.includes('شُؤُون') &&
      // م-4: مئين replaced by رئيس.
      !data.includes('مئين') &&
      !data.includes('مِئِين') &&
      data.includes('رَئِيس') &&
      data.includes('مِئَة') &&
      // خ-3: قراءة error row tests a real seat difference.
      data.includes('قرأة') &&
      // خ-5/خ-6: real majhool correction + conditional instruction.
      data.includes('سُؤِلَ') &&
      data.includes('الكلمة صحيحة') &&
      // أ-2/أ-3: ضبط مؤمنون + تعليل سأل.
      data.includes('مُؤْمِنُونَ') &&
      data.includes('الحركتان متساويتان') &&
      // Platform additions are explicitly tagged.
      lesson.includes('توضيح تعليمي من المنصة'),
    'approved audit corrections applied in content (خ-1..خ-7, م-1, م-4, أ-2, أ-3)',
  ],
  [
    audit.includes('خ-1') &&
      audit.includes('خ-7') &&
      audit.includes('م-1') &&
      audit.includes('م-4') &&
      audit.includes('يَجْرُؤُ') &&
      audit.includes('مِئِين') &&
      audit.includes('رَئِيس') &&
      audit.includes('سُؤِلَ') &&
      audit.includes('٣٠'),
    'audit record documents every approved correction and the 30-mark distribution',
  ],
  [
    !lesson.includes('somer173') && !data.includes('somer173'),
    'single shared teacher password without hardcoding in lesson file',
  ],
]

for (const [ok, name] of checks) {
  if (!ok) throw Error(`Spelling lesson 3 audit: ${name} missing`)
}

console.log('Spelling lesson 3 structure and content inventory passed.')
