'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function SignUpPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<'student' | 'teacher'>('student')

  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Optional: call server API to upsert profile using service role key (bypass RLS)
  async function serverUpsertProfile(userId: string) {
    try {
      const res = await fetch('/api/internal/upsert-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, full_name: fullName, role })
      })
      const j = await res.json()
      if (!res.ok) {
        console.warn('server upsert-profile response error', j)
      } else {
        console.log('server upsert-profile ok', j)
      }
      return j
    } catch (err) {
      console.error('serverUpsertProfile error', err)
      return { error: String(err) }
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)

    if (password !== confirmPassword) {
      setError('Mật khẩu không khớp')
      return
    }
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    setIsLoading(true)
    try {
      // Prepare metadata under both keys (data and user_metadata) to support SDK variations
      const signupOptions: any = {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/login`,
        data: { role, full_name: fullName },
        user_metadata: { role, full_name: fullName },
      }

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: signupOptions,
      } as any)

      console.debug('signUp response:', signUpData, signUpError)

      if (signUpError) {
        // show helpful message if supabase returns an error
        console.error('SignUp Error:', signUpError)
        setError(signUpError.message ?? 'Đăng ký thất bại, vui lòng thử lại.')
        setIsLoading(false)
        return
      }

      // If signUp returns a user id immediately (auto-confirm flows), call server upsert to ensure profiles created.
      const userId = signUpData?.user?.id
      if (userId) {
        // call server to upsert profile using service role (safe)
        await serverUpsertProfile(userId)
      }

      // Inform user next steps (check email if verification required)
      setInfo('Đăng ký thành công. Kiểm tra email để xác thực nếu cần.')
      // redirect to signup-success (or you can show message)
      router.push('/auth/signup-success')
    } catch (err: unknown) {
      console.error('Signup Catch Error:', err)
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-3xl font-bold text-gray-900">Tham Gia EduCards</CardTitle>
            <CardDescription className="text-gray-600 mt-2">Tạo tài khoản để bắt đầu học tập</CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và Tên</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Địa Chỉ Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nguyen@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Tôi là</Label>
                <Select value={role} onValueChange={(value: 'student' | 'teacher') => setRole(value)}>
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
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác Nhận Mật Khẩu</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {info && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                  {info}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? 'Đang tạo tài khoản...' : 'Tạo Tài Khoản'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Đã có tài khoản?{' '}
                <Link href="/auth/login" className="font-medium text-yellow-600 hover:text-yellow-500">
                  Đăng nhập tại đây
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
