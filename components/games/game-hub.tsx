"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Gamepad2, Brain, Calculator, Link, Rocket } from "lucide-react"

// Import các trò chơi
import { MemoryMatchGame } from "./memory-match-game"
import { WordMeaningMatchGame } from "./word-meaning-match-game"
import { MathCalculatorGame } from "./math-calculator-game"
import { PlatformerGame } from "./platformer-game"

// Default questions cho Memory Match để tránh crash
const defaultMemoryQuestions = [
  { id: "1", question: "2+2", correct_answer: "4", options: ["2","3","4","5"], points: 10 },
  { id: "2", question: "Capital of France?", correct_answer: "Paris", options: ["Paris","London","Rome","Berlin"], points: 10 },
]

export function GameHub() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null)

  const games = [
    {
      id: "memory",
      name: "Memory Match",
      description: "Lật thẻ tìm cặp giống nhau.",
      icon: Brain,
      component: MemoryMatchGame,
      props: { gameId: "memory-1", questions: defaultMemoryQuestions },
    },
    {
      id: "word-meaning",
      name: "Word Meaning Match",
      description: "Ghép từ với nghĩa đúng.",
      icon: Link,
      component: WordMeaningMatchGame,
      props: {}, // thêm default props nếu cần
    },
    {
      id: "math",
      name: "Math Calculator",
      description: "Tính toán nhanh để ghi điểm.",
      icon: Calculator,
      component: MathCalculatorGame,
      props: {}, // thêm default props nếu cần
    },
    {
      id: "platformer",
      name: "Platformer Game",
      description: "Chạy nhảy và trả lời câu hỏi.",
      icon: Rocket,
      component: PlatformerGame,
      props: {}, // thêm default props nếu cần
    },
  ]

  const selected = games.find((g) => g.id === selectedGame)

  // Nếu đã chọn game
  if (selected && selected.component) {
    const GameComponent = selected.component
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => setSelectedGame(null)}>← Quay lại</Button>
        <GameComponent {...selected.props} />
      </div>
    )
  }

  // Hiển thị list game
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2 text-gray-900">
          <Gamepad2 className="w-8 h-8 text-yellow-600" />
          Game Hub
        </h1>
        <p className="text-gray-600">Chọn một trò chơi để bắt đầu 🎮</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => {
          const Icon = game.icon
          return (
            <Card
              key={game.id}
              onClick={() => setSelectedGame(game.id)}
              className="hover:shadow-lg transition cursor-pointer"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="w-5 h-5 text-yellow-600" /> {game.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{game.description}</p>
                <Button className="w-full bg-yellow-500 hover:bg-yellow-600">Chơi ngay</Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
