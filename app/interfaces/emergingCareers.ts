import { AIFormData } from "../components/startInterviewModal/StartInterviewModal";

export interface AIEmergingCareersSetupProps {
  formData: AIFormData;
  onFormDataChange: (data: AIFormData) => void;
  resumeFile: File | null;
  useExistingResume: boolean;
  onResumeUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onUseExistingResume: () => void;
  isLoading: boolean;
}

export interface Occupation {
  id: string;
  name: string;
  levelName: string;
}

export interface OccupationsResponse {
  success: boolean;
  data: {
    occupations: Occupation[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    meta: {
      totalOccupations: number;
      filteredCount: number;
    };
  };
}

export interface Tool {
  name: string;
  description: string;
  website: string;
  _id: string;
}

export interface AIEmergingOccupation {
  name: string;
  description: string;
  commonSkills: string[];
  definingSkills: string[];
  distinguishingSkills: string[];
  salaryBoostingSkills: string[];
  certifications: string[];
  job_demand: string;
  tools_and_technologies: Tool[];
  _id: string;
}

export interface AIEmergingCareersData {
  _id: string;
  occupationId: number;
  response: {
    top_3_similar_ai_emerging_occupations: AIEmergingOccupation[];
    top_3_lateral_ai_emerging_occupations: AIEmergingOccupation[];
    top_3_advance_ai_emerging_occupations: AIEmergingOccupation[];
  };
  createdAt: string;
  __v: number;
}

export interface RecommendationsResponse {
  success: boolean;
  data: AIEmergingCareersData;
}
