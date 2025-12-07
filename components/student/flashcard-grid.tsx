"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Flashcard {
  id: string
  question: string
  answer: string
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
        class_id: selectedClassId || null, // null nếu flashcard riêng
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

    const colors = [
      "from-red-100 to-red-200",
      "from-blue-100 to-blue-200",
      "from-green-100 to-green-200",
      "from-yellow-100 to-yellow-200",
      "from-purple-100 to-purple-200",
      "from-pink-100 to-pink-200",
      "from-indigo-100 to-indigo-200",
    ]
    const colorIndex =
      Math.abs(flashcard.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) %
      colors.length
    const gradient = colors[colorIndex]

    return (
      <div
        className="perspective-1000 w-full h-48 cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          {/* Front */}
          <Card className="absolute inset-0 w-full h-full backface-hidden rounded-xl shadow-2xl bg-white">
            <CardContent className={`flex items-center justify-center h-full p-4 bg-gradient-to-br ${gradient}`}>
              <p className="text-center font-bold text-lg">{flashcard.question}</p>
            </CardContent>
          </Card>

          {/* Back */}
          <Card className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-xl shadow-2xl bg-white">
            <CardContent className={`flex items-center justify-center h-full p-4 bg-gradient-to-br ${gradient}`}>
              <p className="text-center text-gray-800">{flashcard.answer}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
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
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-medium">Câu Trả Lời *</label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  required
                  placeholder="Nhập câu trả lời"
                  className="w-full p-2 border rounded"
                />
              </div>

              {joinedClassIds.length > 0 && (
                <div className="space-y-2">
                  <label className="block font-medium">Chọn Lớp (tùy chọn)</label>
                  <select
                    value={selectedClassId || ""}
                    onChange={(e) => setSelectedClassId(e.target.value || null)}
                    className="w-full p-2 border rounded"
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
            <h2 className="text-xl font-bold mb-4">{cls.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {flashcardsOfClass.map((f) => (
                <FlashcardItem key={f.id} flashcard={f} />
              ))}
            </div>
          </div>
        )
      })}

      {/* Flashcards riêng tư của học sinh */}
      {flashcards.filter((f) => f.created_by === userId && !f.class_id).length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Flashcards riêng của bạn</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
