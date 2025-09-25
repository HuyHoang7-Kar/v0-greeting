"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Clock, Star, BookOpen, CheckCircle, XCircle, HelpCircle } from "lucide-react"

interface GameQuestion {
  id: string
  question: string
  correct_answer: string
  options: string[]
  hints?: string
  points: number
}

interface LiteratureQuizGameProps {
  gameId: string
  questions: GameQuestion[]
  onGameComplete: (score: number, maxScore: number, timeTaken: number, pointsEarned: number) => void
}

export function LiteratureQuizGame({ gameId, questions, onGameComplete }: LiteratureQuizGameProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(480) // 8 minutes
  const [gameStarted, setGameStarted] = useState(false)
  const [gameEnded, setGameEnded] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [streak, setStreak] = useState(0)

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
    setTimeLeft(480)
  }

  const handleAnswer = (answer: string) => {
    if (showResult) return

    setSelectedAnswer(answer)
    const correct = answer === currentQuestion.correct_answer
    setIsCorrect(correct)
    setShowResult(true)

    if (correct) {
      setScore((prev) => prev + currentQuestion.points)
      setCorrectAnswers((prev) => prev + 1)
      setStreak((prev) => prev + 1)
    } else {
      setStreak(0)
    }

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1)
        setSelectedAnswer(null)
        setShowResult(false)
        setIsCorrect(null)
        setShowHint(false)
      } else {
        endGame()
      }
    }, 2500)
  }

  const endGame = () => {
    setGameEnded(true)
    const maxScore = questions.reduce((sum, q) => sum + q.points, 0)
    const timeTaken = 480 - timeLeft
    onGameComplete(score, maxScore, timeTaken, score)
  }

  const progress = ((currentQuestionIndex + (showResult ? 1 : 0)) / questions.length) * 100

  if (!gameStarted) {
    return (
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Trò chơi Văn học Việt Nam</h2>
          <p className="text-gray-600">Kiểm tra kiến thức văn học Việt Nam của bạn</p>
        </div>

        <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>8 phút</span>
          </div>
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4" />
            <span>{questions.length} câu hỏi</span>
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-purple-800">
            <strong>Hướng dẫn:</strong> Trả lời các câu hỏi về tác giả, tác phẩm, và kiến thức văn học Việt Nam. Sử dụng
            gợi ý khi cần thiết.
          </p>
        </div>

        <Button onClick={startGame} size="lg" className="bg-purple-500 hover:bg-purple-600">
          Bắt đầu kiểm tra
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
          <Trophy className="w-16 h-16 text-purple-500 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900">Hoàn thành!</h2>
          <p className="text-gray-600">
            Bạn đã trả lời đúng {correctAnswers}/{questions.length} câu hỏi
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{score}</div>
            <div className="text-sm text-gray-600">Tổng điểm</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{percentage}%</div>
            <div className="text-sm text-gray-600">Chính xác</div>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          Thời gian: {Math.floor((480 - timeLeft) / 60)}:{((480 - timeLeft) % 60).toString().padStart(2, "0")}
        </div>

        <Button onClick={() => window.location.reload()} variant="outline">
          Làm lại
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-gray-900">Văn học Việt Nam</h2>
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
            {streak > 0 && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-orange-600 font-medium">{streak} chuỗi</span>
              </div>
            )}
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
                  {streak > 1 && <p className="text-orange-600 font-medium">Chuỗi {streak} đáp án đúng!</p>}
                </div>
              ) : (
                <div className="space-y-2">
                  <XCircle className="w-16 h-16 text-red-500 mx-auto" />
                  <h3 className="text-xl font-bold text-red-600">Sai rồi!</h3>
                  <p className="text-gray-600">
                    Đáp án đúng: <strong>{currentQuestion.correct_answer}</strong>
                  </p>
                  <p className="text-sm text-gray-500">Bạn đã chọn: {selectedAnswer}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <h3 className="text-lg font-medium text-gray-900 text-balance">{currentQuestion.question}</h3>

                {currentQuestion.hints && (
                  <div className="space-y-2">
                    <Button
                      onClick={() => setShowHint(!showHint)}
                      variant="outline"
                      size="sm"
                      className="text-purple-600"
                    >
                      <HelpCircle className="w-4 h-4 mr-2" />
                      {showHint ? "Ẩn gợi ý" : "Hiện gợi ý"}
                    </Button>
                    {showHint && (
                      <p className="text-sm text-purple-600 bg-purple-50 p-3 rounded-lg">💡 {currentQuestion.hints}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3">
                {currentQuestion.options.map((option, index) => (
                  <Button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    variant="outline"
                    className="p-4 h-auto text-left justify-start hover:bg-purple-50 hover:border-purple-300"
                  >
                    <span className="font-medium mr-3 text-gray-500">{String.fromCharCode(65 + index)}.</span>
                    <span className="text-balance">{option}</span>
                  </Button>
                ))}
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
