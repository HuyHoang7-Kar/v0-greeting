// route.ts
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server-client"

export async function POST(req: NextRequest) {
  const supabase = createClient() // client server dùng SERVICE_KEY
  const body = await req.json()
  const { action, id, email, full_name, role } = body

  try {
    if (action === "create") {
      const { data, error } = await supabase.auth.admin.createUser({ email, password: Math.random().toString(36).slice(-8) })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      await supabase.from("profiles").insert({ id: data.user.id, email, full_name, role })
      return NextResponse.json({ success: true })
    }
    if (action === "delete") {
      const { error } = await supabase.from("profiles").delete().eq("id", id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
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
