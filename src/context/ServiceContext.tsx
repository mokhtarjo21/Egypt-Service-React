import React, { createContext, useContext, useState, useEffect } from 'react';
import { Service } from '../types';
import axios from 'axios';

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
    axios.get('/api/services')
      .then(res => setServices(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error('Failed to load services:', err));
  }, []);

  const addService = async (serviceData: Omit<Service, 'id' | 'createdAt' | 'user'>) => {
    try {
      const res = await axios.post('/api/services', serviceData);
      setServices(prev => [...prev, res.data]);
    } catch (error) {
      console.error('Failed to add service:', error);
    }
  };

  const updateServiceStatus = async (serviceId: string, status: 'approved' | 'rejected') => {
    try {
      const res = await axios.patch(`/api/services/${serviceId}`, { status });
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
      await axios.delete(`/api/services/${serviceId}`);
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
