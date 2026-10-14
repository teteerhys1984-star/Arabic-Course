import { useState, type ReactNode } from 'react'
import { LessonFlow, type LessonStepDefinition } from '../shared/components/LessonFlow'
import { TeacherSpace } from '../shared/teacher/TeacherSpace'
import { TestPageView, SolutionsArea, useTestEngine, type TestEngine, type TestDefinition } from '../shared/test'
import { challenges, checks, practice, finalQuestions, testDefinition as independentTest, type Activity } from './spelling-lesson-07/content'
import sourceUrl from '../../docs/source/spelling-lesson-07.md?url'
import auditUrl from '../../docs/spelling-lesson-07-audit.md?url'
import './spelling-lesson-07/lesson.css'

// eslint-disable-next-line react-refresh/only-export-components -- shared conformance registry
export const testDefinition: TestDefinition = independentTest

const cases = [
  { title: 'ألف المد', rule: 'إذا كانت الهمزة المتوسطة مفتوحة وسبقها مباشرة ألف مد، تُكتب مفردة على السطر.', words: ['قِرَاءَةٌ', 'عَبَاءَةٌ', 'مُسَاءَلَةٌ', 'تَسَاءَلَ'], reasons: ['القاف مكسورة، والراء مفتوحة، والألف حرف مد ساكن، والهمزة مفتوحة، والتاء المربوطة بعدها. الألف هي السابقة مباشرة، لا الراء. نكتب ء بلا كرسي.', 'الباء مفتوحة بعدها ألف مد ثم همزة مفتوحة؛ نطبق الشرطين ونكتب على السطر.', 'السين مفتوحة بعدها ألف مد ثم همزة مفتوحة، وبعدها لام. المساءلة محاسبة وليست مرادفًا آليًا للمسألة.', 'السين مفتوحة ثم ألف مد ثم همزة مفتوحة ثم لام؛ الفعل يدل على طرح سؤال على النفس أو الغير.'], sentences: ['أحبّ قراءةَ القصص المفيدة.', 'ارتدى الرجل عباءةً دافئة.', 'تستلزم المسؤولية مساءلةً عادلةً.', 'تساءلَ الطالب عن سبب اختلاف شكل الهمزة.'], error: '«قرائة» خطأ هنا؛ لا توجد كسرة على الهمزة، والياء الساكنة ليست السابقة. و«قراأة» لا تطابق الرسم المفرد في هذه الحالة.', comparison: 'قَائِلٌ: بعد ألف أيضًا لكن الهمزة مكسورة، فالنبرة. تَفَاؤُلٌ: الهمزة مضمومة، فالواو. لا يكفي وجود ألف مد دون فتح الهمزة.' },
  { title: 'الواو الساكنة', rule: 'إذا كانت الهمزة المتوسطة مفتوحة بعد واو ساكنة، تُرسم على السطر في النمط المدروس، سواء كانت الواو مدية أم غير مدية.', words: ['مُرُوءَةٌ', 'نُبُوءَةٌ', 'مَقْرُوءَةٌ'], reasons: ['الميم مضمومة، والراء مضمومة، والواو حرف مد ساكن، والهمزة مفتوحة، وبعدها تاء مربوطة. السابق المباشر هو الواو؛ لا نقارن بضمة الراء البعيدة.', 'النون مضمومة والباء مضمومة ثم واو مد ساكنة ثم همزة مفتوحة. لذلك الرسم مفرد على السطر.', 'الميم مفتوحة والقاف ساكنة والراء مضمومة ثم واو مد ساكنة ثم همزة مفتوحة. هي مؤنث مقروء، مشتقة من قرأ، والحكم يستند إلى صورتها الحالية لا حفظ أصلها فقط.'], sentences: ['عُرف الرجل بالمروءة والصدق؛ المروءة خُلُق كريم يجمع صون الكرامة والشجاعة والكرم.', 'قرأ الطالب عن نبوءة وردت في قصة تاريخية.', 'هذه قصة مقروءة ومفيدة.'], error: '«مروأة» تتجاهل شرط الواو الساكنة وتختار الألف من الفتحة وحدها. «مروئة» تختار النبرة بلا ياء ساكنة أو كسرة.', comparison: 'مُؤْمِنٌ: الميم مضمومة والهمزة ساكنة. ؤ كرسي الهمزة وليس واوًا تسبقها؛ الضمة أقوى من السكون فاختيرت الواو. في مُرُوءَة الواو حرف أصلي سابق مباشرة للهمزة المفتوحة، لا كرسي لها.' },
  { title: 'الياء الساكنة', rule: 'تُكتب الهمزة المتوسطة بعد الياء الساكنة على النبرة. في أمثلتنا الهمزة مفتوحة؛ لا نختار الألف من الفتحة وحدها.', words: ['بِيئَةٌ', 'هَيْئَةٌ', 'مَشِيئَةٌ', 'خَطِيئَةٌ'], reasons: ['الباء مكسورة ثم ياء مد ساكنة ثم همزة مفتوحة ثم تاء مربوطة. الياء هي الملاصقة؛ ليس التعليل «كسرة الباء» وحدها لأنها ليست السابقة مباشرة.', 'الهاء مفتوحة والياء ساكنة ثم الهمزة مفتوحة. الياء هنا ياء لين لا مد، لكن شرط الياء الساكنة متحقق؛ فتكتب على النبرة.', 'الميم مفتوحة والشين مكسورة ثم ياء مد ساكنة ثم همزة مفتوحة. المشيئة إرادة، والياء السابقة تقتضي النبرة في هذه الحالة.', 'الخاء مفتوحة والطاء مكسورة ثم ياء مد ساكنة ثم همزة مفتوحة. خطيئة تعني ذنبًا أو فعلًا خاطئًا؛ الكتابة على النبرة.'], sentences: ['نحافظ على البيئة نظيفة.', 'جلس الطالب في هيئةٍ منظمة.', 'لكل إنسان مشيئة واختيارات.', 'الصدق فضيلة، والكذب خطيئة.'], error: '«بيأة» تختار الألف من فتح الهمزة وتغفل الياء الساكنة. «بيءة» تعمم حكم السطر على كل مد، وهذا خطأ.', comparison: 'في «بيئة» ب + ي + ئ + ة: ي حرف من الكلمة، وئ همزة على كرسي النبرة، لا ياء منطوقة جديدة. في يَأْخُذُ الياء متحركة بالفتح والهمزة ساكنة، فلا تنطبق حالة الياء الساكنة؛ الألف بحسب قوة الفتحة.' },
]
const homework = [
  ['المستوى الأول — صنّف الكلمات', 'قراءة — بيئة — مروءة — هيئة — عباءة — نبوءة — مشيئة — مساءلة. صنّف إلى: سطر بعد ألف مد، سطر بعد واو ساكنة، نبرة بعد ياء ساكنة.', 'ألف: قراءة، عباءة، مساءلة. واو: مروءة، نبوءة. ياء: بيئة، هيئة، مشيئة. التعليل: تحقق السابق مباشرة وفتح الهمزة في مجموعتي السطر.'],
  ['المستوى الثاني — علّل', 'اكتب سبب رسم الهمزة في: قراءة، مروءة، بيئة، عباءة، هيئة.', 'قراءة وعباءة: همزة مفتوحة بعد ألف مد؛ سطر. مروءة: مفتوحة بعد واو ساكنة؛ سطر. بيئة وهيئة: بعد ياء ساكنة؛ نبرة (مد في بيئة ولين في هيئة).'],
  ['المستوى الثالث — تحدّي الكاتب المبدع', 'اكتب فقرة قصيرة عن المحافظة على البيئة واستعمل أربع كلمات على الأقل من: بيئة، قراءة، هيئة، مروءة، عباءة، مساءلة. ضع خطًا تحت الهمزة أو اذكر الكلمة في سطر منفصل، وعلّل شكلها.', 'حافظنا على بيئة نظيفة، وشكّلنا هيئة للعمل. ساعدتنا قراءة الإرشادات، وأظهر المتطوعون مروءة. بيئة وهيئة: بعد ياء ساكنة على النبرة؛ قراءة: فتح بعد ألف مد على السطر؛ مروءة: فتح بعد واو ساكنة على السطر. يقبل أي نص سليم يستعمل أربع كلمات مع تحديد همزاتها وتعليلها.'],
]

export function LessonSpellingSeven({ onFinish }: { onFinish?: () => void }) {
  // State is owned above LessonFlow: unmounting a step never clears its answers.
  const [choices, setChoices] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [writing, setWriting] = useState<Record<string, string>>({})
  const [revealed, setRevealed] = useState(false)
  const base = useTestEngine(testDefinition)
  const [submitted, setSubmitted] = useState(false)
  const show = submitted && base.allPagesChecked
  const engine: TestEngine = { ...base,
    setAnswer(id, field, value) { setSubmitted(false); base.setAnswer(id, field, value) },
    uncheckPage(id) { setSubmitted(false); base.uncheckPage(id) },
    resetTest() { setSubmitted(false); base.resetTest() },
  }
  function activities(items: Activity[], prefix: string) {
    return <div className="spell7-lab">{items.map((item, i) => {
      const id = `${prefix}-${i}`
      return <fieldset key={id} className="spell7-evidence"><legend>{i + 1}. {item.prompt}</legend>
        {item.options.map(option => <label key={option} className="spell7-choice"><input type="radio" name={id} checked={choices[id] === option} onChange={() => { setChoices(old => ({ ...old, [id]: option })); setChecked(old => ({ ...old, [id]: false })) }} /><bdi dir="rtl">{option}</bdi></label>)}
        <button type="button" className="button button--primary" disabled={!choices[id]} onClick={() => setChecked(old => ({ ...old, [id]: true }))}>تحقّق</button>
        {checked[id] && <div role="status"><strong>{choices[id] === item.answer ? 'إجابة صحيحة' : 'تحتاج إلى تصحيح'} — الصحيح: {item.answer}</strong><p>{item.explanation}</p><ul>{item.options.map(option => <li key={option}>«{option}»: {option === item.answer ? 'يوافق الدليل المذكور.' : `لا يوافق شروط هذا المثال. ${item.explanation}`}</li>)}</ul></div>}
      </fieldset>
    })}</div>
  }
  function textArea(id: string, label: string) {
    return <label className="spell7-writing">{label}<textarea rows={4} value={writing[id] || ''} onChange={event => { setWriting(old => ({ ...old, [id]: event.target.value })); if (id.startsWith('final')) setRevealed(false) }} /></label>
  }
  function summary() {
    return <div className="spell7-table"><table><caption>ملف المقارنة — حدّد الشرط قبل الرسم</caption><thead><tr><th>الحالة</th><th>طريقة كتابة الهمزة</th><th>أمثلة</th></tr></thead><tbody>
      <tr><td>مفتوحة بعد ألف مد</td><td>على السطر</td><td>قراءة، عباءة، مساءلة، تساءل</td></tr>
      <tr><td>مفتوحة بعد واو ساكنة</td><td>على السطر</td><td>مروءة، نبوءة، مقروءة</td></tr>
      <tr><td>بعد ياء ساكنة</td><td>على النبرة</td><td>بيئة، هيئة، مشيئة، خطيئة</td></tr>
    </tbody></table><p>الحالات الخاصة لا تلغي قاعدة قوة الحركات. افحص تحقق شروطها؛ إن لم تتحقق فقارن حركة الهمزة بالسابق مباشرة.</p></div>
  }
  const steps: LessonStepDefinition[] = []
  function add(id: string, title: string, group: string, content: ReactNode) {
    steps.push({ id: `spell7-${id}`, title, shortTitle: title, group, icon: '◈', render: () => content })
  }
  add('opening', 'مهمّة المحقّق الإملائي', 'الاستكشاف', <div className="spell7-opening"><p>قسم الإملاء · الدرس السابع · شرح موسّع وتطبيقات متدرجة</p><h3>من الكرسي إلى الدليل</h3><p>في الدرس السادس تعلّمنا مقارنة قوة الحركات. اليوم نحقق في الهمزة بعد ألف المد والواو الساكنة والياء الساكنة؛ نعرف لماذا كُتبت، ثم نختبر الاستنتاج على كلمة جديدة.</p><p>هدفنا ليس حفظ الكلمات وحدها: سنحدد موضع الهمزة وحركتها والسابق لها، ونعلل الرسم ونكشف الخطأ ونصححه.</p><p>اختياراتك وكتابتك محفوظة أثناء الانتقال بين خطوات هذه الجلسة. الدرس التعليمي يشرح ويتحقق؛ الاختبار المستقل لا يكشف الحلول حتى التسليم.</p></div>)
  add('map', 'خريطة التحقيق وأهداف التعلم', 'الاستكشاف', <><ol className="spell7-path"><li>حدّد: الهمزة بين ما قبلها وما بعدها، وليست في أول الكلمة أو آخرها.</li><li>اضبط: حركة الهمزة، والحرف السابق مباشرة وحركته.</li><li>افحص: ألف مد + فتح، واو ساكنة + فتح، أو ياء ساكنة.</li><li>قارن: إن لم تتحقق الحالة الخاصة استخدم قوة الحركات.</li><li>علّل وصحّح: اكتب الرسم واذكر الدليل، ثم طبّقه على كلمة جديدة.</li></ol><p>سنتعلم الحالات الثلاث، ونقارن الكلمات المتشابهة، ثم ننفذ تحديات وتدريبًا واختبارًا تعليميًا وواجبًا، واختبارًا مستقلًا.</p></>)
  add('strength', 'مراجعة ذكية — من الأقوى؟', 'بناء الدليل', <><ol className="spell7-path"><li>الكسرة: الأقوى؛ النبرة ئ.</li><li>الضمة: بعدها؛ الواو ؤ.</li><li>الفتحة: بعدها؛ الألف أ.</li><li>السكون: الأضعف؛ غياب الحركة، لا كرسي مستقل له.</li></ol><p>في مُؤَثِّرة: ميم مضمومة وهمزة مفتوحة، والضمة أقوى، فالواو. في مُؤْمِن: ميم مضمومة وهمزة ساكنة، فالواو أيضًا. لا تختَر الكرسي من فتحة الهمزة وحدها.</p><aside className="spell7-note">إضافة تأسيسية من المنصة: نستخدم القوة مع فحص الحالات الخاصة، لا بوصفها قاعدة آلية تتجاهل حروف المد.</aside></>)
  cases.forEach((item, i) => {
    add(`case-${i}`, `الحالة ${i + 1} — ${item.title}`, 'بناء الدليل', <><h3>{item.rule}</h3><p>المعنى العملي: لا تبدأ باسم الكرسي. اقرأ الهمزة والسابق مباشرة، ثم تحقق من الشرط كاملًا. الرسم على السطر يعني همزة بلا كرسي؛ والنبرة كرسي للهمزة.</p><ol className="spell7-path"><li>أحدد الهمزة المتوسطة داخل الكلمة.</li><li>أقرأ حركتها بدقة.</li><li>أحدد السابق مباشرة، لا الحرف الأبعد.</li><li>أفحص شرط {item.title} ثم أختار الرسم وأعلله.</li></ol><aside className="spell7-note">خطأ شائع: {item.error}</aside><h4>مقارنة لا يجوز إغفالها</h4><p>{item.comparison}</p>{activities([checks[i]], `check-${i}`)}</>)
    add(`files-${i}`, `ملفات الكلمات — ${item.title}`, 'بناء الدليل', <div className="spell7-wordfiles">{item.words.map((word, n) => <article className="spell7-evidence" key={word}><p className="spell7-word"><bdi dir="rtl" lang="ar">{word}</bdi></p><h4>تحليل حرفي للدليل</h4><p>{item.reasons[n]}</p><p>{item.sentences[n]}</p><p>الحكم: {item.rule}</p></article>)}</div>)
  })
  add('compare', 'لا تخلط بين الحالات الثلاث', 'التطبيق', summary())
  add('detective', 'تحدّي المحقّق الإملائي', 'التطبيق', <><p>اختر الرسم ثم اضغط تحقّق. حاول ذكر السبب قبل كشفه.</p>{activities(challenges, 'challenge')}</>)
  add('practice', 'تدريب تفاعلي — سبعة أسئلة', 'التطبيق', <><p>أسئلة المادة؛ السؤال السابع مصحّح إلى خيارات كلمات كاملة. التصويب موثق في سجل التدقيق.</p>{activities(practice, 'practice')}</>)
  add('final', 'الاختبار الختامي التعليمي — سبعة أسئلة', 'التطبيق', <><p>اكتب إجاباتك، ثم اكشف النماذج بعد محاولة الأسئلة السبعة. هذه إجابات حرة يراجعها المعلم، وليست درجة آلية.</p>{finalQuestions.map(([prompt], i) => <div key={prompt}>{textArea(`final-${i}`, `${i + 1}. ${prompt}`)}</div>)}<button type="button" className="button button--primary" disabled={!finalQuestions.every((_, i) => writing[`final-${i}`]?.trim())} onClick={() => setRevealed(true)}>كشف الإجابات النموذجية بعد المحاولة</button>{revealed && <div role="status">{finalQuestions.map(([prompt, answer]) => <article key={prompt}><h4>{prompt}</h4><p>{answer}</p></article>)}</div>}</>)
  add('summary', 'ملخص الدرس — احفظه وراجعه', 'الخلاصة والواجب', summary())
  homework.forEach(([title, prompt], i) => add(`homework-${i}`, title, 'الخلاصة والواجب', <><p>{prompt}</p>{textArea(`homework-${i}`, 'اكتب إجابتك هنا؛ النموذج في منطقة المعلم')}<p>تُراجع الإجابة الحرة مع المعلم وفق صحة الرسم ودقة التعليل، لا بمجرد مطابقة نموذج واحد.</p></>))
  add('mastery', 'تحدّي الإتقان والدرس التالي', 'الخلاصة والواجب', <><h3>معيار الإتقان</h3><p>اكتب كلمة صحيحة من كل حالة واذكر حركة الهمزة والسابق مباشرة والحكم، ثم طبّق ذلك على كلمة جديدة مثل جُزَيْئَة. الإتقان: ثلاث حالات صحيحة رسمًا وتعليلًا وتطبيق جديد صحيح. إن أخطأت ارجع إلى ملف الحالة وأعد المحاولة.</p>{textArea('mastery', 'اكتب الأدلة الأربعة وراجعها مع المعلم')}<h4>إشارة استشرافية فقط</h4><p>في الدرس الثامن سننتقل إلى التاء المربوطة والتاء المفتوحة والهاء في آخر الكلمة، والتمييز بينها في النطق والوصل والوقف. لا يوجد درس ثامن أو اختبار وحدة مضاف هنا.</p></>)
  testDefinition.pages.forEach((page, i) => add(`test-${i}`, page.title, 'منطقة الاختبارات', <><p>{testDefinition.description}</p><TestPageView page={page} engine={engine} revealFeedback={show} questionTestIdPrefix="spell7-question" /></>))
  add('submit', 'تسليم الاختبار والنتيجة', 'منطقة الاختبارات', <><p>لن تظهر الدرجة حتى تسلّم الاختبار. الإجابات غير المكتملة تحتسب غير مجابة عند التسليم.</p><button type="button" className="button button--primary" onClick={() => { testDefinition.pages.forEach(page => base.checkPage(page.id)); setSubmitted(true) }}>تسليم الاختبار</button>{show && <p role="status" data-testid="spell7-result">النتيجة: {base.finalResult.correct} من {base.finalResult.total}</p>}<button type="button" className="button button--ghost" onClick={engine.resetTest}>إعادة الاختبار المستقل</button></>)
  add('solutions', 'حلول الاختبار المستقل', 'حلول الاختبارات', show ? <SolutionsArea test={testDefinition} engine={engine} revealFeedback={show} /> : <p>الحلول مقفلة حتى تسليم الاختبار؛ حفظ صفحة لا يكشفها.</p>)
  add('teacher', 'منطقة المعلم', 'دليل المعلم', <TeacherSpace><h3>نماذج المادة والأنشطة والواجب</h3><p>الإجابات الكتابية مراجعة بشرية. اقبل بدائل صحيحة مع تحديد السابق مباشرة وتعليل الرسم، واطلب معالجة السبب لا نسخ النموذج.</p>{cases.map(item => <article key={item.title}><h4>{item.title}</h4><p>{item.rule}</p>{item.words.map((word,i) => <p key={word}>{word}: {item.reasons[i]}</p>)}<p>المعالجة: {item.error} {item.comparison}</p></article>)}{[...challenges,...checks,...practice].map((item,i) => <p key={i}>{item.prompt} — {item.answer}: {item.explanation}</p>)}{finalQuestions.map(([prompt,answer]) => <p key={prompt}>{prompt} — {answer}</p>)}{homework.map(([title,,answer]) => <article key={title}><h4>{title}</h4><p>{answer}</p></article>)}<p>الإتقان: ثلاثة رسوم وتعليلات صحيحة للحالات، وتطبيق جديد: جُزَيْئَة، بعد ياء ساكنة على النبرة. اطلب إعادة التحليل عند التعليل بحرف غير ملاصق.</p><a href={sourceUrl} download>المادة الأصلية</a> · <a href={auditUrl} download>سجل التدقيق والتغطية</a><p>حلول الاختبار المستقل في منطقة حلول الاختبارات المنفصلة، لا تنقل إلى هنا.</p></TeacherSpace>)
  return <div className="spell7-lesson" dir="rtl"><LessonFlow steps={steps} lessonTitle="مهمّة المحقّق الإملائي: الهمزة المتوسطة في الحالات الخاصة والمتقدمة" lessonNumber="٧" lessonEyebrow="قسم الإملاء" onFinish={onFinish} /></div>
}
