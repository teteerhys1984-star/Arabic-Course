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
  sections,
  objectives,
  waslExamples,
  faslExamples,
  mimmanNote,
  maRules,
  memoryTable,
  maContrast,
  easyRule,
  inshallahAnalysis,
  inshaExamples,
  inshallahCompare,
  quickDrill,
  lasiyyamaExamples,
  kullamaConnected,
  kullamaCompare,
  commonStructures,
  methodSteps,
  commonErrors,
  summaryRules,
  selfCheck,
  homeworkCorrection,
  homeworkCorrectionModel,
  homeworkParagraphTopic,
  homeworkParagraphRequirements,
  homeworkSelfReview,
  homeworkParagraphModel,
  homeworkGradingGuide,
  practice,
  examQuestions,
  testDefinition as independentTest,
  type ActivityQuestion,
} from './spelling-lesson-13/content'
import sourceUrl from '../../docs/source/spelling-lesson-13.md?url'
import auditUrl from '../../docs/spelling-lesson-13-audit.md?url'
import './spelling-lesson-13/lesson.css'

// eslint-disable-next-line react-refresh/only-export-components -- platform test conformance imports the definition
export const testDefinition: TestDefinition = independentTest

/** التدريب التفاعلي: صفحة اختيار واحدة تُصحَّح عبر المحرك المشترك. */
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

const practiceTest = activityDefinition('spell13-practice', 'تدريب تفاعلي: اختبر فهمك — خمسة أسئلة', practice)

/** بطاقتا المفهوم: الوصل (متصل) × الفصل (منفصل) بعلامتين غير لونيتين. */
function ConceptCards() {
  return (
    <div className="wf-concepts">
      <article className="wf-concept wf-concept--wasl">
        <h4>الوصل ⛓</h4>
        <p>{sections[2].paragraphs[0]}</p>
        <ul className="wf-list">
          {waslExamples.map((item) => (
            <li key={item.form}>
              <strong className="wf-word wf-word--wasl">
                <span aria-hidden="true">⛓ </span>
                <bdi>{item.form}</bdi>
              </strong>{' '}
              — {item.note}
            </li>
          ))}
        </ul>
      </article>
      <article className="wf-concept wf-concept--fasl">
        <h4>الفصل ✂</h4>
        <p>{sections[2].paragraphs[1]}</p>
        <ul className="wf-list">
          {faslExamples.map((item) => (
            <li key={item.form}>
              <strong className="wf-word wf-word--fasl">
                <span aria-hidden="true">✂ </span>
                <bdi>{item.form}</bdi>
              </strong>{' '}
              — {item.note}
            </li>
          ))}
        </ul>
      </article>
    </div>
  )
}

/** بطاقات التراكيب الخمسة: الأصل والمعنى والمثال الرئيسي وأمثلة أخرى. */
function MaRulesCards() {
  return (
    <div className="wf-rules" data-testid="spell13-ma-rules">
      {maRules.map((rule) => (
        <article className="wf-rule" key={rule.form}>
          <p className="wf-rule__form">
            <bdi>{rule.form}</bdi>
          </p>
          <p className="wf-rule__origin">الأصل: {rule.origin}</p>
          <p className="wf-rule__main">
            <bdi>{rule.mainExample}</bdi>
          </p>
          <p className="wf-hint">المعنى: {rule.meaning}</p>
          <ul className="wf-list wf-rule__more">
            {rule.moreExamples.map((example) => (
              <li key={example}>
                <bdi>{example}</bdi>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  )
}

/** جدول الحفظ الخماسي: الأصل ← الصورة ← المثال. */
function MemoryTable() {
  return (
    <div className="wf-table-wrap">
      <table className="wf-table">
        <caption>جدول الحفظ: أصل كل تركيب وصورته الصحيحة في الاستفهام</caption>
        <thead>
          <tr>
            <th scope="col">الأصل</th>
            <th scope="col">الصورة الصحيحة في الاستفهام</th>
            <th scope="col">مثال</th>
          </tr>
        </thead>
        <tbody>
          {memoryTable.map((row) => (
            <tr key={row.origin}>
              <td data-label="الأصل">
                <bdi>{row.origin}</bdi>
              </td>
              <td data-label="الصورة الصحيحة في الاستفهام">
                <strong className="wf-word wf-word--good">
                  <span aria-hidden="true">✓ </span>
                  <bdi>{row.form}</bdi>
                </strong>
              </td>
              <td data-label="مثال">
                <bdi>{row.example}</bdi>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** المقابلة الحاسمة: سؤال (استفهامية) × إخبار (موصولة). */
function MaContrastCards() {
  return (
    <div className="wf-pairs" data-testid="spell13-ma-contrast">
      {maContrast.map((pair) => (
        <article className="wf-pair" key={pair.interrogative}>
          <div className="wf-pair__side wf-pair__side--ask">
            <p>
              <span className="wf-tag wf-tag--ask">سؤال — استفهامية</span>
            </p>
            <p className="wf-pair__text">
              <bdi>{pair.interrogative}</bdi>
            </p>
            <p className="wf-pair__note">{pair.interrogativeNote}</p>
          </div>
          <div className="wf-pair__side wf-pair__side--tell">
            <p>
              <span className="wf-tag wf-tag--tell">إخبار — موصولة</span>
            </p>
            <p className="wf-pair__text">
              <bdi>{pair.relative}</bdi>
            </p>
            <p className="wf-pair__note">{pair.relativeNote}</p>
          </div>
        </article>
      ))}
    </div>
  )
}

/** تفكيك «إن شاء الله» إلى كلماتها الثلاث. */
function InshallahAnalysis() {
  return (
    <div className="wf-analysis" data-testid="spell13-inshallah-analysis">
      {inshallahAnalysis.map((item) => (
        <article className="wf-analysis__word" key={item.word}>
          <p className="wf-analysis__form">
            <bdi>{item.word}</bdi>
          </p>
          <p className="wf-analysis__role">{item.role}</p>
        </article>
      ))}
    </div>
  )
}

/** جدول التراكيب الشائعة: تسعة صفوف بمثال لكل تركيب. */
function StructuresTable() {
  return (
    <div className="wf-table-wrap">
      <table className="wf-table">
        <caption>كلمات وتراكيب شائعة ينبغي الانتباه إليها</caption>
        <thead>
          <tr>
            <th scope="col">الكتابة الصحيحة</th>
            <th scope="col">مثال</th>
          </tr>
        </thead>
        <tbody>
          {commonStructures.map((row) => (
            <tr key={row.form}>
              <td data-label="الكتابة الصحيحة">
                <strong>
                  <bdi>{row.form}</bdi>
                </strong>
              </td>
              <td data-label="مثال">
                <bdi>{row.example}</bdi>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** منهج اكتشاف الخطأ: أربع خطوات مرقّمة. */
function MethodProtocol() {
  return (
    <ol className="wf-protocol" data-testid="spell13-protocol">
      {methodSteps.map((step) => (
        <li key={step.number} className="wf-protocol__step">
          <span className="wf-protocol__number" aria-hidden="true">
            <bdi>{step.number}</bdi>
          </span>
          <div>
            <strong>{step.title}</strong>
            <p>{step.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

/** جدول الأخطاء الشائعة: خطأ × صواب × سبب، بعلامتين غير لونيتين. */
function CommonErrorsTable() {
  return (
    <div className="wf-table-wrap">
      <table className="wf-table wf-table--errors">
        <caption>الأخطاء الشائعة: الخطأ والصواب والسبب</caption>
        <thead>
          <tr>
            <th scope="col">الخطأ</th>
            <th scope="col">الصواب</th>
            <th scope="col">السبب</th>
          </tr>
        </thead>
        <tbody>
          {commonErrors.map((row) => (
            <tr key={row.wrong}>
              <td data-label="الخطأ">
                <span className="wf-word wf-word--bad">
                  <span aria-hidden="true">✗ </span>
                  <bdi>{row.wrong}</bdi>
                </span>
              </td>
              <td data-label="الصواب">
                <strong className="wf-word wf-word--good">
                  <span aria-hidden="true">✓ </span>
                  <bdi>{row.correct}</bdi>
                </strong>
              </td>
              <td data-label="السبب">{row.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** خلاصة القواعد الخمس للحفظ. */
function SummaryList() {
  return (
    <div className="wf-summary" data-testid="spell13-summary">
      {summaryRules.map((rule, index) => (
        <article className="wf-summary__rule" key={rule.title}>
          <h4>
            {index + 1}. <bdi>{rule.title}</bdi>
          </h4>
          <p>{rule.detail}</p>
          <p>
            مثال: <bdi>{rule.example}</bdi>
          </p>
        </article>
      ))}
    </div>
  )
}

/** التحقق الذاتي: الفروق الثلاثة مع تلميح لكل فرق. */
function SelfCheckList() {
  return (
    <div className="wf-selfcheck" data-testid="spell13-selfcheck">
      {selfCheck.map((item) => (
        <article className="wf-selfcheck__item" key={item.pair}>
          <p className="wf-selfcheck__pair">
            <bdi>{item.pair}</bdi>
          </p>
          <p className="wf-selfcheck__hint">تلميح: {item.hint}</p>
        </article>
      ))}
    </div>
  )
}

/** الواجب: جمل التصحيح الخمس ومتطلبات الفقرة وقائمة المراجعة الذاتية. */
function HomeworkPanel() {
  return (
    <div className="wf-homework">
      <article className="wf-card">
        <h4>النشاط الأول: صحّح الجمل الآتية، ثم اكتب سبب التصحيح</h4>
        <ol className="wf-list wf-list--words">
          {homeworkCorrection.map((sentence, index) => (
            <li key={sentence}>
              <span className="wf-list__number">
                <bdi>{index + 1}</bdi>.
              </span>{' '}
              <bdi>{sentence}</bdi>
            </li>
          ))}
        </ol>
      </article>
      <article className="wf-card">
        <h4>النشاط الثاني: اكتب فقرة من ستة أسطر عن {homeworkParagraphTopic}، مستخدمًا:</h4>
        <ul className="wf-list">
          {homeworkParagraphRequirements.map((requirement) => (
            <li key={requirement}>{requirement}</li>
          ))}
        </ul>
      </article>
      <article className="wf-card">
        <h4>تعليمات المراجعة الذاتية: بعد الانتهاء اسأل نفسك</h4>
        <ul className="wf-list">
          {homeworkSelfReview.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </article>
    </div>
  )
}

export function LessonSpellingThirteen({ onFinish }: { onFinish?: () => void }) {
  const practiceEngine = useTestEngine(practiceTest)
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
    // ١. التمهيد التفاعلي
    {
      id: 'wasl-intro',
      title: '١. هل نكتب الكلمات كما نسمعها؟',
      shortTitle: 'التمهيد',
      group: 'المدخل التفاعلي',
      render: () => (
        <div className="wf-stack">
          <div className="wf-hero">
            <p className="card__eyebrow">قسم الإملاء • الدرس الثالث عشر</p>
            <h3>الوصل والفصل في الكتابة</h3>
            <p className="wf-hero__lead">رحلتنا في الإملاء العربي</p>
            <p>{sections[0].paragraphs[0]}</p>
          </div>
          <div className="wf-words-strip" data-testid="spell13-intro-words">
            {['ممَّنْ تعلّمتَ؟', 'ممَّ تخاف؟', 'عمَّ تبحث؟', 'فيمَ تفكّر؟', 'إن شاء الله.', 'لا سيّما المجتهدون.'].map(
              (word) => (
                <article className="wf-hero-word" key={word}>
                  <bdi>{word}</bdi>
                </article>
              ),
            )}
          </div>
          <div className="wf-note">
            <h4>لاحظ الفرق</h4>
            <p>{sections[0].paragraphs[1]}</p>
            <p>{sections[0].paragraphs[2]}</p>
          </div>
          <p className="wf-callout wf-callout--rule">{sections[0].paragraphs[3]}</p>
        </div>
      ),
    },

    // ٢. أهداف الدرس
    {
      id: 'wasl-objectives',
      title: '٢. أهداف الدرس',
      shortTitle: 'أهداف الدرس',
      group: 'المدخل التفاعلي',
      render: () => (
        <div className="wf-stack">
          <div className="wf-card">
            <h4>🎯 في نهاية الدرس ستتمكّن من:</h4>
            <ul className="wf-list">
              {objectives.map((objective) => (
                <li key={objective}>{objective}</li>
              ))}
            </ul>
          </div>
          <p>{sections[1].paragraphs[2]}</p>
        </div>
      ),
    },

    // ٣. المفهوم الأساسي
    {
      id: 'wasl-concept',
      title: '٣. ما المقصود بالوصل والفصل؟',
      shortTitle: 'الوصل والفصل',
      group: 'المفهوم الأساسي',
      render: () => (
        <div className="wf-stack">
          <ConceptCards />
          <div className="wf-callout wf-callout--precision">
            <h4>تنبيه: «ممَّنْ» غير «ممَّ»</h4>
            <p>{mimmanNote}</p>
          </div>
          <p>{sections[2].paragraphs[2]}</p>
        </div>
      ),
    },

    // ٤. اتصال «ما» الاستفهامية بحروف الجر
    {
      id: 'wasl-ma-rules',
      title: '٤. اتصال «ما» الاستفهامية بحروف الجر',
      shortTitle: '«ما» الاستفهامية',
      group: '«ما» الاستفهامية وحروف الجر',
      render: () => (
        <div className="wf-stack">
          <p>{sections[3].paragraphs[0]}</p>
          <MaRulesCards />
          <div className="wf-card">
            <h4>جدول الحفظ</h4>
            <MemoryTable />
          </div>
          <div className="wf-callout wf-callout--attention">
            <h4>تنبيه مهم</h4>
            <p>{sections[3].paragraphs[2]}</p>
          </div>
        </div>
      ),
    },

    // ٥. الفرق بين الاستفهامية والموصولة
    {
      id: 'wasl-ma-contrast',
      title: '٥. الفرق بين «ما» الاستفهامية و«ما» الموصولة',
      shortTitle: 'استفهام أم موصول؟',
      group: '«ما» الاستفهامية وحروف الجر',
      render: () => (
        <div className="wf-stack">
          <p>{sections[4].paragraphs[0]}</p>
          <MaContrastCards />
          <div className="wf-callout wf-callout--rule">
            <h4>قاعدة سهلة: اسأل نفسك</h4>
            <p>
              <strong>{easyRule}</strong>
            </p>
            <p>{sections[4].paragraphs[1]}</p>
          </div>
        </div>
      ),
    },

    // ٦. «إن شاء الله»
    {
      id: 'wasl-inshallah',
      title: '٦. «إن شاء الله» أم «إنشاء الله»؟',
      shortTitle: 'إن شاء الله',
      group: 'تراكيب الوصل والفصل',
      render: () => (
        <div className="wf-stack">
          <p>{sections[5].paragraphs[0]}</p>
          <InshallahAnalysis />
          <div className="wf-card">
            <h4>لماذا تُعدّ «إنشاء الله» خطأً في هذا المعنى؟</h4>
            <p>{sections[5].paragraphs[1]}</p>
            <ul className="wf-list wf-list--sentences">
              {inshaExamples.map((example) => (
                <li key={example}>
                  <bdi>{example}</bdi>
                </li>
              ))}
            </ul>
          </div>
          <div className="wf-callout wf-callout--rule">
            <h4>قارن: المعنى يتغيّر بحسب طريقة الكتابة</h4>
            <p>
              <strong>
                <bdi>{inshallahCompare.correct}</bdi>:
              </strong>{' '}
              {inshallahCompare.correctMeaning}
            </p>
            <p>
              <strong>
                <bdi>{inshallahCompare.other}</bdi>:
              </strong>{' '}
              {inshallahCompare.otherMeaning}
            </p>
          </div>
          <div className="wf-card">
            <h4>تدريب سريع: أكمل الجملة</h4>
            <p>
              <bdi>{quickDrill.prompt}</bdi>
            </p>
            <p>
              الصحيح:{' '}
              <strong>
                <bdi>{quickDrill.answer}</bdi>
              </strong>
            </p>
          </div>
        </div>
      ),
    },

    // ٧. «لا سيّما»
    {
      id: 'wasl-lasiyyama',
      title: '٧. «لا سيّما» أم «لاسيما»؟',
      shortTitle: 'لا سيّما',
      group: 'تراكيب الوصل والفصل',
      render: () => (
        <div className="wf-stack">
          <p>{sections[6].paragraphs[0]}</p>
          <div className="wf-card">
            <h4>أمثلة أخرى</h4>
            <ul className="wf-list wf-list--sentences">
              {lasiyyamaExamples.map((example) => (
                <li key={example}>
                  <bdi>{example}</bdi>
                </li>
              ))}
            </ul>
          </div>
          <div className="wf-callout wf-callout--attention">
            <h4>انتبه</h4>
            <p>{sections[6].paragraphs[1]}</p>
          </div>
        </div>
      ),
    },

    // ٨. «كلّما» و«كلّ ما»
    {
      id: 'wasl-kullama',
      title: '٨. الفرق بين «كلّما» و«كلّ ما»',
      shortTitle: 'كلّما / كلّ ما',
      group: 'تراكيب الوصل والفصل',
      render: () => (
        <div className="wf-stack">
          <div className="wf-concepts">
            <article className="wf-concept wf-concept--wasl">
              <h4>
                <span className="wf-tag wf-tag--wasl">متصلة</span> <bdi>كلّما</bdi>
              </h4>
              <p>{sections[7].paragraphs[0]}</p>
              <ul className="wf-list wf-list--sentences">
                {kullamaConnected.map((example) => (
                  <li key={example}>
                    <bdi>{example}</bdi>
                  </li>
                ))}
              </ul>
            </article>
            <article className="wf-concept wf-concept--fasl">
              <h4>
                <span className="wf-tag wf-tag--fasl">منفصلة</span> <bdi>كلّ ما</bdi>
              </h4>
              <p>{sections[7].paragraphs[1]}</p>
            </article>
          </div>
          <div className="wf-callout wf-callout--rule">
            <h4>طريقة التمييز</h4>
            <p>{sections[7].paragraphs[2]}</p>
            <p>
              قارن: <bdi>{kullamaCompare.connected}</bdi> × <bdi>{kullamaCompare.separated}</bdi>
            </p>
          </div>
        </div>
      ),
    },

    // ٩. جدول التراكيب الشائعة
    {
      id: 'wasl-structures',
      title: '٩. كلمات وتراكيب شائعة ينبغي الانتباه إليها',
      shortTitle: 'التراكيب الشائعة',
      group: 'تراكيب الوصل والفصل',
      render: () => (
        <div className="wf-stack">
          <p>{sections[8].paragraphs[0]}</p>
          <StructuresTable />
        </div>
      ),
    },

    // ١٠. خطوات اكتشاف الخطأ
    {
      id: 'wasl-method',
      title: '١٠. خطوات عملية لاكتشاف الخطأ',
      shortTitle: 'منهج التصحيح',
      group: 'منهج التصحيح',
      render: () => (
        <div className="wf-stack">
          <p>{sections[9].paragraphs[0]}</p>
          <MethodProtocol />
          <div className="wf-note">
            <h4>بعد التصحيح</h4>
            <p>{sections[9].paragraphs[1]}</p>
          </div>
        </div>
      ),
    },

    // ١١. أخطاء شائعة
    {
      id: 'wasl-errors',
      title: '١١. أخطاء شائعة وتصحيحها',
      shortTitle: 'الأخطاء الشائعة',
      group: 'منهج التصحيح',
      render: () => (
        <div className="wf-stack">
          <p>{sections[10].paragraphs[0]}</p>
          <CommonErrorsTable />
          <p>{sections[10].paragraphs[1]}</p>
        </div>
      ),
    },

    // ١٢. خلاصة الدرس للحفظ
    {
      id: 'wasl-summary',
      title: '١٢. خلاصة الدرس للحفظ',
      shortTitle: 'الخلاصة',
      group: 'الخلاصة والواجب',
      render: () => (
        <div className="wf-stack">
          <p>{sections[11].paragraphs[0]}</p>
          <SummaryList />
          <div className="wf-note">
            <p>{sections[11].paragraphs[1]}</p>
          </div>
        </div>
      ),
    },

    // ١٣. اختبر نفسك
    {
      id: 'wasl-selfcheck',
      title: '١٣. اختبر نفسك قبل إنهاء الدرس',
      shortTitle: 'تحقق ذاتي',
      group: 'الخلاصة والواجب',
      render: () => (
        <div className="wf-stack">
          <p>{sections[12].paragraphs[0]}</p>
          <SelfCheckList />
          <div className="wf-callout wf-callout--rule">
            <h4>مؤشر الإتقان</h4>
            <p>{sections[12].paragraphs[1]}</p>
          </div>
        </div>
      ),
    },

    // ١٤. الواجب المنزلي
    {
      id: 'wasl-homework',
      title: '١٤. الواجب المنزلي',
      shortTitle: 'الواجب المنزلي',
      group: 'الخلاصة والواجب',
      render: () => (
        <div className="wf-stack">
          <p>{sections[13].paragraphs[0]}</p>
          <HomeworkPanel />
          <p>{sections[13].paragraphs[1]}</p>
          <p className="wf-hint">نماذج الإجابة الكاملة ومعايير التصحيح في منطقة المعلم.</p>
        </div>
      ),
    },

    // ١٥. التدريب التفاعلي (٥ أسئلة)
    {
      id: 'wasl-practice',
      title: '١٥. تدريب تفاعلي: اختبر فهمك — خمسة أسئلة',
      shortTitle: 'تدريب تفاعلي',
      group: 'التدريب والاختبار',
      render: () => (
        <div className="wf-stack">
          <p>
            اختر الإجابة الصحيحة لكل سؤال، ثم اضغط على «تحقّق من الإجابات» في نهاية الصفحة
            لتعرف نتيجتك من ٥، والإجابة الصحيحة، وسببها، والقاعدة المرتبطة بها. ولا تظهر صحة
            الإجابة ولا الدرجة قبل أن تطلب التحقق — ويمكنك تعديل إجاباتك وإعادة التحقق. وهذا
            التدريب مستقل لا يدخل في درجة الاختبار النهائي.
          </p>
          <TestPageView
            page={practiceTest.pages[0]}
            engine={practiceEngine}
            questionTestIdPrefix="spell13-practice"
          />
          {practiceEngine.isPageChecked(practiceTest.pages[0].id) && (
            <section className="wf-stack wf-practice-rules" data-testid="spell13-practice-rules">
              <h4>القواعد المرتبطة بأسئلة التدريب</h4>
              <ul className="wf-list">
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

    // ١٦–١٩: صفحات الاختبار المستقل الأربع (٥ + ٥ + ٥ + ٥)
    ...testDefinition.pages.map((page, index) => ({
      id: `wasl-test-${index + 1}`,
      title: `اختبار مستقل — الصفحة ${['الأولى', 'الثانية', 'الثالثة', 'الرابعة'][index]}`,
      shortTitle: `اختبار الصفحة ${index + 1}`,
      group: 'الاختبار المستقل',
      render: () => (
        <div className="wf-stack">
          <p>
            اختبار مستقل مكوّن من ٢٠ سؤالًا موزعة على أربع صفحات (٥ اختيار + ٥ تصحيح + ٥ إكمال +
            ٥ إنشاء)، والعلامة الكاملة ٢٠ درجة (كل سؤال درجة). تحقّق من كل صفحة بعد الإجابة عنها
            ليُحفظ تقييمها؛ ولا تُكشف صحة الإجابات ولا الحلول ولا النتيجة النهائية إلا بعد تسليم
            الاختبار كاملًا. وأسئلة الإنشاء في الصفحة الرابعة تُراجع يدويًا مع المعلم.
          </p>
          <TestPageView
            page={page}
            engine={engine}
            revealFeedback={showTestFeedback}
            questionTestIdPrefix="spell13-question"
          />
        </div>
      ),
    })),

    // ٢٠. تسليم الاختبار والنتيجة
    {
      id: 'wasl-submit',
      title: '٢٠. تسليم الاختبار والنتيجة',
      shortTitle: 'تسليم الاختبار',
      group: 'الاختبار المستقل',
      render: () => (
        <div className="wf-stack">
          <div className="wf-card">
            <h3>تسليم الاختبار المستقل</h3>
            <p>
              الصفحات التي تم التحقق منها: <strong>{baseEngine.checkedPageIds.length}</strong> من{' '}
              <strong>٤</strong>.
            </p>
            <p>
              تعتمد النتيجة على أحدث إجاباتك الصالحة من حيث التحقق، ولا تتضاعف الدرجات. يجب التحقق
              من الصفحات الأربع قبل إتاحة زر التسليم النهائي.
            </p>
            <div className="wf-actions">
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
              <div role="status" className="wf-callout wf-callout--rule" data-testid="spell13-result">
                <h4>🎉 نتيجة الاختبار المستقل</h4>
                <p>
                  الإجابات الصحيحة آليًا: <strong>{engine.finalResult.correct}</strong> من{' '}
                  <strong>١٥</strong>؛ غير الصحيحة: <strong>{engine.finalResult.wrong}</strong>؛ غير
                  المجابة: <strong>{engine.finalResult.unanswered}</strong>؛ وأسئلة الإنشاء المسجّلة
                  للمراجعة اليدوية: <strong>{engine.finalResult.manual}</strong> من <strong>٥</strong>.
                </p>
                <p>
                  المجموع الكلي للاختبار ٢٠ درجة (١٥ آلية + ٥ بمراجعة المعلم). لا تشمل الدرجة الآلية
                  جودة الإنشاء؛ راجع نماذج الإجابة ومعاييرها مع معلمك.
                </p>
                <p>انتقل الآن إلى الخطوة التالية لاستعراض حلول الاختبار والشروح التفصيلية لكل سؤال.</p>
              </div>
            )}
          </div>
        </div>
      ),
    },

    // ٢١. حلول الاختبار
    {
      id: 'wasl-solutions',
      title: '٢١. حلول الاختبار',
      shortTitle: 'حلول الاختبار',
      group: 'الحلول والإرشاد',
      render: () => (
        <div className="wf-stack">
          <SolutionsArea
            test={testDefinition}
            engine={engine}
            revealFeedback={showTestFeedback}
            testId="spell13-solutions"
          />
        </div>
      ),
    },

    // ٢٢. منطقة المعلم
    {
      id: 'wasl-teacher',
      title: '٢٢. منطقة المعلم',
      shortTitle: 'منطقة المعلم',
      group: 'الحلول والإرشاد',
      render: () => (
        <TeacherSpace>
          <div className="wf-stack" data-testid="spell13-teacher">
            <h3>دليل المعلم — الوصل والفصل في الكتابة</h3>
            <p>
              <strong>مخرجات التعلم المستهدفة:</strong> أن يميّز الطالب المتصل من المنفصل، وأن يكتب
              «ما» الاستفهامية بعد حروف الجر الخمسة (بِمَ، لِمَ، فيمَ، عمَّ، ممَّ) ويميّزها عن
              الموصولة، وأن يكتب «إن شاء الله» ثلاث كلمات و«لا سيّما» كلمتين، وأن يميّز «كلّما»
              المتصلة (للتكرار) من «كلّ ما» المنفصلة (لجميع الأشياء التي)، وأن يكتشف الخطأ بمنهج
              الخطوات الأربع.
            </p>

            <section>
              <h4>الشرح التربوي: كيف تُقدَّم قواعد الوصل والفصل؟</h4>
              <ol className="wf-list">
                <li>
                  <strong>من النطق إلى القاعدة:</strong> ابدأ بالتمهيد — ما نسمعه متصلًا قد يُكتب
                  منفصلًا (إن شاء الله) وما نسمعه كلمتين قد يُكتب متصلًا (عمَّ). فالكتابة ليست نسخًا
                  للصوت، بل اتباع للقاعدة.
                </li>
                <li>
                  <strong>المعنى قبل الشكل:</strong> درّب على سؤالين قبل كتابة أي تركيب: «هل الجملة
                  سؤال عن شيء؟» (للاستفهامية) و«هل المعنى في كل مرة أم جميع الأشياء التي؟» (لكلّما).
                  فالمعنى لا الشكل هو الحكم.
                </li>
                <li>
                  <strong>التمييز بالمقابلة:</strong> عمَّ × عمّا، وبِمَ × بما، وكلّما × كلّ ما،
                  وإن شاء الله × إنشاء المشروع — كل زوج يُظهر أن طريقة الكتابة تغيّر المعنى.
                </li>
                <li>
                  <strong>من التعرّف إلى الإنتاج:</strong> الاختيار والتصحيح والإكمال للتعرّف،
                  والإنشاء والواجب للإنتاج الحر — فلا يُكتفى بالاختيار وحده.
                </li>
                <li>
                  <strong>المراجعة الذاتية:</strong> منهج الخطوات الأربع (المعنى ← الكلمات ← القاعدة
                  ← القراءة بعد التصحيح) هو عادة العمل التي يُراد للطالب أن يكتسبها.
                </li>
              </ol>
            </section>

            <section>
              <h4>شرح القواعد الموجّه للمعلم (مع التدقيقات المسجّلة)</h4>
              <ul className="wf-list">
                <li>
                  <strong>الوصل والفصل:</strong> الوصل كتابة الكلمات متصلة وفق قاعدة (عمَّ، ممَّ،
                  بِمَ، كلّما للتكرار)، والفصل كتابة كل كلمة مستقلة (إن شاء الله، لا سيّما، كلّ ما
                  بمعنى جميع الأشياء التي). (تدقيق ت-١: المصدر وضع «كلّما» تحت الفصل خطأً؛ صُحّح
                  موضعها إلى الوصل.)
                </li>
                <li>
                  <strong>كلّما:</strong> تُدرَّس بوصفها أداة تفيد التكرار والربط بين حدثين، دون
                  التوسّع في مباحث الشرط. (تدقيق ت-٢: وصفها بـ«الشرط» يخلطها مع «إنْ» الشرطية في
                  الدرس نفسه.)
                </li>
                <li>
                  <strong>ممَّنْ:</strong> أصلها «من + مَن» للسؤال عن العاقل (ممَّنْ تعلّمتَ؟)،
                  وتمييزها عن «ممَّ» (من + ما لغير العاقل) ضروري لمنع الخلط. (تدقيق ت-٣.)
                </li>
                <li>
                  <strong>ما الاستفهامية:</strong> بعد حروف الجر تُحذف ألفها في التراكيب الخمسة
                  (بِمَ، لِمَ، فيمَ، عمَّ، ممَّ). والمعيار المعنى لا الشكل: «بِمَ استعنتَ؟» سؤال،
                  و«استعنتُ بما تعلّمتُه» ليست سؤالًا.
                </li>
                <li>
                  <strong>إن شاء الله:</strong> ثلاث كلمات (إنْ أداة شرط + شاء فعل ماضٍ + الله فاعل)
                  بمعنى «إذا أراد الله». و«إنشاء» كلمة مستقلة (الإيجاد/التأسيس). (تدقيق ت-٧: التحليل
                  سليم وأُبقي بصياغته التأسيسية.)
                </li>
                <li>
                  <strong>لا سيّما:</strong> كلمتان بمعنى التخصيص (وخاصة). الصورة المتصلة «لاسيما»
                  مرفوضة مدرسيًا.
                </li>
                <li>
                  <strong>بماذا:</strong> «بماذا استعنت؟» صيغة صحيحة (الباء + ماذا) وليست خطأ؛
                  والخطأ هو «بما استعنت؟» بألف عند السؤال بـ«ما» المفردة. (تدقيق ت-٤: أُعيدت صياغة
                  صف الجدول لئلا يُتوهَّم تخطئة «بماذا».)
                </li>
                <li>
                  <strong>التكييف التقني (ت-٥):</strong> أسئلة التصحيح 6–10 بصيغة «اختر الجملة
                  المصحّحة»، وسؤال الإكمال 12 بصيغة عدد الكلمات — لأن الفروق الفاصلة (مسافات/وصل)
                  تنهار تحت مطابقة النص المرنة، فكان الاختيار هو التصحيح الآلي الأمين. الجمل
                  والمفاتيح من المصدر حرفيًا.
                </li>
              </ul>
            </section>

            <section>
              <h4>معالجة الأخطاء المتوقعة عند الطالب</h4>
              <ul className="wf-list">
                <li>
                  <strong>إذا كتب «إنشاء الله» بمعنى المشيئة:</strong> اسأله عن المعنى: إيجاد أم
                  مشيئة؟ ثم فكّك العبارة إلى كلماتها الثلاث (إن / شاء / الله).
                </li>
                <li>
                  <strong>إذا كتب «لاسيما» متصلة:</strong> أعِده إلى القاعدة: كلمتان (لا + سيّما)
                  بمعنى «وخاصة».
                </li>
                <li>
                  <strong>إذا أثبت ألف «ما» في «فيمَ»:</strong> اسأله: هل تسأل؟ نعم — فـ«ما»
                  الاستفهامية بعد حرف الجر تُحذف ألفها.
                </li>
                <li>
                  <strong>إذا فصل «كلّما» في سياق التكرار:</strong> اسأله: هل المعنى «في كل مرة»؟
                  نعم — فهي متصلة. وإن كان «جميع الأشياء التي» فهي منفصلة.
                </li>
                <li>
                  <strong>إذا خلط «ممَّنْ» بـ«ممَّ»:</strong> اسأله: عن عاقل تسأل أم عن غير عاقل؟
                  عاقل ← ممَّنْ (من + مَن)، غير عاقل ← ممَّ (من + ما).
                </li>
                <li>
                  <strong>تشخيص جماعي:</strong> نشاط سريع على اللوح: خمسة تراكيب، يحدد الطلاب لكل
                  تركيب: متصل أم منفصل، ثم القاعدة، ثم التبرير بالمعنى.
                </li>
              </ul>
            </section>

            <section>
              <h4>حلول التدريب التفاعلي الخمسة كاملة</h4>
              <ol className="wf-list wf-list--solutions">
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
                      <strong>القاعدة:</strong> {item.rule} — <strong>مثال إضافي:</strong>{' '}
                      {item.example}
                    </p>
                  </li>
                ))}
              </ol>
            </section>

            <section>
              <h4>مفاتيح الاختبار المستقل العشرين وسبب كل إجابة</h4>
              <ol className="wf-list wf-list--solutions" data-testid="spell13-teacher-keys">
                {examQuestions.map((question) => (
                  <li key={question.id}>
                    <p>
                      <strong>
                        السؤال {question.number} ({question.type}):
                      </strong>{' '}
                      {question.prompt}{' '}
                      {question.sentence ? (
                        <>
                          <bdi>{question.sentence}</bdi>
                        </>
                      ) : null}
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
              <h4>الواجب المنزلي: نموذج الإجابة الكامل</h4>
              <p>
                <strong>أولًا: تصحيح الجمل الخمس مع سبب كل تصحيح</strong>
              </p>
              <ol className="wf-list wf-list--solutions">
                {homeworkCorrectionModel.map((item) => (
                  <li key={item.sentence}>
                    <p>
                      <strong>الجملة:</strong> <bdi>{item.sentence}</bdi>
                    </p>
                    <p>
                      <strong>التصحيح:</strong> <bdi>{item.corrected}</bdi>
                    </p>
                    <p>
                      <strong>سبب التصحيح:</strong> {item.reason}
                    </p>
                  </li>
                ))}
              </ol>
              <p>
                <strong>ثانيًا: نموذج فقرة الستة أسطر (يستوفي المتطلبات الخمسة)</strong>
              </p>
              <ul className="wf-list">
                {homeworkParagraphRequirements.map((requirement) => (
                  <li key={requirement}>{requirement}</li>
                ))}
              </ul>
              <ol className="wf-list wf-list--paragraph">
                {homeworkParagraphModel.map((line) => (
                  <li key={line}>
                    <bdi>{line}</bdi>
                  </li>
                ))}
              </ol>
              <p>
                <strong>إرشادات التقييم:</strong>
              </p>
              <ul className="wf-list">
                {homeworkGradingGuide.map((guide) => (
                  <li key={guide}>{guide}</li>
                ))}
              </ul>
            </section>

            <section>
              <h4>التدقيق العلمي والإسناد والتوثيق</h4>
              <p>
                المادة التعليمية الواردة في طلب المستخدم هي المصدر المباشر لهذا الدرس، ولم يُنسب
                أي نص أو قاعدة أو رقم صفحة إلى مرجع لم يُقدَّم ولم يُفحص. والتصحيحات الموثّقة
                (ت-١ إلى ت-٧) مسجّلة بالتفصيل في تقرير التدقيق: تصنيف «كلّما» تحت الوصل، وتوحيد
                وصفها على التكرار والربط، وتمييز «ممَّنْ» عن «ممَّ»، وإعادة صياغة صف «بماذا»،
                والتكييف التقني لأسئلة التصحيح وسؤال الإكمال 12، وتطبيع «ممَّ»، وإبقاء تحليل «إن
                شاء الله».
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
                حلول الاختبار المستقل عرضها التفصيلي في خطوة «حلول الاختبار» (تُكشف بعد التسليم)،
                والقائمة أعلاه هي مفاتيح المعلم نفسها مع سبب كل إجابة، فلا يفترق مفتاح الطالب عن
                مفتاح المعلم إلا في معايير التصحيح اليدوي التفصيلية.
              </p>
            </section>
          </div>
        </TeacherSpace>
      ),
    },
  ]

  return (
    <div className="wasl-fasl-lesson" dir="rtl">
      <LessonFlow
        steps={steps}
        lessonTitle="الوصل والفصل في الكتابة"
        lessonNumber="١٣"
        lessonEyebrow="قسم الإملاء"
        onFinish={onFinish}
      />
    </div>
  )
}
