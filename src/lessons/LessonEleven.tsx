import { useState, type ReactNode } from 'react'
import { LessonFlow, type LessonStepDefinition } from '../shared/components/LessonFlow'
import { TeacherSpace } from '../shared/teacher/TeacherSpace'
import { SolutionsArea, TestPageView, useTestEngine, type TestDefinition, type TestEngine } from '../shared/test'
import {
  objectives,
  inflectionExamples,
  originalMarks,
  nominalExamples,
  agentExamples,
  indicativeExamples,
  objectExamples,
  subjunctiveExamples,
  kanaExample,
  prepositions,
  prepositionExamples,
  additionExamples,
  soundEndingPairs,
  jussiveTransformations,
  jussiveExamples,
  caseComparisons,
  parsingSteps,
  workedSentence,
  workedParsing,
  homeworkMarks,
  homeworkBlanks,
  homeworkSentence,
  homeworkParsing,
  practiceQuestions,
  finalQuizQuestions,
  practiceTest,
  finalQuizTest,
  testDefinition as independentTest,
  type AnalysedExample,
  type ParsingRow,
  type SourceQuestion,
} from './lesson-eleven/content'
import './lesson-eleven/lesson.css'

// eslint-disable-next-line react-refresh/only-export-components -- conformance imports the platform assessment schema.
export const testDefinition: TestDefinition = independentTest

function Note({ title, children }: { title: string; children: ReactNode }) {
  return (
    <aside className="eleven-note">
      <h4>{title}</h4>
      <div>{children}</div>
    </aside>
  )
}

/** Emphasise a whole, vowelled word: never split a combining mark from its consonant. */
function FocusSentence({ sentence, focus }: { sentence: string; focus: string }) {
  const start = sentence.indexOf(focus)
  if (start < 0) return <bdi>{sentence}</bdi>
  return (
    <span dir="rtl">
      {sentence.slice(0, start)}
      <strong className="eleven-focus"><bdi>{focus}</bdi></strong>
      {sentence.slice(start + focus.length)}
    </span>
  )
}

function Examples({ items, label }: { items: AnalysedExample[]; label: string }) {
  return (
    <div className="eleven-examples" role="list" aria-label={label}>
      {items.map((item) => (
        <article className="eleven-example" role="listitem" key={item.sentence}>
          <p className="eleven-example__sentence"><FocusSentence sentence={item.sentence} focus={item.focus} /></p>
          <p className="eleven-example__analysis"><strong>الإعراب:</strong> {item.analysis}</p>
          <p><strong>لماذا؟</strong> {item.reason}</p>
        </article>
      ))}
    </div>
  )
}

function MarkCards() {
  return (
    <div className="eleven-marks">
      {originalMarks.map((mark) => (
        <article className="eleven-mark" key={mark.state}>
          <span className="eleven-mark__glyph" aria-hidden="true"><bdi>{mark.glyph}</bdi></span>
          <h4>{mark.sign} — {mark.state}</h4>
          <p><FocusSentence sentence={mark.example} focus={mark.focus} /></p>
          <p>{mark.reason}</p>
        </article>
      ))}
    </div>
  )
}

function MarksTable() {
  return (
    <div className="eleven-table-wrap">
      <table className="eleven-table">
        <caption>علامات الإعراب الأصلية الأربع في الأمثلة المعروضة</caption>
        <thead><tr><th scope="col">الحالة الإعرابية</th><th scope="col">العلامة الأصلية</th><th scope="col">مثال محلل</th></tr></thead>
        <tbody>
          {originalMarks.map((mark) => (
            <tr key={mark.state}>
              <th scope="row" data-label="الحالة الإعرابية">{mark.state}</th>
              <td data-label="العلامة الأصلية">{mark.sign} <bdi className="eleven-table__glyph">{mark.glyph}</bdi></td>
              <td data-label="مثال محلل"><FocusSentence sentence={mark.example} focus={mark.focus} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function PairTable({ title, rows }: { title: string; rows: { before: string; after: string }[] }) {
  return (
    <div className="eleven-table-wrap">
      <table className="eleven-table">
        <caption>{title}</caption>
        <thead><tr><th scope="col">قبل الجزم</th><th scope="col">بعد الجزم</th></tr></thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.before}>
              <th scope="row" data-label="قبل الجزم"><bdi>{row.before}</bdi></th>
              <td data-label="بعد الجزم"><strong><bdi>{row.after}</bdi></strong></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ParsingTable({ sentence, rows }: { sentence: string; rows: ParsingRow[] }) {
  return (
    <div className="eleven-table-wrap">
      <table className="eleven-table eleven-table--parsing">
        <caption>الإعراب الكامل: <bdi>{sentence}</bdi></caption>
        <thead><tr><th scope="col">الكلمة</th><th scope="col">موقعها</th><th scope="col">إعرابها وسبب العلامة</th></tr></thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.word}>
              <th scope="row" data-label="الكلمة"><bdi>{row.word}</bdi></th>
              <td data-label="موقعها">{row.role}</td>
              <td data-label="إعرابها وسبب العلامة">{row.analysis}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function HomeworkAnswers() {
  return (
    <div className="eleven-homework__answers" data-testid="eleven-homework-answers">
      <h4>الحلول النموذجية الكاملة للواجب</h4>
      <h5>السؤال الأول — العلامة وسببها</h5>
      <ol>
        {homeworkMarks.map((item) => <li key={item.target}><bdi>{item.answer}</bdi></li>)}
      </ol>
      <h5>السؤال الثاني — أكمل الفراغ</h5>
      <ol>
        {homeworkBlanks.map((item) => (
          <li key={item.prompt}><strong>{item.answer}</strong>؛ {item.explanation}</li>
        ))}
      </ol>
      <h5>السؤال الثالث — إعراب الجملة كلمةً كلمةً</h5>
      <ParsingTable sentence={homeworkSentence} rows={homeworkParsing} />
    </div>
  )
}

function SourceAnswers({ title, questions }: { title: string; questions: SourceQuestion[] }) {
  return (
    <section>
      <h4>{title}</h4>
      <ol className="eleven-teacher-list">
        {questions.map((item) => (
          <li key={item.id}>
            <p><strong>السؤال:</strong> {item.prompt}</p>
            <p><strong>الهدف:</strong> {item.objective}؛ <strong>الإجابة الصحيحة:</strong> {item.answer}.</p>
            <p><strong>التعليل وتصحيح اللبس:</strong> {item.explanation}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

const teacherExampleGroups: { title: string; examples: AnalysedExample[] }[] = [
  { title: 'تغيّر آخر «الطالب» بحسب الموقع', examples: inflectionExamples },
  { title: 'المبتدأ والخبر', examples: nominalExamples },
  { title: 'الفاعل', examples: agentExamples },
  { title: 'المضارع المرفوع', examples: indicativeExamples },
  { title: 'المفعول به', examples: objectExamples },
  { title: 'المضارع المنصوب بـ«لن، أنْ، كي» وخبر كان', examples: [...subjunctiveExamples, kanaExample] },
  { title: 'الاسم المجرور بحرف الجر', examples: prepositionExamples },
  { title: 'المضاف إليه', examples: additionExamples },
  { title: 'المضارع المجزوم بـ«لم» و«لا» الناهية', examples: jussiveExamples },
  { title: 'المقارنة بين الحالات الأربع', examples: caseComparisons },
]

function TeacherGuide() {
  return (
    <TeacherSpace>
      <div className="eleven-stack" data-testid="eleven-teacher-guide">
        <h3>دليل المعلم — علامات الإعراب الأصلية</h3>
        <Note title="تنبيه علمي قبل التطبيق">
          <p>الإعراب تغيّر حال آخر الكلمة المعربة باختلاف العامل، وليس تخمينًا من شكل الحركة. الجر يخصّ الأسماء، والجزم يخصّ المضارع؛ الماضي والأمر مبنيان في الأمثلة التأسيسية، والتنوين ليس بديلًا عن العلامة الإعرابية.</p>
          <p>السكون علامة جزم المضارع الصحيح الآخر هنا؛ المعتلّ الآخر والعلامات الفرعية والإعراب المقدّر مسائل مؤجلة. في «كانَ الجوُّ جميلًا» جميلًا خبر كان منصوب بالفتحة دون توسع في باب كان.</p>
        </Note>
        <section>
          <h4>العلامات الأربع وأمثلتها</h4>
          <ul>{originalMarks.map((mark) => <li key={mark.state}>{mark.state}: {mark.sign} في <bdi>{mark.example}</bdi> {mark.reason}</li>)}</ul>
          <p>المضارع غير المسبوق بناصب أو جازم مرفوع، وبعد «لن/أنْ/كي» منصوب، وبعد «لم/لا» الناهية مجزوم إن صحّ آخره في الأمثلة. «لا» الناهية تطلب الكفّ بخلاف «لا» النافية.</p>
        </section>
        <section>
          <h4>شرح نحوي لأمثلة الدرس مع أسباب العلامة</h4>
          {teacherExampleGroups.map((group) => (
            <div className="eleven-teacher-group" key={group.title}>
              <h5>{group.title}</h5>
              <ol className="eleven-teacher-list">
                {group.examples.map((example) => (
                  <li key={example.sentence}>
                    <p><strong><bdi>{example.sentence}</bdi></strong> {example.analysis}</p>
                    <p><strong>التعليل:</strong> {example.reason}</p>
                    {example.parsing && <ul>{example.parsing.map((line) => <li key={line}>{line}</li>)}</ul>}
                  </li>
                ))}
              </ol>
            </div>
          ))}
          <p>في مقارنة الأفعال الصحيحة: {soundEndingPairs.map((pair) => `${pair.before} ← ${pair.after}`).join('، ')}. وإذا دخلت «لم» أو «لا» الناهية: {jussiveTransformations.map((pair) => `${pair.before} ← ${pair.after}`).join('، ')}. السكون هنا للجزم، وليس لكل فعل ساكن الآخر.</p>
          <ParsingTable sentence={workedSentence} rows={workedParsing} />
        </section>
        <SourceAnswers title="حل التدريب التفاعلي (٨ أسئلة)" questions={practiceQuestions} />
        <SourceAnswers title="حل الاختبار الختامي التعليمي (١٠ أسئلة)" questions={finalQuizQuestions} />
        <section>
          <h4>حل الواجب المنزلي بجميع أجزائه</h4>
          <HomeworkAnswers />
        </section>
        <p>حلول الاختبار المستقل العشرين في خطوة «منطقة الحلول» المنفصلة، لا في هذه البوابة وحدها. تقرير التدقيق مبني على النص المرسل من المستخدم فقط، من غير ادعاء الرجوع إلى كتاب غير مرفق.</p>
      </div>
    </TeacherSpace>
  )
}

export function LessonEleven({ onFinish }: { onFinish?: () => void }) {
  const practiceEngine = useTestEngine(practiceTest)
  const quizEngine = useTestEngine(finalQuizTest)
  const baseEngine = useTestEngine(testDefinition)
  const [homeworkRevealed, setHomeworkRevealed] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const showTestFeedback = submitted && baseEngine.allPagesChecked

  // The shared engine still owns answers, page checks, invalidation and aggregation.
  // Editing/unchecking after submission closes the solutions again until resubmission.
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
    {
      id: 'eleven-objectives', title: 'أهداف الدرس', group: 'مدخل إلى الإعراب', icon: '🎯', render: () => (
        <div className="eleven-stack">
          <div className="eleven-hero">
            <p className="card__eyebrow">قسم الأساسيات والنحو • الدرس ١١</p>
            <h3>علامات الإعراب الأصلية</h3>
            <p className="eleven-hero__subtitle">كيف نعرف حركة آخر الكلمة؟</p>
            <p>سنتعلّم اليوم العلامات الأربع: الضمة، والفتحة، والكسرة، والسكون، وكيف نعرف متى نستخدم كل علامة. نبدأ بموقع الكلمة والعامل المؤثر فيها، ثم ننظر إلى آخرها، مع أمثلة محلّلة وتدريب واختبار.</p>
          </div>
          <section className="eleven-panel">
            <h4>بعد الانتهاء من الدرس، ينبغي أن تستطيع:</h4>
            <ul className="eleven-checks">{objectives.map((objective) => <li key={objective}>{objective}</li>)}</ul>
          </section>
        </div>
      ),
    },
    {
      id: 'eleven-inflection', title: '١. ما الإعراب؟', group: 'مدخل إلى الإعراب', icon: '🔎', render: () => (
        <div className="eleven-stack">
          <p>الإعراب في هذه الأمثلة هو تغيّر <strong>حال آخر الكلمة المعربة</strong> بتغيّر موقعها في الجملة أو العامل المؤثر فيها؛ قد يظهر على آخرها حركة، لكن ليست كل حركة إعرابًا.</p>
          <p>تأمّل الاسم نفسه «الطالب» في الجمل الثلاث، ثم اسأل: من قام بالفعل؟ على من وقع؟ وهل سبقه حرف جر؟</p>
          <Examples items={inflectionExamples} label="حالات الطالب الثلاث" />
          <Note title="افهم السبب قبل الحركة">
            <p>لم تتبدل هوية الكلمة: الطالبُ فاعل بعد «حضرَ»، والطالبَ مفعول به بعد «رأيتُ»، والطالبِ اسم مجرور بعد «على». لذلك لا نختار الحركة عشوائيًا؛ نحدّد الموقع والعامل أولًا.</p>
          </Note>
        </div>
      ),
    },
    {
      id: 'eleven-marks', title: '٢. ما علامات الإعراب الأصلية؟', group: 'مدخل إلى الإعراب', icon: '✦', render: () => (
        <div className="eleven-stack">
          <p>علامات الإعراب الأصلية أربع. الحرف الظاهر في البطاقات حاملٌ للحركة ليبقى رسمها متصلًا: <bdi>بُ</bdi> و<bdi>بَ</bdi> و<bdi>بِ</bdi> و<bdi>بْ</bdi>.</p>
          <MarkCards />
          <MarksTable />
          <Note title="الحركة الظاهرة ليست دائمًا علامة إعراب">
            <p>«قرأَ» ينتهي بفتحة بناء؛ ليس فعلًا منصوبًا. و«مجتهدٌ» مرفوع بالضمة، والتنوين المصاحب ليس بديلًا عنها. نقرأ العلامة في ضوء وظيفة الكلمة لا من شكلها وحده.</p>
            <p>الجرّ يدخل على الأسماء ولا يدخل على الأفعال، والجزم يختصّ بالفعل المضارع؛ المضارع قد يُرفع أو يُنصب أو يُجزم بحسب ما قبله. هذه <strong>علامات أصلية في أمثلتنا</strong>، ولا يعني ذلك أنها العلامات الوحيدة في كل أبواب النحو.</p>
          </Note>
        </div>
      ),
    },
    {
      id: 'eleven-nominal', title: '٣. الضمة: المبتدأ والخبر', group: 'الرفع بالضمة', icon: 'بُ', render: () => (
        <div className="eleven-stack">
          <p>الضمة هي علامة الرفع الأصلية هنا. تتكون الجملة الاسمية غالبًا من مبتدأ نبدأ الحديث عنه وخبر يبيّن حاله؛ وكلاهما مرفوع في الأصل.</p>
          <Examples items={nominalExamples} label="المبتدأ والخبر" />
          <ParsingTable sentence="الطالبُ مجتهدٌ." rows={[
            { word: 'الطالبُ', role: 'مبتدأ', analysis: 'الطالبُ: مبتدأ مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.' },
            { word: 'مجتهدٌ', role: 'خبر', analysis: 'مجتهدٌ: خبر مرفوع، وعلامة رفعه الضمة الظاهرة على آخره؛ والتنوين مصاحب له وليس علامة رفع بديلة.' },
          ]} />
        </div>
      ),
    },
    {
      id: 'eleven-agent', title: '٣. الضمة: الفاعل والمضارع المرفوع', group: 'الرفع بالضمة', icon: 'بُ', render: () => (
        <div className="eleven-stack">
          <p>الفاعل هو من قام بالفعل أو اتّصف به، ويُرفع في أمثلتنا بالضمة. ابحث عمن كتب أو نجح أو أشرق، ولا تعدَّ الفتحة في الفعل الماضي علامة نصب.</p>
          <Examples items={agentExamples} label="أمثلة الفاعل المرفوع" />
          <p>ويرتفع المضارع بالضمة الظاهرة في هذه الأمثلة حين لا يسبقه ناصب أو جازم. اسأل عمّا دخل على الفعل قبل أن تحكم على علامته.</p>
          <Examples items={indicativeExamples} label="أمثلة المضارع المرفوع" />
          <Note title="قاعدة للحفظ"><p>المبتدأ والخبر والفاعل، وكذلك المضارع الصحيح الآخر غير المسبوق بناصب أو جازم في أمثلتنا، علامتها الأصلية عند الرفع الضمة.</p></Note>
        </div>
      ),
    },
    {
      id: 'eleven-object', title: '٤. الفتحة: المفعول به', group: 'النصب بالفتحة', icon: 'بَ', render: () => (
        <div className="eleven-stack">
          <p>الفتحة هي علامة النصب الأصلية في هذه الأمثلة. والمفعول به اسم وقع عليه فعل الفاعل: ما الذي قرأه الطالب؟ الكتابَ؛ لذلك تغيّر آخره إلى الفتحة.</p>
          <Examples items={objectExamples} label="أمثلة المفعول به المنصوب" />
          <Note title="اقرأ الجملة كلها"><p>في «قرأَ الطالبُ الكتابَ» الفتحة على «قرأَ» للبناء، والضمة على «الطالبُ» لرفع الفاعل، والفتحة على «الكتابَ» لنصب المفعول به. تماثل شكل الفتحتين لا يعني تماثل الوظيفة.</p></Note>
        </div>
      ),
    },
    {
      id: 'eleven-subjunctive', title: '٤. الفتحة: المضارع المنصوب وخبر كان', group: 'النصب بالفتحة', icon: 'بَ', render: () => (
        <div className="eleven-stack">
          <p>يُنصب المضارع بعد أداة نصب مثل <strong>لن، أنْ، كي</strong>. انظر إلى الأداة والفعل الذي يليها: «أحبُّ» و«أدرسُ» مرفوعان هنا، بينما «أقرأَ» و«أنجحَ» منصوبان بعد الأداة.</p>
          <Examples items={subjunctiveExamples} label="المضارع بعد أدوات النصب" />
          <p>قارن: <bdi>«أنا أدرسُ كلَّ يومٍ»</bdi> مضارع مرفوع لعدم وجود ناصب أو جازم؛ أمّا <bdi>«لن أهملَ واجبي»</bdi> ففيه «أهملَ» منصوب بالفتحة بسبب «لن».</p>
          <Note title="مثال تمهيدي على اسم في موقع النصب"><p><FocusSentence sentence={kanaExample.sentence} focus={kanaExample.focus} /> {kanaExample.analysis} {kanaExample.reason}</p></Note>
        </div>
      ),
    },
    {
      id: 'eleven-prepositions', title: '٥. الكسرة: الاسم بعد حرف الجر', group: 'الجر بالكسرة', icon: 'بِ', render: () => (
        <div className="eleven-stack">
          <p>الكسرة علامة الجر الأصلية في الأسماء المعروضة. من حروف الجر: <strong>{prepositions.join('، ')}</strong>. إذا سبق الاسمَ حرفُ جر، فهو مجرور في هذه الأمثلة، ولا يدخل الجر على فعل.</p>
          <Examples items={prepositionExamples} label="الاسم بعد حرف الجر" />
          <Note title="لماذا جُرّ؟"><p>في «ذهبتُ إلى المدرسةِ» ليست «المدرسةِ» مفعولًا به: «إلى» حرف جر جعل الاسم بعده مجرورًا بالكسرة. وفي «كتبتُ بالقلمِ» الباء متصلة بالاسم في الرسم ولا تزال حرف جر.</p></Note>
        </div>
      ),
    },
    {
      id: 'eleven-addition', title: '٥. الكسرة: المضاف إليه', group: 'الجر بالكسرة', icon: 'بِ', render: () => (
        <div className="eleven-stack">
          <p>قد يأتي اسم بعد اسم قبله ليكمل معناه: <bdi>كتابُ الطالبِ</bdi>، فالكتاب مضاف، و«الطالبِ» مضاف إليه مجرور. للجر سبب هنا هو <strong>الإضافة</strong>، لا مجرد وجود الاسم في الجملة.</p>
          <Examples items={additionExamples} label="أمثلة المضاف إليه" />
          <Note title="لا تُعمّم"><p>لا نقول إن كل اسم مجرور؛ السبب قد يكون حرف جر مثل «في»، أو الإضافة مثل «كتابُ الطالبِ». أمّا موقع «كتابُ» نفسه فيُعرف عند وضع العبارة في جملة مكتملة.</p></Note>
        </div>
      ),
    },
    {
      id: 'eleven-sound-verb', title: '٦. السكون: ما صحيح الآخر؟', group: 'الجزم بالسكون', icon: 'بْ', render: () => (
        <div className="eleven-stack">
          <p>السكون علامة الجزم الأصلية في <strong>الفعل المضارع الصحيح الآخر</strong> في هذه الأمثلة. الصحيح الآخر ما لم يكن آخر حرف أصلي فيه حرف علّة؛ وحروف العلة: الألف والواو والياء.</p>
          <PairTable title="أفعال مضارعة صحيحة الآخر: الضمة قبل الجزم والسكون بعده" rows={soundEndingPairs} />
          <p>انظر إلى نهاية الفعل في كل زوج: تتغير ضمة «يكتبُ» إلى سكون «يكتبْ» حين يجزم العامل المضارع؛ لا نضع السكون على كل فعل مضارع كيفما اتفق.</p>
          <Note title="حدود القاعدة"><p>الأفعال المعتلة الآخر قد تُجزم بعلامة أخرى؛ نؤجل شرحها إلى درس العلامات الفرعية. الفعل الماضي وفعل الأمر مبنيان في هذا المستوى؛ لا نقول إن الماضي مجزوم لأن آخره ساكن أو مفتوح.</p></Note>
        </div>
      ),
    },
    {
      id: 'eleven-jussive', title: '٦. السكون: لم ولا الناهية', group: 'الجزم بالسكون', icon: 'بْ', render: () => (
        <div className="eleven-stack">
          <p>من أدوات الجزم هنا <strong>لم</strong> و<strong>لا الناهية</strong>. «لم» تنفي حصول الفعل وتجزمه، و«لا» الناهية تطلب الكف عنه («لا تهملْ» = امتنع عن الإهمال). لا النافية الخبرية ليست هي لا الناهية الجازمة.</p>
          <PairTable title="المضارع قبل دخول أداة الجزم وبعدها" rows={jussiveTransformations} />
          <Examples items={jussiveExamples} label="المضارع المجزوم في جمل" />
          <Note title="حلّل المثال"><p>في <bdi>«لم يكتبْ»</bdi>: «لم» حرف نفي وجزم، و«يكتبْ» مضارع صحيح الآخر مجزوم وعلامة جزمه السكون الظاهر. وفي <bdi>«لا تهملْ»</bdi>: «لا» ناهية تطلب ترك الفعل، و«تهملْ» مضارع مجزوم بالسكون.</p></Note>
        </div>
      ),
    },
    {
      id: 'eleven-compare', title: '٧. لنقارن بين الحالات الأربع', group: 'التحليل والتطبيق', icon: '⇄', render: () => (
        <div className="eleven-stack">
          <p>اقرأ الجمل المتقاربة قبل أن تحكم: الرفع في اسم «الطالبُ»، والنصب في مضارع بعد «لن»، والجر بعد «إلى»، والجزم بعد «لم». ليست الحركات الأربع تغييرات عشوائية على الكلمة نفسها.</p>
          <Examples items={caseComparisons} label="مقارنة الرفع والنصب والجر والجزم" />
        </div>
      ),
    },
    {
      id: 'eleven-method', title: '٨. كيف تعرب الكلمة خطوة بخطوة؟', group: 'التحليل والتطبيق', icon: '🧭', render: () => (
        <div className="eleven-stack">
          <p>ابدأ بالمعنى ونوع الكلمة؛ بعدها حدّد موقعها والعامل والحالة، ولا تنتقل إلى الحركة إلا في النهاية. إن وجدت فعلًا ماضيًا مبنيًا فاذكر البناء لا حالة نصب متوهَّمة.</p>
          <ol className="eleven-method">{parsingSteps.map((step) => <li key={step}>{step}</li>)}</ol>
          <h3>مثال محلول بالتفصيل</h3>
          <ParsingTable sentence={workedSentence} rows={workedParsing} />
          <Note title="الإعراب ليس البناء"><p>«قرأَ» انتهى بفتحة ظاهرة، لكنه فعل ماضٍ مبني على الفتح، وليس منصوبًا. أما «القصةَ» فمفعول به منصوب، والفتحة الظاهرة على آخرها علامة نصب؛ سنفصّل الفرق في دروس لاحقة.</p></Note>
        </div>
      ),
    },
    {
      id: 'eleven-practice', title: '٩. تدريب تفاعلي: اختر علامة الإعراب', group: 'تدريب وتثبيت', icon: '✏️', render: () => (
        <div className="eleven-stack">
          <p>اختر إجابة واحدة لكل سؤال من الأسئلة الثمانية المرفقة بالدرس؛ ثم اضغط «تحقّق من الإجابات» لمعرفة الإجابة وسببها النحوي. لن تظهر الإجابة قبل التحقق، ويمكنك تعديلها وإعادة التحقق.</p>
          <TestPageView page={practiceTest.pages[0]} engine={practiceEngine} questionTestIdPrefix="eleven-practice" />
        </div>
      ),
    },
    {
      id: 'eleven-quiz', title: '١٠. الاختبار الختامي', group: 'تدريب وتثبيت', icon: '📝', render: () => (
        <div className="eleven-stack">
          <p>أجب عن الأسئلة العشرة التالية دون الرجوع إلى الشرح، ثم صحّح إجاباتك. هذا تقويم تعليمي داخل الدرس، <strong>منفصل</strong> عن التدريب ذي الأسئلة الثمانية وعن اختبار المنصة المستقل.</p>
          <TestPageView page={finalQuizTest.pages[0]} engine={quizEngine} questionTestIdPrefix="eleven-quiz" />
        </div>
      ),
    },
    {
      id: 'eleven-homework', title: '١١. الواجب المنزلي', group: 'تدريب وتثبيت', icon: '🏠', render: () => (
        <div className="eleven-stack eleven-homework">
          <section className="eleven-panel">
            <h3>السؤال الأول: حدّد علامة الإعراب للكلمة المميّزة واذكر السبب</h3>
            <p>الكلمة المقصودة ظاهرة بخط عريض في كل جملة، ثم تحتاج إلى تحديد موقعها والعامل الذي أثّر فيها.</p>
            <ol>{homeworkMarks.map((item) => (
              <li key={item.target} className="eleven-homework__item"><FocusSentence sentence={item.sentence} focus={item.target} /></li>
            ))}</ol>
          </section>
          <section className="eleven-panel">
            <h3>السؤال الثاني: أكمل الفراغ بالعلامة المناسبة</h3>
            <ol>{homeworkBlanks.map((item) => <li key={item.prompt}>{item.prompt} ..........</li>)}</ol>
          </section>
          <section className="eleven-panel">
            <h3>السؤال الثالث: أعرب الجملة إعرابًا كاملًا</h3>
            <p className="eleven-example__sentence"><bdi>{homeworkSentence}</bdi></p>
            <p>أعرب الكلمات الخمس جميعها، بما فيها «في» حرف الجر و«كتبَ» الفعل الماضي المبني.</p>
          </section>
          <button type="button" className="button button--secondary" aria-expanded={homeworkRevealed} onClick={() => setHomeworkRevealed((value) => !value)}>
            {homeworkRevealed ? 'إخفاء الحلول النموذجية' : 'إظهار الحلول النموذجية'}
          </button>
          {homeworkRevealed && <HomeworkAnswers />}
        </div>
      ),
    },
    {
      id: 'eleven-summary', title: 'خلاصة الدرس للحفظ والقاعدة الذهبية', group: 'تدريب وتثبيت', icon: '🧠', render: () => (
        <div className="eleven-stack">
          <MarkCards />
          <Note title="القاعدة الذهبية"><p>حدّد موقع الكلمة أو العامل الذي أثّر فيها أولًا، ثم حدّد الحالة الإعرابية، وبعد ذلك اذكر علامة الإعراب. تذكّر أن «قرأَ» ماضٍ مبني، وأن الجر للأسماء والجزم للمضارع، وأن المعتلّ الآخر والعلامات الفرعية تُدرس لاحقًا.</p></Note>
          <section className="eleven-panel">
            <h3>📚 الدرس الثاني عشر — معاينة تعليمية فقط</h3>
            <p>في الدرس الثاني عشر من قسم الأساسيات والنحو سننتقل إلى المثنّى وجمع المذكر السالم وجمع المؤنث السالم، ونتعلّم كيف نميّز بينها وكيف نستخدمها في الجمل، تمهيدًا لفهم علامات الإعراب الفرعية في الدرس الثالث عشر.</p>
            <p className="eleven-small-note">هذه إشارة كما وردت في المادة المرسلة، لا درس جديد مسجّل في المنصة. توجد مقدمة لهذه الموضوعات في دروس القسم السابقة.</p>
          </section>
        </div>
      ),
    },
    ...testDefinition.pages.map((page, index) => ({
      id: `eleven-test-${index + 1}`,
      title: `الاختبار المستقل: ${page.title}`,
      group: 'الاختبار المستقل', icon: '📋', render: () => (
        <div className="eleven-stack">
          <p>اختبار المنصة المستقل: ٢٠ سؤالًا جديدًا في أربع صفحات، خمسة في كل صفحة. التحقق من هذه الصفحة يحفظ إجاباتها فقط؛ لا تُعرض صحة الإجابات ولا النتيجة أو الحلول قبل تسليم الصفحات الأربع.</p>
          <TestPageView page={page} engine={engine} revealFeedback={showTestFeedback} questionTestIdPrefix="eleven-question" />
        </div>
      ),
    })),
    {
      id: 'eleven-submit', title: 'تسليم الاختبار المستقل والنتيجة', group: 'الاختبار المستقل', icon: '🏁', render: () => (
        <div className="eleven-stack">
          <section className="eleven-panel">
            <h3>التحقق من الصفحات ثم التسليم</h3>
            <p>الصفحات المحفوظة بالتحقق: <strong><bdi>{baseEngine.checkedPageIds.length} / {testDefinition.pages.length}</bdi></strong>. يمكنك الرجوع إلى أي صفحة لتعديل إجاباتها؛ إعادة التحقق تستبدل نتيجتها ولا تضاعفها.</p>
            <p>حتى تكتمل الصفحات الأربع لا تُعرض النتيجة النهائية، ولا صحة أي إجابة في الاختبار المستقل.</p>
            <div className="eleven-actions">
              <button type="button" className="button button--primary" disabled={!baseEngine.allPagesChecked} onClick={() => setSubmitted(true)}>تسليم الاختبار</button>
              <button type="button" className="button button--secondary" onClick={() => engine.resetTest()}>إعادة ضبط الاختبار</button>
            </div>
            {!baseEngine.allPagesChecked && <p className="eleven-small-note">انتقل إلى الصفحات الأربع واضغط «تحقّق من الإجابات» في نهاية كل صفحة أولًا.</p>}
            {showTestFeedback && <div className="eleven-result" role="status" data-testid="eleven-result">
              <h4>نتيجة الاختبار المستقل</h4>
              <p>أجبتَ إجابة صحيحة عن <strong><bdi>{engine.finalResult.correct} / {engine.finalResult.total}</bdi></strong> سؤالًا. إجابات غير صحيحة: <bdi>{engine.finalResult.wrong}</bdi>، ولم تُجب: <bdi>{engine.finalResult.unanswered}</bdi>.</p>
              <p>انتقل إلى «منطقة حلول الاختبار المستقل» لمعرفة التعليل وسبب خطأ البدائل.</p>
            </div>}
          </section>
        </div>
      ),
    },
    {
      id: 'eleven-solutions', title: 'منطقة حلول الاختبار المستقل', group: 'الحلول والمعلم', icon: '📗', render: () => (
        <SolutionsArea test={testDefinition} engine={engine} revealFeedback={showTestFeedback} testId="eleven-solutions" />
      ),
    },
    {
      id: 'eleven-teacher', title: 'منطقة المعلم', group: 'الحلول والمعلم', icon: '👩‍🏫', render: () => <TeacherGuide />,
    },
  ]

  return (
    <div className="eleven-lesson" dir="rtl">
      <LessonFlow steps={steps} lessonTitle="علامات الإعراب الأصلية — كيف نعرف حركة آخر الكلمة؟" lessonNumber="١١" lessonEyebrow="قسم الأساسيات والنحو" onFinish={onFinish} />
    </div>
  )
}
