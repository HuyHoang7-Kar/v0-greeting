-- Add new subject-specific games with sample questions

-- Math Games
INSERT INTO games (id, name, description, type, category, difficulty, created_at) VALUES
('racing-math-easy', 'Đua xe Tính nhẩm', 'Giải phép toán để giúp xe chạy về đích. Mỗi câu đúng giúp xe tiến lên!', 'racing_math', 'math', 'easy', NOW()),
('puzzle-math-easy', 'Ghép hình Kết quả', 'Kéo đáp án đúng vào ô trống để thắp sáng mảnh ghép và hoàn thành bức tranh', 'puzzle_math', 'math', 'easy', NOW());

-- Vietnamese Literature Games  
INSERT INTO games (id, name, description, type, category, difficulty, created_at) VALUES
('fill-blank-easy', 'Điền từ vào chỗ trống', 'Chọn từ thích hợp để điền vào chỗ trống trong đoạn văn', 'fill_blank', 'literature', 'easy', NOW()),
('sentence-order-easy', 'Sắp xếp câu thành đoạn văn', 'Kéo thả các câu để sắp xếp thành đoạn văn hoàn chỉnh và có logic', 'sentence_order', 'literature', 'easy', NOW());

-- English Games
INSERT INTO games (id, name, description, type, category, difficulty, created_at) VALUES
('image-vocab-easy', 'Flashcard đoán từ vựng', 'Nhìn hình ảnh hoặc nghe phát âm để chọn từ tiếng Anh đúng', 'image_vocab', 'english', 'easy', NOW()),
('word-meaning-match-easy', 'Ghép đôi từ - nghĩa', 'Ghép từ tiếng Anh với nghĩa tiếng Việt. Ghép đúng sáng lên, sai rung lắc', 'word_meaning_match', 'english', 'easy', NOW());

-- Sample questions for Racing Math Game
INSERT INTO game_questions (id, game_id, question, correct_answer, options, hints, points, created_at) VALUES
('racing-math-q1', 'racing-math-easy', '15 + 27 = ?', '42', '["42", "41", "43", "40"]', 'Cộng từng chữ số: 5+7=12, viết 2 nhớ 1. 1+2+1=4', 10, NOW()),
('racing-math-q2', 'racing-math-easy', '63 - 28 = ?', '35', '["35", "34", "36", "33"]', 'Mượn từ hàng chục: 13-8=5, 5-2=3', 10, NOW()),
('racing-math-q3', 'racing-math-easy', '8 × 7 = ?', '56', '["56", "54", "58", "52"]', 'Nhớ bảng cửu chương: 8 × 7 = 56', 10, NOW()),
('racing-math-q4', 'racing-math-easy', '72 ÷ 9 = ?', '8', '["8", "7", "9", "6"]', '9 × ? = 72. Nghĩ 9 × 8 = 72', 10, NOW()),
('racing-math-q5', 'racing-math-easy', '45 + 36 = ?', '81', '["81", "80", "82", "79"]', 'Cộng từng hàng: 5+6=11, 4+3+1=8', 10, NOW());

-- Sample questions for Puzzle Math Game  
INSERT INTO game_questions (id, game_id, question, correct_answer, options, hints, points, created_at) VALUES
('puzzle-math-q1', 'puzzle-math-easy', '24 + 18 = ?', '42', '["42", "41", "43", "40"]', 'Cộng hàng đơn vị trước: 4+8=12', 10, NOW()),
('puzzle-math-q2', 'puzzle-math-easy', '56 - 29 = ?', '27', '["27", "26", "28", "25"]', 'Mượn 1 từ hàng chục: 16-9=7, 4-2=2', 10, NOW()),
('puzzle-math-q3', 'puzzle-math-easy', '6 × 9 = ?', '54', '["54", "52", "56", "50"]', 'Bảng cửu chương 6: 6×9=54', 10, NOW()),
('puzzle-math-q4', 'puzzle-math-easy', '48 ÷ 6 = ?', '8', '["8", "7", "9", "6"]', '6 nhân với số nào bằng 48?', 10, NOW());

-- Sample questions for Fill Blank Game
INSERT INTO game_questions (id, game_id, question, correct_answer, options, hints, points, created_at) VALUES
('fill-blank-q1', 'fill-blank-easy', 'Mùa xuân về, cây cối [BLANK] lá xanh tươi.', 'đâm', '["đâm", "mọc", "nảy", "ra"]', 'Từ này thường dùng với "lá" để chỉ sự phát triển của cây', 15, NOW()),
('fill-blank-q2', 'fill-blank-easy', 'Em [BLANK] sách mỗi ngày để tăng kiến thức.', 'đọc', '["đọc", "xem", "học", "nghiên"]', 'Hoạt động chính với sách để thu nhận thông tin', 15, NOW()),
('fill-blank-q3', 'fill-blank-easy', 'Bầu trời [BLANK] xanh trong ngày nắng đẹp.', 'trong', '["trong", "sáng", "đẹp", "cao"]', 'Tính chất của bầu trời khi không có mây che', 15, NOW()),
('fill-blank-q4', 'fill-blank-easy', 'Cô giáo [BLANK] bài rất hay và dễ hiểu.', 'giảng', '["giảng", "dạy", "nói", "kể"]', 'Hoạt động chính của giáo viên trong lớp học', 15, NOW());

-- Sample questions for Sentence Order Game
INSERT INTO game_questions (id, game_id, question, correct_answer, options, hints, points, created_at) VALUES
('sentence-order-q1', 'sentence-order-easy', 'Đoạn văn về buổi sáng', 'Mặt trời mọc từ phía đông.|Ánh nắng vàng chiếu khắp mặt đất.|Chim chóc bắt đầu hót líu lo.|Một ngày mới lại bắt đầu.', '["Mặt trời mọc từ phía đông.", "Ánh nắng vàng chiếu khắp mặt đất.", "Chim chóc bắt đầu hót líu lo.", "Một ngày mới lại bắt đầu."]', 'Sắp xếp theo thứ tự thời gian từ khi mặt trời mọc', 20, NOW()),
('sentence-order-q2', 'sentence-order-easy', 'Đoạn văn về việc học', 'Em chuẩn bị sách vở trước khi đi học.|Đến lớp, em chào cô giáo và bạn bè.|Cô giáo giảng bài rất hay và dễ hiểu.|Em về nhà ôn lại bài đã học.', '["Em chuẩn bị sách vở trước khi đi học.", "Đến lớp, em chào cô giáo và bạn bè.", "Cô giáo giảng bài rất hay và dễ hiểu.", "Em về nhà ôn lại bài đã học."]', 'Sắp xếp theo trình tự một ngày học của học sinh', 20, NOW());

-- Sample questions for Image Vocab Game
INSERT INTO game_questions (id, game_id, question, correct_answer, options, hints, points, created_at) VALUES
('image-vocab-q1', 'image-vocab-easy', 'Hình ảnh một quả táo đỏ', 'apple', '["apple", "orange", "banana", "grape"]', 'Quả này có màu đỏ, tròn và rất ngọt', 10, NOW()),
('image-vocab-q2', 'image-vocab-easy', 'Hình ảnh một con mèo', 'cat', '["cat", "dog", "bird", "fish"]', 'Con vật này kêu "meow" và thích bắt chuột', 10, NOW()),
('image-vocab-q3', 'image-vocab-easy', 'Hình ảnh ngôi nhà', 'house', '["house", "school", "hospital", "store"]', 'Nơi mọi người sống và nghỉ ngơi', 10, NOW()),
('image-vocab-q4', 'image-vocab-easy', 'Hình ảnh chiếc xe hơi', 'car', '["car", "bus", "train", "plane"]', 'Phương tiện có 4 bánh, chạy trên đường', 10, NOW()),
('image-vocab-q5', 'image-vocab-easy', 'Hình ảnh cuốn sách', 'book', '["book", "pen", "paper", "desk"]', 'Đồ vật dùng để đọc và học tập', 10, NOW());

-- Sample questions for Word Meaning Match Game
INSERT INTO game_questions (id, game_id, question, correct_answer, options, hints, points, created_at) VALUES
('word-match-q1', 'word-meaning-match-easy', 'happy', 'vui vẻ', '["vui vẻ", "buồn bã", "tức giận", "sợ hãi"]', 'Cảm xúc tích cực khi có điều tốt xảy ra', 10, NOW()),
('word-match-q2', 'word-meaning-match-easy', 'water', 'nước', '["nước", "lửa", "đất", "không khí"]', 'Chất lỏng trong suốt, cần thiết cho sự sống', 10, NOW()),
('word-match-q3', 'word-meaning-match-easy', 'friend', 'bạn bè', '["bạn bè", "kẻ thù", "người lạ", "gia đình"]', 'Người có mối quan hệ tốt, thân thiết với mình', 10, NOW()),
('word-match-q4', 'word-meaning-match-easy', 'beautiful', 'đẹp', '["đẹp", "xấu", "to", "nhỏ"]', 'Tính chất làm cho mắt nhìn thấy dễ chịu', 10, NOW()),
('word-match-q5', 'word-meaning-match-easy', 'study', 'học tập', '["học tập", "chơi đùa", "ngủ nghỉ", "ăn uống"]', 'Hoạt động để thu nhận kiến thức', 10, NOW()),
('word-match-q6', 'word-meaning-match-easy', 'family', 'gia đình', '["gia đình", "trường học", "bệnh viện", "cửa hàng"]', 'Nhóm người có quan hệ huyết thống sống cùng nhau', 10, NOW()),
('word-match-q7', 'word-meaning-match-easy', 'school', 'trường học', '["trường học", "bệnh viện", "siêu thị", "công viên"]', 'Nơi học sinh đến để học tập', 10, NOW()),
('word-match-q8', 'word-meaning-match-easy', 'teacher', 'giáo viên', '["giáo viên", "học sinh", "bác sĩ", "nông dân"]', 'Người dạy học cho học sinh', 10, NOW());
