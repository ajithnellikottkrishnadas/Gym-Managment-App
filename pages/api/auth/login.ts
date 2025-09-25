import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });
  // Placeholder API - in this scaffold you should use Firebase client-side login
  // and set cookie via server action already. This endpoint is kept for parity.
  try {
    await axios.post("https://example.com/api/login", { email, password });
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(401).json({ error: "Invalid credentials" });
  }
}


