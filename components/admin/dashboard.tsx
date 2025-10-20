"use client"

import React, { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { UserList } from "./UserList"
import { ActivityLog } from "./ActivityLog"

export function AdminDashboard({ user, profile }) {
  const router = useRouter()
  const supabase = createClient()
  const [view, setView] = useState<"users" | "logs">("users")

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="flex items-center justify-between bg-white shadow px-6 py-4">
        <h1 className="text-2xl font-bold text-indigo-600">👑 Bảng điều khiển Admin</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{profile.email || user.email}</span>
          <button
            onClick={handleLogout}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Đăng xuất
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto mt-8 p-6 bg-white rounded-2xl shadow">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setView("users")}
            className={`px-4 py-2 rounded-lg font-medium ${
              view === "users"
                ? "bg-indigo-500 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            👥 Quản lý tài khoản
          </button>

          <button
            onClick={() => setView("logs")}
            className={`px-4 py-2 rounded-lg font-medium ${
              view === "logs"
                ? "bg-amber-500 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            📜 Lịch sử hoạt động
          </button>
        </div>

        {/* Hiển thị component tương ứng */}
        {view === "users" ? <UserList /> : <ActivityLog />}
      </main>
    </div>
  )
}
