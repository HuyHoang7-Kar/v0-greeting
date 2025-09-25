-- Add new game types for subject-specific games
ALTER TABLE public.games DROP CONSTRAINT IF EXISTS games_type_check;
ALTER TABLE public.games ADD CONSTRAINT games_type_check 
  CHECK (type IN ('memory_match', 'word_scramble', 'speed_quiz', 'drag_drop', 'math_calculator', 'number_pattern', 'english_flashcard', 'grammar_quiz', 'poetry_match', 'literature_quiz'));

-- Insert Math Games
INSERT INTO public.games (name, description, type, category, difficulty, created_by) VALUES
('Máy tính Toán học', 'Sử dụng máy tính để giải các bài toán cơ bản', 'math_calculator', 'math', 'easy', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1)),
('Tìm Quy luật Số', 'Tìm quy luật trong dãy số và điền số tiếp theo', 'number_pattern', 'math', 'medium', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1));

-- Insert English Games  
INSERT INTO public.games (name, description, type, category, difficulty, created_by) VALUES
('Thẻ từ vựng Tiếng Anh', 'Học từ vựng tiếng Anh qua thẻ ghi nhớ tương tác', 'english_flashcard', 'english', 'easy', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1)),
('Ngữ pháp Tiếng Anh', 'Kiểm tra kiến thức ngữ pháp tiếng Anh', 'grammar_quiz', 'english', 'medium', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1));

-- Insert Literature Games
INSERT INTO public.games (name, description, type, category, difficulty, created_by) VALUES
('Ghép thơ Việt Nam', 'Ghép các câu thơ với tác giả hoặc tác phẩm tương ứng', 'poetry_match', 'literature', 'medium', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1)),
('Văn học Việt Nam', 'Kiểm tra kiến thức văn học Việt Nam', 'literature_quiz', 'literature', 'hard', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1));

-- Add sample questions for Math Calculator Game
INSERT INTO public.game_questions (game_id, question, correct_answer, options, points) VALUES
((SELECT id FROM public.games WHERE type = 'math_calculator' AND name = 'Máy tính Toán học'), '25 + 37', '62', '["60", "62", "64", "66"]', 10),
((SELECT id FROM public.games WHERE type = 'math_calculator' AND name = 'Máy tính Toán học'), '144 ÷ 12', '12', '["10", "11", "12", "13"]', 10),
((SELECT id FROM public.games WHERE type = 'math_calculator' AND name = 'Máy tính Toán học'), '8 × 9', '72', '["70", "71", "72", "73"]', 10),
((SELECT id FROM public.games WHERE type = 'math_calculator' AND name = 'Máy tính Toán học'), '100 - 47', '53', '["51", "52", "53", "54"]', 10),
((SELECT id FROM public.games WHERE type = 'math_calculator' AND name = 'Máy tính Toán học'), '15 × 6 + 20', '110', '["108", "109", "110", "111"]', 15);

-- Add sample questions for Number Pattern Game
INSERT INTO public.game_questions (game_id, question, correct_answer, options, hints, points) VALUES
((SELECT id FROM public.games WHERE type = 'number_pattern' AND name = 'Tìm Quy luật Số'), '2, 4, 6, 8, ?', '10', '["9", "10", "11", "12"]', 'Dãy số chẵn tăng dần', 10),
((SELECT id FROM public.games WHERE type = 'number_pattern' AND name = 'Tìm Quy luật Số'), '1, 4, 9, 16, ?', '25', '["20", "23", "25", "30"]', 'Bình phương của các số tự nhiên', 15),
((SELECT id FROM public.games WHERE type = 'number_pattern' AND name = 'Tìm Quy luật Số'), '3, 6, 12, 24, ?', '48', '["36", "42", "48", "54"]', 'Mỗi số gấp đôi số trước', 15),
((SELECT id FROM public.games WHERE type = 'number_pattern' AND name = 'Tìm Quy luật Số'), '1, 1, 2, 3, 5, ?', '8', '["6", "7", "8", "9"]', 'Dãy Fibonacci', 20),
((SELECT id FROM public.games WHERE type = 'number_pattern' AND name = 'Tìm Quy luật Số'), '100, 90, 81, 73, ?', '66', '["64", "65", "66", "67"]', 'Giảm dần với khoảng cách tăng', 20);

-- Add sample questions for English Flashcard Game
INSERT INTO public.game_questions (game_id, question, correct_answer, options, points) VALUES
((SELECT id FROM public.games WHERE type = 'english_flashcard' AND name = 'Thẻ từ vựng Tiếng Anh'), 'Apple', 'Quả táo', '["Quả táo", "Quả cam", "Quả chuối", "Quả nho"]', 10),
((SELECT id FROM public.games WHERE type = 'english_flashcard' AND name = 'Thẻ từ vựng Tiếng Anh'), 'Beautiful', 'Đẹp', '["Đẹp", "Xấu", "Cao", "Thấp"]', 10),
((SELECT id FROM public.games WHERE type = 'english_flashcard' AND name = 'Thẻ từ vựng Tiếng Anh'), 'Friendship', 'Tình bạn', '["Tình bạn", "Tình yêu", "Gia đình", "Công việc"]', 15),
((SELECT id FROM public.games WHERE type = 'english_flashcard' AND name = 'Thẻ từ vựng Tiếng Anh'), 'Knowledge', 'Kiến thức', '["Kiến thức", "Kỹ năng", "Kinh nghiệm", "Trí tuệ"]', 15),
((SELECT id FROM public.games WHERE type = 'english_flashcard' AND name = 'Thẻ từ vựng Tiếng Anh'), 'Responsibility', 'Trách nhiệm', '["Trách nhiệm", "Quyền lợi", "Nghĩa vụ", "Bổn phận"]', 20);

-- Add sample questions for Grammar Quiz Game
INSERT INTO public.game_questions (game_id, question, correct_answer, options, points) VALUES
((SELECT id FROM public.games WHERE type = 'grammar_quiz' AND name = 'Ngữ pháp Tiếng Anh'), 'She ___ to school every day.', 'goes', '["go", "goes", "going", "gone"]', 10),
((SELECT id FROM public.games WHERE type = 'grammar_quiz' AND name = 'Ngữ pháp Tiếng Anh'), 'I ___ my homework yesterday.', 'did', '["do", "did", "does", "doing"]', 10),
((SELECT id FROM public.games WHERE type = 'grammar_quiz' AND name = 'Ngữ pháp Tiếng Anh'), 'They ___ playing football now.', 'are', '["is", "are", "am", "be"]', 10),
((SELECT id FROM public.games WHERE type = 'grammar_quiz' AND name = 'Ngữ pháp Tiếng Anh'), 'If I ___ rich, I would travel the world.', 'were', '["am", "was", "were", "be"]', 15),
((SELECT id FROM public.games WHERE type = 'grammar_quiz' AND name = 'Ngữ pháp Tiếng Anh'), 'The book ___ by many students.', 'was read', '["read", "reads", "was read", "reading"]', 15);

-- Add sample questions for Poetry Match Game
INSERT INTO public.game_questions (game_id, question, correct_answer, options, hints, points) VALUES
((SELECT id FROM public.games WHERE type = 'poetry_match' AND name = 'Ghép thơ Việt Nam'), 'Lá đa lá me bay xa xôi', 'Tố Hữu', '["Tố Hữu", "Xuân Diệu", "Huy Cận", "Chế Lan Viên"]', 'Tác giả của bài thơ Việt Bắc', 15),
((SELECT id FROM public.games WHERE type = 'poetry_match' AND name = 'Ghép thơ Việt Nam'), 'Sông Hương ơi! Dòng nước nào mang', 'Nguyễn Khuyến', '["Nguyễn Khuyến", "Nguyễn Du", "Hồ Xuân Hương", "Nguyễn Trãi"]', 'Nhà thơ cuối thế kỷ 19', 15),
((SELECT id FROM public.games WHERE type = 'poetry_match' AND name = 'Ghép thơ Việt Nam'), 'Trăm năm trong cõi người ta', 'Nguyễn Du', '["Nguyễn Du", "Cao Bá Quát", "Nguyễn Khuyến", "Hồ Xuân Hương"]', 'Tác giả Truyện Kiều', 20),
((SELECT id FROM public.games WHERE type = 'poetry_match' AND name = 'Ghép thơ Việt Nam'), 'Thuở ấy ta tám tuổi thôi', 'Tố Hữu', '["Tố Hữu", "Xuân Diệu", "Huy Cận", "Chế Lan Viên"]', 'Bài thơ Tuổi thơ dữ dội', 15),
((SELECT id FROM public.games WHERE type = 'poetry_match' AND name = 'Ghép thơ Việt Nam'), 'Bao giờ cho đến tháng mười', 'Hồ Chí Minh', '["Hồ Chí Minh", "Tố Hữu", "Xuân Diệu", "Nguyễn Đình Thi"]', 'Bác Hồ viết trong tù', 20);

-- Add sample questions for Literature Quiz Game
INSERT INTO public.game_questions (game_id, question, correct_answer, options, hints, points) VALUES
((SELECT id FROM public.games WHERE type = 'literature_quiz' AND name = 'Văn học Việt Nam'), 'Tác phẩm "Truyện Kiều" có bao nhiêu câu thơ?', '3254', '["3154", "3254", "3354", "3454"]', 'Tác phẩm nổi tiếng nhất của Nguyễn Du', 15),
((SELECT id FROM public.games WHERE type = 'literature_quiz' AND name = 'Văn học Việt Nam'), 'Ai là tác giả của "Số đỏ"?', 'Vũ Trọng Phụng', '["Nam Cao", "Ngô Tất Tố", "Vũ Trọng Phụng", "Kim Lân"]', 'Tiểu thuyết phê phán xã hội', 15),
((SELECT id FROM public.games WHERE type = 'literature_quiz' AND name = 'Văn học Việt Nam'), 'Truyện ngắn "Chí Phèo" thuộc tập truyện nào?', 'Đời thừa', '["Đời thừa", "Sống mòn", "Truyện ngắn Nam Cao", "Những ngày thơ ấu"]', 'Tác phẩm của Nam Cao', 20),
((SELECT id FROM public.games WHERE type = 'literature_quiz' AND name = 'Văn học Việt Nam'), 'Nhân vật chính trong "Tắt đèn" tên là gì?', 'Chị Dậu', '["Chị Dậu", "Cô Tô", "Bà Phó", "Chị Pha"]', 'Tiểu thuyết của Ngô Tất Tố', 20),
((SELECT id FROM public.games WHERE type = 'literature_quiz' AND name = 'Văn học Việt Nam'), 'Thể thơ lục bát có đặc điểm gì?', 'Câu 6 chữ xen câu 8 chữ', '["Câu 6 chữ xen câu 8 chữ", "Câu 7 chữ xen câu 5 chữ", "Tất cả câu đều 8 chữ", "Tất cả câu đều 7 chữ"]', 'Thể thơ truyền thống Việt Nam', 15);
