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

const AVATARS = [
  { id: 'dog', name: 'Chó con 🐶', url: 'https://cdn-icons-png.flaticon.com/512/616/616408.png' },
  { id: 'cat', name: 'Mèo nhỏ 🐱', url: 'https://cdn-icons-png.flaticon.com/512/616/616430.png' },
  { id: 'rabbit', name: 'Thỏ trắng 🐰', url: 'https://cdn-icons-png.flaticon.com/512/616/616494.png' },
  { id: 'bear', name: 'Gấu nâu 🐻', url: 'https://cdn-icons-png.flaticon.com/512/616/616438.png' },
  { id: 'lion', name: 'Sư tử 🦁', url: 'https://cdn-icons-png.flaticon.com/512/616/616554.png' },
]

export default function SignUpPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<'student' | 'teacher' | 'admin'>('student')
  const [avatarId, setAvatarId] = useState<string>(AVATARS[0].id) // chọn theo id
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) return setError('Mật khẩu không khớp')
    if (password.length < 6) return setError('Mật khẩu phải có ít nhất 6 ký tự')

    setIsLoading(true)
    try {
      const selectedAvatar = AVATARS.find(a => a.id === avatarId)?.url
      if (!selectedAvatar) return setError('Avatar không hợp lệ')

      // Signup user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })
      if (signUpError) return setError(signUpError.message)
      if (!signUpData?.user?.id) return setError('Signup thất bại')

      const userId = signUpData.user.id

      // Gọi API backend để tạo profile + avatar
      const res = await fetch('/api/internal/upsert-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: userId,
          full_name: fullName,
          role,
          avatar_url: selectedAvatar,
          email,
        }),
      })
      const profileData = await res.json()
      if (!profileData.ok) console.warn('Lưu profile thất bại', profileData.error ?? profileData.message)

      router.push('/auth/signup-success')
    } catch (err: any) {
      setError(err.message ?? 'Có lỗi xảy ra')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-pink-50 to-sky-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 rounded-3xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-extrabold text-pink-500">Học tập cùng Flashcard 🎒</CardTitle>
            <CardDescription className="text-gray-600 mt-2">Chọn nhân vật và đăng ký tài khoản</CardDescription>
          </CardHeader>

          <CardContent>
            {/* AVATAR SELECT */}
            <div className="mb-4">
              <Label className="text-base font-semibold">Nhân vật của bé 🐾</Label>
              <Select value={avatarId} onValueChange={(v: string) => setAvatarId(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AVATARS.map(a => (
                    <SelectItem key={a.id} value={a.id}>
                      <div className="flex items-center gap-2">
                        <img src={a.url} className="w-8 h-8 rounded-full" />
                        <span>{a.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* SIGNUP FORM */}
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <Label>Họ và tên</Label>
                <Input value={fullName} onChange={e => setFullName(e.target.value)} required />
              </div>

              <div>
                <Label>Email</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>

              <div>
                <Label>Vai trò</Label>
                <Select value={role} onValueChange={(v: any) => setRole(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Học sinh</SelectItem>
                    <SelectItem value="teacher">Giáo viên</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Mật khẩu</Label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>

              <div>
                <Label>Xác nhận mật khẩu</Label>
                <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <Button type="submit" className="w-full bg-pink-500 hover:bg-pink-600 text-white text-lg rounded-xl" disabled={isLoading}>
                {isLoading ? 'Đang tạo...' : 'Bắt đầu học 🚀'}
              </Button>
            </form>

            <p className="text-center text-sm mt-4">
              Đã có tài khoản? <Link href="/auth/login" className="text-pink-500 font-semibold">Đăng nhập</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
