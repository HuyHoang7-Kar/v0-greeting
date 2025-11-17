import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function createUser(email: string, full_name: string, role: string) {
  if (!email || !full_name) throw new Error("Email và họ tên không được để trống");

  // Tạo user auth
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    email_confirm: true,
    password: Math.random().toString(36).slice(2, 10),
  });

  if (authError) throw new Error(authError.message);

  // Tạo profile
  const { error: profileError } = await supabaseAdmin.from("profiles").insert([
    { id: authUser.user?.id, email, full_name, role },
  ]);

  if (profileError) throw new Error(profileError.message);

  return { success: true, id: authUser.user?.id };
}
