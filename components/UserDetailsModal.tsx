"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string | null;
}

interface Customer {
  id: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  profilePicture?: string;
  phone: string;
  email: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  regNo: number;
  joinDate: string;
  membershipType: string;
  membershipStartDate?: string;
  membershipEndDate?: string;
  status: string;
  fee: number;
  paymentMode?: string;
  paymentStatus?: string;
  dueDate?: string;
  height: number;
  weight: number;
  bmi?: number;
  medicalConditions?: string;
  fitnessGoal: string;
  address?: { street: string; city: string; pincode: string };
  contact: string;
  payments: Record<string, boolean>;
  frozenMonths?: string[];
}

// Helpers for dates
function parseISO(d?: string) {
  if (!d) return null;
  const t = Date.parse(d);
  return Number.isNaN(t) ? null : new Date(t);
}
function monthKey(d: Date) {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  return `${y}-${m}`;
}
function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function endOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth() + 1, 0); }
function addMonths(d: Date, n: number) { return new Date(d.getFullYear(), d.getMonth() + n, 1); }
function startMonthKeyFromCustomer(c?: Customer | null) {
  if (!c) return null;
  const pref = parseISO(c.membershipStartDate || c.joinDate);
  if (!pref) return null;
  return monthKey(startOfMonth(pref));
}

export default function UserDetailsModal({ isOpen, onClose, customerId }: UserDetailsModalProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'health' | 'payments' | 'contact'>('overview');
  const [updatingPayment, setUpdatingPayment] = useState(false);

  useEffect(() => { if (isOpen && customerId) fetchCustomerDetails(); }, [isOpen, customerId]);

  const fetchCustomerDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`/api/customers/${customerId}`);
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error || 'Failed to fetch customer');
      setCustomer(json.data);
    } catch (e: any) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  const handleBackdropClick = (e: React.MouseEvent) => { if (e.target === e.currentTarget) onClose(); };

  const formatDate = (s?: string) => s ? new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
  const calculateAge = (dob?: string) => {
    if (!dob) return 'N/A';
    const b = new Date(dob), t = new Date();
    let a = t.getFullYear() - b.getFullYear();
    const m = t.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && t.getDate() < b.getDate())) a--;
    return `${a} years`;
  };

  const getStatusColor = (s: string) => s === 'Active' ? 'bg-green-100 text-green-800' : s === 'Expired' ? 'bg-red-100 text-red-800' : s === 'On Hold' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800';
  const getPaymentStatusColor = (s?: string) => s === 'Paid' ? 'bg-green-100 text-green-800' : s === 'Overdue' ? 'bg-red-100 text-red-800' : s === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800';

  // API: tri-state updater
  const updatePayment = async (month: string, status: 'paid' | 'unpaid' | 'frozen') => {
    if (!customer) return;
    // Guard: do not allow first month to be marked unpaid
    const startKey = startMonthKeyFromCustomer(customer);
    if (status === 'unpaid' && startKey && month === startKey) {
      return; // silently ignore on client; API also enforces
    }
    setUpdatingPayment(true);
    try {
      const resp = await fetch('/api/customers/updatePayment', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: customer.id, month, status, amount: customer.fee }),
      });
      if (!resp.ok) throw new Error('Failed to update payment');
      // local update
      setCustomer(prev => {
        if (!prev) return prev;
        const payments = { ...(prev.payments || {}) };
        const frozen = new Set(prev.frozenMonths || []);
        if (status === 'paid') { payments[month] = true; frozen.delete(month); }
        if (status === 'unpaid') { payments[month] = false; frozen.delete(month); }
        if (status === 'frozen') { if (!(month in payments)) payments[month] = false; frozen.add(month); }
        return { ...prev, payments, frozenMonths: Array.from(frozen) };
      });
    } catch (e: any) { setError(e.message); } finally { setUpdatingPayment(false); }
  };

  // Build full month list from membershipStart or join month up to current month
  const buildFullMonthRows = () => {
    if (!customer) return [] as Array<{ key: string; start: Date; end: Date; paid: boolean; frozen: boolean }>;
    const now = new Date();
    const startPref = parseISO(customer.membershipStartDate || customer.joinDate) || now;
    const start = startOfMonth(startPref);
    const end = startOfMonth(now);
    const rows: Array<{ key: string; start: Date; end: Date; paid: boolean; frozen: boolean }> = [];
    const frozenSet = new Set(customer.frozenMonths || []);
    const startKey = monthKey(start);
    let cur = new Date(start);
    while (cur <= end) {
      const key = monthKey(cur);
      const explicitPaid = customer.payments && customer.payments[key] === true;
      // Fallback: if there is no explicit payment record for the start month but status is Paid, treat it as paid
      const paid = explicitPaid || ((!(customer.payments && key in customer.payments)) && key === startKey && (customer.paymentStatus === 'Paid'));
      const frozen = frozenSet.has(key);
      rows.push({ key, start: startOfMonth(cur), end: endOfMonth(cur), paid, frozen });
      cur = addMonths(cur, 1);
    }
    return rows.reverse(); // latest first
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={handleBackdropClick}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center gap-4">
            {customer?.profilePicture ? (
              <img src={customer.profilePicture} alt={customer.name} className="w-16 h-16 rounded-full object-cover border-2 border-white" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">{customer?.name?.charAt(0) || '?'}</div>
            )}
            <div>
              <h2 className="text-2xl font-semibold">{customer?.name || 'Loading...'}</h2>
              <p className="text-blue-100">Registration #{customer?.regNo || 'N/A'}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2 text-gray-600"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>Loading customer details...</div>
          </div>
        )}
        {error && (<div className="p-6"><div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">{error}</div></div>)}

        {customer && (
          <>
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[{ id: 'overview', label: 'Overview', icon: '👤' }, { id: 'health', label: 'Health & Fitness', icon: '💪' }, { id: 'payments', label: 'Payments', icon: '💰' }, { id: 'contact', label: 'Contact', icon: '📞' }].map(t => (
                  <button key={t.id} onClick={() => setActiveTab(t.id as any)} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === t.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}><span className="mr-2">{t.icon}</span>{t.label}</button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between"><span className="text-gray-600">Full Name:</span><span className="font-medium">{customer.name}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Date of Birth:</span><span className="font-medium">{formatDate(customer.dateOfBirth)}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Age:</span><span className="font-medium">{calculateAge(customer.dateOfBirth)}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Gender:</span><span className="font-medium">{customer.gender}</span></div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Membership Details</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between"><span className="text-gray-600">Membership Type:</span><span className="font-medium">{customer.membershipType}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Join Date:</span><span className="font-medium">{formatDate(customer.joinDate)}</span></div>
                        <div className="flex justify-between items-center"><span className="text-gray-600">Status:</span><span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>{customer.status}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'health' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 p-4 rounded-lg"><h4 className="font-semibold text-blue-900 mb-2">Height</h4><p className="text-2xl font-bold text-blue-600">{customer.height} cm</p></div>
                    <div className="bg-green-50 p-4 rounded-lg"><h4 className="font-semibold text-green-900 mb-2">Weight</h4><p className="text-2xl font-bold text-green-600">{customer.weight} kg</p></div>
                    <div className="bg-purple-50 p-4 rounded-lg"><h4 className="font-semibold text-purple-900 mb-2">BMI</h4><p className="text-2xl font-bold text-purple-600">{customer.bmi ? customer.bmi.toFixed(1) : 'N/A'}</p></div>
                  </div>
                  {customer.address && (customer.address.street || customer.address.city || customer.address.pincode) && (
                    <div className="space-y-4"><h3 className="text-lg font-semibold text-gray-900">Address</h3><div className="bg-gray-50 p-4 rounded-lg"><p className="text-sm text-gray-700">{customer.address.street && `${customer.address.street}, `}{customer.address.city && `${customer.address.city}, `}{customer.address.pincode && customer.address.pincode}</p></div></div>
                  )}
                </div>
              )}

              {activeTab === 'payments' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between"><span className="text-gray-600">Monthly Fee:</span><span className="font-medium text-lg">₹{customer.fee.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Payment Mode:</span><span className="font-medium">{customer.paymentMode || '—'}</span></div>
                        <div className="flex justify-between items-center"><span className="text-gray-600">Payment Status:</span><span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(customer.paymentStatus || 'Pending')}`}>{customer.paymentStatus || 'Pending'}</span></div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Summary</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        {(() => {
                          const payments = customer.payments || {};
                          const paidMonths = Object.values(payments).filter(Boolean).length;
                          const unpaidMonths = Object.values(payments).filter(p => !p).length;
                          const totalMonths = buildFullMonthRows().length;
                          const frozen = (customer.frozenMonths || []).length;
                          return (
                            <div className="space-y-2">
                              <div className="flex justify-between"><span className="text-gray-600">Total Months:</span><span className="font-medium">{totalMonths}</span></div>
                              <div className="flex justify-between"><span className="text-gray-600">Paid:</span><span className="font-medium text-green-600">{paidMonths}</span></div>
                              <div className="flex justify-between"><span className="text-gray-600">Unpaid:</span><span className="font-medium text-red-600">{unpaidMonths}</span></div>
                              <div className="flex justify-between"><span className="text-gray-600">Frozen:</span><span className="font-medium text-gray-700">{frozen}</span></div>
                              <div className="flex justify-between border-t pt-2"><span className="text-gray-600">Total Due:</span><span className="font-medium text-lg">₹{(unpaidMonths * customer.fee).toLocaleString()}</span></div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Payment History & Management</h3>
                    <div className="bg-white border rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {buildFullMonthRows().map((row) => {
                              const startKey = startMonthKeyFromCustomer(customer);
                              const disableFirstMonth = startKey === row.key;
                              return (
                              <tr key={row.key} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {row.start.toLocaleDateString('en-GB')} - {row.end.toLocaleDateString('en-GB')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.frozen ? 'bg-gray-100 text-gray-800' : row.paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {row.frozen ? 'Frozen' : row.paid ? 'Paid' : 'Unpaid'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.paymentMode || '—'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{customer.fee.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex gap-2">
                                  <button onClick={() => updatePayment(row.key, 'paid')} disabled={updatingPayment} className="px-3 py-1 rounded text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50">Mark Paid</button>
                                  <button onClick={() => updatePayment(row.key, 'unpaid')} disabled={updatingPayment || disableFirstMonth} className="px-3 py-1 rounded text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50" title={disableFirstMonth ? 'Cannot mark first month as unpaid' : undefined}>Mark Unpaid</button>
                                  <button onClick={() => updatePayment(row.key, 'frozen')} disabled={updatingPayment || disableFirstMonth} className="px-3 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50" title={disableFirstMonth ? 'Cannot freeze the first month' : undefined}>Frozen</button>
                                </td>
                              </tr>
                              );
                            })}
                            {buildFullMonthRows().length === 0 && (
                              <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No months to show</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'contact' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4"><h3 className="text-lg font-semibold text-gray-900">Primary Contact</h3><div className="space-y-3"><div><label className="text-sm font-medium text-gray-600">Phone Number</label><p className="mt-1 text-lg font-medium">{customer.phone}</p></div><div><label className="text-sm font-medium text-gray-600">Email Address</label><p className="mt-1 text-lg font-medium">{customer.email}</p></div></div></div>
                    <div className="space-y-4"><h3 className="text-lg font-semibold text-gray-900">Emergency Contact</h3><div className="space-y-3"><div><label className="text-sm font-medium text-gray-600">Emergency Contact Name</label><p className="mt-1 text-lg font-medium">{customer.emergencyContactName || 'N/A'}</p></div><div><label className="text-sm font-medium text-gray-600">Emergency Contact Phone</label><p className="mt-1 text-lg font-medium">{customer.emergencyContactPhone || 'N/A'}</p></div></div></div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
