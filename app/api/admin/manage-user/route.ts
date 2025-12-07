import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

const supabaseServer = () =>
  createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

export async function POST(req: NextRequest) {
  const supabase = supabaseServer()
  const { action, id, email, full_name, role } = await req.json()

  try {
    if (action === "create") {
      const tempPassword = Math.random().toString(36).slice(-8)

      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password: tempPassword,
        email_redirect_to: "https://your-app.vercel.app/login"
      })

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        email,
        full_name,
        role
      })

      if (profileError) {
        await supabase.auth.admin.deleteUser(data.user.id)
        return NextResponse.json({ error: profileError.message }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    if (action === "delete") {
      await supabase.from("class_members").delete().eq("user_id", id)
      await supabase.from("game_plays").delete().eq("user_id", id)
      await supabase.from("game_scores").delete().eq("user_id", id)
      await supabase.from("notes").delete().eq("user_id", id)
      await supabase.from("profiles").delete().eq("id", id)
      await supabase.auth.admin.deleteUser(id)
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

// Cho phép fetch danh sách user
export async function GET(req: NextRequest) {
  const supabase = supabaseServer()
  const { data, error } = await supabase.from("profiles").select("*")
  if (error) return NextResponse.json({ users: [], error: error.message }, { status: 500 })
  return NextResponse.json({ users: data ?? [] })
}
