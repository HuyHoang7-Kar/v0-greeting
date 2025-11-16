'use client'

import { useEffect, useState } from 'react'

interface UserProfile {
  id: string
  full_name: string
  role: string
  created_at: string
  updated_at: string
}

export default function ActiveUser() {
  const [users, setUsers] = useState<UserProfile[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/admin/profiles')
        const json = await res.json()
        if (res.ok) {
          setUsers(json.profiles ?? [])
        } else {
          console.error("API error:", json.error)
          setUsers([])
        }
      } catch (err) {
        console.error("Fetch error:", err)
        setUsers([])
      } finally {
        setLoading(false)
      }
    }

    fetchProfiles()
  }, [])

  if (loading) return <div>Đang tải dữ liệu...</div>
  if (!users || users.length === 0) return <div>Hiện chưa có profile nào.</div>

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">📜 Thông tin người dùng</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-3 py-1">Họ và Tên</th>
            <th className="border px-3 py-1">Role</th>
            <th className="border px-3 py-1">Ngày tạo</th>
            <th className="border px-3 py-1">Cập nhật lần cuối</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="border px-3 py-1">{user.full_name}</td>
              <td className="border px-3 py-1">{user.role}</td>
              <td className="border px-3 py-1">{new Date(user.created_at).toLocaleString()}</td>
              <td className="border px-3 py-1">{new Date(user.updated_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
