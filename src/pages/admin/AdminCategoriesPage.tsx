import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Edit2, Trash2, Plus, Folder, Search, Tag,
  Layers, ChevronRight, X, Check, RefreshCw,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { categoriesService, Category } from '../../services/admin/categoriesService';

/* ── helpers ─────────────────────────────── */
const DEFAULT_COLORS = [
  '#3B82F6','#8B5CF6','#10B981','#F59E0B',
  '#EF4444','#EC4899','#06B6D4','#84CC16',
];

const initials = (name: string) =>
  name ? name.slice(0, 2) : '؟';

/* ── stat mini card ─────────────────────── */
const Stat: React.FC<{ label: string; value: number; icon: React.ReactNode; color: string }> = ({
  label, value, icon, color,
}) => (
  <div className={`${color} rounded-2xl p-4 flex items-center gap-3`}>
    <div className="w-10 h-10 bg-white/60 rounded-xl flex items-center justify-center shrink-0">{icon}</div>
    <div>
      <p className="text-xs text-gray-600">{label}</p>
      <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
    </div>
  </div>
);

/* ════════════════════════════════════════ */
export default function AdminCategoriesPage() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [isModalOpen, setIsModalOpen]       = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState('#3B82F6');

  const { register, handleSubmit, reset, setValue, watch } = useForm<Category>();

  /* ── data ── */
  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const data = await categoriesService.getAllCategories();
      setCategories(data);
    } catch {
      toast.error(t('adminCategories.loadFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadCategories(); }, []);

  /* ── CRUD ── */
  const onSubmit = async (data: Category) => {
    try {
      const payload = { ...data, color: selectedColor };
      if (editingCategory) {
        await categoriesService.updateCategory(editingCategory.slug, payload);
        toast.success(t('adminCategories.updateSuccess'));
      } else {
        await categoriesService.createCategory(payload);
        toast.success(t('adminCategories.createSuccess'));
      }
      closeModal();
      loadCategories();
    } catch {
      toast.error(t('adminCategories.saveError'));
    }
  };

  const handleEdit = (cat: Category) => {
    setEditingCategory(cat);
    setValue('name_ar', cat.name_ar);
    setValue('name_en', cat.name_en);
    setValue('description_ar', cat.description_ar);
    setValue('description_en', cat.description_en);
    setValue('icon', cat.icon);
    setSelectedColor(cat.color || '#3B82F6');
    setIsModalOpen(true);
  };

  const handleDelete = async (slug: string) => {
    if (!window.confirm(t('adminCategories.deleteConfirm'))) return;
    setDeleting(slug);
    try {
      await categoriesService.deleteCategory(slug);
      toast.success(t('adminCategories.deleteSuccess'));
      loadCategories();
    } catch {
      toast.error(t('adminCategories.deleteFailed'));
    } finally {
      setDeleting(null);
    }
  };

  const openAddModal = () => {
    setEditingCategory(null);
    reset();
    setSelectedColor('#3B82F6');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    reset();
    setEditingCategory(null);
  };

  /* ── filtering ── */
  const filtered = categories.filter(c =>
    !search || c.name_ar.includes(search) || c.name_en.toLowerCase().includes(search.toLowerCase())
  );
  const totalServices = categories.reduce((s, c) => s + (c.services_count || 0), 0);

  /* ════════════ RENDER ════════════ */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/20 p-4 sm:p-6" dir="rtl">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t('adminCategories.title')}</h1>
            <p className="text-xs text-gray-500">{categories.length} {t('adminCategories.title')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadCategories}
            className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-500"
            title="تحديث"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{t('adminCategories.addCategory')}</span>
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        <Stat label="إجمالي الفئات"   value={categories.length}  icon={<Layers className="w-5 h-5 text-blue-500" />}   color="bg-blue-50" />
        <Stat label="إجمالي الخدمات"  value={totalServices}       icon={<Tag className="w-5 h-5 text-emerald-500" />}   color="bg-emerald-50" />
        <Stat label="متوسط الخدمات"   value={categories.length ? Math.round(totalServices / categories.length) : 0}
              icon={<Folder className="w-5 h-5 text-purple-500" />} color="bg-purple-50" />
      </div>

      {/* ── Search ── */}
      <div className="relative mb-5">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="بحث عن فئة..."
          className="w-full pr-9 pl-10 py-2.5 border border-gray-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Content ── */}
      {isLoading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <Folder className="w-14 h-14 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">{search ? 'لا توجد نتائج مطابقة' : 'لا توجد فئات بعد'}</p>
          {!search && (
            <button onClick={openAddModal} className="mt-4 text-blue-600 text-sm font-semibold hover:underline flex items-center gap-1 mx-auto">
              <Plus className="w-4 h-4" /> إضافة أول فئة
            </button>
          )}
        </div>
      ) : (
        /* Card grid on mobile, table feel on desktop */
        <>
          {/* Desktop table */}
          <div className="hidden sm:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  {['الفئة', 'بالإنجليزية', 'الخدمات', 'اللون', 'الإجراءات'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(cat => (
                  <tr key={cat.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm"
                          style={{ backgroundColor: cat.color || '#3B82F6' }}
                        >
                          {initials(cat.name_ar)}
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{cat.name_ar}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">{cat.name_en}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                        {cat.services_count || 0} خدمة
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg border border-gray-200 shadow-inner" style={{ backgroundColor: cat.color || '#3B82F6' }} />
                        <span className="text-xs text-gray-400 font-mono">{cat.color || '#3B82F6'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(cat)}
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                          title="تعديل"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.slug)}
                          disabled={deleting === cat.slug}
                          className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                          title="حذف"
                        >
                          {deleting === cat.slug ? <LoadingSpinner size="sm" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card grid */}
          <div className="sm:hidden grid gap-3">
            {filtered.map(cat => (
              <div key={cat.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-base font-bold shrink-0 shadow"
                  style={{ backgroundColor: cat.color || '#3B82F6' }}
                >
                  {initials(cat.name_ar)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{cat.name_ar}</p>
                  <p className="text-xs text-gray-500 truncate">{cat.name_en}</p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 mt-1">
                    {cat.services_count || 0} خدمة
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => handleEdit(cat)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.slug)}
                    disabled={deleting === cat.slug}
                    className="w-8 h-8 flex items-center justify-center rounded-xl text-red-500 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    {deleting === cat.slug ? <LoadingSpinner size="sm" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ══ MODAL ══ */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingCategory ? t('adminCategories.editCategory') : t('adminCategories.addNewCategory')}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('adminCategories.nameAr')} *</label>
              <Input {...register('name_ar', { required: true })} placeholder="اسم الفئة بالعربية" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('adminCategories.nameEn')} *</label>
              <Input {...register('name_en', { required: true })} placeholder="Category name in English" dir="ltr" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('adminCategories.descAr')}</label>
              <Input {...register('description_ar')} placeholder="وصف مختصر..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('adminCategories.descEn')}</label>
              <Input {...register('description_en')} placeholder="Short description..." dir="ltr" />
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">لون الفئة</label>
            <div className="flex flex-wrap items-center gap-2">
              {DEFAULT_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  className={`w-8 h-8 rounded-lg shadow-sm border-2 transition-transform hover:scale-110 ${selectedColor === c ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                >
                  {selectedColor === c && <Check className="w-3.5 h-3.5 text-white mx-auto" />}
                </button>
              ))}
              {/* Custom color */}
              <div className="relative">
                <div className="w-8 h-8 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-gray-400 transition-colors">
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={e => setSelectedColor(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    title="اختر لوناً مخصصاً"
                  />
                  <span className="text-xs text-gray-400 pointer-events-none">+</span>
                </div>
              </div>
              {/* Preview */}
              <div
                className="w-10 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm ml-2"
                style={{ backgroundColor: selectedColor }}
              >
                {watch('name_ar')?.slice(0, 2) || '؟'}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={closeModal}
              className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
              {t('adminCategories.cancel')}
            </button>
            <button type="submit"
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors">
              {editingCategory ? t('adminCategories.saveChanges') : t('adminCategories.create')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
