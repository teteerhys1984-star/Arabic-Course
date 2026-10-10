import { useState, type ReactNode } from 'react'
import { LessonFlow, type LessonStepDefinition } from '../shared/components/LessonFlow'
import { TeacherSpace } from '../shared/teacher/TeacherSpace'
import { COURSE_TEACHER_PASSWORD } from '../shared/teacher/teacherPassword'
import * as C from './morphology-lesson-03/content'
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
 * عناصر مشتركة داخل الدرس
 * ================================================================== */

function Callout({ children, title = 'قاعدة' }: { children: ReactNode; title?: string }) {
  return (
    <aside className="morph3-callout">
      <strong>{title}</strong>
      <div>{children}</div>
    </aside>
  )
}

/** توضيح مصنّف بوضوح على أنه إضافة من المنصة، لا نص من المصدر. */
function Clarification({ children }: { children: ReactNode }) {
  return (
    <aside className="morph3-clarification">
      <span className="morph3-clarification__badge">توضيح تعليمي من المنصة</span>
      <div>{children}</div>
    </aside>
  )
}

function Golden({ text }: { text: string }) {
  return (
    <div className="morph3-golden">
      <span aria-hidden="true">⭐</span>
      <p>{text}</p>
    </div>
  )
}

function Bullets({ items }: { items: readonly string[] }) {
  return (
    <ul className="morph3-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

function Chips({ items }: { items: readonly string[] }) {
  return (
    <div className="morph3-chips">
      {items.map((item) => (
        <bdi key={item}>{item}</bdi>
      ))}
    </div>
  )
}

/** حروف الكلمة (الأصلية والزائدة) بألوان دلالية: الأصلية أخضر، والزائدة ذهبي. */
function Tiles({ tiles }: { tiles: ReadonlyArray<{ char: string; extra: boolean; label?: string }> }) {
  return (
    <div className="morph3-tiles" role="list" aria-label="الحروف الصرفية">
      {tiles.map((tile, index) => (
        <span
          key={`${tile.char}-${index}`}
          role="listitem"
          className={tile.extra ? 'morph3-tile morph3-tile--extra' : 'morph3-tile morph3-tile--orig'}
        >
          <span className="morph3-tile__char">{tile.char}</span>
          <small>{tile.label ?? (tile.extra ? 'زائد' : 'أصلي')}</small>
        </span>
      ))}
    </div>
  )
}

function MappingTable({ rows }: { rows: readonly C.MappingRow[] }) {
  return (
    <table className="morph3-table">
      <caption className="morph3-caption">مقابلة حروف الكلمة بحروف الميزان</caption>
      <thead>
        <tr>
          <th scope="col">حرف الكلمة</th>
          <th scope="col">حرف الميزان</th>
          <th scope="col">الحالة</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={`${row.letter}-${index}`} className={row.extra ? 'morph3-row--extra' : undefined}>
            <td>
              <bdi>{row.letter}</bdi>
            </td>
            <td>
              <bdi>{row.pattern}</bdi>
            </td>
            <td>{row.extra ? <span className="morph3-tag">زائد</span> : 'أصلي'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/** Feedback block shown only after the student presses the check button. */
function Feedback({ ok, children, testId }: { ok: boolean; children: ReactNode; testId?: string }) {
  return (
    <div
      className={ok ? 'morph3-feedback morph3-feedback--ok' : 'morph3-feedback morph3-feedback--no'}
      role="status"
      data-testid={testId}
    >
      {children}
    </div>
  )
}

/* ================================================================== *
 * الخطوات: المقدمة والمدخل
 * ================================================================== */

function IntroStep() {
  return (
    <>
      <div className="morph3-hero">
        <span>{C.lessonHeader.section}</span>
        <span>الدرس الثالث</span>
        <span>{C.arabicDigits(10)} أقسام</span>
        <span>{C.arabicDigits(3)} تدريبات</span>
        <span>اختبار من {C.arabicDigits(20)} سؤالًا</span>
      </div>
      <p className="morph3-big">{C.lessonHeader.title}</p>
      <p>
        <strong>الدرس السابق:</strong> {C.lessonHeader.prerequisite}
      </p>
      <Callout title="كيف تدرس هذا الدرس؟">
        <p>اقرأ نص كل خطوة، ثم جرّب النشاط الذي يليه مباشرة. ولا تنتقل إلى الاختبار قبل التدريبات الثلاثة.</p>
      </Callout>
      <h4>أقسام الدرس</h4>
      <ol className="morph3-list morph3-list--numbered">
        {C.sourceSections.map((section) => (
          <li key={section}>{section}</li>
        ))}
      </ol>
    </>
  )
}

function SarfStep() {
  return (
    <>
      <p>{C.sarfIntro.definition}</p>
      <p>{C.sarfIntro.lead}</p>
      <Chips items={C.sarfIntro.words} />
      <p>{C.sarfIntro.observation}</p>
      <p>{C.sarfIntro.topicsLead}</p>
      <Bullets items={C.sarfIntro.topics} />
      <p>{C.lessonHeader.introSentence}</p>
    </>
  )
}

/* ================================================================== *
 * الفعل المجرّد
 * ================================================================== */

function MujarradDefStep() {
  const example = C.mujarradDefinition.example
  return (
    <>
      <p>{C.mujarradDefinition.definition}</p>
      <p>{C.mujarradDefinition.originalLettersDefinition}</p>
      <div className="morph3-example">
        <p>خذ الفعل:</p>
        <p className="morph3-big">
          <bdi>{example.word}</bdi>
        </p>
        <p>يتكوّن من ثلاثة أحرف:</p>
        <Tiles tiles={example.letters.map((letter) => ({ char: letter, extra: false }))} />
        <p>{example.note}</p>
      </div>
      <p>{C.mujarradDefinition.tableLead}</p>
      <table className="morph3-table">
        <caption className="morph3-caption">الفعل وحروفه الأصلية ونوعه</caption>
        <thead>
          <tr>
            <th scope="col">الفعل</th>
            <th scope="col">حروفه الأصلية</th>
            <th scope="col">نوعه</th>
          </tr>
        </thead>
        <tbody>
          {C.mujarradDefinition.table.map((row) => (
            <tr key={row.verb}>
              <td>
                <bdi className="morph3-word">{row.verb}</bdi>
              </td>
              <td>{row.originals}</td>
              <td>{row.type}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Callout title="ملاحظة مهمة">
        <p>{C.mujarradDefinition.tableNote}</p>
      </Callout>
      <p className="morph3-muted">{C.mujarradDefinition.closing}</p>
    </>
  )
}

function MujarradTypesStep() {
  const T = C.mujarradTypes
  return (
    <>
      <p>{T.split[0]}</p>
      <Bullets items={T.split.slice(1)} />

      <h4>{T.triliteral.heading}</h4>
      <p>{T.triliteral.definition}</p>
      <Chips items={T.triliteral.examples} />
      <p>
        لنحلّل الفعل <bdi className="morph3-word">{T.triliteral.analysisWord}</bdi>:
      </p>
      <table className="morph3-table">
        <caption className="morph3-caption">تحليل «شَرِبَ»</caption>
        <thead>
          <tr>
            <th scope="col">الحرف</th>
            <th scope="col">وظيفته</th>
          </tr>
        </thead>
        <tbody>
          {T.triliteral.analysis.map((row) => (
            <tr key={row.letter}>
              <td>
                <bdi className="morph3-word">{row.letter}</bdi>
              </td>
              <td>{row.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>{T.triliteral.conclusion}</p>

      <h4>{T.quadriliteral.heading}</h4>
      <p>{T.quadriliteral.definition}</p>
      <Chips items={T.quadriliteral.examples} />
      <p>
        لنحلّل الفعل <bdi className="morph3-word">{T.quadriliteral.analysisWord}</bdi>:
      </p>
      <p className="morph3-split">
        <bdi>{T.quadriliteral.split}</bdi>
      </p>
      <p>{T.quadriliteral.conclusion}</p>
      <Callout title="انتبه إلى هذه القاعدة">
        <p>{T.quadriliteral.rule}</p>
      </Callout>
      <div className="morph3-compare" role="list">
        {T.quadriliteral.pairs.map((pair) => (
          <article key={pair.word} className="morph3-card" role="listitem">
            <bdi className="morph3-word">{pair.word}</bdi>
            <p>{pair.text}</p>
          </article>
        ))}
      </div>
      <p>{T.quadriliteral.akramWhy}</p>
      <p className="morph3-muted">{T.quadriliteral.closing}</p>
    </>
  )
}

/* ================================================================== *
 * الفعل المزيد
 * ================================================================== */

function MazeedDefStep() {
  const D = C.mazeedDefinition
  return (
    <>
      <p>{D.definition}</p>
      <p>{D.explanation}</p>
      <p>{D.lead}</p>
      <div className="morph3-compare" role="list">
        <article className="morph3-card" role="listitem">
          <bdi className="morph3-word">{D.plain}</bdi>
          <p>{D.plainText}</p>
        </article>
        <article className="morph3-card morph3-card--gold" role="listitem">
          <bdi className="morph3-word">{D.doubled}</bdi>
          <p>{D.doubledText}</p>
          <p>
            <strong>{D.doubledConclusion}</strong>
          </p>
        </article>
      </div>
      <p>{D.meaningLead}</p>
      <Bullets items={D.meanings} />
      <p>{D.meaningClosing}</p>
    </>
  )
}

function MazeedExamplesStep() {
  const E = C.mazeedExamples
  const X = C.mazeedExampleClosing
  return (
    <>
      <p>{E.lead}</p>
      <table className="morph3-table">
        <caption className="morph3-caption">الفعل المجرّد والفعل المزيد والزيادة</caption>
        <thead>
          <tr>
            <th scope="col">الفعل المجرّد</th>
            <th scope="col">الفعل المزيد</th>
            <th scope="col">الزيادة</th>
          </tr>
        </thead>
        <tbody>
          {E.rows.map((row) => (
            <tr key={`${row.base}-${row.mazeed}`}>
              <td>
                <bdi className="morph3-word">{row.base}</bdi>
              </td>
              <td>
                <bdi className="morph3-word">{row.mazeed}</bdi>
              </td>
              <td>{row.extra}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>{X.lead}</p>

      <h4>{X.questionTitle}</h4>
      <p>{X.answer}</p>
      <p>{X.rule}</p>
      <p>قارن بين:</p>
      <div className="morph3-compare" role="list">
        {X.compare.map((item) => (
          <article key={item.word} className="morph3-card" role="listitem">
            <bdi className="morph3-word">{item.word}</bdi>
            <p>{item.text}</p>
          </article>
        ))}
      </div>
      <Golden text={X.closing} />
    </>
  )
}

function OriginalLabCard({ item, number }: { item: C.OriginalLabItem; number: number }) {
  const [marks, setMarks] = useState<boolean[]>(() => item.letters.map(() => false))
  const [checked, setChecked] = useState(false)
  const correct = item.letters.every((letter, index) => marks[index] === letter.original)

  function toggle(index: number) {
    setMarks((current) => current.map((value, position) => (position === index ? !value : value)))
    setChecked(false)
  }

  return (
    <article className="morph3-item" data-testid={item.id}>
      <p className="morph3-item__title">
        <bdi>{C.arabicDigits(number)}</bdi>. علّم الحروف <strong>الأصلية</strong> في{' '}
        <bdi className="morph3-word">{item.word}</bdi>
      </p>
      <div className="morph3-letters" role="group" aria-label={`حروف ${item.word}`}>
        {item.letters.map((letter, index) => (
          <label
            key={`${letter.char}-${index}`}
            className={marks[index] ? 'morph3-letter morph3-letter--orig' : 'morph3-letter'}
          >
            <input type="checkbox" checked={marks[index]} onChange={() => toggle(index)} />
            <span className="morph3-letter__char">{letter.char}</span>
            <small>أصلي</small>
          </label>
        ))}
      </div>
      <div className="morph3-item__actions">
        <button type="button" className="button button--secondary" onClick={() => setChecked(true)}>
          تحقق من التحليل
        </button>
      </div>
      {checked && (
        <Feedback ok={correct}>
          <p>
            <strong>{correct ? 'تحليل صحيح.' : 'راجع تحليلك للحروف.'}</strong>
          </p>
          <Tiles tiles={item.letters.map((letter) => ({ char: letter.char, extra: !letter.original }))} />
          {item.base && (
            <p>
              أصل الكلمة: <bdi className="morph3-word">{item.base}</bdi>
            </p>
          )}
          <p className="morph3-muted">{item.reason}</p>
        </Feedback>
      )}
    </article>
  )
}

function OriginalLabStep() {
  return (
    <>
      <p>
        اعزل الحروف الأصلية عن الحروف الزائدة في كل كلمة، ثم اضغط «تحقق من التحليل». يظهر لك تصنيف كل حرف والسبب بعد
        محاولتك، لا قبلها.
      </p>
      <div className="morph3-grid">
        {C.originalLab.map((item, index) => (
          <OriginalLabCard key={item.id} item={item} number={index + 1} />
        ))}
      </div>
    </>
  )
}

function ShaddaLabCard({ item, number }: { item: C.ShaddaLabItem; number: number }) {
  const [picked, setPicked] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const correct = picked === item.letterCount
  const options = [3, 4, 5, 6]

  return (
    <article className="morph3-item" data-testid={item.id}>
      <p className="morph3-item__title">
        <bdi>{C.arabicDigits(number)}</bdi>. <bdi className="morph3-word">{item.word}</bdi>
      </p>
      <p className="morph3-muted">
        الرسم المكتوب: <bdi>{C.arabicDigits(item.writtenGlyphs)}</bdi> رسوم
        {item.hasShadda ? '، وفيها شدّة' : '، ولا شدّة فيها'}.
      </p>
      <fieldset className="morph3-options">
        <legend className="morph3-sr">كم حرفًا صرفيًّا في {item.word}؟</legend>
        {options.map((option) => (
          <label key={option} className="morph3-option">
            <input
              type="radio"
              name={`${item.id}-count`}
              value={option}
              checked={picked === option}
              onChange={() => {
                setPicked(option)
                setChecked(false)
              }}
            />
            <bdi>{C.arabicDigits(option)} حروف</bdi>
          </label>
        ))}
      </fieldset>
      <div className="morph3-item__actions">
        <button
          type="button"
          className="button button--secondary"
          onClick={() => setChecked(true)}
          disabled={picked === null}
        >
          تحقق من التحليل
        </button>
      </div>
      {checked && (
        <Feedback ok={correct}>
          <p>
            <strong>
              {correct ? 'عدد صحيح.' : 'ليس هذا العدد الصرفي.'} العدد الصرفي:{' '}
              <bdi>{C.arabicDigits(item.letterCount)}</bdi> حروف
            </strong>
          </p>
          <Tiles tiles={item.tiles} />
          <p className="morph3-muted">{item.explanation}</p>
        </Feedback>
      )}
    </article>
  )
}

function ShaddaLabStep() {
  return (
    <>
      <p>{C.shaddaIntro.point}</p>
      <p>
        قارن بين الكلمتين في كل زوج، وعُدّ الحروف <strong>الصرفية</strong> لا الرسوم المكتوبة:
      </p>
      <div className="morph3-compare" role="list">
        {C.shaddaIntro.pairs.map(([plain, doubled]) => (
          <article key={plain} className="morph3-card" role="listitem">
            <p>
              <bdi className="morph3-word">{plain}</bdi> ← <bdi className="morph3-word">{doubled}</bdi>
            </p>
          </article>
        ))}
      </div>
      <div className="morph3-grid">
        {C.shaddaLab.map((item, index) => (
          <ShaddaLabCard key={item.id} item={item} number={index + 1} />
        ))}
      </div>
    </>
  )
}

/* ================================================================== *
 * التمييز بين المجرّد والمزيد
 * ================================================================== */

function ClassifyStep() {
  const M = C.classifyMethod
  return (
    <>
      <p>{M.lead}</p>
      <ol className="morph3-steps">
        {M.steps.map((step) => (
          <li key={step.n} className="morph3-steps__item">
            <span className="morph3-steps__num" aria-hidden="true">
              <bdi>{C.arabicDigits(step.n)}</bdi>
            </span>
            <div>
              <strong>{step.title}</strong>
              <p>{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <p>{M.closing}</p>
      <p>{M.alefNote}</p>
    </>
  )
}

function ClassifyLabCard({ item, number }: { item: C.ClassifyLabItem; number: number }) {
  const [picked, setPicked] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)
  const correct = picked === item.answer

  return (
    <article className="morph3-item" data-testid={`classify-${item.id}`}>
      <p className="morph3-item__title">
        <bdi>{C.arabicDigits(number)}</bdi>. ما نوع الفعل <bdi className="morph3-word">{item.word}</bdi>؟
      </p>
      <fieldset className="morph3-options">
        <legend className="morph3-sr">اختر نوع {item.word}</legend>
        {C.CLASSIFY_OPTIONS.map((option) => (
          <label key={option} className="morph3-option">
            <input
              type="radio"
              name={`${item.id}-type`}
              value={option}
              checked={picked === option}
              onChange={() => {
                setPicked(option)
                setChecked(false)
              }}
            />
            <bdi>{option}</bdi>
          </label>
        ))}
      </fieldset>
      <div className="morph3-item__actions">
        <button
          type="button"
          className="button button--secondary"
          onClick={() => setChecked(true)}
          disabled={picked === null}
        >
          تحقق من الإجابة
        </button>
      </div>
      {checked && (
        <Feedback ok={correct}>
          <p>
            <strong>{correct ? 'تصنيف صحيح.' : 'ليس هذا هو التصنيف الصحيح.'}</strong>{' '}
            {!correct && (
              <>
                التصنيف الصحيح: <bdi>{item.answer}</bdi>
              </>
            )}
          </p>
          <p className="morph3-muted">{item.explanation}</p>
        </Feedback>
      )}
    </article>
  )
}

function ClassifyLabStep() {
  return (
    <>
      <p>
        اختر لكل فعل تصنيفه: ثلاثي مجرّد، أو رباعي مجرّد، أو ثلاثي مزيد. ثم اضغط «تحقق من الإجابة» لترى التفسير.
      </p>
      <div className="morph3-grid">
        {C.classifyLab.map((item, index) => (
          <ClassifyLabCard key={item.id} item={item} number={index + 1} />
        ))}
      </div>
    </>
  )
}

/* ================================================================== *
 * أنواع الفعل المزيد
 * ================================================================== */

function TypesOneStep() {
  const T = C.typesOne
  return (
    <>
      <h4>{T.heading}</h4>
      <p>{T.definition}</p>
      <p>أمثلة:</p>
      <table className="morph3-table">
        <caption className="morph3-caption">المزيد بحرف واحد</caption>
        <thead>
          <tr>
            <th scope="col">الفعل الأصلي</th>
            <th scope="col">الفعل المزيد</th>
            <th scope="col">الحرف الزائد</th>
          </tr>
        </thead>
        <tbody>
          {T.rows.map((row) => (
            <tr key={`${row.base}-${row.mazeed}`}>
              <td>
                <bdi className="morph3-word">{row.base}</bdi>
              </td>
              <td>
                <bdi className="morph3-word">{row.mazeed}</bdi>
              </td>
              <td>{row.extra}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Callout title="انتبه إلى «التضعيف»">
        <p>{T.note}</p>
      </Callout>
    </>
  )
}

function TypesTwoStep() {
  const T = C.typesTwo
  return (
    <>
      <h4>{T.heading}</h4>
      <p>{T.definition}</p>
      <table className="morph3-table">
        <caption className="morph3-caption">المزيد بحرفين</caption>
        <thead>
          <tr>
            <th scope="col">الفعل الأصلي</th>
            <th scope="col">الفعل المزيد</th>
            <th scope="col">الحرفان الزائدان</th>
          </tr>
        </thead>
        <tbody>
          {T.rows.map((row) => (
            <tr key={`${row.base}-${row.mazeed}`} className={row.caution ? 'morph3-row--caution' : undefined}>
              <td>
                <bdi className="morph3-word">{row.base}</bdi>
              </td>
              <td>
                <bdi className="morph3-word">{row.mazeed}</bdi>
                {row.caution && <span className="morph3-tag">ليس مثالًا رئيسيًّا</span>}
              </td>
              <td>{row.extra}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Callout title="تنبيه علمي مهم">
        <p>{T.caution}</p>
      </Callout>
      <p>{T.clearLead}</p>
      <div className="morph3-compare" role="list">
        {T.clearExamples.map((pair) => (
          <article key={pair.mazeed} className="morph3-card" role="listitem">
            <p>
              <bdi className="morph3-word">{pair.base}</bdi> ← <bdi className="morph3-word">{pair.mazeed}</bdi>
            </p>
          </article>
        ))}
      </div>
      <p>{T.note}</p>
    </>
  )
}

function TypesThreeStep() {
  const T = C.typesThree
  return (
    <>
      <h4>{T.heading}</h4>
      <p>{T.definition}</p>
      <p>{T.lead}</p>
      <table className="morph3-table">
        <caption className="morph3-caption">المزيد بثلاثة أحرف</caption>
        <thead>
          <tr>
            <th scope="col">الفعل الأصلي</th>
            <th scope="col">الفعل المزيد</th>
            <th scope="col">الحروف الزائدة</th>
          </tr>
        </thead>
        <tbody>
          {T.rows.map((row) => (
            <tr key={`${row.base}-${row.mazeed}`}>
              <td>
                <bdi className="morph3-word">{row.base}</bdi>
              </td>
              <td>
                <bdi className="morph3-word">{row.mazeed}</bdi>
              </td>
              <td>{row.extra}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h4>مثال محلول: «{T.worked.word}»</h4>
      <div className="morph3-example">
        <p>
          الحروف الأصلية: <bdi>{T.worked.originals}</bdi>
        </p>
        <p>
          الحروف الزائدة: <bdi>{T.worked.extras}</bdi>
        </p>
        <p>
          <strong>{T.worked.conclusion}</strong>
        </p>
      </div>
    </>
  )
}

/* ================================================================== *
 * الميزان الصرفي
 * ================================================================== */

function MizanStep() {
  const M = C.mizanIntro
  return (
    <>
      <p>{M.lead}</p>
      <table className="morph3-table">
        <caption className="morph3-caption">الفعل ووزنه الصرفي</caption>
        <thead>
          <tr>
            <th scope="col">الفعل</th>
            <th scope="col">وزنه الصرفي</th>
          </tr>
        </thead>
        <tbody>
          {M.table.map((row) => (
            <tr key={row.verb}>
              <td>
                <bdi className="morph3-word">{row.verb}</bdi>
              </td>
              <td>
                <bdi className="morph3-weight">{row.weight}</bdi>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>{M.observation}</p>
      <p>
        <strong>{M.akramLead}</strong>
      </p>
      <Bullets items={M.akramPoints} />
      <MappingTable
        rows={[
          { letter: 'أ', pattern: 'أ', extra: true },
          { letter: 'ك', pattern: 'ف' },
          { letter: 'ر', pattern: 'ع' },
          { letter: 'م', pattern: 'ل' },
        ]}
      />
      <p>{M.closing}</p>
    </>
  )
}

function WeightLabCard({ item, number }: { item: C.WeightLabItem; number: number }) {
  const [picked, setPicked] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)
  const correct = picked === item.weight

  return (
    <article className="morph3-item" data-testid={`weight-${item.id}`}>
      <p className="morph3-item__title">
        <bdi>{C.arabicDigits(number)}</bdi>. ما وزن <bdi className="morph3-word">{item.word}</bdi>؟
      </p>
      <fieldset className="morph3-options">
        <legend className="morph3-sr">اختر وزن {item.word}</legend>
        {item.options.map((option) => (
          <label key={option} className="morph3-option">
            <input
              type="radio"
              name={`${item.id}-weight`}
              value={option}
              checked={picked === option}
              onChange={() => {
                setPicked(option)
                setChecked(false)
              }}
            />
            <bdi className="morph3-weight">{option}</bdi>
          </label>
        ))}
      </fieldset>
      <div className="morph3-item__actions">
        <button
          type="button"
          className="button button--secondary"
          onClick={() => setChecked(true)}
          disabled={picked === null}
        >
          تحقق من الإجابة
        </button>
      </div>
      {checked && (
        <Feedback ok={correct}>
          <p>
            <strong>{correct ? 'وزن صحيح.' : 'ليس هو الوزن الصحيح.'}</strong>{' '}
            {!correct && (
              <>
                الوزن الصحيح: <bdi className="morph3-weight">{item.weight}</bdi>
              </>
            )}
          </p>
          <MappingTable rows={item.rows} />
          <p className="morph3-muted">{item.note}</p>
        </Feedback>
      )}
    </article>
  )
}

function WeightLabStep() {
  return (
    <>
      <p>
        اربط كل فعل بوزنه: اختر الوزن الصحيح، ثم تحقق لترى مقابلة حروف الكلمة بحروف الميزان، وأين تقع الزيادة.
      </p>
      <div className="morph3-grid">
        {C.weightLab.map((item, index) => (
          <WeightLabCard key={item.id} item={item} number={index + 1} />
        ))}
      </div>
    </>
  )
}

/* ================================================================== *
 * المعنى
 * ================================================================== */

function MeaningStep() {
  return (
    <>
      <p>{C.meaningIntro.lead}</p>
      <Callout title="تنبيه">
        <p>{C.meaningIntro.caution}</p>
      </Callout>
      <p>لنأخذ أمثلة من الدرس في النشاط التالي، وتعرّف فيه إلى أثر الزيادة في كل زوج.</p>
    </>
  )
}

function MeaningLabCard({ item, number }: { item: (typeof C.meaningPairs)[number]; number: number }) {
  const [picked, setPicked] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)
  const correct = picked === item.answer

  return (
    <article className="morph3-item" data-testid={`meaning-${item.id}`}>
      <p className="morph3-item__title">
        <bdi>{C.arabicDigits(number)}</bdi>. <bdi className="morph3-word">{item.base}</bdi> ←{' '}
        <bdi className="morph3-word">{item.mazeed}</bdi>
      </p>
      {item.examples.map((example) => (
        <p key={example} className="morph3-sentence">
          {example}
        </p>
      ))}
      <p>
        ماذا أفادت الزيادة في <bdi className="morph3-word">{item.mazeed}</bdi> في الجملة:{' '}
        <span className="morph3-sentence">«{item.sentence}»</span>؟
      </p>
      <fieldset className="morph3-options morph3-options--stacked">
        <legend className="morph3-sr">اختر المعنى</legend>
        {item.options.map((option) => (
          <label key={option} className="morph3-option">
            <input
              type="radio"
              name={`${item.id}-meaning`}
              value={option}
              checked={picked === option}
              onChange={() => {
                setPicked(option)
                setChecked(false)
              }}
            />
            <span>{option}</span>
          </label>
        ))}
      </fieldset>
      <div className="morph3-item__actions">
        <button
          type="button"
          className="button button--secondary"
          onClick={() => setChecked(true)}
          disabled={picked === null}
        >
          تحقق من الإجابة
        </button>
      </div>
      {checked && (
        <Feedback ok={correct}>
          <p>
            <strong>{correct ? 'معنى صحيح.' : 'ليس هذا المعنى الذي تدل عليه الزيادة هنا.'}</strong>
          </p>
          <p>{item.baseText}</p>
          <p>{item.mazeedText}</p>
          <p className="morph3-muted">{item.explanation}</p>
        </Feedback>
      )}
    </article>
  )
}

function MeaningLabStep() {
  return (
    <>
      <p>
        اقرأ كل جملة، ثم اختر المعنى الذي أضافته الزيادة. ويظهر التفسير بعد التحقق من إجابتك.
      </p>
      <div className="morph3-grid">
        {C.meaningPairs.map((item, index) => (
          <MeaningLabCard key={item.id} item={item} number={index + 1} />
        ))}
      </div>
      <Clarification>
        معنى الزيادة لا يُستنتج آليًّا من الوزن وحده؛ بل يُفهم من معنى كل فعل في سياقه. وهذا التنبيه من إعداد المنصة
        لتوضيح ما يقرره الدرس في قسمه السابع.
      </Clarification>
    </>
  )
}

/* ================================================================== *
 * الخلاصة والتدريبات
 * ================================================================== */

function SummaryStep() {
  return (
    <>
      <h4>{C.summary.heading}</h4>
      <ol className="morph3-steps">
        {C.summary.points.map((point) => (
          <li key={point.n} className="morph3-steps__item">
            <span className="morph3-steps__num" aria-hidden="true">
              <bdi>{C.arabicDigits(point.n)}</bdi>
            </span>
            <div>
              <p>
                <strong>{point.rule}</strong>
              </p>
              {'example' in point && point.example && <p className="morph3-muted">{point.example}</p>}
            </div>
          </li>
        ))}
      </ol>
      <Golden text="لا تحكم على الفعل من عدد حروفه المكتوبة فقط. يجب أولًا تحديد حروفه الأصلية." />
    </>
  )
}

function TrainingOneRow({ item, number }: { item: C.TrainingOneItem; number: number }) {
  const [type, setType] = useState('')
  const [originals, setOriginals] = useState('')
  const [extras, setExtras] = useState('')
  const [letters, setLetters] = useState<string[]>([])
  const [checked, setChecked] = useState(false)

  const typeOk = type === item.type
  const originalsOk = Number(originals) === item.originals
  const extrasOk = Number(extras) === item.extras
  const lettersOk =
    letters.length === item.extraLetters.length && item.extraLetters.every((letter) => letters.includes(letter))
  const allOk = typeOk && originalsOk && extrasOk && lettersOk

  function touch(update: () => void) {
    update()
    setChecked(false)
  }

  function toggleLetter(letter: string) {
    touch(() =>
      setLetters((current) =>
        current.includes(letter) ? current.filter((value) => value !== letter) : [...current, letter],
      ),
    )
  }

  return (
    <article className="morph3-item" data-testid={`train1-${item.id}`}>
      <p className="morph3-item__title">
        <bdi>{C.arabicDigits(number)}</bdi>. <bdi className="morph3-word">{item.word}</bdi>
      </p>
      <div className="morph3-fields">
        <label className="morph3-field">
          <span className="morph3-field__label">نوع الفعل</span>
          <select value={type} onChange={(event) => touch(() => setType(event.target.value))}>
            <option value="">اختر</option>
            {C.CLASSIFY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="morph3-field">
          <span className="morph3-field__label">عدد الحروف الأصلية</span>
          <select value={originals} onChange={(event) => touch(() => setOriginals(event.target.value))}>
            <option value="">اختر</option>
            {['3', '4'].map((value) => (
              <option key={value} value={value}>
                {C.arabicDigits(value)}
              </option>
            ))}
          </select>
        </label>
        <label className="morph3-field">
          <span className="morph3-field__label">عدد الحروف الزائدة</span>
          <select value={extras} onChange={(event) => touch(() => setExtras(event.target.value))}>
            <option value="">اختر</option>
            {['0', '1', '2', '3'].map((value) => (
              <option key={value} value={value}>
                {C.arabicDigits(value)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <fieldset className="morph3-options">
        <legend className="morph3-field__label">الحروف الزائدة (إن وُجدت)</legend>
        {C.EXTRA_LETTER_OPTIONS.map((letter) => (
          <label key={letter} className="morph3-option morph3-option--small">
            <input type="checkbox" checked={letters.includes(letter)} onChange={() => toggleLetter(letter)} />
            <bdi>{letter}</bdi>
          </label>
        ))}
      </fieldset>
      <div className="morph3-item__actions">
        <button type="button" className="button button--secondary" onClick={() => setChecked(true)}>
          تحقق من الإجابة
        </button>
      </div>
      {checked && (
        <Feedback ok={allOk} testId={`train1-${item.id}-feedback`}>
          <ul className="morph3-checks">
            <li>{typeOk ? '✓' : '✗'} نوع الفعل: {typeOk ? 'صحيح' : `الصحيح: ${item.type}`}</li>
            <li>
              {originalsOk ? '✓' : '✗'} عدد الحروف الأصلية:{' '}
              {originalsOk ? 'صحيح' : `الصحيح: ${C.arabicDigits(item.originals)}`}
            </li>
            <li>
              {extrasOk ? '✓' : '✗'} عدد الحروف الزائدة: {extrasOk ? 'صحيح' : `الصحيح: ${C.arabicDigits(item.extras)}`}
            </li>
            <li>
              {lettersOk ? '✓' : '✗'} الحروف الزائدة: {item.extraLetters.length > 0 ? item.extraLetters.join('، ') : 'لا توجد'}
            </li>
          </ul>
          <p className="morph3-muted">
            <strong>الحل:</strong> {item.solution}
          </p>
          <Clarification>الحل تفصيلي من إعداد المنصة استنادًا إلى قواعد الدرس، ولم يرد مفتاحه في نص المصدر.</Clarification>
        </Feedback>
      )}
    </article>
  )
}

function TrainingOneStep() {
  return (
    <>
      <h4>{C.trainingOne.title}</h4>
      <p>{C.trainingOne.instruction}</p>
      <p className="morph3-muted">{C.trainingsIntro}</p>
      <div className="morph3-grid">
        {C.trainingOne.items.map((item, index) => (
          <TrainingOneRow key={item.id} item={item} number={index + 1} />
        ))}
      </div>
    </>
  )
}

function TrainingTwoCard({ item, number }: { item: C.TrainingTwoItem; number: number }) {
  const [marks, setMarks] = useState<boolean[]>(() => item.tiles.map(() => false))
  const [checked, setChecked] = useState(false)
  const allOk = item.tiles.every((tile, index) => marks[index] === tile.original)

  function toggle(index: number) {
    setMarks((current) => current.map((value, position) => (position === index ? !value : value)))
    setChecked(false)
  }

  return (
    <article className="morph3-item" data-testid={`train2-${item.id}`}>
      <p className="morph3-item__title">
        <bdi>{C.arabicDigits(number)}</bdi>. <bdi className="morph3-word">{item.word}</bdi>
      </p>
      <p className="morph3-muted">علّم كل حرف أصلي، وما بقي فهو زائد.</p>
      <div className="morph3-letters" role="group" aria-label={`حروف ${item.word}`}>
        {item.tiles.map((tile, index) => (
          <label
            key={`${tile.char}-${index}`}
            className={marks[index] ? 'morph3-letter morph3-letter--orig' : 'morph3-letter'}
          >
            <input type="checkbox" checked={marks[index]} onChange={() => toggle(index)} />
            <span className="morph3-letter__char">{tile.char}</span>
            <small>أصلي</small>
          </label>
        ))}
      </div>
      <div className="morph3-item__actions">
        <button type="button" className="button button--secondary" onClick={() => setChecked(true)}>
          تحقق من التحليل
        </button>
      </div>
      {checked && (
        <Feedback ok={allOk} testId={`train2-${item.id}-feedback`}>
          <p>
            <strong>{allOk ? 'تحليل صحيح.' : 'راجع الحروف المعلَّمة.'}</strong>
          </p>
          <Tiles
            tiles={item.tiles.map((tile) => ({
              char: tile.char,
              extra: !tile.original,
              label: tile.label,
            }))}
          />
          <p className="morph3-muted">
            <strong>الحل:</strong> {item.solution}
          </p>
          <Clarification>الحل تفصيلي من إعداد المنصة استنادًا إلى قواعد الدرس، ولم يرد مفتاحه في نص المصدر.</Clarification>
        </Feedback>
      )}
    </article>
  )
}

function TrainingTwoStep() {
  return (
    <>
      <h4>{C.trainingTwo.title}</h4>
      <p>{C.trainingTwo.instruction}</p>
      <div className="morph3-grid">
        {C.trainingTwo.items.map((item, index) => (
          <TrainingTwoCard key={item.id} item={item} number={index + 1} />
        ))}
      </div>
    </>
  )
}

function TrainingThreeStep() {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  function retrain() {
    setAnswers({})
    setChecked({})
  }

  return (
    <>
      <h4>{C.trainingThree.title}</h4>
      <div className="morph3-grid">
        {C.trainingThree.items.map((item, index) => {
          const picked = answers[item.id]
          const correct = picked === item.answer
          return (
            <article key={item.id} className="morph3-item" data-testid={`train3-${item.id}`}>
              <p className="morph3-item__title">
                <bdi>{C.arabicDigits(index + 1)}</bdi>. {item.prompt}
              </p>
              <fieldset className="morph3-options morph3-options--stacked">
                <legend className="morph3-sr">{item.prompt}</legend>
                {item.options.map((option) => (
                  <label key={option} className="morph3-option">
                    <input
                      type="radio"
                      name={`${item.id}-choice`}
                      value={option}
                      checked={picked === option}
                      onChange={() => {
                        setAnswers((current) => ({ ...current, [item.id]: option }))
                        setChecked((current) => ({ ...current, [item.id]: false }))
                      }}
                    />
                    <bdi>{option}</bdi>
                  </label>
                ))}
              </fieldset>
              <div className="morph3-item__actions">
                <button
                  type="button"
                  className="button button--secondary"
                  disabled={picked === undefined}
                  onClick={() => setChecked((current) => ({ ...current, [item.id]: true }))}
                >
                  تحقق من الإجابة
                </button>
              </div>
              {checked[item.id] && (
                <Feedback ok={correct}>
                  <p>
                    <strong>{correct ? 'إجابة صحيحة.' : 'إجابة غير صحيحة.'}</strong>{' '}
                    {!correct && (
                      <>
                        الإجابة الصحيحة: <bdi>{item.answer}</bdi>
                      </>
                    )}
                  </p>
                  <p className="morph3-muted">{item.explanation}</p>
                </Feedback>
              )}
            </article>
          )
        })}
      </div>
      <div className="morph3-item__actions">
        <button type="button" className="button button--secondary" onClick={retrain} data-testid="train3-retry">
          إعادة التدريب
        </button>
      </div>
    </>
  )
}

/* ================================================================== *
 * الاختبار: التسليم، الحلول، ما بعد الدرس، منطقة المعلم
 * ================================================================== */

function SubmitStep({ engine }: { engine: TestEngine }) {
  const answered = answeredCount(C.testDefinition.pages.flatMap((page) => page.questions), engine.answers)
  const total = C.testDefinition.pages.flatMap((page) => page.questions).length
  const { finalResult, allPagesChecked } = engine

  return (
    <section className="morph3-submit" aria-labelledby="morph3-submit-title" data-testid="morph3-submit">
      <h3 id="morph3-submit-title">تسليم الاختبار والنتيجة</h3>
      <p>
        أجبت عن <bdi>{C.arabicDigits(answered)}</bdi> من <bdi>{C.arabicDigits(total)}</bdi> سؤالًا.
      </p>
      {!allPagesChecked ? (
        <p>تحقّق من كل صفحة أولًا («تحقّق من الإجابات» في نهاية كل صفحة) لتظهر النتيجة النهائية.</p>
      ) : (
        <div role="status">
          <p className="morph3-score">
            النتيجة: <bdi>{C.arabicDigits(finalResult.correct)}</bdi> من <bdi>{C.arabicDigits(finalResult.total)}</bdi>{' '}
            إجابة صحيحة
          </p>
          <ul className="morph3-counts">
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
      <p className="morph3-muted">
        «إعادة الاختبار» تمسح كل الإجابات ونتائج الصفحات، فتُقفَل النتيجة والحلول من جديد حتى تتحقق من كل صفحة مرة
        أخرى.
      </p>
    </section>
  )
}

function NextLessonStep() {
  const N = C.nextLesson
  return (
    <>
      <h4>{N.heading}</h4>
      <p>{N.lead}</p>
      <p className="morph3-big">{N.title}</p>
      <p>{N.body}</p>
      <div className="morph3-chips">
        {N.weights.map((weight) => (
          <bdi key={weight} className="morph3-weight">
            {weight}
          </bdi>
        ))}
      </div>
      <p>{N.bodyAfter}</p>
      <Golden text={N.advice} />
    </>
  )
}

function TeacherArea() {
  return (
    <TeacherSpace password={COURSE_TEACHER_PASSWORD}>
      <div className="teacher-material teacher-material--morphology3">
        <p className="morph3-keys__note">{C.teacherKeyHeader}</p>

        <h3>أ. الحلول التفصيلية للاختبار (٢٠ سؤالًا)</h3>
        <SolutionsArea
          test={testDefinition}
          mode="teacher"
          title="الحلول التفصيلية لاختبار الدرس الثالث"
          eyebrow="منطقة المعلم"
        />

        <h3>ب. حل التدريب الأول (٨ أفعال)</h3>
        <ol className="morph3-keys">
          {C.trainingOne.items.map((item) => (
            <li key={item.id}>
              <bdi>{item.word}</bdi>: {item.solution}
            </li>
          ))}
        </ol>

        <h3>ج. حل التدريب الثاني (٥ كلمات)</h3>
        <ol className="morph3-keys">
          {C.trainingTwo.items.map((item) => (
            <li key={item.id}>
              <bdi>{item.word}</bdi>: {item.solution}
            </li>
          ))}
        </ol>

        <h3>د. مفتاح التدريب الثالث (٤ أسئلة)</h3>
        <ol className="morph3-keys">
          {C.trainingThree.items.map((item) => (
            <li key={item.id}>
              <bdi>{item.answer}</bdi> — {item.explanation}
            </li>
          ))}
        </ol>

        <h3>هـ. أخطاء يتوقعها المعلم</h3>
        <ul className="morph3-list">
          {C.teacherMistakes.map((mistake) => (
            <li key={mistake}>{mistake}</li>
          ))}
        </ul>
        <p className="morph3-keys__note">{C.teacherAttention}</p>
      </div>
    </TeacherSpace>
  )
}

/* ================================================================== *
 * تجميع الخطوات
 * ================================================================== */

export function LessonMorphologyThree({ onProgressChange, onFinish }: Props) {
  // المحرك المشترك يعيش هنا فوق LessonFlow، فتبقى الإجابات والنتائج مع تنقّل الخطوات.
  const testEngine = useTestEngine(testDefinition)

  const testSteps = testDefinition.pages.map((page) =>
    step(`test-${page.id}`, page.title, 'الاختبار النهائي (٢٠ سؤالًا)', '📝', (
      <TestPageView page={page} engine={testEngine} questionTestIdPrefix="morph3-question" />
    )),
  )

  const steps: LessonStepDefinition[] = [
    step('intro', 'الدرس الثالث: الفعل المجرّد والمزيد', 'البداية', '📘', <IntroStep />),

    step('sarf', 'أولًا: ماذا ندرس في علم الصرف؟', 'المدخل', '📖', <SarfStep />),

    step('mujarrad-def', 'ثانيًا (١): تعريف الفعل المجرّد', 'الفعل المجرّد', '🌱', <MujarradDefStep />),
    step('mujarrad-types', 'ثانيًا (٢): الثلاثي المجرّد والرباعي المجرّد', 'الفعل المجرّد', '🔢', <MujarradTypesStep />),

    step('mazeed-def', 'ثالثًا (١): تعريف الفعل المزيد', 'الفعل المزيد', '➕', <MazeedDefStep />),
    step('mazeed-examples', 'ثالثًا (٢): أمثلة الزيادة والحروف الأصلية', 'الفعل المزيد', '🔁', <MazeedExamplesStep />),
    step('original-lab', 'مختبر: الحروف الأصلية والزائدة', 'الفعل المزيد', '🔤', <OriginalLabStep />),
    step('shadda-lab', 'مختبر: التضعيف', 'الفعل المزيد', '✨', <ShaddaLabStep />),

    step('classify', 'رابعًا: كيف نميّز الفعل المجرّد من الفعل المزيد؟', 'التمييز', '🧭', <ClassifyStep />),
    step('classify-lab', 'مختبر: تصنيف الأفعال', 'التمييز', '🧪', <ClassifyLabStep />),

    step('types-one', 'خامسًا (١): المزيد بحرف واحد', 'أنواع المزيد', '1️⃣', <TypesOneStep />),
    step('types-two', 'خامسًا (٢): المزيد بحرفين', 'أنواع المزيد', '2️⃣', <TypesTwoStep />),
    step('types-three', 'خامسًا (٣): المزيد بثلاثة أحرف', 'أنواع المزيد', '3️⃣', <TypesThreeStep />),

    step('mizan', 'سادسًا: ما علاقة هذا الدرس بالميزان الصرفي؟', 'الميزان', '⚖️', <MizanStep />),
    step('weight-lab', 'مختبر: الميزان الصرفي', 'الميزان', '🧮', <WeightLabStep />),

    step('meaning', 'سابعًا: هل زيادة الحروف تغيّر المعنى دائمًا؟', 'المعنى', '💡', <MeaningStep />),
    step('meaning-lab', 'نشاط: اكتشاف أثر الزيادة في المعنى', 'المعنى', '🔎', <MeaningLabStep />),

    step('summary', 'ثامنًا: خلاصة الدرس', 'الخلاصة', '📌', <SummaryStep />),

    step('train-1', 'تاسعًا (١): ميّز بين المجرّد والمزيد', 'تاسعًا: تدريبات تطبيقية', '✍️', <TrainingOneStep />),
    step('train-2', 'تاسعًا (٢): استخرج الحروف الأصلية والزائدة', 'تاسعًا: تدريبات تطبيقية', '🔠', <TrainingTwoStep />),
    step('train-3', 'تاسعًا (٣): اختر الإجابة الصحيحة', 'تاسعًا: تدريبات تطبيقية', '☑️', <TrainingThreeStep />),

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
        testId="morphology3-solutions"
        title="حلول اختبار الدرس الثالث: الفعل المجرّد والمزيد"
      />,
    ),

    step('next-lesson', 'عاشرًا: ماذا يأتي بعد هذا الدرس؟', 'بعد الدرس', '➡️', <NextLessonStep />),
    step('teacher', 'منطقة خاصة بالمعلم', 'منطقة المعلم', '🔐', <TeacherArea />),
  ]

  return (
    <LessonFlow
      steps={steps}
      onProgressChange={onProgressChange}
      onFinish={onFinish}
      lessonTitle="الفعل المجرّد والمزيد"
      lessonNumber="٣"
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
