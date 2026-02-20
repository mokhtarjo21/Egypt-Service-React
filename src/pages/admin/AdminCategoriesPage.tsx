import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Edit, Trash, Plus, Folder } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { categoriesService, Category } from '../../services/admin/categoriesService';

export default function AdminCategoriesPage() {
    const { t } = useTranslation();
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const { register, handleSubmit, reset, setValue } = useForm<Category>();

    const loadCategories = async () => {
        try {
            setIsLoading(true);
            const data = await categoriesService.getAllCategories();
            setCategories(data);
        } catch (error) {
            toast.error(t('adminCategories.loadFailed'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const onSubmit = async (data: Category) => {
        try {
            if (editingCategory) {
                await categoriesService.updateCategory(editingCategory.slug, data);
                toast.success(t('adminCategories.updateSuccess'));
            } else {
                await categoriesService.createCategory(data);
                toast.success(t('adminCategories.createSuccess'));
            }
            setIsModalOpen(false);
            reset();
            setEditingCategory(null);
            loadCategories();
        } catch (error) {
            toast.error(t('adminCategories.saveError'));
        }
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setValue('name_ar', category.name_ar);
        setValue('name_en', category.name_en);
        setValue('description_ar', category.description_ar);
        setValue('description_en', category.description_en);
        setValue('icon', category.icon);
        setValue('color', category.color);
        setIsModalOpen(true);
    };

    const handleDelete = async (slug: string) => {
        if (window.confirm(t('adminCategories.deleteConfirm'))) {
            try {
                await categoriesService.deleteCategory(slug);
                toast.success(t('adminCategories.deleteSuccess'));
                loadCategories();
            } catch (error) {
                toast.error(t('adminCategories.deleteFailed'));
            }
        }
    };

    const openAddModal = () => {
        setEditingCategory(null);
        reset();
        setIsModalOpen(true);
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">{t('adminCategories.title')}</h1>
                <Button onClick={openAddModal}>
                    <Plus className="w-4 h-4 ml-2" />
                    {t('adminCategories.addCategory')}
                </Button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {t('adminCategories.nameAr')}
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {t('adminCategories.nameEn')}
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {t('adminCategories.services')}
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {t('adminCategories.actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {categories.map((category) => (
                            <tr key={category.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-white ml-3"
                                            style={{ backgroundColor: category.color || '#3B82F6' }}
                                        >
                                            <Folder className="w-4 h-4" />
                                        </div>
                                        <div className="text-sm font-medium text-gray-900">{category.name_ar}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {category.name_en}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {category.services_count || 0}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex space-x-2 space-x-reverse">
                                        <button
                                            onClick={() => handleEdit(category)}
                                            className="text-indigo-600 hover:text-indigo-900"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(category.slug)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <Trash className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingCategory ? t('adminCategories.editCategory') : t('adminCategories.addNewCategory')}
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        label={t('adminCategories.nameAr')}
                        {...register('name_ar', { required: t('adminCategories.nameArRequired') })}
                    />
                    <Input
                        label={t('adminCategories.nameEn')}
                        {...register('name_en', { required: t('adminCategories.nameEnRequired') })}
                    />
                    <Input
                        label={t('adminCategories.descAr')}
                        {...register('description_ar')}
                    />
                    <Input
                        label={t('adminCategories.descEn')}
                        {...register('description_en')}
                    />
                    <Input
                        label={t('adminCategories.colorHex')}
                        type="color"
                        {...register('color')}
                    />
                    <div className="flex justify-end space-x-2 space-x-reverse mt-6">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                            {t('adminCategories.cancel')}
                        </Button>
                        <Button type="submit">
                            {editingCategory ? t('adminCategories.saveChanges') : t('adminCategories.create')}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
