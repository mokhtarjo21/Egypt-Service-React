import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { User, LoginCredentials, RegisterData } from "../../types/auth";
import { authService, profileService } from "../../services/django";
import { authApi } from "../../services/api/authApi";

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

// قراءة البيانات من localStorage عند بدء التطبيق
const initialState: AuthState = {
  user: localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")!)
    : null,
  token: localStorage.getItem("access_token") || null,
  refreshToken: localStorage.getItem("refresh_token") || null,
  isLoading: false,
  isAuthenticated: !!localStorage.getItem("access_token"),
  error: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const { data, error } = await authService.signIn(
        credentials.email || credentials.phone_number,
        credentials.password
      );

      if (error) {
        return rejectWithValue(error.message || "فشل تسجيل الدخول");
      }

      const { data: profile } = await profileService.getCurrentProfile();

      return {
        user: profile,
        session: data.session,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || "فشل تسجيل الدخول");
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const { data, error } = await authService.signUp(
        userData.email,
        userData.password,
        userData.full_name,
        userData.phone_number
      );

      if (error) {
        return rejectWithValue(error.message || "فشل التسجيل");
      }

      const { data: profile } = await profileService.getCurrentProfile();

      return {
        user: profile,
        session: data.session,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || "فشل التسجيل");
    }
  }
);

export const googleLoginUser = createAsyncThunk(
  "auth/googleLogin",
  async ({ idToken, role }: { idToken: string, role?: string }, { rejectWithValue }) => {
    try {
      const response = await authApi.googleLogin(idToken, role);

      if (!response.tokens) {
        return rejectWithValue("فشل تسجيل الدخول باستخدام Google");
      }

      return {
        user: response.user,
        session: {
          access_token: response.tokens.access,
          refresh_token: response.tokens.refresh,
        },
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "فشل تسجيل الدخول");
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
      
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      
      return null;
    } catch (error: any) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      return rejectWithValue(error.response?.data?.error || "فشل تسجيل الخروج");
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await profileService.getCurrentProfile();
      if (error) {
        return rejectWithValue(error.message || "فشل جلب الملف الشخصي");
      }
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || "فشل جلب الملف الشخصي");
    }
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.session?.access_token || null;
        state.refreshToken = action.payload.session?.refresh_token || null;
        state.error = null;

        // حفظ البيانات في localStorage
        localStorage.setItem("user", JSON.stringify(action.payload.user));
        if (action.payload.session?.access_token)
          localStorage.setItem(
            "access_token",
            action.payload.session.access_token
          );
        if (action.payload.session?.refresh_token)
          localStorage.setItem(
            "refresh_token",
            action.payload.session.refresh_token
          );
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      })

      // Google Login
      .addCase(googleLoginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(googleLoginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.session?.access_token || null;
        state.refreshToken = action.payload.session?.refresh_token || null;
        state.error = null;

        localStorage.setItem("user", JSON.stringify(action.payload.user));
        if (action.payload.session?.access_token)
          localStorage.setItem("access_token", action.payload.session.access_token);
        if (action.payload.session?.refresh_token)
          localStorage.setItem("refresh_token", action.payload.session.refresh_token);
      })
      .addCase(googleLoginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      })

      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.session?.access_token || null;
        state.refreshToken = action.payload.session?.refresh_token || null;
        state.error = null;

        // حفظ البيانات في localStorage
        localStorage.setItem("user", JSON.stringify(action.payload.user));
        if (action.payload.session?.access_token)
          localStorage.setItem(
            "access_token",
            action.payload.session.access_token
          );
        if (action.payload.session?.refresh_token)
          localStorage.setItem(
            "refresh_token",
            action.payload.session.refresh_token
          );
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;

        localStorage.removeItem("user");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      })

      // Fetch Profile
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        // تحديث localStorage
        localStorage.setItem("user", JSON.stringify(action.payload));
      });
  },
});

export const { clearError, updateUser, setUser } = authSlice.actions;

export default authSlice.reducer;
