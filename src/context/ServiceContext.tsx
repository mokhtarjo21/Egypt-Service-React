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
    const services = Array.isArray(res.data) ? res.data : [];
    setServices(services);
    console.log('Fetched services:', services);
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

  const addService = async (serviceData: Omit<Service, 'id' | 'createdAt' | 'user'>) => {
    try {
      console.log('Adding service:', serviceData);
       const access =localStorage.getItem('access')
      const res = await instance.post('/api/services/', serviceData,
        { headers: {
    'Authorization': `Bearer ${access}`, 
        'Content-Type': 'multipart/form-data',
      }}
      );
      setServices(prev => [...prev, res.data]);
    } catch (error) {
      console.log('Failed to add service:', error.response.data);
      console.error('Failed to add service:', error);
    }
  };

  const updateServiceStatus = async (serviceId: string, status: 'approved' | 'rejected') => {
    try {
      const res = await instance.patch(`/api/services/${serviceId}`, { status });
      setServices(prev =>
        prev.map(service => service.id === serviceId ? res.data : service)
      );
    } catch (error) {
      console.error('Failed to update service status:', error);
    }
  };

  const getUserServices = (userId: string) => {
    return services.filter(service => service.userId === userId);
  };

  const getApprovedServices = () => {
    return services.filter(service => service.status === 'approved');
  };

  const deleteService = async (serviceId: string) => {
    try {
      await instance.delete(`/api/services/${serviceId}`);
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
