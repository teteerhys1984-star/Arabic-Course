import { useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import { EducationalCard } from '../shared/components/EducationalCard'
import { LessonFlow, type LessonStepDefinition } from '../shared/components/LessonFlow'
import { TeacherSpace } from '../shared/teacher/TeacherSpace'

interface LessonFourProps {
  onProgressChange?: (value: number) => void
  onFinish?: () => void
}

type ActivityAnswers = Record<string, string>
type QuestionType = 'choice' | 'open'

type OfficialQuestion = {
  number: number
  type: QuestionType
  prompt: string
  options?: string[]
  answer: string
  explanation: string
  rows?: number
}

const pastExamples = ['كتبَ', 'قرأَ', 'ذهبَ', 'جلسَ', 'شربَ', 'لعبَ', 'نامَ', 'فتحَ']
const commandExamples = ['اكتبْ', 'اقرأْ', 'اذهبْ', 'اجلسْ', 'اشربْ', 'العبْ', 'نمْ', 'افتحْ']
const activityOneItems = [
  { word: 'كتبَ', answer: 'ماضٍ' },
  { word: 'يقرأُ', answer: 'مضارع' },
  { word: 'اجلسْ', answer: 'أمر' },
  { word: 'لعبَ', answer: 'ماضٍ' },
  { word: 'تدرسُ', answer: 'مضارع' },
  { word: 'افتحْ', answer: 'أمر' },
]

const activityTwoItems = [
  { sentence: 'كتبَ خالدٌ الدرسَ أمسِ.', answer: 'ماضٍ' },
  { sentence: 'يكتبُ خالدٌ الدرسَ الآن.', answer: 'مضارع' },
  { sentence: 'اكتبْ الدرسَ يا خالدُ.', answer: 'أمر' },
  { sentence: 'سيسافرُ أبي غدًا.', answer: 'مضارع' },
  { sentence: 'لم يكتبْ سامرٌ.', answer: 'مضارع' },
  { sentence: 'لن يذهبَ خالدٌ غدًا.', answer: 'مضارع' },
]

const activityThreeItems = [
  {
    sentence: 'أمسِ ______ الطالبُ الدرسَ.',
    options: ['كتبَ', 'يكتبُ', 'اكتبْ'],
    answer: 'كتبَ',
  },
  {
    sentence: 'الآن ______ الطالبُ الدرسَ.',
    options: ['كتبَ', 'يكتبُ', 'اكتبْ'],
    answer: 'يكتبُ',
  },
  {
    sentence: 'يا خالدُ، ______ الدرسَ.',
    options: ['كتبَ', 'يكتبُ', 'اكتبْ'],
    answer: 'اكتبْ',
  },
  {
    sentence: 'غدًا ______ أبي إلى دمشق.',
    options: ['ذهبَ', 'يذهبُ', 'اذهبْ'],
    answer: 'يذهبُ',
  },
]

const transformationItems = [
  { id: 'past-present-1', prompt: 'حوّل: كتبَ الطالبُ الدرسَ.', answer: 'يكتبُ الطالبُ الدرسَ.' },
  { id: 'past-present-2', prompt: 'حوّل: قرأَ سامرٌ الكتابَ.', answer: 'يقرأُ سامرٌ الكتابَ.' },
  { id: 'present-command-1', prompt: 'حوّل: يكتبُ الطالبُ الدرسَ.', answer: 'اكتبْ الدرسَ.' },
  { id: 'present-command-2', prompt: 'حوّل: يفتحُ خالدٌ البابَ.', answer: 'افتحْ البابَ.' },
]

const officialQuestions: OfficialQuestion[] = [
  {
    number: 1,
    type: 'choice',
    prompt: 'الفعل يدل على:',
    options: ['اسم فقط', 'حدث مرتبط بزمن', 'حرف فقط', 'شيء لا زمن له'],
    answer: 'حدث مرتبط بزمن',
    explanation: 'الفعل كلمة تدل على حدث أو عمل مرتبط بزمن.',
  },
  {
    number: 2,
    type: 'choice',
    prompt: 'الفعل الماضي يدل على:',
    options: ['حدث انتهى', 'طلب القيام بالفعل', 'حدث سيقع فقط', 'اسم شخص'],
    answer: 'حدث انتهى',
    explanation: 'الماضي يدل على حدث وقع وانتهى قبل الآن.',
  },
  {
    number: 3,
    type: 'choice',
    prompt: 'الفعل المضارع يدل على:',
    options: ['حدث انتهى دائمًا', 'حدث يحدث الآن أو قد يحدث لاحقًا', 'أمر فقط', 'اسم يبدأ بحرف المضارعة'],
    answer: 'حدث يحدث الآن أو قد يحدث لاحقًا',
    explanation: 'المضارع يخبر عن الحاضر، وقد يدل على المستقبل إذا دل السياق على ذلك.',
  },
  {
    number: 4,
    type: 'choice',
    prompt: 'فعل الأمر هو:',
    options: ['خبر عن حدث انتهى', 'طلب القيام بالفعل', 'اسم يدل على شخص', 'فعل يدل على الحاضر فقط'],
    answer: 'طلب القيام بالفعل',
    explanation: 'الأمر يطلب من شخص أن يقوم بعمل.',
  },
  {
    number: 5,
    type: 'choice',
    prompt: 'أي كلمة مما يأتي فعل ماضٍ؟',
    options: ['يكتبُ', 'اكتبْ', 'كتبَ', 'تكتبُ'],
    answer: 'كتبَ',
    explanation: 'كتبَ يدل على حدث وقع وانتهى.',
  },
  {
    number: 6,
    type: 'choice',
    prompt: 'أي كلمة مما يأتي فعل مضارع؟',
    options: ['قرأَ', 'اقرأْ', 'يقرأُ', 'جلسَ'],
    answer: 'يقرأُ',
    explanation: 'يقرأُ يخبر عن القراءة في الحاضر أو المستقبل.',
  },
  {
    number: 7,
    type: 'choice',
    prompt: 'أي كلمة مما يأتي فعل أمر؟',
    options: ['لعبَ', 'يلعبُ', 'العبْ', 'لعبٌ'],
    answer: 'العبْ',
    explanation: 'العبْ يطلب من المخاطب أن يقوم باللعب.',
  },
  {
    number: 8,
    type: 'choice',
    prompt: 'أحرف المضارعة هي:',
    options: ['أ، ن، ي، ت', 'ب، ج، د، ر', 'س، ف، ك، ل', 'م، و، ه، ة'],
    answer: 'أ، ن، ي، ت',
    explanation: 'نتذكر أحرف المضارعة بكلمة: أنيت.',
  },
  {
    number: 9,
    type: 'choice',
    prompt: 'الفعل الماضي يدل على حدث انتهى قبل الآن. (   )',
    options: ['صح', 'خطأ'],
    answer: 'صح',
    explanation: 'هذه هي دلالة الماضي الأساسية.',
  },
  {
    number: 10,
    type: 'choice',
    prompt: 'الفعل المضارع قد يدل على المستقبل. (   )',
    options: ['صح', 'خطأ'],
    answer: 'صح',
    explanation: 'قد يدل المضارع على المستقبل مثل: يذهبُ غدًا، وسيسافرُ أبي.',
  },
  {
    number: 11,
    type: 'choice',
    prompt: 'فعل الأمر يخبر عن فعل انتهى. (   )',
    options: ['صح', 'خطأ'],
    answer: 'خطأ',
    explanation: 'فعل الأمر يطلب القيام بالفعل، ولا يخبر عن فعل انتهى.',
  },
  {
    number: 12,
    type: 'choice',
    prompt: 'كل كلمة تبدأ بأحد أحرف المضارعة تكون فعلًا مضارعًا. (   )',
    options: ['صح', 'خطأ'],
    answer: 'خطأ',
    explanation: 'أحمدُ وياسرُ اسمان، وليسا فعلين مضارعين.',
  },
  {
    number: 13,
    type: 'choice',
    prompt: 'في جملة "لم يكتبْ سامرٌ"، كلمة "يكتبْ" فعل مضارع. (   )',
    options: ['صح', 'خطأ'],
    answer: 'صح',
    explanation: 'لم يغيّر نوع الفعل؛ يكتبْ فعل مضارع. وفي هذا الدرس لا نحتاج إلى دراسة إعراب الفعل بعد لم.',
  },
  {
    number: 14,
    type: 'choice',
    prompt: 'في جملة "لن يذهبَ خالدٌ"، كلمة "يذهبَ" فعل أمر. (   )',
    options: ['صح', 'خطأ'],
    answer: 'خطأ',
    explanation: 'يذهبَ فعل مضارع، و"لن" أداة نفي لا تحوّله إلى فعل أمر.',
  },
  {
    number: 15,
    type: 'open',
    prompt: 'صنّف الأفعال الآتية: كتبَ — يقرأُ — اذهبْ. اكتب نوع كل فعل.',
    answer: 'كتبَ: فعل ماضٍ. يقرأُ: فعل مضارع. اذهبْ: فعل أمر.',
    explanation: 'ننظر إلى دلالة الفعل: انتهى، يحدث أو سيحدث، أو طلب.',
    rows: 3,
  },
  {
    number: 16,
    type: 'open',
    prompt: 'استخرج الفعل وحدد زمنه من الجملة: "قرأَ الطالبُ القصةَ أمسِ."',
    answer: 'الفعل: قرأَ. زمنه: ماضٍ.',
    explanation: 'كلمة قرأَ تدل على حدث انتهى، وتساعد كلمة أمسِ على اكتشاف الماضي.',
    rows: 3,
  },
  {
    number: 17,
    type: 'open',
    prompt: 'استخرج الفعل وحدد زمنه من الجملة: "يكتبُ سامرٌ واجبه الآن."',
    answer: 'الفعل: يكتبُ. زمنه: مضارع.',
    explanation: 'يكتبُ فعل مضارع؛ لأنه يخبر عن حدث يحدث الآن.',
    rows: 3,
  },
  {
    number: 18,
    type: 'open',
    prompt: 'حوّل الماضي إلى المضارع: "لعبَ الطفلُ بالكرةِ."',
    answer: 'يلعبُ الطفلُ بالكرةِ.',
    explanation: 'نحوّل لعبَ إلى يلعبُ؛ لأن المضارع يدل على الحاضر أو المستقبل.',
    rows: 3,
  },
  {
    number: 19,
    type: 'open',
    prompt: 'حوّل المضارع إلى الأمر: "يقرأُ الطالبُ الكتابَ."',
    answer: 'اقرأْ الكتابَ.',
    explanation: 'نحوّل يقرأُ إلى اقرأْ؛ لأن اقرَأْ يطلب من المخاطب القراءة.',
    rows: 3,
  },
  {
    number: 20,
    type: 'open',
    prompt: 'سؤال تفكير: كيف تميّز بين "تكتبُ" و"كتبتْ"؟ وكيف تميّز بين "يكتبُ" و"اكتبْ"؟ اكتب القاعدة التي استخدمتها.',
    answer: 'تكتبُ فعل مضارع؛ لأنه يخبر عن فعل يحدث الآن أو قد يحدث لاحقًا، وكتبتْ فعل ماضٍ؛ لأنه يدل على حدث انتهى. يكتبُ يخبر عن فعل، أما اكتبْ فيطلب فعلًا من المخاطب.',
    explanation: 'الزمن والدلالة أهم من شكل الكلمة وحده: خبر أم طلب؟ حدث انتهى أم يحدث أو سيحدث؟',
    rows: 5,
  },
]

const solvedExamples = [
  { number: 1, sentence: 'كتبَ الطالبُ الدرسَ.', answer: 'كتبَ = فعل ماضٍ؛ لأنه يدل على حدث انتهى.' },
  { number: 2, sentence: 'يقرأُ سامرٌ الكتابَ.', answer: 'يقرأُ = فعل مضارع؛ لأنه يدل على فعل يحدث الآن أو قد يحدث لاحقًا.' },
  { number: 3, sentence: 'اقرأْ الكتابَ.', answer: 'اقرأْ = فعل أمر؛ لأنه يطلب من المخاطب أن يقرأ.' },
  { number: 4, sentence: 'سيسافرُ أبي غدًا.', answer: 'سيسافرُ = فعل مضارع يدل على المستقبل، وكلمة غدًا دلّت على زمن المستقبل.' },
  { number: 5, sentence: 'لم يكتبْ خالدٌ.', answer: 'يكتبْ = فعل مضارع. النفي لا يغيّر نوع الفعل، وفي هذا الدرس لا نحتاج إلى دراسة إعراب الفعل بعد لم.' },
  { number: 6, sentence: 'تكتبُ سارةُ واجبها، ثم قالت لها أمها: اكتبْ العنوانَ.', answer: 'تكتبُ = فعل مضارع يخبر عن فعل، واكتبْ = فعل أمر يطلب فعلًا.' },
]

export function LessonFour({ onProgressChange, onFinish }: LessonFourProps) {
  const [activityOneAnswers, setActivityOneAnswers] = useState<ActivityAnswers>({})
  const [activityOneChecked, setActivityOneChecked] = useState(false)
  const [activityTwoAnswers, setActivityTwoAnswers] = useState<ActivityAnswers>({})
  const [activityTwoChecked, setActivityTwoChecked] = useState(false)
  const [activityThreeAnswers, setActivityThreeAnswers] = useState<ActivityAnswers>({})
  const [activityThreeChecked, setActivityThreeChecked] = useState(false)
  const [transformationAnswers, setTransformationAnswers] = useState<ActivityAnswers>({})
  const [transformationChecked, setTransformationChecked] = useState(false)
  const [detectiveAnswer, setDetectiveAnswer] = useState('')
  const [detectiveChecked, setDetectiveChecked] = useState(false)
  const [testAnswers, setTestAnswers] = useState<Record<number, string>>({})
  const [testChecked, setTestChecked] = useState(false)

  function setAnswer(setter: Dispatch<SetStateAction<ActivityAnswers>>, id: string, value: string) {
    setter((current) => ({ ...current, [id]: value }))
  }

  const steps: LessonStepDefinition[] = [
    {
      id: 'intro',
      title: 'مدخل الدرس: أزمنة الفعل',
      group: 'البداية',
      icon: '⏳',
      description: 'الدرس الرابع: أزمنة الفعل — الفعل الماضي، والفعل المضارع، وفعل الأمر.',
      render: () => (
        <EducationalCard title="الدرس الرابع: أزمنة الفعل" eyebrow="عنوان الدرس" tone="accent">
          <div className="tense-hero" aria-label="أنواع الفعل بحسب الزمن">
            <span>ماضٍ</span><span aria-hidden="true">←</span><span>مضارع</span><span aria-hidden="true">←</span><span>أمر</span>
          </div>
          <p className="tense-hero__topic">الفعل الماضي، والفعل المضارع، وفعل الأمر</p>
          <p>الفعل كلمة تدل على <strong>حدث مرتبط بزمن</strong>. في هذا الدرس سنتعلم كيف نعرف زمن الفعل ونميّز بين أنواعه.</p>
          <div className="source-note source-note--large">اسأل نفسك دائمًا: هل انتهى الفعل؟ هل يحدث أو سيحدث؟ أم أنه طلب؟</div>
        </EducationalCard>
      ),
    },
    {
      id: 'objectives',
      title: 'أهداف الدرس',
      group: 'البداية',
      icon: '🎯',
      description: 'في نهاية الدرس، يُتوقع من الطالب أن يستطيع تمييز أزمنة الفعل واستعمالها.',
      render: () => (
        <EducationalCard title="في نهاية هذا الدرس، يُتوقع من الطالب أن يستطيع" eyebrow="أهداف الدرس">
          <ol className="source-list source-list--arabic-numbers objective-list">
            <li>أن يعرف أن الفعل يدل على حدث مرتبط بزمن.</li>
            <li>أن يعرف الفعل الماضي ويميزه.</li>
            <li>أن يعرف الفعل المضارع ويميزه.</li>
            <li>أن يعرف فعل الأمر ويميزه.</li>
            <li>أن يحدد زمن الفعل في جملة بسيطة.</li>
            <li>أن يتعرف إلى أحرف المضارعة: أ، ن، ي، ت.</li>
            <li>أن يفرق بين الاسم الذي يبدأ بحرف من أحرف المضارعة والفعل المضارع.</li>
            <li>أن يفرق بين المضارع والأمر.</li>
            <li>أن يحول الفعل الماضي إلى المضارع.</li>
            <li>أن يحول الفعل المضارع إلى الأمر، وأن يطبق الأنواع الثلاثة في جمل.</li>
          </ol>
        </EducationalCard>
      ),
    },
    {
      id: 'recap',
      title: 'تذكّر ما تعلمناه',
      group: 'البداية',
      icon: '🧠',
      description: 'الفعل كلمة تدل على حدث أو عمل مرتبط بزمن.',
      render: () => (
        <>
          <div className="source-section-label">أولًا: الشرح التفصيلي — تمهيد</div>
          <p>تعلمنا أن الفعل كلمة تدل على <strong>حدث أو عمل مرتبط بزمن</strong>، وأن الفعل ثلاثة أنواع.</p>
          <div className="tense-triad">
            <TenseMiniCard label="فعل ماضٍ" example="كتبَ" note="حدث انتهى" />
            <TenseMiniCard label="فعل مضارع" example="يكتبُ" note="يحدث أو قد يحدث" />
            <TenseMiniCard label="فعل أمر" example="اكتبْ" note="طلب القيام بالفعل" />
          </div>
          <p className="source-note source-note--important">في هذا الدرس سنتوسع في أزمنة الفعل وطريقة التمييز بينها.</p>
        </>
      ),
    },
    {
      id: 'what-are-tenses',
      title: '1. ما أزمنة الفعل؟',
      shortTitle: 'ما أزمنة الفعل؟',
      group: 'الفعل الماضي',
      icon: '🕰️',
      description: 'الزمن يربط الحدث بالماضي أو الحاضر أو المستقبل، والأمر يطلب حدوث الفعل.',
      render: () => (
        <>
          <p className="source-section-label">1. ما أزمنة الفعل؟</p>
          <p>الفعل يدل على <strong>حدث مرتبط بزمن</strong>. والزمن يخبرنا متى وقع الحدث أو متى يقع أو سيقع.</p>
          <div className="timeline-card">
            <div><b>الماضي</b><span>حدث انتهى</span></div>
            <div><b>الحاضر</b><span>حدث يحدث الآن</span></div>
            <div><b>المستقبل</b><span>حدث قد يحدث لاحقًا</span></div>
          </div>
          <p>أما <strong>فعل الأمر</strong> فهو طلب القيام بالفعل، مثل: اكتبْ.</p>
        </>
      ),
    },
    {
      id: 'past-definition',
      title: '2. الفعل الماضي — التعريف',
      group: 'الفعل الماضي',
      icon: '🌙',
      description: 'هل حدث الفعل وانتهى قبل الآن؟ إذن هو فعل ماضٍ.',
      render: () => (
        <>
          <p className="source-section-label">2. الفعل الماضي</p>
          <div className="definition-panel tense-definition">
            <p><strong>الفعل الماضي هو الفعل الذي يدل على حدث وقع وانتهى قبل زمن التكلم.</strong></p>
          </div>
          <p>فإذا سألت: <strong>هل حدث الفعل وانتهى قبل الآن؟</strong> وكانت الإجابة نعم، فالفعل <strong>ماضٍ</strong>.</p>
          <DiscoveryChoice
            question="هل حدث الفعل وانتهى قبل الآن؟"
            options={['نعم، انتهى', 'لا، يحدث أو سيحدث']}
            answer="نعم، انتهى"
            reveal="فعل ماضٍ."
          />
        </>
      ),
    },
    {
      id: 'past-examples',
      title: '3. أمثلة على الفعل الماضي',
      group: 'الفعل الماضي',
      icon: '📜',
      description: 'نقرأ أمثلة كثيرة، ثم نربط كل فعل بحدث انتهى.',
      render: () => (
        <>
          <p className="source-section-label">3. أمثلة على الماضي</p>
          <p>من أمثلة الفعل الماضي:</p>
          <div className="word-example-grid tense-word-grid">
            {pastExamples.map((word) => <bdi key={word}>{word}</bdi>)}
          </div>
          <div className="example-grid">
            <ExampleSentence text="كتبَ الطالبُ الدرسَ." note="الكتابة حدثت وانتهت." />
            <ExampleSentence text="قرأَ سامرٌ الكتابَ." note="القراءة حدثت وانتهت." />
            <ExampleSentence text="ذهبَ خالدٌ إلى المدرسةِ." note="الذهاب حدث وانتهى." />
            <ExampleSentence text="شربَ الطفلُ الحليبَ." note="الشرب حدث وانتهى." />
          </div>
        </>
      ),
    },
    {
      id: 'past-sentences',
      title: '4. الماضي في الجمل',
      group: 'الفعل الماضي',
      icon: '📝',
      description: 'نكتشف الماضي بالسؤال عن الحدث الذي انتهى.',
      render: () => (
        <>
          <p className="source-section-label">4. الماضي في الجمل</p>
          <p>انظر إلى الجمل:</p>
          <div className="sentence-stack">
            <ExampleSentence text="لعبَ الطفلُ بالكرةِ." note="لعبَ: فعل ماضٍ؛ اللعب انتهى." />
            <ExampleSentence text="جلسَ المعلمُ." note="جلسَ: فعل ماضٍ؛ الجلوس حدث وانتهى." />
            <ExampleSentence text="فتحَ أحمدُ البابَ." note="فتحَ: فعل ماضٍ؛ الفتح حدث وانتهى." />
          </div>
          <RuleBox title="قاعدة">إذا كان الحدث قد وقع وانتهى، فالفعل ماضٍ.</RuleBox>
        </>
      ),
    },
    {
      id: 'past-discovery',
      title: '5. كيف أتعرف إلى الماضي؟',
      group: 'الفعل الماضي',
      icon: '🔎',
      description: 'اسأل: هل انتهى الفعل؟ ثم جرّب وضع كلمة تدل على الماضي.',
      render: () => (
        <>
          <p className="source-section-label">5. كيف أتعرف إلى الماضي؟</p>
          <div className="discovery-steps">
            <DecisionStep number="١" question="هل وقع الحدث وانتهى؟" answer="إذا نعم، فهو ماضٍ." />
            <DecisionStep number="٢" question="هل يناسبه: أمسِ أو البارحة؟" answer="إذا نعم، فهذا دليل مساعد على الماضي." />
          </div>
          <p>مثال: <bdi>زارَ أبي صديقه.</bdi> — يمكن أن نقول: زارَ أبي صديقه <strong>أمسِ</strong>، إذن زارَ فعل ماضٍ.</p>
          <p className="source-note">هذه الكلمات تساعدنا، لكننا نعتمد أولًا على معنى الفعل وزمن الحدث.</p>
        </>
      ),
    },
    {
      id: 'past-clues',
      title: '6. كلمات تساعدنا على اكتشاف الماضي',
      group: 'الفعل الماضي',
      icon: '🗓️',
      description: 'أمسِ، البارحة، منذ قليل، سابقًا، في الأسبوع الماضي، في العام الماضي.',
      render: () => (
        <>
          <p className="source-section-label">6. كلمات تساعدنا على اكتشاف الماضي</p>
          <p>توجد كلمات تساعدنا على معرفة أن الحدث وقع في الماضي:</p>
          <div className="clue-chip-grid">
            {['أمسِ', 'البارحة', 'منذ قليل', 'سابقًا', 'في الأسبوع الماضي', 'في العام الماضي'].map((word) => <span key={word}>{word}</span>)}
          </div>
          <div className="example-grid">
            <ExampleSentence text="سافرَ أبي في الأسبوع الماضي." note="سافرَ: فعل ماضٍ." />
            <ExampleSentence text="وصلَ الضيفُ منذ قليل." note="وصلَ: فعل ماضٍ." />
          </div>
          <p className="source-note source-note--important">الكلمة الزمنية دليل يساعدنا، وليست هي الفعل نفسه.</p>
        </>
      ),
    },
    {
      id: 'more-past-examples',
      title: '7. أمثلة إضافية على الماضي',
      group: 'الفعل الماضي',
      icon: '✨',
      description: 'تثبيت معنى الماضي بأمثلة متنوعة.',
      render: () => (
        <>
          <p className="source-section-label">7. أمثلة على الماضي</p>
          <div className="example-grid example-grid--three">
            <ExampleSentence text="نجحَ الطالبُ." note="نجحَ: فعل ماضٍ." />
            <ExampleSentence text="نامَ الطفلُ." note="نامَ: فعل ماضٍ." />
            <ExampleSentence text="زرعَ الفلاحُ الشجرةَ." note="زرعَ: فعل ماضٍ." />
            <ExampleSentence text="حفظَتْ سارةُ القصيدةَ." note="حفظتْ: فعل ماضٍ." />
            <ExampleSentence text="شربَ محمدٌ الماءَ." note="شربَ: فعل ماضٍ." />
            <ExampleSentence text="فتحَ سامرٌ النافذةَ." note="فتحَ: فعل ماضٍ." />
          </div>
          <RuleBox title="تذكّر">الماضي = حدث وقع وانتهى.</RuleBox>
        </>
      ),
    },
    {
      id: 'present-definition',
      title: '8. الفعل المضارع — التعريف',
      group: 'الفعل المضارع',
      icon: '☀️',
      description: 'المضارع يخبر عن فعل يحدث الآن أو قد يحدث لاحقًا.',
      render: () => (
        <>
          <p className="source-section-label">8. الفعل المضارع</p>
          <div className="definition-panel tense-definition tense-definition--present">
            <p><strong>الفعل المضارع هو الفعل الذي يدل على حدث يحدث الآن أو قد يحدث لاحقًا.</strong></p>
          </div>
          <p>إذا قلت: <bdi>يكتبُ الطالبُ</bdi>، فأنت تخبر عن فعل يكتبه الآن أو سيكتبه في سياق يدل على المستقبل.</p>
          <DiscoveryChoice
            question="هل الفعل يخبر عن حدث يحدث الآن أو قد يحدث لاحقًا؟"
            options={['نعم', 'لا، انتهى قبل الآن']}
            answer="نعم"
            reveal="فعل مضارع."
          />
        </>
      ),
    },
    {
      id: 'present-sentences',
      title: '9. المضارع في الجمل',
      group: 'الفعل المضارع',
      icon: '🌱',
      description: 'نرى المضارع في جمل الحاضر.',
      render: () => (
        <>
          <p className="source-section-label">9. المضارع في الجمل</p>
          <div className="sentence-stack">
            <ExampleSentence text="يكتبُ الطالبُ الدرسَ." note="يكتبُ: فعل مضارع." />
            <ExampleSentence text="يقرأُ سامرٌ الكتابَ." note="يقرأُ: فعل مضارع." />
            <ExampleSentence text="تدرسُ سارةُ." note="تدرسُ: فعل مضارع." />
            <ExampleSentence text="نلعبُ في الحديقةِ." note="نلعبُ: فعل مضارع." />
          </div>
          <p>هذه الأفعال لا تخبر عن أحداث انتهت، بل عن أفعال تحدث أو يمكن أن تحدث.</p>
        </>
      ),
    },
    {
      id: 'present-future',
      title: '10. الحاضر والمستقبل',
      group: 'الفعل المضارع',
      icon: '🔮',
      description: 'قد يدل الفعل المضارع على الحاضر أو المستقبل بحسب السياق.',
      render: () => (
        <>
          <p className="source-section-label">10. الحاضر والمستقبل</p>
          <p>الفعل المضارع لا يعني الحاضر فقط؛ فقد يدل على المستقبل إذا دلّت الجملة على ذلك.</p>
          <div className="contrast-cards">
            <article><span>الآن</span><bdi>يكتبُ خالدٌ الآن.</bdi><p>يكتبُ: مضارع للحاضر.</p></article>
            <article><span>غدًا</span><bdi>يكتبُ خالدٌ غدًا.</bdi><p>يكتبُ: مضارع للمستقبل.</p></article>
          </div>
          <p className="source-note source-note--important">إذن: المضارع = يحدث الآن أو قد يحدث لاحقًا، والسياق يحدد المقصود.</p>
        </>
      ),
    },
    {
      id: 'present-discovery',
      title: '11. كيف أتعرف إلى المضارع؟',
      group: 'الفعل المضارع',
      icon: '🔍',
      description: 'ابحث عن معنى الحاضر أو المستقبل، ثم انتبه إلى بداية الفعل.',
      render: () => (
        <>
          <p className="source-section-label">11. كيف أتعرف إلى المضارع؟</p>
          <div className="discovery-steps">
            <DecisionStep number="١" question="هل الفعل يحدث الآن أو قد يحدث لاحقًا؟" answer="إذن هو فعل مضارع." />
            <DecisionStep number="٢" question="هل يبدأ غالبًا بأحد أحرف المضارعة؟" answer="أ، ن، ي، ت تساعدنا على اكتشافه." />
          </div>
          <p>أمثلة: <bdi>أكتبُ، نكتبُ، يكتبُ، تكتبُ.</bdi></p>
          <RuleBox title="تذكّر">المضارع يخبر عن فعل، ولا يطلب من شخص أن يفعله.</RuleBox>
        </>
      ),
    },
    {
      id: 'present-letters',
      title: '12. أحرف المضارعة: أ، ن، ي، ت',
      group: 'الفعل المضارع',
      icon: '🔤',
      description: 'نتذكر أحرف المضارعة بكلمة: أنيت.',
      render: () => (
        <>
          <p className="source-section-label">12. أحرف المضارعة</p>
          <p>غالبًا يبدأ الفعل المضارع بأحد هذه الأحرف الأربعة:</p>
          <div className="letter-strip lesson4-letter-strip" aria-label="أحرف المضارعة">
            <LetterCard letter="أ" example="أكتبُ" label="أنا" />
            <LetterCard letter="ن" example="نكتبُ" label="نحن" />
            <LetterCard letter="ي" example="يكتبُ" label="هو" />
            <LetterCard letter="ت" example="تكتبُ" label="أنتَ أو هي" />
          </div>
          <div className="memory-card"><strong>أنيت</strong><span>أ — ن — ي — ت</span><p>كلمة تذكّرنا بأحرف المضارعة الأربعة.</p></div>
          <p>مثل: <bdi>أدرسُ، ندرسُ، يدرسُ، تدرسُ.</bdi></p>
        </>
      ),
    },
    {
      id: 'not-every-letter',
      title: '13. انتبه: ليست كل كلمة تبدأ بها فعلًا مضارعًا',
      group: 'الفعل المضارع',
      icon: '⚠️',
      description: 'وجود أ، ن، ي، ت في بداية الكلمة دليل مساعد، لكنه ليس حكمًا وحده.',
      render: () => (
        <>
          <p className="source-section-label">13. انتبه</p>
          <div className="attention-box lesson4-warning"><strong>ليست كل كلمة تبدأ بأحد أحرف المضارعة فعلًا مضارعًا.</strong><p>يجب أن نسأل: هل الكلمة تدل على حدث؟ وهل تخبر عن فعل يحدث أو سيحدث؟</p></div>
          <div className="name-verb-contrast">
            <article className="name-card"><span>اسم</span><bdi>أحمدُ</bdi><p>بدأت بـ أ، لكنها اسم شخص وليست فعلًا.</p></article>
            <article className="name-card"><span>اسم</span><bdi>ياسرُ</bdi><p>بدأت بـ ي، لكنها اسم شخص وليست فعلًا.</p></article>
            <article className="verb-card"><span>فعل مضارع</span><bdi>تكتبُ</bdi><p>تدل على حدث يحدث أو سيحدث.</p></article>
            <article className="verb-card"><span>فعل مضارع</span><bdi>تدرسُ</bdi><p>تدل على حدث الدراسة.</p></article>
          </div>
          <RuleBox title="لا تعتمد على الحرف وحده">ابحث عن معنى الكلمة: اسم أم فعل؟</RuleBox>
        </>
      ),
    },
    {
      id: 'comparison-examples',
      title: '14. أمثلة المقارنة',
      group: 'الفعل المضارع',
      icon: '⚖️',
      description: 'نقارن بين كلمات تبدأ بالحروف نفسها، لكن نوعها مختلف.',
      render: () => (
        <>
          <p className="source-section-label">14. أمثلة المقارنة</p>
          <div className="comparison-board">
            <div><bdi>أحمدُ</bdi><span>اسم، وليس فعلًا مضارعًا</span></div>
            <div><bdi>أكتبُ</bdi><span>فعل مضارع، يدل على الكتابة</span></div>
            <div><bdi>ياسرُ</bdi><span>اسم، وليس فعلًا مضارعًا</span></div>
            <div><bdi>تدرسُ</bdi><span>فعل مضارع، يدل على الدراسة</span></div>
          </div>
          <p>الحرف الأول وحده لا يكفي. المعنى والدلالة على الحدث هما الأساس.</p>
        </>
      ),
    },
    {
      id: 'command-definition',
      title: '15. فعل الأمر — التعريف',
      group: 'فعل الأمر',
      icon: '📣',
      description: 'هل الكلمة تطلب من شخص أن يقوم بعمل؟ إذن هي فعل أمر.',
      render: () => (
        <>
          <p className="source-section-label">15. فعل الأمر</p>
          <div className="definition-panel command-definition"><p><strong>فعل الأمر هو الفعل الذي يدل على طلب القيام بالفعل.</strong></p></div>
          <p>عندما تقول لشخص: <bdi>اكتبْ</bdi>، فأنت لا تخبره أنه يكتب، بل <strong>تطلب منه أن يكتب</strong>.</p>
          <DiscoveryChoice
            question="هل الكلمة تطلب من شخص أن يقوم بعمل؟"
            options={['نعم، فيها طلب', 'لا، هي خبر']}
            answer="نعم، فيها طلب"
            reveal="فعل أمر."
          />
        </>
      ),
    },
    {
      id: 'command-discovery',
      title: '16. كيف أعرف فعل الأمر؟',
      group: 'فعل الأمر',
      icon: '🗣️',
      description: 'فعل الأمر يوجّه الكلام إلى المخاطب ويطلب منه فعلًا.',
      render: () => (
        <>
          <p className="source-section-label">16. كيف أعرف فعل الأمر؟</p>
          <p>اسأل: <strong>هل الكلمة تطلب من شخص أن يقوم بعمل؟</strong></p>
          <div className="command-grid">
            {commandExamples.slice(0, 6).map((word) => <div key={word}><bdi>{word}</bdi><span>طلب فعل</span></div>)}
          </div>
          <div className="example-grid">
            <ExampleSentence text="اقرأْ الكتابَ." note="اقرأْ: طلب من المخاطب أن يقرأ." />
            <ExampleSentence text="افتحْ البابَ." note="افتحْ: طلب من المخاطب أن يفتح." />
            <ExampleSentence text="اجلسْ هنا." note="اجلسْ: طلب من المخاطب أن يجلس." />
            <ExampleSentence text="اشربْ الماءَ." note="اشربْ: طلب من المخاطب أن يشرب." />
          </div>
        </>
      ),
    },
    {
      id: 'present-command',
      title: '17. الفرق بين المضارع والأمر',
      group: 'فعل الأمر',
      icon: '🔁',
      description: 'يكتبُ يخبر عن فعل، أما اكتبْ فيطلب فعلًا.',
      render: () => (
        <>
          <p className="source-section-label">17. الفرق بين المضارع والأمر</p>
          <div className="memorable-compare">
            <article><bdi>يكتبُ</bdi><strong>يخبر عن فعل</strong><span>فعل مضارع</span></article>
            <div aria-hidden="true">↔</div>
            <article><bdi>اكتبْ</bdi><strong>يطلب فعلًا</strong><span>فعل أمر</span></article>
          </div>
          <p>اسأل في كل مرة: هل المتكلم <strong>يخبر</strong> عن فعل، أم <strong>يطلب</strong> من شخص أن يفعله؟</p>
          <div className="example-grid"><ExampleSentence text="يقرأُ خالدٌ الكتابَ." note="خبر عن القراءة: مضارع." /><ExampleSentence text="اقرأْ الكتابَ يا خالدُ." note="طلب القراءة: أمر." /></div>
        </>
      ),
    },
    {
      id: 'comparison-table',
      title: '18. جدول الماضي والمضارع والأمر',
      group: 'المقارنة والتحويل',
      icon: '📊',
      description: 'نقارن النوع والدلالة والأمثلة في جدول واحد.',
      render: () => (
        <div className="table-scroll">
          <table className="tense-table"><caption>مقارنة أزمنة الفعل</caption><thead><tr><th>الماضي</th><th>المضارع</th><th>الأمر</th><th>الدلالة</th></tr></thead><tbody>
            {['كتبَ — يكتبُ — اكتبْ', 'قرأَ — يقرأُ — اقرأْ', 'لعبَ — يلعبُ — العبْ', 'جلسَ — يجلسُ — اجلسْ', 'فتحَ — يفتحُ — افتحْ', 'شربَ — يشربُ — اشربْ', 'درسَ — يدرسُ — ادرسْ', 'حفظَ — يحفظُ — احفظْ'].map((row) => { const [past, present, command] = row.split(' — '); return <tr key={row}><td><bdi>{past}</bdi></td><td><bdi>{present}</bdi></td><td><bdi>{command}</bdi></td><td>انتهى / يحدث أو سيحدث / طلب</td></tr> })}
          </tbody></table>
        </div>
      ),
    },
    {
      id: 'central-comparison',
      title: '19. المثال المهم: كتبَ — يكتبُ — اكتبْ',
      group: 'المقارنة والتحويل',
      icon: '⭐',
      description: 'احفظ هذه المقارنة المركزية: المعنى هو الذي يحدد النوع.',
      render: () => (
        <>
          <div className="central-tense-card">
            <div><bdi>كتبَ</bdi><span>حدث وانتهى</span><strong>ماضٍ</strong></div>
            <div><bdi>يكتبُ</bdi><span>يخبر عن فعل</span><strong>مضارع</strong></div>
            <div><bdi>اكتبْ</bdi><span>يطلب فعلًا</span><strong>أمر</strong></div>
          </div>
          <p className="source-note source-note--large">الكلمات الثلاث من أصل واحد، لكن الزمن والدلالة يغيران النوع.</p>
          <p className="formula-callout"><bdi>يكتبُ</bdi> = يخبر عن فعل، و<bdi>اكتبْ</bdi> = يطلب فعلًا.</p>
        </>
      ),
    },
    {
      id: 'quick-distinction',
      title: '20. كيف أميز الأنواع الثلاثة بسرعة؟',
      group: 'المقارنة والتحويل',
      icon: '⚡',
      description: 'ثلاثة أسئلة قصيرة تساعدك على التصنيف.',
      render: () => (
        <>
          <div className="quick-rule-grid">
            <DecisionStep number="١" question="هل انتهى الحدث؟" answer="ماضٍ" />
            <DecisionStep number="٢" question="هل يخبر عن فعل يحدث أو سيحدث؟" answer="مضارع" />
            <DecisionStep number="٣" question="هل يطلب فعلًا؟" answer="أمر" />
          </div>
          <p>لا تحكم من أول حرف فقط؛ اقرأ الكلمة داخل الجملة واسأل عن معناها.</p>
          <DiscoveryChoice question="كلمة: ادرسْ. هل هي خبر أم طلب؟" options={['خبر', 'طلب']} answer="طلب" reveal="إذن ادرسْ فعل أمر." />
        </>
      ),
    },
    {
      id: 'mental-drill',
      title: '21. تدريب ذهني سريع',
      group: 'المقارنة والتحويل',
      icon: '🧩',
      description: 'فكر قبل أن تكشف الإجابة.',
      render: () => <MentalDrill />,
    },
    {
      id: 'three-in-sentences',
      title: '22. الماضي والمضارع والأمر في جمل',
      group: 'المقارنة والتحويل',
      icon: '📚',
      description: 'نرى الأنواع الثلاثة في جمل واضحة.',
      render: () => (
        <div className="three-sentence-grid">
          <ExampleSentence text="كتبَ الطالبُ الدرسَ أمسِ." note="كتبَ: ماضٍ؛ حدث انتهى." />
          <ExampleSentence text="يكتبُ الطالبُ الدرسَ الآن." note="يكتبُ: مضارع؛ يحدث الآن." />
          <ExampleSentence text="اكتبْ الدرسَ يا طالبُ." note="اكتبْ: أمر؛ طلب القيام بالفعل." />
          <ExampleSentence text="قرأَ — يقرأُ — اقرأْ." note="ماضٍ — مضارع — أمر." />
        </div>
      ),
    },
    {
      id: 'past-to-present',
      title: '23. تحويل الماضي إلى المضارع',
      group: 'المقارنة والتحويل',
      icon: '➡️',
      description: 'نحوّل دلالة الحدث المنتهي إلى حدث يحدث أو قد يحدث.',
      render: () => (
        <>
          <p>عند التحويل من الماضي إلى المضارع، نغيّر صيغة الفعل:</p>
          <div className="conversion-card"><bdi>كتبَ</bdi><span>→</span><bdi>يكتبُ</bdi><p>كتبَ الطالبُ الدرسَ. ← يكتبُ الطالبُ الدرسَ.</p></div>
          <div className="conversion-card"><bdi>قرأَ</bdi><span>→</span><bdi>يقرأُ</bdi><p>قرأَ سامرٌ الكتابَ. ← يقرأُ سامرٌ الكتابَ.</p></div>
          <RuleBox title="تذكّر">الماضي حدث انتهى، والمضارع يحدث الآن أو قد يحدث لاحقًا.</RuleBox>
        </>
      ),
    },
    {
      id: 'present-to-command',
      title: '24. تحويل المضارع إلى الأمر',
      group: 'المقارنة والتحويل',
      icon: '👉',
      description: 'نحوّل الخبر عن الفعل إلى طلب القيام به.',
      render: () => (
        <>
          <p>عند التحويل إلى الأمر، لا نكتفي بتغيير البداية؛ بل نغيّر الدلالة من <strong>خبر</strong> إلى <strong>طلب</strong>.</p>
          <div className="conversion-card"><bdi>يكتبُ</bdi><span>→</span><bdi>اكتبْ</bdi><p>يكتبُ الطالبُ الدرسَ. ← اكتبْ الدرسَ.</p></div>
          <div className="conversion-card"><bdi>يفتحُ</bdi><span>→</span><bdi>افتحْ</bdi><p>يفتحُ خالدٌ البابَ. ← افتحْ البابَ.</p></div>
          <p className="source-note source-note--important">المضارع يخبر: يكتبُ. الأمر يطلب: اكتبْ.</p>
        </>
      ),
    },
    {
      id: 'dont-confuse',
      title: '25. لا تخلط بين الأمر والمضارع',
      group: 'المقارنة والتحويل',
      icon: '🚦',
      description: 'الدلالة هي المفتاح: يخبر أم يطلب؟',
      render: () => (
        <>
          <div className="memorable-compare memorable-compare--large">
            <article><bdi>يكتبُ</bdi><strong>يخبر عن فعل</strong><p>يمكن أن تقول: يكتبُ الطالبُ الآن.</p></article>
            <article><bdi>اكتبْ</bdi><strong>يطلب فعلًا</strong><p>يمكن أن تقول: اكتبْ الدرسَ يا طالبُ.</p></article>
          </div>
          <p>إذا أمكن وضع الكلمة بعد «يا» على صورة طلب، فهي أمر. وإذا كانت تخبر عما يحدث أو سيحدث، فهي مضارع.</p>
          <DiscoveryChoice question="في: اكتبْ واجبك. هل المتكلم يخبر أم يطلب؟" options={['يخبر', 'يطلب']} answer="يطلب" reveal="اكتبْ فعل أمر." />
        </>
      ),
    },
    {
      id: 'negation',
      title: 'النفي لا يغيّر نوع الفعل',
      group: 'المقارنة والتحويل',
      icon: '🛡️',
      description: 'لم يكتبْ ولَنْ يذهبَ: الفعلان مضارعان، ولا نضيف إعرابًا متقدمًا هنا.',
      render: () => (
        <>
          <div className="attention-box lesson4-warning"><strong>انتبه: النفي لا يغيّر نوع الفعل.</strong><p>في «لم يكتبْ» كلمة يكتبْ فعل مضارع، وفي «لن يذهبَ» كلمة يذهبَ فعل مضارع.</p></div>
          <div className="negation-grid"><ExampleSentence text="لم يكتبْ سامرٌ." note="يكتبْ = فعل مضارع." /><ExampleSentence text="لن يذهبَ خالدٌ." note="يذهبَ = فعل مضارع." /></div>
          <p className="source-note source-note--important">وفي هذا الدرس لا نحتاج إلى دراسة إعراب الفعل بعد "لم"، وسنتوسع في ذلك في دروس لاحقة.</p>
        </>
      ),
    },
    {
      id: 'taa-warning',
      title: 'انتبه إلى التاء',
      group: 'الأمثلة والتطبيق',
      icon: '🔔',
      description: 'تكتبُ وتدرسُ مضارعان، وكتبتْ ماضٍ؛ فلا نحكم من التاء وحدها.',
      render: () => (
        <>
          <div className="taa-contrast">
            <article><bdi>تكتبُ</bdi><strong>فعل مضارع</strong><p>تخبر عن فعل يحدث أو سيحدث.</p></article>
            <article><bdi>كتبتْ</bdi><strong>فعل ماضٍ</strong><p>تدل على حدث انتهى، والتاء هنا في آخر الفعل.</p></article>
            <article><bdi>تدرسُ</bdi><strong>فعل مضارع</strong><p>بدأ بأحد أحرف المضارعة.</p></article>
          </div>
          <p>انتبه إلى مكان التاء وإلى معنى الفعل في الجملة، ولا تعتمد على حرف واحد فقط.</p>
        </>
      ),
    },
    {
      id: 'worked-examples',
      title: 'الأمثلة المحلولة',
      group: 'الأمثلة والتطبيق',
      icon: '✅',
      description: 'ثانيًا: أمثلة محلولة — ستة أمثلة محلولة تجمع قواعد الدرس.',
      render: () => <WorkedExamples />,
    },
    {
      id: 'activity-one',
      title: 'النشاط الأول: تصنيف الأفعال',
      shortTitle: 'تصنيف الأفعال',
      group: 'الأنشطة',
      icon: '🗂️',
      description: 'ثالثًا: الأنشطة التطبيقية — صنّف كل فعل: ماضٍ، مضارع، أم أمر، ثم اعرض التغذية الراجعة.',
      render: () => <ClassificationActivity answers={activityOneAnswers} checked={activityOneChecked} onChange={(id, value) => setAnswer(setActivityOneAnswers, id, value)} onCheck={() => setActivityOneChecked(true)} onReset={() => { setActivityOneAnswers({}); setActivityOneChecked(false) }} />,
    },
    {
      id: 'activity-two',
      title: 'النشاط الثاني: تحديد زمن الفعل',
      shortTitle: 'تحديد زمن الفعل',
      group: 'الأنشطة',
      icon: '⏱️',
      description: 'اقرأ الجملة وحدد زمن الفعل فيها.',
      render: () => <TenseSentencesActivity answers={activityTwoAnswers} checked={activityTwoChecked} onChange={(id, value) => setAnswer(setActivityTwoAnswers, id, value)} onCheck={() => setActivityTwoChecked(true)} onReset={() => { setActivityTwoAnswers({}); setActivityTwoChecked(false) }} />,
    },
    {
      id: 'activity-three',
      title: 'النشاط الثالث: اختيار الفعل المناسب',
      shortTitle: 'اختيار الفعل المناسب',
      group: 'الأنشطة',
      icon: '🎯',
      description: 'اختر الفعل الذي يناسب الزمن والمعنى في كل جملة.',
      render: () => <ChooseVerbActivity answers={activityThreeAnswers} checked={activityThreeChecked} onChange={(id, value) => setAnswer(setActivityThreeAnswers, id, value)} onCheck={() => setActivityThreeChecked(true)} onReset={() => { setActivityThreeAnswers({}); setActivityThreeChecked(false) }} />,
    },
    {
      id: 'activity-four',
      title: 'النشاط الرابع: التحويل',
      shortTitle: 'التحويل',
      group: 'الأنشطة',
      icon: '🔄',
      description: 'حوّل الماضي إلى المضارع، والمضارع إلى الأمر.',
      render: () => <TransformationActivity answers={transformationAnswers} checked={transformationChecked} onChange={(id, value) => setAnswer(setTransformationAnswers, id, value)} onCheck={() => setTransformationChecked(true)} onReset={() => { setTransformationAnswers({}); setTransformationChecked(false) }} />,
    },
    {
      id: 'activity-five',
      title: 'النشاط الخامس: المحقق اللغوي',
      shortTitle: 'المحقق اللغوي',
      group: 'الأنشطة',
      icon: '🕵️',
      description: 'اكتشف نوع الفعل، ثم اشرح الفرق بين الخبر والطلب.',
      render: () => <DetectiveActivity answer={detectiveAnswer} checked={detectiveChecked} onChange={setDetectiveAnswer} onCheck={() => setDetectiveChecked(true)} onReset={() => { setDetectiveAnswer(''); setDetectiveChecked(false) }} />,
    },
    {
      id: 'final-test',
      title: 'اختبار نهاية الدرس',
      group: 'اختبر نفسك',
      icon: '📝',
      description: 'رابعًا: اختبار نهاية الدرس — الاختبار الرسمي: 20 سؤالًا، مع feedback بعد التحقق.',
      render: () => <OfficialTest answers={testAnswers} checked={testChecked} onChange={(number, value) => setTestAnswers((current) => ({ ...current, [number]: value }))} onCheck={() => setTestChecked(true)} />,
    },
    {
      id: 'teacher-space',
      title: 'منطقة المعلم',
      group: 'منطقة المعلم',
      icon: '👨‍🏫',
      description: 'خامسًا: منطقة خاصة بالمعلم — الإجابات النموذجية، التصحيح، التدريب العلاجي، ومعيار الإتقان.',
      render: () => (
        <>
          <div className="teacher-intro"><div><p className="section-kicker">منطقة المعلم</p><h3>الإجابات والملاحظات التربوية</h3></div><p>تظهر المادة بعد فتح البوابة فقط.</p></div>
          <TeacherSpace><TeacherMaterial /></TeacherSpace>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'الخلاصة والقاعدة الذهبية',
      shortTitle: 'الخلاصة',
      group: 'الخلاصة',
      icon: '🏆',
      description: 'مراجعة نهائية لأزمنة الفعل.',
      render: () => <Summary />,
    },
  ]

  return <LessonFlow steps={steps} onProgressChange={onProgressChange} onFinish={onFinish} lessonTitle="الفعل الماضي، والفعل المضارع، وفعل الأمر" lessonNumber="٤" lessonEyebrow="أزمنة الفعل" />
}

function TenseMiniCard({ label, example, note }: { label: string; example: string; note: string }) {
  return <article className="tense-mini-card"><span>{label}</span><bdi>{example}</bdi><small>{note}</small></article>
}

function ExampleSentence({ text, note }: { text: string; note: string }) {
  return <div className="example-box example-box--good"><p className="example-box__text"><bdi>{text}</bdi></p><p>{note}</p></div>
}

function RuleBox({ title, children }: { title: string; children: ReactNode }) {
  return <div className="rule-box"><strong>{title}</strong><p>{children}</p></div>
}

function DecisionStep({ number, question, answer }: { number: string; question: string; answer: string }) {
  return <article className="decision-step"><span>{number}</span><strong>{question}</strong><p>{answer}</p></article>
}

function DiscoveryChoice({ question, options, answer, reveal }: { question: string; options: string[]; answer: string; reveal: string }) {
  const [selected, setSelected] = useState('')
  const [revealed, setRevealed] = useState(false)
  return <div className="discovery-choice"><p><strong>{question}</strong></p><div className="choice-buttons">{options.map((option) => <button type="button" key={option} className={selected === option ? 'choice-button is-selected' : 'choice-button'} onClick={() => { setSelected(option); setRevealed(false) }}>{option}</button>)}</div><button type="button" className="button button--secondary" disabled={!selected} onClick={() => setRevealed(true)}>اكشف الإجابة</button>{revealed && <p className={selected === answer ? 'activity-feedback activity-feedback--good' : 'activity-feedback'}>{selected === answer ? 'أحسنت. ' : 'فكّر مرة أخرى. '} {reveal}</p>}</div>
}

function LetterCard({ letter, example, label }: { letter: string; example: string; label: string }) {
  return <div className="letter-chip"><span className="letter-chip__letter"><bdi>{letter}</bdi></span><bdi>{example}</bdi><span>{label}</span></div>
}

function WorkedExamples() {
  const [revealed, setRevealed] = useState<Record<number, boolean>>({})
  return <div className="worked-examples"><p>حاول أن تحدد نوع الفعل قبل أن تكشف الحل:</p>{solvedExamples.map((example) => <article className="worked-example" key={example.number}><div><span className="activity-number">{example.number}</span><bdi>{example.sentence}</bdi></div><button type="button" className="button button--ghost" onClick={() => setRevealed((current) => ({ ...current, [example.number]: !current[example.number] }))}>{revealed[example.number] ? 'إخفاء الحل' : 'أظهر الحل'}</button>{revealed[example.number] && <p className="activity-feedback activity-feedback--good">{example.answer}</p>}</article>)}</div>
}

function MentalDrill() {
  const drills = [
    { prompt: 'يقرأُ', answer: 'مضارع؛ يخبر عن فعل.' },
    { prompt: 'اقرأْ', answer: 'أمر؛ يطلب فعلًا.' },
    { prompt: 'قرأَ', answer: 'ماضٍ؛ حدث انتهى.' },
    { prompt: 'أحمدُ', answer: 'اسم، وليس فعلًا مضارعًا.' },
  ]
  const [open, setOpen] = useState<Record<string, boolean>>({})
  return <div className="mental-drill">{drills.map((drill) => <button type="button" key={drill.prompt} className="mental-drill__item" onClick={() => setOpen((current) => ({ ...current, [drill.prompt]: !current[drill.prompt] }))}><bdi>{drill.prompt}</bdi><span>{open[drill.prompt] ? drill.answer : 'فكّر ثم اكشف'}</span></button>)}</div>
}

function ActivityHeader({ number, title, children }: { number: string; title: string; children: ReactNode }) {
  return <div className="activity-card__heading"><span className="activity-number">{number}</span><div><p className="section-kicker">نشاط تفاعلي</p><h3>{title}</h3><p>{children}</p></div></div>
}

function ActivityActions({ checked, disabled, onCheck, onReset }: { checked: boolean; disabled: boolean; onCheck: () => void; onReset: () => void }) {
  return <div className="activity-actions">{!checked ? <button type="button" className="button button--primary" disabled={disabled} onClick={onCheck}>تحقق من النشاط</button> : <button type="button" className="button button--secondary" onClick={onReset}>أعد النشاط</button>}{!checked && disabled && <p>أكمل الإجابات أولًا.</p>}</div>
}

function ClassificationActivity({ answers, checked, onChange, onCheck, onReset }: { answers: ActivityAnswers; checked: boolean; onChange: (id: string, value: string) => void; onCheck: () => void; onReset: () => void }) {
  const allAnswered = activityOneItems.every((item) => answers[item.word])
  return <div className="activity-card"><ActivityHeader number="١" title="تصنيف الأفعال">صنّف الأفعال إلى ماضٍ أو مضارع أو أمر.</ActivityHeader><div className="activity-list">{activityOneItems.map((item) => <label className="activity-row" key={item.word}><bdi>{item.word}</bdi><select value={answers[item.word] || ''} disabled={checked} onChange={(event) => onChange(item.word, event.target.value)}><option value="">اختر النوع</option><option value="ماضٍ">فعل ماضٍ</option><option value="مضارع">فعل مضارع</option><option value="أمر">فعل أمر</option></select>{checked && <span className={answers[item.word] === item.answer ? 'answer-mark is-good' : 'answer-mark'}>{answers[item.word] === item.answer ? '✓ صحيح' : `الصحيح: ${item.answer}`}</span>}</label>)}</div><ActivityActions checked={checked} disabled={!allAnswered} onCheck={onCheck} onReset={onReset} />{checked && <p className="activity-feedback activity-feedback--good">أحسنت المحاولة. راجع دلالة كل فعل: انتهى، يحدث أو سيحدث، أم يطلب.</p>}</div>
}

function TenseSentencesActivity({ answers, checked, onChange, onCheck, onReset }: { answers: ActivityAnswers; checked: boolean; onChange: (id: string, value: string) => void; onCheck: () => void; onReset: () => void }) {
  const allAnswered = activityTwoItems.every((item) => answers[item.sentence])
  return <div className="activity-card"><ActivityHeader number="٢" title="تحديد زمن الفعل">اقرأ الجملة ثم حدّد زمن الفعل فيها.</ActivityHeader><div className="activity-list">{activityTwoItems.map((item) => <label className="activity-row activity-row--sentence" key={item.sentence}><bdi>{item.sentence}</bdi><select value={answers[item.sentence] || ''} disabled={checked} onChange={(event) => onChange(item.sentence, event.target.value)}><option value="">اختر الزمن</option><option value="ماضٍ">ماضٍ</option><option value="مضارع">مضارع</option><option value="أمر">أمر</option></select>{checked && <span className={answers[item.sentence] === item.answer ? 'answer-mark is-good' : 'answer-mark'}>{answers[item.sentence] === item.answer ? '✓ صحيح' : `الصحيح: ${item.answer}`}</span>}</label>)}</div><ActivityActions checked={checked} disabled={!allAnswered} onCheck={onCheck} onReset={onReset} />{checked && <p className="source-note">انتبه إلى: أمسِ، الآن، غدًا، ولم ولن. السياق يساعدنا، والنفي لا يغيّر نوع الفعل.</p>}</div>
}

function ChooseVerbActivity({ answers, checked, onChange, onCheck, onReset }: { answers: ActivityAnswers; checked: boolean; onChange: (id: string, value: string) => void; onCheck: () => void; onReset: () => void }) {
  const allAnswered = activityThreeItems.every((item) => answers[item.sentence])
  return <div className="activity-card"><ActivityHeader number="٣" title="اختيار الفعل المناسب">اختر الفعل المناسب للزمن والمعنى.</ActivityHeader><div className="activity-list">{activityThreeItems.map((item) => <label className="activity-row activity-row--sentence" key={item.sentence}><bdi>{item.sentence}</bdi><select value={answers[item.sentence] || ''} disabled={checked} onChange={(event) => onChange(item.sentence, event.target.value)}><option value="">اختر الفعل</option>{item.options.map((option) => <option key={option} value={option}>{option}</option>)}</select>{checked && <span className={answers[item.sentence] === item.answer ? 'answer-mark is-good' : 'answer-mark'}>{answers[item.sentence] === item.answer ? '✓ صحيح' : `الصحيح: ${item.answer}`}</span>}</label>)}</div><ActivityActions checked={checked} disabled={!allAnswered} onCheck={onCheck} onReset={onReset} /></div>
}

function TransformationActivity({ answers, checked, onChange, onCheck, onReset }: { answers: ActivityAnswers; checked: boolean; onChange: (id: string, value: string) => void; onCheck: () => void; onReset: () => void }) {
  const allAnswered = transformationItems.every((item) => answers[item.id]?.trim())
  return <div className="activity-card"><ActivityHeader number="٤" title="التحويل">حوّل الماضي إلى المضارع، والمضارع إلى الأمر.</ActivityHeader><div className="transformation-list">{transformationItems.map((item) => <label key={item.id}><bdi>{item.prompt}</bdi><input value={answers[item.id] || ''} disabled={checked} onChange={(event) => onChange(item.id, event.target.value)} placeholder="اكتب التحويل هنا" />{checked && <span className={normaliseArabic(answers[item.id]) === normaliseArabic(item.answer) ? 'answer-mark is-good' : 'answer-mark'}>{normaliseArabic(answers[item.id]) === normaliseArabic(item.answer) ? '✓ صحيح' : `الإجابة النموذجية: ${item.answer}`}</span>}</label>)}</div><ActivityActions checked={checked} disabled={!allAnswered} onCheck={onCheck} onReset={onReset} /></div>
}

function DetectiveActivity({ answer, checked, onChange, onCheck, onReset }: { answer: string; checked: boolean; onChange: (value: string) => void; onCheck: () => void; onReset: () => void }) {
  return <div className="activity-card detective-card"><ActivityHeader number="٥" title="المحقق اللغوي">اقرأ الجملة، ثم حدّد نوع الفعل وفسّر اختيارك.</ActivityHeader><div className="detective-sentence"><bdi>تكتبُ سارةُ واجبها الآن.</bdi><p>ثم قالت لها أمها: <bdi>اكتبْ العنوانَ.</bdi></p></div><label className="long-answer"><span>ما نوع «تكتبُ» وما نوع «اكتبْ»؟ ولماذا؟</span><textarea rows={4} disabled={checked} value={answer} onChange={(event) => onChange(event.target.value)} placeholder="اكتب ملاحظتك كمحقق لغوي" /></label><ActivityActions checked={checked} disabled={!answer.trim()} onCheck={onCheck} onReset={onReset} />{checked && <p className="activity-feedback activity-feedback--good">الإجابة النموذجية: تكتبُ فعل مضارع يخبر عن فعل يحدث الآن، أما اكتبْ فهو فعل أمر يطلب فعلًا.</p>}</div>
}

function OfficialTest({ answers, checked, onChange, onCheck }: { answers: Record<number, string>; checked: boolean; onChange: (number: number, value: string) => void; onCheck: () => void }) {
  const allAnswered = officialQuestions.every((question) => answers[question.number]?.trim())
  const score = officialQuestions.filter((question) => question.type === 'choice' && answers[question.number] === question.answer).length
  return <div className="official-test" data-testid="lesson4-official-test" aria-label="اختبار نهاية الدرس الرابع الرسمي"><div className="official-test__intro"><strong>اختبار نهاية الدرس</strong><span>٢٠ سؤالًا</span><p>أجب عن الأسئلة العشرين كلها. بعد التحقق تظهر التغذية الراجعة، والأسئلة المفتوحة تراجع معلمك.</p></div><div className="official-test__groups"><h3>أولًا: اختر الإجابة الصحيحة</h3>{officialQuestions.slice(0, 8).map((question) => <OfficialQuestionView key={question.number} question={question} value={answers[question.number] || ''} checked={checked} onChange={onChange} />)}<h3>ثانيًا: صح أو خطأ</h3>{officialQuestions.slice(8, 14).map((question) => <OfficialQuestionView key={question.number} question={question} value={answers[question.number] || ''} checked={checked} onChange={onChange} />)}<h3>ثالثًا: التصنيف والاستخراج</h3>{officialQuestions.slice(14, 17).map((question) => <OfficialQuestionView key={question.number} question={question} value={answers[question.number] || ''} checked={checked} onChange={onChange} />)}<h3>رابعًا: التحويل</h3>{officialQuestions.slice(17, 19).map((question) => <OfficialQuestionView key={question.number} question={question} value={answers[question.number] || ''} checked={checked} onChange={onChange} />)}<h3>خامسًا: سؤال التفكير</h3>{officialQuestions.slice(19).map((question) => <OfficialQuestionView key={question.number} question={question} value={answers[question.number] || ''} checked={checked} onChange={onChange} />)}</div><div className="official-test__actions"><button type="button" className="button button--primary" disabled={!allAnswered || checked} onClick={onCheck}>تحقق من الاختبار</button>{!allAnswered && !checked && <p>أجب عن الأسئلة العشرين كلها أولًا.</p>}{checked && <p className="official-test__result" role="status">الإجابات الموضوعية الصحيحة: <bdi>{score} / 14</bdi>. راجع الإجابات المفتوحة مع المعلم.</p>}</div></div>
}

function OfficialQuestionView({ question, value, checked, onChange }: { question: OfficialQuestion; value: string; checked: boolean; onChange: (number: number, value: string) => void }) {
  const isCorrect = question.type === 'choice' && value === question.answer
  return <fieldset className="official-question" data-question-number={question.number} disabled={checked}><legend><span className="question-number">السؤال <bdi>{question.number}</bdi></span> {question.prompt}</legend>{question.type === 'choice' ? <div className="official-options">{question.options?.map((option) => <label key={option}><input type="radio" name={`lesson4-question-${question.number}`} value={option} checked={value === option} onChange={() => onChange(question.number, option)} /><span>{option}</span></label>)}</div> : <textarea rows={question.rows || 3} value={value} onChange={(event) => onChange(question.number, event.target.value)} aria-label={`إجابة السؤال ${question.number}`} placeholder="اكتب إجابتك هنا" />}{checked && <div className={isCorrect ? 'question-feedback question-feedback--good' : 'question-feedback'}><strong>{question.type === 'choice' ? (isCorrect ? 'إجابة صحيحة.' : 'إجابة غير صحيحة.') : 'تم تسجيل إجابتك.'}</strong><p>الإجابة النموذجية: {question.answer}</p><p>{question.explanation}</p></div>}</fieldset>
}

function TeacherMaterial() {
  return <div className="teacher-material"><h3>الإجابات النموذجية للنشاط التطبيقي والأنشطة</h3><ol className="source-list"><li>النشاط الأول: كتبَ ماضٍ، يقرأُ مضارع، اجلسْ أمر، لعبَ ماضٍ، تدرسُ مضارع، افتحْ أمر.</li><li>النشاط الثاني: كتبَ ماضٍ، يكتبُ مضارع، اكتبْ أمر، سيسافرُ مضارع، يكتبْ مضارع، يذهبَ مضارع.</li><li>النشاط الثالث: كتبَ، يكتبُ، اكتبْ، يذهبُ.</li><li>النشاط الرابع: يكتبُ الطالبُ الدرسَ، يقرأُ سامرٌ الكتابَ، اكتبْ الدرسَ، افتحْ البابَ.</li><li>النشاط الخامس: تكتبُ فعل مضارع؛ لأنه يخبر عن فعل يحدث الآن. اكتبْ فعل أمر؛ لأنه يطلب من المخاطب فعلًا.</li></ol><h3>الإجابات النموذجية لاختبار نهاية الدرس</h3><p>١ ب، ٢ أ، ٣ ب، ٤ ب، ٥ ج، ٦ ج، ٧ ج، ٨ أ.</p><p>٩ صح، ١٠ صح، ١١ خطأ، ١٢ خطأ، ١٣ صح، ١٤ خطأ.</p><p>١٥: كتبَ ماضٍ، يقرأُ مضارع، اذهبْ أمر. ١٦: قرأَ ماضٍ. ١٧: يكتبُ مضارع. ١٨: يلعبُ الطفلُ بالكرةِ. ١٩: اقرأْ الكتابَ. ٢٠: تكتبُ مضارع وكتبتْ ماضٍ؛ يكتبُ خبر واكتبْ طلب.</p><h3>الأخطاء المتوقعة عند الطالب وملاحظات التصحيح للمعلم</h3><ul className="source-list"><li><strong>الخطأ الأول:</strong> اعتبار كل كلمة تبدأ بـ أ، ن، ي، ت فعلًا مضارعًا. صحح بمقارنة أحمدُ وياسرُ مع تكتبُ وتدرسُ.</li><li><strong>الخطأ الثاني:</strong> الخلط بين يكتبُ واكتبْ. اسأل: هل الكلمة تخبر عن فعل أم تطلب فعلًا؟</li><li><strong>الخطأ الثالث:</strong> اعتبار المضارع مستقبلًا دائمًا. وضّح أن السياق قد يجعله للحاضر أو المستقبل.</li><li><strong>الخطأ الرابع:</strong> اعتبار لم يكتبْ فعلًا ماضيًا. النفي لا يغيّر نوع الفعل؛ يكتبْ مضارع.</li><li><strong>الخطأ الخامس:</strong> الحكم من التاء وحدها. تكتبُ مضارع، وكتبتْ ماضٍ؛ ننظر إلى مكان التاء والدلالة.</li></ul><p className="source-note source-note--important">توجيه التصحيح: اطلب من الطالب أن يذكر الدليل: حدث انتهى، يحدث أو سيحدث، أم طلب القيام بالفعل. لا تطلب في هذا الدرس إعراب الفعل بعد «لم»؛ فقد أجّل المصدر هذا التفصيل إلى دروس لاحقة.</p><h3>تدريب علاجي سريع للطالب الضعيف</h3><p>اقرأ الفعل واسأل السؤال المناسب، واجعل الطالب يملأ الجدول بنفسه.</p><div className="table-scroll"><table className="remedial-table"><thead><tr><th>الفعل</th><th>السؤال</th><th>النوع</th><th>الدليل</th></tr></thead><tbody><tr><td><bdi>كتبَ</bdi></td><td>هل انتهى؟</td><td>ماضٍ</td><td>حدث انتهى</td></tr><tr><td><bdi>يكتبُ</bdi></td><td>هل يحدث أو سيحدث؟</td><td>مضارع</td><td>يخبر عن فعل</td></tr><tr><td><bdi>اكتبْ</bdi></td><td>هل يطلب؟</td><td>أمر</td><td>طلب فعل</td></tr><tr><td><bdi>لم يكتبْ</bdi></td><td>ما نوع الفعل الأصلي؟</td><td>مضارع</td><td>النفي لا يغيّر النوع</td></tr></tbody></table></div><p>التوصية العلاجية: أعِد تدريب الطالب على أسئلة «هل انتهى؟ هل يحدث أو سيحدث؟ هل يطلب؟» قبل الانتقال إلى الدرس الخامس.</p><h3>معيار إتقان الدرس</h3><ul className="check-list"><li>شرح أن الفعل يدل على حدث مرتبط بزمن.</li><li>تمييز الماضي والمضارع والأمر في جمل بسيطة.</li><li>ذكر أحرف المضارعة: أ، ن، ي، ت، مع فهم أن الحرف وحده لا يكفي.</li><li>التمييز بين أحمدُ وياسرُ وبين تكتبُ وتدرسُ.</li><li>التمييز بين يكتبُ واكتبْ.</li><li>فهم أن النفي لا يغيّر نوع الفعل.</li><li>تحويل الماضي إلى المضارع والمضارع إلى الأمر.</li></ul><p className="mastery-note"><strong>مستوى الإتقان المقترح: 15/20 فأكثر.</strong> إذا حصل الطالب على أقل من 15/20، يوصى بإعادة الشرح والتدريب العلاجي قبل الانتقال.</p></div>
}

function Summary() {
  return <><EducationalCard title="ملخص الدرس للحفظ" eyebrow="الخلاصة"><div className="summary-definition-list"><p><strong>الفعل:</strong> يدل على حدث مرتبط بزمن.</p><p><strong>الماضي:</strong> حدث انتهى.</p><p><strong>المضارع:</strong> يحدث الآن أو قد يحدث لاحقًا.</p><p><strong>الأمر:</strong> طلب القيام بالفعل.</p></div><div className="central-tense-card"><div><bdi>كتبَ</bdi><span>حدث انتهى</span><strong>ماضٍ</strong></div><div><bdi>يكتبُ</bdi><span>يخبر عن فعل</span><strong>مضارع</strong></div><div><bdi>اكتبْ</bdi><span>يطلب فعلًا</span><strong>أمر</strong></div></div><p>أحرف المضارعة: <strong>أ – ن – ي – ت</strong>، ونتذكرها بكلمة: <strong>أنيت</strong>. لكن ليست كل كلمة تبدأ بها فعلًا مضارعًا.</p><p>النفي لا يغيّر نوع الفعل: <bdi>لم يكتبْ</bdi> و<bdi>لن يذهبَ</bdi> فعلان مضارعان.</p></EducationalCard><blockquote className="grammar-quote golden-rule"><p className="source-kicker">القاعدة الذهبية:</p><p><strong>اسأل عن معنى الفعل: هل حدث وانتهى فهو ماضٍ؟ هل يحدث الآن أو قد يحدث لاحقًا فهو مضارع؟ هل يطلب القيام بالفعل فهو أمر.</strong></p></blockquote></>
}

function normaliseArabic(value: string) {
  return value.replace(/[ًٌٍَُِّْـ]/g, '').replace(/[إأآ]/g, 'ا').replace(/\s+/g, ' ').trim()
}

