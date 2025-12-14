import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Upload, X, Plus, MapPin, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { useDirection } from '../../hooks/useDirection';

interface ServiceFormData {
  title_ar: string;
  title_en?: string;
  description_ar: string;
  description_en?: string;
  category: string;
  subcategory: string;
  pricing_type: 'fixed' | 'hourly' | 'package' | 'negotiable';
  price: number;
  governorate: string;
  center: string;
}

interface Category {
  id: string;
  name_ar: string;
  name_en: string;
  subcategories?: Subcategory[];
}

interface Subcategory {
  id: string;
  name_ar: string;
  name_en: string;
}

interface Governorate {
  id: string;
  name_ar: string;
  name_en: string;
}

interface Center {
  id: string;
  name_ar: string;
  name_en: string;
}

const AddServicePage: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL } = useDirection();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ServiceFormData>();

  const selectedCategory = watch('category');
  const selectedGovernorate = watch('governorate');

  // Load categories and governorates on mount
  useEffect(() => {
    loadCategories();
    loadGovernorates();
  }, []);

  // Load subcategories when category changes
  useEffect(() => {
    if (selectedCategory) {
      loadSubcategories(selectedCategory);
    }
  }, [selectedCategory]);

  // Load centers when governorate changes
  useEffect(() => {
    if (selectedGovernorate) {
      loadCenters(selectedGovernorate);
    }
  }, [selectedGovernorate]);

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/v1/services/categories/');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadSubcategories = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/v1/services/categories/${categoryId}/subcategories/`);
      if (response.ok) {
        const data = await response.json();
        setSubcategories(data);
      }
    } catch (error) {
      console.error('Failed to load subcategories:', error);
    }
  };

  const loadGovernorates = async () => {
    try {
      const response = await fetch('/api/v1/geo/governorates/');
      if (response.ok) {
        const data = await response.json();
        setGovernorates(data);
      }
    } catch (error) {
      console.error('Failed to load governorates:', error);
    }
  };

  const loadCenters = async (governorateId: string) => {
    try {
      const response = await fetch(`/api/v1/geo/centers/?gov_id=${governorateId}`);
      if (response.ok) {
        const data = await response.json();
        setCenters(data);
      }
    } catch (error) {
      console.error('Failed to load centers:', error);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length + selectedImages.length > 5) {
      toast.error('يمكنك رفع 5 صور كحد أقصى');
      return;
    }

    const newImages = [...selectedImages, ...files];
    setSelectedImages(newImages);

    // Create previews
    const newPreviews = [...imagePreviews];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        setImagePreviews([...newPreviews]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
  };

  const onSubmit = async (data: ServiceFormData) => {
    setIsLoading(true);
    try {
      // Create service
      const serviceResponse = await fetch('/api/v1/services/services/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(data),
      });

      if (!serviceResponse.ok) {
        throw new Error('Failed to create service');
      }

      const service = await serviceResponse.json();

      // Upload images if any
      if (selectedImages.length > 0) {
        const formData = new FormData();
        selectedImages.forEach((image, index) => {
          formData.append('images', image);
        });

        await fetch(`/api/v1/services/services/${service.slug}/upload_images/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
          body: formData,
        });
      }

      toast.success('تم إضافة الخدمة بنجاح! ستتم مراجعتها خلال 24-48 ساعة.');
      navigate('/dashboard');
    } catch (error) {
      toast.error('حدث خطأ في إضافة الخدمة');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            إضافة خدمة جديدة
          </h1>
          <p className="text-gray-600">
            أضف خدمتك واحصل على عملاء جدد
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              المعلومات الأساسية
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="عنوان الخدمة (بالعربية) *"
                error={errors.title_ar?.message}
                {...register('title_ar', {
                  required: 'عنوان الخدمة مطلوب',
                  minLength: {
                    value: 10,
                    message: 'العنوان يجب أن يكون 10 أحرف على الأقل',
                  },
                })}
              />

              <Input
                label="عنوان الخدمة (بالإنجليزية)"
                {...register('title_en')}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  وصف الخدمة (بالعربية) *
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  {...register('description_ar', {
                    required: 'وصف الخدمة مطلوب',
                    minLength: {
                      value: 50,
                      message: 'الوصف يجب أن يكون 50 حرف على الأقل',
                    },
                  })}
                />
                {errors.description_ar && (
                  <p className="mt-1 text-sm text-red-600">{errors.description_ar.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  وصف الخدمة (بالإنجليزية)
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  {...register('description_en')}
                />
              </div>
            </div>
          </Card>

          {/* Category & Location */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              التصنيف والموقع
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الفئة الرئيسية *
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  {...register('category', { required: 'الفئة مطلوبة' })}
                >
                  <option value="">اختر الفئة</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name_ar}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الفئة الفرعية *
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  disabled={!selectedCategory}
                  {...register('subcategory', { required: 'الفئة الفرعية مطلوبة' })}
                >
                  <option value="">اختر الفئة الفرعية</option>
                  {subcategories.map((subcategory) => (
                    <option key={subcategory.id} value={subcategory.id}>
                      {subcategory.name_ar}
                    </option>
                  ))}
                </select>
                {errors.subcategory && (
                  <p className="mt-1 text-sm text-red-600">{errors.subcategory.message}</p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  المحافظة *
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  {...register('governorate', { required: 'المحافظة مطلوبة' })}
                >
                  <option value="">اختر المحافظة</option>
                  {governorates.map((gov) => (
                    <option key={gov.id} value={gov.id}>
                      {gov.name_ar}
                    </option>
                  ))}
                </select>
                {errors.governorate && (
                  <p className="mt-1 text-sm text-red-600">{errors.governorate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المركز/المدينة *
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  disabled={!selectedGovernorate}
                  {...register('center', { required: 'المركز مطلوب' })}
                >
                  <option value="">اختر المركز</option>
                  {centers.map((center) => (
                    <option key={center.id} value={center.id}>
                      {center.name_ar}
                    </option>
                  ))}
                </select>
                {errors.center && (
                  <p className="mt-1 text-sm text-red-600">{errors.center.message}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Pricing */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              <DollarSign className="w-5 h-5 inline mr-2" />
              التسعير
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع التسعير *
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  {...register('pricing_type', { required: 'نوع التسعير مطلوب' })}
                >
                  <option value="">اختر نوع التسعير</option>
                  <option value="fixed">سعر ثابت</option>
                  <option value="hourly">بالساعة</option>
                  <option value="package">باقة</option>
                  <option value="negotiable">قابل للتفاوض</option>
                </select>
                {errors.pricing_type && (
                  <p className="mt-1 text-sm text-red-600">{errors.pricing_type.message}</p>
                )}
              </div>

              <Input
                label="السعر (جنيه مصري) *"
                type="number"
                min="0"
                step="0.01"
                error={errors.price?.message}
                {...register('price', {
                  required: 'السعر مطلوب',
                  min: {
                    value: 1,
                    message: 'السعر يجب أن يكون أكبر من صفر',
                  },
                })}
              />
            </div>
          </Card>

          {/* Images */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              صور الخدمة
            </h2>
            
            <div className="space-y-4">
              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="service-images"
                />
                <label
                  htmlFor="service-images"
                  className="cursor-pointer text-primary-600 hover:text-primary-500 font-medium"
                >
                  اختر الصور أو اسحبها هنا
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  PNG, JPG حتى 10MB لكل صورة (5 صور كحد أقصى)
                </p>
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-1 left-1 bg-primary-600 text-white text-xs px-2 py-1 rounded">
                          رئيسية
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Submit */}
          <div className="flex justify-end space-x-4 rtl:space-x-reverse">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
              leftIcon={<Plus className="w-5 h-5" />}
            >
              إضافة الخدمة
            </Button>
          </div>

          {/* Info Box */}
          <Card className="bg-blue-50 border-blue-200">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">ℹ</span>
                </div>
              </div>
              <div className="mr-3 rtl:mr-0 rtl:ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  ملاحظات مهمة
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>ستتم مراجعة خدمتك من قبل فريقنا خلال 24-48 ساعة</li>
                    <li>تأكد من دقة المعلومات والصور المرفوعة</li>
                    <li>يمكنك تعديل الخدمة بعد الموافقة عليها</li>
                    <li>ستحصل على إشعار عند الموافقة أو الرفض</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default AddServicePage;