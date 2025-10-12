'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SignUpPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'student'|'teacher'>('student');
  const [error, setError] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);

  async function serverUpsert(id: string) {
    try {
      await fetch('/api/internal/upsert-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, full_name: fullName, role })
      });
    } catch (err) {
      console.error('server upsert error', err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) { setError('Mật khẩu không khớp'); return; }
    if (password.length < 6) { setError('Mật khẩu phải có ít nhất 6 ký tự'); return; }
    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/login`,
          data: { role, full_name: fullName }
        }
      } as any);

      if (signUpError) {
        setError(signUpError.message || 'Đăng ký thất bại');
        setLoading(false);
        return;
      }

      const userId = data?.user?.id;
      if (userId) {
        // immediate upsert via server to bypass RLS if desired
        await serverUpsert(userId);
      }

      router.push('/auth/signup-success');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi');
    } finally { setLoading(false); }
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Đăng ký</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="fullName">Họ và tên</Label>
          <Input id="fullName" value={fullName} onChange={(e)=>setFullName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        </div>
        <div>
          <Label>Role</Label>
          <select value={role} onChange={(e)=>setRole(e.target.value as any)} className="w-full border p-2 rounded">
            <option value="student">Học Sinh</option>
            <option value="teacher">Giáo Viên</option>
          </select>
        </div>
        <div>
          <Label htmlFor="password">Mật khẩu</Label>
          <Input id="password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="confirm">Xác nhận</Label>
          <Input id="confirm" type="password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} />
        </div>
        {error && <div className="text-red-600">{error}</div>}
        <Button type="submit" disabled={loading}>{loading ? 'Đang...' : 'Đăng ký'}</Button>
        <div className="text-sm mt-2">Đã có tài khoản? <Link href="/auth/login">Đăng nhập</Link></div>
      </form>
    </div>
  );
}
