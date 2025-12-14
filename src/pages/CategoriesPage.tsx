import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Grid, ArrowRight, ArrowLeft } from 'lucide-react';

import { RootState, AppDispatch } from '../store/store';
import { fetchCategories } from '../store/slices/servicesSlice';
import { Card } from '../components/ui/Card';
import { useDirection } from '../hooks/useDirection';

const CategoriesPage: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL } = useDirection();
  const dispatch = useDispatch<AppDispatch>();
  const { categories, loading } = useSelector((state: RootState) => state.services);

  React.useEffect(() => {
    dispatch(fetchCategories() as any);
  }, [dispatch]);

  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Grid className="w-16 h-16" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t('categoriesPage.title')}
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              {t('categoriesPage.subtitle')}
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4" />
                  <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((category) => (
                <Link key={category.id} to={`/services?category=${category.slug}`}>
                  <Card hoverable className="group h-full">
                    <div className="flex items-start gap-4">
                      <div
                        className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        <div
                          className="w-8 h-8 rounded-lg"
                          style={{ backgroundColor: category.color }}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                          {isRTL ? category.name_ar : category.name_en}
                        </h3>
                        <p className="text-gray-500 text-sm mb-3">
                          {isRTL ? category.description_ar : category.description_en}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-primary-600 font-medium">
                            {t('categoriesPage.servicesAvailable', { count: category.services_count })}
                          </span>
                          <Arrow className="w-5 h-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {!loading && categories.length === 0 && (
            <div className="text-center py-16">
              <Grid className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {t('categoriesPage.noCategories')}
              </h3>
              <p className="text-gray-500">
                {t('categoriesPage.noCategoriesDescription')}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CategoriesPage;
