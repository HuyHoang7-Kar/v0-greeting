"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp } from "lucide-react"

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

interface TeacherAnalyticsProps {
  results: QuizResult[]
}

export function TeacherAnalytics({ results }: TeacherAnalyticsProps) {
  // Nhóm kết quả theo học sinh
  const studentsMap: Record<string, QuizResult[]> = {}
  results.forEach(result => {
    const key = result.profiles?.email || "Unknown"
    if (!studentsMap[key]) studentsMap[key] = []
    studentsMap[key].push(result)
  })

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600 bg-green-100"
    if (percentage >= 60) return "text-yellow-600 bg-yellow-100"
    return "text-red-600 bg-red-100"
  }

  return (
    <div className="space-y-6">
      {Object.entries(studentsMap).map(([email, studentResults]) => {
        const fullName = studentResults[0]?.profiles?.full_name || email
        return (
          <Card key={email} className="border-2 border-gray-200">
            <CardHeader>
              <CardTitle>{fullName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {studentResults.length === 0 ? (
                <p className="text-gray-500 text-sm">No quizzes taken</p>
              ) : (
                <div className="space-y-2">
                  {studentResults.map(result => {
                    const percentage = Math.round((result.score / result.total_questions) * 100)
                    return (
                      <div key={result.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{result.quizzes?.title}</p>
                          <p className="text-sm text-gray-500">
                            Completed: {new Date(result.completed_at).toLocaleDateString()}
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
        )
      })}
    </div>
  )
}
