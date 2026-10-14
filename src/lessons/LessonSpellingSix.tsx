import { useRef, useState, type ReactNode } from 'react'
import { LessonFlow, type LessonFlowController, type LessonStepDefinition } from '../shared/components/LessonFlow'
import { TestPageView, SolutionsArea, useTestEngine, type TestDefinition, type TestEngine } from '../shared/test'
import * as C from './spelling-lesson-06/content'
import {
  CaseReminder,
  ClassificationLab,
  CommonErrorsLab,
  FinalChallengeLab,
  HomeworkLevelOneLab,
  HomeworkLevelTwoLab,
  MovementLab,
  SourcePracticeLab,
  SpecialCaseLab,
} from './spelling-lesson-06/activities'
import { TeacherArea } from './spelling-lesson-06/teacher'
import { LessonMemoryProvider, useLessonState } from './spelling-lesson-06/state'
import { ActivityTag, ArabicNumber, ChairBadge, CorrectionCard, LessonNote, WordFocus } from './spelling-lesson-06/presentation'
import sourceUrl from '../../docs/source/spelling-lesson-06.md?url'
import auditUrl from '../../docs/spelling-lesson-06-audit.md?url'
import './spelling-lesson-06.css'

// eslint-disable-next-line react-refresh/only-export-components -- the shared test-conformance registry imports this definition.
export const testDefinition: TestDefinition = C.testDefinition

interface Props {
  onProgressChange?: (value: number) => void
  onFinish?: () => void
}

function RadioGroup({
  name,
  label,
  options,
  value,
  onChange,
}: {
  name: string
  label: string
  options: readonly string[]
  value?: string
  onChange: (value: string) => void
}) {
  return (
    <fieldset className="spell6-radio-group">
      <legend>{label}</legend>
      <div className="spell6-radio-group__options">
        {options.map((option) => (
          <label className="spell6-radio-choice" key={option}>
            <input type="radio" name={name} value={option} checked={value === option} onChange={() => onChange(option)} />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function Feedback({ correct, children, testId }: { correct: boolean; children: ReactNode; testId?: string }) {
  return <div className={`spell6-feedback ${correct ? 'spell6-feedback--correct' : 'spell6-feedback--wrong'}`} role="status" aria-live="polite" data-testid={testId}>
    <strong>{correct ? 'أحسنت، إجابة صحيحة.' : 'راجع الإجابة والتعليل.'}</strong>
    <div>{children}</div>
  </div>
}

function OpeningStep() {
  return (
    <div className="spell6-opening" data-testid="spell6-opening">
      <div className="spell6-opening__ribbon"><span>رحلة إملائية تفاعلية</span><span>الدرس السادس</span></div>
      <h3>الهمزة المتوسطة</h3>
      <p className="spell6-opening__subtitle">«رحلة إلى كرسي الهمزة!»</p>
      <p>تخيّل الهمزة حرفًا يبحث عن موضع كتابي مناسب: قد تجلس على الألف أو الواو أو النبرة، وقد تُكتب مفردة على السطر في حالات محددة. في رحلتنا لن نحفظ شكل الكلمة وحده؛ سنتتبّع حركة الهمزة والحرف الذي يسبقها مباشرةً، ثم نفحص الحالة الخاصة.</p>
      <div className="spell6-opening__chairs" aria-label="صور كرسي الهمزة والرسم على السطر">
        {(['alif', 'waw', 'nabra', 'line'] as const).map((chair) => <ChairBadge key={chair} chair={chair} large />)}
      </div>
      <div className="spell6-opening__footer"><span>اقرأ</span><span aria-hidden="true">←</span><span>قارن</span><span aria-hidden="true">←</span><span>اختر</span><span aria-hidden="true">←</span><span>علّل</span></div>
      <LessonNote title="كيف تستخدم الدرس؟" tone="info">
        <p>تحرّك بين الخطوات كما تشاء؛ تُحفظ اختياراتك في الأنشطة عند مغادرة الخطوة والعودة إليها. كل نشاط له زر إعادة مستقل، ولا تُكشف حلول الاختبار المستقل أو نتيجته قبل التسليم الصريح.</p>
      </LessonNote>
    </div>
  )
}

function WarmupStep() {
  const [answers, setAnswers] = useLessonState<Record<string, string>>('position-warmup-answers', {})
  const [checked, setChecked] = useLessonState<Record<string, boolean>>('position-warmup-checked', {})
  const options = ['ابتدائية', 'متوسطة', 'متطرفة']
  return (
    <div className="spell6-activity-stack" data-testid="spell6-warmup">
      <ActivityTag>نشاط تمهيدي من المنصة · يميّز موضع الهمزة قبل اختيار كرسيها</ActivityTag>
      <p>قبل أن نختار الكرسي، حدّد موضع الهمزة. لكل كلمة اختر: أولية، متوسطة، أم متطرفة.</p>
      {C.positionExamples.map((item, index) => {
        const selected = answers[item.id]
        const didCheck = Boolean(checked[item.id])
        const correct = selected === item.answer
        return <article className="spell6-activity-card spell6-position-card" key={item.id} data-testid={`spell6-position-${item.id}`}>
          <h3>الكلمة {index + 1}</h3>
          <p className="spell6-position-card__word"><bdi dir="rtl" lang="ar">{item.word}</bdi></p>
          <RadioGroup
            name={`position-${item.id}`}
            label="موضع الهمزة:"
            options={options}
            value={selected}
            onChange={(value) => { setAnswers((current) => ({ ...current, [item.id]: value })); setChecked((current) => ({ ...current, [item.id]: false })) }}
          />
          <button className="button button--primary" type="button" disabled={!selected} onClick={() => setChecked((current) => ({ ...current, [item.id]: true }))}>تحقّق من الموضع</button>
          {didCheck && selected && <Feedback correct={correct} testId={`spell6-feedback-${item.id}`}>
            <p>{correct ? item.explanation : `اخترتَ «${selected}»، والموضع الصحيح «${item.answer}». ${item.explanation}`}</p>
          </Feedback>}
        </article>
      })}
      <button className="button button--ghost spell6-reset" type="button" onClick={() => { setAnswers({}); setChecked({}) }}>إعادة نشاط الموضع فقط</button>
    </div>
  )
}

function DefinitionStep() {
  return (
    <div className="spell6-content-stack" data-testid="spell6-definition">
      <div className="spell6-definition-grid">
        {[
          ['سَأَلَ', 'الهمزة في وسط الكلمة، على الألف.'],
          ['مُؤْمِنٌ', 'الهمزة في الوسط، على الواو.'],
          ['فِئَةٌ', 'الهمزة في الوسط، على النبرة.'],
          ['مَسْأَلَةٌ', 'الهمزة في الوسط؛ والسين هي السابقة مباشرة.'],
        ].map(([word, text]) => <article className="spell6-definition-card" key={word}>
          <bdi dir="rtl" lang="ar">{word}</bdi><p>{text}</p>
        </article>)}
      </div>
      <p>الهمزة المتوسطة هي الهمزة الواقعة داخل الكلمة بين ما قبلها وما بعدها. نقارن رسمها بالهمزة الأولية في <bdi dir="rtl">أَحْمَدُ</bdi>، وبالهمزة المتطرفة في <bdi dir="rtl">شَاطِئٌ</bdi>؛ لكل موضع بابه الإملائي.</p>
      <LessonNote title="حدّد الهمزة المقصودة قبل التحليل" tone="caution">
        <p>قد تحتوي الكلمة أكثر من همزة؛ في <bdi dir="rtl">أَسْئِلَةٌ</bdi> مثلًا، الهمزة الأولى ابتدائية، والهمزة الثانية هي المتوسطة. حلّل كل همزة في موضعها ولا تجعل الأولى تختار كرسي الثانية.</p>
      </LessonNote>
    </div>
  )
}

function StrengthStep() {
  return (
    <div className="spell6-content-stack" data-testid="spell6-strength">
      <p>قبل اختيار الصورة، قارن حركة الهمزة نفسها بحركة الحرف السابق لها مباشرة. في القاعدة العامة يكون الترتيب:</p>
      <ol className="spell6-strength-ladder">
        {C.strengthOrder.map((item, index) => <li className={`spell6-strength-ladder__item spell6-strength-ladder__item--${item.id}`} key={item.id}>
          <span className="spell6-strength-ladder__rank">{index + 1}</span>
          <span className="spell6-strength-ladder__movement"><bdi dir="rtl">{item.glyph}</bdi> {item.label}</span>
          <span className="spell6-strength-ladder__meta">{item.rank}</span>
          <span className="spell6-strength-ladder__chair">{item.chair}</span>
        </li>)}
      </ol>
      <div className="spell6-rule-links"><span>الكسرة ← النبرة</span><span>الضمة ← الواو</span><span>الفتحة ← الألف</span></div>
      <CorrectionCard item={C.sourceCorrections[0]} />
      <LessonNote title="تنبيه على السكون" tone="info">
        <p>السكون علامة أن الحرف غير متحرك، وليس حركةً صوتية كالحركات الثلاث. نضعه في آخر الترتيب الإملائي التعليمي لأنه أضعف، ولا نستنتج من سكون الهمزة وحده كرسيها.</p>
      </LessonNote>
      <ActivityTag />
      <MovementLab />
    </div>
  )
}

function DecisionStep() {
  return (
    <div className="spell6-content-stack" data-testid="spell6-decision">
      <p>اتبِع مسار القرار بهذا الترتيب، ولا تختصر خطوة «السابق مباشرة» أو فحص الحالة الخاصة.</p>
      <ol className="spell6-decision-path">
        {C.generalDecision.map((item) => <li key={item.step}>
          <span className="spell6-decision-path__step">{item.step}</span>
          <div><h3>{item.title}</h3><p>{item.text}</p></div>
        </li>)}
      </ol>
      <CorrectionCard item={C.sourceCorrections[1]} />
      <LessonNote title="القرار المختصر" tone="info">
        <p>الهمزة → حركتها → السابق الملاصق وحركته → المقارنة العامة → الحالة الخاصة → صورة الكتابة → تعليل يذكر الدليل.</p>
      </LessonNote>
    </div>
  )
}

function WordCard({ example }: { example: C.WordExample }) {
  return (
    <article className="spell6-example-card" data-testid={`spell6-example-${example.id}`}>
      <div className="spell6-example-card__topline">
        {example.source ? <span className="spell6-source-pill">مثال من المادة</span> : <span className="spell6-addition-pill">مثال توضيحي إضافي</span>}
        <ChairBadge chair={example.chair} />
      </div>
      <WordFocus example={example} compact />
      <p className="spell6-example-card__explanation">{example.explanation}</p>
      {example.special && <p className="spell6-example-card__note">{example.special}</p>}
    </article>
  )
}

function SeatStep({ chair, heading, lead, corrections = [] }: {
  chair: C.ChairId
  heading: string
  lead: string
  corrections?: readonly string[]
}) {
  const examples = C.seatExamples[chair]
  return (
    <div className="spell6-content-stack" data-testid={`spell6-seat-${chair}`}>
      <h3 className="spell6-seat-heading">{heading}</h3>
      <p className="spell6-seat-lead">{lead}</p>
      <div className="spell6-example-grid">{examples.map((example) => <WordCard key={example.id} example={example} />)}</div>
      {corrections.map((id) => {
        const correction = C.sourceCorrections.find((item) => item.id === id)
        return correction ? <CorrectionCard item={correction} key={id} /> : null
      })}
      {chair === 'nabra' && <LessonNote title="لا تخلط النبرة بالياء" tone="caution"><p>في «ئ» الهمزة محمولة على النبرة؛ لا تُضف ياءً منطوقة بين الهمزة وبقية الكلمة. وفي <bdi dir="rtl">بِيئَةٌ</bdi> السابقة المباشرة ياء ساكنة، لا الباء.</p></LessonNote>}
      {chair === 'line' && <CaseReminder />}
      <p className="spell6-source-coverage">جميع أمثلة هذا الموضع معروضة ومعلَّلة؛ راجع منطقة المعلم لمفتاح مفصل وجرد المصدر.</p>
    </div>
  )
}

function AnalysisStep() {
  const examples = [C.seatExamples.waw[0], C.seatExamples.nabra[0], C.seatExamples.waw.find((example) => example.id === 'sual')!]
  return (
    <div className="spell6-content-stack" data-testid="spell6-analysis">
      <p>نحلّل أمثلة المادة الأصلية في سبع محطات، لا بقفزة مباشرة من الكلمة إلى كرسيها:</p>
      <ol className="spell6-analysis-steps">{C.generalDecision.map((item) => <li key={item.step}><bdi>{item.step}</bdi> {item.title}: {item.text}</li>)}</ol>
      <div className="spell6-analysis-grid">
        {examples.map((example, index) => <article className="spell6-analysis-card" key={example.id}>
          <h3>الحالة {index + 1}</h3><WordFocus example={example} compact />
          <ol>
            <li>نعيّن الهمزة المتوسطة.</li>
            <li>حركة الهمزة: <strong>{example.hamzaMovement}</strong>.</li>
            <li>حركة السابق مباشرة: <strong>{example.previousMovement}</strong>.</li>
            <li>المقارنة: <strong>{example.strongerMovement}</strong>.</li>
            <li>{example.special ? `نفحص الحالة الخاصة: ${example.special}` : 'لا تظهر في هذا المثال حالة مدّ خاصة.'}</li>
            <li>الرسم المختار: <ChairBadge chair={example.chair} />.</li>
            <li>{example.explanation}</li>
          </ol>
        </article>)}
      </div>
      <LessonNote title="لا تحفظ الشكل وحده" tone="info"><p>اسأل: أين الهمزة؟ ما حركتها؟ ما حركة الحرف السابق مباشرة؟ أيهما أقوى؟ وهل يغيّر حرف المد أو الياء الساكنة الحكم؟ بعد ذلك فقط اذكر الكرسي وسبب الاختيار.</p></LessonNote>
    </div>
  )
}

function CommonErrorsStep() {
  return (
    <div className="spell6-content-stack" data-testid="spell6-common-errors">
      <p>اقرأ الفكرة الخاطئة أولًا، ثم حلّ التمرين لتختار التصحيح. لن تظهر تفسيرات المشتتات إلا بعد التحقق.</p>
      <ul className="spell6-misconception-preview">{C.commonErrors.map((item) => <li key={item.id}><strong>{item.heading}:</strong> <bdi dir="rtl">{item.wrong}</bdi></li>)}</ul>
      <ActivityTag />
      <CommonErrorsLab />
    </div>
  )
}

function ClassificationStep() {
  return <div className="spell6-content-stack" data-testid="spell6-seat-lab">
    <p>لكل كلمة، اختر الكرسي ثم اختر تعليلًا يذكر حركة الهمزة والسابق الملاصق. النتيجة لا تظهر قبل ضغط التحقق.</p>
    <ActivityTag />
    <ClassificationLab />
  </div>
}

function SummaryStep({ onJump }: { onJump: (stepId: string) => void }) {
  const [expanded, setExpanded] = useLessonState<string | undefined>('summary-expanded-branch', undefined)
  return (
    <div className="spell6-content-stack" data-testid="spell6-summary">
      <p>اختر الحالة التي تنطبق على الكلمة، ثم افتح الفرع للقاعدة والمثال ورابط العودة إلى الشرح.</p>
      <div className="spell6-summary-grid">
        {C.summaryBranches.map((branch) => {
          const isOpen = expanded === branch.id
          return <article className={`spell6-summary-card${isOpen ? ' spell6-summary-card--open' : ''}`} key={branch.id} data-testid={`spell6-summary-${branch.id}`}>
            <button type="button" aria-expanded={isOpen} onClick={() => setExpanded(isOpen ? undefined : branch.id)}>
              <span className="spell6-summary-card__title">{branch.title}</span><span>{isOpen ? 'إخفاء' : 'الشرح الموسّع'}</span>
            </button>
            {isOpen && <div className="spell6-summary-card__body">
              <p><strong>القاعدة:</strong> {branch.rule}</p>
              <p><strong>مثال:</strong> <bdi dir="rtl">{branch.example}</bdi></p>
              <button className="button button--ghost" type="button" onClick={() => onJump(branch.stepId)}>العودة إلى شرح {branch.id === 'ya' ? 'الياء الساكنة' : branch.title.replace('إن فازت ', '')}</button>
            </div>}
          </article>
        })}
      </div>
      <LessonNote title="قاعدة الحفظ" tone="info"><p>قاعدة أقوى الحركتين عامة؛ بعد ألف/واو ساكنتين مع فتح الهمزة يكون الرسم مفردًا على السطر في النمط المدروس، وبعد الياء الساكنة تُكتب على النبرة. لا تعمم حكمًا خاصًا على كل حروف المد.</p></LessonNote>
    </div>
  )
}

function HomeworkCreativeStep() {
  const [draft, setDraft] = useLessonState<string>('creative-homework-draft', '')
  const [checked, setChecked] = useLessonState<boolean>('creative-homework-checked', false)
  const lines = draft.trim() ? draft.trim().split(/\n+/u).filter(Boolean).length : 0
  const hamzas = (draft.match(/[ءؤئأإ]/gu) ?? []).length
  const ready = lines >= 5 && hamzas >= 5
  return (
    <div className="spell6-content-stack" data-testid="spell6-homework-creative">
      <p>{C.creativeHomework.prompt}</p>
      <label className="spell6-textarea-label" htmlFor="spell6-creative-draft">مسودتك (ضع علامة واضحة تحت/حول كل همزة، واكتب تعليلًا):</label>
      <textarea id="spell6-creative-draft" rows={9} value={draft} onChange={(event) => { setDraft(event.target.value); setChecked(false) }} placeholder="اكتب خمسة أسطر على الأقل، ثم علّل الكلمات ذات الهمزة المتوسطة." />
      <div className="spell6-activity-actions">
        <button className="button button--primary" type="button" disabled={!draft.trim()} onClick={() => setChecked(true)}>راجع اكتمال المسودة</button>
        <button className="button button--ghost" type="button" onClick={() => { setDraft(''); setChecked(false) }}>إعادة مسودة الواجب فقط</button>
      </div>
      {checked && <Feedback correct={ready} testId="spell6-feedback-creative-homework">
        <p>المسودة تحتوي على {lines} أسطر غير فارغة و{hamzas} من علامات الهمزة الظاهرة. {ready ? 'أكمل الآن مراجعة صحة الرسم والتعليل لكل كلمة.' : 'أضف أسطرًا أو كلمات ذات همزة متوسطة حتى تستوفي العدد المطلوب.'}</p>
        <p><strong>تنبيه:</strong> هذا فحص اكتمال شكلي فقط؛ لا يحكم آليًا على صحة الكلمات أو جودة التعليل، ويُراجع وفق المعيار أدناه أو مع المعلم.</p>
      </Feedback>}
      <details className="spell6-homework-rubric">
        <summary>افتح معيار المراجعة الذاتي</summary>
        <ul className="spell6-list">{C.creativeHomework.rubric.map((item) => <li key={item}>{item}</li>)}</ul>
      </details>
    </div>
  )
}

function HomeworkIntroStep() {
  return <div className="spell6-content-stack" data-testid="spell6-homework-one">
    <p>أنجز المستويات بالترتيب أو وفق توجيه معلمك: تحديد الكرسي، ثم التعليل، ثم كتابة فقرة. ملاحظاتك تبقى محفوظة عند التنقل.</p>
    <div className="spell6-homework-instructions"><span>المستوى ١ · اكتشف الكرسي</span><span>المستوى ٢ · علّل</span><span>المستوى ٣ · تحدّي الكاتب</span></div>
    <ActivityTag>تدريب واجب من المادة الأصلية · غير داخل في درجة الاختبار المستقل</ActivityTag>
    <HomeworkLevelOneLab />
  </div>
}

function HomeworkReasonStep() {
  return <div className="spell6-content-stack" data-testid="spell6-homework-two">
    <p>اختر التعليل الأقرب لكل كلمة. في «بِيئَةٌ» لا تذكر الباء على أنها السابقة مباشرة؛ هناك ياء ساكنة بينهما.</p>
    <HomeworkLevelTwoLab />
  </div>
}

function SourceFinalStep({ engine, revealed, onReveal, onReset }: {
  engine: TestEngine
  revealed: boolean
  onReveal: () => void
  onReset: () => void
}) {
  const page = C.sourceFinalDefinition.pages[0]
  return <div className="spell6-content-stack" data-testid="spell6-source-final">
    <p>{C.sourceFinalDefinition.description}</p>
    <p className="spell6-source-pill">اختبار المادة الأصلية · ٧ أسئلة · مستقل عن اختبار المنصة ذي ٢٠ سؤالًا</p>
    <TestPageView page={page} engine={engine} questionTestIdPrefix="spell6-source-question" revealFeedback={revealed} />
    <div className="spell6-source-final-actions">
      <button className="button button--primary" type="button" onClick={onReveal}>اكشف الإجابات النموذجية بعد المحاولة</button>
      <button className="button button--ghost" type="button" onClick={onReset}>إعادة اختبار المصدر فقط</button>
    </div>
    <p>{revealed ? 'كُشفت الحلول في الخطوة المستقلة التالية؛ يمكنك العودة إلى الأسئلة ومراجعتها.' : 'لم تُعرض بعد أي إجابة نموذجية أو نتيجة؛ استخدم زر الكشف بعد محاولتك.'}</p>
  </div>
}

function SourceFinalSolutionsStep({ engine, revealed }: { engine: TestEngine; revealed: boolean }) {
  return revealed
    ? <SolutionsArea test={C.sourceFinalDefinition} engine={engine} testId="spell6-source-final-solutions" revealFeedback={revealed} title="حلول الاختبار الختامي الوارد في المادة" eyebrow="حلول مصدرية · بعد طلب الكشف" />
    : <div className="spell6-locked" data-testid="spell6-source-solutions-locked"><h3>الحلول المصدرية لم تُكشف بعد</h3><p>أجب في خطوة «الاختبار الختامي الوارد في المادة»، ثم اطلب كشف الإجابات النموذجية. هذا الكشف منفصل عن اختبار الدرس المستقل.</p></div>
}

function SubmitStep({ engine, submitted, onSubmit, onReset }: {
  engine: TestEngine
  submitted: boolean
  onSubmit: () => void
  onReset: () => void
}) {
  const result = engine.finalResult
  return (
    <div className="spell6-submit" data-testid="spell6-submit-step">
      {!submitted ? <>
        <h3>مراجعة قبل التسليم</h3>
        <p>يتكون الاختبار من <ArabicNumber value={C.examQuestionPlan.length} /> سؤالًا في أربع صفحات. لن تظهر صحة إجابة أو درجة عند التحقق من صفحة منفردة؛ استخدم الزر أدناه عندما تريد تسليم الاختبار وكشف النتيجة.</p>
        <button className="button button--primary" type="button" onClick={onSubmit}>سلّم الاختبار واكشف النتيجة</button>
      </> : <>
        <h3>تم التسليم</h3>
        <p className="spell6-submit__score" role="status" data-testid="spell6-final-score">النتيجة: <ArabicNumber value={result.correct} /> صحيحة من <ArabicNumber value={result.total} /> · <ArabicNumber value={result.wrong} /> غير صحيحة · <ArabicNumber value={result.unanswered} /> لم تُجب.</p>
        <p>{result.complete ? 'تم التحقق من الصفحات الأربع. انتقل إلى خطوة حلول الاختبار لمراجعة كل سؤال وسببه.' : 'لم يكتمل التحقق من جميع الصفحات؛ أعد التسليم بعد إكمالها.'}</p>
        <button className="button button--ghost" type="button" onClick={onReset}>إعادة الاختبار المستقل</button>
      </>}
    </div>
  )
}

function IndependentSolutionsStep({ engine, submitted }: { engine: TestEngine; submitted: boolean }) {
  return submitted
    ? <SolutionsArea test={testDefinition} engine={engine} testId="spell6-solutions" revealFeedback={submitted} title="حلول الاختبار المستقل — الهمزة المتوسطة" eyebrow="حلول الاختبار · بعد التسليم" />
    : <div className="spell6-locked" data-testid="spell6-solutions-locked"><h3>حلول الاختبار مقفلة حتى التسليم</h3><p>إجابات الصفحات محفوظة، لكن لا تُكشف الإجابات الصحيحة أو التفسيرات أو الدرجة حتى تسليم الاختبار من الخطوة المخصصة.</p></div>
}

export function LessonSpellingSix({ onProgressChange, onFinish }: Props) {
  const flowRef = useRef<LessonFlowController | null>(null)
  const examEngineBase = useTestEngine(testDefinition)
  const [examSubmitted, setExamSubmitted] = useState(false)
  const submitted = examSubmitted && examEngineBase.allPagesChecked
  const sourceEngineBase = useTestEngine(C.sourceFinalDefinition)
  const [sourceRevealed, setSourceRevealed] = useState(false)

  const examEngine: TestEngine = {
    ...examEngineBase,
    setAnswer(questionId, fieldIndex, value) { setExamSubmitted(false); examEngineBase.setAnswer(questionId, fieldIndex, value) },
    uncheckPage(pageId) { setExamSubmitted(false); examEngineBase.uncheckPage(pageId) },
    resetTest() { setExamSubmitted(false); examEngineBase.resetTest() },
  }
  const sourceEngine: TestEngine = {
    ...sourceEngineBase,
    setAnswer(questionId, fieldIndex, value) { setSourceRevealed(false); sourceEngineBase.setAnswer(questionId, fieldIndex, value) },
    uncheckPage(pageId) { setSourceRevealed(false); sourceEngineBase.uncheckPage(pageId) },
    resetTest() { setSourceRevealed(false); sourceEngineBase.resetTest() },
  }

  function submitExam() {
    for (const page of testDefinition.pages) examEngineBase.checkPage(page.id)
    setExamSubmitted(true)
  }
  function revealSourceAnswers() {
    sourceEngineBase.checkPage(C.sourceFinalDefinition.pages[0].id)
    setSourceRevealed(true)
  }

  const G = {
    opening: 'التمهيد والاستكشاف',
    rules: 'بناء القاعدة',
    practice: 'المختبر والتطبيق',
    source: 'تدريب المادة الأصلية',
    wrap: 'الخلاصة والواجب',
    test: 'اختبار مستقل · ٢٠ سؤالًا',
    teacher: 'دليل المعلم',
  }
  const steps: LessonStepDefinition[] = [
    step('opening', 'رحلة إلى كرسي الهمزة!', G.opening, '✧', <OpeningStep />),
    step('warmup', 'التمهيد: أين تقع الهمزة؟', G.opening, '١', <WarmupStep />),
    step('definition', 'ما الهمزة المتوسطة؟', G.opening, '٢', <DefinitionStep />),
    step('strength', 'السرّ الأساسي: ترتيب الحركات', G.rules, '٣', <StrengthStep />),
    step('decision', 'خريطة قرار اختيار الكرسي', G.rules, '٤', <DecisionStep />),
    step('alif', 'الهمزة المتوسطة على الألف (أ)', G.rules, '٥', <SeatStep chair="alif" heading="الهمزة على الألف" lead="تلائم الألف الفتحة في القاعدة العامة: سواء تساوت الفتحتان أو غلبت فتحة الهمزة/السابق المباشر سكون الطرف الآخر." corrections={['ت-٢', 'ت-٣', 'ت-٩']} />),
    step('waw', 'الهمزة المتوسطة على الواو (ؤ)', G.rules, '٦', <SeatStep chair="waw" heading="الهمزة على الواو" lead="تلائم الواو الضمة عندما تكون أقوى الحركتين في القاعدة العامة؛ لا تختَر الألف لمجرد أن الهمزة مفتوحة." corrections={['ت-٤', 'ت-٩']} />),
    step('nabra', 'الهمزة المتوسطة على النبرة (ئ)', G.rules, '٧', <SeatStep chair="nabra" heading="الهمزة على النبرة" lead="الكسرة تناسب النبرة عندما تكون الحركة الأقوى في القاعدة العامة. افحص حالة الياء الساكنة كما في «بِيئَة» بدل تعليلها بكسرة حرف أسبق." corrections={['ت-٥', 'ت-٧', 'ت-١٠']} />),
    step('line', 'متى تُكتب الهمزة مفردة على السطر؟', G.rules, '٨', <SeatStep chair="line" heading="الرسم المفرد على السطر" lead="من أشهر الحالات التعليمية: همزة مفتوحة بعد ألف ساكنة/مدّ أو واو ساكنة/مدّ. هذا رسم خاص بلا كرسي، لا قاعدة عامة لكل حرف مد." corrections={['ت-٦', 'ت-٧']} />),
    step('special-cases', 'حالات خاصة: لا تعمّم حكم السطر', G.practice, '◈', <div className="spell6-content-stack" data-testid="spell6-special-cases"><CaseReminder /><ActivityTag /><SpecialCaseLab /></div>),
    step('seat-lab', 'مختبر اختيار الكرسي والتعليل', G.practice, '◈', <ClassificationStep />),
    step('analysis', 'مختبر الإملاء: التحليل في سبع خطوات', G.practice, '٩', <AnalysisStep />),
    step('common-errors', 'أخطاء شائعة وتصويبها', G.practice, '◈', <CommonErrorsStep />),
    step('final-challenge', 'التحدي الختامي: كلمة جديدة', G.practice, '١٠', <div className="spell6-content-stack" data-testid="spell6-final-challenge"><p>انقل طريقة التحليل إلى كلمة لم تكن ضمن أمثلة القاعدة الأساسية.</p><ActivityTag /><FinalChallengeLab /></div>),
    step('source-practice', 'تدريب تفاعلي من المادة الأصلية', G.source, '١١', <div className="spell6-content-stack" data-testid="spell6-source-practice"><p>الأسئلة والخيارات السبعة محفوظة؛ اختر ثم تحقق لتظهر نتيجة كل سؤال وتفسير المشتتات.</p><ActivityTag>الأسئلة الأصلية · تغذية راجعة بعد التحقق فقط</ActivityTag><SourcePracticeLab /></div>),
    step('source-final', 'الاختبار الختامي الوارد في المادة', G.source, '١٢', <SourceFinalStep engine={sourceEngine} revealed={sourceRevealed} onReveal={revealSourceAnswers} onReset={sourceEngine.resetTest} />),
    step('source-final-solutions', 'حلول الاختبار الختامي للمادة', G.source, '▤', <SourceFinalSolutionsStep engine={sourceEngine} revealed={sourceRevealed} />),
    step('summary', 'ملخص ذهبي تفاعلي', G.wrap, '١٣', <SummaryStep onJump={(stepId) => flowRef.current?.goToStep(`spell6-${stepId}`)} />),
    step('homework-one', 'الواجب المنزلي · المستوى الأول', G.wrap, '١٤', <HomeworkIntroStep />),
    step('homework-two', 'الواجب المنزلي · المستوى الثاني', G.wrap, '١٥', <HomeworkReasonStep />),
    step('homework-creative', 'الواجب المنزلي · تحدي الكاتب الصغير', G.wrap, '١٦', <HomeworkCreativeStep />),
    step('next', 'إشارة إلى الدرس التالي', G.wrap, '→', <div className="spell6-content-stack" data-testid="spell6-next"><LessonNote title="إحالة محفوظة من المادة الأصلية" tone="source"><p>{C.nextLessonReference}</p></LessonNote><p>هذه إشارة مستقبلية فقط؛ لا يوجد رابط أو تسجيل أو محتوى للدرس السابع ضمن هذه المهمة.</p></div>),
    ...testDefinition.pages.map((page, index) => step(`test-page-${String(index + 1).padStart(2, '0')}`, page.title, G.test, '◇', <div className="spell6-test-page"><p>{testDefinition.description}</p><TestPageView page={page} engine={examEngine} questionTestIdPrefix="spell6-question" revealFeedback={submitted} /></div>)),
    step('submit', 'تسليم الاختبار والنتيجة', G.test, '✓', <SubmitStep engine={examEngineBase} submitted={submitted} onSubmit={submitExam} onReset={examEngine.resetTest} />),
    step('solutions', 'حلول الاختبار المستقل', G.test, '▤', <IndependentSolutionsStep engine={examEngine} submitted={submitted} />),
    step('teacher', 'منطقة خاصة بالمعلم', G.teacher, '◆', <TeacherArea sourceUrl={sourceUrl} auditUrl={auditUrl} />),
  ]

  return (
    <LessonMemoryProvider>
      <div className="spell6-lesson">
        <LessonFlow
          steps={steps}
          controllerRef={flowRef}
          onProgressChange={onProgressChange}
          onFinish={onFinish}
          lessonTitle={C.lessonTitle}
          lessonNumber={C.lessonNumber}
          lessonEyebrow={C.lessonEyebrow}
        />
      </div>
    </LessonMemoryProvider>
  )
}

function step(id: string, title: string, group: string, icon: string, content: ReactNode): LessonStepDefinition {
  return { id: `spell6-${id}`, title, shortTitle: title, group, icon, render: () => content }
}
