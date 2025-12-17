import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { id, email, full_name, role, avatar_url } = body

    if (!id) {
      return NextResponse.json(
        { ok: false, error: "missing-user-id" },
        { status: 400 }
      )
    }

    // 1️⃣ Check profile tồn tại chưa
    const { data: existingProfile, error: checkError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", id)
      .maybeSingle()

    if (checkError) {
      return NextResponse.json({ ok: false, error: checkError.message }, { status: 500 })
    }

    // 2️⃣ INSERT nếu chưa có
    if (!existingProfile) {
      const { data, error } = await supabaseAdmin
        .from("profiles")
        .insert({
          id,
          email,
          full_name,
          role,
          avatar_url,
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
      }

      return NextResponse.json({ ok: true, profile: data })
    }

    // 3️⃣ UPDATE nếu đã có
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update({
        email,
        full_name,
        role,
        avatar_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, profile: data })
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message ?? String(err) },
      { status: 500 }
    )
  }
}
