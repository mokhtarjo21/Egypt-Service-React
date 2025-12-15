import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, CheckCircle, Clock } from 'lucide-react';

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';

const VerifyAccountPage: React.FC = () => {
  const { t } = useTranslation();
  const [verificationMethod, setVerificationMethod] = useState<'email' | 'phone'>('email');
  const [code, setCode] = useState('');
  const [isVerified, setIsVerified] = useState({
    email: false,
    phone: false,
  });
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsVerified(prev => ({
      ...prev,
      [verificationMethod]: true,
    }));
    setCode('');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-secondary-600 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            {t('profile.emailVerification')}
          </h1>
          <p className="text-white/90 text-lg">
            Verify your email and phone to unlock all features
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
                  Email Verification
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
                  Email verified successfully!
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  Your email address has been confirmed
                </p>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-4">
                  A verification code has been sent to your email address.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Verification Code
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      maxLength={6}
                    />
                  </div>
                  <Button
                    onClick={handleVerify}
                    disabled={code.length !== 6 || loading}
                    className="w-full"
                  >
                    {loading ? 'Verifying...' : 'Verify Email'}
                  </Button>
                  <button className="text-primary-600 hover:text-primary-700 text-sm font-medium w-full">
                    Resend Code
                  </button>
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
                  Phone Verification
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
                  Phone verified successfully!
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  Your phone number has been confirmed
                </p>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-4">
                  An SMS verification code has been sent to your phone.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Verification Code
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      maxLength={6}
                    />
                  </div>
                  <Button
                    onClick={() => {
                      setVerificationMethod('phone');
                      handleVerify();
                    }}
                    disabled={code.length !== 6 || loading}
                    className="w-full"
                  >
                    {loading ? 'Verifying...' : 'Verify Phone'}
                  </Button>
                  <button className="text-primary-600 hover:text-primary-700 text-sm font-medium w-full">
                    Resend Code
                  </button>
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
                Why verify your account?
              </h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Enhanced account security</li>
                <li>• Unlock premium features</li>
                <li>• Enable service booking</li>
                <li>• Receive important notifications</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VerifyAccountPage;
