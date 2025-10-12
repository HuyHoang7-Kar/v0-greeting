// app/api/teacher/fillblank/route.ts
import { NextResponse } from 'next/server';
import { createServerSupabaseClientWrapper } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = createServerSupabaseClientWrapper();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const uid = session.user.id;
  // check role: must be teacher or admin
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', uid).single();
  const role = profile?.role ?? 'student';
  if (!(role === 'teacher' || role === 'admin')) {
    return NextResponse.json({ error: 'Forbidden — teacher only' }, { status: 403 });
  }

  // expected body: { title, description?, is_public?, questions: [{ index_no, prompt, answer }] }
  const body = await req.json();
  const { title, description = null, is_public = false, questions = [] } = body;

  if (!title || !Array.isArray(questions) || questions.length === 0) {
    return NextResponse.json({ error: 'Invalid payload: title + questions required' }, { status: 400 });
  }

  // create game
  const { data: gameData, error: gameError } = await supabase
    .from('fill_blank_games')
    .insert([{ owner_id: uid, title, description, is_public }])
    .select('*')
    .single();

  if (gameError || !gameData) {
    return NextResponse.json({ error: gameError?.message || 'Failed to create game' }, { status: 500 });
  }

  const gameId = gameData.id;

  // prepare questions rows
  const qRows = questions.map((q: any, idx: number) => ({
    game_id: gameId,
    index_no: q.index_no ?? idx + 1,
    prompt: q.prompt,
    answer: q.answer
  }));

  const { data: qData, error: qError } = await supabase.from('fill_blank_questions').insert(qRows);

  if (qError) {
    // rollback: delete created game
    await supabase.from('fill_blank_games').delete().eq('id', gameId);
    return NextResponse.json({ error: qError.message || 'Failed to insert questions' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, game: gameData, questions: qData });
}

// GET: list games of current user (teacher) or public games if query param public=1
export async function GET(req: Request) {
  const supabase = createServerSupabaseClientWrapper();
  const { data: { session } } = await supabase.auth.getSession();
  const url = new URL(req.url);
  const publicOnly = url.searchParams.get('public') === '1';

  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const uid = session.user.id;

  if (publicOnly) {
    const { data, error } = await supabase.from('fill_blank_games').select('*').eq('is_public', true).order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  }

  // return games owned by user
  const { data, error } = await supabase.from('fill_blank_games').select('*').eq('owner_id', uid).order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
