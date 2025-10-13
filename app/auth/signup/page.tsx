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

  // serverUpsertProfile can accept either id or email
  async function serverUpsertProfile(opts: { id?: string; email?: string }) {
    try {
      const res = await fetch('/api/internal/upsert-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...opts,
          full_name: fullName,
          role,
        }),
      })
      const j = await res.json()
      return { ok: res.ok, status: res.status, body: j }
    } catch (err) {
      console.error('serverUpsertProfile error', err)
      return { ok: false, status: 500, body: { error: String(err) } }
    }
  }

  // helper: retry polling for user/profile readiness
  async function tryUpsertWithRetry(emailToCheck: string, maxAttempts = 6, delayMs = 2000) {
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const res = await serverUpsertProfile({ email: emailToCheck })
      if (res.ok && res.body?.ok) {
        return { ok: true, profile: res.body.profile ?? null }
      }
      if (res.status === 202 && res.body?.message === 'user-not-found-yet') {
        // wait then retry
        await new Promise((r) => setTimeout(r, delayMs))
        continue
      }
      // other errors -> return
      return { ok: false, error: res.body ?? 'unknown_error', status: res.status }
    }
    return { ok: false, error: 'timeout_waiting_for_user', status: 408 }
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
        console.error('SignUp Error:', signUpError)
        setError(signUpError.message ?? 'Đăng ký thất bại, vui lòng thử lại.')
        setIsLoading(false)
        return
      }

      const userId = signUpData?.user?.id ?? null

      if (userId) {
        // if SDK returned user id immediately, upsert with id
        const res = await serverUpsertProfile({ id: userId })
        if (!res.ok) console.warn('server upsert-profile (by id) failed', res)
      } else {
        // If no id returned (email confirmation flow), call server with email and retry polling
        const res = await tryUpsertWithRetry(email)
        if (!res.ok) {
          console.warn('server upsert-profile (by email) failed or timed out', res)
        }
      }

      setInfo('Đăng ký thành công. Kiểm tra email để xác thực nếu cần.')
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
