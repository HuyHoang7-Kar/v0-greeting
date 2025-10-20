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

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, role, created_at")
      .order("created_at", { ascending: false });

    if (error) console.error("❌ Lỗi lấy danh sách:", error);
    else setUsers(data || []);
  }

  async function deleteUser(id: string) {
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) alert("❌ Lỗi xóa người dùng: " + error.message);
    else fetchUsers();
  }

  async function createUser() {
    if (!newEmail || !newPassword)
      return alert("⚠️ Vui lòng nhập email và mật khẩu!");

    // 1️⃣ Tạo tài khoản Supabase auth
    const { data, error } = await supabase.auth.signUp({
      email: newEmail,
      password: newPassword,
    });

    if (error) {
      alert("❌ Lỗi tạo tài khoản: " + error.message);
      return;
    }

    // 2️⃣ Thêm thông tin vào bảng profiles
    const user = data.user;
    if (user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: user.id,
        email: newEmail,
        role: newRole,
        created_at: new Date().toISOString(),
      });

      if (profileError) {
        alert("⚠️ Lỗi khi thêm profile: " + profileError.message);
      } else {
        alert("✅ Tạo tài khoản thành công!");
        setNewEmail("");
        setNewPassword("");
        fetchUsers();
      }
    }
  }

  return (
    <div>
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
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 rounded"
          onClick={createUser}
        >
          ➕ Tạo
        </button>
      </div>

      <table className="w-full border">
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
            <tr key={u.id}>
              <td className="border p-2">{u.email}</td>
              <td className="border p-2">{u.role}</td>
              <td className="border p-2">
                {new Date(u.created_at).toLocaleString()}
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
    </div>
  );
}
