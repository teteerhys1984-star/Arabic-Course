import { readFileSync } from 'node:fs'

const lessonPaths = ['LessonOne.tsx', 'LessonTwo.tsx', 'LessonThree.tsx', 'LessonSix.tsx'].map((name) => `src/lessons/${name}`)
const sources = Object.fromEntries(lessonPaths.map((path) => [path, readFileSync(path, 'utf8')]))
const failures = []

function requirePhrase(path, phrase) {
  if (!sources[path].includes(phrase)) failures.push(`${path}: missing complete parsing phrase: ${phrase}`)
}

// Every official question that explicitly asks for الإعراب must have an answer with
// a role, case, marker, and visible-ending description. This deliberately does not
// inspect ordinary extraction/classification questions.
for (const path of lessonPaths) {
  const source = sources[path]
  const parsingQuestions = [...source.matchAll(/prompt:\s*'([^']*أعرب[^']*)'[\s\S]*?answer:\s*'([^']*)'/g)]
  for (const [, prompt, answer] of parsingQuestions) {
    if (!/(مبتدأ|خبر|فاعل|مفعول به)/.test(answer)) failures.push(`${path}: parsing answer has no grammatical role: ${prompt}`)
    if (!/(مرفوع|منصوب|مجرور|مبني)/.test(answer)) failures.push(`${path}: parsing answer has no state or البناء: ${answer}`)
    if (!/(علامة|على آخره)/.test(answer)) failures.push(`${path}: parsing answer has no علامة/ending description: ${answer}`)
  }
}

// These are the course's explicitly solved parsing presentations. Role-only labels in
// these blocks are the regression this check is intended to catch. Other lesson text
// may legitimately identify a role without pretending to be full إعراب.
const workedExamples = sources['src/lessons/LessonThree.tsx'].slice(
  sources['src/lessons/LessonThree.tsx'].indexOf('function WorkedExamples()'),
  sources['src/lessons/LessonThree.tsx'].indexOf('function ActivityOne('),
)
const abbreviated = /(?:^|[>\n])\s*(?:<strong>)?[^<\n:]+(?:<\/strong>)?:\s*(?:فعل(?: ماضٍ)?|فاعل|مفعول به|مبتدأ|خبر)\.?\s*(?:<\/strong>)?(?:<|$)/m
if (abbreviated.test(workedExamples)) {
  failures.push('LessonThree WorkedExamples contains an abbreviated parsing label.')
}

const lessonTwoRaised = sources['src/lessons/LessonTwo.tsx'].slice(
  sources['src/lessons/LessonTwo.tsx'].indexOf("id: 'raised'"),
  sources['src/lessons/LessonTwo.tsx'].indexOf("id: 'names'"),
)
if (/الطالبُ:\s*مبتدأ مرفوع، وعلامة رفعه الضمة\./.test(lessonTwoRaised) || /مجتهدٌ:\s*خبر مرفوع، وعلامة رفعه الضمة\./.test(lessonTwoRaised)) {
  failures.push('LessonTwo raised-parsing example omits the visible ending description.')
}

requirePhrase('src/lessons/LessonTwo.tsx', 'الطالبُ: مبتدأ مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.')
requirePhrase('src/lessons/LessonTwo.tsx', 'مجتهدٌ: خبر مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.')
requirePhrase('src/lessons/LessonThree.tsx', 'كتبَ: فعل ماضٍ مبني على الفتحة الظاهرة على آخره.')
requirePhrase('src/lessons/LessonThree.tsx', 'الطالبُ: فاعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره.')
requirePhrase('src/lessons/LessonThree.tsx', 'الدرسَ: مفعول به منصوب وعلامة نصبه الفتحة الظاهرة على آخره.')
requirePhrase('src/lessons/LessonSix.tsx', 'الطالبُ: فاعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره.')
requirePhrase('src/lessons/LessonSix.tsx', 'الواجبَ: مفعول به منصوب وعلامة نصبه الفتحة الظاهرة على آخره.')
requirePhrase('src/lessons/LessonSix.tsx', 'المدرسةِ: اسم مجرور بإلى وعلامة جره الكسرة الظاهرة على آخره.')
requirePhrase('src/lessons/LessonSix.tsx', 'يذهبْ: فعل مضارع مجزوم بـ(لم)، وعلامة جزمه السكون.')

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log('Parsing audit passed: explicit parsing questions and solved parsing blocks use complete, context-appropriate forms.')
