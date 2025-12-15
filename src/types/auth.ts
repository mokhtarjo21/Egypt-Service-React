export interface User {
  id: number;
  email: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  full_name: string;
  user_type: 'customer' | 'provider' | 'admin';
  avatar?: string;
  bio?: string;
  province?: {
    id: number;
    name_ar: string;
    name_en: string;
    code: string;
  };
  city?: {
    id: number;
    name_ar: string;
    name_en: string;
  };
  is_verified: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  date_joined: string;
}

export interface LoginCredentials {
  phone_number?: string;
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
  user_type: 'customer' | 'provider';
}

export interface AuthResponse {
  user: User;
  tokens: {
    access: string;
    refresh: string;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}