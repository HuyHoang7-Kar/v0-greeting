"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { FlashcardGrid } from "@/components/student/flashcard-grid"
import { FlashcardStudyMode } from "@/components/student/flashcard-study-mode"
import { StudentNotes } from "@/components/student/notes"
import { StudentQuizzes } from "@/components/student/quizzes"
import { StudentProgress } from "@/components/student/progress"
import { GameHub } from "@/components/games/game-hub"
import { Leaderboard } from "@/components/rewards/leaderboard"
import { UserProfile } from "@/components/rewards/user-profile"
import { BookOpen, Brain, FileText, TrendingUp, Play, LogOut, User, Gamepad2, Trophy, Medal } from "lucide-react"
import { useRouter } from "next/navigation"

interface Profile {
  id: string
  email: string
  full_name: string
  role: string
  avatar_url?: string
  bio?: string
  class_name?: string
}

export function StudentDashboard() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [flashcards, setFlashcards] = useState<any[]>([])
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [notes, setNotes] = useState<any[]>([])
  const [results, setResults] = useState<any[]>([])
  const [userPoints, setUserPoints] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [studyMode, setStudyMode] = useState(false)
  const router = useRouter()

  const supabase = createClient()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError || !user) throw new Error("User not authenticated")

      setUser(user)

      // 🧩 Lấy profile
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      setProfile(profileData)

      // 🧩 Lấy flashcards
      const { data: flashcardsData } = await supabase
        .from("flashcards")
        .select("*")
        .order("created_at", { ascending: false })

      // 🧩 Lấy quizzes
      const { data: quizzesData } = await supabase.from("quizzes").select("*").order("created_at", { ascending: false })

      // 🧩 Lấy notes của user
      const { data: notesData } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })

      // 🧩 Lấy kết quả quiz
      const { data: resultsData } = await supabase
        .from("results")
        .select(
          `
          *,
          quizzes ( title )
        `
        )
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false })

      // 🧩 Lấy điểm user
      const { data: pointsData } = await supabase.from("user_points").select("*").eq("user_id", user.id).single()

      setFlashcards(flashcardsData || [])
      setQuizzes(quizzesData || [])
      setNotes(notesData || [])
      setResults(resultsData || [])
      setUserPoints(pointsData)
    } catch (error) {
      console.error("❌ Lỗi load dashboard:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleStudyComplete = () => {
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
              <span className="text-sm text-gray-700">
                {profile?.full_name || profile?.email || user?.email || "Người dùng"}
              </span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Học Sinh
              </Badge>
              {userPoints && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  <Medal className="w-3 h-3 mr-1" />
                  {userPoints.total_points || 0} điểm
                </Badge>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut} className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Đăng Xuất
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Thẻ Học Có Sẵn", value: flashcards.length, icon: BookOpen, color: "yellow" },
            { label: "Bài Kiểm Tra", value: quizzes.length, icon: Brain, color: "blue" },
            { label: "Ghi Chú Của Tôi", value: notes.length, icon: FileText, color: "green" },
            { label: "Điểm Tổng", value: userPoints?.total_points || 0, icon: Trophy, color: "purple" },
          ].map(({ label, value, icon: Icon, color }, idx) => (
            <Card
              key={idx}
              className={`border-2 border-${color}-200 bg-gradient-to-br from-${color}-50 to-${color}-100`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{label}</p>
                    <p className="text-3xl font-bold text-gray-900">{value}</p>
                  </div>
                  <Icon className={`w-8 h-8 text-${color}-600`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="flashcards" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white border-2 border-gray-200">
            <TabsTrigger value="flashcards">
              <BookOpen className="w-4 h-4" /> Thẻ Học
            </TabsTrigger>
            <TabsTrigger value="games">
              <Gamepad2 className="w-4 h-4" /> Trò Chơi
            </TabsTrigger>
            <TabsTrigger value="quizzes">
              <Brain className="w-4 h-4" /> Kiểm Tra
            </TabsTrigger>
            <TabsTrigger value="notes">
              <FileText className="w-4 h-4" /> Ghi Chú
            </TabsTrigger>
            <TabsTrigger value="progress">
              <TrendingUp className="w-4 h-4" /> Tiến Độ
            </TabsTrigger>
            <TabsTrigger value="leaderboard">
              <Trophy className="w-4 h-4" /> Xếp Hạng
            </TabsTrigger>
          </TabsList>

          <TabsContent value="flashcards">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Thẻ Học Có Sẵn</h2>
            <FlashcardGrid flashcards={flashcards} />
          </TabsContent>

          <TabsContent value="games">
            <GameHub />
          </TabsContent>

          <TabsContent value="quizzes">
            <StudentQuizzes quizzes={quizzes} onQuizComplete={loadDashboardData} />
          </TabsContent>

          <TabsContent value="notes">
            <StudentNotes notes={notes} onNotesChange={loadDashboardData} />
          </TabsContent>

          <TabsContent value="progress">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <StudentProgress results={results} />
              <UserProfile profile={profile} userPoints={userPoints} />
            </div>
          </TabsContent>

          <TabsContent value="leaderboard">
            <Leaderboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
