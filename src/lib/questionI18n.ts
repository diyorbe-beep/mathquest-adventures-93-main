const EXACT_TEXT_MAP: Record<string, string> = {
  'What is a right angle in degrees?': 'To‘g‘ri burchak necha gradus bo‘ladi?',
  'What is an acute angle?': 'O‘tkir burchak nima?',
  'What is an obtuse angle?': 'O‘tmas burchak nima?',
};

const EXACT_EXPLANATION_MAP: Record<string, string> = {
  'Triangle=3, Square=4, Pentagon=5, Hexagon=6': 'Uchburchak=3, Kvadrat=4, Beshburchak=5, Oltiburchak=6',
  'Rectangles and squares both have 4 sides': 'To‘rtburchak va kvadratning ikkalasida ham 4 ta tomon bor',
  '2/4 and 3/6 both simplify to 1/2': '2/4 va 3/6 ikkalasi ham 1/2 ga soddalanadi',
  'Compare fractions by converting to decimals': 'Kasrlarni o‘nlikka aylantirib solishtiring',
  'Sort numbers from smallest to largest': 'Sonlarni eng kichikdan boshlab tartiblang',
  'Sort numbers from largest to smallest': 'Sonlarni eng kattadan boshlab tartiblang',
};

const OPTION_MAP: Record<string, string> = {
  Square: 'Kvadrat',
  Triangle: 'Uchburchak',
  Hexagon: 'Oltiburchak',
  Pentagon: 'Beshburchak',
  Rectangle: 'To‘rtburchak',
  Circle: 'Doira',
};

export const toUzbekQuestionText = (text: string): string => {
  const raw = text.trim();
  if (EXACT_TEXT_MAP[raw]) return EXACT_TEXT_MAP[raw];

  let m = raw.match(/^What is (.+)\?$/i);
  if (m) return `${m[1]} nechiga teng?`;

  m = raw.match(/^Which is larger: (.+) or (.+)\?$/i);
  if (m) return `Qaysi biri kattaroq: ${m[1]} yoki ${m[2]}?`;

  m = raw.match(/^Which is smaller: (.+) or (.+)\?$/i);
  if (m) return `Qaysi biri kichikroq: ${m[1]} yoki ${m[2]}?`;

  m = raw.match(/^A store had (\d+) apples\. (\d+) were sold\. How many are left\?$/i);
  if (m) return `Do‘konda ${m[1]} ta olma bor edi. ${m[2]} tasi sotildi. Nechta qoldi?`;

  m = raw.match(/^What is (.+) as an improper fraction\?$/i);
  if (m) return `${m[1]} ni noto‘g‘ri kasr ko‘rinishida yozing.`;

  m = raw.match(/^Arrange to make a correct equation: (.+)$/i);
  if (m) return `To‘g‘ri tenglikni tuzing: ${m[1]}`;

  m = raw.match(/^Arrange in order from smallest to largest: (.+)$/i);
  if (m) return `Eng kichikdan eng kattagacha tartiblang: ${m[1]}`;

  m = raw.match(/^Order from largest to smallest: (.+)$/i);
  if (m) return `Eng kattadan eng kichikgacha tartiblang: ${m[1]}`;

  m = raw.match(/^Arrange to complete: (.+)$/i);
  if (m) return `To‘ldiring: ${m[1]}`;

  m = raw.match(/^Arrange these fractions from smallest to largest: (.+)$/i);
  if (m) return `Bu kasrlarni eng kichikdan eng kattagacha tartiblang: ${m[1]}`;

  m = raw.match(/^Match: Which fractions equal 1\/2\? Drag the correct ones\.$/i);
  if (m) return 'Moslashtiring: qaysi kasrlar 1/2 ga teng? To‘g‘rilarni surib tanlang.';

  return raw;
};

export const toUzbekExplanation = (text?: string | null): string => {
  if (!text) return '';
  const raw = text.trim();
  if (EXACT_EXPLANATION_MAP[raw]) return EXACT_EXPLANATION_MAP[raw];
  return raw
    .replace(/^Drag\s+/i, 'Joylashtiring: ')
    .replace(/^Sort\s+/i, 'Tartiblang: ');
};

export const toUzbekOption = (text: string): string => {
  const raw = text.trim();
  return OPTION_MAP[raw] ?? raw;
};
