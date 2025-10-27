"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { Plus, Loader2 } from "lucide-react"
import { QuizQuestions } from "./quiz-questions"

export function CreateQuizForm() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [quizId, setQuizId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreateQuiz = async () => {
    if (!title.trim()) return
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser()

      if (userError) throw new Error(userError.message)
      if (!user) throw new Error("Bạn phải đăng nhập để tạo quiz")

      const { data, error } = await supabase.from("quizzes").insert({
        title: title.trim(),
        description: description.trim(),
        created_by: user.id,
        teacher_id: user.id
      }).select().single()

      if (error) throw error

      setQuizId(data.id)
      setTitle("")
      setDescription("")
    } catch (err: any) {
      console.error("Create quiz error:", err)
      setError(err.message || JSON.stringify(err))
    } finally {
      setIsLoading(false)
    }
  }

  if (quizId) {
    // Quiz đã tạo, hiển thị phần thêm câu hỏi
    return <QuizQuestions quizId={quizId} />
  }

  return (
    <Card className="border-2 border-yellow-200 bg-yellow-50 p-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create New Quiz
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p className="text-red-600">{error}</p>}
        <Input
          placeholder="Quiz title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Textarea
          placeholder="Quiz description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-24"
        />
        <Button onClick={handleCreateQuiz} disabled={isLoading} className="bg-yellow-500 hover:bg-yellow-600 text-white flex items-center gap-2">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Create Quiz
        </Button>
      </CardContent>
    </Card>
  )
}
