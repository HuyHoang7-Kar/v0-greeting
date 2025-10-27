"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { Plus, Edit, Trash2, Save, X, HelpCircle } from "lucide-react"

interface QuizQuestion {
  id: string
  question: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: "A" | "B" | "C" | "D"
  created_at: string
}

interface QuizQuestionsProps {
  quizId: string
  onQuestionsChange?: () => void
}

export function QuizQuestions({ quizId, onQuestionsChange }: QuizQuestionsProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_answer: "A" as "A" | "B" | "C" | "D",
  })
  const [editQuestion, setEditQuestion] = useState({
    question: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_answer: "A" as "A" | "B" | "C" | "D",
  })

  useEffect(() => {
    loadQuestions()
  }, [quizId])

  const loadQuestions = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", quizId)
        .order("created_at", { ascending: true })
      if (error) throw error
      setQuestions(data || [])
    } catch (err) {
      console.error("Error loading questions:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateQuestion = async () => {
    if (!newQuestion.question.trim() || !newQuestion.option_a.trim() || !newQuestion.option_b.trim() || !newQuestion.option_c.trim() || !newQuestion.option_d.trim()) return
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("quiz_questions").insert({
        quiz_id: quizId,
        ...newQuestion
      })
      if (error) throw error
      setNewQuestion({ question: "", option_a: "", option_b: "", option_c: "", option_d: "", correct_answer: "A" })
      setShowCreateForm(false)
      loadQuestions()
      onQuestionsChange?.()
    } catch (err) {
      console.error("Error creating question:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const startEditing = (q: QuizQuestion) => {
    setEditingId(q.id)
    setEditQuestion({ ...q })
  }

  const handleUpdateQuestion = async (id: string) => {
    if (!editQuestion.question.trim() || !editQuestion.option_a.trim() || !editQuestion.option_b.trim() || !editQuestion.option_c.trim() || !editQuestion.option_d.trim()) return
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("quiz_questions")
        .update(editQuestion)
        .eq("id", id)
      if (error) throw error
      setEditingId(null)
      loadQuestions()
      onQuestionsChange?.()
    } catch (err) {
      console.error("Error updating question:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("quiz_questions").delete().eq("id", id)
      if (error) throw error
      loadQuestions()
      onQuestionsChange?.()
    } catch (err) {
      console.error("Error deleting question:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const getCorrectAnswerColor = (option: string, correctAnswer: string) => {
    return option === correctAnswer ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-50 border-gray-200"
  }

  if (isLoading) return <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div><p className="text-gray-600">Loading questions...</p></div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600">Manage questions for this quiz.</p>
          <p className="text-sm text-gray-500 mt-1">{questions.length} questions created</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)} className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {showCreateForm ? "Cancel" : "Add Question"}
        </Button>
      </div>

      {/* Create Question Form */}
      {showCreateForm && (
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader><CardTitle className="flex items-center gap-2"><Plus className="w-5 h-5" />Add New Question</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Label>Question *</Label>
            <Textarea value={newQuestion.question} onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })} className="min-h-20" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["a","b","c","d"].map(opt => (
                <div key={opt} className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Option {opt.toUpperCase()} *</Label>
                  <Input placeholder={`Option ${opt.toUpperCase()}`} value={newQuestion[`option_${opt}` as keyof typeof newQuestion]} onChange={(e) => setNewQuestion({ ...newQuestion, [`option_${opt}`]: e.target.value })}/>
                </div>
              ))}
            </div>
            <Label>Correct Answer *</Label>
            <Select value={newQuestion.correct_answer} onValueChange={(value) => setNewQuestion({ ...newQuestion, correct_answer: value as "A"|"B"|"C"|"D" })}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["A","B","C","D"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button onClick={handleCreateQuestion} disabled={isLoading} className="bg-blue-500 hover:bg-blue-600 text-white"><Save className="w-4 h-4 mr-2" />Add Question</Button>
              <Button variant="outline" onClick={() => { setShowCreateForm(false); setNewQuestion({ question: "", option_a: "", option_b: "", option_c: "", option_d: "", correct_answer: "A" }) }}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions List */}
      {questions.length === 0 ? (
        <Card className="border-2 border-gray-200">
          <CardContent className="p-12 text-center">
            <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No questions added yet</p>
            <p className="text-gray-400 text-sm mt-2">Add your first question to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <Card key={q.id} className="border-2 border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">Q{idx+1}</Badge>
                  <Badge variant="outline" className="bg-green-100 text-green-800">Answer: {q.correct_answer}</Badge>
                </div>
                <div className="flex gap-1">
                  {editingId === q.id ? (
                    <>
                      <Button size="sm" variant="ghost" onClick={() => handleUpdateQuestion(q.id)} disabled={isLoading}><Save className="w-4 h-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}><X className="w-4 h-4" /></Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" variant="ghost" onClick={() => startEditing(q)}><Edit className="w-4 h-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteQuestion(q.id)} disabled={isLoading}><Trash2 className="w-4 h-4" /></Button>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {editingId === q.id ? (
                  <>
                    <Textarea value={editQuestion.question} onChange={(e) => setEditQuestion({ ...editQuestion, question: e.target.value })} className="min-h-20" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {["a","b","c","d"].map(opt => (
                        <Input key={opt} value={editQuestion[`option_${opt}` as keyof typeof editQuestion]} onChange={(e) => setEditQuestion({ ...editQuestion, [`option_${opt}`]: e.target.value })} placeholder={`Option ${opt.toUpperCase()}`} />
                      ))}
                    </div>
                    <Select value={editQuestion.correct_answer} onValueChange={(value) => setEditQuestion({ ...editQuestion, correct_answer: value as "A"|"B"|"C"|"D" })}>
                      <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["A","B","C","D"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-gray-900">{q.question}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {["A","B","C","D"].map(opt => (
                        <div key={opt} className={`p-3 rounded-lg border-2 ${getCorrectAnswerColor(opt, q.correct_answer)}`}>
                          <span className="font-medium text-blue-600 mr-2">{opt}.</span>
                          <span>{q[`option_${opt.toLowerCase()}` as keyof QuizQuestion]}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
