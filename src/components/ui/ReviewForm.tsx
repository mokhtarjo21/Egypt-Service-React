import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Star, Send } from 'lucide-react';
import toast from 'react-hot-toast';

import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';

interface ReviewFormProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  serviceTitle: string;
  onReviewSubmitted?: () => void;
}

interface ReviewFormData {
  rating: number;
  title: string;
  comment: string;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  isOpen,
  onClose,
  serviceId,
  serviceTitle,
  onReviewSubmitted,
}) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ReviewFormData>();

  const onSubmit = async (data: ReviewFormData) => {
    if (selectedRating === 0) {
      toast.error('يرجى اختيار تقييم');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/v1/reviews/reviews/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          service: serviceId,
          rating: selectedRating,
          title: data.title,
          comment: data.comment,
        }),
      });

      if (response.ok) {
        toast.success('تم إرسال التقييم بنجاح. سيتم مراجعته قبل النشر.');
        reset();
        setSelectedRating(0);
        onClose();
        onReviewSubmitted?.();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'حدث خطأ في إرسال التقييم');
      }
    } catch (error) {
      toast.error('حدث خطأ في إرسال التقييم');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedRating(0);
    onClose();
  };

  const handleStarClick = (rating: number) => {
    setSelectedRating(rating);
    setValue('rating', rating);
  };

  const ratingLabels = {
    1: 'سيء جداً',
    2: 'سيء',
    3: 'متوسط',
    4: 'جيد',
    5: 'ممتاز',
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="كتابة تقييم" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">تقييم الخدمة:</p>
          <p className="font-medium text-gray-900">{serviceTitle}</p>
        </div>

        {/* Star Rating */}
        <div className="text-center">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            التقييم *
          </label>
          <div className="flex justify-center space-x-2 rtl:space-x-reverse mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleStarClick(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoverRating || selectedRating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          {selectedRating > 0 && (
            <p className="text-sm text-gray-600">
              {ratingLabels[selectedRating as keyof typeof ratingLabels]}
            </p>
          )}
        </div>

        <Input
          label="عنوان التقييم *"
          placeholder="اكتب عنواناً مختصراً للتقييم"
          error={errors.title?.message}
          {...register('title', {
            required: 'عنوان التقييم مطلوب',
            minLength: {
              value: 5,
              message: 'العنوان يجب أن يكون 5 أحرف على الأقل',
            },
          })}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            تفاصيل التقييم *
          </label>
          <textarea
            rows={4}
            placeholder="شارك تجربتك مع هذه الخدمة..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            {...register('comment', {
              required: 'تفاصيل التقييم مطلوبة',
              minLength: {
                value: 20,
                message: 'التقييم يجب أن يكون 20 حرف على الأقل',
              },
            })}
          />
          {errors.comment && (
            <p className="mt-1 text-sm text-red-600">{errors.comment.message}</p>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xs">ℹ</span>
              </div>
            </div>
            <div className="mr-3 rtl:mr-0 rtl:ml-3 text-sm text-blue-800">
              <p className="font-medium mb-1">إرشادات التقييم</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>كن صادقاً وموضوعياً في تقييمك</li>
                <li>ركز على جودة الخدمة والتعامل</li>
                <li>تجنب المعلومات الشخصية</li>
                <li>سيتم مراجعة التقييم قبل النشر</li>
              </ul>
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
            leftIcon={<Send className="w-4 h-4" />}
            disabled={selectedRating === 0}
          >
            إرسال التقييم
          </Button>
        </div>
      </form>
    </Modal>
  );
};