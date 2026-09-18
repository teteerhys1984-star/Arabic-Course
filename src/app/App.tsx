import { EducationalCard } from '../shared/components/EducationalCard'
import { LessonNavigation } from '../shared/components/LessonNavigation'
import { LessonSection } from '../shared/components/LessonSection'
import { ProgressBar } from '../shared/components/ProgressBar'
import { DirectionText } from '../shared/direction/DirectionText'
import { Quiz } from '../shared/quiz/Quiz'
import { TeacherSpace } from '../shared/teacher/TeacherSpace'
import { lessonRegistry } from '../lessons/registry'

const foundationQuiz = [
  {
    id: 'direction',
    prompt: 'ما اتجاه الواجهة العربية؟',
    options: [
      { id: 'rtl', label: 'من اليمين إلى اليسار' },
      { id: 'ltr', label: 'من اليسار إلى اليمين' },
    ],
    correctOptionId: 'rtl',
    explanation: 'تُعرض واجهة العربية من اليمين إلى اليسار، مع عزل المقاطع الأجنبية عند الحاجة.',
  },
]

export function App() {
  return (
    <div className="app-shell" dir="rtl">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="الصفحة الرئيسية">
          <span className="brand__mark" aria-hidden="true">ض</span>
          <span><b>دروس العربية</b><small>منصة تعليمية مستقلة</small></span>
        </a>
        <a className="header-link" href="#foundation">عن المنصة</a>
      </header>

      <div className="layout" id="top">
        <aside>
          <LessonNavigation lessons={lessonRegistry} />
          <ProgressBar value={0} label="تقدم الدورة" />
        </aside>

        <main>
          <section className="hero" aria-labelledby="page-title">
            <p className="hero__eyebrow">مرحبًا بك</p>
            <h1 id="page-title">بداية واضحة لرحلة تعلّم العربية</h1>
            <p>
              تأسست المنصة تقنيًا لتستقبل دروسًا متكاملة، وأنشطة تفاعلية، ومراجعات قابلة للتوسع.
              لم يُنشر الدرس الأول بعد.
            </p>
            <a className="button button--primary" href="#foundation">استكشف الأساس التقني</a>
          </section>

          <LessonSection
            id="foundation"
            title="أساس تعليمي قابل للنمو"
            description="مكوّنات مشتركة واتجاه عربي سليم منذ البداية."
          >
            <div className="card-grid">
              <EducationalCard title="عربية أولًا" eyebrow="اتجاه سليم" tone="accent">
                <p>
                  تُعزل المقاطع المختلطة مثل <DirectionText direction="ltr">React + TypeScript</DirectionText>{' '}
                  والرمز <DirectionText direction="ltr">x = 10</DirectionText> من دون قلب ترتيب الشرح.
                </p>
              </EducationalCard>
              <EducationalCard title="دروس منظّمة" eyebrow="بنية مشتركة">
                <p>مكان موحد للتنقل، والأقسام، والأمثلة، والتمارين، والاختبارات، والتقدم.</p>
              </EducationalCard>
              <EducationalCard title="لكل شاشة" eyebrow="تصميم متجاوب" tone="soft">
                <p>مساحات مريحة وأهداف لمس واضحة وعرض يحافظ على سلامة المحتوى في الهاتف والحاسوب.</p>
              </EducationalCard>
            </div>
          </LessonSection>

          <LessonSection id="interaction" title="نموذج للسلوك التفاعلي">
            <Quiz title="تجربة بنية الاختبارات" questions={foundationQuiz} />
          </LessonSection>

          <TeacherSpace>
            <p>ستظهر هنا لاحقًا إرشادات التدريس ومفاتيح الإجابة الخاصة بكل درس.</p>
          </TeacherSpace>
        </main>
      </div>

      <footer>
        <p>منصة مستقلة لتعلّم اللغة العربية.</p>
      </footer>
    </div>
  )
}
