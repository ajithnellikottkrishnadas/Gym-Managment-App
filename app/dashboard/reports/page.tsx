import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { listCustomers } from "@/lib/firestore";

export default async function ReportsPage() {
  const customers = await listCustomers();
  const total = customers.length;
  const active = customers.filter((c: any) => Object.values(c.payments || {}).some(Boolean)).length;
  const revenue = customers.reduce((sum: number, c: any) => sum + c.fee * (Object.values(c.payments || {}).filter(Boolean).length), 0);
  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 flex gap-6">
        <Sidebar />
        <main className="flex-1 py-6 space-y-4">
          <h1 className="text-2xl font-semibold">Reports</h1>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="border rounded p-4"><div className="text-sm text-gray-500">Total Members</div><div className="text-2xl font-bold">{total}</div></div>
            <div className="border rounded p-4"><div className="text-sm text-gray-500">Active</div><div className="text-2xl font-bold">{active}</div></div>
            <div className="border rounded p-4"><div className="text-sm text-gray-500">Revenue</div><div className="text-2xl font-bold">₹{revenue}</div></div>
          </div>
          <p className="text-sm text-gray-500">You can plug in Chart.js or Recharts here for trends.</p>
        </main>
      </div>
    </div>
  );
}


