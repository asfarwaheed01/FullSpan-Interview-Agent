"use client";

import React, { useState } from "react";
import {
  User,
  Briefcase,
  Building,
  FileText,
  ArrowRight,
  Loader2,
} from "lucide-react";
import {
  InterviewFormData,
  InterviewResponse,
} from "@/app/interfaces/interview";
import { interviewAPI } from "@/app/utils/api";
import { AxiosError } from "axios";

interface InterviewFormProps {
  onInterviewStart: (
    data: InterviewResponse,
    formData: InterviewFormData
  ) => void;
}

const InterviewForm: React.FC<InterviewFormProps> = ({ onInterviewStart }) => {
  const [formData, setFormData] = useState<InterviewFormData>({
    candidate_name: "",
    candidate_details: "",
    job_description: "",
    company_details: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await interviewAPI.startInterview(formData);
      onInterviewStart(response, formData);
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message: string }>;
      if (axiosError.response?.data?.message) {
        setError(axiosError.response.data.message);
      } else {
        setError("Failed to start interview. Please try again.");
      }
      console.error("Interview start error:", axiosError);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = Object.values(formData).every(
    (value) => value.trim() !== ""
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600/20 rounded-full mb-4 backdrop-blur-sm border border-purple-500/30">
            <User className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            AI Interview Agent
          </h1>
          <p className="text-purple-300 text-lg">
            Set up your personalized interview experience
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Candidate Name */}
            <div className="group">
              <label className="flex items-center gap-2 text-purple-200 font-medium mb-3">
                <User className="w-4 h-4" />
                Candidate Name
              </label>
              <input
                type="text"
                name="candidate_name"
                value={formData.candidate_name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 group-hover:border-white/30"
                required
              />
            </div>

            {/* Candidate Details */}
            <div className="group">
              <label className="flex items-center gap-2 text-purple-200 font-medium mb-3">
                <FileText className="w-4 h-4" />
                Candidate Details
              </label>
              <textarea
                name="candidate_details"
                value={formData.candidate_details}
                onChange={handleInputChange}
                placeholder="Brief background, experience, skills, education..."
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 group-hover:border-white/30 resize-none"
                required
              />
            </div>

            {/* Job Description */}
            <div className="group">
              <label className="flex items-center gap-2 text-purple-200 font-medium mb-3">
                <Briefcase className="w-4 h-4" />
                Job Description
              </label>
              <textarea
                name="job_description"
                value={formData.job_description}
                onChange={handleInputChange}
                placeholder="Role requirements, responsibilities, required skills..."
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 group-hover:border-white/30 resize-none"
                required
              />
            </div>

            {/* Company Details */}
            <div className="group">
              <label className="flex items-center gap-2 text-purple-200 font-medium mb-3">
                <Building className="w-4 h-4" />
                Company Details
              </label>
              <textarea
                name="company_details"
                value={formData.company_details}
                onChange={handleInputChange}
                placeholder="Company culture, values, industry, size..."
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 group-hover:border-white/30 resize-none"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-purple-800 disabled:to-indigo-800 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-purple-500/25 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Starting Interview...
                </>
              ) : (
                <>
                  Start Interview
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-purple-400/60 text-sm">
            Powered by AI • Secure & Confidential
          </p>
        </div>
      </div>
    </div>
  );
};

export default InterviewForm;
