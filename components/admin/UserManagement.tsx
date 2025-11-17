"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { createUser } from "./api/create-user"
import { deleteUser } from "./api/delete-user"

interface UserProfile {
  id: string
  email: string
  full_name: string
  role: string
}

export default function UserManagement() {
  const supabase = createClientComponentClient()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)

  const [newEmail, setNewEmail] = useState("")
  const [newFullName, setNewFullName] = useState("")
  const [newRole, setNewRole] = useState("student")

  const fetchUsers = async () => {
    setLoading(true)
    const { data, error } = await supabase.from<UserProfile>("profiles").select("*")
    if (error) console.error("Error fetching users:", error)
    else setUsers(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleAddUser = async () => {
    if (!newEmail || !newFullName) return alert("Email và Họ tên không được để trống")
    try {
      await createUser(newEmail, newFullName, newRole)
      setNewEmail("")
      setNewFullName("")
      setNewRole("student")
      fetchUsers()
    } catch (err: any) {
      alert("Thêm user thất bại: " + err.message)
    }
  }

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa user này?")) return
    try {
      await deleteUser(id)
      fetchUsers()
    } catch (err: any) {
      alert("Xóa thất bại: " + err.message)
    }
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
