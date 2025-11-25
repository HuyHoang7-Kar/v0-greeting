"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Gamepad2, Brain, Calculator, Link, Rocket } from "lucide-react"

// Trò chơi
import { MemoryMatchGame } from "./memory-match-game"
import { WordMeaningMatchGame } from "./word-meaning-match-game"
import { MathCalculatorGame } from "./math-calculator-game"
import { PlatformerGame } from "./platformer-game"
import { FlappyBirdGame } from "./FlappyGameAutoSave" 
import { CarDodgeGameAutoSave } from "./CarDodgeGameAutoSave"

// ⬇️ THÊM GAME MỚI
import { PhysicsPuzzleGame } from "./RunnerGame"

export function GameHub() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null)

  const defaultMemoryQuestions = [
    { id: "1", question: "2+2", correct_answer: "4", options: ["2","3","4","5"], points: 10 },
    { id: "2", question: "Capital of France?", correct_answer: "Paris", options: ["Paris","London","Rome","Berlin"], points: 10 },
  ]

  const defaultWordPairs = [
    { id: "1", word: "Cat", meaning: "Con mèo" },
    { id: "2", word: "Dog", meaning: "Con chó" },
  ]

  const defaultMathOperations = [
    { id: "1", expression: "5+7", answer: 12 },
    { id: "2", expression: "9-3", answer: 6 },
  ]

  const games = [
    {
      id: "memory",
      name: "Memory Match",
      description: "Lật thẻ tìm cặp giống nhau.",
      icon: Brain,
      component: MemoryMatchGame,
      props: {
        gameId: "memory-1",
        questions: defaultMemoryQuestions,
        onGameComplete: (score: number) => console.log("Memory Match score:", score)
      },
    },
    {
      id: "word-meaning",
      name: "Word Meaning Match",
      description: "Ghép từ với nghĩa đúng.",
      icon: Link,
      component: WordMeaningMatchGame,
      props: {
        gameId: "word-meaning-1",
        wordPairs: defaultWordPairs,
        onGameComplete: (score: number) => console.log("Word Meaning score:", score)
      },
    },
    {
      id: "math",
      name: "Math Calculator",
      description: "Tính toán nhanh để ghi điểm.",
      icon: Calculator,
      component: MathCalculatorGame,
      props: {
        gameId: "math-1",
        operations: defaultMathOperations,
        onGameComplete: (score: number) => console.log("Math Calculator score:", score)
      },
    },
    {
      id: "platformer",
      name: "Platformer Game",
      description: "Chạy nhảy và trả lời câu hỏi.",
      icon: Rocket,
      component: PlatformerGame,
    },
    {
      id: "flappy",
      name: "Flappy Game AutoSave",
      description: "Flappy Bird tự động lưu điểm khi chết.",
      icon: Rocket,
      component: FlappyBirdGame,
    },
    {
      id: "car-dodge",
      name: "Car Dodge AutoSave",
      description: "Xe né chướng ngại vật, tự động lưu điểm.",
      icon: Rocket,
      component: CarDodgeGameAutoSave,
    },

    // ⬇️ GAME RUNNER — ĐÃ THÊM VÀO ĐÂY
    {
      id: "runner",
      name: "Runner Game",
      description: "Game chạy né vật cản + vật lý.",
      icon: Rocket,
      component: PhysicsPuzzleGame,
      props: {
        onBack: () => setSelectedGame(null),
      }
    },
  ]

  const selected = games.find((g) => g.id === selectedGame)

  if (selected && selected.component) {
    const GameComponent = selected.component
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => setSelectedGame(null)}>← Quay lại</Button>
        <GameComponent {...(selected.props ?? {})} />
      </div>
    )
  }

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
