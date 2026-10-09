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
  concepts,
  qatRules,
  waslRules,
  waslPositions,
  qatPositions,
  comparisonTableRows,
  preciseComparisons,
  phoneticSteps,
  practicalSteps,
  commonErrorsList,
  workedExamples,
  activityOneItems,
  activityTwoItems,
  activityThreeItems,
  activityFourItems,
  activityFiveItems,
  activitySixWords,
  teacherNotes,
  gradingRubrics,
  enrichmentContent,
  nextLessonInfo,
  testDefinition as lessonTwoTest,
} from './spelling-lesson-02/content'

// The approved corrections are itemized in docs/spelling-lesson-02-audit.md.
// eslint-disable-next-line react-refresh/only-export-components -- shared test schema is lesson data
export const testDefinition: TestDefinition = lessonTwoTest

function List({ items, ordered = false }: { items: readonly string[]; ordered?: boolean }) {
  const Tag = ordered ? 'ol' : 'ul'
  return (
    <Tag className="spell2-list">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </Tag>
  )
}

function Note({ children }: { children: ReactNode }) {
  return (
    <aside className="spell2-note">
      <strong>توضيح تعليمي من المنصة</strong>
      <p>{children}</p>
    </aside>
  )
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="spell2-panel">
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
    <div className="spell2-table-wrap">
      <table className="spell2-table">
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

// Activity 1: Classify Words (وصل / قطع)
function ActivityOneLab() {
  const [choices, setChoices] = useState<Record<number, string>>({})
  const [checked, setChecked] = useState(false)

  const handleSelect = (index: number, val: string) => {
    setChoices((prev) => ({ ...prev, [index]: val }))
    setChecked(false)
  }

  return (
    <Panel title="النشاط الأول: صنّف الكلمات إلى همزة وصل أو همزة قطع">
      <p>حدّد نوع الهمزة في كل كلمة من الكلمات العشرين الآتية، ثم اضغط زر التحقق:</p>
      <div className="spell2-table-wrap">
        <table className="spell2-table">
          <thead>
            <tr>
              <th>#</th>
              <th>الكلمة</th>
              <th>نوع الهمزة</th>
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
                    <div className="spell2-options">
                      {['وصل', 'قطع'].map((opt) => (
                        <label key={opt}>
                          <input
                            type="radio"
                            name={`act1-${i}`}
                            value={opt}
                            checked={selected === opt}
                            onChange={() => handleSelect(i, opt)}
                          />
                          {opt === 'وصل' ? 'همزة وصل' : 'همزة قطع'}
                        </label>
                      ))}
                    </div>
                  </td>
                  {checked && (
                    <td>
                      <span className={isCorrect ? 'spell2-status-ok' : 'spell2-status-retry'}>
                        {isCorrect ? '✓ صحيح' : '✕ راجع الإجابة'}: همزة {answer}.
                      </span>
                      <small className="spell2-analysis-box">{explanation}</small>
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

// Activity 2: Correct Spelling Errors
function ActivityTwoLab() {
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [checked, setChecked] = useState(false)

  const handleText = (index: number, val: string) => {
    setAnswers((prev) => ({ ...prev, [index]: val }))
    setChecked(false)
  }

  return (
    <Panel title="النشاط الثاني: صحّح الأخطاء الإملائية مع التعليل">
      <p>
        أعد كتابة الكلمات أو الجمل التي كُتبت خطأ، وإن كانت الجملة صحيحة فاكتب: «العبارة صحيحة»؛
        ثم تحقّق من إجابتك:
      </p>
      {activityTwoItems.map(([prompt, solution, explanation], i) => (
        <div className="spell2-item" key={i}>
          <label htmlFor={`act2-${i}`}>
            <strong>
              {i + 1}. <bdi>{prompt}</bdi>
            </strong>
          </label>
          <textarea
            id={`act2-${i}`}
            value={answers[i] ?? ''}
            onChange={(e) => handleText(i, e.target.value)}
            placeholder="اكتب تصحيحك هنا..."
            rows={2}
          />
          {checked && (
            <div className="spell2-analysis-box" role="status">
              {answers[i]?.trim() ? (
                <>
                  <span className="spell2-status-ok">النموذج المعتمد:</span>{' '}
                  <strong>
                    <bdi>{solution}</bdi>
                  </strong>{' '}
                  — <small>{explanation}</small>
                </>
              ) : (
                <span className="spell2-status-retry">
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

// Activity 3: Multiple Choice
function ActivityThreeLab() {
  const [selected, setSelected] = useState<Record<number, string>>({})
  const [checked, setChecked] = useState(false)

  const letters = ['أ', 'ب', 'ج', 'د']

  return (
    <Panel title="النشاط الثالث: اختر الإجابة الصحيحة">
      <p>اختر الخيار المناسب لكل سؤال، ولا تظهر الإجابة النموذجية إلا بعد الضغط على زر التحقق:</p>
      {activityThreeItems.map(([prompt, options, key, explanation], i) => (
        <fieldset className="spell2-item" key={i}>
          <legend>
            <strong>
              {i + 1}. {prompt}
            </strong>
          </legend>
          <div className="spell2-options">
            {options.map((opt, j) => {
              const letter = letters[j]
              return (
                <label key={j}>
                  <input
                    type="radio"
                    name={`act3-${i}`}
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
                  selected[i] === key ? 'spell2-status-ok' : 'spell2-status-retry'
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

// Activity 4: Fill in the Blanks
function ActivityFourLab() {
  const [selected, setSelected] = useState<Record<number, string>>({})
  const [checked, setChecked] = useState(false)

  return (
    <Panel title="النشاط الرابع: أكمل الفراغ بالرسم الصحيح">
      <p>اختر الصورة الإملائية السليمة بين القوسين لإكمال المعنى في كل جملة:</p>
      {activityFourItems.map(([prompt, answer, explanation], i) => {
        // extract options inside parentheses
        const match = prompt.match(/\(([^)]+)\)/)
        const opts = match ? match[1].split('/').map((s) => s.trim()) : []
        return (
          <div className="spell2-item" key={i}>
            <p>
              <strong>
                {i + 1}. <bdi>{prompt}</bdi>
              </strong>
            </p>
            <div className="spell2-options">
              {opts.map((opt) => (
                <label key={opt}>
                  <input
                    type="radio"
                    name={`act4-${i}`}
                    checked={selected[i] === opt}
                    onChange={() => {
                      setSelected((prev) => ({ ...prev, [i]: opt }))
                      setChecked(false)
                    }}
                  />
                  <bdi>{opt}</bdi>
                </label>
              ))}
            </div>
            {checked && (
              <p role="status">
                <span
                  className={
                    selected[i] === answer ? 'spell2-status-ok' : 'spell2-status-retry'
                  }
                >
                  {selected[i] === answer ? '✓ صحيح' : '✕ الصواب'}: «{answer}».
                </span>{' '}
                — <small>{explanation}</small>
              </p>
            )}
          </div>
        )
      })}
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

// Activity 5: Explain the Reason (علل)
function ActivityFiveLab() {
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [checked, setChecked] = useState(false)

  return (
    <Panel title="النشاط الخامس: علّل كتابة الهمزة">
      <p>بيّن سبب كتابة الهمزة في الكلمات الآتية (نوعها والعلة الصرفية):</p>
      {activityFiveItems.map(([word, explanation], i) => (
        <div className="spell2-item" key={i}>
          <label htmlFor={`act5-${i}`}>
            <strong>
              {i + 1}. علّل كتابة الهمزة في: «<bdi>{word}</bdi>»
            </strong>
          </label>
          <textarea
            id={`act5-${i}`}
            value={answers[i] ?? ''}
            onChange={(e) => {
              setAnswers((prev) => ({ ...prev, [i]: e.target.value }))
              setChecked(false)
            }}
            placeholder="اكتب تعليلك الصرفي والإملائي هنا..."
            rows={2}
          />
          {checked && (
            <div className="spell2-analysis-box" role="status">
              {answers[i]?.trim() ? (
                <>
                  <span className="spell2-status-ok">التعليل النموذجي:</span>{' '}
                  <bdi>{explanation}</bdi>{' '}
                  <small>(قارن تحليلك بالنموذج؛ وتُقبل الصياغات المكافئة)</small>
                </>
              ) : (
                <span className="spell2-status-retry">
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

// Activity 6: Sentence Composition
function ActivitySixLab() {
  const [sentences, setSentences] = useState<Record<number, string>>({})
  const [checked, setChecked] = useState(false)

  return (
    <Panel title="النشاط السادس: اكتب جملًا من إنشائك">
      <p>
        اكتب جملة مفيدة لكل كلمة من الكلمات الآتية، مع المحافظة على كتابتها الصحيحة ومراعاة
        الصيغة الصرفية (الماضي / الأمر / المضارع / المصدر):
      </p>
      {activitySixWords.map(([word, guide], i) => (
        <div className="spell2-item" key={i}>
          <label htmlFor={`act6-${i}`}>
            <strong>
              {i + 1}. كلمة «<bdi>{word}</bdi>»:
            </strong>
          </label>
          <textarea
            id={`act6-${i}`}
            value={sentences[i] ?? ''}
            onChange={(e) => {
              setSentences((prev) => ({ ...prev, [i]: e.target.value }))
              setChecked(false)
            }}
            placeholder="اكتب جملتك المفيدة هنا..."
            rows={2}
          />
          {checked && (
            <div className="spell2-analysis-box" role="status">
              {sentences[i]?.trim() ? (
                <>
                  <span className="spell2-status-ok">إرشاد ومثال نموذجي:</span>{' '}
                  <small>{guide}</small>
                </>
              ) : (
                <span className="spell2-status-retry">
                  اكتب جملتك أولاً للتحقق من مطابقة المعنى والصيغة.
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

export function LessonSpellingTwo({
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
      'مدخل وأهداف الدرس — همزة الوصل وهمزة القطع',
      'البداية',
      '📘',
      <>
        <Panel title="القسم الثالث: الإملاء — الدرس الثاني: همزة الوصل وهمزة القطع">
          <p>
            <strong>المستوى:</strong> تأسيسي ومتقدم، يجمع بين الضبط الإملائي والتحليل الصرفي.
          </p>
          <p>
            <strong>الهدف العام:</strong> إتقان التمييز بين همزة الوصل وهمزة القطع نطقًا وكتابةً،
            وضبط مواضعهما في الأسماء والأفعال والحروف، وتجنّب الأخطاء الإملائية الشائعة.
          </p>
        </Panel>
        <Panel title="أهداف الدرس">
          <p>بعد دراسة هذا الدرس، يُتوقّع من الطالب أن يكون قادرًا على أن:</p>
          <List items={objectives} ordered />
        </Panel>
      </>,
    ),

    step(
      'concept',
      'المحور الأول: ما الهمزة؟ وما الفرق بين الهمزة والألف؟',
      'التأسيس',
      '🔤',
      <>
        <Panel title="التمييز بين ثلاثة مفاهيم أساسية">
          <p>قبل الشروع في دراسة همزة الوصل وهمزة القطع، يجب أن نفرّق بين ثلاثة أمور:</p>
          <div className="spell2-item">
            <h4>1. الهمزة</h4>
            <p>{concepts.hamza}</p>
          </div>
          <div className="spell2-item">
            <h4>2. الألف</h4>
            <p>{concepts.alef}</p>
          </div>
          <div className="spell2-item">
            <h4>3. رسم الهمزة</h4>
            <p>{concepts.drawing}</p>
          </div>
          <Note>
            في هذا الدرس نركّز على الهمزة التي تأتي في مطلع الكلمة وبدايتها، ونميّز بين صورتيها
            الرئيسيتين: همزة الوصل، وهمزة القطع.
          </Note>
        </Panel>
      </>,
    ),

    step(
      'qat-rules',
      'المحور الثاني: همزة القطع — تعريفها ورسمها ونطقها',
      'التأسيس',
      '✍️',
      <>
        <Panel title="1. تعريف همزة القطع">
          <p>
            <strong>{qatRules.definition}</strong>
          </p>
        </Panel>
        <Panel title="2. كيف تُكتب همزة القطع في أول الكلمة؟">
          <Table
            headers={['حركة الهمزة', 'صورتها الخطية', 'أمثلة']}
            rows={qatRules.forms}
          />
          <div className="spell2-card spell2-card--highlight">
            <p>{qatRules.ruleNote}</p>
          </div>
        </Panel>
        <Panel title="3. أمثلة على نطق همزة القطع في جمل متصلة">
          <List items={qatRules.examples} />
          <p>
            لاحظ أن الهمزة في «جاء أحمدُ» تبقى منطوقة تمامًا بعد الكلمة السابقة ولا تسقط في درج
            الكلام؛ ولهذا سُميت همزة قطع لأنها تقطع مجرى الصوت وتثبت في كل حال.
          </p>
        </Panel>
      </>,
    ),

    step(
      'wasl-rules',
      'المحور الثالث: همزة الوصل — تعريفها ورسمها ونطقها',
      'التأسيس',
      '🔗',
      <>
        <Panel title="1. تعريف همزة الوصل">
          <p>
            <strong>{waslRules.definition}</strong>
          </p>
        </Panel>
        <Panel title="2. النطق عند البدء وعند الوصل">
          <p>عند البدء بالكلمة منفردة ننطق الهمزة مكسورة أو مضمومة:</p>
          <Table
            headers={['الكلمة منفردة', 'حالتها الصوتية عند البدء']}
            rows={waslRules.examplesAtStart}
          />
          <p>لكن عند وصل الكلمة بما قبلها تسقط همزة الوصل من النطق تمامًا:</p>
          <Table
            headers={['الجملة في سياق متصل', 'الملاحظة الصوتية']}
            rows={waslRules.examplesInLiaison}
          />
        </Panel>
        <Panel title="3. كيف تُكتب همزة الوصل؟">
          <p>تُكتب ألفًا مجردة من علامة الهمزة (رأس العين):</p>
          <Table
            headers={['الكتابة الصحيحة', 'الخطأ الشائع الواجب تجنبه']}
            rows={waslRules.spellingCaution}
          />
          <Note>
            عدم كتابة رأس الهمزة لا يعني إسقاط الألف؛ بل يعني أن هذه الألف تحمل همزة وصل مجردة
            لا همزة قطع.
          </Note>
        </Panel>
        <Panel title="4. جدول المقارنة الصوتية عند البدء والوصل">
          <Table
            headers={['الكلمة عند البدء', 'الكلمة في سياق متصل', 'نوع الهمزة والحكم']}
            rows={waslRules.phoneticComparison}
          />
        </Panel>
      </>,
    ),

    step(
      'wasl-nouns-letters',
      'المحور الرابع: مواضع همزة الوصل — الحروف والأسماء',
      'مواضع الهمزات',
      '🏛️',
      <>
        <Panel title={waslPositions.letters.title}>
          <p>
            <strong>{waslPositions.letters.rule}</strong>
          </p>
          <h4>أ. مع الحروف الشمسية</h4>
          <Table
            headers={['المثال', 'التحليل الصوتي والكتابي']}
            rows={waslPositions.letters.solar}
          />
          <h4>ب. مع الحروف القمرية</h4>
          <p>تُظهر اللام صوتًا وكتابة: {waslPositions.letters.lunar.join('، ')}.</p>
          <p>{waslPositions.letters.summary}</p>
        </Panel>

        <Panel title={waslPositions.nouns.title}>
          <p>
            <strong>{waslPositions.nouns.rule}</strong>
          </p>
          <h4>الأسماء السماعية السبعة الشائعة وتثنيتها:</h4>
          <Table
            headers={['الاسم السماعي', 'مثال في جملة']}
            rows={waslPositions.nouns.famousSeven}
          />
          <p>{waslPositions.nouns.rareNouns}</p>

          <h4>حالات حذف ألف الوصل في الرسم الإملائي الخاص:</h4>
          <Table
            headers={['الحالة الإملائية', 'القاعدة والشروط']}
            rows={waslPositions.nouns.deletionCases}
          />

          <h4>تنبيه لعدم التعميم:</h4>
          <Table
            headers={['الاسم', 'نوع الهمزة والتعليل']}
            rows={waslPositions.nouns.cautionNotToGeneralize}
          />
        </Panel>
      </>,
    ),

    step(
      'wasl-verbs',
      'المحور الخامس: مواضع همزة الوصل — الأفعال ومصادرها',
      'مواضع الهمزات',
      '⚙️',
      <>
        <Panel title={waslPositions.verbs.triliteralOrder.title}>
          <p>
            <strong>{waslPositions.verbs.triliteralOrder.rule}</strong>
          </p>
          <Table
            headers={['الماضي الثلاثي', 'صيغة الأمر', 'مثال في سياق']}
            rows={waslPositions.verbs.triliteralOrder.examples}
          />
          <h4>قاعدة ضبط حركة همزة الوصل في أمر الثلاثي:</h4>
          <List items={waslPositions.verbs.triliteralOrder.harakaRule} ordered />
          <Note>{waslPositions.verbs.triliteralOrder.platformCorrection}</Note>
        </Panel>

        <Panel title={waslPositions.verbs.khumasi.title}>
          <p>
            <strong>{waslPositions.verbs.khumasi.rule}</strong>
          </p>
          <Table
            headers={['الماضي الخماسي', 'أمر الخماسي', 'مصدر الخماسي']}
            rows={waslPositions.verbs.khumasi.table}
          />
          <Note>{waslPositions.verbs.khumasi.platformNote}</Note>
        </Panel>

        <Panel title={waslPositions.verbs.sudasi.title}>
          <p>
            <strong>{waslPositions.verbs.sudasi.rule}</strong>
          </p>
          <Table
            headers={['الماضي السداسي', 'أمر السداسي', 'مصدر السداسي']}
            rows={waslPositions.verbs.sudasi.table}
          />
          <List items={waslPositions.verbs.sudasi.examples} />
          <div className="spell2-card spell2-card--highlight">
            <strong>{waslPositions.verbs.sudasi.goldenRule}</strong>
          </div>
        </Panel>
      </>,
    ),

    step(
      'qat-positions',
      'المحور السادس: مواضع همزة القطع',
      'مواضع الهمزات',
      '🎯',
      <>
        <Panel title={qatPositions.nouns.title}>
          <p>
            <strong>{qatPositions.nouns.rule}</strong>
          </p>
          <p>أمثلة: {qatPositions.nouns.examples.join('، ')}.</p>
          <Table
            headers={['الكلمة', 'التعليل الإملائي والصرفي']}
            rows={qatPositions.nouns.contrast}
          />
        </Panel>

        <Panel title={qatPositions.rubai.title}>
          <p>
            <strong>{qatPositions.rubai.rule}</strong>
          </p>
          <Table
            headers={['الماضي الرباعي (أفعلَ)', 'أمر الرباعي (أفْعِلْ)', 'مصدر الرباعي (إفْعال)']}
            rows={qatPositions.rubai.table}
          />
          <Table
            headers={['المقارنة بين الرباعي والسداسي', 'الحكم الصرفي والإملائي']}
            rows={qatPositions.rubai.comparison}
          />
        </Panel>

        <Panel title={qatPositions.mudari.title}>
          <p>
            <strong>{qatPositions.mudari.rule}</strong>
          </p>
          <Table
            headers={['الفعل المضارع للمتكلم', 'الصيغة والبيان']}
            rows={qatPositions.mudari.examples}
          />
          <h4>المقارنة الثلاثية الدقيقة:</h4>
          <Table
            headers={['الصيغة', 'التحليل والحكم الإملائي']}
            rows={qatPositions.mudari.crucialContrast}
          />
        </Panel>

        <Panel title={qatPositions.letters.title}>
          <p>
            <strong>{qatPositions.letters.rule}</strong>
          </p>
          <p>أمثلة: {qatPositions.letters.examples.join('، ')}.</p>
          <List items={qatPositions.letters.sentences} />
        </Panel>
      </>,
    ),

    step(
      'comparison',
      'المحور السابع: المقارنة الشاملة والأمثلة الدقيقة',
      'المقارنة والضبط',
      '⚖️',
      <>
        <Panel title="جدول المقارنة الشامل بين همزة الوصل وهمزة القطع">
          <Table
            headers={['وجه المقارنة', 'همزة الوصل', 'همزة القطع']}
            rows={comparisonTableRows}
          />
        </Panel>
        <Panel title="أمثلة المقارنة الدقيقة وتفسيرها">
          <Table
            headers={['المثال التطبيقي', 'التفسير الصرفي والإملائي']}
            rows={preciseComparisons}
          />
        </Panel>
      </>,
    ),

    step(
      'phonetic-test',
      'المحور الثامن: اختبار النطق العملي والخطوات التطبيقية',
      'المقارنة والضبط',
      '🎧',
      <>
        <Panel title="اختبار النطق العملي (خطوة بخطوة)">
          {phoneticSteps.map(({ step: sTitle, body }, idx) => (
            <div className="spell2-item" key={idx}>
              <h4>{sTitle}</h4>
              <p>{body}</p>
            </div>
          ))}
        </Panel>
        <Panel title="ثماني خطوات عملية لتحديد همزة أي كلمة وتصحيحها">
          <List items={practicalSteps} ordered />
        </Panel>
      </>,
    ),

    step(
      'common-errors',
      'المحور التاسع: حالات دقيقة وأخطاء شائعة',
      'المقارنة والضبط',
      '⚠️',
      <>
        <Panel title="ثماني حالات دقيقة يجب الانتباه إليها">
          {commonErrorsList.map(([title, desc], idx) => (
            <div className="spell2-item" key={idx}>
              <h4>
                {idx + 1}. {title}
              </h4>
              <p>{desc}</p>
            </div>
          ))}
        </Panel>
      </>,
    ),

    step(
      'worked',
      'المحور العاشر: أمثلة محلولة نموذجية',
      'التطبيق',
      '📝',
      <>
        <Panel title="خمسة نماذج تطبيقية محلولة مع الشرح والتحليل الصرفي">
          {workedExamples.map((ex, idx) => (
            <div className="spell2-item" key={idx}>
              <h4>
                المثال {idx + 1}: «<bdi>{ex.sentence}</bdi>»
              </h4>
              <List items={ex.analysis} />
            </div>
          ))}
        </Panel>
      </>,
    ),

    step(
      'activities',
      'المحور الحادي عشر: التدريبات التطبيقية التفاعلية (٦ أنشطة)',
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
      'المحور الثاني عشر: اختبار نهاية الدرس (٣٠ درجة مقترحة)',
      'الاختبار',
      '🏁',
      <TestRunner test={testDefinition} engine={engine} />,
    ),

    step(
      'solutions',
      'المحور الثالث عشر: حلول الاختبار ومفاتيح الإجابة',
      'الاختبار',
      '📗',
      <SolutionsArea test={testDefinition} engine={engine} />,
    ),

    step(
      'summary-next',
      'المحور الرابع عشر: الخلاصة النهائية والإثراء والدرس التالي',
      'الخلاصة',
      '📌',
      <>
        <Panel title="الخلاصة الذهبية للدرس">
          <p>{enrichmentContent.goldenConclusion}</p>
        </Panel>
        <Panel title={enrichmentContent.title}>
          <p>{enrichmentContent.text}</p>
          <Table
            headers={['الصيغة', 'التحليل الصرفي ونوع الهمزة']}
            rows={enrichmentContent.contrasts}
          />
        </Panel>
        <Panel title="الدرس التالي المقترح">
          <h4>{nextLessonInfo.title}</h4>
          <p>{nextLessonInfo.description}</p>
        </Panel>
      </>,
    ),

    step(
      'teacher',
      'المحور الخامس عشر: منطقة خاصة بالمعلم',
      'منطقة المعلم',
      '🔐',
      <TeacherSpace>
        <h3>أولاً: مفتاح إجابات الاختبار النهائي (٣٠ درجة) مع التعليل ومعايير التصحيح</h3>
        <p>
          تُصحّح الأقسام الثلاثة الأولى آليًا فور تحقق الطالب، بينما يُراجع القسم الرابع يدويًا
          بمنح درجتين لكل سؤال تحليلي.
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
          تم حصر وتوثيق جميع التصحيحات اللغوية والصرفية في ملف التدقيق المستقل:{' '}
          <code>docs/spelling-lesson-02-audit.md</code>.
        </p>
      </TeacherSpace>,
    ),
  ]

  return (
    <LessonFlow
      steps={steps}
      onProgressChange={onProgressChange}
      onFinish={onFinish}
      lessonTitle="همزة الوصل وهمزة القطع"
      lessonNumber="٢"
      lessonEyebrow="القسم الثالث: الإملاء"
    />
  )
}
