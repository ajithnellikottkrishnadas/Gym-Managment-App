import type { NextApiRequest, NextApiResponse } from "next";
import { addCustomer } from "@/lib/firestore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  
  try {
    const customerData = req.body || {};
    
    // Validate required fields
    const requiredFields = ['name', 'phone', 'email', 'fee', 'joinDate', 'dateOfBirth', 'gender'];
    const missingFields = requiredFields.filter(field => !customerData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    // Prepare customer data with defaults
    const customer = {
      // Basic Personal Information
      name: String(customerData.name),
      dateOfBirth: String(customerData.dateOfBirth),
      gender: customerData.gender || 'Male',
      profilePicture: customerData.profilePicture || '',
      
      // Contact Information
      phone: String(customerData.phone),
      email: String(customerData.email),
      emergencyContactName: String(customerData.emergencyContactName || ''),
      emergencyContactPhone: String(customerData.emergencyContactPhone || ''),
      
      // Membership Details
      joinDate: String(customerData.joinDate),
      membershipType: customerData.membershipType || 'Monthly',
      membershipStartDate: String(customerData.membershipStartDate || customerData.joinDate),
      membershipEndDate: String(customerData.membershipEndDate || ''),
      status: customerData.status || 'Active',
      
      // Payment Information
      fee: Number(customerData.fee),
      paymentMode: customerData.paymentMode || 'UPI',
      paymentStatus: customerData.paymentStatus || 'Paid',
      dueDate: String(customerData.dueDate || ''),
      
      // Health & Fitness Information
      height: Number(customerData.height || 0),
      weight: Number(customerData.weight || 0),
      bmi: customerData.bmi ? Number(customerData.bmi) : undefined,
      medicalConditions: String(customerData.medicalConditions || ''),
      fitnessGoal: customerData.fitnessGoal || 'General Fitness',
      
      // Address
      address: customerData.address || { street: '', city: '', pincode: '' },
      
      // Legacy fields
      contact: String(customerData.phone), // Map phone to contact for backward compatibility
      payments: customerData.payments || {}
    };

    const regNo = await addCustomer(customer);

    res.status(200).json({ ok: true, regNo });
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error("[API:/customers/add]", e?.code, e?.message);
    res.status(500).json({ error: e?.message ?? "Failed to add customer" });
  }
}


