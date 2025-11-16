import { createClient } from '@supabase/supabase-js'
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const email = 'phh1422005@gmail.com'
  const password = '123456'
  const fullName = 'Admin User'

  try {
    // Xóa user cũ nếu tồn tại
    await supabase.auth.admin.deleteUserByEmail(email).catch(() => {})

    // Tạo user admin
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'admin', full_name: fullName }
    })

    if (error) return res.status(400).json({ error: error.message })

    // Tạo profile admin
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: data.user.id,
        username: 'admin',
        full_name: fullName,
        role: 'admin',
      })

    if (profileError) return res.status(400).json({ error: profileError.message })

    return res.json({ success: true, user_id: data.user.id })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
}
