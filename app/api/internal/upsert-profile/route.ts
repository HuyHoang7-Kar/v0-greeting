// app/api/internal/upsert-profile/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

const ALLOWED_ROLES = ['student', 'teacher', 'admin']
const DEFAULT_AVATAR = 'https://cdn-icons-png.flaticon.com/512/616/616408.png'

export async function POST(req: Request) {
  try {
    const payload = await req.json()
    const { id, email, full_name, role } = payload as {
      id?: string
      email?: string
      full_name?: string
      role?: string
    }

    let userId = id

    // Nếu không có id nhưng có email → tìm user trong auth.users
    if (!userId && email) {
      const { data: found, error: findErr } = await supabaseAdmin
        .from('auth.users')
        .select('id')
        .eq('email', email)
        .limit(1)
        .maybeSingle()

      if (findErr) {
        return NextResponse.json({ error: 'Không thể tìm user: ' + findErr.message }, { status: 500 })
      }

      if (!found || !found.id) {
        return NextResponse.json({ ok: false, message: 'user-not-found-yet' }, { status: 202 })
      }

      userId = found.id
    }

    if (!userId) {
      return NextResponse.json({ error: 'Phải cung cấp user id hoặc email' }, { status: 400 })
    }

    // Chuẩn hóa role
    const validatedRole = role && ALLOWED_ROLES.includes(role) ? role : 'student'

    // Build payload upsert
    const upsertPayload: any = { id: userId, role: validatedRole, avatar_url: DEFAULT_AVATAR }
    if (full_name) upsertPayload.full_name = full_name

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .upsert(upsertPayload, { returning: 'representation' })

    if (error) {
      return NextResponse.json({ error: 'Lỗi upsert profile: ' + error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, profile: data?.[0] ?? null })
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Internal server error: ' + (err instanceof Error ? err.message : String(err)) },
      { status: 500 }
    )
  }
}
