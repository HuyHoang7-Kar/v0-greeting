import React, { useEffect, useState } from "react";

// AdminDashboard component
// - Shows a paginated login history
// - Shows a user management panel to list / add / delete accounts
// - Uses Tailwind CSS for styling
// - Expects backend endpoints (examples used: /api/admin/users, /api/admin/login-history)

type User = {
  id: string;
  email: string;
  name?: string;
  role?: "admin" | "user" | string;
  createdAt?: string;
};

type LoginRecord = {
  id: string;
  userId: string | null;
  email?: string | null;
  ip: string;
  userAgent?: string;
  success: boolean;
  timestamp: string;
};

export default function AdminDashboard() {
  // Users
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);

  // Login history
  const [history, setHistory] = useState<LoginRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPageSize] = useState(10);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyFilterEmail, setHistoryFilterEmail] = useState("");

  // Add user modal / form
  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<"user" | "admin">("user");

  // Delete
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchHistory(historyPage, historyPageSize, historyFilterEmail);
  }, [historyPage, historyFilterEmail]);

  // Fetch users
  async function fetchUsers() {
    setLoadingUsers(true);
    setUserError(null);
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);
      const data = await res.json();
      setUsers(data.users || data);
    } catch (err: any) {
      setUserError(err?.message || "Unknown error");
    } finally {
      setLoadingUsers(false);
    }
  }

  // Fetch login history (paginated)
  async function fetchHistory(page = 1, pageSize = 10, emailFilter = "") {
    setLoadingHistory(true);
    try {
      const q = new URLSearchParams();
      q.set("page", String(page));
      q.set("pageSize", String(pageSize));
      if (emailFilter) q.set("email", emailFilter);

      const res = await fetch(`/api/admin/login-history?${q.toString()}`);
      if (!res.ok) throw new Error(`Failed to fetch history: ${res.status}`);
      const data = await res.json();
      // expected shape: { records: LoginRecord[], total: number }
      setHistory(data.records || data);
      if (typeof data.total === "number") setHistoryTotal(data.total);
      else setHistoryTotal((data.records || []).length);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  }

  // Add user
  async function handleAddUser(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!newEmail) return alert("Email is required");
    setAdding(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail, name: newName, role: newRole }),
      });
      if (!res.ok) throw new Error(`Create failed: ${res.status}`);
      const created: User = await res.json();
      // optimistic: add to list
      setUsers((s) => [created, ...s]);
      setShowAdd(false);
      setNewEmail("");
      setNewName("");
      setNewRole("user");
    } catch (err: any) {
      alert(err?.message || "Failed to add user");
    } finally {
      setAdding(false);
    }
  }

  // Delete user
  async function handleDeleteUser(id: string) {
    const ok = confirm("Bạn có chắc muốn xóa tài khoản này? Hành động không thể hoàn tác.");
    if (!ok) return;
    setDeletingUserId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
      setUsers((s) => s.filter((u) => u.id !== id));
    } catch (err: any) {
      alert(err?.message || "Xóa thất bại");
    } finally {
      setDeletingUserId(null);
    }
  }

  function renderUsersTable() {
    if (loadingUsers) return <div className="p-4">Loading users...</div>;
    if (userError)
      return <div className="p-4 text-red-600">Lỗi khi tải danh sách: {userError}</div>;

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Email</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Tên</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Vai trò</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Ngày tạo</th>
              <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500">
                  Chưa có tài khoản nào
                </td>
              </tr>
            )}
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 text-sm text-gray-700">{u.email}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{u.name || "-"}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{u.role || "user"}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{u.createdAt ? new Date(u.createdAt).toLocaleString() : "-"}</td>
                <td className="px-4 py-3 text-sm text-right">
                  <button
                    onClick={() => handleDeleteUser(u.id)}
                    disabled={deletingUserId === u.id}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-red-300 text-sm text-red-700 hover:bg-red-50"
                  >
                    {deletingUserId === u.id ? "Đang xóa..." : "Xóa"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function renderHistoryTable() {
    if (loadingHistory) return <div className="p-4">Loading history...</div>;
    if (!history || history.length === 0)
      return <div className="p-4 text-sm text-gray-500">Không có bản ghi đăng nhập.</div>;

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Thời gian</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Email</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">IP</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Trạng thái</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">User Agent</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {history.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3 text-sm text-gray-700">{new Date(r.timestamp).toLocaleString()}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{r.email || "(unknown)"}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{r.ip}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{r.success ? "Thành công" : "Thất bại"}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{r.userAgent || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm shadow-sm hover:bg-indigo-700"
          >
            Thêm tài khoản
          </button>
          <button
            onClick={() => fetchUsers()}
            className="px-3 py-2 rounded-md border text-sm"
            title="Làm mới danh sách users"
          >
            Làm mới
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-white p-4 rounded-md shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Quản lý tài khoản</h2>
            <div className="text-sm text-gray-500">{users.length} tài khoản</div>
          </div>

          {renderUsersTable()}
        </div>

        <div className="card bg-white p-4 rounded-md shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Lịch sử đăng nhập</h2>
            <div className="flex items-center gap-2">
              <input
                value={historyFilterEmail}
                onChange={(e) => {
                  setHistoryFilterEmail(e.target.value);
                  setHistoryPage(1);
                }}
                placeholder="Lọc theo email"
                className="px-3 py-1 border rounded-md text-sm"
              />
              <button onClick={() => fetchHistory(1, historyPageSize, historyFilterEmail)} className="px-3 py-1 border rounded-md text-sm">
                Tìm
              </button>
            </div>
          </div>

          {renderHistoryTable()}

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">Tổng: {historyTotal}</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                disabled={historyPage <= 1}
                className="px-3 py-1 border rounded-md text-sm"
              >
                Prev
              </button>
              <div className="px-3 py-1 border rounded-md text-sm">{historyPage}</div>
              <button
                onClick={() => setHistoryPage((p) => p + 1)}
                disabled={history.length < historyPageSize}
                className="px-3 py-1 border rounded-md text-sm"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Add user modal (simple) */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-medium mb-4">Thêm tài khoản mới</h3>
            <form onSubmit={handleAddUser} className="space-y-3">
              <div>
                <label className="block text-sm text-gray-700">Email</label>
                <input
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="mt-1 block w-full border px-3 py-2 rounded-md"
                  type="email"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700">Tên (tuỳ chọn)</label>
                <input value={newName} onChange={(e) => setNewName(e.target.value)} className="mt-1 block w-full border px-3 py-2 rounded-md" />
              </div>
              <div>
                <label className="block text-sm text-gray-700">Vai trò</label>
                <select value={newRole} onChange={(e) => setNewRole(e.target.value as any)} className="mt-1 block w-full border px-3 py-2 rounded-md">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-md border">
                  Hủy
                </button>
                <button type="submit" disabled={adding} className="px-4 py-2 rounded-md bg-indigo-600 text-white">
                  {adding ? "Đang thêm..." : "Thêm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
