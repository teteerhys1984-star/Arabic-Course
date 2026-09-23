import { CourseHome } from './CourseHome'
import { navigate, useHashRoute } from './useHashRoute'
import { getLesson, type LessonMeta } from '../lessons/registry'
import { LessonShell } from '../shared/components/LessonShell'
import { LessonOne } from '../lessons/LessonOne'
import { LessonTwo } from '../lessons/LessonTwo'
import { LessonThree } from '../lessons/LessonThree'
import { LessonFour } from '../lessons/LessonFour'

/**
 * Root of the course. A tiny hash router keeps the permanent Arabic-Course URL and
 * switches between the course index (homepage / lesson hub) and the sequential lesson
 * flow. All lessons reuse the same shell, flow, and visual language:
 *
 *   CourseHome → LessonShell → LessonFlow → LessonStep → current step content only
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

  return <CourseHome />
}

function LessonPage({ lesson }: { lesson: LessonMeta }) {
  const lessonContent =
    lesson.id === 'lesson-4' ? (
      <LessonFour onFinish={() => navigate({ name: 'home' })} />
    ) : lesson.id === 'lesson-3' ? (
      <LessonThree onFinish={() => navigate({ name: 'home' })} />
    ) : lesson.id === 'lesson-2' ? (
      <LessonTwo onFinish={() => navigate({ name: 'home' })} />
    ) : (
      <LessonOne onFinish={() => navigate({ name: 'home' })} />
    )

  return <LessonShell lesson={lesson}>{lessonContent}</LessonShell>
}

function MissingLesson() {
  return (
    <div className="course-home" dir="rtl">
      <main className="course-main">
        <section className="course-hero">
          <h1>الدرس غير متاح</h1>
          <p className="course-hero__lead">لم نتمكن من العثور على هذا الدرس. عُد إلى فهرس الدورة.</p>
          <button
            type="button"
            className="button button--primary"
            onClick={() => navigate({ name: 'home' })}
          >
            العودة إلى فهرس الدورة
          </button>
        </section>
      </main>
    </div>
  )
}
