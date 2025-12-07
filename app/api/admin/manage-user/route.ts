import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase/server-client"

export async function POST(req: NextRequest) {
  const supabase = supabaseServer()
  const body = await req.json()
  const { action, id, email, full_name, role } = body

  try {
    if (action === "create") {
      const tempPassword = Math.random().toString(36).slice(-8)

      // Tạo user Auth + gửi invite email
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: false,
        invite_email: true
      })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      // Kiểm tra user trong profiles đã tồn tại chưa
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", data.user.id)
        .single()
        .catch(() => null)

      if (existingProfile)
        return NextResponse.json({ error: "User đã tồn tại trong profiles" }, { status: 400 })

      // Insert vào profiles
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        email,
        full_name,
        role,
      })
      if (profileError) {
        // rollback Auth user
        await supabase.auth.admin.deleteUser(data.user.id)
        return NextResponse.json({ error: profileError.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, tempPassword })
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
