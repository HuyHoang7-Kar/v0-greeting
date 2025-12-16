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

/* ================= AVATARS ================= */
const AVATARS = [
  "https://cdn-icons-png.flaticon.com/512/4140/4140048.png",
  "https://cdn-icons-png.flaticon.com/512/4140/4140051.png",
  "https://cdn-icons-png.flaticon.com/512/1998/1998610.png",
  "https://cdn-icons-png.flaticon.com/512/616/616408.png",
  "https://cdn-icons-png.flaticon.com/512/616/616430.png",
]

export default function SignUpPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<'student' | 'teacher' | 'admin'>('student')

  // ⭐ AVATAR
  const [avatarUrl, setAvatarUrl] = useState<string>(AVATARS[0])

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
          avatar_url: avatarUrl, // ⭐ LƯU AVATAR
        }),
      })
      const j = await res.json()
      return { ok: res.ok, status: res.status, body: j }
    } catch (err) {
      console.error('serverUpsertProfile error', err)
      return { ok: false, status: 500, body: { error: String(err) } }
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

    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
            avatar_url: avatarUrl, // ⭐ METADATA
          },
        },
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data?.user?.id) {
        await serverUpsertProfile({ id: data.user.id })
      }

      setInfo('Đăng ký thành công 🎉')
      router.push('/auth/signup-success')
    } catch (err: any) {
      setError(err.message ?? 'Có lỗi xảy ra')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Tham Gia Học tập cùng Flashcard 🎒</CardTitle>
            <CardDescription>Chọn avatar và tạo tài khoản</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">

              {/* AVATAR */}
              <div>
                <Label>Chọn Avatar</Label>
                <div className="flex gap-3 mt-2 flex-wrap">
                  {AVATARS.map((url) => (
                    <img
                      key={url}
                      src={url}
                      onClick={() => setAvatarUrl(url)}
                      className={`w-14 h-14 rounded-full cursor-pointer border-4 ${
                        avatarUrl === url ? 'border-yellow-500' : 'border-transparent'
                      } hover:scale-110 transition`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <Label>Họ và tên</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>

              <div>
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <div>
                <Label>Vai trò</Label>
                <Select value={role} onValueChange={(v: any) => setRole(v)}>
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

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <Button type="submit" className="w-full bg-yellow-500 text-white" disabled={isLoading}>
                {isLoading ? 'Đang tạo...' : 'Tạo tài khoản'}
              </Button>
            </form>

            <p className="text-center text-sm mt-4">
              Đã có tài khoản?{' '}
              <Link href="/auth/login" className="text-yellow-600 font-medium">
                Đăng nhập
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
