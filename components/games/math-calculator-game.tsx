"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Clock, Star, Calculator, CheckCircle, XCircle } from "lucide-react"

interface GameQuestion {
  id: string
  question: string
  correct_answer: string
  options: string[]
  points: number
}

interface MathCalculatorGameProps {
  gameId: string
  questions: GameQuestion[]
  onGameComplete: (score: number, maxScore: number, timeTaken: number, pointsEarned: number) => void
}

export function MathCalculatorGame({ gameId, questions, onGameComplete }: MathCalculatorGameProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const [gameStarted, setGameStarted] = useState(false)
  const [gameEnded, setGameEnded] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [calculatorDisplay, setCalculatorDisplay] = useState("0")
  const [operation, setOperation] = useState<string | null>(null)
  const [previousValue, setPreviousValue] = useState<number | null>(null)

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
    setTimeLeft(300)
  }

  const handleCalculatorInput = (value: string) => {
    if (value === "C") {
      setCalculatorDisplay("0")
      setOperation(null)
      setPreviousValue(null)
    } else if (value === "=") {
      if (operation && previousValue !== null) {
        const current = Number.parseFloat(calculatorDisplay)
        let result = 0
        switch (operation) {
          case "+":
            result = previousValue + current
            break
          case "-":
            result = previousValue - current
            break
          case "*":
            result = previousValue * current
            break
          case "/":
            result = previousValue / current
            break
        }
        setCalculatorDisplay(result.toString())
        setUserAnswer(result.toString())
        setOperation(null)
        setPreviousValue(null)
      }
    } else if (["+", "-", "*", "/"].includes(value)) {
      if (operation && previousValue !== null) {
        // Chain operations
        const current = Number.parseFloat(calculatorDisplay)
        let result = 0
        switch (operation) {
          case "+":
            result = previousValue + current
            break
          case "-":
            result = previousValue - current
            break
          case "*":
            result = previousValue * current
            break
          case "/":
            result = previousValue / current
            break
        }
        setPreviousValue(result)
        setCalculatorDisplay(result.toString())
      } else {
        setPreviousValue(Number.parseFloat(calculatorDisplay))
      }
      setOperation(value)
      setCalculatorDisplay("0")
    } else {
      // Number input
      if (calculatorDisplay === "0") {
        setCalculatorDisplay(value)
      } else {
        setCalculatorDisplay(calculatorDisplay + value)
      }
    }
  }

  const handleSubmit = () => {
    if (!userAnswer.trim()) return

    const correct = Math.abs(Number.parseFloat(userAnswer) - Number.parseFloat(currentQuestion.correct_answer)) < 0.01
    setIsCorrect(correct)
    setShowResult(true)

    if (correct) {
      setScore((prev) => prev + currentQuestion.points)
    }

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1)
        setUserAnswer("")
        setCalculatorDisplay("0")
        setOperation(null)
        setPreviousValue(null)
        setShowResult(false)
        setIsCorrect(null)
      } else {
        endGame()
      }
    }, 2000)
  }

  const endGame = () => {
    setGameEnded(true)
    const maxScore = questions.reduce((sum, q) => sum + q.points, 0)
    const timeTaken = 300 - timeLeft
    onGameComplete(score, maxScore, timeTaken, score)
  }

  const progress = ((currentQuestionIndex + (showResult ? 1 : 0)) / questions.length) * 100

  if (!gameStarted) {
    return (
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Trò chơi Máy tính Toán</h2>
          <p className="text-gray-600">Sử dụng máy tính để giải các bài toán và nhập kết quả</p>
        </div>

        <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>5 phút</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calculator className="w-4 h-4" />
            <span>{questions.length} bài toán</span>
          </div>
        </div>

        <Button onClick={startGame} size="lg" className="bg-blue-500 hover:bg-blue-600">
          Bắt đầu tính toán
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
          <p className="text-gray-600">Bạn đã giải xong tất cả bài toán</p>
        </div>

        <div className="space-y-4">
          <div className="text-3xl font-bold text-blue-600">{score} điểm</div>
          <div className="text-sm text-gray-500">({percentage}% chính xác)</div>
          <div className="text-sm text-gray-500">
            Thời gian: {Math.floor((300 - timeLeft) / 60)}:{((300 - timeLeft) % 60).toString().padStart(2, "0")}
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
          <h2 className="text-xl font-bold text-gray-900">Máy tính Toán học</h2>
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
      <div className="grid md:grid-cols-2 gap-6">
        {/* Question */}
        <Card className="p-6">
          <CardContent className="space-y-4">
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
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Bài toán:</h3>
                <div className="text-2xl font-bold text-blue-600 text-center p-4 bg-blue-50 rounded-lg">
                  {currentQuestion.question}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Kết quả:</label>
                  <Input
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Nhập kết quả..."
                    className="text-center text-lg"
                    type="number"
                    step="0.01"
                  />
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={!userAnswer.trim()}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                >
                  Xác nhận kết quả
                </Button>

                <div className="text-center text-sm text-gray-500">
                  <Badge variant="outline" className="text-xs">
                    {currentQuestion.points} điểm
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Calculator */}
        <Card className="p-6">
          <CardContent className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 text-center">Máy tính</h3>

            {/* Display */}
            <div className="bg-gray-900 text-white p-4 rounded-lg text-right text-2xl font-mono">
              {calculatorDisplay}
            </div>

            {/* Calculator Buttons */}
            <div className="grid grid-cols-4 gap-2">
              <Button
                onClick={() => handleCalculatorInput("C")}
                variant="outline"
                className="bg-red-50 hover:bg-red-100"
              >
                C
              </Button>
              <Button
                onClick={() => handleCalculatorInput("/")}
                variant="outline"
                className="bg-orange-50 hover:bg-orange-100"
              >
                ÷
              </Button>
              <Button
                onClick={() => handleCalculatorInput("*")}
                variant="outline"
                className="bg-orange-50 hover:bg-orange-100"
              >
                ×
              </Button>
              <Button
                onClick={() => handleCalculatorInput("-")}
                variant="outline"
                className="bg-orange-50 hover:bg-orange-100"
              >
                -
              </Button>

              <Button onClick={() => handleCalculatorInput("7")} variant="outline">
                7
              </Button>
              <Button onClick={() => handleCalculatorInput("8")} variant="outline">
                8
              </Button>
              <Button onClick={() => handleCalculatorInput("9")} variant="outline">
                9
              </Button>
              <Button
                onClick={() => handleCalculatorInput("+")}
                variant="outline"
                className="bg-orange-50 hover:bg-orange-100 row-span-2"
              >
                +
              </Button>

              <Button onClick={() => handleCalculatorInput("4")} variant="outline">
                4
              </Button>
              <Button onClick={() => handleCalculatorInput("5")} variant="outline">
                5
              </Button>
              <Button onClick={() => handleCalculatorInput("6")} variant="outline">
                6
              </Button>

              <Button onClick={() => handleCalculatorInput("1")} variant="outline">
                1
              </Button>
              <Button onClick={() => handleCalculatorInput("2")} variant="outline">
                2
              </Button>
              <Button onClick={() => handleCalculatorInput("3")} variant="outline">
                3
              </Button>
              <Button
                onClick={() => handleCalculatorInput("=")}
                variant="outline"
                className="bg-blue-50 hover:bg-blue-100 row-span-2"
              >
                =
              </Button>

              <Button onClick={() => handleCalculatorInput("0")} variant="outline" className="col-span-2">
                0
              </Button>
              <Button onClick={() => handleCalculatorInput(".")} variant="outline">
                .
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
