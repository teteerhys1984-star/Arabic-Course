import { lessonRegistry } from '../lessons/registry'
import { LessonCard } from './LessonCard'
import { InstructorContact } from '../shared/contact/InstructorContact'

/**
 * The permanent course homepage / lesson hub.
 *
 * It functions as a COURSE INDEX: it lists the lessons and their titles only, never the
 * full content of any lesson. Clicking a lesson opens that lesson independently on the
 * same course URL (`#/lesson/<id>`). Future lessons appear here automatically by adding
 * an entry to the lesson registry — no separate website per lesson.
 *
 * The header also carries the course's single official contact element
 * (`InstructorContact`), centered between the brand and the decorative ornament; the
 * lesson shell renders the very same component, so the instructor's WhatsApp link is
 * never duplicated anywhere.
 *
 *   lessonRegistry → LessonCard[] → responsive lesson grid (`.lesson-index__list`)
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
        <InstructorContact />
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
          <ol className="lesson-index__list" role="list">
            {lessonRegistry.map((lesson) => (
              <li key={lesson.id}>
                <LessonCard lesson={lesson} />
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="course-footer">
        <p>منصة مستقلة لتعلّم اللغة العربية <span aria-hidden="true">✦</span> دورة أساسيات النحو</p>
      </footer>
    </div>
  )
}
