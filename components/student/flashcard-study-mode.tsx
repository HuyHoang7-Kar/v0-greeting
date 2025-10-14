"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, RotateCcw, CheckCircle, XCircle } from "lucide-react"

interface FlashcardData {
  id: string
  question: string
  answer: string
  category?: string
  difficulty?: "easy" | "medium" | "hard"
}

interface FlashcardStudyModeProps {
  flashcards: FlashcardData[]
  onComplete?: (results: { correct: number; total: number }) => void
}

export function FlashcardStudyMode({ flashcards, onComplete }: FlashcardStudyModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [results, setResults] = useState<{ [key: string]: boolean }>({})
  const [showResults, setShowResults] = useState(false)

  const currentCard = flashcards[currentIndex]
  const progress = ((currentIndex + 1) / flashcards.length) * 100
  const correctAnswers = Object.values(results).filter(Boolean).length

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleAnswer = (correct: boolean) => {
    setResults((prev) => ({ ...prev, [currentCard.id]: correct }))

    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
    } else {
      setShowResults(true)
      onComplete?.({ correct: correctAnswers + (correct ? 1 : 0), total: flashcards.length })
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
    }
  }

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
    }
  }

  const handleRestart = () => {
    setCurrentIndex(0)
    setIsFlipped(false)
    setResults({})
    setShowResults(false)
  }

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 border-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "hard":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (showResults) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Study Session Complete!</h2>
            <p className="text-lg text-gray-700 mb-6">
              You got <span className="font-bold text-green-600">{correctAnswers}</span> out of{" "}
              <span className="font-bold">{flashcards.length}</span> correct
            </p>
            <div className="mb-6">
              <Progress value={(correctAnswers / flashcards.length) * 100} className="h-3" />
            </div>
            <Button onClick={handleRestart} className="bg-yellow-500 hover:bg-yellow-600 text-white">
              <RotateCcw className="w-4 h-4 mr-2" />
              Study Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Card {currentIndex + 1} of {flashcards.length}
          </span>
          <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Flashcard */}
      <div className="perspective-1000 mb-6">
        <div
          className={`relative w-full h-80 cursor-pointer transition-transform duration-700 transform-style-preserve-3d ${
            isFlipped ? "rotate-y-180" : ""
          }`}
          onClick={handleFlip}
        >
          {/* Front (Question) */}
          <Card className="absolute inset-0 w-full h-full backface-hidden border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100">
            <CardContent className="flex flex-col justify-between p-6 h-full">
              <div className="flex justify-between items-start">
                {currentCard.category && (
                  <Badge variant="secondary" className="bg-yellow-200 text-yellow-800 border-yellow-300">
                    {currentCard.category}
                  </Badge>
                )}
                {currentCard.difficulty && (
                  <Badge variant="outline" className={getDifficultyColor(currentCard.difficulty)}>
                    {currentCard.difficulty}
                  </Badge>
                )}
              </div>
              <div className="flex-1 flex items-center justify-center">
                <p className="text-xl font-medium text-gray-900 text-center text-balance leading-relaxed">
                  {currentCard.question}
                </p>
              </div>
              <p className="text-sm text-gray-500 text-center">Click to reveal answer</p>
            </CardContent>
          </Card>

          {/* Back (Answer) */}
          <Card className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="flex flex-col justify-between p-6 h-full">
              <div className="flex justify-between items-start">
                {currentCard.category && (
                  <Badge variant="secondary" className="bg-blue-200 text-blue-800 border-blue-300">
                    {currentCard.category}
                  </Badge>
                )}
                {currentCard.difficulty && (
                  <Badge variant="outline" className={getDifficultyColor(currentCard.difficulty)}>
                    {currentCard.difficulty}
                  </Badge>
                )}
              </div>
              <div className="flex-1 flex items-center justify-center">
                <p className="text-xl font-medium text-gray-900 text-center text-balance leading-relaxed">
                  {currentCard.answer}
                </p>
              </div>
              <p className="text-sm text-gray-500 text-center">How did you do?</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4">
        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 bg-transparent"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={handleNext}
            disabled={currentIndex === flashcards.length - 1}
            className="flex items-center gap-2 bg-transparent"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Answer Buttons (only show when flipped) */}
        {isFlipped && (
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => handleAnswer(false)}
              variant="outline"
              className="flex items-center gap-2 border-red-200 text-red-700 hover:bg-red-50"
            >
              <XCircle className="w-4 h-4" />
              Incorrect
            </Button>
            <Button
              onClick={() => handleAnswer(true)}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white"
            >
              <CheckCircle className="w-4 h-4" />
              Correct
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
