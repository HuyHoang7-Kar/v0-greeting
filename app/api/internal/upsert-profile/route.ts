import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)

const DEFAULT_AVATAR = 'https://cdn-icons-png.flaticon.com/512/616/616430.png' // 🐶 mặc định

export async function POST(req: Request) {
  try {
    const payload = await req.json()
    const { id, email, full_name, role, avatar_url } = payload

    if (!id && !email) {
      return NextResponse.json({ error: "must provide user id or email" }, { status: 400 })
    }

    // Lấy userId từ email nếu chưa có
    let userId = id
    if (!userId && email) {
      const { data: foundUser, error } = await supabaseAdmin
        .from("auth.users")
        .select("id")
        .eq("email", email)
        .maybeSingle()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      if (!foundUser?.id) return NextResponse.json({ ok: false, message: "user-not-found-yet" }, { status: 202 })
      userId = foundUser.id
    }

    // Lấy profile hiện tại
    const { data: existingProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, avatar_url")
      .eq("id", userId)
      .maybeSingle()

    if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })

    // Nếu profile tồn tại → UPDATE
    if (existingProfile) {
      const updatePayload: any = {
        full_name,
        role,
        updated_at: new Date().toISOString(),
      }

      // Chỉ set avatar nếu chưa có
      if (!existingProfile.avatar_url && avatar_url) {
        updatePayload.avatar_url = avatar_url
      }

      const { data, error } = await supabaseAdmin
        .from("profiles")
        .update(updatePayload)
        .eq("id", userId)
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ ok: true, profile: data })
    }

    // Nếu profile chưa tồn tại → INSERT
    const finalAvatar = avatar_url || DEFAULT_AVATAR

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: userId,
        email,
        full_name,
        role,
        avatar_url: finalAvatar,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, profile: data })

  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
