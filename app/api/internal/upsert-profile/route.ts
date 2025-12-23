// app/api/internal/upsert-profile/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseAdmin() {
  const SUPABASE_URL = process.env.SUPABASE_URL
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('[upsert-profile] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set')
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
}

export async function POST(req: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin()

    const payload = await req.json()
    const { id, email, full_name, role, avatar_url } = payload as {
      id?: string
      email?: string
      full_name?: string
      role?: string
      avatar_url?: string
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
        // User chưa xác thực email
        return NextResponse.json({ ok: false, message: 'user-not-found-yet' }, { status: 202 })
      }

      userId = found.id
    }

    if (!userId) {
      return NextResponse.json({ error: 'must provide user id or email' }, { status: 400 })
    }

    // Build payload upsert
    const upsertPayload: any = { id: userId }
    if (full_name) upsertPayload.full_name = full_name
    if (role) upsertPayload.role = role
    if (avatar_url) upsertPayload.avatar_url = avatar_url

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
