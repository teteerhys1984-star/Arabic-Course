import { useState } from 'react'
import { LessonFlow, type LessonStepDefinition } from '../shared/components/LessonFlow'
import { TeacherSpace } from '../shared/teacher/TeacherSpace'
import { SolutionsArea, TestPageView, useTestEngine, type TestDefinition, type TestEngine } from '../shared/test'
import { sections, comparison, commonErrors, practice, quiz, homework, testDefinition as independentTest } from './spelling-lesson-09/content'
import sourceUrl from '../../docs/source/spelling-lesson-09.md?url'
import auditUrl from '../../docs/spelling-lesson-09-audit.md?url'
import './spelling-lesson-09/lesson.css'

// eslint-disable-next-line react-refresh/only-export-components -- platform test conformance imports the definition
export const testDefinition: TestDefinition = independentTest

function activityDefinition(id: string, title: string, items: typeof practice): TestDefinition {
  return { id, title, pages: [{ id: `${id}-page`, title, questions: items.map((q, i) => ({
    id: q.id, number: i + 1, prompt: q.prompt,
    fields: [{ kind: 'choice', options: q.options, answer: q.answer }],
    solution: q.answer, explanation: q.explanation, answerSource: 'platform',
  })) }] }
}
const practiceTest = activityDefinition('spell9-practice', 'تدريب تفاعلي — ثمانية أسئلة', practice)
const quizTest = activityDefinition('spell9-quiz', 'الاختبار الختامي التعليمي — عشرة أسئلة', quiz)

function Explanation({ section }: { section: typeof sections[number] }) {
  return <div className="spell9-stack">{section.paragraphs.map(p => <p key={p}>{p}</p>)}</div>
}

function Comparison() {
  return <div className="spell9-table-wrap"><table><caption>مقارنة الرسم الصحيح والخاطئ في السياقات التي شرحناها</caption>
    <thead><tr><th scope="col">الصحيح</th><th scope="col">الخاطئ في السياق</th><th scope="col">ألف فارقة؟</th><th scope="col">السبب</th></tr></thead>
    <tbody>{comparison.map(r => <tr key={r.correct}><td data-label="الصحيح"><bdi>{r.correct}</bdi></td><td data-label="الخاطئ"><bdi>{r.wrong}</bdi></td><td data-label="ألف فارقة؟">{r.alif}</td><td data-label="السبب">{r.reason}</td></tr>)}</tbody>
  </table></div>
}

function VisualAnalysis() {
  return <section className="spell9-analysis" aria-label="تحليل حروف الأمثلة">
    <h3>تمييز الحروف ووظائفها — ليس باللون وحده</h3>
    <p><bdi>كتب<span className="spell9-waw">و</span><span className="spell9-alif">ا</span></bdi> — الواو المسطّرة: ضمير الجماعة؛ الألف المؤطّرة: فارقة غير منطوقة.</p>
    <p><bdi>يكتب<span className="spell9-waw">و</span><span className="spell9-nun">ن</span></bdi> — الواو ضمير الجماعة؛ النون ذات التسطير المزدوج: علامة الرفع.</p>
    <p><bdi>كتب<span className="spell9-waw">و</span><span className="spell9-pronoun">ه</span></bdi> — الهاء المؤطّرة بإطار متقطع: ضمير المفعول به؛ لا ألف قبلها.</p>
    <p><bdi>يدع<span className="spell9-original">و</span></bdi> — الواو ذات الإطار المنقط أصلية في الفعل وليست واو الجماعة.</p>
    <p>التمييز هنا لتحليل الرسم فقط، وليس إشارات لزيادة صوت عند القراءة.</p>
  </section>
}

export function LessonSpellingNine({ onFinish }: { onFinish?: () => void }) {
  const practiceEngine = useTestEngine(practiceTest)
  const quizEngine = useTestEngine(quizTest)
  const baseEngine = useTestEngine(testDefinition)
  const [submitted, setSubmitted] = useState(false)
  const [homeworkAnswers, setHomeworkAnswers] = useState<Record<string, string>>({})
  const showTestFeedback = submitted && baseEngine.allPagesChecked
  const engine: TestEngine = { ...baseEngine,
    setAnswer(id, index, value) { setSubmitted(false); baseEngine.setAnswer(id, index, value) },
    uncheckPage(id) { setSubmitted(false); baseEngine.uncheckPage(id) },
    resetTest() { setSubmitted(false); baseEngine.resetTest() },
  }
  const explanationSteps: LessonStepDefinition[] = sections.filter(s => !['memory', 'summary'].includes(s.id)).map(s => ({
    id: `spell9-${s.id}`, title: s.title, group: s.group, render: () => <>
      <Explanation section={s} />{s.id === 'definition' && <VisualAnalysis />}
    </>,
  }))
  const steps: LessonStepDefinition[] = [
    ...explanationSteps,
    { id: 'spell9-comparison', title: 'جدول المقارنة الشامل', group: 'القواعد وتطبيقاتها', render: () => <Comparison /> },
    { id: 'spell9-errors', title: 'الأخطاء الشائعة وتصحيحها', group: 'التدريب والتثبيت', render: () => <div className="spell9-stack">{commonErrors.map(r => <article className="spell9-card" key={r.wrong}>
      <div className="spell9-pair"><p><strong>خطأ في السياق:</strong> {r.wrong}</p><p><strong>الصواب:</strong> {r.correct}</p></div><p>{r.reason}</p>
    </article>)}</div> },
    { id: 'spell9-practice', title: 'تدريب تفاعلي: ثمانية أسئلة', group: 'التدريب والتثبيت', render: () => <>
      <p>اختر جوابًا لكل سؤال ثم تحقّق من الإجابات لتعرف السبب. يمكنك التعديل وإعادة التحقق؛ هذه نتيجة تدريب مستقلة عن الاختبار.</p>
      <TestPageView page={practiceTest.pages[0]} engine={practiceEngine} questionTestIdPrefix="spell9-practice" />
    </> },
    { id: 'spell9-memory', title: 'طريقة الحفظ: ثلاثة أسئلة', group: 'التدريب والتثبيت', render: () => <Explanation section={sections.find(s => s.id === 'memory')!} /> },
    { id: 'spell9-quiz', title: 'الاختبار الختامي التعليمي: عشرة أسئلة', group: 'التدريب والتثبيت', render: () => <>
      <p>اختبار تعليمي داخل الدرس، لا يدخل في نتيجة الاختبار المستقل. اختر ثم تحقّق لرؤية التعليل؛ الأسئلة مدققة ولكل منها جواب واحد.</p>
      <TestPageView page={quizTest.pages[0]} engine={quizEngine} questionTestIdPrefix="spell9-quiz" />
    </> },
    { id: 'spell9-homework', title: 'الواجب المنزلي: الإكمال والتصحيح', group: 'التدريب والتثبيت', render: () => <div className="spell9-stack">
      <p>أكمل الصيغة ولا تضف الألف إلى كل واو. اكتب الإجابة والتعليل منفصلين. التصحيح النموذجي لدى المعلم، ويمكنك مراجعة القاعدة قبل التسليم له.</p>
      {['أكمل الصيغة وضع الألف حيث يجب','صحح الجملة مع التعليل'].map(title => <section key={title}><h3>{title}</h3>{homework.filter(q => q.section === title).map(q => <fieldset className="spell9-card" key={q.id}><legend>{q.prompt}</legend>
        {['answer','reason'].map((field, i) => <label key={field} className="spell9-label">{i === 0 ? 'الإجابة أو الجملة المصححة' : 'التعليل: نوع الواو وصيغة الفعل وما يلي الواو'}
          <textarea value={homeworkAnswers[`${q.id}-${field}`] ?? ''} onChange={e => setHomeworkAnswers({ ...homeworkAnswers, [`${q.id}-${field}`]: e.target.value })} />
        </label>)}
      </fieldset>)}</section>)}
    </div> },
    { id: 'spell9-summary', title: 'الخلاصة والقاعدة الذهبية والتمهيد', group: 'الخلاصة', render: () => <Explanation section={sections.find(s => s.id === 'summary')!} /> },
    ...testDefinition.pages.map((page, i) => ({ id: `spell9-test-${i+1}`, title: `اختبار: صفحة ${i+1}`, group: 'الاختبار المستقل', render: () => <>
      <p>اختبار مستقل من ٢٠ سؤالًا، أربع صفحات بخمسة أسئلة. تحقّق من كل صفحة لحفظ تقييمها؛ لا تظهر الحلول أو الدرجة قبل التسليم.</p>
      <TestPageView page={page} engine={engine} revealFeedback={showTestFeedback} questionTestIdPrefix="spell9-question" />
    </> })),
    { id: 'spell9-submit', title: 'تسليم الاختبار والنتيجة', group: 'الاختبار المستقل', render: () => <div>
      <p>الصفحات التي تم التحقق منها: {baseEngine.checkedPageIds.length} من ٤. تعتمد النتيجة على أحدث إجاباتك الصحيحة من حيث التحقق، ولا تتكرر درجات الصفحات.</p>
      <button className="button button--primary" type="button" disabled={!baseEngine.allPagesChecked} onClick={() => setSubmitted(true)}>تسليم الاختبار</button>
      {!baseEngine.allPagesChecked && <p>تحقّق من الصفحات الأربع أولًا. تعديل إجابة يلغي تقييم صفحتها حتى تعيد التحقق.</p>}
      {showTestFeedback && <p role="status" data-testid="spell9-result">النتيجة: {engine.finalResult.correct} من {engine.finalResult.total}</p>}
      <button className="button button--ghost" type="button" onClick={() => engine.resetTest()}>إعادة الاختبار</button>
    </div> },
    { id: 'spell9-solutions', title: 'حلول الاختبارات', group: 'الحلول والإرشاد', render: () => <SolutionsArea test={testDefinition} engine={engine} revealFeedback={showTestFeedback} testId="spell9-solutions" /> },
    { id: 'spell9-teacher', title: 'منطقة المعلم', group: 'الحلول والإرشاد', render: () => <TeacherSpace><div className="spell9-stack" data-testid="spell9-teacher">
      <h3>دليل المعلم — الألف الفارقة بعد واو الجماعة</h3>
      <p>مخرجات التعلم: يحدد الطالب نوع الواو والفاعل وصيغة الفعل، ويعلل الرسم، ويصحح الخطأ دون الخلط بين علامة الإعراب والألف غير المنطوقة. ابدأ بالملاحظة ثم اطلب تعليلًا لا اختيارًا فقط.</p>
      {sections.filter(s => s.id !== 'summary').map(s => <section key={s.id}><h4>{s.title}</h4><Explanation section={s} /></section>)}
      <Comparison />
      {[['حلول التدريب الثمانية', practice], ['حلول الختامي التعليمي العشرة', quiz]].map(([title, items]) => <section key={title as string}><h4>{title as string}</h4><ol>{(items as typeof practice).map(q => <li key={q.id}><p>{q.prompt}</p><p><strong>الإجابة: {q.answer}</strong></p><p>{q.explanation}</p></li>)}</ol></section>)}
      <section><h4>حلول الواجب: ستة إكمالات وأربعة تصحيحات</h4><ol>{homework.map(q => <li key={q.id}><p>{q.prompt}</p><p><strong>{q.answer}</strong></p><p>{q.explanation}</p></li>)}</ol></section>
      <section><h4>تشخيص الأخطاء وعلاجها</h4>
        <p>إذا كتب الطالب يدعوا فاسأله عن عدد الفاعلين ثم قارن الطالب يدعو والطلاب يدعون. إذا كتب كتبو فاطلب تحديد واو الجماعة ثم إعادة الرسم بالألف غير المنطوقة.</p>
        <p>إذا كتب لن يكتبون فاطلب تحديد العامل وعلامة إعراب الأفعال الخمسة ثم حذف النون وكتابة الألف. إذا كتب يكتبوا في الخبر المعتاد فأعد النون لأن الفعل مرفوع بلا عامل.</p>
        <p>إذا كتب كتبواه فاستبدل المفعول الظاهر بهاء: كتبوا الدرس / كتبوه؛ لا تضع ألفًا قبل الضمير. إذا نطق الألف فأعد القراءة دون صوت مستقل بعد الواو، وبيّن أن الرسم ليس إعرابًا ولا صوتًا إضافيًا.</p>
        <p>إذا خلط بين لا النافية والناهية قارن «هم لا يقصرون» خبرًا و«لا تقصروا» نهيًا. وإذا وصف واو يدعو بضمير، قارن فاعل المفرد بالجماعة. اطلب من الطالب تفسير المشتت قبل إعادة المحاولة.</p>
      </section>
      <section><h4>أمثلة إضافية من إعداد المنصة</h4><p>المتطوعون تعاونوا في الحملة. لن يتوقفوا عن العمل. لم يتركوا المكان متسخًا. نظّفوا المكان. التقرير راجعوه. النبات ينمو. المتطوعون يعملون الآن.</p><p>تعاونوا ماضٍ بألف، يتوقفوا منصوب ويتركوا مجزوم بحذف النون مع ألف، نظّفوا أمر، راجعوه بلا ألف قبل الهاء، ينمو بواو أصلية، يعملون بنون الرفع.</p></section>
      <section><h4>التدقيق العلمي والإسناد</h4><p>صُحّح تعريف الجماعة مقابل المثنى، وعنوان المفرد والجمع، ومرجع هاء التدريب الثامن، وسياق السؤال الأول، ورفع يقرؤون، وموضع الطلاب في سؤال لم، وخيارات السؤال الخامس، وتعليمات الواجب والفرق بين اكتبوا واكتبوه. التفاصيل ومفتاح المراجعة في التقرير.</p>
        <p><a href={sourceUrl} download>تنزيل سجل المصدر</a> · <a href={auditUrl} download>تنزيل تقرير التدقيق العلمي</a></p>
        <p>حلول الاختبار المستقل العشرين وتعليلاته في خطوة «حلول الاختبارات» المستقلة بعد التسليم، وليست مكررة هنا. هذه بوابة تنظيم عرض مشتركة لا مصادقة آمنة.</p>
      </section>
    </div></TeacherSpace> },
  ]
  return <div className="spell9-lesson" dir="rtl"><LessonFlow steps={steps} lessonTitle="الألف الفارقة بعد واو الجماعة" lessonNumber="٩" lessonEyebrow="قسم الإملاء" onFinish={onFinish} /></div>
}
