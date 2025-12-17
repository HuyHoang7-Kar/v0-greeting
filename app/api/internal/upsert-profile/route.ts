import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
        { ok: false, error: 'Missing user id' },
        { status: 400 }
      )
    }

    /* 🔎 Check existing profile */
    const { data: existingProfile, error: selectError } =
      await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('id', id)
        .maybeSingle()

    if (selectError) {
      return NextResponse.json(
        { ok: false, error: selectError.message },
        { status: 500 }
      )
    }

    /* 🆕 INSERT */
    if (!existingProfile) {
      const { data, error } = await supabaseAdmin
        .from('profiles')
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
        return NextResponse.json(
          { ok: false, error: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({ ok: true, profile: data })
    }

    /* ♻️ UPDATE */
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name,
        role,
        avatar_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, profile: data })
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    )
  }
}
