"use client";

import { useState, Suspense } from "react";
import dynamic from "next/dynamic";

// ✅ Dùng dynamic import để tránh lỗi SSR khi có Supabase hoặc useEffect
const UserList = dynamic(() => import("@/components/admin/UserList"), {
  ssr: false,
  loading: () => <p>⏳ Đang tải danh sách người dùng...</p>,
});

const ActivityLog = dynamic(() => import("@/components/admin/ActivityLog"), {
  ssr: false,
  loading: () => <p>⏳ Đang tải lịch sử hoạt động...</p>,
});

// 🧩 Export theo tên để có thể import { AdminDashboard }
export function AdminDashboard() {
  const [tab, setTab] = useState<"users" | "logs">("users");

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
          🛠️ Trang quản trị
        </h1>

        {/* Thanh chọn tab */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setTab("users")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              tab === "users"
                ? "bg-blue-600 text-white shadow"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            👥 Quản lý người dùng
          </button>

          <button
            onClick={() => setTab("logs")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              tab === "logs"
                ? "bg-blue-600 text-white shadow"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            📜 Lịch sử hoạt động
          </button>
        </div>

        {/* Nội dung từng tab */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <Suspense fallback={<p>🔄 Đang tải nội dung...</p>}>
            {tab === "users" ? <UserList /> : <ActivityLog />}
          </Suspense>
        </div>
      </div>
    </main>
  );
}
