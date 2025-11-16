import { createClient } from "@supabase/supabase-js";

// ⚠️ MUST USE service_role_key (tuyệt đối không dùng public key)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function createAdmin() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: "phh1422005@gmail.com",
    password: "Admin@123456",
    email_confirm: true, // bỏ qua bước xác thực email
    user_metadata: {
      role: "admin",       // gán role vào metadata
    },
  });

  if (error) {
    console.error("❌ Lỗi tạo tài khoản admin:", error);
    return;
  }

  console.log("✅ Tạo admin thành công!", data.user);
}

createAdmin();
