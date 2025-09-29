// pages/api/customers/add.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { addCustomer } from "@/lib/firestore";
import { addMonths, subDays } from "date-fns";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const customerData = req.body || {};
    const requiredFields = ["name", "phone", "email", "fee", "joinDate", "dateOfBirth", "gender"];
    const missingFields = requiredFields.filter((f) => !customerData[f]);
    if (missingFields.length > 0) {
      return res
        .status(400)
        .json({ error: `Missing required fields: ${missingFields.join(", ")}` });
    }

    const startDate = new Date(customerData.membershipStartDate || customerData.joinDate);
    const planType = (customerData.membershipType || "monthly").toLowerCase();
    const paidAmount = Number(customerData.paidAmount ?? customerData.fee);

    let months = 1;
    if (planType === "quarterly") months = 3;
    else if (planType === "yearly") months = 12;

    const monthly = Math.round(paidAmount / months);

    const payments: Record<string, boolean> = {};
    const paymentsAmounts: Record<string, number> = {};
    const paymentsDates: Record<string, string> = {};

    // Generate month wise
    const d = new Date(startDate);
    for (let i = 0; i < months; i++) {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      payments[key] = true; // since paid upfront
      paymentsAmounts[key] = monthly;
      paymentsDates[key] = new Date().toISOString();
      d.setMonth(d.getMonth() + 1);
    }

    const customer: any = {
      ...customerData,
      joinDate: String(customerData.joinDate),
      membershipType: customerData.membershipType || "Monthly",
      planType,
      membershipStartDate: String(customerData.membershipStartDate || customerData.joinDate),
      payments,
      paymentsAmounts,
      paymentsDates,
      frozenMonths: [],
    };

    const regNo = await addCustomer(customer);
    res.status(200).json({ ok: true, regNo });
  } catch (e: any) {
    console.error("[API:/customers/add]", e?.message);
    res.status(500).json({ error: e?.message ?? "Failed to add customer" });
  }
}

