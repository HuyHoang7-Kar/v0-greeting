"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { Plus, Save, Loader2 } from "lucide-react"

interface QuizQuestion {
  id: string
  question: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: "A" | "B" | "C" | "D"
}

export default function CreateQuizForm() {
  const [quizId, setQuizId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_answer: "A" as "A" | "B" | "C" | "D",
  })
  const [questionLoading, setQuestionLoading] = useState(false)
  const [questionError, setQuestionError] = useState<string | null>(null)

  // 🧩 Tạo quiz mặc định (nếu chưa có)
  const ensureQuiz = async () => {
    if (quizId) return quizId
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw new Error(userError.message)
      if (!user) throw new Error("Bạn phải đăng nhập để tạo quiz")

      const { data, error } = await supabase
        .from("quizzes")
        .insert({
          title: "Untitled Quiz",
          description: "Auto-created quiz",
          created_by: user.id,
        })
        .select()
        .single()
      if (error) throw error
      setQuizId(data.id)
      return data.id
    } catch (err: any) {
      console.error("Create quiz error:", err)
      setError(err.message || JSON.stringify(err))
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // 🧩 Load câu hỏi
  const loadQuestions = async (id: string) => {
    setQuestionLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("quiz_questions").select("*").eq("quiz_id", id)
      if (error) throw error
      setQuestions(data || [])
    } catch (err: any) {
      console.error("Load questions error:", err)
      setQuestionError(err.message || JSON.stringify(err))
    } finally {
      setQuestionLoading(false)
    }
  }

  // 🧩 Thêm câu hỏi
  const handleAddQuestion = async () => {
    if (!newQuestion.question.trim()) return
    setQuestionLoading(true)
    setQuestionError(null)
    try {
      const supabase = createClient()
      const id = await ensureQuiz()
      if (!id) return

      const { error } = await supabase.from("quiz_questions").insert({
        quiz_id: id,
        ...newQuestion,
      })
      if (error) throw error
      setNewQuestion({
        question: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_answer: "A",
      })
      loadQuestions(id)
    } catch (err: any) {
      console.error("Add question error:", err)
      setQuestionError(err.message || JSON.stringify(err))
    } finally {
      setQuestionLoading(false)
    }
  }

  // 🧱 Giao diện: chỉ còn phần thêm câu hỏi
  return (
    <div className="space-y-4">
      <Card className="border-2 border-blue-200 p-4 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" /> Add Question
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {error && <p className="text-red-600">{error}</p>}
          {questionError && <p className="text-red-600">{questionError}</p>}

          <Textarea
            placeholder="Question"
            value={newQuestion.question}
            onChange={(e) =>
              setNewQuestion({ ...newQuestion, question: e.target.value })
            }
          />
          {["a", "b", "c", "d"].map((opt) => (
            <Input
              key={opt}
              placeholder={`Option ${opt.toUpperCase()}`}
              value={newQuestion[`option_${opt}` as keyof typeof newQuestion]}
              onChange={(e) =>
                setNewQuestion({
                  ...newQuestion,
                  [`option_${opt}`]: e.target.value,
                })
              }
            />
          ))}
          <Select
            value={newQuestion.correct_answer}
            onValueChange={(v) =>
              setNewQuestion({
                ...newQuestion,
                correct_answer: v as "A" | "B" | "C" | "D",
              })
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Correct answer" />
            </SelectTrigger>
            <SelectContent>
              {["A", "B", "C", "D"].map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2 mt-2">
            <Button
              onClick={handleAddQuestion}
              disabled={questionLoading || isLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
            >
              {questionLoading || isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Add Question
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {questionLoading && <p>Loading questions...</p>}
        {questions.map((q, idx) => (
          <Card key={q.id} className="p-2 border-2">
            <p className="font-medium">
              Q{idx + 1}: {q.question}
            </p>
            <ul className="ml-4">
              <li>A: {q.option_a}</li>
              <li>B: {q.option_b}</li>
              <li>C: {q.option_c}</li>
              <li>D: {q.option_d}</li>
              <li className="text-green-700">Correct: {q.correct_answer}</li>
            </ul>
          </Card>
        ))}
      </div>
    </div>
  )
}
