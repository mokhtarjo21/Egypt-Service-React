import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Phone, Briefcase, MapPin, FileText, Upload, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { governorates, serviceTypes } from '../../data/governorates';
import 'bootstrap/dist/css/bootstrap.min.css';
import { toast } from 'react-toastify';
export function RegisterForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    serviceType: '',
    selectedGovernorates: [] as string[],
    selectedCenters: [] as string[],
    bio: '',
    idPhoto: null as File | null,
    idfPhoto: null as File | null,
    iduserPhotoUrl: null as File | null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, idPhoto: file }));
    }
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

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      return 'يرجى إدخال الاسم الكامل';
    }
    if (!formData.phoneNumber.trim()) {
      return 'يرجى إدخال رقم الهاتف';
    }
    if (!/^01[0-9]{9}$/.test(formData.phoneNumber)) {
      return 'رقم الهاتف غير صحيح (يجب أن يبدأ بـ 01 ويتكون من 11 رقم)';
    }
    if (!formData.password) {
      return 'يرجى إدخال كلمة المرور';
    }
    if (formData.password.length < 6) {
      return 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }
    if (formData.password !== formData.confirmPassword) {
      return 'كلمة المرور وتأكيدها غير متطابقتين';
    }
    if (!formData.serviceType) {
      return 'يرجى اختيار نوع الخدمة';
    }
    if (formData.selectedGovernorates.length === 0) {
      return 'يرجى اختيار محافظة واحدة على الأقل';
    }
    if (formData.selectedCenters.length === 0) {
      return 'يرجى اختيار مركز واحد على الأقل';
    }
    if (formData.idPhoto === null) {
      return 'يرجى تحميل صورة بطاقة الرقم القومي';
    }
    if (formData.idfPhoto === null) {
      return 'يرجى تحميل صورة بطاقة الوجة الخلفي';
    }
    if (formData.iduserPhotoUrl === null) {
      return 'يرجى تحميل صورة شخصية لك وانت تحمل البطاقة الخاصة بك';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const validationError = validateForm();
    if (validationError) {
      setMessage({ type: 'error', text: validationError });
      setLoading(false);
      return;
    }

    try {
      const result = await register({
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        password: formData.password,
        serviceType: formData.serviceType,
        governorates: formData.selectedGovernorates,
        centers: formData.selectedCenters,
        bio: formData.bio.trim(),
        idPhotoUrl: formData.idPhoto ,
        idfPhotoUrl: formData.idfPhoto,
        iduserPhotoUrl: formData.iduserPhotoUrl });

      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        setTimeout(() => navigate('/verify-phone',{state: { phoneNumber1: formData.phoneNumber.trim()}}), 2000);
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
     
      setMessage({ type: 'error', text: 'حدث خطأ أثناء التسجيل'});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">إنشاء حساب جديد</h2>
            <p className="mt-2 text-gray-600">أنشئ حسابك لبدء تقديم الخدمات</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline w-4 h-4 ml-1" />
                الاسم الكامل *
              </label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                placeholder="أدخل اسمك الكامل"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="inline w-4 h-4 ml-1" />
                رقم الهاتف *
              </label>
              <input
                type="tel"
                name="phoneNumber"
                required
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                placeholder="01xxxxxxxxx"
              />
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="inline w-4 h-4 ml-1" />
                  كلمة المرور *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                    placeholder="أدخل كلمة المرور"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 left-0 pl-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تأكيد كلمة المرور *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                    placeholder="أعد إدخال كلمة المرور"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 left-0 pl-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Service Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Briefcase className="inline w-4 h-4 ml-1" />
                نوع الخدمة *
              </label>
              <select
                name="serviceType"
                required
                value={formData.serviceType}
                onChange={handleInputChange}
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
              >
                <option value="">اختر نوع الخدمة</option>
                {serviceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Governorates */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline w-4 h-4 ml-1" />
                المحافظات التي تخدمها *
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
                  المراكز التي تخدمها *
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
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                placeholder="اكتب نبذة مختصرة عن خبرتك ومهاراتك"
              />
            </div>

            {/* ID Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Upload className="inline w-4 h-4 ml-1" />
                صورة بطاقة الرقم القومي (مطلوبة للتحقق)
              </label>
              <div
            
            className="border border-warning rounded d-flex align-items-center justify-content-center position-relative"
            style={{ width: 100, height: 100, borderStyle: 'dashed', cursor: 'pointer', overflow: 'hidden' }}
          >
            <input
              type="file"
              accept="image/*"
              style={{ opacity: 0, position: 'absolute', width: '100%', height: '100%', cursor: 'pointer' }}
              onChange={handleFileChange}
            />
            {formData.idPhoto ? (
              <img
                src={URL.createObjectURL(formData.idPhoto)}
                alt={`upload-`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span className="text-warning">+ Image</span>
            )}
          </div>
              
              <p className="text-xs text-gray-500 mt-1">
                صورة واضحة لبطاقة الرقم القومي للتحقق من هويتك (سرية ولن تظهر للعامة)
              </p>
            </div>
            {/* IDF Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Upload className="inline w-4 h-4 ml-1" />
                صورة بطاقة الوجة الخلفي
              </label>
              <div
            
            className="border border-warning rounded d-flex align-items-center justify-content-center position-relative"
            style={{ width: 100, height: 100, borderStyle: 'dashed', cursor: 'pointer', overflow: 'hidden' }}
          >
            <input
              type="file"
              accept="image/*"
              style={{ opacity: 0, position: 'absolute', width: '100%', height: '100%', cursor: 'pointer' }}
              onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setFormData(prev => ({ ...prev, idfPhoto: file }));
                  }
                }}
            />
            {formData.idfPhoto ? (
              <img
                src={URL.createObjectURL(formData.idfPhoto)}
                alt={`upload-`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span className="text-warning">+ Image</span>
            )}
          </div>
              
              <p className="text-xs text-gray-500 mt-1">
                صورة واضحة للوجة الخلفي لبطاقة الخاصة بك ( ستساعد في التحقق من هويتك)
              </p>
            </div>
            {/* ID User Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Upload className="inline w-4 h-4 ml-1" />
                صورة شخصية  لك وانت تحمل البطاقة الخاصة بك
              </label>
              <div
            
            className="border border-warning rounded d-flex align-items-center justify-content-center position-relative"
            style={{ width: 100, height: 100, borderStyle: 'dashed', cursor: 'pointer', overflow: 'hidden' }}
          >
            <input
              type="file"
              accept="image/*"
              style={{ opacity: 0, position: 'absolute', width: '100%', height: '100%', cursor: 'pointer' }}
              onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setFormData(prev => ({ ...prev, iduserPhotoUrl: file }));
                  }
                }}
            />
            {formData.iduserPhotoUrl ? (
              <img
                src={URL.createObjectURL(formData.iduserPhotoUrl)}
                alt={`upload-`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span className="text-warning">+ Image</span>
            )}
          </div>
        
      
              
              
              <p className="text-xs text-gray-500 mt-1">
                صورة شخصية حديثة (اختياري، ستساعد في التحقق من هويتك)
              </p>
            </div>
            {/* Message Display */}
            

            {message.text && (
              <div className={`text-sm text-center p-3 rounded-md ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                لديك حساب بالفعل؟{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  سجل الدخول
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>

  );
}