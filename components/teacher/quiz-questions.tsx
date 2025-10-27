"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { Plus, Save, X } from "lucide-react"

interface QuizQuestion {
  id: string
  question: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: "A" | "B" | "C" | "D"
}

interface QuizQuestionsProps {
  quizId: string
}

export function QuizQuestions({ quizId }: QuizQuestionsProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_answer: "A" as "A"|"B"|"C"|"D"
  })
  const [showForm, setShowForm] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadQuestions()
  }, [])

  const loadQuestions = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("quiz_questions").select("*").eq("quiz_id", quizId)
      if (error) throw error
      setQuestions(data || [])
    } catch (err: any) {
      console.error("Load questions error:", err)
      setError(err.message || JSON.stringify(err))
    } finally {
      setLoading(false)
    }
  }

  const handleAddQuestion = async () => {
    if (!newQuestion.question.trim()) return
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("quiz_questions").insert({
        quiz_id: quizId,
        ...newQuestion
      })
      if (error) throw error
      setNewQuestion({ question:"", option_a:"", option_b:"", option_c:"", option_d:"", correct_answer:"A" })
      loadQuestions()
    } catch (err: any) {
      console.error("Add question error:", err)
      setError(err.message || JSON.stringify(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {showForm && (
        <Card className="border-2 border-blue-200 p-4 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" /> Add Question
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {error && <p className="text-red-600">{error}</p>}
            <Textarea
              placeholder="Question"
              value={newQuestion.question}
              onChange={(e)=>setNewQuestion({...newQuestion, question:e.target.value})}
            />
            {["a","b","c","d"].map(opt => (
              <Input
                key={opt}
                placeholder={`Option ${opt.toUpperCase()}`}
                value={newQuestion[`option_${opt}` as keyof typeof newQuestion]}
                onChange={(e)=>setNewQuestion({...newQuestion, [`option_${opt}`]: e.target.value})}
              />
            ))}
            <Select value={newQuestion.correct_answer} onValueChange={(v)=>setNewQuestion({...newQuestion, correct_answer:v as "A"|"B"|"C"|"D"})}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["A","B","C","D"].map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="flex gap-2 mt-2">
              <Button onClick={handleAddQuestion} disabled={loading} className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2">
                <Save className="w-4 h-4"/> Add
              </Button>
              <Button variant="outline" onClick={()=>setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {questions.map((q, idx)=>(
          <Card key={q.id} className="p-2 border-2">
            <p className="font-medium">Q{idx+1}: {q.question}</p>
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
