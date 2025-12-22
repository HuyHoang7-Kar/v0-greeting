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

// ================= AVATAR =================
const AVATARS = [
  { id: 'dog', name: 'Chó con 🐶', url: 'https://cdn-icons-png.flaticon.com/512/616/616408.png' },
  { id: 'cat', name: 'Mèo nhỏ 🐱', url: 'https://cdn-icons-png.flaticon.com/512/616/616430.png' },
  { id: 'rabbit', name: 'Thỏ trắng 🐰', url: 'https://cdn-icons-png.flaticon.com/512/616/616494.png' },
  { id: 'bear', name: 'Gấu nâu 🐻', url: 'https://cdn-icons-png.flaticon.com/512/616/616438.png' },
  { id: 'lion', name: 'Sư tử 🦁', url: 'https://cdn-icons-png.flaticon.com/512/616/616554.png' },
]

// ================= SIGNUP PAGE =================
export default function SignUpPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<'student' | 'teacher' | 'admin'>('student')
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined)

  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // ================= UPSERT PROFILE =================
  async function serverUpsertProfile(id: string) {
    if (!fullName.trim()) throw new Error("Họ và tên không được để trống")

    const validRoles = ['student', 'teacher', 'admin']
    const safeRole = validRoles.includes(role) ? role : 'student'

    // nếu user không chọn avatar -> dùng default
    const finalAvatar = avatarUrl ?? AVATARS[0].url

    const payload: any = {
      id,
      full_name: fullName.trim(),
      role: safeRole,
      avatar_url: finalAvatar,
    }

    const res = await fetch('/app/api/internal/upsert-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Upsert profile failed')
  }

  // ================= HANDLE SIGNUP =================
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Mật khẩu không khớp')
      return
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    if (!fullName.trim()) {
      setError('Họ và tên không được để trống')
      return
    }

    setIsLoading(true)
    try {
      // 🔥 chỉ tạo user với email + password
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {} // không gửi full_name, role hay avatar
        }
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data?.user?.id) {
        await serverUpsertProfile(data.user.id)
      }

      router.push('/auth/signup-success')
    } catch (err: any) {
      setError(err.message ?? 'Có lỗi xảy ra')
    } finally {
      setIsLoading(false)
    }
  }

  // ================= RENDER =================
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-pink-50 to-sky-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 rounded-3xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-extrabold text-pink-500">Học tập cùng Flashcard 🎒</CardTitle>
            <CardDescription className="text-gray-600 mt-2">Chọn nhân vật và bắt đầu học nhé!</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
              {/* AVATAR */}
              <div>
                <Label className="text-base font-semibold">Nhân vật của bé 🐾</Label>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  {AVATARS.map(a => (
                    <div
                      key={a.id}
                      onClick={() => setAvatarUrl(a.url)}
                      className={`cursor-pointer rounded-2xl p-3 text-center border-2 transition ${
                        avatarUrl === a.url ? 'border-yellow-400 bg-yellow-50 scale-105' : 'border-transparent hover:bg-white'
                      }`}
                    >
                      <img src={a.url} className="w-16 h-16 mx-auto" />
                      <p className="text-sm mt-1">{a.name}</p>
                    </div>
                  ))}
                </div>
                {!avatarUrl && <p className="text-xs text-gray-500 mt-2">Nếu không chọn, hệ thống sẽ dùng avatar mặc định</p>}
              </div>

              {/* FULLNAME */}
              <div>
                <Label>Họ và tên</Label>
                <Input value={fullName} onChange={e => setFullName(e.target.value)} required />
              </div>

              {/* EMAIL */}
              <div>
                <Label>Email</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>

              {/* ROLE */}
              <div>
                <Label>Vai trò</Label>
                <Select value={role} onValueChange={v => setRole(v as 'student' | 'teacher' | 'admin')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Học sinh</SelectItem>
                    <SelectItem value="teacher">Giáo viên</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* PASSWORD */}
              <div>
                <Label>Mật khẩu</Label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>

              {/* CONFIRM PASSWORD */}
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
              Đã có tài khoản?{' '}
              <Link href="/auth/login" className="text-pink-500 font-semibold">Đăng nhập</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
