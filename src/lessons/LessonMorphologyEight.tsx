import { useState, type ReactNode } from 'react'
import { LessonFlow, type LessonStepDefinition } from '../shared/components/LessonFlow'
import { EducationalCard } from '../shared/components/EducationalCard'
import { TeacherSpace } from '../shared/teacher/TeacherSpace'
import {
  SolutionsArea, TestPageView, answeredCount, useTestEngine,
  type TestDefinition, type TestEngine,
} from '../shared/test'
import * as C from './morphology-lesson-08/content'
import { TEST_TOTALS, earnedMarks, practiceStatus } from './morphology-lesson-08/grading'
import sourceUrl from '../../docs/source/morphology-lesson-08.md?url'
import auditUrl from '../../docs/morphology-lesson-08-audit.md?url'

// eslint-disable-next-line react-refresh/only-export-components -- lesson data consumed by the platform conformance suite.
export const testDefinition: TestDefinition = C.testDefinition
const S = C.sourceContent

interface Props {
  onProgressChange?: (value: number) => void
  onFinish?: () => void
}

/** Every addition is explicitly separate from the source text. */
function Clarification({ children }: { children: ReactNode }) {
  return <aside className="morph8-clarification"><strong>توضيح من المنصة</strong><div>{children}</div></aside>
}

function List({ items, ordered = false }: { items: readonly string[]; ordered?: boolean }) {
  const Tag = ordered ? 'ol' : 'ul'
  return <Tag className="morph8-list">{items.map((item) => <li key={item}>{item}</li>)}</Tag>
}

/** Spans never contain a detached mark or introduce whitespace into a verb. */
function Verb({ word, tense }: { word: string; tense?: C.Tense }) {
  const parts = tense ? C.verbParts(word, tense) : undefined
  return (
    <bdi className="morph8-verb" dir="rtl">
      {parts ? <><span className="morph8-verb__beginning">{parts.beginning}</span>{parts.middle}<span className="morph8-verb__ending">{parts.ending}</span></> : word}
    </bdi>
  )
}

function IntroStep() {
  return (
    <>
      <div className="morph8-hero">
        <p className="morph8-eyebrow">{S.header.section}</p>
        <h3>{S.header.title}</h3>
        <p>{S.header.intro}</p>
        <p className="morph8-eyebrow">توضيح من المنصة · مقارنة الأزمنة مع أنتَ</p>
        <div className="morph8-hero__forms" aria-label="من فعل واحد إلى ثلاث صور زمنية">
          <div><small>الماضي</small><Verb word="كَتَبْتَ" /></div>
          <div><small>المضارع</small><Verb word="تَكْتُبُ" /></div>
          <div><small>الأمر</small><Verb word="اُكْتُبْ" /></div>
        </div>
      </div>
      <Clarification>
        <p>مسارك: افهم الإسناد، استكشف الضمائر، قارن الأزمنة، ثم طبّق. التدريبات الأصلية للتعلّم، والاختبار مستقل عنها.</p>
        <div className="morph8-metrics">
          <span><bdi>١٢</bdi> ضميرًا شخصيًا</span>
          <span><bdi>٣</bdi> صيغ للفعل</span>
          <span><bdi>٦</bdi> مختبرات وأنشطة</span>
        </div>
      </Clarification>
      <EducationalCard title="ما الذي ستتقنه؟" eyebrow="توضيح من المنصة"><List items={C.objectives} /></EducationalCard>
    </>
  )
}

function ConjugationStep() {
  return <>
    <div className="morph8-definition"><p>{S.conjugation.definition}</p></div>
    <p>{S.conjugation.examplesTitle}</p>
    <List items={S.conjugation.examples} />
    <p>{S.conjugation.observation}</p><p>{S.conjugation.conclusion}</p>
  </>
}

function AssignmentStep() {
  return <>
    <div className="morph8-definition"><p>{S.assignment.definition}</p></div>
    <p>{S.assignment.examplesTitle}</p>
    <blockquote className="morph8-source-quote"><span className="morph8-eyebrow">نص المصدر</span><List items={S.assignment.examples} /></blockquote>
    <Clarification><p>{C.clarifications.taa}</p><p>{C.clarifications.subjects}</p></Clarification>
    <p>{S.assignment.warning}</p>
  </>
}

function ScrollTable({ label, children }: { label: string; children: ReactNode }) {
  return <div className="morph8-table-scroll" role="region" aria-label={label} tabIndex={0}>{children}</div>
}

function PronounTables() {
  return <div className="morph8-pronoun-tables">
    {S.pronouns.groups.map((group) => <ScrollTable key={group.id} label={group.title}>
      <table className="morph8-table" data-testid={`morph8-pronouns-${group.id}`}>
        <caption>{group.title}</caption>
        <thead><tr>{group.columns.map((column) => <th scope="col" key={column}>{column}</th>)}</tr></thead>
        <tbody>{group.rows.map((row) => <tr key={row.id}><th scope="row"><bdi className="morph8-word">{row.label}</bdi></th><td>{row.meaning}</td></tr>)}</tbody>
      </table>
    </ScrollTable>)}
  </div>
}

function PronounsStep() {
  return <><p>{S.pronouns.intro}</p><PronounTables /><p>{S.pronouns.conclusion}</p><Clarification><p>{C.clarifications.count}</p></Clarification></>
}

function ConjugationTable({ tense, context = 'student' }: { tense: C.Tense; context?: string }) {
  const section = S[tense]
  const rows = tense === 'imperative' ? C.imperativeRows : C.conjugations
  return <ScrollTable label={`${section.tableTitle} — قابل للتمرير`}>
    <table className="morph8-table morph8-table--conjugation" data-testid={`morph8-table-${context}-${tense}`}>
      <caption>{section.tableTitle}</caption>
      <thead><tr>{section.columns.map((column) => <th scope="col" key={column}>{column}</th>)}</tr></thead>
      <tbody>{rows.map((row) => <tr key={row.id}>
        <th scope="row"><bdi className="morph8-word">{row.label}</bdi></th>
        <td><Verb word={row[tense]!} /></td>
        <td>{row[`${tense}Example`]}</td>
      </tr>)}</tbody>
    </table>
  </ScrollTable>
}

function PastStep() {
  return <><p>{S.past.intro}</p><p>{S.past.start}</p><ConjugationTable tense="past" /><p>{S.past.note}</p><Clarification><p>{C.clarifications.count}</p></Clarification></>
}

function PastNotesStep() {
  return <>
    <List items={S.past.notes} />
    <div className="morph8-comparison" aria-label="حركات تاء الفاعل">
      {['ana', 'anta', 'anti'].map((id) => {
        const row = C.conjugationFor(id)
        return <article key={id}><bdi>{row.label}</bdi><Verb word={row.past} tense="past" /></article>
      })}
    </div>
    <p>{S.past.conclusion}</p><Clarification><p>{C.clarifications.taa}</p></Clarification>
  </>
}

function PresentStep() {
  return <><p>{S.present.intro}</p><ConjugationTable tense="present" /><Clarification><p>{C.clarifications.context}</p></Clarification></>
}

function PresentNotesStep() {
  return <>
    <p>{S.present.notesLead}</p><List items={S.present.notes} /><p>{S.present.conclusion}</p>
    <div className="morph8-comparison" aria-label="المخاطبة والمخاطبون والغائبون">
      {['anti', 'antum', 'hum'].map((id) => {
        const row = C.conjugationFor(id)
        return <article key={id}><bdi>{row.label}</bdi><Verb word={row.present} tense="present" /></article>
      })}
    </div>
    <Clarification><p>{C.clarifications.present}</p><p>{C.clarifications.noon}</p></Clarification>
  </>
}

function ImperativeStep() {
  return <>
    <p>{S.imperative.intro}</p><List items={S.imperative.examples} />
    <div className="morph8-definition"><p>{S.imperative.restriction}</p></div>
    <ConjugationTable tense="imperative" /><p>{S.imperative.conclusion}</p>
    <Clarification><p>{C.clarifications.imperative}</p></Clarification>
  </>
}

function TypeTable() {
  return <ScrollTable label="جدول الضمير المتصل والمنفصل">
    <table className="morph8-table" data-testid="morph8-types-table">
      <caption>أمثلة المصدر: الضمير المتصل والمنفصل</caption>
      <thead><tr>{S.types.columns.map((column) => <th scope="col" key={column}>{column}</th>)}</tr></thead>
      <tbody>{S.types.rows.map((row, index) => <tr key={index}><td>{row.example}</td><th scope="row">{row.pronoun}</th><td>{row.kind}</td></tr>)}</tbody>
    </table>
  </ScrollTable>
}

function PronounTypesStep() {
  return <>
    <p>{S.types.definition}</p><p>{S.types.connectedDefinition}</p><TypeTable />
    <div className="morph8-definition"><p>{S.types.warning}</p></div>
    <Clarification><p>{C.clarifications.subjects}</p><p>{C.clarifications.waw}</p></Clarification>
  </>
}

/* Teaching labs use native keyboard-accessible controls, not the final test data. */
function PronounLab({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  const row = C.conjugationFor(selected)
  const pronoun = C.pronouns.find((item) => item.id === row.pronounId)!
  return <div data-testid="morph8-lab-pronouns">
    <p className="morph8-eyebrow">توضيح من المنصة · استكشف دون درجات</p>
    <p>اختر بطاقة ضمير. راقب كيف يتغيّر الفعل في بطاقات الأزمنة، ثم جرّب ضميرًا آخر.</p>
    <div className="morph8-pronoun-picker">
      {S.pronouns.groups.map((group) => <fieldset key={group.id}>
        <legend>{group.title}</legend>
        <div className="morph8-chips">{group.rows.map((item) => <button type="button" key={item.id}
          aria-pressed={row.pronounId === item.id} onClick={() => onSelect(item.id === 'huma' ? 'huma-m' : item.id)}>
          <bdi>{item.label}</bdi>
        </button>)}</div>
      </fieldset>)}
    </div>
    {row.pronounId === 'huma' && <div className="morph8-chips" role="group" aria-label="استعمالا هما">
      <button type="button" aria-pressed={selected === 'huma-m'} onClick={() => onSelect('huma-m')}>هما (مذكر)</button>
      <button type="button" aria-pressed={selected === 'huma-f'} onClick={() => onSelect('huma-f')}>هما (مؤنث)</button>
    </div>}
    <div className="morph8-lab-result" aria-live="polite" aria-atomic="true" data-testid="morph8-pronoun-result">
      <p><strong>{row.label}</strong> — {pronoun.meaning}</p>
      <div className="morph8-comparison">
        <article><h3>الماضي</h3><Verb word={row.past} tense="past" /><p>{row.pastExample}</p></article>
        <article><h3>المضارع</h3><Verb word={row.present} tense="present" /><p>{row.presentExample}</p></article>
        <article><h3>الأمر</h3>{row.imperative ? <><Verb word={row.imperative} tense="imperative" /><p>{row.imperativeExample}</p></> : <p>الأمر هنا للمخاطب فقط؛ اختر ضميرًا من مجموعة المخاطب.</p>}</article>
      </div>
    </div>
    <Clarification><p>{C.clarifications.highlight}</p><p>{C.clarifications.count}</p></Clarification>
  </div>
}

function usePracticeState() {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [revealed, setRevealed] = useState(false)
  return {
    answers, checked, revealed,
    pick(id: string, value: string) {
      setAnswers((current) => ({ ...current, [id]: value }))
      setChecked((current) => ({ ...current, [id]: false }))
    },
    check(id: string) { setChecked((current) => ({ ...current, [id]: true })) },
    reveal() { setRevealed(true) },
    reset() { setAnswers({}); setChecked({}); setRevealed(false) },
  }
}
type PracticeState = ReturnType<typeof usePracticeState>

function TrainingExplanation({ solution }: { solution: C.TrainingSolution }) {
  return <><List items={solution.steps} ordered /><h4>لماذا لا نختار المشتتات؟</h4><List items={solution.distractors} /></>
}

function PracticeCard({ item, state, number, trainingSolution }: {
  item: C.PracticeItem; state: PracticeState; number: number; trainingSolution?: C.TrainingSolution
}) {
  const value = state.answers[item.id]
  const checked = state.checked[item.id] || state.revealed
  const status = practiceStatus(item, value)
  return <fieldset className="morph8-practice-card" data-testid={`morph8-practice-${item.id}`}>
    <legend><span className="morph8-number"><bdi>{C.arabicDigits(number)}</bdi></span> {item.prompt}</legend>
    {trainingSolution ? <div className="morph8-radio-options">
      {item.options.map((option) => <label key={option}><input type="radio" name={`morph8-${item.id}`} value={option}
        checked={value === option} onChange={() => state.pick(item.id, option)} /><Verb word={option} /></label>)}
    </div> : <label className="morph8-select-label">
      <span>اختيارك</span>
      <select aria-label={item.prompt} value={value ?? ''} onChange={(event) => state.pick(item.id, event.target.value)}>
        <option value="">اختر…</option>{item.options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>}
    <button type="button" className="button button--secondary" disabled={!value} onClick={() => state.check(item.id)}>تحقق من الإجابة</button>
    {checked && <div className={`morph8-feedback morph8-feedback--${status}`} role="status">
      <strong>{status === 'correct' ? 'إجابة صحيحة.' : status === 'wrong' ? 'تحتاج الإجابة إلى مراجعة.' : 'لم تختر إجابة بعد.'}</strong>
      <p>الإجابة الصحيحة: <bdi>{item.answer}</bdi></p>
      <span className="morph8-eyebrow">توضيح من المنصة</span>
      {trainingSolution ? <TrainingExplanation solution={trainingSolution} /> : <p>{item.explanation}</p>}
    </div>}
  </fieldset>
}

function PracticeLab({ lab, state }: { lab: C.PracticeLab; state: PracticeState }) {
  return <div data-testid={`morph8-lab-${lab.id}`}>
    <p className="morph8-eyebrow">توضيح من المنصة · نشاط تعليمي، لا اختبار</p>
    <p>{lab.instruction}</p>
    <div className="morph8-practice-grid">{lab.items.map((item, index) => <PracticeCard key={item.id} item={item} state={state} number={index + 1} />)}</div>
    <button type="button" className="button button--ghost" onClick={state.reset}>إعادة النشاط</button>
  </div>
}

function ImperativeLab({ pronounId, onPronoun, state }: { pronounId: string; onPronoun: (id: string) => void; state: PracticeState }) {
  const row = C.conjugationFor(pronounId)
  const value = state.answers[pronounId]
  const checked = state.checked[pronounId] ?? false
  const word = value ? `اُكْتُ${value}` : ''
  const status = practiceStatus({ answer: row.imperative! }, word)
  return <div data-testid="morph8-lab-imperative">
    <p className="morph8-eyebrow">توضيح من المنصة · كوّن ثم تحقّق</p>
    <p>اختر مخاطبًا ثم أكمل آخر الكلمة ابتداءً من الباء. نُبقي حركة الباء معها؛ لا نسحب حركة منفردة.</p>
    <div className="morph8-chips" role="group" aria-label="ضمير المخاطب في مختبر الأمر">
      {C.imperativeRows.map((item) => <button type="button" key={item.id} aria-pressed={pronounId === item.id} onClick={() => onPronoun(item.id)}>{item.label}</button>)}
    </div>
    <fieldset className="morph8-practice-card">
      <legend>كوّن الأمر مع <bdi>{row.label}</bdi></legend>
      <div className="morph8-radio-options">
        {C.imperativeEndings.map((ending) => <label key={ending}><input type="radio" name="morph8-imperative-ending" value={ending}
          checked={value === ending} onChange={() => state.pick(pronounId, ending)} /><bdi className="morph8-word">{ending}</bdi></label>)}
      </div>
      <div className="morph8-build-preview" aria-live="polite"><span>الكلمة التي كوّنتها</span>{word ? <Verb word={word} tense="imperative" /> : <span>اختر نهاية لتظهر محاولتك.</span>}</div>
      <button type="button" className="button button--secondary" disabled={!value} onClick={() => state.check(pronounId)}>تحقق من التكوين</button>
      {checked && <div className={`morph8-feedback morph8-feedback--${status}`} role="status">
        <strong>{status === 'correct' ? 'تكوين صحيح.' : 'راجع نهاية الأمر.'}</strong>
        <p><bdi>{row.label}</bdi>: <Verb word={row.imperative!} /> — {row.imperativeExample}</p>
        <p>{C.clarifications.imperative}</p>
      </div>}
    </fieldset>
    <button type="button" className="button button--ghost" onClick={state.reset}>إعادة النشاط</button>
  </div>
}

function TrainingStep({ groupIndex, state }: { groupIndex: 0 | 1; state: PracticeState }) {
  const group = S.trainings.groups[groupIndex]
  return <div data-testid={`morph8-training-${group.id}`}>
    {groupIndex === 0 && <><h3>{S.trainings.heading}</h3><p>{S.trainings.intro}</p></>}
    <p className="morph8-muted">تدريبات المصدر التعليمية؛ لا تدخل في درجة اختبار نهاية الدرس.</p>
    <div className="morph8-practice-grid">{group.items.map((item) => {
      const solution = C.trainingSolutions[item.number]
      return <PracticeCard key={item.id} item={{ ...item, answer: solution.answer, explanation: solution.steps.join(' ') }}
        number={item.number} trainingSolution={solution} state={state} />
    })}</div>
    <div className="morph8-actions">
      <button type="button" className="button button--primary" onClick={state.reveal}>{C.trainingControls.reveal}</button>
      <button type="button" className="button button--ghost" onClick={state.reset}>{C.trainingControls.reset}</button>
    </div>
    <p className="morph8-muted">الزر الأول يكشف تصحيح التدريبين، والثاني يمسح محاولاتهما ويعيد إخفاء التصحيح. لا يؤثران في الاختبار.</p>
  </div>
}

function SubmitStep({ engine, submitted, onSubmit, onReset }: {
  engine: TestEngine; submitted: boolean; onSubmit: () => void; onReset: () => void
}) {
  const questions = testDefinition.pages.flatMap((page) => page.questions)
  const result = engine.finalResult
  return <section className="morph8-submit" aria-label="تسليم الاختبار والنتيجة" data-testid="morph8-submit">
    <p>أجبت عن <bdi>{C.arabicDigits(answeredCount(questions, engine.answers))}</bdi> من <bdi>{C.arabicDigits(TEST_TOTALS.questions)}</bdi> سؤالًا.</p>
    {!submitted ? <>
      <p>التحقق من الصفحات يحفظ الإجابات دون كشف. يمكنك مراجعتها قبل التسليم؛ الأسئلة غير المجابة تُحتسب «لم تُجب». لا تُعرض الدرجة أو الحلول حتى تضغط الزر التالي.</p>
      <button type="button" className="button button--primary" onClick={onSubmit}>تسليم الاختبار وإظهار النتيجة</button>
    </> : <div role="status" className="morph8-result" data-testid="morph8-final-result">
      <h3>النتيجة النهائية</h3><p className="morph8-score"><bdi>{C.arabicDigits(earnedMarks(result))} / {C.arabicDigits(TEST_TOTALS.total)}</bdi></p>
      <p>إجابات صحيحة: <bdi>{C.arabicDigits(result.correct)}</bdi> · غير صحيحة: <bdi>{C.arabicDigits(result.wrong)}</bdi> · لم تُجب: <bdi>{C.arabicDigits(result.unanswered)}</bdi></p>
      <p>افتح خطوة «حلول الاختبار» للتفسير الكامل، أو عُد إلى صفحات الأسئلة لمراجعة التصحيح.</p>
    </div>}
    <div className="morph8-actions"><button type="button" className="button button--ghost" onClick={onReset}>إعادة الاختبار</button></div>
    <p className="morph8-muted">إعادة الاختبار تمسح إجاباته ونتائجه وتعيد قفل الحلول. تعديل أي إجابة بعد التسليم يستلزم تسليم المحاولة المعدّلة من جديد.</p>
  </section>
}

function TeacherSection({ title, children }: { title: string; children: ReactNode }) {
  return <details className="morph8-teacher-section"><summary>{title}</summary><div>{children}</div></details>
}

function TeacherArea() {
  return <TeacherSpace>
    <div className="morph8-teacher" data-testid="morph8-teacher-material">
      <h3>دليل المعلّم — تصريف الأفعال والإسناد إلى الضمائر</h3>
      <p className="morph8-eyebrow">توضيح من المنصة · شروح ومفاتيح تعليمية</p>
      <TeacherSection title="١. شرح محاور الدرس وأهدافه">
        <List items={C.objectives} />
        {C.teacherTopics.map((topic) => <article key={topic.heading}><h4>{topic.heading}</h4><p>{topic.explanation}</p></article>)}
      </TeacherSection>
      <TeacherSection title="٢. الضمائر وجداول التصريف الكاملة">
        <PronounTables /><p>{C.clarifications.count}</p>
        <ConjugationTable tense="past" context="teacher" /><ConjugationTable tense="present" context="teacher" /><ConjugationTable tense="imperative" context="teacher" />
      </TeacherSection>
      <TeacherSection title="٣. الفروق بين الصور المتشابهة">
        <p>{C.clarifications.context}</p><p>{C.clarifications.present}</p><p>{C.clarifications.noon}</p><p>{C.clarifications.waw}</p>
        <p>في الماضي قارن كَتَبْتُ/كَتَبْتَ/كَتَبْتِ، وقارن كَتَبْنَا/كَتَبْنَ، ثم كَتَبَا/كَتَبَتَا. في كل مرة اطلب الضمير قبل طلب الصورة.</p>
      </TeacherSection>
      <TeacherSection title="٤. تنبيه مستقل: تاء الفاعل وتاء التأنيث الساكنة">
        <blockquote className="morph8-source-quote"><span className="morph8-eyebrow">عبارة المصدر في ثانيًا</span><p>{S.assignment.examples[2]}</p></blockquote>
        <Clarification><p>{C.clarifications.taa}</p><p>{C.clarifications.subjects}</p></Clarification>
        <p>{S.types.warning}</p>
        <p>في «هي كَتَبَتْ الدرسَ» هي مبتدأ، وفاعل الجملة الفعلية ضمير مستتر يعود عليها. وفي كَتَبَتَا التاء حرف تأنيث وألف الاثنين ضمير الفاعل.</p>
      </TeacherSection>
      <TeacherSection title="٥. حلول التدريبات الأصلية الثمانية خطوة بخطوة">
        <p>هذه مفاتيح مستنبطة وشروح من المنصة؛ لا يحتوي النص الخام على مفتاح حلول منفصل.</p>
        {S.trainings.groups.map((group) => <section key={group.id}><h4>{group.heading}</h4>
          {group.items.map((item) => <article key={item.id} className="morph8-teacher-answer" data-testid={`morph8-teacher-${item.id}`}>
            <h4><bdi>{C.arabicDigits(item.number)}</bdi>. {item.prompt}</h4>
            <p>الخيارات بالترتيب: {item.options.join(' / ')}</p>
            <p>الإجابة: <Verb word={C.trainingSolutions[item.number].answer} /></p>
            <TrainingExplanation solution={C.trainingSolutions[item.number]} />
          </article>)}
        </section>)}
      </TeacherSection>
      <TeacherSection title="٦. مفاتيح المختبرات وطريقة التدريس">
        <p>مختبر الضمائر والأمر يعتمد جداول التصريف نفسها أعلاه. يختار الطالب ضميرًا؛ لا نركّب له أمرًا خارج المخاطب. {C.clarifications.highlight}</p>
        {C.practiceLabs.map((lab) => <section key={lab.id}><h4>{lab.title}</h4><ul className="morph8-list">{lab.items.map((item) => <li key={item.id}><strong>{item.prompt}: {item.answer}.</strong> {item.explanation}</li>)}</ul></section>)}
      </TeacherSection>
      <TeacherSection title="٧. مفاتيح الاختبار العشرين والحلول المفصّلة">
        <SolutionsArea test={testDefinition} mode="teacher" title="الحلول التفصيلية لاختبار الدرس الثامن" />
      </TeacherSection>
      <TeacherSection title="٨. المصدر الخام وتقرير التدقيق">
        <p>{C.teacherReferences.note}</p>
        <ul className="morph8-list"><li><a href={sourceUrl} download="morphology-lesson-08.md"><bdi dir="ltr">{C.teacherReferences.source}</bdi> — تنزيل المصدر الخام</a></li>
          <li><a href={auditUrl} download="morphology-lesson-08-audit.md"><bdi dir="ltr">{C.teacherReferences.audit}</bdi> — تنزيل تقرير التدقيق</a></li></ul>
        <p>الدرس التاسع انتقال نصي فقط. لم يُنشأ درس تاسع أو اختبار وحدة؛ لا يُعلن اكتمال الوحدة.</p>
      </TeacherSection>
    </div>
  </TeacherSpace>
}

export function LessonMorphologyEight({ onProgressChange, onFinish }: Props) {
  // All state lives above the one-mounted-step flow, including source practices.
  const testEngine = useTestEngine(testDefinition)
  const [testSubmitted, setTestSubmitted] = useState(false)
  const submitted = testSubmitted && testEngine.allPagesChecked
  const trainingState = usePracticeState()
  const pastState = usePracticeState()
  const presentState = usePracticeState()
  const typeState = usePracticeState()
  const progressiveState = usePracticeState()
  const imperativeState = usePracticeState()
  const [selectedPronoun, setSelectedPronoun] = useState('ana')
  const [imperativePronoun, setImperativePronoun] = useState('anta')

  // Editing invalidates the submission as well as the page result. A later page
  // check must not reopen an old submission. No grading logic is reimplemented.
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
    step('conjugation', S.conjugation.heading, 'مدخل الدرس', '١', <ConjugationStep />),
    step('assignment', S.assignment.heading, 'مدخل الدرس', '٢', <AssignmentStep />),
    step('pronouns', S.pronouns.heading, 'خريطة الضمائر', '٣', <PronounsStep />),
    step('lab-pronouns', 'مختبر الضمائر: ضمير واحد، صور متعددة', 'خريطة الضمائر', '◈', <PronounLab selected={selectedPronoun} onSelect={setSelectedPronoun} />),
    step('past', S.past.heading, 'الماضي', '٤', <PastStep />),
    step('past-notes', S.past.notesTitle, 'الماضي', '◌', <PastNotesStep />),
    step('lab-past', C.pastLab.title, 'الماضي', '◈', <PracticeLab lab={C.pastLab} state={pastState} />),
    step('present', S.present.heading, 'المضارع', '٥', <PresentStep />),
    step('present-notes', S.present.notesTitle, 'المضارع', '◌', <PresentNotesStep />),
    step('lab-present', C.presentLab.title, 'المضارع', '◈', <PracticeLab lab={C.presentLab} state={presentState} />),
    step('imperative', S.imperative.heading, 'الأمر', '٦', <ImperativeStep />),
    step('lab-imperative', 'مختبر الأمر: كوّن الفعل للمخاطب', 'الأمر', '◈', <ImperativeLab pronounId={imperativePronoun} onPronoun={setImperativePronoun} state={imperativeState} />),
    step('pronoun-types', S.types.heading, 'الضمير والفاعل', '٧', <PronounTypesStep />),
    step('lab-types', C.typeLab.title, 'الضمير والفاعل', '◈', <PracticeLab lab={C.typeLab} state={typeState} />),
    step('lab-progressive', C.progressiveLab.title, 'الضمير والفاعل', '◈', <PracticeLab lab={C.progressiveLab} state={progressiveState} />),
    step('training-one', S.trainings.groups[0].heading, 'تدريبات المصدر', '٨', <TrainingStep groupIndex={0} state={trainingState} />),
    step('training-two', S.trainings.groups[1].heading, 'تدريبات المصدر', '٨', <TrainingStep groupIndex={1} state={trainingState} />),
    step('summary', S.summary.heading, 'الخلاصة والانتقال', '٩', <List items={S.summary.points} ordered />),
    step('next-lesson', 'انتقال نصي: الدرس التاسع', 'الخلاصة والانتقال', '←', <><p className="morph8-transition">{S.nextLesson}</p><Clarification><p>هذا تمهيد نصي فقط؛ لا درس تاسع مسجّل ولا اختبار وحدة، والوحدة لم يُعلن اكتمالها.</p></Clarification></>),
    ...testDefinition.pages.map((page) => step(`test-${page.id}`, page.title, 'اختبار الدرس · ٢٠ درجة', '◇', <>
      <p className="morph8-muted">{testDefinition.description}</p>
      <TestPageView page={page} engine={guardedEngine} questionTestIdPrefix="morph8-question" revealFeedback={submitted} />
    </>)),
    step('submit', 'تسليم الاختبار والنتيجة', 'اختبار الدرس · ٢٠ درجة', '✓', <SubmitStep engine={testEngine} submitted={submitted} onSubmit={submitTest} onReset={guardedEngine.resetTest} />),
    step('solutions', 'حلول الاختبار', 'اختبار الدرس · ٢٠ درجة', '▤', <>
      {submitted ? <SolutionsArea test={testDefinition} engine={guardedEngine} testId="morph8-solutions" revealFeedback={submitted} /> :
        <div className="morph8-locked" data-testid="morph8-solutions-locked"><h3>الحلول مقفلة حتى التسليم النهائي</h3><p>التحقق من الصفحات لا يكشف الحلول. افتح خطوة «تسليم الاختبار والنتيجة» وسلّم الاختبار كاملًا أولًا.</p></div>}
    </>),
    step('teacher', 'منطقة خاصة بالمعلم', 'دليل المعلّم', '◆', <TeacherArea />),
  ]

  return <div className="morph8-lesson">
    <LessonFlow steps={steps} onProgressChange={onProgressChange} onFinish={onFinish}
      lessonTitle={S.header.title} lessonNumber="٨" lessonEyebrow="القسم الثاني: الصرف" />
  </div>
}

function step(id: string, title: string, group: string, icon: string, content: ReactNode): LessonStepDefinition {
  return { id: `morph8-${id}`, title, shortTitle: title, group, icon, render: () => content }
}
