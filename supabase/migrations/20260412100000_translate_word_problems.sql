-- "Qo'shish matnli masalalari" va barcha qolgan inglizcha savollarni o'zbekchaga o'tkazish
-- Supabase SQL Editor da ishga tushiring

-- ============================================================
-- 1. MATNLI MASALALAR — aniq mosliklar
-- ============================================================

UPDATE public.questions SET
  question_text  = 'Do''konda 25 ta olma bor edi. 7 tasi sotildi. Nechta qoldi?',
  explanation    = '25 dan 7 ni ayiring: 25 - 7 = 18',
  options        = '["18","17","16","15"]'::jsonb,
  correct_answer = '18'
WHERE question_text ILIKE '%store had 25 apples%'
   OR question_text ILIKE '%25 apples%7 were sold%';

UPDATE public.questions SET
  question_text  = 'Alida 12 ta konfet bor edi. U 5 tasini do''stiga berdi. Nechta qoldi?',
  explanation    = '12 dan 5 ni ayiring: 12 - 5 = 7',
  options        = '["7","8","6","9"]'::jsonb,
  correct_answer = '7'
WHERE question_text ILIKE '%Ali had 12 candies%'
   OR question_text ILIKE '%12 candies%gave 5%';

UPDATE public.questions SET
  question_text  = 'Maktabda 30 ta o''quvchi bor. 8 tasi yo''q. Sinfda nechta o''quvchi bor?',
  explanation    = '30 dan 8 ni ayiring: 30 - 8 = 22',
  options        = '["22","21","23","20"]'::jsonb,
  correct_answer = '22'
WHERE question_text ILIKE '%30 students%8 absent%'
   OR question_text ILIKE '%school has 30%8 are sick%';

UPDATE public.questions SET
  question_text  = 'Savatchada 15 ta tuxum bor edi. 6 tasi sinib ketdi. Nechta butun qoldi?',
  explanation    = '15 dan 6 ni ayiring: 15 - 6 = 9',
  options        = '["9","8","10","7"]'::jsonb,
  correct_answer = '9'
WHERE question_text ILIKE '%15 eggs%6 broke%'
   OR question_text ILIKE '%basket had 15 eggs%';

UPDATE public.questions SET
  question_text  = 'Bog''da 20 ta daraxt bor. 7 tasi olma, qolganlari nok. Nechta nok daraxti bor?',
  explanation    = '20 dan 7 ni ayiring: 20 - 7 = 13',
  options        = '["13","12","14","11"]'::jsonb,
  correct_answer = '13'
WHERE question_text ILIKE '%20 trees%7 apple%'
   OR question_text ILIKE '%garden has 20 trees%';

-- ============================================================
-- 2. MATNLI MASALALAR — "How many" patternlari
-- ============================================================

-- "X has Y things. He/She gets Z more. How many does he/she have now?"
UPDATE public.questions SET
  question_text = regexp_replace(
    question_text,
    '(\w+) has (\d+) (\w+s?)\. (?:He|She|They) (?:gets?|receives?|buys?|finds?|earns?|collects?) (\d+) more\. How many (\w+s?) does (?:he|she|they) have(?: now)?',
    '\1da \2 ta \3 bor. U yana \4 ta oldi. Endi nechta \5 bor?',
    'gi'
  )
WHERE question_text ~* '(?:gets?|receives?|buys?|finds?|earns?|collects?) \d+ more'
  AND question_text ~* 'How many';

-- "X had Y things. He/She got Z more. How many does he/she have now?"
UPDATE public.questions SET
  question_text = regexp_replace(
    question_text,
    '(\w+) had (\d+) (\w+s?)\. (?:He|She|They) (?:found|got|received|bought|earned|collected) (\d+) more\. How many (\w+s?) does (?:he|she|they) have(?: now)?',
    '\1da \2 ta \3 bor edi. U yana \4 ta topdi. Endi nechta \5 bor?',
    'gi'
  )
WHERE question_text ~* '(?:found|got|received|bought|earned|collected) \d+ more'
  AND question_text ~* 'How many';

UPDATE public.questions SET
  question_text = regexp_replace(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          regexp_replace(
            question_text,
            'A store had (\d+) apples\. (\d+) were sold\. How many are left\?',
            'Do''konda \1 ta olma bor edi. \2 tasi sotildi. Nechta qoldi?',
            'gi'
          ),
          'How many are left\?', 'Nechta qoldi?', 'gi'
        ),
        'How many are left', 'Nechta qoldi', 'gi'
      ),
      'How many in total\?', 'Jami nechta?', 'gi'
    ),
    'How many altogether\?', 'Hammasi nechta?', 'gi'
  ),
  explanation = COALESCE(
    regexp_replace(
      regexp_replace(
        explanation,
        'Subtract (\d+) from (\d+)', '\2 dan \1 ni ayiring', 'gi'
      ),
      'Add (\d+) and (\d+)', '\1 va \2 ni qo''shing', 'gi'
    ),
    explanation
  )
WHERE question_text ~* 'How many are left|How many in total|How many altogether|A store had|were sold|were bought|were given';

-- ============================================================
-- 3. ARIFMETIK SAVOLLAR — "What is X op Y?" patternlari
-- ============================================================

UPDATE public.questions SET
  question_text = regexp_replace(question_text, 'What is (\d+) \+ (\d+)\?', '\1 + \2 nechiga teng?', 'gi')
WHERE question_text ~* 'What is \d+ \+ \d+\?';

UPDATE public.questions SET
  question_text = regexp_replace(question_text, 'What is (\d+) - (\d+)\?', '\1 - \2 nechiga teng?', 'gi')
WHERE question_text ~* 'What is \d+ - \d+\?';

UPDATE public.questions SET
  question_text = regexp_replace(question_text, 'What is (\d+) × (\d+)\?', '\1 × \2 nechiga teng?', 'gi')
WHERE question_text ~* 'What is \d+ × \d+\?';

UPDATE public.questions SET
  question_text = regexp_replace(question_text, 'What is (\d+) ÷ (\d+)\?', '\1 ÷ \2 nechiga teng?', 'gi')
WHERE question_text ~* 'What is \d+ ÷ \d+\?';

UPDATE public.questions SET
  question_text = regexp_replace(question_text, 'What is half of (\d+)\?', '\1 ning yarmi necha?', 'gi')
WHERE question_text ~* 'What is half of \d+\?';

UPDATE public.questions SET
  question_text = regexp_replace(question_text, 'What is double (\d+)\?', '\1 ning ikki barobari necha?', 'gi')
WHERE question_text ~* 'What is double \d+\?';

UPDATE public.questions SET
  question_text = regexp_replace(question_text, 'Which is larger: (\d+) or (\d+)\?', 'Qaysi biri kattaroq: \1 yoki \2?', 'gi')
WHERE question_text ~* 'Which is larger:';

UPDATE public.questions SET
  question_text = regexp_replace(question_text, 'Which is smaller: (\d+) or (\d+)\?', 'Qaysi biri kichikroq: \1 yoki \2?', 'gi')
WHERE question_text ~* 'Which is smaller:';

UPDATE public.questions SET
  question_text = regexp_replace(question_text, 'What comes next: (.+)\?', 'Keyingisi necha: \1?', 'gi')
WHERE question_text ~* 'What comes next:';

-- "What is X?" — faqat hali tarjima qilinmaganlar
UPDATE public.questions SET
  question_text = regexp_replace(question_text, 'What is (.+)\?', '\1 nechiga teng?', 'gi')
WHERE question_text ~* '^What is .+\?'
  AND question_text !~* 'nechiga|necha|qanday|qaysi|teng';

-- ============================================================
-- 4. EXPLANATION TARJIMALARI
-- ============================================================

UPDATE public.questions SET
  explanation = CASE
    WHEN explanation ILIKE 'Add % and %'
      THEN regexp_replace(explanation, 'Add (\d+) and (\d+)', '\1 va \2 ni qo''shing', 'gi')
    WHEN explanation ILIKE 'Subtract % from %'
      THEN regexp_replace(explanation, 'Subtract (\d+) from (\d+)', '\2 dan \1 ni ayiring', 'gi')
    WHEN explanation ILIKE 'Multiply % by %'
      THEN regexp_replace(explanation, 'Multiply (\d+) by (\d+)', '\1 ni \2 ga ko''paytiring', 'gi')
    WHEN explanation ILIKE 'Divide % by %'
      THEN regexp_replace(explanation, 'Divide (\d+) by (\d+)', '\1 ni \2 ga bo''ling', 'gi')
    WHEN explanation = 'Find half of 14'   THEN '14 ning yarmisini toping'
    WHEN explanation = 'Find double of 9'  THEN '9 ning ikki barobarini toping'
    WHEN explanation ILIKE 'The answer is %'
      THEN regexp_replace(explanation, 'The answer is (.+)', 'Javob: \1', 'gi')
    WHEN explanation ILIKE 'Count the %'
      THEN regexp_replace(explanation, 'Count the (.+)', '\1 ni sanang', 'gi')
    WHEN explanation ILIKE 'Look at the %'
      THEN regexp_replace(explanation, 'Look at the (.+)', '\1 ga qarang', 'gi')
    WHEN explanation ILIKE 'Remember: %'
      THEN regexp_replace(explanation, 'Remember: (.+)', 'Eslab qoling: \1', 'gi')
    WHEN explanation ILIKE 'Think about %'
      THEN regexp_replace(explanation, 'Think about (.+)', '\1 haqida o''ylang', 'gi')
    ELSE explanation
  END
WHERE explanation IS NOT NULL
  AND explanation ~* '^(Add |Subtract |Multiply |Divide |Find half|Find double|The answer|Count the|Look at the|Remember:|Think about)';

-- ============================================================
-- 5. OPTIONS ichidagi inglizcha so'zlar
-- ============================================================

UPDATE public.questions SET
  options = replace(options::text, '"Yes"', '"Ha"')::jsonb
WHERE options::text ILIKE '%"Yes"%';

UPDATE public.questions SET
  options = replace(options::text, '"No"', '"Yo''q"')::jsonb
WHERE options::text ILIKE '%"No"%';

UPDATE public.questions SET
  options = replace(options::text, '"True"', '"To''g''ri"')::jsonb
WHERE options::text ILIKE '%"True"%';

UPDATE public.questions SET
  options = replace(options::text, '"False"', '"Noto''g''ri"')::jsonb
WHERE options::text ILIKE '%"False"%';

UPDATE public.questions SET
  options = replace(replace(replace(replace(replace(replace(
    options::text,
    '"Square"',    '"Kvadrat"'),
    '"Triangle"',  '"Uchburchak"'),
    '"Circle"',    '"Doira"'),
    '"Rectangle"', '"To''rtburchak"'),
    '"Pentagon"',  '"Beshburchak"'),
    '"Hexagon"',   '"Oltiburchak"')::jsonb
WHERE options::text ~* '"(Square|Triangle|Circle|Rectangle|Pentagon|Hexagon)"';

-- ============================================================
-- 6. CORRECT_ANSWER ichidagi inglizcha so'zlar
-- ============================================================

UPDATE public.questions SET correct_answer = 'Ha'             WHERE correct_answer = 'Yes';
UPDATE public.questions SET correct_answer = 'Yo''q'          WHERE correct_answer = 'No';
UPDATE public.questions SET correct_answer = 'To''g''ri'      WHERE correct_answer = 'True';
UPDATE public.questions SET correct_answer = 'Noto''g''ri'    WHERE correct_answer = 'False';
UPDATE public.questions SET correct_answer = 'Kvadrat'        WHERE correct_answer = 'Square';
UPDATE public.questions SET correct_answer = 'Uchburchak'     WHERE correct_answer = 'Triangle';
UPDATE public.questions SET correct_answer = 'Doira'          WHERE correct_answer = 'Circle';
UPDATE public.questions SET correct_answer = 'To''rtburchak'  WHERE correct_answer = 'Rectangle';
UPDATE public.questions SET correct_answer = 'Beshburchak'    WHERE correct_answer = 'Pentagon';
UPDATE public.questions SET correct_answer = 'Oltiburchak'    WHERE correct_answer = 'Hexagon';
