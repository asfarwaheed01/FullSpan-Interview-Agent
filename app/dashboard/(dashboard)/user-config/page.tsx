"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  User,
  Briefcase,
  MapPin,
  Calendar,
  GraduationCap,
  FileText,
  Award,
} from "lucide-react";

interface PersonalInfo {
  name: string;
  email: string;
  age: string;
  gender: string;
  country: string;
  userType: "professional" | "student";
  avatar: string | null;
  cv: string | null;
}

interface ProfessionalInfo {
  professionalSummary: string;
  workExperience: string;
  keyProjects: string;
  education: string;
  certificates: string[];
}

interface UserConfiguration {
  _id: string;
  userId: string;
  personalInfo: PersonalInfo;
  professionalInfo: ProfessionalInfo;
  isCompleted: boolean;
  completedAt: string;
  createdAt: string;
  updatedAt: string;
}

const UserConfigPage = () => {
  const [config, setConfig] = useState<UserConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserConfiguration();
  }, []);

  const fetchUserConfiguration = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
        }/api/user/configure`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch configuration");
      }

      if (data.success) {
        setConfig(data.data.configuration);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load configuration";
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getExperienceLabel = (experience: string) => {
    const labels: { [key: string]: string } = {
      "0-1": "0-1 years",
      "1-3": "1-3 years",
      "3-5": "3-5 years",
      "5-10": "5-10 years",
      "10+": "10+ years",
    };
    return labels[experience] || experience;
  };

  const getEducationLabel = (education: string) => {
    const labels: { [key: string]: string } = {
      "high-school": "High School",
      associate: "Associate Degree",
      bachelor: "Bachelor's Degree",
      master: "Master's Degree",
      phd: "PhD",
      other: "Other",
    };
    return labels[education] || education;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading configuration...</p>
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error || "Configuration not found"}</p>
          </div>
          <button
            onClick={fetchUserConfiguration}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            User Configuration
          </h1>
          <p className="text-gray-600 mt-2">
            View and manage your profile configuration
          </p>
          {config.completedAt && (
            <p className="text-sm text-green-600 mt-1">
              ✅ Configuration completed on {formatDate(config.completedAt)}
            </p>
          )}
        </div>

        {/* Personal Information Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center mb-4">
            <User className="w-6 h-6 text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">
              Personal Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                {config.personalInfo.name}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                {config.personalInfo.email}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age Range
              </label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                {config.personalInfo.age}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg capitalize">
                {config.personalInfo.gender}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                <MapPin className="w-4 h-4 text-gray-500 mr-2" />
                <p className="text-gray-900">{config.personalInfo.country}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User Type
              </label>
              <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                <Briefcase className="w-4 h-4 text-gray-500 mr-2" />
                <p className="text-gray-900 capitalize">
                  {config.personalInfo.userType}
                </p>
              </div>
            </div>
          </div>

          {/* File Upload Status */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center">
                <User className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-700">Avatar</span>
              </div>
              <span
                className={`text-sm ${
                  config.personalInfo.avatar
                    ? "text-green-600"
                    : "text-gray-400"
                }`}
              >
                {config.personalInfo.avatar ? "Uploaded" : "Not uploaded"}
              </span>
            </div>

            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center">
                <FileText className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-700">CV</span>
              </div>
              <span
                className={`text-sm ${
                  config.personalInfo.cv ? "text-green-600" : "text-gray-400"
                }`}
              >
                {config.personalInfo.cv ? "Uploaded" : "Not uploaded"}
              </span>
            </div>
          </div>
        </div>

        {/* Professional Information Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center mb-4">
            <Briefcase className="w-6 h-6 text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">
              Professional Information
            </h2>
          </div>

          <div className="space-y-6">
            {config.professionalInfo.professionalSummary && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Professional Summary
                </label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {config.professionalInfo.professionalSummary}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Experience
                </label>
                <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                  <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                  <p className="text-gray-900">
                    {getExperienceLabel(config.professionalInfo.workExperience)}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Education
                </label>
                <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                  <GraduationCap className="w-4 h-4 text-gray-500 mr-2" />
                  <p className="text-gray-900">
                    {getEducationLabel(config.professionalInfo.education)}
                  </p>
                </div>
              </div>
            </div>

            {config.professionalInfo.keyProjects && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Key Projects
                </label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {config.professionalInfo.keyProjects}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center">
                <Award className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-700">Certificates</span>
              </div>
              <span
                className={`text-sm ${
                  config.professionalInfo.certificates.length > 0
                    ? "text-green-600"
                    : "text-gray-400"
                }`}
              >
                {config.professionalInfo.certificates.length > 0
                  ? `${config.professionalInfo.certificates.length} uploaded`
                  : "None uploaded"}
              </span>
            </div>
          </div>
        </div>

        {/* Configuration Metadata */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Configuration Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <label className="block text-gray-500 mb-1">Status</label>
              <div className="flex items-center">
                <div
                  className={`w-2 h-2 rounded-full mr-2 ${
                    config.isCompleted ? "bg-green-500" : "bg-yellow-500"
                  }`}
                ></div>
                <span
                  className={`font-medium ${
                    config.isCompleted ? "text-green-600" : "text-yellow-600"
                  }`}
                >
                  {config.isCompleted ? "Completed" : "Incomplete"}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-gray-500 mb-1">Created</label>
              <p className="text-gray-900">{formatDate(config.createdAt)}</p>
            </div>

            <div>
              <label className="block text-gray-500 mb-1">Last Updated</label>
              <p className="text-gray-900">{formatDate(config.updatedAt)}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={() => (window.location.href = "/user-configuration")}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Edit Configuration
          </button>

          <button
            onClick={fetchUserConfiguration}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserConfigPage;
