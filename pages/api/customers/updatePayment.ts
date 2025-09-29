import type { NextApiRequest, NextApiResponse } from "next";
import { updateCustomerPayment } from "../../../lib/payment";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { id, month, status, amount } = req.body || {};
    if (!id || !month || !status) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const result = await updateCustomerPayment(id, month, status, amount);
    res.status(200).json(result);
  } catch (e: any) {
    console.error("[API:/customers/updatePayment]", e?.message);
    res.status(500).json({ error: e?.message ?? "Failed to update payment" });
  }
}
