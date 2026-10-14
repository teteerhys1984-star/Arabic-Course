import type { ReactNode } from 'react'
import type { ChairId, SourceCorrection, WordExample } from './content'
import { chairGlyphs, chairLabels } from './content'

export function ActivityTag({ children }: { children?: ReactNode }) {
  return <p className="spell6-activity-tag">{children ?? 'نشاط تعليمي من المنصة · لا يدخل في درجة الاختبار'}</p>
}

export function LessonNote({
  title = 'توضيح تعليمي من المنصة',
  children,
  tone = 'info',
}: {
  title?: string
  children: ReactNode
  tone?: 'info' | 'caution' | 'source'
}) {
  return (
    <aside className={`spell6-note spell6-note--${tone}`}>
      <p className="spell6-note__title">{title}</p>
      <div className="spell6-note__body">{children}</div>
    </aside>
  )
}

export function Feedback({
  correct,
  children,
  label,
  testId,
}: {
  correct: boolean
  children: ReactNode
  label?: string
  testId?: string
}) {
  return (
    <div
      className={`spell6-feedback ${correct ? 'spell6-feedback--correct' : 'spell6-feedback--wrong'}`}
      role="status"
      aria-live="polite"
      data-testid={testId}
    >
      <strong>{label ?? (correct ? 'إجابة صحيحة.' : 'تحتاج الإجابة إلى مراجعة.')}</strong>
      <div>{children}</div>
    </div>
  )
}

export function CorrectionCard({ item }: { item: SourceCorrection }) {
  return (
    <aside className="spell6-correction" data-testid={`spell6-correction-${item.id}`}>
      <p className="spell6-correction__label"><strong>{item.kind === 'clarification' ? 'توضيح علمي' : 'تصحيح علمي'} {item.id}</strong> · بيان ظاهر للمتعلم</p>
      <blockquote><span>نص المصدر المحفوظ:</span> {item.sourceText}</blockquote>
      <p><strong>الصياغة الدقيقة هنا:</strong> {item.corrected}</p>
      <p className="spell6-correction__reason"><strong>السبب:</strong> {item.reason}</p>
    </aside>
  )
}

export function WordFocus({
  example,
  compact = false,
  showParts = true,
}: {
  example: WordExample
  compact?: boolean
  showParts?: boolean
}) {
  return (
    <figure className={`spell6-word-focus${compact ? ' spell6-word-focus--compact' : ''}`}>
      <bdi className="spell6-word-focus__whole" dir="rtl" lang="ar">{example.word}</bdi>
      {showParts && (
        <div className="spell6-word-focus__diagram" aria-label={`تفكيك بصري لكلمة ${example.word}`}>
          {example.parts.map((part, index) => {
            const isHamza = index === example.hamzaPart
            const isPrevious = index === example.previousPart
            return (
              <span
                key={`${index}-${part}`}
                className={`spell6-part${isHamza ? ' spell6-part--hamza' : ''}${isPrevious ? ' spell6-part--previous' : ''}`}
              >
                <bdi dir="rtl" lang="ar">{part}</bdi>
                {isHamza && <small>الهمزة</small>}
                {isPrevious && <small>السابق مباشرة</small>}
              </span>
            )
          })}
        </div>
      )}
      <figcaption>
        <span>حركة الهمزة: <strong>{example.hamzaMovement}</strong></span>
        <span>حركة السابق مباشرة: <strong>{example.previousMovement}</strong></span>
      </figcaption>
    </figure>
  )
}

export function ChairBadge({ chair, large = false }: { chair: ChairId; large?: boolean }) {
  const label = chairLabels[chair]
  return (
    <span className={`spell6-chair-badge spell6-chair-badge--${chair}${large ? ' spell6-chair-badge--large' : ''}`}>
      <bdi className="spell6-chair-badge__glyph" dir="rtl" aria-hidden="true">{chairGlyphs[chair]}</bdi>
      <span>{label}</span>
    </span>
  )
}

export function ArabicNumber({ value }: { value: number }) {
  const text = String(value).replace(/[0-9]/g, (digit) => '٠١٢٣٤٥٦٧٨٩'[Number(digit)])
  return <bdi>{text}</bdi>
}
