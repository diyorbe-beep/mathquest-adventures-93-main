const EXACT_TEXT_MAP: Record<string, string> = {
  'What is a right angle in degrees?': 'To‘g‘ri burchak necha gradus bo‘ladi?',
  'What is an acute angle?': 'O‘tkir burchak nima?',
  'What is an obtuse angle?': 'O‘tmas burchak nima?',
  // Addition questions
  'What is 15 + 7?': '15 + 7 nechiga teng?',
  'What is 15 - 7?': '15 - 7 nechiga teng?',
  'What is 8 × 3?': '8 × 3 nechiga teng?',
  'What is 20 ÷ 4?': '20 ÷ 4 nechiga teng?',
  'What is half of 14?': '14 ning yarmi necha?',
  'What is double 9?': '9 ning ikki barobari necha?',
  // Comparison questions
  'Which is larger: 25 or 17?': 'Qaysi biri kattaroq: 25 yoki 17?',
  'Which is smaller: 13 or 8?': 'Qaysi biri kichikroq: 13 yoki 8?',
  // Pattern questions
  'What comes next: 2, 4, 6, __?': 'Keyingisi necha: 2, 4, 6, __?',
  // Fraction questions
  'What fraction is shaded?': 'Qaysi qism kasr ko‘rinishida?',
  'What is 3/4 as a decimal?': '3/4 o‘nlik ko‘rinishida necha?',
  'What is 0.75 as a fraction?': '0.75 kasr ko‘rinishida necha?',
  // Geometry questions
  'What is the perimeter?': 'Perimetr necha?',
  'What is the area?': 'Yuzasi necha?',
  'How many sides?': 'Nechta tomoni bor?',
  'What angle is this?': 'Bu qanday burchak?',
  'Is this a right angle?': 'Bu to‘g‘ri burchakmi?',
  // Time questions
  'What time is shown?': 'Soat necha ko‘rsatilgan?',
  // General questions
  'What is the value of the missing number?': 'Yo‘qolgan sonning qiymati necha?',
};

const EXACT_EXPLANATION_MAP: Record<string, string> = {
  'Triangle=3, Square=4, Pentagon=5, Hexagon=6': 'Uchburchak=3, Kvadrat=4, Beshburchak=5, Oltiburchak=6',
  'Rectangles and squares both have 4 sides': 'To‘rtburchak va kvadratning ikkalasida ham 4 ta tomon bor',
  '2/4 and 3/6 both simplify to 1/2': '2/4 va 3/6 ikkalasi ham 1/2 ga soddalanadi',
  'Compare fractions by converting to decimals': 'Kasrlarni o‘nlikka aylantirib solishtiring',
  'Sort numbers from smallest to largest': 'Sonlarni eng kichikdan boshlab tartiblang',
  'Sort numbers from largest to smallest': 'Sonlarni eng kattadan boshlab tartiblang',
  // Addition explanations
  'Add 15 and 7': '15 va 7 ni qo’shing',
  'Subtract 5 from 12': '12 dan 5 ni ayiring',
  'Multiply 8 by 3': '8 ni 3 ga ko’paytiring',
  'Divide 20 by 4': '20 ni 4 ga bo’ling',
  'Find half of 14': '14 ning yarmisini toping',
  'Find double of 9': '9 ning ikki barobarini toping',
  'Compare 25 and 17': '25 va 17 ni solishtiring',
  'Compare 13 and 8': '13 va 8 ni solishtiring',
  // Equation builder explanations
  'Find the missing number that makes the equation true': 'Tenglikni to’g’ri qiladigan yo’qolgan sonni toping',
  'What number times 8 equals 24?': 'Qaysi sonni 8 ga ko’paytsangiz 24 bo’ladi?',
  'What number plus 5 equals 15?': 'Qaysi songa 5 qo’shsangiz 15 bo’ladi?',
  'What number minus 3 equals 12?': 'Qaysi sondan 3 ayirsangiz 12 bo’ladi?',
  'What number divided by 4 equals 6?': 'Qaysi sonni 4 ga bo’lsangiz 6 bo’ladi?',
  'Find two numbers that add to 20': '20 ga yig’adigan ikkita sonni toping',
  'Find two numbers that multiply to 18': '18 ga ko’paytadigan ikkita sonni toping',
  'Find two numbers where: first minus second equals 10': 'Birinchisidan ikkinchisini ayirsangiz 10 bo’ladigan ikkita sonni toping',
  'Find two numbers where: first divided by second equals 5': 'Birinchisini ikkinchisiga bo’lsangiz 5 bo’ladigan ikkita sonni toping',
  'Find a pair of numbers that balance the equation': 'Tenglamani tenglashtiradigan son juftligini toping',
  'Think of two numbers that multiply to 30': '30 ga ko’paytadigan ikkita sonni o’ylang',
  'Think of a number that divides by 12 to give 3': '12 ga bo’linganda 3 beradigan sonni o’ylang',
  // Type answer explanations
  'Type your answer and press Enter': 'Javobingizni yozib Enter tugmasini bosing',
  'Press Enter after typing your answer': 'Javobni yozgandan so’ng Enter tugmasini bosing',
  'Write your answer in the space provided': 'Javobingizni berilgan joyga yozing',
  'Type the correct answer': 'To’g’ri javobni yozing',
  // Number line explanations
  'Find the position of 7 on the number line': '7 sonining son chiziqdagi pozitsiyasini toping',
  'The number 3 goes between 2 and 4': '3 soni 2 va 4 orasiga joylashadi',
  'The midpoint between 2 and 8 is 5': '2 va 8 o’rtasidagi nuqta 5',
  '4 is closer to 5 than 6 is': '4, 6 dan ko’ra 5 ga yaqinroq',
  'Click to place markers at specific positions': 'Belgilarni ma’lum bir pozitsiyalarga joylashtirish uchun bosing',
  'Drag markers to their correct positions': 'Belgilarni to’g’ri pozitsiyalariga torting',
  // Geometry explanations
  'A triangle has 3 sides': 'Uchburchakning 3 ta tomoni bor',
  'A square has 4 equal sides': 'Kvadratning 4 ta teng tomoni bor',
  'A circle has no straight sides': 'Doiraning to’g’ri tomonlari yo’q',
  'This is a triangle': 'Bu uchburchak',
  'This is a square': 'Bu kvadrat',
  'This is a circle': 'Bu doira',
  'Count each side and add them together': 'Har bir tomonni sanab ularning yig’indisini toping',
  'Look at the shape and name it': 'Shaklga qarab nomini toping',
  // Pattern explanations
  'The pattern adds 2 each time': 'Har safada 2 qo’shiladi',
  'Find the missing number in the sequence': 'Ketma-ketlikdagi yo’qolgan sonni toping',
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
  if (m) return `Do'konda ${m[1]} ta olma bor edi. ${m[2]} tasi sotildi. Nechta qoldi?`;

  // Word problems — umumiy patternlar
  m = raw.match(/^(.+) had (\d+) (.+)\. (?:He|She|They) (?:gave|gives) (\d+) (?:to .+|away)\. How many (?:are left|does .+ have|remain)\??$/i);
  if (m) return `${m[1]}da ${m[2]} ta ${m[3]} bor edi. ${m[4]} tasi berildi. Nechta qoldi?`;

  m = raw.match(/^There (?:are|were) (\d+) (.+)\. (\d+) (?:are|were|fly|swim) (?:absent|away|eaten|used|lost|broken)\. How many (?:are left|remain|are present)\??$/i);
  if (m) return `${m[2].charAt(0).toUpperCase() + m[2].slice(1)}: ${m[1]} ta bor edi. ${m[3]} tasi ketdi. Nechta qoldi?`;

  m = raw.match(/^(\w+) has (\d+) (.+)\. (?:He|She) (?:loses?|lost|gives?|gave) (\d+)\. How many does (?:he|she) have\??$/i);
  if (m) return `${m[1]}da ${m[2]} ta ${m[3]} bor edi. ${m[4]} tasi ketdi. Nechta qoldi?`;

  m = raw.match(/^How many (?:are left|remain)\??$/i);
  if (m) return 'Nechta qoldi?';

  m = raw.match(/^How many in total\??$/i);
  if (m) return 'Jami nechta?';

  m = raw.match(/^How many altogether\??$/i);
  if (m) return 'Hammasi nechta?';

  m = raw.match(/^What is (.+) as an improper fraction\?$/i);
  if (m) return `${m[1]} ni noto'g'ri kasr ko'rinishida yozing.`;

  m = raw.match(/^Arrange to make a correct equation: (.+)$/i);
  if (m) return `To'g'ri tenglikni tuzing: ${m[1]}`;

  m = raw.match(/^Arrange in order from smallest to largest: (.+)$/i);
  if (m) return `Eng kichikdan eng kattagacha tartiblang: ${m[1]}`;

  m = raw.match(/^Order from largest to smallest: (.+)$/i);
  if (m) return `Eng kattadan eng kichikgacha tartiblang: ${m[1]}`;

  m = raw.match(/^Arrange to complete: (.+)$/i);
  if (m) return `To'ldiring: ${m[1]}`;

  m = raw.match(/^Arrange these fractions from smallest to largest: (.+)$/i);
  if (m) return `Bu kasrlarni eng kichikdan eng kattagacha tartiblang: ${m[1]}`;

  m = raw.match(/^Match: Which fractions equal 1\/2\? Drag the correct ones\.$/i);
  if (m) return 'Moslashtiring: qaysi kasrlar 1/2 ga teng? To\'g\'rilarni surib tanlang.';

  m = raw.match(/^What is (\d+) \+ (\d+)\?$/i);
  if (m) return `${m[1]} + ${m[2]} nechiga teng?`;

  m = raw.match(/^What is (\d+) \- (\d+)\?$/i);
  if (m) return `${m[1]} - ${m[2]} nechiga teng?`;

  m = raw.match(/^What is (\d+) × (\d+)\?$/i);
  if (m) return `${m[1]} × ${m[2]} nechiga teng?`;

  m = raw.match(/^What is (\d+) ÷ (\d+)\?$/i);
  if (m) return `${m[1]} ÷ ${m[2]} nechiga teng?`;

  m = raw.match(/^What is half of (\d+)\?$/i);
  if (m) return `${m[1]} ning yarmi necha?`;

  m = raw.match(/^What is double (\d+)\?$/i);
  if (m) return `${m[1]} ning ikki barobari necha?`;

  m = raw.match(/^Which is larger: (\d+) or (\d+)\?$/i);
  if (m) return `Qaysi biri kattaroq: ${m[1]} yoki ${m[2]}?`;

  m = raw.match(/^Which is smaller: (\d+) or (\d+)\?$/i);
  if (m) return `Qaysi biri kichikroq: ${m[1]} yoki ${m[2]}?`;

  m = raw.match(/^What comes next: (.+)\?$/i);
  if (m) return `Keyingisi necha: ${m[1]}?`;

  m = raw.match(/^What fraction is shaded\?$/i);
  if (m) return 'Qaysi qism kasr ko\'rinishida?';

  m = raw.match(/^What is (\d+)\/(\d+) as a decimal\?$/i);
  if (m) return `${m[1]}/${m[2]} o\'nlik ko\'rinishida necha?`;

  m = raw.match(/^What is ([\d.]+) as a fraction\?$/i);
  if (m) return `${m[1]} kasr ko\'rinishida necha?`;

  m = raw.match(/^What is the (perimeter|area)\?$/i);
  if (m) return m[1] === 'perimeter' ? 'Perimetr necha?' : 'Yuzasi necha?';

  m = raw.match(/^How many sides\?$/i);
  if (m) return 'Nechta tomoni bor?';

  m = raw.match(/^What angle is this\?$/i);
  if (m) return 'Bu qanday burchak?';

  m = raw.match(/^Is this a right angle\?$/i);
  if (m) return 'Bu to\'g\'ri burchakmi?';

  m = raw.match(/^What time is shown\?$/i);
  if (m) return 'Soat necha ko\'rsatilgan?';

  m = raw.match(/^What is the value of the missing number\?$/i);
  if (m) return 'Yo\'qolgan sonning qiymati necha?';

  m = raw.match(/^Solve: (.+)\?$/i);
  if (m) return `${m[1]} ni yeching`;

  m = raw.match(/^Complete: (.+)\?$/i);
  if (m) return `${m[1]} ni to\'ldiring`;

  m = raw.match(/^Solve: _ \+ _ = (.+)$/i);
  if (m) return `Yeching: _ + _ = ${m[1]}`;

  m = raw.match(/^Solve: _ × _ = (.+)$/i);
  if (m) return `Yeching: _ × _ = ${m[1]}`;

  m = raw.match(/^Solve: _ - _ = (.+)$/i);
  if (m) return `Yeching: _ - _ = ${m[1]}`;

  m = raw.match(/^Solve: _ ÷ _ = (.+)$/i);
  if (m) return `Yeching: _ ÷ _ = ${m[1]}`;

  m = raw.match(/^Complete: _ \+ _ = (.+)$/i);
  if (m) return `To\'ldiring: _ + _ = ${m[1]}`;

  m = raw.match(/^Complete: _ × _ = (.+)$/i);
  if (m) return `To\'ldiring: _ × _ = ${m[1]}`;

  m = raw.match(/^Complete: _ - _ = (.+)$/i);
  if (m) return `To\'ldiring: _ - _ = ${m[1]}`;

  m = raw.match(/^Balance: _ \+ _ = (.+)$/i);
  if (m) return `Tenglashtiring: _ + _ = ${m[1]}`;

  m = raw.match(/^Create: _ × _ = (.+)$/i);
  if (m) return `Tuzing: _ × _ = ${m[1]}`;

  m = raw.match(/^Make: _ ÷ _ = (.+)$/i);
  if (m) return `Qiling: _ ÷ _ = ${m[1]}`;

  m = raw.match(/^Type (your )?answer: (.+)\?$/i);
  if (m) return `Javobni yozing: ${m[1]}`;

  m = raw.match(/^Enter your answer: (.+)\?$/i);
  if (m) return `Javobingizni kiriting: ${m[1]}`;

  m = raw.match(/^Write the missing number: (.+)\?$/i);
  if (m) return `Yo\'qolgan sonni yozing: ${m[1]}`;

  m = raw.match(/^Fill in the blank: (.+)\?$/i);
  if (m) return `Bo\'shliqni to\'ldiring: ${m[1]}`;

  m = raw.match(/^Where is (\d+) on the number line\?$/i);
  if (m) return `${m[1]} son chiziqda qayerda?`;

  m = raw.match(/^Place the number (\d+) on the number line$/i);
  if (m) return `${m[1]} sonini son chiziqqa joylashtiring`;

  m = raw.match(/^What number is halfway between (\d+) and (\d+)\?$/i);
  if (m) return `${m[1]} va ${m[2]} o\'rtasidagi qaysi son?`;

  m = raw.match(/^Which number is closer to (\d+): (\d+) or (\d+)\?$/i);
  if (m) return `${m[1]} ga qaysi son yaqinroq: ${m[2]} yoki ${m[3]}?`;

  m = raw.match(/^Move the marker to position (.+)\?$/i);
  if (m) return `Belgini ${m[1]} pozitsiyasiga ko\'chiring`;

  m = raw.match(/^Click on the number line to place the marker$/i);
  if (m) return `Belgini joylashtirish uchun son chiziqqa bosing`;

  m = raw.match(/^Drag the marker to the correct position$/i);
  if (m) return `Belgini to\'g\'ri pozitsiyasiga torting`;

  m = raw.match(/^How many sides does a (\w+) have\?$/i);
  if (m) return `${m[1]}ning nechta tomoni bor?`;

  m = raw.match(/^What shape is this\?$/i);
  if (m) return `Bu qanday shakl?`;

  if (m) return `Shaklni aniqlang`;

  m = raw.match(/^Count the sides$/i);
  if (m) return `Tomonlarni sanang`;

  m = raw.match(/^Name this shape$/i);
  if (m) return `Bu shaklning nomi`;

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
