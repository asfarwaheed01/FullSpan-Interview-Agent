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
} from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { toast } from "react-toastify";

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

const AddCardForm = ({ onCardAdded }: { onCardAdded: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        setError("Card element not found");
        setLoading(false);
        return;
      }

      // Create payment method
      const { error: stripeError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: "card",
          card: cardElement,
        });

      if (stripeError) {
        setError(stripeError.message || "An error occurred");
        setLoading(false);
        return;
      }

      // Save payment method to backend
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
        }/api/payments/add-payment-method`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            paymentMethodId: paymentMethod.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save payment method");
      }

      // Success
      toast.success("Payment method added successfully!");
      onCardAdded();

      // Clear the form
      cardElement.clear();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add payment method";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#424770",
        "::placeholder": {
          color: "#aab7c4",
        },
        padding: "12px",
      },
      invalid: {
        color: "#9e2146",
      },
    },
    hidePostalCode: false,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Information
        </label>
        <div className="border border-gray-300 rounded-lg p-4 bg-white">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Adding Card...
          </>
        ) : (
          <>
            <Plus className="w-4 h-4 mr-2" />
            Add Payment Method
          </>
        )}
      </button>
    </form>
  );
};

const PaymentsPage = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddCard, setShowAddCard] = useState(false);
  const [deletingCard, setDeletingCard] = useState<string | null>(null);

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
        }/api/payments/methods`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPaymentMethods(data.data.paymentMethods || []);
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      toast.error("Failed to load payment methods");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCard = async (paymentMethodId: string) => {
    if (!confirm("Are you sure you want to remove this payment method?")) {
      return;
    }

    setDeletingCard(paymentMethodId);

    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
        }/api/payments/methods/${paymentMethodId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
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
                    <AddCardForm onCardAdded={handleCardAdded} />
                  </Elements>
                  <button
                    onClick={() => setShowAddCard(false)}
                    className="mt-3 text-gray-600 hover:text-gray-700 text-sm"
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
      </div>
    </div>
  );
};

export default PaymentsPage;
