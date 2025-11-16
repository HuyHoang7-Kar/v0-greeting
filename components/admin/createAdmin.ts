import { createClient } from "@supabase/supabase-js";

// ⚠️ MUST USE service_role_key, tuyệt đối không dùng public key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function createAdmin(email: string, password: string) {
  // 1️⃣ Tạo auth user
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // bỏ qua xác thực email
    user_metadata: { role: "admin" }, // nếu app dùng metadata
  });

  if (userError || !userData.user) {
    console.error("❌ Lỗi tạo user:", userError);
    return;
  }

  const userId = userData.user.id;

  // 2️⃣ Tạo profile với role = admin
  const { error: profileError } = await supabase
    .from("profiles")
    .insert({
      id: userId,
      username: "admin",
      full_name: "Admin User",
      role: "admin", // quan trọng
      avatar_url: "",
      bio: "",
    });

  if (profileError) {
    console.error("❌ Lỗi tạo profile:", profileError);
    return;
  }

  console.log("✅ Admin user và profile đã được tạo thành công!");
}

// Chạy tạo admin
createAdmin("phh1422005@gmail.com", "Admin@123456");
