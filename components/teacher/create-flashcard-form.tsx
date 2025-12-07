"use client"

import React, { useEffect, useState } from "react"
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

export function CreateFlashcardForm({ onSuccess }: CreateFlashcardFormProps) {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [category, setCategory] = useState("")
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium")
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        // Lấy các lớp mà user là giáo viên (role = 'teacher')
        const { data: cls, error } = await supabase
          .from("class_members")
          .select("class_id, classes(name)")
          .eq("user_id", user.id)
          .eq("role", "teacher")
          .innerJoin("classes", "classes.id", "class_members.class_id") // join để lấy tên lớp nếu cần
        if (error) console.error("fetchClasses error:", error)

        if (cls) {
          const mapped = cls.map((c: any) => ({ id: c.class_id, name: c.classes?.name || "Unnamed Class" }))
          setClasses(mapped)
          if (mapped.length > 0) setSelectedClass(mapped[0].id)
        }
      } catch (err) {
        console.error(err)
      }
    }

    fetchClasses()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) throw new Error(userError.message || "Cannot get user")
      if (!user) throw new Error("You must be logged in to create flashcards")

      const payload = {
        question: question.trim(),
        answer: answer.trim(),
        category: category.trim() || null,
        difficulty,
        created_by: user.id,
        class_id: selectedClass, // <-- gắn flashcard vào lớp nếu có
      }

      const { data: inserted, error: insertError } = await supabase.from("flashcards").insert(payload).select()

      if (insertError) throw new Error(insertError.message || JSON.stringify(insertError))

      // Reset form
      setQuestion("")
      setAnswer("")
      setCategory("")
      setDifficulty("medium")
      if (classes.length > 0) setSelectedClass(classes[0].id)

      onSuccess?.()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : JSON.stringify(err)
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Plus className="w-5 h-5" />
          Create New Flashcard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question" className="text-sm font-medium text-gray-700">
              Question *
            </Label>
            <Textarea
              id="question"
              placeholder="Enter your question here..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
              className="min-h-20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="answer" className="text-sm font-medium text-gray-700">
              Answer *
            </Label>
            <Textarea
              id="answer"
              placeholder="Enter the answer here..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              required
              className="min-h-20"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                Category (Optional)
              </Label>
              <Input
                id="category"
                placeholder="e.g., Mathematics, History"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty" className="text-sm font-medium text-gray-700">
                Difficulty
              </Label>
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

          {classes.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="class" className="text-sm font-medium text-gray-700">
                Assign to Class
              </Label>
              <Select value={selectedClass || ""} onValueChange={(val) => setSelectedClass(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Flashcard
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
