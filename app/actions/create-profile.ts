"use server"

import { supabaseServer } from "@/lib/supabase/server"

export async function createUserProfile(
  userId: string,
  data: {
    email: string
    full_name: string
    role: "student" | "teacher" | "admin"
  },
) {
  const supabase = supabaseServer()

  try {
    // Kiểm tra xem profile đã tồn tại chưa
    const { data: existing, error: selectError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle()

    if (selectError) {
      console.error("[v0] Error checking existing profile:", selectError)
      return { ok: false, error: selectError.message }
    }

    if (existing) {
      // Nếu đã tồn tại, chỉ cập nhật thông tin
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: data.full_name,
          role: data.role,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (updateError) {
        console.error("[v0] Error updating profile:", updateError)
        return { ok: false, error: updateError.message }
      }

      return { ok: true, message: "Profile updated" }
    }

    // Nếu chưa tồn tại, insert mới
    const { error: insertError } = await supabase.from("profiles").insert({
      id: userId,
      email: data.email,
      full_name: data.full_name,
      role: data.role,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.email}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (insertError) {
      console.error("[v0] Error creating profile:", insertError)
      return { ok: false, error: insertError.message }
    }

    return { ok: true, message: "Profile created" }
  } catch (err: any) {
    console.error("[v0] Unexpected error in createUserProfile:", err)
    return { ok: false, error: String(err) }
  }
}
