"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, Star, ArrowRight, TrendingUp } from "lucide-react";
import StartInterviewModal from "../components/startInterviewModal/StartInterviewModal";
import Image from "next/image";
import { useInterviews } from "../contexts/InterviewContext";
import { getToken } from "../utils/constants";

export default function DashboardPage() {
  const token = getToken();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const { interviews, loading, error, fetchInterviews } = useInterviews();

  // Fetch interviews on component mount
  useEffect(() => {
    if (!token) {
      return;
    }
    fetchInterviews(1);
  }, [token]);

  // Get recent interviews (first 3)
  const recentInterviews = interviews.slice(0, 3);

  const interviewTips = [
    "Practice the STAR method (Situation, Task, Action, Result) for behavioral questions",
    "Click below to start your first mock session with our AI Interviewer.",
    "Click below to start your first mock session with our AI Interviewer.",
  ];

  // Function to get status color based on score or status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "text-green-600 bg-green-50 border-green-200";
      case "in_progress":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Function to handle view all interviews
  const handleViewAllInterviews = () => {
    router.push("/dashboard/recent");
  };

  return (
    <>
      <div className="space-y-6 sm:space-y-8">
        {/* Interview Tips Card */}
        <div
          className="rounded-xl p-6 sm:p-8 text-white relative overflow-hidden"
          style={{
            backgroundColor: "#1B1B3B",
            fontFamily: "Plus Jakarta Sans, sans-serif",
          }}
        >
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4 sm:mb-6">
              <div className="flex-1">
                <div className="flex items-center mb-4 sm:mb-6">
                  <h2 className="text-[36px] sm:text-2xl font-bold">
                    Today&apos;s Interview Tips 💡
                  </h2>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {interviewTips.map((tip, index) => (
                    <div key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 mr-3 sm:mr-4 flex-shrink-0"></div>
                      <p className="text-sm sm:text-base leading-relaxed">
                        {tip}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bulb Image */}
              <div className="hidden sm:block ml-8">
                <Image
                  src="/assets/bulb.png"
                  alt="Light bulb"
                  width={180}
                  height={180}
                  className="opacity-90"
                />
              </div>
            </div>
          </div>

          <div className="absolute top-4 right-4 sm:hidden">
            <Image
              src="/assets/bulb.png"
              alt="Light bulb"
              width={50}
              height={50}
              className="opacity-70"
            />
          </div>
        </div>

        {/* Main Interview Card */}
        <div className="bg-white rounded-xl p-6 sm:p-8 lg:p-12 shadow-sm border border-gray-200 relative overflow-hidden">
          <div className="relative z-10 text-center">
            <div className="flex justify-center">
              <Image
                src="/assets/avatar.png"
                alt="Light bulb"
                width={80}
                height={80}
                className="object-cover  mb-4 sm:mb-6"
              />
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              Ready for Your Next Mock Interview?
            </h2>

            <p className="text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              Practice with our AI interviewer tailored to your target job and
              company. Get real-time feedback and improve your interview skills
              with personalized insights.
            </p>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold transition-all duration-200 inline-flex items-center text-sm sm:text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Start New Interview
              <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Recent Interviews */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
              Recent Interviews
            </h3>
            <p className="text-sm text-gray-500">
              Track your progress and review past performances
            </p>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading interviews...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
              <button
                onClick={() => fetchInterviews(1)}
                className="mt-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Try Again
              </button>
            </div>
          ) : recentInterviews.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No interviews found. Start your first interview!
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {recentInterviews.map((interview) => (
                <div
                  key={interview._id}
                  className="border border-gray-200 rounded-lg p-4 sm:p-5 hover:shadow-md transition-all duration-200 hover:border-gray-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 sm:mb-3 space-y-2 sm:space-y-0">
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                          {interview.occupation_name}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                              interview.status
                            )}`}
                          >
                            {interview.status}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-gray-600 mb-3">
                        {interview.candidate_name} at{" "}
                        {interview.company_details}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                          <span className="whitespace-nowrap">
                            {formatDate(interview.started_at)}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                          <span className="whitespace-nowrap">
                            {interview.actual_duration
                              ? `${interview.actual_duration} min`
                              : interview.duration}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                          <span className="whitespace-nowrap">
                            {interview.interview_type}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* View All Button */}
          <div className="mt-4 sm:mt-6 text-center">
            <button
              onClick={handleViewAllInterviews}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
            >
              View All Interviews →
            </button>
          </div>
        </div>

        {/* Quick Actions - Mobile Optimized */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 border border-blue-100">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                Practice Sessions
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mb-4">
              Start quick 10-minute practice sessions for specific skills
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
            >
              Start Practice →
            </button>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 sm:p-6 border border-green-100">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                View Progress
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mb-4">
              Track your improvement over time with detailed analytics
            </p>
            <button className="text-green-600 hover:text-green-700 font-medium text-sm transition-colors">
              View Analytics →
            </button>
          </div>
        </div>
      </div>

      {/* Start Interview Modal */}
      {isModalOpen && (
        <StartInterviewModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
