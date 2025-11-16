import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ⚠️ Server-side client, dùng Service Role Key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,     
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY  
);

export async function POST() {
  const email = "phh1422005@gmail.com";
  const password = "123456";
  const username = "admin";
  const full_name = "Admin User";

  try {
    console.log("🚀 Bắt đầu tạo auth user admin...");

    // 1️⃣ Tạo auth user
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: "admin" },
    });

    if (userError || !userData.user) {
      return NextResponse.json({ error: userError?.message || "Không tạo được user" }, { status: 400 });
    }

    const userId = userData.user.id;
    console.log("✅ User tạo thành công:", userData.user);

    // 2️⃣ Tạo profile admin
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        username,
        full_name,
        role: "admin",
        avatar_url: "",
        bio: "",
      })
      .select();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    console.log("✅ Profile admin đã được tạo:", profileData);

    return NextResponse.json({
      message: "Admin user và profile đã được tạo thành công!",
      user: userData.user,
      profile: profileData,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Lỗi không xác định" }, { status: 500 });
  }
}
