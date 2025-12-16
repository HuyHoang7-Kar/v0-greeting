"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import confetti from "canvas-confetti"
import { LogOut } from "lucide-react"

import StudentFlashcards from "@/components/student/flashcard-grid"
import { StudentNotes } from "@/components/student/notes"
import { StudentQuizzes } from "@/components/student/quizzes"
import { StudentProgress } from "@/components/student/progress"
import { GameHub } from "@/components/games/game-hub"

/* ===================== IMAGES ===================== */
const images = {
  flashcards: "https://cdn-icons-png.flaticon.com/512/4696/4696755.png",
  quizzes: "https://cdn-icons-png.flaticon.com/512/4196/4196463.png",
  notes: "https://cdn-icons-png.flaticon.com/512/3468/3468377.png",
  progress: "https://cdn-icons-png.flaticon.com/512/3159/3159310.png",
  games: "https://cdn-icons-png.flaticon.com/512/686/686589.png",
  classes: "https://cdn-icons-png.flaticon.com/512/1670/1670043.png",
  avatarDefault: "https://cdn-icons-png.flaticon.com/512/4140/4140048.png",
}

/* ===================== SOUND ===================== */
const clickSound = () =>
  new Audio("https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3").play()

const winSound = () =>
  new Audio("https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3").play()

/* ===================== TYPES ===================== */
type View = "flashcards" | "quizzes" | "notes" | "progress" | "games" | "classes"

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
  if (classes.length === 0) return <p className="text-xl">📭 Chưa có lớp học nào</p>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {classes.map((c) => (
        <Card
          key={c.id}
          className="rounded-3xl bg-gradient-to-br from-sky-100 to-pink-100 hover:scale-105 transition"
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <img src={images.classes} className="w-10 h-10" />
              <CardTitle>{c.name}</CardTitle>
            </div>
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
export function StudentDashboard({ user, profile }: any) {
  const supabase = createClient()
  const router = useRouter()

  const [view, setView] = useState<View>("flashcards")
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [notes, setNotes] = useState<any[]>([])
  const [results, setResults] = useState<any[]>([])
  const [points, setPoints] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
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
    confetti({ particleCount: 200, spread: 160 })
    load()
  }

  if (loading) return <p className="p-10">⏳ Đang tải...</p>

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-pink-50 to-sky-50">
      {/* HEADER */}
      <header className="bg-white shadow sticky top-0 z-10">
        <div className="flex justify-between items-center px-6 py-4">
          <div className="flex items-center gap-3">
            <img
              src={profile?.avatar_url || images.avatarDefault}
              className="w-12 h-12 rounded-full border-2 border-pink-400"
            />
            <h1 className="text-3xl font-extrabold text-pink-500">
              Học tập cùng Flashcard 🎒
            </h1>
          </div>

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
        <Tile title="Flashcards" img={images.flashcards} onClick={() => setView("flashcards")} />
        <Tile title="Quiz" img={images.quizzes} onClick={() => setView("quizzes")} />
        <Tile title="Notes" img={images.notes} onClick={() => setView("notes")} />
        <Tile title="Progress" img={images.progress} onClick={() => setView("progress")} />
        <Tile title="Games" img={images.games} onClick={() => setView("games")} />
        <Tile title="Classes" img={images.classes} onClick={() => setView("classes")} />
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
function Tile({ title, img, onClick }: any) {
  return (
    <div
      onClick={() => {
        clickSound()
        onClick()
      }}
      className="cursor-pointer rounded-3xl bg-white p-6 flex flex-col items-center gap-3
      shadow-xl hover:scale-110 transition"
    >
      <img src={img} className="w-16 h-16 animate-bounce" />
      <p className="font-bold text-lg text-pink-600">{title}</p>
    </div>
  )
}
