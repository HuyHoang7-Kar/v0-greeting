"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface UserProfile {
  id: string
  email: string
  full_name: string
  role: string
}

export default function UserManagement() {
  const supabase = createClient()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [newEmail, setNewEmail] = useState("")
  const [newFullName, setNewFullName] = useState("")
  const [newRole, setNewRole] = useState("student")

  const fetchUsers = async () => {
    setLoading(true)
    const { data, error } = await supabase.from<UserProfile>("profiles").select("*")
    if (error) console.error(error)
    else setUsers(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [])

  const handleAction = async (action: string, payload: any) => {
    try {
      const res = await fetch("/api/admin/manage-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      fetchUsers()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleAddUser = () => {
    if (!newEmail || !newFullName) return alert("Email và Họ tên không được để trống")
    handleAction("create", { email: newEmail, full_name: newFullName, role: newRole })
    setNewEmail("")
    setNewFullName("")
    setNewRole("student")
  }

  const handleDeleteUser = (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa user này?")) return
    handleAction("delete", { id })
  }

  const handleUpdateRole = (id: string, role: string) => {
    handleAction("updateRole", { id, role })
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Danh sách người dùng</h2>

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
        <button onClick={handleAddUser} className="bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-700">
          Thêm user
        </button>
      </div>

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
          {users.map(u => (
            <tr key={u.id}>
              <td className="border px-3 py-1">{u.email}</td>
              <td className="border px-3 py-1">{u.full_name}</td>
              <td className="border px-3 py-1">
                <select value={u.role} onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                  className="border px-2 py-1 rounded">
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td className="border px-3 py-1">
                <button onClick={() => handleDeleteUser(u.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
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
