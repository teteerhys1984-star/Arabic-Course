import { lessonRegistry } from '../lessons/registry'
import { getSections, toArabicDigits } from '../sections/sectionRegistry'
import { SectionCard } from './SectionCard'
import { InstructorContact } from '../shared/contact/InstructorContact'

/**
 * The permanent platform homepage.
 *
 * The five platform sections are the first navigation level:
 *
 *   اللغة العربية → بطاقات الأقسام الخمسة → SectionPage → شبكة الدروس → LessonShell
 *
 * The home is a SECTION INDEX, fully data-driven by the section registry; it lists the
 * sections and their scope only, never lesson content and never the lessons directly.
 * Clicking a section opens its own page (`#/sections/<id>`), where that section's
 * lessons are listed. Future lessons appear under the right section automatically via
 * their `sectionId` in the lesson registry — the home page is never edited by hand.
 *
 * The header also carries the course's single official contact element
 * (`InstructorContact`), centered between the brand and the decorative ornament; the
 * section page and the lesson shell render the very same component, so the instructor's
 * WhatsApp link is never duplicated anywhere.
 *
 *   sectionRegistry → SectionCard[] → responsive section grid (`.section-index__list`)
 */
export function CourseHome() {
  const sections = getSections()
  const availableLessons = lessonRegistry.filter((lesson) => lesson.available).length

  return (
    <div className="course-home" dir="rtl" id="top">
      <header className="course-topbar">
        <a className="brand" href="#/" aria-label="الصفحة الرئيسية للمنصة">
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
          <p className="course-hero__eyebrow">منصة تعليمية تفاعلية</p>
          <h1 id="course-title">اللغة العربية</h1>
          <p className="course-hero__lead">
            المنصة منظمة في أقسام رئيسية، وكل قسم يضم دروسه الخاصة. اختر قسمًا للوصول إلى
            دروسه والبدء برحلة تعلّم متدرّجة، من التمهيد حتى الاختبار.
          </p>
          <div className="course-hero__stats" aria-label="ملخص المنصة">
            <span>
              أقسام المنصة: <bdi>{toArabicDigits(sections.length)}</bdi>
            </span>
            <span aria-hidden="true">•</span>
            <span>
              الدروس المتاحة: <bdi>{toArabicDigits(availableLessons)}</bdi>
            </span>
          </div>
        </section>

        <section className="section-index" aria-label="أقسام المنصة">
          <h2 className="section-index__title" id="section-index-title">
            أقسام المنصة
          </h2>
          <ol className="section-index__list" role="list" aria-labelledby="section-index-title">
            {sections.map((section) => (
              <li key={section.id}>
                <SectionCard section={section} />
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="course-footer">
        <p>
          منصة مستقلة لتعلّم اللغة العربية <span aria-hidden="true">✦</span> خمسة أقسام رئيسية
        </p>
      </footer>
    </div>
  )
}
