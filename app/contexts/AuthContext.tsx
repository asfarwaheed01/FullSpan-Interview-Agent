"use client";
import React, { createContext, useContext, useReducer, useEffect } from "react";
import { toast } from "react-toastify";

// Types
export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  avatar?: string | null;
  lastLogin?: Date | null;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  isFirstLogin?: boolean;
}

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
  ) => Promise<{ isFirstLogin: boolean }>;
  register: (
    username: string,
    email: string,
    password: string,
    avatar?: string
  ) => Promise<{ isFirstLogin: boolean }>;
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
      } catch (error) {
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
  ): Promise<{ isFirstLogin: boolean }> => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
        }/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (data.success && data.data) {
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

        return { isFirstLogin };
      }

      return { isFirstLogin: false };
    } catch (error: any) {
      const errorMessage = error.message || "Login failed";
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

  const register = async (
    username: string,
    email: string,
    password: string,
    avatar?: string
  ): Promise<{ isFirstLogin: boolean }> => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const requestBody: any = { username, email, password };
      if (avatar) {
        requestBody.avatar = avatar;
      }

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
        }/api/auth/register`,
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
        throw new Error(data.message || "Registration failed");
      }

      if (data.success && data.data) {
        const { token, user } = data.data;
        const isFirstLogin = data.data.user?.isFirstLogin || true;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("isAuthenticated", "true");

        dispatch({ type: "LOGIN", payload: { user, isFirstLogin } });

        toast.success(
          `Welcome ${user.username}! Account created successfully.`,
          {
            position: "top-right",
            autoClose: 5000,
          }
        );

        return { isFirstLogin };
      }

      return { isFirstLogin: true };
    } catch (error: any) {
      const errorMessage = error.message || "Registration failed";
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

  const socialLogin = async (
    email: string,
    username: string,
    image?: string
  ): Promise<{ isFirstLogin: boolean }> => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const requestBody: any = { email, username };
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
    } catch (error: any) {
      const errorMessage = error.message || "Social login failed";
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
