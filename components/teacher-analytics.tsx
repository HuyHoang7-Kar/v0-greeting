"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, Users, Target } from "lucide-react"

interface QuizResult {
  id: string
  score: number
  total_questions: number
  completed_at: string
  profiles: {
    full_name: string
    email: string
  }
  quizzes: {
    title: string
  }
}

interface Quiz {
  id: string
  title: string
}

interface TeacherAnalyticsProps {
  results: QuizResult[]
  quizzes: Quiz[]
}

export function TeacherAnalytics({ results, quizzes }: TeacherAnalyticsProps) {
  const totalAttempts = results.length
  const totalScore = results.reduce((sum, result) => sum + result.score, 0)
  const totalQuestions = results.reduce((sum, result) => sum + result.total_questions, 0)
  const averageScore = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0

  const uniqueStudents = new Set(results.map((r) => r.profiles?.email)).size

  const quizStats = quizzes.map((quiz) => {
    const quizResults = results.filter((r) => r.quizzes?.title === quiz.title)
    const attempts = quizResults.length
    const avgScore =
      attempts > 0
        ? Math.round(
            (quizResults.reduce((sum, r) => sum + r.score, 0) /
              quizResults.reduce((sum, r) => sum + r.total_questions, 0)) *
              100,
          )
        : 0

    return {
      title: quiz.title,
      attempts,
      avgScore,
    }
  })

  const recentResults = results.slice(0, 10)

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600 bg-green-100"
    if (percentage >= 60) return "text-yellow-600 bg-yellow-100"
    return "text-red-600 bg-red-100"
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Attempts</p>
                <p className="text-3xl font-bold text-gray-900">{totalAttempts}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
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
                <p className="text-sm font-medium text-gray-600">Active Students</p>
                <p className="text-3xl font-bold text-gray-900">{uniqueStudents}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Questions Answered</p>
                <p className="text-3xl font-bold text-gray-900">{totalQuestions}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quiz Performance */}
      <Card className="border-2 border-gray-200">
        <CardHeader>
          <CardTitle>Quiz Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {quizStats.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No quiz data available</p>
              <p className="text-gray-400 text-sm mt-2">Create quizzes to see performance analytics!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {quizStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-balance">{stat.title}</h4>
                    <p className="text-sm text-gray-500">{stat.attempts} attempts</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">Average Score</p>
                      <Progress value={stat.avgScore} className="w-20 h-2" />
                    </div>
                    <Badge className={getScoreColor(stat.avgScore)}>{stat.avgScore}%</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border-2 border-gray-200">
        <CardHeader>
          <CardTitle>Recent Quiz Results</CardTitle>
        </CardHeader>
        <CardContent>
          {recentResults.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No recent activity</p>
              <p className="text-gray-400 text-sm mt-2">Student quiz results will appear here!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentResults.map((result) => {
                const percentage = Math.round((result.score / result.total_questions) * 100)
                return (
                  <div key={result.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-balance">
                        {result.profiles?.full_name || result.profiles?.email}
                      </p>
                      <p className="text-sm text-gray-500">
                        {result.quizzes?.title} • {new Date(result.completed_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-900">
                        {result.score}/{result.total_questions}
                      </span>
                      <Badge className={getScoreColor(percentage)}>{percentage}%</Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
