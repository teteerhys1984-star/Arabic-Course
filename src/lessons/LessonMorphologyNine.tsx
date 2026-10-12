import { useState, type ReactNode } from 'react'
import { LessonFlow, type LessonStepDefinition } from '../shared/components/LessonFlow'
import { EducationalCard } from '../shared/components/EducationalCard'
import { TeacherSpace } from '../shared/teacher/TeacherSpace'
import {
  SolutionsArea, TestPageView, answeredCount, useTestEngine,
  type TestDefinition, type TestEngine,
} from '../shared/test'
import * as C from './morphology-lesson-09/content'
import { TEST_TOTALS, earnedMarks, practiceStatus } from './morphology-lesson-09/grading'
import sourceUrl from '../../docs/source/morphology-lesson-09.md?url'
import auditUrl from '../../docs/morphology-lesson-09-audit.md?url'

// eslint-disable-next-line react-refresh/only-export-components -- lesson data consumed by the platform conformance suite.
export const testDefinition: TestDefinition = C.testDefinition
const S = C.sourceContent

interface Props {
  onProgressChange?: (value: number) => void
  onFinish?: () => void
}

/* ------------------------------------------------------------------ *
 * عناصر عرض مشتركة: كل إضافة من المنصة موسومة، وكل كلمة تبقى متصلة بحركاتها.
 * ------------------------------------------------------------------ */
function Clarification({ children }: { children: ReactNode }) {
  return (
    <aside className="morph9-clarification">
      <strong>توضيح من المنصة</strong>
      <div>{children}</div>
    </aside>
  )
}

function List({ items, ordered = false }: { items: readonly string[]; ordered?: boolean }) {
  const Tag = ordered ? 'ol' : 'ul'
  return <Tag className="morph9-list">{items.map((item) => <li key={item}>{item}</li>)}</Tag>
}

/** الفعل بلون، والمصدر بلون، والوزن الصرفي بلون ثالث. لا فصل بين الحرف وحركته. */
function Verb({ word }: { word: string }) {
  return <bdi className="morph9-word morph9-word--verb" dir="rtl">{word}</bdi>
}
function Masdar({ word }: { word: string }) {
  return <bdi className="morph9-word morph9-word--masdar" dir="rtl">{word}</bdi>
}
function Weight({ text }: { text: string }) {
  return <bdi className="morph9-word morph9-word--weight" dir="rtl">{text}</bdi>
}

/** يعرض «الفعل ← المصدر» مع عزل كل طرف؛ السهم يبقى خارج العزلين. */
function Pair({ text }: { text: string }) {
  const { verb, masdar } = C.arrowPair(text)
  return <bdi className="morph9-pair" dir="rtl"><Verb word={verb} />{' '}<span className="morph9-arrow">←</span>{' '}<Masdar word={masdar} /></bdi>
}

function ScrollTable({ label, children }: { label: string; children: ReactNode }) {
  return <div className="morph9-table-scroll" role="region" aria-label={label} tabIndex={0}>{children}</div>
}

/* ------------------------------------------------------------------ *
 * خطوات الشرح
 * ------------------------------------------------------------------ */
function IntroStep() {
  return <>
    <div className="morph9-hero">
      <p className="morph9-eyebrow">{S.header.section}</p>
      <h3>{S.header.title}</h3>
      <p className="morph9-hero__subtitle">{S.header.subtitle}</p>
      <p>{S.header.intro}</p>
      <p className="morph9-eyebrow">مقارنة بصرية · فعل ومصدر من مادة واحدة</p>
      <div className="morph9-hero__compare" aria-label="مقارنة بين الفعل والمصدر">
        <article className="morph9-hero__side morph9-hero__side--verb">
          <small>فعل · حدث مرتبط بزمن</small>
          <Verb word="كَتَبَ" />
          <Verb word="يَكْتُبُ" />
        </article>
        <article className="morph9-hero__side morph9-hero__side--masdar">
          <small>مصدر · الحدث بلا زمن</small>
          <Masdar word="كِتابة" />
          <Masdar word="قِراءة" />
        </article>
      </div>
    </div>
    <Clarification>
      <p>{C.clarifications.metrics}</p>
      <p>مسارك: افهم التعريف، ميّز الأنواع الأربعة، احفظ الأوزان، ثم حلّل وطبّق. التدريبات الأصلية للتعلّم، والاختبار مستقل عنها.</p>
    </Clarification>
    <EducationalCard title="ما الذي ستتقنه؟" eyebrow="توضيح من المنصة"><List items={C.objectives} /></EducationalCard>
  </>
}

function OpeningStep() {
  return <>
    <p>{S.opening.lead}</p>
    <div className="morph9-sentences" aria-label="جمل المقارنة">
      {S.opening.sentences.map((sentence) => <p key={sentence} className="morph9-sentence"><bdi dir="rtl">{sentence}</bdi></p>)}
    </div>
    <p>{S.opening.highlightLead}</p>
    <p>{S.opening.classification}</p>
    <p className="morph9-eyebrow">{S.opening.why}</p>
    <div className="morph9-definition"><p>{S.opening.reason}</p></div>
    <p>{S.opening.examplesTitle}</p>
    <List items={S.opening.examples} />
    <p>{S.opening.conclusion}</p>
  </>
}

function DefinitionStep() {
  return <>
    <div className="morph9-definition morph9-definition--main"><p>{S.definition.text}</p></div>
    <p>{S.definition.lead}</p>
    <div className="morph9-parts">
      {S.definition.parts.map((part) => {
        const [term, ...rest] = part.split(': ')
        return <article key={term}><h3><bdi dir="rtl">{term}:</bdi>{' '}</h3><p>{rest.join(': ')}</p></article>
      })}
    </div>
    <Clarification><p>{C.clarifications.definition}</p></Clarification>
  </>
}

function BasicsStep() {
  return <>
    <ScrollTable label="جدول الأمثلة الأساسية — قابل للتمرير">
      <table className="morph9-table" data-testid="morph9-table-basics">
        <caption>{S.basics.title}</caption>
        <thead><tr>{S.basics.columns.map((column) => <th scope="col" key={column}>{column}</th>)}</tr></thead>
        <tbody>{S.basics.rows.map((row) => <tr key={row.id}>
          <th scope="row"><Verb word={row.verb} /></th>
          <td><Masdar word={row.masdar} /></td>
          <td>{row.event}</td>
        </tr>)}</tbody>
      </table>
    </ScrollTable>
    <div className="morph9-notice"><p>{S.basics.note}</p></div>
    <Clarification><p>{C.clarifications.samai}</p></Clarification>
  </>
}

function HowToStep() {
  return <>
    <p>{S.howTo.lead}</p>
    <div className="morph9-definition"><p>{S.howTo.question}</p></div>
    <p>{S.howTo.examplesTitle}</p>
    <List items={S.howTo.examples} />
    <div className="morph9-notice"><p>{S.howTo.caution}</p></div>
  </>
}

function KindsStep() {
  return <>
    <p>{S.kinds.lead}</p>
    <div className="morph9-kinds">
      {S.kinds.items.map((item) => <article key={item.id} className={`morph9-kind morph9-kind--${item.id}`}>
        <h3>{item.title}</h3>
        <p>{item.definition}</p>
        <p className="morph9-kind__example"><bdi dir="rtl">{item.example}</bdi></p>
      </article>)}
    </div>
    <Clarification><p>{C.clarifications.fourKinds}</p><p>{C.clarifications.doer}</p><p>{C.clarifications.done}</p></Clarification>
  </>
}

function KindsTableStep() {
  return <>
    <ScrollTable label="جدول المقارنة — قابل للتمرير">
      <table className="morph9-table" data-testid="morph9-table-kinds">
        <caption>{S.kinds.tableTitle}</caption>
        <thead><tr>{S.kinds.columns.map((column) => <th scope="col" key={column}>{column}</th>)}</tr></thead>
        <tbody>{S.kinds.rows.map((row) => <tr key={row.id}>
          <th scope="row">{row.kind}</th>
          <td><Masdar word={row.example} /></td>
          <td>{row.meaning}</td>
        </tr>)}</tbody>
      </table>
    </ScrollTable>
    <div className="morph9-definition"><p>{S.kinds.rule}</p></div>
  </>
}

function PositionsStep() {
  return <>
    <p>{S.positions.lead}</p>
    <p>{S.positions.examplesLead}</p>
    <div className="morph9-positions">
      {S.positions.items.map((item) => <article key={item.id} data-testid={`morph9-position-${item.id}`}>
        <span className="morph9-number"><bdi>{C.arabicDigits(item.number)}</bdi></span>
        <p className="morph9-sentence"><bdi dir="rtl">{item.sentence}</bdi></p>
        <p><Masdar word={item.masdar.replace('المصدر: ', '')} /> <small>{item.masdar}</small></p>
        <p className="morph9-muted">{item.position}</p>
      </article>)}
    </div>
    <Clarification><p>{C.clarifications.absolute}</p></Clarification>
  </>
}

function MorphoSyntaxStep() {
  return <>
    <div className="morph9-notice"><p>{S.positions.observation}</p></div>
    <div className="morph9-definition"><p>{S.positions.distinction}</p></div>
    <div className="morph9-split">
      {S.positions.branches.map((branch) => <article key={branch.slice(0, 5)}><p>{branch}</p></article>)}
    </div>
    <Clarification><p>{C.clarifications.morphoSyntax}</p></Clarification>
  </>
}

function CategoriesStep() {
  return <>
    <p>{S.categories.lead}</p>
    <p>{S.categories.count}</p>
    <div className="morph9-categories">
      {S.categories.items.map((item) => <article key={item.id} className={`morph9-category morph9-category--${item.id}`}>
        <span className="morph9-tag">{item.tag}</span>
        <h3>{item.title}</h3>
        <p>{item.definition}</p>
        <p><Pair text={item.examples.replace(/^أمثلة: /, '').split('،')[0]} /></p>
        <p className="morph9-muted"><bdi dir="rtl">{item.examples}</bdi></p>
      </article>)}
    </div>
    <div className="morph9-transition"><p>{S.categories.nextLesson}</p></div>
    <Clarification><p>{C.clarifications.quadriliteral}</p></Clarification>
  </>
}

function TriliteralStep() {
  return <>
    <p>{S.triliteral.lead}</p>
    <div className="morph9-notice"><p>{S.triliteral.rule}</p></div>
    <p>{S.triliteral.tableLead}</p>
    <Clarification><p>{C.clarifications.samai}</p></Clarification>
  </>
}

function TriliteralTableStep() {
  return <>
    <ScrollTable label="جدول أوزان مصادر الفعل الثلاثي — قابل للتمرير">
      <table className="morph9-table morph9-table--weights" data-testid="morph9-table-triliteral">
        <caption>{S.triliteral.heading}</caption>
        <thead><tr>{S.triliteral.columns.map((column) => <th scope="col" key={column}>{column}</th>)}</tr></thead>
        <tbody>{S.triliteral.rows.map((row) => <tr key={row.id}>
          <th scope="row"><Weight text={row.weight} /></th>
          <td><Masdar word={row.masdar} /></td>
          <td><Verb word={row.verb} /></td>
        </tr>)}</tbody>
      </table>
    </ScrollTable>
    <div className="morph9-notice"><p>{S.triliteral.caution}</p></div>
    <Clarification><p>{C.clarifications.fahm}</p><p>{C.clarifications.marra}</p></Clarification>
  </>
}

function TriliteralHowStep() {
  return <>
    <div className="morph9-analyses">
      {S.triliteral.analyses.map((analysis) => <article key={analysis.id}>
        <h3><bdi dir="rtl">{analysis.lead}</bdi></h3>
        <List items={analysis.lines} />
      </article>)}
    </div>
    <p>{S.triliteral.observation}</p>
    <div className="morph9-definition"><p>{S.triliteral.conclusion}</p></div>
  </>
}

function AugmentedStep() {
  return <>
    <p>{S.augmented.lead}</p>
    <p>{S.augmented.tableLead}</p>
    <ScrollTable label="جدول مصادر الأفعال المزيدة — قابل للتمرير">
      <table className="morph9-table morph9-table--weights" data-testid="morph9-table-augmented">
        <caption>{S.augmented.heading}</caption>
        <thead><tr>{S.augmented.columns.map((column) => <th scope="col" key={column}>{column}</th>)}</tr></thead>
        <tbody>{S.augmented.rows.map((row) => <tr key={row.id}>
          <th scope="row"><Verb word={row.verb} /></th>
          <td><Weight text={row.verbWeight} /></td>
          <td><Masdar word={row.masdar} /></td>
          <td><Weight text={row.masdarWeight} /></td>
        </tr>)}</tbody>
      </table>
    </ScrollTable>
    <div className="morph9-notice"><p>{S.augmented.note}</p></div>
  </>
}

function AugmentedWorkedStep() {
  return <>
    <div className="morph9-analyses morph9-analyses--two">
      {S.augmented.worked.map((item) => <article key={item.id}>
        <h3><bdi>{item.title.match(/^\d+\./)}</bdi> <Pair text={item.title.replace(/^\d+\.\s*/, '')} /></h3>
        <List items={item.lines} />
      </article>)}
    </div>
    <Clarification><p>الفرق بين وزن الفعل ووزن المصدر ثابت في الأربعة: أَفْعَلَ/إِفْعال، وفَعَّلَ/تَفْعيل، وتَفَعَّلَ/تَفَعُّل، واسْتَفْعَلَ/اسْتِفْعال. لا تخلط الحروف الأصلية بحروف الزيادة عند الوزن.</p></Clarification>
  </>
}

function ExtractionStep() {
  return <>
    <p>{S.extraction.lead}</p>
    <ol className="morph9-steps">
      {S.extraction.steps.map((step) => <li key={step.id}>
        <strong>{step.title}</strong>
        <p><bdi dir="rtl">{step.detail}</bdi></p>
      </li>)}
    </ol>
    <p className="morph9-eyebrow">{S.extraction.secondTitle}</p>
    <div className="morph9-analyses"><article>
      <h3><bdi dir="rtl">{S.extraction.secondVerb}</bdi></h3>
      <List items={S.extraction.secondLines} />
    </article></div>
    <div className="morph9-notice"><p>{S.extraction.caution}</p></div>
  </>
}

function ApplicationsStep() {
  return <>
    <p>{S.applications.lead}</p>
    <div className="morph9-applications">
      {S.applications.items.map((item) => <article key={item.id} data-testid={`morph9-application-${item.id}`}>
        <h3>{item.title}</h3>
        <p className="morph9-sentence"><bdi dir="rtl">{item.sentence}</bdi></p>
        <List items={item.lines} />
      </article>)}
    </div>
  </>
}

function AbsoluteStep() {
  return <>
    <div className="morph9-definition morph9-definition--main"><p>{S.applications.absoluteDefinition}</p></div>
    <p>{S.applications.absoluteExamplesTitle}</p>
    <div className="morph9-absolute">
      {S.applications.absoluteExamples.map((example) => <article key={example}><p><bdi dir="rtl">{example}</bdi></p></article>)}
    </div>
    <div className="morph9-notice"><p>{S.applications.absoluteConclusion}</p></div>
    <Clarification><p>{C.clarifications.absolute}</p></Clarification>
  </>
}

function MistakesStep() {
  return <>
    <div className="morph9-mistakes">
      {S.mistakes.items.map((item) => <article key={item.id} data-testid={`morph9-mistake-${item.id}`}>
        <h3>{item.title}</h3>
        <p>{item.text}</p>
      </article>)}
    </div>
    <p className="morph9-eyebrow">{S.mistakes.ruleTitle}</p>
    <div className="morph9-definition"><p>{S.mistakes.rule}</p></div>
  </>
}

function SummaryStep() {
  return <>
    <div className="morph9-mindmap" data-testid="morph9-mindmap">
      <h3 className="morph9-mindmap__title">{S.summary.mapTitle}</h3>
      <article className="morph9-mindmap__root">
        <h3>{S.summary.root.label}</h3>
        <p>{S.summary.root.text}</p>
      </article>
      <div className="morph9-mindmap__branches">
        {S.summary.branches.map((branch) => <section key={branch.id} className={`morph9-mindmap__branch morph9-mindmap__branch--${branch.id}`}>
          <h3>{branch.label}</h3>
          <ul>{branch.items.map((item) => <li key={item}><Pair text={item} /></li>)}</ul>
        </section>)}
      </div>
    </div>
    <p className="morph9-eyebrow">{S.summary.pointsTitle}</p>
    <List items={S.summary.points} ordered />
  </>
}

/* ------------------------------------------------------------------ *
 * المختبرات التعليمية: تفاعلات حقيقية بلوحة المفاتيح واللمس، ولا درجات.
 * ------------------------------------------------------------------ */
function usePracticeState() {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  return {
    answers, checked,
    pick(id: string, value: string) {
      setAnswers((current) => ({ ...current, [id]: value }))
      setChecked((current) => ({ ...current, [id]: false }))
    },
    check(id: string) { setChecked((current) => ({ ...current, [id]: true })) },
    reset() { setAnswers({}); setChecked({}) },
  }
}
type PracticeState = ReturnType<typeof usePracticeState>
/** حالة التدريبات الأصلية تزيد زرّ الكشف المشترك على حالة النشاط. */
type TrainingState = PracticeState & { revealed: boolean; reveal: () => void }

function ChoiceCard({ item, state, options }: { item: C.LabItem; state: PracticeState; options: readonly string[] }) {
  const value = state.answers[item.id]
  const checked = state.checked[item.id] ?? false
  const status = practiceStatus(item, value)
  return <fieldset className="morph9-practice-card" data-testid={`morph9-practice-${item.id}`}>
    <legend><bdi dir="rtl">{item.prompt}</bdi></legend>
    <div className="morph9-radio-options" role="radiogroup" aria-label={item.prompt}>
      {options.map((option) => <label key={option}>
        <input type="radio" name={`morph9-${item.id}`} value={option}
          checked={value === option} onChange={() => state.pick(item.id, option)} />
        <bdi className="morph9-word">{option}</bdi>
      </label>)}
    </div>
    <button type="button" className="button button--secondary" disabled={!value} onClick={() => state.check(item.id)}>تحقق من الإجابة</button>
    {checked && <div className={`morph9-feedback morph9-feedback--${status}`} role="status">
      <strong>{status === 'correct' ? 'إجابة صحيحة.' : 'تحتاج الإجابة إلى مراجعة.'}</strong>
      <p>الإجابة الصحيحة: <bdi>{item.answer}</bdi></p>
      <span className="morph9-eyebrow">توضيح من المنصة</span>
      <p>{item.explanation}</p>
    </div>}
  </fieldset>
}

/** نشاط اختيار/تصنيف: بطاقات بخيارات قابلة للضغط ولوحة المفاتيح. */
function ChoiceLab({ lab, state }: { lab: C.LabDefinition; state: PracticeState }) {
  return <div data-testid={`morph9-lab-${lab.id}`}>
    <p className="morph9-eyebrow">توضيح من المنصة · نشاط تعليمي، لا اختبار</p>
    <p>{lab.instruction}</p>
    <div className="morph9-practice-grid">
      {lab.items.map((item) => <ChoiceCard key={item.id} item={item} state={state} options={item.options} />)}
    </div>
    <button type="button" className="button button--ghost" onClick={state.reset}>إعادة النشاط</button>
  </div>
}

function PositionLab({ state }: { state: PracticeState }) {
  const lab = C.positionLab
  return <div data-testid="morph9-lab-positions">
    <p className="morph9-eyebrow">توضيح من المنصة · نوع صرفي وموقع إعرابي</p>
    <p>{lab.instruction}</p>
    <div className="morph9-position-grid">
      {lab.items.map((item) => {
        const kindValue = state.answers[`${item.id}-kind`]
        const positionValue = state.answers[`${item.id}-position`]
        const checked = state.checked[item.id] ?? false
        const status = kindValue === item.kind && positionValue === item.position ? 'correct' : 'wrong'
        return <fieldset className="morph9-practice-card" key={item.id} data-testid={`morph9-practice-${item.id}`}>
          <legend><bdi dir="rtl">{item.sentence}</bdi> — الكلمة: <Masdar word={item.word} /></legend>
          <label className="morph9-select-label"><span>النوع الصرفي</span>
            <select aria-label={`${item.sentence} — النوع الصرفي`} value={kindValue ?? ''}
              onChange={(event) => state.pick(`${item.id}-kind`, event.target.value)}>
              <option value="">اختر…</option>
              {C.positionOptions.kinds.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <label className="morph9-select-label"><span>الموقع الإعرابي</span>
            <select aria-label={`${item.sentence} — الموقع الإعرابي`} value={positionValue ?? ''}
              onChange={(event) => state.pick(`${item.id}-position`, event.target.value)}>
              <option value="">اختر…</option>
              {C.positionOptions.positions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <button type="button" className="button button--secondary" disabled={!kindValue || !positionValue}
            onClick={() => state.check(item.id)}>تحقق من التحليل</button>
          {checked && <div className={`morph9-feedback morph9-feedback--${status}`} role="status">
            <strong>{status === 'correct' ? 'تحليل صحيح.' : 'راجع التحليل.'}</strong>
            <p>النوع الصرفي: <bdi>{item.kind}</bdi> · الموقع الإعرابي: <bdi>{item.position}</bdi></p>
            <span className="morph9-eyebrow">توضيح من المنصة</span>
            <p>{item.explanation}</p>
          </div>}
        </fieldset>
      })}
    </div>
    <button type="button" className="button button--ghost" onClick={state.reset}>إعادة النشاط</button>
  </div>
}

/** المختبر المتدرّج: أربع مراحل، ولا تظهر المرحلة التالية قبل إصابة السابقة. */
function AnalysisLab() {
  const lab = C.analysisLab
  const [caseId, setCaseId] = useState<string>(lab.cases[0].id)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [progress, setProgress] = useState<Record<string, number>>({})
  const [feedback, setFeedback] = useState<{ key: string; ok: boolean } | null>(null)
  const active = lab.cases.find((item) => item.id === caseId)!
  const done = progress[caseId] ?? 0
  const key = (index: number) => `${caseId}:${index}`
  const finished = done >= active.stages.length

  function pickStage(index: number, value: string) {
    setAnswers((current) => ({ ...current, [key(index)]: value }))
    setFeedback(null)
  }
  function checkStage(index: number) {
    const stage = active.stages[index]
    const ok = answers[key(index)] === stage.answer
    setFeedback({ key: key(index), ok })
    if (ok) setProgress((current) => ({ ...current, [caseId]: Math.max(current[caseId] ?? 0, index + 1) }))
  }
  function resetCase() {
    setAnswers({})
    setProgress({})
    setFeedback(null)
  }

  return <div data-testid="morph9-lab-analysis">
    <p className="morph9-eyebrow">توضيح من المنصة · تحليل متدرّج بلا درجات</p>
    <p>{lab.instruction}</p>
    <div className="morph9-chips" role="group" aria-label="اختر الفعل المطلوب تحليله">
      {lab.cases.map((item) => <button type="button" key={item.id} aria-pressed={caseId === item.id}
        onClick={() => setCaseId(item.id)}><bdi>{item.verb}</bdi></button>)}
    </div>
    <ol className="morph9-stages" data-testid="morph9-analysis-stages">
      {active.stages.map((stage, index) => {
        const visible = index <= done
        const value = answers[key(index)]
        const shown = feedback?.key === key(index) ? feedback : null
        return <li key={stage.id} className={index < done ? 'morph9-stage--done' : undefined}
          data-testid={`morph9-stage-${stage.id}`}>
          <strong>{stage.label}</strong>
          {visible ? <>
            <label className="morph9-select-label"><span>اختيارك</span>
              <select aria-label={`${active.verb} — ${stage.label}`} value={value ?? ''}
                disabled={index < done} onChange={(event) => pickStage(index, event.target.value)}>
                <option value="">اختر…</option>
                {stage.options.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
            {index === done && <button type="button" className="button button--secondary" disabled={!value}
              onClick={() => checkStage(index)}>تحقق من هذه المرحلة</button>}
            {index < done && <p className="morph9-stage__answer">إجابتك: <bdi>{stage.answer}</bdi></p>}
            {shown && <div className={`morph9-feedback morph9-feedback--${shown.ok ? 'correct' : 'wrong'}`} role="status">
              <strong>{shown.ok ? 'مرحلة صحيحة، انتقل إلى التالية.' : 'تحتاج هذه المرحلة إلى مراجعة.'}</strong>
              <p>الإجابة الصحيحة: <bdi>{stage.answer}</bdi></p>
              <span className="morph9-eyebrow">توضيح من المنصة</span>
              <p>{stage.explanation}</p>
            </div>}
          </> : <p className="morph9-muted">أكمل المرحلة السابقة لتظهر هذه المرحلة.</p>}
        </li>
      })}
    </ol>
    {finished && <div className="morph9-analysis-result" role="status" data-testid="morph9-analysis-result">
      <h3>اكتمل التحليل</h3>
      <p><Verb word={active.verb} /> ← <Masdar word={active.stages[2].answer} /> · وزن المصدر: <Weight text={active.stages[3].answer} /></p>
      <p className="morph9-sentence"><bdi dir="rtl">{active.sentence}</bdi></p>
    </div>}
    <div className="morph9-actions">
      <button type="button" className="button button--ghost" onClick={resetCase}>إعادة التحليل</button>
    </div>
  </div>
}

/* ------------------------------------------------------------------ *
 * التدريبات الأصلية الاثنا عشر: ثلاثة تدريبات، وحالة واحدة، وزرّان.
 * ------------------------------------------------------------------ */
function TrainingSolutionView({ solution }: { solution: C.TrainingSolution }) {
  return <>
    <List items={solution.steps} ordered />
    <h4>لماذا لا نختار المشتتات؟</h4>
    <List items={solution.distractors} />
  </>
}

function TrainingCard({ item, state }: { item: (typeof S.trainings.groups)[number]['items'][number]; state: TrainingState }) {
  const solution = C.trainingSolutions[item.number]
  const value = state.answers[item.id]
  const checked = state.checked[item.id] || state.revealed
  const status = practiceStatus(solution, value)
  return <fieldset className="morph9-practice-card" data-testid={`morph9-practice-${item.id}`}>
    <legend><span className="morph9-number"><bdi>{C.arabicDigits(item.number)}</bdi></span> <bdi dir="rtl">{item.prompt}</bdi></legend>
    <div className="morph9-radio-options" role="radiogroup" aria-label={item.prompt}>
      {item.options.map((option) => <label key={option}>
        <input type="radio" name={`morph9-${item.id}`} value={option}
          checked={value === option} onChange={() => state.pick(item.id, option)} />
        <bdi className="morph9-word">{option}</bdi>
      </label>)}
    </div>
    <button type="button" className="button button--secondary" disabled={!value} onClick={() => state.check(item.id)}>تحقق من الإجابة</button>
    {checked && <div className={`morph9-feedback morph9-feedback--${status}`} role="status">
      <strong>{status === 'correct' ? 'إجابة صحيحة.' : status === 'wrong' ? 'تحتاج الإجابة إلى مراجعة.' : 'لم تختر إجابة بعد.'}</strong>
      <p>الإجابة الصحيحة: <bdi>{solution.answer}</bdi></p>
      <span className="morph9-eyebrow">توضيح من المنصة · حلول أعدّتها المنصة</span>
      <TrainingSolutionView solution={solution} />
    </div>}
  </fieldset>
}

function TrainingStep({ groupIndex, state }: { groupIndex: 0 | 1 | 2; state: TrainingState }) {
  const group = S.trainings.groups[groupIndex]
  return <div data-testid={`morph9-training-${group.id}`}>
    {groupIndex === 0 && <><h3>{S.trainings.heading}</h3><p>{S.trainings.intro}</p></>}
    <p className="morph9-muted">تدريبات المصدر التعليمية؛ لا تدخل في درجة اختبار نهاية الدرس. الحلول المعروضة أعدّتها المنصة؛ فالنص الخام لا يحتوي مفتاح إجابات.</p>
    <div className="morph9-practice-grid">
      {group.items.map((item) => <TrainingCard key={item.id} item={item} state={state} />)}
    </div>
    <div className="morph9-actions">
      <button type="button" className="button button--primary" onClick={state.reveal}>{C.trainingControls.reveal}</button>
      <button type="button" className="button button--ghost" onClick={state.reset}>{C.trainingControls.reset}</button>
    </div>
    <p className="morph9-muted">الزر الأول يكشف تصحيح التدريبات الثلاثة، والثاني يمسح كل محاولاتها ويعيد إخفاء التصحيح. لا يؤثران في الاختبار.</p>
  </div>
}

/* ------------------------------------------------------------------ *
 * الاختبار المستقل عبر المحرك المشترك.
 * ------------------------------------------------------------------ */
function SubmitStep({ engine, submitted, onSubmit, onReset }: {
  engine: TestEngine; submitted: boolean; onSubmit: () => void; onReset: () => void
}) {
  const questions = testDefinition.pages.flatMap((page) => page.questions)
  const result = engine.finalResult
  return <section className="morph9-submit" aria-label="تسليم الاختبار والنتيجة" data-testid="morph9-submit">
    <p>أجبت عن <bdi>{C.arabicDigits(answeredCount(questions, engine.answers))}</bdi> من <bdi>{C.arabicDigits(TEST_TOTALS.questions)}</bdi> سؤالًا.</p>
    {!submitted ? <>
      <p>التحقق من الصفحات يحفظ الإجابات دون كشف. يمكنك مراجعتها قبل التسليم؛ الأسئلة غير المجابة تُحتسب «لم تُجب». لا تُعرض الدرجة أو الحلول حتى تضغط الزر التالي.</p>
      <button type="button" className="button button--primary" onClick={onSubmit}>تسليم الاختبار وإظهار النتيجة</button>
    </> : <div role="status" className="morph9-result" data-testid="morph9-final-result">
      <h3>النتيجة النهائية</h3>
      <p className="morph9-score"><bdi>{C.arabicDigits(earnedMarks(result))} / {C.arabicDigits(TEST_TOTALS.total)}</bdi></p>
      <p>إجابات صحيحة: <bdi>{C.arabicDigits(result.correct)}</bdi> · غير صحيحة: <bdi>{C.arabicDigits(result.wrong)}</bdi> · لم تُجب: <bdi>{C.arabicDigits(result.unanswered)}</bdi></p>
      <p>افتح خطوة «حلول الاختبار» للتفسير الكامل، أو عُد إلى صفحات الأسئلة لمراجعة التصحيح.</p>
    </div>}
    <div className="morph9-actions"><button type="button" className="button button--ghost" onClick={onReset}>إعادة الاختبار</button></div>
    <p className="morph9-muted">إعادة الاختبار تمسح إجاباته ونتائجه وتعيد قفل الحلول. تعديل أي إجابة بعد التسليم يستلزم تسليم المحاولة المعدّلة من جديد.</p>
  </section>
}

/* ------------------------------------------------------------------ *
 * دليل المعلّم خلف البوابة القائمة.
 * ------------------------------------------------------------------ */
function TeacherSection({ title, children }: { title: string; children: ReactNode }) {
  return <details className="morph9-teacher-section"><summary>{title}</summary><div>{children}</div></details>
}

function TeacherArea() {
  return <TeacherSpace>
    <div className="morph9-teacher" data-testid="morph9-teacher-material">
      <h3>دليل المعلّم — المصدر: تعريفه وأوزانه الأساسية</h3>
      <p className="morph9-eyebrow">توضيح من المنصة · شروح ومفاتيح تعليمية وحلول أعدّتها المنصة</p>

      <TeacherSection title="١. شرح محاور الدرس وأهدافه">
        <List items={C.objectives} />
        {C.teacherTopics.map((topic) => <article key={topic.heading}><h4>{topic.heading}</h4><p>{topic.explanation}</p></article>)}
      </TeacherSection>

      <TeacherSection title="٢. التعريف والفروق الأربعة">
        <div className="morph9-definition morph9-definition--main"><p>{S.definition.text}</p></div>
        <p>{C.clarifications.definition}</p>
        <p>{C.clarifications.fourKinds}</p>
        <p>{C.clarifications.doer}</p>
        <p>{C.clarifications.done}</p>
        <p>{C.clarifications.morphoSyntax}</p>
      </TeacherSection>

      <TeacherSection title="٣. الجداول الأربعة كاملة">
        <ScrollTable label="جدول الأمثلة الأساسية — نسخة المعلّم">
          <table className="morph9-table" data-testid="morph9-table-teacher-basics">
            <caption>{S.basics.title}</caption>
            <thead><tr>{S.basics.columns.map((column) => <th scope="col" key={column}>{column}</th>)}</tr></thead>
            <tbody>{S.basics.rows.map((row) => <tr key={row.id}>
              <th scope="row"><Verb word={row.verb} /></th><td><Masdar word={row.masdar} /></td><td>{row.event}</td>
            </tr>)}</tbody>
          </table>
        </ScrollTable>
        <ScrollTable label="جدول المقارنة — نسخة المعلّم">
          <table className="morph9-table" data-testid="morph9-table-teacher-kinds">
            <caption>{S.kinds.tableTitle}</caption>
            <thead><tr>{S.kinds.columns.map((column) => <th scope="col" key={column}>{column}</th>)}</tr></thead>
            <tbody>{S.kinds.rows.map((row) => <tr key={row.id}>
              <th scope="row">{row.kind}</th><td><Masdar word={row.example} /></td><td>{row.meaning}</td>
            </tr>)}</tbody>
          </table>
        </ScrollTable>
        <ScrollTable label="جدول أوزان الثلاثي — نسخة المعلّم">
          <table className="morph9-table morph9-table--weights" data-testid="morph9-table-teacher-triliteral">
            <caption>{S.triliteral.heading}</caption>
            <thead><tr>{S.triliteral.columns.map((column) => <th scope="col" key={column}>{column}</th>)}</tr></thead>
            <tbody>{S.triliteral.rows.map((row) => <tr key={row.id}>
              <th scope="row"><Weight text={row.weight} /></th><td><Masdar word={row.masdar} /></td><td><Verb word={row.verb} /></td>
            </tr>)}</tbody>
          </table>
        </ScrollTable>
        <ScrollTable label="جدول مصادر المزيدة — نسخة المعلّم">
          <table className="morph9-table morph9-table--weights" data-testid="morph9-table-teacher-augmented">
            <caption>{S.augmented.heading}</caption>
            <thead><tr>{S.augmented.columns.map((column) => <th scope="col" key={column}>{column}</th>)}</tr></thead>
            <tbody>{S.augmented.rows.map((row) => <tr key={row.id}>
              <th scope="row"><Verb word={row.verb} /></th><td><Weight text={row.verbWeight} /></td>
              <td><Masdar word={row.masdar} /></td><td><Weight text={row.masdarWeight} /></td>
            </tr>)}</tbody>
          </table>
        </ScrollTable>
      </TeacherSection>

      <TeacherSection title="٤. التحليل الصرفي والنحوي الكامل">
        <h4>التحليل الصرفي: الفعل ونوعه ووزنه، والمصدر ووزنه</h4>
        <ScrollTable label="جدول التحليل الصرفي — نسخة المعلّم">
          <table className="morph9-table morph9-table--weights" data-testid="morph9-table-teacher-analysis">
            <caption>تحليل صرفي لأمثلة الدرس</caption>
            <thead><tr><th scope="col">الفعل</th><th scope="col">نوعه</th><th scope="col">وزن الفعل</th><th scope="col">المصدر</th><th scope="col">وزن المصدر</th></tr></thead>
            <tbody>{C.morphologyAnalyses.map((row) => <tr key={`${row.verb}-${row.masdar}`}>
              <th scope="row"><Verb word={row.verb} /></th>
              <td>{row.verbKind}</td>
              <td><Weight text={row.verbWeight} /></td>
              <td><Masdar word={row.masdar} /></td>
              <td><Weight text={row.masdarWeight} /></td>
            </tr>)}</tbody>
          </table>
        </ScrollTable>
        <p>{C.clarifications.samai}</p>
        <p>{C.clarifications.fahm}</p>
        <p>{C.clarifications.marra}</p>
        <h4>التحليل النحوي الكامل لأمثلة الدرس</h4>
        {C.parsings.map((entry) => <article key={entry.sentence} className="morph9-teacher-answer">
          <h4><bdi dir="rtl">{entry.sentence}</bdi></h4>
          <List items={entry.lines} />
        </article>)}
      </TeacherSection>

      <TeacherSection title="٥. حلول التدريبات الأصلية الاثني عشر">
        <p>حلول أعدّتها المنصة؛ لا يحتوي النص الخام مفتاح إجابات مستقلًا. الشرح يستند إلى قواعد الدرس وجداوله.</p>
        {S.trainings.groups.map((group) => <section key={group.id}><h4>{group.heading}</h4>
          {group.items.map((item) => <article key={item.id} className="morph9-teacher-answer" data-testid={`morph9-teacher-${item.id}`}>
            <h4><bdi>{C.arabicDigits(item.number)}</bdi>. <bdi dir="rtl">{item.prompt}</bdi></h4>
            <p>الخيارات بالترتيب: {item.options.join(' / ')}</p>
            <p>الإجابة: <bdi>{C.trainingSolutions[item.number].answer}</bdi></p>
            <TrainingSolutionView solution={C.trainingSolutions[item.number]} />
          </article>)}
        </section>)}
      </TeacherSection>

      <TeacherSection title="٦. مفاتيح المختبرات وطريقة التدريس">
        <p>{C.clarifications.highlight}</p>
        {C.practiceLabs.map((lab) => <section key={lab.id}><h4>{lab.title}</h4>
          <ul className="morph9-list">{lab.items.map((item) => <li key={item.id}>
            <strong><bdi dir="rtl">{item.prompt}</bdi>: {item.answer}.</strong> {item.explanation}
          </li>)}</ul>
        </section>)}
        <section><h4>{C.positionLab.title}</h4>
          <ul className="morph9-list">{C.positionLab.items.map((item) => <li key={item.id}>
            <strong><bdi dir="rtl">{item.sentence}</bdi> — {item.word}: {item.kind}، {item.position}.</strong> {item.explanation}
          </li>)}</ul>
        </section>
        <section><h4>{C.analysisLab.title}</h4>
          <ul className="morph9-list">{C.analysisLab.cases.map((item) => <li key={item.id}>
            <strong><bdi dir="rtl">{item.verb}</bdi>: {item.stages.map((stage) => stage.answer).join(' ← ')}. الجملة: {item.sentence}</strong>
          </li>)}</ul>
        </section>
      </TeacherSection>

      <TeacherSection title="٧. مفاتيح الاختبار العشرين والحلول المفصّلة">
        <p>أسئلة الاختبار من إعداد المنصة، وحلولها مفصّلة في المحرك المشترك نفسه. تُعرض هنا كاملة لأن وضع المعلّم يكشف كل الصفحات.</p>
        <SolutionsArea test={testDefinition} mode="teacher" title="الحلول التفصيلية لاختبار الدرس التاسع" />
      </TeacherSection>

      <TeacherSection title="٨. المصدر الخام وتقرير التدقيق">
        <p>{C.teacherReferences.note}</p>
        <ul className="morph9-list">
          <li><a href={sourceUrl} download="morphology-lesson-09.md"><bdi dir="ltr">{C.teacherReferences.source}</bdi> — تنزيل المصدر الخام</a></li>
          <li><a href={auditUrl} download="morphology-lesson-09-audit.md"><bdi dir="ltr">{C.teacherReferences.audit}</bdi> — تنزيل تقرير التدقيق</a></li>
        </ul>
        <p>الدرس العاشر انتقال نصي فقط. لم يُنشأ درس عاشر ولا اختبار وحدة؛ لا يُعلن اكتمال الوحدة.</p>
      </TeacherSection>
    </div>
  </TeacherSpace>
}

/* ------------------------------------------------------------------ *
 * تجميع الدرس
 * ------------------------------------------------------------------ */
export function LessonMorphologyNine({ onProgressChange, onFinish }: Props) {
  // كل الحالات فوق التدفق أحادي الخطوة، ومنها حالة التدريبات الأصلية.
  const testEngine = useTestEngine(testDefinition)
  const [testSubmitted, setTestSubmitted] = useState(false)
  const submitted = testSubmitted && testEngine.allPagesChecked
  const trainingState = useTrainingState()
  const kindsState = usePracticeState()
  const masdarState = usePracticeState()
  const weightState = usePracticeState()
  const positionState = usePracticeState()

  // التعديل يبطل التسليم كما يبطل نتيجة الصفحة؛ لا يُعاد فتح تسليم سابق.
  const guardedEngine: TestEngine = {
    ...testEngine,
    setAnswer(questionId, fieldIndex, value) {
      setTestSubmitted(false)
      testEngine.setAnswer(questionId, fieldIndex, value)
    },
    uncheckPage(pageId) { setTestSubmitted(false); testEngine.uncheckPage(pageId) },
    resetTest() { setTestSubmitted(false); testEngine.resetTest() },
  }
  function submitTest() {
    for (const page of testDefinition.pages) testEngine.checkPage(page.id)
    setTestSubmitted(true)
  }

  const steps: LessonStepDefinition[] = [
    step('intro', S.header.firstTitle, 'مدخل الدرس', '◎', <IntroStep />),
    step('opening', S.opening.heading, 'الفعل والمصدر', '١', <OpeningStep />),
    step('definition', S.definition.heading, 'التعريف', '٢', <DefinitionStep />),
    step('basics', S.basics.title, 'التعريف', '▦', <BasicsStep />),
    step('how-to', S.howTo.heading, 'التعريف', '◌', <HowToStep />),
    step('kinds', S.kinds.heading, 'الفروق الأربعة', '٣', <KindsStep />),
    step('kinds-table', S.kinds.tableTitle, 'الفروق الأربعة', '▦', <KindsTableStep />),
    step('lab-kinds', C.kindsLab.title, 'الفروق الأربعة', '◈', <ChoiceLab lab={C.kindsLab} state={kindsState} />),
    step('positions', S.positions.heading, 'المصدر في الجملة', '٤', <PositionsStep />),
    step('morpho-syntax', S.positions.distinction, 'المصدر في الجملة', '◌', <MorphoSyntaxStep />),
    step('lab-positions', C.positionLab.title, 'المصدر في الجملة', '◈', <PositionLab state={positionState} />),
    step('categories', S.categories.heading, 'أنواع المصادر', '٥', <CategoriesStep />),
    step('triliteral', S.triliteral.heading, 'أوزان الثلاثي', '٦', <TriliteralStep />),
    step('triliteral-table', S.triliteral.tableLead, 'أوزان الثلاثي', '▦', <TriliteralTableStep />),
    step('triliteral-how', S.triliteral.howTitle, 'أوزان الثلاثي', '◌', <TriliteralHowStep />),
    step('lab-masdar', C.masdarLab.title, 'أوزان الثلاثي', '◈', <ChoiceLab lab={C.masdarLab} state={masdarState} />),
    step('augmented', S.augmented.heading, 'أوزان المزيدة', '٧', <AugmentedStep />),
    step('augmented-worked', S.augmented.workedTitle, 'أوزان المزيدة', '◌', <AugmentedWorkedStep />),
    step('lab-weight', C.weightLab.title, 'أوزان المزيدة', '◈', <ChoiceLab lab={C.weightLab} state={weightState} />),
    step('extraction', S.extraction.heading, 'خطوات الاستخراج', '٨', <ExtractionStep />),
    step('lab-analysis', C.analysisLab.title, 'خطوات الاستخراج', '◈', <AnalysisLab />),
    step('applications', S.applications.heading, 'التطبيق في الجملة', '٩', <ApplicationsStep />),
    step('absolute', S.applications.absoluteTitle, 'التطبيق في الجملة', '◌', <AbsoluteStep />),
    step('mistakes', S.mistakes.heading, 'الأخطاء الشائعة', '١٠', <MistakesStep />),
    step('training-one', S.trainings.groups[0].heading, 'تدريبات المصدر', '١١', <TrainingStep groupIndex={0} state={trainingState} />),
    step('training-two', S.trainings.groups[1].heading, 'تدريبات المصدر', '١١', <TrainingStep groupIndex={1} state={trainingState} />),
    step('training-three', S.trainings.groups[2].heading, 'تدريبات المصدر', '١١', <TrainingStep groupIndex={2} state={trainingState} />),
    step('summary', S.summary.heading, 'الخلاصة والانتقال', '١٢', <SummaryStep />),
    step('next-lesson', 'انتقال نصي: الدرس العاشر', 'الخلاصة والانتقال', '←', <>
      <p className="morph9-transition">{S.nextLesson}</p>
      <Clarification><p>هذا تمهيد نصي فقط؛ لا درس عاشر مسجّل ولا اختبار وحدة، والوحدة لم يُعلن اكتمالها.</p></Clarification>
    </>),
    ...testDefinition.pages.map((page) => step(`test-${page.id}`, page.title, 'اختبار الدرس · ٢٠ درجة', '◇', <>
      <p className="morph9-muted">{testDefinition.description}</p>
      <TestPageView page={page} engine={guardedEngine} questionTestIdPrefix="morph9-question" revealFeedback={submitted} />
    </>)),
    step('submit', 'تسليم الاختبار والنتيجة', 'اختبار الدرس · ٢٠ درجة', '✓',
      <SubmitStep engine={testEngine} submitted={submitted} onSubmit={submitTest} onReset={guardedEngine.resetTest} />),
    step('solutions', 'حلول الاختبار', 'اختبار الدرس · ٢٠ درجة', '▤', <>
      {submitted
        ? <SolutionsArea test={testDefinition} engine={guardedEngine} testId="morph9-solutions" revealFeedback={submitted} />
        : <div className="morph9-locked" data-testid="morph9-solutions-locked">
          <h3>الحلول مقفلة حتى التسليم النهائي</h3>
          <p>التحقق من الصفحات لا يكشف الحلول. افتح خطوة «تسليم الاختبار والنتيجة» وسلّم الاختبار كاملًا أولًا.</p>
        </div>}
    </>),
    step('teacher', 'منطقة خاصة بالمعلم', 'دليل المعلّم', '◆', <TeacherArea />),
  ]

  return <div className="morph9-lesson">
    <LessonFlow steps={steps} onProgressChange={onProgressChange} onFinish={onFinish}
      lessonTitle={C.lessonTitle} lessonNumber="٩" lessonEyebrow="القسم الثاني: الصرف" />
  </div>
}

function step(id: string, title: string, group: string, icon: string, content: ReactNode): LessonStepDefinition {
  return { id: `morph9-${id}`, title, shortTitle: title, group, icon, render: () => content }
}

/** حالة التدريبات الأصلية: زرّان مشتركان للتدريبات الثلاثة كلها. */
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
