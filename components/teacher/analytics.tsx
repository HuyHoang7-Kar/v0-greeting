"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Result {
  id: string
  score: number
  total_questions: number
  completed_at: string
  user_id: string
  quiz_id: string
}

interface Profile {
  id: string
  full_name: string
  email: string
}

interface Quiz {
  id: string
  title: string
}

interface TeacherAnalyticsProps {
  results: Result[]
  students: Profile[]
  quizzes: Quiz[]
}

export function TeacherAnalytics({ results, students, quizzes }: TeacherAnalyticsProps) {
  if (!results || results.length === 0) return <p>Chưa có kết quả bài kiểm tra nào.</p>

  // Nhóm theo học sinh
  const studentsMap: Record<string, Result[]> = {}
  results.forEach(result => {
    const student = students.find(s => s.id === result.user_id)
    const key = student?.email || "Unknown"
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
        const student = students.find(s => s.email === email)
        const fullName = student?.full_name || email

        return (
          <Card key={email} className="border-2 border-gray-200">
            <CardHeader>
              <CardTitle>{fullName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {studentResults.map(result => {
                const quiz = quizzes.find(q => q.id === result.quiz_id)
                const percentage = Math.round((result.score / result.total_questions) * 100)
                return (
                  <div key={result.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{quiz?.title || "Unknown Quiz"}</p>
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
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
