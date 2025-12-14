import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Flag, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';

import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'service' | 'user' | 'message';
  targetId: string;
  targetTitle?: string;
}

interface ReportFormData {
  reason: string;
  description: string;
  evidence?: FileList;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle,
}) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReportFormData>();

  const reasonOptions = [
    { value: 'spam', label: 'محتوى مزعج' },
    { value: 'inappropriate', label: 'محتوى غير مناسب' },
    { value: 'fake', label: 'خدمة أو ملف شخصي مزيف' },
    { value: 'fraud', label: 'احتيال أو نصب' },
    { value: 'harassment', label: 'تحرش أو إزعاج' },
    { value: 'copyright', label: 'انتهاك حقوق الطبع' },
    { value: 'pricing', label: 'تسعير مضلل' },
    { value: 'location', label: 'موقع خاطئ' },
    { value: 'quality', label: 'جودة خدمة ضعيفة' },
    { value: 'other', label: 'أخرى' },
  ];

  const onSubmit = async (data: ReportFormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('target_type', targetType);
      formData.append('target_id', targetId);
      formData.append('reason', data.reason);
      formData.append('description', data.description);
      
      if (data.evidence?.[0]) {
        formData.append('evidence', data.evidence[0]);
      }

      const response = await fetch('/api/v1/moderation/reports/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: formData,
      });

      if (response.ok) {
        toast.success('تم إرسال البلاغ بنجاح. سيتم مراجعته من قبل فريقنا.');
        reset();
        onClose();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'حدث خطأ في إرسال البلاغ');
      }
    } catch (error) {
      toast.error('حدث خطأ في إرسال البلاغ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="إبلاغ عن مشكلة" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {targetTitle && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">تقوم بالإبلاغ عن:</p>
            <p className="font-medium text-gray-900">{targetTitle}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            سبب البلاغ *
          </label>
          <select
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            {...register('reason', { required: 'سبب البلاغ مطلوب' })}
          >
            <option value="">اختر السبب</option>
            {reasonOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.reason && (
            <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            تفاصيل إضافية *
          </label>
          <textarea
            rows={4}
            placeholder="اشرح المشكلة بالتفصيل..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            {...register('description', {
              required: 'التفاصيل مطلوبة',
              minLength: {
                value: 20,
                message: 'يجب أن تكون التفاصيل 20 حرف على الأقل',
              },
            })}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            دليل (اختياري)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              id="evidence"
              {...register('evidence')}
            />
            <label
              htmlFor="evidence"
              className="cursor-pointer text-primary-600 hover:text-primary-500"
            >
              اختر ملف أو اسحبه هنا
            </label>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, PDF حتى 10MB
            </p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <Flag className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">ملاحظة مهمة</p>
              <p>
                سيتم مراجعة البلاغ من قبل فريقنا خلال 24-48 ساعة. 
                البلاغات الكاذبة قد تؤدي إلى تعليق حسابك.
              </p>
            </div>
          </div>
        </div>

        <div className="flex space-x-4 rtl:space-x-reverse">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="flex-1"
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            className="flex-1"
            leftIcon={<Flag className="w-4 h-4" />}
          >
            إرسال البلاغ
          </Button>
        </div>
      </form>
    </Modal>
  );
};