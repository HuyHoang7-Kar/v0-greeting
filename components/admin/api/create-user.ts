// pages/api/create-user.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // chỉ server mới dùng
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email, full_name, role } = req.body

    if (!email || !full_name)
      return res.status(400).json({ error: 'Email và họ tên không được để trống' })

    // Tạo user auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
      password: Math.random().toString(36).slice(2, 10),
    })
    if (authError) return res.status(400).json({ error: authError.message })

    // Tạo profile
    const { error: profileError } = await supabaseAdmin.from('profiles').insert([
      { id: authUser.user?.id, email, full_name, role },
    ])
    if (profileError) return res.status(400).json({ error: profileError.message })

    return res.status(200).json({ success: true, id: authUser.user?.id })
  }
  res.status(405).json({ error: 'Method not allowed' })
}
