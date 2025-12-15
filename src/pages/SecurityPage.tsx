import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Shield,
  Smartphone,
  Key,
  AlertTriangle,
  CheckCircle,
  Monitor,
  MapPin,
  Clock,
  Download,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import QRCode from 'react-qr-code';
import toast from 'react-hot-toast';

import { RootState } from '../store/store';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
 const API_BASE =
  (import.meta.env?.VITE_API_BASE || "http://192.168.1.7:8000") ;
interface Device {
  id: string;
  device_name: string;
  device_fingerprint: string;
  ip_address: string;
  location: string;
  last_seen: string;
  is_trusted: boolean;
  is_current: boolean;
}

interface SecurityAlert {
  id: string;
  alert_type: string;
  message: string;
  ip_address: string;
  created_at: string;
  is_resolved: boolean;
}

const SecurityPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [devices, setDevices] = useState<Device[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [qrCodeData, setQrCodeData] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      // Load devices
      const devicesResponse = await fetch(API_BASE+'/api/v1/accounts/users/sessions/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (devicesResponse.ok) {
        const devicesData = await devicesResponse.json();
        setDevices(devicesData);
      }

      // Load security alerts
      const alertsResponse = await fetch(API_BASE+'/api/v1/accounts/security/alerts/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        setSecurityAlerts(alertsData);
      }

      // Check 2FA status
      const twoFactorResponse = await fetch(API_BASE+'/api/v1/accounts/security/2fa/status/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (twoFactorResponse.ok) {
        const twoFactorData = await twoFactorResponse.json();
        setTwoFactorEnabled(twoFactorData.enabled);
      }
    } catch (error) {
      console.error('Failed to load security data:', error);
    }
  };

  const enable2FA = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_BASE+'/api/v1/accounts/security/2fa/enable/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setQrCodeData(data.qr_code_url);
        setShowQRModal(true);
      }
    } catch (error) {
      toast.error('فشل في تفعيل المصادقة الثنائية');
    } finally {
      setIsLoading(false);
    }
  };

  const verify2FA = async () => {
    try {
      const response = await fetch(API_BASE+'/api/v1/accounts/security/2fa/verify/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ code: verificationCode }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setBackupCodes(data.backup_codes);
        setTwoFactorEnabled(true);
        setShowQRModal(false);
        setShowBackupCodes(true);
        toast.success('تم تفعيل المصادقة الثنائية بنجاح');
      } else {
        toast.error('رمز التحقق غير صحيح');
      }
    } catch (error) {
      toast.error('حدث خطأ في التحقق');
    }
  };

  const disable2FA = async () => {
    try {
      const response = await fetch(API_BASE+'/api/v1/accounts/security/2fa/disable/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (response.ok) {
        setTwoFactorEnabled(false);
        toast.success('تم إلغاء تفعيل المصادقة الثنائية');
      }
    } catch (error) {
      toast.error('فشل في إلغاء التفعيل');
    }
  };

  const revokeDevice = async (deviceId: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/accounts/security/devices/${deviceId}/revoke/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (response.ok) {
        setDevices(prev => prev.filter(device => device.id !== deviceId));
        toast.success('تم إلغاء الجلسة بنجاح');
      }
    } catch (error) {
      toast.error('فشل في إلغاء الجلسة');
    }
  };

  const logoutAllSessions = async () => {
    try {
      const response = await fetch(API_BASE+'/api/v1/accounts/users/logout_all_sessions/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (response.ok) {
        toast.success('تم تسجيل الخروج من جميع الأجهزة');
        // Reload page to force re-authentication
        window.location.reload();
      }
    } catch (error) {
      toast.error('فشل في تسجيل الخروج');
    }
  };

  const downloadBackupCodes = () => {
    const content = backupCodes.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup_codes.txt';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !newPasswordConfirm) {
      toast.error('جميع الحقول مطلوبة');
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      toast.error('كلمات المرور غير متطابقة');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(API_BASE + '/api/v1/accounts/profile/change-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
          new_password_confirm: newPasswordConfirm,
        }),
      });

      if (response.ok) {
        toast.success('تم تحديث كلمة المرور بنجاح');
        setOldPassword('');
        setNewPassword('');
        setNewPasswordConfirm('');
        setShowChangePasswordModal(false);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || errorData.detail || 'فشل في تحديث كلمة المرور');
      }
    } catch (error) {
      toast.error('حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>يرجى تسجيل الدخول لعرض إعدادات الأمان</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            إعدادات الأمان
          </h1>
          <p className="text-gray-600">
            إدارة أمان حسابك وأجهزتك المتصلة
          </p>
        </div>

        <div className="space-y-8">
          {/* Two-Factor Authentication */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  المصادقة الثنائية (2FA)
                </h3>
                <p className="text-gray-600">
                  أضف طبقة حماية إضافية لحسابك
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                twoFactorEnabled 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {twoFactorEnabled ? 'مُفعل' : 'غير مُفعل'}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Smartphone className="w-8 h-8 text-gray-400 mr-4" />
                <div>
                  <p className="font-medium text-gray-900">
                    تطبيق المصادقة
                  </p>
                  <p className="text-sm text-gray-600">
                    استخدم Google Authenticator أو تطبيق مشابه
                  </p>
                </div>
              </div>
              
              {twoFactorEnabled ? (
                <div className="flex space-x-2 rtl:space-x-reverse">
                  <Button variant="outline" size="sm" onClick={() => setShowBackupCodes(true)}>
                    رموز الاحتياط
                  </Button>
                  <Button variant="outline" size="sm" onClick={disable2FA}>
                    إلغاء التفعيل
                  </Button>
                </div>
              ) : (
                <Button onClick={enable2FA} isLoading={isLoading}>
                  تفعيل
                </Button>
              )}
            </div>
          </Card>

          {/* Active Devices */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                الأجهزة المتصلة
              </h3>
              <Button variant="outline" size="sm" onClick={logoutAllSessions}>
                تسجيل خروج من جميع الأجهزة
              </Button>
            </div>

            <div className="space-y-4">
              {devices.map((device) => (
                <div key={device.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Monitor className="w-8 h-8 text-gray-400 mr-4" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">
                          {device.device_name || 'جهاز غير معروف'}
                        </p>
                        {device.is_current && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            الجهاز الحالي
                          </span>
                        )}
                        {device.is_trusted && (
                          <Shield className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        {device.location || device.ip_address}
                        <Clock className="w-4 h-4 mr-1 ml-4" />
                        آخر نشاط: {new Date(device.last_seen).toLocaleDateString('ar-EG')}
                      </div>
                    </div>
                  </div>
                  
                  {!device.is_current && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => revokeDevice(device.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Security Alerts */}
          <Card>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              تنبيهات الأمان
            </h3>

            <div className="space-y-4">
              {securityAlerts.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-600">لا توجد تنبيهات أمان</p>
                  <p className="text-sm text-gray-500">حسابك آمن</p>
                </div>
              ) : (
                securityAlerts.map((alert) => (
                  <div key={alert.id} className={`p-4 rounded-lg border ${
                    alert.is_resolved 
                      ? 'bg-gray-50 border-gray-200' 
                      : 'bg-yellow-50 border-yellow-200'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <AlertTriangle className={`w-5 h-5 mt-0.5 mr-3 ${
                          alert.is_resolved ? 'text-gray-400' : 'text-yellow-600'
                        }`} />
                        <div>
                          <p className="font-medium text-gray-900">
                            {alert.message}
                          </p>
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <MapPin className="w-4 h-4 mr-1" />
                            {alert.ip_address}
                            <Clock className="w-4 h-4 mr-1 ml-4" />
                            {new Date(alert.created_at).toLocaleDateString('ar-EG')}
                          </div>
                        </div>
                      </div>
                      
                      {alert.is_resolved && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Password Security */}
          <Card>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              أمان كلمة المرور
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Key className="w-8 h-8 text-gray-400 mr-4" />
                  <div>
                    <p className="font-medium text-gray-900">كلمة المرور</p>
                    <p className="text-sm text-gray-600">آخر تحديث منذ 3 أشهر</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowChangePasswordModal(true)}>
                  تغيير كلمة المرور
                </Button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">نصائح الأمان</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>استخدم كلمة مرور قوية ومعقدة</li>
                      <li>لا تشارك كلمة المرور مع أي شخص</li>
                      <li>فعل المصادقة الثنائية لحماية إضافية</li>
                      <li>راجع الأجهزة المتصلة بانتظام</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* 2FA Setup Modal */}
      <Modal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        title="تفعيل المصادقة الثنائية"
        size="md"
      >
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              امسح رمز QR باستخدام تطبيق Google Authenticator
            </p>
            {qrCodeData && (
              <div className="bg-white p-4 rounded-lg inline-block">
                <QRCode value={qrCodeData} size={200} />
              </div>
            )}
          </div>

          <Input
            label="رمز التحقق من التطبيق"
            placeholder="123456"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            maxLength={6}
          />

          <div className="flex space-x-4 rtl:space-x-reverse">
            <Button
              variant="outline"
              onClick={() => setShowQRModal(false)}
              className="flex-1"
            >
              إلغاء
            </Button>
            <Button
              onClick={verify2FA}
              className="flex-1"
              disabled={verificationCode.length !== 6}
            >
              تحقق وتفعيل
            </Button>
          </div>
        </div>
      </Modal>

      {/* Backup Codes Modal */}
      <Modal
        isOpen={showBackupCodes}
        onClose={() => setShowBackupCodes(false)}
        title="رموز الاحتياط"
        size="md"
      >
        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">مهم جداً</p>
                <p>احفظ هذه الرموز في مكان آمن. يمكن استخدام كل رمز مرة واحدة فقط.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 font-mono text-center">
            {backupCodes.map((code, index) => (
              <div key={index} className="bg-gray-100 p-3 rounded border">
                {code}
              </div>
            ))}
          </div>

          <div className="flex space-x-4 rtl:space-x-reverse">
            <Button
              variant="outline"
              onClick={downloadBackupCodes}
              className="flex-1"
              leftIcon={<Download className="w-4 h-4" />}
            >
              تحميل
            </Button>
            <Button
              onClick={() => setShowBackupCodes(false)}
              className="flex-1"
            >
              تم الحفظ
            </Button>
          </div>
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        isOpen={showChangePasswordModal}
        onClose={() => {
          setShowChangePasswordModal(false);
          setOldPassword('');
          setNewPassword('');
          setNewPasswordConfirm('');
        }}
        title="تغيير كلمة المرور"
        size="md"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              كلمة المرور الحالية
            </label>
            <div className="relative">
              <input
                type={showOldPassword ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              كلمة المرور الجديدة
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تأكيد كلمة المرور الجديدة
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={newPasswordConfirm}
                onChange={(e) => setNewPasswordConfirm(e.target.value)}
                placeholder="••••••"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              كلمة المرور يجب أن تكون 8 أحرف على الأقل وتحتوي على أحرف وأرقام
            </p>
          </div>

          <div className="flex space-x-4 rtl:space-x-reverse">
            <Button
              variant="outline"
              onClick={() => {
                setShowChangePasswordModal(false);
                setOldPassword('');
                setNewPassword('');
                setNewPasswordConfirm('');
              }}
              className="flex-1"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleChangePassword}
              className="flex-1"
              isLoading={isLoading}
              disabled={!oldPassword || !newPassword || !newPasswordConfirm}
            >
              تحديث كلمة المرور
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SecurityPage;