'use client'

import { useEffect, useState } from "react"
import { createClient, SupabaseClient } from "@supabase/supabase-js"

interface UserProfile {
  id: string
  email: string
  full_name: string
  role: string
}

// Supabase service role key – TUYỆT ĐỐI KHÔNG để lộ ngoài production
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin: SupabaseClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
const supabaseClient: SupabaseClient = createClient(SUPABASE_URL, "") // bình thường cho role update

export default function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)

  const [newEmail, setNewEmail] = useState("")
  const [newFullName, setNewFullName] = useState("")
  const [newRole, setNewRole] = useState("student")

  // Lấy danh sách users
  const fetchUsers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabaseClient.from<UserProfile>("profiles").select("*")
      if (error) console.error("Error fetching users:", error)
      else setUsers(data ?? [])
    } catch (err) {
      console.error(err)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Thêm user mới
  const handleAddUser = async () => {
    if (!newEmail || !newFullName) return alert("Email và Họ tên không được để trống")
    try {
      // 1. Tạo user trong auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: newEmail,
        password: Math.random().toString(36).slice(-8),
        email_confirm: true,
      })
      if (authError) throw authError

      const userId = authData.user?.id
      if (!userId) throw new Error("Không tạo được user")

      // 2. Thêm profile
      const { error: profileError } = await supabaseAdmin.from("profiles").insert([
        { id: userId, email: newEmail, full_name: newFullName, role: newRole },
      ])
      if (profileError) throw profileError

      setNewEmail("")
      setNewFullName("")
      setNewRole("student")
      fetchUsers()
    } catch (err: any) {
      alert("Thêm user thất bại: " + err.message)
    }
  }

  // Xóa user
  const handleDeleteUser = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa user này?")) return
    try {
      // 1. Xóa profile
      const { error: profileError } = await supabaseAdmin.from("profiles").delete().eq("id", id)
      if (profileError) throw profileError

      // 2. Xóa auth user
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id)
      if (authError) throw authError

      fetchUsers()
    } catch (err: any) {
      alert("Xóa thất bại: " + err.message)
    }
  }

  // Cập nhật role
  const handleUpdateRole = async (id: string, role: string) => {
    try {
      const { error } = await supabaseClient.from("profiles").update({ role }).eq("id", id)
      if (error) throw error
      fetchUsers()
    } catch (err: any) {
      alert("Cập nhật role thất bại: " + err.message)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Danh sách người dùng</h2>

      {/* Form thêm user mới */}
      <div className="mb-6 flex gap-2">
        <input
          type="email"
          placeholder="Email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          className="border px-3 py-1 rounded"
        />
        <input
          type="text"
          placeholder="Họ và tên"
          value={newFullName}
          onChange={(e) => setNewFullName(e.target.value)}
          className="border px-3 py-1 rounded"
        />
        <select
          value={newRole}
          onChange={(e) => setNewRole(e.target.value)}
          className="border px-3 py-1 rounded"
        >
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>
        <button
          onClick={handleAddUser}
          className="bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-700"
        >
          Thêm user
        </button>
      </div>

      {/* Bảng user */}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-3 py-1">Email</th>
            <th className="border px-3 py-1">Họ và Tên</th>
            <th className="border px-3 py-1">Role</th>
            <th className="border px-3 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="border px-3 py-1">{user.email}</td>
              <td className="border px-3 py-1">{user.full_name}</td>
              <td className="border px-3 py-1">
                <select
                  value={user.role}
                  onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                  className="border px-2 py-1 rounded"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td className="border px-3 py-1">
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
