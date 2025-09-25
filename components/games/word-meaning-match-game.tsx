"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Link, Trophy, Timer, Volume2, RotateCcw, Zap } from "lucide-react"

interface GameQuestion {
  id: string
  question: string // English word
  correct_answer: string // Vietnamese meaning
  options: string[] // Vietnamese meanings to match
  hints?: string
  points: number
}

interface WordMeaningMatchGameProps {
  gameId: string
  questions: GameQuestion[]
  onGameComplete: (score: number, maxScore: number, timeTaken: number, pointsEarned: number) => void
}

interface MatchPair {
  english: string
  vietnamese: string
  matched: boolean
  correct: boolean
}

export function WordMeaningMatchGame({ gameId, questions, onGameComplete }: WordMeaningMatchGameProps) {
  const [currentRound, setCurrentRound] = useState(0)
  const [score, setScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameEnded, setGameEnded] = useState(false)
  const [matchPairs, setMatchPairs] = useState<MatchPair[]>([])
  const [selectedEnglish, setSelectedEnglish] = useState<string | null>(null)
  const [selectedVietnamese, setSelectedVietnamese] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [roundComplete, setRoundComplete] = useState(false)
  const [streak, setStreak] = useState(0)
  const startTimeRef = useRef<number>(0)

  const questionsPerRound = 4
  const totalRounds = Math.ceil(questions.length / questionsPerRound)
  const maxScore = questions.reduce((sum, q) => sum + q.points, 0)
  const progress = ((currentRound + 1) / totalRounds) * 100

  const getCurrentRoundQuestions = () => {
    const startIndex = currentRound * questionsPerRound
    return questions.slice(startIndex, startIndex + questionsPerRound)
  }

  useEffect(() => {
    if (gameStarted && !gameEnded) {
      initializeRound()
    }
  }, [currentRound, gameStarted])

  const initializeRound = () => {
    const roundQuestions = getCurrentRoundQuestions()
    const pairs: MatchPair[] = roundQuestions.map((q) => ({
      english: q.question,
      vietnamese: q.correct_answer,
      matched: false,
      correct: false,
    }))
    setMatchPairs(pairs)
    setSelectedEnglish(null)
    setSelectedVietnamese(null)
    setRoundComplete(false)
    setFeedback(null)
  }

  const startGame = () => {
    setGameStarted(true)
    startTimeRef.current = Date.now()
    setScore(0)
    setCurrentRound(0)
    setStreak(0)
  }

  const endGame = () => {
    setGameEnded(true)
    const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000)
    const streakBonus = streak >= 8 ? 30 : 0 // Bonus for 8+ streak
    const pointsEarned = score + streakBonus
    onGameComplete(score, maxScore, timeTaken, pointsEarned)
  }

  const handleEnglishSelect = (word: string) => {
    if (matchPairs.find((p) => p.english === word)?.matched) return

    setSelectedEnglish(word)

    if (selectedVietnamese) {
      checkMatch(word, selectedVietnamese)
    }
  }

  const handleVietnameseSelect = (meaning: string) => {
    if (matchPairs.find((p) => p.vietnamese === meaning)?.matched) return

    setSelectedVietnamese(meaning)

    if (selectedEnglish) {
      checkMatch(selectedEnglish, meaning)
    }
  }

  const checkMatch = (english: string, vietnamese: string) => {
    const pair = matchPairs.find((p) => p.english === english && p.vietnamese === vietnamese)

    if (pair) {
      // Correct match
      const newPairs = matchPairs.map((p) =>
        p.english === english && p.vietnamese === vietnamese ? { ...p, matched: true, correct: true } : p,
      )
      setMatchPairs(newPairs)

      const roundQuestions = getCurrentRoundQuestions()
      const question = roundQuestions.find((q) => q.question === english)
      if (question) {
        setScore(score + question.points)
        setStreak(streak + 1)
      }

      setFeedback("Chính xác! Ghép đúng rồi!")

      // Play pronunciation
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(english)
        utterance.lang = "en-US"
        utterance.rate = 0.8
        speechSynthesis.speak(utterance)
      }

      // Check if round is complete
      if (newPairs.every((p) => p.matched)) {
        setRoundComplete(true)
        setTimeout(() => {
          if (currentRound < totalRounds - 1) {
            setCurrentRound(currentRound + 1)
          } else {
            endGame()
          }
        }, 2000)
      }
    } else {
      // Incorrect match - shake animation
      setStreak(0)
      setFeedback("Sai rồi! Thử lại nhé.")

      // Add shake effect
      setTimeout(() => {
        setFeedback(null)
      }, 1500)
    }

    setSelectedEnglish(null)
    setSelectedVietnamese(null)
  }

  const playPronunciation = (word: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.lang = "en-US"
      utterance.rate = 0.8
      speechSynthesis.speak(utterance)
    }
  }

  const resetRound = () => {
    initializeRound()
    setFeedback(null)
  }

  if (!gameStarted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Link className="w-8 h-8 text-green-600" />
            Ghép đôi từ - nghĩa
          </CardTitle>
          <p className="text-gray-600">
            Kéo từ tiếng Anh sang nghĩa tiếng Việt đúng. Ghép đúng thì sáng lên, sai thì rung lắc.
          </p>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Luật chơi:</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Mỗi vòng có 4 cặp từ - nghĩa</li>
              <li>• Nhấn từ tiếng Anh và nghĩa tiếng Việt để ghép</li>
              <li>• Ghép đúng sẽ sáng lên và phát âm</li>
              <li>• Ghép sai sẽ rung lắc</li>
            </ul>
          </div>
          <Button onClick={startGame} size="lg" className="bg-green-600 hover:bg-green-700">
            Bắt đầu ghép đôi!
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
            Hoàn thành trò chơi!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="space-y-2">
            <p className="text-3xl font-bold text-green-600">
              {score}/{maxScore} điểm
            </p>
            <p className="text-gray-600">Tỷ lệ chính xác: {percentage}%</p>
          </div>

          <div className="flex justify-center space-x-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{streak}</div>
              <div className="text-sm text-gray-600">Chuỗi đúng tối đa</div>
            </div>
          </div>

          {streak >= 8 && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-yellow-800 font-semibold">⚡ Tuyệt vời! Chuỗi ghép đúng ấn tượng!</p>
            </div>
          )}

          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-green-800">Bạn đã học từ vựng và ghi nhớ nghĩa rất nhanh!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const englishWords = matchPairs.map((p) => p.english)
  const vietnameseMeanings = [...matchPairs.map((p) => p.vietnamese)].sort(() => Math.random() - 0.5)

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Link className="w-6 h-6 text-green-600" />
            Ghép đôi từ - nghĩa
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Timer className="w-4 h-4" />
              <span>{score} điểm</span>
            </div>
            <Button variant="outline" size="sm" onClick={resetRound} className="flex items-center gap-1 bg-transparent">
              <RotateCcw className="w-4 h-4" />
              Đặt lại
            </Button>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>
              Vòng {currentRound + 1}/{totalRounds}
            </span>
            <span>
              Đã ghép: {matchPairs.filter((p) => p.matched).length}/{matchPairs.length}
            </span>
          </div>
          <Progress value={progress} />

          {streak >= 3 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mt-2">
              <p className="text-yellow-800 text-sm text-center flex items-center justify-center gap-1">
                <Zap className="w-4 h-4" />
                Chuỗi {streak} lần ghép đúng!
              </p>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {roundComplete && (
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <p className="text-green-800 font-semibold">🎉 Hoàn thành vòng {currentRound + 1}!</p>
            {currentRound < totalRounds - 1 && (
              <p className="text-green-700 text-sm mt-1">Chuẩn bị vòng tiếp theo...</p>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* English Words Column */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800 text-center">Từ tiếng Anh</h3>
            <div className="space-y-2">
              {englishWords.map((word, index) => {
                const pair = matchPairs.find((p) => p.english === word)
                const isMatched = pair?.matched
                const isSelected = selectedEnglish === word

                return (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      isMatched
                        ? "bg-green-100 border-green-300 text-green-800 shadow-lg"
                        : isSelected
                          ? "bg-blue-100 border-blue-400 text-blue-800"
                          : "bg-white border-gray-200 hover:border-green-300 hover:shadow-md"
                    } ${feedback?.includes("Sai") && isSelected ? "animate-pulse" : ""}`}
                    onClick={() => !isMatched && handleEnglishSelect(word)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-lg">{word}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          playPronunciation(word)
                        }}
                        className="p-1 h-auto"
                      >
                        <Volume2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Vietnamese Meanings Column */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800 text-center">Nghĩa tiếng Việt</h3>
            <div className="space-y-2">
              {vietnameseMeanings.map((meaning, index) => {
                const pair = matchPairs.find((p) => p.vietnamese === meaning)
                const isMatched = pair?.matched
                const isSelected = selectedVietnamese === meaning

                return (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      isMatched
                        ? "bg-green-100 border-green-300 text-green-800 shadow-lg"
                        : isSelected
                          ? "bg-blue-100 border-blue-400 text-blue-800"
                          : "bg-white border-gray-200 hover:border-green-300 hover:shadow-md"
                    } ${feedback?.includes("Sai") && isSelected ? "animate-pulse" : ""}`}
                    onClick={() => !isMatched && handleVietnameseSelect(meaning)}
                  >
                    <span className="text-lg">{meaning}</span>
                  </div>
                )
              })}
            </div>
          </div>
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

        <div className="text-center text-sm text-gray-600">
          {selectedEnglish && selectedVietnamese ? (
            <p>
              Đang kiểm tra: <strong>{selectedEnglish}</strong> ↔ <strong>{selectedVietnamese}</strong>
            </p>
          ) : selectedEnglish ? (
            <p>
              Đã chọn: <strong>{selectedEnglish}</strong> - Chọn nghĩa tiếng Việt
            </p>
          ) : selectedVietnamese ? (
            <p>
              Đã chọn: <strong>{selectedVietnamese}</strong> - Chọn từ tiếng Anh
            </p>
          ) : (
            <p>Chọn một từ tiếng Anh và nghĩa tiếng Việt để ghép đôi</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
