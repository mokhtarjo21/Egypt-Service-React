import React, { useEffect, useState } from 'react';
import { FileText, CheckCircle, XCircle, Eye } from 'lucide-react';
import { useServices } from '../context/ServiceContext';
import { Service } from '../types';
import instance from '../axiosInstance/instance';

export function PendingService() {
  const servicesPerPage = 10;
  const baseUrl = "https://web-production-98b70.up.railway.app"

  const [services, setServices] = useState<Service[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { updateServiceStatus } = useServices();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const access = localStorage.getItem('access');
        const response = await instance.get(`/api/services/pending/?page=${currentPage}&search=${searchQuery}`, {
          headers: {
            Authorization: `Bearer ${access}`,
          },
        });
        setServices(response.data.results);
        setTotalPages(Math.ceil(response.data.count / servicesPerPage));
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };

    fetchServices();
  }, [currentPage, searchQuery]);

  const handleServiceAction = (serviceId: string, action: 'approved' | 'rejected') => {
    updateServiceStatus(serviceId, action);
  };

  return (
    <>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">الخدمات المعلقة</h3>
        <div className="mb-4">
          <input
            type="text"
            placeholder="ابحث باسم الخدمة أو اسم المستخدم"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-200 text-right"
          />
        </div>
        <div className="space-y-4">
          {services.length > 0 ? (
            services.map(service => (
              <div key={service.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 gap-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{service.title}</h4>
                    <p className="text-gray-600 mt-1">{service.description}</p>
                    <div className="flex flex-wrap items-center mt-2 text-sm text-gray-500 gap-x-2">
                      <span>{service.price} جنيه</span>
                      <span className="hidden md:inline">•</span>
                      <span>{service.center}، {service.governorate}</span>
                      <span className="hidden md:inline">•</span>
                      <span>بواسطة {service.user?.fullName}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleServiceAction(service.id, 'approved')}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm flex items-center"
                    >
                      <CheckCircle className="w-4 h-4 ml-1" />
                      موافقة
                    </button>
                    <button
                      onClick={() => handleServiceAction(service.id, 'rejected')}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm flex items-center"
                    >
                      <XCircle className="w-4 h-4 ml-1" />
                      رفض
                    </button>
                    <button
                      onClick={() => setSelectedService(service)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm flex items-center"
                    >
                      <Eye className="w-4 h-4 ml-1" />
                      عرض
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">لا توجد خدمات معلقة للمراجعة</p>
            </div>
          )}
        </div>

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
      </div>

      {selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">تفاصيل الخدمة</h2>
                <button
                  onClick={() => setSelectedService(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedService.title}</h3>
                  <p className="text-gray-600 mt-2">{selectedService.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">السعر</label>
                    <p className="text-gray-900">{selectedService.price} جنيه</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">الموقع</label>
                    <p className="text-gray-900">{selectedService.center}، {selectedService.governorate}</p>
                  </div>
                </div>

                {selectedService.user && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">مقدم الخدمة</label>
                    <p className="text-gray-900">{selectedService.user.fullName} - {selectedService.user.phoneNumber}</p>
                  </div>
                )}

                {selectedService.images.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">صور الخدمة</label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      {selectedService.images.map((image, index) => (
                        <img
                          key={index}
                          src={`${baseUrl}/${image}`}
                          alt={`صورة ${index + 1}`}
                          className="w-full h-32 object-cover rounded-md"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.pexels.com/photos/4792509/pexels-photo-4792509.jpeg?auto=compress&cs=tinysrgb&w=400';
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-reverse space-x-4 pt-4">
                  <button
                    onClick={() => {
                      handleServiceAction(selectedService.id, 'approved');
                      setSelectedService(null);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center transition-colors"
                  >
                    <CheckCircle className="w-4 h-4 ml-1" />
                    موافقة
                  </button>
                  <button
                    onClick={() => {
                      handleServiceAction(selectedService.id, 'rejected');
                      setSelectedService(null);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center transition-colors"
                  >
                    <XCircle className="w-4 h-4 ml-1" />
                    رفض
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
