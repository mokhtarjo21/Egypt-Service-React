import { apiClient } from "../api/client";
import toast from "react-hot-toast";
const API_BASE = import.meta.env?.VITE_API_BASE ||"";

interface AuthTokens {
  access: string;
  refresh: string;
}

interface User {
  id: string;
  phone_number: string;
  full_name: string;
  email?: string;
  role: string;
  status: string;
  is_phone_verified: boolean;
  profile_image?: string;
  governorate?: any;
}

interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export const djangoAuthService = {
  async signUp(
    phoneNumber: string,
    password: string,
    fullName: string,
    email?: string
  ) {
    try {
      const response = await apiClient.post(
        API_BASE + "/accounts/auth/register/",
        {
          phone_number: phoneNumber,
          password,
          password2: password,
          full_name: fullName,
          email: email || "",
        }
      );

      return {
        data: {
          user: response.data,
          session: null,
        },
        error: null,
      };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "فشل التسجيل";
      return { data: null, error: { message: errorMessage } };
    }
  },

  async verifyOTP(
    phoneNumber: string,
    code: string,
    purpose: string = "registration"
  ) {
    try {
      const response = await apiClient.post<AuthResponse>(

        API_BASE + "/accounts/auth/verify-otp/",
        {
          phone_number: phoneNumber,
          code,
          purpose,
        }
      );

      const { user, tokens } = response.data;

      localStorage.setItem("access_token", tokens.access);
      localStorage.setItem("refresh_token", tokens.refresh);
      localStorage.setItem("user", JSON.stringify(user));

      return {
        data: { user, session: { access_token: tokens.access } },
        error: null,
      };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "فشل التحقق";
      return { data: null, error: { message: errorMessage } };
    }
  },

  async signIn(phoneNumber: string, password: string) {
    try {
      const response = await apiClient.post<AuthResponse>(
        API_BASE + "/accounts/auth/login/",
        {
          phone_number: phoneNumber,
          password,
        }
      );

      const { user, tokens } = response.data;

      localStorage.setItem("access_token", tokens.access);
      localStorage.setItem("refresh_token", tokens.refresh);
      localStorage.setItem("user", JSON.stringify(user));

      return {
        data: { user, session: { access_token: tokens.access } },
        error: null,
      };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "فشل تسجيل الدخول";
      return { data: null, error: { message: errorMessage } };
    }
  },

  async signOut() {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        await apiClient.post(API_BASE + "/accounts/auth/logout/", {
          refresh: refreshToken,
        });
      }

      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");

      return { error: null };
    } catch (error: any) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");

      return { error: { message: "Logout failed" } };
    }
  },

  async resetPassword(phoneNumber: string) {
    try {
      await apiClient.post(API_BASE + "/accounts/auth/password-reset/", {
        phone_number: phoneNumber,
      });

      return { error: null };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "فشل إرسال رمز التحقق";
      return { error: { message: errorMessage } };
    }
  },

  async confirmPasswordReset(
    phoneNumber: string,
    code: string,
    newPassword: string
  ) {
    try {
      await apiClient.post(
        API_BASE + "/accounts/auth/password-reset-confirm/",
        {
          phone_number: phoneNumber,
          code,
          new_password: newPassword,
        }
      );

      return { error: null };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "فشل تغيير كلمة المرور";
      return { error: { message: errorMessage } };
    }
  },

  async updatePassword(currentPassword: string, newPassword: string) {
    try {
      await apiClient.post(API_BASE + "/accounts/auth/change-password/", {
        old_password: currentPassword,
        new_password: newPassword,
      });

      return { error: null };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "فشل تحديث كلمة المرور";
      return { error: { message: errorMessage } };
    }
  },

  async getSession() {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      return {
        session: { access_token: accessToken },
        error: null,
      };
    }
    return { session: null, error: null };
  },

  async getUser() {
    try {
      const userString = localStorage.getItem("user");
      if (!userString) {
        return { user: null, error: { message: "No user logged in" } };
      }

      const response = await apiClient.get<User>(
        API_BASE + "/accounts/profile/"
      );
      const user = response.data;

      localStorage.setItem("user", JSON.stringify(user));

      return { user, error: null };
    } catch (error: any) {
      const userString = localStorage.getItem("user");
      if (userString) {
        const cachedUser = JSON.parse(userString);
        return { user: cachedUser, error: null };
      }
      return { user: null, error: { message: "Failed to fetch user" } };
    }
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    const checkAuth = async () => {
      const { session } = await this.getSession();
      if (session) {
        callback("SIGNED_IN", session);
      } else {
        callback("SIGNED_OUT", null);
      }
    };

    checkAuth();

    const interval = setInterval(checkAuth, 60000);

    return {
      data: {
        subscription: {
          unsubscribe: () => clearInterval(interval),
        },
      },
    };
  },

  async resendOTP(phoneNumber: string, purpose: string = "registration") {
    try {
      await apiClient.post(API_BASE + "/accounts/auth/send-otp/", {
        phone_number: phoneNumber,
        purpose,
      });

      return { error: null };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "فشل إرسال رمز التحقق";
      return { error: { message: errorMessage } };
    }
  },
};

export default djangoAuthService;
