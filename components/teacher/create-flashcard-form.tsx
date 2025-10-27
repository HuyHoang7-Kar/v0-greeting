"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { Plus, Loader2 } from "lucide-react"

interface CreateQuizFormProps {
  onSuccess?: () => void
}

export function CreateQuizForm({ onSuccess }: CreateQuizFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [question, setQuestion] = useState("")
  const [optionA, setOptionA] = useState("")
  const [optionB, setOptionB] = useState("")
  const [optionC, setOptionC] = useState("")
  const [optionD, setOptionD] = useState("")
  const [correct, setCorrect] = useState<"A" | "B" | "C" | "D">("A")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Lấy user hiện tại
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError || !user) throw new Error(userError?.message || "You must be logged in")

      // 1️⃣ Tạo quiz
      const { data: quiz, error: quizError } = await supabase
        .from("quizzes")
        .insert({ title: title.trim(), description: description.trim(), created_by: user.id, teacher_id: user.id })
        .select()
        .single()
      if (quizError || !quiz) throw new Error(quizError?.message || "Quiz creation failed")

      // 2️⃣ Tạo câu hỏi đầu tiên
      const { error: questionError } = await supabase.from("quiz_questions").insert({
        quiz_id: quiz.id,
        question: question.trim(),
        option_a: optionA.trim(),
        option_b: optionB.trim(),
        option_c: optionC.trim(),
        option_d: optionD.trim(),
        correct_answer: correct,
      })
      if (questionError) throw new Error(questionError.message)

      // Reset form
      setTitle("")
      setDescription("")
      setQuestion("")
      setOptionA("")
      setOptionB("")
      setOptionC("")
      setOptionD("")
      setCorrect("A")

      onSuccess?.()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Plus className="w-5 h-5" />
          Create New Quiz
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Quiz Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter quiz title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter quiz description"
              required
              className="min-h-20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="question">First Question *</Label>
            <Textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter the question"
              required
              className="min-h-20"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Option A *</Label>
              <Input value={optionA} onChange={(e) => setOptionA(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Option B *</Label>
              <Input value={optionB} onChange={(e) => setOptionB(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Option C *</Label>
              <Input value={optionC} onChange={(e) => setOptionC(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Option D *</Label>
              <Input value={optionD} onChange={(e) => setOptionD(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Correct Answer *</Label>
            <Select value={correct} onValueChange={(value: "A" | "B" | "C" | "D") => setCorrect(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="B">B</SelectItem>
                <SelectItem value="C">C</SelectItem>
                <SelectItem value="D">D</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{error}</div>
          )}

          <Button
            type="submit"
            disabled={isLoading || !title.trim() || !description.trim() || !question.trim()}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Quiz
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
