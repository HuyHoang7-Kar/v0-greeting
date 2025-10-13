// app/api/internal/upsert-profile/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars for /api/internal/upsert-profile');
}

const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    // Accept either { id, full_name, role } OR { email, full_name, role }
    const { id, email, full_name, role } = payload as {
      id?: string;
      email?: string;
      full_name?: string;
      role?: string;
    };

    let userId = id;

    // If no id but email provided, try find auth.users by email (service role can read auth.users)
    if (!userId && email) {
      const { data: found, error: findErr } = await supabaseAdmin
        .from('auth.users')
        .select('id')
        .eq('email', email)
        .limit(1)
        .maybeSingle();

      if (findErr) {
        console.error('Error finding user by email', findErr);
        return NextResponse.json({ error: findErr.message }, { status: 500 });
      }

      if (!found || !(found as any).id) {
        // user not present yet (e.g. confirmation pending). Return 202 to indicate "not ready"
        return NextResponse.json({ ok: false, message: 'user-not-found-yet' }, { status: 202 });
      }

      userId = (found as any).id;
    }

    if (!userId) {
      return NextResponse.json({ error: 'must provide user id or email' }, { status: 400 });
    }

    // Build upsert payload for profiles
    const upsertPayload: any = { id: userId };
    if (typeof full_name !== 'undefined') upsertPayload.full_name = full_name;
    if (typeof role !== 'undefined') upsertPayload.role = role;

    const { data, error } = await supabaseAdmin
      .from('public.profiles')
      .upsert(upsertPayload, { returning: 'representation' });

    if (error) {
      console.error('Error upserting profile', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, profile: data?.[0] ?? null });
  } catch (err: any) {
    console.error('Internal upsert-profile error', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
