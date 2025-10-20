"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface Log {
  id: string;
  user_id: string;
  action: string;
  created_at: string;
  email?: string;
}

export default function ActivityLog() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLogs() {
      try {
        setLoading(true);
        setError(null);

        // 🧩 Lấy danh sách logs
        const { data: logsData, error: logsError } = await supabase
          .from("activity_logs")
          .select("*")
          .order("created_at", { ascending: false });

        if (logsError) throw logsError;
        if (!logsData || logsData.length === 0) {
          setLogs([]);
          return;
        }

        // 🧩 Lấy danh sách user tương ứng
        const userIds = logsData.map((log) => log.user_id).filter(Boolean);

        let users: { id: string; email: string }[] = [];
        if (userIds.length > 0) {
          const { data: usersData, error: usersError } = await supabase
            .from("profiles")
            .select("id, email")
            .in("id", userIds);

          if (usersError) throw usersError;
          users = usersData || [];
        }

        // 🧩 Gắn email vào từng log
        const logsWithEmail = logsData.map((log) => ({
          ...log,
          email: users.find((u) => u.id === log.user_id)?.email || "Không rõ",
        }));

        setLogs(logsWithEmail);
      } catch (err: any) {
        console.error("❌ Lỗi khi tải logs:", err);
        setError(err.message || "Không thể tải lịch sử hoạt động");
      } finally {
        setLoading(false);
      }
    }

    fetchLogs();
  }, []);

  if (loading) return <div>⏳ Đang tải lịch sử hoạt động...</div>;
  if (error) return <div className="text-red-500">❌ {error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">📜 Lịch sử hoạt động</h2>

      {logs.length === 0 ? (
        <p className="text-gray-500 italic">Chưa có hoạt động nào.</p>
      ) : (
        <table className="w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Người dùng</th>
              <th className="border p-2">Hành động</th>
              <th className="border p-2">Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="border p-2">{log.email}</td>
                <td className="border p-2">{log.action}</td>
                <td className="border p-2">
                  {new Date(log.created_at).toLocaleString("vi-VN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
