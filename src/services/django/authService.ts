import { apiClient } from "../api/client";
const API_BASE = (import.meta as any).env?.VITE_API_URL || "";

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
        API_BASE + "/accounts/auth/otp/verify/",
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
      const response = await apiClient.post(
        API_BASE + "/accounts/auth/login/",
        {
          phone_number: phoneNumber,
          password,
        }
      );

      // Check if 2FA is required
      if (response.data.requires_2fa) {
        return {
          data: { requires_2fa: true, temp_token: response.data.temp_token },
          error: null,
        };
      }

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

  async verify2FALogin(tempToken: string, code: string) {
    try {
      const response = await apiClient.post<AuthResponse>(
        API_BASE + "/accounts/auth/2fa/login/",
        { temp_token: tempToken, code }
      );
      const { user, tokens } = response.data;
      localStorage.setItem("access_token", tokens.access);
      localStorage.setItem("refresh_token", tokens.refresh);
      localStorage.setItem("user", JSON.stringify(user));
      return { data: { user, session: { access_token: tokens.access } }, error: null };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "رمز التحقق غير صحيح";
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
      await apiClient.post(API_BASE + "/accounts/auth/password/forgot/", {
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
        API_BASE + "/accounts/auth/password/reset/confirm/",
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
      await apiClient.post(API_BASE + "/accounts/profile/change-password/", {
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
      await apiClient.post(API_BASE + "/accounts/auth/otp/send/", {
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
  async requestPhoneChange(newPhoneNumber: string) {
    try {
      await apiClient.post(API_BASE + "/accounts/profile/change-phone/request/", {
        new_phone_number: newPhoneNumber,
      });

      return { error: null };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "فشل إرسال رمز التحقق للرقم الجديد";
      return { error: { message: errorMessage } };
    }
  },

  async verifyPhoneChange(newPhoneNumber: string, code: string) {
    try {
      const response = await apiClient.post<{ user: User }>(
        API_BASE + "/accounts/profile/change-phone/verify/",
        {
          new_phone_number: newPhoneNumber,
          code,
        }
      );

      // Update local storage user info
      if (response.data.user) {
         localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      return { data: response.data, error: null };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "فشل توثيق الرقم الجديد";
      return { data: null, error: { message: errorMessage } };
    }
  },
};

export default djangoAuthService;
