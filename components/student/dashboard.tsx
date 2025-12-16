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

import { LogOut } from "lucide-react"

/* ===================== SOUND ===================== */
const clickSound = () =>
  new Audio("https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3").play()

const winSound = () =>
  new Audio("https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3").play()

/* ===================== IMAGES ===================== */
const images = {
  flashcards: "https://cdn-icons-png.flaticon.com/512/2991/2991148.png",
  quizzes: "https://cdn-icons-png.flaticon.com/512/4345/4345641.png", // quiz ❓
  notes: "https://cdn-icons-png.flaticon.com/512/942/942748.png",
  progress: "https://cdn-icons-png.flaticon.com/512/3159/3159310.png",
  games: "https://cdn-icons-png.flaticon.com/512/686/686589.png",
  classDefault:
    "https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=600&q=80",
  avatarDefault:
    "https://cdn-icons-png.flaticon.com/512/4140/4140048.png",
}

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

  if (classes.length === 0)
    return <p className="text-xl text-center">📭 Chưa có lớp học nào</p>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {classes.map((c) => (
        <Card
          key={c.id}
          className="rounded-[28px] overflow-hidden hover:scale-105 transition shadow-lg"
        >
          <img
            src={c.image_url || images.classDefault}
            className="h-36 w-full object-cover"
          />

          <CardHeader>
            <CardTitle>🏫 {c.name}</CardTitle>
            <CardDescription>{c.description}</CardDescription>
          </CardHeader>

          <CardContent className="flex justify-between items-center">
            {joined.includes(c.id) ? (
              <Badge className="bg-green-200 text-green-800">
                ✅ Đã tham gia
              </Badge>
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

type View =
  | "flashcards"
  | "quizzes"
  | "notes"
  | "progress"
  | "games"
  | "classes"

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
    confetti({ particleCount: 200, spread: 150 })
    load()
  }

  if (loading) return <p className="p-10">⏳ Đang tải...</p>

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-pink-50 to-sky-50">
      {/* HEADER */}
      <header className="bg-white shadow sticky top-0 z-10">
        <div className="flex justify-between items-center px-6 py-4">
          <h1 className="text-3xl font-extrabold text-pink-500">
            Học tập cùng Flashcard 🎒
          </h1>

          {/* AVATAR */}
          <div className="flex items-center gap-4">
            <Badge className="bg-yellow-200 text-yellow-800 text-lg px-4 py-2">
              ⭐ {points?.total_score || 0}
            </Badge>

            <img
              src={profile?.avatar_url || images.avatarDefault}
              className="w-12 h-12 rounded-full border-4 border-pink-300 shadow-md"
            />

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
        <MenuTile title="Flashcards" img={images.flashcards} onClick={() => setView("flashcards")} />
        <MenuTile title="Quiz" img={images.quizzes} onClick={() => setView("quizzes")} />
        <MenuTile title="Ghi chú" img={images.notes} onClick={() => setView("notes")} />
        <MenuTile title="Tiến độ" img={images.progress} onClick={() => setView("progress")} />
        <MenuTile title="Trò chơi" img={images.games} onClick={() => setView("games")} />
        <MenuTile title="Lớp học" img={images.classDefault} onClick={() => setView("classes")} />
      </div>

      {/* CONTENT */}
      <div className="px-8 pb-20">
        {view === "flashcards" && <StudentFlashcards userId={user.id} />}
        {view === "quizzes" && (
          <StudentQuizzes quizzes={quizzes} onQuizComplete={onQuizDone} />
        )}
        {view === "notes" && <StudentNotes notes={notes} onNotesChange={load} />}
        {view === "progress" && (
          <StudentProgress results={results} quizzes={quizzes} />
        )}
        {view === "games" && <GameHub />}
        {view === "classes" && (
          <JoinClass supabase={supabase} userId={user.id} />
        )}
      </div>
    </div>
  )
}

/* ===================== TILE ===================== */
function MenuTile({ title, img, onClick }: any) {
  return (
    <div
      onClick={() => {
        clickSound()
        onClick()
      }}
      className="cursor-pointer rounded-[28px] bg-white p-6 flex flex-col items-center gap-3
      shadow-lg hover:scale-110 transition"
    >
      <img src={img} className="w-20 h-20" />
      <p className="font-bold text-lg text-pink-600">{title}</p>
    </div>
  )
}
