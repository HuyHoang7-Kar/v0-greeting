"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface Props {
  onSuccess: () => void
}

export function CreateClassForm({ onSuccess }: Props) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    try {
      const supabase = createClient()
      const user = supabase.auth.getUser() // lấy user hiện tại

      const { data: userData, error: userError } = await (await user).data
      if (userError) throw userError

      const userId = (await user).data.user?.id
      if (!userId) throw new Error("Không lấy được ID giáo viên")

      const { error } = await supabase.from("classes").insert({
        name,
        description,
        teacher_id: userId
      })

      if (error) throw error

      setName("")
      setDescription("")
      onSuccess()
    } catch (error) {
      console.error("Error creating class:", error)
      alert("Tạo lớp thất bại, thử lại!")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded-md bg-white shadow-sm">
      <Input
        placeholder="Tên lớp học"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <Textarea
        placeholder="Mô tả lớp học"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Button type="submit" disabled={loading}>
        {loading ? "Đang tạo..." : "Tạo Lớp"}
      </Button>
    </form>
  )
}
