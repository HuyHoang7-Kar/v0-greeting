"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase/client"
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

  const handleJoin = async () => {
    if (!classId) return setMessage("Vui lòng nhập ID lớp!")
    setLoading(true)
    setMessage("")

    const { data, error } = await supabase
      .from("class_members")
      .insert([{ class_id: classId, user_id: userId, role: "student" }])

    if (error) {
      setMessage(`❌ Lỗi: ${error.message}`)
    } else {
      setMessage("✅ Tham gia lớp thành công!")
      onJoined && onJoined(classId)
      setClassId("")
    }

    setLoading(false)
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
        <Badge variant={message.startsWith("✅") ? "secondary" : "destructive"} className="mt-1">
          {message}
        </Badge>
      )}
    </div>
  )
}
