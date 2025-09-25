"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ImageIcon, Trophy, Timer, Volume2, Eye } from "lucide-react"

interface GameQuestion {
  id: string
  question: string // Image URL or description
  correct_answer: string
  options: string[] // 4 English word options
  hints?: string
  points: number
}

interface ImageVocabGameProps {
  gameId: string
  questions: GameQuestion[]
  onGameComplete: (score: number, maxScore: number, timeTaken: number, pointsEarned: number) => void
}

export function ImageVocabGame({ gameId, questions, onGameComplete }: ImageVocabGameProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameEnded, setGameEnded] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [streak, setStreak] = useState(0)
  const [gameMode, setGameMode] = useState<"image" | "audio">("image")
  const startTimeRef = useRef<number>(0)

  const currentQuestion = questions[currentQuestionIndex]
  const totalQuestions = questions.length
  const maxScore = questions.reduce((sum, q) => sum + q.points, 0)
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100

  const startGame = () => {
    setGameStarted(true)
    startTimeRef.current = Date.now()
    setScore(0)
    setCurrentQuestionIndex(0)
    setStreak(0)
  }

  const endGame = () => {
    setGameEnded(true)
    const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000)
    const streakBonus = streak >= 5 ? 25 : 0 // Bonus for 5+ streak
    const pointsEarned = score + streakBonus
    onGameComplete(score, maxScore, timeTaken, pointsEarned)
  }

  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer || feedback) return

    setSelectedAnswer(answer)
    const isCorrect = answer === currentQuestion.correct_answer

    if (isCorrect) {
      const newScore = score + currentQuestion.points
      setScore(newScore)
      setStreak(streak + 1)
      setFeedback("Correct! Chính xác!")

      // Play pronunciation
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(currentQuestion.correct_answer)
        utterance.lang = "en-US"
        utterance.rate = 0.8
        speechSynthesis.speak(utterance)
      }
    } else {
      setStreak(0)
      setFeedback(`Wrong! Sai rồi. Đáp án đúng là: "${currentQuestion.correct_answer}"`)
    }

    // Move to next question
    setTimeout(() => {
      setFeedback(null)
      setSelectedAnswer(null)

      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
      } else {
        setTimeout(endGame, 1000)
      }
    }, 2500)
  }

  const playPronunciation = (word: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.lang = "en-US"
      utterance.rate = 0.8
      speechSynthesis.speak(utterance)
    }
  }

  const toggleGameMode = () => {
    setGameMode(gameMode === "image" ? "audio" : "image")
  }

  if (!gameStarted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <ImageIcon className="w-8 h-8 text-purple-600" />
            Flashcard đoán từ vựng
          </CardTitle>
          <p className="text-gray-600">Nhìn hình ảnh hoặc nghe phát âm để chọn từ tiếng Anh đúng trong 4 đáp án.</p>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Luật chơi:</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Xem hình ảnh hoặc nghe phát âm</li>
              <li>• Chọn từ tiếng Anh đúng</li>
              <li>• Nghe phát âm khi trả lời đúng</li>
              <li>• Trả lời đúng liên tiếp để được thưởng</li>
            </ul>
          </div>

          <div className="flex justify-center gap-4">
            <Button
              variant={gameMode === "image" ? "default" : "outline"}
              onClick={() => setGameMode("image")}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Chế độ hình ảnh
            </Button>
            <Button
              variant={gameMode === "audio" ? "default" : "outline"}
              onClick={() => setGameMode("audio")}
              className="flex items-center gap-2"
            >
              <Volume2 className="w-4 h-4" />
              Chế độ nghe
            </Button>
          </div>

          <Button onClick={startGame} size="lg" className="bg-purple-600 hover:bg-purple-700">
            Bắt đầu học từ vựng!
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
            Hoàn thành bài học!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="space-y-2">
            <p className="text-3xl font-bold text-purple-600">
              {score}/{maxScore} điểm
            </p>
            <p className="text-gray-600">Tỷ lệ chính xác: {percentage}%</p>
          </div>

          <div className="flex justify-center space-x-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{streak}</div>
              <div className="text-sm text-gray-600">Chuỗi đúng tối đa</div>
            </div>
          </div>

          {streak >= 5 && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-yellow-800 font-semibold">🌟 Xuất sắc! Chuỗi trả lời đúng ấn tượng!</p>
            </div>
          )}

          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-purple-800">Bạn đã luyện tập từ vựng và kỹ năng nghe tiếng Anh rất tốt!</p>
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
            <ImageIcon className="w-6 h-6 text-purple-600" />
            Flashcard đoán từ vựng
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Timer className="w-4 h-4" />
              <span>{score} điểm</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleGameMode}
              className="flex items-center gap-1 bg-transparent"
            >
              {gameMode === "image" ? <Eye className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              {gameMode === "image" ? "Hình ảnh" : "Nghe"}
            </Button>
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

          {streak >= 3 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mt-2">
              <p className="text-yellow-800 text-sm text-center">🔥 Chuỗi {streak} câu đúng!</p>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question Display */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            {gameMode === "image" ? "Từ tiếng Anh nào mô tả hình ảnh này?" : "Từ nào bạn vừa nghe?"}
          </p>

          {gameMode === "image" ? (
            <div className="bg-gray-100 rounded-lg p-8 mb-4">
              <div className="w-48 h-48 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Hình ảnh: {currentQuestion.question}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg p-8 mb-4">
              <div className="text-center">
                <Button
                  onClick={() => playPronunciation(currentQuestion.correct_answer)}
                  className="bg-purple-600 hover:bg-purple-700 mb-4"
                  size="lg"
                >
                  <Volume2 className="w-6 h-6 mr-2" />
                  Nghe từ
                </Button>
                <p className="text-sm text-gray-600">Nhấn để nghe lại</p>
              </div>
            </div>
          )}
        </div>

        {/* Answer Options */}
        <div className="grid grid-cols-2 gap-4">
          {currentQuestion.options.map((option, index) => (
            <Button
              key={index}
              variant="outline"
              className={`p-4 h-auto text-left justify-start transition-all duration-200 ${
                selectedAnswer === option
                  ? option === currentQuestion.correct_answer
                    ? "bg-green-50 border-green-300 text-green-800"
                    : "bg-red-50 border-red-300 text-red-800"
                  : "hover:bg-purple-50 hover:border-purple-300"
              }`}
              onClick={() => handleAnswerSelect(option)}
              disabled={!!selectedAnswer || !!feedback}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-lg font-semibold">{option}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    playPronunciation(option)
                  }}
                  className="p-1 h-auto"
                >
                  <Volume2 className="w-4 h-4" />
                </Button>
              </div>
            </Button>
          ))}
        </div>

        {feedback && (
          <div
            className={`text-center p-4 rounded-lg ${
              feedback.includes("Correct") ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
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
