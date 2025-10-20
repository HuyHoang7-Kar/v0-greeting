import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const student_id = searchParams.get("student_id")

  if (!student_id) return NextResponse.json({ error: "Missing student_id" }, { status: 400 })

  const { data, error } = await supabase
    .from("profiles")
    .select("total_points")
    .eq("id", student_id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ total_points: data?.total_points ?? 0 })
}
