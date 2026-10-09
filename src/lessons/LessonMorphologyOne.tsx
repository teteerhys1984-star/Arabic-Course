import { useState, type ReactNode } from 'react'
import { LessonFlow, type LessonStepDefinition } from '../shared/components/LessonFlow'
import { TeacherSpace } from '../shared/teacher/TeacherSpace'
import { COURSE_TEACHER_PASSWORD } from '../shared/teacher/teacherPassword'
import * as C from './morphology-lesson-01/content'
import {
  SolutionsArea,
  TestPageView,
  answeredCount,
  autoFields,
  looseKey,
  normalizeAnswer,
  useTestEngine,
  type TestDefinition,
  type TestEngine,
  type TestQuestion,
} from '../shared/test'


/* ================================================================== *
 * اختبار الدرس — shared platform test framework (src/shared/test).
 * The six source groups become six checkable pages, each ending with
 * «تحقّق من الإجابات». Essay parts (التعليل والتفكير) are manual-review;
 * source-provided answers (1–40) are shown with their source badge.
 * ================================================================== */

function toTestQuestion(question: C.MorphTestQuestion): TestQuestion {
  return {
    id: question.id,
    number: question.number,
    type: question.type,
    prompt: question.prompt,
    fields: question.fields,
    explanation: question.explanation,
    teacherAnswer: question.teacherAnswer,
    sourceAnswer: question.number <= 40 ? C.sourceAnswers[question.number] : undefined,
    answerSource: question.number <= 40 ? 'source' : 'platform',
  }
}

/** The lesson's test, declared once in the shared platform schema. */
// eslint-disable-next-line react-refresh/only-export-components -- the test schema is lesson data, not a component.
export const testDefinition: TestDefinition = { id: 'morphology-lesson-01-test', title: 'اختبار الدرس الأول', matching: 'strict',
  description: C.testSubtitle,
  pages: C.testGroups.map((group) => ({
    id: group.id,
    title: group.title,
    questions: C.testQuestions
      .filter((question) => question.number >= group.from && question.number <= group.to)
      .map(toTestQuestion),
  })),
}

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
      <p className="morph-muted">
        ملاحظة: التحليل المفصّل للكلمات في هذا المختبر توضيح تعليمي من إعداد المنصة، لا نص مقتبس من المصدر.
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
      <p>
        <strong>مثال يجمع العلمين:</strong> في:
      </p>
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
          <p className="morph-muted">
            توضيح تعليمي من المنصة: الصيغة والوزن وشرح العلاقة بالجذر في هذا المختبر من إعداد المنصة، وليست نصًا مقتبسًا من المصدر.
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
      <p>
        مثال آخر: «باع». قد توحي حروفها الظاهرة بأن أصلها: ب ـ ا ـ ع، لكن جذرها: ب ـ ي ـ ع. والألف الظاهرة مرتبطة
        بالتغير الصرفي الذي طرأ على الياء. إذن: باع ← ب ي ع، وليس: ب ا ع.
      </p>
      <p>
        مثال: «دعا». الجذر: د ـ ع ـ و. والكلمة الظاهرة: دعا. فالألف في آخر الكلمة ليست هي الحرف الأصلي الثالث في
        الجذر، بل طرأ تغيير صرفي على الواو.
      </p>
      <p>وهذه الأمثلة مهمة جدًا لأنها تعلمنا قاعدة عميقة:</p>
      <Golden text="لا نستخرج الجذر دائمًا من ظاهر الكلمة فقط." />
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
      {C.weightWorked.map((block) => (
        <article key={block.heading} className="morph-case">
          <h4>{block.heading}</h4>
          {block.lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </article>
      ))}
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
      <p>احفظ العلاقة الآتية:</p>
      <p>اقرأ الخريطة من اليمين إلى اليسار، ثم اضغط كل عقدة لترى ما تمثله. أسماء العقد من المصدر، وشرح كل عقدة توضيح تعليمي من المنصة.</p>
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
      <p>وهذه الخريطة سترافقنا في دراسة الصرف كله.</p>
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

/**
 * الوزن يُصحَّح حين يُكتب: الفراغ لا يُحسب خطأً (يظهر «لم يُكتب» بلا حكم)، والكلمة التي
 * لها وزن في المستوى تُقارن أحرف الوزن بعد إزالة الحركات. الكلمات بلا وزن معلن لا تُحسب.
 */
type WeightState = 'blank' | 'ok' | 'wrong' | 'not-required'

function checkWeight(word: C.ActivityWord, value: string): WeightState {
  if (!word.weight) return 'not-required'
  if (looseKey(value) === '') return 'blank'
  return looseKey(value) === looseKey(word.weight) ? 'ok' : 'wrong'
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
    weight: checkWeight(word, values.weight),
  }
}

function rowIsCorrect(result: ReturnType<typeof checkActivityRow>): boolean {
  return Object.entries(result).every(([key, value]) => {
    if (key === 'weight') return value === 'ok' || value === 'not-required' || value === 'blank'
    return value === true
  })
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
      <p>{C.activityInstructions.start}</p>
      <p>{C.activityInstructions.request}</p>
      <Bullets items={C.activityInstructions.items} />
      <p className="morph-muted">{C.activityInstructions.platformNote}</p>
      <p className="morph-muted">
        توضيح تعليمي من المنصة: حلّل كل كلمة بنفسك أولًا. الجذر والعدد والحروف الزائدة والتضعيف والتغيير والوزن (حين
        يُطلب) حقول مُصحَّحة. أما كلمة العائلة فاختيارية ولا تُصحَّح آليًا.
      </p>
      <div className="morph-activity__rows">
        {words.map((word) => {
          const current = values[word.id] ?? emptyActivity
          const result = checked[word.id] ? checkActivityRow(word, current) : null
          const rowOk = result ? rowIsCorrect(result) : false
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
                  <span>{word.weight ? 'الوزن' : 'الوزن (لا يُطلب لهذه الكلمة)'}</span>
                  <input
                    value={current.weight}
                    aria-label={`وزن ${word.word}`}
                    disabled={!word.weight}
                    onChange={(event) => update(word.id, 'weight', event.target.value)}
                  />
                </label>
                <label>
                  <span>كلمة من العائلة (اختياري، لا تُصحَّح آليًا)</span>
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
                    <li>
                      الوزن:{' '}
                      {result.weight === 'ok' && 'صحيح'}
                      {result.weight === 'wrong' && `غير صحيح؛ الصحيح: ${word.weight}`}
                      {result.weight === 'blank' && `لم يُكتب (الصحيح: ${word.weight}، ولم يُحسب خطأً)`}
                      {result.weight === 'not-required' && 'لا يُطلب لهذه الكلمة'}
                    </li>
                  </ul>
                  <p>
                    كلمة من العائلة (مثال للمقارنة): <bdi>{word.family}</bdi>
                  </p>
                  <p>توضيح تعليمي من المنصة: {word.explanation}</p>
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
 * اختبار المنصة: كل مجموعة صفحة قابلة للتحقق — shared test framework
 * ================================================================== */

/** The final step: combines the latest valid page results into the final result. */
function SubmitStep({ engine }: { engine: TestEngine }) {
  const answered = answeredCount(C.testQuestions, engine.answers)
  const { finalResult, allPagesChecked } = engine
  // The automatic degree covers the automatically gradable questions only
  // (objective + roots + the automatic part of the analysis questions).
  const autoTotal = C.testQuestions.filter((question) => autoFields(question).length > 0).length

  return (
    <section className="morph-submit" aria-labelledby="submit-title">
      <h3 id="submit-title">تسليم الاختبار والنتيجة</h3>
      <p>
        أجبت عن <bdi>{answered}</bdi> من <bdi>45</bdi> سؤالًا.
      </p>
      <p className="morph-muted">{C.manualReviewNote}</p>
      {!allPagesChecked ? (
        <p>تحقّق من كل صفحة أولًا («تحقّق من الإجابات» في نهاية كل صفحة) لتظهر النتيجة النهائية.</p>
      ) : (
        <div role="status">
          <p className="morph-score">
            النتيجة الآلية: <bdi>{finalResult.correct} / {autoTotal}</bdi>
          </p>
          <ul className="morph-counts">
            <li>
              إجابات صحيحة: <bdi>{finalResult.correct}</bdi>
            </li>
            <li>
              إجابات خاطئة: <bdi>{finalResult.wrong}</bdi>
            </li>
            <li>
              أسئلة غير مجابة: <bdi>{finalResult.unanswered}</bdi>
            </li>
            <li>
              أسئلة للمراجعة مع المعلم: <bdi>{finalResult.manual}</bdi>
            </li>
          </ul>
          <ul className="morph-counts morph-counts--types">
            {C.testGroups.map((group) => {
              const stats = finalResult.byGroup[group.type] ?? { total: 0, correct: 0 }
              return (
                <li key={group.id}>
                  {group.type}: <bdi>{stats.correct} / {stats.total}</bdi>
                </li>
              )
            })}
          </ul>
          <button type="button" className="button button--secondary" onClick={engine.resetTest}>
            إعادة الاختبار
          </button>
        </div>
      )}
    </section>
  )
}

/* ================================================================== *
 * منطقة المعلم: محمية بكلمة المرور المعتمدة للمشروع
 * ================================================================== */

function TeacherArea() {
  return (
    <TeacherSpace password={COURSE_TEACHER_PASSWORD}>
      <div className="teacher-material teacher-material--morphology1">
        <h3>أ. الإجابات النموذجية التفصيلية للاختبار (45 سؤالًا)</h3>
        <p>
          الأسئلة 1–40 لها جواب معتمد من المصدر، ويُعرض أولًا. ما يلي كل جواب من توضيح تعليمي من المنصة.
          الأسئلة 41–45 لم يرد لها جواب في المصدر؛ والإجابات الواردة لها نماذج من إعداد المنصة، ويُقبل أي جواب
          تعبيري صحيح.
        </p>
        <SolutionsArea test={testDefinition} mode="teacher" title="الإجابات النموذجية التفصيلية للاختبار" eyebrow="منطقة المعلم" />

        <h3>ب. حلول النشاط التطبيقي (15 كلمة): من إعداد المنصة</h3>
        <p>لم يرد في المصدر حل لأسئلة النشاط التطبيقي؛ الحلول التالية توضيح تعليمي من المنصة.</p>
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
        <p>الشروح المعروضة هنا نص المصدر؛ والأوزان المعلَّمة «توضيح تعليمي» من المنصة.</p>
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
  // The shared test engine lives here, above LessonFlow, so answers and page
  // results survive step navigation (see docs/lesson-test-standards.md).
  const testEngine = useTestEngine(testDefinition)

  const testGroupSteps = C.testGroups.map((group) => {
    const page = testDefinition.pages.find((item) => item.id === group.id)
    if (!page) throw new Error(`Missing test page for group ${group.id}`)
    return step(`test-${group.id}`, `${group.title}`, 'الاختبار الإلكتروني', '📝', (
      <TestPageView page={page} engine={testEngine} questionTestIdPrefix="morph-question" />
    ))
  })

  const steps: LessonStepDefinition[] = [
    step('intro', 'الدرس الأول: مدخل إلى علم الصرف', 'البداية', '📘', <IntroStep />),
    step('objectives', 'أهداف الدرس', 'البداية', '🎯', (
      <>
        <p>بعد دراسة هذا الدرس دراسة متقنة، يُفترض أن يكون الطالب قادرًا على:</p>
        <Bullets items={C.objectives} />
      </>
    )),

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
    step('submit', 'تسليم الاختبار والنتيجة', 'الاختبار الإلكتروني', '✅', <SubmitStep engine={testEngine} />),
    step('solutions', 'حلول الاختبار', 'الاختبار الإلكتروني', '📗', (
      <SolutionsArea test={testDefinition} engine={testEngine} testId="morphology-solutions" title="حلول اختبار الدرس الأول" />
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
        <strong>الكلمة والجذر والأصل والزيادة والاشتقاق.</strong>
      </p>
      <p className="morph-muted">
        توضيح تعليمي من المنصة: هذا الدرس هو أول درس في قسم الصرف، وهو مدخل إلى النظام الداخلي للكلمة العربية،
        وأساس لكل ما سيأتي بعده.
      </p>
      <Callout title="المتطلبات السابقة">{C.lessonFacts.prerequisites}</Callout>
      <p>
        توضيح تعليمي من المنصة: ستمر بخمس مراحل متتابعة: مدخل إلى الصرف، ثم الجذر والأصول والزوائد، ثم الحالات التي تتطلب انتباهًا،
        ثم الميزان الصرفي، ثم التحليل والتطبيق والاختبار.
      </p>
    </>
  )
}

function DefinitionStep() {
  return (
    <>
      <Golden text={C.definitionText} />
      <p>ومن أمثلته أن ندرس العلاقة بين:</p>
      <Chips items={C.definitionFamily} />
      <p>{C.definitionFamilyNote}</p>
    </>
  )
}

function TopicsStep() {
  return (
    <>
      <p>يهتم علم الصرف، من بين أمور أخرى، بـ:</p>
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
        <p>هذه أسئلة صرفية.</p>
      </Callout>
      <p>أما النحو فيدرس الكلمة داخل الجملة</p>
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
        عندما نقول إن الصرف يدرس <strong>بنية الكلمة</strong>، فنحن نقصد الصورة التي تتكوّن منها الكلمة، والعلاقات بين
        حروفها الأصلية والزوائد والصيغة التي جاءت عليها.
      </p>
      <p>قارن:</p>
      <p>
        نلاحظ أن بينها صلة واضحة، لكن بنيتها ليست واحدة.
      </p>
      <p>مثلًا:</p>
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
      <p>وهذا الاختلاف في البنية يرتبط باختلافات في المعنى.</p>
      <Golden text="تغيير البنية الصرفية قد يؤدي إلى تغيير المعنى، وهذه من أهم الأفكار التي سيُبنى عليها قسم الصرف كله." />
    </>
  )
}

function RootStep() {
  return (
    <>
      <p>{C.rootDefinition}</p>
      <p>ومن أشهر أنواع الجذور في العربية: الجذر الثلاثي والجذر الرباعي.</p>
      <p>ومن الكلمات المرتبطة به:</p>
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
      <p>لا.</p>
      <p>وهذه نقطة أساسية.</p>
      <div className="morph-compare">
        <div>
          <span className="morph-muted">الجذر</span>
          <p className="morph-big">
            <bdi>{C.rootVsWord.root}</bdi>
          </p>
          <p>ليس كلمة مستقلة في هذا الاستعمال، وإنما هو تمثيل للحروف الأصلية التي تقوم عليها مجموعة من الكلمات.</p>
        </div>
        <div>
          <span className="morph-muted">الكلمة</span>
          <p className="morph-big">
            <bdi>{C.rootVsWord.word}</bdi>
          </p>
          <p>فهي كلمة وصيغة صرفية كاملة.</p>
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
        <p>{C.quadWarning.text}</p>
        <p>
          {C.quadWarning.example} <bdi>{C.quadWarning.root}</bdi>.
        </p>
        <p>{C.quadWarning.reason}</p>
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
      <p>
        <strong>تنبيه بالغ الأهمية</strong>
      </p>
      <Clarification>{C.originalExtra.warning}</Clarification>
    </>
  )
}

function SaalaStep() {
  return (
    <>
      <p>
        <strong>هل كل حرف من حروف «سألتمونيها» زائد؟</strong>
      </p>
      <p>{C.saalaTamoonihaa.rule}</p>
      <div className="morph-chips morph-chips--letters" aria-label="حروف سألتمونيها">
        {C.saalaTamoonihaa.letters.map((letter, index) => (
          <span key={`${letter}-${index}`} className="morph-root__letter">
            {letter}
          </span>
        ))}
      </div>
      <p>{C.saalaTamoonihaa.caution}</p>
      <Golden text={C.saalaTamoonihaa.misread} />
      <p>مثلًا:</p>
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
      <p>
        <strong>كيف نعرف الحروف الأصلية؟</strong>
      </p>
      <p>لا توجد طريقة صحيحة واحدة تعتمد على النظر السريع إلى الكلمة.</p>
      <p>بل نعتمد على مجموعة من الأدوات الصرفية، أهمها:</p>
      <ol className="morph-tools">
        {C.originalTools.map((tool) => (
          <li key={tool.id}>
            <strong>{tool.title}</strong>
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
        من أفضل الطرق لفهم الجذر أن ننظر إلى <strong>عائلة الكلمة</strong>.
      </p>
      <p>
        خذ الجذر: <RootLetters letters={['ع', 'ل', 'م']} /> ومنه:
      </p>
      <p>هذه الكلمات ليست متطابقة في الصيغة، ولكن بينها صلة اشتقاقية أو صرفية، وتعود مجموعة منها إلى المادة نفسها.</p>
      <p>ما الذي تغيّر؟</p>
      <p>
        الجذر بقي: <RootLetters letters={['ع', 'ل', 'م']} />
      </p>
      <p>لكن الصيغ اختلفت. وهذا يؤدي إلى اختلاف المعنى.</p>
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
      <p>لذلك يجب أن نفكر بهذه الصورة:</p>
      <Golden text="الجذر + الصيغة + السياق = فهم أدق للمعنى." />
    </>
  )
}

function WeakStep() {
  return (
    <>
      <p>هذه من أهم النقاط التي يجب أن يتعلمها الطالب المتقدم.</p>
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
      <p>هذه قاعدة متقدمة يجب أن يعرفها الطالب منذ البداية:</p>
      <p>قد يحدث للحرف الأصلي:</p>
      <Bullets items={['إعلال.', 'إبدال.', 'حذف.', 'قلب.', 'إدغام.']} />
      <p>ولذلك قد تختلف صورة الجذر في بعض الكلمات عن صورته الظاهرة.</p>
      <p>
        <bdi>قال ← ق و ل</bdi> — <bdi>باع ← ب ي ع</bdi> — <bdi>دعا ← د ع و</bdi>
      </p>
      <p>وسندرس أسباب هذه التغيرات في أبواب مستقلة.</p>
    </>
  )
}

function TermsStep() {
  return (
    <>
      <p>يجب التفريق بين ثلاثة مفاهيم:</p>
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
      <p>وهذه المفاهيم ستتداخل في الدروس القادمة، ولذلك يجب تأسيس الفرق بينها من الآن.</p>
    </>
  )
}

function ShaddaStep() {
  return (
    <>
      <p>
        ماذا عن التضعيف؟ انظر إلى <bdi>{C.shaddaNote.word}</bdi>: {C.shaddaNote.text}
      </p>
      <Golden text="الشدة قد تخفي حرفين متماثلين، ولا يعني ذلك بالضرورة أن الجذر رباعي." />
      <p>{C.shaddaNote.after}</p>
    </>
  )
}

function HamzaStep() {
  return (
    <>
      <p>
        <strong>ماذا عن الهمزة؟</strong>
      </p>
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
      <p>إذن يجب أن نسأل دائمًا:</p>
      <Golden text={C.hamzaNote.question} />
    </>
  )
}

function MaterialStep() {
  return (
    <>
      <Callout title="تنبيه علمي: الجذر والمادة">
        {C.rootMaterialNote.map((line) => (
          <p key={line}>{line}</p>
        ))}
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
      <p>فنقابل:</p>
      <Bullets items={C.weightIntro.mapping} />
      <p>نضع مقابل كل حرف أصلي حرفًا من «فعل»:</p>
      <p>
        ك ← ف، ت ← ع، ب ← ل. إذن: <bdi>كَتَبَ ← فَعَلَ</bdi>
      </p>
    </>
  )
}

function WeightImportanceStep() {
  return (
    <>
      <p>
        <strong>لماذا نحتاج إلى الميزان الصرفي؟</strong>
      </p>
      <p>لأن الوزن يساعدنا على:</p>
      <Bullets items={C.weightImportance} />
      <Chips items={C.weightExamples} />
      <p>وهذه الأوزان ستصبح لغة أساسية في قسم الصرف.</p>
      <Callout title="الوزن ليس مجرد حفظ">
        {C.weightNotMemorize.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </Callout>
    </>
  )
}

function AnalysisStep() {
  return (
    <>
      <p>توضيح تعليمي من المنصة: نحلل أربع كلمات تحليلًا متقدمًا، ونبحث فيها عن العائلة قبل الحكم على الجذر.</p>
      <p>نبحث عن عائلة الكلمة:</p>
      <div className="morph-cases">
        {C.analysisExamples.map((item) => (
          <article key={item.word} className="morph-case">
            <h4>
              <bdi>{item.word}</bdi>
            </h4>
            <div>
              <span>العائلة: </span>
              <Chips items={item.family} />
            </div>
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
      <p>وهذه النقلة في التفكير هي بداية الانتقال من الصرف المدرسي البسيط إلى الصرف المتقدم.</p>
      <p>احفظ هذه القواعد:</p>
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
          توضيح تعليمي من المنصة: حاول أن تحلل كل كلمة قبل قراءة ما بعدها، ثم انتقل إلى المثال التالي.
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
            <th scope="col">معناه الصرفي</th>
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
      <p>{C.summaryText[0]}</p>
      <p>ولفهم الكلمة فهمًا صرفيًا متينًا، ينبغي أن نسأل:</p>
      <ol className="morph-summary-questions">
        {C.summaryQuestions.map((question) => (
          <li key={question}>{question}</li>
        ))}
      </ol>
      {C.summaryText.slice(1).map((line) => (
        <p key={line}>{line}</p>
      ))}
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
