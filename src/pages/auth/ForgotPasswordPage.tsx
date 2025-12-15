import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Phone, Lock, Eye, EyeOff, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

const API_BASE = import.meta.env?.VITE_API_BASE || 'http://192.168.1.7:8000';

interface ResetStep1Data {
  phone_number: string;
}

interface ResetStep2Data {
  code: string;
  new_password: string;
  new_password_confirm: string;
}

type ResetStep = 1 | 2;

const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState<ResetStep>(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const {
    register: registerStep1,
    handleSubmit: handleSubmitStep1,
    formState: { errors: errorsStep1 },
  } = useForm<ResetStep1Data>();

  const {
    register: registerStep2,
    handleSubmit: handleSubmitStep2,
    formState: { errors: errorsStep2 },
    watch,
  } = useForm<ResetStep2Data>();

  const passwordValue = watch('new_password');

  useEffect(() => {
    if (step === 2 && countdown === 0) {
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
    }
  }, [step, countdown]);

  const onSubmitStep1 = async (data: ResetStep1Data) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/v1/accounts/auth/password/forgot/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: data.phone_number,
        }),
      });

      if (response.ok) {
        setPhoneNumber(data.phone_number);
        setStep(2);
        setCountdown(60);
        setCanResend(false);
        toast.success('تم إرسال رمز التحقق إلى هاتفك');
      } else {
        const errorData = await response.json();
        toast.error(
          errorData.error ||
            errorData.detail ||
            'فشل في إرسال رمز التحقق. تأكد من رقم الهاتف'
        );
      }
    } catch (error) {
      toast.error('حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitStep2 = async (data: ResetStep2Data) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/v1/accounts/auth/password/reset/confirm/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          code: data.code,
          new_password: data.new_password,
        }),
      });

      if (response.ok) {
        toast.success('تم تحديث كلمة المرور بنجاح');
        navigate('/login');
      } else {
        const errorData = await response.json();
        toast.error(
          errorData.error || errorData.detail || 'فشل في تحديث كلمة المرور'
        );
      }
    } catch (error) {
      toast.error('حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    try {
      const response = await fetch(`${API_BASE}/api/v1/accounts/auth/otp/send/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          purpose: 'password_reset',
        }),
      });

      if (response.ok) {
        toast.success('تم إرسال رمز التحقق مرة أخرى');
        setCountdown(60);
        setCanResend(false);
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
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            استعادة كلمة المرور
          </h2>
          <p className="text-gray-600">
            {step === 1
              ? 'أدخل رقم الهاتف المرتبط بحسابك'
              : 'أدخل رمز التحقق وكلمة المرور الجديدة'}
          </p>
        </div>

        <Card className="mt-8">
          {step === 1 ? (
            <form onSubmit={handleSubmitStep1(onSubmitStep1)} className="space-y-6">
              <Input
                label="رقم الهاتف"
                type="tel"
                placeholder="+201234567890"
                leftIcon={<Phone className="w-5 h-5" />}
                error={errorsStep1.phone_number?.message}
                {...registerStep1('phone_number', {
                  required: 'رقم الهاتف مطلوب',
                  pattern: {
                    value: /^\+20[0-9]{10}$/,
                    message: 'رقم الهاتف يجب أن يكون بصيغة +201234567890',
                  },
                })}
              />

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isLoading}
              >
                إرسال رمز التحقق
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmitStep2(onSubmitStep2)} className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  تم إرسال الرمز إلى: <span className="font-semibold">{phoneNumber}</span>
                </p>
              </div>

              <Input
                label="رمز التحقق"
                type="text"
                placeholder="123456"
                maxLength={6}
                className="text-center text-2xl tracking-widest"
                error={errorsStep2.code?.message}
                {...registerStep2('code', {
                  required: 'رمز التحقق مطلوب',
                  pattern: {
                    value: /^\d{6}$/,
                    message: 'رمز التحقق يجب أن يكون 6 أرقام',
                  },
                })}
              />

              <Input
                label="كلمة المرور الجديدة"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••"
                leftIcon={<Lock className="w-5 h-5" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                }
                error={errorsStep2.new_password?.message}
                {...registerStep2('new_password', {
                  required: 'كلمة المرور مطلوبة',
                  minLength: {
                    value: 8,
                    message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
                  },
                })}
              />

              <Input
                label="تأكيد كلمة المرور"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••"
                leftIcon={<Lock className="w-5 h-5" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                }
                error={errorsStep2.new_password_confirm?.message}
                {...registerStep2('new_password_confirm', {
                  required: 'تأكيد كلمة المرور مطلوب',
                  validate: (value) =>
                    value === passwordValue || 'كلمات المرور غير متطابقة',
                })}
              />

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isLoading}
              >
                تحديث كلمة المرور
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
          )}
        </Card>

        {/* Back to Login */}
        <div className="text-center">
          <Link
            to="/login"
            className="text-sm text-primary-600 hover:text-primary-500"
          >
            العودة إلى تسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
