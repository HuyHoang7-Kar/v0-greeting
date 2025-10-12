'use client'

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SignUpPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [role, setRole] = useState<"student" | "teacher">("student")

  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError("Mật khẩu không khớp")
      return
    }
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự")
      return
    }

    setIsLoading(true)
    try {
      // 1) Sign up — embed role + full_name into user metadata (key: data OR user_metadata depending on supabase version)
      const signUpPayload: any = {
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/auth/login`,
          // Supabase v2 supports `data` for metadata; older libs used user_metadata
          data: { role, full_name: fullName }
        }
      }

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp(signUpPayload as any)

      if (signUpError) {
        console.error("SignUp Error:", signUpError)
        setError(signUpError.message || "Đăng ký thất bại, vui lòng thử lại.")
        return
      }

      // 2) If server returned user immediately (no email confirm required), upsert profile now
      //    If user must verify email, DB trigger (see SQL below) will create profile from metadata.
      const uid = signUpData?.user?.id
      if (uid) {
        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert(
            [
              {
                id: uid,             // profiles.id FK -> auth.users.id
                full_name: fullName,
                role: role
              }
            ],
            { returning: 'minimal' } // reduce payload
          )
        if (upsertError) {
          console.error("Upsert profile error:", upsertError)
          // không block flow nhưng báo nhẹ
          setError("Đăng ký thành công nhưng lưu profile thất bại. Liên hệ admin.")
          // continue to redirect
        }
      }

      // 3) redirect to signup-success (or instruct: check email)
      router.push('/auth/signup-success')
    } catch (err: unknown) {
      console.error("Signup Catch Error:", err)
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-3xl font-bold text-gray-900">
              Tham Gia EduCards
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Tạo tài khoản để bắt đầu học tập
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và Tên</Label>
                <Input id="fullName" type="text" placeholder="Nguyễn Văn A" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Địa Chỉ Email</Label>
                <Input id="email" type="email" placeholder="nguyen@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Tôi là</Label>
                <Select value={role} onValueChange={(value: "student" | "teacher") => setRole(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn vai trò của bạn" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Học Sinh</SelectItem>
                    <SelectItem value="teacher">Giáo Viên</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mật Khẩu</Label>
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác Nhận Mật Khẩu</Label>
                <Input id="confirmPassword" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>

              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{error}</div>}

              <Button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium" disabled={isLoading}>
                {isLoading ? "Đang tạo tài khoản..." : "Tạo Tài Khoản"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">Đã có tài khoản? <Link href="/auth/login" className="font-medium text-yellow-600 hover:text-yellow-500">Đăng nhập tại đây</Link></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
