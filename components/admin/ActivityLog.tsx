"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ActivityLog() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    async function fetchLogs() {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*, users(email)")
        .order("created_at", { ascending: false });
      if (!error) setLogs(data);
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
              <td className="border p-2">{log.users?.email}</td>
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
