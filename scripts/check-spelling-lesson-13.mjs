import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import {
  sections,
  objectives,
  waslExamples,
  faslExamples,
  mimmanNote,
  maRules,
  memoryTable,
  maContrast,
  inshallahAnalysis,
  commonStructures,
  methodSteps,
  commonErrors,
  summaryRules,
  selfCheck,
  homeworkCorrection,
  homeworkCorrectionModel,
  homeworkParagraphRequirements,
  homeworkParagraphModel,
  homeworkGradingGuide,
  practice,
  examQuestions,
  testDefinition,
} from '../src/lessons/spelling-lesson-13/content.ts'

const read = (path) => readFileSync(path, 'utf8')
const inventory = JSON.parse(read('docs/spelling-lesson-13-source-inventory.json'))
const hash = (path) => createHash('sha256').update(readFileSync(path)).digest('hex')
const lesson = read('src/lessons/LessonSpellingThirteen.tsx')
const registry = read('src/lessons/registry.ts')
const app = read('src/app/App.tsx')
const css = read('src/lessons/spelling-lesson-13/lesson.css')
const assert = (ok, label) => {
  if (!ok) throw Error(`Spelling 13: ${label}`)
}

// ١. أمانة المصدر وسلامة الدروس السابقة.
assert(hash('docs/source/spelling-lesson-13.md') === inventory.sourceSha256, 'source digest')
assert(Object.keys(inventory.previousContentSha256).length >= 40, 'previous teaching files recorded')
for (const [path, sha] of Object.entries(inventory.previousContentSha256)) {
  assert(hash(path) === sha, `previous lesson intact: ${path}`)
}
for (const item of inventory.coverage) {
  for (const term of item.terms) {
    assert(read('src/lessons/spelling-lesson-13/content.ts').includes(term), `coverage: ${term}`)
  }
}

// ٢. التسجيل والتنقل: بعد الدرس الثاني عشر، بلا درس رابع عشر وبلا اختبار وحدة، ومستقل عن درسي الرقم ١٣ الآخرين.
assert(
  registry.indexOf("id: 'spelling-lesson-13'") > registry.indexOf("id: 'spelling-lesson-12'") &&
    registry.indexOf("id: 'spelling-lesson-13'") < registry.indexOf("id: 'morphology-lesson-01'"),
  'ordered registration after spelling-lesson-12',
)
assert(
  /id: 'spelling-lesson-13', sectionId: 'spelling', number: '١٣'/.test(registry) &&
    app.includes("lesson.id === 'spelling-lesson-13'") &&
    app.includes('<LessonSpellingThirteen'),
  'App route dispatch and Arabic-Indic lesson number',
)
assert(
  !registry.includes("id: 'spelling-lesson-14'") &&
    !existsSync('src/lessons/LessonSpellingFourteen.tsx') &&
    !existsSync('src/lessons/spelling-lesson-14'),
  'no fourteenth spelling lesson',
)
assert(!registry.includes("id: 'spelling-unit'") && !lesson.includes('href="#/lesson/spelling-lesson-14'), 'no unit test or broken next link')
const spellingIds = [...registry.matchAll(/id: '(spelling-lesson-\d+)'/g)].map((match) => match[1])
assert(
  JSON.stringify(spellingIds) ===
    JSON.stringify(Array.from({ length: 13 }, (_, index) => `spelling-lesson-${String(index + 1).padStart(2, '0')}`)),
  'exactly thirteen spelling lessons in order',
)
assert(
  (registry.match(/id: 'lesson-13'/g) ?? []).length === 1 &&
    (registry.match(/id: 'morphology-lesson-13'/g) ?? []).length === 1 &&
    (registry.match(/id: 'spelling-lesson-13'/g) ?? []).length === 1,
  'the three section-local lesson 13s stay distinct and unique',
)

// ٣. المحتوى التعليمي: الأقسام والجداول والواجب.
assert(sections.length === 14, 'fourteen teaching sections')
assert(objectives.length === 5, 'five objectives')
assert(
  waslExamples.map((item) => item.form).join(',') === 'عمَّ,ممَّ,بِمَ,كلّما' &&
    faslExamples.map((item) => item.form).join(',') === 'إن شاء الله,لا سيّما,كلّ ما',
  'reviewed wasl/fasl classification (kullama under wasl)',
)
assert(mimmanNote.includes('من + مَن') && mimmanNote.includes('من + ما'), 'mimman distinguished from mimma')
assert(maRules.length === 5 && memoryTable.length === 5, 'five interrogative-ma rules and five memory rows')
assert(maRules.map((rule) => rule.form).join(',') === 'بِمَ,لِمَ,فيمَ,عمَّ,ممَّ', 'the five ma forms in source order')
assert(maContrast.length === 3, 'three interrogative/relative contrasts')
assert(inshallahAnalysis.map((item) => item.word).join(',') === 'إنْ,شاء,الله', 'three-word inshallah analysis')
assert(commonStructures.length === 9, 'nine common structures')
assert(methodSteps.length === 4, 'four discovery steps')
assert(commonErrors.length === 6, 'six common errors')
assert(
  commonErrors[5].correct === 'بِمَ استعنت؟' && commonErrors[5].reason.includes('ليست خطأ'),
  'bimadha reframed: a valid form, not an error',
)
assert(summaryRules.length === 5 && selfCheck.length === 3, 'five summary rules and three self-check pairs')
assert(homeworkCorrection.length === 5 && homeworkCorrectionModel.length === 5, 'homework corrections with models')
assert(homeworkParagraphRequirements.length === 5 && homeworkParagraphModel.length === 6, 'six-line paragraph with five requirements')
assert(
  ['إن شاء الله', 'لا سيّما', 'فيمَ', 'كلّما', 'كلّ ما'].every((term) => homeworkParagraphModel.join(' ').includes(term)),
  'homework model paragraph meets the five requirements',
)
assert(homeworkCorrectionModel.every((item) => item.corrected && item.reason.length > 40), 'homework models with reasons')
assert(homeworkGradingGuide.length >= 3, 'homework grading guidance')

// ٤. التدريب التفاعلي: خمسة أسئلة بإجابة واحدة واضحة وخيارات بلا تكرار.
assert(practice.length === 5, 'exactly five practice questions')
assert(practice.map((item) => item.answer).join('|') === 'إن شاء الله|لا سيّما|لِمَ|كلّما اجتهدتَ، نجحتَ.|كلّ ما', 'practice keys in source order')
for (const item of practice) {
  assert(item.options.filter((option) => option === item.answer).length === 1, `single key: ${item.id}`)
  assert(new Set(item.options).size === item.options.length, `no duplicate options: ${item.id}`)
  assert(item.explanation.length > 80 && item.rule && item.example, `full feedback: ${item.id}`)
}

// ٥. الاختبار المستقل: عشرون سؤالًا في أربع صفحات (٥ + ٥ + ٥ + ٥) بعشرين درجة.
assert(
  testDefinition.id === 'spelling-lesson-13-independent' &&
    testDefinition.pages.length === 4 &&
    testDefinition.pages.map((page) => page.questions.length).join(',') === '5,5,5,5' &&
    examQuestions.length === 20,
  '20 independent questions, 4 pages (5+5+5+5)',
)
const totalMarks = examQuestions.reduce((sum, question) => sum + (question.points ?? 1), 0)
assert(totalMarks === 20, 'twenty marks in total (one per question)')
assert(
  examQuestions.map((question) => question.number).join(',') ===
    Array.from({ length: 20 }, (_, index) => index + 1).join(','),
  'question numbers 1..20 in order',
)
const kinds = testDefinition.pages.map((page) => page.questions.map((q) => q.fields.map((f) => f.kind).join('+')).join(','))
assert(
  kinds[0] === 'choice,choice,choice,choice,choice' &&
    kinds[1] === 'choice,choice,choice,choice,choice' &&
    kinds[2] === 'text,text,text+text,text,text' &&
    kinds[3] === 'essay,essay,essay,essay,essay',
  'distribution: 5 choices + 5 corrections + 5 completions (one with two fields) + 5 essays',
)
const types = examQuestions.map((q) => q.type)
assert(
  types.slice(0, 5).every((t) => t === 'اختيار من متعدد') &&
    types.slice(5, 10).every((t) => t === 'تصحيح خطأ') &&
    types.slice(10, 15).every((t) => t === 'إكمال فراغ') &&
    types.slice(15, 20).every((t) => t === 'تطبيق وإنشاء'),
  'question type labels match the mandated distribution',
)
assert(
  new Set(examQuestions.map((question) => question.id)).size === 20 &&
    new Set(examQuestions.map((question) => question.prompt)).size === 20,
  'unique independent questions',
)
for (const question of examQuestions) {
  for (const field of question.fields) {
    assert(
      field.kind === 'choice'
        ? new Set(field.options).size === 3 && field.options.filter((option) => option === field.answer).length === 1
        : field.kind === 'text'
          ? field.accept.length > 0
          : field.kind === 'essay' && field.label.trim().length > 0,
      `well-formed field: ${question.id}`,
    )
  }
  assert(question.solution && question.solution.trim().length > 0, `displayable solution: ${question.id}`)
  assert(question.explanation.length > 60 && question.rule, `complete solution: ${question.id}`)
  assert(Boolean(question.teacherAnswer && question.teacherAnswer.length > 40), `teacher key with reason: ${question.id}`)
}
assert(
  examQuestions.slice(15, 20).every((question) => question.revealEssaySolution === true),
  'essay models revealed after submission (lesson-12 precedent)',
)
// تغطية المحاور في الاختبار المستقل.
const examText = examQuestions.map((q) => `${q.prompt} ${q.sentence ?? ''} ${q.explanation} ${q.rule}`).join(' ')
for (const term of ['إن شاء الله', 'لا سيّما', 'استفهامية', 'عمَّ', 'فيمَ', 'كلّما', 'كلّ ما', 'التكرار']) {
  assert(examText.includes(term), `exam coverage: ${term}`)
}

// ٦. الفصل المعماري: منطقة الطالب، ومنطقة الاختبار، والحلول، ومنطقة المعلم.
assert(
  lesson.includes('<TeacherSpace>') &&
    lesson.includes('<SolutionsArea') &&
    lesson.includes('revealFeedback={showTestFeedback}') &&
    lesson.includes('data-testid="spell13-teacher-keys"'),
  'shared gated areas and teacher keys',
)
assert(
  lesson.indexOf('<SolutionsArea') < lesson.indexOf('<TeacherSpace>') &&
    !lesson.slice(lesson.indexOf('<TeacherSpace>')).includes('<SolutionsArea'),
  'solutions area separate from teacher space',
)
assert(
  lesson.includes('disabled={!baseEngine.allPagesChecked}') &&
    lesson.includes('questionTestIdPrefix="spell13-question"'),
  'submission gating for the independent test',
)
assert(
  !lesson.includes('disabled={submitted}') &&
    !lesson.includes('function TestArea') &&
    !lesson.includes('function OfficialTest'),
  'no legacy whole-test pattern',
)
assert(lesson.includes('useTestEngine(practiceTest)'), 'practice on the shared engine')
assert(!lesson.includes('COURSE_TEACHER_PASSWORD =') && !lesson.includes('somer173'), 'no hardcoded teacher password')

// ٧. الوصول والاستجابة.
assert(
  css.includes('@media (max-width: 640px)') &&
    css.includes('@media (max-width: 420px)') &&
    css.includes('@media (prefers-reduced-motion: reduce)') &&
    css.includes(':focus-visible') &&
    css.includes('attr(data-label)') &&
    css.includes('min-block-size: 44px'),
  'mobile, focus and motion rules',
)
assert(!/text-align:\s*(left|right)/.test(css), 'no physical direction in lesson styles')
assert(!css.includes('spell11-') && !css.includes('tanween-lab') && !css.includes('.ol-'), 'independent visual identity')

// ٨. تسجيل الدرس في فحص التطابق المشترك.
assert(
  read('src/shared/test/lessonConformance.test.ts').includes("lesson: 'spelling-lesson-13'"),
  'shared conformance registration',
)
assert(read('package.json').includes('check:spelling-lesson-13'), 'registered validation script')

console.log(
  `Spelling 13 passed: Wasl/Fasl lesson with reviewed keys (ت-١..ت-٧), 14 teaching sections, 5 practice questions, ` +
    `20 independent questions (5 choices + 5 corrections + 5 completions + 5 essays) worth 20 marks; ` +
    `${Object.keys(inventory.previousContentSha256).length} previous teaching files byte-identical. ` +
    'No unit test and no fourteenth lesson.',
)
