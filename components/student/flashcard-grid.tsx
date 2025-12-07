"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface FlashcardData {
  id: string
  class_id: string
  question: string
  answer: string
  category?: string
  difficulty?: "easy" | "medium" | "hard"
}

interface FlashcardGridProps {
  flashcards: FlashcardData[]
  classId: string // chỉ hiển thị flashcards của lớp này
  className?: string
}

export function FlashcardGrid({ flashcards, classId, className }: FlashcardGridProps) {
  // Lọc flashcards theo lớp
  const filteredFlashcards = flashcards.filter((f) => f.class_id === classId)

  if (filteredFlashcards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No flashcards available for this class yet.</p>
        <p className="text-gray-400 text-sm mt-2">Check back later or ask your teacher to add some!</p>
      </div>
    )
  }

  // helper để đổi màu theo difficulty
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
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {filteredFlashcards.map((flashcard) => (
        <Card key={flashcard.id} className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardHeader>
            <CardTitle className="text-lg">{flashcard.question}</CardTitle>
          </CardHeader>
          <CardContent>
            {flashcard.category && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 mb-2">
                {flashcard.category}
              </Badge>
            )}
            {flashcard.difficulty && (
              <Badge variant="outline" className={`${getDifficultyColor(flashcard.difficulty)} mb-2`}>
                {flashcard.difficulty}
              </Badge>
            )}
            <p className="text-gray-700 mt-2">{flashcard.answer}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
