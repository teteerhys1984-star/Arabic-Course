import type { Dispatch, ReactNode, SetStateAction } from 'react'
import {
  chairLabels,
  chairOptions,
  classificationItems,
  commonErrors,
  finalChallenge,
  homeworkLevelOne,
  homeworkLevelTwo,
  motionPuzzles,
  sourcePracticeQuestions,
  specialCasePuzzle,
  type ActivityOption,
  type ChairId,
} from './content'
import { useLessonState } from './state'
import { ChairBadge, Feedback, LessonNote, WordFocus } from './presentation'

interface RadioOption {
  value: string
  label: string
}

function RadioChoices({
  name,
  legend,
  options,
  value,
  onChange,
  testId,
}: {
  name: string
  legend: string
  options: readonly RadioOption[]
  value?: string
  onChange: (next: string) => void
  testId?: string
}) {
  return (
    <fieldset className="spell6-radio-group" data-testid={testId}>
      <legend>{legend}</legend>
      <div className="spell6-radio-group__options">
        {options.map((option) => (
          <label className="spell6-radio-choice" key={option.value}>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function ActivityCard({
  id,
  title,
  children,
  className = '',
}: {
  id: string
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <article className={`spell6-activity-card ${className}`} data-testid={`spell6-activity-${id}`}>
      <div className="spell6-activity-card__heading"><h3>{title}</h3></div>
      {children}
    </article>
  )
}

function ResetActivity({ onReset, children = 'إعادة هذا النشاط فقط' }: { onReset: () => void; children?: ReactNode }) {
  return <button className="button button--ghost spell6-reset" type="button" onClick={onReset}>{children}</button>
}

function markRecord<T>(setter: Dispatch<SetStateAction<Record<string, T>>>, id: string, value: T) {
  setter((current) => ({ ...current, [id]: value }))
}

function choiceOptions(options: readonly ActivityOption[]): RadioOption[] {
  return options.map((option) => ({ value: option.value, label: option.value }))
}

function optionReason(options: readonly ActivityOption[], selected?: string): string {
  return options.find((option) => option.value === selected)?.explanation ?? 'اختر إجابة أولًا.'
}

export function MovementLab() {
  const [answers, setAnswers] = useLessonState<Record<string, string>>('movement-lab-answers', {})
  const [checked, setChecked] = useLessonState<Record<string, boolean>>('movement-lab-checked', {})
  return (
    <div className="spell6-activity-stack">
      {motionPuzzles.map((puzzle, index) => {
        const selected = answers[puzzle.id]
        const didCheck = Boolean(checked[puzzle.id])
        const correct = selected === puzzle.answer
        return (
          <ActivityCard id={puzzle.id} title={`مقارنة ${index + 1}: ${puzzle.prompt}`} key={puzzle.id}>
            <p className="spell6-activity-word">الكلمة: <bdi dir="rtl" lang="ar">{puzzle.word}</bdi></p>
            <p className="spell6-activity-question">{puzzle.comparison}</p>
            <RadioChoices
              name={`movement-${puzzle.id}`}
              legend="اختر الحركة الأقوى أو العلاقة الصحيحة:"
              options={puzzle.options.map((option) => ({ value: option.value, label: option.value }))}
              value={selected}
              onChange={(value) => { markRecord(setAnswers, puzzle.id, value); markRecord<boolean>(setChecked, puzzle.id, false) }}
            />
            <div className="spell6-activity-actions">
              <button className="button button--primary" type="button" disabled={!selected} onClick={() => markRecord<boolean>(setChecked, puzzle.id, true)}>
                تحقّق من هذه المقارنة
              </button>
            </div>
            {didCheck && selected && (
              <Feedback correct={correct} testId={`spell6-feedback-${puzzle.id}`}>
                <p>{optionReason(puzzle.options, selected)}</p>
                {!correct && <p>الإجابة الصحيحة: <strong>{puzzle.answer}</strong>. {puzzle.feedback}</p>}
                {correct && <p>{puzzle.feedback}</p>}
              </Feedback>
            )}
          </ActivityCard>
        )
      })}
      <ResetActivity onReset={() => { setAnswers({}); setChecked({}) }} />
    </div>
  )
}

export function ClassificationLab() {
  const [chairs, setChairs] = useLessonState<Record<string, ChairId>>('classification-lab-chairs', {})
  const [reasons, setReasons] = useLessonState<Record<string, string>>('classification-lab-reasons', {})
  const [checked, setChecked] = useLessonState<Record<string, boolean>>('classification-lab-checked', {})
  return (
    <div className="spell6-activity-stack">
      {classificationItems.map((item, index) => {
        const selectedChair = chairs[item.id]
        const selectedReason = reasons[item.id]
        const didCheck = Boolean(checked[item.id])
        const correctChair = selectedChair === item.word.chair
        const correctReason = selectedReason === item.reasonOptions[0].value
        const correct = correctChair && correctReason
        return (
          <ActivityCard id={item.id} title={`حدّد الكرسي وعلّل — ${index + 1}`} key={item.id}>
            <WordFocus example={item.word} compact />
            <div className="spell6-classification-grid">
              <RadioChoices
                name={`classification-chair-${item.id}`}
                legend="ما صورة الهمزة؟"
                options={item.chairOptions.map((option) => ({ value: option.value, label: option.label }))}
                value={selectedChair}
                onChange={(value) => { markRecord(setChairs, item.id, value as ChairId); markRecord<boolean>(setChecked, item.id, false) }}
                testId={`spell6-seat-choice-${item.id}`}
              />
              <RadioChoices
                name={`classification-reason-${item.id}`}
                legend="أي تعليل يذكر الحركة والسابق المباشر بدقة؟"
                options={choiceOptions(item.reasonOptions)}
                value={selectedReason}
                onChange={(value) => { markRecord(setReasons, item.id, value); markRecord<boolean>(setChecked, item.id, false) }}
              />
            </div>
            <div className="spell6-activity-actions">
              <button className="button button--primary" type="button" disabled={!selectedChair || !selectedReason} onClick={() => markRecord<boolean>(setChecked, item.id, true)}>
                تحقّق من التحليل
              </button>
            </div>
            {didCheck && selectedChair && selectedReason && (
              <Feedback correct={correct} testId={`spell6-feedback-${item.id}`}>
                <p><strong>تعليل اختيارك:</strong> {optionReason(item.reasonOptions, selectedReason)}</p>
                {!correctChair && <p>الكرسي الذي اخترته لا يطابق الكلمة؛ الرسم الصحيح: <ChairBadge chair={item.word.chair} />.</p>}
                {!correctReason && <p>التعليل الصحيح: {item.reasonOptions[0].value}</p>}
                <p><strong>سبب الرسم:</strong> {item.word.explanation}</p>
              </Feedback>
            )}
          </ActivityCard>
        )
      })}
      <ResetActivity onReset={() => { setChairs({}); setReasons({}); setChecked({}) }} />
    </div>
  )
}

export function CommonErrorsLab() {
  const [answers, setAnswers] = useLessonState<Record<string, string>>('common-errors-answers', {})
  const [checked, setChecked] = useLessonState<Record<string, boolean>>('common-errors-checked', {})
  return (
    <div className="spell6-activity-stack">
      {commonErrors.map((item, index) => {
        const selected = answers[item.id]
        const didCheck = Boolean(checked[item.id])
        const correct = selected === item.answer
        return (
          <ActivityCard id={item.id} title={`خطأ شائع ${index + 1}: ${item.heading}`} key={item.id}>
            <p className="spell6-error-sample"><span>الكتابة/الفكرة المعروضة:</span> <bdi dir="rtl" lang="ar">{item.wrong}</bdi></p>
            <p className="spell6-activity-question">{item.prompt}</p>
            <RadioChoices
              name={`error-${item.id}`}
              legend="اختر التصويب الأفضل:"
              options={choiceOptions(item.options)}
              value={selected}
              onChange={(value) => { markRecord(setAnswers, item.id, value); markRecord<boolean>(setChecked, item.id, false) }}
            />
            <div className="spell6-activity-actions">
              <button className="button button--primary" type="button" disabled={!selected} onClick={() => markRecord<boolean>(setChecked, item.id, true)}>
                اعرض التصويب وسببه
              </button>
            </div>
            {didCheck && selected && (
              <Feedback correct={correct} testId={`spell6-feedback-${item.id}`}>
                <p>{optionReason(item.options, selected)}</p>
                <p><strong>التصحيح:</strong> {item.correction}</p>
                <p><strong>السبب:</strong> {item.reason}</p>
              </Feedback>
            )}
          </ActivityCard>
        )
      })}
      <ResetActivity onReset={() => { setAnswers({}); setChecked({}) }} />
    </div>
  )
}

export function SourcePracticeLab() {
  const [answers, setAnswers] = useLessonState<Record<string, string>>('source-practice-answers', {})
  const [checked, setChecked] = useLessonState<Record<string, boolean>>('source-practice-checked', {})
  return (
    <div className="spell6-activity-stack">
      {sourcePracticeQuestions.map((item, index) => {
        const selected = answers[item.id]
        const didCheck = Boolean(checked[item.id])
        const correct = selected === item.answer
        return (
          <ActivityCard id={`source-${item.id}`} title={`سؤال التدريب الأصلي ${index + 1}`} key={item.id}>
            <p className="spell6-activity-question">{item.prompt}</p>
            <RadioChoices
              name={`source-practice-${item.id}`}
              legend="اختر إجابة واحدة:"
              options={choiceOptions(item.options)}
              value={selected}
              onChange={(value) => { markRecord(setAnswers, item.id, value); markRecord<boolean>(setChecked, item.id, false) }}
            />
            <div className="spell6-activity-actions">
              <button className="button button--primary" type="button" disabled={!selected} onClick={() => markRecord<boolean>(setChecked, item.id, true)}>
                تحقّق من الإجابة
              </button>
            </div>
            {didCheck && selected && (
              <Feedback correct={correct} testId={`spell6-feedback-source-${item.id}`}>
                <p>{optionReason(item.options, selected)}</p>
                {!correct && <p>الإجابة الصحيحة: <strong>{item.answer}</strong></p>}
                <p><strong>القاعدة:</strong> {item.rule}</p>
              </Feedback>
            )}
          </ActivityCard>
        )
      })}
      <ResetActivity onReset={() => { setAnswers({}); setChecked({}) }} />
    </div>
  )
}

export function HomeworkLevelOneLab() {
  const [answers, setAnswers] = useLessonState<Record<string, ChairId>>('homework-level-one-answers', {})
  const [checked, setChecked] = useLessonState<Record<string, boolean>>('homework-level-one-checked', {})
  return (
    <div className="spell6-homework-cards">
      {homeworkLevelOne.map((item, index) => {
        const selected = answers[item.id]
        const didCheck = Boolean(checked[item.id])
        const correct = selected === item.chair
        return (
          <ActivityCard id={item.id} title={`المستوى الأول · ${index + 1}`} key={item.id} className="spell6-homework-card">
            <p className="spell6-homework-word"><bdi dir="rtl" lang="ar">{item.word}</bdi></p>
            <RadioChoices
              name={`homework-one-${item.id}`}
              legend="اختر صورة الهمزة:"
              options={chairOptions.map((option) => ({ value: option.value, label: option.label }))}
              value={selected}
              onChange={(value) => { markRecord(setAnswers, item.id, value as ChairId); markRecord<boolean>(setChecked, item.id, false) }}
            />
            <div className="spell6-activity-actions">
              <button className="button button--primary" type="button" disabled={!selected} onClick={() => markRecord<boolean>(setChecked, item.id, true)}>
                تحقّق
              </button>
            </div>
            {didCheck && selected && (
              <Feedback correct={correct} testId={`spell6-feedback-${item.id}`}>
                {correct
                  ? <p>{item.reason}</p>
                  : <p>اخترت <ChairBadge chair={selected} />، لكن الرسم الصحيح <ChairBadge chair={item.chair} />؛ {item.reason}</p>}
              </Feedback>
            )}
          </ActivityCard>
        )
      })}
      <div className="spell6-homework-reset"><ResetActivity onReset={() => { setAnswers({}); setChecked({}) }} /></div>
    </div>
  )
}

export function HomeworkLevelTwoLab() {
  const [answers, setAnswers] = useLessonState<Record<string, string>>('homework-level-two-answers', {})
  const [checked, setChecked] = useLessonState<Record<string, boolean>>('homework-level-two-checked', {})
  return (
    <div className="spell6-activity-stack">
      {homeworkLevelTwo.map((item, index) => {
        const selected = answers[item.id]
        const didCheck = Boolean(checked[item.id])
        const correct = selected === item.answer
        return (
          <ActivityCard id={item.id} title={`المستوى الثاني · ${index + 1}`} key={item.id}>
            <p className="spell6-activity-word">الكلمة: <bdi dir="rtl" lang="ar">{item.word}</bdi></p>
            <p className="spell6-activity-question">{item.prompt}</p>
            <RadioChoices
              name={`homework-two-${item.id}`}
              legend="اختر التعليل:"
              options={choiceOptions(item.options)}
              value={selected}
              onChange={(value) => { markRecord(setAnswers, item.id, value); markRecord<boolean>(setChecked, item.id, false) }}
            />
            <div className="spell6-activity-actions">
              <button className="button button--primary" type="button" disabled={!selected} onClick={() => markRecord<boolean>(setChecked, item.id, true)}>
                تحقّق من التعليل
              </button>
            </div>
            {didCheck && selected && (
              <Feedback correct={correct} testId={`spell6-feedback-${item.id}`}>
                <p>{optionReason(item.options, selected)}</p>
                {!correct && <p><strong>الإجابة النموذجية:</strong> {item.model}</p>}
                {correct && <p>{item.model}</p>}
              </Feedback>
            )}
          </ActivityCard>
        )
      })}
      <ResetActivity onReset={() => { setAnswers({}); setChecked({}) }} />
    </div>
  )
}

export function SpecialCaseLab() {
  const [answer, setAnswer] = useLessonState<string | undefined>('special-case-answer', undefined)
  const [checked, setChecked] = useLessonState<boolean>('special-case-checked', false)
  const correct = answer === specialCasePuzzle.answer
  return (
    <ActivityCard id={specialCasePuzzle.id} title="بطاقة كشف التعميم">
      <p className="spell6-activity-question">{specialCasePuzzle.prompt}</p>
      <RadioChoices
        name="special-case-contrast"
        legend="اختر المقارنة الصحيحة:"
        options={specialCasePuzzle.options.map((option) => ({ value: option.value, label: option.value }))}
        value={answer}
        onChange={(value) => { setAnswer(value); setChecked(false) }}
      />
      <div className="spell6-activity-actions">
        <button className="button button--primary" type="button" disabled={!answer} onClick={() => setChecked(true)}>
          اكشف نتيجة المقارنة
        </button>
      </div>
      {checked && answer && (
        <Feedback correct={correct} testId="spell6-feedback-special-case">
          <p>{optionReason(specialCasePuzzle.options, answer)}</p>
          {!correct && <p>الإجابة الصحيحة: <strong>{specialCasePuzzle.answer}</strong></p>}
          <p>{specialCasePuzzle.solution}</p>
        </Feedback>
      )}
      <ResetActivity onReset={() => { setAnswer(undefined); setChecked(false) }} />
    </ActivityCard>
  )
}

export function FinalChallengeLab() {
  const [answer, setAnswer] = useLessonState<string | undefined>('final-challenge-answer', undefined)
  const [checked, setChecked] = useLessonState<boolean>('final-challenge-checked', false)
  const correct = answer === finalChallenge.answer
  return (
    <ActivityCard id={finalChallenge.id} title="التحدّي الختامي · حلّل كلمة جديدة">
      <p className="spell6-activity-question">{finalChallenge.prompt}</p>
      <WordFocus example={finalChallenge.word} />
      <RadioChoices
        name="final-challenge-chair"
        legend="اختر التحليل الكامل:"
        options={finalChallenge.options.map((option) => ({ value: option.value, label: option.value }))}
        value={answer}
        onChange={(value) => { setAnswer(value); setChecked(false) }}
      />
      <div className="spell6-activity-actions">
        <button className="button button--primary" type="button" disabled={!answer} onClick={() => setChecked(true)}>
          تحقّق من التحليل
        </button>
      </div>
      {checked && answer && (
        <Feedback correct={correct} testId="spell6-feedback-final-challenge">
          <p>{optionReason(finalChallenge.options, answer)}</p>
          {!correct && <p>الإجابة النموذجية: <strong>{finalChallenge.answer}</strong></p>}
          {correct && <p>{finalChallenge.word.explanation}</p>}
        </Feedback>
      )}
      <ResetActivity onReset={() => { setAnswer(undefined); setChecked(false) }} />
    </ActivityCard>
  )
}

export function CaseReminder() {
  return (
    <LessonNote title="افحص الشرط، ولا تحفظ كلمةً كأنها استثناء منفرد" tone="caution">
      <p>بعد ألف مدّ أو واو ساكنة/مدّ، يعرض هذا الدرس الرسم المفرد للهمزة <strong>المفتوحة</strong> في النمط المقرر. وبعد ياء ساكنة قد تأتي النبرة، كما في <bdi dir="rtl">بِيئَةٌ</bdi>.</p>
      <p>وجود مدّ قبل الهمزة لا يكفي وحده: <bdi dir="rtl">قَائِلٌ</bdi> على النبرة لأن الهمزة مكسورة، و<bdi dir="rtl">تَفَاؤُلٌ</bdi> على الواو لأن الهمزة مضمومة.</p>
    </LessonNote>
  )
}

export function ChairLabel({ chair }: { chair: ChairId }) {
  return <span className="spell6-chair-label">{chairLabels[chair]}</span>
}
