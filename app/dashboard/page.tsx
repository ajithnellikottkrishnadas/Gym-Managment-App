"use client";

import React, { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

type Customer = {
  id: string;
  name: string;
  phone?: string;
  regNo: number;
  fee: number;
  joinDate: string;
  status?: string;
  payments: Record<string, boolean>;
  membershipStartDate?: string;
  membershipEndDate?: string;
  paymentMode?: string;
  paymentStatus?: string;
  frozenMonths?: string[];
};

// Validate YYYY-MM-DD string and return Date or null
function parseISODate(d: string): Date | null {
  if (!d || typeof d !== "string") return null;
  const m = /^\d{4}-\d{2}-\d{2}$/.exec(d.trim());
  if (!m) return null;
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? null : dt;
}

// First day of next month
function firstDayOfNextMonth(date: Date): Date {
  const y = date.getFullYear();
  const m = date.getMonth();
  return new Date(y, m + 1, 1);
}

// List YYYY-MM strings between two dates inclusive
function listMonths(start: Date, end: Date): string[] {
  const out: string[] = [];
  let y = start.getFullYear();
  let m = start.getMonth();
  const eYear = end.getFullYear();
  const eMonth = end.getMonth();
  if (y > eYear || (y === eYear && m > eMonth)) return out;
  while (y < eYear || (y === eYear && m <= eMonth)) {
    const mm = (m + 1).toString().padStart(2, "0");
    out.push(`${y}-${mm}`);
    m += 1;
    if (m > 11) { m = 0; y += 1; }
  }
  return out;
}

export default function DashboardHome() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/customers/list");
        const json = await res.json();
        setCustomers(json.data || []);
      } catch (e) {
        console.error("Failed to load customers", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const { totalMembers, activeMembers, monthlyRevenue, dueMembers } = useMemo(() => {
    const totalMembers = customers.length;
    const activeMembers = customers.filter(c => (c.status || "Active") === "Active").length;
    // Revenue should reflect only PAID entries for the current month
    const now = new Date();
    const curMm = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, "0")}`;
    const monthlyRevenue = customers.reduce((sum, c: any) => {
      const paid = c.payments && c.payments[curMm] === true;
      if (!paid) return sum;
      const amounts = (c as any).paymentsAmounts || {};
      const amount = typeof amounts[curMm] === "number" ? amounts[curMm] : (c.fee || 0);
      return sum + amount;
    }, 0);

    const computed = customers
      .map((c) => {
        const startPref = parseISODate(c.membershipStartDate || "") || parseISODate(c.joinDate) || now;
        const rangeStart = firstDayOfNextMonth(startPref);
        const endPref = parseISODate(c.membershipEndDate || "");
        const rangeEnd = endPref && endPref < now ? endPref : now; // clamp to end date if ended

        const payments = c.payments || {};
        const fullMonths = listMonths(rangeStart, rangeEnd);
        const frozen = new Set((c.frozenMonths || []));
        // Compute dues from the full membership range, excluding frozen months
        const unpaidAsc = fullMonths
          .filter((mm) => {
            const hasRecord = Object.prototype.hasOwnProperty.call(payments, mm);
            const recordedPaid = payments[mm] === true;
            const isStartMonth = mm === `${rangeStart.getFullYear()}-${(rangeStart.getMonth()+1).toString().padStart(2,"0")}`;
            const implicitPaid = !hasRecord && isStartMonth && (c.paymentStatus === "Paid");
            return !(recordedPaid || implicitPaid) && !frozen.has(mm);
          })
          .sort();
        const unpaidMonths = [...unpaidAsc].sort().reverse();

        // Days due should be counted from the first unpaid month (or next month after last paid)
        let daysSinceLastPayment = 0;
        if (unpaidAsc.length > 0) {
          const firstUnpaidMonth = unpaidAsc[0];
          const firstUnpaidDate = new Date(firstUnpaidMonth + "-01");
          daysSinceLastPayment = Math.floor((now.getTime() - firstUnpaidDate.getTime()) / (1000 * 60 * 60 * 24));
        } else {
          // No dues in range; use range start as baseline
          daysSinceLastPayment = Math.floor((now.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24));
        }

        const status = unpaidMonths.length >= 4 ? "Frozen" : unpaidMonths.length >= 3 ? "Overdue" : unpaidMonths.length >= 1 ? "Due" : "Current";
        const totalDue = (unpaidMonths.length || 0) * (c.fee || 0);
        return { ...c, unpaidMonths, daysSinceLastPayment, status, totalDue } as any;
      })
      .filter((c: any) => c.unpaidMonths.length >= 1)
      .sort((a: any, b: any) => {
        const order: Record<string, number> = { Frozen: 0, Overdue: 1, Due: 2, Current: 3 };
        if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
        return b.daysSinceLastPayment - a.daysSinceLastPayment;
      });

    return { totalMembers, activeMembers, monthlyRevenue, dueMembers: computed };
  }, [customers]);

  const formatDays = (days: number) => {
    if (days < 30) return `${days} days`;
    const months = Math.floor(days / 30);
    const rem = days % 30;
    return rem ? `${months} month ${rem} days` : `${months} month`;
  };

  const badge = (status: string) => {
    switch (status) {
      case "Frozen": return "bg-gray-100 text-gray-800";
      case "Overdue": return "bg-red-100 text-red-800";
      case "Due": return "bg-yellow-100 text-yellow-800";
      default: return "bg-green-100 text-green-800";
    }
  };

  return (
     <div className="flex min-h-screen">

      <main className="flex-1 p-8">
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight mb-8">Dashboard Overview</h1>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="p-6 rounded-2xl bg-white shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Members</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{loading ? "..." : totalMembers}</p>
                </div>
                <div className="p-3 rounded-xl bg-red-100 text-red-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                </div>
              </div>
              <p className="mt-3 text-xs text-gray-400">All registered customers in the gym</p>
            </div>

            <div className="p-6 rounded-2xl bg-white shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Active</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{loading ? "..." : activeMembers}</p>
                </div>
                <div className="p-3 rounded-xl bg-green-100 text-green-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                </div>
              </div>
              <p className="mt-3 text-xs text-gray-400">Members with active subscriptions</p>
            </div>

            <div className="p-6 rounded-2xl bg-white shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{loading ? "..." : `₹${monthlyRevenue.toLocaleString()}`}</p>
                </div>
                <div className="p-3 rounded-xl bg-yellow-100 text-yellow-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/></svg>
                </div>
              </div>
              <p className="mt-3 text-xs text-gray-400">Total fees from all members</p>
            </div>
          </div>

          {/* Due Members Section */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">⚠️ Due Members ({dueMembers.length})</h2>
            <div className="bg-white rounded-2xl shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Member</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Reg No</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Days Due</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Unpaid Months</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Total Due</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dueMembers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-6 text-center text-sm text-gray-500">No due members.</td>
                      </tr>
                    )}
                    {dueMembers.map((m: any) => (
                      <tr key={m.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{m.name}</div>
                          <div className="text-sm text-gray-500">{m.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{m.regNo}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge(m.status)}`}>{m.status}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDays(m.daysSinceLastPayment)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{m.unpaidMonths.length} months</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{m.totalDue.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
  );
}
