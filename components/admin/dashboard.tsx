"use client"

import React, { useState } from "react"
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from "@/lib/supabase/client"
import ActiveUser from "./ActiveUser"
import UserManagement from "./UserManagement"

export function AdminDashboard({ user, profile }: { user: any; profile: any }) {
  const router = useRouter()
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState<"users" | "activity">("users")

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const renderContent = () => {
    switch (activeTab) {
      case "users":
        return <UserManagement />
      case "activity":
        return <ActiveUser />
      default:
        return null
    }
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
        <div>{renderContent()}</div>

        <div className="mt-10 text-center text-gray-500 text-sm">
          Hệ thống quản trị © {new Date().getFullYear()}
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard
