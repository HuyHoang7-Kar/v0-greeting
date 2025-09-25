"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Clock, Star, Shuffle, CheckCircle, XCircle } from "lucide-react"

interface GameQuestion {
  id: string
  question: string
  correct_answer: string
  options: string[]
  points: number
}

interface WordScrambleGameProps {
  gameId: string
  questions: GameQuestion[]
  onGameComplete: (score: number, maxScore: number, timeTaken: number, pointsEarned: number) => void
}

export function WordScrambleGame({ gameId, questions, onGameComplete }: WordScrambleGameProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")
  const [scrambledWord, setScrambledWord] = useState("")
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(180) // 3 minutes
  const [gameStarted, setGameStarted] = useState(false)
  const [gameEnded, setGameEnded] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>([])

  const currentQuestion = questions[currentQuestionIndex]

  // Initialize answered questions array
  useEffect(() => {
    setAnsweredQuestions(new Array(questions.length).fill(false))
  }, [questions])

  // Scramble word when question changes
  useEffect(() => {
    if (currentQuestion) {
      setScrambledWord(scrambleWord(currentQuestion.question))
      setUserAnswer("")
      setShowResult(false)
      setIsCorrect(null)
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

  const scrambleWord = (word: string) => {
    return word
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("")
  }

  const startGame = () => {
    setGameStarted(true)
    setTimeLeft(180)
  }

  const handleSubmit = () => {
    if (!userAnswer.trim()) return

    const correct = userAnswer.toUpperCase() === currentQuestion.correct_answer.toUpperCase()
    setIsCorrect(correct)
    setShowResult(true)

    if (correct) {
      setScore((prev) => prev + currentQuestion.points)
    }

    // Mark question as answered
    setAnsweredQuestions((prev) => {
      const newAnswered = [...prev]
      newAnswered[currentQuestionIndex] = true
      return newAnswered
    })

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1)
      } else {
        endGame()
      }
    }, 2000)
  }

  const handleSkip = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    } else {
      endGame()
    }
  }

  const handleShuffle = () => {
    setScrambledWord(scrambleWord(currentQuestion.question))
  }

  const endGame = () => {
    setGameEnded(true)
    const maxScore = questions.reduce((sum, q) => sum + q.points, 0)
    const timeTaken = 180 - timeLeft
    onGameComplete(score, maxScore, timeTaken, score)
  }

  const progress = ((currentQuestionIndex + (showResult ? 1 : 0)) / questions.length) * 100

  if (!gameStarted) {
    return (
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Trò chơi Xếp từ</h2>
          <p className="text-gray-600">Sắp xếp lại các chữ cái để tạo thành từ đúng</p>
        </div>

        <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>3 phút</span>
          </div>
          <div className="flex items-center space-x-2">
            <Star className="w-4 h-4" />
            <span>{questions.length} từ</span>
          </div>
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
    const correctAnswers = answeredQuestions.filter(Boolean).length

    return (
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900">Hoàn thành!</h2>
          <p className="text-gray-600">
            Bạn đã trả lời đúng {correctAnswers}/{questions.length} từ
          </p>
        </div>

        <div className="space-y-4">
          <div className="text-3xl font-bold text-yellow-600">{score} điểm</div>
          <div className="text-sm text-gray-500">({percentage}% chính xác)</div>
          <div className="text-sm text-gray-500">
            Thời gian: {Math.floor((180 - timeLeft) / 60)}:{((180 - timeLeft) % 60).toString().padStart(2, "0")}
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
          <h2 className="text-xl font-bold text-gray-900">Xếp từ tiếng Anh</h2>
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
                </div>
              ) : (
                <div className="space-y-2">
                  <XCircle className="w-16 h-16 text-red-500 mx-auto" />
                  <h3 className="text-xl font-bold text-red-600">Sai rồi!</h3>
                  <p className="text-gray-600">
                    Đáp án đúng: <strong>{currentQuestion.correct_answer}</strong>
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <h3 className="text-lg font-medium text-gray-700">Sắp xếp các chữ cái này:</h3>

                <div className="text-4xl font-bold text-yellow-600 tracking-widest">{scrambledWord}</div>

                <Button onClick={handleShuffle} variant="outline" size="sm" className="text-gray-600 bg-transparent">
                  <Shuffle className="w-4 h-4 mr-2" />
                  Trộn lại
                </Button>
              </div>

              <div className="space-y-4">
                <Input
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Nhập từ đúng..."
                  className="text-center text-lg"
                  onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                />

                <div className="flex space-x-3">
                  <Button
                    onClick={handleSubmit}
                    disabled={!userAnswer.trim()}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600"
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
