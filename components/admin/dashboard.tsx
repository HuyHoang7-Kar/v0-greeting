"use client"

import React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { LogOut } from "lucide-react"

export function AdminDashboard({ user, profile }) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="flex items-center justify-between bg-white shadow px-6 py-4">
        <h1 className="text-2xl font-bold text-indigo-600">👑 Bảng điều khiển Admin</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {profile.email || user.email}
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-red-500 hover:text-red-700"
          >
            <LogOut size={18} /> Đăng xuất
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-2xl shadow">
        <h2 className="text-xl font-semibold mb-6">Chức năng quản trị</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quản lý tài khoản */}
          <Link
            href="/admin/users"
            className="p-6 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-2xl shadow-sm transition"
          >
            <h3 className="text-lg font-semibold text-indigo-700 mb-2">👥 Quản lý tài khoản</h3>
            <p className="text-sm text-gray-600">
              Tạo, chỉnh sửa hoặc xóa tài khoản người dùng trong hệ thống.
            </p>
          </Link>

          {/* Lịch sử hoạt động */}
          <Link
            href="/admin/activity"
            className="p-6 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-2xl shadow-sm transition"
          >
            <h3 className="text-lg font-semibold text-amber-700 mb-2">📜 Lịch sử hoạt động</h3>
            <p className="text-sm text-gray-600">
              Theo dõi lịch sử đăng nhập và hành động của các tài khoản.
            </p>
          </Link>
        </div>

        <div className="mt-10 text-center text-gray-500 text-sm">
          Hệ thống quản trị © {new Date().getFullYear()}
        </div>
      </main>
    </div>
  )
}
