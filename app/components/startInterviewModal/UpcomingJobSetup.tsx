"use client";

import { Upload, FileText } from "lucide-react";
import { UpcomingFormData } from "./StartInterviewModal";

interface UpcomingJobSetupProps {
  formData: UpcomingFormData;
  onFormDataChange: (data: UpcomingFormData) => void;
  resumeFile: File | null;
  useExistingResume: boolean;
  onResumeUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onUseExistingResume: () => void;
  isLoading: boolean;
}

export default function UpcomingJobSetup({
  formData,
  onFormDataChange,
  resumeFile,
  useExistingResume,
  onResumeUpload,
  onUseExistingResume,
  isLoading,
}: UpcomingJobSetupProps) {
  return (
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
          value={formData.jobDescription}
          onChange={(e) =>
            onFormDataChange({
              ...formData,
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
          Company Detail <span className="text-gray-500">(Optional)</span>
        </label>
        <textarea
          value={formData.companyDetails}
          onChange={(e) =>
            onFormDataChange({
              ...formData,
              companyDetails: e.target.value,
            })
          }
          placeholder="Company mission, values, recent news, culture..."
          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
          disabled={isLoading}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Interview Stage <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.interviewStage}
          onChange={(e) =>
            onFormDataChange({
              ...formData,
              interviewStage: e.target.value,
            })
          }
          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          disabled={isLoading}
          required
        >
          <option value="">Select interview stage</option>
          <option value="Initial/HR Screening">Initial/HR Screening</option>
          <option value="Technical/Second Interview">
            Technical/Second Interview
          </option>
          <option value="Final Interview">Final Interview</option>
          <option value="Complete Interview in One Go">
            Complete Interview in One Go
          </option>
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
              flex items-center justify-center p-3 border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer
              ${resumeFile ? "ring-2 ring-blue-500" : ""}
              ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
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
              onChange={onResumeUpload}
              className="hidden"
              disabled={isLoading}
            />
          </label>
          <button
            type="button"
            onClick={onUseExistingResume}
            className={`
              flex items-center justify-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors
              ${useExistingResume ? "ring-2 ring-green-500 bg-green-50" : ""}
              ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
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
  );
}
