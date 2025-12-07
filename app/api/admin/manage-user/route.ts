import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server-client"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { action, id, email, full_name, role } = body

  try {
    if (action === "create") {
      // Tạo user auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: Math.random().toString(36).slice(-8)
      })
      if (authError) return NextResponse.json({ error: authError.message }, { status: 500 })

      // Thêm vào profiles
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .insert({ id: authData.user.id, email, full_name, role })
      if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })

      return NextResponse.json({ success: true })
    }

    if (action === "delete") {
      // Xóa profile trước để tránh FK error
      const { error: profileError } = await supabaseAdmin.from("profiles").delete().eq("id", id)
      if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })

      // Xóa user auth
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id)
      if (authError) return NextResponse.json({ error: authError.message }, { status: 500 })

      return NextResponse.json({ success: true })
    }

    if (action === "updateRole") {
      const { error } = await supabaseAdmin.from("profiles").update({ role }).eq("id", id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
