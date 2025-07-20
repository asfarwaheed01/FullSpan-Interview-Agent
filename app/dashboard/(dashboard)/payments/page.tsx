"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Plus,
  Trash2,
  Shield,
  Lock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Star,
} from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { toast } from "react-toastify";
import { getToken } from "@/app/utils/constants";
import ConfirmationModal from "@/app/components/ConfirmationModal/ConfirmationModal";
import StripeCardForm from "@/app/components/StripeCardForm/StripeCardForm";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

const PaymentsPage = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddCard, setShowAddCard] = useState(false);
  const [deletingCard, setDeletingCard] = useState<string | null>(null);
  const [settingDefault, setSettingDefault] = useState<string | null>(null);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payments/methods`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPaymentMethods(data.data.paymentMethods || []);
      } else {
        const errorData = await response.json();
        console.error("Error fetching payment methods:", errorData);
        toast.error("Failed to load payment methods");
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      toast.error("Failed to load payment methods");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCard = async (paymentMethodId: string) => {
    const cardToDelete = paymentMethods.find(
      (method) => method.id === paymentMethodId
    );
    const cardDisplay = cardToDelete
      ? `${cardToDelete.brand} •••• ${cardToDelete.last4}`
      : "this payment method";

    setConfirmModal({
      isOpen: true,
      title: "Remove Payment Method",
      message: `Are you sure you want to remove ${cardDisplay}? This action cannot be undone.`,
      onConfirm: async () => {
        setDeletingCard(paymentMethodId);

        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payments/methods/${paymentMethodId}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${getToken()}`,
              },
            }
          );

          if (response.ok) {
            toast.success("Payment method removed successfully");
            fetchPaymentMethods();
          } else {
            const data = await response.json();
            throw new Error(data.message || "Failed to remove payment method");
          }
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to remove payment method";
          toast.error(errorMessage);
        } finally {
          setDeletingCard(null);
        }
      },
    });
  };

  const handleSetDefault = async (paymentMethodId: string) => {
    setSettingDefault(paymentMethodId);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payments/default`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            paymentMethodId,
          }),
        }
      );

      if (response.ok) {
        toast.success("Default payment method updated");
        fetchPaymentMethods();
      } else {
        const data = await response.json();
        throw new Error(data.message || "Failed to set default payment method");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to set default payment method";
      toast.error(errorMessage);
    } finally {
      setSettingDefault(null);
    }
  };

  const handleCardAdded = () => {
    setShowAddCard(false);
    fetchPaymentMethods();
  };

  const getCardBrandIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case "visa":
        return "💳";
      case "mastercard":
        return "💳";
      case "amex":
        return "💳";
      default:
        return "💳";
    }
  };

  const closeConfirmModal = () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading payment methods...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Methods
          </h1>
          <p className="text-gray-600">
            Manage your payment methods for interview sessions ($5.00 per
            session)
          </p>
        </div>

        {/* Pricing Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-1">
                Interview Session Pricing
              </h3>
              <p className="text-sm text-blue-700">
                Each interview session costs $5.00. Your payment method will be
                charged automatically when you start an interview.
              </p>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Saved Payment Methods
              </h2>
              {!showAddCard && (
                <button
                  onClick={() => setShowAddCard(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Card
                </button>
              )}
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {/* Existing Payment Methods */}
            {paymentMethods.length > 0 ? (
              paymentMethods.map((method) => (
                <div key={method.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center mr-4">
                        <span className="text-lg">
                          {getCardBrandIcon(method.brand)}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900 capitalize mr-2">
                            {method.brand} •••• {method.last4}
                          </p>
                          {method.isDefault && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          Expires {method.expMonth.toString().padStart(2, "0")}/
                          {method.expYear}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* Set as Default Button */}
                      {!method.isDefault && (
                        <button
                          onClick={() => handleSetDefault(method.id)}
                          disabled={settingDefault === method.id}
                          className="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 text-xs font-medium"
                        >
                          {settingDefault === method.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <div className="flex items-center">
                              <Star className="w-3 h-3 mr-1" />
                              Set Default
                            </div>
                          )}
                        </button>
                      )}

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteCard(method.id)}
                        disabled={deletingCard === method.id}
                        className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {deletingCard === method.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No payment methods
                </h3>
                <p className="text-gray-600 mb-4">
                  Add a payment method to start interview sessions
                </p>
                {!showAddCard && (
                  <button
                    onClick={() => setShowAddCard(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Add Your First Card
                  </button>
                )}
              </div>
            )}

            {/* Add New Card Form */}
            {showAddCard && (
              <div className="px-6 py-6 bg-gray-50">
                <div className="max-w-md">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Add New Payment Method
                  </h3>
                  <Elements stripe={stripePromise}>
                    <StripeCardForm onCardAdded={handleCardAdded} />
                  </Elements>
                  <button
                    onClick={() => setShowAddCard(false)}
                    className="mt-4 text-gray-600 hover:text-gray-700 text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start">
            <Shield className="w-6 h-6 text-green-600 mt-1 mr-4 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Your Payment Information is Secure
              </h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p className="flex items-center">
                  <Lock className="w-4 h-4 mr-2 text-gray-500" />
                  All card information is encrypted and processed securely by
                  Stripe
                </p>
                <p className="flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-gray-500" />
                  We never store your card details on our servers
                </p>
                <p className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-gray-500" />
                  PCI DSS compliant payment processing
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stripe Branding */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center text-xs text-gray-500">
            <Lock className="w-3 h-3 mr-1" />
            <span>Powered by Stripe • Secure & PCI Compliant</span>
          </div>
        </div>

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          onClose={closeConfirmModal}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText="Remove"
          cancelText="Cancel"
          isDestructive={true}
        />
      </div>
    </div>
  );
};

export default PaymentsPage;
