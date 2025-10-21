"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface LoginRecord {
  id: string
  user_id: string
  email: string
  login_at: string
}

export default function ActiveUser() {
  const supabase = createClientComponentClient()
  const [logins, setLogins] = useState<LoginRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLogins = async () => {
      try {
        const { data, error } = await supabase
          .from("login_history")
          .select("*")
          .order("login_at", { ascending: false })
          .limit(50) // lấy 50 bản ghi gần nhất

        if (error) {
          console.error("Lỗi lấy lịch sử đăng nhập:", error.message)
        } else if (data) {
          setLogins(data)
        }
      } catch (err) {
        console.error("Lỗi fetch login history:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchLogins()
  }, [])

  if (loading) return <div>Loading...</div>
  if (!logins.length) return <div>Chưa có dữ liệu lịch sử đăng nhập nào.</div>

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">📜 Lịch sử đăng nhập</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-3 py-1">Email</th>
            <th className="border px-3 py-1">User ID</th>
            <th className="border px-3 py-1">Login At</th>
          </tr>
        </thead>
        <tbody>
          {logins.map((login) => (
            <tr key={login.id}>
              <td className="border px-3 py-1">{login.email}</td>
              <td className="border px-3 py-1">{login.user_id}</td>
              <td className="border px-3 py-1">
                {new Date(login.login_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
