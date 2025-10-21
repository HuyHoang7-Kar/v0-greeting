"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface UserProfile {
  id: string
  email: string
  role: string
  created_at: string
  updated_at: string
}

export default function ActiveUser() {
  const supabase = createClientComponentClient()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, email, role, created_at, updated_at")
          .order("created_at", { ascending: false })

        if (error) console.error("Lỗi fetch profiles:", error.message)
        else if (data) setUsers(data)
      } catch (err) {
        console.error("Lỗi fetch:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfiles()
  }, [])

  console.log(users) // debug dữ liệu

  if (loading) return <div>Loading...</div>
  if (!users.length) return <div>Chưa có dữ liệu profile nào.</div>

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">📜 Thông tin người dùng</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-3 py-1">Email</th>
            <th className="border px-3 py-1">Role</th>
            <th className="border px-3 py-1">Created At</th>
            <th className="border px-3 py-1">Updated At</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="border px-3 py-1">{user.email}</td>
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
