// pages/api/delete-user.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

// Tạo client Supabase admin chỉ dùng server-side
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Chỉ cho phép POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Missing user id" });
    }

    // 1️⃣ Xóa profile trước
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", id);

    if (profileError) {
      console.error("Error deleting profile:", profileError);
      return res.status(400).json({ error: profileError.message });
    }

    // 2️⃣ Xóa auth user
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (authError) {
      console.error("Error deleting auth user:", authError);
      return res.status(400).json({ error: authError.message });
    }

    // 3️⃣ Trả về JSON thành công
    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("Unexpected error in delete-user:", err);
    return res.status(500).json({ error: err?.message || "Internal server error" });
  }
}
