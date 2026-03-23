const EXACT_TITLE_MAP: Record<string, string> = {
  'Addition Basics': 'Qo‘shish asoslari',
  'Subtraction Basics': 'Ayirish asoslari',
  'Fractions Basics': 'Kasrlar asoslari',
  'Geometry Basics': 'Geometriya asoslari',
  'What Are Kasrlar?': 'Kasrlar nima?',
  'What Are Fractions?': 'Kasrlar nima?',
  'Adding Single Digits': 'Bir xonali sonlarni qo‘shish',
  'Shapes All Around': 'Atrofdagi shakllar',
  'Shakllar All Around': 'Atrofdagi shakllar',
  'Subtracting Single Digits': 'Bir xonali sonlarni ayirish',
  Perimeter: 'Perimetr',
  'Comparing Kasrlar': 'Kasrlarni solishtirish',
  'Comparing Fractions': 'Kasrlarni solishtirish',
  'Adding Double Digits': 'Ikki xonali sonlarni qo‘shish',
  'Adding Triple Digits': 'Uch xonali sonlarni qo‘shish',
  'Addition Word Problems': 'Qo‘shish matnli masalalari',
  "Qo'shish Word Problems": 'Qo‘shish matnli masalalari',
  'Speed Addition Quiz': 'Tezkor qo‘shish testi',
  "Speed Qo'shish Quiz": 'Tezkor qo‘shish testi',
};

const EXACT_DESCRIPTION_MAP: Record<string, string> = {
  'Learn the basics of addition': 'Qo‘shishning asosiy qoidalarini o‘rganing',
  'Learn the basics of subtraction': 'Ayirishning asosiy qoidalarini o‘rganing',
  'Learn the basics of fractions': 'Kasrlarning asosiy tushunchalarini o‘rganing',
  'Learn the basics of geometry': 'Geometriyaning asosiy tushunchalarini o‘rganing',
  'Learning about parts of a whole': 'Butunning qismlari haqida o‘rganing',
  'Add numbers from 1 to 9': '1 dan 9 gacha bo‘lgan sonlarni qo‘shing',
  'Identify basic Shakllar': 'Asosiy shakllarni tanlang',
  'Identify basic shapes': 'Asosiy shakllarni tanlang',
  'Subtract numbers from 1 to 9': '1 dan 9 gacha bo‘lgan sonlarni ayiring',
  'Measure around Shakllar': 'Shakllar atrofini o‘lchang',
  'Measure around shapes': 'Shakllar atrofini o‘lchang',
  'Which fraction is bigger?': 'Qaysi kasr kattaroq?',
};

const tokenReplace = (text: string): string => {
  return text
    .replace(/\bWhat Are\s+(.+?)\?$/i, (_, x: string) => {
      const rest = x.trim();
      if (/^kasrlar$/i.test(rest) || /^fractions?$/i.test(rest)) return 'Kasrlar nima?';
      if (/^shakllar$/i.test(rest) || /^shapes?$/i.test(rest)) return 'Shakllar nima?';
      return `${rest} nima?`;
    })
    .replace(/\bAdding Single Digits\b/gi, 'Bir xonali sonlarni qo‘shish')
    .replace(/\bAdding Double Digits\b/gi, 'Ikki xonali sonlarni qo‘shish')
    .replace(/\bAdding Triple Digits\b/gi, 'Uch xonali sonlarni qo‘shish')
    .replace(/\bSubtracting Single Digits\b/gi, 'Bir xonali sonlarni ayirish')
    .replace(/\bSubtracting Double Digits\b/gi, 'Ikki xonali sonlarni ayirish')
    .replace(/\bSubtracting Triple Digits\b/gi, 'Uch xonali sonlarni ayirish')
    .replace(/\bAddition Word Problems\b/gi, 'Qo‘shish matnli masalalari')
    .replace(/\bSpeed Addition Quiz\b/gi, 'Tezkor qo‘shish testi')
    .replace(/\bComparing\s+Kasrlar\b/gi, 'Kasrlarni solishtirish')
    .replace(/\bComparing Fractions\b/gi, 'Kasrlarni solishtirish')
    .replace(/\bShakllar All Around\b/gi, 'Atrofdagi shakllar')
    .replace(/\bShapes All Around\b/gi, 'Atrofdagi shakllar')
    .replace(/\bIdentify basic\b/gi, 'Asosiy')
    .replace(/\bLearning about parts of a whole\b/gi, 'Butunning qismlari haqida o‘rganing')
    .replace(/\bAdd numbers from 1 to 9\b/gi, '1 dan 9 gacha bo‘lgan sonlarni qo‘shing')
    .replace(/\bSubtract numbers from 1 to 9\b/gi, '1 dan 9 gacha bo‘lgan sonlarni ayiring')
    .replace(/\bMeasure around\b/gi, 'Atrofini o‘lchang:')
    .replace(/\bWhich fraction is bigger\??/gi, 'Qaysi kasr kattaroq?')
    .replace(/\bAddition\b/gi, 'Qo‘shish')
    .replace(/\bSubtraction\b/gi, 'Ayirish')
    .replace(/\bFractions\b/gi, 'Kasrlar')
    .replace(/\bGeometry\b/gi, 'Geometriya')
    .replace(/\bAngles\b/gi, 'Burchaklar')
    .replace(/\bShapes\b/gi, 'Shakllar')
    .replace(/\bWord Problems\b/gi, 'matnli masalalar')
    .replace(/\bDouble Digits\b/gi, 'ikki xonali sonlar')
    .replace(/\bTriple Digits\b/gi, 'uch xonali sonlar')
    .replace(/\bSpeed\b/gi, 'Tezkor')
    .replace(/\bBasics\b/gi, 'asoslari')
    .replace(/\bPractice\b/gi, 'mashq')
    .replace(/\bQuiz\b/gi, 'test')
    .replace(/\bChallenge\b/gi, 'sinov')
    .replace(/\bLesson\b/gi, 'Dars')
    .replace(/\bLevel\b/gi, 'Daraja')
    .replace(/\bBeginner\b/gi, 'Boshlang‘ich')
    .replace(/\bIntermediate\b/gi, 'O‘rta')
    .replace(/\bAdvanced\b/gi, 'Yuqori')
    .replace(/\bPerimeter\b/gi, 'Perimetr')
    .replace(/\bArea\b/gi, 'Yuzasi')
    .replace(/\bVolume\b/gi, 'Hajm')
    .replace(/\s+/g, ' ')
    .trim();
};

export const toUzbekLessonTitle = (title?: string | null): string => {
  if (!title) return '';
  const raw = title.trim();
  if (EXACT_TITLE_MAP[raw]) return EXACT_TITLE_MAP[raw];
  return tokenReplace(raw);
};

export const toUzbekLessonDescription = (description?: string | null): string => {
  if (!description) return '';
  const raw = description.trim();
  if (EXACT_DESCRIPTION_MAP[raw]) return EXACT_DESCRIPTION_MAP[raw];
  return tokenReplace(raw)
    .replace(/\bfrom smallest to largest\b/gi, 'eng kichikdan eng kattagacha')
    .replace(/\bfrom largest to smallest\b/gi, 'eng kattadan eng kichikkacha');
};
