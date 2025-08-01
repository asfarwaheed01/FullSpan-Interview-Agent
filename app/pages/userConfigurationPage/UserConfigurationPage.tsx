"use client";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAuth } from "@/app/contexts/AuthContext";
import { User, Briefcase, CheckCircle } from "lucide-react";
import { PersonalInfo, ProfessionalInfo } from "@/app/interfaces/userConfig";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import StripeCardForm from "@/app/components/StripeCardForm/StripeCardForm";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

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

  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const handlePaymentAdded = () => {
    setTimeout(() => {
      router.push("/dashboard");
    }, 2500);
  };

  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  const handlePersonalInfoChange = (
    field: keyof PersonalInfo,
    value: PersonalInfo[typeof field]
  ) => {
    setPersonalInfo((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleProfessionalInfoChange = (
    field: keyof ProfessionalInfo,
    value: ProfessionalInfo[typeof field]
  ) => {
    setProfessionalInfo((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
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
    const newErrors: Record<string, string> = {};

    if (!personalInfo.name.trim()) newErrors.name = "Name is required";
    if (!personalInfo.email.trim()) newErrors.email = "Email is required";
    if (!personalInfo.age) newErrors.age = "Age is required";
    if (!personalInfo.gender) newErrors.gender = "Gender is required";
    if (!personalInfo.country.trim()) newErrors.country = "Country is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateProfessionalInfo = () => {
    const newErrors: Record<string, string> = {};

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
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Configuration failed";
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
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
        This information will be used by the interview agent to Evaluate your
        Skills and Experience
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
      <div className="mb-2">
        <h1 className="text-3xl text-center font-bold text-gray-800 mb-4">
          Please, enter your Professional information
        </h1>

        <button
          onClick={() => setCurrentStep(1)}
          className="cursor-pointer group flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-all duration-200 hover:bg-gray-50 rounded-lg font-medium"
        >
          <svg
            className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Personal Information
        </button>
      </div>

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
              <option value="bachelor">Bachelor&apos;s Degree</option>
              <option value="master">Master&apos;s Degree</option>
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
      <p className="text-gray-600 mb-2">
        Your profile is ready. Add a payment method or go to your dashboard.
      </p>

      <div className="max-w-2xl mx-auto">
        <div className="space-y-6">
          {/* Payment Form Header */}
          <div className="text-center mb-2">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Add Payment Method (Optional)
            </h3>
            <p className="text-gray-600">Add payment or skip and add later</p>
          </div>

          {/* Your Existing Stripe Card Form */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <Elements stripe={stripePromise}>
              <StripeCardForm onCardAdded={handlePaymentAdded} />
            </Elements>
          </div>

          {/* Go to Dashboard Button */}
          <div className="text-center pt-4">
            <button
              onClick={handleGoToDashboard}
              className="w-full cursor-pointer text-gray-600 hover:text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors mb-3 border border-gray-300 hover:border-gray-400"
            >
              Continue to Dashboard
            </button>
            <p className="text-sm text-gray-600">
              You can add a payment method later from your dashboard
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}

      {/* Sidebar - keep your existing sidebar code */}
      <div className="w-80 bg-[#2A1F47] text-white p-8 flex flex-col min-h-screen">
        {/* Steps Indicator with connecting lines */}
        <div className="flex flex-1 items-center justify-center">
          <div className="relative">
            {/* Step 1 - Personal Information */}
            <div className="flex items-start mb-2">
              <div className="flex flex-col items-center mr-6">
                <div
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${
                    currentStep >= 1
                      ? "bg-white border-white text-[#2A1F47]"
                      : "bg-transparent border-gray-500 text-gray-500"
                  }`}
                >
                  <User className="w-6 h-6" />
                </div>
                {/* Connecting line */}
                <div className="w-[2px] h-10 bg-[#ffffff] mt-2"></div>
              </div>
              <div className="pt-3">
                <h3
                  className={`text-lg font-medium ${
                    currentStep >= 1 ? "text-white" : "text-gray-400"
                  }`}
                >
                  Personal information
                </h3>
              </div>
            </div>

            {/* Step 2 - Professional Information */}
            <div className="flex items-start mb-2">
              <div className="flex flex-col items-center mr-6">
                <div
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${
                    currentStep >= 2
                      ? "bg-[#4F46E5] border-[#4F46E5] text-white"
                      : "bg-transparent border-gray-500 text-gray-500"
                  }`}
                >
                  <Briefcase className="w-6 h-6" />
                </div>
                {/* Connecting line */}
                <div className="w-[2px] h-10 bg-[#ffffff] mt-2"></div>
              </div>
              <div className="pt-3">
                <h3
                  className={`text-lg font-medium ${
                    currentStep >= 2 ? "text-[#4F46E5]" : "text-gray-400"
                  }`}
                >
                  Professional information
                </h3>
              </div>
            </div>

            {/* Step 3 - Onboarding */}
            <div className="flex items-start">
              <div className="flex flex-col items-center mr-6">
                <div
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${
                    currentStep >= 3
                      ? "bg-white border-white text-[#2A1F47]"
                      : "bg-transparent border-gray-500 text-gray-500"
                  }`}
                >
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>
              <div className="pt-3">
                <h3
                  className={`text-lg font-medium ${
                    currentStep >= 3 ? "text-white" : "text-gray-400"
                  }`}
                >
                  Onboarding
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        {currentStep < 3 && (
          <div className="mt-8">
            <div className="flex justify-between text-sm text-gray-300 mb-3">
              <span>{currentStep} of 3 steps</span>
              <span>{getStepProgress()} complete</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-[#4F46E5] h-2 rounded-full transition-all duration-300"
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
                  : "bg-[#4F46E5] hover:bg-[#4338CA] text-white"
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
