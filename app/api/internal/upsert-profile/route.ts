import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)

// 🧸 Avatar hoạt hình trung tính – phù hợp trẻ em
const DEFAULT_AVATARS = [
  "/avatars/animal-lion.png",
  "/avatars/animal-elephant.png",
  "/avatars/animal-panda.png",
  "/avatars/animal-dolphin.png",
  "/avatars/animal-bear.png",
]

function getRandomAvatar() {
  return DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)]
}

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

    // 🔍 Tìm user theo email nếu chưa có id
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

    // 🔎 Kiểm tra profile đã tồn tại chưa
    const { data: existingProfile, error: profileError } =
      await supabaseAdmin
        .from("profiles")
        .select("id, avatar_url")
        .eq("id", userId)
        .maybeSingle()

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      )
    }

    // 👉 Xác định avatar cuối cùng
    const finalAvatar =
      avatar_url ||
      existingProfile?.avatar_url ||
      getRandomAvatar()

    // ===============================
    // ✅ CASE 1: PROFILE ĐÃ TỒN TẠI → UPDATE
    // ===============================
    if (existingProfile) {
      const { data, error } = await supabaseAdmin
        .from("profiles")
        .update({
          full_name,
          role,
          avatar_url: finalAvatar,
          updated_at: new Date().toISOString(),
        })
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
    // ✅ CASE 2: PROFILE CHƯA TỒN TẠI → INSERT
    // ===============================
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
