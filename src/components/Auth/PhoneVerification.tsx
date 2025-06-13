import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Phone, Shield, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function PhoneVerification() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('otp');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [message, setMessage] = useState({ type: '', text: '' });
  const { sendOTP, verifyPhone } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (!/^01[0-9]{9}$/.test(phoneNumber)) {
      setMessage({ type: 'error', text: 'رقم الهاتف غير صحيح' });
      setLoading(false);
      return;
    }

    try {
      const result = await sendOTP(phoneNumber);
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        setStep('otp');
        setCountdown(300); // 5 minutes
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء إرسال الرمز' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (!/^[0-9]{6}$/.test(otp)) {
      setMessage({ type: 'error', text: 'رمز التحقق يجب أن يكون 6 أرقام' });
      setLoading(false);
      return;
    }

    try {
      const result = await verifyPhone(phoneNumber, otp);
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء التحقق' });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    try {
      const result = await sendOTP(phoneNumber);
      if (result.success) {
        setMessage({ type: 'success', text: 'تم إرسال رمز جديد' });
        setCountdown(300);
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء إعادة الإرسال' });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            تأكيد رقم الهاتف
          </h2>
          <p className="mt-2 text-gray-600">
            {step === 'phone' 
              ? 'أدخل رقم هاتفك لإرسال رمز التحقق'
              : 'أدخل رمز التحقق المرسل إلى هاتفك'
            }
          </p>
        </div>

        {step === 'phone' ? (
          <form onSubmit={handleSendOTP} className="mt-8 space-y-6">
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                رقم الهاتف
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phoneNumber"
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="block w-full pr-10 px-3 py-3 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                  placeholder="01xxxxxxxxx"
                />
              </div>
            </div>

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
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="mt-8 space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                رمز التحقق
              </label>
              <input
                id="otp"
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="block w-full px-3 py-3 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-2xl tracking-widest"
                placeholder="000000"
              />
              <p className="mt-2 text-sm text-gray-500 text-center">
                تم إرسال الرمز إلى {phoneNumber}
              </p>
            </div>

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
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'جاري التحقق...' : 'تأكيد الرمز'}
            </button>

            <div className="text-center space-y-2">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={countdown > 0 || loading}
                className="text-sm text-blue-600 hover:text-blue-500 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <RefreshCw className="w-4 h-4 ml-1" />
                {countdown > 0 ? `إعادة الإرسال خلال ${formatTime(countdown)}` : 'إعادة إرسال الرمز'}
              </button>
              
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                تغيير رقم الهاتف
              </button>
            </div>
          </form>
        )}

        <div className="text-center">
          <Link to="/login" className="text-sm text-blue-600 hover:text-blue-500">
            العودة لتسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
}