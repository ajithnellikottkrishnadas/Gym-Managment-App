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
  membershipStartDate: string;
  membershipEndDate: string;
  status: string;
  fee: number;
  paymentMode: string;
  paymentStatus: string;
  dueDate: string;
  height: number;
  weight: number;
  bmi?: number;
  medicalConditions?: string;
  fitnessGoal: string;
  address?: {
    street: string;
    city: string;
    pincode: string;
  };
  contact: string;
  payments: Record<string, boolean>;
}

export default function UserDetailsModal({ isOpen, onClose, customerId }: UserDetailsModalProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'health' | 'payments' | 'contact'>('overview');

  useEffect(() => {
    if (isOpen && customerId) {
      fetchCustomerDetails();
    }
  }, [isOpen, customerId]);

  const fetchCustomerDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/customers/${customerId}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch customer details');
      }
      
      setCustomer(result.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Expired': return 'bg-red-100 text-red-800';
      case 'On Hold': return 'bg-yellow-100 text-yellow-800';
      case 'Suspended': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center gap-4">
            {customer?.profilePicture ? (
              <img 
                src={customer.profilePicture} 
                alt={customer.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-white"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                {customer?.name?.charAt(0) || '?'}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-semibold">{customer?.name || 'Loading...'}</h2>
              <p className="text-blue-100">Registration #{customer?.regNo || 'N/A'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              Loading customer details...
            </div>
          </div>
        )}

        {error && (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          </div>
        )}

        {customer && (
          <>
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'overview', label: 'Overview', icon: '👤' },
                  { id: 'health', label: 'Health & Fitness', icon: '💪' },
                  { id: 'payments', label: 'Payments', icon: '💰' },
                  { id: 'contact', label: 'Contact', icon: '📞' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Full Name:</span>
                          <span className="font-medium">{customer.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date of Birth:</span>
                          <span className="font-medium">{formatDate(customer.dateOfBirth)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Age:</span>
                          <span className="font-medium">{calculateAge(customer.dateOfBirth)} years</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Gender:</span>
                          <span className="font-medium">{customer.gender}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Membership Details</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Membership Type:</span>
                          <span className="font-medium">{customer.membershipType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Join Date:</span>
                          <span className="font-medium">{formatDate(customer.joinDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Start Date:</span>
                          <span className="font-medium">{formatDate(customer.membershipStartDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">End Date:</span>
                          <span className="font-medium">{formatDate(customer.membershipEndDate)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Status:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                            {customer.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Payment Information</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Monthly Fee:</span>
                          <span className="font-medium">₹{customer.fee.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Mode:</span>
                          <span className="font-medium">{customer.paymentMode}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Payment Status:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(customer.paymentStatus)}`}>
                            {customer.paymentStatus}
                          </span>
                        </div>
                        {customer.dueDate && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Due Date:</span>
                            <span className="font-medium">{formatDate(customer.dueDate)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Fitness Goals</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Primary Goal:</span>
                          <span className="font-medium">{customer.fitnessGoal}</span>
                        </div>
                        {customer.medicalConditions && (
                          <div>
                            <span className="text-gray-600 block mb-2">Medical Conditions:</span>
                            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                              {customer.medicalConditions}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Health & Fitness Tab */}
              {activeTab === 'health' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Height</h4>
                      <p className="text-2xl font-bold text-blue-600">{customer.height} cm</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">Weight</h4>
                      <p className="text-2xl font-bold text-green-600">{customer.weight} kg</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-2">BMI</h4>
                      <p className="text-2xl font-bold text-purple-600">
                        {customer.bmi ? customer.bmi.toFixed(1) : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Fitness Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Fitness Goal</label>
                        <p className="mt-1 text-lg font-medium">{customer.fitnessGoal}</p>
                      </div>
                      {customer.medicalConditions && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Medical Conditions</label>
                          <p className="mt-1 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                            {customer.medicalConditions}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {customer.address && (customer.address.street || customer.address.city || customer.address.pincode) && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Address</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-700">
                          {customer.address.street && `${customer.address.street}, `}
                          {customer.address.city && `${customer.address.city}, `}
                          {customer.address.pincode && customer.address.pincode}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Payments Tab */}
              {activeTab === 'payments' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Monthly Fee:</span>
                          <span className="font-medium text-lg">₹{customer.fee.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Mode:</span>
                          <span className="font-medium">{customer.paymentMode}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Status:</span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(customer.paymentStatus)}`}>
                            {customer.paymentStatus}
                          </span>
                        </div>
                        {customer.dueDate && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Due Date:</span>
                            <span className="font-medium">{formatDate(customer.dueDate)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
                      <div className="space-y-2">
                        {Object.keys(customer.payments).length > 0 ? (
                          Object.entries(customer.payments)
                            .sort(([a], [b]) => b.localeCompare(a))
                            .map(([month, paid]) => (
                              <div key={month} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                                <span className="font-medium">{month}</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {paid ? 'Paid' : 'Unpaid'}
                                </span>
                              </div>
                            ))
                        ) : (
                          <p className="text-gray-500 text-sm">No payment history available</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Tab */}
              {activeTab === 'contact' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Primary Contact</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Phone Number</label>
                          <p className="mt-1 text-lg font-medium">{customer.phone}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Email Address</label>
                          <p className="mt-1 text-lg font-medium">{customer.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Emergency Contact</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Emergency Contact Name</label>
                          <p className="mt-1 text-lg font-medium">{customer.emergencyContactName || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Emergency Contact Phone</label>
                          <p className="mt-1 text-lg font-medium">{customer.emergencyContactPhone || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <Button
                onClick={onClose}
                className="bg-gray-500 hover:bg-gray-600 text-white"
              >
                Close
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
