import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import PaymentHistory from "@/components/PaymentHistory";
import { getCustomerById, updateCustomerPayments } from "@/lib/firestore";

export default async function CustomerProfile({ params }: { params: { id: string } }) {
  const customer = await getCustomerById(params.id);
  if (!customer) return <div className="p-6">Not found</div>;
  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 flex gap-6">
        <Sidebar />
        <main className="flex-1 py-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">{customer.name}</h1>
              <div className="text-sm text-gray-600">Reg No: {customer.regNo}</div>
            </div>
          </div>
          <section>
            <h2 className="font-medium mb-2">Payment History</h2>
            <PaymentHistory payments={customer.payments || {}} />
          </section>
        </main>
      </div>
    </div>
  );
}


