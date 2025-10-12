// app/teacher/create-fill-blank/page.tsx
'use client';
import { useState } from 'react';

type QuestionForm = { prompt: string; answer: string; index_no?: number; };

export default function CreateFillBlankPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [questions, setQuestions] = useState<QuestionForm[]>([
    { prompt: 'I ___ to school.', answer: 'go' }
  ]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  function addQuestion() {
    setQuestions(prev => [...prev, { prompt: '', answer: '' }]);
  }
  function removeQuestion(i: number) {
    setQuestions(prev => prev.filter((_, idx) => idx !== i));
  }
  function updateQuestion(i: number, key: 'prompt' | 'answer', value: string) {
    setQuestions(prev => prev.map((q, idx) => idx === i ? { ...q, [key]: value } : q));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!title.trim()) { setMsg('Vui lòng nhập tiêu đề'); return; }
    if (questions.length === 0) { setMsg('Thêm ít nhất 1 câu hỏi'); return; }
    for (const q of questions) {
      if (!q.prompt.trim() || !q.answer.trim()) { setMsg('Tất cả câu hỏi phải có prompt và answer'); return; }
    }

    setLoading(true);
    try {
      const res = await fetch('/api/teacher/fillblank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          is_public: isPublic,
          questions: questions.map((q, idx) => ({ index_no: q.index_no ?? idx + 1, prompt: q.prompt, answer: q.answer }))
        })
      });
      const j = await res.json();
      if (!res.ok) {
        setMsg('Lỗi: ' + (j.error || 'Không thể tạo game'));
      } else {
        setMsg('Tạo thành công! ID: ' + (j.game?.id ?? '—'));
        // reset form (tùy bạn)
        setTitle('');
        setDescription('');
        setIsPublic(false);
        setQuestions([{ prompt: '', answer: '' }]);
      }
    } catch (err) {
      setMsg('Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">Tạo trò chơi: Điền từ</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Tiêu đề</label>
          <input value={title} onChange={e => setTitle(e.target.value)} className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block text-sm font-medium">Mô tả (tuỳ chọn)</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
            Public (mọi người có thể xem)
          </label>
        </div>

        <div>
          <h2 className="font-semibold mb-2">Câu hỏi</h2>
          {questions.map((q, i) => (
            <div key={i} className="mb-3 border p-3 rounded">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-medium">Câu {i + 1}</div>
                <button type="button" onClick={() => removeQuestion(i)} className="text-red-500 text-sm">Xoá</button>
              </div>
              <div className="mb-2">
                <label className="block text-xs">Prompt (dùng ___ cho chỗ trống)</label>
                <input value={q.prompt} onChange={e => updateQuestion(i, 'prompt', e.target.value)} className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block text-xs">Answer (đáp án đúng)</label>
                <input value={q.answer} onChange={e => updateQuestion(i, 'answer', e.target.value)} className="w-full border p-2 rounded" />
              </div>
            </div>
          ))}
          <button type="button" onClick={addQuestion} className="px-3 py-1 bg-gray-200 rounded">Thêm câu hỏi</button>
        </div>

        <div>
          <button disabled={loading} type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
            {loading ? 'Đang lưu...' : 'Tạo trò chơi'}
          </button>
        </div>

        {msg && <div className="mt-2 text-sm">{msg}</div>}
      </form>
    </div>
  );
}
