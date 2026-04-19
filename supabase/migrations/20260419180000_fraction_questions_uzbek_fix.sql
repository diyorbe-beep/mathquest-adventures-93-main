-- Kasrlar savollarida tabiiy o'zbekcha matn va izohlarni yangilash
-- (oldingi migratsiyada "What is … ?" → "… nechiga teng?" noto'g'ri ishlagan bo'lishi mumkin)

UPDATE public.questions SET
  question_text = 'Rasmda bo''yalgan qism qaysi kasrga teng?',
  explanation = CASE
    WHEN explanation = 'The shaded part is 3 out of 4 equal parts' THEN 'Bo''yalgan qism 4 ta teng qismdan 3 tasi (3/4).'
    ELSE explanation
  END
WHERE question_text IN (
  'What fraction is shaded?',
  'Qaysi qism kasr ko''rinishda?',
  'Qaysi qism kasr ko‘rinishida?'
);

UPDATE public.questions SET
  question_text = '3/4 soni o''nlik kasrda qanday yoziladi?'
WHERE question_text IN ('What is 3/4 as a decimal?', '3/4 as a decimal nechiga teng?');

UPDATE public.questions SET
  question_text = '0,75 qaysi oddiy kasrga teng?'
WHERE question_text IN ('What is 0.75 as a fraction?', '0.75 as a fraction nechiga teng?');
