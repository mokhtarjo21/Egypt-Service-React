import React from 'react';
import { MapPin, Clock, Star, Eye } from 'lucide-react';
import { Service } from '../../types';

interface ServiceCardProps {
  service: Service;
  onViewDetails: (service: Service) => void;
}

export function ServiceCard({ service, onViewDetails }: ServiceCardProps) {
  const baseUrl = "https://web-production-98b70.up.railway.app"
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {service.images.length > 0 && (
        <div className="h-48 bg-gray-200 relative">
          <img
            src={`${baseUrl}/${service.images[0]}` || '/api/placeholder/400/300'}
            alt={service.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://images.pexels.com/photos/4792509/pexels-photo-4792509.jpeg?auto=compress&cs=tinysrgb&w=400';
            }}
          />
          <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-md text-sm">
            {service.price} جنيه
          </div>
        </div>
      )}
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {service.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {service.description}
        </p>
        
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <MapPin className="w-4 h-4 ml-1" />
          <span> {service.governorate} , {service.center}</span>
        </div>
        
        {service.user && (
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-reverse space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-medium">
                  {service.user.fullName.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{service.user.fullName}</p>
                {service.user.isVerified && (
                  <div className="flex items-center">
                    <Star className="w-3 h-3 text-green-500 ml-1" />
                    <span className="text-xs text-green-600">موثق</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="w-3 h-3 ml-1" />
              <span>{new Date(service.createdAt).toLocaleDateString('ar-EG')}</span>
            </div>
          </div>
        )}
        
        <button
          onClick={() => onViewDetails(service)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center"
        >
          <Eye className="w-4 h-4 ml-1" />
          عرض التفاصيل
        </button>
      </div>
    </div>
  );
}