"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/client";

export default function UserList() {
  const [users, setUsers] = useState<any[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const { data, error } = await supabase.from("users").select("*");
    if (error) console.error(error);
    else setUsers(data);
  }

  async function deleteUser(id: string) {
    await supabase.from("users").delete().eq("id", id);
    fetchUsers();
  }

  async function createUser() {
    if (!newEmail || !newPassword) return alert("Nhập email và mật khẩu!");

    const { error } = await supabase.auth.signUp({
      email: newEmail,
      password: newPassword,
    });

    if (error) alert("Lỗi tạo tài khoản: " + error.message);
    else {
      alert("✅ Đã tạo tài khoản!");
      setNewEmail("");
      setNewPassword("");
      fetchUsers();
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
