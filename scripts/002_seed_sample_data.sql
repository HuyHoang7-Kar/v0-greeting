-- Insert sample teacher profile (this will be created when a teacher signs up)
-- Sample flashcards for testing
INSERT INTO public.flashcards (question, answer, category, difficulty, created_by) VALUES
  ('What is the capital of Vietnam?', 'Hanoi', 'Geography', 'easy', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1)),
  ('What is 2 + 2?', '4', 'Mathematics', 'easy', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1)),
  ('Who wrote Romeo and Juliet?', 'William Shakespeare', 'Literature', 'medium', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1)),
  ('What is the chemical symbol for water?', 'H2O', 'Chemistry', 'easy', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1)),
  ('In what year did World War II end?', '1945', 'History', 'medium', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1))
ON CONFLICT DO NOTHING;

-- Sample quiz
INSERT INTO public.quizzes (title, description, created_by) VALUES
  ('Basic Knowledge Quiz', 'A simple quiz to test basic knowledge across various subjects', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1))
ON CONFLICT DO NOTHING;

-- Sample quiz questions
INSERT INTO public.quiz_questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer) VALUES
  (
    (SELECT id FROM public.quizzes WHERE title = 'Basic Knowledge Quiz' LIMIT 1),
    'What is the largest planet in our solar system?',
    'Earth',
    'Jupiter',
    'Saturn',
    'Mars',
    'B'
  ),
  (
    (SELECT id FROM public.quizzes WHERE title = 'Basic Knowledge Quiz' LIMIT 1),
    'Which programming language is known for web development?',
    'Python',
    'JavaScript',
    'C++',
    'Java',
    'B'
  ),
  (
    (SELECT id FROM public.quizzes WHERE title = 'Basic Knowledge Quiz' LIMIT 1),
    'What is the square root of 64?',
    '6',
    '7',
    '8',
    '9',
    'C'
  )
ON CONFLICT DO NOTHING;
