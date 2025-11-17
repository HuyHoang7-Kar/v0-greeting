// pages/api/delete-user.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { id } = req.body
    if (!id) return res.status(400).json({ error: 'Missing user id' })

    // Xóa profile
    await supabaseAdmin.from('profiles').delete().eq('id', id)

    // Xóa auth user
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id)
    if (error) return res.status(400).json({ error: error.message })

    return res.status(200).json({ success: true })
  }
  res.status(405).json({ error: 'Method not allowed' })
}
