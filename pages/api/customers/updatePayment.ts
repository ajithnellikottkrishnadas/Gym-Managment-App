import type { NextApiRequest, NextApiResponse } from "next";
import { getCustomerById, updateCustomerPayments } from "@/lib/firestore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { id, month, paid } = req.body || {};
    if (!id || !month || typeof paid !== "boolean") return res.status(400).json({ error: "Missing fields" });
    const customer = await getCustomerById(id);
    if (!customer) return res.status(404).json({ error: "Not found" });
    const payments = { ...(customer.payments || {}), [month]: !!paid } as Record<string, boolean>;
    await updateCustomerPayments(id, payments);
    res.status(200).json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? "Failed to update payment" });
  }
}


