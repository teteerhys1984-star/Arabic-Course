import { useState, type ReactNode } from 'react'
import { LessonFlow, type LessonStepDefinition } from '../shared/components/LessonFlow'
import { TeacherSpace } from '../shared/teacher/TeacherSpace'
import * as C from './morphology-lesson-01/content'
import {
  answerKey,
  autoStatus,
  gradeTest,
  looseKey,
  normalizeAnswer,
  readableAnswer,
  answeredCount,
  type AnswerMap,
  type TestResult,
} from './morphology-lesson-01/grading'

interface Props {
  onProgressChange?: (value: number) => void
  onFinish?: () => void
}

/* ================================================================== *
 * عناصر مشتركة داخل الدرس
 * ================================================================== */

function Callout({ children, title = 'قاعدة' }: { children: ReactNode; title?: string }) {
  return (
    <aside className="morph-callout">
      <strong>{title}</strong>
      <div>{children}</div>
    </aside>
  )
}

/** توضيح مصنّف بوضوح على أنه إضافة تعليمية، لا نص من المصدر. */
function Clarification({ children }: { children: ReactNode }) {
  return (
    <aside className="morph-clarification">
      <span className="morph-clarification__badge">توضيح تعليمي</span>
      <div>{children}</div>
    </aside>
  )
}

function Golden({ text }: { text: string }) {
  return (
    <div className="morph-golden">
      <span aria-hidden="true">⭐</span>
      <p>{text}</p>
    </div>
  )
}

/** حروف الجذر منفصلة بوضوح، من اليمين إلى اليسار كما تُكتب الكلمة. */
function RootLetters({ letters, label = 'الجذر' }: { letters: string[]; label?: string }) {
  return (
    <span className="morph-root" role="img" aria-label={`${label}: ${letters.join(' ')}`}>
      {letters.map((letter, index) => (
        <span key={`${letter}-${index}`} className="morph-root__letter" aria-hidden="true">
          {letter}
        </span>
      ))}
    </span>
  )
}

function Chips({ items }: { items: string[] }) {
  return (
    <div className="morph-chips">
      {items.map((item) => (
        <bdi key={item}>{item}</bdi>
      ))}
    </div>
  )
}

/* ================================================================== *
 * المختبر 1: الصرف والنحو — «رأيتُ الكاتبَ»
 * ================================================================== */

function SarfNahwLab() {
  const [view, setView] = useState<'sarf' | 'nahw'>('sarf')
  const rows = view === 'sarf' ? C.sentence.sarf : C.sentence.nahw
  return (
    <section className="morph-lab" aria-labelledby="lab-sarf-nahw">
      <h3 id="lab-sarf-nahw">مختبر: الصرف أم النحو؟</h3>
      <p>
        اختر المنظور، وانظر كيف يحلّل كل علم الكلمة نفسها في الجملة نفسها.
      </p>
      <div className="morph-toggle" role="group" aria-label="منظور التحليل">
        <button
          type="button"
          className="morph-toggle__btn"
          aria-pressed={view === 'sarf'}
          onClick={() => setView('sarf')}
        >
          منظور الصرف
        </button>
        <button
          type="button"
          className="morph-toggle__btn"
          aria-pressed={view === 'nahw'}
          onClick={() => setView('nahw')}
        >
          منظور النحو
        </button>
      </div>
      <p className="morph-sentence" aria-label="الجملة">
        <bdi>{C.sentence.tokens.join(' ')}</bdi>
      </p>
      <div className="morph-panel" aria-live="polite">
        <strong>{view === 'sarf' ? 'الصرف يدرس الكلمة من داخلها' : 'النحو يدرس الكلمة داخل الجملة'}</strong>
        <ul className="morph-list">
          {rows.map((row) => (
            <li key={row.word}>{row.text}</li>
          ))}
        </ul>
        <p className="morph-muted">{C.sentence.summary}</p>
      </div>
    </section>
  )
}

/* ================================================================== *
 * المختبر 2: عائلة الكلمة — ك ت ب، ع ل م، غ ف ر
 * ================================================================== */

function FamilyLab() {
  const [familyId, setFamilyId] = useState(C.families[0].id)
  const family = C.families.find((item) => item.id === familyId) ?? C.families[0]
  const [selected, setSelected] = useState(0)
  const member = family.members[selected] ?? family.members[0]

  function chooseFamily(id: string) {
    setFamilyId(id)
    setSelected(0)
  }

  return (
    <section className="morph-lab" aria-labelledby="lab-family">
      <h3 id="lab-family">مختبر: الجذر وعائلة الكلمة</h3>
      <p>اختر جذرًا، ثم اختر كلمة من عائلته لترى جذرها وصيغتها وعلاقتها بأفراد العائلة.</p>

      <div className="morph-toggle" role="group" aria-label="اختيار الجذر">
        {C.families.map((item) => (
          <button
            key={item.id}
            type="button"
            className="morph-toggle__btn"
            aria-pressed={item.id === familyId}
            onClick={() => chooseFamily(item.id)}
          >
            <bdi>{item.label}</bdi>
          </button>
        ))}
      </div>

      <div className="morph-family">
        <div className="morph-family__members" role="group" aria-label="كلمات العائلة">
          {family.members.map((item, index) => (
            <button
              key={item.word}
              type="button"
              className="morph-chip-btn"
              aria-pressed={index === selected}
              onClick={() => setSelected(index)}
            >
              <bdi>{item.word}</bdi>
            </button>
          ))}
        </div>
        <div className="morph-family__detail" aria-live="polite">
          <p className="morph-family__word">
            <bdi>{member.word}</bdi>
          </p>
          <dl className="morph-dl">
            <dt>الجذر</dt>
            <dd>
              <RootLetters letters={family.root} />
            </dd>
            <dt>الصيغة / الوزن</dt>
            <dd>
              <bdi>{member.pattern}</bdi>
            </dd>
            <dt>العلاقة بالجذر</dt>
            <dd>{member.relation}</dd>
          </dl>
          <p className="morph-muted">
            يشترك الجميع في الحروف الأصلية <bdi>{family.label}</bdi>، والذي يختلف هو الصيغة والمعنى الصرفي.
          </p>
        </div>
      </div>
    </section>
  )
}

/* ================================================================== *
 * المختبر 3: الأصلي والزائد — كاتب، مكتوب، أكرم، استغفر، معلّم
 * ================================================================== */

function OriginalLab() {
  return (
    <section className="morph-lab" aria-labelledby="lab-original">
      <h3 id="lab-original">مختبر: الحروف الأصلية والزائدة</h3>
      <p>
        علّم كل حرف تعتقد أنه أصلي في الجذر، ثم تحقق. التحقق هنا تعليمي داخل الشرح نفسه، ولا يدخل في
        درجة الاختبار النهائي.
      </p>
      <div className="morph-stack">
        {C.originalLab.map((item) => (
          <OriginalRow key={item.word} item={item} />
        ))}
      </div>
    </section>
  )
}

function OriginalRow({ item }: { item: (typeof C.originalLab)[number] }) {
  const [marks, setMarks] = useState<boolean[]>(() => item.letters.map(() => false))
  const [checked, setChecked] = useState(false)
  // نُظهر الحروف من اليمين إلى اليسار كما تُكتب الكلمة، ونحافظ على ترتيبها داخل bdi.
  const correct = item.letters.every((letter, index) => marks[index] === letter.original)

  function toggle(index: number) {
    setChecked(false)
    setMarks((current) => current.map((value, position) => (position === index ? !value : value)))
  }

  return (
    <article className="morph-original">
      <p className="morph-original__word">
        <bdi>{item.word}</bdi>
      </p>
      <div className="morph-original__letters" role="group" aria-label={`حروف ${item.word}`}>
        {item.letters.map((letter, index) => (
          <label key={`${letter.char}-${index}`} className="morph-letter-pick">
            <input
              type="checkbox"
              checked={marks[index]}
              onChange={() => toggle(index)}
              aria-label={`الحرف ${letter.char} أصلي`}
            />
            <span className="morph-root__letter">
              <bdi>{letter.char}</bdi>
            </span>
            <small>أصلي؟</small>
          </label>
        ))}
      </div>
      <div className="morph-row-actions">
        <button type="button" className="button button--secondary" onClick={() => setChecked(true)}>
          تحقّق من التحليل
        </button>
      </div>
      {checked && (
        <p className={`morph-feedback ${correct ? 'morph-feedback--ok' : 'morph-feedback--no'}`} role="status">
          <strong>{correct ? 'تحليل صحيح. ' : 'راجع التحليل. '}</strong>
          {item.explanation}
        </p>
      )}
    </article>
  )
}

/* ================================================================== *
 * المختبر 4: الجذور المعتلة — قال، باع، دعا
 * ================================================================== */

function WeakRootLab() {
  return (
    <section className="morph-lab" aria-labelledby="lab-weak">
      <h3 id="lab-weak">مختبر: الصورة الظاهرة والجذر</h3>
      <p>
        في كل كلمة ترى الصورة الظاهرة، ثم اختر الحرف الأصلي الذي لم يظهر بصورته. هذا تمهيد لمفهوم الإعلال.
      </p>
      <div className="morph-stack">
        {C.weakRoots.map((item) => (
          <WeakRow key={item.word} item={item} />
        ))}
      </div>
    </section>
  )
}

function WeakRow({ item }: { item: (typeof C.weakRoots)[number] }) {
  const [picked, setPicked] = useState<number | null>(null)
  const [showRoot, setShowRoot] = useState(false)
  const correct = picked === item.changed

  return (
    <article className="morph-weak">
      <div className="morph-weak__compare">
        <div>
          <span className="morph-muted">الصورة الظاهرة</span>
          <p className="morph-big">
            <bdi>{item.word}</bdi> <small>({item.surface})</small>
          </p>
        </div>
        <div>
          <span className="morph-muted">الجذر</span>
          <p>{showRoot ? <RootLetters letters={item.root} /> : <span className="morph-muted">مخفي</span>}</p>
        </div>
      </div>
      <fieldset className="morph-weak__choices">
        <legend>أيّ حرف من الجذر لم يظهر بصورته الأصلية في «{item.word}»؟</legend>
        <div className="morph-toggle" role="group" aria-label="اختيار الحرف">
          {item.root.map((letter, index) => (
            <button
              key={`${letter}-${index}`}
              type="button"
              className="morph-toggle__btn"
              aria-pressed={picked === index}
              onClick={() => setPicked(index)}
            >
              <bdi>{letter}</bdi>
            </button>
          ))}
        </div>
      </fieldset>
      <div className="morph-row-actions">
        <button type="button" className="button button--ghost" onClick={() => setShowRoot((value) => !value)}>
          {showRoot ? 'إخفاء الجذر' : 'أظهر الجذر'}
        </button>
      </div>
      {picked !== null && (
        <p className={`morph-feedback ${correct ? 'morph-feedback--ok' : 'morph-feedback--no'}`} role="status">
          <strong>{correct ? 'صحيح. ' : 'ليس هذا الحرف. '}</strong>
          {item.explanation}
        </p>
      )}
    </article>
  )
}

/* ================================================================== *
 * المختبر 5: الميزان الصرفي — كتب، كاتب، مكتوب
 * ================================================================== */

function WeightLab() {
  return (
    <section className="morph-lab" aria-labelledby="lab-weight">
      <h3 id="lab-weight">مختبر: اختر الوزن المناسب</h3>
      <p>اختر وزن الكلمة، وستظهر مقابلة حروفها الأصلية بحروف الميزان «ف ع ل».</p>
      <div className="morph-stack">
        {C.weightWords.map((item) => (
          <WeightRow key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}

function WeightRow({ item }: { item: C.WeightWord }) {
  const [picked, setPicked] = useState<string | null>(null)
  const correct = picked === item.weight
  const pattern = ['ف', 'ع', 'ل']

  return (
    <article className="morph-weight">
      <p className="morph-big">
        <bdi>{item.word}</bdi>
      </p>
      <fieldset>
        <legend>ما وزن «{item.word}»؟</legend>
        <div className="morph-toggle" role="group" aria-label={`أوزان ${item.word}`}>
          {item.options.map((option) => (
            <button
              key={option}
              type="button"
              className="morph-toggle__btn"
              aria-pressed={picked === option}
              onClick={() => setPicked(option)}
            >
              <bdi>{option}</bdi>
            </button>
          ))}
        </div>
      </fieldset>
      {picked !== null && (
        <div className="morph-mapping" aria-live="polite">
          <table className="morph-table">
            <thead>
              <tr>
                <th scope="col">حرف الجذر</th>
                <th scope="col">حرف الميزان</th>
              </tr>
            </thead>
            <tbody>
              {item.root.map((letter, index) => (
                <tr key={`${letter}-${index}`}>
                  <td>
                    <bdi>{letter}</bdi>
                  </td>
                  <td>
                    <bdi>{pattern[index]}</bdi>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className={`morph-feedback ${correct ? 'morph-feedback--ok' : 'morph-feedback--no'}`} role="status">
            <strong>{correct ? 'صحيح. ' : `الوزن الصحيح: ${item.weight}. `}</strong>
            {item.note}
          </p>
        </div>
      )}
    </article>
  )
}

/* ================================================================== *
 * المختبر 6: الخريطة الذهنية — الجذر → الصيغة → ... → المعنى المقصود
 * ================================================================== */

function MindMapLab() {
  const [open, setOpen] = useState<string | null>(null)
  return (
    <section className="morph-lab" aria-labelledby="lab-map">
      <h3 id="lab-map">الخريطة الذهنية: من الجذر إلى المعنى المقصود</h3>
      <p>اقرأ الخريطة من اليمين إلى اليسار، ثم اضغط كل عقدة لترى ما تمثله.</p>
      <ol className="morph-map" aria-label="الخريطة الذهنية">
        {C.mindMapNodes.map((node, index) => (
          <li key={node.id} className="morph-map__item">
            <button
              type="button"
              className="morph-map__node"
              aria-expanded={open === node.id}
              aria-controls={`map-${node.id}`}
              onClick={() => setOpen((current) => (current === node.id ? null : node.id))}
            >
              <span className="morph-map__index" aria-hidden="true">
                {index + 1}
              </span>
              {node.label}
            </button>
            {index < C.mindMapNodes.length - 1 && (
              <span className="morph-map__arrow" aria-hidden="true">
                ←
              </span>
            )}
            {open === node.id && (
              <p id={`map-${node.id}`} className="morph-map__text">
                {node.text}
              </p>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}

/* ================================================================== *
 * النشاط التطبيقي: خمس عشرة كلمة في ثلاث مجموعات
 * ================================================================== */

interface ActivityValues {
  root: string
  rootCount: string
  extra: string
  doubled: string
  changed: string
  weight: string
  family: string
}

const emptyActivity: ActivityValues = {
  root: '',
  rootCount: '',
  extra: '',
  doubled: '',
  changed: '',
  weight: '',
  family: '',
}

const NONE_WORDS = ['', 'لا', 'لا يوجد', 'لا شيء', '-', 'ـ']

/** الحروف تُقرأ حرفًا حرفًا، فيُقبل «ا ت» و«اته» على حد سواء. */
function lettersSet(value: string): string[] {
  const list = Array.from(normalizeAnswer(value).replace(/[\s،,\-ـ]/g, ''))
    .map((item) => looseKey(item))
    .filter((item) => item !== '')
  return [...new Set(list)].sort()
}

function sameLetters(left: string, right: string[]): boolean {
  const a = lettersSet(left)
  const b = [...new Set(right.map((item) => looseKey(item)))].sort()
  return a.length === b.length && a.every((item, index) => item === b[index])
}

function checkActivityRow(word: C.ActivityWord, values: ActivityValues) {
  const extraOk =
    word.extra.length === 0
      ? NONE_WORDS.includes(normalizeAnswer(values.extra))
      : sameLetters(values.extra, word.extra)
  return {
    root: looseKey(values.root) === looseKey(word.root),
    rootCount: values.rootCount === String(word.rootCount),
    extra: extraOk,
    doubled: values.doubled === (word.doubled ? 'نعم' : 'لا'),
    changed: values.changed === (word.changed ? 'نعم' : 'لا'),
  }
}

function ActivityGroupStep({ from, to, title }: { from: number; to: number; title: string }) {
  const words = C.activityWords.slice(from, to)
  const [values, setValues] = useState<Record<string, ActivityValues>>({})
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  function update(id: string, field: keyof ActivityValues, value: string) {
    setValues((current) => ({ ...current, [id]: { ...(current[id] ?? emptyActivity), [field]: value } }))
    setChecked((current) => ({ ...current, [id]: false }))
  }

  function checkAll() {
    setChecked(Object.fromEntries(words.map((word) => [word.id, true])))
  }

  function resetAll() {
    setValues({})
    setChecked({})
  }

  return (
    <section className="morph-activity" aria-label={title} data-testid={`morph-activity-${from}`}>
      <p className="morph-muted">
        حلّل كل كلمة بنفسك أولًا. الجذر والعدد والحروف الزائدة والتضعيف والتغيير حقول مُصحَّحة، أما الوزن
        والعائلة فاختياريان ويُكتفى فيهما بالتفكير.
      </p>
      <div className="morph-activity__rows">
        {words.map((word) => {
          const current = values[word.id] ?? emptyActivity
          const result = checked[word.id] ? checkActivityRow(word, current) : null
          const rowOk = result ? Object.values(result).every(Boolean) : false
          return (
            <article key={word.id} className="morph-row" data-testid={`morph-row-${word.id}`}>
              <p className="morph-row__word">
                <bdi>{word.word}</bdi>
              </p>
              <div className="morph-row__fields">
                <label>
                  <span>الجذر</span>
                  <input
                    value={current.root}
                    placeholder="مثال: ك ت ب"
                    aria-label={`جذر ${word.word}`}
                    onChange={(event) => update(word.id, 'root', event.target.value)}
                  />
                </label>
                <label>
                  <span>عدد حروف الجذر</span>
                  <select
                    value={current.rootCount}
                    aria-label={`عدد حروف جذر ${word.word}`}
                    onChange={(event) => update(word.id, 'rootCount', event.target.value)}
                  >
                    <option value="">اختر…</option>
                    <option value="3">ثلاثة</option>
                    <option value="4">أربعة</option>
                  </select>
                </label>
                <label>
                  <span>الحروف الزائدة</span>
                  <input
                    value={current.extra}
                    placeholder="مثال: ا ت (أو: لا يوجد)"
                    aria-label={`الحروف الزائدة في ${word.word}`}
                    onChange={(event) => update(word.id, 'extra', event.target.value)}
                  />
                </label>
                <label>
                  <span>تضعيف؟</span>
                  <select
                    value={current.doubled}
                    aria-label={`تضعيف في ${word.word}`}
                    onChange={(event) => update(word.id, 'doubled', event.target.value)}
                  >
                    <option value="">اختر…</option>
                    <option value="نعم">نعم</option>
                    <option value="لا">لا</option>
                  </select>
                </label>
                <label>
                  <span>تغيّر في أصل الجذر؟</span>
                  <select
                    value={current.changed}
                    aria-label={`تغيّر في أصل ${word.word}`}
                    onChange={(event) => update(word.id, 'changed', event.target.value)}
                  >
                    <option value="">اختر…</option>
                    <option value="نعم">نعم</option>
                    <option value="لا">لا</option>
                  </select>
                </label>
                <label>
                  <span>الوزن (اختياري)</span>
                  <input
                    value={current.weight}
                    aria-label={`وزن ${word.word} اختياري`}
                    onChange={(event) => update(word.id, 'weight', event.target.value)}
                  />
                </label>
                <label>
                  <span>كلمة من العائلة (اختياري)</span>
                  <input
                    value={current.family}
                    aria-label={`كلمة من عائلة ${word.word} اختياري`}
                    onChange={(event) => update(word.id, 'family', event.target.value)}
                  />
                </label>
              </div>
              {result && (
                <div className={`morph-feedback ${rowOk ? 'morph-feedback--ok' : 'morph-feedback--no'}`} role="status">
                  <strong>{rowOk ? 'التحليل صحيح. ' : 'راجع الحقول المعلَّمة. '}</strong>
                  <ul className="morph-checks">
                    <li>الجذر: {result.root ? 'صحيح' : `الصحيح: ${word.root}`}</li>
                    <li>عدد الحروف: {result.rootCount ? 'صحيح' : `الصحيح: ${word.rootCount}`}</li>
                    <li>الحروف الزائدة: {result.extra ? 'صحيح' : `الصحيح: ${word.extra.join(' ، ') || 'لا توجد'}`}</li>
                    <li>التضعيف: {result.doubled ? 'صحيح' : `الصحيح: ${word.doubled ? 'نعم' : 'لا'}`}</li>
                    <li>التغيير: {result.changed ? 'صحيح' : `الصحيح: ${word.changed ? 'نعم' : 'لا'}`}</li>
                  </ul>
                  <p>
                    الوزن: <bdi>{word.weight || 'لا يُطلب في هذا المستوى'}</bdi> — كلمة من العائلة:{' '}
                    <bdi>{word.family}</bdi>
                  </p>
                  <p>{word.explanation}</p>
                </div>
              )}
            </article>
          )
        })}
      </div>
      <div className="morph-row-actions">
        <button type="button" className="button button--secondary" onClick={checkAll}>
          تحقّق من هذه المجموعة
        </button>
        <button type="button" className="button button--ghost" onClick={resetAll}>
          إعادة المحاولة
        </button>
      </div>
    </section>
  )
}

/* ================================================================== *
 * اختبار المنصة: ستة أجزاء ثم التسليم والنتيجة
 * ================================================================== */

function TestGroupStep({
  from,
  to,
  title,
  answers,
  submitted,
  onAnswer,
}: {
  from: number
  to: number
  title: string
  answers: AnswerMap
  submitted: boolean
  onAnswer: (questionId: string, fieldIndex: number, value: string[]) => void
}) {
  const questions = C.testQuestions.filter((question) => question.number >= from && question.number <= to)
  return (
    <section className="official-test morph-test" data-testid={`morph-test-${from}`}>
      <div className="official-test__intro">
        <strong>{title}</strong>
        <span>{questions.length} أسئلة</span>
        <p>
          {submitted
            ? 'تم تسليم الاختبار. الإجابات مقفلة، ولن تظهر النتيجة هنا.'
            : 'أجب عن الأسئلة. لا يظهر أي تصحيح أثناء الحل، وتُحفظ إجاباتك عند الانتقال بين الخطوات.'}
        </p>
      </div>
      <div className="official-test__groups">
        {questions.map((question) => (
          <fieldset
            className="official-question morph-test-question"
            key={question.id}
            disabled={submitted}
            data-testid={`morph-question-${question.id}`}
          >
            <legend>
              <span className="question-number">
                السؤال <bdi>{question.number}</bdi>
              </span>{' '}
              <span className="morph-type">{question.type}</span>{' '}
              <bdi>{question.prompt}</bdi>
            </legend>
            {question.fields.map((field, fieldIndex) => {
              const value = answers[answerKey(question.id, fieldIndex)] ?? []
              const label = field.label
              if (field.kind === 'choice') {
                return (
                  <div className="official-options" role="radiogroup" aria-label={`${question.prompt} — ${label}`} key={label}>
                    {field.options.map((option) => (
                      <label key={option}>
                        <input
                          type="radio"
                          name={`${question.id}-${fieldIndex}`}
                          value={option}
                          checked={value[0] === option}
                          onChange={() => onAnswer(question.id, fieldIndex, [option])}
                        />
                        <span>
                          <bdi>{option}</bdi>
                        </span>
                      </label>
                    ))}
                  </div>
                )
              }
              if (field.kind === 'text') {
                return (
                  <label className="morph-field" key={`${label}-${fieldIndex}`}>
                    <span>{label}</span>
                    <input
                      value={value[0] ?? ''}
                      placeholder={field.placeholder}
                      aria-label={`${question.prompt} — ${label}`}
                      onChange={(event) => onAnswer(question.id, fieldIndex, [event.target.value])}
                    />
                  </label>
                )
              }
              return (
                <label className="morph-field morph-field--essay" key={`${label}-${fieldIndex}`}>
                  <span>
                    {label} <small>(يُراجع يدويًا)</small>
                  </span>
                  <textarea
                    value={value[0] ?? ''}
                    placeholder={field.placeholder}
                    aria-label={`${question.prompt} — ${label}`}
                    onChange={(event) => onAnswer(question.id, fieldIndex, [event.target.value])}
                  />
                </label>
              )
            })}
          </fieldset>
        ))}
      </div>
    </section>
  )
}

function SubmitStep({
  answers,
  result,
  onSubmit,
  onRestart,
}: {
  answers: AnswerMap
  result: TestResult | null
  onSubmit: () => void
  onRestart: () => void
}) {
  const answered = answeredCount(C.testQuestions, answers)
  if (!result) {
    return (
      <section className="morph-submit" aria-labelledby="submit-title">
        <h3 id="submit-title">تسليم الاختبار</h3>
        <p>
          أجبت عن <bdi>{answered}</bdi> من <bdi>45</bdi> سؤالًا. ستظهر النتيجة بعد التسليم فقط.
        </p>
        <p className="morph-muted">{C.manualReviewNote}</p>
        <button type="button" className="button button--primary" onClick={onSubmit}>
          تسليم الاختبار وإظهار النتيجة
        </button>
      </section>
    )
  }
  return (
    <section className="morph-submit" aria-labelledby="result-title" role="status">
      <h3 id="result-title">نتيجة الاختبار</h3>
      <p className="morph-score">
        النتيجة الآلية: <bdi>{result.autoCorrect} / {result.autoTotal}</bdi>
      </p>
      <ul className="morph-counts">
        <li>
          إجابات صحيحة: <bdi>{result.autoCorrect}</bdi>
        </li>
        <li>
          إجابات خاطئة: <bdi>{result.autoWrong}</bdi>
        </li>
        <li>
          أسئلة غير مجابة: <bdi>{result.autoUnanswered}</bdi>
        </li>
      </ul>
      <p>
        أسئلة تحتاج مراجعة يدوية: <bdi>{result.manualIds.length}</bdi> (الأسئلة من ٣١ إلى ٣٥، ومن ٤١ إلى ٤٥،
        وتفسير الأسئلة ٣٨–٤٠). هذه الأسئلة لا تُصحَّح آليًا ولا تدخل في الدرجة الآلية.
      </p>
      <ul className="morph-counts morph-counts--types">
        {C.testGroups.map((group) => {
          const stats = result.byType[group.type] ?? { total: 0, correct: 0 }
          return (
            <li key={group.id}>
              {group.type}: <bdi>{stats.correct} / {stats.total}</bdi>
            </li>
          )
        })}
      </ul>
      <button type="button" className="button button--secondary" onClick={onRestart}>
        إعادة الاختبار
      </button>
    </section>
  )
}

function SolutionsStep({ result, answers }: { result: TestResult | null; answers: AnswerMap }) {
  if (!result) {
    return (
      <section className="morph-panel">
        <p>تظهر الحلول بعد تسليم الاختبار من خطوة «تسليم الاختبار وإظهار النتيجة».</p>
      </section>
    )
  }
  return (
    <section className="morph-solutions" aria-label="حلول الاختبار">
      {C.testQuestions.map((question) => {
        const status = autoStatus(question, answers)
        const manual = question.fields.some((field) => field.kind === 'essay')
        return (
          <article key={question.id} className="morph-solution">
            <p className="morph-solution__head">
              <span className="question-number">
                السؤال <bdi>{question.number}</bdi>
              </span>{' '}
              <bdi>{question.prompt}</bdi>
            </p>
            <p className="morph-solution__status">
              {manual && status === null && <span className="morph-pill">يُراجع يدويًا</span>}
              {status === 'correct' && <span className="morph-pill morph-pill--ok">إجابة صحيحة</span>}
              {status === 'wrong' && <span className="morph-pill morph-pill--no">إجابة غير صحيحة</span>}
              {status === 'unanswered' && <span className="morph-pill">غير مجابة</span>}
              {manual && status !== null && <span className="morph-pill">الجزء التفسيري يُراجع يدويًا</span>}
            </p>
            {question.fields.map((field, index) => {
              const value = answers[answerKey(question.id, index)]
              const mine = readableAnswer(field, value)
              if (field.kind === 'essay') {
                return (
                  <p key={index}>
                    <strong>إجابتك:</strong> {mine ?? 'لم تُكتب إجابة.'}
                  </p>
                )
              }
              const shown = field.kind === 'choice' ? field.answer : field.accept[0]
              return (
                <p key={index}>
                  <strong>{field.label}:</strong> إجابتك <bdi>{mine ?? '—'}</bdi> — الصحيح{' '}
                  <bdi>{shown}</bdi>
                </p>
              )
            })}
            <p className="morph-solution__why">
              <strong>لماذا؟</strong> {question.explanation}
            </p>
          </article>
        )
      })}
    </section>
  )
}

/* ================================================================== *
 * منطقة المعلم: محمية بكلمة المرور المعتمدة للمشروع
 * ================================================================== */

function TeacherArea() {
  return (
    <TeacherSpace password="somer173">
      <div className="teacher-material teacher-material--morphology1">
        <h3>أ. الإجابات النموذجية التفصيلية للاختبار (45 سؤالًا)</h3>
        {C.testQuestions.map((question) => (
          <div key={question.id}>
            <p>
              <strong>السؤال {question.number}</strong> (<bdi>{question.type}</bdi>): <bdi>{question.prompt}</bdi>
            </p>
            <p>{question.teacherAnswer}</p>
          </div>
        ))}

        <h3>ب. حلول النشاط التطبيقي (15 كلمة)</h3>
        {C.activityWords.map((word, index) => (
          <div key={word.id}>
            <p>
              {index + 1}. <bdi>{word.word}</bdi> — الجذر: <bdi>{word.root.split('').join(' ')}</bdi> — عدد
              الحروف: {word.rootCount} — الزوائد: <bdi>{word.extra.join(' ، ') || 'لا توجد'}</bdi> — تضعيف:{' '}
              {word.doubled ? 'نعم' : 'لا'} — تغيّر في الأصل: {word.changed ? 'نعم' : 'لا'} — الوزن:{' '}
              <bdi>{word.weight || 'غير مطلوب'}</bdi> — عائلة: <bdi>{word.family}</bdi>
            </p>
            <p>{word.explanation}</p>
          </div>
        ))}

        <h3>ج. حلول الأمثلة المحلولة (8)</h3>
        {C.solvedExamples.map((example) => (
          <p key={example.id}>
            {example.id}. <bdi>{example.word}</bdi> — الجذر: <bdi>{example.root}</bdi> — الوزن:{' '}
            <bdi>{example.weight}</bdi> — {example.note}
          </p>
        ))}

        <h3>د. ملاحظات تصحيحية للمعلم</h3>
        {C.teacherMistakes.map((mistake) => (
          <div key={mistake.title}>
            <p>
              <strong>{mistake.title}</strong>
            </p>
            <p>{mistake.text}</p>
          </div>
        ))}

        <h3>هـ. نشاط علاجي للطلاب الضعفاء</h3>
        <p>استخدم عائلة واحدة فقط: <bdi>ك ت ب</bdi>، ثم اكتب:</p>
        <Chips items={C.remedialFamily} />
        <ol>
          {C.remedialQuestions.map((question) => (
            <li key={question}>{question}</li>
          ))}
        </ol>
        <p>بعد إتقان هذه العائلة، انتقل إلى: <bdi>{C.remedialOrder[0]}</bdi>، ثم إلى <bdi>{C.remedialOrder[1]}</bdi>، ثم إلى جذور فيها إعلال مثل <bdi>{C.remedialOrder[2]}</bdi>.</p>

        <h3>و. تحدٍّ للطلاب المتقدمين</h3>
        <p>حلّل الكلمات الآتية دون الرجوع إلى القاموس:</p>
        <Chips items={C.challengeWords} />
        <ol>
          {C.challengeQuestions.map((question) => (
            <li key={question}>{question}</li>
          ))}
        </ol>
        <Clarification>{C.challengeNote}</Clarification>

        <h3>ز. بطاقة المراجعة</h3>
        <ul>
          {C.reviewCard.map((row) => (
            <li key={row.term}>
              <strong>{row.term}:</strong> {row.meaning}
            </li>
          ))}
        </ul>

        <h3>ح. توضيحات علمية (مصنّفة بوصفها توضيحًا تعليميًا)</h3>
        <ul>
          {C.scientificClarifications.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </div>
    </TeacherSpace>
  )
}

/* ================================================================== *
 * الدرس: خطوات متتابعة داخل LessonFlow
 * ================================================================== */

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="morph-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

export function LessonMorphologyOne({ onProgressChange, onFinish }: Props) {
  const [testAnswers, setTestAnswers] = useState<AnswerMap>({})
  const [testResult, setTestResult] = useState<TestResult | null>(null)

  function setTestAnswer(questionId: string, fieldIndex: number, value: string[]) {
    setTestAnswers((current) => ({ ...current, [answerKey(questionId, fieldIndex)]: value }))
  }

  function submitTest() {
    setTestResult(gradeTest(C.testQuestions, testAnswers))
  }

  function restartTest() {
    setTestAnswers({})
    setTestResult(null)
  }

  const submitted = testResult !== null
  const testGroupSteps = C.testGroups.map((group) =>
    step(
      `test-${group.id}`,
      `${group.title}`,
      'الاختبار الإلكتروني',
      '📝',
      <TestGroupStep
        from={group.from}
        to={group.to}
        title={group.title}
        answers={testAnswers}
        submitted={submitted}
        onAnswer={setTestAnswer}
      />,
    ),
  )

  const steps: LessonStepDefinition[] = [
    step('intro', 'الدرس الأول: مدخل إلى علم الصرف', 'البداية', '📘', <IntroStep />),
    step('objectives', 'أهداف الدرس', 'البداية', '🎯', <Bullets items={C.objectives} />),

    step('definition', '1. ما علم الصرف؟', 'تعريف الصرف', '📖', <DefinitionStep />),
    step('topics', '2. ما موضوع علم الصرف؟', 'تعريف الصرف', '🧭', <TopicsStep />),
    step('sarf-nahw', '3. الفرق بين الصرف والنحو', 'تعريف الصرف', '⚖️', <SarfNahwStep />),
    step('structure', '4. ما المقصود ببنية الكلمة؟', 'تعريف الصرف', '🧱', <StructureStep />),

    step('root', '5. الجذر الصرفي والمادة', 'الجذر والأصول والزوائد', '🌱', <RootStep />),
    step('root-word', '6. الجذر والكلمة: الفرق', 'الجذر والأصول والزوائد', '🔀', <RootWordStep />),
    step('root-types', '7. الجذر الثلاثي والرباعي', 'الجذر والأصول والزوائد', '🔢', <RootTypesStep />),
    step('original-extra', '8. الحروف الأصلية والزائدة', 'الجذر والأصول والزوائد', '🔤', <OriginalExtraStep />),
    step('saalatum', '9. قاعدة «سألتمونيها» وحدودها', 'الجذر والأصول والزوائد', '🧩', <SaalaStep />),
    step('tools', '10. أدوات معرفة الحروف الأصلية', 'الجذر والأصول والزوائد', '🛠️', <ToolsStep />),
    step('original-lab', '11. مختبر الأصلي والزائد', 'الجذر والأصول والزوائد', '🧪', <OriginalLab />),
    step('family', '12. الاشتقاق وعائلة الكلمة', 'الجذر والأصول والزوائد', '🌳', <FamilyStep />),
    step('why-not-enough', '13. لماذا لا يحدد الجذر المعنى وحده؟', 'الجذر والأصول والزوائد', '💭', <WhyNotEnoughStep />),

    step('qaal', '14. «قال» وجذرها ق ـ و ـ ل', 'حالات تتطلب انتباهًا', '🔎', <WeakStep />),
    step('weak-lab', '15. «باع» و«دعا»: مختبر الجذور المعتلة', 'حالات تتطلب انتباهًا', '🧪', <WeakRootLab />),
    step('terms', '16. الجذر والاشتقاق والتصريف', 'حالات تتطلب انتباهًا', '🧠', <TermsStep />),
    step('shadda', '17. التضعيف في «علّم»', 'حالات تتطلب انتباهًا', '✨', <ShaddaStep />),
    step('hamza', '18. الهمزة الأصلية والهمزة الزائدة', 'حالات تتطلب انتباهًا', 'ء', <HamzaStep />),
    step('material', '19. الجذر والمادة، والحالات التي لا تُستعجل', 'حالات تتطلب انتباهًا', '⚠️', <MaterialStep />),

    step('weight-def', '20. تعريف الميزان الصرفي', 'الميزان الصرفي', '⚖️', <WeightDefStep />),
    step('weight-lab', '21. وزن «كتب» و«كاتب» و«مكتوب»', 'الميزان الصرفي', '🧮', <WeightLab />),
    step('weight-importance', '22. أهمية الميزان: الوزن أداة للتحليل', 'الميزان الصرفي', '🔍', <WeightImportanceStep />),

    step('changing', '23. الحروف الأصلية التي تتغير صورتها', 'التحليل والتطبيق', '🔄', <ChangingStep />),
    step('analysis', '24. الأمثلة التحليلية الأربعة', 'التحليل والتطبيق', '🔬', <AnalysisStep />),
    step('mindmap', '25. الخريطة الذهنية', 'التحليل والتطبيق', '🗺️', <MindMapLab />),
    step('golden', '26. القواعد الذهبية', 'التحليل والتطبيق', '⭐', <GoldenStep />),
    step('solved-1', '27. الأمثلة المحلولة (1–4)', 'التحليل والتطبيق', '📝', <SolvedStep from={0} to={4} />),
    step('solved-2', '28. الأمثلة المحلولة (5–8)', 'التحليل والتطبيق', '📝', <SolvedStep from={4} to={8} />),
    step('activity-1', '29. النشاط التطبيقي: الكلمات ١–٥', 'النشاط التطبيقي', '🎮', <ActivityGroupStep from={0} to={5} title="النشاط الأول" />),
    step('activity-2', '30. النشاط التطبيقي: الكلمات ٦–١٠', 'النشاط التطبيقي', '🧠', <ActivityGroupStep from={5} to={10} title="النشاط الثاني" />),
    step('activity-3', '31. النشاط التطبيقي: الكلمات ١١–١٥', 'النشاط التطبيقي', '🏁', <ActivityGroupStep from={10} to={15} title="النشاط الثالث" />),
    step('review-card', '32. بطاقة المراجعة', 'الخلاصة', '📇', <ReviewCardStep />),
    step('summary', '33. خلاصة الدرس', 'الخلاصة', '📌', <SummaryStep />),

    ...testGroupSteps,
    step('submit', 'تسليم الاختبار والنتيجة', 'الاختبار الإلكتروني', '✅', (
      <SubmitStep answers={testAnswers} result={testResult} onSubmit={submitTest} onRestart={restartTest} />
    )),
    step('solutions', 'حلول الاختبار', 'الاختبار الإلكتروني', '📗', (
      <SolutionsStep result={testResult} answers={testAnswers} />
    )),

    step('next-lesson', 'تمهيد الدرس الثاني', 'ما بعد الدرس', '➡️', <NextLessonStep />),
    step('teacher', 'منطقة خاصة بالمعلم', 'منطقة المعلم', '🔐', <TeacherArea />),
  ]

  return (
    <LessonFlow
      steps={steps}
      onProgressChange={onProgressChange}
      onFinish={onFinish}
      lessonTitle="مدخل إلى علم الصرف"
      lessonNumber="١"
      lessonEyebrow="القسم الثاني: الصرف"
    />
  )
}

function step(id: string, title: string, group: string, icon: string, content: ReactNode): LessonStepDefinition {
  return {
    id,
    title,
    shortTitle: title,
    group,
    icon,
    description: 'تعلّم بالتدرج، ثم طبّق ما فهمته.',
    render: () => content,
  }
}

/* ---------- محتوى الخطوات ---------- */

function IntroStep() {
  return (
    <>
      <p className="morph-hero">
        <span>{C.lessonFacts.level}</span>
        <span>{C.lessonFacts.type}</span>
      </p>
      <p>
        <strong>الكلمة والجذر والأصل والزيادة والاشتقاق.</strong> هذا الدرس هو أول درس في قسم الصرف، وهو
        مدخل إلى النظام الداخلي للكلمة العربية، وأساس لكل ما سيأتي بعده.
      </p>
      <Callout title="المتطلبات السابقة">{C.lessonFacts.prerequisites}</Callout>
      <p>
        ستمر بخمس مراحل متتابعة: مدخل إلى الصرف، ثم الجذر والأصول والزوائد، ثم الحالات التي تتطلب انتباهًا،
        ثم الميزان الصرفي، ثم التحليل والتطبيق والاختبار.
      </p>
    </>
  )
}

function DefinitionStep() {
  return (
    <>
      <Golden text={C.definitionText} />
      <p>ومن أمثلته أن ندرس العلاقة بين الصيغ التالية:</p>
      <Chips items={C.definitionFamily} />
      <p>{C.definitionFamilyNote}</p>
    </>
  )
}

function TopicsStep() {
  return (
    <>
      <p>يهتم علم الصرف، من بين أمور أخرى، بالموضوعات التالية:</p>
      <Chips items={C.sarfTopics} />
      <p>{C.topicsNote}</p>
    </>
  )
}

function SarfNahwStep() {
  return (
    <>
      <p>هذه من أهم النقاط التي يجب تثبيتها منذ البداية.</p>
      <Callout title="الصرف يدرس الكلمة من داخلها">
        <p>مثلًا: «كَتَبَ» نسأل صرفيًا:</p>
        <Bullets items={C.sarfQuestionsList} />
      </Callout>
      <Callout title="النحو يدرس الكلمة داخل الجملة">
        <p>مثلًا: «كَتَبَ الطالبُ الدرسَ.» نسأل نحويًا:</p>
        <Bullets items={C.nahwQuestionsList} />
      </Callout>
      <Golden text="الصرف يدرس بنية الكلمة وتصريفها واشتقاقها، والنحو يدرس وظيفة الكلمة وعلاقتها بما حولها في الجملة." />
      <SarfNahwLab />
    </>
  )
}

function StructureStep() {
  return (
    <>
      <p>
        الكلمات التالية بينها صلة واضحة، لكن بنيتها ليست واحدة، وهذا الاختلاف في البنية يرتبط باختلاف في المعنى:
      </p>
      <div className="morph-forms" role="list">
        {C.structureForms.map((item) => (
          <div key={item.word} className="morph-form" role="listitem">
            <p className="morph-big">
              <bdi>{item.word}</bdi>
            </p>
            <p>{item.meaning}</p>
          </div>
        ))}
      </div>
      <Golden text="تغيير البنية الصرفية قد يؤدي إلى تغيير المعنى، وهذه من أهم الأفكار التي سيُبنى عليها قسم الصرف كله." />
    </>
  )
}

function RootStep() {
  return (
    <>
      <p>{C.rootDefinition}</p>
      <p>ومن أشهر أنواع الجذور في العربية: الجذر الثلاثي والجذر الرباعي.</p>
      <div className="morph-diagram" aria-label="عائلة الجذر ك ت ب">
        <p className="morph-diagram__root">
          <RootLetters letters={C.kataba.root} />
          <span className="morph-muted">الجذر</span>
        </p>
        <div className="morph-diagram__family">
          {C.kataba.family.map((word) => (
            <span key={word} className="morph-diagram__word">
              <bdi>{word}</bdi>
            </span>
          ))}
        </div>
      </div>
      <p>تشترك هذه الكلمات في المادة الأصلية <bdi>ك ـ ت ـ ب</bdi> مع اختلاف الصيغ.</p>
    </>
  )
}

function RootWordStep() {
  return (
    <>
      <p>لا، الجذر ليس هو الكلمة نفسها.</p>
      <div className="morph-compare">
        <div>
          <span className="morph-muted">الجذر</span>
          <p className="morph-big">
            <bdi>{C.rootVsWord.root}</bdi>
          </p>
          <p>حروف أصلية، ليست كلمة مستقلة في هذا الاستعمال.</p>
        </div>
        <div>
          <span className="morph-muted">الكلمة</span>
          <p className="morph-big">
            <bdi>{C.rootVsWord.word}</bdi>
          </p>
          <p>صيغة صرفية كاملة.</p>
        </div>
      </div>
      <Golden text={C.rootVsWord.rule} />
    </>
  )
}

function RootTypesStep() {
  return (
    <>
      <Callout title={C.rootTypes.triliteral.title}>
        <p>{C.rootTypes.triliteral.text}</p>
        <Chips items={C.rootTypes.triliteral.examples} />
      </Callout>
      <Callout title={C.rootTypes.quadriliteral.title}>
        <p>{C.rootTypes.quadriliteral.text}</p>
        <Chips items={C.rootTypes.quadriliteral.examples} />
      </Callout>
      <Callout title="تنبيه مهم">
        <p>
          ليس كل فعل مكوّن من أربعة أحرف في الكتابة يكون جذره رباعيًا؛ فالكلمة <bdi>{C.quadWarning.word}</bdi> عدد
          حروفها الظاهرة أربعة، لكن جذرها <bdi>{C.quadWarning.root}</bdi>.
        </p>
        <p>{C.quadWarning.text}</p>
      </Callout>
      <Golden text={C.quadWarning.rule} />
    </>
  )
}

function OriginalExtraStep() {
  return (
    <>
      <Callout title="الحرف الأصلي">{C.originalExtra.original}</Callout>
      <Callout title="الحرف الزائد">{C.originalExtra.extra}</Callout>
      <p>
        في <bdi>{C.originalExtra.example.word}</bdi>: {C.originalExtra.example.text}
      </p>
      <p>
        في <bdi>{C.originalExtra.example2.word}</bdi>: {C.originalExtra.example2.text}
      </p>
      <Clarification>{C.originalExtra.warning}</Clarification>
    </>
  )
}

function SaalaStep() {
  return (
    <>
      <Golden text={C.saalaTamoonihaa.rule} />
      <div className="morph-chips morph-chips--letters" aria-label="حروف سألتمونيها">
        {C.saalaTamoonihaa.letters.map((letter, index) => (
          <span key={`${letter}-${index}`} className="morph-root__letter">
            {letter}
          </span>
        ))}
      </div>
      {C.saalaTamoonihaa.cases.map((item) => (
        <p key={item.word}>
          <bdi>{item.word}</bdi>: {item.text}
        </p>
      ))}
      <Callout title="حدود القاعدة">{C.saalaTamoonihaa.lesson}</Callout>
    </>
  )
}

function ToolsStep() {
  return (
    <>
      <p>لا توجد طريقة واحدة تعتمد على النظر السريع إلى الكلمة، بل نعتمد على مجموعة أدوات صرفية:</p>
      <ol className="morph-tools">
        {C.originalTools.map((tool) => (
          <li key={tool.id}>
            <strong>{tool.title}.</strong> {tool.text}
          </li>
        ))}
      </ol>
    </>
  )
}

function FamilyStep() {
  return (
    <>
      <p>
        من أفضل الطرق لفهم الجذر أن ننظر إلى <strong>عائلة الكلمة</strong>. الكلمات ليست متطابقة في الصيغة، لكن
        بينها صلة اشتقاقية، وتعود مجموعة منها إلى المادة نفسها. ما الذي تغيّر؟ الجذر بقي، لكن الصيغ اختلفت، وهذا
        يؤدي إلى اختلاف المعنى.
      </p>
      <FamilyLab />
    </>
  )
}

function WhyNotEnoughStep() {
  return (
    <>
      <p>من الخطأ أن نقول: «إذا عرفت الجذر فقد عرفت معنى الكلمة كاملًا».</p>
      <p>
        الجذر يعطيك نواة دلالية أو صلة بالمادة اللغوية، لكن الصيغة والسياق لهما دور أساسي. فـ«عَلِمَ» و«عَلَّمَ»
        و«تَعَلَّمَ» و«اسْتَعْلَمَ» تشترك في الجذر، وتختلف في المعنى.
      </p>
      <Golden text="الجذر + الصيغة + السياق = فهم أدق للمعنى." />
    </>
  )
}

function WeakStep() {
  return (
    <>
      <p>
        قد ينظر المبتدئ إلى <bdi>قال</bdi> فيظن أن حروفها الأصلية: <bdi>ق ـ ا ـ ل</bdi>. لكن الجذر هو{' '}
        <bdi>ق ـ و ـ ل</bdi>. فأين ذهبت الواو؟
      </p>
      <p>
        طرأ على الكلمة تغيير صوتي وصرفي يسمى من أبواب <strong>الإعلال</strong>. وهذا يعني أن: الحرف الأصلي قد
        لا يظهر في الكلمة بصورته الأصلية. وسندرس الإعلال بالتفصيل في باب الفعل المعتل.
      </p>
      <Golden text="لا نستخرج الجذر دائمًا من ظاهر الكلمة فقط." />
    </>
  )
}

function ChangingStep() {
  return (
    <>
      <p>{C.changingLetters}</p>
      <Bullets items={['إعلال.', 'إبدال.', 'حذف.', 'قلب.', 'إدغام.']} />
      <p>
        <bdi>قال ← ق و ل</bdi> — <bdi>باع ← ب ي ع</bdi> — <bdi>دعا ← د ع و</bdi>
      </p>
    </>
  )
}

function TermsStep() {
  return (
    <>
      <p>يجب التفريق بين ثلاثة مفاهيم قبل أن تتداخل في الدروس القادمة:</p>
      <div className="morph-terms">
        {C.termsCompare.map((term) => (
          <article key={term.title} className="morph-term">
            <h4>{term.title}</h4>
            <p>{term.text}</p>
            <p className="morph-muted">
              <bdi>{term.example}</bdi>
            </p>
          </article>
        ))}
      </div>
    </>
  )
}

function ShaddaStep() {
  return (
    <>
      <p>
        انظر إلى <bdi>{C.shaddaNote.word}</bdi>: {C.shaddaNote.text}
      </p>
      <Golden text="الشدة قد تخفي حرفين متماثلين، ولا يعني ذلك بالضرورة أن الجذر رباعي." />
    </>
  )
}

function HamzaStep() {
  return (
    <>
      <p>
        الهمزة قد تكون حرفًا أصليًا في الجذر، أو جزءًا من صيغة صرفية، لذلك لا يجوز اعتبار كل همزة حرفًا زائدًا.
      </p>
      <div className="morph-compare">
        <div>
          <p className="morph-big">
            <bdi>{C.hamzaNote.asl.word}</bdi>
          </p>
          <p>جذرها <bdi>{C.hamzaNote.asl.root}</bdi>: {C.hamzaNote.asl.text}</p>
        </div>
        <div>
          <p className="morph-big">
            <bdi>{C.hamzaNote.zaid.word}</bdi>
          </p>
          <p>جذرها <bdi>{C.hamzaNote.zaid.root}</bdi>: {C.hamzaNote.zaid.text}</p>
        </div>
      </div>
      <Golden text={C.hamzaNote.question} />
    </>
  )
}

function MaterialStep() {
  return (
    <>
      <Callout title="تنبيه علمي: الجذر والمادة">
        <p>{C.rootMaterialNote}</p>
      </Callout>
      <p>
        <strong>حالات لا يجوز فيها التسرع في استخراج الجذر:</strong>
      </p>
      <div className="morph-cases">
        {C.hastyCases.map((item) => (
          <article key={item.title} className="morph-case">
            <h4>{item.title}</h4>
            <p className="morph-big">
              <bdi>{item.word}</bdi>
            </p>
            <p>{item.text}</p>
          </article>
        ))}
      </div>
    </>
  )
}

function WeightDefStep() {
  return (
    <>
      <Golden text={C.weightIntro.definition} />
      <p>{C.weightIntro.whyFaEaL}</p>
      <div className="morph-weight-map" aria-label="حروف الميزان">
        <span className="morph-root__letter">ف</span>
        <span className="morph-root__letter">ع</span>
        <span className="morph-root__letter">ل</span>
      </div>
      <p>
        مثال: «كتب» ← ك ↔ ف، ت ↔ ع، ب ↔ ل، فيكون الوزن <bdi>فَعَلَ</bdi>.
      </p>
    </>
  )
}

function WeightImportanceStep() {
  return (
    <>
      <p>الميزان يساعدنا على:</p>
      <Bullets items={C.weightImportance} />
      <Chips items={C.weightExamples} />
      <Callout title="الوزن ليس مجرد حفظ">
        <p>{C.weightNotMemorize}</p>
      </Callout>
    </>
  )
}

function AnalysisStep() {
  return (
    <>
      <p>نحلل أربع كلمات تحليلًا متقدمًا، نبحث فيها عن العائلة قبل الحكم على الجذر:</p>
      <div className="morph-cases">
        {C.analysisExamples.map((item) => (
          <article key={item.word} className="morph-case">
            <h4>
              <bdi>{item.word}</bdi>
            </h4>
            <p>
              العائلة: <Chips items={item.family} />
            </p>
            <p>
              الجذر: <RootLetters letters={item.root} />
            </p>
            <p>{item.note}</p>
          </article>
        ))}
      </div>
    </>
  )
}

function GoldenStep() {
  return (
    <>
      <p>عندما تريد استخراج جذر كلمة، لا تسأل: «ما أول ثلاثة أحرف فيها؟» بل اسأل:</p>
      <Golden text="ما الحروف التي تمثل أصل المادة، بعد أن أراعي الصيغة والتصريف وما قد يكون طرأ على الكلمة من تغيير؟" />
      <ol className="morph-rules">
        {C.goldenRules.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ol>
    </>
  )
}

function SolvedStep({ from, to }: { from: number; to: number }) {
  const items = C.solvedExamples.slice(from, to)
  return (
    <div className="morph-solved">
      {items.map((example) => (
        <article key={example.id} className="morph-case">
          <h4>
            المثال {example.id}: <bdi>{example.word}</bdi>
          </h4>
          <p>
            الجذر: <bdi>{example.root}</bdi>
          </p>
          <p>
            الوزن: <bdi>{example.weight}</bdi>
          </p>
          <p>{example.note}</p>
        </article>
      ))}
      {from === 0 && (
        <p className="morph-muted">
          حاول أن تحلل كل كلمة قبل قراءة ما بعدها، ثم انتقل إلى المثال التالي.
        </p>
      )}
    </div>
  )
}

function ReviewCardStep() {
  return (
    <section className="morph-review" aria-labelledby="review-title">
      <h3 id="review-title">بطاقة المراجعة السريعة</h3>
      <table className="morph-table">
        <thead>
          <tr>
            <th scope="col">المفهوم</th>
            <th scope="col">معناه في الصرف</th>
          </tr>
        </thead>
        <tbody>
          {C.reviewCard.map((row) => (
            <tr key={row.term}>
              <th scope="row">{row.term}</th>
              <td>{row.meaning}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

function SummaryStep() {
  return (
    <>
      {C.summaryText.map((line) => (
        <p key={line}>{line}</p>
      ))}
      <p>ولفهم الكلمة فهمًا صرفيًا متينًا، ينبغي أن نسأل:</p>
      <ol className="morph-summary-questions">
        {C.summaryQuestions.map((question) => (
          <li key={question}>{question}</li>
        ))}
      </ol>
    </>
  )
}

function NextLessonStep() {
  return (
    <>
      <p className="morph-big">{C.nextLesson.title}</p>
      <p>{C.nextLesson.intro}</p>
      <Bullets items={C.nextLesson.topics} />
      <Golden text={C.nextLesson.closing} />
    </>
  )
}
