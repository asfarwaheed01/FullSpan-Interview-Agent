export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export interface LoginError {
  message?: string;
  status?: number;
  needsEmailVerification?: boolean;
}
