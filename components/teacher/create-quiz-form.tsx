"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { Plus, Loader2 } from "lucide-react"

interface CreateQuizFormProps {
  onSuccess?: () => void
}

export function CreateQuizForm({ onSuccess }: CreateQuizFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // lấy current user (session)
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        console.error("getUser error:", userError)
        throw new Error(userError.message ?? "Could not get user")
      }
      if (!user) {
        throw new Error("You must be logged in to create quizzes")
      }

      // Insert — gửi cả created_by và teacher_id để tương thích với cấu trúc DB của bạn
      // (nếu DB chỉ cần 1 trong 2 thì vẫn ok; gửi cả 2 tránh bị thiếu cột bắt buộc)
      const payload = {
        title: title.trim(),
        description: description.trim(),
        created_by: user.id,  // cột hiện có NOT NULL trong DB của bạn
        teacher_id: user.id,  // cột tồn tại trong DB (nullable) — dùng cho policy nếu cần
      }

      console.debug("Creating quiz with payload:", payload)

      const { data: inserted, error: insertError } = await supabase
        .from("quizzes")
        .insert(payload)
        .select() // trả về row để dễ debug

      if (insertError) {
        // log chi tiết để debug (Network tab có thể cũng show)
        console.error("Insert quiz error (raw):", insertError)
        // convert PostgrestError sang Error để catch xử lý nhất quán
        throw new Error(insertError.message ?? JSON.stringify(insertError))
      }

      console.log("Inserted quiz:", inserted)

      // Reset form
      setTitle("")
      setDescription("")

      onSuccess?.()
    } catch (err: unknown) {
      console.error("Create quiz failed:", err)
      const msg =
        err instanceof Error ? err.message : JSON.stringify(err, Object.getOwnPropertyNames(err))
      setError(msg || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Plus className="w-5 h-5" />
          Create New Quiz
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-gray-700">
              Quiz Title *
            </Label>
            <Input
              id="title"
              placeholder="Enter quiz title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description *
            </Label>
            <Textarea
              id="description"
              placeholder="Describe what this quiz covers..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="min-h-20"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{error}</div>
          )}

          <Button
            type="submit"
            disabled={isLoading || !title.trim() || !description.trim()}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Quiz
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
