import { useState } from 'react'
import { LessonFlow, type LessonStepDefinition } from '../shared/components/LessonFlow'
import { TeacherSpace } from '../shared/teacher/TeacherSpace'
import {
  SolutionsArea,
  TestPageView,
  useTestEngine,
  type TestDefinition,
  type TestEngine,
} from '../shared/test'
import {
  objectives,
  sections,
  tanweenMarks,
  sameWordRows,
  tanweenTypeRows,
  sentenceRows,
  sentenceAnalyses,
  alifCases,
  alifCaseTableRows,
  nunCompareRows,
  commonErrors,
  markLabItems,
  nunChallengeItems,
  alifDecisionItems,
  practice,
  quizQuestions,
  examQuestions,
  testDefinition as independentTest,
  quizDefinition,
  type ActivityQuestion,
} from './spelling-lesson-11/content'
import sourceUrl from '../../docs/source/spelling-lesson-11.md?url'
import auditUrl from '../../docs/spelling-lesson-11-source-audit.md?url'
import './spelling-lesson-11/lesson.css'

// eslint-disable-next-line react-refresh/only-export-components -- platform test conformance imports the definition
export const testDefinition: TestDefinition = independentTest

/** اقتباس مقطع السؤال في المختبر: إبراز الحرف الأخير وعلامة التنوين وحدها. */
interface Specimen {
  prefix: string
  tail: string
}

/** الكلمة نفسها بثلاث علامات: يُبرز الحرف الأخير مع علامته. */
const specimens: Specimen[] = [
  { prefix: 'كتا', tail: 'بٌ' },
  { prefix: 'كتا', tail: 'بًا' },
  { prefix: 'كتا', tail: 'بٍ' },
]

const markChoices = [
  { key: 'damm' as const, glyph: 'ـٌ', label: 'ضمتان', name: 'تنوين الضم' },
  { key: 'fath' as const, glyph: 'ـً', label: 'فتحتان', name: 'تنوين الفتح' },
  { key: 'kasr' as const, glyph: 'ـٍ', label: 'كسرتان', name: 'تنوين الكسر' },
]

function markChoicesFor(key: 'damm' | 'fath' | 'kasr') {
  return markChoices.find((choice) => choice.key === key)!
}

function activityDefinition(id: string, title: string, items: ActivityQuestion[]): TestDefinition {
  return {
    id,
    title,
    pages: [
      {
        id: `${id}-page`,
        title,
        questions: items.map((question, index) => ({
          id: question.id,
          number: index + 1,
          prompt: question.prompt,
          fields: [{ kind: 'choice', options: question.options, answer: question.answer }],
          solution: question.answer,
          explanation: question.explanation,
          rule: question.rule,
          example: question.example,
          answerSource: 'platform',
        })),
      },
    ],
  }
}

const practiceTest = activityDefinition('spell11-practice', 'تدريب تفاعلي: تحدّي التنوين — ثمانية أسئلة', practice)

/** لوحة العلامات: صف واحد يعرض العلامات الثلاث بوصفها أداة المختبر. */
function MarkPalette() {
  return (
    <div className="tl-palette" data-testid="spell11-mark-palette">
      {tanweenMarks.map((mark) => (
        <div className={`tl-palette__tile tl-palette__tile--${mark.key}`} key={mark.key}>
          <span className="tl-palette__glyph" aria-hidden="true">
            {mark.glyph}
          </span>
          <p className="tl-palette__name">{mark.name}</p>
          <p className="tl-palette__sign">{mark.sign}</p>
          <p className="tl-palette__examples">
            <bdi>{mark.examples.join('، ')}</bdi>
          </p>
        </div>
      ))}
    </div>
  )
}

/** عيّنات الكلمة نفسها: كتابٌ / كتابًا / كتابٍ مع إبراز آخر حرف. */
function SameWordSpecimens() {
  return (
    <div className="tl-specimens" data-testid="spell11-specimens">
      {sameWordRows.map((row, index) => {
        const specimen = specimens[index]
        return (
          <figure className="tl-specimen" key={row.word}>
            <figcaption className="tl-specimen__type">{row.type}</figcaption>
            <p className="tl-specimen__word">
              <span className="tl-specimen__stem">{specimen.prefix}</span>
              <span className="tl-specimen__tail">{specimen.tail}</span>
            </p>
            <p className="tl-specimen__glyph">
              العلامة: <bdi>{row.glyph}</bdi>
            </p>
            <p className="tl-specimen__note">{row.note}</p>
          </figure>
        )
      })}
    </div>
  )
}

function TanweenTypesTable() {
  return (
    <div className="tl-table-wrap">
      <table className="tl-table">
        <caption>أنواع التنوين الثلاثة وعلاماتها وموضعها</caption>
        <thead>
          <tr>
            <th scope="col">النوع</th>
            <th scope="col">العلامة</th>
            <th scope="col">صفة العلامة</th>
            <th scope="col">موضعها في الجملة</th>
            <th scope="col">أمثلة</th>
          </tr>
        </thead>
        <tbody>
          {tanweenTypeRows.map((row) => (
            <tr key={row.name}>
              <td data-label="النوع">
                <strong>{row.name}</strong>
              </td>
              <td data-label="العلامة">
                <bdi>{row.glyph}</bdi>
              </td>
              <td data-label="صفة العلامة">{row.sign}</td>
              <td data-label="موضعها في الجملة">{row.position}</td>
              <td data-label="أمثلة">
                <bdi>{row.examples}</bdi>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SentenceTable() {
  return (
    <div className="tl-table-wrap">
      <table className="tl-table tl-table--sentences">
        <caption>الجملة والكلمة المنوّنة ونوع التنوين</caption>
        <thead>
          <tr>
            <th scope="col">الجملة</th>
            <th scope="col">الكلمة المنوّنة</th>
            <th scope="col">نوع التنوين</th>
            <th scope="col">العلامة</th>
          </tr>
        </thead>
        <tbody>
          {sentenceRows.map((row) => (
            <tr key={row.sentence}>
              <td data-label="الجملة">
                <bdi>{row.sentence}</bdi>
              </td>
              <td data-label="الكلمة المنوّنة">
                <strong>{row.word}</strong>
              </td>
              <td data-label="نوع التنوين">{row.type}</td>
              <td data-label="العلامة">{row.sign}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AlifCasesTable() {
  return (
    <div className="tl-table-wrap">
      <table className="tl-table">
        <caption>جدول حالات ألف تنوين الفتح: متى نضيف ومتى نترك</caption>
        <thead>
          <tr>
            <th scope="col">آخر الكلمة</th>
            <th scope="col">القرار</th>
            <th scope="col">المثال</th>
            <th scope="col">السبب</th>
          </tr>
        </thead>
        <tbody>
          {alifCaseTableRows.map((row) => (
            <tr key={row.condition}>
              <td data-label="آخر الكلمة">
                <strong>{row.condition}</strong>
              </td>
              <td data-label="القرار">{row.decision}</td>
              <td data-label="المثال">
                <bdi>{row.example}</bdi>
              </td>
              <td data-label="السبب">{row.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function NunCompareTable() {
  return (
    <div className="tl-table-wrap">
      <table className="tl-table tl-table--nun">
        <caption>التمييز بين التنوين والنون الأصلية</caption>
        <thead>
          <tr>
            <th scope="col">الكلمة</th>
            <th scope="col">هل فيها تنوين؟</th>
            <th scope="col">السبب</th>
          </tr>
        </thead>
        <tbody>
          {nunCompareRows.map((row) => (
            <tr key={row.word}>
              <td data-label="الكلمة">
                <strong>{row.word}</strong>
              </td>
              <td data-label="هل فيها تنوين؟">
                <span className={row.hasTanween ? 'tl-tag tl-tag--yes' : 'tl-tag tl-tag--no'}>
                  {row.hasTanween ? 'نعم' : 'لا'}
                </span>
              </td>
              <td data-label="السبب">{row.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** بطاقات الحالات الخمس: الحرف الأخير ثم القرار ثم المثال. */
function AlifCaseCards({ cases }: { cases: typeof alifCases }) {
  return (
    <div className="tl-cases">
      {cases.map((item) => (
        <article className={`tl-case tl-case--${item.decision}`} key={item.id}>
          <h4>{item.title}</h4>
          <p className="tl-case__rule">{item.rule}</p>
          <p className="tl-case__reason">{item.reason}</p>
          <ul className="tl-case__examples">
            {item.examples.map((example) => (
              <li key={example.result}>
                <span className="tl-case__base">{example.base}</span>
                <span aria-hidden="true"> ← </span>
                <strong className="tl-case__result">{example.result}</strong>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  )
}

/** مختبر اختيار العلامة: يختار الطالب العلامة فيرى الكلمة بعد تطبيقها مع سبب الإجابة. */
function MarkLab() {
  const [choices, setChoices] = useState<Record<string, 'damm' | 'fath' | 'kasr'>>({})

  function choose(id: string, key: 'damm' | 'fath' | 'kasr') {
    setChoices((current) => ({ ...current, [id]: key }))
  }

  return (
    <div className="tl-lab" data-testid="spell11-mark-lab">
      {markLabItems.map((item) => {
        const chosen = choices[item.id]
        const chosenMark = chosen ? markChoicesFor(chosen) : undefined
        const correct = chosen === item.answer
        return (
          <article className="tl-lab__row" key={item.id} data-testid={`spell11-marklab-${item.id}`}>
            <p className="tl-lab__context">
              <bdi>{item.context}</bdi>
            </p>
            <p className="tl-lab__word" data-testid={`spell11-marklab-word-${item.id}`}>
              {chosen ? (
                <span className="tl-lab__applied">{item.applied}</span>
              ) : (
                <span className="tl-lab__base">({item.base})</span>
              )}
            </p>
            <p className="tl-lab__position">الموقع في الجملة: {item.position}</p>
            <div className="tl-lab__marks" role="group" aria-label={`اختر علامة التنوين على ${item.base}`}>
              {markChoices.map((mark) => (
                <button
                  type="button"
                  key={mark.key}
                  className={`tl-mark-button tl-mark-button--${mark.key}`}
                  aria-pressed={chosen === mark.key}
                  onClick={() => choose(item.id, mark.key)}
                >
                  <bdi aria-hidden="true">{mark.glyph}</bdi>
                  <span>{mark.label}</span>
                </button>
              ))}
            </div>
            {chosen && chosenMark && (
              <p
                className={`tl-feedback ${correct ? 'tl-feedback--ok' : 'tl-feedback--bad'}`}
                role="status"
                data-testid={`spell11-marklab-feedback-${item.id}`}
              >
                {correct ? (
                  <>
                    <strong>إجابة صحيحة:</strong> {item.reason}
                  </>
                ) : (
                  <>
                    <strong>راجع اختيارك:</strong> اخترت {chosenMark.name}، والصحيح هنا{' '}
                    {markChoicesFor(item.answer).name}. {item.reason}
                  </>
                )}
              </p>
            )}
          </article>
        )
      })}
    </div>
  )
}

/** تحدي النون الأصلية والتنوين: قرار ثنائي مع سبب. */
function NunChallenge() {
  const [choices, setChoices] = useState<Record<string, 'tanween' | 'nun'>>({})

  return (
    <div className="tl-challenge" data-testid="spell11-nun-challenge">
      {nunChallengeItems.map((item) => {
        const chosen = choices[item.id]
        const correct = chosen === item.answer
        return (
          <article className="tl-challenge__card" key={item.id} data-testid={`spell11-nun-${item.id}`}>
            <p className="tl-challenge__word" data-testid={`spell11-nun-word-${item.id}`}>
              {item.word}
            </p>
            <div className="tl-challenge__actions" role="group" aria-label={`ما في كلمة ${item.word}؟`}>
              <button
                type="button"
                className="tl-choice-button"
                aria-pressed={chosen === 'tanween'}
                onClick={() => setChoices((current) => ({ ...current, [item.id]: 'tanween' }))}
              >
                فيها تنوين
              </button>
              <button
                type="button"
                className="tl-choice-button"
                aria-pressed={chosen === 'nun'}
                onClick={() => setChoices((current) => ({ ...current, [item.id]: 'nun' }))}
              >
                فيها نون أصلية فقط
              </button>
            </div>
            {chosen && (
              <p
                className={`tl-feedback ${correct ? 'tl-feedback--ok' : 'tl-feedback--bad'}`}
                role="status"
                data-testid={`spell11-nun-feedback-${item.id}`}
              >
                {correct ? (
                  <>
                    <strong>إجابة صحيحة:</strong> {item.reason}
                  </>
                ) : (
                  <>
                    <strong>راجع اختيارك:</strong> {item.reason}
                  </>
                )}
              </p>
            )}
          </article>
        )
      })}
    </div>
  )
}

/** قرار الألف: هل نضيف ألفًا عند تنوين الكلمة بالفتح؟ */
function AlifDecision() {
  const [choices, setChoices] = useState<Record<string, 'add' | 'keep'>>({})

  return (
    <div className="tl-decision" data-testid="spell11-alif-decision">
      {alifDecisionItems.map((item) => {
        const chosen = choices[item.id]
        const correct = chosen === item.answer
        return (
          <article className="tl-decision__row" key={item.id} data-testid={`spell11-alif-${item.id}`}>
            <p className="tl-decision__word">{item.base}</p>
            <div className="tl-decision__actions" role="group" aria-label={`ألف تنوين الفتح في كلمة ${item.base}`}>
              <button
                type="button"
                className="tl-choice-button"
                aria-pressed={chosen === 'add'}
                onClick={() => setChoices((current) => ({ ...current, [item.id]: 'add' }))}
              >
                نضيف ألفًا
              </button>
              <button
                type="button"
                className="tl-choice-button"
                aria-pressed={chosen === 'keep'}
                onClick={() => setChoices((current) => ({ ...current, [item.id]: 'keep' }))}
              >
                لا نضيف ألفًا
              </button>
            </div>
            {chosen && (
              <div
                className={`tl-feedback ${correct ? 'tl-feedback--ok' : 'tl-feedback--bad'}`}
                role="status"
                data-testid={`spell11-alif-feedback-${item.id}`}
              >
                <p className="tl-decision__result">
                  الكلمة بعد تنوين الفتح: <strong>{item.final}</strong>
                </p>
                <p>
                  {correct ? <strong>إجابة صحيحة:</strong> : <strong>راجع اختيارك:</strong>} {item.reason}
                </p>
              </div>
            )}
          </article>
        )
      })}
    </div>
  )
}

function CommonErrorsCards() {
  return (
    <div className="tl-errors">
      {commonErrors.map((item) => (
        <article className="tl-error" key={item.id}>
          <div className="tl-error__pair">
            <p>
              <span className="tl-tag tl-tag--bad">✗ الخطأ:</span> <bdi>{item.wrong}</bdi>
            </p>
            <p>
              <span className="tl-tag tl-tag--good">✓ الصواب:</span> <bdi>{item.correct}</bdi>
            </p>
          </div>
          <p className="tl-error__reason">
            <strong>سبب الصواب:</strong> {item.reason}
          </p>
        </article>
      ))}
    </div>
  )
}

export function LessonSpellingEleven({ onFinish }: { onFinish?: () => void }) {
  const practiceEngine = useTestEngine(practiceTest)
  const quizEngine = useTestEngine(quizDefinition)
  const baseEngine = useTestEngine(testDefinition)
  const [submitted, setSubmitted] = useState(false)

  const showTestFeedback = submitted && baseEngine.allPagesChecked

  const engine: TestEngine = {
    ...baseEngine,
    setAnswer(id, index, value) {
      setSubmitted(false)
      baseEngine.setAnswer(id, index, value)
    },
    uncheckPage(id) {
      setSubmitted(false)
      baseEngine.uncheckPage(id)
    },
    resetTest() {
      setSubmitted(false)
      baseEngine.resetTest()
    },
  }

  const steps: LessonStepDefinition[] = [
    // ١. أهداف الدرس ولوحة المختبر
    {
      id: 'tanween-lab-objectives',
      title: '١. أهداف الدرس ولوحة المختبر',
      shortTitle: 'أهداف الدرس',
      group: 'المدخل والمختبر',
      render: () => (
        <div className="tl-stack">
          <div className="tl-hero">
            <p className="card__eyebrow">قسم الإملاء • الدرس الحادي عشر</p>
            <h3>التنوين وأنواعه وكيفية كتابته</h3>
            <p className="tl-hero__lead">رحلتنا في الإملاء العربي</p>
            <p>{sections[0].paragraphs[0]}</p>
          </div>
          <div className="tl-card">
            <h4>🎯 في نهاية الدرس ستتمكّن من:</h4>
            <ul className="tl-list">
              {objectives.map((objective) => (
                <li key={objective}>{objective}</li>
              ))}
            </ul>
          </div>
          <div className="tl-note">
            <h4>كيف نعمل في هذا المختبر؟</h4>
            <p>{sections[0].paragraphs[2]}</p>
          </div>
          <MarkPalette />
          <p className="tl-hint">
            هذه العلامات الثلاث هي أدوات المختبر: سنضع كل كلمة أمامها ونفحص آخرها ثم نختار العلامة الصحيحة.
          </p>
        </div>
      ),
    },

    // ٢. ما التنوين؟
    {
      id: 'tanween-lab-definition',
      title: '٢. ما التنوين؟',
      shortTitle: 'ما التنوين؟',
      group: 'المدخل والمختبر',
      render: () => (
        <div className="tl-stack">
          <p>{sections[1].paragraphs[0]}</p>
          <SameWordSpecimens />
          <p>{sections[1].paragraphs[1]}</p>
          <div className="tl-callout tl-callout--rule">
            <h4>معلومة مهمة: التنوين يعمل في الأسماء</h4>
            <p>{sections[1].paragraphs[2]}</p>
          </div>
          <div className="tl-callout tl-callout--precision">
            <h4>تدقيق نطقي دقيق</h4>
            <p>{sections[1].paragraphs[3]}</p>
          </div>
        </div>
      ),
    },

    // ٣. لوحة مقارنة العلامات
    {
      id: 'tanween-lab-marks',
      title: '٣. لوحة مقارنة العلامات: ـٌ · ـً · ـٍ',
      shortTitle: 'لوحة المقارنة',
      group: 'المدخل والمختبر',
      render: () => (
        <div className="tl-stack">
          <p>
            انظر إلى العلامات الثلاث جنبًا إلى جنب، ولاحظ موضع كل علامة بالنسبة إلى الحرف الأخير: ضمتان فوقه، وفتحتان
            مع ألف في أكثر الكلمات، وكسرتان تحته.
          </p>
          <MarkPalette />
          <TanweenTypesTable />
          <div className="tl-callout tl-callout--precision">
            <h4>لا نكتب حرف النون</h4>
            <p>
              انتبه: لا نكتب حرف النون بعد الكلمة، فلا نكتب «كتابن»، بل نكتب «كتابٌ» أو «كتابًا» أو «كتابٍ» حسب المطلوب.
            </p>
          </div>
        </div>
      ),
    },

    // ٤. أنواع التنوين الثلاثة
    {
      id: 'tanween-lab-types',
      title: '٤. أنواع التنوين الثلاثة',
      shortTitle: 'أنواع التنوين',
      group: 'أنواع التنوين',
      render: () => (
        <div className="tl-stack">
          <p>{sections[2].paragraphs[0]}</p>
          <div className="tl-marks">
            {tanweenMarks.map((mark) => (
              <article className={`tl-mark-card tl-mark-card--${mark.key}`} key={mark.key}>
                <span className="tl-mark-card__glyph" aria-hidden="true">
                  {mark.glyph}
                </span>
                <h4>{mark.name}</h4>
                <p>{mark.sign}</p>
                <p className="tl-mark-card__examples">
                  مثال: <bdi>{mark.examples.join('، ')}</bdi>
                </p>
              </article>
            ))}
          </div>
          <div className="tl-callout tl-callout--memory">
            <h4>طريقة سهلة للحفظ</h4>
            <p>{sections[2].paragraphs[1]}</p>
          </div>
          <div className="tl-callout tl-callout--precision">
            <h4>انتبه</h4>
            <p>{sections[2].paragraphs[2]}</p>
          </div>
        </div>
      ),
    },

    // ٥. جدول أنواع التنوين وتقييد التقسيم
    {
      id: 'tanween-lab-types-table',
      title: '٥. جدول أنواع التنوين وتقييد التقسيم',
      shortTitle: 'جدول الأنواع',
      group: 'أنواع التنوين',
      render: () => (
        <div className="tl-stack">
          <TanweenTypesTable />
          <div className="tl-callout tl-callout--precision">
            <h4>قيد تعليمي: التقسيم الثلاثي ليس حصرًا</h4>
            <p>{sections[2].paragraphs[3]}</p>
          </div>
        </div>
      ),
    },

    // ٦. كيف أختار نوع التنوين؟
    {
      id: 'tanween-lab-decision',
      title: '٦. كيف أختار نوع التنوين؟',
      shortTitle: 'كيف أختار؟',
      group: 'كيف أختار نوع التنوين؟',
      render: () => (
        <div className="tl-stack">
          <p>{sections[3].paragraphs[0]}</p>
          <ol className="tl-protocol" data-testid="spell11-protocol">
            <li>
              <strong>الخطوة الأولى:</strong> عيّن نوع الكلمة: أهي اسم؟ الفعل والحرف لا يدخلهما التنوين في القاعدة
              العامة.
            </li>
            <li>
              <strong>الخطوة الثانية:</strong> عيّن موقع الاسم الإعرابي: مرفوع أم منصوب أم مجرور؟
            </li>
            <li>
              <strong>الخطوة الثالثة:</strong> اكتب العلامة المطابقة: مرفوع ⟵ ضمتان (ـٌ) · منصوب ⟵ فتحتان (ـً) ·
              مجرور ⟵ كسرتان (ـٍ).
            </li>
          </ol>
          <p>{sections[3].paragraphs[1]}</p>
          <SentenceTable />
          <div className="tl-callout tl-callout--precision">
            <h4>القاعدة التي تحكم الاختيار</h4>
            <p>{sections[3].paragraphs[3]}</p>
          </div>
        </div>
      ),
    },

    // ٧. تحليل الأمثلة الثلاثة
    {
      id: 'tanween-lab-analyses',
      title: '٧. تحليل الأمثلة الثلاثة',
      shortTitle: 'تحليل الأمثلة',
      group: 'كيف أختار نوع التنوين؟',
      render: () => (
        <div className="tl-stack">
          <p>{sections[3].paragraphs[2]}</p>
          <div className="tl-analyses">
            {sentenceAnalyses.map((analysis) => (
              <article className="tl-analysis" key={analysis.id}>
                <h4>
                  <bdi>{analysis.sentence}</bdi>
                </h4>
                <ol className="tl-analysis__steps">
                  {analysis.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                <p className="tl-analysis__result">
                  <strong>النتيجة:</strong> <bdi>{analysis.result}</bdi>
                </p>
              </article>
            ))}
          </div>
        </div>
      ),
    },

    // ٨. مختبر اختيار العلامة
    {
      id: 'tanween-lab-chooser',
      title: '٨. مختبر اختيار العلامة',
      shortTitle: 'مختبر العلامة',
      group: 'كيف أختار نوع التنوين؟',
      render: () => (
        <div className="tl-stack">
          <p>
            اقرأ الجملة، ثم اختر العلامة التي تراها صحيحة للكلمة. بعد اختيارك ستظهر الكلمة بالعلامة التي طبّقتها،
            ويظهر سبب الإجابة لا النتيجة وحدها. أعد التجربة على كل بطاقة حتى تتضح القاعدة.
          </p>
          <MarkLab />
        </div>
      ),
    },

    // ٩. القاعدة العامة: ألف تنوين الفتح
    {
      id: 'tanween-lab-alif-general',
      title: '٩. القاعدة العامة: ألف تنوين الفتح',
      shortTitle: 'ألف التنوين',
      group: 'ألف تنوين الفتح',
      render: () => (
        <div className="tl-stack">
          <p>{sections[4].paragraphs[0]}</p>
          <div className="tl-callout tl-callout--rule">
            <h4>القاعدة العامة</h4>
            <p>
              تُضاف ألف تنوين الفتح غالبًا بعد الحرف الصحيح، وتُترك إذا انتهت الكلمة بما لا يقبل الألف بعدها. ولهذا
              نفصل في الحالات الأربع الآتية.
            </p>
          </div>
          <p>{sections[4].paragraphs[1]}</p>
        </div>
      ),
    },

    // ١٠. الحالة الأولى والثانية
    {
      id: 'tanween-lab-alif-cases-1-2',
      title: '١٠. الحالة الأولى والثانية: التاء المربوطة والألف',
      shortTitle: 'التاء المربوطة والألف',
      group: 'ألف تنوين الفتح',
      render: () => (
        <div className="tl-stack">
          <p>{sections[5].paragraphs[0]}</p>
          <p>{sections[5].paragraphs[1]}</p>
          <div className="tl-callout tl-callout--precision">
            <h4>ضبط الألف في «عصًا» و«فتًى» و«هدًى»</h4>
            <p>{sections[5].paragraphs[2]}</p>
          </div>
          <AlifCaseCards cases={[alifCases[0], alifCases[1]]} />
        </div>
      ),
    },

    // ١١. الحالة الثالثة والرابعة
    {
      id: 'tanween-lab-alif-cases-3-4',
      title: '١١. الحالة الثالثة والرابعة: الهمزة المتطرفة',
      shortTitle: 'الهمزة المتطرفة',
      group: 'ألف تنوين الفتح',
      render: () => (
        <div className="tl-stack">
          <p>{sections[6].paragraphs[0]}</p>
          <p>{sections[6].paragraphs[1]}</p>
          <div className="tl-callout tl-callout--precision">
            <h4>انتبه قبل أن تضيف ألفًا</h4>
            <p>{sections[6].paragraphs[2]}</p>
          </div>
          <AlifCaseCards cases={[alifCases[2], alifCases[3]]} />
        </div>
      ),
    },

    // ١٢. الحالة الخامسة وتقييد القاعدة
    {
      id: 'tanween-lab-alif-case-5',
      title: '١٢. الحالة الخامسة وتقييد القاعدة',
      shortTitle: 'الحرف الصحيح والتقييد',
      group: 'ألف تنوين الفتح',
      render: () => (
        <div className="tl-stack">
          <p>{sections[7].paragraphs[0]}</p>
          <AlifCaseCards cases={[alifCases[4]]} />
          <div className="tl-callout tl-callout--precision">
            <h4>تقييد تعليمي: الحالات الخمس ليست حصرًا</h4>
            <p>{sections[7].paragraphs[1]}</p>
          </div>
          <div className="tl-note">
            <p>{sections[7].paragraphs[2]}</p>
          </div>
        </div>
      ),
    },

    // ١٣. جدول حالات ألف تنوين الفتح
    {
      id: 'tanween-lab-alif-table',
      title: '١٣. جدول حالات ألف تنوين الفتح',
      shortTitle: 'جدول حالات الألف',
      group: 'ألف تنوين الفتح',
      render: () => (
        <div className="tl-stack">
          <p>
            هذا الجدول يجمع الحالات الخمس في صفحة واحدة: انظر إلى «آخر الكلمة»، ثم إلى «القرار»، ثم إلى «السبب»؛
            فبهذا الترتيب تتحقق من كتابتك دون حفظ أعمى.
          </p>
          <AlifCasesTable />
        </div>
      ),
    },

    // ١٤. نشاط قرار الألف
    {
      id: 'tanween-lab-alif-decision',
      title: '١٤. نشاط قرار الألف',
      shortTitle: 'قرار الألف',
      group: 'ألف تنوين الفتح',
      render: () => (
        <div className="tl-stack">
          <p>
            أمامك كلمات؛ فقرّر لكل كلمة: هل نضيف ألف تنوين الفتح أم لا نضيفها؟ بعد اختيارك تظهر الكلمة النهائية وسبب
            القرار، فتتعلم أن تنظر إلى آخر الكلمة قبل أن تضيف الألف بصورة آلية.
          </p>
          <AlifDecision />
        </div>
      ),
    },

    // ١٥. الفرق بين التنوين والنون الأصلية
    {
      id: 'tanween-lab-nun-vs-tanween',
      title: '١٥. الفرق بين التنوين والنون الأصلية',
      shortTitle: 'التنوين والنون الأصلية',
      group: 'التنوين والنون الأصلية',
      render: () => (
        <div className="tl-stack">
          <p>{sections[8].paragraphs[0]}</p>
          <NunCompareTable />
          <div className="tl-callout tl-callout--rule">
            <h4>قارن بنفسك: بستان و«بستانٌ»</h4>
            <p>{sections[8].paragraphs[1]}</p>
          </div>
          <div className="tl-callout tl-callout--precision">
            <h4>تذكّر</h4>
            <p>{sections[8].paragraphs[2]}</p>
          </div>
        </div>
      ),
    },

    // ١٦. تحدي النون الأصلية والتنوين
    {
      id: 'tanween-lab-nun-challenge',
      title: '١٦. تحدي النون الأصلية والتنوين',
      shortTitle: 'تحدي النون',
      group: 'التنوين والنون الأصلية',
      render: () => (
        <div className="tl-stack">
          <p>
            اقرأ كل كلمة واسأل نفسك: هل النون التي أسمعها في آخرها نون أصلية من بنية الكلمة، أم أن ما في آخرها علامة
            تنوين؟ اختر ثم اقرأ السبب.
          </p>
          <NunChallenge />
        </div>
      ),
    },

    // ١٧. أخطاء شائعة يجب تجنّبها
    {
      id: 'tanween-lab-common-errors',
      title: '١٧. أخطاء شائعة يجب تجنّبها',
      shortTitle: 'الأخطاء الشائعة',
      group: 'الأخطاء الشائعة',
      render: () => (
        <div className="tl-stack">
          <p>{sections[9].paragraphs[0]}</p>
          <CommonErrorsCards />
        </div>
      ),
    },

    // ١٨. تدريب تفاعلي: تحدّي التنوين (٨ أسئلة)
    {
      id: 'tanween-lab-practice',
      title: '١٨. تدريب تفاعلي: تحدّي التنوين — ثمانية أسئلة',
      shortTitle: 'تدريب تفاعلي',
      group: 'التدريب والتثبيت',
      render: () => (
        <div className="tl-stack">
          <p>
            اختر الإجابة الصحيحة لكل سؤال، ثم اضغط على «تحقّق من الإجابات» في نهاية الصفحة لتعرف نتيجتك، والإجابة
            الصحيحة، وسببها، والقاعدة المرتبطة بها. ولا تظهر النتيجة قبل أن تنفّذ التحقق.
          </p>
          <TestPageView
            page={practiceTest.pages[0]}
            engine={practiceEngine}
            questionTestIdPrefix="spell11-practice"
          />
          {practiceEngine.isPageChecked(practiceTest.pages[0].id) && (
            <section className="tl-stack tl-practice-rules" data-testid="spell11-practice-rules">
              <h4>القواعد المرتبطة بأسئلة التدريب</h4>
              <ul className="tl-list">
                {practice.map((item, index) => (
                  <li key={item.id}>
                    <strong>السؤال {index + 1}:</strong> {item.rule} — <em>مثال: {item.example}</em>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      ),
    },

    // ١٩. الاختبار الختامي (١٠ أسئلة)
    {
      id: 'tanween-lab-quiz',
      title: '١٩. الاختبار الختامي: عشرة أسئلة',
      shortTitle: 'الاختبار الختامي',
      group: 'التدريب والتثبيت',
      render: () => (
        <div className="tl-stack">
          <p>
            الاختبار الختامي عشرة أسئلة في ثلاثة أقسام: أكمل بالتنوين المناسب (أسئلة كتابية مع اختيار العلامة)، وصحّح
            الخطأ، وعلّل. أجب عن الأسئلة ثم اضغط «تحقّق من الإجابات»؛ وعندها تظهر النتيجة والحلول النموذجية. وأسئلة
            التعليل يُراجعها المعلم، ويُعرض لك جوابها النموذجي بعد التحقق.
          </p>
          <TestPageView
            page={quizDefinition.pages[0]}
            engine={quizEngine}
            questionTestIdPrefix="spell11-quiz"
          />
        </div>
      ),
    },

    // ٢٠. خلاصة الدرس للحفظ
    {
      id: 'tanween-lab-summary',
      title: '٢٠. خلاصة الدرس للحفظ',
      shortTitle: 'خلاصة الدرس',
      group: 'التدريب والتثبيت',
      render: () => (
        <div className="tl-stack">
          <div className="tl-callout tl-callout--rule">
            <h4>🏆 خلاصة الدرس</h4>
            <p>{sections[10].paragraphs[0]}</p>
          </div>
          <ul className="tl-list">
            <li>{sections[10].paragraphs[1]}</li>
            <li>{sections[10].paragraphs[2]}</li>
          </ul>
          <div className="tl-note">
            <h4>الدرس التالي المقترح</h4>
            <p>{sections[10].paragraphs[3]}</p>
          </div>
        </div>
      ),
    },

    // ٢١–٢٤: صفحات الاختبار المستقل الأربع (خمسة أسئلة في كل صفحة)
    ...testDefinition.pages.map((page, index) => ({
      id: `tanween-lab-test-${index + 1}`,
      title: `اختبار مستقل — الصفحة ${['الأولى', 'الثانية', 'الثالثة', 'الرابعة'][index]}`,
      shortTitle: `اختبار الصفحة ${index + 1}`,
      group: 'الاختبار المستقل',
      render: () => (
        <div className="tl-stack">
          <p>
            اختبار مستقل مكوّن من ٢٠ سؤالًا موزعة على أربع صفحات (خمسة أسئلة في كل صفحة). تحقّق من كل صفحة بعد
            الإجابة عنها ليُحفظ تقييمها؛ ولا تُكشف صحة الإجابات ولا الحلول ولا النتيجة النهائية إلا بعد تسليم الاختبار
            كاملًا.
          </p>
          <TestPageView
            page={page}
            engine={engine}
            revealFeedback={showTestFeedback}
            questionTestIdPrefix="spell11-question"
          />
        </div>
      ),
    })),

    // ٢٥. تسليم الاختبار والنتيجة
    {
      id: 'tanween-lab-submit',
      title: '٢٥. تسليم الاختبار والنتيجة',
      shortTitle: 'تسليم الاختبار',
      group: 'الاختبار المستقل',
      render: () => (
        <div className="tl-stack">
          <div className="tl-card">
            <h3>تسليم الاختبار المستقل</h3>
            <p>
              الصفحات التي تم التحقق منها: <strong>{baseEngine.checkedPageIds.length}</strong> من <strong>٤</strong>.
            </p>
            <p>
              تعتمد النتيجة على أحدث إجاباتك الصالحة من حيث التحقق، ولا تتضاعف الدرجات. يجب التحقق من الصفحات الأربع
              قبل إتاحة زر التسليم النهائي.
            </p>
            <div className="tl-actions">
              <button
                className="button button--primary"
                type="button"
                disabled={!baseEngine.allPagesChecked}
                onClick={() => setSubmitted(true)}
              >
                تسليم الاختبار
              </button>
              <button className="button button--ghost" type="button" onClick={() => engine.resetTest()}>
                إعادة ضبط الاختبار
              </button>
            </div>
            {!baseEngine.allPagesChecked && (
              <p className="test-page__hint">
                تحقّق من الصفحات الأربع أولًا بالضغط على زر «تحقّق من الإجابات» في نهاية كل صفحة.
              </p>
            )}
            {showTestFeedback && (
              <div role="status" className="tl-callout tl-callout--rule" data-testid="spell11-result">
                <h4>🎉 نتيجة الاختبار المستقل</h4>
                <p>
                  لقد حصلت على: <strong>{engine.finalResult.correct}</strong> من{' '}
                  <strong>{engine.finalResult.total}</strong> سؤالًا صحيحًا.
                </p>
                <p>انتقل الآن إلى الخطوة التالية لاستعراض حلول الاختبارات والشروح التفصيلية لكل سؤال.</p>
              </div>
            )}
          </div>
        </div>
      ),
    },

    // ٢٦. حلول الاختبارات
    {
      id: 'tanween-lab-solutions',
      title: '٢٦. حلول الاختبارات',
      shortTitle: 'حلول الاختبارات',
      group: 'الحلول والإرشاد',
      render: () => (
        <div className="tl-stack">
          <SolutionsArea
            test={testDefinition}
            engine={engine}
            revealFeedback={showTestFeedback}
            testId="spell11-solutions"
          />
        </div>
      ),
    },

    // ٢٧. منطقة المعلم
    {
      id: 'tanween-lab-teacher',
      title: '٢٧. منطقة المعلم',
      shortTitle: 'منطقة المعلم',
      group: 'الحلول والإرشاد',
      render: () => (
        <TeacherSpace>
          <div className="tl-stack" data-testid="spell11-teacher">
            <h3>دليل المعلم — التنوين وأنواعه وكيفية كتابته</h3>
            <p>
              <strong>مخرجات التعلم المستهدفة:</strong> أن يميّز الطالب التنوين من الحركات العادية ومن النون الأصلية،
              وأن يكتب أنواع التنوين الثلاثة كتابة صحيحة، وأن يختار العلامة بحسب موقع الاسم في الجملة لا بحسب شكل
              الكلمة، وأن يضبط ألف تنوين الفتح في الحالات الخمس، وأن يصحّح الأخطاء الشائعة ذاتيًا وخصوصًا كتابة نون
              مستقلة بدل علامة التنوين.
            </p>

            <section>
              <h4>الشرح التربوي: كيف تُقدَّم قواعد التنوين؟</h4>
              <ol className="tl-list">
                <li>
                  <strong>التعريف أولًا بوصفه سلوكًا صوتيًا:</strong> التنوين نون ساكنة زائدة تُلفظ في آخر الاسم ولا
                  تُكتب حرفًا؛ فابدأ بالسماع: «كتابٌ ← كتابًا ← كتابٍ» مع الوقوف على تغيّر العلامة لا تغيّر الكلمة.
                </li>
                <li>
                  <strong>قيد الوقف:</strong> بيّن أن صوت التنوين يُسمع في درج الكلام، وأنه يسكن عند الوقف: «كتابْ»،
                  وتسقط ألف التنوين نطقًا لا خطًّا؛ فالمعيار عند الكتابة هو موضع العلامة لا النطق المنفرد.
                </li>
                <li>
                  <strong>عموم قاعدة الأسماء:</strong> التنوين يعمل في الأسماء في القاعدة العامة («هذا كتابٌ»)، ولا
                  يدخل الأفعال والحروف («يكتبٌ» خطأ). وهذه قاعدة عامة، وفي العربية ألفاظ يسيرة محفوظة دخلها التنوين
                  من غير الأسماء («إذٍ»، «إذاً») تُترك للمراحل الأعلى ولا تُبنى عليها قاعدة هنا.
                </li>
                <li>
                  <strong>العلامة تتبع الموقع لا الشكل:</strong> درّب الطالب على الخطوات الثلاث (نوع الكلمة ←
                  موقعها الإعرابي ← العلامة)، واطلب منه أن يعلّل اختياره دائمًا: «لماذا ضمتان؟ لأنها خبر مرفوع».
                </li>
                <li>
                  <strong>التقسيم الثلاثي صورةً لا معنًى:</strong> الأنواع الثلاثة (ضم/فتح/كسر) تقسيم العلامة
                  وحركتها؛ وهناك تقسيم بحسب المعنى (التمكين، التنكير، العِوَض، المقابلة — ومنه تنوين جمع المؤنث
                  السالم «مسلماتٌ») يُذكر إشارةً ولا يُبنى عليه تدريب في هذه المرحلة.
                </li>
              </ol>
            </section>

            <section>
              <h4>الحالات الإملائية الخاصة بألف تنوين الفتح (شرح موجّه للمعلم)</h4>
              <ul className="tl-list">
                <li>
                  <strong>التاء المربوطة:</strong> تُرسم الفتحتان على التاء، ولا تُضاف ألف: مدرسةً، شجرةً، قصةً،
                  سيارةً. أشهر خطأ: «قصةًا».
                </li>
                <li>
                  <strong>الألف الأصلية والمقصورة:</strong> لا تُزاد ألف أخرى: عصًا (والفتحتان على الألف القائمة)،
                  فتًى وهدًى (والفتحتان على الحرف الذي قبل الألف المقصورة).
                </li>
                <li>
                  <strong>الهمزة المتطرفة قبلها ألف:</strong> الألف موجودة في رسم الكلمة، فلا تُزاد ثانية: سماءً،
                  بناءً، مساءً.
                </li>
                <li>
                  <strong>الهمزة المتطرفة على ألف:</strong> الألف التي تحمل الهمزة تكفي: مبدأً، ملجأً، خطأً.
                </li>
                <li>
                  <strong>الحرف الصحيح:</strong> تُضاف ألف التنوين غالبًا: كتابًا، دفترًا، بابًا، طريقًا.
                </li>
                <li>
                  <strong>تقييد واجب:</strong> الحالات الخمس أشهر الحالات وليست حصرًا؛ فيُذكر للطالب أن من الحالات
                  الأخرى الاسم المنقوص («رأيتُ قاضيًا») والمنتهي بألف زائدة، وأنها تُدرس لاحقًا. والقاعدة العملية:
                  افحص آخر الكلمة قبل أن تضيف.
                </li>
              </ul>
            </section>

            <section>
              <h4>معالجة الأخطاء الشائعة (وخصوصًا كتابة نون مستقلة)</h4>
              <ul className="tl-list">
                <li>
                  <strong>إذا كتب «كتابن» أو «قلمن»:</strong> لا تكتفِ بالتصحيح، بل أرِه الكلمة بحرفها الأخير وعلامته
                  («كتابٌ») واسأله: أين النون التي كتبتها؟ فالدرس أن التنوين يُسمع ولا يُكتب حرفًا.
                </li>
                <li>
                  <strong>إذا كتب «مدرسةًا» أو «قصةًا»:</strong> أعِد معه القاعدة: التاء المربوطة لا تُتبع بألف؛
                  واطلب منه أن يكتب ثلاث كلمات على هذا الوزن ليترسّخ الرسم.
                </li>
                <li>
                  <strong>إذا كتب «سماءًا»:</strong> انطق الكلمة معه وبيّن أن الألف موجودة قبل الهمزة أصلًا، فالمطلوب
                  أن نضع الفتحتين على الهمزة لا أن نضيف ألفًا.
                </li>
                <li>
                  <strong>إذا خلط بين التنوين والنون الأصلية:</strong> استخدم المقارنة الثابتة: «بستان» نونها أصلية
                  بلا تنوين، و«بستانٌ» نونها الأصلية نفسها مع تنوين الضم؛ ولا تُكتب نون ثانية.
                </li>
                <li>
                  <strong>إذا اختار علامة في غير موضعها:</strong> أعِد به إلى السؤال الإعرابي: ما موقع الاسم؟ مرفوع أم
                  منصوب أم مجرور؟ فمن عرف الموقع عرف العلامة.
                </li>
                <li>
                  <strong>تشخيص جماعي:</strong> يُستحسن إجراء نشاط سريع على اللوح: خمس كلمات، يحدد الطلاب لكل كلمة:
                  آخر الكلمة، ثم القرار (ألف/بلا ألف)، ثم العلامة.
                </li>
              </ul>
            </section>

            <section>
              <h4>حلول التدريب التفاعلي الثمانية وشرحها</h4>
              <ol className="tl-list tl-list--solutions">
                {practice.map((item) => (
                  <li key={item.id}>
                    <p>
                      <strong>السؤال:</strong> {item.prompt}
                    </p>
                    <p>
                      <strong>الإجابة المعتمدة:</strong> {item.answer}
                    </p>
                    <p>
                      <strong>التفسير التعليمي:</strong> {item.explanation}
                    </p>
                    <p>
                      <strong>القاعدة:</strong> {item.rule} — <strong>مثال إضافي:</strong> {item.example}
                    </p>
                  </li>
                ))}
              </ol>
            </section>

            <section>
              <h4>حلول الاختبار الختامي العشرة كاملة</h4>
              <ol className="tl-list tl-list--solutions">
                {quizQuestions.map((question) => (
                  <li key={question.id}>
                    <p>
                      <strong>السؤال {question.number}:</strong> {question.prompt}
                    </p>
                    <p>
                      <strong>الحل النموذجي:</strong> {question.solution}
                    </p>
                    <p>
                      <strong>سبب الإجابة:</strong> {question.teacherAnswer ?? question.explanation}
                    </p>
                    <p>
                      <strong>التفسير التعليمي:</strong> {question.explanation}
                    </p>
                  </li>
                ))}
              </ol>
              <p className="tl-hint">
                أسئلة التعليل (٨–١٠) تُراجع يدويًا في المحرك المشترك، ويُعرض جوابها النموذجي للطالب بعد التحقق من
                الصفحة (revealEssaySolution)، ويُقبل من الطالب كل تعليل صحيح المعنى ولو اختلفت عبارته.
              </p>
            </section>

            <section>
              <h4>مفاتيح الاختبار المستقل العشرين وسبب كل إجابة</h4>
              <ol className="tl-list tl-list--solutions" data-testid="spell11-teacher-keys">
                {examQuestions.map((question) => (
                  <li key={question.id}>
                    <p>
                      <strong>السؤال {question.number} ({question.level}):</strong> {question.prompt}
                    </p>
                    <p>
                      <strong>الإجابة:</strong> {question.solution}
                    </p>
                    <p>
                      <strong>سبب الإجابة:</strong> {question.teacherAnswer ?? question.explanation}
                    </p>
                    <p>
                      <strong>التفسير التعليمي:</strong> {question.explanation}
                    </p>
                  </li>
                ))}
              </ol>
            </section>

            <section>
              <h4>التدقيق العلمي والإسناد والتوثيق</h4>
              <p>
                المادة التعليمية الواردة في طلب المستخدم هي المصدر المباشر لهذا الدرس، ولم يُنسب أي نص أو قاعدة أو
                رقم صفحة إلى مرجع لم يُقدَّم ولم يُفحص. والتصحيحات المعالجة مسجّلة بالتفصيل في تقرير التدقيق المسبق:
                إخبار الطالب بأن التقسيم الثلاثي بحسب العلامة لا حصرًا، وتقييد قاعدة ألف تنوين الفتح بأنها غالبية لا
                شاملة، وقيد الوقف النطقي، وإزالة تكرار خيارات السؤال الثاني في التدريب، وحلّ غموض السؤال الرابع في
                الاختبار الختامي.
              </p>
              <p>
                <a href={sourceUrl} download>
                  تنزيل سجل المصدر المنظم
                </a>{' '}
                ·{' '}
                <a href={auditUrl} download>
                  تنزيل تقرير التدقيق العلمي
                </a>
              </p>
              <p>
                حلول الاختبار المستقل عرضها التفصيلي في خطوة «حلول الاختبارات» (تُكشف صفحةً صفحةً بعد التحقق أو بعد
                التسليم)، والقائمة أعلاه هي مفاتيح المعلم نفسها مع سبب كل إجابة، فلا يفترق مفتاح الطالب عن مفتاح
                المعلم.
              </p>
            </section>
          </div>
        </TeacherSpace>
      ),
    },
  ]

  return (
    <div className="tanween-lab-lesson" dir="rtl">
      <LessonFlow
        steps={steps}
        lessonTitle="التنوين وأنواعه وكيفية كتابته"
        lessonNumber="١١"
        lessonEyebrow="قسم الإملاء"
        onFinish={onFinish}
      />
    </div>
  )
}
