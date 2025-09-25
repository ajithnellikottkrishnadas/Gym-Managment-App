"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import CustomerTable from "@/components/CustomerTable";
import AddCustomerModal from "@/components/AddCustomerModal";
import { Button } from "@/components/ui/button";
export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadCustomers = async () => {
    try {
      const response = await fetch('/api/customers/list');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to load customers');
      }
      
      setCustomers(result.data || []);
    } catch (error) {
      console.error("Failed to load customers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleModalSuccess = () => {
    loadCustomers(); // Refresh the list
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 flex gap-6">
          <Sidebar />
          <main className="flex-1 py-6">
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-2 text-gray-600">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                Loading customers...
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 flex gap-6">
        <Sidebar />
        <main className="flex-1 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
              <div className="text-sm text-gray-600 mt-1">
                {customers.length} {customers.length === 1 ? 'member' : 'members'} total
              </div>
            </div>
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Customer
            </Button>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <CustomerTable customers={customers} />
          </div>
        </main>
      </div>

      <AddCustomerModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}


