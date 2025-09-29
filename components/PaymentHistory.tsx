"use client";

import { useMemo } from "react";
import { format, addMonths, subDays } from "date-fns";

interface PaymentHistoryProps {
  startDate: string; // customer join date
  planDuration: number;
  payments: Record<string, any>;
}

export default function PaymentHistory({ startDate, planDuration, payments }: PaymentHistoryProps) {
  const start = new Date(startDate);

  const months = useMemo(() => {
    const result: string[] = [];
    for (let i = 0; i < planDuration; i++) {
      const d = addMonths(start, i);
      result.push(format(d, "yyyy-MM-dd")); // keep exact date
    }
    return result;
  }, [start, planDuration]);

  return (
    <div className="mt-4">
      <h2 className="font-bold mb-2">Payment History & Management</h2>
      <table className="min-w-full bg-white border">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="px-4 py-2 border">Period</th>
            <th className="px-4 py-2 border">Status</th>
            <th className="px-4 py-2 border">Method</th>
            <th className="px-4 py-2 border">Amount</th>
          </tr>
        </thead>
        <tbody>
          {months.map((m, index) => {
            const periodStart = addMonths(start, index);
            const periodEnd = subDays(addMonths(periodStart, 1), 1);

            const key = format(periodStart, "yyyy-MM-dd");
            const payment = payments[key] || { status: "unpaid", method: null, amount: 0 };

            return (
              <tr key={key} className="border-t">
                <td className="px-4 py-2 border">
                  {format(periodStart, "dd/MM/yyyy")} – {format(periodEnd, "dd/MM/yyyy")}
                </td>
                <td className="px-4 py-2 border">
                  <span
                    className={`px-2 py-1 rounded ${
                      payment.status === "paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {payment.status}
                  </span>
                </td>
                <td className="px-4 py-2 border">{payment.method || "-"}</td>
                <td className="px-4 py-2 border">₹{payment.amount}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
