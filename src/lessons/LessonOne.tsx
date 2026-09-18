import { useState } from 'react'
import { EducationalCard } from '../shared/components/EducationalCard'
import { LessonSection } from '../shared/components/LessonSection'
import { DirectionText } from '../shared/direction/DirectionText'
import { TeacherSpace } from '../shared/teacher/TeacherSpace'

interface LessonOneProps {
  onProgressChange?: (value: number) => void
}

type ActivityId = 'signs' | 'verbs' | 'detective' | 'challenge' | 'test'

type OfficialQuestion = {
  number: number
  prompt: string
  type: 'choice' | 'open'
  options?: string[]
  answer: string
  correction?: string
}

const nounTypes = [
  ['إنسان', 'طالب، معلم، أم، طبيب'],
  ['حيوان', 'أسد، قطة، حصان'],
  ['نبات', 'شجرة، وردة، قمح'],
  ['جماد', 'كتاب، قلم، كرسي'],
  ['مكان', 'مدرسة، بيت، سوريا'],
  ['زمان', 'صباح، مساء، يوم'],
  ['صفة', 'جميل، ذكي، طويل'],
]

const nounSigns = [
  { title: 'دخول (الـ) التعريف', short: 'أل', example: 'الكتاب', detail: 'كتاب ← الكتاب.' },
  { title: 'التنوين', short: 'ــٌ', example: 'كتابٌ', detail: 'كتابٌ، كتابًا، كتابٍ.' },
  { title: 'دخول حرف الجر', short: 'في', example: 'في البيتِ', detail: 'في المدرسةِ، من البيتِ، إلى السوقِ.' },
  { title: 'النداء', short: 'يا', example: 'يا طالبُ!', detail: 'يا محمدُ! يا معلمةُ! يا صديقي!' },
]

const prepositionExamples = [
  ['في', 'في المدرسةِ.'],
  ['من', 'من البيتِ.'],
  ['إلى', 'إلى السوقِ.'],
  ['على', 'على الطاولةِ.'],
  ['عن', 'عن المعلمِ.'],
]

const particleExamples = [
  ['في', 'الكتاب في الحقيبة'],
  ['من', 'عاد الطالب من المدرسة'],
  ['إلى', 'ذهب أبي إلى العمل'],
  ['على', 'القلم على الطاولة'],
  ['هل', 'هل درستَ؟'],
  ['و', 'حضر سامر ومحمد'],
  ['ثم', 'أكل ثم ذهب'],
]

const officialQuestions: OfficialQuestion[] = [
  {
    number: 1,
    type: 'choice',
    prompt: 'الكلمة التي تدل على إنسان هي:',
    options: ['أ) يكتب', 'ب) معلم', 'ج) في', 'د) اذهب'],
    answer: 'ب) معلم',
  },
  {
    number: 2,
    type: 'choice',
    prompt: 'أي الكلمات التالية فعل ماضٍ؟',
    options: ['أ) يدرس', 'ب) ادرس', 'ج) درسَ', 'د) مدرسة'],
    answer: 'ج) درسَ',
  },
  {
    number: 3,
    type: 'choice',
    prompt: 'أي الكلمات التالية فعل مضارع؟',
    options: ['أ) كتبَ', 'ب) يكتبُ', 'ج) اكتبْ', 'د) كتاب'],
    answer: 'ب) يكتبُ',
  },
  {
    number: 4,
    type: 'choice',
    prompt: 'أي الكلمات التالية حرف؟',
    options: ['أ) قلم', 'ب) يقرأ', 'ج) إلى', 'د) طالب'],
    answer: 'ج) إلى',
  },
  {
    number: 5,
    type: 'choice',
    prompt: 'الكلمة التي تقبل دخول "الـ" عليها هي:',
    options: ['أ) ذهب', 'ب) كتاب', 'ج) في', 'د) اكتب'],
    answer: 'ب) كتاب',
  },
  {
    number: 6,
    type: 'choice',
    prompt: 'كلمة "اجلسْ" هي:',
    options: ['أ) اسم', 'ب) حرف', 'ج) فعل ماضٍ', 'د) فعل أمر'],
    answer: 'د) فعل أمر',
  },
  {
    number: 7,
    type: 'choice',
    prompt: 'الكلمة "مدرسة" اسم.',
    options: ['صح', 'خطأ'],
    answer: 'صح',
  },
  {
    number: 8,
    type: 'choice',
    prompt: 'الفعل الماضي يدل على حدث يحدث الآن.',
    options: ['صح', 'خطأ'],
    answer: 'خطأ',
    correction: 'الفعل الماضي يدل على حدث حصل وانتهى.',
  },
  {
    number: 9,
    type: 'choice',
    prompt: 'الفعل المضارع يبدأ غالبًا بأحد أحرف "أ، ن، ي، ت".',
    options: ['صح', 'خطأ'],
    answer: 'صح',
  },
  {
    number: 10,
    type: 'choice',
    prompt: 'الحرف يمكن أن يعطي معنى كاملًا وحده دائمًا.',
    options: ['صح', 'خطأ'],
    answer: 'خطأ',
    correction: 'الحرف لا يظهر معناه كاملًا غالبًا إلا مع غيره.',
  },
  {
    number: 11,
    type: 'open',
    prompt: 'حدد نوع الكلمات التالية:\n1. بيت.\n2. يذهب.\n3. من.\n4. لعب.\n5. اقرأ.\n6. جميل.',
    answer: 'بيت: اسم؛ يذهب: فعل مضارع؛ من: حرف؛ لعب: فعل ماضٍ؛ اقرأ: فعل أمر؛ جميل: اسم.',
  },
  {
    number: 12,
    type: 'open',
    prompt: 'استخرج الاسم والفعل والحرف من الجملة التالية:\nيقرأُ الطالبُ الكتابَ في المنزلِ.',
    answer: 'يقرأ: فعل مضارع؛ الطالب: اسم؛ الكتاب: اسم؛ في: حرف جر؛ المنزل: اسم.',
  },
  {
    number: 13,
    type: 'open',
    prompt: 'حدد نوع الفعل في الجمل التالية:\n1. كتبَ سامرٌ الدرسَ.\n2. يكتبُ سامرٌ الدرسَ.\n3. اكتبْ يا سامرُ الدرسَ.',
    answer: 'كتبَ: فعل ماضٍ؛ يكتبُ: فعل مضارع؛ اكتبْ: فعل أمر.',
  },
  {
    number: 14,
    type: 'open',
    prompt: 'ضع الكلمات التالية في الجدول المناسب:\nشجرة – ذهب – على – يركض – معلم – اكتب – من – كتاب – يدرس.\n\nالاسم\n\nالفعل\n\nالحرف',
    answer: 'الاسم: شجرة، معلم، كتاب. الفعل: ذهب، يركض، اكتب، يدرس. الحرف: على، من.',
  },
  {
    number: 15,
    type: 'open',
    prompt: 'أكمل:\nأقسام الكلام في اللغة العربية هي:\n1. ..............\n2. ..............\n3. ..............',
    answer: '1. الاسم. 2. الفعل. 3. الحرف.',
  },
  {
    number: 16,
    type: 'open',
    prompt: 'اذكر علامتين من علامات الاسم.',
    answer: 'أي علامتين من التالي: دخول أل التعريف، قبول التنوين، دخول حرف الجر، قبول النداء.',
  },
  {
    number: 17,
    type: 'open',
    prompt: 'اذكر أنواع الفعل الثلاثة.',
    answer: 'الفعل الماضي، والفعل المضارع، وفعل الأمر.',
  },
  {
    number: 18,
    type: 'open',
    prompt: 'لماذا تعتبر كلمة "في" حرفًا؟',
    answer: 'لأن كلمة "في" لا يظهر معناها كاملًا إلا مع كلمة أخرى، مثل: في البيت.',
  },
  {
    number: 19,
    type: 'open',
    prompt: 'حوّل الفعل الماضي إلى فعل مضارع:\nكتبَ ← ............\n\nلعبَ ← ............\n\nذهبَ ← ............',
    answer: 'كتبَ ← يكتبُ. لعبَ ← يلعبُ. ذهبَ ← يذهبُ.',
  },
  {
    number: 20,
    type: 'open',
    prompt: 'حوّل الأفعال التالية إلى فعل أمر:\nيكتبُ ← ............\n\nيقرأُ ← ............\n\nيجلسُ ← ............',
    answer: 'يكتبُ ← اكتبْ. يقرأُ ← اقرأْ. يجلسُ ← اجلسْ.',
  },
]

const detectiveWords = [
  ['كتاب', 'اسم'],
  ['يركض', 'فعل'],
  ['في', 'حرف'],
  ['شجرة', 'اسم'],
  ['اكتب', 'فعل'],
  ['إلى', 'حرف'],
  ['مدرسة', 'اسم'],
  ['لعب', 'فعل'],
  ['يقرأ', 'فعل'],
  ['يا', 'حرف'],
]

function QuestionText({ text }: { text: string }) {
  return (
    <span className="question-text">
      {text.split('\n').map((line, index) => (
        <span className="question-text__line" key={`${line}-${index}`}>
          {line || '\u00a0'}
        </span>
      ))}
    </span>
  )
}

export function LessonOne({ onProgressChange }: LessonOneProps) {
  const [completedActivities, setCompletedActivities] = useState<ActivityId[]>([])

  function completeActivity(activity: ActivityId) {
    if (completedActivities.includes(activity)) return
    const next = [...completedActivities, activity]
    setCompletedActivities(next)
    onProgressChange?.(Math.round((next.length / 5) * 100))
  }

  return (
    <div className="lesson-one" id="lesson-content">
      <div className="lesson-contact lesson-contact--top" id="contact-top">
        <WhatsAppContact />
      </div>

      <LessonSection
        id="lesson-overview"
        title="الهدف من الدرس"
        description="الاسم والفعل والحرف هي أساس معظم دروس النحو القادمة."
      >
        <div className="source-lead-grid">
          <EducationalCard title="في نهاية هذا الدرس يجب أن يستطيع الطالب" eyebrow="أهداف الدرس" tone="accent">
            <ul className="source-list source-list--checks">
              <li>معرفة معنى الكلام في اللغة العربية.</li>
              <li>التمييز بين الاسم والفعل والحرف.</li>
              <li>التعرف إلى علامات الاسم.</li>
              <li>التعرف إلى أنواع الفعل.</li>
              <li>تحديد نوع كل كلمة في الجملة.</li>
            </ul>
          </EducationalCard>
          <EducationalCard title="أقسام الكلام" eyebrow="عنوان الدرس">
            <div className="parts-triad" aria-label="أقسام الكلام الثلاثة">
              <span>اسم</span><span aria-hidden="true">→</span><span>فعل</span><span aria-hidden="true">→</span><span>حرف</span>
            </div>
            <p>احفظ هذه الأقسام الثلاثة جيدًا، فهي أساس معظم دروس النحو القادمة.</p>
          </EducationalCard>
        </div>
      </LessonSection>

      <LessonSection
        id="speech"
        title="أولاً: ما هو الكلام؟"
        description="الكلام هو مجموعة كلمات مرتبة تعطي معنى مفيدًا."
      >
        <div className="definition-panel">
          <p className="source-kicker">تعريف الكلام</p>
          <p>الكلام هو مجموعة كلمات مرتبة تعطي معنى مفيدًا.</p>
        </div>
        <div className="example-grid">
          <ExampleBox label="مثال" text="ذهبَ الطالبُ إلى المدرسةِ." good />
          <ExampleBox label="مثال غير مكتمل" text="في المدرسةِ..." />
        </div>
        <div className="explanation-grid">
          <p>هذه جملة مفيدة؛ لأنها أعطتنا معنى كاملًا.</p>
          <p>فهذه العبارة غير مكتملة المعنى؛ لأننا ننتظر معرفة ماذا حدث في المدرسة.</p>
        </div>
        <RuleBox title="قاعدة مهمة:">الكلام المفيد يتكون من كلمات مرتبة تعطي معنى كاملًا.</RuleBox>
      </LessonSection>

      <LessonSection
        id="parts"
        title="ثانيًا: أقسام الكلام"
        description="الكلمة في اللغة العربية ثلاثة أقسام رئيسية."
      >
        <div className="parts-table" role="list" aria-label="أقسام الكلام">
          {['الاسم', 'الفعل', 'الحرف'].map((part, index) => (
            <div className="part-card" role="listitem" key={part}>
              <bdi>{index + 1}</bdi>
              <strong>{part}</strong>
            </div>
          ))}
        </div>
        <p className="source-note">ويجب على الطالب أن يحفظ هذه الأقسام الثلاثة جيدًا، لأنها أساس معظم دروس النحو القادمة.</p>
      </LessonSection>

      <LessonSection
        id="noun"
        title="القسم الأول: الاسم"
        description="الاسم كلمة تدل على شيء غير مرتبط بزمن معين."
      >
        <Subheading>ما هو الاسم؟</Subheading>
        <p>الاسم هو كلمة تدل على:</p>
        <p className="source-note"><bdi>إنسان، حيوان، نبات، جماد، مكان، زمان، صفة</bdi></p>
        <ul className="inline-pills">
          {['إنسان', 'حيوان', 'نبات', 'جماد', 'مكان', 'زمان', 'صفة'].map((item) => <li key={item}>{item}</li>)}
        </ul>
        <p className="source-note">شيء غير مرتبط بزمن معين.</p>

        <Subheading>أمثلة أنواع الاسم</Subheading>
        <DataTable caption="جدول أنواع الاسم والأمثلة" headers={['نوع الاسم', 'أمثلة']} rows={nounTypes} />

        <Subheading>كيف أعرف أن الكلمة اسم؟</Subheading>
        <p>هناك علامات تساعدنا على معرفة الاسم.</p>
        <div className="sign-grid">
          {nounSigns.map((sign, index) => (
            <NounSignCard sign={sign} index={index} key={sign.title} onComplete={() => completeActivity('signs')} />
          ))}
        </div>

        <div className="source-subsection" id="al-definition">
          <Subheading>العلامة الأولى: دخول (الـ) التعريف</Subheading>
          <p>إذا قبلت الكلمة دخول "الـ" عليها، فهي غالبًا اسم.</p>
          <ArrowExamples rows={[['كتاب', 'الكتاب'], ['مدرسة', 'المدرسة'], ['طالب', 'الطالب'], ['شجرة', 'الشجرة']]} />
          <p className="source-note">إذن هذه الكلمات أسماء.</p>
          <div className="attention-box">
            <strong>انتبه:</strong>
            <p>لا يمكننا القول:</p>
            <p className="bidi-line"><DirectionText direction="rtl">الـ يكتب</DirectionText> — <DirectionText direction="rtl">الـ ذهب</DirectionText></p>
            <p>لأن الفعل لا يقبل "الـ".</p>
          </div>
        </div>

        <div className="source-subsection">
          <Subheading>العلامة الثانية: التنوين</Subheading>
          <p>التنوين هو نون ساكنة تلفظ في آخر الاسم ولا تكتب حرفًا.</p>
          <div className="tanween-grid" aria-label="أنواع التنوين">
            <span>تنوين الضم: <bdi>ــٌ</bdi></span>
            <span>تنوين الفتح: <bdi>ــً</bdi></span>
            <span>تنوين الكسر: <bdi>ــٍ</bdi></span>
          </div>
          <p className="source-kicker">أمثلة</p>
          <div className="example-chips"><bdi>كتابٌ</bdi><bdi>كتابًا</bdi><bdi>كتابٍ</bdi><bdi>طالبٌ</bdi><bdi>طالبًا</bdi><bdi>طالبٍ</bdi></div>
          <RuleBox>إذا قبلت الكلمة التنوين فهي اسم.</RuleBox>
        </div>

        <div className="source-subsection">
          <Subheading>العلامة الثالثة: دخول حرف الجر</Subheading>
          <p>الاسم يقبل دخول حروف الجر عليه.</p>
          <ArrowExamples rows={prepositionExamples} />
          <p>الكلمات: المدرسة، البيت، السوق، الطاولة، المعلم كلها أسماء.</p>
          <p className="source-kicker">أهم حروف الجر</p>
          <div className="phrase-ribbon" dir="rtl"><bdi>من – إلى – عن – على – في – الباء – الكاف – اللام</bdi></div>
        </div>

        <div className="source-subsection">
          <Subheading>العلامة الرابعة: النداء</Subheading>
          <p>الاسم يمكن أن يأتي بعد أداة النداء.</p>
          <div className="example-chips"><bdi>يا محمدُ!</bdi><bdi>يا طالبُ!</bdi><bdi>يا معلمةُ!</bdi><bdi>يا صديقي!</bdi></div>
          <p>الكلمات محمد، طالب، معلمة، صديقي أسماء.</p>
        </div>

        <Subheading>خلاصة علامات الاسم</Subheading>
        <DataTable
          caption="خلاصة علامات الاسم"
          headers={['العلامة', 'مثال']}
          rows={[
            ['دخول أل التعريف', 'الكتاب'],
            ['قبول التنوين', 'كتابٌ'],
            ['دخول حرف الجر', 'في البيت'],
            ['دخول النداء', 'يا طالب'],
          ]}
        />
        <div className="source-note source-note--important"><strong>ملاحظة مهمة للطالب:</strong> ليس من الضروري أن تجتمع كل العلامات في الكلمة. إذا ظهرت علامة واحدة واضحة، يمكننا غالبًا معرفة أن الكلمة اسم.</div>
      </LessonSection>

      <LessonSection
        id="verb"
        title="القسم الثاني: الفعل"
        description="الفعل كلمة تدل على حدث مرتبط بزمن."
      >
        <Subheading>ما هو الفعل؟</Subheading>
        <p>الفعل هو كلمة تدل على حدث مرتبط بزمن.</p>
        <p>أي أن الفعل يخبرنا أن شيئًا حدث أو يحدث أو سيحدث أو نطلب حدوثه.</p>
        <div className="example-chips"><bdi>كتبَ</bdi><bdi>يكتبُ</bdi><bdi>اكتبْ</bdi><bdi>ذهبَ</bdi><bdi>يذهبُ</bdi><bdi>اجلسْ</bdi></div>

        <Subheading>أنواع الفعل</Subheading>
        <p>الفعل ثلاثة أنواع:</p>
        <ol className="source-list source-list--arabic-numbers"><li>الفعل الماضي.</li><li>الفعل المضارع.</li><li>فعل الأمر.</li></ol>

        <div className="source-subsection" id="past">
          <Subheading>أولاً: الفعل الماضي</Subheading>
          <h4>تعريفه</h4>
          <p>الفعل الماضي هو فعل يدل على حدث حصل وانتهى في الزمن الماضي.</p>
          <p className="source-kicker">أمثلة</p>
          <ul className="quoted-list"><li>كتبَ الطالبُ الدرسَ.</li><li>ذهبَ أبي إلى العمل.</li><li>لعبَ الطفلُ بالكرة.</li><li>نجحتْ الطالبةُ في الامتحان.</li></ul>
          <p>الأفعال: كتب – ذهب – لعب – نجحت كلها أفعال ماضية.</p>
          <Subheading>كيف أعرف الفعل الماضي؟</Subheading>
          <p>غالبًا يدل على شيء حدث وانتهى.</p>
          <p className="source-kicker">كلمات تساعد</p>
          <div className="example-chips"><bdi>أمس</bdi><bdi>سابقًا</bdi><bdi>البارحة</bdi><bdi>في الماضي</bdi></div>
          <ExampleBox label="مثال" text="أمسِ سافرَ والدي." good />
          <p>الفعل <bdi>سافرَ</bdi> ماضٍ لأنه حدث وانتهى.</p>
        </div>

        <div className="source-subsection" id="present">
          <Subheading>ثانيًا: الفعل المضارع</Subheading>
          <h4>تعريفه</h4>
          <p>الفعل المضارع هو فعل يدل على حدث يحدث الآن أو سيحدث في المستقبل.</p>
          <p className="source-kicker">أمثلة</p>
          <ul className="quoted-list"><li>يكتبُ الطالبُ الدرسَ.</li><li>يذهبُ أحمدُ إلى المدرسة.</li><li>تلعبُ البنتُ بالكرة.</li><li>ندرسُ اللغة العربية.</li></ul>
          <p>الأفعال: يكتب – يذهب – تلعب – ندرس كلها أفعال مضارعة.</p>
          <Subheading>علامات الفعل المضارع</Subheading>
          <p>من أهم علاماته أنه يبدأ غالبًا بأحد أحرف المضارعة الأربعة:</p>
          <div className="ayn-banner" dir="ltr" aria-label="أحرف المضارعة: أ ن ي ت"><bdi>أ – ن – ي – ت</bdi></div>
          <p>ويمكن حفظها بكلمة:</p>
          <div className="word-memory"><bdi>أنيت</bdi></div>
          <div className="ayn-interaction"><AynActivity onComplete={() => completeActivity('verbs')} /></div>
          <p className="source-kicker">أمثلة أحرف المضارعة</p>
          <div className="ayn-example-list" dir="ltr" aria-label="أمثلة أحرف المضارعة الأربعة"><bdi>أ = أكتب</bdi><bdi>ن = نكتب</bdi><bdi>ي = يكتب</bdi><bdi>ت = تكتب</bdi></div>
          <p className="source-kicker">أمثلة</p>
          <DataTable caption="حرف المضارعة ومثاله" headers={['حرف المضارعة', 'مثال']} rows={[['أ', 'أدرس'], ['ن', 'نلعب'], ['ي', 'يقرأ'], ['ت', 'تكتب']]} />
          <div className="source-note source-note--important"><strong>ملاحظة مهمة:</strong> ليس كل كلمة تبدأ بهذه الأحرف فعلًا مضارعًا، لكن معظم الأفعال المضارعة تبدأ بأحدها.</div>
        </div>

        <div className="source-subsection" id="imperative">
          <Subheading>ثالثًا: فعل الأمر</Subheading>
          <h4>تعريفه</h4>
          <p>فعل الأمر هو فعل نطلب به من شخص أن يقوم بعمل معين.</p>
          <p className="source-kicker">أمثلة</p>
          <ul className="quoted-list"><li>اكتبْ واجبك.</li><li>اقرأْ الدرس.</li><li>اجلسْ في مكانك.</li><li>افتحْ الكتاب.</li><li>اسمعْ المعلم.</li></ul>
          <p>الأفعال: اكتب – اقرأ – اجلس – افتح – اسمع كلها أفعال أمر.</p>
          <Subheading>كيف أعرف فعل الأمر؟</Subheading>
          <p>إذا كانت الكلمة تطلب من شخص القيام بشيء، فهي غالبًا فعل أمر.</p>
          <ExampleBox label="مثال" text="اكتبْ" explanation="أي أننا نطلب من الطالب الكتابة." />
          <ExampleBox label="مثال" text="اجلسْ" explanation="أي أننا نطلب منه الجلوس." />
        </div>

        <Subheading>مقارنة بين أنواع الفعل</Subheading>
        <DataTable caption="مقارنة بين الماضي والمضارع والأمر" headers={['نوع الفعل', 'الزمن', 'مثال']} rows={[['الماضي', 'حدث وانتهى', 'كتبَ'], ['المضارع', 'يحدث الآن أو لاحقًا', 'يكتبُ'], ['الأمر', 'طلب القيام بعمل', 'اكتبْ']]} />
        <VerbClassificationActivity onComplete={() => completeActivity('verbs')} />
      </LessonSection>

      <LessonSection
        id="particle"
        title="القسم الثالث: الحرف"
        description="الحرف كلمة لا يظهر معناها كاملًا إلا مع غيرها."
      >
        <Subheading>ما هو الحرف؟</Subheading>
        <p>الحرف هو كلمة لا يظهر معناها كاملًا إلا مع غيرها.</p>
        <p>أي أنه يحتاج إلى كلمة أخرى ليعطي معنى واضحًا.</p>
        <div className="example-chips"><bdi>في</bdi><bdi>من</bdi><bdi>إلى</bdi><bdi>على</bdi><bdi>هل</bdi><bdi>لم</bdi><bdi>لن</bdi><bdi>يا</bdi><bdi>و</bdi><bdi>ثم</bdi></div>
        <Subheading>أمثلة توضيحية</Subheading>
        <p>كلمة <bdi>في</bdi> وحدها لا تعطي معنى كاملًا.</p>
        <ArrowExamples rows={[['في', 'في البيت.'], ['من', 'من المدرسة.'], ['إلى', 'إلى السوق.']]} />
        <p>إذن الحروف تحتاج غالبًا إلى كلمات أخرى لتكتمل الفكرة.</p>
        <Subheading>أمثلة على الحروف</Subheading>
        <DataTable caption="أمثلة على الحروف" headers={['الحرف', 'مثال في جملة']} rows={particleExamples} />
      </LessonSection>

      <LessonSection
        id="classification"
        title="كيف أميز بين أقسام الكلام؟"
        description="استخدم هذه الأسئلة الثلاثة عندما يعطيك المعلم كلمة."
      >
        <div className="decision-flow">
          <DecisionCard number="١" question="هل تدل على إنسان أو حيوان أو نبات أو جماد أو مكان أو صفة؟" result="إذا نعم → اسم." />
          <DecisionCard number="٢" question="هل تدل على حدث مرتبط بزمن؟" result="إذا نعم → فعل." />
          <DecisionCard number="٣" question="هل هي كلمة تربط بين الكلمات أو تحتاج إلى غيرها لتكتمل؟" result="إذا نعم → حرف." />
        </div>

        <Subheading>أمثلة تطبيقية محلولة</Subheading>
        <details className="worked-example" open>
          <summary>المثال الأول: كتاب – ذهب – في – مدرسة – يقرأ – إلى</summary>
          <p>حدد نوع الكلمات التالية:</p>
          <p className="phrase-ribbon"><bdi>كتاب – ذهب – في – مدرسة – يقرأ – إلى</bdi></p>
          <DataTable caption="حل المثال الأول" headers={['الكلمة', 'نوعها', 'السبب']} rows={[
            ['كتاب', 'اسم', 'يدل على شيء'],
            ['ذهب', 'فعل ماضٍ', 'حدث وانتهى'],
            ['في', 'حرف', 'لا يكتمل معناه وحده'],
            ['مدرسة', 'اسم', 'تدل على مكان'],
            ['يقرأ', 'فعل مضارع', 'يبدأ بحرف مضارعة ويدل على حدث'],
            ['إلى', 'حرف', 'حرف جر'],
          ]} />
        </details>
        <details className="worked-example">
          <summary>المثال الثاني: ذهبَ الطالبُ إلى المدرسةِ.</summary>
          <p>استخرج الاسم والفعل والحرف من الجملة:</p>
          <ul className="solution-list"><li>ذهبَ: فعل ماضٍ.</li><li>الطالبُ: اسم.</li><li>إلى: حرف جر.</li><li>المدرسةِ: اسم.</li></ul>
        </details>
        <details className="worked-example">
          <summary>المثال الثالث: لعبَ. يكتبُ. اذهبْ.</summary>
          <p>حدد نوع الفعل:</p>
          <ol className="solution-list"><li>لعبَ ← فعل ماضٍ.</li><li>يكتبُ ← فعل مضارع.</li><li>اذهبْ ← فعل أمر.</li></ol>
        </details>
      </LessonSection>

      <LessonSection
        id="activities"
        title="نشاط صفّي ممتع"
        description="طبّق ما تعلّمت في لعبة المحقق اللغوي وتحدي 5 ثوانٍ."
      >
        <GrammarDetective onComplete={() => completeActivity('detective')} />
        <FiveSecondChallenge onComplete={() => completeActivity('challenge')} />
      </LessonSection>

      <LessonSection
        id="summary"
        title="ملخص الدرس للحفظ"
        description="أقسام الكلام ثلاثة: اسم – فعل – حرف."
      >
        <div className="summary-grid">
          <EducationalCard title="الاسم" eyebrow="علاماته">
            <p>يدل على إنسان أو حيوان أو نبات أو جماد أو مكان أو صفة.</p>
            <ul className="source-list"><li>يقبل أل التعريف.</li><li>يقبل التنوين.</li><li>يقبل حرف الجر.</li><li>يقبل النداء.</li></ul>
          </EducationalCard>
          <EducationalCard title="الفعل" eyebrow="أنواعه" tone="soft">
            <p>يدل على حدث مرتبط بزمن.</p>
            <ul className="source-list"><li>ماضٍ.</li><li>مضارع.</li><li>أمر.</li></ul>
          </EducationalCard>
          <EducationalCard title="الحرف" eyebrow="معناه" tone="accent">
            <p>كلمة لا يظهر معناها كاملًا إلا مع غيرها.</p>
          </EducationalCard>
        </div>
        <div className="source-note source-note--large"><strong>القاعدة الجامعة:</strong> اسم – فعل – حرف.</div>
      </LessonSection>

      <OfficialTest onComplete={() => completeActivity('test')} />

      <div id="teacher-space" className="lesson-teacher-space">
        <div className="teacher-intro">
          <div>
            <p className="section-kicker">منطقة خاصة بالمعلم</p>
            <h2>ملاحظات المعلم والإجابات النموذجية</h2>
          </div>
          <p>تظهر بعد فتح البوابة فقط.</p>
        </div>
        <TeacherSpace>
          <TeacherMaterial />
        </TeacherSpace>
      </div>

      <div className="lesson-contact lesson-contact--bottom" id="contact-bottom">
        <WhatsAppContact />
      </div>

      <nav className="lesson-pager" aria-label="التنقل بين الدروس">
        <span className="lesson-pager__disabled">← الدرس السابق</span>
        <a href="#top">العودة إلى بداية الدرس ↑</a>
        <span className="lesson-pager__disabled">الدرس التالي →</span>
      </nav>
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

function RuleBox({ title = 'قاعدة:', children }: { title?: string; children: string }) {
  return <div className="rule-box"><strong>{title}</strong><p>{children}</p></div>
}

function Subheading({ children }: { children: string }) {
  return <h3 className="source-subheading">{children}</h3>
}

function DataTable({ caption, headers, rows }: { caption: string; headers: string[]; rows: string[][] }) {
  return (
    <div className="table-scroll source-table-scroll" role="region" aria-label={caption} tabIndex={0}>
      <table className="source-table" dir="rtl">
        <caption>{caption}</caption>
        <thead><tr>{headers.map((header) => <th scope="col" key={header}>{header}</th>)}</tr></thead>
        <tbody>{rows.map((row, rowIndex) => <tr key={`${caption}-${rowIndex}`}>{row.map((cell, cellIndex) => <td key={`${rowIndex}-${cellIndex}`}><bdi>{cell}</bdi></td>)}</tr>)}</tbody>
      </table>
    </div>
  )
}

function ArrowExamples({ rows }: { rows: string[][] }) {
  return <div className="arrow-examples">{rows.map(([from, to]) => <div className="arrow-example" key={`${from}-${to}`}><bdi>{from}</bdi><span aria-hidden="true">←</span><bdi>{to}</bdi></div>)}</div>
}

function NounSignCard({ sign, index, onComplete }: { sign: typeof nounSigns[number]; index: number; onComplete: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <button className={`sign-card ${open ? 'sign-card--open' : ''}`} type="button" onClick={() => { setOpen(!open); onComplete() }} aria-expanded={open}>
      <span className="sign-card__number"><bdi>{index + 1}</bdi></span>
      <bdi className="sign-card__short">{sign.short}</bdi>
      <strong>{sign.title}</strong>
      <span className="sign-card__example"><bdi>{sign.example}</bdi></span>
      {open && <span className="sign-card__detail">{sign.detail}</span>}
    </button>
  )
}

function AynActivity({ onComplete }: { onComplete: () => void }) {
  const examples = { أ: 'أكتب', ن: 'نكتب', ي: 'يكتب', ت: 'تكتب' }
  const [selected, setSelected] = useState<keyof typeof examples>('أ')
  return (
    <div className="ayn-activity" aria-labelledby="ayn-activity-title">
      <div className="activity-heading"><span className="activity-badge"><bdi>أنيت</bdi></span><div><p className="source-kicker">نشاط تفاعلي</p><h4 id="ayn-activity-title">أحرف المضارعة</h4></div></div>
      <div className="ayn-buttons" dir="ltr">{(Object.keys(examples) as Array<keyof typeof examples>).map((letter) => <button type="button" className={selected === letter ? 'ayn-button ayn-button--selected' : 'ayn-button'} key={letter} onClick={() => { setSelected(letter); onComplete() }}><bdi>{letter}</bdi></button>)}</div>
      <p className="ayn-result"><bdi>{selected}</bdi> = <bdi>{examples[selected]}</bdi></p>
    </div>
  )
}

function VerbClassificationActivity({ onComplete }: { onComplete: () => void }) {
  const items = [['كتبَ', 'ماضٍ'], ['يكتبُ', 'مضارع'], ['اكتبْ', 'أمر']]
  const [selected, setSelected] = useState<Record<string, string>>({})
  return (
    <div className="activity-panel" aria-labelledby="verb-activity-title">
      <div className="activity-heading"><span className="activity-badge"><bdi>٣</bdi></span><div><p className="source-kicker">تفاعل حول المصدر</p><h4 id="verb-activity-title">صنّف الأفعال</h4></div></div>
      <div className="classification-list">{items.map(([word, answer]) => <div className="classification-row" key={word}><bdi>{word}</bdi><div>{['ماضٍ', 'مضارع', 'أمر'].map((option) => <button type="button" className={selected[word] === option ? 'mini-choice mini-choice--selected' : 'mini-choice'} key={option} onClick={() => { setSelected((current) => ({ ...current, [word]: option })); onComplete() }}>{option}</button>)}</div>{selected[word] && <span className={selected[word] === answer ? 'answer-mark answer-mark--good' : 'answer-mark'}>{selected[word] === answer ? 'صحيح' : `الصحيح: ${answer}`}</span>}</div>)}</div>
    </div>
  )
}

function DecisionCard({ number, question, result }: { number: string; question: string; result: string }) {
  return <div className="decision-card"><span className="activity-badge"><bdi>{number}</bdi></span><p>{question}</p><strong>{result}</strong></div>
}

function GrammarDetective({ onComplete }: { onComplete: () => void }) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  return (
    <div className="activity-panel detective" aria-labelledby="detective-title">
      <div className="activity-heading"><span className="detective-icon" aria-hidden="true">🔍</span><div><p className="source-kicker">نشاط صفّي ممتع</p><h3 id="detective-title">لعبة المحقق اللغوي</h3></div></div>
      <p>اكتب على بطاقات الكلمات التالية، ثم قسّم البطاقات إلى ثلاث مجموعات:</p>
      <p className="phrase-ribbon"><bdi>كتاب – يركض – في – شجرة – اكتب – إلى – مدرسة – لعب – يقرأ – يا</bdi></p>
      <div className="detective-words">{detectiveWords.map(([word, answer]) => <div className="detective-word" key={word}><bdi>{word}</bdi><div className="detective-options">{['اسم', 'فعل', 'حرف'].map((option) => <button type="button" className={answers[word] === option ? 'mini-choice mini-choice--selected' : 'mini-choice'} key={option} onClick={() => { setAnswers((current) => ({ ...current, [word]: option })); onComplete() }}>{option}</button>)}</div>{answers[word] && <span className={answers[word] === answer ? 'answer-mark answer-mark--good' : 'answer-mark'}>{answers[word] === answer ? '✓' : `الصحيح: ${answer}`}</span>}</div>)}</div>
      <div className="detective-groups"><div><strong>مجموعة الأسماء</strong><span>كتاب – شجرة – مدرسة.</span></div><div><strong>مجموعة الأفعال</strong><span>يركض – اكتب – لعب – يقرأ.</span></div><div><strong>مجموعة الحروف</strong><span>في – إلى – يا.</span></div></div>
      <p className="source-note">التقسيم الصحيح: الأسماء: كتاب – شجرة – مدرسة. الأفعال: يركض – اكتب – لعب – يقرأ. الحروف: في – إلى – يا.</p>
    </div>
  )
}

function FiveSecondChallenge({ onComplete }: { onComplete: () => void }) {
  const [started, setStarted] = useState(false)
  const [feedback, setFeedback] = useState('')
  function choose(option: string) {
    if (option === 'اسم') { setFeedback('أحسنت! مدرسة اسم.'); onComplete() } else setFeedback('حاول مرة أخرى: مدرسة تدل على مكان.')
  }
  return (
    <div className="challenge-panel" aria-labelledby="challenge-title">
      <div className="activity-heading"><span className="activity-badge"><bdi>٥</bdi></span><div><p className="source-kicker">التحدي</p><h3 id="challenge-title">تحدي 5 ثوانٍ</h3></div></div>
      <p>أعطِ الطالب كلمة جديدة كل مرة، واطلب منه معرفة نوعها خلال 5 ثوانٍ.</p>
      {!started ? <button className="button button--primary" type="button" onClick={() => setStarted(true)}>ابدأ التحدي</button> : <div className="challenge-question"><p>ما نوع كلمة <bdi>مدرسة</bdi>؟</p>{['اسم', 'فعل', 'حرف'].map((option) => <button className="mini-choice" type="button" key={option} onClick={() => choose(option)}>{option}</button>)}<p className="activity-feedback" role="status">{feedback || 'لديك 5 ثوانٍ.'}</p></div>}
    </div>
  )
}

function OfficialTest({ onComplete }: { onComplete: () => void }) {
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [checked, setChecked] = useState(false)
  const objectiveQuestions = officialQuestions.filter((question) => question.type === 'choice')
  const allAnswered = officialQuestions.every((question) => answers[question.number]?.trim())
  const score = objectiveQuestions.filter((question) => answers[question.number] === question.answer).length

  function updateAnswer(number: number, answer: string) {
    setAnswers((current) => ({ ...current, [number]: answer }))
  }

  function checkAnswers() {
    setChecked(true)
    onComplete()
  }

  return (
    <LessonSection id="final-test" title="اختبار نهاية الدرس" description="الاختبار النهائي الرسمي المكون من 20 سؤالًا.">
      <div className="official-test" data-testid="official-test" aria-label="الاختبار النهائي الرسمي">
        <div className="official-test__intro"><strong>اختبار نهاية الدرس</strong><span>٢٠ سؤالًا</span><p>أجب عن الأسئلة كلها. الأسئلة المفتوحة تُراجع معلمك.</p></div>
        <div className="official-test__groups">
          <h3>أولًا: اختر الإجابة الصحيحة</h3>
          {officialQuestions.slice(0, 6).map((question) => <OfficialQuestionView question={question} value={answers[question.number] || ''} checked={checked} onChange={updateAnswer} key={question.number} />)}
          <h3>ثانيًا: صح أم خطأ</h3>
          {officialQuestions.slice(6, 10).map((question) => <OfficialQuestionView question={question} value={answers[question.number] || ''} checked={checked} onChange={updateAnswer} key={question.number} />)}
          <h3>ثالثًا: حدد نوع الكلمة</h3>
          {officialQuestions.slice(10, 13).map((question) => <OfficialQuestionView question={question} value={answers[question.number] || ''} checked={checked} onChange={updateAnswer} key={question.number} />)}
          <h3>رابعًا: تطبيق عملي</h3>
          {officialQuestions.slice(13).map((question) => <OfficialQuestionView question={question} value={answers[question.number] || ''} checked={checked} onChange={updateAnswer} key={question.number} />)}
        </div>
        <div className="official-test__actions">
          <button className="button button--primary" type="button" disabled={!allAnswered || checked} onClick={checkAnswers}>تحقق من الاختبار</button>
          {!allAnswered && !checked && <p>أجب عن الأسئلة العشرين كلها أولًا.</p>}
          {checked && <p className="official-test__result" role="status">الإجابات الموضوعية الصحيحة: <bdi>{score} / 10</bdi>. الأسئلة المفتوحة جاهزة للمراجعة مع المعلم.</p>}
        </div>
      </div>
    </LessonSection>
  )
}

function OfficialQuestionView({ question, value, checked, onChange }: { question: OfficialQuestion; value: string; checked: boolean; onChange: (number: number, value: string) => void }) {
  const isChoiceCorrect = checked && question.type === 'choice' && value === question.answer
  return (
    <fieldset className="official-question" data-question-number={question.number} disabled={checked}>
      <legend><span className="question-number">السؤال <bdi>{question.number}</bdi></span> <QuestionText text={question.prompt} /></legend>
      {question.type === 'choice' && <div className="official-options">{question.options?.map((option) => <label key={option}><input type="radio" name={`official-${question.number}`} value={option} checked={value === option} onChange={() => onChange(question.number, option)} /><span>{option}</span></label>)}</div>}
      {question.type === 'open' && <textarea rows={question.number === 14 ? 4 : 3} value={value} onChange={(event) => onChange(question.number, event.target.value)} aria-label={`إجابة السؤال ${question.number}`} placeholder="اكتب إجابتك هنا" />}
      {checked && question.type === 'choice' && <p className={isChoiceCorrect ? 'question-feedback question-feedback--good' : 'question-feedback'}>{isChoiceCorrect ? 'إجابة صحيحة.' : `الإجابة النموذجية: ${question.answer}`}{question.correction ? ` ${question.correction}` : ''}</p>}
      {checked && question.type === 'open' && <p className="question-feedback">تم تسجيل الإجابة للمراجعة مع المعلم.</p>}
    </fieldset>
  )
}

function TeacherMaterial() {
  return (
    <div className="teacher-material">
      <h3>الإجابات النموذجية</h3>
      <h4>إجابات الاختيار من متعدد</h4>
      <DataTable caption="إجابات الاختيار من متعدد" headers={['السؤال', 'الإجابة']} rows={officialQuestions.slice(0, 6).map((question) => [String(question.number), question.answer])} />
      <h4>إجابات الصح والخطأ</h4>
      <DataTable caption="إجابات الصح والخطأ" headers={['السؤال', 'الإجابة']} rows={officialQuestions.slice(6, 10).map((question) => [String(question.number), question.answer])} />
      <div className="correction-box"><h4>تصحيح السؤال 8</h4><p>الفعل الماضي يدل على حدث حصل وانتهى.</p><h4>تصحيح السؤال 10</h4><p>الحرف لا يظهر معناه كاملًا غالبًا إلا مع غيره.</p></div>
      <h4>إجابة السؤال 11</h4><p>بيت: اسم؛ يذهب: فعل مضارع؛ من: حرف؛ لعب: فعل ماضٍ؛ اقرأ: فعل أمر؛ جميل: اسم.</p>
      <h4>إجابة السؤال 12</h4><p>الجملة: يقرأُ الطالبُ الكتابَ في المنزلِ.</p><ul className="solution-list"><li>يقرأ: فعل مضارع.</li><li>الطالب: اسم.</li><li>الكتاب: اسم.</li><li>في: حرف جر.</li><li>المنزل: اسم.</li></ul>
      <h4>إجابة السؤال 13</h4><ol className="solution-list"><li>كتبَ ← فعل ماضٍ.</li><li>يكتبُ ← فعل مضارع.</li><li>اكتبْ ← فعل أمر.</li></ol>
      <h4>إجابة السؤال 14</h4><DataTable caption="إجابة السؤال 14" headers={['الاسم', 'الفعل', 'الحرف']} rows={[['شجرة', 'ذهب', 'على'], ['معلم', 'يركض', 'من'], ['كتاب', 'اكتب', 'يدرس']] } />
      <h4>إجابة السؤال 15</h4><p>أقسام الكلام: الاسم، الفعل، الحرف.</p>
      <h4>إجابة السؤال 16</h4><p>أي علامتين من التالي: دخول أل التعريف، قبول التنوين، دخول حرف الجر، قبول النداء.</p>
      <h4>إجابة السؤال 17</h4><p>الفعل الماضي، والفعل المضارع، وفعل الأمر.</p>
      <h4>إجابة السؤال 18</h4><p>لأن كلمة "في" لا يظهر معناها كاملًا إلا مع كلمة أخرى، مثل: في البيت.</p>
      <h4>إجابة السؤال 19</h4><p>كتبَ ← يكتبُ. لعبَ ← يلعبُ. ذهبَ ← يذهبُ.</p>
      <h4>إجابة السؤال 20</h4><p>يكتبُ ← اكتبْ. يقرأُ ← اقرأْ. يجلسُ ← اجلسْ.</p>

      <h3>ملاحظات مهمة للمعلم</h3>
      <h4>الأخطاء المتوقعة عند الطالب</h4>
      <ol className="teacher-notes">
        <li><strong>الخلط بين الاسم والفعل:</strong> قد يعتبر الطالب كلمة "لعب" اسمًا لأنها تدل على شيء يعرفه، لذلك يجب التركيز على ارتباط الفعل بالزمن.</li>
        <li><strong>الخلط بين المضارع والأمر:</strong> يكتب = مضارع، اكتب = أمر. الفرق أن المضارع يخبر عن حدث، أما الأمر فيطلب القيام به.</li>
        <li><strong>اعتبار كل كلمة تبدأ بحرف من أحرف المضارعة فعلًا مضارعًا:</strong> مثل كلمة "أحمد" ليست فعلًا، بل اسم علم.</li>
      </ol>

      <h3>معيار إتقان الدرس</h3>
      <p>يُعتبر الطالب متقنًا للدرس إذا استطاع:</p>
      <ul className="source-list"><li>تصنيف 15 كلمة من أصل 20 بشكل صحيح على الأقل.</li><li>تحديد أنواع الأفعال الثلاثة دون مساعدة.</li><li>استخراج أقسام الكلام من جمل قصيرة.</li><li>ذكر علامات الاسم الأساسية.</li></ul>
    </div>
  )
}

function WhatsAppContact() {
  return (
    <div className="whatsapp-card">
      <div className="whatsapp-card__icon" aria-hidden="true">◔</div>
      <div>
        <p className="section-kicker">تواصل عبر واتساب</p>
        <h3>المهندس سومر شاهين</h3>
        <p>للاستفسار أو متابعة الدرس، تواصل عبر الرقم التالي.</p>
      </div>
      <a className="whatsapp-card__number" href="https://wa.me/963930215022" target="_blank" rel="noreferrer" aria-label="فتح واتساب على الرقم 0930215022">
        <span>واتساب</span>
        <bdi dir="ltr">0930215022</bdi>
      </a>
    </div>
  )
}
