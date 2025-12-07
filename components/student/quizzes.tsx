"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@/lib/supabase/client"
import { Play, Clock, Trophy, Brain } from "lucide-react"

interface Quiz {
  id: string
  title: string
  description: string
  created_at: string
  class_id: string // Thêm class_id để biết quiz thuộc lớp nào
}

interface CompletedQuiz {
  quiz_id: string
  score: number
  total_questions: number
}

export function StudentQuizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [completedQuizzes, setCompletedQuizzes] = useState<CompletedQuiz[]>([])
  const [totalScore, setTotalScore] = useState<number | null>(null)
  const [activeQuiz, setActiveQuiz] = useState<string | null>(null)
  const [quizQuestions, setQuizQuestions] = useState<any[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [answers, setAnswers] = useState<{ [key: string]: string }>({})
  const [showResults, setShowResults] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    const fetchQuizzes = async () => {
      setIsLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // 1️⃣ Lấy danh sách lớp học sinh tham gia
        const { data: classMembers } = await supabase
          .from("class_members")
          .select("class_id")
          .eq("user_id", user.id)

        const studentClassIds = classMembers?.map(c => c.class_id) || []

        // 2️⃣ Lấy quiz chỉ thuộc các lớp học sinh tham gia
        const { data: quizData } = await supabase
          .from("quizzes")
          .select("*")
          .in("class_id", studentClassIds)
          .order("created_at", { ascending: false })

        setQuizzes(quizData || [])

        // 3️⃣ Lấy kết quả đã làm
        const { data: results } = await supabase
          .from("results")
          .select("*")
          .eq("user_id", user.id)

        setCompletedQuizzes(results || [])

        const totalScoreSum = results?.reduce((sum, r: any) => sum + (r.score || 0), 0) || 0
        setTotalScore(totalScoreSum)
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuizzes()
  }, [])

  const startQuiz = async (quizId: string) => {
    setIsLoading(true)
    try {
      const { data: questions } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", quizId)
        .order("created_at")

      if (questions && questions.length > 0) {
        setQuizQuestions(questions)
        setActiveQuiz(quizId)
        setCurrentQuestion(0)
        setAnswers({})
        setSelectedAnswer(null)
        setShowResults(false)
      }
    } catch (error) {
      console.error("Error loading quiz:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswerSelect = (answer: string) => setSelectedAnswer(answer)

  const handleNextQuestion = () => {
    if (selectedAnswer) {
      const newAnswers = { ...answers, [quizQuestions[currentQuestion].id]: selectedAnswer }
      setAnswers(newAnswers)

      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedAnswer(null)
      } else {
        finishQuiz(newAnswers)
      }
    }
  }

  const finishQuiz = async (finalAnswers: { [key: string]: string }) => {
    let correctCount = 0
    quizQuestions.forEach((q) => {
      if (finalAnswers[q.id] === q.correct_answer) correctCount++
    })

    setShowResults(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user && activeQuiz) {
        await supabase.from("results").insert({
          user_id: user.id,
          quiz_id: activeQuiz,
          score: correctCount,
          total_questions: quizQuestions.length,
        })

        setCompletedQuizzes(prev => [...prev, { quiz_id: activeQuiz, score: correctCount, total_questions: quizQuestions.length }])
        setTotalScore(prev => (prev || 0) + correctCount)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const resetQuiz = () => {
    setActiveQuiz(null)
    setQuizQuestions([])
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setAnswers({})
    setShowResults(false)
  }

  // --- Render Quiz đang làm ---
  if (activeQuiz && !showResults) {
    const question = quizQuestions[currentQuestion]
    const progress = ((currentQuestion + 1) / quizQuestions.length) * 100

    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">
            Question {currentQuestion + 1} of {quizQuestions.length}
          </span>
          <Button variant="outline" onClick={resetQuiz}>Exit Quiz</Button>
        </div>
        <Progress value={progress} className="h-2 mb-4" />
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900 text-balance">{question.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {["A","B","C","D"].map(opt => (
              <button
                key={opt}
                onClick={() => handleAnswerSelect(opt)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                  selectedAnswer === opt ? "border-blue-500 bg-blue-100" : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <span className="font-medium text-blue-600 mr-3">{opt}.</span>
                <span className="text-gray-900">{question[`option_${opt.toLowerCase()}`]}</span>
              </button>
            ))}
            <Button onClick={handleNextQuestion} disabled={!selectedAnswer} className="w-full bg-blue-500 hover:bg-blue-600 text-white mt-4">
              {currentQuestion < quizQuestions.length - 1 ? "Next Question" : "Finish Quiz"}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // --- Render kết quả quiz ---
  if (showResults) {
    const score = completedQuizzes.find(c => c.quiz_id === activeQuiz)?.score || 0
    const totalQuestions = completedQuizzes.find(c => c.quiz_id === activeQuiz)?.total_questions || 1
    const percentage = Math.round((score / totalQuestions) * 100)

    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Complete!</h2>
            <p className="text-lg text-gray-700 mb-2">
              You scored <span className="font-bold text-green-600">{score}</span> out of <span className="font-bold">{totalQuestions}</span> ({percentage}%)
            </p>
            {totalScore !== null && (
              <p className="text-lg text-gray-700 mb-4">
                <span className="font-bold text-blue-600">Total Score Across All Quizzes:</span> {totalScore}
              </p>
            )}
            <Button onClick={resetQuiz} className="bg-yellow-500 hover:bg-yellow-600 text-white">
              Back to Quizzes
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // --- Render danh sách quiz ---
  return (
    <div className="space-y-6">
      {quizzes.length === 0 ? (
        <Card className="border-2 border-gray-200">
          <CardContent className="p-12 text-center">
            <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No quizzes available yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quizzes.map(quiz => {
            const completed = completedQuizzes.find(c => c.quiz_id === quiz.id)
            return (
              <Card key={quiz.id} className="border-2 border-blue-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg text-gray-900 text-balance">{quiz.title}</CardTitle>
                      <CardDescription className="mt-2 text-pretty">{quiz.description}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Quiz
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Multiple Choice</span>
                      </div>
                    </div>
                    {completed ? (
                      <span className="text-green-600 font-bold">
                        Score: {completed.score}/{completed.total_questions}
                      </span>
                    ) : (
                      <Button
                        onClick={() => startQuiz(quiz.id)}
                        disabled={isLoading}
                        className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
                      >
                        <Play className="w-4 h-4" /> Start Quiz
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
