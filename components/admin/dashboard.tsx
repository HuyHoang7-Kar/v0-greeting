"use client";

import { useState, Suspense } from "react";
import dynamic from "next/dynamic";

// ✅ Dùng dynamic import để tránh lỗi khi component con dùng Supabase hoặc hook
const UserList = dynamic(() => import("@/components/admin/UserList"), {
  ssr: false,
  loading: () => <p>⏳ Đang tải danh sách người dùng...</p>,
});
const ActivityLog = dynamic(() => import("@/components/admin/ActivityLog"), {
  ssr: false,
  loading: () => <p>⏳ Đang tải lịch sử hoạt động...</p>,
});

export default function AdminPage() {
  const [tab, setTab] = useState<"users" | "logs">("users");

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🛠️ Trang quản trị</h1>

      {/* Thanh chọn tab */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setTab("users")}
          className={`px-4 py-2 rounded transition ${
            tab === "users"
              ? "bg-blue-600 text-white shadow"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          👥 Quản lý người dùng
        </button>
        <button
          onClick={() => setTab("logs")}
          className={`px-4 py-2 rounded transition ${
            tab === "logs"
              ? "bg-blue-600 text-white shadow"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          📜 Lịch sử hoạt động
        </button>
      </div>

      {/* Nội dung từng tab */}
      <div className="border rounded-lg p-4 bg-white shadow">
        <Suspense fallback={<p>🔄 Đang tải nội dung...</p>}>
          {tab === "users" ? <UserList /> : <ActivityLog />}
        </Suspense>
      </div>
    </div>
  );
}
