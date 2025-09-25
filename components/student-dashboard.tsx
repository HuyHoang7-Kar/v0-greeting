"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { FlashcardGrid } from "./flashcard-grid"
import { FlashcardStudyMode } from "./flashcard-study-mode"
import { StudentNotes } from "./student-notes"
import { StudentQuizzes } from "./student-quizzes"
import { StudentProgress } from "./student-progress"
import { GameHub } from "./games/game-hub"
import { Leaderboard } from "./rewards/leaderboard"
import { UserProfile } from "./rewards/user-profile"
import { BookOpen, Brain, FileText, TrendingUp, Play, LogOut, User, Gamepad2, Trophy, Medal } from "lucide-react"
import { useRouter } from "next/navigation"

interface Profile {
  id: string
  email: string
  full_name: string
  role: string
}

interface StudentDashboardProps {
  user: any
  profile: Profile
}

export function StudentDashboard({ user, profile }: StudentDashboardProps) {
  const [flashcards, setFlashcards] = useState<any[]>([])
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [notes, setNotes] = useState<any[]>([])
  const [results, setResults] = useState<any[]>([])
  const [userPoints, setUserPoints] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [studyMode, setStudyMode] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const supabase = createClient()

      // Load flashcards
      const { data: flashcardsData } = await supabase
        .from("flashcards")
        .select("*")
        .order("created_at", { ascending: false })

      // Load quizzes
      const { data: quizzesData } = await supabase.from("quizzes").select("*").order("created_at", { ascending: false })

      // Load user's notes
      const { data: notesData } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })

      // Load user's quiz results
      const { data: resultsData } = await supabase
        .from("results")
        .select(`
          *,
          quizzes (
            title
          )
        `)
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false })

      // Load user points
      const { data: pointsData } = await supabase.from("user_points").select("*").eq("user_id", user.id).single()

      setFlashcards(flashcardsData || [])
      setQuizzes(quizzesData || [])
      setNotes(notesData || [])
      setResults(resultsData || [])
      setUserPoints(pointsData)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleStudyComplete = (studyResults: { correct: number; total: number }) => {
    // Refresh data to show updated progress
    loadDashboardData()
    setStudyMode(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải bảng điều khiển...</p>
        </div>
      </div>
    )
  }

  if (studyMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-6">
        <div className="container mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Chế Độ Học Tập</h1>
            <Button variant="outline" onClick={() => setStudyMode(false)} className="border-gray-300">
              Thoát Chế Độ Học
            </Button>
          </div>
          <FlashcardStudyMode flashcards={flashcards} onComplete={handleStudyComplete} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <BookOpen className="w-8 h-8 text-yellow-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">EduCards</h1>
              <p className="text-sm text-gray-600">Bảng Điều Khiển Học Sinh</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">{profile.full_name || profile.email}</span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Học Sinh
              </Badge>
              {userPoints && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  <Medal className="w-3 h-3 mr-1" />
                  {userPoints.total_points} điểm
                </Badge>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="flex items-center gap-2 bg-transparent"
            >
              <LogOut className="w-4 h-4" />
              Đăng Xuất
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Thẻ Học Có Sẵn</p>
                  <p className="text-3xl font-bold text-gray-900">{flashcards.length}</p>
                </div>
                <BookOpen className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Bài Kiểm Tra</p>
                  <p className="text-3xl font-bold text-gray-900">{quizzes.length}</p>
                </div>
                <Brain className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ghi Chú Của Tôi</p>
                  <p className="text-3xl font-bold text-gray-900">{notes.length}</p>
                </div>
                <FileText className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Điểm Tổng</p>
                  <p className="text-3xl font-bold text-gray-900">{userPoints?.total_points || 0}</p>
                </div>
                <Trophy className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <Card className="border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Sẵn Sàng Học Tập?</h3>
                  <p className="text-gray-600">
                    Bắt đầu phiên học với tất cả thẻ học có sẵn và theo dõi tiến độ của bạn.
                  </p>
                </div>
                <Button
                  onClick={() => setStudyMode(true)}
                  disabled={flashcards.length === 0}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Bắt Đầu Học
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="flashcards" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white border-2 border-gray-200">
            <TabsTrigger value="flashcards" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Thẻ Học
            </TabsTrigger>
            <TabsTrigger value="games" className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4" />
              Trò Chơi
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Kiểm Tra
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Ghi Chú
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Tiến Độ
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Xếp Hạng
            </TabsTrigger>
          </TabsList>

          <TabsContent value="flashcards" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Thẻ Học Có Sẵn</h2>
              {flashcards.length > 0 && (
                <Button
                  onClick={() => setStudyMode(true)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Học Tất Cả
                </Button>
              )}
            </div>
            <FlashcardGrid flashcards={flashcards} />
          </TabsContent>

          <TabsContent value="games" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Trò Chơi Học Tập</h2>
            <GameHub />
          </TabsContent>

          <TabsContent value="quizzes" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Bài Kiểm Tra</h2>
            <StudentQuizzes quizzes={quizzes} onQuizComplete={loadDashboardData} />
          </TabsContent>

          <TabsContent value="notes" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Ghi Chú Của Tôi</h2>
            <StudentNotes notes={notes} onNotesChange={loadDashboardData} />
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Tiến Độ Học Tập</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <StudentProgress results={results} />
              <UserProfile userPoints={userPoints} />
            </div>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Bảng Xếp Hạng</h2>
            <Leaderboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
