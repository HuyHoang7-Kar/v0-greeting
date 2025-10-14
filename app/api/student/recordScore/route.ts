import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn("Supabase env vars missing: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // chấp nhận cả student_id hoặc user_id tên trường hợp bạn dùng khác
    const student_id = body.student_id ?? body.user_id;
    const game_id = body.game_id ?? body.quiz_id ?? body.quizId;
    const score = body.score;
    const max_score = body.max_score ?? body.maxScore ?? body.total_questions;
    const time_taken = body.time_taken ?? body.timeTaken ?? null;
    const points_earned = body.points_earned ?? body.pointsEarned ?? 0;

    if (!student_id || !game_id || typeof score !== "number" || typeof max_score !== "number") {
      return NextResponse.json({ error: "Missing or invalid fields (student_id, game_id, score, max_score required)" }, { status: 400 });
    }

    // insert result
    const { data, error } = await supabase
      .from("game_results")
      .insert([{
        user_id: student_id,
        game_id,
        score,
        max_score,
        time_taken,
        points_earned
      }])
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message ?? "Insert failed" }, { status: 500 });
    }

    // update total points in profiles (optional) via RPC
    try {
      if (points_earned && Number(points_earned) !== 0) {
        const { error: rpcError } = await supabase.rpc("update_user_points", {
          p_user_id: student_id,
          p_points_earned: Number(points_earned)
        });
        if (rpcError) {
          console.warn("RPC update_user_points warning:", rpcError);
          // không abort nếu rpc fail; vẫn trả về success cho insert
        }
      }
    } catch (rpcErr) {
      console.warn("RPC error (ignored):", rpcErr);
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err: any) {
    console.error("Route POST /api/student/recordScore error:", err);
    return NextResponse.json({ error: err.message ?? String(err) }, { status: 500 });
  }
}
