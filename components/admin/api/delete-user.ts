// pages/api/delete-user.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: "Missing user id" });

    const { error: profileError } = await supabaseAdmin.from("profiles").delete().eq("id", id);
    if (profileError) return res.status(400).json({ error: profileError.message });

    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (authError) return res.status(400).json({ error: authError.message });

    return res.status(200).json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Internal server error" });
  }
}
