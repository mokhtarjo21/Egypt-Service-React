import React, { useEffect, useState } from 'react';
import { FileText, CheckCircle, XCircle, Eye } from 'lucide-react';
import instance from '../axiosInstance/instance';
import { Service } from '../types';
import { useServices } from '../context/ServiceContext';
export function PendingService() {
  const baseUrl = "https://web-production-98b70.up.railway.app";
  const servicesPerPage = 10;
    const {  updateServiceStatus } = useServices();
  const [services, setServices] = useState<Service[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const access = localStorage.getItem('access');
      const response = await instance.get(
        `/api/services/pending/?search=${searchQuery}`,
        {
          headers: {
            Authorization: `Bearer ${access}`,
          },
        }
      );
      setServices(response.data.results);
      setTotalPages(Math.ceil(response.data.count / servicesPerPage));
    } catch (error) {
      console.error('Error fetching services:', error);
    }finally {
    setLoading(false); // 🔴 Stop loading
  }
  };

  useEffect(() => {
    fetchServices();
  }, [currentPage, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleServiceAction = async (serviceId: string, action: 'approved' | 'rejected') => {
    try {
     
      await updateServiceStatus(serviceId, action);
      fetchServices(); // Refresh list after action
      setSelectedService(null);
    } catch (error) {
      console.error('Error updating service status:', error);
    }
  };
 const pendingServices = services.filter(s => s.status === 'pending');
  return (
    <>
     <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
   

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">الخدمات المعلقة</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingServices.length}</p>
              </div>
              <FileText className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
      </div>
         
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
        {loading ? (
          <div className="text-center p-8">
            <div className="loader border-4 border-blue-200 border-t-blue-600 rounded-full w-12 h-12 mx-auto animate-spin mb-4"></div>
            <p className="text-gray-600">جاري تحميل الخدمات...</p>
          </div>
        ) :services.map((service) => (
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
                  onClick={() => handleServiceAction(service.id, 'Approved')}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm flex items-center"
                >
                  <CheckCircle className="w-4 h-4 ml-1" />
                  موافقة
                </button>
                <button
                  onClick={() => handleServiceAction(service.id, 'Rejected')}
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
        ))}

        {services.length === 0 && (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">لا توجد خدمات معلقة للمراجعة</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === i + 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Service Details Modal */}
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
                    <p className="text-gray-900">
                      {selectedService.center}، {selectedService.governorate}
                    </p>
                  </div>
                </div>

                {selectedService.user && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">مقدم الخدمة</label>
                    <p className="text-gray-900">
                      {selectedService.user.fullName} - {selectedService.user.phoneNumber}
                    </p>
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
                            e.currentTarget.src =
                              'https://images.pexels.com/photos/4792509/pexels-photo-4792509.jpeg?auto=compress&cs=tinysrgb&w=400';
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-reverse space-x-4 pt-4">
                  <button
                    onClick={() => handleServiceAction(selectedService.id, 'Approved')}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center transition-colors"
                  >
                    <CheckCircle className="w-4 h-4 ml-1" />
                    موافقة
                  </button>
                  <button
                    onClick={() => handleServiceAction(selectedService.id, 'Rrejected')}
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
    </div>
    </>
  );
}
