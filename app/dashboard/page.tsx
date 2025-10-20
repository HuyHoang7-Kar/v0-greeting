"use client";

import React, { useMemo, useState } from "react";

// Frontend-only Admin Dashboard UI
// - AdminDashboard component exported as default
// - UI for: user management (list, edit modal, create modal, delete UI) and
//   login history (table, filter, pagination)
// - No backend calls — uses local mock data and local state only
// - Tailwind CSS classes used for styling

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

function uid(prefix = "u") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

const initialUsers: User[] = [
  { id: uid(), email: "alice@example.com", name: "Alice", role: "admin", createdAt: new Date().toISOString() },
  { id: uid(), email: "bob@example.com", name: "Bob Nguyen", role: "user", createdAt: new Date().toISOString() },
  { id: uid(), email: "carol@example.com", name: "Carol", role: "user", createdAt: new Date().toISOString() },
];

const initialHistory: LoginRecord[] = Array.from({ length: 23 }).map((_, i) => ({
  id: `h_${i}`,
  userId: i % 3 === 0 ? initialUsers[0].id : i % 3 === 1 ? initialUsers[1].id : initialUsers[2].id,
  email: i % 3 === 0 ? initialUsers[0].email : i % 3 === 1 ? initialUsers[1].email : initialUsers[2].email,
  ip: `192.168.1.${10 + i}`,
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  success: i % 5 !== 0,
  timestamp: new Date(Date.now() - i * 1000 * 60 * 60).toISOString(),
}));

export default function AdminDashboard() {
  // Users
  const [users, setUsers] = useState<User[]>(initialUsers);

  // Login history
  const [history] = useState<LoginRecord[]>(initialHistory);

  // UI states for users
  const [query, setQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // History UI states
  const [historyFilterEmail, setHistoryFilterEmail] = useState("");
  const [historyPage, setHistoryPage] = useState(1);
  const pageSize = 8;

  // Derived lists
  const filteredUsers = useMemo(() => {
    if (!query) return users;
    return users.filter((u) => u.email.includes(query) || (u.name || "").toLowerCase().includes(query.toLowerCase()));
  }, [users, query]);

  const filteredHistory = useMemo(() => {
    return history.filter((h) => (historyFilterEmail ? (h.email || "").includes(historyFilterEmail) : true));
  }, [history, historyFilterEmail]);

  const historyPageCount = Math.max(1, Math.ceil(filteredHistory.length / pageSize));
  const historyPageItems = filteredHistory.slice((historyPage - 1) * pageSize, historyPage * pageSize);

  // Handlers (UI-only)
  function openEdit(u: User) {
    setSelectedUser(u);
    setShowEdit(true);
  }

  function handleSaveEdit(updated: User) {
    setUsers((s) => s.map((u) => (u.id === updated.id ? updated : u)));
    setShowEdit(false);
  }

  function handleCreate(newUser: Omit<User, "id" | "createdAt">) {
    const u: User = { ...newUser, id: uid(), createdAt: new Date().toISOString() };
    setUsers((s) => [u, ...s]);
    setShowCreate(false);
  }

  function handleDelete(id: string) {
    if (!confirm("Bạn có chắc muốn xóa tài khoản này?")) return;
    setDeletingId(id);
    // UI-only: remove from local state
    setTimeout(() => {
      setUsers((s) => s.filter((u) => u.id !== id));
      setDeletingId(null);
    }, 300);
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowCreate(true)} className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm">
            Tạo tài khoản
          </button>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users panel */}
        <section className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Quản lý tài khoản</h2>
            <div className="text-sm text-gray-500">{users.length} tài khoản</div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm theo email hoặc tên..."
              className="flex-1 px-3 py-2 border rounded-md"
            />
            <button onClick={() => setQuery("")} className="px-3 py-2 border rounded-md text-sm">
              Clear
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-gray-600">
                <tr>
                  <th className="pb-2">Email</th>
                  <th className="pb-2">Tên</th>
                  <th className="pb-2">Vai trò</th>
                  <th className="pb-2">Ngày tạo</th>
                  <th className="pb-2 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-500">
                      Không có tài khoản
                    </td>
                  </tr>
                )}

                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td className="py-3">{u.email}</td>
                    <td className="py-3">{u.name || "-"}</td>
                    <td className="py-3">{u.role}</td>
                    <td className="py-3">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}</td>
                    <td className="py-3 text-right">
                      <div className="inline-flex gap-2">
                        <button className="px-3 py-1 rounded-md border text-sm" onClick={() => openEdit(u)}>
                          Sửa
                        </button>
                        <button
                          className="px-3 py-1 rounded-md border text-sm text-red-600"
                          onClick={() => handleDelete(u.id)}
                          disabled={deletingId === u.id}
                        >
                          {deletingId === u.id ? "Đang xóa..." : "Xóa"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Login history panel */}
        <section className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Lịch sử đăng nhập</h2>
            <div className="text-sm text-gray-500">{history.length} bản ghi</div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <input
              value={historyFilterEmail}
              onChange={(e) => {
                setHistoryFilterEmail(e.target.value);
                setHistoryPage(1);
              }}
              placeholder="Lọc theo email"
              className="flex-1 px-3 py-2 border rounded-md"
            />
            <button onClick={() => { setHistoryFilterEmail(""); setHistoryPage(1); }} className="px-3 py-2 border rounded-md text-sm">
              Clear
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-gray-600">
                <tr>
                  <th className="pb-2">Thời gian</th>
                  <th className="pb-2">Email</th>
                  <th className="pb-2">IP</th>
                  <th className="pb-2">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {historyPageItems.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-500">
                      Không có bản ghi
                    </td>
                  </tr>
                )}

                {historyPageItems.map((h) => (
                  <tr key={h.id}>
                    <td className="py-3">{new Date(h.timestamp).toLocaleString()}</td>
                    <td className="py-3">{h.email || "(unknown)"}</td>
                    <td className="py-3">{h.ip}</td>
                    <td className="py-3">{h.success ? "Thành công" : "Thất bại"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">Tổng: {filteredHistory.length}</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                disabled={historyPage <= 1}
                className="px-3 py-1 border rounded-md text-sm"
              >
                Prev
              </button>
              <div className="px-3 py-1 border rounded-md text-sm">{historyPage} / {historyPageCount}</div>
              <button
                onClick={() => setHistoryPage((p) => Math.min(historyPageCount, p + 1))}
                disabled={historyPage >= historyPageCount}
                className="px-3 py-1 border rounded-md text-sm"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Edit Modal */}
      {showEdit && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => setShowEdit(false)}
          onSave={(u) => handleSaveEdit(u)}
        />
      )}

      {/* Create Modal */}
      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onCreate={(u) => handleCreate(u)}
        />
      )}
    </div>
  );
}

// --- EditUserModal component (UI-only) ---
function EditUserModal({ user, onClose, onSave }: { user: User; onClose: () => void; onSave: (u: User) => void }) {
  const [email, setEmail] = useState(user.email);
  const [name, setName] = useState(user.name || "");
  const [role, setRole] = useState<User["role"]>(user.role || "user");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md bg-white rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-medium mb-4">Sửa tài khoản</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full border px-3 py-2 rounded-md" />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Tên</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border px-3 py-2 rounded-md" />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Vai trò</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="mt-1 block w-full border px-3 py-2 rounded-md">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button onClick={onClose} className="px-4 py-2 rounded-md border">Hủy</button>
            <button
              onClick={() => onSave({ ...user, email, name, role })}
              className="px-4 py-2 rounded-md bg-indigo-600 text-white"
            >
              Lưu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- CreateUserModal component (UI-only) ---
function CreateUserModal({ onClose, onCreate }: { onClose: () => void; onCreate: (u: Omit<User, "id" | "createdAt">) => void }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<User["role"]>("user");

  function submit() {
    if (!email) return alert("Email required");
    onCreate({ email, name, role });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md bg-white rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-medium mb-4">Tạo tài khoản mới</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full border px-3 py-2 rounded-md" />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Tên</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border px-3 py-2 rounded-md" />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Vai trò</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="mt-1 block w-full border px-3 py-2 rounded-md">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button onClick={onClose} className="px-4 py-2 rounded-md border">Hủy</button>
            <button onClick={submit} className="px-4 py-2 rounded-md bg-indigo-600 text-white">Tạo</button>
          </div>
        </div>
      </div>
    </div>
  );
}
