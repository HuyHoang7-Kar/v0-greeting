"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Flashcard {
  id: string
  question: string
  answer: string
  category?: "vocabulary" | "grammar" | "concept" | "science"
  class_id: string | null
  created_by: string
}

interface Class {
  id: string
  name: string
}

interface StudentFlashcardsProps {
  userId: string
}

export default function StudentFlashcards({ userId }: StudentFlashcardsProps) {
  const supabase = createClient()

  const [classes, setClasses] = useState<Class[]>([])
  const [joinedClassIds, setJoinedClassIds] = useState<string[]>([])
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [loading, setLoading] = useState(true)

  // Form state
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [category, setCategory] = useState<string>("vocabulary")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const { data: joinedData } = await supabase
        .from("class_members")
        .select("class_id")
        .eq("user_id", userId)

      const classIds = joinedData?.map((c) => c.class_id) || []
      setJoinedClassIds(classIds)

      if (classIds.length === 0) {
        setClasses([])
        setFlashcards([])
        return
      }

      const { data: classesData } = await supabase
        .from("classes")
        .select("id,name")
        .in("id", classIds)

      setClasses(classesData || [])

      const { data: flashcardsData } = await supabase
        .from("flashcards")
        .select("*")
        .or(
          [...classIds.map((id) => `class_id.eq.${id}`), `created_by.eq.${userId}`].join(",")
        )
        .order("created_at", { ascending: false })

      setFlashcards(flashcardsData || [])
    } catch (err) {
      console.error("❌ Lỗi load dữ liệu:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateFlashcard = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim() || !answer.trim()) {
      setError("Câu hỏi và câu trả lời không được để trống")
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      const payload = {
        question: question.trim(),
        answer: answer.trim(),
        category,
        class_id: selectedClassId || null,
        created_by: userId,
      }

      const { data, error: insertError } = await supabase
        .from("flashcards")
        .insert(payload)
        .select()

      if (insertError) throw insertError

      setFlashcards((prev) => [...data, ...prev])
      setQuestion("")
      setAnswer("")
      setSelectedClassId(null)
      setCategory("vocabulary")
      setShowForm(false)
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Tạo flashcard thất bại")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) return <p>Đang tải dữ liệu...</p>

  const FlashcardItem = ({ flashcard }: { flashcard: Flashcard }) => {
    const [isFlipped, setIsFlipped] = useState(false)

    return (
      <div
        className="w-96 h-64 perspective-1000 cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className="relative w-full h-full transition-transform duration-700 transform-style-preserve-3d shadow-lg rounded-xl"
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 rounded-xl border"
            style={{
              background: "linear-gradient(145deg, #fffaf3, #fef7ee)",
              border: "2px solid rgba(255, 215, 180, 0.7)",
              boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
              backfaceVisibility: "hidden",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "2rem",
              fontFamily: "'Merriweather', serif",
              color: "#333",
              position: "relative",
            }}
          >
            <h3 className="text-center text-2xl font-bold">{flashcard.question}</h3>
            <p className="mt-auto text-base text-gray-500 text-center">Click để xem đáp án</p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 rounded-xl border rotate-y-180 flex flex-col justify-center items-center"
            style={{
              background: "#fffdf8",
              border: "2px solid rgba(255, 215, 180, 0.7)",
              boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              padding: "2rem",
              fontFamily: "'Merriweather', serif",
              color: "#333",
            }}
          >
            <h3 className="text-center text-3xl font-bold mb-4">ĐÁP ÁN</h3>
            <div className="text-center text-2xl leading-relaxed">
              {flashcard.answer.split("\n").map((line, idx) => (
                <div key={idx}>{line}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 bg-[#fef6e4] p-8 min-h-screen">
      <Button
        onClick={() => setShowForm(!showForm)}
        className="bg-yellow-500 hover:bg-yellow-600 text-white"
      >
        {showForm ? "Đóng tạo Flashcard" : "Tạo Flashcard mới"}
      </Button>

      {showForm && (
        <Card className="border-2 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle>Tạo Flashcard</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateFlashcard} className="space-y-4">
              <div className="space-y-2">
                <label className="block font-medium">Câu Hỏi *</label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  required
                  placeholder="Nhập câu hỏi"
                  className="w-full p-2 border rounded text-base"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-medium">Câu Trả Lời *</label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  required
                  placeholder="Nhập câu trả lời"
                  className="w-full p-2 border rounded text-base"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-medium">Danh mục *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 border rounded text-base"
                >
                  <option value="vocabulary">Từ vựng</option>
                  <option value="grammar">Ngữ pháp</option>
                  <option value="concept">Khái niệm</option>
                  <option value="science">Thuật ngữ khoa học</option>
                </select>
              </div>

              {joinedClassIds.length > 0 && (
                <div className="space-y-2">
                  <label className="block font-medium">Chọn lớp (tùy chọn)</label>
                  <select
                    value={selectedClassId || ""}
                    onChange={(e) => setSelectedClassId(e.target.value || null)}
                    className="w-full p-2 border rounded text-base"
                  >
                    <option value="">Flashcard riêng</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {error && <p className="text-red-600">{error}</p>}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                {isSubmitting ? "Đang tạo..." : "Tạo Flashcard"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Flashcards theo lớp */}
      {classes.map((cls) => {
        const flashcardsOfClass = flashcards.filter((f) => f.class_id === cls.id)
        if (flashcardsOfClass.length === 0) return null
        return (
          <div key={cls.id}>
            <h2 className="text-3xl font-bold mb-6">{cls.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-10">
              {flashcardsOfClass.map((f) => (
                <FlashcardItem key={f.id} flashcard={f} />
              ))}
            </div>
          </div>
        )
      })}

      {/* Flashcards riêng của học sinh */}
      {flashcards.filter((f) => f.created_by === userId && !f.class_id).length > 0 && (
        <div>
          <h2 className="text-3xl font-bold mb-6">Flashcards riêng của bạn</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-10">
            {flashcards
              .filter((f) => f.created_by === userId && !f.class_id)
              .map((f) => (
                <FlashcardItem key={f.id} flashcard={f} />
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
