// components/dashboard/CommonFormFields.tsx
"use client";

import { MapPin } from "lucide-react";
import {
  InterviewType,
  GeneralFormData,
  UpcomingFormData,
  AIFormData,
} from "./StartInterviewModal";

interface CommonFormFieldsProps {
  selectedType: InterviewType;
  generalFormData: GeneralFormData;
  upcomingFormData: UpcomingFormData;
  aiFormData: AIFormData;
  onGeneralFormDataChange: (data: GeneralFormData) => void;
  onUpcomingFormDataChange: (data: UpcomingFormData) => void;
  onAIFormDataChange: (data: AIFormData) => void;
  isLoading: boolean;
}

export default function CommonFormFields({
  selectedType,
  generalFormData,
  upcomingFormData,
  aiFormData,
  onGeneralFormDataChange,
  onUpcomingFormDataChange,
  onAIFormDataChange,
  isLoading,
}: CommonFormFieldsProps) {
  const getCurrentFormData = () => {
    switch (selectedType) {
      case "upcoming":
        return upcomingFormData;
      case "ai-careers":
        return aiFormData;
      default:
        return generalFormData;
    }
  };

  const updateFormData = (field: string, value: string) => {
    switch (selectedType) {
      case "upcoming":
        onUpcomingFormDataChange({
          ...upcomingFormData,
          [field]: value,
        });
        break;
      case "ai-careers":
        onAIFormDataChange({
          ...aiFormData,
          [field]: value,
        });
        break;
      default:
        onGeneralFormDataChange({
          ...generalFormData,
          [field]: value,
        });
        break;
    }
  };

  const currentFormData = getCurrentFormData();

  const getInterviewFocusOptions = () => {
    if (selectedType === "upcoming") {
      return [
        { value: "For all interview", label: "For all interview" },
        { value: "Technical Questions", label: "Technical Questions" },
        { value: "Behavioral Questions", label: "Behavioral Questions" },
        { value: "Case Studies", label: "Case Studies" },
        { value: "Competency Based", label: "Competency Based" },
        { value: "Situational Interview", label: "Situational Interview" },
        { value: "Motivational Interview", label: "Motivational Interview" },
        { value: "Strengths Based", label: "Strengths Based" },
        { value: "Values Based", label: "Values Based" },
      ];
    } else {
      return [
        {
          value: "One interview focus (Default)",
          label: "One interview focus (Default)",
        },
        { value: "Technical Questions", label: "Technical Questions" },
        { value: "Behavioral Questions", label: "Behavioral Questions" },
        { value: "Case Studies", label: "Case Studies" },
        { value: "Competency Based", label: "Competency Based" },
        { value: "Situational Interview", label: "Situational Interview" },
        { value: "Motivational Interview", label: "Motivational Interview" },
        { value: "Strengths Based", label: "Strengths Based" },
        { value: "Values Based", label: "Values Based" },
        ...(selectedType !== "ai-careers"
          ? [{ value: "Stress Interview", label: "Stress Interview" }]
          : []),
      ];
    }
  };

  const getDurationOptions = () => {
    if (selectedType === "upcoming") {
      return ["15", "30", "45", "60"];
    } else {
      return ["15", "30"];
    }
  };

  return (
    <div className="space-y-4">
      {/* Language */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Language
        </label>
        <select
          value={currentFormData.language}
          onChange={(e) => updateFormData("language", e.target.value)}
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
          value={currentFormData.interviewFocus}
          onChange={(e) => updateFormData("interviewFocus", e.target.value)}
          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
        >
          {getInterviewFocusOptions().map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Interview Duration */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Interview Duration
        </label>
        <div className="flex space-x-2">
          {getDurationOptions().map((duration) => (
            <button
              key={duration}
              type="button"
              onClick={() => !isLoading && updateFormData("duration", duration)}
              className={`
                flex-1 p-3 rounded-lg border-2 transition-all text-sm font-medium
                ${
                  currentFormData.duration === duration
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
                onUpcomingFormDataChange({
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
  );
}
