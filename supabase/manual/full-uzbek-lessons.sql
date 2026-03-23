-- Mavjud darslarni (title + description) to'liq o'zbekchaga o'tkazish
-- SQL Editor da bir marta ishga tushiring
-- Migratsiya nusxasi: 20260324142000_full_uzbek_lessons.sql

UPDATE public.lessons
SET title = 'Qo''shish asoslari'
WHERE title ILIKE 'Addition Basics';

UPDATE public.lessons
SET title = 'Ayirish asoslari'
WHERE title ILIKE 'Subtraction Basics';

UPDATE public.lessons
SET title = 'Kasrlar asoslari'
WHERE title ILIKE 'Fractions Basics';

UPDATE public.lessons
SET title = 'Geometriya asoslari'
WHERE title ILIKE 'Geometry Basics';

UPDATE public.lessons
SET title = trim(
  regexp_replace(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          regexp_replace(
            regexp_replace(
              regexp_replace(
                regexp_replace(title, '\mAddition\M', 'Qo''shish', 'gi'),
                '\mSubtraction\M', 'Ayirish', 'gi'
              ),
              '\mFractions\M', 'Kasrlar', 'gi'
            ),
            '\mGeometry\M', 'Geometriya', 'gi'
          ),
          '\mBasics\M', 'asoslari', 'gi'
        ),
        '\mPractice\M', 'mashq', 'gi'
      ),
      '\mQuiz\M', 'test', 'gi'
    ),
    '\mChallenge\M', 'sinov', 'gi'
  )
)
WHERE title ~* '(addition|subtraction|fractions|geometry|basics|practice|quiz|challenge)';

UPDATE public.lessons
SET description = trim(
  regexp_replace(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          regexp_replace(
            regexp_replace(
              regexp_replace(
                regexp_replace(
                  regexp_replace(
                    regexp_replace(description, '\mLearn\M', 'O''rganing', 'gi'),
                    '\mAddition\M', 'qo''shish', 'gi'
                  ),
                  '\mSubtraction\M', 'ayirish', 'gi'
                ),
                '\mFractions\M', 'kasrlar', 'gi'
              ),
              '\mGeometry\M', 'geometriya', 'gi'
            ),
            '\mBasics\M', 'asoslari', 'gi'
          ),
          '\mPractice\M', 'mashq', 'gi'
        ),
        '\mfrom smallest to largest\M', 'eng kichikdan eng kattagacha', 'gi'
      ),
      '\mfrom largest to smallest\M', 'eng kattadan eng kichikkacha', 'gi'
    ),
    '\s+', ' ', 'g'
  )
)
WHERE description IS NOT NULL
  AND description ~* '(learn|addition|subtraction|fractions|geometry|basics|practice|smallest|largest)';

-- Inglizcha sarlavha va tavsiflarni aniq matn bo‘yicha o‘zbekchaga (admin va ilova ro‘yxati uchun)
UPDATE public.lessons SET title = 'Kasrlar nima?' WHERE title IN ('What Are Fractions?', 'What Are Kasrlar?');
UPDATE public.lessons SET title = 'Bir xonali sonlarni qo‘shish' WHERE title = 'Adding Single Digits';
UPDATE public.lessons SET title = 'Atrofdagi shakllar' WHERE title IN ('Shapes All Around', 'Shakllar All Around', 'Shakllar atrofimizda');
UPDATE public.lessons SET title = 'Bir xonali sonlarni ayirish' WHERE title = 'Subtracting Single Digits';
UPDATE public.lessons SET title = 'Perimetr' WHERE title = 'Perimeter';
UPDATE public.lessons SET title = 'Kasrlarni solishtirish' WHERE title = 'Comparing Fractions';
UPDATE public.lessons SET title = 'Kasrlarni qo‘shish' WHERE title = 'Adding Fractions';
UPDATE public.lessons SET title = 'Kasrlarni ayirish' WHERE title = 'Subtracting Fractions';
UPDATE public.lessons SET title = 'Kasrlarni ko‘paytirish' WHERE title = 'Multiplying Fractions';
UPDATE public.lessons SET title = 'Kasrlarni bo‘lish' WHERE title = 'Dividing Fractions';
UPDATE public.lessons SET title = 'Kasrlarni soddalashtirish' WHERE title = 'Simplifying Fractions';
UPDATE public.lessons SET title = 'Kasrlarni tartiblash' WHERE title = 'Ordering Fractions';
UPDATE public.lessons SET title = 'Kasrlarni qiyoslash' WHERE title = 'Equivalent Fractions';
UPDATE public.lessons SET title = 'Kasrlar va o‘lchov birliklari' WHERE title = 'Fractions and Measurement';
UPDATE public.lessons SET title = 'Kasrlar va ulushlar' WHERE title = 'Fractions and Shares';
UPDATE public.lessons SET title = 'Kasrlar va nisbatlar' WHERE title = 'Fractions and Ratios';
UPDATE public.lessons SET title = 'Kasrlar va foizlar' WHERE title = 'Fractions and Percentages';
UPDATE public.lessons SET title = 'Kasrlar va ulushlar (qiyos)' WHERE title = 'Fractions and Proportions';
UPDATE public.lessons SET description = 'Butunning qismlari haqida o‘rganing' WHERE description = 'Learning about parts of a whole';
UPDATE public.lessons SET description = '1 dan 9 gacha bo‘lgan sonlarni qo‘shing' WHERE description = 'Add numbers from 1 to 9';
UPDATE public.lessons SET description = 'Asosiy shakllarni tanlang' WHERE description IN ('Identify basic shapes', 'Identify basic Shakllar');
UPDATE public.lessons SET description = '1 dan 9 gacha bo‘lgan sonlarni ayiring' WHERE description = 'Subtract numbers from 1 to 9';
UPDATE public.lessons SET description = 'Shakllar atrofini o‘lchang' WHERE description IN ('Measure around shapes', 'Measure around Shakllar');
UPDATE public.lessons SET description = 'Qaysi kasr kattaroq?' WHERE description = 'Which fraction is bigger?';
