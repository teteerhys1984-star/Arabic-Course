import { useState, type ReactNode } from 'react'
import { LessonFlow, type LessonStepDefinition } from '../shared/components/LessonFlow'
import { TeacherSpace } from '../shared/teacher/TeacherSpace'
import {
  SolutionsArea,
  TestPageView,
  type TestDefinition,
  type TestEngine,
  useTestEngine,
} from '../shared/test'
import {
  challengeTest,
  commonMistakes,
  comparisonRows,
  homeworkInstructions,
  homeworkRows,
  lessonTitle,
  nextLessonNote,
  nonTriliteralExamples,
  objectives,
  prefaceRows,
  sentenceAnalyses,
  summary,
  teacherNotes,
  testDefinition as independentTest,
  triliteralExamples,
  weakExamples,
} from './morphology-lesson-12/content'
import auditUrl from '../../docs/lesson-sarf-12-audit.md?url'

// eslint-disable-next-line react-refresh/only-export-components -- shared platform test-conformance contract.
export const testDefinition: TestDefinition = independentTest

const challengeQuestions = challengeTest.pages.flatMap((page) => page.questions)

function arabicDigits(value: number | string) {
  return String(value).replace(/[0-9]/g, (digit) => '٠١٢٣٤٥٦٧٨٩'[Number(digit)])
}

type WordTone = 'verb' | 'active' | 'passive' | 'source' | 'weight'
function Word({ text, tone = 'active' }: { text: string; tone?: WordTone }) {
  return <bdi className={`sarf12-word sarf12-word--${tone}`} dir="rtl" lang="ar">{text}</bdi>
}

function Sentence({ children }: { children: string }) {
  return <bdi className="sarf12-sentence" dir="rtl" lang="ar">{children}</bdi>
}

function Table({
  caption,
  columns,
  rows,
  testId,
}: {
  caption: string
  columns: readonly string[]
  rows: readonly { key: string; cells: ReactNode[] }[]
  testId?: string
}) {
  return <div className="sarf12-table-wrap">
    <table className="sarf12-table" data-testid={testId}>
      <caption>{caption}</caption>
      <thead><tr>{columns.map((column) => <th key={column} scope="col">{column}</th>)}</tr></thead>
      <tbody>{rows.map((row) => <tr key={row.key}>
        {row.cells.map((cell, index) => index === 0
          ? <th key={`${row.key}-${index}`} scope="row" data-label={columns[index]}>{cell}</th>
          : <td key={`${row.key}-${index}`} data-label={columns[index]}>{cell}</td>)}
      </tr>)}</tbody>
    </table>
  </div>
}

function IntroStep() {
  return <div className="sarf12-hero">
    <p className="sarf12-badge">الدرس ١٢ من قسم الصرف</p>
    <h3>{lessonTitle}</h3>
    <p>تعلّمنا في الدرس السابق اسم الفاعل، وهو ما يدلّ على مَن قام بالفعل. اليوم نسأل سؤالًا مكمّلًا: مَن وقع عليه الفعل، أو ما الذي وقع عليه؟</p>
    <div className="sarf12-opening-trio" aria-label="مقارنة بين الفعل واسم الفاعل واسم المفعول والمصدر">
      {prefaceRows.map((row) => <article key={row.kind} className={`sarf12-opening-card sarf12-opening-card--${row.kind === 'فعل ماضٍ' ? 'verb' : row.kind === 'اسم مفعول' ? 'passive' : row.kind === 'مصدر' ? 'source' : 'active'}`}>
        <span>{row.kind}</span><Word text={row.word} tone={row.kind === 'فعل ماضٍ' ? 'verb' : row.kind === 'اسم مفعول' ? 'passive' : row.kind === 'مصدر' ? 'source' : 'active'} /><p>{row.meaning}</p>
      </article>)}
    </div>
    <h4>أهداف الدرس</h4>
    <ul className="sarf12-objectives">{objectives.map((objective) => <li key={objective}>{objective}</li>)}</ul>
  </div>
}

function DefinitionStep() {
  return <div className="sarf12-stack">
    <div className="sarf12-definition">
      <h3>التعريف</h3>
      <p><strong>اسم المفعول</strong> اسم مشتقّ يدلّ على مَن وقع عليه الفعل أو ما وقع عليه، عندما يسمح معنى الفعل وصيغته بذلك.</p>
    </div>
    <p>تشيع صياغته من الأفعال المتعدّية التي يقع فعلها على شخص أو شيء. أمّا الفعل اللازم، الذي لا يتعدّى إلى مفعول به، فلا نُسقط عليه الصياغة المباشرة آليًا؛ وقد يحتاج المعنى إلى حرف جرّ أو سياق يوضّح العلاقة.</p>
    <p className="sarf12-example-line"><Sentence>كَتَبَ التلميذُ الرسالةَ.</Sentence> الرسالةُ <Word text="مَكْتُوبَةٌ" tone="passive" />: وقع عليها فعل الكتابة.</p>
    <p className="sarf12-example-line"><Sentence>فَتَحَ العاملُ البابَ.</Sentence> البابُ <Word text="مَفْتُوحٌ" tone="passive" />: وقع عليه فعل الفتح.</p>
    <aside className="sarf12-note"><strong>سؤال التحقّق:</strong> في «البابُ مَفْتُوحٌ»، هل الباب هو الذي فتح شيئًا آخر أم هو ما وقع عليه الفتح؟ هو ما وقع عليه؛ لذلك «مَفْتُوح» اسم مفعول.</aside>
  </div>
}

function TriliteralRuleStep() {
  return <div className="sarf12-stack">
    <div className="sarf12-definition sarf12-definition--weight">
      <h3>القاعدة الغالبة</h3>
      <p>يأتي اسم المفعول من الفعل الثلاثي المتعدّي غالبًا على وزن <Word text="مَفْعُول" tone="weight" />.</p>
    </div>
    <p>تُقابل فاءُ الوزن الحرفَ الأصلي الأول، وعينُه الحرفَ الأصلي الثاني، ولامُه الحرفَ الأصلي الثالث. الميم في أول الوزن والواو بعد عين الفعل من بناء الصيغة؛ أمّا حروف الجذر فتبقى هي نفسها.</p>
    <div className="sarf12-weight-map" aria-label="مقابلة جذر كتب بوزن مفعول">
      <article><span>الفعل والجذر</span><Word text="كَتَبَ · ك ـ ت ـ ب" tone="verb" /></article>
      <span className="sarf12-map-arrow" aria-hidden="true">←</span>
      <article><span>الوزن</span><Word text="مَفْعُول" tone="weight" /></article>
      <span className="sarf12-map-arrow" aria-hidden="true">←</span>
      <article className="sarf12-weight-result"><span>الصيغة الناتجة</span><Word text="مَكْتُوب" tone="passive" /></article>
    </div>
    <ul className="sarf12-list">
      <li>الكاف تقابل فاء الكلمة، والتاء تقابل عينها، والباء تقابل لامها.</li>
      <li>الميم زائدة في أول الصيغة، والواو جزء من بناء وزن مَفْعُول.</li>
      <li>لا نُقطّع الكلمة إلى أجزاء كتابية قد توهم تغيّر الجذر؛ نُظهر المقابلة بين مواضع الوزن والجذر ثم نقرأ الصيغة كاملة.</li>
    </ul>
    <aside className="sarf12-note"><strong>تنبيه:</strong> كلمة «غالبًا» مقصودة. يلزم أن يسمح الفعل بمعنى المفعول، والأفعال المعتلّة لها صور خاصة سيأتي منها أمثلة مستقلة.</aside>
  </div>
}

function TriliteralTableStep() {
  return <div className="sarf12-stack">
    <p>قارن بين الصيغتين: اسم الفاعل يدلّ على مَن قام بالفعل، واسم المفعول يدلّ على ما وقع عليه. ركّز على نوع الكلمة والحركات، لا على تشابه الجذر وحده.</p>
    <Table
      caption="أمثلة اسم المفعول من الأفعال الثلاثية الواردة في الدرس"
      testId="sarf12-triliteral-table"
      columns={['الفعل الثلاثي', 'اسم الفاعل', 'اسم المفعول', 'مثال في سياق']}
      rows={triliteralExamples.map((item) => ({
        key: item.id,
        cells: [
          <Word text={item.verb} tone="verb" />,
          <Word text={item.active} tone="active" />,
          <Word text={item.passive} tone="passive" />,
          <Sentence>{item.sentence}</Sentence>,
        ],
      }))}
    />
    <p className="sarf12-table-hint">تظهر أسماء الأنواع نصًّا في عناوين الأعمدة؛ اللون مساعد وليس الوسيلة الوحيدة للتمييز.</p>
  </div>
}

function NonTriliteralStep() {
  return <div className="sarf12-stack">
    <div className="sarf12-definition sarf12-definition--weight">
      <h3>قاعدة الصياغة القياسية</h3>
      <ol className="sarf12-list">
        <li>نأتي بمضارع الفعل غير الثلاثي، في الاستعمال الذي يقبل معنى اسم المفعول.</li>
        <li>نُبدل حرف المضارعة ميمًا مضمومة.</li>
        <li>نفتح الحرف الذي قبل الآخر في الصيغة الناتجة.</li>
      </ol>
    </div>
    <Table
      caption="الماضي ← المضارع ← اسم الفاعل واسم المفعول — من غير الثلاثي"
      testId="sarf12-nontriliteral-table"
      columns={['الماضي', 'المضارع', 'اسم الفاعل (كسر ما قبل الآخر)', 'اسم المفعول (فتح ما قبل الآخر)', 'السياق والتنبيه']}
      rows={nonTriliteralExamples.map((item) => ({
        key: item.id,
        cells: [
          <Word text={item.verb} tone="verb" />,
          <Word text={item.present} tone="verb" />,
          <Word text={item.active} tone="active" />,
          <Word text={item.passive} tone="passive" />,
          <span>{item.note}{item.sentence && <span className="sarf12-context"><br /><strong>مثال/تنبيه:</strong> <Sentence>{item.sentence}</Sentence></span>}</span>,
        ],
      }))}
    />
    <div className="sarf12-contrast" aria-label="مقارنة بين صيغ اسم الفاعل واسم المفعول">
      <article><Word text="مُكْرِم" tone="active" /><strong>اسم فاعل</strong><span>الراء مكسورة: مَن يقوم بالإكرام.</span></article>
      <article><Word text="مُكْرَم" tone="passive" /><strong>اسم مفعول</strong><span>الراء مفتوحة: مَن وقع عليه الإكرام.</span></article>
      <article><Word text="مُعَلِّم" tone="active" /><strong>اسم فاعل</strong><span>اللام مشدّدة مكسورة: مَن يعلّم.</span></article>
      <article><Word text="مُعَلَّم" tone="passive" /><strong>اسم مفعول بحسب السياق</strong><span>اللام مشدّدة مفتوحة: ما وقع عليه التعليم.</span></article>
    </div>
    <aside className="sarf12-note"><strong>الحركة تغيّر الصيغة:</strong> مُكْرِم ≠ مُكْرَم، ومُعَلِّم ≠ مُعَلَّم. ومن غير الثلاثي لا نكتفي بالميم المضمومة؛ يجب الانتباه إلى فتح ما قبل الآخر في اسم المفعول.</aside>
  </div>
}

function WeakVerbsStep() {
  return <div className="sarf12-stack">
    <p>قد يتغيّر بناء اسم المفعول من الفعل المعتلّ. الأمثلة الآتية صحيحة، لكن لا تُعامل كقاعدة واحدة تُطبّق آليًا على كل فعل معتلّ.</p>
    <Table
      caption="صيغ مدقّقة من أفعال أجوف وناقصة"
      testId="sarf12-weak-table"
      columns={['الفعل', 'نوع الاعتلال', 'اسم المفعول', 'تنبيه وصياغة السياق']}
      rows={weakExamples.map((item) => ({
        key: item.id,
        cells: [
          <Word text={item.verb} tone="verb" />,
          item.kind,
          <Word text={item.passive} tone="passive" />,
          <span>{item.note}<span className="sarf12-context"><br /><strong>مثال:</strong> <Sentence>{item.sentence}</Sentence></span></span>,
        ],
      }))}
    />
    <aside className="sarf12-note"><strong>للحفظ دون تعميم:</strong> قالَ ← مَقُول، باعَ ← مَبِيع، دَعا ← مَدْعُوّ، رَمى ← مَرْمِيّ. يُذكر هنا التغيير على مستوى المثال فقط؛ ولا نختلق قاعدة مختصرة بديلة عن دراسة الإعلال.</aside>
  </div>
}

function IdentifyStep() {
  return <div className="sarf12-stack">
    <h3>خطوات عملية</h3>
    <ol className="sarf12-identify-steps">
      <li><strong>اسأل عن المعنى:</strong> مَن قام بالفعل؟ وما أو مَن وقع عليه؟</li>
      <li><strong>حدّد الفعل:</strong> اربط الصيغة بالفعل الذي اشتُقّت منه، وانتبه إلى الثلاثي وغير الثلاثي.</li>
      <li><strong>افحص البناء والحركة:</strong> من الثلاثي المتعدّي غالبًا مَفْعُول؛ ومن غير الثلاثي ميم مضمومة وفتح ما قبل الآخر.</li>
      <li><strong>تحقّق من السياق:</strong> قد يوضّح حرف الجر أو الجملة العلاقة، وخصوصًا مع الفعل أَحْسَنَ.</li>
    </ol>
    <div className="sarf12-analysis-grid">
      {sentenceAnalyses.map((item) => <article className="sarf12-analysis-card" key={item.id} data-testid={`sarf12-analysis-${item.id}`}>
        <h3><Sentence>{item.sentence}</Sentence></h3>
        <p>{item.focus}</p>
        <p className="sarf12-analysis-answer">{item.participle}</p>
      </article>)}
    </div>
  </div>
}

function ComparisonStep() {
  return <div className="sarf12-stack">
    <p>قد تجتمع في جذر واحد صيغٌ تسمي الحدث أو الفاعل أو من وقع عليه الفعل. قارن:</p>
    <Table
      caption="الفعل واسم الفاعل واسم المفعول والمصدر — أمثلة من جذر واحد"
      testId="sarf12-comparison-table"
      columns={['الكلمة', 'نوعها', 'دلالتها']}
      rows={comparisonRows.map((row, index) => ({
        key: `${index}-${row.form}`,
        cells: [
          <Word text={row.form} tone={row.kind === 'الفعل' ? 'verb' : row.kind === 'اسم فاعل' ? 'active' : row.kind === 'اسم مفعول' ? 'passive' : 'source'} />,
          row.kind,
          row.meaning,
        ],
      }))}
    />
    <div className="sarf12-contrast sarf12-contrast--three" aria-label="مقارنة مستقلة بين اسم الفاعل واسم المفعول والمصدر">
      <article><strong>اسم الفاعل: مَن قام بالفعل؟</strong><Word text="كاتِب" tone="active" /><span>مَن يكتب.</span></article>
      <article><strong>اسم المفعول: ما الذي وقع عليه الفعل؟</strong><Word text="مَكْتُوب" tone="passive" /><span>ما وقعت عليه الكتابة.</span></article>
      <article><strong>المصدر: ما اسم الحدث نفسه؟</strong><Word text="كِتابة" tone="source" /><span>حدث الكتابة.</span></article>
    </div>
    <aside className="sarf12-note"><strong>مفتاح التحليل:</strong> لا تحكم من اللون أو شكل الميم وحدهما؛ اجمع بين الصيغة والحركات والمعنى والسياق.</aside>
  </div>
}

function MistakesStep() {
  return <div className="sarf12-mistakes">
    {commonMistakes.map((mistake, index) => <article className="sarf12-mistake" key={mistake.error}>
      <span className="sarf12-mistake-number" aria-hidden="true">{arabicDigits(index + 1)}</span>
      <p><strong>الخطأ:</strong> {mistake.error}</p>
      <p><strong>التصحيح:</strong> {mistake.correction}</p>
      <p>{mistake.reason}</p>
    </article>)}
  </div>
}

function ChallengeStep({ engine }: { engine: TestEngine }) {
  const page = challengeTest.pages[0]
  const answered = challengeQuestions.filter((question) => (engine.answers[`${question.id}:0`] ?? []).length > 0).length
  const checked = engine.pageResults[page.id]
  return <div className="sarf12-assessment" data-testid="sarf12-challenge">
    <p>اختر إجابة واحدة لكل سؤال، ثم استخدم آلية التصحيح المشتركة. لا تظهر الإجابة الصحيحة ولا الدرجة قبل التصحيح. بعده يظهر تفسير كل سؤال، بما فيه سبب خطأ البدائل.</p>
    <p className="sarf12-progress" role="status" data-testid="sarf12-challenge-progress">
      {checked ? 'نتيجة التحدّي بعد التصحيح:' : 'الإجابات المختارة:'}{' '}
      <bdi dir="ltr">{checked ? `${checked.correct} / 8` : `${answered} / 8`}</bdi>
    </p>
    <TestPageView page={page} engine={engine} questionTestIdPrefix="sarf12-challenge-question" />
    <button type="button" className="button button--ghost" onClick={engine.resetTest}>إعادة محاولة التحدّي</button>
  </div>
}

function ExamSubmitStep({
  engine,
  submitted,
  onSubmit,
  onReset,
}: {
  engine: TestEngine
  submitted: boolean
  onSubmit: () => void
  onReset: () => void
}) {
  const result = engine.finalResult
  return <section className="sarf12-assessment sarf12-submit" aria-label="تسليم الاختبار الختامي والنتيجة" data-testid="sarf12-exam-submit">
    <p>الاختبار ١٥ سؤالًا في ٤ صفحات: ٥ + ٤ + ٣ + ٣. تحقّق من كل صفحة قبل التسليم؛ لا تكشف آلية التحقق صحة الإجابات أو الحلول.</p>
    <p>الصفحات التي تم التحقق منها: <bdi dir="ltr">{arabicDigits(engine.checkedPageIds.length)} / ٤</bdi>.</p>
    <p>جميع أسئلة هذا الاختبار من نوع الاختيار المحدّد وتُصحّح آليًا؛ لا توجد إجابة إنشائية أو درجة تنتظر مراجعة يدوية.</p>
    {!submitted ? <button type="button" className="button button--primary" disabled={!engine.allPagesChecked} onClick={onSubmit}>تسليم الاختبار وإظهار النتيجة</button> : <div className="sarf12-result" role="status" data-testid="sarf12-exam-result">
      <h3>نتيجة الاختبار المستقل</h3>
      <p className="sarf12-score"><bdi dir="ltr">{arabicDigits(result.correct)} / ١٥</bdi></p>
      <p>صحيحة: <bdi>{arabicDigits(result.correct)}</bdi> · غير صحيحة: <bdi>{arabicDigits(result.wrong)}</bdi> · لم تُجب: <bdi>{arabicDigits(result.unanswered)}</bdi></p>
      <p>لا توجد أسئلة للمراجعة اليدوية. افتح خطوة الحلول لقراءة القاعدة وخطوات الاشتقاق لكل سؤال.</p>
    </div>}
    <button type="button" className="button button--ghost" onClick={onReset}>إعادة الاختبار</button>
  </section>
}

function HomeworkStep({
  answers,
  setAnswers,
  showSolutions,
  setShowSolutions,
}: {
  answers: Record<string, { active: string; passive: string }>
  setAnswers: (value: (current: Record<string, { active: string; passive: string }>) => Record<string, { active: string; passive: string }>) => void
  showSolutions: boolean
  setShowSolutions: (value: boolean | ((current: boolean) => boolean)) => void
}) {
  const ready = homeworkRows.every((row) => Boolean(answers[row.id]?.active.trim() && answers[row.id]?.passive.trim()))
  const update = (id: string, field: 'active' | 'passive', value: string) => {
    setAnswers((current) => ({ ...current, [id]: { ...(current[id] ?? { active: '', passive: '' }), [field]: value } }))
    setShowSolutions(false)
  }
  const rows = homeworkRows.map((row) => ({
    key: row.id,
    cells: [
      <Word text={row.verb} tone="verb" />,
      <label className="sarf12-homework-label"><span className="sarf12-visually-hidden">اسم الفاعل من {row.verb}</span><input aria-label={`اسم الفاعل من ${row.verb}`} dir="rtl" lang="ar" value={answers[row.id]?.active ?? ''} placeholder="اسم الفاعل" onChange={(event) => update(row.id, 'active', event.target.value)} /></label>,
      <label className="sarf12-homework-label"><span className="sarf12-visually-hidden">اسم المفعول من {row.verb}</span><input aria-label={`اسم المفعول من ${row.verb}`} dir="rtl" lang="ar" value={answers[row.id]?.passive ?? ''} placeholder="اسم المفعول" onChange={(event) => update(row.id, 'passive', event.target.value)} /></label>,
    ],
  }))
  return <div className="sarf12-stack" data-testid="sarf12-homework">
    <p>{homeworkInstructions}</p>
    <Table caption="جدول الواجب: اكتب اسم الفاعل واسم المفعول" columns={['الفعل', 'اسم الفاعل', 'اسم المفعول']} rows={rows} testId="sarf12-homework-table" />
    <p className="sarf12-progress" role="status" data-testid="sarf12-homework-progress">اكتملت محاولة <bdi dir="ltr">{homeworkRows.filter((row) => answers[row.id]?.active.trim() && answers[row.id]?.passive.trim()).length} / ٥</bdi> أفعال.</p>
    <button type="button" className="button button--primary" disabled={!ready} aria-expanded={showSolutions} aria-controls="sarf12-homework-solutions" onClick={() => setShowSolutions((current) => !current)}>{showSolutions ? 'إخفاء الحلول النموذجية' : 'عرض الحلول بعد المحاولة'}</button>
    <p className="sarf12-muted">يُفتح الزر بعد ملء الحقول العشرة؛ تغيير أي إجابة يخفي النموذج إلى أن تطلب عرضه من جديد.</p>
    {showSolutions && <div id="sarf12-homework-solutions" data-testid="sarf12-homework-solutions">
      <h3>الحلول النموذجية مع التعليل</h3>
      <Table caption="اسم الفاعل واسم المفعول لكل فعل" columns={['الفعل', 'اسم الفاعل', 'اسم المفعول', 'طريقة الاشتقاق']} rows={homeworkRows.map((row) => ({
        key: row.id,
        cells: [<Word text={row.verb} tone="verb" />, <Word text={row.active} tone="active" />, <Word text={row.passive} tone="passive" />, row.explanation],
      }))} />
    </div>}
  </div>
}

function TeacherSection({ title, children }: { title: string; children: ReactNode }) {
  return <details className="sarf12-teacher-section"><summary>{title}</summary><div>{children}</div></details>
}

function TeacherGuide() {
  return <TeacherSpace><div className="sarf12-teacher" data-testid="sarf12-teacher-material">
    <h3>منطقة المعلم — {lessonTitle}</h3>
    <p>المادة هنا منفصلة عن واجهة الطالب ومقفلة بالبوابة المشتركة للمعلم. الأسئلة الختامية وحلولها لا تُعرض للطالب قبل الإجراء المعتمد في الاختبار.</p>
    <TeacherSection title="١. إجابات التحدّي الثمانية وتفسير المشتّتات">
      <SolutionsArea test={challengeTest} mode="teacher" title="مفتاح تحدّي اسم المفعول — ٨ أسئلة" />
    </TeacherSection>
    <TeacherSection title="٢. إجابات الاختبار المستقل — ١٥ سؤالًا وحلول الاشتقاق">
      <SolutionsArea test={testDefinition} mode="teacher" title="نموذج إجابة الاختبار المستقل — ١٥ سؤالًا" />
    </TeacherSection>
    <TeacherSection title="٣. حل الواجب المنزلي كاملًا">
      <Table caption="النموذج الكامل للواجب وتعليل كل فعل" columns={['الفعل', 'اسم الفاعل', 'اسم المفعول', 'التحليل']} rows={homeworkRows.map((row) => ({
        key: row.id,
        cells: [<Word text={row.verb} tone="verb" />, <Word text={row.active} tone="active" />, <Word text={row.passive} tone="passive" />, row.explanation],
      }))} testId="sarf12-teacher-homework" />
    </TeacherSection>
    <TeacherSection title="٤. تحليل أمثلة الثلاثي العشرة">
      <p>في كل فعل ثلاثي متعدٍّ، نقابل حروف الجذر بمواضع ف ـ ع ـ ل في مَفْعُول. يُذكر أن الوزن غالب لا مطّرد على كل معنى وفعل، ويُحفظ الأصل دون تفكيك كتابي مضلّل.</p>
      <Table caption="الجذر واسم الفاعل واسم المفعول والمثال" columns={['الفعل', 'الجذر', 'اسم الفاعل', 'اسم المفعول', 'التطبيق']} rows={triliteralExamples.map((row) => ({
        key: row.id,
        cells: [<Word text={row.verb} tone="verb" />, <Word text={row.root} tone="weight" />, <Word text={row.active} tone="active" />, <Word text={row.passive} tone="passive" />, <Sentence>{row.sentence}</Sentence>],
      }))} testId="sarf12-teacher-triliteral" />
    </TeacherSection>
    <TeacherSection title="٥. تحليل غير الثلاثي والحركات">
      <Table caption="الماضي والمضارع واسم الفاعل واسم المفعول" columns={['الماضي', 'المضارع', 'اسم الفاعل', 'اسم المفعول', 'تنبيه'] } rows={nonTriliteralExamples.map((row) => ({
        key: row.id,
        cells: [<Word text={row.verb} tone="verb" />, <Word text={row.present} tone="verb" />, <Word text={row.active} tone="active" />, <Word text={row.passive} tone="passive" />, row.note],
      }))} />
      <div className="sarf12-teacher-vowels"><p><Word text="مُكْرِم" tone="active" />: الراء مكسورة، فاسم فاعل.</p><p><Word text="مُكْرَم" tone="passive" />: الراء مفتوحة، فاسم مفعول.</p><p><Word text="مُعَلِّم" tone="active" />: اللام مشدّدة مكسورة، فاسم فاعل.</p><p><Word text="مُعَلَّم" tone="passive" />: اللام مشدّدة مفتوحة، فاسم مفعول بحسب السياق.</p></div>
    </TeacherSection>
    <TeacherSection title="٦. الأفعال المعتلّة: الصيغة وسبب التغيير">
      <Table caption="صيغ اسم المفعول من أربعة أفعال معتلّة" columns={['الفعل', 'نوعه', 'الصيغة', 'ملاحظة صرفية وسياقية']} rows={weakExamples.map((row) => ({
        key: row.id,
        cells: [<Word text={row.verb} tone="verb" />, row.kind, <Word text={row.passive} tone="passive" />, <>{row.note}<br /><strong>السياق:</strong> <Sentence>{row.sentence}</Sentence></>],
      }))} testId="sarf12-teacher-weak" />
      <p>«مَقُول» و«مَبِيع» من الأجوف، و«مَدْعُوّ» و«مَرْمِيّ» من الناقص. هذه أمثلة صحيحة للحفظ، وليست دعوة لاختراع قاعدة واحدة أو إسقاط كل تفاصيل الإعلال على هذا الدرس التأسيسي.</p>
    </TeacherSection>
    <TeacherSection title="٧. تحليل الجمل الأساسية والتمييز بين المشتقّات">
      <Table caption="الجمل التي وردت في الدرس وتحليل موضع اسم المفعول" columns={['الجملة', 'التحليل الصرفي والدلالي']} rows={sentenceAnalyses.map((row) => ({
        key: row.id,
        cells: [<Sentence>{row.sentence}</Sentence>, <>{row.focus}<br /><strong>{row.participle}</strong></>],
      }))} testId="sarf12-teacher-sentences" />
      <Table caption="مواضع الخلط الشائعة وتصويبها" columns={['الخطأ', 'التصويب', 'سبب الخلط']} rows={commonMistakes.map((row, index) => ({
        key: `mistake-${index}`,
        cells: [row.error, row.correction, row.reason],
      }))} testId="sarf12-teacher-mistakes" />
    </TeacherSection>
    <TeacherSection title="٨. ملاحظات تدريسية حول الحركات والحدود">
      <ul className="sarf12-list">{teacherNotes.map((note) => <li key={note}>{note}</li>)}</ul>
      <p>مرجع النطاق هو طلب المهمة؛ لا يوجد في المستودع مخطوط كامل مستقل للدرس، لذا يوثّق تقرير التدقيق مراجعة مسوّدة التنفيذ، ولا ينسب إضافة أو قاعدة إلى كتاب غير متاح.</p>
      <a href={auditUrl} download="lesson-sarf-12-audit.md"><bdi dir="ltr">docs/lesson-sarf-12-audit.md</bdi> — تنزيل تقرير التدقيق</a>
    </TeacherSection>
  </div></TeacherSpace>
}

export function LessonMorphologyTwelve({ onProgressChange, onFinish }: { onProgressChange?: (value: number) => void; onFinish?: () => void }) {
  const challengeEngine = useTestEngine(challengeTest)
  const examEngine = useTestEngine(testDefinition)
  const [examSubmitted, setExamSubmitted] = useState(false)
  const [showSolutions, setShowSolutions] = useState(false)
  const [homeworkAnswers, setHomeworkAnswers] = useState<Record<string, { active: string; passive: string }>>({})
  const [showHomeworkSolutions, setShowHomeworkSolutions] = useState(false)

  const guardedExamEngine: TestEngine = {
    ...examEngine,
    setAnswer(questionId, fieldIndex, value) {
      setExamSubmitted(false)
      setShowSolutions(false)
      examEngine.setAnswer(questionId, fieldIndex, value)
    },
    uncheckPage(pageId) {
      setExamSubmitted(false)
      setShowSolutions(false)
      examEngine.uncheckPage(pageId)
    },
    resetTest() {
      setExamSubmitted(false)
      setShowSolutions(false)
      examEngine.resetTest()
    },
  }
  const submitted = examSubmitted && examEngine.allPagesChecked
  const steps: LessonStepDefinition[] = [
    { id: 'sarf12-intro', title: 'تمهيد: مَن قام بالفعل ومَن وقع عليه؟', group: 'المدخل والتعريف', icon: '١', render: () => <IntroStep /> },
    { id: 'sarf12-definition', title: 'تعريف اسم المفعول', group: 'المدخل والتعريف', icon: '٢', render: () => <DefinitionStep /> },
    { id: 'sarf12-triliteral-rule', title: 'صياغته من الفعل الثلاثي', group: 'الصياغة', icon: '٣', render: () => <TriliteralRuleStep /> },
    { id: 'sarf12-triliteral-table', title: 'أمثلة الثلاثي واسم الفاعل', group: 'الصياغة', icon: '٣', render: () => <TriliteralTableStep /> },
    { id: 'sarf12-nontriliteral', title: 'صياغته من غير الثلاثي', group: 'الصياغة', icon: '٤', render: () => <NonTriliteralStep /> },
    { id: 'sarf12-weak', title: 'الأفعال المعتلّة', group: 'الصيغ الخاصة', icon: '٥', render: () => <WeakVerbsStep /> },
    { id: 'sarf12-identify', title: 'تمييز اسم المفعول في الجملة', group: 'التحليل والتطبيق', icon: '٦', render: () => <IdentifyStep /> },
    { id: 'sarf12-compare', title: 'الفاعل والمفعول والمصدر', group: 'التحليل والتطبيق', icon: '٧', render: () => <ComparisonStep /> },
    { id: 'sarf12-mistakes', title: 'أخطاء شائعة', group: 'التحليل والتطبيق', icon: '٨', render: () => <MistakesStep /> },
    { id: 'sarf12-challenge', title: 'تحدٍّ تفاعلي — ٨ أسئلة', group: 'تدرّب واختبر', icon: '٩', render: () => <ChallengeStep engine={challengeEngine} /> },
    ...testDefinition.pages.map((page) => ({
      id: `sarf12-exam-${page.id}`,
      title: page.title,
      group: 'الاختبار المستقل — ١٥ سؤالًا',
      icon: '◇',
      render: () => <div className="sarf12-assessment sarf12-exam-page">
        <p>{testDefinition.description}</p>
        <TestPageView page={page} engine={guardedExamEngine} questionTestIdPrefix="sarf12-exam-question" revealFeedback={submitted} />
      </div>,
    })),
    { id: 'sarf12-exam-submit', title: 'تسليم الاختبار والنتيجة', group: 'الاختبار المستقل — ١٥ سؤالًا', icon: '✓', render: () => <ExamSubmitStep engine={examEngine} submitted={submitted} onSubmit={() => { setExamSubmitted(true); setShowSolutions(false) }} onReset={guardedExamEngine.resetTest} /> },
    { id: 'sarf12-exam-solutions', title: 'حلول الاختبار المستقل', group: 'الاختبار المستقل — ١٥ سؤالًا', icon: '▤', render: () => <div className="sarf12-assessment">
      <p>تُفتح الحلول بعد تسليم الاختبار كاملًا. عند تعديل إجابة، تُخفى النتيجة والحلول حتى تعيد التحقق من الصفحة وتسليم المحاولة المحدّثة.</p>
      <button type="button" className="button button--primary" disabled={!submitted} aria-expanded={submitted && showSolutions} onClick={() => setShowSolutions((current) => !current)}>{showSolutions && submitted ? 'إخفاء نموذج الإجابة' : 'كشف نموذج الإجابة'}</button>
      <SolutionsArea test={testDefinition} engine={guardedExamEngine} title="الحلول النموذجية للاختبار المستقل — ١٥ سؤالًا" revealFeedback={submitted && showSolutions} />
    </div> },
    { id: 'sarf12-homework', title: 'الواجب المنزلي', group: 'واجب وخلاصة', icon: '١٠', render: () => <HomeworkStep answers={homeworkAnswers} setAnswers={setHomeworkAnswers} showSolutions={showHomeworkSolutions} setShowSolutions={setShowHomeworkSolutions} /> },
    { id: 'sarf12-summary', title: 'خلاصة الدرس للحفظ', group: 'واجب وخلاصة', icon: '١١', render: () => <div className="sarf12-summary-cards">{summary.map((item, index) => <article key={item}><span>{arabicDigits(index + 1)}</span><p>{item}</p></article>)}</div> },
    { id: 'sarf12-next', title: 'الانتقال إلى الدرس التالي', group: 'الختام', icon: '→', render: () => <div className="sarf12-next-step">
      <h3>أحسنت! أتممتَ درس اسم المفعول.</h3><p>{nextLessonNote}</p>
      <p>يُستخدم زر «إتمام الدرس» للعودة إلى قسم الصرف واختيار درس متاح من شبكته. لا يوجد هنا تسجيل أو محتوى للدرس الثالث عشر.</p>
    </div> },
    { id: 'sarf12-teacher', title: 'منطقة المعلم', group: 'دليل المعلم', icon: '◆', render: () => <TeacherGuide /> },
  ]

  return <div className="sarf12-lesson" dir="rtl">
    <LessonFlow steps={steps} onProgressChange={onProgressChange} onFinish={onFinish} lessonTitle={lessonTitle} lessonNumber="١٢" lessonEyebrow="قسم الصرف" />
  </div>
}
