"use client";
import { useState, useEffect } from "react";
import CustomerTable from "@/components/CustomerTable";
import { Button } from "@/components/ui/button";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCustomers = async () => {
    try {
      const response = await fetch("/api/customers/list");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to load customers");
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

  if (loading) {
    return (
      <main className="flex-1 py-6 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          Loading customers...
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
          <div className="text-sm text-gray-600 mt-1">
            {customers.length}{" "}
            {customers.length === 1 ? "member" : "members"} total
          </div>
        </div>

      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <CustomerTable customers={customers} />
      </div>
    </main>
  );
}
