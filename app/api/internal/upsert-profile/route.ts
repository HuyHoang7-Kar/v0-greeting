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

    // 1️⃣ Kiểm tra bắt buộc user id
    if (!id) {
      return NextResponse.json({ error: "missing user id" }, { status: 400 })
    }

    // 2️⃣ Kiểm tra full_name
    if (!full_name?.trim()) {
      return NextResponse.json({ error: "full_name không được để trống" }, { status: 400 })
    }

    // 3️⃣ Xử lý role
    const validRoles = ["student", "teacher", "admin"]
    const safeRole = typeof role === "string" && validRoles.includes(role) ? role : "student"

    // 4️⃣ Xử lý avatar mặc định nếu không có
    const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/616/616408.png"
    const finalAvatar = avatar_url?.trim() || defaultAvatar

    // 5️⃣ Payload upsert
    const payload: any = {
      id,
      full_name: full_name.trim(),
      role: safeRole,
      avatar_url: finalAvatar,
      updated_at: new Date().toISOString(),
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
