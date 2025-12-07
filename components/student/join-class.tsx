"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface JoinClassProps {
  userId: string
  onJoined?: (classId: string) => void
}

export default function JoinClass({ userId, onJoined }: JoinClassProps) {
  const [classId, setClassId] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const supabase = createClient()

  const handleJoin = async () => {
    if (!classId.trim()) {
      setMessage("Vui lòng nhập ID lớp!")
      return
    }

    setLoading(true)
    setMessage("")

    try {
      const { data, error } = await supabase
        .from("class_students")
        .insert([{ class_id: classId.trim(), student_id: userId }])

      if (error) {
        setMessage(`❌ Lỗi: ${error.message}`)
      } else {
        setMessage("✅ Tham gia lớp thành công!")
        onJoined && onJoined(classId.trim())
        setClassId("")
      }
    } catch (err: any) {
      setMessage(`❌ Lỗi: ${err.message || err}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder="Nhập ID lớp"
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
        />
        <Button onClick={handleJoin} disabled={loading}>
          {loading ? "Đang xử lý..." : "Tham Gia"}
        </Button>
      </div>
      {message && (
        <Badge
          variant={message.startsWith("✅") ? "secondary" : "destructive"}
          className="mt-1"
        >
          {message}
        </Badge>
      )}
    </div>
  )
}
