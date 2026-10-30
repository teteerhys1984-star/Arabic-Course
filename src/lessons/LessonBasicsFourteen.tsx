import { useState } from 'react'
import { LessonFlow, type LessonStepDefinition } from '../shared/components/LessonFlow'
import { TeacherSpace } from '../shared/teacher/TeacherSpace'
import { SolutionsArea, TestPageView, useTestEngine, type TestDefinition } from '../shared/test'
import {
  title, subtitle, objectives, originalParadigm, fiveNounsParadigm, fiveNouns, namingWhy, signTable,
  goldenRule, subsidiaryNote, abExamples, akhExamples, hamExamples, fuExamples, famExamples,
  dhuExamples, dhuMeaning, conditionList, singularCondition, possessiveCondition,
  notPossessiveCondition, yaaCondition, yaaExplanation, dhuCondition, fuCondition, commonErrors,
  methodSteps, workedExamples, maaAnalysis, comparisonMarks, comparisonNote, comparisonPairs,
  challengeTest, testDefinition as independentTest, homeworkSentences,
  homeworkParsing, compositionModels, homeworkCriteria, mindMap, summary, masteryChallenge,
  masteryCriteria, nextLesson,
  type Example,
} from './basics-lesson-14/content'
import './basics-lesson-14/lesson.css'

// eslint-disable-next-line react-refresh/only-export-components -- shared test conformance contract
export const testDefinition: TestDefinition = independentTest

function Examples({ items, label }: { items: Example[]; label?: string }) {
  return <div className="fourteen-examples">{items.map((item) => <article className="fourteen-card" key={item.sentence}>
    <h4><bdi>{item.sentence}</bdi></h4>
    {item.focus && <p className="fourteen-focus">الكلمة المستهدفة: <strong><bdi>{item.focus}</bdi></strong></p>}
    <ol aria-label={label ? `${label}: ${item.sentence}` : `إعراب ${item.sentence}`}>
      {item.parsing.map((line) => <li key={line}>{line}</li>)}
    </ol>
  </article>)}</div>
}

function FiveNounsTable() {
  return <div className="fourteen-table-wrap"><table className="fourteen-table">
    <caption>الأسماء الخمسة وأمثلتها في جمل</caption>
    <thead><tr><th scope="col">الاسم</th><th scope="col">معناه</th><th scope="col">مثال في جملة</th></tr></thead>
    <tbody>{fiveNouns.map((row) => <tr key={row.name}>
      <th scope="row" data-label="الاسم"><bdi>{row.name}</bdi></th>
      <td data-label="معناه">{row.role}</td>
      <td data-label="مثال في جملة"><bdi>{row.example}</bdi></td>
    </tr>)}</tbody>
  </table></div>
}

function SignsTable() {
  return <div className="fourteen-signs">
    <div className="fourteen-table-wrap"><table className="fourteen-table">
      <caption>علامات إعراب الأسماء الخمسة عند تحقق شروطها</caption>
      <thead><tr><th scope="col">الحالة الإعرابية</th><th scope="col">علامة الإعراب</th><th scope="col">مثال</th></tr></thead>
      <tbody>{signTable.map((row) => <tr key={row.state}>
        <th scope="row" data-label="الحالة الإعرابية">{row.state}</th>
        <td data-label="علامة الإعراب"><strong>{row.sign}</strong></td>
        <td data-label="مثال"><bdi>{row.example}</bdi></td>
      </tr>)}</tbody>
    </table></div>
    <p className="fourteen-rule">{goldenRule}</p>
    <p>{subsidiaryNote}</p>
  </div>
}

function ConditionList() {
  return <ol className="fourteen-conditions">{conditionList.map((condition) => <li key={condition.id}>
    <strong>{condition.title}</strong>
    <span>{condition.summary}</span>
  </li>)}</ol>
}

function ComparisonTable() {
  return <div className="fourteen-table-wrap"><table className="fourteen-table">
    <caption>مقارنة العلامات الأصلية والفرعية: النوع ← الرفع ← النصب ← الجر</caption>
    <thead><tr><th scope="col">نوع الاسم</th><th scope="col">الرفع</th><th scope="col">النصب</th><th scope="col">الجر</th></tr></thead>
    <tbody>{comparisonMarks.map((row) => <tr key={row.type} className={`fourteen-${row.tone}`}>
      <th scope="row" data-label="نوع الاسم">{row.type}</th>
      <td data-label="الرفع">{row.raf}</td>
      <td data-label="النصب">{row.nasb}</td>
      <td data-label="الجر">{row.jarr}</td>
    </tr>)}</tbody>
  </table></div>
}

function ComparisonPairs() {
  return <div className="fourteen-table-wrap"><table className="fourteen-table">
    <caption>الموقع نفسه وعلامتان مختلفتان: الاسم المفرد بإزاء الأسماء الخمسة</caption>
    <thead><tr><th scope="col">الحالة</th><th scope="col">المفرد</th><th scope="col">الأسماء الخمسة</th></tr></thead>
    <tbody>{comparisonPairs.map((row) => <tr key={row.state}>
      <th scope="row" data-label="الحالة">{row.state}</th>
      <td data-label="المفرد"><bdi>{row.original}</bdi></td>
      <td data-label="الأسماء الخمسة"><bdi>{row.five}</bdi></td>
    </tr>)}</tbody>
  </table></div>
}

function ErrorsList() {
  return <div className="fourteen-errors">{commonErrors.map((error) => <article className="fourteen-card" key={error.wrong}>
    <p className="fourteen-wrong">❌ <bdi>{error.wrong}</bdi></p>
    <p className="fourteen-right">✅ <bdi>{error.right}</bdi></p>
    <p>{error.reason}</p>
  </article>)}</div>
}

function VisualIntro() {
  return <>
    <div className="fourteen-hero"><p>الدرس الرابع عشر من قسم الأساسيات والنحو</p>
      <h3>{title}</h3>
      <p className="fourteen-subtitle">{subtitle}</p>
      <p>تعلّمنا في الدروس السابقة أن الاسم المفرد تُغيّر حركة آخره بحسب موقعه. لكن خمسة أسماء فقط تنتهي بالواو والألف والياء بدل الحركات؛ وهي أسماء الأسماء الخمسة. في هذا الدرس نعرفها، ونعرف شروط إعرابها بالحروف.</p>
    </div>
    <div className="fourteen-visual" role="list" aria-label="مقارنة بين إعراب الأب بالحركات وإعراب أبوك بالحروف">
      {[
        { glyph: 'بُ', word: 'الأبُ', kind: 'مفرد غير مضاف — الضمة', tone: 'neutral' },
        { glyph: 'و', word: 'أبوكَ', kind: 'من الأسماء الخمسة — الواو', tone: 'raised' },
        { glyph: 'ا', word: 'أباكَ', kind: 'من الأسماء الخمسة — الألف', tone: 'accused' },
        { glyph: 'ي', word: 'أبيكَ', kind: 'من الأسماء الخمسة — الياء', tone: 'genitive' },
      ].map((item) => <article role="listitem" key={item.word} className={`fourteen-card fourteen-${item.tone}`}>
        <svg viewBox="0 0 120 100" role="img" aria-label={`بطاقة تعرض ${item.word}: ${item.kind}`}>
          <rect x="20" y="12" width="80" height="76" rx="10" fill="currentColor" opacity="0.16" />
          <text x="60" y="62" textAnchor="middle" fontSize="34" fill="currentColor">{item.glyph}</text>
        </svg>
        <h4><bdi>{item.word}</bdi></h4><p>{item.kind}</p>
      </article>)}
    </div>
    <section className="fourteen-card"><h4>أهداف الدرس</h4><ul>{objectives.map((item) => <li key={item}>{item}</li>)}</ul></section>
    <section className="fourteen-card"><h4>التمهيد: الأب غير المضاف</h4>
      <p>هذه هي الطريقة المعتادة في إعراب الاسم المفرد: تتغيّر حركة آخره بحسب موقعه.</p>
      <Examples items={originalParadigm} label="الطريقة المعتادة" />
    </section>
    <section className="fourteen-card"><h4>التمهيد: أبوكَ المضاف</h4>
      <p>وفي هذه الجمل انتهت الكلمة بواو، ثم بألف، ثم بياء. لماذا لم نقل: أبوكَ بالضمة، وأباكَ بالفتحة، وأبيكَ بالكسرة؟ لأن «أب» من الأسماء الخمسة، ولها علامات إعراب خاصة عندما تتحقق شروط معينة. وهذه هي فكرة درسنا.</p>
      <Examples items={fiveNounsParadigm} label="الأسماء الخمسة" />
    </section>
  </>
}

function Homework({ answers = false }: { answers?: boolean }) {
  return <div className="fourteen-stack" data-testid={answers ? 'fourteen-homework-answers' : 'fourteen-homework'}>
    <div className="fourteen-table-wrap"><table className="fourteen-table">
      <caption>{answers ? 'نموذج إجابة النشاط الأول — مع الإعراب الكامل' : 'النشاط الأول: أكمل الجمل بالشكل الصحيح للاسم بين القوسين'}</caption>
      <thead><tr><th scope="col">الجملة</th><th scope="col">{answers ? 'الكلمة الصحيحة' : 'إجابتك'}</th><th scope="col">{answers ? 'الإعراب' : 'ملاحظة'}</th></tr></thead>
      <tbody>{homeworkSentences.map((row) => <tr key={row.prompt}>
        <th scope="row" data-label="الجملة"><bdi>{row.prompt}</bdi></th>
        <td data-label={answers ? 'الكلمة الصحيحة' : 'إجابتك'}>{answers ? <bdi>{row.answer}</bdi> : '…………'}</td>
        <td data-label={answers ? 'الإعراب' : 'ملاحظة'}>{answers ? row.parsing : 'ضع الصورة المناسبة للموقع'}</td>
      </tr>)}</tbody>
    </table></div>
    <div className="fourteen-table-wrap"><table className="fourteen-table">
      <caption>{answers ? 'نموذج إجابة النشاط الثاني — الإعراب الكامل' : 'النشاط الثاني: أعرب الكلمات المحددة إعرابًا كاملًا في دفترك'}</caption>
      <thead><tr><th scope="col">الجملة</th><th scope="col">الكلمة</th><th scope="col">{answers ? 'الإعراب' : 'إجابتك'}</th></tr></thead>
      <tbody>{homeworkParsing.map((row) => <tr key={row.sentence}>
        <th scope="row" data-label="الجملة"><bdi>{row.sentence}</bdi></th>
        <td data-label="الكلمة"><bdi>{row.target}</bdi></td>
        <td data-label={answers ? 'الإعراب' : 'إجابتك'}>{answers ? <ol>{row.parsing.map((line) => <li key={line}>{line}</li>)}</ol> : '…………'}</td>
      </tr>)}</tbody>
    </table></div>
    <section className="fourteen-card">
      <h4>النشاط الثالث: اكتب من إنشائك</h4>
      <p>اكتب خمس جمل من إنشائك، بحيث تحتوي كل جملة على اسم مختلف من الأسماء الخمسة. ثم اختر ثلاث كلمات منها، واجعل الأولى مرفوعة، والثانية منصوبة، والثالثة مجرورة، مع توضيح علامة إعراب كل منها.</p>
      {answers && <ol>{compositionModels.map((row) => <li key={row.name}><bdi>{row.model}</bdi> — <strong>{row.state}</strong>: {row.parsing}</li>)}</ol>}
    </section>
    {answers && <aside className="fourteen-note"><h4>معايير التصحيح</h4><ul>{homeworkCriteria.map((item) => <li key={item}>{item}</li>)}</ul>
      <p>هذه الحلول نموذجية من المنصة؛ يُقبل من الطالب أي جملة صحيحة تحقق المطلوب مع إعراب كامل.</p></aside>}
  </div>
}

function MindMap() {
  return <div className="fourteen-mindmap" role="group" aria-label="الخريطة الذهنية للدرس">
    <p className="fourteen-mindmap__head">{mindMap.head}</p>
    <div className="fourteen-mindmap__branch">
      <h4>الأسماء</h4>
      <ul>{mindMap.names.map((name) => <li key={name}><bdi>{name}</bdi></li>)}</ul>
    </div>
    <div className="fourteen-mindmap__branch">
      <h4>علامات الإعراب</h4>
      <ul>{mindMap.marks.map((mark) => <li key={mark.state}><bdi>{mark.state} ← {mark.sign}</bdi></li>)}</ul>
    </div>
    <div className="fourteen-mindmap__branch">
      <h4>الشروط الأساسية</h4>
      <ul>{mindMap.conditions.map((condition) => <li key={condition}>{condition}</li>)}</ul>
    </div>
  </div>
}

function TeacherGuide() {
  return <TeacherSpace><div data-testid="fourteen-teacher-guide" className="fourteen-stack">
    <h3>دليل المعلم — {title}</h3>
    <aside className="fourteen-note"><h4>المصدر وحدود الإثراء</h4>
      <p>المادة التعليمية المرسلة في المهمة هي المصدر الأساسي، محفوظة حرفيًا في docs/source/lesson-14-five-nouns.md. التصحيحات التوثيقية الستة (ت-1 … ت-6) مثبتة في docs/basics-lesson-14-audit.md: ضبط إعراب «أبي» المضافة إلى ياء المتكلم، وتوحيد إعراب «فاكَ» بدل «فا»، وتصحيح عمود «الاسم المفرد غالبًا» إلى «الاسم المفرد»، وإضافة الإعراب الكامل لكل مثال، وتوضيح أن «مع» ظرف مضاف لا حرف جر، وتحرير مثال «هذا أبو كريمٌ». مفاتيح التدريب الثمانية مستنتجة من شرح الدرس نفسه وموسومة إضافة منصة، ومفاتيح الاختبار ١–٢٠ من مفتاح المعلّم في المصدر.</p>
    </aside>
    <h4>أولًا: التمهيد والأسماء الخمسة</h4>
    <Examples items={[...originalParadigm, ...fiveNounsParadigm]} label="تمهيد" />
    <FiveNounsTable />
    <h4>ثانيًا: لماذا سُمّيت بهذا الاسم؟</h4>
    {namingWhy.paragraphs.map((text) => <p key={text}>{text}</p>)}
    <ul>{namingWhy.bullets.map((item) => <li key={item}>{item}</li>)}</ul>
    <h4>ثالثًا: علامات الإعراب</h4>
    <SignsTable />
    <h4>رابعًا: الأسماء واحدًا واحدًا</h4>
    {[
      { name: 'أب', items: abExamples },
      { name: 'أخ', items: akhExamples },
      { name: 'حم', items: hamExamples },
      { name: 'فو', items: fuExamples },
      { name: 'ذو', items: dhuExamples },
    ].map((group) => <section key={group.name}><h4>{group.name}</h4><Examples items={group.items} label={group.name} /></section>)}
    <h4>«فم» ببقاء الميم</h4>
    <Examples items={famExamples} label="فم" />
    <h4>خامسًا: الشروط الخمسة</h4>
    <ConditionList />
    <h4>الشرطان الأول والثاني</h4>
    <Examples items={[...singularCondition, ...possessiveCondition, ...notPossessiveCondition]} label="مفردة ومضافة" />
    <h4>الشرط الثالث: ياء المتكلم</h4>
    {yaaExplanation.map((text) => <p key={text}>{text}</p>)}
    <Examples items={yaaCondition} label="ياء المتكلم" />
    <h4>الشرطان الرابع والخامس</h4>
    <Examples items={[...dhuCondition, ...fuCondition]} label="ذو وفو" />
    <h4>سادسًا: خطوات الإعراب والأمثلة المحلَّلة</h4>
    <ol>{methodSteps.map((step) => <li key={step}>{step}</li>)}</ol>
    <Examples items={workedExamples} label="خطوة بخطوة" />
    <p className="fourteen-note">{maaAnalysis}</p>
    <h4>سابعًا: المقارنة</h4>
    <ComparisonTable />
    <p>{comparisonNote}</p>
    <ComparisonPairs />
    <h4>ثامنًا: مفاتيح التدريب والاختبار</h4>
    <SolutionsArea test={challengeTest} mode="teacher" title="حلول التدريب الثمانية مع التفسير" />
    <SolutionsArea test={testDefinition} mode="teacher" title="نموذج إجابة الاختبار النهائي — ٢٠ سؤالًا و٢٠ درجة" />
    <Homework answers />
    <aside className="fourteen-note"><h4>ملاحظات تدريسية وأخطاء متوقعة</h4><ul>
      <li>اسأل عن الشرط قبل العلامة: «أبٌ» في «هذا أبٌ كريمٌ» ليست مضافة، فتُعرب بالضمة لا بالواو.</li>
      <li>ياء المتكلم موضع الالتباس الأول: «أبي» في الحالات الثلاث شكلها واحد، والعلامة مقدّرة على ما قبل الياء، ولا يصح وصفها بالواو أو الألف أو الياء الظاهرة.</li>
      <li>«مع» ظرف منصوب مضاف وليست حرف جر؛ والاسم بعدها مضاف إليه مجرور، فانتبه إلى هذا في «تحدّثتُ مع أخيكَ».</li>
      <li>«ذو» لا تدخل الباب إلا بمعنى صاحب؛ واسم الإشارة «ذا» في «ذا كتابٌ مفيدٌ» ليس منها.</li>
      <li>«فو» تُعرب بالحروف بشرط حذف الميم؛ فإذا بقيت الميم («فمٌ») عُربت بالحركات الأصلية.</li>
      <li>الأسئلة ١٠–١٥ إعراب إنشائي بمراجعة يدوية: افحص الوظيفة والحالة والعلامة والسبب؛ الدرجة الآلية لا تحكم على جودة الإعراب. وفي أسئلة التصحيح ١٦–٢٠ تُقبل صيغ معدودة للجملة الصحيحة أو الكلمة المصححة؛ إن قدّم الطالب تصحيحًا صحيحًا بديلًا فاقبله يدويًا ووثّقه.</li>
    </ul></aside>
  </div></TeacherSpace>
}

export function LessonBasicsFourteen({ onFinish }: { onFinish?: () => void }) {
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
    { id: 'intro', title: 'التمهيد: هل تُعرب جميع الأسماء بالطريقة نفسها؟', group: 'المقدمة', render: () => <VisualIntro /> },
    { id: 'what', title: 'ما الأسماء الخمسة؟', group: 'المقدمة', render: () => <>
      <p>الأسماء الخمسة هي خمسة أسماء لها طريقة خاصة في الإعراب، وهي: <bdi>أب</bdi>، و<bdi>أخ</bdi>، و<bdi>حم</bdi>، و<bdi>فو</bdi>، و<bdi>ذو</bdi>.</p>
      <FiveNounsTable />
      <p>لنتعرّف إلى كل اسم منها في الخطوات الخمس التالية، ثم إلى شروط إعرابها بالحروف.</p>
    </> },
    { id: 'why', title: 'لماذا سُمّيت الأسماء الخمسة بهذا الاسم؟', group: 'المقدمة', render: () => <>
      {namingWhy.paragraphs.map((text) => <p key={text}>{text}</p>)}
      <ul>{namingWhy.bullets.map((item) => <li key={item}>{item}</li>)}</ul>
      <div className="fourteen-note">الاسم السادس «هن» يبقى خارج نطاق هذا الدرس؛ والمطلوب إتقان الأسماء الخمسة المدرسية وشروطها.</div>
    </> },
    { id: 'signs', title: 'علامات إعراب الأسماء الخمسة', group: 'المقدمة', render: () => <>
      <p>هذه أهم فقرة في الدرس، ويجب حفظها وفهمها جيدًا: الأسماء الخمسة تُعرب بالحروف بدل الحركات الأصلية عند تحقق شروطها.</p>
      <SignsTable />
      <section className="fourteen-card"><h4>تُرفع بالواو</h4>
        <p>جاء أبوكَ. نسأل: من الذي جاء؟ الجواب: أبوكَ. إذن هو فاعل، والفاعل مرفوع. لكن هل نقول مرفوع بالضمة؟ لا، بل: أبوكَ: فاعل مرفوع، وعلامة رفعه الواو؛ لأنه من الأسماء الخمسة.</p>
        <ul><li>أخوكَ مجتهدٌ.</li><li>جاء حموكَ.</li><li>فوكَ نظيفٌ.</li><li>أنتَ ذو علمٍ.</li></ul>
      </section>
      <section className="fourteen-card"><h4>تُنصب بالألف</h4>
        <p>رأيتُ أباكَ. مَن رأيتُ؟ أباكَ. إذن هو مفعول به، والمفعول به منصوب. لكن علامة نصبه ليست الفتحة بل الألف.</p>
        <ul><li>احترمْ أخاكَ.</li><li>زرتُ حماكَ.</li><li>نظّفْ فاكَ.</li><li>قابلتُ رجلًا ذا علمٍ.</li></ul>
      </section>
      <section className="fourteen-card"><h4>تُجرّ بالياء</h4>
        <p>سلّمتُ على أبيكَ. حرف الجر «على» يجعل الاسم بعده مجرورًا، لكن علامة الجر ليست الكسرة بل الياء.</p>
        <ul><li>لعبتُ مع أخيكَ.</li><li>تحدّثتُ مع حميكَ.</li><li>نظرتُ إلى فيكَ.</li><li>مررتُ برجلٍ ذي علمٍ.</li></ul>
      </section>
      <p className="fourteen-rule">القاعدة الذهبية للحفظ: {goldenRule} كرّرها ثلاث مرات، ثم حاول قولها من دون النظر إلى الدرس.</p>
    </> },
    { id: 'ab', title: 'الاسم الأول: أب', group: 'الأسماء الخمسة واحدًا واحدًا', render: () => <>
      <p>«أب» أكثر هذه الأسماء دورانًا في الكلام. لاحظ تغيّر آخر الكلمة بحسب موقعها: أبوكَ، ثم أباكَ، ثم أبيكَ.</p>
      <Examples items={abExamples} label="أب" />
      <p>وقد تُضاف إلى اسم ظاهر: «جاء أبو الطالبِ» — أبو: فاعل مرفوع بالواو وهو مضاف، والطالبِ: مضاف إليه مجرور.</p>
    </> },
    { id: 'akh', title: 'الاسم الثاني: أخ', group: 'الأسماء الخمسة واحدًا واحدًا', render: () => <>
      <p>«أخ» مثل «أب» في العلامات الثلاث: أخوكَ، وأخاكَ، وأخيكَ.</p>
      <Examples items={akhExamples} label="أخ" />
    </> },
    { id: 'ham', title: 'الاسم الثالث: حم', group: 'الأسماء الخمسة واحدًا واحدًا', render: () => <>
      <p>المقصود بـ«الحَم» أحد أقارب الزوج أو الزوجة، ويُستخدم الاسم في سياقات القرابة والمصاهرة.</p>
      <Examples items={hamExamples} label="حم" />
    </> },
    { id: 'fu', title: 'الاسم الرابع: فو', group: 'الأسماء الخمسة واحدًا واحدًا', render: () => <>
      <p>كلمة «فو» تعني الفم، وتُستعمل ضمن الأسماء الخمسة عندما تتحقق شروطها، وأهمها أن تكون خالية من الميم: فوكَ، وفاكَ، وفيكَ.</p>
      <Examples items={fuExamples} label="فو" />
      <p>انتبه: كلمة «فم» عندما تبقى الميم فيها لا تُعرب إعراب الأسماء الخمسة في القاعدة المدرسية المعتادة، بل تُعرب بالحركات الأصلية.</p>
      <Examples items={famExamples} label="فم" />
    </> },
    { id: 'dhu', title: 'الاسم الخامس: ذو', group: 'الأسماء الخمسة واحدًا واحدًا', render: () => <>
      {dhuMeaning.paragraphs.map((text) => <p key={text}>{text}</p>)}
      <Examples items={dhuExamples} label="ذو" />
      <ul>{dhuMeaning.bullets.map((item) => <li key={item}>{item}</li>)}</ul>
    </> },
    { id: 'conditions', title: 'شروط إعراب الأسماء الخمسة بالحروف', group: 'الشروط الخمسة', render: () => <>
      <p>انتبه جيدًا: ليست كل كلمة من هذه الكلمات تُعرب بالحروف في جميع الحالات. هناك خمسة شروط يجب توافرها.</p>
      <ConditionList />
      <div className="fourteen-card"><h4>خلاصة الشروط</h4><p>حتى تُعرب الأسماء الخمسة بالحروف، تذكّر: أن تكون مفردة، وأن تكون مضافة، وألّا تكون مضافة إلى ياء المتكلم، وأن تكون «ذو» بمعنى صاحب، وأن تكون «فو» خالية من الميم.</p></div>
    </> },
    { id: 'condition-form', title: 'الشرطان الأول والثاني: مفردة ومضافة', group: 'الشروط الخمسة', render: () => <>
      <h4>الشرط الأول: أن تكون مفردة</h4>
      <p>أي ألّا تكون مثنّاة أو مجموعة. لاحظ الفرق في الموقع نفسه (الفاعل) والعلامات المختلفة:</p>
      <Examples items={singularCondition} label="مفردة" />
      <p>إذن، إذا تحوّلت الكلمة إلى المثنّى أو الجمع، فإنها تتبع قواعد ذلك النوع، لا قواعد الأسماء الخمسة.</p>
      <h4>الشرط الثاني: أن تكون مضافة</h4>
      <p>الإضافة تعني أن يأتي بعد الاسم ما يرتبط به ويحدّد معناه، مثل: أبو الطالبِ، وأخو محمدٍ، وذو علمٍ. وقد تتصل الكلمة بضمير، مثل: أبوكَ، وأخوه، وأبونا — وكل هذه تراكيب إضافية.</p>
      <Examples items={possessiveCondition} label="مضافة" />
      <p>أما إذا جاءت الكلمة من دون إضافة، فإنها لا تُعرب بالحروف وفق القاعدة المدرسية المعتادة:</p>
      <Examples items={notPossessiveCondition} label="غير مضافة" />
    </> },
    { id: 'condition-yaa', title: 'الشرط الثالث: ألّا تُضاف إلى ياء المتكلم', group: 'الشروط الخمسة', render: () => <>
      <p>قارن: «جاء أبوك» مرفوع بالواو، أما «جاء أبي» فقد أُضيف إلى ياء المتكلم، فلا يُعرب بالطريقة نفسها.</p>
      <Examples items={yaaCondition} label="ياء المتكلم" />
      <div className="fourteen-note"><h4>القاعدة الدقيقة</h4>
        {yaaExplanation.map((text) => <p key={text}>{text}</p>)}
      </div>
    </> },
    { id: 'condition-dhu-fu', title: 'الشرطان الرابع والخامس: ذو بمعنى صاحب، وفو خالية من الميم', group: 'الشروط الخمسة', render: () => <>
      <h4>الشرط الرابع: أن تكون «ذو» بمعنى «صاحب»</h4>
      <p>«ذو» هنا بمعنى صاحب، ولذلك تُعدّ من الأسماء الخمسة عند تحقق بقية الشروط. أما إذا جاءت كلمة تشبهها في الصورة ولكنها ليست بمعنى «صاحب»، فلا نحكم عليها بأنها من الأسماء الخمسة لمجرد شكلها.</p>
      <Examples items={dhuCondition} label="ذو بمعنى صاحب" />
      <h4>الشرط الخامس: أن تكون «فو» خالية من الميم</h4>
      <p>«فو» في «فوكَ نظيفٌ» تُعرب بالحروف عند تحقق الشروط. أما «فم» في «هذا فمٌ نظيفٌ» فقد بقيت الميم فيها، ولذلك تُعرب بالحركات المعتادة.</p>
      <Examples items={fuCondition} label="فو خالية من الميم" />
    </> },
    { id: 'errors', title: 'أخطاء شائعة يجب أن تتجنبها', group: 'الشروط الخمسة', render: () => <>
      <p>لكل خطأ سبب؛ والتدريب على السبب أنفع من حفظ التصحيح وحده.</p>
      <ErrorsList />
    </> },
    { id: 'method', title: 'كيف نعرب الأسماء الخمسة خطوة بخطوة؟', group: 'التطبيق', render: () => <>
      <p>سنتدرّب على طريقة ثابتة يمكنك استخدامها في أي جملة.</p>
      <ol>{methodSteps.map((step) => <li key={step}>{step}</li>)}</ol>
      <Examples items={workedExamples} label="الإعراب الكامل" />
      <div className="fourteen-note">{maaAnalysis}</div>
    </> },
    { id: 'comparison', title: 'مقارنة بين العلامات الأصلية والفرعية', group: 'التطبيق', render: () => <>
      <p>هذا القسم يربط الدرس الحالي بالدروس السابقة عن علامات الإعراب الأصلية والفرعية.</p>
      <ComparisonTable />
      <p>{comparisonNote}</p>
      <ComparisonPairs />
    </> },
    { id: 'challenge', title: 'تدريب تفاعلي — ٨ أسئلة', group: 'تدرّب', render: () => <>
      <p>حاول حل الأسئلة أولًا، ثم اضغط «صحّح إجاباتي» لتصحيح إجاباتك فورًا مع التفسير التعليمي. لا يظهر أي حل قبل التصحيح، ويمكنك التعديل وإعادة التصحيح، ثم إعادة المحاولة من الصفر.</p>
      <p role="status" data-testid="fourteen-challenge-progress">اختبر فهمك — {practice.allPagesChecked ? 'نتيجتك' : 'أجبت عن'}: <bdi>{practice.allPagesChecked ? practice.finalResult.correct : answeredPractice} / 8</bdi></p>
      <TestPageView page={practicePage} engine={practice} showActions={false} />
      <div className="fourteen-actions">
        <button type="button" className="button button--primary" onClick={() => practice.checkPage(practicePage.id)}>صحّح إجاباتي</button>
        <button type="button" className="button button--ghost" onClick={practice.resetTest}>إعادة محاولة التدريب</button>
      </div>
    </> },
    ...testDefinition.pages.map((page, index) => ({
      id: `exam-${index + 1}`,
      title: page.title,
      group: 'الاختبار المستقل',
      render: () => <>
        <p>{testDefinition.description}</p>
        <TestPageView page={page} engine={exam} revealFeedback={false} />
      </>,
    })),
    { id: 'submit', title: 'تسليم الاختبار والنتيجة', group: 'الاختبار المستقل', render: () => <>
      <p>تحقّق من صفحات الاختبار الأربع أولًا (زر «تحقّق من الإجابات» يحفظ إجابات الصفحة دون كشف الحلول)، ثم سلّمها. النتيجة مبنية على أحدث تحقق صالح لكل صفحة، ولا تتضاعف بإعادة التحقق.</p>
      <p>الصفحات المحفوظة: <bdi>{exam.checkedPageIds.length} / 4</bdi></p>
      <button type="button" className="button button--primary" disabled={!exam.allPagesChecked} onClick={() => { setSubmittedAnswers(exam.answers); setShowSolutions(false) }}>تسليم الاختبار</button>
      {submitted && <div role="status" className="fourteen-note" data-testid="fourteen-result">
        <p>الدرجة المتحققة آليًا: <bdi>{exam.finalResult.correct} / 14</bdi> من الأسئلة ١–٩ و١٦–٢٠ (١٤ درجة). غير الصحيحة: {exam.finalResult.wrong}؛ غير المجابة: {exam.finalResult.unanswered}؛ وإجابات الإعراب الست المسجلة للمراجعة اليدوية: <bdi>{exam.finalResult.manual} / 6</bdi>.</p>
        <p>مجموع درجات الاختبار ٢٠ (٥ + ٤ + ٦ + ٥، وسؤال = درجة واحدة). درجات الإعراب ١٠–١٥ تُراجع يدويًا وفق نموذج الإجابة في منطقة الحلول ومنطقة المعلّم.</p>
      </div>}
      <button type="button" className="button button--ghost" onClick={() => { exam.resetTest(); setSubmittedAnswers(null); setShowSolutions(false) }}>إعادة ضبط الاختبار</button>
    </> },
    { id: 'solutions', title: 'منطقة حلول الاختبار المستقل', group: 'المراجعة', render: () => <>
      <p>لا تُعرض الحلول النموذجية للأسئلة العشرين إلا بعد تسليم الاختبار وطلب الكشف.</p>
      <button type="button" className="button button--primary" disabled={!submitted} aria-expanded={showSolutions && submitted} onClick={() => setShowSolutions((value) => !value)}>{showSolutions && submitted ? 'إخفاء نموذج الإجابة' : 'كشف نموذج الإجابة'}</button>
      <SolutionsArea test={testDefinition} engine={exam} revealFeedback={submitted && showSolutions} />
    </> },
    { id: 'homework', title: 'الواجب المنزلي', group: 'المراجعة', render: () => <>
      <p>واجبك المنزلي ثلاثة أنشطة: أكمل الجمل، وأعرب الكلمات، ثم اكتب من إنشائك. الحلول النموذجية مخفيّة حتى تطلبها.</p>
      <Homework /><button type="button" className="button button--primary" aria-expanded={showHomework} aria-controls="fourteen-homework-solutions" onClick={() => setShowHomework((value) => !value)}>{showHomework ? 'إخفاء الحلول النموذجية' : 'عرض الحلول النموذجية'}</button>
      <div id="fourteen-homework-solutions">{showHomework && <Homework answers />}</div>
    </> },
    { id: 'mindmap', title: 'الخريطة الذهنية والخلاصة وتحدّي الإتقان', group: 'المراجعة', render: () => <>
      <h3>الخريطة الذهنية للدرس</h3>
      <MindMap />
      <h3>خلاصة الدرس للحفظ</h3>
      <ul>{summary.map((item) => <li key={item}>{item}</li>)}</ul>
      <h3>تحدّي الإتقان</h3>
      <p>أعرب الكلمات المحددة في الجمل الآتية دون الرجوع إلى الدرس، ثم قارن إعرابك بالحل:</p>
      <Examples items={masteryChallenge} label="تحدي الإتقان" />
      <p className="fourteen-rule">{masteryCriteria}</p>
    </> },
    { id: 'teacher', title: 'قسم خاص بالمعلّم — نموذج الإجابة', group: 'دليل التدريس', render: () => <TeacherGuide /> },
    { id: 'next', title: 'الدرس التالي: كان وأخواتها', group: 'الدرس التالي', render: () => <div className="fourteen-hero">
      <h3>الدرس التالي: {nextLesson.title}</h3>
      <p>{nextLesson.note}</p>
      <p><a className="button button--secondary fourteen-next-link" href={nextLesson.route}>الانتقال إلى درس «{nextLesson.title}»</a></p>
    </div> },
  ]
  return <div className="fourteen-lesson" dir="rtl">
    <LessonFlow steps={steps} lessonTitle={title} lessonNumber="١٤" lessonEyebrow="قسم الأساسيات والنحو" onFinish={onFinish} />
  </div>
}
