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
  Folder,
  LayoutDashboard,
  CreditCard,
  Menu,
  X,
  Bell,
  LogOut,
  ChevronRight,
  Activity,
  Images,
  ZoomIn,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useNavigate } from 'react-router-dom';

import { RootState } from '../../store/store';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import SubscriptionManagement from './SubscriptionManagement';
const SafetyDashboard = React.lazy(() => import('./SafetyDashboard'));

interface AdminStats {
  total_users: number;
  pending_users: number;
  total_services: number;
  pending_services: number;
  total_reports: number;
  pending_reports: number;
}

interface UserItem {
  id: string;
  full_name: string;
  phone_number: string;
  status: string;
  role: string;
  is_phone_verified: boolean;
  date_joined: string;
  services_count: number;
  documents_count: number;
  documents?: Array<{
    id: string;
    document_type: string;
    document_type_display: string;
    status: string;
    rejection_reason: string;
    document_front_url: string | null;
    document_back_url: string | null;
  }>;
  id_document?: string | null;
  id_document_back?: string | null;
}

interface Service {
  id: string;
  title_ar: string;
  owner: { full_name: string; phone_number: string };
  status: string;
  created_at: string;
  price: number;
  images_count: number;
  images?: Array<{ id: string; image: string; is_primary?: boolean }>;
}

type TabId = 'overview' | 'users' | 'subscriptions' | 'services' | 'reports' | 'safety';

const navItems: { id: TabId; labelKey: string; icon: React.ElementType; badge?: string }[] = [
  { id: 'overview', labelKey: 'adminDashboard.tabs.overview', icon: LayoutDashboard },
  { id: 'users', labelKey: 'adminDashboard.tabs.users', icon: Users },
  { id: 'services', labelKey: 'adminDashboard.tabs.services', icon: Briefcase },
  { id: 'subscriptions', labelKey: 'adminDashboard.tabs.subscriptions', icon: CreditCard },
  { id: 'safety', labelKey: 'adminDashboard.tabs.safety', icon: Shield },
];

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  pending: { color: 'bg-amber-100 text-amber-800 border-amber-200', label: 'قيد المراجعة' },
  verified: { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'موثق' },
  approved: { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'مقبول' },
  rejected: { color: 'bg-red-100 text-red-800 border-red-200', label: 'مرفوض' },
  suspended: { color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'موقوف' },
  blocked: { color: 'bg-red-100 text-red-800 border-red-200', label: 'محظور' },
  active: { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'نشط' },
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.color}`}>
      {cfg.label}
    </span>
  );
};

const StatCard: React.FC<{
  icon: React.ElementType;
  title: string;
  value: number | string;
  sub?: string;
  subColor?: string;
  gradient: string;
}> = ({ icon: Icon, title, value, sub, subColor = 'text-amber-600', gradient }) => (
  <div className={`rounded-2xl p-5 text-white shadow-lg ${gradient} relative overflow-hidden`}>
    <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/10 -translate-y-8 translate-x-8" />
    <div className="relative z-10">
      <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center mb-3">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
      {sub && <p className={`text-xs mt-1 text-white/70`}>{sub}</p>}
    </div>
  </div>
);

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8000';

  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [adminAnalytics, setAdminAnalytics] = useState<any>(null);
  const [timeFilter, setTimeFilter] = useState(30);
  const [userStatusFilter, setUserStatusFilter] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [serviceImages, setServiceImages] = useState<Array<{ id: string; image: string; is_primary?: boolean }>>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  if (!user || (user as any).role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center bg-white rounded-2xl p-10 shadow-2xl max-w-sm mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t('adminDashboard.unauthorized')}</h2>
          <p className="text-gray-500 text-sm">{t('adminDashboard.noAccess')}</p>
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

  const authHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    'Content-Type': 'application/json',
  });

  const loadStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/analytics/admin/`, { headers: authHeaders() });
      if (res.ok) setStats(await res.json());
    } catch (e) { console.error(e); }
  };

  const loadAdminAnalytics = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/analytics/admin/?days=${timeFilter}`, { headers: authHeaders() });
      if (res.ok) {
        const ct = res.headers.get('content-type');
        if (ct?.includes('application/json')) setAdminAnalytics(await res.json());
      }
    } catch (e) { console.error(e); }
  };

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/accounts/admin/users/`, { headers: authHeaders() });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : (data.results || []));
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const loadServices = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/services/admin/services/`, { headers: authHeaders() });
      const data = await res.json();
      setServices(Array.isArray(data) ? data : (data.results || []));
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const handleUserStatusUpdate = async (userId: string, newStatus: string, reason?: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/accounts/admin/users/${userId}/status/`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ status: newStatus, reason }),
      });
      if (res.ok) { loadUsers(); setShowUserModal(false); setRejectReason(''); }
    } catch (e) { console.error(e); }
  };

  const openServiceModal = async (svc: Service) => {
    setSelectedService(svc);
    setServiceImages([]);
    setShowServiceModal(true);
    setLoadingImages(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/services/admin/services/${svc.id}/`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setServiceImages(data.images || []);
      }
    } catch (e) { console.error(e); } finally { setLoadingImages(false); }
  };

  const handleServiceStatusUpdate = async (serviceId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/services/admin/services/${serviceId}/status/`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ action, reason }),
      });
      if (res.ok) { loadServices(); setShowServiceModal(false); }
    } catch (e) { console.error(e); }
  };

  const exportAdminData = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/analytics/export/?days=${timeFilter}`, { headers: authHeaders() });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `admin_analytics_${timeFilter}days.csv`; a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (e) { console.error(e); }
  };

  const filteredUsers = userStatusFilter
    ? users.filter(u => u.status === userStatusFilter)
    : users;

  const switchTab = (tab: TabId) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  // ── Sidebar ──────────────────────────────────────────────────────────────
  const Sidebar = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm">لوحة الإدارة</p>
            <p className="text-xs text-slate-400">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ id, labelKey, icon: Icon }) => {
          const isActive = activeTab === id;
          const badge = id === 'users' && stats?.pending_users
            ? stats.pending_users
            : id === 'services' && stats?.pending_services
            ? stats.pending_services
            : null;
          return (
            <button
              key={id}
              onClick={() => switchTab(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1 text-right">{t(labelKey)}</span>
              {badge ? (
                <span className="bg-amber-400 text-slate-900 text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                  {badge}
                </span>
              ) : isActive ? (
                <ChevronRight className="w-4 h-4 opacity-70" />
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Quick links */}
      <div className="px-3 pb-4 border-t border-white/10 pt-4 space-y-1">
        <button
          onClick={() => navigate('/admin/categories')}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <Folder className="w-4 h-4" />
          <span>{t('adminDashboard.tabs.categories')}</span>
        </button>
        <button
          onClick={() => navigate('/admin/locations')}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <MapPin className="w-4 h-4" />
          <span>{t('adminDashboard.tabs.locations')}</span>
        </button>
      </div>

      {/* Admin info */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-blue-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{(user as any)?.full_name}</p>
            <p className="text-xs text-slate-400">مسؤول النظام</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 flex-shrink-0 fixed inset-y-0 right-0 z-30">
        <Sidebar />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 right-0 w-72 z-50">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:mr-64 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between shadow-sm">
          <button
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 lg:flex-none">
            <h1 className="text-lg font-bold text-gray-900 mr-2 lg:mr-0">
              {navItems.find(n => n.id === activeTab)
                ? t(navItems.find(n => n.id === activeTab)!.labelKey)
                : t('adminDashboard.title')}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === 'overview' && (
              <>
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(Number(e.target.value))}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={7}>آخر 7 أيام</option>
                  <option value={30}>آخر 30 يوم</option>
                  <option value={90}>آخر 90 يوم</option>
                </select>
                <button
                  onClick={exportAdminData}
                  className="flex items-center gap-1.5 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">تصدير</span>
                </button>
              </>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">

          {/* ── Overview ── */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              {stats ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  <StatCard
                    icon={Users}
                    title={t('adminDashboard.overview.totalUsers')}
                    value={stats.total_users}
                    sub={`${stats.pending_users} في انتظار المراجعة`}
                    gradient="bg-gradient-to-br from-blue-600 to-blue-800"
                  />
                  <StatCard
                    icon={Briefcase}
                    title={t('adminDashboard.overview.totalServices')}
                    value={stats.total_services}
                    sub={`${stats.pending_services} خدمة معلقة`}
                    gradient="bg-gradient-to-br from-emerald-600 to-emerald-800"
                  />
                  <StatCard
                    icon={AlertTriangle}
                    title={t('adminDashboard.overview.reports')}
                    value={stats.total_reports}
                    sub={`${stats.pending_reports} تقرير معلق`}
                    gradient="bg-gradient-to-br from-red-600 to-red-800"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[1,2,3].map(i => <div key={i} className="h-32 rounded-2xl bg-gray-200 animate-pulse" />)}
                </div>
              )}

              {/* Pending actions quick links */}
              {stats && (stats.pending_users > 0 || stats.pending_services > 0) && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Bell className="w-5 h-5 text-amber-600" />
                    <h3 className="font-semibold text-amber-800">إجراءات تحتاج مراجعة</h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {stats.pending_users > 0 && (
                      <button
                        onClick={() => switchTab('users')}
                        className="flex items-center gap-2 bg-amber-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-amber-600 transition"
                      >
                        <Users className="w-4 h-4" />
                        {stats.pending_users} مستخدم معلق
                      </button>
                    )}
                    {stats.pending_services > 0 && (
                      <button
                        onClick={() => switchTab('services')}
                        className="flex items-center gap-2 bg-orange-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-orange-600 transition"
                      >
                        <Briefcase className="w-4 h-4" />
                        {stats.pending_services} خدمة معلقة
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Charts */}
              {adminAnalytics && (
                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                      <Activity className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-gray-900">{t('adminDashboard.overview.userGrowth')}</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={adminAnalytics.daily_platform_data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="total_users" stroke="#3B82F6" strokeWidth={2.5} dot={false} name="إجمالي المستخدمين" />
                        <Line type="monotone" dataKey="verified_users" stroke="#10B981" strokeWidth={2.5} dot={false} name="موثقون" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="w-5 h-5 text-emerald-600" />
                      <h3 className="font-semibold text-gray-900">{t('adminDashboard.overview.govPerformance')}</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={adminAnalytics.governorate_breakdown}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="governorate__name_ar" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="total_services" fill="#3B82F6" radius={[4, 4, 0, 0]} name="الخدمات" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Quick nav cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {[
                  { label: 'إدارة المستخدمين', icon: Users, tab: 'users' as TabId, color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
                  { label: 'إدارة الخدمات', icon: Briefcase, tab: 'services' as TabId, color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
                  { label: 'الاشتراكات', icon: CreditCard, tab: 'subscriptions' as TabId, color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
                  { label: 'السلامة', icon: Shield, tab: 'safety' as TabId, color: 'bg-red-50 text-red-700 hover:bg-red-100' },
                ].map(({ label, icon: Icon, tab, color }) => (
                  <button
                    key={tab}
                    onClick={() => switchTab(tab)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border border-transparent font-medium text-sm transition-all ${color}`}
                  >
                    <Icon className="w-6 h-6" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Users ── */}
          {activeTab === 'users' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-wrap gap-3 items-center justify-between">
                <div className="flex gap-2 flex-wrap">
                  {['', 'pending', 'verified', 'rejected', 'suspended'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setUserStatusFilter(s)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
                        userStatusFilter === s
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
                      }`}
                    >
                      {s === '' ? 'الكل' : STATUS_CONFIG[s]?.label}
                    </button>
                  ))}
                </div>
                <span className="text-sm text-gray-500">{filteredUsers.length} مستخدم</span>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
              ) : (
                <>
                  {/* Desktop table */}
                  <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="min-w-full">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          {['المستخدم', 'الحالة', 'الخدمات', 'تاريخ الانضمام', 'المستندات', ''].map((h) => (
                            <th key={h} className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-blue-50/30 transition">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                                  <User className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900 text-sm">{u.full_name}</p>
                                  <p className="text-xs text-gray-400">{u.phone_number}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4"><StatusBadge status={u.status} /></td>
                            <td className="px-5 py-4 text-sm text-gray-700">{u.services_count}</td>
                            <td className="px-5 py-4 text-sm text-gray-500">{new Date(u.date_joined).toLocaleDateString('ar-EG')}</td>
                            <td className="px-5 py-4">
                              {u.documents_count > 0 ? (
                                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-lg font-medium">{u.documents_count} مستند</span>
                              ) : (
                                <span className="text-xs text-gray-400">لا يوجد</span>
                              )}
                            </td>
                            <td className="px-5 py-4">
                              <button
                                onClick={() => { setSelectedUser(u); setShowUserModal(true); setRejectReason(''); }}
                                className="flex items-center gap-1.5 text-sm bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-700 px-3 py-1.5 rounded-lg transition"
                              >
                                <Eye className="w-4 h-4" />
                                مراجعة
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredUsers.length === 0 && (
                      <div className="py-16 text-center text-gray-400">
                        <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p>لا توجد نتائج</p>
                      </div>
                    )}
                  </div>

                  {/* Mobile cards */}
                  <div className="md:hidden space-y-3">
                    {filteredUsers.map((u) => (
                      <div key={u.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{u.full_name}</p>
                              <p className="text-xs text-gray-400">{u.phone_number}</p>
                            </div>
                          </div>
                          <StatusBadge status={u.status} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">{new Date(u.date_joined).toLocaleDateString('ar-EG')}</span>
                          <button
                            onClick={() => { setSelectedUser(u); setShowUserModal(true); setRejectReason(''); }}
                            className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg"
                          >
                            مراجعة
                          </button>
                        </div>
                      </div>
                    ))}
                    {filteredUsers.length === 0 && (
                      <div className="py-12 text-center text-gray-400">لا توجد نتائج</div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Services ── */}
          {activeTab === 'services' && (
            <div className="space-y-4 animate-fade-in">
              {isLoading ? (
                <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
              ) : (
                <>
                  <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="min-w-full">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          {['الخدمة', 'مزود الخدمة', 'الحالة', 'السعر', ''].map((h) => (
                            <th key={h} className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {services.map((svc) => (
                          <tr key={svc.id} className="hover:bg-blue-50/30 transition">
                            <td className="px-5 py-4">
                              <p className="font-semibold text-gray-900 text-sm">{svc.title_ar}</p>
                              <p className="text-xs text-gray-400">{svc.images_count} صورة</p>
                            </td>
                            <td className="px-5 py-4">
                              <p className="text-sm text-gray-900">{svc.owner.full_name}</p>
                              <p className="text-xs text-gray-400">{svc.owner.phone_number}</p>
                            </td>
                            <td className="px-5 py-4"><StatusBadge status={svc.status} /></td>
                            <td className="px-5 py-4 text-sm text-gray-700 font-semibold">{svc.price} ج.م</td>
                            <td className="px-5 py-4">
                              <button
                                onClick={() => openServiceModal(svc)}
                                className="flex items-center gap-1.5 text-sm bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-700 px-3 py-1.5 rounded-lg transition"
                              >
                                <Eye className="w-4 h-4" />
                                مراجعة
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {services.length === 0 && (
                      <div className="py-16 text-center text-gray-400">
                        <Briefcase className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p>لا توجد خدمات</p>
                      </div>
                    )}
                  </div>

                  {/* Mobile */}
                  <div className="md:hidden space-y-3">
                    {services.map((svc) => (
                      <div key={svc.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{svc.title_ar}</p>
                            <p className="text-xs text-gray-400">{svc.owner.full_name}</p>
                          </div>
                          <StatusBadge status={svc.status} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-gray-900">{svc.price} ج.م</span>
                          <button
                            onClick={() => openServiceModal(svc)}
                            className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg"
                          >
                            مراجعة
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Subscriptions ── */}
          {activeTab === 'subscriptions' && <SubscriptionManagement />}

          {/* ── Safety ── */}
          {activeTab === 'safety' && (
            <React.Suspense fallback={<div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>}>
              <SafetyDashboard />
            </React.Suspense>
          )}
        </main>
      </div>

      {/* User Modal */}
      <Modal isOpen={showUserModal} onClose={() => setShowUserModal(false)} title="تفاصيل المستخدم" size="lg">
        {selectedUser && (
          <div className="space-y-6">
            {/* User info */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedUser.full_name}</h3>
                <p className="text-sm text-gray-500">{selectedUser.phone_number}</p>
                <div className="mt-1"><StatusBadge status={selectedUser.status} /></div>
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'تاريخ الانضمام', value: new Date(selectedUser.date_joined).toLocaleDateString('ar-EG') },
                { label: 'الخدمات', value: `${selectedUser.services_count} خدمة` },
                { label: 'المستندات', value: `${selectedUser.documents_count} مستند` },
                { label: 'رقم الهاتف موثق', value: selectedUser.is_phone_verified ? '✅ نعم' : '❌ لا' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{value}</p>
                </div>
              ))}
            </div>

            {/* Documents */}
            {selectedUser.documents && selectedUser.documents.length > 0 ? (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  المستندات المرفقة
                </h4>
                <div className="space-y-3">
                  {selectedUser.documents.map((doc) => (
                    <div key={doc.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-800">{doc.document_type_display}</span>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                          doc.status === 'verified' || doc.status === 'approved' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                          doc.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                          'bg-amber-100 text-amber-700 border-amber-200'
                        }`}>
                          {doc.status === 'verified' || doc.status === 'approved' ? 'مقبول' :
                           doc.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {doc.document_front_url && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">الوجه الأمامي</p>
                            <a href={doc.document_front_url} target="_blank" rel="noopener noreferrer" className="block">
                              <img
                                src={doc.document_front_url}
                                alt="Front"
                                className="w-full h-28 object-cover rounded-lg border border-gray-200 hover:opacity-80 transition cursor-zoom-in"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                              />
                            </a>
                          </div>
                        )}
                        {doc.document_back_url && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">الوجه الخلفي</p>
                            <a href={doc.document_back_url} target="_blank" rel="noopener noreferrer" className="block">
                              <img
                                src={doc.document_back_url}
                                alt="Back"
                                className="w-full h-28 object-cover rounded-lg border border-gray-200 hover:opacity-80 transition cursor-zoom-in"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                              />
                            </a>
                          </div>
                        )}
                      </div>
                      {doc.rejection_reason && (
                        <p className="text-xs text-red-600 mt-2 bg-red-50 rounded-lg p-2">⚠️ {doc.rejection_reason}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-200 rounded-xl py-6 text-center">
                <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">لا توجد مستندات مرفقة</p>
              </div>
            )}

            {/* Reject reason input */}
            {selectedUser.status === 'pending' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">سبب الرفض (اختياري)</label>
                <textarea
                  rows={2}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="اكتب سبب الرفض..."
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-100">
              <button
                onClick={() => handleUserStatusUpdate(selectedUser.id, 'verified')}
                className="flex items-center gap-2 bg-emerald-600 text-white text-sm px-4 py-2 rounded-xl hover:bg-emerald-700 transition font-medium"
              >
                <CheckCircle className="w-4 h-4" />
                قبول وتوثيق
              </button>
              <button
                onClick={() => handleUserStatusUpdate(selectedUser.id, 'rejected', rejectReason)}
                className="flex items-center gap-2 bg-red-100 text-red-700 text-sm px-4 py-2 rounded-xl hover:bg-red-200 transition font-medium"
              >
                <XCircle className="w-4 h-4" />
                رفض
              </button>
              <button
                onClick={() => handleUserStatusUpdate(selectedUser.id, 'suspended')}
                className="flex items-center gap-2 bg-amber-100 text-amber-700 text-sm px-4 py-2 rounded-xl hover:bg-amber-200 transition font-medium"
              >
                <Clock className="w-4 h-4" />
                إيقاف مؤقت
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Service Modal */}
      <Modal isOpen={showServiceModal} onClose={() => { setShowServiceModal(false); setPreviewImage(null); }} title="تفاصيل الخدمة" size="lg">
        {selectedService && (
          <div className="space-y-5">
            {/* Info grid */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              {[
                { label: 'اسم الخدمة', value: selectedService.title_ar },
                { label: 'مزود الخدمة', value: selectedService.owner.full_name },
                { label: 'رقم الهاتف', value: selectedService.owner.phone_number },
                { label: 'السعر', value: `${selectedService.price} ج.م` },
                { label: 'تاريخ الإضافة', value: new Date(selectedService.created_at).toLocaleDateString('ar-EG') },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-semibold text-gray-900">{value}</span>
                </div>
              ))}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">الحالة</span>
                <StatusBadge status={selectedService.status} />
              </div>
            </div>

            {/* ── Images Section ── */}
            <div>
              <h4 className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
                <Images className="w-4 h-4 text-blue-600" />
                صور الخدمة
                {serviceImages.length > 0 && (
                  <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    {serviceImages.length} صورة
                  </span>
                )}
              </h4>

              {loadingImages ? (
                <div className="flex items-center justify-center py-8 bg-gray-50 rounded-xl">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="mr-2 text-sm text-gray-500">جاري تحميل الصور...</span>
                </div>
              ) : serviceImages.length > 0 ? (
                <>
                  {/* Image grid */}
                  <div className="grid grid-cols-3 gap-2">
                    {serviceImages.map((img) => (
                      <button
                        key={img.id}
                        onClick={() => setPreviewImage(img.image)}
                        className={`relative group aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                          img.is_primary
                            ? 'border-blue-400 ring-2 ring-blue-200'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <img
                          src={img.image}
                          alt="service"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23f3f4f6%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2250%22 font-size=%2214%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22 fill=%22%239ca3af%22>❌</text></svg>'; }}
                        />
                        {img.is_primary && (
                          <span className="absolute top-1 right-1 bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                            رئيسية
                          </span>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Lightbox */}
                  {previewImage && (
                    <div
                      className="fixed inset-0 z-[100] bg-black/85 flex items-center justify-center p-4"
                      onClick={() => setPreviewImage(null)}
                    >
                      <button
                        className="absolute top-4 left-4 w-9 h-9 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition"
                        onClick={() => setPreviewImage(null)}
                      >
                        <X className="w-5 h-5" />
                      </button>
                      <img
                        src={previewImage}
                        alt="preview"
                        className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-xl py-8 text-center">
                  <Images className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">لا توجد صور مرفقة</p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-1 border-t border-gray-100">
              <button
                onClick={() => handleServiceStatusUpdate(selectedService.id, 'approve')}
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white text-sm py-2.5 rounded-xl hover:bg-emerald-700 transition font-medium"
              >
                <CheckCircle className="w-4 h-4" />
                قبول الخدمة
              </button>
              <button
                onClick={() => handleServiceStatusUpdate(selectedService.id, 'reject')}
                className="flex-1 flex items-center justify-center gap-2 bg-red-100 text-red-700 text-sm py-2.5 rounded-xl hover:bg-red-200 transition font-medium"
              >
                <XCircle className="w-4 h-4" />
                رفض الخدمة
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboard;