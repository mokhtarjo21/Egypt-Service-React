import React, { useEffect, useState } from 'react';
import { Search, Filter, MapPin, DollarSign } from 'lucide-react';
import { useServices } from '../context/ServiceContext';
import { governorates, serviceTypes } from '../data/governorates';
import { ServiceCard } from '../components/Services/ServiceCard';
import { ServiceModal } from '../components/Services/ServiceModal';
import { Service } from '../types';

export function Services() {
  const { getApprovedServices } = useServices();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGovernorate, setSelectedGovernorate] = useState('');
  const [selectedServiceType, setSelectedServiceType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const approvedServices = getApprovedServices();
  console.log('Approved Services:', approvedServices);
  const filteredServices = approvedServices.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGovernorate = !selectedGovernorate || service.governorate === selectedGovernorate;
    const matchesServiceType = !selectedServiceType || service.user?.serviceType === selectedServiceType;
    const matchesMinPrice = !minPrice || service.price >= parseInt(minPrice);
    const matchesMaxPrice = !maxPrice || service.price <= parseInt(maxPrice);
    
    return matchesSearch && matchesGovernorate && matchesServiceType && matchesMinPrice && matchesMaxPrice;
  });
useEffect(() => {
  // Reset filters when services change
}, [approvedServices]);
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedGovernorate('');
    setSelectedServiceType('');
    setMinPrice('');
    setMaxPrice('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">جميع الخدمات</h1>
          <p className="text-gray-600">اكتشف الخدمات المتاحة في جميع أنحاء مصر</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث عن الخدمة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Filter className="w-4 h-4 ml-2" />
              فلترة
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline w-4 h-4 ml-1" />
                    المحافظة
                  </label>
                  <select
                    value={selectedGovernorate}
                    onChange={(e) => setSelectedGovernorate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                  >
                    <option value="">جميع المحافظات</option>
                    {governorates.map(gov => (
                      <option key={gov.name} value={gov.name}>{gov.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نوع الخدمة
                  </label>
                  <select
                    value={selectedServiceType}
                    onChange={(e) => setSelectedServiceType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                  >
                    <option value="">جميع الأنواع</option>
                    {serviceTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="inline w-4 h-4 ml-1" />
                    السعر الأدنى
                  </label>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    السعر الأعلى
                  </label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="999999"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={clearFilters}
                  className="text-gray-600 hover:text-gray-800 text-sm"
                >
                  مسح جميع المرشحات
                </button>
                <span className="text-sm text-gray-600">
                  {filteredServices.length} خدمة متاحة
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Services Grid */}
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map(service => (
              <ServiceCard
                key={service.id}
                service={service}
                onViewDetails={setSelectedService}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد خدمات متاحة</h3>
              <p className="text-gray-500 mb-4">
                لم نجد خدمات تطابق معايير البحث الخاصة بك
              </p>
              <button
                onClick={clearFilters}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
              >
                مسح المرشحات
              </button>
            </div>
          </div>
        )}
      </div>

      <ServiceModal
        service={selectedService}
        isOpen={!!selectedService}
        onClose={() => setSelectedService(null)}
      />
    </div>
  );
}