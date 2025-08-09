// "use client";

// import { useState } from "react";
// import { X, Loader2, Calendar } from "lucide-react";
// import { useRouter } from "next/navigation";
// import { getToken } from "@/app/utils/constants";
// import InterviewTypeSelector from "./InterviewTypeSelector";
// import GeneralRoleSetup from "./GeneralRoleSetup";
// import UpcomingJobSetup from "./UpcomingJobSetup";
// import AIEmergingCareersSetup from "./AIEmergingCareersSetup";
// import CommonFormFields from "./CommonFormFields";
// import { RecommendationOccupation } from "@/app/interfaces/interview";

// interface StartInterviewModalProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// interface InterviewResponse {
//   success: boolean;
//   message: string;
//   data: {
//     interview: {
//       id: string;
//       access_token: string;
//       wsUrl: string;
//       room_name: string;
//       status: string;
//       started_at: string;
//       candidate_name: string;
//       interview_type: string;
//       duration: string;
//     };
//   };
// }

// export type InterviewType = "general" | "upcoming" | "ai-careers";

// export interface GeneralFormData {
//   occupationName: string;
//   language: string;
//   interviewFocus: string;
//   duration: string;
//   additionalFocusAreas: string;
// }

// export interface UpcomingFormData {
//   jobDescription: string;
//   companyDetails: string;
//   language: string;
//   interviewFocus: string;
//   duration: string;
//   jobLocation: string;
//   interviewStage: string;
// }

// export interface AIFormData {
//   selectedOccupation: string;
//   recommendedOccupations: RecommendationOccupation[];
//   language: string;
//   interviewFocus: string;
//   duration: string;
//   additionalFocusAreas: string;
// }

// export default function StartInterviewModal({
//   isOpen,
//   onClose,
// }: StartInterviewModalProps) {
//   const [selectedType, setSelectedType] = useState<InterviewType>("general");
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | React.ReactNode | null>(null);
//   const [resumeFile, setResumeFile] = useState<File | null>(null);
//   const [useExistingResume, setUseExistingResume] = useState(false);

//   const token = getToken();
//   const router = useRouter();

//   // Form data states
//   const [generalFormData, setGeneralFormData] = useState<GeneralFormData>({
//     occupationName: "",
//     language: "English",
//     interviewFocus: "One interview focus (Default)",
//     duration: "15",
//     additionalFocusAreas: "",
//   });

//   const [upcomingFormData, setUpcomingFormData] = useState<UpcomingFormData>({
//     jobDescription: "",
//     companyDetails: "",
//     language: "English",
//     interviewFocus: "For all interview",
//     duration: "15",
//     jobLocation: "Calgary, 7th Road",
//     interviewStage: "Complete Interview in One Go",
//   });

//   const [aiFormData, setAIFormData] = useState<AIFormData>({
//     selectedOccupation: "",
//     recommendedOccupations: [] as RecommendationOccupation[],
//     language: "English",
//     interviewFocus: "One interview focus (Default)",
//     duration: "15",
//     additionalFocusAreas: "",
//   });

//   const handleResumeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       const allowedTypes = [
//         "application/pdf",
//         "application/msword",
//         "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//       ];
//       if (!allowedTypes.includes(file.type)) {
//         setError("Please upload a PDF or Word document");
//         return;
//       }

//       if (file.size > 5 * 1024 * 1024) {
//         setError("File size must be less than 5MB");
//         return;
//       }

//       setResumeFile(file);
//       setUseExistingResume(false);
//       setError(null);
//     }
//   };

//   const handleUseExistingResume = () => {
//     setUseExistingResume(true);
//     setResumeFile(null);
//   };

//   const mapInterviewFocusToAPI = (displayValue: string): string => {
//     const focusMapping: { [key: string]: string } = {
//       "Technical Questions": "technical_skills_interview",
//       "Behavioral Questions": "behavioral_interview",
//       "Case Studies": "case_based_interview",
//       "Competency Based": "competency_based_interview",
//       "Situational Interview": "situational_interview",
//       "Motivational Interview": "motivational_interview",
//       "Strengths Based": "strengths_based_interview",
//       "Values Based": "values_based_interview",
//       "Stress Interview": "stress_interview",
//       "One interview focus (Default)": "technical_skills_interview",
//       "For all interview": "behavioral_interview",
//     };

//     return focusMapping[displayValue] || "technical_skills_interview";
//   };

//   const mapInterviewTypeToAPI = (type: InterviewType): string => {
//     switch (type) {
//       case "general":
//         return "general";
//       case "upcoming":
//         return "job";
//       case "ai-careers":
//         return "general";
//       default:
//         return "general";
//     }
//   };

//   const mapExperienceLevel = (occupation: string) => {
//     console.log(occupation);
//     return "mid";
//   };

//   const prepareAPIPayload = async () => {
//     let currentFormData;
//     let occupationName;

//     const apiInterviewType = mapInterviewTypeToAPI(selectedType);

//     switch (selectedType) {
//       case "upcoming":
//         currentFormData = upcomingFormData;
//         occupationName = "Job Applicant";
//         break;
//       case "ai-careers":
//         currentFormData = aiFormData;
//         occupationName = aiFormData.selectedOccupation;
//         break;
//       default:
//         currentFormData = generalFormData;
//         occupationName = generalFormData.occupationName;
//     }

//     const basePayload = {
//       interview_type: apiInterviewType,
//       language: currentFormData.language,
//       duration: currentFormData.duration,
//       interview_focus: mapInterviewFocusToAPI(currentFormData.interviewFocus),
//       use_existing_resume: useExistingResume,
//     };

//     // Add fields based on interview type
//     if (apiInterviewType === "general") {
//       // For general interviews: include occupation_name and experience_level
//       return {
//         ...basePayload,
//         occupation_name: occupationName,
//         experience_level: mapExperienceLevel(occupationName),
//       };
//     } else {
//       // For job type interviews: include job_description, company_details, interview_stage
//       let jobDescription = "";
//       let companyDetails = "";
//       let interviewStage = "";

//       if (selectedType === "upcoming") {
//         jobDescription = upcomingFormData.jobDescription;
//         companyDetails =
//           upcomingFormData.companyDetails || "Company details not provided";
//         interviewStage = upcomingFormData.interviewStage;
//       } else if (selectedType === "ai-careers") {
//         jobDescription = `AI Emerging Careers interview for ${
//           aiFormData.selectedOccupation
//         } position. ${
//           aiFormData.additionalFocusAreas
//             ? `Focus areas: ${aiFormData.additionalFocusAreas}`
//             : ""
//         }`;
//         companyDetails = "AI Emerging Careers practice session";
//         interviewStage = "Skill Assessment";
//       }

//       return {
//         ...basePayload,
//         job_description: jobDescription,
//         company_details: companyDetails,
//         interview_stage: interviewStage,
//       };
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError(null);
//     setIsLoading(true);

//     try {
//       // Validate required fields
//       if (selectedType === "upcoming") {
//         if (!upcomingFormData.jobDescription.trim()) {
//           throw new Error("Job description is required");
//         }
//       } else if (selectedType === "ai-careers") {
//         if (!aiFormData.selectedOccupation) {
//           throw new Error("Please select an occupation");
//         }
//       } else {
//         if (!generalFormData.occupationName) {
//           throw new Error("Occupation name is required");
//         }
//       }

//       const payload = await prepareAPIPayload();
//       const formData = new FormData();

//       Object.keys(payload).forEach((key) => {
//         const value = payload[key as keyof typeof payload];
//         formData.append(key, String(value));
//       });

//       if (resumeFile) {
//         formData.append("cv_content", resumeFile);
//       }

//       for (const [key, value] of formData.entries()) {
//         if (value instanceof File) {
//           console.log(
//             `${key}: File(${value.name}, ${value.size} bytes, ${value.type})`
//           );
//         } else {
//           console.log(`${key}: ${value}`);
//         }
//       }

//       const response = await fetch(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/interviews/start`,
//         {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//           body: formData,
//         }
//       );

//       const data: InterviewResponse = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Failed to start interview");
//       }

//       if (data.success) {
//         const searchParams = new URLSearchParams({
//           room_name: data.data.interview.room_name,
//           access_token: data.data.interview.access_token,
//           wsUrl: data.data.interview.wsUrl,
//           interview_id: data.data.interview.id,
//           interview_type: selectedType,
//           duration: data.data.interview.duration,
//         });

//         router.push(`/interview?${searchParams.toString()}`);
//         onClose();
//       }
//     } catch (error) {
//       console.error("Error starting interview:", error);

//       const errorMessage =
//         error instanceof Error ? error.message : "Failed to start interview";

//       if (
//         errorMessage.includes("payment method") ||
//         errorMessage.includes("Payment method")
//       ) {
//         setError(
//           <div className="flex items-center justify-between">
//             <p className="mb-2">{errorMessage}</p>
//             <button
//               onClick={() => {
//                 onClose();
//                 router.push("/dashboard/payments");
//               }}
//               className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium"
//             >
//               Add Payment Method →
//             </button>
//           </div>
//         );
//       } else {
//         setError(errorMessage);
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-gray-500/20 backdrop-blur-md z-50 flex items-center justify-center p-4">
//       <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
//         {/* Header */}
//         <div className="flex items-center justify-between p-6 border-b border-gray-200">
//           <div>
//             <h2 className="text-xl font-bold text-gray-900">
//               Start Mock Interview
//             </h2>
//             <p className="text-sm text-gray-600 mt-1">
//               Choose your interview type and set up your session
//             </p>
//           </div>
//           <button
//             onClick={onClose}
//             className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//             disabled={isLoading}
//           >
//             <X size={20} className="text-gray-500" />
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="p-6 space-y-6">
//           {/* Interview Type Selector */}
//           <InterviewTypeSelector
//             selectedType={selectedType}
//             onTypeChange={setSelectedType}
//             isLoading={isLoading}
//           />

//           {/* Dynamic Setup Components */}
//           {selectedType === "general" && (
//             <GeneralRoleSetup
//               formData={generalFormData}
//               onFormDataChange={setGeneralFormData}
//               resumeFile={resumeFile}
//               useExistingResume={useExistingResume}
//               onResumeUpload={handleResumeUpload}
//               onUseExistingResume={handleUseExistingResume}
//               isLoading={isLoading}
//             />
//           )}

//           {selectedType === "upcoming" && (
//             <UpcomingJobSetup
//               formData={upcomingFormData}
//               onFormDataChange={setUpcomingFormData}
//               resumeFile={resumeFile}
//               useExistingResume={useExistingResume}
//               onResumeUpload={handleResumeUpload}
//               onUseExistingResume={handleUseExistingResume}
//               isLoading={isLoading}
//             />
//           )}

//           {selectedType === "ai-careers" && (
//             <AIEmergingCareersSetup
//               formData={aiFormData}
//               onFormDataChange={setAIFormData}
//               resumeFile={resumeFile}
//               useExistingResume={useExistingResume}
//               onResumeUpload={handleResumeUpload}
//               onUseExistingResume={handleUseExistingResume}
//               isLoading={isLoading}
//             />
//           )}

//           {/* Common Form Fields */}
//           <CommonFormFields
//             selectedType={selectedType}
//             generalFormData={generalFormData}
//             upcomingFormData={upcomingFormData}
//             aiFormData={aiFormData}
//             onGeneralFormDataChange={setGeneralFormData}
//             onUpcomingFormDataChange={setUpcomingFormData}
//             onAIFormDataChange={setAIFormData}
//             isLoading={isLoading}
//           />

//           {/* Error Message */}
//           {error && (
//             <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
//               <p className="text-red-700 text-sm">{error}</p>
//             </div>
//           )}

//           {/* Action Buttons */}
//           <div className="flex space-x-3 pt-4">
//             <button
//               type="button"
//               onClick={onClose}
//               className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
//               disabled={isLoading}
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
//               disabled={isLoading}
//             >
//               {isLoading ? (
//                 <>
//                   <Loader2 size={16} className="mr-2 animate-spin" />
//                   Starting Interview...
//                 </>
//               ) : (
//                 <>
//                   <Calendar size={16} className="mr-2" />
//                   Start New Interview
//                 </>
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { X, Loader2, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { getToken } from "@/app/utils/constants";
import InterviewTypeSelector from "./InterviewTypeSelector";
import GeneralRoleSetup from "./GeneralRoleSetup";
import UpcomingJobSetup from "./UpcomingJobSetup";
import AIEmergingCareersSetup from "./AIEmergingCareersSetup";
import CommonFormFields from "./CommonFormFields";
import { RecommendationOccupation } from "@/app/interfaces/interview";

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

export type InterviewType = "general" | "upcoming" | "ai-careers";

export interface GeneralFormData {
  occupationName: string;
  language: string;
  interviewFocus: string;
  duration: string;
  additionalFocusAreas: string;
}

export interface UpcomingFormData {
  jobDescription: string;
  companyDetails: string;
  language: string;
  interviewFocus: string;
  duration: string;
  jobLocation: string;
  interviewStage: string;
}

export interface AIFormData {
  selectedOccupation: string;
  recommendedOccupations: RecommendationOccupation[];
  language: string;
  interviewFocus: string;
  duration: string;
  additionalFocusAreas: string;
}

export default function StartInterviewModal({
  isOpen,
  onClose,
}: StartInterviewModalProps) {
  const [selectedType, setSelectedType] = useState<InterviewType>("general");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | React.ReactNode | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [useExistingResume, setUseExistingResume] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const token = getToken();
  const router = useRouter();

  // Form data states
  const [generalFormData, setGeneralFormData] = useState<GeneralFormData>({
    occupationName: "",
    language: "English",
    interviewFocus: "One interview focus (Default)",
    duration: "15",
    additionalFocusAreas: "",
  });

  const [upcomingFormData, setUpcomingFormData] = useState<UpcomingFormData>({
    jobDescription: "",
    companyDetails: "",
    language: "English",
    interviewFocus: "For all interview",
    duration: "15",
    jobLocation: "Calgary, 7th Road",
    interviewStage: "Complete Interview in One Go",
  });

  const [aiFormData, setAIFormData] = useState<AIFormData>({
    selectedOccupation: "",
    recommendedOccupations: [] as RecommendationOccupation[],
    language: "English",
    interviewFocus: "One interview focus (Default)",
    duration: "15",
    additionalFocusAreas: "",
  });

  const handleResumeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(file.type)) {
        setError("Please upload a PDF or Word document");
        return;
      }

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
      "One interview focus (Default)": "technical_skills_interview",
      "For all interview": "behavioral_interview",
    };

    return focusMapping[displayValue] || "technical_skills_interview";
  };

  const mapInterviewTypeToAPI = (type: InterviewType): string => {
    switch (type) {
      case "general":
        return "general";
      case "upcoming":
        return "job";
      case "ai-careers":
        return "general";
      default:
        return "general";
    }
  };

  const mapExperienceLevel = (occupation: string) => {
    console.log(occupation);
    return "mid";
  };

  const prepareAPIPayload = async () => {
    let currentFormData;
    let occupationName;

    const apiInterviewType = mapInterviewTypeToAPI(selectedType);

    switch (selectedType) {
      case "upcoming":
        currentFormData = upcomingFormData;
        occupationName = "Job Applicant";
        break;
      case "ai-careers":
        currentFormData = aiFormData;
        occupationName = aiFormData.selectedOccupation;
        break;
      default:
        currentFormData = generalFormData;
        occupationName = generalFormData.occupationName;
    }

    const basePayload = {
      interview_type: apiInterviewType,
      language: currentFormData.language,
      duration: currentFormData.duration,
      interview_focus: mapInterviewFocusToAPI(currentFormData.interviewFocus),
      use_existing_resume: useExistingResume,
    };

    // Add fields based on interview type
    if (apiInterviewType === "general") {
      // For general interviews: include occupation_name and experience_level
      return {
        ...basePayload,
        occupation_name: occupationName,
        experience_level: mapExperienceLevel(occupationName),
      };
    } else {
      // For job type interviews: include job_description, company_details, interview_stage
      let jobDescription = "";
      let companyDetails = "";
      let interviewStage = "";

      if (selectedType === "upcoming") {
        jobDescription = upcomingFormData.jobDescription;
        companyDetails =
          upcomingFormData.companyDetails || "Company details not provided";
        interviewStage = upcomingFormData.interviewStage;
      } else if (selectedType === "ai-careers") {
        jobDescription = `AI Emerging Careers interview for ${
          aiFormData.selectedOccupation
        } position. ${
          aiFormData.additionalFocusAreas
            ? `Focus areas: ${aiFormData.additionalFocusAreas}`
            : ""
        }`;
        companyDetails = "AI Emerging Careers practice session";
        interviewStage = "Skill Assessment";
      }

      return {
        ...basePayload,
        job_description: jobDescription,
        company_details: companyDetails,
        interview_stage: interviewStage,
      };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Show confirmation dialog first
    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    setIsLoading(true);

    try {
      // Validate required fields
      if (selectedType === "upcoming") {
        if (!upcomingFormData.jobDescription.trim()) {
          throw new Error("Job description is required");
        }
      } else if (selectedType === "ai-careers") {
        if (!aiFormData.selectedOccupation) {
          throw new Error("Please select an occupation");
        }
      } else {
        if (!generalFormData.occupationName) {
          throw new Error("Occupation name is required");
        }
      }

      const payload = await prepareAPIPayload();
      const formData = new FormData();

      Object.keys(payload).forEach((key) => {
        const value = payload[key as keyof typeof payload];
        formData.append(key, String(value));
      });

      if (resumeFile) {
        formData.append("cv_content", resumeFile);
      }

      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(
            `${key}: File(${value.name}, ${value.size} bytes, ${value.type})`
          );
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/interviews/start`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
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

      const errorMessage =
        error instanceof Error ? error.message : "Failed to start interview";

      if (
        errorMessage.includes("payment method") ||
        errorMessage.includes("Payment method")
      ) {
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
        setError(errorMessage);
      }
      setShowConfirmation(false); // Reset confirmation on error
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <InterviewTypeSelector
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            isLoading={isLoading}
          />

          {selectedType === "general" && (
            <GeneralRoleSetup
              formData={generalFormData}
              onFormDataChange={setGeneralFormData}
              resumeFile={resumeFile}
              useExistingResume={useExistingResume}
              onResumeUpload={handleResumeUpload}
              onUseExistingResume={handleUseExistingResume}
              isLoading={isLoading}
            />
          )}

          {selectedType === "upcoming" && (
            <UpcomingJobSetup
              formData={upcomingFormData}
              onFormDataChange={setUpcomingFormData}
              resumeFile={resumeFile}
              useExistingResume={useExistingResume}
              onResumeUpload={handleResumeUpload}
              onUseExistingResume={handleUseExistingResume}
              isLoading={isLoading}
            />
          )}

          {selectedType === "ai-careers" && (
            <AIEmergingCareersSetup
              formData={aiFormData}
              onFormDataChange={setAIFormData}
              resumeFile={resumeFile}
              useExistingResume={useExistingResume}
              onResumeUpload={handleResumeUpload}
              onUseExistingResume={handleUseExistingResume}
              isLoading={isLoading}
            />
          )}

          {/* Common Form Fields */}
          <CommonFormFields
            selectedType={selectedType}
            generalFormData={generalFormData}
            upcomingFormData={upcomingFormData}
            aiFormData={aiFormData}
            onGeneralFormDataChange={setGeneralFormData}
            onUpcomingFormDataChange={setUpcomingFormData}
            onAIFormDataChange={setAIFormData}
            isLoading={isLoading}
          />

          {/* Confirmation Dialog */}
          {showConfirmation && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">$</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-blue-900 mb-1">
                    Confirm Interview Creation
                  </h4>
                  <p className="text-sm text-blue-700 mb-3">
                    $5 will be deducted from your account to create this
                    interview session. Do you want to proceed?
                  </p>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowConfirmation(false)}
                      className="px-3 py-1.5 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Confirm & Proceed
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

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
              ) : showConfirmation ? (
                <>
                  <Calendar size={16} className="mr-2" />
                  Confirm Payment
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
