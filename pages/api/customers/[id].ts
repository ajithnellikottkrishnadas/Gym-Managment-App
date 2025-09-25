import type { NextApiRequest, NextApiResponse } from "next";
import { getCustomerById } from "@/lib/firestore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: "Customer ID is required" });
    }

    const customer = await getCustomerById(id);
    
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.status(200).json({ data: customer });
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error("[API:/customers/[id]]", e?.code, e?.message);
    res.status(500).json({ error: e?.message ?? "Failed to fetch customer" });
  }
}
