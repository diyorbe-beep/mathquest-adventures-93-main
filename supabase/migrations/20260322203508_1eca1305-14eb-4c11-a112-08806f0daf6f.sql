-- Add time_spent_seconds to user_progress
ALTER TABLE public.user_progress ADD COLUMN IF NOT EXISTS time_spent_seconds integer DEFAULT 0;

-- Insert drag_drop questions for each topic (2 per first lesson of each topic = 8 total)
INSERT INTO public.questions (lesson_id, question_text, question_type, options, correct_answer, explanation, difficulty, sort_order)
SELECT l.id, q.question_text, 'drag_drop', q.options::jsonb, q.correct_answer, q.explanation, q.difficulty, q.sort_order
FROM public.lessons l
CROSS JOIN (VALUES
  ('Arrange to make a correct equation: _ + _ = 12', '["4","8","5","3"]'::text, '4,8', 'Drag 4 and 8 to make 4 + 8 = 12', 2, 101),
  ('Arrange in order from smallest to largest: 15, 7, 23, 3', '["15","7","23","3"]'::text, '3,7,15,23', 'Sort numbers from smallest to largest', 1, 102)
) AS q(question_text, options, correct_answer, explanation, difficulty, sort_order)
WHERE l.topic_id = (SELECT id FROM public.topics WHERE slug = 'addition')
AND l.level_number = 1;

INSERT INTO public.questions (lesson_id, question_text, question_type, options, correct_answer, explanation, difficulty, sort_order)
SELECT l.id, q.question_text, 'drag_drop', q.options::jsonb, q.correct_answer, q.explanation, q.difficulty, q.sort_order
FROM public.lessons l
CROSS JOIN (VALUES
  ('Arrange to complete: _ - _ = 5', '["12","7","9","3"]'::text, '12,7', 'Drag 12 and 7 to make 12 - 7 = 5', 2, 101),
  ('Order from largest to smallest: 45, 12, 67, 34', '["45","12","67","34"]'::text, '67,45,34,12', 'Sort numbers from largest to smallest', 1, 102)
) AS q(question_text, options, correct_answer, explanation, difficulty, sort_order)
WHERE l.topic_id = (SELECT id FROM public.topics WHERE slug = 'subtraction')
AND l.level_number = 1;

INSERT INTO public.questions (lesson_id, question_text, question_type, options, correct_answer, explanation, difficulty, sort_order)
SELECT l.id, q.question_text, 'drag_drop', q.options::jsonb, q.correct_answer, q.explanation, q.difficulty, q.sort_order
FROM public.lessons l
CROSS JOIN (VALUES
  ('Arrange these fractions from smallest to largest: 1/2, 1/4, 3/4, 1/8', '["1/2","1/4","3/4","1/8"]'::text, '1/8,1/4,1/2,3/4', 'Compare fractions by converting to decimals', 2, 101),
  ('Match: Which fractions equal 1/2? Drag the correct ones.', '["2/4","3/6","1/3","2/5"]'::text, '2/4,3/6', '2/4 and 3/6 both simplify to 1/2', 2, 102)
) AS q(question_text, options, correct_answer, explanation, difficulty, sort_order)
WHERE l.topic_id = (SELECT id FROM public.topics WHERE slug = 'fractions')
AND l.level_number = 1;

INSERT INTO public.questions (lesson_id, question_text, question_type, options, correct_answer, explanation, difficulty, sort_order)
SELECT l.id, q.question_text, 'drag_drop', q.options::jsonb, q.correct_answer, q.explanation, q.difficulty, q.sort_order
FROM public.lessons l
CROSS JOIN (VALUES
  ('Order these shapes by number of sides (fewest first): Square, Triangle, Hexagon, Pentagon', '["Square","Triangle","Hexagon","Pentagon"]'::text, 'Triangle,Square,Pentagon,Hexagon', 'Triangle=3, Square=4, Pentagon=5, Hexagon=6', 1, 101),
  ('Which shapes have 4 sides? Drag them.', '["Rectangle","Triangle","Square","Circle"]'::text, 'Rectangle,Square', 'Rectangles and squares both have 4 sides', 1, 102)
) AS q(question_text, options, correct_answer, explanation, difficulty, sort_order)
WHERE l.topic_id = (SELECT id FROM public.topics WHERE slug = 'geometry')
AND l.level_number = 1;