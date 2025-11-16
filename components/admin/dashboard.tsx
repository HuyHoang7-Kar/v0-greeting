"use client"

import React, { useEffect, useState } from "react"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import ActiveUser from "./ActiveUser" // component hiển thị lịch sử hoạt động

interface UserProfile {
  id: string
  email: string
  role: string
  created_at: string
  updated_at: string
}

export default function AdminDashboard({ user, profile }: { user: any; profile: any }) {
  const router = useRouter()
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState<"users" | "activity">("users")
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch users + profiles
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select(`
            id,
            role,
            created_at,
            updated_at,
            auth:auth_users(email)
          `)

        if (error) console.error("Lỗi fetch profiles:", error.message)
        else if (data) {
          const mapped = data.map((row: any) => ({
            id: row.id,
            email: row.auth?.email ?? "N/A",
            role: row.role,
            created_at: row.created_at,
            updated_at: row.updated_at,
          }))
          setUsers(mapped)
        }
      } catch (err) {
        console.error("Lỗi fetch:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const renderUsersTable = () => {
    if (loading) return <div>Loading...</div>
    if (!users.length) return <div>Chưa có dữ liệu user nào.</div>

    return (
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
          {users.map((u) => (
            <tr key={u.id}>
              <td className="border px-3 py-1">{u.email}</td>
              <td className="border px-3 py-1">{u.role}</td>
              <td className="border px-3 py-1">{new Date(u.created_at).toLocaleString()}</td>
              <td className="border px-3 py-1">{new Date(u.updated_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="flex items-center justify-between bg-white shadow px-6 py-4">
        <h1 className="text-2xl font-bold text-indigo-600">👑 Bảng điều khiển Admin</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{profile?.email || user?.email}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-red-500 hover:text-red-700"
          >
            <LogOut size={18} /> Đăng xuất
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto mt-8 p-6 bg-white rounded-2xl shadow">
        <h2 className="text-xl font-semibold mb-6">Chức năng quản trị</h2>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-xl font-medium ${
              activeTab === "users"
                ? "bg-indigo-600 text-white"
                : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
            }`}
          >
            👥 Quản lý tài khoản
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`px-4 py-2 rounded-xl font-medium ${
              activeTab === "activity"
                ? "bg-amber-600 text-white"
                : "bg-amber-50 text-amber-700 hover:bg-amber-100"
            }`}
          >
            📜 Lịch sử hoạt động
          </button>
        </div>

        {/* Nội dung tab */}
        <div>{activeTab === "users" ? renderUsersTable() : <ActiveUser />}</div>

        <div className="mt-10 text-center text-gray-500 text-sm">
          Hệ thống quản trị © {new Date().getFullYear()}
        </div>
      </main>
    </div>
  )
}
