import { useState } from 'react'
import { LessonFlow, type LessonStepDefinition } from '../shared/components/LessonFlow'
import { TeacherSpace } from '../shared/teacher/TeacherSpace'
import {
  SolutionsArea,
  TestPageView,
  useTestEngine,
  type TestDefinition,
  type TestEngine,
} from '../shared/test'
import {
  commonErrors,
  educationalQuizQuestions,
  goldenComparison,
  haSection,
  homeworkData,
  interactivePracticeQuestions,
  lessonHeader,
  lessonObjectives,
  lessonSummary,
  nextLessonPreview,
  openingCards,
  openingObservationNote,
  practicalMethod,
  sourceCorrections,
  taMaftuhaSection,
  taMarbutaSection,
  teacherGuide,
  testDefinition as independentTest,
  type EndingLetter,
} from './spelling-lesson-08/content'
import sourceUrl from '../../docs/source/spelling-lesson-08.md?url'
import auditUrl from '../../docs/spelling-lesson-08-audit.md?url'
import './spelling-lesson-08/lesson.css'

// eslint-disable-next-line react-refresh/only-export-components -- shared test-conformance registry imports this definition
export const testDefinition: TestDefinition = independentTest

interface Props {
  onFinish?: () => void
}

function normalizeArabicText(value: string): string {
  return value
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[.,،؛:!؟"«»()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function sentenceHasEndingLetter(sentence: string, ending: 'ة' | 'ت'): boolean {
  const cleaned = normalizeArabicText(sentence)
  if (!cleaned) return false
  const words = cleaned.split(' ').filter((word) => word.length >= 2)
  return words.some((word) => word.endsWith(ending))
}

export function LessonSpellingEight({ onFinish }: Props) {
  // Interactive practice state (8 questions)
  const [practiceChoices, setPracticeChoices] = useState<Record<string, EndingLetter>>({})
  const [practiceChecked, setPracticeChecked] = useState<Record<string, boolean>>({})

  // Educational final quiz state (10 questions)
  const [quizChoices, setQuizChoices] = useState<Record<string, string>>({})
  const [quizChecked, setQuizChecked] = useState<Record<string, boolean>>({})
  const [quizAllRevealed, setQuizAllRevealed] = useState(false)

  // Homework state (3 sections + self-review toggle)
  const [hwClassify, setHwClassify] = useState<Record<string, EndingLetter>>({})
  const [hwClassifyChecked, setHwClassifyChecked] = useState(false)
  const [hwCorrections, setHwCorrections] = useState<Record<string, string>>({})
  const [hwCorrectionsChecked, setHwCorrectionsChecked] = useState(false)
  const [hwSentenceMarbuta, setHwSentenceMarbuta] = useState('')
  const [hwSentenceMaftuha, setHwSentenceMaftuha] = useState('')
  const [hwCreationChecked, setHwCreationChecked] = useState(false)
  const [hwModelRevealed, setHwModelRevealed] = useState(false)

  // Independent 20-question test engine (4 pages)
  const baseEngine = useTestEngine(testDefinition)
  const [submitted, setSubmitted] = useState(false)
  const showTestFeedback = submitted && baseEngine.allPagesChecked

  const engine: TestEngine = {
    ...baseEngine,
    setAnswer(questionId, fieldIndex, value) {
      setSubmitted(false)
      baseEngine.setAnswer(questionId, fieldIndex, value)
    },
    uncheckPage(pageId) {
      setSubmitted(false)
      baseEngine.uncheckPage(pageId)
    },
    resetTest() {
      setSubmitted(false)
      baseEngine.resetTest()
    },
  }

  const steps: LessonStepDefinition[] = [
    // 1. المدخل وأهداف الدرس
    {
      id: 'spell8-objectives',
      title: 'أولًا: أهداف الدرس والمدخل',
      shortTitle: 'أهداف الدرس',
      group: 'المدخل والملاحظة',
      icon: '🎯',
      render: () => (
        <div className="spell8-stack" data-testid="spell8-step-objectives">
          <div className="spell8-hero-box">
            <p className="spell8-hero-box__eyebrow">{lessonHeader.sectionLabel}</p>
            <h3 className="spell8-hero-box__title">{lessonHeader.title}</h3>
            <p className="spell8-hero-box__subtitle">{lessonHeader.subtitle}</p>
            <p>{lessonHeader.intro}</p>
          </div>

          <section className="spell8-card" aria-label="أهداف الدرس">
            <h4>🎯 أولًا: أهداف الدرس</h4>
            <p>بعد دراسة الدرس، ينبغي أن تستطيع:</p>
            <ul>
              {lessonObjectives.map((objective) => (
                <li key={objective}>{objective}</li>
              ))}
            </ul>
          </section>

          <aside className="spell8-note spell8-note--important">
            <span className="spell8-badge spell8-badge--platform">توضيح تعليمي من المنصة</span>
            <p>
              يركّز هذا الدرس على خمس مهارات متكاملة: التمييز بين الحروف الثلاثة (ة / ت / ه)، وفهم
              الفرق بين الوقف والوصل، وكتابة الكلمات كتابة صحيحة، واكتشاف الأخطاء الشائعة وتصحيحها،
              وتفسير سبب صحة كل إجابة بالدليل اللغوي.
            </p>
          </aside>
        </div>
      ),
    },

    // 2. الملاحظة الافتتاحية
    {
      id: 'spell8-opening-observation',
      title: '1. هيا نبدأ بملاحظة مهمة',
      shortTitle: 'الملاحظة الافتتاحية',
      group: 'المدخل والملاحظة',
      icon: '🔍',
      render: () => (
        <div className="spell8-stack" data-testid="spell8-step-opening">
          <p>اقرأ الكلمات الآتية بصوت واضح:</p>
          <div className="spell8-letter-grid">
            {openingCards.map((card) => {
              const modifier =
                card.letter === 'ة'
                  ? 'marbuta'
                  : card.letter === 'ت'
                    ? 'maftuha'
                    : 'ha'
              return (
                <article
                  key={card.letter}
                  className={`spell8-letter-card spell8-letter-card--${modifier}`}
                  data-testid={`spell8-opening-card-${card.letter}`}
                >
                  <div className="spell8-letter-card__header">
                    <span className="spell8-letter-glyph" aria-label={`الحرف ${card.letter}`}>
                      <bdi dir="rtl">{card.letter}</bdi>
                    </span>
                    <span className="spell8-letter-forms">
                      الشكل: <bdi dir="rtl">{card.forms}</bdi>
                    </span>
                  </div>
                  <p className="spell8-letter-word">
                    <bdi dir="rtl">{card.word}</bdi> — <bdi dir="rtl">{card.vocalizedWord}</bdi>
                  </p>
                  <p>
                    <strong>النوع:</strong> {card.name}
                  </p>
                  <p>
                    <strong>السمة البصرية:</strong> {card.visualCue}
                  </p>
                  <p>
                    <strong>القاعدة المختصرة:</strong> {card.ruleHint}
                  </p>
                </article>
              )
            })}
          </div>
          <div className="spell8-note">
            <p>{openingObservationNote}</p>
          </div>
        </div>
      ),
    },

    // 3. التاء المربوطة — التعريف والأمثلة الستة
    {
      id: 'spell8-ta-marbuta-examples',
      title: '2. التاء المربوطة (ة) — التعريف والأمثلة',
      shortTitle: 'التاء المربوطة: الأمثلة',
      group: 'الحروف الثلاثة وقواعدها',
      icon: 'ة',
      render: () => (
        <div className="spell8-stack" data-testid="spell8-step-ta-marbuta-examples">
          <div className="spell8-card">
            <h3>{taMarbutaSection.heading}</h3>
            <h4>{taMarbutaSection.question}</h4>
            <p>{taMarbutaSection.definition}</p>
          </div>

          <div className="spell8-table-wrap">
            <table className="spell8-table">
              <caption>أمثلة التاء المربوطة الستة مع نوع الكلمة والجملة والتحليل</caption>
              <thead>
                <tr>
                  <th scope="col">الكلمة</th>
                  <th scope="col">نوع الكلمة</th>
                  <th scope="col">مثال في جملة</th>
                  <th scope="col">النطق وقفًا ووصلًا والتحليل</th>
                </tr>
              </thead>
              <tbody>
                {taMarbutaSection.examples.map((row) => (
                  <tr key={row.word}>
                    <td data-label="الكلمة">
                      <strong>
                        <bdi dir="rtl">{row.word}</bdi>
                      </strong>{' '}
                      (<bdi dir="rtl">{row.vocalizedWord}</bdi>)
                    </td>
                    <td data-label="نوع الكلمة">{row.wordType}</td>
                    <td data-label="مثال في جملة">
                      <p style={{ margin: 0 }}>{row.sentence}</p>
                      <small>{row.vocalizedSentence}</small>
                    </td>
                    <td data-label="النطق والتحليل">
                      <p style={{ margin: '0 0 0.25rem' }}>
                        <strong>وقفًا:</strong> {row.waqfPronunciation} · <strong>وصلًا:</strong>{' '}
                        {row.waslPronunciation}
                      </p>
                      <small>{row.analysis}</small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ),
    },

    // 4. التاء المربوطة — الوقف والوصل والقاعدة المهمة
    {
      id: 'spell8-ta-marbuta-waqf-wasl',
      title: 'نطق التاء المربوطة: الوقف والوصل والقاعدة المهمة',
      shortTitle: 'التاء المربوطة: الوقف والوصل',
      group: 'الحروف الثلاثة وقواعدها',
      icon: '🔊',
      render: () => (
        <div className="spell8-stack" data-testid="spell8-step-ta-marbuta-waqf-wasl">
          <div className="spell8-card">
            <h3>{taMarbutaSection.pronunciationTitle}</h3>
            <p>
              <strong>{taMarbutaSection.pronunciationLead}</strong>
            </p>
            <div className="spell8-card-grid">
              <div className="spell8-note">
                <h4>{taMarbutaSection.waqfExplanation.title}</h4>
                <p>{taMarbutaSection.waqfExplanation.rule}</p>
                <p>
                  <strong>{taMarbutaSection.waqfExplanation.example}</strong>
                </p>
              </div>
              <div className="spell8-note spell8-note--important">
                <h4>{taMarbutaSection.waslExplanation.title}</h4>
                <p>{taMarbutaSection.waslExplanation.rule}</p>
                <p>
                  <strong>{taMarbutaSection.waslExplanation.example}</strong>
                </p>
              </div>
            </div>
          </div>

          <div className="spell8-card">
            <h4>{taMarbutaSection.waqfAndWaslMeaning.title}</h4>
            <ul>
              <li>{taMarbutaSection.waqfAndWaslMeaning.waqf}</li>
              <li>{taMarbutaSection.waqfAndWaslMeaning.wasl}</li>
            </ul>
            <p>
              <strong>خلاصة الوقف والوصل:</strong> {taMarbutaSection.waqfAndWaslMeaning.conclusion}
            </p>
          </div>

          <div className="spell8-note spell8-note--warning">
            <h4>{taMarbutaSection.importantRule.title}</h4>
            <p>{taMarbutaSection.importantRule.main}</p>
            <p>
              <strong>تنبيه:</strong> {taMarbutaSection.importantRule.caveat}
            </p>
          </div>
        </div>
      ),
    },

    // 5. التاء المفتوحة — التعريف والأمثلة الستة
    {
      id: 'spell8-ta-maftuha-examples',
      title: '3. التاء المفتوحة (ت) — التعريف والأمثلة',
      shortTitle: 'التاء المفتوحة: الأمثلة',
      group: 'الحروف الثلاثة وقواعدها',
      icon: 'ت',
      render: () => (
        <div className="spell8-stack" data-testid="spell8-step-ta-maftuha-examples">
          <div className="spell8-card">
            <h3>{taMaftuhaSection.heading}</h3>
            <h4>{taMaftuhaSection.question}</h4>
            <p>{taMaftuhaSection.definition}</p>
          </div>

          <div className="spell8-table-wrap">
            <table className="spell8-table">
              <caption>أمثلة التاء المفتوحة الستة مع نوع الكلمة والجملة والتحليل</caption>
              <thead>
                <tr>
                  <th scope="col">الكلمة</th>
                  <th scope="col">نوعها</th>
                  <th scope="col">مثال</th>
                  <th scope="col">النطق وقفًا ووصلًا والتحليل</th>
                </tr>
              </thead>
              <tbody>
                {taMaftuhaSection.examples.map((row) => (
                  <tr key={row.word}>
                    <td data-label="الكلمة">
                      <strong>
                        <bdi dir="rtl">{row.word}</bdi>
                      </strong>{' '}
                      (<bdi dir="rtl">{row.vocalizedWord}</bdi>)
                    </td>
                    <td data-label="نوعها">{row.wordType}</td>
                    <td data-label="مثال">
                      <p style={{ margin: 0 }}>{row.sentence}</p>
                      <small>{row.vocalizedSentence}</small>
                    </td>
                    <td data-label="النطق والتحليل">
                      <p style={{ margin: '0 0 0.25rem' }}>
                        <strong>وقفًا:</strong> {row.waqfPronunciation} · <strong>وصلًا:</strong>{' '}
                        {row.waslPronunciation}
                      </p>
                      <small>{row.analysis}</small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <aside className="spell8-note">
            <span className="spell8-badge spell8-badge--platform">توضيح تعليمي من المنصة · ت-٥</span>
            <p>
              في مثال «كتبتْ الطالبةُ الواجبَ» الأصل في تاء التأنيث أن تكون ساكنة («كتبتْ سارةُ»)،
              وعند وصلها بكلمة تبدأ بـ«الـ» التعريف تُحرَّك بالكسر نطقًا («كَتَبَتِ الطَّالِبَةُ») منعًا
              لالتقاء الساكنين، ويبقى رسمها الإملائي تاءً مفتوحة (ت) في جميع الأحوال.
            </p>
          </aside>
        </div>
      ),
    },

    // 6. مواضع التاء المفتوحة ومقارنة معلمة/معلمات
    {
      id: 'spell8-ta-maftuha-positions',
      title: 'أين تأتي التاء المفتوحة؟ ومقارنة (معلمة / معلمات)',
      shortTitle: 'مواضع التاء المفتوحة',
      group: 'الحروف الثلاثة وقواعدها',
      icon: '📌',
      render: () => (
        <div className="spell8-stack" data-testid="spell8-step-ta-maftuha-positions">
          <h3>{taMaftuhaSection.positionsTitle}</h3>
          <div className="spell8-card-grid">
            {taMaftuhaSection.positions.map((pos) => (
              <article key={pos.id} className="spell8-card">
                <h4>{pos.heading}</h4>
                <p>
                  <strong>{pos.examplesText}</strong>
                </p>
                <ul>
                  {pos.words.map((word) => (
                    <li key={word}>
                      <bdi dir="rtl">{word}</bdi>
                    </li>
                  ))}
                </ul>
                <p>{pos.explanation}</p>
              </article>
            ))}
          </div>

          <div className="spell8-note spell8-note--important">
            <h4>مقارنة مهمة بين المفرد والجمع: «معلمة» و«معلمات»</h4>
            <p>{taMaftuhaSection.singularPluralComparison.note}</p>
            <ul>
              <li>
                <strong>{taMaftuhaSection.singularPluralComparison.singular}:</strong>{' '}
                {taMaftuhaSection.singularPluralComparison.singularEnding}.
              </li>
              <li>
                <strong>{taMaftuhaSection.singularPluralComparison.plural}:</strong>{' '}
                {taMaftuhaSection.singularPluralComparison.pluralEnding}.
              </li>
            </ul>
          </div>
        </div>
      ),
    },

    // 7. الهاء في آخر الكلمة (ه)
    {
      id: 'spell8-ha-ending',
      title: '4. الهاء في آخر الكلمة (ه) — الأصلية والضميرية',
      shortTitle: 'الهاء في آخر الكلمة',
      group: 'الحروف الثلاثة وقواعدها',
      icon: 'ه',
      render: () => (
        <div className="spell8-stack" data-testid="spell8-step-ha-ending">
          <div className="spell8-card">
            <h3>{haSection.heading}</h3>
            <h4>{haSection.question}</h4>
            <p>{haSection.definition}</p>
          </div>

          <div className="spell8-table-wrap">
            <table className="spell8-table">
              <caption>أمثلة الهاء في آخر الكلمة (الأصلية والضميرية)</caption>
              <thead>
                <tr>
                  <th scope="col">الكلمة</th>
                  <th scope="col">نوع الهاء</th>
                  <th scope="col">مثال في جملة</th>
                  <th scope="col">التحليل اللغوي</th>
                </tr>
              </thead>
              <tbody>
                {haSection.examples.map((row) => (
                  <tr key={row.word}>
                    <td data-label="الكلمة">
                      <strong>
                        <bdi dir="rtl">{row.word}</bdi>
                      </strong>{' '}
                      (<bdi dir="rtl">{row.vocalizedWord}</bdi>)
                    </td>
                    <td data-label="نوع الهاء">{row.haKind}</td>
                    <td data-label="مثال في جملة">
                      <p style={{ margin: 0 }}>{row.sentence}</p>
                      <small>{row.vocalizedSentence}</small>
                    </td>
                    <td data-label="التحليل اللغوي">{row.analysis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="spell8-card-grid">
            <div className="spell8-card">
              <h4>لاحظ الفرق:</h4>
              <ul>
                {haSection.differenceNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>

            <div className="spell8-card">
              <h4>{haSection.waqfWaslQuestion}</h4>
              <p>
                <strong>{haSection.waqfWaslAnswer}</strong>
              </p>
              <ul>
                <li>{haSection.waqfExample}</li>
                <li>{haSection.waslExample}</li>
              </ul>
              <p>{haSection.movementNote}</p>
            </div>
          </div>
        </div>
      ),
    },

    // 8. المقارنة الذهبية بين الحروف الثلاثة
    {
      id: 'spell8-golden-comparison',
      title: '5. المقارنة الذهبية بين الحروف الثلاثة',
      shortTitle: 'المقارنة الذهبية',
      group: 'المقارنة والطريقة العملية',
      icon: '⚖️',
      render: () => (
        <div className="spell8-stack" data-testid="spell8-step-golden-comparison">
          <h3>5. المقارنة الذهبية بين الحروف الثلاثة</h3>
          <div className="spell8-letter-grid">
            {goldenComparison.map((item) => {
              const modifier =
                item.letter === 'ة'
                  ? 'marbuta'
                  : item.letter === 'ت'
                    ? 'maftuha'
                    : 'ha'
              return (
                <article
                  key={item.letter}
                  className={`spell8-letter-card spell8-letter-card--${modifier}`}
                >
                  <div className="spell8-letter-card__header">
                    <span className="spell8-letter-glyph">
                      <bdi dir="rtl">{item.letter}</bdi>
                    </span>
                    <span className="spell8-letter-forms">{item.forms}</span>
                  </div>
                  <h4>{item.title}</h4>
                  <p>
                    <strong>القاعدة:</strong> {item.rule}
                  </p>
                  <p>
                    <strong>{item.examplePair}</strong>
                  </p>
                  <p>{item.explanation}</p>
                </article>
              )
            })}
          </div>

          <div className="spell8-table-wrap">
            <table className="spell8-table">
              <caption>جدول المقارنة النصية الشاملة بين (ة) و(ت) و(ه)</caption>
              <thead>
                <tr>
                  <th scope="col">الحرف واسمه</th>
                  <th scope="col">صوته عند الوقف</th>
                  <th scope="col">صوته عند الوصل</th>
                  <th scope="col">المثال التطبيقي</th>
                </tr>
              </thead>
              <tbody>
                {goldenComparison.map((item) => (
                  <tr key={item.letter}>
                    <td data-label="الحرف واسمه">
                      <strong>
                        {item.letter} — {item.title}
                      </strong>{' '}
                      ({item.forms})
                    </td>
                    <td data-label="صوته عند الوقف">{item.waqfSound}</td>
                    <td data-label="صوته عند الوصل">{item.waslSound}</td>
                    <td data-label="المثال التطبيقي">{item.examplePair}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ),
    },

    // 9. الطريقة العملية للتمييز والمقارنات الأربع
    {
      id: 'spell8-practical-method',
      title: '6. الطريقة العملية للتمييز بينها',
      shortTitle: 'الطريقة العملية',
      group: 'المقارنة والطريقة العملية',
      icon: '🧭',
      render: () => (
        <div className="spell8-stack" data-testid="spell8-step-practical-method">
          <div className="spell8-card">
            <h3>{practicalMethod.heading}</h3>
            <p>{practicalMethod.lead}</p>
            <ol>
              {practicalMethod.steps.map((stepText) => (
                <li key={stepText}>{stepText}</li>
              ))}
            </ol>
          </div>

          <div className="spell8-table-wrap">
            <table className="spell8-table">
              <caption>{practicalMethod.comparisonsHeading}</caption>
              <thead>
                <tr>
                  <th scope="col">عند المقارنة</th>
                  <th scope="col">ماذا نلاحظ؟ (نص المصدر)</th>
                  <th scope="col">التفسير الصرفي والإملائي المفصل</th>
                </tr>
              </thead>
              <tbody>
                {practicalMethod.comparisons.map((row) => (
                  <tr key={row.pair}>
                    <td data-label="عند المقارنة">
                      <strong>
                        <bdi dir="rtl">{row.pair}</bdi>
                      </strong>
                      <div>
                        <small>{row.vocalizedPair}</small>
                      </div>
                    </td>
                    <td data-label="ماذا نلاحظ؟">{row.sourceObservation}</td>
                    <td data-label="التفسير المفصل">{row.platformExplanation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="spell8-note spell8-note--warning">
            <p>
              <strong>{practicalMethod.crucialWarning}</strong>
            </p>
          </div>
        </div>
      ),
    },

    // 10. أخطاء شائعة يجب تجنبها
    {
      id: 'spell8-common-errors',
      title: '7. أخطاء شائعة يجب تجنّبها',
      shortTitle: 'أخطاء شائعة',
      group: 'المقارنة والطريقة العملية',
      icon: '⚠️',
      render: () => (
        <div className="spell8-stack" data-testid="spell8-step-common-errors">
          <h3>7. أخطاء شائعة يجب تجنّبها</h3>
          <div className="spell8-card-grid">
            {commonErrors.map((err) => (
              <article key={err.id} className="spell8-card" data-testid={`spell8-error-${err.id}`}>
                <h4>
                  <span style={{ color: '#9b2226' }}>{err.wrong}</span>
                </h4>
                <p>
                  <strong style={{ color: '#1b4332' }}>{err.correct}</strong>
                </p>
                <p>{err.sourceExplanation}</p>
                <p className="spell8-question-meta">{err.diagnosticProof}</p>
              </article>
            ))}
          </div>
        </div>
      ),
    },

    // 11. التدريب التفاعلي: اختر الحرف الصحيح (٨ أسئلة)
    {
      id: 'spell8-interactive-practice',
      title: '8. تدريب تفاعلي: اختر الحرف الصحيح',
      shortTitle: 'تدريب تفاعلي (٨)',
      group: 'التدريبات والواجب',
      icon: '✍️',
      render: () => (
        <div className="spell8-stack" data-testid="spell8-step-practice">
          <div className="spell8-card">
            <h3>8. تدريب تفاعلي: اختر الحرف الصحيح</h3>
            <p>اختر الإجابة، ثم اضغط «تحقّق من الإجابة» لتعرف النتيجة وسببها.</p>
            <p className="spell8-question-meta">
              عُرضت كل جملة مع سياقها الكامل المفهوم حتى تتضح الكلمة المقصودة دون التباس، وتظهر
              الكلمة مكتوبة كاملةً بعد التحقق. هذا التدريب تعليمي ولا يُحتسب في درجة الاختبار المستقل.
            </p>
          </div>

          <div className="spell8-question-list">
            {interactivePracticeQuestions.map((q) => {
              const selected = practiceChoices[q.id]
              const isChecked = Boolean(practiceChecked[q.id])
              const isCorrect = selected === q.answer
              return (
                <fieldset
                  key={q.id}
                  className="spell8-question-card"
                  data-testid={`spell8-practice-${q.id}`}
                >
                  <legend>
                    {q.number}. {q.sourcePrompt}
                  </legend>
                  <p className="spell8-question-meta">
                    السياق المقصود في الجملة التامة: <strong>{q.clarifiedSentence}</strong>
                  </p>
                  <div className="spell8-options" role="radiogroup" aria-label={q.sourcePrompt}>
                    {q.options.map((opt) => (
                      <label
                        key={opt}
                        className={`spell8-choice${selected === opt ? ' spell8-choice--selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          value={opt}
                          checked={selected === opt}
                          onChange={() => {
                            setPracticeChoices((prev) => ({ ...prev, [q.id]: opt }))
                            setPracticeChecked((prev) => ({ ...prev, [q.id]: false }))
                          }}
                        />
                        <span>
                          <bdi dir="rtl">{opt}</bdi>
                        </span>
                      </label>
                    ))}
                  </div>
                  <div className="spell8-actions">
                    <button
                      type="button"
                      className="button button--primary"
                      disabled={!selected}
                      onClick={() => setPracticeChecked((prev) => ({ ...prev, [q.id]: true }))}
                    >
                      تحقّق من الإجابة
                    </button>
                  </div>

                  {isChecked && selected && (
                    <div
                      role="status"
                      className={`spell8-feedback ${isCorrect ? 'spell8-feedback--correct' : 'spell8-feedback--wrong'}`}
                      data-testid={`spell8-practice-feedback-${q.id}`}
                    >
                      <p>
                        <strong>
                          {isCorrect ? '✓ إجابة صحيحة' : '✗ إجابة تحتاج إلى تصحيح'} — الحرف الصحيح: «
                          {q.answer}»
                        </strong>{' '}
                        · الكلمة مكتوبة كاملة:{' '}
                        <span className="spell8-completed-word">
                          <bdi dir="rtl">{q.completedWord}</bdi>
                        </span>
                      </p>
                      <p>{q.explanation}</p>
                      <ul>
                        {q.options.map((opt) => (
                          <li key={opt}>
                            <strong>«{opt}»:</strong> {q.distractorReasons[opt]}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </fieldset>
              )
            })}
          </div>

          <div className="spell8-actions">
            <button
              type="button"
              className="button button--primary"
              disabled={Object.keys(practiceChoices).length === 0}
              onClick={() => {
                const nextChecked: Record<string, boolean> = {}
                for (const q of interactivePracticeQuestions) {
                  if (practiceChoices[q.id]) nextChecked[q.id] = true
                }
                setPracticeChecked(nextChecked)
              }}
            >
              تحقّق من جميع الإجابات المختارة
            </button>
            <button
              type="button"
              className="button button--ghost"
              onClick={() => {
                setPracticeChoices({})
                setPracticeChecked({})
              }}
            >
              إعادة التدريب التفاعلي
            </button>
          </div>
        </div>
      ),
    },

    // 12. الاختبار الختامي الشامل (١٠ أسئلة تعليمية)
    {
      id: 'spell8-educational-quiz',
      title: '9. اختبار ختامي شامل 📝',
      shortTitle: 'اختبار ختامي (١٠)',
      group: 'التدريبات والواجب',
      icon: '📝',
      render: () => {
        const answeredCount = educationalQuizQuestions.filter((q) => Boolean(quizChoices[q.id])).length
        const correctCount = educationalQuizQuestions.filter(
          (q) => quizChoices[q.id] === q.answer,
        ).length
        return (
          <div className="spell8-stack" data-testid="spell8-step-educational-quiz">
            <div className="spell8-card">
              <h3>9. اختبار ختامي شامل 📝</h3>
              <p>حاول حلّ الأسئلة الآتية بنفسك قبل الاطلاع على الحلول.</p>
              <p className="spell8-question-meta">
                هذا اختبار تعليمي داخل الدرس لمراجعة المفاهيم (١٠ أسئلة)، وهو مستقل عن الاختبار
                الرسمي ذي العشرين سؤالًا في «منطقة الاختبارات».
              </p>
            </div>

            <div className="spell8-question-list">
              {educationalQuizQuestions.map((q) => {
                const selected = quizChoices[q.id]
                const isChecked = Boolean(quizChecked[q.id]) || quizAllRevealed
                const isCorrect = selected === q.answer
                return (
                  <fieldset
                    key={q.id}
                    className="spell8-question-card"
                    data-testid={`spell8-eduquiz-${q.id}`}
                  >
                    <legend>
                      {q.number}. {q.prompt}
                    </legend>
                    {q.clarifiedWord && (
                      <p className="spell8-question-meta">
                        السياق المقصود: هذه <strong>شجرةٌ</strong> مثمرةٌ (اختر الحرف الأخير لكلمة
                        «شجرة»).
                      </p>
                    )}
                    <div className="spell8-options" role="radiogroup" aria-label={q.prompt}>
                      {q.options.map((opt) => (
                        <label
                          key={opt}
                          className={`spell8-choice${selected === opt ? ' spell8-choice--selected' : ''}`}
                        >
                          <input
                            type="radio"
                            name={q.id}
                            value={opt}
                            checked={selected === opt}
                            onChange={() => {
                              setQuizChoices((prev) => ({ ...prev, [q.id]: opt }))
                              setQuizChecked((prev) => ({ ...prev, [q.id]: false }))
                              setQuizAllRevealed(false)
                            }}
                          />
                          <span>
                            <bdi dir="rtl">{opt}</bdi>
                          </span>
                        </label>
                      ))}
                    </div>
                    <div className="spell8-actions">
                      <button
                        type="button"
                        className="button button--primary"
                        disabled={!selected}
                        onClick={() => setQuizChecked((prev) => ({ ...prev, [q.id]: true }))}
                      >
                        تحقّق من السؤال {q.number}
                      </button>
                    </div>

                    {isChecked && (
                      <div
                        role="status"
                        className={`spell8-feedback ${isCorrect ? 'spell8-feedback--correct' : 'spell8-feedback--wrong'}`}
                        data-testid={`spell8-eduquiz-feedback-${q.id}`}
                      >
                        <p>
                          <strong>
                            {selected
                              ? isCorrect
                                ? '✓ إجابة صحيحة'
                                : `✗ اخترت «${selected}»`
                              : 'لم تختر إجابة بعد'}{' '}
                            — الإجابة النموذجية: «{q.answer}»
                          </strong>
                          {q.clarifiedWord && (
                            <>
                              {' '}
                              · الكلمة الكاملة:{' '}
                              <span className="spell8-completed-word">{q.clarifiedWord}</span>
                            </>
                          )}
                        </p>
                        <p>{q.explanation}</p>
                        <ul>
                          {q.options.map((opt) => (
                            <li key={opt}>
                              <strong>«{opt}»:</strong> {q.distractorReasons[opt]}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </fieldset>
                )
              })}
            </div>

            <div className="spell8-actions">
              <button
                type="button"
                className="button button--primary"
                disabled={answeredCount === 0}
                onClick={() => setQuizAllRevealed(true)}
              >
                تصحيح الاختبار وإظهار الحلول
              </button>
              <button
                type="button"
                className="button button--ghost"
                onClick={() => {
                  setQuizChoices({})
                  setQuizChecked({})
                  setQuizAllRevealed(false)
                }}
              >
                إعادة الاختبار الختامي التعليمي
              </button>
            </div>

            {quizAllRevealed && (
              <div
                role="status"
                className="spell8-note spell8-note--important"
                data-testid="spell8-eduquiz-summary"
              >
                <p>
                  <strong>
                    نتيجة المراجعة التعليمية: {correctCount} إجابات صحيحة من{' '}
                    {educationalQuizQuestions.length} (أجبت عن {answeredCount} أسئلة).
                  </strong>
                </p>
              </div>
            )}
          </div>
        )
      },
    },

    // 13. الواجب المنزلي (الأقسام الثلاثة + إجابات الواجب للمراجعة الذاتية)
    {
      id: 'spell8-homework',
      title: '10. واجب منزلي ✍️',
      shortTitle: 'الواجب المنزلي',
      group: 'التدريبات والواجب',
      icon: '🏠',
      render: () => {
        const s1Valid = sentenceHasEndingLetter(hwSentenceMarbuta, 'ة')
        const s2Valid = sentenceHasEndingLetter(hwSentenceMaftuha, 'ت')
        return (
          <div className="spell8-stack" data-testid="spell8-step-homework">
            <h3>{homeworkData.heading}</h3>

            {/* السؤال الأول: تصنيف الكلمات العشر */}
            <section className="spell8-card" data-testid="spell8-hw-section-1">
              <h4>{homeworkData.sectionOne.title}</h4>
              <p>
                <strong>{homeworkData.sectionOne.wordsListText}</strong>
              </p>
              <div className="spell8-question-list">
                {homeworkData.sectionOne.items.map((item) => {
                  const chosen = hwClassify[item.word]
                  const correct = chosen === item.category
                  return (
                    <fieldset key={item.word} className="spell8-question-card">
                      <legend>
                        الكلمة: <bdi dir="rtl">{item.word}</bdi>
                      </legend>
                      <div className="spell8-options" role="radiogroup" aria-label={`تصنيف ${item.word}`}>
                        {(
                          [
                            ['ة', 'تاء مربوطة (ة)'],
                            ['ت', 'تاء مفتوحة (ت)'],
                            ['ه', 'هاء (ه)'],
                          ] as const
                        ).map(([val, label]) => (
                          <label
                            key={val}
                            className={`spell8-choice${chosen === val ? ' spell8-choice--selected' : ''}`}
                          >
                            <input
                              type="radio"
                              name={`hw-classify-${item.word}`}
                              value={val}
                              checked={chosen === val}
                              onChange={() => {
                                setHwClassify((prev) => ({ ...prev, [item.word]: val }))
                                setHwClassifyChecked(false)
                              }}
                            />
                            <span>{label}</span>
                          </label>
                        ))}
                      </div>
                      {hwClassifyChecked && (
                        <p
                          role="status"
                          className={`spell8-feedback ${correct ? 'spell8-feedback--correct' : 'spell8-feedback--wrong'}`}
                        >
                          <strong>
                            {correct ? '✓ تصنيف صحيح' : `✗ الصواب: ${item.categoryLabel}`}
                          </strong>{' '}
                          — {item.reason}
                        </p>
                      )}
                    </fieldset>
                  )
                })}
              </div>
              <div className="spell8-actions">
                <button
                  type="button"
                  className="button button--primary"
                  disabled={Object.keys(hwClassify).length === 0}
                  onClick={() => setHwClassifyChecked(true)}
                >
                  تحقّق من تصنيف الكلمات العشر
                </button>
              </div>
            </section>

            {/* السؤال الثاني: صحح الأخطاء الإملائية في الجمل الأربع */}
            <section className="spell8-card" data-testid="spell8-hw-section-2">
              <h4>{homeworkData.sectionTwo.title}</h4>
              <div className="spell8-question-list">
                {homeworkData.sectionTwo.items.map((item) => {
                  const value = hwCorrections[item.id] ?? ''
                  const cleanedInput = normalizeArabicText(value)
                  const isCorrect =
                    cleanedInput.length > 0 &&
                    (item.acceptedAnswers.some(
                      (ans) => normalizeArabicText(ans) === cleanedInput,
                    ) ||
                      cleanedInput.includes(normalizeArabicText(item.correctWord)))
                  return (
                    <div key={item.id} className="spell8-question-card">
                      <p>
                        <strong>
                          {item.number}. {item.wrongSentence}
                        </strong>
                      </p>
                      <label>
                        اكتب التصحيح (الكلمة الصحيحة أو الجملة المصححة كاملة):
                        <input
                          type="text"
                          className="spell8-input"
                          value={value}
                          onChange={(e) => {
                            setHwCorrections((prev) => ({ ...prev, [item.id]: e.target.value }))
                            setHwCorrectionsChecked(false)
                          }}
                          placeholder={`صحّح «${item.wrongWord}»`}
                        />
                      </label>
                      {hwCorrectionsChecked && (
                        <div
                          role="status"
                          className={`spell8-feedback ${isCorrect ? 'spell8-feedback--correct' : 'spell8-feedback--wrong'}`}
                        >
                          <p>
                            <strong>
                              {isCorrect ? '✓ تصحيح سليم' : 'راجع التصحيح النموذجي'} — الكلمة الصحيحة: «
                              {item.correctWord}» · الجملة المصححة: «{item.correctedSentence}»
                            </strong>
                          </p>
                          <p>{item.explanation}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              <div className="spell8-actions">
                <button
                  type="button"
                  className="button button--primary"
                  disabled={Object.values(hwCorrections).every((v) => !v?.trim())}
                  onClick={() => setHwCorrectionsChecked(true)}
                >
                  تحقّق من تصحيح الجمل الأربع
                </button>
              </div>
            </section>

            {/* السؤال الثالث: كتابة جملتين من إنشاء المتعلم */}
            <section className="spell8-card" data-testid="spell8-hw-section-3">
              <h4>{homeworkData.sectionThree.title}</h4>
              <p className="spell8-question-meta">{homeworkData.sectionThree.guidance}</p>
              <div className="spell8-question-list">
                <label className="spell8-question-card">
                  <strong>الجملة الأولى (تتضمن كلمة تنتهي بتاء مربوطة «ة»):</strong>
                  <textarea
                    rows={2}
                    className="spell8-textarea"
                    value={hwSentenceMarbuta}
                    onChange={(e) => {
                      setHwSentenceMarbuta(e.target.value)
                      setHwCreationChecked(false)
                    }}
                    placeholder="اكتب جملة مفيدة من إنشائك فيها كلمة تنتهي بـ(ة)..."
                  />
                </label>
                <label className="spell8-question-card">
                  <strong>الجملة الثانية (تتضمن كلمة تنتهي بتاء مفتوحة «ت»):</strong>
                  <textarea
                    rows={2}
                    className="spell8-textarea"
                    value={hwSentenceMaftuha}
                    onChange={(e) => {
                      setHwSentenceMaftuha(e.target.value)
                      setHwCreationChecked(false)
                    }}
                    placeholder="اكتب جملة مفيدة من إنشائك فيها كلمة تنتهي بـ(ت)..."
                  />
                </label>
              </div>
              <div className="spell8-actions">
                <button
                  type="button"
                  className="button button--primary"
                  disabled={!hwSentenceMarbuta.trim() && !hwSentenceMaftuha.trim()}
                  onClick={() => setHwCreationChecked(true)}
                >
                  تحقّق من جملتي الإنشاء
                </button>
              </div>
              {hwCreationChecked && (
                <div
                  role="status"
                  className={`spell8-feedback ${s1Valid && s2Valid ? 'spell8-feedback--correct' : 'spell8-feedback--wrong'}`}
                  data-testid="spell8-hw-creation-feedback"
                >
                  <p>
                    <strong>
                      {s1Valid && s2Valid
                        ? '✓ أحسنت! تضمنت الجملة الأولى كلمة مختومة بـ(ة)، والجملة الثانية كلمة مختومة بـ(ت).'
                        : 'مراجعة استرشادية لجملتي الإنشاء:'}
                    </strong>
                  </p>
                  <ul>
                    <li>
                      الجملة الأولى: {s1Valid ? 'تحتوي على كلمة تنتهي بتاء مربوطة (ة).' : 'أضف كلمة تنتهي بتاء مربوطة (ة) مثل: مدرسة، شجرة، قصة.'}
                    </li>
                    <li>
                      الجملة الثانية: {s2Valid ? 'تحتوي على كلمة تنتهي بتاء مفتوحة (ت).' : 'أضف كلمة تنتهي بتاء مفتوحة (ت) مثل: بيت، صوت، كتبتْ، معلمات.'}
                    </li>
                  </ul>
                  <p>
                    تُقبل جميع الجمل العربية الصحيحة التي تحقق الشرط، ولا تقتصر الإجابة على جملة واحدة.
                  </p>
                </div>
              )}
            </section>

            {/* إجابات الواجب للمراجعة الذاتية */}
            <section className="spell8-card" data-testid="spell8-hw-self-review">
              <h4>إجابات الواجب للمراجعة الذاتية</h4>
              <div className="spell8-actions">
                <button
                  type="button"
                  className="button button--primary"
                  onClick={() => setHwModelRevealed((prev) => !prev)}
                >
                  {hwModelRevealed ? 'إخفاء الإجابات النموذجية' : 'إظهار الإجابات النموذجية'}
                </button>
              </div>

              {hwModelRevealed && (
                <div className="spell8-stack" style={{ marginTop: '1rem' }} data-testid="spell8-hw-models">
                  <div className="spell8-note spell8-note--important">
                    <h5>حل السؤال الأول (تصنيف الكلمات العشر):</h5>
                    <ul>
                      <li>
                        <strong>تاء مربوطة (ة):</strong> مدرسة، شجرة، نافذة.
                      </li>
                      <li>
                        <strong>تاء مفتوحة (ت):</strong> بيت، معلمات، أخت، كتبتْ.
                      </li>
                      <li>
                        <strong>هاء (ه):</strong> وجه، قلمه، كتابه.
                      </li>
                    </ul>
                  </div>

                  <div className="spell8-note">
                    <h5>حل السؤال الثاني (تصحيح الجمل الأربع مع شرح السبب):</h5>
                    <ol>
                      {homeworkData.sectionTwo.items.map((item) => (
                        <li key={item.id}>
                          <strong>{item.correctedSentence}</strong> — {item.explanation}
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="spell8-note">
                    <h5>أمثلة نموذجية للسؤال الثالث (وتُقبل كل جملة صحيحة من إنشائك):</h5>
                    <p>
                      <strong>أمثلة لجمل تتضمن تاء مربوطة (ة):</strong>{' '}
                      {homeworkData.sectionThree.sampleSentencesTaMarbuta.join(' — ')}
                    </p>
                    <p>
                      <strong>أمثلة لجمل تتضمن تاء مفتوحة (ت):</strong>{' '}
                      {homeworkData.sectionThree.sampleSentencesTaMaftuha.join(' — ')}
                    </p>
                  </div>
                </div>
              )}
            </section>
          </div>
        )
      },
    },

    // 14. خلاصة الدرس للحفظ والدرس التالي
    {
      id: 'spell8-summary-next',
      title: 'خلاصة الدرس للحفظ والدرس التالي',
      shortTitle: 'خلاصة الدرس والدرس التالي',
      group: 'الخلاصة والدرس التالي',
      icon: '🧠',
      render: () => (
        <div className="spell8-stack" data-testid="spell8-step-summary-next">
          <section className="spell8-card">
            <h3>{lessonSummary.heading}</h3>
            <div className="spell8-letter-grid">
              {lessonSummary.cards.map((card) => {
                const modifier =
                  card.letter === 'ة'
                    ? 'marbuta'
                    : card.letter === 'ت'
                      ? 'maftuha'
                      : 'ha'
                return (
                  <article
                    key={card.letter}
                    className={`spell8-letter-card spell8-letter-card--${modifier}`}
                  >
                    <div className="spell8-letter-card__header">
                      <span className="spell8-letter-glyph">{card.letter}</span>
                      <strong>{card.title}</strong>
                    </div>
                    <p>{card.rule}</p>
                    <p>
                      <strong>{card.examples}</strong>
                    </p>
                  </article>
                )
              })}
            </div>
            <div className="spell8-note spell8-note--important" style={{ marginTop: '1rem' }}>
              <p>
                <strong>{lessonSummary.goldenRule}</strong>
              </p>
            </div>
          </section>

          <section className="spell8-card" data-testid="spell8-next-lesson-preview">
            <h3>{nextLessonPreview.heading}</h3>
            <h4>موضوع الدرس التاسع القادم: {nextLessonPreview.topicTitle}</h4>
            <p>{nextLessonPreview.text}</p>
            <p>
              <strong>أمثلة تمهيدية:</strong>{' '}
              {nextLessonPreview.examples.map((ex, idx) => (
                <span key={ex}>
                  <bdi dir="rtl">{ex}</bdi>
                  {idx < nextLessonPreview.examples.length - 1 ? ' — ' : '.'}
                </span>
              ))}
            </p>
            <p className="spell8-question-meta">{nextLessonPreview.scopeNote}</p>
          </section>
        </div>
      ),
    },

    // 15–18. صفحات الاختبار المستقل الأربع (٢٠ سؤالًا)
    ...testDefinition.pages.map((page, index) => ({
      id: `spell8-test-page-${index + 1}`,
      title: page.title,
      shortTitle: `اختبار: صفحة ${index + 1}`,
      group: 'منطقة الاختبارات',
      icon: '🧪',
      render: () => (
        <div className="spell8-stack" data-testid={`spell8-test-step-${index + 1}`}>
          <p>{testDefinition.description}</p>
          <TestPageView
            page={page}
            engine={engine}
            revealFeedback={showTestFeedback}
            questionTestIdPrefix="spell8-question"
          />
        </div>
      ),
    })),

    // 19. تسليم الاختبار والنتيجة
    {
      id: 'spell8-test-submit',
      title: 'تسليم الاختبار والنتيجة',
      shortTitle: 'تسليم الاختبار',
      group: 'منطقة الاختبارات',
      icon: '🏁',
      render: () => (
        <div className="spell8-stack" data-testid="spell8-step-submit">
          <div className="spell8-card">
            <h3>تسليم الاختبار المستقل (٢٠ سؤالًا)</h3>
            <p>
              يتكوّن الاختبار المستقل من ٢٠ سؤالًا موزعة على أربع صفحات. لا تظهر صحة كل إجابة أو
              الدرجة النهائية قبل تسليم الاختبار هنا. إذا عدّلت أي إجابة بعد التسليم، تُبطل النتيجة
              السابقة حتى تعيد التسليم، فلا يُحتسب أي سؤال مرتين.
            </p>
            <div className="spell8-actions">
              <button
                type="button"
                className="button button--primary"
                onClick={() => {
                  testDefinition.pages.forEach((page) => baseEngine.checkPage(page.id))
                  setSubmitted(true)
                }}
              >
                تسليم الاختبار
              </button>
              <button type="button" className="button button--ghost" onClick={engine.resetTest}>
                إعادة الاختبار المستقل
              </button>
            </div>

            {showTestFeedback && (
              <div
                role="status"
                className="spell8-feedback spell8-feedback--correct"
                data-testid="spell8-result"
              >
                <p>
                  <strong>
                    النتيجة: {baseEngine.finalResult.correct} من {baseEngine.finalResult.total}
                  </strong>{' '}
                  (الإجابات الصحيحة: {baseEngine.finalResult.correct} · الخاطئة:{' '}
                  {baseEngine.finalResult.wrong} · غير المجابة: {baseEngine.finalResult.unanswered})
                </p>
                <p>
                  انتقل إلى خطوة «حلول الاختبار المستقل» لمراجعة الإجابة الصحيحة وتفسير القاعدة وسبب
                  استبعاد المشتتات لكل سؤال.
                </p>
              </div>
            )}
          </div>
        </div>
      ),
    },

    // 20. حلول الاختبار المستقل
    {
      id: 'spell8-solutions',
      title: 'حلول الاختبار المستقل',
      shortTitle: 'حلول الاختبارات',
      group: 'حلول الاختبارات',
      icon: '🔑',
      render: () => (
        <div className="spell8-stack" data-testid="spell8-step-solutions">
          {showTestFeedback ? (
            <SolutionsArea
              test={testDefinition}
              engine={engine}
              revealFeedback={showTestFeedback}
              title="حلول الاختبار المستقل — التاء المربوطة والتاء المفتوحة والهاء"
              eyebrow="حلول الاختبارات · بعد التسليم"
            />
          ) : (
            <div className="spell8-note spell8-note--warning" data-testid="spell8-solutions-locked">
              <h3>الحلول مقفلة حتى تسليم الاختبار</h3>
              <p>
                لا تُكشف حلول الأسئلة العشرين للاختبار المستقل قبل تسليم الاختبار في خطوة «تسليم
                الاختبار والنتيجة». إذا غيّرت إجابة بعد التسليم يُعاد قفل الحلول حتى تسلّم أحدث
                مجموعة إجابات.
              </p>
            </div>
          )}
        </div>
      ),
    },

    // 21. منطقة المعلم
    {
      id: 'spell8-teacher',
      title: 'منطقة المعلم',
      shortTitle: 'منطقة المعلم',
      group: 'منطقة المعلم',
      icon: '🎓',
      render: () => (
        <TeacherSpace>
          <div className="spell8-stack" data-testid="spell8-teacher-content">
            <section className="spell8-card">
              <h3>دليل المعلم — الدرس الثامن: التاء المربوطة والتاء المفتوحة والهاء</h3>
              <p>{teacherGuide.pedagogicalOverview}</p>
              <h4>أهداف الدرس الخمسة:</h4>
              <ul>
                {lessonObjectives.map((obj) => (
                  <li key={obj}>{obj}</li>
                ))}
              </ul>
            </section>

            <section className="spell8-card">
              <h4>شرح القواعد بالتفصيل والفرق بين النطق والرسم</h4>
              <ul>
                {teacherGuide.pronunciationVsSpelling.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </section>

            <section className="spell8-card">
              <h4>تنبيهات معالجة أخطاء الطلاب المتوقعة ومواضع الخلط بين (ة) و(ه)</h4>
              <div className="spell8-question-list">
                {teacherGuide.expectedMistakesAndRemediation.map((item) => (
                  <article key={item.mistake} className="spell8-question-card">
                    <h5>الخطأ المتوقع: {item.mistake}</h5>
                    <p>
                      <strong>سبب الخطأ:</strong> {item.cause}
                    </p>
                    <p>
                      <strong>العلاج اللغوي المقترح:</strong> {item.remediation}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section className="spell8-card">
              <h4>حلول التدريب التفاعلي (الأسئلة الثمانية)</h4>
              <ol>
                {interactivePracticeQuestions.map((q) => (
                  <li key={q.id}>
                    <strong>{q.clarifiedSentence}</strong> — الكلمة: «{q.completedWord}» — الحرف
                    الصحيح: <strong>({q.answer})</strong>. {q.explanation}
                  </li>
                ))}
              </ol>
            </section>

            <section className="spell8-card">
              <h4>حلول الاختبار الختامي التعليمي (الأسئلة العشرة)</h4>
              <ol>
                {educationalQuizQuestions.map((q) => (
                  <li key={q.id}>
                    <strong>{q.prompt}</strong> — الإجابة النموذجية: <strong>«{q.answer}»</strong>.{' '}
                    {q.explanation}
                  </li>
                ))}
              </ol>
            </section>

            <section className="spell8-card">
              <h4>حلول الواجب المنزلي (الأقسام الثلاثة)</h4>
              <p>
                <strong>١. تصنيف الكلمات العشر:</strong> التاء المربوطة (ة): مدرسة، شجرة، نافذة ·
                التاء المفتوحة (ت): بيت، معلمات، أخت، كتبتْ · الهاء (ه): وجه، قلمه، كتابه.
              </p>
              <p>
                <strong>٢. تصحيح الجمل الأربع:</strong>
              </p>
              <ol>
                {homeworkData.sectionTwo.items.map((item) => (
                  <li key={item.id}>
                    {item.wrongSentence} ← <strong>{item.correctedSentence}</strong> ({item.explanation})
                  </li>
                ))}
              </ol>
              <p>
                <strong>٣. معيار تقييم جملتي الإنشاء:</strong> تُقبل أي جملتين عربيتين سليمتين من
                إنشاء المتعلم تتضمن الأولى كلمة مختومة بتاء مربوطة (ة) وتتضمن الثانية كلمة مختومة
                بتاء مفتوحة (ت)، مع مراجعة سلامة التركيب النحوي والإملائي.
              </p>
            </section>

            <section className="spell8-card">
              <h4>سجل التدقيق العلمي والتوضيحات المعتمدة (ت-١ إلى ت-٧)</h4>
              <ul>
                {sourceCorrections.map((corr) => (
                  <li key={corr.id}>
                    <strong>{corr.id} ({corr.location}):</strong> {corr.approvedTreatment} —{' '}
                    <em>{corr.reason}</em>
                  </li>
                ))}
              </ul>
              <p>
                <a href={sourceUrl} download="spelling-lesson-08.md">
                  تنزيل المادة الأصلية المحفوظة (docs/source/spelling-lesson-08.md)
                </a>{' '}
                ·{' '}
                <a href={auditUrl} download="spelling-lesson-08-audit.md">
                  تنزيل تقرير التدقيق العلمي واللغوي (docs/spelling-lesson-08-audit.md)
                </a>
              </p>
              <p className="spell8-question-meta">
                ملاحظة تنظيمية: حلول الأسئلة العشرين للاختبار المستقل معروضة في قسم «حلول
                الاختبارات» المستقل التزامًا بفصل مناطق المنصة.
              </p>
            </section>
          </div>
        </TeacherSpace>
      ),
    },
  ]

  return (
    <div className="spell8-lesson" dir="rtl">
      <LessonFlow
        steps={steps}
        lessonTitle="التاء المربوطة والتاء المفتوحة والهاء في آخر الكلمة — كيف أميّز بين (ة) و(ت) و(ه)؟"
        lessonNumber="٨"
        lessonEyebrow="قسم الإملاء"
        onFinish={onFinish}
      />
    </div>
  )
}
