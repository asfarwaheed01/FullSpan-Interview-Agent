export interface ApiPersonalInfo {
  name: string;
  email: string;
  age: string;
  gender: string;
  country: string;
  userType: "professional" | "student";
  avatar?: string | null;
  cv?: string | null;
}

export interface ApiProfessionalInfo {
  professionalSummary?: string;
  workExperience: string;
  keyProjects?: string;
  education: string;
  certificates: string[];
}

export interface ApiUserConfiguration {
  _id: string;
  userId: string;
  personalInfo: ApiPersonalInfo;
  professionalInfo: ApiProfessionalInfo;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}
