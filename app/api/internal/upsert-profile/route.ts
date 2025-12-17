import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

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

    // Nếu chưa có ID, tìm theo email
    if (!userId && email) {
      const { data: foundUser, error } = await supabaseAdmin
        .from("auth.users")
        .select("id")
        .eq("email", email)
        .maybeSingle()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      if (!foundUser?.id)
        return NextResponse.json({ ok: false, message: "user-not-found-yet" }, { status: 202 })
      userId = foundUser.id
    }

    if (!userId)
      return NextResponse.json({ error: "must provide user id or email" }, { status: 400 })

    // Tìm profile hiện tại
    const { data: existingProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle()

    if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })

    // Nếu profile tồn tại → update (upsert)
    if (existingProfile) {
      const updatePayload: any = {
        updated_at: new Date().toISOString(),
      }
      if (full_name) updatePayload.full_name = full_name
      if (role) updatePayload.role = role
      if (avatar_url) updatePayload.avatar_url = avatar_url

      const { data, error } = await supabaseAdmin
        .from("profiles")
        .update(updatePayload)
        .eq("id", userId)
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ ok: true, profile: data })
    }

    // Nếu profile chưa tồn tại → insert
    const insertPayload: any = {
      id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    if (email) insertPayload.email = email
    if (full_name) insertPayload.full_name = full_name
    if (role) insertPayload.role = role
    if (avatar_url) insertPayload.avatar_url = avatar_url

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .insert(insertPayload)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true, profile: data })
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
