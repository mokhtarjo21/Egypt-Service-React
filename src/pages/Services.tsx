import React, { useEffect, useState } from 'react';
import { Search, Filter, MapPin, DollarSign } from 'lucide-react';
import instance from '../axiosInstance/instance';
import { governorates, serviceTypes } from '../data/governorates';
import { ServiceCard } from '../components/Services/ServiceCard';
import { ServiceModal } from '../components/Services/ServiceModal';
import { Service } from '../types';

export function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGovernorate, setSelectedGovernorate] = useState('');
  const [selectedServiceType, setSelectedServiceType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchServices = async () => {
    try {
       setIsLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedGovernorate) params.append('governorate', selectedGovernorate);
      if (selectedServiceType) params.append('user__serviceType', selectedServiceType);
      if (minPrice) params.append('min_price', minPrice);
      if (maxPrice) params.append('max_price', maxPrice);
      params.append('page', currentPage.toString());

      const response = await instance.get(`/api/services/approved/?${params.toString()}`);
      setServices(response.data.results);
     
      setTotalPages(Math.ceil(response.data.count / 10)); // 9 per page
    } catch (err) {
      console.error('Error fetching services:', err);
    }finally {
      setIsLoading(false); // ✅ إنهاء التحميل
    }
  };

  useEffect(() => {
    fetchServices();
  }, [searchTerm, selectedGovernorate, selectedServiceType, minPrice, maxPrice, currentPage]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedGovernorate('');
    setSelectedServiceType('');
    setMinPrice('');
    setMaxPrice('');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">جميع الخدمات</h1>

        {/* Search & Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث عن الخدمة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-md text-right"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-3 bg-blue-600 text-white rounded-md"
            >
              <Filter className="w-4 h-4 ml-2" /> فلترة
            </button>
          </div>

          {showFilters && (
            <div className="border-t border-gray-200 pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* المحافظة */}
              <select value={selectedGovernorate} onChange={(e) => setSelectedGovernorate(e.target.value)}
                className="border border-gray-300 p-2 rounded text-right">
                <option value="">جميع المحافظات</option>
                {governorates.map(gov => (
                  <option key={gov.name} value={gov.name}>{gov.name}</option>
                ))}
              </select>

              {/* نوع الخدمة */}
              <select value={selectedServiceType} onChange={(e) => setSelectedServiceType(e.target.value)}
                className="border border-gray-300 p-2 rounded text-right">
                <option value="">جميع الأنواع</option>
                {serviceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              {/* السعر الأدنى */}
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="السعر الأدنى"
                className="border border-gray-300 p-2 rounded text-right"
              />

              {/* السعر الأعلى */}
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="السعر الأعلى"
                className="border border-gray-300 p-2 rounded text-right"
              />
              <div className="col-span-full flex justify-between items-center mt-4">
  <button
    onClick={clearFilters}
     className="flex items-center px-4 py-3 bg-blue-600 text-white rounded-md"
  >
    مسح الفلاتر
  </button>
</div>

            </div>
          )}
        </div>

          {/* لودينج */}
        {isLoading ? (
          <div className="text-center p-8">
            <div className="loader border-4 border-blue-200 border-t-blue-600 rounded-full w-12 h-12 mx-auto animate-spin mb-4"></div>
            <p className="text-gray-600">جاري تحميل الخدمات...</p>
          </div>
        ) : services.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map(service => (
                <ServiceCard key={service.id} service={service} onViewDetails={setSelectedService} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center mt-6 space-x-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 rounded ${
                      currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center p-8 bg-white rounded shadow">لا توجد خدمات تطابق البحث</div>
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
