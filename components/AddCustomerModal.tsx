"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddCustomerModal({ isOpen, onClose, onSuccess }: AddCustomerModalProps) {
  const [formData, setFormData] = useState({
    // Basic Personal Information
    name: "",
    dateOfBirth: "",
    gender: "Male" as "Male" | "Female" | "Other",
    profilePicture: "",
    
    // Contact Information
    phone: "",
    email: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    
    // Membership Details
    joinDate: new Date().toISOString().split('T')[0],
    membershipType: "Monthly" as "Monthly" | "Quarterly" | "Yearly" | "Personal Training" | "Other",
    membershipStartDate: new Date().toISOString().split('T')[0],
    membershipEndDate: "",
    status: "Active" as "Active" | "Expired" | "On Hold" | "Suspended",
    
    // Payment Information
    fee: "",
    paymentMode: "UPI" as "Cash" | "UPI" | "Card" | "Bank Transfer" | "Other",
    paymentStatus: "Paid" as "Paid" | "Pending" | "Overdue",
    dueDate: "",
    
    // Health & Fitness Information
    height: "",
    weight: "",
    medicalConditions: "",
    fitnessGoal: "General Fitness" as "Weight Loss" | "Muscle Gain" | "Strength Training" | "General Fitness" | "Endurance" | "Other",
    
    // Address
    address: {
      street: "",
      city: "",
      pincode: ""
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Dynamic fee label based on membership type
  const feeLabel = formData.membershipType === "Monthly"
    ? "Monthly Fee"
    : formData.membershipType === "Quarterly"
      ? "Quarterly Fee"
      : formData.membershipType === "Yearly"
        ? "Yearly Fee"
        : "Package Fee";

  // Calculate BMI
  const calculateBMI = () => {
    const height = parseFloat(formData.height);
    const weight = parseFloat(formData.weight);
    if (height > 0 && weight > 0) {
      const heightInMeters = height / 100;
      return (weight / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return null;
  };

  // Calculate membership end date based on type
  const calculateEndDate = (startDate: string, type: string) => {
    const start = new Date(startDate);
    const end = new Date(start);
    
    switch (type) {
      case "Monthly":
        end.setMonth(end.getMonth() + 1);
        break;
      case "Quarterly":
        end.setMonth(end.getMonth() + 3);
        break;
      case "Yearly":
        end.setFullYear(end.getFullYear() + 1);
        break;
      case "Personal Training":
        end.setMonth(end.getMonth() + 1);
        break;
      default:
        end.setMonth(end.getMonth() + 1);
    }
    
    return end.toISOString().split('T')[0];
  };

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        dateOfBirth: "",
        gender: "Male",
        profilePicture: "",
        phone: "",
        email: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
        joinDate: new Date().toISOString().split('T')[0],
        membershipType: "Monthly",
        membershipStartDate: new Date().toISOString().split('T')[0],
        membershipEndDate: "",
        status: "Active",
        fee: "",
        paymentMode: "UPI",
        paymentStatus: "Paid",
        dueDate: "",
        height: "",
        weight: "",
        medicalConditions: "",
        fitnessGoal: "General Fitness",
        address: { street: "", city: "", pincode: "" }
      });
      setError(null);
      setCurrentStep(1);
    }
  }, [isOpen]);

  // Update end date when membership type or start date changes
  useEffect(() => {
    if (formData.membershipType && formData.membershipStartDate) {
      const endDate = calculateEndDate(formData.membershipStartDate, formData.membershipType);
      setFormData(prev => ({ ...prev, membershipEndDate: endDate }));
    }
  }, [formData.membershipType, formData.membershipStartDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log("Submitting customer data:", formData);
      
      const bmi = calculateBMI();
      const customerData = {
        ...formData,
        fee: Number(formData.fee),
        height: Number(formData.height),
        weight: Number(formData.weight),
        bmi: bmi ? Number(bmi) : undefined,
        contact: formData.phone, // Legacy field
        payments: {} // Start with empty payments
      };
      
      const response = await fetch('/api/customers/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      });

      console.log("Response status:", response.status);
      const result = await response.json();
      console.log("Response data:", result);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add customer');
      }

      console.log("Customer added successfully");
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error adding customer:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.name && formData.dateOfBirth && formData.gender;
      case 2:
        return formData.phone && formData.email && formData.emergencyContactName && formData.emergencyContactPhone;
      case 3:
        return formData.membershipType && formData.fee && formData.paymentMode;
      case 4:
        return formData.height && formData.weight && formData.fitnessGoal;
      default:
        return false;
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
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Add New Member</h2>
            <p className="text-sm text-gray-500">Step {currentStep} of {totalSteps}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-3 bg-gray-50">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-12 h-1 mx-2 ${
                    step < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 max-h-[60vh] overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2 mb-6">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Full Name *</label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Date of Birth *</label>
                  <Input
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Gender *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Profile Picture URL</label>
                  <Input
                    name="profilePicture"
                    value={formData.profilePicture}
                    onChange={handleChange}
                    placeholder="https://example.com/photo.jpg"
                    className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Contact Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Phone Number *</label>
                  <Input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email Address *</label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="member@example.com"
                    className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Emergency Contact Name *</label>
                  <Input
                    name="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={handleChange}
                    placeholder="Emergency contact name"
                    className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Emergency Contact Phone *</label>
                  <Input
                    name="emergencyContactPhone"
                    type="tel"
                    value={formData.emergencyContactPhone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Membership & Payment */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Membership & Payment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Membership Type *</label>
                  <select
                    name="membershipType"
                    value={formData.membershipType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Yearly">Yearly</option>
                    <option value="Personal Training">Personal Training</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">{feeLabel} (₹) *</label>
                  <Input
                    name="fee"
                    type="number"
                    value={formData.fee}
                    onChange={handleChange}
                    placeholder={feeLabel === "Monthly Fee" ? "1000" : feeLabel === "Quarterly Fee" ? "3000" : feeLabel === "Yearly Fee" ? "12000" : "5000"}
                    min="0"
                    className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Payment Mode *</label>
                  <select
                    name="paymentMode"
                    value={formData.paymentMode}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Card">Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Payment Status *</label>
                  <select
                    name="paymentStatus"
                    value={formData.paymentStatus}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Membership Start Date *</label>
                  <Input
                    name="membershipStartDate"
                    type="date"
                    value={formData.membershipStartDate}
                    onChange={handleChange}
                    className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Membership End Date</label>
                  <Input
                    name="membershipEndDate"
                    type="date"
                    value={formData.membershipEndDate}
                    onChange={handleChange}
                    className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    readOnly
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Health & Fitness */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Health & Fitness Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Height (cm) *</label>
                  <Input
                    name="height"
                    type="number"
                    value={formData.height}
                    onChange={handleChange}
                    placeholder="170"
                    min="0"
                    className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Weight (kg) *</label>
                  <Input
                    name="weight"
                    type="number"
                    value={formData.weight}
                    onChange={handleChange}
                    placeholder="70"
                    min="0"
                    step="0.1"
                    className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                {calculateBMI() && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">BMI (Calculated)</label>
                    <Input
                      value={calculateBMI()}
                      className="rounded-lg border-gray-300 bg-gray-100"
                      readOnly
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Fitness Goal *</label>
                  <select
                    name="fitnessGoal"
                    value={formData.fitnessGoal}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="Weight Loss">Weight Loss</option>
                    <option value="Muscle Gain">Muscle Gain</option>
                    <option value="Strength Training">Strength Training</option>
                    <option value="General Fitness">General Fitness</option>
                    <option value="Endurance">Endurance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Medical Conditions</label>
                  <textarea
                    name="medicalConditions"
                    value={formData.medicalConditions}
                    onChange={handleChange}
                    placeholder="Any medical conditions or injuries..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Street Address</label>
                  <Input
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    placeholder="123 Main Street"
                    className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">City</label>
                  <Input
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    placeholder="Mumbai"
                    className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Pincode</label>
                  <Input
                    name="address.pincode"
                    value={formData.address.pincode}
                    onChange={handleChange}
                    placeholder="400001"
                    className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t border-gray-200 mt-6">
            <div>
              {currentStep > 1 && (
                <Button
                  type="button"
                  onClick={prevStep}
                  className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-0 rounded-lg"
                >
                  Previous
                </Button>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={onClose}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-0 rounded-lg"
              >
                Cancel
              </Button>
              
              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!isStepValid(currentStep)}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={loading || !isStepValid(currentStep)}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Adding Member...
                    </div>
                  ) : (
                    "Add Member"
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}