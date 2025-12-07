// /app/api/admin/manage-user/route.ts
import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase/client"  // import từ file bạn vừa viết

export async function POST(req: NextRequest) {
  const supabase = supabaseServer()
  try {
    const { action, id, email, full_name, role } = await req.json()

    if (action === "create") {
      if (!email || !full_name || !role) {
        return NextResponse.json({ error: "Thiếu thông tin user" }, { status: 400 })
      }

      const tempPassword = Math.random().toString(36).slice(-8)

      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: tempPassword,
        email_redirect_to: "https://your-app.vercel.app/login",
        user_metadata: { full_name, role }
      })

      if (authError) return NextResponse.json({ error: authError.message }, { status: 500 })

      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        email,
        full_name,
        role
      })

      if (profileError) {
        await supabase.auth.admin.deleteUser(authData.user.id)
        return NextResponse.json({ error: profileError.message }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    if (action === "delete") {
      if (!id) return NextResponse.json({ error: "Thiếu id user" }, { status: 400 })

      await supabase.from("class_members").delete().eq("user_id", id)
      await supabase.from("game_plays").delete().eq("user_id", id)
      await supabase.from("game_scores").delete().eq("user_id", id)
      await supabase.from("notes").delete().eq("user_id", id)
      await supabase.from("profiles").delete().eq("id", id)
      await supabase.auth.admin.deleteUser(id)

      return NextResponse.json({ success: true })
    }

    if (action === "updateRole") {
      if (!id || !role) return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 })

      const { error } = await supabase.from("profiles").update({ role }).eq("id", id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Lỗi server" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const supabase = supabaseServer()
  try {
    const { data, error } = await supabase.from("profiles").select("*")
    if (error) return NextResponse.json({ users: [], error: error.message }, { status: 500 })
    return NextResponse.json({ users: data ?? [] })
  } catch (err: any) {
    return NextResponse.json({ users: [], error: err.message || "Lỗi server" }, { status: 500 })
  }
}
