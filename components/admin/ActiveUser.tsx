'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UserProfile {
  id: string
  full_name: string
  role: string
  email: string | null
  created_at: string
  updated_at: string
}

interface QuizResult {
  id: string
  quiz_id: string
  score: number
  total_questions: number
  completed_at: string
}

interface GamePlay {
  id: string
  game_id: string
  score: number
  played_at: string
}

export default function ActiveUser() {
  const supabase = createClient()
  const [users, setUsers] = useState<UserProfile[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [quizResults, setQuizResults] = useState<QuizResult[]>([])
  const [gamePlays, setGamePlays] = useState<GamePlay[]>([])
  const [activityLoading, setActivityLoading] = useState(false)

  // Lấy danh sách người dùng
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const { data, error } = await supabase
          .from<UserProfile>('profiles')
          .select('id, full_name, role, email, created_at, updated_at')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Lỗi fetch profiles:', error.message)
          setUsers([])
        } else {
          setUsers(data ?? [])
        }
      } catch (err) {
        console.error('Lỗi fetch:', err)
        setUsers([])
      } finally {
        setLoading(false)
      }
    }

    fetchProfiles()
  }, [])

  // Khi chọn user, fetch lịch sử hoạt động
  const handleSelectUser = async (user: UserProfile) => {
    setSelectedUser(user)
    setActivityLoading(true)
    try {
      // Quiz results
      const { data: resultsData, error: resultsError } = await supabase
        .from<QuizResult>('results')
        .select('id, quiz_id, score, total_questions, completed_at')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })

      if (resultsError) throw resultsError
      setQuizResults(resultsData ?? [])

      // Game plays
      const { data: gameData, error: gameError } = await supabase
        .from<GamePlay>('game_plays')
        .select('id, game_id, score, played_at')
        .eq('user_id', user.id)
        .order('played_at', { ascending: false })

      if (gameError) throw gameError
      setGamePlays(gameData ?? [])
    } catch (err) {
      console.error('Lỗi fetch activity:', err)
      setQuizResults([])
      setGamePlays([])
    } finally {
      setActivityLoading(false)
    }
  }

  if (loading) return <div>Đang tải dữ liệu...</div>
  if (!users || users.length === 0) return <div>Hiện chưa có profile nào.</div>

  return (
    <div className="overflow-x-auto">
      <h2 className="text-lg font-semibold mb-4">📜 Danh sách người dùng</h2>

      <table className="w-full border-collapse border border-gray-300 mb-6">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-3 py-2">Email</th>
            <th className="border px-3 py-2">Họ và Tên</th>
            <th className="border px-3 py-2">Role</th>
            <th className="border px-3 py-2">Ngày tạo</th>
            <th className="border px-3 py-2">Cập nhật lần cuối</th>
            <th className="border px-3 py-2">Xem hoạt động</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="border px-3 py-2">{user.email ?? '—'}</td>
              <td className="border px-3 py-2">{user.full_name}</td>
              <td className="border px-3 py-2">{user.role}</td>
              <td className="border px-3 py-2">{new Date(user.created_at).toLocaleString()}</td>
              <td className="border px-3 py-2">{new Date(user.updated_at).toLocaleString()}</td>
              <td className="border px-3 py-2">
                <button
                  className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => handleSelectUser(user)}
                >
                  Xem
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedUser && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">📊 Lịch sử hoạt động: {selectedUser.full_name}</h3>

          {activityLoading ? (
            <div>Đang tải hoạt động...</div>
          ) : (
            <>
              <h4 className="font-medium mt-2">Quiz đã làm</h4>
              {quizResults.length === 0 ? (
                <p>Chưa có quiz nào.</p>
              ) : (
                <table className="w-full border-collapse border border-gray-300 mb-4">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-3 py-2">Quiz ID</th>
                      <th className="border px-3 py-2">Điểm</th>
                      <th className="border px-3 py-2">Tổng câu hỏi</th>
                      <th className="border px-3 py-2">Ngày hoàn thành</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quizResults.map((q) => (
                      <tr key={q.id}>
                        <td className="border px-3 py-2">{q.quiz_id}</td>
                        <td className="border px-3 py-2">{q.score}</td>
                        <td className="border px-3 py-2">{q.total_questions}</td>
                        <td className="border px-3 py-2">{new Date(q.completed_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <h4 className="font-medium mt-2">Game đã chơi</h4>
              {gamePlays.length === 0 ? (
                <p>Chưa có game nào.</p>
              ) : (
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-3 py-2">Game ID</th>
                      <th className="border px-3 py-2">Điểm</th>
                      <th className="border px-3 py-2">Ngày chơi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gamePlays.map((g) => (
                      <tr key={g.id}>
                        <td className="border px-3 py-2">{g.game_id}</td>
                        <td className="border px-3 py-2">{g.score}</td>
                        <td className="border px-3 py-2">{new Date(g.played_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
