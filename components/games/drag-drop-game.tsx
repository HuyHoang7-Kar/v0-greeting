"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Clock, Star, HelpCircle, CheckCircle, XCircle } from "lucide-react"

interface GameQuestion {
  id: string
  question: string
  correct_answer: string
  options: string[]
  hints?: string
  points: number
}

interface DragDropGameProps {
  gameId: string
  questions: GameQuestion[]
  onGameComplete: (score: number, maxScore: number, timeTaken: number, pointsEarned: number) => void
}

interface DragItem {
  id: string
  content: string
  isPlaced: boolean
}

export function DragDropGame({ gameId, questions, onGameComplete }: DragDropGameProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [dragItems, setDragItems] = useState<DragItem[]>([])
  const [droppedItem, setDroppedItem] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(240) // 4 minutes
  const [gameStarted, setGameStarted] = useState(false)
  const [gameEnded, setGameEnded] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)

  const currentQuestion = questions[currentQuestionIndex]

  // Initialize drag items when question changes
  useEffect(() => {
    if (currentQuestion) {
      const items: DragItem[] = currentQuestion.options.map((option, index) => ({
        id: `item-${index}`,
        content: option,
        isPlaced: false,
      }))
      setDragItems(items)
      setDroppedItem(null)
      setShowResult(false)
      setIsCorrect(null)
      setShowHint(false)
    }
  }, [currentQuestion])

  // Timer
  useEffect(() => {
    if (gameStarted && !gameEnded && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !gameEnded) {
      endGame()
    }
  }, [gameStarted, gameEnded, timeLeft])

  const startGame = () => {
    setGameStarted(true)
    setTimeLeft(240)
  }

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (draggedItem) {
      const item = dragItems.find((item) => item.id === draggedItem)
      if (item) {
        setDroppedItem(item.content)
        setDragItems((prev) => prev.map((item) => (item.id === draggedItem ? { ...item, isPlaced: true } : item)))
      }
      setDraggedItem(null)
    }
  }

  const handleSubmit = () => {
    if (!droppedItem) return

    const correct = droppedItem === currentQuestion.correct_answer
    setIsCorrect(correct)
    setShowResult(true)

    if (correct) {
      setScore((prev) => prev + currentQuestion.points)
    }

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1)
      } else {
        endGame()
      }
    }, 2500)
  }

  const handleReset = () => {
    setDragItems((prev) => prev.map((item) => ({ ...item, isPlaced: false })))
    setDroppedItem(null)
  }

  const endGame = () => {
    setGameEnded(true)
    const maxScore = questions.reduce((sum, q) => sum + q.points, 0)
    const timeTaken = 240 - timeLeft
    onGameComplete(score, maxScore, timeTaken, score)
  }

  const progress = ((currentQuestionIndex + (showResult ? 1 : 0)) / questions.length) * 100

  if (!gameStarted) {
    return (
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Trò chơi Kéo thả</h2>
          <p className="text-gray-600">Kéo và thả các phần tử vào vị trí đúng để hoàn thành công thức</p>
        </div>

        <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>4 phút</span>
          </div>
          <div className="flex items-center space-x-2">
            <Star className="w-4 h-4" />
            <span>{questions.length} công thức</span>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Hướng dẫn:</strong> Kéo các phần tử từ danh sách bên dưới và thả vào ô trống để hoàn thành công thức
            toán học.
          </p>
        </div>

        <Button onClick={startGame} size="lg" className="bg-yellow-500 hover:bg-yellow-600">
          Bắt đầu chơi
        </Button>
      </div>
    )
  }

  if (gameEnded) {
    const maxScore = questions.reduce((sum, q) => sum + q.points, 0)
    const percentage = Math.round((score / maxScore) * 100)

    return (
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900">Hoàn thành!</h2>
          <p className="text-gray-600">Bạn đã hoàn thành tất cả công thức</p>
        </div>

        <div className="space-y-4">
          <div className="text-3xl font-bold text-yellow-600">{score} điểm</div>
          <div className="text-sm text-gray-500">({percentage}% chính xác)</div>
          <div className="text-sm text-gray-500">
            Thời gian: {Math.floor((240 - timeLeft) / 60)}:{((240 - timeLeft) % 60).toString().padStart(2, "0")}
          </div>
        </div>

        <Button onClick={() => window.location.reload()} variant="outline">
          Chơi lại
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-gray-900">Kéo thả công thức</h2>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4" />
              <span>{score} điểm</span>
            </div>
          </div>
        </div>

        <Badge variant="secondary" className="text-sm">
          {currentQuestionIndex + 1}/{questions.length}
        </Badge>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Tiến độ</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Game Content */}
      <Card className="p-6">
        <CardContent className="space-y-6">
          {showResult ? (
            <div className="text-center space-y-4">
              {isCorrect ? (
                <div className="space-y-2">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                  <h3 className="text-xl font-bold text-green-600">Chính xác!</h3>
                  <p className="text-gray-600">+{currentQuestion.points} điểm</p>
                  <p className="text-sm text-gray-500">Công thức đúng: {currentQuestion.correct_answer}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <XCircle className="w-16 h-16 text-red-500 mx-auto" />
                  <h3 className="text-xl font-bold text-red-600">Sai rồi!</h3>
                  <p className="text-gray-600">
                    Công thức đúng: <strong>{currentQuestion.correct_answer}</strong>
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <h3 className="text-lg font-medium text-gray-900">{currentQuestion.question}</h3>

                {currentQuestion.hints && (
                  <div className="space-y-2">
                    <Button
                      onClick={() => setShowHint(!showHint)}
                      variant="outline"
                      size="sm"
                      className="text-blue-600"
                    >
                      <HelpCircle className="w-4 h-4 mr-2" />
                      {showHint ? "Ẩn gợi ý" : "Hiện gợi ý"}
                    </Button>
                    {showHint && (
                      <p className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">💡 {currentQuestion.hints}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Drop Zone */}
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Kéo phần tử vào ô bên dưới:</p>
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 min-h-[100px] flex items-center justify-center transition-colors ${
                      droppedItem
                        ? "border-green-300 bg-green-50"
                        : "border-gray-300 bg-gray-50 hover:border-yellow-400 hover:bg-yellow-50"
                    }`}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    {droppedItem ? (
                      <div className="text-lg font-medium text-green-700">{droppedItem}</div>
                    ) : (
                      <div className="text-gray-400">Thả công thức vào đây</div>
                    )}
                  </div>
                </div>

                {/* Drag Items */}
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 text-center">Chọn công thức đúng:</p>
                  <div className="grid grid-cols-2 gap-3">
                    {dragItems.map((item) => (
                      <div
                        key={item.id}
                        draggable={!item.isPlaced}
                        onDragStart={(e) => handleDragStart(e, item.id)}
                        className={`p-3 rounded-lg border text-center cursor-move transition-all ${
                          item.isPlaced
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                            : "bg-white border-gray-200 hover:border-yellow-400 hover:bg-yellow-50"
                        }`}
                      >
                        {item.content}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <Button
                    onClick={handleSubmit}
                    disabled={!droppedItem}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600"
                  >
                    Xác nhận
                  </Button>
                  <Button onClick={handleReset} variant="outline" className="flex-1 bg-transparent">
                    Làm lại
                  </Button>
                </div>
              </div>

              <div className="text-center text-sm text-gray-500">
                <Badge variant="outline" className="text-xs">
                  {currentQuestion.points} điểm
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
