// app/api/internal/upsert-profile/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Lấy env server-side, dùng cho service role
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    '[upsert-profile] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set yet. HMR may trigger this warning.'
  )
}

// Khởi tạo Supabase Admin (server-side only)
const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  : null

export async function POST(req: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: 'Supabase service role client not initialized' },
      { status: 500 }
    )
  }

  try {
    const payload = await req.json()
    const { id, email, full_name, role } = payload as {
      id?: string
      email?: string
      full_name?: string
      role?: string
    }

    let userId = id

    // Nếu không có id mà có email → tìm user
    if (!userId && email) {
      const { data: found, error: findErr } = await supabaseAdmin
        .from('auth.users')
        .select('id')
        .eq('email', email)
        .limit(1)
        .maybeSingle()

      if (findErr) {
        console.error('[upsert-profile] Error finding user by email:', findErr)
        return NextResponse.json({ error: findErr.message }, { status: 500 })
      }

      if (!found?.id) {
        // user chưa xác thực email
        return NextResponse.json(
          { ok: false, message: 'user-not-found-yet' },
          { status: 202 }
        )
      }

      userId = found.id
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'must provide user id or email' },
        { status: 400 }
      )
    }

    const upsertPayload: any = { id: userId }
    if (full_name) upsertPayload.full_name = full_name
    if (role) upsertPayload.role = role

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .upsert(upsertPayload, { returning: 'representation' })

    if (error) {
      console.error('[upsert-profile] Error upserting profile:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, profile: data?.[0] ?? null })
  } catch (err: any) {
    console.error('[upsert-profile] Unexpected error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
