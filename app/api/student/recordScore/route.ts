import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // dùng key có quyền ghi dữ liệu
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { student_id, game_id, score } = body;

    if (!student_id || !game_id || typeof score !== "number") {
      return NextResponse.json(
        { error: "Missing or invalid fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("student_scores")
      .insert([{ student_id, game_id, score }])
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
