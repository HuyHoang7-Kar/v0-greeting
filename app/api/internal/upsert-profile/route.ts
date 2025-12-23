// app/api/internal/signup-user/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase env vars for /api/internal/signup-user')
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

const ALLOWED_ROLES = ['student', 'teacher', 'admin']
const DEFAULT_AVATAR = 'https://cdn-icons-png.flaticon.com/512/616/616408.png'

export async function POST(req: Request) {
  try {
    const { email, password, full_name, role } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email và password bắt buộc' }, { status: 400 })
    }

    const validatedRole = ALLOWED_ROLES.includes(role) ? role : 'student'

    // 1️⃣ Kiểm tra user đã tồn tại chưa
    const { data: existingUser } = await supabaseAdmin
      .from('auth.users')
      .select('id')
      .eq('email', email)
      .limit(1)
      .maybeSingle()

    let userId = existingUser?.id

    // 2️⃣ Nếu chưa có → tạo user mới
    if (!userId) {
      const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // auto confirm để tránh chờ xác thực email
      })
      if (createErr) {
        return NextResponse.json({ error: createErr.message }, { status: 500 })
      }
      userId = newUser.id
    }

    // 3️⃣ Upsert profile
    const { data: profileData, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .upsert(
        {
          id: userId,
          full_name,
          role: validatedRole,
          avatar_url: DEFAULT_AVATAR,
        },
        { returning: 'representation' }
      )

    if (profileErr) {
      return NextResponse.json({ error: profileErr.message }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      userId,
      profile: profileData?.[0] ?? null,
    })
  } catch (err: any) {
    console.error('Internal signup-user error', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}
