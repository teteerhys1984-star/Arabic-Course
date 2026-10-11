import { useState, type ReactNode } from 'react'
import { LessonFlow, type LessonStepDefinition } from '../shared/components/LessonFlow'
import { TeacherSpace } from '../shared/teacher/TeacherSpace'
import { COURSE_TEACHER_PASSWORD } from '../shared/teacher/teacherPassword'
import * as C from './morphology-lesson-07/content'
import {
  SolutionsArea,
  TestPageView,
  answeredCount,
  useTestEngine,
  type TestDefinition,
  type TestEngine,
} from '../shared/test'

/* ================================================================== *
 * اختبار الدرس — shared platform test framework (src/shared/test).
 * الصفحات الأربع تُعرض كخطوات مستقلة، ولكل صفحة زر «تحقّق من الإجابات».
 * لا تُكشف الصحة ولا الحلول ولا الدرجة إلا بعد تسليم الاختبار كاملًا.
 * ================================================================== */

/** The lesson's test, declared once in the shared platform schema. */
// eslint-disable-next-line react-refresh/only-export-components -- the test schema is lesson data, not a component.
export const testDefinition: TestDefinition = C.testDefinition

interface Props {
  onProgressChange?: (value: number) => void
  onFinish?: () => void
}

/* ================================================================== *
 * عناصر بصرية وتعليمية مشتركة داخل الدرس
 * الكلمات والأصول معزولة بوسم اتجاه (bdi) لئلا ينقلب التشكيل في سياق RTL.
 * ================================================================== */

function Callout({ children, title = 'ملاحظة مهمة' }: { children: ReactNode; title?: string }) {
  return (
    <aside className="morph7-callout">
      <strong>{title}</strong>
      <div>{children}</div>
    </aside>
  )
}

/** توضيح من إضافة المنصة (ت-1…ت-12) — لا يُنسب إلى نص المصدر. */
function Clarification({ children }: { children: ReactNode }) {
  return (
    <aside className="morph7-clarification">
      <span className="morph7-clarification__badge">توضيح تعليمي من المنصة</span>
      <div>{children}</div>
    </aside>
  )
}

function Bullets({ items }: { items: readonly string[] }) {
  return (
    <ul className="morph7-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

function Feedback({ ok, children, testId }: { ok: boolean; children: ReactNode; testId?: string }) {
  return (
    <div
      className={ok ? 'morph7-feedback morph7-feedback--ok' : 'morph7-feedback morph7-feedback--no'}
      role="status"
      data-testid={testId}
    >
      {children}
    </div>
  )
}

/** كلمة مشكولة معزولة الاتجاه. */
function WordChip({ children, muall = false }: { children: ReactNode; muall?: boolean }) {
  return (
    <bdi className={muall ? 'morph7-word morph7-word--muall' : 'morph7-word'} dir="rtl">
      {children}
    </bdi>
  )
}

/** أصل الحروف (حروف منفصلة بلا تشكيل — حدود الضبط المعتمدة). */
function RootChip({ roots }: { roots: string }) {
  return (
    <bdi className="morph7-root" dir="rtl">
      {roots}
    </bdi>
  )
}

function KindTag({ kind }: { kind: string }) {
  const muall = kind.includes('معتل') || ['مثال', 'أجوف', 'ناقص', 'لفيف مقرون', 'لفيف مفروق'].includes(kind)
  return <span className={muall ? 'morph7-chip morph7-chip--muall' : 'morph7-chip'}>{kind}</span>
}

/** بطاقة فعل مفرد (كلمة + وسم نوع). */
function VerbCard({ word, type, lines, muall }: { word: string; type?: string; lines: readonly string[]; muall?: boolean }) {
  return (
    <article className={muall ? 'morph7-card morph7-card--muall' : 'morph7-card'}>
      <p className="morph7-item__title">
        <WordChip muall={muall}>{word}</WordChip>
        {type && <KindTag kind={type} />}
      </p>
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </article>
  )
}

/* ================================================================== *
 * التمهيد والأهداف والمراجعة
 * ================================================================== */

function IntroStep() {
  const H = C.lessonHeader
  return (
    <>
      <div className="morph7-hero">
        <span>{H.section}</span>
        {H.heroChips.map((chip) => (
          <span key={chip}>{chip}</span>
        ))}
        <span>
          اختبار من <bdi>{C.arabicDigits(20)}</bdi> سؤالًا
        </span>
      </div>
      <p className="morph7-big">{H.title}</p>
      <p>{H.intro}</p>
      <Callout title="لماذا يهمّك هذا الدرس؟">
        <p>{H.whyItMatters}</p>
      </Callout>
    </>
  )
}

function GoalsStep() {
  return (
    <>
      <h4>أهداف الدرس</h4>
      <p>بعد دراسة هذا الدرس دراسة متقنة، يُفترض أن يكون الطالب قادرًا على:</p>
      <ol className="morph7-list" data-testid="morph7-goals">
        {C.objectives.map((goal) => (
          <li key={goal}>{goal}</li>
        ))}
      </ol>
    </>
  )
}

function ReviewStep() {
  const R = C.reviewSection
  return (
    <>
      <h4>{R.heading}</h4>
      <p>{R.lead}</p>
      <p className="morph7-big">
        <bdi>{R.lettersLine}</bdi>
      </p>
      <p>{R.examplesTitle}</p>
      <Bullets items={R.examples.map((example) => example.text)} />
      <Clarification>
        <p>
          حروف العلّة ثلاثة فقط: الألف والواو والياء. أمّا الهمزة فليست من حروف العلّة؛ فهي حرف مستقل قد يكون
          أصليًا (مثله في «سَأَلَ») أو زائدًا (مثله في «أَكْرَمَ»).
        </p>
      </Clarification>
    </>
  )
}

function WhyRootsStep() {
  const W = C.whyRootsSection
  return (
    <>
      <h4>{W.heading}</h4>
      <div className="morph7-rule" data-testid="morph7-why-roots">
        <p>{W.lead}</p>
      </div>
      <p>{W.example}</p>
      <div className="morph7-cards">
        <VerbCard word="وَعَدَ" type="معتلّ مثال" muall lines={['الواو فيها حرف أصلي من حروف العلّة (و ع د).']} />
        <VerbCard word="وَجَدَ" type="معتلّ مثال" muall lines={['الواو فيها أيضًا أصلية (و ج د)؛ فالفعل كذلك معتلّ.']} />
      </div>
      <Clarification>
        <p>
          الواو «الظاهرة» في الكتابة قد تكون أصلية (كما في «وَعَدَ») فتُغيّر الحكم، والتمييز يكون بالنظر إلى
          الحروف الأصلية لا بوضوح الحرف في الكتابة.
        </p>
      </Clarification>
    </>
  )
}

function SahihDefStep() {
  const S = C.sahihSection
  return (
    <>
      <h4>{S.heading}</h4>
      <div className="morph7-definition" data-testid="morph7-sahih-def">
        <p>{S.definition}</p>
        <p>{S.detail}</p>
      </div>
      <Clarification>
        <p>
          المعتلّ هو ما احتوت حروفه الأصلية على حرف علّة أو أكثر؛ فالحكم يدور على الأصلين معًا: الصحيح يخلو،
          والمعتلّ يحوي.
        </p>
      </Clarification>
    </>
  )
}

function SahihExamplesStep() {
  const T = C.sahihTable
  return (
    <>
      <h4>{C.sahihSection.examplesTitle}</h4>
      <div className="morph7-table-wrap">
        <table className="morph7-table" data-testid="morph7-sahih-table">
          <caption className="morph7-caption">أمثلة على الفعل الصحيح وحروفه الأصلية</caption>
          <thead>
            <tr>
              {T.columns.map((column) => (
                <th key={column} scope="col">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {T.rows.map((row) => (
              <tr key={row.word}>
                <td>
                  <WordChip>{row.word}</WordChip>
                </td>
                <td>
                  <RootChip roots={row.roots} />
                </td>
                <td>{row.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Callout title="انتبه">
        <p>{T.note}</p>
      </Callout>
      <p className="morph7-conclusion">{T.conclusion}</p>
    </>
  )
}

function KindsIntro({ children }: { children: ReactNode }) {
  return (
    <>
      <h4>{C.sahihKindsSection.heading}</h4>
      <p>{C.sahihKindsSection.lead}</p>
      {children}
    </>
  )
}

function SaalimStep() {
  const S = C.saalimSection
  return (
    <KindsIntro>
      <div className="morph7-order">
        <bdi>{S.number}</bdi>. {S.title}
      </div>
      <div className="morph7-definition">
        <p>{S.definition}</p>
        <p>{S.examples}</p>
      </div>
      <div className="morph7-cards">
        {S.exampleWords.map((word) => (
          <VerbCard key={word} word={word} type="سالم" lines={['أصله خالٍ من حروف العلّة والهمزة والتضعيف.']} />
        ))}
      </div>
      <p className="morph7-muted">{S.analysis}</p>
    </KindsIntro>
  )
}

function MahmoozStep() {
  const M = C.mahmoozSection
  return (
    <KindsIntro>
      <div className="morph7-order">
        <bdi>{M.number}</bdi>. {M.title}
      </div>
      <div className="morph7-definition">
        <p>{M.definition}</p>
        <p>{M.examples}</p>
      </div>
      <div className="morph7-cards">
        <VerbCard word="أَخَذَ" type="مهموز" lines={['الهمزة في الأول من أصوله (أ خ ذ).']} />
        <VerbCard word="سَأَلَ" type="مهموز" lines={['الهمزة هي الحرف الثاني من أصوله (س أ ل).']} />
        <VerbCard word="قَرَأَ" type="مهموز" lines={['الهمزة في الأخير من أصوله (ق ر أ).']} />
      </div>
      <Callout title="انتبه">
        <p>{M.hamzaNote}</p>
      </Callout>
      <Clarification>
        <p>
          الهمزة ليست من حروف العلّة (الألف والواو والياء)؛ فالفعل المهموز يبقى صحيحًا، لأن العبرة بحروف العلّة
          في الأصول لا بوجود الهمزة.
        </p>
      </Clarification>
      <p className="morph7-muted">{M.analysis}</p>
    </KindsIntro>
  )
}

function MudaafStep() {
  const M = C.mudaafSection
  return (
    <KindsIntro>
      <div className="morph7-order">
        <bdi>{M.number}</bdi>. {M.title}
      </div>
      <div className="morph7-definition">
        <p>{M.definition}</p>
        <p>{M.examples}</p>
        <p>{M.kinds}</p>
      </div>
      <div className="morph7-example" data-testid="morph7-mudaaf-example">
        <p>
          <strong>{M.analysis}</strong>
        </p>
        <p>فكأن الكلمة قيلت: مَدَدْتُّ فاجتمعت الدالان فأُدغمت الثانية في الأولى، فصارتا دالًا واحدة مشدّدة.</p>
        <p>
          <WordChip>مَدَّ</WordChip> ← <RootChip roots="م د د" /> ← الدالان أصليتان، والشدة علامة إدغام.
        </p>
      </div>
      <Clarification>
        <p>
          الشدة في «مَدَّ» و«شَدَّ» ليست حرفًا زائدًا ولا حرف علّة؛ إنها علامة على أن حرفًا أصليًا مكرَّرًا
          أُدغم في مثيله. ولذلك يبقى الفعل صحيحًا مضعَّفًا.
        </p>
      </Clarification>
    </KindsIntro>
  )
}

function FarqStep() {
  const F = C.farqSahihSalimSection
  return (
    <>
      <h4>{F.heading}</h4>
      <div className="morph7-cards">
        {F.items.map((item) => (
          <VerbCard
            key={item.key}
            word={`${item.key}. ${item.label}`}
            lines={[item.text]}
          />
        ))}
      </div>
      <p className="morph7-conclusion">{F.conclusion}</p>
      <Clarification>
        <p>
          القاعدة باختصار: كل سالم صحيح، وليس كل صحيح سالمًا. فإذا رأيت همزة أصلية أو تضعيفًا في فعل خالٍ من
          حروف العلّة، فهو صحيح لكنه ليس سالمًا.
        </p>
      </Clarification>
    </>
  )
}

function MuallDefStep() {
  const M = C.muallSection
  return (
    <>
      <h4>{M.heading}</h4>
      <div className="morph7-definition" data-testid="morph7-muall-def">
        <p>{M.definition}</p>
        <p>{M.detail}</p>
      </div>
      <p>{M.examplesTitle}</p>
      <div className="morph7-table-wrap">
        <table className="morph7-table" data-testid="morph7-muall-table">
          <caption className="morph7-caption">أمثلة على الفعل المعتلّ وحرف العلّة الأصلي فيه</caption>
          <thead>
            <tr>
              {C.muallTable.columns.map((column) => (
                <th key={column} scope="col">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {C.muallTable.rows.map((row) => (
              <tr key={row.word} className="morph7-row--muall">
                <td>
                  <WordChip muall>{row.word}</WordChip>
                </td>
                <td>{row.weak}</td>
                <td>{row.position}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

function AlifOriginStep() {
  const A = C.alifOriginSection
  return (
    <>
      <h4>{A.heading}</h4>
      <div className="morph7-rule" data-testid="morph7-alif-origin">
        <p>{A.text}</p>
      </div>
      <div className="morph7-cards">
        {A.pairs.map((pair) => (
          <VerbCard
            key={pair.word}
            word={pair.word}
            muall
            type={pair.origin}
            lines={[`المضارع: ${pair.mudari}`, `أصل الحرف المنقلب: ${pair.origin}`]}
          />
        ))}
      </div>
      <p className="morph7-conclusion">{A.conclusion}</p>
      <Clarification>
        <p>
          هذا التعليل مبني على المضارع المعروف، لا على تخمين شكل الألف في الكتابة؛ فالمراجع الموثوقة هي المضارع
          وأصل الكلمة.
        </p>
      </Clarification>
    </>
  )
}

function WeakKindStep({ section, muall }: { section: C.WeakKindSection; muall?: boolean }) {
  return (
    <>
      <div className="morph7-order">
        <bdi>{section.number}</bdi>. {section.title}
      </div>
      <div className="morph7-definition">
        <p>{section.definition}</p>
        <p>{section.examples}</p>
      </div>
      <div className="morph7-cards">
        {section.exampleWords.map((word) => (
          <VerbCard key={word} word={word} muall type={section.title} lines={[section.demo]} />
        ))}
      </div>
      <p className="morph7-muted">{section.demo}</p>
      {muall && (
        <Clarification>
          <p>
            في المثال والأجوف والناقص حرف علّة واحد؛ والفارق موضعه فقط: الأول، أم الوسط، أم الآخر.
          </p>
        </Clarification>
      )}
    </>
  )
}

function LayyefStep() {
  const L = C.layyefSection
  return (
    <>
      <div className="morph7-order">
        <bdi>{L.number}</bdi>. {L.title}
      </div>
      <div className="morph7-definition">
        <p>{L.definition}</p>
        <p>{L.lead}</p>
      </div>
      <div className="morph7-cards">
        {L.types.map((type) => (
          <VerbCard
            key={type.label}
            word={type.example}
            muall
            type={type.label}
            lines={[type.text]}
          />
        ))}
      </div>
      <h5 className="morph7-order">{C.howToTellSection.heading}</h5>
      <p>{C.howToTellSection.lead}</p>
      <Bullets items={C.howToTellSection.bullets} />
    </>
  )
}

function ComparisonStep() {
  const S = C.comparisonSection
  return (
    <>
      <h4>{S.heading}</h4>
      <div className="morph7-table-wrap">
        <table className="morph7-table" data-testid="morph7-comparison-table">
          <caption className="morph7-caption">الصحيح والمعتلّ في ثلاثة أوجه</caption>
          <thead>
            <tr>
              {S.columns.map((column) => (
                <th key={column} scope="col">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {S.rows.map((row) => (
              <tr key={row.aspect}>
                <td>{row.aspect}</td>
                <td>{row.sahih}</td>
                <td className="morph7-row--muall">{row.muall}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="morph7-conclusion">{C.summarySection.goldenRule}</p>
    </>
  )
}

function MistakesStep() {
  const M = C.mistakesSection
  const K = C.careVerbs
  return (
    <>
      <h4>{M.heading}</h4>
      <ol className="morph7-list morph7-keys" data-testid="morph7-mistakes">
        {M.items.map((item) => (
          <li key={item.id}>
            <strong>{item.question}</strong>
            <p>{item.answer}</p>
          </li>
        ))}
      </ol>
      <h5 className="morph7-order">{K.heading}</h5>
      <p>{K.lead}</p>
      <div className="morph7-cards" data-testid="morph7-care-verbs">
        {K.items.map((item) => (
          <VerbCard key={item.word} word={item.word} type={item.verdict} lines={[item.detail]} />
        ))}
      </div>
      <Clarification>
        <p>
          أَكْرَمَ: صحيح لأن همزته زائدة وأصوله (ك ر م). وَعَدَ: معتلّ مثال لأن الواو أصلية. مَدَّ: صحيح
          مضعَّف وليس معتلًّا بسبب الشدة. رَمَى: ناقص، وألفه المقصورة منقلبة عن ياء. دَحْرَجَ: صحيح رباعي،
          وليس معتلًّا لمجرد أنه رباعي.
        </p>
      </Clarification>
    </>
  )
}

/* ================================================================== *
 * الأنشطة التفاعلية (سبعة) — لا يُكشف التصحيح إلا بعد المحاولة والتحقق.
 * ================================================================== */

interface LabSelectProps {
  label: string
  value: string | undefined
  options: readonly string[]
  onChange: (value: string) => void
  testId?: string
}

function LabSelect({ label, value, options, onChange, testId }: LabSelectProps) {
  return (
    <div className="morph7-field">
      <label>
        {label}
        <select
          className="morph7-select"
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
          data-testid={testId}
        >
          <option value="" disabled>
            — اختر —
          </option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}

function RetryButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" className="button button--ghost" onClick={onClick} data-testid="lab-retry">
      {label}
    </button>
  )
}

/** نشاط ١: موضع حرف العلّة. */
function LabLettersStep() {
  const L = C.labLetters
  const [picks, setPicks] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  return (
    <>
      <h4>{L.heading}</h4>
      <p>{L.instruction}</p>
      <div className="morph7-grid" data-testid="morph7-lab-letters">
        {L.items.map((item) => {
          const picked = picks[item.id]
          const isChecked = Boolean(checked[item.id])
          const ok = picked === item.answer
          return (
            <article key={item.id} className="morph7-item" data-testid={item.id}>
              <p className="morph7-item__title">
                <bdi>{C.arabicDigits(item.number)}</bdi>. <WordChip>{item.word}</WordChip>
              </p>
              <LabSelect
                label={`موضع حرف العلّة في ${item.word}`}
                value={picked}
                options={L.options}
                onChange={(value) => {
                  setPicks((current) => ({ ...current, [item.id]: value }))
                  setChecked((current) => ({ ...current, [item.id]: false }))
                }}
              />
              <div className="morph7-item__actions">
                <button
                  type="button"
                  className="button button--secondary"
                  disabled={picked === undefined}
                  onClick={() => setChecked((current) => ({ ...current, [item.id]: true }))}
                >
                  تحقق من الاختيار
                </button>
              </div>
              {isChecked && (
                <Feedback ok={ok}>
                  <p>
                    <strong>{ok ? 'اختيار صحيح.' : 'اختيار غير صحيح.'}</strong>
                    {!ok && <> الصحيح: {item.answer}</>}
                  </p>
                  <p className="morph7-muted">{item.reason}</p>
                </Feedback>
              )}
            </article>
          )
        })}
      </div>
      <RetryButton
        label={L.retryLabel}
        onClick={() => {
          setPicks({})
          setChecked({})
        }}
      />
    </>
  )
}

/** نشاط ٢: الحروف الأصلية ثم الحكم. */
function LabRootsStep() {
  const L = C.labRoots
  const [roots, setRoots] = useState<Record<string, string>>({})
  const [kinds, setKinds] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  return (
    <>
      <h4>{L.heading}</h4>
      <p>{L.instruction}</p>
      <div className="morph7-grid" data-testid="morph7-lab-roots">
        {L.items.map((item) => {
          const complete = Boolean(roots[item.id] && kinds[item.id])
          const isChecked = Boolean(checked[item.id])
          const ok = roots[item.id] === item.roots && kinds[item.id] === item.kind
          return (
            <article key={item.id} className="morph7-item" data-testid={item.id}>
              <p className="morph7-item__title">
                <bdi>{C.arabicDigits(item.number)}</bdi>. <WordChip>{item.word}</WordChip>
              </p>
              <LabSelect
                label={`حروف ${item.word} الأصلية`}
                value={roots[item.id]}
                options={item.rootOptions}
                onChange={(value) => {
                  setRoots((current) => ({ ...current, [item.id]: value }))
                  setChecked((current) => ({ ...current, [item.id]: false }))
                }}
              />
              <LabSelect
                label={`الحكم على ${item.word} من حيث الأصول`}
                value={kinds[item.id]}
                options={['صحيح', 'معتلّ']}
                onChange={(value) => {
                  setKinds((current) => ({ ...current, [item.id]: value }))
                  setChecked((current) => ({ ...current, [item.id]: false }))
                }}
              />
              <div className="morph7-item__actions">
                <button
                  type="button"
                  className="button button--secondary"
                  disabled={!complete}
                  onClick={() => setChecked((current) => ({ ...current, [item.id]: true }))}
                >
                  تحقق من التحليل
                </button>
              </div>
              {isChecked && (
                <Feedback ok={ok}>
                  <p>
                    <strong>{ok ? 'تحليل صحيح.' : 'تحليل غير صحيح.'}</strong>
                    {!ok && (
                      <>
                        {' '}
                        الصحيح: <RootChip roots={item.roots} /> — {item.kind}
                      </>
                    )}
                  </p>
                  <p className="morph7-muted">{item.reason}</p>
                </Feedback>
              )}
            </article>
          )
        })}
      </div>
      <RetryButton
        label={L.retryLabel}
        onClick={() => {
          setRoots({})
          setKinds({})
          setChecked({})
        }}
      />
    </>
  )
}

/** نشاط ٣: سالم أم مهموز أم مضعّف. */
function LabCorrectTypesStep() {
  const L = C.labCorrectTypes
  const [picks, setPicks] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  return (
    <>
      <h4>{L.heading}</h4>
      <p>{L.instruction}</p>
      <div className="morph7-grid" data-testid="morph7-lab-types">
        {L.items.map((item) => {
          const picked = picks[item.id]
          const isChecked = Boolean(checked[item.id])
          const ok = picked === item.answer
          return (
            <article key={item.id} className="morph7-item" data-testid={item.id}>
              <p className="morph7-item__title">
                <bdi>{C.arabicDigits(item.number)}</bdi>. <WordChip>{item.word}</WordChip>
              </p>
              <LabSelect
                label={`نوع ${item.word} من أصوله`}
                value={picked}
                options={L.options}
                onChange={(value) => {
                  setPicks((current) => ({ ...current, [item.id]: value }))
                  setChecked((current) => ({ ...current, [item.id]: false }))
                }}
              />
              <div className="morph7-item__actions">
                <button
                  type="button"
                  className="button button--secondary"
                  disabled={picked === undefined}
                  onClick={() => setChecked((current) => ({ ...current, [item.id]: true }))}
                >
                  تحقق من التصنيف
                </button>
              </div>
              {isChecked && (
                <Feedback ok={ok}>
                  <p>
                    <strong>{ok ? 'تصنيف صحيح.' : 'تصنيف غير صحيح.'}</strong>
                    {!ok && <> الصحيح: {item.answer}</>}
                  </p>
                  <p className="morph7-muted">{item.reason}</p>
                </Feedback>
              )}
            </article>
          )
        })}
      </div>
      <RetryButton
        label={L.retryLabel}
        onClick={() => {
          setPicks({})
          setChecked({})
        }}
      />
    </>
  )
}

/** نشاط ٤: أصل الحرف من المضارع. */
function LabAlifStep() {
  const L = C.labAlif
  const [picks, setPicks] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  return (
    <>
      <h4>{L.heading}</h4>
      <p>{L.instruction}</p>
      <div className="morph7-grid" data-testid="morph7-lab-alif">
        {L.items.map((item) => {
          const picked = picks[item.id]
          const isChecked = Boolean(checked[item.id])
          const ok = picked === item.answer
          return (
            <article key={item.id} className="morph7-item" data-testid={item.id}>
              <p className="morph7-item__title">
                <bdi>{C.arabicDigits(item.number)}</bdi>. <WordChip muall>{item.word}</WordChip>
                <span className="morph7-pair">
                  <span className="morph7-pair__arrow">←</span>
                  <WordChip muall>{item.mudari}</WordChip>
                </span>
              </p>
              <LabSelect
                label={`أصل الحرف المنقلب في ${item.word}`}
                value={picked}
                options={L.options}
                onChange={(value) => {
                  setPicks((current) => ({ ...current, [item.id]: value }))
                  setChecked((current) => ({ ...current, [item.id]: false }))
                }}
              />
              <div className="morph7-item__actions">
                <button
                  type="button"
                  className="button button--secondary"
                  disabled={picked === undefined}
                  onClick={() => setChecked((current) => ({ ...current, [item.id]: true }))}
                >
                  تحقق من الأصل
                </button>
              </div>
              {isChecked && (
                <Feedback ok={ok}>
                  <p>
                    <strong>{ok ? 'أصل صحيح.' : 'أصل غير صحيح.'}</strong>
                    {!ok && <> الصحيح: {item.answer}</>}
                  </p>
                  <p className="morph7-muted">{item.reason}</p>
                </Feedback>
              )}
            </article>
          )
        })}
      </div>
      <RetryButton
        label={L.retryLabel}
        onClick={() => {
          setPicks({})
          setChecked({})
        }}
      />
    </>
  )
}

/** نشاط ٥: نوع المعتلّ بموضع حرف العلّة. */
function LabPositionStep() {
  const L = C.labPosition
  const [picks, setPicks] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  return (
    <>
      <h4>{L.heading}</h4>
      <p>{L.instruction}</p>
      <div className="morph7-grid" data-testid="morph7-lab-position">
        {L.items.map((item) => {
          const picked = picks[item.id]
          const isChecked = Boolean(checked[item.id])
          const ok = picked === item.answer
          return (
            <article key={item.id} className="morph7-item" data-testid={item.id}>
              <p className="morph7-item__title">
                <bdi>{C.arabicDigits(item.number)}</bdi>. <WordChip muall>{item.word}</WordChip>
              </p>
              <LabSelect
                label={`نوع ${item.word}`}
                value={picked}
                options={L.options}
                onChange={(value) => {
                  setPicks((current) => ({ ...current, [item.id]: value }))
                  setChecked((current) => ({ ...current, [item.id]: false }))
                }}
              />
              <div className="morph7-item__actions">
                <button
                  type="button"
                  className="button button--secondary"
                  disabled={picked === undefined}
                  onClick={() => setChecked((current) => ({ ...current, [item.id]: true }))}
                >
                  تحقق من النوع
                </button>
              </div>
              {isChecked && (
                <Feedback ok={ok}>
                  <p>
                    <strong>{ok ? 'نوع صحيح.' : 'نوع غير صحيح.'}</strong>
                    {!ok && <> الصحيح: {item.answer}</>}
                  </p>
                  <p className="morph7-muted">{item.reason}</p>
                </Feedback>
              )}
            </article>
          )
        })}
      </div>
      <RetryButton
        label={L.retryLabel}
        onClick={() => {
          setPicks({})
          setChecked({})
        }}
      />
    </>
  )
}

/** نشاط ٦: مقارنة فعلين متشابهين. */
function LabPairsStep() {
  const L = C.labPairs
  const [picks, setPicks] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  return (
    <>
      <h4>{L.heading}</h4>
      <p>{L.instruction}</p>
      <div className="morph7-grid" data-testid="morph7-lab-pairs">
        {L.items.map((item) => {
          const fields = item.pairs.length + 1
          const values = item.pairs.map((pair) => picks[`${item.id}-${pair.word}`]).concat(picks[`${item.id}-why`])
          const complete = values.filter(Boolean).length === fields
          const isChecked = Boolean(checked[item.id])
          const ok =
            item.pairs.every((pair, index) => values[index] === pair.answer) &&
            picks[`${item.id}-why`] === item.whyAnswer
          return (
            <article key={item.id} className="morph7-item morph7-item--wide" data-testid={item.id}>
              <p className="morph7-item__title">
                <bdi>{C.arabicDigits(item.number)}</bdi>. {item.title}
              </p>
              {item.pairs.map((pair) => (
                <LabSelect
                  key={pair.word}
                  label={`نوع ${pair.word}`}
                  value={picks[`${item.id}-${pair.word}`]}
                  options={item.options}
                  onChange={(value) => {
                    setPicks((current) => ({ ...current, [`${item.id}-${pair.word}`]: value }))
                    setChecked((current) => ({ ...current, [item.id]: false }))
                  }}
                />
              ))}
              <LabSelect
                label={item.whyPrompt}
                value={picks[`${item.id}-why`]}
                options={item.whyOptions}
                onChange={(value) => {
                  setPicks((current) => ({ ...current, [`${item.id}-why`]: value }))
                  setChecked((current) => ({ ...current, [item.id]: false }))
                }}
              />
              <div className="morph7-item__actions">
                <button
                  type="button"
                  className="button button--secondary"
                  disabled={!complete}
                  onClick={() => setChecked((current) => ({ ...current, [item.id]: true }))}
                >
                  تحقق من المقارنة
                </button>
              </div>
              {isChecked && (
                <Feedback ok={ok}>
                  <p>
                    <strong>{ok ? 'مقارنة صحيحة.' : 'مقارنة غير صحيحة.'}</strong>
                  </p>
                  <p className="morph7-muted">{item.reason}</p>
                </Feedback>
              )}
            </article>
          )
        })}
      </div>
      <RetryButton
        label={L.retryLabel}
        onClick={() => {
          setPicks({})
          setChecked({})
        }}
      />
    </>
  )
}

/** نشاط ٧: اكتشف الخطأ في التحليل. */
function LabMistakesStep() {
  const L = C.labMistakes
  const [picks, setPicks] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  return (
    <>
      <h4>{L.heading}</h4>
      <p>{L.instruction}</p>
      <div className="morph7-grid" data-testid="morph7-lab-mistakes">
        {L.items.map((item) => {
          const picked = picks[item.id]
          const isChecked = Boolean(checked[item.id])
          const ok = picked === item.verdict
          return (
            <article key={item.id} className="morph7-item morph7-item--wide" data-testid={item.id}>
              <p className="morph7-item__title">
                <bdi>{C.arabicDigits(item.number)}</bdi>. {item.claim}
              </p>
              <fieldset className="morph7-options morph7-options--stacked">
                <legend className="morph7-sr">احكم على التحليل رقم {item.number}</legend>
                {L.options.map((option) => (
                  <label key={option} className="morph7-option">
                    <input
                      type="radio"
                      name={`judge-${item.id}`}
                      value={option}
                      checked={picked === option}
                      onChange={() => {
                        setPicks((current) => ({ ...current, [item.id]: option }))
                        setChecked((current) => ({ ...current, [item.id]: false }))
                      }}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </fieldset>
              <div className="morph7-item__actions">
                <button
                  type="button"
                  className="button button--secondary"
                  disabled={picked === undefined}
                  onClick={() => setChecked((current) => ({ ...current, [item.id]: true }))}
                >
                  تحقق من الحكم
                </button>
              </div>
              {isChecked && (
                <Feedback ok={ok}>
                  <p>
                    <strong>{ok ? 'حكم صحيح.' : 'حكم غير صحيح.'}</strong>
                    {!ok && <> الصحيح: {item.verdict}</>}
                  </p>
                  <p className="morph7-muted">{item.correction}</p>
                </Feedback>
              )}
            </article>
          )
        })}
      </div>
      <RetryButton
        label={L.retryLabel}
        onClick={() => {
          setPicks({})
          setChecked({})
        }}
      />
    </>
  )
}

/* ================================================================== *
 * التدريبات الأصلية (٦ + ٥ بترقيم ١–١١) — حالتها مرفوعة إلى مكوّن الدرس
 * حتى يعمل زرّا المصدر على التدريبين معًا (م7-2).
 * ================================================================== */

interface TrainingShared {
  answers: Record<string, string>
  checked: Record<string, boolean>
  revealed: boolean
  pick: (id: string, value: string) => void
  check: (id: string) => void
  toggleReveal: () => void
  reset: () => void
}

function TrainingControls({ shared }: { shared: TrainingShared }) {
  return (
    <div className="morph7-item__actions" data-testid="morph7-training-controls">
      <button
        type="button"
        className="button button--ghost"
        data-testid="trainings-reveal"
        onClick={shared.toggleReveal}
      >
        {shared.revealed ? C.trainingControls.hideLabel : C.trainingControls.revealLabel}
      </button>
      <button type="button" className="button button--secondary" data-testid="trainings-retry" onClick={shared.reset}>
        {C.trainingControls.retryLabel}
      </button>
    </div>
  )
}

function RevealPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="morph7-example" data-testid="trainings-solution">
      <p>
        <strong>{title}</strong>
      </p>
      {children}
    </div>
  )
}

function TrainingOneStep({ shared }: { shared: TrainingShared }) {
  const T = C.trainingOne
  return (
    <>
      <h4>{C.trainingsIntro.heading}</h4>
      <p>{C.trainingsIntro.lead}</p>
      <h5 className="morph7-order">{T.heading}</h5>
      <p>{T.instruction}</p>
      <div className="morph7-grid" data-testid="morph7-training-one">
        {T.items.map((item) => {
          const picked = shared.answers[item.id]
          const isChecked = Boolean(shared.checked[item.id])
          const isCorrect = picked === item.answer
          return (
            <article key={item.id} className="morph7-item" data-testid={`train1-${item.id}`}>
              <p className="morph7-item__title">
                <bdi>{C.arabicDigits(item.number)}</bdi>. <WordChip>{item.verb}</WordChip>
              </p>
              <fieldset className="morph7-options morph7-options--stacked">
                <legend className="morph7-sr">حدّد: صحيح أم معتلّ — {item.verb}</legend>
                {T.options.map((option) => (
                  <label key={option} className="morph7-option">
                    <input
                      type="radio"
                      name={`train1-${item.id}`}
                      value={option}
                      checked={picked === option}
                      onChange={() => shared.pick(item.id, option)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </fieldset>
              <div className="morph7-item__actions">
                <button
                  type="button"
                  className="button button--secondary"
                  disabled={picked === undefined}
                  onClick={() => shared.check(item.id)}
                >
                  {T.checkLabel}
                </button>
              </div>
              {isChecked && (
                <Feedback ok={isCorrect} testId={`train1-${item.id}-feedback`}>
                  <p>
                    <strong>{isCorrect ? 'إجابة صحيحة.' : 'إجابة غير صحيحة.'}</strong>
                    {!isCorrect && <> الإجابة الصحيحة: {item.answer}</>}
                  </p>
                  <p className="morph7-muted">{item.explanation}</p>
                </Feedback>
              )}
            </article>
          )
        })}
      </div>
      {shared.revealed && (
        <RevealPanel title="الإجابات والتصحيح للتدريب الأول">
          <ul className="morph7-list">
            {T.items.map((item) => (
              <li key={item.id}>
                <bdi>{C.arabicDigits(item.number)}</bdi>. <WordChip>{item.verb}</WordChip>: {item.answer} —{' '}
                {item.explanation}
              </li>
            ))}
          </ul>
        </RevealPanel>
      )}
      <TrainingControls shared={shared} />
    </>
  )
}

function TrainingTwoStep({ shared }: { shared: TrainingShared }) {
  const T = C.trainingTwo
  return (
    <>
      <p className="morph7-muted">{C.trainingsIntro.lead}</p>
      <h4>{T.heading}</h4>
      <p>{T.instruction}</p>
      <div className="morph7-grid" data-testid="morph7-training-two">
        {T.items.map((item) => {
          const picked = shared.answers[item.id]
          const isChecked = Boolean(shared.checked[item.id])
          const isCorrect = picked === item.answer
          return (
            <article key={item.id} className="morph7-item" data-testid={`train2-${item.id}`}>
              <p className="morph7-item__title">
                <bdi>{C.arabicDigits(item.number)}</bdi>. <WordChip muall>{item.verb}</WordChip>
              </p>
              <fieldset className="morph7-options morph7-options--stacked">
                <legend className="morph7-sr">حدّد نوع {item.verb}</legend>
                {item.options.map((option) => (
                  <label key={option} className="morph7-option">
                    <input
                      type="radio"
                      name={`train2-${item.id}`}
                      value={option}
                      checked={picked === option}
                      onChange={() => shared.pick(item.id, option)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </fieldset>
              <div className="morph7-item__actions">
                <button
                  type="button"
                  className="button button--secondary"
                  disabled={picked === undefined}
                  onClick={() => shared.check(item.id)}
                >
                  {T.checkLabel}
                </button>
              </div>
              {isChecked && (
                <Feedback ok={isCorrect} testId={`train2-${item.id}-feedback`}>
                  <p>
                    <strong>{isCorrect ? 'إجابة صحيحة.' : 'إجابة غير صحيحة.'}</strong>
                    {!isCorrect && <> الإجابة الصحيحة: {item.answer}</>}
                  </p>
                  <p className="morph7-muted">{item.explanation}</p>
                </Feedback>
              )}
            </article>
          )
        })}
      </div>
      {shared.revealed && (
        <RevealPanel title="الإجابات والتصحيح للتدريب الثاني">
          <ul className="morph7-list">
            {T.items.map((item) => (
              <li key={item.id}>
                <bdi>{C.arabicDigits(item.number)}</bdi>. <WordChip muall>{item.verb}</WordChip>: {item.answer} —{' '}
                {item.explanation}
              </li>
            ))}
          </ul>
        </RevealPanel>
      )}
      <TrainingControls shared={shared} />
    </>
  )
}

/* ================================================================== *
 * الخلاصة والدرس القادم
 * ================================================================== */

function SummaryStep() {
  const S = C.summarySection
  return (
    <>
      <h4>{S.heading}</h4>
      <p>{S.lead}</p>
      <div className="morph7-table-wrap">
        <table className="morph7-table" data-testid="morph7-recap-table">
          <caption className="morph7-caption">خلاصة الدرس في جدول واحد</caption>
          <thead>
            <tr>
              {S.recap.columns.map((column) => (
                <th key={column} scope="col">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {S.recap.rows.map((row) => (
              <tr key={`${row.kind}-${row.type}`}>
                <td>{row.kind}</td>
                <td>{row.type}</td>
                <td>
                  <WordChip muall={row.kind === 'المعتلّ'}>{row.example}</WordChip>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="morph7-rule" data-testid="morph7-golden-rule">
        <h4>القاعدة الأساسية</h4>
        <p>{S.goldenRule}</p>
      </div>
    </>
  )
}

function NextLessonStep() {
  const N = C.nextLessonSection
  return (
    <>
      <h4>{N.heading}</h4>
      <p className="morph7-big">{N.sourceLine}</p>
      <Callout title="نطاق العمل">
        <p>{N.scopeNote}</p>
      </Callout>
    </>
  )
}

/* ================================================================== *
 * الاختبار: التسليم، الحلول، ومنطقة المعلم
 * ================================================================== */

function SubmitStep({
  engine,
  isSubmitted,
  onSubmit,
  onReset,
}: {
  engine: TestEngine
  isSubmitted: boolean
  onSubmit: () => void
  onReset: () => void
}) {
  const questions = C.testDefinition.pages.flatMap((page) => page.questions)
  const answered = answeredCount(questions, engine.answers)
  const total = questions.length
  const { finalResult } = engine

  return (
    <section className="morph7-submit" aria-labelledby="morph7-submit-title" data-testid="morph7-submit">
      <h3 id="morph7-submit-title">تسليم الاختبار والنتيجة</h3>
      <p>
        أجبت عن <bdi>{C.arabicDigits(answered)}</bdi> من <bdi>{C.arabicDigits(total)}</bdi> سؤالًا.
      </p>
      {!isSubmitted ? (
        <>
          <p>
            لا تُكشف صحة الإجابات أو الحلول النموذجية أو النتيجة النهائية إلا بعد تسليم الاختبار كاملًا. اضغط زر
            «تسليم الاختبار وإظهار النتيجة» أدناه لاعتماد إجاباتك وإظهار النتيجة النهائية وكشف الحلول النموذجية.
          </p>
          <div className="morph7-item__actions">
            <button
              type="button"
              className="button button--primary"
              onClick={onSubmit}
              data-testid="morph7-submit-btn"
            >
              تسليم الاختبار وإظهار النتيجة
            </button>
            <button type="button" className="button button--secondary" onClick={onReset}>
              إعادة الاختبار
            </button>
          </div>
        </>
      ) : (
        <>
          <div role="status">
            <p className="morph7-score">
              النتيجة: <bdi>{C.arabicDigits(finalResult.correct)}</bdi> من{' '}
              <bdi>{C.arabicDigits(finalResult.total)}</bdi> إجابة صحيحة
            </p>
            <ul className="morph7-counts">
              <li>
                أسئلة صحيحة: <bdi>{C.arabicDigits(finalResult.correct)}</bdi>
              </li>
              <li>
                أسئلة خاطئة: <bdi>{C.arabicDigits(finalResult.wrong)}</bdi>
              </li>
              <li>
                أسئلة غير مجابة: <bdi>{C.arabicDigits(finalResult.unanswered)}</bdi>
              </li>
            </ul>
          </div>
          <div className="morph7-item__actions">
            <button type="button" className="button button--secondary" onClick={onReset}>
              إعادة الاختبار
            </button>
          </div>
        </>
      )}
      <p className="morph7-muted">
        «إعادة الاختبار» تمسح كل الإجابات ونتائج الصفحات، فتُقفَل النتيجة والحلول من جديد حتى تسلّم الاختبار مرة
        أخرى.
      </p>
    </section>
  )
}

/** قسم قابل للإغلاق في منطقة المعلّم (حتى لا تصبح الصفحة كتلة نصية). */
function TeacherSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details>
      <summary>{title}</summary>
      <div>{children}</div>
    </details>
  )
}

function TeacherArea() {
  return (
    <TeacherSpace password={COURSE_TEACHER_PASSWORD}>
      <div className="teacher-material teacher-material--morphology7 morph7-teacher">
        <p className="morph7-keys__note">{C.teacherKeyHeader}</p>

        <h3>أقسام المعلّم — افتح كل قسم عند الحاجة</h3>

        <TeacherSection title="١. الأهداف التعليمية">
          <ol className="morph7-keys">
            {C.objectives.map((goal) => (
              <li key={goal}>{goal}</li>
            ))}
          </ol>
        </TeacherSection>

        <TeacherSection title="٢. خريطة محتوى الدرس (المصدر ← الخطوات)">
          <ul className="morph7-list">
            {C.teacherContentMap.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </TeacherSection>

        <TeacherSection title="٣. شرح تفصيلي لكل قاعدة">
          <ul className="morph7-list">
            {C.teacherRuleExplanations.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </TeacherSection>

        <TeacherSection title="٤. جدول تصنيف جميع أمثلة المصدر">
          <p className="morph7-muted">{C.teacherVerbTableNote}</p>
          <div className="morph7-table-wrap">
            <table className="morph7-table">
              <caption className="morph7-caption">التصنيف: القسم والنوع لكل مثال</caption>
              <thead>
                <tr>
                  <th scope="col">الفعل</th>
                  <th scope="col">القسم</th>
                  <th scope="col">النوع</th>
                </tr>
              </thead>
              <tbody>
                {C.verbFacts.map((fact) => (
                  <tr key={fact.id} className={fact.kind === 'معتلّ' ? 'morph7-row--muall' : undefined}>
                    <td>
                      <WordChip muall={fact.kind === 'معتلّ'}>{fact.word}</WordChip>
                    </td>
                    <td>{fact.kind}</td>
                    <td>{fact.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TeacherSection>

        <TeacherSection title="٥. تحليل الحروف الأصلية لكل فعل أساسي">
          <div className="morph7-table-wrap">
            <table className="morph7-table">
              <caption className="morph7-caption">الحروف الأصلية وموضع حرف العلّة وأصله</caption>
              <thead>
                <tr>
                  <th scope="col">الفعل</th>
                  <th scope="col">الحروف الأصلية</th>
                  <th scope="col">موضع حرف العلّة</th>
                  <th scope="col">أصل الحرف</th>
                </tr>
              </thead>
              <tbody>
                {C.verbFacts.map((fact) => (
                  <tr key={fact.id}>
                    <td>
                      <WordChip muall={fact.kind === 'معتلّ'}>{fact.word}</WordChip>
                    </td>
                    <td>
                      <RootChip roots={fact.roots} />
                    </td>
                    <td>{fact.weakPosition ?? '—'}</td>
                    <td>{fact.weakOrigin ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TeacherSection>

        <TeacherSection title="٦. سبب كون كل فعل صحيحًا أو معتلًّا، وتفسير نوعه">
          <p className="morph7-muted">{C.teacherAnalysisNote}</p>
          <div className="morph7-keys">
            {C.verbFacts.map((fact) => (
              <article key={fact.id} className="morph7-item">
                <p className="morph7-item__title">
                  <WordChip muall={fact.kind === 'معتلّ'}>{fact.word}</WordChip> — {fact.kind} — {fact.type}
                </p>
                <p>{fact.reason}</p>
              </article>
            ))}
          </div>
        </TeacherSection>

        <TeacherSection title="٧. الحل النموذجي للتدريب الأول (صحيح أم معتلّ؟) مع التعليل">
          <ol className="morph7-keys">
            {C.trainingOne.items.map((item) => (
              <li key={item.id}>
                <strong>
                  <bdi>{C.arabicDigits(item.number)}</bdi>. <WordChip>{item.verb}</WordChip>:
                </strong>{' '}
                {item.answer}. <span>{item.explanation}</span>
              </li>
            ))}
          </ol>
        </TeacherSection>

        <TeacherSection title="٨. الحل النموذجي للتدريب الثاني (حدّد نوع الفعل المعتلّ) مع التعليل">
          <ol className="morph7-keys">
            {C.trainingTwo.items.map((item) => (
              <li key={item.id}>
                {item.teacherKey} <span className="morph7-muted">{item.explanation}</span>
              </li>
            ))}
          </ol>
        </TeacherSection>

        <TeacherSection title="٩. حلول الأنشطة التفاعلية السبعة">
          <ul className="morph7-list">
            {C.teacherLabKeys.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </TeacherSection>

        <TeacherSection title="١٠. إجابات الأسئلة العشرين في اختبار الدرس مع التفسير">
          <SolutionsArea
            test={testDefinition}
            mode="teacher"
            title="الحلول التفصيلية لاختبار الدرس السابع: الفعل الصحيح والفعل المعتل"
            eyebrow="منطقة المعلم"
          />
        </TeacherSection>

        <TeacherSection title="١١. أخطاء الطلاب الشائعة وطريقة تصحيحها">
          <ul className="morph7-list">
            {C.teacherMistakes.map((mistake) => (
              <li key={mistake}>{mistake}</li>
            ))}
          </ul>
        </TeacherSection>

        <TeacherSection title="١٢. الإحالات إلى مواضع المصدر وسجل التدقيق">
          <ul className="morph7-list">
            {C.teacherAuditNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </TeacherSection>
      </div>
    </TeacherSpace>
  )
}

/* ================================================================== *
 * تجميع خطوات الدرس السابع
 * ================================================================== */

export function LessonMorphologySeven({ onProgressChange, onFinish }: Props) {
  // المحرك المشترك يعيش فوق LessonFlow، فتبقى الإجابات والنتائج محفوظة عند التنقل بين الخطوات.
  const testEngine = useTestEngine(testDefinition)
  const [testSubmitted, setTestSubmitted] = useState(false)
  const isTestSubmitted = testSubmitted && testEngine.allPagesChecked

  // حالة التدريبات مرفوعة أيضًا، ليعمل زرّا المصدر على التدريبين معًا (م7-2).
  const [trainingAnswers, setTrainingAnswers] = useState<Record<string, string>>({})
  const [trainingChecked, setTrainingChecked] = useState<Record<string, boolean>>({})
  const [trainingRevealed, setTrainingRevealed] = useState(false)
  const trainingShared: TrainingShared = {
    answers: trainingAnswers,
    checked: trainingChecked,
    revealed: trainingRevealed,
    pick(id, value) {
      setTrainingAnswers((current) => ({ ...current, [id]: value }))
      setTrainingChecked((current) => ({ ...current, [id]: false }))
    },
    check(id) {
      setTrainingChecked((current) => ({ ...current, [id]: true }))
    },
    toggleReveal() {
      setTrainingRevealed((value) => !value)
    },
    reset() {
      setTrainingAnswers({})
      setTrainingChecked({})
      setTrainingRevealed(false)
    },
  }

  function handleSubmitTest() {
    for (const page of testDefinition.pages) {
      testEngine.checkPage(page.id)
    }
    setTestSubmitted(true)
  }

  function handleResetTest() {
    testEngine.resetTest()
    setTestSubmitted(false)
  }

  const testSteps = testDefinition.pages.map((page) =>
    step(`test-${page.id}`, page.title, 'الاختبار النهائي (٢٠ سؤالًا)', '📝', (
      <TestPageView
        page={page}
        engine={testEngine}
        questionTestIdPrefix="morph7-question"
        revealFeedback={isTestSubmitted}
      />
    )),
  )

  const steps: LessonStepDefinition[] = [
    step('intro', 'الدرس السابع: الفعل الصحيح والفعل المعتل', 'التمهيد والأهداف والمراجعة', '🌷', <IntroStep />),
    step('goals', 'أهداف الدرس', 'التمهيد والأهداف والمراجعة', '🎯', <GoalsStep />),
    step('review-letters', 'أولًا: مراجعة حروف العلّة', 'التمهيد والأهداف والمراجعة', '1️⃣', <ReviewStep />),
    step('lab-letters', 'نشاط: أين يظهر حرف العلّة؟', 'التمهيد والأهداف والمراجعة', '🧭', <LabLettersStep />),
    step('why-roots', 'لماذا ننظر إلى الحروف الأصلية؟', 'التمهيد والأهداف والمراجعة', '🔍', <WhyRootsStep />),
    step('lab-roots', 'نشاط: الحروف الأصلية أولًا', 'التمهيد والأهداف والمراجعة', '🧮', <LabRootsStep />),

    step('sahih-def', 'ثانيًا: ما الفعل الصحيح؟', 'الفعل الصحيح وأنواعه', '📘', <SahihDefStep />),
    step('sahih-examples', 'أمثلة على الفعل الصحيح: الثلاثي والرباعي', 'الفعل الصحيح وأنواعه', '📚', <SahihExamplesStep />),
    step('saalim', 'ثالثًا (١): الصحيح السالم', 'الفعل الصحيح وأنواعه', '📗', <SaalimStep />),
    step('mahmooz', 'ثالثًا (٢): الصحيح المهموز', 'الفعل الصحيح وأنواعه', '⚡', <MahmoozStep />),
    step('mudaaf', 'ثالثًا (٣): الصحيح المضعّف والإدغام', 'الفعل الصحيح وأنواعه', '🔁', <MudaafStep />),
    step('lab-correct-types', 'نشاط: سالم أم مهموز أم مضعّف؟', 'الفعل الصحيح وأنواعه', '🧪', <LabCorrectTypesStep />),
    step('farq-sahih-salim', 'الفرق بين «الصحيح» و«السالم»', 'الفعل الصحيح وأنواعه', '⚖️', <FarqStep />),

    step('muall-def', 'رابعًا: ما الفعل المعتلّ؟', 'الفعل المعتلّ وأنواعه', '📙', <MuallDefStep />),
    step('alif-origin', 'أصل ألف «قَالَ» و«بَاعَ»', 'الفعل المعتلّ وأنواعه', '🌱', <AlifOriginStep />),
    step('lab-alif', 'نشاط: من أين نعرف أصل الحرف؟', 'الفعل المعتلّ وأنواعه', '🧬', <LabAlifStep />),
    step('mithaal', 'خامسًا (١): المثال', 'الفعل المعتلّ وأنواعه', '1️⃣', <WeakKindStep section={C.mithaalSection} />),
    step('ajwaf', 'خامسًا (٢): الأجوف', 'الفعل المعتلّ وأنواعه', '2️⃣', <WeakKindStep section={C.ajwafSection} />),
    step('naaqis', 'خامسًا (٣): الناقص', 'الفعل المعتلّ وأنواعه', '3️⃣', <WeakKindStep section={C.naaqisSection} muall />),
    step('layyef', 'خامسًا (٤): اللفيف المقرون والمفروق', 'الفعل المعتلّ وأنواعه', '🧩', <LayyefStep />),
    step('lab-position', 'نشاط: نوع المعتلّ بموضع حرف العلّة', 'الفعل المعتلّ وأنواعه', '🎯', <LabPositionStep />),
    step('lab-pairs', 'نشاط: قارِن بين الفعلين المتشابهين', 'الفعل المعتلّ وأنواعه', '🆚', <LabPairsStep />),

    step('comparison', 'سادسًا: مقارنة شاملة بين الصحيح والمعتلّ', 'المقارنة والأخطاء الشائعة', '📊', <ComparisonStep />),
    step('mistakes', 'سابعًا: أخطاء شائعة وأفعال تحتاج عناية', 'المقارنة والأخطاء الشائعة', '⚠️', <MistakesStep />),
    step('lab-mistakes', 'نشاط: اكتشف الخطأ في التحليل', 'المقارنة والأخطاء الشائعة', '🔎', <LabMistakesStep />),

    step('train-1', 'ثامنًا (١): التدريب الأول — صحيح أم معتلّ؟', 'التدريبات', '✍️', <TrainingOneStep shared={trainingShared} />),
    step('train-2', 'ثامنًا (٢): التدريب الثاني — حدّد نوع الفعل المعتلّ', 'التدريبات', '📝', <TrainingTwoStep shared={trainingShared} />),

    step('summary', 'تاسعًا: خلاصة الدرس للحفظ', 'الخلاصة وما بعد الدرس', '📌', <SummaryStep />),
    step('next-lesson', 'الدرس الثامن: تصريف الأفعال والإسناد إلى الضمائر', 'الخلاصة وما بعد الدرس', '➡️', <NextLessonStep />),

    ...testSteps,
    step(
      'submit',
      'تسليم الاختبار والنتيجة',
      'الاختبار النهائي (٢٠ سؤالًا)',
      '✅',
      <SubmitStep engine={testEngine} isSubmitted={isTestSubmitted} onSubmit={handleSubmitTest} onReset={handleResetTest} />,
    ),
    step(
      'solutions',
      'حلول الاختبار',
      'الاختبار النهائي (٢٠ سؤالًا)',
      '📗',
      <SolutionsArea
        test={testDefinition}
        engine={testEngine}
        testId="morphology7-solutions"
        title="حلول اختبار الدرس السابع: الفعل الصحيح والفعل المعتل"
        revealFeedback={isTestSubmitted}
      />,
    ),

    step('teacher', 'منطقة خاصة بالمعلم', 'منطقة المعلم', '🔐', <TeacherArea />),
  ]

  return (
    <LessonFlow
      steps={steps}
      onProgressChange={onProgressChange}
      onFinish={onFinish}
      lessonTitle="الفعل الصحيح والفعل المعتل"
      lessonNumber="٧"
      lessonEyebrow="القسم الثاني: الصرف"
    />
  )
}

function step(id: string, title: string, group: string, icon: string, content: ReactNode): LessonStepDefinition {
  return {
    id,
    title,
    shortTitle: title,
    group,
    icon,
    description: 'اقرأ نص الدرس، ثم طبّق ما فهمته في النشاط.',
    render: () => content,
  }
}
