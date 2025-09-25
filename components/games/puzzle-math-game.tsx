"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Puzzle, Trophy, Timer, Sparkles } from "lucide-react"

interface GameQuestion {
  id: string
  question: string
  correct_answer: string
  options: string[]
  hints?: string
  points: number
}

interface PuzzleMathGameProps {
  gameId: string
  questions: GameQuestion[]
  onGameComplete: (score: number, maxScore: number, timeTaken: number, pointsEarned: number) => void
}

export function PuzzleMathGame({ gameId, questions, onGameComplete }: PuzzleMathGameProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameEnded, setGameEnded] = useState(false)
  const [completedPieces, setCompletedPieces] = useState(0)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [draggedAnswer, setDraggedAnswer] = useState<string | null>(null)
  const [isDropZoneActive, setIsDropZoneActive] = useState(false)
  const startTimeRef = useRef<number>(0)

  const currentQuestion = questions[currentQuestionIndex]
  const totalQuestions = questions.length
  const maxScore = questions.reduce((sum, q) => sum + q.points, 0)
  const puzzleProgress = (completedPieces / totalQuestions) * 100

  // Generate puzzle pieces (grid 4x3 = 12 pieces)
  const puzzlePieces = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    completed: i < completedPieces,
    glowing: i === completedPieces && feedback?.includes("Chính xác"),
  }))

  const startGame = () => {
    setGameStarted(true)
    startTimeRef.current = Date.now()
    setScore(0)
    setCompletedPieces(0)
    setCurrentQuestionIndex(0)
  }

  const endGame = () => {
    setGameEnded(true)
    const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000)
    const bonusPoints = completedPieces === totalQuestions ? 50 : 0 // Bonus for completing puzzle
    const pointsEarned = score + bonusPoints
    onGameComplete(score, maxScore, timeTaken, pointsEarned)
  }

  const handleDragStart = (answer: string) => {
    setDraggedAnswer(answer)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDropZoneActive(true)
  }

  const handleDragLeave = () => {
    setIsDropZoneActive(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDropZoneActive(false)

    if (!draggedAnswer) return

    const isCorrect = draggedAnswer === currentQuestion.correct_answer

    if (isCorrect) {
      const newScore = score + currentQuestion.points
      setScore(newScore)
      setCompletedPieces(completedPieces + 1)
      setFeedback("Chính xác! Mảnh ghép đã sáng lên!")

      // Check if puzzle is complete
      if (completedPieces + 1 >= totalQuestions) {
        setTimeout(() => {
          setFeedback("🎉 Chúc mừng! Bạn đã hoàn thành bức tranh!")
          setTimeout(endGame, 2000)
        }, 1500)
        return
      }
    } else {
      setFeedback(`Sai rồi! Đáp án đúng là: ${currentQuestion.correct_answer}`)
    }

    // Move to next question
    setTimeout(() => {
      setFeedback(null)
      setDraggedAnswer(null)

      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
      } else {
        setTimeout(endGame, 1000)
      }
    }, 2000)
  }

  if (!gameStarted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Puzzle className="w-8 h-8 text-purple-600" />
            Ghép hình Kết quả
          </CardTitle>
          <p className="text-gray-600">
            Kéo đáp án đúng vào ô trống để thắp sáng từng mảnh ghép và hoàn thành bức tranh!
          </p>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Luật chơi:</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Kéo đáp án đúng vào ô trống</li>
              <li>• Mỗi câu đúng thắp sáng một mảnh ghép</li>
              <li>• Hoàn thành tất cả để có bức tranh đẹp</li>
              <li>• Hoàn thành toàn bộ được thưởng điểm</li>
            </ul>
          </div>
          <Button onClick={startGame} size="lg" className="bg-purple-600 hover:bg-purple-700">
            Bắt đầu ghép hình!
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (gameEnded) {
    const percentage = Math.round((score / maxScore) * 100)
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-600" />
            Hoàn thành bức tranh!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="space-y-2">
            <p className="text-3xl font-bold text-purple-600">
              {score}/{maxScore} điểm
            </p>
            <p className="text-gray-600">Tỷ lệ chính xác: {percentage}%</p>
            <p className="text-gray-600">
              Mảnh ghép hoàn thành: {completedPieces}/{totalQuestions}
            </p>
          </div>

          {completedPieces === totalQuestions && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-yellow-800 font-semibold">🎨 Tuyệt vời! Bạn đã hoàn thành bức tranh!</p>
            </div>
          )}

          {/* Final puzzle display */}
          <div className="grid grid-cols-4 gap-1 max-w-xs mx-auto bg-gray-100 p-4 rounded-lg">
            {puzzlePieces.map((piece) => (
              <div
                key={piece.id}
                className={`aspect-square rounded border-2 transition-all duration-300 ${
                  piece.completed
                    ? "bg-gradient-to-br from-purple-400 to-pink-400 border-purple-300 shadow-lg"
                    : "bg-gray-200 border-gray-300"
                }`}
              >
                {piece.completed && (
                  <div className="w-full h-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Puzzle className="w-6 h-6 text-purple-600" />
            Ghép hình Kết quả
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Timer className="w-4 h-4" />
              <span>{score} điểm</span>
            </div>
          </div>
        </div>

        {/* Puzzle Progress */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Tiến độ bức tranh</span>
            <span>
              {completedPieces}/{totalQuestions} mảnh
            </span>
          </div>
          <Progress value={puzzleProgress} className="mb-4" />

          {/* Puzzle Grid */}
          <div className="grid grid-cols-4 gap-1 max-w-xs mx-auto bg-gray-100 p-4 rounded-lg">
            {puzzlePieces.map((piece) => (
              <div
                key={piece.id}
                className={`aspect-square rounded border-2 transition-all duration-500 ${
                  piece.completed
                    ? "bg-gradient-to-br from-purple-400 to-pink-400 border-purple-300 shadow-lg"
                    : piece.glowing
                      ? "bg-gradient-to-br from-yellow-400 to-orange-400 border-yellow-300 shadow-lg animate-pulse"
                      : "bg-gray-200 border-gray-300"
                }`}
              >
                {piece.completed && (
                  <div className="w-full h-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">
            Câu {currentQuestionIndex + 1}/{totalQuestions}
          </p>
          <h3 className="text-2xl font-bold mb-4">{currentQuestion.question}</h3>
        </div>

        {/* Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
            isDropZoneActive ? "border-purple-400 bg-purple-50" : "border-gray-300 bg-gray-50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <p className="text-gray-600">{isDropZoneActive ? "Thả đáp án vào đây!" : "Kéo đáp án đúng vào đây"}</p>
        </div>

        {/* Answer Options */}
        <div className="grid grid-cols-2 gap-3">
          {currentQuestion.options.map((option, index) => (
            <div
              key={index}
              draggable
              onDragStart={() => handleDragStart(option)}
              className="bg-white border-2 border-gray-200 rounded-lg p-4 text-center cursor-move hover:border-purple-300 hover:shadow-md transition-all duration-200 select-none"
            >
              <span className="text-lg font-semibold">{option}</span>
            </div>
          ))}
        </div>

        {feedback && (
          <div
            className={`text-center p-3 rounded-lg ${
              feedback.includes("Chính xác") ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
            }`}
          >
            {feedback}
          </div>
        )}

        {currentQuestion.hints && (
          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="text-sm text-purple-800">
              <strong>Gợi ý:</strong> {currentQuestion.hints}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
