"use client";
import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import {
  User,
  Briefcase,
  MapPin,
  Calendar,
  GraduationCap,
  FileText,
  Award,
  Edit3,
  Save,
  X,
  Download,
} from "lucide-react";
import { ApiUserConfiguration } from "@/app/interfaces/user-config";
import { useRouter } from "next/navigation";

const UserConfigPage = () => {
  const router = useRouter();
  const [config, setConfig] = useState<ApiUserConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Form state for editing
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age: "",
    gender: "",
    country: "",
    userType: "",
    professionalSummary: "",
    workExperience: "",
    keyProjects: "",
    education: "",
  });

  // File upload refs
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);
  const certificatesInputRef = useRef<HTMLInputElement>(null);

  // File states
  const [selectedFiles, setSelectedFiles] = useState({
    avatar: null as File | null,
    cv: null as File | null,
    certificates: [] as File[],
  });

  useEffect(() => {
    fetchUserConfiguration();
  }, []);

  useEffect(() => {
    if (config) {
      setFormData({
        name: config.personalInfo.name || "",
        email: config.personalInfo.email || "",
        age: config.personalInfo.age || "",
        gender: config.personalInfo.gender || "",
        country: config.personalInfo.country || "",
        userType: config.personalInfo.userType || "",
        professionalSummary: config.professionalInfo.professionalSummary || "",
        workExperience: config.professionalInfo.workExperience || "",
        keyProjects: config.professionalInfo.keyProjects || "",
        education: config.professionalInfo.education || "",
      });
    }
  }, [config]);

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

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fileType: "avatar" | "cv" | "certificates"
  ) => {
    const files = e.target.files;
    if (!files) return;

    if (fileType === "certificates") {
      setSelectedFiles((prev) => ({
        ...prev,
        certificates: Array.from(files),
      }));
    } else {
      setSelectedFiles((prev) => ({
        ...prev,
        [fileType]: files[0],
      }));
    }
  };

  const handleUpdate = async () => {
    try {
      setUpdating(true);

      const formDataToSend = new FormData();

      // Add text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value.trim()) {
          formDataToSend.append(key, value.trim());
        }
      });

      // Add files
      if (selectedFiles.avatar) {
        formDataToSend.append("avatar", selectedFiles.avatar);
      }
      if (selectedFiles.cv) {
        formDataToSend.append("cv", selectedFiles.cv);
      }
      if (selectedFiles.certificates.length > 0) {
        selectedFiles.certificates.forEach((file) => {
          formDataToSend.append("certificates", file);
        });
      }

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
        }/api/user/configure`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formDataToSend,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update configuration");
      }

      if (data.success) {
        setConfig(data.data.configuration);
        setIsEditing(false);
        setSelectedFiles({
          avatar: null,
          cv: null,
          certificates: [],
        });

        // Reset file inputs
        if (avatarInputRef.current) avatarInputRef.current.value = "";
        if (cvInputRef.current) cvInputRef.current.value = "";
        if (certificatesInputRef.current)
          certificatesInputRef.current.value = "";

        toast.success("Configuration updated successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update configuration";
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedFiles({
      avatar: null,
      cv: null,
      certificates: [],
    });

    // Reset form data to original config
    if (config) {
      setFormData({
        name: config.personalInfo.name || "",
        email: config.personalInfo.email || "",
        age: config.personalInfo.age || "",
        gender: config.personalInfo.gender || "",
        country: config.personalInfo.country || "",
        userType: config.personalInfo.userType || "",
        professionalSummary: config.professionalInfo.professionalSummary || "",
        workExperience: config.professionalInfo.workExperience || "",
        keyProjects: config.professionalInfo.keyProjects || "",
        education: config.professionalInfo.education || "",
      });
    }

    // Reset file inputs
    if (avatarInputRef.current) avatarInputRef.current.value = "";
    if (cvInputRef.current) cvInputRef.current.value = "";
    if (certificatesInputRef.current) certificatesInputRef.current.value = "";
  };

  const getFileNameFromUrl = (url: string | undefined | null) => {
    if (!url) return "File";
    try {
      const urlParts = url.split("/");
      const fileName = urlParts[urlParts.length - 1];
      // Remove any query parameters or timestamps
      return fileName.split("?")[0];
    } catch {
      return "File";
    }
  };

  const downloadFile = (url: string, fileName: string) => {
    if (url) {
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
            onClick={() => router.push("/user-configuration")}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Configuration Details
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
          <div className="flex justify-between items-start">
            <div>
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

            {/* Edit/Save/Cancel buttons */}
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Configuration
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleUpdate}
                  disabled={updating}
                  className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updating ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={updating}
                  className="flex items-center bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:bg-gray-400"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </button>
              </div>
            )}
          </div>
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
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your name"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {config.personalInfo.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {config.personalInfo.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age Range
              </label>
              {isEditing ? (
                <select
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select age range</option>
                  <option value="18-24">18-24</option>
                  <option value="25-34">25-34</option>
                  <option value="35-44">35-44</option>
                  <option value="45-54">45-54</option>
                  <option value="55-64">55-64</option>
                  <option value="65+">65+</option>
                </select>
              ) : (
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {config.personalInfo.age}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              {isEditing ? (
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              ) : (
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg capitalize">
                  {config.personalInfo.gender}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your country"
                />
              ) : (
                <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                  <MapPin className="w-4 h-4 text-gray-500 mr-2" />
                  <p className="text-gray-900">{config.personalInfo.country}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User Type
              </label>
              {isEditing ? (
                <select
                  name="userType"
                  value={formData.userType}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select user type</option>
                  <option value="job-seeker">Job Seeker</option>
                  <option value="student">Student</option>
                  <option value="professional">Professional</option>
                  <option value="entrepreneur">Entrepreneur</option>
                  <option value="other">Other</option>
                </select>
              ) : (
                <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                  <Briefcase className="w-4 h-4 text-gray-500 mr-2" />
                  <p className="text-gray-900 capitalize">
                    {config.personalInfo.userType}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* File Upload Section */}
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              File Uploads
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Avatar Upload */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Avatar
                    </span>
                  </div>
                  <span
                    className={`text-sm ${
                      config.personalInfo.avatar || selectedFiles.avatar
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    {config.personalInfo.avatar || selectedFiles.avatar
                      ? "Uploaded"
                      : "Not uploaded"}
                  </span>
                </div>
                {config.personalInfo.avatar && (
                  <div className="mb-2">
                    <span
                      onClick={() =>
                        downloadFile(
                          config.personalInfo.avatar!,
                          getFileNameFromUrl(config.personalInfo.avatar)
                        )
                      }
                      className="text-blue-500 hover:text-blue-700 cursor-pointer underline text-sm flex items-center"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      {getFileNameFromUrl(config.personalInfo.avatar)}
                    </span>
                  </div>
                )}
                {isEditing && (
                  <div className="mt-2">
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "avatar")}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {selectedFiles.avatar && (
                      <p className="text-xs text-green-600 mt-1">
                        New file selected: {selectedFiles.avatar.name}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* CV Upload */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      CV
                    </span>
                  </div>
                  <span
                    className={`text-sm ${
                      config.personalInfo.cv || selectedFiles.cv
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    {config.personalInfo.cv || selectedFiles.cv
                      ? "Uploaded"
                      : "Not uploaded"}
                  </span>
                </div>
                {config.personalInfo.cv && (
                  <div className="mb-2">
                    <span
                      onClick={() =>
                        downloadFile(
                          config.personalInfo.cv!,
                          getFileNameFromUrl(config.personalInfo.cv!)
                        )
                      }
                      className="text-blue-500 hover:text-blue-700 cursor-pointer underline text-sm flex items-center"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      {getFileNameFromUrl(config.personalInfo.cv)}
                    </span>
                  </div>
                )}
                {isEditing && (
                  <div className="mt-2">
                    <input
                      ref={cvInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileChange(e, "cv")}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {selectedFiles.cv && (
                      <p className="text-xs text-green-600 mt-1">
                        New file selected: {selectedFiles.cv.name}
                      </p>
                    )}
                  </div>
                )}
              </div>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Professional Summary
              </label>
              {isEditing ? (
                <textarea
                  name="professionalSummary"
                  value={formData.professionalSummary}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your professional summary"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {config.professionalInfo.professionalSummary ||
                    "Not provided"}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Experience
                </label>
                {isEditing ? (
                  <select
                    name="workExperience"
                    value={formData.workExperience}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select experience</option>
                    <option value="0-1">0-1 years</option>
                    <option value="1-3">1-3 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="5-10">5-10 years</option>
                    <option value="10+">10+ years</option>
                  </select>
                ) : (
                  <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                    <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                    <p className="text-gray-900">
                      {getExperienceLabel(
                        config.professionalInfo.workExperience
                      )}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Education
                </label>
                {isEditing ? (
                  <select
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select education</option>
                    <option value="high-school">High School</option>
                    <option value="associate">Associate Degree</option>
                    <option value="bachelor">Bachelor&apos;s Degree</option>
                    <option value="master">Master&apos;s Degree</option>
                    <option value="phd">PhD</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                    <GraduationCap className="w-4 h-4 text-gray-500 mr-2" />
                    <p className="text-gray-900">
                      {getEducationLabel(config.professionalInfo.education)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Key Projects
              </label>
              {isEditing ? (
                <textarea
                  name="keyProjects"
                  value={formData.keyProjects}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your key projects"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {config.professionalInfo.keyProjects || "Not provided"}
                </p>
              )}
            </div>

            {/* Certificates Upload */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Award className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">
                    Certificates
                  </span>
                </div>
                <span
                  className={`text-sm ${
                    config.professionalInfo.certificates.length > 0 ||
                    selectedFiles.certificates.length > 0
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  {config.professionalInfo.certificates.length > 0
                    ? `${config.professionalInfo.certificates.length} uploaded`
                    : selectedFiles.certificates.length > 0
                    ? `${selectedFiles.certificates.length} selected`
                    : "None uploaded"}
                </span>
              </div>

              {/* Current Certificates List */}
              {config.professionalInfo.certificates.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs text-gray-600 mb-2">
                    Current certificates:
                  </p>
                  <div className="space-y-1">
                    {config.professionalInfo.certificates.map((cert, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-xs text-gray-600 bg-gray-100 p-2 rounded"
                      >
                        <span
                          onClick={() =>
                            downloadFile(cert, getFileNameFromUrl(cert))
                          }
                          className="text-blue-500 hover:text-blue-700 cursor-pointer underline flex items-center"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          {getFileNameFromUrl(cert)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isEditing && (
                <div className="mt-2">
                  <input
                    ref={certificatesInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, "certificates")}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {selectedFiles.certificates.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-green-600 mb-1">
                        {selectedFiles.certificates.length} file(s) selected:
                      </p>
                      <ul className="text-xs text-gray-600">
                        {selectedFiles.certificates.map((file, index) => (
                          <li key={index}>• {file.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
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
      </div>
    </div>
  );
};

export default UserConfigPage;
