import type { NextApiRequest, NextApiResponse } from "next";
import { addCustomer } from "@/lib/firestore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  
  try {
    const customerData = req.body || {};
    
    const requiredFields = ['name', 'phone', 'email', 'fee', 'joinDate', 'dateOfBirth', 'gender'];
    const missingFields = requiredFields.filter(field => !customerData[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
    }

    const now = new Date();
    const ym = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2,'0')}`;

    const customer = {
      name: String(customerData.name),
      dateOfBirth: String(customerData.dateOfBirth),
      gender: customerData.gender || 'Male',
      profilePicture: customerData.profilePicture || '',
      phone: String(customerData.phone),
      email: String(customerData.email),
      emergencyContactName: String(customerData.emergencyContactName || ''),
      emergencyContactPhone: String(customerData.emergencyContactPhone || ''),
      joinDate: String(customerData.joinDate),
      membershipType: customerData.membershipType || 'Monthly',
      membershipStartDate: String(customerData.membershipStartDate || customerData.joinDate),
      membershipEndDate: String(customerData.membershipEndDate || ''),
      status: customerData.status || 'Active',
      fee: Number(customerData.fee),
      paymentMode: customerData.paymentMode || 'UPI',
      paymentStatus: customerData.paymentStatus || 'Paid',
      dueDate: String(customerData.dueDate || ''),
      height: Number(customerData.height || 0),
      weight: Number(customerData.weight || 0),
      bmi: customerData.bmi ? Number(customerData.bmi) : undefined,
      medicalConditions: String(customerData.medicalConditions || ''),
      fitnessGoal: customerData.fitnessGoal || 'General Fitness',
      address: customerData.address || { street: '', city: '', pincode: '' },
      contact: String(customerData.phone),
      payments: { ...(customerData.payments || {}), [ym]: true },
      paymentsAmounts: { [ym]: Number(customerData.fee) },
      frozenMonths: [],
    } as any;

    const regNo = await addCustomer(customer);
    res.status(200).json({ ok: true, regNo });
  } catch (e: any) {
    console.error("[API:/customers/add]", e?.code, e?.message);
    res.status(500).json({ error: e?.message ?? "Failed to add customer" });
  }
}


