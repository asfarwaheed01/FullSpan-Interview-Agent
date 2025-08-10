"use client";
import React, { createContext, useContext, useReducer, useEffect } from "react";
import { toast } from "react-toastify";
import {
  AuthState,
  LoginResponse,
  RegisterResponse,
  User,
} from "../interfaces/auth";

// Types

type ActionType =
  | { type: "LOGIN"; payload: { user: User; isFirstLogin?: boolean } }
  | { type: "LOGOUT" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string }
  | { type: "UPDATE_USER"; payload: Partial<User> }
  | { type: "SET_FIRST_LOGIN"; payload: boolean };

export interface AuthContextType extends AuthState {
  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<LoginResponse>;
  register: (
    username: string,
    email: string,
    password: string,
    avatar?: string
  ) => Promise<RegisterResponse>;
  verifyEmail: (
    email: string,
    otp: string
  ) => Promise<{ success: boolean; user?: User; token?: string }>;
  socialLogin: (
    email: string,
    username: string,
    image?: string
  ) => Promise<{ isFirstLogin: boolean }>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  isFirstLogin: false,
};

const authReducer = (state: AuthState, action: ActionType): AuthState => {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        loading: false,
        error: null,
        isFirstLogin: action.payload.isFirstLogin || false,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        isFirstLogin: false,
      };
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case "UPDATE_USER":
      if (!state.user) return state;
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    case "SET_FIRST_LOGIN":
      return {
        ...state,
        isFirstLogin: action.payload,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const isAuthenticated = localStorage.getItem("isAuthenticated");

    if (token && storedUser && isAuthenticated === "true") {
      try {
        const user = JSON.parse(storedUser);
        dispatch({ type: "LOGIN", payload: { user, isFirstLogin: false } });
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("isAuthenticated");
      }
    }
  }, []);

  const login = async (
    email: string,
    password: string,
    rememberMe: boolean = false
  ): Promise<LoginResponse> => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        // Successful login
        const { token, user } = data.data;
        const isFirstLogin = data.data.user?.isFirstLogin || false;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("isAuthenticated", "true");

        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
        }

        dispatch({ type: "LOGIN", payload: { user, isFirstLogin } });

        toast.success(`Welcome back, ${user.username}!`, {
          position: "top-right",
          autoClose: 3000,
        });

        return {
          success: true,
          isFirstLogin,
          user,
        };
      } else if (response.status === 403 && data.data?.needsEmailVerification) {
        // Email verification needed - don't show error toast, just return info
        return {
          success: false,
          needsEmailVerification: true,
          email: data.data.email,
          message: data.message,
        };
      } else {
        // Other login errors
        const errorMessage = data.message || "Login failed";
        dispatch({ type: "SET_ERROR", payload: errorMessage });

        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
        });

        throw new Error(errorMessage);
      }
    } catch (error: unknown) {
      if (error instanceof Error && !error.message.includes("verification")) {
        const errorMessage = error.message || "Login failed";
        dispatch({ type: "SET_ERROR", payload: errorMessage });

        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
        });
      }

      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    avatar?: string
  ): Promise<RegisterResponse> => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const requestBody: {
        username: string;
        email: string;
        password: string;
        avatar?: string;
      } = {
        username,
        email,
        password,
      };
      if (avatar) {
        requestBody.avatar = avatar;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(
          "Account created! Please check your email for verification code.",
          {
            position: "top-right",
            autoClose: 5000,
          }
        );

        return {
          success: true,
          needsEmailVerification: true,
          email: data.data?.email || email,
          message: data.message,
        };
      } else {
        // Registration failed
        const errorMessage = data.message || "Registration failed";
        dispatch({ type: "SET_ERROR", payload: errorMessage });

        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
        });

        throw new Error(errorMessage);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Registration failed";
      dispatch({ type: "SET_ERROR", payload: errorMessage });

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });

      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const verifyEmail = async (email: string, otp: string) => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/verify-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, otp }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        const { token, user } = data.data;
        const isFirstLogin = user?.isFirstLogin || true;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("isAuthenticated", "true");

        dispatch({ type: "LOGIN", payload: { user, isFirstLogin } });

        toast.success("Email verified successfully!", {
          position: "top-right",
          autoClose: 3000,
        });

        return { success: true, user, token };
      } else {
        const errorMessage = data.message || "Verification failed";
        dispatch({ type: "SET_ERROR", payload: errorMessage });
        throw new Error(errorMessage);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Verification failed";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const socialLogin = async (
    email: string,
    username: string,
    image?: string
  ): Promise<{ isFirstLogin: boolean }> => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const requestBody: { email: string; username: string; image?: string } = {
        email,
        username,
      };
      if (image) {
        requestBody.image = image;
      }

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
        }/api/auth/social-login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Social login failed");
      }

      if (data.success && data.data) {
        const { token, user } = data.data;
        const isFirstLogin = data.data.user?.isFirstLogin || false;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("isAuthenticated", "true");

        dispatch({ type: "LOGIN", payload: { user, isFirstLogin } });

        toast.success(`Welcome ${user.username}!`, {
          position: "top-right",
          autoClose: 3000,
        });

        return { isFirstLogin };
      }

      return { isFirstLogin: false };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Social login failed";
      dispatch({ type: "SET_ERROR", payload: errorMessage });

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });

      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const updateUser = (userData: Partial<User>) => {
    const currentUser = localStorage.getItem("user");
    if (currentUser) {
      const parsedUser = JSON.parse(currentUser);
      const updatedUser = { ...parsedUser, ...userData };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }

    dispatch({ type: "UPDATE_USER", payload: userData });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("rememberMe");

    dispatch({ type: "LOGOUT" });

    toast.success("Logged out successfully", {
      position: "top-right",
      autoClose: 3000,
    });
    window.location.href = "/";
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: "SET_LOADING", payload: loading });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        verifyEmail,
        socialLogin,
        logout,
        updateUser,
        setLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
