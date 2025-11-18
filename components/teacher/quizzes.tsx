"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import CreateQuizForm from "@/components/teacher/create-quiz-form"
import { Plus, Brain, Trash2, Eye, Loader2 } from "lucide-react"

interface Quiz {
  id: string
  title: string
  description: string
  created_at: string
  question_count?: number
  total_points?: number
}

interface TeacherQuizzesProps {
  quizzes: Quiz[]
  onQuizzesChange: () => void
}

export default function TeacherQuizzes({ quizzes, onQuizzesChange }: TeacherQuizzesProps) {
  const supabase = createClient()
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleDeleteQuiz = async (id: string) => {
    if (!confirm("Are you sure you want to delete this quiz and all its questions?")) return
    setIsDeleting(id)
    try {
      await supabase.from("quiz_questions").delete().eq("quiz_id", id)
      await supabase.from("quizzes").delete().eq("id", id)
      onQuizzesChange()
    } catch (err) {
      console.error("Delete quiz error:", err)
    } finally {
      setIsDeleting(null)
    }
  }

  if (selectedQuiz) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">Manage Quiz Questions</h3>
          <Button variant="outline" onClick={() => setSelectedQuiz(null)}>Back</Button>
        </div>
        <CreateQuizForm quizId={selectedQuiz} onSuccess={onQuizzesChange} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-gray-600">Create and manage quizzes for your students.</p>
        <Button
          onClick={() => setSelectedQuiz("new")}
          className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Quiz
        </Button>
      </div>

      {quizzes.length === 0 ? (
        <Card className="border-2 border-gray-200 p-12 text-center">
          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No quizzes created yet</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="border-2 border-blue-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg text-gray-900">{quiz.title}</CardTitle>
                    <CardDescription className="text-gray-600">{quiz.description}</CardDescription>
                    <p className="text-sm mt-1 text-gray-500">
                      {quiz.question_count} question(s) | Total points: {quiz.total_points}
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">Quiz</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-500">Created {new Date(quiz.created_at).toLocaleDateString()}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setSelectedQuiz(quiz.id)} className="flex items-center gap-1">
                      <Eye className="w-4 h-4" /> Questions
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      disabled={isDeleting === quiz.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {isDeleting === quiz.id ? <Loader2 className="animate-spin w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
