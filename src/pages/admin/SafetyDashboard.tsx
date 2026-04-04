import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  AlertTriangle, Shield, Clock, CheckCircle, XCircle, Eye,
  MessageSquare, Filter, Download, Users, FileText, Gavel,
  TrendingUp, ChevronRight, RefreshCw, Search, SlidersHorizontal,
} from 'lucide-react';

import { RootState } from '../../store/store';
import { Modal } from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import apiClient from '../../services/api/client';

/* ─── types ─────────────────────────────── */
interface QueueStats {
  pending_reports: number;
  assigned_reports: number;
  overdue_reports: number;
  pending_appeals: number;
  overdue_appeals: number;
}
interface Report {
  id: string;
  reporter: { full_name: string; phone_number: string };
  reason: string;
  description: string;
  severity: string;
  status: string;
  assigned_to?: { full_name: string };
  sla_due_at: string;
  is_overdue: boolean;
  created_at: string;
}
interface Appeal {
  id: string;
  appellant: { full_name: string };
  appeal_text: string;
  status: string;
  is_overdue: boolean;
  created_at: string;
}

const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8000';
const token = () => localStorage.getItem('access_token') || '';

/* ─── small helpers ──────────────────────── */
const SEVERITY_MAP: Record<string, { label: string; cls: string; dot: string }> = {
  critical: { label: 'حرج',    cls: 'bg-red-100 text-red-800 border-red-200',     dot: 'bg-red-500' },
  high:     { label: 'عالي',   cls: 'bg-orange-100 text-orange-800 border-orange-200', dot: 'bg-orange-500' },
  medium:   { label: 'متوسط',  cls: 'bg-yellow-100 text-yellow-800 border-yellow-200', dot: 'bg-yellow-500' },
  low:      { label: 'منخفض',  cls: 'bg-green-100 text-green-800 border-green-200',  dot: 'bg-green-500' },
};
const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  pending:       { label: 'قيد الانتظار',  cls: 'bg-yellow-100 text-yellow-800' },
  assigned:      { label: 'مسند',          cls: 'bg-blue-100 text-blue-800' },
  investigating: { label: 'قيد التحقيق',  cls: 'bg-purple-100 text-purple-800' },
  resolved:      { label: 'محلول',         cls: 'bg-green-100 text-green-800' },
  dismissed:     { label: 'مرفوض',         cls: 'bg-gray-100 text-gray-800' },
  escalated:     { label: 'مصعَّد',        cls: 'bg-red-100 text-red-800' },
  approved:      { label: 'مقبول',         cls: 'bg-green-100 text-green-800' },
  denied:        { label: 'مرفوض',         cls: 'bg-red-100 text-red-800' },
};

const Badge: React.FC<{ text: string; cls: string }> = ({ text, cls }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>{text}</span>
);
const SeverityBadge: React.FC<{ severity: string }> = ({ severity }) => {
  const c = SEVERITY_MAP[severity] ?? SEVERITY_MAP.medium;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${c.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />{c.label}
    </span>
  );
};
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const c = STATUS_MAP[status] ?? STATUS_MAP.pending;
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${c.cls}`}>{c.label}</span>;
};

/* ─── stat card ─────────────────────────── */
const StatCard: React.FC<{
  icon: React.ReactNode; label: string; value: number;
  color: string; urgent?: boolean; onClick?: () => void;
}> = ({ icon, label, value, color, urgent, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full text-start flex items-center gap-3 p-4 rounded-2xl border transition-all hover:shadow-md active:scale-95 ${
      urgent && value > 0 ? 'border-red-200 bg-red-50 animate-pulse' : `${color} border-transparent`
    }`}
  >
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${urgent && value > 0 ? 'bg-red-100' : 'bg-white/70'}`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-600 leading-tight">{label}</p>
      <p className={`text-2xl font-bold leading-none mt-0.5 ${urgent && value > 0 ? 'text-red-700' : 'text-gray-900'}`}>{value}</p>
    </div>
    {onClick && <ChevronRight className="w-4 h-4 text-gray-400 rtl:rotate-180 shrink-0" />}
  </button>
);

/* ─── SLA ring ──────────────────────────── */
const SlaRing: React.FC<{ pct: number; label: string; color: string }> = ({ pct, label, color }) => (
  <div className="flex flex-col items-center gap-2">
    <div className="relative w-20 h-20">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f0f0f0" strokeWidth="3" />
        <circle cx="18" cy="18" r="15.9" fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={`${pct} ${100 - pct}`} strokeLinecap="round" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-900">{pct}%</span>
    </div>
    <p className="text-xs text-gray-600 text-center leading-tight">{label}</p>
  </div>
);

/* ═══════════════════════════════════════════ */
/*              MAIN COMPONENT                 */
/* ═══════════════════════════════════════════ */
const SafetyDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);

  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'appeals' | 'policies'>('overview');
  const [queueStats, setQueueStats]     = useState<QueueStats | null>(null);
  const [reports, setReports]           = useState<Report[]>([]);
  const [appeals, setAppeals]           = useState<Appeal[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [search, setSearch]             = useState('');
  const [showFilters, setShowFilters]   = useState(false);

  /* ── access guard ── */
  if (!user || (user as any).role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t('safetyDashboard.unauthorized')}</h2>
          <p className="text-gray-500 text-sm">{t('safetyDashboard.noAccess')}</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadDashboardData();
    if (activeTab === 'reports') loadReports();
    if (activeTab === 'appeals') loadAppeals();
  }, [activeTab, filterStatus, filterSeverity]);

  const loadDashboardData = async () => {
    try {
      const r = await apiClient.get('/moderation/dashboard/');
      setQueueStats(r.data.queue_stats);
    } catch {}
  };

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterSeverity !== 'all') params.append('severity', filterSeverity);
      const r = await apiClient.get(`/moderation/reports/?${params}`);
      setReports(r.data.results ?? r.data);
    } catch {} finally { setIsLoading(false); }
  };

  const loadAppeals = async () => {
    setIsLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/v1/moderation/appeals/`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (r.ok) { const d = await r.json(); setAppeals(d.results ?? d); }
    } catch {} finally { setIsLoading(false); }
  };

  const handleReportAction = async (reportId: string, actionType: string, reasonCode: string, reasonText: string) => {
    try {
      const r = await fetch(`${API_BASE}/api/v1/moderation/reports/${reportId}/resolve/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ action_type: actionType, reason_code: reasonCode, reason_text: reasonText }),
      });
      if (r.ok) { loadReports(); setShowReportModal(false); }
    } catch {}
  };

  const handleAppealDecision = async (appealId: string, decision: string, notes: string) => {
    try {
      const r = await fetch(`${API_BASE}/api/v1/moderation/appeals/${appealId}/review/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ decision, notes }),
      });
      if (r.ok) { loadAppeals(); setShowAppealModal(false); }
    } catch {}
  };

  /* ── filtered reports ── */
  const filteredReports = reports.filter(r =>
    !search || r.reporter.full_name.includes(search) || r.reason.includes(search) || r.description.includes(search)
  );

  /* ── tabs ── */
  const tabs = [
    { id: 'overview', label: 'نظرة عامة',       icon: TrendingUp },
    { id: 'reports',  label: 'البلاغات',         icon: AlertTriangle },
    { id: 'appeals',  label: 'الطعون',            icon: Gavel },
    { id: 'policies', label: 'السياسات',          icon: FileText },
  ];

  /* ════════════════ RENDER ════════════════ */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/20" dir="rtl">

      {/* ── sticky header ── */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* title row */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">لوحة الأمان والثقة</h1>
                <p className="text-xs text-gray-500 hidden sm:block">إدارة البلاغات والسياسات</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadDashboardData}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500"
                title="تحديث"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors">
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">تصدير</span>
              </button>
            </div>
          </div>

          {/* tabs */}
          <div className="flex overflow-x-auto scrollbar-hide -mb-px gap-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                    active ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {tab.label}
                  {tab.id === 'reports' && queueStats?.pending_reports ? (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {queueStats.pending_reports}
                    </span>
                  ) : null}
                  {tab.id === 'appeals' && queueStats?.pending_appeals ? (
                    <span className="bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {queueStats.pending_appeals}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 space-y-5">

        {/* ═══ OVERVIEW TAB ═══ */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            {/* stat cards */}
            {queueStats ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <StatCard
                  icon={<AlertTriangle className="w-5 h-5 text-yellow-600" />}
                  label="بلاغات معلّقة"
                  value={queueStats.pending_reports}
                  color="bg-yellow-50"
                  onClick={() => setActiveTab('reports')}
                />
                <StatCard
                  icon={<Users className="w-5 h-5 text-blue-600" />}
                  label="بلاغات مسندة"
                  value={queueStats.assigned_reports}
                  color="bg-blue-50"
                />
                <StatCard
                  icon={<Clock className="w-5 h-5 text-red-600" />}
                  label="بلاغات متأخرة"
                  value={queueStats.overdue_reports}
                  color="bg-red-50"
                  urgent
                />
                <StatCard
                  icon={<Gavel className="w-5 h-5 text-purple-600" />}
                  label="طعون معلّقة"
                  value={queueStats.pending_appeals}
                  color="bg-purple-50"
                  onClick={() => setActiveTab('appeals')}
                />
                <StatCard
                  icon={<Clock className="w-5 h-5 text-red-600" />}
                  label="طعون متأخرة"
                  value={queueStats.overdue_appeals}
                  color="bg-red-50"
                  urgent
                />
              </div>
            ) : (
              <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
            )}

            {/* SLA Performance */}
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
              <h2 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" /> أداء مستوى الخدمة (SLA)
              </h2>
              <div className="flex flex-wrap justify-around gap-6">
                <SlaRing pct={94} label="البلاغات في الوقت المحدد" color="#22c55e" />
                <SlaRing pct={89} label="الطعون في الوقت المحدد"   color="#8b5cf6" />
                <div className="flex flex-col items-center gap-2">
                  <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-lg font-bold text-blue-700">2.4h</span>
                  </div>
                  <p className="text-xs text-gray-600 text-center">متوسط وقت الاستجابة</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-500" /> إجراءات سريعة
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'مراجعة البلاغات', icon: <AlertTriangle className="w-4 h-4" />, color: 'bg-yellow-50 hover:bg-yellow-100 text-yellow-800 border-yellow-200', action: () => setActiveTab('reports') },
                  { label: 'مراجعة الطعون',   icon: <Gavel className="w-4 h-4" />,         color: 'bg-purple-50 hover:bg-purple-100 text-purple-800 border-purple-200', action: () => setActiveTab('appeals') },
                  { label: 'إدارة السياسات', icon: <FileText className="w-4 h-4" />,        color: 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200',   action: () => setActiveTab('policies') },
                  { label: 'تصدير التقارير', icon: <Download className="w-4 h-4" />,        color: 'bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200',   action: () => {} },
                ].map(({ label, icon, color, action }) => (
                  <button
                    key={label}
                    onClick={action}
                    className={`flex items-center gap-2 p-3.5 rounded-xl border font-medium text-sm transition-colors ${color}`}
                  >
                    {icon} {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ REPORTS TAB ═══ */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            {/* search + filters */}
            <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 space-y-3">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="بحث عن بلاغ..."
                    className="w-full pr-9 pl-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(f => !f)}
                  className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="hidden sm:inline">فلترة</span>
                </button>
              </div>

              {showFilters && (
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="all">كل الحالات</option>
                    <option value="pending">معلّق</option>
                    <option value="assigned">مسند</option>
                    <option value="investigating">قيد التحقيق</option>
                    <option value="resolved">محلول</option>
                  </select>
                  <select
                    value={filterSeverity}
                    onChange={e => setFilterSeverity(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="all">كل الخطورات</option>
                    <option value="critical">حرج</option>
                    <option value="high">عالي</option>
                    <option value="medium">متوسط</option>
                    <option value="low">منخفض</option>
                  </select>
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">لا توجد بلاغات تطابق البحث</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredReports.map(report => (
                  <div
                    key={report.id}
                    className={`bg-white rounded-2xl shadow-sm border p-4 transition-shadow hover:shadow-md ${
                      report.is_overdue ? 'border-red-200 bg-red-50/30' : 'border-gray-100'
                    }`}
                  >
                    {/* top row */}
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        SEVERITY_MAP[report.severity]?.dot === 'bg-red-500' ? 'bg-red-100' :
                        SEVERITY_MAP[report.severity]?.dot === 'bg-orange-500' ? 'bg-orange-100' :
                        SEVERITY_MAP[report.severity]?.dot === 'bg-yellow-500' ? 'bg-yellow-100' : 'bg-green-100'
                      }`}>
                        <AlertTriangle className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <p className="text-sm font-semibold text-gray-900 truncate">{report.reason}</p>
                          <SeverityBadge severity={report.severity} />
                          <StatusBadge status={report.status} />
                          {report.is_overdue && (
                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">متأخر!</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mb-1">المُبلِّغ: {report.reporter.full_name}</p>
                        <p className="text-xs text-gray-600 line-clamp-2">{report.description}</p>
                      </div>
                    </div>
                    {/* bottom row */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                        {report.assigned_to && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" /> {report.assigned_to.full_name}
                          </span>
                        )}
                        <span className={`flex items-center gap-1 ${report.is_overdue ? 'text-red-600 font-semibold' : ''}`}>
                          <Clock className="w-3 h-3" />
                          {report.is_overdue ? 'متأخر' : new Date(report.sla_due_at).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                      <button
                        onClick={() => { setSelectedReport(report); setShowReportModal(true); }}
                        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> مراجعة
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ APPEALS TAB ═══ */}
        {activeTab === 'appeals' && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
            ) : appeals.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <Gavel className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">لا توجد طعون حالياً</p>
              </div>
            ) : (
              <div className="space-y-3">
                {appeals.map(appeal => (
                  <div
                    key={appeal.id}
                    className={`bg-white rounded-2xl shadow-sm border p-4 transition-shadow hover:shadow-md ${
                      appeal.is_overdue ? 'border-red-200 bg-red-50/30' : 'border-gray-100'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                        <Gavel className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <p className="text-sm font-semibold text-gray-900">{appeal.appellant.full_name}</p>
                          <StatusBadge status={appeal.status} />
                          {appeal.is_overdue && (
                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">متأخر!</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2 mb-1">{appeal.appeal_text}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(appeal.created_at).toLocaleDateString('ar-EG')}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end mt-3 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => { setSelectedAppeal(appeal); setShowAppealModal(true); }}
                        className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> مراجعة
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ POLICIES TAB ═══ */}
        {activeTab === 'policies' && (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center border border-gray-100">
            <FileText className="w-14 h-14 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">إدارة السياسات</h3>
            <p className="text-sm text-gray-500">هذا القسم قيد التطوير</p>
          </div>
        )}
      </div>

      {/* ═══ REPORT MODAL ═══ */}
      <Modal isOpen={showReportModal} onClose={() => setShowReportModal(false)} title="تفاصيل البلاغ" size="lg">
        {selectedReport && (
          <div className="space-y-5">
            {/* info grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-3">معلومات البلاغ</p>
                {[
                  { label: 'المُبلِّغ', val: selectedReport.reporter.full_name },
                  { label: 'السبب',    val: selectedReport.reason },
                ].map(({ label, val }) => (
                  <div key={label} className="flex items-start gap-2 text-sm">
                    <span className="text-gray-500 shrink-0 w-20">{label}:</span>
                    <span className="font-medium text-gray-900">{val}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500 shrink-0 w-20">الخطورة:</span>
                  <SeverityBadge severity={selectedReport.severity} />
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500 shrink-0 w-20">الحالة:</span>
                  <StatusBadge status={selectedReport.status} />
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500 shrink-0 w-20">التاريخ:</span>
                  <span className="font-medium text-gray-900">{new Date(selectedReport.created_at).toLocaleDateString('ar-EG')}</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-3">وصف البلاغ</p>
                <p className="text-sm text-gray-700 leading-relaxed">{selectedReport.description}</p>
              </div>
            </div>

            {/* actions */}
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-3">إجراءات الإشراف</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                {[
                  { label: 'تحذير',     action: 'warn',         code: 'OTHE_001', icon: <MessageSquare className="w-4 h-4" />, cls: 'bg-yellow-50 hover:bg-yellow-100 text-yellow-800 border-yellow-200' },
                  { label: 'إخفاء',     action: 'hide_content', code: 'INAP_001', icon: <Eye className="w-4 h-4" />,          cls: 'bg-orange-50 hover:bg-orange-100 text-orange-800 border-orange-200' },
                  { label: 'تعليق',     action: 'suspend_user', code: 'HARA_001', icon: <Clock className="w-4 h-4" />,         cls: 'bg-red-50 hover:bg-red-100 text-red-800 border-red-200' },
                  { label: 'حظر',       action: 'block_user',   code: 'FRAU_001', icon: <XCircle className="w-4 h-4" />,       cls: 'bg-red-100 hover:bg-red-200 text-red-900 border-red-300' },
                ].map(({ label, action, code, icon, cls }) => (
                  <button
                    key={action}
                    onClick={() => handleReportAction(selectedReport.id, action, code, label)}
                    className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-sm font-medium transition-colors ${cls}`}
                  >
                    {icon} {label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => handleReportAction(selectedReport.id, 'dismiss', 'OTHE_001', 'رفض البلاغ')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <CheckCircle className="w-4 h-4" /> رفض البلاغ (إغلاق)
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ═══ APPEAL MODAL ═══ */}
      <Modal isOpen={showAppealModal} onClose={() => setShowAppealModal(false)} title="تفاصيل الطعن" size="lg">
        {selectedAppeal && (
          <div className="space-y-5">
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-3">معلومات الطعن</p>
              {[
                { label: 'مقدّم الطعن', val: selectedAppeal.appellant.full_name },
                { label: 'تاريخ الإرسال', val: new Date(selectedAppeal.created_at).toLocaleDateString('ar-EG') },
              ].map(({ label, val }) => (
                <div key={label} className="flex items-start gap-2 text-sm">
                  <span className="text-gray-500 shrink-0 w-24">{label}:</span>
                  <span className="font-medium text-gray-900">{val}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500 shrink-0 w-24">الحالة:</span>
                <StatusBadge status={selectedAppeal.status} />
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-900 mb-2">نص الطعن</p>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-gray-700 leading-relaxed">
                {selectedAppeal.appeal_text}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleAppealDecision(selectedAppeal.id, 'approved', 'تم قبول الطعن')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                <CheckCircle className="w-4 h-4" /> قبول الطعن
              </button>
              <button
                onClick={() => handleAppealDecision(selectedAppeal.id, 'denied', 'تم رفض الطعن')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                <XCircle className="w-4 h-4" /> رفض الطعن
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SafetyDashboard;