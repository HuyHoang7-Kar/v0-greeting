import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false },
  }
)

export async function POST(req: Request) {
  try {
    const {
      id,
      full_name,
      role,
      avatar_url,
    }: {
      id?: string
      full_name?: string
      role?: string
      avatar_url?: string
    } = await req.json()

    if (!id) {
      return NextResponse.json({ error: "missing user id" }, { status: 400 })
    }

    // ✅ đảm bảo role hợp lệ
    const validRoles = ["student", "teacher", "admin"]
    const safeRole = validRoles.includes(role ?? "") ? role : "student"

    // ✅ chỉ gửi avatar nếu có
    const payload: any = {
      id,
      full_name,
      role: safeRole,
      updated_at: new Date().toISOString(),
    }
    if (avatar_url?.trim()) {
      payload.avatar_url = avatar_url
    }

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .upsert(payload, { onConflict: "id" })
      .select()
      .single()

    if (error) {
      console.error("Upsert profile error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, profile: data })

  } catch (err: any) {
    console.error("upsert-profile fatal error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
