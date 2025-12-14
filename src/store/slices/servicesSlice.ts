import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { servicesService } from '../../services/django';

interface Service {
  id: string;
  slug: string;
  title_ar: string;
  title_en?: string;
  description_ar: string;
  description_en?: string;
  price: number;
  service_type: string;
  status: string;
  category?: any;
  owner?: any;
  governorate?: any;
  images?: any[];
  views_count?: number;
}

interface ServiceCategory {
  id: string;
  name_ar: string;
  name_en?: string;
  slug: string;
  icon?: string;
}

interface ServiceFilters {
  category?: string;
  governorate_id?: number;
  service_type?: string;
  min_price?: number;
  max_price?: number;
  search?: string;
  [key: string]: any;
}

interface ServicesState {
  services: Service[];
  categories: ServiceCategory[];
  featuredServices: Service[];
  currentService: Service | null;
  isLoading: boolean;
  error: string | null;
  filters: ServiceFilters;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
  };
}

const initialState: ServicesState = {
  services: [],
  categories: [],
  featuredServices: [],
  currentService: null,
  isLoading: false,
  error: null,
  filters: {},
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  },
};

export const fetchServices = createAsyncThunk(
  'services/fetchServices',
  async (params?: { page?: number; filters?: ServiceFilters }, { rejectWithValue }) => {
    try {
      const { data, error, pagination } = await servicesService.getServices({
        ...params?.filters,
        page: params?.page || 1,
      });

      if (error) {
        return rejectWithValue(error.message || 'فشل جلب الخدمات');
      }

      return {
        results: data,
        count: pagination?.total || 0,
        current_page: pagination?.page || 1,
        page_size: pagination?.limit || 20,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'فشل جلب الخدمات');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'services/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await servicesService.getCategories();
      if (error) {
        return rejectWithValue(error.message || 'فشل جلب الفئات');
      }
      return data || [];
    } catch (error: any) {
      return rejectWithValue(error.message || 'فشل جلب الفئات');
    }
  }
);

export const fetchFeaturedServices = createAsyncThunk(
  'services/fetchFeaturedServices',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await servicesService.getFeaturedServices();
      if (error) {
        return rejectWithValue(error.message || 'فشل جلب الخدمات المميزة');
      }
      return data || [];
    } catch (error: any) {
      return rejectWithValue(error.message || 'فشل جلب الخدمات المميزة');
    }
  }
);

export const fetchServiceBySlug = createAsyncThunk(
  'services/fetchServiceBySlug',
  async (slug: string, { rejectWithValue }) => {
    try {
      const { data, error } = await servicesService.getServiceBySlug(slug);
      if (error) {
        return rejectWithValue(error.message || 'فشل جلب تفاصيل الخدمة');
      }
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'فشل جلب تفاصيل الخدمة');
    }
  }
);

export const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<ServiceFilters>) => {
      state.filters = action.payload;
    },
    clearCurrentService: (state) => {
      state.currentService = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.services = action.payload.results || action.payload;
        if (action.payload.count !== undefined) {
          state.pagination = {
            currentPage: action.payload.current_page || 1,
            totalPages: Math.ceil(action.payload.count / (action.payload.page_size || 20)),
            totalCount: action.payload.count,
          };
        }
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      .addCase(fetchFeaturedServices.fulfilled, (state, action) => {
        state.featuredServices = action.payload;
      })
      .addCase(fetchServiceBySlug.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchServiceBySlug.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentService = action.payload;
      })
      .addCase(fetchServiceBySlug.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setFilters, clearCurrentService } = servicesSlice.actions;
export default servicesSlice.reducer;
