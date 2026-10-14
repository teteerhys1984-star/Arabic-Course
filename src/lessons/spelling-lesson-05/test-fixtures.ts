/**
 * مفاتيح مستقلة مكتوبة يدويًا (لا تُشتق من content.ts) حتى لا يكون الاختبار دائريًا.
 * أي تغيير في مفتاح المحتوى يجب أن يقابله تغيير مقصود هنا.
 */
export const EXAM_ANSWERS: Record<string, string[]> = {
  'spell5-q01:0': ['القاضي'],
  'spell5-q02:0': ['سنا'],
  'spell5-q03:0': ['لأنها تُنطق ألفًا ولا تقبل الحركة، فهي ألف لينة رُسمت بصورة الياء'],
  'spell5-q04:0': ['اسم مبني رسمه محفوظ بالياء'],
  'spell5-q05:0': ['حتى', 'مستوى', 'صُغرى'],
  'spell5-q06:0': ['مَدَيان'],
  'spell5-q07:0': ['هَوَيان (المثنى)'],
  'spell5-q08:0': ['منتدى'],
  'spell5-q09:0': ['زوايا'],
  'spell5-q10:0': ['لأن الاستثناء خاص بالياء وحدها؛ والواو ليست ياءً، فتبقى القاعدة العامة: ى'],
  'spell5-q11:0': ['يعفو'],
  'spell5-q12:0': ['نَهَيْتُ'],
  'spell5-q13:0': ['اشترى'],
  'spell5-q14:0': ['يحيا'],
  'spell5-q15:0': ['حتى'],
  'spell5-q16:0': ['دعا'],
  'spell5-q17:0': ['ذكرى'],
  'spell5-q18:0': ['جلستُ علا الكرسي'],
  'spell5-q19:0': ['لأن الألف جاوزت الثالثة، فالقاعدة العامة ى ولا ننظر إلى الأصل'],
  'spell5-q20:0': ['أحدد نوع الكلمة، ثم عدد أحرفها، ثم أطبق القاعدة المناسبة وأتحقق بصيغة كاشفة أو بالمعجم'],
}

export const EXPECTED_LEVELS: Record<string, number> = {
  'تمييز': 4,
  'كشف الأصل': 4,
  'تطبيق': 4,
  'تعليل': 4,
  'تصحيح': 4,
}

export const ORIGINAL_ANSWERS: Record<string, string[]> = {
  'spell5-of1:0': ['عصا'],
  'spell5-of2:0': ['الفتى'],
  'spell5-of3:0': ['سعى'],
  'spell5-of4:0': ['مستشفى'],
  'spell5-of5:0': ['أحيا'],
  'spell5-of6:0': ['إلى'],
  'spell5-of7:0': ['يدعو'],
  'spell5-of7:1': ['واو'],
  'spell5-of8:0': ['«ى» في «فتى» ألف مقصورة تُنطق ألفًا ولا تقبل الحركة، و«ي» في «كرسي» ياء حقيقية تُنطق ياءً وتقبل الحركة'],
}

export const PRACTICE_KEYS: Record<string, string> = {
  p1: 'فتى', p2: 'رمى', p3: 'مصطفى', p4: 'أحيا', p5: 'إلى', p6: 'يدعو', p7: 'غالبًا ألف مقصورة',
}

export const GLYPH_KEYS: Record<string, string> = {
  'g-fata': 'ألف مقصورة', 'g-kursi': 'ياء', 'g-asa': 'ألف قائمة', 'g-ramy': 'ياء',
  'g-mustashfa': 'ألف مقصورة', 'g-nadi': 'ياء', 'g-dunya': 'ألف قائمة', 'g-ala': 'ألف مقصورة',
}

export const NOUN_ORIGIN_KEYS: Record<string, string[]> = {
  asa: ['عَصَوان', 'و', 'ا'],
  fata: ['فَتَيان', 'ي', 'ى'],
  qafa: ['قَفَوان', 'و', 'ا'],
  raha: ['رَحَيان', 'ي', 'ى'],
  nada: ['نَدِيّ', 'ي', 'ى'],
}

export const VERB_KEYS: Record<string, string[]> = {
  daa: ['يدعو', 'و', 'ا'],
  rama: ['يرمي', 'ي', 'ى'],
  sama: ['يسمو', 'و', 'ا'],
  masha: ['يمشي', 'ي', 'ى'],
  ghaza: ['يغزو', 'و', 'ا'],
  qada: ['يقضي', 'ي', 'ى'],
  bana: ['يبني', 'ي', 'ى'],
  saa: ['يسعى', 'لا يكشف', 'سَعَيْتُ', 'ى'],
}

export const NOUN_SORT_KEYS: Record<string, string> = {
  malha: 'ى', baqaya: 'ا', marma: 'ى', khataya: 'ا', dawa: 'ى', mabna: 'ى',
}

export const PARTICLE_KEYS: Record<string, string> = {
  la: 'ا', ma: 'ا', ya: 'ا', ila: 'ى', ala: 'ى', hatta: 'ى', bala: 'ى', mata: 'ى', anna: 'ى', lada: 'ى', idha: 'ا',
}

export const TREE_KEYS: Record<string, string> = {
  mustashfa: 'ى', daa: 'ا', hatta: 'ى', ulya: 'ا', fata: 'ى', istadaa: 'ى', ahya: 'ا', dhikra: 'ى',
}

export const ERROR_KEYS: Record<string, string> = {
  saa: 'سعى', ihtada: 'اهتدى', hadaya: 'هدايا', asa: 'عصا', lada: 'لدى',
}

export const EXPLAIN_KEYS: Record<string, string> = {
  sama: 'سما', multaqa: 'ملتقى', raaya: 'رعايا', ila: 'إلى', irtada: 'ارتضى', raha: 'رحى',
}

export const CUMULATIVE_KEYS: Record<string, string> = {
  'c-qada': 'قضى', 'c-maqha': 'مقهى', 'c-ghaza': 'غزا', 'c-dunya': 'الدنيا',
  'c-sada': 'صدى', 'c-aya': 'أعيا', 'c-mata': 'متى', 'c-istawla': 'استولى',
}
