import { doc, setDoc } from "firebase/firestore";
import { firestoreDb } from "@/lib/firebase";
import { getCustomerById } from "@/lib/firestore";

export type PaymentStatus = "paid" | "unpaid" | "frozen";

export async function updateCustomerPayment(
  id: string,
  month: string,
  status: PaymentStatus,
  amount?: number
) {
  const customer = await getCustomerById(id);
  if (!customer) throw new Error("Customer not found");

  const payments = { ...(customer.payments || {}) } as Record<string, boolean>;
  const frozen = new Set<string>(customer.frozenMonths || []);
  // Fix lint: avoid always-truthy expression by applying default before spread
  const paymentsAmounts = { ...(((customer as any).paymentsAmounts || {}) as Record<string, number>) } as Record<string, number>;

  // Ensure first month can’t be unpaid/frozen
  const startYm = (() => {
    const d = new Date(customer.membershipStartDate || customer.joinDate);
    if (isNaN(d.getTime())) return null;
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;
  })();

  if ((status === "unpaid" || status === "frozen") && startYm && month === startYm) {
    throw new Error("First month cannot be marked unpaid or frozen");
  }

  // Apply status (supports quarterly expansion when amount indicates 3 months)
  if (status === "paid") {
    // If paying for a quarter (e.g., Rs 4500 for three months), expand to 3 months
    const isQuarter = typeof amount === "number" && amount >= 4500 && amount % 3 === 0;
    if (isQuarter) {
      const monthly = Math.floor(amount / 3);
      const d = new Date(`${month}-01`);
      for (let i = 0; i < 3; i++) {
        const ym = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;
        payments[ym] = true;
        frozen.delete(ym);
        paymentsAmounts[ym] = monthly;
        d.setMonth(d.getMonth() + 1);
      }
    } else {
      payments[month] = true;
      frozen.delete(month);
      if (typeof amount === "number") paymentsAmounts[month] = amount;
    }
  } else if (status === "unpaid") {
    payments[month] = false;
    frozen.delete(month);
    if (typeof amount === "number") paymentsAmounts[month] = amount;
  } else if (status === "frozen") {
    if (!(month in payments)) payments[month] = false;
    frozen.add(month);
  } else {
    throw new Error("Invalid status");
  }

  // Save
  const ref = doc(firestoreDb, "customers", id);
  await setDoc(
    ref,
    { payments, frozenMonths: Array.from(frozen), paymentsAmounts },
    { merge: true }
  );

  return { ok: true, payments, frozenMonths: Array.from(frozen), paymentsAmounts };
}
