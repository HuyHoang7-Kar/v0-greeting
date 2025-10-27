"use client"

import { useState, useEffect } from "react"
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
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
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
    correct_answer: "A" as "A"|"B"|"C"|"D"
  })
  const [questionLoading, setQuestionLoading] = useState(false)
  const [questionError, setQuestionError] = useState<string | null>(null)

  // Tạo quiz
  const handleCreateQuiz = async () => {
    if (!title.trim()) return
    setIsLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data: { user }, error: userError } = await supabase.auth.getUser()
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
      loadQuestions(data.id) // load câu hỏi nếu có
    } catch (err: any) {
      console.error("Create quiz error:", err)
      setError(err.message || JSON.stringify(err))
    } finally {
      setIsLoading(false)
    }
  }

  // Load câu hỏi
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

  // Thêm câu hỏi
  const handleAddQuestion = async () => {
    if (!newQuestion.question.trim()) return
    setQuestionLoading(true)
    setQuestionError(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("quiz_questions").insert({
        quiz_id: quizId,
        ...newQuestion
      })
      if (error) throw error
      setNewQuestion({ question:"", option_a:"", option_b:"", option_c:"", option_d:"", correct_answer:"A" })
      loadQuestions(quizId!)
    } catch (err: any) {
      console.error("Add question error:", err)
      setQuestionError(err.message || JSON.stringify(err))
    } finally {
      setQuestionLoading(false)
    }
  }

  // Nếu quiz chưa tạo, hiển thị form tạo quiz
    return (
    <div className="space-y-4">
      {!quizId ? (
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
            <Button
              onClick={handleCreateQuiz}
              disabled={isLoading}
              className="bg-yellow-500 hover:bg-yellow-600 text-white flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Create Quiz
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="border-2 border-blue-200 p-4 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" /> Add Question
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
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
                  setNewQuestion({ ...newQuestion, correct_answer: v as "A" | "B" | "C" | "D" })
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
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
                  disabled={questionLoading}
                  className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Add
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            {questionLoading && <p>Loading questions...</p>}
            {questions.map((q, idx) => (
              <Card key={q.id} className="p-2 border-2">
                <p className="font-medium">Q{idx + 1}: {q.question}</p>
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
        </>
      )}
    </div>
  )
