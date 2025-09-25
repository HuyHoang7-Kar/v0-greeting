"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { Edit, Trash2, Save, X, BookOpen } from "lucide-react"

interface Flashcard {
  id: string
  question: string
  answer: string
  category?: string
  difficulty: "easy" | "medium" | "hard"
  created_at: string
}

interface TeacherFlashcardsProps {
  flashcards: Flashcard[]
  onFlashcardsChange: () => void
}

export function TeacherFlashcards({ flashcards, onFlashcardsChange }: TeacherFlashcardsProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState({
    question: "",
    answer: "",
    category: "",
    difficulty: "medium" as "easy" | "medium" | "hard",
  })
  const [isLoading, setIsLoading] = useState(false)

  const getDifficultyColor = (difficulty: string) => {
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

  const startEditing = (flashcard: Flashcard) => {
    setEditingId(flashcard.id)
    setEditData({
      question: flashcard.question,
      answer: flashcard.answer,
      category: flashcard.category || "",
      difficulty: flashcard.difficulty,
    })
  }

  const handleUpdate = async (id: string) => {
    if (!editData.question.trim() || !editData.answer.trim()) return

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("flashcards")
        .update({
          question: editData.question.trim(),
          answer: editData.answer.trim(),
          category: editData.category.trim() || null,
          difficulty: editData.difficulty,
        })
        .eq("id", id)

      if (!error) {
        setEditingId(null)
        onFlashcardsChange()
      }
    } catch (error) {
      console.error("Error updating flashcard:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this flashcard?")) return

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("flashcards").delete().eq("id", id)

      if (!error) {
        onFlashcardsChange()
      }
    } catch (error) {
      console.error("Error deleting flashcard:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {flashcards.length === 0 ? (
        <Card className="border-2 border-gray-200">
          <CardContent className="p-12 text-center">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No flashcards created yet</p>
            <p className="text-gray-400 text-sm mt-2">Create your first flashcard to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flashcards.map((flashcard) => (
            <Card key={flashcard.id} className="border-2 border-yellow-200 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {editingId === flashcard.id ? (
                      <Textarea
                        value={editData.question}
                        onChange={(e) => setEditData({ ...editData, question: e.target.value })}
                        className="font-semibold mb-2 min-h-16"
                        placeholder="Question..."
                      />
                    ) : (
                      <CardTitle className="text-lg text-gray-900 text-balance mb-2">{flashcard.question}</CardTitle>
                    )}
                  </div>
                  <div className="flex gap-1 ml-2">
                    {editingId === flashcard.id ? (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleUpdate(flashcard.id)}
                          disabled={isLoading}
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => startEditing(flashcard)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(flashcard.id)}
                          disabled={isLoading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {editingId === flashcard.id ? (
                    <>
                      <Input
                        value={editData.category}
                        onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                        placeholder="Category"
                        className="flex-1"
                      />
                      <Select
                        value={editData.difficulty}
                        onValueChange={(value: "easy" | "medium" | "hard") =>
                          setEditData({ ...editData, difficulty: value })
                        }
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </>
                  ) : (
                    <>
                      {flashcard.category && (
                        <Badge variant="secondary" className="bg-yellow-200 text-yellow-800 border-yellow-300">
                          {flashcard.category}
                        </Badge>
                      )}
                      <Badge variant="outline" className={getDifficultyColor(flashcard.difficulty)}>
                        {flashcard.difficulty}
                      </Badge>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {editingId === flashcard.id ? (
                  <Textarea
                    value={editData.answer}
                    onChange={(e) => setEditData({ ...editData, answer: e.target.value })}
                    placeholder="Answer..."
                    className="min-h-20"
                  />
                ) : (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Answer:</p>
                    <p className="text-gray-900 text-sm leading-relaxed text-pretty">
                      {flashcard.answer.length > 100 ? `${flashcard.answer.substring(0, 100)}...` : flashcard.answer}
                    </p>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-3">
                  {editingId === flashcard.id
                    ? "Editing..."
                    : `Created ${new Date(flashcard.created_at).toLocaleDateString()}`}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
