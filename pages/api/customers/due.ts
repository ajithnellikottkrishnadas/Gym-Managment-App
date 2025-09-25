import type { NextApiRequest, NextApiResponse } from "next";
import { computeDueList, listCustomers } from "@/lib/firestore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const customers = await listCustomers();
    const due = computeDueList(customers as any);
    res.status(200).json({ data: due });
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? "Failed to get due customers" });
  }
}


