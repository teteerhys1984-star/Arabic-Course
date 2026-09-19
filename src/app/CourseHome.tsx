import { lessonRegistry, type LessonMeta } from '../lessons/registry'
import { navigate } from './useHashRoute'

/**
 * The permanent course homepage / lesson hub.
 *
 * It functions as a COURSE INDEX: it lists the lessons and their titles only, never the
 * full content of any lesson. Clicking a lesson opens that lesson independently on the
 * same course URL (`#/lesson/<id>`). Future lessons appear here automatically by adding
 * an entry to the lesson registry — no separate website per lesson.
 */
export function CourseHome() {
  const available = lessonRegistry.filter((lesson) => lesson.available)

  return (
    <div className="course-home" dir="rtl" id="top">
      <header className="course-topbar">
        <a className="brand" href="#/" aria-label="فهرس دروس العربية">
          <span className="brand__mark" aria-hidden="true">ض</span>
          <span>
            <b>دروس العربية</b>
            <small>منصة مستقلة لتعلّم اللغة العربية</small>
          </span>
        </a>
      </header>

      <main className="course-main">
        <section className="course-hero" aria-labelledby="course-title">
          <p className="course-hero__eyebrow">فهرس الدورة</p>
          <h1 id="course-title">دورة أساسيات اللغة العربية</h1>
          <p className="course-hero__lead">
            رحلة متدرّجة في قواعد اللغة العربية. اختر درسًا لتبدأ رحلة تعلّم واحدة متصلة،
            من التمهيد حتى الاختبار.
          </p>
          <div className="course-hero__stats" aria-label="ملخص الدورة">
            <span><bdi>{available.length}</bdi> درس متاح</span>
            <span aria-hidden="true">•</span>
            <span>محتوى عربي كامل بالاتجاه الصحيح</span>
          </div>
        </section>

        <section className="lesson-index" aria-label="قائمة الدروس">
          <h2 className="lesson-index__title">الدروس</h2>
          <ol className="lesson-index__list">
            {lessonRegistry.map((lesson) => (
              <li key={lesson.id}>
                <LessonIndexCard lesson={lesson} />
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="course-footer">
        <p>منصة مستقلة لتعلّم اللغة العربية <span aria-hidden="true">✦</span> دورة أساسيات النحو</p>
        <p className="instructor-credit">المهندس سومر شاهين: 0930215022</p>
      </footer>
    </div>
  )
}

function LessonIndexCard({ lesson }: { lesson: LessonMeta }) {
  function open() {
    if (!lesson.available) return
    navigate({ name: 'lesson', lessonId: lesson.id })
  }

  return (
    <article className={lesson.available ? 'lesson-index-card' : 'lesson-index-card lesson-index-card--soon'}>
      <div className="lesson-index-card__badge" aria-hidden="true">
        <span className="lesson-index-card__label">الدرس</span>
        <bdi>{lesson.number}</bdi>
      </div>
      <div className="lesson-index-card__body">
        <p className="lesson-index-card__eyebrow">{lesson.eyebrow}</p>
        <h3>{lesson.title}</h3>
        <p className="lesson-index-card__summary">{lesson.summary}</p>
        <div className="lesson-index-card__meta">
          <span>{lesson.strand}</span>
          <span aria-hidden="true">•</span>
          <span><bdi>{lesson.duration}</bdi> دقيقة</span>
        </div>
      </div>
      <div className="lesson-index-card__action">
        {lesson.available ? (
          <button type="button" className="button button--primary" onClick={open}>
            ابدأ الدرس <span aria-hidden="true">←</span>
          </button>
        ) : (
          <span className="lesson-index-card__soon">قريبًا</span>
        )}
      </div>
    </article>
  )
}
