import React, { useEffect, useState } from 'react';
import { Users, FileText, CheckCircle, XCircle, Eye, Shield, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useServices } from '../context/ServiceContext';
import { Service, User } from '../types';
import  instance  from '../axiosInstance/instance';
export function AdminDashboard() {
  const { currentUser } = useAuth();
  const [users, setAllUsers] = useState<User[]>([]);
  if (!users) return <div>Loading...</div>; 
  const { services, updateServiceStatus } = useServices();
  console.log('Services in AdminDashboard:', services);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const handleUserAction = async (phoneNumber: string, verificationStatus: 'Approved' | 'Rejected') => {
    try {
      const access = localStorage.getItem('access');
      const response = await instance.patch('/api/users/verify/', {
        phoneNumber,
        verificationStatus,
      }, {
        headers: {
          'Authorization': `Bearer ${access}`,
        },
      });
      console.log('User action response:', response.data);
      setAllUsers(response.data);
    } catch (error) {
      console.error('Error updating user verification status:', error);
    }
  }
  useEffect(() => {
    const fetchAllUsers = async () => {
    try {
      const access = localStorage.getItem('access');
      const response = await instance.get('/api/users/all/', {
        headers: {
          'Authorization': `Bearer ${access}`,
        },
      });
      setAllUsers(response.data);
      console.log('Fetched all users:', response.data);
    } catch (error) {
      console.error('Error fetching all users:', error);
    }
  };
    fetchAllUsers();
  }
  , []);
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
  const pendingServices = services.filter(s => s.status === 'pending');
  const pendingUsers = users.filter(u => u.verificationStatus === 'pending');
  const totalUsers = users.length;
  const verifiedUsers = users.filter(u => u.isVerified).length;

  const handleServiceAction = (serviceId: string, action: 'approved' | 'rejected') => {
    updateServiceStatus(serviceId, action);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">لوحة الإدارة</h1>
          <p className="text-gray-600">إدارة المستخدمين والخدمات</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي المستخدمين</p>
                <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">المستخدمون الموثوقون</p>
                <p className="text-2xl font-bold text-green-600">{verifiedUsers}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">الخدمات المعلقة</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingServices.length}</p>
              </div>
              <FileText className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">طلبات التحقق</p>
                <p className="text-2xl font-bold text-orange-600">{pendingUsers.length}</p>
              </div>
              <Shield className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

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
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">جميع المستخدمين</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          المستخدم
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          نوع الخدمة
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الحالة
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          تاريخ التسجيل
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          إجراءات
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {users.filter(u => !u.isAdmin).map(user => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                              <div className="text-sm text-gray-500">{user.phoneNumber}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.serviceType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.verificationStatus === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : user.verificationStatus === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.verificationStatus === 'approved' ? 'موثق' : 
                               user.verificationStatus === 'pending' ? 'معلق' : 'مرفوض'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString('ar-EG')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            
                            <button
                              onClick={() => setSelectedUser(user)}
                              className="text-blue-600 hover:text-blue-900 flex items-center"
                            >
                              <Eye className="w-4 h-4 ml-1" />
                              عرض
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'services' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">الخدمات المعلقة</h3>
                <div className="space-y-4">
                  {pendingServices.map(service => (
                    <div key={service.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{service.title}</h4>
                          <p className="text-gray-600 mt-1">{service.description}</p>
                          <div className="flex items-center mt-2 text-sm text-gray-500">
                            <span>{service.price} جنيه</span>
                            <span className="mx-2">•</span>
                            <span>{service.center}، {service.governorate}</span>
                            <span className="mx-2">•</span>
                            <span>بواسطة {service.user?.fullName}</span>
                          </div>
                        </div>
                        <div className="flex space-x-reverse space-x-2">
                          <button
                            onClick={() => handleServiceAction(service.id, 'Approved')}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm flex items-center transition-colors"
                          >
                            <CheckCircle className="w-4 h-4 ml-1" />
                            موافقة
                          </button>
                          <button
                            onClick={() => handleServiceAction(service.id, 'Rejected')}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm flex items-center transition-colors"
                          >
                            <XCircle className="w-4 h-4 ml-1" />
                            رفض
                          </button>
                          <button
                            onClick={() => setSelectedService(service)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm flex items-center transition-colors"
                          >
                            <Eye className="w-4 h-4 ml-1" />
                            عرض
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {pendingServices.length === 0 && (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">لا توجد خدمات معلقة للمراجعة</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User Details Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">تفاصيل المستخدم</h2>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">الاسم</label>
                      <p className="text-gray-900">{selectedUser.fullName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">الهاتف</label>
                      <p className="text-gray-900">{selectedUser.phoneNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">نوع الخدمة</label>
                      <p className="text-gray-900">{selectedUser.serviceType}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">حالة التحقق</label>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        selectedUser.verificationStatus === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : selectedUser.verificationStatus === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedUser.verificationStatus === 'approved' ? 'موثق' : 
                         selectedUser.verificationStatus === 'pending' ? 'معلق' : 'مرفوض'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">المحافظات المخدومة</label>
                    <p className="text-gray-900">{selectedUser.governorates.join('، ')}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">المراكز المخدومة</label>
                    <p className="text-gray-900">{selectedUser.centers.join('، ')}</p>
                  </div>

                  {selectedUser.bio && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">نبذة عن الخبرة</label>
                      <p className="text-gray-900">{selectedUser.bio}</p>
                    </div>
                  )}

                  {selectedUser.idPhotoUrl && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">صورة البطاقة الشخصية</label>
                      <div className="mt-2">
                        <img
                          src={`${baseUrl}${selectedUser.idPhotoUrl}`  }
                          alt="البطاقة الشخصية"
                          className="w-full max-w-md h-48 object-cover rounded-md border"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.pexels.com/photos/7887807/pexels-photo-7887807.jpeg?auto=compress&cs=tinysrgb&w=400';
                          }}
                        />
                      </div>
                      
                    </div>
                  )}
                  {selectedUser.idfPhotoUrl && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">صورة الخلفية البطاقة الشخصية</label>
                      <div className="mt-2">
                        <img
                          src={`${baseUrl}${selectedUser.idfPhotoUrl}`  || 'https://images.pexels.com/photos/7887807/pexels-photo-7887807.jpeg?auto=compress&cs=tinysrgb&w=400'}
                          alt="البطاقة الشخصية"
                          className="w-full max-w-md h-48 object-cover rounded-md border"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.pexels.com/photos/7887807/pexels-photo-7887807.jpeg?auto=compress&cs=tinysrgb&w=400';
                          }}
                        />
                      </div>
                      
                    </div>
                  )}
                  {selectedUser.iduserPhotoUrl && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">صورة المستخدم مع البطاقة البطاقة الشخصية</label>
                      <div className="mt-2">
                        <img
                          src={`${baseUrl}${selectedUser.iduserPhotoUrl}`  || 'https://images.pexels.com/photos/7887807/pexels-photo-7887807.jpeg?auto=compress&cs=tinysrgb&w=400'}
                          alt="البطاقة الشخصية"
                          className="w-full max-w-md h-48 object-cover rounded-md border"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.pexels.com/photos/7887807/pexels-photo-7887807.jpeg?auto=compress&cs=tinysrgb&w=400';
                          }}
                        />
                      </div>
                      
                    </div>
                  )}
                </div>
                <div className="flex space-x-reverse space-x-4 pt-4">
                    <button
                      onClick={() => {
                        handleUserAction(selectedUser.phoneNumber, 'Approved');
                        setSelectedUser(null);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center transition-colors"
                    >
                      <CheckCircle className="w-4 h-4 ml-1" />
                      موافقة
                    </button>
                    <button
                      onClick={() => {
                        handleUserAction(selectedUser.phoneNumber, 'Rejected');
                        setSelectedUser(null);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center transition-colors"
                    >
                      <XCircle className="w-4 h-4 ml-1" />
                      رفض
                    </button>
                    </div>
              </div>
            </div>
          </div>
        )}

        {/* Service Details Modal */}
        {selectedService && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">تفاصيل الخدمة</h2>
                  <button
                    onClick={() => setSelectedService(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedService.title}</h3>
                    <p className="text-gray-600 mt-2">{selectedService.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">السعر</label>
                      <p className="text-gray-900">{selectedService.price} جنيه</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">الموقع</label>
                      <p className="text-gray-900">{selectedService.center}، {selectedService.governorate}</p>
                    </div>
                  </div>

                  {selectedService.user && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">مقدم الخدمة</label>
                      <p className="text-gray-900">{selectedService.user.fullName} - {selectedService.user.phoneNumber}</p>
                    </div>
                  )}

                  {selectedService.images.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">صور الخدمة</label>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        {selectedService.images.map((image, index) => (
                          <img
                            key={index}
                            src={`${baseUrl}/${image}` || 'https://images.pexels.com/photos/4792509/pexels-photo-4792509.jpeg?auto=compress&cs=tinysrgb&w=400'}
                            alt={`صورة ${index + 1}`}
                            className="w-full h-32 object-cover rounded-md"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.pexels.com/photos/4792509/pexels-photo-4792509.jpeg?auto=compress&cs=tinysrgb&w=400';
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-reverse space-x-4 pt-4">
                    <button
                      onClick={() => {
                        handleServiceAction(selectedService.id, 'Approved');
                        setSelectedService(null);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center transition-colors"
                    >
                      <CheckCircle className="w-4 h-4 ml-1" />
                      موافقة
                    </button>
                    <button
                      onClick={() => {
                        handleServiceAction(selectedService.id, 'Rejected');
                        setSelectedService(null);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center transition-colors"
                    >
                      <XCircle className="w-4 h-4 ml-1" />
                      رفض
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}