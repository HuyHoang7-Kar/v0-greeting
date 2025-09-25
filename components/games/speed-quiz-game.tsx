"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Clock, Star, Zap, CheckCircle, XCircle } from "lucide-react"

interface GameQuestion {
  id: string
  question: string
  correct_answer: string
  options: string[]
  points: number
}

interface SpeedQuizGameProps {
  gameId: string
  questions: GameQuestion[]
  onGameComplete: (score: number, maxScore: number, timeTaken: number, pointsEarned: number) => void
}

export function SpeedQuizGame({ gameId, questions, onGameComplete }: SpeedQuizGameProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(90) // 1.5 minutes
  const [questionTimeLeft, setQuestionTimeLeft] = useState(15) // 15 seconds per question
  const [gameStarted, setGameStarted] = useState(false)
  const [gameEnded, setGameEnded] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)

  const currentQuestion = questions[currentQuestionIndex]

  // Timer for overall game
  useEffect(() => {
    if (gameStarted && !gameEnded && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !gameEnded) {
      endGame()
    }
  }, [gameStarted, gameEnded, timeLeft])

  // Timer for each question
  useEffect(() => {
    if (gameStarted && !gameEnded && !showResult && questionTimeLeft > 0) {
      const timer = setTimeout(() => setQuestionTimeLeft(questionTimeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (questionTimeLeft === 0 && !showResult) {
      handleAnswer(null) // Auto-submit when time runs out
    }
  }, [gameStarted, gameEnded, showResult, questionTimeLeft])

  // Reset question timer when moving to next question
  useEffect(() => {
    if (currentQuestion && !showResult) {
      setQuestionTimeLeft(15)
      setSelectedAnswer(null)
    }
  }, [currentQuestionIndex, showResult])

  const startGame = () => {
    setGameStarted(true)
    setTimeLeft(90)
    setQuestionTimeLeft(15)
  }

  const handleAnswer = (answer: string | null) => {
    if (showResult) return

    setSelectedAnswer(answer)
    const correct = answer === currentQuestion.correct_answer
    setIsCorrect(correct)
    setShowResult(true)

    if (correct) {
      // Bonus points for speed (more points if answered quickly)
      const timeBonus = Math.floor((questionTimeLeft / 15) * 5)
      const totalPoints = currentQuestion.points + timeBonus
      setScore((prev) => prev + totalPoints)
      setStreak((prev) => {
        const newStreak = prev + 1
        setMaxStreak((current) => Math.max(current, newStreak))
        return newStreak
      })
    } else {
      setStreak(0)
    }

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1)
        setShowResult(false)
        setIsCorrect(null)
      } else {
        endGame()
      }
    }, 1500)
  }

  const endGame = () => {
    setGameEnded(true)
    const maxScore = questions.reduce((sum, q) => sum + q.points, 0)
    const timeTaken = 90 - timeLeft
    onGameComplete(score, maxScore, timeTaken, score)
  }

  const progress = ((currentQuestionIndex + (showResult ? 1 : 0)) / questions.length) * 100
  const questionProgress = ((15 - questionTimeLeft) / 15) * 100

  if (!gameStarted) {
    return (
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Thi tốc độ</h2>
          <p className="text-gray-600">Trả lời nhanh các câu hỏi để ghi điểm cao</p>
        </div>

        <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>1.5 phút</span>
          </div>
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>15s/câu</span>
          </div>
          <div className="flex items-center space-x-2">
            <Star className="w-4 h-4" />
            <span>{questions.length} câu hỏi</span>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Mẹo:</strong> Trả lời nhanh để nhận điểm thưởng! Chuỗi đáp án đúng sẽ tăng điểm.
          </p>
        </div>

        <Button onClick={startGame} size="lg" className="bg-yellow-500 hover:bg-yellow-600">
          Bắt đầu thi
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
          <p className="text-gray-600">Bạn đã hoàn thành bài thi tốc độ</p>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{score}</div>
            <div className="text-sm text-gray-600">Tổng điểm</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{maxStreak}</div>
            <div className="text-sm text-gray-600">Chuỗi tốt nhất</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-gray-500">({percentage}% chính xác)</div>
          <div className="text-sm text-gray-500">
            Thời gian: {Math.floor((90 - timeLeft) / 60)}:{((90 - timeLeft) % 60).toString().padStart(2, "0")}
          </div>
        </div>

        <Button onClick={() => window.location.reload()} variant="outline">
          Thi lại
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-gray-900">Thi tốc độ văn học</h2>
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
                <Zap className="w-4 h-4 text-orange-500" />
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
          <span>Tiến độ tổng</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Timer */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Thời gian câu hỏi</span>
          <span className={questionTimeLeft <= 5 ? "text-red-600 font-bold" : ""}>{questionTimeLeft}s</span>
        </div>
        <Progress value={questionProgress} className={`h-1 ${questionTimeLeft <= 5 ? "bg-red-100" : ""}`} />
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
                  <p className="text-gray-600">
                    +{currentQuestion.points} điểm
                    {questionTimeLeft > 10 && (
                      <span className="text-orange-600">
                        {" "}
                        (+{Math.floor((questionTimeLeft / 15) * 5)} thưởng tốc độ)
                      </span>
                    )}
                  </p>
                  {streak > 1 && <p className="text-orange-600 font-medium">Chuỗi {streak} đáp án đúng!</p>}
                </div>
              ) : (
                <div className="space-y-2">
                  <XCircle className="w-16 h-16 text-red-500 mx-auto" />
                  <h3 className="text-xl font-bold text-red-600">{selectedAnswer ? "Sai rồi!" : "Hết giờ!"}</h3>
                  <p className="text-gray-600">
                    Đáp án đúng: <strong>{currentQuestion.correct_answer}</strong>
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4 text-balance">{currentQuestion.question}</h3>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {currentQuestion.options.map((option, index) => (
                  <Button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    variant="outline"
                    className="p-4 h-auto text-left justify-start hover:bg-yellow-50 hover:border-yellow-300"
                  >
                    <span className="font-medium mr-3 text-gray-500">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </Button>
                ))}
              </div>

              <div className="text-center text-sm text-gray-500">
                <Badge variant="outline" className="text-xs">
                  {currentQuestion.points} điểm cơ bản
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
