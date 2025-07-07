// components/dashboard/StartInterviewModal.tsx
"use client";

import { useState } from "react";
import { X, User, Calendar, Upload, FileText, MapPin } from "lucide-react";

interface StartInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StartInterviewModal({
  isOpen,
  onClose,
}: StartInterviewModalProps) {
  const [selectedType, setSelectedType] = useState<"general" | "upcoming">(
    "upcoming"
  );
  const [formData, setFormData] = useState({
    jobDescription: "",
    companyDetails: "",
    language: "English",
    interviewFocus: "For all interview",
    duration: "15",
    gender: "Male",
    jobLocation: "Calgary, 7th Road",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Interview data:", { selectedType, ...formData });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500/20 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
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
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Choose Interview Type */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Choose Interview Type
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* General Role Practice */}
              <div
                className={`
                  border-2 rounded-lg p-4 cursor-pointer transition-all
                  ${
                    selectedType === "general"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }
                `}
                onClick={() => setSelectedType("general")}
              >
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <User size={16} className="text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
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
                  <li>• Practice for a specific role</li>
                  <li>• Customized by occupation</li>
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
                `}
                onClick={() => setSelectedType("upcoming")}
              >
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <Calendar size={16} className="text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
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
                  <li>• Practice for a specific role</li>
                  <li>• Customized by occupation</li>
                  <li>• General interview preparation</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Upcoming Job Interview Setup */}
          {selectedType === "upcoming" && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Upcoming Job Interview Setup
              </h3>

              {/* Job Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description
                </label>
                <textarea
                  value={formData.jobDescription}
                  onChange={(e) =>
                    setFormData({ ...formData, jobDescription: e.target.value })
                  }
                  placeholder="Paste the job description here..."
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>

              {/* Company Details */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Detail{" "}
                  <span className="text-gray-500">(Optional)</span>
                </label>
                <textarea
                  value={formData.companyDetails}
                  onChange={(e) =>
                    setFormData({ ...formData, companyDetails: e.target.value })
                  }
                  placeholder="Company mission, values, recent news, culture..."
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>

              {/* Resume Details */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resume Details
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="flex items-center justify-center p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                  >
                    <Upload size={16} className="mr-2 text-gray-500" />
                    <span className="text-sm text-gray-600">Upload Resume</span>
                  </button>
                  <button
                    type="button"
                    className="flex items-center justify-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FileText size={16} className="mr-2 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Existing Resume
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                value={formData.language}
                onChange={(e) =>
                  setFormData({ ...formData, language: e.target.value })
                }
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                value={formData.interviewFocus}
                onChange={(e) =>
                  setFormData({ ...formData, interviewFocus: e.target.value })
                }
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option>For all interview</option>
                <option>Technical Questions</option>
                <option>Behavioral Questions</option>
                <option>Case Studies</option>
              </select>
            </div>

            {/* Interview Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interview Duration
              </label>
              <div className="flex space-x-2">
                {["15", "30", "45", "60"].map((duration) => (
                  <button
                    key={duration}
                    type="button"
                    onClick={() => setFormData({ ...formData, duration })}
                    className={`
                      flex-1 p-3 rounded-lg border-2 transition-all text-sm font-medium
                      ${
                        formData.duration === duration
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-gray-300"
                      }
                    `}
                  >
                    {duration} minutes
                  </button>
                ))}
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
                <option>Prefer not to say</option>
              </select>
            </div>

            {/* Job Location */}
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
                  value={formData.jobLocation}
                  onChange={(e) =>
                    setFormData({ ...formData, jobLocation: e.target.value })
                  }
                  className="w-full pl-10 pr-4 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter job location"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
            >
              <Calendar size={16} className="mr-2" />
              Start New Interview
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
