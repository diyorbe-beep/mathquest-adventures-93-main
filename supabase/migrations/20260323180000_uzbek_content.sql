-- O'zbek tiliga mahalliy kontent (mavjud yozuvlarni yangilash)

UPDATE public.topics SET
  name = 'Qo''shish',
  description = 'Natural sonlarni qo''shish va terma bilan ishlash'
WHERE slug = 'addition';

UPDATE public.topics SET
  name = 'Ayirish',
  description = 'Ayirish amallari va farqlarni topish'
WHERE slug = 'subtraction';

UPDATE public.topics SET
  name = 'Kasrlar',
  description = 'Kasrlar bilan ishlash va solishtirish'
WHERE slug = 'fractions';

UPDATE public.topics SET
  name = 'Geometriya',
  description = 'Shakllar, tomonlar va fazoviy tushunchalar'
WHERE slug = 'geometry';

-- Surib qo''yish savollari (inglizcha matn bo''lsa yangilanadi)
UPDATE public.questions SET
  question_text = 'To''g''ri tenglikni tuzing: _ + _ = 12',
  explanation = '4 + 8 = 12 bo''lishi uchun 4 va 8 ni joylashtiring'
WHERE question_text = 'Arrange to make a correct equation: _ + _ = 12';

UPDATE public.questions SET
  question_text = 'Eng kichikdan eng kattagacha tartiblang: 15, 7, 23, 3',
  explanation = 'Sonlarni eng kichikdan boshlab tartiblang'
WHERE question_text = 'Arrange in order from smallest to largest: 15, 7, 23, 3';

UPDATE public.questions SET
  question_text = 'To''ldiring: _ - _ = 5',
  explanation = '12 - 7 = 5 bo''lishi uchun 12 va 7 ni joylashtiring'
WHERE question_text = 'Arrange to complete: _ - _ = 5';

UPDATE public.questions SET
  question_text = 'Eng kattadan eng kichikgacha tartiblang: 45, 12, 67, 34',
  explanation = 'Sonlarni eng kattadan boshlab tartiblang'
WHERE question_text = 'Order from largest to smallest: 45, 12, 67, 34';

UPDATE public.questions SET
  question_text = 'Bu kasrlarni eng kichikdan eng kattagacha tartiblang: 1/2, 1/4, 3/4, 1/8',
  explanation = 'Kasrlarni o''nlikka aylantirib solishtiring'
WHERE question_text = 'Arrange these fractions from smallest to largest: 1/2, 1/4, 3/4, 1/8';

UPDATE public.questions SET
  question_text = 'Moslashtiring: qaysi kasrlar 1/2 ga teng? To''g''rilarni surib tanlang.',
  explanation = '2/4 va 3/6 ikkalasi ham 1/2 ga soddalanadi'
WHERE question_text = 'Match: Which fractions equal 1/2? Drag the correct ones.';

UPDATE public.questions SET
  question_text = 'Shakllarni tomonlar soni bo''yicha tartiblang (eng kamidan): Kvadrat, Uchburchak, Oltiburchak, Beshburchak',
  explanation = 'Uchburchak=3, Kvadrat=4, Beshburchak=5, Oltiburchak=6'
WHERE question_text = 'Order these shapes by number of sides (fewest first): Square, Triangle, Hexagon, Pentagon';

UPDATE public.questions SET
  question_text = 'Qaysi shakllarning 4 ta tomoni bor? Ularni surib tanlang.',
  explanation = 'To''rtburchak va kvadratning ikkalasida ham 4 ta tomon bor'
WHERE question_text = 'Which shapes have 4 sides? Drag them.';

-- Yangi foydalanuvchi uchun standart taxallus prefiksi
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', 'qidiruvchi_' || LEFT(NEW.id::text, 8)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
