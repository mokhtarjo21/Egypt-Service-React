import { apiClient } from '../api/client';
import toast from 'react-hot-toast';

interface Profile {
  id: string;
  phone_number: string;
  full_name: string;
  email?: string;
  profile_image?: string;
  bio_ar?: string;
  bio_en?: string;
  address_ar?: string;
  governorate?: any;
  role: string;
  status: string;
  is_phone_verified: boolean;
}

export const djangoProfileService = {
  async getCurrentProfile() {
    try {
      const response = await apiClient.get<Profile>('/accounts/profile/');

      localStorage.setItem('user', JSON.stringify(response.data));

      return { data: response.data, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: { message: error.response?.data?.message || 'Failed to fetch profile' },
      };
    }
  },

  async getProfileById(userId: string) {
    try {
      const response = await apiClient.get<Profile>(`/accounts/users/${userId}/`);
      return { data: response.data, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: { message: error.response?.data?.message || 'Failed to fetch profile' },
      };
    }
  },

  async updateProfile(updates: Partial<Profile>) {
    try {
      const response = await apiClient.patch<Profile>('/accounts/profile/update/', updates);

      localStorage.setItem('user', JSON.stringify(response.data));

      toast.success('تم تحديث الملف الشخصي بنجاح');
      return { data: response.data, error: null };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.message ||
                          'فشل تحديث الملف الشخصي';
      toast.error(errorMessage);
      return { data: null, error: { message: errorMessage } };
    }
  },

  async uploadProfileImage(file: File) {
    try {
      const formData = new FormData();
      formData.append('profile_image', file);

      const response = await apiClient.patch<Profile>('/accounts/profile/update/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      localStorage.setItem('user', JSON.stringify(response.data));

      toast.success('تم رفع الصورة بنجاح');
      return { data: response.data, error: null };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.message ||
                          'فشل رفع الصورة';
      toast.error(errorMessage);
      return { data: null, error: { message: errorMessage } };
    }
  },

  async uploadIDDocument(frontFile: File, backFile?: File) {
    try {
      const formData = new FormData();
      formData.append('id_document', frontFile);
      if (backFile) {
        formData.append('id_document_back', backFile);
      }

      const response = await apiClient.post('/accounts/id-document/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('تم رفع المستندات بنجاح');
      return { data: response.data, error: null };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.message ||
                          'فشل رفع المستندات';
      toast.error(errorMessage);
      return { data: null, error: { message: errorMessage } };
    }
  },
};

export default djangoProfileService;
