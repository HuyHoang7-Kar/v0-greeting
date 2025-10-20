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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchLogs() {
      setLoading(true);

      // Lấy logs
      const { data: logsData, error: logError } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false });

      if (logError) {
        console.error("❌ Lỗi lấy logs:", logError.message);
        setLoading(false);
        return;
      }

      // Lấy danh sách user_id để map sang email
      const userIds = logsData.map((l) => l.user_id);
      const { data: users, error: userError } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", userIds);

      if (userError) console.error("⚠️ Lỗi lấy email:", userError.message);

      const logsWithEmail = logsData.map((log) => ({
        ...log,
        email: users?.find((u) => u.id === log.user_id)?.email || "Không rõ",
      }));

      setLogs(logsWithEmail);
      setLoading(false);
    }

    fetchLogs();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">📜 Lịch sử hoạt động</h2>

      {loading ? (
        <p>⏳ Đang tải lịch sử...</p>
      ) : logs.length === 0 ? (
        <p>⚠️ Chưa có hoạt động nào được ghi lại</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Người dùng</th>
              <th className="border p-2">Hành động</th>
              <th className="border p-2">Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="border p-2">{log.email}</td>
                <td className="border p-2">{log.action}</td>
                <td className="border p-2">
                  {new Date(log.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
