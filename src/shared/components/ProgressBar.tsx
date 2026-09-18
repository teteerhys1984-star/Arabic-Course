interface ProgressBarProps {
  value: number
  label?: string
}

export function ProgressBar({ value, label = 'التقدم' }: ProgressBarProps) {
  const safeValue = Math.min(100, Math.max(0, value))
  return (
    <div className="progress" aria-label={label}>
      <div className="progress__labels">
        <span>{label}</span>
        <bdi>{safeValue}%</bdi>
      </div>
      <div
        className="progress__track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={safeValue}
      >
        <span style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  )
}
