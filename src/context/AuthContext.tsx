// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import  instance  from '../axiosInstance/instance';
import { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
   useEffect(() => {
   
  const refresh = localStorage.getItem('refresh');

    const frefresh = async () => {
    try {
      const response = await instance.post('/api/users/token/refresh/',{ refresh });
      const user = response.data;
     
      localStorage.setItem('access', user.access);
      
      
    } catch (error: any) {
      console.error('Refresh token error:', error.response?.data);
      if (error.response?.status === 401) {
        // If refresh token is invalid, clear local storage
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
      }
    }
  };
  frefresh();
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

const [totaluser, setTotaluser] = useState(0);

  const sendOTP = async (phoneNumber: string) => {
    try {
      const response = await instance.post('/api/users/send-otp/', { phoneNumber });
      return { success: true, message: response.data.message };
    } catch (error: any) {
      console.log('Send OTP error:', error.response.data);
      return { success: false, message: error.response?.data?.message || 'فشل إرسال OTP' };
    }
  };
  const sendOTPforpass = async (phoneNumber: string) => {
    try {
      const response = await instance.post('/api/users/send-otp-reset-pass/', { phoneNumber });
      return { success: true, message: response.data.message };
    } catch (error: any) {
      console.log('Send OTP error:', error.response.data);
      return { success: false, message: error.response?.data?.message || 'فشل إرسال OTP' };
    }
  };

  const verifyPhone = async (phoneNumber: string, otp: string) => {
    try {
      const response = await instance.post('/api/users/verify-phone/', { phoneNumber, otp });
      return { success: true, message: response.data.message };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'فشل التحقق' };
    }
  };

   const resetpasswort = async (phoneNumber: string, otp: string,newPassword:string) => {
    try {
      const response = await instance.post('/api/users/reset-password/', { phoneNumber, otp,newPassword });
      return { success: true, message: response.data.message };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'فشل التحقق' };
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await instance.post('/api/users/login/', { username, password });
      const user = response.data;
     
      localStorage.setItem('access', user.access);
      localStorage.setItem('refresh', user.refresh);
        
      setCurrentUser(user.user);
      localStorage.setItem('currentUser', JSON.stringify(user.user));

      return { success: true, message: 'تم تسجيل الدخول بنجاح' };
    } catch (error: any) {
      console.error('Login error:', error.response.data);
      return { success: false, message: error.response?.data?.message || 'فشل تسجيل الدخول' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    const sublogout = async () => {
    const refresh = localStorage.getItem("refresh");
   const access =localStorage.getItem('access')
      const response = await instance.post("/api/users/logout",
        { refresh },
       { headers: {
    'Authorization': `Bearer ${access}`, 
        'Content-Type': 'multipart/form-data',
      }},
        
      );}
      sublogout();
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      
    localStorage.removeItem('currentUser');
  };

  const register = async (userData: Partial<User>) => {
    try {
      console.log('Registering user:', userData);
  const response = await instance.post('/api/users/register/', userData
      ,{ headers: {
    'Content-Type': 'multipart/form-data',
      } }
  );
  return { success: true, message: 'تم التسجيل بنجاح' };
} catch (error: any) {
  
   
  console.log('Registration error:', error.response.data);
  return {
    success: false,
    message: error.response.data.phoneNumber[0]? "رقم الهاتف مسجل بالفعل" : 'حدث خطأ أثناء التسجيل',
  };   }
  };

  const updateProfile = async (userData: Partial<User>) => {
    if (!currentUser) return { success: false, message: 'يجب تسجيل الدخول' };

    try {
      console.log('Updating profile with data:', userData);
      const access =localStorage.getItem('access')
      const response = await instance.patch('/api/users/update-profile/', userData,
          { headers: {
    'Authorization': `Bearer ${access}`, 
        'Content-Type': 'multipart/form-data',
      }}
       );
      const updatedUser = response.data;
      console.log('Updated user:', updatedUser);
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      return { success: true, message: 'تم التحديث بنجاح' };
    } catch (error: any) {
      console.error('Update profile error:', error.response.data);
      return { success: false, message: error.response?.data?.message || 'خطأ أثناء التحديث' };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!currentUser) return { success: false, message: 'يجب تسجيل الدخول' };
    const access =localStorage.getItem('access')
    try {
      await instance.post('/api/users/change-password/', {
        currentPassword,
        newPassword
      },{ headers: {
    'Authorization': `Bearer ${access}`, 
        'Content-Type': 'multipart/form-data',
      }});
      return { success: true, message: 'تم تغيير كلمة المرور بنجاح' };
    } catch (error: any) {
      console.error('Change password error:', error.response.data);
      return { success: false, message: error.response?.data?.message || 'فشل تغيير كلمة المرور' };
    }
  };

  const value: AuthContextType = {
    currentUser,
    totaluser,
    setTotaluser,
    login,
    logout,
    register,
    verifyPhone,
    resetpasswort,
    sendOTP,
   sendOTPforpass,
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
