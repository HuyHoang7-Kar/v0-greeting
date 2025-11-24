"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Target, Calendar } from "lucide-react"

interface QuizResult {
  id: string
  score: number
  total_questions: number
  completed_at: string
  quizzes: { title: string } // join từ bảng quizzes
}

interface Profile {
  full_name: string
  email: string
}

interface StudentProgressProps {
  studentId: string
}

export function StudentProgress({ studentId }: StudentProgressProps) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [results, setResults] = useState<QuizResult[]>([])
  const [totalPoints, setTotalPoints] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)

        // 1️⃣ Lấy profile học sinh
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", studentId)
          .single()
        setProfile(profileData)

        // 2️⃣ Lấy kết quả quiz từ bảng results và join quizzes để lấy title
        const { data: resultsData } = await supabase
          .from("results")
          .select(`
            id,
            score,
            total_questions,
            completed_at,
            quizzes!inner(title)
          `)
          .eq("user_id", studentId)
          .order("completed_at", { ascending: false })
        setResults(resultsData || [])

        // 3️⃣ Lấy tổng điểm từ bảng user_totals
        const { data: totalsData } = await supabase
          .from("user_totals")
          .select("total_score")
          .eq("user_id", studentId)
          .single()
        setTotalPoints(totalsData?.total_score ?? 0)
      } catch (err) {
        console.error("Không thể tải dữ liệu:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [studentId])

  if (isLoading) {
    return <div className="text-center py-12 text-gray-500">Đang tải dữ liệu...</div>
  }

  const totalQuizzes = results.length
  const totalScore = results.reduce((sum, r) => sum + r.score, 0)
  const averageScore = totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0
  const recentResults = results.slice(0, 5)

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600 bg-green-100"
    if (percentage >= 60) return "text-yellow-600 bg-yellow-100"
    return "text-red-600 bg-red-100"
  }

  return (
    <div className="space-y-6">
      {/* Hồ sơ học sinh */}
      <Card className="border-2 border-gray-200">
        <CardContent>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Hồ sơ học sinh</h2>
          <p className="text-gray-700">Họ tên: {profile?.full_name}</p>
          <p className="text-gray-700">Email: {profile?.email}</p>
        </CardContent>
      </Card>

      {/* Thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-600">Bài Kiểm Tra Hoàn Thành</p>
              <p className="text-3xl font-bold text-gray-900">{totalQuizzes}</p>
            </div>
            <Trophy className="w-8 h-8 text-purple-600" />
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-600">Điểm Trung Bình</p>
              <p className="text-3xl font-bold text-gray-900">{averageScore}</p>
            </div>
            <Target className="w-8 h-8 text-green-600" />
          </CardContent>
        </Card>

        <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng Điểm</p>
              <p className="text-3xl font-bold text-gray-900">{totalPoints}</p>
            </div>
            <Trophy className="w-8 h-8 text-yellow-600" />
          </CardContent>
        </Card>
      </div>

      {/* Kết quả gần đây */}
      <Card className="border-2 border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Kết Quả Gần Đây
          </CardTitle>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Chưa có kết quả kiểm tra</div>
          ) : (
            <div className="space-y-4">
              {recentResults.map((result) => {
                const percentage = Math.round((result.score / result.total_questions) * 100)
                return (
                  <div key={result.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{result.quizzes.title}</h4>
                      <p className="text-sm text-gray-500">
                        Hoàn thành: {new Date(result.completed_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {result.score}/{result.total_questions}
                        </p>
                      </div>
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
