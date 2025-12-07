"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { FlashcardGrid } from "@/components/student/flashcard-grid"
import { FlashcardStudyMode } from "@/components/student/flashcard-study-mode"
import { StudentNotes } from "@/components/student/notes"
import { StudentQuizzes } from "@/components/student/quizzes"
import { StudentProgress } from "@/components/student/progress"
import { GameHub } from "@/components/games/game-hub"
import JoinClass from "@/components/student/join-class"
import { BookOpen, Brain, FileText, TrendingUp, LogOut, User, Gamepad2, Trophy, Medal, Users } from "lucide-react"
import { useRouter } from "next/navigation"

interface Profile {
  id: string
  email: string
  full_name: string
  role: string
  avatar_url?: string
  bio?: string
}

interface Class {
  id: string
  name: string
  description?: string
  teacher_id: string
  created_at: string
}

export function StudentDashboard({ user, profile }: { user: any; profile: Profile }) {
  const [flashcards, setFlashcards] = useState<any[]>([])
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [notes, setNotes] = useState<any[]>([])
  const [results, setResults] = useState<any[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [myClasses, setMyClasses] = useState<string[]>([])
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

      const { data: flashcardsData } = await supabase.from("flashcards").select("*").order("created_at", { ascending: false })
      const { data: quizzesData } = await supabase.from("quizzes").select("*").order("created_at", { ascending: false })
      const { data: notesData } = await supabase.from("notes").select("*").eq("user_id", user.id).order("updated_at", { ascending: false })
      const { data: resultsData } = await supabase
        .from("results")
        .select(`*, quizzes(title)`)
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false })
      const { data: pointsData } = await supabase.from("user_totals").select("*").eq("user_id", user.id).single()

      // Lấy danh sách lớp
      const { data: classesData } = await supabase.from("classes").select("*").order("created_at", { ascending: false })
      // Lấy lớp mà học sinh đã tham gia
      const { data: myClassesData } = await supabase.from("class_students").select("class_id").eq("student_id", user.id)

      setFlashcards(flashcardsData || [])
      setQuizzes(quizzesData || [])
      setNotes(notesData || [])
      setResults(resultsData || [])
      setUserPoints(pointsData)
      setClasses(classesData || [])
      setMyClasses(myClassesData?.map((c) => c.class_id) || [])
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
              <span className="text-sm text-gray-700">{profile?.full_name || profile?.email || user?.email}</span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">Học Sinh</Badge>
              {userPoints && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  <Medal className="w-3 h-3 mr-1" /> {userPoints.total_score || 0} điểm
                </Badge>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut} className="flex items-center gap-2 bg-transparent">
              <LogOut className="w-4 h-4" /> Đăng Xuất
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
            { label: "Điểm Tổng", value: userPoints?.total_score || 0, icon: Trophy, color: "purple" }
          ].map(({ label, value, icon: Icon, color }, idx) => (
            <Card key={idx} className={`border-2 border-${color}-200 bg-gradient-to-br from-${color}-50 to-${color}-100`}>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{label}</p>
                  <p className="text-3xl font-bold text-gray-900">{value}</p>
                </div>
                <Icon className={`w-8 h-8 text-${color}-600`} />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="flashcards" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white border-2 border-gray-200">
            <TabsTrigger value="flashcards"><BookOpen className="w-4 h-4" /> Thẻ Học</TabsTrigger>
            <TabsTrigger value="games"><Gamepad2 className="w-4 h-4" /> Trò Chơi</TabsTrigger>
            <TabsTrigger value="quizzes"><Brain className="w-4 h-4" /> Kiểm Tra</TabsTrigger>
            <TabsTrigger value="notes"><FileText className="w-4 h-4" /> Ghi Chú</TabsTrigger>
            <TabsTrigger value="progress"><TrendingUp className="w-4 h-4" /> Tiến Độ</TabsTrigger>
            <TabsTrigger value="classes"><Users className="w-4 h-4" /> Lớp Học</TabsTrigger>
          </TabsList>

          {/* Flashcards Tab */}
          <TabsContent value="flashcards"><FlashcardGrid flashcards={flashcards} /></TabsContent>
          <TabsContent value="games"><GameHub /></TabsContent>
          <TabsContent value="quizzes"><StudentQuizzes quizzes={quizzes} onQuizComplete={loadDashboardData} /></TabsContent>
          <TabsContent value="notes"><StudentNotes notes={notes} onNotesChange={loadDashboardData} /></TabsContent>
          <TabsContent value="progress"><StudentProgress results={results} quizzes={quizzes} /></TabsContent>

          {/* Classes Tab */}
          <TabsContent value="classes" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Tham Gia Lớp</h2>
            <JoinClass userId={user.id} onJoined={(id) => setMyClasses([...myClasses, id])} />

            <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-4">Các Lớp Có Sẵn</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((cls) => {
                const joined = myClasses.includes(cls.id)
                return (
                  <Card key={cls.id} className="border-2 border-green-200 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle>{cls.name}</CardTitle>
                      <CardDescription>{cls.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Ngày tạo: {new Date(cls.created_at).toLocaleDateString()}</span>
                      {joined ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">Đã tham gia</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-700">Chưa tham gia</Badge>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
