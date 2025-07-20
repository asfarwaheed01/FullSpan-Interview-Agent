"use client";

import React, { useState } from "react";
import { Plus, Loader2, CreditCard, Lock } from "lucide-react";
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import { toast } from "react-toastify";
import { getToken } from "@/app/utils/constants";

interface ImprovedCardFormProps {
  onCardAdded: () => void;
}

export default function StripeCardForm({ onCardAdded }: ImprovedCardFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const elementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#374151",
        fontFamily: "system-ui, -apple-system, sans-serif",
        "::placeholder": {
          color: "#9CA3AF",
        },
        padding: "12px 0",
      },
      invalid: {
        color: "#EF4444",
        iconColor: "#EF4444",
      },
      complete: {
        color: "#059669",
        iconColor: "#059669",
      },
    },
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    if (!cardholderName.trim()) {
      setError("Cardholder name is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const cardNumberElement = elements.getElement(CardNumberElement);

      if (!cardNumberElement) {
        setError("Card element not found");
        setLoading(false);
        return;
      }

      // Create payment method with billing details
      const { error: stripeError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: "card",
          card: cardNumberElement,
          billing_details: {
            name: cardholderName.trim(),
            address: {
              postal_code: postalCode.trim() || undefined,
            },
          },
        });

      if (stripeError) {
        setError(stripeError.message || "An error occurred");
        setLoading(false);
        return;
      }

      // Save payment method to backend
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payments/add-payment-method`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
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
      setCardholderName("");
      setPostalCode("");
      cardNumberElement.clear();
      elements.getElement(CardExpiryElement)?.clear();
      elements.getElement(CardCvcElement)?.clear();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add payment method";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Cardholder Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cardholder Name *
        </label>
        <input
          type="text"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          placeholder="John Doe"
          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          required
        />
      </div>

      {/* Card Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Number *
        </label>
        <div className="relative">
          <div className="w-full px-3 py-3 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
            <CardNumberElement options={elementOptions} />
          </div>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <CreditCard className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Expiry and CVC */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expiry Date *
          </label>
          <div className="w-full px-3 py-3 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
            <CardExpiryElement options={elementOptions} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CVC *
          </label>
          <div className="w-full px-3 py-3 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
            <CardCvcElement options={elementOptions} />
          </div>
        </div>
      </div>

      {/* Postal Code (Optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Postal Code
        </label>
        <input
          type="text"
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
          placeholder="12345"
          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Security Notice */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <div className="flex items-center text-sm text-gray-600">
          <Lock className="w-4 h-4 mr-2 text-gray-500" />
          Your payment information is secure and encrypted
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center text-sm"
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
}
