import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Gavel, Upload, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import { RootState } from '../store/store';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

interface ModerationAction {
  id: string;
  action_type: string;
  reason_code: string;
  reason_text: string;
  created_at: string;
  expires_at?: string;
  is_permanent: boolean;
}

interface AppealFormData {
  appeal_text: string;
  additional_evidence?: FileList;
}

const AppealPage: React.FC = () => {
  const { actionId } = useParams<{ actionId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [moderationAction, setModerationAction] = useState<ModerationAction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canAppeal, setCanAppeal] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AppealFormData>();

  useEffect(() => {
    if (actionId) {
      loadModerationAction();
    }
  }, [actionId]);

  const loadModerationAction = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/moderation/actions/${actionId}/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setModerationAction(data);
        
        // Check if user can still appeal
        const appealDeadline = new Date(data.created_at);
        appealDeadline.setDate(appealDeadline.getDate() + 30); // 30 days to appeal
        setCanAppeal(new Date() < appealDeadline);
      }
    } catch (error) {
      console.error('Failed to load moderation action:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: AppealFormData) => {
    if (!moderationAction) return;
    
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('moderation_action', moderationAction.id);
      formData.append('appeal_text', data.appeal_text);
      
      if (data.additional_evidence?.[0]) {
        formData.append('additional_evidence', data.additional_evidence[0]);
      }

      const response = await fetch('/api/v1/moderation/appeals/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: formData,
      });

      if (response.ok) {
        toast.success('تم إرسال الاستئناف بنجاح. سيتم مراجعته خلال 72 ساعة.');
        navigate('/profile');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'حدث خطأ في إرسال الاستئناف');
      }
    } catch (error) {
      toast.error('حدث خطأ في إرسال الاستئناف');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!moderationAction) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Gavel className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">الإجراء غير موجود</h2>
          <p className="text-gray-600">الإجراء الإداري المطلوب غير متاح</p>
        </div>
      </div>
    );
  }

  const actionTypeLabels = {
    warn: 'تحذير',
    hide_content: 'إخفاء المحتوى',
    reject_content: 'رفض المحتوى',
    suspend_user: 'تعليق الحساب',
    block_user: 'حظر الحساب',
    remove_content: 'حذف المحتوى',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gavel className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            استئناف إجراء إداري
          </h1>
          <p className="text-gray-600">
            يمكنك استئناف الإجراء الإداري المتخذ ضد حسابك
          </p>
        </div>

        {/* Moderation Action Details */}
        <Card className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            تفاصيل الإجراء الإداري
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
              <div>
                <p className="font-medium text-red-900">
                  {actionTypeLabels[moderationAction.action_type as keyof typeof actionTypeLabels] || moderationAction.action_type}
                </p>
                <p className="text-sm text-red-700">
                  كود السبب: {moderationAction.reason_code}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">سبب الإجراء:</h4>
              <p className="text-gray-700">{moderationAction.reason_text}</p>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                تاريخ الإجراء: {new Date(moderationAction.created_at).toLocaleDateString('ar-EG')}
              </div>
              {moderationAction.expires_at && !moderationAction.is_permanent && (
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  ينتهي: {new Date(moderationAction.expires_at).toLocaleDateString('ar-EG')}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Appeal Form */}
        {canAppeal ? (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              إرسال استئناف
            </h3>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  شرح الاستئناف *
                </label>
                <textarea
                  rows={6}
                  placeholder="اشرح لماذا تعتقد أن الإجراء الإداري غير مبرر..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  {...register('appeal_text', {
                    required: 'شرح الاستئناف مطلوب',
                    minLength: {
                      value: 50,
                      message: 'الشرح يجب أن يكون 50 حرف على الأقل',
                    },
                  })}
                />
                {errors.appeal_text && (
                  <p className="mt-1 text-sm text-red-600">{errors.appeal_text.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  أدلة إضافية (اختياري)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    id="evidence"
                    {...register('additional_evidence')}
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

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-xs">ℹ</span>
                    </div>
                  </div>
                  <div className="mr-3 rtl:mr-0 rtl:ml-3 text-sm text-blue-800">
                    <p className="font-medium mb-1">معلومات مهمة</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>سيتم مراجعة استئنافك خلال 72 ساعة</li>
                      <li>قدم أدلة واضحة ومحددة</li>
                      <li>الاستئنافات الكاذبة قد تؤدي لإجراءات إضافية</li>
                      <li>ستحصل على إشعار بقرار الاستئناف</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 rtl:space-x-reverse">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/profile')}
                  className="flex-1"
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  className="flex-1"
                  leftIcon={<Gavel className="w-4 h-4" />}
                >
                  إرسال الاستئناف
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          <Card className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              انتهت فترة الاستئناف
            </h3>
            <p className="text-gray-600">
              لقد انتهت فترة الـ 30 يوم المسموحة لتقديم الاستئناف
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AppealPage;