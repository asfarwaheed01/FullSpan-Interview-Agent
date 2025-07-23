export interface PersonalInfo {
  name: string;
  email: string;
  age: string;
  gender: string;
  country: string;
  userType: "professional" | "student";
  avatar: File | null;
  cv: File | null;
}

export interface ProfessionalInfo {
  professionalSummary: string;
  workExperience: string;
  keyProjects: string;
  education: string;
  certificates: File[];
}

export interface UserConfiguration {
  _id: string;
  userId: string;
  personalInfo: PersonalInfo;
  professionalInfo: ProfessionalInfo;
  isCompleted: boolean;
  completedAt: string;
  createdAt: string;
  updatedAt: string;
}
