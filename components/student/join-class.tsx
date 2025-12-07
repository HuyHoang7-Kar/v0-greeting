"use client"

import { useState, useEffect } from "react"
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

  const supabase = createClientComponentClient()

  const handleJoin = async () => {
    if (!classId.trim()) return setMessage("Vui lòng nhập ID lớp!")
    setLoading(true)
    setMessage("")

    try {
      // Thêm học sinh vào class_members
      const { data, error } = await supabase
        .from("class_members")
        .insert({ class_id: classId.trim(), user_id: userId, role: "student" })

      if (error) {
        setMessage(`❌ Lỗi: ${error.message}`)
      } else {
        setMessage("✅ Tham gia lớp thành công!")
        onJoined && onJoined(classId.trim())
        setClassId("")
      }
    } catch (err: any) {
      setMessage(`❌ Lỗi: ${err.message || "Không xác định"}`)
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
