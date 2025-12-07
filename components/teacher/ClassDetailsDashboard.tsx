"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { BarChart3, Users, BookOpen, Brain } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

export default function ClassDetailsDashboard() {
  const params = useParams()
  const classId = params.id as string

  const [cls, setCls] = useState<any>(null)
  const [students, setStudents] = useState<any[]>([])
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const supabase = createClient()

    const { data: classData } = await supabase
      .from("classes")
      .select("*")
      .eq("id", classId)
      .single()

    const { data: studentData } = await supabase
      .from("class_students")
      .select("*, profiles(*)")
      .eq("class_id", classId)

    const { data: quizData } = await supabase
      .from("quizzes")
      .select("*")
      .eq("class_id", classId)

    const { data: resultData } = await supabase
      .from("results")
      .select("*")
      .eq("class_id", classId)

    setCls(classData)
    setStudents(studentData || [])
    setQuizzes(quizData || [])
    setResults(resultData || [])
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Đang tải dữ liệu lớp học...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Class Info */}
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="text-3xl">{cls.name}</CardTitle>
            <CardDescription>{cls.description}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            Ngày tạo: {new Date(cls.created_at).toLocaleDateString()}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white border">
            <TabsTrigger value="overview"><BookOpen className="w-4 h-4" /> Tổng Quan</TabsTrigger>
            <TabsTrigger value="students"><Users className="w-4 h-4" /> Học Sinh</TabsTrigger>
            <TabsTrigger value="quizzes"><Brain className="w-4 h-4" /> Bài Kiểm Tra</TabsTrigger>
            <TabsTrigger value="analytics"><BarChart3 className="w-4 h-4" /> Phân Tích</TabsTrigger>
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview">
            <Card className="border-2 border-yellow-200">
              <CardHeader>
                <CardTitle>Tổng Quan Lớp</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">

                <Card className="border p-4 text-center">
                  <h3 className="text-xl font-bold">{students.length}</h3>
                  <p className="text-sm text-gray-600">Học sinh</p>
                </Card>

                <Card className="border p-4 text-center">
                  <h3 className="text-xl font-bold">{quizzes.length}</h3>
                  <p className="text-sm text-gray-600">Bài kiểm tra</p>
                </Card>

                <Card className="border p-4 text-center">
                  <h3 className="text-xl font-bold">{results.length}</h3>
                  <p className="text-sm text-gray-600">Lượt làm bài</p>
                </Card>

              </CardContent>
            </Card>
          </TabsContent>

          {/* STUDENTS */}
          <TabsContent value="students">
            <Card className="border-2 border-green-200">
              <CardHeader>
                <CardTitle>Danh Sách Học Sinh</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {students.map((s) => (
                    <li key={s.id} className="p-3 border rounded bg-white flex justify-between">
                      <span>{s.profiles.full_name || s.profiles.email}</span>
                      <span className="text-sm text-gray-600">
                        Lượt làm bài: {results.filter(r => r.user_id === s.profiles.id).length}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* QUIZZES */}
          <TabsContent value="quizzes">
            <Card className="border-2 border-purple-200">
              <CardHeader>
                <CardTitle>Bài Kiểm Tra Trong Lớp</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {quizzes.map((q) => (
                    <li key={q.id} className="p-4 border rounded bg-white">
                      <div className="font-semibold">{q.title}</div>
                      <div className="text-sm text-gray-600">
                        Tổng lượt làm: {results.filter(r => r.quiz_id === q.id).length}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ANALYTICS */}
          <TabsContent value="analytics">
            <Card className="border-2 border-indigo-200">
              <CardHeader>
                <CardTitle>Phân Tích Điểm</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={results}>
                      <XAxis dataKey="user_id" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="score" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  )
}
