"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

import { CreateFlashcardForm } from "@/components/teacher/create-flashcard-form"
import { TeacherFlashcards } from "@/components/teacher/flashcards"
import { TeacherQuizzes } from "@/components/teacher/quizzes"
import { TeacherAnalytics } from "@/components/teacher/analytics"

import { BookOpen, Brain, Users, BarChart3, LogOut, User, Plus } from "lucide-react"


interface Profile {
  id: string
  email: string
  full_name: string
  role: string
}

interface TeacherDashboardProps {
  user: any
  profile: Profile
}

export function TeacherDashboard({ user, profile }: TeacherDashboardProps) {
  const [flashcards, setFlashcards] = useState<any[]>([])
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const supabase = createClient()

      // Load teacher's flashcards
      const { data: flashcardsData } = await supabase
        .from("flashcards")
        .select("*")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false })

      // Load teacher's quizzes
      const { data: quizzesData } = await supabase
        .from("quizzes")
        .select("*")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false })

      // Load all students
      const { data: studentsData } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "student")
        .order("created_at", { ascending: false })

      // Load all quiz results for analytics
      const { data: resultsData } = await supabase
        .from("results")
        .select(`
          *,
          profiles (
            full_name,
            email
          ),
          quizzes (
            title
          )
        `)
        .order("completed_at", { ascending: false })

      setFlashcards(flashcardsData || [])
      setQuizzes(quizzesData || [])
      setStudents(studentsData || [])
      setResults(resultsData || [])
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

  const handleFlashcardCreated = () => {
    setShowCreateForm(false)
    loadDashboardData()
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <BookOpen className="w-8 h-8 text-yellow-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">EduCards</h1>
              <p className="text-sm text-gray-600">Bảng Điều Khiển Giáo Viên</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">{profile.full_name || profile.email}</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Giáo Viên
              </Badge>
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
                  <p className="text-sm font-medium text-gray-600">Thẻ Học Của Tôi</p>
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
                  <p className="text-sm font-medium text-gray-600">Bài Kiểm Tra Của Tôi</p>
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
                  <p className="text-sm font-medium text-gray-600">Tổng Học Sinh</p>
                  <p className="text-3xl font-bold text-gray-900">{students.length}</p>
                </div>
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Lượt Làm Bài</p>
                  <p className="text-3xl font-bold text-gray-900">{results.length}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-600" />
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
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Tạo Nội Dung Mới</h3>
                  <p className="text-gray-600">Thêm thẻ học và bài kiểm tra để giúp học sinh học tập hiệu quả hơn.</p>
                </div>
                <Button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {showCreateForm ? "Ẩn Form" : "Tạo Thẻ Học"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create Flashcard Form */}
        {showCreateForm && (
          <div className="mb-8">
            <CreateFlashcardForm onSuccess={handleFlashcardCreated} />
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="flashcards" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white border-2 border-gray-200">
            <TabsTrigger value="flashcards" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Thẻ Học
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Kiểm Tra
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Học Sinh
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Phân Tích
            </TabsTrigger>
          </TabsList>

          <TabsContent value="flashcards" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Thẻ Học Của Tôi</h2>
              <Button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Tạo Mới
              </Button>
            </div>
            <TeacherFlashcards flashcards={flashcards} onFlashcardsChange={loadDashboardData} />
          </TabsContent>

          <TabsContent value="quizzes" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Bài Kiểm Tra Của Tôi</h2>
            <TeacherQuizzes quizzes={quizzes} onQuizzesChange={loadDashboardData} />
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Tổng Quan Học Sinh</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {students.map((student) => (
                <Card key={student.id} className="border-2 border-green-200 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg text-gray-900">{student.full_name || student.email}</CardTitle>
                    <CardDescription>{student.email}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tham gia:</span>
                        <span className="text-gray-900">{new Date(student.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Lượt làm bài:</span>
                        <span className="text-gray-900">
                          {results.filter((r) => r.profiles?.email === student.email).length}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {students.length === 0 && (
              <Card className="border-2 border-gray-200">
                <CardContent className="p-12 text-center">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Chưa có học sinh nào đăng ký</p>
                  <p className="text-gray-400 text-sm mt-2">Học sinh sẽ xuất hiện ở đây khi họ đăng ký!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Phân Tích Học Tập</h2>
            <TeacherAnalytics results={results} quizzes={quizzes} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
