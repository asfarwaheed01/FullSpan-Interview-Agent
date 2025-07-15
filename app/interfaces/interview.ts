export interface InterviewFormData {
  interviewType?: "general" | "upcoming" | "upskill";
  duration?: string; // Duration in minutes
  interview_id?: string;
  room_name?: string;
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

export interface TranscriptMessage {
  id: string;
  participant: string;
  text: string;
  timestamp: Date;
  isFinal: boolean;
}

export interface PartialTranscript {
  participant: string;
  text: string;
  lastUpdate: Date;
}

export interface InterviewRoomProps {
  interviewData: InterviewResponse;
  formData: InterviewFormData;
  onEndInterview: () => void;
}

export interface TranscriptionSegment {
  text: string;
  final: boolean;
}

export interface Participant {
  identity?: string;
  name?: string;
}

export interface TrackPublication {
  trackSid?: string;
}
