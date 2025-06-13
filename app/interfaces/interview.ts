// types/interview.ts
export interface InterviewFormData {
  candidate_name: string;
  candidate_details: string;
  job_description: string;
  company_details: string;
}

export interface InterviewResponse {
  access_token: string;
  wsUrl: string;
  room_name: string;
}

export interface ConnectionDetails {
  serverUrl: string;
  participantToken: string;
  roomName: string;
}

export type InterviewStep = "form" | "interview" | "completed";

export interface InterviewContext {
  currentStep: InterviewStep;
  interviewData: InterviewResponse | null;
  formData: InterviewFormData | null;
}
