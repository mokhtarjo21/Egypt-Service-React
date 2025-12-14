import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Phone, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

interface OTPFormData {
  code: string;
}

const OTPVerificationPage: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const { phone_number, user_id } = location.state || {};

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OTPFormData>();

  useEffect(() => {
    if (!phone_number || !user_id) {
      navigate('/register');
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phone_number, user_id, navigate]);

  const onSubmit = async (data: OTPFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/accounts/auth/otp/verify/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number,
          code: data.code,
          purpose: 'registration',
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Store tokens
        localStorage.setItem('access_token', result.tokens.access);
        localStorage.setItem('refresh_token', result.tokens.refresh);
        
        toast.success('تم التحقق من رقم الهاتف بنجاح!');
        navigate('/dashboard');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'رمز التحقق غير صحيح');
      }
    } catch (error) {
      toast.error('حدث خطأ في التحقق من الرمز');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    try {
      const response = await fetch('/api/v1/accounts/auth/otp/send/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number,
          purpose: 'registration',
        }),
      });

      if (response.ok) {
        toast.success('تم إرسال رمز التحقق مرة أخرى');
        setCountdown(60);
        setCanResend(false);
        
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              setCanResend(true);
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        toast.error('فشل في إعادة إرسال الرمز');
      }
    } catch (error) {
      toast.error('حدث خطأ في إعادة الإرسال');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <Phone className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            تحقق من رقم هاتفك
          </h2>
          <p className="text-gray-600 mb-4">
            أدخل رمز التحقق المرسل إلى
          </p>
          <p className="text-lg font-semibold text-primary-600">
            {phone_number}
          </p>
        </div>

        {/* Form */}
        <Card className="mt-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="رمز التحقق"
              type="text"
              placeholder="123456"
              maxLength={6}
              className="text-center text-2xl tracking-widest"
              error={errors.code?.message}
              {...register('code', {
                required: 'رمز التحقق مطلوب',
                pattern: {
                  value: /^\d{6}$/,
                  message: 'رمز التحقق يجب أن يكون 6 أرقام',
                },
              })}
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              تحقق من الرمز
            </Button>

            {/* Resend OTP */}
            <div className="text-center">
              {canResend ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleResendOTP}
                  isLoading={isResending}
                  leftIcon={<RefreshCw className="w-4 h-4" />}
                >
                  إعادة إرسال الرمز
                </Button>
              ) : (
                <p className="text-gray-500 text-sm">
                  يمكنك إعادة الإرسال خلال {countdown} ثانية
                </p>
              )}
            </div>
          </form>
        </Card>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            لم تستلم الرمز؟ تأكد من رقم الهاتف أو تواصل مع الدعم الفني
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationPage;