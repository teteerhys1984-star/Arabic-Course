/**
 * تدقيق المصدر لدرس الصرف الأول (morphology-lesson-01).
 *
 * يقرأ المرجع النصي المعتمد docs/source/morphology-lesson-01.md ويقارنه ببيانات التنفيذ
 * الفعلية (المصفوفات نفسها، لا مجرد البحث عن كلمات):
 *  - الأهداف الاثنا عشر وجملة المقدمة؛
 *  - الأمثلة المحلولة الثمانية (الكلمة والجذر)؛
 *  - الكلمات الخمس عشرة للنشاط التطبيقي؛
 *  - العائلات الصرفية التي يعرضها المختبر (ك ت ب، ع ل م، غ ف ر)؛
 *  - الخريطة الذهنية (ثماني عقد بالترتيب)، والقواعد الذهبية، وأدوات المعرفة؛
 *  - الأسئلة الخمسة والأربعون بترقيمها وترتيبها ونصها وخياراتها ومجموعاتها؛
 *  - الأجوبة المعتمدة من منطقة المعلم للأسئلة 1–40؛
 *  - أخطاء المعلم الخمسة، والمراجعة، والعلاجي، والتحدي؛
 *  - التسجيل في قسم الصرف، وعدد دروس كل قسم، وعدم وجود الدرس الثاني، وكلمة مرور المعلم.
 *
 * يُشغَّل بالأمر: npm run check:morphology-source
 */
import { existsSync, readFileSync } from 'node:fs'

const failures = []
const fail = (msg) => failures.push(msg)
const read = (path) => (existsSync(path) ? readFileSync(path, 'utf8') : (fail(`Missing file: ${path}`), ''))

// ---- normalisation: ignore bold markers, tatweel, diacritics and alef forms ----
const norm = (t) =>
  String(t ?? '')
    .replace(/\*\*/g, '')
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/\s+/g, ' ')
    .trim()
const tokens = (t) => norm(t).split(/[\s.،؛:؟!«»"()\-—–]+/).filter(Boolean)
const sameTokens = (a, b) => tokens(a).join(' ') === tokens(b).join(' ')
const eq = (label, a, b) => {
  if (norm(a) !== norm(b)) fail(`${label}: expected «${norm(b)}» but found «${norm(a)}»`)
}

// ---- source reference ----
const srcPath = 'docs/source/morphology-lesson-01.md'
const src = read(srcPath)
const L = src.split('\n')
const find = (text, from = 0) => {
  const i = L.findIndex((line, idx) => idx >= from && line.trim() === text)
  if (i < 0) fail(`Source heading not found: «${text}»`)
  return i
}
const nextNonEmpty = (i) => {
  let j = i + 1
  while (j < L.length && L[j].trim() === '') j++
  return j
}
const listAfter = (from, pattern, stopAtBlankAfterItems = true) => {
  const items = []
  let started = false
  for (let i = from + 1; i < L.length; i++) {
    const line = L[i].trim()
    const m = line.match(pattern)
    if (m) {
      items.push(m[1] ?? m[0])
      started = true
    } else if (line === '') {
      if (started && stopAtBlankAfterItems) break
    } else if (started) {
      break
    }
  }
  return items
}

// ---- implementation data (loaded directly; content.ts has no imports) ----
const C = await import('../src/lessons/morphology-lesson-01/content.ts')
const registry = read('src/lessons/registry.ts')
const lesson = read('src/lessons/LessonMorphologyOne.tsx')
const content = read('src/lessons/morphology-lesson-01/content.ts')
const grading = read('src/lessons/morphology-lesson-01/grading.ts')

// ================================================================
// 1. Objectives: exactly the twelve source objectives, in order
// ================================================================
const iObj = find('أولًا: أهداف الدرس')
const iDef = find('1. ما علم الصرف؟')
const sourceObjectives = []
for (let i = iObj; i < iDef; i++) {
  const m = L[i].match(/^\d+\. (.+)$/)
  if (m) sourceObjectives.push(m[1].trim())
}
if (sourceObjectives.length !== 12) fail(`Source must contain 12 objectives (found ${sourceObjectives.length})`)
if (C.objectives.length !== 12) fail(`Implementation must contain 12 objectives (found ${C.objectives.length})`)
sourceObjectives.forEach((o, i) => eq(`Objective ${i + 1}`, C.objectives[i] ?? '', o))
const introSentence = 'بعد دراسة هذا الدرس دراسة متقنة، يُفترض أن يكون الطالب قادرًا على:'
if (!norm(read('src/lessons/LessonMorphologyOne.tsx')).includes(norm(introSentence))) {
  fail('The source introduction sentence before the objectives is missing from the lesson.')
}

// ================================================================
// 2. Worked examples (8): word and root
// ================================================================
const iSolved = find('أمثلة محلولة')
const iActivity = find('النشاط التطبيقي')
const solvedSource = []
for (let i = iSolved; i < iActivity; i++) {
  const m = L[i].match(/^\*\*الكلمة: (.+)\*\*$/)
  if (m) {
    const rootLine = L.slice(i, iActivity).find((l) => l.startsWith('الجذر:'))
    solvedSource.push({ word: m[1].trim(), root: rootLine.replace('الجذر:', '').trim() })
  }
}
if (solvedSource.length !== 8) fail(`Source must contain 8 worked examples (found ${solvedSource.length})`)
if (C.solvedExamples.length !== 8) fail(`Implementation must contain 8 worked examples (found ${C.solvedExamples.length})`)
solvedSource.forEach((ex, i) => {
  const impl = C.solvedExamples[i]
  if (!impl) return
  eq(`Worked example ${i + 1} word`, impl.word, ex.word)
  if (!sameTokens(impl.root, ex.root)) fail(`Worked example ${i + 1} root: expected «${ex.root}» but found «${impl.root}»`)
})

// ================================================================
// 3. Activity: the fifteen words, in order, each with the required fields
// ================================================================
const iRequest = find('لكل كلمة حاول تحديد:')
const activitySource = []
for (let i = iActivity; i < iRequest; i++) {
  const m = L[i].match(/^\d+\. (.+)$/)
  if (m) activitySource.push(m[1].trim())
}
if (activitySource.length !== 15) fail(`Source must contain 15 activity words (found ${activitySource.length})`)
if (C.activityWords.length !== 15) fail(`Implementation must contain 15 activity words (found ${C.activityWords.length})`)
activitySource.forEach((w, i) => eq(`Activity word ${i + 1}`, C.activityWords[i]?.word ?? '', w))
C.activityWords.forEach((w) => {
  if (!w.root || !Number.isInteger(w.rootCount) || !Array.isArray(w.extra) || typeof w.doubled !== 'boolean' ||
      typeof w.changed !== 'boolean' || typeof w.weight !== 'string' || typeof w.family !== 'string' || !w.explanation) {
    fail(`Activity word ${w.id} lacks a required analysis field`)
  }
  const rootLetters = Array.from(norm(w.root).replace(/\s+/g, '')).length
  if (w.rootCount !== (rootLetters === 4 ? 4 : 3) || (rootLetters !== 3 && rootLetters !== 4)) {
    fail(`Activity word ${w.id}: rootCount ${w.rootCount} does not match root «${w.root}»`)
  }
})

// ================================================================
// 4. Word families shown in the lab (source lists)
// ================================================================
const familyWords = (id) => (C.families.find((f) => f.id === id)?.members ?? []).map((m) => norm(m.word))
const iKtbList = find('ومن الكلمات المرتبطة به:') // §5
const ktbSource = listAfter(iKtbList, /^- (.+)$/)
const iElmList = L.findIndex((l) => l.trim() === 'منه:') // §11
const elmSource = listAfter(iElmList, /^- (.+)$/)
const iGhfr = find('المثال الثاني: «استغفار»') // §29
const ghfrSource = []
for (let i = iGhfr + 1; i < L.length && !L[i].startsWith('الجذر:'); i++) {
  if (L[i].trim() && L[i].trim() !== 'نبحث عن:') ghfrSource.push(L[i].trim())
}
const checkFamily = (label, sourceWords, id) => {
  const have = familyWords(id)
  sourceWords.forEach((w) => {
    if (!have.includes(norm(w))) fail(`Family ${label}: source word «${w}» is missing from the lab`)
  })
}
if (ktbSource.length !== 8) fail(`Source ك ت ب list must have 8 words (found ${ktbSource.length})`)
checkFamily('ك ت ب', ktbSource, 'ktb')
checkFamily('ع ل م', elmSource, 'elm')
checkFamily('غ ف ر', ghfrSource, 'ghfr')

// ================================================================
// 5. Mind map: eight nodes in the source order
// ================================================================
const iMap = find('احفظ العلاقة الآتية:')
const mapSource = []
for (let i = iMap + 1; i < L.length && !L[i].startsWith('وهذه الخريطة'); i++) {
  const t = norm(L[i])
  if (t && t !== '↓') mapSource.push(t)
}
const mapImpl = C.mindMapNodes.map((n) => norm(n.label))
if (mapSource.length !== 8) fail(`Source mind map must have 8 nodes (found ${mapSource.length})`)
if (mapImpl.join('|') !== mapSource.join('|')) {
  fail(`Mind map nodes differ from the source chain. Source: ${mapSource.join(' → ')} | Implementation: ${mapImpl.join(' → ')}`)
}

// ================================================================
// 6. Golden rules (§31, rules 1–9 as single sentences) and tools (titles)
// ================================================================
for (let r = 0; r < 9; r++) {
  const i = find(['القاعدة الأولى', 'القاعدة الثانية', 'القاعدة الثالثة', 'القاعدة الرابعة', 'القاعدة الخامسة',
    'القاعدة السادسة', 'القاعدة السابعة', 'القاعدة الثامنة', 'القاعدة التاسعة'][r])
  eq(`Golden rule ${r + 1}`, C.goldenRules[r] ?? '', L[nextNonEmpty(i)])
}
const iTools = find('بل نعتمد على مجموعة من الأدوات الصرفية، أهمها:')
const toolsSource = listAfter(iTools, /^\d+\. (.+)$/).map((t) => t.replace(/\.$/, ''))
if (toolsSource.length !== 6) fail(`Source must list 6 tools (found ${toolsSource.length})`)
toolsSource.forEach((t, i) => eq(`Tool ${i + 1}`, C.originalTools[i]?.title ?? '', t))

// ================================================================
// 7. Examination: 45 questions, source order, prompts, options, groups
// ================================================================
const iTest = find('اختبار نهاية الدرس')
const iTeacher = find('منطقة خاصة بالمعلم')
const srcQ = []
for (let i = iTest; i < iTeacher; i++) {
  const m = L[i].match(/^(\d+)\.\s*(.*)$/)
  if (!m) continue
  const q = { n: Number(m[1]), prompt: m[2].trim(), options: [], instruction: '' }
  if (q.prompt === '') q.prompt = L[nextNonEmpty(i)].trim()
  for (let k = i + 1; k < iTeacher; k++) {
    const opt = L[k].match(/^(أ|ب|ج|د)\. (.+)$/)
    if (opt) q.options.push(opt[2].trim())
    else if (/^\d+\.\s*/.test(L[k])) break
    else if (/^(أولًا|ثانيًا|ثالثًا|رابعًا|خامسًا|سادسًا):/.test(L[k])) break
  }
  if (q.n >= 36 && q.n <= 40) q.instruction = L[nextNonEmpty(i)]?.trim() ?? ''
  srcQ.push(q)
}
if (srcQ.length !== 45) fail(`Source must contain 45 numbered questions (found ${srcQ.length})`)
srcQ.forEach((q, idx) => { if (q.n !== idx + 1) fail(`Source question order broken at position ${idx + 1} (found ${q.n})`) })
if (C.testQuestions.length !== 45) fail(`Implementation must contain 45 questions (found ${C.testQuestions.length})`)
const groupOf = (n) => (n <= 10 ? 'اختيار من متعدد' : n <= 20 ? 'صح أو خطأ' : n <= 30 ? 'استخراج الجذر' : n <= 35 ? 'تعليل' : n <= 40 ? 'تحليل صرفي' : 'تفكير صرفي')

// answer key from the source teacher section
const iTeacherAnswers = find('الإجابات النموذجية', iTeacher)
const srcKey = {}
for (let i = iTeacherAnswers; i < L.length; i++) {
  const m1 = L[i].match(/^(\d+)\. ([أ-ي])$/)
  if (m1 && Number(m1[1]) <= 10) srcKey[Number(m1[1])] = m1[2]
  const m2 = L[i].match(/^(\d+)\. \*\*(صح|خطأ)\./)
  if (m2) srcKey[Number(m2[1])] = m2[2]
  const m3 = L[i].match(/^(\d+)\. (.+?) → \*\*(.+)\*\*$/)
  if (m3) srcKey[Number(m3[1])] = m3[3]
}
const iElm = L.findIndex((l) => l.trim() === 'إجابات التعليل')
const iAnalysisAns = L.findIndex((l) => l.trim() === 'إجابات التحليل')
const iMistakes = L.findIndex((l) => l.trim() === 'ملاحظات تصحيحية مهمة للمعلم')
for (let n = 31; n <= 35; n++) {
  const from = L.findIndex((l, idx) => idx > iElm && l.trim() === `${n}.`)
  srcKey[n] = from < 0 ? '' : L[nextNonEmpty(from)].trim()
}
for (let n = 36; n <= 40; n++) {
  const from = L.findIndex((l, idx) => idx > iAnalysisAns && l.startsWith(`${n}. `))
  const parts = []
  for (let k = from + 1; k < iMistakes && !/^\d+\. /.test(L[k]); k++) if (L[k].trim()) parts.push(L[k].trim())
  srcKey[n] = parts.join(' ')
}

srcQ.forEach((sq) => {
  const impl = C.testQuestions.find((q) => q.number === sq.n)
  if (!impl) return fail(`Question ${sq.n} is missing`)
  if (impl.type !== groupOf(sq.n)) fail(`Question ${sq.n}: type «${impl.type}» should be «${groupOf(sq.n)}»`)
  if (!impl.teacherAnswer || !impl.explanation) fail(`Question ${sq.n}: explanation or teacher answer is empty`)

  if (sq.n <= 20 || sq.n >= 41 || (sq.n >= 31 && sq.n <= 35)) {
    eq(`Question ${sq.n} prompt`, impl.prompt, sq.prompt)
  } else if (sq.n <= 30) {
    eq(`Question ${sq.n} word`, impl.prompt, sq.prompt)
  } else {
    if (!norm(impl.prompt).startsWith(norm(sq.prompt))) fail(`Question ${sq.n}: prompt must start with «${sq.prompt}»`)
    if (sq.instruction && !norm(impl.prompt).includes(norm(sq.instruction))) {
      fail(`Question ${sq.n}: instruction «${sq.instruction}» is missing from the prompt`)
    }
  }

  if (sq.n <= 10) {
    const field = impl.fields[0]
    if (field.kind !== 'choice') return fail(`Question ${sq.n} must be multiple choice`)
    sq.options.forEach((o, i) => {
      if (norm(field.options[i]) !== norm(o)) fail(`Question ${sq.n} option ${i + 1}: «${field.options[i]}» should be «${o}»`)
    })
    const letterIndex = 'أبجد'.indexOf(srcKey[sq.n])
    if (letterIndex < 0 || norm(field.answer) !== norm(sq.options[letterIndex])) {
      fail(`Question ${sq.n}: the graded answer does not match the source key ${srcKey[sq.n]}`)
    }
  } else if (sq.n <= 20) {
    const field = impl.fields[0]
    if (field.kind !== 'choice' || norm(field.answer) !== norm(srcKey[sq.n])) {
      fail(`Question ${sq.n}: true/false answer must be «${srcKey[sq.n]}»`)
    }
  } else if (sq.n <= 30) {
    const field = impl.fields[0]
    const accepted = (field.accept ?? []).map((a) => tokens(a).join(' '))
    if (!accepted.includes(tokens(srcKey[sq.n]).join(' '))) {
      fail(`Question ${sq.n}: accepted roots ${JSON.stringify(field.accept)} must include «${srcKey[sq.n]}»`)
    }
  } else if (sq.n >= 31 && sq.n <= 35) {
    if (impl.fields.some((f) => f.kind !== 'essay')) fail(`Question ${sq.n} must stay a manual essay question`)
  } else if (sq.n >= 36 && sq.n <= 40) {
    const root = (srcKey[sq.n].match(/الجذر: ([^.]+?)(?:\.|$| الوزن| والهمزة| والشدة| الواو)/) ?? [])[1]
    const rootField = impl.fields[0]
    if (root && !(rootField.accept ?? []).some((a) => tokens(a).join(' ') === tokens(root).join(' '))) {
      fail(`Question ${sq.n}: the root field must accept «${root.trim()}»`)
    }
  } else {
    if (impl.fields.some((f) => f.kind !== 'essay')) fail(`Question ${sq.n} must stay a manual question`)
  }
})

// Source answers 1–40 stored in the implementation map, token-equal to the source key
for (let n = 1; n <= 40; n++) {
  if (C.sourceAnswers[n] === undefined) fail(`sourceAnswers is missing question ${n}`)
}
for (let n = 11; n <= 30; n++) {
  if (!sameTokens(C.sourceAnswers[n] ?? '', srcKey[n] ?? '')) fail(`sourceAnswers[${n}] differs from the source answer key`)
}
for (let n = 31; n <= 35; n++) {
  if (!sameTokens(C.sourceAnswers[n] ?? '', srcKey[n] ?? '')) fail(`sourceAnswers[${n}] differs from the source answer`)
}
for (let n = 36; n <= 40; n++) {
  if (!sameTokens(C.sourceAnswers[n] ?? '', srcKey[n] ?? '')) fail(`sourceAnswers[${n}] differs from the source answer`)
}

// ================================================================
// 8. Teacher material: mistakes, review card, remediation, challenge
// ================================================================
const srcMistakes = L.filter((l) => /^الخطأ (الأول|الثاني|الثالث|الرابع|الخامس):/.test(l)).map((l) => l.trim())
if (srcMistakes.length !== 5) fail(`Source must contain 5 teacher mistakes (found ${srcMistakes.length})`)
srcMistakes.forEach((t, i) => eq(`Teacher mistake ${i + 1} title`, C.teacherMistakes[i]?.title ?? '', t))

const iCard = find('بطاقة مراجعة سريعة')
const iCardEnd = find('خلاصة الدرس الكبرى')
const cardRows = L.slice(iCard, iCardEnd).filter((l) => l.startsWith('|')).slice(2).map((l) => l.split('|').slice(1, -1).map((c) => c.trim()))
if (cardRows.length !== 11) fail(`Source review card must have 11 rows (found ${cardRows.length})`)
cardRows.forEach(([term, meaning], i) => {
  eq(`Review card ${i + 1} term`, C.reviewCard[i]?.term ?? '', term)
  eq(`Review card ${i + 1} meaning`, C.reviewCard[i]?.meaning ?? '', meaning)
})

const iRemFam = find('استخدم عائلة واحدة فقط:')
const remFamSource = listAfter(iRemFam, /^- (.+)$/)
if (remFamSource.length !== 6) fail(`Remedial family must list 6 words (found ${remFamSource.length})`)
remFamSource.forEach((w, i) => eq(`Remedial word ${i + 1}`, C.remedialFamily[i] ?? '', w))
const remQSource = listAfter(find('واسأل:'), /^\d\. (.+)$/)
if (remQSource.length !== 5) fail(`Remedial questions must number 5 (found ${remQSource.length})`)
remQSource.forEach((q, i) => eq(`Remedial question ${i + 1}`, C.remedialQuestions[i] ?? '', q))

const chWords = listAfter(find('حلّل الكلمات الآتية دون الرجوع إلى القاموس:'), /^- (.+)$/)
if (chWords.length !== 10) fail(`Challenge must list 10 words (found ${chWords.length})`)
chWords.forEach((w, i) => eq(`Challenge word ${i + 1}`, C.challengeWords[i] ?? '', w))
const chQ = listAfter(find('ثم حدّد:'), /^\d\. (.+)$/).map((q) => q.replace(/\.$/, ''))
if (chQ.length !== 5) fail(`Challenge questions must number 5 (found ${chQ.length})`)
chQ.forEach((q, i) => eq(`Challenge question ${i + 1}`, (C.challengeQuestions[i] ?? '').replace(/\.$/, ''), q))
eq('Challenge note', C.challengeNote, L.find((l) => l.includes('تنبيه للمعلم:')) ?? '')

// ================================================================
// 9. Registration, sections, stable route, Lesson 2 absence, password
// ================================================================
const count = (text, needle) => text.split(needle).length - 1
if (count(registry, "id: 'morphology-lesson-01'") !== 1) fail('morphology-lesson-01 must be registered exactly once')
if (count(registry, "sectionId: 'morphology'") !== 1) fail('Section «morphology» must contain exactly one lesson')
if (count(registry, "sectionId: 'basics-grammar'") !== 10) fail('Section «basics-grammar» must keep exactly ten lessons')
const morphEntry = registry.slice(registry.indexOf("id: 'morphology-lesson-01'"), registry.indexOf("id: 'morphology-lesson-01'") + 500)
if (!/number: '١'/.test(morphEntry) || !/title: 'مدخل إلى علم الصرف'/.test(morphEntry)) fail('Lesson 1 must be numbered ١ with the source title')
if (/morphology-lesson-0[2-9]|morphology-lesson-1\d/.test(registry + lesson + content)) fail('Lesson 2 must not be registered or built')
if (!/morphology-lesson-01/.test(read('src/app/App.tsx'))) fail('The stable route morphology-lesson-01 must be wired in App.tsx')

const password = /COURSE_TEACHER_PASSWORD\s*=\s*'([^']+)'/.exec(readFileSync(new URL('../src/shared/teacher/teacherPassword.ts', import.meta.url), 'utf8'))?.[1] ?? ''
if (!password) fail('The shared teacher password constant could not be read (for the leak check only)')
if (!lesson.includes('COURSE_TEACHER_PASSWORD')) fail('The morphology lesson must use the shared teacher password module')
for (const [name, text] of [
  ['lesson', lesson], ['content', content], ['grading', grading], ['source reference', src],
  ['source audit document', read('docs/morphology-lesson-01-source-audit.md')],
]) {
  if (text.includes(password)) fail(`The teacher password must not appear in ${name}`)
}

if (failures.length) {
  console.error(`Morphology source audit FAILED (${failures.length} issue(s)):\n- ${failures.join('\n- ')}`)
  process.exit(1)
}
console.log(
  `Morphology source audit passed against ${srcPath}: 12 objectives, 8 worked examples, 15 activity words, ` +
    '3 family lists, 8 mind-map nodes, 9 golden rules, 6 tools, 45 questions in source order with prompts/options/groups, ' +
    'answer keys 1–40, 5 teacher mistakes, 11 review rows, remediation and challenge, one Lesson 1 registration, ten basics lessons, no Lesson 2.',
)
