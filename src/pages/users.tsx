import React, { useEffect, useState } from 'react';

import { Users, FileText, CheckCircle, XCircle, Eye, Shield, Settings } from 'lucide-react';
import { User } from '../types';

import instance from '../axiosInstance/instance';
import { useAuth } from '../context/AuthContext';
export function Userslist() {
    const baseUrl = "https://web-production-98b70.up.railway.app"
  const [users, setAllUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
    const { totaluser, setTotaluser } = useAuth();
  const usersPerPage = 10;
    const totalUsers = totaluser
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const access = localStorage.getItem('access');
      const params = new URLSearchParams({
        search: searchQuery,
        page: currentPage.toString(),
      });

      const response = await instance.get(`/api/users/list/?${params}`, {
        headers: { Authorization: `Bearer ${access}` },
      });
      setTotaluser(response.data.count);
      setAllUsers(response.data.results);
      setTotalPages(Math.ceil(response.data.count / usersPerPage));
    } catch (error) {
      console.error('Error fetching users:', error.response.data);
    } finally {
      setLoading(false);
    }
  };
  const pendingUsers = users.filter(u => u.verificationStatus === 'pending');
      
      const verifiedUsers = users.filter(u => u.isVerified).length;

   const handleUserAction = async (phoneNumber: string, verificationStatus: 'Approved' | 'Rejected') => {
    try {
         setLoading(true);
      const access = localStorage.getItem('access');
      const response = await instance.patch('/api/users/verify/', {
        phoneNumber,
        verificationStatus,
      }, {
        headers: {
          'Authorization': `Bearer ${access}`,
        },
      });
      fetchUsers();
     
    } catch (error) {
      console.error('Error updating user verification status:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, [searchQuery, currentPage]);

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when search changes
  }, [searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <>
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
                        <p className="text-sm font-medium text-gray-600">طلبات التحقق</p>
                        <p className="text-2xl font-bold text-orange-600">{pendingUsers.length}</p>
                      </div>
                      <Shield className="w-8 h-8 text-orange-600" />
                    </div>
                  </div>
                </div>
        
                  
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">جميع المستخدمين</h3>

      <div className="mb-4 flex gap-2 items-center">
        <input
          type="text"
          placeholder="ابحث بالاسم أو رقم الهاتف"
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-200 text-right"
        />
      </div>

      {loading ? (
        <div className="text-center p-6 text-blue-500 font-semibold">جاري تحميل المستخدمين...</div>
      ) : users.length === 0 ? (
        <div className="text-center p-6 text-gray-500 flex flex-col items-center">
          <FileText className="w-12 h-12 mb-2 text-gray-400" />
          لا يوجد مستخدمون مطابقون
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المستخدم</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">نوع الخدمة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاريخ التسجيل</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                      <div className="text-sm text-gray-500">{user.phoneNumber}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{user.serviceType}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        user.verificationStatus === 'approved' ? 'bg-green-100 text-green-800' :
                        user.verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {user.verificationStatus === 'approved' ? 'موثق' :
                        user.verificationStatus === 'pending' ? 'معلق' : 'مرفوض'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="px-6 py-4 text-sm">
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 space-x-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded ${
                    currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
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
                                // onError={(e) => {
                                //   e.currentTarget.src = 'https://images.pexels.com/photos/7887807/pexels-photo-7887807.jpeg?auto=compress&cs=tinysrgb&w=400';
                                // }}
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
                                // onError={(e) => {
                                //   e.currentTarget.src = 'https://images.pexels.com/photos/7887807/pexels-photo-7887807.jpeg?auto=compress&cs=tinysrgb&w=400';
                                // }}
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
                                // onError={(e) => {
                                //   e.currentTarget.src = 'https://images.pexels.com/photos/7887807/pexels-photo-7887807.jpeg?auto=compress&cs=tinysrgb&w=400';
                                // }}
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
      
    </div>
    </>
  );
}
