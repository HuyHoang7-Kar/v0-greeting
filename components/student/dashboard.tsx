"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import confetti from "canvas-confetti"

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

/* ===================== SOUND ===================== */
const clickSound = () =>
  new Audio("https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3").play()

const winSound = () =>
  new Audio("https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3").play()

/* ===================== JOIN CLASS ===================== */

function JoinClass({ supabase, userId }: any) {
  const [classes, setClasses] = useState<any[]>([])
  const [joined, setJoined] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const { data: cls } = await supabase.from("classes").select("*")
    const { data: mem } = await supabase
      .from("class_members")
      .select("class_id")
      .eq("user_id", userId)

    setClasses(cls || [])
    setJoined(mem?.map((m) => m.class_id) || [])
    setLoading(false)
  }

  if (loading) return <p className="text-xl">⏳ Đang tải lớp học...</p>
  if (classes.length === 0) return <p className="text-xl">📭 Chưa có lớp học</p>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {classes.map((c) => (
        <Card
          key={c.id}
          className="rounded-3xl bg-gradient-to-br from-pink-100 to-yellow-100 hover:scale-105 transition"
        >
          <CardHeader>
            <CardTitle className="text-lg">🏫 {c.name}</CardTitle>
            <CardDescription>{c.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            {joined.includes(c.id) ? (
              <Badge className="bg-green-200 text-green-800">✅ Đã tham gia</Badge>
            ) : (
              <Button size="sm">➕ Tham gia</Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/* ===================== DASHBOARD ===================== */

type View = "flashcards" | "quizzes" | "notes" | "progress" | "games" | "classes"

export function StudentDashboard({ user }: any) {
  const supabase = createClient()
  const router = useRouter()

  const [view, setView] = useState<View>("flashcards")
  const [flashcards, setFlashcards] = useState<any[]>([])
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [notes, setNotes] = useState<any[]>([])
  const [results, setResults] = useState<any[]>([])
  const [points, setPoints] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setFlashcards((await supabase.from("flashcards").select("*")).data || [])
    setQuizzes((await supabase.from("quizzes").select("*")).data || [])
    setNotes(
      (await supabase.from("notes").select("*").eq("user_id", user.id)).data || []
    )
    setResults(
      (await supabase.from("results").select("*").eq("user_id", user.id)).data || []
    )
    setPoints(
      (await supabase.from("user_totals").select("*").eq("user_id", user.id).single())
        .data
    )
    setLoading(false)
  }

  const onQuizDone = () => {
    winSound()
    confetti({ particleCount: 150, spread: 120 })
    load()
  }

  if (loading) return <p className="p-10">⏳ Đang tải...</p>

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-pink-50 to-sky-50">
      {/* HEADER */}
      <header className="bg-white shadow sticky top-0 z-10">
        <div className="flex justify-between items-center px-6 py-4">
          <h1 className="text-3xl font-extrabold text-pink-500">🎈 EduKids</h1>

          <div className="flex gap-4 items-center">
            <Badge className="bg-yellow-200 text-yellow-800 px-4 py-1 text-lg">
              🏆 {points?.total_score || 0}
            </Badge>
            <Button
              variant="outline"
              onClick={async () => {
                await supabase.auth.signOut()
                router.push("/")
              }}
            >
              <LogOut className="w-4 h-4 mr-1" /> Đăng xuất
            </Button>
          </div>
        </div>
      </header>

      {/* MENU */}
      <div className="px-8 py-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <Tile title="Flashcard" icon={BookOpen} color="yellow" onClick={() => setView("flashcards")} />
        <Tile title="Quiz" icon={Brain} color="pink" onClick={() => setView("quizzes")} />
        <Tile title="Ghi chú" icon={FileText} color="green" onClick={() => setView("notes")} />
        <Tile title="Tiến độ" icon={TrendingUp} color="purple" onClick={() => setView("progress")} />
        <Tile title="Game" icon={Gamepad2} color="blue" onClick={() => setView("games")} />
        <Tile title="Lớp học" icon={Users} color="cyan" onClick={() => setView("classes")} />
      </div>

      {/* CONTENT */}
      <div className="px-8 pb-20">
        {view === "flashcards" && <StudentFlashcards userId={user.id} />}
        {view === "quizzes" && (
          <StudentQuizzes quizzes={quizzes} onQuizComplete={onQuizDone} />
        )}
        {view === "notes" && <StudentNotes notes={notes} onNotesChange={load} />}
        {view === "progress" && <StudentProgress results={results} quizzes={quizzes} />}
        {view === "games" && <GameHub />}
        {view === "classes" && <JoinClass supabase={supabase} userId={user.id} />}
      </div>
    </div>
  )
}

/* ===================== TILE ===================== */

function Tile({ title, icon: Icon, color, onClick }: any) {
  const colors: any = {
    yellow: "from-yellow-200 to-yellow-400",
    pink: "from-pink-200 to-pink-400",
    green: "from-green-200 to-green-400",
    purple: "from-purple-200 to-purple-400",
    blue: "from-sky-200 to-sky-400",
    cyan: "from-cyan-200 to-cyan-400",
  }

  return (
    <div
      onClick={() => {
        clickSound()
        onClick()
      }}
      className={`cursor-pointer rounded-3xl bg-gradient-to-br ${colors[color]}
      p-6 flex flex-col items-center gap-3 text-white
      shadow-lg hover:scale-110 transition`}
    >
      <Icon className="w-10 h-10" />
      <p className="font-bold text-lg">{title}</p>
    </div>
  )
}
