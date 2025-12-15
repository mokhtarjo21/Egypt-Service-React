import { apiClient } from "./client";
import type {
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
} from "../../types/auth";
const API_BASE = import.meta.env?.VITE_API_BASE || "http://192.168.1.7:8000";

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post(
      API_BASE + "/accounts/auth/login/",
      credentials
    );
    return response.data;
  },

  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post(
      API_BASE + "/accounts/auth/register/",
      userData
    );
    return response.data;
  },

  async logout(refreshToken: string): Promise<void> {
    await apiClient.post(API_BASE + "/accounts/auth/logout/", {
      refresh: refreshToken,
    });
  },

  async getProfile(): Promise<User> {
    const response = await apiClient.get(API_BASE + "/accounts/profile/");
    return response.data;
  },

  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await apiClient.patch(
      API_BASE + "/accounts/profile/update/",
      userData
    );
    return response.data;
  },

  async refreshToken(refreshToken: string): Promise<{ access: string }> {
    const response = await apiClient.post(
      API_BASE + "/accounts/auth/refresh/",
      {
        refresh: refreshToken,
      }
    );
    return response.data;
  },

  async verifyEmail(): Promise<void> {
    await apiClient.post(API_BASE+"/accounts/verify/email/");
  },

  async verifyPhone(code: string): Promise<void> {
    await apiClient.post(API_BASE+"/accounts/verify/phone/", { code });
  },
};
