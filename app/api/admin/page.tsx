"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import UserList from "@/app/components/admin/UserList";
import ActivityLog from "@/app/components/admin/ActivityLog";

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    }
    loadUser();
  }, []);

  if (!user) return <p>Đang tải...</p>;

  const role = user.user_metadata?.role;

  if (role !== "admin") {
    return (
      <div className="text-center text-red-500 mt-10 text-lg">
        🚫 Bạn không có quyền truy cập trang này.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">👑 Trang quản trị</h1>
      <UserList />
      <ActivityLog />
    </div>
  );
}
