// components/dashboard/StartInterviewModal.tsx
"use client";

import { useState } from "react";
import {
  X,
  User,
  Calendar,
  Upload,
  FileText,
  MapPin,
  Zap,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getToken } from "@/app/utils/constants";

interface StartInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface InterviewResponse {
  success: boolean;
  message: string;
  data: {
    interview: {
      id: string;
      access_token: string;
      wsUrl: string;
      room_name: string;
      status: string;
      started_at: string;
      candidate_name: string;
      interview_type: string;
      duration: string;
    };
  };
}

export default function StartInterviewModal({
  isOpen,
  onClose,
}: StartInterviewModalProps) {
  const [selectedType, setSelectedType] = useState<
    "general" | "upcoming" | "upskill"
  >("general");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | React.ReactNode | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [useExistingResume, setUseExistingResume] = useState(false);

  const token = getToken();
  const router = useRouter();

  // Form data for General Role Practice and Upskill Interview
  const [generalFormData, setGeneralFormData] = useState({
    occupationName: "",
    language: "English",
    interviewFocus: "One interview focus (Default)",
    duration: "15",
    additionalFocusAreas: "",
  });

  // Form data for Upcoming Job Interview
  const [upcomingFormData, setUpcomingFormData] = useState({
    jobDescription: "",
    companyDetails: "",
    language: "English",
    interviewFocus: "For all interview",
    duration: "15",
    jobLocation: "Calgary, 7th Road",
  });

  const handleResumeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(file.type)) {
        setError("Please upload a PDF or Word document");
        return;
      }

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }

      setResumeFile(file);
      setUseExistingResume(false);
      setError(null);
    }
  };

  const handleUseExistingResume = () => {
    setUseExistingResume(true);
    setResumeFile(null);
  };

  const mapInterviewFocusToAPI = (displayValue: string): string => {
    const focusMapping: { [key: string]: string } = {
      "Technical Questions": "technical_skills_interview",
      "Behavioral Questions": "behavioral_interview",
      "Case Studies": "case_based_interview",
      "Competency Based": "competency_based_interview",
      "Situational Interview": "situational_interview",
      "Motivational Interview": "motivational_interview",
      "Strengths Based": "strengths_based_interview",
      "Values Based": "values_based_interview",
      "Stress Interview": "stress_interview",
      "One interview focus (Default)": "technical_skills_interview", // Default for general
      "For all interview": "behavioral_interview", // Default for upcoming
    };

    return focusMapping[displayValue] || "technical_skills_interview";
  };

  const mapInterviewTypeToAPI = (type: string): string => {
    switch (type) {
      case "general":
        return "general";
      case "upcoming":
        return "technical";
      case "upskill":
        return "behavioral";
      default:
        return "general";
    }
  };

  const mapExperienceLevel = (occupation: string) => {
    console.log(occupation);
    return "mid";
  };

  const mapInterviewStage = (type: string): string => {
    switch (type) {
      case "general":
        return "Practice Round";
      case "upcoming":
        return "Job Interview";
      case "upskill":
        return "Skill Assessment";
      default:
        return "Practice Round";
    }
  };

  const prepareAPIPayload = () => {
    const basePayload = {
      interview_type: mapInterviewTypeToAPI(selectedType),
      language:
        selectedType === "upcoming"
          ? upcomingFormData.language
          : generalFormData.language,
      duration:
        selectedType === "upcoming"
          ? upcomingFormData.duration
          : generalFormData.duration,
      interview_stage: mapInterviewStage(selectedType),
      experience_level: mapExperienceLevel(
        selectedType === "upcoming"
          ? "Job Applicant"
          : generalFormData.occupationName
      ),
    };

    if (selectedType === "upcoming") {
      return {
        ...basePayload,
        interview_focus: mapInterviewFocusToAPI(
          upcomingFormData.interviewFocus
        ),
        job_description: upcomingFormData.jobDescription,
        company_details:
          upcomingFormData.companyDetails || "Company details not provided",
        occupation_name: "Job Applicant",
      };
    } else {
      return {
        ...basePayload,
        interview_focus: mapInterviewFocusToAPI(generalFormData.interviewFocus),
        job_description: `Practice interview for ${
          generalFormData.occupationName
        } position. ${
          generalFormData.additionalFocusAreas
            ? `Focus areas: ${generalFormData.additionalFocusAreas}`
            : ""
        }`,
        company_details:
          selectedType === "upskill"
            ? "Upskill interview practice session"
            : "General role practice session",
        occupation_name: generalFormData.occupationName,
      };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate required fields
      if (selectedType === "upcoming") {
        if (!upcomingFormData.jobDescription.trim()) {
          throw new Error("Job description is required");
        }
      } else {
        if (!generalFormData.occupationName) {
          throw new Error("Occupation name is required");
        }
      }

      const payload = prepareAPIPayload();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/interviews/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data: InterviewResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to start interview");
      }

      if (data.success) {
        const searchParams = new URLSearchParams({
          room_name: data.data.interview.room_name,
          access_token: data.data.interview.access_token,
          wsUrl: data.data.interview.wsUrl,
          interview_id: data.data.interview.id,
          interview_type: selectedType,
          duration: data.data.interview.duration,
        });

        router.push(`/interview?${searchParams.toString()}`);
        onClose();
      }
    } catch (error) {
      console.error("Error starting interview:", error);

      // Check if it's a payment error
      const errorMessage =
        error instanceof Error ? error.message : "Failed to start interview";

      if (
        errorMessage.includes("payment method") ||
        errorMessage.includes("Payment method")
      ) {
        // Payment error - show error with payment link
        setError(
          <div className="flex items-center justify-between">
            <p className="mb-2">{errorMessage}</p>
            <button
              onClick={() => {
                onClose();
                router.push("/dashboard/payments");
              }}
              className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium"
            >
              Add Payment Method →
            </button>
          </div>
        );
      } else {
        // Regular error
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500/20 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Start Mock Interview
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Choose your interview type and set up your session
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Choose Interview Type */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Choose Interview Type
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* General Role Practice */}
              <div
                className={`
                  border-2 rounded-lg p-4 cursor-pointer transition-all
                  ${
                    selectedType === "general"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }
                  ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
                `}
                onClick={() => !isLoading && setSelectedType("general")}
              >
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <User size={16} className="text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">
                      General Role Practice
                    </h4>
                    <p className="text-xs text-gray-600">
                      Practice for a specific role
                    </p>
                  </div>
                  <div
                    className={`
                    w-4 h-4 rounded-full border-2 flex items-center justify-center
                    ${
                      selectedType === "general"
                        ? "border-blue-500"
                        : "border-gray-300"
                    }
                  `}
                  >
                    {selectedType === "general" && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </div>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Role-specific question</li>
                  <li>• Customizable by occupation</li>
                  <li>• General interview preparation</li>
                </ul>
              </div>

              {/* Upcoming Job Interview */}
              <div
                className={`
                  border-2 rounded-lg p-4 cursor-pointer transition-all
                  ${
                    selectedType === "upcoming"
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }
                  ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
                `}
                onClick={() => !isLoading && setSelectedType("upcoming")}
              >
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <Calendar size={16} className="text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">
                      Upcoming Job Interview
                    </h4>
                    <p className="text-xs text-gray-600">
                      Prepare for a specific job application
                    </p>
                  </div>
                  <div
                    className={`
                    w-4 h-4 rounded-full border-2 flex items-center justify-center
                    ${
                      selectedType === "upcoming"
                        ? "border-green-500"
                        : "border-gray-300"
                    }
                  `}
                  >
                    {selectedType === "upcoming" && (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                </div>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Role-specific question</li>
                  <li>• Customizable by occupation</li>
                  <li>• General interview preparation</li>
                </ul>
              </div>

              {/* Upskill Interview */}
              <div
                className={`
                  border-2 rounded-lg p-4 cursor-pointer transition-all
                  ${
                    selectedType === "upskill"
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300"
                  }
                  ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
                `}
                onClick={() => !isLoading && setSelectedType("upskill")}
              >
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center mr-3">
                    <Zap size={16} className="text-pink-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">
                      Upskill Interview
                    </h4>
                    <p className="text-xs text-gray-600">
                      Prepare for a upcoming jobs
                    </p>
                  </div>
                  <div
                    className={`
                    w-4 h-4 rounded-full border-2 flex items-center justify-center
                    ${
                      selectedType === "upskill"
                        ? "border-purple-500"
                        : "border-gray-300"
                    }
                  `}
                  >
                    {selectedType === "upskill" && (
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    )}
                  </div>
                </div>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Role-Focused Questions</li>
                  <li>• Occupation-Based Customization</li>
                  <li>• Complete Interview Readiness</li>
                </ul>
              </div>
            </div>
          </div>

          {/* General Role Setup (for General and Upskill) */}
          {(selectedType === "general" || selectedType === "upskill") && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {selectedType === "general"
                  ? "General Role Setup"
                  : "Upskill Interview Setup"}
              </h3>

              {/* Occupation Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Occupation Name <span className="text-red-500">*</span>
                </label>
                <select
                  value={generalFormData.occupationName}
                  onChange={(e) =>
                    setGeneralFormData({
                      ...generalFormData,
                      occupationName: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                  required
                >
                  <option value="">Select occupation</option>
                  <option value="Software Developer">Software Developer</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="Product Manager">Product Manager</option>
                  <option value="Marketing Manager">Marketing Manager</option>
                  <option value="Business Analyst">Business Analyst</option>
                  <option value="UX/UI Designer">UX/UI Designer</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                  <option value="Sales Manager">Sales Manager</option>
                </select>
              </div>

              {/* Resume Details */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resume Details
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`
                    flex items-center justify-center p-3 border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer disabled:opacity-50
                    ${resumeFile ? "ring-2 ring-blue-500" : ""}
                  `}
                  >
                    <Upload size={16} className="mr-2 text-blue-600" />
                    <span className="text-sm text-blue-700">
                      {resumeFile
                        ? resumeFile.name.substring(0, 15) + "..."
                        : "Upload Resume"}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeUpload}
                      className="hidden"
                      disabled={isLoading}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleUseExistingResume}
                    className={`
                      flex items-center justify-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50
                      ${
                        useExistingResume
                          ? "ring-2 ring-green-500 bg-green-50"
                          : ""
                      }
                    `}
                    disabled={isLoading}
                  >
                    <FileText
                      size={16}
                      className={`mr-2 ${
                        useExistingResume ? "text-green-600" : "text-gray-500"
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        useExistingResume ? "text-green-700" : "text-gray-600"
                      }`}
                    >
                      Existing Resume
                    </span>
                  </button>
                </div>
                {resumeFile && (
                  <p className="text-xs text-green-600 mt-2">
                    ✓ {resumeFile.name} selected
                  </p>
                )}
                {useExistingResume && (
                  <p className="text-xs text-green-600 mt-2">
                    ✓ Using existing resume from profile
                  </p>
                )}
              </div>

              {/* Additional Focus Areas (Optional) */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Focus Areas{" "}
                  <span className="text-gray-500">(Optional)</span>
                </label>
                <textarea
                  value={generalFormData.additionalFocusAreas}
                  onChange={(e) =>
                    setGeneralFormData({
                      ...generalFormData,
                      additionalFocusAreas: e.target.value,
                    })
                  }
                  placeholder="Any specific areas you'd like to focus on or provide a list of questions..."
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {/* Upcoming Job Interview Setup */}
          {selectedType === "upcoming" && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Upcoming Job Interview Setup
              </h3>

              {/* Job Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={upcomingFormData.jobDescription}
                  onChange={(e) =>
                    setUpcomingFormData({
                      ...upcomingFormData,
                      jobDescription: e.target.value,
                    })
                  }
                  placeholder="Paste the job description here..."
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Company Details */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Detail{" "}
                  <span className="text-gray-500">(Optional)</span>
                </label>
                <textarea
                  value={upcomingFormData.companyDetails}
                  onChange={(e) =>
                    setUpcomingFormData({
                      ...upcomingFormData,
                      companyDetails: e.target.value,
                    })
                  }
                  placeholder="Company mission, values, recent news, culture..."
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  disabled={isLoading}
                />
              </div>

              {/* Resume Details */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resume Details
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`
                    flex items-center justify-center p-3 border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer disabled:opacity-50
                    ${resumeFile ? "ring-2 ring-blue-500" : ""}
                  `}
                  >
                    <Upload size={16} className="mr-2 text-blue-600" />
                    <span className="text-sm text-blue-700">
                      {resumeFile
                        ? resumeFile.name.substring(0, 15) + "..."
                        : "Upload Resume"}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeUpload}
                      className="hidden"
                      disabled={isLoading}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleUseExistingResume}
                    className={`
                      flex items-center justify-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50
                      ${
                        useExistingResume
                          ? "ring-2 ring-green-500 bg-green-50"
                          : ""
                      }
                    `}
                    disabled={isLoading}
                  >
                    <FileText
                      size={16}
                      className={`mr-2 ${
                        useExistingResume ? "text-green-600" : "text-gray-500"
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        useExistingResume ? "text-green-700" : "text-gray-600"
                      }`}
                    >
                      Existing Resume
                    </span>
                  </button>
                </div>
                {resumeFile && (
                  <p className="text-xs text-green-600 mt-2">
                    ✓ {resumeFile.name} selected
                  </p>
                )}
                {useExistingResume && (
                  <p className="text-xs text-green-600 mt-2">
                    ✓ Using existing resume from profile
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Common Form Fields */}
          <div className="space-y-4">
            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                value={
                  selectedType === "upcoming"
                    ? upcomingFormData.language
                    : generalFormData.language
                }
                onChange={(e) => {
                  if (selectedType === "upcoming") {
                    setUpcomingFormData({
                      ...upcomingFormData,
                      language: e.target.value,
                    });
                  } else {
                    setGeneralFormData({
                      ...generalFormData,
                      language: e.target.value,
                    });
                  }
                }}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              >
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
              </select>
            </div>

            {/* Interview Focus */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interview Focus
              </label>
              <select
                value={
                  selectedType === "upcoming"
                    ? upcomingFormData.interviewFocus
                    : generalFormData.interviewFocus
                }
                onChange={(e) => {
                  if (selectedType === "upcoming") {
                    setUpcomingFormData({
                      ...upcomingFormData,
                      interviewFocus: e.target.value,
                    });
                  } else {
                    setGeneralFormData({
                      ...generalFormData,
                      interviewFocus: e.target.value,
                    });
                  }
                }}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              >
                {selectedType === "upcoming" ? (
                  <>
                    <option value="For all interview">For all interview</option>
                    <option value="Technical Questions">
                      Technical Questions
                    </option>
                    <option value="Behavioral Questions">
                      Behavioral Questions
                    </option>
                    <option value="Case Studies">Case Studies</option>
                    <option value="Competency Based">Competency Based</option>
                    <option value="Situational Interview">
                      Situational Interview
                    </option>
                    <option value="Motivational Interview">
                      Motivational Interview
                    </option>
                    <option value="Strengths Based">Strengths Based</option>
                    <option value="Values Based">Values Based</option>
                  </>
                ) : (
                  <>
                    <option value="One interview focus (Default)">
                      One interview focus (Default)
                    </option>
                    <option value="Technical Questions">
                      Technical Questions
                    </option>
                    <option value="Behavioral Questions">
                      Behavioral Questions
                    </option>
                    <option value="Case Studies">Case Studies</option>
                    <option value="Competency Based">Competency Based</option>
                    <option value="Situational Interview">
                      Situational Interview
                    </option>
                    <option value="Motivational Interview">
                      Motivational Interview
                    </option>
                    <option value="Strengths Based">Strengths Based</option>
                    <option value="Values Based">Values Based</option>
                    <option value="Stress Interview">Stress Interview</option>
                  </>
                )}
              </select>
            </div>

            {/* Interview Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interview Duration
              </label>
              <div className="flex space-x-2">
                {selectedType === "upcoming"
                  ? ["15", "30", "45", "60"].map((duration) => (
                      <button
                        key={duration}
                        type="button"
                        onClick={() =>
                          !isLoading &&
                          setUpcomingFormData({ ...upcomingFormData, duration })
                        }
                        className={`
                        flex-1 p-3 rounded-lg border-2 transition-all text-sm font-medium
                        ${
                          upcomingFormData.duration === duration
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 hover:border-gray-300"
                        }
                        ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
                      `}
                        disabled={isLoading}
                      >
                        {duration} minutes
                      </button>
                    ))
                  : ["15", "30"].map((duration) => (
                      <button
                        key={duration}
                        type="button"
                        onClick={() =>
                          !isLoading &&
                          setGeneralFormData({ ...generalFormData, duration })
                        }
                        className={`
                        flex-1 p-3 rounded-lg border-2 transition-all text-sm font-medium
                        ${
                          generalFormData.duration === duration
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 hover:border-gray-300"
                        }
                        ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
                      `}
                        disabled={isLoading}
                      >
                        {duration} minutes
                      </button>
                    ))}
              </div>
            </div>

            {/* Job Location (only for Upcoming Job Interview) */}
            {selectedType === "upcoming" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Location
                </label>
                <div className="relative">
                  <MapPin
                    size={16}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={upcomingFormData.jobLocation}
                    onChange={(e) =>
                      setUpcomingFormData({
                        ...upcomingFormData,
                        jobLocation: e.target.value,
                      })
                    }
                    className="w-full pl-10 pr-4 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter job location"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Starting Interview...
                </>
              ) : (
                <>
                  <Calendar size={16} className="mr-2" />
                  Start New Interview
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
