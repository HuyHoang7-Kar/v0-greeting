// app/api/internal/upsert-profile/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { persistSession: false },
  }
)

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

    // ✅ TÌM USER BẰNG ADMIN API (ĐÚNG CÁCH)
    if (!userId && email) {
      const { data, error } =
        await supabaseAdmin.auth.admin.listUsers({
          page: 1,
          perPage: 1,
          email,
        })

      if (error) {
        console.error('Error finding user by email', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      if (!data?.users?.length) {
        return NextResponse.json(
          { ok: false, message: 'user-not-found-yet' },
          { status: 202 }
        )
      }

      userId = data.users[0].id
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'must provide user id or email' },
        { status: 400 }
      )
    }

    // ✅ UPSERT PROFILES
    const upsertPayload: any = { id: userId }
    if (full_name !== undefined) upsertPayload.full_name = full_name
    if (role !== undefined) upsertPayload.role = role

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .upsert(upsertPayload, { onConflict: 'id' })
      .select()
      .single()

    if (error) {
      console.error('Error upserting profile', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, profile: data })
  } catch (err: any) {
    console.error('Internal upsert-profile error', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
