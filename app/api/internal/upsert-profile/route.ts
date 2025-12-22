import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { id, full_name, role, avatar_url } = body

    console.log("[v0] upsert-profile received:", { id, full_name, role, avatar_url })

    if (!id) {
      return NextResponse.json({ error: "missing user id" }, { status: 400 })
    }

    if (!full_name || !full_name.trim()) {
      return NextResponse.json({ error: "full_name không được để trống" }, { status: 400 })
    }

    const validRoles = ["student", "teacher", "admin"]
    const finalRole = validRoles.includes(role) ? role : "student"

    const finalAvatar =
      avatar_url && avatar_url.trim() ? avatar_url : "https://cdn-icons-png.flaticon.com/512/616/616408.png"

    const payload = {
      id,
      full_name: full_name.trim(),
      role: finalRole,
      avatar_url: finalAvatar,
      updated_at: new Date().toISOString(),
    }

    console.log("[v0] upsert payload:", payload)

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .upsert(payload, {
        onConflict: "id",
        ignoreDuplicates: false,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] upsert error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] upsert success:", data)

    return NextResponse.json({ success: true, profile: data }, { status: 200 })
  } catch (err: any) {
    console.error("[v0] upsert-profile fatal error:", err)
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 })
  }
}
