"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { FileText, Trophy, Timer, RotateCcw, ArrowUpDown } from "lucide-react"

interface GameQuestion {
  id: string
  question: string // The complete paragraph
  correct_answer: string // Sentences in correct order, separated by |
  options: string[] // Shuffled sentences
  hints?: string
  points: number
}

interface SentenceOrderGameProps {
  gameId: string
  questions: GameQuestion[]
  onGameComplete: (score: number, maxScore: number, timeTaken: number, pointsEarned: number) => void
}

export function SentenceOrderGame({ gameId, questions, onGameComplete }: SentenceOrderGameProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [orderedSentences, setOrderedSentences] = useState<string[]>([])
  const [availableSentences, setAvailableSentences] = useState<string[]>([])
  const [score, setScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameEnded, setGameEnded] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [draggedSentence, setDraggedSentence] = useState<string | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const startTimeRef = useRef<number>(0)

  const currentQuestion = questions[currentQuestionIndex]
  const totalQuestions = questions.length
  const maxScore = questions.reduce((sum, q) => sum + q.points, 0)
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100

  useEffect(() => {
    if (currentQuestion) {
      setAvailableSentences([...currentQuestion.options])
      setOrderedSentences([])
    }
  }, [currentQuestion])

  const startGame = () => {
    setGameStarted(true)
    startTimeRef.current = Date.now()
    setScore(0)
    setCurrentQuestionIndex(0)
  }

  const endGame = () => {
    setGameEnded(true)
    const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000)
    const bonusPoints = score === maxScore ? 40 : 0 // Perfect score bonus
    const pointsEarned = score + bonusPoints
    onGameComplete(score, maxScore, timeTaken, pointsEarned)
  }

  const handleSentenceClick = (sentence: string) => {
    // Move from available to ordered
    setAvailableSentences(availableSentences.filter((s) => s !== sentence))
    setOrderedSentences([...orderedSentences, sentence])
  }

  const handleOrderedSentenceClick = (sentence: string, index: number) => {
    // Move from ordered back to available
    setOrderedSentences(orderedSentences.filter((_, i) => i !== index))
    setAvailableSentences([...availableSentences, sentence])
  }

  const handleDragStart = (sentence: string) => {
    setDraggedSentence(sentence)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    setDragOverIndex(null)

    if (!draggedSentence) return

    // Remove from available sentences
    setAvailableSentences(availableSentences.filter((s) => s !== draggedSentence))

    // Insert at specific position in ordered sentences
    const newOrdered = [...orderedSentences]
    newOrdered.splice(targetIndex, 0, draggedSentence)
    setOrderedSentences(newOrdered)

    setDraggedSentence(null)
  }

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newOrdered = [...orderedSentences]
    const [movedSentence] = newOrdered.splice(fromIndex, 1)
    newOrdered.splice(toIndex, 0, movedSentence)
    setOrderedSentences(newOrdered)
  }

  const handleReset = () => {
    setAvailableSentences([...currentQuestion.options])
    setOrderedSentences([])
  }

  const handleSubmitAnswer = () => {
    if (orderedSentences.length !== currentQuestion.options.length) return

    const userAnswer = orderedSentences.join("|")
    const isCorrect = userAnswer === currentQuestion.correct_answer

    if (isCorrect) {
      const newScore = score + currentQuestion.points
      setScore(newScore)
      setFeedback("Chính xác! Bạn đã sắp xếp đúng thứ tự câu trong đoạn văn.")
    } else {
      const correctOrder = currentQuestion.correct_answer.split("|")
      setFeedback(`Chưa đúng thứ tự. Thứ tự đúng là:\n${correctOrder.map((s, i) => `${i + 1}. ${s}`).join("\n")}`)
    }

    // Move to next question
    setTimeout(() => {
      setFeedback(null)

      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
      } else {
        setTimeout(endGame, 1000)
      }
    }, 4000)
  }

  if (!gameStarted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <FileText className="w-8 h-8 text-blue-600" />
            Sắp xếp câu thành đoạn văn
          </CardTitle>
          <p className="text-gray-600">Kéo thả các câu để sắp xếp lại thành đoạn văn hoàn chỉnh và có logic.</p>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Luật chơi:</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Đọc các câu bị xáo trộn</li>
              <li>• Kéo thả để sắp xếp theo thứ tự logic</li>
              <li>• Tạo thành đoạn văn mạch lạc</li>
              <li>• Có thể đặt lại nếu cần</li>
            </ul>
          </div>
          <Button onClick={startGame} size="lg" className="bg-blue-600 hover:bg-blue-700">
            Bắt đầu sắp xếp!
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
            Hoàn thành bài tập!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="space-y-2">
            <p className="text-3xl font-bold text-blue-600">
              {score}/{maxScore} điểm
            </p>
            <p className="text-gray-600">Tỷ lệ chính xác: {percentage}%</p>
          </div>

          {score === maxScore && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-yellow-800 font-semibold">
                📝 Tuyệt vời! Bạn có khả năng đọc hiểu và tư duy mạch văn rất tốt!
              </p>
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800">Bạn đã luyện tập khả năng đọc hiểu và tư duy mạch văn xuất sắc!</p>
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
            <FileText className="w-6 h-6 text-blue-600" />
            Sắp xếp câu thành đoạn văn
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Timer className="w-4 h-4" />
              <span>{score} điểm</span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Tiến độ</span>
            <span>
              {currentQuestionIndex + 1}/{totalQuestions}
            </span>
          </div>
          <Progress value={progress} />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Instructions */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Nhiệm vụ:</strong> Sắp xếp các câu dưới đây thành một đoạn văn hoàn chỉnh và có logic.
          </p>
        </div>

        {/* Ordered Sentences Area */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Đoạn văn của bạn:</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="flex items-center gap-2 bg-transparent"
            >
              <RotateCcw className="w-4 h-4" />
              Đặt lại
            </Button>
          </div>

          <div className="min-h-[200px] border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
            {orderedSentences.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Kéo các câu vào đây để tạo thành đoạn văn</p>
            ) : (
              <div className="space-y-3">
                {orderedSentences.map((sentence, index) => (
                  <div
                    key={`ordered-${index}`}
                    className={`bg-white border rounded-lg p-3 cursor-pointer hover:shadow-md transition-all ${
                      dragOverIndex === index ? "border-blue-400 bg-blue-50" : "border-gray-200"
                    }`}
                    onClick={() => handleOrderedSentenceClick(sentence, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                  >
                    <div className="flex items-start gap-3">
                      <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-2 py-1 rounded">
                        {index + 1}
                      </span>
                      <p className="flex-1 text-sm leading-relaxed">{sentence}</p>
                      <ArrowUpDown className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Available Sentences */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-800">Các câu cần sắp xếp:</h3>
          <div className="space-y-2">
            {availableSentences.map((sentence, index) => (
              <div
                key={`available-${index}`}
                draggable
                onDragStart={() => handleDragStart(sentence)}
                className="bg-white border border-gray-200 rounded-lg p-3 cursor-move hover:border-blue-300 hover:shadow-md transition-all select-none"
                onClick={() => handleSentenceClick(sentence)}
              >
                <p className="text-sm leading-relaxed">{sentence}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmitAnswer}
          disabled={orderedSentences.length !== currentQuestion.options.length || !!feedback}
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          {orderedSentences.length !== currentQuestion.options.length
            ? `Cần sắp xếp ${currentQuestion.options.length - orderedSentences.length} câu nữa`
            : "Kiểm tra đáp án"}
        </Button>

        {feedback && (
          <div
            className={`p-4 rounded-lg whitespace-pre-line ${
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
