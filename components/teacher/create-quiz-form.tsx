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
  question: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: "A" | "B" | "C" | "D"
  points: number
}

interface CreateQuizProps {
  onSuccess?: () => void
}

export default function CreateQuizForm({ onSuccess }: CreateQuizProps) {
  const [step, setStep] = useState<"createQuiz" | "addQuestions">("createQuiz")
  const [quizId, setQuizId] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [numQuestions, setNumQuestions] = useState(1)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion>({
    question: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_answer: "A",
    points: 1,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  // 1️⃣ Tạo quiz
  const handleCreateQuiz = async () => {
    if (!title.trim()) return
    setIsLoading(true)
    setError(null)
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!user) throw new Error("Bạn phải đăng nhập")

      const { data, error } = await supabase.from("quizzes").insert({
        title,
        description,
        created_by: user.id,
      }).select().single()
      if (error) throw error
      setQuizId(data.id)
      setStep("addQuestions")
    } catch (err: any) {
      setError(err.message || JSON.stringify(err))
    } finally {
      setIsLoading(false)
    }
  }

  // 2️⃣ Thêm câu hỏi
  const handleAddQuestion = async () => {
    if (!currentQuestion.question.trim()) return
    if (!quizId) return

    setIsLoading(true)
    setError(null)
    try {
      await supabase.from("quiz_questions").insert({
        quiz_id: quizId,
        ...currentQuestion,
      })

      const newQuestions = [...questions, currentQuestion]
      setQuestions(newQuestions)

      if (newQuestions.length < numQuestions) {
        setCurrentQuestion({
          question: "",
          option_a: "",
          option_b: "",
          option_c: "",
          option_d: "",
          correct_answer: "A",
          points: 1,
        })
      } else {
        // Hoàn tất thêm câu hỏi
        onSuccess?.()
      }
    } catch (err: any) {
      setError(err.message || JSON.stringify(err))
    } finally {
      setIsLoading(false)
    }
  }

  if (step === "createQuiz") {
    return (
      <Card className="p-4 border-2 border-blue-200">
        <CardHeader>
          <CardTitle>Create New Quiz</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {error && <p className="text-red-600">{error}</p>}
          <Input
            placeholder="Quiz Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Input
            type="number"
            min={1}
            value={numQuestions}
            onChange={(e) => setNumQuestions(Number(e.target.value))}
            placeholder="Number of questions"
          />
          <Button onClick={handleCreateQuiz} disabled={isLoading} className="mt-2 bg-blue-500 text-white">
            {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <Plus className="w-4 h-4" />}
            Create Quiz
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Step: Add questions
  return (
    <Card className="p-4 border-2 border-green-200">
      <CardHeader>
        <CardTitle>Add Question {questions.length + 1} / {numQuestions}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {error && <p className="text-red-600">{error}</p>}
        <Textarea
          placeholder="Question"
          value={currentQuestion.question}
          onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
        />
        {["a","b","c","d"].map(opt => (
          <Input
            key={opt}
            placeholder={`Option ${opt.toUpperCase()}`}
            value={currentQuestion[`option_${opt}` as keyof QuizQuestion] as string}
            onChange={(e) => setCurrentQuestion({ ...currentQuestion, [`option_${opt}`]: e.target.value })}
          />
        ))}
        <Input
          type="number"
          min={1}
          placeholder="Points"
          value={currentQuestion.points}
          onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: Number(e.target.value) })}
        />
        <Select
          value={currentQuestion.correct_answer}
          onValueChange={(v) => setCurrentQuestion({ ...currentQuestion, correct_answer: v as "A"|"B"|"C"|"D" })}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Correct Answer" />
          </SelectTrigger>
          <SelectContent>
            {["A","B","C","D"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={handleAddQuestion} disabled={isLoading} className="mt-2 bg-green-500 text-white flex items-center gap-2">
          {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
          Add Question
        </Button>
      </CardContent>
    </Card>
  )
}
