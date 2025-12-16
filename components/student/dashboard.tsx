"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

import {
  BookOpen,
  Brain,
  FileText,
  TrendingUp,
  Gamepad2,
  Users,
  LogOut,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

/* ================= TYPES ================= */

type View =
  | "flashcards"
  | "quizzes"
  | "notes"
  | "progress"
  | "games"
  | "classes"

interface Props {
  user: any
  profile: any
}

/* ================= COMPONENT ================= */

export function StudentDashboard({ user, profile }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [view, setView] = useState<View>("flashcards")

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">🎓 Student Dashboard</h1>

          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await supabase.auth.signOut()
              router.push("/auth/login")
            }}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Đăng xuất
          </Button>
        </div>
      </header>

      {/* MENU GRID */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
          <MenuCard
            icon={BookOpen}
            title="Flashcards"
            onClick={() => setView("flashcards")}
          />
          <MenuCard
            icon={Brain}
            title="Quizzes"
            onClick={() => setView("quizzes")}
          />
          <MenuCard
            icon={FileText}
            title="Notes"
            onClick={() => setView("notes")}
          />
          <MenuCard
            icon={TrendingUp}
            title="Progress"
            onClick={() => setView("progress")}
          />
          <MenuCard
            icon={Gamepad2}
            title="Games"
            onClick={() => setView("games")}
          />
          <MenuCard
            icon={Users}
            title="Classes"
            onClick={() => setView("classes")}
          />
        </div>

        {/* CONTENT */}
        <Card className="p-8 rounded-2xl shadow-sm">
          {view === "flashcards" && <div>📘 Flashcards content</div>}
          {view === "quizzes" && <div>🧠 Quizzes content</div>}
          {view === "notes" && <div>📝 Notes content</div>}
          {view === "progress" && <div>📈 Progress content</div>}
          {view === "games" && <div>🎮 Games content</div>}
          {view === "classes" && <div>👩‍🏫 Classes content</div>}
        </Card>
      </main>
    </div>
  )
}

/* ================= MENU CARD ================= */

function MenuCard({
  icon: Icon,
  title,
  onClick,
}: {
  icon: any
  title: string
  onClick: () => void
}) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer bg-white rounded-2xl p-6 flex flex-col items-center gap-4
                 shadow-sm hover:shadow-lg hover:-translate-y-1 transition"
    >
      <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
        <Icon className="w-8 h-8 text-blue-600" />
      </div>

      <p className="font-semibold text-gray-800">{title}</p>
    </div>
  )
}
