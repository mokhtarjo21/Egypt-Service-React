export interface User {
  id: string;
  fullName: string;
  phoneNumber: string;
  password: string;
  serviceType: string;
  governorates: string[];
  centers: string[];
  bio: string;
  idPhotoUrl?: string;
  isVerified: boolean;
  isPhoneVerified: boolean;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  isAdmin: boolean;
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export interface Service {
  id: string;
  userId: string;
  title: string;
  description: string;
  price: number;
  governorate: string;
  center: string;
  images: string[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  user?: User;
}

export interface AuthContextType {
  currentUser: User | null;
  setTotaluser: (total: number) => void;
  login: (phoneNumber: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  totaluser: number;
  register: (userData: Partial<User>) => Promise<{ success: boolean; message: string }>;
  resetpasswort: (phoneNumber: string, otp: string, newPassword:string) => Promise<{ success: boolean; message: string }>;
  verifyPhone: (phoneNumber: string, otp: string) => Promise<{ success: boolean; message: string }>;
  sendOTP: (phoneNumber: string) => Promise<{ success: boolean; message: string }>;
  sendOTPforpass: (phoneNumber: string) => Promise<{ success: boolean; message: string }>;
  updateProfile: (userData: Partial<User>) => Promise<{ success: boolean; message: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
}

export interface Governorate {
  name: string;
  centers: string[];
}

export interface OTPSession {
  phoneNumber: string;
  otp: string;
  expiresAt: Date;
  attempts: number;
}