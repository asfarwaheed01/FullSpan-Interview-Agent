"use client";
import React, { useState, ChangeEvent, FormEvent, MouseEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import GoogleAuth from "@/app/components/googleAuth/GoogleAuth";
import {
  LoginError,
  LoginFormData,
  LoginFormErrors,
} from "@/app/interfaces/login";

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { login, loading, error } = useAuth();

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<LoginFormErrors>({});

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof LoginFormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = (): LoginFormErrors => {
    const newErrors: LoginFormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    return newErrors;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
      setErrors({});

      try {
        const result = await login(
          formData.email,
          formData.password,
          formData.rememberMe
        );

        if (
          result &&
          typeof result === "object" &&
          "needsEmailVerification" in result
        ) {
          router.push(
            `/verify-email?email=${encodeURIComponent(
              formData.email
            )}&from=login`
          );
          return;
        }

        if (result && typeof result === "object" && "isFirstLogin" in result) {
          if (result.isFirstLogin) {
            router.push("/user-configuration");
          } else {
            router.push("/dashboard");
          }
        } else {
          const userData = result?.user || result;
          if (userData?.isFirstLogin) {
            router.push("/user-configuration");
          } else {
            router.push("/dashboard");
          }
        }
      } catch (error: unknown) {
        console.error("Login failed:", error);

        const loginError = error as LoginError;

        if (
          loginError?.message?.includes("verify your email") ||
          loginError?.message?.includes("verification") ||
          loginError?.status === 403 ||
          loginError?.needsEmailVerification
        ) {
          router.push(
            `/verify-email?email=${encodeURIComponent(
              formData.email
            )}&from=login`
          );
          return;
        }

        if (loginError?.message) {
          setErrors({
            general: loginError.message,
          });
        }
      }
    } else {
      setErrors(newErrors);
    }
  };

  const togglePasswordVisibility = (): void => {
    setShowPassword(!showPassword);
  };

  const handleButtonHover = (
    e: MouseEvent<HTMLButtonElement>,
    isEntering: boolean
  ): void => {
    if (loading) return;
    const target = e.target as HTMLButtonElement;
    target.style.backgroundColor = isEntering ? "#5a6beb" : "#6576FF";
  };

  const handleForgotPassword = (): void => {
    router.push("/forgot-password");
  };

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
            WELCOME BACK!
          </motion.p>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-gray-900"
          >
            Login to continue
          </motion.h2>
        </div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 space-y-6"
          onSubmit={handleSubmit}
        >
          {/* General Error Message - Show context error or local error */}
          {(error || errors.general) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-lg p-4"
            >
              <p className="text-sm text-red-600">{error || errors.general}</p>
            </motion.div>
          )}

          <div className="space-y-5">
            {/* Email */}
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
                disabled={loading}
                className={`appearance-none relative block w-full px-4 py-3 border ${
                  errors.email ? "border-red-300" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                placeholder="Your Email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={loading}
                  className={`appearance-none relative block w-full px-4 py-3 pr-12 border ${
                    errors.password ? "border-red-300" : "border-gray-300"
                  } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  placeholder="Enter Password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={togglePasswordVisibility}
                  disabled={loading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
          </div>

          {/* Remember Me and Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                disabled={loading}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                style={{ accentColor: "#6576FF" }}
              />
              <label
                htmlFor="rememberMe"
                className="ml-2 block text-sm text-gray-600"
              >
                Remember Me
              </label>
            </div>

            <div className="text-sm">
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={loading}
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200 disabled:opacity-50"
                style={{ color: "#6576FF" }}
              >
                Forgot Password ?
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${
                loading ? "opacity-75 cursor-not-allowed" : ""
              }`}
              style={{ backgroundColor: "#6576FF" }}
              onMouseEnter={(e) => !loading && handleButtonHover(e, true)}
              onMouseLeave={(e) => !loading && handleButtonHover(e, false)}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Logging in...
                </div>
              ) : (
                "Login"
              )}
            </motion.button>
          </div>

          {/* Social Login */}
          <div>
            <GoogleAuth />
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-medium hover:text-blue-500 transition-colors duration-200"
                style={{ color: "#6576FF" }}
              >
                Register
              </Link>
            </p>
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default LoginPage;
