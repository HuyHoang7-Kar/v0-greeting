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

  useEffect(() => {
    async function fetchLogs() {
      // Lấy danh sách logs
      const { data: logsData, error } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error || !logsData) return;

      // Lấy email cho từng user_id
      const userIds = logsData.map((log) => log.user_id);
      const { data: users } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", userIds);

      // Ghép email vào log
      const logsWithEmail = logsData.map((log) => ({
        ...log,
        email: users?.find((u) => u.id === log.user_id)?.email || "Không rõ",
      }));

      setLogs(logsWithEmail);
    }

    fetchLogs();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">📜 Lịch sử hoạt động</h2>
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
    </div>
  );
}
