"use client"

import { Flashcard } from "@/components/student/flashcard"

interface FlashcardData {
  id: string
  question: string
  answer: string
  category?: string
  difficulty?: "easy" | "medium" | "hard"
}

interface FlashcardGridProps {
  flashcards: FlashcardData[]
  className?: string
}

export function FlashcardGrid({ flashcards, className }: FlashcardGridProps) {
  if (flashcards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No flashcards available yet.</p>
        <p className="text-gray-400 text-sm mt-2">Check back later or ask your teacher to add some!</p>
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {flashcards.map((flashcard) => (
        <Flashcard
          key={flashcard.id}
          id={flashcard.id}
          question={flashcard.question}
          answer={flashcard.answer}
          category={flashcard.category}
          difficulty={flashcard.difficulty}
        />
      ))}
    </div>
  )
}
