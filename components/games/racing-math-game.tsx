"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Car, Trophy, Timer, Target } from "lucide-react"

interface GameQuestion {
  id: string
  question: string
  correct_answer: string
  options: string[]
  hints?: string
  points: number
}

interface RacingMathGameProps {
  gameId: string
  questions: GameQuestion[]
  onGameComplete: (score: number, maxScore: number, timeTaken: number, pointsEarned: number) => void
}

export function RacingMathGame({ gameId, questions, onGameComplete }: RacingMathGameProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")
  const [score, setScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameEnded, setGameEnded] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60) // 60 seconds per game
  const [carPosition, setCarPosition] = useState(0) // Position from 0 to 100
  const [feedback, setFeedback] = useState<string | null>(null)
  const [streak, setStreak] = useState(0)
  const startTimeRef = useRef<number>(0)

  const currentQuestion = questions[currentQuestionIndex]
  const totalQuestions = questions.length
  const maxScore = questions.reduce((sum, q) => sum + q.points, 0)

  useEffect(() => {
    if (gameStarted && !gameEnded && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !gameEnded) {
      endGame()
    }
  }, [timeLeft, gameStarted, gameEnded])

  const startGame = () => {
    setGameStarted(true)
    startTimeRef.current = Date.now()
    setTimeLeft(60)
    setScore(0)
    setCarPosition(0)
    setCurrentQuestionIndex(0)
    setStreak(0)
  }

  const endGame = () => {
    setGameEnded(true)
    const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000)
    const pointsEarned = score + (streak >= 3 ? 20 : 0) // Bonus for streak
    onGameComplete(score, maxScore, timeTaken, pointsEarned)
  }

  const handleSubmitAnswer = () => {
    if (!userAnswer.trim()) return

    const isCorrect = userAnswer.trim() === currentQuestion.correct_answer

    if (isCorrect) {
      const newScore = score + currentQuestion.points
      setScore(newScore)
      setStreak(streak + 1)

      // Move car forward (each correct answer moves car by 100/totalQuestions)
      const newPosition = Math.min(100, carPosition + 100 / totalQuestions)
      setCarPosition(newPosition)

      setFeedback("Chính xác! Xe của bạn tiến lên!")

      // Check if race is won
      if (newPosition >= 100) {
        setTimeout(() => {
          setFeedback("🏆 Chúc mừng! Bạn đã về đích!")
          setTimeout(endGame, 2000)
        }, 1000)
        return
      }
    } else {
      setStreak(0)
      setFeedback(`Sai rồi! Đáp án đúng là: ${currentQuestion.correct_answer}`)
    }

    // Move to next question
    setTimeout(() => {
      setFeedback(null)
      setUserAnswer("")

      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
      } else {
        // All questions completed
        setTimeout(endGame, 1000)
      }
    }, 2000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmitAnswer()
    }
  }

  if (!gameStarted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Car className="w-8 h-8 text-blue-600" />
            Đua xe Tính nhẩm
          </CardTitle>
          <p className="text-gray-600">
            Giải các phép toán để giúp xe của bạn chạy về đích! Mỗi câu đúng sẽ giúp xe tiến lên.
          </p>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Luật chơi:</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Thời gian: 60 giây</li>
              <li>• Mỗi câu đúng giúp xe tiến lên</li>
              <li>• Trả lời liên tiếp đúng 3 câu được thưởng điểm</li>
              <li>• Về đích trước khi hết giờ để thắng!</li>
            </ul>
          </div>
          <Button onClick={startGame} size="lg" className="bg-blue-600 hover:bg-blue-700">
            Bắt đầu đua!
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
            Kết thúc cuộc đua!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="space-y-2">
            <p className="text-3xl font-bold text-blue-600">
              {score}/{maxScore} điểm
            </p>
            <p className="text-gray-600">Tỷ lệ chính xác: {percentage}%</p>
            <p className="text-gray-600">Vị trí xe: {Math.round(carPosition)}% đường đua</p>
          </div>

          {carPosition >= 100 && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-yellow-800 font-semibold">🏆 Xuất sắc! Bạn đã hoàn thành cuộc đua!</p>
            </div>
          )}

          <div className="flex justify-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{streak}</div>
              <div className="text-sm text-gray-600">Chuỗi đúng tối đa</div>
            </div>
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
            <Car className="w-6 h-6 text-blue-600" />
            Đua xe Tính nhẩm
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Timer className="w-4 h-4" />
              <span className="font-mono">{timeLeft}s</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="w-4 h-4" />
              <span>{score} điểm</span>
            </div>
          </div>
        </div>

        {/* Race Track */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Xuất phát</span>
            <span>Đích ({Math.round(carPosition)}%)</span>
          </div>
          <div className="relative bg-gray-200 h-8 rounded-lg overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 opacity-20"></div>
            <div
              className="absolute top-1 left-1 transition-all duration-500 ease-out"
              style={{ left: `${carPosition}%` }}
            >
              <Car className="w-6 h-6 text-blue-600" />
            </div>
            {/* Finish line */}
            <div className="absolute right-2 top-0 bottom-0 w-1 bg-red-500"></div>
          </div>
          <Progress value={carPosition} className="mt-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">
            Câu {currentQuestionIndex + 1}/{totalQuestions}
          </p>
          <h3 className="text-2xl font-bold mb-4">{currentQuestion.question}</h3>

          {streak >= 3 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mb-4">
              <p className="text-yellow-800 text-sm">🔥 Chuỗi {streak} câu đúng! Tiếp tục phong độ!</p>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập đáp án..."
            className="text-center text-lg"
            disabled={!!feedback}
          />
          <Button
            onClick={handleSubmitAnswer}
            disabled={!userAnswer.trim() || !!feedback}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Gửi
          </Button>
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
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Gợi ý:</strong> {currentQuestion.hints}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
