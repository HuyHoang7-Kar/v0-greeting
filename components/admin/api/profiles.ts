// components/admin/api/profiles.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/lib/supabase/client-server"; // client server side

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, role, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching profiles:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ profiles: data ?? [] });
  } catch (err) {
    console.error("Catch error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
