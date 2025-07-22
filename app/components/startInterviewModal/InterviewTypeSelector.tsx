// components/dashboard/InterviewTypeSelector.tsx
"use client";

import { User, Calendar, Zap } from "lucide-react";
import { InterviewType } from "./StartInterviewModal";

interface InterviewTypeSelectorProps {
  selectedType: InterviewType;
  onTypeChange: (type: InterviewType) => void;
  isLoading: boolean;
}

export default function InterviewTypeSelector({
  selectedType,
  onTypeChange,
  isLoading,
}: InterviewTypeSelectorProps) {
  const interviewTypes = [
    {
      id: "general" as InterviewType,
      title: "General Role Practice",
      description: "Practice for a specific role",
      icon: User,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      selectedBorder: "border-blue-500",
      selectedBg: "bg-blue-50",
      features: [
        "Role-specific question",
        "Customizable by occupation",
        "General interview preparation",
      ],
    },
    {
      id: "upcoming" as InterviewType,
      title: "Upcoming Job Interview",
      description: "Prepare for a specific job application",
      icon: Calendar,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      selectedBorder: "border-green-500",
      selectedBg: "bg-green-50",
      features: [
        "Role-specific question",
        "Customizable by occupation",
        "General interview preparation",
      ],
    },
    {
      id: "ai-careers" as InterviewType,
      title: "AI Emerging Careers",
      description: "Prepare for AI-driven emerging careers",
      icon: Zap,
      iconBg: "bg-pink-100",
      iconColor: "text-pink-600",
      selectedBorder: "border-purple-500",
      selectedBg: "bg-purple-50",
      features: [
        "AI-Driven Career Recommendations",
        "Future-Ready Skill Assessment",
        "Emerging Role Preparation",
      ],
    },
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Choose Interview Type
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {interviewTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.id;

          return (
            <div
              key={type.id}
              className={`
                border-2 rounded-lg p-4 cursor-pointer transition-all
                ${
                  isSelected
                    ? `${type.selectedBorder} ${type.selectedBg}`
                    : "border-gray-200 hover:border-gray-300"
                }
                ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
              `}
              onClick={() => !isLoading && onTypeChange(type.id)}
            >
              <div className="flex items-center mb-3">
                <div
                  className={`w-8 h-8 ${type.iconBg} rounded-lg flex items-center justify-center mr-3`}
                >
                  <Icon size={16} className={type.iconColor} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-sm">
                    {type.title}
                  </h4>
                </div>

                <div
                  className={`
                    w-4 h-4 rounded-full border-2 flex items-center justify-center
                    ${
                      isSelected
                        ? type.selectedBorder.replace("border-", "border-")
                        : "border-gray-300"
                    }
                  `}
                >
                  {isSelected && (
                    <div
                      className={`w-2 h-2 rounded-full ${
                        type.selectedBorder.includes("blue")
                          ? "bg-blue-500"
                          : type.selectedBorder.includes("green")
                          ? "bg-green-500"
                          : "bg-purple-500"
                      }`}
                    ></div>
                  )}
                </div>
              </div>
              <p className="text-xs mb-1 text-gray-600">{type.description}</p>
              <ul className="text-xs text-gray-600 space-y-1">
                {type.features.map((feature, index) => (
                  <li key={index}>• {feature}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
