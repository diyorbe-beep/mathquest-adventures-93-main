-- Lessons (title + description) ni o'zbekchaga o'tkazish

-- Aniq mos keladigan nomlar
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

-- Umumiy inglizcha tokenlarni dars nomida almashtirish
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

-- Description uchun kengroq almashtirish
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
