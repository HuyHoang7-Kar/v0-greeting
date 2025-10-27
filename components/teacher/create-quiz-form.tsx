"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button, Input, Textarea, Label } from "@/components/ui"

export function CreateQuizWithQuestionForm() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [question, setQuestion] = useState("")
  const [optionA, setOptionA] = useState("")
  const [optionB, setOptionB] = useState("")
  const [optionC, setOptionC] = useState("")
  const [optionD, setOptionD] = useState("")
  const [correct, setCorrect] = useState<"A"|"B"|"C"|"D">("A")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error("Must be logged in")

      // 1️⃣ Tạo quiz
      const { data: quiz, error: quizError } = await supabase.from("quizzes")
        .insert({ title, description, created_by: user.id, teacher_id: user.id })
        .select()
        .single()
      if (quizError || !quiz) throw new Error(quizError?.message || "Quiz insert failed")

      // 2️⃣ Tạo câu hỏi
      const { error: questionError } = await supabase.from("quiz_questions")
        .insert({
          quiz_id: quiz.id,
          question,
          option_a: optionA,
          option_b: optionB,
          option_c: optionC,
          option_d: optionD,
          correct_answer: correct
        })
      if (questionError) throw new Error(questionError.message)

      // reset form
      setTitle(""); setDescription(""); setQuestion("");
      setOptionA(""); setOptionB(""); setOptionC(""); setOptionD(""); setCorrect("A");
      alert("Quiz + Question created successfully!")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Label>Quiz Title *</Label>
      <Input value={title} onChange={e=>setTitle(e.target.value)} required/>
      <Label>Description *</Label>
      <Textarea value={description} onChange={e=>setDescription(e.target.value)} required/>

      <Label>Question *</Label>
      <Textarea value={question} onChange={e=>setQuestion(e.target.value)} required/>
      <Label>Option A *</Label>
      <Input value={optionA} onChange={e=>setOptionA(e.target.value)} required/>
      <Label>Option B *</Label>
      <Input value={optionB} onChange={e=>setOptionB(e.target.value)} required/>
      <Label>Option C *</Label>
      <Input value={optionC} onChange={e=>setOptionC(e.target.value)} required/>
      <Label>Option D *</Label>
      <Input value={optionD} onChange={e=>setOptionD(e.target.value)} required/>

      <Label>Correct Answer *</Label>
      <select value={correct} onChange={e=>setCorrect(e.target.value as any)}>
        <option value="A">A</option>
        <option value="B">B</option>
        <option value="C">C</option>
        <option value="D">D</option>
      </select>

      {error && <div className="text-red-600">{error}</div>}
      <Button type="submit" disabled={isLoading}>{isLoading ? "Creating..." : "Create Quiz"}</Button>
    </form>
  )
}
