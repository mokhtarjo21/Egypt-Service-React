import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { 
  Users, 
  Briefcase, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  Eye,
  Shield,
  FileText,
  TrendingUp,
  Download,
  BarChart3
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

import { RootState } from '../../store/store';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

// Import the new Safety Dashboard
const SafetyDashboard = React.lazy(() => import('./SafetyDashboard'));

interface AdminStats {
  total_users: number;
  pending_users: number;
  total_services: number;
  pending_services: number;
  total_reports: number;
  pending_reports: number;
}

interface User {
  id: string;
  full_name: string;
  phone_number: string;
  status: string;
  role: string;
  is_phone_verified: boolean;
  date_joined: string;
  services_count: number;
  documents_count: number;
}

interface Service {
  id: string;
  title_ar: string;
  owner: {
    full_name: string;
    phone_number: string;
  };
  status: string;
  created_at: string;
  price: number;
  images_count: number;
}

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'services' | 'reports'>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [adminAnalytics, setAdminAnalytics] = useState<any>(null);
  const [timeFilter, setTimeFilter] = useState(30);

  // Check admin access
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">غير مصرح</h2>
          <p className="text-gray-600">ليس لديك صلاحية للوصول إلى لوحة الإدارة</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadStats();
    loadAdminAnalytics();
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'services') loadServices();
  }, [activeTab, timeFilter]);

  const loadStats = async () => {
    // Mock stats - replace with actual API call
    setStats({
      total_users: 1247,
      pending_users: 23,
      total_services: 856,
      pending_services: 12,
      total_reports: 45,
      pending_reports: 8,
    });
  };

  const loadAdminAnalytics = async () => {
    try {
      const response = await fetch(`/api/v1/analytics/admin/?days=${timeFilter}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setAdminAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to load admin analytics:', error);
    }
  };

  const exportAdminData = async () => {
    try {
      const response = await fetch(`/api/v1/analytics/export/?days=${timeFilter}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `admin_analytics_${timeFilter}days.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      // Mock data - replace with actual API call
      setUsers([
        {
          id: '1',
          full_name: 'أحمد محمد علي',
          phone_number: '+201012345678',
          status: 'pending',
          role: 'user',
          is_phone_verified: true,
          date_joined: '2024-01-15T10:30:00Z',
          services_count: 2,
          documents_count: 1,
        },
        {
          id: '2',
          full_name: 'فاطمة حسن',
          phone_number: '+201098765432',
          status: 'verified',
          role: 'user',
          is_phone_verified: true,
          date_joined: '2024-01-10T14:20:00Z',
          services_count: 5,
          documents_count: 2,
        },
      ]);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadServices = async () => {
    setIsLoading(true);
    try {
      // Mock data - replace with actual API call
      setServices([
        {
          id: '1',
          title_ar: 'صيانة أجهزة كهربائية',
          owner: {
            full_name: 'أحمد محمد',
            phone_number: '+201012345678',
          },
          status: 'pending',
          created_at: '2024-01-20T09:15:00Z',
          price: 150,
          images_count: 3,
        },
        {
          id: '2',
          title_ar: 'دروس خصوصية رياضيات',
          owner: {
            full_name: 'فاطمة علي',
            phone_number: '+201098765432',
          },
          status: 'pending',
          created_at: '2024-01-19T16:45:00Z',
          price: 200,
          images_count: 1,
        },
      ]);
    } catch (error) {
      console.error('Failed to load services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserStatusUpdate = async (userId: string, newStatus: string, reason?: string) => {
    try {
      // API call to update user status
      const response = await fetch(`/api/v1/accounts/admin/users/${userId}/status/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ status: newStatus, reason }),
      });

      if (response.ok) {
        loadUsers(); // Refresh users list
        setShowUserModal(false);
        // Show success message
      }
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  const handleServiceStatusUpdate = async (serviceId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      const response = await fetch(`/api/v1/services/admin/services/${serviceId}/status/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ action, reason }),
      });

      if (response.ok) {
        loadServices(); // Refresh services list
        setShowServiceModal(false);
        // Show success message
      }
    } catch (error) {
      console.error('Failed to update service status:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: t('admin.serviceStatus.pending') },
      verified: { color: 'bg-green-100 text-green-800', label: t('admin.serviceStatus.verified') },
      approved: { color: 'bg-green-100 text-green-800', label: t('admin.serviceStatus.approved') },
      rejected: { color: 'bg-red-100 text-red-800', label: t('admin.serviceStatus.rejected') },
      suspended: { color: 'bg-orange-100 text-orange-800', label: t('admin.serviceStatus.suspended') },
      blocked: { color: 'bg-red-100 text-red-800', label: t('admin.serviceStatus.blocked') },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: TrendingUp },
    { id: 'users', label: 'المستخدمون', icon: Users },
    { id: 'services', label: 'الخدمات', icon: Briefcase },
    { id: 'safety', label: 'الأمان والثقة', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            لوحة الإدارة
          </h1>
          <p className="text-gray-600">
            إدارة المستخدمين والخدمات والمحتوى
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 rtl:space-x-reverse">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-2 rtl:mr-0 rtl:ml-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-8">
            {/* Time Filter */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                نظرة عامة على المنصة
              </h2>
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value={7}>آخر 7 أيام</option>
                  <option value={30}>آخر 30 يوم</option>
                  <option value={90}>آخر 90 يوم</option>
                </select>
                <Button variant="outline" size="sm" onClick={exportAdminData}>
                  <Download className="w-4 h-4 mr-2" />
                  تصدير
                </Button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-blue-100">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="mr-4 rtl:mr-0 rtl:ml-4">
                    <p className="text-sm font-medium text-gray-600">إجمالي المستخدمين</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_users}</p>
                    <p className="text-sm text-yellow-600">{stats.pending_users} معلق</p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-green-100">
                    <Briefcase className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="mr-4 rtl:mr-0 rtl:ml-4">
                    <p className="text-sm font-medium text-gray-600">إجمالي الخدمات</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_services}</p>
                    <p className="text-sm text-yellow-600">{stats.pending_services} معلق</p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-red-100">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="mr-4 rtl:mr-0 rtl:ml-4">
                    <p className="text-sm font-medium text-gray-600">البلاغات</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_reports}</p>
                    <p className="text-sm text-red-600">{stats.pending_reports} معلق</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Analytics Charts */}
            {adminAnalytics && (
              <div className="grid lg:grid-cols-2 gap-8">
                {/* User Growth */}
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    نمو المستخدمين
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={adminAnalytics.daily_platform_data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="total_users" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        name="إجمالي المستخدمين"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="verified_users" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        name="المستخدمون الموثقون"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>

                {/* Governorate Performance */}
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    الأداء حسب المحافظة
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={adminAnalytics.governorate_breakdown}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="governorate__name_ar" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="total_services" fill="#3B82F6" name="الخدمات" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </div>
            )}

            {/* Cohort Retention */}
            {adminAnalytics?.cohort_retention && (
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  معدل الاحتفاظ بالمستخدمين
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={adminAnalytics.cohort_retention}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="retention_rate" fill="#10B981" name="معدل الاحتفاظ %" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                إجراءات سريعة
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => setActiveTab('users')}
                >
                  <Users className="w-4 h-4 mr-2" />
                  مراجعة المستخدمين
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => setActiveTab('services')}
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  مراجعة الخدمات
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => setActiveTab('reports')}
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  مراجعة البلاغات
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  التقارير
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                إدارة المستخدمين
              </h2>
              <div className="flex space-x-4 rtl:space-x-reverse">
                <select className="px-3 py-2 border border-gray-300 rounded-md">
                  <option value="">جميع الحالات</option>
                  <option value="pending">معلق</option>
                  <option value="verified">موثق</option>
                  <option value="rejected">مرفوض</option>
                  <option value="suspended">معلق</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          المستخدم
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الحالة
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الخدمات
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          تاريخ التسجيل
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الإجراءات
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                              </div>
                              <div className="mr-4 rtl:mr-0 rtl:ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.full_name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {user.phone_number}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(user.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.services_count} خدمة
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.date_joined).toLocaleDateString('ar-EG')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowUserModal(true);
                              }}
                              leftIcon={<Eye className="w-4 h-4" />}
                            >
                              عرض
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                إدارة الخدمات
              </h2>
              <div className="flex space-x-4 rtl:space-x-reverse">
                <select className="px-3 py-2 border border-gray-300 rounded-md">
                  <option value="">جميع الحالات</option>
                  <option value="pending">معلق</option>
                  <option value="approved">مُوافق عليه</option>
                  <option value="rejected">مرفوض</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الخدمة
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          مقدم الخدمة
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الحالة
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          السعر
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الإجراءات
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {services.map((service) => (
                        <tr key={service.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {service.title_ar}
                            </div>
                            <div className="text-sm text-gray-500">
                              {service.images_count} صورة
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {service.owner.full_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {service.owner.phone_number}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(service.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {service.price} ج.م
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedService(service);
                                setShowServiceModal(true);
                              }}
                              leftIcon={<Eye className="w-4 h-4" />}
                            >
                              مراجعة
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Safety Tab */}
        {activeTab === 'safety' && (
          <React.Suspense fallback={<LoadingSpinner size="lg" />}>
            <SafetyDashboard />
          </React.Suspense>
        )}

        {/* User Detail Modal */}
        <Modal
          isOpen={showUserModal}
          onClose={() => setShowUserModal(false)}
          title="تفاصيل المستخدم"
          size="lg"
        >
          {selectedUser && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">المعلومات الأساسية</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>الاسم:</strong> {selectedUser.full_name}</p>
                    <p><strong>الهاتف:</strong> {selectedUser.phone_number}</p>
                    <p><strong>الحالة:</strong> {getStatusBadge(selectedUser.status)}</p>
                    <p><strong>الخدمات:</strong> {selectedUser.services_count}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">الإحصائيات</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>تاريخ التسجيل:</strong> {new Date(selectedUser.date_joined).toLocaleDateString('ar-EG')}</p>
                    <p><strong>المستندات:</strong> {selectedUser.documents_count}</p>
                    <p><strong>التحقق:</strong> {selectedUser.is_phone_verified ? 'مُحقق' : 'غير مُحقق'}</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 rtl:space-x-reverse">
                <Button
                  variant="outline"
                  onClick={() => handleUserStatusUpdate(selectedUser.id, 'verified')}
                  leftIcon={<CheckCircle className="w-4 h-4" />}
                >
                  توثيق
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleUserStatusUpdate(selectedUser.id, 'rejected', 'مستندات غير واضحة')}
                  leftIcon={<XCircle className="w-4 h-4" />}
                >
                  رفض
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleUserStatusUpdate(selectedUser.id, 'suspended')}
                  leftIcon={<Clock className="w-4 h-4" />}
                >
                  تعليق
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Service Detail Modal */}
        <Modal
          isOpen={showServiceModal}
          onClose={() => setShowServiceModal(false)}
          title="مراجعة الخدمة"
          size="lg"
        >
          {selectedService && (
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">تفاصيل الخدمة</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>العنوان:</strong> {selectedService.title_ar}</p>
                  <p><strong>مقدم الخدمة:</strong> {selectedService.owner.full_name}</p>
                  <p><strong>السعر:</strong> {selectedService.price} ج.م</p>
                  <p><strong>الصور:</strong> {selectedService.images_count}</p>
                  <p><strong>تاريخ الإنشاء:</strong> {new Date(selectedService.created_at).toLocaleDateString('ar-EG')}</p>
                </div>
              </div>

              <div className="flex space-x-4 rtl:space-x-reverse">
                <Button
                  onClick={() => handleServiceStatusUpdate(selectedService.id, 'approve')}
                  leftIcon={<CheckCircle className="w-4 h-4" />}
                >
                  موافقة
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleServiceStatusUpdate(selectedService.id, 'reject', 'محتوى غير مناسب')}
                  leftIcon={<XCircle className="w-4 h-4" />}
                >
                  رفض
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default AdminDashboard;