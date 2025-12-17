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
    } = await req.json()

    // ===============================
    // 1️⃣ VALIDATION – BẮT BUỘC CÓ USER ID
    // ===============================
    if (!id) {
      return NextResponse.json(
        { error: "missing user id" },
        { status: 400 }
      )
    }

    // ===============================
    // 2️⃣ UPSERT PROFILE (1 LỆNH DUY NHẤT)
    // ===============================
    const payload: any = {
      id,
      email,
      full_name,
      role,
      updated_at: new Date().toISOString(),
    }

    // 👉 CHỈ GHI avatar KHI FRONTEND GỬI
    if (typeof avatar_url === "string" && avatar_url.trim() !== "") {
      payload.avatar_url = avatar_url
    }

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .upsert(payload, { onConflict: "id" })
      .select()
      .single()

    if (error) {
      console.error("Upsert profile error:", error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, profile: data })

  } catch (err: any) {
    console.error("upsert-profile fatal error:", err)
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    )
  }
}
