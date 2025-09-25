"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface FlashcardProps {
  id: string
  question: string
  answer: string
  category?: string
  difficulty?: "easy" | "medium" | "hard"
  className?: string
}

export function Flashcard({ id, question, answer, category, difficulty, className }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
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

  return (
    <div className={cn("perspective-1000", className)}>
      <div
        className={cn(
          "relative w-full h-64 cursor-pointer transition-transform duration-700 transform-style-preserve-3d",
          isFlipped && "rotate-y-180",
        )}
        onClick={handleFlip}
      >
        {/* Front of card (Question) */}
        <Card
          className={cn(
            "absolute inset-0 w-full h-full backface-hidden border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100 hover:shadow-lg transition-shadow",
            "flex flex-col",
          )}
        >
          <CardContent className="flex-1 flex flex-col justify-between p-6">
            <div className="flex justify-between items-start mb-4">
              {category && (
                <Badge variant="secondary" className="bg-yellow-200 text-yellow-800 border-yellow-300">
                  {category}
                </Badge>
              )}
              {difficulty && (
                <Badge variant="outline" className={getDifficultyColor(difficulty)}>
                  {difficulty}
                </Badge>
              )}
            </div>
            <div className="flex-1 flex items-center justify-center">
              <p className="text-lg font-medium text-gray-900 text-center text-balance leading-relaxed">{question}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Click to reveal answer</p>
            </div>
          </CardContent>
        </Card>

        {/* Back of card (Answer) */}
        <Card
          className={cn(
            "absolute inset-0 w-full h-full backface-hidden rotate-y-180 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-lg transition-shadow",
            "flex flex-col",
          )}
        >
          <CardContent className="flex-1 flex flex-col justify-between p-6">
            <div className="flex justify-between items-start mb-4">
              {category && (
                <Badge variant="secondary" className="bg-blue-200 text-blue-800 border-blue-300">
                  {category}
                </Badge>
              )}
              {difficulty && (
                <Badge variant="outline" className={getDifficultyColor(difficulty)}>
                  {difficulty}
                </Badge>
              )}
            </div>
            <div className="flex-1 flex items-center justify-center">
              <p className="text-lg font-medium text-gray-900 text-center text-balance leading-relaxed">{answer}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Click to see question</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
