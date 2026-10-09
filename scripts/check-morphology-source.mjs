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
// key for verbatim comparison: letters only (punctuation, spacing and markers ignored)
const keyOf = (t) => norm(t).replace(/[\s.،,:؛;!؟?()\[\]{}\-–—_→←↔↓↑<>=+*«»"'“”‘’|…]/g, '')
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
for (let n = 1; n <= 10; n++) {
  if (!sameTokens(C.sourceAnswers[n] ?? '', srcKey[n] ?? '')) fail(`sourceAnswers[${n}] differs from the source answer key`)
}
for (let n = 21; n <= 30; n++) {
  if (!sameTokens(C.sourceAnswers[n] ?? '', srcKey[n] ?? '')) fail(`sourceAnswers[${n}] differs from the source answer key`)
}
// 11–20: the full source sentence is checked in section 13
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

// ================================================================
// 11. Activity: source spelling, source test keys and morphology of the fifteen words
// ================================================================
// Words whose root letters changed (إعلال): §14–15 and §23 name these three as the examples.
const CHANGED_WORDS = ['قال', 'باع', 'دعا']
CHANGED_WORDS.forEach((w) => { if (!src.includes(w)) fail(`Changed-root example «${w}» is missing from the source`) })
const letterList = (t) => Array.from(norm(t).replace(/\s+/g, ''))
C.activityWords.forEach((w, i) => {
  const raw = activitySource[i] ?? ''
  // doubled: the written form of the word in the source carries a shadda (U+0651)
  if (w.doubled !== raw.includes('\u0651')) {
    fail(`Activity word ${i + 1} «${w.word}»: doubled=${w.doubled}, but the source spelling ${raw.includes('\u0651') ? 'has' : 'has no'} shadda`)
  }
  const changed = CHANGED_WORDS.includes(norm(w.word))
  if (w.changed !== changed) fail(`Activity word ${i + 1} «${w.word}»: changed=${w.changed}, expected ${changed}`)
  if (!changed) {
    // extra letters = letters of the word minus the root letters (pattern letters), as a multiset
    const rem = letterList(w.word)
    for (const ch of letterList(w.root)) {
      const j = rem.indexOf(ch)
      if (j < 0) { fail(`Activity word ${i + 1} «${w.word}»: root letter «${ch}» is not in the word`); break }
      rem.splice(j, 1)
    }
    const want = rem.slice().sort().join('')
    const got = letterList(w.extra.join('')).sort().join('')
    if (want !== got) fail(`Activity word ${i + 1} «${w.word}»: extra letters should be «${rem.join(' ')}», found «${w.extra.join(' ')}»`)
  }
})
// Root and weight agree with the source answer keys wherever the same word is a test item (21–30, 36–40)
C.activityWords.forEach((w) => {
  const q = C.testQuestions.find((qq) => ((qq.number >= 21 && qq.number <= 30) || (qq.number >= 36 && qq.number <= 40)) &&
    tokens(qq.prompt)[0] === tokens(w.word)[0])
  if (!q) return
  const key = srcKey[q.number] ?? ''
  const rootPart = q.number <= 30 ? key : (key.match(/الجذر: (.+?)(?: الوزن:| والهمزة| والشدة| الواو| الحرف|$)/) ?? [])[1] ?? ''
  if (letterList(w.root).join('') !== letterList(rootPart).join('')) {
    fail(`Activity word «${w.word}» root «${w.root}» differs from source answer ${q.number} «${rootPart}»`)
  }
  const weightPart = (key.match(/الوزن: (.+)$/) ?? [])[1]
  if (weightPart) {
    if (tokens(w.weight).join(' ') !== tokens(weightPart).join(' ')) {
      fail(`Activity word «${w.word}» weight «${w.weight}» differs from source answer ${q.number} «${weightPart}»`)
    }
    const field = q.fields.find((f) => f.kind === 'text' && f.label === 'الوزن')
    if (!field || !(field.accept ?? []).some((a) => tokens(a).join(' ') === tokens(weightPart).join(' '))) {
      fail(`Question ${q.number}: the weight field must accept «${weightPart}»`)
    }
  }
})
// The seven source instructions for each word, verbatim
const requestItems = listAfter(iRequest, /^- (.+)$/)
if (requestItems.length !== 7) fail(`Source activity instructions must list 7 items (found ${requestItems.length})`)
requestItems.forEach((t, i) => eq(`Activity instruction ${i + 1}`, C.activityInstructions.items[i] ?? '', t))
eq('Activity instruction start', C.activityInstructions.start, L[find('حلّل الكلمات الآتية:')])
eq('Activity instruction request', C.activityInstructions.request, L[iRequest])

// ================================================================
// 12. Worked examples: source notes and source weight lines
// ================================================================
for (let i = iSolved; i < iActivity; i++) {
  const head = L[i].match(/^\*\*الكلمة: (.+)\*\*$/)
  if (!head) continue
  const exNo = solvedSource.findIndex((e) => e.word === head[1].trim())
  const impl = C.solvedExamples[exNo]
  if (!impl) { fail(`Worked example «${head[1]}» is missing`); continue }
  for (let k = i + 1; k < iActivity && !L[k].match(/^\*\*الكلمة: /) && L[k].trim() !== 'النشاط التطبيقي'; k++) {
    const t = L[k].trim()
    if (!t || t.startsWith('الجذر:') || t.startsWith('مثال ')) continue
    if (t.startsWith('الوزن:')) {
      if (tokens(impl.weight).join(' ') !== tokens(t.replace('الوزن:', '')).join(' ')) {
        fail(`Worked example ${exNo + 1}: weight «${impl.weight}» differs from source «${t}»`)
      }
      continue
    }
    if (!keyOf(impl.note).includes(keyOf(t))) fail(`Worked example ${exNo + 1}: source note «${t}» is missing from the implementation note`)
  }
}

// ================================================================
// 13. Teacher answers 11–20 are the full source sentences; mind-map nodes have text
// ================================================================
for (let n = 11; n <= 20; n++) {
  const at = L.findIndex((l, idx) => idx > iTeacherAnswers && new RegExp(`^${n}\\. \\*\\*`).test(l))
  const full = (L[at] ?? '').replace(/\*\*/g, '').replace(/^\d+\.\s*/, '')
  if (!sameTokens(C.sourceAnswers[n] ?? '', full)) fail(`sourceAnswers[${n}] must be the source answer «${full}»`)
}
C.mindMapNodes.forEach((n) => { if (!n.text || n.text.trim().length < 10) fail(`Mind-map node «${n.label}» has no explanation text`) })

// ================================================================
// 14. Verbatim coverage of the source prose (every substantive line must be in the implementation)
// ================================================================
// Headings and labels that the implementation shows under another title. Each target must exist.
const HEADING_MAP = {
  'التعريف': 'تعريف الصرف',
  'ما الفرق بين الصرف والنحو؟': '3. الفرق بين الصرف والنحو',
  'ما الجذر الصرفي؟': '5. الجذر الصرفي والمادة',
  'التعريف المبسط': '5. الجذر الصرفي والمادة',
  'مثال الجذر الثلاثي': 'الجذر الثلاثي',
  'هل الجذر هو الكلمة نفسها؟': '6. الجذر والكلمة: الفرق',
  'الجذر لا يحدد المعنى الكامل وحده': '13. لماذا لا يحدد الجذر المعنى وحده؟',
  'ما الوزن الصرفي؟': '20. تعريف الميزان الصرفي',
  'الحروف الأصلية ليست دائمًا ثابتة في صورتها الظاهرة': '23. الحروف الأصلية التي تتغير صورتها',
  'خريطة ذهنية أساسية': '25. الخريطة الذهنية',
  'أمثلة تحليلية متقدمة': '24. الأمثلة التحليلية الأربعة',
  'قاعدة ذهبية': '26. القواعد الذهبية',
  'خلاصة القواعد': '26. القواعد الذهبية',
  'القاعدة الأولى': 'القواعد الذهبية', 'القاعدة الثانية': 'القواعد الذهبية', 'القاعدة الثالثة': 'القواعد الذهبية',
  'القاعدة الرابعة': 'القواعد الذهبية', 'القاعدة الخامسة': 'القواعد الذهبية', 'القاعدة السادسة': 'القواعد الذهبية',
  'القاعدة السابعة': 'القواعد الذهبية', 'القاعدة الثامنة': 'القواعد الذهبية', 'القاعدة التاسعة': 'القواعد الذهبية',
  'القاعدة العاشرة': 'القواعد الذهبية',
  'أمثلة محلولة': '27. الأمثلة المحلولة',
  'الاختيار من متعدد': 'أولًا: اختيار من متعدد',
  'إجابات استخراج الجذر': 'الجواب المعتمد من المصدر',
  'إجابات التعليل': 'الجواب المعتمد من المصدر',
  'إجابات التحليل': 'الجواب المعتمد من المصدر',
  'ملاحظات تصحيحية مهمة للمعلم': 'ملاحظات تصحيحية للمعلم',
  'بطاقة مراجعة سريعة': 'بطاقة المراجعة السريعة',
  'خلاصة الدرس الكبرى': '33. خلاصة الدرس',
  'تمهيد للدرس التالي': 'تمهيد الدرس الثاني',
  'مثال مهم: «قال»': '14. «قال» وجذرها ق ـ و ـ ل',
  'المثال الأول: «معلّم»': '24. الأمثلة التحليلية الأربعة',
  'نبحث عن عائلة الكلمة:': 'نبحث عن عائلة الكلمة:',
  'الكلمة: كاتب': '27. الأمثلة المحلولة (1–4)',
  'الكلمة: مكتوب': '27. الأمثلة المحلولة (1–4)',
  'الكلمة: أكرم': '27. الأمثلة المحلولة (1–4)',
  'الكلمة: علّم': '27. الأمثلة المحلولة (1–4)',
  'الكلمة: قال': '28. الأمثلة المحلولة (5–8)',
  'الكلمة: باع': '28. الأمثلة المحلولة (5–8)',
  'الكلمة: دعا': '28. الأمثلة المحلولة (5–8)',
  'الكلمة: استغفار': '28. الأمثلة المحلولة (5–8)',
}
const implKey = keyOf(
  (lesson + '\n' + content).replace(/<[^>]*>/g, (m) => ` ${(m.match(/"[^"]*"/g) ?? []).join(' ')} `),
)
const headerEnd = src.indexOf('-->')
let coverageChecked = 0
let coverageHeadings = 0
const unverified = []
src.slice(headerEnd + 3).split('\n').forEach((raw) => {
  const line = raw.trim()
  if (!line || line.startsWith('|---') || line === '↓') return
  const pieces = line.startsWith('|')
    ? line.split('|').map((c) => c.trim()).filter((c) => c && !/^-+$/.test(c))
    : [line.replace(/^>\s*/, '').replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, '').replace(/^[أبجد]\.\s+/, '')]
  pieces.forEach((piece) => {
    const p = piece.replace(/^\d+\.\s+/, '').replace(/^[أبجد]\.\s+/, '')
    const k = keyOf(p)
    if (k.length < 6) return
    const candidates = [k]
    if (p.includes(':')) {
      const v = keyOf(p.split(':').slice(1).join(':'))
      if (v.length >= 6) candidates.push(v)
    }
    coverageChecked++
    if (candidates.some((c) => implKey.includes(c))) return
    const mapped = HEADING_MAP[p.replace(/\*\*/g, '').trim()] ?? HEADING_MAP[p]
    if (mapped !== undefined) {
      coverageHeadings++
      if (!implKey.includes(keyOf(mapped))) fail(`Heading «${p}» maps to «${mapped}», which is not in the implementation`)
      return
    }
    unverified.push(p)
  })
})
unverified.forEach((p) => fail(`Source text not found verbatim in the implementation: «${p}»`))

console.log(`Verbatim prose check: ${coverageChecked} substantive lines/cells checked, ${coverageHeadings} headings mapped to implementation titles.`)

if (failures.length) {
  console.error(`Morphology source audit FAILED (${failures.length} issue(s)):\n- ${failures.join('\n- ')}`)
  process.exit(1)
}
console.log(
  `Morphology source audit passed against ${srcPath}: 12 objectives, 8 worked examples, 15 activity words, ` +
    '3 family lists, 8 mind-map nodes, 9 golden rules, 6 tools, 45 questions in source order with prompts/options/groups, ' +
    'answer keys 1–40, 5 teacher mistakes, 11 review rows, remediation and challenge, one Lesson 1 registration, ten basics lessons, no Lesson 2.',
)
