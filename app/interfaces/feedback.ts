export interface InterviewFocusFeedback {
  focus: string;
  score: number;
  comment: string;
}

export interface SoftSkillsFeedback {
  focus: string;
  score: number;
  comment: string;
}

export interface KeyAreaForDevelopment {
  area: string;
  observation: string;
  actionable_advice: string;
}

export interface ResumeAlignment {
  points_of_alignment: string[];
  points_of_contradiction: string[];
  recommendation: string;
}

export interface FeedbackData {
  overall_summary: string;
  key_strengths: string[];
  overall_weaknesses: string[];
  interview_focus_feedback: InterviewFocusFeedback[];
  soft_skills_feedback: SoftSkillsFeedback[];
  key_areas_for_development: KeyAreaForDevelopment[];
  resume_alignment: ResumeAlignment;
  actionable_feedback: string;
}

export interface Interview {
  _id: string;
  candidate_name: string;
  interview_type: string;
  duration: string;
  company_details: string;
  occupation_name: string;
  started_at: string;
}

export interface FeedbackResponse {
  _id: string;
  interviewId: Interview;
  userId: string;
  feedbackData: FeedbackData;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse {
  success: boolean;
  data: {
    feedback: FeedbackResponse;
  };
  message?: string;
}
