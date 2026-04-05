-- Qolgan inglizcha matnlarni o'zbekchaga o'tkazish
-- Remaining English text translation to Uzbek

-- 1. Multiple choice va type_answer savollari uchun tarjimalar
UPDATE public.questions
SET
  question_text = CASE question_text
    WHEN 'What is 15 + 7?' THEN '15 + 7 nechiga teng?'
    WHEN 'What is 12 - 5?' THEN '12 - 5 nechiga teng?'
    WHEN 'What is 8 × 3?' THEN '8 × 3 nechiga teng?'
    WHEN 'What is 20 ÷ 4?' THEN '20 ÷ 4 nechiga teng?'
    WHEN 'What is half of 14?' THEN '14 ning yarmi necha?'
    WHEN 'What is double 9?' THEN '9 ning ikki barobari necha?'
    WHEN 'Which is larger: 25 or 17?' THEN 'Qaysi biri kattaroq: 25 yoki 17?'
    WHEN 'Which is smaller: 13 or 8?' THEN 'Qaysi biri kichikroq: 13 yoki 8?'
    WHEN 'What comes next: 2, 4, 6, __?' THEN 'Keyingisi necha: 2, 4, 6, __?'
    WHEN 'What fraction is shaded?' THEN 'Qaysi qism kasr ko''rinishda?'
    WHEN 'What is 3/4 as a decimal?' THEN '3/4 o‘nlik ko‘rinishida necha?'
    WHEN 'What is 0.75 as a fraction?' THEN '0.75 kasr ko‘rinishida necha?'
    WHEN 'What is the perimeter?' THEN 'Perimetr necha?'
    WHEN 'What is the area?' THEN 'Yuzasi necha?'
    WHEN 'How many sides?' THEN 'Nechta tomoni bor?'
    WHEN 'What angle is this?' THEN 'Bu qanday burchak?'
    WHEN 'Is this a right angle?' THEN 'Bu to‘g''ri burchakmi?'
    WHEN 'What time is shown?' THEN 'Soat necha ko''rsatilgan?'
    WHEN 'What is the value of the missing number?' THEN 'Yo''qolgan sonning qiymati necha?'
    ELSE question_text
  END,
  explanation = CASE explanation
    WHEN 'Add 15 and 7' THEN '15 va 7 ni qo''shing'
    WHEN 'Subtract 5 from 12' THEN '12 dan 5 ni ayiring'
    WHEN 'Multiply 8 by 3' THEN '8 ni 3 ga ko''paytiring'
    WHEN 'Divide 20 by 4' THEN '20 ni 4 ga bo''ling'
    WHEN 'Find half of 14' THEN '14 ning yarmisini toping'
    WHEN 'Find double of 9' THEN '9 ning ikki barobarini toping'
    WHEN 'Compare 25 and 17' THEN '25 va 17 ni solishtiring'
    WHEN 'Compare 13 and 8' THEN '13 va 8 ni solishtiring'
    WHEN 'Continue the pattern: 2, 4, 6, __' THEN 'Naqshni davom ettiring: 2, 4, 6, __'
    WHEN 'The shaded part is 3 out of 4 equal parts' THEN 'Soyalangan qism 4 ta teng qismdan 3 tasi'
    WHEN '3/4 = 0.75' THEN '3/4 = 0.75'
    WHEN '0.75 = 3/4' THEN '0.75 = 3/4'
    WHEN 'Add all sides together' THEN 'Barcha tomonlarni qo''shing'
    WHEN 'Length × Width' THEN 'Uzunlik × Kenglik'
    WHEN 'Count the number of sides' THEN 'Tomonlar sonini sanang'
    WHEN 'Less than 90 degrees' THEN '90 gradusdan kam'
    WHEN 'Exactly 90 degrees' THEN 'Aynan 90 gradus'
    WHEN 'The hour hand shows the hour' THEN 'Soat mili soatni ko''rsatadi'
    WHEN 'Find the missing number in the sequence' THEN 'Ketma-ketlikdagi yo''qolgan sonni toping'
    WHEN 'The pattern adds 2 each time' THEN 'Har safada 2 qo''shiladi'
    ELSE explanation
  END,
  options = CASE 
    WHEN '["22","12","15","19"]'::jsonb THEN '["22","12","15","19"]'::jsonb
    WHEN '["7","17","25","19"]'::jsonb THEN '["7","17","25","19"]'::jsonb
    WHEN '["16","4","11","20"]'::jsonb THEN '["16","4","11","20"]'::jsonb
    WHEN '["3","4","5","6"]'::jsonb THEN '["3","4","5","6"]'::jsonb
    WHEN '["1/4","1/2","3/4","2/3"]'::jsonb THEN '["1/4","1/2","3/4","2/3"]'::jsonb
    WHEN '["0.25","0.5","0.75","1.0"]'::jsonb THEN '["0.25","0.5","0.75","1.0"]'::jsonb
    WHEN '["3","4","5","6"]'::jsonb THEN '["3","4","5","6"]'::jsonb
    WHEN '["8","12","16","20"]'::jsonb THEN '["8","12","16","20"]'::jsonb
    WHEN '["15","30","45","60"]'::jsonb THEN '["15","30","45","60"]'::jsonb
    WHEN '["90","45","60","30"]'::jsonb THEN '["90","45","60","30"]'::jsonb
    WHEN '["3","6","9","12"]'::jsonb THEN '["3","6","9","12"]'::jsonb
    WHEN '["4","8","12","16"]'::jsonb THEN '["4","8","12","16"]'::jsonb
    WHEN '["10","20","30","40"]'::jsonb THEN '["10","20","30","40"]'::jsonb
    WHEN '["5","10","15","20"]'::jsonb THEN '["5","10","15","20"]'::jsonb
    WHEN '["2","4","6","8"]'::jsonb THEN '["2","4","6","8"]'::jsonb
    WHEN '["3:00","3:30","4:00","4:30"]'::jsonb THEN '["3:00","3:30","4:00","4:30"]'::jsonb
    WHEN '["6","7","8","9"]'::jsonb THEN '["6","7","8","9"]'::jsonb
    WHEN '["12","1","2","3"]'::jsonb THEN '["12","1","2","3"]'::jsonb
    WHEN '["15","30","45","60"]'::jsonb THEN '["15","30","45","60"]'::jsonb
    WHEN '["5","10","15","20"]'::jsonb THEN '["5","10","15","20"]'::jsonb
    WHEN '["7","14","21","28"]'::jsonb THEN '["7","14","21","28"]'::jsonb
    WHEN '["9","18","27","36"]'::jsonb THEN '["9","18","27","36"]'::jsonb
    WHEN '["11","22","33","44"]'::jsonb THEN '["11","22","33","44"]'::jsonb
    WHEN '["13","26","39","52"]'::jsonb THEN '["13","26","39","52"]'::jsonb
    ELSE options
  END,
  correct_answer = CASE correct_answer
    WHEN '22' THEN '22'
    WHEN '17' THEN '17'
    WHEN '7' THEN '7'
    WHEN '16' THEN '16'
    WHEN '4' THEN '4'
    WHEN '11' THEN '11'
    WHEN '20' THEN '20'
    WHEN '3' THEN '3'
    WHEN '1/4' THEN '1/4'
    WHEN '1/2' THEN '1/2'
    WHEN '3/4' THEN '3/4'
    WHEN '2/3' THEN '2/3'
    WHEN '0.25' THEN '0.25'
    WHEN '0.5' THEN '0.5'
    WHEN '0.75' THEN '0.75'
    WHEN '1.0' THEN '1.0'
    WHEN '3' THEN '3'
    WHEN '4' THEN '4'
    WHEN '5' THEN '5'
    WHEN '6' THEN '6'
    WHEN '8' THEN '8'
    WHEN '9' THEN '9'
    WHEN '12' THEN '12'
    WHEN '15' THEN '15'
    WHEN '16' THEN '16'
    WHEN '20' THEN '20'
    WHEN '30' THEN '30'
    WHEN '45' THEN '45'
    WHEN '60' THEN '60'
    WHEN '90' THEN '90'
    WHEN '3:00' THEN '3:00'
    WHEN '3:30' THEN '3:30'
    WHEN '4:00' THEN '4:00'
    WHEN '4:30' THEN '4:30'
    WHEN '6' THEN '6'
    WHEN '7' THEN '7'
    WHEN '8' THEN '8'
    WHEN '9' THEN '9'
    WHEN '11' THEN '11'
    WHEN '12' THEN '12'
    WHEN '13' THEN '13'
    WHEN '14' THEN '14'
    WHEN '15' THEN '15'
    WHEN '20' THEN '20'
    WHEN '21' THEN '21'
    WHEN '22' THEN '22'
    WHEN '26' THEN '26'
    WHEN '27' THEN '27'
    WHEN '28' THEN '28'
    WHEN '30' THEN '30'
    WHEN '33' THEN '33'
    WHEN '36' THEN '36'
    WHEN '39' THEN '39'
    WHEN '44' THEN '44'
    WHEN '45' THEN '45'
    WHEN '52' THEN '52'
    ELSE correct_answer
  END
WHERE question_text LIKE '%What%' 
   OR question_text LIKE '%Which%'
   OR question_text LIKE '%Arrange%'
   OR question_text LIKE '%Order%'
   OR question_text LIKE '%Match%'
   OR question_text LIKE '%Sort%'
   OR question_text LIKE '%Compare%'
   OR question_text LIKE '%What comes next%'
   OR question_text LIKE '%What fraction%'
   OR question_text LIKE '%What is%'
   OR question_text LIKE '%How many%'
   OR question_text LIKE '%What angle%'
   OR question_text LIKE '%What time%'
   OR question_text LIKE '%What is the value%'
   OR question_text LIKE '%Is this%'
   OR question_text LIKE '%Find%'
   OR question_text LIKE '%Count%'
   OR question_text LIKE '%Less than%'
   OR question_text LIKE '%Exactly%'
   OR question_text LIKE '%The hour hand%'
   OR question_text LIKE '%Find the missing number%'
   OR question_text LIKE '%The pattern adds%';

-- 2. Equation builder savollari uchun tarjimalar
UPDATE public.questions
SET
  question_text = CASE question_text
    WHEN 'Solve: _ + 5 = 15' THEN 'Yeching: _ + 5 = 15'
    WHEN 'Solve: 8 × _ = 24' THEN 'Yeching: 8 × _ = 24'
    WHEN 'Solve: _ - 3 = 12' THEN 'Yeching: _ - 3 = 12'
    WHEN 'Solve: _ ÷ 4 = 6' THEN 'Yeching: _ ÷ 4 = 6'
    WHEN 'Complete: _ + _ = 20' THEN 'To''ldiring: _ + _ = 20'
    WHEN 'Complete: _ × _ = 18' THEN 'To''ldiring: _ × _ = 18'
    WHEN 'Complete: _ - _ = 10' THEN 'To''ldiring: _ - _ = 10'
    WHEN 'Balance: _ + _ = 25' THEN 'Tenglashtiring: _ + _ = 25'
    WHEN 'Create: _ × _ = 30' THEN 'Tuzing: _ × _ = 30'
    WHEN 'Make: _ ÷ _ = 12' THEN 'Qiling: _ ÷ _ = 12'
    ELSE question_text
  END,
  explanation = CASE explanation
    WHEN 'Find the missing number that makes the equation true' THEN 'Tenglikni to''g''ri qiladigan yo''qolgan sonni toping'
    WHEN 'What number times 8 equals 24?' THEN 'Qaysi sonni 8 ga ko''paytsangiz 24 bo''ladi?'
    WHEN 'What number plus 5 equals 15?' THEN 'Qaysi songa 5 qo''shsangiz 15 bo''ladi?'
    WHEN 'What number minus 3 equals 12?' THEN 'Qaysi sondan 3 ayirsangiz 12 bo''ladi?'
    WHEN 'What number divided by 4 equals 6?' THEN 'Qaysi sonni 4 ga bo''lsangiz 6 bo''ladi?'
    WHEN 'Find two numbers that add to 20' THEN '20 ga yig''adigan ikkita sonni toping'
    WHEN 'Find two numbers that multiply to 18' THEN '18 ga ko''paytadigan ikkita sonni toping'
    WHEN 'Find two numbers where the first minus the second equals 10' THEN 'Birinchisidan ikkinchisini ayirsangiz 10 bo''ladigan ikkita sonni toping'
    WHEN 'Find two numbers where the first divided by the second equals 5' THEN 'Birinchisini ikkinchisiga bo''lsangiz 5 bo''ladigan ikkita sonni toping'
    WHEN 'Find a pair of numbers that balance the equation' THEN 'Tenglamani tenglashtiradigan son juftligini toping'
    WHEN 'Think of two numbers that multiply to 30' THEN '30 ga ko''paytadigan ikkita sonni o''ylang'
    WHEN 'Think of a number that divides by 12 to give 3' THEN '12 ga bo''linganda 3 beradigan sonni o''ylang'
    ELSE explanation
  END
WHERE question_text LIKE 'Solve:%' 
   OR question_text LIKE '%Complete:%'
   OR question_text LIKE '%Balance:%'
   OR question_text LIKE '%Create:%'
   OR question_text LIKE '%Make:%'
   OR question_text LIKE '%Find two numbers%'
   OR question_text LIKE '%Think of two numbers%'
   OR question_text LIKE '%Think of a number%';

-- 3. Type answer savollari uchun tarjimalar
UPDATE public.questions
SET
  question_text = CASE question_text
    WHEN 'What is 15 + 7?' THEN '15 + 7 nechiga teng?'
    WHEN 'What is 12 - 5?' THEN '12 - 5 nechiga teng?'
    WHEN 'What is 8 × 3?' THEN '8 × 3 nechiga teng?'
    WHEN 'What is 20 ÷ 4?' THEN '20 ÷ 4 nechiga teng?'
    WHEN 'What is half of 14?' THEN '14 ning yarmi necha?'
    WHEN 'What is double 9?' THEN '9 ning ikki barobari necha?'
    WHEN 'Type the answer: __' THEN 'Javobni yozing: __'
    WHEN 'Enter your answer: ___' THEN 'Javobingizni kiriting: ___'
    WHEN 'Write the missing number: ___' THEN 'Yo''qolgan sonni yozing: ___'
    WHEN 'Fill in the blank: __' THEN 'Bo''shliqni to''ldiring: __'
    ELSE question_text
  END,
  explanation = CASE explanation
    WHEN 'Type your answer and press Enter' THEN 'Javobingizni yozib Enter tugmasini bosing'
    WHEN 'Press Enter after typing your answer' THEN 'Javobni yozgandan so''ng Enter tugmasini bosing'
    WHEN 'Write your answer in the space provided' THEN 'Javobingizni berilgan joyga yozing'
    WHEN 'Type the correct answer' THEN 'To''g''ri javobni yozing'
    ELSE explanation
  END
WHERE question_text LIKE 'Type the answer:%' 
   OR question_text LIKE '%Enter your answer:%'
   OR question_text LIKE '%Write the missing number:%'
   OR question_text LIKE '%Fill in the blank:%';

-- 4. Number line savollari uchun tarjimalar
UPDATE public.questions
SET
  question_text = CASE question_text
    WHEN 'Where is 7 on the number line?' THEN '7 son chiziqda qayerda?'
    WHEN 'Place the number 3 on the number line' THEN '3 sonini son chiziqqa joylashtiring'
    WHEN 'What number is halfway between 2 and 8?' THEN '2 va 8 o''rtasidagi qaysi son?'
    WHEN 'Which number is closer to 5: 4 or 6?' THEN '5 ga qaysi son yaqinroq: 4 yoki 6?'
    WHEN 'Move the marker to position ___' THEN 'Belgini ___ pozitsiyasiga ko''chiring'
    WHEN 'Click on the number line to place the marker' THEN 'Belgini joylashtirish uchun son chiziqqa bosing'
    WHEN 'Drag the marker to the correct position' THEN 'Belgini to''g''ri pozitsiyaga torting'
    ELSE question_text
  END,
  explanation = CASE explanation
    WHEN 'Find the position of 7 on the number line' THEN '7 sonining son chiziqdagi pozitsiyasini toping'
    WHEN 'The number 3 goes between 2 and 4' THEN '3 soni 2 va 4 orasiga joylashadi'
    WHEN 'The midpoint between 2 and 8 is 5' THEN '2 va 8 o''rtasidagi nuqta 5'
    WHEN '4 is closer to 5 than 6 is' THEN '4, 6 dan ko''ra 5 ga yaqinroq'
    WHEN 'Click to place markers at specific positions' THEN 'Belgilarni ma''lum bir pozitsiyalarga joylashtirish uchun bosing'
    WHEN 'Drag markers to their correct positions' THEN 'Belgilarni to''g''ri pozitsiyalariga torting'
    ELSE explanation
  END
WHERE question_text LIKE '%number line%' 
   OR question_text LIKE '%Where is%' 
   OR question_text LIKE '%Place the number%'
   OR question_text LIKE '%What number is halfway%'
   OR question_text LIKE '%Which number is closer%'
   OR question_text LIKE '%Move the marker%'
   OR question_text LIKE '%Click on the number line%'
   OR question_text LIKE '%Drag the marker%';

-- 5. Geometry savollari uchun qo''shimcha tarjimalar
UPDATE public.questions
SET
  question_text = CASE question_text
    WHEN 'How many sides does a triangle have?' THEN 'Uchburchakning nechta tomoni bor?'
    WHEN 'How many sides does a square have?' THEN 'Kvadratning nechta tomoni bor?'
    WHEN 'How many sides does a circle have?' THEN 'Doiraning nechta tomoni bor?'
    WHEN 'What shape is this?' THEN 'Bu qanday shakl?'
    WHEN 'Identify the shape' THEN 'Shaklni aniqlang'
    WHEN 'Count the sides' THEN 'Tomonlarni sanang'
    WHEN 'Name this shape' THEN 'Bu shaklning nomi'
    ELSE question_text
  END,
  explanation = CASE explanation
    WHEN 'A triangle has 3 sides' THEN 'Uchburchakning 3 ta tomoni bor'
    WHEN 'A square has 4 equal sides' THEN 'Kvadratning 4 ta teng tomoni bor'
    WHEN 'A circle has no straight sides' THEN 'Doiraning to''g''ri tomonlari yo''q'
    WHEN 'This is a triangle' THEN 'Bu uchburchak'
    WHEN 'This is a square' THEN 'Bu kvadrat'
    WHEN 'This is a circle' THEN 'Bu doira'
    WHEN 'Count each side and add them together' THEN 'Har bir tomonni sanab ularning yig''indisini toping'
    WHEN 'Look at the shape and name it' THEN 'Shaklga qarab nomini toping'
    ELSE explanation
  END
WHERE question_text LIKE '%sides does%' 
   OR question_text LIKE '%What shape%'
   OR question_text LIKE '%Identify the shape%'
   OR question_text LIKE '%Count the sides%'
   OR question_text LIKE '%Name this shape%';
