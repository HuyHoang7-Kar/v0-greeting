import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { StudentDashboard } from "@/components/student/dashboard"
import { TeacherDashboard } from "@/components/teacher/dashboard"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile to determine role
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  // Render appropriate dashboard based on role
  if (profile.role === "teacher") {
    return <TeacherDashboard user={data.user} profile={profile} />
  } else {
    return <StudentDashboard user={data.user} profile={profile} />
  }
}
