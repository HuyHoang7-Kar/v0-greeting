"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { Plus, Loader2 } from "lucide-react"

interface CreateFlashcardFormProps {
  onSuccess?: () => void
}

interface ClassOption {
  id: string
  name: string
}

export function CreateFlashcardForm({ onSuccess }: CreateFlashcardFormProps) {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [category, setCategory] = useState("")
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium")
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [classes, setClasses] = useState<ClassOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  // Load classes created by this teacher
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
          .from("classes")
          .select("id, name")
          .eq("teacher_id", user.id) // dùng teacher_id
          .order("name")

        if (error) throw error
        setClasses(data || [])
      } catch (err: any) {
        console.error("Error fetching classes:", err)
        setError(err.message || JSON.stringify(err))
      }
    }
    fetchClasses()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClass) {
      setError("Bạn phải chọn lớp")
      return
    }
    setIsLoading(true)
    setError(null)

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!user) throw new Error("Bạn phải đăng nhập")

      const payload = {
        question: question.trim(),
        answer: answer.trim(),
        category: category.trim() || null,
        difficulty,
        class_id: selectedClass,
        created_by: user.id,
      }

      const { error: insertError } = await supabase.from("flashcards").insert(payload)
      if (insertError) throw insertError

      // Reset form
      setQuestion("")
      setAnswer("")
      setCategory("")
      setDifficulty("medium")
      setSelectedClass("")
      onSuccess?.()
    } catch (err: any) {
      console.error("Create flashcard failed:", err)
      setError(err.message || JSON.stringify(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Plus className="w-5 h-5" /> Create New Flashcard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question">Question *</Label>
            <Textarea
              id="question"
              placeholder="Enter your question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
              className="min-h-20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="answer">Answer *</Label>
            <Textarea
              id="answer"
              placeholder="Enter the answer..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              required
              className="min-h-20"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category (Optional)</Label>
              <Input
                id="category"
                placeholder="e.g., Mathematics, History"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="class">Class *</Label>
              <Select
                value={selectedClass}
                onValueChange={(v) => setSelectedClass(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={difficulty} onValueChange={(value: "easy" | "medium" | "hard") => setDifficulty(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{error}</div>
          )}

          <Button
            type="submit"
            disabled={isLoading || !question.trim() || !answer.trim()}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" /> Create Flashcard
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
