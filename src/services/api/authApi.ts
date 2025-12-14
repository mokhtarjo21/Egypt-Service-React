import { apiClient } from './client';
import type { User, LoginCredentials, RegisterData, AuthResponse } from '../../types/auth';

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post('/accounts/auth/login/', credentials);
    return response.data;
  },

  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post('/accounts/auth/register/', userData);
    return response.data;
  },

  async logout(refreshToken: string): Promise<void> {
    await apiClient.post('/accounts/auth/logout/', { refresh: refreshToken });
  },

  async getProfile(): Promise<User> {
    const response = await apiClient.get('/accounts/profile/');
    return response.data;
  },

  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await apiClient.patch('/accounts/profile/update/', userData);
    return response.data;
  },

  async refreshToken(refreshToken: string): Promise<{ access: string }> {
    const response = await apiClient.post('/accounts/auth/refresh/', {
      refresh: refreshToken,
    });
    return response.data;
  },

  async verifyEmail(): Promise<void> {
    await apiClient.post('/accounts/verify/email/');
  },

  async verifyPhone(code: string): Promise<void> {
    await apiClient.post('/accounts/verify/phone/', { code });
  },
};