import React, { Suspense } from "react";
import InterviewPage from "../pages/InterviewPage/InterviewPage";
import { Loader2 } from "lucide-react";

const InterviewLoading = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <Loader2 size={40} className="animate-spin text-blue-600 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Loading interview...
      </h2>
      <p className="text-gray-600">
        Please wait while we prepare your session.
      </p>
    </div>
  </div>
);

const page = () => {
  return (
    <Suspense fallback={<InterviewLoading />}>
      <InterviewPage />
    </Suspense>
  );
};

export default page;
