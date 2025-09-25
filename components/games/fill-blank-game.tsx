"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Trophy, Timer, Lightbulb, CheckCircle } from "lucide-react"

interface GameQuestion {
  id: string
  question: string // The text with blanks marked as [BLANK]
  correct_answer: string
  options: string[] // Word options to choose from
  hints?: string
  points: number
}

interface FillBlankGameProps {
  gameId: string
  questions: GameQuestion[]
  onGameComplete: (score: number, maxScore: number, timeTaken: number, pointsEarned: number) => void
}

export function FillBlankGame({ gameId, questions, onGameComplete }: FillBlankGameProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedWords, setSelectedWords] = useState<string[]>([])
  const [score, setScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameEnded, setGameEnded] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set())
  const startTimeRef = useRef<number>(0)

  const currentQuestion = questions[currentQuestionIndex]
  const totalQuestions = questions.length
  const maxScore = questions.reduce((sum, q) => sum + q.points, 0)
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100

  // Parse question text to find blanks
  const parseQuestionText = (text: string) => {
    const parts = text.split("[BLANK]")
    return parts
  }

  const questionParts = parseQuestionText(currentQuestion?.question || "")
  const blanksCount = questionParts.length - 1

  const startGame = () => {
    setGameStarted(true)
    startTimeRef.current = Date.now()
    setScore(0)
    setCurrentQuestionIndex(0)
    setSelectedWords([])
    setUsedWords(new Set())
  }

  const endGame = () => {
    setGameEnded(true)
    const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000)
    const bonusPoints = score === maxScore ? 30 : 0 // Perfect score bonus
    const pointsEarned = score + bonusPoints
    onGameComplete(score, maxScore, timeTaken, pointsEarned)
  }

  const handleWordSelect = (word: string) => {
    if (usedWords.has(word) || selectedWords.length >= blanksCount) return

    setSelectedWords([...selectedWords, word])
    setUsedWords(new Set([...usedWords, word]))
  }

  const handleWordRemove = (index: number) => {
    const wordToRemove = selectedWords[index]
    setSelectedWords(selectedWords.filter((_, i) => i !== index))
    setUsedWords(new Set([...usedWords].filter((w) => w !== wordToRemove)))
  }

  const handleSubmitAnswer = () => {
    if (selectedWords.length !== blanksCount) return

    const userAnswer = selectedWords.join(" ")
    const isCorrect = userAnswer === currentQuestion.correct_answer

    if (isCorrect) {
      const newScore = score + currentQuestion.points
      setScore(newScore)
      setFeedback("Chính xác! Bạn đã điền đúng từ vào chỗ trống.")
    } else {
      setFeedback(
        `Chưa đúng. Đáp án đúng là: "${currentQuestion.correct_answer}". ${currentQuestion.hints ? "Hãy đọc gợi ý để hiểu rõ hơn." : ""}`,
      )
    }

    // Move to next question
    setTimeout(() => {
      setFeedback(null)
      setSelectedWords([])
      setUsedWords(new Set())
      setShowHint(false)

      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
      } else {
        setTimeout(endGame, 1000)
      }
    }, 3000)
  }

  if (!gameStarted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <BookOpen className="w-8 h-8 text-green-600" />
            Điền từ vào chỗ trống
          </CardTitle>
          <p className="text-gray-600">
            Chọn từ thích hợp để điền vào chỗ trống trong đoạn văn. Hệ thống sẽ giải thích ý nghĩa khi bạn trả lời sai.
          </p>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Luật chơi:</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Đọc đoạn văn có chỗ trống</li>
              <li>• Chọn từ phù hợp từ danh sách</li>
              <li>• Có thể xem gợi ý nếu cần</li>
              <li>• Học thêm từ gợi ý khi trả lời sai</li>
            </ul>
          </div>
          <Button onClick={startGame} size="lg" className="bg-green-600 hover:bg-green-700">
            Bắt đầu điền từ!
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
            <p className="text-3xl font-bold text-green-600">
              {score}/{maxScore} điểm
            </p>
            <p className="text-gray-600">Tỷ lệ chính xác: {percentage}%</p>
          </div>

          {score === maxScore && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-yellow-800 font-semibold">🌟 Xuất sắc! Bạn đã làm đúng tất cả!</p>
            </div>
          )}

          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-green-800">Bạn đã luyện tập vốn từ và ngữ cảnh sử dụng rất tốt!</p>
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
            <BookOpen className="w-6 h-6 text-green-600" />
            Điền từ vào chỗ trống
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
        {/* Question Text with Blanks */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-lg leading-relaxed">
            {questionParts.map((part, index) => (
              <span key={index}>
                {part}
                {index < questionParts.length - 1 && (
                  <span className="inline-flex items-center mx-1">
                    <span
                      className="inline-block min-w-[100px] px-3 py-1 border-2 border-dashed border-green-300 bg-white rounded text-center cursor-pointer hover:border-green-400 transition-colors"
                      onClick={() => selectedWords[index] && handleWordRemove(index)}
                    >
                      {selectedWords[index] || "___"}
                    </span>
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Selected Words Display */}
        {selectedWords.length > 0 && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800 mb-2">Từ đã chọn:</p>
            <div className="flex flex-wrap gap-2">
              {selectedWords.map((word, index) => (
                <span
                  key={index}
                  className="bg-blue-200 text-blue-800 px-2 py-1 rounded cursor-pointer hover:bg-blue-300 transition-colors"
                  onClick={() => handleWordRemove(index)}
                >
                  {word} ✕
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Word Options */}
        <div>
          <p className="text-sm text-gray-600 mb-3">Chọn từ phù hợp:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {currentQuestion.options.map((option, index) => (
              <Button
                key={index}
                variant={usedWords.has(option) ? "secondary" : "outline"}
                className={`p-3 h-auto ${
                  usedWords.has(option) ? "opacity-50 cursor-not-allowed" : "hover:bg-green-50 hover:border-green-300"
                }`}
                onClick={() => handleWordSelect(option)}
                disabled={usedWords.has(option) || selectedWords.length >= blanksCount}
              >
                {option}
                {usedWords.has(option) && <CheckCircle className="w-4 h-4 ml-2" />}
              </Button>
            ))}
          </div>
        </div>

        {/* Hint Section */}
        {currentQuestion.hints && (
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-2"
            >
              <Lightbulb className="w-4 h-4" />
              {showHint ? "Ẩn gợi ý" : "Xem gợi ý"}
            </Button>

            {showHint && (
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  <strong>Gợi ý:</strong> {currentQuestion.hints}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleSubmitAnswer}
          disabled={selectedWords.length !== blanksCount || !!feedback}
          className="w-full bg-green-600 hover:bg-green-700"
          size="lg"
        >
          {selectedWords.length !== blanksCount
            ? `Cần chọn ${blanksCount - selectedWords.length} từ nữa`
            : "Kiểm tra đáp án"}
        </Button>

        {feedback && (
          <div
            className={`text-center p-4 rounded-lg ${
              feedback.includes("Chính xác") ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
            }`}
          >
            {feedback}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
