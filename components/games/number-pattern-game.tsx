"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Clock, Star, TrendingUp, CheckCircle, XCircle, HelpCircle } from "lucide-react"

interface GameQuestion {
  id: string
  question: string
  correct_answer: string
  options: string[]
  hints?: string
  points: number
}

interface NumberPatternGameProps {
  gameId: string
  questions: GameQuestion[]
  onGameComplete: (score: number, maxScore: number, timeTaken: number, pointsEarned: number) => void
}

export function NumberPatternGame({ gameId, questions, onGameComplete }: NumberPatternGameProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(240) // 4 minutes
  const [gameStarted, setGameStarted] = useState(false)
  const [gameEnded, setGameEnded] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showHint, setShowHint] = useState(false)

  const currentQuestion = questions[currentQuestionIndex]

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

  const handleSubmit = () => {
    if (!userAnswer.trim()) return

    const correct = userAnswer.trim() === currentQuestion.correct_answer.trim()
    setIsCorrect(correct)
    setShowResult(true)

    if (correct) {
      setScore((prev) => prev + currentQuestion.points)
    }

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1)
        setUserAnswer("")
        setShowResult(false)
        setIsCorrect(null)
        setShowHint(false)
      } else {
        endGame()
      }
    }, 2500)
  }

  const handleSkip = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setUserAnswer("")
      setShowResult(false)
      setIsCorrect(null)
      setShowHint(false)
    } else {
      endGame()
    }
  }

  const endGame = () => {
    setGameEnded(true)
    const maxScore = questions.reduce((sum, q) => sum + q.points, 0)
    const timeTaken = 240 - timeLeft
    onGameComplete(score, maxScore, timeTaken, score)
  }

  const progress = ((currentQuestionIndex + (showResult ? 1 : 0)) / questions.length) * 100

  // Parse pattern from question to display numbers
  const parsePattern = (question: string) => {
    const matches = question.match(/\d+/g)
    return matches || []
  }

  if (!gameStarted) {
    return (
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Trò chơi Tìm Quy luật Số</h2>
          <p className="text-gray-600">Tìm quy luật trong dãy số và điền số tiếp theo</p>
        </div>

        <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>4 phút</span>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>{questions.length} dãy số</span>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Hướng dẫn:</strong> Quan sát dãy số và tìm quy luật để điền số tiếp theo. Có thể là cộng, trừ, nhân,
            chia hoặc quy luật phức tạp hơn.
          </p>
        </div>

        <Button onClick={startGame} size="lg" className="bg-blue-500 hover:bg-blue-600">
          Bắt đầu tìm quy luật
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
          <Trophy className="w-16 h-16 text-blue-500 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900">Hoàn thành!</h2>
          <p className="text-gray-600">Bạn đã hoàn thành trò chơi tìm quy luật</p>
        </div>

        <div className="space-y-4">
          <div className="text-3xl font-bold text-blue-600">{score} điểm</div>
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
          <h2 className="text-xl font-bold text-gray-900">Tìm Quy luật Số</h2>
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
                  <p className="text-sm text-gray-500">Quy luật đúng!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <XCircle className="w-16 h-16 text-red-500 mx-auto" />
                  <h3 className="text-xl font-bold text-red-600">Sai rồi!</h3>
                  <p className="text-gray-600">
                    Đáp án đúng: <strong>{currentQuestion.correct_answer}</strong>
                  </p>
                  {currentQuestion.hints && (
                    <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded">💡 {currentQuestion.hints}</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Tìm số tiếp theo trong dãy:</h3>

                {/* Pattern Display */}
                <div className="flex items-center justify-center space-x-4 text-3xl font-bold text-blue-600">
                  {parsePattern(currentQuestion.question).map((num, index) => (
                    <div key={index} className="bg-blue-50 p-4 rounded-lg min-w-[60px] text-center">
                      {num}
                    </div>
                  ))}
                  <div className="text-gray-400">→</div>
                  <div className="bg-yellow-50 border-2 border-dashed border-yellow-300 p-4 rounded-lg min-w-[60px] text-center text-yellow-600">
                    ?
                  </div>
                </div>

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

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Số tiếp theo là:</label>
                  <Input
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Nhập số tiếp theo..."
                    className="text-center text-lg"
                    type="number"
                    onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                  />
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={handleSubmit}
                    disabled={!userAnswer.trim()}
                    className="flex-1 bg-blue-500 hover:bg-blue-600"
                  >
                    Xác nhận
                  </Button>
                  <Button onClick={handleSkip} variant="outline" className="flex-1 bg-transparent">
                    Bỏ qua
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
