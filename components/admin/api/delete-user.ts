import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function deleteUser(id: string) {
  if (!id) throw new Error("Missing user id");

  // Xóa profile
  await supabaseAdmin.from("profiles").delete().eq("id", id);

  // Xóa auth user
  const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
  if (error) throw new Error(error.message);

  return { success: true };
}
