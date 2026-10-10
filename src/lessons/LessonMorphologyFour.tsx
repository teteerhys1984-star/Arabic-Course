import { useState, type ReactNode } from 'react'
import { LessonFlow, type LessonStepDefinition } from '../shared/components/LessonFlow'
import { TeacherSpace } from '../shared/teacher/TeacherSpace'
import { COURSE_TEACHER_PASSWORD } from '../shared/teacher/teacherPassword'
import * as C from './morphology-lesson-04/content'
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
 * الأربع صفحات تُعرض كخطوات مستقلة، ولكل صفحة زر «تحقّق من الإجابات».
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
 * ================================================================== */

function Callout({ children, title = 'ملاحظة مهمة' }: { children: ReactNode; title?: string }) {
  return (
    <aside className="morph4-callout">
      <strong>{title}</strong>
      <div>{children}</div>
    </aside>
  )
}

function CautionBox({ title = 'انتبه للتدقيق الصرفي', children }: { title?: string; children: ReactNode }) {
  return (
    <aside className="morph4-caution" role="note">
      <span className="morph4-caution__title">{title}</span>
      <div>{children}</div>
    </aside>
  )
}

function Clarification({ children }: { children: ReactNode }) {
  return (
    <aside className="morph4-clarification">
      <span className="morph4-clarification__badge">توضيح تعليمي من المنصة</span>
      <div>{children}</div>
    </aside>
  )
}

function Golden({ text }: { text: string }) {
  return (
    <div className="morph4-golden">
      <span aria-hidden="true">⭐</span>
      <p>{text}</p>
    </div>
  )
}

function Bullets({ items }: { items: readonly string[] }) {
  return (
    <ul className="morph4-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

function VowelBadge({ vowel }: { vowel: 'الفتحة' | 'الكسرة' | 'الضمة' }) {
  const modifier =
    vowel === 'الفتحة'
      ? 'morph4-vowel--fatha'
      : vowel === 'الكسرة'
        ? 'morph4-vowel--kasra'
        : 'morph4-vowel--damma'
  const sign = vowel === 'الفتحة' ? 'ـَ' : vowel === 'الكسرة' ? 'ـِ' : 'ـُ'
  return (
    <span className={`morph4-vowel ${modifier}`}>
      <bdi>{vowel}</bdi> <bdi>({sign})</bdi>
    </span>
  )
}

function DoorBanner({
  doorOrder,
  weight,
  pastVowel,
  presentVowel,
}: {
  doorOrder: C.DoorName
  weight: C.SixWeight
  pastVowel: 'الفتحة' | 'الكسرة' | 'الضمة'
  presentVowel: 'الضمة' | 'الكسرة' | 'الفتحة'
}) {
  return (
    <div className="morph4-door-banner" role="region" aria-label={`بطاقة الباب ${doorOrder}`}>
      <div className="morph4-door-banner__cell">
        <span className="morph4-door-banner__label">الباب الصرفي</span>
        <span className="morph4-door-banner__value">الباب {doorOrder}</span>
      </div>
      <div className="morph4-door-banner__cell">
        <span className="morph4-door-banner__label">الوزن</span>
        <span className="morph4-door-banner__value">
          <bdi className="morph4-weight">{weight}</bdi>
        </span>
      </div>
      <div className="morph4-door-banner__cell">
        <span className="morph4-door-banner__label">حركة عين الفعل في الماضي</span>
        <div>
          <VowelBadge vowel={pastVowel} />
        </div>
      </div>
      <div className="morph4-door-banner__cell">
        <span className="morph4-door-banner__label">حركة عين الفعل في المضارع</span>
        <div>
          <VowelBadge vowel={presentVowel} />
        </div>
      </div>
    </div>
  )
}

function DoorExamplesTable({ caption, rows }: { caption: string; rows: readonly C.VerbExampleRow[] }) {
  return (
    <div className="morph4-table-wrap">
      <table className="morph4-table">
        <caption className="morph4-caption">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">الفعل الماضي</th>
            <th scope="col">الفعل المضارع</th>
            <th scope="col">عين الفعل وحركتاها</th>
            <th scope="col">المعنى</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.past}-${row.present}`}>
              <td>
                <bdi className="morph4-word">{row.past}</bdi>
              </td>
              <td>
                <bdi className="morph4-word">{row.present}</bdi>
              </td>
              <td>
                <bdi>{row.aynLetter}</bdi>:{' '}
                <VowelBadge vowel={row.pastVowel} /> ← <VowelBadge vowel={row.presentVowel} />
              </td>
              <td>{row.meaning}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Feedback({ ok, children, testId }: { ok: boolean; children: ReactNode; testId?: string }) {
  return (
    <div
      className={ok ? 'morph4-feedback morph4-feedback--ok' : 'morph4-feedback morph4-feedback--no'}
      role="status"
      data-testid={testId}
    >
      {children}
    </div>
  )
}

/* ================================================================== *
 * الخطوة ١: التمهيد وربط الدرس السابق بالدرس الحالي
 * ================================================================== */

function IntroStep() {
  const H = C.lessonHeader
  return (
    <>
      <div className="morph4-hero">
        <span>{H.section}</span>
        <span>{C.arabicDigits(6)} أبواب صرفية</span>
        <span>{C.arabicDigits(9)} أقسام</span>
        <span>تدريبان تطبيقيان</span>
        <span>اختبار من {C.arabicDigits(20)} سؤالًا</span>
      </div>
      <p className="morph4-big">{H.welcome}</p>
      <p>{H.prerequisiteLink}</p>
      <div className="morph4-chips" role="list" aria-label="أمثلة الثلاثي المجرّد من الدرس السابق">
        {H.previousExamples.map((verb) => (
          <bdi key={verb} className="morph4-word" role="listitem">
            {verb}
          </bdi>
        ))}
      </div>
      <p>{H.todayIntro}</p>
      <Callout title="لماذا ندرس أوزان الفعل الثلاثي المجرّد؟">
        <p>{H.whyItMatters}</p>
      </Callout>
      <p>{H.roadmapNote}</p>
      <h4>أقسام الدرس</h4>
      <ol className="morph4-list morph4-list--numbered">
        {C.sourceSections.map((section) => (
          <li key={section}>{section}</li>
        ))}
      </ol>
    </>
  )
}

/* ================================================================== *
 * الخطوة ٢: أولًا — ما المقصود بالوزن الصرفي؟
 * ================================================================== */

function MizanConceptStep() {
  const M = C.mizanSection
  return (
    <>
      <p>{M.definition}</p>
      <p>{M.lettersLead}</p>
      <ul className="morph4-list">
        {M.letters.map((item) => (
          <li key={item.symbol}>
            <strong>
              <bdi>{item.symbol}</bdi>:
            </strong>{' '}
            {item.role}
          </li>
        ))}
      </ul>

      <p>{M.exampleLead}</p>
      <div className="morph4-scale-boxes" role="list" aria-label="مقابلة حروف كَتَبَ بالميزان فَعَلَ">
        {M.mappingTable.map((cell, index) => (
          <div
            key={cell.position}
            role="listitem"
            className={index === 1 ? 'morph4-scale-box morph4-scale-box--ayn' : 'morph4-scale-box'}
          >
            <span className="morph4-scale-box__role">{cell.position}</span>
            <bdi className="morph4-scale-box__word">{cell.wordChar}</bdi>
            <span aria-hidden="true">↕</span>
            <bdi className="morph4-scale-box__scale">{cell.scaleChar}</bdi>
            <span className="morph4-scale-box__role">{cell.scaleName}</span>
          </div>
        ))}
      </div>

      <div className="morph4-table-wrap">
        <table className="morph4-table">
          <caption className="morph4-caption">جدول مقابلة الفعل «كَتَبَ» بالميزان الصرفي «فَعَلَ»</caption>
          <thead>
            <tr>
              <th scope="col">البيان</th>
              <th scope="col">الحرف الأول</th>
              <th scope="col">الحرف الثاني (عين الفعل)</th>
              <th scope="col">الحرف الثالث</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">الفعل</th>
              <td>
                <bdi className="morph4-word">كَ</bdi>
              </td>
              <td>
                <bdi className="morph4-word">تَ</bdi>
              </td>
              <td>
                <bdi className="morph4-word">بَ</bdi>
              </td>
            </tr>
            <tr>
              <th scope="row">الميزان</th>
              <td>
                <bdi className="morph4-weight">فَ</bdi>
              </td>
              <td>
                <bdi className="morph4-weight">عَ</bdi>
              </td>
              <td>
                <bdi className="morph4-weight">لَ</bdi>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p>
        <strong>{M.exampleConclusion}</strong>
      </p>
      <p>{M.vowelsNote}</p>
      <p>{M.vowelsLead}</p>

      <div className="morph4-compare" role="list">
        {M.vowelComparison.map((row) => (
          <article key={row.verb} className="morph4-card" role="listitem">
            <p>
              <bdi className="morph4-word">{row.verb}</bdi>: وزنُه{' '}
              <bdi className="morph4-weight">{row.weight}</bdi>.
            </p>
            <p className="morph4-muted">
              الحرف الثاني (<bdi>{row.aynLetter}</bdi>): <VowelBadge vowel={row.aynVowel} />
            </p>
          </article>
        ))}
      </div>

      <Golden text={M.closingObservation} />
      <p className="morph4-muted">{M.closingBridge}</p>
    </>
  )
}

/* ================================================================== *
 * الخطوة ٣: مفهوم عين الفعل ومختبر تحديد عين الفعل
 * ================================================================== */

function AynLabCard({ item, number }: { item: C.AynLabItem; number: number }) {
  const [letter, setLetter] = useState('')
  const [pastVowel, setPastVowel] = useState('')
  const [presentVowel, setPresentVowel] = useState('')
  const [checked, setChecked] = useState(false)

  const letterOk = letter === item.aynLetter
  const pastOk = pastVowel === item.pastVowel
  const presentOk = presentVowel === item.presentVowel
  const allOk = letterOk && pastOk && presentOk

  return (
    <article className="morph4-item" data-testid={`ayn-lab-${item.id}`}>
      <p className="morph4-item__title">
        <bdi>{C.arabicDigits(number)}</bdi>.{' '}
        <bdi className="morph4-word">
          {item.past} — {item.present}
        </bdi>
      </p>
      <div className="morph4-fields">
        <label className="morph4-field">
          <span className="morph4-field__label">عين الفعل (الحرف الثاني)</span>
          <select
            value={letter}
            aria-label={`عين الفعل في ${item.past}`}
            onChange={(event) => {
              setLetter(event.target.value)
              setChecked(false)
            }}
          >
            <option value="">اختر الحرف</option>
            {item.letterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
        <label className="morph4-field">
          <span className="morph4-field__label">حركة العين في الماضي</span>
          <select
            value={pastVowel}
            aria-label={`حركة عين الماضي في ${item.past}`}
            onChange={(event) => {
              setPastVowel(event.target.value)
              setChecked(false)
            }}
          >
            <option value="">اختر الحركة</option>
            {C.VOWEL_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
        <label className="morph4-field">
          <span className="morph4-field__label">حركة العين في المضارع</span>
          <select
            value={presentVowel}
            aria-label={`حركة عين المضارع في ${item.present}`}
            onChange={(event) => {
              setPresentVowel(event.target.value)
              setChecked(false)
            }}
          >
            <option value="">اختر الحركة</option>
            {C.VOWEL_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="morph4-item__actions">
        <button
          type="button"
          className="button button--secondary"
          disabled={!letter || !pastVowel || !presentVowel}
          onClick={() => setChecked(true)}
        >
          تحقق من التحليل
        </button>
      </div>
      {checked && (
        <Feedback ok={allOk} testId={`ayn-lab-${item.id}-feedback`}>
          <p>
            <strong>{allOk ? 'تحليل صحيح ودقيق.' : 'راجع تحديد عين الفعل أو حركتها.'}</strong>
          </p>
          <p>
            عين الفعل: <strong>{item.aynLetter}</strong> | الماضي: <VowelBadge vowel={item.pastVowel} /> | المضارع:{' '}
            <VowelBadge vowel={item.presentVowel} /> | الوزن: <bdi className="morph4-weight">{item.weight}</bdi> (الباب{' '}
            {item.doorOrder}).
          </p>
          <p className="morph4-muted">{item.explanation}</p>
        </Feedback>
      )}
    </article>
  )
}

function AynConceptStep() {
  const O = C.overviewSection
  return (
    <>
      <p>{O.lead}</p>
      <Callout title="ما المقصود بعين الفعل؟">
        <p>
          <strong>{O.aynDefinition}</strong>
        </p>
        <p>{O.aynExample}</p>
      </Callout>
      <h4>نشاط تفاعلي: حدّد عين الفعل وحركتها في الماضي والمضارع</h4>
      <p className="morph4-muted">
        اختر الحرف الأصلي الثاني (عين الفعل)، ثم حدّد حركته في الماضي وحركته في المضارع، واضغط «تحقق من التحليل».
      </p>
      <div className="morph4-grid">
        {C.aynLab.map((item, index) => (
          <AynLabCard key={item.id} item={item} number={index + 1} />
        ))}
      </div>
    </>
  )
}

/* ================================================================== *
 * الخطوة ٤: الجدول المرجعي للأبواب الستة
 * ================================================================== */

function SixDoorsOverviewStep() {
  const O = C.overviewSection
  return (
    <>
      <p>{O.tableLead}</p>
      <div className="morph4-table-wrap">
        <table className="morph4-table" data-testid="reference-six-doors-table">
          <caption className="morph4-caption">الجدول المرجعي للأبواب الستة للفعل الثلاثي المجرّد</caption>
          <thead>
            <tr>
              <th scope="col">الباب</th>
              <th scope="col">وزن الماضي</th>
              <th scope="col">وزن المضارع</th>
              <th scope="col">حركة عين الماضي والمضارع</th>
              <th scope="col">مثال</th>
            </tr>
          </thead>
          <tbody>
            {O.referenceTable.map((row) => (
              <tr key={row.doorOrder}>
                <td>
                  <strong>{row.doorOrder}</strong>
                </td>
                <td>
                  <bdi className="morph4-weight">{row.pastWeight}</bdi>
                </td>
                <td>
                  <bdi className="morph4-weight">{row.presentWeight}</bdi>
                </td>
                <td>
                  <VowelBadge vowel={row.pastAynVowel} /> ← <VowelBadge vowel={row.presentAynVowel} />
                </td>
                <td>
                  <bdi className="morph4-word">{row.example}</bdi>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Callout title="ملاحظة مهمة">
        <p>{O.importantNote}</p>
      </Callout>
    </>
  )
}

/* ================================================================== *
 * الخطوة ٥: الباب الأول (فَعَلَ — يَفْعُلُ)
 * ================================================================== */

function DoorOneStep() {
  const D = C.doorOne
  return (
    <>
      <DoorBanner
        doorOrder={D.doorOrder}
        weight={D.weight}
        pastVowel={D.pastVowel}
        presentVowel={D.presentVowel}
      />
      <p>{D.rule}</p>

      <h4>أمثلة الباب الأول الصحيحة:</h4>
      <DoorExamplesTable caption="أمثلة الباب الأول: فَعَلَ — يَفْعُلُ" rows={D.examples} />

      <CautionBox title="تنبيه مهم من الدرس">
        <p>{D.cautionNotice}</p>
        <p className="morph4-muted">{D.cautionDetails}</p>
      </CautionBox>

      <p>{D.clearExamplesLead}</p>
      <Bullets items={D.clearExamplesList} />

      <div className="morph4-example">
        <h4>{D.workedQuestion}</h4>
        <Bullets items={D.workedItems} />
        <p>{D.workedPast}</p>
        <p>{D.workedPresent}</p>
        <p>
          <strong>{D.workedConclusion}</strong>
        </p>
      </div>
    </>
  )
}

/* ================================================================== *
 * الخطوة ٦: الباب الثاني (فَعَلَ — يَفْعِلُ)
 * ================================================================== */

function DoorTwoStep() {
  const D = C.doorTwo
  return (
    <>
      <DoorBanner
        doorOrder={D.doorOrder}
        weight={D.weight}
        pastVowel={D.pastVowel}
        presentVowel={D.presentVowel}
      />
      <p>{D.rule}</p>

      <h4>أمثلة الباب الثاني الصحيحة:</h4>
      <DoorExamplesTable caption="أمثلة الباب الثاني: فَعَلَ — يَفْعِلُ" rows={D.examples} />

      <CautionBox title="تدقيق الأمثلة واستبعاد ما ينتمي إلى الباب الرابع">
        <p>{D.cautionNotice}</p>
        <Bullets items={D.clearExamplesList} />
        <p>
          <strong>{D.fahimaCaution}</strong>
        </p>
        <p className="morph4-muted">{D.cautionExplanation}</p>
      </CautionBox>

      <Golden text={D.coreMemorizeNote} />

      <div className="morph4-example">
        <h4>{D.workedLead}</h4>
        <Bullets items={D.workedItems} />
        <p>
          <strong>{D.compareLead}</strong>
        </p>
        <Bullets items={D.compareItems} />
      </div>
    </>
  )
}

/* ================================================================== *
 * الخطوة ٧: الباب الثالث (فَعَلَ — يَفْعَلُ) ومقارنة الأبواب الثلاثة الأولى
 * ================================================================== */

function FirstThreeCompareCard({ item, number }: { item: C.FirstThreeLabItem; number: number }) {
  const [picked, setPicked] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)
  const options = ['فَعَلَ — يَفْعُلُ (الأول)', 'فَعَلَ — يَفْعِلُ (الثاني)', 'فَعَلَ — يَفْعَلُ (الثالث)'] as const
  const target = `${item.weight} (${item.doorOrder})`
  const ok = picked === target

  return (
    <article className="morph4-item" data-testid={`first-three-${item.id}`}>
      <p className="morph4-item__title">
        <bdi>{C.arabicDigits(number)}</bdi>.{' '}
        <bdi className="morph4-word">
          {item.past} — {item.present}
        </bdi>{' '}
        <span className="morph4-muted">(عين الفعل: {item.aynLetter})</span>
      </p>
      <fieldset className="morph4-options morph4-options--stacked">
        <legend className="morph4-sr">اختر الباب لـ {item.past}</legend>
        {options.map((opt) => (
          <label key={opt} className="morph4-option">
            <input
              type="radio"
              name={`ft-${item.id}`}
              value={opt}
              checked={picked === opt}
              onChange={() => {
                setPicked(opt)
                setChecked(false)
              }}
            />
            <bdi>{opt}</bdi>
          </label>
        ))}
      </fieldset>
      <div className="morph4-item__actions">
        <button
          type="button"
          className="button button--secondary"
          disabled={picked === null}
          onClick={() => setChecked(true)}
        >
          تحقق من الإجابة
        </button>
      </div>
      {checked && (
        <Feedback ok={ok}>
          <p>
            <strong>{ok ? 'اختيار صحيح.' : `الصواب: ${target}`}</strong>
          </p>
          <p className="morph4-muted">{item.explanation}</p>
        </Feedback>
      )}
    </article>
  )
}

function DoorThreeStep() {
  const D = C.doorThree
  return (
    <>
      <DoorBanner
        doorOrder={D.doorOrder}
        weight={D.weight}
        pastVowel={D.pastVowel}
        presentVowel={D.presentVowel}
      />
      <p>{D.rule}</p>

      <h4>أمثلة الباب الثالث:</h4>
      <DoorExamplesTable caption="أمثلة الباب الثالث: فَعَلَ — يَفْعَلُ" rows={D.examples} />

      <div className="morph4-example">
        <h4>{D.workedLead}</h4>
        <Bullets items={D.workedItems} />
        <p>
          <strong>{D.workedConclusion}</strong>
        </p>
      </div>

      <Callout title={D.compareLead}>
        <Bullets items={D.compareItems} />
        <p>{D.compareClosing}</p>
      </Callout>

      <h4>نشاط تفاعلي: قارن بين الأبواب الثلاثة الأولى</h4>
      <p className="morph4-muted">
        هذه الأفعال الأربعة كلها مفتوحة العين في الماضي (<bdi>فَعَلَ</bdi>)؛ راقب حركة عين المضارع وحدّد الباب الصحيح:
      </p>
      <div className="morph4-grid">
        {C.firstThreeLab.map((item, index) => (
          <FirstThreeCompareCard key={item.id} item={item} number={index + 1} />
        ))}
      </div>
    </>
  )
}

/* ================================================================== *
 * الخطوة ٨: الباب الرابع (فَعِلَ — يَفْعَلُ)
 * ================================================================== */

function DoorFourStep() {
  const D = C.doorFour
  return (
    <>
      <DoorBanner
        doorOrder={D.doorOrder}
        weight={D.weight}
        pastVowel={D.pastVowel}
        presentVowel={D.presentVowel}
      />
      <p>{D.rule}</p>

      <h4>أمثلة الباب الرابع:</h4>
      <DoorExamplesTable caption="أمثلة الباب الرابع: فَعِلَ — يَفْعَلُ" rows={D.examples} />

      <p>{D.note}</p>
      <div className="morph4-example">
        <h4>{D.workedLead}</h4>
        <Bullets items={D.workedItems} />
        <p>{D.workedPastConclusion}</p>
        <p>{D.workedPresentConclusion}</p>
        <p>
          <strong>{D.workedFinal}</strong>
        </p>
      </div>

      <Clarification>
        <p>{D.additionalVerifiedNote}</p>
      </Clarification>
    </>
  )
}

/* ================================================================== *
 * الخطوة ٩: الباب الخامس (فَعِلَ — يَفْعِلُ)
 * ================================================================== */

function DoorFiveStep() {
  const D = C.doorFive
  return (
    <>
      <DoorBanner
        doorOrder={D.doorOrder}
        weight={D.weight}
        pastVowel={D.pastVowel}
        presentVowel={D.presentVowel}
      />
      <p>{D.rule}</p>

      <p>{D.examplesLead}</p>
      <Bullets items={D.examplesList} />

      <DoorExamplesTable caption="أمثلة الباب الخامس: فَعِلَ — يَفْعِلُ" rows={D.examples} />

      <div className="morph4-example">
        <p>
          <strong>{D.foundationNote}</strong>
        </p>
        <Bullets items={D.workedItems} />
      </div>

      <Clarification>
        <p>{D.weakVerbClarification}</p>
      </Clarification>

      <Callout title={D.compareLead}>
        <Bullets items={D.compareItems} />
        <p>
          <strong>{D.compareClosing}</strong>
        </p>
      </Callout>
    </>
  )
}

/* ================================================================== *
 * الخطوة ١٠: الباب السادس (فَعُلَ — يَفْعُلُ)
 * ================================================================== */

function DoorSixStep() {
  const D = C.doorSix
  return (
    <>
      <DoorBanner
        doorOrder={D.doorOrder}
        weight={D.weight}
        pastVowel={D.pastVowel}
        presentVowel={D.presentVowel}
      />
      <p>{D.rule}</p>

      <h4>أمثلة الباب السادس:</h4>
      <DoorExamplesTable caption="أمثلة الباب السادس: فَعُلَ — يَفْعُلُ" rows={D.examples} />

      <p>{D.meaningNote}</p>
      <Callout title="انتبه">
        <p>{D.cautionNote}</p>
      </Callout>

      <div className="morph4-example">
        <h4>{D.workedLead}</h4>
        <Bullets items={D.workedItems} />
        <p>
          <strong>{D.workedConclusion}</strong>
        </p>
      </div>
    </>
  )
}

/* ================================================================== *
 * الخطوة ١١: مختبر تصنيف الأفعال في الأبواب الستة
 * ================================================================== */

function DoorsClassifyCard({ item, number }: { item: C.DoorsClassifyLabItem; number: number }) {
  const [weight, setWeight] = useState('')
  const [door, setDoor] = useState('')
  const [checked, setChecked] = useState(false)

  const weightOk = weight === item.weight
  const doorOk = door === item.doorOrder
  const allOk = weightOk && doorOk

  return (
    <article className="morph4-item" data-testid={`doors-classify-${item.id}`}>
      <p className="morph4-item__title">
        <bdi>{C.arabicDigits(number)}</bdi>.{' '}
        <bdi className="morph4-word">
          {item.past} — {item.present}
        </bdi>
      </p>
      <p className="morph4-muted">
        عين الفعل: <strong>{item.aynLetter}</strong>
      </p>
      <div className="morph4-fields">
        <label className="morph4-field">
          <span className="morph4-field__label">الوزن الصرفي</span>
          <select
            value={weight}
            aria-label={`الوزن الصرفي لـ ${item.past}`}
            onChange={(event) => {
              setWeight(event.target.value)
              setChecked(false)
            }}
          >
            <option value="">اختر الوزن</option>
            {C.SIX_WEIGHTS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
        <label className="morph4-field">
          <span className="morph4-field__label">رقم الباب</span>
          <select
            value={door}
            aria-label={`رقم الباب لـ ${item.past}`}
            onChange={(event) => {
              setDoor(event.target.value)
              setChecked(false)
            }}
          >
            <option value="">اختر الباب</option>
            {C.DOOR_NAMES.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="morph4-item__actions">
        <button
          type="button"
          className="button button--secondary"
          disabled={!weight || !door}
          onClick={() => setChecked(true)}
        >
          تحقق من التصنيف
        </button>
      </div>
      {checked && (
        <Feedback ok={allOk}>
          <p>
            <strong>
              {allOk
                ? 'تصنيف صحيح.'
                : `الصواب: الوزن «${item.weight}» — الباب ${item.doorOrder}.`}
            </strong>
          </p>
          <p className="morph4-muted">{item.explanation}</p>
        </Feedback>
      )}
    </article>
  )
}

function DoorsClassifyLabStep() {
  return (
    <>
      <p>
        بعد أن درستَ الأبواب الستة بالتفصيل، صنّف كل فعل من الأفعال الآتية باختيار وزنه الصرفي ورقم بابه، ثم اضغط
        «تحقق من التصنيف»:
      </p>
      <div className="morph4-grid">
        {C.doorsClassifyLab.map((item, index) => (
          <DoorsClassifyCard key={item.id} item={item} number={index + 1} />
        ))}
      </div>
    </>
  )
}

/* ================================================================== *
 * الخطوة ١٢: رابعًا — كيف تحفظ الأبواب الستة بسهولة؟ (حيلة الحفظ)
 * ================================================================== */

function MemorizeStep() {
  const M = C.memorizeSection
  const [selectedGroup, setSelectedGroup] = useState(0)

  return (
    <>
      <p>{M.lead}</p>
      <div className="morph4-table-wrap">
        <table className="morph4-table">
          <caption className="morph4-caption">جدول حفظ الأبواب الستة مع المثال النموذجي لكل باب</caption>
          <thead>
            <tr>
              <th scope="col">الباب</th>
              <th scope="col">الماضي</th>
              <th scope="col">المضارع</th>
              <th scope="col">مثال للحفظ</th>
            </tr>
          </thead>
          <tbody>
            {M.table.map((row) => (
              <tr key={row.doorNum}>
                <td>
                  <bdi>{C.arabicDigits(row.doorNum)}</bdi>
                </td>
                <td>
                  <bdi className="morph4-weight">{row.past}</bdi>
                </td>
                <td>
                  <bdi className="morph4-weight">{row.present}</bdi>
                </td>
                <td>
                  <bdi className="morph4-word">{row.example}</bdi>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>{M.captionNote}</p>

      <h4>{M.trickHeading}</h4>
      <p>{M.trickLead}</p>
      <Bullets items={M.groups.map((group) => group.text)} />

      <div className="morph4-example" data-testid="memorize-groups-explorer">
        <h4>استكشف المجموعات الثلاث لحفظ الأبواب (٣ + ٢ + ١ = ٦):</h4>
        <div className="morph4-item__actions" role="tablist" aria-label="مجموعات حفظ الأبواب الستة">
          {M.groups.map((group, idx) => (
            <button
              key={group.title}
              type="button"
              role="tab"
              aria-selected={selectedGroup === idx}
              className={selectedGroup === idx ? 'button button--primary' : 'button button--secondary'}
              onClick={() => setSelectedGroup(idx)}
            >
              {group.title}: <bdi>{group.pastWeight}</bdi> ({group.countLabel})
            </button>
          ))}
        </div>
        <div className="morph4-card morph4-card--gold" style={{ marginBlockStart: '0.8rem' }}>
          <p>
            <strong>{M.groups[selectedGroup].title}</strong> — وزن الماضي:{' '}
            <bdi className="morph4-weight">{M.groups[selectedGroup].pastWeight}</bdi> (حركة العين:{' '}
            <VowelBadge vowel={M.groups[selectedGroup].pastVowel} />)
          </p>
          <p>{M.groups[selectedGroup].text}</p>
          <Bullets items={M.groups[selectedGroup].doors} />
        </div>
      </div>

      <p>{M.orderLead}</p>
      <Bullets items={M.orderSummary} />
      <Golden text={M.totalFormula} />
    </>
  )
}

/* ================================================================== *
 * الخطوة ١٣: خامسًا — كيف أستخرج وزن الفعل بنفسي؟
 * ================================================================== */

function ExtractStepsStep() {
  const E = C.extractSection
  return (
    <>
      <p>{E.lead}</p>
      <ol className="morph4-steps">
        {E.steps.map((s) => (
          <li key={s.n} className="morph4-steps__item">
            <span className="morph4-steps__num" aria-hidden="true">
              <bdi>{C.arabicDigits(s.n)}</bdi>
            </span>
            <div>
              <strong>{s.title}</strong>
              <p>{s.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="morph4-compare">
        <article className="morph4-example">
          <h4>{E.secondExample.heading}</h4>
          <ol className="morph4-list morph4-list--numbered">
            {E.secondExample.points.map((pt) => (
              <li key={pt}>{pt}</li>
            ))}
          </ol>
        </article>
        <article className="morph4-example">
          <h4>{E.thirdExample.heading}</h4>
          <ol className="morph4-list morph4-list--numbered">
            {E.thirdExample.points.map((pt) => (
              <li key={pt}>{pt}</li>
            ))}
          </ol>
        </article>
      </div>

      <Callout title="تنبيه مهم">
        <p>{E.weakCaution}</p>
      </Callout>
    </>
  )
}

/* ================================================================== *
 * الخطوة ١٤: مختبر تطبيق خطوات استخراج الوزن الصرفي بالتدريج
 * ================================================================== */

function ExtractLabCard({ item, number }: { item: C.ExtractLabItem; number: number }) {
  const [ayn, setAyn] = useState('')
  const [pastV, setPastV] = useState('')
  const [presentV, setPresentV] = useState('')
  const [weight, setWeight] = useState('')
  const [door, setDoor] = useState('')
  const [checked, setChecked] = useState(false)

  const ok =
    ayn === item.aynLetter &&
    pastV === item.pastVowel &&
    presentV === item.presentVowel &&
    weight === item.weight &&
    door === item.doorOrder

  return (
    <article className="morph4-item" data-testid={`extract-lab-${item.id}`}>
      <p className="morph4-item__title">
        <bdi>{C.arabicDigits(number)}</bdi>. الخطوة ١ (الماضي والمضارع):{' '}
        <bdi className="morph4-word">{item.verbPair}</bdi>
      </p>
      <div className="morph4-fields">
        <label className="morph4-field">
          <span className="morph4-field__label">الخطوة ٢: حدّد عين الفعل</span>
          <select
            value={ayn}
            aria-label={`حدّد عين الفعل في ${item.past}`}
            onChange={(e) => {
              setAyn(e.target.value)
              setChecked(false)
            }}
          >
            <option value="">اختر الحرف</option>
            {item.letterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
        <label className="morph4-field">
          <span className="morph4-field__label">الخطوة ٣ (أ): حركة عين الماضي</span>
          <select
            value={pastV}
            aria-label={`حركة عين الماضي في ${item.past}`}
            onChange={(e) => {
              setPastV(e.target.value)
              setChecked(false)
            }}
          >
            <option value="">اختر الحركة</option>
            {C.VOWEL_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
        <label className="morph4-field">
          <span className="morph4-field__label">الخطوة ٣ (ب): حركة عين المضارع</span>
          <select
            value={presentV}
            aria-label={`حركة عين المضارع في ${item.present}`}
            onChange={(e) => {
              setPresentV(e.target.value)
              setChecked(false)
            }}
          >
            <option value="">اختر الحركة</option>
            {C.VOWEL_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
        <label className="morph4-field">
          <span className="morph4-field__label">الخطوة ٤ (أ): الوزن الصرفي</span>
          <select
            value={weight}
            aria-label={`الوزن الصرفي لـ ${item.past}`}
            onChange={(e) => {
              setWeight(e.target.value)
              setChecked(false)
            }}
          >
            <option value="">اختر الوزن</option>
            {C.SIX_WEIGHTS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
        <label className="morph4-field">
          <span className="morph4-field__label">الخطوة ٤ (ب): رقم الباب</span>
          <select
            value={door}
            aria-label={`رقم الباب لـ ${item.past}`}
            onChange={(e) => {
              setDoor(e.target.value)
              setChecked(false)
            }}
          >
            <option value="">اختر الباب</option>
            {C.DOOR_NAMES.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="morph4-item__actions">
        <button
          type="button"
          className="button button--secondary"
          disabled={!ayn || !pastV || !presentV || !weight || !door}
          onClick={() => setChecked(true)}
        >
          تحقق من الخطوات الأربع
        </button>
      </div>
      {checked && (
        <Feedback ok={ok} testId={`extract-lab-${item.id}-feedback`}>
          <p>
            <strong>{ok ? 'تطبيق متقن للخطوات الأربع.' : 'راجع إحدى الخطوات الأربع.'}</strong>
          </p>
          <p className="morph4-muted">{item.explanation}</p>
        </Feedback>
      )}
    </article>
  )
}

function ExtractLabStep() {
  return (
    <>
      <p>
        طبّق الخطوات الأربع بنفسك على هذه الأفعال الثلاثة بالتدريج: حدّد عين الفعل، ثم حركتها في الماضي والمضارع، ثم
        استنتج الوزن والباب:
      </p>
      <div className="morph4-grid">
        {C.extractLab.map((item, index) => (
          <ExtractLabCard key={item.id} item={item} number={index + 1} />
        ))}
      </div>
    </>
  )
}

/* ================================================================== *
 * الخطوة ١٥: سادسًا — هل يمكنني معرفة المضارع من الماضي وحده؟
 * ================================================================== */

function PastVsBothCard({ item, number }: { item: C.PastVsBothLabItem; number: number }) {
  const [picked, setPicked] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)
  const ok = picked === item.answer

  return (
    <article className="morph4-item" data-testid={`past-vs-both-${item.id}`}>
      <p className="morph4-item__title">
        <bdi>{C.arabicDigits(number)}</bdi>. {item.prompt}
      </p>
      <fieldset className="morph4-options morph4-options--stacked">
        <legend className="morph4-sr">{item.prompt}</legend>
        {item.options.map((opt) => (
          <label key={opt} className="morph4-option">
            <input
              type="radio"
              name={`pvb-${item.id}`}
              value={opt}
              checked={picked === opt}
              onChange={() => {
                setPicked(opt)
                setChecked(false)
              }}
            />
            <span>{opt}</span>
          </label>
        ))}
      </fieldset>
      <div className="morph4-item__actions">
        <button
          type="button"
          className="button button--secondary"
          disabled={picked === null}
          onClick={() => setChecked(true)}
        >
          تحقق من الإجابة
        </button>
      </div>
      {checked && (
        <Feedback ok={ok}>
          <p>
            <strong>{ok ? 'إجابة صحيحة.' : `الإجابة الصحيحة: ${item.answer}`}</strong>
          </p>
          <p className="morph4-muted">{item.explanation}</p>
        </Feedback>
      )}
    </article>
  )
}

function PastAloneStep() {
  const P = C.pastAloneSection
  return (
    <>
      <p>
        <strong>{P.emphasis}</strong>
      </p>
      <p>{P.rule}</p>
      <p>{P.exampleLead}</p>
      <Bullets items={P.examples} />
      <p>{P.observation}</p>
      <Bullets items={P.differences} />
      <Callout title="قاعدة عملية">
        <p>{P.advice}</p>
        <p>
          <strong>{P.closing}</strong>
        </p>
      </Callout>

      <h4>نشاط تفاعلي: الفرق بين معرفة الماضي وحده ومعرفة الماضي والمضارع معًا</h4>
      <div className="morph4-grid">
        {C.pastVsBothLab.map((item, index) => (
          <PastVsBothCard key={item.id} item={item} number={index + 1} />
        ))}
      </div>
    </>
  )
}

/* ================================================================== *
 * الخطوة ١٦: سابعًا (١) — التدريب الأول: حدّد الباب الصرفي (٦ أسئلة)
 * ================================================================== */

function TrainingOneStep() {
  const T = C.trainingOne
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  function resetTraining() {
    setAnswers({})
    setChecked({})
  }

  return (
    <>
      <h4>{T.heading}</h4>
      <p>{T.instruction}</p>
      <div className="morph4-grid" data-testid="morph4-training-one">
        {T.items.map((item) => {
          const picked = answers[item.id]
          const isChecked = Boolean(checked[item.id])
          const isCorrect = picked === item.answer

          return (
            <article key={item.id} className="morph4-item" data-testid={`train1-${item.id}`}>
              <p className="morph4-item__title">
                <bdi>{C.arabicDigits(item.number)}</bdi>.{' '}
                <bdi className="morph4-word">{item.verbPair}</bdi>
              </p>
              <fieldset className="morph4-options morph4-options--stacked">
                <legend className="morph4-sr">اختر الوزن الصحيح لـ {item.verbPair}</legend>
                {item.options.map((option) => (
                  <label key={option} className="morph4-option">
                    <input
                      type="radio"
                      name={`train1-${item.id}`}
                      value={option}
                      checked={picked === option}
                      onChange={() => {
                        setAnswers((curr) => ({ ...curr, [item.id]: option }))
                        setChecked((curr) => ({ ...curr, [item.id]: false }))
                      }}
                    />
                    <bdi className="morph4-weight">{option}</bdi>
                  </label>
                ))}
              </fieldset>
              <div className="morph4-item__actions">
                <button
                  type="button"
                  className="button button--secondary"
                  disabled={picked === undefined}
                  onClick={() => setChecked((curr) => ({ ...curr, [item.id]: true }))}
                >
                  تحقق من الإجابة
                </button>
              </div>
              {isChecked && (
                <Feedback ok={isCorrect} testId={`train1-${item.id}-feedback`}>
                  <p>
                    <strong>
                      {isCorrect ? 'إجابة صحيحة.' : 'إجابة غير صحيحة.'}
                    </strong>{' '}
                    {!isCorrect && (
                      <>
                        الوزن الصحيح: <bdi className="morph4-weight">{item.answer}</bdi> (الباب {item.doorOrder})
                      </>
                    )}
                  </p>
                  <p className="morph4-muted">{item.explanation}</p>
                </Feedback>
              )}
            </article>
          )
        })}
      </div>
      <div className="morph4-item__actions">
        <button
          type="button"
          className="button button--secondary"
          onClick={resetTraining}
          data-testid="train1-retry"
        >
          {T.retryLabel}
        </button>
      </div>
    </>
  )
}

/* ================================================================== *
 * الخطوة ١٧: سابعًا (٢) — التدريب الثاني: أكمل الجدول (٦ أسئلة)
 * ================================================================== */

function TrainingTwoStep() {
  const T = C.trainingTwo
  const [weights, setWeights] = useState<Record<string, string>>({})
  const [doors, setDoors] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  function resetTraining() {
    setWeights({})
    setDoors({})
    setChecked({})
  }

  return (
    <>
      <h4>{T.heading}</h4>
      <p>{T.instruction}</p>
      <div className="morph4-grid" data-testid="morph4-training-two">
        {T.items.map((item) => {
          const pickedWeight = weights[item.id] ?? ''
          const pickedDoor = doors[item.id] ?? ''
          const isChecked = Boolean(checked[item.id])
          const weightOk = pickedWeight === item.weightAnswer
          const doorOk = pickedDoor === item.doorAnswer
          const allOk = weightOk && doorOk

          return (
            <article key={item.id} className="morph4-item" data-testid={`train2-${item.id}`}>
              <p className="morph4-item__title">
                <bdi>{C.arabicDigits(item.number)}</bdi>.{' '}
                <bdi className="morph4-word">{item.verbPair}</bdi>
              </p>
              <div className="morph4-fields">
                <label className="morph4-field">
                  <span className="morph4-field__label">الوزن الصرفي</span>
                  <select
                    value={pickedWeight}
                    aria-label={`الوزن الصرفي لـ ${item.verbPair}`}
                    onChange={(event) => {
                      setWeights((curr) => ({ ...curr, [item.id]: event.target.value }))
                      setChecked((curr) => ({ ...curr, [item.id]: false }))
                    }}
                  >
                    <option value="">اختر الوزن الصرفي</option>
                    {item.weightOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="morph4-field">
                  <span className="morph4-field__label">رقم الباب</span>
                  <select
                    value={pickedDoor}
                    aria-label={`رقم الباب لـ ${item.verbPair}`}
                    onChange={(event) => {
                      setDoors((curr) => ({ ...curr, [item.id]: event.target.value }))
                      setChecked((curr) => ({ ...curr, [item.id]: false }))
                    }}
                  >
                    <option value="">اختر رقم الباب</option>
                    {item.doorOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="morph4-item__actions">
                <button
                  type="button"
                  className="button button--secondary"
                  disabled={!pickedWeight || !pickedDoor}
                  onClick={() => setChecked((curr) => ({ ...curr, [item.id]: true }))}
                >
                  تحقق من الإجابة
                </button>
              </div>
              {isChecked && (
                <Feedback ok={allOk} testId={`train2-${item.id}-feedback`}>
                  <p>
                    <strong>
                      {allOk
                        ? 'إجابة صحيحة.'
                        : `الصواب: الوزن الصرفي «${item.weightAnswer}» — رقم الباب: «${item.doorAnswer}».`}
                    </strong>
                  </p>
                  <p className="morph4-muted">{item.explanation}</p>
                </Feedback>
              )}
            </article>
          )
        })}
      </div>
      <div className="morph4-item__actions">
        <button
          type="button"
          className="button button--secondary"
          onClick={resetTraining}
          data-testid="train2-retry"
        >
          {T.retryLabel}
        </button>
      </div>
    </>
  )
}

/* ================================================================== *
 * الخطوة ١٨: ثامنًا — خلاصة الدرس
 * ================================================================== */

function SummaryStep() {
  const S = C.summarySection
  return (
    <>
      <p>{S.lead}</p>
      <div className="morph4-table-wrap">
        <table className="morph4-table" data-testid="summary-table">
          <caption className="morph4-caption">جدول خلاصة الأبواب الستة للفعل الثلاثي المجرّد</caption>
          <thead>
            <tr>
              <th scope="col">حركة عين الماضي</th>
              <th scope="col">حركة عين المضارع</th>
              <th scope="col">الوزن</th>
              <th scope="col">الباب</th>
            </tr>
          </thead>
          <tbody>
            {S.table.map((row) => (
              <tr key={row.weight}>
                <td>
                  <VowelBadge vowel={row.pastVowel} />
                </td>
                <td>
                  <VowelBadge vowel={row.presentVowel} />
                </td>
                <td>
                  <bdi className="morph4-weight">{row.weight}</bdi>
                </td>
                <td>الباب {row.doorOrder}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p>{S.pointsLead}</p>
      <ol className="morph4-steps">
        {S.points.map((point, idx) => (
          <li key={point} className="morph4-steps__item">
            <span className="morph4-steps__num" aria-hidden="true">
              <bdi>{C.arabicDigits(idx + 1)}</bdi>
            </span>
            <div>
              <p>
                <strong>{point}</strong>
              </p>
            </div>
          </li>
        ))}
      </ol>

      <Callout title="تصحيح للتدقيق">
        <p>{S.auditNote}</p>
      </Callout>
    </>
  )
}

/* ================================================================== *
 * الخطوة ١٩: تاسعًا — ما الدرس القادم؟
 * ================================================================== */

function NextLessonStep() {
  const N = C.nextLessonSection
  return (
    <>
      <p>{N.lead}</p>
      <p className="morph4-big">{N.title}</p>
      <p>{N.bodyLead}</p>
      <Bullets items={N.examples} />
      <p>{N.closing}</p>
    </>
  )
}

/* ================================================================== *
 * الاختبار: التسليم، الحلول، ومنطقة المعلم
 * ================================================================== */

function SubmitStep({ engine }: { engine: TestEngine }) {
  const answered = answeredCount(C.testDefinition.pages.flatMap((page) => page.questions), engine.answers)
  const total = C.testDefinition.pages.flatMap((page) => page.questions).length
  const { finalResult, allPagesChecked } = engine

  return (
    <section className="morph4-submit" aria-labelledby="morph4-submit-title" data-testid="morph4-submit">
      <h3 id="morph4-submit-title">تسليم الاختبار والنتيجة</h3>
      <p>
        أجبت عن <bdi>{C.arabicDigits(answered)}</bdi> من <bdi>{C.arabicDigits(total)}</bdi> سؤالًا.
      </p>
      {!allPagesChecked ? (
        <p>تحقّق من كل صفحة أولًا («تحقّق من الإجابات» في نهاية كل صفحة) لتظهر النتيجة النهائية.</p>
      ) : (
        <div role="status">
          <p className="morph4-score">
            النتيجة: <bdi>{C.arabicDigits(finalResult.correct)}</bdi> من <bdi>{C.arabicDigits(finalResult.total)}</bdi>{' '}
            إجابة صحيحة
          </p>
          <ul className="morph4-counts">
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
      )}
      <button type="button" className="button button--secondary" onClick={engine.resetTest}>
        إعادة الاختبار
      </button>
      <p className="morph4-muted">
        «إعادة الاختبار» تمسح كل الإجابات ونتائج الصفحات، فتُقفَل النتيجة والحلول من جديد حتى تتحقق من كل صفحة مرة
        أخرى.
      </p>
    </section>
  )
}

function TeacherArea() {
  return (
    <TeacherSpace password={COURSE_TEACHER_PASSWORD}>
      <div className="teacher-material teacher-material--morphology4">
        <p className="morph4-keys__note">{C.teacherKeyHeader}</p>

        <h3>أ. الحلول التفصيلية لاختبار الدرس (٢٠ سؤالًا)</h3>
        <SolutionsArea
          test={testDefinition}
          mode="teacher"
          title="الحلول التفصيلية لاختبار الدرس الرابع: أوزان الفعل الثلاثي المجرّد"
          eyebrow="منطقة المعلم"
        />

        <h3>ب. حل التدريب الأول: حدّد الباب الصرفي (٦ أسئلة)</h3>
        <ol className="morph4-keys">
          {C.trainingOne.items.map((item) => (
            <li key={item.id}>
              <strong>
                <bdi>{item.verbPair}</bdi>:
              </strong>{' '}
              الوزن الصحيح: <bdi className="morph4-weight">{item.answer}</bdi> — الباب {item.doorOrder} (عين الفعل:{' '}
              {item.aynLetter}، حركتها في الماضي: {item.pastVowel}، وفي المضارع: {item.presentVowel}).{' '}
              <span>{item.explanation}</span>
            </li>
          ))}
        </ol>

        <h3>ج. حل التدريب الثاني: أكمل الجدول (٦ أسئلة)</h3>
        <ol className="morph4-keys">
          {C.trainingTwo.items.map((item) => (
            <li key={item.id}>
              <strong>
                <bdi>{item.verbPair}</bdi>:
              </strong>{' '}
              الوزن الصرفي: <bdi className="morph4-weight">{item.weightAnswer}</bdi> — رقم الباب: {item.doorAnswer} (عين
              الفعل: {item.aynLetter}، حركتها في الماضي: {item.pastVowel}، وفي المضارع: {item.presentVowel}).{' '}
              <span>{item.explanation}</span>
            </li>
          ))}
        </ol>

        <h3>د. سجل التدقيق العلمي وحسم التناقضات</h3>
        <ul className="morph4-list">
          {C.teacherAuditNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>

        <h3>هـ. أخطاء متوقعة عند الطلاب وكيفية معالجتها</h3>
        <ul className="morph4-list">
          {C.teacherMistakes.map((mistake) => (
            <li key={mistake}>{mistake}</li>
          ))}
        </ul>
      </div>
    </TeacherSpace>
  )
}

/* ================================================================== *
 * تجميع خطوات الدرس الرابع
 * ================================================================== */

export function LessonMorphologyFour({ onProgressChange, onFinish }: Props) {
  // المحرك المشترك يعيش فوق LessonFlow، فتبقى الإجابات والنتائج محفوظة عند التنقل بين الخطوات.
  const testEngine = useTestEngine(testDefinition)

  const testSteps = testDefinition.pages.map((page) =>
    step(`test-${page.id}`, page.title, 'الاختبار النهائي (٢٠ سؤالًا)', '📝', (
      <TestPageView page={page} engine={testEngine} questionTestIdPrefix="morph4-question" />
    )),
  )

  const steps: LessonStepDefinition[] = [
    step('intro', 'الدرس الرابع: أوزان الفعل الثلاثي المجرّد', 'التمهيد والمدخل', '🌷', <IntroStep />),
    step('mizan-concept', 'أولًا: ما المقصود بالوزن الصرفي؟', 'الوزن الصرفي وعين الفعل', '⚖️', <MizanConceptStep />),
    step('ayn-concept', 'ثانيًا (١): مفهوم عين الفعل وتحديدها', 'الوزن الصرفي وعين الفعل', '🎯', <AynConceptStep />),
    step(
      'six-doors-overview',
      'ثانيًا (٢): الجدول المرجعي للأبواب الستة',
      'الوزن الصرفي وعين الفعل',
      '📋',
      <SixDoorsOverviewStep />,
    ),

    step('door-1', 'ثالثًا (١): الباب الأول (فَعَلَ — يَفْعُلُ)', 'شرح الأبواب الستة', '1️⃣', <DoorOneStep />),
    step('door-2', 'ثالثًا (٢): الباب الثاني (فَعَلَ — يَفْعِلُ)', 'شرح الأبواب الستة', '2️⃣', <DoorTwoStep />),
    step('door-3', 'ثالثًا (٣): الباب الثالث (فَعَلَ — يَفْعَلُ)', 'شرح الأبواب الستة', '3️⃣', <DoorThreeStep />),
    step('door-4', 'ثالثًا (٤): الباب الرابع (فَعِلَ — يَفْعَلُ)', 'شرح الأبواب الستة', '4️⃣', <DoorFourStep />),
    step('door-5', 'ثالثًا (٥): الباب الخامس (فَعِلَ — يَفْعِلُ)', 'شرح الأبواب الستة', '5️⃣', <DoorFiveStep />),
    step('door-6', 'ثالثًا (٦): الباب السادس (فَعُلَ — يَفْعُلُ)', 'شرح الأبواب الستة', '6️⃣', <DoorSixStep />),
    step(
      'doors-classify-lab',
      'مختبر: تصنيف الأفعال في الأبواب الستة',
      'شرح الأبواب الستة',
      '🧪',
      <DoorsClassifyLabStep />,
    ),

    step('memorize-doors', 'رابعًا: كيف تحفظ الأبواب الستة بسهولة؟', 'الحفظ والاستخراج', '💡', <MemorizeStep />),
    step('extract-steps', 'خامسًا: كيف أستخرج وزن الفعل بنفسي؟', 'الحفظ والاستخراج', '🧭', <ExtractStepsStep />),
    step('extract-lab', 'مختبر: استخرج الوزن الصرفي خطوةً بخطوة', 'الحفظ والاستخراج', '🔎', <ExtractLabStep />),
    step(
      'past-alone',
      'سادسًا: هل يمكنني معرفة المضارع من الماضي وحده؟',
      'الحفظ والاستخراج',
      '❓',
      <PastAloneStep />,
    ),

    step('train-1', 'سابعًا (١): التدريب الأول — حدّد الباب الصرفي', 'التدريبات التطبيقية', '✍️', <TrainingOneStep />),
    step('train-2', 'سابعًا (٢): التدريب الثاني — أكمل الجدول', 'التدريبات التطبيقية', '📊', <TrainingTwoStep />),

    step('summary', 'ثامنًا: خلاصة الدرس', 'الخلاصة وما بعد الدرس', '📌', <SummaryStep />),
    step('next-lesson', 'تاسعًا: ما الدرس القادم؟', 'الخلاصة وما بعد الدرس', '➡️', <NextLessonStep />),

    ...testSteps,
    step('submit', 'تسليم الاختبار والنتيجة', 'الاختبار النهائي (٢٠ سؤالًا)', '✅', <SubmitStep engine={testEngine} />),
    step(
      'solutions',
      'حلول الاختبار',
      'الاختبار النهائي (٢٠ سؤالًا)',
      '📗',
      <SolutionsArea
        test={testDefinition}
        engine={testEngine}
        testId="morphology4-solutions"
        title="حلول اختبار الدرس الرابع: أوزان الفعل الثلاثي المجرّد"
      />,
    ),

    step('teacher', 'منطقة خاصة بالمعلم', 'منطقة المعلم', '🔐', <TeacherArea />),
  ]

  return (
    <LessonFlow
      steps={steps}
      onProgressChange={onProgressChange}
      onFinish={onFinish}
      lessonTitle="أوزان الفعل الثلاثي المجرّد"
      lessonNumber="٤"
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
