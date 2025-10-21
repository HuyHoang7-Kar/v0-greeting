"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface UserProfile {
  id: string
  email: string
  role: string
}

export default function UserManagement() {
  const supabase = createClientComponentClient()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [newEmail, setNewEmail] = useState("")
  const [newRole, setNewRole] = useState("student")

  const fetchUsers = async () => {
    setLoading(true)
    const { data, error } = await supabase.from("profiles").select("*")
    if (error) console.error("Error fetching users:", error)
    else setUsers(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleAddUser = async () => {
    if (!newEmail) return alert("Email không được để trống")
    const { error } = await supabase.from("profiles").insert([{ email: newEmail, role: newRole }])
    if (error) alert("Thêm user thất bại: " + error.message)
    else {
      setNewEmail("")
      setNewRole("student")
      fetchUsers()
    }
  }

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa user này?")) return
    const { error } = await supabase.from("profiles").delete().eq("id", id)
    if (error) alert("Xóa thất bại: " + error.message)
    else fetchUsers()
  }

  const handleUpdateRole = async (id: string, role: string) => {
    const { error } = await supabase.from("profiles").update({ role }).eq("id", id)
    if (error) alert("Cập nhật thất bại: " + error.message)
    else fetchUsers()
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
            <th className="border px-3 py-1">Role</th>
            <th className="border px-3 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="border px-3 py-1">{user.email}</td>
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
