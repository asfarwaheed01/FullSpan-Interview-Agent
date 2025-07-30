"use client";

import {
  Calendar,
  Clock,
  Star,
  ArrowRight,
  Search,
  Loader2,
  AlertCircle,
  FileText,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/app/utils/constants";
import {
  ApiResponse,
  Interview,
  InterviewStats,
  StatsResponse,
} from "@/app/interfaces/interview";
import FeedbackTimer from "@/app/components/InterviewPage/FeedbackTimer";
import ConfirmationModal from "@/app/components/ConfirmationModal/ConfirmationModal";
import { toast } from "react-toastify";

export default function RecentInterviewsPage() {
  const router = useRouter();
  const token = getToken();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [stats, setStats] = useState<InterviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("30");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [timerCompletedInterviews, setTimerCompletedInterviews] = useState<
    Set<string>
  >(new Set());
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [interviewToDelete, setInterviewToDelete] = useState<Interview | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);

  const fetchInterviews = async (page = 1) => {
    try {
      setLoading(true);
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
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch interviews");
      }

      const data: ApiResponse = await response.json();
      setInterviews(data.data.interviews);
      setCurrentPage(data.data.pagination.page);
      setTotalPages(data.data.pagination.pages);
    } catch (error) {
      console.error("Error fetching interviews:", error);
      setError("Failed to load interviews");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/interviews/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }

      const data: StatsResponse = await response.json();
      setStats(data.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Function to check if feedback is available (2 minutes after interview ended)
  const isFeedbackAvailable = (interview: Interview): boolean => {
    if (interview.status.toLowerCase() !== "completed" || !interview.ended_at) {
      return false;
    }

    // Check if timer was manually completed
    if (timerCompletedInterviews.has(interview._id)) {
      return true;
    }

    const endTime = new Date(interview.ended_at).getTime();
    const currentTime = new Date().getTime();
    const twoMinutesInMs = 2 * 60 * 1000; // 2 minutes

    return currentTime - endTime >= twoMinutesInMs;
  };

  // Function to handle timer completion
  const handleTimerComplete = (interviewId: string) => {
    setTimerCompletedInterviews((prev) => new Set([...prev, interviewId]));
  };

  // Function to navigate to feedback page
  const handleViewFeedback = (interviewId: string) => {
    router.push(`/dashboard/recent/feedback/${interviewId}`);
  };

  // Function to handle delete confirmation
  const handleDeleteClick = (interview: Interview, e: React.MouseEvent) => {
    e.stopPropagation();
    setInterviewToDelete(interview);
    setDeleteModalOpen(true);
  };

  // Function to delete interview
  const handleDeleteInterview = async () => {
    if (!interviewToDelete) return;

    try {
      setDeleting(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/interviews/${interviewToDelete._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete interview");
      }

      // Remove the interview from the list
      setInterviews((prev) =>
        prev.filter((interview) => interview._id !== interviewToDelete._id)
      );

      // Refresh stats to reflect the deletion
      fetchStats();

      // Reset state
      setInterviewToDelete(null);
      toast.success(
        `Interview for "${interviewToDelete.occupation_name}" at "${interviewToDelete.company_details}" deleted successfully!`
      );
    } catch (error) {
      console.error("Error deleting interview:", error);
      alert("Failed to delete interview. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchInterviews();
      fetchStats();
    }
  }, [token, statusFilter]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "text-green-700 bg-green-50 border-green-200";
      case "in_progress":
        return "text-blue-700 bg-blue-50 border-blue-200";
      case "cancelled":
        return "text-red-700 bg-red-50 border-red-200";
      case "failed":
        return "text-red-700 bg-red-50 border-red-200";
      default:
        return "text-gray-700 bg-gray-50 border-gray-200";
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "Completed";
      case "in_progress":
        return "In Progress";
      case "cancelled":
        return "Cancelled";
      case "failed":
        return "Failed";
      case "scheduled":
        return "Scheduled";
      default:
        return status;
    }
  };

  const filteredInterviews = interviews.filter((interview) => {
    const matchesSearch =
      interview.occupation_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      interview.company_details
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      interview.candidate_name.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
          <div className="flex items-center justify-center py-12">
            <Loader2 size={40} className="animate-spin text-blue-600" />
            <span className="ml-3 text-lg text-gray-600">
              Loading interviews...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
          <div className="text-center py-12">
            <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error Loading Interviews
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => fetchInterviews()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Recent Interviews
            </h1>
            <p className="text-gray-600">
              Track your progress and review past performances
            </p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search interviews by role, company, or candidate..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="in_progress">In Progress</option>
            <option value="cancelled">Cancelled</option>
            <option value="failed">Failed</option>
          </select>
          <select
            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Total Interviews
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totalInterviews || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Completed
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.completedInterviews || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Avg Duration
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(stats?.averageDuration || 0)} min
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Success Rate
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totalInterviews
                  ? Math.round(
                      (stats.completedInterviews / stats.totalInterviews) * 100
                    )
                  : 0}
                %
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <ArrowRight className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Interviews List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Interview History ({filteredInterviews.length})
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredInterviews.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No interviews found
              </h3>
              <p className="text-gray-600">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Start your first interview to see it here"}
              </p>
            </div>
          ) : (
            filteredInterviews.map((interview) => (
              <div
                key={interview._id}
                className="p-6 hover:bg-gray-50 transition-colors cursor-pointer group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 space-y-2 sm:space-y-0">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-base mb-1">
                          {interview.occupation_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {interview.company_details}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            interview.status
                          )}`}
                        >
                          {getStatusDisplay(interview.status)}
                        </span>

                        {/* Feedback Button or Timer - Only show for completed interviews */}
                        {interview.status.toLowerCase() === "completed" && (
                          <>
                            {isFeedbackAvailable(interview) ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewFeedback(interview._id);
                                }}
                                className="flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                              >
                                <FileText className="w-3 h-3 mr-1" />
                                View Feedback
                              </button>
                            ) : (
                              interview.ended_at && (
                                <FeedbackTimer
                                  endedAt={interview.ended_at}
                                  onTimerComplete={() =>
                                    handleTimerComplete(interview._id)
                                  }
                                />
                              )
                            )}
                          </>
                        )}

                        {/* Delete Button */}
                        <button
                          onClick={(e) => handleDeleteClick(interview, e)}
                          className="flex items-center px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors group/delete"
                          title="Delete Interview"
                        >
                          <Trash2 className="w-3 h-3 mr-1 group-hover/delete:scale-110 transition-transform" />
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{formatDate(interview.createdAt)}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>
                          {interview.actual_duration || interview.duration} min
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="capitalize">
                          {interview.interview_type} interview
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
              <p className="text-sm text-gray-700">
                Showing page <span className="font-medium">{currentPage}</span>{" "}
                of <span className="font-medium">{totalPages}</span>
              </p>
              <div className="flex items-center space-x-2">
                <button
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  disabled={currentPage === 1}
                  onClick={() => fetchInterviews(currentPage - 1)}
                >
                  Previous
                </button>

                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        currentPage === page
                          ? "text-white bg-blue-600 border border-transparent"
                          : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                      }`}
                      onClick={() => fetchInterviews(page)}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  disabled={currentPage === totalPages}
                  onClick={() => fetchInterviews(currentPage + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setInterviewToDelete(null);
        }}
        onConfirm={handleDeleteInterview}
        title="Delete Interview"
        message={
          interviewToDelete
            ? `Are you sure you want to delete the interview for "${interviewToDelete.occupation_name}" at "${interviewToDelete.company_details}"? This action cannot be undone.`
            : ""
        }
        confirmText={deleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        isDestructive={true}
      />
    </div>
  );
}
