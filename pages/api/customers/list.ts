import type { NextApiRequest, NextApiResponse } from "next";
import { listCustomers } from "@/lib/firestore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const search = (req.query.search as string) || undefined;
    const data = await listCustomers(search);
    res.status(200).json({ data });
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error("[API:/customers/list]", e?.code, e?.message);
    res.status(500).json({ error: e?.message ?? "Failed to list customers" });
  }
}


