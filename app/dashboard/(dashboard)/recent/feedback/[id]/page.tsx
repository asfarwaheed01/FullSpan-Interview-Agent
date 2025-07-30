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
  Target,
  CheckCircle,
  XCircle,
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

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 6) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    if (score >= 4) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return "Excellent";
    if (score >= 6) return "Good";
    if (score >= 4) return "Average";
    return "Needs Improvement";
  };

  const calculateOverallScore = (feedbackData: FeedbackData) => {
    const allScores = [
      ...feedbackData.interview_focus_feedback.map((item) => item.score),
      ...feedbackData.soft_skills_feedback.map((item) => item.score),
    ];

    if (allScores.length === 0) return 0;

    const average =
      allScores.reduce((sum, score) => sum + score, 0) / allScores.length;
    return Math.round(average * 10); // Convert to 0-100 scale
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
            <div className="text-center py-12">
              <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Error Loading Feedback
              </h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={fetchFeedback}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
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

  if (!feedbackData) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Feedback Available
              </h3>
              <p className="text-gray-600 mb-4">
                Feedback for this interview is not available yet.
              </p>
              <button
                onClick={handleGoBack}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { interviewId: interview, feedbackData: feedback } = feedbackData;
  const overallScore = calculateOverallScore(feedback);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with Back Button */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={handleGoBack}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Interviews</span>
            </button>
          </div>

          <div className="border-t pt-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Interview Feedback
            </h1>
            <p className="text-gray-600">
              Detailed analysis and recommendations for your interview
              performance
            </p>
          </div>
        </div>

        {/* Interview Details */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Interview Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Building className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Position</p>
                <p className="font-medium text-gray-900">
                  {interview.occupation_name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Building className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Company</p>
                <p className="font-medium text-gray-900">
                  {interview.company_details}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Candidate</p>
                <p className="font-medium text-gray-900">
                  {interview.candidate_name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-medium text-gray-900">
                  {interview.duration} minutes
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Interview Date</p>
                <p className="font-medium text-gray-900">
                  {formatDate(interview.started_at)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Type</p>
                <p className="font-medium text-gray-900 capitalize">
                  {interview.interview_type}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Score */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Overall Performance
          </h2>
          <div className="flex items-center gap-4">
            <div
              className={`px-4 py-2 rounded-lg border ${getScoreColor(
                overallScore / 10
              )}`}
            >
              <span className="text-2xl font-bold">{overallScore}/100</span>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">
                {getScoreLabel(overallScore / 10)}
              </p>
              <p className="text-gray-600">Overall Interview Score</p>
            </div>
          </div>
        </div>

        {/* Overall Summary */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Interview Summary
          </h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed">
              {feedback.overall_summary}
            </p>
          </div>
        </div>

        {/* Skills Assessment */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Interview Focus Feedback */}
          {feedback.interview_focus_feedback &&
            feedback.interview_focus_feedback.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Technical Assessment
                </h2>
                <div className="space-y-4">
                  {feedback.interview_focus_feedback.map((item, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900 capitalize">
                          {item.focus.replace(/_/g, " ")}
                        </h3>
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-medium border ${getScoreColor(
                            item.score
                          )}`}
                        >
                          {item.score}/10
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{item.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Soft Skills Feedback */}
          {feedback.soft_skills_feedback &&
            feedback.soft_skills_feedback.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Soft Skills Assessment
                </h2>
                <div className="space-y-4">
                  {feedback.soft_skills_feedback.map((item, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900">
                          {item.focus}
                        </h3>
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-medium border ${getScoreColor(
                            item.score
                          )}`}
                        >
                          {item.score}/10
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{item.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>

        {/* Strengths */}
        {feedback.key_strengths && feedback.key_strengths.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Key Strengths
            </h2>
            <div className="space-y-3">
              {feedback.key_strengths.map((strength, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">{strength}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weaknesses */}
        {feedback.overall_weaknesses &&
          feedback.overall_weaknesses.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Areas for Improvement
              </h2>
              <div className="space-y-3">
                {feedback.overall_weaknesses.map((weakness, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700">{weakness}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Key Areas for Development */}
        {feedback.key_areas_for_development &&
          feedback.key_areas_for_development.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Development Areas
              </h2>
              <div className="space-y-6">
                {feedback.key_areas_for_development.map((area, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {area.area}
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-gray-600 mb-1">
                          Observation:
                        </h4>
                        <p className="text-gray-700 text-sm">
                          {area.observation}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-600 mb-1">
                          Actionable Advice:
                        </h4>
                        <p className="text-gray-700 text-sm">
                          {area.actionable_advice}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Resume Alignment */}
        {feedback.resume_alignment && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Resume Alignment
            </h2>
            <div className="space-y-4">
              {feedback.resume_alignment.points_of_alignment &&
                feedback.resume_alignment.points_of_alignment.length > 0 && (
                  <div>
                    <h3 className="font-medium text-green-700 mb-2">
                      Points of Alignment
                    </h3>
                    <ul className="space-y-1">
                      {feedback.resume_alignment.points_of_alignment.map(
                        (point, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 text-sm">
                              {point}
                            </span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

              {feedback.resume_alignment.points_of_contradiction &&
                feedback.resume_alignment.points_of_contradiction.length >
                  0 && (
                  <div>
                    <h3 className="font-medium text-red-700 mb-2">
                      Points of Contradiction
                    </h3>
                    <ul className="space-y-1">
                      {feedback.resume_alignment.points_of_contradiction.map(
                        (point, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 text-sm">
                              {point}
                            </span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

              {feedback.resume_alignment.recommendation && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">
                    Recommendation
                  </h3>
                  <p className="text-blue-800 text-sm">
                    {feedback.resume_alignment.recommendation}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actionable Feedback */}
        {feedback.actionable_feedback && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Action Plan
            </h2>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-green-800 leading-relaxed">
                  {feedback.actionable_feedback}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackPage;
