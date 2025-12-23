import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Chỉ chạy server-side với service role
const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('[upsert-profile] Supabase env not set')
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

export async function POST(req: Request) {
  try {
    const { id, full_name, role, email } = await req.json() as {
      id?: string
      full_name?: string
      role?: 'student' | 'teacher' | 'admin'
      email?: string
    }

    if (!id && !email) {
      return NextResponse.json({ error: 'must provide user id or email' }, { status: 400 })
    }

    let userId = id

    // Nếu không có id mà có email → tìm user trong auth.users
    if (!userId && email) {
      const { data: found, error: findErr } = await supabaseAdmin
        .from('auth.users')
        .select('id')
        .eq('email', email)
        .limit(1)
        .maybeSingle()

      if (findErr) return NextResponse.json({ error: findErr.message }, { status: 500 })
      if (!found?.id) return NextResponse.json({ ok: false, message: 'user-not-found-yet' }, { status: 202 })
      userId = found.id
    }

    const upsertPayload: any = { id: userId }
    if (full_name) upsertPayload.full_name = full_name
    if (role) upsertPayload.role = role

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .upsert(upsertPayload, { returning: 'representation' })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true, profile: data?.[0] ?? null })
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
