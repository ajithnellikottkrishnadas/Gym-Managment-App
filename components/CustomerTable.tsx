"use client";
import { useMemo, useState } from "react";
import UserDetailsModal from "./UserDetailsModal";

export type CustomerRow = {
  id: string;
  name: string;
  regNo: number;
  contact: string;
  fee: number;
  joinDate: string;
  payments: Record<string, boolean>;
};

export default function CustomerTable({ customers }: { customers: CustomerRow[] }) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<keyof CustomerRow>("regNo");
  const [asc, setAsc] = useState(true);

  const handleCustomerClick = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCustomerId(null);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = customers.filter((c) => !q || c.name.toLowerCase().includes(q) || String(c.regNo) === q);
    rows = rows.sort((a, b) => {
      const av = a[sortBy] as any;
      const bv = b[sortBy] as any;
      if (av < bv) return asc ? -1 : 1;
      if (av > bv) return asc ? 1 : -1;
      return 0;
    });
    return rows;
  }, [customers, search, sortBy, asc]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4 gap-3 p-4 bg-gray-50 border-b">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            placeholder="Search by name or reg no..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 text-sm">
          <label className="text-gray-600 font-medium">Sort by</label>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={String(sortBy)}
            onChange={(e) => setSortBy(e.target.value as keyof CustomerRow)}
          >
            <option value="regNo">Reg No</option>
            <option value="name">Name</option>
            <option value="joinDate">Join Date</option>
            <option value="fee">Fee</option>
          </select>
          <button 
            className="border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors flex items-center gap-1" 
            onClick={() => setAsc((p) => !p)}
          >
            {asc ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
            {asc ? "Asc" : "Desc"}
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reg No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                  #{c.regNo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button 
                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium cursor-pointer" 
                    onClick={() => handleCustomerClick(c.id)}
                  >
                    {c.name}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {c.contact}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₹{c.fee.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(c.joinDate).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding a new customer.</p>
          </div>
        )}
      </div>

      <UserDetailsModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        customerId={selectedCustomerId}
      />
    </div>
  );
}


