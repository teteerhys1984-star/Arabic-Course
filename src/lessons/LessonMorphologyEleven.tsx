import { useState, type ReactNode } from 'react'
import { LessonFlow, type LessonStepDefinition } from '../shared/components/LessonFlow'
import { TeacherSpace } from '../shared/teacher/TeacherSpace'
import {
  SolutionsArea, TestPageView, answeredCount, looseKey, useTestEngine,
  type TestDefinition, type TestEngine,
} from '../shared/test'
import * as C from './morphology-lesson-11/content'
import { TEST_TOTALS, attemptStatus, choiceStatus, earnedMarks, type AttemptStatus } from './morphology-lesson-11/grading'
import sourceUrl from '../../docs/source/morphology-lesson-11.md?url'
import auditUrl from '../../docs/morphology-lesson-11-source-audit.md?url'

// eslint-disable-next-line react-refresh/only-export-components -- lesson data consumed by the platform conformance suite.
export const testDefinition: TestDefinition = C.testDefinition
const S = C.sourceContent

interface Props {
  onProgressChange?: (value: number) => void
  onFinish?: () => void
}

const arabicDigits = (value: number | string) => String(value).replace(/\d/g, (digit) => '٠١٢٣٤٥٦٧٨٩'[Number(digit)])
/** عنوان الخطوة: عنوان المصدر بلا رقم القسم ولا الرمز التعبيري. */
const stepTitle = (heading: string) => heading.replace(/^\d+\.\s*/, '').replace(/\p{Extended_Pictographic}\s*/gu, '').trim()

/* ---------------- عناصر عرض مشتركة ---------------- */
function Clarification({ children }: { children: ReactNode }) {
  return (
    <aside className="morph11-clarification">
      <strong>توضيح من المنصة</strong>
      <div>{children}</div>
    </aside>
  )
}
function List({ items, ordered = false }: { items: readonly string[]; ordered?: boolean }) {
  const Tag = ordered ? 'ol' : 'ul'
  return <Tag className="morph11-list">{items.map((item) => <li key={item}>{item}</li>)}</Tag>
}
type WordTone = 'verb' | 'doer' | 'masdar' | 'object' | 'weight'
function Word({ text, tone = 'doer' }: { text: string; tone?: WordTone }) {
  return <bdi className={`morph11-word morph11-word--${tone}`} dir="rtl">{text}</bdi>
}
/** «رَسَمَ ← راسِم.» — الفعل ثم اسم الفاعل بلا كسر للكلمة الواحدة. */
function Pair({ text }: { text: string }) {
  const [verb, participle] = text.replace(/\.$/, '').split(' ← ')
  return <bdi className="morph11-pair" dir="rtl"><Word text={verb} tone="verb" /> <span className="morph11-arrow">←</span> <Word text={participle} /></bdi>
}
function ScrollTable({ label, children }: { label: string; children: ReactNode }) {
  return <div className="morph11-table-scroll" role="region" aria-label={label} tabIndex={0}>{children}</div>
}
function Sentence({ text }: { text: string }) {
  return <p className="morph11-sentence"><bdi dir="rtl">{text}</bdi></p>
}
/** سلسلة الصياغة: الماضي ← المضارع ← اسم الفاعل. */
function Chain({ items }: { items: readonly { label: string; word: string; tone: WordTone }[] }) {
  return <ol className="morph11-chain" aria-label="سلسلة الصياغة">
    {items.map((item) => <li key={item.label}><small>{item.label}</small><Word text={item.word} tone={item.tone} /></li>)}
  </ol>
}
const labelOf = (line: string) => line.split(':')[0]

/* ---------------- خطوات الشرح ---------------- */
function IntroStep() {
  return <>
    <div className="morph11-hero">
      <p className="morph11-badge">{S.header.badge}</p>
      <h3>{S.header.title}</h3>
      <p className="morph11-eyebrow">{S.header.sectionLine}</p>
      <h4>{S.header.journeyTitle}</h4>
      <p>{S.header.journey}</p>
      <div className="morph11-hero__trio" aria-label="الفعل والمصدر واسم الفاعل من جذر واحد">
        <article><small>فعل</small><Word text="كَتَبَ" tone="verb" /></article>
        <article><small>مصدر</small><Word text="كِتابة" tone="masdar" /></article>
        <article className="morph11-hero__focus"><small>اسم فاعل · موضوع الدرس</small><Word text="كاتِب" /></article>
      </div>
    </div>
    <Clarification><p>{C.clarifications.journey}</p></Clarification>
  </>
}
function ObjectivesStep() {
  return <>
    <p>{S.objectives.lead}</p>
    <ol className="morph11-objectives">{S.objectives.items.map((item) => <li key={item}>{item}</li>)}</ol>
    <p className="morph11-muted">{C.objectivesNote}</p>
  </>
}
function PrefaceStep() {
  return <>
    <p>{S.preface.lead}</p>
    <div className="morph11-sentences">
      {S.preface.sentences.map((item) => <article key={item.id} className={`morph11-sentence-card morph11-sentence-card--${item.id}`}>
        <h3>{item.label}</h3>
        <Sentence text={item.sentence} />
        <p>{item.note}</p>
      </article>)}
    </div>
    <p className="morph11-eyebrow">{S.preface.observe}</p>
    <ScrollTable label="جدول لاحظ الفرق">
      <table className="morph11-table" data-testid="morph11-table-preface">
        <thead><tr>{S.preface.columns.map((c) => <th scope="col" key={c}>{c}</th>)}</tr></thead>
        <tbody>{S.preface.rows.map((row) => <tr key={row.id} className={row.id === 'katib' ? 'morph11-row--focus' : undefined}><th scope="row"><Word text={row.word} tone={row.id === 'kataba' ? 'verb' : row.id === 'kitaba' ? 'masdar' : 'doer'} /></th><td>{row.kind}</td><td>{row.meaning}</td></tr>)}</tbody>
      </table>
    </ScrollTable>
    <div className="morph11-notice"><p>{S.preface.conclusion}</p></div>
  </>
}
function DefinitionStep() {
  return <>
    <div className="morph11-definition"><p>{S.definition.text}</p></div>
    <p>{S.definition.simpler}</p>
    <Clarification><p>{C.clarifications.derived}</p></Clarification>
    <p className="morph11-eyebrow">{S.definition.quickTitle}</p>
    <ScrollTable label="جدول أمثلة سريعة">
      <table className="morph11-table" data-testid="morph11-table-quick">
        <thead><tr><th scope="col">الفعل</th><th scope="col">اسم الفاعل</th><th scope="col">المعنى</th></tr></thead>
        <tbody>{S.definition.quickRows.map((row) => <tr key={row.id}><th scope="row"><Word text={row.verb} tone="verb" /></th><td><Word text={row.participle} /></td><td>{row.meaning}</td></tr>)}</tbody>
      </table>
    </ScrollTable>
    <p className="morph11-eyebrow">{S.definition.moreTitle}</p>
    <ul className="morph11-pairs">{S.definition.more.map((item) => <li key={item}><Pair text={item} /></li>)}</ul>
    <div className="morph11-rule"><p>{S.definition.rule}</p></div>
  </>
}
function TriliteralStep() {
  const T = S.triliteral
  return <>
    <div className="morph11-definition"><p>{T.definition}</p></div>
    <p className="morph11-eyebrow">{T.ruleTitle}</p>
    <div className="morph11-weight-box">
      <p>{T.ruleLead}</p>
      <small>{T.weightLabel}</small>
      <p className="morph11-weight-box__weight"><Word text={T.weight} tone="weight" /></p>
      <p>{T.weightHow}</p>
    </div>
    <Clarification><p>{C.clarifications.whyOften}</p></Clarification>
    <p>{T.positionsLead}</p>
    <List items={T.positions} />
    <Clarification>
      <ol className="morph11-anatomy" aria-label="مقابلة حروف كاتِب بحروف الوزن فاعِل" data-testid="morph11-anatomy">
        {C.clarifications.anatomy.map((part) => <li key={part.id} className={`morph11-anatomy__part morph11-anatomy__part--${part.id}`}>
          <span className="morph11-anatomy__weight" lang="ar">{part.weight}</span>
          <span className="morph11-anatomy__word" lang="ar">{part.word}</span>
          <strong>{part.label}</strong>
          <small>{part.note}</small>
        </li>)}
      </ol>
      <p>{C.clarifications.anatomyNote}</p>
    </Clarification>
  </>
}
function TriliteralHowStep() {
  const T = S.triliteral
  return <>
    <p>{T.stepsLead}</p>
    <ol className="morph11-steps">
      {T.steps.map((item) => <li key={item.id}>
        <strong>{item.title}</strong>
        {item.lines.map((line) => <p key={line} className={line.length < 12 ? 'morph11-steps__big' : undefined}><bdi dir="rtl">{line}</bdi></p>)}
      </li>)}
    </ol>
    <p className="morph11-eyebrow">{T.tableTitle}</p>
    <ScrollTable label="جدول تطبيقي: اسم الفاعل من الثلاثي">
      <table className="morph11-table" data-testid="morph11-table-triliteral">
        <thead><tr>{T.columns.map((c) => <th scope="col" key={c}>{c}</th>)}</tr></thead>
        <tbody>{T.rows.map((row) => <tr key={row.id}><th scope="row"><Word text={row.verb} tone="verb" /></th><td><Word text={row.weight} tone="weight" /></td><td><Word text={row.participle} /></td></tr>)}</tbody>
      </table>
    </ScrollTable>
    <div className="morph11-notice"><p>{T.note}</p></div>
  </>
}
function TimeStep() {
  const T = S.triliteral
  return <>
    <p>{T.timeLead}</p>
    <p className="morph11-eyebrow">{T.timeExampleLabel}</p>
    <ul className="morph11-time">{T.timeExamples.map((item) => <li key={item}><bdi dir="rtl">{item}</bdi></li>)}</ul>
    <div className="morph11-definition"><p>{T.timeConclusion}</p></div>
    <Clarification><p>{C.clarifications.timeNote}</p></Clarification>
  </>
}
function NonTriliteralStep() {
  const N = S.nonTriliteral
  return <>
    <div className="morph11-definition"><p>{N.definition}</p></div>
    <ul className="morph11-chips">{N.verbs.map((verb) => <li key={verb}><Word text={verb} tone="verb" /></li>)}</ul>
    <p className="morph11-eyebrow">{N.ruleTitle}</p>
    <div className="morph11-weight-box">
      <p>{N.ruleLead}</p>
      <List items={N.ruleSteps} ordered />
    </div>
    <div className="morph11-notice"><p>{N.ruleNote}</p></div>
    <Clarification>
      <p>{C.clarifications.whyKasra}</p>
      <div className="morph11-chain-grid">
        {C.clarifications.extraChains.map((item) => <article key={item.id} className="morph11-example-card">
          <Chain items={[{ label: 'الماضي', word: item.past, tone: 'verb' }, { label: 'المضارع', word: item.present, tone: 'verb' }, { label: 'اسم الفاعل', word: item.participle, tone: 'doer' }]} />
          <p className="morph11-muted">{item.note}</p>
        </article>)}
      </div>
    </Clarification>
  </>
}
function NonTriliteralExamplesStep() {
  const N = S.nonTriliteral
  const F = N.firstExample
  return <>
    <Clarification><p>{C.clarifications.chainHint}</p></Clarification>
    <div className="morph11-chain-grid">
      <article className="morph11-example-card" data-testid="morph11-example-akrama">
        <h3>{F.title}</h3>
        <Chain items={[{ label: F.pastLabel, word: F.past, tone: 'verb' }, { label: F.presentLabel, word: F.present, tone: 'verb' }, { label: F.participleLabel, word: F.participle, tone: 'doer' }]} />
        <p className="morph11-change">{F.change}</p>
        <Sentence text={F.sentence} />
        <p className="morph11-muted">{F.meaning}</p>
      </article>
      {N.examples.map((item) => <article key={item.id} className="morph11-example-card" data-testid={`morph11-example-${item.id}`}>
        <h3>{item.title}</h3>
        <Chain items={[{ label: labelOf(item.lines[0]), word: item.past, tone: 'verb' }, { label: labelOf(item.lines[1]), word: item.present, tone: 'verb' }, { label: labelOf(item.lines[2]), word: item.participle, tone: 'doer' }]} />
        <Sentence text={item.sentence} />
      </article>)}
    </div>
  </>
}
function NonTriliteralTableStep() {
  const N = S.nonTriliteral
  return <>
    <ScrollTable label="جدول المقارنة: اسم الفاعل من غير الثلاثي">
      <table className="morph11-table" data-testid="morph11-table-non-triliteral">
        <thead><tr>{N.columns.map((c) => <th scope="col" key={c}>{c}</th>)}</tr></thead>
        <tbody>{N.rows.map((row) => <tr key={row.id}><th scope="row"><Word text={row.past} tone="verb" /></th><td><Word text={row.present} tone="verb" /></td><td><Word text={row.participle} /></td></tr>)}</tbody>
      </table>
    </ScrollTable>
    <p className="morph11-eyebrow">{N.rememberTitle}</p>
    <div className="morph11-remember">{N.remember.map((item) => <p key={item}>{item}</p>)}</div>
    <Clarification>
      <p>{C.clarifications.participleVsObject}</p>
      <div className="morph11-contrast" aria-label="مقارنة بين مُكْرِم ومُكْرَم">
        <article><Word text="مُكْرِم" /><small>كسر الراء · اسم فاعل · مَن يُكرِم</small></article>
        <article><Word text="مُكْرَم" tone="object" /><small>فتح الراء · اسم مفعول · مَن وقع عليه الإكرام</small></article>
      </div>
    </Clarification>
  </>
}
function WeakStep() {
  const W = S.weak
  return <>
    <p>{W.lead}</p>
    <ScrollTable label="جدول اسم الفاعل من الأفعال المعتلة">
      <table className="morph11-table" data-testid="morph11-table-weak">
        <thead><tr>{W.columns.map((c) => <th scope="col" key={c}>{c}</th>)}</tr></thead>
        <tbody>{W.rows.map((row) => <tr key={row.id}><th scope="row"><Word text={row.verb} tone="verb" /></th><td><Word text={row.participle} /></td><td className="morph11-cell--sentence"><bdi dir="rtl">{row.example}</bdi></td></tr>)}</tbody>
      </table>
    </ScrollTable>
    <p>{W.hollow}</p>
    <Clarification><p>{C.clarifications.hollowWhy}</p></Clarification>
    <p>{W.defective}</p>
    <Clarification>
      <p>{C.clarifications.defectiveWhy}</p>
      <ScrollTable label="جدول حالات حذف الياء وظهورها">
        <table className="morph11-table morph11-table--states" data-testid="morph11-table-defective-states">
          <thead><tr>{C.clarifications.defectiveStatesColumns.map((c) => <th scope="col" key={c}>{c}</th>)}</tr></thead>
          <tbody>{C.clarifications.defectiveStates.map((row) => <tr key={row.id}><th scope="row">{row.state}</th>{row.forms.map((form) => <td key={form}><Word text={form} /></td>)}</tr>)}</tbody>
        </table>
      </ScrollTable>
    </Clarification>
    <div className="morph11-notice"><p>{W.advanced}</p></div>
  </>
}
function IdentifyStep() {
  const I = S.identify
  return <>
    <p>{I.lead}</p>
    <List items={I.steps} ordered />
    <p className="morph11-eyebrow">{I.examplesTitle}</p>
    <div className="morph11-analyses">
      {I.examples.map((item) => <article key={item.id} className="morph11-analysis" data-testid={`morph11-analysis-${item.id}`}>
        <Sentence text={item.sentence} />
        <List items={item.lines} />
        {item.id === 'qaraa' && <Clarification><p>{C.clarifications.mufidan}</p></Clarification>}
      </article>)}
    </div>
    <Clarification><p>{C.clarifications.weightNotEnough}</p></Clarification>
  </>
}
function CompareStep() {
  const K = S.compare
  return <>
    <Clarification>
      <div className="morph11-four" aria-label="الفعل والحدث ومن قام به وما وقع عليه">
        {C.clarifications.fourMeanings.map((item) => <article key={item.id} className={`morph11-four__card morph11-four__card--${item.id}`}>
          <small>{item.label}</small>
          <Word text={item.word} tone={item.id === 'verb' ? 'verb' : item.id === 'event' ? 'masdar' : item.id === 'done' ? 'object' : 'doer'} />
          <p>{item.text}</p>
        </article>)}
      </div>
    </Clarification>
    <ScrollTable label="جدول المقارنة بين اسم الفاعل واسم المفعول والمصدر">
      <table className="morph11-table" data-testid="morph11-table-compare">
        <thead><tr>{K.columns.map((c) => <th scope="col" key={c}>{c}</th>)}</tr></thead>
        <tbody>{K.rows.map((row) => <tr key={row.id}><th scope="row"><Word text={row.word} tone={row.kind === 'مصدر' ? 'masdar' : row.kind.startsWith('اسم مفعول') ? 'object' : 'doer'} /></th><td>{row.kind}</td><td>{row.meaning}</td></tr>)}</tbody>
      </table>
    </ScrollTable>
    <p className="morph11-muted">{C.clarifications.compareNote}</p>
    <p className="morph11-eyebrow">{K.harakaTitle}</p>
    <div className="morph11-contrast">
      <article><Word text="مُعَلِّم" /><small>{K.haraka[0]}</small></article>
      <article><Word text="مُعَلَّم" tone="object" /><small>{K.haraka[1]}</small></article>
    </div>
    <div className="morph11-notice"><p>{K.conclusion}</p></div>
  </>
}
function MistakesStep() {
  return <div className="morph11-mistakes">
    {S.mistakes.items.map((item) => <article key={item.id} className="morph11-mistake">
      <p className="morph11-mistake__wrong"><span aria-hidden="true">✗</span> {item.wrong}</p>
      <p className="morph11-mistake__right"><span aria-hidden="true">✓</span> {item.right}</p>
    </article>)}
  </div>
}

/* ---------------- التدريب التفاعلي (٨) ---------------- */
function TrainingStep() {
  const T = S.training
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [revealed, setRevealed] = useState(false)
  // العدّ مشتق من خريطة مفتاحها رقم السؤال: تغيير الاختيار أو إعادة التصحيح لا يكرّر الاحتساب.
  const answered = T.items.filter((item) => answers[item.id]).length
  const correct = T.items.filter((item) => choiceStatus(C.trainingKeys[item.id].answer, answers[item.id]) === 'correct').length
  function pick(id: string, option: string) { setAnswers((current) => ({ ...current, [id]: option })); setRevealed(false) }
  function reset() { setAnswers({}); setRevealed(false) }
  return <div data-testid="morph11-training">
    <p>{T.lead}</p>
    <div className="morph11-training-head">
      <h3>{T.boxTitle}</h3>
      <p className="morph11-counter" data-testid="morph11-training-counter" aria-live="polite"><span className="morph11-sr">أجبت عن </span><bdi dir="ltr">{answered} / {T.items.length}</bdi></p>
      <div className="morph11-progress" role="progressbar" aria-label="تقدّم التدريب" aria-valuemin={0} aria-valuemax={T.items.length} aria-valuenow={answered}>
        <span style={{ inlineSize: `${(answered / T.items.length) * 100}%` }} />
      </div>
      <p className="morph11-muted">{T.note}</p>
    </div>
    <div className="morph11-practice-grid">
      {T.items.map((item) => {
        const key = C.trainingKeys[item.id]
        const value = answers[item.id]
        const status = choiceStatus(key.answer, value)
        return <fieldset key={item.id} className="morph11-practice-card" data-testid={`morph11-training-${item.number}`}>
          <legend><span className="morph11-number">{item.number}</span> <bdi dir="rtl">{item.prompt}</bdi></legend>
          <div className="morph11-radio-options">
            {item.options.map((option) => <label key={option}><input type="radio" name={`morph11-${item.id}`} value={option} checked={value === option} onChange={() => pick(item.id, option)} /><bdi className="morph11-word">{option}</bdi></label>)}
          </div>
          {revealed && <div className={`morph11-feedback morph11-feedback--${status}`} role="status">
            <strong>{status === 'correct' ? 'إجابة صحيحة.' : status === 'wrong' ? 'تحتاج الإجابة إلى مراجعة.' : 'لم تُجب عن هذا السؤال.'}</strong>
            <p>الإجابة الصحيحة: <bdi>{key.answer}</bdi></p>
            <span className="morph11-eyebrow">توضيح من المنصة · حلول أعدّتها المنصة</span>
            <p>{key.explanation}</p>
          </div>}
        </fieldset>
      })}
    </div>
    {revealed && <div className="morph11-result" role="status" data-testid="morph11-training-score"><h3>نتيجة التدريب</h3><p className="morph11-score"><bdi dir="ltr">{correct} / {T.items.length}</bdi></p>{answered < T.items.length && <p>تُحتسب الأسئلة التي لم تُجب عنها غير صحيحة. أكملها ثم أعد التصحيح.</p>}</div>}
    <div className="morph11-actions">
      <button type="button" className="button button--primary" disabled={answered === 0} onClick={() => setRevealed(true)}>{T.control}</button>
      <button type="button" className="button button--ghost" onClick={reset}>إعادة التدريب</button>
    </div>
    <p className="morph11-muted">{answered === 0 ? 'اختر إجابة واحدة على الأقل ليعمل زر التصحيح.' : 'تغيير أي إجابة بعد التصحيح يخفي التصحيح حتى تضغط الزر من جديد.'} التدريب لا يدخل في درجة اختبار الدرس.</p>
  </div>
}

/* ---------------- الاختبار الختامي (١٣) ---------------- */
const attemptMessages: Record<AttemptStatus, string> = {
  empty: 'لم تكتب محاولة.',
  wrong: 'الحروف تختلف عن النموذج؛ راجع خطوات الصياغة.',
  marks: 'الحروف صحيحة، لكن في ضبطك حركة تخالف النموذج؛ انتبه إلى حركة ما قبل الآخر.',
  unvoweled: 'الحروف صحيحة. قارن ضبطك بالنموذج.',
  correct: 'محاولتك مطابقة للنموذج.',
}
const attemptTone = (status: AttemptStatus) => status === 'correct' || status === 'unvoweled' ? 'correct' : status === 'empty' ? 'unanswered' : 'wrong'
type FinalItem = (typeof S.final.sections)[number]['items'][number]
function FinalStep() {
  const F = S.final
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [revealed, setRevealed] = useState(false)
  const autoItems = F.sections.flatMap((section) => section.items as readonly FinalItem[]).filter((item) => item.kind !== 'open')
  const matched = autoItems.filter((item) => {
    const key = C.finalKeys[item.id]
    return item.kind === 'tf' ? choiceStatus(key.answer, answers[item.id]) === 'correct' : attemptTone(attemptStatus(answers[item.id], key.answer)) === 'correct'
  }).length
  const set = (id: string, value: string) => setAnswers((current) => ({ ...current, [id]: value }))
  function renderInput(item: FinalItem) {
    if (item.kind === 'open') return <textarea className="morph11-input" rows={2} aria-label={`إجابتك عن السؤال ${item.number}`} value={answers[item.id] ?? ''} onChange={(e) => set(item.id, e.target.value)} placeholder="اكتب إجابتك هنا أو في دفترك" />
    if (item.kind === 'form') return <input className="morph11-input morph11-input--word" type="text" dir="rtl" lang="ar" aria-label={`اسم الفاعل من ${item.verb}`} value={answers[item.id] ?? ''} onChange={(e) => set(item.id, e.target.value)} placeholder="اسم الفاعل" />
    return <div className="morph11-radio-options morph11-radio-options--inline">
      {C.trueFalseOptions.map((option) => <label key={option}><input type="radio" name={`morph11-${item.id}`} value={option} checked={answers[item.id] === option} onChange={() => set(item.id, option)} />{option}</label>)}
    </div>
  }
  function renderModel(item: FinalItem) {
    const key = C.finalKeys[item.id]
    let tone = 'model'
    let status: string | null = null
    if (item.kind === 'tf') {
      const result = choiceStatus(key.answer, answers[item.id])
      tone = result
      status = result === 'correct' ? 'إجابتك صحيحة.' : result === 'wrong' ? 'إجابتك تحتاج إلى مراجعة.' : 'لم تختر إجابة.'
    } else if (item.kind === 'form') {
      const result = attemptStatus(answers[item.id], key.answer)
      tone = attemptTone(result)
      status = attemptMessages[result]
    }
    return <div className={`morph11-feedback morph11-feedback--${tone}`} role="status">
      {status ? <strong>{status}</strong> : <strong>قارن إجابتك بالنموذج.</strong>}
      <p>نموذج الإجابة: <bdi>{key.answer}</bdi></p>
      <span className="morph11-eyebrow">توضيح من المنصة · نموذج أعدّته المنصة</span>
      <p>{key.explanation}</p>
    </div>
  }
  return <div data-testid="morph11-final">
    <p>{F.lead}</p>
    <p className="morph11-muted">الاختبار الختامي وارد في نص الدرس، ونموذج إجابته من إعداد المنصة. لا يدخل في درجة اختبار الدرس المستقل.</p>
    {F.sections.map((section) => <section key={section.id} className="morph11-final-section">
      <h3>{section.heading}</h3>
      <div className="morph11-practice-grid">
        {(section.items as readonly FinalItem[]).map((item) => <div key={item.id} className="morph11-practice-card" data-testid={`morph11-final-${item.number}`}>
          <p className="morph11-final-prompt"><span className="morph11-number">{item.number}</span> <bdi dir="rtl">{item.prompt}</bdi></p>
          {renderInput(item)}
          {revealed && renderModel(item)}
        </div>)}
      </div>
    </section>)}
    {revealed && <div className="morph11-result" role="status" data-testid="morph11-final-model-summary"><h3>مراجعة ذاتية</h3><p>الأسئلة القابلة للمطابقة (5–13): <bdi dir="ltr">{matched} / {autoItems.length}</bdi>. الأسئلة 1–4 تُراجع بمقارنة إجابتك بالنموذج.</p></div>}
    <div className="morph11-actions">
      <button type="button" className="button button--primary" aria-expanded={revealed} onClick={() => setRevealed((value) => !value)}>{revealed ? 'إخفاء نموذج الإجابة' : F.control}</button>
      <button type="button" className="button button--ghost" onClick={() => { setAnswers({}); setRevealed(false) }}>مسح الإجابات</button>
    </div>
  </div>
}

/* ---------------- الواجب المنزلي (٥) ---------------- */
function HomeworkStep() {
  const H = S.homework
  const [participles, setParticiples] = useState<Record<string, string>>({})
  const [types, setTypes] = useState<Record<string, string>>({})
  const [revealed, setRevealed] = useState(false)
  const attemptedRows = H.rows.filter((row) => looseKey(participles[row.id]) || types[row.id]).length
  const ready = attemptedRows === H.rows.length
  const score = H.rows.reduce((sum, row) => {
    const key = C.homeworkKeys[row.id]
    return sum + (attemptTone(attemptStatus(participles[row.id], key.participle)) === 'correct' ? 1 : 0) + (types[row.id] === key.type ? 1 : 0)
  }, 0)
  function reset() { setParticiples({}); setTypes({}); setRevealed(false) }
  return <div data-testid="morph11-homework">
    <p>{H.lead}</p>
    <div className="morph11-homework-wrap">
      <table className="morph11-table morph11-table--homework" data-testid="morph11-table-homework">
        <thead><tr>{H.columns.map((c) => <th scope="col" key={c}>{c}</th>)}</tr></thead>
        <tbody>{H.rows.map((row) => {
          const key = C.homeworkKeys[row.id]
          const status = attemptStatus(participles[row.id], key.participle)
          const typeOk = types[row.id] === key.type
          return <tr key={row.id} data-testid={`morph11-${row.id}`}>
            <th scope="row" data-label={H.columns[0]}><Word text={row.verb} tone="verb" /></th>
            <td data-label={H.columns[1]}>
              <input className="morph11-input morph11-input--word" type="text" dir="rtl" lang="ar" aria-label={`اسم الفاعل من ${row.verb}`} placeholder={H.blank} value={participles[row.id] ?? ''} onChange={(e) => setParticiples((current) => ({ ...current, [row.id]: e.target.value }))} />
              {revealed && <p className={`morph11-cell-feedback morph11-cell-feedback--${attemptTone(status)}`}>{attemptMessages[status]} الحل: <bdi>{key.participle}</bdi></p>}
            </td>
            <td data-label={H.columns[2]}>
              <select className="morph11-input" aria-label={`نوع الفعل ${row.verb}`} value={types[row.id] ?? ''} onChange={(e) => setTypes((current) => ({ ...current, [row.id]: e.target.value }))}>
                <option value="">{H.blank}</option>
                {C.verbTypes.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
              {revealed && <p className={`morph11-cell-feedback morph11-cell-feedback--${types[row.id] ? (typeOk ? 'correct' : 'wrong') : 'unanswered'}`}>{types[row.id] ? (typeOk ? 'صحيح.' : 'يحتاج إلى مراجعة.') : 'لم تختر.'} الحل: {key.type}</p>}
            </td>
          </tr>
        })}</tbody>
      </table>
    </div>
    {revealed && <div className="morph11-result" role="status" data-testid="morph11-homework-solution">
      <h3>حل الواجب</h3>
      <p className="morph11-score"><bdi dir="ltr">{score} / {H.rows.length * 2}</bdi></p>
      <span className="morph11-eyebrow">توضيح من المنصة · حلول أعدّتها المنصة</span>
      <ul className="morph11-list">{H.rows.map((row) => <li key={row.id}><strong><bdi dir="rtl">{row.verb} ← {C.homeworkKeys[row.id].participle}</bdi> ({C.homeworkKeys[row.id].type}):</strong> {C.homeworkKeys[row.id].explanation}</li>)}</ul>
    </div>}
    <p className="morph11-muted" aria-live="polite" data-testid="morph11-homework-attempts">حاولت في <bdi dir="ltr">{attemptedRows} / {H.rows.length}</bdi> صفوف. {ready ? 'يمكنك الآن عرض الحل.' : 'اكتب اسم الفاعل أو اختر النوع في كل صف ليُفتح الحل.'}</p>
    <div className="morph11-actions">
      <button type="button" className="button button--primary" disabled={!ready} onClick={() => setRevealed(true)}>{H.control}</button>
      <button type="button" className="button button--ghost" onClick={reset}>إعادة الواجب</button>
    </div>
  </div>
}

function SummaryStep() {
  return <div className="morph11-summary">
    {S.summary.cards.map((card) => <article key={card.id} className={`morph11-summary__card morph11-summary__card--${card.id}`}>
      <h3>{card.title}</h3>
      <p>{card.text}</p>
    </article>)}
  </div>
}
function NextStep() {
  return <div className="morph11-next" data-testid="morph11-next-preview">
    <p>{S.next.text}</p>
    <ul className="morph11-pairs">{S.next.examples.map((item) => {
      const [verb, rest] = item.replace(/\.$/, '').split(' ← ')
      const [doer, object] = rest.split(' / ')
      return <li key={item}><bdi className="morph11-pair" dir="rtl"><Word text={verb} tone="verb" /> <span className="morph11-arrow">←</span> <Word text={doer} /> / <Word text={object} tone="object" /></bdi></li>
    })}</ul>
    <p>{S.next.conclusion}</p>
    <p className="morph11-muted">{C.clarifications.nextNote}</p>
  </div>
}

/* ---------------- الاختبار المستقل ---------------- */
function SubmitStep({ engine, submitted, onSubmit, onReset }: { engine: TestEngine; submitted: boolean; onSubmit: () => void; onReset: () => void }) {
  const questions = testDefinition.pages.flatMap((page) => page.questions)
  const result = engine.finalResult
  return <section className="morph11-submit" aria-label="تسليم الاختبار والنتيجة" data-testid="morph11-submit">
    <p>أجبت عن <bdi>{arabicDigits(answeredCount(questions, engine.answers))}</bdi> من <bdi>{arabicDigits(TEST_TOTALS.questions)}</bdi> سؤالًا.</p>
    {!submitted ? <>
      <p>التحقق من الصفحات يحفظ الإجابات دون كشف. يمكنك مراجعتها قبل التسليم؛ الأسئلة غير المجابة تُحتسب «لم تُجب». لا تُعرض الدرجة أو الحلول حتى تضغط الزر التالي.</p>
      <button type="button" className="button button--primary" onClick={onSubmit}>تسليم الاختبار وإظهار النتيجة</button>
    </> : <div role="status" className="morph11-result" data-testid="morph11-final-result">
      <h3>النتيجة النهائية</h3>
      <p className="morph11-score"><bdi>{arabicDigits(earnedMarks(result))} / {arabicDigits(TEST_TOTALS.total)}</bdi></p>
      <p>إجابات صحيحة: <bdi>{arabicDigits(result.correct)}</bdi> · غير صحيحة: <bdi>{arabicDigits(result.wrong)}</bdi> · لم تُجب: <bdi>{arabicDigits(result.unanswered)}</bdi></p>
      <p>افتح خطوة «حلول الاختبار» للتفسير الكامل، أو عُد إلى صفحات الأسئلة لمراجعة التصحيح.</p>
    </div>}
    <div className="morph11-actions"><button type="button" className="button button--ghost" onClick={onReset}>إعادة الاختبار</button></div>
    <p className="morph11-muted">إعادة الاختبار تمسح إجاباته ونتائجه وتعيد قفل الحلول. تعديل أي إجابة بعد التسليم يستلزم تسليم المحاولة المعدّلة من جديد.</p>
  </section>
}

/* ---------------- منطقة المعلم ---------------- */
function TeacherSection({ title, children }: { title: string; children: ReactNode }) {
  return <details className="morph11-teacher-section"><summary>{title}</summary><div>{children}</div></details>
}
function TeacherArea() {
  const finalItems = S.final.sections.flatMap((section) => section.items as readonly FinalItem[])
  return <TeacherSpace>
    <div className="morph11-teacher" data-testid="morph11-teacher-material">
      <h3>دليل المعلّم — اسم الفاعل</h3>
      <TeacherSection title="١. أهداف الدرس وطريقة تدريس محاوره">
        <List items={S.objectives.items} ordered />
        {C.teacherTopics.map((topic) => <article key={topic.heading} className="morph11-teacher-answer"><h4>{topic.heading}</h4><p>{topic.explanation}</p></article>)}
      </TeacherSection>
      <TeacherSection title="٢. التصحيحات العلمية على نص المصدر">
        {C.corrections.map((item) => <article key={item.id} className="morph11-teacher-answer" data-testid={`morph11-teacher-correction-${item.id}`}>
          <h4>{item.id} · {item.where}</h4>
          <p><strong>الأصل:</strong> {item.original}</p>
          <p><strong>المعروض:</strong> {item.corrected}</p>
          <p>{item.reason}</p>
        </article>)}
        <p>إضافات بلا تغيير للنص: تنبيه «مُفيدًا» في المثال المحلّل (أ)، وتنبيهات نماذج إجابات الختامي 1–3 (المزارع، المعلّم، نافعة ومستفيد).</p>
      </TeacherSection>
      <TeacherSection title="٣. التحليل الصرفي لأفعال الدرس">
        <ScrollTable label="جدول التحليل الصرفي — نسخة المعلّم">
          <table className="morph11-table morph11-table--wide" data-testid="morph11-table-teacher-analysis">
            <caption>الفعل ونوعه ومضارعه واسم الفاعل منه وطريقة صياغته</caption>
            <thead><tr><th scope="col">الفعل</th><th scope="col">نوعه</th><th scope="col">المضارع</th><th scope="col">اسم الفاعل</th><th scope="col">طريقة الصياغة</th></tr></thead>
            <tbody>{C.verbAnalyses.map((row) => <tr key={row.verb}><th scope="row"><Word text={row.verb} tone="verb" /></th><td>{row.kind}</td><td><Word text={row.present} tone="verb" /></td><td><Word text={row.participle} /></td><td>{row.how}</td></tr>)}</tbody>
          </table>
        </ScrollTable>
      </TeacherSection>
      <TeacherSection title="٤. إعراب جمل الدرس">
        <p>إعراب من إعداد المنصة للجمل التي يعمل فيها اسم الفاعل أو يرد فيها المنقوص.</p>
        {C.parsings.map((entry) => <article key={entry.sentence} className="morph11-teacher-answer"><h4><bdi dir="rtl">{entry.sentence}</bdi></h4><List items={entry.lines} /></article>)}
      </TeacherSection>
      <TeacherSection title="٥. حلول التدريب التفاعلي (٨ أسئلة)">
        {S.training.items.map((item) => <article key={item.id} className="morph11-teacher-answer" data-testid={`morph11-teacher-${item.id}`}>
          <h4><bdi>{item.number}</bdi>. <bdi dir="rtl">{item.prompt}</bdi></h4>
          <p>الخيارات: {item.options.join(' / ')}</p>
          <p>الإجابة: <bdi>{C.trainingKeys[item.id].answer}</bdi></p>
          <p>{C.trainingKeys[item.id].explanation}</p>
        </article>)}
      </TeacherSection>
      <TeacherSection title="٦. نموذج إجابة الاختبار الختامي (١٣ سؤالًا)">
        {finalItems.map((item) => <article key={item.id} className="morph11-teacher-answer" data-testid={`morph11-teacher-${item.id}`}>
          <h4><bdi>{item.number}</bdi>. <bdi dir="rtl">{item.prompt}</bdi></h4>
          <p>الإجابة: <bdi>{C.finalKeys[item.id].answer}</bdi></p>
          <p>{C.finalKeys[item.id].explanation}</p>
        </article>)}
      </TeacherSection>
      <TeacherSection title="٧. حلول الواجب المنزلي (٥ أفعال)">
        {S.homework.rows.map((row) => <article key={row.id} className="morph11-teacher-answer" data-testid={`morph11-teacher-${row.id}`}>
          <h4><bdi dir="rtl">{row.verb} ← {C.homeworkKeys[row.id].participle}</bdi> · {C.homeworkKeys[row.id].type}</h4>
          <p>{C.homeworkKeys[row.id].explanation}</p>
        </article>)}
      </TeacherSection>
      <TeacherSection title="٨. المصدر الخام وتقرير التدقيق والاختبار المستقل">
        <p>{C.teacherReferences.note}</p>
        <ul className="morph11-list">
          <li><a href={sourceUrl} download="morphology-lesson-11.md"><bdi dir="ltr">{C.teacherReferences.source}</bdi> — تنزيل المصدر الخام</a></li>
          <li><a href={auditUrl} download="morphology-lesson-11-source-audit.md"><bdi dir="ltr">{C.teacherReferences.audit}</bdi> — تنزيل تقرير التدقيق</a></li>
        </ul>
        <p>حلول الاختبار المستقل (٢٠ سؤالًا) لا تُعرض في هذه المنطقة؛ تظهر للطالب مفصّلة في خطوة «حلول الاختبار» بعد التسليم النهائي فقط.</p>
        <p>«الدرس التالي» معاينة نصية لاسم المفعول؛ لم يُنشأ درس ثانٍ عشر ولا اختبار وحدة.</p>
      </TeacherSection>
    </div>
  </TeacherSpace>
}

export function LessonMorphologyEleven({ onProgressChange, onFinish }: Props) {
  const testEngine = useTestEngine(testDefinition)
  const [testSubmitted, setTestSubmitted] = useState(false)
  const submitted = testSubmitted && testEngine.allPagesChecked

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
    step('intro', S.header.journeyTitle, 'مدخل الدرس', '◎', <IntroStep />),
    step('objectives', stepTitle(S.objectives.heading), 'مدخل الدرس', '◎', <ObjectivesStep />),
    step('preface', stepTitle(S.preface.heading), 'التمهيد والتعريف', '١', <PrefaceStep />),
    step('definition', stepTitle(S.definition.heading), 'التمهيد والتعريف', '٢', <DefinitionStep />),
    step('triliteral', stepTitle(S.triliteral.heading), 'الصياغة من الثلاثي', '٣', <TriliteralStep />),
    step('triliteral-how', S.triliteral.stepsTitle, 'الصياغة من الثلاثي', '٣', <TriliteralHowStep />),
    step('time', S.triliteral.timeTitle, 'الصياغة من الثلاثي', '٣', <TimeStep />),
    step('non-triliteral', stepTitle(S.nonTriliteral.heading), 'الصياغة من غير الثلاثي', '٤', <NonTriliteralStep />),
    step('non-triliteral-examples', 'أمثلة الصياغة من غير الثلاثي', 'الصياغة من غير الثلاثي', '٤', <NonTriliteralExamplesStep />),
    step('non-triliteral-table', S.nonTriliteral.tableTitle, 'الصياغة من غير الثلاثي', '٤', <NonTriliteralTableStep />),
    step('weak', stepTitle(S.weak.heading), 'المعتلّ والتمييز', '٥', <WeakStep />),
    step('identify', stepTitle(S.identify.heading), 'المعتلّ والتمييز', '٦', <IdentifyStep />),
    step('compare', stepTitle(S.compare.heading), 'المقارنة والأخطاء', '٧', <CompareStep />),
    step('mistakes', stepTitle(S.mistakes.heading), 'المقارنة والأخطاء', '٨', <MistakesStep />),
    step('training', stepTitle(S.training.heading), 'التدريب والاختبار الختامي', '٩', <TrainingStep />),
    step('final', stepTitle(S.final.heading), 'التدريب والاختبار الختامي', '١٠', <FinalStep />),
    step('homework', stepTitle(S.homework.heading), 'الواجب والخلاصة', '١١', <HomeworkStep />),
    step('summary', stepTitle(S.summary.heading), 'الواجب والخلاصة', '▦', <SummaryStep />),
    step('next', 'الدرس التالي: معاينة اسم المفعول', 'الواجب والخلاصة', '→', <NextStep />),
    ...testDefinition.pages.map((page) => step(`test-${page.id}`, page.title, 'اختبار الدرس · ٢٠ درجة', '◇', <>
      <p className="morph11-muted">{testDefinition.description}</p>
      <TestPageView page={page} engine={guardedEngine} questionTestIdPrefix="morph11-question" revealFeedback={submitted} />
    </>)),
    step('submit', 'تسليم الاختبار والنتيجة', 'اختبار الدرس · ٢٠ درجة', '✓',
      <SubmitStep engine={testEngine} submitted={submitted} onSubmit={submitTest} onReset={guardedEngine.resetTest} />),
    step('solutions', 'حلول الاختبار', 'اختبار الدرس · ٢٠ درجة', '▤', <>
      {submitted
        ? <SolutionsArea test={testDefinition} engine={guardedEngine} testId="morph11-solutions" revealFeedback={submitted} />
        : <div className="morph11-locked" data-testid="morph11-solutions-locked"><h3>الحلول مقفلة حتى التسليم النهائي</h3><p>التحقق من الصفحات لا يكشف الحلول. افتح خطوة «تسليم الاختبار والنتيجة» وسلّم الاختبار كاملًا أولًا.</p></div>}
    </>),
    step('teacher', 'منطقة خاصة بالمعلم', 'دليل المعلّم', '◆', <TeacherArea />),
  ]

  return <div className="morph11-lesson">
    <LessonFlow steps={steps} onProgressChange={onProgressChange} onFinish={onFinish}
      lessonTitle={C.lessonTitle} lessonNumber="١١" lessonEyebrow="القسم الثاني: الصرف" />
  </div>
}

function step(id: string, title: string, group: string, icon: string, content: ReactNode): LessonStepDefinition {
  return { id: `morph11-${id}`, title, shortTitle: title, group, icon, render: () => content }
}

