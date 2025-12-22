import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Service Role Key để bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

export async function POST(req: Request) {
  try {
    const { id, full_name, role, avatar_url } = await req.json()

    if (!id) return NextResponse.json({ error: "missing user id" }, { status: 400 })
    if (!full_name?.trim()) return NextResponse.json({ error: "full_name cannot be empty" }, { status: 400 })

    // Kiểm tra role hợp lệ
    const validRoles = ["student", "teacher", "admin"]
    const safeRole = validRoles.includes(role ?? "") ? role : "student"

    const payload = {
      id,
      full_name: full_name.trim(),
      role: safeRole,
      avatar_url: avatar_url?.trim() || "https://cdn-icons-png.flaticon.com/512/616/616408.png",
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .upsert(payload, { onConflict: "id" })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true, profile: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
