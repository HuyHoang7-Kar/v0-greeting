import { createClient } from "@supabase/supabase-js";

// 🧩 Dùng service role key (quan trọng: KHÔNG dùng public key)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // lấy trong Supabase Project Settings → API
);

async function createAdmin() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: "phh1422005@gmail.com",
    password: "Admin@123456",   // bạn có thể đổi mật khẩu mạnh hơn
    email_confirm: true,
    user_metadata: { role: "admin" },
  });

  if (error) {
    console.error("❌ Lỗi khi tạo admin:", error);
  } else {
    console.log("✅ Admin đã được tạo thành công:", data.user);
  }
}

createAdmin();
