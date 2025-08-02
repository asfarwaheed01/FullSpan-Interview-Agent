export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  avatar?: string | null;
  lastLogin?: Date | null;
  isFirstLogin?: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  isFirstLogin?: boolean;
}

export interface LoginResponse {
  success: boolean;
  isFirstLogin?: boolean;
  user?: User;
  needsEmailVerification?: boolean;
  email?: string;
  message?: string;
}

export interface RegisterResponse {
  success: boolean;
  isFirstLogin?: boolean;
  user?: User;
  needsEmailVerification?: boolean;
  email?: string;
  message?: string;
}
