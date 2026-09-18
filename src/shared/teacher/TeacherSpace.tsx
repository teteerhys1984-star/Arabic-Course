import { type FormEvent, type ReactNode, useState } from 'react'

interface TeacherSpaceProps {
  children: ReactNode
  password?: string
}

export function TeacherSpace({ children, password = 'معلم' }: TeacherSpaceProps) {
  const [entry, setEntry] = useState('')
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')

  function unlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (entry === password) {
      setOpen(true)
      setError('')
    } else {
      setError('كلمة المرور غير صحيحة.')
    }
  }

  return (
    <section className="teacher-space" aria-labelledby="teacher-title">
      <div className="teacher-space__heading">
        <span aria-hidden="true">◆</span>
        <div>
          <p className="card__eyebrow">محتوى مساعد</p>
          <h3 id="teacher-title">مساحة المعلم</h3>
        </div>
      </div>
      {!open ? (
        <form onSubmit={unlock}>
          <label htmlFor="teacher-password">كلمة المرور</label>
          <div className="teacher-space__form-row">
            <input
              id="teacher-password"
              type="password"
              value={entry}
              onChange={(event) => setEntry(event.target.value)}
              aria-describedby="teacher-security-note teacher-error"
            />
            <button className="button button--primary" type="submit">دخول</button>
          </div>
          <p id="teacher-security-note" className="teacher-space__note">
            هذه بوابة أمامية بسيطة لتنظيم العرض، وليست مصادقة آمنة ولا تحمي بيانات حساسة.
          </p>
          {error && <p id="teacher-error" className="form-error" role="alert">{error}</p>}
        </form>
      ) : (
        <div>
          {children}
          <button className="button button--ghost" type="button" onClick={() => { setOpen(false); setEntry('') }}>
            إغلاق المساحة
          </button>
        </div>
      )}
    </section>
  )
}
