import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars for /api/internal/upsert-profile'
  )
}

const supabaseAdmin = createClient(
  SUPABASE_URL!,
  SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false },
  }
)

// 🧸 Avatar hoạt hình mặc định (trung tính – phù hợp trẻ em)
const DEFAULT_AVATARS = [
  '/avatars/animal-lion.png',
  '/avatars/animal-elephant.png',
  '/avatars/animal-panda.png',
  '/avatars/animal-dolphin.png',
  '/avatars/animal-bear.png',
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
    } = payload as {
      id?: string
      email?: string
      full_name?: string
      role?: string
      avatar_url?: string
    }

    let userId = id

    // 🔍 Nếu chưa có id → tìm theo email
    if (!userId && email) {
      const { data: found, error: findErr } = await supabaseAdmin
        .from('auth.users')
        .select('id')
        .eq('email', email)
        .limit(1)
        .maybeSingle()

      if (findErr) {
        console.error('Error finding user by email', findErr)
        return NextResponse.json({ error: findErr.message }, { status: 500 })
      }

      if (!found || !(found as any).id) {
        return NextResponse.json(
          { ok: false, message: 'user-not-found-yet' },
          { status: 202 }
        )
      }

      userId = (found as any).id
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'must provide user id or email' },
        { status: 400 }
      )
    }

    // 🧠 Build payload upsert
    const upsertPayload: any = {
      id: userId,
      updated_at: new Date().toISOString(),
    }

    if (typeof full_name !== 'undefined')
      upsertPayload.full_name = full_name

    if (typeof role !== 'undefined')
      upsertPayload.role = role

    // ⭐ FIX QUAN TRỌNG: avatar_url
    if (typeof avatar_url !== 'undefined' && avatar_url !== null) {
      upsertPayload.avatar_url = avatar_url
    } else {
      // nếu chưa có avatar → gán avatar hoạt hình mặc định
      upsertPayload.avatar_url = getRandomAvatar()
    }

    const { data, error } = await supabaseAdmin
      .from('public.profiles')
      .upsert(upsertPayload, {
        onConflict: 'id',
        returning: 'representation',
      })

    if (error) {
      console.error('Error upserting profile', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      profile: data?.[0] ?? null,
    })
  } catch (err: any) {
    console.error('Internal upsert-profile error', err)
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    )
  }
}
