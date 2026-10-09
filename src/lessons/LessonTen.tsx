import { Fragment, useState, type ReactNode } from 'react'
import { EducationalCard } from '../shared/components/EducationalCard'
import { LessonFlow, type LessonStepDefinition } from '../shared/components/LessonFlow'
import { Quiz } from '../shared/quiz/Quiz'
import type { QuizQuestionData } from '../shared/quiz/types'
import { TeacherSpace } from '../shared/teacher/TeacherSpace'
import {
  activityOneRows,
  activityOneSolutions,
  activityTwoRows,
  baseExample,
  challengeRows,
  challengeWhy,
  comparisonRows,
  coreRule,
  discoveryRow,
  easyExamples,
  errorCorrectionRows,
  errorWarnings,
  expectedErrors,
  kanaInnaPairs,
  laitaNote,
  letterData,
  memoryKey,
  mnemonics,
  nasikhaQuiz,
  objectives,
  particles,
  ruleChoiceRows,
  solutionGroups,
  sourceQuestions,
  subSignData,
  summaryPoints,
  teacherNotes,
  testQuestions,
  workedExamples,
  type ActivityRow,
  type LetterData,
  type TestQuestion as LessonTestQuestion,
} from './lesson-ten/content'
import {
  SolutionsArea,
  TestRunner,
  normalizeAnswer,
  useTestEngine,
  type TestDefinition,
  type TestQuestion as SharedTestQuestion,
} from '../shared/test'


/* ================================================================== *
 * اختبار المنصة — shared platform test framework (src/shared/test).
 * Four checkable pages of five questions (the source solution groups),
 * each ending with «تحقّق من الإجابات». The source's harakat-sensitive
 * grading is preserved through `matching: 'strict'`.
 * ================================================================== */

function toTestQuestion(question: LessonTestQuestion): SharedTestQuestion {
  return {
    id: question.id,
    number: question.number,
    level: question.level,
    type: question.type,
    prompt: question.prompt,
    sentence: question.sentence,
    fields: question.fields,
    solution: question.solution,
    rule: question.rule,
    explanation: question.explanation,
    parsing: question.parsing,
  }
}

/** The lesson's platform test, declared once in the shared platform schema. */
// eslint-disable-next-line react-refresh/only-export-components -- the test schema is lesson data, not a component.
export const testDefinition: TestDefinition = { id: 'lesson-10-platform-test', title: 'اختبار الدرس العاشر', matching: 'strict',
  description:
    '20 سؤالًا في أربع صفحات — تحقّق من كل صفحة على حدة، وعدّل إجاباتك وأعِد التحقق متى شئت. لا تظهر التغذية الراجعة ولا الإجابات الصحيحة إلا بعد التحقق من الصفحة.',
  pages: solutionGroups.map((group) => ({
    id: `page-${group.from}`,
    title: group.title,
    questions: testQuestions
      .filter((question) => question.number >= group.from && question.number <= group.to)
      .map(toTestQuestion),
  })),
}

interface Props {
  onProgressChange?: (value: number) => void
  onFinish?: () => void
}

/* ================================================================== *
 * عناصر مشتركة داخل الدرس العاشر
 * ================================================================== */

function PlatformNote({ children }: { children: ReactNode }) {
  return (
    <aside className="lesson-ten-platform-note">
      <span className="lesson-ten-platform-note__badge">شرح المنصة</span>
      <div className="lesson-ten-platform-note__body">{children}</div>
    </aside>
  )
}

function Rule({ children }: { children: ReactNode }) {
  return (
    <div className="lesson-ten-rule">
      <strong>قاعدة</strong>
      <p>{children}</p>
    </div>
  )
}

function GoldenRule({ text }: { text: string }) {
  return (
    <div className="lesson-ten-golden">
      <span aria-hidden="true">⭐</span>
      <p>
        <bdi>{text}</bdi>
      </p>
    </div>
  )
}

function Featured({ children, small = false }: { children: ReactNode; small?: boolean }) {
  return (
    <p className={`lesson-ten-featured${small ? ' lesson-ten-featured--small' : ''}`}>
      <bdi>{children}</bdi>
    </p>
  )
}

function FullParsing({ lines }: { lines: string[] }) {
  return (
    <div className="lesson-ten-parsing" aria-label="إعراب كامل">
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  )
}

/** يُخفي الإعراب الكامل حتى يطلبه الطالب، ليحاول أولًا. */
function ParsingReveal({ lines, label = 'أظهر الإعراب الكامل' }: { lines: string[]; label?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="lesson-ten-reveal">
      <button type="button" className="button button--ghost" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        {open ? 'إخفاء الإعراب الكامل' : label}
      </button>
      {open && <FullParsing lines={lines} />}
    </div>
  )
}

function ChipRow({ items, golden = false }: { items: string[]; golden?: boolean }) {
  return (
    <div className={`lesson-ten-chip-row${golden ? ' lesson-ten-chip-row--golden' : ''}`}>
      {items.map((item) => (
        <bdi key={item}>{item}</bdi>
      ))}
    </div>
  )
}

/** ينقل الجملة من حالتها قبل «إنَّ» إلى حالتها بعدها عند الضغط على الزر. */
function Transform({ before, after, note }: { before: string; after: string; note?: string }) {
  const [applied, setApplied] = useState(false)
  return (
    <div className="lesson-ten-transform">
      <div className="lesson-ten-transform__line">
        <span className="lesson-ten-transform__label">قبل «إنَّ»</span>
        <p>
          <bdi>{before}</bdi>
        </p>
      </div>
      <button type="button" className="button button--secondary" onClick={() => setApplied((value) => !value)}>
        {applied ? 'أعد الجملة إلى ما قبل «إنَّ»' : 'أدخل «إنَّ» على الجملة'}
      </button>
      <div className="lesson-ten-transform__line lesson-ten-transform__line--after" aria-live="polite">
        <span className="lesson-ten-transform__label">بعد «إنَّ»</span>
        {applied ? (
          <>
            <p>
              <bdi>{after}</bdi>
            </p>
            {note && <p className="lesson-ten-note">{note}</p>}
          </>
        ) : (
          <p className="lesson-ten-transform__hidden">اضغط الزر لترى الجملة بعد الدخول.</p>
        )}
      </div>
    </div>
  )
}

/** مستكشف أخوات إنَّ: يختار الطالب حرفًا فيرى معناه ومثاله وإعرابه الكامل. */
function SistersExplorer() {
  const [selected, setSelected] = useState(0)
  const item = particles[selected]
  return (
    <div className="lesson-ten-explorer">
      <div className="lesson-ten-explorer__tabs" role="group" aria-label="اختر حرفًا من أخوات إنَّ">
        {particles.map((particle, index) => (
          <button
            key={particle.id}
            type="button"
            className="lesson-ten-explorer__tab"
            aria-pressed={index === selected}
            onClick={() => setSelected(index)}
          >
            <bdi>{particle.word}</bdi>
          </button>
        ))}
      </div>
      <article className="lesson-ten-explorer__panel" aria-live="polite">
        <h3>
          <bdi>{item.word}</bdi> — {item.kind}
        </h3>
        <p>
          <strong>معناها:</strong> {item.meaning}
        </p>
        <p>
          <strong>المثال:</strong> <bdi>{item.example}</bdi>
        </p>
        <p>
          <strong>اسمها:</strong> <bdi>{item.name}</bdi> <span className="lesson-ten-state lesson-ten-state--accusative">منصوب</span>{' '}
          <strong>وخبرها:</strong> <bdi>{item.khabar}</bdi> <span className="lesson-ten-state lesson-ten-state--nominative">مرفوع</span>
        </p>
        <FullParsing lines={item.parsing} />
      </article>
    </div>
  )
}

function ComparisonTable() {
  return (
    <div className="table-scroll">
      <table className="lesson-ten-table">
        <thead>
          <tr>
            <th scope="col">الجملة</th>
            <th scope="col">الحرف أو الفعل الناسخ</th>
            <th scope="col">الاسم</th>
            <th scope="col">الخبر</th>
          </tr>
        </thead>
        <tbody>
          {comparisonRows.map((row) => (
            <tr key={row.sentence}>
              <td>
                <bdi>{row.sentence}</bdi>
              </td>
              <td>{row.particle}</td>
              <td>{row.name}</td>
              <td>{row.khabar}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** نشاط اختيار بقوائم منسدلة. التصحيح يقارن الحركات كاملة، ولا يُظهر الحل إلا بعد التحقق. */
function ChoiceActivity({
  id,
  title,
  instruction,
  rows,
}: {
  id: string
  title: string
  instruction: string
  rows: ActivityRow[]
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState(false)

  const key = (rowIndex: number, fieldIndex: number) => `${rowIndex}-${fieldIndex}`
  const fieldRight = (rowIndex: number, fieldIndex: number) =>
    normalizeAnswer(answers[key(rowIndex, fieldIndex)]) === normalizeAnswer(rows[rowIndex].fields[fieldIndex].answer)
  const rowRight = (rowIndex: number) => rows[rowIndex].fields.every((_, fieldIndex) => fieldRight(rowIndex, fieldIndex))
  const rowAnswered = (rowIndex: number) =>
    rows[rowIndex].fields.every((_, fieldIndex) => normalizeAnswer(answers[key(rowIndex, fieldIndex)]) !== '')

  const answeredRows = rows.filter((_, index) => rowAnswered(index)).length
  const score = rows.filter((_, index) => rowRight(index)).length

  return (
    <section className="lesson-ten-activity" data-testid={id}>
      <div className="lesson-ten-activity-heading">
        <span className="activity-number" aria-hidden="true">
          {rows.length}
        </span>
        <div>
          <h3>{title}</h3>
          <p>{instruction}</p>
        </div>
      </div>

      <div className="lesson-ten-activity-items">
        {rows.map((row, rowIndex) => (
          <div className="lesson-ten-activity-row" key={row.prompt}>
            <p className="lesson-ten-activity-prompt">
              <bdi>{row.prompt}</bdi>
            </p>
            <div className={`lesson-ten-field-grid lesson-ten-field-grid--${Math.min(row.fields.length, 3)}`}>
              {row.fields.map((field, fieldIndex) => (
                <label className="lesson-ten-field" key={field.label}>
                  <span>{field.label}</span>
                  <select
                    value={answers[key(rowIndex, fieldIndex)] ?? ''}
                    disabled={checked}
                    aria-label={`${row.prompt} — ${field.label}`}
                    onChange={(event) =>
                      setAnswers((current) => ({ ...current, [key(rowIndex, fieldIndex)]: event.target.value }))
                    }
                  >
                    <option value="">اختر…</option>
                    {field.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
            {checked && (
              <div className={`lesson-ten-feedback ${rowRight(rowIndex) ? 'is-good' : 'is-bad'}`}>
                <strong>{rowRight(rowIndex) ? 'إجابة صحيحة' : 'إجابة غير صحيحة'}</strong>
                {!rowRight(rowIndex) && (
                  <ul className="lesson-ten-feedback__list">
                    {row.fields.map(
                      (field, fieldIndex) =>
                        !fieldRight(rowIndex, fieldIndex) && (
                          <li key={field.label}>
                            {field.label}: <bdi>{field.answer}</bdi>
                          </li>
                        ),
                    )}
                  </ul>
                )}
                {row.explain && <p>{row.explain}</p>}
                {row.parsing && <FullParsing lines={row.parsing} />}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="lesson-ten-activity-actions">
        {!checked ? (
          <>
            <button
              type="button"
              className="button button--primary"
              disabled={answeredRows !== rows.length}
              onClick={() => setChecked(true)}
            >
              تحقق من الإجابات
            </button>
            <p>
              أجبت عن <bdi>{answeredRows}</bdi> من <bdi>{rows.length}</bdi>.
            </p>
          </>
        ) : (
          <>
            <p className="lesson-ten-score" role="status">
              النتيجة: <bdi>{score} / {rows.length}</bdi>
            </p>
            <button
              type="button"
              className="button button--secondary"
              onClick={() => {
                setChecked(false)
                setAnswers({})
              }}
            >
              أعد المحاولة
            </button>
          </>
        )}
      </div>
    </section>
  )
}

/** اختبار قصير لكل حرف بعد شرحه، باستخدام المكوّن المشترك Quiz. */
function MeaningCheck({ quiz }: { quiz: QuizQuestionData }) {
  return <Quiz id={quiz.id} title="تحقق من فهمك" questions={[quiz]} />
}

/* ================================================================== *
 * الخطوات الأولى: المدخل والمراجعة والتعريف
 * ================================================================== */

function IntroStep() {
  return (
    <EducationalCard title="إنَّ وأخواتها" eyebrow="الحروف الناسخة" tone="accent">
      <p>
        في هذا الدرس نتعرّف على حروف تدخل على الجملة الاسمية فتغيّر إعرابها: تنصب المبتدأ الذي يصبح{' '}
        <strong>اسمها</strong>، وترفع الخبر الذي يبقى <strong>خبرها</strong>.
      </p>
      <GoldenRule text={coreRule} />
      <p>أشهر هذه الحروف:</p>
      <ChipRow items={particles.map((particle) => `${particle.word} — ${particle.meaning}`)} />
      <p className="lesson-ten-note">
        تنتقل بين الخطوات بزرّي «السابق» و«التالي»، ويمكنك متابعة الفهرس لترى مكانك في الدرس.
      </p>
    </EducationalCard>
  )
}

function ObjectivesStep() {
  return (
    <EducationalCard title="ما الذي ستتعلمه في هذا الدرس؟" eyebrow="تسعة أهداف" tone="soft">
      <ol className="lesson-ten-objectives">
        {objectives.map((objective) => (
          <li key={objective}>{objective}</li>
        ))}
      </ol>
    </EducationalCard>
  )
}

function ReviewNominalStep() {
  return (
    <>
      <p>قبل الحروف الناسخة نتذكر الجملة الاسمية: تتكون من مبتدأ وخبر، وكلاهما مرفوع.</p>
      <Featured>الطالبُ مجتهدٌ.</Featured>
      <FullParsing
        lines={[
          'الطالبُ: مبتدأ مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.',
          'مجتهدٌ: خبر مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.',
        ]}
      />
      <Rule>المبتدأ مرفوع، والخبر مرفوع في الجملة الاسمية الأصلية.</Rule>
    </>
  )
}

function ReviewKanaStep() {
  return (
    <>
      <p>كان وأخواتها أفعال ناسخة تدخل على الجملة الاسمية، فترفع الاسم وتنصب الخبر.</p>
      <Featured>{kanaInnaPairs[0].sentence}</Featured>
      <FullParsing lines={kanaInnaPairs[0].parsing} />
      <Rule>كان وأخواتها ترفع الاسم وتنصب الخبر.</Rule>
      <p className="lesson-ten-note">
        في هذا الدرس نرى حروفًا تعمل عملًا مختلفًا: إنَّ وأخواتها.
      </p>
    </>
  )
}

function DefinitionStep() {
  return (
    <>
      <p>
        <strong>إنَّ وأخواتها</strong> حروف ناسخة تدخل على الجملة الاسمية، فتغيّر إعرابها: تنصب المبتدأ ويصبح اسمها،
        وترفع الخبر ويبقى خبرها.
      </p>
      <ul className="lesson-ten-list">
        <li>تدخل على الجملة الاسمية، أي الجملة التي تبدأ باسم.</li>
        <li>تنصب الاسم الذي كان مبتدأ، ويسمى اسمها.</li>
        <li>ترفع الخبر، ويسمى خبرها.</li>
      </ul>
    </>
  )
}

function NasikhaStep() {
  return (
    <>
      <p>
        كلمة «ناسخ» هنا تعني أن هذه الحروف <strong>تُغيّر</strong> الحكم الإعرابي الذي كان في الجملة الاسمية.
      </p>
      <ul className="lesson-ten-list">
        <li>الحرف الناسخ: حرف يدخل على الجملة الاسمية فيغيّر حكم أجزائها الإعرابي، مثل «إنَّ».</li>
        <li>الفعل الناسخ: فعل يدخل على الجملة الاسمية ويغيّر حكمها، مثل «كانَ».</li>
      </ul>
      <div className="lesson-ten-compare">
        <p>
          <bdi>كانَ الطالبُ مجتهدًا.</bdi> ← فعل ماضٍ ناسخ
        </p>
        <p>
          <bdi>إنَّ الطالبَ مجتهدٌ.</bdi> ← حرف ناسخ
        </p>
      </div>
      <MeaningCheck quiz={nasikhaQuiz} />
    </>
  )
}

function BaseExampleStep() {
  return (
    <>
      <p>نبدأ بجملة اسمية، ثم ندخل عليها «إنَّ» ونلاحظ ما الذي تغيّر.</p>
      <Transform
        before={baseExample.before}
        after={baseExample.after}
        note="تغيّرت علامة «الطالبَ» إلى الفتحة، وبقيت علامة «مجتهدٌ» الضمة."
      />
      <ParsingReveal lines={baseExample.parsing} label="أظهر الإعراب الكامل بعد الدخول" />
    </>
  )
}

function GoldenRuleStep() {
  return (
    <>
      <GoldenRule text={coreRule} />
      <div className="lesson-ten-mapping">
        <div>
          <span>المبتدأ قبل «إنَّ»</span>
          <strong>اسم إنَّ</strong>
          <em className="lesson-ten-state lesson-ten-state--accusative">منصوب</em>
        </div>
        <div>
          <span>الخبر قبل «إنَّ» وبعدها</span>
          <strong>خبر إنَّ</strong>
          <em className="lesson-ten-state lesson-ten-state--nominative">مرفوع</em>
        </div>
      </div>
      <Rule>طبّق القاعدة على المثال: «إنَّ الطالبَ» منصوب، و«مجتهدٌ» مرفوع.</Rule>
      <PlatformNote>
        لا تخلط بين هذه القاعدة وقاعدة كان: كان ترفع الاسم وتنصب الخبر، وإنَّ تنصب الاسم وترفع الخبر.
      </PlatformNote>
    </>
  )
}

/* ================================================================== *
 * المقارنة مع كان، وأخوات إنَّ، وطريقة العمل
 * ================================================================== */

function KanaInnaCompareStep() {
  return (
    <>
      <p>قارن بين الجمل الثلاث في الجدول، ثم اختر القاعدة التي تنطبق على كل جملة.</p>
      <ComparisonTable />
      <ChoiceActivity
        id="lesson10-rule-choice"
        title="تفاعل: أي قاعدة تنطبق؟"
        instruction="اختر القاعدة المناسبة لكل جملة، ثم تحقق من إجابتك."
        rows={ruleChoiceRows}
      />
    </>
  )
}

function SistersStep() {
  return (
    <>
      <p>هذه أشهر أخوات إنَّ. اضغط على كل حرف لتعرف معناه ومثاله وإعرابه الكامل.</p>
      <SistersExplorer />
    </>
  )
}

function HowItWorksStep() {
  return (
    <>
      <ol className="lesson-ten-steps">
        <li>تدخل «إنَّ» أو إحدى أخواتها على الجملة الاسمية.</li>
        <li>تنصب المبتدأ الذي كان مرفوعًا، فيصبح اسمها منصوبًا.</li>
        <li>يبقى الخبر مرفوعًا، ويُسمّى خبرها.</li>
        <li>تصبح الجملة بعد الدخول: «إنَّ + اسم منصوب + خبر مرفوع».</li>
      </ol>
      <div className="lesson-ten-mapping">
        <div>
          <span>الحرف</span>
          <strong>إنَّ</strong>
        </div>
        <div>
          <span>اسمها</span>
          <strong>الطالبَ</strong>
          <em className="lesson-ten-state lesson-ten-state--accusative">منصوب</em>
        </div>
        <div>
          <span>خبرها</span>
          <strong>مجتهدٌ</strong>
          <em className="lesson-ten-state lesson-ten-state--nominative">مرفوع</em>
        </div>
      </div>
      <Rule>إنَّ وأخواتها تنصب الاسم وترفع الخبر.</Rule>
    </>
  )
}

function FindIsmStep() {
  return (
    <>
      <p>لتعرف اسم إنَّ في أي جملة، اتبع هذه الخطوات الخمس:</p>
      <ol className="lesson-ten-steps">
        <li>ابحث عن الحرف الناسخ: إنَّ أو إحدى أخواتها.</li>
        <li>انظر إلى الكلمة التي تأتي بعده مباشرة؛ فهي في الغالب اسمه.</li>
        <li>تأكد أن هذه الكلمة منصوبة.</li>
        <li>ابحث عن الكلمة التي تخبرنا عن الاسم.</li>
        <li>هذه الكلمة هي خبره، وهي مرفوعة.</li>
      </ol>
      <ChoiceActivity
        id="lesson10-discovery"
        title="تطبيق: حدّد الحرف والاسم والخبر"
        instruction="اختر لكل حقل الكلمة المناسبة من القائمة، ثم تحقق."
        rows={[discoveryRow]}
      />
    </>
  )
}

function EasyCard({ number }: { number: number }) {
  const example = easyExamples[number - 1]
  const note = /^(ليتَ|لعلَّ)/.test(example.sentence) ? laitaNote : undefined
  return (
    <article className="lesson-ten-worked">
      <h3>
        المثال <bdi>{number}</bdi>
      </h3>
      <Featured small>{example.sentence}</Featured>
      <ul className="lesson-ten-worked-items">
        <li>
          اسمها: <bdi>{example.name}</bdi> <span className="lesson-ten-state lesson-ten-state--accusative">منصوب</span>
        </li>
        <li>
          خبرها: <bdi>{example.khabar}</bdi> <span className="lesson-ten-state lesson-ten-state--nominative">مرفوع</span>
        </li>
      </ul>
      {note && <p className="lesson-ten-note">{note}</p>}
      <ParsingReveal lines={example.parsing} />
    </article>
  )
}

function EasyExamplesStep() {
  return (
    <>
      <p>خمسة أمثلة سهلة: في كل جملة حدّد اسم الحرف وخبره، ثم اكشف الإعراب الكامل.</p>
      {easyExamples.map((example, index) => (
        <EasyCard key={example.sentence} number={index + 1} />
      ))}
    </>
  )
}

function KanaInnaParsingStep() {
  return (
    <>
      <p>الجملتان متشابهتان في الكلمات، لكن علامة الإعراب تختلف حسب الحرف أو الفعل الناسخ:</p>
      <div className="lesson-ten-pair">
        {kanaInnaPairs.map((pair) => (
          <article key={pair.sentence} className="lesson-ten-pair__card">
            <Featured small>{pair.sentence}</Featured>
            <FullParsing lines={pair.parsing} />
          </article>
        ))}
      </div>
      <Rule>كان ترفع الاسم وتنصب الخبر، وإنَّ تنصب الاسم وترفع الخبر.</Rule>
      <p className="lesson-ten-note">احفظ الترتيب: كان ← ارفع الأول وانصب الثاني. إنَّ ← انصب الأول وارفع الثاني.</p>
    </>
  )
}

/* ================================================================== *
 * الإعراب الفرعي
 * ================================================================== */

function SubSignStep({ id }: { id: string }) {
  const data = subSignData.find((item) => item.id === id)
  if (!data) return null
  return (
    <>
      <Rule>{data.rule}</Rule>
      {data.examples.map((example) => (
        <div key={example.after} className="lesson-ten-subsign">
          <Transform before={example.before} after={example.after} />
          <ParsingReveal lines={example.parsing} label="أظهر الإعراب الكامل" />
        </div>
      ))}
      <p className="lesson-ten-note">{data.note}</p>
    </>
  )
}

/* ================================================================== *
 * معاني الحروف الناسخة
 * ================================================================== */

function LetterStep({ id }: { id: string }) {
  const letter: LetterData | undefined = letterData.find((item) => item.id === id)
  if (!letter) return null
  return (
    <>
      {letter.lead.map((line) => (
        <p key={line}>{line}</p>
      ))}
      {letter.examples.map((example) => (
        <div key={example.sentence} className="lesson-ten-letter-example">
          <Featured small>{example.sentence}</Featured>
          {example.parsing && <ParsingReveal lines={example.parsing} />}
        </div>
      ))}
      {letter.note && <p className="lesson-ten-note">{letter.note}</p>}
      <MeaningCheck quiz={letter.quiz} />
    </>
  )
}

/* ================================================================== *
 * الأخطاء الشائعة والمقارنة الشاملة
 * ================================================================== */

function ErrorWarningStep() {
  return (
    <>
      <div className="lesson-ten-warnings">
        {errorWarnings.map((warning) => (
          <article key={warning.title} className="lesson-ten-warning">
            <h3>{warning.title}</h3>
            <p>{warning.body}</p>
          </article>
        ))}
      </div>
      <p>لتتذكر الفرق بسهولة:</p>
      <ChipRow items={mnemonics.map((item) => `${item.label}: ${item.text}`)} golden />
    </>
  )
}

function ErrorCorrectionStep() {
  return (
    <>
      <PlatformNote>
        حاول أولًا أن تصحح الجملة وتختار سببها، ثم اضغط «تحقق». لا يظهر الحل قبل التحقق.
      </PlatformNote>
      <ChoiceActivity
        id="lesson10-error-correction"
        title="تصحيح الأخطاء الشائعة"
        instruction="لكل جملة خاطئة: اختر الجملة الصحيحة، ثم اختر السبب."
        rows={errorCorrectionRows}
      />
    </>
  )
}

function ComparisonAllStep() {
  return (
    <>
      <p>ثلاث جمل متقاربة، وكل واحدة لها إعراب مختلف بحسب ما دخل عليها:</p>
      <ComparisonTable />
      <Rule>الجملة الاسمية الأصلية: مبتدأ مرفوع وخبر مرفوع. مع كان: اسم مرفوع وخبر منصوب. مع إنَّ: اسم منصوب وخبر مرفوع.</Rule>
    </>
  )
}

/* ================================================================== *
 * الأمثلة المحلولة والأنشطة
 * ================================================================== */

function WorkedCard({ number }: { number: number }) {
  const example = workedExamples[number - 1]
  return (
    <article className="lesson-ten-worked">
      <h3>
        المثال <bdi>{number}</bdi>
      </h3>
      <Featured small>{example.sentence}</Featured>
      {example.note && <p className="lesson-ten-note">{example.note}</p>}
      <ParsingReveal lines={example.parsing} />
    </article>
  )
}

function WorkedStep({ from, to }: { from: number; to: number }) {
  const numbers = Array.from({ length: to - from + 1 }, (_, index) => from + index)
  return (
    <>
      <p>
        أمثلة محلولة بالإعراب الكامل. حاول أن تعرب كل مثال أولًا، ثم اكشف الإعراب لتقارن.
      </p>
      {numbers.map((number) => (
        <WorkedCard key={number} number={number} />
      ))}
    </>
  )
}

function ActivityOneStep() {
  return (
    <>
      <PlatformNote>
        أدخل «إنَّ» على كل جملة، ثم اختر اسمها وخبرها بعد التغيير، ثم اضغط «تحقق».
      </PlatformNote>
      <ChoiceActivity
        id="lesson10-activity-one"
        title="النشاط التطبيقي الأول"
        instruction="بعد دخول «إنَّ» على كل جملة، حدّد اسمها المنصوب وخبرها المرفوع."
        rows={activityOneRows}
      />
    </>
  )
}

function ActivityTwoStep() {
  return (
    <>
      <PlatformNote>
        في كل جملة حدّد الحرف الناسخ واسمه وخبره، ثم علامة إعراب كل منهما، ثم تحقق.
      </PlatformNote>
      <ChoiceActivity
        id="lesson10-activity-two"
        title="النشاط التطبيقي الثاني"
        instruction="حدّد عناصر الجملة وعلامات إعرابها من القوائم."
        rows={activityTwoRows}
      />
    </>
  )
}

/* ================================================================== *
 * مراجعة أسئلة المصدر: سبعة وعشرون سؤالًا للمراجعة لا للاختبار
 * ================================================================== */

function SourceReview({ from, to }: { from: number; to: number }) {
  const questions = sourceQuestions.filter((question) => question.number >= from && question.number <= to)
  const [responses, setResponses] = useState<Record<number, string>>({})
  const [revealed, setRevealed] = useState<Record<number, boolean>>({})
  const allRevealed = questions.every((question) => revealed[question.number])

  function toggle(number: number) {
    setRevealed((current) => ({ ...current, [number]: !current[number] }))
  }

  return (
    <section className="lesson-ten-source-review" data-testid={`lesson10-source-review-${from}`}>
      <div className="lesson-ten-source-review__heading">
        <div>
          <p className="card__eyebrow">من المادة المصدرية</p>
          <h3>
            أسئلة نهاية الدرس في المصدر: <bdi>{from}–{to}</bdi>
          </h3>
        </div>
        <button
          type="button"
          className="button button--ghost"
          onClick={() =>
            setRevealed(
              allRevealed ? {} : Object.fromEntries(questions.map((question) => [question.number, true])),
            )
          }
        >
          {allRevealed ? 'إخفاء الإجابات' : 'أظهر الإجابات النموذجية'}
        </button>
      </div>

      <p className="lesson-ten-note">
        هذه أسئلة المصدر للمراجعة، وليست اختبار المنصة؛ فاختبار الدرس العاشر خطوة مستقلة بأسئلة جديدة.
      </p>

      {questions.map((question, index) => (
        <Fragment key={question.number}>
          {(index === 0 || questions[index - 1].section !== question.section) && <h3>{question.section}</h3>}
          <fieldset className="official-question lesson-ten-source-question" data-testid={`lesson10-source-q${question.number}`}>
            <legend>
              <span className="question-number">
                السؤال <bdi>{question.number}</bdi>
              </span>{' '}
              <bdi>{question.prompt}</bdi>
            </legend>
            {question.options ? (
              <div className="official-options">
                {question.options.map((option) => (
                  <label key={option}>
                    <input
                      type="radio"
                      name={`lesson10-source-${question.number}`}
                      value={option}
                      checked={responses[question.number] === option}
                      onChange={() => setResponses((current) => ({ ...current, [question.number]: option }))}
                    />
                    <span>
                      <bdi>{option}</bdi>
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <label className="lesson-ten-field lesson-ten-field--wide">
                <span>اكتب إجابتك قبل المراجعة (اختياري)</span>
                <textarea
                  rows={3}
                  value={responses[question.number] ?? ''}
                  onChange={(event) =>
                    setResponses((current) => ({ ...current, [question.number]: event.target.value }))
                  }
                />
              </label>
            )}
            <button type="button" className="button button--ghost" onClick={() => toggle(question.number)}>
              {revealed[question.number] ? 'إخفاء الإجابة النموذجية' : 'أظهر الإجابة النموذجية'}
            </button>
            {revealed[question.number] && (
              <div className="lesson-ten-solution-reveal">
                <p>
                  <strong>الإجابة النموذجية:</strong> <bdi>{question.answer}</bdi>
                </p>
                {question.note && <p>{question.note}</p>}
                {question.parsing && <FullParsing lines={question.parsing} />}
              </div>
            )}
          </fieldset>
        </Fragment>
      ))}
    </section>
  )
}

/* ================================================================== *
 * التحدي المتقدم والخلاصة
 * ================================================================== */

function ChallengeStep() {
  const [showWhy, setShowWhy] = useState(false)
  return (
    <>
      <PlatformNote>
        لكل جملة ستة مطالب: الحرف الناسخ، واسمه، وخبره، وعلامة الاسم، وعلامة الخبر، وسبب تغيّر العلامة.
      </PlatformNote>
      <ChoiceActivity
        id="lesson10-challenge"
        title="التحدي المتقدم"
        instruction="حدّد عناصر كل جملة وعلامات إعرابها، ثم اختر سبب تغيّر العلامة."
        rows={challengeRows}
      />
      <div className="lesson-ten-challenge-why">
        <h3>لماذا تغيّرت علامة الإعراب؟</h3>
        <p>
          فكّر أولًا في سبب تغيّر العلامة في الجمل السابقة، ثم قارن بنموذج الجواب.
        </p>
        <button type="button" className="button button--ghost" onClick={() => setShowWhy((value) => !value)}>
          {showWhy ? 'إخفاء النموذج' : 'أظهر نموذج الجواب'}
        </button>
        {showWhy && <p className="lesson-ten-solution-reveal">{challengeWhy}</p>}
      </div>
      <ParsingReveal
        lines={challengeRows.flatMap((row) => row.parsing ?? [])}
        label="أظهر الإعراب الكامل لجمل التحدي"
      />
    </>
  )
}

function SummaryStep() {
  return (
    <>
      <EducationalCard title="ملخص الدرس" eyebrow="الخلاصة" tone="soft">
        <ul className="lesson-ten-summary-list">
          {summaryPoints.map((point) => (
            <li key={point.label}>
              <strong>{point.label}:</strong> <span>{point.text}</span>
            </li>
          ))}
        </ul>
      </EducationalCard>
      <GoldenRule text={coreRule} />
    </>
  )
}

function MemoryStep() {
  return (
    <>
      <p>راجع هذه العبارات قبل الاختبار:</p>
      <ul className="lesson-ten-list">
        {memoryKey.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <ChipRow items={mnemonics.map((item) => `${item.label}: ${item.text}`)} golden />
    </>
  )
}

function TeacherArea() {
  return (
    <TeacherSpace password="somer173">
      <div className="teacher-material teacher-material--lesson10">
        <h3>أ. شرح الدرس للمعلم</h3>

        <h4>1. أهداف الدرس</h4>
        <ol>
          {objectives.map((objective) => (
            <li key={objective}>{objective}</li>
          ))}
        </ol>

        <h4>2. القاعدة الأساسية</h4>
        <p>
          إنَّ وأخواتها حروف ناسخة تدخل على الجملة الاسمية، فتنصب المبتدأ ويسمى <strong>اسمها</strong>، وترفع
          الخبر ويسمى <strong>خبرها</strong>.
        </p>
        <GoldenRule text={coreRule} />
        <p>
          المثال الأساس: <bdi>الطالبُ مجتهدٌ ← إنَّ الطالبَ مجتهدٌ</bdi>.
        </p>

        <h4>3. أشهر إنَّ وأخواتها ومعانيها</h4>
        <ul>
          {particles.map((particle) => (
            <li key={particle.id}>
              <bdi>{particle.word}</bdi> — {particle.kind} — معناها: {particle.meaning} — مثال:{' '}
              <bdi>{particle.example}</bdi>
            </li>
          ))}
        </ul>

        <h4>4. الإعراب الكامل للأمثلة الأساسية</h4>
        {particles.map((particle) => (
          <div key={particle.id}>
            <p>
              <bdi>{particle.example}</bdi>
            </p>
            <FullParsing lines={particle.parsing} />
          </div>
        ))}

        <h4>5. كيف تعمل إنَّ؟ وكيف نعرف اسمها؟</h4>
        <ol>
          <li>تدخل إنَّ أو إحدى أخواتها على الجملة الاسمية.</li>
          <li>تنصب المبتدأ الذي كان مرفوعًا، فيصبح اسمها منصوبًا.</li>
          <li>يبقى الخبر مرفوعًا، ويُسمّى خبرها.</li>
          <li>لمعرفة الاسم: انظر إلى الكلمة بعد الحرف مباشرة، ثم تأكد أنها منصوبة، ثم ابحث عن خبرها المرفوع.</li>
        </ol>

        <h4>6. كان وإنَّ في الإعراب</h4>
        {kanaInnaPairs.map((pair) => (
          <div key={pair.sentence}>
            <p>
              <bdi>{pair.sentence}</bdi>
            </p>
            <FullParsing lines={pair.parsing} />
          </div>
        ))}

        <h4>7. الإعراب الفرعي</h4>
        {subSignData.map((item) => (
          <div key={item.id}>
            <p>
              <strong>{item.title}:</strong> {item.rule}
            </p>
            {item.examples.map((example) => (
              <div key={example.after}>
                <p>
                  <bdi>{example.after}</bdi>
                </p>
                <FullParsing lines={example.parsing} />
              </div>
            ))}
          </div>
        ))}

        <h4>8. معاني الحروف والفروق</h4>
        <ul>
          {letterData.map((letter) => (
            <li key={letter.id}>
              <strong>{letter.title}:</strong> {letter.lead.join(' ')}
            </li>
          ))}
        </ul>

        <h4>9. الأخطاء المتوقعة وتصحيحها</h4>
        <ul>
          {expectedErrors.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <ul>
          {errorCorrectionRows.map((row) => (
            <li key={row.prompt}>
              <bdi>{row.prompt}</bdi> ← <bdi>{row.fields[0].answer}</bdi>؛ السبب: {row.fields[1].answer}
            </li>
          ))}
        </ul>

        <h4>10. ملاحظات للمعلم</h4>
        <ul>
          {teacherNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>

        <h4>11. ملخص الدرس للمعلم</h4>
        <ul>
          {summaryPoints.map((point) => (
            <li key={point.label}>
              <strong>{point.label}:</strong> {point.text}
            </li>
          ))}
        </ul>

        <h3>ب. إجابات أسئلة المصدر (27 سؤالًا)</h3>
        {sourceQuestions.map((question) => (
          <div key={question.number}>
            <p>
              <strong>السؤال {question.number}:</strong> <bdi>{question.prompt}</bdi>
            </p>
            <p>
              <strong>الجواب:</strong> <bdi>{question.answer}</bdi>
            </p>
            {question.note && <p>{question.note}</p>}
            {question.parsing && <FullParsing lines={question.parsing} />}
          </div>
        ))}

        <h3>ج. حلول النشاط التطبيقي الأول</h3>
        {activityOneSolutions.map((solution, index) => (
          <div key={solution}>
            <p>
              {index + 1}. <bdi>{solution}</bdi>
            </p>
            {activityOneRows[index].parsing && <FullParsing lines={activityOneRows[index].parsing ?? []} />}
          </div>
        ))}

        <h3>د. حلول النشاط التطبيقي الثاني</h3>
        {activityTwoRows.map((row) => (
          <div key={row.prompt}>
            <p>
              <bdi>{row.prompt}</bdi> — {row.fields.map((field) => `${field.label}: ${field.answer}`).join(' — ')}
            </p>
            <FullParsing lines={row.parsing ?? []} />
          </div>
        ))}

        <h3>هـ. حلول الأمثلة المحلولة (7)</h3>
        {workedExamples.map((example, index) => (
          <div key={`${example.sentence}-${index}`}>
            <p>
              {index + 1}. <bdi>{example.sentence}</bdi>
            </p>
            <FullParsing lines={example.parsing} />
          </div>
        ))}

        <h3>و. حلول التحدي المتقدم</h3>
        {challengeRows.map((row) => (
          <div key={row.prompt}>
            <p>
              <bdi>{row.prompt}</bdi> — {row.fields.map((field) => `${field.label}: ${field.answer}`).join(' — ')}
            </p>
            <FullParsing lines={row.parsing ?? []} />
          </div>
        ))}
        <p>
          <strong>لماذا تغيّرت العلامة؟</strong> {challengeWhy}
        </p>

        <h3>ز. حلول اختبار المنصة (20 سؤالًا)</h3>
        <SolutionsArea test={testDefinition} mode="teacher" title="حلول اختبار الدرس العاشر" eyebrow="منطقة المعلم" />
      </div>
    </TeacherSpace>
  )
}

/* ================================================================== *
 * الدرس العاشر: خطوات متتابعة داخل LessonFlow
 * ================================================================== */

export function LessonTen({ onProgressChange, onFinish }: Props) {
  // The shared test engine lives here, above LessonFlow, so answers and page
  // results survive step navigation (see docs/lesson-test-standards.md).
  const testEngine = useTestEngine(testDefinition)

  const steps: LessonStepDefinition[] = [
    step('intro', 'الدرس العاشر: إنَّ وأخواتها', 'البداية', '📘', <IntroStep />),
    step('objectives', 'أهداف الدرس', 'البداية', '🎯', <ObjectivesStep />),

    step('review-nominal', '1. مراجعة: الجملة الاسمية', 'التمهيد والمراجعة', '🔁', <ReviewNominalStep />),
    step('review-kana', '2. مراجعة: كان وأخواتها', 'التمهيد والمراجعة', '🔁', <ReviewKanaStep />),

    step('definition', '3. ما إنَّ وأخواتها؟', 'القاعدة الأساسية', '📖', <DefinitionStep />),
    step('nasikha', '4. معنى «حرف ناسخ»', 'القاعدة الأساسية', '🔤', <NasikhaStep />),
    step('base-example', '5. المثال الأساسي: من الجملة الاسمية إلى إنَّ', 'القاعدة الأساسية', '🔄', <BaseExampleStep />),
    step('golden-rule', '6. القاعدة الذهبية', 'القاعدة الأساسية', '⭐', <GoldenRuleStep />),

    step('kana-vs-inna', '7. المقارنة: كان وإنَّ', 'المقارنة مع كان', '⚖️', <KanaInnaCompareStep />),

    step('sisters', '8. أشهر إنَّ وأخواتها', 'أشهر أخوات إنَّ', '🧭', <SistersStep />),

    step('how-it-works', '9. كيف تعمل إنَّ وأخواتها؟', 'طريقة العمل', '⚙️', <HowItWorksStep />),

    step('find-ism', '10. كيف أتعرف على اسم إنَّ؟', 'اسم إنَّ وخبرها', '🔍', <FindIsmStep />),
    step('easy-examples', '11. أمثلة سهلة لاسم إنَّ وخبرها', 'اسم إنَّ وخبرها', '✏️', <EasyExamplesStep />),
    step('kana-inna-parsing', '12. الفرق بين كان وإنَّ في الإعراب', 'اسم إنَّ وخبرها', '🧩', <KanaInnaParsingStep />),

    step('dual', '13. اسم إنَّ المثنى', 'الإعراب الفرعي', '2️⃣', <SubSignStep id="dual" />),
    step('masculine', '14. اسم إنَّ جمع المذكر السالم', 'الإعراب الفرعي', '👥', <SubSignStep id="masculine" />),
    step('feminine', '15. اسم إنَّ جمع المؤنث السالم', 'الإعراب الفرعي', '👩‍🏫', <SubSignStep id="feminine" />),
    step('five', '16. اسم إنَّ من الأسماء الخمسة', 'الإعراب الفرعي', '🖐️', <SubSignStep id="five" />),

    step('tawkid', '17. إنَّ للتوكيد', 'معاني الحروف الناسخة', '❗', <LetterStep id="tawkid" />),
    step('anna', '18. إنَّ وأنَّ', 'معاني الحروف الناسخة', '🔀', <LetterStep id="anna" />),
    step('laita', '19. ليتَ', 'معاني الحروف الناسخة', '🌙', <LetterStep id="laita" />),
    step('laalla', '20. لعلَّ', 'معاني الحروف الناسخة', '🌤️', <LetterStep id="laalla" />),
    step('kaanna', '21. كأنَّ', 'معاني الحروف الناسخة', '🪞', <LetterStep id="kaanna" />),
    step('lakinna', '22. لكنَّ', 'معاني الحروف الناسخة', '↩️', <LetterStep id="lakinna" />),

    step('error-warning', '23. أخطاء يجب الانتباه إليها', 'الأخطاء الشائعة', '⚠️', <ErrorWarningStep />),
    step('error-correction', '24. تصحيح الأخطاء الشائعة', 'الأخطاء الشائعة', '🛠️', <ErrorCorrectionStep />),

    step('comparison-all', '25. المقارنة الشاملة', 'المقارنة الشاملة', '📊', <ComparisonAllStep />),

    step('worked-1', '26. الأمثلة المحلولة (1–4)', 'الأمثلة المحلولة', '📝', <WorkedStep from={1} to={4} />),
    step('worked-2', '27. الأمثلة المحلولة (5–7)', 'الأمثلة المحلولة', '📝', <WorkedStep from={5} to={7} />),

    step('activity-1', '28. النشاط التطبيقي الأول', 'الأنشطة التطبيقية', '🎮', <ActivityOneStep />),
    step('activity-2', '29. النشاط التطبيقي الثاني', 'الأنشطة التطبيقية', '🧠', <ActivityTwoStep />),

    step('source-1', '30. مراجعة أسئلة المصدر (1–8)', 'مراجعة أسئلة المصدر', '📚', <SourceReview from={1} to={8} />),
    step('source-2', '31. مراجعة أسئلة المصدر (9–15)', 'مراجعة أسئلة المصدر', '📚', <SourceReview from={9} to={15} />),
    step('source-3', '32. مراجعة أسئلة المصدر (16–20)', 'مراجعة أسئلة المصدر', '📚', <SourceReview from={16} to={20} />),
    step('source-4', '33. مراجعة أسئلة المصدر (21–27)', 'مراجعة أسئلة المصدر', '📚', <SourceReview from={21} to={27} />),

    step('challenge', '34. التحدي المتقدم', 'التحدي المتقدم', '🏆', <ChallengeStep />),

    step('summary', '35. ملخص الدرس', 'الخلاصة', '📌', <SummaryStep />),
    step('memory', '36. قاعدة سريعة للحفظ', 'الخلاصة', '💡', <MemoryStep />),

    step('platform-test', '37. اختبار الدرس العاشر (٢٠ سؤالًا)', 'الاختبار الإلكتروني', '🏁', (
      <TestRunner test={testDefinition} engine={testEngine} testId="lesson10-official-test" questionTestIdPrefix="lesson10-test" />
    )),

    step('solutions', '38. حلول الاختبار', 'الاختبار الإلكتروني', '📗', (
      <SolutionsArea test={testDefinition} engine={testEngine} testId="lesson10-solutions" title="حلول اختبار الدرس العاشر" />
    )),

    step('teacher', '39. منطقة خاصة بالمعلم', 'منطقة المعلم', '🔐', <TeacherArea />),
  ]

  return (
    <LessonFlow
      steps={steps}
      onProgressChange={onProgressChange}
      onFinish={onFinish}
      lessonTitle="إنَّ وأخواتها"
      lessonNumber="١٠"
      lessonEyebrow="الدرس العاشر"
    />
  )
}

function step(
  id: string,
  title: string,
  group: string,
  icon: string,
  content: ReactNode,
): LessonStepDefinition {
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
