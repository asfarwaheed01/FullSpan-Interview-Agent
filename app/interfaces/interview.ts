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

export interface Interview {
  _id: string;
  candidate_name: string;
  occupation_name: string;
  company_details: string;
  interview_type: string;
  duration: string;
  status: string;
  started_at: string;
  ended_at?: string;
  actual_duration?: number;
  createdAt: string;
}

export interface InterviewStats {
  totalInterviews: number;
  completedInterviews: number;
  averageDuration: number;
  statusBreakdown: {
    [key: string]: number;
  };
}

export interface ApiResponse {
  success: boolean;
  data: {
    interviews: Interview[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface StatsResponse {
  success: boolean;
  data: InterviewStats;
}

export interface Pagination {
  page: number;
  pages: number;
  total: number;
  limit: number;
}

export interface InterviewContextType {
  // State
  interviews: Interview[];
  currentPage: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  statusFilter: string;

  // Actions
  fetchInterviews: (page?: number) => Promise<void>;
  setStatusFilter: (status: string) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  refreshInterviews: () => Promise<void>;
}

export interface RecommendationOccupation {
  id: string;
  name: string;
  ai_automation_risk_score: string;
  score: number;
  _id: string;
}
