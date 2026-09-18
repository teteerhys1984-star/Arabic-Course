import { useState } from 'react'
import { CourseHome } from './CourseHome'
import { navigate, useHashRoute } from './useHashRoute'
import { getLesson, type LessonMeta } from '../lessons/registry'
import { LessonShell } from '../shared/components/LessonShell'
import { LessonOne } from '../lessons/LessonOne'

/**
 * Root of the course. A tiny hash router keeps the permanent Arabic-Course URL and
 * switches between the course index (homepage / lesson hub) and one continuous long
 * lesson page. All lessons reuse the same shell, navigation, and visual language.
 */
export function App() {
  const route = useHashRoute()

  if (route.name === 'lesson' && route.lessonId) {
    const lesson = getLesson(route.lessonId)
    if (lesson && lesson.id === 'lesson-1') {
      // Keying by lesson id remounts the page (and resets progress) per lesson.
      return <LessonPage key={lesson.id} lesson={lesson} />
    }
    // Unknown or unavailable lesson id → send the student back to the index.
    return <MissingLesson />
  }

  return <CourseHome />
}

function LessonPage({ lesson }: { lesson: LessonMeta }) {
  const [progress, setProgress] = useState(0)
  return (
    <LessonShell lesson={lesson} progress={progress}>
      <LessonOne onProgressChange={setProgress} />
    </LessonShell>
  )
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
