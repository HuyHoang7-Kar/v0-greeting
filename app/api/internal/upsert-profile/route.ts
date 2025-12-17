import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// 🔐 Supabase Admin (Service Role)
const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { persistSession: false },
  }
)

export async function POST(req: Request) {
  try {
    const payload = await req.json()

    const {
      id,
      email,
      full_name,
      role,
      avatar_url,
    }: {
      id?: string
      email?: string
      full_name?: string
      role?: string
      avatar_url?: string
    } = payload

    let userId = id

    // ===============================
    // 🔍 TÌM USER THEO EMAIL (NẾU CHƯA CÓ ID)
    // ===============================
    if (!userId && email) {
      const { data: foundUser, error } = await supabaseAdmin
        .from("auth.users")
        .select("id")
        .eq("email", email)
        .maybeSingle()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      if (!foundUser?.id) {
        return NextResponse.json(
          { ok: false, message: "user-not-found-yet" },
          { status: 202 }
        )
      }

      userId = foundUser.id
    }

    if (!userId) {
      return NextResponse.json(
        { error: "must provide user id or email" },
        { status: 400 }
      )
    }

    // ===============================
    // 🔎 LẤY PROFILE HIỆN TẠI
    // ===============================
    const { data: existingProfile, error: profileError } =
      await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .maybeSingle()

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      )
    }

    // ===============================
    // ✅ CASE 1: PROFILE ĐÃ TỒN TẠI
    // ===============================
    if (existingProfile) {
      const updatePayload: any = {
        full_name,
        role,
        updated_at: new Date().toISOString(),
      }

      // 🔥 LUÔN ƯU TIÊN AVATAR USER CHỌN
      if (typeof avatar_url === "string" && avatar_url.trim() !== "") {
        updatePayload.avatar_url = avatar_url
      }

      const { data, error } = await supabaseAdmin
        .from("profiles")
        .update(updatePayload)
        .eq("id", userId)
        .select()
        .single()

      if (error) {
        console.error("Update profile error:", error)
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({ ok: true, profile: data })
    }

    // ===============================
    // ✅ CASE 2: PROFILE CHƯA TỒN TẠI
    // ===============================
    if (!avatar_url || avatar_url.trim() === "") {
      return NextResponse.json(
        { error: "avatar-required-on-signup" },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: userId,
        email,
        full_name,
        role,
        avatar_url,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Insert profile error:", error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, profile: data })
  } catch (err: any) {
    console.error("Internal upsert-profile error:", err)
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    )
  }
}
