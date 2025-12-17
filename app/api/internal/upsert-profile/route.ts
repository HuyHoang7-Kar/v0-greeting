import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)

const DEFAULT_AVATAR =
  "https://cdn-icons-png.flaticon.com/512/616/616430.png"

export async function POST(req: Request) {
  try {
    const payload = await req.json()
    const { id, email, full_name, role, avatar_url } = payload

    if (!id) {
      return NextResponse.json({ error: "Missing user id" }, { status: 400 })
    }

    // 🔍 kiểm tra profile tồn tại chưa
    const { data: existingProfile, error } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", id)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // =========================
    // UPDATE (PROFILE ĐÃ TỒN TẠI)
    // =========================
    if (existingProfile) {
      const updatePayload: any = {
        full_name,
        role,
        updated_at: new Date().toISOString(),
      }

      // 🔥 QUAN TRỌNG: nếu frontend gửi avatar → UPDATE LUÔN
      if (avatar_url) {
        updatePayload.avatar_url = avatar_url
      }

      const { data, error } = await supabaseAdmin
        .from("profiles")
        .update(updatePayload)
        .eq("id", id)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ ok: true, profile: data })
    }

    // =========================
    // INSERT (HIẾM KHI XẢY RA)
    // =========================
    const { data, error: insertError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id,
        email,
        full_name,
        role,
        avatar_url: avatar_url || DEFAULT_AVATAR,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, profile: data })
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
