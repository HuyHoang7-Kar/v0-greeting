'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

const AVATARS = [
  { id: 'dog', name: 'Chó con 🐶', url: 'https://cdn-icons-png.flaticon.com/512/616/616408.png' },
  { id: 'cat', name: 'Mèo nhỏ 🐱', url: 'https://cdn-icons-png.flaticon.com/512/616/616430.png' },
  { id: 'rabbit', name: 'Thỏ trắng 🐰', url: 'https://cdn-icons-png.flaticon.com/512/616/616494.png' },
  { id: 'bear', name: 'Gấu nâu 🐻', url: 'https://cdn-icons-png.flaticon.com/512/616/616438.png' },
  { id: 'lion', name: 'Sư tử 🦁', url: 'https://cdn-icons-png.flaticon.com/512/616/616554.png' },
]

export default function SelectAvatarPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = searchParams.get('userId')
  const supabase = createClient()

  const [avatarUrl, setAvatarUrl] = useState<string>(AVATARS[0].url)
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveAvatar = async () => {
    if (!userId) {
      alert('User ID không tồn tại')
      return
    }
    setIsSaving(true)
    try {
      const res = await fetch('/api/internal/upsert-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, avatar_url: avatarUrl }),
      })
      let data
      try { data = await res.json() } catch { data = { ok: false, error: 'Response backend không hợp lệ' } }

      if (data.ok) {
        alert('Avatar đã lưu thành công!')
        router.push('/auth/signup-success')
      } else {
        alert('Lưu avatar thất bại: ' + (data.error ?? 'Không rõ lỗi'))
      }
    } catch (err: any) {
      console.error(err)
      alert('Có lỗi khi lưu avatar')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-pink-50 to-sky-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 rounded-3xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-extrabold text-pink-500">Chọn nhân vật của bé 🐾</CardTitle>
            <CardDescription className="text-gray-600 mt-2">Chọn một avatar và lưu vào hồ sơ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {AVATARS.map((a) => (
                <div
                  key={a.id}
                  onClick={() => setAvatarUrl(a.url)}
                  className={`cursor-pointer rounded-2xl p-3 text-center border-2 transition
                    ${avatarUrl === a.url ? 'border-yellow-400 bg-yellow-50 scale-105' : 'border-transparent hover:bg-white'}`}
                >
                  <img src={a.url} className="w-16 h-16 mx-auto" />
                  <p className="text-sm mt-1">{a.name}</p>
                </div>
              ))}
            </div>

            <Button
              type="button"
              className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white text-lg rounded-xl"
              onClick={handleSaveAvatar}
              disabled={isSaving}
            >
              {isSaving ? 'Đang lưu...' : 'Lưu avatar'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
