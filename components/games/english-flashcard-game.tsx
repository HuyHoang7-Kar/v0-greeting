"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Clock, Star, BookOpen, RotateCcw, CheckCircle, XCircle, Volume2 } from "lucide-react"

interface GameQuestion {
  id: string
  question: string
  correct_answer: string
  options: string[]
  points: number
}

interface EnglishFlashcardGameProps {
  gameId: string
  questions: GameQuestion[]
  onGameComplete: (score: number, maxScore: number, timeTaken: number, pointsEarned: number) => void
}

export function EnglishFlashcardGame({ gameId, questions, onGameComplete }: EnglishFlashcardGameProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(360) // 6 minutes
  const [gameStarted, setGameStarted] = useState(false)
  const [gameEnded, setGameEnded] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [userRating, setUserRating] = useState<"easy" | "medium" | "hard" | null>(null)
  const [studiedCards, setStudiedCards] = useState<boolean[]>([])

  const currentQuestion = questions[currentQuestionIndex]

  // Initialize studied cards array
  useEffect(() => {
    setStudiedCards(new Array(questions.length).fill(false))
  }, [questions])

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
    setTimeLeft(360)
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleRating = (rating: "easy" | "medium" | "hard") => {
    setUserRating(rating)
    setShowResult(true)

    // Award points based on self-assessment
    let points = 0
    switch (rating) {
      case "easy":
        points = currentQuestion.points
        break
      case "medium":
        points = Math.floor(currentQuestion.points * 0.7)
        break
      case "hard":
        points = Math.floor(currentQuestion.points * 0.5)
        break
    }

    setScore((prev) => prev + points)

    // Mark card as studied
    setStudiedCards((prev) => {
      const newStudied = [...prev]
      newStudied[currentQuestionIndex] = true
      return newStudied
    })

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1)
        setIsFlipped(false)
        setShowResult(false)
        setUserRating(null)
      } else {
        endGame()
      }
    }, 1500)
  }

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "en-US"
      utterance.rate = 0.8
      speechSynthesis.speak(utterance)
    }
  }

  const endGame = () => {
    setGameEnded(true)
    const maxScore = questions.reduce((sum, q) => sum + q.points, 0)
    const timeTaken = 360 - timeLeft
    onGameComplete(score, maxScore, timeTaken, score)
  }

  const progress = ((currentQuestionIndex + (showResult ? 1 : 0)) / questions.length) * 100

  if (!gameStarted) {
    return (
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Thẻ từ vựng Tiếng Anh</h2>
          <p className="text-gray-600">Học từ vựng tiếng Anh qua thẻ ghi nhớ tương tác</p>
        </div>

        <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>6 phút</span>
          </div>
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4" />
            <span>{questions.length} từ vựng</span>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>Hướng dẫn:</strong> Đọc từ tiếng Anh, đoán nghĩa, sau đó lật thẻ để xem đáp án. Tự đánh giá mức độ
            hiểu biết của bạn.
          </p>
        </div>

        <Button onClick={startGame} size="lg" className="bg-green-500 hover:bg-green-600">
          Bắt đầu học từ vựng
        </Button>
      </div>
    )
  }

  if (gameEnded) {
    const maxScore = questions.reduce((sum, q) => sum + q.points, 0)
    const percentage = Math.round((score / maxScore) * 100)
    const studiedCount = studiedCards.filter(Boolean).length

    return (
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <Trophy className="w-16 h-16 text-green-500 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900">Hoàn thành!</h2>
          <p className="text-gray-600">
            Bạn đã học {studiedCount}/{questions.length} từ vựng
          </p>
        </div>

        <div className="space-y-4">
          <div className="text-3xl font-bold text-green-600">{score} điểm</div>
          <div className="text-sm text-gray-500">({percentage}% hiệu quả học tập)</div>
          <div className="text-sm text-gray-500">
            Thời gian: {Math.floor((360 - timeLeft) / 60)}:{((360 - timeLeft) % 60).toString().padStart(2, "0")}
          </div>
        </div>

        <Button onClick={() => window.location.reload()} variant="outline">
          Học lại
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-gray-900">Thẻ từ vựng Tiếng Anh</h2>
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

      {/* Flashcard */}
      <div className="flex justify-center">
        <div className="w-full max-w-md">
          {showResult ? (
            <Card className="p-6 text-center">
              <CardContent className="space-y-4">
                {userRating === "easy" ? (
                  <div className="space-y-2">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                    <h3 className="text-xl font-bold text-green-600">Tuyệt vời!</h3>
                    <p className="text-gray-600">+{currentQuestion.points} điểm (Dễ)</p>
                  </div>
                ) : userRating === "medium" ? (
                  <div className="space-y-2">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                      <Star className="w-8 h-8 text-yellow-500" />
                    </div>
                    <h3 className="text-xl font-bold text-yellow-600">Khá tốt!</h3>
                    <p className="text-gray-600">+{Math.floor(currentQuestion.points * 0.7)} điểm (Trung bình)</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <XCircle className="w-16 h-16 text-orange-500 mx-auto" />
                    <h3 className="text-xl font-bold text-orange-600">Cần ôn lại!</h3>
                    <p className="text-gray-600">+{Math.floor(currentQuestion.points * 0.5)} điểm (Khó)</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card
              className={`h-80 cursor-pointer transition-all duration-500 transform ${isFlipped ? "rotate-y-180" : ""}`}
              onClick={handleFlip}
            >
              <CardContent className="h-full flex flex-col items-center justify-center p-6 relative">
                {!isFlipped ? (
                  // Front of card - English word
                  <div className="text-center space-y-4">
                    <div className="text-4xl font-bold text-green-600 flex items-center justify-center space-x-3">
                      <span>{currentQuestion.question}</span>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          speakText(currentQuestion.question)
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-green-600 hover:bg-green-50"
                      >
                        <Volume2 className="w-5 h-5" />
                      </Button>
                    </div>
                    <p className="text-gray-500">Nghĩa tiếng Việt là gì?</p>
                    <div className="absolute bottom-4 right-4">
                      <RotateCcw className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                ) : (
                  // Back of card - Vietnamese meaning
                  <div className="text-center space-y-6">
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-blue-600">{currentQuestion.correct_answer}</div>
                      <div className="text-lg text-gray-600">{currentQuestion.question}</div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm text-gray-500">Bạn hiểu từ này như thế nào?</p>
                      <div className="flex space-x-2">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRating("easy")
                          }}
                          size="sm"
                          className="bg-green-500 hover:bg-green-600 text-xs"
                        >
                          Dễ
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRating("medium")
                          }}
                          size="sm"
                          className="bg-yellow-500 hover:bg-yellow-600 text-xs"
                        >
                          Trung bình
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRating("hard")
                          }}
                          size="sm"
                          className="bg-orange-500 hover:bg-orange-600 text-xs"
                        >
                          Khó
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {!showResult && (
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-500">
            {!isFlipped ? "Nhấn vào thẻ để xem nghĩa" : "Đánh giá mức độ hiểu biết của bạn"}
          </p>
          <Badge variant="outline" className="text-xs">
            {currentQuestion.points} điểm tối đa
          </Badge>
        </div>
      )}
    </div>
  )
}
