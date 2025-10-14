"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Trophy, TrendingUp, Calendar, Target } from "lucide-react"

interface QuizResult {
  id: string
  score: number
  total_questions: number
  completed_at: string
  quizzes: {
    title: string
  }
}

interface StudentProgressProps {
  results: QuizResult[]
  studentId: string // 🔹 thêm studentId để biết ai là người chơi
}

export function StudentProgress({ results, studentId }: StudentProgressProps) {
  const [isSaving, setIsSaving] = useState(false)

  const totalQuizzes = results.length
  const totalScore = results.reduce((sum, result) => sum + result.score, 0)
  const totalQuestions = results.reduce((sum, result) => sum + result.total_questions, 0)
  const averageScore = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0

  const recentResults = results.slice(0, 5)

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600 bg-green-100"
    if (percentage >= 60) return "text-yellow-600 bg-yellow-100"
    return "text-red-600 bg-red-100"
  }

  // 🧠 Hàm ghi điểm vào backend Supabase
  async function recordScore(quizId: string, score: number, totalQuestions: number) {
    try {
      setIsSaving(true)
      const res = await fetch("/api/student/recordScore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentId,
          game_id: quizId,
          score,
          total_questions: totalQuestions,
        }),
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)
      alert("✅ Điểm đã được lưu thành công!")
    } catch (err: any) {
      console.error("❌ Lỗi ghi điểm:", err.message)
      alert("❌ Lỗi khi lưu điểm: " + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Quizzes Completed</p>
                <p className="text-3xl font-bold text-gray-900">{totalQuizzes}</p>
              </div>
              <Trophy className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-3xl font-bold text-gray-900">{averageScore}%</p>
              </div>
              <Target className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Questions Answered</p>
                <p className="text-3xl font-bold text-gray-900">{totalQuestions}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Quiz Results */}
      <Card className="border-2 border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Recent Quiz Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No quiz results yet</p>
              <p className="text-gray-400 text-sm mt-2">Take your first quiz to see your progress!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentResults.map((result) => {
                const percentage = Math.round((result.score / result.total_questions) * 100)
                return (
                  <div
                    key={result.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-balance">{result.quizzes.title}</h4>
                      <p className="text-sm text-gray-500">
                        Completed on {new Date(result.completed_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {result.score}/{result.total_questions}
                        </p>
                        <Progress value={percentage} className="w-20 h-2" />
                      </div>
                      <Badge className={getScoreColor(percentage)}>{percentage}%</Badge>
                      <button
                        onClick={() =>
                          recordScore(result.id, result.score, result.total_questions)
                        }
                        disabled={isSaving}
                        className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md"
                      >
                        {isSaving ? "Saving..." : "Save Score"}
                      </button>
                    </div>
                  </div>
                )
              })}

              {results.length > 5 && (
                <p className="text-center text-sm text-gray-500 pt-4">
                  Showing {recentResults.length} of {results.length} results
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
