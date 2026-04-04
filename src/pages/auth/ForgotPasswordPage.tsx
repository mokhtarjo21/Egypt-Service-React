import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Phone, Lock, Eye, EyeOff, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

const API_BASE = import.meta.env?.VITE_API_BASE || 'http://localhost:8000';

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
        toast.success(t('auth.forgotPassword.codeSentSuccess'));
      } else {
        const errorData = await response.json();
        toast.error(
          errorData.error ||
            errorData.detail ||
            t('auth.forgotPassword.sendCodeFailed')
        );
      }
    } catch (error) {
      toast.error(t('auth.forgotPassword.serverError'));
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
          new_password_confirm: data.new_password_confirm,
        }),
      });

      if (response.ok) {
        toast.success(t('auth.forgotPassword.updateSuccess'));
        navigate('/login');
      } else {
        const errorData = await response.json();
        toast.error(
          errorData.error || errorData.detail || t('auth.forgotPassword.updateFailed')
        );
      }
    } catch (error) {
      toast.error(t('auth.forgotPassword.serverError'));
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
        toast.success(t('auth.forgotPassword.resendSuccess'));
        setCountdown(60);
        setCanResend(false);
      } else {
        toast.error(t('auth.forgotPassword.resendFailed'));
      }
    } catch (error) {
      toast.error(t('auth.forgotPassword.resendFailed'));
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
            {t('auth.forgotPassword.title')}
          </h2>
          <p className="text-gray-600">
            {step === 1
              ? t('auth.forgotPassword.subtitleStep1')
              : t('auth.forgotPassword.subtitleStep2')}
          </p>
        </div>

        <Card className="mt-8">
          {step === 1 ? (
            <form onSubmit={handleSubmitStep1(onSubmitStep1)} className="space-y-6">
              <Input
                label={t('auth.forgotPassword.phone')}
                type="tel"
                placeholder="+201234567890"
                leftIcon={<Phone className="w-5 h-5" />}
                error={errorsStep1.phone_number?.message}
                {...registerStep1('phone_number', {
                  required: t('auth.validation.phoneRequired'),
                  pattern: {
                    value: /^\+20[0-9]{10}$/,
                    message: t('auth.validation.phoneInvalid'),
                  },
                })}
              />

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isLoading}
              >
                {t('auth.forgotPassword.sendCode')}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmitStep2(onSubmitStep2)} className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  {t('auth.forgotPassword.codeSentTo')} <span className="font-semibold">{phoneNumber}</span>
                </p>
              </div>

              <Input
                label={t('auth.forgotPassword.verificationCode')}
                type="text"
                placeholder="123456"
                maxLength={6}
                className="text-center text-2xl tracking-widest"
                error={errorsStep2.code?.message}
                {...registerStep2('code', {
                  required: t('auth.validation.codeRequired'),
                  pattern: {
                    value: /^\d{6}$/,
                    message: t('auth.validation.codeInvalid'),
                  },
                })}
              />

              <Input
                label={t('auth.forgotPassword.newPassword')}
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
                  required: t('auth.validation.passwordRequired'),
                  minLength: {
                    value: 8,
                    message: t('auth.validation.passwordMinLength'),
                  },
                })}
              />

              <Input
                label={t('auth.forgotPassword.confirmPassword')}
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
                  required: t('auth.validation.passwordRequired'),
                  validate: (value) =>
                    value === passwordValue || t('auth.validation.passwordMismatch'),
                })}
              />

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isLoading}
              >
                {t('auth.forgotPassword.updatePassword')}
              </Button>

              <div className="text-center">
                {canResend ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleResendOTP}
                    isLoading={isResending}
                    leftIcon={<RefreshCw className="w-4 h-4" />}
                  >
                    {t('auth.forgotPassword.resendCode')}
                  </Button>
                ) : (
                  <p className="text-gray-500 text-sm">
                    {t('auth.forgotPassword.resendIn', { countdown })}
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
            {t('auth.forgotPassword.backToLogin')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
