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

// Types
interface Interview {
  _id: string;
  candidate_name: string;
  occupation_name: string;
  company_details: string;
  interview_type: string;
  duration: string;
  status: string;
  started_at: string;
  ended_at?: string;
  actual_duration?: number;
  createdAt: string;
}

interface Pagination {
  page: number;
  pages: number;
  total: number;
  limit: number;
}

interface ApiResponse {
  success: boolean;
  data: {
    interviews: Interview[];
    pagination: Pagination;
  };
}

interface InterviewContextType {
  // State
  interviews: Interview[];
  currentPage: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  statusFilter: string;

  // Actions
  fetchInterviews: (page?: number) => Promise<void>;
  setStatusFilter: (status: string) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  refreshInterviews: () => Promise<void>;
}

// Create context
const InterviewContext = createContext<InterviewContextType | undefined>(
  undefined
);

// Provider component
interface InterviewProviderProps {
  children: ReactNode;
}

export const InterviewProvider: React.FC<InterviewProviderProps> = ({
  children,
}) => {
  // State
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isClient, setIsClient] = useState<boolean>(false);

  // Set client-side flag after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get token dynamically on each request
  const getCurrentToken = useCallback(() => {
    if (!isClient) return null;
    return getToken();
  }, [isClient]);

  // Fetch interviews function
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

  // Refresh interviews (refetch current page)
  const refreshInterviews = useCallback(async () => {
    await fetchInterviews(currentPage);
  }, [fetchInterviews, currentPage]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Context value
  const value: InterviewContextType = {
    // State
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
