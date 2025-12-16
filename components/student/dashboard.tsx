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

/* ===================== ANIMAL IMAGES (NEW – TIỂU HỌC) ===================== */
const animals = {
  flashcards: "https://cdn-icons-png.flaticon.com/512/4193/4193265.png", // mèo học bài
  quizzes: "https://cdn-icons-png.flaticon.com/512/1998/1998610.png", // gấu thông minh
  notes: "https://cdn-icons-png.flaticon.com/512/2942/2942860.png", // thỏ ghi chép
  progress: "https://cdn-icons-png.flaticon.com/512/3159/3159310.png", // sư tử huy hiệu
  games: "https://cdn-icons-png.flaticon.com/512/686/686589.png", // tay cầm game
  classes: "https://cdn-icons-png.flaticon.com/512/2942/2942065.png", // lớp học
  mascot: "https://cdn-icons-png.flaticon.com/512/4140/4140048.png", // bé học sinh
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
    return (
      <div className="text-center text-xl text-gray-500">
        📭 Chưa có lớp học nào<br />
        <span className="text-sm">Hỏi thầy cô để được thêm lớp nhé!</span>
      </div>
    )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {classes.map((c) => (
        <Card
          key={c.id}
          className="rounded-[32px] bg-gradient-to-br from-yellow-100 to-pink-100
          hover:scale-105 transition shadow-lg"
        >
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              🏫 {c.name}
            </CardTitle>
            <CardDescription>{c.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            {joined.includes(c.id) ? (
              <Badge className="bg-green-200 text-green-800 text-sm">
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

type View = "flashcards" | "quizzes" | "notes" | "progress" | "games" | "classes"

export function StudentDashboard({ user }: any) {
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
    confetti({ particleCount: 200, spread: 140 })
    load()
  }

  if (loading) return <p className="p-10">⏳ Đang tải...</p>

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-pink-50 to-sky-50">
      {/* HEADER */}
      <header className="bg-white shadow sticky top-0 z-10">
        <div className="flex justify-between items-center px-6 py-4">
          <div className="flex items-center gap-3">
            <img src={animals.mascot} className="w-14 h-14 animate-bounce" />
            <h1 className="text-3xl font-extrabold text-pink-500">
              Học tập cùng Flashcard 🎒
            </h1>
          </div>

          <div className="flex gap-4 items-center">
            <Badge className="bg-yellow-200 text-yellow-800 px-4 py-2 text-lg rounded-full">
              ⭐ {points?.total_score || 0}
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
        <AnimalTile title="Flashcards" img={animals.flashcards} onClick={() => setView("flashcards")} />
        <AnimalTile title="Quiz" img={animals.quizzes} onClick={() => setView("quizzes")} />
        <AnimalTile title="Ghi chú" img={animals.notes} onClick={() => setView("notes")} />
        <AnimalTile title="Tiến độ" img={animals.progress} onClick={() => setView("progress")} />
        <AnimalTile title="Trò chơi" img={animals.games} onClick={() => setView("games")} />
        <AnimalTile title="Lớp học" img={animals.classes} onClick={() => setView("classes")} />
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

function AnimalTile({ title, img, onClick }: any) {
  return (
    <div
      onClick={() => {
        clickSound()
        onClick()
      }}
      className="cursor-pointer rounded-[32px] bg-gradient-to-br from-white to-yellow-50
      p-6 flex flex-col items-center gap-3
      shadow-lg hover:scale-110 hover:rotate-1 transition-all duration-300"
    >
      <img src={img} className="w-20 h-20 drop-shadow-md" />
      <p className="font-extrabold text-lg text-orange-500 text-center">
        {title}
      </p>
    </div>
  )
}
