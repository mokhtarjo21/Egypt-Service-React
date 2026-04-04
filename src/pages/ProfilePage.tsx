import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, MapPin, Calendar, Edit2, Upload, Shield,
  CheckCircle, AlertCircle, Wallet, CreditCard, FileText, RefreshCw,
  Star, Briefcase, TrendingUp, Lock, ChevronRight, Check, Camera,
  BadgeCheck, Clock, Eye, BookOpen,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { RootState } from '../store/store';
import { Modal } from '../components/ui/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Input } from '../components/ui/Input';
import djangoProfileService from '../services/django/profileService';
import { fetchUserProfile } from '../store/slices/authSlice';
import { apiClient } from '../services/api/client';

/* ─── helpers ────────────────────────────────── */
const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8000';

const getImageUrl = (path?: string | null) => {
  if (!path) return '';
  return path.startsWith('http') ? path : `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, { label: string; cls: string }> = {
    verified:  { label: 'موثّق',         cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    pending:   { label: 'قيد المراجعة', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
    rejected:  { label: 'مرفوض',         cls: 'bg-red-100 text-red-700 border-red-200' },
    suspended: { label: 'موقوف',          cls: 'bg-gray-100 text-gray-600 border-gray-200' },
  };
  const s = map[status] ?? { label: status, cls: 'bg-gray-100 text-gray-600 border-gray-200' };
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${s.cls}`}>
      {status === 'verified' && <CheckCircle className="w-3 h-3" />}
      {status === 'pending'  && <Clock className="w-3 h-3" />}
      {status === 'rejected' && <AlertCircle className="w-3 h-3" />}
      {s.label}
    </span>
  );
};

/* ─── quick-link button ─────────────────────── */
const QuickLink: React.FC<{ icon: React.ReactNode; label: string; sub?: string; onClick: () => void; badge?: string }> = ({
  icon, label, sub, onClick, badge,
}) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 p-3.5 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors text-start group"
  >
    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors shrink-0">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900">{label}</p>
      {sub && <p className="text-xs text-gray-500 truncate">{sub}</p>}
    </div>
    {badge && (
      <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5 font-semibold">{badge}</span>
    )}
    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors shrink-0 rtl:rotate-180" />
  </button>
);

/* ─── stat mini card ───────────────────────── */
const MiniStat: React.FC<{ label: string; value: string | number; icon: React.ReactNode; color: string }> = ({
  label, value, icon, color,
}) => (
  <div className={`flex flex-col items-center justify-center p-4 rounded-2xl ${color} text-center gap-1`}>
    {icon}
    <p className="text-xl font-bold text-gray-900 leading-none">{value}</p>
    <p className="text-xs text-gray-600 leading-tight">{label}</p>
  </div>
);

/* ─── file drop zone ────────────────────────── */
const DropZone: React.FC<{
  label: string; required?: boolean; file: File | null; onSelect: (f: File) => void;
}> = ({ label, required, file, onSelect }) => (
  <div>
    <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
      <FileText className="w-4 h-4 text-gray-400" /> {label}
      {required && <span className="text-red-500">*</span>}
    </p>
    <label className={`flex flex-col items-center gap-2 border-2 border-dashed rounded-xl p-5 cursor-pointer transition-all ${
      file ? 'border-emerald-400 bg-emerald-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
    }`}>
      <input type="file" accept="image/*,.pdf" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onSelect(f); }} />
      {file ? (
        <>
          <Check className="w-7 h-7 text-emerald-500" />
          <span className="text-sm text-emerald-700 font-medium text-center break-all">{file.name}</span>
        </>
      ) : (
        <>
          <Upload className="w-7 h-7 text-gray-400" />
          <span className="text-sm text-gray-500">اختر ملفاً أو اسحبه هنا</span>
          <span className="text-xs text-gray-400">PNG، JPG، PDF – حتى 10 MB</span>
        </>
      )}
    </label>
  </div>
);

/* ═══════════════════════════════════════════ */
/*                MAIN COMPONENT               */
/* ═══════════════════════════════════════════ */
const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const [providerStats, setProviderStats] = useState<any>(null);
  const [loadingStats, setLoadingStats]   = useState(false);

  /* modals */
  const [showEditModal,   setShowEditModal]   = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showDocModal,    setShowDocModal]    = useState(false);

  /* edit form */
  const [editForm, setEditForm] = useState({ full_name: '', email: '', bio_ar: '' });
  const [editLoading, setEditLoading] = useState(false);

  /* avatar */
  const [avatarFile,    setAvatarFile]    = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarLoading, setAvatarLoading] = useState(false);

  /* documents */
  const [docFront,   setDocFront]   = useState<File | null>(null);
  const [docBack,    setDocBack]    = useState<File | null>(null);
  const [docLoading, setDocLoading] = useState(false);

  /* ── load provider stats ── */
  useEffect(() => {
    const u = user as any;
    if (!u || !(u.role === 'provider' || u.user_type === 'provider')) return;
    setLoadingStats(true);
    apiClient.get('/analytics/provider/?days=30')
      .then(r => setProviderStats(r.data))
      .catch(() => {})
      .finally(() => setLoadingStats(false));
  }, [user]);

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );

  const u = user as any;
  const avatarUrl   = getImageUrl(u.avatar);
  const isProvider  = u.role === 'provider' || u.user_type === 'provider';
  const isRejected  = u.status === 'rejected';
  const isPending   = u.status === 'pending';
  const isVerified  = u.status === 'verified';
  const hasSub      = !!u.active_subscription;
  const location    = [u.center?.name_ar, u.governorate?.name_ar].filter(Boolean).join('، ');
  const joinDate    = u.date_joined ? new Date(u.date_joined).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' }) : '';
  const stats       = providerStats?.current_totals;

  const initials = (u.full_name || 'U').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  /* ── handlers ── */
  const openEdit = () => {
    setEditForm({ full_name: u.full_name || '', email: u.email || '', bio_ar: u.bio_ar || u.bio || '' });
    setShowEditModal(true);
  };

  const handleEdit = async () => {
    if (!editForm.full_name.trim()) { toast.error('الاسم مطلوب'); return; }
    setEditLoading(true);
    try {
      const r = await djangoProfileService.updateProfile(editForm as any);
      if (r.data) { setShowEditModal(false); dispatch(fetchUserProfile() as any); }
    } finally { setEditLoading(false); }
  };

  const onAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setAvatarFile(f);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(f);
    setShowAvatarModal(true);
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setAvatarLoading(true);
    try {
      const r = await djangoProfileService.uploadProfileImage(avatarFile);
      if (r.data) { setShowAvatarModal(false); setAvatarFile(null); setAvatarPreview(''); dispatch(fetchUserProfile() as any); }
    } finally { setAvatarLoading(false); }
  };

  const handleDocReupload = async () => {
    if (!docFront) { toast.error('يجب إرفاق صورة الوجه الأمامي'); return; }
    setDocLoading(true);
    try {
      const r = await djangoProfileService.uploadIDDocument(docFront, docBack ?? undefined);
      if (r.data) {
        toast.success('تم إرسال طلب إعادة المراجعة. سيتم التواصل معك قريباً.');
        setShowDocModal(false); setDocFront(null); setDocBack(null);
        dispatch(fetchUserProfile() as any);
      }
    } finally { setDocLoading(false); }
  };

  /* ════════════════ RENDER ════════════════ */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20" dir="rtl">

      {/* ── floating Rejection Banner ── */}
      {isRejected && (
        <div className="sticky top-0 z-20 bg-red-600 text-white px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-lg">
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-semibold">تم رفض حسابك{u.rejection_reason ? `:  ${u.rejection_reason}` : ''}</span>
          </div>
          <button
            onClick={() => setShowDocModal(true)}
            className="flex items-center gap-1.5 bg-white text-red-600 text-sm font-bold px-4 py-1.5 rounded-full hover:bg-red-50 transition-colors shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            طلب إعادة مراجعة
          </button>
        </div>
      )}

      {/* ── Pending notice ── */}
      {isPending && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 flex items-center justify-center gap-2 text-amber-800 text-sm">
          <Clock className="w-4 h-4" />
          حسابك قيد المراجعة من فريقنا. سيتم إخطارك بالنتيجة قريباً.
        </div>
      )}

      <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-4">

        {/* ═══ HERO CARD ═══ */}
        <div className="relative rounded-2xl overflow-hidden shadow-sm">
          {/* gradient cover */}
          <div className="h-28 sm:h-36 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600" />

          <div className="bg-white px-4 sm:px-6 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-10">

              {/* avatar */}
              <div className="relative self-center sm:self-auto">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={u.full_name} className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white shadow-md" />
                ) : (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white shadow-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <span className="text-2xl sm:text-3xl font-bold text-white">{initials}</span>
                  </div>
                )}
                {/* camera btn */}
                <label className="absolute -bottom-1 -left-1 w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-colors">
                  <Camera className="w-4 h-4 text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={onAvatarSelect} />
                </label>
                {isVerified && (
                  <div className="absolute -top-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center shadow border-2 border-white">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </div>

              {/* name + status */}
              <div className="flex-1 text-center sm:text-start pt-1 sm:pb-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{u.full_name || '—'}</h1>
                  <StatusBadge status={u.status || 'pending'} />
                </div>
                <p className="text-sm text-gray-500">
                  {isProvider ? '🛠 مزود خدمة' : '👤 عميل'}
                  {location && <span className="mx-2 text-gray-300">|</span>}
                  {location && <span><MapPin className="w-3.5 h-3.5 inline text-gray-400 ml-0.5" />{location}</span>}
                </p>
                {joinDate && (
                  <p className="text-xs text-gray-400 mt-0.5"><Calendar className="w-3 h-3 inline ml-1" />انضم في {joinDate}</p>
                )}
              </div>

              {/* edit btn */}
              <button
                onClick={openEdit}
                className="self-center sm:self-end flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow transition-colors mb-2"
              >
                <Edit2 className="w-4 h-4" />
                تعديل الملف
              </button>
            </div>

            {/* bio */}
            {(u.bio_ar || u.bio) && (
              <p className="mt-4 text-sm text-gray-600 bg-gray-50 rounded-xl p-3 leading-relaxed border border-gray-100">
                {u.bio_ar || u.bio}
              </p>
            )}
          </div>
        </div>

        {/* ═══ Provider Stats ═══ */}
        {isProvider && (
          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" /> إحصائيات الأداء
              </h2>
              <span className="text-xs text-gray-400">آخر 30 يوم</span>
            </div>
            {loadingStats ? (
              <div className="flex justify-center py-6"><LoadingSpinner size="md" /></div>
            ) : stats ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <MiniStat
                  label="مشاهدات الخدمات"
                  value={stats.total_service_views ?? 0}
                  icon={<Eye className="w-5 h-5 text-purple-500" />}
                  color="bg-purple-50"
                />
                <MiniStat
                  label="إجمالي الحجوزات"
                  value={stats.total_bookings ?? 0}
                  icon={<BookOpen className="w-5 h-5 text-blue-500" />}
                  color="bg-blue-50"
                />
                <MiniStat
                  label="الإيرادات (ج.م)"
                  value={`${stats.total_revenue ?? 0}`}
                  icon={<Briefcase className="w-5 h-5 text-emerald-500" />}
                  color="bg-emerald-50"
                />
                <MiniStat
                  label="متوسط التقييم"
                  value={stats.avg_rating ? `${stats.avg_rating} ⭐` : '—'}
                  icon={<Star className="w-5 h-5 text-yellow-500" />}
                  color="bg-yellow-50"
                />
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400 text-sm">لا توجد بيانات بعد</div>
            )}
          </div>
        )}

        {/* ═══ Two-column grid ═══ */}
        <div className="grid sm:grid-cols-2 gap-4">

          {/* Personal info card */}
          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5">
            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" /> معلومات الحساب
            </h2>
            <div className="space-y-3">
              {[
                { icon: <Mail className="w-4 h-4 text-gray-400" />,    label: 'البريد الإلكتروني', val: u.email       || '—' },
                { icon: <Phone className="w-4 h-4 text-gray-400" />,   label: 'رقم الهاتف',        val: u.phone_number || '—' },
                { icon: <MapPin className="w-4 h-4 text-gray-400" />,  label: 'المنطقة',           val: location       || '—' },
                { icon: <Calendar className="w-4 h-4 text-gray-400" />,label: 'تاريخ الانضمام',   val: joinDate       || '—' },
              ].map(({ icon, label, val }) => (
                <div key={label} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="mt-0.5 shrink-0">{icon}</div>
                  <div>
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="text-sm font-medium text-gray-800 break-all">{val}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick links card */}
          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5">
            <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" /> الإعدادات والأمان
            </h2>
            <div className="divide-y divide-gray-50">
              <QuickLink
                icon={<Shield className="w-4 h-4" />}
                label="الأمان وكلمة المرور"
                sub="تعديل كلمة المرور والمصادقة الثنائية"
                onClick={() => navigate('/security')}
              />
              {(isProvider || hasSub) && (
                <QuickLink
                  icon={<Wallet className="w-4 h-4" />}
                  label="محفظتي"
                  sub="عرض الرصيد والمعاملات"
                  onClick={() => navigate('/wallet')}
                />
              )}
              <QuickLink
                icon={<CreditCard className="w-4 h-4" />}
                label={hasSub ? 'إدارة اشتراكي' : 'خطط الاشتراك'}
                sub={hasSub
                  ? `نشط: ${u.active_subscription?.plan_name_ar}`
                  : 'ترقية حسابك للاستمتاع بمزيد من المزايا'}
                onClick={() => navigate('/plans')}
                badge={hasSub ? '✓' : undefined}
              />
              <QuickLink
                icon={<BookOpen className="w-4 h-4" />}
                label="حجوزاتي"
                sub="عرض وإدارة جميع الحجوزات"
                onClick={() => navigate('/bookings')}
              />
              {isProvider && (
                <QuickLink
                  icon={<Briefcase className="w-4 h-4" />}
                  label="خدماتي"
                  sub="إدارة الخدمات المقدمة"
                  onClick={() => navigate('/dashboard')}
                />
              )}
            </div>
          </div>
        </div>

        {/* ═══ Verification Status ═══ */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BadgeCheck className="w-5 h-5 text-blue-500" /> حالة التحقق
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">

            {/* phone */}
            <div className={`flex items-center gap-3 p-3.5 rounded-xl border ${u.is_phone_verified ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 ${u.is_phone_verified ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                <Phone className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">رقم الهاتف</p>
                <p className="text-xs text-gray-500">{u.is_phone_verified ? 'تم التحقق' : 'غير محقق'}</p>
              </div>
              {!u.is_phone_verified && (
                <button onClick={() => navigate('/verify-account')} className="text-xs text-blue-600 font-semibold hover:underline">
                  تحقق الآن
                </button>
              )}
              {u.is_phone_verified && <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />}
            </div>

            {/* email */}
            {u.email && (
              <div className={`flex items-center gap-3 p-3.5 rounded-xl border ${u.email_verified ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 ${u.email_verified ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                  <Mail className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">البريد الإلكتروني</p>
                  <p className="text-xs text-gray-500">{u.email_verified ? 'تم التحقق' : 'غير محقق'}</p>
                </div>
                {!u.email_verified && (
                  <button onClick={() => navigate('/verify-account')} className="text-xs text-blue-600 font-semibold hover:underline">
                    تحقق الآن
                  </button>
                )}
                {u.email_verified && <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />}
              </div>
            )}

            {/* account status */}
            <div className={`flex items-center gap-3 p-3.5 rounded-xl border ${isVerified ? 'bg-emerald-50 border-emerald-200' : isRejected ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 ${isVerified ? 'bg-emerald-500' : isRejected ? 'bg-red-500' : 'bg-amber-400'}`}>
                <Shield className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">التحقق من الهوية</p>
                <p className="text-xs text-gray-600">
                  {isVerified ? 'حسابك موثّق بالكامل' : isRejected ? 'تم رفض المستندات' : 'قيد المراجعة'}
                </p>
              </div>
              {isRejected && (
                <button onClick={() => setShowDocModal(true)} className="text-xs text-red-600 font-semibold hover:underline shrink-0">
                  إعادة رفع
                </button>
              )}
              {isVerified && <BadgeCheck className="w-5 h-5 text-emerald-500 shrink-0" />}
            </div>
          </div>
        </div>

        {/* ═══ Subscription card (if active) ═══ */}
        {hasSub && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-4 sm:p-5 text-white shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-xs mb-1">الاشتراك الحالي</p>
                <h3 className="text-lg font-bold">{u.active_subscription.plan_name_ar}</h3>
                <p className="text-sm text-blue-200 mt-0.5">
                  ينتهي في {u.active_subscription.current_period_end
                    ? new Date(u.active_subscription.current_period_end).toLocaleDateString('ar-EG')
                    : '—'}
                </p>
              </div>
              <button
                onClick={() => navigate('/plans')}
                className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors border border-white/20"
              >
                إدارة
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ═══ MODALS ═══ */}

      {/* Edit Profile */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="تعديل الملف الشخصي" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل *</label>
            <Input value={editForm.full_name} onChange={e => setEditForm(p => ({ ...p, full_name: e.target.value }))} placeholder="الاسم الكامل" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
            <Input type="email" value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} placeholder="example@mail.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">نبذة تعريفية</label>
            <textarea
              value={editForm.bio_ar}
              onChange={e => setEditForm(p => ({ ...p, bio_ar: e.target.value }))}
              placeholder="اكتب نبذة مختصرة عنك..."
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowEditModal(false)} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">إلغاء</button>
            <button
              onClick={handleEdit}
              disabled={editLoading}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {editLoading ? <LoadingSpinner size="sm" /> : null}
              حفظ التغييرات
            </button>
          </div>
        </div>
      </Modal>

      {/* Avatar Upload */}
      <Modal isOpen={showAvatarModal} onClose={() => { setShowAvatarModal(false); setAvatarFile(null); setAvatarPreview(''); }} title="تحديث الصورة الشخصية" size="sm">
        <div className="space-y-4">
          {avatarPreview && (
            <div className="flex justify-center">
              <img src={avatarPreview} alt="preview" className="w-32 h-32 rounded-2xl object-cover border-4 border-blue-100 shadow" />
            </div>
          )}
          <p className="text-sm text-gray-500 text-center">هل تريد تعيين هذه الصورة كصورة ملفك الشخصي؟</p>
          <div className="flex gap-3">
            <button onClick={() => { setShowAvatarModal(false); setAvatarFile(null); setAvatarPreview(''); }} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">إلغاء</button>
            <button
              onClick={handleAvatarUpload}
              disabled={avatarLoading}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {avatarLoading ? <LoadingSpinner size="sm" /> : <Upload className="w-4 h-4" />}
              رفع الصورة
            </button>
          </div>
        </div>
      </Modal>

      {/* Document Re-Upload */}
      <Modal isOpen={showDocModal} onClose={() => { setShowDocModal(false); setDocFront(null); setDocBack(null); }} title="رفع مستندات جديدة" size="md">
        <div className="space-y-5">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm text-blue-700">
            قم بإرفاق صورة واضحة لبطاقة الهوية الوطنية. تأكد أن الصورة غير مشوّهة وأن جميع البيانات مقروءة.
          </div>
          <DropZone label="الوجه الأمامي للبطاقة" required file={docFront} onSelect={setDocFront} />
          <DropZone label="الوجه الخلفي للبطاقة (اختياري)" file={docBack} onSelect={setDocBack} />
          <div className="flex gap-3 pt-1">
            <button onClick={() => { setShowDocModal(false); setDocFront(null); setDocBack(null); }} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">إلغاء</button>
            <button
              onClick={handleDocReupload}
              disabled={!docFront || docLoading}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {docLoading ? <LoadingSpinner size="sm" /> : <RefreshCw className="w-4 h-4" />}
              إرسال طلب المراجعة
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default ProfilePage;
