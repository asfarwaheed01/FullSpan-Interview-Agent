"use client";
import React, { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

interface ForgotPasswordFormData {
  email: string;
}

interface ForgotPasswordFormErrors {
  email?: string;
}

interface FormState {
  isLoading: boolean;
  isSubmitted: boolean;
  error: string | null;
}

const ForgotPasswordPage: React.FC = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: "",
  });

  const [errors, setErrors] = useState<ForgotPasswordFormErrors>({});

  const [formState, setFormState] = useState<FormState>({
    isLoading: false,
    isSubmitted: false,
    error: null,
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof ForgotPasswordFormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Clear form error
    if (formState.error) {
      setFormState((prev) => ({
        ...prev,
        error: null,
      }));
    }
  };

  const validateForm = (): ForgotPasswordFormErrors => {
    const newErrors: ForgotPasswordFormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    return newErrors;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
      setFormState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        // Simulate API call for password reset
        console.log("Password reset requested for:", formData.email);

        // Replace this with your actual API call
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            // Simulate success most of the time
            if (Math.random() > 0.1) {
              resolve("Success");
            } else {
              reject(new Error("Email not found"));
            }
          }, 2000);
        });

        setFormState((prev) => ({
          ...prev,
          isLoading: false,
          isSubmitted: true,
        }));
      } catch (error) {
        setFormState((prev) => ({
          ...prev,
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : "An error occurred. Please try again.",
        }));
      }
    } else {
      setErrors(newErrors);
    }
  };

  const handleBackToLogin = (): void => {
    router.push("/login"); // Adjust the path as needed
  };

  const handleTryAgain = (): void => {
    setFormState({
      isLoading: false,
      isSubmitted: false,
      error: null,
    });
    setFormData({ email: "" });
    setErrors({});
  };

  if (formState.isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full space-y-8 text-center"
        >
          <div className="space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto"
            >
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-gray-900"
            >
              Check your email
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600"
            >
              We&apos;ve sent password reset instructions to{" "}
              <span className="font-medium text-gray-900">
                {formData.email}
              </span>
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            <button
              onClick={handleBackToLogin}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white transition-all duration-200"
              style={{ backgroundColor: "#6576FF" }}
            >
              Back to Login
            </button>

            <button
              onClick={handleTryAgain}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              Didn&apos;t receive the email? Try again
            </button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm font-medium text-blue-600 uppercase tracking-wide mb-2"
            style={{ color: "#6576FF" }}
          >
            FORGOT PASSWORD ?
          </motion.p>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-gray-900"
          >
            Reset from Here.
          </motion.h2>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 space-y-6"
        >
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Reset password
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  If you forgot your password, well, then we&apos;ll email you
                  instructions to reset your password.
                </p>
              </div>

              <div onSubmit={() => handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`appearance-none relative block w-full px-4 py-3 border ${
                      errors.email ? "border-red-300" : "border-gray-300"
                    } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                    placeholder="Your Email"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        // handleSubmit(e as any);
                      }
                    }}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {formState.error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-lg p-3"
                  >
                    <p className="text-sm text-red-600">{formState.error}</p>
                  </motion.div>
                )}

                <motion.button
                  type="button"
                  onClick={() => handleSubmit}
                  disabled={formState.isLoading}
                  whileHover={{ scale: formState.isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: formState.isLoading ? 1 : 0.98 }}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${
                    formState.isLoading ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                  style={{ backgroundColor: "#6576FF" }}
                >
                  {formState.isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending Reset Link...
                    </div>
                  ) : (
                    "Send Reset Link"
                  )}
                </motion.button>
              </div>
            </div>
          </div>

          {/* Back to Login */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <button
              onClick={handleBackToLogin}
              className="inline-flex items-center text-sm font-medium hover:text-blue-500 transition-colors duration-200"
              style={{ color: "#6576FF" }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
