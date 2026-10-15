import { useState } from 'react'
import { LessonFlow, type LessonStepDefinition } from '../shared/components/LessonFlow'
import { TeacherSpace } from '../shared/teacher/TeacherSpace'
import { SolutionsArea, TestPageView, useTestEngine, type TestDefinition, type TestEngine } from '../shared/test'
import {
  sections,
  nounExamples,
  alExamples,
  triVerbs,
  khumasiVerbs,
  sudasiVerbs,
  rubaiVerbs,
  mudariVerbs,
  summaryTableRows,
  commonErrors,
  practice,
  quiz,
  testDefinition as independentTest,
  type ActivityQuestion,
} from './spelling-lesson-10/content'
import sourceUrl from '../../docs/source/spelling-lesson-10.md?url'
import auditUrl from '../../docs/spelling-lesson-10-audit.md?url'
import './spelling-lesson-10/lesson.css'

// eslint-disable-next-line react-refresh/only-export-components -- platform test conformance imports the definition
export const testDefinition: TestDefinition = independentTest

function activityDefinition(id: string, title: string, items: ActivityQuestion[]): TestDefinition {
  return {
    id,
    title,
    pages: [
      {
        id: `${id}-page`,
        title,
        questions: items.map((q, i) => ({
          id: q.id,
          number: i + 1,
          prompt: q.prompt,
          fields: [{ kind: 'choice', options: q.options, answer: q.answer }],
          solution: q.answer,
          explanation: q.explanation,
          answerSource: 'platform',
        })),
      },
    ],
  }
}

const practiceTest = activityDefinition('spell10-practice', 'تدريب تفاعلي — ثمانية أسئلة', practice)
const quizTest = activityDefinition('spell10-quiz', 'الاختبار الختامي التعليمي — عشرة أسئلة', quiz)

function DiscoveryCards() {
  return (
    <div className="spell10-discovery-grid">
      <article className="spell10-discovery-card spell10-discovery-card--wasl">
        <span className="spell10-discovery-mark">ا</span>
        <h4>الجملة الأولى — همزة الوصل</h4>
        <p className="spell10-hero__lead">استيقظَ أحمدُ مبكرًا.</p>
        <p>
          في كلمة <strong>«استيقظ»</strong> همزة وصل؛ نبدأ بنطقها إذا بدأنا بها مفردة، لكنها تسقط من النطق
          إذا وصلناها بما قبلها: <bdi>«وَاسْتَيْقَظَ»</bdi>.
        </p>
        <p>تُكتب ألفًا مجردة دون رسم الهمزة: <strong>(ا)</strong>.</p>
      </article>

      <article className="spell10-discovery-card spell10-discovery-card--qat">
        <span className="spell10-discovery-mark">أ / إ</span>
        <h4>الجملة الثانية — همزة القطع</h4>
        <p className="spell10-hero__lead">أكرمَ أحمدُ ضيفَه.</p>
        <p>
          في كلمة <strong>«أكرم»</strong> همزة قطع؛ ننطق الهمزة سواء بدأنا بالكلمة أم وصلناها بما قبلها:
          <bdi>«وَأَكْرَمَ»</bdi>.
        </p>
        <p>تُكتب برأس الهمزة فوق الألف أو تحتها: <strong>(أ، إ)</strong>.</p>
      </article>
    </div>
  )
}

function NounTable() {
  return (
    <div className="spell10-table-wrap">
      <table className="spell10-table">
        <caption>أشهر الأسماء السماعية التي تبدأ بهمزة وصل</caption>
        <thead>
          <tr>
            <th scope="col">الاسم السماعي</th>
            <th scope="col">مثال في جملة</th>
            <th scope="col">نوع الهمزة وحكمها</th>
          </tr>
        </thead>
        <tbody>
          {nounExamples.map((row) => (
            <tr key={row.noun}>
              <td data-label="الاسم السماعي"><strong>{row.noun}</strong></td>
              <td data-label="مثال في جملة"><bdi>{row.example}</bdi></td>
              <td data-label="نوع الهمزة وحكمها">همزة وصل (تُنطق ابتداءً وتسقط وصلًا)</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AlTable() {
  return (
    <div className="spell10-table-wrap">
      <table className="spell10-table">
        <caption>همزة الوصل في «الـ» التعريف الداخلة على الأسماء</caption>
        <thead>
          <tr>
            <th scope="col">الاسم مجردًا</th>
            <th scope="col">بعد دخول «الـ» التعريف</th>
            <th scope="col">رسم الهمزة</th>
          </tr>
        </thead>
        <tbody>
          {alExamples.map((row) => (
            <tr key={row.word}>
              <td data-label="الاسم مجردًا">{row.word}</td>
              <td data-label="بعد دخول «الـ» التعريف"><strong>{row.withAl}</strong></td>
              <td data-label="رسم الهمزة">ألف مجردة من غير رسم همزة (ا)</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TriVerbsTable() {
  return (
    <div className="spell10-table-wrap">
      <table className="spell10-table">
        <caption>أمر الفعل الثلاثي المجرد — همزة وصل</caption>
        <thead>
          <tr>
            <th scope="col">الماضي الثلاثي</th>
            <th scope="col">صيغة الأمر</th>
            <th scope="col">التعليل الإملائي</th>
          </tr>
        </thead>
        <tbody>
          {triVerbs.map((row) => (
            <tr key={row.past}>
              <td data-label="الماضي الثلاثي">{row.past}</td>
              <td data-label="صيغة الأمر"><strong>{row.order}</strong></td>
              <td data-label="التعليل الإملائي">أمر ثلاثي يبدأ بهمزة وصل زائدة للتوصّل للنطق بالساكن</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function KhumasiTable() {
  return (
    <div className="spell10-table-wrap">
      <table className="spell10-table">
        <caption>الفعل الخماسي — همزة وصل في الماضي والأمر والمصدر</caption>
        <thead>
          <tr>
            <th scope="col">الماضي</th>
            <th scope="col">الأمر</th>
            <th scope="col">المصدر</th>
          </tr>
        </thead>
        <tbody>
          {khumasiVerbs.map((row) => (
            <tr key={row.past}>
              <td data-label="الماضي"><strong>{row.past}</strong></td>
              <td data-label="الأمر"><strong>{row.order}</strong></td>
              <td data-label="المصدر"><strong>{row.masdar}</strong></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SudasiTable() {
  return (
    <div className="spell10-table-wrap">
      <table className="spell10-table">
        <caption>الفعل السداسي — همزة وصل في الماضي والأمر والمصدر</caption>
        <thead>
          <tr>
            <th scope="col">الماضي</th>
            <th scope="col">الأمر</th>
            <th scope="col">المصدر</th>
          </tr>
        </thead>
        <tbody>
          {sudasiVerbs.map((row) => (
            <tr key={row.past}>
              <td data-label="الماضي"><strong>{row.past}</strong></td>
              <td data-label="الأمر"><strong>{row.order}</strong></td>
              <td data-label="المصدر"><strong>{row.masdar}</strong></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RubaiTable() {
  return (
    <div className="spell10-table-wrap">
      <table className="spell10-table">
        <caption>الفعل الرباعي — همزة قطع في الماضي والأمر والمصدر</caption>
        <thead>
          <tr>
            <th scope="col">الماضي الرباعي</th>
            <th scope="col">أمر الرباعي</th>
            <th scope="col">مصدر الرباعي</th>
          </tr>
        </thead>
        <tbody>
          {rubaiVerbs.map((row) => (
            <tr key={row.past}>
              <td data-label="الماضي الرباعي"><strong>{row.past}</strong> (مفتوحة: أَ)</td>
              <td data-label="أمر الرباعي"><strong>{row.order}</strong> (مفتوحة: أَ)</td>
              <td data-label="مصدر الرباعي"><strong>{row.masdar}</strong> (مكسورة: إِ)</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MudariTable() {
  return (
    <div className="spell10-table-wrap">
      <table className="spell10-table">
        <caption>همزة المضارعة للمتكلم («أنا») — همزة قطع دائمًا</caption>
        <thead>
          <tr>
            <th scope="col">الفعل المضارع</th>
            <th scope="col">مثال في جملة</th>
            <th scope="col">حكم الهمزة</th>
          </tr>
        </thead>
        <tbody>
          {mudariVerbs.map((row) => (
            <tr key={row.verb}>
              <td data-label="الفعل المضارع"><strong>{row.verb}</strong></td>
              <td data-label="مثال في جملة"><bdi>{row.sentence}</bdi></td>
              <td data-label="حكم الهمزة">همزة قطع تثبت دائمًا وتُكتب فوق الألف</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SummaryTable() {
  return (
    <div className="spell10-table-wrap">
      <table className="spell10-table">
        <caption>جدول المراجعة السريع لمواضع همزتي الوصل والقطع</caption>
        <thead>
          <tr>
            <th scope="col">الموضع الإملائي والصرفي</th>
            <th scope="col">نوع الهمزة</th>
            <th scope="col">أمثلة توضيحية</th>
          </tr>
        </thead>
        <tbody>
          {summaryTableRows.map((row) => (
            <tr key={row.position}>
              <td data-label="الموضع الإملائي والصرفي"><strong>{row.position}</strong></td>
              <td data-label="نوع الهمزة">
                <span className={row.type === 'همزة وصل' ? 'spell10-correct-tag' : 'spell10-error-tag'}>
                  {row.type}
                </span>
              </td>
              <td data-label="أمثلة توضيحية"><bdi>{row.example}</bdi></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CommonErrorsCards() {
  return (
    <div className="spell10-stack">
      {commonErrors.map((item) => (
        <article className="spell10-card" key={item.wrong}>
          <div className="spell10-pair">
            <p><span className="spell10-error-tag">❌ الخطأ:</span> <bdi>{item.wrong}</bdi></p>
            <p><span className="spell10-correct-tag">✅ الصواب:</span> <bdi>{item.correct}</bdi></p>
          </div>
          <p><strong>سبب الصواب:</strong> {item.reason}</p>
        </article>
      ))}
    </div>
  )
}

export function LessonSpellingTen({ onFinish }: { onFinish?: () => void }) {
  const practiceEngine = useTestEngine(practiceTest)
  const quizEngine = useTestEngine(quizTest)
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
    // 1. أهداف الدرس والمدخل
    {
      id: 'spell10-objectives',
      title: 'أهداف الدرس والمدخل',
      group: 'المقدمة والملاحظة',
      render: () => (
        <div className="spell10-stack">
          <div className="spell10-hero">
            <p className="card__eyebrow">قسم الإملاء • الدرس العاشر</p>
            <h3>همزة الوصل وهمزة القطع</h3>
            <p className="spell10-hero__lead">متى نكتب «أ» ومتى نكتب «ا»؟</p>
            <p>{sections[0].paragraphs[0]}</p>
          </div>
          <div className="spell10-rule-callout">
            <h4>🎯 ماذا سنتعلم في هذا الدرس؟</h4>
            <p>{sections[0].paragraphs[1]}</p>
          </div>
        </div>
      ),
    },

    // 2. اكتشف الفرق بين الهمزتين
    {
      id: 'spell10-discovery',
      title: 'اكتشف الفرق بين الهمزتين',
      group: 'المقدمة والملاحظة',
      render: () => (
        <div className="spell10-stack">
          <p>{sections[1].paragraphs[0]}</p>
          <DiscoveryCards />
          <div className="spell10-card">
            <h4>💡 خلاصة الملاحظة الأولى:</h4>
            <p>{sections[1].paragraphs[3]}</p>
          </div>
        </div>
      ),
    },

    // 3. ما همزة الوصل وكيف نسمعها؟
    {
      id: 'spell10-wasl-definition',
      title: 'ما همزة الوصل وكيف نسمعها؟',
      group: 'همزة الوصل ومواضعها',
      render: () => (
        <div className="spell10-stack">
          <p>{sections[2].paragraphs[0]}</p>
          <div className="spell10-contrast-box">
            <h4>أمثلة مشهورة:</h4>
            <p>{sections[2].paragraphs[1]}</p>
          </div>
          <div className="spell10-rule-callout">
            <h4>👂 كيف نسمع همزة الوصل في النطق؟</h4>
            <p>{sections[2].paragraphs[2]}</p>
          </div>
        </div>
      ),
    },

    // 4. مواضع همزة الوصل في الأسماء
    {
      id: 'spell10-wasl-nouns',
      title: 'همزة الوصل في الأسماء السماعية',
      group: 'همزة الوصل ومواضعها',
      render: () => (
        <div className="spell10-stack">
          <p>{sections[3].paragraphs[0]}</p>
          <NounTable />
          <p>{sections[3].paragraphs[2]}</p>
          <div className="spell10-rule-callout">
            <h4>تنبيه مهم حول جمع التكسير وحذف ألف «ابن»:</h4>
            <p>{sections[3].paragraphs[3]}</p>
          </div>
        </div>
      ),
    },

    // 5. همزة الوصل في «الـ» التعريف
    {
      id: 'spell10-wasl-al',
      title: 'همزة الوصل في «الـ» التعريف',
      group: 'همزة الوصل ومواضعها',
      render: () => (
        <div className="spell10-stack">
          <p>{sections[4].paragraphs[0]}</p>
          <AlTable />
          <div className="spell10-contrast-box">
            <h4>لاحظ الفرق بين الاسم والعَلَم:</h4>
            <p>{sections[4].paragraphs[2]}</p>
          </div>
        </div>
      ),
    },

    // 6. مواضع همزة الوصل في الأفعال ومصادرها
    {
      id: 'spell10-wasl-verbs',
      title: 'همزة الوصل في الأفعال ومصادرها',
      group: 'همزة الوصل ومواضعها',
      render: () => (
        <div className="spell10-stack">
          <p>{sections[5].paragraphs[0]}</p>
          <h4>أ. أمر الفعل الثلاثي المجرد</h4>
          <p>{sections[5].paragraphs[1]}</p>
          <TriVerbsTable />
          <div className="spell10-rule-callout">
            <h4>تدقيق علمي في همزة «اقرأْ»:</h4>
            <p>{sections[5].paragraphs[2]}</p>
          </div>
          <h4>ب. ماضي الفعل الخماسي وأمره ومصدره</h4>
          <p>{sections[5].paragraphs[3]}</p>
          <KhumasiTable />
          <h4>ج. ماضي الفعل السداسي وأمره ومصدره</h4>
          <p>{sections[5].paragraphs[4]}</p>
          <SudasiTable />
          <div className="spell10-contrast-box">
            <p><strong>{sections[5].paragraphs[5]}</strong></p>
          </div>
        </div>
      ),
    },

    // 7. ما همزة القطع وصور كتابتها؟
    {
      id: 'spell10-qat-definition',
      title: 'ما همزة القطع وصور كتابتها؟',
      group: 'همزة القطع ومواضعها',
      render: () => (
        <div className="spell10-stack">
          <p>{sections[6].paragraphs[0]}</p>
          <div className="spell10-card">
            <h4>صور كتابة همزة القطع في أول الكلمة:</h4>
            <p>{sections[6].paragraphs[1]}</p>
          </div>
          <div className="spell10-contrast-box">
            <h4>أمثلة في جمل تامة:</h4>
            <p>{sections[6].paragraphs[2]}</p>
          </div>
        </div>
      ),
    },

    // 8. مواضع همزة القطع في الأفعال
    {
      id: 'spell10-qat-verbs',
      title: 'همزة القطع في الأفعال (الرباعي والمضارع)',
      group: 'همزة القطع ومواضعها',
      render: () => (
        <div className="spell10-stack">
          <p>{sections[7].paragraphs[0]}</p>
          <h4>أ. ماضي الفعل الرباعي وأمره ومصدره</h4>
          <p>{sections[7].paragraphs[1]}</p>
          <RubaiTable />
          <div className="spell10-rule-callout">
            <h4>مقارنة مهمة بين السداسي والرباعي:</h4>
            <p>{sections[7].paragraphs[2]}</p>
          </div>
          <h4>ب. الفعل المضارع الذي يبدأ بهمزة المتكلم</h4>
          <p>{sections[7].paragraphs[3]}</p>
          <MudariTable />
          <div className="spell10-contrast-box">
            <h4>انتبه إلى المقارنة بين الأمر والمضارع:</h4>
            <p>{sections[7].paragraphs[4]}</p>
          </div>
        </div>
      ),
    },

    // 9. همزة القطع في الحروف
    {
      id: 'spell10-qat-letters',
      title: 'همزة القطع في الحروف',
      group: 'همزة القطع ومواضعها',
      render: () => (
        <div className="spell10-stack">
          <p>{sections[8].paragraphs[0]}</p>
          <div className="spell10-card">
            <h4>أمثلة الحروف المبدوءة بهمزة قطع:</h4>
            <p>{sections[8].paragraphs[1]}</p>
          </div>
          <div className="spell10-rule-callout">
            <h4>المستثنى الوحيد من الحروف:</h4>
            <p>{sections[8].paragraphs[2]}</p>
          </div>
        </div>
      ),
    },

    // 10. الطريقة العملية لاختبار النطق
    {
      id: 'spell10-phonetic-test',
      title: 'اختبار النطق بالواو أو الفاء',
      group: 'القواعد والتطبيقات',
      render: () => (
        <div className="spell10-stack">
          <p>{sections[9].paragraphs[0]}</p>
          <div className="spell10-discovery-grid">
            <article className="spell10-discovery-card spell10-discovery-card--wasl">
              <h4>اختبار همزة الوصل</h4>
              <p>استخرج ← <strong>«وَاسْتَخْرَجَ»</strong></p>
              <p>{sections[9].paragraphs[1]}</p>
            </article>
            <article className="spell10-discovery-card spell10-discovery-card--qat">
              <h4>اختبار همزة القطع</h4>
              <p>أحمد ← <strong>«وَأَحْمَدُ»</strong></p>
              <p>{sections[9].paragraphs[2]}</p>
            </article>
          </div>
          <div className="spell10-rule-callout">
            <h4>نصيحة إملائية مهمة:</h4>
            <p>{sections[9].paragraphs[3]}</p>
          </div>
        </div>
      ),
    },

    // 11. جدول المراجعة السريع الشامل
    {
      id: 'spell10-summary-table',
      title: 'جدول المراجعة السريع الشامل',
      group: 'القواعد والتطبيقات',
      render: () => (
        <div className="spell10-stack">
          <p>{sections[10].paragraphs[0]}</p>
          <SummaryTable />
        </div>
      ),
    },

    // 12. الأخطاء الشائعة وتصحيحها
    {
      id: 'spell10-common-errors',
      title: 'الأخطاء الشائعة وتصحيحها',
      group: 'القواعد والتطبيقات',
      render: () => (
        <div className="spell10-stack">
          <p>تأمّل هذه الأخطاء الإملائية الشائعة وتعلّم سبب تصحيحها بدقة:</p>
          <CommonErrorsCards />
        </div>
      ),
    },

    // 13. تدريب تفاعلي — ثمانية أسئلة
    {
      id: 'spell10-practice',
      title: 'تدريب تفاعلي — ثمانية أسئلة',
      group: 'التدريب والتثبيت',
      render: () => (
        <div className="spell10-stack">
          <p>
            اختر الإجابة الصحيحة لكل سؤال، ثم اضغط على زر «تحقّق من الإجابات» في نهاية الصفحة لمعرفة النتيجة
            والتفسير التعليمي الفوري.
          </p>
          <TestPageView page={practiceTest.pages[0]} engine={practiceEngine} questionTestIdPrefix="spell10-practice" />
        </div>
      ),
    },

    // 14. الاختبار الختامي التعليمي — عشرة أسئلة
    {
      id: 'spell10-quiz',
      title: 'الاختبار الختامي التعليمي — عشرة أسئلة',
      group: 'التدريب والتثبيت',
      render: () => (
        <div className="spell10-stack">
          <p>
            اختبار ختامي تعليمي شامل مكوّن من 10 أسئلة لتقييم فهمك لمواضع همزتي الوصل والقطع في الأسماء والأفعال
            والحروف. أجب ثم اضغط زر التحقق لمراجعة التفسير.
          </p>
          <TestPageView page={quizTest.pages[0]} engine={quizEngine} questionTestIdPrefix="spell10-quiz" />
        </div>
      ),
    },

    // 15. خلاصة الدرس للحفظ والقاعدة الذهبية
    {
      id: 'spell10-summary',
      title: 'خلاصة الدرس للحفظ والقاعدة الذهبية',
      group: 'التدريب والتثبيت',
      render: () => (
        <div className="spell10-stack">
          <div className="spell10-discovery-grid">
            <article className="spell10-discovery-card spell10-discovery-card--wasl">
              <span className="spell10-discovery-mark">ا</span>
              <h4>همزة الوصل</h4>
              <p>{sections[12].paragraphs[0]}</p>
            </article>
            <article className="spell10-discovery-card spell10-discovery-card--qat">
              <span className="spell10-discovery-mark">أ / إ</span>
              <h4>همزة القطع</h4>
              <p>{sections[12].paragraphs[1]}</p>
            </article>
          </div>
          <div className="spell10-rule-callout">
            <h4>🌟 القاعدة الذهبية:</h4>
            <p>{sections[12].paragraphs[2]}</p>
          </div>
          <div className="spell10-card">
            <p>{sections[12].paragraphs[3]}</p>
          </div>
        </div>
      ),
    },

    // 16–19: صفحات الاختبار المستقل الأربع (5 أسئلة في كل صفحة)
    ...testDefinition.pages.map((page, index) => ({
      id: `spell10-test-${index + 1}`,
      title: `اختبار: ${page.title}`,
      group: 'الاختبار المستقل',
      render: () => (
        <div className="spell10-stack">
          <p>
            اختبار مستقل مكون من ٢٠ سؤالًا موزعة على أربع صفحات (خمسة أسئلة في كل صفحة). تحقّق من كل صفحة بعد
            الإجابة عنها لحفظ تقييمها؛ ولا تُكشف الحلول أو النتيجة النهائية المجمعة إلا بعد تسليم الاختبار كاملًا.
          </p>
          <TestPageView
            page={page}
            engine={engine}
            revealFeedback={showTestFeedback}
            questionTestIdPrefix="spell10-question"
          />
        </div>
      ),
    })),

    // 20. تسليم الاختبار والنتيجة
    {
      id: 'spell10-submit',
      title: 'تسليم الاختبار والنتيجة',
      group: 'الاختبار المستقل',
      render: () => (
        <div className="spell10-stack">
          <div className="spell10-card">
            <h3>تسليم الاختبار المستقل</h3>
            <p>
              الصفحات التي تم التحقق منها: <strong>{baseEngine.checkedPageIds.length}</strong> من <strong>٤</strong>.
            </p>
            <p>
              تعتمد النتيجة على أحدث إجاباتك الصالحة من حيث التحقق، ولا تتضاعف الدرجات. يجب التحقق من الصفحات الأربع
              قبل إتاحة زر التسليم النهائي.
            </p>
            <div className="spell10-status-bar">
              <button
                className="button button--primary"
                type="button"
                disabled={!baseEngine.allPagesChecked}
                onClick={() => setSubmitted(true)}
              >
                تسليم الاختبار
              </button>
              <button
                className="button button--ghost"
                type="button"
                onClick={() => engine.resetTest()}
              >
                إعادة ضبط الاختبار
              </button>
            </div>
            {!baseEngine.allPagesChecked && (
              <p className="test-page__hint">
                تحقّق من الصفحات الأربع أولًا بالضغط على زر «تحقّق من الإجابات» في نهاية كل صفحة.
              </p>
            )}
            {showTestFeedback && (
              <div role="status" className="spell10-rule-callout" data-testid="spell10-result">
                <h4>🎉 نتيجة الاختبار المستقل:</h4>
                <p>
                  لقد حصلت على: <strong>{engine.finalResult.correct}</strong> من{' '}
                  <strong>{engine.finalResult.total}</strong> سؤالًا صحيحًا.
                </p>
                <p>انتقل الآن إلى الخطوة التالية لاستعراض حلول الاختبارات والشروحات التفصيلية لكل سؤال.</p>
              </div>
            )}
          </div>
        </div>
      ),
    },

    // 21. حلول الاختبارات
    {
      id: 'spell10-solutions',
      title: 'حلول الاختبارات',
      group: 'الحلول والإرشاد',
      render: () => (
        <div className="spell10-stack">
          <SolutionsArea
            test={testDefinition}
            engine={engine}
            revealFeedback={showTestFeedback}
            testId="spell10-solutions"
          />
        </div>
      ),
    },

    // 22. منطقة المعلم
    {
      id: 'spell10-teacher',
      title: 'منطقة المعلم',
      group: 'الحلول والإرشاد',
      render: () => (
        <TeacherSpace>
          <div className="spell10-stack" data-testid="spell10-teacher">
            <h3>دليل المعلم — همزة الوصل وهمزة القطع</h3>
            <p>
              <strong>مخرجات التعلم المستهدفة:</strong> يميّز الطالب بين همزة الوصل وهمزة القطع نطقًا ورسمًا،
              ويحدّد مواضعهما في الأسماء والأفعال والحروف، ويفرّق بين الصيغ الصرفية المتشابهة (الماضي والأمر والمضارع)،
              ويعلّل سبب رسم الهمزة، ويصحّح الأخطاء الشائعة ذاتيًا.
            </p>

            <section>
              <h4>توجيهات المعلم وتشخيص الأخطاء الشائعة</h4>
              <ul>
                <li>
                  <strong>إذا كتب الطالب «إستخرج» أو «إستعمال»:</strong> اسأله عن زمن الفعل أو نوع المصدر وعدد حروف
                  ماضيه؛ بيّن له أن السداسي الخالي من همزة المتكلم يبدأ بهمزة وصل دائمًا تسقط عند إدخال الواو:
                  «واستخرج».
                </li>
                <li>
                  <strong>إذا كتب الطالب «احمد» دون همزة:</strong> ذكّره بأن «أحمد» اسم علم غير سماعي، وأصل الأسماء
                  القطع؛ وطبّق معه اختبار الواو: «وَأَحْمَدُ» فالهمزة ثابتة لا تسقط.
                </li>
                <li>
                  <strong>إذا خلط بين «استخرجْ» و«أستخرجُ»:</strong> اطلب منه تحديد الفاعل وزمن الفعل؛ فإن كان أمرًا
                  أو ماضيًا فهو سداسي وصل، وإن كان مضارعًا للمتكلم («أنا») فهمزته همزة قطع مفتوحة.
                </li>
                <li>
                  <strong>تنبيه جمع التكسير:</strong> نبّه الطلاب إلى أن جمع التكسير للأسماء السماعية يعود للأصل العام
                  وهو القطع: «اسم ← أسماء»، «ابن ← أبناء».
                </li>
                <li>
                  <strong>تنبيه همزة «اقرأْ»:</strong> وضّح للطلاب أن همزة البداية وصل زائدة، وألف النهاية تحمل همزة
                  أصلية متطرفة من جذر الفعل.
                </li>
              </ul>
            </section>

            <section>
              <h4>حلول التدريب التفاعلي الثمانية وشرحها</h4>
              <ol>
                {practice.map((item) => (
                  <li key={item.id} style={{ marginBlockEnd: '0.8rem' }}>
                    <p><strong>السؤال:</strong> {item.prompt}</p>
                    <p><strong>الإجابة المعتمدة:</strong> {item.answer}</p>
                    <p><strong>التفسير التعليمي:</strong> {item.explanation}</p>
                  </li>
                ))}
              </ol>
            </section>

            <section>
              <h4>حلول الاختبار الختامي التعليمي العشرة وشرحها</h4>
              <ol>
                {quiz.map((item) => (
                  <li key={item.id} style={{ marginBlockEnd: '0.8rem' }}>
                    <p><strong>السؤال:</strong> {item.prompt}</p>
                    <p><strong>الإجابة المعتمدة:</strong> {item.answer}</p>
                    <p><strong>التفسير التعليمي:</strong> {item.explanation}</p>
                  </li>
                ))}
              </ol>
            </section>

            <section>
              <h4>أمثلة إثرائية إضافية من إعداد المنصة</h4>
              <p>
                - «انطلقَ المتسابقون انطلاقًا سريعًا» (انطلقَ: ماضٍ خماسي وصل؛ انطلاقًا: مصدر خماسي وصل).
              </p>
              <p>
                - «أحسنَ أحمدُ إلى جاره إحسانًا» (أحسنَ: ماضٍ رباعي قطع؛ إحسانًا: مصدر رباعي قطع).
              </p>
              <p>
                - «يا بني، اجلسْ واستمعْ لما أقول، فإني أحبُّ لك الخير» (اجلسْ: أمر ثلاثي وصل؛ استمعْ: أمر خماسي وصل؛
                أقولُ: مضارع متكلم قطع؛ إني: حرف قطع؛ أحبُّ: مضارع متكلم قطع).
              </p>
            </section>

            <section>
              <h4>التدقيق العلمي والإسناد والتوثيق</h4>
              <p>
                تم تدقيق قواعد هذا الدرس ومسائله بالرجوع إلى أمهات مراجع النحو والإملاء القياسية (ألفية ابن مالك بشرح
                ابن عقيل، والمعجم العربي الأساسي).
              </p>
              <p>
                <a href={sourceUrl} download>تنزيل سجل المصدر المنظم</a> ·{' '}
                <a href={auditUrl} download>تنزيل تقرير التدقيق العلمي</a>
              </p>
              <p>
                حلول الاختبار المستقل العشرين وتعليلاتها المفصلة محفوظة في خطوة «حلول الاختبارات» المستقلة ولا تُكرر
                هنا احترامًا للفصل المعماري للمنصة.
              </p>
            </section>
          </div>
        </TeacherSpace>
      ),
    },
  ]

  return (
    <div className="spell10-lesson" dir="rtl">
      <LessonFlow
        steps={steps}
        lessonTitle="همزة الوصل وهمزة القطع — متى نكتب «أ» ومتى نكتب «ا»؟"
        lessonNumber="١٠"
        lessonEyebrow="قسم الإملاء"
        onFinish={onFinish}
      />
    </div>
  )
}
