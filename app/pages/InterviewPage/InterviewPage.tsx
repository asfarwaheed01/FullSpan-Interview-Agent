"use client";
import InterviewForm from "@/app/components/InterviewPage/InterviewForm";
import InterviewRoom from "@/app/components/InterviewPage/InterviewRoom";
import {
  InterviewFormData,
  InterviewResponse,
  InterviewStep,
} from "@/app/interfaces/interview";
import React, { useState } from "react";

const InterviewPage = () => {
  const [currentStep, setCurrentStep] = useState<InterviewStep>("form");
  const [interviewData, setInterviewData] = useState<InterviewResponse | null>(
    null
  );
  const [formData, setFormData] = useState<InterviewFormData | null>(null);

  const handleInterviewStart = (
    data: InterviewResponse,
    form: InterviewFormData
  ) => {
    setInterviewData(data);
    setFormData(form);
    setCurrentStep("interview");
  };

  const handleEndInterview = () => {
    setInterviewData(null);
    setFormData(null);
    setCurrentStep("form");
  };

  return (
    <>
      {currentStep === "form" && (
        <InterviewForm onInterviewStart={handleInterviewStart} />
      )}
      {currentStep === "interview" && interviewData && formData && (
        <InterviewRoom
          interviewData={interviewData}
          formData={formData}
          onEndInterview={handleEndInterview}
        />
      )}
    </>
  );
};

export default InterviewPage;
