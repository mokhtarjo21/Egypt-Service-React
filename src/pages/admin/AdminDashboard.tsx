import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  User,
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
  MapPin,
  Folder
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
  const API_BASE = (import.meta as any).env?.VITE_API_BASE || "http://localhost:8000";
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'services' | 'reports' | 'safety'>('overview');
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('adminDashboard.unauthorized')}</h2>
          <p className="text-gray-600">{t('adminDashboard.noAccess')}</p>
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
    const response = await fetch(`${API_BASE}/api/v1/analytics/admin/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
    });

    setStats({ ...(await response.json()) });
  };

  const loadAdminAnalytics = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/analytics/admin/?days=${timeFilter}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      const contentType = response.headers.get('content-type');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      if (!contentType?.includes('application/json')) {
        const html = await response.text();
        console.error('Expected JSON but got HTML:', html);
        return;
      }

      const data = await response.json();
      setAdminAnalytics(data);



    } catch (error) {
      console.error('Failed to load admin analytics:', error);
    }
  };

  const exportAdminData = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/analytics/export/?days=${timeFilter}`, {
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
      const response = await fetch(API_BASE + '/api/v1/accounts/admin/users/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      const data = await response.json();

      setUsers(data.results || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadServices = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_BASE + '/api/v1/services/admin/services/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      const data = await response.json();

      setServices([...data.results] || []);
    } catch (error) {
      console.error('Failed to load services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserStatusUpdate = async (userId: string, newStatus: string, reason?: string) => {
    try {
      // API call to update user status
      const response = await fetch(`${API_BASE}/api/v1/accounts/admin/users/${userId}/status/`, {
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
      const response = await fetch(`${API_BASE}/api/v1/services/admin/services/${serviceId}/status/`, {
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
    { id: 'overview', label: t('adminDashboard.tabs.overview'), icon: TrendingUp },
    { id: 'users', label: t('adminDashboard.tabs.users'), icon: Users },
    { id: 'services', label: t('adminDashboard.tabs.services'), icon: Briefcase },
    { id: 'safety', label: t('adminDashboard.tabs.safety'), icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('adminDashboard.title')}
          </h1>
          <p className="text-gray-600">
            {t('adminDashboard.subtitle')}
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
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
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
                {t('adminDashboard.overview.title')}
              </h2>
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value={7}>{t('adminDashboard.overview.last7Days')}</option>
                  <option value={30}>{t('adminDashboard.overview.last30Days')}</option>
                  <option value={90}>{t('adminDashboard.overview.last90Days')}</option>
                </select>
                <Button variant="outline" size="sm" onClick={exportAdminData}>
                  <Download className="w-4 h-4 mr-2" />
                  {t('adminDashboard.overview.export')}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-blue-100">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="mr-4 rtl:mr-0 rtl:ml-4">
                    <p className="text-sm font-medium text-gray-600">{t('adminDashboard.overview.totalUsers')}</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_users}</p>
                    <p className="text-sm text-yellow-600">{stats.pending_users} {t('adminDashboard.overview.pendingUsers')}</p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-green-100">
                    <Briefcase className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="mr-4 rtl:mr-0 rtl:ml-4">
                    <p className="text-sm font-medium text-gray-600">{t('adminDashboard.overview.totalServices')}</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_services}</p>
                    <p className="text-sm text-yellow-600">{stats.pending_services} {t('adminDashboard.overview.pendingServices')}</p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-red-100">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="mr-4 rtl:mr-0 rtl:ml-4">
                    <p className="text-sm font-medium text-gray-600">{t('adminDashboard.overview.reports')}</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_reports}</p>
                    <p className="text-sm text-red-600">{stats.pending_reports} {t('adminDashboard.overview.pendingReports')}</p>
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
                  {t('adminDashboard.overview.retentionRateTitle')}
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={adminAnalytics.cohort_retention}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="retention_rate" fill="#10B981" name={t('adminDashboard.overview.retentionRate')} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('adminDashboard.overview.quickActions')}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => setActiveTab('users')}
                >
                  <Users className="w-4 h-4 mr-2" />
                  {t('adminDashboard.overview.reviewUsers')}
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => setActiveTab('services')}
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  {t('adminDashboard.overview.reviewServices')}
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => setActiveTab('reports')}
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  {t('adminDashboard.overview.reviewReports')}
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {t('adminDashboard.overview.manageReports')}
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => window.location.href = '/admin/categories'}
                >
                  <Folder className="w-4 h-4 mr-2" />
                  {t('adminDashboard.tabs.categories')}
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => window.location.href = '/admin/locations'}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  {t('adminDashboard.tabs.locations')}
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
                {t('adminDashboard.users.title')}
              </h2>
              <div className="flex space-x-4 rtl:space-x-reverse">
                <select className="px-3 py-2 border border-gray-300 rounded-md">
                  <option value="">{t('adminDashboard.users.allStatuses')}</option>
                  <option value="pending">{t('adminDashboard.users.pending')}</option>
                  <option value="verified">{t('adminDashboard.users.verified')}</option>
                  <option value="rejected">{t('adminDashboard.users.rejected')}</option>
                  <option value="suspended">{t('adminDashboard.users.suspended')}</option>
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
                          {t('adminDashboard.users.tableHead.user')}
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('adminDashboard.users.tableHead.status')}
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('adminDashboard.users.tableHead.services')}
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('adminDashboard.users.tableHead.joinDate')}
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('adminDashboard.users.tableHead.actions')}
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
                            {user.services_count} {t('adminDashboard.users.servicesCount')}
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
                              {t('adminDashboard.users.view')}
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
                {t('adminDashboard.services.title')}
              </h2>
              <div className="flex space-x-4 rtl:space-x-reverse">
                <select className="px-3 py-2 border border-gray-300 rounded-md">
                  <option value="">{t('adminDashboard.services.allStatuses')}</option>
                  <option value="pending">{t('adminDashboard.services.pending')}</option>
                  <option value="approved">{t('adminDashboard.services.approved')}</option>
                  <option value="rejected">{t('adminDashboard.services.rejected')}</option>
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
                          {t('adminDashboard.services.tableHead.service')}
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('adminDashboard.services.tableHead.provider')}
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('adminDashboard.services.tableHead.status')}
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('adminDashboard.services.tableHead.price')}
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('adminDashboard.services.tableHead.actions')}
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
                              {service.images_count} {t('adminDashboard.services.imagesCount')}
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
                            {service.price} {t('adminDashboard.services.currency')}
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
                              {t('adminDashboard.services.review')}
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

        <Modal
          isOpen={showUserModal}
          onClose={() => setShowUserModal(false)}
          title={t('adminDashboard.users.modal.title')}
          size="lg"
        >
          {selectedUser && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">{t('adminDashboard.users.modal.basicInfo')}</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>{t('adminDashboard.users.modal.name')}:</strong> {selectedUser.full_name}</p>
                    <p><strong>{t('adminDashboard.users.modal.phone')}:</strong> {selectedUser.phone_number}</p>
                    <p><strong>{t('adminDashboard.users.modal.status')}:</strong> {getStatusBadge(selectedUser.status)}</p>
                    <p><strong>{t('adminDashboard.users.modal.services')}:</strong> {selectedUser.services_count}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">{t('adminDashboard.users.modal.stats')}</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>{t('adminDashboard.users.modal.joinDate')}:</strong> {new Date(selectedUser.date_joined).toLocaleDateString('ar-EG')}</p>
                    <p><strong>{t('adminDashboard.users.modal.documents')}:</strong> {selectedUser.documents_count}</p>
                    <p><strong>{t('adminDashboard.users.modal.verification')}:</strong> {selectedUser.is_phone_verified ? t('adminDashboard.users.modal.verified') : t('adminDashboard.users.modal.notVerified')}</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 rtl:space-x-reverse">
                <Button
                  variant="outline"
                  onClick={() => handleUserStatusUpdate(selectedUser.id, 'verified')}
                  leftIcon={<CheckCircle className="w-4 h-4" />}
                >
                  {t('adminDashboard.users.modal.btnVerify')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleUserStatusUpdate(selectedUser.id, 'rejected', t('adminDashboard.users.modal.rejectReason'))}
                  leftIcon={<XCircle className="w-4 h-4" />}
                >
                  {t('adminDashboard.users.modal.btnReject')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleUserStatusUpdate(selectedUser.id, 'suspended')}
                  leftIcon={<Clock className="w-4 h-4" />}
                >
                  {t('adminDashboard.users.modal.btnSuspend')}
                </Button>
              </div>
            </div>
          )}
        </Modal>

        <Modal
          isOpen={showServiceModal}
          onClose={() => setShowServiceModal(false)}
          title={t('adminDashboard.services.modal.title')}
          size="lg"
        >
          {selectedService && (
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">{t('adminDashboard.services.modal.details')}</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>{t('adminDashboard.services.modal.serviceTitle')}:</strong> {selectedService.title_ar}</p>
                  <p><strong>{t('adminDashboard.services.modal.provider')}:</strong> {selectedService.owner.full_name}</p>
                  <p><strong>{t('adminDashboard.services.modal.price')}:</strong> {selectedService.price} {t('adminDashboard.services.currency')}</p>
                  <p><strong>{t('adminDashboard.services.modal.images')}:</strong> {selectedService.images_count}</p>
                  <p><strong>{t('adminDashboard.services.modal.createdAt')}:</strong> {new Date(selectedService.created_at).toLocaleDateString('ar-EG')}</p>
                </div>
              </div>

              <div className="flex space-x-4 rtl:space-x-reverse">
                <Button
                  onClick={() => handleServiceStatusUpdate(selectedService.id, 'approve')}
                  leftIcon={<CheckCircle className="w-4 h-4" />}
                >
                  {t('adminDashboard.services.modal.btnApprove')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleServiceStatusUpdate(selectedService.id, 'reject', t('adminDashboard.services.modal.rejectReason'))}
                  leftIcon={<XCircle className="w-4 h-4" />}
                >
                  {t('adminDashboard.services.modal.btnReject')}
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