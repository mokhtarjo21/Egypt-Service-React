import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Phone, Briefcase, MapPin, FileText, Upload, Edit, Trash2, Eye, Clock, CheckCircle, XCircle, Lock, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useServices } from '../context/ServiceContext';
import { governorates, serviceTypes } from '../data/governorates';

export function Profile() {
  const { currentUser, updateProfile, changePassword } = useAuth();
  const { getUserServices, deleteService } = useServices();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [activeTab, setActiveTab] = useState('info');
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(location.state?.message || '');
  
  const [formData, setFormData] = useState({
    fullName: currentUser?.fullName || '',
    phoneNumber: currentUser?.phoneNumber || '',
    serviceType: currentUser?.serviceType || '',
    selectedGovernorates: currentUser?.governorates || [],
    selectedCenters: currentUser?.centers || [],
    bio: currentUser?.bio || '',
    idPhoto: null as File | null
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  const userServices = getUserServices(currentUser.id);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleGovernorateChange = (governorate: string) => {
    setFormData(prev => {
      const isSelected = prev.selectedGovernorates.includes(governorate);
      const newGovernorates = isSelected
        ? prev.selectedGovernorates.filter(g => g !== governorate)
        : [...prev.selectedGovernorates, governorate];
      
      return {
        ...prev,
        selectedGovernorates: newGovernorates,
        selectedCenters: []
      };
    });
  };

  const handleCenterChange = (center: string) => {
    setFormData(prev => {
      const isSelected = prev.selectedCenters.includes(center);
      const newCenters = isSelected
        ? prev.selectedCenters.filter(c => c !== center)
        : [...prev.selectedCenters, center];
      
      return { ...prev, selectedCenters: newCenters };
    });
  };

  const getAvailableCenters = () => {
    const centers: string[] = [];
    formData.selectedGovernorates.forEach(govName => {
      const gov = governorates.find(g => g.name === govName);
      if (gov) {
        centers.push(...gov.centers);
      }
    });
    return [...new Set(centers)];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, idPhoto: file }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const result = await updateProfile({
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        serviceType: formData.serviceType,
        governorates: formData.selectedGovernorates,
        centers: formData.selectedCenters,
        bio: formData.bio,
        idPhotoUrl: formData.idPhoto ? '/api/uploads/id-' + Date.now() + '.jpg' : currentUser.idPhotoUrl
      });
      
      if (result.success) {
        setIsEditing(false);
        setMessage('تم تحديث الملف الشخصي بنجاح');
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      setMessage('حدث خطأ أثناء التحديث');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('كلمة المرور الجديدة وتأكيدها غير متطابقتين');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setMessage('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    
    setLoading(true);
    try {
      const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
      if (result.success) {
        setMessage(result.message);
        setShowPasswordForm(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      setMessage('حدث خطأ أثناء تغيير كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = (serviceId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الخدمة؟')) {
      deleteService(serviceId);
      setMessage('تم حذف الخدمة بنجاح');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'قيد المراجعة';
      case 'approved':
        return 'مُوافق عليها';
      case 'rejected':
        return 'مرفوضة';
      default:
        return status;
    }
  };

  const getVerificationStatus = () => {
    if (!currentUser.isPhoneVerified) {
      return { color: 'text-red-600 bg-red-50', text: 'الهاتف غير مؤكد' };
    }
    
    switch (currentUser.verificationStatus) {
      case 'pending':
        return { color: 'text-yellow-600 bg-yellow-50', text: 'قيد المراجعة' };
      case 'approved':
        return { color: 'text-green-600 bg-green-50', text: 'موثق' };
      case 'rejected':
        return { color: 'text-red-600 bg-red-50', text: 'مرفوض' };
      default:
        return { color: 'text-gray-600 bg-gray-50', text: 'غير محدد' };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
            {message}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-l from-blue-600 to-blue-800 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-reverse space-x-4">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold">{currentUser.fullName.charAt(0)}</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{currentUser.fullName}</h1>
                  <p className="opacity-90">{currentUser.serviceType}</p>
                  <div className="flex items-center mt-1 space-x-reverse space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVerificationStatus().color}`}>
                      {getVerificationStatus().text}
                    </span>
                    {!currentUser.isPhoneVerified && (
                      <button
                        onClick={() => navigate('/verify-phone')}
                        className="text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded-full transition-colors"
                      >
                        تأكيد الهاتف
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-reverse space-x-2">
                <button
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-2 rounded-md transition-colors flex items-center text-sm"
                >
                  <Lock className="w-4 h-4 ml-1" />
                  كلمة المرور
                </button>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-md transition-colors flex items-center"
                >
                  <Edit className="w-4 h-4 ml-1" />
                  {isEditing ? 'إلغاء' : 'تعديل'}
                </button>
              </div>
            </div>
          </div>

          {/* Password Change Form */}
          {showPasswordForm && (
            <div className="border-b border-gray-200 p-6 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">تغيير كلمة المرور</h3>
              <form onSubmit={handlePasswordSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    كلمة المرور الحالية
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    required
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    كلمة المرور الجديدة
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    required
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    تأكيد كلمة المرور
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      name="confirmPassword"
                      required
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors disabled:opacity-50"
                    >
                      {loading ? 'جاري...' : 'حفظ'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('info')}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'info'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                معلومات الحساب
              </button>
              <button
                onClick={() => setActiveTab('services')}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'services'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                إدارة الخدمات ({userServices.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'info' && (
              <div className="space-y-6">
                {isEditing ? (
                  <form className="space-y-6">
                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="inline w-4 h-4 ml-1" />
                        الاسم الكامل
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                      />
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Phone className="inline w-4 h-4 ml-1" />
                        رقم الهاتف
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                        disabled
                      />
                      <p className="text-xs text-gray-500 mt-1">لا يمكن تغيير رقم الهاتف</p>
                    </div>

                    {/* Service Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Briefcase className="inline w-4 h-4 ml-1" />
                        نوع الخدمة
                      </label>
                      <select
                        name="serviceType"
                        value={formData.serviceType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                      >
                        {serviceTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    {/* Governorates */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MapPin className="inline w-4 h-4 ml-1" />
                        المحافظات التي تخدمها
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3">
                        {governorates.map(gov => (
                          <label key={gov.name} className="flex items-center space-x-reverse space-x-2 text-sm">
                            <input
                              type="checkbox"
                              checked={formData.selectedGovernorates.includes(gov.name)}
                              onChange={() => handleGovernorateChange(gov.name)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span>{gov.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Centers */}
                    {formData.selectedGovernorates.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          المراكز التي تخدمها
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3">
                          {getAvailableCenters().map(center => (
                            <label key={center} className="flex items-center space-x-reverse space-x-2 text-sm">
                              <input
                                type="checkbox"
                                checked={formData.selectedCenters.includes(center)}
                                onChange={() => handleCenterChange(center)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span>{center}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Bio */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FileText className="inline w-4 h-4 ml-1" />
                        نبذة عن خبرتك
                      </label>
                      <textarea
                        name="bio"
                        rows={4}
                        value={formData.bio}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                      />
                    </div>

                    {/* ID Photo Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Upload className="inline w-4 h-4 ml-1" />
                        تحديث صورة بطاقة الرقم القومي
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {currentUser.idPhotoUrl && (
                        <p className="text-xs text-green-600 mt-1">✓ تم رفع البطاقة سابقاً</p>
                      )}
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors disabled:opacity-50"
                      >
                        {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-md transition-colors"
                      >
                        إلغاء
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">الاسم الكامل</label>
                        <p className="text-gray-900">{currentUser.fullName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">رقم الهاتف</label>
                        <div className="flex items-center space-x-reverse space-x-2">
                          <p className="text-gray-900">{currentUser.phoneNumber}</p>
                          {currentUser.isPhoneVerified ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">نوع الخدمة</label>
                        <p className="text-gray-900">{currentUser.serviceType}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">المحافظات المخدومة</label>
                        <p className="text-gray-900">{currentUser.governorates.join('، ')}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">المراكز المخدومة</label>
                        <p className="text-gray-900">{currentUser.centers.join('، ')}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">حالة التحقق</label>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getVerificationStatus().color}`}>
                          {getVerificationStatus().text}
                        </span>
                      </div>
                    </div>
                    {currentUser.bio && (
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-500">نبذة عن الخبرة</label>
                        <p className="text-gray-900 mt-1">{currentUser.bio}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'services' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">إدارة الخدمات</h2>
                  <button
                    onClick={() => navigate('/add-service')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm flex items-center transition-colors"
                  >
                    <Plus className="w-4 h-4 ml-1" />
                    إضافة خدمة جديدة
                  </button>
                </div>

                {userServices.length > 0 ? (
                  <div className="space-y-4">
                    {userServices.map(service => (
                      <div key={service.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{service.title}</h3>
                            <p className="text-gray-600 text-sm mt-1 line-clamp-2">{service.description}</p>
                          </div>
                          <div className="flex items-center space-x-reverse space-x-2">
                            {getStatusIcon(service.status)}
                            <span className="text-sm">{getStatusText(service.status)}</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                          <div className="flex items-center space-x-reverse space-x-4">
                            <span className="font-medium text-green-600">{service.price} جنيه</span>
                            <span className="flex items-center">
                              <MapPin className="w-4 h-4 ml-1" />
                              {service.center}، {service.governorate}
                            </span>
                          </div>
                          <span>{new Date(service.createdAt).toLocaleDateString('ar-EG')}</span>
                        </div>
                        
                        <div className="flex justify-end space-x-reverse space-x-2">
                          <button className="text-blue-600 hover:text-blue-700 flex items-center text-sm">
                            <Eye className="w-4 h-4 ml-1" />
                            عرض
                          </button>
                          <button
                            onClick={() => handleDeleteService(service.id)}
                            className="text-red-600 hover:text-red-700 flex items-center text-sm"
                          >
                            <Trash2 className="w-4 h-4 ml-1" />
                            حذف
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Briefcase className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد خدمات</h3>
                    <p className="text-gray-500 mb-4">لم تقم بإضافة أي خدمات بعد</p>
                    <button
                      onClick={() => navigate('/add-service')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
                    >
                      أضف خدمتك الأولى
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}