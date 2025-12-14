import React from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Users, Target, Heart, Award, Globe } from 'lucide-react';

import { Card } from '../components/ui/Card';

const AboutPage: React.FC = () => {
  const { t } = useTranslation();

  const values = [
    {
      icon: Shield,
      titleKey: 'aboutPage.values.trust.title',
      descriptionKey: 'aboutPage.values.trust.description',
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
    },
    {
      icon: Users,
      titleKey: 'aboutPage.values.community.title',
      descriptionKey: 'aboutPage.values.community.description',
      color: 'text-secondary-600',
      bgColor: 'bg-secondary-100',
    },
    {
      icon: Target,
      titleKey: 'aboutPage.values.quality.title',
      descriptionKey: 'aboutPage.values.quality.description',
      color: 'text-accent-600',
      bgColor: 'bg-accent-100',
    },
    {
      icon: Heart,
      titleKey: 'aboutPage.values.care.title',
      descriptionKey: 'aboutPage.values.care.description',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  const stats = [
    { value: '10K+', labelKey: 'aboutPage.stats.providers' },
    { value: '50K+', labelKey: 'aboutPage.stats.customers' },
    { value: '27', labelKey: 'aboutPage.stats.governorates' },
    { value: '100+', labelKey: 'aboutPage.stats.categories' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {t('aboutPage.hero.title')}
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              {t('aboutPage.hero.subtitle')}
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">
                  {t(stat.labelKey)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {t('aboutPage.mission.title')}
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                {t('aboutPage.mission.description')}
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {t('aboutPage.mission.vision')}
                  </h4>
                  <p className="text-gray-500 text-sm">
                    {t('aboutPage.mission.visionDescription')}
                  </p>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Team collaboration"
                className="rounded-2xl shadow-xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center gap-3">
                  <Award className="w-10 h-10 text-yellow-500" />
                  <div>
                    <p className="font-bold text-gray-900">{t('aboutPage.mission.trusted')}</p>
                    <p className="text-sm text-gray-500">{t('aboutPage.mission.trustedDescription')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('aboutPage.values.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('aboutPage.values.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="text-center">
                  <div className={`w-16 h-16 rounded-full ${value.bgColor} flex items-center justify-center mx-auto mb-4`}>
                    <Icon className={`w-8 h-8 ${value.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {t(value.titleKey)}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {t(value.descriptionKey)}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-primary-600 to-secondary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t('aboutPage.cta.title')}
          </h2>
          <p className="text-xl text-white/90 mb-8">
            {t('aboutPage.cta.description')}
          </p>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
