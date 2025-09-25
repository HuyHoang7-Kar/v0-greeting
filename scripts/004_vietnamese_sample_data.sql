-- Clear existing data
DELETE FROM public.quiz_questions;
DELETE FROM public.quizzes;
DELETE FROM public.flashcards;
DELETE FROM public.game_questions;
DELETE FROM public.games;

-- Insert Vietnamese flashcards for Math (Toán học)
INSERT INTO public.flashcards (question, answer, category, difficulty, created_by) VALUES
-- Easy Math
('2 + 3 = ?', '5', 'Toán học', 'easy', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1)),
('5 - 2 = ?', '3', 'Toán học', 'easy', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1)),
('3 × 4 = ?', '12', 'Toán học', 'easy', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1)),
('10 ÷ 2 = ?', '5', 'Toán học', 'easy', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1)),
('Số nào lớn hơn: 7 hay 5?', '7', 'Toán học', 'easy', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1)),

-- Medium Math
('15 + 27 = ?', '42', 'Toán học', 'medium', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1)),
('84 - 36 = ?', '48', 'Toán học', 'medium', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1)),
('12 × 8 = ?', '96', 'Toán học', 'medium', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1)),
('144 ÷ 12 = ?', '12', 'Toán học', 'medium', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1)),
('Diện tích hình vuông cạnh 6cm là?', '36 cm²', 'Toán học', 'medium', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1)),

-- Hard Math
('Giải phương trình: 2x + 5 = 13', 'x = 4', 'Toán học', 'hard', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1)),
('Tính đạo hàm của f(x) = x²', "f'(x) = 2x", 'Toán học', 'hard', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1)),
('Sin(30°) = ?', '1/2', 'Toán học', 'hard', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1));

-- Insert Vietnamese flashcards for English (Tiếng Anh)
INSERT INTO public.flashcards (question, answer, category, difficulty, created_by) VALUES
-- Easy English
('Hello trong tiếng Việt là gì?', 'Xin chào', 'Tiếng Anh', 'easy', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1)),
('Cat trong tiếng Việt là gì?', 'Con mèo', 'Tiếng Anh', 'easy', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1)),
('Book trong tiếng Việt là gì?', 'Cuốn sách', 'Tiếng Anh', 'easy', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1)),
('Water trong tiếng Việt là gì?', 'Nước', 'Tiếng Anh', 'easy', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1)),
('Red trong tiếng Việt là gì?', 'Màu đỏ', 'Tiếng Anh', 'easy', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1)),

-- Medium English
('Beautiful trong tiếng Việt là gì?', 'Đẹp', 'Tiếng Anh', 'medium', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1)),
('Yesterday trong tiếng Việt là gì?', 'Hôm qua', 'Tiếng Anh', 'medium', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1)),
('Understand trong tiếng Việt là gì?', 'Hiểu', 'Tiếng Anh', 'medium', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1)),
('Important trong tiếng Việt là gì?', 'Quan trọng', 'Tiếng Anh', 'medium', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1)),
('Knowledge trong tiếng Việt là gì?', 'Kiến thức', 'Tiếng Anh', 'medium', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1)),

-- Hard English
('Sophisticated trong tiếng Việt là gì?', 'Tinh vi, phức tạp', 'Tiếng Anh', 'hard', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1)),
('Perseverance trong tiếng Việt là gì?', 'Sự kiên trì', 'Tiếng Anh', 'hard', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1)),
('Eloquent trong tiếng Việt là gì?', 'Hùng biện, lưu loát', 'Tiếng Anh', 'hard', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1));

-- Insert Vietnamese flashcards for Literature (Ngữ văn)
INSERT INTO public.flashcards (question, answer, category, difficulty, created_by) VALUES
-- Easy Literature
('Ai là tác giả của "Truyện Kiều"?', 'Nguyễn Du', 'Ngữ văn', 'easy', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1)),
('Tác phẩm "Số đỏ" của ai?', 'Vũ Trọng Phụng', 'Ngữ văn', 'easy', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1)),
('Nhân vật chính trong "Tắt đèn" là ai?', 'Chị Dậu', 'Ngữ văn', 'easy', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1)),
('Ai viết "Chí Phèo"?', 'Nam Cao', 'Ngữ văn', 'easy', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1)),
('Tác giả của "Vợ nhặt" là ai?', 'Kim Lân', 'Ngữ văn', 'easy', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1)),

-- Medium Literature
('Thể thơ của "Truyện Kiều" là gì?', 'Lục bát', 'Ngữ văn', 'medium', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1)),
('Tác phẩm "Người lái đò sông Đà" thuộc thể loại gì?', 'Truyện ngắn', 'Ngữ văn', 'medium', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1)),
('Ai là tác giả của "Những ngôi sao xa xôi"?', 'Lê Minh Khuê', 'Ngữ văn', 'medium', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1)),
('Tác phẩm "Chiếc thúng đựng gió" của ai?', 'Nguyễn Tuân', 'Ngữ văn', 'medium', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1)),

-- Hard Literature
('Phân tích ý nghĩa câu "Lòng người như nước chảy đâu về"', 'Thể hiện sự thay đổi, không bền vững của tình cảm con người', 'Ngữ văn', 'hard', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1)),
('Nêu đặc điểm nghệ thuật của thơ Nguyễn Du', 'Kết hợp hài hòa giữa chữ Hán và chữ Nôm, ngôn ngữ giàu hình ảnh', 'Ngữ văn', 'hard', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1));

-- Insert Games
INSERT INTO public.games (name, description, type, category, created_by) VALUES
('Ghép số học', 'Trò chơi ghép các phép tính với kết quả đúng', 'memory_match', 'math', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1)),
('Xếp từ tiếng Anh', 'Sắp xếp các chữ cái để tạo thành từ đúng', 'word_scramble', 'english', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1)),
('Thi tốc độ văn học', 'Trả lời nhanh các câu hỏi về văn học Việt Nam', 'speed_quiz', 'literature', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1)),
('Kéo thả công thức', 'Kéo thả các phần tử để hoàn thành công thức toán học', 'drag_drop', 'math', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1));

-- Insert Game Questions for Memory Match (Math)
INSERT INTO public.game_questions (game_id, question, correct_answer, options, points) VALUES
((SELECT id FROM public.games WHERE name = 'Ghép số học'), '5 + 3', '8', '["6", "7", "8", "9"]', 10),
((SELECT id FROM public.games WHERE name = 'Ghép số học'), '12 - 4', '8', '["6", "7", "8", "9"]', 10),
((SELECT id FROM public.games WHERE name = 'Ghép số học'), '2 × 6', '12', '["10", "11", "12", "13"]', 15),
((SELECT id FROM public.games WHERE name = 'Ghép số học'), '15 ÷ 3', '5', '["3", "4", "5", "6"]', 15);

-- Insert Game Questions for Word Scramble (English)
INSERT INTO public.game_questions (game_id, question, correct_answer, options, points) VALUES
((SELECT id FROM public.games WHERE name = 'Xếp từ tiếng Anh'), 'KOOB', 'BOOK', '["BOOK", "KOBE", "BOKO", "OKOB"]', 10),
((SELECT id FROM public.games WHERE name = 'Xếp từ tiếng Anh'), 'RETAW', 'WATER', '["WATER", "WARTE", "TAWER", "RAWET"]', 15),
((SELECT id FROM public.games WHERE name = 'Xếp từ tiếng Anh'), 'LOOHCS', 'SCHOOL', '["SCHOOL", "SCHOLO", "LOHOCS", "COOLSH"]', 20),
((SELECT id FROM public.games WHERE name = 'Xếp từ tiếng Anh'), 'TIFUAELUB', 'BEAUTIFUL', '["BEAUTIFUL", "BEAUTIFLU", "BEUTAIFUL", "BEAUITFUL"]', 25);

-- Insert Game Questions for Speed Quiz (Literature)
INSERT INTO public.game_questions (game_id, question, correct_answer, options, points) VALUES
((SELECT id FROM public.games WHERE name = 'Thi tốc độ văn học'), 'Ai là tác giả "Truyện Kiều"?', 'Nguyễn Du', '["Nguyễn Du", "Hồ Xuân Hương", "Nguyễn Trãi", "Lý Thái Tổ"]', 10),
((SELECT id FROM public.games WHERE name = 'Thi tốc độ văn học'), 'Tác phẩm "Chí Phèo" của ai?', 'Nam Cao', '["Nam Cao", "Ngô Tất Tố", "Vũ Trọng Phụng", "Kim Lân"]', 10),
((SELECT id FROM public.games WHERE name = 'Thi tốc độ văn học'), 'Thể thơ lục bát có mấy tiếng?', '6 và 8 tiếng', '["5 và 7 tiếng", "6 và 8 tiếng", "7 và 8 tiếng", "8 và 6 tiếng"]', 15),
((SELECT id FROM public.games WHERE name = 'Thi tốc độ văn học'), 'Nhân vật chính trong "Tắt đèn"?', 'Chị Dậu', '["Chị Dậu", "Thị Nở", "Tấm Cám", "Chị Hạnh"]', 10);

-- Insert Game Questions for Drag Drop (Math)
INSERT INTO public.game_questions (game_id, question, correct_answer, options, hints, points) VALUES
((SELECT id FROM public.games WHERE name = 'Kéo thả công thức'), 'Công thức tính diện tích hình vuông', 'S = a²', '["S = a²", "S = a × b", "S = π × r²", "S = (a + b) × h ÷ 2"]', 'a là độ dài cạnh', 15),
((SELECT id FROM public.games WHERE name = 'Kéo thả công thức'), 'Công thức tính chu vi hình tròn', 'C = 2πr', '["C = 2πr", "C = πr²", "C = 4a", "C = 2(a + b)"]', 'r là bán kính', 20),
((SELECT id FROM public.games WHERE name = 'Kéo thả công thức'), 'Định lý Pythagore', 'a² + b² = c²', '["a² + b² = c²", "a + b = c", "a × b = c", "a² - b² = c²"]', 'Tam giác vuông', 25);

-- Create sample quizzes with Vietnamese content
INSERT INTO public.quizzes (title, description, created_by) VALUES
('Kiểm tra Toán học cơ bản', 'Bài kiểm tra các phép tính cơ bản và hình học', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1)),
('Từ vựng Tiếng Anh thông dụng', 'Kiểm tra từ vựng tiếng Anh cơ bản và nâng cao', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1)),
('Văn học Việt Nam hiện đại', 'Câu hỏi về các tác phẩm văn học Việt Nam', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1));

-- Insert quiz questions
INSERT INTO public.quiz_questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer) VALUES
-- Math Quiz
((SELECT id FROM public.quizzes WHERE title = 'Kiểm tra Toán học cơ bản'), 'Kết quả của 15 + 28 là?', '43', '42', '44', '41', 'A'),
((SELECT id FROM public.quizzes WHERE title = 'Kiểm tra Toán học cơ bản'), 'Diện tích hình chữ nhật có chiều dài 8cm, chiều rộng 5cm là?', '40 cm²', '26 cm²', '13 cm²', '35 cm²', 'A'),
((SELECT id FROM public.quizzes WHERE title = 'Kiểm tra Toán học cơ bản'), '144 ÷ 12 = ?', '12', '11', '13', '10', 'A'),

-- English Quiz
((SELECT id FROM public.quizzes WHERE title = 'Từ vựng Tiếng Anh thông dụng'), '"Happiness" trong tiếng Việt có nghĩa là gì?', 'Hạnh phúc', 'Buồn bã', 'Tức giận', 'Lo lắng', 'A'),
((SELECT id FROM public.quizzes WHERE title = 'Từ vựng Tiếng Anh thông dụng'), 'Từ nào có nghĩa là "học tập"?', 'Study', 'Play', 'Sleep', 'Eat', 'A'),
((SELECT id FROM public.quizzes WHERE title = 'Từ vựng Tiếng Anh thông dụng'), '"Environment" có nghĩa là gì?', 'Môi trường', 'Xã hội', 'Gia đình', 'Trường học', 'A'),

-- Literature Quiz
((SELECT id FROM public.quizzes WHERE title = 'Văn học Việt Nam hiện đại'), 'Tác giả của "Số đỏ" là ai?', 'Vũ Trọng Phụng', 'Nam Cao', 'Ngô Tất Tố', 'Kim Lân', 'A'),
((SELECT id FROM public.quizzes WHERE title = 'Văn học Việt Nam hiện đại'), 'Nhân vật chính trong truyện "Vợ nhặt" là ai?', 'Tràng', 'Chí Phèo', 'Ông giáo', 'Bá Kiến', 'A'),
((SELECT id FROM public.quizzes WHERE title = 'Văn học Việt Nam hiện đại'), '"Truyện Kiều" có bao nhiêu câu thơ?', '3254 câu', '3154 câu', '3354 câu', '3054 câu', 'A');
