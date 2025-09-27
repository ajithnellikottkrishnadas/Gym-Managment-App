import type { NextApiRequest, NextApiResponse } from "next";
import { getCustomerById } from "@/lib/firestore";
import { doc, setDoc } from "firebase/firestore";
import { firestoreDb } from "@/lib/firebase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { id, month, status, amount } = req.body || {};
    // status: 'paid' | 'unpaid' | 'frozen'
    if (!id || !month || !status) return res.status(400).json({ error: "Missing fields" });

    const customer = await getCustomerById(id);
    if (!customer) return res.status(404).json({ error: "Not found" });

    const payments = { ...(customer.payments || {}) } as Record<string, boolean>;
    const frozen = new Set<string>(customer.frozenMonths || []);
    const paymentsAmounts = { ...(customer as any).paymentsAmounts } || {} as Record<string, number>;

    // Disallow setting first month to unpaid
    const startYm = (() => {
      const d = new Date(customer.membershipStartDate || customer.joinDate);
      if (isNaN(d.getTime())) return null;
      const ym = `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}`;
      return ym;
    })();

    if ((status === 'unpaid' || status === 'frozen') && startYm && month === startYm) {
      return res.status(400).json({ error: 'First month cannot be marked unpaid or frozen' });
    }

    if (status === 'paid') {
      payments[month] = true;
      frozen.delete(month);
      if (typeof amount === 'number') paymentsAmounts[month] = amount;
    } else if (status === 'unpaid') {
      payments[month] = false;
      frozen.delete(month);
      if (typeof amount === 'number') paymentsAmounts[month] = amount;
    } else if (status === 'frozen') {
      if (!(month in payments)) payments[month] = false;
      frozen.add(month);
    } else {
      return res.status(400).json({ error: "Invalid status" });
    }

    const ref = doc(firestoreDb, "customers", id);
    await setDoc(ref, { payments, frozenMonths: Array.from(frozen), paymentsAmounts }, { merge: true });
    res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error("[API:/customers/updatePayment]", e?.code, e?.message);
    res.status(500).json({ error: e?.message ?? "Failed to update payment" });
  }
}


