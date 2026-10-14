import type { ReactNode } from 'react'
import { TeacherSpace } from '../../shared/teacher/TeacherSpace'
import { SolutionsArea } from '../../shared/test'
import {
  chairLabels,
  examQuestionPlan,
  finalChallenge,
  homeworkLevelOne,
  homeworkLevelTwo,
  objectives,
  seatExamples,
  sourceCorrections,
  sourceFinalDefinition,
  sourceHeadings,
  teacherActivityKeys,
  teacherErrorGuidance,
  teacherSummary,
  testDefinition,
} from './content'

interface Props {
  sourceUrl: string
  auditUrl: string
}

const sourceMap = [
  ['«رحلة إلى كرسي الهمزة!» وخريطة الدرس', 'spell6-opening · spell6-decision', 'عنوان الدرس ومسار القرار'],
  [sourceHeadings[1], 'spell6-definition · spell6-warmup', 'تعريف وتمييز الهمزة الوسطى'],
  [sourceHeadings[2], 'spell6-strength', 'ترتيب الحركات؛ النشاط الحركي داخل الخطوة، وبطاقات النشاط تبدأ بـ spell6-activity-motion-'],
  [sourceHeadings[3], 'spell6-alif', 'الألف، أمثلة المصدر، وتصحيح مَرْأَة؛ نشاط الكرسي الشامل له test ID spell6-seat-lab'],
  [sourceHeadings[4], 'spell6-waw', 'الواو، وضبط مؤنث/مؤسسة؛ نشاط الكرسي الشامل له test ID spell6-seat-lab'],
  [sourceHeadings[5], 'spell6-nabra', 'النبرة وحالة الياء الساكنة؛ نشاط الكرسي الشامل له test ID spell6-seat-lab'],
  ['«اختبر نفسك ذهنيًا» — سؤال سُؤَالٌ على الواو', 'spell6-source-practice', 'السؤال المصدري الرابع يعيد السؤال مع مفتاح المشتتات في مفاتيح تدريب المصدر'],
  [sourceHeadings[6], 'spell6-line · spell6-special-cases', 'السطر بعد ألف/واو ساكنتين ومقابلاته'],
  [sourceHeadings[7], 'spell6-analysis · spell6-decision', 'تحليل محلول من سبع خطوات؛ التحدي الإضافي في spell6-final-challenge'],
  [sourceHeadings[8], 'spell6-source-practice', 'سبعة أسئلة تفاعلية مع تعليل المشتتات'],
  [sourceHeadings[9], 'spell6-source-final · spell6-source-final-solutions', 'الأسئلة السبعة الأصلية وحلولها بعد الكشف'],
  [sourceHeadings[10], 'spell6-summary', 'خريطة تلخيص تفاعلية وروابط رجوع للشرح'],
  [sourceHeadings[11], 'spell6-homework-one · spell6-homework-two · spell6-homework-creative', 'المستويات الثلاثة ومفاتيحها'],
  [sourceHeadings[12], 'spell6-next', 'إشارة مستقبلية فقط؛ لا رابط ولا درس سابع'],
] as const

const references = [
  {
    name: 'جامعة الملك سعود، كلية العلوم الإنسانية والاجتماعية — الهمزة المتوسطة',
    href: 'https://chss.ksu.edu.sa/en/node/5027',
    note: 'مرجع جامعي مباشر للحالات العامة والخاصة، ومنه قورنت أمثلة الألف والواو والنبرة والسطر.',
  },
  {
    name: 'جامعة الموصل، كلية التربية للعلوم الإنسانية — قواعد رسم الهمزة',
    href: 'https://uomosul.edu.iq/educationhc/wp-content/uploads/sites/20/2023/07/%D9%85%D8%AD%D8%A7%D8%B6%D8%B1%D8%A9%20%D9%82%D9%88%D8%A7%D8%B9%D8%AF%20%D8%B1%D8%B3%D9%85%20%D8%A7%D9%84%D9%87%D9%85%D8%B2%D8%A9.pdf',
    note: 'مقارنة جامعية مستقلة؛ استخراج نص PDF متأثر بالتنسيق، فلم يُعتمد OCR وحده لضبط الأمثلة.',
  },
  {
    name: 'جامعة ديالى، كلية التربية للعلوم الإنسانية — قواعد كتابة الهمزة في اللغة العربية',
    href: 'https://coehuman.uodiyala.edu.iq/wp-content/uploads/2025/02/%D8%A7%D9%84%D8%AE%D8%B7-%D9%88%D8%A7%D9%84%D8%A7%D9%85%D9%84%D8%A7%D8%A1.pdf',
    note: 'تأكيد مستقل لترتيب القوة والأمثلة؛ لم يُنقل نص ملتبس من OCR دون تقاطع.',
  },
  {
    name: 'معاجم مادة «مئة» — معجم اللغة العربية المعاصرة، والغني، والرائد',
    href: 'https://maajim.com/dictionary/%D9%85%D8%A6%D8%A9',
    note: 'تُسجّل الصيغتان «مِئَة» و«مِائَة»؛ هذه ملاحظة معجمية لا تُنسب إلى قرار أكاديمية.',
  },
  {
    name: 'معاجم، مادة «مأمن» (من مواد لسان العرب)',
    href: 'https://maajim.com/dictionary/%D9%85%D8%A3%D9%85%D9%86',
    note: 'عُرض «المَأْمَن» بمعنى موضع الأمن؛ استُخدم لشرح الخيار المصدري لا لتقرير قاعدة همزة.',
  },
] as const

function Section({ title, children, testId }: { title: string; children: ReactNode; testId?: string }) {
  return <section className="spell6-teacher-section" data-testid={testId}><h3>{title}</h3>{children}</section>
}

function ScrollTable({ label, children }: { label: string; children: ReactNode }) {
  return <div className="spell6-table-scroll" role="region" aria-label={label} tabIndex={0}>{children}</div>
}

function KeyList({ title, entries }: { title: string; entries: Record<string, unknown> }) {
  return (
    <details className="spell6-teacher-details">
      <summary>{title}</summary>
      <dl className="spell6-key-list">
        {Object.entries(entries).map(([id, answer]) => (
          <div className="spell6-key-list__row" key={id}>
            <dt><code dir="ltr">{id}</code></dt>
            <dd>{typeof answer === 'string' ? answer : JSON.stringify(answer)}</dd>
          </div>
        ))}
      </dl>
    </details>
  )
}

export function TeacherArea({ sourceUrl, auditUrl }: Props) {
  const examples = Object.values(seatExamples).flat()
  return (
    <TeacherSpace>
      <div className="spell6-teacher" data-testid="spell6-teacher-content">
        <p className="spell6-teacher__badge">دليل معلم محمي ببوابة المشروع · درس الإملاء السادس فقط</p>
        <p className="spell6-teacher__security-note">بوابة TeacherSpace تنظيمية أمامية وليست وسيلة مصادقة آمنة؛ لا تضعوا فيها بيانات حساسة.</p>

        <Section title="١. أهداف الدرس ومخرجات الإتقان" testId="spell6-teacher-objectives">
          <ul className="spell6-list">{objectives.map((objective) => <li key={objective}>{objective}</li>)}</ul>
          <p><strong>شرط الإتقان المقترح:</strong> يحدد المتعلم الهمزة المقصودة، ويسمي حركتها وحركة الحرف السابق مباشرة، ويختبر الحالة الخاصة عند الحاجة، ثم يذكر الكرسي أو الرسم المفرد مع تعليل يرفض فيه تعميمًا واحدًا على الأقل.</p>
          <p><strong>توزيع مقترح لزمن الحصة (٤٥–٦٠ دقيقة، إضافة تنظيمية):</strong> تمهيد وتمييز ٥ دقائق؛ بناء ترتيب الحركات ٨؛ قواعد الكراسي والحالات الخاصة ١٥؛ مختبر التحليل ٨؛ التدريب والتصحيح ٧؛ مراجعة/واجب وخروج ٥–١٠.</p>
          <p><strong>المعرفة السابقة:</strong> تمييز الحركات القصيرة والسكون وحروف المد وقراءة الكلمة من اليمين إلى اليسار.</p>
        </Section>

        <Section title="٢. ثوابت علمية قبل التدريس" testId="spell6-teacher-rules">
          <ol className="spell6-list">
            {teacherSummary.map((rule) => <li key={rule}>{rule}</li>)}
          </ol>
          <p>ترتيب القوة يُعرض قاعدةً عامة لا قانونًا بلا استثناء؛ كرسي الهمزة لا يُستنتج من حركة الهمزة وحدها ولا من الحركة التي تليها. السكون علامة خلوّ الحرف من الحركة، ويُذكر في السلسلة التعليمية على أنه الأضعف.</p>
          <p><strong>توضيح المصطلح:</strong> «ئ» همزة على كرسي النبرة، وليست ياءً منطوقة مستقلة. «على السطر» رسم الهمزة مفردة بلا كرسي؛ لا نعد السطر كرسيًا رابعًا مماثلًا للكراسي الثلاثة.</p>
        </Section>

        <Section title="٣. جرد الأمثلة المشروحة ومفاتيح التعليل" testId="spell6-teacher-example-keys">
          <p>إجمالي بطاقات المثال: <bdi>{examples.length}</bdi>. تشمل المفاتيح سبب الرسم، والحركة السابقة مباشرة، وحالة المصدر أو الإضافة.</p>
          {(['alif', 'waw', 'nabra', 'line'] as const).map((chair) => (
            <details className="spell6-teacher-details" key={chair}>
              <summary>كرسي {chairLabels[chair]} — {seatExamples[chair].length} أمثلة</summary>
              <ol className="spell6-example-key-list">
                {seatExamples[chair].map((example) => (
                  <li key={example.id} data-testid={`spell6-teacher-example-${example.id}`}>
                    <bdi className="spell6-word-inline" dir="rtl" lang="ar">{example.word}</bdi>
                    <span className="spell6-example-key-list__seat">{chairLabels[example.chair]}</span>
                    <p>{example.explanation}</p>
                    {example.source && <small>مثال وارد في المصدر المحفوظ.</small>}
                    {example.special && <small className="spell6-example-key-list__note">ملاحظة تدريسية: {example.special}</small>}
                  </li>
                ))}
              </ol>
            </details>
          ))}
          <div className="spell6-teacher-callout">
            <h4>المثال الملتبس الذي أُبقي في المصدر ولم يُحسم معجميًا</h4>
            <p>أورد المصدر «مَرْأَة». صفحة المعجم التي فُحصت لم تثبت الادعاء بأنها صيغة بديلة قليلة الدوران لـ«امرأة»؛ لذلك لا نقرر أنها صيغة صحيحة أو خطأ مطلق أو شائعة. لم تُستخدم مثالًا تعليميًا، وحلّ محلها «نَشْأَةٌ» في موضع النمط. النص الأصلي باقٍ في ملف المصدر وفي هذا السجل.</p>
          </div>
          <p><strong>ملاحظة المصدر:</strong> أُبقي الضبط «رَأَسَ» كما ورد؛ توضيح الحركات يميّزه عن الاسم القريب رسمًا «رَأْس» (همزته ساكنة)، ويُقرن بـ«دَأَبَ» لتثبيت الفتحتين.</p>
        </Section>

        <Section title="٤. تصحيحات المصدر الظاهرة للمتعلم" testId="spell6-teacher-corrections">
          <ScrollTable label="التصحيحات العلمية والسبب">
            <table className="spell6-table">
              <thead><tr><th scope="col">الرمز</th><th scope="col">نص المصدر/الالتباس</th><th scope="col">الصياغة الظاهرة للطالب</th><th scope="col">السبب</th></tr></thead>
              <tbody>{sourceCorrections.map((correction) => (
                <tr key={correction.id}>
                  <th scope="row">{correction.id}</th><td>{correction.sourceText}</td><td>{correction.corrected}</td><td>{correction.reason}</td>
                </tr>
              ))}</tbody>
            </table>
          </ScrollTable>
        </Section>

        <Section title="٥. خريطة تغطية المصدر إلى مواضع العرض الفعلية" testId="spell6-source-map">
          <p>معرّفات الخطوات هي معرّفات فعلية داخل LessonFlow؛ الحلول الكاملة للتدريب والاختبارين محفوظة أيضًا في الأقسام التالية.</p>
          <ScrollTable label="خريطة محاور المصدر إلى خطوات الدرس">
            <table className="spell6-table">
              <thead><tr><th scope="col">محور/قسم المصدر</th><th scope="col">معرّف الخطوة أو الخطوات</th><th scope="col">الموضع والحل</th></tr></thead>
              <tbody>{sourceMap.map(([source, steps, location]) => (
                <tr key={source}><th scope="row">{source}</th><td><code dir="ltr">{steps}</code></td><td>{location}</td></tr>
              ))}</tbody>
            </table>
          </ScrollTable>
          <ul className="spell6-list">
            <li>التمهيد والمقارنة بين الهمزة الابتدائية والمتوسطة والمتطرفة: <code dir="ltr">spell6-warmup</code>.</li>
            <li>التدريب التفاعلي المصدر: الأسئلة السبعة، وكل مشتت له تفسير في خطوة <code dir="ltr">spell6-source-practice</code>؛ مفتاحه أدناه.</li>
            <li>الاختبار الختامي المصدر ذو ٧ أسئلة: خطوة <code dir="ltr">spell6-source-final</code>، والحلول تطلب صراحةً في <code dir="ltr">spell6-source-final-solutions</code>، مع مفاتيح المعلم أدناه.</li>
            <li>تُحفظ الإحالة إلى الدرس التالي كما وردت، لكن لا يُنشأ لها رابط أو محتوى درس سابع.</li>
          </ul>
        </Section>

        <Section title="٥-أ. خريطة أمثلة المصدر إلى الخطوة ومفتاح الكلمة" testId="spell6-teacher-source-example-map">
          <p>الجدول التالي يسجل كل مثال لفظي وارد في أقسام القاعدة، وموضعه الفعلي ومفتاحه التعليلي. تكرار «مُؤْمِن» في المصدر يقابل بطاقة واحدة يعاد استخدامها؛ أما «مَرْأَة» فيبقى محفوظًا دون حكم معجمي غير مثبت.</p>
          <ScrollTable label="أمثلة المصدر ومواقعها وحلولها">
            <table className="spell6-table">
              <thead><tr><th scope="col">المثال كما سيعرض مضبوطًا</th><th scope="col">الموضع الفعلي</th><th scope="col">مفتاح الكرسي/التعليل</th></tr></thead>
              <tbody>
                {(['alif', 'waw', 'nabra', 'line'] as const).flatMap((chair) => seatExamples[chair].filter((example) => example.source).map((example) => (
                  <tr key={example.id}>
                    <th scope="row"><bdi dir="rtl" lang="ar">{example.word}</bdi></th>
                    <td><code dir="ltr">spell6-{chair}</code></td>
                    <td>{chairLabels[example.chair]} — {example.explanation}</td>
                  </tr>
                )))}
                <tr><th scope="row"><bdi dir="rtl" lang="ar">مَأْخَذٌ</bdi></th><td><code dir="ltr">spell6-final-challenge</code></td><td>مثال تطبيقي من المنصة لا من المصدر؛ الألف لأن الهمزة ساكنة بعد ميم مفتوحة.</td></tr>
                <tr><th scope="row"><bdi dir="rtl" lang="ar">مَرْأَة</bdi></th><td><code dir="ltr">docs/source/spelling-lesson-06.md</code> + تصحيح ت-٣ في <code dir="ltr">spell6-alif</code></td><td>لم يُحسم ضبطها أو شيوعها في المراجع التي فُحصت؛ لا تُعرض قاعدةً ولا توصف خطأً مطلقًا.</td></tr>
              </tbody>
            </table>
          </ScrollTable>
        </Section>

        <Section title="٦. مفاتيح الأنشطة والتغذية الراجعة" testId="spell6-teacher-activity-keys">
          <KeyList title="مختبر مقارنة الحركات" entries={teacherActivityKeys.movement as Record<string, unknown>} />
          <KeyList title="مختبر تصنيف الكرسي والسبب" entries={teacherActivityKeys.classification as Record<string, unknown>} />
          <p><strong>كشف تعميم حرف المد:</strong> {teacherActivityKeys.specialCase}</p>
          <p><strong>التحدي الختامي — {finalChallenge.word.word}:</strong> {teacherActivityKeys.finalChallenge}</p>
          <KeyList title="مختبر تصويب الأخطاء الشائعة" entries={teacherActivityKeys.commonErrors as Record<string, unknown>} />
          <KeyList title="مفاتيح تدريب المصدر السباعي" entries={teacherActivityKeys.sourcePractice as Record<string, unknown>} />
          <KeyList title="مفاتيح الواجب — المستوى الأول (الكرسي والسبب)" entries={teacherActivityKeys.homeworkLevelOne as Record<string, unknown>} />
          <KeyList title="مفاتيح الواجب — المستوى الثاني (التعليل)" entries={teacherActivityKeys.homeworkLevelTwo as Record<string, unknown>} />
          <details className="spell6-teacher-details">
            <summary>إجابات مختبرات التمهيد والكرسي (موجز)</summary>
            <ul className="spell6-list">
              <li>تمهيد الموضع: سَأَلَ وسط، أَحْمَدُ أول، شَاطِئٌ آخر، مَسْأَلَة وسط.</li>
              <li>المختبر المصنف: سَأَلَ على الألف؛ مُؤْمِن على الواو؛ فِئَة على النبرة؛ قِرَاءَة على السطر في الحالة الخاصة؛ بِيئَة على النبرة بعد ياء ساكنة؛ مُرُوءَة على السطر بعد واو ساكنة.</li>
              <li>بطاقة الكرسي لا تقبل «صحيح» بلا سبب؛ اطلب من الطالب تسمية الهمزة والحرف السابق مباشرة وحركتيهما.</li>
            </ul>
          </details>
        </Section>

        <Section title="٧. تدريب المصدر الختامي: مفاتيح حرفية وتعليلات" testId="spell6-teacher-source-final">
          <p>هذا الاختبار المصدرّي ذو ٧ بنود مستقل عن الاختبار النهائي الجديد ذي ٢٠ بندًا. إجابات المقال تُراجع يدويًا؛ تقبل الصياغات المكافئة المذكورة في مفتاح كل سؤال.</p>
          <details className="spell6-teacher-details">
            <summary>فتح الحلول النموذجية السبعة</summary>
            <SolutionsArea test={sourceFinalDefinition} mode="teacher" title="مفتاح الاختبار الختامي الوارد في المادة" eyebrow="دليل المعلم · مفتاح المصدر" testId="spell6-teacher-source-solutions" />
          </details>
          <p>تنبيه تطبيقي: في «مِئَة» يُقبل في سياق الكتابة التقليدي «مِائَة» عند السؤال عن الرسم العام؛ سؤال المصدر لا يختبر هذه المفاضلة، فلا تُخصم لذكر الصيغة المعجمية الموثقة مع تعليل مناسب.</p>
        </Section>

        <Section title="٨. مخطط الاختبار المستقل ومفتاحه الكامل" testId="spell6-teacher-exam-blueprint">
          <p><strong>المخطط المسبق:</strong> ٢٠ سؤالًا، أربع صفحات × خمسة أسئلة، موزعة ٥ تأسيس / ٥ ألف وواو / ٥ نبرة وحالات خاصة / ٥ تحليل وتصحيح. جميعها مميزة ومحددة المفتاح، ويحتوي كل بند على تعليل ورفض للمشتتات.</p>
          <ScrollTable label="مخطط أسئلة الاختبار المستقل ومستوياتها">
            <table className="spell6-table">
              <thead><tr><th scope="col">السؤال</th><th scope="col">المجموعة</th><th scope="col">المهارة</th><th scope="col">الصعوبة</th><th scope="col">التركيز</th></tr></thead>
              <tbody>{examQuestionPlan.map((question) => (
                <tr key={question.number}><th scope="row">{question.number}</th><td>{question.page}</td><td>{question.skill}</td><td>{question.difficulty}</td><td>{question.focus}</td></tr>
              ))}</tbody>
            </table>
          </ScrollTable>
          <details className="spell6-teacher-details">
            <summary>فتح الإجابات النموذجية والتفسيرات التفصيلية للأسئلة العشرين</summary>
            <SolutionsArea test={testDefinition} mode="teacher" title="الحلول التفصيلية لاختبار الهمزة المتوسطة — ٢٠ سؤالًا" eyebrow="منطقة المعلم · الاختبار المستقل" testId="spell6-teacher-exam-solutions" />
          </details>
        </Section>

        <Section title="٩. دليل التشخيص والمعالجة" testId="spell6-teacher-remediation">
          <ScrollTable label="الأخطاء الشائعة وأسبابها والمعالجة المقترحة">
            <table className="spell6-table">
              <thead><tr><th scope="col">الخطأ</th><th scope="col">علامة التشخيص</th><th scope="col">المعالجة</th></tr></thead>
              <tbody>{teacherErrorGuidance.map((item) => (
                <tr key={item.error}><th scope="row">{item.error}</th><td>{item.diagnostic}</td><td>{item.remedy}</td></tr>
              ))}</tbody>
            </table>
          </ScrollTable>
          <h4>تسلسل التلميح عند تعثّر الطالب</h4>
          <ol className="spell6-list">
            <li>لا تكشف الكرسي أولًا؛ اسأل: أين الهمزة المقصودة؟</li>
            <li>اطلب من الطالب تحديد الحرف الذي يسبقها مباشرة بعلامة بصرية.</li>
            <li>سمّ حركة كل طرف، ثم استدع ترتيب القوة.</li>
            <li>اسأل: هل السابق ألف/واو ساكنة مع همزة مفتوحة؟ هل هو ياء ساكنة؟</li>
            <li>اطلب اختيار الرسم وتعليلًا يذكر سبب استبعاد أقرب مشتت.</li>
          </ol>
        </Section>

        <Section title="١٠. إجابات الواجب المنزلي ومستوى القبول" testId="spell6-teacher-homework">
          <h4>المستوى الأول — تحديد الكرسي</h4>
          <ol className="spell6-list">{homeworkLevelOne.map((item) => <li key={item.id}><bdi dir="rtl">{item.word}</bdi> — {chairLabels[item.chair]}: {item.reason}</li>)}</ol>
          <h4>المستوى الثاني — التعليل</h4>
          <ol className="spell6-list">{homeworkLevelTwo.map((item) => <li key={item.id}><bdi dir="rtl">{item.word}</bdi> — {item.model}</li>)}</ol>
          <h4>المستوى الثالث — نموذج من خمس جمل</h4>
          <ol className="spell6-list">
            <li>سَأَلَ طالبٌ مجتهدٌ معلمَه عن فكرةٍ جديدة.</li>
            <li>اختار الطالبُ فِئَةً من الكلمات ليدرسها.</li>
            <li>كتبَ مُؤْمِنٌ بالعلم ملاحظاتٍ واضحةً في دفتره.</li>
            <li>ثم قرأ قِرَاءَةً نافعةً قبل أن يجيب عن كل مسألة.</li>
            <li>وعندما واجه سؤالًا صعبًا، حلّله بهدوءٍ وشرح كرسي الهمزة.</li>
          </ol>
          <ul className="spell6-list">
            <li><bdi>سَأَلَ</bdi>: فتحتان متساويتان؛ ألف.</li>
            <li><bdi>فِئَةً</bdi>: الفاء مكسورة؛ النبرة.</li>
            <li><bdi>مُؤْمِنٌ</bdi>: الميم مضمومة والهمزة ساكنة؛ الواو.</li>
            <li><bdi>قِرَاءَةً</bdi>: الهمزة مفتوحة بعد ألف مد؛ رسم مفرد على السطر.</li>
            <li><bdi>سُؤَالًا</bdi>: السين مضمومة والهمزة مفتوحة؛ الواو.</li>
          </ul>
          <p><strong>معيار مرن:</strong> تُقبل أي فقرة من خمسة أسطر فيها خمس همزات متوسطة صحيحة، ويُذكر لكل واحدة شكلها وحركة الهمزة وحركة السابق مباشرة أو الحكم الخاص. لا تُشترط كلمات النموذج حرفيًا. اسم الفاعل «مُؤْمِن» في الجملة الثالثة هو من آمن، وليس «مَأْمَن» بمعنى موضع الأمان.</p>
        </Section>

        <Section title="١١. سجل المصادر والحدود والتحفظات" testId="spell6-teacher-references">
          <ul className="spell6-list">
            <li><a href={sourceUrl} download="spelling-lesson-06.md">تنزيل نسخة المصدر المحفوظة غير المحررة</a> — لا تُعدل التصحيحات هذا الملف.</li>
            <li><a href={auditUrl} download="spelling-lesson-06-audit.md">تنزيل تقرير التدقيق العلمي وخطة التغطية</a>.</li>
            {references.map((reference) => <li key={reference.href}>
              <a href={reference.href} target="_blank" rel="noreferrer">{reference.name}</a>
              <span> — {reference.note}</span>
            </li>)}
          </ul>
          <p><strong>حدود الاستدلال:</strong> مرجع «مَرْأَة» لم يثبت الادعاء المنقول؛ لا نضيف حكمًا من نتيجة بحث غير محققة. كما لا تُنسب قاعدة «مِئَة/مائة» إلى الأكاديمية؛ التنبيه هنا معجمي. أضيف الاختبار المكوّن من ٢٠ سؤالًا بوصفه محتوى منصة مستقلًا وليس من أسئلة المصدر.</p>
        </Section>
      </div>
    </TeacherSpace>
  )
}
