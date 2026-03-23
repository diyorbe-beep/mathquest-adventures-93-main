-- Add time_spent_seconds to user_progress
ALTER TABLE public.user_progress ADD COLUMN IF NOT EXISTS time_spent_seconds integer DEFAULT 0;

-- Insert drag_drop questions for each topic (2 per first lesson of each topic = 8 total)
INSERT INTO public.questions (lesson_id, question_text, question_type, options, correct_answer, explanation, difficulty, sort_order)
SELECT l.id, q.question_text, 'drag_drop', q.options::jsonb, q.correct_answer, q.explanation, q.difficulty, q.sort_order
FROM public.lessons l
CROSS JOIN (VALUES
  ('To''g''ri tenglikni tuzing: _ + _ = 12', '["4","8","5","3"]'::text, '4,8', '4 + 8 = 12 bo''lishi uchun 4 va 8 ni joylashtiring', 2, 101),
  ('Eng kichikdan eng kattagacha tartiblang: 15, 7, 23, 3', '["15","7","23","3"]'::text, '3,7,15,23', 'Sonlarni eng kichikdan boshlab tartiblang', 1, 102)
) AS q(question_text, options, correct_answer, explanation, difficulty, sort_order)
WHERE l.topic_id = (SELECT id FROM public.topics WHERE slug = 'addition')
AND l.level_number = 1;

INSERT INTO public.questions (lesson_id, question_text, question_type, options, correct_answer, explanation, difficulty, sort_order)
SELECT l.id, q.question_text, 'drag_drop', q.options::jsonb, q.correct_answer, q.explanation, q.difficulty, q.sort_order
FROM public.lessons l
CROSS JOIN (VALUES
  ('To''ldiring: _ - _ = 5', '["12","7","9","3"]'::text, '12,7', '12 - 7 = 5 bo''lishi uchun 12 va 7 ni joylashtiring', 2, 101),
  ('Eng kattadan eng kichikgacha tartiblang: 45, 12, 67, 34', '["45","12","67","34"]'::text, '67,45,34,12', 'Sonlarni eng kattadan boshlab tartiblang', 1, 102)
) AS q(question_text, options, correct_answer, explanation, difficulty, sort_order)
WHERE l.topic_id = (SELECT id FROM public.topics WHERE slug = 'subtraction')
AND l.level_number = 1;

INSERT INTO public.questions (lesson_id, question_text, question_type, options, correct_answer, explanation, difficulty, sort_order)
SELECT l.id, q.question_text, 'drag_drop', q.options::jsonb, q.correct_answer, q.explanation, q.difficulty, q.sort_order
FROM public.lessons l
CROSS JOIN (VALUES
  ('Bu kasrlarni eng kichikdan eng kattagacha tartiblang: 1/2, 1/4, 3/4, 1/8', '["1/2","1/4","3/4","1/8"]'::text, '1/8,1/4,1/2,3/4', 'Kasrlarni o''nlikka aylantirib solishtiring', 2, 101),
  ('Moslashtiring: qaysi kasrlar 1/2 ga teng? To''g''rilarni surib tanlang.', '["2/4","3/6","1/3","2/5"]'::text, '2/4,3/6', '2/4 va 3/6 ikkalasi ham 1/2 ga soddalanadi', 2, 102)
) AS q(question_text, options, correct_answer, explanation, difficulty, sort_order)
WHERE l.topic_id = (SELECT id FROM public.topics WHERE slug = 'fractions')
AND l.level_number = 1;

INSERT INTO public.questions (lesson_id, question_text, question_type, options, correct_answer, explanation, difficulty, sort_order)
SELECT l.id, q.question_text, 'drag_drop', q.options::jsonb, q.correct_answer, q.explanation, q.difficulty, q.sort_order
FROM public.lessons l
CROSS JOIN (VALUES
  ('Shakllarni tomonlar soni bo''yicha tartiblang (eng kamidan): Kvadrat, Uchburchak, Oltiburchak, Beshburchak', '["Kvadrat","Uchburchak","Oltiburchak","Beshburchak"]'::text, 'Uchburchak,Kvadrat,Beshburchak,Oltiburchak', 'Uchburchak=3, Kvadrat=4, Beshburchak=5, Oltiburchak=6', 1, 101),
  ('Qaysi shakllarning 4 ta tomoni bor? Ularni surib tanlang.', '["To''rtburchak","Uchburchak","Kvadrat","Doira"]'::text, 'To''rtburchak,Kvadrat', 'To''rtburchak va kvadratning ikkalasida ham 4 ta tomon bor', 1, 102)
) AS q(question_text, options, correct_answer, explanation, difficulty, sort_order)
WHERE l.topic_id = (SELECT id FROM public.topics WHERE slug = 'geometry')
AND l.level_number = 1;