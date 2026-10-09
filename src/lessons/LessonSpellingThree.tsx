import { useState, type ReactNode } from 'react'
import { LessonFlow, type LessonStepDefinition } from '../shared/components/LessonFlow'
import { TeacherSpace } from '../shared/teacher/TeacherSpace'
import {
  SolutionsArea,
  TestRunner,
  useTestEngine,
  type TestDefinition,
} from '../shared/test'
import {
  objectives,
  definitionSection,
  strengthOrder,
  alefSection,
  wawSection,
  wawDammaAfterDammaPlatform,
  nabraSection,
  lineSection,
  specialCases,
  methodSteps,
  methodYaaNote,
  commonErrorsList,
  commonErrorsNote,
  workedExamples,
  activityOneItems,
  activityTwoItems,
  activityThreeItems,
  activityFourItems,
  activityFiveItems,
  activitySixInstruction,
  activitySixItems,
  teacherNotes,
  gradingRubrics,
  summaryPoints,
  summaryYaaNote,
  bestMethod,
  nextLessonInfo,
  testDefinition as lessonThreeTest,
} from './spelling-lesson-03/content'

// The approved corrections are itemized in docs/spelling-lesson-03-audit.md.
// eslint-disable-next-line react-refresh/only-export-components -- shared test schema is lesson data
export const testDefinition: TestDefinition = lessonThreeTest

function List({ items, ordered = false }: { items: readonly string[]; ordered?: boolean }) {
  const Tag = ordered ? 'ol' : 'ul'
  return (
    <Tag className="spell3-list">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </Tag>
  )
}

function Note({ children }: { children: ReactNode }) {
  return (
    <aside className="spell3-note">
      <strong>توضيح تعليمي من المنصة</strong>
      <p>{children}</p>
    </aside>
  )
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="spell3-panel">
      <h3>{title}</h3>
      {children}
    </section>
  )
}

function Table({
  headers,
  rows,
}: {
  headers: readonly string[]
  rows: readonly (readonly string[])[]
}) {
  return (
    <div className="spell3-table-wrap">
      <table className="spell3-table">
        <thead>
          <tr>
            {headers.map((h) => (
              <th scope="col" key={h}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((v, j) =>
                j === 0 ? (
                  <th scope="row" key={j}>
                    <bdi>{v}</bdi>
                  </th>
                ) : (
                  <td key={j}>
                    <bdi>{v}</bdi>
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Activity 1: Identify the hamza seat (ألف / واو / نبرة / سطر)
function ActivityOneLab() {
  const [choices, setChoices] = useState<Record<number, string>>({})
  const [checked, setChecked] = useState(false)
  const seats = ['ألف', 'واو', 'نبرة', 'سطر'] as const

  const handleSelect = (index: number, val: string) => {
    setChoices((prev) => ({ ...prev, [index]: val }))
    setChecked(false)
  }

  return (
    <Panel title="النشاط الأول: حدّد كرسي الهمزة">
      <p>اكتب بجانب كل كلمة كرسي همزتها: ألف، واو، نبرة، أو سطر. ثم اضغط زر التحقق:</p>
      <div className="spell3-table-wrap">
        <table className="spell3-table">
          <thead>
            <tr>
              <th>#</th>
              <th>الكلمة</th>
              <th>كرسي الهمزة</th>
              {checked && <th>النتيجة والتعليل</th>}
            </tr>
          </thead>
          <tbody>
            {activityOneItems.map(([word, answer, explanation], i) => {
              const selected = choices[i]
              const isCorrect = selected === answer
              return (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>
                    <strong>
                      <bdi>{word}</bdi>
                    </strong>
                  </td>
                  <td>
                    <div className="spell3-options">
                      {seats.map((opt) => (
                        <label key={opt}>
                          <input
                            type="radio"
                            name={`act1-${i}`}
                            value={opt}
                            checked={selected === opt}
                            onChange={() => handleSelect(i, opt)}
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </td>
                  {checked && (
                    <td>
                      <span className={isCorrect ? 'spell3-status-ok' : 'spell3-status-retry'}>
                        {isCorrect ? '✓ صحيح' : '✕ راجع الإجابة'}: {answer}.
                      </span>
                      <small className="spell3-analysis-box">{explanation}</small>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        className="button button--primary"
        onClick={() => setChecked(true)}
      >
        تحقّق من النشاط
      </button>
    </Panel>
  )
}

// Activity 2: Explain the spelling (علل)
function ActivityTwoLab() {
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [checked, setChecked] = useState(false)

  return (
    <Panel title="النشاط الثاني: علّل رسم الهمزة">
      <p>علّل كتابة الهمزة في الكلمات الآتية، مع ذكر حركة الهمزة وحركة الحرف السابق:</p>
      {activityTwoItems.map(([word, explanation], i) => (
        <div className="spell3-item" key={i}>
          <label htmlFor={`s3-act2-${i}`}>
            <strong>
              {i + 1}. علّل كتابة الهمزة في: «<bdi>{word}</bdi>»
            </strong>
          </label>
          <textarea
            id={`s3-act2-${i}`}
            value={answers[i] ?? ''}
            onChange={(e) => {
              setAnswers((prev) => ({ ...prev, [i]: e.target.value }))
              setChecked(false)
            }}
            placeholder="اكتب تعليلك (حركة الهمزة وحركة السابق وأقوى الحركتين) هنا..."
            rows={2}
          />
          {checked && (
            <div className="spell3-analysis-box" role="status">
              {answers[i]?.trim() ? (
                <>
                  <span className="spell3-status-ok">التعليل النموذجي:</span>{' '}
                  <bdi>{explanation}</bdi>{' '}
                  <small>(قارن تحليلك بالنموذج؛ وتُقبل الصياغات المكافئة)</small>
                </>
              ) : (
                <span className="spell3-status-retry">
                  يرجى تدوين تعليلك أولاً ثم الضغط على زر التحقق للمقارنة بالنموذج.
                </span>
              )}
            </div>
          )}
        </div>
      ))}
      <button
        type="button"
        className="button button--primary"
        onClick={() => setChecked(true)}
      >
        تحقّق من النشاط
      </button>
    </Panel>
  )
}

// Activity 3: Multiple Choice
function ActivityThreeLab() {
  const [selected, setSelected] = useState<Record<number, string>>({})
  const [checked, setChecked] = useState(false)

  const letters = ['أ', 'ب', 'ج', 'د']

  return (
    <Panel title="النشاط الثالث: اختر الإجابة الصحيحة">
      <p>اختر الخيار المناسب لكل سؤال، ولا تظهر الإجابة النموذجية إلا بعد الضغط على زر التحقق:</p>
      {activityThreeItems.map(([prompt, options, key, explanation], i) => (
        <fieldset className="spell3-item" key={i}>
          <legend>
            <strong>
              {i + 1}. {prompt}
            </strong>
          </legend>
          <div className="spell3-options">
            {options.map((opt, j) => {
              const letter = letters[j]
              return (
                <label key={j}>
                  <input
                    type="radio"
                    name={`s3-act3-${i}`}
                    checked={selected[i] === letter}
                    onChange={() => {
                      setSelected((prev) => ({ ...prev, [i]: letter }))
                      setChecked(false)
                    }}
                  />
                  {letter}. {opt}
                </label>
              )
            })}
          </div>
          {checked && (
            <p role="status">
              <span
                className={
                  selected[i] === key ? 'spell3-status-ok' : 'spell3-status-retry'
                }
              >
                {selected[i] === key ? '✓ إجابة صحيحة' : '✕ راجع اختيارك'}: الخيار ({key}).
              </span>{' '}
              <br />
              <small>{explanation}</small>
            </p>
          )}
        </fieldset>
      ))}
      <button
        type="button"
        className="button button--primary"
        onClick={() => setChecked(true)}
      >
        تحقّق من النشاط
      </button>
    </Panel>
  )
}

// Activity 4: Correct the words (with correct-word traps)
function ActivityFourLab() {
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [checked, setChecked] = useState(false)

  const handleText = (index: number, val: string) => {
    setAnswers((prev) => ({ ...prev, [index]: val }))
    setChecked(false)
  }

  return (
    <Panel title="النشاط الرابع: صحّح الكلمات">
      <p>صحّح الكلمات الآتية إذا كانت مكتوبة خطأ، وإن كانت الكلمة صحيحة فبيّن ذلك:</p>
      {activityFourItems.map(([prompt, solution, explanation], i) => (
        <div className="spell3-item" key={i}>
          <label htmlFor={`s3-act4-${i}`}>
            <strong>
              {i + 1}. <bdi>{prompt}</bdi>
            </strong>
          </label>
          <textarea
            id={`s3-act4-${i}`}
            value={answers[i] ?? ''}
            onChange={(e) => handleText(i, e.target.value)}
            placeholder="اكتب تصحيحك هنا..."
            rows={2}
          />
          {checked && (
            <div className="spell3-analysis-box" role="status">
              {answers[i]?.trim() ? (
                <>
                  <span className="spell3-status-ok">النموذج المعتمد:</span>{' '}
                  <strong>
                    <bdi>{solution}</bdi>
                  </strong>{' '}
                  — <small>{explanation}</small>
                </>
              ) : (
                <span className="spell3-status-retry">
                  أدخل إجابتك أولًا ثم اضغط زر التحقق للمقارنة بالنموذج.
                </span>
              )}
            </div>
          )}
        </div>
      ))}
      <button
        type="button"
        className="button button--primary"
        onClick={() => setChecked(true)}
      >
        تحقّق من النشاط
      </button>
    </Panel>
  )
}

// Activity 5: Complete the rule (fill in the blanks, auto-checked)
function normalizeCompletion(value: string): string {
  return value
    .replace(/[ً-ٰٟـ]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/[\s.،؛:؟!«»"'()-]/g, '')
}

function ActivityFiveLab() {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState(false)

  const handleText = (key: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [key]: val }))
    setChecked(false)
  }

  const isBlankCorrect = (key: string, accept: readonly string[]): boolean => {
    const value = answers[key] ?? ''
    if (value.trim() === '') return false
    const normalized = normalizeCompletion(value)
    return accept.some((option) => normalizeCompletion(option) === normalized)
  }

  return (
    <Panel title="النشاط الخامس: أكمل القاعدة">
      <p>املأ كل فراغ بالكلمة المناسبة، ثم اضغط زر التحقق:</p>
      {activityFiveItems.map((item, i) => (
        <div className="spell3-item" key={i}>
          <p>
            <strong>
              {i + 1}. <bdi>{item.prompt}</bdi>
            </strong>
          </p>
          <div className="spell3-completion">
            {item.blanks.map((accept, j) => {
              const key = `${i}-${j}`
              const ok = checked && isBlankCorrect(key, accept)
              const bad = checked && !isBlankCorrect(key, accept)
              return (
                <label key={key} className="spell3-completion-field">
                  الفراغ {j + 1}:
                  <input
                    type="text"
                    value={answers[key] ?? ''}
                    onChange={(e) => handleText(key, e.target.value)}
                    placeholder="اكتب الكلمة..."
                    aria-label={`الفراغ ${j + 1} من السؤال ${i + 1}`}
                  />
                  {ok && (
                    <span className="spell3-status-ok" role="status">
                      ✓ صحيح
                    </span>
                  )}
                  {bad && (
                    <span className="spell3-status-retry" role="status">
                      ✕ راجع إجابتك
                    </span>
                  )}
                </label>
              )
            })}
          </div>
          {checked && (
            <div className="spell3-analysis-box" role="status">
              <span className="spell3-status-ok">النموذج المعتمد:</span>{' '}
              <strong>
                <bdi>{item.model}</bdi>
              </strong>
            </div>
          )}
        </div>
      ))}
      <button
        type="button"
        className="button button--primary"
        onClick={() => setChecked(true)}
      >
        تحقّق من النشاط
      </button>
    </Panel>
  )
}

// Activity 6: Analyze words in context (completed key — خ-4)
function ActivitySixLab() {
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [checked, setChecked] = useState(false)

  return (
    <Panel title="النشاط السادس: حلّل كلمات في سياقها">
      <p>{activitySixInstruction}</p>
      {activitySixItems.map(([sentence, model], i) => (
        <div className="spell3-item" key={i}>
          <label htmlFor={`s3-act6-${i}`}>
            <strong>
              {i + 1}. <bdi>{sentence}</bdi>
            </strong>
          </label>
          <textarea
            id={`s3-act6-${i}`}
            value={answers[i] ?? ''}
            onChange={(e) => {
              setAnswers((prev) => ({ ...prev, [i]: e.target.value }))
              setChecked(false)
            }}
            placeholder="استخرج الكلمات وحدّد كرسي كل منها وسبب كتابتها..."
            rows={3}
          />
          {checked && (
            <div className="spell3-analysis-box" role="status">
              {answers[i]?.trim() ? (
                <>
                  <span className="spell3-status-ok">التحليل النموذجي:</span>{' '}
                  <small>{model}</small>
                </>
              ) : (
                <span className="spell3-status-retry">
                  اكتب تحليلك أولاً ثم اضغط زر التحقق للمقارنة بالنموذج.
                </span>
              )}
            </div>
          )}
        </div>
      ))}
      <button
        type="button"
        className="button button--primary"
        onClick={() => setChecked(true)}
      >
        تحقّق من النشاط
      </button>
    </Panel>
  )
}

function step(
  id: string,
  title: string,
  group: string,
  icon: string,
  content: ReactNode,
): LessonStepDefinition {
  return { id, title, group, icon, render: () => content }
}

export function LessonSpellingThree({
  onProgressChange,
  onFinish,
}: {
  onProgressChange?: (progress: number) => void
  onFinish?: () => void
}) {
  const engine = useTestEngine(testDefinition)

  const steps: LessonStepDefinition[] = [
    step(
      'intro',
      'المحور الأول: مدخل وأهداف الدرس — الهمزة المتوسطة',
      'البداية',
      '📘',
      <>
        <Panel title="القسم الثالث: الإملاء — الدرس الثالث: الهمزة المتوسطة — قواعد كتابتها على الألف والواو والياء والسطر">
          <p>
            <strong>الهدف العام:</strong> إتقان قاعدة أقوى الحركتين لتحديد كرسي الهمزة
            المتوسطة، وفهم الحالات الخاصة، وتصحيح الأخطاء الشائعة في رسمها.
          </p>
        </Panel>
        <Panel title="أولًا: أهداف الدرس">
          <p>بعد إتقان هذا الدرس، يُتوقَّع أن تكون قادرًا على:</p>
          <List items={objectives} ordered />
        </Panel>
      </>,
    ),

    step(
      'concept',
      'المحور الثاني: ما الهمزة المتوسطة؟',
      'التأسيس',
      '🔤',
      <>
        <Panel title="1. تعريف الهمزة المتوسطة">
          <p>
            <strong>{definitionSection.definition}</strong>
          </p>
          <p>أمثلة: {definitionSection.examples.join('، ')}.</p>
          {definitionSection.contrast.map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
        </Panel>
        <Panel title="2. ما المقصود بكرسي الهمزة؟">
          <p>{definitionSection.kursiDefinition}</p>
          <p>وللهمزة المتوسطة أربع صور أساسية:</p>
          <Table
            headers={['الصورة', 'اسمها', 'مثال']}
            rows={definitionSection.chairsTable}
          />
          <p>{definitionSection.nabraNote}</p>
          <div className="spell3-card spell3-card--highlight">
            <strong>تنبيه مهم: </strong>
            {definitionSection.platformAlert}
          </div>
        </Panel>
      </>,
    ),

    step(
      'strength',
      'المحور الثالث: ترتيب الحركات من حيث القوة',
      'التأسيس',
      '📊',
      <>
        <Panel title="1. ترتيب الحركات">
          <p>{strengthOrder.intro}</p>
          <p>من الأقوى إلى الأضعف:</p>
          <List items={strengthOrder.order} ordered />
          <p>
            <strong>{strengthOrder.memory}</strong>
          </p>
          <p>{strengthOrder.generalRule}</p>
        </Panel>
        <Panel title="2. ما الكرسي المناسب لكل حركة؟">
          <Table
            headers={['أقوى حركة', 'كرسي الهمزة', 'مثال']}
            rows={strengthOrder.chairMap}
          />
          {strengthOrder.sukoonNote.map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
        </Panel>
        <Panel title="3. كيف نطبّق القاعدة؟">
          {strengthOrder.applications.map((app, idx) => (
            <div className="spell3-item" key={idx}>
              <h4>
                انظر إلى كلمة «<bdi>{app.word}</bdi>»:
              </h4>
              <List items={app.lines} />
            </div>
          ))}
          <p>{strengthOrder.fourSteps}</p>
        </Panel>
      </>,
    ),

    step(
      'alef',
      'المحور الرابع: كتابة الهمزة المتوسطة على الألف',
      'الكراسي',
      '✍️',
      <>
        <Panel title="1. القاعدة العامة">
          <p>
            <strong>{alefSection.generalRule}</strong>
          </p>
          <p>{alefSection.generalForms}</p>
          <p>أمثلة: {alefSection.generalExamples.join('، ')}.</p>
        </Panel>
        <Panel title={`2. ${alefSection.openAfterOpen.title}`}>
          <p>أمثلة: {alefSection.openAfterOpen.examples.join('، ')}.</p>
          <p>{alefSection.openAfterOpen.note}</p>
        </Panel>
        <Panel title={`3. ${alefSection.sakinAfterOpen.title}`}>
          <p>أمثلة: {alefSection.sakinAfterOpen.examples.join('، ')}.</p>
          <p>السبب:</p>
          <List items={alefSection.sakinAfterOpen.reason} />
        </Panel>
        <Panel title={`4. ${alefSection.openAfterSakin.title}`}>
          <p>{alefSection.openAfterSakin.intro}</p>
          <p>{alefSection.openAfterSakin.examples.join('، ')}.</p>
          <p>{alefSection.openAfterSakin.caution}</p>
        </Panel>
        <Panel title="5. أمثلة محلّلة">
          {alefSection.analyzed.map((ex, idx) => (
            <div className="spell3-item" key={idx}>
              <h4>
                المثال {idx + 1}: «<bdi>{ex.word}</bdi>»
              </h4>
              <List items={ex.lines} />
            </div>
          ))}
        </Panel>
      </>,
    ),

    step(
      'waw',
      'المحور الخامس: كتابة الهمزة المتوسطة على الواو',
      'الكراسي',
      '✍️',
      <>
        <Panel title="1. القاعدة العامة">
          <p>
            <strong>{wawSection.generalRule}</strong>
          </p>
          <p>أمثلة: {wawSection.generalExamples.join('، ')}.</p>
        </Panel>
        <Panel title={`2. ${wawSection.dammaBeforeOpenOrSakin.title}`}>
          <Table
            headers={['المثال', 'التحليل']}
            rows={wawSection.dammaBeforeOpenOrSakin.examples}
          />
          <p>{wawSection.dammaBeforeOpenOrSakin.raoufRef}</p>
          <p>{wawSection.dammaBeforeOpenOrSakin.reminder}</p>
          <Note>{wawSection.yasakNote}</Note>
        </Panel>
        <Panel title={`3. ${wawDammaAfterDammaPlatform.title} (بند مكمّل من المنصة)`}>
          <Note>
            {wawDammaAfterDammaPlatform.rule} الأمثلة: رُؤُوس، شُؤُون.
          </Note>
          {wawDammaAfterDammaPlatform.items.map((item, idx) => (
            <div className="spell3-item" key={idx}>
              <h4>
                تحليل «<bdi>{item.word}</bdi>»:
              </h4>
              <List items={item.lines} />
            </div>
          ))}
        </Panel>
        <Panel title={`4. ${wawSection.sakinBeforeDamma.title}`}>
          <p>أمثلة: {wawSection.sakinBeforeDamma.examples.join('، ')}.</p>
          <List items={wawSection.sakinBeforeDamma.analysis} />
        </Panel>
        <Panel title={`5. ${wawSection.openBeforeDamma.title}`}>
          <p>{wawSection.openBeforeDamma.intro}</p>
          <List items={wawSection.openBeforeDamma.analysis} />
        </Panel>
        <Panel title="6. أمثلة محلّلة">
          {wawSection.analyzed.map((ex, idx) => (
            <div className="spell3-item" key={idx}>
              <h4>
                المثال {idx + 1}: «<bdi>{ex.word}</bdi>»
              </h4>
              <List items={ex.lines} />
            </div>
          ))}
        </Panel>
      </>,
    ),

    step(
      'nabra',
      'المحور السادس: كتابة الهمزة المتوسطة على الياء أو النبرة',
      'الكراسي',
      '✍️',
      <>
        <Panel title="1. القاعدة العامة">
          <p>
            <strong>{nabraSection.generalRule}</strong>
          </p>
          <p>أمثلة: {nabraSection.generalExamples.join('، ')}.</p>
        </Panel>
        <Panel title={`2. ${nabraSection.maksoora.title}`}>
          <p>{nabraSection.maksoora.intro}</p>
          <p>أمثلة: {nabraSection.maksoora.examples.join('، ')}.</p>
          <List items={nabraSection.maksoora.raisAnalysis} />
          <div className="spell3-card spell3-card--highlight">
            <p>{nabraSection.maksoora.practicalRule}</p>
          </div>
        </Panel>
        <Panel title={`3. ${nabraSection.prevKasra.title}`}>
          <p>{nabraSection.prevKasra.intro}</p>
          <p>أمثلة: {nabraSection.prevKasra.examples.join('، ')}.</p>
          {nabraSection.prevKasra.analyses.map((an, idx) => (
            <div className="spell3-item" key={idx}>
              <h4>
                تحليل «<bdi>{an.word}</bdi>»:
              </h4>
              <List items={an.lines} />
            </div>
          ))}
        </Panel>
        <Panel title={`4. ${nabraSection.dammaAfterKasra.title}`}>
          <p>{nabraSection.dammaAfterKasra.rule}</p>
          <Table
            headers={['المثال', 'التحليل']}
            rows={nabraSection.dammaAfterKasra.examples}
          />
          <p>{nabraSection.dammaAfterKasra.followUp}</p>
        </Panel>
        <Panel title="5. أمثلة محلّلة">
          {nabraSection.analyzed.map((ex, idx) => (
            <div className="spell3-item" key={idx}>
              <h4>
                المثال {idx + 1}: «<bdi>{ex.word}</bdi>»
              </h4>
              <List items={ex.lines} />
            </div>
          ))}
        </Panel>
      </>,
    ),

    step(
      'line',
      'المحور السابع: الهمزة المتوسطة على السطر',
      'الكراسي',
      '✍️',
      <>
        <Panel title="تمهيد: حدود قاعدة أقوى الحركتين">
          <p>{lineSection.intro}</p>
        </Panel>
        <Panel title={`1. ${lineSection.afterAlef.title}`}>
          <p>من الأمثلة: {lineSection.afterAlef.examples.join('، ')}.</p>
          <p>{lineSection.afterAlef.rule}</p>
          <p>قارن:</p>
          <List items={lineSection.afterAlef.compare} />
        </Panel>
        <Panel title={`2. ${lineSection.afterWaw.title}`}>
          <p>من الأمثلة: {lineSection.afterWaw.examples.join('، ')}.</p>
          <p>{lineSection.afterWaw.rule}</p>
        </Panel>
        <Panel title={`3. ${lineSection.distinguish.title}`}>
          <p>{lineSection.distinguish.intro}</p>
          <List items={lineSection.distinguish.questions} ordered />
          <p>{lineSection.distinguish.note}</p>
          <p>
            <strong>{lineSection.caution}</strong>
          </p>
        </Panel>
        <Panel title="4. أمثلة مقارنة">
          <Table
            headers={['الكلمة', 'رسم الهمزة', 'السبب المختصر']}
            rows={lineSection.compareTable}
          />
        </Panel>
      </>,
    ),

    step(
      'special',
      'المحور الثامن: الحالات الخاصة التي يجب الانتباه إليها',
      'الضبط',
      '⚠️',
      <>
        <Panel title={`1. ${specialCases.afterYaa.title}`}>
          <p>{specialCases.afterYaa.intro}</p>
          <p>{specialCases.afterYaa.examples.join('، ')}.</p>
          <p>{specialCases.afterYaa.rule}</p>
        </Panel>
        <Panel title={`2. ${specialCases.maddMeeting.title}`}>
          <p>{specialCases.maddMeeting.intro}</p>
          <p>أمثلة: {specialCases.maddMeeting.examples.join('، ')}.</p>
          <p>{specialCases.maddMeeting.note}</p>
        </Panel>
        <Panel title={`3. ${specialCases.formChange.title}`}>
          <p>{specialCases.formChange.intro}</p>
          <p>أمثلة: {specialCases.formChange.examples.join('، ')}.</p>
          <p>{specialCases.formChange.note}</p>
        </Panel>
        <Panel title={`4. ${specialCases.singleHaraka.title}`}>
          <p>{specialCases.singleHaraka.intro}</p>
          <List items={specialCases.singleHaraka.examples} />
          <p>
            <strong>{specialCases.singleHaraka.conclusion}</strong>
          </p>
        </Panel>
      </>,
    ),

    step(
      'method',
      'المحور التاسع: خطوات كتابة الهمزة المتوسطة بطريقة منهجية',
      'الضبط',
      '🧭',
      <>
        <Panel title="الخطوات السبع بالترتيب">
          <p>عندما تواجه كلمة فيها همزة متوسطة، اتبع الخطوات الآتية بالترتيب:</p>
          {methodSteps.map(([title, body], idx) => (
            <div className="spell3-item" key={idx}>
              <h4>{title}</h4>
              <p>{body}</p>
            </div>
          ))}
          <Note>{methodYaaNote}</Note>
        </Panel>
      </>,
    ),

    step(
      'errors',
      'المحور العاشر: أخطاء شائعة وتصحيحها',
      'الضبط',
      '⚠️',
      <>
        <Panel title="جدول الأخطاء الشائعة">
          <Table
            headers={['الخطأ', 'الصواب', 'سبب التصحيح']}
            rows={commonErrorsList}
          />
          <p>{commonErrorsNote}</p>
        </Panel>
      </>,
    ),

    step(
      'worked',
      'المحور الحادي عشر: أمثلة محلّلة بالتفصيل',
      'التطبيق',
      '📝',
      <>
        <Panel title="خمسة أمثلة محلولة خطوة بخطوة">
          {workedExamples.map((ex, idx) => (
            <div className="spell3-item" key={idx}>
              <h4>
                المثال {idx + 1}: «<bdi>{ex.word}</bdi>»
              </h4>
              <List items={ex.lines} ordered />
            </div>
          ))}
        </Panel>
      </>,
    ),

    step(
      'activities',
      'المحور الثاني عشر: التدريبات التطبيقية التفاعلية (٦ أنشطة)',
      'الأنشطة',
      '🎮',
      <>
        <ActivityOneLab />
        <ActivityTwoLab />
        <ActivityThreeLab />
        <ActivityFourLab />
        <ActivityFiveLab />
        <ActivitySixLab />
      </>,
    ),

    step(
      'test',
      'المحور الثالث عشر: اختبار نهاية الدرس (٣٠ درجة)',
      'الاختبار',
      '🏁',
      <TestRunner test={testDefinition} engine={engine} />,
    ),

    step(
      'solutions',
      'المحور الرابع عشر: حلول الاختبار ومفاتيح الإجابة',
      'الاختبار',
      '📗',
      <SolutionsArea test={testDefinition} engine={engine} />,
    ),

    step(
      'summary-next',
      'المحور الخامس عشر: الخلاصة النهائية والدرس التالي',
      'الخلاصة',
      '📌',
      <>
        <Panel title="خلاصة الدرس">
          <p>تذكّر القاعدة الأساسية:</p>
          <List items={summaryPoints} />
          <Note>{summaryYaaNote}</Note>
          <p>
            <strong>{bestMethod}</strong>
          </p>
        </Panel>
        <Panel title="الدرس التالي المقترح">
          <h4>{nextLessonInfo.title}</h4>
          <p>{nextLessonInfo.description}</p>
        </Panel>
      </>,
    ),

    step(
      'teacher',
      'المحور السادس عشر: منطقة خاصة بالمعلم',
      'منطقة المعلم',
      '🔐',
      <TeacherSpace>
        <h3>أولاً: مفتاح إجابات الاختبار النهائي (٣٠ درجة) مع التعليل ومعايير التصحيح</h3>
        <p>
          تُصحّح الأسئلة الآلية (ترتيب الحركات، واختيار الكرسي، وتصحيح الرسم) فور تحقق
          الطالب، بينما تُراجع الأسئلة المقالية (التعريف، وكرسي الهمزة، والصور الأربع،
          والتعليلات الأربعة، والشرْحان) يدويًا وفق التوزيع المعتمد: التعريف ٢، والترتيب
          ٢، والكرسي ١، والصور ١، وكل تعليل ٢، وكل بند تصحيح نصف درجة، وكل شرح ٢.
        </p>
        <SolutionsArea
          test={testDefinition}
          mode="teacher"
          title="مفتاح إجابات المعلم التفصيلي"
        />

        <h3>ثانياً: معايير تقييم درجات الاختبار النهائي</h3>
        <Table
          headers={['النطاق من ٣٠', 'التقدير', 'التوجيه التعليمي']}
          rows={gradingRubrics.map((r) => [r.range, r.label, r.desc])}
        />

        <h3>ثالثاً: ملاحظات المعلم والتوجيهات التصحيحية</h3>
        <List items={teacherNotes} ordered />

        <h3>رابعاً: توثيق التدقيق وسجل التصحيحات المعتمدة</h3>
        <p>
          تم حصر وتوثيق جميع التصحيحات اللغوية والإملائية في ملف التدقيق المستقل:{' '}
          <code>docs/spelling-lesson-03-audit.md</code>.
        </p>
      </TeacherSpace>,
    ),
  ]

  return (
    <LessonFlow
      steps={steps}
      onProgressChange={onProgressChange}
      onFinish={onFinish}
      lessonTitle="الهمزة المتوسطة"
      lessonNumber="٣"
      lessonEyebrow="القسم الثالث: الإملاء"
    />
  )
}
