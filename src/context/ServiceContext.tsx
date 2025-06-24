import React, { createContext, useContext, useState, useEffect } from 'react';
import { Service } from '../types';

import  instance  from '../axiosInstance/instance';
interface ServiceContextType {
  services: Service[];
  addService: (service: Omit<Service, 'id' | 'createdAt' | 'user'>) => Promise<void>;
  updateServiceStatus: (serviceId: string, status: 'approved' | 'rejected') => Promise<void>;
  getUserServices: (userId: string) => Service[];
  getApprovedServices: () => Service[];
  deleteService: (serviceId: string) => Promise<void>;
}

const ServiceContext = createContext<ServiceContextType | null>(null);

export function ServiceProvider({ children }: { children: React.ReactNode }) {
  const [services, setServices] = useState<Service[]>([]);

  // Fetch all services on mount
  useEffect(() => {
    const getservice = async () => {
  try {
    const res = await instance.get('/api/services/');
    const services1 = Array.isArray(res.data) ? res.data : [];
    setServices(services1);

   
  } catch (error: any) {
    if (error.response) {
      console.log('Failed to fetch service:', error.response.data);
    } else if (error.request) {
      console.log('No response received:', error.request);
    } else {
      console.log('Error setting up request:', error.message);
    }
    console.error('Full error object:', error);
  }
};

getservice();

     
  }, []);
useEffect(() => {
 
}, [services]);
 const addService = async (serviceData) => {
  try {
    const access = localStorage.getItem('access');

    const formData = new FormData();
    formData.append('title', serviceData.title);
    formData.append('description', serviceData.description);
    formData.append('price', serviceData.price.toString());
    formData.append('governorate', serviceData.governorate);
    formData.append('center', serviceData.center);

    serviceData.images.forEach((file) => {
      formData.append('images', file);
    });

    const res = await instance.post('/api/services/', formData, {
      headers: {
        Authorization: `Bearer ${access}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    setServices(res.data);
  } catch (error) {
    console.error('Failed to add service:', error.response?.data || error.message);
  }
};

  const updateServiceStatus = async (serviceId: string, status: 'Approved' | 'Rejected') => {
    try {
       const access =localStorage.getItem('access')
      const res = await instance.patch(`/api/services/${serviceId}`, { status },
         { headers: {
    'Authorization': `Bearer ${access}`, 
        'Content-Type': 'multipart/form-data',
      }}
      );
      setServices(res.data);
      
    } catch (error) {
      console.error('Failed to update service status:', error);
    }
  };

  const getUserServices = (userId: string) => {
    return services.filter(service => service.userId === userId);
  };

  const getApprovedServices = () => {
   
    return services.filter(service => service.status === 'Approved');
  };

  const deleteService = async (serviceId: string) => {
    try {
      const access =localStorage.getItem('access')
      await instance.delete(`/api/services/${serviceId}`,{ headers: {
    'Authorization': `Bearer ${access}`, 
        'Content-Type': 'multipart/form-data',
      }});
      setServices(prev => prev.filter(service => service.id !== serviceId));
    } catch (error) {
      console.error('Failed to delete service:', error);
    }
  };

  const value: ServiceContextType = {
    services,
    addService,
    updateServiceStatus,
    getUserServices,
    getApprovedServices,
    deleteService,
  };

  return <ServiceContext.Provider value={value}>{children}</ServiceContext.Provider>;
}

export function useServices() {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error('useServices must be used within a ServiceProvider');
  }
  return context;
}
