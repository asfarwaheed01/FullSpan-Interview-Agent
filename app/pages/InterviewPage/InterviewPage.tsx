"use client";
import InterviewRoom from "@/app/components/InterviewPage/InterviewRoom";
import {
  InterviewFormData,
  InterviewResponse,
} from "@/app/interfaces/interview";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, AlertTriangle, X } from "lucide-react";

// End Interview Confirmation Modal Component
const EndInterviewModal = ({
  isOpen,
  onClose,
  onConfirm,
  isEnding,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isEnding: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isEnding}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning icon */}
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>

        {/* Modal content */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            End Interview Session?
          </h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to end this interview? This action cannot be
            undone and you&apos;ll lose any unsaved progress.
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={onClose}
              disabled={isEnding}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isEnding}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isEnding ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Ending...
                </>
              ) : (
                "End Interview"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const InterviewPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [interviewData, setInterviewData] = useState<InterviewResponse | null>(
    null
  );
  const [formData, setFormData] = useState<InterviewFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showEndModal, setShowEndModal] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  useEffect(() => {
    // Extract data from URL parameters
    const room_name = searchParams.get("room_name");
    const access_token = searchParams.get("access_token");
    const wsUrl = searchParams.get("wsUrl");
    const interview_id = searchParams.get("interview_id");
    const interview_type = searchParams.get("interview_type");
    const duration = searchParams.get("duration");

    // Validate required parameters
    if (
      !room_name ||
      !access_token ||
      !wsUrl ||
      !interview_id ||
      !interview_type ||
      !duration
    ) {
      setError(
        "Missing required interview parameters. Please start a new interview."
      );
      setIsLoading(false);
      return;
    }

    try {
      const interviewResponse: InterviewResponse = {
        access_token: access_token,
        wsUrl: decodeURIComponent(wsUrl),
        room_name: room_name,
      };

      const interviewFormData: InterviewFormData = {
        interviewType: interview_type as "general" | "upcoming" | "upskill",
        duration: duration,
        interview_id: interview_id,
        room_name: room_name,
        candidate_name: "Interview Participant",
        candidate_details: "Candidate details from profile",
        job_description:
          interview_type === "upcoming"
            ? "Job description from interview setup"
            : `Practice interview for ${interview_type} role`,
        company_details:
          interview_type === "upcoming"
            ? "Company details from interview setup"
            : `${
                interview_type.charAt(0).toUpperCase() + interview_type.slice(1)
              } practice session`,
      };

      setInterviewData(interviewResponse);
      setFormData(interviewFormData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error parsing interview parameters:", error);
      setError("Invalid interview parameters. Please start a new interview.");
      setIsLoading(false);
    }
  }, [searchParams]);

  const handleEndInterview = () => {
    setShowEndModal(true);
  };

  const confirmEndInterview = async () => {
    setIsEnding(true);

    try {
      const token = localStorage.getItem("token");

      if (formData?.room_name) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/interviews/end`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ room_name: formData.room_name }),
          }
        );

        if (!response.ok) {
          console.error("Failed to end interview properly");
        }
      }
    } catch (error) {
      console.error("Error ending interview:", error);
    } finally {
      setIsEnding(false);
      setShowEndModal(false);
      router.push("/dashboard");
    }
  };

  const cancelEndInterview = () => {
    setShowEndModal(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2
            size={40}
            className="animate-spin text-blue-600 mx-auto mb-4"
          />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Setting up your interview...
          </h2>
          <p className="text-gray-600">
            Please wait while we prepare your session.
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Interview Setup Error
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Interview Room
  return (
    <>
      {interviewData && formData && (
        <InterviewRoom
          interviewData={interviewData}
          formData={formData}
          onEndInterview={handleEndInterview}
        />
      )}

      {/* End Interview Confirmation Modal */}
      <EndInterviewModal
        isOpen={showEndModal}
        onClose={cancelEndInterview}
        onConfirm={confirmEndInterview}
        isEnding={isEnding}
      />
    </>
  );
};

export default InterviewPage;
