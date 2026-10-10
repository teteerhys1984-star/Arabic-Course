import { useState, type ReactNode } from 'react'
import { LessonFlow, type LessonStepDefinition } from '../shared/components/LessonFlow'
import { TeacherSpace } from '../shared/teacher/TeacherSpace'
import { COURSE_TEACHER_PASSWORD } from '../shared/teacher/teacherPassword'
import * as C from './morphology-lesson-02/content'
import {
  SolutionsArea,
  TestPageView,
  answeredCount,
  useTestEngine,
  type TestDefinition,
  type TestEngine,
} from '../shared/test'
import {
  ANALYSIS_PAGE_ID,
  arabicDigits,
  computeMarks,
  countedAnalysisIds,
  formatMarks,
  looseKey,
  sameSet,
  TEST_TOTALS,
} from './morphology-lesson-02/grading'

/** اختبار الدرس — معلن مرة واحدة بالمخطط المشترك (src/shared/test). */
// eslint-disable-next-line react-refresh/only-export-components -- the test schema is lesson data, not a component.
export const testDefinition: TestDefinition = C.testDefinition

interface Props {
  onProgressChange?: (value: number) => void
  onFinish?: () => void
}

/* ================================================================== *
 * عناصر مشتركة داخل الدرس
 * ================================================================== */

function Callout({ children, title = 'قاعدة' }: { children: ReactNode; title?: string }) {
  return (
    <aside className="morph2-callout">
      <strong>{title}</strong>
      <div>{children}</div>
    </aside>
  )
}

/** توضيح مصنّف بوضوح على أنه إضافة تعليمية من المنصة، لا نص من المصدر. */
function Clarification({ children }: { children: ReactNode }) {
  return (
    <aside className="morph2-clarification">
      <span className="morph2-clarification__badge">توضيح تعليمي من المنصة</span>
      <div>{children}</div>
    </aside>
  )
}

/** تصحيح معتمد على نص المصدر، موثّق في سجل التدقيق (خ-١ … خ-٤). */
function Correction({ children, id }: { children: ReactNode; id: string }) {
  return (
    <aside className="morph2-correction">
      <span className="morph2-correction__badge">تصحيح معتمد <bdi>{id}</bdi></span>
      <div>{children}</div>
    </aside>
  )
}

/** يفصل عنوان السطر في المصدر («قاعدة ذهبية:») عن نصّه. */
function splitLabel(line: string): [string, string] {
  const index = line.indexOf(': ')
  return index === -1 ? ['', line] : [line.slice(0, index + 1), line.slice(index + 2).trim()]
}

/** نص السطر بعد عنوانه («قاعدة: …»، «تنبيه مهم: …»). */
function afterLabel(line: string) {
  return splitLabel(line)[1]
}

function Golden({ text }: { text: string }) {
  const [label, body] = splitLabel(text)
  return (
    <div className="morph2-golden">
      <span aria-hidden="true">⭐</span>
      <p>
        {label && <strong>{label}</strong>} {body}
      </p>
    </div>
  )
}

function Bullets({ items }: { items: readonly string[] }) {
  return (
    <ul className="morph2-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

function Chips({ items }: { items: readonly string[] }) {
  return (
    <div className="morph2-chips">
      {items.map((item) => (
        <bdi key={item}>{item}</bdi>
      ))}
    </div>
  )
}

/** حروف الجذر منفصلة بوضوح، من اليمين إلى اليسار كما تُكتب الكلمة. */
function RootLetters({ letters, label = 'الجذر' }: { letters: readonly string[]; label?: string }) {
  return (
    <span className="morph2-root" role="img" aria-label={`${label}: ${letters.join(' ')}`}>
      {letters.map((letter, index) => (
        <span key={`${letter}-${index}`} className="morph2-root__letter" aria-hidden="true">
          {letter}
        </span>
      ))}
    </span>
  )
}

/** جدول مقابلة حروف الكلمة بحروف الميزان. */
function MappingTable({ rows }: { rows: readonly C.MappingRow[] }) {
  return (
    <table className="morph2-table morph2-table--mapping">
      <caption className="morph2-caption">مقابلة حروف الكلمة بحروف الميزان</caption>
      <thead>
        <tr>
          <th scope="col">حرف الكلمة</th>
          <th scope="col">حرف الميزان</th>
          <th scope="col">ملاحظة</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={`${row.letter}-${index}`} className={row.extra ? 'morph2-row--extra' : undefined}>
            <td>
              <bdi>{row.letter}</bdi>
              {row.extra && <span className="morph2-tag">زائد</span>}
            </td>
            <td>
              <bdi>{row.pattern}</bdi>
            </td>
            <td>{row.note ?? (row.extra ? 'حرف زائد في هذه الصيغة' : 'حرف أصلي')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

interface MappingItem {
  word: string
  weight: string
  rows: readonly C.MappingRow[]
}

/** مختبر المقابلة: اختر كلمة، فتظهر مقابلة حروفها بحروف الميزان. */
function MappingExplorer({ items, label }: { items: readonly MappingItem[]; label: string }) {
  const [selected, setSelected] = useState(0)
  const item = items[selected] ?? items[0]
  return (
    <div className="morph2-lab" data-testid="mapping-lab">
      <p className="morph2-lab__title">{label}</p>
      <div className="morph2-lab__picker" role="group" aria-label={label}>
        {items.map((entry, index) => (
          <button
            key={`${entry.word}-${index}`}
            type="button"
            className={index === selected ? 'morph2-chip morph2-chip--active' : 'morph2-chip'}
            aria-pressed={index === selected}
            onClick={() => setSelected(index)}
          >
            <bdi>{entry.word}</bdi>
          </button>
        ))}
      </div>
      <p className="morph2-weight-line">
        الكلمة <bdi className="morph2-word">{item.word}</bdi> ← الوزن{' '}
        <bdi className="morph2-weight">{item.weight}</bdi>
      </p>
      <MappingTable rows={item.rows} />
    </div>
  )
}

/* ================================================================== *
 * النشاط: اختيار الوزن (يُستعمل في التدريبات والمختبرات)
 * ================================================================== */

interface WeightPick {
  id: string
  word: string
  weight: string
  options: readonly string[]
  rows?: readonly C.MappingRow[]
  teacherKey?: string
  note?: string
  clarification?: string
}

function WeightChooser({ item, number }: { item: WeightPick; number: number }) {
  const [picked, setPicked] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)
  const correct = picked === item.weight

  return (
    <article className="morph2-item" data-testid={`weight-${item.id}`}>
      <p className="morph2-item__title">
        <bdi>{number}</bdi>. <bdi className="morph2-word">{item.word}</bdi>
      </p>
      <fieldset className="morph2-options">
        <legend className="morph2-sr">اختر وزن {item.word}</legend>
        {item.options.map((option) => {
          const state = !checked
            ? ''
            : option === item.weight
              ? ' morph2-option--ok'
              : option === picked
                ? ' morph2-option--no'
                : ''
          return (
            <label key={option} className={`morph2-option${state}`}>
              <input
                type="radio"
                name={`${item.id}-weight`}
                value={option}
                checked={picked === option}
                onChange={() => {
                  setPicked(option)
                  setChecked(false)
                }}
              />
              <bdi>{option}</bdi>
            </label>
          )
        })}
      </fieldset>
      <div className="morph2-item__actions">
        <button
          type="button"
          className="button button--secondary"
          onClick={() => setChecked(true)}
          disabled={picked === null}
        >
          تحقق من الإجابة
        </button>
      </div>
      {checked && (
        <div
          className={correct ? 'morph2-feedback morph2-feedback--ok' : 'morph2-feedback morph2-feedback--no'}
          role="status"
        >
          <p>
            <strong>{correct ? 'وزن صحيح.' : 'ليس هو الوزن الصحيح.'}</strong>{' '}
            {!correct && (
              <>
                الوزن الصحيح: <bdi className="morph2-weight">{item.weight}</bdi>
              </>
            )}
          </p>
          {item.note && <p className="morph2-muted">{item.note}</p>}
          {item.rows && <MappingTable rows={item.rows} />}
          {item.teacherKey && <p>مفتاح المعلم: {item.teacherKey}</p>}
          {item.clarification && <Clarification>{item.clarification}</Clarification>}
        </div>
      )}
    </article>
  )
}

/** مجموعة كلمات يوزن بعضها بعضًا، مع عداد للإجابات الصحيحة. */
function WeightGroup({ items, testId }: { items: readonly WeightPick[]; testId: string }) {
  return (
    <div className="morph2-grid" data-testid={testId}>
      {items.map((item, index) => (
        <WeightChooser key={item.id} item={item} number={index + 1} />
      ))}
    </div>
  )
}

/* ================================================================== *
 * النشاط: علّم الحروف الأصلية
 * ================================================================== */

function OriginalChooser({ item }: { item: (typeof C.originalLab)[number] }) {
  const [marks, setMarks] = useState<boolean[]>(() => item.letters.map(() => false))
  const [checked, setChecked] = useState(false)
  const correct = item.letters.every((letter, index) => marks[index] === letter.original)

  return (
    <article className="morph2-item" data-testid={`original-${item.id}`}>
      <p className="morph2-item__title">
        علّم الحروف <strong>الأصلية</strong> في: <bdi className="morph2-word">{item.word}</bdi>
      </p>
      <div className="morph2-letters" role="group" aria-label={`حروف ${item.word}`}>
        {item.letters.map((letter, index) => (
          <label key={`${letter.char}-${index}`} className={marks[index] ? 'morph2-letter morph2-letter--on' : 'morph2-letter'}>
            <input
              type="checkbox"
              checked={marks[index]}
              onChange={() => {
                setMarks((current) => current.map((value, position) => (position === index ? !value : value)))
                setChecked(false)
              }}
            />
            <bdi>{letter.char}</bdi>
          </label>
        ))}
      </div>
      <div className="morph2-item__actions">
        <button type="button" className="button button--secondary" onClick={() => setChecked(true)}>
          تحقق من الإجابة
        </button>
      </div>
      {checked && (
        <div
          className={correct ? 'morph2-feedback morph2-feedback--ok' : 'morph2-feedback morph2-feedback--no'}
          role="status"
        >
          <p>
            <strong>{correct ? 'تحليل صحيح.' : 'راجع تعليمك؛ الحروف الأصلية موضّحة أدناه.'}</strong>
          </p>
          <p className="morph2-letters morph2-letters--static">
            {item.letters.map((letter, index) => (
              <span key={`${letter.char}-${index}`} className={letter.original ? 'morph2-letter morph2-letter--on' : 'morph2-letter'}>
                <bdi>{letter.char}</bdi>
                <small>{letter.original ? 'أصلي' : 'زائد'}</small>
              </span>
            ))}
          </p>
          <p>{item.explanation}</p>
        </div>
      )}
    </article>
  )
}

/* ================================================================== *
 * النشاط: أصل الهمزة / أصل الألف
 * ================================================================== */

function OriginChooser({
  item,
  question,
}: {
  item: { id: string; word: string; answer: string; options: readonly string[]; note: string }
  question: string
}) {
  const [picked, setPicked] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)
  const correct = picked === item.answer

  return (
    <article className="morph2-item" data-testid={`origin-${item.id}`}>
      <p className="morph2-item__title">
        {question} <bdi className="morph2-word">{item.word}</bdi>
      </p>
      <fieldset className="morph2-options">
        <legend className="morph2-sr">
          {question} {item.word}
        </legend>
        {item.options.map((option) => (
          <label
            key={option}
            className={
              !checked
                ? 'morph2-option'
                : option === item.answer
                  ? 'morph2-option morph2-option--ok'
                  : option === picked
                    ? 'morph2-option morph2-option--no'
                    : 'morph2-option'
            }
          >
            <input
              type="radio"
              name={`${item.id}-origin`}
              value={option}
              checked={picked === option}
              onChange={() => {
                setPicked(option)
                setChecked(false)
              }}
            />
            <bdi>{option}</bdi>
          </label>
        ))}
      </fieldset>
      <div className="morph2-item__actions">
        <button
          type="button"
          className="button button--secondary"
          onClick={() => setChecked(true)}
          disabled={picked === null}
        >
          تحقق من الإجابة
        </button>
      </div>
      {checked && (
        <div
          className={correct ? 'morph2-feedback morph2-feedback--ok' : 'morph2-feedback morph2-feedback--no'}
          role="status"
        >
          <p>
            <strong>{correct ? 'إجابة صحيحة.' : `الصحيح: ${item.answer}`}</strong>
          </p>
          <p className="morph2-muted">{item.note}</p>
        </div>
      )}
    </article>
  )
}

/* ================================================================== *
 * الأمثلة المحلولة في القسم السادس: حاول أولًا ثم اكشف التحليل
 * ================================================================== */

function WorkedExample({ example }: { example: (typeof C.increasedWords.examples)[number] }) {
  const [picked, setPicked] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)
  const correct = picked === example.weight

  return (
    <article className="morph2-example" data-testid={`worked-${example.word}`}>
      <h4>{example.title}</h4>
      <p>{example.root}</p>
      <fieldset className="morph2-options">
        <legend className="morph2-sr">ما وزن {example.word}؟</legend>
        {example.options.map((option) => (
          <label
            key={option}
            className={
              !checked
                ? 'morph2-option'
                : option === example.weight
                  ? 'morph2-option morph2-option--ok'
                  : option === picked
                    ? 'morph2-option morph2-option--no'
                    : 'morph2-option'
            }
          >
            <input
              type="radio"
              name={`${example.word}-weight`}
              value={option}
              checked={picked === option}
              onChange={() => {
                setPicked(option)
                setChecked(false)
              }}
            />
            <bdi>{option}</bdi>
          </label>
        ))}
      </fieldset>
      <div className="morph2-item__actions">
        <button
          type="button"
          className="button button--secondary"
          onClick={() => setChecked(true)}
          disabled={picked === null}
        >
          تحقق ثم اكشف التحليل
        </button>
      </div>
      {checked && (
        <div
          className={correct ? 'morph2-feedback morph2-feedback--ok' : 'morph2-feedback morph2-feedback--no'}
          role="status"
        >
          <p>
            <strong>{correct ? 'وزن صحيح.' : `الوزن الصحيح: ${example.weight}`}</strong>
          </p>
          <p>تحليل المصدر، خطوة خطوة:</p>
          <Bullets items={example.steps} />
          <MappingTable rows={example.rows} />
          <p className="morph2-weight-line">
            <bdi>{example.weightLine}</bdi>
          </p>
          {example.clarification && <Clarification>{example.clarification}</Clarification>}
        </div>
      )}
    </article>
  )
}

/* ================================================================== *
 * التدريب الثاني: حدّد الحروف الأصلية والزائدة
 * ================================================================== */

function ExtrasChooser({ item, number }: { item: C.TrainingTwoItem; number: number }) {
  const [marks, setMarks] = useState<boolean[]>(() => item.letters.map(() => false))
  const [root, setRoot] = useState('')
  const [checked, setChecked] = useState(false)
  const picked = item.letters.filter((_, index) => marks[index])
  const extrasOk = sameSet(picked, [...item.extras], 'strict')
  const rootOk = looseKey(root) === looseKey(item.root)
  const allOk = extrasOk && rootOk

  return (
    <article className="morph2-item" data-testid={`extras-${item.id}`}>
      <p className="morph2-item__title">
        <bdi>{number}</bdi>. <bdi className="morph2-word">{item.word}</bdi>
      </p>
      <label className="morph2-field">
        <span>الجذر أو الحروف الأصلية</span>
        <input
          value={root}
          placeholder="مثال: ك ت ب"
          aria-label={`الجذر في ${item.word}`}
          onChange={(event) => {
            setRoot(event.target.value)
            setChecked(false)
          }}
        />
      </label>
      <p className="morph2-field__label">علّم الحروف الزائدة (إن وجدت):</p>
      <div className="morph2-letters" role="group" aria-label={`حروف ${item.word}`}>
        {item.letters.map((letter, index) => (
          <label key={`${letter}-${index}`} className={marks[index] ? 'morph2-letter morph2-letter--on' : 'morph2-letter'}>
            <input
              type="checkbox"
              checked={marks[index]}
              onChange={() => {
                setMarks((current) => current.map((value, position) => (position === index ? !value : value)))
                setChecked(false)
              }}
            />
            <bdi>{letter}</bdi>
          </label>
        ))}
      </div>
      <div className="morph2-item__actions">
        <button type="button" className="button button--secondary" onClick={() => setChecked(true)}>
          تحقق من الإجابة
        </button>
      </div>
      {checked && (
        <div
          className={allOk ? 'morph2-feedback morph2-feedback--ok' : 'morph2-feedback morph2-feedback--no'}
          role="status"
        >
          <p>
            <strong>{allOk ? 'تحليل صحيح.' : 'راجع حقولك.'}</strong>
          </p>
          <ul className="morph2-checks">
            <li>
              الجذر: {rootOk ? 'صحيح' : `الصحيح: ${item.root}`}
            </li>
            <li>
              الحروف الزائدة: {extrasOk ? 'صحيح' : `الصحيح: ${item.extras.join(' ، ') || 'لا توجد حروف زائدة'}`}
            </li>
          </ul>
          <p>مفتاح المعلم: {item.teacherKey}</p>
          {item.clarification && <Clarification>{item.clarification}</Clarification>}
        </div>
      )}
    </article>
  )
}

/* ================================================================== *
 * التدريب الثالث: اختر الإجابة الصحيحة
 * ================================================================== */

function McqItem({ item, number }: { item: (typeof C.trainingThree.items)[number]; number: number }) {
  const [picked, setPicked] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)
  const correct = picked === item.answer

  return (
    <article className="morph2-item" data-testid={`mcq-${item.id}`}>
      <p className="morph2-item__title">
        <bdi>{number}</bdi>. <bdi>{item.prompt}</bdi>
      </p>
      <fieldset className="morph2-options">
        <legend className="morph2-sr">{item.prompt}</legend>
        {item.options.map((option, index) => (
          <label
            key={option}
            className={
              !checked
                ? 'morph2-option'
                : option === item.answer
                  ? 'morph2-option morph2-option--ok'
                  : option === picked
                    ? 'morph2-option morph2-option--no'
                    : 'morph2-option'
            }
          >
            <input
              type="radio"
              name={`${item.id}-mcq`}
              value={option}
              checked={picked === option}
              onChange={() => {
                setPicked(option)
                setChecked(false)
              }}
            />
            <span className="morph2-option__letter" aria-hidden="true">
              {item.labels[index]}
            </span>
            <bdi>{option}</bdi>
          </label>
        ))}
      </fieldset>
      <div className="morph2-item__actions">
        <button
          type="button"
          className="button button--secondary"
          onClick={() => setChecked(true)}
          disabled={picked === null}
        >
          تحقق من الإجابة
        </button>
      </div>
      {checked && (
        <div
          className={correct ? 'morph2-feedback morph2-feedback--ok' : 'morph2-feedback morph2-feedback--no'}
          role="status"
        >
          <p>
            <strong>{correct ? 'إجابة صحيحة.' : `الإجابة الصحيحة: ${item.answer}`}</strong> (مفتاح المعلّم:{' '}
            <bdi>{item.teacherKey}</bdi>)
          </p>
          <p className="morph2-muted">{item.explanation}</p>
        </div>
      )}
    </article>
  )
}

/* ================================================================== *
 * التدريب الرابع: صحّح الأخطاء
 * ================================================================== */

function FixItem({ item, number }: { item: (typeof C.trainingFour.items)[number]; number: number }) {
  const [picked, setPicked] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)
  const correct = picked === item.answer

  return (
    <article className="morph2-item" data-testid={`fix-${item.id}`}>
      <p className="morph2-item__title">
        <bdi>{number}</bdi>. العبارة الخاطئة: <bdi className="morph2-wrong">{item.wrong}</bdi>
      </p>
      <fieldset className="morph2-options morph2-options--stacked">
        <legend className="morph2-sr">اختر التصحيح الصحيح للعبارة {item.wrong}</legend>
        {item.options.map((option) => (
          <label
            key={option}
            className={
              !checked
                ? 'morph2-option'
                : option === item.answer
                  ? 'morph2-option morph2-option--ok'
                  : option === picked
                    ? 'morph2-option morph2-option--no'
                    : 'morph2-option'
            }
          >
            <input
              type="radio"
              name={`${item.id}-fix`}
              value={option}
              checked={picked === option}
              onChange={() => {
                setPicked(option)
                setChecked(false)
              }}
            />
            <bdi>{option}</bdi>
          </label>
        ))}
      </fieldset>
      <div className="morph2-item__actions">
        <button
          type="button"
          className="button button--secondary"
          onClick={() => setChecked(true)}
          disabled={picked === null}
        >
          تحقق من التصحيح
        </button>
      </div>
      {checked && (
        <div
          className={correct ? 'morph2-feedback morph2-feedback--ok' : 'morph2-feedback morph2-feedback--no'}
          role="status"
        >
          <p>
            <strong>{correct ? 'تصحيح صحيح.' : 'التصحيح الصحيح:'}</strong> {item.teacherKey}
          </p>
        </div>
      )}
    </article>
  )
}

/* ================================================================== *
 * التدريب الخامس: حلّل الكلمات في سياقها
 * ================================================================== */

function ContextItem({ item, number }: { item: (typeof C.trainingFive.items)[number]; number: number }) {
  const [root, setRoot] = useState('')
  const [weight, setWeight] = useState('')
  const [checked, setChecked] = useState(false)
  const rootOk = looseKey(root) === looseKey(item.root)
  const weightOk = weight === item.weight
  const allOk = rootOk && weightOk
  const [before, after] = item.sentence.split(item.bold)

  return (
    <article className="morph2-item" data-testid={`context-${item.id}`}>
      <p className="morph2-item__title">
        <bdi>{number}</bdi>. <bdi className="morph2-sentence">{before}</bdi>
        <bdi className="morph2-word">{item.bold}</bdi>
        <bdi className="morph2-sentence">{after}</bdi>
      </p>
      <div className="morph2-fields">
        <label className="morph2-field">
          <span>الجذر</span>
          <input
            value={root}
            placeholder="مثال: ك ت ب"
            aria-label={`جذر ${item.bold}`}
            onChange={(event) => {
              setRoot(event.target.value)
              setChecked(false)
            }}
          />
        </label>
        <label className="morph2-field">
          <span>الوزن</span>
          <select
            value={weight}
            aria-label={`وزن ${item.bold}`}
            onChange={(event) => {
              setWeight(event.target.value)
              setChecked(false)
            }}
          >
            <option value="">اختر…</option>
            {item.weightOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="morph2-item__actions">
        <button type="button" className="button button--secondary" onClick={() => setChecked(true)}>
          تحقق من التحليل
        </button>
      </div>
      {checked && (
        <div
          className={allOk ? 'morph2-feedback morph2-feedback--ok' : 'morph2-feedback morph2-feedback--no'}
          role="status"
        >
          <p>
            <strong>{allOk ? 'تحليل صحيح.' : 'راجع حقولك.'}</strong>
          </p>
          <ul className="morph2-checks">
            <li>الجذر: {rootOk ? 'صحيح' : `الصحيح: ${item.root}`}</li>
            <li>الوزن: {weightOk ? 'صحيح' : `الصحيح: ${item.weight}`}</li>
          </ul>
          <p>مفتاح المعلم: {item.teacherKey}</p>
        </div>
      )}
    </article>
  )
}

/* ================================================================== *
 * الخطوة الأخيرة من الاختبار: الدرجات الثلاثون
 * ================================================================== */

/**
 * مؤشر قاعدة الاحتساب في القسم الثالث: يوضح أيّ خمس إجابات ستُحتسب.
 * عرضٌ فقط — لا درجة ولا حكم صحة قبل التحقق من الصفحة وتسليم الاختبار.
 */
function AnalysisRulePanel({ engine }: { engine: TestEngine }) {
  const { counted, ignored } = countedAnalysisIds(engine.answers)
  const wordOf = (id: string) => C.testQuestions.find((question) => question.id === id)?.prompt.split(': ').pop() ?? ''
  return (
    <aside className="morph2-callout" data-testid="morph2-analysis-rule">
      <strong>أيّ خمس كلمات ستُحتسب؟</strong>
      <p>
        تُحتسب أول <bdi>{arabicDigits(TEST_TOTALS.analysisRequired)}</bdi> إجابات <em>مكتملة</em> بترتيب الأسئلة (كل
        حقول الكلمة)، من <bdi>{arabicDigits(TEST_TOTALS.analysisTotal)}</bdi> كلمات معروضة؛ وما بعدها لا يزيد الدرجة
        ولا ينقصها.
      </p>
      <p data-testid="morph2-analysis-counted">
        اكتمل حتى الآن: <bdi>{arabicDigits(counted.length)}</bdi> من{' '}
        <bdi>{arabicDigits(TEST_TOTALS.analysisRequired)}</bdi>
        {counted.length > 0 ? ` — المحتسبة الآن: ${counted.map(wordOf).join('، ')}` : ''}
      </p>
      {ignored.length > 0 && <p>أُجيبت بعد الخمس الأولى، ولن تُحتسب: {ignored.map(wordOf).join('، ')}</p>}
      <Clarification>
        طريقة الاحتساب من إعداد المنصة (م-٣) لتنفيذ قاعدة المصدر «حلّل خمس كلمات من الكلمات الآتية» إلكترونيًّا، ولا
        تُنسب إلى نص الدرس.
      </Clarification>
    </aside>
  )
}

function SubmitStep({ engine }: { engine: TestEngine }) {
  const answered = answeredCount(C.testQuestions, engine.answers)
  const { finalResult, allPagesChecked } = engine
  const marks = computeMarks(engine.answers)

  return (
    <section className="morph2-submit" aria-labelledby="morph2-submit-title" data-testid="morph2-submit">
      <h3 id="morph2-submit-title">تسليم الاختبار والنتيجة</h3>
      <p>
        أجبت عن <bdi>{arabicDigits(answered)}</bdi> من <bdi>{arabicDigits(C.testQuestions.length)}</bdi> سؤالًا.
      </p>
      <p className="morph2-muted">
        القسم الأول فيه سؤالان مقاليان (٤ درجات) يُراجعان يدويًا مع المعلم؛ وبقية الدرجات (٢٦) تُصحَّح آليًا.
        توزيع الدرجات وقاعدة «أول خمس كلمات» من إعداد المنصة (م-٢، م-٣)، ولا يُنسبان إلى نص الدرس.
      </p>
      {!allPagesChecked ? (
        <p>تحقّق من كل صفحة أولًا («تحقّق من الإجابات» في نهاية كل صفحة) لتظهر النتيجة النهائية والدرجات.</p>
      ) : (
        <div role="status">
          <p className="morph2-score">
            الدرجة الآلية: <bdi>{formatMarks(marks.auto)}</bdi> من <bdi>{arabicDigits(TEST_TOTALS.autoMax)}</bdi>
          </p>
          <p className="morph2-score morph2-score--muted">
            <bdi>{arabicDigits(TEST_TOTALS.manualMax)}</bdi> درجات تُراجع يدويًا — المجموع المعتمد{' '}
            <bdi>{arabicDigits(TEST_TOTALS.total)}</bdi> درجة.
          </p>
          <table className="morph2-table">
            <caption className="morph2-caption">تفصيل الدرجات بحسب أقسام الاختبار</caption>
            <thead>
              <tr>
                <th scope="col">القسم</th>
                <th scope="col">الدرجة الآلية</th>
                <th scope="col">درجات المراجعة اليدوية</th>
              </tr>
            </thead>
            <tbody>
              {marks.pages.map((page) => (
                <tr key={page.pageId}>
                  <td>{page.title}</td>
                  <td>
                    <bdi>{formatMarks(page.auto)}</bdi> من <bdi>{formatMarks(page.autoMax)}</bdi>
                  </td>
                  <td>
                    <bdi>{page.manualMax > 0 ? formatMarks(page.manualMax) : '—'}</bdi>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {marks.pages.map((page) => (
            <details key={`lines-${page.pageId}`} className="morph2-details">
              <summary>تفصيل {page.title}</summary>
              <ul className="morph2-list">
                {page.lines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </details>
          ))}
          <p className="morph2-muted">
            القسم الثالث: احتُسبت أول <bdi>{arabicDigits(marks.countedAnalysis.length)}</bdi> كلمات مُجابة من{' '}
            <bdi>{arabicDigits(TEST_TOTALS.analysisTotal)}</bdi>، وما بعدها لا يزيد الدرجة ولا ينقصها.
          </p>
          <ul className="morph2-counts">
            <li>
              أسئلة صحيحة: <bdi>{arabicDigits(finalResult.correct)}</bdi>
            </li>
            <li>
              أسئلة خاطئة: <bdi>{arabicDigits(finalResult.wrong)}</bdi>
            </li>
            <li>
              أسئلة غير مجابة: <bdi>{arabicDigits(finalResult.unanswered)}</bdi>
            </li>
            <li>
              أسئلة للمراجعة مع المعلم: <bdi>{arabicDigits(finalResult.manual)}</bdi>
            </li>
          </ul>
        </div>
      )}
      <button type="button" className="button button--secondary" onClick={engine.resetTest}>
        إعادة الاختبار
      </button>
      <p className="morph2-muted">
        «إعادة الاختبار» تمسح كل الإجابات ونتائج الصفحات؛ فتُقفَل النتيجة والحلول من جديد حتى تتحقق من كل صفحة مرة
        أخرى. وهو متاح قبل إنهاء الصفحات وبعده.
      </p>
    </section>
  )
}

/* ================================================================== *
 * منطقة المعلم: محمية بكلمة المرور المعتمدة للمشروع
 * ================================================================== */

function TeacherArea() {
  return (
    <TeacherSpace password={COURSE_TEACHER_PASSWORD}>
      <div className="teacher-material teacher-material--morphology2">
        <p className="morph2-keys__note">{C.teacherKeyHeader}</p>
        <h3>أ. الإجابات النموذجية التفصيلية للاختبار (٢٦ سؤالًا)</h3>
        <p>
          الأسئلة ٣–٢٦ لها جواب معتمد من المصدر أو من إعداد المنصة (موضّح في كل سؤال)، ويُعرض أولًا. والسؤالان ١ و٢
          مقاليان؛ جوابهما المعتمد من المصدر، وما بعده توضيح للمعلم.
        </p>
        <SolutionsArea
          test={testDefinition}
          mode="teacher"
          title="الإجابات النموذجية التفصيلية للاختبار"
          eyebrow="منطقة المعلم"
        />

        <h3>ب. مفتاح التدريب الأول (١٥ كلمة) — نص المصدر</h3>
        <ol className="morph2-keys">
          {C.trainingOne.items.map((item) => (
            <li key={item.id}>
              <bdi>{item.teacherKey}</bdi>
              {item.clarification && <span className="morph2-keys__note"> — توضيح تعليمي من المنصة: {item.clarification}</span>}
            </li>
          ))}
        </ol>

        <h3>ج. مفتاح التدريب الثاني (١٠ كلمات) — نص المصدر</h3>
        <ol className="morph2-keys">
          {C.trainingTwo.items.map((item) => (
            <li key={item.id}>
              <bdi>{item.teacherKey}</bdi>
              {item.clarification && <span className="morph2-keys__note"> — توضيح تعليمي من المنصة: {item.clarification}</span>}
            </li>
          ))}
        </ol>

        <h3>د. مفتاح التدريب الثالث (٥ أسئلة) — نص المصدر</h3>
        <ol className="morph2-keys">
          {C.trainingThree.items.map((item, index) => (
            <li key={item.id}>
              <bdi>{item.teacherKey}</bdi> ({item.answer}) — {item.explanation}
              <span className="morph2-sr">السؤال {arabicDigits(index + 1)}</span>
            </li>
          ))}
        </ol>

        <h3>هـ. مفتاح التدريب الرابع (٦ عبارات) — نص المصدر</h3>
        <ol className="morph2-keys">
          {C.trainingFour.items.map((item) => (
            <li key={item.id}>
              <bdi>{item.teacherKey}</bdi>
            </li>
          ))}
        </ol>

        <h3>و. مفتاح التدريب الخامس (٨ جمل) — نص المصدر</h3>
        <ol className="morph2-keys">
          {C.trainingFive.items.map((item) => (
            <li key={item.id}>
              <bdi>{item.teacherKey}</bdi>
            </li>
          ))}
        </ol>

        <h3>ز. مفتاح الاختبار النهائي — نص المصدر</h3>
        <p>
          <strong>القسم الأول:</strong>
        </p>
        <ol className="morph2-keys">
          {C.teacherKeys.testPartOne.map((line) => (
            <li key={line}>
              <bdi>{line}</bdi>
            </li>
          ))}
        </ol>
        <p>
          <strong>القسم الثاني:</strong>
        </p>
        <ol className="morph2-keys">
          {C.teacherKeys.testPartTwo.map((line) => (
            <li key={line}>
              <bdi>{line}</bdi>
              {line.includes('فَهِمَ') && (
                <span className="morph2-keys__note">
                  {' '}
                  — تصحيح معتمد (خ-١): مفتاح المصدر لهذا البند كان «فهم: فعل»، وهو مخالف لمتن الدرس وجدول الثلاثي
                  المجرد ومفتاح التدريب الأول.
                </span>
              )}
            </li>
          ))}
        </ol>
        <p>
          <strong>القسم الثالث (نص المصدر العام):</strong> {C.teacherKeys.testPartThree}
        </p>
        <p className="morph2-muted">
          مفاتيح الكلمات الثماني المفصّلة الآتية من إعداد المنصة؛ لأن مفتاح المصدر عام ولا يعطي إجابة لكل كلمة،
          والمنصة تحتاج مفتاحًا لكل سؤال (توثيق: ف-٢).
        </p>
        <ol className="morph2-keys">
          {C.analysisKeys.map((line) => (
            <li key={line}>
              <bdi>{line}</bdi>
            </li>
          ))}
        </ol>
        <p>
          <strong>القسم الرابع:</strong>
        </p>
        <ol className="morph2-keys">
          {C.teacherKeys.testPartFour.map((line) => (
            <li key={line}>
              <bdi>{line}</bdi>
            </li>
          ))}
        </ol>

        <h3>ح. توزيع الدرجات وقاعدة الاحتساب — من إعداد المنصة</h3>
        <ul className="morph2-list">
          {C.marksPolicy.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
        <table className="morph2-table">
          <caption className="morph2-caption">توزيع الدرجات الثلاثين على أقسام الاختبار</caption>
          <thead>
            <tr>
              <th scope="col">القسم</th>
              <th scope="col">الدرجة</th>
              <th scope="col">تُصحَّح آليًا</th>
              <th scope="col">تُراجع يدويًا</th>
            </tr>
          </thead>
          <tbody>
            {C.marksPolicy.pages.map((page) => (
              <tr key={page.id}>
                <td>{page.id}</td>
                <td>
                  <bdi>{arabicDigits(page.marks)}</bdi>
                </td>
                <td>
                  <bdi>{arabicDigits(page.auto)}</bdi>
                </td>
                <td>
                  <bdi>{arabicDigits(page.manual)}</bdi>
                </td>
              </tr>
            ))}
            <tr className="morph2-row--total">
              <td>المجموع</td>
              <td>
                <bdi>{arabicDigits(C.marksPolicy.total)}</bdi>
              </td>
              <td>
                <bdi>{arabicDigits(TEST_TOTALS.autoMax)}</bdi>
              </td>
              <td>
                <bdi>{arabicDigits(TEST_TOTALS.manualMax)}</bdi>
              </td>
            </tr>
          </tbody>
        </table>
        <p>
          <strong>معيار تقييم الدرجات (من إعداد المنصة):</strong>
        </p>
        <ul className="morph2-list">
          {C.marksPolicy.rubric.map((row) => (
            <li key={row.range}>
              <bdi>{row.range}</bdi> — <strong>{row.label}:</strong> {row.desc}
            </li>
          ))}
        </ul>

        <h3>ط. ملاحظات تصحيحية للمعلم — من إعداد المنصة</h3>
        <ul className="morph2-list">
          {C.teacherNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>

        <h3>ي. بطاقة المراجعة — من إعداد المنصة</h3>
        <ul className="morph2-list">
          {C.reviewCard.map((row) => (
            <li key={row.term}>
              <strong>{row.term}:</strong> {row.meaning}
            </li>
          ))}
        </ul>

        <h3>ك. التصحيحات المعتمدة والتوضيحات التعليمية (سجل التدقيق)</h3>
        <p>
          كل بند أدناه إمّا تصحيح معتمد على نص المصدر (خ-١ … خ-٤) أو إضافة تعليمية من المنصة (غ، ف، ض، ش، م).
          التفصيل الكامل في <bdi>docs/morphology-lesson-02-audit.md</bdi>.
        </p>
        <ul className="morph2-list">
          {C.platformClarifications.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </div>
    </TeacherSpace>
  )
}

/* ================================================================== *
 * الدرس: ٣٤ خطوة متتابعة داخل LessonFlow
 * ================================================================== */

export function LessonMorphologyTwo({ onProgressChange, onFinish }: Props) {
  // المحرك المشترك يعيش هنا فوق LessonFlow، فتبقى الإجابات والنتائج مع تنقّل الخطوات.
  const testEngine = useTestEngine(testDefinition)

  const testSteps = testDefinition.pages.map((page) =>
    step(`test-${page.id}`, page.title, 'الاختبار النهائي (٣٠ درجة)', '📝', (
      <>
        {page.id === ANALYSIS_PAGE_ID && <AnalysisRulePanel engine={testEngine} />}
        <TestPageView page={page} engine={testEngine} questionTestIdPrefix="morph2-question" />
      </>
    )),
  )

  const steps: LessonStepDefinition[] = [
    step('intro', 'الدرس الثاني: الميزان الصرفي', 'البداية', '📘', <IntroStep />),
    step('objectives', 'أهداف الدرس الثمانية', 'البداية', '🎯', <ObjectivesStep />),

    step('sarf-def', '1. تعريف الصرف', 'ما الصرف وما الميزان', '📖', <SarfStep />),
    step('mizan-def', '2. ما الميزان الصرفي؟', 'ما الصرف وما الميزان', '⚖️', <MizanStep />),

    step('benefits-1', '3. الفائدة الأولى والثانية للميزان', 'لماذا الميزان', '🔍', <BenefitsOneStep />),
    step('benefits-2', '4. الفائدة الثالثة والرابعة للميزان', 'لماذا الميزان', '🧭', <BenefitsTwoStep />),

    step('original', '5. ما الحروف الأصلية؟', 'الأصلي والزائد', '🌱', <OriginalStep />),
    step('extra', '6. ما الحروف الزائدة؟ + مختبر الأصلي', 'الأصلي والزائد', '🔤', <ExtraStep />),
    step('saalatumoniha', '7. حروف الزيادة: «سألتمونيها»', 'الأصلي والزائد', '🧩', <SaalaStep />),

    step('tri-mujarrad', '8. وزن الفعل الثلاثي المجرد', 'وزن الثلاثي', '🔢', <TriliteralStep />),
    step('tri-vowels', '9. اختلاف الحركات يغيّر الوزن', 'وزن الثلاثي', '🎚️', <VowelsStep />),

    step('quad', '10. وزن الفعل الرباعي', 'وزن الرباعي', '🧮', <QuadriliteralStep />),

    step('more-rules', '11. قاعدة وزن الكلمات المزيدة', 'الكلمات المزيدة', '➕', <MoreRulesStep />),
    step('more-examples', '12. أمثلة المزيدة الثلاثة الأخرى', 'الكلمات المزيدة', '🧪', <MoreExamplesStep />),

    step('names', '13. وزن الأسماء', 'وزن الأسماء', '📚', <NounsStep />),

    step('shadda', '14. وزن الكلمات التي فيها تضعيف', 'التضعيف', '✨', <ShaddaStep />),

    step('hamza', '15. الهمزة: أصلية أم زائدة؟', 'الهمزة وحروف العلة', 'ء', <HamzaStep />),
    step('weak', '16. الواو والياء والألف', 'الهمزة وحروف العلة', '🌀', <WeakStep />),
    step('weak-why', '17. لماذا لا نزن المعتلة سطحيًّا؟', 'الهمزة وحروف العلة', '🔎', <WeakWhyStep />),

    step('rules', '18. القواعد الست في الميزان الصرفي', 'القواعد', '📏', <RulesStep />),

    step('train-1', 'التدريب الأول: زن الكلمات (١٥ كلمة)', 'التدريبات', '✍️', <TrainingOneStep />),
    step('train-2', 'التدريب الثاني: الأصل والزوائد (١٠ كلمات)', 'التدريبات', '🔠', <TrainingTwoStep />),
    step('train-3', 'التدريب الثالث: اختر الإجابة الصحيحة', 'التدريبات', '☑️', <TrainingThreeStep />),
    step('train-4', 'التدريب الرابع: صحّح الأخطاء', 'التدريبات', '🛠️', <TrainingFourStep />),
    step('train-5', 'التدريب الخامس: حلّل الكلمات في سياقها', 'التدريبات', '📄', <TrainingFiveStep />),

    step('summary', 'خلاصة الدرس وقاعدته الذهبية', 'الخلاصة', '📌', <SummaryStep />),

    ...testSteps,
    step('submit', 'تسليم الاختبار والنتيجة', 'الاختبار النهائي (٣٠ درجة)', '✅', <SubmitStep engine={testEngine} />),
    step(
      'solutions',
      'حلول الاختبار',
      'الاختبار النهائي (٣٠ درجة)',
      '📗',
      <SolutionsArea
        test={testDefinition}
        engine={testEngine}
        testId="morphology2-solutions"
        title="حلول اختبار الدرس الثاني: الميزان الصرفي"
      />,
    ),

    step('next-lesson', 'الدرس التالي المقترح', 'ما بعد الدرس', '➡️', <NextLessonStep />),
    step('teacher', 'منطقة خاصة بالمعلم', 'منطقة المعلم', '🔐', <TeacherArea />),
  ]

  return (
    <LessonFlow
      steps={steps}
      onProgressChange={onProgressChange}
      onFinish={onFinish}
      lessonTitle="الميزان الصرفي"
      lessonNumber="٢"
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
    description: 'اقرأ نص الدرس، ثم طبّق ما فهمته في النشاط.',
    render: () => content,
  }
}

/* ================================================================== *
 * محتوى الخطوات
 * ================================================================== */

function IntroStep() {
  return (
    <>
      <div className="morph2-hero">
        <span>{C.lessonHeader.section}</span>
        <span>الدرس الثاني</span>
        <span>١٢ قسمًا</span>
        <span>٥ تدريبات</span>
        <span>اختبار من ٣٠ درجة</span>
      </div>
      <p className="morph2-big">{C.lessonHeader.title}</p>
      <p>
        <strong>الدرس السابق:</strong> {C.lessonHeader.prerequisite}
      </p>
      <p>
        في الدرس الأول عرفت الجذر والأصل والزيادة. وفي هذا الدرس تتعلّم الأداة التي تُثبت بها ذلك لكل كلمة: الميزان
        الصرفي؛ فتزن الكلمة حرفًا حرفًا، وتفصل أصولها من زوائدها، وتراعي حركاتها وتضعيفها وإعلالها.
      </p>
      <Callout title="كيف تدرس هذا الدرس؟">
        <p>اقرأ نص كل خطوة كما ورد في الدرس، ثم جرّب النشاط الذي يليه مباشرة. ولا تنتقل إلى الاختبار قبل التدريبات الخمسة.</p>
      </Callout>
      <Golden text={C.goldenRule} />
    </>
  )
}

function ObjectivesStep() {
  return (
    <>
      <h4>{C.objectivesHeading}</h4>
      <p>{C.objectivesIntro}</p>
      <ol className="morph2-list morph2-list--numbered">
        {C.objectives.map((objective) => (
          <li key={objective}>{objective}</li>
        ))}
      </ol>
      <p className="morph2-muted">
        يغطي الاختبار النهائي هذه الأهداف الثمانية: التعريف والفهم (الهدفان ١ و٢ و٤)، والوزن (٣ و٦)، ومواضع الزيادة
        (٥)، والعلاقة بين الوزن والمعنى (٧)، واكتشاف الأخطاء (٨).
      </p>
    </>
  )
}

function SarfStep() {
  return (
    <>
      <p>{C.sarfDefinition.text}</p>
      <p>
        <strong>{C.sarfDefinition.examplesTitle}</strong>
      </p>
      <Bullets items={C.sarfDefinition.examples} />
      <Callout title="ملاحظة">{C.sarfDefinition.note}</Callout>
    </>
  )
}

function MizanStep() {
  return (
    <>
      <p className="morph2-lead">{C.mizanDefinition.text}</p>
      <p>{C.mizanDefinition.whyFaal}</p>
      <p>{C.mizanDefinition.mappingIntro}</p>
      <Bullets items={C.mizanDefinition.mapping} />
      <p>
        <strong>{C.mizanDefinition.exampleOneTitle}</strong>
      </p>
      <Bullets items={C.mizanDefinition.exampleOne} />
      <p>
        <strong>{C.mizanDefinition.exampleTwoTitle}</strong>
      </p>
      <Bullets items={C.mizanDefinition.exampleTwo} />
      <Callout title="انتبه للحركات">{C.mizanDefinition.vowelNote}</Callout>
      <MappingExplorer items={C.mizanDefinition.labWords} label="جرّب بنفسك: اختر كلمة وشاهد مقابلة حروفها" />
    </>
  )
}

function BenefitsOneStep() {
  return (
    <>
      <p>{C.benefitsIntro}</p>
      <h4>{C.benefitOne.title}</h4>
      <p>
        <strong>{C.benefitOne.exampleTitle}</strong>
      </p>
      <Bullets items={C.benefitOne.items} />
      <h4>{C.benefitTwo.title}</h4>
      <p>
        <strong>{C.benefitTwo.exampleTitle}</strong>
      </p>
      <Bullets items={C.benefitTwo.items} />
      <p>
        <strong>{C.benefitTwo.meaningTitle}</strong>
      </p>
      <Bullets items={C.benefitTwo.meanings} />
      <Golden text="الميزان يريك ماذا زاد في الكلمة، والزيادة تغيّر المعنى." />
    </>
  )
}

function BenefitsTwoStep() {
  return (
    <>
      <h4>{C.benefitThree.title}</h4>
      <p>
        <strong>{C.benefitThree.compareTitle}</strong>
      </p>
      <Bullets items={C.benefitThree.compareLines} />
      <Clarification>{C.inlineClarifications.aktaba}</Clarification>
      <Callout title="تحذير">{C.benefitThree.caution}</Callout>

      <h4>{C.benefitFour.title}</h4>
      <p>{C.benefitFour.derivation}</p>
      <p>
        <strong>{C.benefitFour.familyTitle}</strong>
      </p>
      <Chips items={C.benefitFour.family} />
      <p>{C.benefitFour.note}</p>
    </>
  )
}

function OriginalStep() {
  return (
    <>
      <p>{C.originalLetters.definition}</p>
      <p>
        <strong>{C.originalLetters.examplesTitle}</strong>
      </p>
      <Bullets items={C.originalLetters.examples} />
      <p>{C.originalLetters.count}</p>
      <div className="morph2-cards">
        {C.originalLetters.countCompare.map((row) => (
          <div key={row.word} className="morph2-card">
            <bdi className="morph2-word">{row.word}</bdi>
            <RootLetters letters={row.letters} label={`الحروف الأصلية في ${row.word}`} />
            <span className="morph2-muted">{row.count}</span>
          </div>
        ))}
      </div>
    </>
  )
}

function ExtraStep() {
  return (
    <>
      <p>{C.extraLetters.definition}</p>
      <p>
        <strong>{C.extraLetters.examplesTitle}</strong>
      </p>
      <Bullets items={C.extraLetters.examples} />
      <Callout title={C.extraLetters.warningTitle}>{afterLabel(C.extraLetters.warning)}</Callout>
      <p>
        <strong>{C.extraLetters.exampleTitle}</strong>
      </p>
      <Bullets items={C.extraLetters.contrastExamples} />
      <Correction id="خ-٢">
        <p>
          البند الأول من المثال في نص الدرس كان: «التاء في «كَتَبَ» غير موجودة أصلًا»، وهو متناقض مع التنبيه الذي
          قبله ومع الدرس الأول (التاء عين كلمة «كَتَبَ»). صُحِّح إلى ما تراه أعلاه. التفصيل في{' '}
          <bdi>docs/morphology-lesson-02-audit.md</bdi>.
        </p>
      </Correction>
      <p className="morph2-lead">جرّب بنفسك: علّم الحروف الأصلية في كل كلمة.</p>
      <div className="morph2-grid">
        {C.originalLab.map((item) => (
          <OriginalChooser key={item.id} item={item} />
        ))}
      </div>
    </>
  )
}

function SaalaStep() {
  return (
    <>
      <p>{C.increaseLetters.rule}</p>
      <p className="morph2-big">
        <bdi>{C.increaseLetters.phrase}</bdi>
      </p>
      <p>
        <strong>{C.increaseLetters.lettersTitle}</strong>
      </p>
      <div className="morph2-chips" role="img" aria-label={`حروف الزيادة: ${C.increaseLetters.lettersLine}`}>
        {C.increaseLetters.letters.map((letter, index) => (
          <span key={`${letter}-${index}`} className="morph2-root__letter" aria-hidden="true">
            {letter}
          </span>
        ))}
      </div>
      <Clarification>{C.inlineClarifications.tenLetters}</Clarification>
      <p>{C.increaseLetters.caution}</p>
      <p>
        <strong>{C.increaseLetters.examplesTitle}</strong>
      </p>
      <Bullets items={C.increaseLetters.examples} />
      <Correction id="خ-٣">
        <p>
          حصر نص الدرس زوائد «اسْتِغْفار» في «الألف والسين والتاء»؛ والصواب أربع زوائد: همزة الوصل، والسين، والتاء،
          والألف الثانية (ألف المصدر بين العين واللام). وقد صُحّح البند أعلاه، وصُحّح معه مفتاح التدريب الثاني
          (البند ٩) وتحليل «اسْتِخْراج» في الاختبار.
        </p>
      </Correction>
      <Clarification>{C.inlineClarifications.mawaaid}</Clarification>
      <Clarification>{C.inlineClarifications.hamzaWasl}</Clarification>
    </>
  )
}

function TriliteralStep() {
  return (
    <>
      <p>{C.triliteral.definition}</p>
      <p>
        <strong>{C.triliteral.examplesTitle}</strong>
      </p>
      <Chips items={C.triliteral.examples} />
      <p>{C.triliteral.method}</p>
      <h4>{C.triliteral.subOne}</h4>
      <table className="morph2-table">
        <caption className="morph2-caption">أوزان الفعل الثلاثي المجرد</caption>
        <thead>
          <tr>
            <th scope="col">الفعل</th>
            <th scope="col">الوزن</th>
          </tr>
        </thead>
        <tbody>
          {C.triliteral.table.map((row) => (
            <tr key={row.word}>
              <td>
                <bdi>{row.word}</bdi>
              </td>
              <td>
                <bdi className="morph2-weight">{row.weight}</bdi>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Callout title="تذكير">{C.triliteral.reminder}</Callout>
    </>
  )
}

function VowelsStep() {
  return (
    <>
      <h4>{C.triliteral.subTwo}</h4>
      <p>
        <strong>{C.triliteral.compareTitle}</strong>
      </p>
      <Bullets items={C.triliteral.compareLines} />
      <p>{C.triliteral.closing}</p>
      <Correction id="خ-٤">
        <p>
          ورد في نص الدرس هنا المثال «كَتِبَ: فَعِلَ من حيث الوزن المجرد، وإن كان استعماله يختلف بحسب المعنى
          والسياق»، ولا تُثبت المعاجم ماضيًا مكسور العين من هذا الجذر (المكسور هو المضارع «يَكْتِبُ»). لذلك استُبدل
          بمثال موثّق يجمع الأوزان الثلاثة في جذر واحد، وبقيت المقابلة بين «كَتَبَ» و«كُتِبَ» كما هي.
        </p>
      </Correction>
      <p>{C.vowelTriple.intro}</p>
      <table className="morph2-table">
        <caption className="morph2-caption">ثلاثية حَسَبَ/حَسِبَ/حَسُبَ ومعانيها وأوزانها</caption>
        <thead>
          <tr>
            <th scope="col">الفعل</th>
            <th scope="col">الوزن</th>
            <th scope="col">المعنى</th>
          </tr>
        </thead>
        <tbody>
          {C.vowelTriple.items.map((row) => (
            <tr key={row.word}>
              <td>
                <bdi>{row.word}</bdi>
              </td>
              <td>
                <bdi className="morph2-weight">{row.weight}</bdi>
              </td>
              <td>{row.meaning}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="morph2-muted">{C.vowelTriple.source}</p>
      <p className="morph2-lead">نشاط: اختر الوزن الصحيح مراعيًا الحركات.</p>
      <WeightGroup items={C.vowelQuiz} testId="vowel-quiz" />
    </>
  )
}

function QuadriliteralStep() {
  return (
    <>
      <p>{C.quadriliteral.kindsIntro}</p>
      <ol className="morph2-list morph2-list--numbered">
        {C.quadriliteral.kinds.map((kind) => (
          <li key={kind}>{kind}</li>
        ))}
      </ol>
      <h4>{C.quadriliteral.subOne}</h4>
      <p>
        <strong>{C.quadriliteral.exampleTitle}</strong> <bdi className="morph2-word">{C.quadriliteral.example}</bdi>
      </p>
      <p>{C.quadriliteral.letters}</p>
      <p className="morph2-weight-line">
        <bdi>{C.quadriliteral.weightLine}</bdi>
      </p>
      <p>
        <strong>{C.quadriliteral.moreTitle}</strong>
      </p>
      <Bullets items={C.quadriliteral.moreLines} />
      <p>{C.quadriliteral.mapping}</p>
      <h4>{C.quadriliteral.subTwo}</h4>
      <p>
        <strong>{C.quadriliteral.exampleTwoTitle}</strong> <bdi className="morph2-word">{C.quadriliteral.exampleTwo}</bdi>
      </p>
      <p>{C.quadriliteral.exampleTwoLine}</p>
      <p>
        <strong>{C.quadriliteral.exampleThreeTitle}</strong> {C.quadriliteral.exampleThree}
      </p>
      <p>{C.quadriliteral.note}</p>
      <Clarification>{C.inlineClarifications.quadMore}</Clarification>
      <MappingExplorer items={C.quadriliteral.labRows} label="جرّب بنفسك: الرباعي المجرد والمزيد" />
    </>
  )
}

function MoreRulesStep() {
  return (
    <>
      <p>
        <strong>{C.increasedWords.ruleTitle}</strong>
      </p>
      <p className="morph2-lead">{C.increasedWords.rule}</p>
      <p className="morph2-muted">
        اختر الوزن أولًا، ثم اكشف تحليل المصدر خطوة خطوة. (الأمثلة الأول والثاني هنا، والباقي في الخطوة التالية.)
      </p>
      {C.increasedWords.examples.slice(0, 2).map((example) => (
        <WorkedExample key={example.title} example={example} />
      ))}
    </>
  )
}

function MoreExamplesStep() {
  return (
    <>
      <p className="morph2-muted">تكملة أمثلة القسم السادس: الثالث والرابع والخامس.</p>
      {C.increasedWords.examples.slice(2).map((example) => (
        <WorkedExample key={example.title} example={example} />
      ))}
      <Clarification>{C.inlineClarifications.doubledLam}</Clarification>
    </>
  )
}

function NounsStep() {
  return (
    <>
      <p>{C.nouns.intro}</p>
      <h4>{C.nouns.subOne}</h4>
      <table className="morph2-table">
        <caption className="morph2-caption">أوزان الأسماء الثلاثية</caption>
        <thead>
          <tr>
            <th scope="col">الاسم</th>
            <th scope="col">الوزن</th>
          </tr>
        </thead>
        <tbody>
          {C.nouns.table.map((row) => (
            <tr key={row.word}>
              <td>
                <bdi>{row.word}</bdi>
              </td>
              <td>
                <bdi className="morph2-weight">{row.weight}</bdi>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        <strong>{C.nouns.qalamTitle}</strong>
      </p>
      <Bullets items={C.nouns.qalamSteps} />
      <p>{C.nouns.qalamWeight}</p>
      <p>{C.nouns.kitab}</p>
      <h4>{C.nouns.subTwo}</h4>
      <table className="morph2-table">
        <caption className="morph2-caption">أوزان الأسماء المزيدة</caption>
        <thead>
          <tr>
            <th scope="col">الاسم</th>
            <th scope="col">الأصل</th>
            <th scope="col">الوزن</th>
          </tr>
        </thead>
        <tbody>
          {C.nouns.moreTable.map((row) => (
            <tr key={row.word}>
              <td>
                <bdi>{row.word}</bdi>
              </td>
              <td>
                <bdi>{row.root}</bdi>
              </td>
              <td>
                <bdi className="morph2-weight">{row.weight}</bdi>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Callout title="ملاحظة">{C.nouns.note}</Callout>
      <Clarification>{C.inlineClarifications.taMarbuta}</Clarification>
      <MappingExplorer items={C.nouns.rows} label="جرّب بنفسك: مقابلة حروف الأسماء بالميزان" />
      <h4>عدد حروف الكلمة في العدّ الصرفي مقابل عدد أصولها</h4>
      <table className="morph2-table" data-testid="morph2-letter-counts">
        <caption className="morph2-caption">
          عدد حروف الكلمة في العدّ الصرفي (الحرف المشدّد يُحسب حرفين) مقابل عدد أصولها
        </caption>
        <thead>
          <tr>
            <th scope="col">الكلمة</th>
            <th scope="col">عدد حروفها (صرفيًّا)</th>
            <th scope="col">عدد أصولها</th>
            <th scope="col">نوعها</th>
          </tr>
        </thead>
        <tbody>
          {C.letterCounts.map((row) => (
            <tr key={row.word}>
              <td>
                <bdi>{row.word}</bdi>
              </td>
              <td>
                <bdi>{arabicDigits(row.letters)}</bdi>
              </td>
              <td>
                <bdi>{arabicDigits(row.roots)}</bdi>
              </td>
              <td>{row.kind}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Callout title="اصطلاح العدّ">{C.letterCountsConvention}</Callout>
      <Clarification>{C.inlineClarifications.letterCounts}</Clarification>
    </>
  )
}

function ShaddaStep() {
  return (
    <>
      <p>{C.doubling.definition}</p>
      <p>
        <strong>{C.doubling.examplesTitle}</strong>
      </p>
      <Chips items={C.doubling.examples} />
      {C.doubling.items.map((item) => (
        <div key={item.title} className="morph2-example">
          <h4>{item.title}</h4>
          {item.root && <p>{item.root}</p>}
          {item.line && <p>{item.line}</p>}
          <p className="morph2-weight-line">
            <bdi>{item.weightLine}</bdi>
          </p>
        </div>
      ))}
      <Callout title="قاعدة">{afterLabel(C.doubling.rule)}</Callout>
      <Clarification>{C.inlineClarifications.shaddaInMizan}</Clarification>
      <Clarification>{C.inlineClarifications.doublingKinds}</Clarification>
      <MappingExplorer items={C.doubling.rows} label="جرّب بنفسك: الشدة في الميزان" />
      <p className="morph2-lead">نشاط: فَعَّلَ أم فَعْلَلَ أم غيرهما؟</p>
      <WeightGroup
        items={C.shaddaLab.map((item) => ({
          id: item.id,
          word: item.word,
          weight: item.answer,
          options: item.options,
          note: item.note,
        }))}
        testId="shadda-lab"
      />
    </>
  )
}

function HamzaStep() {
  return (
    <>
      <p>{C.hamzaAndWeak.intro}</p>
      <h4>{C.hamzaAndWeak.subOne}</h4>
      <p>
        <strong>{C.hamzaAndWeak.hamzaExampleOne}</strong>
      </p>
      {C.hamzaAndWeak.hamzaItems.map((item) => (
        <div key={item.word} className="morph2-example">
          <p className="morph2-weight-line">
            <bdi className="morph2-word">{item.word}</bdi>
          </p>
          {item.lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
          <p>
            <bdi>{item.weightLine}</bdi>
          </p>
        </div>
      ))}
      <Callout title="الخلاصة">{C.hamzaAndWeak.hamzaConclusion}</Callout>
      <Clarification>{C.inlineClarifications.hamzaWasl}</Clarification>
      <p className="morph2-lead">نشاط: أصلية أم زائدة؟</p>
      <div className="morph2-grid">
        {C.hamzaLab.map((item) => (
          <OriginChooser key={item.id} item={item} question="همزة" />
        ))}
      </div>
      <Clarification>{C.inlineClarifications.maf3oolWord}</Clarification>
    </>
  )
}

function WeakStep() {
  return (
    <>
      <h4>{C.hamzaAndWeak.subTwo}</h4>
      <p>{C.hamzaAndWeak.weakDefinition}</p>
      <p>
        <strong>{C.hamzaAndWeak.weakExamplesTitle}</strong>
      </p>
      <Chips items={C.hamzaAndWeak.weakExamples} />
      <p>{C.hamzaAndWeak.wawOriginal}</p>
      <p>{C.hamzaAndWeak.qaal}</p>
      <Callout title="تحذير">{C.hamzaAndWeak.qaalCaution}</Callout>
    </>
  )
}

function WeakWhyStep() {
  return (
    <>
      <h4>{C.hamzaAndWeak.subThree}</h4>
      <p>{C.hamzaAndWeak.whyAnswer}</p>
      <p>
        <strong>{C.hamzaAndWeak.whyExamplesTitle}</strong>
      </p>
      <Bullets items={C.hamzaAndWeak.whyExamples} />
      <p>{C.hamzaAndWeak.whyClosing}</p>
      <Clarification>{C.inlineClarifications.weakWeights}</Clarification>
      <table className="morph2-table">
        <caption className="morph2-caption">أوزان الكلمات المعتلة وأصول ألفاتها</caption>
        <thead>
          <tr>
            <th scope="col">الكلمة</th>
            <th scope="col">الجذر</th>
            <th scope="col">الوزن</th>
            <th scope="col">أصل الألف الظاهرة</th>
          </tr>
        </thead>
        <tbody>
          {C.weakWeights.map((row) => (
            <tr key={row.word}>
              <td>
                <bdi>{row.word}</bdi>
              </td>
              <td>
                <bdi>{row.root}</bdi>
              </td>
              <td>
                <bdi className="morph2-weight">{row.weight}</bdi>
              </td>
              <td>
                <bdi>{row.origin}</bdi>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {C.weakWeights.slice(0, 3).map((row) => (
        <div key={row.word} className="morph2-example">
          <h4>
            <bdi>{row.word}</bdi>
          </h4>
          <Bullets items={row.lines} />
        </div>
      ))}
      <p className="morph2-lead">نشاط: اربط الألف الظاهرة بأصلها الصرفي.</p>
      <div className="morph2-grid">
        {C.weakLab.map((item) => (
          <OriginChooser key={item.id} item={item} question="أصل الألف في" />
        ))}
      </div>
      <Clarification>{C.inlineClarifications.deletionDeferred}</Clarification>
    </>
  )
}

function RulesStep() {
  return (
    <>
      {C.generalRules.map((rule) => (
        <Callout key={rule.title} title={rule.title}>
          {rule.lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
          {rule.examples.length > 0 && <Bullets items={rule.examples} />}
          {rule.closing && <p>{rule.closing}</p>}
        </Callout>
      ))}
    </>
  )
}

function TrainingOneStep() {
  return (
    <>
      <p className="morph2-muted">{C.trainingsHeading}</p>
      <h4>{C.trainingOne.title}</h4>
      <p>{C.trainingOne.instruction}</p>
      <p className="morph2-muted">
        اختر الوزن المضبوط بالشكل؛ فالحركات جزء من الميزان. وتظهر لك بعد التحقق مقابلة الحروف ومفتاح المعلم (نص
        المصدر).
      </p>
      <WeightGroup items={C.trainingOne.items} testId="training-one" />
    </>
  )
}

function TrainingTwoStep() {
  return (
    <>
      <h4>{C.trainingTwo.title}</h4>
      <p>{C.trainingTwo.instruction}</p>
      <div className="morph2-grid">
        {C.trainingTwo.items.map((item, index) => (
          <ExtrasChooser key={item.id} item={item} number={index + 1} />
        ))}
      </div>
    </>
  )
}

function TrainingThreeStep() {
  return (
    <>
      <h4>{C.trainingThree.title}</h4>
      <div className="morph2-grid">
        {C.trainingThree.items.map((item, index) => (
          <McqItem key={item.id} item={item} number={index + 1} />
        ))}
      </div>
    </>
  )
}

function TrainingFourStep() {
  return (
    <>
      <h4>{C.trainingFour.title}</h4>
      <p>{C.trainingFour.instruction}</p>
      <div className="morph2-grid">
        {C.trainingFour.items.map((item, index) => (
          <FixItem key={item.id} item={item} number={index + 1} />
        ))}
      </div>
    </>
  )
}

function TrainingFiveStep() {
  return (
    <>
      <h4>{C.trainingFive.title}</h4>
      <p>{C.trainingFive.instruction}</p>
      <div className="morph2-grid">
        {C.trainingFive.items.map((item, index) => (
          <ContextItem key={item.id} item={item} number={index + 1} />
        ))}
      </div>
    </>
  )
}

function SummaryStep() {
  return (
    <>
      <p>{C.summaryIntro}</p>
      <ol className="morph2-list morph2-list--numbered">
        {C.summaryPoints.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ol>
      <Golden text={C.goldenRule} />
      <h4>بطاقة المراجعة السريعة</h4>
      <table className="morph2-table">
        <caption className="morph2-caption">بطاقة مراجعة المصطلحات الأساسية</caption>
        <thead>
          <tr>
            <th scope="col">المصطلح</th>
            <th scope="col">معناه في الدرس</th>
          </tr>
        </thead>
        <tbody>
          {C.reviewCard.map((row) => (
            <tr key={row.term}>
              <td>
                <bdi>{row.term}</bdi>
              </td>
              <td>{row.meaning}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Clarification>بطاقة المراجعة من إعداد المنصة، ولا تُنسب إلى نص الدرس.</Clarification>
      <h4>{C.testIntro.heading}</h4>
      <p className="morph2-muted">{C.testIntro.marks}</p>
      <ul className="morph2-list">
        {C.testSections.map((section) => (
          <li key={section.id}>
            <bdi>{section.heading}</bdi>
            {section.instruction ? ` — ${section.instruction}` : ''}
          </li>
        ))}
      </ul>
      <p className="morph2-lead">الآن انتقل إلى الاختبار النهائي: أربع صفحات، ٢٦ سؤالًا، ٣٠ درجة.</p>
      <ul className="morph2-list">
        {C.marksPolicy.notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
      <Clarification>{C.inlineClarifications.marksPolicy}</Clarification>
    </>
  )
}

function NextLessonStep() {
  return (
    <>
      <h4>{C.nextLesson.heading}</h4>
      <p className="morph2-big">{C.nextLesson.title}</p>
      <p>{C.nextLesson.text}</p>
      <Callout title="ما الذي تركه هذا الدرس للدرس الثالث؟">
        <ul className="morph2-list">
          <li>تفصيل أبنية الفعل المجرد والمزيد (الثلاثي والرباعي) ومعاني أوزانها.</li>
          <li>وزن الكلمات التي حُذف منها حرف (مثل «قُلْ» وأصلها «قَوَلَ»)، وهو مؤجَّل في هذا الدرس.</li>
          <li>تفصيل الإعلال والإبدال بأنواعهما، وقد اكتفى هذا الدرس بالإعلال بالقلب في قالَ وباعَ ورَمى.</li>
        </ul>
      </Callout>
      <p className="morph2-muted">
        الدرس الثالث لم يُبنَ بعد على المنصة؛ وما ذُكر أعلاه هو تمهيد نص الدرس نفسه، لا تبويبًا فارغًا.
      </p>
    </>
  )
}
