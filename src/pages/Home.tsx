import React, { useState } from 'react';
import { Search, MapPin, Star, TrendingUp, Users, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useServices } from '../context/ServiceContext';
import { governorates } from '../data/governorates';
import { ServiceCard } from '../components/Services/ServiceCard';
import { ServiceModal } from '../components/Services/ServiceModal';
import { Service } from '../types';

export function Home() {
  const { getApprovedServices } = useServices();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGovernorate, setSelectedGovernorate] = useState('');
  
  const approvedServices = getApprovedServices();
  
  const filteredServices = approvedServices.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGovernorate = !selectedGovernorate || service.governorate === selectedGovernorate;
    return matchesSearch && matchesGovernorate;
  });

  const featuredServices = filteredServices.slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-l from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            منصة الخدمات المصرية الموثوقة
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            ابحث عن أفضل مقدمي الخدمات الموثوقين في جميع أنحاء مصر
          </p>
          
          {/* Search Bar */}
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="ابحث عن الخدمة التي تحتاجها..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                />
              </div>
              
              <div className="md:w-64">
                <select
                  value={selectedGovernorate}
                  onChange={(e) => setSelectedGovernorate(e.target.value)}
                  className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                >
                  <option value="">جميع المحافظات</option>
                  {governorates.map(gov => (
                    <option key={gov.name} value={gov.name}>{gov.name}</option>
                  ))}
                </select>
              </div>
              
              <Link
                to="/services"
                className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-md font-medium transition-colors"
              >
                بحث متقدم
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            لماذا تختار منصتنا؟
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">خدمات موثوقة</h3>
              <p className="text-gray-600">
                جميع مقدمي الخدمات موثوقون ومعتمدون من خلال التحقق من الهوية
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">تغطية شاملة</h3>
              <p className="text-gray-600">
                خدمات في جميع محافظات ومراكز مصر لضمان وصولك لأقرب مقدم خدمة
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">مجتمع متنامي</h3>
              <p className="text-gray-600">
                آلاف مقدمي الخدمات المحترفين والعملاء الراضين في منصة واحدة
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">الخدمات المميزة</h2>
            <Link
              to="/services"
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
            >
              <TrendingUp className="w-4 h-4 ml-1" />
              عرض المزيد
            </Link>
          </div>
          
          {featuredServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredServices.map(service => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onViewDetails={setSelectedService}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">لا توجد خدمات متاحة حالياً</p>
              <p className="text-gray-400 mt-2">تحقق لاحقاً أو قم بتغيير معايير البحث</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-l from-green-600 to-green-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">هل تقدم خدمات؟</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            انضم إلى منصتنا وابدأ في الوصول لآلاف العملاء المحتملين في جميع أنحاء مصر
          </p>
          <Link
            to="/register"
            className="bg-white text-green-700 hover:bg-gray-100 px-8 py-3 rounded-lg font-medium text-lg transition-colors inline-flex items-center"
          >
            <Star className="w-5 h-5 ml-2" />
            سجل الآن مجاناً
          </Link>
        </div>
      </section>

      <ServiceModal
        service={selectedService}
        isOpen={!!selectedService}
        onClose={() => setSelectedService(null)}
      />
    </div>
  );
}