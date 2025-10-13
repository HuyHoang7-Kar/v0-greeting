"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreateQuizForm } from "@/components/teacher/create-quiz-form"
import { QuizQuestions } from "@/components/student/quiz-questions"
import { Plus, Brain, Trash2, Eye } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Quiz {
  id: string
  title: string
  description: string
  created_at: string
}

interface TeacherQuizzesProps {
  quizzes: Quiz[]
  onQuizzesChange: () => void
}

export function TeacherQuizzes({ quizzes, onQuizzesChange }: TeacherQuizzesProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleDeleteQuiz = async (id: string) => {
    if (!confirm("Are you sure you want to delete this quiz? This will also delete all questions.")) return

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("quizzes").delete().eq("id", id)

      if (!error) {
        onQuizzesChange()
      }
    } catch (error) {
      console.error("Error deleting quiz:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuizCreated = () => {
    setShowCreateForm(false)
    onQuizzesChange()
  }

  if (selectedQuiz) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Manage Quiz Questions</h3>
          <Button variant="outline" onClick={() => setSelectedQuiz(null)}>
            Back to Quizzes
          </Button>
        </div>
        <QuizQuestions quizId={selectedQuiz} onQuestionsChange={onQuizzesChange} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-gray-600">Create and manage quizzes for your students.</p>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {showCreateForm ? "Cancel" : "Create Quiz"}
        </Button>
      </div>

      {showCreateForm && <CreateQuizForm onSuccess={handleQuizCreated} />}

      {quizzes.length === 0 ? (
        <Card className="border-2 border-gray-200">
          <CardContent className="p-12 text-center">
            <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No quizzes created yet</p>
            <p className="text-gray-400 text-sm mt-2">Create your first quiz to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="border-2 border-blue-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-gray-900 text-balance">{quiz.title}</CardTitle>
                    <CardDescription className="mt-2 text-pretty">{quiz.description}</CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Quiz
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">Created {new Date(quiz.created_at).toLocaleDateString()}</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedQuiz(quiz.id)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      Questions
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      disabled={isLoading}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
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
