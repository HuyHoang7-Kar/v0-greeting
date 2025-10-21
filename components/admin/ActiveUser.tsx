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
      const { data, error } = await supabase
        .from("login_history")
        .select("*")
        .order("login_at", { ascending: false })
        .limit(50) // lấy 50 bản ghi gần nhất

      if (error) {
        console.error("Error fetching login history:", error)
      } else {
        setLogins(data)
      }
      setLoading(false)
    }

    fetchLogins()
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h2>Login History</h2>
      <table border={1} cellPadding={8}>
        <thead>
          <tr>
            <th>Email</th>
            <th>User ID</th>
            <th>Login At</th>
          </tr>
        </thead>
        <tbody>
          {logins.map((login) => (
            <tr key={login.id}>
              <td>{login.email}</td>
              <td>{login.user_id}</td>
              <td>{new Date(login.login_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
