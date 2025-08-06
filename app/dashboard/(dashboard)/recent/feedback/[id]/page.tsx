"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  FileText,
  Clock,
  Calendar,
  User,
  Building,
  CheckCircle,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { getToken } from "@/app/utils/constants";

interface InterviewFocusFeedback {
  focus: string;
  score: number;
  comment: string;
}

interface SoftSkillsFeedback {
  focus: string;
  score: number;
  comment: string;
}

interface KeyAreaForDevelopment {
  area: string;
  observation: string;
  actionable_advice: string;
}

interface ResumeAlignment {
  points_of_alignment: string[];
  points_of_contradiction: string[];
  recommendation: string;
}

interface FeedbackData {
  overall_summary: string;
  key_strengths: string[];
  overall_weaknesses: string[];
  interview_focus_feedback: InterviewFocusFeedback[];
  soft_skills_feedback: SoftSkillsFeedback[];
  key_areas_for_development: KeyAreaForDevelopment[];
  resume_alignment: ResumeAlignment;
  actionable_feedback: string;
}

interface Interview {
  _id: string;
  candidate_name: string;
  interview_type: string;
  duration: string;
  company_details: string;
  occupation_name: string;
  started_at: string;
}

interface FeedbackResponse {
  _id: string;
  interviewId: Interview;
  userId: string;
  feedbackData: FeedbackData;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    feedback: FeedbackResponse;
  };
  message?: string;
}

const FeedbackPage = () => {
  const params = useParams();
  const router = useRouter();
  const token = getToken();
  const interviewId = params.id as string;

  const [feedbackData, setFeedbackData] = useState<FeedbackResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/feedback/${interviewId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch feedback: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      if (data.success) {
        setFeedbackData(data.data.feedback);
      } else {
        throw new Error(data.message || "Failed to load feedback");
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load feedback"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (interviewId && token) {
      fetchFeedback();
    }
  }, [interviewId, token]);

  const handleGoBack = () => {
    router.push("/dashboard/recent");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateOverallScore = (feedbackData: FeedbackData) => {
    const allScores = [
      ...feedbackData.interview_focus_feedback.map((item) => item.score),
      ...feedbackData.soft_skills_feedback.map((item) => item.score),
    ];

    if (allScores.length === 0) return 0;

    const average =
      allScores.reduce((sum, score) => sum + score, 0) / allScores.length;
    return Math.round(average * 10);
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "bg-green-500";
    if (score >= 50) return "bg-yellow-500";
    if (score >= 25) return "bg-orange-500";
    return "bg-red-500";
  };

  const CircularProgress = ({
    percentage,
    size = 120,
  }: {
    percentage: number;
    size?: number;
  }) => {
    const radius = (size - 20) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#f3f4f6"
            strokeWidth="10"
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={
              percentage >= 75
                ? "#10b981"
                : percentage >= 50
                ? "#f59e0b"
                : "#ef4444"
            }
            strokeWidth="10"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-in-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">
            {percentage}%
          </span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
            <div className="flex items-center justify-center py-12">
              <Loader2 size={40} className="animate-spin text-blue-600" />
              <span className="ml-3 text-lg text-gray-600">
                Loading feedback...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !feedbackData) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
            <div className="text-center py-12">
              <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {error ? "Error Loading Feedback" : "No Feedback Available"}
              </h3>
              <p className="text-gray-600 mb-4">
                {error || "Feedback for this interview is not available yet."}
              </p>
              <div className="flex gap-3 justify-center">
                {error && (
                  <button
                    onClick={fetchFeedback}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Try Again
                  </button>
                )}
                <button
                  onClick={handleGoBack}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { interviewId: interview, feedbackData: feedback } = feedbackData;
  const overallScore = calculateOverallScore(feedback);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back to Interviews</span>
          </button>

          <div className="border-t pt-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Interview Feedback
            </h1>
            <p className="text-gray-500">
              Detailed analysis and recommendations for your interview
              performance
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Interview Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Interview Details Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Interview Details
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Position</p>
                    <p className="font-medium text-gray-900">
                      {interview.occupation_name}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Company</p>
                    <p className="font-medium text-gray-900">
                      {interview.company_details}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Interview Date</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(interview.started_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-medium text-gray-900">
                      {interview.duration} minutes
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="font-medium text-gray-900 capitalize">
                      {interview.interview_type}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Overall Performance Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Overall Performance
              </h2>
              <div className="flex flex-col items-center">
                <CircularProgress percentage={overallScore} />
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    Needs Improvement
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Overall Interview Score
                  </p>
                </div>

                {/* Score Scale */}
                <div className="w-full mt-6">
                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span>Poor (0-25)</span>
                    <span>You are here</span>
                    <span>Excellent (75-100)</span>
                  </div>
                  <div className="relative h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full">
                    <div
                      className="absolute top-0 h-2 w-2 bg-white border-2 border-red-600 rounded-full transform -translate-y-0"
                      style={{
                        left: `${overallScore}%`,
                        transform: "translateX(-50%)",
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills Performance Breakdown */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Skills Performance Breakdown
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Technical</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-red-500 h-4 rounded-full"
                        style={{ width: "22%" }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">22</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Communication</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-red-500 h-4 rounded-full"
                        style={{ width: "63%" }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">63</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Confidence</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-orange-500 h-4 rounded-full"
                        style={{ width: "45%" }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">45</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Teamwork</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-red-500 h-4 rounded-full"
                        style={{ width: "15%" }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">15</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Feedback Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Interview Summary */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Interview Summary
                </h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {feedback.overall_summary}
              </p>

              {/* Performance Percentages */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-500">3%</div>
                  <div className="text-sm text-gray-600">
                    Technical Knowledge
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-500">15%</div>
                  <div className="text-sm text-gray-600">Soft Skills</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-500">45%</div>
                  <div className="text-sm text-gray-600">Communication</div>
                </div>
              </div>
            </div>

            {/* Technical and Soft Skills Assessment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Technical Assessment */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Technical Assessment
                  </h2>
                </div>
                <div className="flex items-center justify-center mb-4">
                  <CircularProgress percentage={63} size={100} />
                </div>
                <div className="text-center mb-4">
                  <div className="text-sm text-orange-600 font-medium">
                    Below Average
                  </div>
                </div>

                {feedback.interview_focus_feedback &&
                  feedback.interview_focus_feedback.length > 0 && (
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-900 text-white rounded">
                        <h4 className="font-medium text-sm">
                          Strengths-based Interview
                        </h4>
                        <p className="text-xs mt-1">
                          {feedback.interview_focus_feedback[0]?.comment}
                        </p>
                      </div>
                      {feedback.interview_focus_feedback.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm text-gray-600">
                            {item.focus.replace(/_/g, " ")}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                style={{ width: `${item.score * 10}%` }}
                                className={`${getScoreColor(
                                  item.score * 10
                                )}  h-2 rounded-full bg-orange-500`}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">
                              {item.score * 10}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </div>

              {/* Soft Skills Assessment */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Soft Skills Assessment
                  </h2>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <CircularProgress percentage={22} size={80} />
                    <div className="text-sm text-gray-600 mt-2">
                      Communication
                    </div>
                  </div>
                  <div className="text-center">
                    <CircularProgress percentage={45} size={80} />
                    <div className="text-sm text-gray-600 mt-2">Confidence</div>
                  </div>
                </div>

                {feedback.soft_skills_feedback &&
                  feedback.soft_skills_feedback.length > 0 && (
                    <div className="space-y-3">
                      {feedback.soft_skills_feedback.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm text-gray-600">
                            {item.focus}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-red-500">
                              {item.score * 10}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </div>

            {/* Performance vs Benchmarks */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Performance vs Target Benchmarks
                </h2>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {[
                  "Technical Skills",
                  "Soft Skills",
                  "Communication",
                  "Problem Solving",
                ].map((skill, index) => {
                  const scores = [35, 28, 25, 30];
                  return (
                    <div key={skill} className="text-center">
                      <div className="mb-2">
                        <div className="w-full bg-gray-200 rounded h-32 relative">
                          <div
                            className="bg-red-500 rounded absolute bottom-0 w-full transition-all duration-1000"
                            style={{ height: `${scores[index]}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">{skill}</div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-center gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Current Performance</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-300 rounded"></div>
                  <span>Industry Benchmark</span>
                </div>
              </div>
            </div>

            {/* Key Strengths and Areas for Improvement */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Key Strengths */}
              {feedback.key_strengths && feedback.key_strengths.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Key Strengths
                  </h2>
                  <div className="space-y-3">
                    {feedback.key_strengths.map((strength, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-700 text-sm">{strength}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Areas for Improvement */}
              {feedback.overall_weaknesses &&
                feedback.overall_weaknesses.length > 0 && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Areas for Improvement
                    </h2>
                    <div className="space-y-3">
                      {feedback.overall_weaknesses.map((weakness, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                          <p className="text-gray-700 text-sm">{weakness}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Development Areas */}
        {feedback.key_areas_for_development &&
          feedback.key_areas_for_development.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Development Areas
              </h2>
              <div className="space-y-4">
                {feedback.key_areas_for_development.map((area, index) => (
                  <div
                    key={index}
                    className="p-4 bg-blue-50 rounded-lg border border-blue-200"
                  >
                    <h3 className="font-semibold text-blue-900 mb-3">
                      {area.area}
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium text-blue-800">
                          Observation:{" "}
                        </span>
                        <span className="text-blue-700">
                          {area.observation}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">
                          Actionable Advice:{" "}
                        </span>
                        <span className="text-blue-700">
                          {area.actionable_advice}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Action Plan */}
        {feedback.actionable_feedback && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Action Plan
            </h2>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-green-800 font-medium mb-2">
                    You have a direct and polite communication style, which is a
                    good foundation.
                  </p>
                  <p className="text-green-700">
                    {feedback.actionable_feedback}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackPage;
