import { useState, type ReactNode } from 'react'
import { LessonFlow, type LessonStepDefinition } from '../shared/components/LessonFlow'
import { EducationalCard } from '../shared/components/EducationalCard'
import { TeacherSpace } from '../shared/teacher/TeacherSpace'
import {
  SolutionsArea, TestPageView, answeredCount, useTestEngine,
  type TestDefinition, type TestEngine,
} from '../shared/test'
import * as C from './morphology-lesson-10/content'
import { TEST_TOTALS, earnedMarks, practiceStatus } from './morphology-lesson-10/grading'
import sourceUrl from '../../docs/source/morphology-lesson-10.md?url'
import auditUrl from '../../docs/morphology-lesson-10-audit.md?url'

// eslint-disable-next-line react-refresh/only-export-components -- lesson data consumed by the platform conformance suite.
export const testDefinition: TestDefinition = C.testDefinition
const S = C.sourceContent

interface Props {
  onProgressChange?: (value: number) => void
  onFinish?: () => void
}

function Clarification({ children }: { children: ReactNode }) {
  return (
    <aside className="morph10-clarification">
      <strong>توضيح من المنصة</strong>
      <div>{children}</div>
    </aside>
  )
}
function List({ items, ordered = false }: { items: readonly string[]; ordered?: boolean }) {
  const Tag = ordered ? 'ol' : 'ul'
  return <Tag className="morph10-list">{items.map((item) => <li key={item}>{item}</li>)}</Tag>
}
function Verb({ word }: { word: string }) {
  return <bdi className="morph10-word morph10-word--verb" dir="rtl">{word}</bdi>
}
function Masdar({ word }: { word: string }) {
  return <bdi className="morph10-word morph10-word--masdar" dir="rtl">{word}</bdi>
}
function Weight({ text }: { text: string }) {
  return <bdi className="morph10-word morph10-word--weight" dir="rtl">{text}</bdi>
}
function Pair({ text }: { text: string }) {
  const { verb, masdar } = C.arrowPair(text.replace(/\.$/, ''))
  return <bdi className="morph10-pair" dir="rtl"><Verb word={verb} />{' '}<span className="morph10-arrow">←</span>{' '}<Masdar word={masdar} /></bdi>
}
function ScrollTable({ label, children }: { label: string; children: ReactNode }) {
  return <div className="morph10-table-scroll" role="region" aria-label={label} tabIndex={0}>{children}</div>
}

/* ---------------- خطوات الشرح ---------------- */
function IntroStep() {
  return <>
    <div className="morph10-hero">
      <p className="morph10-eyebrow">{S.header.section}</p>
      <h3>{S.header.title}</h3>
      <p className="morph10-hero__subtitle">{S.header.subtitle}</p>
      <p>{S.header.intro}</p>
      <div className="morph10-hero__compare" aria-label="مقارنة بين الفعل والمصدر ووزنيهما">
        <article className="morph10-hero__side morph10-hero__side--verb"><small>فعل · تَعَلَّمَ · وزنه تَفَعَّلَ</small><Verb word="تَعَلَّمَ" /></article>
        <article className="morph10-hero__side morph10-hero__side--masdar"><small>مصدر · تَعَلُّم · وزنه تَفَعُّل</small><Masdar word="تَعَلُّم" /></article>
      </div>
    </div>
    <Clarification><p>{C.clarifications.metrics}</p><p>مسارك: راجع، صنّف، ادرس كل نوع، قارن الأوزان، حلّل بخطوات، ثم تدرّب واختبر.</p></Clarification>
    <EducationalCard title="ما الذي ستتقنه؟" eyebrow="توضيح من المنصة"><List items={C.objectives} /></EducationalCard>
  </>
}
function ReviewStep() {
  return <>
    <div className="morph10-definition morph10-definition--main"><p>{S.review.definition}</p></div>
    <p>{S.review.examplesTitle}</p>
    <div className="morph10-pairs">{S.review.examples.map((item) => <p key={item}><Pair text={item} /></p>)}</div>
    <p>{S.review.observe}</p>
    <ScrollTable label="جدول لاحظ الفرق — قابل للتمرير">
      <table className="morph10-table" data-testid="morph10-table-review">
        <thead><tr>{S.review.columns.map((c) => <th scope="col" key={c}>{c}</th>)}</tr></thead>
        <tbody>{S.review.rows.map((row) => <tr key={row.id}><th scope="row"><Verb word={row.verb} /></th><td><Masdar word={row.masdar} /></td><td>{row.meaning}</td></tr>)}</tbody>
      </table>
    </ScrollTable>
    <div className="morph10-notice"><p>{S.review.note}</p></div>
  </>
}
function ClassifyStep() {
  return <>
    <p>{S.classify.lead}</p>
    <div className="morph10-definition"><p><strong>{S.classify.boxTitle}</strong> — {S.classify.boxText}</p></div>
    <div className="morph10-kinds">
      {S.classify.items.map((item) => <article key={item.id} className={`morph10-kind morph10-kind--${item.id}`}><h3>{item.title}</h3><p>{item.definition}</p><p className="morph10-muted">{item.example}</p></article>)}
    </div>
    <div className="morph10-notice"><p>{S.classify.warning}</p></div>
    <Clarification><p>{C.clarifications.rootsVsForm}</p><p>{C.clarifications.classifyAxis}</p></Clarification>
  </>
}
function TriliteralStep() {
  return <>
    <p>{S.triliteral.lead}</p>
    <div className="morph10-notice"><p>{S.triliteral.rule}</p></div>
    <p className="morph10-eyebrow">1. {S.triliteral.weightsTitle}</p>
    <ScrollTable label="جدول أوزان مصادر الثلاثي — قابل للتمرير">
      <table className="morph10-table morph10-table--weights" data-testid="morph10-table-triliteral">
        <thead><tr>{S.triliteral.columns.map((c) => <th scope="col" key={c}>{c}</th>)}</tr></thead>
        <tbody>{S.triliteral.rows.map((row) => <tr key={row.id}><th scope="row"><Weight text={row.weight} /></th><td><Masdar word={row.masdar} /></td><td><Verb word={row.verb} /></td></tr>)}</tbody>
      </table>
    </ScrollTable>
    <div className="morph10-notice"><p>{S.triliteral.note}</p></div>
    <Clarification><p>{C.clarifications.samai}</p><p>{C.clarifications.marra}</p></Clarification>
  </>
}
function TriliteralHowStep() {
  return <>
    <p className="morph10-eyebrow">2. {S.triliteral.howTitle}</p>
    <p>{S.triliteral.howLead}</p>
    <div className="morph10-analyses morph10-analyses--two">
      {S.triliteral.analyses.map((a) => <article key={a.id}><h3><bdi dir="rtl">{a.lead}</bdi></h3><List items={a.lines} /></article>)}
    </div>
    <p className="morph10-eyebrow">{S.triliteral.ruleTitle}</p>
    <div className="morph10-definition"><p>{S.triliteral.ruleText}</p></div>
  </>
}
function QuadrilateralStep() {
  return <>
    <p>{S.quadrilateral.lead}</p>
    <List items={S.quadrilateral.examples} />
    <p>{S.quadrilateral.sourceLead}</p>
    <ScrollTable label="جدول مصادر الرباعي — قابل للتمرير">
      <table className="morph10-table" data-testid="morph10-table-quadrilateral">
        <thead><tr>{S.quadrilateral.columns.map((c) => <th scope="col" key={c}>{c}</th>)}</tr></thead>
        <tbody>{S.quadrilateral.rows.map((row) => <tr key={row.id}><th scope="row"><Verb word={row.verb} /></th><td><Masdar word={row.masdar} /></td><td><Weight text={row.masdarWeight} /></td></tr>)}</tbody>
      </table>
    </ScrollTable>
    <p className="morph10-eyebrow">{S.quadrilateral.howTitle}</p>
    <p>{S.quadrilateral.howLead}</p>
    <List items={S.quadrilateral.steps} ordered />
    <p>{S.quadrilateral.sentenceTitle}</p>
    <p className="morph10-sentence"><bdi dir="rtl">{S.quadrilateral.sentence}</bdi></p>
    <p>{S.quadrilateral.sentenceNote}</p>
    <p className="morph10-eyebrow">{S.quadrilateral.augmentedTitle}</p>
    <p>{S.quadrilateral.augmentedLead}</p>
    <div className="morph10-pairs">{S.quadrilateral.augmentedExamples.map((item) => <p key={item}><Pair text={item} /></p>)}</div>
    <div className="morph10-definition"><p>{S.quadrilateral.conclusion}</p></div>
    <Clarification><p>{C.clarifications.quadAugmented}</p></Clarification>
  </>
}
function QuintupleStep() {
  return <>
    <p>{S.quintuple.lead}</p>
    <List items={S.quintuple.examples} />
    <div className="morph10-notice"><p>{S.quintuple.note}</p></div>
    {S.quintuple.groups.map((group, idx) => <section key={group.id} className="morph10-group">
      <h3>{C.arabicDigits(idx + 1)}. {group.heading}</h3>
      <ScrollTable label={`جدول ${group.heading} — قابل للتمرير`}>
        <table className="morph10-table" data-testid={`morph10-table-quintuple-${group.id}`}>
          <thead><tr>{S.quintuple.columns.map((c) => <th scope="col" key={c}>{c}</th>)}</tr></thead>
          <tbody>{group.rows.map((row) => <tr key={row.id}><th scope="row"><Verb word={row.verb} /></th><td><Masdar word={row.masdar} /></td><td><Weight text={row.masdarWeight} /></td></tr>)}</tbody>
        </table>
      </ScrollTable>
      <p>{group.exampleTitle}</p>
      <p className="morph10-sentence"><bdi dir="rtl">{group.example}</bdi></p>
    </section>)}
  </>
}
function QuintupleSummaryStep() {
  return <>
    <h3>{S.quintuple.summaryTitle}</h3>
    <ScrollTable label="ملخّص مصادر الأفعال الخماسية — قابل للتمرير">
      <table className="morph10-table morph10-table--weights" data-testid="morph10-table-quintuple-summary">
        <thead><tr>{S.quintuple.summaryColumns.map((c) => <th scope="col" key={c}>{c}</th>)}</tr></thead>
        <tbody>{S.quintuple.summaryRows.map((row) => <tr key={row.id}><th scope="row"><Weight text={row.verbWeight} /></th><td><Weight text={row.masdarWeight} /></td><td><Pair text={row.example} /></td></tr>)}</tbody>
      </table>
    </ScrollTable>
    <Clarification><p>قارن كل صف عموديًا: وزن الفعل أولًا، ثم وزن مصدره؛ فهما مختلفان في الصياغة والحركات وإن اشتركا في الجذر.</p></Clarification>
  </>
}
function SextupleStep() {
  return <>
    <p>{S.sextuple.lead}</p>
    <p>{S.sextuple.examplesTitle}</p>
    <List items={S.sextuple.examples} />
    <p>{S.sextuple.weightLead}</p>
    <ScrollTable label="جدول مصادر السداسي — قابل للتمرير">
      <table className="morph10-table" data-testid="morph10-table-sextuple">
        <thead><tr>{S.sextuple.columns.map((c) => <th scope="col" key={c}>{c}</th>)}</tr></thead>
        <tbody>{S.sextuple.rows.map((row) => <tr key={row.id}><th scope="row"><Verb word={row.verb} /></th><td><Masdar word={row.masdar} /></td><td><Weight text={row.masdarWeight} /></td></tr>)}</tbody>
      </table>
    </ScrollTable>
    <p className="morph10-eyebrow">{S.sextuple.workedTitle}</p>
    <article className="morph10-group"><h3><Verb word={S.sextuple.workedVerb.replace('الفعل: ', '').replace('.', '')} /></h3><p>{S.sextuple.workedVerb}</p><List items={S.sextuple.workedLines} /></article>
    <p>{S.sextuple.sentenceTitle}</p>
    <p className="morph10-sentence"><bdi dir="rtl">{S.sextuple.sentence}</bdi></p>
    <p>{S.sextuple.observe}</p>
    <p className="morph10-eyebrow">{S.sextuple.questionTitle}</p>
    <div className="morph10-definition"><p>{S.sextuple.answer}</p></div>
    <Clarification><p>{C.clarifications.sextupleLimit}</p><p>{C.clarifications.rootsVsForm}</p></Clarification>
  </>
}
function ComprehensiveStep() {
  return <>
    <p>{S.comprehensive.lead}</p>
    <ScrollTable label="الجدول الشامل لأهم الأوزان — قابل للتمرير">
      <table className="morph10-table morph10-table--weights" data-testid="morph10-table-comprehensive">
        <thead><tr>{S.comprehensive.columns.map((c) => <th scope="col" key={c}>{c}</th>)}</tr></thead>
        <tbody>{S.comprehensive.rows.map((row) => <tr key={row.id}><th scope="row">{row.kind}</th><td><Verb word={row.verb} /></td><td><Masdar word={row.masdar} /></td><td><Weight text={row.masdarWeight} /></td></tr>)}</tbody>
      </table>
    </ScrollTable>
    <div className="morph10-notice"><p>{S.comprehensive.note}</p></div>
    <Clarification><p>{C.clarifications.comprehensiveHeader}</p></Clarification>
  </>
}
function MethodStep() {
  return <>
    <p>{S.method.lead}</p>
    <ol className="morph10-steps">
      {S.method.steps.map((step, i) => <li key={step.id}><strong>{C.arabicDigits(i + 1)}. {step.title}</strong><p><bdi dir="rtl">{step.detail}</bdi></p></li>)}
    </ol>
    <p className="morph10-eyebrow">{S.method.secondTitle}</p>
    <div className="morph10-analyses"><article><List items={S.method.secondLines} /></article></div>
    <Clarification><p>{C.clarifications.talimRoot}</p></Clarification>
  </>
}
function MistakesStep() {
  return <>
    <div className="morph10-mistakes">
      {S.mistakes.items.map((item) => <article key={item.id}><h3>{item.title}</h3><p>{item.text}</p></article>)}
    </div>
    <p className="morph10-eyebrow">{S.mistakes.ruleTitle}</p>
    <div className="morph10-definition"><p>{S.mistakes.rule}</p></div>
  </>
}
function SummaryStep() {
  return <>
    <p className="morph10-eyebrow">{S.summary.rulesTitle}</p>
    <div className="morph10-kinds">
      {S.summary.rules.map((rule) => <article key={rule.id} className="morph10-kind"><h3>{rule.title}</h3><p><bdi dir="rtl">{rule.text}</bdi></p></article>)}
    </div>
    <p>{S.summary.completionLead}</p>
    <List items={S.summary.lessonsList} ordered />
    <div className="morph10-transition"><p>{S.summary.next}</p></div>
    <Clarification><p>قائمة الدروس العشرة نص من المصدر يثبت ترتيب التسلسل؛ لا يُنشئ هذا الدرس درسًا حادي عشر ولا اختبار وحدة، ولا يُفعّلهما، ولا يعلن اكتمال وحدة.</p></Clarification>
  </>
}

/* ---------------- مختبرات ---------------- */
function usePracticeState() {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  return {
    answers, checked,
    pick(id: string, value: string) { setAnswers((c) => ({ ...c, [id]: value })); setChecked((c) => ({ ...c, [id]: false })) },
    check(id: string) { setChecked((c) => ({ ...c, [id]: true })) },
    reset() { setAnswers({}); setChecked({}) },
  }
}
type PracticeState = ReturnType<typeof usePracticeState>
type TrainingState = PracticeState & { revealed: boolean; reveal: () => void }

function ChoiceCard({ item, state, options }: { item: C.LabItem; state: PracticeState; options: readonly string[] }) {
  const value = state.answers[item.id]
  const checked = state.checked[item.id] ?? false
  const status = practiceStatus(item, value)
  return <fieldset className="morph10-practice-card" data-testid={`morph10-practice-${item.id}`}>
    <legend><bdi dir="rtl">{item.prompt}</bdi></legend>
    <div className="morph10-radio-options" role="radiogroup" aria-label={item.prompt}>
      {options.map((option) => <label key={option}><input type="radio" name={`morph10-${item.id}`} value={option} checked={value === option} onChange={() => state.pick(item.id, option)} /><bdi className="morph10-word">{option}</bdi></label>)}
    </div>
    <button type="button" className="button button--secondary" disabled={!value} onClick={() => state.check(item.id)}>تحقق من الإجابة</button>
    {checked && <div className={`morph10-feedback morph10-feedback--${status}`} role="status"><strong>{status === 'correct' ? 'إجابة صحيحة.' : 'تحتاج الإجابة إلى مراجعة.'}</strong><p>الإجابة الصحيحة: <bdi>{item.answer}</bdi></p><span className="morph10-eyebrow">توضيح من المنصة</span><p>{item.explanation}</p></div>}
  </fieldset>
}
function ChoiceLab({ lab, state }: { lab: C.LabDefinition; state: PracticeState }) {
  return <div data-testid={`morph10-lab-${lab.id}`}>
    <p className="morph10-eyebrow">توضيح من المنصة · نشاط تعليمي، لا اختبار</p>
    <p>{lab.instruction}</p>
    <div className="morph10-practice-grid">{lab.items.map((item) => <ChoiceCard key={item.id} item={item} state={state} options={item.options} />)}</div>
    <button type="button" className="button button--ghost" onClick={state.reset}>إعادة النشاط</button>
  </div>
}
function ComparisonLab({ state }: { state: PracticeState }) {
  const lab = C.comparisonLab
  return <div data-testid="morph10-lab-comparison">
    <p className="morph10-eyebrow">توضيح من المنصة · وزنان منفصلان</p>
    <p>{lab.instruction}</p>
    <div className="morph10-position-grid">
      {lab.items.map((item) => {
        const verbValue = state.answers[`${item.id}-verb`]
        const masdarValue = state.answers[`${item.id}-masdar`]
        const checked = state.checked[item.id] ?? false
        const status = verbValue === item.verbWeight && masdarValue === item.masdarWeight ? 'correct' : 'wrong'
        return <fieldset className="morph10-practice-card" key={item.id} data-testid={`morph10-practice-${item.id}`}>
          <legend><Verb word={item.verb} /> ← <Masdar word={item.masdar} /></legend>
          <label className="morph10-select-label"><span>وزن الفعل</span><select aria-label={`${item.verb} — وزن الفعل`} value={verbValue ?? ''} onChange={(e) => state.pick(`${item.id}-verb`, e.target.value)}><option value="">اختر…</option>{C.comparisonOptions.verbWeights.map((o) => <option key={o} value={o}>{o}</option>)}</select></label>
          <label className="morph10-select-label"><span>وزن المصدر</span><select aria-label={`${item.masdar} — وزن المصدر`} value={masdarValue ?? ''} onChange={(e) => state.pick(`${item.id}-masdar`, e.target.value)}><option value="">اختر…</option>{C.comparisonOptions.masdarWeights.map((o) => <option key={o} value={o}>{o}</option>)}</select></label>
          <button type="button" className="button button--secondary" disabled={!verbValue || !masdarValue} onClick={() => state.check(item.id)}>تحقق من التحليل</button>
          {checked && <div className={`morph10-feedback morph10-feedback--${status}`} role="status"><strong>{status === 'correct' ? 'تحليل صحيح.' : 'راجع التحليل.'}</strong><p>وزن الفعل: <bdi>{item.verbWeight}</bdi> · وزن المصدر: <bdi>{item.masdarWeight}</bdi></p><span className="morph10-eyebrow">توضيح من المنصة</span><p>{item.explanation}</p></div>}
        </fieldset>
      })}
    </div>
    <button type="button" className="button button--ghost" onClick={state.reset}>إعادة النشاط</button>
  </div>
}

interface StagedCase { id: string; stages: readonly C.AnalysisStage[]; sentence?: string; verb?: string; masdar?: string }
function StagedLab({ testId, title, instruction, cases, caseLabel }: { testId: string; title: string; instruction: string; cases: readonly StagedCase[]; caseLabel: (c: StagedCase) => string }) {
  const [caseId, setCaseId] = useState<string>(cases[0].id)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [progress, setProgress] = useState<Record<string, number>>({})
  const [feedback, setFeedback] = useState<{ key: string; ok: boolean } | null>(null)
  const active = cases.find((item) => item.id === caseId)!
  const done = progress[caseId] ?? 0
  const key = (index: number) => `${caseId}:${index}`
  const finished = done >= active.stages.length
  function pickStage(index: number, value: string) { setAnswers((c) => ({ ...c, [key(index)]: value })); setFeedback(null) }
  function checkStage(index: number) {
    const stage = active.stages[index]
    const ok = answers[key(index)] === stage.answer
    setFeedback({ key: key(index), ok })
    if (ok) setProgress((c) => ({ ...c, [caseId]: Math.max(c[caseId] ?? 0, index + 1) }))
  }
  function resetCase() { setAnswers({}); setProgress({}); setFeedback(null) }
  return <div data-testid={testId}>
    <p className="morph10-eyebrow">توضيح من المنصة · تحليل متدرّج بلا درجات</p>
    <h3 className="morph10-lab-title">{title}</h3>
    <p>{instruction}</p>
    <div className="morph10-chips" role="group" aria-label="اختر الحالة المطلوب تحليلها">
      {cases.map((item) => <button type="button" key={item.id} aria-pressed={caseId === item.id} onClick={() => setCaseId(item.id)}><bdi>{caseLabel(item)}</bdi></button>)}
    </div>
    <ol className="morph10-stages">
      {active.stages.map((stage, index) => {
        const visible = index <= done
        const value = answers[key(index)]
        const shown = feedback?.key === key(index) ? feedback : null
        return <li key={stage.id} className={index < done ? 'morph10-stage--done' : undefined} data-testid={`morph10-stage-${active.id}-${stage.id}`}>
          <strong>{stage.label}</strong>
          {visible ? <>
            <label className="morph10-select-label"><span>اختيارك</span><select aria-label={`${caseLabel(active)} — ${stage.label}`} value={value ?? ''} disabled={index < done} onChange={(e) => pickStage(index, e.target.value)}><option value="">اختر…</option>{stage.options.map((o) => <option key={o} value={o}>{o}</option>)}</select></label>
            {index === done && <button type="button" className="button button--secondary" disabled={!value} onClick={() => checkStage(index)}>تحقق من هذه المرحلة</button>}
            {index < done && <p className="morph10-stage__answer">إجابتك: <bdi>{stage.answer}</bdi></p>}
            {shown && <div className={`morph10-feedback morph10-feedback--${shown.ok ? 'correct' : 'wrong'}`} role="status"><strong>{shown.ok ? 'مرحلة صحيحة، انتقل إلى التالية.' : 'تحتاج هذه المرحلة إلى مراجعة.'}</strong><p>الإجابة الصحيحة: <bdi>{stage.answer}</bdi></p><span className="morph10-eyebrow">توضيح من المنصة</span><p>{stage.explanation}</p></div>}
          </> : <p className="morph10-muted">أكمل المرحلة السابقة لتظهر هذه المرحلة.</p>}
        </li>
      })}
    </ol>
    {finished && <div className="morph10-analysis-result" role="status" data-testid={`${testId}-result`}><h3>اكتمل التحليل</h3><p>{active.stages.map((s) => s.answer).join(' ← ')}</p>{active.sentence && <p className="morph10-sentence"><bdi dir="rtl">{active.sentence}</bdi></p>}</div>}
    <div className="morph10-actions"><button type="button" className="button button--ghost" onClick={resetCase}>إعادة التحليل</button></div>
  </div>
}

/* ---------------- التدريبات الأصلية والاختبار الأصلي ---------------- */
function SolutionView({ solution }: { solution: C.TrainingSolution }) {
  return <><List items={solution.steps} ordered /><h4>لماذا لا نختار المشتتات؟</h4><List items={solution.distractors} /></>
}
function TrainingCard({ item, state }: { item: (typeof S.trainings.groups)[number]['items'][number]; state: TrainingState }) {
  const solution = C.trainingSolutions[item.number]
  const value = state.answers[item.id]
  const checked = state.checked[item.id] || state.revealed
  const status = practiceStatus(solution, value)
  return <fieldset className="morph10-practice-card" data-testid={`morph10-practice-${item.id}`}>
    <legend><span className="morph10-number"><bdi>{C.arabicDigits(item.number)}</bdi></span> <bdi dir="rtl">{item.prompt}</bdi></legend>
    <div className="morph10-radio-options" role="radiogroup" aria-label={item.prompt}>
      {item.options.map((option) => <label key={option}><input type="radio" name={`morph10-${item.id}`} value={option} checked={value === option} onChange={() => state.pick(item.id, option)} /><bdi className="morph10-word">{option}</bdi></label>)}
    </div>
    <button type="button" className="button button--secondary" disabled={!value} onClick={() => state.check(item.id)}>تحقق من الإجابة</button>
    {checked && <div className={`morph10-feedback morph10-feedback--${status}`} role="status"><strong>{status === 'correct' ? 'إجابة صحيحة.' : status === 'wrong' ? 'تحتاج الإجابة إلى مراجعة.' : 'لم تختر إجابة بعد.'}</strong><p>الإجابة الصحيحة: <bdi>{solution.answer}</bdi></p><span className="morph10-eyebrow">توضيح من المنصة · حلول أعدّتها المنصة</span><SolutionView solution={solution} /></div>}
  </fieldset>
}
function TrainingStep({ groupIndex, state }: { groupIndex: 0 | 1 | 2; state: TrainingState }) {
  const group = S.trainings.groups[groupIndex]
  return <div data-testid={`morph10-training-${group.id}`}>
    {groupIndex === 0 && <><h3>{S.trainings.heading}</h3><p>{S.trainings.intro}</p></>}
    <p className="morph10-muted">تدريبات المصدر التعليمية؛ لا تدخل في درجة اختبار نهاية الدرس. الحلول أعدّتها المنصة؛ فالنص الخام لا يحتوي مفتاح إجابات.</p>
    <div className="morph10-practice-grid">{group.items.map((item) => <TrainingCard key={item.id} item={item} state={state} />)}</div>
    <div className="morph10-actions">
      <button type="button" className="button button--primary" onClick={state.reveal}>{C.trainingControls.reveal}</button>
      <button type="button" className="button button--ghost" onClick={state.reset}>{C.trainingControls.reset}</button>
    </div>
    <p className="morph10-muted">الزر الأول يكشف تصحيح التدريبات الثلاثة، والثاني يمسح كل محاولاتها ويعيد إخفاء التصحيح. لا يؤثران في الاختبارين.</p>
  </div>
}
function OriginalFinalStep() {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [revealed, setRevealed] = useState(false)
  const correctCount = S.originalFinal.items.filter((item) => practiceStatus(C.originalFinalSolutions[item.number], answers[item.id]) === 'correct').length
  function reset() { setAnswers({}); setRevealed(false) }
  return <div data-testid="morph10-original-final">
    <h3>{S.originalFinal.heading}</h3>
    <p>{S.originalFinal.intro}</p>
    <p className="morph10-muted">اختبار وارد في المادة المصدر؛ تصحيحه وحلوله من إعداد المنصة، وهو مستقل عن اختبار الدرس العشرين الآتي.</p>
    <div className="morph10-practice-grid">
      {S.originalFinal.items.map((item) => {
        const solution = C.originalFinalSolutions[item.number]
        const value = answers[item.id]
        const status = practiceStatus(solution, value)
        return <fieldset className="morph10-practice-card" key={item.id} data-testid={`morph10-practice-${item.id}`}>
          <legend><span className="morph10-number"><bdi>{C.arabicDigits(item.number)}</bdi></span> <bdi dir="rtl">{item.prompt}</bdi></legend>
          <div className="morph10-radio-options" role="radiogroup" aria-label={item.prompt}>
            {item.options.map((option) => <label key={option}><input type="radio" name={`morph10-${item.id}`} value={option} checked={value === option} onChange={() => { setAnswers((c) => ({ ...c, [item.id]: option })); setRevealed(false) }} /><bdi className="morph10-word">{option}</bdi></label>)}
          </div>
          {revealed && <div className={`morph10-feedback morph10-feedback--${status}`} role="status"><strong>{status === 'correct' ? 'إجابة صحيحة.' : status === 'wrong' ? 'تحتاج الإجابة إلى مراجعة.' : 'لم تختر إجابة بعد.'}</strong><p>الإجابة الصحيحة: <bdi>{solution.answer}</bdi></p><span className="morph10-eyebrow">توضيح من المنصة · حلول أعدّتها المنصة</span><SolutionView solution={solution} /></div>}
        </fieldset>
      })}
    </div>
    {revealed && <div className="morph10-result" role="status" data-testid="morph10-original-result"><h3>نتيجة الاختبار الختامي الأصلي</h3><p className="morph10-score"><bdi>{C.arabicDigits(correctCount)} / {C.arabicDigits(6)}</bdi></p></div>}
    <div className="morph10-actions">
      <button type="button" className="button button--primary" onClick={() => setRevealed(true)}>{C.originalFinalControls.check}</button>
      <button type="button" className="button button--ghost" onClick={reset}>{C.originalFinalControls.reset}</button>
    </div>
  </div>
}

/* ---------------- الاختبار المستقل ---------------- */
function SubmitStep({ engine, submitted, onSubmit, onReset }: { engine: TestEngine; submitted: boolean; onSubmit: () => void; onReset: () => void }) {
  const questions = testDefinition.pages.flatMap((page) => page.questions)
  const result = engine.finalResult
  return <section className="morph10-submit" aria-label="تسليم الاختبار والنتيجة" data-testid="morph10-submit">
    <p>أجبت عن <bdi>{C.arabicDigits(answeredCount(questions, engine.answers))}</bdi> من <bdi>{C.arabicDigits(TEST_TOTALS.questions)}</bdi> سؤالًا.</p>
    {!submitted ? <>
      <p>التحقق من الصفحات يحفظ الإجابات دون كشف. يمكنك مراجعتها قبل التسليم؛ الأسئلة غير المجابة تُحتسب «لم تُجب». لا تُعرض الدرجة أو الحلول حتى تضغط الزر التالي.</p>
      <button type="button" className="button button--primary" onClick={onSubmit}>تسليم الاختبار وإظهار النتيجة</button>
    </> : <div role="status" className="morph10-result" data-testid="morph10-final-result">
      <h3>النتيجة النهائية</h3>
      <p className="morph10-score"><bdi>{C.arabicDigits(earnedMarks(result))} / {C.arabicDigits(TEST_TOTALS.total)}</bdi></p>
      <p>إجابات صحيحة: <bdi>{C.arabicDigits(result.correct)}</bdi> · غير صحيحة: <bdi>{C.arabicDigits(result.wrong)}</bdi> · لم تُجب: <bdi>{C.arabicDigits(result.unanswered)}</bdi></p>
      <p>افتح خطوة «حلول الاختبار» للتفسير الكامل، أو عُد إلى صفحات الأسئلة لمراجعة التصحيح.</p>
    </div>}
    <div className="morph10-actions"><button type="button" className="button button--ghost" onClick={onReset}>إعادة الاختبار</button></div>
    <p className="morph10-muted">إعادة الاختبار تمسح إجاباته ونتائجه وتعيد قفل الحلول. تعديل أي إجابة بعد التسليم يستلزم تسليم المحاولة المعدّلة من جديد.</p>
  </section>
}

/* ---------------- منطقة المعلم ---------------- */
function TeacherSection({ title, children }: { title: string; children: ReactNode }) {
  return <details className="morph10-teacher-section"><summary>{title}</summary><div>{children}</div></details>
}
function WeightsTable({ testId, rows }: { testId: string; rows: readonly { id: string; verb: string; masdar: string; masdarWeight: string }[] }) {
  return <ScrollTable label="جدول أوزان — نسخة المعلّم"><table className="morph10-table" data-testid={testId}><thead><tr><th scope="col">الفعل</th><th scope="col">المصدر</th><th scope="col">وزن المصدر</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><th scope="row"><Verb word={row.verb} /></th><td><Masdar word={row.masdar} /></td><td><Weight text={row.masdarWeight} /></td></tr>)}</tbody></table></ScrollTable>
}
function TeacherArea() {
  return <TeacherSpace>
    <div className="morph10-teacher" data-testid="morph10-teacher-material">
      <h3>دليل المعلّم — أنواع المصادر وأوزانها</h3>
      <p className="morph10-eyebrow">توضيح من المنصة · شروح ومفاتيح وحلول أعدّتها المنصة</p>
      <TeacherSection title="١. شرح محاور الدرس وأهدافه">
        <List items={C.objectives} />
        {C.teacherTopics.map((topic) => <article key={topic.heading}><h4>{topic.heading}</h4><p>{topic.explanation}</p></article>)}
      </TeacherSection>
      <TeacherSection title="٢. المحوران: الجذر والصيغة، والتصحيحات العلمية">
        <p>{C.clarifications.rootsVsForm}</p><p>{C.clarifications.classifyAxis}</p><p>{C.clarifications.samai}</p>
        <p>{C.clarifications.marra}</p><p>{C.clarifications.quadAugmented}</p><p>{C.clarifications.sextupleLimit}</p>
        <p>{C.clarifications.comprehensiveHeader}</p><p>{C.clarifications.talimRoot}</p>
      </TeacherSection>
      <TeacherSection title="٣. الجداول المرجعية كاملة">
        <ScrollTable label="جدول المراجعة — نسخة المعلّم"><table className="morph10-table" data-testid="morph10-table-teacher-review"><thead><tr>{S.review.columns.map((c) => <th scope="col" key={c}>{c}</th>)}</tr></thead><tbody>{S.review.rows.map((row) => <tr key={row.id}><th scope="row"><Verb word={row.verb} /></th><td><Masdar word={row.masdar} /></td><td>{row.meaning}</td></tr>)}</tbody></table></ScrollTable>
        <ScrollTable label="جدول الثلاثي — نسخة المعلّم"><table className="morph10-table" data-testid="morph10-table-teacher-triliteral"><thead><tr>{S.triliteral.columns.map((c) => <th scope="col" key={c}>{c}</th>)}</tr></thead><tbody>{S.triliteral.rows.map((row) => <tr key={row.id}><th scope="row"><Weight text={row.weight} /></th><td><Masdar word={row.masdar} /></td><td><Verb word={row.verb} /></td></tr>)}</tbody></table></ScrollTable>
        <WeightsTable testId="morph10-table-teacher-quadrilateral" rows={S.quadrilateral.rows} />
        {S.quintuple.groups.map((g) => <WeightsTable key={g.id} testId={`morph10-table-teacher-quintuple-${g.id}`} rows={g.rows} />)}
        <ScrollTable label="ملخّص الخماسي — نسخة المعلّم"><table className="morph10-table" data-testid="morph10-table-teacher-quintuple-summary"><thead><tr>{S.quintuple.summaryColumns.map((c) => <th scope="col" key={c}>{c}</th>)}</tr></thead><tbody>{S.quintuple.summaryRows.map((row) => <tr key={row.id}><th scope="row"><Weight text={row.verbWeight} /></th><td><Weight text={row.masdarWeight} /></td><td><Pair text={row.example} /></td></tr>)}</tbody></table></ScrollTable>
        <WeightsTable testId="morph10-table-teacher-sextuple" rows={S.sextuple.rows} />
        <ScrollTable label="الجدول الشامل — نسخة المعلّم"><table className="morph10-table" data-testid="morph10-table-teacher-comprehensive"><thead><tr>{S.comprehensive.columns.map((c) => <th scope="col" key={c}>{c}</th>)}</tr></thead><tbody>{S.comprehensive.rows.map((row) => <tr key={row.id}><th scope="row">{row.kind}</th><td><Verb word={row.verb} /></td><td><Masdar word={row.masdar} /></td><td><Weight text={row.masdarWeight} /></td></tr>)}</tbody></table></ScrollTable>
      </TeacherSection>
      <TeacherSection title="٤. التحليل الصرفي والنحوي الكامل">
        <ScrollTable label="جدول التحليل الصرفي — نسخة المعلّم">
          <table className="morph10-table morph10-table--weights" data-testid="morph10-table-teacher-analysis">
            <caption>تحليل صرفي لأمثلة الدرس: الفعل ونوعه ووزنه، والمصدر ووزنه، والجذر والزوائد</caption>
            <thead><tr><th scope="col">الفعل</th><th scope="col">نوعه</th><th scope="col">وزن الفعل</th><th scope="col">المصدر</th><th scope="col">وزن المصدر</th><th scope="col">الجذر</th><th scope="col">الزوائد</th></tr></thead>
            <tbody>{C.morphologyAnalyses.map((row) => <tr key={`${row.verb}-${row.masdar}`}><th scope="row"><Verb word={row.verb} /></th><td>{row.verbKind}</td><td><Weight text={row.verbWeight} /></td><td><Masdar word={row.masdar} /></td><td><Weight text={row.masdarWeight} /></td><td>{row.root}</td><td>{row.extra}</td></tr>)}</tbody>
          </table>
        </ScrollTable>
        <h4>إعراب جمل الدرس</h4>
        {C.parsings.map((entry) => <article key={entry.sentence} className="morph10-teacher-answer"><h4><bdi dir="rtl">{entry.sentence}</bdi></h4><List items={entry.lines} /></article>)}
      </TeacherSection>
      <TeacherSection title="٥. حلول التدريبات الأصلية الأحد عشر">
        <p>حلول أعدّتها المنصة؛ لا يحتوي النص الخام مفتاح إجابات مستقلًا.</p>
        {S.trainings.groups.map((group) => <section key={group.id}><h4>{group.heading}</h4>
          {group.items.map((item) => <article key={item.id} className="morph10-teacher-answer" data-testid={`morph10-teacher-${item.id}`}><h4><bdi>{C.arabicDigits(item.number)}</bdi>. <bdi dir="rtl">{item.prompt}</bdi></h4><p>الخيارات بالترتيب: {item.options.join(' / ')}</p><p>الإجابة: <bdi>{C.trainingSolutions[item.number].answer}</bdi></p><SolutionView solution={C.trainingSolutions[item.number]} /></article>)}
        </section>)}
      </TeacherSection>
      <TeacherSection title="٦. حلول الاختبار الختامي الأصلي (٦ أسئلة)">
        <p>أسئلة واردة في المصدر، وحلولها أعدّتها المنصة ولا تُنسب إلى كتاب.</p>
        {S.originalFinal.items.map((item) => <article key={item.id} className="morph10-teacher-answer" data-testid={`morph10-teacher-${item.id}`}><h4><bdi>{C.arabicDigits(item.number)}</bdi>. <bdi dir="rtl">{item.prompt}</bdi></h4><p>الخيارات بالترتيب: {item.options.join(' / ')}</p><p>الإجابة: <bdi>{C.originalFinalSolutions[item.number].answer}</bdi></p><SolutionView solution={C.originalFinalSolutions[item.number]} /></article>)}
      </TeacherSection>
      <TeacherSection title="٧. مفاتيح الأنشطة التعليمية وطريقة تدريسها">
        {C.practiceLabs.map((lab) => <section key={lab.id}><h4>{lab.title}</h4><ul className="morph10-list">{lab.items.map((item) => <li key={item.id}><strong><bdi dir="rtl">{item.prompt}</bdi>: {item.answer}.</strong> {item.explanation}</li>)}</ul></section>)}
        <section><h4>{C.comparisonLab.title}</h4><ul className="morph10-list">{C.comparisonLab.items.map((item) => <li key={item.id}><strong><bdi dir="rtl">{item.verb} ← {item.masdar}</bdi>: {item.verbWeight} / {item.masdarWeight}.</strong> {item.explanation}</li>)}</ul></section>
        <section><h4>{C.analysisLab.title}</h4><ul className="morph10-list">{C.analysisLab.cases.map((item) => <li key={item.id}><strong><bdi dir="rtl">{item.masdar}</bdi>: {item.stages.map((s) => s.answer).join(' ← ')}</strong></li>)}</ul></section>
        <section><h4>{C.challengeLab.title}</h4><ul className="morph10-list">{C.challengeLab.cases.map((item) => <li key={item.id}><strong><bdi dir="rtl">{item.verb}</bdi>: {item.stages.map((s) => s.answer).join(' ← ')}</strong></li>)}</ul></section>
      </TeacherSection>
      <TeacherSection title="٨. حلول الاختبار المستقل (٢٠ سؤالًا)">
        <p>أسئلة الاختبار من إعداد المنصة، وحلولها مفصّلة في المحرك المشترك نفسه. تُعرض هنا كاملة لأن وضع المعلّم يكشف كل الصفحات.</p>
        <SolutionsArea test={testDefinition} mode="teacher" title="الحلول التفصيلية لاختبار الدرس العاشر" />
      </TeacherSection>
      <TeacherSection title="٩. المصدر الخام وتقرير التدقيق">
        <p>{C.teacherReferences.note}</p>
        <ul className="morph10-list">
          <li><a href={sourceUrl} download="morphology-lesson-10.md"><bdi dir="ltr">{C.teacherReferences.source}</bdi> — تنزيل المصدر الخام</a></li>
          <li><a href={auditUrl} download="morphology-lesson-10-audit.md"><bdi dir="ltr">{C.teacherReferences.audit}</bdi> — تنزيل تقرير التدقيق</a></li>
        </ul>
        <p>الدرس الحادي عشر مذكور نصيًا في خلاصة المصدر فقط. لم يُنشأ درس حادي عشر ولا اختبار وحدة؛ اكتمال الدروس العشرة عدديًا لا يعلن اكتمال الوحدة.</p>
      </TeacherSection>
    </div>
  </TeacherSpace>
}

export function LessonMorphologyTen({ onProgressChange, onFinish }: Props) {
  const testEngine = useTestEngine(testDefinition)
  const [testSubmitted, setTestSubmitted] = useState(false)
  const submitted = testSubmitted && testEngine.allPagesChecked
  const trainingState = useTrainingState()
  const classifyState = usePracticeState()
  const rootsState = usePracticeState()
  const masdarState = usePracticeState()
  const weightState = usePracticeState()
  const comparisonState = usePracticeState()

  const guardedEngine: TestEngine = {
    ...testEngine,
    setAnswer(questionId, fieldIndex, value) { setTestSubmitted(false); testEngine.setAnswer(questionId, fieldIndex, value) },
    uncheckPage(pageId) { setTestSubmitted(false); testEngine.uncheckPage(pageId) },
    resetTest() { setTestSubmitted(false); testEngine.resetTest() },
  }
  function submitTest() {
    for (const page of testDefinition.pages) testEngine.checkPage(page.id)
    setTestSubmitted(true)
  }

  const steps: LessonStepDefinition[] = [
    step('intro', S.header.firstTitle, 'مدخل الدرس', '◎', <IntroStep />),
    step('review', S.review.heading, 'المراجعة والتصنيف', '١', <ReviewStep />),
    step('classify', S.classify.heading, 'المراجعة والتصنيف', '٢', <ClassifyStep />),
    step('triliteral', S.triliteral.heading, 'مصادر الثلاثي', '٣', <TriliteralStep />),
    step('triliteral-how', S.triliteral.howTitle, 'مصادر الثلاثي', '◌', <TriliteralHowStep />),
    step('quadrilateral', S.quadrilateral.heading, 'مصادر الرباعي', '٤', <QuadrilateralStep />),
    step('quintuple', S.quintuple.heading, 'مصادر الخماسي', '٥', <QuintupleStep />),
    step('quintuple-summary', S.quintuple.summaryTitle, 'مصادر الخماسي', '▦', <QuintupleSummaryStep />),
    step('sextuple', S.sextuple.heading, 'مصادر السداسي', '٦', <SextupleStep />),
    step('comprehensive', S.comprehensive.heading, 'الجدول الشامل والطريقة', '٧', <ComprehensiveStep />),
    step('method', S.method.heading, 'الجدول الشامل والطريقة', '٨', <MethodStep />),
    step('mistakes', S.mistakes.heading, 'الأخطاء الشائعة', '٩', <MistakesStep />),
    step('lab-classify', C.classifyLab.title, 'أنشطة تفاعلية', '◈', <ChoiceLab lab={C.classifyLab} state={classifyState} />),
    step('lab-roots', C.rootsLab.title, 'أنشطة تفاعلية', '◈', <ChoiceLab lab={C.rootsLab} state={rootsState} />),
    step('lab-masdar', C.masdarLab.title, 'أنشطة تفاعلية', '◈', <ChoiceLab lab={C.masdarLab} state={masdarState} />),
    step('lab-weight', C.weightLab.title, 'أنشطة تفاعلية', '◈', <ChoiceLab lab={C.weightLab} state={weightState} />),
    step('lab-comparison', C.comparisonLab.title, 'أنشطة تفاعلية', '◈', <ComparisonLab state={comparisonState} />),
    step('lab-analysis', C.analysisLab.title, 'أنشطة تفاعلية', '◈', <StagedLab testId="morph10-lab-analysis" title={C.analysisLab.title} instruction={C.analysisLab.instruction} cases={C.analysisLab.cases} caseLabel={(c) => c.masdar ?? ''} />),
    step('lab-challenge', C.challengeLab.title, 'أنشطة تفاعلية', '◈', <StagedLab testId="morph10-lab-challenge" title={C.challengeLab.title} instruction={C.challengeLab.instruction} cases={C.challengeLab.cases} caseLabel={(c) => c.verb ?? ''} />),
    step('training-one', S.trainings.groups[0].heading, 'تدريبات المصدر', '١٠', <TrainingStep groupIndex={0} state={trainingState} />),
    step('training-two', S.trainings.groups[1].heading, 'تدريبات المصدر', '١٠', <TrainingStep groupIndex={1} state={trainingState} />),
    step('training-three', S.trainings.groups[2].heading, 'تدريبات المصدر', '١٠', <TrainingStep groupIndex={2} state={trainingState} />),
    step('original-final', S.originalFinal.heading, 'الاختبار الختامي الأصلي', '١١', <OriginalFinalStep />),
    step('summary', S.summary.heading, 'الخلاصة', '١٢', <SummaryStep />),
    ...testDefinition.pages.map((page) => step(`test-${page.id}`, page.title, 'اختبار الدرس · ٢٠ درجة', '◇', <>
      <p className="morph10-muted">{testDefinition.description}</p>
      <TestPageView page={page} engine={guardedEngine} questionTestIdPrefix="morph10-question" revealFeedback={submitted} />
    </>)),
    step('submit', 'تسليم الاختبار والنتيجة', 'اختبار الدرس · ٢٠ درجة', '✓',
      <SubmitStep engine={testEngine} submitted={submitted} onSubmit={submitTest} onReset={guardedEngine.resetTest} />),
    step('solutions', 'حلول الاختبار', 'اختبار الدرس · ٢٠ درجة', '▤', <>
      {submitted
        ? <SolutionsArea test={testDefinition} engine={guardedEngine} testId="morph10-solutions" revealFeedback={submitted} />
        : <div className="morph10-locked" data-testid="morph10-solutions-locked"><h3>الحلول مقفلة حتى التسليم النهائي</h3><p>التحقق من الصفحات لا يكشف الحلول. افتح خطوة «تسليم الاختبار والنتيجة» وسلّم الاختبار كاملًا أولًا.</p></div>}
    </>),
    step('teacher', 'منطقة خاصة بالمعلم', 'دليل المعلّم', '◆', <TeacherArea />),
  ]

  return <div className="morph10-lesson">
    <LessonFlow steps={steps} onProgressChange={onProgressChange} onFinish={onFinish}
      lessonTitle={C.lessonTitle} lessonNumber="١٠" lessonEyebrow="القسم الثاني: الصرف" />
  </div>
}

function step(id: string, title: string, group: string, icon: string, content: ReactNode): LessonStepDefinition {
  return { id: `morph10-${id}`, title, shortTitle: title, group, icon, render: () => content }
}
function useTrainingState() {
  const base = usePracticeState()
  const [revealed, setRevealed] = useState(false)
  return {
    ...base,
    revealed,
    reveal() { setRevealed(true) },
    reset() { base.reset(); setRevealed(false) },
  }
}
