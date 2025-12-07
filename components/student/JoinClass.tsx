"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Class {
  id: string
  name: string
  description?: string
  teacher_id: string
  created_at: string
}

interface JoinClassProps {
  supabase: any
  userId: string
}

export function JoinClass({ supabase, userId }: JoinClassProps) {
  const [classes, setClasses] = useState<Class[]>([])
  const [joinedClasses, setJoinedClasses] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadClasses()
  }, [])

  const loadClasses = async () => {
    setLoading(true)
    try {
      const { data: classesData } = await supabase.from("classes").select("*").order("created_at", { ascending: false })
      const { data: joinedData } = await supabase.from("class_members").select("class_id").eq("user_id", userId)

      setClasses(classesData || [])
      setJoinedClasses(joinedData?.map((c) => c.class_id) || [])
    } catch (error) {
      console.error("❌ Lỗi load classes:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async (classId: string) => {
    try {
      await supabase.from("class_members").insert({ class_id: classId, user_id: userId, role: "student" })
      setJoinedClasses([...joinedClasses, classId])
    } catch (error) {
      console.error("❌ Lỗi tham gia lớp:", error)
    }
  }

  if (loading) return <p>Đang tải lớp học...</p>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {classes.map((cls) => {
        const joined = joinedClasses.includes(cls.id)
        return (
          <Card key={cls.id} className="border-2 border-green-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{cls.name}</CardTitle>
              <CardDescription>{cls.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Ngày tạo: {new Date(cls.created_at).toLocaleDateString()}</span>
              {joined ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800">Đã tham gia</Badge>
              ) : (
                <Button size="sm" onClick={() => handleJoin(cls.id)}>Tham Gia</Button>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
