"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";
import { getToken } from "../utils/constants";
import {
  ApiResponse,
  Interview,
  InterviewContextType,
  Pagination,
} from "../interfaces/interview";
import { useAuth } from "./AuthContext";

const InterviewContext = createContext<InterviewContextType | undefined>(
  undefined
);

interface InterviewProviderProps {
  children: ReactNode;
}

export const InterviewProvider: React.FC<InterviewProviderProps> = ({
  children,
}) => {
  const { logout } = useAuth();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isClient, setIsClient] = useState<boolean>(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getCurrentToken = useCallback(() => {
    if (!isClient) return null;
    return getToken();
  }, [isClient]);

  const fetchInterviews = useCallback(
    async (page: number = 1) => {
      const token = getCurrentToken();

      if (!token) {
        setError("Please log in to view interviews");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: page.toString(),
          limit: "10",
          ...(statusFilter !== "all" && { status: statusFilter }),
        });

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/interviews?${params}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 401) {
          logout();
          setError("Session expired. Please log in again.");
          return;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to fetch interviews");
        }

        const data: ApiResponse = await response.json();
        setInterviews(data.data.interviews || []);
        setCurrentPage(data.data.pagination.page);
        setTotalPages(data.data.pagination.pages);
      } catch (error) {
        console.error("Error fetching interviews:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load interviews"
        );
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, getCurrentToken]
  );

  const refreshInterviews = useCallback(async () => {
    await fetchInterviews(currentPage);
  }, [fetchInterviews, currentPage]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: InterviewContextType = {
    interviews,
    currentPage,
    totalPages,
    loading,
    error,
    statusFilter,

    // Actions
    fetchInterviews,
    setStatusFilter,
    setError,
    clearError,
    refreshInterviews,
  };

  return (
    <InterviewContext.Provider value={value}>
      {children}
    </InterviewContext.Provider>
  );
};

// Custom hook to use the context
export const useInterviews = (): InterviewContextType => {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error("useInterviews must be used within an InterviewProvider");
  }
  return context;
};

// Export types for use in components
export type { Interview, Pagination, ApiResponse };
