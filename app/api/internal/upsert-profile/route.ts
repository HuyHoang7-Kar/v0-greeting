import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)

// 🧸 Avatar hoạt hình trung tính – cho trẻ em
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

    // 🔍 tìm user theo email nếu chưa có id
    if (!userId && email) {
      const { data: found } = await supabaseAdmin
        .from("auth.users")
        .select("id")
        .eq("email", email)
        .maybeSingle()

      if (!found?.id) {
        return NextResponse.json(
          { ok: false, message: "user-not-found-yet" },
          { status: 202 }
        )
      }

      userId = found.id
    }

    if (!userId) {
      return NextResponse.json(
        { error: "must provide user id or email" },
        { status: 400 }
      )
    }

    // 🔎 kiểm tra profile đã tồn tại chưa
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("avatar_url")
      .eq("id", userId)
      .maybeSingle()

    const upsertPayload: any = {
      id: userId,
      updated_at: new Date().toISOString(),
    }

    if (full_name !== undefined) upsertPayload.full_name = full_name
    if (role !== undefined) upsertPayload.role = role

    // ⭐ CHỈ set avatar khi:
    // 1. client gửi lên
    // 2. HOẶC profile chưa có avatar
    if (avatar_url) {
      upsertPayload.avatar_url = avatar_url
    } else if (!existingProfile?.avatar_url) {
      upsertPayload.avatar_url = getRandomAvatar()
    }

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .upsert(upsertPayload, { onConflict: "id" })
      .select()
      .single()

    if (error) {
      console.error("Upsert profile error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, profile: data })
  } catch (err: any) {
    console.error("Internal upsert-profile error", err)
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    )
  }
}
