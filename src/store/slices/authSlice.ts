import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { User, LoginCredentials, RegisterData } from "../../types/auth";
import { authService, profileService } from "../../services/django";

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

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const { error } = await authService.signOut();
      if (error) {
        return rejectWithValue(error.message || "فشل تسجيل الخروج");
      }
    } catch (error: any) {
      return rejectWithValue(error.message || "فشل تسجيل الخروج");
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
        // تحديث localStorage أيضاً
        localStorage.setItem("user", JSON.stringify(state.user));
      }
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

export const { clearError, updateUser } = authSlice.actions;

export default authSlice.reducer;
