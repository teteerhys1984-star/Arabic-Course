import { useState } from 'react'
import { LessonOne } from '../lessons/LessonOne'
import { lessonRegistry } from '../lessons/registry'
import { LessonNavigation } from '../shared/components/LessonNavigation'
import { ProgressBar } from '../shared/components/ProgressBar'

const lessonSections = [
  { id: 'lesson-overview', number: '١', title: 'أهداف الدرس' },
  { id: 'speech', number: '٢', title: 'ما هو الكلام؟' },
  { id: 'noun', number: '٣', title: 'الاسم' },
  { id: 'verb', number: '٤', title: 'الفعل' },
  { id: 'particle', number: '٥', title: 'الحرف' },
  { id: 'classification', number: '٦', title: 'التمييز' },
  { id: 'activities', number: '٧', title: 'المحقق اللغوي' },
  { id: 'final-test', number: '٨', title: 'الاختبار النهائي' },
]

export function App() {
  const [progress, setProgress] = useState(0)

  function selectLesson(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="app-shell" dir="rtl">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="العودة إلى بداية الدرس">
          <span className="brand__mark" aria-hidden="true">ض</span>
          <span><b>دروس العربية</b><small>أساسيات النحو العربي</small></span>
        </a>
        <a className="header-link" href="#teacher-space">مساحة المعلم</a>
      </header>

      <div className="layout" id="top">
        <aside>
          <LessonNavigation lessons={lessonRegistry} currentId="lesson-1" onSelect={selectLesson} />
          <nav className="lesson-outline" aria-label="محتويات الدرس">
            <p className="lesson-outline__label">محتويات الدرس</p>
            <ol>
              {lessonSections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}><bdi>{section.number}</bdi><span>{section.title}</span></a>
                </li>
              ))}
            </ol>
          </nav>
          <ProgressBar value={progress} label="تقدم الدرس" />
        </aside>

        <main>
          <section className="hero" id="lesson-1" aria-labelledby="page-title">
            <div className="hero__meta"><span>الدرس الأول</span><span aria-hidden="true">•</span><span>أساسيات النحو</span><span aria-hidden="true">•</span><span><bdi>٦٠</bdi> دقيقة</span></div>
            <p className="hero__eyebrow">أقسام الكلام</p>
            <h1 id="page-title">الاسم والفعل والحرف</h1>
            <p>تعرّف إلى أقسام الكلام الثلاثة، وعلامات الاسم، وأنواع الفعل، وطريقة تمييز كل كلمة في الجملة.</p>
            <div className="hero__actions"><a className="button button--primary" href="#lesson-overview">ابدأ الدرس <span aria-hidden="true">←</span></a><span className="hero__hint">الدرس الأول في أساسيات النحو</span></div>
            <div className="hero__letters" aria-label="أقسام الكلام" dir="rtl"><bdi>اسم</bdi><span aria-hidden="true">–</span><bdi>فعل</bdi><span aria-hidden="true">–</span><bdi>حرف</bdi></div>
          </section>

          <LessonOne onProgressChange={setProgress} />
        </main>
      </div>

      <footer><p>منصة مستقلة لتعلّم اللغة العربية <span aria-hidden="true">✦</span> الدرس الأول: أقسام الكلام</p></footer>
    </div>
  )
}
