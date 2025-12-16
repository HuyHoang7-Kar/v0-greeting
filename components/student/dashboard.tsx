"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

import StudentFlashcards from "@/components/student/flashcard-grid"
import { FlashcardStudyMode } from "@/components/student/flashcard-study-mode"
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
  User,
  Gamepad2,
  Trophy,
  Medal,
  Users,
} from "lucide-react"

import { useRouter } from "next/navigation"

/* ===================== JOIN CLASS ===================== */

interface Class {
  id: string
  name: string
  description?: string
  teacher_id: string
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

  const handleJoin = async (classId: string) => {
    await supabase.from("class_members").insert({
      class_id: classId,
      user_id: userId,
      role: "student",
    })
    setJoinedClasses([...joinedClasses, classId])
  }

  if (loading) return <p>Đang tải lớp học...</p>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {classes.map((cls) => {
        const joined = joinedClasses.includes(cls.id)
        return (
          <Card key={cls.id} className="border-2 border-green-200">
            <CardHeader>
              <CardTitle>{cls.name}</CardTitle>
              <CardDescription>{cls.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-between">
              <span className="text-sm">
                {new Date(cls.created_at).toLocaleDateString()}
              </span>
              {joined ? (
                <Badge className="bg-green-200 text-green-800">Đã tham gia</Badge>
              ) : (
                <Button size="sm" onClick={() => handleJoin(cls.id)}>
                  Tham gia
                </Button>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

/* ===================== STUDENT DASHBOARD ===================== */

interface Profile {
  id: string
  email: string
  full_name: string
  role: string
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
      .select("*, quizzes(title)")
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
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
      {/* HEADER */}
      <header className="bg-white border-b">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-yellow-600" />
            <h1 className="text-2xl font-bold">EduCards</h1>
          </div>

          <div className="flex items-center gap-3">
            <Badge className="bg-yellow-200 text-yellow-800">
              <Medal className="w-4 h-4 mr-1" /> {userPoints?.total_score || 0}
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

      {/* MENU + CONTENT */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="flashcards">
          {/* ===== MENU CARD LỚN ===== */}
          <TabsList className="bg-transparent p-0">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10">
              {[
                { v: "flashcards", t: "Thẻ Học", i: BookOpen, c: "from-yellow-400 to-orange-400" },
                { v: "games", t: "Trò Chơi", i: Gamepad2, c: "from-pink-400 to-red-400" },
                { v: "quizzes", t: "Kiểm Tra", i: Brain, c: "from-blue-400 to-indigo-400" },
                { v: "notes", t: "Ghi Chú", i: FileText, c: "from-green-400 to-emerald-400" },
                { v: "progress", t: "Tiến Độ", i: TrendingUp, c: "from-purple-400 to-violet-400" },
                { v: "classes", t: "Lớp Học", i: Users, c: "from-cyan-400 to-sky-400" },
              ].map(({ v, t, i: Icon, c }) => (
                <TabsTrigger key={v} value={v} className="p-0">
                  <Card
                    className={`h-40 w-full flex flex-col items-center justify-center text-white rounded-3xl shadow-lg bg-gradient-to-br ${c} hover:scale-105 transition`}
                  >
                    <Icon className="w-12 h-12 mb-2" />
                    <span className="text-xl font-bold">{t}</span>
                  </Card>
                </TabsTrigger>
              ))}
            </div>
          </TabsList>

          {/* ===== CONTENT ===== */}
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
