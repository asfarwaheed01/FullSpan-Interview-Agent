export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  avatar?: string | null;
  lastLogin?: Date | null;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  isFirstLogin?: boolean;
}
