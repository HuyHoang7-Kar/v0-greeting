"use server"

import { createClient } from "@/lib/supabase/server"

export async function createUserProfile(
  userId: string,
  data: {
    email: string
    full_name: string
    role: "student" | "teacher" | "admin"
  },
) {
  const supabase = await createClient()

  const { error } = await supabase.from("profiles").insert({
    id: userId,
    email: data.email,
    full_name: data.full_name,
    role: data.role,
    avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.email}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  if (error) {
    console.error("[v0] Profile creation error:", error)
    return { ok: false, error: error.message }
  }

  return { ok: true }
}
