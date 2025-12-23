'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function SignUpPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<'student' | 'teacher' | 'admin'>('student')

  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

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

      const json = await res.json()
      return { ok: res.ok, status: res.status, body: json }
    } catch (err) {
      console.error('serverUpsertProfile error', err)
      return { ok: false, status: 500, body: { error: String(err) } }
    }
  }

  async function tryUpsertWithRetry(emailToCheck: string) {
    for (let i = 0; i < 6; i++) {
      const res = await serverUpsertProfile({ email: emailToCheck })

      if (res.ok && res.body?.ok) return res
      if (res.status === 202) {
        await new Promise((r) => setTimeout(r, 2000))
        continue
      }
      return res
    }
    return { ok: false, status: 408, body: { error: 'timeout' } }
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName,
            role,
          },
        },
      })

      if (error) {
        setError(error.message)
        return
      }

      const userId = data?.user?.id

      if (userId) {
        await serverUpsertProfile({ id: userId })
      } else {
        await tryUpsertWithRetry(email)
      }

      setInfo('Đăng ký thành công. Kiểm tra email để xác thực nếu cần.')
      router.push('/auth/signup-success')
    } catch (err: any) {
      setError(err.message ?? 'Đã xảy ra lỗi')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Tham Gia EduCards</CardTitle>
            <CardDescription>Tạo tài khoản để bắt đầu học tập</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <Label>Họ và Tên</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>

              <div>
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <div>
                <Label>Vai trò</Label>
                <Select value={role} onValueChange={(v) => setRole(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Học sinh</SelectItem>
                    <SelectItem value="teacher">Giáo viên</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Mật khẩu</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>

              <div>
                <Label>Xác nhận mật khẩu</Label>
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}
              {info && <p className="text-sm text-green-600">{info}</p>}

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm">
              Đã có tài khoản?{' '}
              <Link href="/auth/login" className="text-yellow-600">
                Đăng nhập
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
