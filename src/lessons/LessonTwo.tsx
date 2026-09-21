import { useState } from 'react'
import { EducationalCard } from '../shared/components/EducationalCard'
import { LessonFlow, type LessonStepDefinition } from '../shared/components/LessonFlow'
import { DirectionText } from '../shared/direction/DirectionText'
import { TeacherSpace } from '../shared/teacher/TeacherSpace'

interface LessonTwoProps {
  onProgressChange?: (value: number) => void
  onFinish?: () => void
}

type ActivityAnswer = 'اسمية' | 'فعلية'
type QuestionType = 'choice' | 'open'

type OfficialQuestion = {
  number: number
  prompt: string
  type: QuestionType
  options?: string[]
  answer: string
  correction?: string
  rows?: number
}

const nominalSentenceRows = [
  ['الطالبُ مجتهدٌ', 'الطالبُ'],
  ['السماءُ صافيةٌ', 'السماءُ'],
  ['الشجرةُ كبيرةٌ', 'الشجرةُ'],
  ['الكتابُ مفيدٌ', 'الكتابُ'],
]

const comparisonRows = [
  ['الطالبُ مجتهدٌ', 'اسم', 'اسمية'],
  ['السماءُ صافيةٌ', 'اسم', 'اسمية'],
  ['الشجرةُ طويلةٌ', 'اسم', 'اسمية'],
  ['ذهبَ خالدٌ', 'فعل', 'فعلية'],
  ['يقرأُ أحمدُ', 'فعل', 'فعلية'],
  ['لعبَ الطفلُ', 'فعل', 'فعلية'],
]

const variedExamples = [
  {
    title: 'أ. مبتدأ وخبر مفرد',
    items: ['السماءُ زرقاءُ.', 'البحرُ هادئٌ.', 'الطفلُ سعيدٌ.', 'المدرسةُ نظيفةٌ.', 'المعلمُ نشيطٌ.', 'الكتابُ جديدٌ.'],
  },
  {
    title: 'ب. المبتدأ إنسان',
    items: ['محمدٌ مجتهدٌ.', 'سارةُ متفوقةٌ.', 'الطبيبُ ماهرٌ.', 'المعلمةُ لطيفةٌ.'],
  },
  {
    title: 'ج. المبتدأ حيوان',
    items: ['الأسدُ قويٌّ.', 'العصفورُ صغيرٌ.', 'الحصانُ سريعٌ.'],
  },
  {
    title: 'د. المبتدأ نبات',
    items: ['الشجرةُ عاليةٌ.', 'الوردةُ جميلةٌ.', 'الزهرةُ عطرةٌ.'],
  },
  {
    title: 'هـ. المبتدأ شيء',
    items: ['القلمُ جديدٌ.', 'البابُ مفتوحٌ.', 'الكرسيُّ مريحٌ.'],
  },
]

const activityOneItems: Array<{ sentence: string; answer: ActivityAnswer }> = [
  { sentence: 'السماءُ صافيةٌ.', answer: 'اسمية' },
  { sentence: 'ذهبَ أحمدُ إلى المدرسة.', answer: 'فعلية' },
  { sentence: 'الكتابُ مفيدٌ.', answer: 'اسمية' },
  { sentence: 'يقرأُ سامرٌ.', answer: 'فعلية' },
  { sentence: 'الحديقةُ واسعةٌ.', answer: 'اسمية' },
  { sentence: 'لعبَ الطفلُ.', answer: 'فعلية' },
  { sentence: 'القمرُ ساطعٌ.', answer: 'اسمية' },
  { sentence: 'تكتبُ سارةُ واجبها.', answer: 'فعلية' },
]

const activityTwoItems = [
  { sentence: 'البيتُ جميلٌ.', mubtada: 'البيتُ', khabar: 'جميلٌ' },
  { sentence: 'الطالبُ مجتهدٌ.', mubtada: 'الطالبُ', khabar: 'مجتهدٌ' },
  { sentence: 'السماءُ صافيةٌ.', mubtada: 'السماءُ', khabar: 'صافيةٌ' },
  { sentence: 'القلمُ على الطاولةِ.', mubtada: 'القلمُ', khabar: 'على الطاولةِ' },
  { sentence: 'الحديقةُ واسعةٌ.', mubtada: 'الحديقةُ', khabar: 'واسعةٌ' },
  { sentence: 'المعلمةُ نشيطةٌ.', mubtada: 'المعلمةُ', khabar: 'نشيطةٌ' },
]

const activityThreePrompts = ['الطالبُ ............', 'السماءُ ............', 'الشجرةُ ............', 'الكتابُ ............', 'المدرسةُ ............']
const activityFourWords = ['القمر', 'البحر', 'المعلم', 'الزهرة', 'الكتاب']

const officialQuestions: OfficialQuestion[] = [
  {
    number: 1,
    type: 'choice',
    prompt: 'أي جملة مما يأتي جملة اسمية؟',
    options: ['أ. ذهبَ خالدٌ.', 'ب. يكتبُ الطالبُ.', 'ج. الطالبُ مجتهدٌ.', 'د. اقرأْ الكتابَ.'],
    answer: 'ج. الطالبُ مجتهدٌ.',
  },
  {
    number: 2,
    type: 'choice',
    prompt: 'المبتدأ في الجملة:\n\nالبيتُ واسعٌ.\n\nهو:',
    options: ['أ. البيتُ', 'ب. واسعٌ', 'ج. البيت', 'د. لا يوجد مبتدأ'],
    answer: 'أ. البيتُ',
  },
  {
    number: 3,
    type: 'choice',
    prompt: 'الخبر في الجملة:\n\nالسماءُ صافيةٌ.\n\nهو:',
    options: ['أ. السماءُ', 'ب. صافيةٌ', 'ج. السماء', 'د. الجملة كلها'],
    answer: 'ب. صافيةٌ',
  },
  {
    number: 4,
    type: 'choice',
    prompt: 'أي الجمل الآتية بدأت باسم؟',
    options: ['أ. يلعبُ الطفلُ.', 'ب. ذهبَ محمدٌ.', 'ج. المدرسةُ نظيفةٌ.', 'د. اكتبْ الدرسَ.'],
    answer: 'ج. المدرسةُ نظيفةٌ.',
  },
  {
    number: 5,
    type: 'choice',
    prompt: 'أي جملة مما يأتي جملة فعلية؟',
    options: ['أ. الكتابُ مفيدٌ.', 'ب. الحديقةُ جميلةٌ.', 'ج. يقرأُ سامرٌ الكتابَ.', 'د. السماءُ زرقاءُ.'],
    answer: 'ج. يقرأُ سامرٌ الكتابَ.',
  },
  {
    number: 6,
    type: 'choice',
    prompt: 'في الجملة:\n\nالمعلمُ ماهرٌ.\n\nكلمة "ماهرٌ" هي:',
    options: ['أ. مبتدأ', 'ب. خبر', 'ج. فعل', 'د. حرف'],
    answer: 'ب. خبر',
  },
  {
    number: 7,
    type: 'choice',
    prompt: 'في الجملة:\n\nالزهرةُ جميلةٌ.\n\nكلمة "الزهرةُ" هي:',
    options: ['أ. خبر', 'ب. مبتدأ', 'ج. فعل', 'د. حرف'],
    answer: 'ب. مبتدأ',
  },
  {
    number: 8,
    type: 'choice',
    prompt: 'الجملة الاسمية تبدأ باسم.\n\n( )',
    options: ['صح', 'خطأ'],
    answer: 'صح',
    correction: 'لأن الجملة الاسمية تبدأ باسم.',
  },
  {
    number: 9,
    type: 'choice',
    prompt: 'الجملة "كتبَ الطالبُ الدرسَ" جملة اسمية.\n\n( )',
    options: ['صح', 'خطأ'],
    answer: 'خطأ',
    correction: 'لأنها بدأت بالفعل "كتبَ"، فهي جملة فعلية.',
  },
  {
    number: 10,
    type: 'choice',
    prompt: 'المبتدأ والخبر مرفوعان في الأصل.\n\n( )',
    options: ['صح', 'خطأ'],
    answer: 'صح',
    correction: 'المبتدأ والخبر مرفوعان في الأصل.',
  },
  {
    number: 11,
    type: 'choice',
    prompt: 'في "البيتُ كبيرٌ"، كلمة "كبيرٌ" هي المبتدأ.\n\n( )',
    options: ['صح', 'خطأ'],
    answer: 'خطأ',
    correction: '"كبيرٌ" خبر، أما "البيتُ" فهو المبتدأ.',
  },
  {
    number: 12,
    type: 'choice',
    prompt: 'في "الحديقةُ واسعةٌ"، كلمة "الحديقةُ" هي المبتدأ.\n\n( )',
    options: ['صح', 'خطأ'],
    answer: 'صح',
    correction: '"الحديقةُ" هي الاسم الذي نتحدث عنه.',
  },
  {
    number: 13,
    type: 'open',
    prompt: 'استخرج المبتدأ والخبر من الجملة:\n\nالطالبُ مجتهدٌ.\n\nالمبتدأ: ....................\nالخبر: ....................',
    answer: 'المبتدأ: الطالبُ. الخبر: مجتهدٌ.',
  },
  {
    number: 14,
    type: 'open',
    prompt: 'استخرج المبتدأ والخبر:\n\nالسماءُ صافيةٌ.\n\nالمبتدأ: ....................\nالخبر: ....................',
    answer: 'المبتدأ: السماءُ. الخبر: صافيةٌ.',
  },
  {
    number: 15,
    type: 'open',
    prompt: 'استخرج المبتدأ والخبر:\n\nالكتابُ على الطاولةِ.\n\nالمبتدأ: ....................\nالخبر: ....................',
    answer: 'المبتدأ: الكتابُ. الخبر: على الطاولةِ.',
  },
  {
    number: 16,
    type: 'open',
    prompt: 'حدد نوع الجملتين:\n\nأ. الشجرةُ طويلةٌ.\n\nنوعها: ....................\n\nب. يركضُ الطفلُ.\n\nنوعها: ....................',
    answer: 'أ. الشجرةُ طويلةٌ → جملة اسمية. ب. يركضُ الطفلُ → جملة فعلية.',
    rows: 4,
  },
  {
    number: 17,
    type: 'open',
    prompt: 'أعرب ما تحته خط:\n\nالطالبُ مجتهدٌ.\n\nالطالبُ: ....................................................',
    answer: 'الطالبُ: مبتدأ مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.',
  },
  {
    number: 18,
    type: 'open',
    prompt: 'أعرب ما تحته خط:\n\nالطالبُ مجتهدٌ.\n\nمجتهدٌ: ....................................................',
    answer: 'مجتهدٌ: خبر مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.',
  },
  {
    number: 19,
    type: 'open',
    prompt: 'رتّب الكلمات الآتية لتكوّن جملة اسمية:\n\nجميلةٌ – الحديقةُ\n\nالجملة:\n\n....................................................\n\nثم حدد:\n\nالمبتدأ: ....................\n\nالخبر: ....................',
    answer: 'الجملة الصحيحة: الحديقةُ جميلةٌ. المبتدأ: الحديقةُ. الخبر: جميلةٌ.',
    rows: 5,
  },
  {
    number: 20,
    type: 'open',
    prompt: 'سؤال تفكير\n\nأمامك الجملتان:\n\nأ. الطالبُ نشيطٌ.\nب. نشيطٌ الطالبُ.\n\nأي الجملتين تبدأ بالطريقة المعتادة للجملة الاسمية في هذا الدرس؟ ولماذا؟\n\nالإجابة:\n\n....................................................',
    answer:
      'الجملة "الطالبُ نشيطٌ" هي التي تبدأ بالطريقة المعتادة للجملة الاسمية في هذا الدرس؛ لأنها بدأت باسم، وهو "الطالبُ". أما "نشيطٌ الطالبُ" فليست الصورة البسيطة المعتادة التي نريد تدريب الطالب عليها في هذا الدرس.',
    rows: 5,
  },
]

/**
 * Lesson 2 authoritative content, delivered one step at a time through LessonFlow.
 *
 *   LessonShell → LessonFlow → LessonStep → current step content only → السابق / التالي
 *
 * The source lesson is preserved as complete teaching, activity, final-test, teacher,
 * mastery, remediation, and summary material. Interaction state is lifted above
 * LessonFlow so answers survive moving between steps.
 */
export function LessonTwo({ onProgressChange, onFinish }: LessonTwoProps) {
  const [easyMethodRevealed, setEasyMethodRevealed] = useState(false)
  const [whoWhatAnswer, setWhoWhatAnswer] = useState<'mubtada' | 'khabar' | ''>('')
  const [activityOneAnswers, setActivityOneAnswers] = useState<Record<string, ActivityAnswer>>({})
  const [activityTwoAnswers, setActivityTwoAnswers] = useState<Record<string, { mubtada: string; khabar: string }>>({})
  const [completionAnswers, setCompletionAnswers] = useState<Record<string, string>>({})
  const [buildAnswers, setBuildAnswers] = useState<Record<string, string>>({})
  const [testAnswers, setTestAnswers] = useState<Record<number, string>>({})
  const [testChecked, setTestChecked] = useState(false)

  function updateActivityTwo(sentence: string, field: 'mubtada' | 'khabar', value: string) {
    setActivityTwoAnswers((current) => ({
      ...current,
      [sentence]: {
        mubtada: current[sentence]?.mubtada ?? '',
        khabar: current[sentence]?.khabar ?? '',
        [field]: value,
      },
    }))
  }

  function updateTestAnswer(number: number, answer: string) {
    setTestAnswers((current) => ({ ...current, [number]: answer }))
  }

  const steps: LessonStepDefinition[] = [
    {
      id: 'intro',
      title: 'مدخل الدرس: الجملة الاسمية',
      group: 'البداية',
      icon: '🎯',
      description: 'الدرس الثاني: الجملة الاسمية — المبتدأ والخبر.',
      render: () => (
        <EducationalCard title="الدرس الثاني: الجملة الاسمية" eyebrow="عنوان الدرس" tone="accent">
          <div className="grammar-hero" aria-label="المبتدأ والخبر">
            <span>
              <bdi>المبتدأ</bdi>
            </span>
            <span aria-hidden="true">＋</span>
            <span>
              <bdi>الخبر</bdi>
            </span>
          </div>
          <p className="grammar-hero__topic">المبتدأ والخبر</p>
          <p>في هذا الدرس سنبني الجملة الاسمية خطوة خطوة، ونرى كيف تبدأ باسم ثم تحتاج إلى خبر يكمل معناها.</p>
        </EducationalCard>
      ),
    },
    {
      id: 'objectives',
      title: 'أهداف الدرس',
      group: 'البداية',
      icon: '🎯',
      description: 'في نهاية هذا الدرس، يُتوقع من الطالب أن يستطيع تنفيذ هذه المهارات.',
      render: () => (
        <EducationalCard title="في نهاية هذا الدرس، يُتوقع من الطالب أن يستطيع" eyebrow="أهداف الدرس">
          <ol className="source-list source-list--arabic-numbers objective-list">
            <li>أن يعرف الجملة الاسمية.</li>
            <li>أن يميّز الجملة الاسمية من الجملة الفعلية.</li>
            <li>أن يعرف المبتدأ والخبر.</li>
            <li>أن يحدد المبتدأ والخبر في الجملة.</li>
            <li>
              أن يعرف أن المبتدأ والخبر <strong>مرفوعان</strong> في الأصل.
            </li>
            <li>أن يكوّن جملًا اسمية بسيطة.</li>
            <li>أن يميّز بين الجملة الاسمية التي تتكوّن من كلمتين والجملة التي يكون خبرها أكثر من كلمة.</li>
            <li>أن يطبق ذلك في القراءة والكتابة والإعراب البسيط.</li>
          </ol>
        </EducationalCard>
      ),
    },
    {
      id: 'what-is-sentence',
      title: 'أولًا: الشرح التفصيلي — ما الجملة؟',
      group: 'المفهوم الأساسي',
      icon: '💡',
      description: 'نبدأ بتذكّر أقسام الكلام ثم نرتّب الكلمات لنحصل على معنى مفيد.',
      render: () => (
        <>
          <Subheading>1. ما الجملة؟</Subheading>
          <p>تذكّر من الدرس السابق أن الكلام يتكوّن من كلمات، والكلمات ثلاثة أنواع:</p>
          <div className="parts-table grammar-parts" role="list" aria-label="أنواع الكلمات الثلاثة">
            {['اسم', 'فعل', 'حرف'].map((part) => (
              <div className="part-card" role="listitem" key={part}>
                <strong>{part}</strong>
              </div>
            ))}
          </div>
          <p>وعندما نرتب الكلمات بطريقة صحيحة بحيث تعطينا معنى مفيدًا، نحصل على <strong>جملة</strong>.</p>
          <p className="source-kicker">مثل:</p>
          <ul className="quoted-list">
            <li>الطالبُ مجتهدٌ.</li>
            <li>ذهبَ خالدٌ إلى المدرسة.</li>
            <li>السماءُ صافيةٌ.</li>
          </ul>
          <p>لكن الجمل ليست كلها من النوع نفسه.</p>
          <p>فقد تبدأ الجملة باسم، وقد تبدأ بفعل.</p>
          <div className="sentence-contrast" aria-label="مثال على بداية الجملة باسم وبداية الجملة بفعل">
            <ExampleBox label="مثال" text="الطالبُ مجتهدٌ." explanation="بدأت الجملة بكلمة الطالبُ، وهي اسم. إذن هذه جملة اسمية." good />
            <ExampleBox label="أما" text="ذهبَ الطالبُ إلى المدرسة." explanation="فقد بدأت بالفعل ذهبَ. إذن هذه جملة فعلية." />
          </div>
        </>
      ),
    },
    {
      id: 'nominal-sentence',
      title: 'ما الجملة الاسمية؟',
      group: 'المفهوم الأساسي',
      icon: '📘',
      description: 'الجملة الاسمية هي الجملة التي تبدأ باسم.',
      render: () => (
        <>
          <Subheading>2. ما الجملة الاسمية؟</Subheading>
          <div className="definition-panel grammar-definition">
            <p className="source-kicker">تعريف</p>
            <p>
              <strong>الجملة الاسمية هي الجملة التي تبدأ باسم.</strong>
            </p>
          </div>
          <p className="source-kicker">أمثلة:</p>
          <ul className="quoted-list two-column-list">
            <li>الطالبُ مجتهدٌ.</li>
            <li>السماءُ صافيةٌ.</li>
            <li>الشجرةُ كبيرةٌ.</li>
            <li>المعلمةُ نشيطةٌ.</li>
            <li>الكتابُ مفيدٌ.</li>
            <li>البيتُ واسعٌ.</li>
          </ul>
          <p>لاحظ أن كل جملة بدأت باسم:</p>
          <DataTable caption="الجملة والكلمة الأولى" headers={['الجملة', 'الكلمة الأولى']} rows={nominalSentenceRows} />
          <p>
            إذن هذه الجمل <strong>جمل اسمية</strong>.
          </p>
          <RuleBox title="قاعدة مهمة للحفظ:">الجملة الاسمية تبدأ باسم.</RuleBox>
        </>
      ),
    },
    {
      id: 'mubtada',
      title: 'ما المبتدأ؟',
      group: 'المبتدأ والخبر',
      icon: '⭐',
      description: 'المبتدأ هو الاسم الذي تبدأ به الجملة الاسمية، ونتحدث عنه في الجملة.',
      render: () => (
        <>
          <Subheading>3. ما المبتدأ؟</Subheading>
          <div className="definition-panel grammar-definition grammar-definition--mubtada">
            <p className="source-kicker">المبتدأ هو:</p>
            <p>
              <strong>الاسم الذي تبدأ به الجملة الاسمية، ونتحدث عنه في الجملة.</strong>
            </p>
          </div>
          <QuestionAnswerCard
            sentence="الطالبُ مجتهدٌ."
            question="عن مَن نتحدث؟"
            answer="نتحدث عن الطالب."
            result="الطالبُ = مبتدأ."
            term="mubtada"
          />
          <QuestionAnswerCard
            sentence="الحديقةُ جميلةٌ."
            question="عن ماذا نتحدث؟"
            answer="عن الحديقة."
            result="الحديقةُ = مبتدأ."
            term="mubtada"
          />
        </>
      ),
    },
    {
      id: 'khabar',
      title: 'ما الخبر؟',
      group: 'المبتدأ والخبر',
      icon: '💬',
      description: 'الخبر هو الكلمة أو الكلمات التي تخبرنا بشيء عن المبتدأ وتُكمل معنى الجملة.',
      render: () => (
        <>
          <Subheading>4. ما الخبر؟</Subheading>
          <div className="definition-panel grammar-definition grammar-definition--khabar">
            <p className="source-kicker">الخبر هو:</p>
            <p>
              <strong>الكلمة أو الكلمات التي تخبرنا بشيء عن المبتدأ وتُكمل معنى الجملة.</strong>
            </p>
          </div>
          <SentenceStructure sentence="الطالبُ مجتهدٌ." mubtada="الطالبُ" khabar="مجتهدٌ" />
          <p>ماذا نقول عن الطالب؟</p>
          <p>
            نقول: <strong>مجتهدٌ</strong>.
          </p>
          <p>إذن:</p>
          <ul className="solution-list">
            <li>الطالبُ = مبتدأ</li>
            <li>مجتهدٌ = خبر</li>
          </ul>
          <SentenceStructure sentence="السماءُ صافيةٌ." mubtada="السماءُ" khabar="صافيةٌ" />
          <p>ماذا نقول عن السماء؟</p>
          <p>
            نقول: <strong>صافيةٌ</strong>.
          </p>
          <p>إذن:</p>
          <ul className="solution-list">
            <li>السماءُ = مبتدأ</li>
            <li>صافيةٌ = خبر</li>
          </ul>
        </>
      ),
    },
    {
      id: 'easy-method',
      title: 'أسهل طريقة لاكتشاف المبتدأ والخبر',
      group: 'المبتدأ والخبر',
      icon: '🔍',
      description: 'خطوتان واضحتان: ابحث عن الاسم الأول، ثم اسأل ماذا نقول عنه؟',
      render: () => (
        <>
          <Subheading>5. أسهل طريقة لاكتشاف المبتدأ والخبر</Subheading>
          <p>عندما ترى جملة اسمية، اتبع خطوتين:</p>
          <div className="decision-flow grammar-decision">
            <DecisionCard number="١" question="ابحث عن الاسم الذي بدأت به الجملة." result="غالبًا يكون هو المبتدأ." />
            <DecisionCard number="٢" question="اسأل: ماذا نقول عن هذا الاسم؟" result="الإجابة تكون غالبًا الخبر." />
          </div>
          <div className="activity-panel grammar-question-panel" aria-labelledby="easy-method-activity">
            <div className="activity-heading">
              <span className="activity-badge" aria-hidden="true">؟</span>
              <div>
                <p className="source-kicker">مثال تفاعلي</p>
                <h3 id="easy-method-activity">الولدُ سعيدٌ.</h3>
              </div>
            </div>
            <p>نسأل:</p>
            <ul className="solution-list">
              <li>من الذي نتحدث عنه؟</li>
              <li>ماذا نقول عن الولد؟</li>
            </ul>
            <button className="button button--primary" type="button" onClick={() => setEasyMethodRevealed(true)}>
              اعرض الحل
            </button>
            {easyMethodRevealed && (
              <div className="activity-feedback-card" role="status">
                <p>من الذي نتحدث عنه؟ → الولدُ.</p>
                <p>ماذا نقول عن الولد؟ → سعيدٌ.</p>
                <p>
                  إذن: <strong>الولدُ: مبتدأ.</strong>
                </p>
                <p>
                  <strong>سعيدٌ: خبر.</strong>
                </p>
              </div>
            )}
          </div>
        </>
      ),
    },
    {
      id: 'raised',
      title: 'المبتدأ والخبر مرفوعان',
      group: 'المبتدأ والخبر',
      icon: '⚖️',
      description: 'من القواعد المهمة: المبتدأ مرفوع، والخبر مرفوع.',
      render: () => (
        <>
          <Subheading>6. المبتدأ والخبر مرفوعان</Subheading>
          <RuleBox title="من القواعد المهمة:">المبتدأ مرفوع، والخبر مرفوع.</RuleBox>
          <p>
            ولذلك تظهر عليهما غالبًا <strong>الضمة</strong>.
          </p>
          <SentenceStructure sentence="الطالبُ مجتهدٌ." mubtada="الطالبُ" khabar="مجتهدٌ" />
          <ul className="solution-list">
            <li>الطالبُ: مبتدأ مرفوع، وعلامة رفعه الضمة.</li>
            <li>مجتهدٌ: خبر مرفوع، وعلامة رفعه الضمة.</li>
          </ul>
          <p className="source-note source-note--important">
            وفي هذا الدرس سنركّز بصورة أساسية على معرفة المبتدأ والخبر، أما علامات الإعراب بالتفصيل فسنتوسع فيها لاحقًا.
          </p>
        </>
      ),
    },
    {
      id: 'names',
      title: 'لماذا نقول «مبتدأ» و«خبر»؟',
      group: 'المبتدأ والخبر',
      icon: '❓',
      description: 'المبتدأ هو عمّن أو عمّا نتحدث، والخبر هو ماذا نقول عنه.',
      render: () => (
        <>
          <Subheading>7. لماذا نقول "مبتدأ" و"خبر"؟</Subheading>
          <p>تخيّل أنك تريد الحديث عن شخص.</p>
          <p>تقول:</p>
          <p className="phrase-ribbon">
            <bdi>سامرٌ...</bdi>
          </p>
          <p>لكن المستمع ينتظر أن يعرف:</p>
          <p>ماذا عن سامر؟</p>
          <p>ثم تقول:</p>
          <p className="phrase-ribbon">
            <bdi>سامرٌ مجتهدٌ.</bdi>
          </p>
          <ul className="solution-list">
            <li>سامرٌ: الشخص الذي نتحدث عنه → <strong>مبتدأ</strong></li>
            <li>مجتهدٌ: المعلومة التي أخبرنا بها عنه → <strong>خبر</strong></li>
          </ul>
          <blockquote className="grammar-quote">
            <p>
              <strong>المبتدأ = عمّن أو عمّا نتحدث.</strong>
            </p>
            <p>
              <strong>الخبر = ماذا نقول عنه.</strong>
            </p>
          </blockquote>
        </>
      ),
    },
    {
      id: 'easy-examples',
      title: 'أمثلة سهلة جدًا',
      group: 'الأمثلة والتوضيح',
      icon: '📖',
      description: 'ثلاثة أمثلة قصيرة توضّح السؤالين: عن ماذا نتحدث؟ وماذا نقول عنه؟',
      render: () => (
        <>
          <Subheading>8. أمثلة سهلة جدًا</Subheading>
          <RevealExample
            title="المثال الأول: الكتابُ مفيدٌ."
            lines={['عن ماذا نتحدث؟ → الكتابُ', 'ماذا نقول عنه؟ → مفيدٌ', 'الكتابُ: مبتدأ.', 'مفيدٌ: خبر.']}
            open
          />
          <RevealExample
            title="المثال الثاني: البيتُ كبيرٌ."
            lines={['عن ماذا نتحدث؟ → البيتُ', 'ماذا نقول عنه؟ → كبيرٌ', 'البيتُ: مبتدأ.', 'كبيرٌ: خبر.']}
          />
          <RevealExample
            title="المثال الثالث: الزهرةُ جميلةٌ."
            lines={['عن ماذا نتحدث؟ → الزهرةُ', 'ماذا نقول عنها؟ → جميلةٌ', 'الزهرةُ: مبتدأ.', 'جميلةٌ: خبر.']}
          />
        </>
      ),
    },
    {
      id: 'warning',
      title: 'انتبه: ليس كل جملة فيها اسم جملة اسمية',
      group: 'الأمثلة والتوضيح',
      icon: '⚠️',
      description: 'الجملة الاسمية تبدأ باسم، وليس المهم أن تحتوي على اسم فقط.',
      render: () => (
        <>
          <Subheading>9. انتبه: ليس كل جملة فيها اسم جملة اسمية</Subheading>
          <div className="attention-box grammar-warning">
            <strong>هذه نقطة مهمة جدًا.</strong>
            <p>
              الجملة الاسمية <strong>تبدأ باسم</strong>، وليس المهم أن تحتوي على اسم فقط.
            </p>
          </div>
          <ExampleBox label="مثال" text="كتبَ الطالبُ الدرسَ." explanation="في هذه الجملة توجد أسماء: الطالبُ، الدرسَ. لكن الجملة بدأت بالفعل: كتبَ. إذن الجملة فعلية، وليست اسمية." />
          <ExampleBox label="مثال آخر" text="يقرأُ سامرٌ الكتابَ." explanation="توجد أسماء: سامرٌ، الكتابَ. ولكن الجملة بدأت بالفعل: يقرأُ. إذن هي جملة فعلية." />
          <RuleBox title="قاعدة للحفظ:">لا تسأل: هل توجد أسماء في الجملة؟ بل اسأل: بماذا بدأت الجملة؟</RuleBox>
          <div className="formula-pair" aria-label="التمييز بين البداية باسم والبداية بفعل">
            <FormulaCard start="إذا بدأت باسم" result="جملة اسمية" arrow="→" sourcePhrase="إذا بدأت باسم → جملة اسمية" />
            <FormulaCard start="إذا بدأت بفعل" result="جملة فعلية" arrow="→" sourcePhrase="إذا بدأت بفعل → جملة فعلية" />
          </div>
        </>
      ),
    },
    {
      id: 'comparison',
      title: 'الفرق بين الجملة الاسمية والجملة الفعلية',
      group: 'الأمثلة والتوضيح',
      icon: '🔄',
      description: 'انظر إلى أول كلمة في الجملة لتعرف نوعها.',
      render: () => (
        <>
          <Subheading>10. الفرق بين الجملة الاسمية والجملة الفعلية</Subheading>
          <DataTable caption="الجملة — بدأت بـ — نوعها" headers={['الجملة', 'بدأت بـ', 'نوعها']} rows={comparisonRows} />
          <p>تذكّر:</p>
          <div className="formula-pair formula-pair--wide" aria-label="اسم وفعل">
            <FormulaCard start="اسم" result="جملة اسمية" sourcePhrase="اسم ← جملة اسمية" />
            <FormulaCard start="فعل" result="جملة فعلية" sourcePhrase="فعل ← جملة فعلية" />
          </div>
        </>
      ),
    },
    {
      id: 'multiword-khabar',
      title: 'الخبر ليس دائمًا كلمة واحدة',
      group: 'قواعد متقدمة',
      icon: '🧩',
      description: 'قد يأتي الخبر كلمة واحدة أو أكثر من كلمة.',
      render: () => (
        <>
          <Subheading>11. الخبر ليس دائمًا كلمة واحدة</Subheading>
          <p>في أبسط الجمل يكون الخبر كلمة واحدة:</p>
          <SentenceStructure sentence="الطالبُ مجتهدٌ." mubtada="الطالبُ" khabar="مجتهدٌ" />
          <p>لكن أحيانًا يكون الخبر أكثر من كلمة.</p>
          <SentenceStructure sentence="الطالبُ في المدرسةِ." mubtada="الطالبُ" khabar="في المدرسةِ" multiword />
          <p>نحن نتحدث عن:</p>
          <p className="phrase-ribbon"><bdi>الطالبُ</bdi></p>
          <p>والمعلومة عنه هي:</p>
          <p className="phrase-ribbon"><bdi>في المدرسةِ</bdi></p>
          <ul className="solution-list">
            <li>الطالبُ = مبتدأ</li>
            <li>في المدرسةِ = خبر</li>
          </ul>
          <p>
            فالخبر هنا ليس كلمة واحدة، بل <strong>مجموعة كلمات</strong>.
          </p>
          <SentenceStructure sentence="الكتابُ على الطاولةِ." mubtada="الكتابُ" khabar="على الطاولةِ" multiword />
          <ul className="solution-list">
            <li>الكتابُ = مبتدأ</li>
            <li>على الطاولةِ = خبر</li>
          </ul>
          <p className="source-note source-note--important">
            في هذه المرحلة يكفي أن تعرف أن الخبر قد يأتي <strong>كلمة واحدة أو أكثر من كلمة</strong>. وسنتعلم أنواع الخبر بصورة أوسع في دروس لاحقة.
          </p>
        </>
      ),
    },
    {
      id: 'varied-examples',
      title: 'أمثلة متنوعة على الجملة الاسمية',
      group: 'قواعد متقدمة',
      icon: '📚',
      description: 'المبتدأ قد يكون إنسانًا أو حيوانًا أو نباتًا أو شيئًا.',
      render: () => (
        <>
          <Subheading>12. أمثلة متنوعة على الجملة الاسمية</Subheading>
          <div className="example-category-grid">
            {variedExamples.map((group) => (
              <article className="example-category" key={group.title}>
                <h3>{group.title}</h3>
                <ul className="quoted-list">
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </>
      ),
    },
    {
      id: 'agreement',
      title: 'التوافق بين المبتدأ والخبر',
      group: 'قواعد متقدمة',
      icon: '🤝',
      description: 'الخبر غالبًا يناسب المبتدأ في التذكير والتأنيث والعدد.',
      render: () => (
        <>
          <Subheading>13. التوافق بين المبتدأ والخبر</Subheading>
          <p>من الأمور الجميلة التي ينبغي أن نلاحظها أن الخبر غالبًا يناسب المبتدأ في التذكير والتأنيث والعدد.</p>
          <div className="agreement-grid">
            <ExampleBox label="المفرد المذكر" text="الولدُ نشيطٌ." good />
            <ExampleBox label="المفرد المؤنث" text="البنتُ نشيطةٌ." good />
          </div>
          <p>لاحظ:</p>
          <ul className="solution-list">
            <li>نشيطٌ ← للمذكر</li>
            <li>نشيطةٌ ← للمؤنث</li>
          </ul>
          <div className="agreement-grid">
            <ExampleBox label="مثال" text="المعلمُ ماهرٌ." />
            <ExampleBox label="مثال" text="المعلمةُ ماهرةٌ." />
          </div>
          <Subheading>المفرد والجمع</Subheading>
          <div className="agreement-grid">
            <ExampleBox label="مفرد" text="الطالبُ مجتهدٌ." />
            <ExampleBox label="جمع" text="الطلابُ مجتهدون." />
          </div>
          <p className="source-note source-note--important">وفي المرحلة القادمة سنتعلم بصورة أوسع كيف يتوافق الخبر مع أنواع المبتدأ المختلفة.</p>
        </>
      ),
    },
    {
      id: 'needs-khabar',
      title: 'كيف أعرف أن الجملة تحتاج إلى خبر؟',
      group: 'قواعد متقدمة',
      icon: '💡',
      description: 'إذا لم يكتمل المعنى بعد المبتدأ فنحن ننتظر الخبر.',
      render: () => (
        <>
          <Subheading>14. كيف أعرف أن الجملة تحتاج إلى خبر؟</Subheading>
          <div className="incomplete-grid">
            <div className="incomplete-card">
              <p className="source-kicker">انظر إلى:</p>
              <p className="incomplete-card__phrase"><bdi>الطالبُ...</bdi></p>
              <p>هل اكتمل المعنى؟</p>
              <p><strong>لا.</strong></p>
              <p>ننتظر أن نعرف شيئًا عن الطالب.</p>
              <p>إذا قلنا:</p>
              <p className="phrase-ribbon"><bdi>الطالبُ مجتهدٌ.</bdi></p>
              <p>اكتمل المعنى.</p>
              <p>إذن كلمة <strong>مجتهدٌ</strong> أخبرتنا بشيء عن الطالب.</p>
            </div>
            <div className="incomplete-card">
              <p className="source-kicker">مثال:</p>
              <p className="incomplete-card__phrase"><bdi>السماءُ...</bdi></p>
              <p>المعنى غير مكتمل.</p>
              <p>لكن:</p>
              <p className="phrase-ribbon"><bdi>السماءُ صافيةٌ.</bdi></p>
              <p>الآن اكتمل المعنى.</p>
              <p>إذن <strong>صافيةٌ</strong> هي الخبر.</p>
            </div>
          </div>
        </>
      ),
    },
    {
      id: 'who-what-game',
      title: 'لعبة «من؟ وماذا عنه؟»',
      group: 'التطبيق والأخطاء',
      icon: '🎮',
      description: 'استخدم السؤالين: من؟ أو ماذا؟ ثم ماذا عنه؟',
      render: () => (
        <>
          <Subheading>15. لعبة "من؟ وماذا عنه؟"</Subheading>
          <p>عندما تواجه جملة اسمية، استخدم السؤالين:</p>
          <div className="decision-flow grammar-decision">
            <DecisionCard number="١" question="من؟ أو ماذا؟" result="الإجابة = المبتدأ." />
            <DecisionCard number="٢" question="ماذا عنه؟" result="الإجابة = الخبر." />
          </div>
          <div className="activity-panel grammar-question-panel" aria-labelledby="who-what-title">
            <div className="activity-heading">
              <span className="activity-badge" aria-hidden="true">؟</span>
              <div>
                <p className="source-kicker">مثال</p>
                <h3 id="who-what-title">الحديقةُ واسعةٌ.</h3>
              </div>
            </div>
            <p>ماذا؟ → الحديقةُ.</p>
            <p>ماذا عنها؟ → واسعةٌ.</p>
            <p>إذن:</p>
            <ul className="solution-list">
              <li>الحديقةُ: مبتدأ.</li>
              <li>واسعةٌ: خبر.</li>
            </ul>
            <p className="source-kicker">جرّب سؤالًا سريعًا:</p>
            <p>
              في الجملة <bdi>الحديقةُ واسعةٌ</bdi>، كلمة <bdi>واسعةٌ</bdi> هي:
            </p>
            <div className="detective-options">
              <button className={whoWhatAnswer === 'mubtada' ? 'mini-choice mini-choice--selected' : 'mini-choice'} type="button" onClick={() => setWhoWhatAnswer('mubtada')}>مبتدأ</button>
              <button className={whoWhatAnswer === 'khabar' ? 'mini-choice mini-choice--selected' : 'mini-choice'} type="button" onClick={() => setWhoWhatAnswer('khabar')}>خبر</button>
            </div>
            {whoWhatAnswer && (
              <p className={whoWhatAnswer === 'khabar' ? 'question-feedback question-feedback--good' : 'question-feedback'} role="status">
                {whoWhatAnswer === 'khabar' ? 'صحيح: واسعةٌ خبر.' : 'حاول مرة أخرى: واسعةٌ هي المعلومة التي نقولها عن الحديقة.'}
              </p>
            )}
          </div>
        </>
      ),
    },
    {
      id: 'common-mistakes',
      title: 'أخطاء شائعة',
      group: 'التطبيق والأخطاء',
      icon: '🚫',
      description: 'أربع نقاط تساعد الطالب على تجنّب الخلط.',
      render: () => (
        <>
          <Subheading>16. أخطاء شائعة</Subheading>
          <RevealExample
            title="الخطأ الأول: اعتبار أول اسم في أي جملة مبتدأ"
            lines={[
              'مثال: قرأَ الطالبُ الكتابَ.',
              'قد يقول الطالب: الطالبُ هو المبتدأ لأنه اسم.',
              'وهذا خطأ.',
              'الصحيح: الجملة بدأت بالفعل قرأَ، إذن هي جملة فعلية.',
            ]}
            open
          />
          <RevealExample
            title="الخطأ الثاني: الخلط بين المبتدأ والخبر"
            lines={[
              'في: البيتُ واسعٌ.',
              'قد يكتب الطالب: البيتُ: خبر، واسعٌ: مبتدأ.',
              'والصحيح العكس: البيتُ: مبتدأ، واسعٌ: خبر.',
              'طريقة التذكر: المبتدأ هو الذي نتحدث عنه.',
            ]}
          />
          <RevealExample
            title="الخطأ الثالث: الاعتقاد أن الخبر يجب أن يكون كلمة واحدة"
            lines={['الجملة: الطالبُ في المدرسةِ.', 'الخبر هنا: في المدرسةِ', 'وليس كلمة "المدرسة" وحدها.']}
          />
          <RevealExample
            title="الخطأ الرابع: نسيان الضمة"
            lines={[
              'في الجملة البسيطة: الطالبُ مجتهدٌ.',
              'المبتدأ والخبر مرفوعان: الطالبُ، مجتهدٌ.',
              'وسنتعلم علامات الرفع بتفصيل أكبر في درس علامات الإعراب.',
            ]}
          />
        </>
      ),
    },
    {
      id: 'memorize-rules',
      title: 'مهم للحفظ ⭐',
      group: 'التطبيق والأخطاء',
      icon: '⭐',
      description: 'احفظ هذه القواعد الخمس الأساسية.',
      render: () => (
        <EducationalCard title="احفظ هذه القواعد" eyebrow="مهم للحفظ ⭐" tone="soft">
          <ol className="source-list source-list--arabic-numbers memory-rules">
            <li><strong>الجملة الاسمية تبدأ باسم.</strong></li>
            <li><strong>المبتدأ هو الاسم الذي نتحدث عنه.</strong></li>
            <li><strong>الخبر هو ما نخبر به عن المبتدأ.</strong></li>
            <li><strong>المبتدأ والخبر مرفوعان في الأصل.</strong></li>
            <li>
              للتفريق بين الاسمية والفعلية: <strong>انظر إلى أول كلمة في الجملة.</strong>
            </li>
          </ol>
        </EducationalCard>
      ),
    },
    {
      id: 'worked-examples',
      title: 'ثانيًا: أمثلة محلولة',
      group: 'أمثلة محلولة',
      icon: '✍️',
      description: 'سبعة أمثلة محلولة من المصدر، تعرض طريقة التفكير خطوة بخطوة.',
      render: () => <WorkedExamples />,
    },
    {
      id: 'activity-one',
      title: 'ثالثًا: نشاط تطبيقي — النشاط الأول',
      group: 'الأنشطة التطبيقية',
      icon: '🚀',
      description: 'اسمية أم فعلية؟ حدد نوع كل جملة.',
      render: () => (
        <ActivityOne
          answers={activityOneAnswers}
          onAnswer={(sentence, answer) => setActivityOneAnswers((current) => ({ ...current, [sentence]: answer }))}
        />
      ),
    },
    {
      id: 'activity-two',
      title: 'النشاط الثاني: استخرج المبتدأ والخبر',
      group: 'الأنشطة التطبيقية',
      icon: '🚀',
      description: 'في الجمل الآتية، حدّد المبتدأ والخبر.',
      render: () => <ActivityTwo answers={activityTwoAnswers} onChange={updateActivityTwo} />,
    },
    {
      id: 'activity-three',
      title: 'النشاط الثالث: أكمل الجملة',
      group: 'الأنشطة التطبيقية',
      icon: '🚀',
      description: 'أكمل كل جملة بكلمة مناسبة.',
      render: () => (
        <CompletionPractice
          answers={completionAnswers}
          onChange={(prompt, value) => setCompletionAnswers((current) => ({ ...current, [prompt]: value }))}
        />
      ),
    },
    {
      id: 'activity-four',
      title: 'النشاط الرابع: كوّن جملة اسمية',
      group: 'الأنشطة التطبيقية',
      icon: '🚀',
      description: 'استخدم كل كلمة لتكوين جملة اسمية.',
      render: () => (
        <BuildSentencePractice
          answers={buildAnswers}
          onChange={(word, value) => setBuildAnswers((current) => ({ ...current, [word]: value }))}
        />
      ),
    },
    {
      id: 'final-test',
      title: 'رابعًا: اختبار نهاية الدرس',
      group: 'التقييم والمعلم',
      icon: '📝',
      description: 'الاختبار النهائي الرسمي المكون من 20 سؤالًا.',
      render: () => <OfficialTest answers={testAnswers} checked={testChecked} onChange={updateTestAnswer} onCheck={() => setTestChecked(true)} />,
    },
    {
      id: 'teacher-space',
      title: 'خامسًا: منطقة خاصة بالمعلم',
      group: 'التقييم والمعلم',
      icon: '👨‍🏫',
      description: 'الإجابات النموذجية، ملاحظات التصحيح، معيار الإتقان، والتوصية العلاجية.',
      render: () => (
        <>
          <div className="teacher-intro">
            <div>
              <p className="section-kicker">منطقة خاصة بالمعلم</p>
              <h3>ملاحظات المعلم والإجابات النموذجية</h3>
            </div>
            <p>تظهر بعد فتح البوابة فقط.</p>
          </div>
          <TeacherSpace>
            <TeacherMaterial />
          </TeacherSpace>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'ملخص الدرس للحفظ',
      group: 'التقييم والمعلم',
      icon: '🏆',
      description: 'الخلاصة النهائية التي ينتهي بها مصدر الدرس.',
      render: () => (
        <>
          <EducationalCard title="ملخص الدرس للحفظ" eyebrow="الخلاصة">
            <div className="summary-definition-list">
              <p><strong>الجملة الاسمية:</strong> جملة تبدأ باسم.</p>
              <p><strong>المبتدأ:</strong> الاسم الذي نتحدث عنه.</p>
              <p><strong>الخبر:</strong> ما نخبر به عن المبتدأ.</p>
              <p><strong>المبتدأ والخبر:</strong> مرفوعان في الأصل.</p>
            </div>
            <p>مثال:</p>
            <SentenceStructure sentence="الطالبُ مجتهدٌ." mubtada="الطالبُ" khabar="مجتهدٌ" />
            <p>الطالبُ → مبتدأ.</p>
            <p>مجتهدٌ → خبر.</p>
          </EducationalCard>
          <div className="formula-pair formula-pair--wide summary-ending" aria-label="تذكر النهاية">
            <FormulaCard start="اسم في البداية" result="جملة اسمية" arrow="→" sourcePhrase="اسم في البداية → جملة اسمية" />
            <FormulaCard start="فعل في البداية" result="جملة فعلية" arrow="→" sourcePhrase="فعل في البداية → جملة فعلية" />
          </div>
        </>
      ),
    },
  ]

  return (
    <LessonFlow
      steps={steps}
      onProgressChange={onProgressChange}
      onFinish={onFinish}
      lessonTitle="المبتدأ والخبر"
      lessonNumber="٢"
      lessonEyebrow="الجملة الاسمية"
    />
  )
}

function QuestionText({ text }: { text: string }) {
  return (
    <span className="question-text">
      {text.split('\n').map((line, index) => (
        <span className="question-text__line" key={`${index}-${line || 'blank'}`}>
          {line || '\u00a0'}
        </span>
      ))}
    </span>
  )
}

function Subheading({ children }: { children: string }) {
  return <h3 className="source-subheading">{children}</h3>
}

function RuleBox({ title = 'قاعدة:', children }: { title?: string; children: string }) {
  return (
    <div className="rule-box grammar-rule">
      <strong>{title}</strong>
      <p>{children}</p>
    </div>
  )
}

function DataTable({ caption, headers, rows }: { caption: string; headers: string[]; rows: string[][] }) {
  return (
    <div className="table-scroll source-table-scroll" role="region" aria-label={caption} tabIndex={0}>
      <table className="source-table" dir="rtl">
        <caption>{caption}</caption>
        <thead>
          <tr>
            {headers.map((header) => (
              <th scope="col" key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`${caption}-${rowIndex}`}>
              {row.map((cell, cellIndex) => (
                <td key={`${rowIndex}-${cellIndex}`}><bdi>{cell}</bdi></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ExampleBox({ label, text, explanation, good = false }: { label: string; text: string; explanation?: string; good?: boolean }) {
  return (
    <div className={`example-box ${good ? 'example-box--good' : ''}`}>
      <p className="source-kicker">{label}</p>
      <p className="example-box__text"><bdi>{text}</bdi></p>
      {explanation && <p>{explanation}</p>}
    </div>
  )
}

function SentenceStructure({
  sentence,
  mubtada,
  khabar,
  multiword = false,
}: {
  sentence: string
  mubtada: string
  khabar: string
  multiword?: boolean
}) {
  return (
    <div className={`sentence-structure ${multiword ? 'sentence-structure--multiword' : ''}`} aria-label={sentence}>
      <p className="sentence-structure__sentence"><bdi>{sentence}</bdi></p>
      <div className="sentence-structure__parts">
        <span className="sentence-part sentence-part--mubtada">
          <bdi>{mubtada}</bdi>
          <small>مبتدأ</small>
        </span>
        <span className="sentence-structure__connector" aria-hidden="true">←</span>
        <span className="sentence-part sentence-part--khabar">
          <bdi>{khabar}</bdi>
          <small>خبر</small>
        </span>
      </div>
    </div>
  )
}

function QuestionAnswerCard({
  sentence,
  question,
  answer,
  result,
  term,
}: {
  sentence: string
  question: string
  answer: string
  result: string
  term: 'mubtada' | 'khabar'
}) {
  return (
    <div className={`qa-card qa-card--${term}`}>
      <p className="qa-card__sentence"><bdi>{sentence}</bdi></p>
      <p>{question}</p>
      <p>{answer}</p>
      <strong>{result}</strong>
    </div>
  )
}

function DecisionCard({ number, question, result }: { number: string; question: string; result: string }) {
  return (
    <div className="decision-card grammar-decision-card">
      <span className="activity-badge"><bdi>{number}</bdi></span>
      <p>{question}</p>
      <strong>{result}</strong>
    </div>
  )
}

function FormulaCard({
  start,
  result,
  arrow = '←',
  sourcePhrase,
}: {
  start: string
  result: string
  arrow?: '←' | '→'
  sourcePhrase?: string
}) {
  return (
    <div className="grammar-formula-card" aria-label={sourcePhrase}>
      <bdi>{start}</bdi>
      <span aria-hidden="true">{arrow}</span>
      <strong>{result}</strong>
    </div>
  )
}

function RevealExample({ title, lines, open = false }: { title: string; lines: string[]; open?: boolean }) {
  return (
    <details className="worked-example grammar-reveal" open={open}>
      <summary>{title}</summary>
      <div className="grammar-reveal__body">
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </details>
  )
}

function WorkedExamples() {
  return (
    <>
      <details className="worked-example" open>
        <summary>المثال 1: الجوُّ جميلٌ.</summary>
        <p>الحل:</p>
        <p>الجملة بدأت بـ <strong>الجوُّ</strong>، وهو اسم.</p>
        <p>إذن هي جملة اسمية.</p>
        <p>نسأل: عن ماذا نتحدث؟</p>
        <p>→ الجوُّ.</p>
        <p>ماذا نقول عنه؟</p>
        <p>→ جميلٌ.</p>
        <p>إذن:</p>
        <ul className="solution-list">
          <li>الجوُّ: مبتدأ</li>
          <li>جميلٌ: خبر</li>
        </ul>
      </details>
      <details className="worked-example">
        <summary>المثال 2: المدرسةُ كبيرةٌ.</summary>
        <p>بدأت باسم، إذن جملة اسمية.</p>
        <ul className="solution-list">
          <li>المدرسةُ: مبتدأ</li>
          <li>كبيرةٌ: خبر</li>
        </ul>
      </details>
      <details className="worked-example">
        <summary>المثال 3: يلعبُ الطفلُ.</summary>
        <p>بدأت بفعل "يلعبُ".</p>
        <p>إذن:</p>
        <p><strong>جملة فعلية.</strong></p>
        <p>ولا نبحث فيها عن مبتدأ وخبر على طريقة الجملة الاسمية.</p>
      </details>
      <details className="worked-example">
        <summary>المثال 4: العصفورُ على الشجرةِ.</summary>
        <p>بدأت باسم.</p>
        <p>إذن جملة اسمية.</p>
        <ul className="solution-list">
          <li>العصفورُ: مبتدأ</li>
          <li>على الشجرةِ: خبر</li>
        </ul>
      </details>
      <details className="worked-example">
        <summary>المثال 5: المعلمُ نشيطٌ.</summary>
        <ul className="solution-list">
          <li>المعلمُ: مبتدأ</li>
          <li>نشيطٌ: خبر</li>
        </ul>
        <p>لأننا نتحدث عن المعلم، ونخبر أنه نشيط.</p>
      </details>
      <details className="worked-example">
        <summary>المثال 6: الوردةُ جميلةٌ.</summary>
        <ul className="solution-list">
          <li>الوردةُ: مبتدأ</li>
          <li>جميلةٌ: خبر</li>
        </ul>
      </details>
      <details className="worked-example">
        <summary>المثال 7: ذهبَ خالدٌ إلى المدرسة.</summary>
        <p>بدأت الجملة بالفعل <strong>ذهبَ</strong>.</p>
        <p>إذن:</p>
        <p><strong>جملة فعلية.</strong></p>
        <p>ولا نقول إن خالدًا مبتدأ لمجرد أنه اسم.</p>
      </details>
    </>
  )
}

function ActivityOne({
  answers,
  onAnswer,
}: {
  answers: Record<string, ActivityAnswer>
  onAnswer: (sentence: string, answer: ActivityAnswer) => void
}) {
  const answeredCount = activityOneItems.filter((item) => answers[item.sentence]).length
  const correctCount = activityOneItems.filter((item) => answers[item.sentence] === item.answer).length
  return (
    <div className="activity-panel" aria-labelledby="activity-one-title">
      <div className="activity-heading">
        <span className="activity-badge"><bdi>١</bdi></span>
        <div>
          <p className="source-kicker">النشاط الأول: اسمية أم فعلية؟</p>
          <h3 id="activity-one-title">حدد نوع كل جملة:</h3>
        </div>
      </div>
      <div className="classification-list grammar-activity-list">
        {activityOneItems.map((item, index) => (
          <div className="classification-row sentence-classification-row" key={item.sentence}>
            <span className="question-number"><bdi>{index + 1}</bdi></span>
            <bdi>{item.sentence}</bdi>
            <div>
              {(['اسمية', 'فعلية'] as ActivityAnswer[]).map((option) => (
                <button
                  className={answers[item.sentence] === option ? 'mini-choice mini-choice--selected' : 'mini-choice'}
                  type="button"
                  key={option}
                  onClick={() => onAnswer(item.sentence, option)}
                >
                  {option}
                </button>
              ))}
            </div>
            {answers[item.sentence] && (
              <span className={answers[item.sentence] === item.answer ? 'answer-mark answer-mark--good' : 'answer-mark'}>
                {answers[item.sentence] === item.answer ? 'صحيح' : `الصحيح: ${item.answer}`}
              </span>
            )}
          </div>
        ))}
      </div>
      <p className="activity-feedback" role="status">
        أجبت عن <bdi>{answeredCount}</bdi> من <bdi>{activityOneItems.length}</bdi> — الصحيح حتى الآن <bdi>{correctCount}</bdi>.
      </p>
    </div>
  )
}

function ActivityTwo({
  answers,
  onChange,
}: {
  answers: Record<string, { mubtada: string; khabar: string }>
  onChange: (sentence: string, field: 'mubtada' | 'khabar', value: string) => void
}) {
  return (
    <div className="activity-panel" aria-labelledby="activity-two-title">
      <div className="activity-heading">
        <span className="activity-badge"><bdi>٢</bdi></span>
        <div>
          <p className="source-kicker">النشاط الثاني: استخرج المبتدأ والخبر</p>
          <h3 id="activity-two-title">في الجمل الآتية، حدّد المبتدأ والخبر:</h3>
        </div>
      </div>
      <div className="extraction-grid">
        {activityTwoItems.map((item, index) => {
          const current = answers[item.sentence] ?? { mubtada: '', khabar: '' }
          const mubtadaCorrect = normalizeArabicAnswer(current.mubtada) === normalizeArabicAnswer(item.mubtada)
          const khabarCorrect = normalizeArabicAnswer(current.khabar) === normalizeArabicAnswer(item.khabar)
          return (
            <article className="extraction-card" key={item.sentence}>
              <p className="source-kicker">الجملة <bdi>{index + 1}</bdi></p>
              <p className="extraction-card__sentence"><bdi>{item.sentence}</bdi></p>
              <label>
                المبتدأ:
                <input value={current.mubtada} onChange={(event) => onChange(item.sentence, 'mubtada', event.target.value)} />
              </label>
              {current.mubtada && (
                <p className={mubtadaCorrect ? 'answer-mark answer-mark--good' : 'answer-mark'}>
                  {mubtadaCorrect ? 'صحيح' : `الصحيح: ${item.mubtada}`}
                </p>
              )}
              <label>
                الخبر:
                <input value={current.khabar} onChange={(event) => onChange(item.sentence, 'khabar', event.target.value)} />
              </label>
              {current.khabar && (
                <p className={khabarCorrect ? 'answer-mark answer-mark--good' : 'answer-mark'}>
                  {khabarCorrect ? 'صحيح' : `الصحيح: ${item.khabar}`}
                </p>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}

function CompletionPractice({ answers, onChange }: { answers: Record<string, string>; onChange: (prompt: string, value: string) => void }) {
  return (
    <div className="activity-panel" aria-labelledby="activity-three-title">
      <div className="activity-heading">
        <span className="activity-badge"><bdi>٣</bdi></span>
        <div>
          <p className="source-kicker">النشاط الثالث: أكمل الجملة</p>
          <h3 id="activity-three-title">أكمل كل جملة بكلمة مناسبة:</h3>
        </div>
      </div>
      <div className="completion-list">
        {activityThreePrompts.map((prompt, index) => (
          <label className="completion-row" key={prompt}>
            <span><bdi>{index + 1}</bdi>. <bdi>{prompt}</bdi></span>
            <input value={answers[prompt] ?? ''} onChange={(event) => onChange(prompt, event.target.value)} placeholder="اكتب كلمة مناسبة" />
          </label>
        ))}
      </div>
    </div>
  )
}

function BuildSentencePractice({ answers, onChange }: { answers: Record<string, string>; onChange: (word: string, value: string) => void }) {
  return (
    <div className="activity-panel" aria-labelledby="activity-four-title">
      <div className="activity-heading">
        <span className="activity-badge"><bdi>٤</bdi></span>
        <div>
          <p className="source-kicker">النشاط الرابع: كوّن جملة اسمية</p>
          <h3 id="activity-four-title">استخدم كل كلمة لتكوين جملة اسمية:</h3>
        </div>
      </div>
      <ol className="source-list source-list--arabic-numbers">
        {activityFourWords.map((word) => (
          <li key={word}>{word}</li>
        ))}
      </ol>
      <p>مثال:</p>
      <p className="phrase-ribbon"><bdi>الشمس → الشمسُ مشرقةٌ.</bdi></p>
      <div className="completion-list">
        {activityFourWords.map((word, index) => (
          <label className="completion-row" key={word}>
            <span><bdi>{index + 1}</bdi>. <bdi>{word}</bdi></span>
            <input value={answers[word] ?? ''} onChange={(event) => onChange(word, event.target.value)} placeholder="كوّن جملة اسمية" />
          </label>
        ))}
      </div>
    </div>
  )
}

function OfficialTest({
  answers,
  checked,
  onChange,
  onCheck,
}: {
  answers: Record<number, string>
  checked: boolean
  onChange: (number: number, value: string) => void
  onCheck: () => void
}) {
  const objectiveQuestions = officialQuestions.filter((question) => question.type === 'choice')
  const allAnswered = officialQuestions.every((question) => answers[question.number]?.trim())
  const score = objectiveQuestions.filter((question) => answers[question.number] === question.answer).length

  return (
    <div className="official-test" data-testid="lesson2-official-test" aria-label="اختبار نهاية الدرس الثاني الرسمي">
      <div className="official-test__intro">
        <strong>اختبار نهاية الدرس</strong>
        <span>٢٠ سؤالًا</span>
        <p>أجب عن الأسئلة كلها. الأسئلة المفتوحة تُراجع معلمك، والإجابات النموذجية محفوظة في منطقة المعلم.</p>
      </div>
      <div className="official-test__groups">
        <h3>أولًا: اختر الإجابة الصحيحة</h3>
        {officialQuestions.slice(0, 7).map((question) => (
          <OfficialQuestionView question={question} value={answers[question.number] || ''} checked={checked} onChange={onChange} key={question.number} />
        ))}
        <h3>ثانيًا: ضع صح أو خطأ</h3>
        {officialQuestions.slice(7, 12).map((question) => (
          <OfficialQuestionView question={question} value={answers[question.number] || ''} checked={checked} onChange={onChange} key={question.number} />
        ))}
        <h3>ثالثًا: استخرج وحدد</h3>
        {officialQuestions.slice(12, 16).map((question) => (
          <OfficialQuestionView question={question} value={answers[question.number] || ''} checked={checked} onChange={onChange} key={question.number} />
        ))}
        <h3>رابعًا: تطبيق وإعراب مبسط</h3>
        {officialQuestions.slice(16).map((question) => (
          <OfficialQuestionView question={question} value={answers[question.number] || ''} checked={checked} onChange={onChange} key={question.number} />
        ))}
      </div>
      <div className="official-test__actions">
        <button className="button button--primary" type="button" disabled={!allAnswered || checked} onClick={onCheck}>
          تحقق من الاختبار
        </button>
        {!allAnswered && !checked && <p>أجب عن الأسئلة العشرين كلها أولًا.</p>}
        {checked && (
          <p className="official-test__result" role="status">
            الإجابات الموضوعية الصحيحة: <bdi>{score} / {objectiveQuestions.length}</bdi>. الأسئلة المفتوحة جاهزة للمراجعة مع المعلم.
          </p>
        )}
      </div>
    </div>
  )
}

function OfficialQuestionView({
  question,
  value,
  checked,
  onChange,
}: {
  question: OfficialQuestion
  value: string
  checked: boolean
  onChange: (number: number, value: string) => void
}) {
  const isChoiceCorrect = checked && question.type === 'choice' && value === question.answer
  return (
    <fieldset className="official-question" data-question-number={question.number} disabled={checked}>
      <legend>
        <span className="question-number">السؤال <bdi>{question.number}</bdi></span>{' '}
        <QuestionText text={question.prompt} />
      </legend>
      {question.type === 'choice' && (
        <div className="official-options">
          {question.options?.map((option) => (
            <label key={option}>
              <input
                type="radio"
                name={`lesson2-official-${question.number}`}
                value={option}
                checked={value === option}
                onChange={() => onChange(question.number, option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      )}
      {question.type === 'open' && (
        <textarea
          rows={question.rows ?? 3}
          value={value}
          onChange={(event) => onChange(question.number, event.target.value)}
          aria-label={`إجابة السؤال ${question.number}`}
          placeholder="اكتب إجابتك هنا"
        />
      )}
      {checked && question.type === 'choice' && (
        <p className={isChoiceCorrect ? 'question-feedback question-feedback--good' : 'question-feedback'}>
          {isChoiceCorrect ? 'إجابة صحيحة.' : `الإجابة النموذجية: ${question.answer}`}
          {question.correction ? ` ${question.correction}` : ''}
        </p>
      )}
      {checked && question.type === 'open' && <p className="question-feedback">تم تسجيل الإجابة للمراجعة مع المعلم.</p>}
    </fieldset>
  )
}

function TeacherMaterial() {
  return (
    <div className="teacher-material teacher-material--lesson2">
      <h3>الإجابات النموذجية للنشاط التطبيقي</h3>
      <h4>النشاط الأول</h4>
      <DataTable
        caption="الإجابات النموذجية للنشاط الأول"
        headers={['الجملة', 'الإجابة']}
        rows={activityOneItems.map((item) => [item.sentence.replace('.', ''), item.answer])}
      />

      <h4>النشاط الثاني</h4>
      <ol className="teacher-notes">
        {activityTwoItems.map((item) => (
          <li key={item.sentence}>
            <strong>{item.sentence.replace('.', '')}</strong>
            <ul className="solution-list">
              <li>المبتدأ: {item.mubtada}</li>
              <li>الخبر: {item.khabar}</li>
            </ul>
          </li>
        ))}
      </ol>

      <h4>النشاط الثالث</h4>
      <p>تُقبل أي إجابة صحيحة تؤدي معنى مفيدًا، مثل:</p>
      <ol className="solution-list">
        <li>الطالبُ مجتهدٌ.</li>
        <li>السماءُ صافيةٌ.</li>
        <li>الشجرةُ طويلةٌ.</li>
        <li>الكتابُ مفيدٌ.</li>
        <li>المدرسةُ نظيفةٌ.</li>
      </ol>

      <h4>النشاط الرابع</h4>
      <p>تُقبل الجمل الصحيحة نحويًا والمعبرة عن معنى مفيد، مثل:</p>
      <ul className="solution-list">
        <li>القمرُ ساطعٌ.</li>
        <li>البحرُ هادئٌ.</li>
        <li>المعلمُ نشيطٌ.</li>
        <li>الزهرةُ جميلةٌ.</li>
        <li>الكتابُ مفيدٌ.</li>
      </ul>

      <h3>الإجابات النموذجية لاختبار نهاية الدرس</h3>
      <h4>أولًا: الاختيار من متعدد</h4>
      <DataTable
        caption="إجابات الاختيار من متعدد"
        headers={['السؤال', 'الإجابة']}
        rows={officialQuestions.slice(0, 7).map((question) => [String(question.number), question.answer.replace('.', ' —')])}
      />
      <h4>ثانيًا: صح أو خطأ</h4>
      <ol className="solution-list" start={8}>
        <li><strong>صح</strong><br />لأن الجملة الاسمية تبدأ باسم.</li>
        <li><strong>خطأ</strong><br />لأنها بدأت بالفعل "كتبَ"، فهي جملة فعلية.</li>
        <li><strong>صح</strong><br />المبتدأ والخبر مرفوعان في الأصل.</li>
        <li><strong>خطأ</strong><br />"كبيرٌ" خبر، أما "البيتُ" فهو المبتدأ.</li>
        <li><strong>صح</strong><br />"الحديقةُ" هي الاسم الذي نتحدث عنه.</li>
      </ol>
      <h4>ثالثًا: الاستخراج</h4>
      <h4>13.</h4>
      <ul className="solution-list">
        <li>المبتدأ: <strong>الطالبُ</strong></li>
        <li>الخبر: <strong>مجتهدٌ</strong></li>
      </ul>
      <h4>14.</h4>
      <ul className="solution-list">
        <li>المبتدأ: <strong>السماءُ</strong></li>
        <li>الخبر: <strong>صافيةٌ</strong></li>
      </ul>
      <h4>15.</h4>
      <ul className="solution-list">
        <li>المبتدأ: <strong>الكتابُ</strong></li>
        <li>الخبر: <strong>على الطاولةِ</strong></li>
      </ul>
      <h4>16.</h4>
      <p>أ. الشجرةُ طويلةٌ → <strong>جملة اسمية</strong></p>
      <p>ب. يركضُ الطفلُ → <strong>جملة فعلية</strong></p>

      <h4>رابعًا: الإعراب والتطبيق</h4>
      <h4>17.</h4>
      <p><strong>الطالبُ:</strong> مبتدأ مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.</p>
      <h4>18.</h4>
      <p><strong>مجتهدٌ:</strong> خبر مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.</p>
      <h4>19.</h4>
      <p>الجملة الصحيحة:</p>
      <p><strong>الحديقةُ جميلةٌ.</strong></p>
      <ul className="solution-list">
        <li>المبتدأ: الحديقةُ</li>
        <li>الخبر: جميلةٌ</li>
      </ul>
      <h4>20.</h4>
      <p>الإجابة:</p>
      <p><strong>الجملة "الطالبُ نشيطٌ" هي التي تبدأ بالطريقة المعتادة للجملة الاسمية في هذا الدرس؛ لأنها بدأت باسم، وهو "الطالبُ".</strong></p>
      <p>أما "نشيطٌ الطالبُ" فليست الصورة البسيطة المعتادة التي نريد تدريب الطالب عليها في هذا الدرس.</p>

      <h3>ملاحظات التصحيح للمعلم</h3>
      <div className="correction-box">
        <h4>إذا أخطأ الطالب في تحديد نوع الجملة:</h4>
        <p>لا تطلب منه حفظ الإجابة فقط، بل اسأله:</p>
        <p><strong>ما أول كلمة في الجملة؟</strong></p>
        <p>ثم:</p>
        <ul className="solution-list">
          <li>إذا كانت اسمًا → اسمية.</li>
          <li>إذا كانت فعلًا → فعلية.</li>
        </ul>
      </div>
      <div className="correction-box">
        <h4>إذا خلط بين المبتدأ والخبر:</h4>
        <p>استخدم السؤالين:</p>
        <p><strong>عن مَن أو ماذا نتحدث؟</strong></p>
        <p>ثم:</p>
        <p><strong>ماذا نقول عنه؟</strong></p>
        <p>مثال:</p>
        <p>الولدُ نشيطٌ.</p>
        <p>عن مَن نتحدث؟<br />→ الولد.</p>
        <p>ماذا نقول عنه؟<br />→ نشيط.</p>
      </div>
      <div className="correction-box">
        <h4>إذا اعتبر كل اسم مبتدأ:</h4>
        <p>أعطه المثال:</p>
        <p><strong>قرأَ الطالبُ الكتابَ.</strong></p>
        <p>واسأله:</p>
        <p>هل بدأت الجملة باسم أم بفعل؟</p>
        <p>سيكتشف أن "قرأَ" فعل، وبالتالي فالجملة فعلية.</p>
      </div>
      <div className="correction-box">
        <h4>إذا لم يفهم الخبر:</h4>
        <p>ابدأ بجمل قصيرة جدًا:</p>
        <ul className="solution-list">
          <li>الشمسُ مشرقةٌ.</li>
          <li>الطفلُ سعيدٌ.</li>
          <li>البابُ مفتوحٌ.</li>
        </ul>
        <p>ثم اجعله يكمل بنفسه:</p>
        <p>الشمسُ ........</p>
        <p>الطفلُ ........</p>
        <p>البابُ ........</p>
        <p>واجعله يشرح: <strong>ماذا أخبرتني عن المبتدأ؟</strong></p>
      </div>

      <h3>معيار إتقان الدرس</h3>
      <p>يُعد الطالب متقنًا للدرس بصورة جيدة إذا استطاع:</p>
      <ul className="source-list">
        <li>تحديد الجملة الاسمية من بين جمل مختلفة.</li>
        <li>تحديد المبتدأ والخبر في جمل بسيطة.</li>
        <li>معرفة أن المبتدأ والخبر مرفوعان في الأصل.</li>
        <li>عدم الخلط بين المبتدأ وأي اسم يأتي داخل الجملة الفعلية.</li>
        <li>تكوين جملة اسمية مفيدة.</li>
        <li>
          الحصول على <strong><DirectionText direction="ltr">15/20</DirectionText> أو أكثر</strong> في الاختبار.
        </li>
      </ul>
      <p>إذا حصل على أقل من <DirectionText direction="ltr">15/20</DirectionText>:</p>
      <p>يُنصح بإعادة تدريب الطالب على ثلاث مهارات أساسية:</p>
      <ol className="source-list source-list--arabic-numbers">
        <li>التمييز بين الاسم والفعل.</li>
        <li>تحديد أول كلمة في الجملة.</li>
        <li>
          استخدام السؤالين:
          <ul className="solution-list">
            <li>عن مَن أو ماذا نتحدث؟</li>
            <li>ماذا نقول عنه؟</li>
          </ul>
        </li>
      </ol>
      <p>ثم إعادة اختبار قصير من 10 أسئلة قبل الانتقال إلى الدرس الثالث.</p>
    </div>
  )
}

function normalizeArabicAnswer(value: string) {
  return value.trim().replace(/[.،]/g, '').replace(/\s+/g, ' ')
}
