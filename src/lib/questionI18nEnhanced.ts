// Enhanced question translation with more comprehensive Uzbek translations
// This file handles all question text translations for MathQuest

const EXACT_TEXT_MAP: Record<string, string> = {
  // Basic arithmetic questions
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
  'What fraction is shaded?': 'Qaysi qism kasr ko\'rinishida?',
  'What is 3/4 as a decimal?': '3/4 o\'nlik ko\'rinishida necha?',
  'What is 0.75 as a fraction?': '0.75 kasr ko\'rinishida necha?',
  
  // Geometry questions
  'What is perimeter?': 'Perimetr necha?',
  'What is area?': 'Yuzasi necha?',
  'How many sides?': 'Nechta tomoni bor?',
  'What angle is this?': 'Bu qanday burchak?',
  'Is this a right angle?': 'Bu to\'g\'ri burchakmi?',
  'What is a right angle in degrees?': 'To‘g‘ri burchak necha gradus bo‘ladi?',
  'What is an acute angle?': 'O‘tkir burchak nima?',
  'What is an obtuse angle?': 'O‘tmas burchak nima?',
  
  // Time questions
  'What time is shown?': 'Soat necha ko\'rsatilgan?',
  
  // General questions
  'What is value of missing number?': 'Yo‘qolgan sonning qiymati necha?',
  
  // Shape questions
  'How many sides does a triangle have?': 'Uchburchakning nechta tomoni bor?',
  'How many sides does a square have?': 'Kvadratning nechta tomoni bor?',
  'How many sides does a circle have?': 'Doiraning nechta tomoni bor?',
  'What shape is this?': 'Bu qanday shakl?',
  'Name this shape': 'Bu shaklning nomi',
  'Count sides': 'Tomonlarni sanang',
  
  // Equation building questions
  'Arrange to make a correct equation: 5 + _ = 12': 'To\'g\'ri tenglikni tuzing: 5 + _ = 12',
  'Find missing number that makes equation true': 'Tenglikni to\'g\'ri qiladigan yo\'qolgan sonni toping',
  'What number times 8 equals 24?': 'Qaysi sonni 8 ga ko\'paytsangiz 24 bo\'ladi?',
  'What number plus 5 equals 15?': 'Qaysi songa 5 qo\'shsangiz 15 bo\'ladi?',
  'What number minus 3 equals 12?': 'Qaysi sondan 3 ayirsangiz 12 bo\'ladi?',
  'What number divided by 4 equals 6?': 'Qaysi sonni 4 ga bo\'lsangiz 6 bo\'ladi?',
  
  // Ordering questions
  'Arrange in order from smallest to largest: 3, 7, 1, 5': 'Eng kichikdan eng kattagacha tartiblang: 3, 7, 1, 5',
  'Order from largest to smallest: 9, 2, 7, 4': 'Eng kattadan eng kichikgacha tartiblang: 9, 2, 7, 4',
  
  // Number line questions
  'Where is 7 on number line?': '7 son chiziqda qayerda?',
  'What number is halfway between 2 and 8?': '2 va 8 o\'rtasidagi qaysi son?',
  'Which number is closer to 5: 4 or 6?': '5 ga qaysi son yaqinroq: 4 yoki 6?',
  
  // Store problems
  'A store had 25 apples. 7 were sold. How many are left?': 'Do\'konda 25 ta olma bor edi. 7 tasi sotildi. Nechta qoldi?',
  
  // Fraction comparisons
  'Match: Which fractions equal 1/2? Drag correct ones.': 'Moslashtiring: qaysi kasrlar 1/2 ga teng? To\'g\'rilarni surib tanlang.',
  'Arrange these fractions from smallest to largest: 1/4, 3/4, 1/2': 'Bu kasrlarni eng kichikdan eng kattagacha tartiblang: 1/4, 3/4, 1/2',
};

const EXACT_EXPLANATION_MAP: Record<string, string> = {
  // Shape explanations
  'Triangle=3, Square=4, Pentagon=5, Hexagon=6': 'Uchburchak=3, Kvadrat=4, Beshburchak=5, Oltiburchak=6',
  'Rectangles and squares both have 4 sides': 'To\'rtburchak va kvadratning ikkalasida ham 4 ta tomon bor',
  'A triangle has 3 sides': 'Uchburchakning 3 ta tomoni bor',
  'A square has 4 equal sides': 'Kvadratning 4 ta teng tomoni bor',
  'A circle has no straight sides': 'Doiraning to\'g\'ri tomonlari yo\'q',
  'This is a triangle': 'Bu uchburchak',
  'This is a square': 'Bu kvadrat',
  'This is a circle': 'Bu doira',
  'Count each side and add them together': 'Har bir tomonni sanab ularning yig\'indisini toping',
  'Look at shape and name it': 'Shaklga qarab nomini toping',
  
  // Fraction explanations
  '2/4 and 3/6 both simplify to 1/2': '2/4 va 3/6 ikkalasi ham 1/2 ga soddalanadi',
  'Compare fractions by converting to decimals': 'Kasrlarni o\'nlikka aylantirib solishtiring',
  
  // Arithmetic explanations
  'Add 15 and 7': '15 va 7 ni qo\'shing',
  'Subtract 5 from 12': '12 dan 5 ni ayiring',
  'Multiply 8 by 3': '8 ni 3 ga ko\'paytiring',
  'Divide 20 by 4': '20 ni 4 ga bo\'ling',
  'Find half of 14': '14 ning yarmisini toping',
  'Find double of 9': '9 ning ikki barobarini toping',
  'Compare 25 and 17': '25 va 17 ni solishtiring',
  'Compare 13 and 8': '13 va 8 ni solishtiring',
  
  // Equation explanations
  'Find missing number that makes equation true': 'Tenglikni to\'g\'ri qiladigan yo\'qolgan sonni toping',
  'What number times 8 equals 24?': 'Qaysi sonni 8 ga ko\'paytsangiz 24 bo\'ladi?',
  'What number plus 5 equals 15?': 'Qaysi songa 5 qo\'shsangiz 15 bo\'ladi?',
  'What number minus 3 equals 12?': 'Qaysi sondan 3 ayirsangiz 12 bo\'ladi?',
  'What number divided by 4 equals 6?': 'Qaysi sonni 4 ga bo\'lsangiz 6 bo\'ladi?',
  'Find two numbers that add to 20': '20 ga yig\'adigan ikkita sonni toping',
  'Find two numbers that multiply to 18': '18 ga ko\'paytadigan ikkita sonni toping',
  'Find a pair of numbers that balance the equation': 'Tenglamani tenglashtiradigan son juftligini toping',
  
  // Type answer explanations
  'Type your answer and press Enter': 'Javobingizni yozib Enter tugmasini bosing',
  'Press Enter after typing your answer': 'Javobni yozgandan so\'ng Enter tugmasini bosing',
  'Write your answer in space provided': 'Javobingizni berilgan joyga yozing',
  'Type correct answer': 'To\'g\'ri javobni yozing',
  
  // Number line explanations
  'Find position of 7 on number line': '7 sonining son chiziqdagi pozitsiyasini toping',
  'The number 3 goes between 2 and 4': '3 soni 2 va 4 orasiga joylashadi',
  'The midpoint between 2 and 8 is 5': '2 va 8 o\'rtasidagi nuqta 5',
  '4 is closer to 5 than 6 is': '4, 6 dan ko\'ra 5 ga yaqinroq',
  'Click to place markers at specific positions': 'Belgilarni ma\'lum bir pozitsiyalarga joylashtirish uchun bosing',
  'Drag markers to their correct positions': 'Belgilarni to\'g\'ri pozitsiyalariga torting',
  
  // Pattern explanations
  'The pattern adds 2 each time': 'Har safada 2 qo\'shiladi',
  'Find the missing number in the sequence': 'Ketma-ketlikdagi yo\'qolgan sonni toping',
  
  // General explanations
  'Sort numbers from smallest to largest': 'Sonlarni eng kichikdan boshlab tartiblang',
  'Sort numbers from largest to smallest': 'Sonlarni eng kattadan boshlab tartiblang',
};

const OPTION_MAP: Record<string, string> = {
  Square: 'Kvadrat',
  Triangle: 'Uchburchak',
  Hexagon: 'Oltiburchak',
  Pentagon: 'Beshburchak',
  Rectangle: 'To\'rtburchak',
  Circle: 'Doira',
  '1/4': '1/4',
  '1/2': '1/2',
  '3/4': '3/4',
  '2/4': '2/4',
  '3/6': '3/6',
};

export const toUzbekQuestionText = (text: string): string => {
  const raw = text.trim();
  
  // Check exact matches first
  if (EXACT_TEXT_MAP[raw]) return EXACT_TEXT_MAP[raw];
  
  // Pattern-based translations
  let match = raw.match(/^What is (.+)\?$/i);
  if (match) return `${match[1]} nechiga teng?`;

  match = raw.match(/^Which is larger: (.+) or (.+)\?$/i);
  if (match) return `Qaysi biri kattaroq: ${match[1]} yoki ${match[2]}?`;

  match = raw.match(/^Which is smaller: (.+) or (.+)\?$/i);
  if (match) return `Qaysi biri kichikroq: ${match[1]} yoki ${match[2]}?`;

  match = raw.match(/^What is (\d+) \+ (\d+)\?$/i);
  if (match) return `${match[1]} + ${match[2]} nechiga teng?`;

  match = raw.match(/^What is (\d+) \- (\d+)\?$/i);
  if (match) return `${match[1]} - ${match[2]} nechiga teng?`;

  match = raw.match(/^What is (\d+) × (\d+)\?$/i);
  if (match) return `${match[1]} × ${match[2]} nechiga teng?`;

  match = raw.match(/^What is (\d+) ÷ (\d+)\?$/i);
  if (match) return `${match[1]} ÷ ${match[2]} nechiga teng?`;

  match = raw.match(/^What comes next: (.+)\?$/i);
  if (match) return `Keyingisi necha: ${match[1]}?`;

  match = raw.match(/^How many sides does a (.+) have\?$/i);
  if (match) return `${match[1]}ning nechta tomoni bor?`;

  match = raw.match(/^What shape is this\?$/i);
  if (match) return 'Bu qanday shakl?';

  match = raw.match(/^A store had (\d+) (.+)\. (\d+) were sold\. How many are left\?$/i);
  if (match) return `Do'konda ${match[1]} ta ${match[2]} bor edi. ${match[3]} tasi sotildi. Nechta qoldi?`;

  // If no pattern matches, return original
  return raw;
};

export const toUzbekExplanation = (text?: string | null): string => {
  if (!text) return '';
  const raw = text.trim();
  
  // Check exact matches first
  if (EXACT_EXPLANATION_MAP[raw]) return EXACT_EXPLANATION_MAP[raw];
  
  // Pattern-based replacements
  return raw
    .replace(/^Drag\s+/i, 'Joylashtiring: ')
    .replace(/^Sort\s+/i, 'Tartiblang: ')
    .replace(/^Arrange\s+/i, 'Tartiblang: ')
    .replace(/^Find\s+/i, 'Topping: ')
    .replace(/^Compare\s+/i, 'Solishtiring: ')
    .replace(/^Click\s+/i, 'Bosing: ')
    .replace(/^Type\s+/i, 'Yozing: ');
};

export const toUzbekOption = (text: string): string => {
  const raw = text.trim();
  return OPTION_MAP[raw] ?? raw;
};
