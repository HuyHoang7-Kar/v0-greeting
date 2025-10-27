"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
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
  Rocket,
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

// ✅ Mario Platformer mới
import { PlatformerGame } from "./platformer-game"

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
    | "platformer_math"
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
  platformer_math: Rocket,
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

  // ✅ Fallback khi Supabase rỗng
  const fallbackGames: Game[] = [
    {
      id: "math-calculator-1",
      name: "Máy tính Toán học",
      description: "Giải toán bằng máy tính ảo – luyện phản xạ tính toán nhanh!",
      type: "math_calculator",
      category: "math",
      difficulty: "medium",
    },
    {
      id: "platformer-math-1",
      name: "Mario Toán Học",
      description: "Nhảy qua chướng ngại vật và giải bài toán để ghi điểm!",
      type: "platformer_math",
      category: "math",
      difficulty: "medium",
    },
  ]

  const fallbackQuestions: { [key: string]: GameQuestion[] } = {
    "math-calculator-1": [
      { id: "1", question: "12 + 5 = ?", correct_answer: "17", options: [], points: 10 },
      { id: "2", question: "7 × 3 = ?", correct_answer: "21", options: [], points: 10 },
      { id: "3", question: "15 - 8 = ?", correct_answer: "7", options: [], points: 10 },
    ],
    "platformer-math-1": [
      { id: "1", question: "5 + 2 = ?", correct_answer: "7", options: ["6", "7", "8", "9"], points: 10 },
      { id: "2", question: "9 - 3 = ?", correct_answer: "6", options: ["5", "6", "7", "8"], points: 10 },
      { id: "3", question: "4 × 2 = ?", correct_answer: "8", options: ["6", "8", "9", "10"], points: 15 },
    ],
  }

  useEffect(() => {
    fetchGames()
  }, [])

  const fetchGames = async () => {
    try {
      const { data, error } = await supabase.from("games").select("*")
      if (error || !data || data.length === 0) setGames(fallbackGames)
      else setGames(data)
    } catch {
      setGames(fallbackGames)
    } finally {
      setLoading(false)
    }
  }

  const fetchGameQuestions = async (gameId: string) => {
    try {
      const { data, error } = await supabase.from("game_questions").select("*").eq("game_id", gameId)
      if (error || !data || data.length === 0) {
        setGameQuestions(fallbackQuestions[gameId] || [])
      } else {
        setGameQuestions(
          data.map((q) => ({
            id: q.id,
            question: q.question,
            correct_answer: q.correct_answer,
            options: q.options || [],
            hints: q.hints,
            points: q.points || 10,
          })),
        )
      }
    } catch {
      setGameQuestions(fallbackQuestions[gameId] || [])
    }
  }

  const handleGameSelect = async (game: Game) => {
    setSelectedGame(game)
    await fetchGameQuestions(game.id)
  }

  const handleGameComplete = async (
    score: number,
    maxScore: number,
    timeTaken: number,
    pointsEarned: number,
  ) => {
    if (!selectedGame) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase.from("game_results").insert({
        user_id: user.id,
        game_id: selectedGame.id,
        score,
        max_score: maxScore,
        time_taken: timeTaken,
        points_earned: pointsEarned,
      })

      await supabase.rpc("update_user_points", {
        p_user_id: user.id,
        p_points_earned: pointsEarned,
      })
    } catch (error) {
      console.error("Lỗi khi lưu kết quả:", error)
    }
  }

  const handleBackToHub = () => {
    setSelectedGame(null)
    setGameQuestions([])
  }

  const filteredGames =
    selectedCategory === "all"
      ? games
      : games.filter((g) => g.category === selectedCategory)

  if (loading)
    return (
      <div className="flex items-center justify-center py-12 text-gray-600">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto"></div>
          <p>Đang tải trò chơi...</p>
        </div>
      </div>
    )

  if (selectedGame && gameQuestions.length > 0) {
    const GameComponent =
      {
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
        platformer_math: PlatformerGame,
      }[selectedGame.type]

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button onClick={handleBackToHub} variant="outline">
            ← Quay lại trung tâm
          </Button>
          <Badge className={difficultyColors[selectedGame.difficulty]}>
            {difficultyNames[selectedGame.difficulty]}
          </Badge>
        </div>

        <GameComponent
          gameId={selectedGame.id}
          questions={gameQuestions}
          onGameComplete={handleGameComplete}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2 text-gray-900">
          <Gamepad2 className="w-8 h-8 text-yellow-600" />
          Trung tâm trò chơi
        </h1>
        <p className="text-gray-600">Chọn một trò chơi để bắt đầu học và ghi điểm 🎮</p>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="math">Toán học</TabsTrigger>
          <TabsTrigger value="english">Tiếng Anh</TabsTrigger>
          <TabsTrigger value="literature">Ngữ văn</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map((game) => {
              const GameIcon = gameIcons[game.type]
              const CategoryIcon = categoryIcons[game.category]

              return (
                <Card
                  key={game.id}
                  onClick={() => handleGameSelect(game)}
                  className="hover:shadow-lg transition cursor-pointer group"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                          <GameIcon className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg group-hover:text-yellow-600">
                            {game.name}
                          </CardTitle>
                          <div className="flex items-center space-x-2 mt-1 text-gray-500 text-sm">
                            <CategoryIcon className="w-4 h-4" />
                            {categoryNames[game.category]}
                          </div>
                        </div>
                      </div>
                      <Badge className={difficultyColors[game.difficulty]}>
                        {difficultyNames[game.difficulty]}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="mb-4">{game.description}</CardDescription>
                    <Button className="w-full bg-yellow-500 hover:bg-yellow-600">
                      Chơi ngay
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
