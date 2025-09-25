"use client";

export default function PaymentHistory({ payments }: { payments: Record<string, boolean> }) {
  const months = Object.keys(payments || {}).sort().reverse();
  return (
    <div className="space-y-2">
      {months.length === 0 && <div className="text-sm text-gray-500">No payments yet.</div>}
      <ul className="space-y-2">
        {months.map((m) => (
          <li key={m} className="flex items-center justify-between border rounded px-3 py-2">
            <span className="font-medium">{m}</span>
            <span className={`text-xs px-2 py-1 rounded ${payments[m] ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {payments[m] ? "Paid" : "Unpaid"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}


