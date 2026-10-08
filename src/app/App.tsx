import { CourseHome } from './CourseHome'
import { SectionPage } from './SectionPage'
import { navigate, useHashRoute } from './useHashRoute'
import { getLesson, type LessonMeta } from '../lessons/registry'
import { getSection } from '../sections/sectionRegistry'
import { LessonShell } from '../shared/components/LessonShell'
import { LessonOne } from '../lessons/LessonOne'
import { LessonTwo } from '../lessons/LessonTwo'
import { LessonThree } from '../lessons/LessonThree'
import { LessonFour } from '../lessons/LessonFour'
import { LessonFive } from '../lessons/LessonFive'
import { LessonSix } from '../lessons/LessonSix'
import { LessonSeven } from '../lessons/LessonSeven'
import { LessonEight } from '../lessons/LessonEight'
import { LessonNine } from '../lessons/LessonNine'
import { LessonTen } from '../lessons/LessonTen'

/**
 * Root of the course. A tiny hash router keeps the permanent Arabic-Course URL and
 * switches between the three levels of the platform's information architecture:
 *
 *   Arabic Platform → Section → Lessons → LessonFlow
 *
 *   #/                → CourseHome   (the five section cards)
 *   #/sections/<id>   → SectionPage  (the section's lesson grid, or its empty state)
 *   #/lesson/<id>     → LessonPage   (the sequential lesson flow — routes unchanged)
 *
 * All lessons reuse the same shell, flow, and visual language:
 *
 *   SectionPage → LessonShell → LessonFlow → LessonStep → current step content only
 */
export function App() {
  const route = useHashRoute()

  if (route.name === 'lesson' && route.lessonId) {
    const lesson = getLesson(route.lessonId)
    if (lesson?.available) {
      // Keying by lesson id remounts the page (and resets step progress) per lesson.
      return <LessonPage key={lesson.id} lesson={lesson} />
    }
    // Unknown or unavailable lesson id → send the student back to the index.
    return <MissingLesson />
  }

  if (route.name === 'section' && route.sectionId) {
    const section = getSection(route.sectionId)
    if (section) {
      // Keying by section id remounts the page per section.
      return <SectionPage key={section.id} section={section} />
    }
    // Unknown section id → a graceful state, never a broken page.
    return <MissingSection />
  }

  return <CourseHome />
}

function LessonPage({ lesson }: { lesson: LessonMeta }) {
  // Finishing a lesson returns the student to its section — the lesson's parent level.
  const finishLesson = () => navigate({ name: 'section', sectionId: lesson.sectionId })

  const lessonContent =
    lesson.id === 'lesson-10' ? (
      <LessonTen onFinish={finishLesson} />
    ) : lesson.id === 'lesson-9' ? (
      <LessonNine onFinish={finishLesson} />
    ) : lesson.id === 'lesson-8' ? (
      <LessonEight onFinish={finishLesson} />
    ) : lesson.id === 'lesson-7' ? (
      <LessonSeven onFinish={finishLesson} />
    ) : lesson.id === 'lesson-6' ? (
      <LessonSix onFinish={finishLesson} />
    ) : lesson.id === 'lesson-5' ? (
      <LessonFive onFinish={finishLesson} />
    ) : lesson.id === 'lesson-4' ? (
      <LessonFour onFinish={finishLesson} />
    ) : lesson.id === 'lesson-3' ? (
      <LessonThree onFinish={finishLesson} />
    ) : lesson.id === 'lesson-2' ? (
      <LessonTwo onFinish={finishLesson} />
    ) : (
      <LessonOne onFinish={finishLesson} />
    )

  return <LessonShell lesson={lesson}>{lessonContent}</LessonShell>
}

function MissingLesson() {
  return (
    <div className="course-home" dir="rtl">
      <main className="course-main">
        <section className="course-hero">
          <h1>الدرس غير متاح</h1>
          <p className="course-hero__lead">لم نتمكن من العثور على هذا الدرس. عُد إلى أقسام المنصة.</p>
          <button
            type="button"
            className="button button--primary"
            onClick={() => navigate({ name: 'home' })}
          >
            العودة إلى أقسام المنصة
          </button>
        </section>
      </main>
    </div>
  )
}

function MissingSection() {
  return (
    <div className="course-home" dir="rtl">
      <main className="course-main">
        <section className="course-hero">
          <h1>القسم غير موجود</h1>
          <p className="course-hero__lead">
            لم نتمكن من العثور على هذا القسم. عُد إلى الصفحة الرئيسية لاستعراض أقسام المنصة.
          </p>
          <button
            type="button"
            className="button button--primary"
            onClick={() => navigate({ name: 'home' })}
          >
            العودة إلى أقسام المنصة
          </button>
        </section>
      </main>
    </div>
  )
}
