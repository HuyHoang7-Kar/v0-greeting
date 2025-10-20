import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Kiểm tra biến môi trường
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn("⚠️ Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

// Khởi tạo client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Nhận dữ liệu linh hoạt (nhiều frontend khác nhau)
    const student_id = body.student_id ?? body.user_id;
    const game_id = body.game_id ?? body.quiz_id ?? body.quizId;
    const score = body.score;
    const total_questions = body.total_questions ?? body.max_score ?? body.maxScore;
    const points_earned = body.points_earned ?? body.pointsEarned ?? 0;

    if (!student_id || !game_id || typeof score !== "number" || typeof total_questions !== "number") {
      return NextResponse.json(
        { error: "Missing or invalid fields (student_id, game_id, score, total_questions required)" },
        { status: 400 }
      );
    }

    // 👉 1. Gọi hàm record_score() trong Supabase (đã tạo trong SQL script)
    const { error: rpcError } = await supabase.rpc("record_score", {
      p_user_id: student_id,
      p_quiz_id: game_id,
      p_score: score,
      p_total_questions: total_questions,
    });

    if (rpcError) {
      console.error("Supabase RPC error:", rpcError);
      return NextResponse.json({ error: rpcError.message }, { status: 500 });
    }

    // 👉 2. (Tuỳ chọn) Cộng điểm thủ công vào user_points nếu có `points_earned`
    if (points_earned && Number(points_earned) > 0) {
      const { error: updateError } = await supabase.rpc("update_user_points", {
        p_user_id: student_id,
        p_points_earned: Number(points_earned),
      });
      if (updateError) console.warn("update_user_points warning:", updateError.message);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error("❌ Route POST /api/student/recordScore error:", err);
    return NextResponse.json({ error: err.message ?? String(err) }, { status: 500 });
  }
}
