import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Edit, Trash, Plus, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { locationsService, Governorate, City } from '../../services/admin/locationsService';

export default function AdminLocationsPage() {
    const { t } = useTranslation();
    const [governorates, setGovernorates] = useState<Governorate[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [selectedGovernorate, setSelectedGovernorate] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Modal states
    const [isGovModalOpen, setIsGovModalOpen] = useState(false);
    const [isCityModalOpen, setIsCityModalOpen] = useState(false);
    const [editingGov, setEditingGov] = useState<Governorate | null>(null);
    const [editingCity, setEditingCity] = useState<City | null>(null);

    const { register: registerGov, handleSubmit: handleSubmitGov, reset: resetGov, setValue: setValueGov } = useForm<Governorate>();
    const { register: registerCity, handleSubmit: handleSubmitCity, reset: resetCity, setValue: setValueCity } = useForm<City>();

    const loadGovernorates = async () => {
        try {
            setIsLoading(true);
            const data = await locationsService.getAllGovernorates();
            setGovernorates(data);
        } catch (error) {
            toast.error(t('adminLocations.govLoadFailed'));
        } finally {
            setIsLoading(false);
        }
    };

    const loadCities = async (govId: number) => {
        try {
            const data = await locationsService.getCities(govId);
            setCities(data);
        } catch (error) {
            toast.error(t('adminLocations.cityLoadFailed'));
        }
    };

    useEffect(() => {
        loadGovernorates();
    }, []);

    useEffect(() => {
        if (selectedGovernorate) {
            loadCities(selectedGovernorate);
        } else {
            setCities([]);
        }
    }, [selectedGovernorate]);

    // Governorate Actions
    const onGovSubmit = async (data: Governorate) => {
        try {
            if (editingGov) {
                await locationsService.updateGovernorate(editingGov.id, data);
                toast.success(t('adminLocations.govUpdated'));
            } else {
                await locationsService.createGovernorate(data);
                toast.success(t('adminLocations.govAdded'));
            }
            setIsGovModalOpen(false);
            resetGov();
            setEditingGov(null);
            loadGovernorates();
        } catch (error) {
            toast.error(t('adminLocations.govSaveError'));
        }
    };

    const handleDeleteGov = async (id: number) => {
        if (window.confirm(t('adminLocations.govDeleteConfirm'))) {
            try {
                await locationsService.deleteGovernorate(id);
                toast.success(t('adminLocations.govDeleted'));
                loadGovernorates();
                if (selectedGovernorate === id) setSelectedGovernorate(null);
            } catch (error) {
                toast.error(t('adminLocations.govDeleteFailed'));
            }
        }
    };

    // City Actions
    const onCitySubmit = async (data: City) => {
        if (!selectedGovernorate) return;
        try {
            const payload = { ...data, province: selectedGovernorate };
            if (editingCity) {
                await locationsService.updateCity(editingCity.id, payload);
                toast.success(t('adminLocations.cityUpdated'));
            } else {
                await locationsService.createCity(payload);
                toast.success(t('adminLocations.cityAdded'));
            }
            setIsCityModalOpen(false);
            resetCity();
            setEditingCity(null);
            loadCities(selectedGovernorate);
        } catch (error) {
            toast.error(t('adminLocations.citySaveError'));
        }
    };

    const handleDeleteCity = async (id: number) => {
        if (window.confirm(t('adminLocations.cityDeleteConfirm'))) {
            try {
                await locationsService.deleteCity(id);
                toast.success(t('adminLocations.cityDeleted'));
                if (selectedGovernorate) loadCities(selectedGovernorate);
            } catch (error) {
                toast.error(t('adminLocations.cityDeleteFailed'));
            }
        }
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">{t('adminLocations.title')}</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Governorates Column */}
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold flex items-center">
                            <MapPin className="w-5 h-5 ml-2 text-blue-500" />
                            {t('adminLocations.governorates')}
                        </h2>
                        <Button size="sm" onClick={() => { setEditingGov(null); resetGov(); setIsGovModalOpen(true); }}>
                            <Plus className="w-4 h-4 ml-1" /> {t('adminLocations.add')}
                        </Button>
                    </div>
                    <div className="space-y-2 max-h-[600px] overflow-y-auto">
                        {governorates.map((gov) => (
                            <div
                                key={gov.id}
                                onClick={() => setSelectedGovernorate(gov.id)}
                                className={`p-3 rounded-md border cursor-pointer transition-colors flex justify-between items-center ${selectedGovernorate === gov.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                                    }`}
                            >
                                <div>
                                    <div className="font-medium">{gov.name_ar}</div>
                                    <div className="text-xs text-gray-500">{gov.name_en}</div>
                                </div>
                                <div className="flex space-x-1 space-x-reverse">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setEditingGov(gov); setValueGov('name_ar', gov.name_ar); setValueGov('name_en', gov.name_en); setValueGov('code', gov.code); setIsGovModalOpen(true); }}
                                        className="p-1 text-gray-500 hover:text-blue-600"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteGov(gov.id); }}
                                        className="p-1 text-gray-500 hover:text-red-600"
                                    >
                                        <Trash className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cities Column */}
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">
                            {t('adminLocations.citiesCenters')}
                            {selectedGovernorate && <span className="text-sm font-normal mr-2 text-gray-500">
                                ( {governorates.find(g => g.id === selectedGovernorate)?.name_ar} )
                            </span>}
                        </h2>
                        <Button
                            size="sm"
                            disabled={!selectedGovernorate}
                            onClick={() => { setEditingCity(null); resetCity(); setIsCityModalOpen(true); }}
                        >
                            <Plus className="w-4 h-4 ml-1" /> {t('adminLocations.add')}
                        </Button>
                    </div>

                    {!selectedGovernorate ? (
                        <div className="text-center py-10 text-gray-400">
                            {t('adminLocations.selectGovToViewCities')}
                        </div>
                    ) : cities.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                            {t('adminLocations.noCitiesRegistered')}
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-[600px] overflow-y-auto">
                            {cities.map((city) => (
                                <div key={city.id} className="p-3 rounded-md border flex justify-between items-center hover:bg-gray-50">
                                    <div>
                                        <div className="font-medium">{city.name_ar}</div>
                                        <div className="text-xs text-gray-500">{city.name_en}</div>
                                    </div>
                                    <div className="flex space-x-1 space-x-reverse">
                                        <button
                                            onClick={() => { setEditingCity(city); setValueCity('name_ar', city.name_ar); setValueCity('name_en', city.name_en); setIsCityModalOpen(true); }}
                                            className="p-1 text-gray-500 hover:text-blue-600"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCity(city.id)}
                                            className="p-1 text-gray-500 hover:text-red-600"
                                        >
                                            <Trash className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Governorate Modal */}
            <Modal
                isOpen={isGovModalOpen}
                onClose={() => setIsGovModalOpen(false)}
                title={editingGov ? t('adminLocations.editGov') : t('adminLocations.addGov')}
            >
                <form onSubmit={handleSubmitGov(onGovSubmit)} className="space-y-4">
                    <Input label={t('adminLocations.nameAr')} {...registerGov('name_ar', { required: true })} />
                    <Input label={t('adminLocations.nameEn')} {...registerGov('name_en', { required: true })} />
                    <Input label={t('adminLocations.code')} {...registerGov('code', { required: true })} />
                    <div className="flex justify-end pt-4">
                        <Button type="submit">{editingGov ? t('adminLocations.save') : t('adminLocations.add')}</Button>
                    </div>
                </form>
            </Modal>

            {/* City Modal */}
            <Modal
                isOpen={isCityModalOpen}
                onClose={() => setIsCityModalOpen(false)}
                title={editingCity ? t('adminLocations.editCity') : t('adminLocations.addCity')}
            >
                <form onSubmit={handleSubmitCity(onCitySubmit)} className="space-y-4">
                    <Input label={t('adminLocations.nameAr')} {...registerCity('name_ar', { required: true })} />
                    <Input label={t('adminLocations.nameEn')} {...registerCity('name_en', { required: true })} />
                    <div className="flex justify-end pt-4">
                        <Button type="submit">{editingCity ? t('adminLocations.save') : t('adminLocations.add')}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
