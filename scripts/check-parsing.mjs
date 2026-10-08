import { readFileSync } from 'node:fs'

const lessonPaths = ['LessonOne.tsx', 'LessonTwo.tsx', 'LessonThree.tsx', 'LessonSix.tsx', 'LessonSeven.tsx', 'LessonEight.tsx', 'LessonNine.tsx', 'LessonTen.tsx', 'lesson-ten/content.ts'].map((name) => `src/lessons/${name}`)
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
    if (!/(مبتدأ|خبر|فاعل|مفعول به|اسم مجرور)/.test(answer)) failures.push(`${path}: parsing answer has no grammatical role: ${prompt}`)
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
requirePhrase('src/lessons/LessonSeven.tsx', 'الطالبانِ: فاعل مرفوع وعلامة رفعه الألف؛ لأنه مثنى.')
requirePhrase('src/lessons/LessonSeven.tsx', 'الطالبينِ: مفعول به منصوب وعلامة نصبه الياء؛ لأنه مثنى.')
requirePhrase('src/lessons/LessonSeven.tsx', 'الطالبينِ: اسم مجرور بـ(على)، وعلامة جره الياء؛ لأنه مثنى.')
requirePhrase('src/lessons/LessonSeven.tsx', 'المعلمونَ: فاعل مرفوع وعلامة رفعه الواو؛ لأنه جمع مذكر سالم.')
requirePhrase('src/lessons/LessonSeven.tsx', 'المعلمينَ: مفعول به منصوب وعلامة نصبه الياء؛ لأنه جمع مذكر سالم.')
requirePhrase('src/lessons/LessonSeven.tsx', 'الطالباتُ: فاعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره؛ لأنه جمع مؤنث سالم.')
requirePhrase('src/lessons/LessonSeven.tsx', 'الطالباتِ: مفعول به منصوب وعلامة نصبه الكسرة نيابةً عن الفتحة؛ لأنه جمع مؤنث سالم.')
requirePhrase('src/lessons/LessonSeven.tsx', 'الطالباتِ: اسم مجرور بـ"على"، وعلامة جره الكسرة الظاهرة على آخره.')
requirePhrase('src/lessons/LessonEight.tsx', 'أبو: فاعل مرفوع، وعلامة رفعه الواو نيابة عن الضمة؛ لأنه من الأسماء الخمسة، وهو مضاف.')
requirePhrase('src/lessons/LessonEight.tsx', 'أبا: مفعول به منصوب، وعلامة نصبه الألف نيابة عن الفتحة؛ لأنه من الأسماء الخمسة، وهو مضاف.')
requirePhrase('src/lessons/LessonEight.tsx', 'أبي: اسم مجرور بـ"على"، وعلامة جره الياء نيابة عن الكسرة؛ لأنه من الأسماء الخمسة، وهو مضاف.')
requirePhrase('src/lessons/LessonEight.tsx', 'أخو: فاعل مرفوع، وعلامة رفعه الواو نيابة عن الضمة؛ لأنه من الأسماء الخمسة، وهو مضاف.')
requirePhrase('src/lessons/LessonEight.tsx', 'أخا: مفعول به منصوب، وعلامة نصبه الألف نيابة عن الفتحة؛ لأنه من الأسماء الخمسة، وهو مضاف.')
requirePhrase('src/lessons/LessonEight.tsx', 'أخي: اسم مجرور بـ"مع"، وعلامة جره الياء نيابة عن الكسرة؛ لأنه من الأسماء الخمسة، وهو مضاف.')
requirePhrase('src/lessons/LessonEight.tsx', 'ذو: نعت مرفوع، وعلامة رفعه الواو نيابة عن الضمة؛ لأنه من الأسماء الخمسة، وهو مضاف.')
requirePhrase('src/lessons/LessonEight.tsx', 'ذا: نعت منصوب، وعلامة نصبه الألف نيابة عن الفتحة؛ لأنه من الأسماء الخمسة، وهو مضاف.')
requirePhrase('src/lessons/LessonEight.tsx', 'ذي: نعت مجرور، وعلامة جره الياء نيابة عن الكسرة؛ لأنه من الأسماء الخمسة، وهو مضاف.')
requirePhrase('src/lessons/LessonEight.tsx', 'أبي: فاعل مرفوع، وعلامة رفعه ضمة مقدرة.')
requirePhrase('src/lessons/LessonNine.tsx', 'الطالبُ: اسم كان مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.')
requirePhrase('src/lessons/LessonNine.tsx', 'مجتهدًا: خبر كان منصوب، وعلامة نصبه الفتحة الظاهرة على آخره.')
requirePhrase('src/lessons/LessonNine.tsx', 'الجوُّ: مبتدأ مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.')
requirePhrase('src/lessons/LessonNine.tsx', 'جميلٌ: خبر مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.')
requirePhrase('src/lessons/LessonNine.tsx', 'الطالبانِ: اسم كان مرفوع، وعلامة رفعه الألف لأنه مثنى.')
requirePhrase('src/lessons/LessonNine.tsx', 'مجتهدَينِ: خبر كان منصوب، وعلامة نصبه الياء لأنه مثنى.')
requirePhrase('src/lessons/LessonNine.tsx', 'المعلمونَ: اسم كان مرفوع، وعلامة رفعه الواو لأنه جمع مذكر سالم.')
requirePhrase('src/lessons/LessonNine.tsx', 'حاضرينَ: خبر كان منصوب، وعلامة نصبه الياء لأنه جمع مذكر سالم.')
requirePhrase('src/lessons/LessonNine.tsx', 'الطالباتُ: اسم كان مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.')
requirePhrase('src/lessons/LessonNine.tsx', 'مجتهداتٍ: خبر كان منصوب، وعلامة نصبه الكسرة نيابة عن الفتحة لأنه جمع مؤنث سالم.')

// Lesson 10 (إنَّ وأخواتها): every displayed parsing names the role, the state, the sign and
// its reason. The phrases below are the canonical forms used in the lesson's content.
requirePhrase('src/lessons/lesson-ten/content.ts', 'إنَّ: حرف توكيد ونصب مبني على الفتح لا محل له من الإعراب.')
requirePhrase('src/lessons/lesson-ten/content.ts', 'العلمَ: اسم إنَّ منصوب، وعلامة نصبه الفتحة الظاهرة على آخره.')
requirePhrase('src/lessons/lesson-ten/content.ts', 'نافعٌ: خبر إنَّ مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.')
requirePhrase('src/lessons/lesson-ten/content.ts', 'الطالبينِ: اسم إنَّ منصوب، وعلامة نصبه الياء لأنه مثنى.')
requirePhrase('src/lessons/lesson-ten/content.ts', 'مجتهدانِ: خبر إنَّ مرفوع، وعلامة رفعه الألف لأنه مثنى.')
requirePhrase('src/lessons/lesson-ten/content.ts', 'المعلمينَ: اسم إنَّ منصوب، وعلامة نصبه الياء لأنه جمع مذكر سالم.')
requirePhrase('src/lessons/lesson-ten/content.ts', 'حاضرونَ: خبر إنَّ مرفوع، وعلامة رفعه الواو لأنه جمع مذكر سالم.')
requirePhrase('src/lessons/lesson-ten/content.ts', 'الطالباتِ: اسم إنَّ منصوب، وعلامة نصبه الكسرة نيابة عن الفتحة لأنه جمع مؤنث سالم.')
requirePhrase('src/lessons/lesson-ten/content.ts', 'مجتهداتٌ: خبر إنَّ مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.')
requirePhrase('src/lessons/lesson-ten/content.ts', 'أباكَ: اسم إنَّ منصوب، وعلامة نصبه الألف نيابة عن الفتحة؛ لأنه من الأسماء الخمسة، وهو مضاف.')
requirePhrase('src/lessons/lesson-ten/content.ts', 'كريمٌ: خبر إنَّ مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.')
requirePhrase('src/lessons/lesson-ten/content.ts', 'ليتَ: حرف تمنٍّ ونصب مبني على الفتح لا محل له من الإعراب.')
requirePhrase('src/lessons/lesson-ten/content.ts', 'لعلَّ: حرف ترجٍّ ونصب مبني على الفتح لا محل له من الإعراب.')
requirePhrase('src/lessons/lesson-ten/content.ts', 'كأنَّ: حرف تشبيه ونصب مبني على الفتح لا محل له من الإعراب.')
requirePhrase('src/lessons/lesson-ten/content.ts', 'لكنَّ: حرف استدراك ونصب مبني على الفتح لا محل له من الإعراب.')
requirePhrase('src/lessons/lesson-ten/content.ts', 'النجاحَ: اسم ليتَ منصوب، وعلامة نصبه الفتحة الظاهرة على آخره.')
requirePhrase('src/lessons/lesson-ten/content.ts', 'قريبٌ: خبر ليتَ مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.')

requirePhrase('src/lessons/LessonNine.tsx', 'أبوك: اسم كان مرفوع، وعلامة رفعه الواو نيابة عن الضمة؛ لأنه من الأسماء الخمسة، وهو مضاف.')
requirePhrase('src/lessons/LessonNine.tsx', 'كريمًا: خبر كان منصوب، وعلامة نصبه الفتحة الظاهرة على آخره.')
requirePhrase('src/lessons/LessonNine.tsx', 'كانَ: فعل ماضٍ ناسخ مبني على الفتحة الظاهرة على آخره.')

// Lesson 9 must never display an abbreviated parsing: the sign always carries its
// description or its reason, except inside the warning that forbids the abbreviation.
const lessonNine = sources['src/lessons/LessonNine.tsx']
const shorthand = /(مرفوع|منصوب|مجرور) بال(ضمة|فتحة|كسرة|ألف|ياء|واو)(?!\s*(الظاهرة|نيابة|مقدرة|ظاهرة))/g
lessonNine.split('\n').forEach((line, index) => {
  if (line.includes('لا يُقبل')) return
  shorthand.lastIndex = 0
  const match = shorthand.exec(line)
  if (match && !/(لأنه|لأنها|نيابة|الظاهرة|على آخره|على آخرها)/.test(line.slice(match.index))) {
    failures.push(`src/lessons/LessonNine.tsx line ${index + 1}: abbreviated parsing "${match[0]}".`)
  }
})

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log('Parsing audit passed: explicit parsing questions and solved parsing blocks use complete, context-appropriate forms.')
