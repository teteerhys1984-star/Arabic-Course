import { useState } from 'react'
import { LessonFlow, type LessonStepDefinition } from '../shared/components/LessonFlow'
import { TeacherSpace } from '../shared/teacher/TeacherSpace'
import {
  SolutionsArea,
  TestRunner,
  useTestEngine,
  type TestDefinition,
} from '../shared/test'
import {
  objectives,
  definitionSection,
  ruleTable,
  madSection,
  stepsSection,
  commonErrors,
  activities,
  finalExam,
  homework,
  summaryPoints,
  nextLessonInfo,
  interactiveActivities,
  teacherNotes,
  gradingRubrics,
  bestMethod,
  testDefinition as lessonFourTest,
} from './spelling-lesson-04/content'

// eslint-disable-next-line react-refresh/only-export-components -- shared test schema is lesson data
export const testDefinition: TestDefinition = lessonFourTest

export default function LessonSpellingFour({
  onProgressChange,
  onFinish,
}: {
  onProgressChange?: (p: number) => void
  onFinish?: () => void
}) {
  const [activityAnswers, setActivityAnswers] = useState<Record<string, string>>({})
  const engine = useTestEngine(testDefinition)


  const steps: LessonStepDefinition[] = [
    {
      id: 'intro',
      title: 'مقدمة ومراجعة سريعة',
      render: () => (
        <div dir="rtl" className="spell4-section">
          <h2 className="spell4-title">الدرس الرابع: الهمزة المتطرفة</h2>
          <p className="spell4-sub">كيف نكتب الهمزة في آخر الكلمة؟</p>
          <h3>مراجعة سريعة — مواضع الهمزة الثلاثة</h3>
          <ul>
            <li>في أول الكلمة: <strong>أَحمد، إِكرام، اسم</strong></li>
            <li>في وسط الكلمة: <strong>سَأَلَ، فِئَة، مُؤْمِن</strong></li>
            <li>في آخر الكلمة: <strong>قَرَأَ، لُؤْلُؤ، شاطِئ</strong> ← درسنا اليوم</li>
          </ul>
          <h3>الأهداف</h3>
          <ol>
            {objectives.map((o, i) => (
              <li key={i}>{o}</li>
            ))}
          </ol>
        </div>
      ),
    },
    {
      id: 'definition',
      title: 'ما الهمزة المتطرفة؟',
      render: () => (
        <div dir="rtl" className="spell4-section">
          <h2>{definitionSection.title}</h2>
          <p className="spell4-def">{definitionSection.definition}</p>
          <div className="spell4-cards">
            {definitionSection.examples.map((ex, i) => (
              <div key={i} className="spell4-card">
                <strong>{ex.word}</strong>
                <div>الشكل: <strong>{ex.form}</strong></div>
                <div>السبب: {ex.note}</div>
              </div>
            ))}
          </div>
          <h4>المقارنة مع الأنواع الأخرى</h4>
          <ul>
            {definitionSection.contrast.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
          <aside className="spell4-note"><strong>توضيح تعليمي من المنصة:</strong> {definitionSection.platformNote}</aside>
        </div>
      ),
    },
    {
      id: 'rules',
      title: 'القاعدة الذهبية',
      render: () => (
        <div dir="rtl" className="spell4-section">
          <h2>القاعدة الذهبية لكتابة الهمزة المتطرفة</h2>
          <p>ننظر إلى حركة الحرف الذي يسبق الهمزة، لا حركة الهمزة نفسها.</p>
          <table className="spell4-table">
            <thead>
              <tr><th>الحرف السابق</th><th>الشكل</th><th>أمثلة</th></tr>
            </thead>
            <tbody>
              {ruleTable.map((r, i) => (
                <tr key={i}>
                  <td>{r.label}</td>
                  <td><strong>{r.form}</strong></td>
                  <td>{r.examples}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
    },
    {
      id: 'mad',
      title: 'الهمزة بعد حرف مدّ',
      render: () => (
        <div dir="rtl" className="spell4-section">
          <h2>{madSection.title}</h2>
          <p>{madSection.intro}</p>
          <table className="spell4-table">
            <thead><tr><th>حرف المدّ</th><th>الأمثلة</th></tr></thead>
            <tbody>
              {madSection.table.map((t, i) => (
                <tr key={i}><td><strong>{t[0]}</strong></td><td>{t[1]}</td></tr>
              ))}
            </tbody>
          </table>
          <aside className="spell4-note"><strong>توضيح تعليمي من المنصة:</strong> {madSection.explanation}</aside>
        </div>
      ),
    },
    {
      id: 'steps',
      title: 'خطوات تحديد الرسم — أمثلة محلولة',
      render: () => (
        <div dir="rtl" className="spell4-section">
          <h2>{stepsSection.title}</h2>
          <ol>
            {stepsSection.steps.map((s, i) => (
              <li key={i}><strong>الخطوة {i + 1}:</strong> {s}</li>
            ))}
          </ol>
          <h3>أمثلة محلولة (5)</h3>
          {stepsSection.examples.map((ex, i) => (
            <div key={i} className="spell4-example-box">
              <strong>المثال {i + 1}: {ex.word}</strong>
              <ul>
                {ex.lines.map((l, j) => (
                  <li key={j}>{l}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'errors',
      title: 'الأخطاء الشائعة',
      render: () => (
        <div dir="rtl" className="spell4-section">
          <h2>{commonErrors.title}</h2>
          <table className="spell4-table">
            <thead><tr><th>الكتابة الصحيحة</th><th>الخطأ الشائع</th></tr></thead>
            <tbody>
              {commonErrors.table.map((t, i) => (
                <tr key={i}><td><strong>{t[0]}</strong></td><td>{t[1]}</td></tr>
              ))}
            </tbody>
          </table>
          <aside className="spell4-note"><strong>ملاحظة تدقيق:</strong> {commonErrors.note}</aside>
        </div>
      ),
    },
    {
      id: 'activities',
      title: 'تفاعلات تعليمية',
      render: () => (
        <div dir="rtl" className="spell4-section">
          <h2>التفاعلات</h2>
          <p>{activities.instruction}</p>

          <h3>1. مختبر حركة الحرف السابق</h3>
          <div className="spell4-interactive">
            {interactiveActivities[0].choices.map((c) => (
              <button
                key={c}
                className="spell4-btn"
                onClick={() => alert(`حركة ${c} → ${interactiveActivities[0].outcomes.find(o => o.choice === c)?.result}`)}
              >
                {c}
              </button>
            ))}
          </div>

          <h3>2. بناء الكلمة</h3>
          <div className="spell4-interactive">
            {interactiveActivities[1].items.map((it) => (
              <div key={it.word} className="spell4-item">
                <strong>{it.word}</strong>{' '}
                <span> → </span>
                <select
                  onChange={(e) => setActivityAnswers((prev) => ({ ...prev, [it.word]: e.target.value }))}
                  defaultValue=""
                >
                  <option value="">اختر</option>
                  {it.options.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
                <button
                  className="spell4-btn-small"
                  onClick={() => {
                    const val = activityAnswers[it.word]
                    if (!val) alert('اختر أولًا')
                    else if (val === it.correct) alert('صحيح! ' + it.explanation)
                    else alert('حاول مرة أخرى. ' + it.explanation)
                  }}
                >
                  تحقق
                </button>
              </div>
            ))}
          </div>

          <h3>3. اكتشف الخطأ</h3>
          <div className="spell4-interactive">
            {interactiveActivities[2].pairs.map((p) => (
              <div key={p.wrong} className="spell4-item">
                <strong>الخطأ:</strong> {p.wrong} → <strong>الصحيح:</strong> {p.correct} <br />
                <small>السبب: {p.reason}</small>
              </div>
            ))}
          </div>

          <h3>4. رتّب خطوات القرار</h3>
          <div className="spell4-interactive">
            <ol>
              {interactiveActivities[3].steps.map((st, i) => (
                <li key={i}>{i + 1}. {st}</li>
              ))}
            </ol>
            <p><strong>الترتيب الصحيح:</strong> 1 → 2 → 3 → 4</p>
          </div>

          <h3>5. تحدٍ ختامي</h3>
          <div className="spell4-interactive">
            {interactiveActivities[4].questions.map((q) => (
              <div key={q.q} className="spell4-item">
                <strong>{q.q}</strong> → <strong>{q.a}</strong>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'final',
      title: 'اختبار ختامي — خمسة أسئلة',
      render: () => (
        <div dir="rtl" className="spell4-section">
          <h2>{finalExam.title}</h2>
          <p>اكتب إجابتك في دفترك، ثم راجع الحل.</p>
          <ol>
            {finalExam.questions.map((q, i) => (
              <li key={q.id}>
                <strong>{i + 1}. {q.prompt}</strong>
                <div>الإجابة: <strong>{q.answer}</strong></div>
                <div>الشرح: {q.explanation}</div>
              </li>
            ))}
          </ol>
        </div>
      ),
    },
    {
      id: 'homework',
      title: 'واجب منزلي — عشر كلمات',
      render: () => (
        <div dir="rtl" className="spell4-section">
          <h2>{homework.title}</h2>
          <p>اكتب الكلمات في دفترك، ضع خطًا تحت الهمزة، واكتب سبب رسمها.</p>
          <table className="spell4-table">
            <thead><tr><th>الكلمة</th><th>الشكل</th><th>الحرف السابق</th><th>الحركة / المد</th><th>السبب</th></tr></thead>
            <tbody>
              {homework.words.map((w, i) => (
                <tr key={i}>
                  <td><strong>{w.word}</strong></td>
                  <td>{w.form}</td>
                  <td>{w.prev}</td>
                  <td>{w.move}</td>
                  <td>{w.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
    },
    {
      id: 'summary',
      title: 'ملخص للحفظ',
      render: () => (
        <div dir="rtl" className="spell4-section">
          <h2>احفظ هذه القواعد الأربع</h2>
          <div className="spell4-cards">
            {[
              { label: 'قبلها فتحة ← على الألف', ex: 'قرَأَ، مَلْجَأ' },
              { label: 'قبلها ضمة ← على الواو', ex: 'تَبَاطُؤ، لُؤْلُؤ' },
              { label: 'قبلها كسرة ← على النبرة', ex: 'شاطِئ، قارِئ' },
              { label: 'قبلها سكون أو مد ← على السطر', ex: 'جُزْء، سَماء، هُدوء' },
            ].map((s, i) => (
              <div key={i} className="spell4-card">
                <h4>{s.label}</h4>
                <p>{s.ex}</p>
              </div>
            ))}
          </div>
          <ul>
            {summaryPoints.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      ),
    },
    {
      id: 'test',
      title: 'اختبار مستقل — 20 سؤالًا',
      render: () => (
        <div dir="rtl" className="spell4-section">
          <h2>اختبار الدرس المستقل</h2>
          <p>أربع صفحات، خمس أسئلة في كل صفحة. لا تُعرض الإجابة فورًا.</p>
          <TestRunner
            test={testDefinition}
            onProgressChange={onProgressChange}
            onFinish={onFinish}
          />
        </div>
      ),
    },
    {
      id: 'solutions',
      title: 'مراجعة الاختبار والحلول',
      render: () => (
        <div dir="rtl" className="spell4-section">
          <h2>مراجعة حلول الاختبار المستقل</h2>
          <SolutionsArea test={testDefinition} engine={engine} />
        </div>
      ),
    },
    {
      id: 'summary-next',
      title: 'الخلاصة والدرس التالي',
      render: () => (
        <div dir="rtl" className="spell4-section">
          <h2>ملخص الدرس للحفظ</h2>
          <ul>
            {summaryPoints.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
          <h3>الدرس التالي في قسم الإملاء</h3>
          <h4>{nextLessonInfo.title}</h4>
          <p>{nextLessonInfo.description}</p>
          <p><strong>أفضل طريقة:</strong> {bestMethod}</p>
        </div>
      ),
    },
  ]

  return (
    <div dir="rtl" className="spell4-page">
      <LessonFlow
        steps={steps}
        onProgressChange={onProgressChange}
        onFinish={onFinish}
      />

      {/* Teacher area */}
      <TeacherSpace>
        <h3>الشرح الكامل للقواعد</h3>
        <p>الهمزة المتطرفة تُكتب حسب حركة الحرف السابق: مفتوح → ألف، مضموم → واو، مكسور → نبرة، ساكن أو مد → سطر.</p>

        <h3>إجابات التدريبات الستة</h3>
        <ol>
          <li><strong>ملجأ</strong> — الراء مفتوحة.</li>
          <li><strong>قارئ</strong> — الراء مكسورة.</li>
          <li><strong>تباطؤ</strong> — الواو مضمومة.</li>
          <li><strong>جزء</strong> — الزاي ساكنة.</li>
          <li><strong>هدوء</strong> — بعد واو مدّ.</li>
          <li><strong>حركة الحرف الذي قبلها</strong>.</li>
        </ol>

        <h3>حلول الاختبار الخمسة</h3>
        <ol>
          <li><strong>ملجأ</strong> — الراء مفتوحة.</li>
          <li><strong>قارئ</strong> — راء مكسورة.</li>
          <li><strong>بطء</strong> — طاء ساكنة.</li>
          <li><strong>على الواو</strong> — واو مضمومة.</li>
          <li><strong>بعد ألف المدّ</strong>.</li>
        </ol>

        <h3>مفتاح الاختبار المستقل (20 سؤالًا)</h3>
        <p>كل سؤال له إجابة واحدة محددة وفق القاعدة. الإجابات الصحيحة مسجلة في مفتاح الاختبار ضمن content.ts.</p>

        <h3>حل الواجب العشري</h3>
        <table className="spell4-table">
          <thead><tr><th>كلمة</th><th>شكل الهمزة</th><th>الحرف السابق</th><th>الحركة / المد</th></tr></thead>
          <tbody>
            {homework.words.map((w, i) => (
              <tr key={i}><td>{w.word}</td><td>{w.form}</td><td>{w.prev}</td><td>{w.move}</td></tr>
            ))}
          </tbody>
        </table>

        <h3>ملاحظات التصحيح المعتمدة</h3>
        <ul>
          {teacherNotes.map((n, i) => (
            <li key={i}>{n}</li>
          ))}
        </ul>

        <h3>معايير التقييم</h3>
        <ul>
          {gradingRubrics.map((g, i) => (
            <li key={i}><strong>{g.range}:</strong> {g.label} — {g.desc}</li>
          ))}
        </ul>

        <p><strong>أفضل طريقة:</strong> {bestMethod}</p>
        <aside className="spell4-note">مرجع المصدر: `docs/source/spelling-lesson-04.md`. تدقيق: `docs/spelling-lesson-04-audit.md`.</aside>
      </TeacherSpace>
    </div>
  )
}
