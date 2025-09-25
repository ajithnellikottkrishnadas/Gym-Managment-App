import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export default function DashboardHome() {
  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 flex gap-6">
        <Sidebar />
        <main className="flex-1 py-6">
          <h1 className="text-2xl font-semibold mb-4">Overview</h1>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="border rounded p-4"><div className="text-sm text-gray-500">Total Members</div><div className="text-2xl font-bold">-</div></div>
            <div className="border rounded p-4"><div className="text-sm text-gray-500">Active</div><div className="text-2xl font-bold">-</div></div>
            <div className="border rounded p-4"><div className="text-sm text-gray-500">Monthly Revenue</div><div className="text-2xl font-bold">-</div></div>
          </div>
        </main>
      </div>
    </div>
  );
}


