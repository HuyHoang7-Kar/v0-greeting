import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase/server-client"

export async function POST(req: NextRequest) {
  const supabase = supabaseServer()
  const body = await req.json()
  const { action, id, email, full_name, role } = body

  try {
    if (action === "create") {
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password: Math.random().toString(36).slice(-8),
      })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        email,
        full_name,
        role,
      })
      if (profileError)
        return NextResponse.json({ error: profileError.message }, { status: 500 })

      return NextResponse.json({ success: true })
    }

    if (action === "delete") {
      // Xóa tất cả FK liên quan trước
      await supabase.from("class_members").delete().eq("user_id", id)
      await supabase.from("game_plays").delete().eq("user_id", id)
      await supabase.from("game_scores").delete().eq("user_id", id)
      await supabase.from("notes").delete().eq("user_id", id)

      const { error: profileError } = await supabase.from("profiles").delete().eq("id", id)
      if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })

      const { error: authError } = await supabase.auth.admin.deleteUser(id)
      if (authError) return NextResponse.json({ error: authError.message }, { status: 500 })

      return NextResponse.json({ success: true })
    }

    if (action === "updateRole") {
      const { error } = await supabase.from("profiles").update({ role }).eq("id", id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
