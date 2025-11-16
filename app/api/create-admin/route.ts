import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, 
  {
    auth: {
      persistSession: false   // 👈 BẮT BUỘC CHO SERVICE ROLE KEY
    }
  }
);

export async function POST() {
  console.log("📌 Service Role Key loaded:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);

  const email = "phh1422005@gmail.com";
  const password = "123456";
  const username = "admin";
  const full_name = "Admin User";

  try {
    console.log("🚀 Bắt đầu tạo auth user admin...");

    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: "admin" },
    });

    console.log("👉 userData:", userData);
    console.log("👉 userError:", userError);

    if (userError || !userData?.user) {
      return NextResponse.json(
        { error: userError?.message || "Không tạo được user" },
        { status: 400 }
      );
    }

    const userId = userData.user.id;

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

    console.log("👉 profileData:", profileData);
    console.log("👉 profileError:", profileError);

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    return NextResponse.json({
      message: "Admin user và profile đã được tạo thành công!",
      user: userData.user,
      profile: profileData,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
