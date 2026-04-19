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
  'What fraction is shaded?': 'Rasmda bo‘yalgan qism qaysi kasrga teng?',
  'What is 3/4 as a decimal?': '3/4 soni o‘nlik kasrda qanday yoziladi?',
  'What is 0.75 as a fraction?': '0,75 qaysi oddiy kasrga teng?',
  
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
  
  // Store/word problems
  'A store had 25 apples. 7 were sold. How many are left?': 'Do\'konda 25 ta olma bor edi. 7 tasi sotildi. Nechta qoldi?',
  'A store had 30 apples. 12 were sold. How many are left?': 'Do\'konda 30 ta olma bor edi. 12 tasi sotildi. Nechta qoldi?',
  'A store had 18 apples. 9 were sold. How many are left?': 'Do\'konda 18 ta olma bor edi. 9 tasi sotildi. Nechta qoldi?',
  'Ali had 12 candies. He gave 5 to his friend. How many are left?': 'Alida 12 ta konfet bor edi. U 5 tasini do\'stiga berdi. Nechta qoldi?',
  'There are 20 students. 8 are absent. How many are present?': 'Sinfda 20 ta o\'quvchi bor. 8 tasi yo\'q. Nechta o\'quvchi bor?',
  'Sara has 15 stickers. She gives 6 to her friend. How many does she have left?': 'Sarada 15 ta stiker bor. U 6 tasini do\'stiga berdi. Nechta qoldi?',
  'There are 24 birds on a tree. 9 fly away. How many are left?': 'Daraxtda 24 ta qush bor edi. 9 tasi uchib ketdi. Nechta qoldi?',
  'A basket has 16 oranges. 7 are eaten. How many remain?': 'Savatchada 16 ta apelsin bor. 7 tasi yeyildi. Nechta qoldi?',
  'Tom has 13 marbles. He loses 4. How many does he have?': 'Tomdа 13 ta shisha bor. U 4 tasini yo\'qotdi. Nechta qoldi?',
  'There are 11 cookies. 3 are eaten. How many are left?': '11 ta pechene bor edi. 3 tasi yeyildi. Nechta qoldi?',
  'A box has 20 pencils. 8 are used. How many are left?': 'Qutida 20 ta qalam bor. 8 tasi ishlatildi. Nechta qoldi?',
  'There are 14 fish in a pond. 5 swim away. How many remain?': 'Hovuzda 14 ta baliq bor edi. 5 tasi suzib ketdi. Nechta qoldi?',
  
  // Fraction comparisons
  'Match: Which fractions equal 1/2? Drag correct ones.': 'Moslashtiring: qaysi kasrlar 1/2 ga teng? To\'g\'rilarni surib tanlang.',
  'Arrange these fractions from smallest to largest: 1/4, 3/4, 1/2': 'Bu kasrlarni eng kichikdan eng kattagacha tartiblang: 1/4, 3/4, 1/2',
  // DBda noto'g'ri SQL tarjimadan qolgan buzilgan satrlar
  '3/4 as a decimal nechiga teng?': '3/4 soni o‘nlik kasrda qanday yoziladi?',
  '0.75 as a fraction nechiga teng?': '0,75 qaysi oddiy kasrga teng?',
  'Qaysi qism kasr ko‘rinishida?': 'Rasmda bo‘yalgan qism qaysi kasrga teng?',
  'Qaysi qism kasr ko\'rinishda?': 'Rasmda bo‘yalgan qism qaysi kasrga teng?',
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

  // SQL migratsiyasi buzgan satrlar (umumiy "What is … ?" → "… nechiga teng?")
  let match = raw.match(/^(.+) as a decimal nechiga teng\?$/i);
  if (match) return `${match[1].trim()} soni o‘nlik kasrda qanday yoziladi?`;
  match = raw.match(/^(.+) as a fraction nechiga teng\?$/i);
  if (match) return `${match[1].trim()} qaysi oddiy kasrga teng?`;
  
  // Pattern-based translations
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

  match = raw.match(/^What is half of (\d+)\?$/i);
  if (match) return `${match[1]} ning yarmi necha?`;

  match = raw.match(/^What is double (\d+)\?$/i);
  if (match) return `${match[1]} ning ikki barobari necha?`;

  match = raw.match(/^What fraction is shaded\?$/i);
  if (match) return 'Rasmda bo‘yalgan qism qaysi kasrga teng?';

  match = raw.match(/^What is (\d+)\/(\d+) as a decimal\?$/i);
  if (match) return `${match[1]}/${match[2]} soni o‘nlik kasrda qanday yoziladi?`;

  match = raw.match(/^What is ([\d.]+) as a fraction\?$/i);
  if (match) return `${match[1]} qaysi oddiy kasrga teng?`;

  match = raw.match(/^Which fraction is (?:larger|bigger|greater): (.+) or (.+)\?$/i);
  if (match) return `Qaysi kasr kattaroq: ${match[1]} yoki ${match[2]}?`;

  match = raw.match(/^Which fraction is smaller: (.+) or (.+)\?$/i);
  if (match) return `Qaysi kasr kichikroq: ${match[1]} yoki ${match[2]}?`;

  match = raw.match(/^Match: Which fractions equal 1\/2\? Drag the correct ones\.$/i);
  if (match) return 'Moslashtiring: qaysi kasrlar 1/2 ga teng? To‘g‘rilarni surib tanlang.';

  match = raw.match(/^Arrange these fractions from smallest to largest: (.+)$/i);
  if (match) return `Bu kasrlarni eng kichikdan eng kattagacha tartiblang: ${match[1]}`;

  match = raw.match(/^What is a right angle in degrees\?$/i);
  if (match) return 'To‘g‘ri burchak necha gradus bo‘ladi?';

  match = raw.match(/^What is an acute angle\?$/i);
  if (match) return 'O‘tkir burchak nima?';

  match = raw.match(/^What is an obtuse angle\?$/i);
  if (match) return 'O‘tmas burchak nima?';

  match = raw.match(/^What is the (perimeter|area)\?$/i);
  if (match) return match[1] === 'perimeter' ? 'Perimetr necha?' : 'Yuzasi necha?';

  match = raw.match(/^What is the value of the missing number\?$/i);
  if (match) return 'Yo‘qolgan sonning qiymati necha?';

  match = raw.match(/^What time is shown\?$/i);
  if (match) return 'Soat necha ko‘rsatilgan?';

  match = raw.match(/^How many sides\?$/i);
  if (match) return 'Nechta tomoni bor?';

  match = raw.match(/^What angle is this\?$/i);
  if (match) return 'Bu qanday burchak?';

  match = raw.match(/^Is this a right angle\?$/i);
  if (match) return 'Bu to‘g‘ri burchakmi?';

  match = raw.match(/^How many sides does a (.+) have\?$/i);
  if (match) return `${match[1]}ning nechta tomoni bor?`;

  match = raw.match(/^What shape is this\?$/i);
  if (match) return 'Bu qanday shakl?';

  match = raw.match(/^A store had (\d+) (.+)\. (\d+) were sold\. How many are left\?$/i);
  if (match) return `Do'konda ${match[1]} ta ${match[2]} bor edi. ${match[3]} tasi sotildi. Nechta qoldi?`;

  // ── QOʻSHISH masalalari ──────────────────────────────────────────────────

  // "Mia has 23 stickers. She gets 18 more. How many stickers does she have now?"
  match = raw.match(/^(\w+) has (\d+) (.+)\. (?:He|She|They) (?:gets?|receives?|buys?|finds?|earns?|collects?) (\d+) more\. How many (.+) does (?:he|she|they) have now\?$/i);
  if (match) return `${match[1]}da ${match[2]} ta ${match[3]} bor. U yana ${match[4]} ta oldi. Endi nechta ${match[3]} bor?`;

  // "Mia has 23 stickers. She gets 18 more. How many does she have now?"
  match = raw.match(/^(\w+) has (\d+) (.+)\. (?:He|She|They) (?:gets?|receives?|buys?|finds?|earns?|collects?) (\d+) more\. How many does (?:he|she|they) have(?: now)?\?$/i);
  if (match) return `${match[1]}da ${match[2]} ta ${match[3]} bor. U yana ${match[4]} ta oldi. Endi nechta bor?`;

  // "Tom has 14 apples. He buys 9 more. How many apples does he have in total?"
  match = raw.match(/^(\w+) has (\d+) (.+)\. (?:He|She|They) (?:gets?|receives?|buys?|finds?|earns?|collects?) (\d+) more\. How many (.+) does (?:he|she|they) have in total\?$/i);
  if (match) return `${match[1]}da ${match[2]} ta ${match[3]} bor. U yana ${match[4]} ta oldi. Jami nechta ${match[3]} bor?`;

  // "There are 12 boys and 9 girls. How many children are there altogether?"
  match = raw.match(/^There are (\d+) (.+) and (\d+) (.+)\. How many (.+) are there(?: altogether| in total)?\?$/i);
  if (match) return `${match[2].charAt(0).toUpperCase() + match[2].slice(1)}: ${match[1]} ta, ${match[4]}: ${match[3]} ta. Jami nechta ${match[5]} bor?`;

  // "Sam had 15 coins. He found 7 more. How many coins does he have now?"
  match = raw.match(/^(\w+) had (\d+) (.+)\. (?:He|She|They) (?:found|got|received|bought|earned|collected) (\d+) more\. How many (.+) does (?:he|she|they) have(?: now)?\?$/i);
  if (match) return `${match[1]}da ${match[2]} ta ${match[3]} bor edi. U yana ${match[4]} ta topdi. Endi nechta ${match[3]} bor?`;

  // "A farmer has 24 cows. He buys 13 more. How many cows does he have now?"
  match = raw.match(/^A (\w+) has (\d+) (.+)\. (?:He|She) (?:gets?|buys?|receives?|finds?|earns?) (\d+) more\. How many (.+) does (?:he|she) have(?: now)?\?$/i);
  if (match) return `Bir ${match[1]}da ${match[2]} ta ${match[3]} bor. U yana ${match[4]} ta oldi. Endi nechta ${match[3]} bor?`;

  // ── AYIRISH masalalari ───────────────────────────────────────────────────

  // "X had Y things. He/She gave/lost/used Z. How many does he/she have left?"
  match = raw.match(/^(\w+) has (\d+) (.+)\. (?:He|She|They) (?:gives?|gave|loses?|lost|uses?|used|eats?|ate|breaks?|broke) (\d+)(?:\s+(?:of them|away|to .+))?\. How many (?:.+does (?:he|she|they) have(?: left)?|are left|remain)\?$/i);
  if (match) return `${match[1]}da ${match[2]} ta ${match[3]} bor. ${match[4]} tasi ketdi. Nechta qoldi?`;

  // "X had Y things. He/She gave Z away. How many are left?"
  match = raw.match(/^(\w+) had (\d+) (.+)\. (?:He|She|They) (?:gave|lost|used|ate|broke|sold) (\d+)(?: away| of them)?\. How many (?:are left|remain|does (?:he|she|they) have)\?$/i);
  if (match) return `${match[1]}da ${match[2]} ta ${match[3]} bor edi. ${match[4]} tasi ketdi. Nechta qoldi?`;

  // ── UMUMIY word problem patternlar ──────────────────────────────────────

  match = raw.match(/^(.+) had (\d+) (.+)\. (?:He|She|They) gave (\d+) (?:to .+|away)\. How many (?:are left|does .+ have|remain)\??$/i);
  if (match) return `${match[1]}da ${match[2]} ta ${match[3]} bor edi. ${match[4]} tasi berildi. Nechta qoldi?`;

  match = raw.match(/^There (?:are|were) (\d+) (.+)\. (\d+) (?:are|were|fly|swim|run|walk) (?:absent|away|eaten|used|lost|broken)\. How many (?:are left|remain|are present)\??$/i);
  if (match) return `${match[2].charAt(0).toUpperCase() + match[2].slice(1)}: ${match[1]} ta bor edi. ${match[3]} tasi ketdi. Nechta qoldi?`;

  match = raw.match(/^A (\w+) has (\d+) (.+)\. (\d+) (?:are|were) (?:eaten|used|taken|broken|lost)\. How many (?:remain|are left)\??$/i);
  if (match) return `${match[1].charAt(0).toUpperCase() + match[1].slice(1)}da ${match[2]} ta ${match[3]} bor. ${match[4]} tasi ketdi. Nechta qoldi?`;

  match = raw.match(/^(\w+) has (\d+) (.+)\. (?:He|She) (?:loses?|lost|gives?|gave) (\d+)\. How many does (?:he|she) have\??$/i);
  if (match) return `${match[1]}da ${match[2]} ta ${match[3]} bor edi. ${match[4]} tasi ketdi. Nechta qoldi?`;

  match = raw.match(/^How many (?:are left|remain)\??$/i);
  if (match) return 'Nechta qoldi?';

  match = raw.match(/^How many in total\??$/i);
  if (match) return 'Jami nechta?';

  match = raw.match(/^How many altogether\??$/i);
  if (match) return 'Hammasi nechta?';

  match = raw.match(/^How many (.+) does (?:he|she|they) have(?: now| in total| left)?\??$/i);
  if (match) return `Endi nechta ${match[1]} bor?`;

  match = raw.match(/^(\d+) \+ (\d+) = \?$/i);
  if (match) return `${match[1]} + ${match[2]} = ?`;

  match = raw.match(/^(\d+) - (\d+) = \?$/i);
  if (match) return `${match[1]} - ${match[2]} = ?`;

  match = raw.match(/^(\d+) × (\d+) = \?$/i);
  if (match) return `${match[1]} × ${match[2]} = ?`;

  match = raw.match(/^(\d+) ÷ (\d+) = \?$/i);
  if (match) return `${match[1]} ÷ ${match[2]} = ?`;

  match = raw.match(/^What is the result of (.+)\?$/i);
  if (match) return `${match[1]} natijasi necha?`;

  match = raw.match(/^Calculate: (.+)$/i);
  if (match) return `Hisoblang: ${match[1]}`;

  match = raw.match(/^Solve for x: (.+)$/i);
  if (match) return `x ni toping: ${match[1]}`;
  
  match = raw.match(/^Simplify the expression: (.+)$/i);
  if (match) return `Ifodani soddalashtiring: ${match[1]}`;

  match = raw.match(/^What is (.+)\?$/i);
  if (match) return `${match[1]} nechiga teng?`;

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
    .replace(/^Find\s+/i, 'Toping: ')
    .replace(/^Compare\s+/i, 'Solishtiring: ')
    .replace(/^Click\s+/i, 'Bosing: ')
    .replace(/^Type\s+/i, 'Yozing: ')
    .replace(/^Add (\d+) and (\d+)/i, '$1 va $2 ni qo\'shing')
    .replace(/^Subtract (\d+) from (\d+)/i, '$2 dan $1 ni ayiring')
    .replace(/^Multiply (\d+) by (\d+)/i, '$1 ni $2 ga ko\'paytiring')
    .replace(/^Divide (\d+) by (\d+)/i, '$1 ni $2 ga bo\'ling')
    .replace(/The answer is (\d+)/i, 'Javob: $1')
    .replace(/Count the (.+)/i, '$1 ni sanang')
    .replace(/Remember:/i, 'Eslab qoling:')
    .replace(/Think about/i, 'O\'ylang:')
    .replace(/\bsubtract\b/gi, 'ayiring')
    .replace(/\badd\b/gi, 'qo\'shing')
    .replace(/\bmultiply\b/gi, 'ko\'paytiring')
    .replace(/\bdivide\b/gi, 'bo\'ling')
    .replace(/\bfrom\b/gi, 'dan')
    .replace(/\band\b/gi, 'va')
    .replace(/\bthe answer\b/gi, 'javob')
    .replace(/\bequals\b/gi, 'teng')
    .replace(/\bremaining\b/gi, 'qolgan')
    .replace(/\bleft\b/gi, 'qoldi')
    .replace(/\btotal\b/gi, 'jami');
};

export const toUzbekOption = (text: string): string => {
  const raw = text.trim();
  return OPTION_MAP[raw] ?? raw;
};
