import { useState, type ReactNode } from 'react'
import { LessonFlow, type LessonStepDefinition } from '../shared/components/LessonFlow'
import { TeacherSpace } from '../shared/teacher/TeacherSpace'
import { COURSE_TEACHER_PASSWORD } from '../shared/teacher/teacherPassword'
import * as C from './morphology-lesson-06/content'
import {
  SolutionsArea,
  TestPageView,
  answeredCount,
  useTestEngine,
  type TestDefinition,
  type TestEngine,
} from '../shared/test'

/* ================================================================== *
 * اختبار الدرس — shared platform test framework (src/shared/test).
 * الصفحات الأربع تُعرض كخطوات مستقلة، ولكل صفحة زر «تحقّق من الإجابات».
 * لا تُكشف الصحة ولا الحلول ولا الدرجة إلا بعد تسليم الاختبار كاملًا.
 * ================================================================== */

/** The lesson's test, declared once in the shared platform schema. */
// eslint-disable-next-line react-refresh/only-export-components -- the test schema is lesson data, not a component.
export const testDefinition: TestDefinition = C.testDefinition

interface Props {
  onProgressChange?: (value: number) => void
  onFinish?: () => void
}

/* ================================================================== *
 * عناصر بصرية وتعليمية مشتركة داخل الدرس
 * الأوزان والكلمات معزولة بوسم اتجاه (bdi) لئلا ينقلب التشكيل في سياق RTL.
 * ================================================================== */

function Callout({ children, title = 'ملاحظة مهمة' }: { children: ReactNode; title?: string }) {
  return (
    <aside className="morph6-callout">
      <strong>{title}</strong>
      <div>{children}</div>
    </aside>
  )
}

/** توضيح من إضافة المنصة (ت-1…ت-7) — لا يُنسب إلى نص المصدر. */
function Clarification({ children }: { children: ReactNode }) {
  return (
    <aside className="morph6-clarification">
      <span className="morph6-clarification__badge">توضيح تعليمي من المنصة</span>
      <div>{children}</div>
    </aside>
  )
}

function Bullets({ items }: { items: readonly string[] }) {
  return (
    <ul className="morph6-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

function Feedback({ ok, children, testId }: { ok: boolean; children: ReactNode; testId?: string }) {
  return (
    <div
      className={ok ? 'morph6-feedback morph6-feedback--ok' : 'morph6-feedback morph6-feedback--no'}
      role="status"
      data-testid={testId}
    >
      {children}
    </div>
  )
}

function WeightChip({ weight }: { weight: string }) {
  return (
    <bdi className="morph6-weight" dir="rtl">
      {weight}
    </bdi>
  )
}

function WordChip({ children }: { children: ReactNode }) {
  return (
    <bdi className="morph6-word" dir="rtl">
      {children}
    </bdi>
  )
}

/** جدول المقابلة (حرف الكلمة ← حرف الميزان ← ملاحظة) — سابقة الدرس الثاني. */
function MappingTable({ rows, caption }: { rows: readonly C.MappingRow[]; caption?: string }) {
  return (
    <div className="morph6-table-wrap">
      <table className="morph6-table morph6-table--mapping">
        <caption className="morph6-caption">{caption ?? 'مقابلة حروف الفعل بحروف الميزان'}</caption>
        <thead>
          <tr>
            <th scope="col">حرف الفعل</th>
            <th scope="col">حرف الميزان</th>
            <th scope="col">ملاحظة</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row.letter}-${index}`} className={row.extra ? 'morph6-row--extra' : undefined}>
              <td>
                <bdi>{row.letter}</bdi>
                {row.extra && <span className="morph6-tag">زائد</span>}
              </td>
              <td>
                <bdi>{row.pattern}</bdi>
              </td>
              <td>{row.note ?? (row.extra ? 'حرف زيادة يُثبت في الوزن كما هو' : 'حرف أصلي')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** جملة مثال: تُعرض مستكملة الضبط، ويُشار إلى صيغتها في المصدر عند الاختلاف (ض-1…ض-5). */
function ExampleSentence({ pair }: { pair: C.SentencePair }) {
  const differs = pair.sentence !== pair.sourceSentence
  return (
    <li className="morph6-sentence">
      <WordChip>{pair.sentence}</WordChip>
      {differs && <span className="morph6-muted"> (كما وردت في المصدر: {pair.sourceSentence})</span>}
    </li>
  )
}

/* ================================================================== *
 * التمهيد والأهداف والمراجعة
 * ================================================================== */

function IntroStep() {
  const H = C.lessonHeader
  return (
    <>
      <div className="morph6-hero">
        <span>{H.section}</span>
        {H.heroChips.map((chip) => (
          <span key={chip}>{chip}</span>
        ))}
        <span>
          اختبار من <bdi>{C.arabicDigits(20)}</bdi> سؤالًا
        </span>
      </div>
      <h3 className="morph6-big">{H.title}</h3>
      <p>{H.intro}</p>
      <Callout title="لماذا هذا الدرس مهم؟">
        <p>{H.whyItMatters}</p>
      </Callout>
      <h4>أقسام الدرس</h4>
      <ol className="morph6-list morph6-list--numbered">
        {C.sourceSections.map((section) => (
          <li key={section}>{section}</li>
        ))}
      </ol>
    </>
  )
}

function GoalsStep() {
  return (
    <>
      <Clarification>
        <p>
          هذه الأهداف إطارٌ تعليمي من إضافة المنصة، مستخلص من محتوى الدرس نفسه؛ اطّلع عليها لتعرف ما ستتقنه في نهاية
          الرحلة.
        </p>
      </Clarification>
      <ol className="morph6-list morph6-list--numbered">
        {C.objectives.map((goal) => (
          <li key={goal}>{goal}</li>
        ))}
      </ol>
    </>
  )
}

function ReviewStep() {
  const R = C.reviewSection
  return (
    <>
      <h4>{R.heading}</h4>
      <p>{R.lead}</p>
      <div className="morph6-compare" data-testid="morph6-review">
        {R.kinds.map((kind) => (
          <section key={kind.id} className="morph6-compare__col" aria-label={`الفعل ${kind.label}`}>
            <h5>{kind.label}</h5>
            <p>{kind.text}</p>
            <div className="morph6-chips" role="list" aria-label={`أمثلة الفعل ${kind.label}`}>
              {kind.examples.map((verb) => (
                <WordChip key={verb}>
                  <span role="listitem">{verb}</span>
                </WordChip>
              ))}
            </div>
            <p className="morph6-muted">
              عدد الأحرف الأصلية: <bdi>{C.arabicDigits(kind.rootCount)}</bdi>
            </p>
          </section>
        ))}
      </div>
      <Callout title="انتبه">
        <p>{R.caution}</p>
      </Callout>
    </>
  )
}

/* ================================================================== *
 * الأنشطة التفاعلية — حالة كل نشاط محلية، ولا يُكشف الحل قبل المحاولة
 * ================================================================== */

function LabCountStep() {
  const L = C.labCount
  const [picks, setPicks] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  return (
    <>
      <h4>{L.heading}</h4>
      <p>{L.instruction}</p>
      <div className="morph6-grid" data-testid="morph6-lab-count">
        {L.items.map((item) => {
          const isChecked = Boolean(checked[item.id])
          const ok = picks[item.id] === item.answer
          return (
            <article key={item.id} className="morph6-item" data-testid={item.id}>
              <p className="morph6-item__title">
                <bdi>{C.arabicDigits(item.number)}</bdi>. <WordChip>{item.word}</WordChip>
              </p>
              <p className="morph6-muted">حروفه: {item.letters}</p>
              <label className="morph6-field">
                <span className="morph6-field__label">تصنيف {item.word}</span>
                <select
                  value={picks[item.id] ?? ''}
                  onChange={(event) => {
                    setPicks((curr) => ({ ...curr, [item.id]: event.target.value }))
                    setChecked((curr) => ({ ...curr, [item.id]: false }))
                  }}
                >
                  <option value="">— اختر —</option>
                  {L.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <div className="morph6-item__actions">
                <button
                  type="button"
                  className="button button--secondary"
                  disabled={!picks[item.id]}
                  onClick={() => setChecked((curr) => ({ ...curr, [item.id]: true }))}
                >
                  تحقق من التصنيف
                </button>
              </div>
              {isChecked && (
                <Feedback ok={ok} testId={`${item.id}-feedback`}>
                  <p>
                    <strong>{ok ? 'تصنيف صحيح.' : 'تصنيف غير صحيح.'}</strong> التصنيف الصحيح: {item.answer}
                  </p>
                  <p className="morph6-muted">{item.reason}</p>
                </Feedback>
              )}
            </article>
          )
        })}
      </div>
      <div className="morph6-item__actions">
        <button
          type="button"
          className="button button--secondary"
          data-testid="lab-count-retry"
          onClick={() => {
            setPicks({})
            setChecked({})
          }}
        >
          {L.retryLabel}
        </button>
      </div>
    </>
  )
}

/** مختبر وزن فَعْلَلَ: يقابل الطالب كل حرف أصلي بحرف من حروف الميزان. */
function LabScaleStep() {
  const L = C.labScale
  const [picks, setPicks] = useState<Record<string, string[]>>({})
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  return (
    <>
      <h4>{L.heading}</h4>
      <p>{L.instruction}</p>
      <div className="morph6-grid" data-testid="morph6-lab-scale">
        {L.items.map((item) => {
          const values = picks[item.id] ?? []
          const isChecked = Boolean(checked[item.id])
          const complete = values.filter(Boolean).length === item.answers.length
          const ok = item.answers.every((answer, index) => values[index] === answer)
          return (
            <article key={item.id} className="morph6-item" data-testid={item.id}>
              <p className="morph6-item__title">
                قابِل أحرف <WordChip>{item.verb}</WordChip> بحروف الميزان
              </p>
              <div className="morph6-fields">
                {item.letters.map((letter, index) => (
                  <label key={`${item.id}-${letter}-${index}`} className="morph6-field">
                    <span className="morph6-field__label">
                      {L.positions[index]}: <bdi>{letter}</bdi>
                    </span>
                    <select
                      value={values[index] ?? ''}
                      onChange={(event) => {
                        const next = [...values]
                        next[index] = event.target.value
                        setPicks((curr) => ({ ...curr, [item.id]: next }))
                        setChecked((curr) => ({ ...curr, [item.id]: false }))
                      }}
                    >
                      <option value="">— اختر —</option>
                      {L.mizanOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
              <div className="morph6-item__actions">
                <button
                  type="button"
                  className="button button--secondary"
                  disabled={!complete}
                  onClick={() => setChecked((curr) => ({ ...curr, [item.id]: true }))}
                >
                  تحقق من المقابلة
                </button>
              </div>
              {isChecked && (
                <Feedback ok={ok} testId={`${item.id}-feedback`}>
                  <p>
                    <strong>{ok ? 'مقابلة صحيحة ودقيقة.' : 'راجع مقابلتك.'}</strong> الوزن:{' '}
                    <WeightChip weight={item.weight} />
                  </p>
                  <p className="morph6-muted">{item.reason}</p>
                  <MappingTable rows={C.analysisOf(item.verb).rows} caption={`مقابلة «${item.verb}» بالميزان`} />
                </Feedback>
              )}
            </article>
          )
        })}
      </div>
      <div className="morph6-item__actions">
        <button
          type="button"
          className="button button--secondary"
          data-testid="lab-scale-retry"
          onClick={() => {
            setPicks({})
            setChecked({})
          }}
        >
          {L.retryLabel}
        </button>
      </div>
    </>
  )
}

function LabRepeatStep() {
  const L = C.labRepeat
  const [judgement, setJudgement] = useState<Record<string, string>>({})
  const [count, setCount] = useState<Record<string, string>>({})
  const [weight, setWeight] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  return (
    <>
      <h4>{L.heading}</h4>
      <p>{L.instruction}</p>
      <div className="morph6-grid" data-testid="morph6-lab-repeat">
        {L.items.map((item) => {
          const isChecked = Boolean(checked[item.id])
          const complete = Boolean(judgement[item.id] && count[item.id] && weight[item.id])
          const ok =
            judgement[item.id] === item.judgement && count[item.id] === item.count && weight[item.id] === item.weight
          return (
            <article key={item.id} className="morph6-item" data-testid={item.id}>
              <p className="morph6-item__title">
                <WordChip>{item.verb}</WordChip> — المكرَّر فيه: {item.repeated}
              </p>
              <fieldset className="morph6-options morph6-options--stacked">
                <legend className="morph6-sr">احكم على الحرف المكرَّر في {item.verb}</legend>
                {item.judgementOptions.map((option) => (
                  <label key={option} className="morph6-option">
                    <input
                      type="radio"
                      name={`${item.id}-judgement`}
                      value={option}
                      checked={judgement[item.id] === option}
                      onChange={() => {
                        setJudgement((curr) => ({ ...curr, [item.id]: option }))
                        setChecked((curr) => ({ ...curr, [item.id]: false }))
                      }}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </fieldset>
              <div className="morph6-fields">
                <label className="morph6-field">
                  <span className="morph6-field__label">عدد الأحرف الأصلية في {item.verb}</span>
                  <select
                    value={count[item.id] ?? ''}
                    onChange={(event) => {
                      setCount((curr) => ({ ...curr, [item.id]: event.target.value }))
                      setChecked((curr) => ({ ...curr, [item.id]: false }))
                    }}
                  >
                    <option value="">— اختر —</option>
                    {item.countOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="morph6-field">
                  <span className="morph6-field__label">وزن {item.verb}</span>
                  <select
                    value={weight[item.id] ?? ''}
                    onChange={(event) => {
                      setWeight((curr) => ({ ...curr, [item.id]: event.target.value }))
                      setChecked((curr) => ({ ...curr, [item.id]: false }))
                    }}
                  >
                    <option value="">— اختر —</option>
                    {C.WEIGHT_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="morph6-item__actions">
                <button
                  type="button"
                  className="button button--secondary"
                  disabled={!complete}
                  onClick={() => setChecked((curr) => ({ ...curr, [item.id]: true }))}
                >
                  تحقق من الحكم
                </button>
              </div>
              {isChecked && (
                <Feedback ok={ok} testId={`${item.id}-feedback`}>
                  <p>
                    <strong>{ok ? 'حكم صحيح ودقيق.' : 'راجع حكمك.'}</strong> الحرف المكرَّر: {item.judgement} — عدد
                    الأصول: <bdi>{item.count}</bdi> — الوزن: <WeightChip weight={item.weight} />
                  </p>
                  <p className="morph6-muted">{item.reason}</p>
                </Feedback>
              )}
            </article>
          )
        })}
      </div>
      <div className="morph6-item__actions">
        <button
          type="button"
          className="button button--secondary"
          data-testid="lab-repeat-retry"
          onClick={() => {
            setJudgement({})
            setCount({})
            setWeight({})
            setChecked({})
          }}
        >
          {L.retryLabel}
        </button>
      </div>
    </>
  )
}

function LabBuildStep() {
  const L = C.labBuild
  const [position, setPosition] = useState<Record<string, string>>({})
  const [form, setForm] = useState<Record<string, string>>({})
  const [weight, setWeight] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  return (
    <>
      <h4>{L.heading}</h4>
      <p>{L.instruction}</p>
      <div className="morph6-grid" data-testid="morph6-lab-build">
        {L.items.map((item) => {
          const isChecked = Boolean(checked[item.id])
          const complete = Boolean(position[item.id] && form[item.id] && weight[item.id])
          const ok =
            position[item.id] === item.position && form[item.id] === item.form && weight[item.id] === item.weight
          return (
            <article key={item.id} className="morph6-item" data-testid={item.id}>
              <p className="morph6-item__title">
                <bdi>{C.arabicDigits(item.number)}</bdi>. ابنِ المزيد من <WordChip>{item.simple}</WordChip>
              </p>
              <label className="morph6-field">
                <span className="morph6-field__label">موضع إضافة التاء</span>
                <select
                  value={position[item.id] ?? ''}
                  onChange={(event) => {
                    setPosition((curr) => ({ ...curr, [item.id]: event.target.value }))
                    setChecked((curr) => ({ ...curr, [item.id]: false }))
                  }}
                >
                  <option value="">— اختر —</option>
                  {item.positionOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <fieldset className="morph6-options morph6-options--stacked">
                <legend className="morph6-sr">الفعل المزيد الناتج من {item.simple}</legend>
                {item.formOptions.map((option) => (
                  <label key={option} className="morph6-option">
                    <input
                      type="radio"
                      name={`${item.id}-form`}
                      value={option}
                      checked={form[item.id] === option}
                      onChange={() => {
                        setForm((curr) => ({ ...curr, [item.id]: option }))
                        setChecked((curr) => ({ ...curr, [item.id]: false }))
                      }}
                    />
                    <WordChip>{option}</WordChip>
                  </label>
                ))}
              </fieldset>
              <label className="morph6-field">
                <span className="morph6-field__label">وزن الفعل المزيد</span>
                <select
                  value={weight[item.id] ?? ''}
                  onChange={(event) => {
                    setWeight((curr) => ({ ...curr, [item.id]: event.target.value }))
                    setChecked((curr) => ({ ...curr, [item.id]: false }))
                  }}
                >
                  <option value="">— اختر —</option>
                  {C.WEIGHT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <div className="morph6-item__actions">
                <button
                  type="button"
                  className="button button--secondary"
                  disabled={!complete}
                  onClick={() => setChecked((curr) => ({ ...curr, [item.id]: true }))}
                >
                  تحقق من البناء
                </button>
              </div>
              {isChecked && (
                <Feedback ok={ok} testId={`${item.id}-feedback`}>
                  <p>
                    <strong>{ok ? 'بناء صحيح ودقيق.' : 'راجع بناءك.'}</strong>
                  </p>
                  <p className="morph6-pair__line">
                    <WordChip>{item.simple}</WordChip> ← <WordChip>{item.mazeed}</WordChip> ←{' '}
                    <WeightChip weight={item.weight} />
                  </p>
                  <p className="morph6-muted">
                    الحرف الزائد: {item.extraLetter}. {item.reason}
                  </p>
                </Feedback>
              )}
            </article>
          )
        })}
      </div>
      <div className="morph6-item__actions">
        <button
          type="button"
          className="button button--secondary"
          data-testid="lab-build-retry"
          onClick={() => {
            setPosition({})
            setForm({})
            setWeight({})
            setChecked({})
          }}
        >
          {L.retryLabel}
        </button>
      </div>
    </>
  )
}

function LabCompareStep() {
  const L = C.labCompare
  const [visible, setVisible] = useState<Record<string, string>>({})
  const [root, setRoot] = useState<Record<string, string>>({})
  const [extra, setExtra] = useState<Record<string, string>>({})
  const [weight, setWeight] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  return (
    <>
      <h4>{L.heading}</h4>
      <p>{L.instruction}</p>
      <div className="morph6-grid" data-testid="morph6-lab-compare">
        {L.items.map((item) => {
          const isChecked = Boolean(checked[item.id])
          const complete = Boolean(visible[item.id] && root[item.id] && extra[item.id] && weight[item.id])
          const ok =
            visible[item.id] === item.visible &&
            root[item.id] === item.root &&
            extra[item.id] === item.extra &&
            weight[item.id] === item.weight
          return (
            <article key={item.id} className="morph6-item" data-testid={item.id}>
              <p className="morph6-item__title">
                <WordChip>{item.verb}</WordChip>
              </p>
              <div className="morph6-fields">
                <label className="morph6-field">
                  <span className="morph6-field__label">عدد الحروف الظاهرة</span>
                  <select
                    value={visible[item.id] ?? ''}
                    onChange={(event) => {
                      setVisible((curr) => ({ ...curr, [item.id]: event.target.value }))
                      setChecked((curr) => ({ ...curr, [item.id]: false }))
                    }}
                  >
                    <option value="">— اختر —</option>
                    {item.visibleOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="morph6-field">
                  <span className="morph6-field__label">عدد الأحرف الأصلية</span>
                  <select
                    value={root[item.id] ?? ''}
                    onChange={(event) => {
                      setRoot((curr) => ({ ...curr, [item.id]: event.target.value }))
                      setChecked((curr) => ({ ...curr, [item.id]: false }))
                    }}
                  >
                    <option value="">— اختر —</option>
                    {item.rootOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="morph6-field">
                  <span className="morph6-field__label">الحرف الزائد</span>
                  <select
                    value={extra[item.id] ?? ''}
                    onChange={(event) => {
                      setExtra((curr) => ({ ...curr, [item.id]: event.target.value }))
                      setChecked((curr) => ({ ...curr, [item.id]: false }))
                    }}
                  >
                    <option value="">— اختر —</option>
                    {item.extraOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="morph6-field">
                  <span className="morph6-field__label">الوزن</span>
                  <select
                    value={weight[item.id] ?? ''}
                    onChange={(event) => {
                      setWeight((curr) => ({ ...curr, [item.id]: event.target.value }))
                      setChecked((curr) => ({ ...curr, [item.id]: false }))
                    }}
                  >
                    <option value="">— اختر —</option>
                    {C.WEIGHT_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="morph6-item__actions">
                <button
                  type="button"
                  className="button button--secondary"
                  disabled={!complete}
                  onClick={() => setChecked((curr) => ({ ...curr, [item.id]: true }))}
                >
                  تحقق من المقارنة
                </button>
              </div>
              {isChecked && (
                <Feedback ok={ok} testId={`${item.id}-feedback`}>
                  <p>
                    <strong>{ok ? 'مقارنة صحيحة ودقيقة.' : 'راجع مقارنتك.'}</strong>
                  </p>
                  <p className="morph6-muted">{item.reason}</p>
                </Feedback>
              )}
            </article>
          )
        })}
      </div>
      <div className="morph6-item__actions">
        <button
          type="button"
          className="button button--secondary"
          data-testid="lab-compare-retry"
          onClick={() => {
            setVisible({})
            setRoot({})
            setExtra({})
            setWeight({})
            setChecked({})
          }}
        >
          {L.retryLabel}
        </button>
      </div>
    </>
  )
}

function LabOrderStep() {
  const L = C.labOrder
  const [picks, setPicks] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const ok = L.answers.every((answer, index) => picks[`pos-${index + 1}`] === answer)

  return (
    <>
      <h4>{L.heading}</h4>
      <p>{L.instruction}</p>
      <div className="morph6-grid" data-testid="morph6-lab-order">
        {L.answers.map((_answer, index) => {
          const key = `pos-${index + 1}`
          return (
            <article key={key} className="morph6-item" data-testid={`ord-${index + 1}`}>
              <p className="morph6-item__title">
                الخطوة <bdi>{C.arabicDigits(index + 1)}</bdi>
              </p>
              <label className="morph6-field">
                <span className="morph6-field__label">وصف الخطوة {C.arabicDigits(index + 1)}</span>
                <select
                  value={picks[key] ?? ''}
                  onChange={(event) => {
                    setPicks((curr) => ({ ...curr, [key]: event.target.value }))
                    setChecked(false)
                  }}
                >
                  <option value="">— اختر —</option>
                  {L.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </article>
          )
        })}
      </div>
      <div className="morph6-item__actions">
        <button
          type="button"
          className="button button--secondary"
          disabled={L.answers.some((_answer, index) => !picks[`pos-${index + 1}`])}
          onClick={() => setChecked(true)}
        >
          {L.checkLabel}
        </button>
        <button
          type="button"
          className="button button--ghost"
          data-testid="lab-order-reveal"
          onClick={() => setRevealed((value) => !value)}
        >
          {revealed ? 'إخفاء الحل' : L.revealLabel}
        </button>
        <button
          type="button"
          className="button button--secondary"
          data-testid="lab-order-retry"
          onClick={() => {
            setPicks({})
            setChecked(false)
            setRevealed(false)
          }}
        >
          {L.retryLabel}
        </button>
      </div>
      {checked && (
        <Feedback ok={ok} testId="lab-order-feedback">
          <p>
            <strong>{ok ? 'ترتيب صحيح ودقيق.' : 'الترتيب غير صحيح بعد؛ راجع خطوات الدرس.'}</strong>
          </p>
        </Feedback>
      )}
      {revealed && (
        <div className="morph6-example" data-testid="lab-order-solution">
          <p>
            <strong>{L.solutionLead}</strong>
          </p>
          <Bullets items={L.solution} />
        </div>
      )}
    </>
  )
}

/** النشاط التشخيصي: تفكيك «تَزَلْزَلَ» إلى ظاهره وأصوله وزيادته ونوعه ووزنه. */
function LabDiagnoseStep() {
  const D = C.labDiagnose
  const [picks, setPicks] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState(false)
  const complete = D.fields.every((field) => picks[field.key])
  const ok = D.fields.every((field) => picks[field.key] === field.answer)

  return (
    <>
      <h4>{D.heading}</h4>
      <p>{D.instruction}</p>
      <article className="morph6-item morph6-item--wide" data-testid="morph6-lab-diagnose">
        <p className="morph6-item__title">
          <WordChip>{D.verb}</WordChip>
        </p>
        <div className="morph6-fields">
          {D.fields.map((field) => (
            <label key={field.key} className="morph6-field">
              <span className="morph6-field__label">{field.label}</span>
              <select
                value={picks[field.key] ?? ''}
                onChange={(event) => {
                  setPicks((curr) => ({ ...curr, [field.key]: event.target.value }))
                  setChecked(false)
                }}
              >
                <option value="">— اختر —</option>
                {field.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        <div className="morph6-item__actions">
          <button
            type="button"
            className="button button--secondary"
            disabled={!complete}
            data-testid="diagnose-check"
            onClick={() => setChecked(true)}
          >
            تحقق من التحليل
          </button>
          <button
            type="button"
            className="button button--secondary"
            data-testid="diagnose-retry"
            onClick={() => {
              setPicks({})
              setChecked(false)
            }}
          >
            إعادة النشاط
          </button>
        </div>
        {checked && (
          <Feedback ok={ok} testId="diagnose-feedback">
            <p>
              <strong>{ok ? 'تحليل صحيح ودقيق.' : 'راجع تحليلك.'}</strong>
            </p>
            <p className="morph6-muted">{D.reason}</p>
          </Feedback>
        )}
      </article>
    </>
  )
}

/* ================================================================== *
 * خطوات الشرح (نص المصدر كاملًا)
 * ================================================================== */

function MujarradStep() {
  const M = C.mujarradSection
  return (
    <>
      <h4>{M.heading}</h4>
      <div className="morph6-definition">
        <p>{M.definition}</p>
      </div>
    </>
  )
}

function MujarradExamplesStep() {
  const M = C.mujarradSection
  return (
    <>
      <h4>{M.examplesTitle}</h4>
      <div className="morph6-grid" data-testid="morph6-mujarrad-examples">
        {C.mujarradExamples.map((example, index) => (
          <article key={example.id} className="morph6-item" data-testid={example.id}>
            <p className="morph6-item__title">
              <WordChip>{example.verb}</WordChip>
            </p>
            <p>{example.label}</p>
            <p className="morph6-sentence">
              {M.sentenceLead} <WordChip>{C.mujarradSentences[index].sentence}</WordChip>
              {C.mujarradSentences[index].sentence !== C.mujarradSentences[index].sourceSentence && (
                <span className="morph6-muted">
                  {' '}
                  (كما وردت في المصدر: {C.mujarradSentences[index].sourceSentence})
                </span>
              )}
            </p>
          </article>
        ))}
      </div>
    </>
  )
}

function WeightFalalaStep() {
  const W = C.weightFalalaSection
  return (
    <>
      <h4>{W.heading}</h4>
      <p>{W.lead}</p>
      <p className="morph6-weight-hero">
        <WeightChip weight={W.weight} />
      </p>
      <p>{W.mappingLead}</p>
      <p>{W.tableLead}</p>
      <div className="morph6-table-wrap">
        <table className="morph6-table" data-testid="morph6-falala-table">
          <caption className="morph6-caption">{W.tableCaption}</caption>
          <thead>
            <tr>
              {W.tableColumns.map((column) => (
                <th key={column} scope="col">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {W.table.map((row) => (
              <tr key={row.verb}>
                <td>
                  <WordChip>{row.verb}</WordChip>
                </td>
                <td>
                  <WeightChip weight={row.weight} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h4>{W.howToHeading}</h4>
      <Bullets items={W.howTo} />
      <p className="morph6-conclusion">
        <WordChip>{W.conclusion}</WordChip>
      </p>
      <MappingTable rows={C.analysisOf('dahraja').rows} caption="مقابلة «دَحْرَجَ» بحروف الميزان" />
      <Clarification>
        <p>{W.clarification}</p>
      </Clarification>
    </>
  )
}

function RepeatWarningStep() {
  const R = C.repeatWarning
  return (
    <>
      <Callout title="انتبه">
        <p>{R.text}</p>
      </Callout>
      <Clarification>
        <p>{R.clarification}</p>
      </Clarification>
      <div className="morph6-compare" data-testid="morph6-repeat">
        {['زَلْزَلَ', 'وَسْوَسَ'].map((verb) => {
          const analysis = C.analysisOf(verb === 'زَلْزَلَ' ? 'zalzala' : 'waswasa')
          return (
            <section key={verb} className="morph6-compare__col" aria-label={`تحليل ${verb}`}>
              <h5>
                <WordChip>{verb}</WordChip>
              </h5>
              <p>
                الأحرف الأصلية: {analysis.rootLetters} — العدد: <bdi>{C.arabicDigits(analysis.rootCount)}</bdi>
              </p>
              <p>
                الوزن: <WeightChip weight={analysis.weight} /> — الحرف الزائد: {analysis.extraLetter}
              </p>
            </section>
          )
        })}
      </div>
    </>
  )
}

function MazeedStep() {
  const M = C.mazeedSection
  return (
    <>
      <h4>{M.heading}</h4>
      <div className="morph6-definition">
        <p>{M.definition}</p>
      </div>
      <p>{M.pairLead}</p>
      <p className="morph6-pair__line morph6-pair__line--big">
        <WordChip>{M.pair.split(' ← ')[0]}</WordChip> ← <WordChip>{M.pair.split(' ← ')[1]}</WordChip>
      </p>
      <Bullets items={M.analysis} />
      <p>{M.sentenceLead}</p>
      <ul className="morph6-list morph6-sentences">
        {M.sentences.map((pair) => (
          <ExampleSentence key={pair.sourceSentence + pair.sentence} pair={pair} />
        ))}
      </ul>
      <Clarification>
        <p>{M.clarification}</p>
      </Clarification>
    </>
  )
}

function MeaningStep() {
  const M = C.meaningSection
  return (
    <>
      <h4>الفرق في المعنى بين المجرّد والمزيد</h4>
      <p>{M.text}</p>
      <div className="morph6-compare" data-testid="morph6-meaning">
        {M.columns.map((column) => (
          <section key={column.id} className="morph6-compare__col" aria-label={column.label}>
            <h5>{column.label}</h5>
            <p>{column.text}.</p>
          </section>
        ))}
      </div>
      <Clarification>
        <p>{M.clarification}</p>
      </Clarification>
    </>
  )
}

function TafalalaStep() {
  const T = C.tafalalaSection
  return (
    <>
      <h4>{T.heading}</h4>
      <p>{T.scope}</p>
      <h5 className="morph6-order">{T.order}</h5>
      <p>{T.formation}</p>
      <div className="morph6-flow" role="group" aria-label={T.flowCaption} data-testid="morph6-build-flow">
        {T.flow.map((cell, index) => (
          <span key={`${cell.text}-${index}`} className={`morph6-flow__cell morph6-flow__cell--${cell.kind}`}>
            {cell.kind === 'word' ? (
              <WordChip>{cell.text}</WordChip>
            ) : cell.kind === 'weight' ? (
              <WeightChip weight={cell.text.replace('وزنه: ', '')} />
            ) : (
              cell.text
            )}
          </span>
        ))}
      </div>
      <p className="morph6-muted">{T.flowCaption}</p>
      <Clarification>
        <p>{T.clarification}</p>
      </Clarification>
    </>
  )
}

function MorePairsStep() {
  const M = C.morePairsSection
  return (
    <>
      <h4>{M.lead}</h4>
      <div className="morph6-table-wrap">
        <table className="morph6-table" data-testid="morph6-pairs-table">
          <caption className="morph6-caption">{M.tableCaption}</caption>
          <thead>
            <tr>
              {M.tableColumns.map((column) => (
                <th key={column} scope="col">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {M.table.map((row) => (
              <tr key={row.mazeed}>
                <td>
                  <WordChip>{row.simple}</WordChip>
                </td>
                <td>
                  <WordChip>{row.mazeed}</WordChip>
                </td>
                <td>
                  <WeightChip weight={row.weight} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h4>{M.sentencesLead}</h4>
      <ul className="morph6-list morph6-sentences" data-testid="morph6-mazeed-sentences">
        {M.sentences.map((pair) => (
          <ExampleSentence key={pair.sourceSentence} pair={pair} />
        ))}
      </ul>
    </>
  )
}

function OtherWeightsStep() {
  const O = C.otherWeightsSection
  return (
    <>
      <h4>{O.question}</h4>
      <div className="morph6-definition">
        <p>{O.answer}</p>
      </div>
      <Clarification>
        <p>{O.scopeNote}</p>
      </Clarification>
    </>
  )
}

function ComparisonStep() {
  const S = C.comparisonSection
  return (
    <>
      <h4>{S.heading}</h4>
      <div className="morph6-table-wrap">
        <table className="morph6-table" data-testid="morph6-comparison-table">
          <caption className="morph6-caption">{S.tableCaption}</caption>
          <thead>
            <tr>
              {S.columns.map((column) => (
                <th key={column} scope="col">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {S.rows.map((row) => (
              <tr key={row.aspect}>
                <th scope="row">{row.aspect}</th>
                <td>{row.kind === 'word' ? <WordChip>{row.simple}</WordChip> : row.kind === 'weight' ? <WeightChip weight={row.simple} /> : row.simple}</td>
                <td>{row.kind === 'word' ? <WordChip>{row.mazeed}</WordChip> : row.kind === 'weight' ? <WeightChip weight={row.mazeed} /> : row.mazeed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

function GoldenRuleStep() {
  const G = C.goldenRule
  return (
    <>
      <div className="morph6-rule" data-testid="morph6-golden-rule">
        <h4>{G.title}</h4>
        <p>{G.rule}</p>
      </div>
      <Callout title="انتبه">
        <p>{G.caution}</p>
      </Callout>
    </>
  )
}

function AnalysisStepsStep() {
  const A = C.analysisStepsSection
  return (
    <>
      <h4>{A.heading}</h4>
      <p>{A.lead}</p>
      <ol className="morph6-steps">
        {A.steps.map((item) => (
          <li key={item.n} className="morph6-steps__item">
            <span className="morph6-steps__num" aria-hidden="true">
              <bdi>{C.arabicDigits(item.n)}</bdi>
            </span>
            <p>{item.text}</p>
          </li>
        ))}
      </ol>
    </>
  )
}

function AppliedStep() {
  const A = C.appliedExample
  return (
    <>
      <h4>{A.lead}</h4>
      <p className="morph6-weight-hero">
        <WordChip>{A.verb}</WordChip>
      </p>
      <Bullets items={A.lines} />
      <MappingTable rows={C.analysisOf('tazalzala').rows} caption="مقابلة «تَزَلْزَلَ» بحروف الميزان" />
    </>
  )
}

/* ================================================================== *
 * التدريبات الأصلية (٤ + ٣) — حالتها مرفوعة إلى مكوّن الدرس حتى يعمل
 * زرّا المصدر («إظهار الإجابات والتصحيح» و«إعادة التدريبات») على التدريبين معًا.
 * ================================================================== */

interface TrainingShared {
  answers: Record<string, string>
  checked: Record<string, boolean>
  revealed: boolean
  pick: (id: string, value: string) => void
  check: (id: string) => void
  toggleReveal: () => void
  reset: () => void
}

function TrainingControls({ shared }: { shared: TrainingShared }) {
  return (
    <div className="morph6-item__actions" data-testid="morph6-training-controls">
      <button
        type="button"
        className="button button--ghost"
        data-testid="trainings-reveal"
        onClick={shared.toggleReveal}
      >
        {shared.revealed ? C.trainingControls.hideLabel : C.trainingControls.revealLabel}
      </button>
      <button type="button" className="button button--secondary" data-testid="trainings-retry" onClick={shared.reset}>
        {C.trainingControls.retryLabel}
      </button>
    </div>
  )
}

function RevealPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="morph6-example" data-testid="trainings-solution">
      <p>
        <strong>{title}</strong>
      </p>
      {children}
    </div>
  )
}

function TrainingOneStep({ shared }: { shared: TrainingShared }) {
  const T = C.trainingOne
  return (
    <>
      <h4>{C.trainingsIntro.heading}</h4>
      <p>{C.trainingsIntro.lead}</p>
      <h5 className="morph6-order">{T.heading}</h5>
      <p>{T.instruction}</p>
      <div className="morph6-grid" data-testid="morph6-training-one">
        {T.items.map((item) => {
          const picked = shared.answers[item.id]
          const isChecked = Boolean(shared.checked[item.id])
          const isCorrect = picked === item.answer
          return (
            <article key={item.id} className="morph6-item" data-testid={`train1-${item.id}`}>
              <p className="morph6-item__title">
                <bdi>{C.arabicDigits(item.number)}</bdi>. <WordChip>{item.verb}</WordChip>
              </p>
              <fieldset className="morph6-options morph6-options--stacked">
                <legend className="morph6-sr">حدّد نوع {item.verb}</legend>
                {T.options.map((option) => (
                  <label key={option} className="morph6-option">
                    <input
                      type="radio"
                      name={`train1-${item.id}`}
                      value={option}
                      checked={picked === option}
                      onChange={() => shared.pick(item.id, option)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </fieldset>
              <div className="morph6-item__actions">
                <button
                  type="button"
                  className="button button--secondary"
                  disabled={picked === undefined}
                  onClick={() => shared.check(item.id)}
                >
                  {T.checkLabel}
                </button>
              </div>
              {isChecked && (
                <Feedback ok={isCorrect} testId={`train1-${item.id}-feedback`}>
                  <p>
                    <strong>{isCorrect ? 'إجابة صحيحة.' : 'إجابة غير صحيحة.'}</strong>
                    {!isCorrect && <> النوع الصحيح: {item.answer}</>}
                  </p>
                  <p className="morph6-muted">{item.explanation}</p>
                </Feedback>
              )}
            </article>
          )
        })}
      </div>
      {shared.revealed && (
        <RevealPanel title="الإجابات والتصحيح للتدريب الأول">
          <ul className="morph6-list">
            {T.items.map((item) => (
              <li key={item.id}>
                <bdi>{C.arabicDigits(item.number)}</bdi>. <WordChip>{item.verb}</WordChip>: {item.answer} —{' '}
                {item.explanation}
              </li>
            ))}
          </ul>
        </RevealPanel>
      )}
      <TrainingControls shared={shared} />
    </>
  )
}

function TrainingTwoStep({ shared }: { shared: TrainingShared }) {
  const T = C.trainingTwo
  return (
    <>
      <p className="morph6-muted">{C.trainingsIntro.lead}</p>
      <h4>{T.heading}</h4>
      <Clarification>
        <p>{T.platformNote}</p>
      </Clarification>
      <div className="morph6-grid" data-testid="morph6-training-two">
        {T.items.map((item) => {
          const picked = shared.answers[item.id]
          const isChecked = Boolean(shared.checked[item.id])
          const isCorrect = picked === item.answer
          return (
            <article key={item.id} className="morph6-item" data-testid={`train2-${item.id}`}>
              <p className="morph6-item__title">
                <bdi>{C.arabicDigits(item.number)}</bdi>. <WordChip>{item.verb}</WordChip>
              </p>
              <fieldset className="morph6-options morph6-options--stacked">
                <legend className="morph6-sr">اختر وزن {item.verb}</legend>
                {C.WEIGHT_OPTIONS.map((option) => (
                  <label key={option} className="morph6-option">
                    <input
                      type="radio"
                      name={`train2-${item.id}`}
                      value={option}
                      checked={picked === option}
                      onChange={() => shared.pick(item.id, option)}
                    />
                    <WeightChip weight={option} />
                  </label>
                ))}
              </fieldset>
              <div className="morph6-item__actions">
                <button
                  type="button"
                  className="button button--secondary"
                  disabled={picked === undefined}
                  onClick={() => shared.check(item.id)}
                >
                  {T.checkLabel}
                </button>
              </div>
              {isChecked && (
                <Feedback ok={isCorrect} testId={`train2-${item.id}-feedback`}>
                  <p>
                    <strong>{isCorrect ? 'إجابة صحيحة.' : 'إجابة غير صحيحة.'}</strong>
                    {!isCorrect && (
                      <>
                        {' '}
                        الوزن الصحيح: <WeightChip weight={item.answer} />
                      </>
                    )}
                  </p>
                  <p className="morph6-muted">{item.explanation}</p>
                </Feedback>
              )}
            </article>
          )
        })}
      </div>
      {shared.revealed && (
        <RevealPanel title="الإجابات والتصحيح للتدريب الثاني">
          <ul className="morph6-list">
            {T.items.map((item) => (
              <li key={item.id}>
                <bdi>{C.arabicDigits(item.number)}</bdi>. <WordChip>{item.verb}</WordChip>:{' '}
                <WeightChip weight={item.answer} /> — {item.explanation}
              </li>
            ))}
          </ul>
        </RevealPanel>
      )}
      <TrainingControls shared={shared} />
    </>
  )
}

/* ================================================================== *
 * الخلاصة والدرس القادم
 * ================================================================== */

function SummaryStep() {
  const S = C.summarySection
  return (
    <>
      <h4>{S.heading}</h4>
      <p>{S.lead}</p>
      <ol className="morph6-list morph6-list--numbered morph6-summary" data-testid="morph6-summary">
        {S.points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ol>
      <div className="morph6-table-wrap">
        <table className="morph6-table" data-testid="morph6-recap-table">
          <caption className="morph6-caption">{S.recap.caption}</caption>
          <thead>
            <tr>
              {S.recap.columns.map((column) => (
                <th key={column} scope="col">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {S.recap.rows.map((row) => (
              <tr key={row.kind}>
                <td>{row.kind}</td>
                <td>{row.roots}</td>
                <td>{row.extra}</td>
                <td>
                  <WeightChip weight={row.weight} />
                </td>
                <td>
                  <WordChip>{row.example}</WordChip>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="morph6-conclusion">
        <strong>{S.closing}</strong>
      </p>
    </>
  )
}

function NextLessonStep() {
  const N = C.nextLessonSection
  return (
    <>
      <h4>{N.heading}</h4>
      <p>{N.lead}</p>
      <p className="morph6-big">{N.title}</p>
      <p>{N.body}</p>
      <Callout title="نطاق العمل">
        <p>{N.scopeNote}</p>
      </Callout>
    </>
  )
}

/* ================================================================== *
 * الاختبار: التسليم، الحلول، ومنطقة المعلم
 * ================================================================== */

function SubmitStep({
  engine,
  isSubmitted,
  onSubmit,
  onReset,
}: {
  engine: TestEngine
  isSubmitted: boolean
  onSubmit: () => void
  onReset: () => void
}) {
  const questions = C.testDefinition.pages.flatMap((page) => page.questions)
  const answered = answeredCount(questions, engine.answers)
  const total = questions.length
  const { finalResult } = engine

  return (
    <section className="morph6-submit" aria-labelledby="morph6-submit-title" data-testid="morph6-submit">
      <h3 id="morph6-submit-title">تسليم الاختبار والنتيجة</h3>
      <p>
        أجبت عن <bdi>{C.arabicDigits(answered)}</bdi> من <bdi>{C.arabicDigits(total)}</bdi> سؤالًا.
      </p>
      {!isSubmitted ? (
        <>
          <p>
            لا تُكشف صحة الإجابات أو الحلول النموذجية أو النتيجة النهائية إلا بعد تسليم الاختبار كاملًا. اضغط زر
            «تسليم الاختبار وإظهار النتيجة» أدناه لاعتماد إجاباتك وإظهار النتيجة النهائية وكشف الحلول النموذجية.
          </p>
          <div className="morph6-item__actions">
            <button
              type="button"
              className="button button--primary"
              onClick={onSubmit}
              data-testid="morph6-submit-btn"
            >
              تسليم الاختبار وإظهار النتيجة
            </button>
            <button type="button" className="button button--secondary" onClick={onReset}>
              إعادة الاختبار
            </button>
          </div>
        </>
      ) : (
        <>
          <div role="status">
            <p className="morph6-score">
              النتيجة: <bdi>{C.arabicDigits(finalResult.correct)}</bdi> من{' '}
              <bdi>{C.arabicDigits(finalResult.total)}</bdi> إجابة صحيحة
            </p>
            <ul className="morph6-counts">
              <li>
                أسئلة صحيحة: <bdi>{C.arabicDigits(finalResult.correct)}</bdi>
              </li>
              <li>
                أسئلة خاطئة: <bdi>{C.arabicDigits(finalResult.wrong)}</bdi>
              </li>
              <li>
                أسئلة غير مجابة: <bdi>{C.arabicDigits(finalResult.unanswered)}</bdi>
              </li>
            </ul>
          </div>
          <div className="morph6-item__actions">
            <button type="button" className="button button--secondary" onClick={onReset}>
              إعادة الاختبار
            </button>
          </div>
        </>
      )}
      <p className="morph6-muted">
        «إعادة الاختبار» تمسح كل الإجابات ونتائج الصفحات، فتُقفَل النتيجة والحلول من جديد حتى تسلّم الاختبار مرة
        أخرى.
      </p>
    </section>
  )
}

function TeacherArea() {
  return (
    <TeacherSpace password={COURSE_TEACHER_PASSWORD}>
      <div className="teacher-material teacher-material--morphology6">
        <p className="morph6-keys__note">{C.teacherKeyHeader}</p>

        <h3>أ. الحلول التفصيلية لاختبار الدرس (٢٠ سؤالًا)</h3>
        <SolutionsArea
          test={testDefinition}
          mode="teacher"
          title="الحلول التفصيلية لاختبار الدرس السادس: الفعل الرباعي المجرّد والمزيد"
          eyebrow="منطقة المعلم"
        />

        <h3>ب. حل التدريب الأول: حدّد نوع الفعل (٤ أسئلة)</h3>
        <ol className="morph6-keys">
          {C.trainingOne.items.map((item) => (
            <li key={item.id}>
              <strong>
                <WordChip>{item.verb}</WordChip>:
              </strong>{' '}
              {item.answer}. <span>{item.explanation}</span>
            </li>
          ))}
        </ol>

        <h3>ج. حل التدريب الثاني: اكتب الوزن الصرفي (٣ أسئلة)</h3>
        <ol className="morph6-keys">
          {C.trainingTwo.items.map((item) => (
            <li key={item.id}>
              {item.teacherKey} <span className="morph6-muted">{item.explanation}</span>
            </li>
          ))}
        </ol>

        <h3>د. حلول الأنشطة التفاعلية السبعة</h3>
        <ul className="morph6-list">
          {C.teacherLabKeys.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>

        <h3>هـ. تحليل الأمثلة السبعة: الوزن والحروف الأصلية والزائدة</h3>
        <div className="morph6-keys">
          {C.verbAnalyses.map((verb) => (
            <article key={verb.id} className="morph6-item morph6-item--wide">
              <p className="morph6-item__title">
                <WordChip>{verb.word}</WordChip> — {verb.kind} — <WeightChip weight={verb.weight} />
              </p>
              <p>
                الجذر: {verb.root} · الأحرف الأصلية: {verb.rootLetters} · الحروف الظاهرة:{' '}
                <bdi>{C.arabicDigits(verb.visibleCount)}</bdi> · الأحرف الأصلية:{' '}
                <bdi>{C.arabicDigits(verb.rootCount)}</bdi> · الحرف الزائد: {verb.extraLetter}
              </p>
              <MappingTable rows={verb.rows} caption={`مقابلة «${verb.word}» بحروف الميزان`} />
              <p className="morph6-muted">{verb.teacherNote}</p>
            </article>
          ))}
        </div>
        <h4>الأفعال المساندة الموثّقة في الاختبار (غ-2)</h4>
        <ul className="morph6-list">
          {C.supportingVerbs.map((verb) => (
            <li key={verb.id}>
              <WordChip>{verb.word}</WordChip> — {verb.kind} على <WeightChip weight={verb.weight} /> (الجذر:{' '}
              {verb.root}). {verb.note}
            </li>
          ))}
        </ul>

        <h3>و. قواعد الميزان وحدود الضبط في هذا الدرس</h3>
        <ul className="morph6-list">
          {C.teacherWeightNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>

        <h3>ز. أخطاء متوقعة عند الطلاب وكيفية معالجتها</h3>
        <ul className="morph6-list">
          {C.teacherMistakes.map((mistake) => (
            <li key={mistake}>{mistake}</li>
          ))}
        </ul>

        <h3>ح. الإحالات: مواضع المصدر وسجل التدقيق</h3>
        <ul className="morph6-list">
          {C.teacherAuditNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </div>
    </TeacherSpace>
  )
}

/* ================================================================== *
 * تجميع خطوات الدرس السادس
 * ================================================================== */

export function LessonMorphologySix({ onProgressChange, onFinish }: Props) {
  // المحرك المشترك يعيش فوق LessonFlow، فتبقى الإجابات والنتائج محفوظة عند التنقل بين الخطوات.
  const testEngine = useTestEngine(testDefinition)
  const [testSubmitted, setTestSubmitted] = useState(false)
  const isTestSubmitted = testSubmitted && testEngine.allPagesChecked

  // حالة التدريبات مرفوعة أيضًا، ليعمل زرّا المصدر على التدريبين معًا (م6-2، غ-3).
  const [trainingAnswers, setTrainingAnswers] = useState<Record<string, string>>({})
  const [trainingChecked, setTrainingChecked] = useState<Record<string, boolean>>({})
  const [trainingRevealed, setTrainingRevealed] = useState(false)
  const trainingShared: TrainingShared = {
    answers: trainingAnswers,
    checked: trainingChecked,
    revealed: trainingRevealed,
    pick(id, value) {
      setTrainingAnswers((current) => ({ ...current, [id]: value }))
      setTrainingChecked((current) => ({ ...current, [id]: false }))
    },
    check(id) {
      setTrainingChecked((current) => ({ ...current, [id]: true }))
    },
    toggleReveal() {
      setTrainingRevealed((value) => !value)
    },
    reset() {
      setTrainingAnswers({})
      setTrainingChecked({})
      setTrainingRevealed(false)
    },
  }

  function handleSubmitTest() {
    for (const page of testDefinition.pages) {
      testEngine.checkPage(page.id)
    }
    setTestSubmitted(true)
  }

  function handleResetTest() {
    testEngine.resetTest()
    setTestSubmitted(false)
  }

  const testSteps = testDefinition.pages.map((page) =>
    step(`test-${page.id}`, page.title, 'الاختبار النهائي (٢٠ سؤالًا)', '📝', (
      <TestPageView
        page={page}
        engine={testEngine}
        questionTestIdPrefix="morph6-question"
        revealFeedback={isTestSubmitted}
      />
    )),
  )

  const steps: LessonStepDefinition[] = [
    step('intro', 'الدرس السادس: الفعل الرباعي المجرّد والمزيد', 'التمهيد والأهداف والمراجعة', '🌷', <IntroStep />),
    step('goals', 'أهداف الدرس', 'التمهيد والأهداف والمراجعة', '🎯', <GoalsStep />),
    step('review', 'أولًا: مراجعة سريعة — الثلاثي والرباعي', 'التمهيد والأهداف والمراجعة', '1️⃣', <ReviewStep />),
    step('lab-count', 'نشاط: عدّ الحروف الأصلية قبل الحكم', 'التمهيد والأهداف والمراجعة', '🧮', <LabCountStep />),

    step('mujarrad', 'ثانيًا: ما الفعل الرباعي المجرّد؟', 'الرباعي المجرّد ووزنه', '📘', <MujarradStep />),
    step('examples', 'أمثلة الرباعي المجرّد في جمل', 'الرباعي المجرّد ووزنه', '📚', <MujarradExamplesStep />),
    step('weight-falala', 'ما وزن الفعل الرباعي المجرّد؟ (فَعْلَلَ)', 'الرباعي المجرّد ووزنه', '⚖️', <WeightFalalaStep />),
    step('lab-scale', 'مختبر: قابِل كل حرف أصلي بحرف الميزان', 'الرباعي المجرّد ووزنه', '🧪', <LabScaleStep />),
    step('repeat-warning', 'تنبيه: تكرار الحرف لا يعني أنه زائد', 'الرباعي المجرّد ووزنه', '⚠️', <RepeatWarningStep />),
    step('lab-repeat', 'نشاط: الحرف المكرَّر — أصلي أم زائد؟', 'الرباعي المجرّد ووزنه', '🔁', <LabRepeatStep />),

    step('mazeed', 'ثالثًا: ما الفعل الرباعي المزيد؟', 'الرباعي المزيد وتَفَعْلَلَ', '📗', <MazeedStep />),
    step('meaning', 'الفرق في المعنى بين المجرّد والمزيد', 'الرباعي المزيد وتَفَعْلَلَ', '💬', <MeaningStep />),
    step('tafalala', 'رابعًا (١): وزن تَفَعْلَلَ وكيف يُصاغ', 'الرباعي المزيد وتَفَعْلَلَ', '🧩', <TafalalaStep />),
    step('lab-build', 'مختبر: ابنِ وزن تَفَعْلَلَ', 'الرباعي المزيد وتَفَعْلَلَ', '🏗️', <LabBuildStep />),
    step('more-pairs', 'رابعًا (٢): أمثلة أخرى في جمل', 'الرباعي المزيد وتَفَعْلَلَ', '📊', <MorePairsStep />),
    step('other-weights', 'هل توجد أوزان أخرى للرباعي المزيد؟', 'الرباعي المزيد وتَفَعْلَلَ', '🔎', <OtherWeightsStep />),

    step('comparison', 'خامسًا: مقارنة بين المجرّد والمزيد', 'المقارنة وخطوات التمييز', '🔍', <ComparisonStep />),
    step('golden-rule', 'القاعدة الذهبية وتنبيه الحروف الظاهرة', 'المقارنة وخطوات التمييز', '🏅', <GoldenRuleStep />),
    step('lab-compare', 'نشاط: قارِن بين المجرّد والمزيد', 'المقارنة وخطوات التمييز', '🧮', <LabCompareStep />),
    step('steps', 'سادسًا: كيف أميّز نوع الفعل؟', 'المقارنة وخطوات التمييز', '🧭', <AnalysisStepsStep />),
    step('lab-order', 'نشاط: رتّب خطوات تحديد نوع الفعل', 'المقارنة وخطوات التمييز', '🧩', <LabOrderStep />),
    step('applied', 'مثال تطبيقي: تَزَلْزَلَ', 'المقارنة وخطوات التمييز', '✅', <AppliedStep />),
    step('lab-diagnose', 'نشاط تشخيصي: حلّل تَزَلْزَلَ', 'المقارنة وخطوات التمييز', '🩺', <LabDiagnoseStep />),

    step('train-1', 'سابعًا (١): التدريب الأول — حدّد نوع الفعل', 'التدريبات', '✍️', <TrainingOneStep shared={trainingShared} />),
    step('train-2', 'سابعًا (٢): التدريب الثاني — اكتب الوزن الصرفي', 'التدريبات', '📝', <TrainingTwoStep shared={trainingShared} />),

    step('summary', 'ثامنًا: خلاصة الدرس', 'الخلاصة وما بعد الدرس', '📌', <SummaryStep />),
    step('next-lesson', 'الدرس السابع: الفعل الصحيح والفعل المعتل', 'الخلاصة وما بعد الدرس', '➡️', <NextLessonStep />),

    ...testSteps,
    step(
      'submit',
      'تسليم الاختبار والنتيجة',
      'الاختبار النهائي (٢٠ سؤالًا)',
      '✅',
      <SubmitStep engine={testEngine} isSubmitted={isTestSubmitted} onSubmit={handleSubmitTest} onReset={handleResetTest} />,
    ),
    step(
      'solutions',
      'حلول الاختبار',
      'الاختبار النهائي (٢٠ سؤالًا)',
      '📗',
      <SolutionsArea
        test={testDefinition}
        engine={testEngine}
        testId="morphology6-solutions"
        title="حلول اختبار الدرس السادس: الفعل الرباعي المجرّد والمزيد"
        revealFeedback={isTestSubmitted}
      />,
    ),

    step('teacher', 'منطقة خاصة بالمعلم', 'منطقة المعلم', '🔐', <TeacherArea />),
  ]

  return (
    <LessonFlow
      steps={steps}
      onProgressChange={onProgressChange}
      onFinish={onFinish}
      lessonTitle="الفعل الرباعي المجرّد والمزيد"
      lessonNumber="٦"
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
