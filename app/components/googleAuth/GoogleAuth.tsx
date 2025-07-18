"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup, GoogleAuthProvider, getAuth } from "firebase/auth";
import { toast } from "react-toastify";
import { app } from "@/app/utils/firebase";
import { useAuth } from "@/app/contexts/AuthContext";

const auth = getAuth(app);

interface GoogleAuthProps {
  buttonText?: string;
  className?: string;
  disabled?: boolean;
}

const GoogleAuth: React.FC<GoogleAuthProps> = ({
  buttonText = "Continue with Google",
  className = "",
  disabled = false,
}) => {
  const router = useRouter();
  const { socialLogin } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    if (disabled || loading) return;

    setLoading(true);

    try {
      // Create Google Auth Provider
      const provider = new GoogleAuthProvider();

      // Configure provider to get additional user info
      provider.addScope("profile");
      provider.addScope("email");

      // Sign in with popup
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Extract user information
      const userData = {
        email: user.email || "",
        username: user.displayName || user.email?.split("@")[0] || "",
        image: user.photoURL || undefined,
      };

      console.log("Google Auth Success:", userData);

      // Call your social login endpoint
      const loginResult = await socialLogin(
        userData.email,
        userData.username,
        userData.image
      );

      // Redirect based on first login status
      if (loginResult.isFirstLogin) {
        toast.success("Welcome! Please complete your profile setup.", {
          position: "top-right",
          autoClose: 3000,
        });
        router.push("/user-configuration");
      } else {
        toast.success(`Welcome back, ${userData.username}!`, {
          position: "top-right",
          autoClose: 3000,
        });
        router.push("/dashboard");
      }
    } catch (error: unknown) {
      console.error("Google Auth Error:", error);

      // Handle specific Firebase errors
      let errorMessage = "Google sign-in failed";

      if (error && typeof error === "object" && "code" in error) {
        if (error.code === "auth/popup-closed-by-user") {
          errorMessage = "Sign-in cancelled";
        } else if (error.code === "auth/popup-blocked") {
          errorMessage = "Popup blocked. Please allow popups and try again.";
        } else if (error.code === "auth/network-request-failed") {
          errorMessage = "Network error. Please check your connection.";
        }
      }

      if (error instanceof Error && error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={disabled || loading}
      className={`
        flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-lg
        bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 
        focus:ring-blue-500 focus:border-transparent transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700 mr-3"></div>
          <span>Signing in...</span>
        </>
      ) : (
        <>
          <svg
            className="w-5 h-5 mr-3"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>{buttonText}</span>
        </>
      )}
    </button>
  );
};

// Export a version with common styling for forms
export const GoogleAuthButton: React.FC<{
  text?: string;
  variant?: "default" | "outline";
}> = ({ text = "Continue with Google", variant = "default" }) => {
  const baseClasses =
    variant === "outline"
      ? "border-2 border-gray-300 bg-white hover:bg-gray-50"
      : "border border-gray-300 bg-white hover:bg-gray-50";

  return <GoogleAuth buttonText={text} className={baseClasses} />;
};

export default GoogleAuth;
