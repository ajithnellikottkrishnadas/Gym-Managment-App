import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  limit,
} from "firebase/firestore";
import { firestoreDb } from "./firebase";

export type Customer = {
  // Basic Personal Information
  name: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: 'Male' | 'Female' | 'Other';
  profilePicture?: string; // URL or base64
  
  // Contact Information
  phone: string;
  email: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  
  // Membership Details
  regNo: number;
  joinDate: string; // YYYY-MM-DD
  membershipType: 'Monthly' | 'Quarterly' | 'Yearly' | 'Personal Training' | 'Other';
  membershipStartDate: string; // YYYY-MM-DD
  membershipEndDate: string; // YYYY-MM-DD
  status: 'Active' | 'Expired' | 'On Hold' | 'Suspended';
  
  // Payment Information
  fee: number;
  paymentMode: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'Other';
  paymentStatus: 'Paid' | 'Pending' | 'Overdue';
  dueDate: string; // YYYY-MM-DD
  
  // Health & Fitness Information
  height: number; // in cm
  weight: number; // in kg
  bmi?: number; // calculated
  medicalConditions?: string;
  fitnessGoal: 'Weight Loss' | 'Muscle Gain' | 'Strength Training' | 'General Fitness' | 'Endurance' | 'Other';
  
  // Address (optional)
  address?: {
    street: string;
    city: string;
    pincode: string;
  };
  
  // Legacy fields for backward compatibility
  contact: string; // Keep for backward compatibility, maps to phone
  payments: Record<string, boolean>; // Monthly payment tracking
};

export async function getNextRegNo(): Promise<number> {
  try {
    const customersRef = collection(firestoreDb, "customers");
    const q = query(customersRef, orderBy("regNo", "desc"), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return 1;
    const max = (snap.docs[0].data() as Customer).regNo;
    return max + 1;
  } catch (error: any) {
    console.error("[Firestore:getNextRegNo]", error?.code, error?.message);
    throw error;
  }
}

export async function addCustomer(customer: Omit<Customer, "regNo">) {
  try {
    const regNo = await getNextRegNo();
    const customersRef = collection(firestoreDb, "customers");
    await addDoc(customersRef, { ...customer, regNo });
    return regNo;
  } catch (error: any) {
    console.error("[Firestore:addCustomer]", error?.code, error?.message);
    throw error;
  }
}

export async function listCustomers(search?: string) {
  try {
    const customersRef = collection(firestoreDb, "customers");
    const snap = await getDocs(customersRef);
    const all = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Customer) }));
    if (!search) return all;
    const lower = search.toLowerCase();
    return all.filter(
      (c) => c.name.toLowerCase().includes(lower) || String(c.regNo) === lower
    );
  } catch (error: any) {
    console.error("[Firestore:listCustomers]", error?.code, error?.message);
    throw error;
  }
}

export async function getCustomerById(id: string) {
  try {
    const ref = doc(firestoreDb, "customers", id);
    const d = await getDoc(ref);
    if (!d.exists()) return null;
    return { id: d.id, ...(d.data() as Customer) };
  } catch (error: any) {
    console.error("[Firestore:getCustomerById]", error?.code, error?.message);
    throw error;
  }
}

export async function updateCustomerPayments(id: string, payments: Record<string, boolean>) {
  try {
    const ref = doc(firestoreDb, "customers", id);
    await setDoc(ref, { payments }, { merge: true });
  } catch (error: any) {
    console.error("[Firestore:updateCustomerPayments]", error?.code, error?.message);
    throw error;
  }
}

export function computeDueList(customers: Array<Customer & { id: string }>) {
  const entries = customers
    .map((c) => {
      const months = Object.entries(c.payments || {});
      const unpaid = months.filter(([, paid]) => !paid).map(([m]) => m);
      const latestUnpaid = unpaid.sort().at(-1) || null;
      return latestUnpaid
        ? { customer: c, latestUnpaid }
        : null;
    })
    .filter(Boolean) as Array<{ customer: Customer & { id: string }; latestUnpaid: string }>;
  return entries.sort((a, b) => (a.latestUnpaid > b.latestUnpaid ? -1 : 1));
}


