"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

import StudentFlashcards from "@/components/student/flashcard-grid"
import { StudentNotes } from "@/components/student/notes"
import { StudentQuizzes } from "@/components/student/quizzes"
import { StudentProgress } from "@/components/student/progress"
import { GameHub } from "@/components/games/game-hub"

import {
  BookOpen,
  Brain,
  FileText,
  TrendingUp,
  LogOut,
  Gamepad2,
  Medal,
  Users,
} from "lucide-react"

import { useRouter } from "next/navigation"

/* ===================== JOIN CLASS ===================== */

interface Class {
  id: string
  name: string
  description?: string
  created_at: string
}

function JoinClass({ supabase, userId }: { supabase: any; userId: string }) {
  const [classes, setClasses] = useState<Class[]>([])
  const [joinedClasses, setJoinedClasses] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadClasses()
  }, [])

  const loadClasses = async () => {
    setLoading(true)

    const { data: classesData } = await supabase
      .from("classes")
      .select("*")
      .order("created_at", { ascending: false })

    const { data: joinedData } = await supabase
      .from("class_members")
      .select("class_id")
      .eq("user_id", userId)

    setClasses(classesData || [])
    setJoinedClasses(joinedData?.map((c) => c.class_id) || [])
    setLoading(false)
  }

  if (loading) return <p>Đang tải lớp học...</p>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {classes.map((cls) => {
        const joined = joinedClasses.includes(cls.id)
        return (
          <Card key={cls.id}>
            <CardHeader>
              <CardTitle>{cls.name}</CardTitle>
              <CardDescription>{cls.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <span className="text-sm">
                {new Date(cls.created_at).toLocaleDateString()}
              </span>
              {joined ? (
                <Badge className="bg-green-200 text-green-800">Đã tham gia</Badge>
              ) : (
                <Button size="sm">Tham gia</Button>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

/* ===================== DASHBOARD ===================== */

interface Profile {
  id: string
  email: string
  full_name: string
}

export function StudentDashboard({ user, profile }: { user: any; profile: Profile }) {
  const supabase = createClient()
  const router = useRouter()

  const [flashcards, setFlashcards] = useState<any[]>([])
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [notes, setNotes] = useState<any[]>([])
  const [results, setResults] = useState<any[]>([])
  const [userPoints, setUserPoints] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)

    const { data: flashcardsData } = await supabase.from("flashcards").select("*")
    const { data: quizzesData } = await supabase.from("quizzes").select("*")
    const { data: notesData } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", user.id)
    const { data: resultsData } = await supabase
      .from("results")
      .select("*")
      .eq("user_id", user.id)
    const { data: pointsData } = await supabase
      .from("user_totals")
      .select("*")
      .eq("user_id", user.id)
      .single()

    setFlashcards(flashcardsData || [])
    setQuizzes(quizzesData || [])
    setNotes(notesData || [])
    setResults(resultsData || [])
    setUserPoints(pointsData)

    setLoading(false)
  }

  if (loading) return <p className="p-10">Đang tải...</p>

  return (
    <div className="min-h-screen bg-[#FFFBEA]">
      {/* HEADER */}
      <header className="bg-white border-b">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">EduCards</h1>

          <div className="flex items-center gap-4">
            <Badge className="bg-yellow-100 text-yellow-800">
              <Medal className="w-4 h-4 mr-1" />
              {userPoints?.total_score || 0}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                await supabase.auth.signOut()
                router.push("/")
              }}
            >
              <LogOut className="w-4 h-4 mr-1" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </header>

      {/* MENU */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="flashcards">
          <TabsList className="bg-transparent p-0 mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

              {/* THẺ HỌC */}
              <TabsTrigger value="flashcards" className="p-0">
                <div className="w-full h-28 bg-yellow-50 border border-yellow-300 rounded-2xl p-5 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-700">Thẻ học có sẵn</p>
                    <p className="text-3xl font-bold">{flashcards.length}</p>
                  </div>
                  <BookOpen className="w-7 h-7 text-yellow-500" />
                </div>
              </TabsTrigger>

              {/* KIỂM TRA */}
              <TabsTrigger value="quizzes" className="p-0">
                <div className="w-full h-28 bg-blue-50 border border-blue-300 rounded-2xl p-5 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-700">Bài kiểm tra</p>
                    <p className="text-3xl font-bold">{quizzes.length}</p>
                  </div>
                  <Brain className="w-7 h-7 text-blue-500" />
                </div>
              </TabsTrigger>

              {/* GHI CHÚ */}
              <TabsTrigger value="notes" className="p-0">
                <div className="w-full h-28 bg-green-50 border border-green-300 rounded-2xl p-5 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-700">Ghi chú của tôi</p>
                    <p className="text-3xl font-bold">{notes.length}</p>
                  </div>
                  <FileText className="w-7 h-7 text-green-500" />
                </div>
              </TabsTrigger>

              {/* ĐIỂM */}
              <TabsTrigger value="progress" className="p-0">
                <div className="w-full h-28 bg-purple-50 border border-purple-300 rounded-2xl p-5 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-700">Tiến độ</p>
                    <p className="text-3xl font-bold">{results.length}</p>
                  </div>
                  <TrendingUp className="w-7 h-7 text-purple-500" />
                </div>
              </TabsTrigger>

            </div>
          </TabsList>

          {/* CONTENT */}
          <TabsContent value="flashcards">
            <StudentFlashcards userId={user.id} />
          </TabsContent>

          <TabsContent value="games">
            <GameHub />
          </TabsContent>

          <TabsContent value="quizzes">
            <StudentQuizzes quizzes={quizzes} onQuizComplete={loadData} />
          </TabsContent>

          <TabsContent value="notes">
            <StudentNotes notes={notes} onNotesChange={loadData} />
          </TabsContent>

          <TabsContent value="progress">
            <StudentProgress results={results} quizzes={quizzes} />
          </TabsContent>

          <TabsContent value="classes">
            <JoinClass supabase={supabase} userId={user.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
