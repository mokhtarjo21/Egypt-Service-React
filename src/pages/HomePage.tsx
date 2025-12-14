import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Search, Shield, MapPin, Award } from 'lucide-react';

import { RootState, AppDispatch } from '../store/store';
import { fetchCategories, fetchFeaturedServices } from '../store/slices/servicesSlice';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { useDirection } from '../hooks/useDirection';

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL } = useDirection();
  const dispatch = useDispatch<AppDispatch>();
  const { categories, featuredServices } = useSelector((state: RootState) => state.services);

  React.useEffect(() => {
    dispatch(fetchCategories() as any);
    dispatch(fetchFeaturedServices() as any);
  }, [dispatch]);

  const features = [
    {
      icon: Shield,
      titleKey: 'whyChooseUs.verified.title',
      descriptionKey: 'whyChooseUs.verified.description',
      color: 'text-primary-600',
    },
    {
      icon: MapPin,
      titleKey: 'whyChooseUs.coverage.title',
      descriptionKey: 'whyChooseUs.coverage.description',
      color: 'text-secondary-600',
    },
    {
      icon: Award,
      titleKey: 'whyChooseUs.trusted.title',
      descriptionKey: 'whyChooseUs.trusted.description',
      color: 'text-accent-600',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              {t('hero.title')}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto animate-slide-up">
              {t('hero.subtitle')}
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-12 animate-slide-up">
              <div className="flex flex-col sm:flex-row gap-4 bg-white/10 backdrop-blur-sm p-6 rounded-2xl">
                <Input
                  placeholder={t('hero.searchPlaceholder')}
                  className="flex-1 bg-white text-gray-900 border-none"
                />
                <select className="px-4 py-3 rounded-lg bg-white text-gray-900 border-none">
                  <option>{t('hero.allCategories')}</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {isRTL ? category.name_ar : category.name_en}
                    </option>
                  ))}
                </select>
                <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-100">
                  <Search className="w-5 h-5 mr-2" />
                  {t('hero.searchButton')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('categories.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('categories.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category) => (
              <Link key={category.id} to={`/services?category=${category.slug}`}>
                <Card hoverable className="text-center group">
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-200"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <div
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">
                  {isRTL ? category.name_ar : category.name_en}
                </h3>
                <p className="text-gray-500 text-xs">
                  {t('categories.servicesCount', { count: category.services_count })}
                </p>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/services">
              <Button size="lg" variant="outline">
                {t('categories.viewAll')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('featuredServices.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('featuredServices.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredServices.map((service) => (
              <Card key={service.id} hoverable className="overflow-hidden !p-0">
                <div className="aspect-w-16 aspect-h-10">
                  <img
                    src={service.primary_image?.image || 'https://images.pexels.com/photos/8985471/pexels-photo-8985471.jpeg?auto=compress&cs=tinysrgb&w=400'}
                    alt={isRTL ? service.title_ar : service.title_en || service.title_ar}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg text-gray-900 mb-2">
                    {isRTL ? service.title_ar : service.title_en || service.title_ar}
                  </h3>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-primary-600">
                      {service.price} {t('common.currency')}
                    </span>
                    <div className="flex items-center text-yellow-500">
                      <span className="text-sm ml-1">⭐ {service.owner.rating || 4.5}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-gray-500 text-sm">
                    <span>{service.owner.full_name}</span>
                    <span>{service.governorate?.name_ar}</span>
                  </div>
                  <div className="mt-4">
                    <Link to={`/services/${service.slug}`}>
                      <Button className="w-full" size="sm">
                      {t('featuredServices.viewMore')}
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('whyChooseUs.title')}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center">
                  <div className="mb-6">
                    <Icon className={`w-12 h-12 mx-auto ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {t(feature.titleKey)}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {t(feature.descriptionKey)}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;