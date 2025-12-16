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

/* ===================== VIEW ===================== */

type View =
  | "flashcards"
  | "quizzes"
  | "notes"
  | "progress"
  | "games"
  | "classes"

/* ===================== MASCOT TEXT ===================== */

const mascotText: Record<View, string> = {
  flashcards: "📚 Học bằng thẻ vui lắm đó!",
  quizzes: "🧠 Sẵn sàng thử thách trí não chưa?",
  notes: "✏️ Ghi chú lại cho nhớ nha!",
  progress: "🚀 Cùng xem con đã tiến bộ thế nào!",
  games: "🎮 Học mà chơi – chơi mà học!",
  classes: "👩‍🏫 Tham gia lớp học cùng bạn bè nào!",
}

/* ===================== DASHBOARD ===================== */

export function StudentDashboard({ user }: { user: any }) {
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
    const { data: notesData } = await supabase.from("notes").select("*").eq("user_id", user.id)
    const { data: resultsData } = await supabase.from("results").select("*").eq("user_id", user.id)
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

  if (loading) {
    return <p className="p-10 text-2xl">🎨 Đang chuẩn bị bài học cho con...</p>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-yellow-50 to-blue-50">
      {/* HEADER */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-pink-500">🎒 EduCards</h1>

          <div className="flex items-center gap-4">
            <Badge className="bg-yellow-200 text-yellow-900 px-4 py-2 rounded-full text-lg">
              🏅 {userPoints?.total_score || 0}
            </Badge>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={async () => {
                await supabase.auth.signOut()
                router.push("/")
              }}
            >
              <LogOut className="w-4 h-4 mr-1" />
              Thoát
            </Button>
          </div>
        </div>
      </header>

      {/* MASCOT */}
      <div className="container mx-auto px-6 pt-10">
        <div className="flex items-center gap-6 bg-white rounded-3xl p-6 shadow-md animate-bounce-slow">
          <div className="text-6xl">🦉</div>
          <div>
            <p className="text-xl font-bold text-pink-600">Chào con!</p>
            <p className="text-lg">{mascotText[activeView]}</p>
          </div>
        </div>
      </div>

      {/* MENU */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-14">
          <KidTile title="Flashcards" icon={BookOpen} color="yellow" value={flashcards.length} active={activeView==="flashcards"} onClick={()=>setActiveView("flashcards")} />
          <KidTile title="Quiz" icon={Brain} color="blue" value={quizzes.length} active={activeView==="quizzes"} onClick={()=>setActiveView("quizzes")} />
          <KidTile title="Notes" icon={FileText} color="green" value={notes.length} active={activeView==="notes"} onClick={()=>setActiveView("notes")} />
          <KidTile title="Progress" icon={TrendingUp} color="purple" value={results.length} active={activeView==="progress"} onClick={()=>setActiveView("progress")} />
          <KidTile title="Games" icon={Gamepad2} color="pink" value="🎮" active={activeView==="games"} onClick={()=>setActiveView("games")} />
          <KidTile title="Classes" icon={Users} color="cyan" value="👩‍🏫" active={activeView==="classes"} onClick={()=>setActiveView("classes")} />
        </div>

        {/* CONTENT */}
        {activeView === "flashcards" && <StudentFlashcards userId={user.id} />}
        {activeView === "quizzes" && <StudentQuizzes quizzes={quizzes} onQuizComplete={loadData} />}
        {activeView === "notes" && <StudentNotes notes={notes} onNotesChange={loadData} />}
        {activeView === "progress" && <StudentProgress results={results} quizzes={quizzes} />}
        {activeView === "games" && <GameHub />}
        {activeView === "classes" && <p className="text-xl">📚 Danh sách lớp học ở đây</p>}
      </div>
    </div>
  )
}

/* ===================== TILE ===================== */

function KidTile({
  title,
  value,
  icon: Icon,
  color,
  active,
  onClick,
}: any) {
  const colors: any = {
    yellow: "bg-yellow-200",
    blue: "bg-blue-200",
    green: "bg-green-200",
    purple: "bg-purple-200",
    pink: "bg-pink-200",
    cyan: "bg-cyan-200",
  }

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-[2rem] p-6 text-center bg-white
        transition-all duration-300
        hover:scale-110 hover:-rotate-1 hover:shadow-2xl
        ${active ? "ring-4 ring-pink-400 scale-105" : ""}`}
    >
      <div className={`mx-auto mb-4 w-16 h-16 rounded-2xl flex items-center justify-center ${colors[color]}`}>
        <Icon className="w-8 h-8" />
      </div>
      <p className="font-bold text-lg">{title}</p>
      <p className="text-2xl mt-1">{value}</p>
    </div>
  )
}
