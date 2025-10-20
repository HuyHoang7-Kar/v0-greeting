"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🧩 Load danh sách user khi vào trang
  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, role, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err: any) {
      console.error("❌ Lỗi lấy danh sách người dùng:", err);
      setError("Không thể tải danh sách người dùng!");
    } finally {
      setLoading(false);
    }
  }

  async function deleteUser(id: string) {
    if (!confirm("⚠️ Bạn có chắc muốn xóa tài khoản này?")) return;

    try {
      const { error } = await supabase.from("profiles").delete().eq("id", id);
      if (error) throw error;
      alert("🗑️ Đã xóa người dùng!");
      fetchUsers();
    } catch (err: any) {
      alert("❌ Lỗi xóa người dùng: " + err.message);
    }
  }

  async function createUser() {
    if (!newEmail || !newPassword)
      return alert("⚠️ Vui lòng nhập email và mật khẩu!");

    try {
      setLoading(true);
      setError(null);

      // 1️⃣ Tạo tài khoản Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: newEmail,
        password: newPassword,
      });

      if (error) throw error;
      if (!data?.user) throw new Error("Không nhận được thông tin người dùng.");

      // 2️⃣ Thêm thông tin vào bảng profiles
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        email: newEmail,
        role: newRole,
        created_at: new Date().toISOString(),
      });

      if (profileError) throw profileError;

      alert("✅ Tạo tài khoản thành công!");
      setNewEmail("");
      setNewPassword("");
      fetchUsers();
    } catch (err: any) {
      console.error("❌ Lỗi tạo người dùng:", err);
      alert("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">👥 Quản lý tài khoản</h2>

      <div className="flex flex-wrap gap-2 mb-4">
        <input
          className="border p-2 rounded"
          placeholder="Email mới"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
        />
        <input
          className="border p-2 rounded"
          placeholder="Mật khẩu"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <select
          className="border p-2 rounded"
          value={newRole}
          onChange={(e) => setNewRole(e.target.value)}
        >
          <option value="student">Học sinh</option>
          <option value="teacher">Giáo viên</option>
          <option value="admin">Admin</option>
        </select>
        <button
          disabled={loading}
          className={`${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          } text-white px-4 rounded`}
          onClick={createUser}
        >
          {loading ? "⏳ Đang tạo..." : "➕ Tạo"}
        </button>
      </div>

      {error && <p className="text-red-500 mb-3">{error}</p>}

      {loading && users.length === 0 ? (
        <p>⏳ Đang tải danh sách...</p>
      ) : users.length === 0 ? (
        <p className="italic text-gray-500">Chưa có người dùng nào.</p>
      ) : (
        <table className="w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Vai trò</th>
              <th className="p-2 border">Ngày tạo</th>
              <th className="p-2 border">Xóa</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="border p-2">{u.email}</td>
                <td className="border p-2 capitalize">{u.role}</td>
                <td className="border p-2">
                  {new Date(u.created_at).toLocaleString("vi-VN")}
                </td>
                <td className="border p-2 text-center">
                  <button
                    className="text-red-500 hover:underline"
                    onClick={() => deleteUser(u.id)}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
