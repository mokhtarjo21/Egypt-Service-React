import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, DollarSign, FileText, Upload, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useServices } from '../context/ServiceContext';
import { governorates } from '../data/governorates';

export function AddService() {
  const { currentUser } = useAuth();
  const { addService } = useServices();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    governorate: '',
    center: '',
    images: [] as File[]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  const selectedGov = governorates.find(gov => gov.name === formData.governorate);
  const availableCenters = selectedGov ? selectedGov.centers : [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'governorate') {
      setFormData(prev => ({ ...prev, center: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 5) {
      setError('يمكنك رفع 5 صور كحد أقصى');
      return;
    }
    setFormData(prev => ({ ...prev, images: files }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.title.trim() || !formData.description.trim() || !formData.price || !formData.governorate || !formData.center) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      setLoading(false);
      return;
    }

    if (parseInt(formData.price) <= 0) {
      setError('السعر يجب أن يكون أكبر من صفر');
      setLoading(false);
      return;
    }

    try {
      // Mock image URLs - in a real app, upload images to server
      const imageUrls = formData.images.map((_, index) => 
        `/api/uploads/service-${Date.now()}-${index}.jpg`
      );

      addService({
        userId: currentUser.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseInt(formData.price),
        governorate: formData.governorate,
        center: formData.center,
        images: imageUrls,
        status: 'pending'
      });

      navigate('/profile', { 
        state: { message: 'تم إرسال الخدمة للمراجعة بنجاح. ستظهر بعد الموافقة عليها.' }
      });
    } catch (err) {
      setError('حدث خطأ أثناء إضافة الخدمة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">إضافة خدمة جديدة</h1>
            <p className="text-gray-600 mt-2">أضف خدمتك وانتظر الموافقة عليها</p>
          </div>

          {!currentUser.isVerified && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 ml-2" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">حسابك قيد المراجعة</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    يمكنك إضافة الخدمات ولكنها ستظهر فقط بعد التحقق من حسابك
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Service Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="inline w-4 h-4 ml-1" />
                عنوان الخدمة *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                placeholder="مثال: خدمات السباكة المنزلية"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                وصف الخدمة *
              </label>
              <textarea
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                placeholder="اكتب وصفاً تفصيلياً للخدمة التي تقدمها..."
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="inline w-4 h-4 ml-1" />
                السعر (جنيه مصري) *
              </label>
              <input
                type="number"
                name="price"
                required
                min="1"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                placeholder="100"
              />
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline w-4 h-4 ml-1" />
                  المحافظة *
                </label>
                <select
                  name="governorate"
                  required
                  value={formData.governorate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                >
                  <option value="">اختر المحافظة</option>
                  {governorates.map(gov => (
                    <option key={gov.name} value={gov.name}>{gov.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المركز *
                </label>
                <select
                  name="center"
                  required
                  value={formData.center}
                  onChange={handleInputChange}
                  disabled={!formData.governorate}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right disabled:bg-gray-100"
                >
                  <option value="">اختر المركز</option>
                  {availableCenters.map(center => (
                    <option key={center} value={center}>{center}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Images Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Upload className="inline w-4 h-4 ml-1" />
                صور الخدمة (اختياري - 5 صور كحد أقصى)
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                ارفع صوراً واضحة للخدمة لزيادة الثقة مع العملاء
              </p>
              {formData.images.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-green-600">
                    تم اختيار {formData.images.length} صورة
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-blue-800 mb-2">ملاحظة مهمة:</h3>
              <p className="text-xs text-blue-700">
                سيتم مراجعة خدمتك من قبل الإدارة قبل نشرها للعملاء. تأكد من دقة المعلومات المدخلة.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              <Plus className="w-4 h-4 ml-2" />
              {loading ? 'جاري الإضافة...' : 'إضافة الخدمة'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}