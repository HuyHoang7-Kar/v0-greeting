import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/616/616430.png"

export async function POST(req: Request) {
  try {
    const payload = await req.json()
    const { id, email, full_name, role, avatar_url } = payload

    if (!id) {
      return NextResponse.json({ error: "Missing user id" }, { status: 400 })
    }

    // UPSERT: update nếu tồn tại, insert nếu chưa
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          id,
          email,
          full_name,
          role,
          avatar_url: avatar_url || DEFAULT_AVATAR,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" } // profile đã tồn tại sẽ update
      )
      .select()
      .maybeSingle() // luôn trả về null hoặc object, tránh crash

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, profile: data ?? null })
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
