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

// Component riêng cho mỗi flashcard (flip state riêng)
function FlashcardItem({ flashcard, userId }: { flashcard: Flashcard; userId: string }) {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <Card
      className={`relative border-2 cursor-pointer transition-transform duration-500 ${
        flashcard.created_by === userId ? "border-blue-200 bg-blue-50" : "border-yellow-200 bg-yellow-50"
      }`}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <CardContent className="p-4 h-40 flex items-center justify-center">
        {!isFlipped ? (
          <p className="font-medium text-center">{flashcard.question}</p>
        ) : (
          <p className="text-gray-700 text-center">{flashcard.answer}</p>
        )}
      </CardContent>
    </Card>
  )
}

export default function StudentFlashcards({ userId }: StudentFlashcardsProps) {
  const supabase = createClient()

  const [classes, setClasses] = useState<Class[]>([])
  const [joinedClassIds, setJoinedClassIds] = useState<string[]>([])
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [loading, setLoading] = useState(true)

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
        .or([...classIds.map((id) => `class_id.eq.${id}`), `created_by.eq.${userId}`].join(","))
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
    if (joinedClassIds.length === 0) {
      setError("Bạn chưa tham gia lớp nào")
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      const payload = {
        question: question.trim(),
        answer: answer.trim(),
        class_id: joinedClassIds[0],
        created_by: userId,
      }

      const { data, error: insertError } = await supabase.from("flashcards").insert(payload).select()
      if (insertError) throw insertError

      setFlashcards((prev) => [...data, ...prev])
      setQuestion("")
      setAnswer("")
      setShowCreateForm(false)
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Tạo flashcard thất bại")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) return <p>Đang tải dữ liệu...</p>

  return (
    <div className="space-y-6">
      {/* Nút hiện form */}
      <Button onClick={() => setShowCreateForm(!showCreateForm)} className="bg-yellow-500 hover:bg-yellow-600 text-white">
        {showCreateForm ? "Đóng Form" : "+ Tạo Flashcard"}
      </Button>

      {/* Form tạo flashcard */}
      {showCreateForm && (
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
                  placeholder="Nhập câu hỏi"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="space-y-2">
                <label className="block font-medium">Câu Trả Lời *</label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Nhập câu trả lời"
                  className="w-full p-2 border rounded"
                />
              </div>
              {error && <p className="text-red-600">{error}</p>}
              <Button type="submit" disabled={isSubmitting} className="bg-yellow-500 hover:bg-yellow-600 text-white">
                {isSubmitting ? "Đang tạo..." : "Tạo Flashcard"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Hiển thị flashcards theo lớp */}
      {classes.map((cls) => {
        const flashcardsOfClass = flashcards.filter((f) => f.class_id === cls.id)
        if (flashcardsOfClass.length === 0) return null
        return (
          <div key={cls.id}>
            <h2 className="text-xl font-bold mb-2">{cls.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {flashcardsOfClass.map((f) => (
                <FlashcardItem key={f.id} flashcard={f} userId={userId} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
