"use client";
import { useState } from "react";
import UserList from "@/components/admin/UserList";
import ActivityLog from "@/components/admin/ActivityLog";

export default function AdminPage() {
  const [tab, setTab] = useState<"users" | "logs">("users");

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🛠️ Trang quản trị</h1>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setTab("users")}
          className={`px-4 py-2 rounded ${
            tab === "users" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          👥 Quản lý người dùng
        </button>
        <button
          onClick={() => setTab("logs")}
          className={`px-4 py-2 rounded ${
            tab === "logs" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          📜 Lịch sử hoạt động
        </button>
      </div>

      <div className="border rounded-lg p-4 bg-white shadow">
        {tab === "users" ? <UserList /> : <ActivityLog />}
      </div>
    </div>
  );
}
