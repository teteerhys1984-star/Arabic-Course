import { useState, type ReactNode } from 'react'
import { LessonFlow, type LessonStepDefinition } from '../shared/components/LessonFlow'
import { TeacherSpace } from '../shared/teacher/TeacherSpace'
import { COURSE_TEACHER_PASSWORD } from '../shared/teacher/teacherPassword'
import * as C from './morphology-lesson-05/content'
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
 * الأربع صفحات تُعرض كخطوات مستقلة، ولكل صفحة زر «تحقّق من الإجابات».
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
 * ================================================================== */

function Callout({ children, title = 'ملاحظة مهمة' }: { children: ReactNode; title?: string }) {
  return (
    <aside className="morph5-callout">
      <strong>{title}</strong>
      <div>{children}</div>
    </aside>
  )
}

function Clarification({ children }: { children: ReactNode }) {
  return (
    <aside className="morph5-clarification">
      <span className="morph5-clarification__badge">توضيح تعليمي من المنصة</span>
      <div>{children}</div>
    </aside>
  )
}

function Bullets({ items }: { items: readonly string[] }) {
  return (
    <ul className="morph5-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

function Feedback({ ok, children, testId }: { ok: boolean; children: ReactNode; testId?: string }) {
  return (
    <div
      className={ok ? 'morph5-feedback morph5-feedback--ok' : 'morph5-feedback morph5-feedback--no'}
      role="status"
      data-testid={testId}
    >
      {children}
    </div>
  )
}

function WeightChip({ weight }: { weight: string }) {
  return (
    <bdi className="morph5-weight" dir="rtl">
      {weight}
    </bdi>
  )
}

function WordChip({ children }: { children: ReactNode }) {
  return (
    <bdi className="morph5-word" dir="rtl">
      {children}
    </bdi>
  )
}

/** بطاقة الوزن: العنوان والزيادة وعدد الزيادات. */
function WeightBanner({ section }: { section: C.WeightSection }) {
  return (
    <div className="morph5-pattern-banner" role="region" aria-label={`بطاقة الوزن ${section.heading}`}>
      <div className="morph5-pattern-banner__cell">
        <span className="morph5-pattern-banner__label">{section.orderLabel}</span>
        <span className="morph5-pattern-banner__value">
          <WeightChip weight={section.weight} />
        </span>
      </div>
      <div className="morph5-pattern-banner__cell">
        <span className="morph5-pattern-banner__label">عدد الزيادات</span>
        <span className="morph5-pattern-banner__value">{section.extraCount}</span>
      </div>
      <div className="morph5-pattern-banner__cell morph5-pattern-banner__cell--wide">
        <span className="morph5-pattern-banner__label">الزيادة</span>
        <span className="morph5-pattern-banner__value">{section.extraStatement}</span>
      </div>
    </div>
  )
}

/** جدول أمثلة الوزن بعد إعادة البناء (م-11) دون خلايا فارغة. */
function WeightExamplesTable({ section }: { section: C.WeightSection }) {
  return (
    <div className="morph5-table-wrap">
      <table className="morph5-table">
        <caption className="morph5-caption">{section.tableCaption}</caption>
        <thead>
          <tr>
            <th scope="col">الفعل المجرّد</th>
            <th scope="col">الفعل المزيد</th>
            <th scope="col">الوزن</th>
            <th scope="col">ملاحظة</th>
          </tr>
        </thead>
        <tbody>
          {section.rows.map((row) => (
            <tr key={row.mazeed}>
              <td>
                {row.kind === 'pair' ? (
                  <WordChip>{row.simple}</WordChip>
                ) : (
                  <span className="morph5-muted" aria-label="مثال على الوزن فقط">
                    — (مثال على الوزن)
                  </span>
                )}
              </td>
              <td>
                <WordChip>{row.mazeed}</WordChip>
              </td>
              <td>
                <WeightChip weight={section.weight} />
              </td>
              <td className="morph5-table__note">
                {row.note ?? (row.kind === 'pair' ? 'مقارنة مباشرة بين مجرد ومزيد.' : 'مثال يوضّح الوزن فقط.')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {section.tableNote && <p className="morph5-muted">{section.tableNote}</p>}
    </div>
  )
}

/** خطوة شرح وزن كاملة (تُستعمل للوزان التسعة). */
function WeightStep({ section }: { section: C.WeightSection }) {
  return (
    <>
      <WeightBanner section={section} />
      {section.intro && <p>{section.intro}</p>}
      {section.extraClarification && (
        <Clarification>
          <p>{section.extraClarification}</p>
        </Clarification>
      )}
      <WeightExamplesTable section={section} />
      {section.analysisLead && (
        <>
          <h4>{section.analysisLead}</h4>
          {section.analysisIntro && <p>{section.analysisIntro}</p>}
          <Bullets items={section.analysis ?? []} />
          {section.analysisConclusion && (
            <p>
              <strong>{section.analysisConclusion}</strong>
            </p>
          )}
        </>
      )}
      <h4>{section.meaningHeading}</h4>
      {section.meaningPoints.map((point) => (
        <div key={point.title ?? point.body}>
          {point.title && <p className="morph5-meaning-title">{point.title}</p>}
          {point.body && <p>{point.body}</p>}
          {point.pairs?.map((pair) => (
            <div key={`${pair.simple}-${pair.mazeed}`} className="morph5-pair">
              {pair.simple && (
                <p className="morph5-pair__line">
                  <WordChip>{pair.simple}</WordChip> ← <WordChip>{pair.mazeed}</WordChip>
                </p>
              )}
              {pair.sentences && <Bullets items={pair.sentences} />}
            </div>
          ))}
        </div>
      ))}
      {section.closingNote && (
        <Callout title="انتبه">
          <p>{section.closingNote}</p>
        </Callout>
      )}
    </>
  )
}

/* ================================================================== *
 * التمهيد والأهداف والمراجعة
 * ================================================================== */

function IntroStep() {
  const H = C.lessonHeader
  return (
    <>
      <div className="morph5-hero">
        <span>{H.section}</span>
        <span>{C.arabicDigits(9)} أوزان مشهورة</span>
        <span>{C.arabicDigits(11)} قسمًا</span>
        <span>٣ تدريبات + ٥ مختبرات</span>
        <span>اختبار من {C.arabicDigits(20)} سؤالًا</span>
      </div>
      <p className="morph5-big">{H.welcome}</p>
      <p>{H.prerequisiteLink}</p>
      <p>{H.todayIntro}</p>
      <Callout title="لماذا ندرس أوزان الفعل الثلاثي المزيد؟">
        <p>{H.whyItMatters}</p>
      </Callout>
      <p>{H.roadmapNote}</p>
      <h4>أقسام الدرس</h4>
      <ol className="morph5-list morph5-list--numbered">
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
      <ol className="morph5-list morph5-list--numbered">
        {C.objectives.map((goal) => (
          <li key={goal}>{goal}</li>
        ))}
      </ol>
    </>
  )
}

function ReviewMujarradStep() {
  const R = C.reviewSection.mujarrad
  return (
    <>
      <h4>{R.heading}</h4>
      <p>{R.definition}</p>
      <p>{R.examplesLead}</p>
      <div className="morph5-chips" role="list" aria-label="أمثلة الثلاثي المجرّد">
        {R.examples.map((verb) => (
          <WordChip key={verb}>
            <span role="listitem">{verb}</span>
          </WordChip>
        ))}
      </div>
      <p>{R.exampleLead}</p>
      <Bullets items={R.exampleLetters} />
      <p>
        <strong>{R.weightConclusion}</strong>
      </p>
    </>
  )
}

function ReviewMazeedStep() {
  const R = C.reviewSection.mazeed
  return (
    <>
      <h4>{R.heading}</h4>
      <p>{R.definition}</p>
      <p>{R.examplesLead}</p>
      <div className="morph5-chips" role="list" aria-label="أمثلة الانتقال من المجرّد إلى المزيد">
        {R.pairs.map((pair) => (
          <span key={pair.mazeed} className="morph5-pair__line" role="listitem">
            <WordChip>{pair.simple}</WordChip> ← <WordChip>{pair.mazeed}</WordChip>
          </span>
        ))}
      </div>
      <Callout title="فكرة أساسية">
        <p>{R.note}</p>
      </Callout>
    </>
  )
}

function ReviewMizanStep() {
  const R = C.reviewSection.mizan
  return (
    <>
      <h4>{R.heading}</h4>
      <p>{R.definition}</p>
      <p>{R.exampleLead}</p>
      <div className="morph5-table-wrap">
        <table className="morph5-table">
          <caption className="morph5-caption">{R.tableLead}</caption>
          <thead>
            <tr>
              <th scope="col">الفعل</th>
              <th scope="col">الوزن الصرفي</th>
            </tr>
          </thead>
          <tbody>
            {R.table.map((row) => (
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
      <p>
        <strong>{R.conclusion}</strong>
      </p>
    </>
  )
}

function DivideStep() {
  const D = C.divisionSection
  return (
    <>
      <h4>{D.heading}</h4>
      <p>{D.lead}</p>
      <div className="morph5-table-wrap">
        <table className="morph5-table">
          <caption className="morph5-caption">تقسيم الأوزان بحسب عدد أحرف الزيادة</caption>
          <thead>
            <tr>
              <th scope="col">عدد الزيادات</th>
              <th scope="col">القسم</th>
              <th scope="col">الأوزان</th>
              <th scope="col">أمثلة</th>
            </tr>
          </thead>
          <tbody>
            {D.table.map((row) => (
              <tr key={row.title}>
                <td>
                  <bdi>{C.arabicDigits(row.number)}</bdi> — {row.extraLabel}
                </td>
                <td>{row.title}</td>
                <td>
                  <WeightChip weight={row.weights} />
                </td>
                <td>
                  <WordChip>{row.examples}</WordChip>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Clarification>
        <p>{D.orderNote}</p>
      </Clarification>
      <p>{D.closing}</p>
    </>
  )
}

/* ================================================================== *
 * خامسًا: المزيد بثلاثة أحرف + الأوزان النادرة + الجدول الشامل
 * ================================================================== */

function ThreeLetterStep() {
  const R = C.rareThreeLetterWeights
  return (
    <>
      <WeightStep section={C.threeLetterWeight} />
      <h4>{R.heading}</h4>
      <p>{R.lead}</p>
      <div className="morph5-chips" role="list" aria-label="أوزان نادرة">
        {R.weights.map((weight) => (
          <WeightChip key={weight} weight={weight} />
        ))}
      </div>
      <Callout title="إحالة تمهيدية">
        <p>{R.note}</p>
      </Callout>
    </>
  )
}

function NineTableStep() {
  const I = C.nineWeightsIntro
  return (
    <>
      <h4>{I.heading}</h4>
      <p>{I.lead}</p>
      <div className="morph5-table-wrap">
        <table className="morph5-table" data-testid="morph5-nine-table">
          <caption className="morph5-caption">الأوزان التسعة الشائعة للفعل الثلاثي المزيد</caption>
          <thead>
            <tr>
              <th scope="col">عدد الزيادات</th>
              <th scope="col">الوزن</th>
              <th scope="col">مثال</th>
            </tr>
          </thead>
          <tbody>
            {C.nineWeightsTable.map((row) => (
              <tr key={row.weight}>
                <td>{row.extraCount}</td>
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
      <p>{I.closing}</p>
    </>
  )
}

/* ================================================================== *
 * سابعًا: المقارنات
 * ================================================================== */

function CompareStep({ comparison }: { comparison: C.ComparisonSection }) {
  return (
    <>
      <h4>{comparison.heading}</h4>
      <div className="morph5-compare">
        <section className="morph5-compare__col" aria-label={comparison.leftLabel}>
          <h5>
            <WeightChip weight={comparison.leftLabel} />
          </h5>
          <p>{comparison.leftFeature}</p>
          <div className="morph5-chips">
            {comparison.leftExamples.map((example) => (
              <WordChip key={example}>{example}</WordChip>
            ))}
          </div>
        </section>
        <section className="morph5-compare__col" aria-label={comparison.rightLabel}>
          <h5>
            <WeightChip weight={comparison.rightLabel} />
          </h5>
          <p>{comparison.rightFeature}</p>
          <div className="morph5-chips">
            {comparison.rightExamples.map((example) => (
              <WordChip key={example}>{example}</WordChip>
            ))}
          </div>
        </section>
      </div>
      <h5>طريقة التمييز:</h5>
      <Bullets items={comparison.tips} />
      {comparison.closing && <p>{comparison.closing}</p>}
    </>
  )
}

function AnalysisStepsStep() {
  const A = C.analysisStepsIntro
  return (
    <>
      <h4>{A.heading}</h4>
      <p>{A.lead}</p>
      <ol className="morph5-steps">
        {C.analysisSteps.map((step) => (
          <li key={step.n} className="morph5-steps__item">
            <span className="morph5-steps__num" aria-hidden="true">
              <bdi>{C.arabicDigits(step.n)}</bdi>
            </span>
            <div>
              <p>
                <strong>{step.title}</strong>
              </p>
              <p className="morph5-muted">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>
      <p>{A.closing}</p>
    </>
  )
}

/* ================================================================== *
 * المختبرات التفاعلية
 * ================================================================== */

function LabDecomposeStep() {
  const L = C.labDecompose
  const [extra, setExtra] = useState<Record<string, string>>({})
  const [weight, setWeight] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  return (
    <>
      <h4>{L.heading}</h4>
      <p>{L.instruction}</p>
      <div className="morph5-grid" data-testid="morph5-lab-decompose">
        {L.items.map((item) => {
          const isChecked = Boolean(checked[item.id])
          const ok = extra[item.id] === item.extra && weight[item.id] === item.weight
          return (
            <article key={item.id} className="morph5-item" data-testid={item.id}>
              <p className="morph5-item__title">
                <bdi>{C.arabicDigits(item.number)}</bdi>. فكّك:{' '}
                <WordChip>{item.verb}</WordChip>
              </p>
              <div className="morph5-fields">
                <label className="morph5-field">
                  <span className="morph5-field__label">حروف الزيادة في {item.verb}</span>
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
                <label className="morph5-field">
                  <span className="morph5-field__label">وزن {item.verb}</span>
                  <select
                    value={weight[item.id] ?? ''}
                    onChange={(event) => {
                      setWeight((curr) => ({ ...curr, [item.id]: event.target.value }))
                      setChecked((curr) => ({ ...curr, [item.id]: false }))
                    }}
                  >
                    <option value="">— اختر —</option>
                    {C.NINE_WEIGHTS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="morph5-item__actions">
                <button
                  type="button"
                  className="button button--secondary"
                  disabled={!extra[item.id] || !weight[item.id]}
                  onClick={() => setChecked((curr) => ({ ...curr, [item.id]: true }))}
                >
                  تحقق من التحليل
                </button>
              </div>
              {isChecked && (
                <Feedback ok={ok} testId={`${item.id}-feedback`}>
                  <p>
                    <strong>{ok ? 'تحليل صحيح ودقيق.' : 'راجع تحليلك.'}</strong>
                  </p>
                  <p>
                    الأصل: <WordChip>{item.origin}</WordChip> — الحروف الأصلية:{' '}
                    <bdi>{item.originLetters}</bdi> — الزيادة: {item.extra} — الوزن:{' '}
                    <WeightChip weight={item.weight} />
                  </p>
                  <p className="morph5-muted">{item.reason}</p>
                </Feedback>
              )}
            </article>
          )
        })}
      </div>
    </>
  )
}

function LabMatchStep() {
  const L = C.labMatch
  const [picks, setPicks] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  return (
    <>
      <h4>{L.heading}</h4>
      <p>{L.instruction}</p>
      <div className="morph5-grid" data-testid="morph5-lab-match">
        {L.items.map((item) => {
          const isChecked = Boolean(checked[item.id])
          const ok = picks[item.id] === item.answer
          return (
            <article key={item.id} className="morph5-item" data-testid={item.id}>
              <p className="morph5-item__title">
                <bdi>{C.arabicDigits(item.number)}</bdi>. <WordChip>{item.verb}</WordChip>
              </p>
              <label className="morph5-field">
                <span className="morph5-field__label">وزن الفعل {item.verb}</span>
                <select
                  value={picks[item.id] ?? ''}
                  onChange={(event) => {
                    setPicks((curr) => ({ ...curr, [item.id]: event.target.value }))
                    setChecked((curr) => ({ ...curr, [item.id]: false }))
                  }}
                >
                  <option value="">— اختر —</option>
                  {C.NINE_WEIGHTS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <div className="morph5-item__actions">
                <button
                  type="button"
                  className="button button--secondary"
                  disabled={!picks[item.id]}
                  onClick={() => setChecked((curr) => ({ ...curr, [item.id]: true }))}
                >
                  تحقق من الإجابة
                </button>
              </div>
              {isChecked && (
                <Feedback ok={ok} testId={`${item.id}-feedback`}>
                  <p>
                    <strong>{ok ? 'إجابة صحيحة.' : 'إجابة غير صحيحة.'}</strong> الوزن الصحيح:{' '}
                    <WeightChip weight={item.answer} />
                  </p>
                  <p className="morph5-muted">{item.reason}</p>
                </Feedback>
              )}
            </article>
          )
        })}
      </div>
    </>
  )
}

function LabDistinguishStep() {
  const L = C.labDistinguish
  const [picks, setPicks] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  return (
    <>
      <h4>{L.heading}</h4>
      <p>{L.instruction}</p>
      <div className="morph5-grid" data-testid="morph5-lab-distinguish">
        {L.items.map((item) => {
          const picked = picks[item.id]
          const isChecked = Boolean(checked[item.id])
          const ok = picked === item.answer
          return (
            <article key={item.id} className="morph5-item" data-testid={item.id}>
              <p className="morph5-item__title">
                <bdi>{C.arabicDigits(item.number)}</bdi>. {item.prompt}
              </p>
              <fieldset className="morph5-options morph5-options--stacked">
                <legend className="morph5-sr">اختر التمييز الصحيح</legend>
                {item.options.map((option) => (
                  <label key={option} className="morph5-option">
                    <input
                      type="radio"
                      name={item.id}
                      value={option}
                      checked={picked === option}
                      onChange={() => {
                        setPicks((curr) => ({ ...curr, [item.id]: option }))
                        setChecked((curr) => ({ ...curr, [item.id]: false }))
                      }}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </fieldset>
              <div className="morph5-item__actions">
                <button
                  type="button"
                  className="button button--secondary"
                  disabled={picked === undefined}
                  onClick={() => setChecked((curr) => ({ ...curr, [item.id]: true }))}
                >
                  تحقق من الإجابة
                </button>
              </div>
              {isChecked && (
                <Feedback ok={ok} testId={`${item.id}-feedback`}>
                  <p>
                    <strong>{ok ? 'إجابة صحيحة.' : 'إجابة غير صحيحة.'}</strong>
                  </p>
                  {!ok && <p>التمييز الصحيح: {item.answer}</p>}
                  <p className="morph5-muted">{item.explanation}</p>
                </Feedback>
              )}
            </article>
          )
        })}
      </div>
    </>
  )
}

function LabOrderStep() {
  const L = C.labOrder
  const [picks, setPicks] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const ok = L.items.every((item) => picks[item.id] === item.answer)

  return (
    <>
      <h4>{L.heading}</h4>
      <p>{L.instruction}</p>
      <div className="morph5-grid" data-testid="morph5-lab-order">
        {L.items.map((item) => (
          <article key={item.id} className="morph5-item" data-testid={item.id}>
            <p className="morph5-item__title">
              الخطوة <bdi>{C.arabicDigits(item.number)}</bdi>
            </p>
            <label className="morph5-field">
              <span className="morph5-field__label">وصف الخطوة {C.arabicDigits(item.number)}</span>
              <select
                value={picks[item.id] ?? ''}
                onChange={(event) => {
                  setPicks((curr) => ({ ...curr, [item.id]: event.target.value }))
                  setChecked(false)
                }}
              >
                <option value="">— اختر —</option>
                {item.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </article>
        ))}
      </div>
      <div className="morph5-item__actions">
        <button
          type="button"
          className="button button--secondary"
          disabled={L.items.some((item) => !picks[item.id])}
          onClick={() => setChecked(true)}
        >
          تحقق من الترتيب
        </button>
        <button type="button" className="button button--ghost" onClick={() => setRevealed((v) => !v)}>
          {revealed ? 'إخفاء الحل' : 'إظهار الحل'}
        </button>
        <button
          type="button"
          className="button button--secondary"
          onClick={() => {
            setPicks({})
            setChecked(false)
            setRevealed(false)
          }}
        >
          إعادة النشاط
        </button>
      </div>
      {checked && (
        <Feedback ok={ok} testId="lab-order-feedback">
          <p>
            <strong>{ok ? 'ترتيب صحيح ودقيق.' : 'الترتيب غير صحيح بعد؛ راجع الخطوات.'}</strong>
          </p>
        </Feedback>
      )}
      {revealed && (
        <div className="morph5-example" data-testid="lab-order-solution">
          <p>
            <strong>الترتيب الصحيح لتحليل «{L.stepsExample}»:</strong>
          </p>
          <Bullets items={L.solution} />
        </div>
      )}
    </>
  )
}

function LabClassifyStep() {
  const L = C.labClassify
  const [picks, setPicks] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  return (
    <>
      <h4>{L.heading}</h4>
      <p>{L.instruction}</p>
      <div className="morph5-grid" data-testid="morph5-lab-classify">
        {L.items.map((item) => {
          const isChecked = Boolean(checked[item.id])
          const ok = picks[item.id] === item.answer
          return (
            <article key={item.id} className="morph5-item" data-testid={item.id}>
              <p className="morph5-item__title">
                <bdi>{C.arabicDigits(item.number)}</bdi>. <WordChip>{item.verb}</WordChip>
              </p>
              <label className="morph5-field">
                <span className="morph5-field__label">تصنيف {item.verb}</span>
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
              <div className="morph5-item__actions">
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
                  <p className="morph5-muted">{item.detail}</p>
                </Feedback>
              )}
            </article>
          )
        })}
      </div>
    </>
  )
}

/* ================================================================== *
 * التدريبات الأصلية الثلاثة
 * ================================================================== */

function TrainingOneStep() {
  const T = C.trainingOne
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  function resetTraining() {
    setAnswers({})
    setChecked({})
  }

  return (
    <>
      <h4>{T.heading}</h4>
      <p>{T.instruction}</p>
      <div className="morph5-grid" data-testid="morph5-training-one">
        {T.items.map((item) => {
          const picked = answers[item.id]
          const isChecked = Boolean(checked[item.id])
          const isCorrect = picked === item.answer
          return (
            <article key={item.id} className="morph5-item" data-testid={`train1-${item.id}`}>
              <p className="morph5-item__title">
                <bdi>{C.arabicDigits(item.number)}</bdi>. ما وزن <WordChip>{item.verb}</WordChip>؟
              </p>
              <fieldset className="morph5-options morph5-options--stacked">
                <legend className="morph5-sr">اختر وزن {item.verb}</legend>
                {item.options.map((option) => (
                  <label key={option} className="morph5-option">
                    <input
                      type="radio"
                      name={`train1-${item.id}`}
                      value={option}
                      checked={picked === option}
                      onChange={() => {
                        setAnswers((curr) => ({ ...curr, [item.id]: option }))
                        setChecked((curr) => ({ ...curr, [item.id]: false }))
                      }}
                    />
                    <WeightChip weight={option} />
                  </label>
                ))}
              </fieldset>
              <div className="morph5-item__actions">
                <button
                  type="button"
                  className="button button--secondary"
                  disabled={picked === undefined}
                  onClick={() => setChecked((curr) => ({ ...curr, [item.id]: true }))}
                >
                  تحقق من الإجابة
                </button>
              </div>
              {isChecked && (
                <Feedback ok={isCorrect} testId={`train1-${item.id}-feedback`}>
                  <p>
                    <strong>{isCorrect ? 'إجابة صحيحة.' : 'إجابة غير صحيحة.'}</strong>
                    {!isCorrect && (
                      <>
                        {' '}
                        الوزن الصحيح: <WeightChip weight={item.answer} />
                      </>
                    )}
                  </p>
                  <p className="morph5-muted">{item.explanation}</p>
                </Feedback>
              )}
            </article>
          )
        })}
      </div>
      <div className="morph5-item__actions">
        <button type="button" className="button button--secondary" onClick={resetTraining} data-testid="train1-retry">
          {T.retryLabel}
        </button>
      </div>
    </>
  )
}

function TrainingTwoStep() {
  const T = C.trainingTwo
  const [extra, setExtra] = useState<Record<string, string>>({})
  const [weight, setWeight] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})

  function resetTraining() {
    setExtra({})
    setWeight({})
    setChecked({})
    setRevealed({})
  }

  return (
    <>
      <h4>{T.heading}</h4>
      <p>{T.instruction}</p>
      <div className="morph5-grid" data-testid="morph5-training-two">
        {T.items.map((item) => {
          const isChecked = Boolean(checked[item.id])
          const isRevealed = Boolean(revealed[item.id])
          const isCorrect = extra[item.id] === item.extra && weight[item.id] === item.weight
          return (
            <article key={item.id} className="morph5-item" data-testid={`train2-${item.id}`}>
              <p className="morph5-item__title">
                <bdi>{C.arabicDigits(item.number)}</bdi>. <WordChip>{item.verb}</WordChip>
              </p>
              <div className="morph5-fields">
                <label className="morph5-field">
                  <span className="morph5-field__label">حروف الزيادة في {item.verb}</span>
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
                <label className="morph5-field">
                  <span className="morph5-field__label">وزن {item.verb}</span>
                  <select
                    value={weight[item.id] ?? ''}
                    onChange={(event) => {
                      setWeight((curr) => ({ ...curr, [item.id]: event.target.value }))
                      setChecked((curr) => ({ ...curr, [item.id]: false }))
                    }}
                  >
                    <option value="">— اختر —</option>
                    {item.weightOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="morph5-item__actions">
                <button
                  type="button"
                  className="button button--secondary"
                  disabled={!extra[item.id] || !weight[item.id]}
                  onClick={() => setChecked((curr) => ({ ...curr, [item.id]: true }))}
                >
                  تحقق من الإجابة
                </button>
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={() => setRevealed((curr) => ({ ...curr, [item.id]: !curr[item.id] }))}
                >
                  {isRevealed ? 'إخفاء الحل' : T.revealLabel}
                </button>
              </div>
              {isChecked && (
                <Feedback ok={isCorrect} testId={`train2-${item.id}-feedback`}>
                  <p>
                    <strong>{isCorrect ? 'إجابة صحيحة.' : 'إجابة غير صحيحة.'}</strong>
                  </p>
                  <p>{item.solution}</p>
                </Feedback>
              )}
              {isRevealed && !isChecked && (
                <div className="morph5-example" data-testid={`train2-${item.id}-solution`}>
                  <p>{item.solution}</p>
                </div>
              )}
            </article>
          )
        })}
      </div>
      <div className="morph5-item__actions">
        <button type="button" className="button button--secondary" onClick={resetTraining} data-testid="train2-retry">
          {T.retryLabel}
        </button>
      </div>
    </>
  )
}

function TrainingThreeStep() {
  const T = C.trainingThree
  const [picks, setPicks] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [revealAll, setRevealAll] = useState(false)

  return (
    <>
      <h4>{T.heading}</h4>
      <p>{T.instruction}</p>
      <div className="morph5-grid" data-testid="morph5-training-three">
        {T.items.map((item) => {
          const isChecked = Boolean(checked[item.id])
          const isCorrect = picks[item.id] === item.answer
          return (
            <article key={item.id} className="morph5-item" data-testid={`train3-${item.id}`}>
              <p className="morph5-item__title">
                <bdi>{C.arabicDigits(item.number)}</bdi>. <WordChip>{item.verb}</WordChip>
              </p>
              <label className="morph5-field">
                <span className="morph5-field__label">تصنيف {item.verb}</span>
                <select
                  value={picks[item.id] ?? ''}
                  onChange={(event) => {
                    setPicks((curr) => ({ ...curr, [item.id]: event.target.value }))
                    setChecked((curr) => ({ ...curr, [item.id]: false }))
                  }}
                >
                  <option value="">— اختر —</option>
                  {C.TRAINING_THREE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <div className="morph5-item__actions">
                <button
                  type="button"
                  className="button button--secondary"
                  disabled={!picks[item.id]}
                  onClick={() => setChecked((curr) => ({ ...curr, [item.id]: true }))}
                >
                  تحقق من الإجابة
                </button>
              </div>
              {isChecked && (
                <Feedback ok={isCorrect} testId={`train3-${item.id}-feedback`}>
                  <p>
                    <strong>{isCorrect ? 'تصنيف صحيح.' : 'تصنيف غير صحيح.'}</strong> التصنيف الصحيح: {item.answer}
                  </p>
                  <p className="morph5-muted">{item.detail}</p>
                </Feedback>
              )}
            </article>
          )
        })}
      </div>
      <div className="morph5-item__actions">
        <button
          type="button"
          className="button button--ghost"
          onClick={() => setRevealAll((v) => !v)}
          data-testid="train3-reveal"
        >
          {revealAll ? 'إخفاء الحل الكامل' : T.revealLabel}
        </button>
        <button
          type="button"
          className="button button--secondary"
          onClick={() => {
            setPicks({})
            setChecked({})
            setRevealAll(false)
          }}
          data-testid="train3-retry"
        >
          {T.retryLabel}
        </button>
      </div>
      {revealAll && (
        <div className="morph5-example" data-testid="train3-solution">
          <p>
            <strong>الحل الكامل للتدريب الثالث:</strong>
          </p>
          <ul className="morph5-list">
            {T.items.map((item) => (
              <li key={item.id}>
                <WordChip>{item.verb}</WordChip>: {item.answer} — {item.detail}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}

/* ================================================================== *
 * الأخطاء الشائعة والخلاصة والدرس القادم
 * ================================================================== */

function MistakesStep() {
  const M = C.mistakesSection
  return (
    <>
      <h4>{M.heading}</h4>
      <div className="morph5-grid">
        {M.items.map((mistake) => (
          <article key={mistake.id} className="morph5-item">
            <p className="morph5-item__title">{mistake.title}</p>
            <p>{mistake.body}</p>
          </article>
        ))}
      </div>
    </>
  )
}

function SummaryStep() {
  const S = C.summarySection
  return (
    <>
      <h4>{S.heading}</h4>
      <p>{S.lead}</p>
      <div className="morph5-table-wrap">
        <table className="morph5-table">
          <caption className="morph5-caption">خلاصة الأوزان التسعة</caption>
          <thead>
            <tr>
              <th scope="col">عدد الزيادات</th>
              <th scope="col">الأوزان</th>
            </tr>
          </thead>
          <tbody>
            {S.groups.map((group) => (
              <tr key={group.label}>
                <td>{group.label}</td>
                <td>
                  <WeightChip weight={group.weights} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        <strong>{S.closing}</strong>
      </p>
    </>
  )
}

function NextLessonStep() {
  const N = C.nextLessonSection
  return (
    <>
      <p>{N.lead}</p>
      <p className="morph5-big">{N.title}</p>
      <p>{N.body}</p>
      <Callout title="نصيحة">
        <p>{N.advice}</p>
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
    <section className="morph5-submit" aria-labelledby="morph5-submit-title" data-testid="morph5-submit">
      <h3 id="morph5-submit-title">تسليم الاختبار والنتيجة</h3>
      <p>
        أجبت عن <bdi>{C.arabicDigits(answered)}</bdi> من <bdi>{C.arabicDigits(total)}</bdi> سؤالًا.
      </p>
      {!isSubmitted ? (
        <>
          <p>
            لا تُكشف صحة الإجابات أو الحلول النموذجية أو النتيجة النهائية إلا بعد تسليم الاختبار كاملًا. اضغط زر
            «تسليم الاختبار وإظهار النتيجة» أدناه لاعتماد إجاباتك وإظهار النتيجة النهائية وكشف الحلول النموذجية.
          </p>
          <div className="morph5-item__actions">
            <button
              type="button"
              className="button button--primary"
              onClick={onSubmit}
              data-testid="morph5-submit-btn"
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
            <p className="morph5-score">
              النتيجة: <bdi>{C.arabicDigits(finalResult.correct)}</bdi> من{' '}
              <bdi>{C.arabicDigits(finalResult.total)}</bdi> إجابة صحيحة
            </p>
            <ul className="morph5-counts">
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
          <div className="morph5-item__actions">
            <button type="button" className="button button--secondary" onClick={onReset}>
              إعادة الاختبار
            </button>
          </div>
        </>
      )}
      <p className="morph5-muted">
        «إعادة الاختبار» تمسح كل الإجابات ونتائج الصفحات، فتُقفَل النتيجة والحلول من جديد حتى تسلّم الاختبار مرة
        أخرى.
      </p>
    </section>
  )
}

function TeacherArea() {
  return (
    <TeacherSpace password={COURSE_TEACHER_PASSWORD}>
      <div className="teacher-material teacher-material--morphology5">
        <p className="morph5-keys__note">{C.teacherKeyHeader}</p>

        <h3>أ. الحلول التفصيلية لاختبار الدرس (٢٠ سؤالًا)</h3>
        <SolutionsArea
          test={testDefinition}
          mode="teacher"
          title="الحلول التفصيلية لاختبار الدرس الخامس: أوزان الفعل الثلاثي المزيد"
          eyebrow="منطقة المعلم"
        />

        <h3>ب. حل التدريب الأول: حدّد وزن الفعل (٨ أسئلة)</h3>
        <ol className="morph5-keys">
          {C.trainingOne.items.map((item) => (
            <li key={item.id}>
              <strong>
                <WordChip>{item.verb}</WordChip>:
              </strong>{' '}
              الوزن الصحيح: <WeightChip weight={item.answer} />. <span>{item.explanation}</span>
            </li>
          ))}
        </ol>

        <h3>ج. حل التدريب الثاني: استخرج الحروف الأصلية والزائدة (٥ عناصر)</h3>
        <ol className="morph5-keys">
          {C.trainingTwo.items.map((item) => (
            <li key={item.id}>
              <strong>
                <WordChip>{item.verb}</WordChip>:
              </strong>{' '}
              {item.solution}
            </li>
          ))}
        </ol>

        <h3>د. حل التدريب الثالث: ميّز بين المجرّد والمزيد (٦ عناصر)</h3>
        <ol className="morph5-keys">
          {C.trainingThree.items.map((item) => (
            <li key={item.id}>
              <strong>
                <WordChip>{item.verb}</WordChip>:
              </strong>{' '}
              {item.answer} — {item.detail}
            </li>
          ))}
        </ol>

        <h3>هـ. حلول المختبرات التفاعلية الخمسة</h3>
        <ul className="morph5-list">
          {C.teacherLabKeys.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>

        <h3>و. سجل التدقيق العلمي وحسم التصحيحات</h3>
        <ul className="morph5-list">
          {C.teacherAuditNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>

        <h3>ز. أخطاء متوقعة عند الطلاب وكيفية معالجتها</h3>
        <ul className="morph5-list">
          {C.teacherMistakes.map((mistake) => (
            <li key={mistake}>{mistake}</li>
          ))}
        </ul>
      </div>
    </TeacherSpace>
  )
}

/* ================================================================== *
 * تجميع خطوات الدرس الخامس
 * ================================================================== */

export function LessonMorphologyFive({ onProgressChange, onFinish }: Props) {
  // المحرك المشترك يعيش فوق LessonFlow، فتبقى الإجابات والنتائج محفوظة عند التنقل بين الخطوات.
  const testEngine = useTestEngine(testDefinition)
  const [testSubmitted, setTestSubmitted] = useState(false)
  const isTestSubmitted = testSubmitted && testEngine.allPagesChecked

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
        questionTestIdPrefix="morph5-question"
        revealFeedback={isTestSubmitted}
      />
    )),
  )

  const steps: LessonStepDefinition[] = [
    step('intro', 'الدرس الخامس: أوزان الفعل الثلاثي المزيد', 'التمهيد والأهداف والمراجعة', '🌷', <IntroStep />),
    step('goals', 'أهداف الدرس', 'التمهيد والأهداف والمراجعة', '🎯', <GoalsStep />),
    step('review-mujarrad', 'أولًا (١): ما الفعل الثلاثي المجرّد؟', 'التمهيد والأهداف والمراجعة', '1️⃣', <ReviewMujarradStep />),
    step('review-mazeed', 'أولًا (٢): ما الفعل الثلاثي المزيد؟', 'التمهيد والأهداف والمراجعة', '2️⃣', <ReviewMazeedStep />),
    step('review-mizan', 'أولًا (٣): ما فائدة الميزان الصرفي هنا؟', 'التمهيد والأهداف والمراجعة', '⚖️', <ReviewMizanStep />),

    step('divide', 'ثانيًا: كيف تُقسَّم أوزان الفعل الثلاثي المزيد؟', 'تقسيم الأوزان', '🗂️', <DivideStep />),

    step('afala', 'ثالثًا (١): الوزن الأول أَفْعَلَ', 'المزيد بحرف واحد', '1️⃣', <WeightStep section={C.oneLetterWeights[0]} />),
    step('fazzala', 'ثالثًا (٢): الوزن الثاني فَعَّلَ', 'المزيد بحرف واحد', '2️⃣', <WeightStep section={C.oneLetterWeights[1]} />),
    step('faaala', 'ثالثًا (٣): الوزن الثالث فاعَلَ', 'المزيد بحرف واحد', '3️⃣', <WeightStep section={C.oneLetterWeights[2]} />),

    step('infaala', 'رابعًا (١): الوزن الرابع انْفَعَلَ', 'المزيد بحرفين', '4️⃣', <WeightStep section={C.twoLetterWeights[0]} />),
    step('iftaala', 'رابعًا (٢): الوزن الخامس افْتَعَلَ', 'المزيد بحرفين', '5️⃣', <WeightStep section={C.twoLetterWeights[1]} />),
    step('ifalla', 'رابعًا (٣): الوزن السادس افْعَلَّ', 'المزيد بحرفين', '6️⃣', <WeightStep section={C.twoLetterWeights[2]} />),
    step('tafazzala', 'رابعًا (٤): الوزن السابع تَفَعَّلَ', 'المزيد بحرفين', '7️⃣', <WeightStep section={C.twoLetterWeights[3]} />),
    step('tafaaala', 'رابعًا (٥): الوزن الثامن تَفاعَلَ', 'المزيد بحرفين', '8️⃣', <WeightStep section={C.twoLetterWeights[4]} />),

    step('istafala', 'خامسًا: الوزن التاسع اسْتَفْعَلَ والأوزان النادرة', 'المزيد بثلاثة أحرف والجدول الشامل', '9️⃣', <ThreeLetterStep />),
    step('nine-table', 'سادسًا: جدول شامل للأوزان التسعة المشهورة', 'المزيد بثلاثة أحرف والجدول الشامل', '📋', <NineTableStep />),
    step('lab-decompose', 'مختبر: فكّك الوزن وحروف الزيادة', 'المزيد بثلاثة أحرف والجدول الشامل', '🧪', <LabDecomposeStep />),

    step('compare-1', 'سابعًا (١): الفرق بين أَفْعَلَ وفَعَّلَ', 'المقارنات وخطوات التحليل', '🔍', <CompareStep comparison={C.comparisons[0]} />),
    step('compare-2', 'سابعًا (٢): الفرق بين تَفَعَّلَ وتَفاعَلَ', 'المقارنات وخطوات التحليل', '🔍', <CompareStep comparison={C.comparisons[1]} />),
    step('compare-3', 'سابعًا (٣): الفرق بين انْفَعَلَ واسْتَفْعَلَ', 'المقارنات وخطوات التحليل', '🔍', <CompareStep comparison={C.comparisons[2]} />),
    step('compare-4', 'سابعًا (٤): الفرق بين افْتَعَلَ وافْعَلَّ', 'المقارنات وخطوات التحليل', '🔍', <CompareStep comparison={C.comparisons[3]} />),
    step('lab-distinguish', 'مختبر: ميّز بين الأوزان المتشابهة', 'المقارنات وخطوات التحليل', '🧪', <LabDistinguishStep />),
    step('analysis-steps', 'ثامنًا: كيف أحلّل أي فعل مزيد خطوة بخطوة؟', 'المقارنات وخطوات التحليل', '🧭', <AnalysisStepsStep />),
    step('lab-order', 'مختبر: رتّب خطوات تحليل فعل مزيد', 'المقارنات وخطوات التحليل', '🧩', <LabOrderStep />),

    step('lab-classify', 'مختبر: صنّف الأفعال بحسب عدد الزيادات', 'التدريبات التطبيقية', '🗂️', <LabClassifyStep />),
    step('lab-match', 'مختبر: طابِق كل فعل بوزنه', 'التدريبات التطبيقية', '🔗', <LabMatchStep />),
    step('train-1', 'تاسعًا (١): التدريب الأول — حدّد وزن الفعل', 'التدريبات التطبيقية', '✍️', <TrainingOneStep />),
    step('train-2', 'تاسعًا (٢): التدريب الثاني — الحروف الأصلية والزائدة', 'التدريبات التطبيقية', '📊', <TrainingTwoStep />),
    step('train-3', 'تاسعًا (٣): التدريب الثالث — ميّز بين المجرّد والمزيد', 'التدريبات التطبيقية', '✅', <TrainingThreeStep />),

    step('mistakes', 'عاشرًا: أهم الأخطاء التي يجب أن تتجنّبها', 'الخلاصة وما بعد الدرس', '⚠️', <MistakesStep />),
    step('summary', 'الحادي عشر: خلاصة الدرس', 'الخلاصة وما بعد الدرس', '📌', <SummaryStep />),
    step('next-lesson', 'الدرس القادم: الفعل الرباعي المجرّد والمزيد', 'الخلاصة وما بعد الدرس', '➡️', <NextLessonStep />),

    ...testSteps,
    step(
      'submit',
      'تسليم الاختبار والنتيجة',
      'الاختبار النهائي (٢٠ سؤالًا)',
      '✅',
      <SubmitStep
        engine={testEngine}
        isSubmitted={isTestSubmitted}
        onSubmit={handleSubmitTest}
        onReset={handleResetTest}
      />,
    ),
    step(
      'solutions',
      'حلول الاختبار',
      'الاختبار النهائي (٢٠ سؤالًا)',
      '📗',
      <SolutionsArea
        test={testDefinition}
        engine={testEngine}
        testId="morphology5-solutions"
        title="حلول اختبار الدرس الخامس: أوزان الفعل الثلاثي المزيد"
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
      lessonTitle="أوزان الفعل الثلاثي المزيد"
      lessonNumber="٥"
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
