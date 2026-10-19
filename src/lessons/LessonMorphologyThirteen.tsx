import { useState, type ReactNode } from 'react'
import { LessonFlow, type LessonStepDefinition } from '../shared/components/LessonFlow'
import { TeacherSpace } from '../shared/teacher/TeacherSpace'
import { SolutionsArea, TestPageView, type TestDefinition, type TestEngine, useTestEngine } from '../shared/test'
import {
  commonMistakes,
  comparisons,
  derivations,
  homework,
  homeworkModel,
  lessonTitle,
  sentences,
  teacherNotes,
  teacherWeightAnalyses,
  testDefinition as independentTest,
  trainingQuestions,
  weightWorkshop,
  weights,
} from './morphology-lesson-13/content'

// eslint-disable-next-line react-refresh/only-export-components -- shared platform test-conformance contract.
export const testDefinition: TestDefinition = independentTest

function Arabic({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <bdi className={`m13-arabic ${className}`} dir="rtl" lang="ar">{children}</bdi>
}

function DataTable({ children, caption }: { children: ReactNode; caption: string }) {
  return <div className="m13-table-wrap"><table className="m13-table"><caption>{caption}</caption>{children}</table></div>
}

function IntroStep() {
  const [choice, setChoice] = useState('')
  const [revealed, setRevealed] = useState(false)
  return <div className="m13-stack">
    <div className="m13-hero">
      <div className="m13-orbit" aria-hidden="true"><span>صبر</span><b>↔</b><span>صبور</span><i>وزنٌ يصنع فرقًا</i></div>
      <p className="m13-eyebrow">الدرس ١٣ من قسم الصرف</p>
      <h2>صِيَغُ المبالغة</h2>
      <p>اكتشف كيف يمكن لبناء الكلمة أن يضيف معنى الكثرة أو قوة الصفة، من غير أن نحكم على الكلمة بوزنها وحده.</p>
    </div>
    <section className="m13-card m13-discovery" aria-labelledby="m13-discovery-title">
      <p className="m13-kicker">محطة الاكتشاف · قبل الشرح</p>
      <h3 id="m13-discovery-title">هل تعبّر الكلمات كلها عن الدرجة نفسها؟</h3>
      <div className="m13-contrast-pairs">
        <p>الرجلُ <strong>صَابِرٌ</strong>.</p><span aria-hidden="true">⇢</span><p>الرجلُ <strong>صَبُورٌ</strong>.</p>
        <p>الطالبُ <strong>حَافِظٌ للدرس</strong>.</p><span aria-hidden="true">⇢</span><p>الطالبُ <strong>حَفَّاظٌ للقرآن</strong>.</p>
      </div>
      <fieldset className="m13-choice-field"><legend>ما الفرق الذي تتوقعه؟ اختر فكرتك ثم ثبّتها.</legend>
        {[
          ['same', 'الكلمتان في كل زوج تدلان على الشيء نفسه تمامًا.'],
          ['stronger', 'الكلمة الثانية قد تبرز كثرة الفعل أو قوّة الصفة بحسب السياق.'],
          ['other', 'الكلمة الثانية تدل دائمًا على من وقع عليه الفعل.'],
        ].map(([value, label]) => <label key={value}><input type="radio" name="m13-discovery" value={value} checked={choice === value} onChange={() => { setChoice(value); setRevealed(false) }} /><span>{label}</span></label>)}
      </fieldset>
      <button type="button" className="m13-button m13-button--bright" disabled={!choice} onClick={() => setRevealed(true)}>تحقّق من فكرتي</button>
      {revealed && <p className={`m13-feedback ${choice === 'stronger' ? 'is-correct' : 'is-review'}`} role="status">{choice === 'stronger' ? 'أحسنت! «صبور» و«حفّاظ» قد تبرزان الكثرة أو القوة في الاستعمال المقصود.' : 'فكرة تستحق المراجعة: في المثالين قد تبرز الكلمة الثانية كثرة الفعل أو قوّة الصفة، لكن الدلالة تُفهم من الاستعمال والسياق.'} «حافظ للدرس» و«حفّاظ للقرآن» سياقان مختلفان، فلا نجعل هذا المثال وحده قاعدة عامة.</p>}
    </section>
    <aside className="m13-note"><strong>هدفك:</strong> تميّز اسم الفاعل وصيغة المبالغة واسم المفعول، وتتعرف الأوزان الخمسة المشهورة، ثم تزن الكلمة مع مراعاة أصلها ومعناها.</aside>
  </div>
}

function DefinitionStep() {
  return <div className="m13-stack">
    <div className="m13-definition"><span className="m13-definition-mark">١</span><div><p className="m13-kicker">المعنى أولًا</p><h3>ما صيغة المبالغة؟</h3><p>اسم مشتق يدل على من يقوم بالفعل أو يتصف بالصفة، وقد يفيد <strong>كثرة الفعل أو قوّته أو رسوخ الصفة بحسب الكلمة والسياق</strong>.</p></div></div>
    <p className="m13-note">ليست صيغة المبالغة مجرد كلمة أطول من اسم الفاعل، ولا يكفي تشابه الوزن للحكم عليها. نضمّ إلى الوزن معنى الكلمة واستعمالها.</p>
    <DataTable caption="من الفعل إلى اسم الفاعل وصيغة المبالغة"><thead><tr><th>الفعل</th><th>اسم الفاعل</th><th>صيغة المبالغة</th><th>الفرق الدلالي</th></tr></thead><tbody>{comparisons.map((row) => <tr key={row.verb}><th><Arabic>{row.verb}</Arabic></th><td><Arabic>{row.active}</Arabic></td><td><Arabic className="m13-hyper-word">{row.hyperbolic}</Arabic></td><td>{row.activeMeaning}؛ والمبالغة تبرز {row.hyperMeaning}.</td></tr>)}</tbody></DataTable>
    <div className="m13-token-ribbon"><span><Arabic>غَافِر</Arabic><small>من يقوم بالفعل</small></span><b>←</b><span className="is-hyper"><Arabic>غَفَّار</Arabic><small>كثرة الغفران</small></span><b>←</b><span className="is-passive"><Arabic>مَغْفُور</Arabic><small>وقع عليه الفعل</small></span></div>
  </div>
}

function WeightStationStep() {
  const [selectedWeight, setSelectedWeight] = useState(0)
  const [selectedExample, setSelectedExample] = useState('')
  const [checked, setChecked] = useState(false)
  const station = weights[selectedWeight]
  return <div className="m13-stack">
    <p>هذه أشهر خمسة أوزان يركز عليها الدرس، وليست حصرًا لجميع الصيغ. افتح محطة، ثم جرّب أن تتعرف إلى وزن المثال.</p>
    <div className="m13-station-tabs" role="tablist" aria-label="محطات الأوزان الخمسة">{weights.map((weight, index) => <button key={weight.id} type="button" role="tab" aria-selected={index === selectedWeight} className={index === selectedWeight ? 'is-active' : ''} onClick={() => { setSelectedWeight(index); setSelectedExample(''); setChecked(false) }}><span>{index + 1}</span><Arabic>{weight.pattern}</Arabic></button>)}</div>
    <article className="m13-station-card" key={station.id}>
      <div className="m13-station-heading"><span className="m13-station-number">٠{selectedWeight + 1}</span><div><p className="m13-kicker">محطة الوزن</p><h3><Arabic>{station.pattern}</Arabic></h3></div></div>
      <div className="m13-example-chips">{station.examples.map((example) => <span key={example}><Arabic>{example}</Arabic></span>)}</div>
      <p className="m13-context-line"><strong>في سياق:</strong> <Arabic>{station.sentence}</Arabic></p>
      <p>{station.meaning}</p>
      <fieldset className="m13-choice-field"><legend>نشاط سريع: ما وزن «{station.examples[0]}» في المثال؟</legend>{weights.map((item) => <label key={item.id}><input type="radio" name={`m13-station-${station.id}`} value={item.pattern} checked={selectedExample === item.pattern} onChange={() => { setSelectedExample(item.pattern); setChecked(false) }} /><span><Arabic>{item.pattern}</Arabic></span></label>)}</fieldset>
      <button type="button" className="m13-button m13-button--dark" disabled={!selectedExample} onClick={() => setChecked(true)}>تحقّق من الوزن</button>
      {checked && <p className={`m13-feedback ${selectedExample === station.answer ? 'is-correct' : 'is-review'}`} role="status">{selectedExample === station.answer ? 'صحيح.' : `جرّب مرة أخرى؛ الوزن هو ${station.answer}.`} انظر إلى بنية الكلمة، ثم راعِ استعمالها ودلالتها.</p>}
    </article>
    <aside className="m13-note"><strong>قاعدة مهمة:</strong> الوزن وحده لا يكفي؛ نتحقق من المعنى والاستعمال والسياق، ولا نعدّ كل كلمة تشبه وزنًا صيغة مبالغة.</aside>
  </div>
}

function WorkshopStep() {
  const [index, setIndex] = useState(0)
  const [choice, setChoice] = useState('')
  const [rootGuess, setRootGuess] = useState<string[]>(['', '', ''])
  const [revealed, setRevealed] = useState(false)
  const item = weightWorkshop[index]
  const rootChoices = Array.from(new Set(weightWorkshop.flatMap((example) => example.root.split(' '))))
  const rootIsCorrect = rootGuess.join(' ') === item.root
  const weightIsCorrect = choice === item.correct
  return <div className="m13-stack">
    <p>ابدأ بالأصول، لا بالشكل الكتابي وحده. قابل الحروف الأصلية بمواضع «ف، ع، ل»، ثم انتبه إلى الشدة وحروف بناء الوزن.</p>
    <div className="m13-root-flow"><div><small>الكلمة</small><Arabic>{item.word}</Arabic></div><span>→</span><div><small>أحرف الجذر التي أستخرجها</small><strong>؟ · ؟ · ؟</strong></div><span>→</span><div><small>ميزان الكلمة</small><strong>ف · ع · ل</strong></div></div>
    <section className="m13-card m13-workshop-card"><p className="m13-kicker">ورشة الميزان · مثال {index + 1} من {weightWorkshop.length}</p><h3>ما وزن <Arabic>{item.word}</Arabic>؟</h3><p>اختر الحروف الأصلية في ترتيبها، ثم اختر الوزن. لا يظهر الجذر أو الحل إلا بعد المحاولة.</p>
      <div className="m13-root-inputs">{[0, 1, 2].map((rootIndex) => <label key={rootIndex}>الحرف الأصلي {rootIndex + 1}<select aria-label={`الحرف الأصلي ${rootIndex + 1} لكلمة ${item.word}`} value={rootGuess[rootIndex]} onChange={(event) => { const next = [...rootGuess]; next[rootIndex] = event.target.value; setRootGuess(next); setRevealed(false) }}><option value="">اختر حرفًا</option>{rootChoices.map((letter) => <option key={letter} value={letter}>{letter}</option>)}</select></label>)}</div>
      <fieldset className="m13-choice-field"><legend>اختر الوزن</legend>{weights.map((weight) => <label key={weight.id}><input type="radio" name={`m13-workshop-${item.id}`} value={weight.pattern} checked={choice === weight.pattern} onChange={() => { setChoice(weight.pattern); setRevealed(false) }} /><span><Arabic>{weight.pattern}</Arabic></span></label>)}</fieldset>
      <div className="m13-action-row"><button type="button" className="m13-button m13-button--bright" disabled={!choice || rootGuess.some((letter) => !letter)} onClick={() => setRevealed(true)}>أظهر التصحيح والتفسير</button><button type="button" className="m13-button m13-button--outline" onClick={() => { setIndex((index + 1) % weightWorkshop.length); setChoice(''); setRootGuess(['', '', '']); setRevealed(false) }}>مثال آخر</button></div>
      {revealed && <div className={`m13-feedback ${weightIsCorrect && rootIsCorrect ? 'is-correct' : 'is-review'}`} role="status"><strong>{item.word} على وزن {item.correct}.</strong> الجذر: {item.root}. إجابتك للجذر {rootIsCorrect ? 'صحيحة' : `تحتاج مراجعة؛ الصحيح ${item.root}`}، وإجابتك للوزن {weightIsCorrect ? 'صحيحة' : `تحتاج مراجعة؛ الصحيح ${item.correct}`}. {item.clue} {item.id === 'ghaffar' ? 'الشدة تكرار للفاء الأصلية، لا حرف أصلي رابع.' : ''} {item.id === 'aleem' ? 'الياء من بناء الوزن.' : ''} {item.id === 'saboor' ? 'الواو من بناء الوزن.' : ''} {item.id === 'mit-aa' ? 'الميم وألف مِفعال من بناء الصيغة؛ والصورة النهائية تتصل باعتلال الفعل.' : ''}</div>}
    </section>
    <div className="m13-step-sequence"><h3>خطوات الوزن الخمس</h3><ol><li>حدّد الكلمة المشتقة.</li><li>تعرّف إلى أصلها ومعناها.</li><li>ميّز الحروف الأصلية وقابلها بـ«ف، ع، ل».</li><li>لاحظ التضعيف والزيادة وبناء الوزن.</li><li>تحقّق من أن الوزن والمعنى والاستعمال يناسبان الحكم.</li></ol></div>
  </div>
}

function ComparisonStep() {
  const [revealed, setRevealed] = useState(false)
  return <div className="m13-stack">
    <p>حرّك البطاقات بين ثلاث وظائف دلالية: من قام بالفعل، ومن يكثر منه الفعل أو تقوى فيه الصفة، ومن وقع عليه الفعل.</p>
    <div className="m13-comparison-grid">{[
      { title: 'اسم الفاعل', sub: 'من قام بالفعل', words: ['غَافِر', 'شَاكِر'], className: 'is-active' },
      { title: 'صيغة المبالغة', sub: 'كثرة الفعل أو قوة الصفة', words: ['غَفَّار', 'شَكُور'], className: 'is-hyper' },
      { title: 'اسم المفعول', sub: 'من وقع عليه الفعل', words: ['مَغْفُور', 'مَشْكُور'], className: 'is-passive' },
    ].map((group) => <article key={group.title} className={`m13-kind-card ${group.className}`}><span>{group.title}</span><small>{group.sub}</small>{group.words.map((word) => <strong key={word}><Arabic>{word}</Arabic></strong>)}</article>)}</div>
    <button type="button" className="m13-button m13-button--dark" aria-expanded={revealed} onClick={() => setRevealed(!revealed)}>{revealed ? 'إخفاء التحليل' : 'اكشف التحليل'}</button>
    {revealed && <div className="m13-reveal-grid"><p><Arabic>غَافِر</Arabic>: اسم فاعل من غفر، يبرز القيام بالفعل. <Arabic>غَفَّار</Arabic>: صيغة مبالغة على فعّال، وتفيد الكثرة بحسب السياق. <Arabic>مَغْفُور</Arabic>: اسم مفعول، أي ما وقع عليه الغفران.</p><p><Arabic>شَاكِر</Arabic>: اسم فاعل من شكر. <Arabic>شَكُور</Arabic>: صيغة مبالغة مشهورة على فعول. <Arabic>مَشْكُور</Arabic>: اسم مفعول، أي من وقع عليه الشكر.</p></div>}
    <p className="m13-note">كلمة «شاكر» اسم فاعل في المقارنة المقصودة؛ لا نصفها بصيغة المبالغة «دائمًا». نوع المشتق ودلالته يتضحان من الاستعمال والسياق.</p>
  </div>
}

function SentenceAnalysisStep() {
  const [revealed, setRevealed] = useState<Record<number, boolean>>({})
  return <div className="m13-stack"><p>اقرأ الجملة، وحاول تحديد الكلمة المشتقة وفعلها ووزنها ونوعها ودلالتها، ثم اكشف التحليل.</p><div className="m13-analysis-list">{sentences.map((item, index) => <article className="m13-analysis-card" key={item.sentence}><div className="m13-analysis-number">{String(index + 1).padStart(2, '٠')}</div><div className="m13-analysis-content"><h3><Arabic>{item.sentence}</Arabic></h3><button type="button" className="m13-button m13-button--outline" aria-expanded={Boolean(revealed[index])} onClick={() => setRevealed((current) => ({ ...current, [index]: !current[index] }))}>{revealed[index] ? 'إخفاء التحليل' : 'أظهر التحليل'}</button>{revealed[index] && <dl className="m13-analysis-details"><div><dt>الكلمة المشتقة</dt><dd><Arabic>{item.word}</Arabic></dd></div><div><dt>الفعل المرتبطة به</dt><dd><Arabic>{item.verb}</Arabic></dd></div><div><dt>الأصول</dt><dd><Arabic>{item.root}</Arabic></dd></div><div><dt>الوزن</dt><dd><Arabic>{item.weight}</Arabic></dd></div><div><dt>النوع</dt><dd>{item.kind}</dd></div><div><dt>الدلالة هنا</dt><dd>{item.meaning}</dd></div></dl>}</div></article>)}</div></div>
}

function DerivationStep() {
  const [checked, setChecked] = useState(false)
  const [choice, setChoice] = useState('')
  return <div className="m13-stack">
    <p>ابدأ بالفعل، تعرّف إلى اسم الفاعل، ثم استخدم صيغة مبالغة معروفة ومستعملة عند وجودها. الجدول أمثلة معروفة، لا وصفة لتحويل كل فعل إلى كل وزن.</p>
    <DataTable caption="مختبر الاشتقاق: أمثلة مستعملة"><thead><tr><th>الفعل</th><th>اسم الفاعل</th><th>صيغة المبالغة</th><th>الوزن</th><th>تنبيه</th></tr></thead><tbody>{derivations.map((row) => <tr key={row.verb}><th><Arabic>{row.verb}</Arabic></th><td><Arabic>{row.active}</Arabic></td><td><Arabic className="m13-hyper-word">{row.hyper}</Arabic></td><td><Arabic>{row.weight}</Arabic></td><td>{row.note}</td></tr>)}</tbody></DataTable>
    <section className="m13-card"><h3>هل نشتق أي وزن من أي فعل؟</h3><p>أجب قبل كشف التعليل: هل يكفي أن نضع الفعل على وزن مشهور كي نحصل دائمًا على كلمة عربية مستعملة؟</p><fieldset className="m13-choice-field"><legend>اختر</legend><label><input type="radio" name="m13-auto-derivation" value="yes" checked={choice === 'yes'} onChange={() => { setChoice('yes'); setChecked(false) }} /><span>نعم، التحويل آلي دائمًا.</span></label><label><input type="radio" name="m13-auto-derivation" value="no" checked={choice === 'no'} onChange={() => { setChoice('no'); setChecked(false) }} /><span>لا؛ نتحقق من الصيغة المستعملة والمعنى.</span></label></fieldset><button type="button" className="m13-button m13-button--dark" disabled={!choice} onClick={() => setChecked(true)}>تحقّق من فكرتي</button>{checked && <p className={`m13-feedback ${choice === 'no' ? 'is-correct' : 'is-review'}`} role="status">الأدق: نتحقق من الاستعمال والمعنى. الصيغ الشائعة لا تعني إمكان توليد كل صيغة من كل فعل آليًا؛ «مِعطاء» مثال مستعمل مرتبط بـ«أعطى» مع مراعاة الاعتلال.</p>}</section>
  </div>
}

function MistakesStep() {
  const [revealed, setRevealed] = useState<Record<number, boolean>>({})
  return <div className="m13-stack"><p>اختر الخطأ الذي قد يقع فيه المتعلم، ثم افتح التصويب وسبب الخطأ.</p><div className="m13-mistakes-grid">{commonMistakes.map((item, index) => <article className="m13-mistake-card" key={item.error}><span className="m13-mistake-no">٠{index + 1}</span><h3>{item.error}</h3><p className="m13-mistake-example"><Arabic>{item.example}</Arabic></p><button type="button" className="m13-button m13-button--outline" aria-expanded={Boolean(revealed[index])} onClick={() => setRevealed((current) => ({ ...current, [index]: !current[index] }))}>{revealed[index] ? 'إخفاء التصويب' : 'اعرض التصويب'}</button>{revealed[index] && <div className="m13-feedback is-correct"><strong>التصحيح:</strong> {item.correction}<p>{item.explanation}</p></div>}</article>)}</div></div>
}

function TrainingStep() {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [checked, setChecked] = useState<Record<number, boolean>>({})
  const [active, setActive] = useState(0)
  const done = Object.keys(checked).length
  const item = trainingQuestions[active]
  const select = (answer: number) => { setAnswers((current) => ({ ...current, [active]: answer })); setChecked((current) => ({ ...current, [active]: true })) }
  const reset = () => { setAnswers({}); setChecked({}); setActive(0) }
  return <div className="m13-stack" data-testid="m13-training"><div className="m13-training-top"><div><p className="m13-kicker">تدرّب بنفسك · لا يدخل في درجة الاختبار</p><h3>تحدّي الأسئلة الثمانية</h3></div><strong className="m13-counter" data-testid="m13-training-progress">{done} / ٨</strong></div><div className="m13-progress-track" role="progressbar" aria-label="تقدم التدريب" aria-valuemin={0} aria-valuemax={8} aria-valuenow={done}><span style={{ width: `${done / 8 * 100}%` }} /></div>
    <nav className="m13-question-tabs" aria-label="أسئلة التدريب">{trainingQuestions.map((question, index) => <button key={question.target} type="button" className={index === active ? 'is-active' : checked[index] ? 'is-done' : ''} aria-current={index === active ? 'step' : undefined} onClick={() => setActive(index)}>{index + 1}</button>)}</nav>
    <section className="m13-training-card" key={active}><p className="m13-kicker">السؤال {active + 1} من ٨</p><h3>{item.prompt}</h3><div className="m13-training-choices">{item.choices.map((choice, index) => <button type="button" key={choice} disabled={Boolean(checked[active])} className={checked[active] && index === item.correct ? 'is-answer' : checked[active] && answers[active] === index ? 'is-wrong' : ''} onClick={() => select(index)} aria-pressed={answers[active] === index}>{choice}</button>)}</div>{checked[active] && <div className={`m13-feedback ${answers[active] === item.correct ? 'is-correct' : 'is-review'}`} role="status"><strong>{answers[active] === item.correct ? 'إجابة صحيحة.' : `الإجابة الصحيحة: ${item.choices[item.correct]}.`}</strong> {item.explanation}</div>}<p className="m13-target">يركز هذا السؤال على: {item.target}</p><div className="m13-action-row"><button className="m13-button m13-button--outline" type="button" disabled={active === 0} onClick={() => setActive(active - 1)}>السابق</button><button className="m13-button m13-button--dark" type="button" disabled={active === 7} onClick={() => setActive(active + 1)}>التالي</button></div></section>
    {done === 8 && <div className="m13-finish-card" role="status"><strong>اكتمل التدريب: {Object.values(answers).filter((answer, index) => answer === trainingQuestions[index].correct).length} / ٨</strong><p>جرّب التدريب مرة أخرى متى شئت. نتيجته منفصلة عن الاختبار النهائي.</p><button className="m13-button m13-button--bright" type="button" onClick={reset}>إعادة التدريب</button></div>}
  </div>
}

function SummaryStep() {
  return <div className="m13-stack"><p>راجع البطاقات الخمس، ثم أعد القاعدة الأساسية إلى ذهنك: المعنى والاستعمال مع الوزن، لا الوزن وحده.</p><div className="m13-summary-grid">{weights.map((item, index) => <article key={item.id} className={`m13-summary-card m13-summary-card--${item.id}`}><span className="m13-summary-index">٠{index + 1}</span><h3><Arabic>{item.pattern}</Arabic></h3><div>{item.examples.slice(0, 2).map((example) => <strong key={example}><Arabic>{example}</Arabic></strong>)}</div></article>)}</div><div className="m13-core-rule"><span aria-hidden="true">✦</span><div><strong>قاعدة الحفظ</strong><p>صيغة المبالغة تدل على كثرة الفعل أو قوّته أو رسوخ الصفة بحسب الاستعمال والسياق. الأوزان المشهورة تساعدنا على التعرف، لكن الوزن وحده لا يحكم.</p></div></div></div>
}

function HomeworkStep() {
  return <div className="m13-stack"><div className="m13-note"><strong>تعليمات الطالب:</strong> اكتب إجابتك في دفترك. اختر ألفاظًا عربية مستعملة، واضبط الكلمات حيث يساعد الضبط على تمييز الوزن والمعنى. الحلول النموذجية غير معروضة في هذه الصفحة.</div><ol className="m13-homework-list">{homework.map((item, index) => <li key={item}><span>{index + 1}</span>{item}</li>)}</ol><p className="m13-muted">نموذج الإجابة التفصيلي وإرشادات قبول البدائل موجودان في منطقة المعلم.</p></div>
}

function TeacherBlock({ title, children }: { title: string; children: ReactNode }) { return <details className="m13-teacher-block"><summary>{title}</summary><div>{children}</div></details> }

function TeacherGuide() {
  const trainingKey = trainingQuestions.map((item, index) => <li key={item.prompt}><strong>{index + 1}. {item.prompt}</strong><p>الإجابة: {item.choices[item.correct]}. {item.explanation}</p><small>الهدف: {item.target}</small></li>)
  return <TeacherSpace><div className="m13-teacher" data-testid="m13-teacher-material"><p className="m13-kicker">المحتوى المساعد · محمي ببوابة المعلم المشتركة</p><h3>دليل المعلم — {lessonTitle}</h3><p>الحلول أدناه ضمن مساحة المعلم الحالية، وتخضع لكلمة المرور المشتركة للمشروع. الاختبار النهائي لا يكشف التصحيح للطالب قبل تسليم صفحاته الأربع.</p>
    <TeacherBlock title="١. مفتاح التدريب التفاعلي — ٨ أسئلة مع التفسير"><ol className="m13-teacher-list">{trainingKey}</ol></TeacherBlock>
    <TeacherBlock title="٢. مفتاح الاختبار النهائي — ١٢ سؤالًا / ١٥ درجة"><p>التوزيع: الأول ٤ درجات؛ الثاني ٤؛ الثالث ٣؛ الرابع ٤. الأسئلة ٩ و١٠ و١١ و١٢ هي إجابة الجدول، والجملتان، والفرقين على التوالي.</p><SolutionsArea test={testDefinition} mode="teacher" title="حلول الاختبار النهائي — المجموع ١٥ درجة" testId="m13-teacher-exam-key" /><h4>سلم التصحيح الإنشائي</h4><ul><li><strong>سؤال ٩، الجدول (٣):</strong> درجة لكل صف مطابق للمحتوى: غفّار/فعّال، شكور/فعول، عليم/فعيل. يقبل الشكل غير المشكول إذا كان واضحًا.</li><li><strong>سؤال ١٠، الجملتان (٢):</strong> درجة لكل جملة، بشرط وجود صبور أو مِعطاء بحسب المطلوب وسلامة التركيب والمعنى. تقبل الجمل الصحيحة غير المطابقة للنموذج.</li><li><strong>سؤال ١١ (١):</strong> يذكر أن غافر اسم فاعل، وغفّار صيغة مبالغة، مع بيان الكثرة/القوة في الدلالة.</li><li><strong>سؤال ١٢ (١):</strong> يذكر أن مشكور اسم مفعول، وشكور صيغة مبالغة تدل على كثرة الشكر.</li><li>الفقرات ٩–١٢ أربع فقرات من مجموع ١٢ سؤالًا، ومجموع درجاتها سبع: الجدول (٣)، الجملتان (٢)، والفرقين (١ + ١). الدرجة الكاملة للاختبار ١٥، والإجابات الإنشائية تُراجع يدويًا ولا تُمنح آليًا.</li></ul></TeacherBlock>
    <TeacherBlock title="٣. الفروق بين اسم الفاعل والمبالغة واسم المفعول"><div className="m13-teacher-columns"><p><strong>اسم الفاعل:</strong> يبرز من قام بالفعل؛ غافر، شاكر. مثال: الرجل غافرٌ للخطأ؛ الطالب شاكرٌ معلّمه.</p><p><strong>صيغة المبالغة:</strong> تبرز كثرة الفعل أو قوة الصفة بحسب السياق؛ غفّار، شكور. مثال: المؤمن شكور لنعم الله.</p><p><strong>اسم المفعول:</strong> يدل على ما أو من وقع عليه الفعل؛ مغفور، مشكور. مثال: الذنب مغفور؛ المعروف مشكور.</p></div><p>تظل «شاكر» اسم فاعل في المثال التعليمي، ولا توصف بأنها صيغة مبالغة دائمًا. وكذلك الوزن وحده لا يكفي لتعيين النوع.</p></TeacherBlock>
    <TeacherBlock title="٤. خطوات الوزن الصرفي للأمثلة الأربعة"><DataTable caption="الأصول ومقابلة الميزان"><thead><tr><th>الكلمة</th><th>الأصول</th><th>مقابلة ف/ع/ل</th><th>الوزن والتفسير</th></tr></thead><tbody>{teacherWeightAnalyses.map((item) => <tr key={item.word}><th><Arabic>{item.word}</Arabic></th><td><Arabic>{item.root}</Arabic></td><td>{item.map}</td><td><strong><Arabic>{item.weight}</Arabic></strong><br />{item.detail}</td></tr>)}</tbody></DataTable><p>غفّار: الشدة تضعيف للأصل. صبور: الواو من بناء فعول. عليم: الياء من بناء فعيل. مِعطاء: مثال استعمال مرتبط بأعطى؛ لا يُقدّم تحويلًا حرفيًا مبسطًا يخفي الإعلال.</p></TeacherBlock>
    <TeacherBlock title="٥. نموذج إجابة الواجب المنزلي"><h4>١. خمس صيغ وأوزانها</h4><ol>{homeworkModel.words.map((item) => <li key={item}><Arabic>{item}</Arabic></li>)}</ol><h4>٢. جمل صحيحة ممكنة</h4><ul>{homeworkModel.sentences.map((item) => <li key={item}><Arabic>{item}</Arabic></li>)}</ul><h4>٣. المقارنة</h4><ul>{homeworkModel.compare.map((item) => <li key={item}>{item}</li>)}</ul><h4>٤. فقرة</h4><p>{homeworkModel.paragraph}</p><h4>٥. أمثلة الأوزان الخمسة</h4><p>فعّال: غفّار/كذّاب؛ مِفعال: مِقدام/مِعطاء؛ فعول: صبور/شكور؛ فعيل: عليم/رحيم؛ فَعِل: حَذِر/فَطِن.</p><p className="m13-note">{homeworkModel.note}</p></TeacherBlock>
    <TeacherBlock title="٦. تصحيحات علمية وتحريرية وحدود المصدر"><ul className="m13-teacher-list">{teacherNotes.map((note) => <li key={note}>{note}</li>)}</ul><ul><li>قُيّدت دلالة الكثرة والقوة بعبارة «بحسب السياق»، ولم يُعمّم الحكم من الوزن وحده.</li><li>شُرحت شدة غفّار كتضعيف لحرف أصلي، والياء/الواو/الألف في فعيل/فعول/فعّال ضمن بناء الوزن.</li><li>مِعطاء مثال مستعمل مرتبط بأعطى؛ لم تُقدّم قاعدة اشتقاق آلية، وفُصلت الزيادة عن أصول ع ط و مع ذكر حدود شرح الإعلال.</li><li>ضُبطت حَذِر على فَعِل، وفُرّقت عن حاذر. أمثلة الله عليم/رحيم عولجت كشواهد لغوية صرفية دون توسع عقدي.</li><li>صيغ سؤال التدريب الأول توضيحًا للاختيار من القائمة، مع حفظ هدفه وخياراته. ضُبط «مُعطًى» لمنع الخلط باسم المفعول.</li><li>لا يحتوي المصدر على صفحات كتاب أو مرجع؛ لا توجد إحالات صفحية. تفاصيل الشرح والتصحيح إضافات تعليمية للمنصة غير منسوبة لمصدر خارجي.</li><li>لم يقدم المصدر تفسيرًا مفصلًا لكل مشتت في التدريب؛ أضيفت التفسيرات اللازمة للتعلم من التحليل الصرفي، ولم تُنسب للمصدر.</li></ul></TeacherBlock>
    <TeacherBlock title="٧. المحتوى المصدر والحدود"><p>المصدر المتاح هو نص الدرس الملصق في المهمة كاملًا. لا توجد صفحات مرجعية متحققة. تم الحفاظ على أقسام الدرس وأسئلته ودرجاته وأمثلته المطلوبة مع ضبط وتوضيح موثقين في تقرير التدقيق.</p></TeacherBlock>
  </div></TeacherSpace>
}

export function LessonMorphologyThirteen({ onProgressChange, onFinish }: { onProgressChange?: (value: number) => void; onFinish?: () => void }) {
  const examEngine = useTestEngine(testDefinition)
  const [examSubmitted, setExamSubmitted] = useState(false)
  const [showExamSolutions, setShowExamSolutions] = useState(false)
  const exam: TestEngine = {
    ...examEngine,
    setAnswer(questionId, fieldIndex, value) { setExamSubmitted(false); setShowExamSolutions(false); examEngine.setAnswer(questionId, fieldIndex, value) },
    uncheckPage(pageId) { setExamSubmitted(false); setShowExamSolutions(false); examEngine.uncheckPage(pageId) },
    resetTest() { setExamSubmitted(false); setShowExamSolutions(false); examEngine.resetTest() },
  }
  const submitted = examSubmitted && examEngine.allPagesChecked
  const steps: LessonStepDefinition[] = [
    { id: 'm13-intro', title: 'تمهيد تفاعلي: اكتشف فرق الدلالة', group: 'الاكتشاف والمعنى', icon: '✦', render: () => <IntroStep /> },
    { id: 'm13-definition', title: 'تعريف صيغة المبالغة', group: 'الاكتشاف والمعنى', icon: '١', render: () => <DefinitionStep /> },
    { id: 'm13-weights', title: 'مختبر الأوزان الخمسة', group: 'محطات التحول', icon: '٢', render: () => <WeightStationStep /> },
    { id: 'm13-workshop', title: 'ورشة الميزان الصرفي', group: 'محطات التحول', icon: '٣', render: () => <WorkshopStep /> },
    { id: 'm13-compare', title: 'مختبر المقارنة بين المشتقات', group: 'التحليل والتطبيق', icon: '٤', render: () => <ComparisonStep /> },
    { id: 'm13-sentences', title: 'تحليل الجمل الست', group: 'التحليل والتطبيق', icon: '٥', render: () => <SentenceAnalysisStep /> },
    { id: 'm13-derivation', title: 'مختبر الاشتقاق', group: 'التحليل والتطبيق', icon: '٦', render: () => <DerivationStep /> },
    { id: 'm13-mistakes', title: 'الأخطاء الشائعة', group: 'التحليل والتطبيق', icon: '٧', render: () => <MistakesStep /> },
    { id: 'm13-training', title: 'التدريب التفاعلي — ٨ أسئلة', group: 'تدرّب واختبر', icon: '٨', render: () => <TrainingStep /> },
    ...testDefinition.pages.map((page) => ({ id: `m13-${page.id}`, title: page.title, group: 'الاختبار النهائي — ١٥ درجة', icon: '◇', render: () => <div className="m13-exam-page"><p>{testDefinition.description}</p><TestPageView page={page} engine={exam} revealFeedback={submitted} questionTestIdPrefix="m13-exam-question" /></div> })),
    { id: 'm13-exam-submit', title: 'تسليم الاختبار والنتيجة', group: 'الاختبار النهائي — ١٥ درجة', icon: '✓', render: () => <div className="m13-stack m13-exam-submit"><h3>مراجعة وتسليم الاختبار</h3><p>تحقّق من كل صفحة أولًا. لا تظهر صحة الإجابات أو المفاتيح قبل التسليم الكامل.</p><p className="m13-progress-summary" role="status">تم التحقق من <bdi>{examEngine.finalResult.pagesChecked}</bdi> من <bdi>{examEngine.finalResult.pagesTotal}</bdi> صفحات.</p><button type="button" className="m13-button m13-button--bright" disabled={!examEngine.allPagesChecked} onClick={() => { setExamSubmitted(true); setShowExamSolutions(false) }}>{submitted ? 'أُرسل الاختبار' : 'تسليم الاختبار وعرض النتيجة'}</button>{submitted && <div className="m13-final-result" data-testid="m13-exam-result" role="status"><p className="m13-kicker">الدرجة الآلية قبل مراجعة الإجابات الإنشائية</p><strong>{examEngine.finalResult.correct} / ١٥</strong><p>درجات صحيحة آليًا. توجد <bdi>{examEngine.finalResult.manual}</bdi> درجات إنشائية للمراجعة اليدوية، ودرجة الاختبار الكاملة ١٥.</p><button type="button" className="m13-button m13-button--outline" onClick={exam.resetTest}>إعادة الاختبار</button></div>}</div> },
    { id: 'm13-exam-solutions', title: 'تصحيح الاختبار بعد التسليم', group: 'الاختبار النهائي — ١٥ درجة', icon: '▤', render: () => <div className="m13-stack"><p>بعد التسليم فقط تظهر الإجابات الصحيحة والتفسير. الإجابات الإنشائية تقبل الصياغات السليمة غير المطابقة حرفيًا للنموذج.</p><button type="button" className="m13-button m13-button--dark" disabled={!submitted} aria-expanded={submitted && showExamSolutions} onClick={() => setShowExamSolutions(!showExamSolutions)}>{showExamSolutions ? 'إخفاء التصحيح' : 'عرض التصحيح بعد التسليم'}</button><SolutionsArea test={testDefinition} engine={exam} title="التصحيح التفسيري للاختبار النهائي" revealFeedback={submitted && showExamSolutions} testId="m13-exam-solutions" /></div> },
    { id: 'm13-homework', title: 'الواجب المنزلي', group: 'واجب وخلاصة', icon: '٩', render: () => <HomeworkStep /> },
    { id: 'm13-summary', title: 'ملخص الحفظ', group: 'واجب وخلاصة', icon: '١٠', render: () => <SummaryStep /> },
    { id: 'm13-teacher', title: 'منطقة المعلم', group: 'دليل المعلم', icon: '◆', render: () => <TeacherGuide /> },
    { id: 'm13-end', title: 'إتمام الدرس', group: 'الختام', icon: '✓', render: () => <div className="m13-finish-card"><h3>أحسنت! اكتملت رحلة الأوزان.</h3><p>تذكّر: نتحقق من الوزن والأصل والمعنى والاستعمال معًا.</p><p>اضغط «إتمام الدرس» للعودة إلى قسم الصرف.</p></div> },
  ]
  return <div className="m13-lesson" dir="rtl"><LessonFlow steps={steps} onProgressChange={onProgressChange} onFinish={onFinish} lessonTitle={lessonTitle} lessonNumber="١٣" lessonEyebrow="الصرف · مختبر الأوزان" /></div>
}
