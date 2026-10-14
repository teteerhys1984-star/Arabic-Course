import { createContext, useCallback, useContext, useMemo, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import { LessonFlow, type LessonFlowController, type LessonStepDefinition } from '../shared/components/LessonFlow'
import { TeacherSpace } from '../shared/teacher/TeacherSpace'
import {
  SolutionsArea, TestPageView, answeredCount, useTestEngine,
  type TestDefinition, type TestEngine,
} from '../shared/test'
import * as C from './spelling-lesson-05/content'
import { TEST_TOTALS, choiceStatus, originalFinalScore } from './spelling-lesson-05/grading'
import sourceUrl from '../../docs/source/spelling-lesson-05.md?url'
import auditUrl from '../../docs/spelling-lesson-05-audit.md?url'

// eslint-disable-next-line react-refresh/only-export-components -- lesson data consumed by the platform conformance suite.
export const testDefinition: TestDefinition = C.testDefinition
const S = C.sourceContent

interface Props {
  onProgressChange?: (value: number) => void
  onFinish?: () => void
}

/** عناوين الخطوات — تُستعمل في الفهرس وفي روابط العودة من خريطة الحفظ. */
const T = {
  intro: S.warmup.heading,
  layyina: S.layyina.heading,
  shapes: S.shapes.heading,
  glyphLab: 'مختبر: ا أم ى أم ي؟',
  nounsTri: S.nouns.triHeading,
  nounsTable: S.nouns.tableHeading,
  nounLab: 'مختبر أصل الألف في الأسماء',
  nounsMulti: S.nouns.multiHeading,
  nounSort: 'مختبر تصنيف الأسماء غير الثلاثية',
  verbsTri: 'الأفعال — القاعدة الأولى: الفعل الثلاثي',
  verbLab: 'مختبر من الماضي إلى المضارع',
  verbsMulti: 'الأفعال — القاعدة الثانية: الفعل غير الثلاثي',
  particles: S.particles.heading,
  particleLab: 'مختبر فرز الحروف والأسماء المبنية',
  map: S.map.heading,
  mistakes: S.mistakes.heading,
  errorLab: 'مختبر تصحيح الأخطاء',
  explainLab: 'مختبر بناء التفسير: الإجابة ثم السبب',
  cumulative: 'مراجعة تراكمية',
  practice: S.practice.heading,
  original: S.finalExam.heading,
  summary: S.summary.heading,
  homework: S.homework.heading,
} as const

/** «العودة إلى الشرح»: كل فرع في خريطة الحفظ يعيد إلى خطوات شرحه (معرّف الخطوة بلا البادئة). */
const summaryBackLinks: Record<string, { stepId: string; title: string }[]> = {
  'tri-noun': [{ stepId: 'nouns-tri', title: T.nounsTri }, { stepId: 'nouns-table', title: T.nounsTable }, { stepId: 'lab-noun-origin', title: T.nounLab }],
  'multi-noun': [{ stepId: 'nouns-multi', title: T.nounsMulti }, { stepId: 'lab-noun-sort', title: T.nounSort }],
  'tri-verb': [{ stepId: 'verbs-tri', title: T.verbsTri }, { stepId: 'lab-verb', title: T.verbLab }],
  'multi-verb': [{ stepId: 'verbs-multi', title: T.verbsMulti }],
  particles: [{ stepId: 'particles', title: T.particles }, { stepId: 'lab-particles', title: T.particleLab }],
}

/* ---------------- عناصر عرض صغيرة ---------------- */
function W({ children, tone }: { children: ReactNode; tone?: 'qaima' | 'maqsura' | 'ya' }) {
  return <bdi className={`spell5-word${tone ? ` spell5-word--${tone}` : ''}`} dir="rtl">{children}</bdi>
}
function Glyph({ shape, large = false }: { shape: 'ا' | 'ى' | 'ي'; large?: boolean }) {
  const tone = shape === 'ا' ? 'qaima' : shape === 'ى' ? 'maqsura' : 'ya'
  const name = shape === 'ا' ? 'ألف قائمة' : shape === 'ى' ? 'ألف مقصورة' : 'ياء'
  return <span className={`spell5-glyph spell5-glyph--${tone}${large ? ' spell5-glyph--large' : ''}`} title={name}><bdi dir="rtl">{shape}</bdi></span>
}
function Clarification({ children, title = 'توضيح تعليمي من المنصة' }: { children: ReactNode; title?: string }) {
  return <aside className="spell5-note"><strong className="spell5-note__label">{title}</strong><div>{children}</div></aside>
}
function CorrectionNote({ id }: { id: string }) {
  const item = C.corrections.find((entry) => entry.id === id)!
  return <aside className="spell5-correction" data-testid={`spell5-correction-${id}`}>
    <p className="spell5-correction__label"><strong>تصحيح علمي <bdi>{item.id}</bdi></strong> · {item.where}</p>
    <blockquote><span className="spell5-correction__tag">نص المادة</span> <bdi dir="rtl">{item.original}</bdi></blockquote>
    <p><strong>الصياغة الدقيقة:</strong> {item.corrected}</p>
    <p className="spell5-muted"><strong>السبب:</strong> {item.reason}</p>
  </aside>
}
function List({ items, ordered = false, className = 'spell5-list' }: { items: readonly string[]; ordered?: boolean; className?: string }) {
  const Tag = ordered ? 'ol' : 'ul'
  return <Tag className={className}>{items.map((item) => <li key={item}>{item}</li>)}</Tag>
}
function ScrollTable({ label, children }: { label: string; children: ReactNode }) {
  return <div className="spell5-table-scroll" role="region" aria-label={label} tabIndex={0}>{children}</div>
}
function Chain({ text }: { text: string }) {
  const parts = text.split('←').map((part) => part.trim())
  return <figure className="spell5-chain">
    <div className="spell5-chain__track" aria-hidden="true">
      {parts.map((part, index) => <span key={`${part}-${index}`} className="spell5-chain__node-wrap">
        {index > 0 && <span className="spell5-chain__arrow">←</span>}
        <span className={`spell5-chain__node${index === parts.length - 1 ? ' spell5-chain__node--result' : ''}`}><bdi dir="rtl">{part}</bdi></span>
      </span>)}
    </div>
    <figcaption><bdi dir="rtl">{text}</bdi></figcaption>
  </figure>
}
function LetterBoxes({ letters, label }: { letters: readonly string[]; label: string }) {
  const last = letters.length - 1
  return <span className="spell5-letters" role="img" aria-label={`${label}: ${letters.join(' ')} — ${C.arabicDigits(letters.length)} أحرف`}>
    {letters.map((letter, index) => <span key={`${letter}-${index}`} className={`spell5-letter${index === last ? (letter === 'ا' ? ' spell5-letter--qaima' : ' spell5-letter--maqsura') : ''}${index === last - 1 ? ' spell5-letter--before' : ''}${index === last - 1 && letter === 'ي' ? ' spell5-letter--ya' : ''}`}>
      <bdi dir="rtl">{letter}</bdi>
    </span>)}
    <span className="spell5-letters__count" aria-hidden="true"><bdi>{C.arabicDigits(letters.length)}</bdi></span>
  </span>
}
function Feedback({ ok, children, label }: { ok: boolean; children: ReactNode; label?: string }) {
  return <div className={`spell5-feedback spell5-feedback--${ok ? 'correct' : 'wrong'}`} role="status">
    <strong>{label ?? (ok ? 'إجابة صحيحة.' : 'تحتاج الإجابة إلى مراجعة.')}</strong>
    {children}
  </div>
}
function ActivityTag({ text = 'نشاط تعليمي من المنصة · لا يدخل في درجة الاختبار' }: { text?: string }) {
  return <p className="spell5-eyebrow">{text}</p>
}

/* ---------------- حالة الأنشطة ----------------
 * LessonFlow يركّب الخطوة الحالية وحدها ويزيلها عند مغادرتها، فكل حالة تعيش داخل خطوة كانت تضيع
 * عند التنقل. لذلك تُحفظ حالة الأنشطة في ذاكرة على مستوى الدرس (المكوّن الذي يبقى مركّبًا)، على
 * نهج الدرس الرابع (activityAnswers): تبقى إجابات الطالب عند المغادرة والعودة، ولا تُمسح إلا بزر
 * الإعادة الخاص بكل نشاط. ذاكرة محلية للدرس فقط؛ لا تمسّ المكوّنات المشتركة ولا الدروس الأخرى. */
interface LessonMemoryApi {
  values: Record<string, unknown>
  update: (key: string, action: SetStateAction<unknown>, initial: unknown) => void
}
const LessonMemory = createContext<LessonMemoryApi | null>(null)
function useLessonMemoryStore(): LessonMemoryApi {
  const [values, setValues] = useState<Record<string, unknown>>({})
  const update = useCallback((key: string, action: SetStateAction<unknown>, initial: unknown) => {
    setValues((previous) => {
      const current = key in previous ? previous[key] : initial
      const next = typeof action === 'function' ? (action as (value: unknown) => unknown)(current) : action
      return key in previous && Object.is(next, current) ? previous : { ...previous, [key]: next }
    })
  }, [])
  return useMemo(() => ({ values, update }), [values, update])
}
/** مثل useState تمامًا، لكن القيمة محفوظة في ذاكرة الدرس تحت مفتاح ثابت فتبقى بعد مغادرة الخطوة. */
function useKeptState<T>(key: string, initial: T): [T, Dispatch<SetStateAction<T>>] {
  const memory = useContext(LessonMemory)
  if (!memory) throw new Error('useKeptState must be used inside the spelling 5 lesson memory')
  const { values, update } = memory
  const [initialValue] = useState(initial) // ثابت منذ أول تركيب، مثل القيمة الأولى في useState
  const value = (key in values ? values[key] : initialValue) as T
  const setValue = useCallback(
    (action: SetStateAction<T>) => update(key, action as SetStateAction<unknown>, initialValue),
    [update, key, initialValue],
  )
  return [value, setValue]
}
function practiceApi(
  answers: Record<string, string>, setAnswers: Dispatch<SetStateAction<Record<string, string>>>,
  checked: Record<string, boolean>, setChecked: Dispatch<SetStateAction<Record<string, boolean>>>,
) {
  return {
    answers, checked,
    pick(id: string, value: string) { setAnswers((c) => ({ ...c, [id]: value })); setChecked((c) => ({ ...c, [id]: false })) },
    check(id: string) { setChecked((c) => ({ ...c, [id]: true })) },
    reset() { setAnswers({}); setChecked({}) },
  }
}
function usePracticeState() {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  return practiceApi(answers, setAnswers, checked, setChecked)
}
function useKeptPracticeState(key: string) {
  const [answers, setAnswers] = useKeptState<Record<string, string>>(`${key}:answers`, {})
  const [checked, setChecked] = useKeptState<Record<string, boolean>>(`${key}:checked`, {})
  return practiceApi(answers, setAnswers, checked, setChecked)
}
type PracticeState = ReturnType<typeof practiceApi>

function RadioOptions({ name, label, options, value, onPick, glyphs = false }: { name: string; label: string; options: readonly { value: string }[]; value: string | undefined; onPick: (value: string) => void; glyphs?: boolean }) {
  return <div className={`spell5-options${glyphs ? ' spell5-options--glyphs' : ''}`} role="radiogroup" aria-label={label}>
    {options.map((option) => <label key={option.value} className="spell5-option">
      <input type="radio" name={name} value={option.value} checked={value === option.value} onChange={() => onPick(option.value)} />
      {glyphs && (option.value === 'ا' || option.value === 'ى')
        ? <><Glyph shape={option.value} /><span className="spell5-sr">{option.value === 'ا' ? ' ألف قائمة' : ' ألف مقصورة'}</span></>
        : <bdi className="spell5-word">{option.value}</bdi>}
    </label>)}
  </div>
}

function ChoiceCard({ item, state, prefix, legend }: { item: C.ChoiceItem; state: PracticeState; prefix: string; legend?: ReactNode }) {
  const value = state.answers[item.id]
  const checked = state.checked[item.id] ?? false
  const ok = value === item.answer
  const chosen = item.options.find((option) => option.value === value)
  const correct = item.options.find((option) => option.value === item.answer)!
  return <fieldset className="spell5-card" data-testid={`spell5-practice-${item.id}`}>
    <legend>{legend ?? <W>{item.prompt}</W>}</legend>
    <RadioOptions name={`${prefix}-${item.id}`} label={item.prompt} options={item.options} value={value} onPick={(v) => state.pick(item.id, v)} />
    <button type="button" className="button button--secondary" disabled={!value} onClick={() => state.check(item.id)}>تحقق من الإجابة</button>
    {checked && chosen && <Feedback ok={ok}>
      <p>الإجابة الصحيحة: <W>{item.answer}</W></p>
      <p><strong>{ok ? 'لماذا هي صحيحة؟' : `لماذا «${chosen.value}» غير صحيحة؟`}</strong> {chosen.explanation}</p>
      {!ok && <p><strong>ولماذا الصحيح صحيح؟</strong> {correct.explanation}</p>}
      <p className="spell5-muted"><strong>القاعدة:</strong> {item.rule}</p>
    </Feedback>}
  </fieldset>
}
function ChoiceLab({ testId, items, state, intro }: { testId: string; items: readonly C.ChoiceItem[]; state: PracticeState; intro: ReactNode }) {
  return <div data-testid={testId}>
    <ActivityTag />
    {intro}
    <div className="spell5-grid">{items.map((item) => <ChoiceCard key={item.id} item={item} state={state} prefix={testId} />)}</div>
    <button type="button" className="button button--ghost" onClick={state.reset}>إعادة النشاط</button>
  </div>
}

/* مختبر متدرّج: كل مرحلة تظهر بعد إتقان السابقة. */
function StagedLab({ testId, cases, intro }: { testId: string; cases: readonly C.StagedCase[]; intro: ReactNode }) {
  const [caseId, setCaseId] = useKeptState<string>(`${testId}:case`, cases[0].id)
  const [answers, setAnswers] = useKeptState<Record<string, string>>(`${testId}:answers`, {})
  const [progress, setProgress] = useKeptState<Record<string, number>>(`${testId}:progress`, {})
  const [feedback, setFeedback] = useKeptState<{ key: string; ok: boolean } | null>(`${testId}:feedback`, null)
  const active = cases.find((item) => item.id === caseId)!
  const done = progress[caseId] ?? 0
  const key = (index: number) => `${caseId}:${index}`
  const finished = done >= active.stages.length
  function pick(index: number, value: string) { setAnswers((c) => ({ ...c, [key(index)]: value })); setFeedback(null) }
  function check(index: number) {
    const ok = answers[key(index)] === active.stages[index].answer
    setFeedback({ key: key(index), ok })
    if (ok) setProgress((c) => ({ ...c, [caseId]: Math.max(c[caseId] ?? 0, index + 1) }))
  }
  function reset() { setAnswers({}); setProgress({}); setFeedback(null) }
  return <div data-testid={testId} className="spell5-staged">
    <ActivityTag text="نشاط تعليمي من المنصة · تحليل متدرّج بلا درجات" />
    {intro}
    <div className="spell5-chips" role="group" aria-label="اختر الكلمة المطلوب تحليلها">
      {cases.map((item) => <button type="button" key={item.id} aria-pressed={caseId === item.id} onClick={() => { setCaseId(item.id); setFeedback(null) }}>
        <W>{item.word}</W>{(progress[item.id] ?? 0) >= item.stages.length && <span className="spell5-chip__done"> ✓<span className="spell5-sr"> مكتمل</span></span>}
      </button>)}
    </div>
    <div className="spell5-staged__board">
      <p className="spell5-staged__word" aria-label={`الكلمة: ${active.word}`}><W>{active.word}</W></p>
      <ol className="spell5-stages">
        {active.stages.map((stage, index) => {
          const visible = index <= done
          const shown = feedback?.key === key(index) ? feedback : null
          const option = stage.options.find((o) => o.value === answers[key(index)])
          const correct = stage.options.find((o) => o.value === stage.answer)!
          return <li key={stage.id} className={index < done ? 'spell5-stage spell5-stage--done' : 'spell5-stage'} data-testid={`${testId}-stage-${active.id}-${stage.id}`}>
            {visible ? <fieldset>
              <legend>{stage.label}</legend>
              {index < done
                ? <p className="spell5-stage__answer">✓ <W>{stage.answer}</W> — {correct.explanation}</p>
                : <>
                  <RadioOptions name={`${testId}-${active.id}-${stage.id}`} label={`${active.word} — ${stage.label}`} options={stage.options} value={answers[key(index)]} onPick={(v) => pick(index, v)} glyphs={stage.id === 'shape'} />
                  <button type="button" className="button button--secondary" disabled={!answers[key(index)]} onClick={() => check(index)}>تحقق من هذه المرحلة</button>
                  {shown && !shown.ok && option && <Feedback ok={false} label="ليست هذه. أعد المحاولة."><p>{option.explanation}</p></Feedback>}
                </>}
            </fieldset> : <p className="spell5-muted">{stage.label} — تظهر بعد إتمام المرحلة السابقة.</p>}
          </li>
        })}
      </ol>
      {finished && <div className="spell5-result" role="status" data-testid={`${testId}-result`}><h3>اكتمل التحليل</h3><Chain text={active.chain} /></div>}
    </div>
    <div className="spell5-actions"><button type="button" className="button button--ghost" onClick={reset}>إعادة المختبر</button></div>
  </div>
}

/* ---------------- خطوات التمهيد ---------------- */
function IntroStep() {
  const [predictions, setPredictions] = useKeptState<Record<string, 'ا' | 'ى'>>('intro:predictions', {})
  const [revealed, setRevealed] = useKeptState('intro:revealed', false)
  const predictionState = useKeptPracticeState('intro:prediction')
  return <>
    <header className="spell5-hero">
      <p className="spell5-eyebrow">{S.header.eyebrow}</p>
      <h3>{S.header.title}</h3>
      <p className="spell5-hero__subtitle"><Glyph shape="ا" /> {S.header.subtitle} <Glyph shape="ى" /></p>
      <p>{S.header.intro}</p>
    </header>
    <section className="spell5-panel" aria-labelledby="spell5-warmup-lead">
      <p id="spell5-warmup-lead">{S.warmup.lead}</p>
      <p className="spell5-muted">قبل الكشف: توقّع لكل كلمة شكل ألفها الأخير، ثم اضغط «اكشف الشكل الصحيح».</p>
      <div className="spell5-hero__cards">
        {C.heroWords.map((word) => {
          const guess = predictions[word.id]
          return <article key={word.id} className={`spell5-tile${revealed ? ` spell5-tile--${word.shape}` : ''}`} data-testid={`spell5-tile-${word.id}`}>
            <p className="spell5-tile__word" aria-label={revealed ? word.word : `${word.stem} ثم حرف مخفي`}>
              <bdi dir="rtl">{word.stem}</bdi>
              {revealed ? <Glyph shape={word.ending} large /> : <span className="spell5-tile__slot" aria-hidden="true">؟</span>}
            </p>
            <div className="spell5-tile__guess" role="group" aria-label={`توقّعك لآخر ${word.stem}`}>
              {(['ا', 'ى'] as const).map((shape) => <button key={shape} type="button" aria-pressed={guess === shape} onClick={() => setPredictions((c) => ({ ...c, [word.id]: shape }))}>
                <Glyph shape={shape} /><span className="spell5-sr">{shape === 'ا' ? ' ألف قائمة' : ' ألف مقصورة'}</span>
              </button>)}
            </div>
            {revealed && <p className="spell5-tile__meta">{word.kind} · {word.clue}{guess && <> · {guess === word.ending ? 'توقّعك صحيح' : 'توقّعك مختلف'}</>}</p>}
          </article>
        })}
      </div>
      <div className="spell5-actions">
        {!revealed
          ? <button type="button" className="button button--primary" onClick={() => setRevealed(true)}>اكشف الشكل الصحيح</button>
          : <button type="button" className="button button--ghost" onClick={() => { setRevealed(false); setPredictions({}) }}>أعد التوقّع</button>}
      </div>
      {revealed && <div data-testid="spell5-warmup-revealed">
        <ScrollTable label="جدول التمهيد — قابل للتمرير">
          <table className="spell5-table" data-testid="spell5-table-warmup">
            <thead><tr>{S.warmup.columns.map((c) => <th scope="col" key={c}>{c}</th>)}</tr></thead>
            <tbody>{S.warmup.rows.map((row) => <tr key={row.word}><th scope="row"><W>{row.word}</W></th><td>{row.shape}</td></tr>)}</tbody>
          </table>
        </ScrollTable>
        <p>{S.warmup.observe}</p>
        <p className="spell5-question">{S.warmup.question}</p>
        <p>{S.warmup.closing}</p>
      </div>}
    </section>
    <ChoiceCard item={C.prediction} state={predictionState} prefix="spell5-prediction" legend={<span>{C.prediction.prompt}</span>} />
    <details className="spell5-details">
      <summary>أهداف الدرس</summary>
      <List items={C.objectives} />
    </details>
  </>
}

function LayyinaStep() {
  return <>
    <div className="spell5-definition"><p>{S.layyina.definition}</p></div>
    <div className="spell5-split">
      <section className="spell5-panel">
        <h3>{S.layyina.middleLead}</h3>
        <ul className="spell5-wordlist">{S.layyina.middle.map((word) => <li key={word}><W>{word}</W></li>)}</ul>
        <ul className="spell5-list spell5-muted">{C.clarifications.middleAnalysis.map((item) => <li key={item.word}><W>{item.word}</W>: {item.note}</li>)}</ul>
      </section>
      <section className="spell5-panel spell5-panel--focus">
        <h3>{S.layyina.endLead}</h3>
        <ul className="spell5-wordlist spell5-wordlist--end">{S.layyina.end.map((word) => <li key={word}><W>{word}</W></li>)}</ul>
        <p className="spell5-callout">{S.layyina.focus}</p>
      </section>
    </div>
    <Clarification>
      <p>{C.clarifications.layyinaNoStart}</p>
      <p>{C.clarifications.layyinaOpen}</p>
    </Clarification>
    <section className="spell5-panel spell5-parsing" aria-label="إعراب كامل يوضح تقدير الحركة على الألف">
      <p>{C.clarifications.noHarakatLead}</p>
      <p className="spell5-sentence"><W>{C.clarifications.parsingSentence}</W></p>
      <List items={C.clarifications.parsing} />
      <p className="spell5-muted">{C.clarifications.parsingNote}</p>
    </section>
  </>
}

function ShapesStep() {
  return <>
    <div className="spell5-glyph-trio">
      <article className="spell5-glyph-card spell5-glyph-card--qaima">
        <Glyph shape="ا" large />
        <h3>{S.shapes.qaima.title}</h3>
        <p>{S.shapes.qaima.text}</p>
        <p className="spell5-muted">{S.shapes.qaima.examples}</p>
      </article>
      <article className="spell5-glyph-card spell5-glyph-card--maqsura">
        <Glyph shape="ى" large />
        <h3>{S.shapes.maqsura.title}</h3>
        <p>{S.shapes.maqsura.text}</p>
        <p className="spell5-muted">{S.shapes.maqsura.examples}</p>
      </article>
      <article className="spell5-glyph-card spell5-glyph-card--ya">
        <Glyph shape="ي" large />
        <h3>للمقارنة: الياء المنقوطة</h3>
        <p>حرف مستقل وليس ألفًا لينة.</p>
        <p className="spell5-muted">توضيح تعليمي من المنصة</p>
      </article>
    </div>
    <section className="spell5-panel spell5-panel--warn">
      <h3>{S.shapes.warnLead}</h3>
      <ul className="spell5-list"><li>{S.shapes.warnMaqsura}</li><li>{S.shapes.warnYa}</li></ul>
      <p className="spell5-compare"><span>{S.shapes.compare}</span></p>
    </section>
    <CorrectionNote id="ت-٢" />
    <ScrollTable label="مقارنة فتى وكرسي — قابل للتمرير">
      <table className="spell5-table spell5-table--compare" data-testid="spell5-table-fata-kursi">
        <caption>أربعة اختبارات تميّز الألف المقصورة من الياء (توضيح من المنصة)</caption>
        <thead><tr>{C.fataKursiTests.columns.map((c) => <th scope="col" key={c}>{c}</th>)}</tr></thead>
        <tbody>{C.fataKursiTests.rows.map((row) => <tr key={row.test}><th scope="row">{row.test}</th><td className="spell5-cell--maqsura">{row.a}</td><td className="spell5-cell--ya">{row.b}</td></tr>)}</tbody>
      </table>
    </ScrollTable>
    <div className="spell5-anatomy">
      {C.glyphCards.map((card) => <article key={card.id} className={`spell5-anatomy__item spell5-anatomy__item--${card.id}`}>
        <h4>{card.name}</h4>
        <dl><dt>الشكل</dt><dd>{card.anatomy}</dd><dt>النطق</dt><dd>{card.sound}</dd><dt>الحركة</dt><dd>{card.harakat}</dd><dt>أمثلة</dt><dd><W>{card.examples}</W></dd></dl>
      </article>)}
    </div>
    <Clarification>
      <p>{C.clarifications.shapeOnly}</p>
      <p>{C.clarifications.pairsLead}</p>
      <ul className="spell5-list">{C.clarifications.pairs.map((pair) => <li key={pair.a}><W>{pair.a}</W> ↔ <W>{pair.b}</W></li>)}</ul>
    </Clarification>
  </>
}

/* ---------------- الأسماء ---------------- */
function WorkedNoun({ example }: { example: (typeof S.nouns.examples)[number] }) {
  const platform = C.nounWorked[example.id]
  return <article className={`spell5-worked spell5-worked--${example.id === 'asa' ? 'qaima' : 'maqsura'}`}>
    <h3>{example.heading}</h3>
    <p>{example.lead}</p>
    <List items={example.steps} ordered />
    <Chain text={example.chain} />
    <details className="spell5-details">
      <summary>التحليل الكامل خطوة بخطوة (توضيح من المنصة)</summary>
      <LetterBoxes letters={platform.letters} label={example.heading} />
      <dl className="spell5-reasoning">{platform.steps.map((s) => <div key={s.label}><dt>{s.label}</dt><dd>{s.text}</dd></div>)}</dl>
      <p className="spell5-muted">{platform.check}</p>
    </details>
  </article>
}
function NounsTriStep() {
  return <>
    <p className="spell5-section-mark">{S.nouns.heading}</p>
    <p>{S.nouns.lead}</p>
    <div className="spell5-definition"><p>{S.nouns.triDefinition}</p></div>
    <CorrectionNote id="ت-١" />
    <p>{S.nouns.triQuestion}</p>
    <div className="spell5-rule-pair">
      <p className="spell5-rule spell5-rule--qaima"><Glyph shape="ا" /> {S.nouns.triWaw}</p>
      <p className="spell5-rule spell5-rule--maqsura"><Glyph shape="ى" /> {S.nouns.triYa}</p>
    </div>
    <p className="spell5-callout">{S.nouns.triHow}</p>
    <ul className="spell5-tools" aria-label="أدوات كشف الأصل في الاسم الثلاثي (توضيح من المنصة)">
      {C.revealTools.map((tool) => <li key={tool.tool}><strong>{tool.tool}</strong><W>{tool.example}</W></li>)}
    </ul>
    <div className="spell5-split">{S.nouns.examples.map((example) => <WorkedNoun key={example.id} example={example} />)}</div>
    <Clarification><p>{C.clarifications.why3vsMore}</p><p>{C.clarifications.whyNotGuess}</p></Clarification>
  </>
}
function NounsTableStep() {
  return <>
    <ScrollTable label="جدول أمثلة الأسماء الثلاثية كما في المادة — قابل للتمرير">
      <table className="spell5-table" data-testid="spell5-table-nouns">
        <caption>نص المادة</caption>
        <thead><tr>{S.nouns.tableColumns.map((c) => <th scope="col" key={c}>{c}</th>)}</tr></thead>
        <tbody>{S.nouns.tableRows.map((row) => <tr key={row.id}><th scope="row"><W>{row.noun}</W></th><td><W>{row.reveal}</W></td><td><W>{row.spelling}</W></td></tr>)}</tbody>
      </table>
    </ScrollTable>
    <div className="spell5-notice"><p>{S.nouns.tableNote}</p></div>
    <h3>التحقق من كل صف وقوة دليله (توضيح من المنصة)</h3>
    <ScrollTable label="جدول التحقق من أمثلة الأسماء — قابل للتمرير">
      <table className="spell5-table spell5-table--stack" data-testid="spell5-table-nouns-verified">
        <thead><tr><th scope="col">الاسم</th><th scope="col">الحرف الذي ظهر</th><th scope="col">التعليل</th><th scope="col">قوة الدليل</th></tr></thead>
        <tbody>
          {S.nouns.tableRows.map((row) => {
            const reason = C.nounTableReasons[row.id]
            return <tr key={row.id}><th scope="row"><W>{row.noun}</W></th><td data-label="الحرف الذي ظهر"><W>{reason.letter}</W></td><td data-label="التعليل">{reason.reason}</td><td data-label="قوة الدليل"><span className={`spell5-badge spell5-badge--${reason.evidence}`}>{C.evidenceLabels[reason.evidence]}</span></td></tr>
          })}
          {C.nounExtraRows.map((row) => <tr key={row.id} className="spell5-row--added"><th scope="row"><W>{row.noun}</W> <small>(إضافة)</small></th><td data-label="الحرف الذي ظهر"><W>{row.reveal}</W></td><td data-label="التعليل">{row.reason} الكتابة: <W>{row.spelling}</W></td><td data-label="قوة الدليل"><span className="spell5-badge spell5-badge--direct">{C.evidenceLabels.direct}</span></td></tr>)}
        </tbody>
      </table>
    </ScrollTable>
    <CorrectionNote id="ت-٣" />
    <Clarification title="ملاحظة المعجم — توضيح تعليمي من المنصة"><p>{C.clarifications.dictionary}</p></Clarification>
  </>
}
function NounsMultiStep() {
  return <>
    <div className="spell5-definition"><p>{S.nouns.multiDefinition}</p></div>
    <section className="spell5-rulebox">
      <h3>{S.nouns.multiRuleLead}</h3>
      <p>{S.nouns.multiRule}</p>
    </section>
    <p className="spell5-muted">{C.clarifications.countHow}</p>
    <div className="spell5-split">
      <section className="spell5-panel spell5-panel--maqsura">
        <h3><Glyph shape="ى" /> {S.nouns.maqsuraLead}</h3>
        <ul className="spell5-count-list">{C.nounMultiWords.filter((w) => w.shape === 'maqsura').map((word, index) => <li key={word.id}>
          <W tone="maqsura">{S.nouns.maqsuraWords[index]}</W><LetterBoxes letters={word.letters} label={word.word} /><span className="spell5-muted">{word.reason}</span>
        </li>)}</ul>
      </section>
      <section className="spell5-panel spell5-panel--qaima">
        <h3><Glyph shape="ا" /> {S.nouns.qaimaLead}</h3>
        <ul className="spell5-count-list">{C.nounMultiWords.filter((w) => w.shape === 'qaima').map((word, index) => <li key={word.id}>
          <W tone="qaima">{S.nouns.qaimaWords[index]}</W><LetterBoxes letters={word.letters} label={word.word} /><span className="spell5-muted">{word.reason}</span>
        </li>)}</ul>
      </section>
    </div>
    <p className="spell5-callout">{S.nouns.memoryTip}</p>
    <Clarification><p>{C.clarifications.why3vsMore}</p><p>{C.clarifications.whyQaimaAfterYa}</p></Clarification>
    <section className="spell5-panel">
      <h3>{C.clarifications.exceptionsLead}</h3>
      <List items={C.clarifications.exceptions} />
    </section>
    <CorrectionNote id="ت-٦" />
  </>
}
function NounSortLab() {
  const [shape, setShape] = useKeptState<Record<string, string>>('noun-sort:shape', {})
  const [reason, setReason] = useKeptState<Record<string, string>>('noun-sort:reason', {})
  const [checked, setChecked] = useKeptState<Record<string, boolean>>('noun-sort:checked', {})
  function reset() { setShape({}); setReason({}); setChecked({}) }
  return <div data-testid="spell5-lab-noun-sort">
    <ActivityTag />
    <p>اختر شكل الألف لكل اسم، ثم اختر السبب. لا تُقبل الإجابة إلا إذا صحّ الشكل والسبب معًا.</p>
    <div className="spell5-grid">
      {C.nounSortLab.map((item) => {
        const ok = shape[item.id] === item.shape && reason[item.id] === item.reason
        return <fieldset key={item.id} className="spell5-card" data-testid={`spell5-practice-${item.id}`}>
          <legend><W>{item.word}</W></legend>
          <RadioOptions name={`spell5-sort-shape-${item.id}`} label={`${item.word} — شكل الألف`} options={[{ value: 'ا' }, { value: 'ى' }]} value={shape[item.id]} onPick={(v) => { setShape((c) => ({ ...c, [item.id]: v })); setChecked((c) => ({ ...c, [item.id]: false })) }} glyphs />
          <p className="spell5-select-title" aria-hidden="true">السبب</p>
          <RadioOptions name={`spell5-sort-reason-${item.id}`} label={`${item.word} — السبب`} options={C.nounReasonOptions.map((value) => ({ value }))} value={reason[item.id]} onPick={(v) => { setReason((c) => ({ ...c, [item.id]: v })); setChecked((c) => ({ ...c, [item.id]: false })) }} />
          <button type="button" className="button button--secondary" disabled={!shape[item.id] || !reason[item.id]} onClick={() => setChecked((c) => ({ ...c, [item.id]: true }))}>تحقق من الإجابة</button>
          {checked[item.id] && <Feedback ok={ok}>
            <p>الكتابة الصحيحة: <W>{item.full}</W></p>
            <LetterBoxes letters={item.letters} label={item.full} />
            <p>{item.explanation}</p>
            {shape[item.id] === item.shape && reason[item.id] !== item.reason && <p>الشكل صحيح، لكن السبب لا ينطبق؛ والمطلوب في هذا الدرس أن تعرف لماذا.</p>}
          </Feedback>}
        </fieldset>
      })}
    </div>
    <button type="button" className="button button--ghost" onClick={reset}>إعادة النشاط</button>
  </div>
}

/* ---------------- الأفعال ---------------- */
function VerbsTriStep() {
  return <>
    <p className="spell5-section-mark">{S.verbs.heading}</p>
    <p>{S.verbs.lead}</p>
    <p>{S.verbs.lead2}</p>
    <h3>{S.verbs.triHeading}</h3>
    <div className="spell5-definition"><p>{S.verbs.triRule}</p></div>
    <div className="spell5-rule-pair">
      <p className="spell5-rule spell5-rule--qaima"><Glyph shape="ا" /> {S.verbs.triWaw}</p>
      <p className="spell5-rule spell5-rule--maqsura"><Glyph shape="ى" /> {S.verbs.triYa}</p>
    </div>
    <div className="spell5-split">
      {S.verbs.examples.map((example) => <article key={example.id} className={`spell5-worked spell5-worked--${example.id === 'daa' ? 'qaima' : 'maqsura'}`}>
        <h3>{example.heading}</h3>
        <table className="spell5-table spell5-table--pair" data-testid={`spell5-table-verb-${example.id}`}>
          <thead><tr><th scope="col"><W>{example.past}</W></th><th scope="col"><W>{example.present}</W></th></tr></thead>
          <tbody><tr><td>{example.pastLabel}</td><td>{example.presentLabel}</td></tr></tbody>
        </table>
        <p>{example.conclusion}</p>
        <dl className="spell5-reasoning">{C.verbWorked[example.id].map((s) => <div key={s.label}><dt>{s.label}</dt><dd>{s.text}</dd></div>)}</dl>
      </article>)}
    </div>
    <Clarification><p>{C.clarifications.verbTools}</p></Clarification>
    <h3>{S.verbs.tableHeading}</h3>
    <ScrollTable label="جدول الأفعال الثلاثية — قابل للتمرير">
      <table className="spell5-table spell5-table--stack" data-testid="spell5-table-verbs">
        <thead><tr>{S.verbs.tableColumns.map((c) => <th scope="col" key={c}>{c}</th>)}<th scope="col">الدليل الموثوق (من المنصة)</th></tr></thead>
        <tbody>{S.verbs.tableRows.map((row) => {
          const ev = C.verbTableEvidence[row.id]
          return <tr key={row.id}><th scope="row"><W>{row.past}</W></th><td data-label={S.verbs.tableColumns[1]}><W>{row.present}</W></td><td data-label={S.verbs.tableColumns[2]}>{row.shape}</td><td data-label="الدليل الموثوق (من المنصة)"><span className={`spell5-badge spell5-badge--${ev.evidence}`}>{C.evidenceLabels[ev.evidence]}</span> <W>{ev.proof}</W><br /><small>{ev.reason}</small></td></tr>
        })}</tbody>
      </table>
    </ScrollTable>
    <CorrectionNote id="ت-٤" />
    <Clarification><p>{C.clarifications.saaCaution}</p></Clarification>
  </>
}
function VerbsMultiStep() {
  return <>
    <p>{S.verbs.multiLead}</p>
    <ul className="spell5-wordlist spell5-wordlist--maqsura">{S.verbs.maqsuraVerbs.map((verb) => <li key={verb}><W tone="maqsura">{verb}</W></li>)}</ul>
    <p>{S.verbs.qaimaLead}</p>
    <ul className="spell5-wordlist spell5-wordlist--qaima">{S.verbs.qaimaVerbs.map((verb) => <li key={verb}><W tone="qaima">{verb}</W></li>)}</ul>
    <h3>{S.verbs.compareLead}</h3>
    <ScrollTable label="جدول المقارنة — قابل للتمرير">
      <table className="spell5-table" data-testid="spell5-table-verbs-compare">
        <thead><tr>{S.verbs.compareColumns.map((c) => <th scope="col" key={c}>{c}</th>)}</tr></thead>
        <tbody>{S.verbs.compareRows.map((row) => <tr key={row.id}><th scope="row"><W>{row.verb}</W></th><td>{row.count}</td><td><Glyph shape={row.shape} /></td></tr>)}</tbody>
      </table>
    </ScrollTable>
    <div className="spell5-notice"><p>{S.verbs.countNote}</p></div>
    <h3>عدّ الأحرف بالبطاقات (توضيح من المنصة)</h3>
    <ScrollTable label="جدول عدّ أحرف الأفعال غير الثلاثية — قابل للتمرير">
      <table className="spell5-table spell5-table--stack" data-testid="spell5-table-verbs-count">
        <thead><tr><th scope="col">الفعل</th><th scope="col">الأحرف</th><th scope="col">الحرف قبل الألف</th><th scope="col">التعليل</th></tr></thead>
        <tbody>{C.verbMultiRows.map((row) => <tr key={row.id}><th scope="row"><W tone={row.shape}>{row.word}</W></th><td data-label="الأحرف"><LetterBoxes letters={row.letters} label={row.word} /></td><td data-label="الحرف قبل الألف"><W>{row.before}</W></td><td data-label="التعليل">{row.reason}</td></tr>)}</tbody>
      </table>
    </ScrollTable>
    <Clarification><p>{C.clarifications.rootVsCount}</p></Clarification>
  </>
}

/* ---------------- الحروف ---------------- */
function ParticlesStep() {
  return <>
    <p>{S.particles.lead}</p>
    <div className="spell5-split">
      <section className="spell5-panel spell5-panel--qaima">
        <h3><Glyph shape="ا" /> {S.particles.qaimaHeading}</h3>
        <p>{S.particles.qaimaLead}</p>
        <ul className="spell5-wordlist spell5-wordlist--qaima">{S.particles.qaima.map((w) => <li key={w}><W tone="qaima">{w}</W></li>)}</ul>
      </section>
      <section className="spell5-panel spell5-panel--maqsura">
        <h3><Glyph shape="ى" /> {S.particles.maqsuraHeading}</h3>
        <p>{S.particles.maqsuraLead}</p>
        <ul className="spell5-wordlist spell5-wordlist--maqsura">{S.particles.maqsura.map((w) => <li key={w}><W tone="maqsura">{w}</W></li>)}</ul>
      </section>
    </div>
    <div className="spell5-notice"><p>{S.particles.memorize}</p></div>
    <CorrectionNote id="ت-٥" />
    <Clarification>
      <p>{C.clarifications.particleRule}</p>
      <p>{C.clarifications.mabniRule}</p>
      <p>{C.clarifications.particleWhy}</p>
      <p>أزواج متشابهة يجب التمييز بينها:</p>
      <ul className="spell5-list">{C.clarifications.particlePairs.map((pair) => <li key={pair.a}><W>{pair.a}</W> ↔ <W>{pair.b}</W>{pair.c && <> ↔ <W>{pair.c}</W></>}</li>)}</ul>
    </Clarification>
  </>
}
function ParticleLab({ state }: { state: PracticeState }) {
  const [checked, setChecked] = useKeptState('particles:checked', false)
  const answered = C.particleLab.filter((item) => state.answers[item.id]).length
  const correct = C.particleLab.filter((item) => state.answers[item.id] === item.shape).length
  return <div data-testid="spell5-lab-particles">
    <ActivityTag />
    <p>أكمل كل كلمة بالشكل الصحيح للألف، ثم اضغط «تحقق من الفرز». تذكّر: هذه الكلمات لا يُكشف أصلها، فالمرجع رسمها المحفوظ.</p>
    <ul className="spell5-sorter">
      {C.particleLab.map((item) => {
        const value = state.answers[item.id]
        return <li key={item.id} data-testid={`spell5-particle-${item.id}`} className={checked && value ? (value === item.shape ? 'spell5-sorter--correct' : 'spell5-sorter--wrong') : undefined}>
          <W>{item.word}</W>
          <div role="group" aria-label={`شكل ألف ${item.word}`} className="spell5-sorter__buttons">
            {(['ا', 'ى'] as const).map((shape) => <button type="button" key={shape} aria-pressed={value === shape} onClick={() => { state.pick(item.id, shape); setChecked(false) }}>
              <Glyph shape={shape} /><span className="spell5-sr">{shape === 'ا' ? ' ألف قائمة' : ' ألف مقصورة'}</span>
            </button>)}
          </div>
          {checked && value && <p className="spell5-sorter__why" role="status"><strong>{value === item.shape ? 'صحيح' : 'غير صحيح'}</strong> ({item.kind}) — {item.explanation}</p>}
        </li>
      })}
    </ul>
    <div className="spell5-actions">
      <button type="button" className="button button--secondary" disabled={answered === 0} onClick={() => setChecked(true)}>تحقق من الفرز</button>
      <button type="button" className="button button--ghost" onClick={() => { state.reset(); setChecked(false) }}>إعادة النشاط</button>
    </div>
    {checked && <p className="spell5-result" role="status" data-testid="spell5-particles-score">فرزتَ <bdi>{C.arabicDigits(correct)}</bdi> من <bdi>{C.arabicDigits(C.particleLab.length)}</bdi> فرزًا صحيحًا.</p>}
    <ChoiceCard item={C.particleWhyItem} state={state} prefix="spell5-particle-why" legend={<span>{C.particleWhyItem.prompt}</span>} />
  </div>
}

/* ---------------- خريطة القرار ---------------- */
function SourceMap() {
  return <figure className="spell5-map" aria-label="خريطة القرار كما وردت في المادة">
    <p className="spell5-map__root">{S.map.root}</p>
    <div className="spell5-map__branches">
      {S.map.branches.map((branch) => <section key={branch.id} className={`spell5-map__branch spell5-map__branch--${branch.id}`}>
        <h4>{branch.title}</h4>
        <ul>{branch.lines.map((line) => <li key={line}><bdi dir="rtl">{line}</bdi></li>)}</ul>
      </section>)}
      <section className="spell5-map__branch spell5-map__branch--particle">
        <h4>{S.map.particleLead}</h4>
        <p>{S.map.particleText}</p>
      </section>
    </div>
  </figure>
}
type NodeKey = 'type' | 'count' | 'origin' | 'prevYa' | 'result'
function treePath(word: C.TreeWord): NodeKey[] {
  if (word.type === 'حرف') return ['type', 'result']
  return word.count === 'ثلاثة' ? ['type', 'count', 'origin', 'result'] : ['type', 'count', 'prevYa', 'result']
}
const nodeQuestion: Record<NodeKey, { q: string; options: string[] }> = {
  type: { q: 'ما نوع الكلمة؟', options: ['اسم', 'فعل', 'حرف'] },
  count: { q: 'كم حرفًا مكتوبًا فيها؟', options: ['ثلاثة', 'أكثر من ثلاثة'] },
  origin: { q: 'ما أصل الألف بحسب الصيغة الكاشفة؟', options: ['واو', 'ياء'] },
  prevYa: { q: 'هل سبقت الألفَ ياءٌ؟', options: ['نعم', 'لا'] },
  result: { q: 'إذن كيف تُكتب الألف؟', options: ['ا', 'ى'] },
}
function nodeAnswer(word: C.TreeWord, node: NodeKey): { answer: string; reason: string } {
  switch (node) {
    case 'type': return { answer: word.type, reason: word.typeReason }
    case 'count': return { answer: word.count!, reason: word.countReason! }
    case 'origin': return { answer: word.origin!, reason: word.originReason! }
    case 'prevYa': return { answer: word.prevYa!, reason: word.prevReason! }
    case 'result': return { answer: word.result, reason: word.resultReason }
  }
}
function exclusions(word: C.TreeWord): string[] {
  if (word.type === 'حرف') return ['استُبعد مسار الأسماء والأفعال: الحرف لا يُثنّى ولا يُصرّف، فلا عدّ ولا كشف أصل؛ المرجع رسمه المحفوظ.']
  const lines = [`استُبعد مسار الحروف: الكلمة ${word.type} (${word.typeReason})`]
  if (word.count === 'ثلاثة') lines.push('استُبعد مسار «القاعدة العامة» (غالبًا ى): الكلمة ثلاثة أحرف، فالحكم لأصل الألف.')
  else lines.push('استُبعد مسار كشف الأصل: الألف جاوزت الثالثة، فلا ننظر إلى أصلها بل نطبّق القاعدة العامة واستثناءها.')
  return lines
}
function DecisionStep() {
  const [wordId, setWordId] = useKeptState<string>('tree:word', C.treeWords[0].id)
  const [progress, setProgress] = useKeptState<Record<string, number>>('tree:progress', {})
  const [wrong, setWrong] = useKeptState<{ key: string; value: string } | null>('tree:wrong', null)
  const word = C.treeWords.find((w) => w.id === wordId)!
  const path = treePath(word)
  const done = progress[wordId] ?? 0
  function choose(index: number, value: string) {
    const node = path[index]
    const { answer } = nodeAnswer(word, node)
    if (value === answer) { setProgress((c) => ({ ...c, [wordId]: index + 1 })); setWrong(null) }
    else setWrong({ key: `${wordId}:${index}`, value })
  }
  return <>
    <SourceMap />
    <Clarification><p>نسمّي «غالبًا ى» في الخريطة <strong>القاعدة العامة</strong>: هي الحكم الأصلي في الاسم والفعل غير الثلاثيين، ويُستثنى منها ما سبقت ألفه ياء، ويُحفظ ما شذّ (يحيى العلم، وبعض الأعلام الأعجمية). أما الثلاثي فحكمه الأصل، والحروف حكمها الحفظ.</p></Clarification>
    <section className="spell5-tree" data-testid="spell5-lab-tree" aria-label="خريطة القرار التفاعلية">
      <ActivityTag text="نشاط تعليمي من المنصة · خريطة قرار تفاعلية" />
      <p>اختر كلمة، ثم أجب عن أسئلة الخريطة بالترتيب. الإجابة الخاطئة لا تنقلك؛ اقرأ السبب وأعد المحاولة.</p>
      <div className="spell5-chips" role="group" aria-label="اختر كلمة لتمريرها في الخريطة">
        {C.treeWords.map((w) => <button type="button" key={w.id} aria-pressed={w.id === wordId} onClick={() => { setWordId(w.id); setWrong(null) }}><W>{w.word}</W>{(progress[w.id] ?? 0) >= treePath(w).length && <span className="spell5-chip__done"> ✓<span className="spell5-sr"> مكتمل</span></span>}</button>)}
      </div>
      <ol className="spell5-tree__path">
        {path.map((node, index) => {
          if (index > done) return null
          const { answer, reason } = nodeAnswer(word, node)
          const isWrong = wrong?.key === `${wordId}:${index}`
          return <li key={node} className={`spell5-tree__node${index < done ? ' spell5-tree__node--done' : ' spell5-tree__node--active'}`} data-testid={`spell5-tree-${word.id}-${node}`}>
            <p className="spell5-tree__q">{nodeQuestion[node].q}</p>
            {index < done
              ? <p className="spell5-tree__a">{node === 'result' ? <Glyph shape={answer as 'ا' | 'ى'} /> : <strong>{answer}</strong>} — {reason}</p>
              : <>
                <div className="spell5-tree__options" role="group" aria-label={`${word.word} — ${nodeQuestion[node].q}`}>
                  {nodeQuestion[node].options.map((option) => <button type="button" key={option} className="button button--secondary" onClick={() => choose(index, option)}>
                    {option === 'ا' || option === 'ى' ? <><Glyph shape={option} /><span className="spell5-sr">{option === 'ا' ? ' ألف قائمة' : ' ألف مقصورة'}</span></> : option}
                  </button>)}
                </div>
                {isWrong && <Feedback ok={false} label={`ليس «${wrong.value}». أعد المحاولة.`}><p>تلميح: {node === 'type' ? 'جرّب علامات الاسم («ال») والفعل (تاء الفاعل).' : node === 'count' ? 'احذف «ال» وعُدّ الحروف المكتوبة، والألف منها.' : node === 'origin' ? 'هات المثنى أو المضارع أو أسند الفعل إلى التاء.' : node === 'prevYa' ? 'انظر إلى الحرف الذي قبل الألف مباشرة.' : 'طبّق حكم المسار الذي وصلت إليه.'}</p></Feedback>}
              </>}
          </li>
        })}
      </ol>
      {done >= path.length && <div className="spell5-result" role="status" data-testid="spell5-tree-result">
        <h3>النتيجة: <W tone={word.result === 'ا' ? 'qaima' : 'maqsura'}>{word.word}</W></h3>
        <p><strong>لماذا استُبعدت المسارات الأخرى؟</strong></p>
        <List items={exclusions(word)} />
      </div>}
      <div className="spell5-actions"><button type="button" className="button button--ghost" onClick={() => { setProgress({}); setWrong(null) }}>إعادة الخريطة</button></div>
    </section>
  </>
}

/* ---------------- الأخطاء الشائعة ---------------- */
function ErrorAnalysis({ item }: { item: C.ErrorItem }) {
  return <dl className="spell5-error-analysis">
    <div><dt>الخطأ</dt><dd><W>{item.wrong}</W></dd></div>
    <div><dt>الصواب</dt><dd><W>{item.answer}</W></dd></div>
    <div><dt>القاعدة</dt><dd>{item.rule}</dd></div>
    <div><dt>الدليل</dt><dd><W>{item.proof}</W></dd></div>
    <div><dt>لماذا البديل خطأ؟</dt><dd>{item.whyWrong}</dd></div>
    <div><dt>كيف أتجنّبه؟</dt><dd>{item.prevent}</dd></div>
  </dl>
}
function MistakesStep() {
  return <>
    <ScrollTable label="جدول الأخطاء الشائعة — قابل للتمرير">
      <table className="spell5-table spell5-table--errors" data-testid="spell5-table-mistakes">
        <thead><tr>{S.mistakes.columns.map((c) => <th scope="col" key={c}>{c}</th>)}</tr></thead>
        <tbody>{S.mistakes.rows.map((row) => <tr key={row.id}><th scope="row" className="spell5-cell--wrong">{row.wrong}</th><td className="spell5-cell--right">{row.right}</td></tr>)}</tbody>
      </table>
    </ScrollTable>
    <section className="spell5-advice"><h3>{S.mistakes.adviceTitle}</h3><p>{S.mistakes.advice}</p></section>
    <h3>تشريح كل خطأ (توضيح من المنصة)</h3>
    <div className="spell5-grid">{C.errorLab.filter((item) => item.fromSource).map((item) => <article key={item.id} className="spell5-card spell5-card--error"><h4><s><W>{item.wrong}</W></s> ← <W>{item.answer}</W></h4><ErrorAnalysis item={item} /></article>)}</div>
  </>
}
function ErrorLab({ state }: { state: PracticeState }) {
  const items = C.errorLab.filter((item) => !item.fromSource)
  return <div data-testid="spell5-lab-errors">
    <ActivityTag />
    <p>في كل عبارة خطأ إملائي جديد لم يرد في الجدول. اختر التصحيح، ثم اقرأ التشريح الكامل.</p>
    <div className="spell5-grid">
      {items.map((item) => {
        const value = state.answers[item.id]
        const ok = value === item.answer
        const chosen = item.options.find((o) => o.value === value)
        return <fieldset key={item.id} className="spell5-card spell5-card--error" data-testid={`spell5-practice-${item.id}`}>
          <legend>صحّح: <W><s>{item.wrong}</s></W></legend>
          <RadioOptions name={`spell5-error-${item.id}`} label={`تصحيح ${item.wrong}`} options={item.options} value={value} onPick={(v) => state.pick(item.id, v)} />
          <button type="button" className="button button--secondary" disabled={!value} onClick={() => state.check(item.id)}>تحقق من الإجابة</button>
          {state.checked[item.id] && chosen && <Feedback ok={ok}><p>{chosen.explanation}</p><ErrorAnalysis item={item} /></Feedback>}
        </fieldset>
      })}
    </div>
    <button type="button" className="button button--ghost" onClick={state.reset}>إعادة النشاط</button>
  </div>
}

/* ---------------- بناء التفسير ---------------- */
function ExplainLab() {
  const [spell, setSpell] = useKeptState<Record<string, string>>('explain:spell', {})
  const [reason, setReason] = useKeptState<Record<string, string>>('explain:reason', {})
  const [checked, setChecked] = useKeptState<Record<string, boolean>>('explain:checked', {})
  function reset() { setSpell({}); setReason({}); setChecked({}) }
  return <div data-testid="spell5-lab-explain">
    <ActivityTag />
    <p>الإجابة وحدها لا تكفي: اختر الكتابة، ثم اختر التعليل الذي يثبتها. تظهر النتيجة لكل جزء على حدة.</p>
    <div className="spell5-grid">
      {C.explainLab.map((item) => {
        const s = item.spellOptions.find((o) => o.value === spell[item.id])
        const r = item.reasonOptions.find((o) => o.value === reason[item.id])
        const okS = spell[item.id] === item.spellAnswer
        const okR = reason[item.id] === item.reasonAnswer
        return <fieldset key={item.id} className="spell5-card spell5-card--explain" data-testid={`spell5-practice-${item.id}`}>
          <legend>{item.prompt}</legend>
          <p className="spell5-step-label">١. الإجابة</p>
          <RadioOptions name={`spell5-explain-spell-${item.id}`} label={`${item.prompt} — الإجابة`} options={item.spellOptions} value={spell[item.id]} onPick={(v) => { setSpell((c) => ({ ...c, [item.id]: v })); setChecked((c) => ({ ...c, [item.id]: false })) }} />
          <p className="spell5-step-label">٢. السبب</p>
          <RadioOptions name={`spell5-explain-reason-${item.id}`} label={`${item.prompt} — السبب`} options={item.reasonOptions} value={reason[item.id]} onPick={(v) => { setReason((c) => ({ ...c, [item.id]: v })); setChecked((c) => ({ ...c, [item.id]: false })) }} />
          <button type="button" className="button button--secondary" disabled={!spell[item.id] || !reason[item.id]} onClick={() => setChecked((c) => ({ ...c, [item.id]: true }))}>تحقق من الإجابة والسبب</button>
          {checked[item.id] && s && r && <Feedback ok={okS && okR} label={okS && okR ? 'إجابة صحيحة بتعليل صحيح.' : okS ? 'الكتابة صحيحة، والتعليل يحتاج إلى مراجعة.' : 'تحتاج الكتابة إلى مراجعة.'}>
            <p><strong>الكتابة:</strong> <W>{item.spellAnswer}</W> — {s.explanation}</p>
            <p><strong>السبب:</strong> {r.explanation}{!okR && <> الصحيح: {item.reasonAnswer}.</>}</p>
          </Feedback>}
        </fieldset>
      })}
    </div>
    <button type="button" className="button button--ghost" onClick={reset}>إعادة النشاط</button>
  </div>
}

/* ---------------- التدريب السباعي ---------------- */
function PracticeStep() {
  const [answers, setAnswers] = useKeptState<Record<string, string>>('practice:answers', {})
  const [revealed, setRevealed] = useKeptState('practice:revealed', false)
  const score = C.practiceQuestions.filter((item) => answers[item.id] === item.answer).length
  return <div data-testid="spell5-practice">
    <p>{S.practice.instruction}</p>
    <p className="spell5-muted">أسئلة المادة الأصلية؛ الحلول والتعليلات من إعداد المنصة. التدريب لا يدخل في درجة اختبار الدرس.</p>
    <div className="spell5-grid">
      {C.practiceQuestions.map((item, index) => {
        const value = answers[item.id]
        const status = choiceStatus(item, value)
        return <fieldset key={item.id} className="spell5-card" data-testid={`spell5-practice-${item.id}`}>
          <legend><span className="spell5-number"><bdi>{C.arabicDigits(index + 1)}</bdi></span> {item.prompt}</legend>
          {item.clarification && <p className="spell5-muted">توضيح تعليمي من المنصة: {item.clarification}</p>}
          <RadioOptions name={`spell5-practice-${item.id}`} label={item.prompt} options={item.options} value={value} onPick={(v) => { setAnswers((c) => ({ ...c, [item.id]: v })); setRevealed(false) }} />
          {revealed && <Feedback ok={status === 'correct'} label={status === 'correct' ? 'إجابة صحيحة.' : status === 'wrong' ? 'تحتاج الإجابة إلى مراجعة.' : 'لم تختر إجابة.'}>
            <p>الإجابة الصحيحة: <W>{item.answer}</W></p>
            <ul className="spell5-option-reasons">{item.options.map((option) => <li key={option.value} className={option.value === item.answer ? 'is-correct' : 'is-wrong'}>
              <W>{option.value}</W>{option.value === value && <span className="spell5-chosen"> (اختيارك)</span>}: {option.explanation}
            </li>)}</ul>
            <p className="spell5-muted"><strong>القاعدة:</strong> {item.rule}</p>
          </Feedback>}
        </fieldset>
      })}
    </div>
    {revealed && <p className="spell5-result" role="status" data-testid="spell5-practice-score">نتيجتك: <bdi>{C.arabicDigits(score)} / {C.arabicDigits(C.practiceQuestions.length)}</bdi></p>}
    <div className="spell5-actions">
      <button type="button" className="button button--primary" onClick={() => setRevealed(true)}>{S.practice.control}</button>
      <button type="button" className="button button--ghost" onClick={() => { setAnswers({}); setRevealed(false) }}>إعادة التدريب</button>
    </div>
    <p className="spell5-muted">تغيير أي إجابة بعد التصحيح يخفي النتيجة حتى تضغط «{S.practice.control}» من جديد.</p>
  </div>
}

/* ---------------- الاختبار الختامي الأصلي ---------------- */
function OriginalFinalStep({ engine, revealed, onReveal, onReset }: { engine: TestEngine; revealed: boolean; onReveal: () => void; onReset: () => void }) {
  const page = C.originalFinalTest.pages[0]
  const score = originalFinalScore(engine.finalResult)
  return <div data-testid="spell5-original-final">
    <p>{S.finalExam.instruction}</p>
    <p className="spell5-muted">أسئلة المادة الأصلية الثمانية؛ الإجابات النموذجية من إعداد المنصة. أُضيفت للسؤال السادس خيارات محددة (<bdi>ت-٨</bdi>). الإجابات مخفية حتى تضغط «{S.finalExam.control}».</p>
    <CorrectionNote id="ت-٨" />
    <TestPageView page={page} engine={engine} questionTestIdPrefix="spell5-original" revealFeedback={revealed} />
    <div className="spell5-actions">
      <button type="button" className="button button--primary" onClick={onReveal}>{S.finalExam.control}</button>
      <button type="button" className="button button--ghost" onClick={onReset}>إعادة الاختبار الختامي</button>
    </div>
    {revealed && <>
      <div className="spell5-result" role="status" data-testid="spell5-original-result">
        <h3>نتيجة الاختبار الختامي</h3>
        <p className="spell5-score"><bdi>{C.arabicDigits(score.correct)} / {C.arabicDigits(score.auto)}</bdi></p>
        <p>السؤال الثامن يتضمن جزءًا تفسيريًا يُراجع مع المعلم؛ قارن تعليلك بالإجابة النموذجية أدناه.</p>
      </div>
      <SolutionsArea test={C.originalFinalTest} engine={engine} testId="spell5-original-solutions" revealFeedback={revealed} title="الإجابات النموذجية للاختبار الختامي" />
    </>}
  </div>
}

/* ---------------- الخلاصة والواجب ---------------- */
function SummaryStep({ onJump }: { onJump: (stepId: string) => void }) {
  const [open, setOpen] = useKeptState<Record<string, boolean>>('summary:open', {})
  return <>
    <div className="spell5-memory" aria-label={S.summary.mapTitle}>
      <p className="spell5-memory__core"><span>{S.summary.mapTitle}</span><span className="spell5-memory__glyphs"><Glyph shape="ا" /> <Glyph shape="ى" /></span></p>
      <div className="spell5-memory__branches">
        {S.summary.branches.map((branch) => {
          const more = C.summaryExpanded[branch.id]
          const isOpen = open[branch.id] ?? false
          return <article key={branch.id} className={`spell5-memory__branch spell5-memory__branch--${branch.id}`} data-testid={`spell5-summary-${branch.id}`}>
            <h3>{branch.title}</h3>
            <p>{branch.rule}</p>
            {branch.example && <p className="spell5-muted"><W>{branch.example}</W></p>}
            <button type="button" className="spell5-expand" aria-expanded={isOpen} aria-controls={`spell5-more-${branch.id}`} onClick={() => setOpen((c) => ({ ...c, [branch.id]: !isOpen }))}>الشرح الموسّع</button>
            <div id={`spell5-more-${branch.id}`} hidden={!isOpen} className="spell5-memory__more">
              <p><strong>لماذا؟</strong> {more.why}</p>
              <List items={more.steps} ordered />
              <p className="spell5-muted"><strong>انتبه:</strong> {more.caution}</p>
              <nav className="spell5-backlinks" aria-label={`العودة إلى شرح: ${branch.title}`}>
                <p className="spell5-backlink">العودة إلى الشرح:</p>
                <ul role="list">
                  {summaryBackLinks[branch.id].map((link) => <li key={link.stepId}>
                    <button type="button" className="spell5-backlink__button" data-testid={`spell5-backlink-${link.stepId}`} onClick={() => onJump(link.stepId)}>
                      <span aria-hidden="true">↩</span> {link.title}
                    </button>
                  </li>)}
                </ul>
              </nav>
            </div>
          </article>
        })}
      </div>
    </div>
    <Clarification><p>مسار التفكير في كل كلمة جديدة: النوع ← العدد ← القاعدة ← الدليل. والقاعدة في غير الثلاثي «عامة» لا مطلقة؛ استثناءاتها في خطوة «{T.nounsMulti}».</p></Clarification>
  </>
}
function HomeworkStep() {
  return <>
    <p>{S.homework.lead}</p>
    <ol className="spell5-homework">
      {S.homework.tasks.map((task, index) => <li key={task}><p>{task}</p><p className="spell5-muted"><strong>ما المطلوب لإتقانها:</strong> {C.homeworkCriteria[index]}</p></li>)}
    </ol>
    <section className="spell5-rulebox"><p>{S.homework.mastery}</p></section>
    <h3>سلّم الإتقان (توضيح من المنصة)</h3>
    <ScrollTable label="سلّم الإتقان — قابل للتمرير">
      <table className="spell5-table" data-testid="spell5-table-rubric">
        <thead><tr><th scope="col">المستوى</th><th scope="col">الوصف</th></tr></thead>
        <tbody>{C.masteryRubric.map((row) => <tr key={row.level}><th scope="row">{row.level}</th><td>{row.desc}</td></tr>)}</tbody>
      </table>
    </ScrollTable>
    <CorrectionNote id="ت-٩" />
    <Clarification><p>{C.clarifications.nextLesson}</p></Clarification>
  </>
}

/* ---------------- الاختبار المستقل ---------------- */
function SubmitStep({ engine, submitted, onSubmit, onReset }: { engine: TestEngine; submitted: boolean; onSubmit: () => void; onReset: () => void }) {
  const questions = testDefinition.pages.flatMap((page) => page.questions)
  const result = engine.finalResult
  return <section className="spell5-submit" aria-label="تسليم الاختبار والنتيجة" data-testid="spell5-submit">
    <p>أجبت عن <bdi>{C.arabicDigits(answeredCount(questions, engine.answers))}</bdi> من <bdi>{C.arabicDigits(TEST_TOTALS.questions)}</bdi> سؤالًا.</p>
    {!submitted ? <>
      <p>التحقق من الصفحات يحفظ الإجابات دون كشف. الأسئلة غير المجابة تُحتسب «لم تُجب». لا تُعرض الدرجة ولا الحلول حتى تضغط الزر التالي.</p>
      <button type="button" className="button button--primary" onClick={onSubmit}>تسليم الاختبار وإظهار النتيجة</button>
    </> : <div role="status" className="spell5-result" data-testid="spell5-final-result">
      <h3>النتيجة النهائية</h3>
      <p className="spell5-score"><bdi>{C.arabicDigits(result.correct)} / {C.arabicDigits(TEST_TOTALS.total)}</bdi></p>
      <p>إجابات صحيحة: <bdi>{C.arabicDigits(result.correct)}</bdi> · غير صحيحة: <bdi>{C.arabicDigits(result.wrong)}</bdi> · لم تُجب: <bdi>{C.arabicDigits(result.unanswered)}</bdi></p>
      <ul className="spell5-list">{Object.entries(result.byGroup).map(([group, value]) => <li key={group}>{group}: <bdi>{C.arabicDigits(value.correct)} / {C.arabicDigits(value.total)}</bdi></li>)}</ul>
      <p>افتح خطوة «حلول الاختبار» للتفسير الكامل لكل سؤال.</p>
    </div>}
    <div className="spell5-actions"><button type="button" className="button button--ghost" onClick={onReset}>إعادة الاختبار</button></div>
    <p className="spell5-muted">إعادة الاختبار تمسح الإجابات والنتائج وتعيد قفل الحلول. تعديل أي إجابة بعد التسليم يلغي التسليم حتى تسلّم من جديد.</p>
  </section>
}

/* ---------------- منطقة المعلم ---------------- */
function TeacherSection({ title, children }: { title: string; children: ReactNode }) {
  return <details className="spell5-teacher-section"><summary>{title}</summary><div>{children}</div></details>
}
function TeacherArea() {
  return <TeacherSpace>
    <div className="spell5-teacher" data-testid="spell5-teacher-material">
      <h3>دليل المعلّم — الألف اللينة في آخر الكلمة</h3>
      <p className="spell5-eyebrow">توضيح تعليمي من المنصة · كل المفاتيح والحلول من إعداد المنصة؛ النص الأصلي بلا مفتاح إجابات</p>
      <TeacherSection title="١. الأهداف وخطة الحصة">
        <List items={C.objectives} />
        <List ordered items={[
          'تمهيد بالتوقّع (٥ دقائق): بطاقات عصا/فتى/دعا/رمى، ولا يُكشف الشكل قبل أن يتوقّع كل طالب.',
          'التعريف والتمييز (١٠ دقائق): الألف اللينة، والفرق بين ى وي بالنطق وقبول الحركة.',
          'الأسماء ثم الأفعال (٢٠ دقيقة): العدّ أولًا، ثم الأصل للثلاثي، ثم القاعدة العامة واستثناؤها.',
          'الحروف (٥ دقائق): القاعدة المختصرة والمستثنيات.',
          'خريطة القرار والأخطاء (١٠ دقائق)، ثم التدريب والاختبار.',
        ]} />
      </TeacherSection>
      <TeacherSection title="٢. القواعد والتصحيحات العلمية">
        {C.teacherTopics.map((topic) => <article key={topic.heading}><h4>{topic.heading}</h4><p>{topic.explanation}</p></article>)}
        <ScrollTable label="جدول التصحيحات — نسخة المعلم">
          <table className="spell5-table" data-testid="spell5-table-teacher-corrections">
            <thead><tr><th scope="col">الرقم</th><th scope="col">الموضع</th><th scope="col">التصحيح</th><th scope="col">السبب</th></tr></thead>
            <tbody>{C.corrections.map((c) => <tr key={c.id}><th scope="row"><bdi>{c.id}</bdi></th><td>{c.where}</td><td>{c.corrected}</td><td>{c.reason}</td></tr>)}</tbody>
          </table>
        </ScrollTable>
      </TeacherSection>
      <TeacherSection title="٣. مفتاح التدريب السباعي">
        <ol className="spell5-list">{C.practiceQuestions.map((item) => <li key={item.id} data-testid={`spell5-teacher-${item.id}`}><strong>{item.prompt}</strong> — الإجابة: <W>{item.answer}</W>. {item.options.find((o) => o.value === item.answer)!.explanation} المشتتات: {item.options.filter((o) => o.value !== item.answer).map((o) => `«${o.value}»: ${o.explanation}`).join(' ')}</li>)}</ol>
      </TeacherSection>
      <TeacherSection title="٤. مفتاح الاختبار الختامي الأصلي (٨ أسئلة)">
        <SolutionsArea test={C.originalFinalTest} mode="teacher" title="الإجابات النموذجية للاختبار الختامي — نسخة المعلم" testId="spell5-teacher-original" />
      </TeacherSection>
      <TeacherSection title="٥. مفتاح اختبار الدرس (٢٠ سؤالًا)">
        <SolutionsArea test={testDefinition} mode="teacher" title="الحلول التفصيلية لاختبار الدرس الخامس" testId="spell5-teacher-test" />
      </TeacherSection>
      <TeacherSection title="٦. مفاتيح الأنشطة">
        <h4>{T.glyphLab}</h4><ul className="spell5-list">{C.glyphLab.map((i) => <li key={i.id}><W>{i.prompt}</W>: {i.answer} — {i.rule}</li>)}</ul>
        <h4>{T.nounLab}</h4><ul className="spell5-list">{C.nounOriginLab.map((i) => <li key={i.id}><W>{i.chain}</W></li>)}</ul>
        <h4>{T.nounSort}</h4><ul className="spell5-list">{C.nounSortLab.map((i) => <li key={i.id}><W>{i.full}</W>: {i.reason}. {i.explanation}</li>)}</ul>
        <h4>{T.verbLab}</h4><ul className="spell5-list">{C.verbPresentLab.map((i) => <li key={i.id}><W>{i.chain}</W></li>)}</ul>
        <h4>{T.particleLab}</h4><ul className="spell5-list">{C.particleLab.map((i) => <li key={i.id}><W>{i.word}{i.shape}</W> ({i.kind}): {i.explanation}</li>)}<li>{C.particleWhyItem.prompt} — {C.particleWhyItem.answer}</li></ul>
        <h4>{T.map}</h4><ul className="spell5-list">{C.treeWords.map((w) => <li key={w.id}><W>{w.word}</W>: {treePath(w).map((n) => nodeAnswer(w, n).answer).join(' ← ')}</li>)}</ul>
        <h4>{T.errorLab}</h4><ul className="spell5-list">{C.errorLab.filter((i) => !i.fromSource).map((i) => <li key={i.id}><W>{i.wrong}</W> ← <W>{i.answer}</W>: {i.rule}</li>)}</ul>
        <h4>{T.explainLab}</h4><ul className="spell5-list">{C.explainLab.map((i) => <li key={i.id}><W>{i.spellAnswer}</W>: {i.reasonAnswer}</li>)}</ul>
        <h4>{T.cumulative}</h4><ul className="spell5-list">{C.cumulativeLab.map((i) => <li key={i.id}><W>{i.answer}</W> ({i.rule})</li>)}</ul>
        <h4>التوقّع في التمهيد</h4><p>{C.prediction.answer}</p>
      </TeacherSection>
      <TeacherSection title="٧. الأخطاء المتوقعة والعلاج">
        <ScrollTable label="الأخطاء المتوقعة — نسخة المعلم">
          <table className="spell5-table" data-testid="spell5-table-teacher-errors">
            <thead><tr><th scope="col">الخطأ</th><th scope="col">سببه</th><th scope="col">العلاج</th></tr></thead>
            <tbody>{C.expectedErrors.map((e) => <tr key={e.error}><th scope="row">{e.error}</th><td>{e.cause}</td><td>{e.remedy}</td></tr>)}</tbody>
          </table>
        </ScrollTable>
      </TeacherSection>
      <TeacherSection title="٨. نموذج الواجب ومعيار الإتقان">
        <ol className="spell5-list">{C.homeworkModel.map((m) => <li key={m.task} data-testid={`spell5-teacher-homework-${m.task}`}><strong>{S.homework.tasks[m.task - 1]}</strong><List items={m.answer} /></li>)}</ol>
        <p>{S.homework.mastery}</p>
        <ul className="spell5-list">{C.masteryRubric.map((r) => <li key={r.level}><strong>{r.level}:</strong> {r.desc}</li>)}</ul>
      </TeacherSection>
      <TeacherSection title="٩. المصدر الخام وتقرير التدقيق">
        <ul className="spell5-list">
          <li><a href={sourceUrl} download="spelling-lesson-05.md"><bdi dir="ltr">{C.teacherReferences.source}</bdi> — تنزيل المصدر الخام</a></li>
          <li><a href={auditUrl} download="spelling-lesson-05-audit.md"><bdi dir="ltr">{C.teacherReferences.audit}</bdi> — تنزيل تقرير التدقيق</a></li>
        </ul>
        <p>لم يُنشأ درس سادس؛ وسطر «الدرس التالي» في المصدر غير معتمد (ت-٩).</p>
      </TeacherSection>
    </div>
  </TeacherSpace>
}

/* ---------------- المكوّن الرئيس ---------------- */
export function LessonSpellingFive({ onProgressChange, onFinish }: Props) {
  const flowRef = useRef<LessonFlowController | null>(null)
  const lessonMemory = useLessonMemoryStore()
  const testEngine = useTestEngine(testDefinition)
  const [testSubmitted, setTestSubmitted] = useState(false)
  const submitted = testSubmitted && testEngine.allPagesChecked
  const originalEngineBase = useTestEngine(C.originalFinalTest)
  const [originalRevealed, setOriginalRevealed] = useState(false)
  const glyphState = usePracticeState()
  const particleState = usePracticeState()
  const errorState = usePracticeState()
  const cumulativeState = usePracticeState()

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
  const originalEngine: TestEngine = {
    ...originalEngineBase,
    setAnswer(questionId, fieldIndex, value) { setOriginalRevealed(false); originalEngineBase.setAnswer(questionId, fieldIndex, value) },
    uncheckPage(pageId) { setOriginalRevealed(false); originalEngineBase.uncheckPage(pageId) },
    resetTest() { setOriginalRevealed(false); originalEngineBase.resetTest() },
  }
  function revealOriginal() {
    originalEngineBase.checkPage(C.originalFinalTest.pages[0].id)
    setOriginalRevealed(true)
  }

  const G = {
    intro: 'التمهيد والتمييز',
    nouns: 'الأسماء',
    verbs: 'الأفعال',
    particles: 'الحروف',
    apply: 'القرار والتطبيق',
    source: 'تدريب المادة واختبارها',
    wrap: 'الخلاصة والواجب',
    test: 'اختبار الدرس · ٢٠ سؤالًا',
    teacher: 'دليل المعلّم',
  }
  const steps: LessonStepDefinition[] = [
    step('intro', T.intro, G.intro, '◎', <IntroStep />),
    step('layyina', T.layyina, G.intro, '١', <LayyinaStep />),
    step('shapes', T.shapes, G.intro, '٢', <ShapesStep />),
    step('lab-glyphs', T.glyphLab, G.intro, '◈', <ChoiceLab testId="spell5-lab-glyphs" items={C.glyphLab} state={glyphState} intro={<p>صنّف الحرف الأخير في كل كلمة: ألف قائمة، أم ألف مقصورة، أم ياء حقيقية؟ احكم بالنطق وقبول الحركة لا بالنقط وحدها.</p>} />),
    step('nouns-tri', T.nounsTri, G.nouns, '٣', <NounsTriStep />),
    step('nouns-table', T.nounsTable, G.nouns, '▦', <NounsTableStep />),
    step('lab-noun-origin', T.nounLab, G.nouns, '◈', <StagedLab testId="spell5-lab-noun-origin" cases={C.nounOriginLab} intro={<p>لكل اسم ثلاثي: اختر الصيغة الكاشفة، ثم الحرف الذي ظهر فيها، ثم شكل الألف.</p>} />),
    step('nouns-multi', T.nounsMulti, G.nouns, '٤', <NounsMultiStep />),
    step('lab-noun-sort', T.nounSort, G.nouns, '◈', <NounSortLab />),
    step('verbs-tri', T.verbsTri, G.verbs, '٥', <VerbsTriStep />),
    step('lab-verb', T.verbLab, G.verbs, '◈', <StagedLab testId="spell5-lab-verb" cases={C.verbPresentLab} intro={<p>هات المضارع، ثم حدّد ما كشفه، ثم اكتب الماضي. انتبه إلى «سعى»: مضارعها لا يكشف شيئًا.</p>} />),
    step('verbs-multi', T.verbsMulti, G.verbs, '٦', <VerbsMultiStep />),
    step('particles', T.particles, G.particles, '٧', <ParticlesStep />),
    step('lab-particles', T.particleLab, G.particles, '◈', <ParticleLab state={particleState} />),
    step('map', T.map, G.apply, '٨', <DecisionStep />),
    step('mistakes', T.mistakes, G.apply, '٩', <MistakesStep />),
    step('lab-errors', T.errorLab, G.apply, '◈', <ErrorLab state={errorState} />),
    step('lab-explain', T.explainLab, G.apply, '◈', <ExplainLab />),
    step('cumulative', T.cumulative, G.apply, '◈', <ChoiceLab testId="spell5-lab-cumulative" items={C.cumulativeLab} state={cumulativeState} intro={<p>كلمات من كل فروع الدرس مختلطة. حدّد الفرع قبل أن تختار.</p>} />),
    step('practice', T.practice, G.source, '١٠', <PracticeStep />),
    step('original-final', T.original, G.source, '١١', <OriginalFinalStep engine={originalEngine} revealed={originalRevealed} onReveal={revealOriginal} onReset={originalEngine.resetTest} />),
    step('summary', T.summary, G.wrap, '١٢', <SummaryStep onJump={(stepId) => flowRef.current?.goToStep(`spell5-${stepId}`)} />),
    step('homework', T.homework, G.wrap, '١٣', <HomeworkStep />),
    ...testDefinition.pages.map((page) => step(`test-${page.id}`, page.title, G.test, '◇', <>
      <p className="spell5-muted">{testDefinition.description}</p>
      <TestPageView page={page} engine={guardedEngine} questionTestIdPrefix="spell5-question" revealFeedback={submitted} />
    </>)),
    step('submit', 'تسليم الاختبار والنتيجة', G.test, '✓',
      <SubmitStep engine={testEngine} submitted={submitted} onSubmit={submitTest} onReset={guardedEngine.resetTest} />),
    step('solutions', 'حلول الاختبار', G.test, '▤', <>
      {submitted
        ? <SolutionsArea test={testDefinition} engine={guardedEngine} testId="spell5-solutions" revealFeedback={submitted} />
        : <div className="spell5-locked" data-testid="spell5-solutions-locked"><h3>الحلول مقفلة حتى التسليم النهائي</h3><p>التحقق من الصفحات لا يكشف الحلول. افتح خطوة «تسليم الاختبار والنتيجة» وسلّم الاختبار أولًا.</p></div>}
    </>),
    step('teacher', 'منطقة خاصة بالمعلم', G.teacher, '◆', <TeacherArea />),
  ]

  return <LessonMemory.Provider value={lessonMemory}><div className="spell5-lesson">
    <LessonFlow steps={steps} controllerRef={flowRef} onProgressChange={onProgressChange} onFinish={onFinish}
      lessonTitle={C.lessonTitle} lessonNumber={C.lessonNumber} lessonEyebrow={C.lessonEyebrow} />
  </div></LessonMemory.Provider>
}

function step(id: string, title: string, group: string, icon: string, content: ReactNode): LessonStepDefinition {
  return { id: `spell5-${id}`, title, shortTitle: title, group, icon, render: () => content }
}
