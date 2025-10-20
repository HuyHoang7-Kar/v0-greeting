"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

export default function UserList() {
  const supabase = createClient(); // ✅ tạo instance client đúng cách
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, role, created_at")
        .order("created_at", { ascending: false });

      if (error) console.error("❌ Lỗi lấy danh sách:", error.message);
      else setUsers(data || []);
      setLoading(false);
    }
    fetchUsers();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">👥 Quản lý người dùng</h2>
      {loading ? (
        <p>⏳ Đang tải...</p>
      ) : users.length === 0 ? (
        <p>⚠️ Không có người dùng nào.</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Email</th>
              <th className="border p-2">Vai trò</th>
              <th className="border p-2">Ngày tạo</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="border p-2">{u.email}</td>
                <td className="border p-2">{u.role}</td>
                <td className="border p-2">
                  {new Date(u.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
