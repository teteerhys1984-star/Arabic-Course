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
  preservedWords,
  ibnRows,
  maRows,
  lamOnAlRows,
  groupAlifVerbs,
  wawCompareRows,
  tanweenRows,
  tanweenExceptionRows,
  tanweenSentences,
  amruSentences,
  discoverySteps,
  commonErrors,
  homeworkWords,
  homeworkConditions,
  homeworkModel,
  homeworkParagraphModel,
  practice,
  examQuestions,
  testDefinition as independentTest,
  type ActivityQuestion,
} from './spelling-lesson-12/content'
import sourceUrl from '../../docs/source/spelling-lesson-12.md?url'
import auditUrl from '../../docs/lesson-spelling-12-audit.md?url'
import './spelling-lesson-12/lesson.css'

// eslint-disable-next-line react-refresh/only-export-components -- platform test conformance imports the definition
export const testDefinition: TestDefinition = independentTest

/** دراسة الحالة: الكلمة الخاطئة تُعرض قبل الصحيحة في بطاقة المقارنة. */
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

const practiceTest = activityDefinition('spell12-practice', 'تدريب تفاعلي: اختبر فهمك — ثمانية أسئلة', practice)

/** بطاقة كلمة محفوظة الرسم: الصواب أولاً ثم الخطأ موسومًا بعلامتين. */
function PreservedWordsTable() {
  return (
    <div className="ol-table-wrap">
      <table className="ol-table">
        <caption>الكلمات محفوظة الرسم: الصواب والخطأ وجملة توضيحية</caption>
        <thead>
          <tr>
            <th scope="col">الكتابة الصحيحة</th>
            <th scope="col">الكتابة الخاطئة</th>
            <th scope="col">مثال</th>
          </tr>
        </thead>
        <tbody>
          {preservedWords.map((row) => (
            <tr key={row.word}>
              <td data-label="الكتابة الصحيحة">
                <strong className="ol-word ol-word--good">
                  <span aria-hidden="true">✓ </span>
                  <bdi>{row.word}</bdi>
                </strong>
              </td>
              <td data-label="الكتابة الخاطئة">
                <span className="ol-word ol-word--bad">
                  <span aria-hidden="true">✗ </span>
                  <bdi>{row.wrong}</bdi>
                </span>
              </td>
              <td data-label="مثال">
                <bdi>{row.sentence}</bdi>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** خمس بطاقات الأصدقاء: أداة الحفظ من المصدر. */
function PreservedFriends() {
  return (
    <div className="ol-friends" data-testid="spell12-friends">
      {preservedWords.map((row) => (
        <article className="ol-friend" key={row.word}>
          <p className="ol-friend__word">
            <bdi>{row.word}</bdi>
          </p>
          <p className="ol-friend__wrong">
            <span aria-hidden="true">✗ </span>
            <bdi>{row.wrong}</bdi>
          </p>
        </article>
      ))}
    </div>
  )
}

/** مقارنة «ابن»: مواضع الحذف بعلامة النقص ومواضع الإثبات بعلامة الثبوت. */
function IbnComparison() {
  return (
    <div className="ol-ibn">
      {ibnRows.map((row) => (
        <article
          className={`ol-ibn__row ol-ibn__row--${row.kind}`}
          key={row.text}
          data-testid={`spell12-ibn-${row.kind}`}
        >
          <p className="ol-ibn__text">
            <bdi>{row.text}</bdi>
          </p>
          <p className="ol-ibn__tag">
            <span className={`ol-tag ol-tag--${row.kind === 'deleted' ? 'omit' : 'keep'}`}>
              {row.kind === 'deleted' ? 'حُذفت الألف' : 'ثُبِتَت الألف'}
            </span>
          </p>
          <p className="ol-ibn__note">{row.note}</p>
        </article>
      ))}
    </div>
  )
}

/** جدول «ما» الاستفهامية بعد حروف الجر: قبل الحذف ← بعد الحذف. */
function MaTable() {
  return (
    <div className="ol-table-wrap">
      <table className="ol-table ol-table--ma">
        <caption>حذف ألف «ما» الاستفهامية بعد حروف الجر</caption>
        <thead>
          <tr>
            <th scope="col">قبل الحذف</th>
            <th scope="col">بعد الحذف</th>
            <th scope="col">المثال</th>
          </tr>
        </thead>
        <tbody>
          {maRows.map((row) => (
            <tr key={row.before}>
              <td data-label="قبل الحذف">
                <bdi>{row.before}</bdi>
              </td>
              <td data-label="بعد الحذف">
                <strong className="ol-word ol-word--good">
                  <span aria-hidden="true">✓ </span>
                  <bdi>{row.after}</bdi>
                </strong>
              </td>
              <td data-label="المثال">
                <bdi>{row.example}</bdi>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** دخول اللام على «أل»: صفّان صحيحان وصف مقارن موسوم بعدم الانتماء للقاعدة. */
function LamOnAlCards() {
  return (
    <div className="ol-lam">
      {lamOnAlRows.map((row) => (
        <article
          className={`ol-lam__row ol-lam__row--${row.isAlExample ? 'yes' : 'no'}`}
          key={row.split}
        >
          <p className="ol-lam__split">
            <bdi>{row.split}</bdi>
            <span aria-hidden="true"> ← </span>
            <strong className="ol-lam__joined">
              <bdi>{row.joined}</bdi>
            </strong>
          </p>
          <p className="ol-lam__tag">
            {row.isAlExample ? (
              <span className="ol-tag ol-tag--omit">دخول اللام على «أل»</span>
            ) : (
              <span className="ol-tag ol-tag--neutral">ليس مثالًا على دخول اللام على «أل»</span>
            )}
          </p>
          <p className="ol-lam__note">{row.note}</p>
        </article>
      ))}
    </div>
  )
}

/** أفعال واو الجماعة مع جملها. */
function GroupAlifTable() {
  return (
    <div className="ol-table-wrap">
      <table className="ol-table">
        <caption>الألف الفارقة بعد واو الجماعة في الأفعال</caption>
        <thead>
          <tr>
            <th scope="col">الفعل</th>
            <th scope="col">المثال</th>
          </tr>
        </thead>
        <tbody>
          {groupAlifVerbs.map((row) => (
            <tr key={row.verb}>
              <td data-label="الفعل">
                <strong className="ol-word ol-word--add">
                  <bdi>{row.verb}</bdi>
                </strong>
              </td>
              <td data-label="المثال">
                <bdi>{row.sentence}</bdi>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** المقارنة الحاسمة: واو جماعة × واو أصلية × واو الاسم. */
function WawComparison() {
  return (
    <div className="ol-waw">
      {wawCompareRows.map((row) => (
        <article className="ol-waw__card" key={row.word}>
          <p className="ol-waw__word">
            <bdi>{row.word}</bdi>
          </p>
          <p className="ol-waw__kind">{row.kind}</p>
          <p className="ol-waw__note">{row.note}</p>
        </article>
      ))}
    </div>
  )
}

/** تحوّل تنوين النصب: الاسم المرفوع ← المنصوب بألف التنوين. */
function TanweenTransform() {
  return (
    <div className="ol-transform">
      {tanweenRows.map((row) => (
        <article className="ol-transform__row" key={row.base}>
          <p className="ol-transform__base">
            <bdi>{row.base}</bdi>
          </p>
          <p className="ol-transform__arrow" aria-hidden="true">
            ←
          </p>
          <p className="ol-transform__result">
            <strong>
              <bdi>{row.result}</bdi>
            </strong>
          </p>
        </article>
      ))}
    </div>
  )
}

/** استثناءات ألف تنوين النصب: جدول الحالات الثلاث. */
function TanweenExceptionsTable() {
  return (
    <div className="ol-table-wrap">
      <table className="ol-table">
        <caption>حالات لا تُضاف فيها ألف تنوين النصب (من أهمها)</caption>
        <thead>
          <tr>
            <th scope="col">الحالة</th>
            <th scope="col">المثال الصحيح</th>
            <th scope="col">السبب</th>
          </tr>
        </thead>
        <tbody>
          {tanweenExceptionRows.map((row) => (
            <tr key={row.ending}>
              <td data-label="الحالة">
                <strong>{row.ending}</strong>
              </td>
              <td data-label="المثال الصحيح">
                <strong className="ol-word ol-word--good">
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

/** جمل الاستثناءات الثلاث مع إبراز الكلمة المنوّنة. */
function TanweenSentences() {
  return (
    <ul className="ol-list ol-list--sentences">
      {tanweenSentences.map((sentence) => (
        <li key={sentence}>
          <bdi>{sentence}</bdi>
        </li>
      ))}
    </ul>
  )
}

/** أمثلة «عمرو» مع توضيح الواو الكتابية وصيغة النصب. */
function AmruSentences() {
  return (
    <div className="ol-amru">
      {amruSentences.map((item) => (
        <article className="ol-amru__card" key={item.text}>
          <p className="ol-amru__text">
            <bdi>{item.text}</bdi>
          </p>
          <p className="ol-amru__note">{item.note}</p>
        </article>
      ))}
    </div>
  )
}

/** منهج اكتشاف الخطأ: ثلاث خطوات مرقّمة. */
function DiscoveryProtocol() {
  return (
    <ol className="ol-protocol" data-testid="spell12-protocol">
      {discoverySteps.map((step) => (
        <li key={step.number} className="ol-protocol__step">
          <span className="ol-protocol__number" aria-hidden="true">
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

/** جدول الأخطاء الشائعة: خطأ × صواب × قاعدة، مع علامتين غير لونيتين. */
function CommonErrorsTable() {
  return (
    <div className="ol-table-wrap">
      <table className="ol-table ol-table--errors">
        <caption>الأخطاء الشائعة: الخطأ والصواب والقاعدة</caption>
        <thead>
          <tr>
            <th scope="col">الخطأ</th>
            <th scope="col">الصواب</th>
            <th scope="col">القاعدة</th>
          </tr>
        </thead>
        <tbody>
          {commonErrors.map((row) => (
            <tr key={row.wrong}>
              <td data-label="الخطأ">
                <span className="ol-word ol-word--bad">
                  <span aria-hidden="true">✗ </span>
                  <bdi>{row.wrong}</bdi>
                </span>
              </td>
              <td data-label="الصواب">
                <strong className="ol-word ol-word--good">
                  <span aria-hidden="true">✓ </span>
                  <bdi>{row.correct}</bdi>
                </strong>
              </td>
              <td data-label="القاعدة">{row.rule}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** الواجب: الكلمات الست وشروط الفقرة. */
function HomeworkPanel() {
  return (
    <div className="ol-homework">
      <article className="ol-card">
        <h4>أولًا: اكتب جملة مفيدة لكل كلمة، ثم اشرح سبب كتابتها بهذه الصورة</h4>
        <ol className="ol-list ol-list--words">
          {homeworkWords.map((word, index) => (
            <li key={word}>
              <span className="ol-list__number">
                <bdi>{index + 1}</bdi>.
              </span>{' '}
              <strong>
                <bdi>{word}</bdi>
              </strong>
            </li>
          ))}
        </ol>
      </article>
      <article className="ol-card">
        <h4>ثانيًا: اكتب فقرة من خمسة أسطر عن يومك الدراسي، على أن تستخدم فيها:</h4>
        <ul className="ol-list">
          {homeworkConditions.map((condition) => (
            <li key={condition}>{condition}</li>
          ))}
        </ul>
      </article>
    </div>
  )
}

export function LessonSpellingTwelve({ onFinish }: { onFinish?: () => void }) {
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
      id: 'omission-add-intro',
      title: '١. هل نكتب كل ما نسمعه؟',
      shortTitle: 'التمهيد',
      group: 'المدخل التفاعلي',
      render: () => (
        <div className="ol-stack">
          <div className="ol-hero">
            <p className="card__eyebrow">قسم الإملاء • الدرس الثاني عشر</p>
            <h3>علامات الحذف والزيادة في الكلمات</h3>
            <p className="ol-hero__lead">رحلتنا في الإملاء العربي</p>
            <p>{sections[0].paragraphs[0]}</p>
          </div>
          <div className="ol-words-strip" data-testid="spell12-intro-words">
            {['هذا', 'لكن', 'كتبوا', 'كتابًا'].map((word) => (
              <article className="ol-hero-word" key={word}>
                <bdi>{word}</bdi>
              </article>
            ))}
          </div>
          <div className="ol-note">
            <h4>لاحظ أمرين مهمّين</h4>
            <ul className="ol-list">
              <li>{sections[0].paragraphs[1]}</li>
              <li>{sections[0].paragraphs[2]}</li>
            </ul>
          </div>
          <p className="ol-callout ol-callout--rule">
            {sections[0].paragraphs[3]}
          </p>
        </div>
      ),
    },

    // ٢. أهداف الدرس
    {
      id: 'omission-add-objectives',
      title: '٢. أهداف الدرس',
      shortTitle: 'أهداف الدرس',
      group: 'المدخل التفاعلي',
      render: () => (
        <div className="ol-stack">
          <div className="ol-card">
            <h4>🎯 في نهاية الدرس ستتمكّن من:</h4>
            <ul className="ol-list">
              {objectives.map((objective) => (
                <li key={objective}>{objective}</li>
              ))}
            </ul>
          </div>
          <p>{sections[1].paragraphs[2]}</p>
        </div>
      ),
    },

    // ٣. المفهومان الأساسيان
    {
      id: 'omission-add-concepts',
      title: '٣. ما المقصود بالحذف والزيادة؟',
      shortTitle: 'المفهومان الأساسيان',
      group: 'المفهومان الأساسيان',
      render: () => (
        <div className="ol-stack">
          <div className="ol-concepts">
            <article className="ol-concept ol-concept--omit">
              <h4>الحذف</h4>
              <p>{sections[2].paragraphs[0]}</p>
              <p className="ol-concept__example">
                مثال: <bdi>لكن</bdi>، لا نكتبها «<bdi>لاكن</bdi>».
              </p>
            </article>
            <article className="ol-concept ol-concept--add">
              <h4>الزيادة</h4>
              <p>{sections[2].paragraphs[1]}</p>
              <p className="ol-concept__example">
                مثال: <bdi>كتبوا</bdi>، نكتب ألفًا بعد واو الجماعة ولا ننطقها.
              </p>
            </article>
          </div>
          <div className="ol-callout ol-callout--rule">
            <h4>⭐ القاعدة الذهبية</h4>
            <p>{sections[2].paragraphs[2]}</p>
          </div>
        </div>
      ),
    },

    // ٤. حذف الألف من كلمات محفوظة الرسم
    {
      id: 'omission-add-preserved',
      title: '٤. حذف الألف من كلمات محفوظة الرسم',
      shortTitle: 'كلمات محفوظة الرسم',
      group: 'القسم الأول: الحذف في الكتابة',
      render: () => (
        <div className="ol-stack">
          <p>{sections[3].paragraphs[0]}</p>
          <PreservedWordsTable />
          <div className="ol-callout ol-callout--attention">
            <h4>انتبه</h4>
            <p>{sections[3].paragraphs[1]}</p>
          </div>
          <div className="ol-card">
            <h4>كيف أحفظها بسهولة؟</h4>
            <p>{sections[3].paragraphs[2]}</p>
            <PreservedFriends />
          </div>
        </div>
      ),
    },

    // ٥. حذف ألف «ابن»
    {
      id: 'omission-add-ibn',
      title: '٥. حذف ألف «ابن» في حالات معيّنة',
      shortTitle: 'حذف ألف «ابن»',
      group: 'القسم الأول: الحذف في الكتابة',
      render: () => (
        <div className="ol-stack">
          <p>{sections[4].paragraphs[0]}</p>
          <IbnComparison />
          <div className="ol-callout ol-callout--attention">
            <h4>تذكّر</h4>
            <p>{sections[4].paragraphs[3]}</p>
          </div>
        </div>
      ),
    },

    // ٦. حذف ألف «ما» الاستفهامية
    {
      id: 'omission-add-ma',
      title: '٦. حذف ألف «ما» الاستفهامية بعد حروف الجر',
      shortTitle: '«ما» الاستفهامية',
      group: 'القسم الأول: الحذف في الكتابة',
      render: () => (
        <div className="ol-stack">
          <p>{sections[5].paragraphs[0]}</p>
          <MaTable />
          <div className="ol-callout ol-callout--rule">
            <h4>انتبه إلى الفرق بين السؤال وغيره</h4>
            <p>{sections[5].paragraphs[1]}</p>
          </div>
          <p>{sections[5].paragraphs[2]}</p>
        </div>
      ),
    },

    // ٧. دخول اللام على «أل»
    {
      id: 'omission-add-lam-al',
      title: '٧. دخول اللام على «أل»',
      shortTitle: 'دخول اللام على «أل»',
      group: 'القسم الأول: الحذف في الكتابة',
      render: () => (
        <div className="ol-stack">
          <p>{sections[6].paragraphs[0]}</p>
          <LamOnAlCards />
          <div className="ol-card">
            <h4>أمثلة في جمل</h4>
            <ul className="ol-list ol-list--sentences">
              <li>
                <bdi>ذهبتُ للمدرسة مبكرًا.</bdi>
              </li>
              <li>
                <bdi>اشتريتُ هديةً للطفل.</bdi>
              </li>
              <li>
                <bdi>هذا الكتاب للطالب.</bdi>
              </li>
            </ul>
          </div>
          <div className="ol-callout ol-callout--precision">
            <h4>ملاحظة</h4>
            <p>{sections[6].paragraphs[2]}</p>
          </div>
        </div>
      ),
    },

    // ٨. الألف الفارقة بعد واو الجماعة
    {
      id: 'omission-add-group-alif',
      title: '٨. الألف الفارقة بعد واو الجماعة',
      shortTitle: 'الألف الفارقة',
      group: 'القسم الثاني: الزيادة في الكتابة',
      render: () => (
        <div className="ol-stack">
          <p>{sections[7].paragraphs[0]}</p>
          <GroupAlifTable />
          <div className="ol-callout ol-callout--rule">
            <h4>متى لا نكتب الألف الفارقة؟</h4>
            <p>{sections[7].paragraphs[1]}</p>
          </div>
          <WawComparison />
          <p>{sections[7].paragraphs[2]}</p>
        </div>
      ),
    },

    // ٩. ألف تنوين النصب
    {
      id: 'omission-add-tanween-alif',
      title: '٩. ألف تنوين النصب',
      shortTitle: 'ألف تنوين النصب',
      group: 'القسم الثاني: الزيادة في الكتابة',
      render: () => (
        <div className="ol-stack">
          <p>{sections[8].paragraphs[0]}</p>
          <TanweenTransform />
          <div className="ol-card">
            <h4>في الجملة</h4>
            <p>
              <bdi>{sections[8].paragraphs[1]}</bdi>
            </p>
          </div>
          <div className="ol-callout ol-callout--rule">
            <h4>هل نضيف الألف في كل اسم منوّن بالفتح؟</h4>
            <p>{sections[8].paragraphs[2]}</p>
          </div>
          <TanweenExceptionsTable />
          <div className="ol-card">
            <h4>أمثلة في جمل</h4>
            <TanweenSentences />
          </div>
          <p>{sections[8].paragraphs[3]}</p>
        </div>
      ),
    },

    // ١٠. زيادة الواو في «عمرو»
    {
      id: 'omission-add-amru',
      title: '١٠. زيادة الواو في كلمة «عمرو»',
      shortTitle: 'الواو في «عمرو»',
      group: 'القسم الثاني: الزيادة في الكتابة',
      render: () => (
        <div className="ol-stack">
          <p>{sections[9].paragraphs[0]}</p>
          <AmruSentences />
          <p>{sections[9].paragraphs[1]}</p>
          <div className="ol-callout ol-callout--attention">
            <h4>لا تخلط</h4>
            <p>{sections[9].paragraphs[2]}</p>
          </div>
        </div>
      ),
    },

    // ١١. كيف أكتشف الخطأ الإملائي؟
    {
      id: 'omission-add-discovery',
      title: '١١. كيف أكتشف الخطأ الإملائي؟',
      shortTitle: 'اكتشاف الخطأ',
      group: 'القسم الثالث: اكتشاف الخطأ الإملائي',
      render: () => (
        <div className="ol-stack">
          <p>{sections[10].paragraphs[0]}</p>
          <DiscoveryProtocol />
          <div className="ol-note">
            <h4>مثال محلول</h4>
            <p>{sections[10].paragraphs[1]}</p>
          </div>
        </div>
      ),
    },

    // ١٢. أخطاء شائعة
    {
      id: 'omission-add-errors',
      title: '١٢. أخطاء شائعة يجب تجنّبها',
      shortTitle: 'الأخطاء الشائعة',
      group: 'الأخطاء والخلاصة والواجب',
      render: () => (
        <div className="ol-stack">
          <p>{sections[11].paragraphs[0]}</p>
          <CommonErrorsTable />
        </div>
      ),
    },

    // ١٣. خلاصة الدرس للحفظ
    {
      id: 'omission-add-summary',
      title: '١٣. خلاصة الدرس للحفظ',
      shortTitle: 'الخلاصة',
      group: 'الأخطاء والخلاصة والواجب',
      render: () => (
        <div className="ol-stack">
          <div className="ol-summary">
            <article className="ol-summary__side ol-summary__side--omit">
              <h4>الحذف</h4>
              <p>{sections[12].paragraphs[0]}</p>
            </article>
            <article className="ol-summary__side ol-summary__side--add">
              <h4>الزيادة</h4>
              <p>{sections[12].paragraphs[1]}</p>
            </article>
          </div>
          <div className="ol-callout ol-callout--attention">
            <h4>انتبه — استثناءات ألف تنوين النصب</h4>
            <p>{sections[12].paragraphs[2]}</p>
          </div>
          <div className="ol-note">
            <p>{sections[12].paragraphs[3]}</p>
          </div>
        </div>
      ),
    },

    // ١٤. الواجب المنزلي
    {
      id: 'omission-add-homework',
      title: '١٤. الواجب المنزلي',
      shortTitle: 'الواجب المنزلي',
      group: 'الأخطاء والخلاصة والواجب',
      render: () => (
        <div className="ol-stack">
          <p>{sections[13].paragraphs[0]}</p>
          <HomeworkPanel />
          <p>{sections[13].paragraphs[1]}</p>
          <p className="ol-hint">نموذج الإجابة الكامل في منطقة المعلم.</p>
        </div>
      ),
    },

    // ١٥. التدريب التفاعلي (٨ أسئلة)
    {
      id: 'omission-add-practice',
      title: '١٥. تدريب تفاعلي: اختبر فهمك — ثمانية أسئلة',
      shortTitle: 'تدريب تفاعلي',
      group: 'التدريب والاختبار',
      render: () => (
        <div className="ol-stack">
          <p>
            اختر الإجابة الصحيحة لكل سؤال، ثم اضغط على «تحقّق من الإجابات» في نهاية الصفحة
            لتعرف نتيجتك من ٨، والإجابة الصحيحة، وسببها، والقاعدة المرتبطة بها. ولا تظهر صحة
            الإجابة ولا الدرجة قبل أن تطلب التحقق — ويمكنك تعديل إجاباتك وإعادة التحقق.
          </p>
          <TestPageView
            page={practiceTest.pages[0]}
            engine={practiceEngine}
            questionTestIdPrefix="spell12-practice"
          />
          {practiceEngine.isPageChecked(practiceTest.pages[0].id) && (
            <section className="ol-stack ol-practice-rules" data-testid="spell12-practice-rules">
              <h4>القواعد المرتبطة بأسئلة التدريب</h4>
              <ul className="ol-list">
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

    // ١٦–١٩: صفحات الاختبار المستقل الأربع (٥ + ٤ + ٣ + ٣)
    ...testDefinition.pages.map((page, index) => ({
      id: `omission-add-test-${index + 1}`,
      title: `اختبار مستقل — الصفحة ${['الأولى', 'الثانية', 'الثالثة', 'الرابعة'][index]}`,
      shortTitle: `اختبار الصفحة ${index + 1}`,
      group: 'الاختبار المستقل',
      render: () => (
        <div className="ol-stack">
          <p>
            اختبار مستقل مكوّن من ١٥ سؤالًا موزعة على أربع صفحات (٥ تصحيح أخطاء + ٤ اختيار من
            متعدد + ٣ إكمال فراغ + ٣ تطبيق وفهم السياق). تحقّق من كل صفحة بعد الإجابة عنها ليُحفظ
            تقييمها؛ ولا تُكشف صحة الإجابات ولا الحلول ولا النتيجة النهائية إلا بعد تسليم الاختبار
            كاملًا.
          </p>
          <TestPageView
            page={page}
            engine={engine}
            revealFeedback={showTestFeedback}
            questionTestIdPrefix="spell12-question"
          />
        </div>
      ),
    })),

    // ٢٠. تسليم الاختبار والنتيجة
    {
      id: 'omission-add-submit',
      title: '٢٠. تسليم الاختبار والنتيجة',
      shortTitle: 'تسليم الاختبار',
      group: 'الاختبار المستقل',
      render: () => (
        <div className="ol-stack">
          <div className="ol-card">
            <h3>تسليم الاختبار المستقل</h3>
            <p>
              الصفحات التي تم التحقق منها: <strong>{baseEngine.checkedPageIds.length}</strong> من{' '}
              <strong>٤</strong>.
            </p>
            <p>
              تعتمد النتيجة على أحدث إجاباتك الصالحة من حيث التحقق، ولا تتضاعف الدرجات. يجب التحقق
              من الصفحات الأربع قبل إتاحة زر التسليم النهائي.
            </p>
            <div className="ol-actions">
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
              <div role="status" className="ol-callout ol-callout--rule" data-testid="spell12-result">
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

    // ٢١. حلول الاختبارات
    {
      id: 'omission-add-solutions',
      title: '٢١. حلول الاختبارات',
      shortTitle: 'حلول الاختبارات',
      group: 'الحلول والإرشاد',
      render: () => (
        <div className="ol-stack">
          <SolutionsArea
            test={testDefinition}
            engine={engine}
            revealFeedback={showTestFeedback}
            testId="spell12-solutions"
          />
        </div>
      ),
    },

    // ٢٢. منطقة المعلم
    {
      id: 'omission-add-teacher',
      title: '٢٢. منطقة المعلم',
      shortTitle: 'منطقة المعلم',
      group: 'الحلول والإرشاد',
      render: () => (
        <TeacherSpace>
          <div className="ol-stack" data-testid="spell12-teacher">
            <h3>دليل المعلم — علامات الحذف والزيادة في الكلمات</h3>
            <p>
              <strong>مخرجات التعلم المستهدفة:</strong> أن يميّز الطالب الحرف المحذوف عن الحرف
              المزيد، وأن يبرّر كتابته بالقاعدة لا بالحفظ؛ فيحذف الألف من الكلمات محفوظة الرسم
              (هذا، هذه، ذلك، لكن، الرحمن)، ويحذف ألف «ابن» بين علمين والثاني أبٌ للأول دون تعميم،
              ويحذف ألف «ما» الاستفهامية بعد حروف الجر ويميّزها عن غير الاستفهامية، ويفهم دخول
              اللام على «أل»، ويكتب الألف الفارقة بعد واو الجماعة، ويضبط ألف تنوين النصب مع
              استثناءاتها الثلاثة، ويميّز الواو الكتابية في «عمرو».
            </p>

            <section>
              <h4>الشرح التربوي: كيف تُقدَّم قواعد الحذف والزيادة؟</h4>
              <ol className="ol-list">
                <li>
                  <strong>من السمع إلى الكتابة:</strong> ابدأ بالتمهيد — نسمع صوتًا طويلًا في «هذا»
                  ونكتبه بألف (هـا) وألف مقصورة (ى)، ونسمع «كا» في «لكن» ولا نكتب ألفًا بعد اللام.
                  فالكتابة ليست نسخًا للصوت.
                </li>
                <li>
                  <strong>تعريفان قبل الأمثلة:</strong> الحذف (لا نكتب حرفًا مع أنه قد يُنطق أو كان
                  متوقّعًا) والزيادة (نكتب حرفًا لا يُنطق في النطق المعتاد)، ثم القاعدة الذهبية: لا
                  حذف ولا زيادة من تلقاء الطالب.
                </li>
                <li>
                  <strong>السياق قبل الشكل:</strong> درّب على سؤالين قبل كتابة أي كلمة: «هل «ما»
                  استفهامية؟» و«هل الواو في فعل وتدل على جماعة؟» — فالمعنى لا الشكل هو الحكم.
                </li>
                <li>
                  <strong>التمييز بالمقارنة:</strong> كتبوا × يدعو × المعلمون، وعمرو × عمر، ومدرسةً
                  × كتابًا — كل زوج يُظهر سببًا مختلفًا للحرف المكتوب.
                </li>
                <li>
                  <strong>المراجعة الذاتية:</strong> منهج الخطوات الثلاث (السياق ← القاعدة ← الكتابة
                  والمراجعة) هو عادة العمل التي يُراد للطالب أن يكتسبها، لا مجرد تمرين.
                </li>
              </ol>
            </section>

            <section>
              <h4>شرح القواعد الموجّه للمعلم (مع التدقيقات المسجّلة)</h4>
              <ul className="ol-list">
                <li>
                  <strong>هذا/هذه/ذلك:</strong> «هذا» هـا + ذى و«ذلك» ذا + ل + ى؛ الألف بعد الهاء
                  أو الذال مكتوبة، وآخر الكلمة ألف مقصورة (ى). والصور الخاطئة «هاذا» و«هاذه» و«ذالك»
                  و«ذاالك» تزيد حرفًا أو تبدّل آخر الكلمة. (تدقيق ت-١: عبارة المصدر «لا نكتب ألفًا
                  بعد الهاء» غير دقيقة، وصُحّحت في النص.)
                </li>
                <li>
                  <strong>لكن:</strong> الصورة الأساسية بلا شدة «لكن»، والاستعمال الشائع للرابط
                  «لكنَّ» بالشدة — وكلاهما بلا ألف بعد اللام. الخطأ «لاكن» بإضافة ألف. (تدقيق ت-٢.)
                </li>
                <li>
                  <strong>ابن:</strong> الحذف أشهره بين علمين والثاني أبٌ للأول (خالد بن الوليد، عمر
                  بن الخطاب، علي بن أبي طالب). الإثبات: في بداية الجملة (ابنُ خلدون) وفي غير موضع
                  الحذف (هذا ابنُ عمي). لا نعمّم الحذف على كل موضع — والمواضع الأخرى المعروفة في
                  التراث الإملائي تُدرس في مراحل أعلى. (تدقيق ت-٥.)
                </li>
                <li>
                  <strong>ما الاستفهامية:</strong> بعد حروف الجر تُحذف ألفها غالبًا وتُكتب مدمجة:
                  عمَّ، ممَّ، فيمَ، بِمَ، لِمَ، إلامَ؛ ويحدث إدغام في عمَّ وممَّ. والمعيار المعنى
                  لا الشكل: «بِمَ تفكّر؟» سؤال، و«بما تعلمتَ، أفدتَ غيرك» ليست سؤالًا.
                </li>
                <li>
                  <strong>دخول اللام على «أل»:</strong> لِـ + المدرسة = للمدرسة، ولِـ + البيت =
                  للبيت؛ اللامان تُكتبان معًا (اتصال لا حذف). «لمعلّم الصف» اتصال لام الجر بكلمة
                  أخرى لا تبدأ بـ«أل»، فلا يُعرض كمثال على القاعدة. (تدقيق ت-٣، ت-٤.)
                </li>
                <li>
                  <strong>الألف الفارقة:</strong> تُكتب بعد واو الجماعة في الفعل (كتبوا، لعبوا، لم
                  يهملوا، لن يتأخروا، اكتبوا) ولا تُنطق. لا تُكتب بعد الواو الأصلية (يدعو، يسمو)
                  ولا بعد واو الاسم (المعلمون).
                </li>
                <li>
                  <strong>ألف تنوين النصب:</strong> تُكتب غالبًا بعد الحرف الصحيح (كتابًا، قلمًا،
                  درسًا، بابًا، طريقًا). أشهر الاستثناءات (لا حصرًا): التاء المربوطة (مدرسةً)،
                  والألف المقصورة (فتىً)، والهمزة التي قبلها ألف (سماءً). (تدقيق ت-٦.)
                </li>
                <li>
                  <strong>عمرو:</strong> تُكتب بالواو التي لا تُنطق في النطق المعتاد تمييزًا
                  كتابيًا عن «عمر»، وصيغتها في النصب مع تنوين الفتح «عمرًا» لا «عمروًا». (تدقيق
                  ت-٨.)
                </li>
                <li>
                  <strong>كتاباً:</strong> الصورة المعيارية المطلوبة في الرسم الإملائي المدرسي هي
                  «كتابًا» بالألف؛ ومن سمح بعض الخطوط اليدوية منها يُذكر إشارةً لا يُبنى عليه قاعدة.
                  (تدقيق ت-٧.)
                </li>
              </ul>
            </section>

            <section>
              <h4>معالجة الأخطاء المتوقعة عند الطالب</h4>
              <ul className="ol-list">
                <li>
                  <strong>إذا كتب «هاذا» أو «هاذه»:</strong> أَعِد معه رسم الكلمة حرفًا حرفًا: هـا +
                  ذى؛ فالصوت الطويل مكتوب (هـا)، وآخر الكلمة ألف مقصورة (ى) لا ألف كاملة (ا).
                </li>
                <li>
                  <strong>إذا كتب «كتبو»:</strong> اسأله: من فعل الفعل؟ جماعة — إذن واو جماعة تُثبت
                  بعدها الألف الفارقة.
                </li>
                <li>
                  <strong>إذا كتب «قصةاً» أو «سماءاً»:</strong> بيّن أن الألف موجودة أصلًا أو أن
                  التاء المربوطة لا تُتبع بألف؛ فلا ألف ثانية.
                </li>
                <li>
                  <strong>إذا حذف ألف «ابن» في كل موضع:</strong> أعِد به إلى القاعدة المقيدة: بين
                  علمين والثاني أبٌ للأول — وفي بداية الجملة تُثبت الألف.
                </li>
                <li>
                  <strong>إذا أثبت ألف «ما» في «فيمَ»:</strong> اسأله: هل تسأل؟ نعم — فـ«ما»
                  الاستفهامية بعد حرف الجر تُحذف ألفها.
                </li>
                <li>
                  <strong>تشخيص جماعي:</strong> نشاط سريع على اللوح: خمس كلمات، يحدد الطلاب لكل
                  كلمة: الحرف المحذوف أو المزيد، ثم القاعدة، ثم التبرير.
                </li>
              </ul>
            </section>

            <section>
              <h4>حلول التدريب التفاعلي الثمانية كاملة</h4>
              <ol className="ol-list ol-list--solutions">
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
              <h4>مفاتيح الاختبار المستقل الخمسة عشر وسبب كل إجابة</h4>
              <ol className="ol-list ol-list--solutions" data-testid="spell12-teacher-keys">
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
                <strong>أولًا: جملة لكل كلمة مع سبب الكتابة</strong>
              </p>
              <ol className="ol-list ol-list--solutions">
                {homeworkModel.map((item) => (
                  <li key={item.word}>
                    <p>
                      <strong>{item.word}:</strong> <bdi>{item.sentence}</bdi>
                    </p>
                    <p>
                      <strong>سبب الكتابة:</strong> {item.reason}
                    </p>
                  </li>
                ))}
              </ol>
              <p>
                <strong>ثانيًا: نموذج فقرة الخمسة أسطر (تستوفي الشروط الأربعة)</strong>
              </p>
              <ul className="ol-list">
                {homeworkParagraphModel.conditions.map((condition) => (
                  <li key={condition}>{condition}</li>
                ))}
              </ul>
              <ol className="ol-list ol-list--paragraph">
                {homeworkParagraphModel.paragraph.map((line) => (
                  <li key={line}>
                    <bdi>{line}</bdi>
                  </li>
                ))}
              </ol>
              <p className="ol-hint">
                يُقبل أي نص آخر يستوفي الشروط الأربعة؛ والمعيار تحقق الشروط لا مطابقة النص.
              </p>
            </section>

            <section>
              <h4>التدقيق العلمي والإسناد والتوثيق</h4>
              <p>
                المادة التعليمية الواردة في طلب المستخدم هي المصدر المباشر لهذا الدرس، ولم يُنسب
                أي نص أو قاعدة أو رقم صفحة إلى مرجع لم يُقدَّم ولم يُفحص. والتصحيحات الموثّقة
                (ت-١ إلى ت-٨) مسجّلة بالتفصيل في تقرير التدقيق: صياغة «هذا» وآخرها ألف مقصورة، و«لكن»
                و«لكنَّ»، وعنوان دخول اللام، ووسم «لمعلّم الصف» كغير مثال، وتقييد قاعدتي «ابن»
                وتنوين النصب، وصياغة «كتابًا» المعيارية، وتقييد «عمرو» بالنطق المعتاد.
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
                حلول الاختبار المستقل عرضها التفصيلي في خطوة «حلول الاختبارات» (تُكشف صفحةً صفحةً
                بعد التحقق أو بعد التسليم)، والقائمة أعلاه هي مفاتيح المعلم نفسها مع سبب كل إجابة،
                فلا يفترق مفتاح الطالب عن مفتاح المعلم.
              </p>
            </section>
          </div>
        </TeacherSpace>
      ),
    },
  ]

  return (
    <div className="omit-add-lesson" dir="rtl">
      <LessonFlow
        steps={steps}
        lessonTitle="علامات الحذف والزيادة في الكلمات"
        lessonNumber="١٢"
        lessonEyebrow="قسم الإملاء"
        onFinish={onFinish}
      />
    </div>
  )
}
