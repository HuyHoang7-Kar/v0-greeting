// app/api/internal/upsert-profile/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('Missing SUPABASE env for internal upsert-profile API');
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, full_name, role } = body;
    if (!id || !role) return NextResponse.json({ error: 'id and role required' }, { status: 400 });

    const { error } = await supabaseAdmin
      .from('profiles')
      .upsert([{ id, full_name: full_name ?? '', role }], { returning: 'minimal' });

    if (error) {
      console.error('upsert-profile error', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err?.message ?? 'unknown' }, { status: 500 });
  }
}
