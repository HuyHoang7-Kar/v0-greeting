"use client"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Target, Calendar } from "lucide-react"

// Khởi tạo Supabase client
const supabaseUrl = "https://byrguxinsefhcrvmkbow.supabase.co"
const supabaseAnonKey = "YOUR_ANON_KEY_HERE" // Thay bằng anon key của bạn
const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface QuizResult {
  id: string
  score: number
  total_questions: number
  completed_at: string
  quiz_title: string
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
  const [averageScore, setAverageScore] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!studentId) return

    async function fetchData() {
      setIsLoading(true)
      try {
        // 1️⃣ Lấy profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", studentId)
          .single()
        if (profileError) throw profileError
        setProfile(profileData)

        // 2️⃣ Lấy kết quả quiz + title
        const { data: resultsData, error: resultsError } = await supabase
          .from("results")
          .select(`
            id,
            score,
            total_questions,
            completed_at,
            quizzes (title)
          `)
          .eq("user_id", studentId)
          .order("completed_at", { ascending: false })

        if (resultsError) throw resultsError

        const mapped: QuizResult[] = (resultsData || []).map((r: any) => ({
          id: r.id,
          score: r.score,
          total_questions: r.total_questions,
          completed_at: r.completed_at,
          quiz_title: r.quizzes?.title || "Chưa có tiêu đề",
        }))

        setResults(mapped)

        // 3️⃣ Tính tổng điểm & điểm trung bình
        const total = mapped.reduce((sum, r) => sum + r.score, 0)
        setTotalPoints(total)
        setAverageScore(mapped.length > 0 ? Math.round(total / mapped.length) : 0)

      } catch (err) {
        console.error("Không thể tải dữ liệu:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [studentId])

  if (isLoading) return <div className="text-center py-12 text-gray-500">⏳ Đang tải dữ liệu...</div>

  const totalQuizzes = results.length
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
                  <div
                    key={result.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{result.quiz_title}</h4>
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
