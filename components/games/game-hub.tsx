"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Gamepad2,
  Brain,
  Zap,
  Shuffle,
  Target,
  BookOpen,
  Calculator,
  Globe,
  Heart,
  TrendingUp,
  Car,
  Puzzle,
  FileText,
  ImageIcon,
  Link,
} from "lucide-react"
import { MemoryMatchGame } from "./memory-match-game"
import { WordScrambleGame } from "./word-scramble-game"
import { SpeedQuizGame } from "./speed-quiz-game"
import { DragDropGame } from "./drag-drop-game"
import { MathCalculatorGame } from "./math-calculator-game"
import { NumberPatternGame } from "./number-pattern-game"
import { EnglishFlashcardGame } from "./english-flashcard-game"
import { GrammarQuizGame } from "./grammar-quiz-game"
import { PoetryMatchGame } from "./poetry-match-game"
import { LiteratureQuizGame } from "./literature-quiz-game"
import { RacingMathGame } from "./racing-math-game"
import { PuzzleMathGame } from "./puzzle-math-game"
import { FillBlankGame } from "./fill-blank-game"
import { SentenceOrderGame } from "./sentence-order-game"
import { ImageVocabGame } from "./image-vocab-game"
import { WordMeaningMatchGame } from "./word-meaning-match-game"
import { createBrowserClient } from "@supabase/ssr"

interface Game {
  id: string
  name: string
  description: string
  type:
    | "memory_match"
    | "word_scramble"
    | "speed_quiz"
    | "drag_drop"
    | "math_calculator"
    | "number_pattern"
    | "english_flashcard"
    | "grammar_quiz"
    | "poetry_match"
    | "literature_quiz"
    | "racing_math"
    | "puzzle_math"
    | "fill_blank"
    | "sentence_order"
    | "image_vocab"
    | "word_meaning_match"
  category: "math" | "english" | "literature"
  difficulty: "easy" | "medium" | "hard"
}

interface GameQuestion {
  id: string
  question: string
  correct_answer: string
  options: string[]
  hints?: string
  points: number
}

const gameIcons = {
  memory_match: Brain,
  word_scramble: Shuffle,
  speed_quiz: Zap,
  drag_drop: Target,
  math_calculator: Calculator,
  number_pattern: TrendingUp,
  english_flashcard: BookOpen,
  grammar_quiz: Globe,
  poetry_match: Heart,
  literature_quiz: BookOpen,
  racing_math: Car,
  puzzle_math: Puzzle,
  fill_blank: BookOpen,
  sentence_order: FileText,
  image_vocab: ImageIcon,
  word_meaning_match: Link,
}

const categoryIcons = {
  math: Calculator,
  english: Globe,
  literature: BookOpen,
}

const categoryNames = {
  math: "Toán học",
  english: "Tiếng Anh",
  literature: "Ngữ văn",
}

const difficultyColors = {
  easy: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  hard: "bg-red-100 text-red-800",
}

const difficultyNames = {
  easy: "Dễ",
  medium: "Trung bình",
  hard: "Khó",
}

export function GameHub() {
  const [games, setGames] = useState<Game[]>([])
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [gameQuestions, setGameQuestions] = useState<GameQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const fallbackGames: Game[] = [
    {
      id: "racing-math-1",
      name: "Đua xe Tính nhẩm",
      description: "Giải phép toán để giúp xe chạy về đích nhanh nhất",
      type: "racing_math",
      category: "math",
      difficulty: "easy",
    },
    {
      id: "puzzle-math-1",
      name: "Ghép hình Kết quả",
      description: "Kéo thả đáp án đúng để hoàn thành bức tranh",
      type: "puzzle_math",
      category: "math",
      difficulty: "medium",
    },
    {
      id: "fill-blank-1",
      name: "Điền từ vào chỗ trống",
      description: "Chọn từ thích hợp để hoàn thành đoạn văn",
      type: "fill_blank",
      category: "literature",
      difficulty: "easy",
    },
    {
      id: "sentence-order-1",
      name: "Sắp xếp câu thành đoạn văn",
      description: "Kéo thả các câu để tạo thành đoạn văn mạch lạc",
      type: "sentence_order",
      category: "literature",
      difficulty: "medium",
    },
    {
      id: "image-vocab-1",
      name: "Flashcard đoán từ vựng",
      description: "Xem hình ảnh để chọn từ tiếng Anh đúng",
      type: "image_vocab",
      category: "english",
      difficulty: "easy",
    },
    {
      id: "word-meaning-1",
      name: "Ghép đôi từ - nghĩa",
      description: "Ghép từ tiếng Anh với nghĩa tiếng Việt",
      type: "word_meaning_match",
      category: "english",
      difficulty: "medium",
    },
  ]

  const fallbackQuestions: { [key: string]: GameQuestion[] } = {
    "racing-math-1": [
      { id: "1", question: "5 + 3 = ?", correct_answer: "8", options: ["6", "7", "8", "9"], points: 10 },
      { id: "2", question: "12 - 4 = ?", correct_answer: "8", options: ["6", "7", "8", "9"], points: 10 },
      { id: "3", question: "6 × 2 = ?", correct_answer: "12", options: ["10", "11", "12", "13"], points: 15 },
    ],
    "puzzle-math-1": [
      { id: "1", question: "15 ÷ 3 = ?", correct_answer: "5", options: ["3", "4", "5", "6"], points: 10 },
      { id: "2", question: "7 + 8 = ?", correct_answer: "15", options: ["13", "14", "15", "16"], points: 10 },
      { id: "3", question: "9 × 3 = ?", correct_answer: "27", options: ["24", "25", "27", "28"], points: 15 },
    ],
    "fill-blank-1": [
      {
        id: "1",
        question: "Mùa xuân về, cây cối _____ lá xanh.",
        correct_answer: "đâm",
        options: ["đâm", "rụng", "héo", "vàng"],
        points: 10,
      },
      {
        id: "2",
        question: "Con sông _____ chảy qua làng tôi.",
        correct_answer: "trong",
        options: ["đục", "trong", "cạn", "sâu"],
        points: 10,
      },
    ],
    "sentence-order-1": [
      {
        id: "1",
        question: "Sắp xếp: 'tôi / đến / trường / đi / hàng ngày'",
        correct_answer: "Hàng ngày tôi đi đến trường",
        options: [],
        points: 15,
      },
    ],
    "image-vocab-1": [
      {
        id: "1",
        question: "Từ tiếng Anh của 'con mèo' là gì?",
        correct_answer: "cat",
        options: ["dog", "cat", "bird", "fish"],
        points: 10,
      },
      {
        id: "2",
        question: "Từ tiếng Anh của 'ngôi nhà' là gì?",
        correct_answer: "house",
        options: ["car", "tree", "house", "book"],
        points: 10,
      },
    ],
    "word-meaning-1": [
      {
        id: "1",
        question: "Apple",
        correct_answer: "Quả táo",
        options: ["Quả cam", "Quả táo", "Quả chuối", "Quả nho"],
        points: 10,
      },
      { id: "2", question: "Water", correct_answer: "Nước", options: ["Lửa", "Đất", "Nước", "Gió"], points: 10 },
    ],
  }

  useEffect(() => {
    fetchGames()
  }, [])

  const fetchGames = async () => {
    try {
      console.log("[v0] Fetching games from database...")
      const { data, error } = await supabase.from("games").select("*").order("created_at", { ascending: false })

      if (error) {
        console.log("[v0] Database error:", error)
        console.log("[v0] Using fallback games instead")
        setGames(fallbackGames)
      } else {
        console.log("[v0] Games loaded from database:", data?.length || 0)
        setGames(data && data.length > 0 ? data : fallbackGames)
      }
    } catch (error) {
      console.error("[v0] Error fetching games:", error)
      console.log("[v0] Using fallback games due to error")
      setGames(fallbackGames)
    } finally {
      setLoading(false)
    }
  }

  const fetchGameQuestions = async (gameId: string) => {
    try {
      console.log("[v0] Fetching questions for game:", gameId)
      const { data, error } = await supabase
        .from("game_questions")
        .select("*")
        .eq("game_id", gameId)
        .order("created_at", { ascending: true })

      if (error || !data || data.length === 0) {
        console.log("[v0] Using fallback questions for game:", gameId)
        const fallbackQs = fallbackQuestions[gameId] || []
        setGameQuestions(fallbackQs)
        return
      }

      const formattedQuestions: GameQuestion[] = (data || []).map((q) => ({
        id: q.id,
        question: q.question,
        correct_answer: q.correct_answer,
        options: q.options || [],
        hints: q.hints,
        points: q.points || 10,
      }))

      console.log("[v0] Questions loaded:", formattedQuestions.length)
      setGameQuestions(formattedQuestions)
    } catch (error) {
      console.error("[v0] Error fetching game questions:", error)
      const fallbackQs = fallbackQuestions[gameId] || []
      setGameQuestions(fallbackQs)
    }
  }

  const handleGameSelect = async (game: Game) => {
    setSelectedGame(game)
    await fetchGameQuestions(game.id)
  }

  const handleGameComplete = async (score: number, maxScore: number, timeTaken: number, pointsEarned: number) => {
    if (!selectedGame) return

    try {
      // Save game result
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        await supabase.from("game_results").insert({
          user_id: user.id,
          game_id: selectedGame.id,
          score,
          max_score: maxScore,
          time_taken: timeTaken,
          points_earned: pointsEarned,
        })

        // Update user points
        await supabase.rpc("update_user_points", {
          p_user_id: user.id,
          p_points_earned: pointsEarned,
        })
      }
    } catch (error) {
      console.error("Error saving game result:", error)
    }
  }

  const handleBackToHub = () => {
    setSelectedGame(null)
    setGameQuestions([])
  }

  const filteredGames = selectedCategory === "all" ? games : games.filter((game) => game.category === selectedCategory)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto"></div>
          <p className="text-gray-600">Đang tải trò chơi...</p>
        </div>
      </div>
    )
  }

  // Render selected game
  if (selectedGame && gameQuestions.length > 0) {
    const GameComponent = {
      memory_match: MemoryMatchGame,
      word_scramble: WordScrambleGame,
      speed_quiz: SpeedQuizGame,
      drag_drop: DragDropGame,
      math_calculator: MathCalculatorGame,
      number_pattern: NumberPatternGame,
      english_flashcard: EnglishFlashcardGame,
      grammar_quiz: GrammarQuizGame,
      poetry_match: PoetryMatchGame,
      literature_quiz: LiteratureQuizGame,
      racing_math: RacingMathGame,
      puzzle_math: PuzzleMathGame,
      fill_blank: FillBlankGame,
      sentence_order: SentenceOrderGame,
      image_vocab: ImageVocabGame,
      word_meaning_match: WordMeaningMatchGame,
    }[selectedGame.type]

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button onClick={handleBackToHub} variant="outline">
            ← Quay lại trung tâm trò chơi
          </Button>
          <Badge className={difficultyColors[selectedGame.difficulty]}>
            {difficultyNames[selectedGame.difficulty]}
          </Badge>
        </div>

        <GameComponent gameId={selectedGame.id} questions={gameQuestions} onGameComplete={handleGameComplete} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
          <Gamepad2 className="w-8 h-8 text-yellow-600" />
          Trung tâm Trò chơi
        </h1>
        <p className="text-gray-600">Chọn trò chơi để bắt đầu học tập vui vẻ và ghi điểm</p>
      </div>

      {/* Category Filter */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="math">Toán học</TabsTrigger>
          <TabsTrigger value="english">Tiếng Anh</TabsTrigger>
          <TabsTrigger value="literature">Ngữ văn</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {filteredGames.length === 0 ? (
            <div className="text-center py-12">
              <Gamepad2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có trò chơi</h3>
              <p className="text-gray-600">Chưa có trò chơi nào trong danh mục này.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGames.map((game) => {
                const GameIcon = gameIcons[game.type]
                const CategoryIcon = categoryIcons[game.category]

                return (
                  <Card key={game.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="p-2 bg-yellow-100 rounded-lg">
                            <GameIcon className="w-5 h-5 text-yellow-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg group-hover:text-yellow-600 transition-colors">
                              {game.name}
                            </CardTitle>
                            <div className="flex items-center space-x-2 mt-1">
                              <CategoryIcon className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-500">{categoryNames[game.category]}</span>
                            </div>
                          </div>
                        </div>
                        <Badge className={difficultyColors[game.difficulty]}>{difficultyNames[game.difficulty]}</Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <CardDescription className="mb-4 text-balance">{game.description}</CardDescription>

                      <Button
                        onClick={() => handleGameSelect(game)}
                        className="w-full bg-yellow-500 hover:bg-yellow-600"
                      >
                        Chơi ngay
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
