import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/client" // dùng client chuẩn của bạn

export async function POST(req: NextRequest) {
  const supabase = createClient() // client server hoặc service key
  const body = await req.json()
  const { action, id, email, full_name, role } = body

  try {
    // ==================== FETCH USERS ====================
    if (action === "fetch") {
      const { data, error } = await supabase.from("profiles").select("id, email, full_name, role")
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ users: data })
    }

    // ==================== CREATE USER ====================
    if (action === "create") {
      if (!email || !full_name || !role) {
        return NextResponse.json({ error: "Email, full_name và role là bắt buộc" }, { status: 400 })
      }

      // Tạo user mới bằng Supabase Admin API
      const { data: userData, error: createError } = await supabase.auth.admin.createUser({
        email,
        password: Math.random().toString(36).slice(-8),
      })
      if (createError) return NextResponse.json({ error: createError.message }, { status: 500 })

      // Thêm profile vào bảng profiles
      const { error: insertError } = await supabase.from("profiles").insert({
        id: userData.user.id,
        email,
        full_name,
        role,
      })
      if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })

      return NextResponse.json({ success: true })
    }

    // ==================== DELETE USER ====================
    if (action === "delete") {
      if (!id) return NextResponse.json({ error: "id là bắt buộc" }, { status: 400 })

      const { error } = await supabase.from("profiles").delete().eq("id", id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      // Optionally: xóa luôn user từ auth.users nếu muốn
      // const { error: authError } = await supabase.auth.admin.deleteUser(id)
      // if (authError) console.warn("Không xóa được user trong auth:", authError.message)

      return NextResponse.json({ success: true })
    }

    // ==================== UPDATE ROLE ====================
    if (action === "updateRole") {
      if (!id || !role) return NextResponse.json({ error: "id và role là bắt buộc" }, { status: 400 })

      const { error } = await supabase.from("profiles").update({ role }).eq("id", id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
