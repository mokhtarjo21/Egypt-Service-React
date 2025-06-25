import React, { useEffect, useState } from 'react';
import { Users, FileText, CheckCircle, XCircle, Eye, Shield, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useServices } from '../context/ServiceContext';
import { PendingService } from './PendingService';
import {Userslist} from './users';
import {  User } from '../types';
import  instance  from '../axiosInstance/instance';
export function AdminDashboard() {
  
  const [activeTab, setActiveTab] = useState('overview');
 const [users, setAllUsers] = useState<User[]>([]);
   const { currentUser,totaluser } = useAuth();
   const pendingUsers = users.filter(u => u.verificationStatus === 'pending');
      const totalUsers = users.length;
      const verifiedUsers = users.filter(u => u.isVerified).length;

  
  
  const { services } = useServices();
  const pendingServices = services.filter(s => s.status === 'pending');
  const baseUrl = "https://web-production-98b70.up.railway.app"
  
 
  if (!currentUser?.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">غير مصرح لك</h2>
          <p className="text-gray-600">هذه الصفحة مخصصة للمديرين فقط</p>
        </div>
      </div>
    );
  }

 
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">لوحة الإدارة</h1>
          <p className="text-gray-600">إدارة المستخدمين والخدمات</p>
        </div>

        {/* Stats Cards */}
       

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                نظرة عامة
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                إدارة المستخدمين
              </button>
              <button
                onClick={() => setActiveTab('services')}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'services'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                مراجعة الخدمات
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">الأنشطة الأخيرة</h3>
                  <div className="space-y-3">
                    {pendingServices.slice(0, 5).map(service => (
                      <div key={service.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-md">
                        <div>
                          <p className="font-medium text-gray-900">{service.title}</p>
                          <p className="text-sm text-gray-500">بانتظار الموافقة من {service.user?.fullName}</p>
                        </div>
                        <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                          معلق
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">طلبات التحقق الجديدة</h3>
                  <div className="space-y-3">
                    {pendingUsers.slice(0, 5).map(user => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-md">
                        <div>
                          <p className="font-medium text-gray-900">{user.fullName}</p>
                          <p className="text-sm text-gray-500">{user.serviceType} - {user.phoneNumber}</p>
                        </div>
                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                          جديد
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
             <Userslist/>
            )}

            {activeTab === 'services' && (<PendingService/>)}
          </div>
        </div>

        {/* User Details Modal */}
       

       
      </div>
    </div>
  );
}