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
          <Card key={cls.id} className="hover:shadow-lg transition">
            <CardHeader>
              <CardTitle>{cls.name}</CardTitle>
              <CardDescription>{cls.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
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
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
      {/* HEADER */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-yellow-600">EduCards</h1>

          <div className="flex items-center gap-4">
            <Badge className="bg-yellow-100 text-yellow-800 px-3 py-1">
              <Medal className="w-4 h-4 mr-1 inline" />
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
      <div className="container mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
          <DashboardTile
            title="Flashcards"
            value={flashcards.length}
            icon={BookOpen}
            color="yellow"
            active={activeView === "flashcards"}
            onClick={() => setActiveView("flashcards")}
          />
          <DashboardTile
            title="Quizzes"
            value={quizzes.length}
            icon={Brain}
            color="blue"
            active={activeView === "quizzes"}
            onClick={() => setActiveView("quizzes")}
          />
          <DashboardTile
            title="Notes"
            value={notes.length}
            icon={FileText}
            color="green"
            active={activeView === "notes"}
            onClick={() => setActiveView("notes")}
          />
          <DashboardTile
            title="Progress"
            value={results.length}
            icon={TrendingUp}
            color="purple"
            active={activeView === "progress"}
            onClick={() => setActiveView("progress")}
          />
          <DashboardTile
            title="Games"
            value="🎮"
            icon={Gamepad2}
            color="pink"
            active={activeView === "games"}
            onClick={() => setActiveView("games")}
          />
          <DashboardTile
            title="Classes"
            value="👩‍🏫"
            icon={Users}
            color="cyan"
            active={activeView === "classes"}
            onClick={() => setActiveView("classes")}
          />
        </div>

        {/* CONTENT */}
        {activeView === "flashcards" && <StudentFlashcards userId={user.id} />}
        {activeView === "quizzes" && <StudentQuizzes quizzes={quizzes} onQuizComplete={loadData} />}
        {activeView === "notes" && <StudentNotes notes={notes} onNotesChange={loadData} />}
        {activeView === "progress" && <StudentProgress results={results} quizzes={quizzes} />}
        {activeView === "games" && <GameHub />}
        {activeView === "classes" && <JoinClass supabase={supabase} userId={user.id} />}
      </div>
    </div>
  )
}

/* ===================== TILE ===================== */

function DashboardTile({
  title,
  value,
  icon: Icon,
  color,
  active,
  onClick,
}: {
  title: string
  value: any
  icon: any
  color: "yellow" | "blue" | "green" | "purple" | "pink" | "cyan"
  active: boolean
  onClick: () => void
}) {
  const colors: any = {
    yellow: "bg-yellow-100 text-yellow-600",
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    pink: "bg-pink-100 text-pink-600",
    cyan: "bg-cyan-100 text-cyan-600",
  }

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-2xl bg-white p-5 flex flex-col items-center gap-3
        transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
        ${active ? "ring-2 ring-yellow-400" : ""}`}
    >
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${colors[color]}`}>
        <Icon className="w-7 h-7" />
      </div>
      <p className="font-semibold text-gray-800">{title}</p>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  )
}
