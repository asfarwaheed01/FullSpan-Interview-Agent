"use client";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAuth } from "@/app/contexts/AuthContext";
import { User, Briefcase, CheckCircle } from "lucide-react";

interface PersonalInfo {
  name: string;
  email: string;
  age: string;
  gender: string;
  country: string;
  userType: "professional" | "student";
  avatar: File | null;
  cv: File | null;
}

interface ProfessionalInfo {
  professionalSummary: string;
  workExperience: string;
  keyProjects: string;
  education: string;
  certificates: File[];
}

interface UserConfigData {
  personalInfo: PersonalInfo;
  professionalInfo: ProfessionalInfo;
}

const UserConfigurationPage = () => {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);
  const certificatesInputRef = useRef<HTMLInputElement>(null);

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: user?.username || "",
    email: user?.email || "",
    age: "",
    gender: "",
    country: "",
    userType: "professional",
    avatar: null,
    cv: null,
  });

  const [professionalInfo, setProfessionalInfo] = useState<ProfessionalInfo>({
    professionalSummary: "",
    workExperience: "",
    keyProjects: "",
    education: "",
    certificates: [],
  });

  const [errors, setErrors] = useState<any>({});

  const handlePersonalInfoChange = (field: keyof PersonalInfo, value: any) => {
    setPersonalInfo((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: "" }));
    }
  };

  const handleProfessionalInfoChange = (
    field: keyof ProfessionalInfo,
    value: any
  ) => {
    setProfessionalInfo((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: "" }));
    }
  };

  const handleFileUpload = (field: string, files: FileList | null) => {
    if (!files) return;

    if (field === "avatar" || field === "cv") {
      handlePersonalInfoChange(field as keyof PersonalInfo, files[0]);
    } else if (field === "certificates") {
      handleProfessionalInfoChange("certificates", Array.from(files));
    }
  };

  const validatePersonalInfo = () => {
    const newErrors: any = {};

    if (!personalInfo.name.trim()) newErrors.name = "Name is required";
    if (!personalInfo.email.trim()) newErrors.email = "Email is required";
    if (!personalInfo.age) newErrors.age = "Age is required";
    if (!personalInfo.gender) newErrors.gender = "Gender is required";
    if (!personalInfo.country.trim()) newErrors.country = "Country is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateProfessionalInfo = () => {
    const newErrors: any = {};

    if (!professionalInfo.workExperience)
      newErrors.workExperience = "Work experience is required";
    if (!professionalInfo.education)
      newErrors.education = "Education is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (validatePersonalInfo()) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      if (validateProfessionalInfo()) {
        handleSubmitConfiguration();
      }
    }
  };

  const handleSubmitConfiguration = async () => {
    setLoading(true);

    try {
      // Create FormData for binary file uploads
      const formData = new FormData();

      // Add text fields
      formData.append("name", personalInfo.name);
      formData.append("email", personalInfo.email);
      formData.append("age", personalInfo.age);
      formData.append("gender", personalInfo.gender);
      formData.append("country", personalInfo.country);
      formData.append("userType", personalInfo.userType);
      formData.append(
        "professionalSummary",
        professionalInfo.professionalSummary
      );
      formData.append("workExperience", professionalInfo.workExperience);
      formData.append("keyProjects", professionalInfo.keyProjects);
      formData.append("education", professionalInfo.education);

      // Add files as binary data
      if (personalInfo.cv) {
        formData.append("cv", personalInfo.cv);
      }

      if (personalInfo.avatar) {
        formData.append("avatar", personalInfo.avatar);
      }

      if (professionalInfo.certificates.length > 0) {
        professionalInfo.certificates.forEach((file) => {
          formData.append("certificates", file);
        });
      }

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
        }/api/user/configure`,
        {
          method: "POST",
          headers: {
            // Remove Content-Type - browser sets it automatically for FormData
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Configuration failed");
      }

      if (data.success) {
        updateUser(data.data.user);
        toast.success("Profile configured successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
        setCurrentStep(3);
      }
    } catch (error: any) {
      toast.error(error.message || "Configuration failed", {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartInterview = () => {
    router.push("/interview");
  };

  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  const getStepProgress = () => {
    if (currentStep === 1) return "25%";
    if (currentStep === 2) return "50%";
    return "100%";
  };

  const renderStep1 = () => (
    <div className="flex-1 bg-white p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Please, enter your personal information
      </h1>
      <p className="text-gray-600 mb-8">
        Lorem ipsum dolor sit amet. Id iusto dolores sed placeat ipsa.
      </p>

      <div className="flex gap-8">
        {/* Avatar Section */}
        <div className="flex flex-col items-center">
          <div className="relative w-32 h-32 mb-4">
            {personalInfo.avatar ? (
              <img
                src={URL.createObjectURL(personalInfo.avatar)}
                alt="Avatar"
                className="w-full h-full rounded-lg object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">No Image</span>
              </div>
            )}
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="absolute bottom-0 left-0 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
            >
              Upload Image
            </button>
          </div>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload("avatar", e.target.files)}
            className="hidden"
          />
          <p className="text-sm text-gray-500 text-center max-w-32">
            Lorem ipsum dolor sit amet. Id iusto dolores sed placeat ipsa.
          </p>
        </div>

        {/* Form Fields */}
        <div className="flex-1 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name*
            </label>
            <input
              type="text"
              value={personalInfo.name}
              onChange={(e) => handlePersonalInfoChange("name", e.target.value)}
              placeholder="Enter your name..."
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email*
            </label>
            <input
              type="email"
              value={personalInfo.email}
              onChange={(e) =>
                handlePersonalInfoChange("email", e.target.value)
              }
              placeholder="Enter your email..."
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Age*
            </label>
            <select
              value={personalInfo.age}
              onChange={(e) => handlePersonalInfoChange("age", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.age ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select Age</option>
              <option value="18-24">18-24</option>
              <option value="25-34">25-34</option>
              <option value="35-44">35-44</option>
              <option value="45-54">45-54</option>
              <option value="55+">55+</option>
            </select>
            {errors.age && (
              <p className="text-red-500 text-sm mt-1">{errors.age}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender*
            </label>
            <select
              value={personalInfo.gender}
              onChange={(e) =>
                handlePersonalInfoChange("gender", e.target.value)
              }
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.gender ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
            {errors.gender && (
              <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country*
            </label>
            <input
              type="text"
              value={personalInfo.country}
              onChange={(e) =>
                handlePersonalInfoChange("country", e.target.value)
              }
              placeholder="Calgary (Canada)"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.country ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.country && (
              <p className="text-red-500 text-sm mt-1">{errors.country}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              What are you?
            </label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="userType"
                  value="professional"
                  checked={personalInfo.userType === "professional"}
                  onChange={(e) =>
                    handlePersonalInfoChange("userType", e.target.value)
                  }
                  className="mr-2"
                />
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Professional
                </span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="userType"
                  value="student"
                  checked={personalInfo.userType === "student"}
                  onChange={(e) =>
                    handlePersonalInfoChange("userType", e.target.value)
                  }
                  className="mr-2"
                />
                Student
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload CV*
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <button
                onClick={() => cvInputRef.current?.click()}
                className="w-full text-blue-500 hover:text-blue-600"
              >
                {personalInfo.cv ? personalInfo.cv.name : "Choose File"}
              </button>
              <input
                ref={cvInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => handleFileUpload("cv", e.target.files)}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="flex-1 bg-white p-8">
      <h1 className="text-3xl text-center font-bold text-gray-800 mb-2">
        Please, enter your Professional information
      </h1>
      <p className="text-gray-600 text-center mb-8">
        Lorem ipsum dolor sit amet. Id iusto dolores sed placeat ipsa.
      </p>

      <div className="space-y-6 max-w-4xl">
        <div className="grid grid-cols-4 gap-6 items-start">
          <div className="text-right">
            <label className="block text-sm font-medium text-gray-700">
              Professional Summary
            </label>
          </div>
          <div className="col-span-3">
            <textarea
              value={professionalInfo.professionalSummary}
              onChange={(e) =>
                handleProfessionalInfoChange(
                  "professionalSummary",
                  e.target.value
                )
              }
              placeholder="Write brief about your professional career..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6 items-center">
          <div className="text-right">
            <label className="block text-sm font-medium text-gray-700">
              Work Experience*
            </label>
          </div>
          <div className="col-span-3">
            <select
              value={professionalInfo.workExperience}
              onChange={(e) =>
                handleProfessionalInfoChange("workExperience", e.target.value)
              }
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none ${
                errors.workExperience ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select years of experience</option>
              <option value="0-1">0-1 years</option>
              <option value="1-3">1-3 years</option>
              <option value="3-5">3-5 years</option>
              <option value="5-10">5-10 years</option>
              <option value="10+">10+ years</option>
            </select>
            {errors.workExperience && (
              <p className="text-red-500 text-sm mt-1">
                {errors.workExperience}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6 items-start">
          <div className="text-right">
            <label className="block text-sm font-medium text-gray-700">
              Key Projects
            </label>
          </div>
          <div className="col-span-3">
            <textarea
              value={professionalInfo.keyProjects}
              onChange={(e) =>
                handleProfessionalInfoChange("keyProjects", e.target.value)
              }
              placeholder="Write short description of your best projects..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6 items-center">
          <div className="text-right">
            <label className="block text-sm font-medium text-gray-700">
              Education*
            </label>
          </div>
          <div className="col-span-3">
            <select
              value={professionalInfo.education}
              onChange={(e) =>
                handleProfessionalInfoChange("education", e.target.value)
              }
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none ${
                errors.education ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select degree of education</option>
              <option value="high-school">High School</option>
              <option value="associate">Associate Degree</option>
              <option value="bachelor">Bachelor's Degree</option>
              <option value="master">Master's Degree</option>
              <option value="phd">PhD</option>
              <option value="other">Other</option>
            </select>
            {errors.education && (
              <p className="text-red-500 text-sm mt-1">{errors.education}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6 items-center">
          <div className="text-right">
            <label className="block text-sm font-medium text-gray-700">
              Certificates
            </label>
          </div>
          <div className="col-span-3">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <button
                onClick={() => certificatesInputRef.current?.click()}
                className="w-full text-blue-500 hover:text-blue-600 text-left"
              >
                {professionalInfo.certificates.length > 0
                  ? `${professionalInfo.certificates.length} file(s) selected`
                  : "Upload Certificates"}
              </button>
              <input
                ref={certificatesInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) =>
                  handleFileUpload("certificates", e.target.files)
                }
                className="hidden"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="flex-1 bg-white p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Setup Complete!</h1>
      <p className="text-gray-600 mb-8">
        Lorem ipsum dolor sit amet. Id iusto dolores sed placeat ipsa.
      </p>

      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Interview Summary</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Position:</p>
            <p className="font-medium">Full Stack Developer</p>
          </div>
          <div>
            <p className="text-gray-600">Company:</p>
            <p className="font-medium">Stellar Tech Solution</p>
          </div>
          <div>
            <p className="text-gray-600">Experience level:</p>
            <p className="font-medium">{professionalInfo.workExperience}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="text-center p-6 border rounded-lg">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h4 className="text-lg font-semibold mb-2">Start Mock Interview</h4>
          <p className="text-gray-600 mb-4 text-sm">
            Jump right into your personalized interview session
          </p>
          <button
            onClick={handleStartInterview}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Join Interview
          </button>
        </div>

        <div className="text-center p-6 border rounded-lg">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h4 className="text-lg font-semibold mb-2">Go to Dashboard</h4>
          <p className="text-gray-600 mb-4 text-sm">
            View your profile, past interviews, and analytics
          </p>
          <button
            onClick={handleGoToDashboard}
            className="w-full border border-blue-500 text-blue-500 py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Open Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Main Content */}
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}

      {/* Sidebar */}
      <div className="w-80 bg-[#271C42] text-white p-8 flex flex-col">
        {/* Steps Indicator */}
        <div className="space-y-8 mb-auto">
          <div className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                currentStep >= 1
                  ? "bg-white text-gray-900"
                  : "bg-gray-700 text-gray-400"
              }`}
            >
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium">Personal information</h3>
            </div>
          </div>

          <div className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                currentStep >= 2
                  ? "bg-blue-500 text-white"
                  : "bg-gray-700 text-gray-400"
              }`}
            >
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3
                className={`font-medium ${
                  currentStep >= 2 ? "text-blue-400" : "text-gray-400"
                }`}
              >
                Professional information
              </h3>
            </div>
          </div>

          <div className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                currentStep >= 3
                  ? "bg-white text-gray-900"
                  : "bg-gray-700 text-gray-400"
              }`}
            >
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium">Onboarding</h3>
            </div>
          </div>
        </div>

        {/* Progress */}
        {currentStep < 3 && (
          <div className="mt-auto">
            <div className="flex justify-between text-sm mb-2">
              <span>{currentStep} to 3 step</span>
              <span>{getStepProgress()} to complete</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: getStepProgress() }}
              ></div>
            </div>
          </div>
        )}

        {/* Next Button */}
        {currentStep < 3 && (
          <div className="mt-6">
            <button
              onClick={handleNext}
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                loading
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              {loading ? "Saving..." : "NEXT"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserConfigurationPage;
