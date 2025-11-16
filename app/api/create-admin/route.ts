import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Supabase server client (dùng Service Role)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!   // bắt buộc: service role key
  );

  const email = "phh1422005@gmail.com";
  const password = "123456";

  try {
    console.log("🚀 Xóa user cũ nếu tồn tại...");
    await supabase.auth.admin.deleteUserByEmail(email).catch(() => {});

    console.log("🚀 Tạo user admin mới...");
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: "admin" }
    });

    if (error) {
      console.error("❌ Error createUser:", error);
      return res.status(400).json({ error: error.message });
    }

    console.log("➡️ userData:", data);

    console.log("🚀 Upsert profile...");
    await supabase.from("profiles").upsert({
      id: data.user.id,
      username: "admin",
      full_name: "Admin User",
      role: "admin",
    });

    return res.json({
      success: true,
      message: "Admin created successfully",
      user_id: data.user.id,
      email,
    });

  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
