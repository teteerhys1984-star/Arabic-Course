import { useState } from 'react'
import { LessonFlow, type LessonStepDefinition } from '../shared/components/LessonFlow'
import { TeacherSpace } from '../shared/teacher/TeacherSpace'
import { SolutionsArea, TestPageView, useTestEngine, type TestDefinition } from '../shared/test'
import {
  title, objectives, marks, originalMarks, shiftPairs, methodSteps, commonErrors,
  teachingSections, challengeTest, testDefinition as independentTest, homework, summary,
  type Example, type TeachingSection,
} from './lesson-thirteen/content'
import './lesson-thirteen/lesson.css'

// eslint-disable-next-line react-refresh/only-export-components -- shared test conformance contract
export const testDefinition: TestDefinition = independentTest

function Examples({ items }: { items: Example[] }) {
  return <div className="thirteen-examples">{items.map((item) => <article className="thirteen-card" key={item.sentence}>
    <h4><bdi>{item.sentence}</bdi></h4>
    {item.focus && <p className="thirteen-focus">الكلمة المستهدفة: <strong><bdi>{item.focus}</bdi></strong></p>}
    <ol aria-label={`إعراب ${item.sentence}`}>{item.parsing.map((line) => <li key={line}>{line}</li>)}</ol>
  </article>)}</div>
}

function Teaching({ section }: { section: TeachingSection }) {
  return <section className={`thirteen-teaching thirteen-${section.tone ?? 'neutral'}`}>
    <p className="thirteen-goal"><strong>هدف الخطوة:</strong> {section.goal}</p>
    {section.paragraphs.map((text) => <p key={text}>{text}</p>)}
    {section.bullets && <ul>{section.bullets.map((item) => <li key={item}>{item}</li>)}</ul>}
    {section.examples && <Examples items={section.examples} />}
  </section>
}

function MarksTable() {
  return <div className="thirteen-comparison">
    <p>القاعدة الذهبية للحفظ: نوع الكلمة مع موقعها يحددان العلامة. اقرأ الجدول من اليمين إلى اليسار: النوع ← الرفع ← النصب ← الجر.</p>
    <div className="thirteen-table-wrap"><table className="thirteen-table">
      <caption>مقارنة علامات الإعراب الفرعية للأنواع الثلاثة — الرفع ثم النصب ثم الجر</caption>
      <thead><tr><th scope="col">النوع</th><th scope="col">الرفع</th><th scope="col">النصب</th><th scope="col">الجر</th></tr></thead>
      <tbody>{marks.map((row) => <tr key={row.type} className={`thirteen-${row.tone}`}>
        <th scope="row">{row.type}<small>{row.count}</small></th>
        {row.signs.map((sign, i) => <td key={i} data-label={['الرفع', 'النصب', 'الجر'][i]}><strong>{sign}</strong><bdi>{row.forms[i]}</bdi></td>)}
      </tr>)}</tbody>
    </table></div>
    <ul>{marks.map((row) => <li key={row.memory}><bdi>{row.memory}</bdi></li>)}</ul>
  </div>
}

function ReviewTable() {
  return <div className="thirteen-table-wrap"><table className="thirteen-table">
    <caption>علامات الإعراب الأصلية في اسم واحد: كلمة «الطالب» لا تتغيّر، وآخرها يتغيّر بالموقع</caption>
    <thead><tr><th scope="col">موقع الكلمة</th><th scope="col">الكلمة</th><th scope="col">علامة الإعراب</th></tr></thead>
    <tbody>{originalMarks.map((row) => <tr key={row.state}>
      <th scope="row" data-label="موقع الكلمة">{row.state}</th>
      <td data-label="الكلمة"><bdi>{row.word}</bdi></td>
      <td data-label="علامة الإعراب">{row.sign}</td>
    </tr>)}</tbody>
  </table></div>
}

function ShiftTable() {
  return <div className="thirteen-table-wrap"><table className="thirteen-table">
    <caption>لماذا اختلفت العلامة؟ لأن النوع اختلف: الموقع نفسه (الرفع) وعلامتان مختلفتان</caption>
    <thead><tr><th scope="col">الكلمة</th><th scope="col">نوعها</th><th scope="col">موقعها</th><th scope="col">علامتها</th></tr></thead>
    <tbody>{shiftPairs.map((row) => <tr key={row.word}>
      <th scope="row" data-label="الكلمة"><bdi>{row.word}</bdi></th>
      <td data-label="نوعها">{row.type}</td>
      <td data-label="موقعها">الرفع</td>
      <td data-label="علامتها">{row.mark} — {row.state}</td>
    </tr>)}</tbody>
  </table></div>
}

function ErrorsList() {
  return <div className="thirteen-errors">{commonErrors.map((error) => <article className="thirteen-card" key={error.wrong}>
    <p className="thirteen-wrong">❌ <bdi>{error.wrong}</bdi></p>
    <p className="thirteen-right">✅ <bdi>{error.right}</bdi></p>
    <p>{error.reason}</p>
  </article>)}</div>
}

function VisualIntro() {
  return <>
    <div className="thirteen-hero"><p>الدرس الثالث عشر من قسم الأساسيات والنحو</p>
      <h3>علامات الإعراب الفرعية</h3>
      <p>بعد أن تعلّمنا المثنّى وجمع المذكر السالم وجمع المؤنث السالم، سنتعرّف الآن كيف تتغيّر علامات إعرابها عن العلامات الأصلية: الألف والواو والياء والكسرة النائبة.</p>
    </div>
    <div className="thirteen-visual" role="list" aria-label="من الضمة إلى الألف إلى الواو: العلامة تتغيّر بتغيّر النوع">
      {[
        { glyph: 'بُ', word: 'الطالبُ', kind: 'مفرد — الضمة', tone: 'neutral' },
        { glyph: 'أ', word: 'الطالبانِ', kind: 'مثنّى — الألف', tone: 'dual' },
        { glyph: 'و', word: 'المعلّمونَ', kind: 'جمع مذكر سالم — الواو', tone: 'masculine' },
      ].map((item) => <article role="listitem" key={item.word} className={`thirteen-card thirteen-${item.tone}`}>
        <svg viewBox="0 0 120 100" role="img" aria-label={`بطاقة تعرض ${item.word} كنموذج لعلامة ${item.kind}`}>
          <rect x="20" y="12" width="80" height="76" rx="10" fill="currentColor" opacity="0.16" />
          <text x="60" y="62" textAnchor="middle" fontSize="34" fill="currentColor">{item.glyph}</text>
        </svg>
        <h4><bdi>{item.word}</bdi></h4><p>{item.kind}</p>
      </article>)}
    </div>
    <section className="thirteen-card"><h4>أهداف الدرس</h4><ul>{objectives.map((item) => <li key={item}>{item}</li>)}</ul></section>
  </>
}

function Homework({ answers = false }: { answers?: boolean }) {
  return <div className="thirteen-table-wrap" data-testid={answers ? 'thirteen-homework-answers' : 'thirteen-homework'}>
    <table className="thirteen-table"><caption>{answers ? 'حلول نموذجية من المنصة — جمل وإعراب كامل' : 'اكتب ثلاث جمل عن المدرسة كما في الواجب، وسمِّ الكلمة المطلوبة، ثم أعربها إعرابًا كاملًا في دفترك'}</caption>
      <thead><tr><th scope="col">المطلوب</th><th scope="col">{answers ? 'جملة نموذجية' : 'جملتك'}</th><th scope="col">{answers ? 'الإعراب الكامل' : 'الإعراب'}</th></tr></thead>
      <tbody>{homework.map((row) => <tr key={row.requirement}><th scope="row">{row.requirement}</th>
        <td data-label={answers ? 'جملة نموذجية' : 'جملتك'}>{answers ? <bdi>{row.model}</bdi> : '…………'}</td>
        <td data-label={answers ? 'الإعراب الكامل' : 'الإعراب'}>{answers ? <ol>{row.parsing.map((line) => <li key={line}>{line}</li>)}</ol> : '…………'}</td>
      </tr>)}</tbody>
    </table>
    {answers && <p className="thirteen-note">هذه الحلول نموذجية من المنصة؛ يُقبل من الطالب أي جملة صحيحة تحقق المطلوب مع إعراب كامل.</p>}
  </div>
}

function TeacherGuide() {
  return <TeacherSpace><div data-testid="thirteen-teacher-guide" className="thirteen-stack">
    <h3>دليل المعلم — {title}</h3>
    <aside className="thirteen-note"><h4>المصدر وحدود الإثراء</h4><p>المادة التعليمية المرسلة في المهمة هي المصدر الأساسي، وليست إحالة إلى كتاب غير مرفق. التصحيحات التوثيقية الخمسة (ت-1 … ت-5) مثبتة في docs/lesson-13-subordinate-inflection-marks-audit.md: إعادة صياغة «كرّمتِ المديرةُ»، وتوحيد رسم الباء في «مررتُ بـ»، وتفريق تاء التأنيث من تاء المخاطبة في «وصلتِ المعلّمتانِ»، واستكمال إعراب «مع» ظرفًا مضافًا لا حرف جر، وإضافة الإعراب الكامل للأمثلة. مفاتيح التدريب الثمانية مستنتجة من شرح الدرس نفسه وموسومة إضافة منصة، ومفاتيح الاختبار ١–٢٠ من مفتاح المعلّم في المصدر.</p></aside>
    <h4>الشرح العلمي الكامل وجداول العلامات</h4>
    {teachingSections.map((section) => <section key={section.id}><h4>{section.title}</h4><Teaching section={section} /></section>)}
    <MarksTable />
    <h4>خطوات الإعراب المنهجية</h4>
    <ol>{methodSteps.map((step) => <li key={step}>{step}</li>)}</ol>
    <SolutionsArea test={challengeTest} mode="teacher" title="حلول التدريب الثمانية مع التفسير" />
    <SolutionsArea test={testDefinition} mode="teacher" title="نموذج إجابة الاختبار النهائي — ٢٠ سؤالًا و٢٠ درجة" />
    <Homework answers />
    <aside className="thirteen-note"><h4>ملاحظات تدريسية وأخطاء متوقعة</h4><ul>
      <li>اسأل عن النوع قبل العلامة: الموقع وحده لا يكفي؛ «الطالبُ» و«الطالبانِ» في موقع الرفع وعلامتاهما مختلفتان.</li>
      <li>ميّز تاء التأنيث من تاء المخاطبة في الأفعال مثل «وصلتِ» و«نجحتِ»؛ الكسرة على التاء عارضة في الوصل وليست علامة إعراب.</li>
      <li>لا تصف «مع» بأنها حرف جر؛ هي ظرف منصوب مضاف، والاسم بعدها مضاف إليه مجرور بالكسرة أو بالياء حسب نوعه.</li>
      <li>الكسرة في جمع المؤنث السالم ملتبسة: قد تكون نصبًا نيابةً عن الفتحة وقد تكون جرًّا؛ تدرّب على سؤال «ما موقع الكلمة؟» قبل «ما حركتها؟».</li>
      <li>الأسئلة ١١–١٦ إعراب إنشائي بمراجعة يدوية: افحص الوظيفة والحالة والعلامة والسبب؛ الدرجة الآلية لا تحكم على جودة الإعراب. في أسئلة التصحيح ١٧–٢٠ تُقبل صيغ معدودة للجملة الصحيحة أو الكلمة المصححة؛ إذا قدم الطالب تصحيحًا صحيحًا بديلًا فاقبله يدويًا ووثّقه.</li>
    </ul></aside>
  </div></TeacherSpace>
}

export function LessonThirteen({ onFinish }: { onFinish?: () => void }) {
  const practice = useTestEngine(challengeTest)
  const exam = useTestEngine(testDefinition)
  const [submittedAnswers, setSubmittedAnswers] = useState<typeof exam.answers | null>(null)
  const [showSolutions, setShowSolutions] = useState(false)
  const [showHomework, setShowHomework] = useState(false)
  // The submitted snapshot must still be the latest answer map; any edit revokes disclosure.
  const submitted = submittedAnswers === exam.answers && exam.allPagesChecked
  const practicePage = challengeTest.pages[0]
  const answeredPractice = Object.values(practice.answers).filter((value) => value.length > 0).length
  const steps: LessonStepDefinition[] = [
    { id: 'intro', title: 'تمهيد بصري وأهداف الدرس', group: 'المقدمة', render: () => <VisualIntro /> },
    { id: 'review-table', title: 'جدول العلامات الأصلية', group: 'المقدمة', render: () => <ReviewTable /> },
    ...teachingSections.slice(0, 8).map((section) => ({ id: section.id, title: section.title, group: 'القواعد والأمثلة', render: () => <Teaching section={section} /> })),
    { id: 'shift', title: 'الفكرة الأساسية: النوع يغيّر العلامة', group: 'القواعد والأمثلة', render: () => <ShiftTable /> },
    ...teachingSections.slice(8).map((section) => ({ id: section.id, title: section.title, group: 'الربط والتطبيق', render: () => <Teaching section={section} /> })),
    { id: 'comparison-table', title: 'جدول المقارنة الشاملة', group: 'الربط والتطبيق', render: () => <MarksTable /> },
    { id: 'errors-table', title: 'الأخطاء الثلاثة في بطاقات', group: 'الربط والتطبيق', render: () => <ErrorsList /> },
    { id: 'challenge', title: 'ثامنًا: اختبر فهمك — ٨ أسئلة', group: 'تدرّب', render: () => <>
      <p>اختر الإجابة الصحيحة لكل سؤال، ثم اضغط «صحّح إجاباتي» لتصحيح إجاباتك فورًا مع التفسير التعليمي. يمكنك التعديل وإعادة التصحيح، ثم إعادة المحاولة من الصفر.</p>
      <p role="status" data-testid="thirteen-challenge-progress">اختبر فهمك — {practice.allPagesChecked ? 'نتيجتك' : 'أجبت عن'}: <bdi>{practice.allPagesChecked ? practice.finalResult.correct : answeredPractice} / 8</bdi></p>
      <TestPageView page={practicePage} engine={practice} showActions={false} />
      <div className="thirteen-actions">
        <button type="button" className="button button--primary" onClick={() => practice.checkPage(practicePage.id)}>صحّح إجاباتي</button>
        <button type="button" className="button button--ghost" onClick={practice.resetTest}>إعادة محاولة التدريب</button>
      </div>
    </> },
    ...testDefinition.pages.map((page, i) => ({ id: `exam-${i + 1}`, title: page.title, group: 'الاختبار المستقل', render: () => <>
      <p>{testDefinition.description}</p>
      <TestPageView page={page} engine={exam} revealFeedback={false} />
    </> })),
    { id: 'submit', title: 'تسليم الاختبار والنتيجة', group: 'الاختبار المستقل', render: () => <>
      <p>تحقّق من صفحات الاختبار الأربع أولًا (زر «تحقّق من الإجابات» يحفظ إجابات الصفحة دون كشف الحلول)، ثم سلّمها. النتيجة مبنية على أحدث تحقق صالح لكل صفحة، ولا تتضاعف بإعادة التحقق.</p>
      <p>الصفحات المحفوظة: <bdi>{exam.checkedPageIds.length} / 4</bdi></p>
      <button type="button" className="button button--primary" disabled={!exam.allPagesChecked} onClick={() => { setSubmittedAnswers(exam.answers); setShowSolutions(false) }}>تسليم الاختبار</button>
      {submitted && <div role="status" className="thirteen-note" data-testid="thirteen-result">
        <p>الدرجة المتحققة آليًا: <bdi>{exam.finalResult.correct} / 14</bdi> من الأسئلة ١–١٠ و١٧–٢٠ (١٤ درجة). غير الصحيحة: {exam.finalResult.wrong}؛ غير المجابة: {exam.finalResult.unanswered}؛ وإجابات الإعراب الست المسجلة للمراجعة اليدوية: <bdi>{exam.finalResult.manual} / 6</bdi>.</p>
        <p>مجموع درجات الاختبار ٢٠ (٥ + ٥ + ٦ + ٤، وسؤال = درجة واحدة). درجات الإعراب ١١–١٦ تُراجع يدويًا وفق نموذج الإجابة في منطقة الحلول والمعلّم.</p>
      </div>}
      <button type="button" className="button button--ghost" onClick={() => { exam.resetTest(); setSubmittedAnswers(null); setShowSolutions(false) }}>إعادة ضبط الاختبار</button>
    </> },
    { id: 'solutions', title: 'منطقة حلول الاختبار المستقل', group: 'المراجعة', render: () => <>
      <p>لا تُعرض الحلول النموذجية للأسئلة العشرين إلا بعد تسليم الاختبار وطلب الكشف.</p>
      <button type="button" className="button button--primary" disabled={!submitted} aria-expanded={showSolutions && submitted} onClick={() => setShowSolutions((value) => !value)}>{showSolutions && submitted ? 'إخفاء نموذج الإجابة' : 'كشف نموذج الإجابة'}</button>
      <SolutionsArea test={testDefinition} engine={exam} revealFeedback={submitted && showSolutions} />
    </> },
    { id: 'homework', title: 'عاشرًا: الواجب المنزلي', group: 'المراجعة', render: () => <>
      <p>واجبك المنزلي: اكتب ثلاث جمل عن المدرسة، بحيث تحتوي الأولى على مثنّى مرفوع، والثانية على جمع مذكر سالم منصوب، والثالثة على جمع مؤنث سالم منصوب. ثم أعرب الكلمات المطلوبة إعرابًا كاملًا.</p>
      <Homework /><button type="button" className="button button--primary" aria-expanded={showHomework} aria-controls="thirteen-homework-solutions" onClick={() => setShowHomework((value) => !value)}>{showHomework ? 'إخفاء الحلول النموذجية' : 'عرض الحلول النموذجية'}</button>
      <div id="thirteen-homework-solutions">{showHomework && <Homework answers />}</div>
    </> },
    { id: 'summary', title: 'عاشرًا: ملخّص الدرس للحفظ', group: 'الخاتمة', render: () => <><h3>القاعدة الذهبية</h3><ul>{summary.map((item) => <li key={item}>{item}</li>)}</ul><MarksTable /></> },
    { id: 'teacher', title: 'قسم خاص بالمعلّم — نموذج الإجابة', group: 'دليل التدريس', render: () => <TeacherGuide /> },
    { id: 'next', title: 'الدرس التالي: الأسماء الخمسة', group: 'الدرس التالي', render: () => <div className="thirteen-hero">
      <h3>الدرس التالي: الأسماء الخمسة</h3>
      <p>الدرس التالي في ترتيب قسم الأساسيات والنحو هو الأسماء الخمسة (أب وأخ وحم وفو وذو)، وكيف تُرفع بالواو وتُنصب بالألف وتُجرّ بالياء — الدرس نفسه الذي مهّدنا له بعلامات الإعراب الفرعية اليوم.</p>
      <p>هذه تمهيد للدرس التالي فقط: لم يُنشأ الدرس ولم يُسجَّل بعد، ولا يظهر له رابط حتى يُضاف لاحقًا.</p>
    </div> },
  ]
  return <div className="thirteen-lesson" dir="rtl"><LessonFlow steps={steps} lessonTitle={title} lessonNumber="١٣" lessonEyebrow="قسم الأساسيات والنحو" onFinish={onFinish} /></div>
}
