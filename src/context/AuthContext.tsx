// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import  instance  from '../axiosInstance/instance';
import { User, AuthContextType } from '../types';
import { toast } from 'react-toastify';
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const sendOTP = async (phoneNumber: string) => {
    try {
      const response = await instance.post('/send-otp/', { phoneNumber });
      return { success: true, message: response.data.message };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'فشل إرسال OTP' };
    }
  };

  const verifyPhone = async (phoneNumber: string, otp: string) => {
    try {
      const response = await instance.post('/verify-phone/', { phoneNumber, otp });
      return { success: true, message: response.data.message };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'فشل التحقق' };
    }
  };

  const login = async (phoneNumber: string, password: string) => {
    try {
      const response = await instance.post('/login/', { phoneNumber, password });
      const user = response.data;
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return { success: true, message: 'تم تسجيل الدخول بنجاح' };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'فشل تسجيل الدخول' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const register = async (userData: Partial<User>) => {
    try {
      console.log('Registering user:', userData);
  const response = await instance.post('/api/users/register/', userData);
  return { success: true, message: 'تم التسجيل بنجاح' };
} catch (error: any) {
  toast.error(error.response.data)
   console.log("Status:", error.response.data);
  console.error('Registration error:', error);
  return {
    success: false,
    message: error.response?.data?.message || 'حدث خطأ أثناء التسجيل',
  };   }
  };

  const updateProfile = async (userData: Partial<User>) => {
    if (!currentUser) return { success: false, message: 'يجب تسجيل الدخول' };

    try {
      const response = await instance.put('/update-profile/', userData);
      const updatedUser = response.data;
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      return { success: true, message: 'تم التحديث بنجاح' };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'خطأ أثناء التحديث' };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!currentUser) return { success: false, message: 'يجب تسجيل الدخول' };

    try {
      await instance.post('/change-password/', {
        currentPassword,
        newPassword
      });
      return { success: true, message: 'تم تغيير كلمة المرور بنجاح' };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'فشل تغيير كلمة المرور' };
    }
  };

  const value: AuthContextType = {
    currentUser,
    login,
    logout,
    register,
    verifyPhone,
    sendOTP,
    updateProfile,
    changePassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
