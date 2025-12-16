"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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

import { useRouter } from "next/navigation"

/* ===================== JOIN CLASS ===================== */

function JoinClass({ supabase, userId }: { supabase: any; userId: string }) {
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
    setJoined(mem?.map((m: any) => m.class_id) || [])
    setLoading(false)
  }

  if (loading) return <p className="text-xl">⏳ Đang tải lớp học...</p>
  if (classes.length === 0) return <p className="text-xl">📭 Chưa có lớp học nào</p>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {classes.map((c) => (
        <Card
          key={c.id}
          className="rounded-3xl bg-gradient-to-br from-pink-100 to-yellow-100 hover:shadow-2xl transition"
        >
          <CardHeader>
            <CardTitle className="text-lg">{c.name}</CardTitle>
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

export function StudentDashboard({ user }: any) {
  const supabase = createClient()
  const router = useRouter()

  const [view, setView] = useState("flashcards")
  const [flashcards, setFlashcards] = useState<any[]>([])
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [notes, setNotes] = useState<any[]>([])
  const [results, setResults] = useState<any[]>([])
  const [points, setPoints] = useState<any>(null)

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
  }

  const onQuizDone = () => {
    confetti({
      particleCount: 200,
      spread: 120,
      origin: { y: 0.6 },
    })
    alert("🎉 Giỏi lắm! Con đã hoàn thành bài quiz!")
    load()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-pink-50 to-blue-50">
      {/* HEADER */}
      <header className="bg-white shadow sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-extrabold text-pink-600">🎒 EduCards</h1>
          <div className="flex gap-4">
            <Badge className="bg-yellow-200 text-yellow-800">
              <Medal className="w-4 h-4 inline mr-1" />
              {points?.total_score || 0}
            </Badge>
            <Button
              variant="outline"
              onClick={async () => {
                await supabase.auth.signOut()
                router.push("/")
              }}
            >
              <LogOut className="w-4 h-4 mr-1" /> Thoát
            </Button>
          </div>
        </div>
      </header>

      {/* MENU */}
      <div className="container mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
          <Tile icon={BookOpen} label="Flashcards" onClick={() => setView("flashcards")} />
          <Tile icon={Brain} label="Quizzes" onClick={() => setView("quizzes")} />
          <Tile icon={FileText} label="Notes" onClick={() => setView("notes")} />
          <Tile icon={TrendingUp} label="Progress" onClick={() => setView("progress")} />
          <Tile icon={Gamepad2} label="Games" onClick={() => setView("games")} />
          <Tile icon={Users} label="Classes" onClick={() => setView("classes")} />
        </div>

        {/* CONTENT */}
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

function Tile({ icon: Icon, label, onClick }: any) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer bg-white rounded-3xl p-5 flex flex-col items-center gap-3
                 hover:scale-110 transition shadow-lg"
    >
      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-400 to-yellow-400
                      flex items-center justify-center text-white">
        <Icon className="w-7 h-7" />
      </div>
      <p className="font-bold text-gray-700">{label}</p>
    </div>
  )
}
