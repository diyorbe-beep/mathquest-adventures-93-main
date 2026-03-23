-- Mavjud savollarni to'liq o'zbekchaga o'tkazish (SQL Editor da bir marta ishga tushiring)
-- Migratsiya nusxasi: 20260324134000_full_uzbek_questions.sql

UPDATE public.questions
SET
  question_text = 'To''g''ri tenglikni tuzing: _ + _ = 12',
  explanation = '4 + 8 = 12 bo''lishi uchun 4 va 8 ni joylashtiring',
  options = '["4","8","5","3"]'::jsonb,
  correct_answer = '4,8'
WHERE question_type = 'drag_drop'
  AND (
    question_text = 'Arrange to make a correct equation: _ + _ = 12'
    OR question_text = 'To''g''ri tenglikni tuzing: _ + _ = 12'
  );

UPDATE public.questions
SET
  question_text = 'Eng kichikdan eng kattagacha tartiblang: 15, 7, 23, 3',
  explanation = 'Sonlarni eng kichikdan boshlab tartiblang',
  options = '["15","7","23","3"]'::jsonb,
  correct_answer = '3,7,15,23'
WHERE question_type = 'drag_drop'
  AND (
    question_text = 'Arrange in order from smallest to largest: 15, 7, 23, 3'
    OR question_text = 'Eng kichikdan eng kattagacha tartiblang: 15, 7, 23, 3'
  );

UPDATE public.questions
SET
  question_text = 'To''ldiring: _ - _ = 5',
  explanation = '12 - 7 = 5 bo''lishi uchun 12 va 7 ni joylashtiring',
  options = '["12","7","9","3"]'::jsonb,
  correct_answer = '12,7'
WHERE question_type = 'drag_drop'
  AND (
    question_text = 'Arrange to complete: _ - _ = 5'
    OR question_text = 'To''ldiring: _ - _ = 5'
  );

UPDATE public.questions
SET
  question_text = 'Eng kattadan eng kichikgacha tartiblang: 45, 12, 67, 34',
  explanation = 'Sonlarni eng kattadan boshlab tartiblang',
  options = '["45","12","67","34"]'::jsonb,
  correct_answer = '67,45,34,12'
WHERE question_type = 'drag_drop'
  AND (
    question_text = 'Order from largest to smallest: 45, 12, 67, 34'
    OR question_text = 'Eng kattadan eng kichikgacha tartiblang: 45, 12, 67, 34'
  );

UPDATE public.questions
SET
  question_text = 'Bu kasrlarni eng kichikdan eng kattagacha tartiblang: 1/2, 1/4, 3/4, 1/8',
  explanation = 'Kasrlarni o''nlikka aylantirib solishtiring',
  options = '["1/2","1/4","3/4","1/8"]'::jsonb,
  correct_answer = '1/8,1/4,1/2,3/4'
WHERE question_type = 'drag_drop'
  AND (
    question_text = 'Arrange these fractions from smallest to largest: 1/2, 1/4, 3/4, 1/8'
    OR question_text = 'Bu kasrlarni eng kichikdan eng kattagacha tartiblang: 1/2, 1/4, 3/4, 1/8'
  );

UPDATE public.questions
SET
  question_text = 'Moslashtiring: qaysi kasrlar 1/2 ga teng? To''g''rilarni surib tanlang.',
  explanation = '2/4 va 3/6 ikkalasi ham 1/2 ga soddalanadi',
  options = '["2/4","3/6","1/3","2/5"]'::jsonb,
  correct_answer = '2/4,3/6'
WHERE question_type = 'drag_drop'
  AND (
    question_text = 'Match: Which fractions equal 1/2? Drag the correct ones.'
    OR question_text = 'Moslashtiring: qaysi kasrlar 1/2 ga teng? To''g''rilarni surib tanlang.'
  );

UPDATE public.questions
SET
  question_text = 'Shakllarni tomonlar soni bo''yicha tartiblang (eng kamidan): Kvadrat, Uchburchak, Oltiburchak, Beshburchak',
  explanation = 'Uchburchak=3, Kvadrat=4, Beshburchak=5, Oltiburchak=6',
  options = '["Kvadrat","Uchburchak","Oltiburchak","Beshburchak"]'::jsonb,
  correct_answer = 'Uchburchak,Kvadrat,Beshburchak,Oltiburchak'
WHERE question_type = 'drag_drop'
  AND (
    question_text = 'Order these shapes by number of sides (fewest first): Square, Triangle, Hexagon, Pentagon'
    OR question_text = 'Shakllarni tomonlar soni bo''yicha tartiblang (eng kamidan): Kvadrat, Uchburchak, Oltiburchak, Beshburchak'
  );

UPDATE public.questions
SET
  question_text = 'Qaysi shakllarning 4 ta tomoni bor? Ularni surib tanlang.',
  explanation = 'To''rtburchak va kvadratning ikkalasida ham 4 ta tomon bor',
  options = '["To''rtburchak","Uchburchak","Kvadrat","Doira"]'::jsonb,
  correct_answer = 'To''rtburchak,Kvadrat'
WHERE question_type = 'drag_drop'
  AND (
    question_text = 'Which shapes have 4 sides? Drag them.'
    OR question_text = 'Qaysi shakllarning 4 ta tomoni bor? Ularni surib tanlang.'
  );
