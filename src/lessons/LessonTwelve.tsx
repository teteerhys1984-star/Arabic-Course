import { useState } from 'react'
import { LessonFlow, type LessonStepDefinition } from '../shared/components/LessonFlow'
import { TeacherSpace } from '../shared/teacher/TeacherSpace'
import { SolutionsArea, TestPageView, useTestEngine, type TestDefinition } from '../shared/test'
import { title, objectives, marks, teachingSections, challengeTest, testDefinition as independentTest, homework, summary, type Example, type TeachingSection } from './lesson-twelve/content'
import './lesson-twelve/lesson.css'

// eslint-disable-next-line react-refresh/only-export-components -- shared test conformance contract
export const testDefinition: TestDefinition = independentTest

function Examples({ items }: { items: Example[] }) {
  return <div className="twelve-examples">{items.map((item) => <article className="twelve-card" key={item.sentence}>
    <h4><bdi>{item.sentence}</bdi></h4>
    <ol aria-label={`إعراب ${item.sentence}`}>{item.parsing.map((line) => <li key={line}>{line}</li>)}</ol>
  </article>)}</div>
}

function Teaching({ section }: { section: TeachingSection }) {
  return <section className={`twelve-teaching twelve-${section.tone ?? 'neutral'}`}>
    <p className="twelve-goal"><strong>هدف الخطوة:</strong> {section.goal}</p>
    {section.paragraphs.map((text) => <p key={text}>{text}</p>)}
    {section.examples && <Examples items={section.examples} />}
  </section>
}

function Comparison() {
  return <div className="twelve-comparison">
    <p>دلالة العدد ليست علامة الإعراب. نقرأ المفرد والصياغة والسياق أولًا، ثم نختار العلامة.</p>
    <div className="twelve-table-wrap"><table className="twelve-table">
      <caption>مقارنة علامات إعراب الأنواع الثلاثة — الرفع ثم النصب ثم الجر</caption>
      <thead><tr><th scope="col">النوع ودلالته</th><th scope="col">الرفع</th><th scope="col">النصب</th><th scope="col">الجر</th></tr></thead>
      <tbody>{marks.map((row) => <tr key={row.type} className={`twelve-${row.tone}`}>
        <th scope="row">{row.type}<small>{row.count}</small></th>
        {row.signs.map((sign, i) => <td key={i} data-label={['الرفع', 'النصب', 'الجر'][i]}><strong>{sign}</strong><bdi>{row.forms[i]}</bdi></td>)}
      </tr>)}</tbody>
    </table></div>
    <p className="twelve-note">في الأمثلة المعرّفة بـ«الـ» أعلاه لا تنوين. إذا نُكّر جمع المؤنث السالم نقول: طالباتٌ في الرفع، وطالباتٍ في النصب والجر. لا نخلط بين الحروف المكتوبة والحركة الإعرابية.</p>
  </div>
}

function VisualIntro() {
  return <>
    <div className="twelve-hero"><p>الدرس الثاني عشر من قسم الأساسيات والنحو · الدرس ١٢ من ١٦</p>
      <h3>رحلة ممتعة في قواعد اللغة العربية</h3><p>واحد، اثنان، أكثر من اثنين! سنتعلّم كيف نميّز الأعداد وصيغ الأسماء، ثم نعرف علاماتها في الجملة.</p></div>
    <div className="twelve-visual" role="list" aria-label="من كتاب واحد إلى كتابين ثم كتب">
      {[{ n: 1, word: 'كتابٌ', kind: 'مفرد', tone: 'neutral' }, { n: 2, word: 'كتابانِ', kind: 'مثنّى', tone: 'dual' }, { n: 5, word: 'كُتُبٌ', kind: 'جمع تكسير', tone: 'masculine' }].map((item) => <article role="listitem" key={item.word} className={`twelve-card twelve-${item.tone}`}>
        <svg viewBox="0 0 200 100" role="img" aria-label={item.n === 1 ? 'كتاب واحد يمثّل المفرد' : item.n === 2 ? 'كتابان يمثّلان المثنّى' : 'خمسة كتب تمثّل الجمع'}>
          {Array.from({ length: item.n }, (_, i) => <g key={i} transform={`translate(${100 - item.n * 16 + i * 32}, 15)`}><rect width="26" height="66" rx="4" fill="currentColor" /><path d="M6 4 V61 M10 12 H21 M10 18 H21" stroke="#fff" strokeWidth="2" /></g>)}
        </svg>
        <h4><bdi>{item.word}</bdi></h4><p>{item.kind}</p>
      </article>)}
    </div>
    <section className="twelve-card"><h4>أهداف الدرس</h4><ul>{objectives.map((item) => <li key={item}>{item}</li>)}</ul></section>
  </>
}

function Homework({ answers = false }: { answers?: boolean }) {
  return <div className="twelve-table-wrap" data-testid={answers ? 'twelve-homework-answers' : 'twelve-homework'}>
    <table className="twelve-table"><caption>{answers ? 'الحلول النموذجية — الصيغ في الرفع وتعليل الاختيار' : 'حوّل المفرد إلى المثنّى في الرفع والجمع السالم المناسب في الرفع، واكتب إجاباتك في دفترك'}</caption>
      <thead><tr><th scope="col">المفرد</th><th scope="col">المثنّى في الرفع</th><th scope="col">الجمع المناسب</th>{answers && <th scope="col">التعليل</th>}</tr></thead>
      <tbody>{homework.map((row) => <tr key={row.singular}><th scope="row">{row.singular}</th>
        <td data-label="المثنّى في الرفع">{answers ? row.dual : '…………'}</td><td data-label="الجمع المناسب">{answers ? row.plural : '…………'}</td>
        {answers && <td data-label="التعليل">{row.reason}</td>}</tr>)}</tbody>
    </table>
  </div>
}

function TeacherGuide() {
  return <TeacherSpace><div data-testid="twelve-teacher-guide" className="twelve-stack">
    <h3>دليل المعلم — {title}</h3>
    <aside className="twelve-note"><h4>المصدر وحدود الإثراء</h4><p>المادة التعليمية المرسلة في المهمة هي المصدر الأساسي، وليست إحالة إلى كتاب غير مرفق. توضيح الشروط وتصحيح «مع» وضبط الأفعال والإعراب الكامل ومفاتيح الحلول إضافات تدقيق وتعليم من المنصة. الاختيارات في الاختبار تحويل تفاعلي لأسئلة المادة، وليست نصًّا من كتاب.</p></aside>
    <h4>الشرح العلمي الكامل وجداول العلامات</h4>
    {teachingSections.map((section) => <section key={section.id}><h4>{section.title}</h4><Teaching section={section} /></section>)}
    <Comparison />
    <SolutionsArea test={challengeTest} mode="teacher" title="حلول التحدّي الثمانية مع التفسير" />
    <SolutionsArea test={testDefinition} mode="teacher" title="نموذج إجابة الاختبار الختامي — ١٦ سؤالًا" />
    <Homework answers />
    <aside className="twelve-note"><h4>ملاحظات تدريسية وأخطاء متوقعة</h4><ul>
      <li>اسأل عن الوظيفة النحوية قبل العلامة: قد تكون الكسرة علامة نصب أو جر. لا تستنتج الحالة من الحركة وحدها.</li>
      <li>قارن ـَيْنِ في المثنّى بـ ـينَ في الجمع، واضبط النون ولا تجعل حركتها علامة إعراب الاسم.</li>
      <li>ميّز تاء الفاعل في «سلّمتُ» من تاء التأنيث في «كرَّمَتِ المدرسةُ»، والكسر العارض في الوصل لا يعني جر الفعل.</li>
      <li>لا تعمّم الجمع بالواو والنون على كل اسم مذكر، ولا تحصر جمع المؤنث السالم في الإناث العاقلات؛ شجرات مثال من المادة.</li>
      <li>أسئلة الإعراب ١١–١٣ تُراجع يدويًا: افحص الفعل وبناءه والتاء، والوظيفة والعلامة وسببها لكل اسم. الدرجة الآلية لا تحكم على جودة الإعراب المكتوب.</li>
    </ul></aside>
  </div></TeacherSpace>
}

export function LessonTwelve({ onFinish }: { onFinish?: () => void }) {
  const practice = useTestEngine(challengeTest)
  const exam = useTestEngine(testDefinition)
  const [submittedAnswers, setSubmittedAnswers] = useState<typeof exam.answers | null>(null)
  const [showSolutions, setShowSolutions] = useState(false)
  const [showHomework, setShowHomework] = useState(false)
  // The submitted snapshot must still be the latest answer map; any edit revokes disclosure.
  const submitted = submittedAnswers === exam.answers && exam.allPagesChecked
  const steps: LessonStepDefinition[] = [
    { id: 'intro', title: 'تمهيد بصري وأهداف الدرس', group: 'العدد والصيغة', render: () => <VisualIntro /> },
    ...teachingSections.slice(0, 9).map((section) => ({ id: section.id, title: section.title, group: 'القواعد والأمثلة', render: () => <Teaching section={section} /> })),
    { id: 'comparison', title: 'المقارنة الشاملة', group: 'الربط والتطبيق', render: () => <Comparison /> },
    ...teachingSections.slice(9).map((section) => ({ id: section.id, title: section.title, group: 'الربط والتطبيق', render: () => <Teaching section={section} /> })),
    { id: 'challenge', title: 'تحدّي القواعد — ٨ أسئلة', group: 'تدرّب', render: () => <>
      <p>اختر الإجابة الصحيحة ثم اطلب التصحيح. لن تُكشف الإجابة قبل الضغط على زر التحقق. يمكنك التصحيح ولو بقيت أسئلة دون إجابة، ثم التعديل وإعادة المحاولة.</p>
      <p role="status" data-testid="twelve-challenge-progress">{practice.allPagesChecked ? 'نتيجتك' : 'أجبت عن'}: <bdi>{practice.allPagesChecked ? practice.finalResult.correct : Object.values(practice.answers).filter((v) => v.length > 0).length} / 8</bdi></p>
      <TestPageView page={challengeTest.pages[0]} engine={practice} />
      <button type="button" className="button button--ghost" onClick={practice.resetTest}>إعادة محاولة التحدّي</button>
    </> },
    ...testDefinition.pages.map((page, i) => ({ id: `exam-${i + 1}`, title: page.title, group: 'الاختبار المستقل', render: () => <>
      <p>{testDefinition.description}</p><TestPageView page={page} engine={exam} revealFeedback={false} />
    </> })),
    { id: 'submit', title: 'تسليم الاختبار والنتيجة', group: 'الاختبار المستقل', render: () => <>
      <p>تحقّق من صفحات الاختبار الأربع أولًا، ثم سلّمها. النتيجة مبنية على أحدث تحقق صالح لكل صفحة، ولا تتضاعف بإعادة التحقق.</p>
      <p>الصفحات المحفوظة: <bdi>{exam.checkedPageIds.length} / 4</bdi></p>
      <button type="button" className="button button--primary" disabled={!exam.allPagesChecked} onClick={() => { setSubmittedAnswers(exam.answers); setShowSolutions(false) }}>تسليم الاختبار</button>
      {submitted && <div role="status" className="twelve-note" data-testid="twelve-result"><p>الإجابات الصحيحة آليًا: <bdi>{exam.finalResult.correct} / 13</bdi>؛ غير الصحيحة: {exam.finalResult.wrong}؛ غير المجابة: {exam.finalResult.unanswered}؛ إجابات الإعراب المسجلة للمراجعة اليدوية: {exam.finalResult.manual} من 3.</p><p>لا تشمل الدرجة الآلية جودة إعراب الأسئلة ١١–١٣. راجع نموذج الإجابة مع معلمك. عدد أسئلة الاختبار الكلي ١٦.</p></div>}
      <button type="button" className="button button--ghost" onClick={() => { exam.resetTest(); setSubmittedAnswers(null); setShowSolutions(false) }}>إعادة ضبط الاختبار</button>
    </> },
    { id: 'solutions', title: 'منطقة حلول الاختبار المستقل', group: 'المراجعة', render: () => <>
      <button type="button" className="button button--primary" disabled={!submitted} aria-expanded={showSolutions && submitted} onClick={() => setShowSolutions((value) => !value)}>{showSolutions && submitted ? 'إخفاء نموذج الإجابة' : 'كشف نموذج الإجابة'}</button>
      <SolutionsArea test={testDefinition} engine={exam} revealFeedback={submitted && showSolutions} />
    </> },
    { id: 'homework', title: 'الواجب المنزلي وجدول التحويل', group: 'المراجعة', render: () => <>
      <Homework /><button type="button" className="button button--primary" aria-expanded={showHomework} aria-controls="twelve-homework-solutions" onClick={() => setShowHomework((value) => !value)}>{showHomework ? 'إخفاء الحلول النموذجية' : 'عرض الحلول النموذجية'}</button>
      <div id="twelve-homework-solutions">{showHomework && <Homework answers />}</div>
    </> },
    { id: 'summary', title: 'خلاصة الدرس للحفظ', group: 'الخاتمة', render: () => <><h3>تذكّر القاعدة والسبب</h3><ul>{summary.map((item) => <li key={item}>{item}</li>)}</ul><Comparison /></> },
    { id: 'teacher', title: 'منطقة المعلم', group: 'دليل التدريس', render: () => <TeacherGuide /> },
    { id: 'next', title: 'تمهيد للدرس الثالث عشر', group: 'الدرس التالي', render: () => <div className="twelve-hero">
      <h3>من نوع الاسم إلى علامة إعرابه</h3><p>في الدرس الثالث عشر سندرس علامات الإعراب الفرعية بالتفصيل، ونربطها بما تعلّمناه اليوم:</p>
      <ul><li>الألف في رفع المثنّى.</li><li>الواو في رفع جمع المذكر السالم.</li><li>الياء في نصب المثنّى وجمع المذكر السالم وجرّهما.</li><li>الكسرة التي تنوب عن الفتحة في نصب جمع المؤنث السالم.</li></ul>
      <p>بهذا ننتقل من معرفة أنواع الأسماء إلى فهم علامات إعرابها واستخدامها بصورة صحيحة. هذا تمهيد فقط، وليس إنشاءً للدرس ١٣.</p>
    </div> },
  ]
  return <div className="twelve-lesson" dir="rtl"><LessonFlow steps={steps} lessonTitle={title} lessonNumber="١٢" lessonEyebrow="قسم الأساسيات والنحو" onFinish={onFinish} /></div>
}
