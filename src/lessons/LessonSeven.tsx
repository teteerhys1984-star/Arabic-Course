import { useState, type ReactNode } from 'react'
import { EducationalCard } from '../shared/components/EducationalCard'
import { LessonFlow, type LessonStepDefinition } from '../shared/components/LessonFlow'
import { TeacherSpace } from '../shared/teacher/TeacherSpace'

interface Props {
  onProgressChange?: (value: number) => void
  onFinish?: () => void
}

/* ------------------------------------------------------------------ *
 * الأنشطة الخمسة — بيانات المصدر كما هي
 * النشاط الأول: 10 مطالب — النشاط الثاني: 8 مطالب — النشاط الثالث: 9 مطالب
 * النشاط الرابع: 5 مطالب — النشاط الخامس: 5 مطالب — المجموع: 37 مطلبًا
 * ------------------------------------------------------------------ */

type ClassificationItem = { prompt: string; answer: string }
type StateSignItem = { prompt: string; word: string; state: string; sign: string }
type TransformItem = { prompt: string; answer: string; model: string }

const activityOneItems: ClassificationItem[] = [
  { prompt: 'طالب', answer: 'مفرد' },
  { prompt: 'طالبان', answer: 'مثنى' },
  { prompt: 'معلمون', answer: 'جمع' },
  { prompt: 'معلمات', answer: 'جمع' },
  { prompt: 'كتاب', answer: 'مفرد' },
  { prompt: 'كتابان', answer: 'مثنى' },
  { prompt: 'كتب', answer: 'جمع' },
  { prompt: 'مهندسون', answer: 'جمع' },
  { prompt: 'مهندسات', answer: 'جمع' },
  { prompt: 'قلم', answer: 'مفرد' },
]

const activityTwoItems: ClassificationItem[] = [
  { prompt: 'معلمون', answer: 'جمع مذكر سالم' },
  { prompt: 'معلمين', answer: 'جمع مذكر سالم' },
  { prompt: 'طالبات', answer: 'جمع مؤنث سالم' },
  { prompt: 'كتب', answer: 'جمع تكسير' },
  { prompt: 'أقلام', answer: 'جمع تكسير' },
  { prompt: 'مهندسات', answer: 'جمع مؤنث سالم' },
  { prompt: 'رجال', answer: 'جمع تكسير' },
  { prompt: 'مسلمون', answer: 'جمع مذكر سالم' },
]

const activityThreeItems: StateSignItem[] = [
  { prompt: 'جاءَ الطالبانِ.', word: 'الطالبانِ', state: 'مرفوع', sign: 'الألف' },
  { prompt: 'رأيتُ الطالبينِ.', word: 'الطالبينِ', state: 'منصوب', sign: 'الياء' },
  { prompt: 'مررتُ بـ الطالبينِ.', word: 'الطالبينِ', state: 'مجرور', sign: 'الياء' },
  { prompt: 'حضرَ المعلمونَ.', word: 'المعلمونَ', state: 'مرفوع', sign: 'الواو' },
  { prompt: 'كرَّمتُ المعلمينَ.', word: 'المعلمينَ', state: 'منصوب', sign: 'الياء' },
  { prompt: 'سلَّمتُ على المعلمينَ.', word: 'المعلمينَ', state: 'مجرور', sign: 'الياء' },
  { prompt: 'حضرتِ المعلماتُ.', word: 'المعلماتُ', state: 'مرفوع', sign: 'الضمة' },
  { prompt: 'كرَّمتُ المعلماتِ.', word: 'المعلماتِ', state: 'منصوب', sign: 'الكسرة نيابةً عن الفتحة' },
  { prompt: 'سلَّمتُ على المعلماتِ.', word: 'المعلماتِ', state: 'مجرور', sign: 'الكسرة' },
]

const activityFourItems: TransformItem[] = [
  { prompt: 'طالب', answer: 'طالبان', model: 'جاءَ طالبانِ إلى المدرسةِ.' },
  { prompt: 'طالبة', answer: 'طالبتان', model: 'حضرتِ طالبتانِ مجتهدتانِ.' },
  { prompt: 'معلم', answer: 'معلمان', model: 'حضرَ معلمانِ إلى الصفِّ.' },
  { prompt: 'شجرة', answer: 'شجرتان', model: 'في الحديقةِ شجرتانِ.' },
  { prompt: 'كتاب', answer: 'كتابان', model: 'على الطاولةِ كتابانِ.' },
]

const activityFiveItems: TransformItem[] = [
  { prompt: 'معلم', answer: 'معلمون', model: 'حضرَ المعلمونَ إلى المدرسةِ.' },
  { prompt: 'مهندس', answer: 'مهندسون', model: 'المهندسونَ ماهرونَ في عملِهم.' },
  { prompt: 'معلمة', answer: 'معلمات', model: 'حضرتِ المعلماتُ إلى الصفِّ.' },
  { prompt: 'طالبة', answer: 'طالبات', model: 'الطالباتُ مجتهداتٌ.' },
  { prompt: 'كاتب', answer: 'كاتبون', model: 'الكاتبونَ مبدعونَ.' },
]

const stateChoices = ['مرفوع', 'منصوب', 'مجرور']
const signChoices = ['الألف', 'الياء', 'الواو', 'الضمة', 'الكسرة', 'الكسرة نيابةً عن الفتحة']

/* ------------------------------------------------------------------ *
 * اختبار نهاية الدرس — الأسئلة الخمسة والعشرون الرسمية من المصدر
 * الأسئلة 1–8 اختيار من متعدد — 9–15 صح أم خطأ — 16–18 استخرج وحدد
 * 19–20 حوّل — 21–23 أعرب — 24 سؤال تفكير — 25 تحدٍّ إضافي
 * ------------------------------------------------------------------ */

type FinalTestType = 'choice' | 'true-false' | 'identify' | 'transform' | 'parsing' | 'thinking' | 'challenge'

type FinalTestQuestion = {
  number: number
  section: string
  type: FinalTestType
  prompt: string
  options?: string[]
  parts?: string[]
  answer: string
}

const sectionOne = 'السؤال الأول: اختر الإجابة الصحيحة'
const sectionTwo = 'السؤال الثاني: صح أم خطأ'
const sectionThree = 'السؤال الثالث: استخرج وحدد'
const sectionFour = 'السؤال الرابع: حوّل'
const sectionFive = 'السؤال الخامس: أعرب'
const sectionSix = 'السؤال السادس: سؤال تفكير'
const sectionSeven = 'السؤال السابع: تحدٍّ إضافي'

const finalTestQuestions: FinalTestQuestion[] = [
  {
    number: 1,
    section: sectionOne,
    type: 'choice',
    prompt: 'ما يدل على اثنين أو اثنتين يسمى:',
    options: ['أ. مفردًا', 'ب. مثنى', 'ج. جمعًا', 'د. فعلًا'],
    answer: 'ب. مثنى.',
  },
  {
    number: 2,
    section: sectionOne,
    type: 'choice',
    prompt: 'علامة رفع المثنى هي:',
    options: ['أ. الضمة', 'ب. الفتحة', 'ج. الألف', 'د. الواو'],
    answer: 'ج. الألف.',
  },
  {
    number: 3,
    section: sectionOne,
    type: 'choice',
    prompt: 'علامة نصب المثنى هي:',
    options: ['أ. الألف', 'ب. الياء', 'ج. الواو', 'د. الضمة'],
    answer: 'ب. الياء.',
  },
  {
    number: 4,
    section: sectionOne,
    type: 'choice',
    prompt: 'علامة رفع جمع المذكر السالم هي:',
    options: ['أ. الألف', 'ب. الضمة', 'ج. الواو', 'د. الياء'],
    answer: 'ج. الواو.',
  },
  {
    number: 5,
    section: sectionOne,
    type: 'choice',
    prompt: 'علامة نصب جمع المذكر السالم هي:',
    options: ['أ. الياء', 'ب. الواو', 'ج. الألف', 'د. الكسرة'],
    answer: 'أ. الياء.',
  },
  {
    number: 6,
    section: sectionOne,
    type: 'choice',
    prompt: 'علامة نصب جمع المؤنث السالم هي:',
    options: ['أ. الفتحة', 'ب. الياء', 'ج. الكسرة', 'د. الواو'],
    answer: 'ج. الكسرة.',
  },
  {
    number: 7,
    section: sectionOne,
    type: 'choice',
    prompt: 'كلمة "معلمات" هي:',
    options: ['أ. مثنى', 'ب. جمع مذكر سالم', 'ج. جمع مؤنث سالم', 'د. جمع تكسير'],
    answer: 'ج. جمع مؤنث سالم.',
  },
  {
    number: 8,
    section: sectionOne,
    type: 'choice',
    prompt: 'كلمة "أقلام" هي:',
    options: ['أ. جمع تكسير', 'ب. جمع مذكر سالم', 'ج. جمع مؤنث سالم', 'د. مثنى'],
    answer: 'أ. جمع تكسير.',
  },
  {
    number: 9,
    section: sectionTwo,
    type: 'true-false',
    prompt: 'المثنى يرفع بالألف. ( )',
    options: ['صح', 'خطأ'],
    answer: 'صح.',
  },
  {
    number: 10,
    section: sectionTwo,
    type: 'true-false',
    prompt: 'المثنى ينصب بالفتحة. ( )',
    options: ['صح', 'خطأ'],
    answer: 'خطأ؛ المثنى ينصب بالياء.',
  },
  {
    number: 11,
    section: sectionTwo,
    type: 'true-false',
    prompt: 'جمع المذكر السالم يرفع بالواو. ( )',
    options: ['صح', 'خطأ'],
    answer: 'صح.',
  },
  {
    number: 12,
    section: sectionTwo,
    type: 'true-false',
    prompt: 'جمع المذكر السالم يجر بالياء. ( )',
    options: ['صح', 'خطأ'],
    answer: 'صح.',
  },
  {
    number: 13,
    section: sectionTwo,
    type: 'true-false',
    prompt: 'جمع المؤنث السالم ينصب بالكسرة. ( )',
    options: ['صح', 'خطأ'],
    answer: 'صح.',
  },
  {
    number: 14,
    section: sectionTwo,
    type: 'true-false',
    prompt: 'كلمة "كتب" جمع مذكر سالم. ( )',
    options: ['صح', 'خطأ'],
    answer: 'خطأ؛ كتب جمع تكسير.',
  },
  {
    number: 15,
    section: sectionTwo,
    type: 'true-false',
    prompt: 'كل كلمة تنتهي بـ"ون" هي جمع مذكر سالم. ( )',
    options: ['صح', 'خطأ'],
    answer: 'خطأ؛ ليس كل ما ينتهي بـ"ون" جمع مذكر سالمًا.',
  },
  {
    number: 16,
    section: sectionThree,
    type: 'identify',
    prompt: 'جاءَ الطالبانِ إلى المدرسةِ.',
    parts: ['استخرج المثنى:', 'ما حالته الإعرابية؟', 'ما علامة إعرابه؟'],
    answer:
      'المثنى: الطالبانِ. حالته: مرفوع. علامته: الألف. والإعراب الكامل: الطالبانِ: فاعل مرفوع وعلامة رفعه الألف؛ لأنه مثنى.',
  },
  {
    number: 17,
    section: sectionThree,
    type: 'identify',
    prompt: 'كرَّمَ المديرُ المعلمينَ.',
    parts: ['استخرج جمع المذكر السالم:', 'ما حالته الإعرابية؟', 'ما علامة إعرابه؟'],
    answer:
      'جمع المذكر السالم: المعلمينَ. حالته: منصوب. علامته: الياء. والإعراب الكامل: المعلمينَ: مفعول به منصوب وعلامة نصبه الياء؛ لأنه جمع مذكر سالم.',
  },
  {
    number: 18,
    section: sectionThree,
    type: 'identify',
    prompt: 'حضرتِ الطالباتُ إلى الصفِّ.',
    parts: ['استخرج جمع المؤنث السالم:', 'ما حالته الإعرابية؟', 'ما علامة إعرابه؟'],
    answer:
      'جمع المؤنث السالم: الطالباتُ. حالته: مرفوع. علامته: الضمة. والإعراب الكامل: الطالباتُ: فاعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره.',
  },
  {
    number: 19,
    section: sectionFour,
    type: 'transform',
    prompt: 'حوّل المفرد إلى مثنى:',
    parts: ['طالب → ', 'طالبة → ', 'معلم → '],
    answer: 'طالب → طالبان. طالبة → طالبتان. معلم → معلمان.',
  },
  {
    number: 20,
    section: sectionFour,
    type: 'transform',
    prompt: 'حوّل إلى الجمع المناسب:',
    parts: ['معلم → ', 'معلمة → ', 'مهندس → ', 'مهندسة → '],
    answer: 'معلم → معلمون. معلمة → معلمات. مهندس → مهندسون. مهندسة → مهندسات.',
  },
  {
    number: 21,
    section: sectionFive,
    type: 'parsing',
    prompt: 'جاءَ الطالبانِ. أعرب: الطالبانِ:',
    answer: 'الطالبانِ: فاعل مرفوع وعلامة رفعه الألف؛ لأنه مثنى.',
  },
  {
    number: 22,
    section: sectionFive,
    type: 'parsing',
    prompt: 'رأيتُ المعلمينَ. أعرب: المعلمينَ:',
    answer: 'المعلمينَ: مفعول به منصوب وعلامة نصبه الياء؛ لأنه جمع مذكر سالم.',
  },
  {
    number: 23,
    section: sectionFive,
    type: 'parsing',
    prompt: 'سلَّمتُ على الطالباتِ. أعرب: الطالباتِ:',
    answer: 'الطالباتِ: اسم مجرور بـ"على"، وعلامة جره الكسرة الظاهرة على آخره.',
  },
  {
    number: 24,
    section: sectionSix,
    type: 'thinking',
    prompt: 'قارن بين الجملتين: جاءَ الطالبانِ. جاءَ المعلمونَ.',
    parts: [
      'أ. ما نوع "الطالبان"؟',
      'ب. ما نوع "المعلمون"؟',
      'ج. ما علامة رفع "الطالبان"؟',
      'د. ما علامة رفع "المعلمون"؟',
      'هـ. لماذا اختلفت علامة الرفع؟',
    ],
    answer:
      'أ. الطالبان → مثنى. ب. المعلمون → جمع مذكر سالم. ج. علامة رفع الطالبان → الألف. د. علامة رفع المعلمون → الواو. هـ. لأن كل نوع له علامة إعراب فرعية خاصة به: المثنى يُرفع بالألف، وجمع المذكر السالم يُرفع بالواو.',
  },
  {
    number: 25,
    section: sectionSeven,
    type: 'challenge',
    prompt:
      'انظر إلى الكلمات الآتية: مسلمان – مسلمين – معلمان – معلمين – معلمون – معلمات. صنّفها إلى: مثنى – جمع مذكر سالم – جمع مؤنث سالم، ثم اذكر علامة الرفع والنصب والجر لكل نوع.',
    parts: ['المثنى:', 'جمع المذكر السالم:', 'جمع المؤنث السالم:'],
    answer:
      'المثنى: مسلمان – مسلمين، معلمان – معلمين. يرفع بالألف، وينصب ويجر بالياء. جمع المذكر السالم: معلمون – معلمين. يرفع بالواو، وينصب ويجر بالياء. جمع المؤنث السالم: معلمات. ترفع بالضمة، وتنصب وتجر بالكسرة.',
  },
]

/** الأسئلة الموضوعية التي تُصحَّح آليًا: 1–8 اختيار من متعدد و9–15 صح أم خطأ. */
const objectiveAnswers: Record<number, string> = {
  1: 'ب. مثنى',
  2: 'ج. الألف',
  3: 'ب. الياء',
  4: 'ج. الواو',
  5: 'أ. الياء',
  6: 'ج. الكسرة',
  7: 'ج. جمع مؤنث سالم',
  8: 'أ. جمع تكسير',
  9: 'صح',
  10: 'خطأ',
  11: 'صح',
  12: 'صح',
  13: 'صح',
  14: 'خطأ',
  15: 'خطأ',
}

/* ------------------------------------------------------------------ *
 * تعلّم متسلسل: كل خطوة تُعرض وحدها داخل LessonFlow
 * ------------------------------------------------------------------ */

export function LessonSeven({ onProgressChange, onFinish }: Props) {
  const steps: LessonStepDefinition[] = [
    step('intro', 'الدرس السابع: المثنى وجمع المذكر السالم وجمع المؤنث السالم', 'البداية', '📘', (
      <EducationalCard
        title="الدرس السابع: المثنى وجمع المذكر السالم وجمع المؤنث السالم"
        eyebrow="عنوان الدرس"
        tone="accent"
      >
        <p className="lesson-seven-hero-topic">المثنى وجمع المذكر السالم وجمع المؤنث السالم</p>
        <p>
          في هذا الدرس نفهم المفرد والمثنى والجمع، وكيف نرفع كل نوع وننصبه ونجره، ثم نميّز بين
          المثنى وجمع المذكر السالم وجمع المؤنث السالم بالأمثلة والإعراب الكامل والأنشطة.
        </p>
        <div className="lesson-seven-hero-map" aria-label="أنواع الكلمة في هذا الدرس">
          <div><strong>المفرد</strong><span>واحد أو واحدة</span></div>
          <div><strong>المثنى</strong><span>اثنان أو اثنتان</span></div>
          <div><strong>جمع المذكر السالم</strong><span>ثلاثة فأكثر من المذكر وفق شروطه</span></div>
          <div><strong>جمع المؤنث السالم</strong><span>ثلاثة فأكثر من المؤنث وفق شروطه</span></div>
        </div>
      </EducationalCard>
    )),
    step('objectives', 'أهداف الدرس', 'البداية', '🎯', (
      <>
        <p>في نهاية هذا الدرس يُتوقَّع من الطالب أن يستطيع:</p>
        <ul className="check-list">
          <li>التمييز بين المفرد والمثنى والجمع.</li>
          <li>معرفة معنى المثنى.</li>
          <li>تكوين المثنى بصورة صحيحة.</li>
          <li>التمييز بين حالتي المثنى: الرفع والنصب والجر.</li>
          <li>معرفة علامتي إعراب المثنى.</li>
          <li>معرفة معنى جمع المذكر السالم.</li>
          <li>معرفة شروط جمع المذكر السالم الأساسية.</li>
          <li>معرفة علامات إعراب جمع المذكر السالم.</li>
          <li>معرفة معنى جمع المؤنث السالم.</li>
          <li>معرفة طريقة تكوين جمع المؤنث السالم.</li>
          <li>معرفة علامات إعراب جمع المؤنث السالم.</li>
          <li>التمييز بين جمع المذكر السالم وجمع المؤنث السالم وجمع التكسير.</li>
          <li>تطبيق القواعد في جمل وإعراب كلمات.</li>
          <li>اكتشاف الأخطاء الشائعة في الجمع والتثنية.</li>
        </ul>
      </>
    )),
    step('intro-three', 'تمهيد — المفرد والمثنى والجمع', 'المفرد والمثنى', '🧭', (
      <>
        <p>قبل أن نتعلم المثنى والجمع، يجب أن نفهم عدد الأشياء التي نتحدث عنها.</p>
        <p>انظر:</p>
        <p className="lesson-seven-featured"><bdi>طالب</bdi></p>
        <p>نتحدث عن طالب واحد. إذن:</p>
        <p className="lesson-seven-featured"><bdi>طالب = مفرد</bdi></p>
        <p>إذا أصبح لدينا اثنان:</p>
        <p className="lesson-seven-featured"><bdi>طالبان</bdi></p>
        <p>إذن:</p>
        <p className="lesson-seven-featured"><bdi>طالبان = مثنى</bdi></p>
        <p>وإذا أصبح لدينا ثلاثة أو أكثر:</p>
        <p className="lesson-seven-featured"><bdi>طلاب</bdi></p>
        <p>إذن:</p>
        <p className="lesson-seven-featured"><bdi>طلاب = جمع</bdi></p>
        <p>لدينا إذن:</p>
        <div className="lesson-seven-triad">
          <div><strong>مفرد</strong><Arrow /><bdi>واحد</bdi></div>
          <div><strong>مثنى</strong><Arrow /><bdi>اثنان</bdi></div>
          <div><strong>جمع</strong><Arrow /><bdi>ثلاثة فأكثر</bdi></div>
        </div>
      </>
    )),
    step('singular', '1. المفرد', 'المفرد والمثنى', '🔹', (
      <>
        <p>المفرد هو:</p>
        <Rule>ما دل على واحد أو واحدة.</Rule>
        <p>أمثلة:</p>
        <ChipRow items={['طالب', 'معلم', 'كتاب', 'شجرة', 'بنت', 'سيارة']} />
        <p>كل كلمة من هذه تدل على شيء واحد.</p>
      </>
    )),
    step('dual-definition', '2. المثنى', 'المفرد والمثنى', '✌️', (
      <>
        <p>المثنى هو:</p>
        <Rule>
          ما دل على اثنين أو اثنتين، بزيادة ألف ونون أو ياء ونون في آخره، مع بقاء مفرده صالحًا
          للاستعمال.
        </Rule>
        <p>مثال:</p>
        <TransformLine from="طالب" to="طالبان" note="لدينا طالبان، أي اثنان." />
        <TransformLine from="معلم" to="معلمان" />
        <TransformLine from="كتاب" to="كتابان" />
        <TransformLine from="طالبة" to="طالبتان" />
        <TransformLine from="شجرة" to="شجرتان" />
      </>
    )),
    step('why-dual', '3. لماذا سُمّي "مثنى"؟', 'المفرد والمثنى', '💬', (
      <>
        <p>لأنه يدل على:</p>
        <Rule>اثنين أو اثنتين.</Rule>
        <p>مثل:</p>
        <p className="lesson-seven-featured"><bdi>طالبان</bdi></p>
        <p>أي:</p>
        <p className="lesson-seven-featured"><bdi>طالب + طالب</bdi></p>
        <p>ومثل:</p>
        <p className="lesson-seven-featured"><bdi>طالبتان</bdi></p>
        <p>أي:</p>
        <p className="lesson-seven-featured"><bdi>طالبة + طالبة</bdi></p>
      </>
    )),
    step('dual-forms', '4. كيف نصوغ المثنى؟', 'المفرد والمثنى', '✍️', (
      <>
        <p>للمثنى صورتان أساسيتان:</p>
        <div className="lesson-seven-two-column">
          <article>
            <h3>في حالة الرفع</h3>
            <p>نضيف ألفًا ونونًا:</p>
            <p className="lesson-seven-form"><bdi>ـانِ</bdi></p>
            <ul className="check-list">
              <li><bdi>طالب ← طالبانِ</bdi></li>
              <li><bdi>معلم ← معلمانِ</bdi></li>
              <li><bdi>كتاب ← كتابانِ</bdi></li>
              <li><bdi>طالبة ← طالبتانِ</bdi></li>
            </ul>
          </article>
          <article>
            <h3>في حالتي النصب والجر</h3>
            <p>نضيف ياءً ونونًا:</p>
            <p className="lesson-seven-form"><bdi>ـينِ</bdi></p>
            <ul className="check-list">
              <li><bdi>طالب ← طالبينِ</bdi></li>
              <li><bdi>معلم ← معلمينِ</bdi></li>
              <li><bdi>كتاب ← كتابينِ</bdi></li>
              <li><bdi>طالبة ← طالبتينِ</bdi></li>
            </ul>
          </article>
        </div>
      </>
    )),
    step('dual-rule', '5. قاعدة مهمة جدًا في المثنى', 'المفرد والمثنى', '⭐', (
      <>
        <p>المثنى:</p>
        <Rule>يُرفع بالألف.</Rule>
        <Rule>ويُنصب بالياء.</Rule>
        <Rule>ويُجر بالياء.</Rule>
        <p>احفظها بهذه الصورة:</p>
        <GoldenRule text="المثنى: ألف في الرفع، وياء في النصب والجر." />
      </>
    )),
    step('dual-raf', '6. المثنى في حالة الرفع', 'إعراب المثنى', '⬆️', (
      <>
        <p>مثال:</p>
        <p className="lesson-seven-featured"><bdi>جاءَ الطالبانِ.</bdi></p>
        <p>من الذي جاء؟ <bdi>الطالبانِ</bdi>. إذن هو: <strong>فاعل</strong>، والفاعل مرفوع. لكن علامة رفعه ليست الضمة.</p>
        <p>لماذا؟ لأنه مثنى. إذن:</p>
        <FullParsing lines={['الطالبانِ: فاعل مرفوع وعلامة رفعه الألف؛ لأنه مثنى.']} />
        <p>مثال آخر</p>
        <p className="lesson-seven-featured"><bdi>الطالبانِ مجتهدانِ.</bdi></p>
        <FullParsing
          lines={[
            'الطالبانِ: مبتدأ مرفوع وعلامة رفعه الألف؛ لأنه مثنى.',
            'مجتهدانِ: خبر مرفوع وعلامة رفعه الألف؛ لأنه مثنى.',
          ]}
        />
      </>
    )),
    step('dual-nasb', '7. المثنى في حالة النصب', 'إعراب المثنى', '⬇️', (
      <>
        <p>مثال:</p>
        <p className="lesson-seven-featured"><bdi>رأيتُ الطالبينِ.</bdi></p>
        <p>ماذا رأيت؟ <bdi>الطالبينِ</bdi>. إذن هو: <strong>مفعول به</strong>، والمفعول به منصوب.</p>
        <p>لأنه مثنى، تكون علامة نصبه: <strong>الياء</strong>.</p>
        <p>الإعراب:</p>
        <FullParsing lines={['الطالبينِ: مفعول به منصوب وعلامة نصبه الياء؛ لأنه مثنى.']} />
      </>
    )),
    step('dual-jarr', '8. المثنى في حالة الجر', 'إعراب المثنى', '↘️', (
      <>
        <p>مثال:</p>
        <p className="lesson-seven-featured"><bdi>سلَّمتُ على الطالبينِ.</bdi></p>
        <p><bdi>على</bdi>: حرف جر.</p>
        <p><bdi>الطالبينِ</bdi>: اسم مجرور. وعلامة جره: <strong>الياء</strong>؛ لأنه مثنى.</p>
        <p>الإعراب:</p>
        <FullParsing lines={['الطالبينِ: اسم مجرور بـ(على)، وعلامة جره الياء؛ لأنه مثنى.']} />
      </>
    )),
    step('dual-table', '9. جدول المثنى', 'إعراب المثنى', '📊', (
      <>
        <div className="table-scroll">
          <table className="lesson-seven-table">
            <thead>
              <tr><th>الحالة</th><th>صورة المثنى</th><th>العلامة</th></tr>
            </thead>
            <tbody>
              <tr><th>الرفع</th><td><bdi>طالبانِ</bdi></td><td>الألف</td></tr>
              <tr><th>النصب</th><td><bdi>طالبينِ</bdi></td><td>الياء</td></tr>
              <tr><th>الجر</th><td><bdi>طالبينِ</bdi></td><td>الياء</td></tr>
            </tbody>
          </table>
        </div>
        <p>لاحظ:</p>
        <div className="lesson-seven-mapping">
          <MapRow from="طالبانِ" to="رفع" />
          <MapRow from="طالبينِ" to="نصب أو جر" />
        </div>
        <p>وهذا مهم جدًا.</p>
      </>
    )),
    step('dual-state-question', '10. كيف أعرف هل المثنى مرفوع أم منصوب أم مجرور؟', 'إعراب المثنى', '🔎', (
      <>
        <p>لا تعتمد على شكل الكلمة وحده.</p>
        <p>فكلمة:</p>
        <p className="lesson-seven-featured"><bdi>الطالبينِ</bdi></p>
        <p>قد تكون منصوبة:</p>
        <p className="lesson-seven-featured"><bdi>رأيتُ الطالبينِ.</bdi></p>
        <p>وقد تكون مجرورة:</p>
        <p className="lesson-seven-featured"><bdi>سلَّمتُ على الطالبينِ.</bdi></p>
        <p>لذلك نسأل عن وظيفة الكلمة والعامل الذي دخل عليها.</p>
      </>
    )),
    step('dual-nun', '11. حذف النون في المثنى', 'إعراب المثنى', '✂️', (
      <>
        <p>هناك ملاحظة متقدمة مهمة: النون الموجودة في المثنى قد تُحذف عند الإضافة.</p>
        <p>مثال:</p>
        <p className="lesson-seven-featured"><bdi>جاءَ طالبانِ.</bdi></p>
        <p>لكن نقول:</p>
        <p className="lesson-seven-featured"><bdi>جاءَ طالبا المدرسةِ.</bdi></p>
        <p>وليس: <bdi>طالبانِ المدرسةِ</bdi> في هذا التركيب.</p>
        <p>ومثال:</p>
        <p className="lesson-seven-featured"><bdi>رأيتُ طالبَي المدرسةِ.</bdi></p>
        <p>ومثال:</p>
        <p className="lesson-seven-featured"><bdi>سلَّمتُ على طالبَي المدرسةِ.</bdi></p>
        <p>إذن:</p>
        <div className="lesson-seven-mapping">
          <MapRow from="طالبانِ" to="طالبا المدرسةِ" />
          <MapRow from="طالبينِ" to="طالبَي المدرسةِ" />
        </div>
        <p>
          هذه نقطة مهمة وسنعود إليها بالتفصيل في درس <strong>المضاف والمضاف إليه</strong>.
        </p>
      </>
    )),
    step('dual-warning', '12. تنبيه مهم حول المثنى', 'إعراب المثنى', '⚠️', (
      <>
        <p>ليس كل كلمة تنتهي بـ:</p>
        <p className="lesson-seven-form"><bdi>انِ</bdi></p>
        <p>تكون مثنى.</p>
        <p>مثال: <bdi>رمضان</bdi> ليست مثنى.</p>
        <p>ومثل: <bdi>عثمان</bdi> ليست مثنى.</p>
        <p>إذن لا يكفي أن ننظر إلى آخر الكلمة فقط.</p>
        <p>يجب أن يكون معناها يدل على اثنين وأن تكون صيغتها مستوفية لشروط التثنية.</p>
      </>
    )),
    step('plural-intro', '13. الآن ننتقل إلى الجمع', 'جمع المذكر السالم', '🧩', (
      <>
        <p>الجمع هو:</p>
        <Rule>ما دل على ثلاثة فأكثر.</Rule>
        <p>مثل:</p>
        <ChipRow items={['طلاب', 'معلمون', 'طالبات', 'كتب']} />
        <p>لكن الجمع ليس نوعًا واحدًا. لدينا أنواع مهمة، منها:</p>
        <ol className="numbered-list">
          <li>جمع المذكر السالم</li>
          <li>جمع المؤنث السالم</li>
          <li>جمع التكسير</li>
        </ol>
        <p>
          وسنتعلم اليوم النوعين الأول والثاني بالتفصيل، وسنعود إلى جمع التكسير في درس مستقل.
        </p>
      </>
    )),
    step('ms-plural-meaning', '14. لماذا يسمى "جمع المذكر السالم"؟', 'جمع المذكر السالم', '👥', (
      <>
        <p>لنقسم الاسم:</p>
        <div className="lesson-seven-breakdown">
          <div><strong>جمع</strong><span>يدل على ثلاثة فأكثر.</span></div>
          <div><strong>مذكر</strong><span>يدل على المذكر.</span></div>
          <div>
            <strong>سالم</strong>
            <span>لأن صورة المفرد تبقى سالمة إلى حد كبير، ولا تتغير بنية الكلمة الداخلية تغييرًا كبيرًا.</span>
          </div>
        </div>
        <p>مثال:</p>
        <TransformLine from="معلم" to="معلمون" note="لاحظ: معلم / معلمون. أضفنا في النهاية، وبقي أصل الكلمة واضحًا." />
        <p>مثال:</p>
        <TransformLine from="مهندس" to="مهندسون" />
        <TransformLine from="مجتهد" to="مجتهدون" />
      </>
    )),
    step('ms-plural-forms', '15. كيف نصوغ جمع المذكر السالم؟', 'جمع المذكر السالم', '✍️', (
      <>
        <div className="lesson-seven-two-column">
          <article>
            <h3>في حالة الرفع</h3>
            <p>نضيف واوًا ونونًا:</p>
            <p className="lesson-seven-form"><bdi>ـونَ</bdi></p>
            <ul className="check-list">
              <li><bdi>معلم ← معلمونَ</bdi></li>
              <li><bdi>مهندس ← مهندسونَ</bdi></li>
              <li><bdi>مجتهد ← مجتهدونَ</bdi></li>
            </ul>
          </article>
          <article>
            <h3>في النصب والجر</h3>
            <p>نضيف ياءً ونونًا:</p>
            <p className="lesson-seven-form"><bdi>ـينَ</bdi></p>
            <ul className="check-list">
              <li><bdi>معلم ← معلمينَ</bdi></li>
              <li><bdi>مهندس ← مهندسينَ</bdi></li>
              <li><bdi>مجتهد ← مجتهدينَ</bdi></li>
            </ul>
          </article>
        </div>
      </>
    )),
    step('ms-plural-rule', '16. قاعدة جمع المذكر السالم', 'جمع المذكر السالم', '⭐', (
      <>
        <p>احفظ:</p>
        <GoldenRule text="جمع المذكر السالم يُرفع بالواو، ويُنصب بالياء، ويُجر بالياء." />
        <p>إذن:</p>
        <div className="lesson-seven-triad">
          <div><strong>رفع</strong><Arrow /><bdi>واو</bdi></div>
          <div><strong>نصب</strong><Arrow /><bdi>ياء</bdi></div>
          <div><strong>جر</strong><Arrow /><bdi>ياء</bdi></div>
        </div>
      </>
    )),
    step('ms-plural-raf', '17. جمع المذكر السالم في حالة الرفع', 'جمع المذكر السالم', '⬆️', (
      <>
        <p>مثال:</p>
        <p className="lesson-seven-featured"><bdi>حضرَ المعلمونَ.</bdi></p>
        <p>
          <bdi>المعلمونَ</bdi>: فاعل. والفاعل مرفوع. لكن علامة رفعه ليست الضمة؛ لأنه جمع
          مذكر سالم. إذن:
        </p>
        <FullParsing lines={['المعلمونَ: فاعل مرفوع وعلامة رفعه الواو؛ لأنه جمع مذكر سالم.']} />
        <p>مثال آخر</p>
        <p className="lesson-seven-featured"><bdi>المهندسونَ ماهرونَ.</bdi></p>
        <p><bdi>المهندسونَ</bdi>: مبتدأ مرفوع بالواو. <bdi>ماهرونَ</bdi>: خبر مرفوع بالواو.</p>
      </>
    )),
    step('ms-plural-nasb', '18. جمع المذكر السالم في حالة النصب', 'جمع المذكر السالم', '⬇️', (
      <>
        <p>مثال:</p>
        <p className="lesson-seven-featured"><bdi>كرَّمَ المديرُ المعلمينَ.</bdi></p>
        <p><bdi>المعلمينَ</bdi>: مفعول به. والمفعول به منصوب. وعلامة نصبه: <strong>الياء</strong>؛ لأنه جمع مذكر سالم.</p>
        <p>الإعراب:</p>
        <FullParsing lines={['المعلمينَ: مفعول به منصوب وعلامة نصبه الياء؛ لأنه جمع مذكر سالم.']} />
      </>
    )),
    step('ms-plural-jarr', '19. جمع المذكر السالم في حالة الجر', 'جمع المذكر السالم', '↘️', (
      <>
        <p>مثال:</p>
        <p className="lesson-seven-featured"><bdi>سلَّمتُ على المعلمينَ.</bdi></p>
        <p><bdi>المعلمينَ</bdi>: اسم مجرور بـ <bdi>على</bdi>.</p>
        <p>وعلامة جره: <strong>الياء</strong>؛ لأنه جمع مذكر سالم.</p>
      </>
    )),
    step('ms-plural-table', '20. جدول جمع المذكر السالم', 'جمع المذكر السالم', '📊', (
      <>
        <div className="table-scroll">
          <table className="lesson-seven-table">
            <thead>
              <tr><th>الحالة</th><th>المثال</th><th>العلامة</th></tr>
            </thead>
            <tbody>
              <tr><th>الرفع</th><td><bdi>معلمونَ</bdi></td><td>الواو</td></tr>
              <tr><th>النصب</th><td><bdi>معلمينَ</bdi></td><td>الياء</td></tr>
              <tr><th>الجر</th><td><bdi>معلمينَ</bdi></td><td>الياء</td></tr>
            </tbody>
          </table>
        </div>
        <p>لاحظ التشابه: <strong>المثنى وجمع المذكر السالم</strong> كلاهما:</p>
        <ul className="check-list">
          <li>يُرفع بعلامة فرعية.</li>
          <li>يُنصب بالياء.</li>
          <li>يُجر بالياء.</li>
        </ul>
        <p>لكن: <strong>المثنى يُرفع بالألف.</strong> أما: <strong>جمع المذكر السالم فيُرفع بالواو.</strong></p>
      </>
    )),
    step('ms-plural-conditions', '21. هل كل اسم مذكر يمكن جمعه جمع مذكر سالم؟', 'جمع المذكر السالم', '🔔', (
      <>
        <p>لا.</p>
        <p>وهذه نقطة مهمة جدًا.</p>
        <p>
          لا يجوز أن نأخذ أي اسم مذكر ونضيف إليه <bdi>ون/ين</bdi> ونعتبره جمع مذكر سالمًا.
        </p>
        <p>هناك شروط وقواعد في جمع المذكر السالم، وسنتعلمها بالتفصيل.</p>
        <p>لكن في المستوى التأسيسي نركز على الأمثلة الواضحة، مثل:</p>
        <div className="lesson-seven-mapping">
          <MapRow from="معلم" to="معلمون" />
          <MapRow from="مهندس" to="مهندسون" />
          <MapRow from="مجتهد" to="مجتهدون" />
          <MapRow from="مسلم" to="مسلمون" />
          <MapRow from="صادق" to="صادقون" />
        </div>
      </>
    )),
    step('fs-plural-definition', '22. جمع المؤنث السالم', 'جمع المؤنث السالم', '🌸', (
      <>
        <p>الآن ننتقل إلى النوع الثاني.</p>
        <p>جمع المؤنث السالم هو:</p>
        <Rule>
          ما دل على ثلاثة فأكثر من المؤنث، مع بقاء مفرده سالمًا في الغالب، ويُصاغ غالبًا بزيادة
          ألف وتاء.
        </Rule>
        <p>مثال:</p>
        <div className="lesson-seven-mapping">
          <MapRow from="طالبة" to="طالبات" />
          <MapRow from="معلمة" to="معلمات" />
          <MapRow from="مهندسة" to="مهندسات" />
          <MapRow from="سيارة" to="سيارات" />
        </div>
      </>
    )),
    step('fs-plural-why', '23. لماذا يسمى "جمع المؤنث السالم"؟', 'جمع المؤنث السالم', '💬', (
      <>
        <p>لأنه:</p>
        <div className="lesson-seven-breakdown">
          <div><strong>جمع</strong><span>يدل على ثلاثة فأكثر.</span></div>
          <div><strong>مؤنث</strong><span>يدل على المؤنث.</span></div>
          <div><strong>سالم</strong><span>تبقى بنية المفرد الأساسية واضحة، وتُضاف غالبًا ألف وتاء.</span></div>
        </div>
        <p>مثال:</p>
        <div className="lesson-seven-mapping">
          <MapRow from="معلمة" to="معلمات" />
          <MapRow from="طالبة" to="طالبات" />
        </div>
      </>
    )),
    step('fs-plural-forms', '24. كيف نصوغ جمع المؤنث السالم؟', 'جمع المؤنث السالم', '✍️', (
      <>
        <p>في كثير من الأسماء المؤنثة التي تنتهي بـ <strong>ة</strong>:</p>
        <p>نحذف التاء المربوطة، ثم نضيف: <strong>ات</strong>.</p>
        <p>مثال:</p>
        <div className="lesson-seven-mapping">
          <MapRow from="طالبة" to="طالبات" />
          <MapRow from="معلمة" to="معلمات" />
          <MapRow from="مهندسة" to="مهندسات" />
          <MapRow from="كاتبة" to="كاتبات" />
        </div>
        <p>لاحظ:</p>
        <div className="lesson-seven-steps">
          <div><strong>طالبة</strong><span>نحذف <bdi>ة</bdi></span></div>
          <div><strong>طالب</strong><span>فتصبح</span></div>
          <div><strong>ات</strong><span>ثم نضيف</span></div>
          <div><strong>طالبات</strong><span>فتصبح</span></div>
        </div>
      </>
    )),
    step('fs-plural-irab', '25. إعراب جمع المؤنث السالم', 'جمع المؤنث السالم', '⭐', (
      <>
        <p>وهنا توجد قاعدة مهمة جدًا:</p>
        <GoldenRule text="جمع المؤنث السالم يُرفع بالضمة، ويُنصب بالكسرة، ويُجر بالكسرة." />
        <p>وهذه قاعدة يجب حفظها.</p>
        <p>لاحظ أنها مختلفة عن جمع المذكر السالم.</p>
      </>
    )),
    step('fs-plural-raf', '26. جمع المؤنث السالم في حالة الرفع', 'جمع المؤنث السالم', '⬆️', (
      <>
        <p>مثال:</p>
        <p className="lesson-seven-featured"><bdi>حضرتِ الطالباتُ.</bdi></p>
        <p><bdi>الطالباتُ</bdi>: فاعل. والفاعل مرفوع.</p>
        <p>وعلامة رفع جمع المؤنث السالم: <strong>الضمة</strong>.</p>
        <p>الإعراب:</p>
        <FullParsing
          lines={['الطالباتُ: فاعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره؛ لأنه جمع مؤنث سالم.']}
        />
      </>
    )),
    step('fs-plural-nasb', '27. جمع المؤنث السالم في حالة النصب', 'جمع المؤنث السالم', '⬇️', (
      <>
        <p>مثال:</p>
        <p className="lesson-seven-featured"><bdi>كرَّمتُ الطالباتِ.</bdi></p>
        <p><bdi>الطالباتِ</bdi>: مفعول به. إذن هي منصوبة. لكن علامة النصب ليست الفتحة؛ لأنها جمع مؤنث سالم.</p>
        <p>علامة نصبها: <strong>الكسرة نيابةً عن الفتحة</strong>.</p>
        <p>الإعراب:</p>
        <FullParsing
          lines={['الطالباتِ: مفعول به منصوب وعلامة نصبه الكسرة نيابةً عن الفتحة؛ لأنه جمع مؤنث سالم.']}
        />
      </>
    )),
    step('fs-plural-jarr', '28. جمع المؤنث السالم في حالة الجر', 'جمع المؤنث السالم', '↘️', (
      <>
        <p>مثال:</p>
        <p className="lesson-seven-featured"><bdi>سلَّمتُ على الطالباتِ.</bdi></p>
        <p><bdi>الطالباتِ</bdi>: اسم مجرور. وعلامة جره: <strong>الكسرة</strong>.</p>
      </>
    )),
    step('fs-plural-table', '29. جدول جمع المؤنث السالم', 'جمع المؤنث السالم', '📊', (
      <>
        <div className="table-scroll">
          <table className="lesson-seven-table">
            <thead>
              <tr><th>الحالة</th><th>المثال</th><th>العلامة</th></tr>
            </thead>
            <tbody>
              <tr><th>الرفع</th><td><bdi>طالباتُ</bdi></td><td>الضمة</td></tr>
              <tr><th>النصب</th><td><bdi>طالباتِ</bdi></td><td>الكسرة</td></tr>
              <tr><th>الجر</th><td><bdi>طالباتِ</bdi></td><td>الكسرة</td></tr>
            </tbody>
          </table>
        </div>
        <p>لاحظ شيئًا مهمًا:</p>
        <p>في النصب والجر قد تبدو الكلمة بالشكل نفسه: <bdi>الطالباتِ</bdi>.</p>
        <p>لذلك يجب أن نعرف موقعها في الجملة.</p>
      </>
    )),
    step('compare-three', '30. مقارنة الأنواع الثلاثة', 'المقارنة والتمييز', '⚖️', (
      <>
        <p>لدينا:</p>
        <div className="lesson-seven-mapping">
          <MapRow from="طالبانِ" to="مثنى" />
          <MapRow from="معلمونَ" to="جمع مذكر سالم" />
          <MapRow from="معلماتُ" to="جمع مؤنث سالم" />
        </div>
        <p>والعلامات:</p>
        <div className="lesson-seven-three-columns">
          <article>
            <h3>المثنى</h3>
            <p>رفع: <strong>الألف</strong></p>
            <p>نصب: <strong>الياء</strong></p>
            <p>جر: <strong>الياء</strong></p>
          </article>
          <article>
            <h3>جمع المذكر السالم</h3>
            <p>رفع: <strong>الواو</strong></p>
            <p>نصب: <strong>الياء</strong></p>
            <p>جر: <strong>الياء</strong></p>
          </article>
          <article>
            <h3>جمع المؤنث السالم</h3>
            <p>رفع: <strong>الضمة</strong></p>
            <p>نصب: <strong>الكسرة</strong></p>
            <p>جر: <strong>الكسرة</strong></p>
          </article>
        </div>
      </>
    )),
    step('master-table', '31. جدول الحفظ الأساسي', 'المقارنة والتمييز', '🗂️', (
      <>
        <div className="table-scroll">
          <table className="lesson-seven-table lesson-seven-table--flagship">
            <thead>
              <tr><th>النوع</th><th>الرفع</th><th>النصب</th><th>الجر</th></tr>
            </thead>
            <tbody>
              <tr className="is-dual">
                <th>المثنى</th><td>الألف</td><td>الياء</td><td>الياء</td>
              </tr>
              <tr className="is-masculine">
                <th>جمع المذكر السالم</th><td>الواو</td><td>الياء</td><td>الياء</td>
              </tr>
              <tr className="is-feminine">
                <th>جمع المؤنث السالم</th><td>الضمة</td><td>الكسرة</td><td>الكسرة</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p><strong>هذا الجدول من أهم جداول الكورس.</strong></p>
      </>
    )),
    step('by-proxy', '32. لماذا يسمى بعض الإعراب "بالنيابة"؟', 'المقارنة والتمييز', '🔁', (
      <>
        <p>في الأصل:</p>
        <p className="lesson-seven-form"><bdi>النصب ← الفتحة</bdi></p>
        <p>لكن في جمع المؤنث السالم:</p>
        <p className="lesson-seven-featured"><bdi>الطالباتِ</bdi></p>
        <p>هو منصوب، ومع ذلك ظهرت: <strong>الكسرة</strong>.</p>
        <p>فنقول: <strong>الكسرة نابت عن الفتحة.</strong> أي حلت محلها.</p>
        <p>لذلك نقول: <strong>علامة نصبه الكسرة نيابة عن الفتحة.</strong></p>
      </>
    )),
    step('vs-broken', '33. الفرق بين جمع المذكر السالم وجمع التكسير', 'المقارنة والتمييز', '🧱', (
      <>
        <p>قارن:</p>
        <TransformLine from="معلم" to="معلمون" note="بقيت بنية كلمة معلم واضحة. هذا: جمع مذكر سالم." />
        <p>أما:</p>
        <TransformLine from="كتاب" to="كتب" note="فالكلمة تغيرت من الداخل. هذا: جمع تكسير." />
        <p>مثال:</p>
        <div className="lesson-seven-mapping">
          <MapRow from="قلم" to="أقلام" />
          <MapRow from="رجل" to="رجال" />
          <MapRow from="مدينة" to="مدن" />
        </div>
        <p>هذه جموع تكسير.</p>
        <p>وسنخصص لها درسًا مستقلًا لأن لها أنواعًا وأوزانًا كثيرة.</p>
      </>
    )),
    step('not-shape-only', '34. لا تعتمد على الشكل وحده', 'المقارنة والتمييز', '👁️', (
      <>
        <p>ليس كل كلمة تنتهي بـ <strong>ون</strong> جمع مذكر سالم.</p>
        <p>مثل: <bdi>قانون</bdi> تنتهي بـ <bdi>ون</bdi>، لكنها ليست جمع مذكر سالمًا.</p>
        <p>وليس كل كلمة تنتهي بـ <strong>ات</strong> جمع مؤنث سالم.</p>
        <p>لذلك يجب أن ننظر إلى:</p>
        <ul className="check-list">
          <li>معنى الكلمة.</li>
          <li>مفردها.</li>
          <li>طريقة جمعها.</li>
          <li>بنيتها.</li>
          <li>موقعها في الجملة.</li>
        </ul>
      </>
    )),
    step('full-comparison', '35. مقارنة شاملة بأمثلة', 'المقارنة والتمييز', '📚', (
      <>
        <div className="lesson-seven-comparison">
          <article className="is-dual">
            <h3>المثنى</h3>
            <p><bdi>جاءَ الطالبانِ.</bdi> <span>رفع ← ألف.</span></p>
            <p><bdi>رأيتُ الطالبينِ.</bdi> <span>نصب ← ياء.</span></p>
            <p><bdi>مررتُ بالطالبينِ.</bdi> <span>جر ← ياء.</span></p>
          </article>
          <article className="is-masculine">
            <h3>جمع المذكر السالم</h3>
            <p><bdi>جاءَ المعلمونَ.</bdi> <span>رفع ← واو.</span></p>
            <p><bdi>كرَّمتُ المعلمينَ.</bdi> <span>نصب ← ياء.</span></p>
            <p><bdi>سلَّمتُ على المعلمينَ.</bdi> <span>جر ← ياء.</span></p>
          </article>
          <article className="is-feminine">
            <h3>جمع المؤنث السالم</h3>
            <p><bdi>حضرتِ المعلماتُ.</bdi> <span>رفع ← ضمة.</span></p>
            <p><bdi>كرَّمتُ المعلماتِ.</bdi> <span>نصب ← كسرة.</span></p>
            <p><bdi>سلَّمتُ على المعلماتِ.</bdi> <span>جر ← كسرة.</span></p>
          </article>
        </div>
      </>
    )),
    step('full-application', '36. تطبيق شامل', 'المقارنة والتمييز', '🧩', (
      <>
        <p>اقرأ:</p>
        <p className="lesson-seven-featured">
          <bdi>حضرَ الطالبانِ والمعلمونَ والطالباتُ إلى المدرسةِ.</bdi>
        </p>
        <p>لدينا:</p>
        <div className="lesson-seven-mapping">
          <MapRow from="الطالبانِ" to="مثنى" />
          <MapRow from="المعلمونَ" to="جمع مذكر سالم" />
          <MapRow from="الطالباتُ" to="جمع مؤنث سالم" />
          <MapRow from="المدرسةِ" to="اسم مفرد مجرور" />
        </div>
        <p>لماذا؟ لأنها جاءت بعد: <bdi>إلى</bdi>.</p>
      </>
    )),
    step('fast-check', '37. كيف نحدد النوع بسرعة؟', 'المقارنة والتمييز', '⚡', (
      <>
        <p>اسأل:</p>
        <div className="lesson-seven-decision">
          <p>هل يدل على اثنين؟ <strong>نعم ← غالبًا مثنى.</strong></p>
          <p>
            هل يدل على ثلاثة فأكثر من المذكر، وجاء على صيغة <bdi>ون/ين</bdi> وفق شروطه؟{' '}
            <strong>نعم ← قد يكون جمع مذكر سالم.</strong>
          </p>
          <p>
            هل يدل على ثلاثة فأكثر، وجاء على صيغة <bdi>ات</bdi> مع تحقق شروط الجمع؟{' '}
            <strong>قد يكون جمع مؤنث سالم.</strong>
          </p>
          <p>هل تغيرت بنية الكلمة من الداخل؟ <strong>غالبًا ← جمع تكسير.</strong></p>
        </div>
        <p>لكن يجب دائمًا التحقق من القاعدة، وليس الاعتماد على الشكل وحده.</p>
      </>
    )),
    step('warning-masculine', '38. تنبيه: جمع المذكر السالم ليس مجرد "مذكر + ون"', 'المقارنة والتمييز', '⚠️', (
      <>
        <p>هذه من أهم النقاط التي سنبني عليها لاحقًا.</p>
        <p>مثل: <bdi>معلم ← معلمون</bdi>.</p>
        <p>لكن لا نستطيع أن نقول إن كل اسم مذكر يصح جمعه بهذه الطريقة.</p>
        <p>بعض الأسماء لها جموع تكسير: <bdi>رجل ← رجال</bdi>، ولا نقول: <bdi>رجلون</bdi>.</p>
        <p>وبعض الأسماء لها أحكام خاصة.</p>
        <p>
          لذلك سندرس لاحقًا <strong>شروط جمع المذكر السالم بالتفصيل</strong>.
        </p>
      </>
    )),
    step('warning-feminine', '39. تنبيه: جمع المؤنث السالم أوسع من الكلمات المنتهية بتاء مربوطة', 'المقارنة والتمييز', '⚠️', (
      <>
        <p>الكلمات المنتهية بـ <strong>ة</strong> مثل: <bdi>طالبة ← طالبات</bdi> هي أوضح الأمثلة.</p>
        <p>
          لكن جمع المؤنث السالم له تفاصيل أخرى، وهناك كلمات مؤنثة لا تنتهي بتاء مربوطة ويمكن
          جمعها على صيغ مختلفة.
        </p>
        <p>
          لذلك سنعود لاحقًا إلى <strong>شروط جمع المؤنث السالم وما يلحق به</strong>.
        </p>
      </>
    )),
    step('idaafa-nun', '40. الإضافة وحذف النون', 'الإضافة وحذف النون', '🔗', (
      <>
        <p>كما رأينا:</p>
        <p className="lesson-seven-featured"><bdi>جاءَ طالبانِ.</bdi></p>
        <p>لكن:</p>
        <p className="lesson-seven-featured"><bdi>جاءَ طالبا المدرسةِ.</bdi></p>
        <p>والسبب أن المثنى إذا أُضيف تحذف نونه.</p>
        <p>وسنرى في جمع المذكر السالم أيضًا:</p>
        <p className="lesson-seven-featured"><bdi>جاءَ معلمونَ.</bdi></p>
        <p>لكن:</p>
        <p className="lesson-seven-featured"><bdi>جاءَ معلمو المدرسةِ.</bdi></p>
        <p>وفي النصب:</p>
        <p className="lesson-seven-featured"><bdi>رأيتُ معلمي المدرسةِ.</bdi></p>
        <p>
          هذه قاعدة مهمة جدًا، وسنربطها لاحقًا بدرس: <strong>المضاف والمضاف إليه</strong>.
        </p>
      </>
    )),
    step('lesson-summary', '41. خلاصة الدرس', 'خلاصة الدرس والملاحظات', '⭐', (
      <>
        <h3>المفرد</h3>
        <p>يدل على واحد أو واحدة. <bdi>طالب – طالبة</bdi></p>
        <h3>المثنى</h3>
        <p>يدل على اثنين أو اثنتين. <bdi>طالبان – طالبتان</bdi></p>
        <ul className="check-list">
          <li>يرفع بالألف.</li>
          <li>ينصب ويجر بالياء.</li>
        </ul>
        <h3>جمع المذكر السالم</h3>
        <p>يدل على ثلاثة فأكثر من المذكر وفق شروطه. <bdi>معلمون – معلمين</bdi></p>
        <ul className="check-list">
          <li>يرفع بالواو.</li>
          <li>ينصب ويجر بالياء.</li>
        </ul>
        <h3>جمع المؤنث السالم</h3>
        <p>يدل على ثلاثة فأكثر من المؤنث وفق شروطه. <bdi>معلمات</bdi></p>
        <ul className="check-list">
          <li>يرفع بالضمة.</li>
          <li>ينصب ويجر بالكسرة.</li>
        </ul>
        <h3>جمع التكسير</h3>
        <p>سنتعلمه بالتفصيل في درس مستقل. مثل: <bdi>كتاب ← كتب</bdi> و<bdi>قلم ← أقلام</bdi>.</p>
      </>
    )),
    step('memory-notes', 'ملاحظات مهمة يجب حفظها', 'خلاصة الدرس والملاحظات', '🧠', (
      <ol className="numbered-list lesson-seven-memory-list">
        <li>المفرد = واحد أو واحدة.</li>
        <li>المثنى = اثنان أو اثنتان.</li>
        <li>الجمع = ثلاثة فأكثر.</li>
        <li>المثنى يرفع بالألف.</li>
        <li>المثنى ينصب بالياء.</li>
        <li>المثنى يجر بالياء.</li>
        <li>جمع المذكر السالم يرفع بالواو.</li>
        <li>جمع المذكر السالم ينصب بالياء.</li>
        <li>جمع المذكر السالم يجر بالياء.</li>
        <li>جمع المؤنث السالم يرفع بالضمة.</li>
        <li>جمع المؤنث السالم ينصب بالكسرة.</li>
        <li>جمع المؤنث السالم يجر بالكسرة.</li>
        <li>ليس كل ما ينتهي بـ"ون" جمع مذكر سالم.</li>
        <li>ليس كل ما ينتهي بـ"ات" جمع مؤنث سالم.</li>
        <li>جمع التكسير له نظام مختلف وسندرسه لاحقًا.</li>
      </ol>
    )),
    step('worked-one-three', 'أمثلة محلولة: المثنى (1–3)', 'الأمثلة المحلولة', '💬', (
      <div className="lesson-seven-worked-list">
        <GuidedExample
          title="المثال الأول"
          sentence="جاءَ الطالبانِ."
          steps={['الطالبانِ: فاعل.', 'الفاعل مرفوع.', 'وهو مثنى.']}
          lines={['الطالبانِ: فاعل مرفوع وعلامة رفعه الألف؛ لأنه مثنى.']}
        />
        <GuidedExample
          title="المثال الثاني"
          sentence="رأيتُ الطالبينِ."
          steps={['الطالبينِ: مفعول به.', 'المفعول به منصوب.', 'وهو مثنى.']}
          lines={['الطالبينِ: مفعول به منصوب وعلامة نصبه الياء؛ لأنه مثنى.']}
        />
        <GuidedExample
          title="المثال الثالث"
          sentence="سلَّمتُ على الطالبينِ."
          steps={['الطالبينِ: اسم مجرور.', 'وهو مثنى.']}
          lines={['الطالبينِ: اسم مجرور بـ"على" وعلامة جره الياء؛ لأنه مثنى.']}
        />
      </div>
    )),
    step('worked-four-six', 'أمثلة محلولة: جمع المذكر السالم (4–6)', 'الأمثلة المحلولة', '💬', (
      <div className="lesson-seven-worked-list">
        <GuidedExample
          title="المثال الرابع"
          sentence="حضرَ المعلمونَ."
          steps={['المعلمونَ: فاعل مرفوع.', 'وهو جمع مذكر سالم.']}
          lines={['المعلمونَ: فاعل مرفوع وعلامة رفعه الواو؛ لأنه جمع مذكر سالم.']}
        />
        <GuidedExample
          title="المثال الخامس"
          sentence="رأيتُ المعلمينَ."
          steps={['المعلمينَ: مفعول به منصوب.', 'وهو جمع مذكر سالم.']}
          lines={['المعلمينَ: مفعول به منصوب وعلامة نصبه الياء؛ لأنه جمع مذكر سالم.']}
        />
        <GuidedExample
          title="المثال السادس"
          sentence="سلَّمتُ على المعلمينَ."
          steps={['المعلمينَ: اسم مجرور.', 'وعلامة جره: الياء؛ لأنه جمع مذكر سالم.']}
          lines={['المعلمينَ: اسم مجرور بـ"على" وعلامة جره الياء؛ لأنه جمع مذكر سالم.']}
        />
      </div>
    )),
    step('worked-seven-nine', 'أمثلة محلولة: جمع المؤنث السالم (7–9)', 'الأمثلة المحلولة', '💬', (
      <div className="lesson-seven-worked-list">
        <GuidedExample
          title="المثال السابع"
          sentence="حضرتِ المعلماتُ."
          steps={['المعلماتُ: فاعل مرفوع.', 'وهو جمع مؤنث سالم.']}
          lines={['المعلماتُ: فاعل مرفوع وعلامة رفعه الضمة.']}
        />
        <GuidedExample
          title="المثال الثامن"
          sentence="كرَّمتُ المعلماتِ."
          steps={['المعلماتِ: مفعول به منصوب.', 'وهو جمع مؤنث سالم.']}
          lines={['المعلماتِ: مفعول به منصوب وعلامة نصبه الكسرة نيابةً عن الفتحة.']}
        />
        <GuidedExample
          title="المثال التاسع"
          sentence="سلَّمتُ على المعلماتِ."
          steps={['المعلماتِ: اسم مجرور.', 'وعلامة جره: الكسرة.']}
          lines={['المعلماتِ: اسم مجرور بـ"على" وعلامة جره الكسرة.']}
        />
      </div>
    )),
    step('activity-one', 'النشاط الأول: حدد النوع', 'الأنشطة', '📝', (
      <ClassificationActivity
        id="lesson7-activity-one"
        title="النشاط الأول: حدد النوع"
        instruction="حدد هل الكلمة مفرد أم مثنى أم جمع:"
        items={activityOneItems}
        options={['مفرد', 'مثنى', 'جمع']}
      />
    )),
    step('activity-two', 'النشاط الثاني: حدد نوع الجمع', 'الأنشطة', '✅', (
      <ClassificationActivity
        id="lesson7-activity-two"
        title="النشاط الثاني: حدد نوع الجمع"
        instruction="حدد نوع الكلمة: جمع مذكر سالم أم جمع مؤنث سالم أم جمع تكسير:"
        items={activityTwoItems}
        options={['جمع مذكر سالم', 'جمع مؤنث سالم', 'جمع تكسير']}
      />
    )),
    step('activity-three', 'النشاط الثالث: حدد الحالة والعلامة', 'الأنشطة', '🔍', (
      <StateSignActivity />
    )),
    step('activity-four', 'النشاط الرابع: حوّل إلى المثنى', 'الأنشطة', '✍️', (
      <TransformActivity
        id="lesson7-activity-four"
        title="النشاط الرابع: حوّل"
        instruction="حوّل إلى المثنى، ثم استخدم كل كلمة في جملة مفيدة."
        items={activityFourItems}
      />
    )),
    step('activity-five', 'النشاط الخامس: حوّل إلى الجمع المناسب', 'الأنشطة', '✍️', (
      <TransformActivity
        id="lesson7-activity-five"
        title="النشاط الخامس: حوّل إلى الجمع المناسب"
        instruction="حوّل كل كلمة إلى الجمع المناسب، ثم ضع كل جمع في جملة."
        items={activityFiveItems}
      />
    )),
    step('final-test', 'رابعًا: اختبار نهاية الدرس', 'اختبار نهاية الدرس', '🏁', <FinalTest />),
    step('teacher', 'خامسًا: منطقة خاصة بالمعلم', 'منطقة المعلم', '🔐', <TeacherArea />),
    step('homework', 'واجب منزلي', 'الواجب والتحدي', '🏠', <Homework />),
    step('challenge', 'تحدي إضافي للطالب المتقدم', 'الواجب والتحدي', '🚀', <AdvancedChallenge />),
    step('one-page-summary', 'خلاصة الدرس في صفحة واحدة', 'الخلاصة النهائية', '🌟', <OnePageSummary />),
    step('golden-rules', 'قاعدة الحفظ الذهبية', 'الخلاصة النهائية', '🏆', <GoldenRules />),
  ]

  return (
    <LessonFlow
      steps={steps}
      onProgressChange={onProgressChange}
      onFinish={onFinish}
      lessonTitle="المثنى وجمع المذكر السالم وجمع المؤنث السالم"
      lessonNumber="٧"
      lessonEyebrow="الدرس السابع"
    />
  )
}

function step(
  id: string,
  title: string,
  group: string,
  icon: string,
  content: ReactNode,
): LessonStepDefinition {
  return {
    id,
    title,
    shortTitle: title,
    group,
    icon,
    description: 'تعلّم بالتدرج، ثم طبّق ما فهمته.',
    render: () => content,
  }
}

/** السهم المستعمل في تدفق القراءة العربية (من اليمين إلى اليسار). */
function Arrow() {
  return (
    <span className="lesson-seven-arrow" aria-hidden="true">
      ←
    </span>
  )
}

/**
 * يعرض نصًا من المصدر كما هو في البيانات، مع إظهار السهم باتجاه القراءة العربية
 * حتى لا يكسر الترتيب البصري في الاتجاه من اليمين إلى اليسار.
 */
function SourceText({ text }: { text: string }) {
  return <>{text.replace(/→/g, '←')}</>
}

function Rule({ children }: { children: ReactNode }) {
  return (
    <div className="lesson-seven-rule">
      <strong>قاعدة</strong>
      <p>{children}</p>
    </div>
  )
}

function GoldenRule({ text }: { text: string }) {
  return (
    <div className="lesson-seven-golden">
      <span aria-hidden="true">🏅</span>
      <p>
        <bdi>{text}</bdi>
      </p>
    </div>
  )
}

function ChipRow({ items }: { items: string[] }) {
  return (
    <div className="lesson-seven-chip-row">
      {items.map((item) => (
        <bdi key={item}>{item}</bdi>
      ))}
    </div>
  )
}

function MapRow({ from, to }: { from: string; to: string }) {
  return (
    <div className="lesson-seven-map-row">
      <bdi>{from}</bdi>
      <Arrow />
      <bdi className="lesson-seven-map-result">{to}</bdi>
    </div>
  )
}

function TransformLine({ from, to, note }: { from: string; to: string; note?: string }) {
  return (
    <div className="lesson-seven-transform-line">
      <p>
        <bdi>{from}</bdi> <Arrow /> <bdi>{to}</bdi>
      </p>
      {note && <small>{note}</small>}
    </div>
  )
}

function FullParsing({ lines }: { lines: string[] }) {
  return (
    <div className="lesson-seven-parsing" aria-label="إعراب كامل">
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  )
}

function GuidedExample({
  title,
  sentence,
  steps,
  lines,
}: {
  title: string
  sentence: string
  steps: string[]
  lines: string[]
}) {
  const [open, setOpen] = useState(false)
  return (
    <article className="lesson-seven-worked">
      <h3>{title}</h3>
      <p className="lesson-seven-featured">
        <bdi>{sentence}</bdi>
      </p>
      <ol className="lesson-seven-steps-list">
        {steps.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
      <button type="button" className="button button--ghost" onClick={() => setOpen((value) => !value)}>
        {open ? 'إخفاء الإعراب' : 'أظهر الإعراب الكامل'}
      </button>
      {open && <FullParsing lines={lines} />}
    </article>
  )
}

/* ------------------------------------------------------------------ *
 * مكوّنات الأنشطة التفاعلية
 * ------------------------------------------------------------------ */

function ClassificationActivity({
  id,
  title,
  instruction,
  items,
  options,
}: {
  id: string
  title: string
  instruction: string
  items: ClassificationItem[]
  options: string[]
}) {
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [checked, setChecked] = useState(false)
  const allAnswered = items.every((_, index) => answers[index])
  const score = items.filter((item, index) => answers[index] === item.answer).length

  return (
    <section className="lesson-seven-activity" data-testid={id}>
      <div className="lesson-seven-activity-heading">
        <span className="activity-number">{items.length}</span>
        <div>
          <h3>{title}</h3>
          <p>{instruction}</p>
        </div>
      </div>

      <div className="lesson-seven-activity-items">
        {items.map((item, index) => {
          const chosen = answers[index]
          return (
            <div className="lesson-seven-activity-row" key={item.prompt}>
              <p className="lesson-seven-activity-prompt">
                <bdi>
                  {index + 1}. {item.prompt}
                </bdi>
              </p>
              <div className="lesson-seven-choice-group" role="group" aria-label={`اختيار نوع كلمة ${item.prompt}`}>
                {options.map((option) => {
                  const isChosen = chosen === option
                  const isAnswer = checked && option === item.answer
                  const isWrong = checked && isChosen && option !== item.answer
                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={checked}
                      aria-pressed={isChosen}
                      className={`lesson-seven-choice ${isChosen ? 'is-selected' : ''} ${
                        isAnswer ? 'is-correct' : ''
                      } ${isWrong ? 'is-wrong' : ''}`}
                      onClick={() => setAnswers((current) => ({ ...current, [index]: option }))}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>
              {checked && chosen !== item.answer && (
                <p className="lesson-seven-feedback is-bad">الإجابة الصحيحة: {item.answer}</p>
              )}
            </div>
          )
        })}
      </div>

      <ActivityActions
        checked={checked}
        disabled={!allAnswered}
        score={`${score} / ${items.length}`}
        note={!allAnswered ? 'أجب عن جميع المطالب أولًا.' : undefined}
        onCheck={() => setChecked(true)}
        onReset={() => {
          setChecked(false)
          setAnswers({})
        }}
      />
    </section>
  )
}

function StateSignActivity() {
  const items = activityThreeItems
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState(false)
  const fieldCount = items.length * 2
  const correctFields = items.filter(
    (item, index) => answers[`${index}-state`] === item.state && answers[`${index}-sign`] === item.sign,
  ).length
  const allAnswered = items.every(
    (_, index) => answers[`${index}-state`] && answers[`${index}-sign`],
  )

  function setField(field: string, value: string) {
    setAnswers((current) => ({ ...current, [field]: value }))
  }

  return (
    <section className="lesson-seven-activity" data-testid="lesson7-activity-three">
      <div className="lesson-seven-activity-heading">
        <span className="activity-number">{items.length}</span>
        <div>
          <h3>النشاط الثالث: حدد الحالة والعلامة</h3>
          <p>حدد الحالة الإعرابية للكلمة المحددة وعلامة إعرابها في كل جملة.</p>
        </div>
      </div>

      <div className="lesson-seven-activity-items">
        {items.map((item, index) => (
          <div className="lesson-seven-activity-row" key={item.prompt}>
            <p className="lesson-seven-activity-prompt">
              <bdi>
                {index + 1}. <HighlightedSentence prompt={item.prompt} word={item.word} />
              </bdi>
            </p>
            <div className="lesson-seven-field-pair">
              <label htmlFor={`state-${index}`}>
                <span>الحالة الإعرابية</span>
                <select
                  id={`state-${index}`}
                  value={answers[`${index}-state`] ?? ''}
                  disabled={checked}
                  onChange={(event) => setField(`${index}-state`, event.target.value)}
                >
                  <option value="">اختر الحالة</option>
                  {stateChoices.map((choice) => (
                    <option key={choice} value={choice}>
                      {choice}
                    </option>
                  ))}
                </select>
              </label>
              <label htmlFor={`sign-${index}`}>
                <span>علامة الإعراب</span>
                <select
                  id={`sign-${index}`}
                  value={answers[`${index}-sign`] ?? ''}
                  disabled={checked}
                  onChange={(event) => setField(`${index}-sign`, event.target.value)}
                >
                  <option value="">اختر العلامة</option>
                  {signChoices.map((choice) => (
                    <option key={choice} value={choice}>
                      {choice}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {checked && (
              <p
                className={`lesson-seven-feedback ${
                  answers[`${index}-state`] === item.state && answers[`${index}-sign`] === item.sign
                    ? 'is-good'
                    : 'is-bad'
                }`}
              >
                {answers[`${index}-state`] === item.state && answers[`${index}-sign`] === item.sign
                  ? 'إجابة صحيحة.'
                  : `الإجابة الصحيحة: ${item.state}، وعلامة إعرابه ${item.sign}.`}
              </p>
            )}
          </div>
        ))}
      </div>

      <ActivityActions
        checked={checked}
        disabled={!allAnswered}
        score={`${correctFields} / ${items.length} جملًا كاملة (${fieldCount} حقلًا)`}
        note={!allAnswered ? 'أجب عن جميع المطالب أولًا.' : undefined}
        onCheck={() => setChecked(true)}
        onReset={() => {
          setChecked(false)
          setAnswers({})
        }}
      />
    </section>
  )
}

function TransformActivity({
  id,
  title,
  instruction,
  items,
}: {
  id: string
  title: string
  instruction: string
  items: TransformItem[]
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState(false)

  function correctTransform(index: number) {
    return normalize(answers[`${index}-transform`]) === normalize(items[index].answer)
  }

  return (
    <section className="lesson-seven-activity" data-testid={id}>
      <div className="lesson-seven-activity-heading">
        <span className="activity-number">{items.length}</span>
        <div>
          <h3>{title}</h3>
          <p>{instruction}</p>
        </div>
      </div>

      <div className="lesson-seven-activity-items">
        {items.map((item, index) => (
          <div className="lesson-seven-activity-row" key={item.prompt}>
            <p className="lesson-seven-activity-prompt">
              <bdi>
                {index + 1}. {item.prompt} <span aria-hidden="true">←</span> ______
              </bdi>
            </p>
            <label className="lesson-seven-transform-field" htmlFor={`${id}-transform-${index}`}>
              <span>صيغة التحويل</span>
              <input
                id={`${id}-transform-${index}`}
                value={answers[`${index}-transform`] ?? ''}
                disabled={checked}
                placeholder="اكتب الصيغة الصحيحة"
                onChange={(event) =>
                  setAnswers((current) => ({ ...current, [`${index}-transform`]: event.target.value }))
                }
              />
            </label>
            <label className="lesson-seven-transform-field" htmlFor={`${id}-sentence-${index}`}>
              <span>جملة مفيدة تستعمل فيها الصيغة</span>
              <textarea
                id={`${id}-sentence-${index}`}
                rows={2}
                value={answers[`${index}-sentence`] ?? ''}
                onChange={(event) =>
                  setAnswers((current) => ({ ...current, [`${index}-sentence`]: event.target.value }))
                }
                placeholder="اكتب جملة مفيدة"
              />
            </label>
            {checked && (
              <div className="lesson-seven-feedback is-good">
                <p>{correctTransform(index) ? 'التحويل صحيح.' : `الإجابة الصحيحة: ${item.answer}`}</p>
                <p>
                  {normalize(answers[`${index}-sentence`]).includes(normalize(item.answer))
                    ? `جملة موفقة تحتوي الصيغة الصحيحة. ومثال صحيح: ${item.model}`
                    : `اجعل الجملة تحتوي الصيغة الصحيحة. ومثال صحيح: ${item.model}`}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <ActivityActions
        checked={checked}
        disabled={false}
        score={`${items.filter((_, index) => correctTransform(index)).length} / ${items.length} تحويلات صحيحة`}
        onCheck={() => setChecked(true)}
        onReset={() => {
          setChecked(false)
          setAnswers({})
        }}
      />
    </section>
  )
}

function HighlightedSentence({ prompt, word }: { prompt: string; word: string }) {
  const parts = prompt.split(word)
  if (parts.length < 2) return <>{prompt}</>
  return (
    <>
      {parts[0]}
      <strong>{word}</strong>
      {parts.slice(1).join(word)}
    </>
  )
}

function ActivityActions({
  checked,
  disabled,
  score,
  note,
  onCheck,
  onReset,
}: {
  checked: boolean
  disabled: boolean
  score: string
  note?: string
  onCheck: () => void
  onReset: () => void
}) {
  return (
    <div className="lesson-seven-activity-actions">
      {!checked ? (
        <>
          <button type="button" className="button button--primary" disabled={disabled} onClick={onCheck}>
            تحقق من النشاط
          </button>
          {note && <p>{note}</p>}
        </>
      ) : (
        <>
          <p className="lesson-seven-score" role="status">
            النتيجة: <bdi>{score}</bdi>
          </p>
          <button type="button" className="button button--secondary" onClick={onReset}>
            أعد المحاولة
          </button>
        </>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * اختبار نهاية الدرس — 25 سؤالًا رسميًا، بلا تغذية راجعة قبل التسليم
 * ------------------------------------------------------------------ */

function FinalTest() {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  function setAnswer(key: string, value: string) {
    setAnswers((current) => ({ ...current, [key]: value }))
  }

  const objectiveNumbers = Object.keys(objectiveAnswers).map(Number)
  const unansweredObjective = objectiveNumbers.filter((number) => !answers[`${number}`])
  const objectiveScore = objectiveNumbers.filter(
    (number) => normalize(answers[`${number}`]) === normalize(objectiveAnswers[number]),
  ).length

  return (
    <section className="official-test lesson-seven-test" data-testid="lesson7-official-test">
      <div className="official-test__intro">
        <strong>اختبار نهاية الدرس</strong>
        <span>٢٥ سؤالًا</span>
        <p>
          أجب عن الأسئلة الخمسة والعشرين كاملة، مع المحافظة على الفئات والترقيم الرسمي. لا تظهر
          النتيجة ولا الإجابات النموذجية إلا بعد تسليم الاختبار.
        </p>
      </div>

      <div className="official-test__groups">
        {finalTestQuestions.map((question, index) => {
          const showHeading = index === 0 || finalTestQuestions[index - 1].section !== question.section
          return (
            <div key={question.number}>
              {showHeading && <h3>{question.section}</h3>}
              <fieldset className="official-question" data-question-number={question.number} disabled={submitted}>
                <legend>
                  <span className="question-number">السؤال {question.number}</span> {question.prompt}
                </legend>

                {question.options ? (
                  <div className="official-options">
                    {question.options.map((option) => (
                      <label key={option}>
                        <input
                          type="radio"
                          name={`lesson7-question-${question.number}`}
                          value={option}
                          checked={answers[`${question.number}`] === option}
                          onChange={() => setAnswer(`${question.number}`, option)}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                ) : question.parts ? (
                  <div className="lesson-seven-test-parts">
                    {question.parts.map((part, partIndex) => (
                      <label key={part} htmlFor={`lesson7-q${question.number}-part${partIndex}`}>
                        <span><SourceText text={part} /></span>
                        <input
                          id={`lesson7-q${question.number}-part${partIndex}`}
                          value={answers[`${question.number}#${partIndex}`] ?? ''}
                          onChange={(event) => setAnswer(`${question.number}#${partIndex}`, event.target.value)}
                          placeholder="اكتب إجابتك"
                        />
                      </label>
                    ))}
                  </div>
                ) : (
                  <textarea
                    rows={3}
                    value={answers[`${question.number}`] ?? ''}
                    onChange={(event) => setAnswer(`${question.number}`, event.target.value)}
                    aria-label={`إجابة السؤال ${question.number}`}
                    placeholder="اكتب إجابتك هنا"
                  />
                )}

                {submitted && (
                  <div className="lesson-seven-feedback is-good">
                    <strong>الإجابة النموذجية</strong>
                    <p><SourceText text={question.answer} /></p>
                  </div>
                )}
              </fieldset>
            </div>
          )
        })}
      </div>

      <div className="official-test__actions">
        {!submitted ? (
          <>
            <button type="button" className="button button--primary" onClick={() => setSubmitted(true)}>
              تسليم الاختبار
            </button>
            {unansweredObjective.length > 0 && (
              <p>لم تجب بعد عن {unansweredObjective.length} من الأسئلة الموضوعية (1–15).</p>
            )}
          </>
        ) : (
          <>
            <p className="official-test__result" role="status">
              النتيجة الموضوعية: <bdi>{objectiveScore} / 15</bdi> من أسئلة الاختيار وصح أم خطأ، وراجع
              الإجابات النموذجية للأسئلة المفتوحة مع معلمك.
            </p>
            <button
              type="button"
              className="button button--secondary"
              onClick={() => {
                setSubmitted(false)
                setAnswers({})
              }}
            >
              أعد الاختبار
            </button>
          </>
        )}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ *
 * منطقة المعلم — إجابات كاملة ومطابقة للمصدر
 * ------------------------------------------------------------------ */

/** الإعراب الكامل للأسئلة التي يطلب المصدر إعرابها (16–18 و21–23). */
const parsingAnswerLines: Record<number, string[]> = {
  16: ['الطالبانِ: فاعل مرفوع وعلامة رفعه الألف؛ لأنه مثنى.'],
  17: ['المعلمينَ: مفعول به منصوب وعلامة نصبه الياء؛ لأنه جمع مذكر سالم.'],
  18: ['الطالباتُ: فاعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره.'],
  21: ['الطالبانِ: فاعل مرفوع وعلامة رفعه الألف؛ لأنه مثنى.'],
  22: ['المعلمينَ: مفعول به منصوب وعلامة نصبه الياء؛ لأنه جمع مذكر سالم.'],
  23: ['الطالباتِ: اسم مجرور بـ"على"، وعلامة جره الكسرة الظاهرة على آخره.'],
}

function TeacherArea() {
  return (
    <TeacherSpace>
      <div className="teacher-material teacher-material--lesson7">
        <h3>إجابات النشاط التطبيقي</h3>

        <h4>النشاط الأول: حدد النوع (١٠ مطالب)</h4>
        <ol>
          {activityOneItems.map((item) => (
            <li key={item.prompt}>
              <bdi>{item.prompt}</bdi> ← <strong>{item.answer}</strong>
            </li>
          ))}
        </ol>

        <h4>النشاط الثاني: حدد نوع الجمع (٨ مطالب)</h4>
        <ol>
          {activityTwoItems.map((item) => (
            <li key={item.prompt}>
              <bdi>{item.prompt}</bdi> ← <strong>{item.answer}</strong>
            </li>
          ))}
        </ol>

        <h4>النشاط الثالث: حدد الحالة والعلامة (٩ مطالب)</h4>
        <ol>
          {activityThreeItems.map((item) => (
            <li key={item.prompt}>
              <bdi>{item.word}</bdi> ← <strong>{item.state}</strong>، وعلامة إعرابه{' '}
              <strong>{item.sign}</strong>.
            </li>
          ))}
        </ol>

        <h4>النشاط الرابع: حوّل إلى المثنى (٥ مطالب)</h4>
        <p>أمثلة صحيحة:</p>
        <ol>
          {activityFourItems.map((item) => (
            <li key={item.prompt}>
              <bdi>
                {item.prompt} ← {item.answer}
              </bdi>
              ، ثم استخدامها في جملة مثل: <bdi>{item.model}</bdi>
            </li>
          ))}
        </ol>

        <h4>النشاط الخامس: حوّل إلى الجمع المناسب (٥ مطالب)</h4>
        <ol>
          {activityFiveItems.map((item) => (
            <li key={item.prompt}>
              <bdi>
                {item.prompt} ← {item.answer}
              </bdi>
              ، ثم استخدامه في جملة مثل: <bdi>{item.model}</bdi>
            </li>
          ))}
        </ol>

        <h3>الإجابات النموذجية لاختبار نهاية الدرس</h3>
        <ol>
          {finalTestQuestions.map((question) => (
            <li key={question.number}>
              <strong>{question.number}.</strong> <SourceText text={question.answer} />
              {(parsingAnswerLines[question.number] ?? []).map((line) => (
                <FullParsing key={line} lines={[line]} />
              ))}
            </li>
          ))}
        </ol>

        <h3>ملاحظات متقدمة للمعلم</h3>

        <h4>1. لا تختصر درس المثنى بقاعدة "ان/ين"</h4>
        <p>
          الهدف أن يفهم الطالب أن <strong>الألف والنون</strong> و<strong>الياء والنون</strong> علامات
          للمثنى في حالات معينة، وليست مجرد نهاية شكلية.
        </p>
        <p>
          فمثلًا: <bdi>طالبانِ</bdi> مثنى مرفوع، و<bdi>طالبينِ</bdi> قد يكون مثنى منصوبًا أو مجرورًا.
        </p>
        <p>لذلك يجب ربط الشكل بالموقع الإعرابي.</p>

        <h4>2. فرّق بين المثنى وجمع المذكر السالم</h4>
        <p>هذه نقطة يكثر فيها الخطأ.</p>
        <p>
          المثنى يدل على: <strong>اثنين فقط</strong>، مثل: <bdi>طالبان</bdi>.
        </p>
        <p>
          جمع المذكر السالم يدل على: <strong>ثلاثة فأكثر</strong>، مثل: <bdi>طالبون</bdi>.
        </p>

        <h4>3. لا تجعل الطالب يحفظ "جمع المذكر = ون/ين" فقط</h4>
        <p>هذا جيد كبداية، لكنه ليس كافيًا للكورس المتقدم.</p>
        <p>سنعود لاحقًا إلى:</p>
        <ul>
          <li>شروط جمع المذكر السالم.</li>
          <li>ما يجمع جمع مذكر سالمًا.</li>
          <li>ما لا يجمع كذلك.</li>
          <li>ما يلحق بجمع المذكر السالم.</li>
          <li>إعرابه.</li>
          <li>حذف النون عند الإضافة.</li>
        </ul>

        <h4>4. جمع المؤنث السالم يحتاج إلى درس متقدم لاحقًا</h4>
        <p>في هذا الدرس أخذنا القاعدة الأساسية.</p>
        <p>لكن سنعود لاحقًا إلى:</p>
        <ul>
          <li>شروط جمع المؤنث السالم.</li>
          <li>الأسماء التي تُجمع بالألف والتاء.</li>
          <li>ما يلحق به.</li>
          <li>ما يُعامل معاملة جمع المؤنث السالم.</li>
          <li>أحكام التاء المربوطة عند الجمع.</li>
          <li>الإعراب بالتفصيل.</li>
        </ul>

        <h4>5. لا تهمل جمع التكسير</h4>
        <p>جمع التكسير مهم جدًا في العربية، وهو ليس مجرد نوع ثانوي.</p>
        <p>سنخصص له درسًا مستقلًا لاحقًا، وسندرس فيه:</p>
        <ul>
          <li>جمع القلة.</li>
          <li>جمع الكثرة.</li>
          <li>أوزان جمع القلة.</li>
          <li>أوزان جمع الكثرة.</li>
        </ul>
        <p>
          مع أمثلة مثل: <bdi>قلم ← أقلام</bdi>، <bdi>كتاب ← كتب</bdi>، <bdi>رجل ← رجال</bdi>،
          وغيرها.
        </p>

        <h3>أخطاء متوقعة من الطالب</h3>
        <div className="lesson-seven-corrections">
          <CorrectionPair
            label="الخطأ الأول"
            bad="رأيتُ الطالبانِ."
            good="رأيتُ الطالبينِ."
            reason="لأن المثنى منصوب بالياء."
          />
          <CorrectionPair
            label="الخطأ الثاني"
            bad="جاءَ المعلمينَ."
            good="جاءَ المعلمونَ."
            reason="لأن جمع المذكر السالم مرفوع بالواو."
          />
          <CorrectionPair
            label="الخطأ الثالث"
            bad="رأيتُ المعلمونَ."
            good="رأيتُ المعلمينَ."
            reason="لأن جمع المذكر السالم منصوب بالياء."
          />
          <CorrectionPair
            label="الخطأ الرابع"
            bad="كرمتُ الطالباتُ."
            good="كرمتُ الطالباتِ."
            reason="لأن جمع المؤنث السالم منصوب بالكسرة."
          />
          <CorrectionPair
            label="الخطأ الخامس"
            bad="جاءتِ الطالباتِ."
            good="جاءتِ الطالباتُ."
            reason="لأنها فاعل مرفوع بالضمة."
          />
        </div>
      </div>
    </TeacherSpace>
  )
}

function CorrectionPair({
  label,
  bad,
  good,
  reason,
}: {
  label: string
  bad: string
  good: string
  reason: string
}) {
  return (
    <article className="lesson-seven-correction">
      <h4 className="lesson-seven-correction-label">{label}</h4>
      <p>
        ❌ <del><bdi>{bad}</bdi></del>
      </p>
      <p>
        الصحيح: ✅ <strong><bdi>{good}</bdi></strong>
      </p>
      <p className="lesson-seven-correction-reason">{reason}</p>
    </article>
  )
}

/* ------------------------------------------------------------------ *
 * الواجب المنزلي، التحدي الإضافي، والخلاصة النهائية
 * ------------------------------------------------------------------ */

function Homework() {
  return (
    <EducationalCard title="واجب منزلي" eyebrow="تدريب بعد الدرس" tone="soft">
      <h3>أولًا: صنّف الكلمات</h3>
      <p>
        صنّف الكلمات الآتية إلى: <strong>مفرد – مثنى – جمع مذكر سالم – جمع مؤنث سالم – جمع تكسير</strong>
      </p>
      <ol className="numbered-list">
        <li>طالب</li>
        <li>طالبان</li>
        <li>معلمون</li>
        <li>معلمات</li>
        <li>كتب</li>
        <li>مهندسين</li>
        <li>شجرتان</li>
        <li>أقلام</li>
        <li>طبيبات</li>
        <li>مهندس</li>
      </ol>

      <h3>ثانيًا: أعرب الكلمات المحددة</h3>
      <ol className="numbered-list">
        <li>حضرَ <strong>الطالبانِ</strong>.</li>
        <li>رأيتُ <strong>الطالبينِ</strong>.</li>
        <li>سلَّمتُ على <strong>المعلمينَ</strong>.</li>
        <li><strong>المعلماتُ</strong> مجتهداتٌ.</li>
        <li>كرَّمتُ <strong>الطالباتِ</strong>.</li>
      </ol>

      <h3>ثالثًا: حوّل</h3>
      <ul className="check-list">
        <li><bdi>طالب ← مثنى</bdi></li>
        <li><bdi>طالب ← جمع مذكر سالم</bdi></li>
        <li><bdi>طالبة ← مثنى</bdi></li>
        <li><bdi>طالبة ← جمع مؤنث سالم</bdi></li>
      </ul>
      <p>ثم استخدم كل كلمة في جملة.</p>
    </EducationalCard>
  )
}

function AdvancedChallenge() {
  return (
    <EducationalCard title="تحدي إضافي للطالب المتقدم" eyebrow="اختياري للمتميزين" tone="accent">
      <p>اقرأ:</p>
      <p className="lesson-seven-featured">
        <bdi>جاءَ طالبانِ، ورأيتُ طالبينِ آخرينِ، ثم سلَّمتُ على المعلمينَ والمعلماتِ.</bdi>
      </p>
      <p>استخرج:</p>
      <ol className="numbered-list">
        <li>مثنى مرفوعًا.</li>
        <li>مثنى منصوبًا.</li>
        <li>جمع مذكر سالمًا.</li>
        <li>جمع مؤنث سالمًا.</li>
        <li>اسمًا مجرورًا.</li>
        <li>اذكر علامة إعراب كل واحد.</li>
      </ol>
    </EducationalCard>
  )
}

function OnePageSummary() {
  return (
    <>
      <div className="lesson-seven-summary-grid">
        <article>
          <h3>المفرد</h3>
          <p><strong>واحد أو واحدة</strong></p>
          <p><bdi>طالب – طالبة</bdi></p>
        </article>
        <article className="is-dual">
          <h3>المثنى</h3>
          <p><strong>اثنان أو اثنتان</strong></p>
          <p>رفع: <bdi>طالبانِ ← الألف</bdi></p>
          <p>نصب: <bdi>طالبينِ ← الياء</bdi></p>
          <p>جر: <bdi>طالبينِ ← الياء</bdi></p>
        </article>
        <article className="is-masculine">
          <h3>جمع المذكر السالم</h3>
          <p><strong>ثلاثة فأكثر من المذكر وفق شروطه</strong></p>
          <p>رفع: <bdi>معلمونَ ← الواو</bdi></p>
          <p>نصب: <bdi>معلمينَ ← الياء</bdi></p>
          <p>جر: <bdi>معلمينَ ← الياء</bdi></p>
        </article>
        <article className="is-feminine">
          <h3>جمع المؤنث السالم</h3>
          <p><strong>ثلاثة فأكثر من المؤنث وفق شروطه</strong></p>
          <p>رفع: <bdi>معلماتُ ← الضمة</bdi></p>
          <p>نصب: <bdi>معلماتِ ← الكسرة</bdi></p>
          <p>جر: <bdi>معلماتِ ← الكسرة</bdi></p>
        </article>
      </div>
    </>
  )
}

function GoldenRules() {
  const rules = [
    'المثنى: ألف في الرفع، ياء في النصب والجر.',
    'جمع المذكر السالم: واو في الرفع، ياء في النصب والجر.',
    'جمع المؤنث السالم: ضمة في الرفع، كسرة في النصب والجر.',
    'وجمع التكسير سنأخذه في درس مستقل.',
  ]
  return (
    <EducationalCard title="قاعدة الحفظ الذهبية" eyebrow="الخلاصة النهائية" tone="accent">
      <div className="lesson-seven-golden-list">
        {rules.map((rule) => (
          <p key={rule}>
            <span aria-hidden="true">🏅</span> <bdi>{rule}</bdi>
          </p>
        ))}
      </div>
    </EducationalCard>
  )
}

function normalize(value: string | undefined) {
  return (value ?? '').replace(/[ًٌٍَُِّْـ]/g, '').replace(/\s+/g, '').trim()
}
