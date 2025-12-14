import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Filter, X, MapPin, Star, Eye } from 'lucide-react';

import { RootState, AppDispatch } from '../store/store';
import { fetchServices, fetchCategories, setFilters } from '../store/slices/servicesSlice';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Badge } from '../components/ui/Badge';
import { useDirection } from '../hooks/useDirection';
import { formatCurrency } from '../utils/dateFormatter';

const ServicesPage: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL } = useDirection();
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const { 
    services, 
    categories, 
    isLoading, 
    pagination, 
    filters 
  } = useSelector((state: RootState) => state.services);

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [localFilters, setLocalFilters] = useState({
    category: searchParams.get('category') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    governorate: searchParams.get('governorate') || '',
    service_type: searchParams.get('service_type') || '',
  });

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const params = {
      search: searchQuery,
      ...localFilters,
      page: parseInt(searchParams.get('page') || '1'),
    };
    
    // Remove empty values
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== '' && value !== 0)
    );
    
    dispatch(setFilters(cleanParams) as any);
    dispatch(fetchServices({ filters: cleanParams, page: cleanParams.page }) as any);
  }, [searchQuery, localFilters, searchParams, dispatch]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    updateURL({ search: query });
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    updateURL(newFilters);
  };

  const updateURL = (params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setLocalFilters({
      category: '',
      min_price: '',
      max_price: '',
      governorate: '',
      service_type: '',
    });
    setSearchQuery('');
    setSearchParams({});
  };

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t('services.title')}
          </h1>
          
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder={t('services.searchPlaceholder')}
                leftIcon={<Search className="w-5 h-5" />}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              leftIcon={<Filter className="w-5 h-5" />}
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden"
            >
              {t('services.filters')}
            </Button>
          </div>

          {/* Active Filters */}
          {Object.values(localFilters).some(v => v) && (
            <div className="flex flex-wrap gap-2 mt-4">
              {Object.entries(localFilters).map(([key, value]) => {
                if (!value) return null;
                return (
                  <span
                    key={key}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                  >
                    {value}
                    <button
                      onClick={() => handleFilterChange(key, '')}
                      className="mr-2 rtl:mr-0 rtl:ml-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                );
              })}
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                {t('services.clearFilters')}
              </Button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Desktop Sidebar Filters */}
          <div className="hidden lg:block lg:col-span-1">
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">
                {t('services.filters')}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('services.category')}
                  </label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={localFilters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    <option value="">جميع الفئات</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.slug}>
                        {isRTL ? category.name_ar : category.name_en}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('services.priceRange')}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="من"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={localFilters.min_price}
                      onChange={(e) => handleFilterChange('min_price', e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="إلى"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={localFilters.max_price}
                      onChange={(e) => handleFilterChange('max_price', e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('services.serviceType')}
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input 
                        type="radio" 
                        name="service_type" 
                        value="online"
                        checked={localFilters.service_type === 'online'}
                        onChange={(e) => handleFilterChange('service_type', e.target.value)}
                        className="mr-2" 
                      />
                      {t('services.online')}
                    </label>
                    <label className="flex items-center">
                      <input 
                        type="radio" 
                        name="service_type" 
                        value="onsite"
                        checked={localFilters.service_type === 'onsite'}
                        onChange={(e) => handleFilterChange('service_type', e.target.value)}
                        className="mr-2" 
                      />
                      {t('services.onSite')}
                    </label>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full" onClick={clearFilters}>
                  {t('services.clearFilters')}
                </Button>
              </div>
            </Card>
          </div>

          {/* Services Grid */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                عرض {((pagination.currentPage - 1) * 20) + 1}-{Math.min(pagination.currentPage * 20, pagination.totalCount)} من {pagination.totalCount} خدمة
              </p>
              <select className="px-3 py-2 border border-gray-300 rounded-md">
                <option value="newest">{t('services.newest')}</option>
                <option value="price_asc">{t('services.priceAsc')}</option>
                <option value="price_desc">{t('services.priceDesc')}</option>
                <option value="popular">{t('services.popular')}</option>
              </select>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : services.length === 0 ? (
              /* Empty State */
              <Card className="text-center py-12">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('services.noResults')}
                </h3>
                <p className="text-gray-500 mb-6">
                  {t('services.noResultsDesc')}
                </p>
                <Button onClick={clearFilters}>
                  {t('services.clearFilters')}
                </Button>
              </Card>
            ) : (
              /* Services Grid */
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {services.map((service) => (
                  <Card key={service.id} hoverable className="overflow-hidden !p-0">
                    <div className="aspect-w-16 aspect-h-10">
                      <img
                        src={service.primary_image?.image || 'https://images.pexels.com/photos/8985471/pexels-photo-8985471.jpeg?auto=compress&cs=tinysrgb&w=400'}
                        alt={isRTL ? service.title_ar : service.title_en || service.title_ar}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                        {isRTL ? service.title_ar : service.title_en || service.title_ar}
                      </h3>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl font-bold text-primary-600">
                          {formatCurrency(service.price, isRTL ? 'ar' : 'en')}
                        </span>
                        <div className="flex items-center text-yellow-500">
                          <Star className="w-4 h-4 fill-current mr-1" />
                          <span className="text-sm">{service.owner.rating || 4.5}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-gray-500 text-sm mb-4">
                        <span>{service.owner.full_name}</span>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span>{service.governorate?.name_ar}</span>
                        </div>
                      </div>
                      <Link to={`/services/${service.slug}`}>
                        <Button className="w-full" size="sm">
                          {t('services.viewDetails')}
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <div className="flex space-x-2 rtl:space-x-reverse">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.currentPage === 1}
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                  >
                    {t('common.previous')}
                  </Button>

                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={pagination.currentPage === page ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={pagination.currentPage === pagination.totalPages}
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                  >
                    {t('common.next')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowMobileFilters(false)} />
          <div className={`fixed top-0 ${isRTL ? 'right-0' : 'left-0'} h-full w-80 bg-white shadow-xl`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('services.filters')}
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setShowMobileFilters(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              {/* Mobile filter content - same as desktop */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('services.category')}
                  </label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={localFilters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    <option value="">جميع الفئات</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.slug}>
                        {isRTL ? category.name_ar : category.name_en}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex gap-4 pt-6">
                  <Button variant="outline" className="flex-1" onClick={clearFilters}>
                    {t('services.clearFilters')}
                  </Button>
                  <Button className="flex-1" onClick={() => setShowMobileFilters(false)}>
                    {t('services.applyFilters')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesPage;