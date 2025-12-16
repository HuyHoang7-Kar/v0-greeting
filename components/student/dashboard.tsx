"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
  Medal,
  Users,
  Gamepad2,
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
                <Badge className="bg-green-100 text-green-700">Đã tham gia</Badge>
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

type View =
  | "flashcards"
  | "quizzes"
  | "notes"
  | "progress"
  | "games"
  | "classes"

export function StudentDashboard({ user, profile }: { user: any; profile: Profile }) {
  const supabase = createClient()
  const router = useRouter()

  const [activeView, setActiveView] = useState<View>("flashcards")
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

      {/* DASHBOARD MENU */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

          <DashboardCard
            title="Thẻ học có sẵn"
            value={flashcards.length}
            icon={BookOpen}
            color="yellow"
            onClick={() => setActiveView("flashcards")}
          />

          <DashboardCard
            title="Bài kiểm tra"
            value={quizzes.length}
            icon={Brain}
            color="blue"
            onClick={() => setActiveView("quizzes")}
          />

          <DashboardCard
            title="Ghi chú của tôi"
            value={notes.length}
            icon={FileText}
            color="green"
            onClick={() => setActiveView("notes")}
          />

          <DashboardCard
            title="Tiến độ"
            value={results.length}
            icon={TrendingUp}
            color="purple"
            onClick={() => setActiveView("progress")}
          />

          <DashboardCard
            title="Trò chơi"
            value="🎮"
            icon={Gamepad2}
            color="pink"
            onClick={() => setActiveView("games")}
          />

          <DashboardCard
            title="Lớp học"
            value="👩‍🏫"
            icon={Users}
            color="cyan"
            onClick={() => setActiveView("classes")}
          />
        </div>

        {/* CONTENT */}
        {activeView === "flashcards" && <StudentFlashcards userId={user.id} />}
        {activeView === "quizzes" && (
          <StudentQuizzes quizzes={quizzes} onQuizComplete={loadData} />
        )}
        {activeView === "notes" && (
          <StudentNotes notes={notes} onNotesChange={loadData} />
        )}
        {activeView === "progress" && (
          <StudentProgress results={results} quizzes={quizzes} />
        )}
        {activeView === "games" && <GameHub />}
        {activeView === "classes" && (
          <JoinClass supabase={supabase} userId={user.id} />
        )}
      </div>
    </div>
  )
}

/* ===================== DASHBOARD CARD ===================== */

function DashboardCard({
  title,
  value,
  icon: Icon,
  color,
  onClick,
}: {
  title: string
  value: any
  icon: any
  color: "yellow" | "blue" | "green" | "purple" | "pink" | "cyan"
  onClick: () => void
}) {
  const colors: any = {
    yellow: "bg-yellow-50 border-yellow-300 text-yellow-500",
    blue: "bg-blue-50 border-blue-300 text-blue-500",
    green: "bg-green-50 border-green-300 text-green-500",
    purple: "bg-purple-50 border-purple-300 text-purple-500",
    pink: "bg-pink-50 border-pink-300 text-pink-500",
    cyan: "bg-cyan-50 border-cyan-300 text-cyan-500",
  }

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer border rounded-2xl p-5 flex justify-between items-center hover:shadow-md transition ${colors[color]}`}
    >
      <div>
        <p className="text-sm text-gray-700">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <Icon className="w-8 h-8" />
    </div>
  )
}
