import React from 'react';
import { X, MapPin, Phone, Star, Clock, DollarSign } from 'lucide-react';
import { Service } from '../../types';

interface ServiceModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ServiceModal({ service, isOpen, onClose }: ServiceModalProps) {
  if (!isOpen || !service) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">{service.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Service Images */}
          {service.images.length > 0 && (
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {service.images.map((image, index) => (
                  <img
                    key={index}
                    src={image || 'https://images.pexels.com/photos/4792509/pexels-photo-4792509.jpeg?auto=compress&cs=tinysrgb&w=600'}
                    alt={`${service.title} ${index + 1}`}
                    className="w-full h-48 object-cover rounded-md"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.pexels.com/photos/4792509/pexels-photo-4792509.jpeg?auto=compress&cs=tinysrgb&w=600';
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center mb-4">
            <DollarSign className="w-5 h-5 text-green-600 ml-2" />
            <span className="text-2xl font-bold text-green-600">{service.price} جنيه</span>
          </div>

          {/* Location */}
          <div className="flex items-center mb-4">
            <MapPin className="w-5 h-5 text-gray-500 ml-2" />
            <span className="text-gray-700">{service.center}، {service.governorate}</span>
          </div>

          {/* Date */}
          <div className="flex items-center mb-6">
            <Clock className="w-5 h-5 text-gray-500 ml-2" />
            <span className="text-gray-700">
              تم النشر في {new Date(service.createdAt).toLocaleDateString('ar-EG')}
            </span>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">وصف الخدمة</h3>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {service.description}
            </p>
          </div>

          {/* Service Provider Info */}
          {service.user && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات مقدم الخدمة</h3>
              
              <div className="flex items-start space-x-reverse space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-xl font-bold">
                    {service.user.fullName.charAt(0)}
                  </span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h4 className="text-lg font-medium text-gray-900">{service.user.fullName}</h4>
                    {service.user.isVerified && (
                      <div className="flex items-center mr-2">
                        <Star className="w-4 h-4 text-green-500 ml-1" />
                        <span className="text-sm text-green-600 font-medium">موثق</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    نوع الخدمة: {service.user.serviceType}
                  </p>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    المناطق المخدومة: {service.user.governorates.join('، ')}
                  </p>
                  
                  {service.user.bio && (
                    <p className="text-gray-700 text-sm mb-4">
                      {service.user.bio}
                    </p>
                  )}
                  
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-gray-500 ml-2" />
                    <a 
                      href={`tel:${service.user.phoneNumber}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {service.user.phoneNumber}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}