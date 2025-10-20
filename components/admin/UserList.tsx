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
  const [creating, setCreating] = useState(false);

  // 🧠 Lấy danh sách users
  async function fetchUsers() {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, role, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Lỗi khi tải danh sách:", error.message);
      setUsers([]);
    } else setUsers(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🧠 Xóa user
  async function deleteUser(id: string) {
    if (!confirm("Bạn có chắc muốn xóa người dùng này không?")) return;

    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) alert("❌ Lỗi khi xóa người dùng: " + error.message);
    else fetchUsers();
  }

  // 🧠 Tạo user mới
  async function createUser() {
    if (!newEmail || !newPassword) {
      alert("⚠️ Nhập email và mật khẩu!");
      return;
    }

    setCreating(true);

    // Đăng ký tài khoản mới
    const { data: signUpData, error: signUpError } =
      await supabase.auth.signUp({
        email: newEmail,
        password: newPassword,
      });

    if (signUpError) {
      alert("❌ Lỗi tạo tài khoản: " + signUpError.message);
      setCreating(false);
      return;
    }

    const user = signUpData.user;
    if (!user) {
      alert("❌ Không thể tạo tài khoản (user null)");
      setCreating(false);
      return;
    }

    // Ghi vào bảng profiles
    const { error: profileError } = await supabase.from("profiles").insert([
      {
        id: user.id,
        email: newEmail,
        role: newRole,
        created_at: new Date().toISOString(),
      },
    ]);

    if (profileError) {
      alert("⚠️ Lỗi khi thêm profile: " + profileError.message);
    } else {
      alert("✅ Tạo tài khoản thành công!");
      setNewEmail("");
      setNewPassword("");
      fetchUsers();
    }

    setCreating(false);
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">👥 Quản lý tài khoản</h2>

      {/* Form tạo user */}
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
          onClick={createUser}
          disabled={creating}
          className={`px-4 rounded text-white ${
            creating
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {creating ? "⏳ Đang tạo..." : "➕ Tạo"}
        </button>
      </div>

      {/* Bảng danh sách */}
      {loading ? (
        <p>⏳ Đang tải danh sách...</p>
      ) : users.length === 0 ? (
        <p>⚠️ Không có người dùng nào</p>
      ) : (
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
      )}
    </div>
  );
}
