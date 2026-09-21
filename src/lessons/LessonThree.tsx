import { useState } from 'react'
import { EducationalCard } from '../shared/components/EducationalCard'
import { LessonFlow, type LessonStepDefinition } from '../shared/components/LessonFlow'
import { DirectionText } from '../shared/direction/DirectionText'
import { TeacherSpace } from '../shared/teacher/TeacherSpace'

interface LessonThreeProps {
  onProgressChange?: (value: number) => void
  onFinish?: () => void
}

type ObjectAnswer = 'يوجد مفعول به' | 'لا يوجد مفعول به'
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

const verbalSentenceExamples = [
  'كتبَ سامرٌ الدرسَ.',
  'قرأَ خالدٌ الكتابَ.',
  'شربَ الطفلُ الحليبَ.',
  'يركضُ الولدُ.',
  'زرعَ الفلاحُ الشجرةَ.',
  'افتحْ البابَ.',
]

const verbWords = ['كتبَ', 'قرأَ', 'لعبَ', 'يكتبُ', 'يقرأُ', 'يلعبُ', 'اكتبْ', 'اقرأْ', 'العبْ']

const noObjectExamples = [
  'ذهبَ خالدٌ.',
  'جلسَ الطفلُ.',
  'نامَ الرضيعُ.',
  'ابتسمَ أحمدُ.',
  'ركضَ اللاعبُ.',
  'طارَ العصفورُ.',
  'سافرَ أبي.',
]

const withObjectExamples = [
  'قرأَ الطالبُ الكتابَ.',
  'كتبَ محمدٌ الرسالةَ.',
  'شربَ الطفلُ الحليبَ.',
  'فتحَ سامرٌ البابَ.',
  'زرعَ الفلاحُ الشجرةَ.',
  'حملَ العاملُ الصندوقَ.',
  'رسمتْ سارةُ زهرةً.',
]

const objectTypeExamples = [
  { kind: 'إنسانًا:', sentence: 'ساعدَ محمدٌ صديقَه.', object: 'صديقه' },
  { kind: 'حيوانًا:', sentence: 'أطعمَ الطفلُ القطَّ.', object: 'القطَّ' },
  { kind: 'نباتًا:', sentence: 'سقى الفلاحُ الشجرةَ.', object: 'الشجرةَ' },
  { kind: 'شيئًا:', sentence: 'فتحَ الطالبُ الكتابَ.', object: 'الكتابَ' },
]

const activityOneItems = [
  { sentence: 'كتبَ خالدٌ.', verb: 'كتبَ', fael: 'خالدٌ' },
  { sentence: 'لعبَ الطفلُ.', verb: 'لعبَ', fael: 'الطفلُ' },
  { sentence: 'طارَ العصفورُ.', verb: 'طارَ', fael: 'العصفورُ' },
  { sentence: 'نجحتِ الطالبةُ.', verb: 'نجحتْ', fael: 'الطالبةُ' },
  { sentence: 'جلسَ المعلمُ.', verb: 'جلسَ', fael: 'المعلمُ' },
]

const activityTwoItems = [
  { sentence: 'قرأَ سامرٌ الكتابَ.', verb: 'قرأَ', fael: 'سامرٌ', mafool: 'الكتابَ' },
  { sentence: 'شربَ الطفلُ الحليبَ.', verb: 'شربَ', fael: 'الطفلُ', mafool: 'الحليبَ' },
  { sentence: 'فتحَ محمدٌ البابَ.', verb: 'فتحَ', fael: 'محمدٌ', mafool: 'البابَ' },
  { sentence: 'زرعَ الفلاحُ الشجرةَ.', verb: 'زرعَ', fael: 'الفلاحُ', mafool: 'الشجرةَ' },
  { sentence: 'رسمتْ سارةُ زهرةً.', verb: 'رسمتْ', fael: 'سارةُ', mafool: 'زهرةً' },
]

const activityThreeItems: Array<{ sentence: string; answer: ObjectAnswer }> = [
  { sentence: 'نامَ الطفلُ.', answer: 'لا يوجد مفعول به' },
  { sentence: 'كتبَ الطالبُ الواجبَ.', answer: 'يوجد مفعول به' },
  { sentence: 'طارَ العصفورُ.', answer: 'لا يوجد مفعول به' },
  { sentence: 'أكلَ الولدُ التفاحةَ.', answer: 'يوجد مفعول به' },
  { sentence: 'جلسَ أحمدُ.', answer: 'لا يوجد مفعول به' },
  { sentence: 'فتحَ سامرٌ النافذةَ.', answer: 'يوجد مفعول به' },
]

const remedialTableRows = [
  ['كتبَ الطالبُ الدرسَ', 'كتبَ', 'الطالبُ', 'الدرسَ'],
  ['أكلَ الطفلُ التفاحةَ', 'أكلَ', 'الطفلُ', 'التفاحةَ'],
  ['فتحَ الأبُ البابَ', 'فتحَ', 'الأبُ', 'البابَ'],
  ['نامَ الطفلُ', 'نامَ', 'الطفلُ', 'لا يوجد'],
]

const officialQuestions: OfficialQuestion[] = [
  {
    number: 1,
    type: 'choice',
    prompt: 'أي جملة مما يأتي جملة فعلية؟',
    options: ['أ. الطالبُ مجتهدٌ.', 'ب. السماءُ صافيةٌ.', 'ج. كتبَ الطالبُ الدرسَ.', 'د. المدرسةُ جميلةٌ.'],
    answer: 'ج. كتبَ الطالبُ الدرسَ.',
  },
  {
    number: 2,
    type: 'choice',
    prompt: 'الفاعل هو:',
    options: ['أ. الذي وقع عليه الفعل', 'ب. الذي قام بالفعل', 'ج. الفعل نفسه', 'د. أول كلمة دائمًا'],
    answer: 'ب. الذي قام بالفعل',
  },
  {
    number: 3,
    type: 'choice',
    prompt: 'المفعول به هو:',
    options: ['أ. الذي قام بالفعل', 'ب. الذي يبدأ الجملة', 'ج. الذي وقع عليه الفعل', 'د. الفعل الماضي فقط'],
    answer: 'ج. الذي وقع عليه الفعل',
  },
  {
    number: 4,
    type: 'choice',
    prompt: 'الفاعل في:\n\nقرأَ محمدٌ الكتابَ.\n\nهو:',
    options: ['أ. قرأَ', 'ب. محمدٌ', 'ج. الكتابَ', 'د. لا يوجد'],
    answer: 'ب. محمدٌ',
  },
  {
    number: 5,
    type: 'choice',
    prompt: 'المفعول به في:\n\nقرأَ محمدٌ الكتابَ.\n\nهو:',
    options: ['أ. قرأَ', 'ب. محمدٌ', 'ج. الكتابَ', 'د. محمد'],
    answer: 'ج. الكتابَ',
  },
  {
    number: 6,
    type: 'choice',
    prompt: 'أي كلمة مما يأتي مفعول به؟',
    options: ['أ. كتبَ', 'ب. الطالبُ', 'ج. الدرسَ', 'د. المدرسةُ'],
    answer: 'ج. الدرسَ',
  },
  {
    number: 7,
    type: 'choice',
    prompt: 'الفاعل يكون:',
    options: ['أ. مرفوعًا', 'ب. منصوبًا', 'ج. مجرورًا', 'د. مجزومًا'],
    answer: 'أ. مرفوعًا',
  },
  {
    number: 8,
    type: 'choice',
    prompt: 'المفعول به يكون:',
    options: ['أ. مرفوعًا', 'ب. منصوبًا', 'ج. مجرورًا', 'د. مجزومًا'],
    answer: 'ب. منصوبًا',
  },
  {
    number: 9,
    type: 'choice',
    prompt: 'الجملة الفعلية تبدأ بفعل.\n\n( )',
    options: ['صح', 'خطأ'],
    answer: 'صح',
  },
  {
    number: 10,
    type: 'choice',
    prompt: 'الفاعل هو الذي قام بالفعل.\n\n( )',
    options: ['صح', 'خطأ'],
    answer: 'صح',
  },
  {
    number: 11,
    type: 'choice',
    prompt: 'المفعول به هو الذي قام بالفعل.\n\n( )',
    options: ['صح', 'خطأ'],
    answer: 'خطأ',
    correction: 'المفعول به هو الذي وقع عليه الفعل، وليس الذي قام به.',
  },
  {
    number: 12,
    type: 'choice',
    prompt: 'في جملة "كتبَ الطالبُ الدرسَ"، الطالبُ فاعل.\n\n( )',
    options: ['صح', 'خطأ'],
    answer: 'صح',
  },
  {
    number: 13,
    type: 'choice',
    prompt: 'في جملة "شربَ الطفلُ الماءَ"، الماءَ فاعل.\n\n( )',
    options: ['صح', 'خطأ'],
    answer: 'خطأ',
    correction: 'الماءَ مفعول به، أما الطفلُ فهو الفاعل.',
  },
  {
    number: 14,
    type: 'choice',
    prompt: 'كل جملة فعلية يجب أن تحتوي على مفعول به.\n\n( )',
    options: ['صح', 'خطأ'],
    answer: 'خطأ',
    correction: 'بعض الجمل الفعلية تحتوي على فعل وفاعل فقط، مثل: نامَ الطفلُ.',
  },
  {
    number: 15,
    type: 'open',
    prompt:
      'استخرج الفعل والفاعل والمفعول به من:\n\nأكلَ الطفلُ التفاحةَ.\n\nالفعل: ....................\nالفاعل: ....................\nالمفعول به: ....................',
    answer: 'الفعل: أكلَ. الفاعل: الطفلُ. المفعول به: التفاحةَ.',
    rows: 4,
  },
  {
    number: 16,
    type: 'open',
    prompt:
      'استخرج الفعل والفاعل والمفعول به إن وجد من:\n\nذهبَ خالدٌ إلى المدرسةِ.\n\nالفعل: ....................\nالفاعل: ....................\nالمفعول به: ....................',
    answer:
      'الفعل: ذهبَ. الفاعل: خالدٌ. المفعول به: لا يوجد. "إلى المدرسةِ" جار ومجرور، وليس مفعولًا به.',
    rows: 4,
  },
  {
    number: 17,
    type: 'open',
    prompt:
      'استخرج الفعل والفاعل والمفعول به من:\n\nرسمتْ سارةُ زهرةً.\n\nالفعل: ....................\nالفاعل: ....................\nالمفعول به: ....................',
    answer: 'الفعل: رسمتْ. الفاعل: سارةُ. المفعول به: زهرةً.',
    rows: 4,
  },
  {
    number: 18,
    type: 'open',
    prompt: 'أعرب ما تحته خط:\n\nكتبَ الطالبُ الدرسَ.\n\nالطالبُ: ....................................................',
    answer: 'الطالبُ: فاعل مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.',
  },
  {
    number: 19,
    type: 'open',
    prompt: 'أعرب ما تحته خط:\n\nكتبَ الطالبُ الدرسَ.\n\nالدرسَ: ....................................................',
    answer: 'الدرسَ: مفعول به منصوب، وعلامة نصبه الفتحة الظاهرة على آخره.',
  },
  {
    number: 20,
    type: 'open',
    prompt:
      'سؤال تفكير\n\nفي الجملة:\n\nفتحَ الأبُ البابَ.\n\nكيف عرفت أن "الأبُ" فاعل وأن "البابَ" مفعول به؟\n\nاكتب القاعدة التي استخدمتها:\n\n....................................................................',
    answer:
      'عرفت أن "الأبُ" فاعل لأنه هو الذي قام بالفعل، وعرفت أن "البابَ" مفعول به لأنه الشيء الذي وقع عليه الفعل. والقاعدة: الفاعل هو الذي قام بالفعل، والمفعول به هو الذي وقع عليه الفعل.',
    rows: 5,
  },
]

/**
 * Lesson 3 authoritative content, delivered one step at a time through LessonFlow.
 *
 *   LessonShell → LessonFlow → LessonStep → current step content only → السابق / التالي
 *
 * The source lesson is preserved as complete teaching, activity, final-test, teacher,
 * correction, remediation, mastery, and summary material. Interaction state is lifted
 * above LessonFlow so answers survive moving between steps. The visual layer makes the
 * grammar itself visible: الفعل، الفاعل، والمفعول به each carry a consistent color and
 * are connected through the discovery questions «من قام بالفعل؟» و«ماذا فعل؟».
 */
export function LessonThree({ onProgressChange, onFinish }: LessonThreeProps) {
  const [activityOneAnswers, setActivityOneAnswers] = useState<Record<string, { verb: string; fael: string }>>({})
  const [activityTwoAnswers, setActivityTwoAnswers] = useState<Record<string, { verb: string; fael: string; mafool: string }>>({})
  const [activityThreeAnswers, setActivityThreeAnswers] = useState<Record<string, ObjectAnswer>>({})
  const [detectiveAnswers, setDetectiveAnswers] = useState({ verb: '', fael: '', mafool: '' })
  const [detectiveRevealed, setDetectiveRevealed] = useState(false)
  const [testAnswers, setTestAnswers] = useState<Record<number, string>>({})
  const [testChecked, setTestChecked] = useState(false)

  function updateActivityOne(sentence: string, field: 'verb' | 'fael', value: string) {
    setActivityOneAnswers((current) => ({
      ...current,
      [sentence]: {
        verb: current[sentence]?.verb ?? '',
        fael: current[sentence]?.fael ?? '',
        [field]: value,
      },
    }))
  }

  function updateActivityTwo(sentence: string, field: 'verb' | 'fael' | 'mafool', value: string) {
    setActivityTwoAnswers((current) => ({
      ...current,
      [sentence]: {
        verb: current[sentence]?.verb ?? '',
        fael: current[sentence]?.fael ?? '',
        mafool: current[sentence]?.mafool ?? '',
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
      title: 'مدخل الدرس: الجملة الفعلية',
      group: 'البداية',
      icon: '🎯',
      description: 'الدرس الثالث: الجملة الفعلية — الفعل والفاعل والمفعول به.',
      render: () => (
        <EducationalCard title="الدرس الثالث: الجملة الفعلية" eyebrow="عنوان الدرس" tone="accent">
          <div className="grammar-hero" aria-label="الفعل والفاعل والمفعول به">
            <span>
              <bdi>فعل</bdi>
            </span>
            <span aria-hidden="true">＋</span>
            <span>
              <bdi>فاعل</bdi>
            </span>
            <span aria-hidden="true">＋</span>
            <span>
              <bdi>مفعول به</bdi>
            </span>
          </div>
          <p className="grammar-hero__topic">الفعل والفاعل والمفعول به</p>
          <p>
            في هذا الدرس سنتعلم الجملة التي تبدأ بفعل، وسنكتشف أركانها بسؤالين بسيطين:{' '}
            <strong>من قام بالفعل؟</strong> و<strong>ماذا فعل؟</strong>
          </p>
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
            <li>أن يعرف الجملة الفعلية.</li>
            <li>أن يميّز الجملة الفعلية من الجملة الاسمية.</li>
            <li>أن يحدد الفعل في الجملة.</li>
            <li>أن يعرف الفاعل ويحدده.</li>
            <li>أن يعرف المفعول به ويحدده.</li>
            <li>أن يفرّق بين الفاعل والمفعول به.</li>
            <li>
              أن يعرف أن الفاعل <strong>مرفوع</strong>.
            </li>
            <li>
              أن يعرف أن المفعول به <strong>منصوب</strong>.
            </li>
            <li>أن يكوّن جملًا فعلية بسيطة.</li>
            <li>أن يعرب الفعل والفاعل والمفعول به إعرابًا مبسطًا.</li>
          </ol>
        </EducationalCard>
      ),
    },
    {
      id: 'recap',
      title: 'أولًا: الشرح التفصيلي — تذكّر من الدرس السابق',
      shortTitle: 'تذكّر من الدرس الماضي',
      group: 'البداية',
      icon: '🧠',
      description: 'الجملة قد تكون اسمية تبدأ باسم، أو فعلية تبدأ بفعل.',
      render: () => (
        <>
          <Subheading>1. تذكّر من الدرس السابق</Subheading>
          <p>تعلمنا أن الجملة قد تكون:</p>
          <div className="sentence-contrast" aria-label="جملة اسمية وجملة فعلية">
            <div className="example-box example-box--good">
              <p className="source-kicker">جملة اسمية</p>
              <p>تبدأ باسم.</p>
              <p className="example-box__text">
                <bdi>الطالبُ مجتهدٌ.</bdi>
              </p>
              <ul className="solution-list">
                <li>الطالبُ: مبتدأ</li>
                <li>مجتهدٌ: خبر</li>
              </ul>
            </div>
            <div className="example-box">
              <p className="source-kicker">جملة فعلية</p>
              <p>تبدأ بفعل.</p>
              <p className="example-box__text">
                <bdi>كتبَ الطالبُ الدرسَ.</bdi>
              </p>
              <p>
                بدأت الجملة بالفعل <strong>كتبَ</strong>.
              </p>
              <p>
                إذن هي <strong>جملة فعلية</strong>.
              </p>
            </div>
          </div>
        </>
      ),
    },
    {
      id: 'verbal-sentence',
      title: 'ما الجملة الفعلية؟',
      group: 'اكتشف الجملة الفعلية',
      icon: '🚀',
      description: 'الجملة الفعلية هي الجملة التي تبدأ بفعل.',
      render: () => (
        <>
          <Subheading>2. ما الجملة الفعلية؟</Subheading>
          <div className="definition-panel grammar-definition grammar-definition--verb">
            <p className="source-kicker">تعريف</p>
            <p>
              <strong>الجملة الفعلية هي الجملة التي تبدأ بفعل.</strong>
            </p>
          </div>
          <p className="source-kicker">أمثلة:</p>
          <ul className="quoted-list two-column-list">
            {verbalSentenceExamples.map((sentence) => (
              <li key={sentence}>{sentence}</li>
            ))}
          </ul>
          <p>كل هذه الجمل بدأت بفعل.</p>
          <p>
            إذن كلها <strong>جمل فعلية</strong>.
          </p>
          <RuleBox title="قاعدة للحفظ:">الجملة الفعلية تبدأ بفعل.</RuleBox>
        </>
      ),
    },
    {
      id: 'what-is-verb',
      title: 'ما الفعل؟',
      group: 'اكتشف الجملة الفعلية',
      icon: '⭐',
      description: 'الفعل كلمة تدل على حدث أو عمل مرتبط بزمن.',
      render: () => (
        <>
          <Subheading>3. ما الفعل؟</Subheading>
          <p>
            الفعل هو كلمة تدل على <strong>حدث أو عمل مرتبط بزمن</strong>.
          </p>
          <p className="source-kicker">مثل:</p>
          <div className="verb-word-grid" role="list" aria-label="أمثلة على أفعال">
            {verbWords.map((word) => (
              <bdi role="listitem" key={word}>
                {word}
              </bdi>
            ))}
          </div>
          <p>وقد تعلمنا في الدرس الأول أن الفعل ثلاثة أنواع:</p>
          <div className="parts-table grammar-parts" role="list" aria-label="أنواع الفعل الثلاثة">
            {['فعل ماضٍ', 'فعل مضارع', 'فعل أمر'].map((kind) => (
              <div className="part-card" role="listitem" key={kind}>
                <strong>{kind}</strong>
              </div>
            ))}
          </div>
          <p className="source-note source-note--important">وسنتوسع في أزمنة الفعل في الدرس الرابع.</p>
        </>
      ),
    },
    {
      id: 'what-is-fael',
      title: 'ما الفاعل؟',
      group: 'اكتشف الجملة الفعلية',
      icon: '🧠',
      description: 'الفاعل هو الشخص أو الشيء الذي قام بالفعل.',
      render: () => (
        <>
          <Subheading>4. ما الفاعل؟</Subheading>
          <div className="definition-panel grammar-definition grammar-definition--fael">
            <p className="source-kicker">الفاعل هو:</p>
            <p>
              <strong>الشخص أو الشيء الذي قام بالفعل.</strong>
            </p>
          </div>
          <p>هذه قاعدة مهمة جدًا.</p>
          <VerbQuestionCard
            sentence="كتبَ سامرٌ الدرسَ."
            question="مَن الذي كتب؟"
            answer="سامرٌ."
            explanation="إذن سامر هو الذي قام بالفعل."
            result="سامرٌ = فاعل."
            role="fael"
          />
        </>
      ),
    },
    {
      id: 'find-fael',
      title: 'الطريقة السهلة لاكتشاف الفاعل',
      group: 'اكتشف الجملة الفعلية',
      icon: '🔍',
      description: 'بعد أن تجد الفعل، اسأل: مَن الذي فعل؟',
      render: () => (
        <>
          <Subheading>5. طريقة سهلة جدًا لاكتشاف الفاعل</Subheading>
          <p>بعد أن تجد الفعل، اسأل:</p>
          <div className="decision-flow grammar-decision">
            <DecisionCard number="١" question="مَن الذي فعل؟" result="أو: ما الذي قام بالفعل؟" />
            <DecisionCard number="٢" question="ما الإجابة؟" result="الإجابة تكون هي الفاعل." />
          </div>
          <GuidedReveal
            sentence="لعبَ الطفلُ بالكرة."
            intro="الفعل: لعبَ."
            stages={[{ question: 'من الذي لعب؟', answer: '→ الطفلُ.', result: 'إذن: الطفلُ = فاعل.' }]}
          />
          <GuidedReveal
            sentence="طارَ العصفورُ."
            intro="الفعل: طارَ."
            stages={[{ question: 'من الذي طار؟', answer: '→ العصفورُ.', result: 'إذن: العصفورُ = فاعل.' }]}
          />
          <GuidedReveal
            sentence="نجحتِ الطالبةُ."
            intro="الفعل: نجحتْ."
            stages={[{ question: 'من الذي نجح؟', answer: '→ الطالبةُ.', result: 'إذن: الطالبةُ = فاعل.' }]}
          />
        </>
      ),
    },
    {
      id: 'fael-raised',
      title: 'الفاعل مرفوع',
      group: 'اكتشف الجملة الفعلية',
      icon: '⚖️',
      description: 'من القواعد المهمة: الفاعل مرفوع، وفي الجمل البسيطة يكون مرفوعًا بالضمة غالبًا.',
      render: () => (
        <>
          <Subheading>6. الفاعل مرفوع</Subheading>
          <RuleBox title="من القواعد المهمة:">الفاعل مرفوع.</RuleBox>
          <p>
            وفي الجمل البسيطة يكون مرفوعًا <strong>بالضمة</strong> غالبًا.
          </p>
          <VerbalSentence sentence="كتبَ الطالبُ." verb="كتبَ" fael="الطالبُ" />
          <ul className="solution-list">
            <li>كتبَ: فعل ماضٍ مبني على الفتحة الظاهرة على آخره.</li>
            <li>الطالبُ: فاعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره.</li>
          </ul>
          <VerbalSentence sentence="قرأَ محمدٌ." verb="قرأَ" fael="محمدٌ" />
          <ul className="solution-list">
            <li>قرأَ: فعل ماضٍ مبني على الفتحة الظاهرة على آخره.</li>
            <li>محمدٌ: فاعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'what-is-mafool',
      title: 'ما المفعول به؟',
      group: 'الفعل والفاعل والمفعول به',
      icon: '📦',
      description: 'عندما يوجد شخص أو شيء وقع عليه الفعل نسميه المفعول به.',
      render: () => (
        <>
          <Subheading>7. ما المفعول به؟</Subheading>
          <p>
            ليس كل فعل يتطلب شيئًا وقع عليه الفعل، لكن عندما يكون هناك شخص أو شيء{' '}
            <strong>وقع عليه الفعل</strong> نسميه:
          </p>
          <div className="definition-panel grammar-definition grammar-definition--mafool">
            <p>
              <strong>المفعول به.</strong>
            </p>
          </div>
          <VerbQuestionCard
            sentence="قرأَ الطالبُ الكتابَ."
            question="من الذي قرأ؟"
            answer="الطالبُ."
            explanation="إذن الطالبُ هو الفاعل."
            result="الطالبُ = فاعل."
            role="fael"
          />
          <VerbQuestionCard
            sentence="قرأَ الطالبُ الكتابَ."
            question="ماذا قرأ الطالب؟"
            answer="الكتابَ."
            explanation="إذن الكتابَ هو الشيء الذي وقع عليه فعل القراءة."
            result="الكتابَ = مفعول به."
            role="mafool"
          />
        </>
      ),
    },
    {
      id: 'find-mafool',
      title: 'كيف أجد المفعول به؟',
      group: 'الفعل والفاعل والمفعول به',
      icon: '🔍',
      description: 'بعد الفعل والفاعل، اسأل: ماذا فعل الفاعل؟',
      render: () => (
        <>
          <Subheading>8. كيف أجد المفعول به؟</Subheading>
          <p>بعد أن تحدد الفعل والفاعل، اسأل:</p>
          <div className="decision-flow grammar-decision">
            <DecisionCard number="١" question="ماذا فعل الفاعل؟" result="أو: ماذا؟ أو مَن؟ وقع عليه الفعل؟" />
            <DecisionCard number="٢" question="ما الإجابة؟" result="الإجابة تكون هي المفعول به." />
          </div>
          <DiscoveryChain />
          <GuidedReveal
            sentence="كتبَ سامرٌ الرسالةَ."
            intro="الفعل: كتبَ."
            stages={[
              { question: 'من الذي كتب؟', answer: '→ سامرٌ = فاعل.' },
              { question: 'ماذا كتب سامر؟', answer: '→ الرسالةَ = مفعول به.' },
            ]}
          />
        </>
      ),
    },
    {
      id: 'mafool-nasb',
      title: 'المفعول به منصوب',
      group: 'الفعل والفاعل والمفعول به',
      icon: '⚖️',
      description: 'قاعدة مهمة: المفعول به منصوب، وتظهر عليه الفتحة غالبًا.',
      render: () => (
        <>
          <Subheading>9. المفعول به منصوب</Subheading>
          <RuleBox title="قاعدة مهمة:">المفعول به منصوب.</RuleBox>
          <p>
            وفي الأمثلة البسيطة تظهر عليه <strong>الفتحة</strong> غالبًا.
          </p>
          <VerbalSentence sentence="قرأَ الطالبُ الكتابَ." verb="قرأَ" fael="الطالبُ" mafool="الكتابَ" />
          <ul className="solution-list">
            <li>الطالبُ: فاعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره.</li>
            <li>الكتابَ: مفعول به منصوب وعلامة نصبه الفتحة الظاهرة على آخره.</li>
          </ul>
          <p className="source-kicker">انتبه إلى الفرق:</p>
          <div className="ending-rules" aria-label="الفرق بين علامة الفاعل وعلامة المفعول به">
            <EndingRule word="الطالبُ" mark="ضمة" role="فاعل" tone="fael" />
            <EndingRule word="الكتابَ" mark="فتحة" role="مفعول به" tone="mafool" />
          </div>
        </>
      ),
    },
    {
      id: 'fael-vs-mafool',
      title: 'الفرق بين الفاعل والمفعول به',
      group: 'الفعل والفاعل والمفعول به',
      icon: '🔄',
      description: 'هذه من أهم النقاط في الدرس.',
      render: () => (
        <>
          <Subheading>10. الفرق بين الفاعل والمفعول به</Subheading>
          <p>هذه من أهم النقاط في الدرس.</p>
          <GuidedReveal
            sentence="أكلَ الطفلُ التفاحةَ."
            stages={[
              { question: 'من الذي أكل؟', answer: '→ الطفلُ.', result: 'إذن: الطفلُ = فاعل.' },
              { question: 'ماذا أكل؟', answer: '→ التفاحةَ.', result: 'إذن: التفاحةَ = مفعول به.' },
            ]}
          />
          <blockquote className="grammar-quote">
            <p className="source-kicker">طريقة سهلة للحفظ:</p>
            <p>
              <strong>الفاعل = الذي قام بالفعل.</strong>
            </p>
            <p>
              <strong>المفعول به = الذي وقع عليه الفعل.</strong>
            </p>
          </blockquote>
        </>
      ),
    },
    {
      id: 'player-ball',
      title: 'المثال المهم: اللاعب والكرة',
      group: 'الفعل والفاعل والمفعول به',
      icon: '⚽',
      description: 'مثال مهم جدًا: لا نحدد الفاعل والمفعول به بترتيب الكلمات فقط.',
      render: () => (
        <>
          <Subheading>11. مثال مهم جدًا</Subheading>
          <p>انظر إلى الجملتين:</p>
          <div className="player-ball-grid">
            <GuidedReveal
              label="أ."
              sentence="ضربَ اللاعبُ الكرةَ."
              stages={[
                { question: 'من الذي قام بالفعل؟', answer: '→ اللاعبُ = فاعل.' },
                { question: 'ما الذي وقع عليه الفعل؟', answer: '→ الكرةَ = مفعول به.' },
              ]}
            />
            <GuidedReveal
              label="ب."
              sentence="ضربتِ الكرةُ اللاعبَ."
              stages={[
                { question: 'من الذي قام بالفعل؟', answer: '→ الكرةُ = فاعل.' },
                { question: 'من الذي وقع عليه الفعل؟', answer: '→ اللاعبَ = مفعول به.' },
              ]}
            />
          </div>
          <div className="attention-box grammar-warning">
            <strong>الخلاصة المهمة:</strong>
            <p>
              إذن لا نحدد الفاعل والمفعول به بمجرد معنى الجملة أو ترتيب الكلمات فقط، بل ننظر إلى{' '}
              <strong>من قام بالفعل ومن وقع عليه الفعل</strong>.
            </p>
          </div>
        </>
      ),
    },
    {
      id: 'no-object',
      title: 'ليس كل جملة فعلية فيها مفعول به',
      group: 'الفعل والفاعل والمفعول به',
      icon: '💡',
      description: 'الجملة الفعلية قد تحتوي على فعل وفاعل فقط.',
      render: () => (
        <>
          <Subheading>12. ليس كل جملة فعلية فيها مفعول به</Subheading>
          <p>هذه نقطة مهمة جدًا.</p>
          <p className="source-kicker">انظر:</p>
          <VerbalSentence sentence="نامَ الطفلُ." verb="نامَ" fael="الطفلُ" showNoObject />
          <ul className="solution-list">
            <li>نامَ: فعل ماضٍ مبني على الفتحة الظاهرة على آخره.</li>
            <li>الطفلُ: فاعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره.</li>
          </ul>
          <p>هل نقول: الطفلُ مفعول به؟</p>
          <p>
            <strong>لا.</strong>
          </p>
          <p>لأن الطفل هو الذي قام بالفعل، ولا يوجد شيء وقع عليه فعل النوم.</p>
          <p>إذن الجملة الفعلية قد تحتوي على:</p>
          <div className="formula-pair" aria-label="صورتا الجملة الفعلية">
            <FormulaTriplet parts={['فعل', 'فاعل']} note="فقط" sourcePhrase="فعل + فاعل" />
            <FormulaTriplet parts={['فعل', 'فاعل', 'مفعول به']} sourcePhrase="فعل + فاعل + مفعول به" />
          </div>
          <div className="sentence-contrast" aria-label="مثال بدون مفعول به ومثال بمفعول به">
            <ExampleBox label="مثال" text="ركضَ الطفلُ." explanation="فعل + فاعل." good />
            <ExampleBox label="مثال" text="ركلَ الطفلُ الكرةَ." explanation="فعل + فاعل + مفعول به." good />
          </div>
        </>
      ),
    },
    {
      id: 'object-contrast',
      title: 'أمثلة بدون مفعول به وأمثلة فيها مفعول به',
      group: 'الفعل والفاعل والمفعول به',
      icon: '📊',
      description: 'قارن بين الجمل التي فيها فاعل فقط والجمل التي فيها مفعول به.',
      render: () => (
        <>
          <div className="object-contrast">
            <article className="example-category example-category--no-object">
              <Subheading>13. أمثلة بدون مفعول به</Subheading>
              <ul className="quoted-list">
                {noObjectExamples.map((sentence) => (
                  <li key={sentence}>{sentence}</li>
                ))}
              </ul>
              <p>في هذه الجمل يوجد فاعل، ولكن لا يوجد مفعول به.</p>
            </article>
            <article className="example-category example-category--with-object">
              <Subheading>14. أمثلة فيها مفعول به</Subheading>
              <ul className="quoted-list">
                {withObjectExamples.map((sentence) => (
                  <li key={sentence}>{sentence}</li>
                ))}
              </ul>
              <p>في كل مثال:</p>
              <p>
                <strong>الفعل + الفاعل + المفعول به</strong>
              </p>
            </article>
          </div>
        </>
      ),
    },
    {
      id: 'object-types',
      title: 'المفعول به لا يعني دائمًا إنسانًا',
      group: 'الفعل والفاعل والمفعول به',
      icon: '🌱',
      description: 'يمكن أن يكون المفعول به إنسانًا أو حيوانًا أو نباتًا أو شيئًا.',
      render: () => (
        <>
          <Subheading>15. المفعول به لا يعني دائمًا إنسانًا</Subheading>
          <p>يمكن أن يكون المفعول به:</p>
          <div className="example-category-grid">
            {objectTypeExamples.map((example) => (
              <article className="example-category" key={example.kind}>
                <h3>{example.kind}</h3>
                <p className="example-box__text">
                  <bdi>{example.sentence}</bdi>
                </p>
                <p>
                  <strong>{example.object}</strong> = مفعول به.
                </p>
              </article>
            ))}
          </div>
        </>
      ),
    },
    {
      id: 'three-steps',
      title: 'كيف نحلل الجملة الفعلية؟ — الخطوات الثلاث',
      group: 'التحليل والقواعد',
      icon: '🪜',
      description: 'استخدم هذه الخطوات الثلاث في كل جملة فعلية.',
      render: () => (
        <>
          <Subheading>16. كيف نحلل الجملة الفعلية؟</Subheading>
          <p>استخدم هذه الخطوات الثلاث:</p>
          <div className="decision-flow analysis-steps">
            <DecisionCard number="١" question="الخطوة 1: ابحث عن الفعل." result="الفعل هو بداية التحليل." />
            <DecisionCard number="٢" question="الخطوة 2: اسأل: من قام بالفعل؟" result="→ الفاعل." />
            <DecisionCard
              number="٣"
              question="الخطوة 3: اسأل: ماذا فعل الفاعل؟ أو على ماذا وقع الفعل؟"
              result="→ المفعول به إذا كان موجودًا."
            />
          </div>
          <DiscoveryChain withExample />
        </>
      ),
    },
    {
      id: 'analysis-examples',
      title: 'أمثلة كاملة محلولة خطوة بخطوة',
      group: 'التحليل والقواعد',
      icon: '📝',
      description: 'مثال كامل، ومثال آخر، ومثال بدون مفعول به.',
      render: () => (
        <>
          <Subheading>17. مثال كامل</Subheading>
          <GuidedReveal
            sentence="قرأَ خالدٌ القصةَ."
            stages={[
              { question: 'الخطوة الأولى: ما الفعل؟', answer: '→ قرأَ' },
              { question: 'الخطوة الثانية: من الذي قرأ؟', answer: '→ خالدٌ', result: 'خالدٌ: فاعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره.' },
              { question: 'الخطوة الثالثة: ماذا قرأ خالد؟', answer: '→ القصةَ', result: 'القصةَ: مفعول به منصوب وعلامة نصبه الفتحة الظاهرة على آخره.' },
            ]}
          />
          <p className="source-kicker">النتيجة:</p>
          <ul className="solution-list">
            <li>قرأَ: فعل ماضٍ مبني على الفتحة الظاهرة على آخره.</li>
            <li>خالدٌ: فاعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره.</li>
            <li>القصةَ: مفعول به منصوب وعلامة نصبه الفتحة الظاهرة على آخره.</li>
          </ul>
          <Subheading>18. مثال آخر</Subheading>
          <GuidedReveal
            sentence="زرعَ الفلاحُ القمحَ."
            stages={[
              { question: 'ما الفعل؟', answer: '→ زرعَ.' },
              { question: 'من الذي زرع؟', answer: '→ الفلاحُ.', result: 'الفلاحُ: فاعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره.' },
              { question: 'ماذا زرع الفلاح؟', answer: '→ القمحَ.', result: 'القمحَ: مفعول به منصوب وعلامة نصبه الفتحة الظاهرة على آخره.' },
            ]}
          />
          <Subheading>19. مثال بدون مفعول به</Subheading>
          <GuidedReveal
            sentence="جلسَ الطالبُ."
            stages={[
              { question: 'ما الفعل؟', answer: '→ جلسَ.' },
              { question: 'من الذي جلس؟', answer: '→ الطالبُ.', result: 'إذن: جلسَ: فعل. الطالبُ: فاعل. لا يوجد مفعول به.' },
            ]}
          />
        </>
      ),
    },
    {
      id: 'haraka',
      title: 'انتبه إلى حركة آخر الكلمة',
      group: 'التحليل والقواعد',
      icon: '✨',
      description: 'الحركة تساعدنا أحيانًا، لكن لا تعتمد عليها وحدها.',
      render: () => (
        <>
          <Subheading>20. انتبه إلى حركة آخر الكلمة</Subheading>
          <p className="source-kicker">لاحظ:</p>
          <VerbalSentence sentence="كتبَ الطالبُ الدرسَ." verb="كتبَ" fael="الطالبُ" mafool="الدرسَ" />
          <div className="ending-rules" aria-label="حركة آخر الكلمة والوظيفة الإعرابية">
            <EndingRule word="الطالبُ" mark="ضمة" role="فاعل" tone="fael" />
            <EndingRule word="الدرسَ" mark="فتحة" role="مفعول به" tone="mafool" />
          </div>
          <p>إذن يمكن أن تساعدنا الحركة أحيانًا في معرفة الوظيفة الإعرابية.</p>
          <div className="attention-box grammar-warning">
            <strong>لكن لا تعتمد على الحركة وحدها؛</strong>
            <p>تعلّم أولًا معنى الجملة واسأل:</p>
            <p>
              <strong>من قام بالفعل؟</strong>
            </p>
            <p>
              <strong>ما الذي وقع عليه الفعل؟</strong>
            </p>
          </div>
        </>
      ),
    },
    {
      id: 'order-change',
      title: 'ماذا لو تغيّر ترتيب الجملة؟',
      group: 'التحليل والقواعد',
      icon: '🔀',
      description: 'في هذا الدرس نتدرب على الصورة السهلة: فعل + فاعل + مفعول به.',
      render: () => (
        <>
          <Subheading>21. ماذا لو تغيّر ترتيب الجملة؟</Subheading>
          <p>قد تأتي الجملة بطريقة مختلفة، لكن في مستوى هذا الدرس سنتدرب أولًا على الصورة السهلة:</p>
          <FormulaTriplet parts={['فعل', 'فاعل', 'مفعول به']} sourcePhrase="فعل + فاعل + مفعول به" wide />
          <p className="source-kicker">مثل:</p>
          <VerbalSentence sentence="قرأَ الطالبُ الكتابَ." verb="قرأَ" fael="الطالبُ" mafool="الكتابَ" />
          <p className="source-note source-note--important">
            وسنتعلم في دروس لاحقة صورًا أخرى للجملة وترتيب عناصرها.
          </p>
        </>
      ),
    },
    {
      id: 'lesson2-comparison',
      title: 'مقارنة مهمة بين الدرس الثاني والثالث',
      group: 'التحليل والقواعد',
      icon: '⚖️',
      description: 'لا تخلط بين المبتدأ والفاعل.',
      render: () => (
        <>
          <Subheading>22. مقارنة مهمة بين الدرس الثاني والثالث</Subheading>
          <div className="lesson-comparison">
            <article className="comparison-card comparison-card--nominal">
              <p className="source-kicker">الجملة الاسمية:</p>
              <p className="example-box__text">
                <bdi>الطالبُ مجتهدٌ.</bdi>
              </p>
              <ul className="solution-list">
                <li>الطالبُ: مبتدأ.</li>
                <li>مجتهدٌ: خبر.</li>
              </ul>
            </article>
            <article className="comparison-card comparison-card--verbal">
              <p className="source-kicker">الجملة الفعلية:</p>
              <p className="example-box__text">
                <bdi>قرأَ الطالبُ الكتابَ.</bdi>
              </p>
              <ul className="solution-list">
                <li>قرأَ: فعل.</li>
                <li>الطالبُ: فاعل.</li>
                <li>الكتابَ: مفعول به.</li>
              </ul>
            </article>
          </div>
          <div className="attention-box grammar-warning">
            <strong>لا تخلط بين:</strong>
            <p>
              <strong>مبتدأ</strong> و<strong>فاعل</strong>.
            </p>
            <p>المبتدأ يكون في الجملة الاسمية.</p>
            <p>والفاعل يكون مع الفعل في الجملة الفعلية عندما نحدد من قام بالفعل.</p>
          </div>
        </>
      ),
    },
    {
      id: 'memorize-rules',
      title: 'أهم القواعد للحفظ ⭐',
      group: 'التحليل والقواعد',
      icon: '⭐',
      description: 'احفظ هذه القواعد الثماني الأساسية.',
      render: () => (
        <EducationalCard title="احفظ هذه القواعد" eyebrow="أهم القواعد للحفظ ⭐" tone="soft">
          <ol className="source-list source-list--arabic-numbers memory-rules">
            <li>
              <strong>الجملة الفعلية تبدأ بفعل.</strong>
            </li>
            <li>
              <strong>الفاعل هو الذي قام بالفعل.</strong>
            </li>
            <li>
              <strong>الفاعل مرفوع.</strong>
            </li>
            <li>
              <strong>المفعول به هو الذي وقع عليه الفعل.</strong>
            </li>
            <li>
              <strong>المفعول به منصوب.</strong>
            </li>
            <li>ليس كل فعل يحتاج إلى مفعول به.</li>
            <li>
              لإيجاد الفاعل اسأل: <strong>من الذي فعل؟</strong>
            </li>
            <li>
              لإيجاد المفعول به اسأل: <strong>ماذا فعل؟ أو على ماذا وقع الفعل؟</strong>
            </li>
          </ol>
        </EducationalCard>
      ),
    },
    {
      id: 'worked-examples',
      title: 'ثانيًا: أمثلة محلولة',
      group: 'أمثلة محلولة',
      icon: '📖',
      description: 'ستة أمثلة محلولة من المصدر، اكشف كل مثال وتابع طريقة الحل.',
      render: () => <WorkedExamples />,
    },
    {
      id: 'activity-one',
      title: 'ثالثًا: نشاط تطبيقي — النشاط الأول',
      group: 'التطبيق والأنشطة',
      icon: '🚀',
      description: 'حدّد الفعل والفاعل: استخرج الفعل والفاعل من الجمل.',
      render: () => <ActivityOne answers={activityOneAnswers} onChange={updateActivityOne} />,
    },
    {
      id: 'activity-two',
      title: 'النشاط الثاني: حدّد الفعل والفاعل والمفعول به',
      group: 'التطبيق والأنشطة',
      icon: '🚀',
      description: 'في الجمل الآتية، حدّد الفعل والفاعل والمفعول به.',
      render: () => <ActivityTwo answers={activityTwoAnswers} onChange={updateActivityTwo} />,
    },
    {
      id: 'activity-three',
      title: 'النشاط الثالث: هل يوجد مفعول به؟',
      group: 'التطبيق والأنشطة',
      icon: '🚀',
      description: 'ضع: يوجد مفعول به، أو: لا يوجد مفعول به.',
      render: () => (
        <ActivityThree
          answers={activityThreeAnswers}
          onAnswer={(sentence, answer) => setActivityThreeAnswers((current) => ({ ...current, [sentence]: answer }))}
        />
      ),
    },
    {
      id: 'activity-four',
      title: 'النشاط الرابع: لعبة "المحقق اللغوي"',
      group: 'التطبيق والأنشطة',
      icon: '🕵️',
      description: 'اقرأ الجملة، ثم أجب عن الأسئلة الثلاثة.',
      render: () => (
        <ActivityFour
          answers={detectiveAnswers}
          revealed={detectiveRevealed}
          onChange={(field, value) => setDetectiveAnswers((current) => ({ ...current, [field]: value }))}
          onReveal={() => setDetectiveRevealed(true)}
        />
      ),
    },
    {
      id: 'final-test',
      title: 'رابعًا: اختبار نهاية الدرس',
      group: 'اختبر نفسك والمعلم',
      icon: '📝',
      description: 'الاختبار النهائي الرسمي المكون من 20 سؤالًا.',
      render: () => (
        <OfficialTest answers={testAnswers} checked={testChecked} onChange={updateTestAnswer} onCheck={() => setTestChecked(true)} />
      ),
    },
    {
      id: 'teacher-space',
      title: 'خامسًا: منطقة خاصة بالمعلم',
      group: 'اختبر نفسك والمعلم',
      icon: '👨‍🏫',
      description: 'الإجابات النموذجية، ملاحظات التصحيح، التدريب العلاجي، معيار الإتقان، والتوصية العلاجية.',
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
      group: 'اختبر نفسك والمعلم',
      icon: '🏆',
      description: 'الخلاصة النهائية والقاعدة الذهبية التي ينتهي بها مصدر الدرس.',
      render: () => (
        <>
          <EducationalCard title="ملخص الدرس للحفظ" eyebrow="الخلاصة">
            <div className="summary-definition-list">
              <p>
                <strong>الجملة الفعلية:</strong> جملة تبدأ بفعل.
              </p>
              <p>
                <strong>الفاعل:</strong> من قام بالفعل.
              </p>
              <p>
                <strong>المفعول به:</strong> من أو ما وقع عليه الفعل.
              </p>
              <p>
                <strong>الإعراب:</strong> الفاعل مرفوع. المفعول به منصوب.
              </p>
            </div>
            <p className="source-kicker">مثال شامل:</p>
            <VerbalSentence sentence="قرأَ الطالبُ الكتابَ." verb="قرأَ" fael="الطالبُ" mafool="الكتابَ" />
            <ul className="solution-list">
              <li>قرأَ: فعل ماضٍ مبني على الفتحة الظاهرة على آخره.</li>
              <li>الطالبُ: فاعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره.</li>
              <li>الكتابَ: مفعول به منصوب وعلامة نصبه الفتحة الظاهرة على آخره.</li>
            </ul>
          </EducationalCard>
          <blockquote className="grammar-quote golden-rule">
            <p className="source-kicker">قاعدة ذهبية:</p>
            <p>
              <strong>
                ابحث عن الفعل أولًا، ثم اسأل: من قام بالفعل؟ فهذا هو الفاعل. ثم اسأل: ماذا فعل؟ فإن وُجد شيء وقع
                عليه الفعل فهو المفعول به.
              </strong>
            </p>
          </blockquote>
        </>
      ),
    },
  ]

  return (
    <LessonFlow
      steps={steps}
      onProgressChange={onProgressChange}
      onFinish={onFinish}
      lessonTitle="الفعل والفاعل والمفعول به"
      lessonNumber="٣"
      lessonEyebrow="الجملة الفعلية"
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
              <th scope="col" key={header}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`${caption}-${rowIndex}`}>
              {row.map((cell, cellIndex) => (
                <td key={`${rowIndex}-${cellIndex}`}>
                  <bdi>{cell}</bdi>
                </td>
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
      <p className="example-box__text">
        <bdi>{text}</bdi>
      </p>
      {explanation && <p>{explanation}</p>}
    </div>
  )
}

/**
 * Visualizes a verbal sentence as connected grammar roles, each with the lesson's
 * consistent color: الفعل، ثم الفاعل، ثم المفعول به إن وُجد. The logical order of the
 * grammar formula is preserved through bidi-isolated chips, never split by whitespace.
 */
function VerbalSentence({
  sentence,
  verb,
  fael,
  mafool,
  showNoObject = false,
}: {
  sentence: string
  verb: string
  fael: string
  mafool?: string
  showNoObject?: boolean
}) {
  return (
    <div className="sentence-structure verbal-structure" aria-label={sentence}>
      <p className="sentence-structure__sentence">
        <bdi>{sentence}</bdi>
      </p>
      <div className="verbal-structure__parts">
        <span className="sentence-part sentence-part--verb">
          <bdi>{verb}</bdi>
          <small>فعل</small>
        </span>
        <span className="sentence-structure__connector" aria-hidden="true">
          ←
        </span>
        <span className="sentence-part sentence-part--fael">
          <bdi>{fael}</bdi>
          <small>فاعل</small>
        </span>
        {mafool && (
          <>
            <span className="sentence-structure__connector" aria-hidden="true">
              ←
            </span>
            <span className="sentence-part sentence-part--mafool">
              <bdi>{mafool}</bdi>
              <small>مفعول به</small>
            </span>
          </>
        )}
        {showNoObject && (
          <>
            <span className="sentence-structure__connector" aria-hidden="true">
              ←
            </span>
            <span className="sentence-part sentence-part--none">
              <bdi>لا يوجد مفعول به</bdi>
            </span>
          </>
        )}
      </div>
    </div>
  )
}

/** The lesson's central discovery process, always taught in the same visual order. */
function DiscoveryChain({ withExample = false }: { withExample?: boolean }) {
  return (
    <div className="discovery-chain" aria-label="طريقة اكتشاف أركان الجملة الفعلية">
      <span className="discovery-chain__node discovery-chain__node--verb">
        <bdi>الفعل</bdi>
        {withExample && <em>قرأَ</em>}
      </span>
      <span className="discovery-chain__arrow" aria-hidden="true">
        ↓
      </span>
      <span className="discovery-chain__question">من قام بالفعل؟</span>
      <span className="discovery-chain__arrow" aria-hidden="true">
        ↓
      </span>
      <span className="discovery-chain__node discovery-chain__node--fael">
        <bdi>الفاعل</bdi>
        {withExample && <em>الطالبُ</em>}
      </span>
      <span className="discovery-chain__arrow" aria-hidden="true">
        ↓
      </span>
      <span className="discovery-chain__question">ماذا فعل الفاعل؟</span>
      <span className="discovery-chain__arrow" aria-hidden="true">
        ↓
      </span>
      <span className="discovery-chain__node discovery-chain__node--mafool">
        <bdi>المفعول به — إن وُجد</bdi>
        {withExample && <em>الكتابَ</em>}
      </span>
      {withExample && (
        <p className="discovery-chain__caption">
          <bdi>قرأَ الطالبُ الكتابَ</bdi>
        </p>
      )}
    </div>
  )
}

function VerbQuestionCard({
  sentence,
  question,
  answer,
  explanation,
  result,
  role,
}: {
  sentence: string
  question: string
  answer: string
  explanation?: string
  result: string
  role: 'fael' | 'mafool'
}) {
  return (
    <div className={`qa-card qa-card--${role}`}>
      <p className="qa-card__sentence">
        <bdi>{sentence}</bdi>
      </p>
      <p>نسأل:</p>
      <p>
        <strong>{question}</strong>
      </p>
      <p>الإجابة:</p>
      <p>
        <strong>{answer}</strong>
      </p>
      {explanation && <p>{explanation}</p>}
      <strong>{result}</strong>
    </div>
  )
}

function DecisionCard({ number, question, result }: { number: string; question: string; result: string }) {
  return (
    <div className="decision-card grammar-decision-card">
      <span className="activity-badge">
        <bdi>{number}</bdi>
      </span>
      <p>{question}</p>
      <strong>{result}</strong>
    </div>
  )
}

/** فعل + فاعل (+ مفعول به) formula card; the logical order of the formula is preserved. */
function FormulaTriplet({
  parts,
  note,
  sourcePhrase,
  wide = false,
}: {
  parts: string[]
  note?: string
  sourcePhrase: string
  wide?: boolean
}) {
  return (
    <div className={`grammar-formula-card formula-triplet ${wide ? 'formula-triplet--wide' : ''}`} aria-label={sourcePhrase}>
      {parts.map((part, index) => (
        <span className="formula-triplet__group" key={part}>
          {index > 0 && <span aria-hidden="true">＋</span>}
          <strong>
            <bdi>{part}</bdi>
          </strong>
        </span>
      ))}
      {note && <small>{note}</small>}
    </div>
  )
}

/** Word ← ending mark ← role, e.g. الطالبُ ← ضمة ← فاعل. */
function EndingRule({ word, mark, role, tone }: { word: string; mark: string; role: string; tone: 'fael' | 'mafool' }) {
  return (
    <div className={`ending-rule ending-rule--${tone}`} aria-label={`${word} ← ${mark} ← ${role}`}>
      <bdi className="ending-rule__word">{word}</bdi>
      <span aria-hidden="true">←</span>
      <span className="ending-rule__mark">{mark}</span>
      <span aria-hidden="true">←</span>
      <strong>{role}</strong>
    </div>
  )
}

/**
 * Interactive step-by-step analysis: the sentence is shown, and the student reveals
 * each discovery question's answer in order — the same thinking routine the source
 * teaches: ما الفعل؟ ثم من قام بالفعل؟ ثم ماذا فعل؟
 */
function GuidedReveal({
  label,
  sentence,
  intro,
  stages,
}: {
  label?: string
  sentence: string
  intro?: string
  stages: Array<{ question: string; answer: string; result?: string }>
}) {
  const [revealedCount, setRevealedCount] = useState(0)
  const allRevealed = revealedCount >= stages.length

  return (
    <div className="guided-reveal">
      {label && <p className="source-kicker">{label}</p>}
      <p className="guided-reveal__sentence">
        <bdi>{sentence}</bdi>
      </p>
      {intro && <p className="guided-reveal__intro">{intro}</p>}
      <ol className="guided-reveal__stages">
        {stages.map((stage, index) => (
          <li key={stage.question} className={index < revealedCount ? 'guided-reveal__stage guided-reveal__stage--open' : 'guided-reveal__stage'}>
            <p className="guided-reveal__question">{stage.question}</p>
            {index < revealedCount && (
              <div className="guided-reveal__answer" role="status">
                <p>{stage.answer}</p>
                {stage.result && <strong>{stage.result}</strong>}
              </div>
            )}
          </li>
        ))}
      </ol>
      {!allRevealed && (
        <button className="button button--primary" type="button" onClick={() => setRevealedCount((count) => count + 1)}>
          اكشف الإجابة
        </button>
      )}
    </div>
  )
}

function WorkedExamples() {
  return (
    <>
      <details className="worked-example" open>
        <summary>المثال 1: كتبَ الطالبُ الدرسَ.</summary>
        <ul className="solution-list">
          <li>الفعل: كتبَ.</li>
          <li>من الذي كتب؟ الطالبُ ← فاعل.</li>
          <li>ماذا كتب؟ الدرسَ ← مفعول به.</li>
        </ul>
        <p>الإجابة:</p>
        <p>
          <strong>كتبَ: فعل ماضٍ مبني على الفتحة الظاهرة على آخره.</strong>
        </p>
        <p>
          <strong>الطالبُ: فاعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره.</strong>
        </p>
        <p>
          <strong>الدرسَ: مفعول به منصوب وعلامة نصبه الفتحة الظاهرة على آخره.</strong>
        </p>
      </details>
      <details className="worked-example">
        <summary>المثال 2: شربَ الطفلُ الماءَ.</summary>
        <ul className="solution-list">
          <li>شربَ: فعل ماضٍ مبني على الفتحة الظاهرة على آخره.</li>
          <li>الطفلُ: فاعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره؛ لأنه الذي شرب.</li>
          <li>الماءَ: مفعول به منصوب وعلامة نصبه الفتحة الظاهرة على آخره؛ لأنه الشيء الذي شربه الطفل.</li>
        </ul>
      </details>
      <details className="worked-example">
        <summary>المثال 3: نامَ الطفلُ.</summary>
        <ul className="solution-list">
          <li>نامَ: فعل ماضٍ مبني على الفتحة الظاهرة على آخره.</li>
          <li>الطفلُ: فاعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره.</li>
          <li>لا يوجد مفعول به.</li>
        </ul>
      </details>
      <details className="worked-example">
        <summary>المثال 4: فتحَ أحمدُ البابَ.</summary>
        <ul className="solution-list">
          <li>فتحَ: فعل ماضٍ مبني على الفتحة الظاهرة على آخره.</li>
          <li>أحمدُ: فاعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره.</li>
          <li>البابَ: مفعول به منصوب وعلامة نصبه الفتحة الظاهرة على آخره.</li>
        </ul>
      </details>
      <details className="worked-example">
        <summary>المثال 5: ركضَ اللاعبُ.</summary>
        <ul className="solution-list">
          <li>ركضَ: فعل ماضٍ مبني على الفتحة الظاهرة على آخره.</li>
          <li>اللاعبُ: فاعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره.</li>
          <li>لا يوجد مفعول به.</li>
        </ul>
      </details>
      <details className="worked-example">
        <summary>المثال 6: زرعتْ سارةُ الوردةَ.</summary>
        <ul className="solution-list">
          <li>زرعتْ: فعل ماضٍ مبني على الفتح الظاهر على آخره.</li>
          <li>سارةُ: فاعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره.</li>
          <li>الوردةَ: مفعول به منصوب وعلامة نصبه الفتحة الظاهرة على آخره.</li>
        </ul>
      </details>
    </>
  )
}

function ActivityOne({
  answers,
  onChange,
}: {
  answers: Record<string, { verb: string; fael: string }>
  onChange: (sentence: string, field: 'verb' | 'fael', value: string) => void
}) {
  return (
    <div className="activity-panel" aria-labelledby="activity-one-title">
      <div className="activity-heading">
        <span className="activity-badge">
          <bdi>١</bdi>
        </span>
        <div>
          <p className="source-kicker">النشاط الأول: حدّد الفعل والفاعل</p>
          <h3 id="activity-one-title">استخرج الفعل والفاعل من الجمل:</h3>
        </div>
      </div>
      <div className="extraction-grid">
        {activityOneItems.map((item, index) => {
          const current = answers[item.sentence] ?? { verb: '', fael: '' }
          const verbCorrect = normalizeArabicAnswer(current.verb) === normalizeArabicAnswer(item.verb)
          const faelCorrect = normalizeArabicAnswer(current.fael) === normalizeArabicAnswer(item.fael)
          return (
            <article className="extraction-card" key={item.sentence}>
              <p className="source-kicker">
                الجملة <bdi>{index + 1}</bdi>
              </p>
              <p className="extraction-card__sentence">
                <bdi>{item.sentence}</bdi>
              </p>
              <label>
                الفعل:
                <input value={current.verb} onChange={(event) => onChange(item.sentence, 'verb', event.target.value)} />
              </label>
              {current.verb && (
                <p className={verbCorrect ? 'answer-mark answer-mark--good' : 'answer-mark'}>
                  {verbCorrect ? 'صحيح' : `الصحيح: ${item.verb}`}
                </p>
              )}
              <label>
                الفاعل:
                <input value={current.fael} onChange={(event) => onChange(item.sentence, 'fael', event.target.value)} />
              </label>
              {current.fael && (
                <p className={faelCorrect ? 'answer-mark answer-mark--good' : 'answer-mark'}>
                  {faelCorrect ? 'صحيح' : `الصحيح: ${item.fael}`}
                </p>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}

function ActivityTwo({
  answers,
  onChange,
}: {
  answers: Record<string, { verb: string; fael: string; mafool: string }>
  onChange: (sentence: string, field: 'verb' | 'fael' | 'mafool', value: string) => void
}) {
  return (
    <div className="activity-panel" aria-labelledby="activity-two-title">
      <div className="activity-heading">
        <span className="activity-badge">
          <bdi>٢</bdi>
        </span>
        <div>
          <p className="source-kicker">النشاط الثاني: حدّد الفعل والفاعل والمفعول به</p>
          <h3 id="activity-two-title">في الجمل الآتية:</h3>
        </div>
      </div>
      <div className="extraction-grid">
        {activityTwoItems.map((item, index) => {
          const current = answers[item.sentence] ?? { verb: '', fael: '', mafool: '' }
          const verbCorrect = normalizeArabicAnswer(current.verb) === normalizeArabicAnswer(item.verb)
          const faelCorrect = normalizeArabicAnswer(current.fael) === normalizeArabicAnswer(item.fael)
          const mafoolCorrect = normalizeArabicAnswer(current.mafool) === normalizeArabicAnswer(item.mafool)
          return (
            <article className="extraction-card" key={item.sentence}>
              <p className="source-kicker">
                الجملة <bdi>{index + 1}</bdi>
              </p>
              <p className="extraction-card__sentence">
                <bdi>{item.sentence}</bdi>
              </p>
              <label>
                الفعل:
                <input value={current.verb} onChange={(event) => onChange(item.sentence, 'verb', event.target.value)} />
              </label>
              {current.verb && (
                <p className={verbCorrect ? 'answer-mark answer-mark--good' : 'answer-mark'}>
                  {verbCorrect ? 'صحيح' : `الصحيح: ${item.verb}`}
                </p>
              )}
              <label>
                الفاعل:
                <input value={current.fael} onChange={(event) => onChange(item.sentence, 'fael', event.target.value)} />
              </label>
              {current.fael && (
                <p className={faelCorrect ? 'answer-mark answer-mark--good' : 'answer-mark'}>
                  {faelCorrect ? 'صحيح' : `الصحيح: ${item.fael}`}
                </p>
              )}
              <label>
                المفعول به:
                <input value={current.mafool} onChange={(event) => onChange(item.sentence, 'mafool', event.target.value)} />
              </label>
              {current.mafool && (
                <p className={mafoolCorrect ? 'answer-mark answer-mark--good' : 'answer-mark'}>
                  {mafoolCorrect ? 'صحيح' : `الصحيح: ${item.mafool}`}
                </p>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}

function ActivityThree({
  answers,
  onAnswer,
}: {
  answers: Record<string, ObjectAnswer>
  onAnswer: (sentence: string, answer: ObjectAnswer) => void
}) {
  const answeredCount = activityThreeItems.filter((item) => answers[item.sentence]).length
  const correctCount = activityThreeItems.filter((item) => answers[item.sentence] === item.answer).length
  return (
    <div className="activity-panel" aria-labelledby="activity-three-title">
      <div className="activity-heading">
        <span className="activity-badge">
          <bdi>٣</bdi>
        </span>
        <div>
          <p className="source-kicker">النشاط الثالث: هل يوجد مفعول به؟</p>
          <h3 id="activity-three-title">ضع: يوجد مفعول به، أو: لا يوجد مفعول به.</h3>
        </div>
      </div>
      <div className="classification-list grammar-activity-list">
        {activityThreeItems.map((item, index) => (
          <div className="classification-row sentence-classification-row" key={item.sentence}>
            <span className="question-number">
              <bdi>{index + 1}</bdi>
            </span>
            <bdi>{item.sentence}</bdi>
            <div>
              {(['يوجد مفعول به', 'لا يوجد مفعول به'] as ObjectAnswer[]).map((option) => (
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
        أجبت عن <bdi>{answeredCount}</bdi> من <bdi>{activityThreeItems.length}</bdi> — الصحيح حتى الآن{' '}
        <bdi>{correctCount}</bdi>.
      </p>
    </div>
  )
}

function ActivityFour({
  answers,
  revealed,
  onChange,
  onReveal,
}: {
  answers: { verb: string; fael: string; mafool: string }
  revealed: boolean
  onChange: (field: 'verb' | 'fael' | 'mafool', value: string) => void
  onReveal: () => void
}) {
  return (
    <div className="activity-panel" aria-labelledby="activity-four-title">
      <div className="activity-heading">
        <span className="activity-badge">
          <bdi>٤</bdi>
        </span>
        <div>
          <p className="source-kicker">النشاط الرابع: لعبة "المحقق اللغوي"</p>
          <h3 id="activity-four-title">اقرأ الجملة، ثم اسأل:</h3>
        </div>
      </div>
      <ul className="solution-list">
        <li>
          <strong>ما الفعل؟</strong>
        </li>
        <li>
          <strong>من قام بالفعل؟</strong>
        </li>
        <li>
          <strong>ماذا فعل؟</strong>
        </li>
      </ul>
      <p className="source-kicker">الجملة:</p>
      <p className="guided-reveal__sentence">
        <bdi>غسلَ الطفلُ يديه.</bdi>
      </p>
      <div className="completion-list">
        <label className="completion-row">
          <span>الفعل: ....................</span>
          <input value={answers.verb} onChange={(event) => onChange('verb', event.target.value)} placeholder="اكتب الفعل" />
        </label>
        <label className="completion-row">
          <span>الفاعل: ....................</span>
          <input value={answers.fael} onChange={(event) => onChange('fael', event.target.value)} placeholder="اكتب الفاعل" />
        </label>
        <label className="completion-row">
          <span>المفعول به: ....................</span>
          <input value={answers.mafool} onChange={(event) => onChange('mafool', event.target.value)} placeholder="اكتب المفعول به" />
        </label>
      </div>
      {!revealed ? (
        <button className="button button--primary" type="button" onClick={onReveal}>
          اعرض حل المحقق اللغوي
        </button>
      ) : (
        <div className="activity-feedback-card" role="status">
          <p>الفعل: غسلَ</p>
          <p>الفاعل: الطفلُ</p>
          <p>المفعول به: يديه</p>
        </div>
      )}
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
    <div className="official-test" data-testid="lesson3-official-test" aria-label="اختبار نهاية الدرس الثالث الرسمي">
      <div className="official-test__intro">
        <strong>اختبار نهاية الدرس</strong>
        <span>٢٠ سؤالًا</span>
        <p>أجب عن الأسئلة كلها. الأسئلة المفتوحة يراجعها معلمك، والإجابات النموذجية محفوظة في منطقة المعلم.</p>
      </div>
      <div className="official-test__groups">
        <h3>أولًا: اختر الإجابة الصحيحة</h3>
        {officialQuestions.slice(0, 8).map((question) => (
          <OfficialQuestionView question={question} value={answers[question.number] || ''} checked={checked} onChange={onChange} key={question.number} />
        ))}
        <h3>ثانيًا: صح أو خطأ</h3>
        {officialQuestions.slice(8, 14).map((question) => (
          <OfficialQuestionView question={question} value={answers[question.number] || ''} checked={checked} onChange={onChange} key={question.number} />
        ))}
        <h3>ثالثًا: استخرج</h3>
        {officialQuestions.slice(14, 17).map((question) => (
          <OfficialQuestionView question={question} value={answers[question.number] || ''} checked={checked} onChange={onChange} key={question.number} />
        ))}
        <h3>رابعًا: الإعراب المبسط</h3>
        {officialQuestions.slice(17, 19).map((question) => (
          <OfficialQuestionView question={question} value={answers[question.number] || ''} checked={checked} onChange={onChange} key={question.number} />
        ))}
        <h3>خامسًا: سؤال تفكير</h3>
        {officialQuestions.slice(19).map((question) => (
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
            الإجابات الموضوعية الصحيحة: <bdi>{score} / {objectiveQuestions.length}</bdi>. الأسئلة المفتوحة جاهزة للمراجعة مع
            المعلم.
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
        <span className="question-number">
          السؤال <bdi>{question.number}</bdi>
        </span>{' '}
        <QuestionText text={question.prompt} />
      </legend>
      {question.type === 'choice' && (
        <div className="official-options">
          {question.options?.map((option) => (
            <label key={option}>
              <input
                type="radio"
                name={`lesson3-official-${question.number}`}
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
    <div className="teacher-material teacher-material--lesson3">
      <h3>الإجابات النموذجية للنشاط التطبيقي</h3>
      <h4>النشاط الأول</h4>
      <ol className="teacher-notes">
        {activityOneItems.map((item) => (
          <li key={item.sentence}>
            <strong>{item.sentence}</strong>
            <ul className="solution-list">
              <li>الفعل: {item.verb}</li>
              <li>الفاعل: {item.fael}</li>
            </ul>
          </li>
        ))}
      </ol>

      <h4>النشاط الثاني</h4>
      <ol className="teacher-notes">
        {activityTwoItems.map((item) => (
          <li key={item.sentence}>
            <strong>{item.sentence}</strong>
            <ul className="solution-list">
              <li>الفعل: {item.verb}</li>
              <li>الفاعل: {item.fael}</li>
              <li>المفعول به: {item.mafool}</li>
            </ul>
          </li>
        ))}
      </ol>

      <h4>النشاط الثالث</h4>
      <ol className="solution-list">
        {activityThreeItems.map((item) => (
          <li key={item.sentence}>
            {item.sentence.replace('.', '')} → <strong>{item.answer}.</strong>
          </li>
        ))}
      </ol>

      <h4>النشاط الرابع</h4>
      <p>
        <strong>غسلَ الطفلُ يديه.</strong>
      </p>
      <ul className="solution-list">
        <li>الفعل: غسلَ</li>
        <li>الفاعل: الطفلُ</li>
        <li>المفعول به: يديه</li>
      </ul>
      <p className="source-note source-note--important">
        ملاحظة للمعلم: يكفي في هذا الدرس أن يتعرف الطالب إلى "يديه" بوصفها المفعول به، ولا حاجة إلى الدخول في إعراب
        المثنى وعلامات الإعراب الفرعية؛ فهذا سيأتي لاحقًا.
      </p>

      <h3>الإجابات النموذجية لاختبار نهاية الدرس</h3>
      <h4>أولًا: الاختيار من متعدد</h4>
      <DataTable
        caption="إجابات الاختيار من متعدد"
        headers={['السؤال', 'الإجابة']}
        rows={officialQuestions.slice(0, 8).map((question) => [String(question.number), question.answer.replace('.', ' —')])}
      />
      <h4>ثانيًا: صح أو خطأ</h4>
      <ol className="solution-list" start={9}>
        <li>
          <strong>صح.</strong>
        </li>
        <li>
          <strong>صح.</strong>
        </li>
        <li>
          <strong>خطأ.</strong>
          <br />
          المفعول به هو الذي وقع عليه الفعل، وليس الذي قام به.
        </li>
        <li>
          <strong>صح.</strong>
        </li>
        <li>
          <strong>خطأ.</strong>
          <br />
          الماءَ مفعول به، أما الطفلُ فهو الفاعل.
        </li>
        <li>
          <strong>خطأ.</strong>
          <br />
          بعض الجمل الفعلية تحتوي على فعل وفاعل فقط، مثل: <strong>نامَ الطفلُ.</strong>
        </li>
      </ol>
      <h4>ثالثًا: الاستخراج</h4>
      <h4>15. أكلَ الطفلُ التفاحةَ.</h4>
      <ul className="solution-list">
        <li>
          الفعل: <strong>أكلَ</strong>
        </li>
        <li>
          الفاعل: <strong>الطفلُ</strong>
        </li>
        <li>
          المفعول به: <strong>التفاحةَ</strong>
        </li>
      </ul>
      <h4>16. ذهبَ خالدٌ إلى المدرسةِ.</h4>
      <ul className="solution-list">
        <li>
          الفعل: <strong>ذهبَ</strong>
        </li>
        <li>
          الفاعل: <strong>خالدٌ</strong>
        </li>
        <li>
          المفعول به: <strong>لا يوجد</strong>
        </li>
      </ul>
      <p>
        "إلى المدرسةِ" جار ومجرور، وليس مفعولًا به. وسيتم شرح حروف الجر والاسم المجرور بالتفصيل في الدرس الثاني عشر.
      </p>
      <h4>17. رسمتْ سارةُ زهرةً.</h4>
      <ul className="solution-list">
        <li>
          الفعل: <strong>رسمتْ</strong>
        </li>
        <li>
          الفاعل: <strong>سارةُ</strong>
        </li>
        <li>
          المفعول به: <strong>زهرةً</strong>
        </li>
      </ul>

      <h4>رابعًا: الإعراب</h4>
      <h4>18.</h4>
      <p>
        <strong>الطالبُ:</strong> فاعل مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.
      </p>
      <h4>19.</h4>
      <p>
        <strong>الدرسَ:</strong> مفعول به منصوب، وعلامة نصبه الفتحة الظاهرة على آخره.
      </p>
      <h4>خامسًا: سؤال التفكير</h4>
      <p>الإجابة النموذجية:</p>
      <p>
        <strong>
          عرفت أن "الأبُ" فاعل لأنه هو الذي قام بالفعل، وعرفت أن "البابَ" مفعول به لأنه الشيء الذي وقع عليه الفعل.
        </strong>
      </p>
      <p>والقاعدة:</p>
      <p>
        <strong>الفاعل هو الذي قام بالفعل، والمفعول به هو الذي وقع عليه الفعل.</strong>
      </p>

      <h3>ملاحظات التصحيح للمعلم</h3>
      <div className="correction-box">
        <h4>الخطأ الأول: الخلط بين الفاعل والمفعول به</h4>
        <p>إذا قال الطالب:</p>
        <p>
          <strong>كتبَ الطالبُ الدرسَ</strong>
        </p>
        <ul className="solution-list">
          <li>الطالبُ: مفعول به</li>
          <li>الدرسَ: فاعل</li>
        </ul>
        <p>فلا تصحح له بالحفظ فقط.</p>
        <p>اسأله:</p>
        <p>
          <strong>من الذي كتب؟</strong>
        </p>
        <p>
          سيجيب: الطالب.
          <br />
          إذن هو الفاعل.
        </p>
        <p>ثم اسأله:</p>
        <p>
          <strong>ماذا كتب؟</strong>
        </p>
        <p>
          سيجيب: الدرس.
          <br />
          إذن هو المفعول به.
        </p>
      </div>
      <div className="correction-box">
        <h4>الخطأ الثاني: اعتبار كل اسم بعد الفعل مفعولًا به</h4>
        <p>مثال:</p>
        <p>
          <strong>ذهبَ خالدٌ إلى المدرسةِ.</strong>
        </p>
        <p>قد يظن الطالب أن "خالدٌ" مفعول به لأنه جاء بعد الفعل.</p>
        <p>وهذا خطأ.</p>
        <p>نسأل:</p>
        <p>
          من الذي ذهب؟
          <br />→ خالد.
        </p>
        <p>إذن خالد = فاعل.</p>
        <p>ولا يوجد مفعول به في هذه الجملة.</p>
      </div>
      <div className="correction-box">
        <h4>الخطأ الثالث: الاعتقاد أن كل جملة فعلية فيها مفعول به</h4>
        <p>أعط الطالب أمثلة:</p>
        <ul className="solution-list">
          <li>نامَ الطفلُ.</li>
          <li>جلسَ أحمدُ.</li>
          <li>ركضَ اللاعبُ.</li>
          <li>طارَ العصفورُ.</li>
        </ul>
        <p>واسأله:</p>
        <p>
          <strong>ماذا نام الطفل؟</strong>
        </p>
        <p>لا توجد إجابة مناسبة.</p>
        <p>إذن لا يوجد مفعول به.</p>
      </div>
      <div className="correction-box">
        <h4>الخطأ الرابع: الاعتماد على ترتيب الكلمات فقط</h4>
        <p>علّم الطالب أن القاعدة ليست:</p>
        <p>الاسم الثاني = فاعل.</p>
        <p>بل:</p>
        <p>
          <strong>الفاعل هو الذي قام بالفعل.</strong>
        </p>
        <p>والأفضل أن يتعلم الطالب طرح الأسئلة:</p>
        <ul className="solution-list">
          <li>
            <strong>ما الفعل؟</strong>
          </li>
          <li>
            <strong>من قام بالفعل؟</strong>
          </li>
          <li>
            <strong>ماذا وقع عليه الفعل؟</strong>
          </li>
        </ul>
      </div>

      <h3>تدريب علاجي سريع للطالب الضعيف</h3>
      <p>إذا واجه الطالب صعوبة، استخدم هذا الجدول:</p>
      <DataTable
        caption="جدول التدريب العلاجي السريع"
        headers={['الجملة', 'الفعل', 'من فعل؟', 'ماذا فعل؟']}
        rows={remedialTableRows}
      />
      <p>واجعل الطالب يملأ الجدول بنفسه.</p>

      <h3>معيار إتقان الدرس</h3>
      <p>يُعد الطالب متقنًا للدرس إذا استطاع:</p>
      <ul className="source-list">
        <li>معرفة أن الجملة الفعلية تبدأ بفعل.</li>
        <li>تحديد الفعل.</li>
        <li>تحديد الفاعل بسؤال "من الذي قام بالفعل؟".</li>
        <li>تحديد المفعول به بسؤال "ماذا وقع عليه الفعل؟".</li>
        <li>معرفة أن الفاعل مرفوع.</li>
        <li>معرفة أن المفعول به منصوب.</li>
        <li>معرفة أن بعض الجمل الفعلية لا تحتوي على مفعول به.</li>
        <li>التمييز بين الفاعل والمفعول به في جمل بسيطة.</li>
      </ul>
      <p>مستوى الإتقان المقترح:</p>
      <p>
        <strong>
          <DirectionText direction="ltr">15/20</DirectionText> فأكثر
        </strong>{' '}
        في الاختبار.
      </p>
      <p>
        إذا حصل الطالب على أقل من <DirectionText direction="ltr">15/20</DirectionText>، يُفضّل عدم الانتقال مباشرة إلى
        الدرس الرابع، بل إعادة التدريب على:
      </p>
      <ol className="source-list source-list--arabic-numbers">
        <li>الفعل.</li>
        <li>الفاعل.</li>
        <li>المفعول به.</li>
        <li>أسئلة "من؟" و"ماذا؟".</li>
      </ol>
    </div>
  )
}

/** Compares answers leniently: harakat and punctuation differences never mark a right answer wrong. */
function normalizeArabicAnswer(value: string) {
  return value
    .trim()
    .replace(/[.،؟!]/g, '')
    .replace(/[\u064B-\u0652\u0670]/g, '')
    .replace(/\s+/g, ' ')
}
