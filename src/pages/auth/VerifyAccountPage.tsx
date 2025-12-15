import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

import { RootState } from '../../store/store';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';

const API_BASE = import.meta.env?.VITE_API_BASE || 'http://192.168.1.7:8000';

const VerifyAccountPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);

  const [emailCode, setEmailCode] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [isVerified, setIsVerified] = useState({
    email: user?.email_verified || false,
    phone: user?.phone_verified || false,
  });
  const [loading, setLoading] = useState({
    email: false,
    phone: false,
  });
  const [resendCountdown, setResendCountdown] = useState({
    email: 0,
    phone: 0,
  });
  const [canResend, setCanResend] = useState({
    email: false,
    phone: false,
  });

  useEffect(() => {
    const emailTimer = setInterval(() => {
      setResendCountdown((prev) => {
        const newCount = prev.email - 1;
        if (newCount <= 0) {
          setCanResend((prev) => ({ ...prev, email: true }));
          clearInterval(emailTimer);
          return { ...prev, email: 0 };
        }
        return { ...prev, email: newCount };
      });
    }, 1000);

    return () => clearInterval(emailTimer);
  }, [resendCountdown.email]);

  useEffect(() => {
    const phoneTimer = setInterval(() => {
      setResendCountdown((prev) => {
        const newCount = prev.phone - 1;
        if (newCount <= 0) {
          setCanResend((prev) => ({ ...prev, phone: true }));
          clearInterval(phoneTimer);
          return { ...prev, phone: 0 };
        }
        return { ...prev, phone: newCount };
      });
    }, 1000);

    return () => clearInterval(phoneTimer);
  }, [resendCountdown.phone]);

  const handleVerifyEmail = async () => {
    if (!emailCode || emailCode.length !== 6) {
      toast.error('أدخل رمز التحقق الصحيح');
      return;
    }

    setLoading((prev) => ({ ...prev, email: true }));
    try {
      const response = await fetch(`${API_BASE}/api/v1/accounts/verify/email/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          code: emailCode,
        }),
      });

      if (response.ok) {
        setIsVerified((prev) => ({ ...prev, email: true }));
        setEmailCode('');
        toast.success('تم التحقق من البريد الإلكتروني بنجاح');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || errorData.detail || 'رمز التحقق غير صحيح');
      }
    } catch (error) {
      toast.error('حدث خطأ في التحقق من البريد الإلكتروني');
    } finally {
      setLoading((prev) => ({ ...prev, email: false }));
    }
  };

  const handleVerifyPhone = async () => {
    if (!phoneCode || phoneCode.length !== 6) {
      toast.error('أدخل رمز التحقق الصحيح');
      return;
    }

    setLoading((prev) => ({ ...prev, phone: true }));
    try {
      const response = await fetch(`${API_BASE}/api/v1/accounts/auth/otp/verify/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: user?.phone_number,
          code: phoneCode,
          purpose: 'verification',
        }),
      });

      if (response.ok) {
        setIsVerified((prev) => ({ ...prev, phone: true }));
        setPhoneCode('');
        toast.success('تم التحقق من رقم الهاتف بنجاح');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || errorData.detail || 'رمز التحقق غير صحيح');
      }
    } catch (error) {
      toast.error('حدث خطأ في التحقق من رقم الهاتف');
    } finally {
      setLoading((prev) => ({ ...prev, phone: false }));
    }
  };

  const handleResendEmail = async () => {
    setCanResend((prev) => ({ ...prev, email: false }));
    setResendCountdown((prev) => ({ ...prev, email: 60 }));

    try {
      const response = await fetch(`${API_BASE}/api/v1/accounts/auth/otp/send/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: user?.phone_number,
          purpose: 'email_verification',
        }),
      });

      if (response.ok) {
        toast.success('تم إرسال رمز التحقق إلى بريدك الإلكتروني');
      } else {
        toast.error('فشل في إرسال الرمز');
        setCanResend((prev) => ({ ...prev, email: true }));
        setResendCountdown((prev) => ({ ...prev, email: 0 }));
      }
    } catch (error) {
      toast.error('حدث خطأ في إرسال الرمز');
      setCanResend((prev) => ({ ...prev, email: true }));
      setResendCountdown((prev) => ({ ...prev, email: 0 }));
    }
  };

  const handleResendPhone = async () => {
    setCanResend((prev) => ({ ...prev, phone: false }));
    setResendCountdown((prev) => ({ ...prev, phone: 60 }));

    try {
      const response = await fetch(`${API_BASE}/api/v1/accounts/auth/otp/send/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: user?.phone_number,
          purpose: 'verification',
        }),
      });

      if (response.ok) {
        toast.success('تم إرسال رمز التحقق إلى هاتفك');
      } else {
        toast.error('فشل في إرسال الرمز');
        setCanResend((prev) => ({ ...prev, phone: true }));
        setResendCountdown((prev) => ({ ...prev, phone: 0 }));
      }
    } catch (error) {
      toast.error('حدث خطأ في إرسال الرمز');
      setCanResend((prev) => ({ ...prev, phone: true }));
      setResendCountdown((prev) => ({ ...prev, phone: 0 }));
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">يرجى تسجيل الدخول أولاً</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-secondary-600 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            تحقق من حسابك
          </h1>
          <p className="text-white/90 text-lg">
            تحقق من بريدك الإلكتروني ورقم هاتفك لتفعيل جميع الميزات
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Email Verification */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  التحقق من البريد الإلكتروني
                </h3>
              </div>
              {isVerified.email && (
                <CheckCircle className="w-6 h-6 text-green-500" />
              )}
            </div>

            {isVerified.email ? (
              <div className="text-center py-6">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-green-700 font-medium">
                  تم التحقق من البريد الإلكتروني!
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  {user.email}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">
                  تم إرسال رمز التحقق إلى بريدك الإلكتروني
                </p>
                <p className="text-gray-600 mb-4 text-sm">
                  {user.email}
                </p>
                <div className="space-y-4">
                  <Input
                    type="text"
                    placeholder="أدخل رمز التحقق"
                    value={emailCode}
                    onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="text-center text-2xl tracking-widest"
                  />
                  <Button
                    onClick={handleVerifyEmail}
                    disabled={emailCode.length !== 6 || loading.email}
                    className="w-full"
                    isLoading={loading.email}
                  >
                    التحقق من البريد
                  </Button>
                  {canResend.email ? (
                    <Button
                      variant="ghost"
                      onClick={handleResendEmail}
                      className="w-full"
                      leftIcon={<RefreshCw className="w-4 h-4" />}
                    >
                      إعادة إرسال الرمز
                    </Button>
                  ) : (
                    <p className="text-center text-gray-500 text-sm">
                      يمكنك إعادة الإرسال خلال {resendCountdown.email} ثانية
                    </p>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* Phone Verification */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Phone className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  التحقق من رقم الهاتف
                </h3>
              </div>
              {isVerified.phone && (
                <CheckCircle className="w-6 h-6 text-green-500" />
              )}
            </div>

            {isVerified.phone ? (
              <div className="text-center py-6">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-green-700 font-medium">
                  تم التحقق من رقم الهاتف!
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  {user.phone_number}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">
                  تم إرسال رمز التحقق برسالة نصية إلى هاتفك
                </p>
                <p className="text-gray-600 mb-4 text-sm">
                  {user.phone_number}
                </p>
                <div className="space-y-4">
                  <Input
                    type="text"
                    placeholder="أدخل رمز التحقق"
                    value={phoneCode}
                    onChange={(e) => setPhoneCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="text-center text-2xl tracking-widest"
                  />
                  <Button
                    onClick={handleVerifyPhone}
                    disabled={phoneCode.length !== 6 || loading.phone}
                    className="w-full"
                    isLoading={loading.phone}
                  >
                    التحقق من الهاتف
                  </Button>
                  {canResend.phone ? (
                    <Button
                      variant="ghost"
                      onClick={handleResendPhone}
                      className="w-full"
                      leftIcon={<RefreshCw className="w-4 h-4" />}
                    >
                      إعادة إرسال الرمز
                    </Button>
                  ) : (
                    <p className="text-center text-gray-500 text-sm">
                      يمكنك إعادة الإرسال خلال {resendCountdown.phone} ثانية
                    </p>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>

        <Card className="mt-6 p-6 bg-amber-50 border-amber-200">
          <div className="flex items-start gap-4">
            <Clock className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                لماذا التحقق من حسابك؟
              </h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• أمان حسابك محسّن</li>
                <li>• فتح الميزات المتقدمة</li>
                <li>• تفعيل خدمات الحجز</li>
                <li>• تلقي الإشعارات المهمة</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VerifyAccountPage;
